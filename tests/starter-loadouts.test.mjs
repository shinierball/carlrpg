import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import {
  DCC_STARTER_WEAPONS,
  DCC_STARTER_SPELLS,
  DCC_STARTER_UNARMED_PACKAGES
} from '../src/data/crawler-creation.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';

test('DCC RPG - Level 1 Starter Combat Loadouts & Universal Heal Spell', async (t) => {
  await t.test('1. Starter Datasets contain required weapons, spells, and unarmed packages', () => {
    // Spells: Dirt Clod, Fire Fingers, Frost Scar, Mind Tickle, Shock Treatment, Soul Collector, Vine Porn
    const requiredSpells = [
      'Dirt Clod',
      'Fire Fingers',
      'Frost Scar',
      'Mind Tickle',
      'Shock Treatment',
      'Soul Collector',
      'Vine Porn'
    ];
    for (const sp of requiredSpells) {
      assert.ok(DCC_STARTER_SPELLS.includes(sp), `Must include starter spell ${sp}`);
    }

    // Unarmed packages: Pugilism+Iron Punch, Foot Soldier+Smush, Noggin Nocker+Skullcracker, Wrasslin+Toss
    const unarmedKeys = DCC_STARTER_UNARMED_PACKAGES.map(p => p.key);
    assert.deepEqual(unarmedKeys, ['pugilism', 'foot_soldier', 'noggin_nocker', 'wrasslin']);

    const pugilism = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === 'pugilism');
    assert.equal(pugilism.skill, 'Pugilism');
    assert.equal(pugilism.effect, 'Iron Punch');

    const footSoldier = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === 'foot_soldier');
    assert.equal(footSoldier.skill, 'Foot Soldier');
    assert.equal(footSoldier.effect, 'Smush');

    const nogginNocker = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === 'noggin_nocker');
    assert.equal(nogginNocker.skill, 'Noggin Nocker');
    assert.equal(nogginNocker.effect, 'Skullcracker');

    const wrasslin = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === 'wrasslin');
    assert.equal(wrasslin.skill, 'Wrasslin');
    assert.equal(wrasslin.effect, 'Toss');

    // Weapons
    assert.ok(DCC_STARTER_WEAPONS.includes('Longsword'));
    assert.ok(DCC_STARTER_WEAPONS.includes('Warhammer'));
    assert.ok(DCC_STARTER_WEAPONS.includes('Bow'));
    assert.ok(DCC_STARTER_WEAPONS.includes('Dagger'));
  });

  await t.test('2. Starter Weapon choice grants weapon skill at Rank 3 & universal Heal Rank 1', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Katya',
      starterMode: 'weapon',
      starterWeapon: 'Warhammer'
    });

    const actor = await creator.createCrawler();
    assert.ok(actor, 'Actor must be created');

    // Check weapon skill
    const warhammerSkill = actor.items.find(i => i.type === 'skill' && i.name === 'Warhammer');
    assert.ok(warhammerSkill, 'Warhammer skill must be embedded');
    assert.equal(warhammerSkill.system.rank, 3, 'Weapon skill must be Rank 3');

    // Check universal Heal spell at Rank 1
    const healSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Heal');
    assert.ok(healSpell, 'Heal spell must be embedded');
    assert.equal(healSpell.system.rank, 1, 'Heal spell must be Rank 1');

    // Hotlist maps Heal
    assert.equal(actor.system.hotlist?.slot1, healSpell.id, 'Slot 1 must contain Heal spell');
  });

  await t.test('3. Starter Spell choice grants spell Rank 3, 5 Normal Mana Potions, and hotlist mapping', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Mordecai',
      starterMode: 'spell',
      starterSpell: 'Frost Scar'
    });

    const actor = await creator.createCrawler();
    assert.ok(actor, 'Actor must be created');

    // Check chosen spell at Rank 3
    const frostScar = actor.items.find(i => i.type === 'spell' && i.name === 'Frost Scar');
    assert.ok(frostScar, 'Frost Scar spell must be embedded');
    assert.equal(frostScar.system.rank, 3, 'Starter spell must be Rank 3');

    // Check universal Heal spell at Rank 1
    const healSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Heal');
    assert.ok(healSpell, 'Heal spell must be embedded');
    assert.equal(healSpell.system.rank, 1, 'Heal spell must be Rank 1');

    // Check 5 Normal Mana Potions
    const manaPotion = actor.items.find(i => i.type === 'loot' && i.name === 'Normal Mana Potion');
    assert.ok(manaPotion, 'Normal Mana Potion must be in inventory');
    assert.equal(manaPotion.system.quantity, 5, 'Must grant exactly 5 Normal Mana Potions');

    // Check hotlist mapping: Slot 1 Spell, Slot 2 Heal, Slot 3 Mana Potion
    assert.equal(actor.system.hotlist?.slot1, frostScar.id, 'Hotlist Slot 1 must be Frost Scar');
    assert.equal(actor.system.hotlist?.slot2, healSpell.id, 'Hotlist Slot 2 must be Heal');
    assert.equal(actor.system.hotlist?.slot3, manaPotion.id, 'Hotlist Slot 3 must be Normal Mana Potion');
  });

  await t.test('4. Starter Unarmed choice grants both H2H skill and Damage Effect at Rank 3', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Brawler Bob',
      starterMode: 'unarmed',
      starterUnarmed: 'foot_soldier'
    });

    const actor = await creator.createCrawler();
    assert.ok(actor, 'Actor must be created');

    // Foot Soldier skill at Rank 3
    const footSoldier = actor.items.find(i => i.type === 'skill' && i.name === 'Foot Soldier');
    assert.ok(footSoldier, 'Foot Soldier skill must be embedded');
    assert.equal(footSoldier.system.rank, 3, 'Foot Soldier skill must be Rank 3');

    // Smush damage effect skill at Rank 3
    const smush = actor.items.find(i => i.type === 'skill' && i.name === 'Smush');
    assert.ok(smush, 'Smush skill must be embedded');
    assert.equal(smush.system.rank, 3, 'Smush damage effect must be Rank 3');

    // Heal spell at Rank 1
    const healSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Heal');
    assert.ok(healSpell, 'Heal spell must be embedded');
    assert.equal(healSpell.system.rank, 1, 'Heal spell must be Rank 1');
  });

  await t.test('5. Normal Mana Potion completely refills actor mana to maximum and decrements quantity', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 2, max: 10 }
        }
      }
    });

    const potion = new DCCItem({
      id: 'potion-1',
      name: 'Normal Mana Potion',
      type: 'loot',
      system: {
        quantity: 5,
        notes: 'Refills your mana completely when used.'
      }
    }, actor);

    actor.items.push(potion);

    // Initial state
    assert.equal(actor.system.attributes.mana.value, 2);
    assert.equal(potion.system.quantity, 5);

    // Use potion
    const chatMsg = await potion.useLoot();
    assert.ok(chatMsg, 'Chat message must be created');

    // Mana refilled to max (10)
    assert.equal(actor.system.attributes.mana.value, 10, 'Mana must be completely refilled to max (10 MP)');

    // Quantity decremented to 4
    assert.equal(potion.system.quantity, 4, 'Potion quantity must be decremented to 4');
  });

  await t.test('6. Using last Normal Mana Potion (quantity 1) removes item from actor inventory', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 0, max: 10 }
        }
      }
    });

    const potion = new DCCItem({
      id: 'potion-last',
      name: 'Normal Mana Potion',
      type: 'loot',
      system: {
        quantity: 1,
        notes: 'Refills your mana completely when used.'
      }
    }, actor);

    actor.items.push(potion);

    await potion.useLoot();

    assert.equal(actor.system.attributes.mana.value, 10, 'Mana refilled to 10');
    const remaining = actor.items.find(i => i.id === 'potion-last');
    assert.ok(!remaining, 'Potion should be removed from actor items when quantity was 1');
  });

  await t.test('7. Non-additive resolution: Starter weapon or unarmed choice resolves with Math.max', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Hunter Carl',
      species: 'human',
      starterMode: 'weapon',
      starterWeapon: 'Bow'
    });

    // Tier 4 Hobby: Hunting gives Bow (Tier 4 Rank 2)
    creator.tierSelections.tier4 = {
      background: 'Hunting',
      skills: ['Bow', 'Tracking']
    };

    const actor = await creator.createCrawler();
    const bowSkills = actor.items.filter(i => i.type === 'skill' && i.name === 'Bow');

    assert.equal(bowSkills.length, 1, 'Should have exactly 1 Bow skill entry, not duplicate entries');
    assert.equal(bowSkills[0].system.rank, 3, 'Bow skill rank must resolve to Math.max(2, 3) = 3');
  });
});
