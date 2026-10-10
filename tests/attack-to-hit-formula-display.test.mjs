import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { prepareAttackDisplay } from '../src/sheets/crawler-sheet.mjs';

describe('Attack To-Hit Formula Display (next.md Requirement)', () => {
  let crawler;

  before(() => {
    CONFIG.Item.documentClass = DCCItem;
    CONFIG.Actor.documentClass = DCCActor;
  });

  beforeEach(() => {
    crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, mod: 4 },
          dex: { value: 14, mod: 4 },
          con: { value: 10, mod: 4 },
          int: { value: 10, mod: 4 },
          cha: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 }
        }
      }
    });
  });

  it('1. Generates accurate toHitFormula for trained weapon: 1d20 + total (e.g. 1d20 + 14)', () => {
    const shotgun = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const boomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        associatedSkills: ['Shotgun'],
        damageParts: [{ type: 'Fire', dice: '1d6', stat: '', value: 0 }]
      }
    }, crawler);
    crawler.items.push(boomStick);

    const profile = crawler._buildWeaponAttackProfile(boomStick);
    assert.ok(profile, 'Profile must be built');
    assert.strictEqual(profile.skillRank, 10, 'Rank should be 10');
    assert.strictEqual(profile.statMod, 4, 'DEX mod should be 4');
    assert.strictEqual(profile.toHitMod, 14, 'Total to-hit mod should be 14 (10 + 4)');
    assert.strictEqual(profile.toHitFormula, '1d20 + 14', 'To-hit formula must be 1d20 + 14');
  });

  it('2. Generates 2d20kl + mod for untrained weapon attack check with disadvantage', () => {
    const rawSword = new DCCItem({
      name: 'Excalibur',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'melee',
        damageParts: [{ type: 'Slashing', dice: '1d8', stat: 'str', value: 0 }]
      }
    }, crawler);
    crawler.items.push(rawSword);

    const profile = crawler._buildWeaponAttackProfile(rawSword);
    assert.ok(profile);
    assert.strictEqual(profile.skillRank, 0, 'Untrained weapon has rank 0');
    assert.strictEqual(profile.toHitFormula, '2d20kl + 4', 'Untrained weapon rolls 2d20kl + stat mod (4)');
  });

  it('3. Generates accurate toHitFormula for unarmed skill attack (Pugilism Rank 5: 1d20 + 8)', () => {
    // Set crawler DEX mod to 3 for this test
    crawler.system.abilities.dex.mod = 3;

    const pugilism = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weaponClass.unarmed']
      }
    }, crawler);
    crawler.items.push(pugilism);

    const profile = crawler._buildSkillAttackProfile(pugilism);
    assert.ok(profile);
    assert.strictEqual(profile.skillRank, 5);
    assert.strictEqual(profile.statMod, 3);
    assert.strictEqual(profile.toHitMod, 8);
    assert.strictEqual(profile.toHitFormula, '1d20 + 8');
  });

  it('4. prepareAttackDisplay in sheet context resolves custom weapon skill and sets toHitFormula', () => {
    const shotgun = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const boomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        associatedSkills: ['Shotgun'],
        damageParts: [{ type: 'Fire', dice: '1d6', stat: '', value: 0 }]
      }
    }, crawler);

    prepareAttackDisplay(boomStick, crawler);
    assert.strictEqual(boomStick.toHitRank, 10, 'prepareAttackDisplay must resolve Shotgun skill rank 10');
    assert.strictEqual(boomStick.statMod, 4, 'DEX mod is 4');
    assert.strictEqual(boomStick.toHitMod, 14, 'Total to-hit mod is 14');
    assert.strictEqual(boomStick.toHitFormula, '1d20 + 14', 'Sheet display to-hit formula must be 1d20 + 14');
  });

  it('5. Handles disadvantage from two-handed weapon wielded one-handed: 2d20kl + mod', () => {
    const greatsword = new DCCItem({
      name: 'Greatsword',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        wieldMode: 'two_handed_disadv_1h',
        hands: 1,
        damageParts: [{ type: 'Slashing', dice: '2d6', stat: 'str', value: 0 }]
      }
    }, crawler);
    crawler.items.push(greatsword);

    const swordSkill = new DCCItem({
      name: 'Greatsword',
      type: 'skill',
      system: {
        rank: 6,
        modifiedRank: 6,
        stat: 'str',
        category: 'combat',
        isAttack: true
      }
    }, crawler);
    crawler.items.push(swordSkill);

    const profile = crawler._buildWeaponAttackProfile(greatsword);
    assert.ok(profile);
    assert.strictEqual(profile.skillRank, 6);
    assert.strictEqual(profile.toHitMod, 10, 'STR mod 4 + Rank 6 = 10');
    assert.strictEqual(profile.toHitFormula, '2d20kl + 10', 'One-handed penalty produces 2d20kl + 10');
  });

  it('6. Incorporates Aiming auxiliary skill bonus when ranged attack is at disadvantage', () => {
    const bow = new DCCItem({
      name: 'Bow',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        damageParts: [{ type: 'Piercing', dice: '1d6', stat: 'dex', value: 0 }]
      }
    }, crawler);
    crawler.items.push(bow);

    const bowSkill = new DCCItem({
      name: 'Bow',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        stat: 'dex',
        category: 'combat',
        isAttack: true
      }
    }, crawler);
    crawler.items.push(bowSkill);

    const aimingSkill = new DCCItem({
      name: 'Aiming',
      type: 'skill',
      system: {
        rank: 3,
        modifiedRank: 3,
        category: 'passive',
        tags: ['action.passive']
      }
    }, crawler);
    crawler.items.push(aimingSkill);

    // Apply a disadvantage condition debuff to crawler
    const debuff = new DCCItem({
      name: 'Blindness',
      type: 'debuff',
      system: {
        disadvantage: true,
        active: true
      }
    }, crawler);
    crawler.items.push(debuff);

    const profile = crawler._buildWeaponAttackProfile(bow);
    assert.ok(profile);
    // Base: Rank 5 + DEX mod 4 = 9. Aiming Rank 3 bonus adds +3 when at disadvantage = 12.
    assert.strictEqual(profile.toHitFormula, '2d20kl + 12', 'Disadvantage formula includes Aiming bonus: 2d20kl + 12');
  });
});
