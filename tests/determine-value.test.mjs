import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { LootDataModel } from '../src/models/items/loot-model.mjs';

test('CarlRPG Determine Value Skill & Item Gold Value Subsystem', async (t) => {
  await t.test('1. Gear and Loot models and schemas include default value of 0 and goldValue getter', () => {
    const gearModel = new GearDataModel();
    assert.equal(gearModel.value, 0, 'Gear model should default value to 0');
    assert.equal(gearModel.goldValue, 0, 'Gear goldValue getter should return 0');

    const lootModel = new LootDataModel();
    assert.equal(lootModel.value, 0, 'Loot model should default value to 0');
    assert.equal(lootModel.goldValue, 0, 'Loot goldValue getter should return 0');

    const customGear = new DCCItem({
      name: 'Steel Bastard Sword',
      type: 'gear',
      system: { slot: 'hands', value: 75 }
    });
    assert.equal(customGear.system.value, 75);
    assert.equal(customGear.goldValue, 75, 'item.goldValue getter returns numerical value');

    const customLoot = new DCCItem({
      name: 'Greater Healing Potion',
      type: 'loot',
      system: { lootType: 'consumable', value: 120 }
    });
    assert.equal(customLoot.system.value, 120);
    assert.equal(customLoot.goldValue, 120);
  });

  await t.test('2. Actor Determine Value rank detection and capability methods', () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { int: { value: 14, mod: 4 } } }
    });

    // Default without skill
    assert.equal(crawler.getDetermineValueRank(), 0);
    assert.equal(crawler.canDetermineValue(), false);
    assert.equal(crawler.canSeeItemValue(), false);
    assert.equal(crawler.canSortInventoryByValue(), false);

    // Rank 3 (below rank 5 threshold)
    const skillItem = new DCCItem({
      id: 'det-val',
      name: 'Determine Value',
      type: 'skill',
      system: { rank: 3 }
    }, crawler);
    crawler.items.push(skillItem);

    assert.equal(crawler.getDetermineValueRank(), 3);
    assert.equal(crawler.canDetermineValue(), false);
    assert.equal(crawler.canSeeItemValue(), false);
    assert.equal(crawler.canSortInventoryByValue(), false);

    // Rank 5 (rank 5 threshold: can sort by value, but CANNOT see value)
    skillItem.system.rank = 5;
    skillItem.system.modifiedRank = 5;
    assert.equal(crawler.getDetermineValueRank(), 5);
    assert.equal(crawler.canDetermineValue(), false, 'Rank 5 cannot see value');
    assert.equal(crawler.canSeeItemValue(), false, 'Rank 5 cannot see value');
    assert.equal(crawler.canSortInventoryByValue(), true, 'Rank 5 can sort inventory by value');

    // Rank 9 (still below 10 threshold)
    skillItem.system.rank = 9;
    skillItem.system.modifiedRank = 9;
    assert.equal(crawler.getDetermineValueRank(), 9);
    assert.equal(crawler.canDetermineValue(), false);
    assert.equal(crawler.canSeeItemValue(), false);
    assert.equal(crawler.canSortInventoryByValue(), true);

    // Rank 10 (rank 10 threshold: can see exact value AND sort by value)
    skillItem.system.rank = 10;
    skillItem.system.modifiedRank = 10;
    assert.equal(crawler.getDetermineValueRank(), 10);
    assert.equal(crawler.canDetermineValue(), true, 'Rank 10 can see exact gold value');
    assert.equal(crawler.canSeeItemValue(), true, 'Rank 10 can see exact gold value');
    assert.equal(crawler.canSortInventoryByValue(), true, 'Rank 10 can sort by value');

    // Rank 15 (legendary)
    skillItem.system.rank = 15;
    skillItem.system.modifiedRank = 15;
    assert.equal(crawler.getDetermineValueRank(), 15);
    assert.equal(crawler.canDetermineValue(), true);
    assert.equal(crawler.canSeeItemValue(), true);
    assert.equal(crawler.canSortInventoryByValue(), true);
  });

  await t.test('3. actor.sortInventoryByValue and actor.getInventory mechanics', () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {}
    });

    const itemCheap = new DCCItem({ id: 'i1', name: 'Wooden Club', type: 'gear', sort: 10, system: { value: 5 } }, crawler);
    const itemMid = new DCCItem({ id: 'i2', name: 'Iron Breastplate', type: 'gear', sort: 20, system: { value: 60 } }, crawler);
    const itemExpensive = new DCCItem({ id: 'i3', name: 'Crown of Jewels', type: 'gear', sort: 30, system: { value: 500 } }, crawler);

    crawler.items.push(itemCheap, itemMid, itemExpensive);

    // Without skill, sortInventoryByValue utility directly sorts items
    const desc = crawler.sortInventoryByValue([itemCheap, itemMid, itemExpensive], { descending: true });
    assert.equal(desc[0].name, 'Crown of Jewels');
    assert.equal(desc[1].name, 'Iron Breastplate');
    assert.equal(desc[2].name, 'Wooden Club');

    const asc = crawler.sortInventoryByValue([itemCheap, itemMid, itemExpensive], { descending: false });
    assert.equal(asc[0].name, 'Wooden Club');
    assert.equal(asc[1].name, 'Iron Breastplate');
    assert.equal(asc[2].name, 'Crown of Jewels');

    // getInventory({ sortBy: 'value' }) guards against sorting when rank < 5
    const unsortedInv = crawler.getInventory({ sortBy: 'value' });
    // Without rank 5, returns default order
    assert.equal(unsortedInv[0].name, 'Wooden Club');

    // Give Rank 5 Determine Value
    crawler.items.push(new DCCItem({
      name: 'Determine Value',
      type: 'skill',
      system: { rank: 5 }
    }, crawler));

    const sortedInv = crawler.getInventory({ sortBy: 'value', descending: true });
    assert.equal(sortedInv[0].name, 'Crown of Jewels');
    assert.equal(sortedInv[1].name, 'Iron Breastplate');
    assert.equal(sortedInv[2].name, 'Wooden Club');
  });

  await t.test('4. DCCCrawlerSheet.getData value masking: Rank 0 vs Rank 5 vs Rank 10', async () => {
    // Rank 0 Crawler
    const crawler0 = new DCCActor({
      name: 'Carl Rank 0',
      type: 'crawler',
      system: {}
    });
    const sword = new DCCItem({ id: 'sw1', name: 'Broadsword', type: 'gear', system: { value: 45 } }, crawler0);
    const potion = new DCCItem({ id: 'pt1', name: 'Mana Potion', type: 'loot', system: { value: 20 } }, crawler0);
    crawler0.items.push(sword, potion);

    const sheet0 = new DCCCrawlerSheet(crawler0);
    const data0 = await sheet0.getData();

    assert.equal(data0.canSeeItemValue, false, 'Rank 0 cannot see value');
    assert.equal(data0.canSortByValue, false, 'Rank 0 cannot sort by value');
    assert.equal(data0.gear[0].displayValue, '???', 'Gear value masked as ???');
    assert.equal(data0.gear[0].canSeeValue, false);
    assert.equal(data0.loot[0].displayValue, '???', 'Loot value masked as ???');
    assert.equal(data0.loot[0].canSeeValue, false);

    // Rank 5 Crawler
    const crawler5 = new DCCActor({
      name: 'Carl Rank 5',
      type: 'crawler',
      system: {}
    });
    crawler5.items.push(
      new DCCItem({ name: 'Determine Value', type: 'skill', system: { rank: 5 } }, crawler5),
      sword,
      potion
    );

    const sheet5 = new DCCCrawlerSheet(crawler5);
    const data5 = await sheet5.getData();

    assert.equal(data5.canSeeItemValue, false, 'Rank 5 still CANNOT see value');
    assert.equal(data5.canSortByValue, true, 'Rank 5 CAN sort by value');
    assert.equal(data5.gear[0].displayValue, '???', 'Gear value remains masked as ??? at rank 5');
    assert.equal(data5.loot[0].displayValue, '???', 'Loot value remains masked as ??? at rank 5');

    // Rank 10 Crawler
    const crawler10 = new DCCActor({
      name: 'Carl Rank 10',
      type: 'crawler',
      system: {}
    });
    crawler10.items.push(
      new DCCItem({ name: 'Determine Value', type: 'skill', system: { rank: 10 } }, crawler10),
      sword,
      potion
    );

    const sheet10 = new DCCCrawlerSheet(crawler10);
    const data10 = await sheet10.getData();

    assert.equal(data10.canSeeItemValue, true, 'Rank 10 CAN see value');
    assert.equal(data10.canSortByValue, true, 'Rank 10 CAN sort by value');
    assert.equal(data10.gear[0].displayValue, '45 GP', 'Gear displays exact 45 GP');
    assert.equal(data10.gear[0].canSeeValue, true);
    assert.equal(data10.loot[0].displayValue, '20 GP', 'Loot displays exact 20 GP');
    assert.equal(data10.loot[0].canSeeValue, true);
  });

  await t.test('5. DCCCrawlerSheet inventory sorting by value while keeping values masked at Rank 5', async () => {
    const crawler = new DCCActor({
      name: 'Carl Sort Tester',
      type: 'crawler',
      system: {}
    });

    const gCheap = new DCCItem({ id: 'g-cheap', name: 'Cloth Cap', type: 'gear', sort: 1, system: { value: 2 } }, crawler);
    const gMid = new DCCItem({ id: 'g-mid', name: 'Leather Boots', type: 'gear', sort: 2, system: { value: 15 } }, crawler);
    const gExp = new DCCItem({ id: 'g-exp', name: 'Plate Mail', type: 'gear', sort: 3, system: { value: 250 } }, crawler);

    crawler.items.push(
      new DCCItem({ name: 'Determine Value', type: 'skill', system: { rank: 5 } }, crawler),
      gCheap,
      gMid,
      gExp
    );

    const sheet = new DCCCrawlerSheet(crawler);

    // 1. Value High-to-Low
    sheet._inventorySort = 'value-desc';
    const dataDesc = await sheet.getData();

    assert.equal(dataDesc.gear[0].name, 'Plate Mail');
    assert.equal(dataDesc.gear[1].name, 'Leather Boots');
    assert.equal(dataDesc.gear[2].name, 'Cloth Cap');
    // Ensure all items are still masked despite being sorted!
    assert.equal(dataDesc.gear[0].displayValue, '???');
    assert.equal(dataDesc.gear[1].displayValue, '???');
    assert.equal(dataDesc.gear[2].displayValue, '???');

    // 2. Value Low-to-High
    sheet._inventorySort = 'value-asc';
    const dataAsc = await sheet.getData();

    assert.equal(dataAsc.gear[0].name, 'Cloth Cap');
    assert.equal(dataAsc.gear[1].name, 'Leather Boots');
    assert.equal(dataAsc.gear[2].name, 'Plate Mail');
    assert.equal(dataAsc.gear[0].displayValue, '???');

    // 3. Name Alphabetical
    sheet._inventorySort = 'name';
    const dataName = await sheet.getData();
    assert.equal(dataName.gear[0].name, 'Cloth Cap');
    assert.equal(dataName.gear[1].name, 'Leather Boots');
    assert.equal(dataName.gear[2].name, 'Plate Mail');

    // 4. At Rank 10, value-desc reveals values as well
    const detSkill = crawler.items.find(i => i.name === 'Determine Value');
    detSkill.system.rank = 10;
    detSkill.system.modifiedRank = 10;
    sheet._inventorySort = 'value-desc';
    const dataRank10 = await sheet.getData();
    assert.equal(dataRank10.gear[0].name, 'Plate Mail');
    assert.equal(dataRank10.gear[0].displayValue, '250 GP');
    assert.equal(dataRank10.gear[1].name, 'Leather Boots');
    assert.equal(dataRank10.gear[1].displayValue, '15 GP');
    assert.equal(dataRank10.gear[2].name, 'Cloth Cap');
    assert.equal(dataRank10.gear[2].displayValue, '2 GP');
  });

  await t.test('6. DCCItemSheet context masks value on owned items when rank < 10', async () => {
    // Unowned item (world/sidebar)
    const unownedItem = new DCCItem({
      name: 'World Greatsword',
      type: 'gear',
      system: { value: 150 }
    });
    const sheetUnowned = new DCCItemSheet(unownedItem);
    const ctxUnowned = await sheetUnowned._prepareContext();
    assert.equal(ctxUnowned.canSeeItemValue, true, 'Unowned item value is visible to builders/GMs');

    // Owned by Rank 0 crawler
    const crawler0 = new DCCActor({ name: 'Crawler0', type: 'crawler' });
    const ownedItem0 = new DCCItem({
      name: 'Secret Ring',
      type: 'gear',
      system: { value: 1000 }
    }, crawler0);
    const sheetOwned0 = new DCCItemSheet(ownedItem0);
    const ctxOwned0 = await sheetOwned0._prepareContext();
    assert.equal(ctxOwned0.canSeeItemValue, false, 'Owned item value is hidden when crawler has rank 0');

    // Owned by Rank 5 crawler
    const crawler5 = new DCCActor({ name: 'Crawler5', type: 'crawler' });
    crawler5.items.push(new DCCItem({ name: 'Determine Value', type: 'skill', system: { rank: 5 } }, crawler5));
    const ownedItem5 = new DCCItem({
      name: 'Secret Ring',
      type: 'gear',
      system: { value: 1000 }
    }, crawler5);
    const sheetOwned5 = new DCCItemSheet(ownedItem5);
    const ctxOwned5 = await sheetOwned5._prepareContext();
    assert.equal(ctxOwned5.canSeeItemValue, false, 'Owned item value is still hidden when crawler has rank 5');

    // Owned by Rank 10 crawler
    const crawler10 = new DCCActor({ name: 'Crawler10', type: 'crawler' });
    crawler10.items.push(new DCCItem({ name: 'Determine Value', type: 'skill', system: { rank: 10 } }, crawler10));
    const ownedItem10 = new DCCItem({
      name: 'Secret Ring',
      type: 'gear',
      system: { value: 1000 }
    }, crawler10);
    const sheetOwned10 = new DCCItemSheet(ownedItem10);
    const ctxOwned10 = await sheetOwned10._prepareContext();
    assert.equal(ctxOwned10.canSeeItemValue, true, 'Owned item value is visible when crawler has rank 10');
  });

  await t.test('7. Sheet context provides isGM flag and Determine Value rank', async () => {
    const crawler = new DCCActor({ name: 'Crawler GM View', type: 'crawler' });
    crawler.items.push(new DCCItem({ name: 'Excalibur', type: 'gear', system: { value: 5000 } }, crawler));

    const sheet = new DCCCrawlerSheet(crawler);
    const data = await sheet.getData();
    assert.equal(typeof data.isGM, 'boolean');
    assert.equal(data.determineValueRank, 0);
    assert.equal(data.canSeeItemValue, false, 'Crawler itself does not see value without rank 10');
    assert.equal(data.gear[0].displayValue, '???');
  });

  await t.test('8. Template markup validation for inventory and item sheets', () => {
    const invPath = path.resolve('templates/actors/parts/page4-inventory.hbs');
    const invHtml = fs.readFileSync(invPath, 'utf8');
    assert.ok(invHtml.includes('inventory-sort-select'), 'page4-inventory.hbs must contain inventory-sort-select');
    assert.ok(invHtml.includes('canSortByValue'), 'page4-inventory.hbs must check canSortByValue');
    assert.ok(invHtml.includes('canSeeItemValue'), 'page4-inventory.hbs must check canSeeItemValue');
    assert.ok(invHtml.includes('item.goldValue'), 'page4-inventory.hbs must render item.goldValue');
    assert.ok(invHtml.includes('dcc-gold-value-hidden'), 'page4-inventory.hbs must render hidden class');

    const gearPath = path.resolve('templates/items/parts/gear.hbs');
    const gearHtml = fs.readFileSync(gearPath, 'utf8');
    assert.ok(gearHtml.includes('Gold Value'), 'gear.hbs must have Gold Value label');
    assert.ok(gearHtml.includes('system.value'), 'gear.hbs must bind system.value');
    assert.ok(gearHtml.includes('canSeeItemValue'), 'gear.hbs must gate value editing by canSeeItemValue');

    const lootPath = path.resolve('templates/items/parts/loot.hbs');
    const lootHtml = fs.readFileSync(lootPath, 'utf8');
    assert.ok(lootHtml.includes('Gold Value'), 'loot.hbs must have Gold Value label');
    assert.ok(lootHtml.includes('system.value'), 'loot.hbs must bind system.value');
    assert.ok(lootHtml.includes('canSeeItemValue'), 'loot.hbs must gate value editing by canSeeItemValue');
  });
});
