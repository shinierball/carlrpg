/**
 * Dungeon Crawler Carl RPG — Grinding & Downtime Application
 *
 * Provides a dedicated, interactive party hub for:
 * - Setting grinding hours (1 to 12 hrs, default 5 hrs)
 * - Toggling Guide / Companion Insight (+1 safe hour, e.g. Huey / Bob)
 * - Party Roster Selection (checkboxes for all party crawlers)
 * - Party sub-tabs to inspect each crawler, allocate banked hours, and trigger individual advancement checks
 * - Individual Endurance Checks per participant & Fatigued debuff applied only to failures
 * - Resetting unallocated pool hours to 0 at the start of a new grind (use it or lose it)
 * - Decrementing the global Floor Timer Clock once by non-bonus hours accrued
 */

import { DCCBaseApplication } from './base-application.mjs';
import { DCCActor } from '../documents/actor.mjs';
import { DCCSessionEngine } from './session-manager.mjs';
import {
  DCC_GRINDING_COMPLICATIONS,
  getRequiredGrindingHours,
  getAdvancementTarget,
  getEnduranceDC,
  getSafeGrindingThreshold
} from '../data/grinding.mjs';

const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog
  ?? globalThis.Dialog;

export class DCCGrindApp extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.selectedSkillId = options.selectedSkillId || options.skillId || null;
    this.hours = Number(options.hours) || 5;
    this.hasGuideBonus = Boolean(options.hasGuideBonus);
    this.rollComplication = options.rollComplication !== false;

    // Party selection state
    this.selectedActorIds = null;
    this.activeCrawlerId = this.actor?.id || null;

    // Map selection: explicit option or auto-detect from actor inventory
    if (options.mapType) {
      this.mapType = String(options.mapType).toLowerCase().trim();
    } else if (options.hasBoroughMap || options.hasBurroughMap || options.mapBonus === 2) {
      this.mapType = 'borough';
    } else if (options.hasNeighborhoodMap || options.mapBonus === 1) {
      this.mapType = 'neighborhood';
    } else {
      this.mapType = this._detectMapFromActor();
    }

    // Default floor number from actor
    if (this.actor?.system?.details?.floor) {
      const match = String(this.actor.system.details.floor).match(/\d+/);
      this.floorNumber = match ? Math.max(1, parseInt(match[0], 10)) : 1;
    } else {
      this.floorNumber = 1;
    }
  }

  /**
   * Check actor items for Neighborhood Map (+1 hr) or Borough Map (+2 hrs)
   * @returns {string} 'none' | 'neighborhood' | 'borough'
   */
  _detectMapFromActor() {
    if (!this.actor?.items) return 'none';
    const items = this.actor.items.filter ? this.actor.items.filter(i => true) : Array.from(this.actor.items.values?.() || this.actor.items);
    let found = 'none';
    for (const item of items) {
      const name = (item.name || '').toLowerCase();
      if (name.includes('burrough map') || name.includes('borough map')) {
        return 'borough';
      }
      if (name.includes('neighborhood map')) {
        found = 'neighborhood';
      }
    }
    return found;
  }

  /**
   * Resolve all active crawlers in the world
   * @returns {Actor[]}
   */
  _getAllCrawlers() {
    if (globalThis.game?.actors) {
      const list = Array.from(globalThis.game.actors.values ? globalThis.game.actors.values() : globalThis.game.actors);
      const crawlers = list.filter(a => a.type === 'crawler');
      if (crawlers.length > 0) return crawlers;
    }
    return this.actor ? [this.actor] : [];
  }

  /**
   * Resolve crawler IDs tracked in the active session
   * @param {Actor[]} [allCrawlers=[]]
   * @returns {Set<string>|null}
   */
  _getSessionTrackedCrawlerIds(allCrawlers = []) {
    try {
      const engine = typeof DCCSessionEngine !== 'undefined'
        ? DCCSessionEngine
        : (globalThis.DCCSessionEngine || globalThis.game?.dcc?.DCCSessionEngine);
      if (engine && typeof engine.getAllSessions === 'function') {
        const sessions = engine.getAllSessions() || [];
        const activeId = engine.getActiveSessionId ? engine.getActiveSessionId() : null;
        const active = sessions.find(s => s.id === activeId && s.status === 'active') || sessions.find(s => s.status === 'active');
        if (active) {
          if (Array.isArray(active.trackedCrawlerIds) && active.trackedCrawlerIds.length > 0) {
            const valid = active.trackedCrawlerIds.filter(id => allCrawlers.some(c => c.id === id));
            if (valid.length > 0) return new Set(valid);
          }
          if (active.crawlers && typeof active.crawlers === 'object') {
            const keys = Object.keys(active.crawlers).filter(id => allCrawlers.some(c => c.id === id));
            if (keys.length > 0) return new Set(keys);
          }
          if (active.party && active.party !== 'all') {
            const pNorm = active.party.trim().toLowerCase();
            const partyCrawlers = allCrawlers.filter(c => (c.system?.details?.party || '').trim().toLowerCase() === pNorm);
            if (partyCrawlers.length > 0) return new Set(partyCrawlers.map(c => c.id));
          }
        }
      }
    } catch (err) {
      console.warn('DCC RPG | Could not resolve session tracked crawlers:', err);
    }
    return null;
  }

  /** @override */
  static get defaultOptions() {
    const parentOpts = typeof super.defaultOptions === 'object' ? super.defaultOptions : {};
    const mergeFn = globalThis.foundry?.utils?.mergeObject || Object.assign;
    return mergeFn(parentOpts, {
      id: 'dcc-grind-app',
      classes: ['dcc-sheet-window', 'dcc-grind-app-window'],
      template: 'systems/carl-rpg/templates/apps/grind-app.hbs',
      title: 'DCC RPG — Party Grinding & Downtime Hub',
      width: 720,
      height: 'auto',
      resizable: true
    });
  }

  /** @override */
  async getData() {
    const context = (typeof super.getData === 'function') ? await super.getData() : {};
    const allCrawlers = this._getAllCrawlers();

    // Initialize selected actor IDs if not yet set (defaulting to those tracked in the active session)
    if (!this.selectedActorIds) {
      const sessionTracked = this._getSessionTrackedCrawlerIds(allCrawlers);
      if (sessionTracked && sessionTracked.size > 0) {
        this.selectedActorIds = sessionTracked;
        if (this.actor?.id && !this.selectedActorIds.has(this.actor.id)) {
          this.selectedActorIds.add(this.actor.id);
        }
      } else {
        this.selectedActorIds = new Set(allCrawlers.map(c => c.id));
      }
    }

    // Active crawler for skills inspection & individual hour allocation
    if (!this.activeCrawlerId || !allCrawlers.some(c => c.id === this.activeCrawlerId)) {
      this.activeCrawlerId = this.actor?.id || allCrawlers[0]?.id || null;
    }

    const activeCrawler = allCrawlers.find(c => c.id === this.activeCrawlerId) || this.actor || allCrawlers[0] || null;
    this.actor = activeCrawler;
    context.actor = activeCrawler;

    context.hours = this.hours;
    context.hasGuideBonus = this.hasGuideBonus;
    context.floorNumber = this.floorNumber;
    context.rollComplication = this.rollComplication;

    const { safeThreshold, mapBonus } = getSafeGrindingThreshold({
      hasGuideBonus: this.hasGuideBonus,
      mapType: this.mapType
    });
    const excessHours = Math.max(0, this.hours - safeThreshold);
    context.mapType = this.mapType;
    context.mapBonus = mapBonus;
    context.safeThreshold = safeThreshold;
    context.excessHours = excessHours;
    context.isMapNone = this.mapType === 'none';
    context.isMapNeighborhood = this.mapType === 'neighborhood';
    context.isMapBorough = this.mapType === 'borough' || this.mapType === 'burrough';

    // Global Floor Timer Clock
    const floorTimer = (typeof DCCActor !== 'undefined' && typeof DCCActor.getFloorTimer === 'function')
      ? DCCActor.getFloorTimer()
      : (globalThis.CONFIG?.DCC?.getFloorTimer?.() ?? (Number(globalThis.game?.settings?.get?.('carl-rpg', 'floorTimer')) || 100));
    context.floorTimer = floorTimer;
    context.resultingFloorTimer = Math.max(0, floorTimer - this.hours);

    // Map Party Roster
    context.crawlers = allCrawlers.map(c => {
      const isSelected = this.selectedActorIds.has(c.id);
      const isActive = c.id === this.activeCrawlerId;
      const actorBanked = Number(c.system?.details?.bankedGrindHours ?? c.system?.bankedGrindHours) || 0;
      return {
        id: c.id,
        name: c.name,
        img: c.img || 'icons/svg/mystery-man.svg',
        bankedHours: actorBanked,
        isSelected,
        isActive
      };
    });
    context.selectedCount = Array.from(this.selectedActorIds).length;

    // Active Crawler Banked Hours
    const activeBanked = Number(activeCrawler?.system?.details?.bankedGrindHours ?? activeCrawler?.system?.bankedGrindHours) || 0;
    const bankedHours = (this.lastGrindResult?.bankedHours !== undefined && this.lastGrindResult?.actorId === activeCrawler?.id)
      ? this.lastGrindResult.bankedHours
      : activeBanked;
    context.bankedHours = bankedHours;
    context.lastGrindResult = this.lastGrindResult || null;

    // Active Crawler Endurance stats
    const allSkills = activeCrawler?.items ? (activeCrawler.items.filter ? activeCrawler.items.filter(i => i.type === 'skill') : Array.from(activeCrawler.items.values?.() || activeCrawler.items).filter(i => i.type === 'skill')) : [];
    const enduranceSkill = allSkills.find(s => s.name?.toLowerCase().trim() === 'endurance');
    const endRank = Number(enduranceSkill?.modifiedRank ?? enduranceSkill?.system?.rank) || 0;
    const conMod = activeCrawler?.system?.abilities?.con?.mod ?? 0;
    context.enduranceRank = endRank;
    context.conMod = conMod;
    context.enduranceBonusStr = (endRank + conMod) >= 0 ? `+${endRank + conMod}` : `${endRank + conMod}`;

    // Map Active Crawler Skills for in-app allocation & advancement
    const mappedSkills = allSkills.map(skill => {
      const baseRank = Number(skill.system?.rank) || 0;
      const modifiedRank = Number(skill.modifiedRank ?? skill.system?.modifiedRank ?? baseRank);
      const isChecked = Boolean(skill.system?.checked);
      const reqHours = getRequiredGrindingHours(baseRank);
      const target = getAdvancementTarget(baseRank);
      const investedHours = Number(skill.system?.investedHours ?? skill.system?.grindHours) || 0;
      const neededHours = Math.max(0, reqHours - investedHours);
      const isSelected = skill.id === this.selectedSkillId;
      const canAdvance = investedHours >= reqHours;
      const canAddHour = bankedHours > 0 && investedHours < reqHours;
      const canSubHour = investedHours > 0;
      const progressPct = Math.min(100, Math.round((investedHours / Math.max(1, reqHours)) * 100));

      return {
        id: skill.id,
        name: skill.name,
        img: skill.img || 'icons/svg/item-bag.svg',
        baseRank,
        modifiedRank,
        stat: (skill.system?.stat || 'str').toUpperCase(),
        checked: isChecked,
        requiredHours: reqHours,
        investedHours,
        neededHours,
        canAddHour,
        canSubHour,
        progressPct,
        target,
        isSelected,
        canAdvance
      };
    });

    // Auto-select first checked skill if none selected
    if (!this.selectedSkillId && mappedSkills.length > 0) {
      const firstChecked = mappedSkills.find(s => s.checked);
      if (firstChecked) {
        this.selectedSkillId = firstChecked.id;
        firstChecked.isSelected = true;
      }
    }

    // Sort: selected first, then checked, then alphabetical
    mappedSkills.sort((a, b) => {
      if (a.isSelected) return -1;
      if (b.isSelected) return 1;
      if (a.checked && !b.checked) return -1;
      if (!a.checked && b.checked) return 1;
      return a.name.localeCompare(b.name);
    });

    context.skills = mappedSkills;
    context.selectedSkill = mappedSkills.find(s => s.id === this.selectedSkillId) || null;
    context.complications = DCC_GRINDING_COMPLICATIONS;

    return context;
  }

  /** @override */
  activateListeners(html) {
    if (typeof super.activateListeners === 'function') {
      super.activateListeners(html);
    }

    const $ = globalThis.$;
    const root = (typeof html.find === 'function') ? html : (globalThis.$ ? globalThis.$(html) : null);
    if (!root) return;

    // Hours slider / input change
    root.find('.grind-hours-input').on('input change', ev => {
      const val = parseInt(ev.currentTarget.value, 10);
      if (!isNaN(val) && val >= 1) {
        this.hours = val;
        this.render(false);
      }
    });

    // Floor input change
    root.find('.grind-floor-input').on('change', ev => {
      const val = parseInt(ev.currentTarget.value, 10);
      if (!isNaN(val) && val >= 1) {
        this.floorNumber = val;
        this.render(false);
      }
    });

    // Guide bonus toggle
    root.find('.guide-bonus-toggle').on('change', ev => {
      this.hasGuideBonus = ev.currentTarget.checked;
      this.render(false);
    });

    // Map selector
    root.find('.grind-map-select').on('change', ev => {
      this.mapType = ev.currentTarget.value;
      this.render(false);
    });

    // Complication toggle
    root.find('.complication-toggle').on('change', ev => {
      this.rollComplication = ev.currentTarget.checked;
    });

    // Floor timer clock manual change
    root.find('.floor-timer-clock-input').on('change', async ev => {
      const val = parseFloat(ev.currentTarget.value);
      if (Number.isFinite(val) && typeof DCCActor.setFloorTimer === 'function') {
        await DCCActor.setFloorTimer(val);
        this.render(false);
      }
    });

    // Party Roster Checkbox toggle
    root.find('.crawler-select-checkbox').on('change', ev => {
      const actorId = $(ev.currentTarget).data('actorId');
      if (actorId) {
        if (ev.currentTarget.checked) {
          this.selectedActorIds.add(actorId);
        } else {
          this.selectedActorIds.delete(actorId);
        }
        this.render(false);
      }
    });

    // Switch Active Crawler Tab
    root.find('.crawler-tab-btn').on('click', ev => {
      ev.preventDefault();
      const actorId = $(ev.currentTarget).data('actorId');
      if (actorId) {
        this.activeCrawlerId = actorId;
        this.selectedSkillId = null;
        this.render(false);
      }
    });

    // Skill card selection
    root.find('.grind-skill-option').on('click', ev => {
      ev.preventDefault();
      const skillId = $(ev.currentTarget).data('skillId') || ev.currentTarget.dataset?.skillId;
      if (skillId) {
        this.selectedSkillId = skillId;
        this.render(false);
      }
    });

    // Hour allocation buttons (+1, -1, Max)
    root.find('.allocate-hours-btn').on('click', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const btn = $(ev.currentTarget);
      const skillId = btn.data('skillId') || btn.closest('[data-skill-id]').data('skillId');
      const action = btn.data('action');
      if (!this.actor || !skillId) return;

      let allocRes = null;
      if (action === 'add') {
        allocRes = await this.actor.allocateGrindHours(skillId, 1);
      } else if (action === 'sub') {
        allocRes = await this.actor.allocateGrindHours(skillId, -1);
      } else if (action === 'max') {
        const skill = this.actor.items?.get ? this.actor.items.get(skillId) : this.actor.items?.find?.(i => i.id === skillId || i._id === skillId);
        const req = getRequiredGrindingHours(skill?.system?.rank || 0);
        const invested = Number(skill?.system?.investedHours ?? skill?.system?.grindHours) || 0;
        const needed = Math.max(0, req - invested);
        allocRes = await this.actor.allocateGrindHours(skillId, needed);
      }
      if (this.lastGrindResult && allocRes?.newBank !== undefined) {
        this.lastGrindResult.bankedHours = allocRes.newBank;
      }
      this.render(false);
    });

    // Attempt Skill Advancement
    root.find('.attempt-advancement-btn').on('click', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const btn = $(ev.currentTarget);
      const skillId = btn.data('skillId') || btn.closest('[data-skill-id]').data('skillId');
      if (!this.actor || !skillId) return;

      await this.actor.attemptSkillAdvancement(skillId);
      this.render(false);
    });

    // Dismiss last grind result alert
    root.find('.dismiss-grind-alert-btn').on('click', ev => {
      ev.preventDefault();
      this.lastGrindResult = null;
      this.render(false);
    });

    // Execute Grind Session (Party-Wide or Selected Crawlers)
    root.find('.execute-grind-btn').on('click', async ev => {
      ev.preventDefault();
      const allCrawlers = this._getAllCrawlers();
      const participants = allCrawlers.filter(c => this.selectedActorIds.has(c.id));
      if (participants.length === 0) {
        if (globalThis.ui?.notifications) {
          globalThis.ui.notifications.warn('Please select at least one crawler in the party to grind.');
        }
        return;
      }

      const { mapBonus } = getSafeGrindingThreshold({ mapType: this.mapType });
      const options = {
        hours: this.hours,
        hasGuideBonus: this.hasGuideBonus,
        mapType: this.mapType,
        mapBonus,
        hasNeighborhoodMap: this.mapType === 'neighborhood',
        hasBoroughMap: this.mapType === 'borough' || this.mapType === 'burrough',
        hasBurroughMap: this.mapType === 'borough' || this.mapType === 'burrough',
        floor: this.floorNumber,
        rollComplication: this.rollComplication,
        resetPool: true // Use it or lose it
      };

      const result = await DCCActor.executePartyGrindSession(participants, options);
      this.lastGrindResult = result;
      this.render(false);
    });

    // Safe Room Rest button
    root.find('.safe-room-rest-btn').on('click', async ev => {
      ev.preventDefault();
      if (!this.actor) return;
      if (DialogClass && typeof DialogClass.confirm === 'function') {
        const proceed = await DialogClass.confirm({
          title: 'Safe Room Rest',
          content: '<p>Retreat to a Safe Room for an <strong>8-Hour Long Rest</strong>? This will fully refill your 10 Health Bars, restore all Mana, and clear all stacked Fatigued debuffs.</p>'
        });
        if (proceed) {
          await this.actor.restSafeRoom();
          this.close();
        }
      } else {
        await this.actor.restSafeRoom();
        this.close();
      }
    });

    // Close Hub
    root.find('.close-grind-hub-btn').on('click', ev => {
      ev.preventDefault();
      this.close();
    });
  }
}
