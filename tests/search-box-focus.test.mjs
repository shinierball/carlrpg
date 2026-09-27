import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCBaseApplication } from '../src/apps/base-application.mjs';
import { DCCSkillManager } from '../src/apps/skill-manager.mjs';
import { DCCSpellManager } from '../src/apps/spell-manager.mjs';
import { DCCBuffDebuffManager } from '../src/apps/buff-manager.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { MockActor } from './setup.mjs';

function createMockHtml(mockInput, selectorMatch) {
  const handlers = {};
  const chain = {
    on: (ev, fn) => { handlers[`on:${ev}`] = fn; return chain; },
    click: (fn) => { handlers['click'] = fn; return chain; },
    change: (fn) => { handlers['change'] = fn; return chain; },
    val: () => (mockInput ? mockInput.value : ''),
    data: () => ({}),
    each: () => chain,
    show: () => chain,
    hide: () => chain
  };

  const mockHtml = {
    handlers,
    find: (sel) => {
      const elChain = {
        on: (ev, fn) => { handlers[`${sel}:${ev}`] = fn; return elChain; },
        click: (fn) => { handlers[sel] = fn; return elChain; },
        change: (fn) => { handlers[`${sel}:change`] = fn; return elChain; },
        val: () => (mockInput ? mockInput.value : ''),
        data: () => ({}),
        each: () => elChain,
        show: () => elChain,
        hide: () => elChain
      };
      return elChain;
    },
    querySelector: (sel) => {
      if (mockInput && sel && sel.includes(selectorMatch)) return mockInput;
      return null;
    }
  };
  return mockHtml;
}

