import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { AttackDataModel } from '../src/models/items/attack-model.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { DCCCrawlerSheet, isWeaponGear } from '../src/sheets/crawler-sheet.mjs';
import { DCCCrawlerActionHUD } from '../src/apps/crawler-token-hud.mjs';

describe('DCC RPG - Attack & Weapon Equipment Integration', () => {
  let crawler;

  before(() => {
    CONFIG.Item.documentClass = DCCItem;
    CONFIG.Actor.documentClass = DCCActor;
    CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
    CONFIG.Item.dataModels.attack = AttackDataModel;
    CONFIG.Item.dataModels.gear = GearDataModel;
  });

  beforeEach(() => {
    crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, mod: 4 },
          dex: { value: 6, mod: 3 },
          con: { value: 10, mod: 4 },
          int: { value: 4, mod: 2 },
          cha: { value: 2, mod: 1 }
        },
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 }
        }
      }
    });
  });

  it('1. AttackDataModel and GearDataModel schemas define equipped and isWeapon fields', () => {
    const defaultAttack = new AttackDataModel();
    assert.equal(defaultAttack.equipped, true, 'Attack items must default to equipped: true');

    const defaultGear = new GearDataModel();
    assert.equal(defaultGear.equipped, false, 'Gear items must default to equipped: false');
    assert.equal(defaultGear.isWeapon, false, 'Gear items must default to isWeapon: false');
  });

  it('2. isWeaponGear accurately classifies weapon gear vs non-weapon armor', () => {
    const handsGear = new DCCItem({
      name: 'Broadsword',
      type: 'gear',
      system: { slot: 'hands', damageParts: [{ dice: '1d8', stat: 'str', type: 'Slashing' }] }
    });
    assert.equal(isWeaponGear(handsGear), true, 'Gear in hands slot must be classified as a weapon');

    const explicitWeapon = new DCCItem({
      name: 'Hidden Dagger',
      type: 'gear',
      system: { slot: 'accessory', isWeapon: true, damageParts: [{ dice: '1d4', stat: 'dex', type: 'Piercing' }] }
    });
    assert.equal(isWeaponGear(explicitWeapon), true, 'Gear with isWeapon: true must be classified as a weapon');

    const damageGear = new DCCItem({
      name: 'Spiked Gauntlet',
      type: 'gear',
      system: { slot: 'arms', damageParts: [{ dice: '1d4', stat: 'str', type: 'Piercing' }] }
    });
    assert.equal(isWeaponGear(damageGear), true, 'Gear with damageParts must be classified as a weapon');

    const chestArmor = new DCCItem({
      name: 'Kevlar Vest',
      type: 'gear',
      system: { slot: 'torso', drBonus: 2, evadeBonus: 0, damageParts: [] }
    });
    assert.equal(isWeaponGear(chestArmor), false, 'Torso armor without damage parts must not be classified as a weapon');

    const nonGear = new DCCItem({ name: 'Fireball', type: 'spell' });
    assert.equal(isWeaponGear(nonGear), false, 'Spell item must not be classified as gear weapon');
  });

  it('3. Equipping a weapon gear item adds it to sheet context.attacks; unequipping removes it to stowedAttacks', async () => {
    const longsword = new DCCItem({
      name: 'Longsword',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: false,
        damageParts: [{ dice: '1d8', stat: 'str', type: 'Slashing' }]
      }
    }, crawler);
    crawler.items.push(longsword);

    const swordSkill = new DCCItem({
      name: 'Longsword',
      type: 'skill',
      system: { rank: 3, stat: 'str' }
    }, crawler);
    crawler.items.push(swordSkill);

    const sheet = new DCCCrawlerSheet(crawler);

    // Initial state: Longsword is unequipped
    let context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 0, 'Unequipped weapon must NOT appear in context.attacks');
    assert.equal(context.stowedAttacks.length, 1, 'Unequipped weapon must appear in context.stowedAttacks');
    assert.equal(context.stowedAttacksCount, 1);
    assert.equal(context.stowedAttacks[0].name, 'Longsword');

    // Equip Longsword
    await longsword.update({ 'system.equipped': true });
    context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 1, 'Equipped weapon must appear in context.attacks');
    assert.equal(context.attacks[0].name, 'Longsword');
    assert.equal(context.attacks[0].isWeaponGear, true);
    assert.equal(context.attacks[0].displayToHitStat, 'STR');
    assert.equal(context.attacks[0].displayToHitRank, 3);
    assert.equal(context.attacks[0].displayToHit, 'STR (3)');
    assert.ok(context.attacks[0].displayDamage.includes('1d8 + STR'));
    assert.equal(context.stowedAttacks.length, 0, 'Equipped weapon must leave stowedAttacks');
    assert.equal(context.stowedAttacksCount, 0);

    // Unequip Longsword again
    await longsword.update({ 'system.equipped': false });
    context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 0, 'Unequipped weapon must disappear from context.attacks');
    assert.equal(context.stowedAttacks.length, 1, 'Unequipped weapon must return to stowedAttacks');
  });

  it('4. Dedicated attack items with equipped: false are removed from context.attacks to stowedAttacks', async () => {
    const clawAttack = new DCCItem({
      name: 'Claw Slash',
      type: 'attack',
      system: {
        equipped: true,
        toHitStat: 'str',
        toHitRank: 2,
        damageDice: '1d6',
        damageStat: 'str',
        damageType: 'Slashing'
      }
    }, crawler);
    crawler.items.push(clawAttack);

    const sheet = new DCCCrawlerSheet(crawler);

    // Initial state: Claw Slash is equipped
    let context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 1, 'Equipped attack must appear in context.attacks');
    assert.equal(context.attacks[0].name, 'Claw Slash');
    assert.equal(context.stowedAttacks.length, 0);

    // Unequip Claw Slash
    await clawAttack.update({ 'system.equipped': false });
    context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 0, 'Unequipped attack must be removed from context.attacks');
    assert.equal(context.stowedAttacks.length, 1, 'Unequipped attack must be in stowedAttacks');
    assert.equal(context.stowedAttacks[0].name, 'Claw Slash');

    // Re-equip Claw Slash
    await clawAttack.update({ 'system.equipped': true });
    context = await sheet._prepareContext({});
    assert.equal(context.attacks.length, 1);
    assert.equal(context.stowedAttacks.length, 0);
  });

  it('5. Sheet listeners .attack-toggle-equipped and .toggle-stowed-attacks-view operate smoothly', async () => {
    const warhammer = new DCCItem({
      name: 'Warhammer',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        damageParts: [{ dice: '1d10', stat: 'str', type: 'Bludgeoning' }]
      }
    }, crawler);
    crawler.items.push(warhammer);

    const sheet = new DCCCrawlerSheet(crawler);
    const clickListeners = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickListeners[sel] = fn; },
        change: () => {},
        on: () => {}
      })
    };

    sheet.activateListeners(mockHtml);
    assert.ok(clickListeners['.attack-toggle-equipped'], '.attack-toggle-equipped listener must be registered');
    assert.ok(clickListeners['.toggle-stowed-attacks-view'], '.toggle-stowed-attacks-view listener must be registered');

    // Click toggle-equipped on warhammer
    globalThis.$ = () => ({
      closest: () => ({
        data: (k) => warhammer.id
      })
    });

    await clickListeners['.attack-toggle-equipped']({
      preventDefault: () => {},
      currentTarget: {}
    });
    assert.equal(warhammer.system.equipped, false, 'Warhammer must toggle from equipped: true to equipped: false');

    // Click toggle stowed attacks view
    assert.equal(sheet._showStowedAttacks ?? false, false);
    clickListeners['.toggle-stowed-attacks-view']({
      preventDefault: () => {}
    });
    assert.equal(sheet._showStowedAttacks, true, '_showStowedAttacks must toggle to true');
  });

  it('6. Rolling attack hit and damage on an equipped weapon gear item functions completely', async () => {
    const bow = new DCCItem({
      name: 'Composite Bow',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        toHitStat: 'dex',
        damageParts: [{ dice: '1d8', stat: 'dex', type: 'Piercing' }]
      }
    }, crawler);
    crawler.items.push(bow);

    // Roll to hit on gear item
    const hitMsg = await crawler.rollAttack(bow, 'hit');
    assert.ok(hitMsg, 'Rolling to hit on weapon gear must produce a chat message');
    assert.ok(hitMsg.flavor.includes('Composite Bow'), 'Flavor must mention Composite Bow');
    assert.ok(hitMsg.flavor.includes('DEX Mod'), 'Flavor must use DEX Mod');

    // Roll damage on gear item
    const dmgMsg = await crawler.rollAttack(bow, 'damage');
    assert.ok(dmgMsg, 'Rolling damage on weapon gear must produce a chat message');
    assert.ok(dmgMsg.content.includes('Piercing'), 'Damage card must evaluate Piercing damage');
  });

  it('7. Left Action HUD includes equipped weapons & attacks and excludes unequipped ones', async () => {
    const equippedAttack = new DCCItem({
      name: 'Unarmed Strike',
      type: 'attack',
      system: { equipped: true, damageDice: '1d4', damageStat: 'str', damageType: 'Bludgeoning' }
    }, crawler);

    const stowedAttack = new DCCItem({
      name: 'Bite',
      type: 'attack',
      system: { equipped: false, damageDice: '1d4', damageStat: 'str', damageType: 'Piercing' }
    }, crawler);

    const equippedWeapon = new DCCItem({
      name: 'Battleaxe',
      type: 'gear',
      system: { slot: 'hands', equipped: true, damageParts: [{ dice: '1d10', stat: 'str', type: 'Slashing' }] }
    }, crawler);

    const stowedWeapon = new DCCItem({
      name: 'Dagger',
      type: 'gear',
      system: { slot: 'hands', equipped: false, damageParts: [{ dice: '1d4', stat: 'dex', type: 'Piercing' }] }
    }, crawler);

    crawler.items.push(equippedAttack, stowedAttack, equippedWeapon, stowedWeapon);

    const actionHUD = new DCCCrawlerActionHUD(crawler);
    const data = await actionHUD.getData();

    assert.equal(data.attacks.length, 2, 'Left Action HUD must only contain equipped attacks & weapons (2)');
    assert.ok(data.attacks.some(a => a.name === 'Unarmed Strike'), 'Unarmed Strike must be present');
    assert.ok(data.attacks.some(a => a.name === 'Battleaxe'), 'Battleaxe must be present');
    assert.equal(data.attacks.some(a => a.name === 'Bite'), false, 'Stowed attack Bite must NOT be present');
    assert.equal(data.attacks.some(a => a.name === 'Dagger'), false, 'Stowed weapon Dagger must NOT be present');
  });
});
