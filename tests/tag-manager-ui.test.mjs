import './setup.mjs';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCCTagManager } from '../src/apps/tag-manager.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { MockItem } from './setup.mjs';
import { tagIndex } from '../src/apps/tag-index.mjs';
import { registerCustomTag, getTagDefinition } from '../src/data/tags.mjs';

describe('Tag Manager & Item Sheet Tag Editor UI', () => {

  beforeEach(() => {
    // Reset custom tags settings store
    if (globalThis.game?.settings?.set) {
      globalThis.game.settings.set('carl-rpg', 'customTags', []);
    }
  });

  describe('DCCTagManager Application', () => {

    test('initializes with default options and namespace', () => {
      const app = new DCCTagManager();
      assert.strictEqual(app.activeNamespace, 'all');
      assert.strictEqual(app.searchQuery, '');
      assert.strictEqual(DCCTagManager.defaultOptions.id, 'dcc-tag-manager');
      assert.ok(DCCTagManager.defaultOptions.template.includes('tag-manager.hbs'));
    });

    test('getData aggregates core tags with counts and namespace tabs', async () => {
      const app = new DCCTagManager();
      const data = await app.getData();

      assert.ok(data.totalTagsCount > 50, 'Total tags should include dozens of core tags');
      assert.ok(Array.isArray(data.namespaceTabs), 'namespaceTabs must be an array');
      assert.ok(Array.isArray(data.tagsList), 'tagsList must be an array');

      // Verify "all" tab exists and is active by default
      const allTab = data.namespaceTabs.find(t => t.id === 'all');
      assert.ok(allTab, 'Must contain "all" namespace tab');
      assert.strictEqual(allTab.active, true);
      assert.strictEqual(allTab.count, data.totalTagsCount);

      // Verify specific namespace tabs exist
      const archetypeTab = data.namespaceTabs.find(t => t.id === 'archetype');
      assert.ok(archetypeTab, 'Must contain "archetype" namespace tab');
      assert.ok(archetypeTab.count > 0);

      const elementTab = data.namespaceTabs.find(t => t.id === 'element');
      assert.ok(elementTab, 'Must contain "element" namespace tab');
      assert.ok(elementTab.count > 0);
    });

    test('getData filters tags by activeNamespace', async () => {
      const app = new DCCTagManager({ activeNamespace: 'element' });
      const data = await app.getData();

      assert.ok(data.tagsList.length > 0);
      for (const tag of data.tagsList) {
        assert.strictEqual(tag.namespace, 'element', `Tag ${tag.id} should have namespace "element"`);
      }
    });

    test('getData filters tags by searchQuery', async () => {
      const app = new DCCTagManager();
      app.searchQuery = 'fire';
      const data = await app.getData();

      assert.ok(data.tagsList.length > 0);
      for (const tag of data.tagsList) {
        const matches = tag.id.includes('fire') ||
          (tag.label && tag.label.toLowerCase().includes('fire')) ||
          (tag.description && tag.description.toLowerCase().includes('fire'));
        assert.ok(matches, `Tag ${tag.id} should match "fire"`);
      }
    });

    test('getData includes custom tags stored in game settings', async () => {
      const customTag = {
        id: 'custom.quantum-flux',
        label: 'Quantum Flux',
        namespace: 'custom',
        isCustom: true
      };
      if (globalThis.game?.settings?.set) {
        globalThis.game.settings.set('carl-rpg', 'customTags', [customTag]);
      }

      const app = new DCCTagManager({ activeNamespace: 'custom' });
      const data = await app.getData();

      const found = data.tagsList.find(t => t.id === 'custom.quantum-flux');
      assert.ok(found, 'Custom tag must be present in tagsList');
      assert.strictEqual(found.label, 'Quantum Flux');
      assert.strictEqual(found.isCustom, true);
    });
  });

  describe('Item Sheet Tag Editor Context & Operations', () => {

    test('DCCItemSheet _prepareContext prepares tagsData with explicit and derived tags', async () => {
      const item = new MockItem({
        name: 'Flame Dagger',
        type: 'gear',
        system: {
          category: 'weapon',
          identifier: 'flame-dagger',
          damageType: 'fire',
          tags: ['element.fire', 'favored.mage']
        }
      });

      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext();

      assert.ok(context.tagsData, 'tagsData must be populated in context');
      assert.strictEqual(context.tagsData.identifier, 'flame-dagger');
      assert.ok(Array.isArray(context.tagsData.explicitTags));
      assert.strictEqual(context.tagsData.explicitTags.length, 2);

      const explicitIds = context.tagsData.explicitTags.map(t => t.id);
      assert.ok(explicitIds.includes('element.fire'));
      assert.ok(explicitIds.includes('favored.mage'));

      // Derived tags should contain kind.gear, kind.weapon, and id identity tag
      assert.ok(Array.isArray(context.tagsData.derivedTags));
      const derivedIds = context.tagsData.derivedTags.map(t => t.id);
      assert.ok(derivedIds.includes('kind.gear'));
      assert.ok(derivedIds.includes('kind.weapon'));
      assert.ok(derivedIds.includes('id.gear.flame-dagger'));
    });

    test('DCCItemSheet formats clean tag labels for unknown or custom tags', async () => {
      const item = new MockItem({
        name: 'Ancient Relic',
        type: 'loot',
        system: {
          tags: ['custom.ancient-rune']
        }
      });

      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext();

      assert.strictEqual(context.tagsData.explicitTags.length, 1);
      assert.strictEqual(context.tagsData.explicitTags[0].id, 'custom.ancient-rune');
      assert.ok(context.tagsData.explicitTags[0].label.length > 0);
    });
  });

  describe('Template & Preloading Verification', () => {

    test('templates/items/parts/tags.hbs exists and contains expected DOM hooks', () => {
      assert.ok(fs.existsSync('templates/items/parts/tags.hbs'));
      const content = fs.readFileSync('templates/items/parts/tags.hbs', 'utf-8');
      assert.ok(content.includes('dcc-open-tag-manager'), 'Must contain open tag manager button');
      assert.ok(content.includes('dcc-remove-tag-btn'), 'Must contain remove tag button');
      assert.ok(content.includes('dcc-add-tag-btn'), 'Must contain add tag button');
      assert.ok(content.includes('dcc-new-tag-input'), 'Must contain tag input');
      assert.ok(content.includes('system.identifier'), 'Must contain identifier slug input');
    });

    test('templates/apps/tag-manager.hbs exists and contains expected DOM hooks', () => {
      assert.ok(fs.existsSync('templates/apps/tag-manager.hbs'));
      const content = fs.readFileSync('templates/apps/tag-manager.hbs', 'utf-8');
      assert.ok(content.includes('dcc-tag-search-input'), 'Must contain search input');
      assert.ok(content.includes('dcc-tm-tab'), 'Must contain namespace tab');
      assert.ok(content.includes('dcc-register-custom-tag-btn'), 'Must contain register tag button');
      assert.ok(content.includes('dcc-custom-tag-id'), 'Must contain custom tag ID input');
    });

    test('src/dcc.mjs preloads tags partial and tag-manager template', () => {
      const dcc = fs.readFileSync('src/dcc.mjs', 'utf-8');
      assert.ok(dcc.includes('templates/items/parts/tags.hbs'), 'Must preload tags.hbs');
      assert.ok(dcc.includes('templates/apps/tag-manager.hbs'), 'Must preload tag-manager.hbs');
    });

    test('templates/items/item-sheet.hbs includes tags partial', () => {
      const sheet = fs.readFileSync('templates/items/item-sheet.hbs', 'utf-8');
      assert.ok(sheet.includes('templates/items/parts/tags.hbs'), 'Item sheet must include tags partial');
    });
  });
});
