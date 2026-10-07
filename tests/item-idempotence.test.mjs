import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCSpellManager } from '../src/apps/spell-manager.mjs';
import { MockCompendium, MockScene } from './setup.mjs';
import { syncCompendiumItemToWorld, preserveItemActorState } from '../src/data/compendium-sync.mjs';

describe('DCC RPG - Item & Entity Idempotence Subsystem', () => {
  test('1. Non-consumable items are unique per entry; consumables stack quantity', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      items: []
    });

    const sheet = new DCCCrawlerSheet(actor);

    // Drop first non-consumable weapon (Combat Knife)
    const knife1 = new DCCItem({
      id: 'knife-1',
      name: 'Combat Knife',
      type: 'gear',
      system: { slot: 'hands', isWeapon: true, quantity: 1 }
    });
    await sheet._onDropItem({}, { type: 'Item', uuid: 'gear.knife1' });
    // In our mock sheet drop, let's test dropping via _onDropItem with item
    // Simulate drop through _onDropItem:
    const dropData1 = { uuid: 'Compendium.carl-rpg.items.knife1' };
    globalThis.Item.fromDropData = async () => knife1;
    await sheet._onDropItem({}, dropData1);

    // Drop second non-consumable weapon (Combat Knife)
    const knife2 = new DCCItem({
      id: 'knife-2',
      name: 'Combat Knife',
      type: 'gear',
      system: { slot: 'hands', isWeapon: true, quantity: 1 }
    });
    globalThis.Item.fromDropData = async () => knife2;
    await sheet._onDropItem({}, dropData1);

    const knives = actor.items.filter(i => i.name === 'Combat Knife' && i.type === 'gear');
    assert.equal(knives.length, 2, 'Non-consumable gear should have unique discrete entries per item');

    // Drop consumable (Normal Mana Potion)
    const potion1 = new DCCItem({
      id: 'pot-1',
      name: 'Normal Mana Potion',
      type: 'loot',
      system: { lootType: 'consumable', quantity: 3 }
    });
    globalThis.Item.fromDropData = async () => potion1;
    await sheet._onDropItem({}, { uuid: 'Compendium.carl-rpg.items.pot1' });

    let potions = actor.items.filter(i => i.name === 'Normal Mana Potion' && i.type === 'loot');
    assert.equal(potions.length, 1, 'Initial consumable should have 1 entry');
    assert.equal(potions[0].system.quantity, 3);

    // Drop another identical consumable (2 more potions)
    const potion2 = new DCCItem({
      id: 'pot-2',
      name: 'Normal Mana Potion',
      type: 'loot',
      system: { lootType: 'consumable', quantity: 2 }
    });
    globalThis.Item.fromDropData = async () => potion2;
    await sheet._onDropItem({}, { uuid: 'Compendium.carl-rpg.items.pot1' });

    potions = actor.items.filter(i => i.name === 'Normal Mana Potion' && i.type === 'loot');
    assert.equal(potions.length, 1, 'Consumables should stack into 1 entry rather than duplicating');
    assert.equal(potions[0].system.quantity, 5, 'Consumable quantity should stack (3 + 2 = 5)');
  });

  test('2. Crawlers persist across scenes: editing crawler on any scene updates base world actor', async () => {
    const worldCrawler = new DCCActor({
      id: 'carl-world-1',
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { hp: { value: 40, max: 40 } }
      }
    });
    globalThis.game.actors = [worldCrawler];

    // Scene 1 with token referencing world crawler
    const scene1 = new MockScene({
      name: 'Dungeon Level 1',
      tokens: [
        { id: 'token-carl-1', name: 'Carl', actor: worldCrawler, actorId: worldCrawler.id, actorLink: true }
      ]
    });

    // Scene 2 with another token referencing the same world crawler
    const scene2 = new MockScene({
      name: 'Dungeon Level 2',
      tokens: [
        { id: 'token-carl-2', name: 'Carl', actor: worldCrawler, actorId: worldCrawler.id, actorLink: true }
      ]
    });

    globalThis.game.scenes = [scene1, scene2];

    // Simulate editing token on Scene 1
    const scene1Token = scene1.tokens[0];
    await scene1Token.actor.update({ 'system.attributes.hp.value': 28 });

    assert.equal(worldCrawler.system.attributes.hp.value, 28, 'World actor should be updated from Scene 1 edit');
    assert.equal(scene2.tokens[0].actor.system.attributes.hp.value, 28, 'Scene 2 crawler should reflect change from Scene 1');

    // Simulate editing synthetic token actor if token was somehow unlinked
    const syntheticTokenActor = new DCCActor({
      id: 'synth-carl',
      name: 'Carl',
      type: 'crawler',
      system: { attributes: { hp: { value: 28, max: 40 } } }
    });
    syntheticTokenActor.isToken = true;
    syntheticTokenActor.token = {
      actorId: worldCrawler.id,
      baseActor: worldCrawler
    };

    await syntheticTokenActor.update({ 'system.attributes.hp.value': 22 });
    assert.equal(worldCrawler.system.attributes.hp.value, 22, 'Base world actor must be updated when synthetic crawler is edited');
  });

  test('3. Spells are globally unique on an actor (Idempotence)', async () => {
    const actor = new DCCActor({
      id: 'actor-caster',
      name: 'Princess Donut',
      type: 'crawler',
      items: []
    });

    const spellManager = new DCCSpellManager({ actor });

    const spellData1 = {
      _id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      system: { rank: 1, manaCost: 5, damageType: 'Fire', baseDamage: '2d6' }
    };

    // 1. Learn spell initially
    await spellManager.addSpellToActor(spellData1);
    let spells = actor.items.filter(i => i.type === 'spell' && i.name === 'Fireball');
    assert.equal(spells.length, 1, 'Actor should know Fireball');
    assert.equal(spells[0].system.rank, 1);

    // 2. Attempt to learn the exact same spell again via spell manager
    await spellManager.addSpellToActor(spellData1);
    spells = actor.items.filter(i => i.type === 'spell' && i.name === 'Fireball');
    assert.equal(spells.length, 1, 'Spell must not duplicate on actor when learned again');

    // 3. Attempt to add spell via createEmbeddedDocuments directly
    await actor.createEmbeddedDocuments('Item', [{
      name: 'Fireball',
      type: 'spell',
      flags: { 'carl-rpg': { compendiumId: 'spell-fireball' } },
      system: { rank: 3, manaCost: 5, damageType: 'Fire', baseDamage: '2d6' }
    }]);

    spells = actor.items.filter(i => i.type === 'spell' && i.name === 'Fireball');
    assert.equal(spells.length, 1, 'createEmbeddedDocuments must not create duplicate spell');
    assert.equal(spells[0].system.rank, 3, 'Higher rank should update existing spell');

    // 4. Attempt to drop spell via crawler sheet
    const sheet = new DCCCrawlerSheet(actor);
    const dropSpell = new DCCItem({
      _id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      system: { rank: 2, manaCost: 5 }
    });
    globalThis.Item.fromDropData = async () => dropSpell;
    await sheet._onDropItem({}, { uuid: 'Compendium.carl-rpg.spells.spell-fireball' });

    spells = actor.items.filter(i => i.type === 'spell' && i.name === 'Fireball');
    assert.equal(spells.length, 1, 'Dropping spell onto sheet must be idempotent with 0 duplicates');
    assert.equal(spells[0].system.rank, 3, 'Rank should not regress to lower rank 2');
  });

  test('4. Modifying a spell in the compendium updates every user, preserving actor rank', async () => {
    // Setup compendium pack
    const spellsPack = new MockCompendium({
      id: 'carl-rpg.spells',
      name: 'spells',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.spells', spellsPack);

    // Add canonical Magic Missile to compendium
    const compSpell = new DCCItem({
      id: 'mm-1',
      _id: 'mm-1',
      name: 'Magic Missile',
      type: 'spell',
      pack: 'carl-rpg.spells',
      system: {
        rank: 1,
        manaCost: 4,
        baseDamage: '1d4+1',
        description: 'Fires magic darts.'
      }
    });
    spellsPack.documents.push(compSpell);

    // Actor 1 (User 1) has learned Magic Missile and trained it to Rank 4
    const actor1 = new DCCActor({
      id: 'actor-1',
      name: 'Carl',
      type: 'crawler',
      items: [
        new DCCItem({
          id: 'item-mm-1',
          name: 'Magic Missile',
          type: 'spell',
          flags: {
            core: { sourceId: 'Compendium.carl-rpg.spells.mm-1' },
            'carl-rpg': { compendiumId: 'mm-1' }
          },
          system: {
            rank: 4,
            manaCost: 4,
            baseDamage: '1d4+1',
            description: 'Fires magic darts.'
          }
        })
      ]
    });

    // Actor 2 (User 2) has learned Magic Missile at Rank 1
    const actor2 = new DCCActor({
      id: 'actor-2',
      name: 'Donut',
      type: 'crawler',
      items: [
        new DCCItem({
          id: 'item-mm-2',
          name: 'Magic Missile',
          type: 'spell',
          flags: {
            core: { sourceId: 'Compendium.carl-rpg.spells.mm-1' },
            'carl-rpg': { compendiumId: 'mm-1' }
          },
          system: {
            rank: 1,
            manaCost: 4,
            baseDamage: '1d4+1',
            description: 'Fires magic darts.'
          }
        })
      ]
    });

    // World Item in game.items
    const worldSpell = new DCCItem({
      id: 'world-mm',
      name: 'Magic Missile',
      type: 'spell',
      flags: { 'carl-rpg': { compendiumId: 'mm-1' } },
      system: { manaCost: 4, baseDamage: '1d4+1' }
    });

    globalThis.game.actors = [actor1, actor2];
    globalThis.game.items = [worldSpell];

    // GM updates Magic Missile in the compendium: manaCost to 3, damage to 1d6+2, description updated
    await compSpell.update({
      'system.manaCost': 3,
      'system.baseDamage': '1d6+2',
      'system.description': 'Empowered arcane darts strike unerringly.'
    });

    // Verify Actor 1 (User 1) was updated
    const actor1Spell = actor1.items.find(i => i.name === 'Magic Missile');
    assert.equal(actor1Spell.system.manaCost, 3, 'Mana cost should be updated on Actor 1');
    assert.equal(actor1Spell.system.baseDamage, '1d6+2', 'Base damage should be updated on Actor 1');
    assert.equal(actor1Spell.system.description, 'Empowered arcane darts strike unerringly.');
    assert.equal(actor1Spell.system.rank, 4, 'Actor 1 trained rank (4) must be preserved');

    // Verify Actor 2 (User 2) was updated
    const actor2Spell = actor2.items.find(i => i.name === 'Magic Missile');
    assert.equal(actor2Spell.system.manaCost, 3, 'Mana cost should be updated on Actor 2');
    assert.equal(actor2Spell.system.baseDamage, '1d6+2', 'Base damage should be updated on Actor 2');
    assert.equal(actor2Spell.system.rank, 1, 'Actor 2 rank (1) must be preserved');

    // Verify World Item was updated
    assert.equal(worldSpell.system.manaCost, 3);
    assert.equal(worldSpell.system.baseDamage, '1d6+2');
  });

  test('5. Modifying gear/loot in compendium updates every user, preserving equipped state & quantity', async () => {
    const itemsPack = new MockCompendium({
      id: 'carl-rpg.items',
      name: 'items',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.items', itemsPack);

    const compSword = new DCCItem({
      id: 'sword-1',
      _id: 'sword-1',
      name: 'Iron Longsword',
      type: 'gear',
      pack: 'carl-rpg.items',
      system: {
        slot: 'hands',
        isWeapon: true,
        drBonus: 0,
        damageParts: [{ formula: '1d8', damageType: 'Physical' }]
      }
    });
    itemsPack.documents.push(compSword);

    const actor = new DCCActor({
      id: 'actor-gear',
      name: 'Carl',
      type: 'crawler',
      items: [
        new DCCItem({
          id: 'actor-sword',
          name: 'Iron Longsword',
          type: 'gear',
          flags: { 'carl-rpg': { compendiumId: 'sword-1' } },
          system: {
            slot: 'hands',
            equipped: true,
            quantity: 2,
            damageParts: [{ formula: '1d8', damageType: 'Physical' }]
          }
        })
      ]
    });
    globalThis.game.actors = [actor];

    // GM updates Iron Longsword in compendium: damageParts upgraded to 1d10 Physical + 1d4 Slashing
    await compSword.update({
      'system.damageParts': [
        { formula: '1d10', damageType: 'Physical' },
        { formula: '1d4', damageType: 'Slashing' }
      ]
    });

    const actorItem = actor.items.find(i => i.name === 'Iron Longsword');
    assert.equal(actorItem.system.damageParts.length, 2, 'Actor gear damage parts should update from compendium');
    assert.equal(actorItem.system.damageParts[0].formula, '1d10');
    assert.equal(actorItem.system.equipped, true, 'Equipped status must be preserved');
    assert.equal(actorItem.system.quantity, 2, 'Actor quantity must be preserved');
  });

  test('6. Modifying Class in compendium updates embedded item and refreshes class on actors', async () => {
    const classesPack = new MockCompendium({
      id: 'carl-rpg.classes',
      name: 'classes',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.classes', classesPack);

    const compClass = new DCCItem({
      id: 'class-gladiator',
      _id: 'class-gladiator',
      name: 'Gladiator',
      type: 'class',
      pack: 'carl-rpg.classes',
      system: {
        abilities: 'Crowd pleaser combatant',
        description: 'Arena fighter',
        stats: { str: 2, con: 1, dex: 0, int: 0, cha: 0 }
      }
    });
    classesPack.documents.push(compClass);

    let reapplyCalled = false;
    const actor = new DCCActor({
      id: 'actor-glad',
      name: 'Carl',
      type: 'crawler',
      system: {
        details: { class: 'Gladiator' }
      },
      items: [
        new DCCItem({
          id: 'item-class-glad',
          name: 'Gladiator',
          type: 'class',
          flags: { 'carl-rpg': { compendiumId: 'class-gladiator' } },
          system: {
            abilities: 'Crowd pleaser combatant',
            description: 'Arena fighter'
          }
        })
      ]
    });
    actor.applyClass = async (className) => {
      reapplyCalled = true;
    };
    globalThis.game.actors = [actor];

    await compClass.update({
      'system.abilities': 'Master of weapons and arena entertainment',
      'system.description': 'Legendary arena fighter'
    });

    const actorClassItem = actor.items.find(i => i.name === 'Gladiator');
    assert.equal(actorClassItem.system.abilities, 'Master of weapons and arena entertainment');
    assert.equal(actorClassItem.system.description, 'Legendary arena fighter');
    assert.equal(reapplyCalled, true, 'actor.applyClass must be triggered to refresh class benefits');
  });

  test('7. Modifying Race in compendium updates embedded item and refreshes race on actors', async () => {
    const racesPack = new MockCompendium({
      id: 'carl-rpg.races',
      name: 'races',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.races', racesPack);

    const compRace = new DCCItem({
      id: 'race-primal',
      _id: 'race-primal',
      name: 'Primal Orc',
      type: 'race',
      pack: 'carl-rpg.races',
      system: {
        size: 'Large',
        abilities: 'Thick hide and fury',
        drBonus: 2
      }
    });
    racesPack.documents.push(compRace);

    let reapplyRaceCalled = false;
    const actor = new DCCActor({
      id: 'actor-orc',
      name: 'Krag',
      type: 'crawler',
      system: {
        details: { race: 'Primal Orc' }
      },
      items: [
        new DCCItem({
          id: 'item-race-orc',
          name: 'Primal Orc',
          type: 'race',
          flags: { 'carl-rpg': { compendiumId: 'race-primal' } },
          system: {
            size: 'Large',
            abilities: 'Thick hide and fury',
            drBonus: 2
          }
        })
      ]
    });
    actor.applyRace = async (raceName) => {
      reapplyRaceCalled = true;
    };
    globalThis.game.actors = [actor];

    await compRace.update({
      'system.abilities': 'Iron hide, savage roar, and unstoppable momentum',
      'system.drBonus': 4
    });

    const actorRaceItem = actor.items.find(i => i.name === 'Primal Orc');
    assert.equal(actorRaceItem.system.abilities, 'Iron hide, savage roar, and unstoppable momentum');
    assert.equal(actorRaceItem.system.drBonus, 4);
    assert.equal(reapplyRaceCalled, true, 'actor.applyRace must be triggered to refresh race benefits');
  });

  test('8. Modifying Buffs & Debuffs in compendium updates all actors', async () => {
    const buffsPack = new MockCompendium({
      id: 'carl-rpg.buffs',
      name: 'buffs',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.buffs', buffsPack);

    const compBuff = new DCCItem({
      id: 'buff-haste',
      _id: 'buff-haste',
      name: 'Haste',
      type: 'buff',
      pack: 'carl-rpg.buffs',
      system: {
        buffType: 'stat',
        stat: 'dex',
        value: 2,
        duration: '10 Rounds'
      }
    });
    buffsPack.documents.push(compBuff);

    const actor = new DCCActor({
      id: 'actor-hasted',
      name: 'Carl',
      type: 'crawler',
      items: [
        new DCCItem({
          id: 'item-buff-haste',
          name: 'Haste',
          type: 'buff',
          flags: { 'carl-rpg': { compendiumId: 'buff-haste' } },
          system: {
            buffType: 'stat',
            stat: 'dex',
            value: 2,
            duration: '10 Rounds'
          }
        })
      ]
    });
    globalThis.game.actors = [actor];

    await compBuff.update({
      'system.value': 4,
      'system.duration': '20 Rounds'
    });

    const actorBuff = actor.items.find(i => i.name === 'Haste');
    assert.equal(actorBuff.system.value, 4, 'Buff value should update on actor');
    assert.equal(actorBuff.system.duration, '20 Rounds');
  });

  test('9. Modifying Skills in compendium updates all actors, preserving rank and training hours', async () => {
    const skillsPack = new MockCompendium({
      id: 'carl-rpg.skills',
      name: 'skills',
      type: 'Item'
    });
    globalThis.game.packs.set('carl-rpg.skills', skillsPack);

    const compSkill = new DCCItem({
      id: 'skill-brawl',
      _id: 'skill-brawl',
      name: 'Brawling',
      type: 'skill',
      pack: 'carl-rpg.skills',
      system: {
        rank: 0,
        skillType: 'Combat',
        notes: 'Hand-to-hand fighting'
      }
    });
    skillsPack.documents.push(compSkill);

    const actor = new DCCActor({
      id: 'actor-brawler',
      name: 'Carl',
      type: 'crawler',
      items: [
        new DCCItem({
          id: 'item-skill-brawl',
          name: 'Brawling',
          type: 'skill',
          flags: { 'carl-rpg': { compendiumId: 'skill-brawl' } },
          system: {
            rank: 7,
            investedHours: 42,
            skillType: 'Combat',
            notes: 'Hand-to-hand fighting'
          }
        })
      ]
    });
    globalThis.game.actors = [actor];

    await compSkill.update({
      'system.notes': 'Brutal hand-to-hand combat technique with takedowns and strikes'
    });

    const actorSkill = actor.items.find(i => i.name === 'Brawling');
    assert.equal(actorSkill.system.notes, 'Brutal hand-to-hand combat technique with takedowns and strikes');
    assert.equal(actorSkill.system.rank, 7, 'Actor skill rank 7 must be preserved');
    assert.equal(actorSkill.system.investedHours, 42, 'Actor invested hours 42 must be preserved');
  });
});
