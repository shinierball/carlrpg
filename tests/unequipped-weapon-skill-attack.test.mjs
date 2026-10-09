import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('Unequipped Weapons & Weapon Skill Attack Filtering (next.md Requirement)', () => {
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
          str: { value: 12, mod: 4 },
          dex: { value: 14, mod: 4 },
          con: { value: 12, mod: 4 },
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

  it('1. Weapon skill requiring a weapon (Shotgun) is NOT synthesized as an attack when unequipped', () => {
    const shotgunSkill = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        baseDamage: '1d10',
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgunSkill);

    const attacks = crawler.getSynthesizedAttacks();
    const shotgunAtk = attacks.find(a => a.name.toLowerCase().includes('shotgun'));
    assert.strictEqual(shotgunAtk, undefined, 'Shotgun skill must NOT appear as attack when no weapon is equipped');
  });

  it('2. Unarmed / Natural skill (Pugilism) DOES synthesize as an attack without any equipped weapons', () => {
    const pugilismSkill = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        baseDamage: '1d2',
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weaponClass.unarmed', 'action.attack']
      }
    }, crawler);
    crawler.items.push(pugilismSkill);

    const attacks = crawler.getSynthesizedAttacks();
    const pugAtk = attacks.find(a => a.name.toLowerCase().includes('pugilism'));
    assert.ok(pugAtk, 'Pugilism must synthesize as an unarmed attack');
    assert.strictEqual(pugAtk.isSkillAttack, true);
    assert.strictEqual(pugAtk.skillRank, 5);
  });

  it('3. Stowed/unequipped weapon item (equipped: false) does NOT appear in synthesized attacks', () => {
    const stowedShotgun = new DCCItem({
      name: 'Stowed Shotgun',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: false,
        weaponCategory: 'ranged',
        damageParts: [{ type: 'Piercing', dice: '1d10', stat: 'dex', value: 0 }],
        tags: ['weapon.shotgun']
      }
    }, crawler);
    crawler.items.push(stowedShotgun);

    const shotgunSkill = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        baseDamage: '1d10',
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgunSkill);

    const attacks = crawler.getSynthesizedAttacks();
    assert.strictEqual(attacks.length, 0, 'No attacks should be present when weapon is unequipped');
  });

  it('4. Equipping weapon immediately reflects it in synthesized attacks roster with matching skill rank', () => {
    const shotgun = new DCCItem({
      name: 'Combat Shotgun',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        damageParts: [{ type: 'Piercing', dice: '1d10', stat: 'dex', value: 0 }],
        tags: ['weapon.shotgun']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const shotgunSkill = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 8,
        modifiedRank: 8,
        baseDamage: '1d10',
        stat: 'dex',
        category: 'combat',
        isAttack: true,
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgunSkill);

    const attacks = crawler.getSynthesizedAttacks();
    assert.strictEqual(attacks.length, 1, 'Equipped weapon should produce 1 attack');
    assert.strictEqual(attacks[0].name, 'Combat Shotgun');
    assert.strictEqual(attacks[0].skillRank, 8, 'Equipped weapon uses Shotgun skill rank 8');
    assert.strictEqual(attacks[0].toHitMod, 12, 'DEX mod (4) + Skill Rank (8) = 12');
  });
});
