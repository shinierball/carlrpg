import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { SkillDataModel } from '../src/models/items/skill-model.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';

test('DCC RPG Skill Classification & Damage Resolution Subsystem', async (t) => {
  const templateJson = JSON.parse(fs.readFileSync('template.json', 'utf8'));

  await t.test('1. Schema Integrity (template.json & SkillDataModel)', () => {
    // Assert template.json skill schema
    assert.equal(
      templateJson.Item.skill.isAttack,
      false,
      'template.json Item.skill.isAttack default must be false'
    );
    assert.equal(
      templateJson.Item.skill.hasDamage,
      false,
      'template.json Item.skill.hasDamage default must be false'
    );

    // Assert SkillDataModel schema
    const schema = SkillDataModel.defineSchema();
    assert.ok(schema.isAttack, 'SkillDataModel schema defines isAttack field');
    assert.equal(schema.isAttack.initial, false, 'SkillDataModel isAttack initial is false');
    assert.ok(schema.hasDamage, 'SkillDataModel schema defines hasDamage field');
    assert.equal(schema.hasDamage.initial, false, 'SkillDataModel hasDamage initial is false');

    const defaultModel = new SkillDataModel();
    assert.equal(defaultModel.isAttack, false);
    assert.equal(defaultModel.hasDamage, false);
  });

  await t.test('2. Official Skills Dataset Classification', () => {
    const callAPlay = DCC_SKILLS.find(s => s.name === 'Call a Play');
    assert.ok(callAPlay, 'Call a Play must be in DCC_SKILLS');
    assert.equal(callAPlay.system.isAttack, false, 'Call a Play must have isAttack: false');
    assert.equal(callAPlay.system.hasDamage, false, 'Call a Play must have hasDamage: false');
    assert.equal(callAPlay.system.baseDamage, '', 'Call a Play must have empty baseDamage');

    const intervene = DCC_SKILLS.find(s => s.name === 'Intervene');
    assert.ok(intervene, 'Intervene must be in DCC_SKILLS');
    assert.equal(intervene.system.isAttack, false, 'Intervene must have isAttack: false');
    assert.equal(intervene.system.hasDamage, false, 'Intervene must have hasDamage: false');
    assert.equal(intervene.system.baseDamage, '', 'Intervene must have empty baseDamage');

    const taunt = DCC_SKILLS.find(s => s.name === 'Taunt');
    assert.ok(taunt, 'Taunt must be in DCC_SKILLS');
    assert.equal(taunt.system.isAttack, false, 'Taunt must have isAttack: false');
    assert.equal(taunt.system.hasDamage, false, 'Taunt must have hasDamage: false');
    assert.equal(taunt.system.category, 'Defensive', 'Taunt is categorized as Defensive');

    const catcher = DCC_SKILLS.find(s => s.name === 'Catcher');
    assert.ok(catcher, 'Catcher must be in DCC_SKILLS');
    assert.equal(catcher.system.isAttack, false, 'Catcher must have isAttack: false');
    assert.equal(catcher.system.hasDamage, false, 'Catcher must have hasDamage: false');
    assert.equal(catcher.system.category, 'Defensive', 'Catcher is categorized as Defensive');
  });

  await t.test('3. actor.getSkillDamageData accurately discriminates utility/interrupt actions from attacks', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 16, unenhanced: 16, mod: 4 },
          dex: { value: 14, unenhanced: 14, mod: 4 },
          con: { value: 12, unenhanced: 12, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        }
      }
    });

    // Call a Play: Contains "Roll 2d6" in notes, categorized as Combat, but has no damage
    const callAPlay = new DCCItem({
      name: 'Call a Play',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'cha',
        category: 'Combat',
        checkType: 'Standard Action (2d6)',
        notes: 'Standard Action. Encourage an ally. Roll 2d6; targeted ally adds higher d6 to upcoming Skill Check or damage roll.',
        isAttack: false,
        hasDamage: false,
        baseDamage: ''
      }
    }, actor);

    const playDmg = actor.getSkillDamageData(callAPlay);
    assert.equal(playDmg.hasDamage, false, 'Call a Play must NOT have damage despite 2d6 in notes and category: Combat');
    assert.equal(playDmg.formula, '', 'Call a Play damage formula must be empty');

    // Intervene: Contains "1d6" in checkType and notes, categorized as Combat, but has no damage
    const intervene = new DCCItem({
      name: 'Intervene',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'dex',
        category: 'Combat',
        checkType: 'Interrupt Action (1d6)',
        notes: 'Interrupt Action. Assist an ally\'s roll. Roll 1d6 and add result directly to party member\'s d20 roll.',
        isAttack: false,
        hasDamage: false,
        baseDamage: ''
      }
    }, actor);

    const intDmg = actor.getSkillDamageData(intervene);
    assert.equal(intDmg.hasDamage, false, 'Intervene must NOT have damage despite 1d6 in checkType/notes');
    assert.equal(intDmg.formula, '', 'Intervene damage formula must be empty');

    // Taunt: Switched to Combat category by player, must still return hasDamage: false
    const combatTaunt = new DCCItem({
      name: 'Taunt',
      type: 'skill',
      system: {
        rank: 2,
        stat: 'cha',
        category: 'Combat',
        checkType: 'Opposed, Interrupt',
        notes: 'Int-Opposed check to redirect Mob Attack within 30 ft away from ally onto yourself.',
        isAttack: false,
        hasDamage: false,
        baseDamage: ''
      }
    }, actor);

    const tauntDmg = actor.getSkillDamageData(combatTaunt);
    assert.equal(tauntDmg.hasDamage, false, 'Taunt in Combat category without base damage must have hasDamage: false');

    // Catcher: Switched to Combat category by player, must still return hasDamage: false
    const combatCatcher = new DCCItem({
      name: 'Catcher',
      type: 'skill',
      system: {
        rank: 3,
        stat: 'str',
        category: 'Combat',
        checkType: 'Passive, Interrupt',
        notes: 'Leap in and take damage meant for ally.',
        isAttack: false,
        hasDamage: false,
        baseDamage: ''
      }
    }, actor);

    const catcherDmg = actor.getSkillDamageData(combatCatcher);
    assert.equal(catcherDmg.hasDamage, false, 'Catcher in Combat category without base damage must have hasDamage: false');

    // Real Attack Skill: Bite (explicit base damage)
    const bite = new DCCItem({
      name: 'Bite',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        skillType: 'Strike',
        checkType: 'Melee Attack, Str',
        isAttack: true,
        hasDamage: true,
        baseDamage: '1d8 + Str Piercing'
      }
    }, actor);

    const biteDmg = actor.getSkillDamageData(bite);
    assert.equal(biteDmg.hasDamage, true, 'Bite must have damage');
    assert.equal(biteDmg.baseCount, 1);
    assert.equal(biteDmg.baseSides, 8);
    assert.equal(biteDmg.damageType, 'Piercing');
    assert.ok(biteDmg.formula.includes('1d8'));
  });

  await t.test('4. Sheet and Hotlist categorization (DCCCrawlerSheet)', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 16, unenhanced: 16, mod: 4 },
          dex: { value: 14, unenhanced: 14, mod: 4 },
          con: { value: 12, unenhanced: 12, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        hotlist: {
          slot1: 'sk-play',
          slot2: 'sk-intervene',
          slot3: 'sk-taunt',
          slot4: 'sk-catcher',
          slot5: 'sk-bite'
        }
      }
    });

    const callAPlay = new DCCItem({
      id: 'sk-play',
      _id: 'sk-play',
      name: 'Call a Play',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'cha',
        category: 'Combat',
        checkType: 'Standard Action (2d6)',
        notes: 'Roll 2d6',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const intervene = new DCCItem({
      id: 'sk-intervene',
      _id: 'sk-intervene',
      name: 'Intervene',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'dex',
        category: 'Combat',
        checkType: 'Interrupt Action (1d6)',
        notes: 'Roll 1d6',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const taunt = new DCCItem({
      id: 'sk-taunt',
      _id: 'sk-taunt',
      name: 'Taunt',
      type: 'skill',
      system: {
        rank: 2,
        stat: 'cha',
        category: 'Defensive',
        checkType: 'Opposed, Interrupt',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const catcher = new DCCItem({
      id: 'sk-catcher',
      _id: 'sk-catcher',
      name: 'Catcher',
      type: 'skill',
      system: {
        rank: 3,
        stat: 'str',
        category: 'Defensive',
        checkType: 'Passive, Interrupt',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const bite = new DCCItem({
      id: 'sk-bite',
      _id: 'sk-bite',
      name: 'Bite',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        skillType: 'Strike',
        checkType: 'Melee Attack, Str',
        isAttack: true,
        hasDamage: true,
        baseDamage: '1d8 + Str Piercing'
      }
    }, actor);

    actor.items = [callAPlay, intervene, taunt, catcher, bite];

    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    // Verify skills list isAttack derivation
    const sheetPlay = context.skills.find(s => s.name === 'Call a Play');
    assert.equal(sheetPlay.isAttack, false, 'Call a Play in sheet context must not be attack');

    const sheetIntervene = context.skills.find(s => s.name === 'Intervene');
    assert.equal(sheetIntervene.isAttack, false, 'Intervene in sheet context must not be attack');

    const sheetTaunt = context.skills.find(s => s.name === 'Taunt');
    assert.equal(sheetTaunt.isAttack, false, 'Taunt in sheet context must not be attack');

    const sheetCatcher = context.skills.find(s => s.name === 'Catcher');
    assert.equal(sheetCatcher.isAttack, false, 'Catcher in sheet context must not be attack');

    const sheetBite = context.skills.find(s => s.name === 'Bite');
    assert.equal(sheetBite.isAttack, true, 'Bite in sheet context must be attack');

    // Verify hotlist slot badges
    const slot1 = context.hotlistSlots.find(s => s.index === 1);
    assert.equal(slot1.isAttack, false, 'Hotlist Slot 1 (Call a Play) isAttack must be false');
    assert.equal(slot1.badge, 'SKILL', 'Hotlist Slot 1 (Call a Play) badge must be SKILL');

    const slot2 = context.hotlistSlots.find(s => s.index === 2);
    assert.equal(slot2.isAttack, false, 'Hotlist Slot 2 (Intervene) isAttack must be false');
    assert.equal(slot2.badge, 'SKILL', 'Hotlist Slot 2 (Intervene) badge must be SKILL');

    const slot3 = context.hotlistSlots.find(s => s.index === 3);
    assert.equal(slot3.isAttack, false, 'Hotlist Slot 3 (Taunt) isAttack must be false');
    assert.equal(slot3.badge, 'SKILL', 'Hotlist Slot 3 (Taunt) badge must be SKILL');

    const slot4 = context.hotlistSlots.find(s => s.index === 4);
    assert.equal(slot4.isAttack, false, 'Hotlist Slot 4 (Catcher) isAttack must be false');
    assert.equal(slot4.badge, 'SKILL', 'Hotlist Slot 4 (Catcher) badge must be SKILL');

    const slot5 = context.hotlistSlots.find(s => s.index === 5);
    assert.equal(slot5.isAttack, true, 'Hotlist Slot 5 (Bite) isAttack must be true');
    assert.equal(slot5.badge, 'ATTACK', 'Hotlist Slot 5 (Bite) badge must be ATTACK');
  });

  await t.test('5. Synthesized Attacks (actor.getSynthesizedAttacks) excludes non-attack skills', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { str: { mod: 4 }, dex: { mod: 4 } }
      }
    });

    const callAPlay = new DCCItem({
      id: 'sk-play',
      name: 'Call a Play',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'cha',
        category: 'Combat',
        checkType: 'Standard Action (2d6)',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const intervene = new DCCItem({
      id: 'sk-intervene',
      name: 'Intervene',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'dex',
        category: 'Combat',
        checkType: 'Interrupt Action (1d6)',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const taunt = new DCCItem({
      id: 'sk-taunt',
      name: 'Taunt',
      type: 'skill',
      system: {
        rank: 2,
        stat: 'cha',
        category: 'Defensive',
        checkType: 'Opposed, Interrupt',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const catcher = new DCCItem({
      id: 'sk-catcher',
      name: 'Catcher',
      type: 'skill',
      system: {
        rank: 3,
        stat: 'str',
        category: 'Defensive',
        checkType: 'Passive, Interrupt',
        isAttack: false,
        hasDamage: false
      }
    }, actor);

    const bite = new DCCItem({
      id: 'sk-bite',
      name: 'Bite',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        skillType: 'Strike',
        checkType: 'Melee Attack, Str',
        isAttack: true,
        hasDamage: true,
        baseDamage: '1d8 + Str Piercing'
      }
    }, actor);

    actor.items = [callAPlay, intervene, taunt, catcher, bite];

    const synthesized = actor.getSynthesizedAttacks();
    const synthMatchingNames = synthesized.map(a => a.matchingSkillName || a.name);

    assert.ok(synthMatchingNames.includes('Bite'), 'Bite must be included in synthesized attacks');
    assert.equal(synthMatchingNames.includes('Call a Play'), false, 'Call a Play must NOT be in synthesized attacks');
    assert.equal(synthMatchingNames.includes('Intervene'), false, 'Intervene must NOT be in synthesized attacks');
    assert.equal(synthMatchingNames.includes('Taunt'), false, 'Taunt must NOT be in synthesized attacks');
    assert.equal(synthMatchingNames.includes('Catcher'), false, 'Catcher must NOT be in synthesized attacks');
  });
});
