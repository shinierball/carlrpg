import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { MockActor, MockItem } from './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

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

  await t.test('7. Hot Stuff Aura compendium definition targets Self and carries target.self tag', async () => {
    const hotStuff = DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura');
    assert.ok(hotStuff, 'Hot Stuff Aura spell must exist in compendium');
    assert.equal(hotStuff.system.target, 'Self', 'Target must be Self');
    assert.ok(hotStuff.system.tags.includes('target.self'), 'Tags must include target.self');
    assert.equal(hotStuff.system.delivery, 'aura', 'Delivery must be aura');
  });

  await t.test('8. activateAura targets Self and centers on caster token rather than (0,0)', async () => {
    const actor = new DCCActor({
      name: 'Carl Caster',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    // Mock canvas token centered at (250, 350)
    let createdTemplate = null;
    globalThis.canvas = {
      scene: {
        templates: [],
        createEmbeddedDocuments: async (type, docs) => {
          createdTemplate = docs[0];
          return [createdTemplate];
        },
        deleteEmbeddedDocuments: async () => {}
      },
      tokens: {
        placeables: [
          {
            actor: { id: actor.id },
            center: { x: 250, y: 350 },
            x: 225,
            y: 325
          }
        ]
      },
      grid: { size: 50 }
    };
    globalThis.MeasuredTemplateDocument = class {};

    const auraResult = await actor.activateAura(spellItem);
    assert.equal(auraResult.target, 'Self', 'activateAura result target must be Self');
    assert.ok(createdTemplate, 'MeasuredTemplate should have been created on canvas');
    assert.equal(createdTemplate.x, 250, 'Template x must center on token x (250), not 0');
    assert.equal(createdTemplate.y, 350, 'Template y must center on token y (350), not 0');
    assert.equal(createdTemplate.flags?.['carl-rpg']?.target, 'self');

    // Clean up global mock
    delete globalThis.canvas;
    delete globalThis.MeasuredTemplateDocument;
  });

  await t.test('9. placeAoeButtons centers template on caster token rather than (0,0)', async () => {
    let createdTemplate = null;
    globalThis.canvas = {
      scene: {
        createEmbeddedDocuments: async (type, docs) => {
          createdTemplate = docs[0];
          return [createdTemplate];
        }
      },
      tokens: {
        placeables: [
          {
            actor: { id: 'caster-123' },
            center: { x: 400, y: 600 }
          }
        ]
      },
      grid: { size: 50 }
    };
    globalThis.MeasuredTemplateDocument = class {};

    let clickHandler = null;
    const mockBtn = {
      dataset: {
        actorId: 'caster-123',
        radius: '15',
        shape: 'circle'
      },
      addEventListener: (type, fn) => {
        if (type === 'click') clickHandler = fn;
      }
    };

    const mockHtml = {
      querySelectorAll: (sel) => {
        if (sel === '.place-aoe-template-btn') return [mockBtn];
        return [];
      }
    };

    onRenderChatMessage({}, mockHtml, {});
    assert.ok(clickHandler, 'Click handler must be bound to place AoE button');

    let prevented = false;
    await clickHandler({ preventDefault: () => { prevented = true; } });

    assert.equal(prevented, true);
    assert.ok(createdTemplate, 'Template should be created');
    assert.equal(createdTemplate.x, 400, 'Template x must be token center x (400), not 0');
    assert.equal(createdTemplate.y, 600, 'Template y must be token center y (600), not 0');

    delete globalThis.canvas;
    delete globalThis.MeasuredTemplateDocument;
  });

  await t.test('10. Rank 15 Hot Stuff Aura calculates cumulative 20ft radius (base 5 + 5 + 10) and 8 HP per slot', async () => {
    const actor = new DCCActor({
      name: 'High Rank Carl',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 20, mod: 5 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    hotStuffDef.system.rank = 15;
    const spellItem = new MockItem(hotStuffDef, actor);
    actor.items.push(spellItem);

    const auraResult = await actor.activateAura(spellItem);

    assert.equal(auraResult.slots, 5, 'CHA mod 5 should yield 5 slots');
    assert.equal(auraResult.hpPerSlot, 8, 'Rank 15 should have 8 HP per slot');
    assert.equal(auraResult.totalTempHp, 40, '5 slots * 8 HP = 40 temp HP');
    assert.equal(auraResult.radius, 20, 'Rank 15 radius should be 5 + 5 + 10 = 20ft cumulative');
    assert.equal(actor.system.attributes.hp.tempBars.count, 5);
    assert.equal(actor.system.attributes.hp.tempBars.hpPerSlot, 8);
    assert.equal(actor.system.attributes.hp.temp, 40);
  });

  await t.test('11. activateAura applies temporary health bars to allies in radius on canvas', async () => {
    const caster = new DCCActor({
      id: 'caster-carl',
      name: 'Carl Caster',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const ally1 = new DCCActor({
      id: 'ally-donut',
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { cha: { value: 10, mod: 4 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, mana: { value: 20, max: 20 } }
      }
    });

    const ally2 = new DCCActor({
      id: 'ally-mongo',
      name: 'Mongo',
      type: 'pet',
      system: {
        abilities: { cha: { value: 10, mod: 1 }, con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 30, max: 30, temp: 0 } }
      }
    });

    const enemy = new DCCActor({
      id: 'enemy-goblin',
      name: 'Goblin Grunt',
      type: 'mob',
      system: {
        abilities: { cha: { value: 1, mod: 0 }, con: { value: 1, mod: 1 } },
        attributes: { hp: { value: 10, max: 10, temp: 0 } }
      }
    });

    const hotStuffDef = structuredClone(DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura'));
    const spellItem = new MockItem(hotStuffDef, caster);
    caster.items.push(spellItem);

    // Grid size 50px = 5ft.
    // Caster at (100, 100).
    // Ally 1 (Donut) at (100, 140) -> 40px away = 4ft away (< 5ft radius)
    // Ally 2 (Mongo) at (100, 300) -> 200px away = 20ft away (> 5ft radius)
    // Enemy (Goblin) at (100, 110) -> 10px away = 1ft away (< 5ft radius, but hostile)
    globalThis.canvas = {
      scene: {
        grid: { distance: 5 },
        createEmbeddedDocuments: async () => [],
        deleteEmbeddedDocuments: async () => []
      },
      tokens: {
        placeables: [
          { actor: caster, center: { x: 100, y: 100 }, disposition: 1 },
          { actor: ally1, center: { x: 100, y: 140 }, disposition: 1 },
          { actor: ally2, center: { x: 100, y: 300 }, disposition: 1 },
          { actor: enemy, center: { x: 100, y: 110 }, disposition: -1 }
        ]
      },
      grid: { size: 50 }
    };

    const auraResult = await caster.activateAura(spellItem);

    assert.equal(auraResult.radius, 5, 'Rank 1 radius is 5ft');
    assert.equal(caster.system.attributes.hp.tempBars.count, 4, 'Caster gets 4 slots');
    assert.equal(ally1.system.attributes.hp.tempBars.count, 4, 'Ally1 in radius gets 4 slots');
    assert.equal(ally1.system.attributes.hp.tempBars.source, 'Hot Stuff Aura');
    assert.equal(ally1.system.attributes.hp.temp, 8);

    assert.equal(ally2.system.attributes.hp.tempBars?.count || 0, 0, 'Ally2 outside radius does not get slots');
    assert.equal(enemy.system.attributes.hp.tempBars?.count || 0, 0, 'Enemy does not get slots');

    // Deactivating aura clears allies
    await caster.deactivateAura(spellItem);
    assert.equal(caster.system.attributes.hp.tempBars.count, 0, 'Caster slots cleared');
    assert.equal(ally1.system.attributes.hp.tempBars.count, 0, 'Ally1 slots cleared on deactivation');

    delete globalThis.canvas;
  });

  await t.test('12. Ally with temporary health bars absorbs damage into them via applyDamage', async () => {
    const ally = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
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

    // Take 3 damage:
    // Slot 4 has 2 HP -> absorbs 2 (slot 4 depleted).
    // Slot 3 has 2 HP -> absorbs 1 (slot 3 now has 1 HP left).
    // Total absorbed: 3. Penetrating damage to HP: 0.
    const res = await ally.applyDamage(3);

    assert.equal(res.tempBarsDamage, 3, '3 damage absorbed into temp bars');
    assert.equal(res.tempBarsRemaining, 3, '3 bars remaining');
    assert.equal(ally.system.attributes.hp.tempBars.count, 3, 'Actor temp bars count updated to 3');
    assert.equal(ally.system.attributes.hp.tempBars.currentSlotHp, 1, 'Current slot has 1 HP left');
    assert.equal(ally.system.attributes.hp.value, 40, 'Permanent HP remains 40');
  });

  await t.test('13. Ally absorbs damage into temp bars on direct actor.update HP modification', async () => {
    const ally = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
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

    // Simulate direct token HUD update reducing HP from 40 to 37 (3 damage)
    await ally.update({ 'system.attributes.hp.value': 37 });

    assert.equal(ally.system.attributes.hp.tempBars.count, 3, 'Temp bars absorbed 3 dmg; 3 bars left');
    assert.equal(ally.system.attributes.hp.tempBars.currentSlotHp, 1, 'Current slot has 1 HP left');
    assert.equal(ally.system.attributes.hp.value, 40, 'Permanent HP remains untouched at 40');
  });

  await t.test('14. DCCCombatTracker includes tempBars and tempHp in enriched turns', async () => {
    const combatantActor = new DCCActor({
      name: 'Carl With Shield',
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

    const tracker = new DCCCombatTracker();
    const mockCombat = {
      round: 1,
      turn: 0,
      combatants: [
        {
          id: 'c1',
          actor: combatantActor,
          name: combatantActor.name,
          defeated: false,
          initiative: 10,
          flags: {}
        }
      ],
      turns: [
        {
          id: 'c1',
          actor: combatantActor,
          name: combatantActor.name,
          defeated: false,
          initiative: 10,
          flags: {}
        }
      ],
      flags: {}
    };

    globalThis.game = globalThis.game || {};
    globalThis.game.combats = { active: mockCombat };
    globalThis.game.combat = mockCombat;

    const data = await tracker.getData({ combat: mockCombat });
    const crawlerPhase = data.phases.find(p => !p.isMob);
    assert.ok(crawlerPhase, 'Crawler phase must exist');
    assert.ok(crawlerPhase.turns.length > 0, 'Must have crawler turn');

    const turn = crawlerPhase.turns[0];
    assert.equal(turn.hasTempBars, true, 'hasTempBars should be true');
    assert.equal(turn.tempBarsCount, 4, 'tempBarsCount should be 4');
    assert.equal(turn.tempBarsTotalHp, 8, 'tempBarsTotalHp should be 8');
    assert.equal(turn.tempBarsSource, 'Hot Stuff Aura');
  });

  await t.test('15. DCCCrawlerSheet prepares tempBarSlots and hasTempBars for character sheet', async () => {
    const actor = new DCCActor({
      name: 'Carl Sheet',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
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

    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    assert.equal(context.hasTempBars, true, 'Sheet context hasTempBars must be true');
    assert.equal(context.tempBarsSource, 'Hot Stuff Aura');
    assert.ok(Array.isArray(context.tempBarSlots), 'tempBarSlots must be an array');
    assert.equal(context.tempBarSlots.length, 4, 'tempBarSlots length must match maxCount 4');
    assert.equal(context.tempBarSlots[0].slotHp, 2);
  });
});
