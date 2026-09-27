/**
 * Dungeon Crawler Carl RPG — Floating Scene Floor Timer Clock HUD
 *
 * Displays a styled, high-contrast LitRPG clock widget anchored beneath the
 * Foundry scene navigation bar (#navigation).
 * Shows current floor, hours remaining until collapse, and gives GMs
 * 1-click manual adjustment and direct access to party grinding.
 */

import { DCCActor } from '../documents/actor.mjs';

export class DCCFloorClockHUD {
  static instance = null;

  constructor() {
    this.isCollapsed = true;
    this.element = null;
  }

  static get defaultOptions() {
    return {
      id: 'dcc-floor-clock-hud',
      template: 'systems/carl-rpg/templates/apps/floor-clock-hud.hbs'
    };
  }

  /**
   * Initialize or retrieve the singleton instance.
   * @returns {DCCFloorClockHUD}
   */
  static get() {
    if (!DCCFloorClockHUD.instance) {
      DCCFloorClockHUD.instance = new DCCFloorClockHUD();
    }
    return DCCFloorClockHUD.instance;
  }

  /**
   * Render or update the HUD element in the DOM.
   * @param {boolean} [force=false]
   * @returns {Promise<DCCFloorClockHUD>}
   */
  async render(force = false) {
    const doc = globalThis.document;
    if (!doc) return this;

    const isGM = Boolean(globalThis.game?.user?.isGM);
    const floorTimer = typeof DCCActor.getFloorTimer === 'function'
      ? DCCActor.getFloorTimer()
      : (Number(globalThis.game?.settings?.get?.('carl-rpg', 'floorTimer')) || 100);
    const currentFloor = typeof DCCActor.getCurrentFloor === 'function'
      ? DCCActor.getCurrentFloor()
      : (Number(globalThis.game?.settings?.get?.('carl-rpg', 'currentFloor')) || 1);

    const context = {
      isGM,
      isCollapsed: this.isCollapsed,
      floorTimer,
      currentFloor
    };

    let htmlString = '';
    if (typeof globalThis.renderTemplate === 'function') {
      try {
        htmlString = await globalThis.renderTemplate(DCCFloorClockHUD.defaultOptions.template, context);
      } catch (err) {
        htmlString = this._getFallbackHTML(context);
      }
    } else {
      htmlString = this._getFallbackHTML(context);
    }

    let existing = doc.getElementById('dcc-floor-clock-hud');
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
   * Updates position to dock right under scene navigation or top bar.
   */
  updatePosition() {
    if (!this.element) return;
    const doc = globalThis.document;
    if (!doc) return;

    const nav = doc.getElementById('navigation') || doc.getElementById('scene-list');
    let top = 65;
    let left = 120;

    if (nav && typeof nav.getBoundingClientRect === 'function') {
      const rect = nav.getBoundingClientRect();
      if (rect.bottom > 0) {
        top = Math.round(rect.bottom + 6);
      }
      if (rect.left > 0) {
        left = Math.round(rect.left);
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
    const root = (typeof html.find === 'function') ? html : (globalThis.$ ? globalThis.$(html) : null);
    if (!root) return;

    // Toggle collapse
    root.find('.dcc-floor-hud-collapse-btn, .dcc-floor-hud-toggle-btn').click(ev => {
      ev.preventDefault();
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    // Time input direct change
    root.find('.dcc-hud-time-input').change(async ev => {
      const val = parseFloat(ev.currentTarget.value);
      if (Number.isFinite(val) && typeof DCCActor.setFloorTimer === 'function') {
        await DCCActor.setFloorTimer(val);
        this.render();
      }
    });

    // Delta buttons (+1h, -1h, +5h, -5h)
    root.find('.dcc-hud-adj-btn').click(async ev => {
      ev.preventDefault();
      const delta = parseFloat($(ev.currentTarget).data('delta'));
      if (Number.isFinite(delta)) {
        const cur = typeof DCCActor.getFloorTimer === 'function' ? DCCActor.getFloorTimer() : 100;
        const next = Math.max(0, cur + delta);
        if (typeof DCCActor.setFloorTimer === 'function') {
          await DCCActor.setFloorTimer(next);
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
        <div id="dcc-floor-clock-hud" class="dcc-floor-clock-hud collapsed" style="position: absolute; top: 65px; left: 180px; z-index: 100;">
          <div style="background: rgba(20,20,24,0.95); border: 1.5px solid #e67e22; border-radius: 20px; padding: 3px 8px; color: #fff; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            <button type="button" class="dcc-floor-hud-toggle-btn" style="background: none; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: 'Oswald', sans-serif; font-size: 13px; padding: 0;" title="Floor Collapse Clock: ${context.floorTimer}h remaining. Click to expand.">
              <i class="fa-solid fa-hourglass-half" style="color: #e67e22;"></i>
              <span style="font-weight: bold; color: #f39c12;">${context.floorTimer}h</span>
            </button>
          </div>
        </div>
      `;
    }

    const gmControls = context.isGM ? `
      <button type="button" class="dcc-hud-adj-btn" data-delta="-5" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-5h</button>
      <button type="button" class="dcc-hud-adj-btn" data-delta="-1" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">-1h</button>
      <input type="number" class="dcc-hud-time-input" value="${context.floorTimer}" min="0" style="width: 46px; background: #111; color: #f39c12; border: 1px solid #666; border-radius: 3px; font-weight: bold; text-align: center; font-size: 12px; padding: 1px 2px;" />
      <button type="button" class="dcc-hud-adj-btn" data-delta="1" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+1h</button>
      <button type="button" class="dcc-hud-adj-btn" data-delta="5" style="background: #222; border: 1px solid #555; color: #ccc; border-radius: 3px; font-size: 10px; padding: 1px 4px; cursor: pointer;">+5h</button>
    ` : `
      <span style="font-size: 14px; font-weight: bold; color: #f39c12;">${context.floorTimer} <small style="font-size: 10px; color: #aaa;">HRS</small></span>
    `;

    return `
      <div id="dcc-floor-clock-hud" class="dcc-floor-clock-hud" style="position: absolute; top: 65px; left: 180px; z-index: 100; background: rgba(20, 20, 24, 0.95); border: 1.5px solid #e67e22; border-radius: 6px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); font-family: 'Oswald', sans-serif; color: #fff;">
        <i class="fa-solid fa-hourglass-half" style="color: #e67e22; font-size: 14px;"></i>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 9px; text-transform: uppercase; color: #aaa; letter-spacing: 0.5px;">Floor ${context.currentFloor} Collapse Clock</div>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 1px;">
            ${gmControls}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; margin-left: 4px; border-left: 1px solid #333; padding-left: 6px;">
          <button type="button" class="dcc-floor-hud-collapse-btn" style="background: none; border: none; color: #888; cursor: pointer; font-size: 11px;" title="Minimize">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
        </div>
      </div>
    `;
  }
}
