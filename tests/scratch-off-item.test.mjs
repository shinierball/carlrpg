import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { LootDataModel } from '../src/models/items/loot-model.mjs';
import { DCC_ITEMS } from '../src/data/items.mjs';
import { getHpPerBar } from '../src/apps/combat-metrics.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

describe('DCC RPG - Scratch-off Ticket & Multi-Outcome Consumable Items', () => {
  let crawler;
  let mobA;
  let mobB;
  let ticketItem;

  before(() => {
    CONFIG.Item.documentClass = DCCItem;
    CONFIG.Actor.documentClass = DCCActor;
    CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
    CONFIG.Item.dataModels.loot = LootDataModel;
  });

  beforeEach(() => {
    // Reset global canvas and scene
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
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          int: { value: 10, mod: 4 },
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 }
        }
      }
    });

    mobA = new DCCActor({
      id: 'mob-a',
      name: 'Goblin Skulker',
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

    mobB = new DCCActor({
      id: 'mob-b',
      name: 'Llama Chieftain',
      type: 'mob',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 20, max: 40, hpPerBar: 4 }
        }
      }
    });

    const tokenCrawler = { x: 0, y: 0, actor: crawler };
    const tokenMobA = { x: 15, y: 0, actor: mobA }; // 15 ft away (closest)
    const tokenMobB = { x: 60, y: 0, actor: mobB }; // 60 ft away

    crawler.token = { object: tokenCrawler };
    mobA.token = { object: tokenMobA };
    mobB.token = { object: tokenMobB };

    globalThis.canvas.tokens.placeables = [tokenCrawler, tokenMobA, tokenMobB];
    globalThis.canvas.tokens.controlled = [tokenCrawler];

    // Find canonical ticket definition
    const canonicalTicket = DCC_ITEMS.find(i => i.name.includes('Scratch-off Ticket'));
    ticketItem = new DCCItem(structuredClone(canonicalTicket), crawler);
    crawler.items.push(ticketItem);
  });

  it('1. LootDataModel schema includes quantity, cooldown, lootType, and outcomes array', () => {
    const defaultModel = new LootDataModel();
    assert.equal(defaultModel.quantity, 1);
    assert.equal(defaultModel.cooldown, 'None');
    assert.equal(defaultModel.lootType, 'consumable');
    assert.deepEqual(defaultModel.outcomes, []);

    const scratchModel = new LootDataModel({
      quantity: 6,
      cooldown: 'Once per scene',
      lootType: 'scratch_ticket',
      outcomes: [
        { name: 'Fireball', weight: 50, type: 'spell' },
        { name: 'Custard', weight: 50, type: 'heal' }
      ]
    });
    assert.equal(scratchModel.quantity, 6);
    assert.equal(scratchModel.cooldown, 'Once per scene');
    assert.equal(scratchModel.lootType, 'scratch_ticket');
    assert.equal(scratchModel.outcomes.length, 2);
  });

  it('2. DCCItem prepares outcomes cleanly as an array and handles object-mapped formData', () => {
    const item = new DCCItem({
      name: 'Test Ticket',
      type: 'loot',
      system: {
        quantity: 6,
        outcomes: {
          '0': { name: 'Effect 1', weight: 50 },
          '1': { name: 'Effect 2', weight: 50 }
        }
      }
    });
    item.prepareData();
    assert.ok(Array.isArray(item.system.outcomes), 'outcomes must be prepared as an array');
    assert.equal(item.system.outcomes.length, 2);
    assert.equal(item.system.outcomes[0].name, 'Effect 1');
  });

  it('3. Scratch-off ticket enforces 1 use per scene restriction', async () => {
    assert.equal(ticketItem.system.quantity, 6);

    // First use in scene-dungeon-floor-1 succeeds
    const msg1 = await ticketItem.useLoot();
    assert.ok(msg1, 'First use in scene must succeed');
    assert.equal(ticketItem.system.quantity, 5, 'Quantity must decrement to 5');
    assert.equal(ticketItem.getFlag('carl-rpg', 'lastUsedScene'), 'scene-dungeon-floor-1');

    // Second use in same scene is blocked
    const result2 = await ticketItem.useLoot();
    assert.equal(result2?.error, 'cooldown_scene', 'Second use in same scene must be blocked');
    assert.equal(ticketItem.system.quantity, 5, 'Quantity must NOT decrement when blocked');

    // Transitioning to a new scene allows another use
    globalThis.canvas.scene.id = 'scene-boss-chamber';
    const msg3 = await ticketItem.useLoot();
    assert.ok(msg3, 'Use in new scene must succeed');
    assert.equal(ticketItem.system.quantity, 4, 'Quantity must decrement to 4 in new scene');
    assert.equal(ticketItem.getFlag('carl-rpg', 'lastUsedScene'), 'scene-boss-chamber');
  });

  it('4. Scratch-off ticket decrements uses and deletes/removes on final use', async () => {
    // Set quantity to 1 for final scratch
    await ticketItem.update({ 'system.quantity': 1 });
    assert.equal(ticketItem.system.quantity, 1);

    await ticketItem.useLoot();

    const remaining = crawler.items.find(i => i.id === ticketItem.id);
    assert.ok(!remaining, 'Item must be removed from crawler inventory when final use is consumed');
  });

  it('5. Target detection accurately selects the closest alive mob on the scene', async () => {
    // Use ticket and inspect target captured in chat card flags
    const msg = await ticketItem.useLoot();
    assert.ok(msg, 'Chat message must be generated');

    const flags = msg.flags?.['carl-rpg'];
    assert.ok(flags, 'carl-rpg flags must be present on chat card');
    assert.equal(flags.targetId, 'mob-a', 'Closest mob (15ft) must be targeted over distant mob (60ft)');
    assert.ok(msg.content.includes('Goblin Skulker'), 'Chat card content must name closest mob');
    assert.ok(msg.content.includes('15 ft away'), 'Chat card content must specify distance');
  });

  it('6. Outcome resolution for Level 5 Fireball calculates 2d12 + Int Mod Fire damage', async () => {
    // Force fireball outcome by setting outcomes to 100% fireball
    await ticketItem.update({
      'system.outcomes': [
        {
          name: 'Level 5 Fireball',
          weight: 100,
          type: 'spell',
          damage: '2d12 + Int',
          damageType: 'Fire',
          targetType: 'closest_mob',
          debuff: 'Burned',
          description: 'A beach ball-sized sphere of flame'
        }
      ]
    });

    const msg = await ticketItem.useLoot();
    const flags = msg.flags?.['carl-rpg'];
    assert.equal(flags.outcome.name, 'Level 5 Fireball');
    assert.equal(flags.outcome.type, 'spell');

    // Crawler Int mod is 4 -> 2d12 + 4. Mock roll evaluates dice, or formula contains int mod
    assert.ok(flags.damage >= 6, `Damage (${flags.damage}) should be at least 2 + 4 = 6`);
    assert.ok(msg.content.includes('Level 5 Fireball'));
    assert.ok(msg.content.includes('Burned Debuff'));
    assert.ok(msg.content.includes('dcc-apply-damage-btn'));
  });

  it('7. Outcome resolution for Custard heals 5 Health Bars for closest mob', async () => {
    // Force custard outcome by setting outcomes to 100% custard
    await ticketItem.update({
      'system.outcomes': [
        {
          name: 'Healing Blob of Custard',
          weight: 100,
          type: 'heal',
          healBars: 5,
          targetType: 'closest_mob',
          description: 'Soothing vanilla custard'
        }
      ]
    });

    const msg = await ticketItem.useLoot();
    const flags = msg.flags?.['carl-rpg'];
    assert.equal(flags.outcome.name, 'Healing Blob of Custard');
    assert.equal(flags.outcome.type, 'heal');
    assert.equal(flags.healBars, 5);

    // Target is mobA whose hpPerBar is 3 (Con mod 3) -> 5 * 3 = 15 HP
    const expectedHp = 5 * getHpPerBar(mobA);
    assert.equal(flags.healAmount, expectedHp);
    assert.ok(msg.content.includes('Healing Blob of Custard'));
    assert.ok(msg.content.includes('+5 Health Bars'));
    assert.ok(msg.content.includes('dcc-apply-healing-btn'));
  });

  it('8. Canonical DCC_ITEMS dataset contains the Scratch-off Ticket ready for use', () => {
    const ticket = DCC_ITEMS.find(i => i.name.includes('Scratch-off Ticket'));
    assert.ok(ticket, 'DCC_ITEMS must include Scratch-off Ticket');
    assert.equal(ticket.type, 'loot');
    assert.equal(ticket.system.quantity, 6);
    assert.equal(ticket.system.cooldown, 'Once per scene');
    assert.equal(ticket.system.lootType, 'scratch_ticket');
    assert.equal(ticket.system.outcomes.length, 2);

    const fireballOutcome = ticket.system.outcomes.find(o => o.name.includes('Fireball'));
    assert.ok(fireballOutcome, 'Must include Fireball outcome');
    assert.equal(fireballOutcome.weight, 50);
    assert.equal(fireballOutcome.targetType, 'closest_mob');
    assert.equal(fireballOutcome.damage, '2d12 + Int');

    const custardOutcome = ticket.system.outcomes.find(o => o.name.includes('Custard'));
    assert.ok(custardOutcome, 'Must include Custard outcome');
    assert.equal(custardOutcome.weight, 50);
    assert.equal(custardOutcome.targetType, 'closest_mob');
    assert.equal(custardOutcome.healBars, 5);
  });

  it('9. Outcome resolution for Buff has NO damage component and renders apply buff button', async () => {
    await ticketItem.update({
      'system.outcomes': [
        {
          name: 'Strength Buff',
          weight: 100,
          type: 'buff',
          buffId: 'dccbuf0000000001',
          targetType: 'self',
          damage: '2d12 + Int', // Residual damage must be ignored
          damageType: 'Fire',
          description: 'Temporarily increases Strength ability score by +2.'
        }
      ]
    });

    const msg = await ticketItem.useLoot();
    const flags = msg.flags?.['carl-rpg'];
    assert.equal(flags.outcome.name, 'Strength Buff');
    assert.equal(flags.outcome.type, 'buff');
    assert.equal(flags.damage, 0, 'Buff outcome MUST have 0 damage');
    assert.equal(flags.buff, 'Strength Buff');

    // UI card checks
    assert.ok(!msg.content.includes('dcc-damage-card'), 'Buff outcome card must NOT include dcc-damage-card');
    assert.ok(!msg.content.includes('dcc-apply-damage-btn'), 'Buff outcome card must NOT have damage apply button');
    assert.ok(!msg.content.includes('Damage:'), 'Buff outcome card must NOT display Damage: line');
    assert.ok(msg.content.includes('dcc-apply-buff-btn'), 'Buff outcome card must include dcc-apply-buff-btn');
    assert.ok(msg.content.includes('data-buff-name="Strength Buff"'));
    assert.ok(msg.content.includes('BUFF'), 'Buff badge must be displayed');
  });

  it('10. Outcome resolution for Debuff has NO damage component and renders apply debuff button', async () => {
    await ticketItem.update({
      'system.outcomes': [
        {
          name: 'Blinded',
          weight: 100,
          type: 'debuff',
          debuffId: 'dccdeb0000000001',
          targetType: 'closest_mob',
          damage: '3d6', // Residual damage must be ignored
          damageType: 'Acid',
          description: 'Target cannot see and suffers severe combat penalties.'
        }
      ]
    });

    const msg = await ticketItem.useLoot();
    const flags = msg.flags?.['carl-rpg'];
    assert.equal(flags.outcome.name, 'Blinded');
    assert.equal(flags.outcome.type, 'debuff');
    assert.equal(flags.damage, 0, 'Debuff outcome MUST have 0 damage');
    assert.equal(flags.debuff, 'Blinded');

    // UI card checks
    assert.ok(!msg.content.includes('dcc-damage-card'), 'Debuff outcome card must NOT include dcc-damage-card');
    assert.ok(!msg.content.includes('dcc-apply-damage-btn'), 'Debuff outcome card must NOT have damage apply button');
    assert.ok(!msg.content.includes('Damage:'), 'Debuff outcome card must NOT display Damage: line');
    assert.ok(msg.content.includes('dcc-apply-debuff-btn'), 'Debuff outcome card must include dcc-apply-debuff-btn');
    assert.ok(msg.content.includes('data-debuff-name="Blinded"'));
    assert.ok(msg.content.includes('DEBUFF'), 'Debuff badge must be displayed');
  });

  it('11. DCCItemSheet._prepareContext populates availableBuffs and availableDebuffs and clears damage on buff/debuff outcomes', async () => {
    const testItem = new DCCItem({
      name: 'Buff Ticket',
      type: 'loot',
      system: {
        lootType: 'scratch_ticket',
        outcomes: [
          {
            name: 'Strength Buff',
            type: 'buff',
            buffId: 'dccbuf0000000001',
            damage: '1d6',
            damageType: 'Fire'
          },
          {
            name: 'Blinded',
            type: 'debuff',
            debuffId: 'dccdeb0000000017',
            damage: '2d8',
            damageType: 'Acid'
          }
        ]
      }
    });

    const sheet = new DCCItemSheet(testItem);
    const context = await sheet._prepareContext();

    assert.ok(Array.isArray(context.availableBuffs), 'availableBuffs must be an array');
    assert.ok(context.availableBuffs.length >= 30, 'availableBuffs must index canonical buffs');
    assert.ok(Array.isArray(context.availableDebuffs), 'availableDebuffs must be an array');
    assert.ok(context.availableDebuffs.length >= 25, 'availableDebuffs must index canonical debuffs');

    const out0 = context.system.outcomes[0];
    assert.equal(out0.damage, '', 'Damage must be cleared on buff outcome');
    assert.equal(out0.damageType, '', 'DamageType must be cleared on buff outcome');
    assert.ok(Array.isArray(out0.buffOptions), 'buffOptions must be precomputed for outcome');
    const selectedBuff = out0.buffOptions.find(b => b.selected);
    assert.ok(selectedBuff, 'Selected buff option must be found');
    assert.equal(selectedBuff.name, 'Strength Buff');

    const out1 = context.system.outcomes[1];
    assert.equal(out1.damage, '', 'Damage must be cleared on debuff outcome');
    assert.equal(out1.damageType, '', 'DamageType must be cleared on debuff outcome');
    assert.ok(Array.isArray(out1.debuffOptions), 'debuffOptions must be precomputed for outcome');
    const selectedDebuff = out1.debuffOptions.find(d => d.selected);
    assert.ok(selectedDebuff, 'Selected debuff option must be found');
    assert.equal(selectedDebuff.name, 'Blinded');
  });

  it('12. DCCItemSheet._updateObject sanitizes buff and debuff outcomes by clearing damage and damageType', async () => {
    const testItem = new DCCItem({
      name: 'Sanitize Ticket',
      type: 'loot',
      system: {
        lootType: 'scratch_ticket',
        outcomes: []
      }
    });

    const sheet = new DCCItemSheet(testItem);
    const formData = {
      'system.outcomes.0.name': 'Custom Buff',
      'system.outcomes.0.type': 'buff',
      'system.outcomes.0.damage': '5d10',
      'system.outcomes.0.damageType': 'Fire',
      'system.outcomes.1.name': 'Custom Debuff',
      'system.outcomes.1.type': 'debuff',
      'system.outcomes.1.damage': '4d6',
      'system.outcomes.1.damageType': 'Poison'
    };

    await sheet._updateObject({}, formData);
    assert.equal(testItem.system.outcomes[0].damage, '', 'Buff outcome damage must be sanitized to empty string');
    assert.equal(testItem.system.outcomes[0].damageType, '', 'Buff outcome damageType must be sanitized to empty string');
    assert.equal(testItem.system.outcomes[1].damage, '', 'Debuff outcome damage must be sanitized to empty string');
    assert.equal(testItem.system.outcomes[1].damageType, '', 'Debuff outcome damageType must be sanitized to empty string');
  });

  it('13. onRenderChatMessage binds and triggers .dcc-apply-buff-btn and .dcc-apply-debuff-btn', async () => {
    // 1. Test Apply Buff click handler
    crawler.system.attributes.externalBuffs = { buff1: '', buff2: '', buff3: '' };
    const buffListeners = {};
    const buffBtn = {
      dataset: {
        buffId: 'dccbuf0000000001',
        buffName: 'Strength Buff',
        targetId: crawler.id
      },
      addEventListener: (event, fn) => {
        buffListeners[event] = fn;
      }
    };
    const buffRoot = {
      querySelectorAll: (sel) => (sel === '.dcc-apply-buff-btn' ? [buffBtn] : [])
    };

    onRenderChatMessage({}, buffRoot, {});
    assert.ok(buffListeners.click, 'Click listener must be attached to .dcc-apply-buff-btn');
    await buffListeners.click({ preventDefault: () => {} });
    assert.equal(crawler.system.attributes.externalBuffs.buff1, 'Strength Buff', 'Strength Buff must be assigned to empty buff1 slot');

    // 2. Test Apply Debuff click handler
    const debuffListeners = {};
    const debuffBtn = {
      dataset: {
        debuffId: 'dccdeb0000000017',
        debuffName: 'Blinded',
        targetId: mobA.id
      },
      addEventListener: (event, fn) => {
        debuffListeners[event] = fn;
      }
    };
    const debuffRoot = {
      querySelectorAll: (sel) => (sel === '.dcc-apply-debuff-btn' ? [debuffBtn] : [])
    };

    onRenderChatMessage({}, debuffRoot, {});
    assert.ok(debuffListeners.click, 'Click listener must be attached to .dcc-apply-debuff-btn');
    await debuffListeners.click({ preventDefault: () => {} });
    const appliedDebuff = mobA.items.find(i => i.name === 'Blinded' && i.type === 'debuff');
    assert.ok(appliedDebuff, 'Blinded debuff item must be created on target mob');
  });

  it('14. templates/items/parts/loot.hbs renders condition selectors and omits damage inputs for buff/debuff', () => {
    const templateContent = fs.readFileSync('templates/items/parts/loot.hbs', 'utf-8');
    assert.ok(templateContent.includes('outcome-buff-select'), 'Template must include outcome-buff-select');
    assert.ok(templateContent.includes('outcome-debuff-select'), 'Template must include outcome-debuff-select');
    assert.ok(templateContent.includes('{{else if (eq out.type "buff")}}'), 'Template must branch on buff type');
    assert.ok(templateContent.includes('{{else if (eq out.type "debuff")}}'), 'Template must branch on debuff type');
    assert.ok(!templateContent.includes('placeholder="2d12 + Int" style="width: 65%; font-size: 11px;" />\n                {{/if}}'), 'Damage inputs must not be inside buff/debuff branches');
  });

  it('15. Scratch-off random table is only visible when item is of type scratch_ticket / Scratch-Off-Ticket', async () => {
    const templateContent = fs.readFileSync('templates/items/parts/loot.hbs', 'utf-8');
    assert.ok(
      templateContent.includes('{{#if (or isScratchTicket (eq system.lootType "scratch_ticket") (eq system.lootType "Scratch-Off-Ticket"))}}'),
      'Template must gate scratch-off outcomes section behind scratch ticket type check'
    );

    // Test consumable item -> isScratchTicket is false
    const consumableItem = new DCCItem({
      name: 'Normal Mana Potion',
      type: 'loot',
      system: { lootType: 'consumable' }
    });
    const consumableSheet = new DCCItemSheet(consumableItem);
    const consumableContext = await consumableSheet._prepareContext({});
    assert.equal(consumableContext.isScratchTicket, false, 'Consumable item must not be marked as isScratchTicket');

    // Test treasure item -> isScratchTicket is false
    const treasureItem = new DCCItem({
      name: 'Ruby Gem',
      type: 'loot',
      system: { lootType: 'treasure' }
    });
    const treasureSheet = new DCCItemSheet(treasureItem);
    const treasureContext = await treasureSheet._prepareContext({});
    assert.equal(treasureContext.isScratchTicket, false, 'Treasure item must not be marked as isScratchTicket');

    // Test scratch_ticket item -> isScratchTicket is true
    const scratchItem = new DCCItem({
      name: 'Scratch-off Ticket',
      type: 'loot',
      system: { lootType: 'scratch_ticket' }
    });
    const scratchSheet = new DCCItemSheet(scratchItem);
    const scratchContext = await scratchSheet._prepareContext({});
    assert.equal(scratchContext.isScratchTicket, true, 'scratch_ticket must be marked as isScratchTicket');

    // Test Scratch-Off-Ticket item -> isScratchTicket is true
    const scratchItemUpper = new DCCItem({
      name: 'Scratch-off Ticket Variant',
      type: 'loot',
      system: { lootType: 'Scratch-Off-Ticket' }
    });
    const scratchSheetUpper = new DCCItemSheet(scratchItemUpper);
    const scratchContextUpper = await scratchSheetUpper._prepareContext({});
    assert.equal(scratchContextUpper.isScratchTicket, true, 'Scratch-Off-Ticket must be marked as isScratchTicket');
  });

  it('16. Auto-calculates outcome weights evenly summing to 100% on add, delete, and rebalance', async () => {
    const testItem = new DCCItem({
      name: 'Dynamic Ticket',
      type: 'loot',
      system: {
        lootType: 'scratch_ticket',
        outcomes: []
      }
    });

    const sheet = new DCCItemSheet(testItem);
    const clickListeners = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickListeners[sel] = fn; },
        change: () => {},
        on: () => {}
      })
    };

    sheet.activateListeners(mockHtml);
    assert.ok(clickListeners['.add-loot-outcome'], 'add outcome listener must be registered');
    assert.ok(clickListeners['.delete-loot-outcome'], 'delete outcome listener must be registered');
    assert.ok(clickListeners['.rebalance-weights-btn'], 'rebalance weights listener must be registered');

    // 1st add: 1 outcome -> 100%
    await clickListeners['.add-loot-outcome']({ preventDefault: () => {} });
    assert.equal(testItem.system.outcomes.length, 1);
    assert.equal(testItem.system.outcomes[0].weight, 100);

    // 2nd add: 2 outcomes -> [50, 50]
    await clickListeners['.add-loot-outcome']({ preventDefault: () => {} });
    assert.equal(testItem.system.outcomes.length, 2);
    assert.deepEqual(testItem.system.outcomes.map(o => o.weight), [50, 50]);
    assert.equal(testItem.system.outcomes.reduce((a, b) => a + b.weight, 0), 100);

    // 3rd add: 3 outcomes -> [34, 33, 33] (sum = 100)
    await clickListeners['.add-loot-outcome']({ preventDefault: () => {} });
    assert.equal(testItem.system.outcomes.length, 3);
    assert.deepEqual(testItem.system.outcomes.map(o => o.weight), [34, 33, 33]);
    assert.equal(testItem.system.outcomes.reduce((a, b) => a + b.weight, 0), 100);

    // 4th add: 4 outcomes -> [25, 25, 25, 25] (sum = 100)
    await clickListeners['.add-loot-outcome']({ preventDefault: () => {} });
    assert.equal(testItem.system.outcomes.length, 4);
    assert.deepEqual(testItem.system.outcomes.map(o => o.weight), [25, 25, 25, 25]);
    assert.equal(testItem.system.outcomes.reduce((a, b) => a + b.weight, 0), 100);

    // Delete outcome at index 0 -> rebalances 3 outcomes to [34, 33, 33] (sum = 100)
    const mockDelTarget = { currentTarget: { getAttribute: () => '0' } };
    globalThis.$ = (el) => ({ data: (key) => 0 });
    await clickListeners['.delete-loot-outcome']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(testItem.system.outcomes.length, 3);
    assert.deepEqual(testItem.system.outcomes.map(o => o.weight), [34, 33, 33]);
    assert.equal(testItem.system.outcomes.reduce((a, b) => a + b.weight, 0), 100);

    // Manually skew weights and use rebalance button
    testItem.system.outcomes[0].weight = 10;
    testItem.system.outcomes[1].weight = 20;
    testItem.system.outcomes[2].weight = 30; // total 60
    await clickListeners['.rebalance-weights-btn']({ preventDefault: () => {} });
    assert.deepEqual(testItem.system.outcomes.map(o => o.weight), [34, 33, 33]);
    assert.equal(testItem.system.outcomes.reduce((a, b) => a + b.weight, 0), 100);
  });

  it('17. Allows manual weight overwrite and warns if summation is not equal to 100', async () => {
    const testItem = new DCCItem({
      name: 'Custom Weight Ticket',
      type: 'loot',
      system: {
        lootType: 'scratch_ticket',
        outcomes: [
          { name: 'A', weight: 50, type: 'spell' },
          { name: 'B', weight: 50, type: 'heal' }
        ]
      }
    });

    const sheet = new DCCItemSheet(testItem);

    // Capture warning notifications
    const warnings = [];
    const origWarn = globalThis.ui?.notifications?.warn;
    globalThis.ui = globalThis.ui || {};
    globalThis.ui.notifications = globalThis.ui.notifications || {};
    globalThis.ui.notifications.warn = (msg) => { warnings.push(msg); };

    try {
      // 1. Overwrite weights to sum to 80 (invalid sum)
      const invalidFormData = {
        'system.outcomes.0.weight': 40,
        'system.outcomes.1.weight': 40
      };
      await sheet._updateObject({}, invalidFormData);

      assert.equal(testItem.system.outcomes[0].weight, 40, 'User overwrite of weight 0 must be preserved');
      assert.equal(testItem.system.outcomes[1].weight, 40, 'User overwrite of weight 1 must be preserved');
      assert.equal(warnings.length, 1, 'Warning notification must be emitted when sum !== 100');
      assert.ok(warnings[0].includes('80%'), 'Warning must specify current total weight of 80%');
      assert.ok(warnings[0].includes('100%'), 'Warning must note required 100% summation');

      // Verify context flags in _prepareContext
      const invalidContext = await sheet._prepareContext({});
      assert.equal(invalidContext.outcomesTotalWeight, 80);
      assert.equal(invalidContext.isWeightValid, false);
      assert.equal(invalidContext.weightWarning, true);

      // Verify UI warning elements exist in templates/items/parts/loot.hbs
      const templateContent = fs.readFileSync('templates/items/parts/loot.hbs', 'utf-8');
      assert.ok(templateContent.includes('dcc-weight-warning'), 'Template must include dcc-weight-warning element');
      assert.ok(templateContent.includes('rebalance-weights-btn'), 'Template must include rebalance-weights-btn action');

      // 2. Overwrite weights to sum to 100 (valid sum: 60 + 40)
      warnings.length = 0;
      const validFormData = {
        'system.outcomes.0.weight': 60,
        'system.outcomes.1.weight': 40
      };
      await sheet._updateObject({}, validFormData);

      assert.equal(testItem.system.outcomes[0].weight, 60);
      assert.equal(testItem.system.outcomes[1].weight, 40);
      assert.equal(warnings.length, 0, 'No warning notification should be emitted when sum equals 100');

      const validContext = await sheet._prepareContext({});
      assert.equal(validContext.outcomesTotalWeight, 100);
      assert.equal(validContext.isWeightValid, true);
      assert.equal(validContext.weightWarning, false);
    } finally {
      if (globalThis.ui?.notifications) {
        globalThis.ui.notifications.warn = origWarn || (() => {});
      }
    }
  });

  it('18. Disallows and sanitizes non-numeric outcome weights', async () => {
    const testItem = new DCCItem({
      name: 'Non Numeric Weight Test',
      type: 'loot',
      system: {
        lootType: 'scratch_ticket',
        outcomes: [
          { name: 'Outcome 1', weight: 'invalid', type: 'spell' },
          { name: 'Outcome 2', weight: '75%', type: 'heal' },
          { name: 'Outcome 3', weight: null, type: 'custom' },
          { name: 'Outcome 4', weight: -10, type: 'custom' }
        ]
      }
    });

    // Test item prepareData sanitization
    testItem.prepareData();
    assert.equal(typeof testItem.system.outcomes[0].weight, 'number');
    assert.equal(testItem.system.outcomes[0].weight, 0, '"invalid" string weight must be sanitized to 0');
    assert.equal(testItem.system.outcomes[1].weight, 75, '"75%" string weight must be parsed to 75');
    assert.equal(testItem.system.outcomes[2].weight, 0, 'null weight must be sanitized to 0');
    assert.equal(testItem.system.outcomes[3].weight, 0, 'negative weight must be clamped to non-negative (0)');

    // Test _updateObject sanitization
    const sheet = new DCCItemSheet(testItem);
    const formData = {
      'system.outcomes.0.weight': 'abc',
      'system.outcomes.1.weight': '100px',
      'system.outcomes.2.weight': undefined,
      'system.outcomes.3.weight': '25'
    };
    await sheet._updateObject({}, formData);

    assert.equal(typeof testItem.system.outcomes[0].weight, 'number');
    assert.equal(testItem.system.outcomes[0].weight, 0);
    assert.equal(testItem.system.outcomes[1].weight, 100);
    assert.equal(testItem.system.outcomes[2].weight, 0);
    assert.equal(testItem.system.outcomes[3].weight, 25);

    // Test template input attributes
    const templateContent = fs.readFileSync('templates/items/parts/loot.hbs', 'utf-8');
    assert.ok(templateContent.includes('type="number" name="system.outcomes.{{idx}}.weight"'), 'Weight input must be type="number"');
    assert.ok(templateContent.includes('outcome-weight-input'), 'Weight input must include outcome-weight-input class for real-time sanitization');
  });
});

