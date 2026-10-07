import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import {
  DCCActor,
  DEFAULT_TECHNIQUE_CONFIGS,
  evaluateModifier,
  getDCCStatModifier
} from '../src/documents/actor.mjs';

test('DCC RPG - Dynamic Damage Effects & Techniques Engine', async (t) => {

  await t.test('1. evaluateModifier correctly parses flat numbers, formulas, and rank expressions', () => {
    // Flat integers and strings
    assert.equal(evaluateModifier(2, { rank: 3 }), 2);
    assert.equal(evaluateModifier('+1', { rank: 3 }), 1);
    assert.equal(evaluateModifier('-2', { rank: 5 }), -2);
    assert.equal(evaluateModifier('0', { rank: 1 }), 0);

    // Expressions referencing @rank
    assert.equal(evaluateModifier('@rank', { rank: 4 }), 4);
    assert.equal(evaluateModifier('* @rank', { rank: 3 }), 3);
    assert.equal(evaluateModifier('@rank + 2', { rank: 2 }), 4);
    assert.equal(evaluateModifier('@rank * 2', { rank: 3 }), 6);

    // Empty or invalid expressions return 0
    assert.equal(evaluateModifier('', { rank: 10 }), 0);
    assert.equal(evaluateModifier(null, { rank: 5 }), 0);
    assert.equal(evaluateModifier(undefined, { rank: 5 }), 0);
  });

  await t.test('2. Dynamic discovery of user-defined techniques in getValidDamageEffects()', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        // Custom user-created technique targeting bashing & hammer tags
        {
          id: 'sk-concussive',
          name: 'Concussive Blow',
          type: 'skill',
          system: {
            rank: 4,
            isTechnique: true,
            techniqueConfig: {
              isDamageEffect: true,
              appliesToTags: ['bashing', 'blunt', 'warhammer', 'pugilism'],
              baseDiceCountMod: '+1',
              damageBonus: '1d6',
              damageType: 'bludgeoning',
              debuffName: 'Dazed',
              cooldown: 2
            }
          }
        },
        // Custom slashing technique targeting edge only
        {
          id: 'sk-rend',
          name: 'Serrated Rend',
          type: 'skill',
          system: {
            rank: 2,
            isTechnique: true,
            appliesTo: ['edge', 'slashing', 'dagger'],
            techniqueConfig: {
              isDamageEffect: true,
              appliesToTags: ['edge', 'slashing', 'dagger'],
              damageBonus: '1d4',
              damageType: 'slashing',
              debuffName: 'Bleeding'
            }
          }
        }
      ]
    });

    // 1. Pugilism matches Concussive Blow (via appliesToTags) plus canonical effects
    const pugilism = actor.items.find(i => i.name === 'Pugilism');
    const pugilismEffects = actor.getValidDamageEffects(pugilism);
    assert.ok(pugilismEffects.includes('Concussive Blow'), 'Pugilism should dynamically include Concussive Blow');
    assert.ok(!pugilismEffects.includes('Serrated Rend'), 'Pugilism should NOT include Serrated Rend');

    // 2. Warhammer weapon matches Concussive Blow
    const warhammer = {
      id: 'gear-hammer',
      name: 'Heavy Warhammer',
      type: 'gear',
      system: {
        isWeapon: true,
        weaponCategory: 'Bashing',
        weaponType: 'Warhammer'
      }
    };
    const warhammerEffects = actor.getValidDamageEffects(warhammer);
    assert.ok(warhammerEffects.includes('Concussive Blow'), 'Warhammer should dynamically include Concussive Blow');
    assert.ok(!warhammerEffects.includes('Serrated Rend'), 'Warhammer should NOT include Serrated Rend');

    // 3. Dagger weapon matches Serrated Rend
    const dagger = {
      id: 'gear-dagger',
      name: 'Dagger',
      type: 'gear',
      system: {
        isWeapon: true,
        weaponCategory: 'Edge',
        weaponType: 'Dagger'
      }
    };
    const daggerEffects = actor.getValidDamageEffects(dagger);
    assert.ok(daggerEffects.includes('Serrated Rend'), 'Dagger should dynamically include Serrated Rend');
    assert.ok(!daggerEffects.includes('Concussive Blow'), 'Dagger should NOT include Concussive Blow');
  });

  await t.test('3. resolveDamageEffect() dynamically scales milestone rankBreaks without hardcoded names', () => {
    const actor = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: { abilities: { str: { score: 10, mod: 4 }, dex: { score: 16, mod: 4 } } },
      items: [
        {
          id: 'sk-inferno-strike',
          name: 'Inferno Strike',
          type: 'skill',
          system: {
            rank: 10,
            isTechnique: true,
            techniqueConfig: {
              isDamageEffect: true,
              baseDiceCountMod: '+1',
              flatDamageMod: '2',
              damageBonus: '1d6',
              damageType: 'fire',
              debuffName: 'Burning',
              cooldown: 3
            },
            rankBreaks: {
              rank5: {
                damageDice: '+1d6',
                baseDiceCountMod: '+1',
                debuff: 'Aflame'
              },
              rank10: {
                damageDice: '+2d6',
                baseDiceCountMod: '+2',
                debuff: 'Inferno'
              },
              rank15: {
                damageDice: '+3d6',
                baseDiceCountMod: '+3',
                debuff: 'Total Incineration'
              },
              rank20: {
                damageDice: '+4d6',
                baseDiceCountMod: '+4',
                debuff: 'Ash Heap'
              }
            }
          }
        }
      ]
    });

    const infernoSkill = actor.items.find(i => i.name === 'Inferno Strike');

    // Test at Rank 3 (No rank breaks unlocked)
    infernoSkill.system.rank = 3;
    const r3 = actor.resolveDamageEffect('Inferno Strike');
    assert.equal(r3.effectiveRank, 3);
    assert.equal(r3.totalBaseCountMod, 1, 'Rank 3 total base count mod should be +1');
    assert.equal(r3.flatMod, 2, 'Rank 3 flat mod should be 2');
    assert.equal(r3.debuff, 'Burning', 'Rank 3 debuff should be Burning');
    assert.equal(r3.cooldown, 3, 'Rank 3 cooldown should be 3');
    assert.deepEqual(r3.bonusParts, [{ count: 1, sides: 6, type: 'fire' }]);

    // Test at Rank 5 (Rank 5 milestone unlocked)
    infernoSkill.system.rank = 5;
    const r5 = actor.resolveDamageEffect('Inferno Strike');
    assert.equal(r5.effectiveRank, 5);
    // Base count mod = 1 (base) + 1 (rank5) = 2
    assert.equal(r5.totalBaseCountMod, 2, 'Rank 5 total base count mod should be 1 + 1 = 2');
    // Debuff upgrades to rank5 milestone debuff 'Aflame'
    assert.equal(r5.debuff, 'Aflame', 'Rank 5 debuff should be upgraded to Aflame');
    // Damage bonus = 1d6 (base) + 1d6 (rank5) = 2d6 fire
    assert.deepEqual(r5.bonusParts, [
      { count: 1, sides: 6, type: 'fire' },
      { count: 1, sides: 6, type: 'fire' }
    ]);

    // Test at Rank 10 (Rank 5 and Rank 10 milestones unlocked)
    infernoSkill.system.rank = 10;
    const r10 = actor.resolveDamageEffect('Inferno Strike');
    assert.equal(r10.effectiveRank, 10);
    // Base count mod = 1 (base) + 1 (rank5) + 2 (rank10) = 4
    assert.equal(r10.totalBaseCountMod, 4, 'Rank 10 total base count mod should be 1 + 1 + 2 = 4');
    // Debuff upgrades to rank10 milestone debuff 'Inferno'
    assert.equal(r10.debuff, 'Inferno', 'Rank 10 debuff should be upgraded to Inferno');
    // Damage bonus = 1d6 (base) + 1d6 (rank5) + 2d6 (rank10) = 4d6 fire
    assert.deepEqual(r10.bonusParts, [
      { count: 1, sides: 6, type: 'fire' },
      { count: 1, sides: 6, type: 'fire' },
      { count: 2, sides: 6, type: 'fire' }
    ]);
  });

  await t.test('4. getSkillDamageData() incorporates custom technique into unarmed attack', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 4, modifiedRank: 4, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-concussive',
          name: 'Concussive Blow',
          type: 'skill',
          system: {
            rank: 3,
            isTechnique: true,
            techniqueConfig: {
              isDamageEffect: true,
              appliesToTags: ['pugilism'],
              baseDiceCountMod: '+2',
              damageBonus: '1d6',
              damageType: 'bludgeoning',
              debuffName: 'Dazed'
            }
          }
        }
      ]
    });

    const pugilism = actor.items.find(i => i.name === 'Pugilism');
    const dmgData = actor.getSkillDamageData(pugilism, { chosenEffect: 'Concussive Blow' });

    // Pugilism base dice is 1d2. With baseDiceCountMod +2, base dice becomes (1 + 2)d2 = 3d2
    assert.equal(dmgData.baseDice, '3d2');
    assert.equal(dmgData.damageType.toLowerCase(), 'bludgeoning');
    assert.equal(dmgData.debuff, 'Dazed');

    // Rank 4 damage die for Pugilism (rank 4 => 1d4)
    assert.equal(dmgData.rankDamageDie, '1d4');

    // Extra damage parts should contain the 1d6 bonus packet
    const has1d6 = dmgData.extraDamageParts.some(p => p.dice === '1d6' && p.type.toLowerCase() === 'bludgeoning');
    assert.ok(has1d6, 'Extra damage parts must include 1d6 bludgeoning from Concussive Blow');
  });

  await t.test('5. Weapon attack calculation incorporates custom damage effect via _calculateWeaponDamageParts()', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'gear-hammer',
          name: 'Warhammer',
          type: 'gear',
          system: {
            isWeapon: true,
            equipped: true,
            weaponCategory: 'Bashing',
            weaponType: 'Warhammer',
            damageDice: '1d8',
            damageType: 'bludgeoning'
          }
        },
        {
          id: 'sk-concussive',
          name: 'Concussive Blow',
          type: 'skill',
          system: {
            rank: 5,
            isTechnique: true,
            techniqueConfig: {
              isDamageEffect: true,
              appliesToTags: ['bashing'],
              damageBonus: '1d6',
              damageType: 'bludgeoning',
              debuffName: 'Dazed'
            },
            rankBreaks: {
              rank5: {
                damageDice: '+1d6',
                debuff: 'Stunned'
              }
            }
          }
        }
      ]
    });

    const warhammer = actor.items.find(i => i.name === 'Warhammer');
    const damageParts = actor._calculateWeaponDamageParts(warhammer, { chosenEffect: 'Concussive Blow' });

    // Base part is 1d8 bludgeoning
    assert.equal(damageParts[0].dice, '1d8');
    assert.equal(damageParts[0].type, 'bludgeoning');

    // Technique parts: 1d6 (base bonus) + 1d6 (rank 5 break bonus)
    const bonusPackets = damageParts.filter(p => p.dice === '1d6');
    assert.equal(bonusPackets.length, 2, 'Should contain two 1d6 bonus packets at Rank 5');
  });

  await t.test('6. Canonical damage effects evaluate cleanly through DEFAULT_TECHNIQUE_CONFIGS data models', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } }
    });

    // Check fallback config exists for all canonical techniques
    const canonicalNames = ['iron punch', 'powerful strike', 'skullcracker', 'toss', 'smush', 'choke out', 'dirty fighting'];
    for (const name of canonicalNames) {
      assert.ok(DEFAULT_TECHNIQUE_CONFIGS[name], `DEFAULT_TECHNIQUE_CONFIGS must define ${name}`);
    }

    // Powerful Strike multiplier evaluation
    const ps = actor.resolveDamageEffect('Powerful Strike', null, { rank: 4 });
    assert.equal(ps.effectiveRank, 4);
    assert.equal(ps.baseCountMod, '* @rank');
    assert.equal(evaluateModifier(1, ps.baseCountMod, ps.rank), 4, 'Powerful Strike at Rank 4 evaluates to 4x multiplier');

    // Skullcracker rank break extra rank dice (R10 and R15 grant 1 extra rank die each)
    const sc5 = actor.resolveDamageEffect('Skullcracker', null, { rank: 5 });
    assert.equal(sc5.extraRankDice, 0, 'Skullcracker at Rank 5 grants base damage increase, not extra rank dice');

    const sc10 = actor.resolveDamageEffect('Skullcracker', null, { rank: 10 });
    assert.equal(sc10.extraRankDice, 1, 'Skullcracker at Rank 10 should have 1 extra rank die');

    const sc15 = actor.resolveDamageEffect('Skullcracker', null, { rank: 15 });
    assert.equal(sc15.extraRankDice, 2, 'Skullcracker at Rank 15 should have 2 extra rank dice (1 at R10 + 1 at R15)');

    // Dirty Fighting progressive debuffs (Woozy at R1-4, The Taint at R5, Blinded at R10)
    const df = actor.resolveDamageEffect('Dirty Fighting', null, { rank: 3 });
    assert.equal(df.debuff, 'Woozy');
    const df5 = actor.resolveDamageEffect('Dirty Fighting', null, { rank: 5 });
    assert.equal(df5.debuff, 'The Taint');
    const df10 = actor.resolveDamageEffect('Dirty Fighting', null, { rank: 10 });
    assert.equal(df10.debuff, 'Blinded');

    // Smush execution rules and cooldown
    const smush = actor.resolveDamageEffect('Smush', null, { rank: 3 });
    assert.equal(smush.cooldown, '1/round');
    assert.ok(smush.notes.includes('20%'), 'Smush notes specify 20% health execution threshold');

    // Choke Out execution rules
    const choke = actor.resolveDamageEffect('Choke Out', null, { rank: 3 });
    assert.ok(choke.notes.includes('10%'), 'Choke Out notes specify 10% health execution threshold');
  });

  await t.test('7. Strict CarlRPG rules compliance: no negative ability mods, official stat mod table', () => {
    // Official table:
    // <= 0: +0
    // 1-2: +1
    // 3-5: +2
    // 6-9: +3
    // 10-19: +4
    // 20-49: +5
    // 50-99: +6
    // 100-149: +7
    // 150-199: +8
    // 200-299: +9
    // 300+: +10
    assert.equal(getDCCStatModifier(0), 0);
    assert.equal(getDCCStatModifier(-5), 0);
    assert.equal(getDCCStatModifier(1), 1);
    assert.equal(getDCCStatModifier(2), 1);
    assert.equal(getDCCStatModifier(3), 2);
    assert.equal(getDCCStatModifier(6), 3);
    assert.equal(getDCCStatModifier(10), 4);
    assert.equal(getDCCStatModifier(19), 4);
    assert.equal(getDCCStatModifier(20), 5);
    assert.equal(getDCCStatModifier(50), 6);
    assert.equal(getDCCStatModifier(100), 7);
    assert.equal(getDCCStatModifier(150), 8);
    assert.equal(getDCCStatModifier(200), 9);
    assert.equal(getDCCStatModifier(300), 10);
  });

});
