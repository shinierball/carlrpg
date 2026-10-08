import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { exportCrawlerToPdf } from '../src/apps/pdf-exporter.mjs';
import { PDFDocument } from '../lib/pdf-lib.mjs';

describe('DCC RPG - Attack & Skill Synthesis & Combat Techniques (Hybrid Option 1 & 2)', () => {
  let crawler;

  before(() => {
    CONFIG.Item.documentClass = DCCItem;
    CONFIG.Actor.documentClass = DCCActor;
  });

  beforeEach(() => {
    crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 12, mod: 4 },
          dex: { value: 6, mod: 3 },
          con: { value: 14, mod: 4 },
          int: { value: 4, mod: 2 },
          cha: { value: 2, mod: 1 }
        },
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 }
        },
        details: {
          level: 3,
          floor: '1st Floor',
          notes: 'Keep boots off!'
        }
      }
    });
  });

  it('1. Synthesizes unarmed combat skill (Pugilism) into primary attack profile with rank breaks and dice', () => {
    const pugilism = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 5,
        modifiedRank: 5,
        stat: 'dex',
        category: 'combat',
        checkType: 'Attack Check, Dex'
      }
    }, crawler);
    crawler.items.push(pugilism);

    const attacks = crawler.getSynthesizedAttacks();
    assert.equal(attacks.length, 1, 'Pugilism must synthesize into attack list');
    const pug = attacks[0];
    assert.equal(pug.isSkillAttack, true, 'Must be flagged as skill attack');
    assert.equal(pug.skillRank, 5, 'Rank must be 5');
    // DEX mod is 3, rank is 5 => To Hit mod = 8
    assert.equal(pug.toHitMod, 8, 'To-Hit must be Rank (5) + DEX Mod (3) = 8');
    assert.equal(pug.displayToHit, 'DEX (5)');
    // At Rank 5, Pugilism base dice is 3d2, plus Rank 5 damage die 1d4
    assert.ok(pug.combinedDice.includes('3d2 + 1d4'), `Combined dice should be 3d2 + 1d4, got ${pug.combinedDice}`);
    assert.equal(pug.dmgStatMod, 4, 'Damage stat mod from STR is +4');
  });

  it('2. Pairs equipped weapon with associated weapon skill to compute to-hit and damage die', () => {
    const broadsword = new DCCItem({
      name: 'Broadsword',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        damageParts: [{ dice: '1d8', stat: 'str', type: 'Slashing' }],
        associatedSkills: ['Broadsword', 'Blades']
      }
    }, crawler);
    crawler.items.push(broadsword);

    const bladeSkill = new DCCItem({
      name: 'Blades',
      type: 'skill',
      system: {
        rank: 3,
        modifiedRank: 3,
        stat: 'str'
      }
    }, crawler);
    crawler.items.push(bladeSkill);

    const attacks = crawler.getSynthesizedAttacks();
    assert.equal(attacks.length, 1, 'Equipped Broadsword must synthesize into attack roster');
    const swordAtk = attacks[0];
    assert.equal(swordAtk.name, 'Broadsword');
    assert.equal(swordAtk.skillRank, 3, 'Must match Blades skill rank 3');
    // STR mod 4 + Rank 3 = 7
    assert.equal(swordAtk.toHitMod, 7);
    assert.equal(swordAtk.combinedDice, '1d8 + 1d2', 'Weapon base 1d8 + Rank 3 damage die 1d2');
  });

  it('3. Identifies secondary skills as Combat Techniques and supports priming/toggling', async () => {
    const powerfulStrike = new DCCItem({
      name: 'Powerful Strike',
      type: 'skill',
      system: {
        rank: 2,
        category: 'combat',
        checkType: 'Damage Effect'
      }
    }, crawler);
    const dirtyFighting = new DCCItem({
      name: 'Dirty Fighting',
      type: 'skill',
      system: {
        rank: 5,
        category: 'combat',
        checkType: 'Damage Effect'
      }
    }, crawler);
    crawler.items.push(powerfulStrike, dirtyFighting);

    const techniques = crawler.getCombatTechniques();
    assert.equal(techniques.length, 2, 'Secondary maneuvers must populate Combat Techniques');
    assert.equal(techniques[0].name, 'Powerful Strike');
    assert.equal(techniques[1].name, 'Dirty Fighting');
    assert.equal(techniques[1].debuffName, 'Woozy', 'Rank 5 Dirty Fighting inflicts Woozy');

    // Initially neither is primed
    assert.equal(crawler.getPrimedTechniques().length, 0);

    // Toggle Powerful Strike primed
    await crawler.toggleTechniquePrimed(powerfulStrike.id);
    assert.equal(crawler.isTechniquePrimed(powerfulStrike.id), true);
    assert.equal(crawler.getPrimedTechniques().length, 1);
    assert.equal(crawler.getPrimedTechniques()[0].name, 'Powerful Strike');

    // Toggle back
    await crawler.toggleTechniquePrimed(powerfulStrike.id);
    assert.equal(crawler.isTechniquePrimed(powerfulStrike.id), false);
    assert.equal(crawler.getPrimedTechniques().length, 0);
  });

  it('4. Rolling attack damage with primed technique injects bonus damage and unprimes technique', async () => {
    const dagger = new DCCItem({
      name: 'Dagger',
      type: 'gear',
      system: {
        slot: 'hands',
        equipped: true,
        damageParts: [{ dice: '1d4', stat: 'str', type: 'Piercing' }]
      }
    }, crawler);
    const ironPunch = new DCCItem({
      name: 'Iron Punch',
      type: 'skill',
      system: {
        rank: 2,
        category: 'combat',
        appliesTo: ['Dagger']
      }
    }, crawler);
    crawler.items.push(dagger, ironPunch);

    // Prime Iron Punch
    await crawler.toggleTechniquePrimed(ironPunch.id);
    assert.equal(crawler.isTechniquePrimed(ironPunch.id), true);

    // Get damage parts with primed technique
    const parts = crawler.getAttackDamageParts(dagger);
    const ipPart = parts.find(p => p.source.includes('Iron Punch'));
    assert.ok(ipPart, 'Damage parts must contain Iron Punch technique part');
    assert.equal(ipPart.dice, '1d2');

    // Roll damage
    const chatMsg = await crawler.rollAttack(dagger, 'damage');
    assert.ok(chatMsg, 'Chat message should be produced');

    // After damage roll, primed techniques should be cleared
    assert.equal(crawler.isTechniquePrimed(ironPunch.id), false, 'Technique must automatically unprime after attack roll');
    assert.equal(crawler.getPrimedTechniques().length, 0);
  });

  it('5. Sheet context populates synthesized attacks, [SKILL] badges, and combatTechniques strip', async () => {
    const pugilism = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: { rank: 3, stat: 'dex', category: 'combat' }
    }, crawler);
    const skullcracker = new DCCItem({
      name: 'Skullcracker',
      type: 'skill',
      system: { rank: 1, category: 'combat' }
    }, crawler);
    crawler.items.push(pugilism, skullcracker);

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet._prepareContext({});

    // Check synthesized attacks
    const skillAtk = context.attacks.find(a => a.isSkillAttack);
    assert.ok(skillAtk, 'context.attacks must include synthesized skill attack');
    assert.equal(skillAtk.name, 'Pugilism (Unarmed)');
    assert.equal(skillAtk.isSkillAttack, true);

    // Check combat techniques
    assert.ok(context.combatTechniques, 'context.combatTechniques must exist');
    assert.equal(context.combatTechniques.length, 1);
    assert.equal(context.combatTechniques[0].name, 'Skullcracker');
    assert.equal(context.primedTechniquesCount, 0);
  });

  it('6. PDF Export populates Page 1 attack slots with synthesized composite formulas and appends maneuvers to notes', async () => {
    const pugilism = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: { rank: 5, stat: 'dex', category: 'combat' }
    }, crawler);
    const dirtyFighting = new DCCItem({
      name: 'Dirty Fighting',
      type: 'skill',
      system: { rank: 5, category: 'combat' }
    }, crawler);
    crawler.items.push(pugilism, dirtyFighting);

    const pdfBytes = await exportCrawlerToPdf(crawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Page 1 Attack Slot 1: Text Field 55 is Name, Text Field 53 is Dice
    const atkName = form.getTextField('Text Field 55').getText();
    assert.ok(atkName.includes('Pugilism'), `Attack slot 1 should be Pugilism, got ${atkName}`);

    const atkDice = form.getTextField('Text Field 53').getText();
    assert.ok(atkDice.includes('3d2 + 1d4'), `Attack slot 1 dice should be composite 3d2 + 1d4, got ${atkDice}`);

    // Notes field: Text Field 102 should include COMBAT MANEUVERS summary
    const notesText = form.getTextField('Text Field 102').getText();
    assert.ok(notesText.includes('[COMBAT MANEUVERS]:'), 'Notes must append combat maneuvers header');
    assert.ok(notesText.includes('Dirty Fighting'), 'Notes must list Dirty Fighting maneuver');
  });
});
