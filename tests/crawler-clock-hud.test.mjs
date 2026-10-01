import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import './setup.mjs';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCCrawlerClockHUD } from '../src/apps/crawler-clock-hud.mjs';
import { DCCFloorClockHUD } from '../src/apps/floor-clock-hud.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG — Surviving Crawler Countdown Clock HUD', () => {

  beforeEach(async () => {
    await DCCActor.setCrawlerCount(13000000);
    await DCCActor.setFloorTimer(100);
  });

  describe('1. Global Crawler Count State & Actor Integration', () => {
    it('initializes crawler count with canonical default of 13,000,000', () => {
      const count = DCCActor.getCrawlerCount();
      assert.equal(count, 13000000, 'Default crawler count should be 13,000,000');
    });

    it('sets crawler count via number or string and parses commas cleanly', async () => {
      await DCCActor.setCrawlerCount(12500000);
      assert.equal(DCCActor.getCrawlerCount(), 12500000);

      await DCCActor.setCrawlerCount('11,842,000');
      assert.equal(DCCActor.getCrawlerCount(), 11842000, 'Should strip commas and parse integer');
    });

    it('enforces non-negative crawler count minimum at 0', async () => {
      await DCCActor.setCrawlerCount(-500);
      assert.equal(DCCActor.getCrawlerCount(), 0, 'Negative values clamp to 0');
    });

    it('decrements crawler count by specified amount and clamps to 0', async () => {
      await DCCActor.setCrawlerCount(1000);
      await DCCActor.decrementCrawlerCount(1);
      assert.equal(DCCActor.getCrawlerCount(), 999);

      await DCCActor.decrementCrawlerCount(100);
      assert.equal(DCCActor.getCrawlerCount(), 899);

      await DCCActor.decrementCrawlerCount('500');
      assert.equal(DCCActor.getCrawlerCount(), 399);

      await DCCActor.decrementCrawlerCount(1000);
      assert.equal(DCCActor.getCrawlerCount(), 0, 'Should not drop below 0');
    });

    it('increments crawler count by specified amount', async () => {
      await DCCActor.setCrawlerCount(1000000);
      await DCCActor.incrementCrawlerCount(500);
      assert.equal(DCCActor.getCrawlerCount(), 1000500);

      await DCCActor.incrementCrawlerCount('1,500');
      assert.equal(DCCActor.getCrawlerCount(), 1002000);
    });

    it('supports instance methods on DCCActor instance', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { con: { value: 14 } },
          attributes: { hp: { value: 40, max: 40 } }
        }
      });

      assert.equal(actor.getCrawlerCount(), 13000000);
      await actor.setCrawlerCount(12000000);
      assert.equal(actor.getCrawlerCount(), 12000000);
      await actor.decrementCrawlerCount(5);
      assert.equal(actor.getCrawlerCount(), 11999995);
      await actor.incrementCrawlerCount(10);
      assert.equal(actor.getCrawlerCount(), 12000005);
    });
  });

  describe('2. DCCCrawlerClockHUD Singleton & Options', () => {
    it('maintains singleton pattern and default options', () => {
      const hud1 = DCCCrawlerClockHUD.get();
      const hud2 = DCCCrawlerClockHUD.get();
      assert.equal(hud1, hud2, 'DCCCrawlerClockHUD.get() must return identical instance');
      assert.equal(DCCCrawlerClockHUD.defaultOptions.id, 'dcc-crawler-clock-hud');
      assert.equal(DCCCrawlerClockHUD.defaultOptions.template, 'systems/carl-rpg/templates/apps/crawler-clock-hud.hbs');
    });

    it('defaults to collapsed state for clean scene immersion', () => {
      const hud = DCCCrawlerClockHUD.get();
      assert.equal(hud.isCollapsed, true);
    });
  });

  describe('3. Fallback HTML Generation (GM vs Player, Collapsed vs Expanded)', () => {
    it('generates collapsed pill HTML with formatted crawler count and icon', () => {
      const hud = DCCCrawlerClockHUD.get();
      const html = hud._getFallbackHTML({
        isGM: false,
        isCollapsed: true,
        crawlerCount: 12850420,
        formattedCrawlerCount: '12,850,420'
      });

      assert.ok(html.includes('id="dcc-crawler-clock-hud"'));
      assert.ok(html.includes('collapsed'));
      assert.ok(html.includes('12,850,420'));
      assert.ok(html.includes('fa-users'));
      assert.ok(html.includes('dcc-crawler-hud-toggle-btn'));
    });

    it('generates expanded HTML for GM with adjustment buttons and editable input', () => {
      const hud = DCCCrawlerClockHUD.get();
      const html = hud._getFallbackHTML({
        isGM: true,
        isCollapsed: false,
        crawlerCount: 13000000,
        formattedCrawlerCount: '13,000,000'
      });

      assert.ok(html.includes('data-delta="-10000"'), 'Includes -10k button');
      assert.ok(html.includes('data-delta="-1000"'), 'Includes -1k button');
      assert.ok(html.includes('data-delta="-100"'), 'Includes -100 button');
      assert.ok(html.includes('data-delta="-1"'), 'Includes -1 button');
      assert.ok(html.includes('data-delta="1"'), 'Includes +1 button');
      assert.ok(html.includes('data-delta="100"'), 'Includes +100 button');
      assert.ok(html.includes('data-delta="1000"'), 'Includes +1k button');
      assert.ok(html.includes('data-delta="10000"'), 'Includes +10k button');
      assert.ok(html.includes('class="dcc-hud-crawler-input"'));
      assert.ok(html.includes('value="13,000,000"'));
      assert.ok(html.includes('SURVIVING'));
      assert.ok(html.includes('dcc-crawler-hud-collapse-btn'));
    });

    it('generates expanded HTML for player with display text and no GM edit controls', () => {
      const hud = DCCCrawlerClockHUD.get();
      const html = hud._getFallbackHTML({
        isGM: false,
        isCollapsed: false,
        crawlerCount: 11200000,
        formattedCrawlerCount: '11,200,000'
      });

      assert.ok(html.includes('11,200,000'));
      assert.ok(html.includes('CRAWLERS'));
      assert.ok(!html.includes('data-delta="-10000"'), 'Non-GM should not have adjustment buttons');
      assert.ok(!html.includes('class="dcc-hud-crawler-input"'), 'Non-GM should not have input field');
    });
  });

  describe('4. Docked Positioning Next to Floor Collapse Clock', () => {
    it('docks immediately to the right of the floor collapse clock (#dcc-floor-clock-hud)', () => {
      const hud = DCCCrawlerClockHUD.get();

      // Mock DOM environment
      const floorClockEl = {
        id: 'dcc-floor-clock-hud',
        getBoundingClientRect: () => ({
          top: 68,
          bottom: 104,
          left: 120,
          right: 250,
          width: 130,
          height: 36
        })
      };

      const crawlerEl = {
        style: {}
      };

      hud.element = crawlerEl;

      const origDoc = globalThis.document;
      globalThis.document = {
        getElementById: (id) => {
          if (id === 'dcc-floor-clock-hud') return floorClockEl;
          return null;
        }
      };

      try {
        hud.updatePosition();
        assert.equal(crawlerEl.style.top, '68px', 'Top should match floor clock top');
        assert.equal(crawlerEl.style.left, '258px', 'Left should be floorClock right (250) + 8px gap = 258px');
      } finally {
        globalThis.document = origDoc;
      }
    });

    it('falls back gracefully to navigation bar when floor clock is absent', () => {
      const hud = DCCCrawlerClockHUD.get();

      const navEl = {
        id: 'navigation',
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 55,
          left: 100,
          right: 800,
          width: 700,
          height: 55
        })
      };

      const crawlerEl = {
        style: {}
      };

      hud.element = crawlerEl;

      const origDoc = globalThis.document;
      globalThis.document = {
        getElementById: (id) => {
          if (id === 'dcc-floor-clock-hud') return null;
          if (id === 'navigation') return navEl;
          return null;
        }
      };

      try {
        hud.updatePosition();
        assert.equal(crawlerEl.style.top, '61px', 'Top should be nav bottom (55) + 6px');
        assert.equal(crawlerEl.style.left, '260px', 'Left should be nav left (100) + 160px');
      } finally {
        globalThis.document = origDoc;
      }
    });

    it('DCCFloorClockHUD updates DCCCrawlerClockHUD position when floor clock updates', () => {
      const crawlerHUD = DCCCrawlerClockHUD.get();
      let crawlerPositionUpdated = false;
      const origUpdate = crawlerHUD.updatePosition;
      crawlerHUD.updatePosition = () => {
        crawlerPositionUpdated = true;
      };

      const floorHUD = DCCFloorClockHUD.get();
      const floorEl = { style: {} };
      floorHUD.element = floorEl;

      const origDoc = globalThis.document;
      globalThis.document = {
        getElementById: () => null
      };

      try {
        floorHUD.updatePosition();
        assert.ok(crawlerPositionUpdated, 'Floor clock updatePosition must notify crawler clock to update position');
      } finally {
        globalThis.document = origDoc;
        crawlerHUD.updatePosition = origUpdate;
      }
    });
  });

  describe('5. Event Listeners & Interactive Handlers', () => {
    it('wires toggle collapse event to alternate isCollapsed state', () => {
      const hud = DCCCrawlerClockHUD.get();
      hud.isCollapsed = true;

      let rendered = false;
      hud.render = async () => {
        rendered = true;
        return hud;
      };

      const clickHandlers = {};
      const mock$ = {
        find: (sel) => {
          return {
            click: (fn) => { clickHandlers[sel] = fn; },
            change: () => {}
          };
        }
      };

      hud.activateListeners(mock$);

      const toggleHandler = clickHandlers['.dcc-crawler-hud-collapse-btn, .dcc-crawler-hud-toggle-btn'];
      assert.ok(typeof toggleHandler === 'function', 'Must register collapse click listener');

      toggleHandler({ preventDefault: () => {} });
      assert.equal(hud.isCollapsed, false, 'Should toggle from true to false');
      assert.ok(rendered, 'Should re-render after toggle');
    });

    it('wires input change listener to update crawler count', async () => {
      const hud = DCCCrawlerClockHUD.get();
      let changeHandler = null;

      const mock$ = {
        find: (sel) => {
          return {
            click: () => {},
            change: (fn) => {
              if (sel === '.dcc-hud-crawler-input') changeHandler = fn;
            }
          };
        }
      };

      hud.activateListeners(mock$);
      assert.ok(typeof changeHandler === 'function');

      await changeHandler({ currentTarget: { value: '11,500,000' } });
      assert.equal(DCCActor.getCrawlerCount(), 11500000);
    });

    it('wires delta buttons listener to adjust crawler count by data-delta', async () => {
      const hud = DCCCrawlerClockHUD.get();
      let deltaHandler = null;

      const mock$ = {
        find: (sel) => {
          return {
            click: (fn) => {
              if (sel === '.dcc-crawler-hud-adj-btn') deltaHandler = fn;
            },
            change: () => {}
          };
        }
      };

      const orig$ = globalThis.$;
      globalThis.$ = (el) => ({
        data: (attr) => (attr === 'delta' ? el.dataset.delta : undefined)
      });

      try {
        hud.activateListeners(mock$);
        assert.ok(typeof deltaHandler === 'function');

        await DCCActor.setCrawlerCount(13000000);

        // Click -1,000
        await deltaHandler({
          preventDefault: () => {},
          currentTarget: { dataset: { delta: '-1000' } }
        });
        assert.equal(DCCActor.getCrawlerCount(), 12999000);

        // Click +100
        await deltaHandler({
          preventDefault: () => {},
          currentTarget: { dataset: { delta: '100' } }
        });
        assert.equal(DCCActor.getCrawlerCount(), 12999100);
      } finally {
        globalThis.$ = orig$;
      }
    });
  });

  describe('6. Crawler Sheet Context Integration', () => {
    it('DCCCrawlerSheet getData populates crawlerCount and formattedCrawlerCount', async () => {
      await DCCActor.setCrawlerCount(12750000);
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10 } },
          attributes: { hp: { value: 40, max: 40 } }
        }
      });

      const sheet = new DCCCrawlerSheet(actor);
      const data = await sheet.getData();

      assert.equal(data.crawlerCount, 12750000);
      assert.equal(data.formattedCrawlerCount, '12,750,000');
    });
  });

  describe('7. Template & Asset Integrity', () => {
    it('templates/apps/crawler-clock-hud.hbs exists and contains expected DOM structures', () => {
      const tplPath = path.resolve('templates/apps/crawler-clock-hud.hbs');
      assert.ok(fs.existsSync(tplPath), 'crawler-clock-hud.hbs template file must exist');

      const content = fs.readFileSync(tplPath, 'utf8');
      assert.ok(content.includes('id="dcc-crawler-clock-hud"'));
      assert.ok(content.includes('dcc-crawler-hud-pill-collapsed'));
      assert.ok(content.includes('dcc-crawler-hud-inner'));
      assert.ok(content.includes('dcc-crawler-hud-adj-btn'));
      assert.ok(content.includes('dcc-hud-crawler-input'));
      assert.ok(content.includes('dcc-crawler-hud-time-display'));
      assert.ok(content.includes('fa-users'));
    });

    it('styles/dcc.css contains styles for #dcc-crawler-clock-hud', () => {
      const cssPath = path.resolve('styles/dcc.css');
      const content = fs.readFileSync(cssPath, 'utf8');
      assert.ok(content.includes('#dcc-crawler-clock-hud'));
      assert.ok(content.includes('.dcc-crawler-hud-inner'));
      assert.ok(content.includes('.dcc-crawler-hud-pill-collapsed'));
      assert.ok(content.includes('.dcc-hud-crawler-input'));
    });
  });
});
