import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import '../src/dcc.mjs';
import {
  BaseActorDataModel,
  CrawlerDataModel,
  PetDataModel,
  MountVehicleDataModel,
  NPCDataModel
} from '../src/models/index.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { MockItem } from './setup.mjs';

Hooks.callAll('init');

test('Actor System Data Models (Phase 2)', async (t) => {

  await t.test('1. Registration and Configuration', () => {
    assert.strictEqual(CONFIG.Actor.dataModels.crawler, CrawlerDataModel, 'CrawlerDataModel registered in CONFIG.Actor.dataModels');
    assert.strictEqual(CONFIG.Actor.dataModels.pet, PetDataModel, 'PetDataModel registered in CONFIG.Actor.dataModels');
    assert.strictEqual(CONFIG.Actor.dataModels.mount_vehicle, MountVehicleDataModel, 'MountVehicleDataModel registered in CONFIG.Actor.dataModels');
    assert.strictEqual(CONFIG.Actor.dataModels.npc, NPCDataModel, 'NPCDataModel registered in CONFIG.Actor.dataModels');

    assert.ok(CONFIG.Actor.trackableAttributes.crawler, 'crawler trackable attributes defined');
    assert.ok(CONFIG.Actor.trackableAttributes.pet, 'pet trackable attributes defined');
    assert.ok(CONFIG.Actor.trackableAttributes.mount_vehicle, 'mount_vehicle trackable attributes defined');
    assert.ok(CONFIG.Actor.trackableAttributes.npc, 'npc trackable attributes defined');

    assert.strictEqual(game.dcc.models.CrawlerDataModel, CrawlerDataModel);
    assert.strictEqual(game.dcc.models.PetDataModel, PetDataModel);
    assert.strictEqual(game.dcc.models.MountVehicleDataModel, MountVehicleDataModel);
    assert.strictEqual(game.dcc.models.NPCDataModel, NPCDataModel);
  });

  await t.test('2. CrawlerDataModel Schema & Defaults', () => {
    const model = new CrawlerDataModel();

    // 5 core abilities
    for (const stat of ['str', 'int', 'con', 'dex', 'cha']) {
      assert.ok(model.abilities[stat], `Ability ${stat} exists`);
      assert.strictEqual(model.abilities[stat].value, 10);
      assert.strictEqual(model.abilities[stat].unenhanced, 10);
      assert.strictEqual(model.abilities[stat].mod, 4);
    }

    // Base attributes
    assert.strictEqual(model.attributes.hp.value, 40);
    assert.strictEqual(model.attributes.hp.max, 40);
    assert.strictEqual(model.attributes.mana.value, 10);
    assert.strictEqual(model.attributes.mana.max, 10);
    assert.strictEqual(model.attributes.speed.move, 20);
    assert.strictEqual(model.attributes.speed.step, 10);
    assert.strictEqual(model.attributes.size, 'Medium');

    // Details
    assert.strictEqual(model.details.floor, '1st Floor');
    assert.strictEqual(model.details.level, 1);
    assert.strictEqual(model.details.xp.value, 0);
    assert.strictEqual(model.details.xp.max, 1000);

    // Gear slots
    assert.ok('head' in model.gearSlots);
    assert.ok('torso' in model.gearSlots);
    assert.ok('arms' in model.gearSlots);
    assert.ok('hands' in model.gearSlots);
    assert.ok('legs' in model.gearSlots);
    assert.ok('feet' in model.gearSlots);
    assert.ok('accessories' in model.gearSlots);

    // Hotlist
    assert.ok('slot1' in model.hotlist);
    assert.ok('slot10' in model.hotlist);
  });

  await t.test('3. Derived Stat Calculations & DCC Modifier Table', async () => {
    const actor = await DCCActor.create({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 20, value: 20 }, // mod: 5
          int: { unenhanced: 50, value: 50 }, // mod: 6
          con: { unenhanced: 10, value: 10 }, // mod: 4 -> max HP 40
          dex: { unenhanced: 6, value: 6 },   // mod: 3
          cha: { unenhanced: 2, value: 2 }    // mod: 1
        }
      }
    });

    assert.ok(actor.system instanceof CrawlerDataModel, 'actor.system is instance of CrawlerDataModel');
    actor.prepareData();

    assert.strictEqual(actor.system.abilities.str.mod, 5, 'STR 20 has modifier +5');
    assert.strictEqual(actor.system.abilities.int.mod, 6, 'INT 50 has modifier +6');
    assert.strictEqual(actor.system.abilities.con.mod, 4, 'CON 10 has modifier +4');
    assert.strictEqual(actor.system.abilities.dex.mod, 3, 'DEX 6 has modifier +3');
    assert.strictEqual(actor.system.abilities.cha.mod, 1, 'CHA 2 has modifier +1');

    // HP based on 10 * CON mod = 40
    assert.strictEqual(actor.system.attributes.hp.max, 40);
    // Mana based on enhanced INT = 50
    assert.strictEqual(actor.system.attributes.mana.max, 50);
    // Evade based on DEX mod + items + buffs = 3 + 0 + 0 = 3
    assert.strictEqual(actor.system.attributes.evade.total, 3);
  });

  await t.test('4. Equipped Gear & External Buffs Application', async () => {
    const actor = await DCCActor.create({
      name: 'Equipped Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 15, value: 15 },
          con: { unenhanced: 4, value: 4 },
          dex: { unenhanced: 8, value: 8 }
        },
        attributes: {
          externalBuffs: { buff1: 'buff-str', buff2: '', buff3: '' }
        }
      },
      items: [
        {
          name: 'Spiked Gauntlets',
          type: 'gear',
          system: {
            equipped: true,
            drBonus: 2,
            evadeBonus: 1,
            abilityModifiers: {
              str: { value: 4, type: 'flat' }
            }
          }
        },
        {
          name: 'Potion of Might',
          type: 'buff',
          _id: 'buff-str',
          system: {
            buffType: 'stat',
            stat: 'str',
            value: 2
          }
        }
      ]
    });

    actor.prepareData();

    // STR: unenhanced 15 + gear 4 + buff 2 = 21 (mod: 5)
    assert.strictEqual(actor.system.abilities.str.gearBonus, 4);
    assert.strictEqual(actor.system.abilities.str.buffBonus, 2);
    assert.strictEqual(actor.system.abilities.str.value, 21);
    assert.strictEqual(actor.system.abilities.str.mod, 5);

    // DR: 2 from gear
    assert.strictEqual(actor.system.attributes.dr.items, 2);
    assert.strictEqual(actor.system.attributes.dr.total, 2);

    // Evade: DEX mod 3 + 1 from gear = 4
    assert.strictEqual(actor.system.attributes.evade.items, 1);
    assert.strictEqual(actor.system.attributes.evade.total, 4);
  });

  await t.test('5. Skill Cascading & Generic Weapon Group Bonuses', async () => {
    const actor = await DCCActor.create({
      name: 'Sword Master',
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 20, value: 20 } // mod: 5
        }
      },
      items: [
        {
          name: 'Edged Weapons',
          type: 'skill',
          system: {
            rank: 4,
            type: 'Edge',
            stat: 'str'
          }
        },
        {
          name: 'Longsword',
          type: 'skill',
          system: {
            rank: 2,
            skillType: 'Edge',
            stat: 'str'
          }
        }
      ]
    });

    actor.prepareData();

    const longsword = actor.items.find(i => i.name === 'Longsword');
    assert.ok(longsword);
    // Generic Edged Weapons grants typeBonus of 4 to Longsword (member of Edge)
    assert.strictEqual(longsword.system.typeBonus, 4, 'Longsword receives +4 type bonus from Edged Weapons');
    // base rank 2 + typeBonus 4 = modified rank 6
    assert.strictEqual(longsword.system.modifiedRank, 6, 'Modified rank is 6');
    // total skill = modified rank 6 + STR mod 5 = 11
    assert.strictEqual(longsword.system.totalSkill, 11, 'Total skill is 11');
    assert.strictEqual(longsword.totalSkill, 11, 'Direct totalSkill accessor matches');
  });

  await t.test('6. Experience Progression & Thresholds', async () => {
    const actor = await DCCActor.create({
      name: 'XP Test',
      type: 'crawler',
      system: {
        details: {
          level: 1,
          xp: { value: 250 }
        }
      }
    });

    actor.prepareData();
    assert.strictEqual(actor.system.details.xp.min, 0);
    assert.strictEqual(actor.system.details.xp.max, 1000);
    assert.strictEqual(actor.system.details.xp.toNext, 750);
    assert.strictEqual(actor.system.details.xp.pct, 25);

    // Award XP to level up
    await actor.awardExperience(800, { notify: false });
    actor.prepareData();

    assert.strictEqual(actor.system.details.level, 2, 'Advanced to level 2');
    assert.strictEqual(actor.system.details.xp.value, 1050);
    assert.strictEqual(actor.system.details.xp.min, 1000);
    assert.strictEqual(actor.system.details.xp.max, 2500);
    assert.strictEqual(actor.system.details.xp.toNext, 1450);
  });

  await t.test('7. PetDataModel Schema & Base Calculations', async () => {
    const pet = await DCCActor.create({
      name: 'Princess Donut',
      type: 'pet',
      system: {
        abilities: {
          con: { unenhanced: 10, value: 10 },
          dex: { unenhanced: 20, value: 20 }
        },
        details: {
          level: 2,
          attack1: 'Claw Slash',
          attack2: 'Screech'
        }
      }
    });

    assert.ok(pet.system instanceof PetDataModel);
    pet.prepareData();

    assert.strictEqual(pet.system.details.level, 2);
    assert.strictEqual(pet.system.details.attack1, 'Claw Slash');
    assert.strictEqual(pet.system.abilities.dex.mod, 5);
    assert.strictEqual(pet.system.attributes.evade.total, 5);
    assert.strictEqual(pet.system.attributes.hp.max, 40);
  });

  await t.test('8. MountVehicleDataModel Schema & Calculations', async () => {
    const mount = await DCCActor.create({
      name: 'Dungeon Bulldozer',
      type: 'mount_vehicle',
      system: {
        attributes: {
          hp: { value: 60, max: 100 },
          size: 'Huge',
          move: 50,
          dr: 5,
          occupants: '4 crawlers'
        }
      }
    });

    assert.ok(mount.system instanceof MountVehicleDataModel);
    mount.prepareData();

    assert.strictEqual(mount.system.attributes.hp.pct, 60);
    assert.strictEqual(mount.system.attributes.sizeInfo.label, '6 Huge');
    assert.strictEqual(mount.system.attributes.sizeNumber, 6);
    assert.strictEqual(mount.system.attributes.dr, 5);
    assert.strictEqual(mount.system.attributes.move, 50);
  });

  await t.test('9. NPCDataModel Schema & Derivations', async () => {
    const npc = await DCCActor.create({
      name: 'Goblin Sapper',
      type: 'npc',
      system: {
        details: {
          level: 2,
          xpValue: 150,
          special: 'Explodes on death'
        },
        abilities: {
          dex: { unenhanced: 12, value: 12 }
        }
      }
    });

    assert.ok(npc.system instanceof NPCDataModel);
    npc.prepareData();

    assert.strictEqual(npc.system.details.level, 2);
    assert.strictEqual(npc.system.details.xpValue, 150);
    assert.strictEqual(npc.system.abilities.dex.mod, 4);
    assert.strictEqual(npc.system.attributes.evade.total, 4);
  });

  await t.test('10. Stat & Evade Rolls Integration', async () => {
    const actor = await DCCActor.create({
      name: 'Roller',
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 20, value: 20 }, // mod: 5
          dex: { unenhanced: 10, value: 10 }  // mod: 4
        }
      }
    });
    actor.prepareData();

    const statMsg = await actor.rollStat('str');
    assert.ok(statMsg, 'rollStat generated a chat message');
    assert.ok(statMsg.flavor.includes('STR Check'), 'flavor contains STR Check');

    const evadeMsg = await actor.rollEvade();
    assert.ok(evadeMsg, 'rollEvade generated a chat message');
    assert.ok(evadeMsg.flavor.includes('Evade Roll'), 'flavor contains Evade Roll');
  });
});
