import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';
import { hydrateRankBreaks } from '../src/data/rank-dice.mjs';

describe('DCC RPG - Advancement Milestones (Rank 5, 10, 15) UI & Damage Scaling Verification', () => {
  describe('1. Compendium & Canonical Datasets Rank Breaks', () => {
    it('Dirt Clod spell dataset contains explicit structured rankBreaks', () => {
      const dirtClod = DCC_SPELLS.find(s => s.name === 'Dirt Clod');
      assert.ok(dirtClod, 'Dirt Clod must exist in DCC_SPELLS');
      assert.ok(dirtClod.system.rankBreaks, 'Dirt Clod must define rankBreaks');

      const rb = dirtClod.system.rankBreaks;
      assert.equal(rb.rank5.damageDice, '2d2', 'Rank 5 adds 2d2 damage');
      assert.equal(rb.rank10.damageDice, '1d2', 'Rank 10 adds 1d2 damage');
      assert.equal(rb.rank10.debuff, 'Woozy', 'Rank 10 inflicts Woozy debuff');
      assert.equal(rb.rank15.damageDice, '1d2', 'Rank 15 adds 1d2 damage');
      assert.equal(rb.rank15.rankDamageDice, 1, 'Rank 15 adds 1 rank damage die');
      assert.ok(rb.rank5.notes.includes('+2d2 base damage'));
    });

    it('Pugilism skill dataset contains explicit structured rankBreaks', () => {
      const pugilism = DCC_SKILLS.find(s => s.name === 'Pugilism');
      assert.ok(pugilism, 'Pugilism must exist in DCC_SKILLS');
      assert.ok(pugilism.system.rankBreaks, 'Pugilism must define rankBreaks');

      const rb = pugilism.system.rankBreaks;
      assert.equal(rb.rank5.damageDice, '2d2', 'Rank 5 adds 2d2 damage');
      assert.equal(rb.rank10.damageDice, '1d2', 'Rank 10 adds 1d2 damage');
      assert.equal(rb.rank15.damageDice, '1d2', 'Rank 15 adds 1d2 damage');
      assert.ok(rb.rank5.notes.includes('+2d2 base damage'));
    });

    it('all 54 spells define structured rankBreaks with all tiers', () => {
      assert.equal(DCC_SPELLS.length, 54);
      for (const spell of DCC_SPELLS) {
        assert.ok(spell.system.rankBreaks, `Spell ${spell.name} must define rankBreaks`);
        for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
          assert.ok(spell.system.rankBreaks[tier], `Spell ${spell.name} must define ${tier}`);
          assert.equal(typeof spell.system.rankBreaks[tier].damageDice, 'string');
          assert.equal(typeof spell.system.rankBreaks[tier].debuff, 'string');
          assert.equal(typeof spell.system.rankBreaks[tier].notes, 'string');
        }
      }
    });

    it('all 121 skills define structured rankBreaks with all tiers', () => {
      assert.equal(DCC_SKILLS.length, 121);
      for (const skill of DCC_SKILLS) {
        assert.ok(skill.system.rankBreaks, `Skill ${skill.name} must define rankBreaks`);
        for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
          assert.ok(skill.system.rankBreaks[tier], `Skill ${skill.name} must define ${tier}`);
          assert.equal(typeof skill.system.rankBreaks[tier].damageDice, 'string');
          assert.equal(typeof skill.system.rankBreaks[tier].debuff, 'string');
          assert.equal(typeof skill.system.rankBreaks[tier].notes, 'string');
        }
      }
    });
  });

  describe('2. DCCItemSheet UI Context & Hydration', () => {
    it('_prepareContext displays Dirt Clod rank 5, 10, 15 fields correctly in sheet UI', async () => {
      const rawSpell = DCC_SPELLS.find(s => s.name === 'Dirt Clod');
      const item = new DCCItem({
        id: rawSpell._id,
        name: rawSpell.name,
        type: 'spell',
        system: structuredClone(rawSpell.system)
      });

      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext({});

      assert.ok(context.system.rankBreaks, 'Context must provide rankBreaks to template');
      const rb = context.system.rankBreaks;

      assert.equal(rb.rank5.damageDice, '2d2', 'UI displays 2d2 in rank 5 additional damage dice');
      assert.equal(rb.rank10.damageDice, '1d2', 'UI displays 1d2 in rank 10 additional damage dice');
      assert.equal(rb.rank10.debuff, 'Woozy', 'UI displays Woozy in rank 10 debuff');
      assert.equal(rb.rank15.damageDice, '1d2', 'UI displays 1d2 in rank 15 additional damage dice');
      assert.equal(rb.rank15.rankDamageDice, 1, 'UI displays 1 in rank 15 rank damage die');
      assert.ok(rb.rank5.notes.includes('+2d2 base damage'), 'UI displays notes for rank 5');
    });

    it('_prepareContext displays Pugilism rank 5, 10, 15 fields correctly in sheet UI', async () => {
      const rawSkill = DCC_SKILLS.find(s => s.name === 'Pugilism');
      const item = new DCCItem({
        id: rawSkill._id,
        name: rawSkill.name,
        type: 'skill',
        system: structuredClone(rawSkill.system)
      });

      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext({});

      assert.ok(context.system.rankBreaks, 'Context must provide rankBreaks to template');
      const rb = context.system.rankBreaks;

      assert.equal(rb.rank5.damageDice, '2d2', 'UI displays 2d2 in rank 5 additional damage dice');
      assert.equal(rb.rank10.damageDice, '1d2', 'UI displays 1d2 in rank 10 additional damage dice');
      assert.equal(rb.rank15.damageDice, '1d2', 'UI displays 1d2 in rank 15 additional damage dice');
      assert.ok(rb.rank5.notes.includes('+2d2 base damage'), 'UI displays notes for rank 5');
    });

    it('_prepareContext auto-hydrates legacy/custom items that only contain unstructured upgrades text', async () => {
      const customSkill = new DCCItem({
        id: 'custom-skill-1',
        name: 'Thunder Kick',
        type: 'skill',
        system: {
          rank: 5,
          stat: 'str',
          notes: 'Special kick technique',
          upgrades: 'Rank 5: +1d10 base damage\nRank 10: +1d10 base damage, target gains Stunned Debuff\nRank 15: add 1 Rank damage die'
        }
      });

      const sheet = new DCCItemSheet(customSkill);
      const context = await sheet._prepareContext({});

      const rb = context.system.rankBreaks;
      assert.equal(rb.rank5.damageDice, '1d10', 'Auto-hydrates 1d10 for rank 5');
      assert.equal(rb.rank10.damageDice, '1d10', 'Auto-hydrates 1d10 for rank 10');
      assert.equal(rb.rank10.debuff, 'Stunned', 'Auto-hydrates Stunned debuff for rank 10');
      assert.equal(rb.rank15.rankDamageDice, 1, 'Auto-hydrates 1 rank damage die for rank 15');
    });

    it('_updateObject saves modified rankBreaks and updates item state without erasing notes', async () => {
      const item = new DCCItem({
        id: 'test-spell-edit',
        name: 'Dirt Clod',
        type: 'spell',
        system: {
          rank: 1,
          rankBreaks: {
            rank5: { damageDice: '2d2', baseDiceCountMod: '', rankDamageDice: 0, buffsResistances: '', debuff: '', notes: '+2d2 base damage.' },
            rank10: { damageDice: '1d2', baseDiceCountMod: '', rankDamageDice: 0, buffsResistances: '', debuff: 'Woozy', notes: '+1d2 base damage, and the target gains the Woozy Debuff.' }
          }
        }
      });

      const sheet = new DCCItemSheet(item);
      await sheet._updateObject(null, {
        'system.rankBreaks.rank5.damageDice': '3d2',
        'system.rankBreaks.rank5.debuff': 'Stunned',
        'system.rankBreaks.rank5.notes': '' // Empty input should not blow away existing notes if not entered
      });

      assert.equal(item.system.rankBreaks.rank5.damageDice, '3d2');
      assert.equal(item.system.rankBreaks.rank5.debuff, 'Stunned');
      assert.equal(item.system.rankBreaks.rank5.notes, '+2d2 base damage.');
    });
  });

  describe('3. Actor Damage Scaling & Zero Double-Counting Verification', () => {
    it('Dirt Clod rolls damage scaling cumulatively across Ranks 1, 5, 10, 15 without double-counting', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { int: { value: 16, unenhanced: 16, mod: 4 } },
          attributes: { mana: { value: 20, max: 20 } }
        }
      });

      const rawSpell = DCC_SPELLS.find(s => s.name === 'Dirt Clod');
      const spellItem = new DCCItem({
        id: rawSpell._id,
        name: rawSpell.name,
        type: 'spell',
        system: structuredClone(rawSpell.system)
      }, actor);

      // Rank 1: Base damage 1d2 + Rank 1 bonus (1) + Int (4)
      spellItem.system.rank = 1;
      const dmgR1 = actor.getSpellDamageData(spellItem);
      assert.equal(dmgR1.formula, '1d2 + 1 + 4', 'Rank 1 formula has base 1d2 + rank 1 bonus + 4');
      assert.equal(dmgR1.statMod, 4, 'Int mod 4');
      assert.deepEqual(dmgR1.debuffs, [], 'No debuffs at rank 1');

      // Rank 5: Base (1d2) + Rank 5 (2d2) combined into 3d2 + Rank 5 die (1d4) + 4 = 3d2 + 1d4 + 4
      spellItem.system.rank = 5;
      const dmgR5 = actor.getSpellDamageData(spellItem);
      assert.equal(dmgR5.formula, '3d2 + 1d4 + 4', 'Rank 5 has 3d2 + 1d4 + 4 with zero double counting');
      assert.deepEqual(dmgR5.debuffs, []);

      // Rank 10: 3d2 + Rank 10 (1d2) combined into 4d2 + Rank 10 die (1d10) + 4 = 4d2 + 1d10 + 4; Debuff Woozy
      spellItem.system.rank = 10;
      const dmgR10 = actor.getSpellDamageData(spellItem);
      assert.equal(dmgR10.formula, '4d2 + 1d10 + 4', 'Rank 10 has 4d2 + 1d10 + 4');
      assert.ok(dmgR10.debuffs.includes('Woozy'), 'Rank 10 inflicts Woozy debuff');

      // Rank 15: 4d2 + Rank 15 (1d2) combined into 5d2 + 2d8 + 1d6 (spell rank die 1d8+1d6 + milestone rank die 1d8) + 4
      spellItem.system.rank = 15;
      const dmgR15 = actor.getSpellDamageData(spellItem);
      assert.equal(dmgR15.formula, '5d2 + 2d8 + 1d6 + 4', 'Rank 15 has 5d2 + 2d8 + 1d6 + 4');
      assert.ok(dmgR15.rankDie.includes('2d8 + 1d6'), 'Rank 15 rank die is 2d8 + 1d6');
      assert.ok(dmgR15.debuffs.includes('Woozy'), 'Retains Woozy debuff');
    });

    it('Pugilism rolls unarmed damage scaling cumulatively without double-counting', () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 16, unenhanced: 16, mod: 4 } }
        }
      });

      const rawPugilism = DCC_SKILLS.find(s => s.name === 'Pugilism');
      const pugilismItem = new DCCItem({
        id: rawPugilism._id,
        name: rawPugilism.name,
        type: 'skill',
        system: structuredClone(rawPugilism.system)
      }, actor);

      // Rank 1: Base damage 1d2 + Rank 1 bonus (1) + Str (4)
      pugilismItem.system.rank = 1;
      const dmgR1 = actor.getSkillDamageData(pugilismItem);
      assert.equal(dmgR1.formula, '1d2 + 1 + 4', 'Rank 1 base 1d2 + 1 + 4');

      // Rank 5: Base (1d2) + Rank 5 (2d2) combined into 3d2 + Rank 5 die (1d4) + 4
      pugilismItem.system.rank = 5;
      const dmgR5 = actor.getSkillDamageData(pugilismItem);
      assert.equal(dmgR5.formula, '3d2 + 1d4 + 4', 'Rank 5 has 3d2 + 1d4 + 4 (no double counting)');

      // Rank 10: 3d2 + Rank 10 (1d2) combined into 4d2 + Rank 10 die (1d10) + 4
      pugilismItem.system.rank = 10;
      const dmgR10 = actor.getSkillDamageData(pugilismItem);
      assert.equal(dmgR10.formula, '4d2 + 1d10 + 4', 'Rank 10 has 4d2 + 1d10 + 4');

      // Rank 15: 4d2 + Rank 15 (1d2) combined into 5d2 + Rank 15 die (1d8 + 1d6) + 4
      pugilismItem.system.rank = 15;
      const dmgR15 = actor.getSkillDamageData(pugilismItem);
      assert.equal(dmgR15.formula, '5d2 + 1d8 + 1d6 + 4', 'Rank 15 has 5d2 + 1d8 + 1d6 + 4');
    });

    it('Weapon attack scaling with Bow skill rankBreaks reflects accurately', () => {
      const actor = new DCCActor({
        name: 'Katia',
        type: 'crawler',
        system: {
          abilities: { dex: { value: 16, unenhanced: 16, mod: 4 } }
        }
      });

      const bowItem = new DCCItem({
        id: 'bow-gear-1',
        name: 'Shortbow',
        type: 'gear',
        system: {
          equipped: true,
          damage: '1d6',
          damageStat: 'dex',
          damageType: 'Piercing',
          gearType: 'Weapon',
          weaponType: 'Bow',
          slot: 'hands'
        }
      }, actor);

      const rawBowSkill = DCC_SKILLS.find(s => s.name === 'Bow');
      const bowSkill = new DCCItem({
        id: 'bow-skill-1',
        name: 'Bow',
        type: 'skill',
        system: structuredClone(rawBowSkill.system)
      }, actor);

      // Embedded items on actor
      actor.items = [bowItem, bowSkill];

      // At Rank 5: Bow skill grants +1d6 base damage
      bowSkill.system.rank = 5;
      const profileR5 = actor._buildWeaponAttackProfile(bowItem);
      assert.ok(profileR5.combinedDice.includes('1d6'), 'Weapon profile scales with Bow skill');

      // At Rank 10: Bow skill grants +1d6 base damage and 1 Rank damage die
      bowSkill.system.rank = 10;
      const profileR10 = actor._buildWeaponAttackProfile(bowItem);
      assert.equal(profileR10.rankDamageDie, '1d10', 'Profile includes rank damage die');
    });
  });
});
