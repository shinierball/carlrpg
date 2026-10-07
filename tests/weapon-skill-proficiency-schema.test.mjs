import './setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  SkillDataModel,
  AttackDataModel,
  GearDataModel
} from '../src/models/index.mjs';

import { MockItem } from './setup.mjs';
import { before } from 'node:test';

describe('DCC RPG - Weapon Skill Proficiency & Technique Schema', () => {
  before(() => {
    CONFIG.Item.dataModels = {
      skill: SkillDataModel,
      attack: AttackDataModel,
      gear: GearDataModel
    };
  });
  it('1. template.json defines schema for weaponCategory, weaponType, associatedSkills, proficiencyMode, and techniqueConfig', () => {
    const raw = fs.readFileSync(path.resolve('template.json'), 'utf8');
    const template = JSON.parse(raw);

    // Attack Schema in template.json
    assert.ok(template.Item.attack, 'template.json must define Item.attack');
    assert.equal(template.Item.attack.weaponCategory, '');
    assert.equal(template.Item.attack.weaponType, '');
    assert.deepEqual(template.Item.attack.associatedSkills, []);
    assert.equal(template.Item.attack.proficiencyMode, 'highest');
    assert.equal(template.Item.attack.selectedSkill, '');
    assert.deepEqual(template.Item.attack.optionalEffects, []);
    assert.equal(template.Item.attack.selectedEffect, '');

    // Gear Schema in template.json
    assert.ok(template.Item.gear, 'template.json must define Item.gear');
    assert.equal(template.Item.gear.weaponCategory, '');
    assert.equal(template.Item.gear.weaponType, '');
    assert.deepEqual(template.Item.gear.associatedSkills, []);
    assert.equal(template.Item.gear.proficiencyMode, 'highest');
    assert.equal(template.Item.gear.selectedSkill, '');
    assert.deepEqual(template.Item.gear.optionalEffects, []);
    assert.equal(template.Item.gear.selectedEffect, '');

    // Skill Schema in template.json
    assert.ok(template.Item.skill, 'template.json must define Item.skill');
    assert.equal(template.Item.skill.isTechnique, false);
    assert.deepEqual(template.Item.skill.appliesTo, []);
    assert.deepEqual(template.Item.skill.techniqueConfig, {
      isDamageEffect: false,
      appliesToTags: [],
      baseDiceCountMod: '',
      baseDiceSidesMod: '',
      flatDamageMod: '',
      damageBonus: '',
      damageType: '',
      debuffName: '',
      cooldown: 'None'
    });
  });

  it('2. AttackDataModel initializes defaults and accepts custom weapon proficiency configurations', () => {
    const defaultAttack = new AttackDataModel();
    assert.equal(defaultAttack.weaponCategory, '');
    assert.equal(defaultAttack.weaponType, '');
    assert.deepEqual(defaultAttack.associatedSkills, []);
    assert.equal(defaultAttack.proficiencyMode, 'highest');
    assert.equal(defaultAttack.selectedSkill, '');
    assert.deepEqual(defaultAttack.optionalEffects, []);
    assert.equal(defaultAttack.selectedEffect, '');

    const customAttack = new AttackDataModel({
      weaponCategory: 'Power Weapons',
      weaponType: 'Chainsaw',
      associatedSkills: ['Chainsaws', 'Power Weapons', 'Slashing'],
      proficiencyMode: 'synergy',
      selectedSkill: 'Chainsaws',
      optionalEffects: ['Serrated Tear', 'Overcharge'],
      selectedEffect: 'Serrated Tear'
    });
    assert.equal(customAttack.weaponCategory, 'Power Weapons');
    assert.equal(customAttack.weaponType, 'Chainsaw');
    assert.deepEqual(customAttack.associatedSkills, ['Chainsaws', 'Power Weapons', 'Slashing']);
    assert.equal(customAttack.proficiencyMode, 'synergy');
    assert.equal(customAttack.selectedSkill, 'Chainsaws');
    assert.deepEqual(customAttack.optionalEffects, ['Serrated Tear', 'Overcharge']);
    assert.equal(customAttack.selectedEffect, 'Serrated Tear');
  });

  it('3. GearDataModel initializes defaults and supports weapon gear proficiency schema', () => {
    const defaultGear = new GearDataModel();
    assert.equal(defaultGear.weaponCategory, '');
    assert.equal(defaultGear.weaponType, '');
    assert.deepEqual(defaultGear.associatedSkills, []);
    assert.equal(defaultGear.proficiencyMode, 'highest');
    assert.equal(defaultGear.selectedSkill, '');
    assert.deepEqual(defaultGear.optionalEffects, []);
    assert.equal(defaultGear.selectedEffect, '');

    const chainsawGear = new GearDataModel({
      slot: 'hands',
      isWeapon: true,
      weaponCategory: 'Power Weapons',
      weaponType: 'Chainsaw',
      associatedSkills: ['Chainsaws', 'Power Weapons', 'Slashing'],
      proficiencyMode: 'highest',
      optionalEffects: ['Serrated Tear']
    });
    assert.equal(chainsawGear.isWeapon, true);
    assert.equal(chainsawGear.weaponCategory, 'Power Weapons');
    assert.equal(chainsawGear.weaponType, 'Chainsaw');
    assert.deepEqual(chainsawGear.associatedSkills, ['Chainsaws', 'Power Weapons', 'Slashing']);
    assert.equal(chainsawGear.proficiencyMode, 'highest');
    assert.deepEqual(chainsawGear.optionalEffects, ['Serrated Tear']);
  });

  it('4. SkillDataModel initializes technique fields and supports techniqueConfig schema', () => {
    const defaultSkill = new SkillDataModel();
    assert.equal(defaultSkill.isTechnique, false);
    assert.deepEqual(defaultSkill.appliesTo, []);
    assert.equal(defaultSkill.techniqueConfig.damageBonus, '');
    assert.equal(defaultSkill.techniqueConfig.damageType, '');
    assert.equal(defaultSkill.techniqueConfig.debuffName, '');
    assert.equal(defaultSkill.techniqueConfig.cooldown, 'None');

    const techniqueSkill = new SkillDataModel({
      name: 'Iron Punch',
      rank: 3,
      isTechnique: true,
      appliesTo: ['Pugilism', 'Unarmed Combat'],
      techniqueConfig: {
        damageBonus: '+1d2',
        damageType: 'Bludgeoning',
        debuffName: 'Stunned',
        cooldown: 'None'
      }
    });
    assert.equal(techniqueSkill.isTechnique, true);
    assert.deepEqual(techniqueSkill.appliesTo, ['Pugilism', 'Unarmed Combat']);
    assert.equal(techniqueSkill.techniqueConfig.damageBonus, '+1d2');
    assert.equal(techniqueSkill.techniqueConfig.damageType, 'Bludgeoning');
    assert.equal(techniqueSkill.techniqueConfig.debuffName, 'Stunned');
    assert.equal(techniqueSkill.techniqueConfig.cooldown, 'None');
  });

  it('5. MockItem binds DataModel instances and preserves proficiency & technique updates', async () => {
    // Attack Item
    const attackItem = new MockItem({
      name: 'Husqvarna 455 Chainsaw',
      type: 'attack',
      system: {
        weaponCategory: 'Power Weapons',
        weaponType: 'Chainsaw',
        associatedSkills: ['Chainsaws', 'Power Weapons', 'Slashing']
      }
    });
    assert.ok(attackItem.system instanceof AttackDataModel);
    assert.equal(attackItem.system.weaponType, 'Chainsaw');
    assert.deepEqual(attackItem.system.associatedSkills, ['Chainsaws', 'Power Weapons', 'Slashing']);

    await attackItem.update({
      'system.proficiencyMode': 'synergy',
      'system.selectedSkill': 'Chainsaws'
    });
    assert.equal(attackItem.system.proficiencyMode, 'synergy');
    assert.equal(attackItem.system.selectedSkill, 'Chainsaws');

    // Skill Item (Technique)
    const skillItem = new MockItem({
      name: 'Serrated Tear',
      type: 'skill',
      system: {
        rank: 2,
        isTechnique: true,
        appliesTo: ['Chainsaws', 'Power Weapons']
      }
    });
    assert.ok(skillItem.system instanceof SkillDataModel);
    assert.equal(skillItem.system.isTechnique, true);
    assert.deepEqual(skillItem.system.appliesTo, ['Chainsaws', 'Power Weapons']);

    await skillItem.update({
      'system.techniqueConfig.damageBonus': '+1d4',
      'system.techniqueConfig.damageType': 'Slashing'
    });
    assert.equal(skillItem.system.techniqueConfig.damageBonus, '+1d4');
    assert.equal(skillItem.system.techniqueConfig.damageType, 'Slashing');
  });
});
