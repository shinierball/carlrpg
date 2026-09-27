/**
 * Dungeon Crawler Carl RPG — Grinding & Downtime Application
 *
 * Provides a dedicated, interactive hub for:
 * - Setting grinding hours (1 to 12 hrs, default 5 hrs)
 * - Toggling Guide / Companion Insight (+1 safe hour, e.g. Huey / Bob)
 * - Automatic Endurance Checks & Fatigued Debuff application for hours > safe limit
 * - Selecting Checked / Used skills and allocating required hours (Hours = Current Rank)
 * - Testing Skill Advancement (1d20 >= Current Rank) with automatic rank upgrades
 * - Rolling on the 1d20 Grinding Complications Table
 * - Taking 8-Hour Safe Room Long Rests
 */

import { DCCBaseApplication } from './base-application.mjs';
import {
  DCC_GRINDING_COMPLICATIONS,
  getRequiredGrindingHours,
  getAdvancementTarget,
  getEnduranceDC
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

    // Default floor number from actor
    if (this.actor?.system?.details?.floor) {
      const match = String(this.actor.system.details.floor).match(/\d+/);
      this.floorNumber = match ? Math.max(1, parseInt(match[0], 10)) : 1;
    } else {
      this.floorNumber = 1;
    }
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-grind-app',
      classes: ['dcc-sheet-window', 'dcc-grind-app-window'],
      template: 'systems/carl-rpg/templates/apps/grind-app.hbs',
      title: 'DCC RPG — Grinding & Downtime Hub',
      width: 680,
      height: 'auto',
      resizable: true
    });
  }

  /** @override */
  async getData() {
    const context = (typeof super.getData === 'function') ? await super.getData() : {};
    context.actor = this.actor;
    context.hours = this.hours;
    context.hasGuideBonus = this.hasGuideBonus;
    context.floorNumber = this.floorNumber;
    context.rollComplication = this.rollComplication;

    const safeThreshold = this.hasGuideBonus ? 6 : 5;
    const excessHours = Math.max(0, this.hours - safeThreshold);
    context.safeThreshold = safeThreshold;
    context.excessHours = excessHours;

    // Get actor's endurance skill and rank
    const allSkills = this.actor?.items ? (this.actor.items.filter ? this.actor.items.filter(i => i.type === 'skill') : Array.from(this.actor.items.values?.() || this.actor.items).filter(i => i.type === 'skill')) : [];
    const enduranceSkill = allSkills.find(s => s.name.toLowerCase().trim() === 'endurance');
    const endRank = Number(enduranceSkill?.modifiedRank ?? enduranceSkill?.system?.rank) || 0;
    const conMod = this.actor?.system?.abilities?.con?.mod ?? 0;
    context.enduranceRank = endRank;
    context.conMod = conMod;
    context.enduranceBonusStr = (endRank + conMod) >= 0 ? `+${endRank + conMod}` : `${endRank + conMod}`;

    // Process all owned skills
    const mappedSkills = allSkills.map(skill => {
      const baseRank = Number(skill.system?.rank) || 0;
      const modifiedRank = Number(skill.modifiedRank ?? skill.system?.rank) || 0;
      const isChecked = Boolean(skill.system?.checked);
      const reqHours = getRequiredGrindingHours(baseRank);
      const target = getAdvancementTarget(baseRank);
      const isSelected = skill.id === this.selectedSkillId;
      const canAdvance = this.hours >= reqHours;

      return {
        id: skill.id,
        name: skill.name,
        img: skill.img || 'icons/svg/item-bag.svg',
        baseRank,
        modifiedRank,
        stat: (skill.system?.stat || 'str').toUpperCase(),
        checked: isChecked,
        requiredHours: reqHours,
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

    // Hours slider / input change
    html.find('.grind-hours-input').on('input change', ev => {
      this.hours = Math.max(1, Math.min(24, parseInt(ev.currentTarget.value, 10) || 1));
      this.render(false);
    });

    // Floor input change
    html.find('.grind-floor-input').on('change', ev => {
      this.floorNumber = Math.max(1, parseInt(ev.currentTarget.value, 10) || 1);
      this.render(false);
    });

    // Guide bonus toggle
    html.find('.guide-bonus-toggle').on('change', ev => {
      this.hasGuideBonus = ev.currentTarget.checked;
      this.render(false);
    });

    // Complication toggle
    html.find('.complication-toggle').on('change', ev => {
      this.rollComplication = ev.currentTarget.checked;
    });

    // Skill card selection
    html.find('.grind-skill-option').on('click', ev => {
      ev.preventDefault();
      const skillId = $(ev.currentTarget).data('skillId') || ev.currentTarget.dataset?.skillId;
      if (skillId) {
        this.selectedSkillId = skillId;
        this.render(false);
      }
    });

    // Execute Grind Session
    html.find('.execute-grind-btn').on('click', async ev => {
      ev.preventDefault();
      if (!this.actor) return;
      await this.actor.grindSession({
        hours: this.hours,
        hasGuideBonus: this.hasGuideBonus,
        skillId: this.selectedSkillId,
        floor: this.floorNumber,
        rollComplication: this.rollComplication
      });
      this.close();
    });

    // Safe Room Rest button
    html.find('.safe-room-rest-btn').on('click', async ev => {
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
  }
}
