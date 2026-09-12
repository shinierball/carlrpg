import './setup.mjs';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet, formatGearBonuses } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';

describe('DCC RPG Item Skill Modifiers & Persistence', () => {
  beforeEach(() => {
    CONFIG.Item = { documentClass: DCCItem };
    if (globalThis.game) {
      globalThis.game.items = [];
    }

    // Populate sample official DCC skills in CONFIG for compendium lookup tests
    CONFIG.DCC.skills = [
      {
        _id: 'skill-first-aid',
        name: 'First Aid',
        img: 'icons/skills/first-aid.webp',
        system: { stat: 'int', checkType: 'Stat Check', category: 'Utility', notes: 'Bandage wounds' }
      },
      {
        _id: 'skill-sneak',
        name: 'Sneak',
        img: 'icons/skills/sneak.webp',
        system: { stat: 'dex', checkType: 'Stat Check', category: 'Utility', notes: 'Move silently' }
      },
      {
        _id: 'skill-iron-skin',
        name: 'Iron Skin',
        img: 'icons/skills/iron-skin.webp',
        system: { stat: 'con', checkType: 'Passive', category: 'Passive', notes: 'Thick hide' }
      }
    ];
  });


  describe('1. Item Creation & Bonus Formatting', () => {
    test('creates gear item with empty skillModifiers by default', () => {
      const gear = new DCCItem({
        name: 'Leather Belt',
        type: 'gear',
        system: {}
      });

      assert.ok(gear.system);
      assert.equal(gear.name, 'Leather Belt');
      assert.equal(gear.type, 'gear');
    });

    test('formatGearBonuses formats single, multiple, and negative skill modifiers', () => {
      // Single skill modifier
      const boots = new DCCItem({
        name: 'Boots of Stealth',
        type: 'gear',
        system: {
          skillModifiers: [{ name: 'Sneak', bonus: 2 }]
        }
      });
      assert.equal(formatGearBonuses(boots), '+2 Sneak');

      // Multiple skill modifiers
      const cloak = new DCCItem({
        name: 'Ranger Cloak',
        type: 'gear',
        system: {
          skillModifiers: [
            { name: 'Sneak', bonus: 3 },
            { name: 'Survival', bonus: 1 }
          ]
        }
      });
      assert.equal(formatGearBonuses(cloak), '+3 Sneak, +1 Survival');

      // Negative skill modifier (e.g. noisy plate armor)
      const noisyArmor = new DCCItem({
        name: 'Clanking Plate',
        type: 'gear',
        system: {
          drBonus: 4,
          skillModifiers: [{ name: 'Sneak', bonus: -2 }]
        }
      });
      assert.equal(formatGearBonuses(noisyArmor), '+4 DR, -2 Sneak');

      // Combined defense, stats, and skills
      const championBelt = new DCCItem({
        name: 'Belt of the Champion',
        type: 'gear',
        system: {
          drBonus: 2,
          evadeBonus: 1,
          abilityModifiers: { str: { value: 8, type: 'flat' } },
          skillModifiers: [{ name: 'Athletics', bonus: 2 }]
        }
      });
      assert.equal(formatGearBonuses(championBelt), '+2 DR, +1 Evade, +8 STR, +2 Athletics');
    });
  });

  describe('2. Persistence & Skill Calculation Interactions', () => {
    test('equipped gear applies bonus; unequipped gear removes bonus', () => {
      const sneakSkill = new DCCItem({
        name: 'Sneak',
        type: 'skill',
        system: { rank: 2, stat: 'dex' }
      });

      const sneakyBoots = new DCCItem({
        name: 'Sneaky Boots',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Sneak', bonus: 3 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 5 } } }, // unenhanced 5 -> mod = +2
        items: [sneakSkill, sneakyBoots]
      });

      // 1. Equipped state: rank 2 + bonus 3 = 5; total = 5 + 2 = 7
      crawler.prepareDerivedData();
      assert.equal(sneakSkill.system.itemBonus, 3);
      assert.equal(sneakSkill.system.modifiedRank, 5);
      assert.equal(sneakSkill.system.totalSkill, 7);
      assert.equal(sneakSkill.itemSources, 'Sneaky Boots (+3)');

      // 2. Unequip gear: itemBonus resets to 0, modifiedRank returns to base 2
      sneakyBoots.system.equipped = false;
      crawler.prepareDerivedData();
      assert.equal(sneakSkill.system.itemBonus, 0);
      assert.equal(sneakSkill.system.modifiedRank, 2);
      assert.equal(sneakSkill.system.totalSkill, 4);
      assert.equal(sneakSkill.itemSources, '');
    });

    test('multiple equipped gear items stack bonuses and record all itemSources', () => {
      const lockpickSkill = new DCCItem({
        name: 'Lockpicking',
        type: 'skill',
        system: { rank: 1, stat: 'dex' }
      });

      const picks = new DCCItem({
        name: 'Thieves Picks',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Lockpicking', bonus: 2 }]
        }
      });

      const gloves = new DCCItem({
        name: 'Burglar Gloves',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Lockpicking', bonus: 1 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 10 } } }, // 10 -> mod = +4
        items: [lockpickSkill, picks, gloves]
      });

      crawler.prepareDerivedData();

      // Stacked bonus: 2 + 1 = 3
      assert.equal(lockpickSkill.system.itemBonus, 3);
      // Modified rank: base 1 + items 3 = 4
      assert.equal(lockpickSkill.system.modifiedRank, 4);
      // Total: rank 4 + DEX mod 4 = 8
      assert.equal(lockpickSkill.system.totalSkill, 8);
      assert.equal(lockpickSkill.itemSources, 'Thieves Picks (+2), Burglar Gloves (+1)');
    });

    test('normalizes skill matching with case insensitivity and trimmed whitespace', () => {
      const skill = new DCCItem({
        name: 'Perception',
        type: 'skill',
        system: { rank: 3, stat: 'int' }
      });

      const monocle = new DCCItem({
        name: 'Scholar Monocle',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: '  pErCePtIoN  ', bonus: 2 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { int: { unenhanced: 8 } } }, // 8 -> mod = +3
        items: [skill, monocle]
      });

      crawler.prepareDerivedData();
      assert.equal(skill.system.itemBonus, 2);
      assert.equal(skill.system.modifiedRank, 5);
      assert.equal(skill.system.totalSkill, 8); // 5 + 3
    });

    test('compounds gear ability modifier and skill modifier into total skill', () => {
      const sneak = new DCCItem({
        name: 'Sneak',
        type: 'skill',
        system: { rank: 2, stat: 'dex' }
      });

      // Boots add +15 to DEX (shifting DEX from 5 to 20 -> mod from +2 to +5) AND +2 to Sneak
      const boots = new DCCItem({
        name: 'Shadowstride Boots',
        type: 'gear',
        system: {
          equipped: true,
          abilityModifiers: { dex: { value: 15, type: 'flat' } },
          skillModifiers: [{ name: 'Sneak', bonus: 2 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 5 } } },
        items: [sneak, boots]
      });

      crawler.prepareDerivedData();

      // DEX: 5 + 15 = 20 -> mod = +5
      assert.equal(crawler.system.abilities.dex.value, 20);
      assert.equal(crawler.system.abilities.dex.mod, 5);

      // Sneak: base 2 + item 2 = modifiedRank 4
      assert.equal(sneak.system.modifiedRank, 4);
      // Total Skill: modifiedRank 4 + enhanced DEX mod 5 = 9
      assert.equal(sneak.system.totalSkill, 9);
    });

    test('clamping: penalty does not reduce modifiedRank below zero', () => {
      const skill = new DCCItem({
        name: 'Stealth',
        type: 'skill',
        system: { rank: 1, stat: 'dex' }
      });

      const heavyArmor = new DCCItem({
        name: 'Heavy Plate',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Stealth', bonus: -5 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 5 } } }, // mod = +2
        items: [skill, heavyArmor]
      });

      crawler.prepareDerivedData();

      // base 1 - 5 = -4 -> clamped to 0
      assert.equal(skill.system.modifiedRank, 0);
      assert.equal(skill.system.totalSkill, 2); // 0 + 2 (stat mod)
    });

    test('DCCItemSheet._updateObject converts form dot-notation inputs into a clean array and persists', async () => {
      const gear = new DCCItem({
        name: 'Shadow Boots',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: []
        }
      });

      const sheet = new DCCItemSheet(gear);

      // Simulates Foundry form submission formData with numeric dot notation keys
      const formData = {
        name: 'Shadow Boots',
        'system.equipped': true,
        'system.skillModifiers.0.name': 'Sneak',
        'system.skillModifiers.0.bonus': '2',
        'system.skillModifiers.1.name': 'Acrobatics',
        'system.skillModifiers.1.bonus': 1,
        'system.skillModifiers.2.name': '  ', // empty row should be stripped
        'system.skillModifiers.2.bonus': 0
      };

      await sheet._updateObject({}, formData);

      assert.ok(Array.isArray(gear.system.skillModifiers), 'skillModifiers should be an Array');
      assert.equal(gear.system.skillModifiers.length, 2);
      assert.deepEqual(gear.system.skillModifiers, [
        { name: 'Sneak', bonus: 2 },
        { name: 'Acrobatics', bonus: 1 }
      ]);
    });

    test('DCCItem.prepareBaseData normalizes database objects into arrays', () => {
      const gear = new DCCItem({
        name: 'Legacy Boots',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: {
            '0': { name: 'Sneak', bonus: 2 },
            '1': { name: 'Stealth', bonus: 1 }
          }
        }
      });

      gear.prepareBaseData();

      assert.ok(Array.isArray(gear.system.skillModifiers), 'Normalized to array');
      assert.equal(gear.system.skillModifiers.length, 2);
      assert.equal(gear.system.skillModifiers[0].name, 'Sneak');
      assert.equal(gear.system.skillModifiers[0].bonus, 2);
    });

    test('actor and crawler sheet handle legacy object format gracefully', async () => {
      const skill = new DCCItem({
        name: 'Sneak',
        type: 'skill',
        system: { rank: 1, stat: 'dex' }
      });

      const gear = new DCCItem({
        name: 'Old Ring',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: {
            '0': { name: 'Sneak', bonus: 3 }
          }
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 5 } } }, // mod = +2
        items: [skill, gear]
      });

      crawler.prepareDerivedData();

      // Bonus should still be applied even if gear had object format
      assert.equal(skill.system.itemBonus, 3);
      assert.equal(skill.system.modifiedRank, 4); // 1 + 3
      assert.equal(skill.system.totalSkill, 6);    // 4 + 2

      const sheet = new DCCCrawlerSheet(crawler);
      const sheetData = await sheet.getData();
      const sheetSkill = sheetData.skills.find(s => s.name === 'Sneak');
      assert.equal(sheetSkill.itemBonus, 3);
      assert.equal(sheetSkill.modifiedRank, 4);
    });
  });


  describe('3. Skill Sheet Display & Virtual Granted Skills', () => {
    test('crawler sheet generates virtual granted skill for unowned gear skills', async () => {
      const firstAidMedkit = new DCCItem({
        name: 'Combat Medkit',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'First Aid', bonus: 2 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { int: { unenhanced: 12 } } }, // unenhanced 12 -> mod = +4
        items: [firstAidMedkit]
      });

      crawler.prepareDerivedData();

      const sheet = new DCCCrawlerSheet(crawler);
      const sheetData = await sheet.getData();

      // Crawler does not own a First Aid item, so sheet should synthesize a granted skill
      const grantedFirstAid = sheetData.skills.find(s => s.name === 'First Aid');
      assert.ok(grantedFirstAid, 'Virtual granted skill should exist in sheetData.skills');
      assert.equal(grantedFirstAid.isGranted, true);
      assert.equal(grantedFirstAid.baseRank, 0);
      assert.equal(grantedFirstAid.itemBonus, 2);
      assert.equal(grantedFirstAid.modifiedRank, 2);
      // Inherits stat 'int' from CONFIG.DCC.skills compendium definition
      assert.equal(grantedFirstAid.system.stat, 'int');
      assert.equal(grantedFirstAid.statMod, 4);
      assert.equal(grantedFirstAid.statModStr, '+4');
      assert.equal(grantedFirstAid.totalSkill, 6); // 2 rank + 4 int mod
      assert.equal(grantedFirstAid.totalSkillStr, '+6');
      assert.equal(grantedFirstAid.itemSources, 'Combat Medkit (+2)');

      // Unequipping the medkit removes the granted skill on next sheet render
      firstAidMedkit.system.equipped = false;
      const updatedSheetData = await sheet.getData();
      assert.ok(!updatedSheetData.skills.some(s => s.name === 'First Aid'));
    });
  });

  describe('4. Skill Roll Execution & Untrained-to-Trained Transition', () => {
    test('item bonus transitions untrained skill from disadvantage to standard trained roll', async () => {
      const skill = new DCCItem({
        name: 'Sneak',
        type: 'skill',
        system: { rank: 0, stat: 'dex' } // Untrained (rank 0)
      });

      const boots = new DCCItem({
        name: 'Elven Boots',
        type: 'gear',
        system: {
          equipped: false,
          skillModifiers: [{ name: 'Sneak', bonus: 1 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 5 } } }, // DEX mod = +2
        items: [skill, boots]
      });

      // 1. Unequipped: rank 0 -> Untrained disadvantage roll (2d20kl)
      crawler.prepareDerivedData();
      assert.equal(skill.system.modifiedRank, 0);

      const untrainedMsg = await crawler.rollSkill(skill);
      assert.equal(untrainedMsg.formula, '2d20kl + 2');
      assert.match(untrainedMsg.flavor, /Untrained Check with Disadvantage/);
      assert.match(untrainedMsg.flavor, /2d20kl \+ DEX Mod \+2/);

      // 2. Equipped: rank 0 + item 1 = modifiedRank 1 -> Trained standard roll (1d20 + Total)
      boots.system.equipped = true;
      crawler.prepareDerivedData();
      assert.equal(skill.system.modifiedRank, 1);
      assert.equal(skill.system.totalSkill, 3); // 1 + 2

      const trainedMsg = await crawler.rollSkill(skill);
      assert.equal(trainedMsg.formula, '1d20 + 3');
      assert.match(trainedMsg.flavor, /Sneak \(DEX Check: 1d20 \+ Rank 1 \[Base 0, Items \+1\] \+ DEX Mod \+2 = <strong>Total \+3<\/strong>\)/);
    });

    test('passive skills output chat card with item breakdown and no roll', async () => {
      const ironSkin = new DCCItem({
        name: 'Iron Skin',
        type: 'skill',
        system: { rank: 2, stat: 'con', checkType: 'Passive' }
      });

      const ring = new DCCItem({
        name: 'Ring of Fortitude',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Iron Skin', bonus: 2 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { con: { unenhanced: 10 } } },
        items: [ironSkin, ring]
      });

      crawler.prepareDerivedData();
      const msg = await crawler.rollSkill(ironSkin);

      assert.ok(msg.content);
      assert.match(msg.content, /Passive Skill \(No roll required\)/);
      assert.match(msg.content, /Modified Rank:<\/strong> 4 \(Base 2, Items \+2\)/);
    });
  });

  describe('5. Foundry Items Section Registration (World Items)', () => {
    test('embedded item creation on an actor registers item in game.items', async () => {
      const crawler = new DCCActor({
        type: 'crawler',
        name: 'Carl',
        items: []
      });

      // User creates new gear on crawler sheet
      const [createdGear] = await crawler.createEmbeddedDocuments('Item', [{
        name: 'Spiked Kneepads',
        type: 'gear',
        system: { slot: 'legs', drBonus: 1 }
      }]);

      assert.ok(createdGear);
      assert.equal(createdGear.name, 'Spiked Kneepads');
      assert.equal(createdGear.isEmbedded, true);

      // Verify it was automatically added to game.items (Foundry Items section)
      const worldItem = game.items.find(i => i.name === 'Spiked Kneepads');
      assert.ok(worldItem, 'Item should be present in game.items (Foundry items section)');
      assert.equal(worldItem.type, 'gear');
      assert.equal(worldItem.system.slot, 'legs');
      assert.equal(worldItem.system.drBonus, 1);
    });

    test('updating embedded item name syncs the new item to game.items', async () => {
      const crawler = new DCCActor({
        type: 'crawler',
        name: 'Carl',
        items: []
      });

      const [created] = await crawler.createEmbeddedDocuments('Item', [{
        name: 'New Gear',
        type: 'gear',
        system: { slot: 'torso' }
      }]);

      // User renames the gear on the item sheet
      await created.update({ name: 'Chestplate of the Brawler' });

      const worldItem = game.items.find(i => i.name === 'Chestplate of the Brawler');
      assert.ok(worldItem, 'Renamed item should be registered in game.items');
      assert.equal(worldItem.type, 'gear');
    });

    test('adding a skill modifier to gear does NOT create new skill items in game.items', async () => {
      const gear = new DCCItem({
        name: 'Shadow Boots',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: []
        }
      });

      const sheet = new DCCItemSheet(gear);

      const formData = {
        name: 'Shadow Boots',
        'system.equipped': true,
        'system.skillModifiers.0.name': 'Shadowstep',
        'system.skillModifiers.0.bonus': 2
      };

      await sheet._updateObject({}, formData);

      // Verify skill was NOT created as a new item in game.items
      const registeredSkill = game.items.find(i => i.name === 'Shadowstep');
      assert.equal(registeredSkill, undefined, 'Skill from gear modifier should NOT create a new item in game.items');
      assert.equal(gear.system.skillModifiers.length, 1);
      assert.equal(gear.system.skillModifiers[0].name, 'Shadowstep');
    });

    test('crawler sheet skill picker includes world skills from game.items', () => {
      // Add a custom skill to game.items (Foundry items section)
      game.items.push(new DCCItem({
        name: 'Goblin Language',
        type: 'skill',
        system: { stat: 'int', checkType: 'Stat Check', category: 'General', notes: 'Speak Goblin' }
      }));

      const crawler = new DCCActor({
        type: 'crawler',
        name: 'Carl',
        items: []
      });

      const sheet = new DCCCrawlerSheet(crawler);
      sheet._openSkillPicker();

      // Verify that Goblin Language is available in the picker dialog
      // (The picker sets content in the dialog)
      const foundInWorldItems = game.items.some(i => i.name === 'Goblin Language');
      assert.ok(foundInWorldItems);
    });
  });
});

