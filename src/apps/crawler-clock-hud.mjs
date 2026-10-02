/**
 * Dungeon Crawler Carl RPG — Floating Scene Crawler Countdown Clock HUD
 *
 * Displays a styled, high-contrast LitRPG clock widget docked immediately
 * to the right of the Floor Collapse Clock (#dcc-floor-clock-hud).
 * Tracks total surviving crawlers remaining in the World Dungeon (e.g. 13,000,000),
 * providing GMs with 1-click delta adjustments and direct input, and players with
 * an ominous live counter of surviving crawlers.
 */

import { DCCActor } from '../documents/actor.mjs';

export class DCCCrawlerClockHUD {
  static instance = null;

  constructor() {
    this.isCollapsed = true;
    this.element = null;
  }

  static get defaultOptions() {
    return {
      id: 'dcc-crawler-clock-hud',
      template: 'systems/carl-rpg/templates/apps/crawler-clock-hud.hbs'
    };
  }

  /**
   * Initialize or retrieve the singleton instance.
   * @returns {DCCCrawlerClockHUD}
   */
  static get() {
    if (!DCCCrawlerClockHUD.instance) {
      DCCCrawlerClockHUD.instance = new DCCCrawlerClockHUD();
    }
    return DCCCrawlerClockHUD.instance;
  }

  /**
   * Render or update the HUD element in the DOM.
   * @param {boolean} [force=false]
   * @returns {Promise<DCCCrawlerClockHUD>}
   */
  async render(force = false) {
    const doc = globalThis.document;
    if (!doc) return this;

    const isGM = Boolean(globalThis.game?.user?.isGM);
    const crawlerCount = typeof DCCActor.getCrawlerCount === 'function'
      ? DCCActor.getCrawlerCount()
      : (Number(globalThis.game?.settings?.get?.('carl-rpg', 'crawlerCount')) || 13000000);
    const formattedCrawlerCount = Number(crawlerCount).toLocaleString();

    const context = {
      isGM,
      isCollapsed: this.isCollapsed,
      crawlerCount,
      formattedCrawlerCount
    };

    const renderTemplateFn = globalThis.foundry?.applications?.handlebars?.renderTemplate
      ?? globalThis.foundry?.utils?.renderTemplate
      ?? globalThis.renderTemplate;

    let htmlString = '';
    if (typeof renderTemplateFn === 'function') {
      try {
        htmlString = await renderTemplateFn(DCCCrawlerClockHUD.defaultOptions.template, context);
      } catch (err) {
        htmlString = this._getFallbackHTML(context);
      }
    } else {
      htmlString = this._getFallbackHTML(context);
    }

    let existing = doc.getElementById('dcc-crawler-clock-hud');
    const temp = doc.createElement('div');
    temp.innerHTML = htmlString.trim();
    const newEl = temp.firstElementChild;

    if (existing) {
      existing.replaceWith(newEl);
    } else {
      const parent = doc.getElementById('ui-top') || doc.getElementById('interface') || doc.body;
      parent?.appendChild(newEl);
    }

    this.element = newEl;
    this.updatePosition();
    const $html = globalThis.$ ? globalThis.$(this.element) : this.element;
    this.activateListeners($html);

    return this;
  }

