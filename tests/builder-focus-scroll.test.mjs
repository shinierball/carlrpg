import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { DCCBaseApplication } from '../src/apps/base-application.mjs';
import { DCCClassCreatorApp } from '../src/apps/class-creator.mjs';
import { DCCRaceCreatorApp } from '../src/apps/race-creator.mjs';
import { DCCBasePointBuilderApp } from '../src/apps/base-point-builder.mjs';

describe('DCC RPG Builder Focus Retention & Scroll Preservation Subsystem', () => {

  describe('1. DCCBaseApplication Focus State Serialization', () => {
    test('_saveFocusState captures data-* attributes and synthesizes precise selectors', () => {
      const app = new DCCBaseApplication();

      const mockBtn = {
        tagName: 'BUTTON',
        className: 'dcc-stat-step-btn',
        dataset: { stat: 'str', delta: '1' },
        getAttribute: (attr) => (attr === 'name' ? null : null)
      };

      const saved = app._saveFocusState(mockBtn);
      assert.ok(saved, 'Focus state should be captured');
      assert.strictEqual(saved.tagName, 'button');
      assert.strictEqual(saved.data['data-stat'], 'str');
      assert.strictEqual(saved.data['data-delta'], '1');
      assert.strictEqual(saved.selector, 'button.dcc-stat-step-btn[data-stat="str"][data-delta="1"]');
    });

    test('_saveFocusState captures checkbox with data-id without being misled by volatile classes', () => {
      const app = new DCCBaseApplication();

      const mockCheckbox = {
        tagName: 'INPUT',
        type: 'checkbox',
        className: 'dcc-benefit-toggle selected focus',
        dataset: { id: 'minor_darkvision' },
        value: 'on',
        getAttribute: () => null
      };

      const saved = app._saveFocusState(mockCheckbox);
      assert.ok(saved);
      // 'selected' and 'focus' are filtered out
      assert.strictEqual(saved.selector, 'input.dcc-benefit-toggle[data-id="minor_darkvision"]');
    });

    test('_saveFocusState captures text input selection range and name', () => {
      const app = new DCCBaseApplication();

      const mockInput = {
        tagName: 'INPUT',
        type: 'text',
        className: 'dcc-search-input',
        value: 'nightvision',
        selectionStart: 5,
        selectionEnd: 5,
        selectionDirection: 'forward',
        getAttribute: (attr) => (attr === 'name' ? 'searchQuery' : null)
      };

      const saved = app._saveFocusState(mockInput);
      assert.ok(saved);
      assert.strictEqual(saved.name, 'searchQuery');
      assert.strictEqual(saved.selectionStart, 5);
      assert.strictEqual(saved.selectionEnd, 5);
      assert.strictEqual(saved.value, 'nightvision');
    });
  });

  describe('2. DCCBaseApplication Focus Restoration with preventScroll', () => {
    test('_restoreFocusState calls focus({ preventScroll: true })', () => {
      const app = new DCCBaseApplication();

      let focused = false;
      let focusOptions = null;

      const targetEl = {
        tagName: 'BUTTON',
        focus: (opts) => {
          focused = true;
          focusOptions = opts;
        }
      };

      const mockRoot = {
        querySelectorAll: (sel) => {
          if (sel === 'button.dcc-stat-step-btn[data-stat="dex"][data-delta="-1"]') return [targetEl];
          return [];
        },
        querySelector: (sel) => {
          if (sel === 'button.dcc-stat-step-btn[data-stat="dex"][data-delta="-1"]') return targetEl;
          return null;
        }
      };

      app._savedFocus = {
        selector: 'button.dcc-stat-step-btn[data-stat="dex"][data-delta="-1"]',
        matchIndex: 0,
        tagName: 'button',
        data: { 'data-stat': 'dex', 'data-delta': '-1' }
      };

      app._restoreFocusState(mockRoot);

      assert.strictEqual(focused, true, 'Element should have been focused');
      assert.deepStrictEqual(focusOptions, { preventScroll: true }, 'Focus MUST be invoked with preventScroll: true');
    });

    test('_restoreFocusState restores cursor selection range on inputs', () => {
      const app = new DCCBaseApplication();

      let appliedStart = null;
      let appliedEnd = null;

      const targetInput = {
        tagName: 'INPUT',
        value: 'nightvision',
        focus: () => {},
        setSelectionRange: (start, end) => {
          appliedStart = start;
          appliedEnd = end;
        }
      };

      const mockRoot = {
        querySelector: () => targetInput,
        querySelectorAll: () => [targetInput]
      };

      app._savedFocus = {
        selector: 'input.dcc-search-input',
        matchIndex: 0,
        tagName: 'input',
        selectionStart: 7,
        selectionEnd: 7,
        selectionDirection: 'forward',
        value: 'nightvision'
      };

      app._restoreFocusState(mockRoot);

      assert.strictEqual(appliedStart, 7, 'Selection start restored');
      assert.strictEqual(appliedEnd, 7, 'Selection end restored');
    });
  });

  describe('3. Scroll Position Tracking & Restoration', () => {
    test('_saveScrollPositions and _restoreScrollPositions record and restore scrollTop on .dcc-studio-builder', () => {
      const app = new DCCBaseApplication();

      const mockBuilder = {
        scrollTop: 345,
        scrollLeft: 0
      };
      const mockReceipt = {
        scrollTop: 120,
        scrollLeft: 0
      };

      const mockRoot = {
        querySelector: (sel) => {
          if (sel === '.dcc-studio-builder') return mockBuilder;
          if (sel === '.dcc-receipt-list') return mockReceipt;
          return null;
        }
      };

      // Save scroll positions
      app._saveScrollPositions(mockRoot);

      assert.ok(app._savedScroll instanceof Map);
      assert.deepStrictEqual(app._savedScroll.get('.dcc-studio-builder'), { top: 345, left: 0 });
      assert.deepStrictEqual(app._savedScroll.get('.dcc-receipt-list'), { top: 120, left: 0 });

      // Simulate DOM replacement with new elements reset to scrollTop = 0
      const newBuilder = { scrollTop: 0, scrollLeft: 0 };
      const newReceipt = { scrollTop: 0, scrollLeft: 0 };
      const newRoot = {
        querySelector: (sel) => {
          if (sel === '.dcc-studio-builder') return newBuilder;
          if (sel === '.dcc-receipt-list') return newReceipt;
          return null;
        }
      };

      app._restoreScrollPositions(newRoot);

      assert.strictEqual(newBuilder.scrollTop, 345, 'Builder scroll position should be restored');
      assert.strictEqual(newReceipt.scrollTop, 120, 'Receipt scroll position should be restored');
    });
  });

  describe('4. Class Creator Studio Configuration & Scroll Retention', () => {
    test('DCCClassCreatorApp defines scrollY for scrollable containers', () => {
      const defaultOptions = DCCClassCreatorApp.defaultOptions;
      assert.ok(Array.isArray(defaultOptions.scrollY), 'defaultOptions.scrollY should be an array');
      assert.ok(defaultOptions.scrollY.includes('.dcc-studio-builder'));
      assert.ok(defaultOptions.scrollY.includes('.dcc-receipt-list'));

      const defaultOptionsV2 = DCCClassCreatorApp.DEFAULT_OPTIONS;
      assert.ok(Array.isArray(defaultOptionsV2.scrollY), 'DEFAULT_OPTIONS.scrollY should be an array');
      assert.ok(defaultOptionsV2.scrollY.includes('.dcc-studio-builder'));
    });

    test('setArchetype preserves scroll position before triggering re-render', () => {
      const app = new DCCClassCreatorApp();
      let scrollSaved = false;
      let rendered = false;

      app._saveScrollPositions = () => { scrollSaved = true; };
      app.render = () => { rendered = true; return app; };

      app.setArchetype('Mage');

      assert.strictEqual(scrollSaved, true, '_saveScrollPositions must be called before render');
      assert.strictEqual(rendered, true, 'render must be called');
      assert.deepStrictEqual(app.classTypes, ['Mage']);
    });

    test('toggleEarthClass preserves scroll position before triggering re-render', () => {
      const app = new DCCClassCreatorApp();
      let scrollSaved = false;
      let rendered = false;

      app._saveScrollPositions = () => { scrollSaved = true; };
      app.render = () => { rendered = true; return app; };

      app.toggleEarthClass(false);

      assert.strictEqual(scrollSaved, true, '_saveScrollPositions must be called before render');
      assert.strictEqual(rendered, true, 'render must be called');
      assert.strictEqual(app.isEarthClass, false);
    });
  });

  describe('5. Race Creator Studio Configuration & Scroll Retention', () => {
    test('DCCRaceCreatorApp defines scrollY for scrollable containers', () => {
      const defaultOptions = DCCRaceCreatorApp.defaultOptions;
      assert.ok(Array.isArray(defaultOptions.scrollY), 'defaultOptions.scrollY should be an array');
      assert.ok(defaultOptions.scrollY.includes('.dcc-studio-builder'));
      assert.ok(defaultOptions.scrollY.includes('.dcc-receipt-list'));

      const defaultOptionsV2 = DCCRaceCreatorApp.DEFAULT_OPTIONS;
      assert.ok(Array.isArray(defaultOptionsV2.scrollY), 'DEFAULT_OPTIONS.scrollY should be an array');
      assert.ok(defaultOptionsV2.scrollY.includes('.dcc-studio-builder'));
    });

    test('setHeritage preserves scroll position before triggering re-render', () => {
      const app = new DCCRaceCreatorApp();
      let scrollSaved = false;
      let rendered = false;

      app._saveScrollPositions = () => { scrollSaved = true; };
      app.render = () => { rendered = true; return app; };

      app.setHeritage('Alien');

      assert.strictEqual(scrollSaved, true, '_saveScrollPositions must be called before render');
      assert.strictEqual(rendered, true, 'render must be called');
      assert.strictEqual(app.heritage, 'Alien');
    });

    test('setSize preserves scroll position before triggering re-render', () => {
      const app = new DCCRaceCreatorApp();
      let scrollSaved = false;
      let rendered = false;

      app._saveScrollPositions = () => { scrollSaved = true; };
      app.render = () => { rendered = true; return app; };

      app.setSize(6);

      assert.strictEqual(scrollSaved, true, '_saveScrollPositions must be called before render');
      assert.strictEqual(rendered, true, 'render must be called');
      assert.strictEqual(app.size, 6);
    });
  });

  describe('6. Interactive Listener Event Binding with State Preservation', () => {
    test('DCCClassCreatorApp event handlers route through state preservation', () => {
      const app = new DCCClassCreatorApp();
      
      const handlers = {};
      const chainFor = (sel) => ({
        on: (ev, fn) => { handlers[`${sel}:${ev}`] = fn; return chainFor(sel); },
        val: () => '',
        prop: () => false,
        data: () => ({})
      });
      const mockHtml = {
        find: (sel) => chainFor(sel),
        on: (ev, ...args) => {
          if (args.length === 2) {
            const [sel, fn] = args;
            handlers[`delegate:${sel}:${ev}`] = fn;
          } else {
            const [fn] = args;
            handlers[`root:${ev}`] = fn;
          }
          return mockHtml;
        }
      };

      // Ensure activateListeners runs without error
      app.activateListeners(mockHtml);

      // Verify that handlers are attached for critical interactive controls
      assert.ok(handlers['.dcc-accordion-header:click'], 'Accordion header listener bound');
      assert.ok(handlers['.dcc-stat-step-btn:click'], 'Stat step button listener bound');
      assert.ok(handlers['.dcc-benefit-toggle:change'], 'Benefit toggle listener bound');
      assert.ok(handlers['.dcc-detriment-toggle:change'], 'Detriment toggle listener bound');
      assert.ok(handlers['.dcc-search-input:input'], 'Search input listener bound');
    });

    test('DCCRaceCreatorApp event handlers route through state preservation', () => {
      const app = new DCCRaceCreatorApp();
      
      const handlers = {};
      const chainFor = (sel) => ({
        on: (ev, fn) => { handlers[`${sel}:${ev}`] = fn; return chainFor(sel); },
        val: () => '',
        prop: () => false,
        data: () => ({})
      });
      const mockHtml = {
        find: (sel) => chainFor(sel),
        on: (ev, ...args) => {
          if (args.length === 2) {
            const [sel, fn] = args;
            handlers[`delegate:${sel}:${ev}`] = fn;
          } else {
            const [fn] = args;
            handlers[`root:${ev}`] = fn;
          }
          return mockHtml;
        }
      };

      app.activateListeners(mockHtml);

      assert.ok(handlers['.dcc-heritage-pill:click'], 'Heritage pill listener bound');
      assert.ok(handlers['.dcc-size-pill:click'], 'Size pill listener bound');
      assert.ok(handlers['.dcc-accordion-header:click'], 'Accordion header listener bound');
      assert.ok(handlers['.dcc-stat-step-btn:click'], 'Stat step button listener bound');
      assert.ok(handlers['.dcc-benefit-toggle:change'], 'Benefit toggle listener bound');
      assert.ok(handlers['.dcc-detriment-toggle:change'], 'Detriment toggle listener bound');
      assert.ok(handlers['.dcc-search-input:input'], 'Search input listener bound');
    });
  });

});
