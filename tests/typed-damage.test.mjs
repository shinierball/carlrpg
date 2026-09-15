import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';

describe('DCC RPG Damage Type Integration Subsystem', () => {

  describe('1. Scenario 1: Skill Scaling Damage Modifiers', () => {
    test('skill damage modifiers scale cumulatively with modified rank', async () => {
      // Skill definition:
      // +2 bludgeoning to all attacks,
      // at level 5: additional +2 fire,
      // at level 10: additional +4 fire,
      // at level 15: additional +10 fire.
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10, mod: 4 },
            dex: { value: 10, unenhanced: 10, mod: 4 }
          },
          attributes: { hp: { value: 40, max: 40, temp: 0 } }
        }
      });

      const skill = new DCCItem({
        name: 'Infernal Brawler',
        type: 'skill',
        system: {
          rank: 1,
          stat: 'str',
          damageModifiers: [
            { type: 'Bludgeoning', value: 2, dice: '', minRank: 0 },
            { type: 'Fire', value: 2, dice: '', minRank: 5 },
            { type: 'Fire', value: 4, dice: '', minRank: 10 },
            { type: 'Fire', value: 10, dice: '', minRank: 15 }
          ]
        }
      });
      actor.items.push(skill);

      const weapon = new DCCItem({
        name: 'Spiked Gauntlet',
        type: 'attack',
        system: {
          damageDice: '1d6',
          damageStat: 'str',
          damageType: 'Physical',
          damageParts: []
        }
      });
      actor.items.push(weapon);

      // --- At Rank 1: Only +2 Bludgeoning ---
      skill.system.rank = 1;
      skill.prepareDerivedData();
      let parts = actor.getAttackDamageParts(weapon);
      let bludgeonParts = parts.filter(p => p.type === 'Bludgeoning');
      let fireParts = parts.filter(p => p.type === 'Fire');
      assert.equal(bludgeonParts.length, 1);
      assert.equal(bludgeonParts[0].value, 2);
      assert.equal(fireParts.length, 0, 'No fire damage at rank 1');

      // --- At Rank 5: +2 Bludgeoning and +2 Fire ---
      skill.system.rank = 5;
      skill.prepareDerivedData();
      parts = actor.getAttackDamageParts(weapon);
      bludgeonParts = parts.filter(p => p.type === 'Bludgeoning');
      fireParts = parts.filter(p => p.type === 'Fire');
      assert.equal(bludgeonParts.length, 1);
      assert.equal(bludgeonParts[0].value, 2);
      assert.equal(fireParts.length, 1);
      assert.equal(fireParts[0].value, 2);

      // --- At Rank 10: +2 Bludgeoning and +6 Fire (2 + 4) ---
      skill.system.rank = 10;
      skill.prepareDerivedData();
      parts = actor.getAttackDamageParts(weapon);
      bludgeonParts = parts.filter(p => p.type === 'Bludgeoning');
      fireParts = parts.filter(p => p.type === 'Fire');
      assert.equal(bludgeonParts.length, 1);
      const fireTotalRank10 = fireParts.reduce((a, b) => a + b.value, 0);
      assert.equal(fireTotalRank10, 6, 'Rank 10 should provide 2 + 4 = 6 fire damage');

      // --- At Rank 15: +2 Bludgeoning and +16 Fire (2 + 4 + 10) ---
      skill.system.rank = 15;
      skill.prepareDerivedData();
      parts = actor.getAttackDamageParts(weapon);
      bludgeonParts = parts.filter(p => p.type === 'Bludgeoning');
      fireParts = parts.filter(p => p.type === 'Fire');
      assert.equal(bludgeonParts.length, 1);
      assert.equal(bludgeonParts[0].value, 2);
      const fireTotalRank15 = fireParts.reduce((a, b) => a + b.value, 0);
      assert.equal(fireTotalRank15, 16, 'Rank 15 should provide 2 + 4 + 10 = 16 fire damage');

      // Roll attack damage at Rank 15
      const rollMsg = await actor.rollAttack(weapon, 'damage');
      const typed = rollMsg.flags['carl-rpg'].typedDamage;
      assert.ok(typed, 'Roll message must contain typedDamage flag');
      assert.equal(typed.Bludgeoning, 2, 'Should include +2 Bludgeoning');
      assert.equal(typed.Fire, 16, 'Should include +16 Fire');
      assert.ok(typed.Physical >= 5, 'Should include weapon base damage (1d6 + STR mod)');
    });
  });

  describe('2. Scenario 2: Multi-Typed Damage Weapons', () => {
    test('weapon with multiple damage parts rolls each typed packet', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 10, mod: 4 } },
          attributes: { hp: { value: 40, max: 40, temp: 0 } }
        }
      });

      // Scenario 2: A weapon that when used gives +2 necrotic and +4 sonic damage
      const weapon = new DCCItem({
        name: 'Doom Screamer Axe',
        type: 'attack',
        system: {
          damageParts: [
            { dice: '1d6', stat: 'str', type: 'Slashing', value: 0 },
            { dice: '', stat: '', type: 'Necrotic', value: 2 },
            { dice: '', stat: '', type: 'Sonic', value: 4 }
          ]
        }
      });
      actor.items.push(weapon);

      const parts = actor.getAttackDamageParts(weapon);
      assert.equal(parts.length, 3, 'Should resolve 3 distinct damage parts');
      assert.equal(parts[0].type, 'Slashing');
      assert.equal(parts[1].type, 'Necrotic');
      assert.equal(parts[1].value, 2);
      assert.equal(parts[2].type, 'Sonic');
      assert.equal(parts[2].value, 4);

      const msg = await actor.rollAttack(weapon, 'damage');
      const typed = msg.flags['carl-rpg'].typedDamage;
      assert.equal(typed.Necrotic, 2);
      assert.equal(typed.Sonic, 4);
      assert.ok(typed.Slashing >= 5); // 1d6 (min 1) + 4 STR mod = min 5
      assert.equal(msg.flags['carl-rpg'].rawDamage, typed.Slashing + 2 + 4);
    });
  });

  describe('3. Scenario 3: Buff Multiplier (*2 Total Damage)', () => {
    test('buff doubling all damage doubles each typed damage component', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 10, mod: 4 } },
          attributes: {
            externalBuffs: {
              buff1: '*2 Total Damage', // Scenario 3: *2 total damage of any type
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });
      actor.prepareDerivedData();

      assert.equal(actor.getDamageMultiplier(), 2, 'Global damage multiplier should be 2');
      assert.equal(actor.getDamageMultiplier('Necrotic'), 2);
      assert.equal(actor.getDamageMultiplier('Sonic'), 2);

      const weapon = new DCCItem({
        name: 'Chaos Blade',
        type: 'attack',
        system: {
          damageParts: [
            { dice: '', stat: '', type: 'Necrotic', value: 2 },
            { dice: '', stat: '', type: 'Sonic', value: 4 }
          ]
        }
      });
      actor.items.push(weapon);

      const msg = await actor.rollAttack(weapon, 'damage');
      const typed = msg.flags['carl-rpg'].typedDamage;

      // Base: Necrotic 2, Sonic 4.
      // Doubled (*2): Necrotic 4, Sonic 8.
      assert.equal(typed.Necrotic, 4, 'Necrotic damage should be doubled to 4');
      assert.equal(typed.Sonic, 8, 'Sonic damage should be doubled to 8');
      assert.equal(msg.flags['carl-rpg'].rawDamage, 12, 'Total raw damage should be 12');
    });

    test('structured buff item with damageMultiplier doubles damage', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 10, mod: 4 } },
          attributes: { hp: { value: 40, max: 40, temp: 0 } }
        }
      });

      const buff = new DCCItem({
        name: 'Adrenaline Surge',
        type: 'buff',
        system: {
          buffType: 'damageMultiplier',
          damageMultiplier: 2,
          damageType: '',
          duration: '1 Round'
        }
      });
      actor.items.push(buff);
      actor.system.attributes.externalBuffs = { buff1: buff.id, buff2: '', buff3: '' };
      actor.prepareDerivedData();

      assert.equal(actor.getDamageMultiplier(), 2);

      const weapon = new DCCItem({
        name: 'Hammer',
        type: 'attack',
        system: {
          damageParts: [
            { dice: '', stat: '', type: 'Bludgeoning', value: 10 }
          ]
        }
      });
      actor.items.push(weapon);

      const msg = await actor.rollAttack(weapon, 'damage');
      assert.equal(msg.flags['carl-rpg'].typedDamage.Bludgeoning, 20);
      assert.equal(msg.flags['carl-rpg'].rawDamage, 20);
    });
  });

  describe('4. Scenario 4: Debuff Reducing Fire Damage by 50% Rounded Up', () => {
    test('debuff reduces incoming fire damage by 50% rounded up on odd number (15 -> 7)', async () => {
      // 15 Fire damage.
      // 50% reduction rounded up: ceil(15 * 0.5) = 8 reduced.
      // Remaining Fire damage = 15 - 8 = 7.
      const target = new DCCActor({
        name: 'Goblin Pyromancer',
        type: 'npc',
        system: {
          abilities: { con: { value: 10, mod: 4 } }, // 1 bar = 4 HP
          attributes: {
            dr: { total: 0 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });

      const debuff = new DCCItem({
        name: 'Douse',
        type: 'debuff',
        system: {
          damageType: 'Fire',
          reductionPercent: 50,
          rounding: 'up',
          description: 'Reduces all fire damage by 50% rounded up'
        }
      });
      target.items.push(debuff);

      const reduction = target.getDamageReduction('Fire');
      assert.equal(reduction.percent, 0.5);
      assert.equal(reduction.rounding, 'up');

      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 15,
        damageType: 'Fire'
      });

      assert.equal(result.rawDamage, 7, '15 Fire damage reduced by 50% rounded up (8 reduced) leaves 7');
      assert.equal(result.barsRemoved, 1, '7 damage with 4 HP per bar removes 1 full bar (4 HP)');
      assert.equal(result.excessDamage, 3, '3 HP excess ignored per DCC rules');
      assert.equal(result.actualDamage, 4);
      assert.equal(target.system.attributes.hp.value, 36);
    });

    test('debuff reduces incoming fire damage by 50% rounded up on even number (16 -> 8)', async () => {
      const target = new DCCActor({
        name: 'Goblin',
        type: 'npc',
        system: {
          abilities: { con: { value: 10, mod: 4 } },
          attributes: {
            dr: { total: 0 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });

      const debuff = new DCCItem({
        name: 'Wet Coat',
        type: 'debuff',
        system: {
          damageType: 'Fire',
          reductionPercent: 50,
          rounding: 'up'
        }
      });
      target.items.push(debuff);

      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 16,
        damageType: 'Fire'
      });

      assert.equal(result.rawDamage, 8, '16 Fire damage reduced by 50% leaves 8');
      assert.equal(result.barsRemoved, 2, '8 damage with 4 HP per bar removes exactly 2 bars (8 HP)');
      assert.equal(result.actualDamage, 8);
      assert.equal(target.system.attributes.hp.value, 32);
    });

    test('multi-type attack applies type-specific debuff reduction selectively', async () => {
      const target = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } }, // 1 bar = 4 HP
          attributes: {
            dr: { armor: 2, total: 2 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });

      // Target has debuff reducing Fire damage by 50% rounded up
      const debuff = new DCCItem({
        name: 'Fire Dampener',
        type: 'debuff',
        system: {
          damageType: 'Fire',
          reductionPercent: 50,
          rounding: 'up'
        }
      });
      target.items.push(debuff);

      // Incoming multi-typed damage: 15 Fire, 10 Slashing
      // Fire: 15 -> ceil(15 * 0.5) = 8 reduction -> 7 Fire.
      // Slashing: 10 (unaffected).
      // Total Adjusted Raw = 7 + 10 = 17.
      // DR = 2 absorbs 2 -> 15 penetrating damage.
      // 1 bar = 4 HP -> 3 bars removed (12 HP), 3 excess ignored.
      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        typedDamage: {
          Fire: 15,
          Slashing: 10
        }
      });

      assert.equal(result.typeBreakdown.Fire.final, 7);
      assert.equal(result.typeBreakdown.Slashing.final, 10);
      assert.equal(result.rawDamage, 17, 'Total adjusted raw should be 7 + 10 = 17');
      assert.equal(result.dr, 2);
      assert.equal(result.damageAfterDR, 15);
      assert.equal(result.barsRemoved, 3);
      assert.equal(result.damageToHp, 12);
      assert.equal(result.actualDamage, 12);
      assert.equal(target.system.attributes.hp.value, 28);
    });
  });

  describe('5. Backward Compatibility & Integrated Flow', () => {
    test('legacy attack without damageParts still functions normally', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 10, mod: 4 } }
        }
      });

      const legacyWeapon = new DCCItem({
        name: 'Rusty Sword',
        type: 'attack',
        system: {
          damageDice: '1d6',
          damageStat: 'str'
        }
      });
      actor.items.push(legacyWeapon);

      const parts = actor.getAttackDamageParts(legacyWeapon);
      assert.equal(parts.length, 1);
      assert.equal(parts[0].dice, '1d6');
      assert.equal(parts[0].stat, 'str');

      const msg = await actor.rollAttack(legacyWeapon, 'damage');
      assert.ok(msg.flags['carl-rpg'].rawDamage >= 5);
      assert.ok(msg.content.includes('dcc-damage-card'));
    });
  });

});
