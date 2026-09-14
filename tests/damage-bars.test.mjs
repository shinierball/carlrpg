import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCCombatMetrics, getHpPerBar } from '../src/apps/combat-metrics.mjs';

describe('DCC RPG Damage Application & Health Bar Rounding Rules', () => {

  test('CON +2 bonus gives 2 HP per bar: 3 damage after DR removes 1 bar and ignores 1 excess damage', async () => {
    // User Specification: "If I have a +2 con bonus each bar has 2 hp. If I take 3 hp of damage after DR,
    // one bar is removed and the excess damage is ignored."
    const crawler = new DCCActor({
      name: 'Carl +2 CON',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 2 }
        },
        attributes: {
          hp: { value: 20, max: 20, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    assert.equal(getHpPerBar(crawler), 2, 'CON +2 should result in 2 HP per bar');

    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 3
    });

    assert.equal(result.dr, 0, 'No DR');
    assert.equal(result.damageAfterDR, 3, 'Damage after DR is 3');
    assert.equal(result.hpPerBar, 2, 'HP per bar is 2');
    assert.equal(result.barsRemoved, 1, 'Exactly 1 bar is removed (floor(3/2) = 1)');
    assert.equal(result.damageToHp, 2, '2 HP deducted for 1 full bar');
    assert.equal(result.excessDamage, 1, '1 excess point of damage is ignored');
    assert.equal(result.actualDamage, 2, 'Actual net damage applied is 2');
    assert.equal(result.newHp, 18, 'HP reduced from 20 to 18');
    assert.equal(crawler.system.attributes.hp.value, 18, 'Actor HP state updated to 18');
  });

  test('CON +3 bonus gives 3 HP per bar: 8 damage after DR removes 2 bars and ignores 2 excess damage', async () => {
    // User Specification: "If I have +3 con (3 hp per bar) and take 8 damage 2 bars should be removed
    // and the 2 remaining points of damage are ignored."
    const crawler = new DCCActor({
      name: 'Donut +3 CON',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 3 }
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    assert.equal(getHpPerBar(crawler), 3, 'CON +3 should result in 3 HP per bar');

    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 8
    });

    assert.equal(result.dr, 0, 'No DR');
    assert.equal(result.damageAfterDR, 8, 'Damage after DR is 8');
    assert.equal(result.hpPerBar, 3, 'HP per bar is 3');
    assert.equal(result.barsRemoved, 2, 'Exactly 2 bars removed (floor(8/3) = 2)');
    assert.equal(result.damageToHp, 6, '6 HP deducted for 2 full bars (2 * 3 = 6)');
    assert.equal(result.excessDamage, 2, '2 excess points of damage are ignored');
    assert.equal(result.actualDamage, 6, 'Actual net damage applied is 6');
    assert.equal(result.newHp, 24, 'HP reduced from 30 to 24');
    assert.equal(crawler.system.attributes.hp.value, 24, 'Actor HP state updated to 24');
  });

  test('Sub-bar damage is completely ignored (less than 1 full bar removed)', async () => {
    const crawler = new DCCActor({
      name: 'Tanky Crawler',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 3 } // 3 HP per bar
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    // 2 damage against 3 HP/bar -> 0 bars removed, 2 excess ignored
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 2
    });

    assert.equal(result.barsRemoved, 0, '0 bars removed for 2 damage with 3 HP/bar');
    assert.equal(result.damageToHp, 0, '0 HP deducted');
    assert.equal(result.excessDamage, 2, 'All 2 points of damage ignored as excess');
    assert.equal(result.actualDamage, 0, 'No net damage applied');
    assert.equal(crawler.system.attributes.hp.value, 30, 'HP remains unchanged at 30');
  });

  test('DR is subtracted first, and full-bar rounding applies to the remaining penetrating damage', async () => {
    const crawler = new DCCActor({
      name: 'Armored Crawler',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 2 } // 2 HP per bar
        },
        attributes: {
          hp: { value: 20, max: 20, temp: 0 },
          dr: { total: 3 }
        }
      }
    });

    // 8 raw damage - 3 DR = 5 damage after DR
    // With 2 HP/bar: 5 / 2 = 2 bars (4 HP) removed, 1 excess ignored
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 8
    });

    assert.equal(result.rawDamage, 8);
    assert.equal(result.dr, 3);
    assert.equal(result.damageAfterDR, 5);
    assert.equal(result.barsRemoved, 2);
    assert.equal(result.damageToHp, 4);
    assert.equal(result.excessDamage, 1);
    assert.equal(result.actualDamage, 4);
    assert.equal(crawler.system.attributes.hp.value, 16);
  });

  test('Temp HP absorbs damage first point-for-point; excess penetrating damage rounds to full bars', async () => {
    const crawler = new DCCActor({
      name: 'Shielded Crawler',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 2 } // 2 HP per bar
        },
        attributes: {
          hp: { value: 20, max: 20, temp: 5 },
          dr: { total: 0 }
        }
      }
    });

    // 8 damage: 5 absorbed by Temp HP, 3 penetrates to regular HP
    // With 2 HP/bar: 3 / 2 = 1 bar (2 HP) removed, 1 excess ignored
    // Total actual damage = 5 (temp) + 2 (hp) = 7
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 8
    });

    assert.equal(result.tempDamage, 5);
    assert.equal(result.tempRemaining, 0);
    assert.equal(result.barsRemoved, 1);
    assert.equal(result.damageToHp, 2);
    assert.equal(result.excessDamage, 1);
    assert.equal(result.actualDamage, 7);
    assert.equal(crawler.system.attributes.hp.temp, 0);
    assert.equal(crawler.system.attributes.hp.value, 18);
  });

  test('Temp HP absorbing full damage prevents any HP bar loss', async () => {
    const crawler = new DCCActor({
      name: 'Heavy Shield Crawler',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 3 } // 3 HP per bar
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 10 },
          dr: { total: 0 }
        }
      }
    });

    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: crawler,
      rawDamage: 7
    });

    assert.equal(result.tempDamage, 7);
    assert.equal(result.tempRemaining, 3);
    assert.equal(result.barsRemoved, 0);
    assert.equal(result.damageToHp, 0);
    assert.equal(result.excessDamage, 0);
    assert.equal(result.actualDamage, 7);
    assert.equal(crawler.system.attributes.hp.temp, 3);
    assert.equal(crawler.system.attributes.hp.value, 30);
  });

  test('DCCActor.applyDamage method delegates to DCCCombatMetrics with bar rounding', async () => {
    const crawler = new DCCActor({
      name: 'Actor Method Tester',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 2 }
        },
        attributes: {
          hp: { value: 20, max: 20, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    // Take 3 damage on actor directly
    const result = await crawler.applyDamage(3);

    assert.equal(result.barsRemoved, 1);
    assert.equal(result.damageToHp, 2);
    assert.equal(result.excessDamage, 1);
    assert.equal(crawler.system.attributes.hp.value, 18);
  });

  test('Derives HP per bar from unenhanced CON score if modifier not pre-computed', async () => {
    const crawler = new DCCActor({
      name: 'Uncomputed Crawler',
      type: 'crawler',
      system: {
        abilities: {
          con: { unenhanced: 6 } // score 6 gives mod +3
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    assert.equal(getHpPerBar(crawler), 3, 'CON score 6 should derive 3 HP per bar');

    const result = await crawler.applyDamage(8);
    assert.equal(result.barsRemoved, 2);
    assert.equal(result.damageToHp, 6);
    assert.equal(result.excessDamage, 2);
    assert.equal(crawler.system.attributes.hp.value, 24);
  });

  test('Fallbacks gracefully to maxHp / 10 for NPC without abilities block', async () => {
    const goblin = new DCCActor({
      name: 'Goblin Raider',
      type: 'npc',
      system: {
        attributes: {
          hp: { value: 40, max: 40, temp: 0 },
          dr: { total: 0 }
        }
      }
    });

    assert.equal(getHpPerBar(goblin), 4, 'Max HP 40 / 10 should give 4 HP per bar');

    // 10 damage -> 10 / 4 = 2 bars (8 HP) removed, 2 excess ignored
    const result = await goblin.applyDamage(10);
    assert.equal(result.barsRemoved, 2);
    assert.equal(result.damageToHp, 8);
    assert.equal(result.excessDamage, 2);
    assert.equal(goblin.system.attributes.hp.value, 32);
  });

  test('Multiplier interactions (Crit 2x, Half 0.5x) work correctly with damage bar rounding', async () => {
    const crawler = new DCCActor({
      name: 'Crit Victim',
      type: 'crawler',
      system: {
        abilities: {
          con: { mod: 3 } // 3 HP per bar
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 0 },
          dr: { total: 1 }
        }
      }
    });

    // Crit 2x on 5 raw damage = 10 raw - 1 DR = 9 damage after DR
    // 9 / 3 = 3 bars removed (9 HP damage), 0 excess ignored
    const critRes = await crawler.applyDamage(5, { multiplier: 2 });
    assert.equal(critRes.rawDamage, 10);
    assert.equal(critRes.dr, 1);
    assert.equal(critRes.damageAfterDR, 9);
    assert.equal(critRes.barsRemoved, 3);
    assert.equal(critRes.damageToHp, 9);
    assert.equal(critRes.excessDamage, 0);
    assert.equal(crawler.system.attributes.hp.value, 21);

    // Half 0.5x on 7 raw damage = 3 raw - 1 DR = 2 damage after DR
    // 2 / 3 = 0 bars removed, 2 excess ignored
    const halfRes = await crawler.applyDamage(7, { multiplier: 0.5 });
    assert.equal(halfRes.rawDamage, 3);
    assert.equal(halfRes.dr, 1);
    assert.equal(halfRes.damageAfterDR, 2);
    assert.equal(halfRes.barsRemoved, 0);
    assert.equal(halfRes.excessDamage, 2);
    assert.equal(crawler.system.attributes.hp.value, 21); // Unchanged
  });
});
