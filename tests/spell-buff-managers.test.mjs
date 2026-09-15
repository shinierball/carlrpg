import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCSpellManager } from '../src/apps/spell-manager.mjs';
import { DCCBuffDebuffManager } from '../src/apps/buff-manager.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_BUFFS, DCC_DEBUFFS } from '../src/data/buffs.mjs';

describe('DCC RPG Dedicated Spell & Condition Manager Applications', () => {

  describe('1. DCCSpellManager Subsystem', () => {
    test('initializes with default options and binds to actor', () => {
      const actor = new DCCActor({ name: 'Mordecai', type: 'crawler' });
      const manager = new DCCSpellManager({ actor });

      assert.equal(manager.actor.name, 'Mordecai');
      assert.equal(manager.activeSpellType, 'all');
      assert.equal(manager.activeStat, 'all');
      assert.equal(manager.activeDamageType, 'all');
      assert.equal(manager.searchQuery, '');
    });

    test('getUnifiedSpells indexes all canonical spells and detects known spells', async () => {
      const actor = new DCCActor({
        name: 'Mordecai',
        type: 'crawler',
        items: [
          {
            name: 'Fireball',
            type: 'spell',
            system: { manaCost: 5, spellType: 'Attack' }
          }
        ]
      });

      const manager = new DCCSpellManager({ actor });
      const spells = await manager.getUnifiedSpells();

      assert.ok(spells.length >= 50, 'Expected at least 50 unified spells');

      const fireball = spells.find(s => s.name.toLowerCase() === 'fireball');
      assert.ok(fireball, 'Fireball must be found');
      assert.equal(fireball.isKnown, true, 'Fireball must be marked as isKnown on the actor');

      const heal = spells.find(s => s.system.spellType.toLowerCase() === 'heal');
      assert.ok(heal, 'A heal spell must exist');
      assert.equal(heal.isKnown, false, 'Unlearned spell must have isKnown: false');
    });

    test('getData filters by spell type, stat, and search query', async () => {
      const manager = new DCCSpellManager();
      let data = await manager.getData();
      assert.ok(data.spells.length >= 50);

      // Filter by type: attack
      manager.activeSpellType = 'attack';
      data = await manager.getData();
      for (const spell of data.spells) {
        assert.ok((spell.system.spellType || '').toLowerCase().includes('attack'), 'All filtered spells must be attack type');
      }

      // Filter by search query
      manager.activeSpellType = 'all';
      manager.searchQuery = 'magic missile';
      data = await manager.getData();
      assert.ok(data.spells.length >= 1);
      assert.ok(data.spells.some(s => s.name.toLowerCase().includes('magic missile')));
    });

    test('addSpellToActor embeds spell item on character', async () => {
      const actor = new DCCActor({ name: 'Mordecai', type: 'crawler' });
      const manager = new DCCSpellManager({ actor });

      const spellData = DCC_SPELLS.find(s => s.name.toLowerCase() === 'magic missile') || DCC_SPELLS[0];
      await manager.addSpellToActor(spellData);

      const added = actor.items.find(i => i.name.toLowerCase() === spellData.name.toLowerCase() && i.type === 'spell');
      assert.ok(added, 'Spell must be created in actor items');
    });
  });

  describe('2. DCCBuffDebuffManager Subsystem', () => {
    test('initializes and indexes both buffs and debuffs', async () => {
      const actor = new DCCActor({ name: 'Princess Donut', type: 'crawler' });
      const manager = new DCCBuffDebuffManager({ actor });

      assert.equal(manager.actor.name, 'Princess Donut');
      assert.equal(manager.activeTab, 'all');

      const conditions = await manager.getUnifiedConditions();
      assert.ok(conditions.length >= (DCC_BUFFS.length + DCC_DEBUFFS.length), 'Must index both buffs and debuffs');

      const buffsCount = conditions.filter(c => c.isBuff).length;
      const debuffsCount = conditions.filter(c => c.isDebuff).length;
      assert.ok(buffsCount >= 32, 'Must index at least 32 buffs');
      assert.ok(debuffsCount >= 16, 'Must index at least 16 debuffs');
    });

    test('getData filters by activeTab', async () => {
      const manager = new DCCBuffDebuffManager();

      manager.activeTab = 'buffs';
      let data = await manager.getData();
      assert.ok(data.conditions.every(c => c.isBuff), 'All entries must be buffs when activeTab is buffs');

      manager.activeTab = 'debuffs';
      data = await manager.getData();
      assert.ok(data.conditions.every(c => c.isDebuff), 'All entries must be debuffs when activeTab is debuffs');
    });

    test('applyConditionToActor creates embedded debuff item', async () => {
      const actor = new DCCActor({ name: 'Princess Donut', type: 'crawler' });
      const manager = new DCCBuffDebuffManager({ actor });

      const debuffData = DCC_DEBUFFS.find(d => d.name === 'Burned');
      await manager.applyConditionToActor(debuffData);

      const embedded = actor.items.find(i => i.name === 'Burned' && i.type === 'debuff');
      assert.ok(embedded, 'Burned debuff must be embedded on the actor');
    });

    test('applyConditionToActor assigns buff to external buff slot when targeting slot', async () => {
      const actor = new DCCActor({
        name: 'Princess Donut',
        type: 'crawler',
        system: {
          attributes: {
            externalBuffs: { buff1: '', buff2: '', buff3: '' }
          }
        }
      });
      const manager = new DCCBuffDebuffManager({ actor, targetSlot: 'buff2' });

      const buffData = DCC_BUFFS.find(b => b.name.includes('Strength')) || DCC_BUFFS[0];
      await manager.applyConditionToActor(buffData);

      assert.equal(actor.system.attributes.externalBuffs.buff2, buffData.id || buffData._id);
    });
  });
});
