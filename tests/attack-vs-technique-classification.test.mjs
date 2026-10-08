import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';

describe('DCC RPG - Attacks vs Combat Techniques Classification (Wrasslin, Pugilism & Toss)', () => {
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
          str: { value: 16, mod: 5 },
          dex: { value: 12, mod: 4 },
          con: { value: 14, mod: 4 },
          int: { value: 6, mod: 3 },
          cha: { value: 2, mod: 1 }
        },
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 }
        },
        details: {
          level: 1,
          floor: '1st Floor'
        }
      }
    });
  });

  it('1. Compendium skill dataset defines Wrasslin and Pugilism as primary attacks and Toss as a combat technique', () => {
    const wrasslinDef = DCC_SKILLS.find(s => s.name === 'Wrasslin');
    assert.ok(wrasslinDef, 'Wrasslin skill must exist in DCC_SKILLS');
    assert.equal(wrasslinDef.system.isAttack, true, 'Wrasslin must be an attack action');
    assert.equal(wrasslinDef.system.isTechnique, false, 'Wrasslin must not be a technique');
    assert.equal(wrasslinDef.system.hasDamage, true, 'Wrasslin must deal damage');
    assert.equal(wrasslinDef.system.baseDamage, '1d4');
    assert.equal(wrasslinDef.system.damageStat, 'str');
    assert.equal(wrasslinDef.system.damageType, 'Bludgeoning');
    assert.deepEqual(wrasslinDef.system.optionalEffects, ['Choke Out', 'Dirty Fighting', 'Toss']);

    const pugilismDef = DCC_SKILLS.find(s => s.name === 'Pugilism');
    assert.ok(pugilismDef, 'Pugilism skill must exist in DCC_SKILLS');
    assert.equal(pugilismDef.system.isAttack, true, 'Pugilism must be an attack action');
    assert.equal(pugilismDef.system.isTechnique, false, 'Pugilism must not be a technique');
    assert.equal(pugilismDef.system.hasDamage, true, 'Pugilism must deal damage');
    assert.equal(pugilismDef.system.baseDamage, '1d2');
    assert.equal(pugilismDef.system.damageStat, 'str');
    assert.equal(pugilismDef.system.damageType, 'Bludgeoning');
    assert.deepEqual(pugilismDef.system.optionalEffects, ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);

    const tossDef = DCC_SKILLS.find(s => s.name === 'Toss');
    assert.ok(tossDef, 'Toss skill must exist in DCC_SKILLS');
    assert.equal(tossDef.system.isTechnique, true, 'Toss must be a combat technique');
    assert.equal(tossDef.system.isAttack, false, 'Toss must not be a primary attack');
    assert.equal(tossDef.system.hasDamage, false, 'Toss must not have standalone primary attack damage');
    assert.equal(tossDef.system.techniqueConfig?.isDamageEffect, true);
    assert.equal(tossDef.system.techniqueConfig?.damageBonus, '1d8');
  });

  it('2. Actor getCombatTechniques() includes Toss and excludes Wrasslin and Pugilism', () => {
    const wrasslin = new DCCItem(DCC_SKILLS.find(s => s.name === 'Wrasslin'), crawler);
    const pugilism = new DCCItem(DCC_SKILLS.find(s => s.name === 'Pugilism'), crawler);
    const toss = new DCCItem(DCC_SKILLS.find(s => s.name === 'Toss'), crawler);
    crawler.items.push(wrasslin, pugilism, toss);

    const techniques = crawler.getCombatTechniques();
    const techNames = techniques.map(t => t.name);

    assert.ok(techNames.includes('Toss'), 'getCombatTechniques() must include Toss');
    assert.ok(!techNames.includes('Wrasslin'), 'getCombatTechniques() must NOT include Wrasslin');
    assert.ok(!techNames.includes('Pugilism'), 'getCombatTechniques() must NOT include Pugilism');
    assert.equal(techniques.length, 1, 'Only Toss should be recognized as a combat technique');
  });

  it('3. Sheet context populates Wrasslin and Pugilism as attacks with valid technique choices', async () => {
    const wrasslin = new DCCItem(DCC_SKILLS.find(s => s.name === 'Wrasslin'), crawler);
    const pugilism = new DCCItem(DCC_SKILLS.find(s => s.name === 'Pugilism'), crawler);
    const toss = new DCCItem(DCC_SKILLS.find(s => s.name === 'Toss'), crawler);
    crawler.items.push(wrasslin, pugilism, toss);

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet._prepareContext({});

    // Check Combat Techniques strip
    assert.equal(context.combatTechniques.length, 1);
    assert.equal(context.combatTechniques[0].name, 'Toss');

    // Check Attacks Table
    const attackNames = context.attacks.map(a => a.name);
    assert.ok(attackNames.some(n => n.includes('Wrasslin')), 'Wrasslin must appear in sheet attacks');
    assert.ok(attackNames.some(n => n.includes('Pugilism')), 'Pugilism must appear in sheet attacks');

    const wrasslinAtk = context.attacks.find(a => a.name.includes('Wrasslin'));
    assert.ok(wrasslinAtk, 'Wrasslin attack profile must exist');
    assert.equal(wrasslinAtk.hasOptionalEffects, true, 'Wrasslin must offer optional effects');
    assert.deepEqual(wrasslinAtk.validDamageEffects, ['Choke Out', 'Dirty Fighting', 'Toss']);
    assert.equal(wrasslinAtk.favorBonus, 1, 'Wrasslin grants 1 AI Favor when no technique used');

    const pugilismAtk = context.attacks.find(a => a.name.includes('Pugilism'));
    assert.ok(pugilismAtk, 'Pugilism attack profile must exist');
    assert.equal(pugilismAtk.hasOptionalEffects, true, 'Pugilism must offer optional effects');
    assert.deepEqual(pugilismAtk.validDamageEffects, ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);
    assert.equal(pugilismAtk.favorBonus, 2, 'Pugilism grants 2 AI Favor when no technique used');
  });

  it('4. Toss damage effect applies +1d8 Bludgeoning damage part when optionally used with Wrasslin', () => {
    const wrasslin = new DCCItem(DCC_SKILLS.find(s => s.name === 'Wrasslin'), crawler);
    crawler.items.push(wrasslin);

    // Standard attack without technique
    const baseParts = crawler.getAttackDamageParts(wrasslin);
    assert.equal(baseParts.length, 1, 'Wrasslin has 1 base damage part when no technique is chosen');
    assert.equal(baseParts[0].dice, '1d4');
    assert.equal(baseParts[0].stat, 'str');
    assert.equal(baseParts[0].statMod, 5);
    assert.equal(baseParts[0].type, 'Bludgeoning');

    // Wrasslin attack with Toss technique optionally chosen
    const tossParts = crawler.getAttackDamageParts(wrasslin, { damageEffect: 'Toss' });
    assert.equal(tossParts.length, 2, 'Wrasslin with Toss has base part + Toss bonus part');
    const tossPart = tossParts.find(p => p.source === 'Toss');
    assert.ok(tossPart, 'Toss damage part must be present');
    assert.equal(tossPart.dice, '1d8', 'Toss provides +1d8 damage bonus');
    assert.equal(tossPart.type, 'Bludgeoning');
  });

  it('5. Custom user-created attack skills and technique skills follow data-driven classification without regexp', () => {
    const customAttack = new DCCItem({
      name: 'Flying Dropkick',
      type: 'skill',
      system: {
        rank: 2,
        stat: 'str',
        isAttack: true,
        isTechnique: false,
        hasDamage: true,
        baseDamage: '1d6 + Str Bludgeoning'
      }
    }, crawler);

    const customTechnique = new DCCItem({
      name: 'Groin Stomp',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        isTechnique: true,
        isAttack: false,
        hasDamage: false,
        techniqueConfig: {
          isDamageEffect: true,
          damageBonus: '1d6',
          damageType: 'Bludgeoning'
        }
      }
    }, crawler);

    crawler.items.push(customAttack, customTechnique);

    const techs = crawler.getCombatTechniques();
    assert.ok(techs.some(t => t.name === 'Groin Stomp'), 'Groin Stomp must be in combat techniques');
    assert.ok(!techs.some(t => t.name === 'Flying Dropkick'), 'Flying Dropkick must NOT be in combat techniques');

    const attacks = crawler.getSynthesizedAttacks();
    assert.ok(attacks.some(a => a.name.includes('Flying Dropkick')), 'Flying Dropkick must be in attacks');
    assert.ok(!attacks.some(a => a.name.includes('Groin Stomp')), 'Groin Stomp must NOT be in attacks');
  });

  it('6. Validates all 26 primary attack skills in DCC_SKILLS have isAttack: true, isTechnique: false, hasDamage: true, baseDamage, damageStat, and damageType', () => {
    const expectedAttacks = [
      'Bite', 'Back Claw', 'Slice Attack',
      'Club', 'Improvised Weapons', 'Warhammer',
      'Axe', 'Dagger', 'Longsword', 'Rapier',
      'Foot Soldier', 'Noggin Nocker', 'Pugilism', 'Unarmed Combat', 'Wrasslin',
      'Bow', 'Crossbow', 'Handgun', 'Javelin', 'Shotgun', 'Shuriken', 'Slingshot',
      'Herding Weapons', 'Lance', 'Polearm', 'Quarterstaff'
    ];

    assert.equal(expectedAttacks.length, 26, 'Must define exactly 26 canonical weapon/strike attack skills');

    for (const name of expectedAttacks) {
      const skill = DCC_SKILLS.find(s => s.name === name);
      assert.ok(skill, `Attack skill "${name}" must exist in DCC_SKILLS compendium`);
      assert.equal(skill.system.isAttack, true, `${name} must have isAttack: true`);
      assert.equal(skill.system.isTechnique, false, `${name} must have isTechnique: false`);
      assert.equal(skill.system.hasDamage, true, `${name} must have hasDamage: true`);
      assert.ok(skill.system.baseDamage, `${name} must define baseDamage`);
      assert.ok(skill.system.damageStat, `${name} must define damageStat`);
      assert.ok(skill.system.damageType, `${name} must define damageType`);
    }
  });

  it('7. Validates the 7 canonical Damage Effects in DCC_SKILLS are strictly combat techniques associated with their specific strikes and NEVER Unarmed Combat', () => {
    const canonicalEffects = {
      'Choke Out': { strikes: ['Wrasslin'] },
      'Dirty Fighting': { strikes: ['Pugilism', 'Wrasslin'] },
      'Iron Punch': { strikes: ['Pugilism'] },
      'Powerful Strike': { strikes: ['Foot Soldier', 'Noggin Nocker', 'Pugilism'] },
      'Skullcracker': { strikes: ['Noggin Nocker'] },
      'Smush': { strikes: ['Foot Soldier'] },
      'Toss': { strikes: ['Wrasslin'] }
    };

    const effectNames = Object.keys(canonicalEffects);
    assert.equal(effectNames.length, 7, 'Must have exactly 7 canonical damage effects');

    // Verify in DCC_SKILLS that ONLY these 7 have techniqueConfig.isDamageEffect: true
    const damageEffectSkills = DCC_SKILLS.filter(s => s.system?.techniqueConfig?.isDamageEffect === true);
    assert.equal(damageEffectSkills.length, 7, 'DCC_SKILLS must contain exactly 7 damage effect skills');

    for (const [name, config] of Object.entries(canonicalEffects)) {
      const skill = DCC_SKILLS.find(s => s.name === name);
      assert.ok(skill, `Damage effect skill "${name}" must exist in DCC_SKILLS`);
      assert.equal(skill.system.isTechnique, true, `${name} must have isTechnique: true`);
      assert.equal(skill.system.isAttack, false, `${name} must have isAttack: false`);
      assert.equal(skill.system.hasDamage, false, `${name} must have hasDamage: false`);
      assert.equal(skill.system.techniqueConfig?.isDamageEffect, true, `${name} must have isDamageEffect: true`);

      // Verify canonical strike associations
      assert.deepEqual(skill.system.appliesTo, config.strikes, `${name} appliesTo must strictly match canonical strikes`);

      // Verify Unarmed Combat is strictly excluded
      assert.ok(!skill.system.appliesTo.includes('Unarmed Combat'), `${name} must NEVER apply to Unarmed Combat`);
      assert.ok(!skill.system.techniqueConfig.appliesToTags.includes('unarmed'), `${name} appliesToTags must NEVER include 'unarmed'`);
      assert.ok(!skill.system.techniqueConfig.appliesToTags.includes('hand to hand'), `${name} appliesToTags must NEVER include 'hand to hand'`);
    }
  });

  it('8. Unarmed Combat strictly cannot choose or receive any Damage Effect under any condition', () => {
    const unarmedDef = DCC_SKILLS.find(s => s.name === 'Unarmed Combat');
    assert.ok(unarmedDef, 'Unarmed Combat must exist');
    assert.equal(unarmedDef.system.isAttack, true);
    assert.equal(unarmedDef.system.isTechnique, false);
    assert.equal(unarmedDef.system.hasDamage, true);
    assert.deepEqual(unarmedDef.system.optionalEffects, [], 'Unarmed Combat optionalEffects must be empty');

    const unarmedItem = new DCCItem(unarmedDef, crawler);
    crawler.items.push(unarmedItem);

    // Add ALL 7 canonical damage effects to crawler items
    const effectSkills = DCC_SKILLS.filter(s => s.system?.techniqueConfig?.isDamageEffect === true);
    for (const eff of effectSkills) {
      crawler.items.push(new DCCItem(eff, crawler));
    }

    // Even with all damage effects possessed, Unarmed Combat MUST return empty array
    const validEffects = crawler.getValidDamageEffects(unarmedItem);
    assert.deepEqual(validEffects, [], 'Unarmed Combat must strictly return 0 valid damage effects');

    // Check damage calculation: has 1 base damage part and no technique damage part
    const dmgParts = crawler.getAttackDamageParts(unarmedItem);
    assert.equal(dmgParts.length, 1, 'Unarmed Combat deals only its base damage');
    assert.equal(dmgParts[0].dice, '1d4');
    assert.equal(dmgParts[0].type, 'Bludgeoning');
  });

  it('9. Validates Weapon Groups and Tactical Actions are not attacks and not techniques', () => {
    const nonCombatAttacks = [
      'Edged Weapons', 'Blunt Weapons', 'Reach Weapons', 'Ranged Weapons', 'Strike Weapons',
      'Call a Play', 'Intervene'
    ];

    for (const name of nonCombatAttacks) {
      const skill = DCC_SKILLS.find(s => s.name === name);
      assert.ok(skill, `${name} must exist in DCC_SKILLS`);
      assert.equal(skill.system.isAttack, false, `${name} must have isAttack: false`);
      assert.equal(skill.system.isTechnique, false, `${name} must have isTechnique: false`);
      assert.equal(skill.system.hasDamage, false, `${name} must have hasDamage: false`);
    }
  });

  it('10. Validates all 121 compendium skills have consistent and valid attack/technique classification', () => {
    assert.equal(DCC_SKILLS.length, 121, 'DCC_SKILLS compendium must contain exactly 121 skills');

    let attackCount = 0;
    let techniqueCount = 0;
    let otherCount = 0;

    for (const skill of DCC_SKILLS) {
      const isAtk = skill.system.isAttack === true;
      const isTech = skill.system.isTechnique === true;

      // No skill can ever be both attack and technique
      assert.ok(!(isAtk && isTech), `Skill "${skill.name}" cannot be both an attack and a technique`);

      if (isAtk) {
        attackCount++;
        assert.equal(skill.system.hasDamage, true, `Attack skill "${skill.name}" must have hasDamage: true`);
        assert.ok(skill.system.baseDamage, `Attack skill "${skill.name}" must have baseDamage`);
      } else if (isTech) {
        techniqueCount++;
        assert.equal(skill.system.hasDamage, false, `Technique skill "${skill.name}" must have hasDamage: false`);
        assert.equal(skill.system.techniqueConfig?.isDamageEffect, true, `Technique skill "${skill.name}" must be a damage effect`);
      } else {
        otherCount++;
        assert.equal(skill.system.hasDamage ?? false, false, `Non-attack skill "${skill.name}" must not deal damage`);
      }
    }

    assert.equal(attackCount, 26, 'Must have exactly 26 attacks');
    assert.equal(techniqueCount, 7, 'Must have exactly 7 combat techniques / damage effects');
    assert.equal(otherCount, 88, 'Must have exactly 88 utility, mastery, and tactical skills');
    assert.equal(attackCount + techniqueCount + otherCount, 121, 'Total must equal 121 skills');
  });
});

