import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG Spells Dataset & Compendium', () => {
  test('all 54 spells from the cheat sheet are present and valid', () => {
    assert.equal(DCC_SPELLS.length, 54, 'Expected exactly 54 spells');

    const expectedSpells = [
      'Air Buddy', 'Astral Paw', 'Bad Faith', 'Bang Bro', 'Clockwork Triplicate',
      'Confusing Fog', 'Dirt Clod', 'Drain Life', 'Earworm', 'Fear',
      'Fire Fingers', 'Fireball', 'Frost Scar', 'Grand Illusion', 'Heal',
      'Heal Critter', 'Heal Others', 'Heal Self', 'Hole', 'Holy Aura',
      'Hot Stuff Aura', 'Ice Blast', 'Icicles', 'Intimate Touches', 'Lightning Bolt',
      'Magic Missile', 'Mind Tickle', 'Minion Army', "Nature's Breath", 'Oakhide',
      "Paladin's Smite", 'Panty Dropper', 'Ping', 'Protective Shell', 'Puddle Jumper',
      'Rise, Dead Minion!', 'Rootfoot', 'Second Chance', 'Shield', 'Shock Treatment',
      'Solsplash', 'Soul Collector', 'Thunderlash', 'Torch', 'Tripper',
      'Turn Undead', 'Twinkle Toes', 'Unnecessary Force', 'Vine Porn', 'Wall of Fire',
      'Water Breathing', 'Web', "Wilbur's Slow-Build Fireblast", 'Wisp Armor'
    ];

    const actualNames = DCC_SPELLS.map(s => s.name);
    for (const expected of expectedSpells) {
      assert.ok(actualNames.includes(expected), `Missing spell: ${expected}`);
    }

    // Verify IDs are unique and follow dccspl format
    const idSet = new Set();
    for (const spell of DCC_SPELLS) {
      assert.match(spell._id, /^dccspl\d{10}$/, `Invalid ID format for ${spell.name}`);
      assert.equal(idSet.has(spell._id), false, `Duplicate ID: ${spell._id}`);
      idSet.add(spell._id);

      assert.equal(spell.type, 'spell');
      assert.ok(spell.img.length > 0, `Spell ${spell.name} has missing img`);
      assert.ok(typeof spell.system.manaCost === 'number', `Spell ${spell.name} manaCost must be number`);
      assert.ok(spell.system.range.length > 0, `Spell ${spell.name} range must not be empty`);
      assert.ok(spell.system.duration.length > 0, `Spell ${spell.name} duration must not be empty`);
      assert.ok(spell.system.description.length > 0, `Spell ${spell.name} description must not be empty`);
      assert.ok(spell.system.upgrades, `Spell ${spell.name} must have upgrades object`);
      assert.ok(typeof spell.system.upgrades.rank5 === 'string', `Spell ${spell.name} must have rank5 upgrade`);
      assert.ok(typeof spell.system.upgrades.rank10 === 'string', `Spell ${spell.name} must have rank10 upgrade`);
      assert.ok(typeof spell.system.upgrades.rank15 === 'string', `Spell ${spell.name} must have rank15 upgrade`);
    }
  });

  test('template.json registers spell item type with default schema', () => {
    const raw = fs.readFileSync('template.json', 'utf8');
    const template = JSON.parse(raw);
    assert.ok(template.Item.types.includes('spell'), 'template.json must contain "spell" in Item.types');
    assert.ok(template.Item.spell, 'template.json must define default schema for spell');
    assert.equal(template.Item.spell.rank, 1);
    assert.equal(template.Item.spell.manaCost, 0);
  });

  test('system.json registers carl-rpg.spells compendium pack', () => {
    const raw = fs.readFileSync('system.json', 'utf8');
    const system = JSON.parse(raw);
    const spellsPack = system.packs.find(p => p.name === 'spells');
    assert.ok(spellsPack, 'system.json must declare a "spells" pack');
    assert.equal(spellsPack.path, 'packs/spells');
    assert.equal(spellsPack.type, 'Item');
    assert.equal(spellsPack.system, 'carl-rpg');
  });

  test('crawler sheet categorizes embedded spells', async () => {
    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 45,
        range: '80 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire'
      }
    });

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      items: [fireball]
    });

    const sheet = new DCCCrawlerSheet(crawler);
    const data = await sheet.getData();

    assert.equal(data.spells.length, 1);
    assert.equal(data.spells[0].name, 'Fireball');
    assert.equal(data.spells[0].system.manaCost, 45);
    assert.equal(data.spells[0].statMod, 0);
    assert.equal(data.spells[0].statModStr, '+0');
  });

  test('spell roll generates chat message card with quote, stats, and description', async () => {
    const spell = new DCCItem({
      name: 'Air Buddy',
      type: 'spell',
      img: 'icons/svg/wing.svg',
      system: {
        rank: 1,
        manaCost: 12,
        range: 'Self',
        duration: 'Instantaneous',
        quote: "There’s no dungeon rule that a dog can’t fly.",
        description: 'You launch yourself with enough force to fly.'
      }
    });

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      items: [spell]
    });

    const chatMsg = await crawler.rollSpell(spell);
    assert.ok(chatMsg.content.includes('Air Buddy'));
    assert.ok(chatMsg.content.includes('There’s no dungeon rule that a dog can’t fly.'));
    assert.ok(chatMsg.content.includes('Mana:'));
    assert.ok(chatMsg.content.includes('12'));
    assert.ok(chatMsg.content.includes('Instantaneous'));
  });

  test('crawler sheet template defines dedicated Spells tab and preloads spells.hbs', () => {
    const crawlerSheetHbs = fs.readFileSync('templates/actors/crawler-sheet.hbs', 'utf8');
    assert.ok(crawlerSheetHbs.includes('data-tab="spells"'), 'crawler-sheet.hbs must define data-tab="spells"');
    assert.ok(crawlerSheetHbs.includes('systems/carl-rpg/templates/actors/parts/spells.hbs'), 'crawler-sheet.hbs must include spells.hbs partial');

    const dccMjs = fs.readFileSync('src/dcc.mjs', 'utf8');
    assert.ok(dccMjs.includes("'systems/carl-rpg/templates/actors/parts/spells.hbs'"), 'dcc.mjs loadTemplates must include spells.hbs');

    const spellsHbs = fs.readFileSync('templates/actors/parts/spells.hbs', 'utf8');
    assert.ok(spellsHbs.includes('open-spell-picker'), 'spells.hbs must have open-spell-picker button');
    assert.ok(spellsHbs.includes('data-type="spell"'), 'spells.hbs must have item-create data-type="spell"');
    assert.ok(spellsHbs.includes('roll-spell'), 'spells.hbs must have roll-spell action button');
    assert.ok(spellsHbs.includes('dcc-spells-table'), 'spells.hbs must contain dcc-spells-table');

    const hotlistHbs = fs.readFileSync('templates/actors/parts/page2-hotlist.hbs', 'utf8');
    assert.equal(hotlistHbs.includes('{{!-- SPELLS LIST --}}'), false, 'page2-hotlist.hbs should not contain temporary spells list');
  });
});
