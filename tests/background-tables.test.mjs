import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import './setup.mjs';
import {
  DCC_PAST_TRAUMAS,
  DCC_LOOSE_ENDS,
  DCC_REGRETS,
  DCC_BACKGROUND_TABLES,
  getBackgroundTable,
  rollBackgroundTable,
  createBackgroundRollTableData,
  ensureBackgroundTables
} from '../src/data/background-tables.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';
import { generateRandomCrawler } from '../src/data/crawler-creation.mjs';
import { DCCActor } from '../src/documents/actor.mjs';

describe('DCC RPG Crawler Background Rollable Tables Subsystem', () => {

  describe('1. Background Tables Dataset Integrity (Tables 11, 12, 13)', () => {
    test('Table 11: Past Traumas contains exactly 12 official entries with correct text', () => {
      assert.equal(DCC_PAST_TRAUMAS.length, 12, 'Table 11 must have 12 items');
      assert.equal(DCC_PAST_TRAUMAS[0].roll, 1);
      assert.equal(DCC_PAST_TRAUMAS[0].text, 'I was abused by someone I trusted.');
      assert.equal(DCC_PAST_TRAUMAS[1].roll, 2);
      assert.equal(DCC_PAST_TRAUMAS[1].text, 'I was in a terrible accident.');
      assert.equal(DCC_PAST_TRAUMAS[2].roll, 3);
      assert.equal(DCC_PAST_TRAUMAS[2].text, 'I witnessed a death.');
      assert.equal(DCC_PAST_TRAUMAS[3].roll, 4);
      assert.equal(DCC_PAST_TRAUMAS[3].text, 'I was betrayed by a family member, friend, or lover.');
      assert.equal(DCC_PAST_TRAUMAS[4].roll, 5);
      assert.equal(DCC_PAST_TRAUMAS[4].text, 'I was abandoned by one or more parents.');
      assert.equal(DCC_PAST_TRAUMAS[5].roll, 6);
      assert.equal(DCC_PAST_TRAUMAS[5].text, 'I have a fear of open spaces.');
      assert.equal(DCC_PAST_TRAUMAS[6].roll, 7);
      assert.equal(DCC_PAST_TRAUMAS[6].text, 'I have a fear of the dark or being alone.');
      assert.equal(DCC_PAST_TRAUMAS[7].roll, 8);
      assert.equal(DCC_PAST_TRAUMAS[7].text, 'My home burned down.');
      assert.equal(DCC_PAST_TRAUMAS[8].roll, 9);
      assert.equal(DCC_PAST_TRAUMAS[8].text, 'I was falsely accused of a betrayal or crime.');
      assert.equal(DCC_PAST_TRAUMAS[9].roll, 10);
      assert.equal(DCC_PAST_TRAUMAS[9].text, 'I was deeply humiliated by a family member, friend, or lover.');
      assert.equal(DCC_PAST_TRAUMAS[10].roll, 11);
      assert.equal(DCC_PAST_TRAUMAS[10].text, 'I let someone take the blame for something terrible that I did.');
      assert.equal(DCC_PAST_TRAUMAS[11].roll, 12);
      assert.equal(DCC_PAST_TRAUMAS[11].text, 'I have a fear of heights.');
    });

    test('Table 12: Loose Ends contains exactly 12 official entries with correct text', () => {
      assert.equal(DCC_LOOSE_ENDS.length, 12, 'Table 12 must have 12 items');
      assert.equal(DCC_LOOSE_ENDS[0].roll, 1);
      assert.equal(DCC_LOOSE_ENDS[0].text, 'I never finished high school or my college degree.');
      assert.equal(DCC_LOOSE_ENDS[1].roll, 2);
      assert.equal(DCC_LOOSE_ENDS[1].text, 'I was about to open a restaurant or other business.');
      assert.equal(DCC_LOOSE_ENDS[2].roll, 3);
      assert.equal(DCC_LOOSE_ENDS[2].text, 'I didn’t finish writing my novel.');
      assert.equal(DCC_LOOSE_ENDS[3].roll, 4);
      assert.equal(DCC_LOOSE_ENDS[3].text, 'A family member, friend, or lover recently died, but I couldn’t say my goodbyes.');
      assert.equal(DCC_LOOSE_ENDS[4].roll, 5);
      assert.equal(DCC_LOOSE_ENDS[4].text, 'I was on the verge of inventing or discovering something.');
      assert.equal(DCC_LOOSE_ENDS[5].roll, 6);
      assert.equal(DCC_LOOSE_ENDS[5].text, 'I made a promise that I might no longer be able to fulfill.');
      assert.equal(DCC_LOOSE_ENDS[6].roll, 7);
      assert.equal(DCC_LOOSE_ENDS[6].text, 'My collection was almost complete.');
      assert.equal(DCC_LOOSE_ENDS[7].roll, 8);
      assert.equal(DCC_LOOSE_ENDS[7].text, 'I was about to perform for the first time when the collapse happened.');
      assert.equal(DCC_LOOSE_ENDS[8].roll, 9);
      assert.equal(DCC_LOOSE_ENDS[8].text, 'I wanted to dump my partner, but…');
      assert.equal(DCC_LOOSE_ENDS[9].roll, 10);
      assert.equal(DCC_LOOSE_ENDS[9].text, 'I was just about to buy or finish renovating my home.');
      assert.equal(DCC_LOOSE_ENDS[10].roll, 11);
      assert.equal(DCC_LOOSE_ENDS[10].text, 'I never sent that letter to a family member, friend, or loved one.');
      assert.equal(DCC_LOOSE_ENDS[11].roll, 12);
      assert.equal(DCC_LOOSE_ENDS[11].text, 'I never got to travel to my dream destination.');
    });

    test('Table 13: Regrets contains exactly 12 official entries with correct text', () => {
      assert.equal(DCC_REGRETS.length, 12, 'Table 13 must have 12 items');
      assert.equal(DCC_REGRETS[0].roll, 1);
      assert.equal(DCC_REGRETS[0].text, 'I didn’t ask them to marry me.');
      assert.equal(DCC_REGRETS[1].roll, 2);
      assert.equal(DCC_REGRETS[1].text, 'I turned down the perfect job.');
      assert.equal(DCC_REGRETS[2].roll, 3);
      assert.equal(DCC_REGRETS[2].text, 'I stayed quiet when I shouldn’t have.');
      assert.equal(DCC_REGRETS[3].roll, 4);
      assert.equal(DCC_REGRETS[3].text, 'I chose my own safety when I should have leapt into action.');
      assert.equal(DCC_REGRETS[4].roll, 5);
      assert.equal(DCC_REGRETS[4].text, 'I never said goodbye.');
      assert.equal(DCC_REGRETS[5].roll, 6);
      assert.equal(DCC_REGRETS[5].text, 'I spent way too much time on something pointless.');
      assert.equal(DCC_REGRETS[6].roll, 7);
      assert.equal(DCC_REGRETS[6].text, 'I did something illegal, immoral, and probably both.');
      assert.equal(DCC_REGRETS[7].roll, 8);
      assert.equal(DCC_REGRETS[7].text, 'I lied to avoid an event important to those close to me.');
      assert.equal(DCC_REGRETS[8].roll, 9);
      assert.equal(DCC_REGRETS[8].text, 'I kept a secret that hurt someone badly.');
      assert.equal(DCC_REGRETS[9].roll, 10);
      assert.equal(DCC_REGRETS[9].text, 'I didn’t apologize for something terrible that I did.');
      assert.equal(DCC_REGRETS[10].roll, 11);
      assert.equal(DCC_REGRETS[10].text, 'I abandoned someone when they needed me the most.');
      assert.equal(DCC_REGRETS[11].roll, 12);
      assert.equal(DCC_REGRETS[11].text, 'I trusted the wrong people.');
    });

    test('DCC_BACKGROUND_TABLES registers all three tables with 1d12 formula and metadata', () => {
      assert.ok(DCC_BACKGROUND_TABLES.pastTrauma);
      assert.equal(DCC_BACKGROUND_TABLES.pastTrauma.tableNumber, 11);
      assert.equal(DCC_BACKGROUND_TABLES.pastTrauma.formula, '1d12');

      assert.ok(DCC_BACKGROUND_TABLES.looseEnds);
      assert.equal(DCC_BACKGROUND_TABLES.looseEnds.tableNumber, 12);
      assert.equal(DCC_BACKGROUND_TABLES.looseEnds.formula, '1d12');

      assert.ok(DCC_BACKGROUND_TABLES.regrets);
      assert.equal(DCC_BACKGROUND_TABLES.regrets.tableNumber, 13);
      assert.equal(DCC_BACKGROUND_TABLES.regrets.formula, '1d12');
    });
  });

  describe('2. Resolution & Rolling Functions', () => {
    test('getBackgroundTable resolves by key, table number, or title', () => {
      assert.equal(getBackgroundTable('pastTrauma')?.tableNumber, 11);
      assert.equal(getBackgroundTable(11)?.tableNumber, 11);
      assert.equal(getBackgroundTable('11')?.tableNumber, 11);
      assert.equal(getBackgroundTable('Table 11: Past Traumas')?.tableNumber, 11);

      assert.equal(getBackgroundTable('looseEnds')?.tableNumber, 12);
      assert.equal(getBackgroundTable(12)?.tableNumber, 12);
      assert.equal(getBackgroundTable('12')?.tableNumber, 12);

      assert.equal(getBackgroundTable('regrets')?.tableNumber, 13);
      assert.equal(getBackgroundTable(13)?.tableNumber, 13);
      assert.equal(getBackgroundTable('13')?.tableNumber, 13);

      assert.equal(getBackgroundTable('nonexistent'), null);
    });

    test('rollBackgroundTable with explicit roll returns exact match', async () => {
      const res = await rollBackgroundTable('pastTrauma', { roll: 8 });
      assert.equal(res.roll, 8);
      assert.equal(res.text, 'My home burned down.');
      assert.equal(res.tableName, 'Table 11: Past Traumas');

      const loose = await rollBackgroundTable('looseEnds', { roll: 3 });
      assert.equal(loose.roll, 3);
      assert.equal(loose.text, 'I didn’t finish writing my novel.');

      const regret = await rollBackgroundTable('regrets', { roll: 1 });
      assert.equal(regret.roll, 1);
      assert.equal(regret.text, 'I didn’t ask them to marry me.');
    });

    test('rollBackgroundTable without explicit roll rolls within 1..12 range', async () => {
      for (let i = 0; i < 20; i++) {
        const res = await rollBackgroundTable('pastTrauma');
        assert.ok(res.roll >= 1 && res.roll <= 12, `Roll ${res.roll} should be between 1 and 12`);
        assert.ok(res.text && typeof res.text === 'string');
      }
    });

    test('rollBackgroundTable throws error on invalid table key', async () => {
      await assert.rejects(async () => {
        await rollBackgroundTable('invalid_key');
      }, /Unknown background table/);
    });
  });

  describe('3. Foundry RollTable Schema & Initialization', () => {
    test('createBackgroundRollTableData generates valid RollTable document payload', () => {
      for (const key of ['pastTrauma', 'looseEnds', 'regrets']) {
        const payload = createBackgroundRollTableData(key);
        assert.ok(payload.name.startsWith('Table '));
        assert.equal(payload.formula, '1d12');
        assert.equal(payload.img, 'icons/svg/d20-grey.svg');
        assert.equal(payload.replacement, true);
        assert.equal(payload.displayRoll, true);
        assert.equal(payload.results.length, 12);
        assert.deepEqual(payload.results[0].range, [1, 1]);
        assert.deepEqual(payload.results[11].range, [12, 12]);
        assert.equal(payload.flags['carl-rpg'].tableKey, key);

        // Crucial Foundry Schema Validation assertions:
        for (const res of payload.results) {
          assert.equal(res.type, 0, 'TableResult type must be 0 (CONST.TABLE_RESULT_TYPES.TEXT), not 1 (DOCUMENT)');
          assert.equal(res._id, undefined, 'Must not provide invalid custom _id so Foundry auto-generates 16-char ID');
          assert.equal(res.img, 'icons/svg/d20-black.svg');
          assert.equal(res.documentCollection, null);
          assert.equal(res.documentId, null);
          assert.equal(res.weight, 1);
          assert.equal(res.drawn, false);
          assert.ok(typeof res.text === 'string' && res.text.length > 0);
        }
      }
    });

    test('ensureBackgroundTables creates world tables when RollTable class is available', async () => {
      if (!globalThis.game) globalThis.game = {};
      if (!globalThis.game.tables) globalThis.game.tables = [];
      globalThis.game.user = { id: 'gm-user', isGM: true };

      globalThis.game.tables = [];
      const tables = await ensureBackgroundTables();
      assert.equal(tables.length, 3, 'Should ensure all 3 background tables exist');

      // Calling again should not duplicate tables
      const secondCall = await ensureBackgroundTables();
      assert.equal(secondCall.length, 3);
      assert.equal(globalThis.game.tables.length, 3);
    });

    test('ensureBackgroundTables populates results when existing table is empty', async () => {
      globalThis.game.user = { id: 'gm-user', isGM: true };
      const emptyTable = new globalThis.RollTable({
        name: 'Table 11: Past Traumas',
        results: [],
        flags: { 'carl-rpg': { tableKey: 'pastTrauma', tableNumber: 11 } }
      });
      globalThis.game.tables = [emptyTable];

      const tables = await ensureBackgroundTables();
      const ptTable = tables.find(t => t.name === 'Table 11: Past Traumas');
      assert.ok(ptTable, 'Found past trauma table');
      assert.equal(ptTable.results.length, 12, 'Empty table should be populated with 12 TableResults');
    });

    test('ensureBackgroundTables returns early without creating tables if user is not GM', async () => {
      globalThis.game.user = { id: 'player-user', isGM: false };
      globalThis.game.tables = [];

      const tables = await ensureBackgroundTables();
      assert.equal(tables.length, 0);
      assert.equal(globalThis.game.tables.length, 0);

      // Restore GM state
      globalThis.game.user = { id: 'gm-user', isGM: true };
    });
  });

  describe('4. Character Creator (DCCCrawlerCreatorApp) Integration', () => {
    test('constructor accepts and stores pastTrauma, looseEnds, regrets', () => {
      const app = new DCCCrawlerCreatorApp({
        pastTrauma: 'Witnessed a car crash',
        looseEnds: 'Unfinished project',
        regrets: 'Never said goodbye'
      });

      assert.equal(app.pastTrauma, 'Witnessed a car crash');
      assert.equal(app.looseEnds, 'Unfinished project');
      assert.equal(app.regrets, 'Never said goodbye');
    });

    test('getData returns backgroundTables metadata, options, and current values', async () => {
      const app = new DCCCrawlerCreatorApp({
        pastTrauma: 'I was in a terrible accident.',
        looseEnds: 'My collection was almost complete.',
        regrets: 'I trusted the wrong people.'
      });

      const data = await app.getData();
      assert.equal(data.pastTrauma, 'I was in a terrible accident.');
      assert.equal(data.looseEnds, 'My collection was almost complete.');
      assert.equal(data.regrets, 'I trusted the wrong people.');

      assert.ok(data.backgroundTables);
      assert.ok(data.backgroundTables.pastTrauma);
      assert.ok(data.backgroundTables.looseEnds);
      assert.ok(data.backgroundTables.regrets);

      const traumaOpt = data.backgroundTables.pastTrauma.options.find(o => o.roll === 2);
      assert.equal(traumaOpt.selected, true, 'Matching option should be selected');

      const looseOpt = data.backgroundTables.looseEnds.options.find(o => o.roll === 7);
      assert.equal(looseOpt.selected, true, 'Matching loose end should be selected');

      const regretOpt = data.backgroundTables.regrets.options.find(o => o.roll === 12);
      assert.equal(regretOpt.selected, true, 'Matching regret should be selected');
    });

    test('generateRandomCrawler populates valid background traits', () => {
      const crawler = generateRandomCrawler('human', '1st Floor');
      assert.ok(crawler.pastTrauma && crawler.pastTrauma.length > 0, 'Past trauma must be populated');
      assert.ok(crawler.looseEnds && crawler.looseEnds.length > 0, 'Loose ends must be populated');
      assert.ok(crawler.regrets && crawler.regrets.length > 0, 'Regrets must be populated');

      assert.ok(DCC_PAST_TRAUMAS.some(t => t.text === crawler.pastTrauma));
      assert.ok(DCC_LOOSE_ENDS.some(l => l.text === crawler.looseEnds));
      assert.ok(DCC_REGRETS.some(r => r.text === crawler.regrets));
    });

    test('createCrawler persists background traits into Actor system.details', async () => {
      const app = new DCCCrawlerCreatorApp({
        name: 'Trauma Tester',
        species: 'human',
        stats: { str: 5, dex: 4, con: 6, int: 2, cha: 3 },
        pastTrauma: 'I have a fear of open spaces.',
        looseEnds: 'I didn’t finish writing my novel.',
        regrets: 'I stayed quiet when I shouldn’t have.'
      });

      const actor = await app.createCrawler();
      assert.ok(actor, 'Actor should be created');
      assert.equal(actor.system.details.pastTrauma, 'I have a fear of open spaces.');
      assert.equal(actor.system.details.looseEnds, 'I didn’t finish writing my novel.');
      assert.equal(actor.system.details.regrets, 'I stayed quiet when I shouldn’t have.');
    });
  });

  describe('5. Character Sheet Manual Editability & Creative Freedom', () => {
    test('actor system.details fields remain freely editable with custom text', async () => {
      const actor = await DCCActor.create({
        name: 'Creative Crawler',
        type: 'crawler',
        system: {
          details: {
            pastTrauma: 'Initial trauma from table',
            looseEnds: 'Initial loose end',
            regrets: 'Initial regret'
          }
        }
      });

      assert.equal(actor.system.details.pastTrauma, 'Initial trauma from table');

      // User manually customizes on the character sheet
      await actor.update({
        'system.details.pastTrauma': 'Custom trauma: Watched the city collapse while looking for Princess Donut.',
        'system.details.looseEnds': 'Custom loose end: Left the oven on back in apartment 4B.',
        'system.details.regrets': 'Custom regret: Didn’t put on pants before running outside in the snow.'
      });

      assert.equal(actor.system.details.pastTrauma, 'Custom trauma: Watched the city collapse while looking for Princess Donut.');
      assert.equal(actor.system.details.looseEnds, 'Custom loose end: Left the oven on back in apartment 4B.');
      assert.equal(actor.system.details.regrets, 'Custom regret: Didn’t put on pants before running outside in the snow.');
    });

    test('rolling background table can append or update actor fields without clearing creative additions', async () => {
      const actor = await DCCActor.create({
        name: 'Append Crawler',
        type: 'crawler',
        system: {
          details: {
            pastTrauma: 'Player custom note: Surviving the first night.',
            looseEnds: '',
            regrets: ''
          }
        }
      });

      const rolled = await rollBackgroundTable('pastTrauma', { roll: 12 });
      const current = actor.system.details.pastTrauma;
      const updated = current ? `${current}\n${rolled.text}` : rolled.text;

      await actor.update({ 'system.details.pastTrauma': updated });

      assert.ok(actor.system.details.pastTrauma.includes('Player custom note: Surviving the first night.'));
      assert.ok(actor.system.details.pastTrauma.includes('I have a fear of heights.'));
    });
  });
});
