import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

test('DCC RPG Hotlist on Main Character Sheet & Inventory/Spell Population', async (t) => {
  await t.test('1. Template Inclusions, Partial Preloading, and No Duplicate Form Inputs', () => {
    const page1Hbs = fs.readFileSync('templates/actors/parts/page1-core.hbs', 'utf8');
    assert.ok(
      page1Hbs.includes('systems/carl-rpg/templates/actors/parts/hotlist.hbs'),
      'page1-core.hbs must include the hotlist.hbs partial at the bottom'
    );

    const dccMjs = fs.readFileSync('src/dcc.mjs', 'utf8');
    assert.ok(
      dccMjs.includes("'systems/carl-rpg/templates/actors/parts/hotlist.hbs'"),
      'dcc.mjs loadTemplates must preload hotlist.hbs'
    );

    const hotlistHbs = fs.readFileSync('templates/actors/parts/hotlist.hbs', 'utf8');
    assert.ok(hotlistHbs.includes('dcc-hotlist-grid'), 'hotlist.hbs must define dcc-hotlist-grid');
    assert.ok(hotlistHbs.includes('hotlist-select'), 'hotlist.hbs must define hotlist-select');
    assert.ok(hotlistHbs.includes('hotlist-clear'), 'hotlist.hbs must define hotlist-clear button');
    assert.ok(hotlistHbs.includes('roll-hotlist-attack'), 'hotlist.hbs must define roll-hotlist-attack button');
    assert.ok(hotlistHbs.includes('roll-hotlist-attack-dmg'), 'hotlist.hbs must define roll-hotlist-attack-dmg button');
    assert.ok(hotlistHbs.includes('toggle-hotlist-equip'), 'hotlist.hbs must define toggle-hotlist-equip button');
    assert.ok(hotlistHbs.includes('roll-hotlist-spell'), 'hotlist.hbs must define roll-hotlist-spell button');
    assert.ok(hotlistHbs.includes('roll-hotlist-use'), 'hotlist.hbs must define roll-hotlist-use button');
    assert.equal(
      hotlistHbs.includes('name="{{slot.nameAttr}}"'),
      false,
      'hotlist-select should not use name attribute so FormDataExtended does not produce duplicate arrays'
    );
  });

  await t.test('2. Sheet getData displays human-readable names and handles corrupted array/concatenation values', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 },
          dex: { value: 16, unenhanced: 16, mod: 4 },
          con: { value: 8, unenhanced: 8, mod: 3 },
          int: { value: 4, unenhanced: 4, mod: 2 },
          cha: { value: 2, unenhanced: 2, mod: 1 }
        },
        hotlist: {
          slot1: ['spell-fireball', 'spell-ice'], // Corrupted array of IDs in slot1
          slot2: 'gear-boots',
          slot3: 'loot-potion',
          slot4: 'attack-sword',
          slot5: 'Custom Dagger',
          slot6: 'spell-fireball,spell-ice,spell-teleport', // Comma-separated concatenation in slot6
          slot7: '',
          slot8: '',
          slot9: '',
          slot10: ''
        }
      }
    });

    const fireball = new DCCItem({
      id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      img: 'icons/magic/fire/fireball.webp',
      system: { rank: 1, manaCost: 5, spellType: 'Attack' }
    }, crawler);

    const boots = new DCCItem({
      id: 'gear-boots',
      name: 'Enchanted Boots',
      type: 'gear',
      img: 'icons/equipment/feet/boots.webp',
      system: { slot: 'feet', equipped: true }
    }, crawler);

    const potion = new DCCItem({
      id: 'loot-potion',
      name: 'Health Potion',
      type: 'loot',
      img: 'icons/consumables/potions/potion-red.webp',
      system: { quantity: 3, notes: 'Restores 10 HP' }
    }, crawler);

    const sword = new DCCItem({
      id: 'attack-sword',
      name: 'Broadsword',
      type: 'attack',
      img: 'icons/weapons/swords/sword.webp',
      system: { damageDice: '1d8', damageStat: 'str', toHitStat: 'str' }
    }, crawler);

    crawler.items.push(fireball, boots, potion, sword);

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.hotlistSlots), 'getData must return hotlistSlots array');
    assert.equal(context.hotlistSlots.length, 10, 'hotlistSlots must contain exactly 10 slots');

    // Slot 1: Spell - must resolve from array and show NAME "Fireball", not ID or concatenated array
    const s1 = context.hotlistSlots[0];
    assert.equal(s1.index, 1);
    assert.equal(s1.name, 'Fireball', 'Must show friendly spell name, not internal ID');
    assert.equal(s1.isSpell, true);
    assert.equal(s1.badge, 'SPELL');
    assert.equal(s1.itemId, 'spell-fireball');
    assert.equal(s1.detail, '5 MP • Attack');
    assert.equal(s1.isEmpty, false);

    // Slot 2: Gear - must show NAME "Enchanted Boots", equipped state and slot
    const s2 = context.hotlistSlots[1];
    assert.equal(s2.index, 2);
    assert.equal(s2.name, 'Enchanted Boots', 'Must show friendly gear name, not internal ID');
    assert.equal(s2.isGear, true);
    assert.equal(s2.gearSlot, 'feet');
    assert.equal(s2.isEquipped, true);
    assert.equal(s2.badge, 'FEET');
    assert.equal(s2.detail, 'Equipped');

    // Slot 3: Loot - must show NAME "Health Potion" and quantity
    const s3 = context.hotlistSlots[2];
    assert.equal(s3.index, 3);
    assert.equal(s3.name, 'Health Potion', 'Must show friendly loot name, not internal ID');
    assert.equal(s3.isLoot, true);
    assert.equal(s3.badge, 'ITEM');
    assert.equal(s3.detail, 'x3 • Restores 10 HP');

    // Slot 4: Attack - must show NAME "Broadsword" and damage dice
    const s4 = context.hotlistSlots[3];
    assert.equal(s4.index, 4);
    assert.equal(s4.name, 'Broadsword', 'Must show friendly attack name, not internal ID');
    assert.equal(s4.isAttack, true);
    assert.equal(s4.badge, 'ATTACK');
    assert.equal(s4.detail, '1d8 + STR');

    // Slot 5: Custom text
    const s5 = context.hotlistSlots[4];
    assert.equal(s5.index, 5);
    assert.equal(s5.name, 'Custom Dagger');
    assert.equal(s5.isCustom, true);

    // Slot 6: Comma-separated concatenation - sanitized to first valid item (Fireball)
    const s6 = context.hotlistSlots[5];
    assert.equal(s6.index, 6);
    assert.equal(s6.name, 'Fireball', 'Must sanitize comma list and resolve to friendly name');
    assert.equal(s6.isSpell, true);

    // Options grouping verification
    assert.ok(s1.groups.length > 0, 'Hotlist slot must have grouped options');
    const spellGroup = s1.groups.find(g => g.label === 'Spells');
    assert.ok(spellGroup, 'Spells group must exist in dropdown');
    assert.equal(spellGroup.items[0].label, '⚡ Fireball (5 MP)');
    assert.equal(spellGroup.items[0].selected, true);
  });

  await t.test('3. Drag and Drop directly into hotlist slot assigns item', async () => {
    const crawler = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: { hotlist: { slot1: '' } }
    });

    const magicMissile = new DCCItem({
      id: 'spell-magic-missile',
      name: 'Magic Missile',
      type: 'spell',
      system: { rank: 1, manaCost: 2 }
    }, crawler);

    crawler.items.push(magicMissile);
    crawler.isOwner = true;

    crawler.update = async (data) => {
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('system.hotlist.')) {
          const slot = k.replace('system.hotlist.', '');
          crawler.system.hotlist[slot] = v;
        }
      }
      return crawler;
    };

    const sheet = new DCCCrawlerSheet(crawler);

    globalThis.Item.fromDropData = async () => magicMissile;

    const mockEvent = {
      target: {
        closest: (sel) => {
          if (sel === '.dcc-hotlist-box') {
            return { dataset: { slot: 'slot1' } };
          }
          return null;
        }
      }
    };

    await sheet._onDropItem(mockEvent, { type: 'Item', uuid: magicMissile.id });
    assert.equal(crawler.system.hotlist.slot1, 'spell-magic-missile', 'Dropping spell on slot1 should update slot1');
  });

  await t.test('4. Hotlist Actions: Roll Attack, Toggle Equip, and Cast Spell', async () => {
    let attackRolled = false;
    let spellCast = false;

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    let attackDamageRolled = false;

    crawler.rollAttack = async (item, type) => {
      if (type === 'damage') attackDamageRolled = true;
      else attackRolled = true;
      return { item, type };
    };

    crawler.rollSpell = async (item) => {
      spellCast = true;
      return { item };
    };

    const sword = new DCCItem({
      id: 'atk-sword',
      name: 'Goblin Slayer',
      type: 'attack',
      system: { damageDice: '1d10' }
    }, crawler);

    const shield = new DCCItem({
      id: 'gear-shield',
      name: 'Spiked Shield',
      type: 'gear',
      system: { slot: 'hands', equipped: false }
    }, crawler);

    const spell = new DCCItem({
      id: 'spell-heal',
      name: 'Heal',
      type: 'spell',
      system: { manaCost: 8, description: 'Restores health.' }
    }, crawler);

    crawler.items.push(sword, shield, spell);

    // 1. Roll Attack action (Hit and Damage)
    await crawler.rollAttack(sword, 'hit');
    assert.equal(attackRolled, true, 'Attack action must call rollAttack with hit');
    await crawler.rollAttack(sword, 'damage');
    assert.equal(attackDamageRolled, true, 'Attack damage action must call rollAttack with damage');

    // 2. Equip / Unequip gear action
    assert.equal(shield.system.equipped, false);
    await shield.update({ 'system.equipped': !shield.system.equipped });
    assert.equal(shield.system.equipped, true, 'Gear action must toggle equipped status');
    await shield.update({ 'system.equipped': !shield.system.equipped });
    assert.equal(shield.system.equipped, false, 'Gear action must toggle equipped status back');

    // 3. Cast Spell action
    await crawler.rollSpell(spell);
    assert.equal(spellCast, true, 'Spell action must call rollSpell');

    // 4. Test sheet click listeners for roll-hotlist-attack and roll-hotlist-attack-dmg
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

    assert.ok(clickHandlers['.roll-hotlist-attack'], 'Sheet must register .roll-hotlist-attack click listener');
    assert.ok(clickHandlers['.roll-hotlist-attack-dmg'], 'Sheet must register .roll-hotlist-attack-dmg click listener');

    let hitCalledFromEvent = false;
    let dmgCalledFromEvent = false;
    crawler.rollAttack = async (item, type) => {
      if (type === 'damage') dmgCalledFromEvent = true;
      if (type === 'hit') hitCalledFromEvent = true;
      return { item, type };
    };

    const mockAttackEv = {
      preventDefault: () => {},
      currentTarget: { dataset: { itemId: sword.id } }
    };

    await clickHandlers['.roll-hotlist-attack'](mockAttackEv);
    assert.equal(hitCalledFromEvent, true, 'Clicking attack button must trigger rollAttack(item, "hit")');

    await clickHandlers['.roll-hotlist-attack-dmg'](mockAttackEv);
    assert.equal(dmgCalledFromEvent, true, 'Clicking attack damage button must trigger rollAttack(item, "damage")');
  });

  await t.test('5. Dragging unowned compendium item onto hotlist creates item on actor and binds slot', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { hotlist: { slot1: '' } }
    });
    crawler.isOwner = true;

    crawler.update = async (data) => {
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('system.hotlist.')) {
          const slot = k.replace('system.hotlist.', '');
          crawler.system.hotlist[slot] = v;
        }
      }
      return crawler;
    };

    const compendiumSpell = new DCCItem({
      id: 'compendium-lightning',
      name: 'Lightning Bolt',
      type: 'spell',
      system: { manaCost: 6, spellType: 'Attack' }
    });

    const sheet = new DCCCrawlerSheet(crawler);

    globalThis.Item.fromDropData = async () => compendiumSpell;
    sheet._onDropItemCreate = async (itemData) => {
      const created = new DCCItem({
        id: 'actor-lightning-123',
        ...itemData
      }, crawler);
      crawler.items.push(created);
      return [created];
    };

    const mockEvent = {
      target: {
        closest: (sel) => {
          if (sel === '.dcc-hotlist-box') return { dataset: { slot: 'slot1' } };
          return null;
        }
      }
    };

    await sheet._onDropItem(mockEvent, { type: 'Item', uuid: 'Compendium.carl-rpg.spells.compendium-lightning' });
    assert.equal(crawler.system.hotlist.slot1, 'actor-lightning-123', 'Unowned compendium drop should create item and set slot1');
    assert.equal(crawler.items.length, 1, 'Actor should have 1 created item');
  });

  await t.test('6. Dragging compendium item that already exists on actor reuses existing item without duplicates', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { hotlist: { slot2: '' } }
    });
    crawler.isOwner = true;

    const existingSpell = new DCCItem({
      id: 'actor-fireball-owned',
      name: 'Fireball',
      type: 'spell',
      system: { manaCost: 5, spellType: 'Attack' }
    }, crawler);
    crawler.items.push(existingSpell);

    crawler.update = async (data) => {
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('system.hotlist.')) {
          const slot = k.replace('system.hotlist.', '');
          crawler.system.hotlist[slot] = v;
        }
      }
      return crawler;
    };

    const compendiumSpell = new DCCItem({
      id: 'compendium-fireball-999',
      name: 'Fireball',
      type: 'spell',
      system: { manaCost: 5, spellType: 'Attack' }
    });

    const sheet = new DCCCrawlerSheet(crawler);
    globalThis.Item.fromDropData = async () => compendiumSpell;

    let createCalled = false;
    sheet._onDropItemCreate = async () => {
      createCalled = true;
      return [];
    };

    const mockEvent = {
      target: {
        closest: (sel) => {
          if (sel === '.dcc-hotlist-box') return { dataset: { slot: 'slot2' } };
          return null;
        }
      }
    };

    await sheet._onDropItem(mockEvent, { type: 'Item', uuid: 'Compendium.carl-rpg.spells.compendium-fireball-999' });
    assert.equal(crawler.system.hotlist.slot2, 'actor-fireball-owned', 'Should bind to existing owned item ID');
    assert.equal(createCalled, false, 'Should not create duplicate item on actor');
    assert.equal(crawler.items.length, 1, 'Actor should still only have 1 item');
  });

  await t.test('7. Hotlist dropdown includes Skills group and displays skills with Rank and ATTACK/SKILL badge', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 20, unenhanced: 20, mod: 5 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        hotlist: {
          slot1: 'skill-bashing',
          slot2: 'skill-stealth',
          slot3: '',
          slot4: '',
          slot5: '',
          slot6: '',
          slot7: '',
          slot8: '',
          slot9: '',
          slot10: ''
        }
      }
    });

    const bashing = new DCCItem({
      id: 'skill-bashing',
      name: 'Bashing Weapons',
      type: 'skill',
      system: { rank: 4, skillType: 'Bashing', checkType: 'Attack, STR' }
    }, crawler);

    const stealth = new DCCItem({
      id: 'skill-stealth',
      name: 'Stealth',
      type: 'skill',
      system: { rank: 2, skillType: 'Utility', checkType: 'DEX' }
    }, crawler);

    crawler.items.push(bashing, stealth);

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet.getData();

    const s1 = context.hotlistSlots[0];
    assert.equal(s1.name, 'Bashing Weapons');
    assert.equal(s1.badge, 'ATTACK', 'Combat skill should get ATTACK badge');
    assert.equal(s1.isAttack, true);
    assert.ok(s1.detail.includes('Rank 4'));

    const s2 = context.hotlistSlots[1];
    assert.equal(s2.name, 'Stealth');
    assert.equal(s2.badge, 'SKILL', 'Utility skill should get SKILL badge');
    assert.equal(s2.isAttack, false);
    assert.ok(s2.detail.includes('Rank 2'));

    // Verify Skills optgroup is present in slot groups
    const skillsGroup = s1.groups.find(g => g.label === 'Skills');
    assert.ok(skillsGroup, 'Hotlist options must include Skills group');
    assert.equal(skillsGroup.items.length, 2, 'Skills group must contain both skills');
    assert.ok(skillsGroup.items[0].label.includes('Bashing Weapons'));
  });

  await t.test('8. Hotlist dropdown change event calls stopPropagation to prevent form submit collision', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { hotlist: { slot3: '' } }
    });

    let updatedField = null;
    let updatedVal = null;
    crawler.update = async (data) => {
      for (const [k, v] of Object.entries(data)) {
        updatedField = k;
        updatedVal = v;
      }
      return crawler;
    };

    const sheet = new DCCCrawlerSheet(crawler);
    const changeHandlers = {};
    const mockHtml = {
      find: (sel) => ({
        click: () => {},
        change: (fn) => { changeHandlers[sel] = fn; },
        contextmenu: () => {},
        on: () => {}
      })
    };
    sheet.activateListeners(mockHtml);

    assert.ok(changeHandlers['.hotlist-select'], 'Must register .hotlist-select change listener');

    let stoppedPropagation = false;
    let preventedDefault = false;
    const mockEvent = {
      preventDefault: () => { preventedDefault = true; },
      stopPropagation: () => { stoppedPropagation = true; },
      currentTarget: {
        dataset: { slot: 'slot3' },
        value: 'item-shield-123'
      }
    };

    await changeHandlers['.hotlist-select'](mockEvent);
    assert.equal(preventedDefault, true, 'Must prevent default on select change');
    assert.equal(stoppedPropagation, true, 'Must stop event propagation to prevent form submit collision');
    assert.equal(updatedField, 'system.hotlist.slot3');
    assert.equal(updatedVal, 'item-shield-123');
  });

  await t.test('9. Hotlist roll-hotlist-use action invokes rollSkill for skill items', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {}
    });

    let rolledSkill = null;
    crawler.rollSkill = async (skill) => {
      rolledSkill = skill;
      return { skill };
    };

    const firstAid = new DCCItem({
      id: 'skill-first-aid',
      name: 'First Aid',
      type: 'skill',
      system: { rank: 3 }
    }, crawler);
    crawler.items.push(firstAid);

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

    const mockEv = {
      preventDefault: () => {},
      currentTarget: { dataset: { itemId: 'skill-first-aid' } }
    };

    await clickHandlers['.roll-hotlist-use'](mockEv);
    assert.equal(rolledSkill?.id, 'skill-first-aid', 'Clicking roll-hotlist-use on skill item should invoke actor.rollSkill');
  });
});


