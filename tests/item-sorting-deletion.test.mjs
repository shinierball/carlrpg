import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

test('DCC RPG Item Sorting & Removal Subsystem', async (t) => {
  await t.test('1. getData honors item.sort property across skills, spells, gear, and loot', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        }
      }
    });

    // Skills: Alphabetically, "Acrobatics" < "Z-Punch". Give Z-Punch a lower sort value.
    const skillA = new DCCItem({ id: 'sk-a', name: 'Acrobatics', type: 'skill', sort: 200000, system: { rank: 1 } }, crawler);
    const skillZ = new DCCItem({ id: 'sk-z', name: 'Z-Punch', type: 'skill', sort: 100000, system: { rank: 2 } }, crawler);

    // Spells: "Acid Splash" vs "Zap". Give Zap a lower sort value.
    const spellA = new DCCItem({ id: 'sp-a', name: 'Acid Splash', type: 'spell', sort: 50000, system: { rank: 1 } }, crawler);
    const spellZ = new DCCItem({ id: 'sp-z', name: 'Zap', type: 'spell', sort: 10000, system: { rank: 1 } }, crawler);

    // Gear: "Armored Vest" vs "Z-Boots".
    const gearA = new DCCItem({ id: 'g-a', name: 'Armored Vest', type: 'gear', sort: 300, system: { slot: 'torso' } }, crawler);
    const gearZ = new DCCItem({ id: 'g-z', name: 'Z-Boots', type: 'gear', sort: 100, system: { slot: 'feet' } }, crawler);

    // Loot: "Apple" vs "Z-Ration".
    const lootA = new DCCItem({ id: 'l-a', name: 'Apple', type: 'loot', sort: 20, system: { quantity: 1 } }, crawler);
    const lootZ = new DCCItem({ id: 'l-z', name: 'Z-Ration', type: 'loot', sort: 5, system: { quantity: 1 } }, crawler);

    crawler.items.push(skillA, skillZ, spellA, spellZ, gearA, gearZ, lootA, lootZ);

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet.getData();

    // Verify skills order: Z-Punch (100000) before Acrobatics (200000)
    assert.equal(context.skills[0].name, 'Z-Punch');
    assert.equal(context.skills[1].name, 'Acrobatics');

    // Verify spells order: Zap (10000) before Acid Splash (50000)
    assert.equal(context.spells[0].name, 'Zap');
    assert.equal(context.spells[1].name, 'Acid Splash');

    // Verify gear order: Z-Boots (100) before Armored Vest (300)
    assert.equal(context.gear[0].name, 'Z-Boots');
    assert.equal(context.gear[1].name, 'Armored Vest');

    // Verify loot order: Z-Ration (5) before Apple (20)
    assert.equal(context.loot[0].name, 'Z-Ration');
    assert.equal(context.loot[1].name, 'Apple');
  });

  await t.test('2. _onSortItem calculates new sort integer and updates item on actor', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {}
    });

    const spell1 = new DCCItem({ id: 'sp-1', name: 'Fireball', type: 'spell', sort: 100000 }, crawler);
    const spell2 = new DCCItem({ id: 'sp-2', name: 'Ice Shard', type: 'spell', sort: 200000 }, crawler);
    const spell3 = new DCCItem({ id: 'sp-3', name: 'Lightning', type: 'spell', sort: 300000 }, crawler);

    crawler.items.push(spell1, spell2, spell3);

    let updatedDocs = null;
    crawler.updateEmbeddedDocuments = async (embeddedName, updates) => {
      if (embeddedName === 'Item') {
        updatedDocs = updates;
        for (const u of updates) {
          const it = crawler.items.find(i => i.id === u._id);
          if (it) it.sort = u.sort;
        }
      }
      return updates;
    };

    const sheet = new DCCCrawlerSheet(crawler);

    // Drop spell3 before spell1 (moving it to the very top)
    const mockSortEvent = {
      target: {
        closest: (sel) => {
          if (sel === '[data-item-id]') return { dataset: { itemId: 'sp-1' }, getBoundingClientRect: () => ({ top: 100, height: 40 }) };
          return null;
        }
      },
      clientY: 105 // upper half of row (105 - 100 < 20) -> sortBefore = true
    };

    await sheet._onSortItem(mockSortEvent, { id: 'sp-3', type: 'spell' });

    assert.ok(updatedDocs, 'updateEmbeddedDocuments should have been called');
    assert.equal(updatedDocs[0]._id, 'sp-3');
    assert.ok(updatedDocs[0].sort < 100000, 'Spell 3 sort should now be less than Spell 1 sort');

    // Now re-check getData order
    const context = await sheet.getData();
    assert.equal(context.spells[0].name, 'Lightning', 'Lightning should now be first in context');
  });

  await t.test('3. _onDropItem routes owned item dropped on item row to _onSortItem', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { hotlist: {} }
    });
    crawler.isOwner = true;

    const skill1 = new DCCItem({ id: 'sk-1', name: 'Athletics', type: 'skill', sort: 100000 }, crawler);
    const skill2 = new DCCItem({ id: 'sk-2', name: 'Brawling', type: 'skill', sort: 200000 }, crawler);
    crawler.items.push(skill1, skill2);

    let sortItemCalledWith = null;
    const sheet = new DCCCrawlerSheet(crawler);
    sheet._onSortItem = async (event, itemData) => {
      sortItemCalledWith = itemData;
      return true;
    };

    globalThis.Item.fromDropData = async () => skill2;

    const mockEvent = {
      target: {
        closest: (sel) => {
          if (sel === '.dcc-hotlist-box') return null;
          if (sel === '.dcc-buff-slot-entry, .dcc-buff-slot') return null;
          if (sel === '[data-item-id]') return { dataset: { itemId: 'sk-1' } };
          return null;
        }
      }
    };

    await sheet._onDropItem(mockEvent, { type: 'Item', uuid: skill2.id });
    assert.ok(sortItemCalledWith, '_onSortItem should have been called');
    assert.equal(sortItemCalledWith._id || sortItemCalledWith.id, 'sk-2', 'Should pass dropped item data to _onSortItem');
  });

  await t.test('4. .item-delete click handler deletes item and clears hotlist and buff slot references', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        hotlist: {
          slot1: 'item-to-delete',
          slot2: 'item-to-keep'
        },
        attributes: {
          externalBuffs: {
            slot1: 'item-to-delete',
            slot2: ''
          }
        }
      }
    });

    let actorUpdated = null;
    crawler.update = async (data) => {
      actorUpdated = data;
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('system.hotlist.')) {
          const s = k.replace('system.hotlist.', '');
          crawler.system.hotlist[s] = v;
        }
        if (k.startsWith('system.attributes.externalBuffs.')) {
          const s = k.replace('system.attributes.externalBuffs.', '');
          crawler.system.attributes.externalBuffs[s] = v;
        }
      }
      return crawler;
    };

    let itemDeleted = false;
    const itemToDelete = new DCCItem({
      id: 'item-to-delete',
      name: 'Old Ring',
      type: 'gear'
    }, crawler);
    itemToDelete.delete = async () => {
      itemDeleted = true;
      const idx = crawler.items.indexOf(itemToDelete);
      if (idx !== -1) crawler.items.splice(idx, 1);
    };

    crawler.items.push(itemToDelete);

    const sheet = new DCCCrawlerSheet(crawler);
    const clickHandlers = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickHandlers[sel] = fn; },
        change: () => {},
        contextmenu: () => {},
        on: () => {}
      })
    };
    sheet.activateListeners(mockHtml);

    assert.ok(clickHandlers['.item-delete'], 'Sheet must register .item-delete click listener');

    let preventedDefault = false;
    let stoppedPropagation = false;
    const mockDeleteEvent = {
      preventDefault: () => { preventedDefault = true; },
      stopPropagation: () => { stoppedPropagation = true; },
      currentTarget: {
        dataset: { itemId: 'item-to-delete' },
        closest: (sel) => {
          if (sel === '[data-item-id]') return { dataset: { itemId: 'item-to-delete' } };
          return null;
        }
      }
    };

    await clickHandlers['.item-delete'](mockDeleteEvent);

    assert.equal(preventedDefault, true, 'Must prevent default on item delete');
    assert.equal(stoppedPropagation, true, 'Must stop propagation on item delete');
    assert.equal(itemDeleted, true, 'item.delete() must be called');
    assert.equal(crawler.system.hotlist.slot1, '', 'Hotlist slot1 should be cleared');
    assert.equal(crawler.system.hotlist.slot2, 'item-to-keep', 'Hotlist slot2 should remain intact');
    assert.equal(crawler.system.attributes.externalBuffs.slot1, '', 'External buff slot1 should be cleared');
  });
});
