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
    assert.equal(data.crawlersList[0].hpBars, 10);
    assert.equal(data.ledger.length, 1);
    assert.equal(data.ledger[0].outcomeLabel, 'Success');
    assert.equal(data.outcomeOptions.length, 8);
  });
});
