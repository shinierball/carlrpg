import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { TagIndex, tagIndex } from '../src/apps/tag-index.mjs';
import { MockItem, MockCompendium } from './setup.mjs';

describe('Tag Index Service - Core Mechanics & Operations', () => {
  let index;

  beforeEach(() => {
    index = new TagIndex();
  });

  test('initial state is empty and uninitialized', () => {
    assert.equal(index.size, 0);
    assert.equal(index.isInitialized, false);
    assert.deepEqual(index.find(), []);
  });

  test('indexes a single item and derives full tags', () => {
    const spellItem = new MockItem({
      id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      system: {
        identifier: 'fireball',
        element: 'fire',
        tags: ['favored.mage']
      }
    });

    const entry = index.indexItem(spellItem);
    assert.ok(entry);
    assert.equal(index.size, 1);
    assert.equal(entry.name, 'Fireball');
    assert.equal(entry.identifier, 'fireball');
    assert.ok(entry.allTags.has('element.fire'));
    assert.ok(entry.allTags.has('favored.mage'));
    assert.ok(entry.allTags.has('kind.spell'));
    assert.ok(entry.allTags.has('id.spell.fireball'));

    assert.equal(index.hasTag('element.fire'), true);
    assert.equal(index.hasTag('element.ice'), false);
    assert.equal(index.getByTag('element.fire').length, 1);
  });

  test('removeItem clears tags and removes item summary', () => {
    const item = new MockItem({
      id: 'skill-brawl',
      name: 'Brawling',
      type: 'skill',
      system: {
        identifier: 'brawling',
        tags: ['stat.str']
      }
    });

    index.indexItem(item);
    assert.equal(index.size, 1);
    assert.equal(index.hasTag('stat.str'), true);

    const removed = index.removeItem(item.uuid);
    assert.equal(removed, true);
    assert.equal(index.size, 0);
    assert.equal(index.hasTag('stat.str'), false);
    assert.equal(index.getByTag('stat.str').length, 0);
  });

  test('updateItem replaces previous tags with new tags', () => {
    const item = new MockItem({
      id: 'gear-blade',
      name: 'Flaming Blade',
      type: 'gear',
      system: {
        identifier: 'flaming-blade',
        tags: ['element.fire']
      }
    });

    index.indexItem(item);
    assert.ok(index.hasTag('element.fire'));
    assert.ok(!index.hasTag('element.ice'));

    // Update item tags
    item.system.tags = ['element.ice'];
    index.updateItem(item);

    assert.equal(index.size, 1);
    assert.ok(!index.hasTag('element.fire'));
    assert.ok(index.hasTag('element.ice'));
  });

  test('clear() resets all entries and tag sets', () => {
    index.indexItem(new MockItem({ id: 'i1', name: 'Item 1', type: 'gear', system: { tags: ['tag.a'] } }));
    index.indexItem(new MockItem({ id: 'i2', name: 'Item 2', type: 'gear', system: { tags: ['tag.b'] } }));
    assert.equal(index.size, 2);

    index.clear();
    assert.equal(index.size, 0);
    assert.equal(index.hasTag('tag.a'), false);
    assert.equal(index.hasTag('tag.b'), false);
  });
});

