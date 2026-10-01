import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { SkillDataModel } from '../src/models/items/skill-model.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { AttackDataModel } from '../src/models/items/attack-model.mjs';
import fs from 'fs';

test('DCC RPG Weapon and Skill Manual Creation Interface & Mechanics', async (t) => {
  await t.test('1. template.json and Data Models define weapon handling and technique/condition fields', () => {
    const template = JSON.parse(fs.readFileSync(new URL('../template.json', import.meta.url), 'utf8'));

    // Check Skill template & model
    assert.equal(template.Item.skill.fumbleDebuff, '');
    assert.equal(template.Item.skill.onHitDebuff, '');
    assert.equal(template.Item.skill.onHitDebuffMinRank, 0);
    assert.equal(template.Item.skill.critMultiplierR5, 4);
    assert.equal(template.Item.skill.critMultiplierR15, 8);

    const skillModel = new SkillDataModel();
    assert.equal(skillModel.fumbleDebuff, '');
    assert.equal(skillModel.onHitDebuff, '');
    assert.equal(skillModel.onHitDebuffMinRank, 0);
    assert.equal(skillModel.critMultiplierR5, 4);
    assert.equal(skillModel.critMultiplierR15, 8);

    // Check Gear template & model
    assert.equal(template.Item.gear.wieldMode, 'one_handed');
    const gearModel = new GearDataModel();
    assert.equal(gearModel.wieldMode, 'one_handed');

    // Check Attack template & model
    assert.equal(template.Item.attack.wieldMode, 'one_handed');
    const attackModel = new AttackDataModel();
    assert.equal(attackModel.wieldMode, 'one_handed');
  });

  await t.test('2. DCCItemSheet._prepareContext populates weaponCategories, wieldModes, and formatted strings', async () => {
    const weapon = new DCCItem({
      name: 'Test Chainsaw',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        wieldMode: 'two_handed_disadv_1h',
        weaponCategory: 'Power Weapons',
        weaponType: 'Chainsaw',
        associatedSkills: ['Chainsaws', 'Power Weapons'],
        optionalEffects: ['Serrated Tear']
      }
    });

    const sheet = new DCCItemSheet(weapon);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.weaponCategories), 'weaponCategories must be an array');
    assert.ok(context.weaponCategories.includes('Power Weapons'));
    assert.ok(context.weaponCategories.includes('Edge'));

    assert.ok(Array.isArray(context.wieldModes), 'wieldModes must be an array');
    assert.ok(context.wieldModes.some(m => m.id === 'two_handed_disadv_1h'));

    assert.equal(context.associatedSkillsString, 'Chainsaws, Power Weapons');
    assert.equal(context.optionalEffectsString, 'Serrated Tear');
  });

  await t.test('3. DCCItemSheet._updateObject parses comma-separated strings into schema arrays', async () => {
    const weapon = new DCCItem({ name: 'Chainsaw', type: 'gear' });
    const sheet = new DCCItemSheet(weapon);

    const formData = {
      name: 'Industrial Chainsaw',
      'system.isWeapon': true,
      'system.wieldMode': 'two_handed_disadv_1h',
      'system.weaponCategory': 'Power Weapons',
      'system.weaponType': 'Chainsaw',
      'system.associatedSkills': 'Chainsaws, Power Weapons, Slashing',
      'system.optionalEffects': 'Serrated Tear, Violent Cleave'
    };

    await sheet._updateObject({}, formData);

    assert.deepEqual(weapon.system.associatedSkills, ['Chainsaws', 'Power Weapons', 'Slashing']);
    assert.deepEqual(weapon.system.optionalEffects, ['Serrated Tear', 'Violent Cleave']);
    assert.equal(weapon.system.wieldMode, 'two_handed_disadv_1h');
  });

  await t.test('4. Complete Chainsaw Skill creation with 4-tier 2d4 scaling, 4x/8x crits, and debuffs', async () => {
    const chainsawSkill = new DCCItem({
      name: 'Chainsaws',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        skillType: 'Edge',
        checkType: 'Attack Roll, STR',
        fumbleDebuff: 'Minor Injury',
        onHitDebuff: 'Bleeding',
        onHitDebuffMinRank: 10,
        critMultiplierR5: 4,
        critMultiplierR15: 8,
        damageModifiers: [
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 0 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 5 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 10 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 15 }
        ]
      }
    });

    const sheet = new DCCItemSheet(chainsawSkill);
    const context = await sheet.getData();

    assert.equal(context.item.name, 'Chainsaws');
    assert.equal(context.system.fumbleDebuff, 'Minor Injury');
    assert.equal(context.system.onHitDebuff, 'Bleeding');
    assert.equal(context.system.onHitDebuffMinRank, 10);
    assert.equal(context.system.critMultiplierR5, 4);
    assert.equal(context.system.critMultiplierR15, 8);
    assert.equal(context.system.damageModifiers.length, 4);
  });

  await t.test('5. Actor rolls chainsaw attack: one-handed disadvantage and rank-scaling damage', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 15, unenhanced: 15, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 }
        }
      }
    });

    const chainsawSkill = new DCCItem({
      name: 'Chainsaws',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        fumbleDebuff: 'Minor Injury',
        onHitDebuff: 'Bleeding',
        onHitDebuffMinRank: 10,
        critMultiplierR5: 4,
        critMultiplierR15: 8,
        damageModifiers: [
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 0 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 5 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 10 },
          { type: 'Slashing', dice: '2d4', value: 0, minRank: 15 }
        ]
      }
    }, actor);
    actor.items.push(chainsawSkill);

    const chainsawWeapon = new DCCItem({
      name: 'Gas Chainsaw',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        isWeapon: true,
        wieldMode: 'two_handed_disadv_1h',
        weaponType: 'Chainsaw',
        associatedSkills: ['Chainsaws'],
        damageParts: []
      }
    }, actor);
    actor.items.push(chainsawWeapon);

    // 5a. Two-handed attack (normal 1d20)
    const rollMsg2H = await actor.rollAttack(chainsawWeapon, 'hit', { hands: 2 });
    assert.ok(rollMsg2H, 'Hit roll created');
    assert.ok(rollMsg2H.flavor.includes('1d20'), 'Two-handed attack uses standard 1d20');

    // 5b. One-handed attack (disadvantage 2d20kl)
    const rollMsg1H = await actor.rollAttack(chainsawWeapon, 'hit', { hands: 1 });
    assert.ok(rollMsg1H, 'One-handed hit roll created');
    assert.ok(rollMsg1H.flavor.includes('2d20kl'), 'One-handed wielding triggers 2d20kl disadvantage');
    assert.ok(rollMsg1H.flavor.includes('One-Handed Disadvantage'));

    // 5c. Damage at Rank 1 (Base 2d4)
    chainsawSkill.system.rank = 1;
    const partsR1 = actor.getAttackDamageParts(chainsawWeapon);
    const slashingR1 = partsR1.filter(p => p.type === 'Slashing');
    assert.equal(slashingR1.length, 1);
    assert.equal(slashingR1[0].dice, '2d4');
    const dmgMsgR1 = await actor.rollAttack(chainsawWeapon, 'damage');
    assert.ok(dmgMsgR1.content.includes('Crit (2x)'), 'Rank 1 defaults to standard 2x crit');

    // 5d. Damage at Rank 5 (Base + Rank 5 = 4d4, Crit 4x)
    chainsawSkill.system.rank = 5;
    const partsR5 = actor.getAttackDamageParts(chainsawWeapon);
    const slashingR5 = partsR5.filter(p => p.type === 'Slashing');
    assert.equal(slashingR5.length, 2);
    const dmgMsgR5 = await actor.rollAttack(chainsawWeapon, 'damage');
    assert.ok(dmgMsgR5.content.includes('Crit (4x)'), 'Rank 5 unlocks 4x crit multiplier');

    // 5e. Damage at Rank 10 (Base + R5 + R10 = 6d4, Bleeding debuff)
    chainsawSkill.system.rank = 10;
    const partsR10 = actor.getAttackDamageParts(chainsawWeapon);
    const slashingR10 = partsR10.filter(p => p.type === 'Slashing');
    assert.equal(slashingR10.length, 3);
    const dmgMsgR10 = await actor.rollAttack(chainsawWeapon, 'damage');
    assert.ok(dmgMsgR10.content.includes('Inflict [Bleeding]'), 'Rank 10 includes Bleeding infliction button');

    // 5f. Damage at Rank 15 (Base + R5 + R10 + R15 = 8d4, Crit 8x)
    chainsawSkill.system.rank = 15;
    const partsR15 = actor.getAttackDamageParts(chainsawWeapon);
    const slashingR15 = partsR15.filter(p => p.type === 'Slashing');
    assert.equal(slashingR15.length, 4);
    const dmgMsgR15 = await actor.rollAttack(chainsawWeapon, 'damage');
    assert.ok(dmgMsgR15.content.includes('Crit (8x)'), 'Rank 15 unlocks 8x crit multiplier');
  });
});
