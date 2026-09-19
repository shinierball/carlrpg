import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCCombatArchiveApp } from '../src/apps/combat-archive.mjs';
import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCExperienceTracker } from '../src/apps/xp-tracker.mjs';

test('DCCCombatArchiveApp & DCCCombatTracker Extended Coverage', async (t) => {
  await t.test('1. DCCCombatArchiveApp getData handles live combats, search filter, and experience view', async () => {
    const crawler = new DCCActor({
      id: 'carl-act',
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { hp: { value: 30, max: 40 } }
      }
    });

    const mob = new DCCActor({
      id: 'goblin-act',
      name: 'Goblin Boss',
      type: 'npc',
      system: {
        attributes: { hp: { value: 10, max: 20 } }
      }
    });

    globalThis.game.actors = new Map([
      ['carl-act', crawler],
      ['goblin-act', mob]
    ]);

    const liveCombat = new DCCCombat({
      id: 'live-enc-1',
      round: 2,
      isSurpriseRound: false,
      combatants: [
        { id: 'cb-1', actorId: 'carl-act', name: 'Carl', actor: crawler },
        { id: 'cb-2', actorId: 'goblin-act', name: 'Goblin Boss', actor: mob }
      ]
    });

    globalThis.game.combats = [liveCombat];

    // Save an archive record directly
    await DCCCombat.saveArchivedCombat({
      id: 'archived-skirmish-1',
      name: 'Dungeon Level 1 Skirmish',
      timestamp: Date.now() - 1000,
      totalRounds: 3,
      roundHistory: {
        1: { events: [], actions: {} },
        2: { events: [], actions: {} }
      },
      combatants: [
        { id: 'cb-1', name: 'Carl', isMob: false },
        { id: 'cb-2', name: 'Goblin', isMob: true }
      ],
      metrics: { totalDamageDealt: 50, events: [] }
    });

    const app = new DCCCombatArchiveApp();
    const data = await app.getData();

    assert.ok(data.combats.length > 0, 'Combats list populated');
    assert.ok(data.selectedCombat, 'Selected combat enriched');
    assert.ok(data.roundsList.length > 0, 'Rounds list generated');

    // Test Search filter
    app.searchQuery = 'Skirmish';
    const searchData = await app.getData();
    assert.equal(searchData.combats.some(c => c.name.includes('Skirmish')), true);

    // Test Experience View
    app.activeView = 'experience';
    app.customXPPool = 500;
    const expData = await app.getData();
    assert.equal(expData.activeView, 'experience');
    assert.equal(expData.customXPPool, 500);
    assert.ok(expData.xpSummary);
  });

  await t.test('2. DCCCombatArchiveApp listeners handle round navigation, weights, and XP actions', async () => {
    const app = new DCCCombatArchiveApp();
    await app.getData();

    const clickHandlers = {};
    const changeHandlers = {};
    const mockElement = {
      find: (sel) => ({
        click: (fn) => { clickHandlers[sel] = fn; },
        change: (fn) => { changeHandlers[sel] = fn; },
        on: () => {}
      })
    };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockElement) return mockElement;
      return {
        data: (k) => {
          if (k === 'combatId') return app.selectedCombatId;
          if (k === 'round') return 2;
          if (k === 'view') return 'experience';
          if (k === 'weightKey' || k === 'weight-key') return 'killWeight';
          return null;
        },
        val: () => '10'
      };
    };

    app.activateListeners(mockElement);

    // Test tab view button
    clickHandlers['.dcc-archive-tab-btn']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(app.activeView, 'experience');

    // Test weight input change
    changeHandlers['.dcc-xp-weight-input']({ target: { value: '15' }, currentTarget: {} });
    assert.equal(app.customXPWeights.killWeight, 15);

    // Test XP pool input change
    changeHandlers['.dcc-xp-pool-input']({ target: { value: '300' } });
    assert.equal(app.customXPPool, 300);

    // Test reset weights
    clickHandlers['.dcc-xp-reset-weights-btn']({ preventDefault: () => {} });
    assert.equal(app.customXPWeights, null);
    assert.equal(app.customXPPool, null);

    // Test award and undo experience
    await clickHandlers['.dcc-archive-award-xp-btn']({ preventDefault: () => {} });
    await clickHandlers['.dcc-archive-undo-xp-btn']({ preventDefault: () => {} });

    // Test delete single archive
    await clickHandlers['.dcc-archive-delete-btn']({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: {}
    });

    // Test clear all archives
    await clickHandlers['.dcc-archive-clear-all-btn']({ preventDefault: () => {} });
    assert.equal(app.selectedCombatId, null);

    globalThis.$ = orig$;
  });

  await t.test('3. DCCCombatTracker getData handles crawler vs mob phases, health thresholds, and actions', async () => {
    const crawler = new DCCActor({
      id: 'carl-tracker',
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { hp: { value: 35, max: 40 } } // 87.5% -> green threshold
      }
    });

    const mobInjured = new DCCActor({
      id: 'mob-injured',
      name: 'Injured Rat',
      type: 'npc',
      system: {
        attributes: { hp: { value: 10, max: 20 } } // 50% -> yellow threshold
      }
    });

    const mobCritical = new DCCActor({
      id: 'mob-critical',
      name: 'Dying Rat',
      type: 'npc',
      system: {
        attributes: { hp: { value: 2, max: 20 } } // 10% -> red threshold
      }
    });

    const combat = new DCCCombat({
      id: 'tracker-enc',
      round: 1,
      flags: { 'carl-rpg': { isSurpriseRound: false } },
      combatants: [
        { id: 'c-1', actorId: 'carl-tracker', name: 'Carl', actor: crawler },
        { id: 'm-1', actorId: 'mob-injured', name: 'Injured Rat', actor: mobInjured },
        { id: 'm-2', actorId: 'mob-critical', name: 'Dying Rat', actor: mobCritical }
      ]
    });

    const tracker = new DCCCombatTracker();
    tracker.viewed = combat;

    const data = await tracker.getData();

    assert.equal(data.isCarlCombat, true);
    assert.equal(data.phases.length, 2);
    assert.equal(data.mobCount, 2);
    assert.equal(data.crawlerCount, 1);

    // Verify health thresholds
    const mobPhase = data.phases.find(p => p.id === 'mobs');
    const crawlerPhase = data.phases.find(p => p.id === 'crawlers');

    const carlTurn = crawlerPhase.turns[0];
    assert.equal(carlTurn.healthThreshold.status, 'green');

    const yellowTurn = mobPhase.turns.find(m => m.name === 'Injured Rat');
    assert.equal(yellowTurn.healthThreshold.status, 'yellow');

    const redTurn = mobPhase.turns.find(m => m.name === 'Dying Rat');
    assert.equal(redTurn.healthThreshold.status, 'red');

    // Test Surprise Round phase order
    await combat.setFlag('carl-rpg', 'isSurpriseRound', true);
    const surpriseData = await tracker.getData();
    assert.equal(surpriseData.isSurpriseRound, true);
    assert.equal(surpriseData.phases[0].id, 'crawlers');
    assert.equal(surpriseData.phases[0].name, 'Crawler Surprise Phase');
  });

  await t.test('4. DCCCombatTracker listeners handle surprise toggle, action pips, and round buttons', async () => {
    const combat = new DCCCombat({
      id: 'interactive-combat',
      round: 2,
      flags: { 'carl-rpg': { isSurpriseRound: false } },
      combatants: [
        { id: 'c1', name: 'Carl', actor: new DCCActor({ name: 'Carl', type: 'crawler' }) }
      ]
    });

    const tracker = new DCCCombatTracker();
    tracker.viewed = combat;

    const clickHandlers = {};
    const createChainable = (sel) => {
      const obj = {
        click: (fn) => { clickHandlers[sel] = fn; return obj; },
        change: () => obj,
        on: () => obj,
        hide: () => obj,
        show: () => obj,
        toggle: () => obj,
        not: () => obj,
        data: () => obj
      };
      return obj;
    };
    const mockElement = {
      find: (sel) => createChainable(sel)
    };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockElement) return mockElement;
      return {
        data: (k) => {
          if (k === 'combatantId' || k === 'combatant-id') return 'c1';
          if (k === 'actionIndex' || k === 'action-index' || k === 'slotIndex' || k === 'slot-index') return 0;
          return null;
        },
        hasClass: (cls) => false,
        closest: () => ({
          data: () => 'c1',
          find: () => createChainable('')
        })
      };
    };

    tracker.activateListeners(mockElement);

    // Surprise round toggle (as GM)
    globalThis.game.user.isGM = true;
    await clickHandlers['.dcc-surprise-toggle']({ preventDefault: () => {}, stopPropagation: () => {} });
    assert.equal(combat.isSurpriseRound, true);

    // Round navigation
    tracker.viewedRound = 2;
    clickHandlers['.dcc-step-round-btn.prev-round']({ preventDefault: () => {}, stopPropagation: () => {} });
    assert.equal(tracker.viewedRound, 1);

    clickHandlers['.dcc-step-round-btn.next-round']({ preventDefault: () => {}, stopPropagation: () => {} });
    assert.equal(tracker.viewedRound, 2);

    clickHandlers['.dcc-return-live-btn']({ preventDefault: () => {}, stopPropagation: () => {} });
    assert.equal(tracker.viewedRound, 2);

    // Reset round actions
    await clickHandlers['.dcc-reset-round-actions-btn']({ preventDefault: () => {}, stopPropagation: () => {} });

    // Action pip toggle click
    await clickHandlers['.dcc-action-pip']({ preventDefault: () => {}, stopPropagation: () => {}, currentTarget: {} });

    globalThis.$ = orig$;
  });
});
