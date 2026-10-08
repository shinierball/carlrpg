import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('DCC RPG - Combat Technique Scoping, Effects Dropdown & Skill Idempotence Subsystem', () => {

  describe('1. Technique Applicability Scoping: Toss on Wrasslin vs Unarmed Combat & Weapons', () => {
    test('isTechniqueApplicable accurately restricts Toss to Wrasslin and excludes Unarmed Combat & Weapons', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const tossTech = { name: 'Toss', rank: 3, damageBonus: '1d8' };
      const wrasslinSkill = new DCCItem({ name: 'Wrasslin', type: 'skill', system: { rank: 3 } }, actor);
      const unarmedSkill = new DCCItem({ name: 'Unarmed Combat', type: 'skill', system: { rank: 3 } }, actor);
      const pugilismSkill = new DCCItem({ name: 'Pugilism', type: 'skill', system: { rank: 3 } }, actor);
      const swordItem = new DCCItem({ name: 'Longsword', type: 'gear', system: { weaponCategory: 'Edge', weaponType: 'sword', equipped: true } }, actor);
      const bowItem = new DCCItem({ name: 'Shortbow', type: 'gear', system: { weaponCategory: 'Ranged', weaponType: 'bow', equipped: true } }, actor);

      // Toss only applies to Wrasslin
      assert.equal(actor.isTechniqueApplicable(tossTech, wrasslinSkill), true, 'Toss applies to Wrasslin');
      assert.equal(actor.isTechniqueApplicable(tossTech, unarmedSkill), false, 'Toss does NOT apply to Unarmed Combat (Rule limitation)');
      assert.equal(actor.isTechniqueApplicable(tossTech, pugilismSkill), false, 'Toss does NOT apply to Pugilism');
      assert.equal(actor.isTechniqueApplicable(tossTech, swordItem), false, 'Toss does NOT apply to Longsword');
      assert.equal(actor.isTechniqueApplicable(tossTech, bowItem), false, 'Toss does NOT apply to Shortbow');
    });

    test('Primed Toss only modifies Wrasslin attack profile and does NOT inject into Unarmed Combat or weapons', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 16, mod: 4 }, dex: { value: 14, mod: 4 } } }
      });

      const tossItem = new DCCItem({
        name: 'Toss',
        type: 'skill',
        system: { isTechnique: true, techniqueConfig: { isDamageEffect: true, appliesToTags: ['wrasslin'] }, rank: 3 }
      }, actor);
      const wrasslinItem = new DCCItem({ name: 'Wrasslin', type: 'skill', system: { isAttack: true, rank: 3 } }, actor);
      const unarmedItem = new DCCItem({ name: 'Unarmed Combat', type: 'skill', system: { isAttack: true, rank: 3 } }, actor);
      const swordItem = new DCCItem({
        name: 'Broadsword',
        type: 'gear',
        system: { weaponCategory: 'Edge', weaponType: 'sword', damageDice: '1d8', damageStat: 'str', equipped: true }
      }, actor);

      actor.items = [tossItem, wrasslinItem, unarmedItem, swordItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      // Prime Toss
      await actor.setFlag('carl-rpg', `primed_technique_${tossItem.id}`, true);
      assert.equal(actor.isTechniquePrimed(tossItem.id), true, 'Toss is primed');

      const synthAttacks = actor.getSynthesizedAttacks();
      const wrasslinAtk = synthAttacks.find(a => a.name.toLowerCase().includes('wrasslin'));
      const unarmedAtk = synthAttacks.find(a => a.name.toLowerCase().includes('unarmed'));
      const swordAtk = synthAttacks.find(a => a.name.toLowerCase().includes('sword'));

      assert.ok(wrasslinAtk, 'Wrasslin attack synthesized');
      assert.ok(unarmedAtk, 'Unarmed Combat attack synthesized');
      assert.ok(swordAtk, 'Broadsword attack synthesized');

      // Wrasslin must show Toss bonus
      assert.ok(wrasslinAtk.displayDamage.includes('[Toss]'), 'Wrasslin displayDamage includes [Toss]');

      // Unarmed Combat must NOT show Toss
      assert.ok(!unarmedAtk.displayDamage.includes('[Toss]'), 'Unarmed Combat displayDamage does NOT include [Toss]');

      // Sword must NOT show Toss
      assert.ok(!swordAtk.displayDamage.includes('[Toss]'), 'Broadsword displayDamage does NOT include [Toss]');
    });

    test('Damage roll with primed Toss adds Toss damage only to Wrasslin and NOT Unarmed Combat', () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 16, mod: 4 } } }
      });

      const tossItem = new DCCItem({
        name: 'Toss',
        type: 'skill',
        system: { isTechnique: true, techniqueConfig: { isDamageEffect: true, appliesToTags: ['wrasslin'] }, rank: 3 }
      }, actor);
      const wrasslinItem = new DCCItem({ name: 'Wrasslin', type: 'skill', system: { isAttack: true, rank: 3 } }, actor);
      const unarmedItem = new DCCItem({ name: 'Unarmed Combat', type: 'skill', system: { isAttack: true, rank: 3 } }, actor);

      actor.items = [tossItem, wrasslinItem, unarmedItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      // Primed Toss
      const primedTechs = [{ id: tossItem.id, name: 'Toss', rank: 3, damageBonus: '1d8', isPrimed: true }];

      // Wrasslin damage parts
      const wrasslinParts = actor.getAttackDamageParts(wrasslinItem, { techniques: primedTechs });
      assert.ok(wrasslinParts.some(p => p.source === 'Toss' || p.source?.includes('Toss')), 'Wrasslin damage parts include Toss');

      // Unarmed Combat damage parts
      const unarmedParts = actor.getAttackDamageParts(unarmedItem, { techniques: primedTechs });
      assert.ok(!unarmedParts.some(p => p.source === 'Toss' || p.source?.includes('Toss')), 'Unarmed Combat damage parts do NOT include Toss');
    });
  });

  describe('2. Effects Dropdown Scoping: Only Known or Granted Effects Rendered', () => {
    test('getSelectableDamageEffects only returns canonical effects that the crawler actually knows or has from gear', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const wrasslinItem = new DCCItem({ name: 'Wrasslin', type: 'skill', system: { rank: 3 } }, actor);
      const tossItem = new DCCItem({ name: 'Toss', type: 'skill', system: { rank: 2 } }, actor);

      // Actor only knows Wrasslin and Toss (does NOT know Choke Out or Dirty Fighting)
      actor.items = [wrasslinItem, tossItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      const selectableEffects = actor.getSelectableDamageEffects(wrasslinItem);

      // Must include Toss
      assert.ok(selectableEffects.includes('Toss'), 'Selectable effects includes Toss (known skill)');
      // Must NOT include unknown effects
      assert.ok(!selectableEffects.includes('Choke Out'), 'Selectable effects does NOT include unknown Choke Out');
      assert.ok(!selectableEffects.includes('Dirty Fighting'), 'Selectable effects does NOT include unknown Dirty Fighting');
    });

    test('getSelectableDamageEffects includes effect granted by equipped gear', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const pugilismItem = new DCCItem({ name: 'Pugilism', type: 'skill', system: { rank: 3 } }, actor);
      const knuckleDusters = new DCCItem({
        name: 'Knuckle Dusters',
        type: 'gear',
        system: {
          equipped: true,
          skillModifiers: [{ name: 'Iron Punch', bonus: 2, type: 'skill' }]
        }
      }, actor);

      actor.items = [pugilismItem, knuckleDusters];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      const selectableEffects = actor.getSelectableDamageEffects(pugilismItem);

      // Must include Iron Punch because gear grants it
      assert.ok(selectableEffects.includes('Iron Punch'), 'Selectable effects includes Iron Punch granted by gear');
      // Must not include unknown Dirty Fighting or Powerful Strike
      assert.ok(!selectableEffects.includes('Dirty Fighting'), 'Selectable effects does not include unknown Dirty Fighting');
      assert.ok(!selectableEffects.includes('Powerful Strike'), 'Selectable effects does not include unknown Powerful Strike');
    });
  });

  describe('3. Dropdown Selection & Priming Harmonization', () => {
    test('Selected effect on attack item updates displayDamage without requiring technique to be primed', () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 16, mod: 4 } } }
      });

      const tossItem = new DCCItem({ name: 'Toss', type: 'skill', system: { rank: 2 } }, actor);
      const wrasslinItem = new DCCItem({
        name: 'Wrasslin',
        type: 'skill',
        system: { isAttack: true, rank: 3, selectedEffect: 'Toss' }
      }, actor);

      actor.items = [tossItem, wrasslinItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      const synthAttacks = actor.getSynthesizedAttacks();
      const wrasslinAtk = synthAttacks.find(a => a.name.toLowerCase().includes('wrasslin'));

      assert.ok(wrasslinAtk, 'Wrasslin attack synthesized');
      assert.ok(wrasslinAtk.displayDamage.includes('[Toss]'), 'Selected effect Toss appears in displayDamage');
    });

    test('rollAttack honors attackItem.system.selectedEffect and applies effect without requiring modal dialog', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 16, mod: 4 } } }
      });

      const tossItem = new DCCItem({ name: 'Toss', type: 'skill', system: { rank: 2 } }, actor);
      const wrasslinItem = new DCCItem({
        name: 'Wrasslin',
        type: 'skill',
        system: { isAttack: true, rank: 3, selectedEffect: 'Toss' }
      }, actor);

      actor.items = [tossItem, wrasslinItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      const message = await actor.rollAttack(wrasslinItem, 'damage', { skipDialog: true });
      assert.ok(message, 'Chat message created');
      assert.equal(message.flags?.['carl-rpg']?.damageEffect, 'Toss', 'Damage roll flag records Toss as damageEffect');
    });
  });

  describe('4. Clean Damage Formula Formatting: Zero Duplicate Pluses or Duplicate Stat Mods', () => {
    test('Attack profile displayDamage does not contain duplicate + or + + before stat/rank die', () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 16, mod: 4 } } }
      });

      const wrasslinItem = new DCCItem({
        name: 'Wrasslin',
        type: 'skill',
        system: { isAttack: true, rank: 3 }
      }, actor);

      actor.items = [wrasslinItem];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      const synthAttacks = actor.getSynthesizedAttacks();
      const wrasslinAtk = synthAttacks.find(a => a.name.toLowerCase().includes('wrasslin'));

      assert.ok(wrasslinAtk);
      assert.ok(!wrasslinAtk.displayDamage.includes('+ +'), 'displayDamage does NOT contain "+ +"');
      assert.ok(!wrasslinAtk.displayDamage.includes('+  +'), 'displayDamage does NOT contain "+  +"');
      assert.ok(!wrasslinAtk.displayDamage.startsWith('+'), 'displayDamage does NOT start with a dangling "+"');
    });
  });

  describe('5. Skill Document Idempotence: No Duplicate Documents, Higher Rank Kept', () => {
    test('Adding a skill to a crawler that already exists keeps the higher rank and does not add a second document', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler'
      });

      // Existing skill: Pugilism Rank 3
      const existingPugilism = new DCCItem({
        name: 'Pugilism',
        type: 'skill',
        system: { rank: 3, stat: 'str' }
      }, actor);
      actor.items = [existingPugilism];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      // Attempt to add Pugilism Rank 1 (lower rank)
      const lowerIncoming = {
        name: 'Pugilism',
        type: 'skill',
        system: { rank: 1, stat: 'str' }
      };

      const results1 = await actor.createEmbeddedDocuments('Item', [lowerIncoming]);
      assert.equal(actor.items.filter(i => i.name === 'Pugilism').length, 1, 'Only one Pugilism document exists');
      const pug1 = actor.items.find(i => i.name === 'Pugilism');
      assert.equal(pug1.system.rank, 3, 'Higher rank (3) is preserved over incoming lower rank (1)');

      // Attempt to add Pugilism Rank 5 (higher rank)
      const higherIncoming = {
        name: 'Pugilism',
        type: 'skill',
        system: { rank: 5, stat: 'str' }
      };

      const results2 = await actor.createEmbeddedDocuments('Item', [higherIncoming]);
      assert.equal(actor.items.filter(i => i.name === 'Pugilism').length, 1, 'Still only one Pugilism document exists');
      const pug2 = actor.items.find(i => i.name === 'Pugilism');
      assert.equal(pug2.system.rank, 5, 'Incoming higher rank (5) upgrades the existing skill');
    });

    test('If duplicate skill documents already exist on actor, creation cleans up duplicates and retains the highest rank', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler'
      });

      const dupe1 = new DCCItem({ id: 'pug-1', name: 'Pugilism', type: 'skill', system: { rank: 2 } }, actor);
      const dupe2 = new DCCItem({ id: 'pug-2', name: 'Pugilism', type: 'skill', system: { rank: 4 } }, actor);

      actor.items = [dupe1, dupe2];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      // Adding incoming Pugilism Rank 3
      const incoming = {
        name: 'Pugilism',
        type: 'skill',
        system: { rank: 3 }
      };

      await actor.createEmbeddedDocuments('Item', [incoming]);
      const pugSkills = actor.items.filter(i => i.name === 'Pugilism');
      assert.equal(pugSkills.length, 1, 'Deduplication deletes redundant duplicate skill document');
      assert.equal(pugSkills[0].system.rank, 4, 'Retains highest rank (4) among duplicates');
    });
  });

});
