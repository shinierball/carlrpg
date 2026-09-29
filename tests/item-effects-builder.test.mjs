import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { LootDataModel } from '../src/models/items/loot-model.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

describe('DCC RPG - Item Effects & Outcome Builder 2.0 Subsystem', () => {
  let crawler;
  let mob;

  before(() => {
    CONFIG.Item.documentClass = DCCItem;
    CONFIG.Actor.documentClass = DCCActor;
    CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
    CONFIG.Item.dataModels.loot = LootDataModel;
    CONFIG.Item.dataModels.gear = GearDataModel;
  });

  beforeEach(() => {
    globalThis.canvas = {
      scene: { id: 'scene-dungeon-floor-1' },
      grid: {
        measureDistance: (t1, t2) => {
          const dx = (t2.x ?? 0) - (t1.x ?? 0);
          const dy = (t2.y ?? 0) - (t1.y ?? 0);
          return Math.round(Math.hypot(dx, dy));
        }
      },
      tokens: {
        placeables: [],
        controlled: []
      }
    };

    crawler = new DCCActor({
      id: 'crawler-carl',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 20, max: 40, hpPerBar: 4 },
          mana: { value: 0, max: 10 }
        }
      }
    });

    mob = new DCCActor({
      id: 'mob-goblin',
      name: 'Goblin Bruiser',
      type: 'mob',
      system: {
        abilities: {
          con: { value: 6, mod: 3 }
        },
        attributes: {
          hp: { value: 6, max: 15, hpPerBar: 3 }
        }
      }
    });

    const tokenCrawler = { x: 0, y: 0, actor: crawler };
    const tokenMob = { x: 10, y: 0, actor: mob };
    crawler.token = { object: tokenCrawler };
    mob.token = { object: tokenMob };
    globalThis.canvas.tokens.placeables = [tokenCrawler, tokenMob];
    globalThis.canvas.tokens.controlled = [tokenCrawler];
  });

  describe('1. Schema & Data Model Validation', () => {
    it('LootDataModel defines executionMode, charges, spell/table links, and outcomes', () => {
      const model = new LootDataModel();
      assert.equal(model.quantity, 1);
      assert.equal(model.cooldown, 'None');
      assert.equal(model.lootType, 'consumable');
      assert.equal(model.executionMode, '');
      assert.deepEqual(model.charges, { value: 0, max: 0 });
      assert.equal(model.spellId, '');
      assert.equal(model.spellName, '');
      assert.equal(model.tableUuid, '');
      assert.equal(model.tableName, '');
      assert.deepEqual(model.outcomes, []);
    });

    it('GearDataModel defines hasActivatedAbility, executionMode, cooldown, charges, and outcomes', () => {
      const model = new GearDataModel();
      assert.equal(model.hasActivatedAbility, false);
      assert.equal(model.executionMode, 'all');
      assert.equal(model.cooldown, 'None');
      assert.deepEqual(model.charges, { value: 0, max: 0 });
      assert.deepEqual(model.outcomes, []);
    });
  });

  describe('2. Actor Helper Methods for Outcomes', () => {
    it('actor.mendInjury mends minor, major, or all injuries correctly', async () => {
      const minorInjury = new DCCItem({
        id: 'inj-minor',
        name: 'Sprained Wrist',
        type: 'debuff',
        system: { injurySeverity: 'minor' }
      }, crawler);
      const majorInjury = new DCCItem({
        id: 'inj-major',
        name: 'Shattered Femur',
        type: 'debuff',
        system: { injurySeverity: 'major' }
      }, crawler);
      crawler.items.push(minorInjury, majorInjury);

      // Mend minor
      const mendedMinor = await crawler.mendInjury('minor');
      assert.equal(mendedMinor.length, 1);
      assert.equal(mendedMinor[0].name, 'Sprained Wrist');
      assert.ok(!crawler.items.some(i => i.id === 'inj-minor'));
      assert.ok(crawler.items.some(i => i.id === 'inj-major'));

      // Mend major
      const mendedMajor = await crawler.mendInjury('major');
      assert.equal(mendedMajor.length, 1);
      assert.equal(mendedMajor[0].name, 'Shattered Femur');
      assert.ok(!crawler.items.some(i => i.id === 'inj-major'));
    });

    it('actor.cureDebuffs removes filtered or all debuffs', async () => {
      const burned = new DCCItem({ id: 'deb-1', name: 'Burned', type: 'debuff', system: {} }, crawler);
      const poisoned = new DCCItem({ id: 'deb-2', name: 'Poisoned', type: 'debuff', system: {} }, crawler);
      crawler.items.push(burned, poisoned);

      // Cure Burned specifically
      const curedSpecific = await crawler.cureDebuffs('Burned');
      assert.equal(curedSpecific.length, 1);
      assert.equal(curedSpecific[0].name, 'Burned');
      assert.ok(crawler.items.some(i => i.id === 'deb-2'));

      // Cure all remaining
      const curedAll = await crawler.cureDebuffs('all');
      assert.equal(curedAll.length, 1);
      assert.equal(curedAll[0].name, 'Poisoned');
      assert.equal(crawler.items.filter(i => i.type === 'debuff').length, 0);
    });

    it('actor.applyHealingBars restores health bars capped at max HP', async () => {
      // Con 10 => mod 4 => 4 HP per bar, max 40 HP. Currently 20 HP.
      // 3 bars => 3 * 4 = 12 HP -> 32 HP
      const res1 = await crawler.applyHealingBars(3);
      assert.equal(res1.actualHealed, 12);
      assert.equal(res1.newHp, 32);

      // 5 bars => 5 * 4 = 20 HP, capped at max 40 HP (heals 8 HP)
      const res2 = await crawler.applyHealingBars(5);
      assert.equal(res2.actualHealed, 8);
      assert.equal(res2.newHp, 40);
    });

    it('actor.applyHoT creates a structured heal buff with healingPerRound', async () => {
      const hotItem = await crawler.applyHoT({
        name: 'Troll Blood Elixir',
        healBars: 2,
        rounds: 4
      });
      assert.ok(hotItem);
      assert.equal(hotItem.name, 'Troll Blood Elixir');
      assert.equal(hotItem.system.buffType, 'heal');
      assert.equal(hotItem.system.healingPerRound, '2 bars');
      assert.equal(hotItem.system.durationRounds, 4);
    });

    it('actor.increaseSkillRank permanently updates skill rank', async () => {
      const skill = new DCCItem({
        id: 'sk-budge',
        name: 'Budge',
        type: 'skill',
        system: { rank: 2 }
      }, crawler);
      crawler.items.push(skill);

      const res = await crawler.increaseSkillRank('Budge', 3);
      assert.equal(res.previousRank, 2);
      assert.equal(res.newRank, 5);
      assert.equal(skill.system.rank, 5);
    });

    it('actor.increaseUnenhancedStat permanently updates unenhanced stat and recalculates', async () => {
      const origUnenhanced = crawler.system.abilities.str.unenhanced || 10;
      const res = await crawler.increaseUnenhancedStat('str', 2);
      assert.equal(res.newUnenhanced, origUnenhanced + 2);
      assert.equal(crawler.system.abilities.str.unenhanced, 12);
    });
  });

  describe('3. Multi-Effect Consumable Potion (Guaranteed Combo)', () => {
    it('executes all guaranteed effects simultaneously in combo card mode', async () => {
      // Setup crawler with an injury, a debuff, and reduced HP
      crawler.system.attributes.hp.value = 16; // 4 bars missing
      const injury = new DCCItem({ id: 'inj-wrist', name: 'Sprained Wrist', type: 'debuff', system: { injurySeverity: 'minor' } }, crawler);
      const debuff = new DCCItem({ id: 'deb-bleed', name: 'Bleeding', type: 'debuff', system: {} }, crawler);
      crawler.items.push(injury, debuff);

      const masterElixir = new DCCItem({
        id: 'item-master-elixir',
        name: 'Master Restoration Elixir',
        type: 'loot',
        system: {
          quantity: 2,
          lootType: 'consumable',
          executionMode: 'all',
          outcomes: [
            { name: 'Instant Healing', type: 'heal', healBars: 2, targetType: 'self' },
            { name: 'Soothing Salve', type: 'heal_over_time', healBars: 1, rounds: 3, targetType: 'self' },
            { name: 'Bone Setting', type: 'mend_injury', injurySeverity: 'minor', targetType: 'self' },
            { name: 'Detox Cleanse', type: 'cure_debuff', cureFilter: 'all', targetType: 'self' },
            { name: 'Permanent Prowess', type: 'stat_permanent', stat: 'str', value: 1, targetType: 'self' }
          ]
        }
      }, crawler);
      crawler.items.push(masterElixir);

      const msg = await masterElixir.useLoot();
      assert.ok(msg, 'Chat message must be generated');

      // 1. Quantity decremented from 2 to 1
      assert.equal(masterElixir.system.quantity, 1);

      // 2. Instant Healing applied (+2 bars = +8 HP => 16 + 8 = 24)
      assert.equal(crawler.system.attributes.hp.value, 24);

      // 3. HoT applied
      const hot = crawler.items.find(i => i.name.includes('Soothing Salve'));
      assert.ok(hot, 'HoT buff item must be created on actor');
      assert.equal(hot.system.healingPerRound, '1 bar');

      // 4. Minor injury mended
      assert.ok(!crawler.items.some(i => i.id === 'inj-wrist'));

      // 5. Debuff cured
      assert.ok(!crawler.items.some(i => i.id === 'deb-bleed'));

      // 6. Permanent STR stat boosted
      assert.equal(crawler.system.abilities.str.unenhanced, 11);

      // 7. Chat card flags and HTML verification
      assert.equal(msg.flags['carl-rpg'].executionMode, 'all');
      assert.ok(msg.content.includes('Master Restoration Elixir'));
      assert.ok(msg.content.includes('GUARANTEED COMBO') || msg.content.includes('5 Effects') || msg.content.includes('dcc-multi-effect-card'));
    });
  });

  describe('4. Wand with Charges Pool', () => {
    it('wand decrements charges per cast and prevents use when depleted', async () => {
      const wand = new DCCItem({
        id: 'wand-spark',
        name: 'Wand of Magic Sparks',
        type: 'loot',
        system: {
          lootType: 'wand',
          charges: { value: 2, max: 2 },
          outcomes: [
            {
              name: 'Magic Spark',
              type: 'spell',
              damage: '1d6 + Int',
              damageType: 'Force',
              targetType: 'closest_mob'
            }
          ]
        }
      }, crawler);
      crawler.items.push(wand);

      // First use consumes 1 charge
      const msg1 = await wand.useLoot();
      assert.ok(msg1);
      assert.equal(wand.system.charges.value, 1);
      assert.ok(crawler.items.some(i => i.id === 'wand-spark'), 'Wand must remain in inventory after use');

      // Second use consumes last charge
      const msg2 = await wand.useLoot();
      assert.ok(msg2);
      assert.equal(wand.system.charges.value, 0);

      // Third use fails due to depletion
      const result3 = await wand.useLoot();
      assert.equal(result3?.error, 'depleted');
      assert.equal(wand.system.charges.value, 0);
    });
  });

  describe('5. Spell Scroll (Single Use Free Cast)', () => {
    it('scroll casts inscribed spell without requiring or spending caster mana', async () => {
      crawler.system.attributes.mana.value = 0; // 0 MP

      const scroll = new DCCItem({
        id: 'scroll-fireball',
        name: 'Scroll of Fireball',
        type: 'loot',
        system: {
          quantity: 1,
          lootType: 'scroll',
          outcomes: [
            {
              name: 'Level 5 Fireball',
              type: 'spell',
              damage: '2d12 + Int',
              damageType: 'Fire',
              targetType: 'closest_mob'
            }
          ]
        }
      }, crawler);
      crawler.items.push(scroll);

      const msg = await scroll.useLoot();
      assert.ok(msg);

      // Caster mana untouched
      assert.equal(crawler.system.attributes.mana.value, 0);

      // Scroll consumed and deleted
      assert.ok(!crawler.items.some(i => i.id === 'scroll-fireball'));
    });
  });

  describe('6. Activated Gear with On-Use Effects', () => {
    it('activates gear ability, enforces cooldown, and decrements charges or preserves gear', async () => {
      const ringOfMending = new DCCItem({
        id: 'ring-mending',
        name: 'Ring of Minor Mending',
        type: 'gear',
        system: {
          slot: 'accessory',
          equipped: true,
          quantity: 1,
          hasActivatedAbility: true,
          cooldown: 'Once per scene',
          charges: { value: 1, max: 1 },
          outcomes: [
            {
              name: 'Instant Mending',
              type: 'mend_injury',
              injurySeverity: 'minor',
              targetType: 'self'
            }
          ]
        }
      }, crawler);
      crawler.items.push(ringOfMending);

      const injury = new DCCItem({ id: 'inj-finger', name: 'Broken Finger', type: 'debuff', system: { injurySeverity: 'minor' } }, crawler);
      crawler.items.push(injury);

      // Activate ring via useGear()
      const msg = await ringOfMending.useGear();
      assert.ok(msg);

      // Injury mended
      assert.ok(!crawler.items.some(i => i.id === 'inj-finger'));

      // Charges decremented
      assert.equal(ringOfMending.system.charges.value, 0);

      // Gear remains in inventory (not deleted!)
      assert.ok(crawler.items.some(i => i.id === 'ring-mending'));

      // Scene cooldown recorded
      assert.equal(ringOfMending.getFlag('carl-rpg', 'lastUsedScene'), 'scene-dungeon-floor-1');

      // Second use blocked by scene limit
      const blocked = await ringOfMending.useGear();
      assert.equal(blocked?.error, 'cooldown_scene');
    });
  });

  describe('7. Item Sheet Context & Outcome Dropdowns', () => {
    it('populates availableBuffs, availableDebuffs, availableSpells, and outcome option groups', async () => {
      const elixir = new DCCItem({
        name: 'Grand Elixir',
        type: 'loot',
        system: {
          lootType: 'consumable',
          executionMode: 'all',
          outcomes: [
            { name: 'Heal', type: 'heal', healBars: 3 },
            { name: 'Cast', type: 'spell' }
          ]
        }
      });
      const sheet = new DCCItemSheet(elixir);
      const ctx = await sheet._prepareContext({});

      assert.ok(Array.isArray(ctx.availableBuffs));
      assert.ok(Array.isArray(ctx.availableDebuffs));
      assert.ok(Array.isArray(ctx.availableSpells));
      assert.ok(Array.isArray(ctx.availableRollTables));
      assert.ok(ctx.availableSpells.length > 0, 'Spells must be indexed from compendium/CONFIG');
      assert.equal(ctx.isScratchTicket, false);
      assert.equal(ctx.weightWarning, false, 'Guaranteed combo mode must not show 100% weight warning');
    });
  });

  describe('8. Chat Message Button Event Binding', () => {
    it('onRenderChatMessage triggers HoT, mend injury, cure debuff, skill boost, and stat boost handlers', async () => {
      const boundClicks = {};
      const mockHtml = {
        querySelectorAll: (selector) => {
          return [{
            dataset: {},
            addEventListener: (evt, fn) => { boundClicks[selector] = fn; }
          }];
        }
      };

      onRenderChatMessage({}, mockHtml, {});

      assert.ok(boundClicks['.dcc-apply-hot-btn'], 'HoT button click handler must be bound');
      assert.ok(boundClicks['.dcc-mend-injury-btn'], 'Mend injury button click handler must be bound');
      assert.ok(boundClicks['.dcc-cure-debuff-btn'], 'Cure debuff button click handler must be bound');
      assert.ok(boundClicks['.dcc-apply-skill-rank-btn'], 'Skill rank button click handler must be bound');
      assert.ok(boundClicks['.dcc-apply-stat-btn'], 'Stat boost button click handler must be bound');
      assert.ok(boundClicks['.dcc-roll-table-btn'], 'Roll table button click handler must be bound');

      // Test triggering HoT click
      const mockEv = { preventDefault: () => {} };
      const btnHoT = { dataset: { targetId: crawler.id, name: 'Regen Test', bars: '2', rounds: '3' } };
      globalThis.game = globalThis.game || {};
      globalThis.game.actors = { get: (id) => id === crawler.id ? crawler : null };
      globalThis.game.user = { targets: [] };

      // Execute HoT click
      let hotApplied = false;
      crawler.applyHoT = async (data) => {
        hotApplied = true;
        assert.equal(data.healBars, 2);
        assert.equal(data.rounds, 3);
      };
      // Bind click with custom target
      const mockBtnEl = {
        dataset: { targetId: crawler.id, name: 'Regen Test', bars: '2', rounds: '3' },
        addEventListener: (e, fn) => fn(mockEv)
      };
      const customHtml = {
        querySelectorAll: (sel) => sel === '.dcc-apply-hot-btn' ? [mockBtnEl] : []
      };
      onRenderChatMessage({}, customHtml, {});
      assert.ok(hotApplied, 'applyHoT must be invoked on crawler');
    });
  });
});
