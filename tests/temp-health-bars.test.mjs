import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { MockActor } from './setup.mjs';

test('Temporary Health Bars Absorption & Depletion Pipeline', async (t) => {
  await t.test('1. Partial slot absorption: damage consumes part of currentSlotHp without dropping count', async () => {
    // 3 slots, 2 HP per slot = 6 total temp HP.
    const actor = new MockActor({
      name: 'Hot Stuff Tester',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, mod: 4 },
          con: { value: 10, mod: 4 },
          dex: { value: 10, mod: 4 },
          int: { value: 10, mod: 4 },
          cha: { value: 10, mod: 4 }
        },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 6,
            tempBars: {
              count: 3,
              maxCount: 3,
              hpPerSlot: 2,
              currentSlotHp: 2,
              source: 'Hot Stuff Aura'
            }
          },
          dr: { total: 0 }
        }
      }
    });

    // Apply 1 damage
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: actor,
      rawDamage: 1,
      damageType: 'Physical'
    });

    assert.equal(result.tempBarsDamage, 1, '1 damage should be absorbed by tempBars');
    assert.equal(actor.system.attributes.hp.tempBars.count, 3, 'Count should still be 3 (active slot has 1 HP left)');
    assert.equal(actor.system.attributes.hp.tempBars.currentSlotHp, 1, 'currentSlotHp should be 1');
    assert.equal(actor.system.attributes.hp.temp, 5, 'Total temp HP should be 5 ((2*2) + 1)');
    assert.equal(actor.system.attributes.hp.value, 40, 'Permanent HP should be completely undamaged');
  });

  await t.test('2. Exact slot depletion: finishing a slot drops count and resets currentSlotHp', async () => {
    // Actor with 3 slots, active slot has 1 HP left (total 5 HP)
    const actor = new MockActor({
      name: 'Hot Stuff Tester',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 5,
            tempBars: {
              count: 3,
              maxCount: 3,
              hpPerSlot: 2,
              currentSlotHp: 1,
              source: 'Hot Stuff Aura'
            }
          },
          dr: { total: 0 }
        }
      }
    });

    // Apply 1 damage: should deplete the active slot, leaving 2 full slots of 2 HP
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: actor,
      rawDamage: 1,
      damageType: 'Physical'
    });

    assert.equal(result.tempBarsDamage, 1);
    assert.equal(actor.system.attributes.hp.tempBars.count, 2, 'Count should drop to 2');
    assert.equal(actor.system.attributes.hp.tempBars.currentSlotHp, 2, 'currentSlotHp for next slot should reset to 2');
    assert.equal(actor.system.attributes.hp.temp, 4, 'Total temp HP should be 4 (2 * 2)');
    assert.equal(actor.system.attributes.hp.value, 40, 'Permanent HP should remain 40');
  });

  await t.test('3. Full depletion with spillover into permanent HP bars', async () => {
    // Actor with 2 slots of 2 HP each (total 4 HP temp), CON mod 4 (1 bar = 4 HP)
    const actor = new MockActor({
      name: 'Hot Stuff Tester',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 4,
            tempBars: {
              count: 2,
              maxCount: 2,
              hpPerSlot: 2,
              currentSlotHp: 2,
              source: 'Hot Stuff Aura'
            }
          },
          dr: { total: 0 }
        }
      }
    });

    // Apply 8 damage:
    // 4 absorbed by tempBars -> tempBars count becomes 0, source cleared
    // 4 penetrates -> exactly 1 full bar (CON mod = 4)
    // Permanent HP drops from 40 to 36
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: actor,
      rawDamage: 8,
      damageType: 'Physical'
    });

    assert.equal(result.tempBarsDamage, 4, '4 damage absorbed by tempBars');
    assert.equal(result.barsRemoved, 1, '1 permanent HP bar removed');
    assert.equal(actor.system.attributes.hp.tempBars.count, 0, 'tempBars count should be 0');
    assert.equal(actor.system.attributes.hp.tempBars.currentSlotHp, 0, 'currentSlotHp should be 0');
    assert.equal(actor.system.attributes.hp.temp, 0, 'temp HP should be 0');
    assert.equal(actor.system.attributes.hp.value, 36, 'Permanent HP should be 36');
  });

  await t.test('4. Partial penetrating damage discarded under DCC full-bar rules', async () => {
    // Actor with 2 slots of 2 HP each (4 temp HP total), CON mod 4
    const actor = new MockActor({
      name: 'Hot Stuff Tester',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 4,
            tempBars: {
              count: 2,
              maxCount: 2,
              hpPerSlot: 2,
              currentSlotHp: 2,
              source: 'Hot Stuff Aura'
            }
          },
          dr: { total: 0 }
        }
      }
    });

    // Apply 6 damage:
    // 4 absorbed by tempBars
    // 2 penetrating damage < 4 (CON mod). Under DCC rules, excess/partial bar damage is discarded!
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: actor,
      rawDamage: 6,
      damageType: 'Physical'
    });

    assert.equal(result.tempBarsDamage, 4);
    assert.equal(result.barsRemoved, 0, '0 permanent bars removed because 2 < 4');
    assert.equal(actor.system.attributes.hp.value, 40, 'Permanent HP remains 40');
  });

  await t.test('5. Actor helper grantTempBars initializes slots correctly', async () => {
    const actor = new MockActor({
      name: 'Hot Stuff Tester',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 } }
      }
    });

    assert.ok(typeof actor.grantTempBars === 'function', 'grantTempBars should exist on actor');
    await actor.grantTempBars({ count: 4, hpPerSlot: 2, source: 'Hot Stuff Aura' });

    assert.equal(actor.system.attributes.hp.tempBars.count, 4);
    assert.equal(actor.system.attributes.hp.tempBars.maxCount, 4);
    assert.equal(actor.system.attributes.hp.tempBars.hpPerSlot, 2);
    assert.equal(actor.system.attributes.hp.tempBars.currentSlotHp, 2);
    assert.equal(actor.system.attributes.hp.tempBars.source, 'Hot Stuff Aura');
    assert.equal(actor.system.attributes.hp.temp, 8);
  });
});
