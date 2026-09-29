import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItemManager } from '../src/apps/item-manager.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { MockActor, MockItem } from './setup.mjs';

describe('DCC RPG Item & Equipment Library / Manager Application', () => {
  beforeEach(() => {
    globalThis.game.items = [];
    globalThis.game.folders = [];
  });

  describe('1. Unified Item Loading & Canonical Dataset', () => {
    test('loads canonical DCC items and categorizes gear and loot items', async () => {
      const manager = new DCCItemManager();
      const items = await manager.getUnifiedItems();

      assert.ok(items.length > 0, 'Unified items should not be empty');

      // Canonical weapon
      const bat = items.find(i => i.name.toLowerCase().includes('spiked baseball bat'));
      assert.ok(bat, 'Spiked Baseball Bat should be present');
      assert.strictEqual(bat.type, 'gear');
      assert.strictEqual(bat.isCompendium, true);

      // Canonical potion
      const potion = items.find(i => i.name.toLowerCase().includes('lesser health potion'));
      assert.ok(potion, 'Lesser Health Potion should be present');
      assert.strictEqual(potion.type, 'loot');

      // Canonical wand
      const wand = items.find(i => i.name.toLowerCase().includes('wand of magic sparks'));
      assert.ok(wand, 'Wand of Magic Sparks should be present');
      assert.strictEqual(wand.type, 'loot');
      assert.strictEqual(wand.system.lootType, 'wand');

      // Canonical scroll
      const scroll = items.find(i => i.name.toLowerCase().includes('scroll of fireball'));
      assert.ok(scroll, 'Scroll of Fireball should be present');
      assert.strictEqual(scroll.type, 'loot');
      assert.strictEqual(scroll.system.lootType, 'scroll');
    });

    test('loads custom world items from game.items and marks them as world', async () => {
      globalThis.game.items.push(new MockItem({
        name: 'Enchanted Goblin Cleaver',
        type: 'gear',
        system: {
          slot: 'hands',
          isWeapon: true,
          value: 150,
          notes: 'Inflicts additional bleeding damage.'
        }
      }));

      const manager = new DCCItemManager();
      const items = await manager.getUnifiedItems();

      const cleaver = items.find(i => i.name === 'Enchanted Goblin Cleaver');
      assert.ok(cleaver, 'Custom world weapon should be loaded');
      assert.strictEqual(cleaver.source, 'world');
      assert.strictEqual(cleaver.isWorld, true);
      assert.strictEqual(cleaver.isCompendium, false);
    });
  });

  describe('2. Category Counts & Filtering Logic', () => {
    test('computes counts across gear, weapons, armor, accessories, potions, scrolls, wands, and lottery', async () => {
      const manager = new DCCItemManager();
      const data = await manager.getData();

      assert.ok(data.counts.all > 0);
      assert.ok(data.counts.gear > 0);
      assert.ok(data.counts.weapons > 0);
      assert.ok(data.counts.armor > 0);
      assert.ok(data.counts.accessories > 0);
      assert.ok(data.counts.loot > 0);
      assert.ok(data.counts.consumables > 0);
      assert.ok(data.counts.scrolls > 0);
      assert.ok(data.counts.wands > 0);
      assert.ok(data.counts.lottery > 0);
    });

    test('filters by active category tab', async () => {
      const manager = new DCCItemManager();

      // Weapons filter
      manager.activeCategory = 'weapons';
      let data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'gear' && i.isWeapon));

      // Armor filter
      manager.activeCategory = 'armor';
      data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'gear' && !i.isWeapon && i.slot !== 'accessory'));

      // Accessories filter
      manager.activeCategory = 'accessories';
      data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'gear' && i.slot === 'accessory'));

      // Scrolls filter
      manager.activeCategory = 'scrolls';
      data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'loot' && i.lootType === 'scroll'));

      // Wands filter
      manager.activeCategory = 'wands';
      data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'loot' && i.lootType === 'wand'));

      // Lottery filter
      manager.activeCategory = 'lottery';
      data = await manager.getData();
      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'loot' && i.lootType.includes('scratch')));
    });

    test('filters by active slot dropdown', async () => {
      const manager = new DCCItemManager();
      manager.activeCategory = 'all';
      manager.activeSlot = 'torso';
      const data = await manager.getData();

      assert.ok(data.items.length > 0);
      assert.ok(data.items.every(i => i.type === 'gear' && i.slot === 'torso'));
    });

    test('filters items by search query string', async () => {
      const manager = new DCCItemManager();
      manager.searchQuery = 'fireball';
      const data = await manager.getData();

      assert.ok(data.items.length > 0);
      assert.ok(data.items.some(i => i.name.toLowerCase().includes('fireball')));
    });
  });

  describe('3. Actor Determine Value Appraisal & Ownership', () => {
    test('masks gold values as "???" when crawler lacks Determine Value rank 10', async () => {
      const actor = new MockActor({
        name: 'Carl',
        items: []
      });
      // Mock determine value check returning false
      actor.canSeeItemValue = () => false;

      const manager = new DCCItemManager({ actor });
      const data = await manager.getData();

      assert.strictEqual(data.canSeeValue, false);
      assert.ok(data.items.every(i => i.displayValue === '???'));
    });

    test('reveals gold values when crawler has Determine Value rank 10', async () => {
      const actor = new MockActor({
        name: 'Carl',
        items: []
      });
      actor.canSeeItemValue = () => true;

      const manager = new DCCItemManager({ actor });
      const data = await manager.getData();

      assert.strictEqual(data.canSeeValue, true);
      assert.ok(data.items.every(i => i.displayValue.endsWith('GP')));
    });

    test('detects already-owned items and tracks quantity on actor', async () => {
      const actor = new MockActor({
        name: 'Carl',
        items: [
          new MockItem({
            name: 'Lesser Health Potion',
            type: 'loot',
            system: { quantity: 3, lootType: 'consumable' }
          })
        ]
      });

      const manager = new DCCItemManager({ actor });
      const data = await manager.getData();

      const potion = data.items.find(i => i.name === 'Lesser Health Potion');
      assert.ok(potion);
      assert.strictEqual(potion.isOwned, true);
      assert.strictEqual(potion.ownedQty, 3);
    });

    test('addItemToActor creates embedded document on the crawler', async () => {
      const actor = new MockActor({
        name: 'Carl',
        items: []
      });

      const manager = new DCCItemManager({ actor });
      const added = await manager.addItemToActor({
        name: 'Obsidian Dagger',
        type: 'gear',
        img: 'icons/svg/sword.svg',
        system: {
          slot: 'hands',
          isWeapon: true,
          value: 45
        }
      });

      assert.ok(added);
      assert.strictEqual(actor.items.length, 1);
      assert.strictEqual(actor.items[0].name, 'Obsidian Dagger');
    });
  });

  describe('4. Crawler Sheet Integration', () => {
    test('DCCCrawlerSheet has _openItemPicker method opening DCCItemManager', () => {
      const actor = new MockActor({ name: 'Carl' });
      const sheet = new DCCCrawlerSheet(actor);

      assert.strictEqual(typeof sheet._openItemPicker, 'function');
    });
  });
});
