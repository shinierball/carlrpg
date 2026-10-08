import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCC_RACES } from '../src/data/races.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';
import { tagIndex } from '../src/apps/tag-index.mjs';
import { MockActor, MockItem } from './setup.mjs';

describe('DCC RPG - Structured Grants Subsystem for Classes and Races', () => {
  beforeEach(async () => {
    await tagIndex.buildIndex();
  });

  test('1. All 53 canonical classes define valid system.grants', () => {
    assert.equal(DCC_CLASSES.length, 53);
    for (const cls of DCC_CLASSES) {
      assert.ok(Array.isArray(cls.system?.grants), `Class "${cls.name}" must have system.grants array`);
      assert.ok(cls.system.grants.length > 0, `Class "${cls.name}" grants must not be empty`);
      for (const g of cls.system.grants) {
        assert.ok(g.kind, `Grant in "${cls.name}" must have a kind`);
      }
    }
  });

  test('2. All 30 canonical races define valid system.grants', () => {
    assert.equal(DCC_RACES.length, 30);
    for (const r of DCC_RACES) {
      assert.ok(Array.isArray(r.system?.grants), `Race "${r.name}" must have system.grants array`);
      assert.ok(r.system.grants.length > 0, `Race "${r.name}" grants must not be empty`);
      for (const g of r.system.grants) {
        assert.ok(g.kind, `Grant in "${r.name}" must have a kind`);
      }
    }
  });

  test('3. Canonical race choices match exact rulebook definitions', () => {
    // Dwarf, Classic
    const dwarf = DCCRaceClassApplier.findRace('Dwarf, Classic') || DCCRaceClassApplier.findRace('Classic Dwarf');
    assert.ok(dwarf);
    const dwarfChoices = DCCRaceClassApplier.detectChoices(dwarf);
    assert.equal(dwarfChoices.length, 2);
    assert.equal(dwarfChoices[0].category, 'crafting');
    assert.equal(dwarfChoices[0].rank, 3);
    assert.equal(dwarfChoices[1].category, 'crafting');
    assert.equal(dwarfChoices[1].rank, 3);

    // Igneous
    const igneous = DCCRaceClassApplier.findRace('Igneous');
    assert.ok(igneous);
    const igneousChoices = DCCRaceClassApplier.detectChoices(igneous);
    assert.equal(igneousChoices.length, 3);
    assert.equal(igneousChoices[0].type, 'spell');
    assert.equal(igneousChoices[0].rank, 2);
    assert.equal(igneousChoices[1].type, 'spell');
    assert.equal(igneousChoices[1].rank, 2);
    assert.equal(igneousChoices[2].type, 'skill');
    assert.equal(igneousChoices[2].category, 'weapon');
    assert.equal(igneousChoices[2].rank, 3);

    // Grulke
    const grulke = DCCRaceClassApplier.findRace('Grulke');
    assert.ok(grulke);
    const grulkeChoices = DCCRaceClassApplier.detectChoices(grulke);
    assert.equal(grulkeChoices.length, 2);
    assert.equal(grulkeChoices[0].category, 'options');
    assert.deepEqual(grulkeChoices[0].options, ['Jumping', 'Light on Your Feet']);
    assert.equal(grulkeChoices[0].rank, 3);
    assert.equal(grulkeChoices[1].category, 'reach_weapon');
    assert.equal(grulkeChoices[1].rank, 2);
  });

  test('4. Canonical class choices match exact rulebook definitions', () => {
    // Barbarian
    const barb = DCCRaceClassApplier.findClass('Boring Ol’ Barbarian');
    assert.ok(barb);
    const barbChoices = DCCRaceClassApplier.detectChoices(barb);
    assert.equal(barbChoices.length, 1);
    assert.equal(barbChoices[0].category, 'weapon');
    assert.equal(barbChoices[0].rank, 3);

    // Fighter
    const fighter = DCCRaceClassApplier.findClass('Boring Ol’ Fighter');
    assert.ok(fighter);
    const fighterChoices = DCCRaceClassApplier.detectChoices(fighter);
    assert.equal(fighterChoices.length, 3);
    assert.equal(fighterChoices[0].category, 'weapon');
    assert.equal(fighterChoices[0].rank, 5);
    assert.equal(fighterChoices[1].category, 'options');
    assert.equal(fighterChoices[1].rank, 2);
    assert.equal(fighterChoices[2].category, 'options');
    assert.equal(fighterChoices[2].rank, 2);

    // Arcanist
    const arcanist = DCCRaceClassApplier.findClass('Boring Ol’ Arcanist');
    assert.ok(arcanist);
    const arcanistChoices = DCCRaceClassApplier.detectChoices(arcanist);
    assert.equal(arcanistChoices.length, 2);
    assert.equal(arcanistChoices[0].category, 'crafting');
    assert.equal(arcanistChoices[0].rank, 2);
    assert.equal(arcanistChoices[1].category, 'crafting');
    assert.equal(arcanistChoices[1].rank, 1);

    // Swashbuckler
    const swash = DCCRaceClassApplier.findClass('Swashbuckler');
    assert.ok(swash);
    const swashChoices = DCCRaceClassApplier.detectChoices(swash);
    assert.equal(swashChoices.length, 1);
    assert.deepEqual(swashChoices[0].options, ['Rapier', 'Longsword']);
    assert.equal(swashChoices[0].rank, 3);

    // Paladin
    const pal = DCCRaceClassApplier.findClass('Boring Ol’ Paladin');
    assert.ok(pal);
    const palChoices = DCCRaceClassApplier.detectChoices(pal);
    assert.equal(palChoices.length, 2);
    assert.equal(palChoices[0].category, 'weapon');
    assert.equal(palChoices[0].rank, 3);
    assert.deepEqual(palChoices[1].options, ['Catcher', 'Shield Block']);
    assert.equal(palChoices[1].rank, 2);
  });

  test('5. Applying and reverting a Race with structured grants updates actor cleanly', async () => {
    const actor = new MockActor({
      name: 'Crawler Rocky',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10 },
          dex: { value: 10, unenhanced: 10 },
          con: { value: 10, unenhanced: 10 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        attributes: { size: 'Medium' },
        details: { race: '', class: '' }
      },
      items: []
    });

    const igneous = DCCRaceClassApplier.findRace('Igneous');
    assert.ok(igneous);

    const applied = await DCCRaceClassApplier.applyRace(actor, igneous.name, {
      choices: ['Fireball', 'Heal', 'Warhammer']
    });
    assert.equal(applied, true);

    // Check size changed
    assert.equal(actor.system.attributes.size, 'Large');

    // Check chosen spells and weapon granted
    assert.ok(actor.items.some(i => i.name === 'Fireball' && i.type === 'spell' && i.system.rank === 2));
    assert.ok(actor.items.some(i => i.name === 'Heal' && i.type === 'spell' && i.system.rank === 2));
    assert.ok(actor.items.some(i => i.name === 'Warhammer' && i.type === 'skill' && i.system.rank === 3));

    // Revert Race
    const removed = await DCCRaceClassApplier.removeRace(actor);
    assert.equal(removed, true);

    // Verify actor size restored to Medium
    assert.equal(actor.system.attributes.size, 'Medium');
    // Verify granted items removed
    assert.ok(!actor.items.some(i => i.name === 'Fireball'));
    assert.ok(!actor.items.some(i => i.name === 'Heal'));
    assert.ok(!actor.items.some(i => i.name === 'Warhammer'));
  });
});
