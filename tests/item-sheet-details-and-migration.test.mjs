import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { BaseItemDataModel } from '../src/models/items/base-item-model.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { LootDataModel } from '../src/models/items/loot-model.mjs';
import { SkillDataModel } from '../src/models/items/skill-model.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';

test('DCC RPG Item Sheet Rendering & Legacy Schema Migration', async (t) => {
  await t.test('1. Item goldValue getter resolves safely on all item types without stack overflow', () => {
    const types = [
      'skill', 'attack', 'spell', 'gear', 'loot',
      'buff', 'debuff', 'race', 'class', 'deity',
      'sponsor', 'achievement'
    ];

    for (const type of types) {
      const item = new DCCItem({ name: `Test ${type}`, type });
      assert.doesNotThrow(() => {
        const val = item.goldValue;
        assert.equal(typeof val, 'number');
        assert.equal(val, 0);
      }, `Item type '${type}' must not throw recursion error when accessing goldValue`);
    }
  });

  await t.test('2. DCCItemSheet can be instantiated and getData() runs for all item types including skills', async () => {
    const types = [
      'skill', 'attack', 'spell', 'gear', 'loot',
      'buff', 'debuff', 'race', 'class', 'deity',
      'sponsor', 'achievement'
    ];

    for (const type of types) {
      const item = new DCCItem({ name: `Test ${type}`, type });
      const sheet = new DCCItemSheet(item);
      let context;
      await assert.doesNotReject(async () => {
        context = await sheet.getData();
      }, `DCCItemSheet.getData() must succeed for type '${type}'`);

      assert.ok(context, `Context returned for ${type}`);
      assert.equal(typeof context.goldValue, 'number', `context.goldValue must be a number for ${type}`);
      assert.equal(context.goldValue, 0);
    }
  });

  await t.test('3. Canonical compendium skill "Dirty Fighting" opens sheet with valid context', async () => {
    const dirtyFightingData = DCC_SKILLS.find(s => s.name === 'Dirty Fighting');
    assert.ok(dirtyFightingData, 'Dirty Fighting skill must exist in DCC_SKILLS');

    const skillItem = new DCCItem(structuredClone(dirtyFightingData));
    assert.equal(skillItem.name, 'Dirty Fighting');
    assert.equal(skillItem.type, 'skill');
    assert.equal(skillItem.goldValue, 0, 'Skill goldValue must safely evaluate to 0');

    const sheet = new DCCItemSheet(skillItem);
    const context = await sheet.getData();
    assert.ok(context, 'Sheet context must be successfully generated for Dirty Fighting');
    assert.equal(context.item.name, 'Dirty Fighting');
    assert.equal(context.goldValue, 0);
    assert.equal(context.system.skillType, 'Hand to Hand');
    assert.equal(context.system.checkType, "Pugilism / Wrasslin' Damage Effect, Passive");
  });

  await t.test('4. Legacy goldValue migration transparently maps to system.value on load & prepareBaseData', () => {
    // A legacy gear item where gold was stored under system.goldValue
    const legacyGearSource = {
      name: 'Old Broadsword',
      type: 'gear',
      system: {
        slot: 'hands',
        goldValue: 125
      }
    };

    // 4a. BaseItemDataModel.migrateData
    const migrated = GearDataModel.migrateData(structuredClone(legacyGearSource.system));
    assert.equal(migrated.value, 125, 'migrateData must map goldValue to value');

    // 4b. DCCItem document initialization and prepareBaseData
    const legacyItem = new DCCItem(legacyGearSource);
    assert.equal(legacyItem.goldValue, 125, 'legacyItem.goldValue getter must return 125');
    assert.equal(legacyItem.system.value, 125, 'legacyItem.system.value must be updated to 125');

    // 4c. Setting goldValue updates system.value
    legacyItem.goldValue = 250;
    assert.equal(legacyItem.system.value, 250);
    assert.equal(legacyItem.goldValue, 250);
  });

  await t.test('5. BaseItemDataModel without value property does not infinite loop on parent fallback', () => {
    const skillModel = new SkillDataModel();
    const mockParent = {
      system: skillModel
    };
    skillModel.parent = mockParent;

    assert.doesNotThrow(() => {
      const gv = skillModel.goldValue;
      assert.equal(gv, 0, 'skillModel.goldValue must return 0 without stack overflow');
    });
  });

  await t.test('6. Handlebars helpers ne and and operate correctly', () => {
    const neHelper = globalThis.Handlebars?.helpers?.ne;
    assert.equal(typeof neHelper, 'function', 'Handlebars ne helper must be registered');
    assert.equal(neHelper(1, 2), true);
    assert.equal(neHelper(1, 1), false);
    assert.equal(neHelper(false, false), false);
    assert.equal(neHelper('a', 'b'), true);
    assert.equal(neHelper('a', 'a'), false);

    const andHelper = globalThis.Handlebars?.helpers?.and;
    assert.equal(typeof andHelper, 'function', 'Handlebars and helper must be registered');
    assert.equal(andHelper(true, true), true);
    assert.equal(andHelper(true, false), false);
    assert.equal(andHelper(false, true), false);
    assert.equal(andHelper(true, true, true), true);
    assert.equal(andHelper(true, false, true), false);
  });
});
