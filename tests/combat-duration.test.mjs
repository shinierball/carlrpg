import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';
import { MockActor, MockItem } from './setup.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { getItemAllTags } from '../src/data/tags.mjs';

test('Combat Duration Countdown & Expiration Pipeline', async (t) => {
  await t.test('1. Round duration decrements on combat round advance and expires when reaching 0', async () => {
    const actor = new MockActor({
      name: 'Carl Tester',
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

    const auraSpell = new MockItem({
      name: 'Hot Stuff Aura',
      type: 'spell',
      system: {
        active: true,
        delivery: 'aura',
        durationConfig: {
          type: 'rounds',
          rounds: 2,
          remainingRounds: 2
        },
        tempBars: {
          hasTempBars: true,
          slotsFormula: '@abilities.cha.mod',
          hpPerSlot: 2
        }
      }
    }, actor);

    actor.items.push(auraSpell);

    // Create combat instance with this actor
    const combat = new DCCCombat({
      id: 'test-combat-duration',
      round: 1,
      turn: 0
    });
    combat.combatants = [
      { id: 'c1', name: actor.name, actorId: actor.id, actor }
    ];

    // Trigger round 1 duration processing
    const expiredR1 = await combat.processRoundDurations(1);
    assert.equal(expiredR1.length, 0, 'Should not expire on round 1');
    assert.equal(auraSpell.system.durationConfig.remainingRounds, 1, 'remainingRounds should be 1');
    assert.equal(auraSpell.system.active, true, 'Spell should remain active');
    assert.equal(actor.system.attributes.hp.tempBars.count, 4, 'tempBars should still be intact');

    // Trigger round 2 duration processing
    const expiredR2 = await combat.processRoundDurations(2);
    assert.equal(expiredR2.length, 1, 'Should expire on round 2');
    assert.equal(expiredR2[0].itemName, 'Hot Stuff Aura');
    assert.equal(auraSpell.system.durationConfig.remainingRounds, 0, 'remainingRounds should be 0');
    assert.equal(auraSpell.system.active, false, 'Spell should be deactivated');
    assert.equal(actor.system.attributes.hp.tempBars.count, 0, 'tempBars should be cleared upon aura expiration');
  });

  await t.test('2. Permanent or non-round effects are NOT decremented by combat round clock', async () => {
    const actor = new MockActor({
      name: 'Donut Tester',
      type: 'crawler',
      system: { attributes: { hp: { value: 30, max: 30 } } }
    });

    const permSpell = new MockItem({
      name: 'Eternal Glow',
      type: 'spell',
      system: {
        active: true,
        durationConfig: {
          type: 'permanent',
          rounds: 0,
          remainingRounds: 0
        }
      }
    }, actor);

    actor.items.push(permSpell);

    const combat = new DCCCombat({ id: 'combat-perm', round: 1 });
    combat.combatants = [{ id: 'c2', name: actor.name, actorId: actor.id, actor }];

    const expired = await combat.processRoundDurations(1);
    assert.equal(expired.length, 0);
    assert.equal(permSpell.system.active, true, 'Permanent spell should remain active');
    assert.equal(permSpell.system.durationConfig.remainingRounds, 0);
  });
});

test('Hot Stuff Aura Compendium Definition & Tags', async (t) => {
  await t.test('Hot Stuff Aura catalog spell has complete tags, area, delivery, and tempBars configuration', () => {
    const spellDef = DCC_SPELLS.find(s => s.name === 'Hot Stuff Aura');
    assert.ok(spellDef, 'Hot Stuff Aura must exist in DCC_SPELLS');

    const sys = spellDef.system;
    assert.equal(sys.stat, 'cha', 'Stat should be cha');
    assert.equal(sys.delivery, 'aura', 'Delivery mode should be aura');
    assert.ok(sys.area, 'Area configuration must exist');
    assert.equal(sys.area.shape, 'burst', 'Area shape should be burst');
    assert.equal(sys.area.radius, 5, 'Base radius should be 5ft');
    assert.equal(sys.area.targetFilter, 'allies', 'Target filter should be allies');

    assert.ok(sys.tempBars, 'tempBars configuration must exist');
    assert.equal(sys.tempBars.hasTempBars, true);
    assert.equal(sys.tempBars.hpPerSlot, 2, 'Rank 1 should have 2 HP per slot');

    assert.ok(sys.durationConfig, 'durationConfig must exist');
    assert.equal(sys.durationConfig.type, 'rounds');
    assert.equal(sys.durationConfig.rounds, 2);

    const allTags = getItemAllTags(spellDef);
    assert.ok(allTags.has('kind.spell'), 'kind.spell tag present');
    assert.ok(allTags.has('action.passive'), 'action.passive tag present');
    assert.ok(allTags.has('shape.aura'), 'shape.aura tag present');
    assert.ok(allTags.has('shape.burst'), 'shape.burst tag present');
    assert.ok(allTags.has('delivery.aura'), 'delivery.aura tag present');
    assert.ok(allTags.has('target.allies'), 'target.allies tag present');
    assert.ok(allTags.has('duration.rounds'), 'duration.rounds tag present');
    assert.ok(allTags.has('rule.temp-health-bars'), 'rule.temp-health-bars tag present');
    assert.ok(allTags.has('stat.cha'), 'stat.cha tag present');
    assert.ok(allTags.has('favored.bard'), 'favored.bard tag present');
  });
});
