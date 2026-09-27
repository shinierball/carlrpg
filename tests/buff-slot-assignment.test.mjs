import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

test('Character Buffs & Active Effects - Green Slot Number Assignment Indicator', async (t) => {
  await t.test('1. Sheet _prepareContext marks isSlot1, isSlot2, isSlot3 on assigned buffs', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          externalBuffs: {
            buff1: 'buff-haste-id',
            buff2: 'Iron Skin', // matched by name
            buff3: ''
          }
        }
      }
    });

    const buff1 = new DCCItem({
      id: 'buff-haste-id',
      name: 'Haste Aura',
      type: 'buff',
      system: { buffType: 'stat', stat: 'dex', value: 2 }
    });
    const buff2 = new DCCItem({
      id: 'buff-iron-id',
      name: 'Iron Skin',
      type: 'buff',
      system: { buffType: 'tempHp', value: 20 }
    });
    const buff3 = new DCCItem({
      id: 'buff-unassigned-id',
      name: 'Minor Agility',
      type: 'buff',
      system: { buffType: 'stat', stat: 'dex', value: 1 }
    });

    actor.items = [buff1, buff2, buff3];

    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    const hasteInSheet = context.buffs.find(b => b.id === 'buff-haste-id');
    const ironInSheet = context.buffs.find(b => b.id === 'buff-iron-id');
    const unassignedInSheet = context.buffs.find(b => b.id === 'buff-unassigned-id');

    assert.ok(hasteInSheet, 'Haste must be present in context.buffs');
    assert.equal(hasteInSheet.isSlot1, true, 'Haste must be flagged isSlot1');
    assert.equal(hasteInSheet.isSlot2, false, 'Haste must not be flagged isSlot2');
    assert.equal(hasteInSheet.isSlot3, false, 'Haste must not be flagged isSlot3');
    assert.equal(hasteInSheet.isAssignedToAnySlot, true, 'Haste must be flagged isAssignedToAnySlot');

    assert.ok(ironInSheet, 'Iron Skin must be present in context.buffs');
    assert.equal(ironInSheet.isSlot1, false, 'Iron Skin must not be flagged isSlot1');
    assert.equal(ironInSheet.isSlot2, true, 'Iron Skin must be flagged isSlot2 (by name match)');
    assert.equal(ironInSheet.isSlot3, false, 'Iron Skin must not be flagged isSlot3');
    assert.equal(ironInSheet.isAssignedToAnySlot, true, 'Iron Skin must be flagged isAssignedToAnySlot');

    assert.ok(unassignedInSheet, 'Minor Agility must be present in context.buffs');
    assert.equal(unassignedInSheet.isSlot1, false, 'Unassigned buff must have isSlot1 false');
    assert.equal(unassignedInSheet.isSlot2, false, 'Unassigned buff must have isSlot2 false');
    assert.equal(unassignedInSheet.isSlot3, false, 'Unassigned buff must have isSlot3 false');
    assert.equal(unassignedInSheet.isAssignedToAnySlot, false, 'Unassigned buff must have isAssignedToAnySlot false');
  });

  await t.test('2. conditions.hbs renders is-assigned class on matching slot buttons', () => {
    const templateContent = fs.readFileSync('templates/actors/parts/conditions.hbs', 'utf8');

    assert.ok(templateContent.includes('buff-assign-slot-btn {{#if item.isSlot1}}is-assigned{{/if}}'), 'Slot 1 button must conditionally render is-assigned');
    assert.ok(templateContent.includes('buff-assign-slot-btn {{#if item.isSlot2}}is-assigned{{/if}}'), 'Slot 2 button must conditionally render is-assigned');
    assert.ok(templateContent.includes('buff-assign-slot-btn {{#if item.isSlot3}}is-assigned{{/if}}'), 'Slot 3 button must conditionally render is-assigned');
  });

  await t.test('3. styles/dcc.css defines green color for assigned slot number buttons and active slot entries', () => {
    const cssContent = fs.readFileSync('styles/dcc.css', 'utf8');

    // Button green styling for assigned slots in Buffs & Active Effects table
    assert.ok(cssContent.includes('.buff-assign-slot-btn.is-assigned'), 'CSS must define .buff-assign-slot-btn.is-assigned');
    assert.ok(cssContent.includes('#27ae60'), 'CSS must use DCC vibrant green #27ae60 for assigned slot styling');

    // Slot number indicator in page 1 external buff entries
    assert.ok(cssContent.includes('.dcc-buff-slot-entry.is-active .dcc-buff-num'), 'CSS must style .dcc-buff-slot-entry.is-active .dcc-buff-num');
  });

  await t.test('4. Slot assignment toggles: unassigns when clicking an already assigned slot', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          externalBuffs: { buff1: 'buff-rage-id', buff2: '', buff3: '' }
        }
      }
    });

    const rageItem = new DCCItem({
      id: 'buff-rage-id',
      name: 'Battle Rage',
      type: 'buff'
    });
    actor.items = [rageItem];

    const sheet = new DCCCrawlerSheet(actor);

    // Mock HTML event dispatcher for jQuery click listener
    let assignedVal = null;
    actor.update = async (delta) => {
      if ('system.attributes.externalBuffs.buff1' in delta) {
        assignedVal = delta['system.attributes.externalBuffs.buff1'];
        actor.system.attributes.externalBuffs.buff1 = assignedVal;
      }
    };

    const listeners = {};
    const mockHtml = {
      find: (selector) => {
        return {
          click: (handler) => { listeners[selector] = handler; },
          on: (event, handler) => { listeners[selector] = handler; },
          change: () => {}
        };
      }
    };

    sheet.activateListeners(mockHtml);
    const clickHandler = listeners['.buff-assign-slot-btn'];
    assert.equal(typeof clickHandler, 'function', 'buff-assign-slot-btn click listener must be registered');

    // Click slot 1 for Battle Rage (already assigned) -> should unassign
    await clickHandler({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: {
        dataset: { itemId: 'buff-rage-id', slot: 'buff1' }
      }
    });

    assert.equal(assignedVal, '', 'Clicking an already assigned buff slot must unassign it (empty string)');
    assert.equal(actor.system.attributes.externalBuffs.buff1, '', 'Actor system.attributes.externalBuffs.buff1 must now be empty');

    // Click slot 1 again for Battle Rage (now empty) -> should assign
    await clickHandler({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: {
        dataset: { itemId: 'buff-rage-id', slot: 'buff1' }
      }
    });

    assert.equal(assignedVal, 'buff-rage-id', 'Clicking an unassigned buff slot must assign it');
    assert.equal(actor.system.attributes.externalBuffs.buff1, 'buff-rage-id', 'Actor system.attributes.externalBuffs.buff1 must be assigned');
  });

  await t.test('5. You cannot assign the same buff to different slots', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          externalBuffs: { buff1: 'buff-speed-id', buff2: '', buff3: '' }
        }
      }
    });

    const speedBuff = new DCCItem({
      id: 'buff-speed-id',
      name: 'Speed Potion',
      type: 'buff'
    });
    actor.items = [speedBuff];

    // Assigning the same buff to slot 2 should automatically clear slot 1
    await actor.update({ 'system.attributes.externalBuffs.buff2': 'buff-speed-id' });

    assert.equal(actor.system.attributes.externalBuffs.buff1, '', 'Slot 1 must be cleared when buff is assigned to slot 2');
    assert.equal(actor.system.attributes.externalBuffs.buff2, 'buff-speed-id', 'Slot 2 must hold the buff');

    // Assigning by name to slot 3 should clear slot 2
    await actor.update({ 'system.attributes.externalBuffs.buff3': 'Speed Potion' });
    assert.equal(actor.system.attributes.externalBuffs.buff2, '', 'Slot 2 must be cleared when buff is assigned by name to slot 3');
    assert.equal(actor.system.attributes.externalBuffs.buff3, 'Speed Potion', 'Slot 3 must hold the buff');

    // Verify sheet getData marks options as disabled if already assigned in another slot
    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    const slot1Data = context.externalBuffSlots[0];
    const speedOptionInSlot1 = slot1Data.groups
      .flatMap(g => g.items)
      .find(o => o.id === 'buff-speed-id');

    assert.ok(speedOptionInSlot1, 'Speed option should exist in slot 1 options');
    assert.equal(speedOptionInSlot1.disabled, true, 'Speed option should be disabled in slot 1 dropdown');
    assert.equal(speedOptionInSlot1.assignedSlot, 3, 'Metadata indicates it is assigned in slot 3');
  });

  await t.test('6. Automatic CON Stat Check vs Difficulty 10 + Floor occurs before fatal debuff damage on crawler', async () => {
    const { DCCCombat } = await import('../src/documents/combat.mjs');

    // Set world floor to Floor 2 (DC = 10 + 2 = 12)
    await DCCActor.setCurrentFloor(2);

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 14, mod: 4 } // CON mod +4
        },
        attributes: {
          hp: { value: 4, max: 40, temp: 0, hpPerBar: 4 } // 1 bar remaining (4 HP)
        }
      }
    });

    const lethalPoison = new DCCItem({
      id: 'debuff-lethal-poison',
      name: 'Deadly Hemotoxin',
      type: 'debuff',
      system: {
        damagePerRound: '8', // 8 damage = 2 bars (8 HP), lethal to 4 HP!
        damageType: 'Poison'
      }
    });
    crawler.items = [lethalPoison];

    // Mock Roll to simulate a successful check: 1d20 (8) + 4 = 12 vs DC 12 -> SUCCESS
    const originalRoll = globalThis.Roll;
    globalThis.Roll = class MockRoll {
      constructor(formula, data) {
        this.formula = formula;
        this.data = data;
        this.total = 12; // Exactly meets DC 12
      }
      async evaluate() { return this; }
      async toMessage() { return this; }
    };

    try {
      const combat = new DCCCombat({
        id: 'combat-test-fatal-debuff',
        round: 1
      });
      combat.combatants = [
        { id: 'c-carl', actorId: crawler.id, actor: crawler, name: crawler.name }
      ];

      const results = await combat.triggerRoundEndEffects(1);

      assert.equal(results.length, 1, 'One debuff result recorded');
      const r = results[0];
      assert.equal(r.actualDamage, 0, 'Damage must be 0 on successful CON check');
      assert.equal(r.avoidedDamage, 8, '8 damage was avoided');
      assert.equal(r.conCheck.success, true, 'CON check succeeded');
      assert.equal(r.debuffEnded, true, 'Debuff must be marked ended');

      // Crawler health must NOT have dropped
      assert.equal(crawler.system.attributes.hp.value, 4, 'Crawler HP must remain at 4 (avoided damage)');

      // Debuff must be ended (removed from crawler)
      const hasDebuff = crawler.items.some(i => i.id === 'debuff-lethal-poison');
      assert.equal(hasDebuff, false, 'Deadly Hemotoxin must be removed from crawler on success');
    } finally {
      globalThis.Roll = originalRoll;
    }
  });

  await t.test('7. Automatic CON Stat Check failure: crawler takes fatal damage if check fails', async () => {
    const { DCCCombat } = await import('../src/documents/combat.mjs');
    await DCCActor.setCurrentFloor(2); // DC 12

    const crawler = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 4, max: 40, temp: 0, hpPerBar: 4 }
        }
      }
    });

    const fatalBurn = new DCCItem({
      id: 'debuff-fatal-burn',
      name: 'Inferno Fire',
      type: 'debuff',
      system: {
        damagePerRound: '8',
        damageType: 'Fire'
      }
    });
    crawler.items = [fatalBurn];

    // Mock Roll to simulate a failed check: total 8 vs DC 12 -> FAIL
    const originalRoll = globalThis.Roll;
    globalThis.Roll = class MockRoll {
      constructor(formula, data) {
        this.formula = formula;
        this.data = data;
        this.total = 8; // Fails DC 12
      }
      async evaluate() { return this; }
      async toMessage() { return this; }
    };

    try {
      const combat = new DCCCombat({
        id: 'combat-test-fail-debuff',
        round: 1
      });
      combat.combatants = [
        { id: 'c-donut', actorId: crawler.id, actor: crawler, name: crawler.name }
      ];

      const results = await combat.triggerRoundEndEffects(1);

      assert.equal(results.length, 1, 'One debuff result recorded');
      assert.equal(crawler.system.attributes.hp.value, 0, 'Crawler took damage and dropped to 0 HP on failure');
    } finally {
      globalThis.Roll = originalRoll;
    }
  });
});

