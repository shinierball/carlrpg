import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCC_BUFFS, DCC_DAMAGE_TYPES, DCC_DEBUFFS } from '../src/data/buffs.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG Buffs & Debuffs Subsystem', () => {

  describe('1. Generic Buffs Dataset & Compendium Schema', () => {
    test('contains exactly 32 generic buffs meeting user specifications', () => {
      assert.equal(DCC_BUFFS.length, 32, 'Expected exactly 32 generic buffs');

      // 13 canonical damage types
      const expectedDamageTypes = [
        'Acid', 'Bludgeoning', 'Electric', 'Fire', 'Force',
        'Holy', 'Ice', 'Necrotic', 'Piercing', 'Poison',
        'Psychic', 'Slashing', 'Sonic'
      ];
      assert.deepEqual(DCC_DAMAGE_TYPES, expectedDamageTypes);

      // 5 stat buffs
      const expectedStats = ['str', 'int', 'con', 'dex', 'cha'];
      for (const stat of expectedStats) {
        const buff = DCC_BUFFS.find(b => b.system.buffType === 'stat' && b.system.stat === stat);
        assert.ok(buff, `Missing stat buff for ${stat}`);
        assert.equal(buff.system.value, 2, `Expected +2 bonus for ${stat} buff`);
      }

      // 1 temp health buff
      const tempHpBuff = DCC_BUFFS.find(b => b.system.buffType === 'tempHp');
      assert.ok(tempHpBuff, 'Missing Temporary Health Buff');
      assert.equal(tempHpBuff.system.value, 10, 'Expected +10 Temp HP');

      // 13 resistance buffs
      for (const dt of expectedDamageTypes) {
        const resBuff = DCC_BUFFS.find(b => b.system.buffType === 'resistance' && b.system.damageType === dt);
        assert.ok(resBuff, `Missing resistance buff for ${dt}`);
      }

      // 13 immunity buffs
      for (const dt of expectedDamageTypes) {
        const immBuff = DCC_BUFFS.find(b => b.system.buffType === 'immunity' && b.system.damageType === dt);
        assert.ok(immBuff, `Missing immunity buff for ${dt}`);
      }

      // Unique valid IDs
      const idSet = new Set();
      for (const buff of DCC_BUFFS) {
        assert.match(buff._id, /^dccbuf\d{10}$/, `Invalid ID format for ${buff.name}`);
        assert.equal(idSet.has(buff._id), false, `Duplicate ID: ${buff._id}`);
        idSet.add(buff._id);
        assert.equal(buff.type, 'buff');
      }
    });

    test('template.json registers buff and debuff item types with schemas', () => {
      const template = JSON.parse(fs.readFileSync('template.json', 'utf8'));
      assert.ok(template.Item.types.includes('buff'), 'template.json must include "buff" in Item.types');
      assert.ok(template.Item.types.includes('debuff'), 'template.json must include "debuff" in Item.types');
      assert.ok(template.Item.buff, 'template.json must define default schema for buff');
      assert.ok(template.Item.debuff, 'template.json must define default schema for debuff');
    });

    test('system.json registers carl-rpg.buffs compendium pack', () => {
      const system = JSON.parse(fs.readFileSync('system.json', 'utf8'));
      const buffsPack = system.packs.find(p => p.name === 'buffs');
      assert.ok(buffsPack, 'system.json must declare a "buffs" pack');
      assert.equal(buffsPack.path, 'packs/buffs');
      assert.equal(buffsPack.type, 'Item');
      assert.equal(buffsPack.system, 'carl-rpg');
    });
  });

  describe('2. Actor External Buffs & Derived Stats', () => {
    test('stat buff increases ability score, recalculates modifier, and flows to derived stats', () => {
      // Base crawler: 10 STR (mod +4), 10 CON (mod +4, max HP = 40), 10 INT (mod +4, max Mana = 10)
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            int: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 },
            dex: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'Strength Buff',     // +2 STR -> 12 STR (mod +4)
              buff2: 'Constitution Buff', // +2 CON -> 12 CON (mod +4)
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 },
            mana: { value: 10, max: 10 }
          }
        }
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.abilities.str.value, 12, 'STR should be increased by +2');
      assert.equal(crawler.system.abilities.str.buffBonus, 2);
      assert.equal(crawler.system.abilities.con.value, 12, 'CON should be increased by +2');
      assert.equal(crawler.system.abilities.con.buffBonus, 2);

      // Now set base CON to 19 (mod +4). A +2 buff takes it to 21 (mod +5)!
      crawler.system.abilities.con.unenhanced = 19;
      crawler.system.abilities.con.value = 19;
      crawler.prepareDerivedData();
      assert.equal(crawler.system.abilities.con.value, 21);
      assert.equal(crawler.system.abilities.con.mod, 5, 'DCC stat 21 should have modifier +5');
      assert.equal(crawler.system.attributes.hp.max, 50, 'Max HP should be 10 * conMod = 50');
    });

    test('temporary health buff sets and tracks temporary HP', () => {
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'Temporary Health Buff', // +10 Temp HP
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.attributes.hp.buffTemp, 10);
      assert.equal(crawler.system.attributes.hp.temp, 10);
    });

    test('supports up to 3 active external buffs simultaneously', () => {
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            int: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 },
            dex: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'dccbuf0000000001', // Strength Buff (+2)
              buff2: 'Fire Resistance Buff', // Fire Resist
              buff3: 'Ice Immunity Buff'     // Ice Immune
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.abilities.str.value, 12);
      assert.ok(crawler.hasResistance('Fire'), 'Actor should have Fire resistance');
      assert.ok(crawler.hasImmunity('Ice'), 'Actor should have Ice immunity');
      assert.equal(crawler.hasResistance('Acid'), false, 'Actor should not have Acid resistance');

      const active = crawler.getActiveBuffs();
      assert.equal(active.length, 3, 'Should resolve all 3 active buffs');
      assert.equal(active[0].name, 'Strength Buff');
      assert.equal(active[1].name, 'Fire Resistance Buff');
      assert.equal(active[2].name, 'Ice Immunity Buff');
    });
  });

  describe('3. Combat Damage Resistance & Immunity Integration', () => {
    test('immunity completely negates damage of that damage type', async () => {
      const target = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 10, unenhanced: 10, mod: 4 } // 1 bar = 4 HP
          },
          attributes: {
            externalBuffs: {
              buff1: 'Fire Immunity Buff',
              buff2: '',
              buff3: ''
            },
            dr: { total: 0 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });
      target.prepareDerivedData();

      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 25,
        damageType: 'Fire'
      });

      assert.equal(result.isImmune, true);
      assert.equal(result.rawDamage, 0);
      assert.equal(result.actualDamage, 0);
      assert.equal(target.system.attributes.hp.value, 40, 'HP should remain untouched');
    });

    test('resistance halves incoming damage before DR and damage bars', async () => {
      const target = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 10, unenhanced: 10, mod: 4 } // 1 bar = 4 HP
          },
          attributes: {
            externalBuffs: {
              buff1: 'Acid Resistance Buff',
              buff2: '',
              buff3: ''
            },
            dr: { armor: 2, total: 2 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });
      target.prepareDerivedData();

      // Raw damage = 20 Acid.
      // Resistance halves 20 -> 10.
      // DR absorbs 2 -> 8 penetrating damage.
      // HP bar size = 4 HP -> exactly 2 bars removed (8 HP).
      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 20,
        damageType: 'Acid'
      });

      assert.equal(result.isResistant, true);
      assert.equal(result.isImmune, false);
      assert.equal(result.rawDamage, 10, 'Damage should be halved to 10');
      assert.equal(result.dr, 2);
      assert.equal(result.damageAfterDR, 8);
      assert.equal(result.barsRemoved, 2);
      assert.equal(result.actualDamage, 8);
      assert.equal(target.system.attributes.hp.value, 32);
    });

    test('unresisted damage type applies normally', async () => {
      const target = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 10, unenhanced: 10, mod: 4 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'Sonic Resistance Buff',
              buff2: '',
              buff3: ''
            },
            dr: { total: 0 },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });
      target.prepareDerivedData();

      // Slashing damage is not Sonic resistance
      const result = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 12,
        damageType: 'Slashing'
      });

      assert.equal(result.isResistant, false);
      assert.equal(result.isImmune, false);
      assert.equal(result.rawDamage, 12);
      assert.equal(result.actualDamage, 12);
      assert.equal(target.system.attributes.hp.value, 28);
    });
  });

  describe('4. Character Sheet External Buffs Dropdown & UI Data', () => {
    test('crawler sheet getData prepares externalBuffSlots with precomputed optgroups', async () => {
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'dccbuf0000000001', // Strength Buff
              buff2: 'Temporary Health Buff',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        }
      });
      crawler.prepareDerivedData();

      const sheet = new DCCCrawlerSheet(crawler);
      const data = await sheet.getData();

      assert.ok(Array.isArray(data.externalBuffSlots), 'externalBuffSlots must be an array');
      assert.equal(data.externalBuffSlots.length, 3, 'Must have exactly 3 slots');

      const slot1 = data.externalBuffSlots[0];
      assert.equal(slot1.index, 1);
      assert.equal(slot1.key, 'buff1');
      assert.equal(slot1.isEmpty, false);
      assert.equal(slot1.name, 'Strength Buff');
      assert.equal(slot1.badge, 'STAT');
      assert.equal(slot1.badgeClass, 'dcc-buff-badge-stat');
      assert.ok(slot1.groups.length >= 4, 'Must include precomputed optgroups');

      // Verify slot 1 has Strength Buff marked selected
      const statGroup = slot1.groups.find(g => g.label.includes('Ability Score'));
      assert.ok(statGroup);
      const strOpt = statGroup.items.find(i => i.id === 'dccbuf0000000001');
      assert.ok(strOpt);
      assert.equal(strOpt.selected, true);

      // Verify slot 2 has Temp HP Buff marked selected
      const slot2 = data.externalBuffSlots[1];
      assert.equal(slot2.isEmpty, false);
      assert.equal(slot2.name, 'Temporary Health Buff');
      assert.equal(slot2.badge, 'TEMP HP');

      // Verify slot 3 is empty
      const slot3 = data.externalBuffSlots[2];
      assert.equal(slot3.isEmpty, true);
      assert.equal(slot3.name, '');
    });
  });

});
