import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { MockActor, MockItem } from './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

test('Aura Activation and Deactivation Workflow', async (t) => {
  await t.test('1. activateAura grants temporary health bars scaling by rank and activates spell', async () => {
    const actor = new MockActor({
      name: 'Carl Caster',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    // Rank 1 Hot Stuff Aura
    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    assert.ok(typeof actor.activateAura === 'function', 'activateAura should exist on actor');
    const auraResult = await actor.activateAura(spellItem);

    assert.equal(auraResult.active, true);
    assert.equal(spellItem.system.active, true, 'Spell should be active');
    assert.equal(auraResult.slots, 4, 'CHA mod 4 should yield 4 slots');
    assert.equal(auraResult.hpPerSlot, 2, 'Rank 1 should have 2 HP per slot');
    assert.equal(auraResult.totalTempHp, 8, '4 slots * 2 HP = 8 temp HP');
    assert.equal(auraResult.radius, 5, 'Rank 1 radius should be 5ft');

    assert.equal(actor.system.attributes.hp.tempBars.count, 4);
    assert.equal(actor.system.attributes.hp.tempBars.hpPerSlot, 2);
    assert.equal(actor.system.attributes.hp.tempBars.currentSlotHp, 2);
    assert.equal(actor.system.attributes.hp.tempBars.source, 'Hot Stuff Aura');
    assert.equal(actor.system.attributes.hp.temp, 8);
  });

  await t.test('2. Rank 10 Hot Stuff Aura scales HP per slot to 6 and radius to 10ft', async () => {
    const actor = new MockActor({
      name: 'High Rank Carl',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 20, mod: 5 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    hotStuffDef.system.rank = 10;
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    const auraResult = await actor.activateAura(spellItem);

    assert.equal(auraResult.slots, 5, 'CHA mod 5 should yield 5 slots');
    assert.equal(auraResult.hpPerSlot, 6, 'Rank 10 should have 6 HP per slot');
    assert.equal(auraResult.totalTempHp, 30, '5 slots * 6 HP = 30 temp HP');
    assert.equal(auraResult.radius, 10, 'Rank 10 radius should be 5 + 5 = 10ft');
    assert.equal(actor.system.attributes.hp.tempBars.count, 5);
    assert.equal(actor.system.attributes.hp.tempBars.hpPerSlot, 6);
    assert.equal(actor.system.attributes.hp.temp, 30);
  });

  await t.test('3. deactivateAura turns off spell and clears temporary health bars', async () => {
    const actor = new MockActor({
      name: 'Carl Caster',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 8,
            tempBars: {
              count: 4,
              maxCount: 4,
              hpPerSlot: 2,
              currentSlotHp: 2,
              source: 'Hot Stuff Aura'
            }
          }
        }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    hotStuffDef.system.active = true;
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    assert.ok(typeof actor.deactivateAura === 'function', 'deactivateAura should exist on actor');
    const result = await actor.deactivateAura(spellItem);

    assert.equal(result.active, false);
    assert.equal(spellItem.system.active, false, 'Spell active should become false');
    assert.equal(actor.system.attributes.hp.tempBars.count, 0, 'tempBars count should be 0');
    assert.equal(actor.system.attributes.hp.tempBars.source, '', 'source should be cleared');
    assert.equal(actor.system.attributes.hp.temp, 0, 'temp HP should be 0');
  });

  await t.test('4. rollSpell toggles aura on when inactive and off when active', async () => {
    const actor = new MockActor({
      name: 'Carl Toggler',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, int: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    // Cast 1: Should activate aura
    await actor.rollSpell(spellItem);
    assert.equal(spellItem.system.active, true, 'First cast should activate aura');
    assert.equal(actor.system.attributes.hp.tempBars.count, 4, 'Should grant 4 temp bars');

    // Cast 2: Should deactivate aura
    await actor.rollSpell(spellItem);
    assert.equal(spellItem.system.active, false, 'Second cast should deactivate aura');
    assert.equal(actor.system.attributes.hp.tempBars.count, 0, 'Should clear temp bars');
  });

  await t.test('5. DCCActor rollSpell generates aura chat card and flags, then dismiss chat card', async () => {
    const actor = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, int: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    // Cast 1: Activate
    const castMsg = await actor.rollSpell(spellItem);
    assert.ok(castMsg);
    assert.equal(castMsg.flags['carl-rpg'].isAura, true);
    assert.equal(castMsg.flags['carl-rpg'].auraData.active, true);
    assert.equal(castMsg.flags['carl-rpg'].auraData.slots, 4);
    assert.ok(castMsg.content.includes('Aura Active: 5ft Radius'));
    assert.ok(castMsg.content.includes('dcc-dismiss-aura-btn'));
    assert.equal(spellItem.system.active, true);
    assert.equal(actor.system.attributes.hp.tempBars.count, 4);

    // Cast 2: Dismiss
    const dismissMsg = await actor.rollSpell(spellItem);
    assert.ok(dismissMsg);
    assert.equal(dismissMsg.flags['carl-rpg'].isAuraDismiss, true);
    assert.ok(dismissMsg.content.includes('Aura Deactivated'));
    assert.equal(spellItem.system.active, false);
    assert.equal(actor.system.attributes.hp.tempBars.count, 0);
  });

  await t.test('6. onRenderChatMessage binds and triggers .dcc-dismiss-aura-btn', async () => {
    const actor = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: {
          hp: {
            value: 40,
            max: 40,
            temp: 8,
            tempBars: {
              count: 4,
              maxCount: 4,
              hpPerSlot: 2,
              currentSlotHp: 2,
              source: 'Hot Stuff Aura'
            }
          }
        }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    hotStuffDef.system.active = true;
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    globalThis.game.actors = {
      get: (id) => (id === actor.id ? actor : null)
    };

    let clickHandler = null;
    const mockBtn = {
      dataset: {
        actorId: actor.id,
        spellId: spellItem.id
      },
      addEventListener: (type, fn) => {
        if (type === 'click') clickHandler = fn;
      }
    };

    const mockHtml = {
      querySelectorAll: (sel) => {
        if (sel === '.dcc-dismiss-aura-btn') return [mockBtn];
        return [];
      }
    };

    onRenderChatMessage({}, mockHtml, {});
    assert.ok(clickHandler, 'Click handler should be registered on dismiss button');

    let prevented = false;
    await clickHandler({ preventDefault: () => { prevented = true; } });

    assert.equal(prevented, true);
    assert.equal(spellItem.system.active, false, 'Spell active should become false after button click');
    assert.equal(actor.system.attributes.hp.tempBars.count, 0, 'Temp health bars should be cleared');
  });
});
