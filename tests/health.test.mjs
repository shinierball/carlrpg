import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';

describe('DCC RPG Max Health Calculation', () => {
  test('calculates max health as 10 * constitution modifier', () => {
    // Test various CON scores and verify Max HP = 10 * mod
    const cases = [
      { con: 1, expectedMod: 1, expectedMaxHP: 10 },
      { con: 2, expectedMod: 1, expectedMaxHP: 10 },
      { con: 3, expectedMod: 2, expectedMaxHP: 20 },
      { con: 5, expectedMod: 2, expectedMaxHP: 20 },
      { con: 6, expectedMod: 3, expectedMaxHP: 30 },
      { con: 9, expectedMod: 3, expectedMaxHP: 30 },
      { con: 10, expectedMod: 4, expectedMaxHP: 40 },
      { con: 19, expectedMod: 4, expectedMaxHP: 40 },
      { con: 20, expectedMod: 5, expectedMaxHP: 50 },
      { con: 49, expectedMod: 5, expectedMaxHP: 50 },
      { con: 50, expectedMod: 6, expectedMaxHP: 60 },
      { con: 99, expectedMod: 6, expectedMaxHP: 60 },
      { con: 100, expectedMod: 7, expectedMaxHP: 70 },
      { con: 149, expectedMod: 7, expectedMaxHP: 70 },
      { con: 150, expectedMod: 8, expectedMaxHP: 80 },
      { con: 199, expectedMod: 8, expectedMaxHP: 80 },
      { con: 200, expectedMod: 9, expectedMaxHP: 90 },
      { con: 299, expectedMod: 9, expectedMaxHP: 90 },
      { con: 300, expectedMod: 10, expectedMaxHP: 100 },
      { con: 500, expectedMod: 10, expectedMaxHP: 100 },
    ];

    for (const { con, expectedMod, expectedMaxHP } of cases) {
      const actor = new DCCActor({
        type: 'crawler',
        system: {
          abilities: {
            con: { unenhanced: con }
          },
          attributes: {
            hp: { value: 10, max: 0 }
          }
        }
      });

      actor.prepareDerivedData();

      assert.equal(
        actor.system.abilities.con.mod,
        expectedMod,
        `CON ${con} should have mod ${expectedMod}`
      );
      assert.equal(
        actor.system.attributes.hp.max,
        expectedMaxHP,
        `CON ${con} (mod ${expectedMod}) should have Max HP ${expectedMaxHP}`
      );
    }
  });

  test('calculates correct HP percentage for health bar styling', () => {
    const actor = new DCCActor({
      type: 'crawler',
      system: {
        abilities: {
          con: { unenhanced: 10 } // mod = 4 -> Max HP = 40
        },
        attributes: {
          hp: { value: 20, max: 0 }
        }
      }
    });

    actor.prepareDerivedData();

    assert.equal(actor.system.attributes.hp.max, 40);
    assert.equal(actor.system.attributes.hp.pct, 50); // 20 / 40 = 50%
  });
});
