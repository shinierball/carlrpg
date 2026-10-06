/**
 * Dungeon Crawler Carl RPG — Custom Race Creator Studio (ApplicationV2)
 *
 * Implements the Race Creator Studio matching Option A: The "Terminal Ledger" Accordion Studio.
 * Derived from Chapter 3 (Pages 128–143 & 158–164) of the official DCC RPG Core Rulebook.
 *
 * Features:
 * - 25 Base Race Build Points with live point ledger.
 * - Shows exact points used for each attribute, perk, skill, size, and detriment.
 * - Soft Limit Policy: does NOT enforce a hard limit; informs the user without blocking
 *   item creation, JSON export, or actor application.
 * - Heritage Selection: Earth (Silver Earth Box + Earth Classes) vs Alien (Galactic Fanbase Popularity).
 * - Standardized Creature Size Categories (Sizes 1–6):
 *   - Size 1 (Tiny) / Size 2 (Small): 3 BP (Major Benefit per official rules)
 *   - Size 3 (Petite) / Size 4 (Medium): 0 BP (Baseline)
 *   - Size 5 (Large) / Size 6 (Huge): 3 BP (Major Benefit per official rules)
 * - Interactive accordion drawers for Minor (1 BP), Moderate (2 BP), Major (3 BP),
 *   Extreme (4 BP), Epic (6 BP) benefits, Detriments (+1 to +3 Extra BP), and Custom Perks.
 * - Instant export to Foundry World Item directory, formatted JSON export/import,
 *   and 1-click active crawler sheet application.
 */

import { DCCBasePointBuilderApp } from './base-point-builder.mjs';
import {
  DCC_BENEFIT_TIERS,
  DCC_DETRIMENT_TIERS,
  DCC_POINT_BUILD_BENEFITS,
  DCC_POINT_BUILD_DETRIMENTS
} from '../data/point-build-catalog.mjs';
import { DCC_RACES } from '../data/races.mjs';
import { DCC_SIZES, getSizeInfo } from '../data/sizes.mjs';

export const DCC_RACE_SIZE_OPTIONS = [
  { size: 1, name: 'Tiny', label: '1 Tiny', cost: 3, description: 'Size 1 (Tiny): +3 BP (Major Benefit). Extremely diminutive creature.' },
  { size: 2, name: 'Small', label: '2 Small', cost: 3, description: 'Size 2 (Small): +3 BP (Major Benefit). e.g. Cat, Pocket Kuma.' },
  { size: 3, name: 'Petite', label: '3 Petite', cost: 0, description: 'Size 3 (Petite): 0 BP baseline. e.g. Frost Maiden, Rat Hooligan.' },
  { size: 4, name: 'Medium', label: '4 Medium', cost: 0, description: 'Size 4 (Medium): 0 BP baseline. Standard humanoid frame.' },
  { size: 5, name: 'Large', label: '5 Large', cost: 3, description: 'Size 5 (Large): +3 BP (Major Benefit). e.g. Igneous, Sasquatch.' },
  { size: 6, name: 'Huge', label: '6 Huge', cost: 3, description: 'Size 6 (Huge): +3 BP (Major Benefit). Massive hulking beast.' }
];

export class DCCRaceCreatorApp extends DCCBasePointBuilderApp {
  constructor(options = {}) {
    super({
      ...options,
      builderType: 'race',
      baseBudget: 25,
      heritage: options.heritage || 'Earth',
      size: options.size !== undefined ? Number(options.size) : 4
    });

    this.targetActorId = options.targetActorId || null;
  }

  /**
   * Application V1 defaultOptions getter fallback
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-race-creator',
      title: 'DCC RPG — Race Creator Studio',
      template: 'systems/carl-rpg/templates/apps/race-creator.hbs',
      width: 960,
      height: 840,
      classes: ['dcc-app', 'dcc-race-creator-app'],
      resizable: true,
      scrollY: [
        '.dcc-studio-builder',
        '.dcc-receipt-list',
        '.dcc-studio-sidebar',
        '.dcc-studio-layout',
        '.window-content'
      ]
    });
  }

  /**
   * Application V2 DEFAULT_OPTIONS configuration
   */
  static DEFAULT_OPTIONS = {
    id: 'dcc-race-creator-{id}',
    classes: ['dcc-app', 'dcc-race-creator-app'],
    tag: 'div',
    window: {
      title: 'DCC RPG — Race Creator Studio',
      resizable: true
    },
    position: {
      width: 960,
      height: 840
    },
    scrollY: [
      '.dcc-studio-builder',
      '.dcc-receipt-list',
      '.dcc-studio-sidebar',
      '.dcc-studio-layout',
      '.window-content'
    ]
  };

