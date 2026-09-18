import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { exportCrawlerToPdf, saveCrawlerPdf } from '../src/apps/pdf-exporter.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { PDFDocument } from '../lib/pdf-lib.mjs';

describe('DCC RPG Fillable Character Sheet PDF Export', () => {
  let sampleCrawler;

  before(() => {
    sampleCrawler = {
      name: 'Carl the Primal',
      system: {
        details: {
          race: 'Human',
          gender: 'Male (He/Him)',
          level: 7,
          crawlerNumber: '#83921',
          class: 'Primal Brawler',
          floor: '4th Floor (The Iron Tangle)',
          popularity: 'Top 10 Global (#6)',
          pastTrauma: 'Loss of Bea, betrayal by manager',
          looseEnds: 'Find Donut, deal with Quan Ch',
          regrets: 'Not grabbing pants before running outside',
          notes: 'Keep barefoot for brawler bonus',
          importantKills: 'Goblin Warlord\nOrc Blood-Reaver\nArmored Centipede\nAutomated Excavator',
          clubsSocieties: 'Royal Court of Earth\nDungeon Survivor Alliance',
          personalSpace: {
            tier: 'Tier 3 (Deluxe)',
            size: 'Double Suite',
            amenities: 'King size plush bed\nFully stocked mini-bar\nAuto-chef unit\nCat climbing tower'
          },
          deity: 'None (Atheist Survivalist)',
          racialAbilities: 'Adaptive Survival: +1 to all saves\nStubborn Grit: Ignore first wound penalty',
          classAbilities: 'Primal Rage: Double melee damage when below 25% HP\nBarefoot Brawler: +2 to-hit and +3 damage when unarmored on feet\nEarthquake Stomp: 10ft shockwave'
        },
        abilities: {
          str: { value: 50, unenhanced: 45, mod: 6 },
          int: { value: 24, unenhanced: 20, mod: 5 },
          con: { value: 14, unenhanced: 14, mod: 4 },
          dex: { value: 8, unenhanced: 8, mod: 3 },
          cha: { value: 4, unenhanced: 4, mod: 2 }
        },
        attributes: {
          hp: { value: 40, max: 40, pct: 100 },
          mana: { value: 18, max: 24 },
          evade: { buffs: 2, total: 5 },
          dr: { armor: 4, buffs: 2, total: 6 },
          speed: { move: 25, step: 10 },
          aiFavor: 8,
          size: 'Medium',
          debuffs: 'Slightly Singed (-1 DR)',
          externalBuffs: {
            buff1: 'Iron Skin (+2 DR)',
            buff2: 'Adrenaline Rush (+5 Move)',
            buff3: 'Warm Soup (+10 Max HP)'
          }
        },
        gearSlots: {
          head: 'Enchanted Spiked Helmet',
          torso: 'Reinforced Brawler Vest',
          arms: 'Heavy Leather Bracers',
          hands: 'Spiked Knuckles of Striking',
          legs: 'Sturdy Cargo Boxer Shorts',
          feet: 'None (Barefoot)',
          accessories: 'Enchanted Gold Ring\nAmulet of Health'
        },
        hotlist: {
          slot1: 'Primal Punch',
          slot2: 'Thunderous Stomp',
          slot3: 'Heal',
          slot4: 'Mega Potion',
          slot5: 'Shield Block',
          slot6: 'Dirty Kick',
          slot7: 'Catnip Bomb',
          slot8: 'Flash Grenade',
          slot9: 'Emergency Teleport',
          slot10: 'Rest and Recover'
        },
        pet: {
          name: 'Princess Donut',
          level: 6,
          abilities: {
            str: { value: 8 },
            int: { value: 16 },
            con: { value: 12 },
            dex: { value: 18 },
            cha: { value: 20 }
          },
          attributes: {
            dr: { total: 2 },
            evade: { total: 16 },
            speed: { move: 30 },
            size: 'Small'
          },
          attack1: 'Magic Missile (3d6)',
          attack2: 'Vicious Screech',
          special: 'Show Cat Persona: Demoralize enemies'
        },
        mount_vehicle: {
          size: 'Large',
          move: 45,
          occupants: '2 Crawlers',
          dr: 8,
          accessories: 'Turbo Boost Exhaust, Reinforced Ramming Bumper'
        }
      },
      items: [
        // Attacks
        {
          type: 'attack',
          name: 'Primal Punch',
          system: { rank: 5, toHitMod: 6, damageDice: '2d6', damageMod: 6, effects: 'Knockback 5ft' }
        },
        {
          type: 'attack',
          name: 'Thunderous Stomp',
          system: { rank: 4, toHitMod: 6, damageDice: '1d10', damageMod: 6, effects: 'Stun DC 14' }
        },
        {
          type: 'attack',
          name: 'Catnip Grenade',
          system: { rank: 2, toHitMod: 2, damageDice: '3d6', damageMod: 0, effects: 'AOE Fire + Confusion' }
        },
        // Skills
        {
          type: 'skill',
          name: 'Brawling',
          system: { rank: 5, stat: 'str', statMod: 6, checkType: 'Attack', description: 'Unarmed melee mastery' }
        },
        {
          type: 'skill',
          name: 'Athletics',
          system: { rank: 4, stat: 'str', statMod: 6, checkType: 'Physical', description: 'Climbing and jumping' }
        },
        {
          type: 'skill',
          name: 'Acrobatics',
          system: { rank: 3, stat: 'dex', statMod: 3, checkType: 'Agility', description: 'Tumbling and balance' }
        },
        {
          type: 'skill',
          name: 'Demolitions',
          system: { rank: 4, stat: 'int', statMod: 5, checkType: 'Utility', description: 'Crafting explosive charges' }
        },
        // Known Spells (appended to Skills table on Page 3)
        {
          type: 'spell',
          name: 'Magic Missile',
          system: {
            rank: 3,
            stat: 'int',
            manaCost: 4,
            spellType: 'Attack',
            baseDamage: '3d6',
            damageType: 'Magic',
            range: '60 feet',
            description: 'Fires glowing magical darts.'
          }
        },
        {
          type: 'spell',
          name: 'Heal',
          system: {
            rank: 2,
            stat: 'cha',
            manaCost: 2,
            spellType: 'Healing',
            baseDamage: '2 Health Bar slots',
            description: 'Restores up to 2 health bar slots.'
          }
        },
        // Inventory Gear & Loot
        {
          type: 'gear',
          name: 'Healing Salve',
          system: { quantity: 4, description: 'Restores 15 HP over 3 rounds' }
        },
        {
          type: 'loot',
          name: 'Dungeon Credit Voucher',
          system: { quantity: 250, description: 'Direct dungeon tokens' }
        },
        // Sponsors
        {
          type: 'sponsor',
          name: 'Desperado Energy',
          system: { description: 'Sponsors extreme combat moments with stamina buffs' }
        },
        {
          type: 'sponsor',
          name: 'Overcooked Pizza Co.',
          system: { description: 'Sends hot cheese bombs when crawler survives high hazard traps' }
        }
      ]
    };
  });

  it('1. Loads template PDF and outputs a valid 6-page filled PDF document', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    assert.ok(pdfBytes instanceof Uint8Array, 'exportCrawlerToPdf returns a Uint8Array');
    assert.ok(pdfBytes.length > 100000, 'Exported PDF contains complete document bytes');

    const doc = await PDFDocument.load(pdfBytes);
    assert.equal(doc.getPageCount(), 6, 'PDF contains exactly 6 pages');
  });

  it('2. Populates Page 1: Identity, ability scores, HP threshold bars, combat totals, and attacks', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Identity
    assert.equal(form.getTextField('Name').getText(), 'Carl the Primal');
    assert.equal(form.getTextField('Race').getText(), 'Human');
    assert.equal(form.getTextField('Gender').getText(), 'Male (He/Him)');
    assert.equal(form.getTextField('level').getText(), '7');
    assert.equal(form.getTextField('crawler number').getText(), '#83921');
    assert.equal(form.getTextField('class').getText(), 'Primal Brawler');
    assert.equal(form.getTextField('Floor').getText(), '4th Floor (The Iron Tangle)');

    // Ability scores (STR, INT, CON, DEX, CHA)
    assert.equal(form.getTextField('Text Field 21').getText(), '50', 'STR Enhanced');
    assert.equal(form.getTextField('Text Field 22').getText(), '45', 'STR Unenhanced');
    assert.equal(form.getTextField('Text Field 23').getText(), '+6', 'STR Mod');

    assert.equal(form.getTextField('Text Field 34').getText(), '24', 'INT Enhanced');
    assert.equal(form.getTextField('Text Field 35').getText(), '20', 'INT Unenhanced');
    assert.equal(form.getTextField('Text Field 36').getText(), '+5', 'INT Mod');

    assert.equal(form.getTextField('Text Field 43').getText(), '14', 'CON Enhanced');
    assert.equal(form.getTextField('Text Field 45').getText(), '+4', 'CON Mod');

    assert.equal(form.getTextField('Text Field 46').getText(), '8', 'DEX Enhanced');
    assert.equal(form.getTextField('Text Field 48').getText(), '+3', 'DEX Mod');

    assert.equal(form.getTextField('Text Field 49').getText(), '4', 'CHA Enhanced');
    assert.equal(form.getTextField('Text Field 51').getText(), '+2', 'CHA Mod');

    // Health Bar (10% to 100% capacity and check state)
    // Each of the 10 boxes displays the CON Mod (e.g. 4 for Carl), with checkboxes left blank for play
    assert.equal(form.getTextField('10').getText(), '4', '10% box displays CON Mod 4');
    assert.equal(form.getTextField('50').getText(), '4', '50% box displays CON Mod 4');
    assert.equal(form.getTextField('100').getText(), '4', '100% box displays CON Mod 4');
    assert.equal(form.getCheckBox('Check Box6 2').isChecked(), false, '10% checkbox is unchecked');
    assert.equal(form.getCheckBox('Check Box6 1 8').isChecked(), false, '100% checkbox is unchecked');

    // Evade and Damage Resistance
    assert.equal(form.getTextField('Text Field 24').getText(), '+3', 'Evade DEX mod');
    assert.equal(form.getTextField('Text Field 25').getText(), '2', 'Evade Buffs');
    assert.equal(form.getTextField('Text Field 26').getText(), '5', 'Evade Total');
    assert.equal(form.getTextField('Text Field 27').getText(), '25', 'Speed Move');
    assert.equal(form.getTextField('Text Field 28').getText(), '10', 'Speed Step');

    assert.equal(form.getTextField('Text Field 29').getText(), '4', 'DR Armor');
    assert.equal(form.getTextField('Text Field 30').getText(), '2', 'DR Buffs');
    assert.equal(form.getTextField('Text Field 31').getText(), '6', 'DR Total');
    assert.equal(form.getTextField('Text Field 32').getText(), '8', 'AI Favor');
    assert.equal(form.getTextField('Text Field 33').getText(), 'Medium', 'Size');

    // Mana & Debuffs & External Buffs
    assert.equal(form.getTextField('Text Field 38').getText(), '24', 'Max Mana');
    assert.equal(form.getTextField('Text Field 37').getText(), '18', 'Current Mana');
    assert.equal(form.getTextField('Text Field 39').getText(), 'Slightly Singed (-1 DR)');
    assert.equal(form.getTextField('Text Field 40').getText(), 'Iron Skin (+2 DR)');
    assert.equal(form.getTextField('Text Field 41').getText(), 'Adrenaline Rush (+5 Move)');
    assert.equal(form.getTextField('Text Field 42').getText(), 'Warm Soup (+10 Max HP)');

    // Attacks (Row 1 & Row 2)
    assert.equal(form.getTextField('Text Field 55').getText(), 'Primal Punch');
    assert.equal(form.getTextField('Text Field 551').getText(), '5', 'Attack 1 Rank');
    assert.equal(form.getTextField('Text Field 52').getText(), '+6', 'Attack 1 to-hit mod');
    assert.equal(form.getTextField('Text Field 53').getText(), '2d6', 'Attack 1 damage dice');
    assert.equal(form.getTextField('Text Field 54').getText(), '+6', 'Attack 1 damage mod');
    assert.equal(form.getTextField('Text Field 56').getText(), 'Knockback 5ft');

    assert.equal(form.getTextField('Text Field 61').getText(), 'Thunderous Stomp');
    assert.equal(form.getTextField('Text Field 58').getText(), '1d10');
  });

  it('3. Populates Page 2: Hotlist (10 slots), Gear Slots, and Character Details', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Hotlist
    assert.equal(form.getTextField('Text Field 81').getText(), 'Primal Punch [2d6]', 'Slot 1 formats attack damage');
    assert.equal(form.getTextField('Text Field 82').getText(), 'Thunderous Stomp [1d10]');
    assert.equal(form.getTextField('Text Field 83').getText(), 'Heal (2 MP)', 'Slot 3 formats spell mana cost');
    assert.equal(form.getTextField('Text Field 90').getText(), 'Rest and Recover', 'Slot 10');

    // Gear Slots
    assert.equal(form.getTextField('Text Field 92').getText(), 'Enchanted Spiked Helmet', 'Head');
    assert.equal(form.getTextField('Text Field 93').getText(), 'Reinforced Brawler Vest', 'Torso');
    assert.equal(form.getTextField('Text Field 94').getText(), 'Heavy Leather Bracers', 'Arms');
    assert.equal(form.getTextField('Text Field 95').getText(), 'Spiked Knuckles of Striking', 'Hands');
    assert.equal(form.getTextField('Text Field 96').getText(), 'Sturdy Cargo Boxer Shorts', 'Legs');
    assert.equal(form.getTextField('Text Field 97').getText(), 'None (Barefoot)', 'Feet');
    assert.equal(form.getTextField('Text Field 91').getText(), 'Enchanted Gold Ring\nAmulet of Health', 'Accessories');

    // Notes
    assert.equal(form.getTextField('Text Field 98').getText(), 'Top 10 Global (#6)', 'Popularity');
    assert.equal(form.getTextField('Text Field 99').getText(), 'Loss of Bea, betrayal by manager', 'Past Trauma');
    assert.equal(form.getTextField('Text Field 100').getText(), 'Find Donut, deal with Quan Ch', 'Loose Ends');
    assert.equal(form.getTextField('Text Field 101').getText(), 'Not grabbing pants before running outside', 'Regrets');
    assert.equal(form.getTextField('Text Field 102').getText(), 'Keep barefoot for brawler bonus', 'Notes');
  });

  it('4. Populates Page 3: Skills table with ranks, stats, check types, and checkboxes', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Skill 1: Brawling
    assert.equal(form.getTextField('Text Field 103').getText(), 'Brawling');
    assert.equal(form.getTextField('Text Field 104').getText(), '5');
    assert.equal(form.getTextField('Text Field 105').getText(), 'STR +6');
    assert.equal(form.getTextField('Text Field 106').getText(), 'Attack');
    assert.equal(form.getTextField('Text Field 107').getText(), 'Unarmed melee mastery');
    assert.equal(form.getCheckBox('Check Box 1').isChecked(), true);

    // Skill 2: Athletics
    assert.equal(form.getTextField('Text Field 109').getText(), 'Athletics');
    assert.equal(form.getTextField('Text Field 110').getText(), '4');
    assert.equal(form.getTextField('Text Field 111').getText(), 'STR +6');
    assert.equal(form.getTextField('Text Field 112').getText(), 'Physical');
    assert.equal(form.getCheckBox('Check Box 2').isChecked(), true);

    // Skill 3: Acrobatics
    assert.equal(form.getTextField('Text Field 115').getText(), 'Acrobatics');
    assert.equal(form.getTextField('Text Field 117').getText(), 'DEX +3');

    // Skill 4: Demolitions
    assert.equal(form.getTextField('Text Field 121').getText(), 'Demolitions');
    assert.equal(form.getTextField('Text Field 122').getText(), '4');
    assert.equal(form.getTextField('Text Field 123').getText(), 'INT +5');

    // Appended Spell 1 (Row 4): Magic Missile
    assert.equal(form.getTextField('Text Field 127').getText(), 'Magic Missile');
    assert.equal(form.getTextField('Text Field 128').getText(), '3');
    assert.equal(form.getTextField('Text Field 129').getText(), 'INT +5');
    assert.equal(form.getTextField('Text Field 130').getText(), 'Spell: Attack (4 MP)');
    assert.match(form.getTextField('Text Field 131').getText(), /3d6 Magic/);
    assert.equal(form.getCheckBox('Check Box 5').isChecked(), true);

    // Appended Spell 2 (Row 5): Heal
    assert.equal(form.getTextField('Text Field 133').getText(), 'Heal');
    assert.equal(form.getTextField('Text Field 134').getText(), '2');
    assert.equal(form.getTextField('Text Field 135').getText(), 'CHA +2');
    assert.equal(form.getTextField('Text Field 136').getText(), 'Spell: Healing (2 MP)');
    assert.match(form.getTextField('Text Field 137').getText(), /2 Health Bar slots/);
    assert.equal(form.getCheckBox('Check Box 6').isChecked(), true);
  });

  it('5. Populates Page 4: Inventory table with items, quantities, and descriptions', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Item 1: Healing Salve
    assert.equal(form.getTextField('Text Field 223').getText(), 'Healing Salve');
    assert.equal(form.getTextField('Text Field 224').getText(), '4');
    assert.equal(form.getTextField('Text Field 225').getText(), 'Restores 15 HP over 3 rounds');

    // Item 2: Dungeon Credit Voucher
    assert.equal(form.getTextField('Text Field 226').getText(), 'Dungeon Credit Voucher');
    assert.equal(form.getTextField('Text Field 227').getText(), '250');
  });

  it('6. Populates Page 5: Extras (Pet, Mount, Kills, Clubs, Space, Deity)', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Pet stats
    assert.equal(form.getTextField('Text Field 3075').getText(), '6', 'Pet Level');
    assert.equal(form.getTextField('Text Field 3074').getText(), '8', 'Pet STR');
    assert.equal(form.getTextField('Text Field 3076').getText(), '16', 'Pet INT');
    assert.equal(form.getTextField('Text Field 3080').getText(), '18', 'Pet DEX');
    assert.equal(form.getTextField('Text Field 3082').getText(), '20', 'Pet CHA');
    assert.equal(form.getTextField('Text Field 3077').getText(), '2', 'Pet DR');
    assert.equal(form.getTextField('Text Field 3079').getText(), '16', 'Pet Evade');
    assert.equal(form.getTextField('Text Field 3084').getText(), 'Magic Missile (3d6)', 'Pet Attack 1');
    assert.equal(form.getTextField('Text Field 3086').getText(), 'Show Cat Persona: Demoralize enemies', 'Pet Special');

    // Mount
    assert.equal(form.getTextField('Text Field 3098').getText(), 'Large');
    assert.equal(form.getTextField('Text Field 3099').getText(), '45');
    assert.equal(form.getTextField('Text Field 30100').getText(), '2 Crawlers');
    assert.equal(form.getTextField('Text Field 30101').getText(), '8');
    assert.equal(form.getTextField('Text Field 30102').getText(), 'Turbo Boost Exhaust, Reinforced Ramming Bumper');

    // Important Kills
    assert.equal(form.getTextField('Text Field 30103').getText(), 'Goblin Warlord');
    assert.equal(form.getTextField('Text Field 30104').getText(), 'Orc Blood-Reaver');
    assert.equal(form.getTextField('Text Field 30105').getText(), 'Armored Centipede');
    assert.equal(form.getTextField('Text Field 30106').getText(), 'Automated Excavator');

    // Clubs
    assert.equal(form.getTextField('Text Field 301016').getText(), 'Royal Court of Earth');
    assert.equal(form.getTextField('Text Field 301017').getText(), 'Dungeon Survivor Alliance');

    // Personal Space
    assert.equal(form.getTextField('Text Field 301022').getText(), 'Tier 3 (Deluxe)');
    assert.equal(form.getTextField('Text Field 301023').getText(), 'Double Suite');
    assert.equal(form.getTextField('Text Field 301024').getText(), 'King size plush bed');
    assert.equal(form.getTextField('Text Field 301025').getText(), 'Fully stocked mini-bar');

    // Deity
    assert.equal(form.getTextField('Text Field 301035').getText(), 'None (Atheist Survivalist)');
  });

  it('7. Populates Page 6: Racial Abilities, Class Abilities, and Sponsors', async () => {
    const pdfBytes = await exportCrawlerToPdf(sampleCrawler);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    // Racial Abilities (even numbers: 301036, 301038)
    assert.equal(form.getTextField('Text Field 301036').getText(), 'Adaptive Survival: +1 to all saves');
    assert.equal(form.getTextField('Text Field 301038').getText(), 'Stubborn Grit: Ignore first wound penalty');

    // Class Abilities (odd numbers: 301037, 301039, 301041)
    assert.equal(form.getTextField('Text Field 301037').getText(), 'Primal Rage: Double melee damage when below 25% HP');
    assert.equal(form.getTextField('Text Field 301039').getText(), 'Barefoot Brawler: +2 to-hit and +3 damage when unarmored on feet');
    assert.equal(form.getTextField('Text Field 301041').getText(), 'Earthquake Stomp: 10ft shockwave');

    // Sponsors
    assert.ok(form.getTextField('Text Field 301080').getText().includes('Desperado Energy'));
    assert.ok(form.getTextField('Text Field 301081').getText().includes('Overcooked Pizza Co.'));
  });

  it('8. DCCCrawlerSheet integrates Save to PDF action and header buttons', async () => {
    const sheet = new DCCCrawlerSheet(sampleCrawler);
    const buttons = sheet._getHeaderButtons();
    const pdfButton = buttons.find(b => b.class === 'save-pdf-btn' || b.label === 'Save to PDF');

    assert.ok(pdfButton, 'Sheet header includes Save to PDF button');
    assert.equal(pdfButton.label, 'Save to PDF');
    assert.equal(pdfButton.icon, 'fa-solid fa-file-pdf');

    // Test sheet._onExportPdf invocation
    let exportedBytes = null;
    const origSave = globalThis.saveDataToFile;
    try {
      globalThis.saveDataToFile = (blob, type, filename) => {
        exportedBytes = blob;
        return filename;
      };
      await sheet._onExportPdf();
      assert.ok(exportedBytes, 'saveDataToFile was called with exported document blob');
    } finally {
      globalThis.saveDataToFile = origSave;
    }
  });

  it('9. Resolves external buff IDs/hashes into readable descriptions instead of raw IDs', async () => {
    const crawlerWithBuffIds = {
      name: 'Buffed Crawler',
      system: {
        attributes: {
          hp: { max: 40, value: 40 },
          externalBuffs: {
            buff1: 'dccbuf0000000001', // Strength Buff
            buff2: 'dccbuf0000000006', // Temporary Health Buff
            buff3: 'dccbuf0000000007'  // Acid Resistance Buff
          }
        },
        hotlist: {
          slot1: 'dccbuf0000000001' // Also in hotlist
        }
      },
      items: []
    };

    const pdfBytes = await exportCrawlerToPdf(crawlerWithBuffIds);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();

    const field40 = form.getTextField('Text Field 40').getText();
    const field41 = form.getTextField('Text Field 41').getText();
    const field42 = form.getTextField('Text Field 42').getText();
    const hotlist1 = form.getTextField('Text Field 81').getText();

    assert.equal(field40, '+2 Strength Buff', 'Buff 1 resolved to readable name instead of dccbuf0000000001');
    assert.equal(field41, '+10 Temp HP', 'Buff 2 resolved to readable name instead of dccbuf0000000006');
    assert.equal(field42, 'Resist Acid (50%)', 'Buff 3 resolved to readable name instead of dccbuf0000000007');
    assert.equal(hotlist1, '+2 Strength Buff', 'Hotlist 1 resolved to readable buff description');
  });
});
