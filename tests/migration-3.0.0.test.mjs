import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  migrateItemData300,
  migrateActorData300,
  migrateWorld300,
  slugifyText
} from '../src/migrations/migration-3.0.0.mjs';
import { MockItem, MockActor } from './setup.mjs';

describe('CarlRPG 3.0.0 System Migration', () => {

  describe('slugifyText', () => {
    test('converts plain and punctuated strings into kebab-case slugs', () => {
      assert.strictEqual(slugifyText('Fireball'), 'fireball');
      assert.strictEqual(slugifyText('Fire Bolt'), 'fire-bolt');
      assert.strictEqual(slugifyText("Boring Ol' Mage"), 'boring-ol-mage');
      assert.strictEqual(slugifyText('Acid Arrow +1'), 'acid-arrow-1');
      assert.strictEqual(slugifyText(''), '');
      assert.strictEqual(slugifyText(null), '');
    });
  });

  describe('migrateItemData300', () => {
    test('populates canonical identifier and tags for known skill item missing tags', () => {
      const legacySkill = {
        name: 'Wrasslin',
        type: 'skill',
        system: {
          rank: 3
        }
      };

      const updateData = migrateItemData300(legacySkill);
      assert.strictEqual(updateData['system.identifier'], 'wrasslin');
      assert.ok(Array.isArray(updateData['system.tags']), 'Tags must be an array');
      assert.ok(updateData['system.tags'].includes('kind.skill'));
      assert.ok(updateData['system.tags'].includes('weaponClass.unarmed'));
    });

    test('populates canonical identifier and tags for known spell item missing tags', () => {
      const legacySpell = {
        name: 'Magic Missile',
        type: 'spell',
        system: {
          manaCost: 2
        }
      };

      const updateData = migrateItemData300(legacySpell);
      assert.strictEqual(updateData['system.identifier'], 'magic-missile');
      assert.ok(Array.isArray(updateData['system.tags']));
      assert.ok(updateData['system.tags'].includes('element.force'));
      assert.ok(updateData['system.tags'].includes('kind.spell'));
    });

    test('generates slug identifier for homebrew item without canonical match', () => {
      const homebrewGear = {
        name: 'Super Heavy Steel Boots',
        type: 'gear',
        system: {
          category: 'armor'
        }
      };

      const updateData = migrateItemData300(homebrewGear);
      assert.strictEqual(updateData['system.identifier'], 'super-heavy-steel-boots');
      assert.ok(Array.isArray(updateData['system.tags']));
    });

    test('populates grants for class item missing grants', () => {
      const legacyClass = {
        name: "Boring Ol' Mage",
        type: 'class',
        system: {
          archetype: 'mage'
        }
      };

      const updateData = migrateItemData300(legacyClass);
      assert.ok(Array.isArray(updateData['system.grants']), 'Class grants must be an array');
      assert.ok(updateData['system.grants'].length > 0, 'Class grants must be populated');
      const hasSkill = updateData['system.grants'].some(g => g.name === 'Lore' || g.kind === 'skill');
      assert.ok(hasSkill, 'Boring Ol Mage grants must include Lore skill');
    });

    test('preserves existing custom tags when already defined', () => {
      const itemWithCustomTags = {
        name: 'Custom Dagger',
        type: 'gear',
        system: {
          identifier: 'custom-dagger',
          tags: ['custom.legendary', 'element.fire']
        }
      };

      const updateData = migrateItemData300(itemWithCustomTags);
      assert.strictEqual(updateData['system.identifier'], undefined, 'Existing identifier should not be overwritten');
      assert.strictEqual(updateData['system.tags'], undefined, 'Existing tags should not be overwritten');
    });
  });

  describe('migrateActorData300', () => {
    test('migrates legacy embedded items on actor', async () => {
      const actor = new MockActor({
        name: 'Crawler Jeremy',
        type: 'crawler',
        items: [
          new MockItem({
            name: 'Pugilism',
            type: 'skill',
            system: { rank: 2 }
          }),
          new MockItem({
            name: 'Smush',
            type: 'skill',
            system: { rank: 1 }
          })
        ]
      });

      const migrated = await migrateActorData300(actor);
      assert.strictEqual(migrated, 2, 'Should migrate 2 embedded items');

      const pugilism = actor.items.find(i => i.name === 'Pugilism');
      assert.strictEqual(pugilism.system.identifier, 'pugilism');
      assert.ok(pugilism.system.tags.includes('weaponClass.unarmed'));
    });
  });

  describe('migrateWorld300', () => {
    test('executes safely against world collections', async () => {
      const result = await migrateWorld300();
      assert.ok(typeof result.itemsMigrated === 'number');
      assert.ok(typeof result.actorsMigrated === 'number');
    });
  });
});
