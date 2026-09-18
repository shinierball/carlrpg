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

CONFIG.Actor = { documentClass: DCCActor };
CONFIG.Item = { documentClass: DCCItem };

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

    // Check weapon added to inventory and equipped
    const warhammerGear = actor.items.find(i => i.type === 'gear' && i.name === 'Warhammer');
    assert.ok(warhammerGear, 'Warhammer must be added to inventory as gear');
    assert.equal(warhammerGear.system.slot, 'hands', 'Weapon slot must be hands');
    assert.equal(warhammerGear.system.equipped, true, 'Weapon must be equipped');
    assert.equal(warhammerGear.system.quantity, 1, 'Quantity must be 1');

    // Check attack item created using equipped item
    const warhammerAttack = actor.items.find(i => i.type === 'attack' && i.name === 'Warhammer');
    assert.ok(warhammerAttack, 'Attack item must be created for Warhammer');
    assert.equal(warhammerAttack.system.toHitStat, 'str');
    assert.equal(warhammerAttack.system.toHitRank, 3);
    assert.equal(warhammerAttack.system.damageDice, '1d10');
    assert.equal(warhammerAttack.system.damageStat, 'str');
    assert.equal(warhammerAttack.system.damageType, 'Bludgeoning');

    // Check universal Heal spell at Rank 1
    const healSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Heal');
    assert.ok(healSpell, 'Heal spell must be embedded');
    assert.equal(healSpell.system.rank, 1, 'Heal spell must be Rank 1');

    // Hotlist maps Heal and equipped Attack
    assert.equal(actor.system.hotlist?.slot1, healSpell.id, 'Slot 1 must contain Heal spell');
    assert.equal(actor.system.hotlist?.slot2, warhammerAttack.id, 'Slot 2 must contain Warhammer attack');

    // Health and Mana initialization checks
    assert.equal(actor.system.attributes.hp.value, actor.system.attributes.hp.max, 'Current HP must equal max HP');
    assert.equal(actor.system.attributes.hp.value, 30, 'Current HP must be 30 for CON 6');
    assert.equal(actor.system.attributes.mana.value, actor.system.attributes.mana.max, 'Current Mana must equal max Mana');
    assert.equal(actor.system.attributes.mana.value, 2, 'Current Mana must be 2 for INT 2');
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

    // Health and Mana initialization checks
    assert.equal(actor.system.attributes.hp.value, actor.system.attributes.hp.max, 'Current HP must equal max HP');
    assert.equal(actor.system.attributes.hp.value, 30, 'Current HP must be 30 for CON 6');
    assert.equal(actor.system.attributes.mana.value, actor.system.attributes.mana.max, 'Current Mana must equal max Mana');
    assert.equal(actor.system.attributes.mana.value, 2, 'Current Mana must be 2 for INT 2');
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

  await t.test('8. Casting Heal restores up to 2 bars of health to self only and spends 2 MP', async () => {
    const crawler = new DCCActor({
      name: 'Wounded Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 20, mod: 5 }, // 5 HP per bar, 10 bars = 50 max HP
          int: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 25, max: 50, temp: 0, pct: 50 },
          mana: { value: 10, max: 10, pct: 100 }
        }
      }
    });

    const healSpell = new DCCItem({
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        spellType: 'Heal',
        manaCost: 2,
        range: 'Self only',
        baseDamage: '2 Health Bar slots',
        description: 'Heal 2 Health Bar slots.'
      }
    }, crawler);

    crawler.items = [healSpell];

    // Cast Heal (should heal 2 bars * 5 HP/bar = 10 HP)
    const chatMsg = await crawler.rollSpell(healSpell);

    assert.equal(crawler.system.attributes.mana.value, 8, 'Mana should reduce by 2 from 10 to 8');
    assert.equal(crawler.system.attributes.hp.value, 35, 'HP should increase by 10 from 25 to 35 (2 bars of 5 HP)');
    assert.equal(crawler.system.attributes.hp.pct, 70, 'HP percentage should update to 70%');

    const flags = chatMsg.flags?.['carl-rpg'];
    assert.equal(flags?.isSpellCast, true);
    assert.equal(flags?.spellSuccess, true);
    assert.equal(flags?.isHeal, true);
    assert.equal(flags?.healInfo?.target, 'self', 'Target must be self only');
    assert.equal(flags?.healInfo?.barsToHeal, 2);
    assert.equal(flags?.healInfo?.actualHealed, 10);
    assert.equal(flags?.healInfo?.newHp, 35);

    assert.ok(chatMsg.content.includes('Healed +10 HP'), 'Chat card should display actual HP healed');
    assert.ok(chatMsg.content.includes('up to 2 Health Bar slots'), 'Chat card should state 2 Health Bar slots');
    assert.ok(chatMsg.content.includes('Self only'), 'Chat card should indicate Self only target');
  });

  await t.test('9. Casting Heal caps at maximum HP when less than 2 bars are needed', async () => {
    const crawler = new DCCActor({
      name: 'Slightly Injured Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 20, mod: 5 }, // 5 HP per bar, 50 max HP
          int: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 47, max: 50, temp: 0, pct: 94 },
          mana: { value: 6, max: 10, pct: 60 }
        }
      }
    });

    const healSpell = new DCCItem({
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        spellType: 'Heal',
        manaCost: 2,
        range: 'Self only',
        baseDamage: '2 Health Bar slots',
        description: 'Heal 2 Health Bar slots.'
      }
    }, crawler);

    // 2 bars would be 10 HP, but only 3 HP needed to reach max 50 HP
    const chatMsg = await crawler.rollSpell(healSpell);

    assert.equal(crawler.system.attributes.hp.value, 50, 'HP must cap at max HP 50');
    assert.equal(crawler.system.attributes.hp.pct, 100, 'HP percentage should be 100%');
    assert.equal(crawler.system.attributes.mana.value, 4, 'Mana reduced from 6 to 4');

    const flags = chatMsg.flags?.['carl-rpg'];
    assert.equal(flags?.healInfo?.actualHealed, 3, 'Actual healed must be 3 HP');
    assert.equal(flags?.healInfo?.newHp, 50);
  });

  await t.test('10. Casting Heal at full health heals 0 HP and does not exceed max HP', async () => {
    const crawler = new DCCActor({
      name: 'Full Health Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 6, mod: 3 }, // 3 HP per bar, 30 max HP
          int: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 30, max: 30, temp: 0, pct: 100 },
          mana: { value: 5, max: 10, pct: 50 }
        }
      }
    });

    const healSpell = new DCCItem({
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        spellType: 'Heal',
        manaCost: 2,
        range: 'Self only',
        baseDamage: '2 Health Bar slots'
      }
    }, crawler);

    const chatMsg = await crawler.rollSpell(healSpell);

    assert.equal(crawler.system.attributes.hp.value, 30, 'HP remains at 30');
    assert.equal(crawler.system.attributes.mana.value, 3, 'Mana reduced from 5 to 3');

    const flags = chatMsg.flags?.['carl-rpg'];
    assert.equal(flags?.healInfo?.actualHealed, 0, 'Actual healed is 0');
    assert.ok(chatMsg.content.includes('Already at Full Health'), 'Card notes already at full health');
  });

  await t.test('11. Casting Heal fails with insufficient mana and does not apply healing', async () => {
    const crawler = new DCCActor({
      name: 'OutOfMana Carl',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: { value: 10, max: 40, temp: 0 },
          mana: { value: 1, max: 10 } // needs 2 MP
        }
      }
    });

    const healSpell = new DCCItem({
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        spellType: 'Heal',
        manaCost: 2,
        range: 'Self only',
        baseDamage: '2 Health Bar slots'
      }
    }, crawler);

    const chatMsg = await crawler.rollSpell(healSpell);

    assert.equal(crawler.system.attributes.hp.value, 10, 'HP should remain 10 on cast failure');
    assert.equal(crawler.system.attributes.mana.value, 1, 'Mana should remain 1');
    assert.equal(chatMsg.flags?.['carl-rpg']?.spellFailed, true);
  });

  await t.test('12. Choosing Bow equips it to hands in inventory, adds attack, and executes attack rolls', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Robin Carl',
      starterMode: 'weapon',
      starterWeapon: 'Bow'
    });

    const actor = await creator.createCrawler();
    assert.ok(actor, 'Actor should be created');

    // Verify Bow gear in inventory
    const bowGear = actor.items.find(i => i.type === 'gear' && i.name === 'Bow');
    assert.ok(bowGear, 'Bow must exist in inventory as gear');
    assert.equal(bowGear.system.slot, 'hands', 'Bow slot must be hands');
    assert.equal(bowGear.system.equipped, true, 'Bow must be equipped');

    // Verify Bow attack item
    const bowAttack = actor.items.find(i => i.type === 'attack' && i.name === 'Bow');
    assert.ok(bowAttack, 'Bow attack item must exist');
    assert.equal(bowAttack.system.toHitStat, 'dex', 'Bow to-hit stat must be dex');
    assert.equal(bowAttack.system.toHitRank, 3, 'Bow to-hit rank must be 3');
    assert.equal(bowAttack.system.damageDice, '1d6', 'Bow damage dice must be 1d6');
    assert.equal(bowAttack.system.damageType, 'Piercing', 'Bow damage type must be Piercing');

    // Verify rolling the attack
    const hitMessage = await actor.rollAttack(bowAttack, 'hit');
    assert.ok(hitMessage, 'Attack to-hit message must be generated');
    assert.ok(hitMessage.flavor.includes('Bow (To Hit: 1d20 + Rank 3'), 'Hit flavor should include Rank 3');

    const dmgMessage = await actor.rollAttack(bowAttack, 'damage');
    assert.ok(dmgMessage, 'Attack damage message must be generated');
    assert.ok(dmgMessage.content.includes('Bow Damage'), 'Damage card should indicate Bow Damage');
  });
});


