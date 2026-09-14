import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCCombat, DCC_ACTION_TYPES } from '../src/documents/combat.mjs';
import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';

test('DCC RPG Custom Combat Tracker & Action Economy System', async (t) => {

  await t.test('1. Initiative & Turn Order (Phase-Based & Surprise Rounds)', async (sub) => {
    const crawlerActor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { attributes: { hp: { value: 40, max: 40 }, aiFavor: 3 } }
    });
    crawlerActor.id = 'actor-carl-1';

    const mobActor = new DCCActor({
      name: 'Goblin Skulker',
      type: 'npc',
      system: { attributes: { hp: { value: 20, max: 20 } } }
    });
    mobActor.id = 'actor-mob-1';

    const combat = new DCCCombat({
      id: 'combat-1',
      round: 1,
      turn: 0,
      combatants: [
        { id: 'c-carl', actorId: crawlerActor.id, actor: crawlerActor, name: 'Carl' },
        { id: 'c-mob', actorId: mobActor.id, actor: mobActor, name: 'Goblin Skulker' }
      ]
    });

    await sub.test('identifies Mob vs Crawler combatants accurately', () => {
      const carlCombatant = combat.combatants.find(c => c.id === 'c-carl');
      const mobCombatant = combat.combatants.find(c => c.id === 'c-mob');

      assert.equal(DCCCombat.isMobCombatant(carlCombatant), false, 'Carl is a crawler, not a mob');
      assert.equal(DCCCombat.isMobCombatant(mobCombatant), true, 'Goblin is an NPC mob');
    });

    await sub.test('default turn order places Mobs first (Initiative 20) and Crawlers second (Initiative 10)', async () => {
      await combat.assignPhaseInitiative();
      const carlCombatant = combat.combatants.find(c => c.id === 'c-carl');
      const mobCombatant = combat.combatants.find(c => c.id === 'c-mob');

      assert.equal(mobCombatant.initiative, 20, 'Mobs get primary initiative (20)');
      assert.equal(carlCombatant.initiative, 10, 'Crawlers get secondary initiative (10)');

      // Custom comparator sorts Mobs before Crawlers
      const sorted = [...combat.combatants].sort((a, b) => combat._sortCombatants(a, b));
      assert.equal(sorted[0].id, 'c-mob', 'First combatant in normal order is Mob');
      assert.equal(sorted[1].id, 'c-carl', 'Second combatant in normal order is Crawler');
    });

    await sub.test('surprise round reverses turn order: Crawlers first (Initiative 20), Mobs second (Initiative 10)', async () => {
      await combat.toggleSurpriseRound(true);
      assert.equal(combat.isSurpriseRound, true, 'Surprise round is active');

      const carlCombatant = combat.combatants.find(c => c.id === 'c-carl');
      const mobCombatant = combat.combatants.find(c => c.id === 'c-mob');

      assert.equal(carlCombatant.initiative, 20, 'Crawlers get primary initiative (20) in surprise round');
      assert.equal(mobCombatant.initiative, 10, 'Mobs get secondary initiative (10) in surprise round');

      const sorted = [...combat.combatants].sort((a, b) => combat._sortCombatants(a, b));
      assert.equal(sorted[0].id, 'c-carl', 'First combatant in surprise round is Crawler');
      assert.equal(sorted[1].id, 'c-mob', 'Second combatant in surprise round is Mob');
    });

    await sub.test('rollInitiative sets phase-based initiative without random d20 dice rolls', async () => {
      // Toggle back to normal
      await combat.toggleSurpriseRound(false);
      assert.equal(combat.isSurpriseRound, false);

      await combat.rollInitiative(['c-carl', 'c-mob']);
      const carlCombatant = combat.combatants.find(c => c.id === 'c-carl');
      const mobCombatant = combat.combatants.find(c => c.id === 'c-mob');

      assert.equal(mobCombatant.initiative, 20);
      assert.equal(carlCombatant.initiative, 10);
    });

    await sub.test('unbound _sortCombatants does not throw when invoked without this context (e.g. Array.prototype.sort callback from Foundry)', () => {
      const carlCombatant = combat.combatants.find(c => c.id === 'c-carl');
      const mobCombatant = combat.combatants.find(c => c.id === 'c-mob');

      // Detach method reference exactly as Array.prototype.sort does
      const unboundSort = combat._sortCombatants;
      assert.doesNotThrow(() => {
        const result = unboundSort(carlCombatant, mobCombatant);
        assert.equal(typeof result, 'number');
      });

      // Standard Array.prototype.sort callback passing combatants
      assert.doesNotThrow(() => {
        const list = [carlCombatant, mobCombatant];
        list.sort(combat._sortCombatants);
      });
    });
  });

  await t.test('2. Action Economy & Tracking (2 Actions, Mob 1-Attack Rule, AI Favor Bonus)', async (sub) => {
    const crawlerActor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { attributes: { hp: { value: 40, max: 40 }, aiFavor: 2 } }
    });
    crawlerActor.id = 'actor-carl-2';

    const mobActor = new DCCActor({
      name: 'Dungeon Berserker',
      type: 'npc',
      system: { attributes: { hp: { value: 30, max: 30 } } }
    });
    mobActor.id = 'actor-mob-2';

    const combat = new DCCCombat({
      id: 'combat-2',
      round: 1,
      combatants: [
        { id: 'c-carl-2', actorId: crawlerActor.id, actor: crawlerActor, name: 'Carl' },
        { id: 'c-mob-2', actorId: mobActor.id, actor: mobActor, name: 'Dungeon Berserker' }
      ]
    });

    await sub.test('initial action budget is 2 actions per round for each combatant', () => {
      const carlActions = combat.getCombatantActions('c-carl-2');
      const mobActions = combat.getCombatantActions('c-mob-2');

      assert.equal(carlActions.max, 2);
      assert.equal(carlActions.spent, 0);
      assert.equal(carlActions.hasAttacked, false);

      assert.equal(mobActions.max, 2);
      assert.equal(mobActions.spent, 0);
      assert.equal(mobActions.hasAttacked, false);
    });

    await sub.test('Mob 1-Attack Rule: Mob can perform 1 Attack, but a second Attack is rejected', async () => {
      // First action: Attack
      const res1 = await combat.recordCombatantAction('c-mob-2', { type: 'attack', label: 'Greataxe Slam' });
      assert.equal(res1.success, true, 'First attack action succeeded');
      assert.equal(res1.actions.spent, 1);
      assert.equal(res1.actions.hasAttacked, true);

      // Second action: Attempting a second Attack
      const res2 = await combat.recordCombatantAction('c-mob-2', { type: 'attack', label: 'Bite' });
      assert.equal(res2.success, false, 'Second attack action is rejected by the Mob 1-Attack rule');
      assert.match(res2.error, /Mobs can only perform at most 1 Attack Action per round/i);

      // Second action: Move or non-attack skill succeeds
      const res3 = await combat.recordCombatantAction('c-mob-2', { type: 'move', label: 'Move (20ft)' });
      assert.equal(res3.success, true, 'Move action succeeded for the second action slot');
      assert.equal(res3.actions.spent, 2);
      assert.equal(res3.actions.hasAttacked, true);
    });

    await sub.test('Crawler can take any 2 actions and spend 1 AI Favor for +1 non-Attack Action (3 total)', async () => {
      // Crawler action 1: Attack
      const res1 = await combat.recordCombatantAction('c-carl-2', { type: 'attack', label: 'Pugilism' });
      assert.equal(res1.success, true);
      assert.equal(res1.actions.spent, 1);

      // Crawler action 2: Cast Spell
      const res2 = await combat.recordCombatantAction('c-carl-2', { type: 'cast', label: 'Fireball' });
      assert.equal(res2.success, true);
      assert.equal(res2.actions.spent, 2);

      // Attempting 3rd action before spending favor fails
      const resFail = await combat.recordCombatantAction('c-carl-2', { type: 'move' });
      assert.equal(resFail.success, false, 'Cannot exceed base budget without bonus action');

      // Spend 1 AI Favor for +1 non-Attack Action
      assert.equal(crawlerActor.system.attributes.aiFavor, 2);
      const favorRes = await combat.spendAIFavorBonusAction('c-carl-2');
      assert.equal(favorRes.success, true, 'Spent 1 AI Favor successfully');
      assert.equal(crawlerActor.system.attributes.aiFavor, 1, 'Deducted 1 AI Favor from actor');
      assert.equal(favorRes.actions.max, 3, 'Max actions increased to 3');
      assert.equal(favorRes.actions.bonusActionGranted, true);

      // Now crawler can record a 3rd action (e.g. Move or Evade)
      const res3 = await combat.recordCombatantAction('c-carl-2', { type: 'evade', label: 'Evade' });
      assert.equal(res3.success, true, 'Recorded 3rd action slot successfully');
      assert.equal(res3.actions.spent, 3);

      // Cannot spend AI Favor twice in the same round
      const secondFavorRes = await combat.spendAIFavorBonusAction('c-carl-2');
      assert.equal(secondFavorRes.success, false, 'Cannot spend AI favor twice in one round');
    });

    await sub.test('advancing to nextRound() resets all action slots and clears surprise', async () => {
      await combat.toggleSurpriseRound(true);
      assert.equal(combat.isSurpriseRound, true);

      await combat.nextRound();

      // Surprise cleared
      assert.equal(combat.isSurpriseRound, false, 'Surprise deactivated after round advances');

      // Actions reset
      const carlActions = combat.getCombatantActions('c-carl-2');
      const mobActions = combat.getCombatantActions('c-mob-2');

      assert.equal(carlActions.max, 2, 'Crawler max reset to base 2');
      assert.equal(carlActions.spent, 0, 'Crawler spent reset to 0');
      assert.equal(carlActions.bonusActionGranted, false, 'Bonus action flag reset');
      assert.equal(carlActions.slots.length, 0);

      assert.equal(mobActions.max, 2);
      assert.equal(mobActions.spent, 0);
      assert.equal(mobActions.hasAttacked, false, 'Mob hasAttacked reset to false');
      assert.equal(mobActions.slots.length, 0);
    });
  });

  await t.test('3. Health Thresholds HUD Reference', async (sub) => {
    await sub.test('Green threshold for 100% to 66% HP', () => {
      const actor = new DCCActor({ system: { attributes: { hp: { value: 35, max: 40 } } } }); // 88%
      const th = DCCCombat.getHealthThreshold(actor);
      assert.equal(th.status, 'green');
      assert.equal(th.pct, 88);
    });

    await sub.test('Yellow threshold for 66% to 33% HP', () => {
      const actor = new DCCActor({ system: { attributes: { hp: { value: 20, max: 40 } } } }); // 50%
      const th = DCCCombat.getHealthThreshold(actor);
      assert.equal(th.status, 'yellow');
      assert.equal(th.pct, 50);
    });

    await sub.test('Red threshold for 33% to 0% HP', () => {
      const actor = new DCCActor({ system: { attributes: { hp: { value: 10, max: 40 } } } }); // 25%
      const th = DCCCombat.getHealthThreshold(actor);
      assert.equal(th.status, 'red');
      assert.equal(th.pct, 25);
    });
  });

  await t.test('4. Combat Tracker UI Data Preparation (DCCCombatTracker)', async (sub) => {
    const crawler = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: { attributes: { hp: { value: 30, max: 30 }, aiFavor: 5 } }
    });
    crawler.id = 'actor-donut';

    const mob = new DCCActor({
      name: 'Sewer Goblin',
      type: 'npc',
      system: { attributes: { hp: { value: 15, max: 15 } } }
    });
    mob.id = 'actor-goblin';

    const combat = new DCCCombat({
      id: 'combat-tracker-test',
      round: 1,
      combatants: [
        { id: 'c-donut', actorId: crawler.id, actor: crawler, name: 'Donut' },
        { id: 'c-goblin', actorId: mob.id, actor: mob, name: 'Sewer Goblin' }
      ]
    });

    const tracker = new DCCCombatTracker();
    tracker.viewed = combat;

    await sub.test('groups combatants into Mob Phase and Crawler Phase in normal rounds', async () => {
      const data = await tracker.getData();
      assert.equal(data.isCarlCombat, true);
      assert.equal(data.isSurpriseRound, false);
      assert.equal(data.phases.length, 2);

      assert.equal(data.phases[0].id, 'mobs', 'First phase in normal round is Mobs');
      assert.equal(data.phases[1].id, 'crawlers', 'Second phase in normal round is Crawlers');

      assert.equal(data.phases[0].turns.length, 1);
      assert.equal(data.phases[0].turns[0].name, 'Sewer Goblin');
      assert.equal(data.phases[0].turns[0].canAttack, true);

      assert.equal(data.phases[1].turns.length, 1);
      assert.equal(data.phases[1].turns[0].name, 'Donut');
      assert.equal(data.phases[1].turns[0].canSpendAIFavor, true);
    });

    await sub.test('places Crawler Surprise Phase first in surprise rounds', async () => {
      await combat.toggleSurpriseRound(true);
      const data = await tracker.getData();
      assert.equal(data.isSurpriseRound, true);

      assert.equal(data.phases[0].id, 'crawlers', 'First phase in surprise round is Crawlers');
      assert.equal(data.phases[0].isSurprise, true);
      assert.equal(data.phases[1].id, 'mobs', 'Second phase in surprise round is Mobs');
    });

    await sub.test('updates canAttack flag for Mob after attack is recorded', async () => {
      await combat.recordCombatantAction('c-goblin', { type: 'attack', label: 'Rusty Dagger' });
      const data = await tracker.getData();
      const goblinTurn = data.phases.find(p => p.id === 'mobs').turns[0];

      assert.equal(goblinTurn.canAttack, false, 'Mob canAttack becomes false after attack recorded');
      assert.equal(goblinTurn.actions.hasAttacked, true);
      assert.equal(goblinTurn.actions.spent, 1);
      assert.equal(goblinTurn.remainingActions, 1);
    });
  });

  await t.test('4. Initiative Removal & Manual Action Toggle in Combat Tracker', async (sub) => {
    await sub.test('CONFIG.Combat.initiative formula is null to disable d20 initiative rolling', () => {
      assert.equal(globalThis.CONFIG?.Combat?.initiative?.formula, null);
    });

    await sub.test('_onCreateDescendantDocuments auto-assigns phase initiative when combatants are added', async () => {
      const mob = new DCCActor({ type: 'npc', name: 'Orc' });
      const crawler = new DCCActor({ type: 'crawler', name: 'Katia' });
      const combat = new DCCCombat({
        id: 'combat-auto-init',
        combatants: [
          { id: 'c-orc', actorId: 'orc-1', actor: mob, name: 'Orc' },
          { id: 'c-katia', actorId: 'katia-1', actor: crawler, name: 'Katia' }
        ]
      });

      await combat._onCreateDescendantDocuments(combat, 'Combatant', combat.combatants, {}, {}, 'user-1');
      assert.equal(combat.combatants.find(c => c.id === 'c-orc').initiative, 20);
      assert.equal(combat.combatants.find(c => c.id === 'c-katia').initiative, 10);
    });

    await sub.test('manual toggle cycles combatant action between used and unused', async () => {
      const combat = new DCCCombat({
        id: 'combat-manual-toggle',
        combatants: [{ id: 'c-1', name: 'Crawler 1' }]
      });

      let actions = combat.getCombatantActions('c-1');
      assert.equal(actions.spent, 0);
      assert.equal(actions.max - actions.spent, 2);

      // 1. Toggle Action 1 to Used
      await combat.recordCombatantAction('c-1', { type: 'check', slotIndex: 0, label: 'Action 1' });
      actions = combat.getCombatantActions('c-1');
      assert.equal(actions.spent, 1);
      assert.equal(actions.max - actions.spent, 1);

      // 2. Toggle Action 1 back to Unused
      await combat.clearCombatantAction('c-1', 0);
      actions = combat.getCombatantActions('c-1');
      assert.equal(actions.spent, 0);
      assert.equal(actions.max - actions.spent, 2);
    });
  });

});