describe('Search Boxes & Inputs Focus Retention Subsystem', () => {

  describe('1. DCCBaseApplication Focus Preservation Mechanism', () => {
    test('_saveFocusState captures selector, cursor position, and value', () => {
      const app = new DCCBaseApplication();

      const mockInput = {
        id: 'test-search-box',
        className: 'dcc-test-search field-input',
        tagName: 'INPUT',
        value: 'Fireball',
        selectionStart: 4,
        selectionEnd: 4,
        selectionDirection: 'forward',
        getAttribute: (attr) => (attr === 'name' ? 'searchField' : null)
      };

      const saved = app._saveFocusState(mockInput);
      assert.ok(saved, 'Saved focus state should be created');
      assert.strictEqual(saved.selector, '#test-search-box');
      assert.strictEqual(saved.selectionStart, 4);
      assert.strictEqual(saved.selectionEnd, 4);
      assert.strictEqual(saved.selectionDirection, 'forward');
      assert.strictEqual(saved.value, 'Fireball');
    });

    test('_saveFocusState uses class selector when id is absent', () => {
      const app = new DCCBaseApplication();

      const mockInput = {
        id: '',
        className: 'dcc-sm-search custom-input',
        tagName: 'INPUT',
        value: 'Sneak',
        selectionStart: 5,
        selectionEnd: 5,
        getAttribute: () => null
      };

      const saved = app._saveFocusState(mockInput);
      assert.ok(saved);
      assert.strictEqual(saved.selector, 'input.dcc-sm-search.custom-input');
      assert.strictEqual(saved.selectionStart, 5);
    });

    test('_restoreFocusState calls focus and setSelectionRange on matching element', () => {
      const app = new DCCBaseApplication();

      let focused = false;
      let rangeStart = null;
      let rangeEnd = null;

      const newDomElement = {
        value: 'Fireball',
        focus: () => { focused = true; },
        setSelectionRange: (start, end) => {
          rangeStart = start;
          rangeEnd = end;
        }
      };

      const mockRoot = {
        querySelector: (sel) => {
          if (sel === '#test-search-box') return newDomElement;
          return null;
        }
      };

      app._savedFocus = {
        selector: '#test-search-box',
        selectionStart: 4,
        selectionEnd: 4,
        selectionDirection: 'none',
        value: 'Fireball'
      };

      app._restoreFocusState(mockRoot);

      assert.strictEqual(focused, true, 'Target element must receive focus');
      assert.strictEqual(rangeStart, 4, 'Cursor start position must be restored');
      assert.strictEqual(rangeEnd, 4, 'Cursor end position must be restored');
    });

    test('re-rendering preserves focus and cursor without throwing when elements are re-created', async () => {
      const app = new DCCBaseApplication();

      let focused = false;
      let cursor = null;

      const mockInput = {
        className: 'dcc-sm-search',
        tagName: 'INPUT',
        value: 'Climb',
        selectionStart: 5,
        selectionEnd: 5,
        focus: () => { focused = true; },
        setSelectionRange: (s) => { cursor = s; },
        getAttribute: () => null
      };

      const mockRoot = {
        querySelector: (sel) => (sel.includes('dcc-sm-search') ? mockInput : null)
      };

      app.element = [mockRoot];
      app._saveFocusState(mockInput);

      await app.render(false);

      assert.strictEqual(focused, true, 'Element should be focused after render');
      assert.strictEqual(cursor, 5, 'Cursor position should match saved selection');
    });
  });

  describe('2. DCCSkillManager Search Box Focus Retention', () => {
    test('typing updates rawSearchQuery, searchQuery, and preserves input focus', async () => {
      const manager = new DCCSkillManager();

      let focused = false;
      let selection = null;

      const mockInput = {
        className: 'dcc-sm-search',
        tagName: 'INPUT',
        value: 'Sneak Attack',
        selectionStart: 12,
        selectionEnd: 12,
        focus: () => { focused = true; },
        setSelectionRange: (s) => { selection = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'dcc-sm-search');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      assert.ok(mockHtml.handlers['.dcc-sm-search:input'], 'Input handler should be registered');

      // Simulate typing
      await mockHtml.handlers['.dcc-sm-search:input']({ currentTarget: mockInput });

      assert.strictEqual(manager.rawSearchQuery, 'Sneak Attack', 'Raw search query should preserve spaces and case');
      assert.strictEqual(manager.searchQuery, 'sneak attack', 'Search query should be lowercased and trimmed for filtering');

      const data = await manager.getData();
      assert.strictEqual(data.searchQuery, 'Sneak Attack', 'getData should supply raw search query with spaces to template');

      assert.strictEqual(focused, true, 'Search box must retain focus after render');
      assert.strictEqual(selection, 12, 'Cursor position must remain at index 12');
    });

    test('clearing search query resets text and refocuses search input at position 0', async () => {
      const manager = new DCCSkillManager();
      manager.rawSearchQuery = 'OldQuery';
      manager.searchQuery = 'oldquery';

      let focused = false;
      let cursor = null;

      const mockInput = {
        className: 'dcc-sm-search',
        tagName: 'INPUT',
        value: '',
        selectionStart: 0,
        selectionEnd: 0,
        focus: () => { focused = true; },
        setSelectionRange: (s) => { cursor = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'dcc-sm-search');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      // Trigger clear
      await mockHtml.handlers['.dcc-sm-search-clear']({ preventDefault: () => {} });

      assert.strictEqual(manager.searchQuery, '', 'Search query should be empty');
      assert.strictEqual(manager.rawSearchQuery, '', 'Raw search query should be empty');
      assert.strictEqual(focused, true, 'Search input should be refocused');
      assert.strictEqual(cursor, 0, 'Cursor should be at position 0');
    });
  });

  describe('3. DCCSpellManager Search Box Focus Retention', () => {
    test('typing in spell search input retains focus and cursor', async () => {
      const manager = new DCCSpellManager();

      let focused = false;
      let selection = null;

      const mockInput = {
        className: 'spell-search-input',
        tagName: 'INPUT',
        value: 'Fire Bolt ',
        selectionStart: 10,
        selectionEnd: 10,
        focus: () => { focused = true; },
        setSelectionRange: (s) => { selection = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'spell-search-input');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      // Trigger input event
      await mockHtml.handlers['.spell-search-input:input']({ currentTarget: mockInput });

      assert.strictEqual(manager.rawSearchQuery, 'Fire Bolt ', 'Preserves spaces for user typing');
      assert.strictEqual(manager.searchQuery, 'fire bolt', 'Trimmed lowercased for spell filtering');

      const data = await manager.getData();
      assert.strictEqual(data.searchQuery, 'Fire Bolt ', 'Template gets raw query with trailing spaces');

      assert.strictEqual(focused, true, 'Spell search input must retain focus');
      assert.strictEqual(selection, 10, 'Cursor must stay at end of space');
    });

    test('clearing spell search refocuses input at start', async () => {
      const manager = new DCCSpellManager();
      manager.searchQuery = 'Fireball';

      let focused = false;
      let cursor = null;
      const mockInput = {
        className: 'spell-search-input',
        tagName: 'INPUT',
        value: '',
        focus: () => { focused = true; },
        setSelectionRange: (s) => { cursor = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'spell-search-input');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      await mockHtml.handlers['.spell-search-clear']({ preventDefault: () => {} });
      assert.strictEqual(manager.searchQuery, '');
      assert.strictEqual(focused, true, 'Input should be refocused');
      assert.strictEqual(cursor, 0, 'Cursor should be at position 0');
    });
  });

  describe('4. DCCBuffDebuffManager Search Box Focus Retention', () => {
    test('typing in condition search input retains focus and cursor', async () => {
      const manager = new DCCBuffDebuffManager();

      let focused = false;
      let selection = null;

      const mockInput = {
        className: 'condition-search-input',
        tagName: 'INPUT',
        value: 'Poisoned ',
        selectionStart: 9,
        selectionEnd: 9,
        focus: () => { focused = true; },
        setSelectionRange: (s) => { selection = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'condition-search-input');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      await mockHtml.handlers['.condition-search-input:input']({ currentTarget: mockInput });

      assert.strictEqual(manager.rawSearchQuery, 'Poisoned ');
      assert.strictEqual(manager.searchQuery, 'poisoned');

      const data = await manager.getData();
      assert.strictEqual(data.searchQuery, 'Poisoned ');

      assert.strictEqual(focused, true, 'Condition search input must retain focus');
      assert.strictEqual(selection, 9, 'Cursor must remain at index 9');
    });

    test('clearing condition search refocuses input at start', async () => {
      const manager = new DCCBuffDebuffManager();
      manager.searchQuery = 'Burned';

      let focused = false;
      let cursor = null;
      const mockInput = {
        className: 'condition-search-input',
        tagName: 'INPUT',
        value: '',
        focus: () => { focused = true; },
        setSelectionRange: (s) => { cursor = s; },
        getAttribute: () => null
      };

      const mockHtml = createMockHtml(mockInput, 'condition-search-input');
      manager.element = [mockHtml];
      manager.activateListeners(mockHtml);

      await mockHtml.handlers['.condition-search-clear']({ preventDefault: () => {} });
      assert.strictEqual(manager.searchQuery, '');
      assert.strictEqual(focused, true, 'Condition input should be refocused');
      assert.strictEqual(cursor, 0, 'Cursor should be at position 0');
    });
  });

  describe('5. DCCCrawlerSheet Focus Preservation', () => {
    test('crawler sheet defines _saveFocusState and _restoreFocusState for inputs', () => {
      const actor = new MockActor({ name: 'Crawler Donut', type: 'crawler' });
      const sheet = new DCCCrawlerSheet(actor);

      assert.strictEqual(typeof sheet._saveFocusState, 'function', 'Sheet must have _saveFocusState');
      assert.strictEqual(typeof sheet._restoreFocusState, 'function', 'Sheet must have _restoreFocusState');

      const mockInput = {
        id: 'crawler-notes-search',
        tagName: 'INPUT',
        value: 'achievement',
        selectionStart: 3,
        selectionEnd: 3,
        getAttribute: () => null
      };

      const saved = sheet._saveFocusState(mockInput);
      assert.ok(saved);
      assert.strictEqual(saved.selector, '#crawler-notes-search');
      assert.strictEqual(saved.selectionStart, 3);
    });

    test('mid-string typing restores cursor accurately at insertion point', () => {
      const app = new DCCBaseApplication();

      let restoredIndex = null;
      const mockInput = {
        className: 'dcc-sm-search',
        tagName: 'INPUT',
        value: 'Firxeball',
        selectionStart: 4,
        selectionEnd: 4,
        focus: () => {},
        setSelectionRange: (s) => { restoredIndex = s; },
        getAttribute: () => null
      };

      const mockRoot = {
        querySelector: () => mockInput
      };

      app.element = [mockRoot];
      app._saveFocusState(mockInput);
      app._restoreFocusState(mockRoot);

      assert.strictEqual(restoredIndex, 4, 'Cursor position in the middle of a string must be restored precisely');
    });
  });

  describe('6. Search Bar Font Color & Contrast against White Background', () => {
    test('dcc.css defines high-contrast font colors (#111111 / #000000) for search inputs with white backgrounds', async () => {
      const fs = await import('node:fs');
      const cssContent = fs.readFileSync('styles/dcc.css', 'utf8');

      // Skill Manager Search Bar
      assert.ok(cssContent.includes('.dcc-sm-search {'), 'dcc.css must define .dcc-sm-search');
      assert.ok(cssContent.includes('background: #ffffff;'), 'Must have white background');
      assert.ok(cssContent.includes('color: #111111;'), 'Must define dark color #111111 for high contrast on white background');
      assert.ok(cssContent.includes('.dcc-sm-search::placeholder'), 'Must define placeholder styles');
      assert.ok(cssContent.includes('color: #555555;'), 'Must define high-contrast placeholder color #555555');

      // Spell & Condition Manager Search Inputs
      assert.ok(cssContent.includes('.spell-search-input,'), 'Must define .spell-search-input');
      assert.ok(cssContent.includes('.condition-search-input {'), 'Must define .condition-search-input');
      assert.ok(cssContent.includes('.spell-search-input::placeholder,'), 'Must define spell search placeholder');

      // Picker Search Bar
      assert.ok(cssContent.includes('.dcc-picker-search {'), 'Must define .dcc-picker-search');
      assert.ok(cssContent.includes('.dcc-picker-search::placeholder'), 'Must define picker search placeholder');
    });

    test('Templates configure high-contrast search styling and accessible clear buttons', async () => {
      const fs = await import('node:fs');
      const smHbs = fs.readFileSync('templates/apps/skill-manager.hbs', 'utf8');
      const spellHbs = fs.readFileSync('templates/apps/spell-manager.hbs', 'utf8');
      const buffHbs = fs.readFileSync('templates/apps/buff-manager.hbs', 'utf8');

      assert.ok(smHbs.includes('class="dcc-sm-search"'), 'Skill manager must have dcc-sm-search input');
      assert.ok(smHbs.includes('dcc-sm-search-clear'), 'Skill manager must have clear button');

      assert.ok(spellHbs.includes('spell-search-input'), 'Spell manager must have spell-search-input');
      assert.ok(spellHbs.includes('background: #ffffff; color: #111111;'), 'Spell manager search must declare high-contrast white background and dark font');

      assert.ok(buffHbs.includes('condition-search-input'), 'Buff manager must have condition-search-input');
      assert.ok(buffHbs.includes('background: #ffffff; color: #111111;'), 'Buff manager search must declare high-contrast white background and dark font');
    });
  });
});

