import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DCC_RACES } from '../src/data/races.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';

describe('DCC RPG Races and Classes Compendiums & Datasets', () => {
  test('all 30 canonical races are present with valid schemas and unique IDs', () => {
    assert.equal(DCC_RACES.length, 30, 'Expected exactly 30 playable races');

    const expectedRaces = [
      'Amazonian', 'Arachnid', 'Cat', 'Cat Girl/Cat Boy', 'Changbi Demon',
      'Changeling', 'Crocodilian', 'Doppelgänger', 'Dwarf, Classic', 'Dwarf, Fathom',
      'Elf, High', 'Elf, City', 'Elf, Night', 'Frost Maiden', 'Human',
      'Igneous', 'Obsidian Butterfly', 'Lajabless', 'Primal', 'Rat Hooligan',
      'Sasquatch', 'Tetrakai', 'Tigran', 'Bune', 'Caprid',
      'Grulke', 'Hobgoblin', 'Pocket Kuma', 'Pterolykos', 'Skyfowl'
    ];

    const actualNames = DCC_RACES.map(r => r.name);
    for (const name of expectedRaces) {
      assert.ok(actualNames.includes(name), `Missing canonical race: ${name}`);
    }

    const idSet = new Set();
    let earthCount = 0;
    let alienCount = 0;

    for (const race of DCC_RACES) {
      assert.match(race._id, /^dccrce\d{10}$/, `Invalid ID format for race: ${race.name}`);
      assert.equal(idSet.has(race._id), false, `Duplicate ID: ${race._id}`);
      idSet.add(race._id);

      assert.equal(race.type, 'race');
      assert.ok(race.name.length > 0, 'Race name cannot be empty');
      assert.ok(race.img.length > 0, `Race ${race.name} must have img`);
      assert.ok(race.system, `Race ${race.name} must have system`);
      assert.ok(['Earth', 'Alien'].includes(race.system.heritage), `Race ${race.name} must be Earth or Alien`);
      if (race.system.heritage === 'Earth') earthCount++;
      if (race.system.heritage === 'Alien') alienCount++;

      assert.ok(race.system.size && race.system.size.length > 0, `Race ${race.name} must define size`);
      assert.ok(race.system.description.length > 0, `Race ${race.name} must have description`);
      assert.ok(race.system.abilities.length > 0, `Race ${race.name} must have abilities HTML`);
      assert.ok(Array.isArray(race.system.perks), `Race ${race.name} must have perks array`);
    }

    assert.equal(earthCount, 23, 'Expected 23 Earth-based races');
    assert.equal(alienCount, 7, 'Expected 7 Alien races');
  });

  test('all 52 canonical classes are present with valid schemas and unique IDs', () => {
    assert.equal(DCC_CLASSES.length, 52, 'Expected 52 classes (51 core + Dungeon Dad example)');

    const expectedClasses = [
      'Boring Ol’ Arcanist', 'Alchemist', 'Douchy Wizard School Wand-Maker', 'Infernocrafter', 'Prison Tattoo Artist',
      'Boring Ol’ Barbarian', 'Gladiator', 'Harii', 'Feral Cat Berserker', 'Shieldmaiden',
      'Boring Ol’ Bard', 'Artist Alley Mogul', 'Former Child Actor', 'NecroBard', 'Poet Laureate',
      'Professional Roadie', 'Spellbinder', 'Boring Ol’ Cleric', 'Santero', 'Boring Ol’ Druid',
      'Herbalist', 'Lifebringer', 'PHysicker', 'Shepherd', 'Boring Ol’ Fighter',
      'Pit Fighter', 'Shotgun Messenger', 'Straight-to-DVD Action Hero', 'Sword and Boarder', 'Monster Truck Driver',
      'Zulu Warrior', 'Boring Ol’ Mage', 'Blizzardmancer', 'Crisper', 'Fire Spiritualist',
      'Forsaken Aerialist', 'Necromancer', 'Boring Ol’ Monk', 'Elemental Monk', 'Prizefighter',
      'Spirit Healer', 'Street Monk', 'Boring Ol’ Paladin', 'Cavalier', 'Sacred Paladin',
      'Boring Ol’ Rogue', 'Bomb Squad Tech', 'Compensated Anarchist', 'High Rise Grifter', 'Identity Thief',
      'Swashbuckler', 'Dungeon Dad'
    ];

    const actualNames = DCC_CLASSES.map(c => c.name);
    for (const name of expectedClasses) {
      assert.ok(actualNames.includes(name), `Missing canonical class: ${name}`);
    }

    const idSet = new Set();
    for (const cls of DCC_CLASSES) {
      assert.match(cls._id, /^dcccls\d{10}$/, `Invalid ID format for class: ${cls.name}`);
      assert.equal(idSet.has(cls._id), false, `Duplicate ID: ${cls._id}`);
      idSet.add(cls._id);

      assert.equal(cls.type, 'class');
      assert.ok(cls.name.length > 0, 'Class name cannot be empty');
      assert.ok(cls.img.length > 0, `Class ${cls.name} must have img`);
      assert.ok(cls.system, `Class ${cls.name} must have system`);
      assert.ok(cls.system.classType && cls.system.classType.length > 0, `Class ${cls.name} must have classType`);
      assert.ok(cls.system.description.length > 0, `Class ${cls.name} must have description`);
      assert.ok(cls.system.abilities.length > 0, `Class ${cls.name} must have abilities HTML`);
      assert.ok(Array.isArray(cls.system.perks), `Class ${cls.name} must have perks array`);
    }
  });

  test('system.json registers races and classes compendium packs', () => {
    const raw = fs.readFileSync('system.json', 'utf8');
    const system = JSON.parse(raw);

    const racesPack = system.packs.find(p => p.name === 'races');
    assert.ok(racesPack, 'system.json must define "races" pack');
    assert.equal(racesPack.type, 'Item');
    assert.equal(racesPack.path, 'packs/races');

    const classesPack = system.packs.find(p => p.name === 'classes');
    assert.ok(classesPack, 'system.json must define "classes" pack');
    assert.equal(classesPack.type, 'Item');
    assert.equal(classesPack.path, 'packs/classes');
  });

  test('packs/races and packs/classes ClassicLevel database files exist on disk', () => {
    assert.ok(fs.existsSync('packs/races'), 'packs/races directory must exist');
    assert.ok(fs.existsSync('packs/classes'), 'packs/classes directory must exist');

    const raceFiles = fs.readdirSync('packs/races');
    const classFiles = fs.readdirSync('packs/classes');

    assert.ok(raceFiles.some(f => f.endsWith('.ldb') || f.endsWith('.log') || f === 'CURRENT'), 'packs/races must contain database files');
    assert.ok(classFiles.some(f => f.endsWith('.ldb') || f.endsWith('.log') || f === 'CURRENT'), 'packs/classes must contain database files');
  });

  test('game.dcc exposes canonical races and classes datasets', async () => {
    // Import src/dcc.mjs to ensure hook initialization binds datasets
    await import('../src/dcc.mjs');
    assert.ok(Array.isArray(globalThis.game?.dcc?.races), 'game.dcc.races must be an array');
    assert.equal(globalThis.game.dcc.races.length, 30);
    assert.ok(Array.isArray(globalThis.game?.dcc?.classes), 'game.dcc.classes must be an array');
    assert.equal(globalThis.game.dcc.classes.length, 52);
  });
});
