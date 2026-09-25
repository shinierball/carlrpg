/**
 * Dungeon Crawler Carl RPG — Crawler Token Action HUDs
 *
 * 1. Hotbar HUD: Displays 10 hotbar action slots directly above Foundry's macro bar (#hotbar).
 * 2. Left Action HUD: Displays all attacks and non-passive skills on the left of the screen,
 *    positioned directly below the scene list (#navigation / #scene-list).
 */

/**
 * Checks if a skill is passive (no active roll or attack).
 * @param {object} skill
 * @returns {boolean}
 */
export function isPassiveSkill(skill) {
  if (!skill) return false;
  const sys = skill.system || {};
  const cat = (sys.category || '').toLowerCase();
  const checkType = (sys.checkType || '').toLowerCase();
  const skillType = (sys.skillType || sys.type || '').toLowerCase();
  return cat === 'passive' ||
    checkType.includes('passive') ||
    checkType.includes('no roll') ||
    skillType === 'passive' ||
    Boolean(sys.isPassive);
}

/**
 * Resolves a hotlist slot item on an actor.
 * @param {object} actor
 * @param {*} rawVal
 * @returns {object|null}
 */
export function resolveHotlistItem(actor, rawVal) {
  if (!actor || !rawVal) return null;
  let valStr = Array.isArray(rawVal) ? (rawVal[0] || '') : String(rawVal);
  valStr = valStr.trim();
  if (valStr.includes(',')) {
    valStr = valStr.split(',')[0].trim();
  }
  if (!valStr) return null;

  // 1. Direct lookup by ID
  let item = actor.items?.get?.(valStr);
  if (item) return item;

  // 2. Lookup by ID or name in actor items collection/array
  const norm = valStr.toLowerCase();
  if (Array.isArray(actor.items)) {
    item = actor.items.find(it => it.id === valStr || it._id === valStr || (it.name && it.name.toLowerCase().trim() === norm));
  } else if (typeof actor.items?.find === 'function') {
    item = actor.items.find(it => it.id === valStr || it._id === valStr || (it.name && it.name.toLowerCase().trim() === norm));
  }
  if (item) return item;

  // 3. Fallback: compendium spells
  if (globalThis.CONFIG?.DCC?.spells) {
    const compSpell = CONFIG.DCC.spells.find(s => s._id === valStr || (s.name && s.name.toLowerCase().trim() === norm));
    if (compSpell) {
      const owned = Array.isArray(actor.items)
        ? actor.items.find(s => s.name?.toLowerCase().trim() === compSpell.name.toLowerCase().trim())
        : actor.items?.find?.(s => s.name?.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
      return owned || {
        id: compSpell._id,
        name: compSpell.name,
        type: 'spell',
        img: compSpell.img,
        system: compSpell.system,
        isCompendium: true
      };
    }
  }

  // 4. World items fallback
  if (globalThis.game?.items) {
    const worldItem = game.items.find?.(it => it.id === valStr || (it.name && it.name.toLowerCase().trim() === norm));
    if (worldItem) return worldItem;
  }

  return null;
}

/**
 * Universal helper to render a template via renderTemplate or fallback.
 */
async function renderHUDTemplate(templatePath, data, fallbackFn) {
  if (typeof globalThis.renderTemplate === 'function') {
    try {
      const res = await globalThis.renderTemplate(templatePath, data);
      if (res && typeof res === 'string') return res;
    } catch (_) {}
  }
  if (typeof fallbackFn === 'function') {
    return fallbackFn(data);
  }
  return '';
}

/**
 * =========================================================================
 * DCCCrawlerHotbarHUD
 * Renders the 10 hotbar action slots directly above Foundry's macro bar.
 * =========================================================================
 */
export class DCCCrawlerHotbarHUD {
  constructor(actor, token = null, options = {}) {
    this.actor = actor;
    this.token = token;
    this.options = Object.assign({ id: 'dcc-crawler-hotbar-hud' }, options);
    this.id = this.options.id;
    this.element = null;
    this.isCollapsed = Boolean(options.isCollapsed);
  }

  /**
   * Prepares the 10 slots data structure identically to the character sheet.
   */
  async getData() {
    const hotlistData = this.actor?.system?.hotlist || {};
    const slots = [];

    for (let i = 1; i <= 10; i++) {
      const slotKey = `slot${i}`;
      let rawVal = hotlistData[slotKey] || '';
      if (Array.isArray(rawVal)) rawVal = rawVal[0] || '';
      let valStr = String(rawVal).trim();
      if (valStr.includes(',')) valStr = valStr.split(',')[0].trim();

      const resolvedItem = resolveHotlistItem(this.actor, valStr);
      let displayName = resolvedItem?.name || valStr;
      let slotType = resolvedItem?.type || '';
      let badge = '';
      let detail = '';
      let isSpell = false;
      let isGear = false;
      let isLoot = false;
      let isAttack = false;
      let isSkill = false;
      let isEquipped = false;
      let hasDamage = false;

      if (resolvedItem) {
        if (slotType === 'spell') {
          isSpell = true;
          badge = 'SPELL';
          detail = `${resolvedItem.system?.manaCost ?? 0} MP`;
          if (resolvedItem.system?.spellType) {
            detail += ` • ${resolvedItem.system.spellType}`;
          }
          const dmg = typeof this.actor?.getSpellDamageData === 'function'
            ? this.actor.getSpellDamageData(resolvedItem)
            : null;
          hasDamage = Boolean(dmg?.hasDamage);
        } else if (slotType === 'gear') {
          isGear = true;
          const slotName = resolvedItem.system?.slot || 'gear';
          isEquipped = Boolean(resolvedItem.system?.equipped);
          badge = slotName.toUpperCase();
          detail = isEquipped ? 'Equipped' : 'Unequipped';
        } else if (slotType === 'loot') {
          isLoot = true;
          badge = 'ITEM';
          detail = `x${resolvedItem.system?.quantity ?? 1}`;
        } else if (slotType === 'attack') {
          isAttack = true;
          badge = 'ATTACK';
          detail = resolvedItem.system?.damageDice || '';
          if (resolvedItem.system?.damageStat) {
            detail += ` + ${String(resolvedItem.system.damageStat).toUpperCase()}`;
          }
          hasDamage = true;
        } else if (slotType === 'skill') {
          isSkill = true;
          const dmg = typeof this.actor?.getSkillDamageData === 'function'
            ? this.actor.getSkillDamageData(resolvedItem)
            : { hasDamage: false };
          hasDamage = Boolean(dmg?.hasDamage);
          const checkType = (resolvedItem.system?.checkType || '').toLowerCase();
          const skillType = resolvedItem.system?.skillType || resolvedItem.system?.type || '';
          isAttack = hasDamage ||
            checkType.includes('attack') ||
            ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
            (resolvedItem.system?.category || '').toLowerCase() === 'combat';
          badge = isAttack ? 'ATTACK' : 'SKILL';
          const rk = resolvedItem.system?.modifiedRank ?? resolvedItem.system?.rank ?? 1;
          detail = `Rank ${rk}`;
          if (hasDamage && dmg.formulaWithStat) {
            detail += ` • ${dmg.formulaWithStat}`;
          }
        } else {
          badge = slotType.toUpperCase();
        }
      }

      slots.push({
        index: i,
        key: slotKey,
        value: valStr,
        isEmpty: !valStr || !resolvedItem,
        item: resolvedItem,
        itemId: resolvedItem?.id || '',
        name: displayName,
        img: resolvedItem ? (resolvedItem.img || 'icons/svg/item-bag.svg') : '',
        type: slotType,
        badge,
        detail,
        isSpell,
        isGear,
        isLoot,
        isAttack,
        isSkill,
        isEquipped,
        hasDamage
      });
    }

    return {
      actor: this.actor,
      token: this.token,
      crawlerName: this.actor?.name || 'Crawler',
      isCollapsed: this.isCollapsed,
      slots
    };
  }

  /**
   * Generates fallback HTML markup if renderTemplate is unavailable.
   */
  _generateHTML(data) {
    let slotsHtml = '';
    for (const s of data.slots) {
      if (s.isEmpty) {
        slotsHtml += `
          <div class="dcc-hotbar-hud-slot is-empty" data-slot="${s.key}">
            <div class="dcc-hotbar-slot-header">
              <span class="dcc-hotbar-slot-num">${s.index}</span>
            </div>
            <div class="dcc-hotbar-slot-empty"><span>(Empty)</span></div>
          </div>`;
      } else {
        let actionBtns = '';
        if (s.isAttack) {
          actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-hit roll-hotlist-attack" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Attack: ${s.name}"><i class="fa-solid fa-crosshairs"></i> Hit</button>
            <button type="button" class="dcc-hud-btn dcc-hud-btn-dmg roll-hotlist-attack-dmg" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Damage: ${s.name}"><i class="fa-solid fa-burst"></i> Dmg</button>`;
        } else if (s.isGear) {
          actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-gear toggle-hotlist-equip ${s.isEquipped ? 'is-equipped' : ''}" data-item-id="${s.itemId}" data-slot="${s.key}"><i class="fa-solid ${s.isEquipped ? 'fa-shield' : 'fa-shield-halved'}"></i> ${s.isEquipped ? 'Equipped' : 'Equip'}</button>`;
        } else if (s.isSpell) {
          actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-spell roll-hotlist-spell" data-item-id="${s.itemId}" data-slot="${s.key}" title="Cast Spell: ${s.name}"><i class="fa-solid fa-wand-magic-sparkles"></i> Cast</button>`;
          if (s.hasDamage) {
            actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-dmg roll-hotlist-spell-dmg" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Damage: ${s.name}"><i class="fa-solid fa-burst"></i> Dmg</button>`;
          }
        } else if (s.isLoot) {
          actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-use roll-hotlist-use" data-item-id="${s.itemId}" data-slot="${s.key}" title="Use Item: ${s.name}"><i class="fa-solid fa-flask"></i> Use</button>`;
        } else if (s.isSkill) {
          if (s.hasDamage) {
            actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-hit roll-hotlist-attack" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Attack: ${s.name}"><i class="fa-solid fa-crosshairs"></i> Hit</button>
            <button type="button" class="dcc-hud-btn dcc-hud-btn-dmg roll-hotlist-attack-dmg" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Damage: ${s.name}"><i class="fa-solid fa-burst"></i> Dmg</button>`;
          } else {
            actionBtns += `
            <button type="button" class="dcc-hud-btn dcc-hud-btn-use roll-hotlist-use" data-item-id="${s.itemId}" data-slot="${s.key}" title="Roll Skill: ${s.name}"><i class="fa-solid fa-dice-d20"></i> Roll</button>`;
          }
        }

        slotsHtml += `
          <div class="dcc-hotbar-hud-slot is-populated" data-slot="${s.key}" data-item-id="${s.itemId}">
            <div class="dcc-hotbar-slot-header">
              <span class="dcc-hotbar-slot-num">${s.index}</span>
              ${s.badge ? `<span class="dcc-hotbar-slot-badge ${s.type}">${s.badge}</span>` : ''}
              <a class="hotlist-slot-clear" data-slot="${s.key}" title="Clear Slot"><i class="fa-solid fa-xmark"></i></a>
            </div>
            <div class="dcc-hotbar-slot-body" title="${s.name}">
              <img class="dcc-hotbar-slot-icon" src="${s.img}" alt="${s.name}" />
              <div class="dcc-hotbar-slot-info">
                <span class="dcc-hotbar-slot-name">${s.name}</span>
                ${s.detail ? `<span class="dcc-hotbar-slot-detail">${s.detail}</span>` : ''}
              </div>
            </div>
            <div class="dcc-hotbar-slot-actions">
              ${actionBtns}
            </div>
          </div>`;
      }
    }

    return `
      <div id="dcc-crawler-hotbar-hud" class="dcc-crawler-hotbar-hud ${data.isCollapsed ? 'is-collapsed' : ''}" data-actor-id="${data.actor?.id || ''}">
        <div class="dcc-hotbar-hud-bar">
          <div class="dcc-hotbar-hud-header">
            <div class="dcc-hotbar-hud-title">
              <i class="fa-solid fa-bolt"></i>
              <span>${data.crawlerName} — HOTBAR</span>
            </div>
            <div class="dcc-hotbar-hud-controls">
              <button type="button" class="dcc-hotbar-hud-ctrl-btn dcc-hotbar-toggle" title="Toggle Hotbar HUD">
                <i class="fa-solid ${data.isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
              </button>
            </div>
          </div>
          ${data.isCollapsed ? '' : `<div class="dcc-hotbar-hud-grid">${slotsHtml}</div>`}
        </div>
      </div>`;
  }

  /**
   * Renders the Hotbar HUD directly above Foundry's macro bar (#hotbar).
   */
  async render(force = false) {
    if (!this.actor) return this;
    const data = await this.getData();
    const htmlString = await renderHUDTemplate(
      'systems/carl-rpg/templates/apps/crawler-hotbar-hud.hbs',
      data,
      (d) => this._generateHTML(d)
    );

    // Locate or create container in DOM
    const doc = globalThis.document;
    if (!doc) {
      this.element = { find: () => ({ click: () => {}, on: () => {} }), html: () => htmlString };
      return this;
    }

    let existing = doc.getElementById('dcc-crawler-hotbar-hud');
    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = htmlString.trim();
    const newElement = tempDiv.firstElementChild;

    if (existing) {
      existing.replaceWith(newElement);
    } else {
      const hotbar = doc.getElementById('hotbar');
      if (hotbar && hotbar.parentElement) {
        hotbar.parentElement.insertBefore(newElement, hotbar);
      } else {
        const uiBottom = doc.getElementById('ui-bottom');
        if (uiBottom) {
          uiBottom.appendChild(newElement);
        } else {
          doc.body?.appendChild(newElement);
        }
      }
    }

    this.element = newElement;
    const $html = globalThis.$ ? globalThis.$(this.element) : this.element;
    this.activateListeners($html);

    if (globalThis.ui?.windows) {
      globalThis.ui.windows[this.id] = this;
    }
    return this;
  }

  /**
   * Binds user interactions to hotbar actions.
   */
  activateListeners(html) {
    const $ = globalThis.$;
    const root = (typeof html.find === 'function') ? html : (globalThis.$ ? globalThis.$(html) : null);
    if (!root) return;

    // Toggle collapse
    root.find('.dcc-hotbar-toggle').click(ev => {
      ev.preventDefault();
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    // Roll Attack: Hit
    root.find('.roll-hotlist-attack').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'hit');
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Roll Attack: Damage
    root.find('.roll-hotlist-attack-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'damage');
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Cast Spell
    root.find('.roll-hotlist-spell').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (!item && globalThis.CONFIG?.DCC?.spells) {
        const compSpell = CONFIG.DCC.spells.find(s => s._id === itemId || s.name === itemId);
        if (compSpell) {
          const owned = (this.actor.items || []).find?.(s => s.name?.toLowerCase().trim() === compSpell.name?.toLowerCase().trim());
          item = owned;
        }
      }
      if (item && typeof this.actor.rollSpell === 'function') {
        await this.actor.rollSpell(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Roll Spell Damage
    root.find('.roll-hotlist-spell-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollSpellDamage === 'function') {
        await this.actor.rollSpellDamage(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Toggle Gear Equip
    root.find('.toggle-hotlist-equip').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item) {
        const newEquipped = !item.system?.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Use Item (Loot / Skill)
    root.find('.roll-hotlist-use').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (!item) return;

      if (item.type === 'skill') {
        if (typeof this.actor.rollSkill === 'function') {
          return this.actor.rollSkill(item);
        }
        return;
      }
      if (typeof item.useLoot === 'function') {
        await item.useLoot();
      } else if (typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Clear Hotlist Slot
    root.find('.hotlist-slot-clear').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = $(ev.currentTarget).data('slot');
      if (slot) {
        await this.actor.update({ [`system.hotlist.${slot}`]: '' });
      }
    });

    // Drag & Drop into Slot
    root.find('.dcc-hotbar-hud-slot').on('dragover', ev => {
      ev.preventDefault();
      $(ev.currentTarget).addClass('drag-over');
    }).on('dragleave', ev => {
      $(ev.currentTarget).removeClass('drag-over');
    }).on('drop', async ev => {
      ev.preventDefault();
      $(ev.currentTarget).removeClass('drag-over');
      const slot = $(ev.currentTarget).data('slot');
      if (!slot) return;

      let data;
      try {
        const raw = ev.originalEvent?.dataTransfer?.getData('text/plain') || ev.dataTransfer?.getData('text/plain');
        data = JSON.parse(raw);
      } catch (_) {
        return;
      }

      if (data?.type === 'Item') {
        let item = null;
        if (typeof globalThis.Item?.fromDropData === 'function') {
          item = await globalThis.Item.fromDropData(data);
        } else if (data.uuid) {
          item = this.actor.items?.get?.(data.uuid);
        }
        if (item) {
          await this.actor.update({ [`system.hotlist.${slot}`]: item.id });
        }
      }
    });
  }

  /**
   * Closes the Hotbar HUD and cleans up DOM.
   */
  async close() {
    if (this.element && typeof this.element.remove === 'function') {
      this.element.remove();
    } else if (globalThis.document) {
      const el = globalThis.document.getElementById('dcc-crawler-hotbar-hud');
      el?.remove();
    }
    this.element = null;
    if (globalThis.ui?.windows && this.id) {
      delete globalThis.ui.windows[this.id];
    }
    return Promise.resolve();
  }
}

/**
 * =========================================================================
 * DCCCrawlerActionHUD
 * Renders all attacks and non-passive skills on the left of the screen,
 * positioned directly below the scene list (#navigation / #scene-list).
 * =========================================================================
 */
export class DCCCrawlerActionHUD {
  constructor(actor, token = null, options = {}) {
    this.actor = actor;
    this.token = token;
    this.options = Object.assign({ id: 'dcc-crawler-action-hud' }, options);
    this.id = this.options.id;
    this.element = null;
    this.isCollapsed = Boolean(options.isCollapsed);
  }

  /**
   * Prepares attacks and non-passive skills.
   */
  async getData() {
    const allItems = Array.isArray(this.actor?.items)
      ? this.actor.items
      : (this.actor?.items?.contents || Array.from(this.actor?.items || []));

    const attacks = [];
    const skills = [];

    for (const item of allItems) {
      if (item.type === 'attack') {
        const dmgDice = item.system?.damageDice || '';
        const dmgStat = (item.system?.damageStat || '').toUpperCase();
        let formula = dmgDice;
        if (dmgStat) formula = `${formula} + ${dmgStat}`;
        if (item.system?.damageType) formula = `${formula} (${item.system.damageType})`;

        attacks.push({
          id: item.id,
          name: item.name,
          img: item.img || 'icons/svg/sword.svg',
          formula: formula.trim(),
          item
        });
      } else if (item.type === 'skill') {
        if (isPassiveSkill(item)) continue; // Filter out passive skills!

        const rank = item.system?.modifiedRank ?? item.system?.rank ?? 1;
        const stat = (item.system?.stat || 'str').toLowerCase();
        const statMod = this.actor?.system?.abilities?.[stat]?.mod ?? 0;
        const totalSkill = rank + statMod;

        const dmgData = typeof this.actor?.getSkillDamageData === 'function'
          ? this.actor.getSkillDamageData(item)
          : { hasDamage: false };

        const checkType = (item.system?.checkType || '').toLowerCase();
        const skillType = item.system?.skillType || item.system?.type || '';
        const isAttack = dmgData.hasDamage ||
          checkType.includes('attack') ||
          ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
          (item.system?.category || '').toLowerCase() === 'combat';

        skills.push({
          id: item.id,
          name: item.name,
          img: item.img || 'icons/svg/aura.svg',
          rank,
          stat: stat.toUpperCase(),
          statMod,
          statModStr: statMod >= 0 ? `+${statMod}` : `${statMod}`,
          totalSkill,
          totalSkillStr: totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`,
          hasDamage: dmgData.hasDamage,
          damageFormula: dmgData.formulaWithStat || '',
          isAttack,
          item
        });
      }
    }

    // Sort alphabetically by name
    attacks.sort((a, b) => a.name.localeCompare(b.name));
    skills.sort((a, b) => a.name.localeCompare(b.name));

    return {
      actor: this.actor,
      token: this.token,
      crawlerName: this.actor?.name || 'Crawler',
      isCollapsed: this.isCollapsed,
      attacks,
      skills,
      attackCount: attacks.length,
      skillCount: skills.length
    };
  }

  /**
   * Computes top and left position directly below the scene list.
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

    this.element.style.setProperty('--dcc-action-hud-top', `${top}px`);
    this.element.style.setProperty('--dcc-action-hud-left', `${left}px`);
    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  /**
   * Generates fallback HTML markup if renderTemplate is unavailable.
   */
  _generateHTML(data) {
    let attacksHtml = '';
    for (const a of data.attacks) {
      attacksHtml += `
        <div class="dcc-action-item" data-item-id="${a.id}">
          <div class="dcc-action-item-info">
            <img class="dcc-action-item-icon" src="${a.img}" alt="${a.name}" />
            <div class="dcc-action-item-details">
              <span class="dcc-action-item-name" title="${a.name}">${a.name}</span>
              ${a.formula ? `<span class="dcc-action-item-sub">${a.formula}</span>` : ''}
            </div>
          </div>
          <div class="dcc-action-item-btns">
            <button type="button" class="dcc-hud-btn dcc-hud-btn-hit roll-attack-hit" title="Roll Attack: ${a.name}"><i class="fa-solid fa-crosshairs"></i> Hit</button>
            <button type="button" class="dcc-hud-btn dcc-hud-btn-dmg roll-attack-dmg" title="Roll Damage: ${a.name}"><i class="fa-solid fa-burst"></i> Dmg</button>
          </div>
        </div>`;
    }
    if (!attacksHtml) {
      attacksHtml = '<div class="dcc-action-empty">No attacks found.</div>';
    }

    let skillsHtml = '';
    for (const sk of data.skills) {
      let btns = '';
      if (sk.isAttack) {
        btns += `
          <button type="button" class="dcc-hud-btn dcc-hud-btn-hit roll-skill" title="Roll Attack Check: ${sk.name}"><i class="fa-solid fa-crosshairs"></i> Hit</button>`;
        if (sk.hasDamage) {
          btns += `
          <button type="button" class="dcc-hud-btn dcc-hud-btn-dmg roll-skill-dmg" title="Roll Damage: ${sk.name}"><i class="fa-solid fa-burst"></i> Dmg</button>`;
        }
      } else {
        btns += `
          <button type="button" class="dcc-hud-btn dcc-hud-btn-use roll-skill" title="Roll Skill Check: ${sk.name}"><i class="fa-solid fa-dice-d20"></i> Roll</button>`;
      }

      skillsHtml += `
        <div class="dcc-action-item" data-item-id="${sk.id}">
          <div class="dcc-action-item-info">
            <img class="dcc-action-item-icon" src="${sk.img}" alt="${sk.name}" />
            <div class="dcc-action-item-details">
              <span class="dcc-action-item-name" title="${sk.name}">${sk.name}</span>
              <span class="dcc-action-item-sub">Rank ${sk.rank} (${sk.totalSkillStr} ${sk.stat})</span>
            </div>
          </div>
          <div class="dcc-action-item-btns">
            ${btns}
          </div>
        </div>`;
    }
    if (!skillsHtml) {
      skillsHtml = '<div class="dcc-action-empty">No active skills found.</div>';
    }

    return `
      <div id="dcc-crawler-action-hud" class="dcc-crawler-action-hud ${data.isCollapsed ? 'is-collapsed' : ''}" data-actor-id="${data.actor?.id || ''}">
        <div class="dcc-action-hud-panel">
          <div class="dcc-action-hud-header">
            <div class="dcc-action-hud-title">
              <i class="fa-solid fa-skull-crossbones"></i>
              <span>${data.crawlerName} • ACTIONS</span>
            </div>
            <div class="dcc-action-hud-controls">
              <button type="button" class="dcc-action-hud-toggle" title="Toggle Actions Panel">
                <i class="fa-solid ${data.isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}"></i>
              </button>
            </div>
          </div>
          ${data.isCollapsed ? '' : `
          <div class="dcc-action-hud-content">
            <div class="dcc-action-hud-section">
              <div class="dcc-action-section-header">
                <span class="dcc-action-section-title"><i class="fa-solid fa-crosshairs"></i> ATTACKS (${data.attackCount})</span>
              </div>
              <div class="dcc-action-list">${attacksHtml}</div>
            </div>
            <div class="dcc-action-hud-section">
              <div class="dcc-action-section-header">
                <span class="dcc-action-section-title"><i class="fa-solid fa-dice-d20"></i> ACTIVE SKILLS (${data.skillCount})</span>
              </div>
              <div class="dcc-action-list">${skillsHtml}</div>
            </div>
          </div>`}
        </div>
      </div>`;
  }

  /**
   * Renders the Action HUD on the left of the screen directly below the scene list.
   */
  async render(force = false) {
    if (!this.actor) return this;
    const data = await this.getData();
    const htmlString = await renderHUDTemplate(
      'systems/carl-rpg/templates/apps/crawler-action-hud.hbs',
      data,
      (d) => this._generateHTML(d)
    );

    const doc = globalThis.document;
    if (!doc) {
      this.element = { find: () => ({ click: () => {}, on: () => {} }), html: () => htmlString };
      return this;
    }

    let existing = doc.getElementById('dcc-crawler-action-hud');
    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = htmlString.trim();
    const newElement = tempDiv.firstElementChild;

    if (existing) {
      existing.replaceWith(newElement);
    } else {
      const uiInterface = doc.getElementById('interface') || doc.body;
      uiInterface?.appendChild(newElement);
    }

    this.element = newElement;
    this.updatePosition();
    const $html = globalThis.$ ? globalThis.$(this.element) : this.element;
    this.activateListeners($html);

    if (globalThis.ui?.windows) {
      globalThis.ui.windows[this.id] = this;
    }
    return this;
  }

  /**
   * Binds user interactions to action buttons.
   */
  activateListeners(html) {
    const $ = globalThis.$;
    const root = (typeof html.find === 'function') ? html : (globalThis.$ ? globalThis.$(html) : null);
    if (!root) return;

    // Toggle collapse
    root.find('.dcc-action-hud-toggle').click(ev => {
      ev.preventDefault();
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    // Roll Attack: Hit
    root.find('.roll-attack-hit').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'hit');
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Roll Attack: Damage
    root.find('.roll-attack-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'damage');
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Roll Skill: Hit or Check
    root.find('.roll-skill').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (!item) return;

      const dmgData = typeof this.actor?.getSkillDamageData === 'function'
        ? this.actor.getSkillDamageData(item)
        : { hasDamage: false };
      const checkType = (item.system?.checkType || '').toLowerCase();
      const skillType = item.system?.skillType || item.system?.type || '';
      const isAttack = dmgData.hasDamage ||
        checkType.includes('attack') ||
        ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
        (item.system?.category || '').toLowerCase() === 'combat';

      if (isAttack && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'hit');
      } else if (typeof this.actor.rollSkill === 'function') {
        await this.actor.rollSkill(item);
      } else if (typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Roll Skill Damage
    root.find('.roll-skill-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items?.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items?.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollSkillDamage === 'function') {
        await this.actor.rollSkillDamage(item);
      } else if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'damage');
      }
    });
  }

  /**
   * Closes the Action HUD and cleans up DOM.
   */
  async close() {
    if (this.element && typeof this.element.remove === 'function') {
      this.element.remove();
    } else if (globalThis.document) {
      const el = globalThis.document.getElementById('dcc-crawler-action-hud');
      el?.remove();
    }
    this.element = null;
    if (globalThis.ui?.windows && this.id) {
      delete globalThis.ui.windows[this.id];
    }
    return Promise.resolve();
  }
}

/**
 * =========================================================================
 * DCCCrawlerTokenHUD
 * Master manager orchestrating Hotbar HUD and Left Action Panel on token selection.
 * =========================================================================
 */
export class DCCCrawlerTokenHUD {
  constructor() {
    this.hotbarHUD = null;
    this.actionHUD = null;
    this.activeActor = null;
    this.activeToken = null;
    this._initialized = false;
  }

  /**
   * Initializes hooks for token selection and actor updates.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Token control selection hook
    Hooks.on('controlToken', (token, controlled) => {
      this.onControlToken(token, controlled);
    });

    // Scene Navigation render hook to re-align left panel
    Hooks.on('renderSceneNavigation', () => {
      if (this.actionHUD) {
        this.actionHUD.updatePosition();
      }
    });

    // Actor update hook
    Hooks.on('updateActor', (actor) => {
      if (this.activeActor && actor && (actor.id === this.activeActor.id || actor._id === this.activeActor.id)) {
        this.render();
      }
    });

    // Item updates on active actor
    const onItemChange = (item) => {
      const actorId = item?.actor?.id || item?.parent?.id;
      if (this.activeActor && actorId && (actorId === this.activeActor.id || actorId === this.activeActor._id)) {
        this.render();
      }
    };
    Hooks.on('updateItem', onItemChange);
    Hooks.on('createItem', onItemChange);
    Hooks.on('deleteItem', onItemChange);

    // Token deletion hook
    Hooks.on('deleteToken', (token) => {
      if (this.activeToken && (token.id === this.activeToken.id || token._id === this.activeToken._id)) {
        this.close();
      }
    });

    // Canvas ready / reload
    Hooks.on('canvasReady', () => {
      this.syncControlledToken();
    });

    // Window resize
    if (globalThis.window?.addEventListener) {
      globalThis.window.addEventListener('resize', () => {
        if (this.actionHUD) this.actionHUD.updatePosition();
      });
    }
  }

  /**
   * Detects currently controlled crawler token on canvas.
   * @returns {object|null}
   */
  getControlledCrawler() {
    const controlled = globalThis.canvas?.tokens?.controlled || [];
    if (!Array.isArray(controlled) || controlled.length === 0) return null;
    return controlled.find(t => t.actor?.type === 'crawler') || null;
  }

  /**
   * Syncs HUD state with canvas controlled tokens.
   */
  syncControlledToken() {
    const crawlerToken = this.getControlledCrawler();
    if (crawlerToken) {
      this.updateForToken(crawlerToken);
    } else {
      this.close();
    }
  }

  /**
   * Handles controlToken hook event.
   */
  onControlToken(token, controlled) {
    if (controlled) {
      if (token?.actor?.type === 'crawler') {
        this.updateForToken(token);
        return;
      }
    }
    // Check if any other crawler remains controlled
    this.syncControlledToken();
  }

  /**
   * Updates and renders both HUDs for a given crawler token.
   */
  async updateForToken(token) {
    if (!token || token.actor?.type !== 'crawler') {
      return this.close();
    }
    this.activeToken = token;
    this.activeActor = token.actor;

    if (!this.hotbarHUD || this.hotbarHUD.actor?.id !== this.activeActor.id) {
      this.hotbarHUD = new DCCCrawlerHotbarHUD(this.activeActor, this.activeToken);
    } else {
      this.hotbarHUD.actor = this.activeActor;
      this.hotbarHUD.token = this.activeToken;
    }

    if (!this.actionHUD || this.actionHUD.actor?.id !== this.activeActor.id) {
      this.actionHUD = new DCCCrawlerActionHUD(this.activeActor, this.activeToken);
    } else {
      this.actionHUD.actor = this.activeActor;
      this.actionHUD.token = this.activeToken;
    }

    await Promise.all([
      this.hotbarHUD.render(),
      this.actionHUD.render()
    ]);
  }

  /**
   * Re-renders active HUDs with current data.
   */
  async render() {
    if (!this.activeActor) return;
    const promises = [];
    if (this.hotbarHUD) promises.push(this.hotbarHUD.render());
    if (this.actionHUD) promises.push(this.actionHUD.render());
    await Promise.all(promises);
  }

  /**
   * Closes both HUDs and clears references.
   */
  async close() {
    const promises = [];
    if (this.hotbarHUD) promises.push(this.hotbarHUD.close());
    if (this.actionHUD) promises.push(this.actionHUD.close());
    this.hotbarHUD = null;
    this.actionHUD = null;
    this.activeActor = null;
    this.activeToken = null;
    await Promise.all(promises);
  }
}

/**
 * Singleton instance and initialization function.
 */
let crawlerTokenHUDInstance = null;

export function getCrawlerTokenHUD() {
  if (!crawlerTokenHUDInstance) {
    crawlerTokenHUDInstance = new DCCCrawlerTokenHUD();
  }
  return crawlerTokenHUDInstance;
}

export function initCrawlerTokenHUD() {
  const hud = getCrawlerTokenHUD();
  hud.init();
  return hud;
}