  // =========================================================================
  // RACE SPECIFIC MUTATORS
  // =========================================================================

  setHeritage(heritage) {
    if (heritage === 'Earth' || heritage === 'Alien') {
      this.heritage = heritage;
      if (typeof this.render === 'function') {
        this._saveScrollPositions();
        this.render(false);
      }
    }
  }

  setSize(sizeNum) {
    const num = Number(sizeNum);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      this.size = num;
      if (typeof this.render === 'function') {
        this._saveScrollPositions();
        this.render(false);
      }
    }
  }

  loadPreset(presetId) {
    super.loadPreset(presetId);

    // Look up canonical race in DCC_RACES dataset
    const canonicalRace = DCC_RACES.find(r => r._id === presetId || r.name.toLowerCase() === String(presetId).toLowerCase());
    if (canonicalRace) {
      this.name = canonicalRace.name;
      this.description = canonicalRace.system?.description ? canonicalRace.system.description.replace(/<[^>]+>/g, '').trim() : '';
      this.prerequisites = canonicalRace.system?.prerequisites || '';
      this.heritage = canonicalRace.system?.heritage === 'Alien' ? 'Alien' : 'Earth';
      
      const parsedSize = getSizeInfo(canonicalRace.system?.size);
      this.size = parsedSize.size;

      // Reset build items
      this.stats = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
      this.skills = [];
      this.spells = [];
      this.selectedBenefits = [];
      this.selectedDetriments = [];
      this.customBenefits = [];
      this.customDetriments = [];

      // Extract stats from perks
      if (Array.isArray(canonicalRace.system?.perks)) {
        for (const perk of canonicalRace.system.perks) {
          const perkClean = perk.replace(/[\u2212\u2013\u2014-]/g, '-');
          const statMatches = perkClean.matchAll(/([+\-]\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Charisma)/gi);
          for (const m of statMatches) {
            const val = parseInt(m[1], 10);
            const statKey = m[2].substring(0, 3).toLowerCase();
            if (this.stats.hasOwnProperty(statKey)) {
              this.stats[statKey] += val;
            }
          }
        }
      }
    }
  }

  /**
   * Prepares context data for Handlebars rendering.
   */
  getData() {
    const ledger = this.getPointLedger();

    // Prepare Creature Sizes array with selection and cost
    const sizeOptions = DCC_RACE_SIZE_OPTIONS.map(opt => ({
      ...opt,
      isSelected: opt.size === Number(this.size)
    }));

    // Filtered Benefit Tiers
    const search = (this.searchQuery || '').trim().toLowerCase();
    const benefitTiers = [];

    for (const [tierKey, tierMeta] of Object.entries(DCC_BENEFIT_TIERS)) {
      if (this.activeTierFilter !== 'all' && this.activeTierFilter !== tierKey) {
        continue;
      }

      const allItems = DCC_POINT_BUILD_BENEFITS.filter(b => b.tier === tierKey);
      const matchedItems = allItems.filter(b => {
        if (!search) return true;
        return (
          b.name.toLowerCase().includes(search) ||
          b.category.toLowerCase().includes(search) ||
          b.description.toLowerCase().includes(search)
        );
      });

      benefitTiers.push({
        id: tierKey,
        label: tierMeta.label,
        cost: tierMeta.cost,
        isOpen: Boolean(this.accordionOpen[tierKey] || search.length > 0),
        count: matchedItems.length,
        items: matchedItems.map(b => ({
          ...b,
          isSelected: this.selectedBenefits.some(sb => sb.id === b.id)
        }))
      });
    }

    // Filtered Detriment Tiers
    const detrimentTiers = [];
    for (const [detTierKey, detMeta] of Object.entries(DCC_DETRIMENT_TIERS)) {
      const allDetItems = DCC_POINT_BUILD_DETRIMENTS.filter(d => d.tier === detTierKey);
      const matchedDetItems = allDetItems.filter(d => {
        if (!search) return true;
        return (
          d.name.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search)
        );
      });

      detrimentTiers.push({
        id: detTierKey,
        label: detMeta.label,
        extraPoints: detMeta.extraPoints,
        isOpen: Boolean(this.accordionOpen.detriments || search.length > 0),
        items: matchedDetItems.map(d => ({
          ...d,
          isSelected: this.selectedDetriments.some(sd => sd.id === d.id)
        }))
      });
    }

    // Heritage Inherent Perks
    const heritagePerks = [];
    if (this.heritage === 'Earth') {
      heritagePerks.push({
        id: 'earth_silver_box',
        name: 'Silver Earth Box (Earth Hobby Skill Potion)',
        points: 0,
        cost: 0,
        category: 'Earth Heritage',
        description: 'Guaranteed Silver Earth Box containing an Earth Hobby Potion (3 Ranks in a hobby skill) and full access to Earth Classes.'
      });
    } else {
      heritagePerks.push({
        id: 'alien_galactic_popularity',
        name: 'Galactic Fanbase Popularity',
        points: 0,
        cost: 0,
        category: 'Alien Heritage',
        description: 'Planetary audience appeal across Syndicate worlds, providing unique opportunities to gain Popularity and AI favor.'
      });
    }

    // Crawlers in world for direct application
    const crawlers = globalThis.game?.actors
      ? Array.from(globalThis.game.actors.values())
          .filter(a => a.type === 'crawler')
          .map(a => ({
            id: a.id,
            name: a.name,
            isSelected: a.id === this.targetActorId
          }))
      : [];

    // Presets from canonical races
    const presets = DCC_RACES.map(r => ({
      id: r._id,
      name: `${r.name} (${r.system.heritage})`
    }));

    return {
      builderType: 'race',
      name: this.name,
      description: this.description,
      prerequisites: this.prerequisites,
      notes: this.notes,
      heritage: this.heritage,
      isEarth: this.heritage === 'Earth',
      isAlien: this.heritage === 'Alien',
      size: this.size,
      sizeName: this.getSizeName(),
      sizeOptions,
      stats: this.stats,
      skills: this.skills,
      spells: this.spells,
      benefits: [...heritagePerks, ...this.selectedBenefits],
      detriments: this.selectedDetriments,
      selectedBenefits: this.selectedBenefits,
      selectedDetriments: this.selectedDetriments,
      customBenefits: this.customBenefits,
      customDetriments: this.customDetriments,
      benefitTiers,
      detrimentsOpen: Boolean(this.accordionOpen.detriments || search.length > 0),
      customOpen: Boolean(this.accordionOpen.custom),
      detrimentTiers,
      ledger,
      baseBudget: ledger.baseBudget,
      spent: ledger.spent,
      pointsSpent: ledger.pointsSpent,
      extraPoints: ledger.extraPoints,
      effectiveBudget: ledger.effectiveBudget,
      balance: ledger.balance,
      remaining: ledger.remaining,
      isOverbudget: ledger.isOverbudget,
      overbudgetAmount: ledger.overbudgetAmount,
      isLegal: ledger.isLegal,
      hasSkillRankCapWarning: ledger.hasSkillRankCapWarning,
      sizeCost: ledger.sizeCost,
      statCost: ledger.statCost,
      statPenaltyExtra: ledger.statPenaltyExtra,
      skillCost: ledger.skillCost,
      spellCost: ledger.spellCost,
      benefitCost: ledger.benefitCost,
      customCost: ledger.customCost,
      detrimentExtraPoints: ledger.detrimentExtraPoints,
      rawDetrimentPoints: ledger.rawDetrimentPoints,
      crawlers,
      presets,
      searchQuery: this.searchQuery,
      activeTierFilter: this.activeTierFilter
    };
  }

  /**
   * Compiles custom race item document payload.
   */
  createItemData() {
    const base = super.createItemData();
    base.type = 'race';
    base.img = 'icons/default-icons/ancestry.svg';
    base.system.heritage = this.heritage;
    base.system.size = `${this.getSizeName()} (${this.size})`;
    base.system.sizeNumber = this.size;

    if (this.heritage === 'Earth') {
      if (!base.system.perks.some(p => p.toLowerCase().includes('silver earth box'))) {
        base.system.perks.push('Silver Earth Box, with guaranteed Earth Hobby Skill Potion');
      }
    } else {
      if (!base.system.perks.some(p => p.toLowerCase().includes('galactic fanbase'))) {
        base.system.perks.push('Galactic Fanbase Popularity (Syndicate Audience Appeal)');
      }
    }

    return base;
  }

  /**
   * Binds interactive UI listeners.
   */
  activateListeners(html) {
    super.activateListeners(html);
    const $html = (html && typeof html.find === 'function') ? html : (typeof $ !== 'undefined' ? $(html) : html);

    // Helper to safely trigger re-render while preserving scroll and focus
    const reRenderWithState = (ev, fn) => {
      if (ev?.currentTarget) this._saveFocusState(ev.currentTarget);
      this._saveScrollPositions($html);
      if (typeof fn === 'function') fn();
      return this.render(false);
    };

    // Heritage Selector Pills
    $html.find('.dcc-heritage-pill').on('click', ev => {
      ev.preventDefault();
      const heritage = $(ev.currentTarget).data('heritage');
      reRenderWithState(ev, () => {
        this.heritage = heritage;
      });
    });

    // Size Selector Pills
    $html.find('.dcc-size-pill').on('click', ev => {
      ev.preventDefault();
      const sizeNum = Number($(ev.currentTarget).data('size'));
      reRenderWithState(ev, () => {
        if (!isNaN(sizeNum) && sizeNum >= 1 && sizeNum <= 8) {
          this.size = sizeNum;
        }
      });
    });

    // Accordion headers
    $html.find('.dcc-accordion-header').on('click', ev => {
      ev.preventDefault();
      const tierId = $(ev.currentTarget).data('tier');
      reRenderWithState(ev, () => {
        this.accordionOpen[tierId] = !this.accordionOpen[tierId];
      });
    });

    // Search filter
    $html.find('.dcc-search-input').on('input', ev => {
      reRenderWithState(ev, () => {
        this.searchQuery = ev.currentTarget.value;
      });
    });

    // Tier quick-filter pills
    $html.find('.dcc-filter-pill').on('click', ev => {
      ev.preventDefault();
      reRenderWithState(ev, () => {
        this.activeTierFilter = $(ev.currentTarget).data('filter') || 'all';
      });
    });

    // Basic Inputs
    $html.find('input[name="name"]').on('change', ev => {
      reRenderWithState(ev, () => {
        this.name = ev.currentTarget.value;
      });
    });
    $html.find('textarea[name="description"]').on('change', ev => {
      this.description = ev.currentTarget.value;
    });
    $html.find('input[name="prerequisites"]').on('change', ev => {
      this.prerequisites = ev.currentTarget.value;
    });

    // Ability Score Steppers
    $html.find('.dcc-stat-step-btn').on('click', ev => {
      ev.preventDefault();
      const stat = $(ev.currentTarget).data('stat');
      const delta = Number($(ev.currentTarget).data('delta')) || 0;
      reRenderWithState(ev, () => {
        this.stats[stat] = (Number(this.stats[stat]) || 0) + delta;
      });
    });

    // Add Skill
    $html.find('.dcc-add-skill-btn').on('click', ev => {
      ev.preventDefault();
      const nameInput = $html.find('input[name="newSkillName"]');
      const rankInput = $html.find('select[name="newSkillRank"]');
      const passiveInput = $html.find('input[name="newSkillPassive"]');

      const name = nameInput.val().trim();
      const rank = Number(rankInput.val()) || 1;
      const isPassive = Boolean(passiveInput.prop('checked'));

      if (name) {
        reRenderWithState(ev, () => {
          this.skills.push({ name, rank, isPassive, cost: rank * 2 });
        });
      }
    });

    // Remove Skill
    $html.find('.dcc-remove-skill-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.skills.splice(idx, 1);
      });
    });

    // Add Spell
    $html.find('.dcc-add-spell-btn').on('click', ev => {
      ev.preventDefault();
      const nameInput = $html.find('input[name="newSpellName"]');
      const rankInput = $html.find('select[name="newSpellRank"]');
      const passiveInput = $html.find('input[name="newSpellPassive"]');

      const name = nameInput.val().trim();
      const rank = Number(rankInput.val()) || 1;
      const isPassive = Boolean(passiveInput.prop('checked'));

      if (name) {
        reRenderWithState(ev, () => {
          this.spells.push({ name, rank, isPassive, cost: rank * 2 });
        });
      }
    });

    // Remove Spell
    $html.find('.dcc-remove-spell-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.spells.splice(idx, 1);
      });
    });

    // Benefit Checkbox Toggle
    $html.find('.dcc-benefit-toggle').on('change', ev => {
      const benefitId = $(ev.currentTarget).data('id');
      const isChecked = ev.currentTarget.checked;

      reRenderWithState(ev, () => {
        if (isChecked) {
          const item = DCC_POINT_BUILD_BENEFITS.find(b => b.id === benefitId);
          if (item && !this.selectedBenefits.some(b => b.id === benefitId)) {
            this.selectedBenefits.push({ ...item });
          }
        } else {
          this.selectedBenefits = this.selectedBenefits.filter(b => b.id !== benefitId);
        }
      });
    });

    // Detriment Checkbox Toggle
    $html.find('.dcc-detriment-toggle').on('change', ev => {
      const detId = $(ev.currentTarget).data('id');
      const isChecked = ev.currentTarget.checked;

      reRenderWithState(ev, () => {
        if (isChecked) {
          const item = DCC_POINT_BUILD_DETRIMENTS.find(d => d.id === detId);
          if (item && !this.selectedDetriments.some(d => d.id === detId)) {
            this.selectedDetriments.push({ ...item });
          }
        } else {
          this.selectedDetriments = this.selectedDetriments.filter(d => d.id !== detId);
        }
      });
    });

    // Add Custom Benefit
    $html.find('.dcc-add-custom-benefit-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="customBenefitName"]').val().trim();
      const cost = Number($html.find('select[name="customBenefitCost"]').val()) || 1;
      if (name) {
        reRenderWithState(ev, () => {
          this.customBenefits.push({ name, cost });
        });
      }
    });

    // Remove Custom Benefit
    $html.find('.dcc-remove-custom-benefit-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.customBenefits.splice(idx, 1);
      });
    });

    // Add Custom Detriment
    $html.find('.dcc-add-custom-detriment-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="customDetrimentsName"]').val().trim();
      const extraPoints = Number($html.find('select[name="customDetrimentPoints"]').val()) || 1;
      if (name) {
        reRenderWithState(ev, () => {
          this.customDetriments.push({ name, extraPoints });
        });
      }
    });

    // Remove Custom Detriment
    $html.find('.dcc-remove-custom-detriment-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.customDetriments.splice(idx, 1);
      });
    });

    // Preset Loader
    $html.find('.dcc-preset-select').on('change', ev => {
      const presetId = ev.currentTarget.value;
      if (presetId) {
        reRenderWithState(ev, () => {
          this.loadPreset(presetId);
        });
      }
    });

    // Target Actor Selector
    $html.find('.dcc-target-crawler-select').on('change', ev => {
      this.targetActorId = ev.currentTarget.value || null;
    });

    // Action: Save as Race Item
    $html.find('.dcc-save-race-btn').on('click', async ev => {
      ev.preventDefault();
      await this.saveToWorldItem();
    });

    // Action: Export JSON
    $html.find('.dcc-export-json-btn').on('click', ev => {
      ev.preventDefault();
      const jsonStr = this.exportJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(this.name || 'custom-race').toLowerCase().replace(/\s+/g, '-')}-build.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Action: Apply to Active Crawler
    $html.find('.dcc-apply-crawler-btn').on('click', async ev => {
      ev.preventDefault();
      if (!this.targetActorId && globalThis.game?.actors) {
        const crawlers = Array.from(globalThis.game.actors.values()).filter(a => a.type === 'crawler');
        if (crawlers.length === 1) {
          this.targetActorId = crawlers[0].id;
        }
      }

      if (!this.targetActorId) {
        if (globalThis.ui?.notifications) {
          globalThis.ui.notifications.warn('Please select a target crawler to apply this Race to.');
        }
        return;
      }

      const actor = globalThis.game?.actors?.get(this.targetActorId);
      if (actor) {
        await this.applyToActor(actor);
      }
    });

    // Action: Reset Build
    $html.find('.dcc-reset-btn').on('click', ev => {
      ev.preventDefault();
      this.resetBuild();
      this.render(false);
    });
  }
}
