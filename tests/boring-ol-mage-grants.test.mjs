import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';
import { tagIndex } from '../src/apps/tag-index.mjs';
import { MockActor, MockItem } from './setup.mjs';

describe('Boring Ol’ Mage - Structured Grants & Application Lifecycle', () => {
  let mageDef;

  beforeEach(async () => {
    await tagIndex.buildIndex();
    mageDef = DCCRaceClassApplier.findClass('Boring Ol’ Mage') || DCCRaceClassApplier.findClass("Boring Ol' Mage");
  });

  test('1. Boring Ol’ Mage has structured grants conforming strictly to rulebook', () => {
    assert.ok(mageDef, 'Boring Ol’ Mage must exist in classes dataset');
    const grants = mageDef.system?.grants;
    assert.ok(Array.isArray(grants), 'grants must be an array');
    assert.ok(grants.length >= 8, 'must contain stat, fixed skills, spell choices, and skill modifiers');

    // Stat grant
    const statGrant = grants.find(g => g.kind === 'stat');
    assert.ok(statGrant);
    assert.equal(statGrant.stats.int, 5);
    assert.equal(statGrant.stats.cha, 5);
    assert.equal(statGrant.stats.str, -2);
    assert.equal(statGrant.stats.dex, -2);

    // Fixed skills
    const lore = grants.find(g => g.kind === 'skill' && g.mode === 'fixed' && g.name === 'Lore');
    assert.ok(lore);
    assert.equal(lore.rank, 2);

    const arcane = grants.find(g => g.kind === 'skill' && g.mode === 'fixed' && g.name === 'Arcane');
    assert.ok(arcane);
    assert.equal(arcane.rank, 1);

    // Spell choices
    const fireChoice = grants.find(g => g.kind === 'spell' && g.filter?.all?.includes('element.fire'));
    assert.ok(fireChoice);
    assert.equal(fireChoice.rank, 3);
    assert.equal(fireChoice.count, 1);

    const forceChoice = grants.find(g => g.kind === 'spell' && g.filter?.all?.includes('element.force'));
    assert.ok(forceChoice);
    assert.equal(forceChoice.rank, 2);

    const sonicChoice = grants.find(g => g.kind === 'spell' && g.filter?.all?.includes('element.sonic'));
    assert.ok(sonicChoice);
    assert.equal(sonicChoice.rank, 2);

    const passiveChoice = grants.find(g => g.kind === 'spell' && g.filter?.all?.includes('action.passive'));
    assert.ok(passiveChoice);
    assert.equal(passiveChoice.rank, 2);
    assert.equal(passiveChoice.count, 2);
    assert.equal(passiveChoice.distinct, true);

    // Skill modifiers
    const dexMod = grants.find(g => g.kind === 'skillModifier' && g.filter?.all?.includes('stat.dex'));
    assert.ok(dexMod);
    assert.equal(dexMod.rankDelta, -3);
    assert.equal(dexMod.floor, 1);
    assert.equal(dexMod.onlyIfOwned, true);

    const strMod = grants.find(g => g.kind === 'skillModifier' && g.filter?.all?.includes('stat.str'));
    assert.ok(strMod);
    assert.equal(strMod.rankDelta, -3);
    assert.equal(strMod.floor, 1);
    assert.equal(strMod.onlyIfOwned, true);
  });

  test('2. detectChoices parses 5 discrete spell choices with accurate filters', () => {
    const choices = DCCRaceClassApplier.detectChoices(mageDef);
    assert.equal(choices.length, 5, 'Must produce 1 fire, 1 force, 1 sonic, and 2 passive choices');

    assert.equal(choices[0].type, 'spell');
    assert.equal(choices[0].rank, 3);
    assert.deepEqual(choices[0].filter, { all: ['kind.spell', 'element.fire'] });

    assert.equal(choices[1].type, 'spell');
    assert.equal(choices[1].rank, 2);
    assert.deepEqual(choices[1].filter, { all: ['kind.spell', 'element.force'] });

    assert.equal(choices[2].type, 'spell');
    assert.equal(choices[2].rank, 2);
    assert.deepEqual(choices[2].filter, { all: ['kind.spell', 'element.sonic'] });

    assert.equal(choices[3].type, 'spell');
    assert.equal(choices[3].rank, 2);
    assert.deepEqual(choices[3].filter, { all: ['kind.spell', 'action.passive'] });

    assert.equal(choices[4].type, 'spell');
    assert.equal(choices[4].rank, 2);
    assert.deepEqual(choices[4].filter, { all: ['kind.spell', 'action.passive'] });
  });

  test('3. getCatalogOptions populates choice options strictly via TagQuery filter', () => {
    const choices = DCCRaceClassApplier.detectChoices(mageDef);

    // Fire spells
    const fireSpells = DCCRaceClassApplier.getCatalogOptions(choices[0]);
    assert.ok(fireSpells.length > 0, 'Must return fire spells');
    assert.ok(fireSpells.includes('Fireball') || fireSpells.includes('Scorching Burst'));
    assert.ok(!fireSpells.includes('Heal'), 'Heal is holy, not fire');

    // Force spells
    const forceSpells = DCCRaceClassApplier.getCatalogOptions(choices[1]);
    assert.ok(forceSpells.length > 0, 'Must return force spells');
    assert.ok(!forceSpells.includes('Fireball'));

    // Passive spells
    const passiveSpells = DCCRaceClassApplier.getCatalogOptions(choices[3]);
    assert.ok(passiveSpells.length > 0, 'Must return passive spells');
    assert.ok(!passiveSpells.includes('Fireball'), 'Fireball is attack, not passive');
  });

  test('4. Full Application and Reversal modifies stats, grants spells, and penalizes Str/Dex skills', async () => {
    const actor = new MockActor({
      name: 'Boring Caster',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 14, unenhanced: 14 },
          dex: { value: 16, unenhanced: 16 },
          con: { value: 12, unenhanced: 12 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        details: { race: 'Human', class: '' }
      },
      items: [
        new MockItem({
          id: 'sk-acro',
          name: 'Acrobatics',
          type: 'skill',
          system: { rank: 4, stat: 'dex', tags: ['stat.dex'] }
        }),
        new MockItem({
          id: 'sk-brawl',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 2, stat: 'str', tags: ['stat.str'] }
        }),
        new MockItem({
          id: 'sk-lore',
          name: 'Lore',
          type: 'skill',
          system: { rank: 0, stat: 'int', tags: ['stat.int'] }
        })
      ]
    });

    const choices = DCCRaceClassApplier.detectChoices(mageDef);
    const chosenSelections = [
      'Fireball',          // Fire (rank 3)
      'Kinetic Barrier',   // Force (rank 2)
      'Sonic Blast',       // Sonic (rank 2)
      'Barkskin',          // Passive (rank 2)
      'Darkvision'         // Passive (rank 2)
    ];

    // Apply Class
    const applied = await DCCRaceClassApplier.applyClass(actor, mageDef.name, {
      choices: chosenSelections
    });
    assert.equal(applied, true);

    // Verify Stats
    assert.equal(actor.system.abilities.int.value, 15, 'Int should increase by 5 (10 -> 15)');
    assert.equal(actor.system.abilities.cha.value, 15, 'Cha should increase by 5 (10 -> 15)');
    assert.equal(actor.system.abilities.str.value, 12, 'Str should decrease by 2 (14 -> 12)');
    assert.equal(actor.system.abilities.dex.value, 14, 'Dex should decrease by 2 (16 -> 14)');

    // Verify Skills
    const acro = actor.items.find(i => i.name === 'Acrobatics');
    assert.equal(acro.system.rank, 1, 'Dex skill Acrobatics penalized by -3 (4 -> 1)');

    const brawl = actor.items.find(i => i.name === 'Pugilism');
    assert.equal(brawl.system.rank, 1, 'Str skill Pugilism penalized by -3 with floor of 1 (2 - 3 -> 1)');

    const lore = actor.items.find(i => i.name === 'Lore');
    assert.equal(lore.system.rank, 2, 'Lore skill granted at Rank 2');

    const arcane = actor.items.find(i => i.name === 'Arcane');
    assert.ok(arcane, 'Arcane skill created on actor');
    assert.equal(arcane.system.rank, 1, 'Arcane skill granted at Rank 1');

    // Verify Spells
    const fireball = actor.items.find(i => i.name === 'Fireball');
    assert.ok(fireball);
    assert.equal(fireball.system.rank, 3);

    // Clean Reversal
    const removed = await DCCRaceClassApplier.removeClass(actor);
    assert.equal(removed, true);

    // Restored stats
    assert.equal(actor.system.abilities.int.value, 10);
    assert.equal(actor.system.abilities.cha.value, 10);
    assert.equal(actor.system.abilities.str.value, 14);
    assert.equal(actor.system.abilities.dex.value, 16);

    // Restored skills
    assert.equal(acro.system.rank, 4, 'Acrobatics rank restored to 4');
    assert.equal(brawl.system.rank, 2, 'Pugilism rank restored to 2');
    assert.equal(lore.system.rank, 0, 'Lore restored to 0');
    assert.ok(!actor.items.some(i => i.name === 'Arcane'), 'Created Arcane skill removed');
    assert.ok(!actor.items.some(i => i.name === 'Fireball'), 'Created Fireball spell removed');
  });
});
