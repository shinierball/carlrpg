import './setup.mjs';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';

describe('DCC RPG Skill Types & Compendium Dataset', () => {
  beforeEach(() => {
    CONFIG.Item = { documentClass: DCCItem };
    if (globalThis.game) {
      globalThis.game.items = [];
    }
  });

  describe('1. Compendium Dataset Integrity & Types', () => {
    test('compendium contains all major attack and utility skills from skills.txt', () => {
      assert.ok(DCC_SKILLS.length >= 70, `Expected at least 70 skills in dataset, got ${DCC_SKILLS.length}`);

      const names = new Set(DCC_SKILLS.map(s => s.name.toLowerCase()));

      // Strikes
      assert.ok(names.has('bite'));
      assert.ok(names.has('back claw'));
      assert.ok(names.has('slice attack'));

      // Bashing
      assert.ok(names.has('club'));
      assert.ok(names.has('improvised weapons'));
      assert.ok(names.has('warhammer'));

      // Edge
      assert.ok(names.has('axe'));
      assert.ok(names.has('dagger'));
      assert.ok(names.has('longsword'));
      assert.ok(names.has('rapier'));

      // Hand-to-Hand
      assert.ok(names.has('foot soldier'));
      assert.ok(names.has('noggin nocker'));
      assert.ok(names.has('pugilism'));
      assert.ok(names.has('unarmed combat'));
      assert.ok(names.has('wrasslin'));

      // Hand-to-Hand Damage Effects
      assert.ok(names.has('choke out'));
      assert.ok(names.has('dirty fighting'));
      assert.ok(names.has('iron punch'));
      assert.ok(names.has('powerful strike'));
      assert.ok(names.has('skullcracker'));
      assert.ok(names.has('smush'));
      assert.ok(names.has('toss'));

      // Ranged
      assert.ok(names.has('bow'));
      assert.ok(names.has('crossbow'));
      assert.ok(names.has('handgun'));
      assert.ok(names.has('javelin'));
      assert.ok(names.has('shotgun'));
      assert.ok(names.has('shuriken'));
      assert.ok(names.has('slingshot'));

      // Reach
      assert.ok(names.has('herding weapons'));
      assert.ok(names.has('lance'));
      assert.ok(names.has('polearm'));
      assert.ok(names.has('quarterstaff'));

      // Generic Weapon Group Skills
      assert.ok(names.has('edged weapons'));
      assert.ok(names.has('blunt weapons'));
      assert.ok(names.has('reach weapons'));

      // Sample of Utility Skills
      assert.ok(names.has('acute ears'));
      assert.ok(names.has('aiming'));
      assert.ok(names.has('alchemy'));
      assert.ok(names.has('ambush'));
      assert.ok(names.has('climbing'));
      assert.ok(names.has('deception'));
      assert.ok(names.has('detect lies'));
      assert.ok(names.has('detect trap'));
      assert.ok(names.has('dodge'));
      assert.ok(names.has('first aid'));
      assert.ok(names.has('hide in shadows'));
      assert.ok(names.has('lockpicking'));
      assert.ok(names.has('perception'));
      assert.ok(names.has('stealth'));
      assert.ok(names.has('tactics'));
      assert.ok(names.has('tracking'));
    });

    test('every skill in compendium has a valid type attribute and stats', () => {
      const validTypes = new Set(['Strike', 'Bashing', 'Edge', 'Hand to Hand', 'Ranged', 'Reach', 'Utility']);

      for (const skill of DCC_SKILLS) {
        assert.ok(skill.name, 'Skill must have a name');
        assert.ok(skill.system, `Skill ${skill.name} must have system`);
        const skillType = skill.system.skillType || skill.system.type;
        assert.ok(skillType, `Skill ${skill.name} must have skillType/type`);
        assert.ok(validTypes.has(skillType), `Skill ${skill.name} has unexpected type "${skillType}"`);
        assert.ok(['str', 'dex', 'con', 'int', 'cha'].includes(skill.system.stat), `Skill ${skill.name} has valid stat`);
      }
    });
  });

  describe('2. Generic Weapon Group Skill Cascading Bonuses', () => {
    test('trained Edged Weapons skill grants bonus to all Edge weapon skills', () => {
      const longsword = new DCCItem({
        name: 'Longsword',
        type: 'skill',
        system: { rank: 1, stat: 'str', skillType: 'Edge', type: 'Edge' }
      });

      const dagger = new DCCItem({
        name: 'Dagger',
        type: 'skill',
        system: { rank: 2, stat: 'dex', skillType: 'Edge', type: 'Edge' }
      });

      const edgedWeapons = new DCCItem({
        name: 'Edged Weapons',
        type: 'skill',
        system: { rank: 2, stat: 'str', skillType: 'Edge', type: 'Edge' }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { str: { unenhanced: 10 }, dex: { unenhanced: 10 } } },
        items: [longsword, dagger, edgedWeapons]
      });

      crawler.prepareDerivedData();

      // Longsword: base 1 + typeBonus 2 = modifiedRank 3
      assert.equal(longsword.system.typeBonus, 2);
      assert.equal(longsword.system.modifiedRank, 3);
      assert.match(longsword.typeSources, /Edged Weapons/);

      // Dagger: base 2 + typeBonus 2 = modifiedRank 4
      assert.equal(dagger.system.typeBonus, 2);
      assert.equal(dagger.system.modifiedRank, 4);

      // Edged Weapons itself should NOT receive the bonus recursively
      assert.equal(edgedWeapons.system.typeBonus || 0, 0);
      assert.equal(edgedWeapons.system.modifiedRank, 2);
    });

    test('trained Blunt Weapons grants bonus to Bashing skills', () => {
      const club = new DCCItem({
        name: 'Club',
        type: 'skill',
        system: { rank: 0, stat: 'str', skillType: 'Bashing', type: 'Bashing' }
      });

      const warhammer = new DCCItem({
        name: 'Warhammer',
        type: 'skill',
        system: { rank: 1, stat: 'str', skillType: 'Bashing', type: 'Bashing' }
      });

      const bluntWeapons = new DCCItem({
        name: 'Blunt Weapons',
        type: 'skill',
        system: { rank: 3, stat: 'str', skillType: 'Bashing', type: 'Bashing' }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { str: { unenhanced: 10 } } },
        items: [club, warhammer, bluntWeapons]
      });

      crawler.prepareDerivedData();

      // Club: base 0 + typeBonus 3 = modifiedRank 3
      assert.equal(club.system.typeBonus, 3);
      assert.equal(club.system.modifiedRank, 3);

      // Warhammer: base 1 + typeBonus 3 = modifiedRank 4
      assert.equal(warhammer.system.typeBonus, 3);
      assert.equal(warhammer.system.modifiedRank, 4);
    });

    test('trained Reach Weapons grants bonus to Reach skills', () => {
      const quarterstaff = new DCCItem({
        name: 'Quarterstaff',
        type: 'skill',
        system: { rank: 1, stat: 'str', skillType: 'Reach', type: 'Reach' }
      });

      const reachWeapons = new DCCItem({
        name: 'Reach Weapons',
        type: 'skill',
        system: { rank: 2, stat: 'str', skillType: 'Reach', type: 'Reach' }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { str: { unenhanced: 10 } } },
        items: [quarterstaff, reachWeapons]
      });

      crawler.prepareDerivedData();

      assert.equal(quarterstaff.system.typeBonus, 2);
      assert.equal(quarterstaff.system.modifiedRank, 3);
    });

    test('bonuses stack: base rank + item bonus + boon bonus + type bonus', () => {
      const longsword = new DCCItem({
        name: 'Longsword',
        type: 'skill',
        system: {
          rank: 2,
          boonBonus: 1,
          stat: 'str',
          skillType: 'Edge',
          type: 'Edge'
        }
      });

      const edgedWeapons = new DCCItem({
        name: 'Edged Weapons',
        type: 'skill',
        system: { rank: 2, stat: 'str', skillType: 'Edge', type: 'Edge' }
      });

      // Gear granting +1 to Longsword specifically
      const swordBelt = new DCCItem({
        name: 'Swordmaster Belt',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Longsword', bonus: 1 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { str: { unenhanced: 10 } } }, // mod = +4
        items: [longsword, edgedWeapons, swordBelt]
      });

      crawler.prepareDerivedData();

      // base 2 + item 1 + boon 1 + type 2 = modifiedRank 6
      // totalSkill = 6 + 4 (str mod) = 10
      assert.equal(longsword.system.itemBonus, 1);
      assert.equal(longsword.system.boonBonus, 1);
      assert.equal(longsword.system.typeBonus, 2);
      assert.equal(longsword.system.modifiedRank, 6);
      assert.equal(longsword.system.totalSkill, 10);
    });

    test('gear skillModifier referencing a type or generic skill name gives bonus to all member skills', () => {
      const axe = new DCCItem({
        name: 'Axe',
        type: 'skill',
        system: { rank: 1, stat: 'str', skillType: 'Edge', type: 'Edge' }
      });

      const rapier = new DCCItem({
        name: 'Rapier',
        type: 'skill',
        system: { rank: 1, stat: 'dex', skillType: 'Edge', type: 'Edge' }
      });

      // Ring providing bonus to "Edged Weapons"
      const ringOfEdged = new DCCItem({
        name: 'Blademaster Ring',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Edged Weapons', bonus: 2 }]
        }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { str: { unenhanced: 10 }, dex: { unenhanced: 10 } } },
        items: [axe, rapier, ringOfEdged]
      });

      crawler.prepareDerivedData();

      assert.equal(axe.system.typeBonus, 2);
      assert.equal(axe.system.modifiedRank, 3);
      assert.equal(rapier.system.typeBonus, 2);
      assert.equal(rapier.system.modifiedRank, 3);
    });
  });

  describe('3. Crawler Sheet Integration', () => {
    test('crawler sheet getData calculates typeBonus and formats breakdown', async () => {
      const dagger = new DCCItem({
        name: 'Dagger',
        type: 'skill',
        system: { rank: 1, stat: 'dex', skillType: 'Edge', type: 'Edge' }
      });

      const edgedWeapons = new DCCItem({
        name: 'Edged Weapons',
        type: 'skill',
        system: { rank: 3, stat: 'str', skillType: 'Edge', type: 'Edge' }
      });

      const crawler = new DCCActor({
        type: 'crawler',
        system: { abilities: { dex: { unenhanced: 10 }, str: { unenhanced: 10 } } },
        items: [dagger, edgedWeapons]
      });

      crawler.prepareDerivedData();

      const sheet = new DCCCrawlerSheet(crawler);
      const sheetData = await sheet.getData();

      const sheetDagger = sheetData.skills.find(s => s.name === 'Dagger');
      assert.ok(sheetDagger);
      assert.equal(sheetDagger.typeBonus, 3);
      assert.equal(sheetDagger.modifiedRank, 4);
    });
  });
});
