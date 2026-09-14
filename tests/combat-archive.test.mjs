import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCCombat, DCC_ACTION_TYPES } from '../src/documents/combat.mjs';
import { DCCCombatArchiveApp } from '../src/apps/combat-archive.mjs';
import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';

test('DCC RPG Combat History & Encounter Archive Suite', async (t) => {
  // Clear any existing archived combats in world storage
  await DCCCombat.clearArchivedCombats();

  const mockScene = { id: 'scene-dungeon-1', name: 'Level 1 Dungeon Floor' };
  globalThis.game.scenes = { get: (id) => (id === mockScene.id ? mockScene : null) };

  // Setup sample combat
  const mobCombatant = new Combatant({
    id: 'mob-goblin-1',
    name: 'Goblin Grunt',
    actorId: 'actor-goblin-1',
    actor: {
      id: 'actor-goblin-1',
      name: 'Goblin Grunt',
      type: 'npc',
      system: { attributes: { hp: { value: 15, max: 20 } } }
    }
  });

  const crawlerCombatant = new Combatant({
    id: 'crawler-carl-1',
    name: 'Carl',
    actorId: 'actor-carl-1',
    actor: {
      id: 'actor-carl-1',
      name: 'Carl',
      type: 'crawler',
      system: { attributes: { hp: { value: 35, max: 40 }, aiFavor: 3 } },
      async update(up) {
        if (up['system.attributes.aiFavor'] !== undefined) {
          this.system.attributes.aiFavor = up['system.attributes.aiFavor'];
        }
      }
    }
  });

  const combat = new DCCCombat({
    id: 'combat-test-archive-1',
    sceneId: mockScene.id,
    combatants: [mobCombatant, crawlerCombatant]
  });
  combat.scene = mockScene;
  combat.round = 1;

  await t.test('1. Round Snapshotting & Action History Preservation', async () => {
    // Record actions in Round 1
    await combat.recordCombatantAction(mobCombatant.id, { type: 'attack', label: 'Rusty Dagger' });
    await combat.recordCombatantAction(mobCombatant.id, { type: 'move', label: 'Advance 20ft' });

    await combat.recordCombatantAction(crawlerCombatant.id, { type: 'check', label: 'Perception' });

    const r1MobActions = combat.getCombatantActions(mobCombatant, 1);
    assert.equal(r1MobActions.spent, 2, 'Mob has spent 2 actions in Round 1');
    assert.equal(r1MobActions.hasAttacked, true, 'Mob has attacked in Round 1');

    const r1CrawlerActions = combat.getCombatantActions(crawlerCombatant, 1);
    assert.equal(r1CrawlerActions.spent, 1, 'Crawler has spent 1 action in Round 1');

    // Advance to Round 2
    await combat.nextRound();
    assert.equal(combat.round, 2, 'Combat advanced to Round 2');

    // Live actions for Round 2 should be fresh (0 spent)
    const r2MobActions = combat.getCombatantActions(mobCombatant);
    assert.equal(r2MobActions.spent, 0, 'Round 2 mob actions reset to 0 spent');
    assert.equal(r2MobActions.hasAttacked, false, 'Round 2 mob attack flag reset');

    // Historical query for Round 1 must return the snapshotted actions
    const r1MobHistory = combat.getCombatantActions(mobCombatant, 1);
    assert.equal(r1MobHistory.spent, 2, 'Round 1 history preserved mob 2 spent actions');
    assert.equal(r1MobHistory.hasAttacked, true, 'Round 1 history preserved mob attacked state');

    const r1CrawlerHistory = combat.getCombatantActions(crawlerCombatant, 1);
    assert.equal(r1CrawlerHistory.spent, 1, 'Round 1 history preserved crawler 1 spent action');
  });

  await t.test('2. Retroactive History Editing on Past Rounds', async () => {
    // Modify Round 1 retroactively while combat is in Round 2
    const res = await combat.recordCombatantAction(crawlerCombatant.id, {
      type: 'move',
      label: 'Retroactive Step'
    }, { round: 1 });

    assert.equal(res.success, true, 'Retroactive action recording succeeded');
    assert.equal(res.round, 1, 'Action was recorded against Round 1');

    // Verify Round 1 now has 2 actions spent
    const updatedR1Crawler = combat.getCombatantActions(crawlerCombatant, 1);
    assert.equal(updatedR1Crawler.spent, 2, 'Crawler now has 2 actions in Round 1 history');

    // Verify live Round 2 remains untouched (0 spent)
    const liveR2Crawler = combat.getCombatantActions(crawlerCombatant, 2);
    assert.equal(liveR2Crawler.spent, 0, 'Active round remains at 0 actions spent');

    // Clear retroactive slot in Round 1
    await combat.clearCombatantAction(crawlerCombatant.id, 1, { round: 1 });
    const clearedR1Crawler = combat.getCombatantActions(crawlerCombatant, 1);
    assert.equal(clearedR1Crawler.spent, 1, 'Slot cleared in Round 1 history');
  });

  await t.test('3. Encounter Archiving on Combat End', async () => {
    // Record an action in Round 2
    await combat.recordCombatantAction(mobCombatant.id, { type: 'move' });

    // Set metrics flag
    await combat.setFlag('carl-rpg', 'metrics', {
      totalDamageDealt: 120,
      mvp: { id: crawlerCombatant.id, name: 'Carl' },
      awards: [{ title: 'MVP', recipient: 'Carl' }]
    });

    // End combat (which triggers archiveCombat)
    await combat.endCombat();

    const archives = DCCCombat.getArchivedCombats();
    assert.equal(archives.length, 1, 'Encounter record archived to world storage');

    const record = archives[0];
    assert.equal(record.id, combat.id);
    assert.equal(record.totalRounds, 2);
    assert.equal(record.metrics.totalDamageDealt, 120);
    assert.equal(record.metrics.mvp.name, 'Carl');
    assert.equal(record.combatants.length, 2);

    // Verify roundHistory is preserved inside the archive
    assert.ok(record.roundHistory[1], 'Round 1 history preserved in archive');
    assert.ok(record.roundHistory[2], 'Round 2 history preserved in archive');
    assert.equal(record.roundHistory[1][mobCombatant.id].spent, 2);
  });

  await t.test('4. Archive Storage Management Methods', async () => {
    // Add second archive record
    const dummyRecord = {
      id: 'archived-custom-999',
      name: 'Boss Fight',
      totalRounds: 4,
      timestamp: Date.now(),
      combatants: [],
      roundHistory: {},
      metrics: { totalDamageDealt: 500 }
    };

    await DCCCombat.saveArchivedCombat(dummyRecord);
    let list = DCCCombat.getArchivedCombats();
    assert.equal(list.length, 2, 'Two battles in archive');

    // Delete one
    await DCCCombat.deleteArchivedCombat('archived-custom-999');
    list = DCCCombat.getArchivedCombats();
    assert.equal(list.length, 1, 'One battle remaining after delete');
    assert.equal(list[0].id, combat.id);

    // Clear all
    await DCCCombat.clearArchivedCombats();
    list = DCCCombat.getArchivedCombats();
    assert.equal(list.length, 0, 'Archive completely cleared');
  });

  await t.test('5. DCCCombatArchiveApp Data Formatting', async () => {
    // Save sample record
    const sampleRecord = {
      id: 'archive-app-test',
      name: 'Catacomb Skirmish',
      timestamp: Date.now(),
      dateString: '9/14/2026, 4:00 PM',
      totalRounds: 3,
      combatants: [
        { id: 'c-mob-1', name: 'Skeleton', isMob: true, hp: 10, maxHp: 10 },
        { id: 'c-crawler-1', name: 'Carl', isMob: false, hp: 35, maxHp: 40 }
      ],
      roundHistory: {
        1: {
          'c-mob-1': { max: 2, spent: 1, slots: [{ label: 'Strike', icon: 'fa-solid fa-burst', isAttack: true }] },
          'c-crawler-1': { max: 2, spent: 2, slots: [{ label: 'Dash' }, { label: 'Slash' }] }
        },
        2: {
          'c-mob-1': { max: 2, spent: 2, slots: [{ label: 'Move' }, { label: 'Bite' }] },
          'c-crawler-1': { max: 3, spent: 1, bonusActionGranted: true, slots: [{ label: 'Cast' }] }
        }
      },
      metrics: {
        totalDamageDealt: 45,
        mvp: { name: 'Carl' },
        awards: [{ title: 'MVP', recipient: 'Carl' }]
      }
    };

    await DCCCombat.saveArchivedCombat(sampleRecord);

    const app = new DCCCombatArchiveApp({ combatId: 'archive-app-test', round: 1 });
    const data = await app.getData();

    assert.equal(data.hasCombats, true);
    assert.equal(data.selectedCombat.name, 'Catacomb Skirmish');
    assert.equal(data.selectedRound, 1);
    assert.equal(data.roundsList.length, 3);
    assert.equal(data.mobCombatants.length, 1);
    assert.equal(data.crawlerCombatants.length, 1);

    // Verify mob slots in round 1
    const mobData = data.mobCombatants[0];
    assert.equal(mobData.roundActions.spent, 1);
    assert.equal(mobData.slotList[0].filled, true);
    assert.equal(mobData.slotList[0].isAttack, true);
    assert.equal(mobData.slotList[1].filled, false);

    // Test switching to round 2
    app.selectedRound = 2;
    const r2Data = await app.getData();
    assert.equal(r2Data.selectedRound, 2);
    const crawlerR2 = r2Data.crawlerCombatants[0];
    assert.equal(crawlerR2.roundActions.max, 3);
    assert.equal(crawlerR2.slotList.length, 3);
  });

  await t.test('6. DCCCombatTracker In-Tracker Stepper & History Mode', async () => {
    const liveCombat = new DCCCombat({
      id: 'combat-live-stepper-1',
      combatants: [mobCombatant, crawlerCombatant]
    });
    liveCombat.round = 3;

    const tracker = new DCCCombatTracker();
    tracker.viewed = liveCombat;

    // Default: views live round 3
    let trackerData = await tracker.getData();
    assert.equal(trackerData.round, 3);
    assert.equal(trackerData.viewedRound, 3);
    assert.equal(trackerData.isViewingHistory, false);
    assert.equal(trackerData.canStepPrev, true);
    assert.equal(trackerData.canStepNext, false);

    // Step back to Round 1
    tracker.viewedRound = 1;
    trackerData = await tracker.getData();
    assert.equal(trackerData.viewedRound, 1);
    assert.equal(trackerData.isViewingHistory, true, 'isViewingHistory is true when viewedRound !== round');
    assert.equal(trackerData.canStepPrev, false, 'canStepPrev is false at Round 1');
    assert.equal(trackerData.canStepNext, true, 'canStepNext is true at Round 1');
  });
});
