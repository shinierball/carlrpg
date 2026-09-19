/**
 * DCC RPG — Buff & Debuff Condition Manager Application
 * Centralized interface for browsing, inspecting, and applying status effects, buffs, and debuffs.
 */
import { DCCBaseApplication } from './base-application.mjs';

export class DCCBuffDebuffManager extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.targetSlot = options.targetSlot ?? null;
    this.activeTab = options.activeTab || 'all';
    this.searchQuery = '';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-buff-manager',
      classes: ['dcc-sheet-window', 'dcc-buff-manager-window'],
      template: 'systems/carl-rpg/templates/apps/buff-manager.hbs',
      title: 'DCC RPG — Buff & Condition Library',
      width: 780,
      height: 720,
      resizable: true
    });
  }

  /**
   * Retrieve unified list of buffs and debuffs from CONFIG, compendiums, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getUnifiedConditions() {
    const list = [];

    // 1. Buffs from CONFIG.DCC.buffs
    const configBuffs = typeof CONFIG !== 'undefined' ? (CONFIG.DCC?.buffs || []) : [];
    for (const b of configBuffs) {
      list.push({
        id: b._id || b.name,
        name: b.name,
        type: 'buff',
        img: b.img || 'icons/svg/aura.svg',
        source: 'compendium',
        system: structuredClone(b.system || {})
      });
    }

    // 2. Debuffs from CONFIG.DCC.debuffs
    const configDebuffs = typeof CONFIG !== 'undefined' ? (CONFIG.DCC?.debuffs || []) : [];
    for (const d of configDebuffs) {
      list.push({
        id: d._id || d.name,
        name: d.name,
        type: 'debuff',
        img: d.img || 'icons/svg/skull.svg',
        source: 'compendium',
        system: structuredClone(d.system || {})
      });
    }

    // 3. World Items (Buffs & Debuffs)
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'buff' || item.type === 'debuff') {
          const norm = item.name.toLowerCase().trim();
          if (!list.some(c => c.name.toLowerCase().trim() === norm && c.type === item.type)) {
            list.push({
              id: item.id,
              name: item.name,
              type: item.type,
              img: item.img || (item.type === 'buff' ? 'icons/svg/aura.svg' : 'icons/svg/skull.svg'),
              source: 'world',
              system: structuredClone(item.system || {})
            });
          }
        }
      }
    }

    // 4. Actor-Specific Items (Buffs & Debuffs on Actor)
    if (this.actor?.items) {
      for (const item of this.actor.items) {
        if (item.type === 'buff' || item.type === 'debuff') {
          const norm = item.name?.toLowerCase().trim();
          if (!list.some(c => c.id === item.id || (c.name?.toLowerCase().trim() === norm && c.type === item.type))) {
            list.push({
              id: item.id,
              name: item.name,
              type: item.type,
              img: item.img || (item.type === 'buff' ? 'icons/svg/aura.svg' : 'icons/svg/skull.svg'),
              source: 'actor',
              system: structuredClone(item.system || {})
            });
          }
        }
      }
    }

    // Determine if active on bound actor
    const ownedItemNames = new Set(
      this.actor?.items?.filter
        ? this.actor.items.map(i => `${i.type}:${i.name.toLowerCase().trim()}`)
        : []
    );

    // Also check externalBuffs slots for buffs
    const rawExternal = this.actor?.system?.attributes?.externalBuffs || {};
    const externalBuffVals = Object.values(rawExternal).map(v => String(v).toLowerCase().trim()).filter(Boolean);

    return list.map(entry => {
      const norm = entry.name.toLowerCase().trim();
      const isOwned = ownedItemNames.has(`${entry.type}:${norm}`);
      const isAssignedSlot = entry.type === 'buff' && externalBuffVals.some(v => v === norm || v === entry.id.toLowerCase());
      const isBuff = entry.type === 'buff';
      const isDebuff = entry.type === 'debuff';

      // Summarize effect
      const sys = entry.system || {};
      let summary = '';
      if (isBuff) {
        if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
          summary = sys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
        } else if (sys.buffType === 'stat' && sys.stat) {
          summary = `+${sys.value || 2} ${(sys.stat || '').toUpperCase()}`;
        } else if (sys.buffType === 'tempHp' || sys.buffType === 'temp_hp') {
          summary = `+${sys.value || 10} Temp HP`;
        } else if (sys.buffType === 'resistance' && sys.damageType) {
          summary = `Resist ${sys.damageType}`;
        } else if (sys.buffType === 'immunity' && sys.damageType) {
          summary = `Immune ${sys.damageType}`;
        } else if (sys.buffType === 'damageMultiplier') {
          summary = `*${sys.damageMultiplier || sys.value || 2} Damage`;
        }
      } else {
        if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
          summary = sys.statModifiers.map(m => `${m.value > 0 ? '+' : ''}${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
        } else if (sys.stat) {
          summary = `${Number(sys.value) > 0 ? '+' : ''}${sys.value} ${(sys.stat || '').toUpperCase()}`;
        }
        if (sys.reductionPercent && sys.damageType) {
          summary = (summary ? `${summary} • ` : '') + `-${sys.reductionPercent}% ${sys.damageType}`;
        }
      }

      return {
        ...entry,
        isBuff,
        isDebuff,
        isActive: isOwned || isAssignedSlot,
        summary: summary || sys.description || '',
        severityBadge: isDebuff ? (sys.severity === 'Major' ? 'dcc-badge-attack' : 'dcc-badge-item') : 'dcc-badge-gear'
      };
    }).sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name);
    });
  }

  /** @override */
  async getData(options) {
    const allConditions = await this.getUnifiedConditions();

    const counts = {
      all: allConditions.length,
      buffs: allConditions.filter(c => c.isBuff).length,
      debuffs: allConditions.filter(c => c.isDebuff).length,
      stat: allConditions.filter(c => c.system?.buffType === 'stat' || (Array.isArray(c.system?.statModifiers) && c.system.statModifiers.length > 0)).length,
      defense: allConditions.filter(c => ['resistance', 'immunity', 'tempHp', 'temp_hp'].includes(c.system?.buffType)).length
    };

    const filtered = allConditions.filter(c => {
      if (this.activeTab === 'buffs' && !c.isBuff) return false;
      if (this.activeTab === 'debuffs' && !c.isDebuff) return false;
      if (this.activeTab === 'stat' && c.system?.buffType !== 'stat' && (!Array.isArray(c.system?.statModifiers) || !c.system.statModifiers.length)) return false;
      if (this.activeTab === 'defense' && !['resistance', 'immunity', 'tempHp', 'temp_hp'].includes(c.system?.buffType)) return false;

      if (this.searchQuery) {
        const q = this.searchQuery;
        const nameMatch = c.name.toLowerCase().includes(q);
        const descMatch = (c.system?.description || '').toLowerCase().includes(q);
        const summMatch = (c.summary || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !summMatch) return false;
      }
      return true;
    });

    return {
      conditions: filtered,
      counts,
      activeTab: this.activeTab,
      searchQuery: this.searchQuery,
      targetSlot: this.targetSlot,
      actor: this.actor,
      isActorPicker: Boolean(this.actor)
    };
  }

  /**
   * Apply selected condition to the actor.
   * @param {object} itemData
   */
  async applyConditionToActor(itemData) {
    if (!this.actor) {
      globalThis.ui?.notifications?.warn('No character sheet open to apply this condition.');
      return;
    }

    if (itemData.type === 'buff') {
      // If targeting a specific external buff slot
      const buffId = itemData.id || itemData._id || itemData.name;
      if (this.targetSlot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${this.targetSlot}`]: buffId });
        globalThis.ui?.notifications?.info(`Assigned "${itemData.name}" to slot ${this.targetSlot} on ${this.actor.name}.`);
        if (typeof this.close === 'function') this.close();
        return;
      }

      // Check for an empty external buff slot first
      const rawExternal = this.actor.system?.attributes?.externalBuffs || {};
      let emptySlot = null;
      for (const slot of ['buff1', 'buff2', 'buff3']) {
        if (!rawExternal[slot]) {
          emptySlot = slot;
          break;
        }
      }

      if (emptySlot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${emptySlot}`]: buffId });
        globalThis.ui?.notifications?.info(`Activated "${itemData.name}" in external buff slot on ${this.actor.name}.`);
      } else {
        // Embed item on actor inventory
        await this.actor.createEmbeddedDocuments('Item', [{
          name: itemData.name,
          type: 'buff',
          img: itemData.img,
          system: structuredClone(itemData.system || {})
        }]);
        globalThis.ui?.notifications?.info(`Added "${itemData.name}" to ${this.actor.name} buffs.`);
      }
    } else if (itemData.type === 'debuff') {
      // Embed debuff item directly on actor
      await this.actor.createEmbeddedDocuments('Item', [{
        name: itemData.name,
        type: 'debuff',
        img: itemData.img,
        system: structuredClone(itemData.system || {})
      }]);
      globalThis.ui?.notifications?.info(`Inflicted "${itemData.name}" condition on ${this.actor.name}.`);
    }

    if (typeof this.render === 'function') this.render(false);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.condition-search-input').on('input', ev => {
      this.searchQuery = (ev.currentTarget.value || '').toLowerCase().trim();
      this.render(false);
    });

    html.find('.condition-search-clear').click(ev => {
      ev.preventDefault();
      this.searchQuery = '';
      this.render(false);
    });

    html.find('.condition-tab-pill').click(ev => {
      ev.preventDefault();
      this.activeTab = $(ev.currentTarget).data('tab') || 'all';
      this.render(false);
    });

    html.find('.btn-apply-condition').click(async ev => {
      ev.preventDefault();
      const condName = $(ev.currentTarget).data('name');
      const condType = $(ev.currentTarget).data('type');
      const all = await this.getUnifiedConditions();
      const match = all.find(c => c.name.toLowerCase().trim() === String(condName).toLowerCase().trim() && c.type === condType);
      if (match) {
        await this.applyConditionToActor(match);
      }
    });
  }
}