describe('Tag Index Service - Querying & Filtering with find()', () => {
  let index;

  beforeEach(() => {
    index = new TagIndex();

    index.indexItem(new MockItem({
      id: 'sp-fireball',
      name: 'Fireball',
      type: 'spell',
      system: { identifier: 'fireball', element: 'fire', tags: ['favored.mage', 'area.burst'] }
    }), { pack: 'carl-rpg.spells' });

    index.indexItem(new MockItem({
      id: 'sp-frostbite',
      name: 'Frostbite',
      type: 'spell',
      system: { identifier: 'frostbite', element: 'ice', tags: ['favored.mage', 'debuff.slow'] }
    }), { pack: 'carl-rpg.spells' });

    index.indexItem(new MockItem({
      id: 'sp-heal',
      name: 'Heal',
      type: 'spell',
      system: { identifier: 'heal', element: 'holy', tags: ['favored.cleric', 'action.heal'] }
    }), { pack: 'carl-rpg.spells' });

    index.indexItem(new MockItem({
      id: 'sk-firearms',
      name: 'Firearms',
      type: 'skill',
      system: { identifier: 'firearms', tags: ['stat.dex', 'skillGroup.rangedCombat'] }
    }), { source: 'world' });

    index.indexItem(new MockItem({
      id: 'gear-wand',
      name: 'Wand of Fire',
      type: 'gear',
      system: { identifier: 'wand-fire', tags: ['element.fire'] }
    }), { source: 'world' });
  });

  test('queries by single string tag', () => {
    const fireItems = index.find('element.fire');
    assert.equal(fireItems.length, 2);
    const names = fireItems.map(i => i.name).sort();
    assert.deepEqual(names, ['Fireball', 'Wand of Fire']);
  });

  test('queries by array of tags (implicit all)', () => {
    const results = index.find(['kind.spell', 'element.fire']);
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Fireball');
  });

  test('queries with structured { all, any, none } object', () => {
    const results = index.find({
      all: ['kind.spell'],
      any: ['element.fire', 'element.ice'],
      none: ['debuff.slow']
    });
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Fireball');
  });

  test('filters by type option', () => {
    const results = index.find('element.fire', { type: 'gear' });
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Wand of Fire');
  });

  test('filters by source option (pack vs world)', () => {
    const worldMatches = index.find('element.fire', { source: 'world' });
    assert.equal(worldMatches.length, 1);
    assert.equal(worldMatches[0].name, 'Wand of Fire');

    const packMatches = index.find('element.fire', { source: 'pack' });
    assert.equal(packMatches.length, 1);
    assert.equal(packMatches[0].name, 'Fireball');
  });

  test('filters by pack collection name', () => {
    const results = index.find('kind.spell', { pack: 'carl-rpg.spells' });
    assert.equal(results.length, 3);

    const wrongPack = index.find('kind.spell', { pack: 'carl-rpg.skills' });
    assert.equal(wrongPack.length, 0);
  });

  test('resolves full documents when options.documents is true', async () => {
    const docs = await index.find('id.spell.heal', { documents: true });
    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'Heal');
    assert.equal(typeof docs[0].update, 'function');
  });

  test('returns tag usage frequency list', () => {
    const list = index.getTagList('count');
    assert.ok(list.length > 0);
    assert.equal(list[0].count >= list[list.length - 1].count, true);

    const allTagsMap = index.getAllTags();
    assert.equal(allTagsMap.get('element.fire'), 2);
    assert.equal(allTagsMap.get('favored.mage'), 2);
  });
});

describe('Tag Index Service - Global Integration & Compendium Indexing', () => {
  beforeEach(() => {
    tagIndex.clear();
    globalThis.game.items = [];
    globalThis.game.packs.clear();
  });

  test('game.dcc.tags and game.carlRpg.tags reference the singleton instance', () => {
    assert.ok(globalThis.game.dcc.tags);
    assert.ok(globalThis.game.carlRpg.tags);
    assert.equal(globalThis.game.dcc.tags, tagIndex);
    assert.equal(globalThis.game.carlRpg.tags, tagIndex);
  });

  test('buildIndex imports from mock packs and world items', async () => {
    // Setup mock compendium pack
    const spellPack = new MockCompendium('carl-rpg.spells', 'Item');
    spellPack.documents = [
      new MockItem({
        id: 'spell-meteor',
        name: 'Meteor Shower',
        type: 'spell',
        system: { identifier: 'meteor-shower', element: 'fire', tags: ['archetype.mage'] }
      })
    ];
    globalThis.game.packs.set('carl-rpg.spells', spellPack);

    // Setup world items
    const worldSword = new MockItem({
      id: 'sword-1',
      name: 'Iron Longsword',
      type: 'gear',
      system: { identifier: 'iron-longsword', tags: ['weapon.sword'] }
    });
    globalThis.game.items.push(worldSword);

    const count = await tagIndex.buildIndex();
    assert.equal(count, 2);
    assert.equal(tagIndex.isInitialized, true);

    const spells = tagIndex.find({ all: ['element.fire'] });
    assert.equal(spells.length, 1);
    assert.equal(spells[0].name, 'Meteor Shower');

    const weapons = tagIndex.find('weapon.sword');
    assert.equal(weapons.length, 1);
    assert.equal(weapons[0].name, 'Iron Longsword');
  });

  test('MockItem mutations update the index via lifecycle methods', async () => {
    // Test reactive index updates
    const createdItem = await MockItem.create({
      id: 'axe-1',
      name: 'Battleaxe',
      type: 'gear',
      system: { identifier: 'battleaxe', tags: ['weapon.axe'] }
    });

    tagIndex.indexItem(createdItem);
    assert.ok(tagIndex.hasTag('weapon.axe'));

    // Update
    await createdItem.update({ 'system.tags': ['weapon.greataxe'] });
    tagIndex.updateItem(createdItem);
    assert.ok(!tagIndex.hasTag('weapon.axe'));
    assert.ok(tagIndex.hasTag('weapon.greataxe'));

    // Delete
    tagIndex.removeItem(createdItem.id);
    assert.ok(!tagIndex.hasTag('weapon.greataxe'));
  });
});
