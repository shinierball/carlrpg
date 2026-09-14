import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCActor, getRequiredXPForLevel } from '../src/documents/actor.mjs';
import { DCCCombat, DCC_ACTION_TYPES } from '../src/documents/combat.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { DCCExperienceTracker, DEFAULT_XP_WEIGHTS } from '../src/apps/xp-tracker.mjs';

test('DCC RPG Experience & Action Tracking System Suite', async (t) => {
  // Clear any archived combats
  await DCCCombat.clearArchivedCombats();

  // Setup actors
  const crawlerCarl = new DCCActor({
    name: 'Carl',
    type: 'crawler',
    system: {
      abilities: { con: { value: 14, unenhanced: 14, mod: 4 } },
      attributes: { hp: { value: 40, max: 40, temp: 0 } },
      details: { level: 1, xp: { value: 0, max: 1000 } }
    }
  });
  crawlerCarl.prepareDerivedData();

  const crawlerDonut = new DCCActor({
    name: 'Princess Donut',
    type: 'crawler',
    system: {
      abilities: { con: { value: 10, unenhanced: 10, mod: 4 } },
      attributes: { hp: { value: 40, max: 40, temp: 0 } },
      details: { level: 1, xp: { value: 0, max: 1000 } }
    }
  });
  crawlerDonut.prepareDerivedData();

  const mobGoblin = new DCCActor({
    name: 'Goblin Bruiser',
    type: 'npc',
    system: {
      abilities: { con: { value: 10, unenhanced: 10, mod: 4 } },
      attributes: { hp: { value: 20, max: 20, temp: 0 } },
      details: { level: 1 }
    }
  });

  const mobBoss = new DCCActor({
    name: 'Llamataur Boss',
    type: 'npc',
    system: {
      abilities: { con: { value: 20, unenhanced: 20, mod: 5 } },
      attributes: { hp: { value: 100, max: 100, temp: 0 } },
      details: { level: 3 }
    }
  });

  // Register in game.actors
  globalThis.game.actors = {
    get: (id) => {
      if (id === crawlerCarl.id || id === 'carl-id') return crawlerCarl;
      if (id === crawlerDonut.id || id === 'donut-id') return crawlerDonut;
      if (id === mobGoblin.id || id === 'goblin-id') return mobGoblin;
      if (id === mobBoss.id || id === 'boss-id') return mobBoss;
      return null;
    }
  };
  crawlerCarl.id = 'carl-id';
  crawlerDonut.id = 'donut-id';
  mobGoblin.id = 'goblin-id';
  mobBoss.id = 'boss-id';

  // Combatants
  const cCarl = new Combatant({ id: 'con-carl', actorId: crawlerCarl.id, actor: crawlerCarl, name: 'Carl' });
  const cDonut = new Combatant({ id: 'con-donut', actorId: crawlerDonut.id, actor: crawlerDonut, name: 'Princess Donut' });
  const cGoblin = new Combatant({ id: 'con-goblin', actorId: mobGoblin.id, actor: mobGoblin, name: 'Goblin Bruiser' });
  const cBoss = new Combatant({ id: 'con-boss', actorId: mobBoss.id, actor: mobBoss, name: 'Llamataur Boss' });

  const combat = new DCCCombat({
    id: 'combat-xp-test-1',
    combatants: [cCarl, cDonut, cGoblin, cBoss]
  });
  combat.round = 1;

  globalThis.game.combats = {
    get: (id) => (id === combat.id ? combat : null),
    find: (fn) => [combat].find(fn)
  };

  await t.test('1. Action Categorization & Slot Tagging', async () => {
    // Record various action types
    await combat.recordCombatantAction(cCarl.id, { type: 'attack', label: 'Spiked Bat' });
    await combat.recordCombatantAction(cCarl.id, { type: 'catcher', label: 'Catcher' });

    await combat.recordCombatantAction(cDonut.id, { type: 'play', label: 'Call a Play' });
    await combat.recordCombatantAction(cDonut.id, { type: 'heal', label: 'Healing Word' });

    const carlActions = combat.getCombatantActions(cCarl);
    assert.equal(carlActions.slots[0].category, 'damage', 'Attack slot categorized as damage');
    assert.equal(carlActions.slots[1].category, 'defensive', 'Catcher slot categorized as defensive');

    const donutActions = combat.getCombatantActions(cDonut);
    assert.equal(donutActions.slots[0].category, 'tactical', 'Play slot categorized as tactical');
    assert.equal(donutActions.slots[1].category, 'buff', 'Heal slot categorized as buff');
  });

  await t.test('2. Damage Done and Damage Taken Tracking', async () => {
    // Carl attacks Goblin for 12 damage (Goblin CON mod is 4, 12 / 4 = 3 bars = 12 damage)
    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: mobGoblin,
      attackerActor: crawlerCarl,
      rawDamage: 12,
      combat
    });

    // Boss attacks Carl for 8 damage (Carl CON mod is 4, 8 / 4 = 2 bars = 8 damage)
    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawlerCarl,
      attackerActor: mobBoss,
      rawDamage: 8,
      combat
    });

    // Donut attacks Boss for 16 damage (Boss CON mod is 5, 16 / 5 = 3 bars = 15 damage)
    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: mobBoss,
      attackerActor: crawlerDonut,
      rawDamage: 16,
      combat
    });

    const metrics = DCCCombatMetrics.getMetrics(combat);

    // Carl: dealt 12 damage, took 8 damage
    assert.equal(metrics[crawlerCarl.id].totalDamage, 12, 'Carl totalDamage dealt is 12');
    assert.equal(metrics[crawlerCarl.id].damageTaken, 8, 'Carl damageTaken is 8');

    // Donut: dealt 15 damage, took 0 damage
    assert.equal(metrics[crawlerDonut.id].totalDamage, 15, 'Donut totalDamage dealt is 15');
    assert.equal(metrics[crawlerDonut.id].damageTaken, 0, 'Donut damageTaken is 0');

    // Goblin: took 12 damage
    assert.equal(metrics[mobGoblin.id].damageTaken, 12, 'Goblin damageTaken is 12');

    // Boss: dealt 8 damage, took 15 damage
    assert.equal(metrics[mobBoss.id].totalDamage, 8, 'Boss totalDamage dealt is 8');
    assert.equal(metrics[mobBoss.id].damageTaken, 15, 'Boss damageTaken is 15');
  });

  await t.test('3. Monster Base XP Calculation', async () => {
    // Goblin: Level 1, 20 HP -> 100*1 + 20*2 = 140 XP
    const goblinXP = DCCExperienceTracker.calculateMobXP(mobGoblin);
    assert.equal(goblinXP, 140, 'Goblin base XP is 140');

    // Boss: Level 3, 100 HP -> 100*3 + 100*2 = 500 XP
    const bossXP = DCCExperienceTracker.calculateMobXP(mobBoss);
    assert.equal(bossXP, 500, 'Boss base XP is 500');

    // Total expected pool: 140 + 500 = 640 XP
    const expectedPool = goblinXP + bossXP;
    assert.equal(expectedPool, 640);
  });

  await t.test('4. Proportional Encounter XP Distribution Calculation', async () => {
    const calculation = DCCExperienceTracker.calculateEncounterXP(combat);

    assert.equal(calculation.totalPool, 640, 'Calculated encounter pool is 640 XP');
    assert.equal(calculation.crawlers.length, 2, 'Two crawlers participated');

    const carlCalc = calculation.crawlers.find(c => c.name === 'Carl');
    const donutCalc = calculation.crawlers.find(c => c.name === 'Princess Donut');

    assert.ok(carlCalc, 'Carl calculation exists');
    assert.ok(donutCalc, 'Donut calculation exists');

    // Carl did 12 dmg (44.4%), took 8 dmg (100%), 1 defensive skill (100%), 0 tactical (0%), 0 buff (0%)
    // Donut did 15 dmg (55.6%), took 0 dmg (0%), 0 defensive skill (0%), 1 tactical (100%), 1 buff (100%)
    assert.equal(carlCalc.damageDealt, 12);
    assert.equal(carlCalc.damageTaken, 8);
    assert.equal(carlCalc.defensiveCount, 1);

    assert.equal(donutCalc.damageDealt, 15);
    assert.equal(donutCalc.damageTaken, 0);
    assert.equal(donutCalc.tacticalCount, 1);
    assert.equal(donutCalc.buffCount, 1);

    // Sum of awards must equal or closely match totalPool
    const totalAwarded = carlCalc.xpAward + donutCalc.xpAward;
    assert.ok(Math.abs(totalAwarded - 640) <= 2, `Total awarded (${totalAwarded}) matches pool (640)`);
    assert.ok(carlCalc.xpAward > 0, 'Carl received positive XP');
    assert.ok(donutCalc.xpAward > 0, 'Donut received positive XP');
  });

  await t.test('5. Zero-Activity Equal Redistribution', async () => {
    // Create an encounter where neither crawler used defensive or buff skills
    const combatNoSkills = {
      combatants: [
        { id: 'c1', name: 'A', actorId: 'a1', isMob: false, damageDealt: 10, damageTaken: 5, actionCategories: {} },
        { id: 'c2', name: 'B', actorId: 'a2', isMob: false, damageDealt: 10, damageTaken: 5, actionCategories: {} },
        { id: 'm1', name: 'Mob', actorId: 'm1', isMob: true, level: 1, maxHp: 20 }
      ],
      metrics: {}
    };

    const calc = DCCExperienceTracker.calculateEncounterXP(combatNoSkills);
    assert.equal(calc.totalPool, 140);
    assert.equal(calc.crawlers[0].xpAward, 70, 'Crawler A receives exactly half');
    assert.equal(calc.crawlers[1].xpAward, 70, 'Crawler B receives exactly half');
  });

  await t.test('6. Awarding Experience and Level Advancement', async () => {
    // Check required XP curve
    assert.equal(getRequiredXPForLevel(1), 1000, 'Level 1 needs 1000 XP to reach Level 2');
    assert.equal(getRequiredXPForLevel(2), 2500, 'Level 2 needs 2500 XP to reach Level 3');
    assert.equal(getRequiredXPForLevel(3), 4500, 'Level 3 needs 4500 XP to reach Level 4');

    // Archive the combat first
    await combat.endCombat();

    // Award XP using DCCExperienceTracker
    const awardResult = await DCCExperienceTracker.awardEncounterXP(combat.id);
    assert.equal(awardResult.success, true, 'Award succeeded');
    assert.equal(awardResult.awardedList.length, 2, 'Awarded to both crawlers');

    // Carl had 0 XP, now has > 0 XP
    assert.ok(crawlerCarl.system.details.xp.value > 0, 'Carl XP updated on character sheet');
    assert.equal(crawlerCarl.system.details.level, 1, 'Carl is still Level 1');

    // Verify double-awarding is blocked
    await assert.rejects(async () => {
      await DCCExperienceTracker.awardEncounterXP(combat.id);
    }, /already been awarded/i, 'Double award is rejected');

    // Test Level Up: Award Carl 1500 additional XP
    const levelUpRes = await crawlerCarl.awardExperience(1500, { notify: false });
    assert.equal(levelUpRes.leveledUp, true, 'Carl triggered level up');
    assert.equal(crawlerCarl.system.details.level, 2, 'Carl advanced to Level 2');
    assert.ok(crawlerCarl.system.details.xp.value >= 1500);
  });

  await t.test('7. Undo Experience Award', async () => {
    // Record Carl's XP before undo
    const currentCarlXP = crawlerCarl.system.details.xp.value;

    // Undo the encounter award
    const undoRes = await DCCExperienceTracker.undoAwardEncounterXP(combat.id);
    assert.equal(undoRes.success, true, 'Undo award succeeded');

    // Carl's XP should be reduced by his award from that encounter
    assert.ok(crawlerCarl.system.details.xp.value < currentCarlXP, 'Carl XP was reverted');

    // Now combat should allow re-awarding if desired
    const archives = DCCCombat.getArchivedCombats();
    const match = archives.find(a => a.id === combat.id);
    assert.equal(match.xpAwarded, undefined, 'Archive record xpAwarded flag was cleared');
  });
});
