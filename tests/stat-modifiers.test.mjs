import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDCCStatModifier, DCCActor } from '../src/documents/actor.mjs';

describe('DCC RPG Stat Modifiers', () => {
  test('official DCC stat modifier table mapping', () => {
    // 0 or below
    assert.equal(getDCCStatModifier(0), 0);

    // 1–2: +1
    assert.equal(getDCCStatModifier(1), 1);
    assert.equal(getDCCStatModifier(2), 1);

    // 3–5: +2
    assert.equal(getDCCStatModifier(3), 2);
    assert.equal(getDCCStatModifier(4), 2);
    assert.equal(getDCCStatModifier(5), 2);

    // 6–9: +3
    assert.equal(getDCCStatModifier(6), 3);
    assert.equal(getDCCStatModifier(7), 3);
    assert.equal(getDCCStatModifier(8), 3);
    assert.equal(getDCCStatModifier(9), 3);

    // 10–19: +4
    assert.equal(getDCCStatModifier(10), 4);
    assert.equal(getDCCStatModifier(15), 4);
    assert.equal(getDCCStatModifier(19), 4);

    // 20–49: +5
    assert.equal(getDCCStatModifier(20), 5);
    assert.equal(getDCCStatModifier(35), 5);
    assert.equal(getDCCStatModifier(49), 5);

    // 50–99: +6
    assert.equal(getDCCStatModifier(50), 6);
    assert.equal(getDCCStatModifier(75), 6);
    assert.equal(getDCCStatModifier(99), 6);

    // 100–149: +7
    assert.equal(getDCCStatModifier(100), 7);
    assert.equal(getDCCStatModifier(125), 7);
    assert.equal(getDCCStatModifier(149), 7);

    // 150–199: +8
    assert.equal(getDCCStatModifier(150), 8);
    assert.equal(getDCCStatModifier(175), 8);
    assert.equal(getDCCStatModifier(199), 8);

    // 200–299: +9
    assert.equal(getDCCStatModifier(200), 9);
    assert.equal(getDCCStatModifier(250), 9);
    assert.equal(getDCCStatModifier(299), 9);

    // 300+: +10
    assert.equal(getDCCStatModifier(300), 10);
    assert.equal(getDCCStatModifier(350), 10);
    assert.equal(getDCCStatModifier(999), 10);
  });

  test('actor uses enhanced stat value for modifier calculation, not unenhanced', () => {
    const crawler = new DCCActor({
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 2 }, // without gear = 2 -> +1
          dex: { unenhanced: 5 }, // without gear = 5 -> +2
          con: { unenhanced: 1 }, // without gear = 1 -> +1
          int: { unenhanced: 8 }, // without gear = 8 -> +3
          cha: { unenhanced: 12 } // without gear = 12 -> +4
        }
      },
      items: [
        {
          name: 'Belt of Giant Strength',
          type: 'gear',
          system: {
            equipped: true,
            abilityModifiers: {
              str: { value: 8, type: 'flat' } // unenhanced 2 + 8 = 10 -> +4
            }
          }
        },
        {
          name: 'Boots of Agility',
          type: 'gear',
          system: {
            equipped: true,
            abilityModifiers: {
              dex: { value: 15, type: 'flat' } // unenhanced 5 + 15 = 20 -> +5
            }
          }
        },
        {
          name: 'Constitution Amulet',
          type: 'gear',
          system: {
            equipped: true,
            abilityModifiers: {
              con: { value: 49, type: 'flat' } // unenhanced 1 + 49 = 50 -> +6
            }
          }
        }
      ]
    });

    crawler.prepareDerivedData();

    // Enhanced values:
    // STR: 2 + 8 = 10 -> +4
    assert.equal(crawler.system.abilities.str.value, 10);
    assert.equal(crawler.system.abilities.str.mod, 4);

    // DEX: 5 + 15 = 20 -> +5
    assert.equal(crawler.system.abilities.dex.value, 20);
    assert.equal(crawler.system.abilities.dex.mod, 5);

    // CON: 1 + 49 = 50 -> +6
    assert.equal(crawler.system.abilities.con.value, 50);
    assert.equal(crawler.system.abilities.con.mod, 6);

    // INT: unenhanced 8, no gear -> 8 -> +3
    assert.equal(crawler.system.abilities.int.value, 8);
    assert.equal(crawler.system.abilities.int.mod, 3);

    // CHA: unenhanced 12, no gear -> 12 -> +4
    assert.equal(crawler.system.abilities.cha.value, 12);
    assert.equal(crawler.system.abilities.cha.mod, 4);
  });

  test('Page 1 Core template and stylesheet define high-contrast Enhanced and Unenhanced labels', async () => {
    const fs = await import('node:fs');
    const templateContent = fs.readFileSync('templates/actors/parts/page1-core.hbs', 'utf-8');
    const cssContent = fs.readFileSync('styles/dcc.css', 'utf-8');

    // Verify all 5 ability score cards use dedicated high-contrast classes
    const enhancedMatches = templateContent.match(/class="[^"]*dcc-stat-enhanced-label[^"]*"/g) || [];
    assert.equal(enhancedMatches.length, 5, 'Must have 5 Enhanced labels with dcc-stat-enhanced-label class');

    const unenhancedMatches = templateContent.match(/class="[^"]*dcc-stat-unenhanced-label[^"]*"/g) || [];
    assert.equal(unenhancedMatches.length, 5, 'Must have 5 Unenhanced labels with dcc-stat-unenhanced-label class');

    // Verify stylesheet has high-contrast rules
    assert.ok(cssContent.includes('.dcc-stat-sublabel.dcc-stat-enhanced-label'), 'Stylesheet must style dcc-stat-enhanced-label');
    assert.ok(cssContent.includes('#c0392b'), 'Enhanced label must use high-contrast DCC theme red');
    assert.ok(cssContent.includes('.dcc-stat-sublabel.dcc-stat-unenhanced-label'), 'Stylesheet must style dcc-stat-unenhanced-label');
    assert.ok(cssContent.includes('#111111'), 'Unenhanced label must use high-contrast dark color');
  });
});
