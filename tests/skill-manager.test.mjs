import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCSkillManager } from '../src/apps/skill-manager.mjs';
import { MockActor, MockItem } from './setup.mjs';

describe('DCC RPG Skill Library & Manager Application', () => {
  beforeEach(() => {
    globalThis.game.items = [];
    globalThis.game.folders = [];
  });

  describe('1. Unified Skill Loading & Deduplication', () => {
    test('loads official skills from CONFIG.DCC.skills and marks them as compendium', async () => {
      const manager = new DCCSkillManager();
      const skills = await manager.getUnifiedSkills();

      assert.ok(skills.length > 0, 'Unified skills should not be empty');
      const stealth = skills.find(s => s.name.toLowerCase() === 'stealth');
      assert.ok(stealth, 'Stealth skill should be loaded');
      assert.strictEqual(stealth.source, 'compendium');
      assert.strictEqual(stealth.isCompendium, true);
      assert.strictEqual(stealth.isWorld, false);
      assert.strictEqual(stealth.system.stat, 'dex');
    });

    test('loads custom world skills from game.items and marks them as world', async () => {
      // Add a custom world skill to game.items
      globalThis.game.items.push(new MockItem({
        name: 'Trap Disarming',
        type: 'skill',
        system: {
          stat: 'int',
          checkType: 'Trained Only',
          category: 'Utility',
          notes: 'Disarm dungeon pressure plates and magical traps.'
        }
      }));

      const manager = new DCCSkillManager();
      const skills = await manager.getUnifiedSkills();

      const customSkill = skills.find(s => s.name === 'Trap Disarming');
      assert.ok(customSkill, 'Trap Disarming should be present in unified skills');
      assert.strictEqual(customSkill.source, 'world');
      assert.strictEqual(customSkill.isCompendium, false);
      assert.strictEqual(customSkill.isWorld, true);
      assert.strictEqual(customSkill.system.stat, 'int');
    });

    test('world skills override or extend compendium skills cleanly without duplicates', async () => {
      // World item with same name as a config skill
      globalThis.game.items.push(new MockItem({
        name: 'Sneak',
        type: 'skill',
        system: {
          stat: 'dex',
          category: 'Combat',
          notes: 'Custom house-ruled Sneak.'
        }
      }));

      const manager = new DCCSkillManager();
      const skills = await manager.getUnifiedSkills();

      const sneaks = skills.filter(s => s.name.toLowerCase() === 'sneak');
      assert.strictEqual(sneaks.length, 1, 'Should have exactly 1 Sneak skill entry without duplicates');
    });
  });

  describe('2. Filtering & Search Logic', () => {
    test('computes correct category counts in getData', async () => {
      globalThis.game.items.push(new MockItem({
        name: 'Custom Alchemy',
        type: 'skill',
        system: { stat: 'int', category: 'General' }
      }));

      const manager = new DCCSkillManager();
      const data = await manager.getData();

      assert.ok(data.counts.all > 0);
      assert.strictEqual(data.counts.world, 1);
      assert.ok(data.counts.utility > 0);
      assert.ok(data.counts.combat >= 0);
      assert.ok(data.counts.passive >= 0);
    });

    test('filters skills by category tab', async () => {
      globalThis.game.items.push(new MockItem({
        name: 'Custom Survivalist',
        type: 'skill',
        system: { stat: 'con', category: 'Utility' }
      }));

      const manager = new DCCSkillManager();

      // World category filter
      manager.activeCategory = 'world';
      let data = await manager.getData();
      assert.ok(data.skills.length >= 1);
      assert.ok(data.skills.every(s => s.isWorld));

      // Utility category filter
      manager.activeCategory = 'utility';
      data = await manager.getData();
      assert.ok(data.skills.every(s => (s.system.category || '').toLowerCase() === 'utility'));
    });

    test('filters skills by governing stat', async () => {
      const manager = new DCCSkillManager();
      manager.activeStat = 'int';

      const data = await manager.getData();
      assert.ok(data.skills.length > 0);
      assert.ok(data.skills.every(s => s.system.stat.toLowerCase() === 'int'));
    });

    test('filters skills by text search query', async () => {
      const manager = new DCCSkillManager();
      manager.searchQuery = 'climb';

      const data = await manager.getData();
      assert.ok(data.skills.length > 0);
      assert.ok(data.skills.some(s => s.name.toLowerCase().includes('climb')));
    });
  });

  describe('3. Picker Modes (Actor & Gear Item)', () => {
    test('sets actor picker flags and flags already added skills', async () => {
      const actor = new MockActor({
        name: 'Carl',
        items: [
          new MockItem({ name: 'Climbing', type: 'skill', system: { rank: 2, stat: 'str' } })
        ]
      });

      const manager = new DCCSkillManager({ actor });
      const data = await manager.getData();

      assert.strictEqual(data.isPicker, true);
      assert.strictEqual(data.isActorPicker, true);
      assert.strictEqual(data.isItemPicker, false);

      const climbing = data.skills.find(s => s.name.toLowerCase() === 'climbing');
      assert.ok(climbing, 'Climbing should exist');
      assert.strictEqual(climbing.isAddedToActor, true, 'Climbing should be marked as already on actor sheet');

      const ambush = data.skills.find(s => s.name.toLowerCase() === 'ambush');
      if (ambush) {
        assert.strictEqual(ambush.isAddedToActor, false, 'Ambush should not be marked as on actor sheet');
      }
    });

    test('sets gear item picker flags and flags existing gear modifiers', async () => {
      const gear = new MockItem({
        name: 'Boots of Ambush',
        type: 'gear',
        system: {
          skillModifiers: [{ name: 'Ambush', bonus: 2 }]
        }
      });

      const manager = new DCCSkillManager({ item: gear });
      const data = await manager.getData();

      assert.strictEqual(data.isPicker, true);
      assert.strictEqual(data.isActorPicker, false);
      assert.strictEqual(data.isItemPicker, true);

      const ambush = data.skills.find(s => s.name.toLowerCase() === 'ambush');
      assert.ok(ambush, 'Ambush should exist');
      assert.strictEqual(ambush.isAddedToItem, true, 'Ambush should be marked as active on this gear');
    });
  });

  describe('4. Skills Folder Creation', () => {
    test('creates or retrieves dedicated Skills folder in Items directory', async () => {
      const manager = new DCCSkillManager();

      const folder = await manager.getOrCreateSkillsFolder();
      assert.ok(folder, 'Should create or return folder');
      assert.strictEqual(folder.name, 'Skills');
      assert.strictEqual(folder.type, 'Item');

      // Calling again should return the existing folder
      const sameFolder = await manager.getOrCreateSkillsFolder();
      assert.strictEqual(sameFolder.id, folder.id);
    });
  });
});
