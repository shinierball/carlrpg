import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCC_BUFFS, DCC_DAMAGE_TYPES, DCC_DEBUFFS } from '../src/data/buffs.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';

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
            str: { value: 20, unenhanced: 20 },
            int: { value: 14, unenhanced: 14 },
            con: { value: 8, unenhanced: 8 },
            dex: { value: 4, unenhanced: 4 },
            cha: { value: 2, unenhanced: 2 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'Strength Buff',     // +2 STR -> 22 STR (mod +5)
              buff2: 'Constitution Buff', // +2 CON -> 10 CON (mod +4, max HP 40)
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 },
            mana: { value: 14, max: 14 }
          }
        }
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.abilities.str.value, 22, 'STR should be increased by +2');
      assert.equal(crawler.system.abilities.str.buffBonus, 2);
      assert.equal(crawler.system.abilities.con.value, 10, 'CON should be increased by +2');
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
            str: { value: 20, unenhanced: 20 },
            int: { value: 14, unenhanced: 14 },
            con: { value: 8, unenhanced: 8 },
            dex: { value: 4, unenhanced: 4 },
            cha: { value: 2, unenhanced: 2 }
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

      assert.equal(crawler.system.abilities.str.value, 22);
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
            str: { value: 20, unenhanced: 20 },
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

  describe('5. Multiple Stat & Damage Modifiers on Buffs and Debuffs', () => {
    test('buff item with multiple statModifiers grants all stat bonuses to actor', () => {
      const heroBuff = new DCCItem({
        id: 'buff-heroism',
        name: 'Heroism Buff',
        type: 'buff',
        system: {
          statModifiers: [
            { stat: 'str', value: 3 },
            { stat: 'dex', value: 2 },
            { stat: 'cha', value: 4 }
          ]
        }
      });

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            dex: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 },
            int: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'buff-heroism',
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [heroBuff]
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.abilities.str.value, 13, 'STR should be 10 + 3 = 13');
      assert.equal(crawler.system.abilities.str.buffBonus, 3);
      assert.equal(crawler.system.abilities.dex.value, 12, 'DEX should be 10 + 2 = 12');
      assert.equal(crawler.system.abilities.dex.buffBonus, 2);
      assert.equal(crawler.system.abilities.cha.value, 14, 'CHA should be 10 + 4 = 14');
      assert.equal(crawler.system.abilities.cha.buffBonus, 4);
      assert.equal(crawler.system.abilities.con.value, 10, 'CON should remain unmodified');
    });

    test('buff item with multiple damageModifiers grants multipliers, resistances, temp HP, and damage bonuses', () => {
      const battleBuff = new DCCItem({
        id: 'buff-infernal',
        name: 'Infernal Rage',
        type: 'buff',
        system: {
          damageModifiers: [
            { type: 'damageMultiplier', damageType: '', value: 2 },
            { type: 'resistance', damageType: 'Fire' },
            { type: 'tempHp', value: 25 },
            { type: 'damageBonus', damageType: 'Fire', value: 5 }
          ]
        }
      });

      const sword = new DCCItem({
        id: 'item-sword',
        name: 'Flame Blade',
        type: 'attack',
        system: {
          toHitStat: 'str',
          toHitRank: 2,
          damageParts: [
            { dice: '1d8', stat: 'str', type: 'Slashing', value: 0 }
          ]
        }
      });

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10, mod: 4 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'buff-infernal',
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [battleBuff, sword]
      });

      crawler.prepareDerivedData();

      // Check Temp HP
      assert.equal(crawler.system.attributes.hp.temp, 25, 'Temp HP should be 25');
      assert.equal(crawler.system.attributes.hp.buffTemp, 25);

      // Check Fire resistance
      assert.equal(crawler.hasResistance('Fire'), true, 'Should have Fire resistance');
      assert.equal(crawler.getDamageReduction('Fire').isResistant, true);

      // Check damage parts including buff damageBonus
      const parts = crawler.getAttackDamageParts(sword);
      const fireBonus = parts.find(p => p.type === 'Fire');
      assert.ok(fireBonus, 'Fire bonus damage part should be added from buff damageModifiers');
      assert.equal(fireBonus.value, 5);
      assert.equal(fireBonus.source, 'Infernal Rage');

      // Check damage multiplier active on actor
      assert.equal(crawler.system.attributes.damageMultiplier, 2, 'Total damage multiplier should be 2');
    });

    test('debuff item with multiple statModifiers inflicts penalties to multiple stats', () => {
      const curseDebuff = new DCCItem({
        id: 'debuff-curse',
        name: 'Curse of Enfeeblement',
        type: 'debuff',
        system: {
          statModifiers: [
            { stat: 'str', value: -4 },
            { stat: 'con', value: -2 }
          ]
        }
      });

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 }
          },
          attributes: {
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [curseDebuff]
      });

      crawler.prepareDerivedData();

      assert.equal(crawler.system.abilities.str.value, 6, 'STR should be 10 - 4 = 6');
      assert.equal(crawler.system.abilities.con.value, 8, 'CON should be 10 - 2 = 8');
      assert.equal(crawler.system.abilities.con.mod, 3, 'CON 8 should have modifier +3');
      assert.equal(crawler.system.attributes.hp.max, 30, 'HP max should be 10 * 3 = 30');
    });

    test('debuff item with multiple damageModifiers applies multi-typed damage reductions', () => {
      const elementalCurse = new DCCItem({
        id: 'debuff-suppression',
        name: 'Elemental Suppression',
        type: 'debuff',
        system: {
          damageModifiers: [
            { type: 'reduction', damageType: 'Fire', reductionPercent: 50, rounding: 'up' },
            { type: 'reduction', damageType: 'Ice', reductionPercent: 25, rounding: 'down' },
            { type: 'immunity', damageType: 'Acid' }
          ]
        }
      });

      const target = new DCCActor({
        name: 'Goblin',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 10, unenhanced: 10, mod: 4 }
          },
          attributes: {
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [elementalCurse]
      });

      target.prepareDerivedData();

      const fireRed = target.getDamageReduction('Fire');
      assert.equal(fireRed.percent, 0.5, 'Fire reduction should be 50%');
      assert.equal(fireRed.rounding, 'up');

      const iceRed = target.getDamageReduction('Ice');
      assert.equal(iceRed.percent, 0.25, 'Ice reduction should be 25%');
      assert.equal(iceRed.rounding, 'down');

      const acidRed = target.getDamageReduction('Acid');
      assert.equal(acidRed.isImmune, true, 'Should be immune to Acid');
    });

    test('DCCItemSheet getData and _updateObject properly serialize and handle statModifiers and damageModifiers', async () => {
      const buff = new DCCItem({
        id: 'buff-test',
        name: 'Custom Test Buff',
        type: 'buff',
        system: {
          statModifiers: [{ stat: 'str', value: 2 }],
          damageModifiers: [{ type: 'damageMultiplier', value: 2 }]
        }
      });

      const sheet = new DCCItemSheet(buff);
      const data = await sheet.getData();
      assert.ok(Array.isArray(data.system.statModifiers), 'statModifiers should be an array');
      assert.equal(data.system.statModifiers.length, 1);
      assert.ok(Array.isArray(data.system.damageModifiers), 'damageModifiers should be an array');
      assert.equal(data.system.damageModifiers.length, 1);

      // Verify form data submission via _updateObject normalizes dot-notation keys
      const formData = {
        'system.statModifiers.0.stat': 'dex',
        'system.statModifiers.0.value': 3,
        'system.statModifiers.1.stat': 'int',
        'system.statModifiers.1.value': 4,
        'system.damageModifiers.0.type': 'resistance',
        'system.damageModifiers.0.damageType': 'Fire'
      };

      await sheet._updateObject({}, formData);
      assert.equal(buff.system.statModifiers.length, 2);
      assert.equal(buff.system.statModifiers[0].stat, 'dex');
      assert.equal(buff.system.statModifiers[1].stat, 'int');
      assert.equal(buff.system.damageModifiers.length, 1);
      assert.equal(buff.system.damageModifiers[0].type, 'resistance');
      assert.equal(buff.system.damageModifiers[0].damageType, 'Fire');
    });
  });

  describe('6. Any Item of Type Buff Selectable in External Buff Slots', () => {
    test('any owned buff item on actor is listed under Character Buffs and selectable in external buff slots', async () => {
      const divineGrace = new DCCItem({
        id: 'buff-divine-grace',
        name: 'Divine Grace',
        type: 'buff',
        system: {
          buffType: 'stat',
          stat: 'cha',
          value: 3
        }
      });

      const primalMight = new DCCItem({
        id: 'buff-primal-might',
        name: 'Primal Might',
        type: 'buff',
        system: {
          statModifiers: [
            { stat: 'str', value: 4 },
            { stat: 'con', value: 2 }
          ]
        }
      });

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'buff-divine-grace',
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [divineGrace, primalMight]
      });

      crawler.prepareDerivedData();
      assert.equal(crawler.system.abilities.cha.value, 13, 'CHA should be 10 + 3 = 13 from owned buff');

      const sheet = new DCCCrawlerSheet(crawler);
      const data = await sheet.getData();

      const slot1 = data.externalBuffSlots[0];
      const charGroup = slot1.groups.find(g => g.label.includes('Character Buffs'));
      assert.ok(charGroup, 'Character Buffs optgroup must exist');
      assert.equal(charGroup.items.length, 2, 'Should include both owned buffs');

      const graceOpt = charGroup.items.find(i => i.id === 'buff-divine-grace');
      assert.ok(graceOpt);
      assert.equal(graceOpt.selected, true, 'Divine Grace should be selected in slot 1');

      const mightOpt = charGroup.items.find(i => i.id === 'buff-primal-might');
      assert.ok(mightOpt);
      assert.equal(mightOpt.selected, false);
      assert.ok(mightOpt.label.includes('+4 STR'), 'Option label should show stat modifiers');
    });

    test('any world item of type buff is listed under World Buffs and selectable in external buff slots', async () => {
      const worldFury = new DCCItem({
        id: 'world-buff-dragon-fury',
        name: 'World Dragon Fury',
        type: 'buff',
        system: {
          buffType: 'damageMultiplier',
          damageMultiplier: 2,
          value: 2
        }
      });

      if (!globalThis.game) globalThis.game = {};
      if (!globalThis.game.items) globalThis.game.items = [];
      globalThis.game.items.push(worldFury);

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: 'world-buff-dragon-fury',
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: []
      });

      crawler.prepareDerivedData();
      assert.equal(crawler.system.attributes.damageMultiplier, 2, 'Damage multiplier should be applied from world buff');

      const sheet = new DCCCrawlerSheet(crawler);
      const data = await sheet.getData();

      const slot1 = data.externalBuffSlots[0];
      const worldGroup = slot1.groups.find(g => g.label.includes('World Buffs'));
      assert.ok(worldGroup, 'World Buffs optgroup must exist');
      const furyOpt = worldGroup.items.find(i => i.id === 'world-buff-dragon-fury');
      assert.ok(furyOpt, 'World buff item should be present in optgroup');
      assert.equal(furyOpt.selected, true, 'World buff should be selected');
    });

    test('dropping a buff item onto an external buff slot automatically assigns the slot', async () => {
      const heroBuff = new DCCItem({
        id: 'buff-drop-test',
        name: 'Drop Test Buff',
        type: 'buff',
        system: {
          buffType: 'stat',
          stat: 'dex',
          value: 2
        }
      });

      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            dex: { value: 10, unenhanced: 10 }
          },
          attributes: {
            externalBuffs: {
              buff1: '',
              buff2: '',
              buff3: ''
            },
            hp: { value: 40, max: 40, temp: 0 }
          }
        },
        items: [heroBuff]
      });

      const sheet = new DCCCrawlerSheet(crawler);

      // Simulate drop event on buff slot 2
      const fakeEvent = {
        target: {
          closest: (selector) => {
            if (selector.includes('dcc-buff-slot')) {
              return { dataset: { slot: 'buff2' } };
            }
            return null;
          }
        }
      };

      // Mock Item.fromDropData
      const originalFromDropData = globalThis.Item.fromDropData;
      globalThis.Item.fromDropData = async () => heroBuff;

      try {
        await sheet._onDropItem(fakeEvent, { type: 'Item', uuid: 'buff-drop-test' });
        assert.equal(crawler.system.attributes.externalBuffs.buff2, 'buff-drop-test', 'Slot buff2 should be assigned');
      } finally {
        globalThis.Item.fromDropData = originalFromDropData;
      }
    });
  });

});

