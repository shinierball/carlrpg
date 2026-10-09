import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('Custom Weapon Associated Skills & Additive Damage (Boom Stick Scenario)', () => {
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

  it('1. Correctly classifies primary combat weapon skill (Shotgun) vs auxiliary passive skill (Aiming)', () => {
    const boomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        associatedSkills: ['Aiming', 'Shotgun'],
        damageParts: [{ id: 'p1', type: 'Fire', dice: '1d6', stat: '', value: 0 }]
      }
    }, crawler);
    crawler.items.push(boomStick);

    const shotgun = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        baseDamage: '1d10',
        stat: 'dex',
        damageStat: 'dex',
        damageType: 'Piercing',
        category: 'combat',
        isAttack: true,
        rankBreaks: {
          rank5: { damageDice: '+1d10' },
          rank10: { damageDice: '+1d10' }
        },
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const aiming = new DCCItem({
      name: 'Aiming',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        category: 'passive',
        tags: ['action.passive']
      }
    }, crawler);
    crawler.items.push(aiming);

    const resolved = crawler._resolveWeaponSkills(boomStick);
    assert.ok(resolved.matchingSkill, 'Must resolve a primary matching skill');
    assert.strictEqual(resolved.matchingSkill.name, 'Shotgun', 'Primary skill must be Shotgun, not Aiming');
    assert.strictEqual(resolved.skillRank, 10, 'Resolved skill rank must be 10');
    assert.strictEqual(resolved.auxiliarySkills.length, 1, 'Must have 1 auxiliary skill');
    assert.strictEqual(resolved.auxiliarySkills[0].name, 'Aiming', 'Auxiliary skill must be Aiming');
  });

  it('2. getAttackDamageParts yields additive formula: Shotgun base (3d10) + Boom Stick fire (1d6) + Aiming (3d4) + Rank 10 die', () => {
    const boomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        associatedSkills: ['Aiming', 'Shotgun'],
        damageParts: [{ id: 'fire-extra', type: 'Fire', dice: '1d6', stat: '', value: 0 }]
      }
    }, crawler);
    crawler.items.push(boomStick);

    const shotgun = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        baseDamage: '1d10',
        stat: 'dex',
        damageStat: 'dex',
        damageType: 'Piercing',
        category: 'combat',
        isAttack: true,
        rankBreaks: {
          rank5: { damageDice: '+1d10' },
          rank10: { damageDice: '+1d10' }
        },
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const aiming = new DCCItem({
      name: 'Aiming',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        category: 'passive',
        tags: ['action.passive']
      }
    }, crawler);
    crawler.items.push(aiming);

    const parts = crawler.getAttackDamageParts(boomStick);

    // 1. Base skill part: Shotgun Rank 10 base (1d10 + 1d10 + 1d10 = 3d10) + DEX mod
    const basePart = parts.find(p => p.id?.startsWith('skill-base'));
    assert.ok(basePart, 'Must include skill-base part');
    assert.strictEqual(basePart.dice, '3d10', 'Base dice scaled to 3d10 via Rank 5 and Rank 10 breaks');
    assert.strictEqual(basePart.type, 'Piercing');
    assert.strictEqual(basePart.stat, 'dex');
    assert.strictEqual(basePart.statMod, 4, 'DEX mod is 4');

    // 2. Weapon item damage part: 1d6 Fire added additively
    const weaponPart = parts.find(p => p.source === 'Boom Stick');
    assert.ok(weaponPart, 'Must include weapon damage part additively');
    assert.strictEqual(weaponPart.dice, '1d6');
    assert.strictEqual(weaponPart.type, 'Fire');

    // 3. Aiming auxiliary passive damage bonus: 3d4 at Rank 10
    const aimingPart = parts.find(p => p.id?.startsWith('aiming-bonus'));
    assert.ok(aimingPart, 'Must include aiming-bonus auxiliary part');
    assert.strictEqual(aimingPart.dice, '3d4', 'Aiming Rank 10 grants 3d4');

    // 4. Rank Damage Die for Rank 10: 1d10
    const rankDiePart = parts.find(p => p.id?.startsWith('rank-die'));
    assert.ok(rankDiePart, 'Must include Rank Damage Die part');
    assert.strictEqual(rankDiePart.dice, '1d10', 'Rank 10 damage die is 1d10');
  });

  it('3. Weapon attack profile synthesizes to-hit (Rank 10 + DEX 4 = 14) and formatted formula', () => {
    const boomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        associatedSkills: ['Aiming', 'Shotgun'],
        damageParts: [{ id: 'fire-extra', type: 'Fire', dice: '1d6', stat: '', value: 0 }]
      }
    }, crawler);
    crawler.items.push(boomStick);

    const shotgun = new DCCItem({
      name: 'Shotgun',
      type: 'skill',
      system: {
        rank: 10,
        modifiedRank: 10,
        baseDamage: '1d10',
        stat: 'dex',
        damageStat: 'dex',
        damageType: 'Piercing',
        category: 'combat',
        isAttack: true,
        rankBreaks: {
          rank5: { damageDice: '+1d10' },
          rank10: { damageDice: '+1d10' }
        },
        tags: ['weapon.shotgun', 'rule.requires-weapon']
      }
    }, crawler);
    crawler.items.push(shotgun);

    const attacks = crawler.getSynthesizedAttacks();
    const stickAttack = attacks.find(a => a.name === 'Boom Stick');
    assert.ok(stickAttack, 'Equipped Boom Stick must appear in synthesized attacks');
    assert.strictEqual(stickAttack.skillRank, 10, 'Attack skill rank must reflect Shotgun Rank 10');
    assert.strictEqual(stickAttack.toHitMod, 14, 'To-Hit must be DEX Mod (4) + Skill Rank (10) = 14');
    assert.strictEqual(stickAttack.displayToHit, 'DEX (10)');

    // Combined dice string should include Shotgun dice, Rank Die, and extra Fire dice
    assert.ok(stickAttack.combinedDice.includes('1d10'), 'Combined dice must include Shotgun base / rank dice');
    assert.ok(stickAttack.combinedDice.includes('1d6 Fire'), 'Combined dice must include Boom Stick 1d6 Fire');
  });

  it('4. Fallback when character has no associated skill: uses weapon own parts or damage dice', () => {
    const rawBoomStick = new DCCItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        weaponCategory: 'ranged',
        damageParts: [{ id: 'p1', type: 'Physical', dice: '2d8', stat: 'dex', value: 0 }]
      }
    }, crawler);
    crawler.items.push(rawBoomStick);

    const parts = crawler.getAttackDamageParts(rawBoomStick);
    assert.strictEqual(parts.length, 1);
    assert.strictEqual(parts[0].dice, '2d8');
    assert.strictEqual(parts[0].type, 'Physical');
    assert.strictEqual(parts[0].stat, 'dex');
    assert.strictEqual(parts[0].statMod, 4);
  });
});
