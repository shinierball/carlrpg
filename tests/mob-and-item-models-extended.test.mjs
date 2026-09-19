import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { MobDataModel } from '../src/models/actors/mob-model.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCActor } from '../src/documents/actor.mjs';

test('MobDataModel & DCCItem Document Extended Coverage', async (t) => {
  await t.test('1. MobDataModel defineSchema returns valid field definitions', () => {
    const schema = MobDataModel.defineSchema();
    assert.ok(schema.abilities, 'Schema defines abilities');
    assert.ok(schema.attributes, 'Schema defines attributes');
    assert.ok(schema.details, 'Schema defines details');
  });

  await t.test('2. MobDataModel prepareDerivedData computes variable health bars and CON mod HP per bar', () => {
    // Mob with CON 14 (CON mod = +4), 3 health bars
    const model = new MobDataModel({
      abilities: {
        str: { value: 10, mod: 4 },
        dex: { value: 16, mod: 4 },
        con: { value: 14, mod: 4 },
        int: { value: 10, mod: 4 },
        cha: { value: 10, mod: 4 }
      },
      attributes: {
        hp: { value: 12, bars: 3, hpPerBar: 0 },
        mana: { value: 0, max: 0 },
        evade: { items: 0, buffs: 0, total: 4 },
        dr: { armor: 0, items: 0, buffs: 0, total: 0 }
      },
      details: {
        classification: 'Mob',
        creatureType: 'Beast'
      }
    });

    model.prepareDerivedData();

    assert.equal(model.attributes.hp.bars, 3);
    assert.equal(model.attributes.hp.hpPerBar, 4, 'HP per bar defaults to CON mod');
    assert.equal(model.attributes.hp.max, 12, 'Total max HP = 3 bars * 4 = 12');
    assert.equal(model.attributes.hp.pct, 100);
    assert.equal(model.attributes.evadeDifficulty, '14+F', 'Evade difficulty = 10 + DEX Mod (4) + F');
  });

  await t.test('3. MobDataModel prepareDerivedData honors explicit hpPerBar override', () => {
    // Mob with CON 8 (CON mod = +3), 5 bars, explicit hpPerBar = 10
    const model = new MobDataModel({
      abilities: {
        str: { value: 10, mod: 4 },
        dex: { value: 10, mod: 4 },
        con: { value: 8, mod: 3 },
        int: { value: 10, mod: 4 },
        cha: { value: 10, mod: 4 }
      },
      attributes: {
        hp: { value: 50, bars: 5, hpPerBar: 10 },
        evadeDifficulty: '16+F' // explicit override
      }
    });

    model.prepareDerivedData();

    assert.equal(model.attributes.hp.bars, 5);
    assert.equal(model.attributes.hp.hpPerBar, 10, 'Explicit hpPerBar override respected');
    assert.equal(model.attributes.hp.max, 50);
    assert.equal(model.attributes.evadeDifficulty, '16+F', 'Explicit evade difficulty preserved');
  });

  await t.test('4. DCCItem normalizes object-based modifiers into arrays in prepareBaseData & prepareDerivedData', () => {
    const gearItem = new DCCItem({
      name: 'Plate Armor',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'torso',
        skillModifiers: {
          '0': { name: 'Armor Training', bonus: 2 }
        },
        damageParts: {
          '0': { diceCount: 1, dieFaces: 4, damageType: 'Bludgeoning' }
        }
      }
    });

    gearItem.prepareBaseData();
    gearItem.prepareDerivedData();

    assert.ok(Array.isArray(gearItem.system.skillModifiers), 'skillModifiers converted to array');
    assert.equal(gearItem.system.skillModifiers.length, 1);
    assert.ok(Array.isArray(gearItem.system.damageParts), 'damageParts converted to array');

    const buffItem = new DCCItem({
      name: 'Rage',
      type: 'buff',
      system: {
        statModifiers: { '0': { stat: 'str', value: 2 } },
        damageModifiers: { '0': { damageType: 'Fire', bonus: 3 } }
      }
    });

    buffItem.prepareBaseData();
    assert.ok(Array.isArray(buffItem.system.statModifiers));
    assert.ok(Array.isArray(buffItem.system.damageModifiers));
  });

  await t.test('5. DCCItem rollSpellCard renders chat message for standalone unowned spell', async () => {
    const spell = new DCCItem({
      name: 'Standalone Fireball',
      type: 'spell',
      system: {
        manaCost: 8,
        spellType: 'Attack',
        damageType: 'Fire',
        quote: 'Boom!',
        range: '60 ft',
        duration: 'Instantaneous',
        cooldown: '1 round',
        favored: 'Samantha',
        aiFavor: 5,
        baseDamage: '3d6',
        description: 'Blasts targets in area.',
        upgrades: {
          rank5: '+1d6 damage',
          rank10: 'Radius +10 ft',
          rank15: 'Leaves burning zone'
        }
      }
    });

    const msg = await DCCItem.rollSpellCard(spell);
    assert.ok(msg);
    assert.ok(msg.content.includes('Standalone Fireball'));
    assert.ok(msg.content.includes('Boom!'));
    assert.ok(msg.content.includes('Rank 15:'));
  });

  await t.test('6. DCCItem roll() dispatches correctly for unowned and owned items', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 10, max: 10 }
        }
      }
    });

    let attackRolled = false;
    crawler.rollAttack = async () => { attackRolled = true; };

    let skillRolled = false;
    crawler.rollSkill = async () => { skillRolled = true; };

    let spellRolled = false;
    crawler.rollSpell = async () => { spellRolled = true; };

    const attackItem = new DCCItem({ id: 'atk1', name: 'Punch', type: 'attack' }, crawler);
    const skillItem = new DCCItem({ id: 'sk1', name: 'Sneak', type: 'skill' }, crawler);
    const spellItem = new DCCItem({ id: 'sp1', name: 'Zap', type: 'spell' }, crawler);

    await attackItem.roll('hit');
    assert.equal(attackRolled, true);

    await skillItem.roll();
    assert.equal(skillRolled, true);

    await spellItem.roll('cast');
    assert.equal(spellRolled, true);
  });

  await t.test('7. DCCItem useLoot decrements quantity or removes item and handles Mana Potion refill', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 2, max: 10 }
        }
      }
    });

    const manaPotion = new DCCItem({
      id: 'pot1',
      name: 'Normal Mana Potion',
      type: 'loot',
      system: {
        quantity: 2,
        notes: 'Refill mana'
      }
    }, crawler);
    crawler.items.push(manaPotion);

    await manaPotion.useLoot();

    assert.equal(crawler.system.attributes.mana.value, 10, 'Mana refilled to max 10');
    assert.equal(manaPotion.system.quantity, 1, 'Quantity decremented from 2 to 1');

    // Use again when quantity is 1 -> removes from actor
    await manaPotion.useLoot();
    assert.equal(crawler.items.some(i => i.id === 'pot1'), false, 'Consumable removed when last one used');
  });

  await t.test('8. DCCItem _onCreate and _onUpdate sync embedded item to game.items directory', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {}
    });

    // Mock game.items collection
    let createdItemData = null;
    globalThis.game.items = {
      find: () => null, // simulate item not existing yet in directory
    };
    const origCreate = globalThis.Item.create;
    globalThis.Item.create = async (data) => {
      createdItemData = data;
      return data;
    };

    const helmet = new DCCItem({
      id: 'helm-1',
      name: 'Enchanted Visor',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'head'
      }
    }, crawler);
    crawler.items.push(helmet);

    // Call _onCreate
    await helmet._onCreate({}, {}, globalThis.game.user.id);
    assert.ok(createdItemData, 'Item.create called during _onCreate');
    assert.equal(createdItemData.name, 'Enchanted Visor');

    // Call _onUpdate
    createdItemData = null;
    await helmet._onUpdate({ name: 'Enchanted Visor +1' }, {}, globalThis.game.user.id);
    assert.ok(createdItemData, 'Item.create called during _onUpdate');

    globalThis.Item.create = origCreate;
  });
});
