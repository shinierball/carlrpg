import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('DCC RPG Speed & Skills', () => {
  test('default movement speed is 20 and step is 10', () => {
    const actor = new DCCActor({
      type: 'crawler',
      system: {
        attributes: {
          speed: {}
        }
      }
    });

    actor.prepareDerivedData();

    assert.equal(actor.system.attributes.speed.move, 20);
    assert.equal(actor.system.attributes.speed.step, 10);
  });

  test('custom movement speed preserves explicit overrides', () => {
    const actor = new DCCActor({
      type: 'crawler',
      system: {
        attributes: {
          speed: { move: 35, step: 15 }
        }
      }
    });

    actor.prepareDerivedData();

    assert.equal(actor.system.attributes.speed.move, 35);
    assert.equal(actor.system.attributes.speed.step, 15);
  });

  test('calculates skill rank bonuses and total skill correctly', () => {
    // Skill item
    const skillItem = new DCCItem({
      name: 'Sneak',
      type: 'skill',
      system: {
        rank: 5,
        boonBonus: 1,
        stat: 'dex'
      }
    });

    // Gear item providing +2 to Sneak skill and +15 to DEX
    const gearItem = new DCCItem({
      name: 'Sneaky Boots',
      type: 'gear',
      system: {
        equipped: true,
        abilityModifiers: {
          dex: { value: 15, type: 'flat' } // unenhanced 5 + 15 = 20 -> mod = +5
        },
        skillModifiers: [
          { name: 'Sneak', bonus: 2 }
        ]
      }
    });

    // Crawler with unenhanced DEX 5
    const crawler = new DCCActor({
      type: 'crawler',
      system: {
        abilities: {
          dex: { unenhanced: 5 }
        }
      },
      items: [skillItem, gearItem]
    });

    crawler.prepareDerivedData();

    // DEX: 5 + 15 = 20 -> mod = +5
    assert.equal(crawler.system.abilities.dex.value, 20);
    assert.equal(crawler.system.abilities.dex.mod, 5);

    // Sneak: baseRank 5 + itemBonus 2 + boonBonus 1 = modifiedRank 8
    // Total Skill = modifiedRank 8 + statMod 5 = 13
    assert.equal(skillItem.system.itemBonus, 2);
    assert.equal(skillItem.system.boonBonus, 1);
    assert.equal(skillItem.system.modifiedRank, 8);
    assert.equal(skillItem.system.totalSkill, 13);
  });
});
