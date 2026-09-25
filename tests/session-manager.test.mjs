import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import {
  evaluateRollOutcome,
  extractD20Result,
  DCCSessionEngine,
  DCCSessionManagerApp,
  DCC_ROLL_OUTCOMES,
  DCC_OUTCOME_CONFIG
} from '../src/apps/session-manager.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';

test('DCC RPG Party Progression & Session Manager Subsystem', async (t) => {

  await t.test('1. 7-Tier Roll Outcome Evaluation', () => {
    // 1. Critical Failure: Natural 1 (regardless of total or DC)
    assert.equal(evaluateRollOutcome({ total: 25, d20Result: 1, targetDC: 15 }), DCC_ROLL_OUTCOMES.CRITICAL_FAILURE);
    assert.equal(evaluateRollOutcome({ total: 5, d20Result: 1, targetDC: 10 }), DCC_ROLL_OUTCOMES.CRITICAL_FAILURE);

    // 2. Critical Success: Natural 20 (regardless of total or DC)
    assert.equal(evaluateRollOutcome({ total: 10, d20Result: 20, targetDC: 25 }), DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);
    assert.equal(evaluateRollOutcome({ total: 30, d20Result: 20, targetDC: 15 }), DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);

    // 3. Pending DC: targetDC missing or null
    assert.equal(evaluateRollOutcome({ total: 15, d20Result: 12, targetDC: null }), DCC_ROLL_OUTCOMES.PENDING);
    assert.equal(evaluateRollOutcome({ total: 15, d20Result: 12, targetDC: '' }), DCC_ROLL_OUTCOMES.PENDING);

    // 4. Target DC = 20 test cases:
    const DC = 20;

    // Major Failure: miss by 10+ (total <= 10)
    assert.equal(evaluateRollOutcome({ total: 10, d20Result: 6, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_FAILURE);
    assert.equal(evaluateRollOutcome({ total: 5, d20Result: 3, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_FAILURE);
    assert.equal(evaluateRollOutcome({ total: -2, d20Result: 2, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_FAILURE);

    // Failure: miss by 4-9 (total between 11 and 16 inclusive)
    assert.equal(evaluateRollOutcome({ total: 11, d20Result: 8, targetDC: DC }), DCC_ROLL_OUTCOMES.FAILURE);
    assert.equal(evaluateRollOutcome({ total: 14, d20Result: 10, targetDC: DC }), DCC_ROLL_OUTCOMES.FAILURE);
    assert.equal(evaluateRollOutcome({ total: 16, d20Result: 12, targetDC: DC }), DCC_ROLL_OUTCOMES.FAILURE);

    // Near Miss: miss by 1-3 (total between 17 and 19 inclusive)
    assert.equal(evaluateRollOutcome({ total: 17, d20Result: 13, targetDC: DC }), DCC_ROLL_OUTCOMES.NEAR_MISS);
    assert.equal(evaluateRollOutcome({ total: 18, d20Result: 14, targetDC: DC }), DCC_ROLL_OUTCOMES.NEAR_MISS);
    assert.equal(evaluateRollOutcome({ total: 19, d20Result: 15, targetDC: DC }), DCC_ROLL_OUTCOMES.NEAR_MISS);

    // Success: meet or exceed number by < 10 (total between 20 and 29 inclusive)
    assert.equal(evaluateRollOutcome({ total: 20, d20Result: 16, targetDC: DC }), DCC_ROLL_OUTCOMES.SUCCESS);
    assert.equal(evaluateRollOutcome({ total: 25, d20Result: 17, targetDC: DC }), DCC_ROLL_OUTCOMES.SUCCESS);
    assert.equal(evaluateRollOutcome({ total: 29, d20Result: 19, targetDC: DC }), DCC_ROLL_OUTCOMES.SUCCESS);

    // Major Success: exceed number by 10 or greater (total >= 30)
    assert.equal(evaluateRollOutcome({ total: 30, d20Result: 18, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_SUCCESS);
    assert.equal(evaluateRollOutcome({ total: 35, d20Result: 19, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_SUCCESS);
    assert.equal(evaluateRollOutcome({ total: 50, d20Result: 15, targetDC: DC }), DCC_ROLL_OUTCOMES.MAJOR_SUCCESS);
  });

  await t.test('2. Extracting d20 result from Roll objects', () => {
    // Explicit d20Result
    assert.equal(extractD20Result({ d20Result: 17 }), 17);

    // Roll terms structure
    const rollWithTerms = {
      terms: [
        {
          faces: 20,
          results: [{ result: 14, active: true }]
        },
        '+',
        4
      ]
    };
    assert.equal(extractD20Result(rollWithTerms), 14);

    // Roll dice structure
    const rollWithDice = {
      dice: [
        {
          faces: 20,
          results: [{ result: 1, active: true }]
        }
      ]
    };
    assert.equal(extractD20Result(rollWithDice), 1);
  });

  await t.test('3. Session Creation, Storage, and Lifecycle', async () => {
    // Reset sessions
    await DCCSessionEngine.saveAllSessions([]);
    await DCCSessionEngine.setActiveSessionId('');

    const session1 = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1: World Dungeon Entry' });
    assert.ok(session1.id);
    assert.equal(session1.number, 1);
    assert.equal(session1.title, 'Session 1: World Dungeon Entry');
    assert.equal(session1.status, 'active');
    assert.equal(DCCSessionEngine.getActiveSessionId(), session1.id);

    // End session
    const ended = await DCCSessionEngine.endSession(session1.id, { summaryNotes: 'Cleared Floor 1 entrance' });
    assert.equal(ended.status, 'completed');
    assert.ok(ended.endedAt);
    assert.equal(ended.summary.notes, 'Cleared Floor 1 entrance');

    // Reopen session
    const reopened = await DCCSessionEngine.reopenSession(session1.id);
    assert.equal(reopened.status, 'active');
    assert.equal(reopened.endedAt, null);

    // Create session 2
    const session2 = await DCCSessionEngine.createSession({ number: 2, title: 'Session 2: The Meat Grinder' });
    assert.equal(session2.number, 2);
    assert.equal(DCCSessionEngine.getActiveSessionId(), session2.id);

    const all = DCCSessionEngine.getAllSessions();
    assert.equal(all.length, 2);
  });

  await t.test('4. Tracking Rolls: Trained Skills, Untrained Checks, Attacks, and Spells', async () => {
    // Setup active session
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { str: { value: 16, unenhanced: 16, mod: 4 }, int: { value: 12, mod: 4 } },
        attributes: { hp: { value: 40, max: 40 }, mana: { value: 10, max: 10 } },
        details: { level: 2 }
      }
    });
    globalThis.game.actors = [actor];

    // 1. Untrained skill attempt
    const untrainedEntry = await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 8, d20Result: 4, formula: '2d20kl + 4' },
      type: 'untrained_skill',
      name: 'Lockpicking',
      isUntrained: true,
      targetDC: 15,
      notes: 'Attempted to pick dungeon iron door'
    });

    assert.ok(untrainedEntry);
    assert.equal(untrainedEntry.isUntrained, true);
    assert.equal(untrainedEntry.outcome, DCC_ROLL_OUTCOMES.FAILURE); // 8 vs 15 (miss by 7)

    const updatedSession = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(updatedSession.crawlers[actor.id].untrainedAttempted['Lockpicking'], 1);

    // 2. Trained skill roll
    const trainedEntry = await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 24, d20Result: 16, formula: '1d20 + 8' },
      type: 'skill',
      name: 'Bashing Weapons',
      isUntrained: false,
      targetDC: 15
    });

    assert.equal(trainedEntry.outcome, DCC_ROLL_OUTCOMES.SUCCESS); // 24 vs 15 (beat by 9)
    const afterTrained = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(afterTrained.crawlers[actor.id].skillsUsed['Bashing Weapons'], 1);

    // 3. Attack roll with natural 20
    const attackEntry = await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 28, d20Result: 20, formula: '1d20 + 8' },
      type: 'attack',
      name: 'Spiked Bat Attack',
      targetDC: 20
    });
    assert.equal(attackEntry.outcome, DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);

    // 4. Spell cast
    await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 0, formula: '5 MP' },
      type: 'spell',
      name: 'Foot Stomp Shockwave',
      notes: 'Cast spell (5 MP)'
    });
    const afterSpell = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(afterSpell.crawlers[actor.id].spellsCast['Foot Stomp Shockwave'], 1);
  });

  await t.test('5. Combat Damage, AI Favor, Popularity, and Loot Box Tracking', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });

    const carl = new DCCActor({ name: 'Carl', type: 'crawler', system: { attributes: { aiFavor: 5 }, details: { popularity: '10' } } });
    const mob = new DCCActor({ name: 'Goblin Shaman', type: 'npc', system: { attributes: { hp: { value: 0, max: 20 } } } });
    globalThis.game.actors = [carl, mob];

    // Record damage dealt & kill
    await DCCSessionEngine.recordDamage({
      attackerActor: carl,
      targetActor: mob,
      actualDamage: 30,
      attackName: 'Warhammer Smash'
    });

    // Record damage taken
    await DCCSessionEngine.recordDamage({
      attackerActor: mob,
      targetActor: carl,
      actualDamage: 12,
      attackName: 'Firebolt'
    });

    // Adjust AI Favor
    await DCCSessionEngine.adjustAIFavor({ actorId: carl.id, delta: 5, reason: 'Entertaining skull crush' });

    // Adjust Popularity
    await DCCSessionEngine.adjustPopularity({ actorId: carl.id, delta: 3, reason: 'Audience donation cheer' });

    // Award Loot Box
    await DCCSessionEngine.recordLootBox({ actorId: carl.id, tier: 'silver', title: 'SILVER LOOT BOX' });

    const s = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    const carlData = s.crawlers[carl.id];

    assert.equal(carlData.damageDealt, 30);
    assert.equal(carlData.damageTaken, 12);
    assert.equal(carlData.kills, 1);
    assert.equal(carlData.aiFavorDelta, 5);
    assert.equal(carlData.popularityDelta, 3);
    assert.deepEqual(carlData.lootBoxesAwarded, ['silver']);
  });

  await t.test('6. Manual DM Overrides: Ledger and Crawler Stats', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });
    const actor = new DCCActor({ name: 'Carl', type: 'crawler' });
    globalThis.game.actors = [actor];

    const entry = await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 14, d20Result: 10 },
      type: 'skill',
      name: 'Perception',
      targetDC: 15 // Near miss (miss by 1)
    });
    assert.equal(entry.outcome, DCC_ROLL_OUTCOMES.NEAR_MISS);

    // 1. DM changes Target DC to 12 -> outcome automatically updates to Success
    const updated = await DCCSessionEngine.updateLedgerEntry(session.id, entry.id, { targetDC: 12 });
    assert.equal(updated.targetDC, 12);
    assert.equal(updated.outcome, DCC_ROLL_OUTCOMES.SUCCESS);
    assert.equal(updated.gmEdited, true);

    // 2. DM explicitly overrides outcome to Critical Success
    const forced = await DCCSessionEngine.updateLedgerEntry(session.id, entry.id, { outcome: DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS, notes: 'DM Rule of Cool' });
    assert.equal(forced.outcome, DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);
    assert.equal(forced.notes, 'DM Rule of Cool');

    // 3. DM deletes a ledger entry
    const deleted = await DCCSessionEngine.deleteLedgerEntry(session.id, entry.id);
    assert.equal(deleted, true);
    const afterDelete = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(afterDelete.ledger.length, 0);

    // 4. DM manually modifies crawler totals
    await DCCSessionEngine.updateCrawlerStats(session.id, actor.id, { damageDealt: 150, kills: 4 });
    const s = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(s.crawlers[actor.id].damageDealt, 150);
    assert.equal(s.crawlers[actor.id].kills, 4);
  });

  await t.test('7. End-of-Session Progression: Promoting Untrained Skills & Distributing XP', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { hp: { value: 40, max: 40 } },
        details: { level: 1, xp: { value: 0, max: 1000 } }
      },
      items: []
    });
    globalThis.game.actors = [actor];

    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });

    // Record untrained lockpicking attempt
    await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 10, d20Result: 6 },
      type: 'untrained_skill',
      name: 'Lockpicking',
      isUntrained: true
    });

    // Train untrained skill to Rank 1
    const trainResult = await DCCSessionEngine.trainUntrainedSkill(actor.id, 'Lockpicking');
    assert.equal(trainResult.success, true);
    assert.equal(trainResult.newRank, 1);

    const lockpickingItem = actor.items.find(i => i.name.toLowerCase() === 'lockpicking');
    assert.ok(lockpickingItem);
    assert.equal(lockpickingItem.system.rank, 1);

    // Distribute session XP
    await DCCSessionEngine.updateCrawlerStats(session.id, actor.id, { damageDealt: 200, damageTaken: 50, kills: 2 });
    const xpResult = await DCCSessionEngine.distributeSessionXP(session.id, { bonusXP: 100 });
    assert.ok(xpResult.totalPool > 0);
    assert.equal(xpResult.crawlers.length, 1);
    assert.ok(xpResult.crawlers[0].awardedXP > 0);
    assert.ok(Number(actor.system.details.xp.value) > 0);

    // Broadcast AI session review chat card
    const chatMsg = await DCCSessionEngine.broadcastAISessionReview(session.id);
    assert.ok(chatMsg);
    assert.ok(chatMsg.content.includes('PERFORMANCE RECAP'));
    assert.ok(chatMsg.content.includes('Carl'));
  });

  await t.test('8. DCCSessionManagerApp View Model and Filtering', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { con: { mod: 4 } },
        attributes: { hp: { value: 40, max: 40 }, mana: { value: 10, max: 10 } },
        details: { level: 2 }
      }
    });
    globalThis.game.actors = [actor];

    await DCCSessionEngine.recordRoll({
      actor,
      roll: { total: 18, d20Result: 14 },
      type: 'skill',
      name: 'Bashing Weapons',
      targetDC: 15
    });

    const app = new DCCSessionManagerApp();
    const data = await app.getData();

    assert.equal(data.sessions.length, 1);
    assert.equal(data.session.id, session.id);
    assert.equal(data.crawlersList.length, 1);
    assert.equal(data.ledger.length, 1);
    assert.equal(data.ledger[0].outcomeLabel, 'Success');
    assert.equal(data.outcomeOptions.length, 8);
  });

  await t.test('9. Manual Event Creation with Full Filter Options (Types, Untrained, Formula, DC, 7-Tier Outcomes, Stat Deltas)', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { str: { mod: 4 } },
        attributes: { hp: { value: 40, max: 40 } },
        details: { level: 2 }
      }
    });
    globalThis.game.actors = [actor];

    // 1. Untrained skill attempt via createManualEvent
    const evUntrained = await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'untrained_skill',
      name: 'Pickpocket',
      isUntrained: true,
      rollFormula: '2d20kl + 2',
      total: 9,
      d20Result: 5,
      targetDC: 15,
      outcome: 'auto', // Auto should calculate 9 vs 15 -> Failure
      notes: 'Caught in the act by goblin merchant'
    }, session.id);

    assert.ok(evUntrained);
    assert.equal(evUntrained.type, 'untrained_skill');
    assert.equal(evUntrained.isUntrained, true);
    assert.equal(evUntrained.outcome, DCC_ROLL_OUTCOMES.FAILURE);
    assert.equal(evUntrained.notes, 'Caught in the act by goblin merchant');

    let s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers[actor.id].untrainedAttempted['Pickpocket'], 1);

    // 2. Explicit outcome override (e.g. Critical Success selected in dialog)
    const evExplicit = await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'attack',
      name: 'Pancake Stomp',
      isUntrained: false,
      rollFormula: '1d20 + 6',
      total: 12,
      d20Result: 6,
      targetDC: 15,
      outcome: DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS, // Explicit DM selection
      notes: 'DM approved rule of cool crit'
    }, session.id);

    assert.equal(evExplicit.outcome, DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);

    // 3. Stat deltas: AI Favor adjustment (+8)
    const evFavor = await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'favor',
      name: 'AI Favor +8',
      statDelta: 8,
      notes: 'Audience cheered the gruesome finisher'
    }, session.id);

    assert.equal(evFavor.type, 'favor');
    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers[actor.id].aiFavorDelta, 8);

    // 4. Stat deltas: Popularity shift (-3)
    await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'popularity',
      name: 'Popularity -3',
      statDelta: -3,
      notes: 'Insulted the corporate sponsor'
    }, session.id);

    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers[actor.id].popularityDelta, -3);

    // 5. Stat deltas: Damage Dealt (35)
    await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'damage_dealt',
      name: 'Bomb Explosion',
      statDelta: 35,
      notes: 'Blasted three goblins into mush'
    }, session.id);

    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers[actor.id].damageDealt, 35);

    // 6. Stat deltas: Damage Taken (18)
    await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'damage_taken',
      name: 'Acid Trap',
      statDelta: 18,
      notes: 'Stepped into an acid geyser'
    }, session.id);

    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers[actor.id].damageTaken, 18);

    // 7. Loot Box Awarded
    await DCCSessionEngine.createManualEvent({
      actorId: actor.id,
      type: 'loot',
      name: 'GOLD LOOT BOX',
      notes: 'Floor 1 completion reward'
    }, session.id);

    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.deepEqual(s.crawlers[actor.id].lootBoxesAwarded, ['gold']);
    assert.equal(s.ledger.length, 7);
  });

  await t.test('10. Real-time Live Updates for Open Tracker Windows and Dialog Auto-Filter Adjustment', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    const session = await DCCSessionEngine.createSession({ number: 1, title: 'Session 1' });
    const carl = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { str: { value: 16, unenhanced: 16, mod: 4 }, dex: { mod: 2 }, con: { mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 10, max: 10 }, evade: { items: 0, buffs: 0 } },
        details: { level: 2 }
      }
    });
    const donut = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { cha: { mod: 5 }, dex: { mod: 3 }, con: { mod: 2 } },
        attributes: { hp: { value: 25, max: 25, temp: 0 }, mana: { value: 20, max: 20 }, evade: { items: 0, buffs: 0 } },
        details: { level: 2 }
      }
    });
    globalThis.game.actors = [carl, donut];

    // Open tracker app instance
    const app = new DCCSessionManagerApp();
    let renderCount = 0;
    const originalRender = app.render.bind(app);
    app.render = (force = false, options = {}) => {
      renderCount++;
      return originalRender(force, options);
    };

    app.render(true);
    assert.equal(renderCount, 1);
    assert.ok(globalThis.ui.windows['dcc-session-manager']);

    // 1. When an event is manually added via DCCSessionEngine.createManualEvent, app renders immediately in real time
    await DCCSessionEngine.createManualEvent({
      actorId: carl.id,
      type: 'manual',
      name: 'Found Secret Room',
      total: 0,
      notes: 'Found hidden loot stash behind bookshelf'
    });
    assert.ok(renderCount >= 2, 'App should have rerendered automatically upon manual event');

    // 2. When actor rolls a Stat check (e.g. STR Check), it records to session and live rerenders
    const prevCount = renderCount;
    await carl.rollStat('str');
    assert.ok(renderCount > prevCount, 'App should have rerendered automatically upon actor.rollStat');
    let s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    const lastEntry = s.ledger[s.ledger.length - 1];
    assert.equal(lastEntry.type, 'stat');
    assert.equal(lastEntry.name, 'STR Check');
    assert.equal(lastEntry.actorId, carl.id);

    // 3. When actor rolls Evade, it records to session and live rerenders
    const prevEvadeCount = renderCount;
    await carl.rollEvade();
    assert.ok(renderCount > prevEvadeCount, 'App should have rerendered automatically upon actor.rollEvade');
    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    const evadeEntry = s.ledger[s.ledger.length - 1];
    assert.equal(evadeEntry.type, 'stat');
    assert.equal(evadeEntry.name, 'Evade Roll');

    // 4. When damage is applied via DCCCombatMetrics.applyDamageToTarget out-of-combat, it records to session in real time
    const prevDmgCount = renderCount;
    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: donut,
      rawDamage: 8,
      attackerActor: null,
      attackName: 'Fire Trap',
      attackType: 'Trap'
    });
    assert.ok(renderCount > prevDmgCount, 'App should have rerendered automatically upon combatMetrics damage');
    s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    const dmgEntry = s.ledger[s.ledger.length - 1];
    assert.equal(dmgEntry.type, 'damage_taken');
    assert.equal(dmgEntry.actorId, donut.id);

    // 5. Verify Add Event Dialog generates all options and updates active filters
    // Simulate user having filter set to Donut and type 'spell'
    app.filterCrawlerId = donut.id;
    app.filterType = 'spell';
    app.filterOutcome = 'critical_failure';
    app.searchQuery = 'something specific';

    const dialogHtml = DCCSessionManagerApp.getAddEventDialogHtml({
      crawlers: [{ actorId: carl.id, name: 'Carl', level: 2 }, { actorId: donut.id, name: 'Princess Donut', level: 2 }],
      currentCrawlerId: app.filterCrawlerId,
      currentType: app.filterType,
      currentOutcome: app.filterOutcome,
      outcomes: Object.entries(DCC_OUTCOME_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label }))
    });

    assert.ok(dialogHtml.includes('name="actorId"'));
    assert.ok(dialogHtml.includes('name="type"'));
    assert.ok(dialogHtml.includes('name="isUntrained"'));
    assert.ok(dialogHtml.includes('name="rollFormula"'));
    assert.ok(dialogHtml.includes('name="total"'));
    assert.ok(dialogHtml.includes('name="d20Result"'));
    assert.ok(dialogHtml.includes('name="targetDC"'));
    assert.ok(dialogHtml.includes('name="outcome"'));
    assert.ok(dialogHtml.includes('name="statDelta"'));
    assert.ok(dialogHtml.includes('name="notes"'));

    // Trigger promptAddEventDialog and simulate submitting an event for Carl with type 'attack'
    let createdDialogInstance = null;
    const origDialog = globalThis.Dialog;
    globalThis.Dialog = class SpyDialog extends origDialog {
      constructor(data, options) {
        super(data, options);
        createdDialogInstance = this;
      }
    };

    const promptPromise = app.promptAddEventDialog();
    assert.ok(createdDialogInstance, 'Dialog should have been opened');

    // Simulate clicking "Add Event" in dialog with form data for Carl
    const mockFormHtml = {
      find: (sel) => {
        const map = {
          '.dcc-add-event-form': mockFormHtml,
          '[name="actorId"]': { val: () => carl.id },
          '[name="type"]': { val: () => 'attack' },
          '[name="name"]': { val: () => 'Megaton Hammer' },
          '[name="isUntrained"]': { is: () => false },
          '[name="rollFormula"]': { val: () => '1d20 + 8' },
          '[name="total"]': { val: () => '26' },
          '[name="d20Result"]': { val: () => '18' },
          '[name="targetDC"]': { val: () => '15' },
          '[name="outcome"]': { val: () => 'major_success' },
          '[name="statDelta"]': { val: () => '22' },
          '[name="notes"]': { val: () => 'Crushed the skull of an elite mob' }
        };
        return map[sel] || { val: () => '', is: () => false };
      }
    };

    await createdDialogInstance.triggerButton('create', mockFormHtml);
    const createdEvent = await promptPromise;
    assert.ok(createdEvent);
    assert.equal(createdEvent.name, 'Megaton Hammer');
    assert.equal(createdEvent.actorId, carl.id);
    assert.equal(createdEvent.outcome, DCC_ROLL_OUTCOMES.MAJOR_SUCCESS);

    // Verify filters were automatically cleared/adjusted so the newly added event is immediately visible!
    assert.equal(app.filterCrawlerId, 'all', 'Filter should be set to all or match new event');
    assert.equal(app.filterType, 'all', 'Filter should be set to all or match new event');
    assert.equal(app.filterOutcome, 'all', 'Filter should be set to all or match new event');
    assert.equal(app.searchQuery, '', 'Search query should be cleared so new event is not hidden');
    assert.equal(app.activeTab, 'ledger', 'Active tab should be switched to ledger');

    // Restore Dialog
    globalThis.Dialog = origDialog;
    await app.close();
  });

  await t.test('11. Tracked Crawler Roster and Party Grouping Filtering', async () => {
    await DCCSessionEngine.saveAllSessions([]);
    await DCCSessionEngine.setActiveSessionId('');

    // Setup 4 crawlers with different parties and unassigned
    const carl = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        details: { level: 3, party: 'The Royal Court', xp: { value: 100, max: 1000 } },
        attributes: { hp: { value: 40, max: 40 }, mana: { value: 10, max: 10 } }
      }
    });

    const donut = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        details: { level: 3, party: 'The Royal Court', xp: { value: 100, max: 1000 } },
        attributes: { hp: { value: 25, max: 25 }, mana: { value: 20, max: 20 } }
      }
    });

    const katia = new DCCActor({
      name: 'Katia',
      type: 'crawler',
      system: {
        details: { level: 2, party: 'Team Meadow Lark', xp: { value: 50, max: 1000 } },
        attributes: { hp: { value: 30, max: 30 }, mana: { value: 10, max: 10 } }
      }
    });

    const louis = new DCCActor({
      name: 'Louis',
      type: 'crawler',
      system: {
        details: { level: 1, party: '', xp: { value: 0, max: 1000 } },
        attributes: { hp: { value: 20, max: 20 }, mana: { value: 5, max: 5 } }
      }
    });

    globalThis.game.actors = [carl, donut, katia, louis];

    // 1. Validate getDistinctParties and party filtering
    const distinct = DCCSessionEngine.getDistinctParties();
    assert.deepEqual(distinct, ['Team Meadow Lark', 'The Royal Court']);

    const royalCourtMembers = DCCSessionEngine.getPartyCrawlers({ party: 'The Royal Court' });
    assert.equal(royalCourtMembers.length, 2);
    assert.ok(royalCourtMembers.some(c => c.id === carl.id));
    assert.ok(royalCourtMembers.some(c => c.id === donut.id));

    const unassigned = DCCSessionEngine.getPartyCrawlers({ party: 'unassigned' });
    assert.equal(unassigned.length, 1);
    assert.equal(unassigned[0].id, louis.id);

    // 2. Create session scoped to 'The Royal Court'
    const session = await DCCSessionEngine.createSession({
      number: 1,
      title: 'Session 1: The Royal Court',
      party: 'The Royal Court'
    });

    assert.equal(session.party, 'The Royal Court');
    assert.equal(session.trackedCrawlerIds.length, 2);
    assert.ok(session.trackedCrawlerIds.includes(carl.id));
    assert.ok(session.trackedCrawlerIds.includes(donut.id));
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, carl.id), true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, katia.id), false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, louis.id), false);

    // 3. Dynamic roster adjustments: add, remove, and toggle
    await DCCSessionEngine.addTrackedCrawler(session.id, katia.id);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, katia.id), true);

    await DCCSessionEngine.removeTrackedCrawler(session.id, donut.id);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), false);

    // Toggle: currently untracked donut -> toggles to tracked
    const toggledOn = await DCCSessionEngine.toggleTrackedCrawler(session.id, donut.id);
    assert.equal(toggledOn, true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), true);

    // Toggle again: currently tracked donut -> toggles to untracked
    const toggledOff = await DCCSessionEngine.toggleTrackedCrawler(session.id, donut.id);
    assert.equal(toggledOff, false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), false);

    // 4. Selective tracking: Rolls from untracked crawlers are ignored
    // Tracked Carl rolls a skill check -> recorded
    const carlRoll = await DCCSessionEngine.recordRoll({
      actor: carl,
      roll: { total: 20, d20Result: 14 },
      type: 'skill',
      name: 'Bashing Weapons'
    });
    assert.ok(carlRoll);

    // Untracked Donut rolls a skill check -> ignored
    const donutRoll = await DCCSessionEngine.recordRoll({
      actor: donut,
      roll: { total: 25, d20Result: 18 },
      type: 'skill',
      name: 'Screaming Cat'
    });
    assert.equal(donutRoll, null);

    // Selective tracking: Damage to untracked crawlers is ignored
    const mob = new DCCActor({ name: 'Lava Fiend', type: 'mob', system: { attributes: { hp: { value: 10, max: 10 } } } });
    await DCCSessionEngine.recordDamage({
      attackerActor: mob,
      targetActor: carl,
      actualDamage: 10,
      attackName: 'Fireball'
    });

    await DCCSessionEngine.recordDamage({
      attackerActor: mob,
      targetActor: donut,
      actualDamage: 15,
      attackName: 'Fireball'
    });

    const refreshedSession = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(refreshedSession.crawlers[carl.id].damageTaken, 10);
    // Donut is untracked, so damageTaken was not recorded in session
    assert.equal(refreshedSession.crawlers[donut.id]?.damageTaken || 0, 0);

    // 5. Session summaries only aggregate tracked crawlers
    await DCCSessionEngine.updateCrawlerStats(session.id, carl.id, { damageDealt: 100, kills: 2 });
    await DCCSessionEngine.updateCrawlerStats(session.id, katia.id, { damageDealt: 60, kills: 1 });
    const summarySession = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    // Manually force stats on untracked donut
    summarySession.crawlers[donut.id] = { ...DCCSessionEngine._createCrawlerRecord(donut), damageDealt: 500, kills: 10 };
    DCCSessionEngine._recomputeSessionSummaries(summarySession);

    // Summary totals only aggregate Carl (100) and Katia (60) = 160, not Donut (500)
    assert.equal(summarySession.summary.totalDamageDealt, 160);
    assert.equal(summarySession.summary.totalKills, 3);
    assert.equal(summarySession.summary.mvpActorId, carl.id);

    // 6. XP distribution only awards participating tracked crawlers
    const xpResult = await DCCSessionEngine.distributeSessionXP(session.id, { bonusXP: 200 });
    assert.equal(xpResult.crawlers.length, 2); // Carl and Katia only
    assert.ok(xpResult.crawlers.some(c => c.actorId === carl.id));
    assert.ok(xpResult.crawlers.some(c => c.actorId === katia.id));
    assert.equal(xpResult.crawlers.some(c => c.actorId === donut.id), false);

    // Donut XP should remain unchanged
    assert.equal(Number(donut.system.details.xp.value), 100);

    // 7. AI recap card only displays tracked crawlers
    const recapMsg = await DCCSessionEngine.broadcastAISessionReview(session.id);
    assert.ok(recapMsg.content.includes('Carl'));
    assert.ok(recapMsg.content.includes('Katia'));
    assert.ok(!recapMsg.content.includes('Princess Donut'));

    // 8. DCCSessionManagerApp View Model filtering and Manage Roster Modal
    const app = new DCCSessionManagerApp({ sessionId: session.id, party: 'all', trackedOnly: true });
    const data = await app.getData();

    assert.equal(data.allWorldCrawlersCount, 4);
    assert.equal(data.trackedCount, 2); // Carl, Katia
    assert.equal(data.crawlersList.length, 2); // Filtered by trackedOnly: true
    assert.ok(data.crawlersList.some(c => c.actorId === carl.id && c.isTracked === true));
    assert.ok(data.crawlersList.some(c => c.actorId === katia.id && c.isTracked === true));

    // When trackedOnly is false, all 4 crawlers are shown
    app.trackedOnly = false;
    const allData = await app.getData();
    assert.equal(allData.crawlersList.length, 4);
    const donutCard = allData.crawlersList.find(c => c.actorId === donut.id);
    assert.equal(donutCard.isTracked, false);
    assert.equal(donutCard.party, 'The Royal Court');

    // Test promptManageRosterDialog
    let rosterDlgSpy = null;
    const origDialog = globalThis.Dialog;
    globalThis.Dialog = class SpyRosterDialog extends origDialog {
      constructor(dlgData, options) {
        super(dlgData, options);
        rosterDlgSpy = this;
      }
    };

    const rosterPromise = app.promptManageRosterDialog();
    assert.ok(rosterDlgSpy, 'Manage Roster Dialog should be opened');

    // Simulate saving roster with all 4 crawlers tracked and updating Louis's party
    const mockRosterForm = {
      find: (selector) => {
        if (selector === '.dcc-roster-row') {
          return {
            each: (cb) => {
              const rows = [
                { id: carl.id, tracked: true, party: 'The Royal Court' },
                { id: donut.id, tracked: true, party: 'The Royal Court' },
                { id: katia.id, tracked: true, party: 'Team Meadow Lark' },
                { id: louis.id, tracked: true, party: 'Solo Crawlers' }
              ];
              rows.forEach((r, idx) => {
                cb(idx, {
                  data: (key) => key === 'actor-id' ? r.id : null,
                  find: (sub) => {
                    if (sub === '.dcc-roster-checkbox') return { is: () => r.tracked, checked: r.tracked };
                    if (sub === '.dcc-roster-party-input') return { val: () => r.party, value: r.party };
                    return { is: () => false, val: () => '' };
                  }
                });
              });
            }
          };
        }
        return { is: () => false, val: () => '', click: () => {}, change: () => {} };
      }
    };

    await rosterDlgSpy.triggerButton('save', mockRosterForm);
    const updatedTrackedIds = await rosterPromise;
    assert.equal(updatedTrackedIds.length, 4);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), true);
    assert.equal(louis.system.details.party, 'Solo Crawlers');

    // Restore Dialog
    globalThis.Dialog = origDialog;
    await app.close();
  });

  await t.test('12. Option 1 West Marches Named Party Selection & Creation', async () => {
    // 1. Reset sessions and create test crawlers
    await DCCSessionEngine.saveAllSessions([]);
    await DCCSessionEngine.setActiveSessionId('');

    const carl = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { details: { level: 2, party: 'The Royal Court' }, attributes: { hp: { value: 30, max: 30 }, mana: { value: 10, max: 10 } } }
    });
    const donut = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: { details: { level: 2, party: 'The Royal Court' }, attributes: { hp: { value: 25, max: 25 }, mana: { value: 15, max: 15 } } }
    });
    const katia = new DCCActor({
      name: 'Katia',
      type: 'crawler',
      system: { details: { level: 1, party: 'Team Meadow Lark' }, attributes: { hp: { value: 20, max: 20 }, mana: { value: 5, max: 5 } } }
    });
    const louis = new DCCActor({
      name: 'Louis',
      type: 'crawler',
      system: { details: { level: 1, party: '' }, attributes: { hp: { value: 20, max: 20 }, mana: { value: 5, max: 5 } } }
    });

    globalThis.game.actors = [carl, donut, katia, louis];

    const session = await DCCSessionEngine.createSession({
      number: 1,
      title: 'West Marches Expedition'
    });

    // 2. DCCSessionManagerApp defaults to trackedOnly: true
    const app = new DCCSessionManagerApp({ sessionId: session.id });
    assert.equal(app.trackedOnly, true, 'PPSM should default to trackedOnly: true to hide untracked crawlers');

    // 3. Select Party 'Team Meadow Lark': tracks Katia and unselects Carl, Donut, and Louis
    const trackedKatia = await app.selectParty('Team Meadow Lark');
    assert.deepEqual(trackedKatia, [katia.id]);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, katia.id), true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, carl.id), false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, louis.id), false);
    assert.equal(app.filterParty, 'Team Meadow Lark');
    assert.equal(app.trackedOnly, true);

    const dataTeam = await app.getData();
    assert.equal(dataTeam.crawlersList.length, 1);
    assert.equal(dataTeam.crawlersList[0].actorId, katia.id);

    // 4. Select Party 'The Royal Court': tracks Carl and Donut, unselects Katia and Louis
    const trackedRoyal = await app.selectParty('The Royal Court');
    assert.equal(trackedRoyal.length, 2);
    assert.ok(trackedRoyal.includes(carl.id));
    assert.ok(trackedRoyal.includes(donut.id));
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, katia.id), false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, louis.id), false);

    const dataRoyal = await app.getData();
    assert.equal(dataRoyal.crawlersList.length, 2);
    assert.ok(dataRoyal.crawlersList.some(c => c.actorId === carl.id));
    assert.ok(dataRoyal.crawlersList.some(c => c.actorId === donut.id));

    // 5. Select Party 'all': tracks all world crawlers
    const trackedAll = await app.selectParty('all');
    assert.equal(trackedAll.length, 4);

    // 6. Test promptCreatePartyDialog to create a new party (e.g. 'Delta Strike')
    let createDlgSpy = null;
    const origDialog = globalThis.Dialog;
    globalThis.Dialog = class SpyCreatePartyDialog extends origDialog {
      constructor(dlgData, options) {
        super(dlgData, options);
        createDlgSpy = this;
      }
    };

    const createPromise = app.promptCreatePartyDialog();
    assert.ok(createDlgSpy, 'Create Party Dialog should open');

    const mockCreateForm = {
      find: (selector) => {
        if (selector === '.dcc-new-party-name-input') {
          return { val: () => 'Delta Strike', value: 'Delta Strike' };
        }
        if (selector === '.dcc-new-party-row') {
          return {
            each: (cb) => {
              const rows = [
                { id: carl.id, checked: true },
                { id: louis.id, checked: true },
                { id: donut.id, checked: false },
                { id: katia.id, checked: false }
              ];
              rows.forEach((r, idx) => {
                cb(idx, {
                  data: (key) => key === 'actor-id' ? r.id : null,
                  find: (sub) => {
                    if (sub === '.dcc-party-member-checkbox') return { is: () => r.checked, checked: r.checked };
                    return { is: () => false, val: () => '' };
                  }
                });
              });
            }
          };
        }
        return { is: () => false, val: () => '', click: () => {}, change: () => {} };
      }
    };

    await createDlgSpy.triggerButton('save', mockCreateForm);
    const result = await createPromise;

    assert.equal(result.partyName, 'Delta Strike');
    assert.deepEqual(result.memberIds.sort(), [carl.id, louis.id].sort());

    // Verify actor party attributes were updated
    assert.equal(carl.system.details.party, 'Delta Strike');
    assert.equal(louis.system.details.party, 'Delta Strike');
    assert.equal(donut.system.details.party, 'The Royal Court');
    assert.equal(katia.system.details.party, 'Team Meadow Lark');

    // Verify session active party and tracked crawler IDs
    const updatedSession = DCCSessionEngine.getAllSessions().find(s => s.id === session.id);
    assert.equal(updatedSession.party, 'Delta Strike');
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, carl.id), true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, louis.id), true);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, donut.id), false);
    assert.equal(DCCSessionEngine.isCrawlerTracked(session.id, katia.id), false);

    // Verify view model reflects new active party with untracked crawlers hidden
    assert.equal(app.filterParty, 'Delta Strike');
    assert.equal(app.trackedOnly, true);
    const dataDelta = await app.getData();
    assert.equal(dataDelta.crawlersList.length, 2);
    assert.ok(dataDelta.crawlersList.some(c => c.actorId === carl.id));
    assert.ok(dataDelta.crawlersList.some(c => c.actorId === louis.id));

    globalThis.Dialog = origDialog;
    await app.close();
  });
});

