import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';
import { DCCRaceCreatorApp } from '../src/apps/race-creator.mjs';
import { DCCClassCreatorApp } from '../src/apps/class-creator.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG - Perks and Detriments in Race and Class Definitions', () => {

  test('1. extractPerksAndDetriments extracts benefits and detriments cleanly', () => {
    // A. Cat: Night Vision, Advantage on Cat-like Reflexes vs Claws disadvantage and Dog vulnerability
    const cat = DCCRaceClassApplier.findRace('Cat');
    assert.ok(cat);
    const catPD = DCCRaceClassApplier.extractPerksAndDetriments(cat);
    assert.ok(catPD.perks.some(p => p.toLowerCase().includes('darkness')));
    assert.ok(catPD.perks.some(p => p.toLowerCase().includes('cat-like reflexes')));
    assert.ok(catPD.detriments.some(d => d.toLowerCase().includes('dogs and beasts')));

    // B. Igneous: Compound line "Immunity to Fire damage, and vulnerable to Ice damage" cleanly split
    const igneous = DCCRaceClassApplier.findRace('Igneous');
    assert.ok(igneous);
    const igneousPD = DCCRaceClassApplier.extractPerksAndDetriments(igneous);
    assert.ok(igneousPD.perks.some(p => p.includes('Immunity to Fire damage')));
    assert.ok(igneousPD.detriments.some(d => d.includes('Vulnerable to Ice damage')));
    assert.ok(igneousPD.detriments.some(d => d.toLowerCase().includes('conceal') && d.toLowerCase().includes('stealth')));

    // C. Custom Builder data with selected and custom benefits/detriments
    const builderData = {
      selectedBenefits: [{ name: 'Acid Breath', customText: 'Acid Breath (5ft Cone)' }],
      customBenefits: [{ name: 'Prehensile Tail' }],
      selectedDetriments: [{ name: 'Sunlight Sensitivity' }],
      customDetriments: [{ name: 'Claustrophobia' }]
    };
    const bPD = DCCRaceClassApplier.extractPerksAndDetriments(builderData);
    assert.deepEqual(bPD.perks, ['Acid Breath (5ft Cone)', 'Prehensile Tail']);
    assert.deepEqual(bPD.detriments, ['Sunlight Sensitivity', 'Claustrophobia']);
  });

  test('2. promptPerksDetrimentsDialog renders modal checkboxes and handles confirm & cancel', async () => {
    const cat = DCCRaceClassApplier.findRace('Cat');
    const { perks, detriments } = DCCRaceClassApplier.extractPerksAndDetriments(cat);

    // Test A: Confirm selection
    const promiseA = DCCRaceClassApplier.promptPerksDetrimentsDialog(cat, { perks, detriments });
    const dlgA = globalThis._lastCreatedDialog;
    assert.ok(dlgA, 'Dialog must be created');
    assert.ok(dlgA.data.content.includes('PERKS &amp; BENEFITS'));
    assert.ok(dlgA.data.content.includes('DETRIMENTS &amp; DRAWBACKS'));

    // Trigger confirm with default checked values
    await dlgA.triggerButton('apply');
    const resA = await promiseA;
    assert.ok(resA);
    assert.ok(Array.isArray(resA.chosenPerks));
    assert.ok(Array.isArray(resA.chosenDetriments));
    assert.ok(resA.chosenPerks.length > 0);
    assert.ok(resA.chosenDetriments.length > 0);

    // Test B: Cancel selection returns null
    const promiseB = DCCRaceClassApplier.promptPerksDetrimentsDialog(cat, { perks, detriments });
    const dlgB = globalThis._lastCreatedDialog;
    assert.ok(dlgB);
    await dlgB.triggerButton('cancel');
    const resB = await promiseB;
    assert.equal(resB, null, 'Cancelled dialog returns null');
  });

  test('3. applyRace applies chosen perks & detriments, updates actor details, and embeds race item', async () => {
    const actor = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium', speed: { move: 20 } },
        abilities: {
          str: { value: 6, unenhanced: 6, mod: 3 },
          dex: { value: 16, unenhanced: 16, mod: 4 },
          con: { value: 8, unenhanced: 8, mod: 3 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 16, unenhanced: 16, mod: 4 }
        },
        details: { race: '', class: '', raceAbilities: '' }
      }
    });

    // Apply Cat race with explicit chosen perks and detriments
    const success = await actor.applyRace('Cat', {
      chosenPerks: ['Advantage on Cat-like Reflexes Skill Checks'],
      chosenDetriments: ['Claws: Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination']
    });
    assert.equal(success, true);
    assert.equal(actor.system.details.race, 'Cat');
    assert.ok(actor.system.details.raceAbilities.includes('Cat-like Reflexes'));
    assert.ok(actor.system.details.raceAbilities.includes('Claws'));

    // Condition items created
    const buff = actor.items.find(i => i.type === 'buff' && i.getFlag('carl-rpg', 'grantedBy') === 'race');
    assert.ok(buff, 'Advantage buff should be created');
    assert.equal(buff.getFlag('carl-rpg', 'isAdvantage'), true);

    const debuff = actor.items.find(i => i.type === 'debuff' && i.getFlag('carl-rpg', 'grantedBy') === 'race');
    assert.ok(debuff, 'Disadvantage debuff should be created');
    assert.equal(debuff.getFlag('carl-rpg', 'isDisadvantage'), true);

    // Embedded race item document contains perks and chosenPerks
    const raceItem = actor.items.find(i => i.type === 'race');
    assert.ok(raceItem);
    assert.deepEqual(raceItem.system.chosenPerks, ['Advantage on Cat-like Reflexes Skill Checks']);
    assert.deepEqual(raceItem.system.chosenDetriments, ['Claws: Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination']);

    // Check appliedRace flag
    const appliedFlag = actor.getFlag('carl-rpg', 'appliedRace');
    assert.ok(appliedFlag);
    assert.deepEqual(appliedFlag.chosenPerks, ['Advantage on Cat-like Reflexes Skill Checks']);
    assert.deepEqual(appliedFlag.chosenDetriments, ['Claws: Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination']);
  });

  test('4. Interactive applyRace cancels cleanly when user cancels perks dialog', async () => {
    const actor = new DCCActor({
      name: 'Uncommitted Crawler',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium' },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: { race: '', class: '', raceAbilities: '' }
      }
    });

    // Start interactive application of Igneous
    const applyPromise = DCCRaceClassApplier.applyRace(actor, 'Igneous', {
      interactive: true,
      skipDialog: true // skip choices dialog to hit perks dialog
    });

    const dlg = globalThis._lastCreatedDialog;
    assert.ok(dlg, 'Perks dialog should be prompted');
    // User cancels the dialog
    await dlg.triggerButton('cancel');

    const result = await applyPromise;
    assert.equal(result, false, 'applyRace should abort when user cancels dialog');
    assert.equal(actor.system.details.race, '', 'Actor race must remain unmodified');
    assert.equal(actor.items.length, 0, 'No items should be created on cancel');
  });

  test('5. Point Builder prompts for and applies perks and detriments to actor', async () => {
    const builder = new DCCRaceCreatorApp();
    builder.name = 'Cyber-Gnome';
    builder.selectedBenefits = [{ id: 'b1', name: 'Darkvision (60ft)', cost: 1 }];
    builder.selectedDetriments = [{ id: 'd1', name: 'Cold-Blooded Torpor', extraPoints: 1 }];

    const actor = new DCCActor({
      name: 'Gnome Tester',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium' },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: { race: '', class: '', raceAbilities: '' }
      }
    });

    // Apply with pre-chosen perks
    const createdItem = await builder.applyToActor(actor, {
      chosenPerks: ['Darkvision (60ft)'],
      chosenDetriments: ['Cold-Blooded Torpor']
    });
    assert.ok(createdItem);
    assert.equal(actor.system.details.race, 'Cyber-Gnome');
    assert.equal(actor.system.details.raceAbilities, 'Darkvision (60ft); Cold-Blooded Torpor');

    const raceDoc = actor.items.find(i => i.type === 'race');
    assert.ok(raceDoc);
    assert.deepEqual(raceDoc.system.chosenPerks, ['Darkvision (60ft)']);
    assert.deepEqual(raceDoc.system.chosenDetriments, ['Cold-Blooded Torpor']);
  });

  test('6. syncPerksAndDetriments re-configures active perks and detriments from sheet', async () => {
    const actor = new DCCActor({
      name: 'Resync Character',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium' },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: { race: 'Cat', class: '', raceAbilities: '' }
      }
    });

    // Initial race application
    await actor.applyRace('Cat', {
      chosenPerks: ['Advantage on Cat-like Reflexes Skill Checks'],
      chosenDetriments: ['Claws: Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination']
    });

    assert.equal(actor.items.filter(i => i.type === 'buff').length, 1);
    assert.equal(actor.items.filter(i => i.type === 'debuff').length, 1);

    // Re-sync: remove the debuff, keep the buff
    const syncSuccess = await DCCRaceClassApplier.syncPerksAndDetriments(
      actor,
      'race',
      ['Advantage on Cat-like Reflexes Skill Checks'],
      [] // Empty detriments
    );
    assert.equal(syncSuccess, true);

    // Debuff should be gone, buff should remain
    assert.equal(actor.items.filter(i => i.type === 'buff').length, 1);
    assert.equal(actor.items.filter(i => i.type === 'debuff').length, 0);

    const raceDoc = actor.items.find(i => i.type === 'race');
    assert.deepEqual(raceDoc.system.chosenDetriments, []);
    assert.equal(actor.system.details.raceAbilities, 'Advantage on Cat-like Reflexes Skill Checks');
  });

  test('7. removeRace and removeClass cleanly delete all condition items and clear ability strings', async () => {
    const actor = new DCCActor({
      name: 'Reversal Tester',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium' },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: { race: '', class: '', raceAbilities: '', classAbilities: '' }
      }
    });

    await actor.applyRace('Cat');
    assert.ok(actor.items.some(i => i.type === 'buff' && i.getFlag('carl-rpg', 'grantedBy') === 'race'));
    assert.ok(actor.items.some(i => i.type === 'debuff' && i.getFlag('carl-rpg', 'grantedBy') === 'race'));

    // Remove race
    await actor.removeRace();
    assert.equal(actor.system.details.race, '');
    assert.equal(actor.system.details.raceAbilities, '');
    assert.equal(actor.items.filter(i => i.getFlag('carl-rpg', 'grantedBy') === 'race').length, 0);
  });

  test('8. Character sheet renders manage perks buttons and handles click listeners', async () => {
    const actor = new DCCActor({
      name: 'Sheet Tester',
      type: 'crawler',
      system: {
        attributes: { size: 'Medium' },
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 },
          con: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 },
          cha: { value: 10, unenhanced: 10, mod: 4 }
        },
        details: { race: 'Cat', class: '', raceAbilities: 'Feline Reflexes' }
      }
    });

    await actor.applyRace('Cat');
    const sheet = new DCCCrawlerSheet(actor);

    // Mock HTML with buttons
    let dialogTriggered = false;
    const fakeHtml = {
      find: (sel) => {
        if (sel === '.dcc-manage-race-perks-btn') {
          return {
            click: (handler) => {
              // Trigger handler
              handler({ preventDefault: () => {} });
              dialogTriggered = true;
            }
          };
        }
        return {
          click: () => {},
          change: () => {},
          on: () => {},
          val: () => '',
          each: () => {}
        };
      }
    };

    sheet.activateListeners(fakeHtml);
    assert.equal(dialogTriggered, true, 'Clicking manage race perks button must trigger the handler');
    const dlg = globalThis._lastCreatedDialog;
    assert.ok(dlg, 'Dialog must be opened by the sheet listener');
    await dlg.triggerButton('apply');
  });

});
