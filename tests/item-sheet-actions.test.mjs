import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('DCCItemSheet Actions, Data Preparation & Modifier Handlers', async (t) => {
  await t.test('1. getCompendiumSkills returns skills from pack index and CONFIG fallback', async () => {
    // Set up mock pack index
    const mockPack = {
      getIndex: async () => [
        { _id: 'sk-1', name: 'Athletics', system: { stat: 'str', skillType: 'Utility' } },
        { _id: 'sk-2', name: 'Bashing Weapons', system: { stat: 'str', skillType: 'Bashing' } }
      ]
    };
    globalThis.game.packs.set('carl-rpg.skills', mockPack);

    const item = new DCCItem({ name: 'Club', type: 'gear', system: { equipped: true, slot: 'hands' } });
    const sheet = new DCCItemSheet(item);

    const skills = await sheet.getCompendiumSkills();
    assert.ok(Array.isArray(skills));
    assert.ok(skills.some(s => s.name === 'Athletics'));
    assert.ok(skills.some(s => s.name === 'Bashing Weapons'));
  });

  await t.test('2. _prepareContext prepares context for gear, attack, buff, debuff, and spell items', async () => {
    const gear = new DCCItem({
      name: 'Warhammer',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        skillModifiers: [{ name: 'Bashing Weapons', bonus: 2 }],
        damageParts: [{ diceCount: 1, dieFaces: 8, damageType: 'Bludgeoning' }]
      }
    });
    const gearSheet = new DCCItemSheet(gear);
    const gearCtx = await gearSheet.getData();
    assert.ok(gearCtx.item);
    assert.ok(Array.isArray(gearCtx.system.skillModifiers));
    assert.ok(Array.isArray(gearCtx.system.damageParts));

    const buff = new DCCItem({
      name: 'Bull Strength',
      type: 'buff',
      system: {
        buffType: 'stat',
        statModifiers: [{ stat: 'str', value: 4 }],
        damageModifiers: []
      }
    });
    const buffSheet = new DCCItemSheet(buff);
    const buffCtx = await buffSheet.getData();
    assert.ok(Array.isArray(buffCtx.system.statModifiers));

    const spell = new DCCItem({
      name: 'Magic Missile',
      type: 'spell',
      system: {
        manaCost: 3,
        spellType: 'Attack',
        baseDamage: '2d4'
      }
    });
    const spellSheet = new DCCItemSheet(spell);
    const spellCtx = await spellSheet.getData();
    assert.equal(spellCtx.hasDamage, true);
    assert.equal(spellCtx.damageFormula, '2d4');
  });

  await t.test('3. _updateObject formats arrays and updates item data', async () => {
    const item = new DCCItem({
      name: 'Test Relic',
      type: 'gear',
      system: {
        skillModifiers: [],
        damageParts: []
      }
    });
    const sheet = new DCCItemSheet(item);

    let updatedData = null;
    item.update = async (data) => {
      updatedData = data;
      return item;
    };

    const formData = {
      'name': 'Test Relic +1',
      'system.skillModifiers.0.name': 'Stealth',
      'system.skillModifiers.0.bonus': 3,
      'system.damageParts.0.diceCount': 1,
      'system.damageParts.0.dieFaces': 6,
      'system.damageParts.0.damageType': 'Fire'
    };

    await sheet._updateObject({}, formData);

    assert.ok(updatedData);
    assert.ok(Array.isArray(updatedData['system.skillModifiers']));
    assert.equal(updatedData['system.skillModifiers'][0].name, 'Stealth');
    assert.ok(Array.isArray(updatedData['system.damageParts']));
    assert.equal(updatedData['system.damageParts'][0].damageType, 'Fire');
  });

  await t.test('4. activateListeners registers all modifier click handlers on item sheet', () => {
    const item = new DCCItem({ name: 'Shield', type: 'gear' });
    const sheet = new DCCItemSheet(item, { editable: true });

    const clickHandlers = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickHandlers[sel] = fn; },
        on: () => {},
        change: () => {}
      })
    };

    sheet.activateListeners(mockHtml);

    assert.ok(clickHandlers['.add-skill-mod']);
    assert.ok(clickHandlers['.delete-skill-mod']);
    assert.ok(clickHandlers['.add-damage-part']);
    assert.ok(clickHandlers['.delete-damage-part']);
    assert.ok(clickHandlers['.add-damage-mod']);
    assert.ok(clickHandlers['.delete-damage-mod']);
    assert.ok(clickHandlers['.add-stat-mod']);
    assert.ok(clickHandlers['.delete-stat-mod']);
  });

  await t.test('5. Item sheet click listeners execute update mutations', async () => {
    const item = new DCCItem({
      name: 'Flaming Bow',
      type: 'gear',
      system: {
        skillModifiers: [{ name: 'Bashing', bonus: 1 }],
        damageParts: [{ diceCount: 1, dieFaces: 6, damageType: 'Fire' }],
        damageModifiers: [{ type: 'Fire', value: 2 }],
        statModifiers: [{ stat: 'str', value: 2 }]
      }
    });

    const sheet = new DCCItemSheet(item, { editable: true });
    const clickHandlers = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickHandlers[sel] = fn; },
        on: () => {},
        change: () => {}
      })
    };

    sheet.activateListeners(mockHtml);

    // Mock jQuery $ for dataset lookup
    globalThis.$ = (el) => ({
      data: (k) => 0
    });

    // Execute handlers
    await clickHandlers['.add-damage-part']({ preventDefault: () => {} });
    assert.equal(item.system.damageParts.length, 2);

    await clickHandlers['.delete-damage-part']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(item.system.damageParts.length, 1);

    await clickHandlers['.add-damage-mod']({ preventDefault: () => {} });
    assert.equal(item.system.damageModifiers.length, 2);

    await clickHandlers['.delete-damage-mod']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(item.system.damageModifiers.length, 1);

    await clickHandlers['.add-stat-mod']({ preventDefault: () => {} });
    assert.equal(item.system.statModifiers.length, 2);

    await clickHandlers['.delete-stat-mod']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(item.system.statModifiers.length, 1);

    await clickHandlers['.add-buff-damage-mod']({ preventDefault: () => {} });
    assert.equal(item.system.damageModifiers.length, 2);

    await clickHandlers['.delete-buff-damage-mod']({ preventDefault: () => {}, currentTarget: {} });
    assert.equal(item.system.damageModifiers.length, 1);

    // Test debuff version
    item.type = 'debuff';
    await clickHandlers['.add-buff-damage-mod']({ preventDefault: () => {} });
    assert.equal(item.system.damageModifiers[item.system.damageModifiers.length - 1].type, 'reduction');

    // Test spell click handlers
    let rolled = false;
    item.type = 'spell';
    item.roll = async () => { rolled = true; };
    await clickHandlers['.roll-spell']({ preventDefault: () => {} });
    assert.equal(rolled, true);

    let dmgRolled = false;
    item.roll = async (mode) => { if (mode === 'damage') dmgRolled = true; };
    await clickHandlers['.roll-spell-dmg']({ preventDefault: () => {} });
    assert.equal(dmgRolled, true);
  });
});
