import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import {
  calculateItemHandsRequired,
  CANONICAL_CONDITION_LIMB_MODIFIERS
} from '../src/models/actors/base-actor-model.mjs';

describe('DCC RPG - Enforced Number of Hands and Limbs Subsystem', () => {
  beforeEach(() => {
    CONFIG.Actor.documentClass = DCCActor;
    CONFIG.Item.documentClass = DCCItem;
    globalThis.game = globalThis.game || {};
    globalThis.game.user = { id: 'gm-user-1', isGM: true };
  });

  test('1. Default Humanoid Crawler initializes with 2 arms, 2 legs, 2 hands and no hands exceeded', async () => {
    const actor = await DCCActor.create({
      name: 'Carl Humanoid',
      type: 'crawler',
      system: {}
    });

    const limbs = actor.limbs;
    assert.equal(limbs.arms, 2, 'Default arms should be 2');
    assert.equal(limbs.legs, 2, 'Default legs should be 2');
    assert.equal(limbs.hands, 2, 'Default hands should be 2');
    assert.equal(limbs.maxArms, 2, 'Default maxArms should be 2');
    assert.equal(limbs.maxLegs, 2, 'Default maxLegs should be 2');
    assert.equal(limbs.maxHands, 2, 'Default maxHands should be 2');
    assert.equal(limbs.usedHands, 0, 'Initially 0 hands used');
    assert.equal(limbs.exceededHands, false, 'Hands not exceeded initially');
    assert.equal(limbs.handsWarning, '', 'No hands warning initially');
  });

  test('2. Equipping weapons and gear accurately tracks used hands against 2 hand limit', async () => {
    const actor = await DCCActor.create({
      name: 'Wielder Crawler',
      type: 'crawler',
      system: {}
    });

    // 2.1 Equip 1-handed dagger
    const dagger = await DCCItem.create({
      name: 'Combat Dagger',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'one_handed'
      }
    });
    actor.items.push(dagger);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 1, '1-handed dagger uses 1 hand');
    assert.equal(actor.limbs.exceededHands, false, '1 hand is within 2 hands limit');

    // 2.2 Equip 2-handed bow (now total 1 + 2 = 3 hands)
    const bow = await DCCItem.create({
      name: 'Hunting Bow',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'two_handed'
      }
    });
    actor.items.push(bow);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 3, 'Dagger (1) + Bow (2) = 3 hands used');
    assert.equal(actor.limbs.exceededHands, true, 'Exceeded hands should be true when 3 > 2');
    assert.match(actor.limbs.handsWarning, /Hands limit exceeded: Wielding gear in 3 hands, but only 2 hands available!/);

    // 2.3 Unequip dagger
    dagger.system.equipped = false;
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 2, 'Only bow equipped: 2 hands used');
    assert.equal(actor.limbs.exceededHands, false, '2 hands equals 2 max hands, not exceeded');
    assert.equal(actor.limbs.handsWarning, '', 'Warning clears when within limit');

    // 2.4 Dual two-handed weapons (bow + heavy crossbow)
    const crossbow = await DCCItem.create({
      name: 'Heavy Crossbow',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'two_handed'
      }
    });
    actor.items.push(crossbow);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 4, 'Two 2-handed weapons use 4 hands');
    assert.equal(actor.limbs.exceededHands, true, '4 > 2 triggers exceededHands');
    assert.match(actor.limbs.handsWarning, /Wielding gear in 4 hands, but only 2 hands available!/);
  });

  test('3. Non-hand gear (torso armor, boots, helmet) does not consume hands', async () => {
    const actor = await DCCActor.create({
      name: 'Armored Crawler',
      type: 'crawler',
      system: {}
    });

    const torsoArmor = await DCCItem.create({
      name: 'Plate Armor',
      type: 'gear',
      system: { equipped: true, slot: 'torso', drBonus: 4 }
    });
    const boots = await DCCItem.create({
      name: 'Combat Boots',
      type: 'gear',
      system: { equipped: true, slot: 'feet' }
    });
    const helmet = await DCCItem.create({
      name: 'Iron Helm',
      type: 'gear',
      system: { equipped: true, slot: 'head' }
    });

    actor.items.push(torsoArmor, boots, helmet);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 0, 'Torso, boots, and helmet consume 0 hands');
    assert.equal(actor.limbs.exceededHands, false);
  });

  test('4. Versatile two_handed_disadv_1h items consume 1 hand when oneHanded is specified', async () => {
    const actor = await DCCActor.create({
      name: 'Chainsaw Crawler',
      type: 'crawler',
      system: {}
    });

    const chainsaw = await DCCItem.create({
      name: 'Gas Chainsaw',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'two_handed_disadv_1h',
        oneHanded: false
      }
    });
    actor.items.push(chainsaw);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 2, 'Chainsaw wielded standard consumes 2 hands');

    chainsaw.system.oneHanded = true;
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 1, 'Chainsaw wielded one-handed consumes 1 hand');
  });

  test('5. Quadruped anatomy has 4 legs and 0 hands; any weapon triggers exceededHands', async () => {
    const quadruped = await DCCActor.create({
      name: 'Donut the Cat',
      type: 'crawler',
      system: {
        attributes: {
          limbs: {
            arms: 0,
            legs: 4,
            hands: 0
          }
        }
      }
    });

    assert.equal(quadruped.limbs.arms, 0);
    assert.equal(quadruped.limbs.legs, 4);
    assert.equal(quadruped.limbs.hands, 0);
    assert.equal(quadruped.limbs.maxHands, 0);
    assert.equal(quadruped.limbs.usedHands, 0);
    assert.equal(quadruped.limbs.exceededHands, false);

    // Quadruped tries to equip a sword
    const sword = await DCCItem.create({
      name: 'Broadsword',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'one_handed'
      }
    });
    quadruped.items.push(sword);
    quadruped.prepareData();

    assert.equal(quadruped.limbs.usedHands, 1);
    assert.equal(quadruped.limbs.exceededHands, true, '1 > 0 hands triggers warning for quadruped');
    assert.match(quadruped.limbs.handsWarning, /Wielding gear in 1 hands, but only 0 hands available!/);
  });

  test('6. Centaur anatomy has 4 legs, 2 arms, 2 hands and can wield 2-handed weapons without warning', async () => {
    const centaur = await DCCActor.create({
      name: 'Chiron Centaur',
      type: 'crawler',
      system: {
        attributes: {
          limbs: {
            arms: 2,
            legs: 4,
            hands: 2
          }
        }
      }
    });

    assert.equal(centaur.limbs.maxArms, 2);
    assert.equal(centaur.limbs.maxLegs, 4);
    assert.equal(centaur.limbs.maxHands, 2);

    const bow = await DCCItem.create({
      name: 'Longbow',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        isWeapon: true,
        wieldMode: 'two_handed'
      }
    });
    centaur.items.push(bow);
    centaur.prepareData();

    assert.equal(centaur.limbs.usedHands, 2);
    assert.equal(centaur.limbs.exceededHands, false, 'Centaur wields 2-handed bow within 2 hands limit');
  });

  test('7. GM adjusting hands to 4 allows dual two-handed weapons without warning', async () => {
    const actor = await DCCActor.create({
      name: 'Goro Quad-Arm Crawler',
      type: 'crawler',
      system: {
        attributes: {
          limbs: {
            arms: 4,
            legs: 2,
            hands: 4
          }
        }
      }
    });

    assert.equal(actor.limbs.maxHands, 4);

    const bow1 = await DCCItem.create({
      name: 'Greatbow 1',
      type: 'gear',
      system: { equipped: true, slot: 'hands', isWeapon: true, wieldMode: 'two_handed' }
    });
    const bow2 = await DCCItem.create({
      name: 'Greatbow 2',
      type: 'gear',
      system: { equipped: true, slot: 'hands', isWeapon: true, wieldMode: 'two_handed' }
    });

    actor.items.push(bow1, bow2);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 4);
    assert.equal(actor.limbs.maxHands, 4);
    assert.equal(actor.limbs.exceededHands, false, '4 hands used out of 4 max hands is valid');

    // Equipping a 3rd weapon exceeds 4 hands
    const dagger = await DCCItem.create({
      name: 'Dagger',
      type: 'gear',
      system: { equipped: true, slot: 'hands', isWeapon: true, wieldMode: 'one_handed' }
    });
    actor.items.push(dagger);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 5);
    assert.equal(actor.limbs.exceededHands, true);
  });

  test('8. Buffs and Debuffs modifying limbs dynamically update maxHands and trigger/clear warnings', async () => {
    const actor = await DCCActor.create({
      name: 'Injured Crawler',
      type: 'crawler',
      system: {}
    });

    // 8.1 Equip a 1-handed weapon (1 hand used)
    const club = await DCCItem.create({
      name: 'War Club',
      type: 'gear',
      system: { equipped: true, slot: 'hands', isWeapon: true, wieldMode: 'one_handed' }
    });
    actor.items.push(club);
    actor.prepareData();

    assert.equal(actor.limbs.maxHands, 2);
    assert.equal(actor.limbs.usedHands, 1);
    assert.equal(actor.limbs.exceededHands, false);

    // 8.2 Add Debuff "Amputation: Arm" reducing arms and hands by 1
    const debuff = await DCCItem.create({
      name: 'Amputation: Arm',
      type: 'debuff',
      system: {
        limbModifiers: {
          arms: -1,
          hands: -1,
          legs: 0
        }
      }
    });
    actor.items.push(debuff);
    actor.prepareData();

    assert.equal(actor.limbs.deltaHands, -1, 'Debuff subtracts 1 hand');
    assert.equal(actor.limbs.maxHands, 1, 'Max hands reduced to 1');
    assert.equal(actor.limbs.usedHands, 1, '1 hand used');
    assert.equal(actor.limbs.exceededHands, false, '1 used <= 1 max is not exceeded');

    // 8.3 Equipping a second weapon exceeds the 1 hand limit
    const shield = await DCCItem.create({
      name: 'Buckler Shield',
      type: 'gear',
      system: { equipped: true, slot: 'hands', isWeapon: false }
    });
    actor.items.push(shield);
    actor.prepareData();

    assert.equal(actor.limbs.usedHands, 2, 'Club (1) + Shield (1) = 2 hands used');
    assert.equal(actor.limbs.maxHands, 1);
    assert.equal(actor.limbs.exceededHands, true, '2 used > 1 max triggers warning');

    // 8.4 Apply Buff "Cybernetic Prosthetic Arm" (+1 arm, +1 hand)
    const buff = await DCCItem.create({
      name: 'Cybernetic Prosthetic Arm',
      type: 'buff',
      system: {
        active: true,
        buffType: 'custom',
        limbModifiers: {
          arms: 1,
          hands: 1,
          legs: 0
        }
      }
    });
    actor.items.push(buff);
    actor.system.attributes = actor.system.attributes || {};
    actor.system.attributes.externalBuffs = { buff1: buff.id };
    actor.prepareData();

    assert.equal(actor.limbs.deltaHands, 0, '-1 debuff + 1 buff = 0 delta');
    assert.equal(actor.limbs.maxHands, 2, 'Max hands restored to 2');
    assert.equal(actor.limbs.usedHands, 2);
    assert.equal(actor.limbs.exceededHands, false, 'Warning clears once limit accommodates gear');
  });

  test('9. Canonical condition limb modifier fallback recognizes standard conditions', async () => {
    assert.equal(CANONICAL_CONDITION_LIMB_MODIFIERS['severed hand'].hands, -1);
    assert.equal(CANONICAL_CONDITION_LIMB_MODIFIERS['amputated arm'].arms, -1);
    assert.equal(CANONICAL_CONDITION_LIMB_MODIFIERS['amputated arm'].hands, -1);
    assert.equal(CANONICAL_CONDITION_LIMB_MODIFIERS['extra arms'].hands, 2);
    assert.equal(CANONICAL_CONDITION_LIMB_MODIFIERS['extra arms'].arms, 2);

    const actor = await DCCActor.create({
      name: 'Mutilated Crawler',
      type: 'crawler',
      system: {}
    });

    const conditionDebuff = await DCCItem.create({
      name: 'Severed Hand',
      type: 'debuff',
      system: {} // without explicit limbModifiers, falls back to canonical table
    });
    actor.items.push(conditionDebuff);
    actor.prepareData();

    assert.equal(actor.limbs.deltaHands, -1, 'Canonical condition Severed Hand subtracts 1 hand');
    assert.equal(actor.limbs.maxHands, 1, 'Max hands becomes 1');
  });

  test('10. Non-GM users cannot modify base limb values (_updateObject security)', async () => {
    const actor = await DCCActor.create({
      name: 'Test Actor',
      type: 'crawler',
      system: {
        attributes: {
          limbs: { arms: 2, legs: 2, hands: 2 }
        }
      }
    });

    const sheet = new DCCCrawlerSheet(actor);

    // 10.1 Non-GM attempts to alter hands to 10
    globalThis.game.user = { id: 'player-1', isGM: false };
    const hackedPayload = {
      'system.attributes.limbs.hands': 10,
      'system.attributes.limbs.arms': 10,
      'system.attributes.limbs.legs': 10,
      'name': 'Updated Crawler'
    };

    await sheet._updateObject(new Event('submit'), hackedPayload);

    assert.equal(hackedPayload['system.attributes.limbs.hands'], undefined, 'Non-GM payload stripped hands');
    assert.equal(hackedPayload['system.attributes.limbs.arms'], undefined, 'Non-GM payload stripped arms');
    assert.equal(hackedPayload['system.attributes.limbs.legs'], undefined, 'Non-GM payload stripped legs');
    assert.equal(actor.system.attributes.limbs.hands, 2, 'Base hands unchanged by non-GM');

    // 10.2 GM legitimately updates hands to 4
    globalThis.game.user = { id: 'gm-user-1', isGM: true };
    const gmPayload = {
      'system.attributes.limbs.hands': 4,
      'system.attributes.limbs.arms': 4,
      'system.attributes.limbs.legs': 2
    };

    await sheet._updateObject(new Event('submit'), gmPayload);
    assert.equal(gmPayload['system.attributes.limbs.hands'], 4, 'GM payload preserves hands update');
  });
});
