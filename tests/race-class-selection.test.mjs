import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';

describe('DCC RPG - Race & Class Selection and Reversal System', () => {

  test('1. DCCRaceClassApplier.getRaceClassContext builds structured option groups', () => {
    const actor = new DCCActor({
      name: 'Carl Tester',
      type: 'crawler',
      system: {
        details: {
          race: 'Human',
          class: 'Boring Ol’ Fighter'
        }
      }
    });

    const context = DCCRaceClassApplier.getRaceClassContext(actor);
    assert.ok(Array.isArray(context.raceOptions), 'raceOptions must be an array of option groups');
    assert.ok(Array.isArray(context.classOptions), 'classOptions must be an array of option groups');
    assert.equal(context.hasCustomRace, false, 'Human is a recognized race');
    assert.equal(context.hasCustomClass, false, 'Boring Ol’ Fighter is a recognized class');

    // Human should be selected in Earth Races group
    const earthGroup = context.raceOptions.find(g => g.label.includes('Earth'));
    assert.ok(earthGroup, 'Earth Races group must exist');
    const humanOpt = earthGroup.options.find(o => o.value === 'Human');
    assert.ok(humanOpt, 'Human option must exist in Earth Races');
    assert.equal(humanOpt.selected, true, 'Human must be selected');

    // Fighter should be selected in Fighter Classes group
    const fighterGroup = context.classOptions.find(g => g.label.includes('Fighter'));
    assert.ok(fighterGroup, 'Fighter Classes group must exist');
    const fighterOpt = fighterGroup.options.find(o => o.value === 'Boring Ol’ Fighter');
    assert.ok(fighterOpt, 'Boring Ol’ Fighter must exist in Fighter Classes');
    assert.equal(fighterOpt.selected, true, 'Boring Ol’ Fighter must be selected');
  });

  test('2. getRaceClassContext handles custom/uncataloged race and class names', () => {
    const actor = new DCCActor({
      name: 'Custom Crawler',
      type: 'crawler',
      system: {
        details: {
          race: 'Cosmic Jellyfish',
          class: 'Laser Cowboy'
        }
      }
    });

    const context = DCCRaceClassApplier.getRaceClassContext(actor);
    assert.equal(context.hasCustomRace, true);
    assert.equal(context.hasCustomClass, true);
    assert.equal(context.currentRace, 'Cosmic Jellyfish');
    assert.equal(context.currentClass, 'Laser Cowboy');
  });

  test('3. Applying Boring Ol’ Fighter grants stats and Dodge skill', async () => {
    const actor = new DCCActor({
      name: 'Fighter Bob',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: {
          class: ''
        }
      }
    });

    const res = await actor.applyClass('Boring Ol’ Fighter');
    assert.equal(res, true);
    assert.equal(actor.system.details.class, 'Boring Ol’ Fighter');

    // Boring Ol' Fighter gives +2 STR and +2 CON
    assert.equal(actor.system.abilities.str.value, 12);
    assert.equal(actor.system.abilities.con.value, 12);
    assert.equal(actor.system.abilities.dex.value, 10);

    // Grants +3 Dodge skill
    const dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.ok(dodge, 'Dodge skill should be embedded on actor');
    assert.equal(dodge.system.rank, 3, 'Dodge rank should be 3');

    // Class item document embedded
    const classDoc = actor.items.find(i => i.type === 'class');
    assert.ok(classDoc, 'Class item should be embedded');
    assert.equal(classDoc.name, 'Boring Ol’ Fighter');
  });

  test('4. Full Transition Scenario: Human Boring Ol’ Fighter changes to Shapeshifter Boring Ol’ Mage with non-item skill rank retention', async () => {
    // Starting character: Human Boring Ol' Fighter
    const actor = new DCCActor({
      name: 'Transition Test Character',
      type: 'crawler',
      system: {
        attributes: {
          size: 'Medium'
        },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: {
          race: '',
          class: ''
        }
      }
    });

    // 1. Apply Human race
    await actor.applyRace('Human');
    assert.equal(actor.system.details.race, 'Human');

    // 2. Apply Boring Ol' Fighter class
    await actor.applyClass('Boring Ol’ Fighter');
    assert.equal(actor.system.details.class, 'Boring Ol’ Fighter');

    // Base stats after Fighter: STR=12, CON=12, DEX=10, INT=10, CHA=10
    assert.equal(actor.system.abilities.str.value, 12);
    assert.equal(actor.system.abilities.con.value, 12);

    // Dodge is rank 3 from Fighter
    let dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.ok(dodge);
    assert.equal(dodge.system.rank, 3);

    // Simulate crawler gaining 2 non-item ranks in Dodge through grinding/advancement (total = 5)
    await dodge.update({ 'system.rank': 5 });
    assert.equal(dodge.system.rank, 5);

    // Also add another skill that was granted purely by class or test
    // 3. Now switch to Shapeshifter (Changeling) and Boring Ol' Mage!
    // Changing race to Shapeshifter/Changeling:
    await actor.applyRace('Shapeshifter');
    assert.equal(actor.system.details.race, 'Changeling');

    // Changeling grants: +3 CHA, +2 INT, +2 Ambush, +2 Deception, +1 Escape Artist
    assert.equal(actor.system.abilities.cha.value, 13); // 10 base + 3
    assert.equal(actor.system.abilities.int.value, 12); // 10 base + 2

    // Changing class to Boring Ol' Mage:
    await actor.applyClass('Boring Ol’ Mage');
    assert.equal(actor.system.details.class, 'Boring Ol’ Mage');

    // Reverting Fighter removed:
    // -2 STR, -2 CON (STR: 12 -> 10, CON: 12 -> 10)
    // And Dodge had 3 ranks removed: 5 - 3 = 2!
    // Non-item ranks (2) MUST be preserved!
    dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.ok(dodge, 'Dodge skill MUST NOT be deleted because it had non-item ranks higher than the removed amount');
    assert.equal(dodge.system.rank, 2, 'Dodge skill should be at rank 2 (5 - 3 = 2)');

    // Now Mage benefits are applied:
    // +5 INT, +5 CHA, -2 STR, -2 DEX
    // Expected final stats:
    // STR: 10 base - 2 Mage = 8
    // CON: 10 base = 10
    // DEX: 10 base - 2 Mage = 8
    // INT: 10 base + 2 Changeling + 5 Mage = 17
    // CHA: 10 base + 3 Changeling + 5 Mage = 18
    assert.equal(actor.system.abilities.str.value, 8, 'STR should be 8');
    assert.equal(actor.system.abilities.dex.value, 8, 'DEX should be 8');
    assert.equal(actor.system.abilities.con.value, 10, 'CON should be 10');
    assert.equal(actor.system.abilities.int.value, 17, 'INT should be 17');
    assert.equal(actor.system.abilities.cha.value, 18, 'CHA should be 18');

    // Mage granted skills: Lore (+2) and Arcane (+1)
    const lore = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'lore');
    assert.ok(lore, 'Lore skill should be granted by Mage');
    assert.equal(lore.system.rank, 2);

    const arcane = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'arcane');
    assert.ok(arcane, 'Arcane skill should be granted by Mage');
    assert.equal(arcane.system.rank, 1);

    // Old class item should be removed and new Mage class item should be present
    const classDocs = actor.items.filter(i => i.type === 'class');
    assert.equal(classDocs.length, 1);
    assert.equal(classDocs[0].name, 'Boring Ol’ Mage');
  });

  test('5. Purely granted skills are cleanly deleted when class is removed', async () => {
    const actor = new DCCActor({
      name: 'Pure Skill Test',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: {
          class: ''
        }
      }
    });

    await actor.applyClass('Boring Ol’ Fighter');
    let dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.ok(dodge);
    assert.equal(dodge.system.rank, 3);

    // Remove class completely
    await actor.removeClass();
    assert.equal(actor.system.details.class, '');
    dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.equal(dodge, undefined, 'Dodge should be deleted when non-item ranks are 0');

    // Stats reverted to base 10
    assert.equal(actor.system.abilities.str.value, 10);
    assert.equal(actor.system.abilities.con.value, 10);
  });

  test('6. Creature Size updates and restores when changing races', async () => {
    const actor = new DCCActor({
      name: 'Size Test Crawler',
      type: 'crawler',
      system: {
        attributes: {
          size: 'Medium'
        },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: {
          race: ''
        }
      }
    });

    // Pocket Kuma has size Small (2)
    await actor.applyRace('Pocket Kuma');
    assert.equal(actor.system.attributes.size, 'Small');

    // Sasquatch has size Large (5)
    await actor.applyRace('Sasquatch');
    assert.equal(actor.system.attributes.size, 'Large');

    // Remove race restores Medium
    await actor.removeRace();
    assert.equal(actor.system.attributes.size, 'Medium');
  });

  test('7. DCCCrawlerSheet prepares raceOptions and classOptions in context', async () => {
    const actor = new DCCActor({
      name: 'Sheet Context Test',
      type: 'crawler',
      system: {
        details: {
          race: 'High Elf',
          class: 'Alchemist'
        }
      }
    });

    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.raceOptions));
    assert.ok(Array.isArray(context.classOptions));
    assert.equal(typeof context.hasCustomRace, 'boolean');
    assert.equal(typeof context.hasCustomClass, 'boolean');

    // High Elf is selected
    const earthGroup = context.raceOptions.find(g => g.label.includes('Earth'));
    const elfOpt = earthGroup.options.find(o => o.value === 'Elf, High' || o.label.includes('High'));
    assert.ok(elfOpt);
    assert.equal(elfOpt.selected, true);

    // Alchemist is selected
    const arcanistGroup = context.classOptions.find(g => g.label.includes('Arcanist'));
    const alchemistOpt = arcanistGroup.options.find(o => o.value === 'Alchemist');
    assert.ok(alchemistOpt);
    assert.equal(alchemistOpt.selected, true);
  });

  test('8. Page 1 Core Template renders race and class select elements without duplicate name attributes', () => {
    const templatePath = path.resolve('templates/actors/parts/page1-core.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    assert.ok(content.includes('class="dcc-field-input dcc-race-selector"'), 'Must contain dcc-race-selector');
    assert.ok(content.includes('class="dcc-field-input dcc-class-selector"'), 'Must contain dcc-class-selector');

    // Crucial rule: selectors must omit name attribute to prevent FormDataExtended serialization arrays
    assert.ok(!content.includes('name="system.details.race"'), 'Race select must omit name attribute');
    assert.ok(!content.includes('name="system.details.class"'), 'Class select must omit name attribute');

    // Must include optgroups
    assert.ok(content.includes('{{#each raceOptions as |group|}}'), 'Template must loop through raceOptions');
    assert.ok(content.includes('{{#each classOptions as |group|}}'), 'Template must loop through classOptions');
    assert.ok(content.includes('<optgroup label="{{group.label}}">'), 'Template must render optgroup');
  });

  test('9. Dropping a Race or Class item triggers applyRace and applyClass', async () => {
    const actor = new DCCActor({
      name: 'Drop Test Character',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: {
          race: '',
          class: ''
        }
      }
    });

    const sheet = new DCCCrawlerSheet(actor);

    // Mock dropping a race item
    globalThis.Item.fromDropData = async () => ({
      name: 'Caprid',
      type: 'race'
    });

    await sheet._onDropItem({}, { type: 'Item', uuid: 'Item.123' });
    assert.equal(actor.system.details.race, 'Caprid');

    // Mock dropping a class item
    globalThis.Item.fromDropData = async () => ({
      name: 'Pit Fighter',
      type: 'class'
    });

    await sheet._onDropItem({}, { type: 'Item', uuid: 'Item.456' });
    assert.equal(actor.system.details.class, 'Pit Fighter');
  });

});
