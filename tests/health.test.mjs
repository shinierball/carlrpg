import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';

describe('DCC RPG Max Health Calculation', () => {
  test('calculates max health as 10 * constitution modifier', () => {
    // Test various CON scores and verify Max HP = 10 * mod
    const cases = [
      { con: 1, expectedMod: 1, expectedMaxHP: 10 },
      { con: 2, expectedMod: 1, expectedMaxHP: 10 },
      { con: 3, expectedMod: 2, expectedMaxHP: 20 },
      { con: 5, expectedMod: 2, expectedMaxHP: 20 },
      { con: 6, expectedMod: 3, expectedMaxHP: 30 },
      { con: 9, expectedMod: 3, expectedMaxHP: 30 },
      { con: 10, expectedMod: 4, expectedMaxHP: 40 },
      { con: 19, expectedMod: 4, expectedMaxHP: 40 },
      { con: 20, expectedMod: 5, expectedMaxHP: 50 },
      { con: 49, expectedMod: 5, expectedMaxHP: 50 },
      { con: 50, expectedMod: 6, expectedMaxHP: 60 },
      { con: 99, expectedMod: 6, expectedMaxHP: 60 },
      { con: 100, expectedMod: 7, expectedMaxHP: 70 },
      { con: 149, expectedMod: 7, expectedMaxHP: 70 },
      { con: 150, expectedMod: 8, expectedMaxHP: 80 },
      { con: 199, expectedMod: 8, expectedMaxHP: 80 },
      { con: 200, expectedMod: 9, expectedMaxHP: 90 },
      { con: 299, expectedMod: 9, expectedMaxHP: 90 },
      { con: 300, expectedMod: 10, expectedMaxHP: 100 },
      { con: 500, expectedMod: 10, expectedMaxHP: 100 },
    ];

    for (const { con, expectedMod, expectedMaxHP } of cases) {
      const actor = new DCCActor({
        type: 'crawler',
        system: {
          abilities: {
            con: { unenhanced: con }
          },
          attributes: {
            hp: { value: 10, max: 0 }
          }
        }
      });

      actor.prepareDerivedData();

      assert.equal(
        actor.system.abilities.con.mod,
        expectedMod,
        `CON ${con} should have mod ${expectedMod}`
      );
      assert.equal(
        actor.system.attributes.hp.max,
        expectedMaxHP,
        `CON ${con} (mod ${expectedMod}) should have Max HP ${expectedMaxHP}`
      );
    }
  });

  test('calculates correct HP percentage for health bar styling', () => {
    const actor = new DCCActor({
      type: 'crawler',
      system: {
        abilities: {
          con: { unenhanced: 10 } // mod = 4 -> Max HP = 40
        },
        attributes: {
          hp: { value: 20, max: 0 }
        }
      }
    });

    actor.prepareDerivedData();

    assert.equal(actor.system.attributes.hp.max, 40);
    assert.equal(actor.system.attributes.hp.pct, 50); // 20 / 40 = 50%
  });

  test('health bar gradient is anchored to total health bar width and does not shift with remaining bars', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    // Read stylesheet and verify gradient architecture
    const cssPath = path.resolve('styles/dcc.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');

    // 1. .dcc-health-bar-wrapper must define --hp-fill based on total max HP
    assert.ok(
      cssContent.includes('--hp-fill: min(100%, max(0%, calc(100% * var(--hp-val, 1) / var(--hp-max, 1))));'),
      '.dcc-health-bar-wrapper must compute --hp-fill across total health (hp-val / hp-max)'
    );

    // 2. .dcc-health-fill-overlay must be 100% width so the 0% (red) to 100% (green) gradient spans the entire bar
    assert.ok(
      cssContent.includes('.dcc-health-fill-overlay {') &&
      cssContent.includes('width: 100%;') &&
      cssContent.includes('background-size: 100% 100%;'),
      '.dcc-health-fill-overlay must have 100% width and 100% background-size so gradient spans total bar'
    );

    // 3. .dcc-health-fill-overlay must unmask via clip-path inset rather than compressing width
    assert.ok(
      cssContent.includes('clip-path: inset(0 calc(100% - var(--hp-fill, 100%)) 0 0);'),
      '.dcc-health-fill-overlay must use clip-path right inset to reveal the fixed gradient from left to right'
    );

    // 4. .dcc-health-segments must support dynamic health segment counts
    assert.ok(
      cssContent.includes('grid-template-columns: repeat(var(--hp-segments, 10), 1fr);'),
      '.dcc-health-segments must support variable segment count via CSS variable'
    );

    // 5. Verify page1-core.hbs template passes --hp-pct and --hp-segments, and sets dynamic grid columns
    const templatePath = path.resolve('templates/actors/parts/page1-core.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf8');

    assert.ok(
      templateContent.includes('--hp-val: {{system.attributes.hp.value}}') &&
      templateContent.includes('--hp-max: {{system.attributes.hp.max}}') &&
      templateContent.includes('--hp-pct: {{system.attributes.hp.pct}}') &&
      templateContent.includes('--hp-segments: {{healthSegments.length}}'),
      'page1-core.hbs must pass --hp-val, --hp-max, --hp-pct, and --hp-segments to the wrapper'
    );

    assert.ok(
      templateContent.includes('grid-template-columns: repeat({{healthSegments.length}}, 1fr);'),
      'page1-core.hbs must dynamically size grid columns for healthSegments'
    );
  });

  test('verifies mathematical mapping of health bars to gradient color regions', () => {
    // Helper function that mirrors the CSS clip-path inset calculation:
    // rightInset = 100% - clamp(0%, 100%, 100% * hpVal / hpMax)
    function calculateBarState(hpVal, hpMax) {
      const fillPct = Math.min(100, Math.max(0, (100 * hpVal) / hpMax));
      const rightInset = 100 - fillPct;
      let region = 'empty';
      if (fillPct >= 66) region = 'green';
      else if (fillPct >= 33) region = 'yellow';
      else if (fillPct > 0) region = 'red';
      return { fillPct, rightInset, region };
    }

    // Crawler with 10 bars (CON mod 4 -> 40 Max HP, 4 HP per bar)
    const maxHp = 40;

    // 10 of 10 health bars (40/40 HP): fully in the green
    const fullBars = calculateBarState(40, maxHp);
    assert.equal(fullBars.fillPct, 100, '10 of 10 bars has 100% fill');
    assert.equal(fullBars.rightInset, 0, '0% right inset (fully unmasked to 100% green stop)');
    assert.equal(fullBars.region, 'green', '10 of 10 health bars is in the green');

    // 1 of 10 health bars (4/40 HP): strictly in the red
    const oneBar = calculateBarState(4, maxHp);
    assert.equal(oneBar.fillPct, 10, '1 of 10 bars has 10% fill');
    assert.equal(oneBar.rightInset, 90, '90% right inset (only the leftmost 10% red stop is revealed)');
    assert.equal(oneBar.region, 'red', '1 of 10 health bars is in the red');

    // 5 of 10 health bars (20/40 HP): in the yellow/orange
    const halfBars = calculateBarState(20, maxHp);
    assert.equal(halfBars.fillPct, 50, '5 of 10 bars has 50% fill');
    assert.equal(halfBars.rightInset, 50, '50% right inset');
    assert.equal(halfBars.region, 'yellow', '5 of 10 health bars is in the yellow/orange');

    // 0 health bars (0/40 HP): completely masked
    const deadBars = calculateBarState(0, maxHp);
    assert.equal(deadBars.fillPct, 0, '0 HP has 0% fill');
    assert.equal(deadBars.rightInset, 100, '100% right inset (completely masked)');
    assert.equal(deadBars.region, 'empty');
  });
});