  /**
   * Updates position to dock immediately to the right of the floor collapse clock.
   */
  updatePosition() {
    if (!this.element) return;
    const doc = globalThis.document;
    if (!doc) return;

    const floorEl = doc.getElementById('dcc-floor-clock-hud');
    const nav = doc.getElementById('navigation') || doc.getElementById('scene-list');

    let top = 65;
    let left = 260;

    if (floorEl && typeof floorEl.getBoundingClientRect === 'function') {
      const floorRect = floorEl.getBoundingClientRect();
      if (floorRect.right > 0) {
        left = Math.round(floorRect.right + 8);
        top = Math.round(floorRect.top);
      } else {
        const offsetLeft = floorEl.offsetLeft || 120;
        const offsetWidth = floorEl.offsetWidth || 130;
        const offsetTop = floorEl.offsetTop || 65;
        left = offsetLeft + offsetWidth + 8;
        top = offsetTop;
      }
    } else if (nav && typeof nav.getBoundingClientRect === 'function') {
      const rect = nav.getBoundingClientRect();
      if (rect.bottom > 0) {
        top = Math.round(rect.bottom + 6);
      }
      if (rect.left > 0) {
        left = Math.round(rect.left + 160);
      }
    }

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  /**
   * Wire DOM event listeners.
   */
  activateListeners(html) {
    const $ = globalThis.$;
    const root = (html && typeof html.find === 'function') ? html : (globalThis.$ ? globalThis.$(html) : null);
    if (!root) return;

    // Toggle collapse
    root.find('.dcc-crawler-hud-collapse-btn, .dcc-crawler-hud-toggle-btn').click(ev => {
      ev.preventDefault();
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    // Crawler count input direct change
    root.find('.dcc-hud-crawler-input').change(async ev => {
      const raw = String(ev.currentTarget.value || '').replace(/,/g, '').trim();
      const val = parseInt(raw, 10);
      if (Number.isFinite(val) && typeof DCCActor.setCrawlerCount === 'function') {
        await DCCActor.setCrawlerCount(val);
        this.render();
      }
    });

    // Delta buttons (-10k, -1k, -100, -1, +1, +100, +1k, +10k)
    root.find('.dcc-crawler-hud-adj-btn').click(async ev => {
      ev.preventDefault();
      const delta = parseInt($(ev.currentTarget).data('delta'), 10);
      if (Number.isFinite(delta)) {
        const cur = typeof DCCActor.getCrawlerCount === 'function' ? DCCActor.getCrawlerCount() : 13000000;
        const next = Math.max(0, cur + delta);
        if (typeof DCCActor.setCrawlerCount === 'function') {
          await DCCActor.setCrawlerCount(next);
          this.render();
        }
      }
    });
  }

  /**
   * Fallback HTML string if template renderer is not available.
   */
  _getFallbackHTML(context) {
    if (context.isCollapsed) {
      return `
        <div id="dcc-crawler-clock-hud" class="dcc-crawler-clock-hud collapsed" style="position: absolute; top: 65px; left: 260px; z-index: 100;">
          <div style="background: rgba(18,18,22,0.95); border: 1.5px solid #c0392b; border-radius: 20px; padding: 3px 8px; color: #fff; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            <button type="button" class="dcc-crawler-hud-toggle-btn" style="background: none; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: 'Oswald', sans-serif; font-size: 13px; padding: 0;" title="Crawler Countdown Clock: ${context.formattedCrawlerCount} remaining crawlers. Click to expand.">
              <i class="fa-solid fa-users" style="color: #e74c3c;"></i>
              <span style="font-weight: bold; color: #e74c3c;">${context.formattedCrawlerCount}</span>
            </button>
          </div>
        </div>
      `;
    }

    const gmControls = context.isGM ? `
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="-10000" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-10k</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="-1000" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-1k</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="-100" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-100</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="-1" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-1</button>
      <input type="text" class="dcc-hud-crawler-input" value="${context.formattedCrawlerCount}" style="width: 76px; background: #111; color: #e74c3c; border: 1px solid #666; border-radius: 3px; font-weight: bold; text-align: center; font-size: 12px; padding: 1px 2px;" />
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="1" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+1</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="100" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+100</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="1000" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+1k</button>
      <button type="button" class="dcc-crawler-hud-adj-btn" data-delta="10000" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+10k</button>
    ` : `
      <span style="font-size: 14px; font-weight: bold; color: #e74c3c;">${context.formattedCrawlerCount} <small style="font-size: 10px; color: #aaa;">CRAWLERS</small></span>
    `;

    return `
      <div id="dcc-crawler-clock-hud" class="dcc-crawler-clock-hud" style="position: absolute; top: 65px; left: 260px; z-index: 100; background: rgba(18, 18, 22, 0.95); border: 1.5px solid #c0392b; border-radius: 6px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); font-family: 'Oswald', sans-serif; color: #fff;">
        <i class="fa-solid fa-users" style="color: #e74c3c; font-size: 14px;"></i>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 9px; text-transform: uppercase; color: #aaa; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
            <span style="background: #c0392b; color: #fff; font-weight: bold; padding: 1px 3px; border-radius: 2px; font-size: 8px;">SURVIVING</span>
            <span>Crawler Count</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 1px;">
            ${gmControls}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; margin-left: 4px; border-left: 1px solid #333; padding-left: 6px;">
          <button type="button" class="dcc-crawler-hud-collapse-btn" style="background: none; border: none; color: #888; cursor: pointer; font-size: 11px;" title="Minimize">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
        </div>
      </div>
    `;
  }
}

export { DCCCrawlerClockHUD as DCCCrawlerCountHUD };
