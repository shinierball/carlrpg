import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { getRankDamageDie, parseUpgrades, getEvadeTargetDifficulty } from '../src/data/rank-dice.mjs';

describe('Official DCC RPG Rank Damage Die & Damage Rules', () => {

  describe('1. Rank Damage Die Scaling Table', () => {
    test('scales correctly across all rank milestones from 0 to 16+', () => {
      // Rank 0: Untrained (+0)
      assert.deepEqual(getRankDamageDie(0), { dice: '', value: 0, text: '+0' });
      // Rank 1: +1 flat bonus
      assert.deepEqual(getRankDamageDie(1), { dice: '', value: 1, text: '+1' });
      // Rank 2-3: +1d2
      assert.deepEqual(getRankDamageDie(2), { dice: '1d2', value: 0, text: '+1d2' });
      assert.deepEqual(getRankDamageDie(3), { dice: '1d2', value: 0, text: '+1d2' });
      // Rank 4-5: +1d4
      assert.deepEqual(getRankDamageDie(4), { dice: '1d4', value: 0, text: '+1d4' });
      assert.deepEqual(getRankDamageDie(5), { dice: '1d4', value: 0, text: '+1d4' });
      // Rank 6-7: +1d6
      assert.deepEqual(getRankDamageDie(6), { dice: '1d6', value: 0, text: '+1d6' });
      assert.deepEqual(getRankDamageDie(7), { dice: '1d6', value: 0, text: '+1d6' });
      // Rank 8-9: +1d8
      assert.deepEqual(getRankDamageDie(8), { dice: '1d8', value: 0, text: '+1d8' });
      assert.deepEqual(getRankDamageDie(9), { dice: '1d8', value: 0, text: '+1d8' });
      // Rank 10-13: +1d10
      assert.deepEqual(getRankDamageDie(10), { dice: '1d10', value: 0, text: '+1d10' });
      assert.deepEqual(getRankDamageDie(11), { dice: '1d10', value: 0, text: '+1d10' });
      assert.deepEqual(getRankDamageDie(12), { dice: '1d10', value: 0, text: '+1d10' });
      assert.deepEqual(getRankDamageDie(13), { dice: '1d10', value: 0, text: '+1d10' });
      // Rank 14-16+: +1d12
      assert.deepEqual(getRankDamageDie(14), { dice: '1d12', value: 0, text: '+1d12' });
      assert.deepEqual(getRankDamageDie(15), { dice: '1d12', value: 0, text: '+1d12' });
      assert.deepEqual(getRankDamageDie(16), { dice: '1d12', value: 0, text: '+1d12' });
      assert.deepEqual(getRankDamageDie(20), { dice: '1d12', value: 0, text: '+1d12' });
    });
  });

  describe('2. Spell 1: Fire Fingers Milestone Scaling', () => {
    // Fire Fingers: Base 1d6 + Int Fire
    // Upgrades: R5 +1d6, R10 +1d6, R15 +1d6
    const makeFireFingers = (rank) => new DCCItem({
      name: 'Fire Fingers',
      type: 'spell',
      system: {
        rank,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d6 + Int Fire',
        upgrades: {
          rank5: '+1d6 base damage. Those who lose 1 or more Health Bar slots via this attack gain the Burned Debuff.',
          rank10: '+1d6 base damage. Can now target 2 adjacent targets simultaneously.',
          rank15: '+1d6 base damage and adds +1d12 Fire damage to Pugilism, Unarmed Combat, and Slice Attack skills.'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { int: { mod: 3 } } }
    });

    const expected = [
      { rank: 1, formula: '1d6 + 1 + 3', formulaWithStat: '1d6 + 1 + Int Fire' },
      { rank: 2, formula: '1d6 + 1d2 + 3', formulaWithStat: '1d6 + 1d2 + Int Fire' },
      { rank: 4, formula: '1d6 + 1d4 + 3', formulaWithStat: '1d6 + 1d4 + Int Fire' },
      { rank: 5, formula: '2d6 + 1d4 + 3', formulaWithStat: '2d6 + 1d4 + Int Fire' },
      { rank: 6, formula: '2d6 + 1d6 + 3', formulaWithStat: '2d6 + 1d6 + Int Fire' },
      { rank: 8, formula: '2d6 + 1d8 + 3', formulaWithStat: '2d6 + 1d8 + Int Fire' },
      { rank: 10, formula: '3d6 + 1d10 + 3', formulaWithStat: '3d6 + 1d10 + Int Fire' },
      { rank: 14, formula: '3d6 + 1d12 + 3', formulaWithStat: '3d6 + 1d12 + Int Fire' },
      { rank: 15, formula: '4d6 + 1d12 + 3', formulaWithStat: '4d6 + 1d12 + Int Fire' },
      { rank: 16, formula: '4d6 + 1d12 + 3', formulaWithStat: '4d6 + 1d12 + Int Fire' }
    ];

    for (const exp of expected) {
      test(`Fire Fingers Rank ${exp.rank} damage formula`, () => {
        const item = makeFireFingers(exp.rank);
        const data = actor.getSpellDamageData(item);
        assert.equal(data.hasDamage, true);
        assert.equal(data.formula, exp.formula);
        assert.equal(data.formulaWithStat, exp.formulaWithStat);
        if (exp.rank >= 5) {
          assert.ok(data.debuffs.some(d => d.includes('Burned')));
        }
      });
    }
  });

  describe('3. Spell 2: Fireball Milestone Scaling', () => {
    // Fireball: Base 1d12 + Int Fire, 10ft Blast radius
    // Upgrades: R5 +1d12, R10 +1d12, R15 +1d12
    const makeFireball = (rank) => new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire, 10ft Blast radius',
        upgrades: {
          rank5: '+1d12 base damage. Those who lose 1 or more Health Bar slots via this attack gain the Burned Debuff.',
          rank10: '+1d12 base damage and becomes an 80ft Line attack (and keeps the Blast).',
          rank15: '+1d12 base damage and +40ft Splash (on the Blast).'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { int: { mod: 3 } } }
    });

    const expected = [
      { rank: 1, formula: '1d12 + 1 + 3', formulaWithStat: '1d12 + 1 + Int Fire' },
      { rank: 2, formula: '1d12 + 1d2 + 3', formulaWithStat: '1d12 + 1d2 + Int Fire' },
      { rank: 4, formula: '1d12 + 1d4 + 3', formulaWithStat: '1d12 + 1d4 + Int Fire' },
      { rank: 5, formula: '2d12 + 1d4 + 3', formulaWithStat: '2d12 + 1d4 + Int Fire' },
      { rank: 6, formula: '2d12 + 1d6 + 3', formulaWithStat: '2d12 + 1d6 + Int Fire' },
      { rank: 8, formula: '2d12 + 1d8 + 3', formulaWithStat: '2d12 + 1d8 + Int Fire' },
      { rank: 10, formula: '3d12 + 1d10 + 3', formulaWithStat: '3d12 + 1d10 + Int Fire' },
      { rank: 14, formula: '3d12 + 1d12 + 3', formulaWithStat: '3d12 + 1d12 + Int Fire' },
      { rank: 15, formula: '4d12 + 1d12 + 3', formulaWithStat: '4d12 + 1d12 + Int Fire' },
      { rank: 16, formula: '4d12 + 1d12 + 3', formulaWithStat: '4d12 + 1d12 + Int Fire' }
    ];

    for (const exp of expected) {
      test(`Fireball Rank ${exp.rank} damage formula`, () => {
        const item = makeFireball(exp.rank);
        const data = actor.getSpellDamageData(item);
        assert.equal(data.hasDamage, true);
        assert.equal(data.formula, exp.formula);
        assert.equal(data.formulaWithStat, exp.formulaWithStat);
        assert.equal(data.effects, '10ft Blast radius');
        if (exp.rank >= 5) {
          assert.ok(data.debuffs.some(d => d.includes('Burned')));
        }
      });
    }
  });

  describe('4. Spell 3: Magic Missile Milestone Scaling & Multipliers', () => {
    // Magic Missile: Base 1d4 + Int Force
    // Upgrades: R5 +1d4, R10 +1d4 (becomes Force and Fire), R15 base damage dice ×3
    const makeMagicMissile = (rank) => new DCCItem({
      name: 'Magic Missile',
      type: 'spell',
      system: {
        rank,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Force',
        baseDamage: '1d4 + Int Force',
        upgrades: {
          rank5: '+1d4 base damage.',
          rank10: '+1d4 base damage and becomes Force and Fire damage.',
          rank15: 'Multiply base damage dice by 3 and each missile can target a different foe.'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { int: { mod: 2 } } }
    });

    const expected = [
      { rank: 1, formula: '1d4 + 1 + 2', formulaWithStat: '1d4 + 1 + Int Force' },
      { rank: 2, formula: '1d4 + 1d2 + 2', formulaWithStat: '1d4 + 1d2 + Int Force' },
      { rank: 4, formula: '1d4 + 1d4 + 2', formulaWithStat: '1d4 + 1d4 + Int Force' },
      { rank: 5, formula: '2d4 + 1d4 + 2', formulaWithStat: '2d4 + 1d4 + Int Force' },
      { rank: 6, formula: '2d4 + 1d6 + 2', formulaWithStat: '2d4 + 1d6 + Int Force' },
      { rank: 8, formula: '2d4 + 1d8 + 2', formulaWithStat: '2d4 + 1d8 + Int Force' },
      { rank: 10, formula: '3d4 + 1d10 + 2', formulaWithStat: '3d4 + 1d10 + Int Force & Fire' },
      { rank: 14, formula: '3d4 + 1d12 + 2', formulaWithStat: '3d4 + 1d12 + Int Force & Fire' },
      { rank: 15, formula: '9d4 + 1d12 + 2', formulaWithStat: '9d4 + 1d12 + Int Force & Fire' },
      { rank: 16, formula: '9d4 + 1d12 + 2', formulaWithStat: '9d4 + 1d12 + Int Force & Fire' }
    ];

    for (const exp of expected) {
      test(`Magic Missile Rank ${exp.rank} damage formula`, () => {
        const item = makeMagicMissile(exp.rank);
        const data = actor.getSpellDamageData(item);
        assert.equal(data.hasDamage, true);
        assert.equal(data.formula, exp.formula);
        assert.equal(data.formulaWithStat, exp.formulaWithStat);
      });
    }
  });

  describe('5. Attack Skill 1: Unarmed Combat Milestone Scaling', () => {
    // Unarmed Combat: Base 1d4 + Str Bludgeoning
    // Does NOT combine with Hand-to-Hand Damage Effects
    const makeUnarmed = (rank) => new DCCItem({
      name: 'Unarmed Combat',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        skillType: 'Combat',
        category: 'Combat',
        notes: '1d4 + Str Bludgeoning',
        upgrades: {
          rank5: '+1d4 base damage.',
          rank10: '+1d4 base damage.',
          rank15: '+1d4 base damage.'
        }
      }
    });

    const makeIronPunch = (rank) => new DCCItem({
      name: 'Iron Punch',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        skillType: 'Combat',
        category: 'Combat',
        notes: '+1d2 base damage to Pugilism strike.',
        upgrades: {
          rank5: '+1d2 base damage to Pugilism strike.',
          rank10: '+1d2 base damage to Pugilism strike.',
          rank15: '+1d2 base damage to Pugilism strike.'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { mod: 3 } } }
    });

    const expected = [
      { rank: 1, formula: '1d4 + 1 + 3', formulaWithStat: '1d4 + 1 + Str Bludgeoning' },
      { rank: 2, formula: '1d4 + 1d2 + 3', formulaWithStat: '1d4 + 1d2 + Str Bludgeoning' },
      { rank: 4, formula: '1d4 + 1d4 + 3', formulaWithStat: '1d4 + 1d4 + Str Bludgeoning' },
      { rank: 5, formula: '2d4 + 1d4 + 3', formulaWithStat: '2d4 + 1d4 + Str Bludgeoning' },
      { rank: 6, formula: '2d4 + 1d6 + 3', formulaWithStat: '2d4 + 1d6 + Str Bludgeoning' },
      { rank: 8, formula: '2d4 + 1d8 + 3', formulaWithStat: '2d4 + 1d8 + Str Bludgeoning' },
      { rank: 10, formula: '3d4 + 1d10 + 3', formulaWithStat: '3d4 + 1d10 + Str Bludgeoning' },
      { rank: 14, formula: '3d4 + 1d12 + 3', formulaWithStat: '3d4 + 1d12 + Str Bludgeoning' },
      { rank: 15, formula: '4d4 + 1d12 + 3', formulaWithStat: '4d4 + 1d12 + Str Bludgeoning' },
      { rank: 16, formula: '4d4 + 1d12 + 3', formulaWithStat: '4d4 + 1d12 + Str Bludgeoning' }
    ];

    for (const exp of expected) {
      test(`Unarmed Combat Rank ${exp.rank} damage formula`, () => {
        const item = makeUnarmed(exp.rank);
        const data = actor.getSkillDamageData(item);
        assert.equal(data.hasDamage, true);
        assert.equal(data.formula, exp.formula);
        assert.equal(data.formulaWithStat, exp.formulaWithStat);
      });
    }

    test('Unarmed Combat does not combine with Iron Punch even if owned', () => {
      const uc = makeUnarmed(5);
      const ip = makeIronPunch(5);
      const actorWithBoth = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 3 } } },
        items: [uc, ip]
      });
      const data = actorWithBoth.getSkillDamageData(uc);
      // Must remain 2d4 + 1d4 + 3, not 4d2 or combined rank dice
      assert.equal(data.formula, '2d4 + 1d4 + 3');
      assert.equal(data.ironPunchApplied, false);
    });
  });

  describe('6. Attack Skill 2: Solo Pugilism Milestone Scaling', () => {
    // Pugilism: Base 1d2 + Str Bludgeoning
    // Upgrades: R5 +1d2, R10 +1d2, R15 +1d2
    const makePugilism = (rank) => new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        checkType: 'Attack, Dex',
        skillType: 'Combat',
        category: 'Combat',
        notes: '1d2 + Str Bludgeoning',
        upgrades: {
          rank5: '+1d2 base damage.',
          rank10: '+1d2 base damage.',
          rank15: '+1d2 base damage.'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { mod: 3 }, dex: { mod: 2 } } }
    });

    const expected = [
      { rank: 1, formula: '1d2 + 1 + 3', formulaWithStat: '1d2 + 1 + Str Bludgeoning' },
      { rank: 2, formula: '1d2 + 1d2 + 3', formulaWithStat: '1d2 + 1d2 + Str Bludgeoning' },
      { rank: 4, formula: '1d2 + 1d4 + 3', formulaWithStat: '1d2 + 1d4 + Str Bludgeoning' },
      { rank: 5, formula: '2d2 + 1d4 + 3', formulaWithStat: '2d2 + 1d4 + Str Bludgeoning' },
      { rank: 6, formula: '2d2 + 1d6 + 3', formulaWithStat: '2d2 + 1d6 + Str Bludgeoning' },
      { rank: 8, formula: '2d2 + 1d8 + 3', formulaWithStat: '2d2 + 1d8 + Str Bludgeoning' },
      { rank: 10, formula: '3d2 + 1d10 + 3', formulaWithStat: '3d2 + 1d10 + Str Bludgeoning' },
      { rank: 14, formula: '3d2 + 1d12 + 3', formulaWithStat: '3d2 + 1d12 + Str Bludgeoning' },
      { rank: 15, formula: '4d2 + 1d12 + 3', formulaWithStat: '4d2 + 1d12 + Str Bludgeoning' },
      { rank: 16, formula: '4d2 + 1d12 + 3', formulaWithStat: '4d2 + 1d12 + Str Bludgeoning' }
    ];

    for (const exp of expected) {
      test(`Solo Pugilism Rank ${exp.rank} damage formula`, () => {
        const item = makePugilism(exp.rank);
        const data = actor.getSkillDamageData(item);
        assert.equal(data.hasDamage, true);
        assert.equal(data.formula, exp.formula);
        assert.equal(data.formulaWithStat, exp.formulaWithStat);
      });
    }
  });

  describe('7. Attack Skill 3: Combined Pugilism + Iron Punch Scaling', () => {
    // Iron Punch adds +1d2 base damage to Pugilism.
    // At Iron Punch Rank 5+, it adds an additional Iron Punch Rank damage die.
    const makePugilism = (rank) => new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        checkType: 'Attack, Dex',
        skillType: 'Combat',
        notes: '1d2 + Str Bludgeoning',
        upgrades: {
          rank5: '+1d2 base damage.',
          rank10: '+1d2 base damage.',
          rank15: '+1d2 base damage.'
        }
      }
    });

    const makeIronPunch = (rank) => new DCCItem({
      name: 'Iron Punch',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        skillType: 'Combat',
        notes: '+1d2 base damage to Pugilism strike.',
        upgrades: {
          rank5: '+1d2 base damage to Pugilism strike.',
          rank10: '+1d2 base damage to Pugilism strike.',
          rank15: '+1d2 base damage to Pugilism strike.'
        }
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { mod: 4 }, dex: { mod: 2 } } }
    });

    const milestones = [
      { rank: 1, formula: '2d2 + 1 + 4', formulaWithStat: '2d2 + 1 + Str Bludgeoning' },
      { rank: 2, formula: '2d2 + 1d2 + 4', formulaWithStat: '2d2 + 1d2 + Str Bludgeoning' },
      { rank: 4, formula: '2d2 + 1d4 + 4', formulaWithStat: '2d2 + 1d4 + Str Bludgeoning' },
      { rank: 5, formula: '4d2 + 2d4 + 4', formulaWithStat: '4d2 + 2d4 + Str Bludgeoning' },
      { rank: 6, formula: '4d2 + 2d6 + 4', formulaWithStat: '4d2 + 2d6 + Str Bludgeoning' },
      { rank: 8, formula: '4d2 + 2d8 + 4', formulaWithStat: '4d2 + 2d8 + Str Bludgeoning' },
      { rank: 10, formula: '6d2 + 2d10 + 4', formulaWithStat: '6d2 + 2d10 + Str Bludgeoning' },
      { rank: 14, formula: '6d2 + 2d12 + 4', formulaWithStat: '6d2 + 2d12 + Str Bludgeoning' },
      { rank: 15, formula: '8d2 + 2d12 + 4', formulaWithStat: '8d2 + 2d12 + Str Bludgeoning' },
      { rank: 16, formula: '8d2 + 2d12 + 4', formulaWithStat: '8d2 + 2d12 + Str Bludgeoning' }
    ];

    for (const m of milestones) {
      test(`Combined Pugilism R${m.rank} + Iron Punch R${m.rank} formula`, () => {
        const pug = makePugilism(m.rank);
        const ip = makeIronPunch(m.rank);
        const testActor = new DCCActor({
          name: 'Carl',
          type: 'crawler',
          system: { abilities: { str: { mod: 4 }, dex: { mod: 2 } } },
          items: [pug, ip]
        });

        const data = testActor.getSkillDamageData(pug);
        assert.equal(data.hasDamage, true);
        assert.equal(data.ironPunchApplied, true);
        assert.equal(data.formula, m.formula);
        assert.equal(data.formulaWithStat, m.formulaWithStat);
      });
    }

    test('Rank 5 exact combination matches Section 4: 4d2 + 2d4 + Str', () => {
      const pug = makePugilism(5);
      const ip = makeIronPunch(5);
      const testActor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 3 } } },
        items: [pug, ip]
      });
      const data = testActor.getSkillDamageData(pug);
      assert.equal(data.formula, '4d2 + 2d4 + 3');
      assert.equal(data.formulaWithStat, '4d2 + 2d4 + Str Bludgeoning');
    });
  });

  describe('8. Weapon Attack with Matching Skill Scaling', () => {
    const makeLongsword = () => new DCCItem({
      name: 'Longsword',
      type: 'attack',
      system: {
        toHitStat: 'dex',
        damageStat: 'str',
        damageDice: '1d8',
        damageType: 'Slashing'
      }
    });

    const makeLongswordSkill = (rank) => new DCCItem({
      name: 'Longsword',
      type: 'skill',
      system: {
        rank,
        stat: 'str',
        skillType: 'Combat',
        notes: 'Weapon skill'
      }
    });

    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { mod: 3 }, dex: { mod: 2 } } }
    });

    const milestones = [
      { rank: 1, expectedDice: '1d8', expectedRankVal: 1, expectedRankDice: '' },
      { rank: 2, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d2' },
      { rank: 4, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d4' },
      { rank: 5, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d4' },
      { rank: 6, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d6' },
      { rank: 8, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d8' },
      { rank: 10, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d10' },
      { rank: 14, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d12' },
      { rank: 15, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d12' },
      { rank: 16, expectedDice: '1d8', expectedRankVal: 0, expectedRankDice: '1d12' }
    ];

    for (const m of milestones) {
      test(`Longsword weapon with Longsword skill Rank ${m.rank}`, () => {
        const sword = makeLongsword();
        const skill = makeLongswordSkill(m.rank);
        const testActor = new DCCActor({
          name: 'Carl',
          type: 'crawler',
          system: { abilities: { str: { mod: 3 }, dex: { mod: 2 } } },
          items: [sword, skill]
        });

        const parts = testActor.getAttackDamageParts(sword);
        assert.ok(parts.length >= 2);
        const basePart = parts[0];
        assert.equal(basePart.dice, m.expectedDice);
        assert.equal(basePart.statMod, 3);

        const rankPart = parts.find(p => p.id.startsWith('rank-die'));
        assert.ok(rankPart, `Should have rank die part at Rank ${m.rank}`);
        assert.equal(rankPart.dice, m.expectedRankDice);
        assert.equal(rankPart.value, m.expectedRankVal);
      });
    }
  });

  describe('9. Fire Fingers Rank 15 Passive Melee Bonus', () => {
    test('adds 1d12 Fire damage to Pugilism, Unarmed Combat, and Slice Attack when Fire Fingers is Rank 15+', () => {
      const ff15 = new DCCItem({
        name: 'Fire Fingers',
        type: 'spell',
        system: {
          rank: 15,
          stat: 'int',
          spellType: 'Attack',
          damageType: 'Fire',
          baseDamage: '1d6 + Int Fire',
          upgrades: {
            rank15: '+1d6 base damage and adds +1d12 Fire damage to Pugilism, Unarmed Combat, and Slice Attack skills.'
          }
        }
      });

      const pugilism = new DCCItem({
        name: 'Pugilism',
        type: 'skill',
        system: { rank: 5, stat: 'str', skillType: 'Combat', notes: '1d2 + Str Bludgeoning' }
      });

      const unarmed = new DCCItem({
        name: 'Unarmed Combat',
        type: 'skill',
        system: { rank: 5, stat: 'str', skillType: 'Combat', notes: '1d4 + Str Bludgeoning' }
      });

      const sliceAttack = new DCCItem({
        name: 'Slice Attack',
        type: 'attack',
        system: { toHitStat: 'dex', damageStat: 'dex', damageDice: '1d4', damageType: 'Slashing' }
      });

      const longsword = new DCCItem({
        name: 'Longsword',
        type: 'attack',
        system: { toHitStat: 'dex', damageStat: 'str', damageDice: '1d8', damageType: 'Slashing' }
      });

      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 2 }, dex: { mod: 3 }, int: { mod: 4 } } },
        items: [ff15, pugilism, unarmed, sliceAttack, longsword]
      });

      // 1. Pugilism skill damage
      const pugDmg = actor.getSkillDamageData(pugilism);
      assert.ok(pugDmg.fireFingersBonus, 'Pugilism should gain Fire Fingers bonus');
      assert.equal(pugDmg.fireFingersBonus.dice, '1d12');
      assert.equal(pugDmg.fireFingersBonus.type, 'Fire');
      assert.ok(pugDmg.formula.includes('+ 1d12'));
      assert.ok(pugDmg.formulaWithStat.includes('+ 1d12 Fire'));

      // 2. Unarmed Combat skill damage
      const ucDmg = actor.getSkillDamageData(unarmed);
      assert.ok(ucDmg.fireFingersBonus, 'Unarmed Combat should gain Fire Fingers bonus');
      assert.equal(ucDmg.fireFingersBonus.dice, '1d12');
      assert.ok(ucDmg.formula.includes('+ 1d12'));

      // 3. Slice Attack weapon attack
      const sliceParts = actor.getAttackDamageParts(sliceAttack);
      const ffPart = sliceParts.find(p => p.id === 'fire-fingers-passive');
      assert.ok(ffPart, 'Slice Attack should receive Fire Fingers passive part');
      assert.equal(ffPart.dice, '1d12');
      assert.equal(ffPart.type, 'Fire');

      // 4. Longsword should NOT receive Fire Fingers passive bonus
      const swordParts = actor.getAttackDamageParts(longsword);
      const ffSwordPart = swordParts.find(p => p.id === 'fire-fingers-passive');
      assert.equal(ffSwordPart, undefined, 'Longsword must NOT receive Fire Fingers passive bonus');
    });

    test('does NOT add Fire damage if Fire Fingers is only Rank 14', () => {
      const ff14 = new DCCItem({
        name: 'Fire Fingers',
        type: 'spell',
        system: {
          rank: 14,
          stat: 'int',
          spellType: 'Attack',
          damageType: 'Fire',
          baseDamage: '1d6 + Int Fire'
        }
      });

      const pugilism = new DCCItem({
        name: 'Pugilism',
        type: 'skill',
        system: {
          rank: 5,
          stat: 'str',
          skillType: 'Combat',
          notes: '1d2 + Str Bludgeoning',
          upgrades: { rank5: '+1d2 base damage.' }
        }
      });

      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 2 }, dex: { mod: 3 }, int: { mod: 4 } } },
        items: [ff14, pugilism]
      });

      const pugDmg = actor.getSkillDamageData(pugilism);
      assert.equal(pugDmg.fireFingersBonus, null);
      assert.equal(pugDmg.formula, '2d2 + 1d4 + 2');
    });
  });

  describe('10. Untrained Attack Check Disadvantage Rule & Evade Target Difficulty', () => {
    test('untrained attack check (Rank 0) rolls 2d20kl with disadvantage', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { dex: { mod: 2 } } }
      });

      const untrainedWeapon = new DCCItem({
        name: 'Crossbow',
        type: 'attack',
        system: { toHitStat: 'dex', toHitRank: 0 }
      });

      const rollMsg = await actor.rollAttack(untrainedWeapon, 'hit');
      assert.ok(rollMsg.flavor.includes('Untrained Attack Check with Disadvantage'));
      assert.ok(rollMsg.flavor.includes('2d20kl + DEX Mod +2 vs Target Evade'));
    });

    test('trained attack check (Rank 1+) rolls standard 1d20 + rank + mod', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { dex: { mod: 2 } } }
      });

      const trainedWeapon = new DCCItem({
        name: 'Crossbow',
        type: 'attack',
        system: { toHitStat: 'dex', toHitRank: 3 }
      });

      const rollMsg = await actor.rollAttack(trainedWeapon, 'hit');
      assert.ok(!rollMsg.flavor.includes('Disadvantage'));
      assert.ok(rollMsg.flavor.includes('1d20 + Rank 3 + DEX Mod +2 vs Target Evade'));
    });

    test('getEvadeTargetDifficulty correctly computes 10 + Foe Dex Mod + Floor Number', () => {
      assert.equal(getEvadeTargetDifficulty(2, 3), 15);
      assert.equal(getEvadeTargetDifficulty(0, 1), 11);
      assert.equal(getEvadeTargetDifficulty(-1, 5), 14);
      assert.equal(getEvadeTargetDifficulty(4, 9), 23);
    });
  });

  describe('11. Skill Non-Stacking Rule', () => {
    test('skills from different weapon types do not stack their ranks or rank dice', () => {
      const swordSkill = new DCCItem({
        name: 'Longsword',
        type: 'skill',
        system: { rank: 4, stat: 'str', skillType: 'Combat' }
      });

      const daggerSkill = new DCCItem({
        name: 'Dagger',
        type: 'skill',
        system: { rank: 6, stat: 'dex', skillType: 'Combat' }
      });

      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 3 }, dex: { mod: 2 } } },
        items: [swordSkill, daggerSkill]
      });

      const swordItem = new DCCItem({
        name: 'Longsword',
        type: 'attack',
        system: { toHitStat: 'dex', damageStat: 'str', damageDice: '1d8', damageType: 'Slashing' }
      });

      // The sword should only use Longsword skill (rank 4 -> 1d4), not dagger skill rank (6) or combined (10)
      const parts = actor.getAttackDamageParts(swordItem);
      const rankPart = parts.find(p => p.id.startsWith('rank-die'));
      assert.equal(rankPart.dice, '1d4');
      assert.ok(rankPart.source.includes('Longsword'));
    });
  });

  describe('12. Direct Skill Damage Rolling & Chat Output', () => {
    test('rollSkillDamage executes roll and outputs formatted chat card with damage formula', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 3 } } }
      });

      const unarmed = new DCCItem({
        name: 'Unarmed Combat',
        type: 'skill',
        system: {
          rank: 5,
          stat: 'str',
          skillType: 'Combat',
          notes: '1d4 + Str Bludgeoning',
          upgrades: { rank5: '+1d4 base damage.' }
        }
      });

      const chatMsg = await actor.rollSkillDamage(unarmed);
      assert.ok(chatMsg, 'Chat message should be produced');
      assert.ok(chatMsg.flavor.includes('Unarmed Combat (Damage:'));
      assert.ok(chatMsg.content.includes('Bludgeoning'));
      assert.ok(chatMsg.content.includes('dcc-apply-damage-btn'));
    });

    test('rollSkill embeds Roll Attack Damage button in skill card if skill has damage', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { mod: 3 } } }
      });

      const unarmed = new DCCItem({
        name: 'Unarmed Combat',
        type: 'skill',
        system: {
          rank: 5,
          stat: 'str',
          skillType: 'Combat',
          notes: '1d4 + Str Bludgeoning',
          upgrades: { rank5: '+1d4 base damage.' }
        }
      });

      const chatMsg = await actor.rollSkill(unarmed);
      assert.ok(chatMsg.content.includes('roll-skill-dmg-from-card'), 'Skill check card should include damage button');
      assert.ok(chatMsg.content.includes('2d4 + 1d4 + 3'), 'Damage button includes calculated damage formula');
    });
  });

});
