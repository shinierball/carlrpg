import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';
import { DCC_RACES } from '../src/data/races.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCCClassCreatorApp } from '../src/apps/class-creator.mjs';
import { DCCRaceCreatorApp } from '../src/apps/race-creator.mjs';

describe('DCC RPG - Wizard-Driven Race & Class Choices Subsystem', () => {

  test('1. detectChoices identifies canonical race perk choices correctly', () => {
    // A. Classic Dwarf: +3 in two different crafting Skills of your choice
    const dwarf = DCCRaceClassApplier.findRace('Dwarf, Classic');
    assert.ok(dwarf);
    const dwarfChoices = DCCRaceClassApplier.detectChoices(dwarf);
    assert.equal(dwarfChoices.length, 2, 'Classic Dwarf must have 2 choices');
    assert.equal(dwarfChoices[0].category, 'crafting');
    assert.equal(dwarfChoices[0].rank, 3);
    assert.equal(dwarfChoices[1].category, 'crafting');
    assert.equal(dwarfChoices[1].rank, 3);

    // B. Igneous: +2 in two Spells of your choice, +3 in one weapon Skill of your choice
    const igneous = DCCRaceClassApplier.findRace('Igneous');
    assert.ok(igneous);
    const igneousChoices = DCCRaceClassApplier.detectChoices(igneous);
    assert.equal(igneousChoices.length, 3, 'Igneous must have 3 choices');
    assert.equal(igneousChoices[0].type, 'spell');
    assert.equal(igneousChoices[0].rank, 2);
    assert.equal(igneousChoices[1].type, 'spell');
    assert.equal(igneousChoices[1].rank, 2);
    assert.equal(igneousChoices[2].type, 'skill');
    assert.equal(igneousChoices[2].category, 'weapon');
    assert.equal(igneousChoices[2].rank, 3);

    // C. Grulke: +3 in either Jumping or Light on Your Feet, +2 Zone of Control and Reach weapon
    const grulke = DCCRaceClassApplier.findRace('Grulke');
    assert.ok(grulke);
    const grulkeChoices = DCCRaceClassApplier.detectChoices(grulke);
    assert.equal(grulkeChoices.length, 2, 'Grulke must have 2 choices');
    assert.equal(grulkeChoices[0].category, 'options');
    assert.deepEqual(grulkeChoices[0].options, ['Jumping', 'Light on Your Feet']);
    assert.equal(grulkeChoices[0].rank, 3);
    assert.equal(grulkeChoices[1].category, 'reach_weapon');
    assert.equal(grulkeChoices[1].rank, 2);
  });

  test('2. detectChoices identifies canonical class perk choices correctly', () => {
    // A. Barbarian: +3 in a weapon Skill of your choice
    const barb = DCCRaceClassApplier.findClass('Boring Ol’ Barbarian');
    assert.ok(barb);
    const barbChoices = DCCRaceClassApplier.detectChoices(barb);
    assert.equal(barbChoices.length, 1);
    assert.equal(barbChoices[0].category, 'weapon');
    assert.equal(barbChoices[0].rank, 3);

    // B. Blade Dancer (Boring Ol' Fighter): +5 in a weapon Skill, +2 to choice of 2 combat skills
    const fighter = DCCRaceClassApplier.findClass('Boring Ol’ Fighter');
    assert.ok(fighter);
    const fighterChoices = DCCRaceClassApplier.detectChoices(fighter);
    assert.equal(fighterChoices.length, 3);
    assert.equal(fighterChoices[0].category, 'weapon');
    assert.equal(fighterChoices[0].rank, 5);
    assert.equal(fighterChoices[1].category, 'options');
    assert.equal(fighterChoices[1].rank, 2);
    assert.equal(fighterChoices[2].category, 'options');
    assert.equal(fighterChoices[2].rank, 2);
    assert.ok(fighterChoices[1].options.includes('Aiming'));
    assert.ok(fighterChoices[1].options.includes('Shield Block'));

    // C. Arcanist: +2 in a crafting Skill, +1 in a crafting Skill
    const arcanist = DCCRaceClassApplier.findClass('Boring Ol’ Arcanist');
    assert.ok(arcanist);
    const arcanistChoices = DCCRaceClassApplier.detectChoices(arcanist);
    assert.equal(arcanistChoices.length, 2);
    assert.equal(arcanistChoices[0].category, 'crafting');
    assert.equal(arcanistChoices[0].rank, 2);
    assert.equal(arcanistChoices[1].category, 'crafting');
    assert.equal(arcanistChoices[1].rank, 1);

    // D. Swashbuckler: +3 Rapier or Longsword Skill
    const swash = DCCRaceClassApplier.findClass('Swashbuckler');
    assert.ok(swash);
    const swashChoices = DCCRaceClassApplier.detectChoices(swash);
    assert.equal(swashChoices.length, 1);
    assert.deepEqual(swashChoices[0].options, ['Rapier', 'Longsword']);
    assert.equal(swashChoices[0].rank, 3);

    // E. Paladin Crusader: +3 in a weapon Skill, +2 Catcher or Shield Block
    const pal = DCCRaceClassApplier.findClass('Boring Ol’ Paladin');
    assert.ok(pal);
    const palChoices = DCCRaceClassApplier.detectChoices(pal);
    assert.equal(palChoices.length, 2);
    assert.equal(palChoices[0].category, 'weapon');
    assert.equal(palChoices[0].rank, 3);
    assert.deepEqual(palChoices[1].options, ['Catcher', 'Shield Block']);
    assert.equal(palChoices[1].rank, 2);
  });

  test('3. getCatalogOptions returns categorized lists and specific options', () => {
    const crafting = DCCRaceClassApplier.getCatalogOptions({ category: 'crafting' });
    assert.ok(crafting.includes('Smithing'));
    assert.ok(crafting.includes('Alchemy'));
    assert.ok(crafting.includes('Cooking'));

    const edged = DCCRaceClassApplier.getCatalogOptions({ category: 'edged_weapon' });
    assert.ok(edged.includes('Longsword'));
    assert.ok(edged.includes('Dagger'));
    assert.ok(!edged.includes('Bow'));

    const reach = DCCRaceClassApplier.getCatalogOptions({ category: 'reach_weapon' });
    assert.ok(reach.includes('Spear'));
    assert.ok(reach.includes('Polearm'));
    assert.ok(!reach.includes('Dagger'));

    const spells = DCCRaceClassApplier.getCatalogOptions({ category: 'spell', type: 'spell' });
    assert.ok(spells.includes('Fireball'));
    assert.ok(spells.includes('Heal'));

    const optionsList = DCCRaceClassApplier.getCatalogOptions({ category: 'options', options: ['Rapier', 'Longsword'] });
    assert.deepEqual(optionsList, ['Rapier', 'Longsword']);
  });

  test('4. resolveChoices maps user selections to structured skills and spells', () => {
    const choices = [
      { id: 'choice_0', label: 'Crafting 1', type: 'skill', rank: 3, category: 'crafting' },
      { id: 'choice_1', label: 'Crafting 2', type: 'skill', rank: 3, category: 'crafting' }
    ];

    // Array format
    const resArray = DCCRaceClassApplier.resolveChoices({}, choices, ['Smithing', 'Alchemy']);
    assert.equal(resArray.chosenSkills.length, 2);
    assert.equal(resArray.chosenSkills[0].name, 'Smithing');
    assert.equal(resArray.chosenSkills[0].rank, 3);
    assert.equal(resArray.chosenSkills[1].name, 'Alchemy');
    assert.equal(resArray.chosenSkills[1].rank, 3);

    // Object format
    const resObj = DCCRaceClassApplier.resolveChoices({}, choices, { choice_0: 'Smithing', choice_1: 'Leatherworking' });
    assert.equal(resObj.chosenSkills[0].name, 'Smithing');
    assert.equal(resObj.chosenSkills[1].name, 'Leatherworking');
  });

  test('5. Applying Dwarf, Classic prompts/applies chosen crafting skills and adds them to race definition', async () => {
    const actor = new DCCActor({
      name: 'Dwarf Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10 },
          dex: { value: 10, unenhanced: 10 },
          con: { value: 10, unenhanced: 10 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        details: { race: '', class: '' }
      }
    });

    const res = await actor.applyRace('Dwarf, Classic', {
      choices: {
        choice_0: 'Smithing',
        choice_1: 'Alchemy'
      }
    });
    assert.equal(res, true);
    assert.equal(actor.system.details.race, 'Dwarf, Classic');

    // Smithing rank 3 and Alchemy rank 3 must be embedded on actor
    const smithing = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'smithing');
    assert.ok(smithing, 'Smithing must be embedded');
    assert.equal(smithing.system.rank, 3);

    const alchemy = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'alchemy');
    assert.ok(alchemy, 'Alchemy must be embedded');
    assert.equal(alchemy.system.rank, 3);

    // Fixed race skill Endurance (+2) must also be embedded
    const endurance = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'endurance');
    assert.ok(endurance, 'Endurance must be embedded');
    assert.equal(endurance.system.rank, 2);

    // Embedded race Item document must have chosenSkills in its definition
    const raceItem = actor.items.find(i => i.type === 'race');
    assert.ok(raceItem, 'Embedded race item must exist');
    assert.ok(Array.isArray(raceItem.system.chosenSkills), 'chosenSkills must be an array on race item');
    assert.equal(raceItem.system.chosenSkills.length, 2);
    assert.equal(raceItem.system.chosenSkills[0].name, 'Smithing');
    assert.equal(raceItem.system.chosenSkills[1].name, 'Alchemy');
    assert.ok(raceItem.system.skills.some(s => s.name === 'Smithing'), 'chosen skills must be included in definition skills');

    // Clean reversal via removeRace
    await actor.removeRace();
    assert.equal(actor.system.details.race, '');
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'smithing'), undefined);
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'alchemy'), undefined);
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'endurance'), undefined);
    assert.equal(actor.items.find(i => i.type === 'race'), undefined);
  });

  test('6. Applying Igneous grants chosen spells and weapon, records on item definition, and reverses cleanly', async () => {
    const actor = new DCCActor({
      name: 'Igneous Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10 },
          dex: { value: 10, unenhanced: 10 },
          con: { value: 10, unenhanced: 10 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        details: { race: '', class: '' }
      }
    });

    const res = await actor.applyRace('Igneous', {
      choices: {
        choice_0: 'Fireball',
        choice_1: 'Heal',
        choice_2: 'Warhammer'
      }
    });
    assert.equal(res, true);

    // Spells: Fireball (Rank 2) & Heal (Rank 2)
    const fireball = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'fireball');
    assert.ok(fireball, 'Fireball spell must be granted');
    assert.equal(fireball.system.rank, 2);

    const heal = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'heal');
    assert.ok(heal, 'Heal spell must be granted');
    assert.equal(heal.system.rank, 2);

    // Weapon skill: Warhammer (Rank 3)
    const warhammer = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'warhammer');
    assert.ok(warhammer, 'Warhammer skill must be granted');
    assert.equal(warhammer.system.rank, 3);

    // Race item records chosenSpells and chosenSkills
    const raceItem = actor.items.find(i => i.type === 'race');
    assert.ok(raceItem);
    assert.equal(raceItem.system.chosenSpells.length, 2);
    assert.equal(raceItem.system.chosenSkills.length, 1);
    assert.equal(raceItem.system.chosenSkills[0].name, 'Warhammer');

    // Reversal removes them all
    await actor.removeRace();
    assert.equal(actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'fireball'), undefined);
    assert.equal(actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'heal'), undefined);
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'warhammer'), undefined);
  });

  test('7. Applying Blade Dancer grants chosen weapon + combat skills and adds to class definition', async () => {
    const actor = new DCCActor({
      name: 'Blade Dancer Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10 },
          dex: { value: 10, unenhanced: 10 },
          con: { value: 10, unenhanced: 10 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        details: { race: '', class: '' }
      }
    });

    const res = await actor.applyClass('Boring Ol’ Fighter', {
      choices: {
        choice_0: 'Longsword',
        choice_1: 'Aiming',
        choice_2: 'Shield Block'
      }
    });
    assert.equal(res, true);

    // Longsword (Rank 5)
    const sword = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'longsword');
    assert.ok(sword);
    assert.equal(sword.system.rank, 5);

    // Aiming (Rank 2) & Shield Block (Rank 2)
    const aiming = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'aiming');
    assert.ok(aiming);
    assert.equal(aiming.system.rank, 2);

    const shield = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'shield block');
    assert.ok(shield);
    assert.equal(shield.system.rank, 2);

    // Base skill Dodge (Rank 3)
    const dodge = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'dodge');
    assert.ok(dodge);
    assert.equal(dodge.system.rank, 3);

    // Class Item document contains chosenSkills in definition
    const classItem = actor.items.find(i => i.type === 'class');
    assert.ok(classItem);
    assert.equal(classItem.system.chosenSkills.length, 3);

    // Reversal cleans up
    await actor.removeClass();
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'longsword'), undefined);
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'aiming'), undefined);
    assert.equal(actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'shield block'), undefined);
  });

  test('8. promptChoicesDialog builds modal dialog and confirms user selections', async () => {
    const dwarf = DCCRaceClassApplier.findRace('Dwarf, Classic');
    const choices = DCCRaceClassApplier.detectChoices(dwarf);

    const promise = DCCRaceClassApplier.promptChoicesDialog(dwarf, choices);
    const dlg = globalThis._lastCreatedDialog;
    assert.ok(dlg, 'Dialog must be created and tracked');
    assert.ok(dlg.data.content.includes('Crafting Skill 1 (Rank 3)'));

    // Trigger confirm with mock selection html
    await dlg.triggerButton('confirm', {
      find: (sel) => {
        if (sel.includes('choice_0')) return { val: () => 'Brewing', value: 'Brewing' };
        if (sel.includes('choice_1')) return { val: () => 'Smithing', value: 'Smithing' };
        return { val: () => '', value: '' };
      }
    });

    const result = await promise;
    assert.deepEqual(result, {
      choice_0: 'Brewing',
      choice_1: 'Smithing'
    });
  });

  test('9. promptChoicesDialog cancellation returns null and aborts application cleanly', async () => {
    const actor = new DCCActor({
      name: 'Cancel Test Crawler',
      type: 'crawler',
      system: { details: { race: 'Human' } }
    });

    const dwarf = DCCRaceClassApplier.findRace('Dwarf, Classic');
    const choices = DCCRaceClassApplier.detectChoices(dwarf);

    const promise = DCCRaceClassApplier.promptChoicesDialog(dwarf, choices);
    const dlg = globalThis._lastCreatedDialog;
    assert.ok(dlg);

    // Trigger cancel button
    await dlg.triggerButton('cancel');
    const result = await promise;
    assert.equal(result, null);
  });

  test('10. Point Builder (DCCClassCreatorApp) applies choices and records them on class definition', async () => {
    const actor = new DCCActor({
      name: 'Builder Target Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10 },
          dex: { value: 10, unenhanced: 10 },
          con: { value: 10, unenhanced: 10 },
          int: { value: 10, unenhanced: 10 },
          cha: { value: 10, unenhanced: 10 }
        },
        details: { class: '' }
      }
    });

    const builder = new DCCClassCreatorApp();
    builder.name = 'Arcane Crafter';
    builder.skills = [
      { name: 'Crafting Skill (Choice)', rank: 3, isPassive: false }
    ];

    const created = await builder.applyToActor(actor, {
      choices: {
        choice_0: 'Smithing'
      }
    });

    assert.ok(created, 'Class item must be created on actor');
    assert.equal(created.system.chosenSkills.length, 1);
    assert.equal(created.system.chosenSkills[0].name, 'Smithing');
    assert.equal(created.system.chosenSkills[0].rank, 3);

    // Skill granted to actor at rank 3
    const smith = actor.items.find(i => i.type === 'skill' && i.name.toLowerCase() === 'smithing');
    assert.ok(smith, 'Smithing skill must be embedded on actor');
    assert.equal(smith.system.rank, 3);
  });

});
