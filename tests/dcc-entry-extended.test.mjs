import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import '../src/dcc.mjs';
import { setupInitialHotbar } from '../src/dcc.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';

test('DCC System Entry (src/dcc.mjs) Extended Coverage', async (t) => {

  await t.test('1. Global window.carl helpers and reloadSheets', async () => {
    await Hooks.callAll('init');
    assert.ok(window.carl, 'window.carl should be defined');
    assert.equal(typeof window.carl.openSkillManager, 'function');
    assert.equal(typeof window.carl.openCombatMetrics, 'function');
    assert.equal(typeof window.carl.openCombatArchive, 'function');
    assert.equal(typeof window.carl.openSessionManager, 'function');
    assert.equal(typeof window.carl.openCrawlerCreator, 'function');
    assert.equal(typeof window.carl.reloadSheets, 'function');

    const sm = window.carl.openSkillManager();
    assert.ok(sm);
    const cm = window.carl.openCombatMetrics();
    assert.ok(cm);
    const ca = window.carl.openCombatArchive();
    assert.ok(ca);
    const se = window.carl.openSessionManager();
    assert.ok(se);
    const cc = window.carl.openCrawlerCreator();
    assert.ok(cc);

    // Call reloadSheets
    window.carl.reloadSheets();
  });

  await t.test('2. hotReload hook handler', async () => {
    await Hooks.callAll('hotReload', { extension: 'hbs', path: 'systems/carl-rpg/templates/actors/crawler-sheet.hbs' });
    await Hooks.callAll('hotReload', { extension: 'js', path: 'systems/carl-rpg/src/dcc.mjs' });
  });

  await t.test('3. setupInitialHotbar functionality', async () => {
    const user = {
      hotbar: {},
      flags: { 'carl-rpg': {} },
      getFlag: (scope, key) => user.flags?.[scope]?.[key],
      setFlag: async (scope, key, val) => { user.flags[scope] = user.flags[scope] || {}; user.flags[scope][key] = val; },
      assignHotbarMacro: async (macro, slot) => { user.hotbar[slot] = macro.id; }
    };

    globalThis.game.macros = [
      { id: 'm-creator', name: 'Character Creator', flags: { 'carl-rpg': { macroKey: 'crawler-creator' } } },
      { id: 'm-metrics', name: 'Combat Metrics', flags: { 'carl-rpg': { macroKey: 'combat-metrics' } } },
      { id: 'm-session', name: 'Party Progression and Session Hub', flags: { 'carl-rpg': { macroKey: 'session-manager' } } }
    ];

    await setupInitialHotbar(user, { force: true });
    assert.equal(user.hotbar[1], 'm-creator');
    assert.equal(user.hotbar[2], 'm-metrics');
    assert.equal(user.hotbar[3], 'm-session');
    assert.equal(user.getFlag('carl-rpg', 'initialHotbarConfigured'), true);

    // Calling again without force should return early
    await setupInitialHotbar(user, { force: false });
  });

  await t.test('4. Sidebar and directory button injection hooks', async () => {
    // 4.1 renderItemDirectory
    const itemClickHandlers = {};
    const mockItemHtml = {
      length: 1,
      find: (sel) => {
        if (sel === '.dcc-open-skill-manager-btn') return { length: 0 };
        return {
          length: 1,
          after: (btn) => {},
          before: (btn) => {}
        };
      }
    };
    await Hooks.callAll('renderItemDirectory', {}, mockItemHtml);

    // 4.2 renderActorDirectory
    const mockActorHtml = {
      length: 1,
      find: (sel) => {
        if (sel === '.dcc-create-crawler-btn-sidebar' || sel === '.dcc-open-session-manager-btn') {
          return { length: 0 };
        }
        return {
          length: 1,
          after: () => {},
          before: () => {},
          prepend: () => {}
        };
      }
    };
    await Hooks.callAll('renderActorDirectory', {}, mockActorHtml);

    // 4.3 renderSidebarTab
    await Hooks.callAll('renderSidebarTab', { tabName: 'actors' }, mockActorHtml);
    await Hooks.callAll('renderSidebarTab', { tabName: 'items' }, mockItemHtml);

    // 4.4 getApplicationHeaderButtons
    const buttons = [];
    await Hooks.callAll('getApplicationHeaderButtons', { id: 'actors' }, buttons);
    assert.ok(buttons.some(b => b.label === 'New Crawler'));
  });

  await t.test('5. renderCombatTracker hook: initiative removal and action docks', async () => {
    const crawler = new DCCActor({
      id: 'crawler-1',
      name: 'Carl',
      type: 'crawler'
    });

    const combat = new DCCCombat({
      id: 'dcc-enc',
      round: 1,
      combatants: [
        { id: 'c-1', actorId: 'crawler-1', name: 'Carl', actor: crawler }
      ]
    });

    let removed = [];
    let clickMap = {};
    const chain = (sel) => {
      const obj = {
        remove: () => { removed.push(sel); return obj; },
        length: sel === '.dcc-combat-awards-btn' || sel === '.dcc-combat-awards-header-btn' ? 0 : 1,
        after: () => obj,
        before: () => obj,
        prepend: () => obj,
        append: () => obj,
        empty: () => obj,
        show: () => obj,
        first: () => obj,
        find: (s) => chain(s),
        click: (fn) => { clickMap[sel] = fn; return obj; },
        on: (ev, fn) => { clickMap[sel + ':' + ev] = fn; return obj; },
        off: () => obj,
        each: (fn) => {
          // Simulate combatant row
          fn(0, {
            data: () => 'c-1',
            attr: () => 'c-1'
          });
          return obj;
        },
        data: () => 'c-1',
        attr: () => 'c-1',
        hasClass: () => false
      };
      return obj;
    };

    const mockHtml = {
      find: (sel) => chain(sel)
    };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockHtml) return mockHtml;
      return chain(el);
    };

    await Hooks.callAll('renderCombatTracker', { viewed: combat, render: () => {} }, mockHtml, {});

    assert.ok(removed.length > 0);

    // Test dock button click & contextmenu
    if (clickMap['.dcc-action-dock-btn:click']) {
      await clickMap['.dcc-action-dock-btn:click']({
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: {}
      });
    }

    if (clickMap['.dcc-action-dock-btn:contextmenu']) {
      await clickMap['.dcc-action-dock-btn:contextmenu']({
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: {}
      });
    }

    // Test dock pip click
    if (clickMap['.dcc-action-dock-pip:click']) {
      await clickMap['.dcc-action-dock-pip:click']({
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: {}
      });
    }

    globalThis.$ = orig$;
  });

  await t.test('6. ready hook execution and world migrations', async () => {
    globalThis.game.user.isGM = true;
    const actor = new DCCActor({
      id: 'carl-world',
      name: 'Carl World',
      type: 'crawler',
      prototypeToken: { actorLink: false }
    });
    globalThis.game.actors = [actor];
    globalThis.game.actors.get = (id) => globalThis.game.actors.find(a => a.id === id);

    globalThis.game.scenes = [
      {
        name: 'Dungeon Level 1',
        tokens: [
          { id: 'tok-1', name: 'Carl Token', actorId: 'carl-world', actorLink: false }
        ],
        updateEmbeddedDocuments: async (type, updates) => {}
      }
    ];

    // Trigger ready hook
    await Hooks.callAll('ready');

    assert.equal(globalThis.game.actors[0].prototypeToken.actorLink, true);
  });
});
