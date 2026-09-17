import './setup.mjs';
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

import {
  SkillDataModel,
  AttackDataModel,
  SpellDataModel,
  GearDataModel,
  BuffDataModel,
  DebuffDataModel,
  LootDataModel,
  RaceDataModel,
  ClassDataModel,
  DeityDataModel,
  SponsorDataModel
} from '../src/models/index.mjs';

import { DCCItem } from '../src/documents/item.mjs';
import { MockItem } from './setup.mjs';

describe('DCC RPG - Phase 1: Item System Data Models', () => {
  before(async () => {
    // Register item data models to CONFIG.Item.dataModels
    CONFIG.Item.dataModels = {
      skill: SkillDataModel,
      attack: AttackDataModel,
      spell: SpellDataModel,
      gear: GearDataModel,
      buff: BuffDataModel,
      debuff: DebuffDataModel,
      loot: LootDataModel,
      race: RaceDataModel,
      class: ClassDataModel,
      deity: DeityDataModel,
      sponsor: SponsorDataModel
    };
  });

  it('1. Registers all 11 canonical Item Data Models under CONFIG.Item.dataModels', () => {
    const registered = CONFIG.Item.dataModels;
    const requiredTypes = [
      'skill', 'attack', 'spell', 'gear', 'buff', 'debuff', 'loot', 'race', 'class', 'deity', 'sponsor'
    ];
    for (const type of requiredTypes) {
      assert.ok(registered[type], `CONFIG.Item.dataModels must include "${type}"`);
    }
  });

  it('2. SkillDataModel initializes defaults, validates fields, and derives totalRank', () => {
    const defaultSkill = new SkillDataModel();
    assert.equal(defaultSkill.rank, 1);
    assert.equal(defaultSkill.stat, 'str');
    assert.equal(defaultSkill.skillType, 'Utility');
    assert.equal(defaultSkill.type, 'Utility');
    assert.equal(defaultSkill.checkType, 'Stat Check');
    assert.equal(defaultSkill.boonBonus, 0);
    assert.equal(defaultSkill.itemBonus, 0);
    assert.equal(defaultSkill.typeBonus, 0);
    assert.equal(defaultSkill.totalRank, 1);
    assert.deepEqual(defaultSkill.damageModifiers, []);

    // Custom data with stacked bonuses
    const trainedSkill = new SkillDataModel({
      rank: 4,
      stat: 'dex',
      boonBonus: 1,
      itemBonus: 2,
      typeBonus: 1,
      damageModifiers: [{ type: 'Piercing', value: 2 }]
    });
    assert.equal(trainedSkill.rank, 4);
    assert.equal(trainedSkill.stat, 'dex');
    assert.equal(trainedSkill.totalRank, 8, 'Total rank = 4 + 1 + 2 + 1');
    assert.equal(trainedSkill.damageModifiers.length, 1);
  });

  it('3. AttackDataModel initializes combat properties and damage parts', () => {
    const attack = new AttackDataModel();
    assert.equal(attack.toHitStat, 'dex');
    assert.equal(attack.toHitRank, 1);
    assert.equal(attack.damageDice, '1d6');
    assert.equal(attack.damageStat, 'str');
    assert.deepEqual(attack.damageParts, []);

    const customAttack = new AttackDataModel({
      toHitStat: 'str',
      toHitRank: 3,
      damageDice: '2d8',
      damageStat: 'str',
      damageParts: [
        { dice: '1d6', type: 'Fire' },
        { dice: '1d4', type: 'Electric' }
      ]
    });
    assert.equal(customAttack.toHitStat, 'str');
    assert.equal(customAttack.toHitRank, 3);
    assert.equal(customAttack.damageParts.length, 2);
    assert.equal(customAttack.damageParts[0].type, 'Fire');
  });

  it('4. SpellDataModel initializes rank, costs, and upgrades schema', () => {
    const spell = new SpellDataModel();
    assert.equal(spell.rank, 1);
    assert.equal(spell.stat, 'int');
    assert.equal(spell.manaCost, 0);
    assert.equal(spell.duration, 'Instantaneous');
    assert.equal(spell.cooldown, 'None');
    assert.ok(spell.upgrades, 'Upgrades schema must exist');
    assert.equal(spell.upgrades.rank5, '');

    const fireball = new SpellDataModel({
      name: 'Fireball',
      rank: 3,
      manaCost: 12,
      spellType: 'Attack',
      baseDamage: '1d12 + Int Fire',
      upgrades: { rank5: 'Adds 5ft radius', rank10: 'Doubles fire radius' }
    });
    assert.equal(fireball.rank, 3);
    assert.equal(fireball.manaCost, 12);
    assert.equal(fireball.upgrades.rank5, 'Adds 5ft radius');
    assert.equal(fireball.upgrades.rank10, 'Doubles fire radius');
  });

  it('5. GearDataModel defines equipment slots, DR/evade bonuses, and nested abilityModifiers', () => {
    const gear = new GearDataModel();
    assert.equal(gear.slot, 'torso');
    assert.equal(gear.quantity, 1);
    assert.equal(gear.equipped, false);
    assert.equal(gear.drBonus, 0);
    assert.equal(gear.evadeBonus, 0);
    assert.equal(gear.abilityModifiers.str.value, 0);
    assert.equal(gear.abilityModifiers.str.type, 'flat');

    const ring = new GearDataModel({
      slot: 'accessory',
      equipped: true,
      drBonus: 2,
      abilityModifiers: {
        str: { value: 3, type: 'flat' }
      },
      skillModifiers: [{ skill: 'Brawling', bonus: 2 }]
    });
    assert.equal(ring.slot, 'accessory');
    assert.equal(ring.equipped, true);
    assert.equal(ring.drBonus, 2);
    assert.equal(ring.abilityModifiers.str.value, 3);
    assert.equal(ring.skillModifiers.length, 1);
  });

  it('6. BuffDataModel and DebuffDataModel validate severity, damage reductions, and modifiers', () => {
    const buff = new BuffDataModel({
      buffType: 'damagemultiplier',
      damageMultiplier: 2,
      damageType: 'Fire'
    });
    assert.equal(buff.damageMultiplier, 2);
    assert.equal(buff.damageType, 'Fire');

    const debuff = new DebuffDataModel({
      severity: 'Major',
      damageType: 'Fire',
      reductionPercent: 50,
      rounding: 'up'
    });
    assert.equal(debuff.severity, 'Major');
    assert.equal(debuff.damageType, 'Fire');
    assert.equal(debuff.reductionPercent, 50);
    assert.equal(debuff.rounding, 'up');
  });

  it('7. LootDataModel and Lore models (Race, Class, Deity, Sponsor) initialize cleanly', () => {
    const loot = new LootDataModel({ quantity: 5, notes: 'Golden tokens' });
    assert.equal(loot.quantity, 5);
    assert.equal(loot.notes, 'Golden tokens');

    const race = new RaceDataModel({ abilities: 'Night Vision', description: 'Underground dweller' });
    assert.equal(race.abilities, 'Night Vision');

    const sponsor = new SponsorDataModel({ gifts: 'Healing Potions', notes: 'Top corporate tier' });
    assert.equal(sponsor.gifts, 'Healing Potions');
    assert.equal(sponsor.notes, 'Top corporate tier');
  });

  it('8. Item Document automatically binds DataModel to .system and maintains parent link', () => {
    const item = new MockItem({
      name: 'Power Strike',
      type: 'attack',
      system: {
        toHitRank: 4,
        damageDice: '2d10'
      }
    });

    assert.ok(item.system instanceof AttackDataModel, 'item.system must be an instance of AttackDataModel');
    assert.equal(item.system.toHitRank, 4);
    assert.equal(item.system.damageDice, '2d10');
    assert.equal(item.system.item, item, 'DataModel.item getter must link back to parent item');

    // Serialization via toObject
    const exported = item.toObject();
    assert.equal(exported.name, 'Power Strike');
    assert.equal(exported.system.toHitRank, 4);
    assert.equal(exported.system.damageDice, '2d10');
  });

  it('9. Item Document updates update DataModel instance cleanly', async () => {
    const item = new MockItem({
      name: 'Acrobatics',
      type: 'skill',
      system: { rank: 2, stat: 'dex' }
    });

    assert.ok(item.system instanceof SkillDataModel);
    assert.equal(item.system.rank, 2);

    await item.update({ 'system.rank': 5, 'system.boonBonus': 2 });
    assert.equal(item.system.rank, 5);
    assert.equal(item.system.boonBonus, 2);
    assert.equal(item.system.totalRank, 7);
  });
});
