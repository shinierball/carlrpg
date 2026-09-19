import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCBuffDebuffManager } from '../src/apps/buff-manager.mjs';
import { DCCSkillManager } from '../src/apps/skill-manager.mjs';
import { DCCSpellManager } from '../src/apps/spell-manager.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('Managers Extended Coverage Suite', async (t) => {

  await t.test('1. DCCBuffDebuffManager: summaries, conditions, and listeners', async () => {
    const actor = new DCCActor({
      name: 'Carl Buff Actor',
      type: 'crawler',
      system: {
        attributes: {
          externalBuffs: { buff1: 'strength-boost', buff2: '', buff3: '' }
        }
      }
    });

    const manager = new DCCBuffDebuffManager({ actor, targetSlot: 'buff2' });

    // Test getUnifiedConditions with world & actor items
    globalThis.game.items = [
      new DCCItem({
        id: 'world-buff-1',
        name: 'Iron Skin',
        type: 'buff',
        system: { buffType: 'tempHp', value: 20 }
      }),
      new DCCItem({
        id: 'world-buff-2',
        name: 'Fire Ward',
        type: 'buff',
        system: { buffType: 'resistance', damageType: 'fire' }
      }),
      new DCCItem({
        id: 'world-buff-3',
        name: 'Godly Might',
        type: 'buff',
        system: { buffType: 'damageMultiplier', value: 3 }
      }),
      new DCCItem({
        id: 'world-debuff-1',
        name: 'Acid Rot',
        type: 'debuff',
        system: { reductionPercent: 25, damageType: 'physical', stat: 'con', value: -2 }
      })
    ];

    const conditions = await manager.getUnifiedConditions();
    assert.ok(conditions.length >= 4);

    const ironSkin = conditions.find(c => c.name === 'Iron Skin');
    assert.ok(ironSkin);
    assert.equal(ironSkin.isBuff, true);

    const data = await manager.getData();
    assert.ok(data.conditions.length > 0);

    // Test applyConditionToActor with targetSlot
    await manager.applyConditionToActor({
      id: 'iron-skin',
      name: 'Iron Skin',
      type: 'buff'
    });
    assert.equal(actor.system.attributes.externalBuffs.buff2, 'iron-skin');

    // Test applyConditionToActor with auto empty slot
    manager.targetSlot = null;
    await manager.applyConditionToActor({
      id: 'fire-ward',
      name: 'Fire Ward',
      type: 'buff'
    });
    assert.equal(actor.system.attributes.externalBuffs.buff3, 'fire-ward');

    // Test applyConditionToActor when slots full -> embeds item
    await manager.applyConditionToActor({
      id: 'godly-might',
      name: 'Godly Might',
      type: 'buff',
      system: { buffType: 'damageMultiplier', value: 3 }
    });
    const embeddedBuff = actor.items.find(i => i.name === 'Godly Might');
    assert.ok(embeddedBuff);

    // Test apply debuff -> embeds debuff
    await manager.applyConditionToActor({
      id: 'acid-rot',
      name: 'Acid Rot',
      type: 'debuff',
      system: { stat: 'con', value: -2 }
    });
    const embeddedDebuff = actor.items.find(i => i.name === 'Acid Rot');
    assert.ok(embeddedDebuff);

    // Test applyCondition when no actor
    const noActorManager = new DCCBuffDebuffManager({});
    await noActorManager.applyConditionToActor({ name: 'Test', type: 'buff' });

    // Test activateListeners
    const clickHandlers = {};
    const inputHandlers = {};
    const createChain = (sel) => {
      const obj = {
        click: (fn) => { clickHandlers[sel] = fn; return obj; },
        on: (ev, fn) => { inputHandlers[sel + ':' + ev] = fn; return obj; },
        data: () => obj
      };
      return obj;
    };
    const mockEl = { find: (sel) => createChain(sel) };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockEl) return mockEl;
      return {
        data: (k) => {
          if (k === 'tab') return 'debuffs';
          if (k === 'name') return 'Acid Rot';
          if (k === 'type') return 'debuff';
          return null;
        }
      };
    };

    manager.activateListeners(mockEl);

    // Search query input
    inputHandlers['.condition-search-input:input']({ currentTarget: { value: 'Skin' } });
    assert.equal(manager.searchQuery, 'skin');

    // Clear search
    clickHandlers['.condition-search-clear']({ preventDefault: () => {} });
    assert.equal(manager.searchQuery, '');

    // Tab filter
    clickHandlers['.condition-tab-pill']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(manager.activeTab, 'debuffs');

    // Apply button
    await clickHandlers['.btn-apply-condition']({ preventDefault: () => {}, currentTarget: {} });

    globalThis.$ = orig$;
  });

  await t.test('2. DCCSkillManager: world skills, dialog, and listeners', async () => {
    const actor = new DCCActor({
      name: 'Carl Skills Actor',
      type: 'crawler'
    });
    const manager = new DCCSkillManager({ actor });

    const data = await manager.getData();
    assert.ok(data.skills.length > 0);
    assert.ok(data.counts.all > 0);

    // Test openCreateSkillDialog
    let createdItemPayload = null;
    const origItemCreate = DCCItem.create;
    DCCItem.create = async (payload) => {
      createdItemPayload = payload;
      return new DCCItem(payload);
    };

    // Trigger dialog creation
    await manager.openCreateSkillDialog();
    // Verify dialog instantiated
    DCCItem.create = origItemCreate;

    // Test activateListeners
    const clickHandlers = {};
    const inputHandlers = {};
    const createChain = (sel) => {
      const obj = {
        click: (fn) => { clickHandlers[sel] = fn; return obj; },
        on: (ev, fn) => { inputHandlers[sel + ':' + ev] = fn; return obj; },
        val: () => (sel === '#dcc-sm-gear-bonus' ? '2' : 'Stealth'),
        map: (fn) => ({ get: () => ['Stealth'] })
      };
      return obj;
    };
    const mockEl = { find: (sel) => createChain(sel) };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockEl) return mockEl;
      return {
        val: () => 'stealth',
        data: (k) => {
          if (k === 'category') return 'Combat';
          if (k === 'stat') return 'dex';
          if (k === 'id') return 'sk-1';
          if (k === 'name') return 'Stealth';
          return null;
        }
      };
    };

    manager.activateListeners(mockEl);

    // Search input
    inputHandlers['.dcc-sm-search:input']({ currentTarget: {} });
    assert.equal(manager.searchQuery, 'stealth');

    // Category filter
    clickHandlers['.dcc-sm-category-btn']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(manager.activeCategory, 'Combat');

    // Stat filter
    clickHandlers['.dcc-sm-stat-pill']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(manager.activeStat, 'dex');

    // Add selected skills to actor
    await clickHandlers['.dcc-sm-add-to-actor']({ preventDefault: () => {} });
    const addedSkill = actor.items.find(i => i.name.toLowerCase() === 'stealth');
    assert.ok(addedSkill);

    // Select skill for gear item modifier
    const gearItem = new DCCItem({
      name: 'Rogue Cloak',
      type: 'gear',
      system: { skillModifiers: [] }
    });
    const gearManager = new DCCSkillManager({ item: gearItem, targetIndex: null });
    gearManager.activateListeners(mockEl);
    await clickHandlers['.dcc-sm-select-for-item']({ preventDefault: () => {}, currentTarget: {} });
    assert.ok(gearItem.system.skillModifiers.some(m => m.name === 'Stealth'));

    globalThis.$ = orig$;
  });

  await t.test('3. DCCSpellManager: spell filters, cast preview, and drag start', async () => {
    const actor = new DCCActor({
      name: 'Carl Spells Actor',
      type: 'crawler'
    });
    const manager = new DCCSpellManager({ actor });

    const data = await manager.getData();
    assert.ok(data.spells.length > 0);

    // Test addSpellToActor
    await manager.addSpellToActor({
      name: 'Fireball',
      img: 'icons/svg/fire.svg',
      system: { rank: 1, manaCost: 5, stat: 'int' }
    });
    const fb = actor.items.find(i => i.name === 'Fireball');
    assert.ok(fb);

    // Test _onDragStart
    const dragEvent = {
      currentTarget: { dataset: { spellName: 'Fireball' } },
      dataTransfer: {
        setData: (type, val) => {
          assert.equal(type, 'text/plain');
          const parsed = JSON.parse(val);
          assert.equal(parsed.name, 'Fireball');
          assert.equal(parsed.type, 'Item');
        }
      }
    };
    manager._onDragStart(dragEvent);

    // Test activateListeners
    const clickHandlers = {};
    const inputHandlers = {};
    const changeHandlers = {};
    const createChain = (sel) => {
      const obj = {
        click: (fn) => { clickHandlers[sel] = fn; return obj; },
        on: (ev, fn) => { inputHandlers[sel + ':' + ev] = fn; return obj; },
        change: (fn) => { changeHandlers[sel] = fn; return obj; },
        data: () => obj
      };
      return obj;
    };
    const mockEl = { find: (sel) => createChain(sel) };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockEl) return mockEl;
      return {
        data: (k) => {
          if (k === 'type') return 'Damage';
          if (k === 'spellName') return 'Fireball';
          return null;
        }
      };
    };

    manager.activateListeners(mockEl);

    // Search query input
    inputHandlers['.spell-search-input:input']({ currentTarget: { value: 'Fire' } });
    assert.equal(manager.searchQuery, 'fire');

    // Clear search
    clickHandlers['.spell-search-clear']({ preventDefault: () => {} });
    assert.equal(manager.searchQuery, '');

    // Type pill
    clickHandlers['.spell-type-pill']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(manager.activeSpellType, 'Damage');

    // Stat dropdown
    changeHandlers['.spell-stat-filter']({ currentTarget: { value: 'int' } });
    assert.equal(manager.activeStat, 'int');

    // Damage dropdown
    changeHandlers['.spell-damage-filter']({ currentTarget: { value: 'Fire' } });
    assert.equal(manager.activeDamageType, 'Fire');

    // Learn spell button
    await clickHandlers['.btn-learn-spell']({ preventDefault: () => {}, currentTarget: {} });

    // Cast spell button
    await clickHandlers['.btn-cast-spell']({ preventDefault: () => {}, currentTarget: {} });

    globalThis.$ = orig$;
  });

  await t.test('4. DCCCrawlerCreatorApp: unarmed mode and createCrawler execution', async () => {
    const app = new DCCCrawlerCreatorApp();
    app.name = 'Princess Donut';
    app.species = 'animal';
    app._initializeDefaultSelections();
    app.starterMode = 'unarmed';
    app.starterUnarmed = 'beast';

    // Set valid standard stats
    app.stats = {
      str: 5,
      con: 6,
      int: 2,
      dex: 4,
      cha: 3
    };

    const data = await app.getData();
    assert.ok(data.canCreate, 'Should be valid to create character');
    assert.ok(data.starterUnarmedOptions.length > 0);

    // Execute createCrawler
    let createdActor = null;
    const origActorCreate = DCCActor.create;
    DCCActor.create = async (payload) => {
      createdActor = new DCCActor(payload);
      return createdActor;
    };

    const crawler = await app.createCrawler();
    assert.ok(crawler);
    assert.equal(crawler.name, 'Princess Donut');
    assert.ok(crawler.items.length >= 8, 'Crawler should have all background, starter, and Heal spells');
    const healSpell = crawler.items.find(i => i.name.toLowerCase() === 'heal');
    assert.ok(healSpell, 'Must have Heal spell rank 1');

    // Test listeners
    const clickHandlers = {};
    const changeHandlers = {};
    const inputHandlers = {};
    const createChain = (sel) => {
      const obj = {
        click: (fn) => { clickHandlers[sel] = fn; return obj; },
        change: (fn) => { changeHandlers[sel] = fn; return obj; },
        on: (ev, fn) => { inputHandlers[sel + ':' + ev] = fn; return obj; },
        data: () => obj,
        val: () => 'human'
      };
      return obj;
    };
    const mockEl = { find: (sel) => createChain(sel) };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => {
      if (el === mockEl) return mockEl;
      return {
        val: () => 'human',
        data: (k) => 'human',
        attr: () => 'human'
      };
    };

    app.activateListeners(mockEl);

    // Test species change
    inputHandlers['input[name="creator-species"]:change']({ currentTarget: { value: 'human' } });
    assert.equal(app.species, 'human');

    // Test name input
    inputHandlers['input[name="creator-name"]:input']({ currentTarget: { value: 'Carl' } });
    assert.equal(app.name, 'Carl');

    // Test randomize button
    inputHandlers['.dcc-randomize-btn:click']({ preventDefault: () => {} });
    assert.ok(app.name);

    DCCActor.create = origActorCreate;
    globalThis.$ = orig$;
  });
});
