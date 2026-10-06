/**
 * Dungeon Crawler Carl RPG — Custom Class Creator Studio (ApplicationV2)
 *
 * Implements Option A: The "Terminal Ledger" Accordion Studio.
 * Derived from Chapter 3 (Pages 144–164) of the official DCC RPG Core Rulebook.
 *
 * Features:
 * - 30 Base Build Points with live point ledger.
 * - Shows exact points used for each attribute, perk, skill, and detriment.
 * - Does NOT enforce a hard limit: soft badges allow homebrew and GM-discretion builds.
 * - Interactive accordion drawers for Minor, Moderate, Major, Extreme, and Epic benefits.
 * - Supports Earth Class perks (Silver Earth Box & Earth Hobby Potion).
 * - Instant export to Foundry Item directory, JSON export, and 1-click crawler sheet application.
 */

import { DCCBasePointBuilderApp } from './base-point-builder.mjs';
import {
  DCC_BENEFIT_TIERS,
  DCC_DETRIMENT_TIERS,
  DCC_POINT_BUILD_BENEFITS,
  DCC_POINT_BUILD_DETRIMENTS,
  DCC_CANONICAL_PRESETS
} from '../data/point-build-catalog.mjs';
import { DCC_CLASSES } from '../data/classes.mjs';

export const DCC_CLASS_ARCHETYPES = [
  'Arcanist',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Mage',
  'Monk',
  'Paladin',
  'Rogue',
  'Merchant',
  'Necromancer'
];

export class DCCClassCreatorApp extends DCCBasePointBuilderApp {
  constructor(options = {}) {
    super({
      ...options,
      builderType: 'class',
      baseBudget: 30
    });

    this.classTypes = Array.isArray(options.classTypes)
      ? [...options.classTypes]
      : (options.classType ? options.classType.split(',').map(t => t.trim()) : ['Fighter']);

    this.isEarthClass = options.isEarthClass !== undefined ? Boolean(options.isEarthClass) : true;
    this.targetActorId = options.targetActorId || null;
  }

  // =========================================================================
  // ARCHETYPE & EARTH CLASS HELPERS
  // =========================================================================

  get archetype() {
    return (this.classTypes[0] || 'Fighter').toLowerCase();
  }

  set archetype(val) {
    if (val) this.classTypes = [val];
  }

  setArchetype(type) {
    if (type) {
      this.classTypes = [type];
      if (typeof this.render === 'function') this.render(false);
    }
  }

  toggleEarthClass(enabled) {
    this.isEarthClass = Boolean(enabled);
    if (typeof this.render === 'function') this.render(false);
  }

  loadPreset(presetId) {
    super.loadPreset(presetId);
    const preset = DCC_CANONICAL_PRESETS.find(p => p.id === presetId);
    if (preset) {
      if (preset.classTypes) this.classTypes = [...preset.classTypes];
      if (preset.isEarth !== undefined) this.isEarthClass = Boolean(preset.isEarth);
    }
  }

  /**
   * Application V1 defaultOptions getter fallback
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-class-creator',
      title: 'DCC RPG — Class Creator Studio',
      template: 'systems/carl-rpg/templates/apps/class-creator.hbs',
      width: 960,
      height: 840,
      classes: ['dcc-app', 'dcc-class-creator-app'],
      resizable: true
    });
  }

  /**
   * Application V2 DEFAULT_OPTIONS configuration
   */
  static DEFAULT_OPTIONS = {
    id: 'dcc-class-creator-{id}',
    classes: ['dcc-app', 'dcc-class-creator-app'],
    tag: 'div',
    window: {
      title: 'DCC RPG — Class Creator Studio',
      resizable: true
    },
    position: {
      width: 960,
      height: 840
    }
  };

  /**
   * Prepares the complete context dataset for the Handlebars template.
   */
  getData() {
    const ledger = this.getPointLedger();

    // Prepare Archetype selection pills
    const archetypePills = DCC_CLASS_ARCHETYPES.map(type => ({
      name: type,
      isSelected: this.classTypes.includes(type)
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

    // Crawlers in the world for direct application
    const crawlers = globalThis.game?.actors
      ? Array.from(globalThis.game.actors.values())
          .filter(a => a.type === 'crawler')
          .map(a => ({
            id: a.id,
            name: a.name,
            isSelected: a.id === this.targetActorId
          }))
      : [];

    // Presets list
    const presets = [
      ...DCC_CANONICAL_PRESETS,
      ...DCC_CLASSES.slice(0, 5).map(c => ({
        id: c._id,
        name: `${c.name} (${c.system.classType})`,
        isCanonical: true
      }))
    ];

    return {
      builderType: 'class',
      name: this.name,
      description: this.description,
      prerequisites: this.prerequisites,
      notes: this.notes,
      isEarthClass: this.isEarthClass,
      classTypesString: this.classTypes.join(', '),
      archetypePills,
      archetype: this.archetype,
      stats: this.stats,
      skills: this.skills,
      spells: this.spells,
      benefits: this.isEarthClass
        ? [{ id: 'earth_class_knowledge', name: 'Silver Earth Box (Guaranteed Earth Hobby Skill Potion)', points: 0, cost: 0, category: 'Earth', tier: 'minor' }, ...this.selectedBenefits]
        : this.selectedBenefits,
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
   * Compiles custom class item document payload.
   */
  createItemData() {
    const base = super.createItemData();
    base.type = 'class';
    base.img = 'icons/default-icons/class.svg';
    base.system.archetype = this.archetype;
    base.system.classType = this.classTypes.join(', ') || 'Fighter';
    base.system.isEarthClass = this.isEarthClass;
    if (this.isEarthClass) {
      // Add Silver Earth Box note if not present
      if (!base.system.perks.some(p => p.toLowerCase().includes('silver earth box'))) {
        base.system.perks.push('Silver Earth Box, with guaranteed Earth Hobby Skill Potion');
      }
    }
    return base;
  }

  /**
   * Binds interactive UI listeners.
   */
  activateListeners(html) {
    const $html = $(html);

    // Accordion headers
    $html.find('.dcc-accordion-header').on('click', ev => {
      ev.preventDefault();
      const tierId = $(ev.currentTarget).data('tier');
      this.accordionOpen[tierId] = !this.accordionOpen[tierId];
      this.render(false);
    });

    // Search filter
    $html.find('.dcc-search-input').on('input', ev => {
      this.searchQuery = ev.currentTarget.value;
      this.render(false);
    });

    // Tier quick-filter pills
    $html.find('.dcc-filter-pill').on('click', ev => {
      ev.preventDefault();
      this.activeTierFilter = $(ev.currentTarget).data('filter') || 'all';
      this.render(false);
    });

    // Basic Inputs
    $html.find('input[name="name"]').on('change', ev => {
      this.name = ev.currentTarget.value;
      this.render(false);
    });
    $html.find('textarea[name="description"]').on('change', ev => {
      this.description = ev.currentTarget.value;
    });
    $html.find('input[name="prerequisites"]').on('change', ev => {
      this.prerequisites = ev.currentTarget.value;
    });
    $html.find('input[name="isEarthClass"]').on('change', ev => {
      this.isEarthClass = ev.currentTarget.checked;
      this.render(false);
    });

    // Archetype selection pills
    $html.find('.dcc-type-pill').on('click', ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type');
      if (this.classTypes.includes(type)) {
        if (this.classTypes.length > 1) {
          this.classTypes = this.classTypes.filter(t => t !== type);
        }
      } else {
        this.classTypes.push(type);
      }
      this.render(false);
    });

    // Ability Score Steppers
    $html.find('.dcc-stat-step-btn').on('click', ev => {
      ev.preventDefault();
      const stat = $(ev.currentTarget).data('stat');
      const delta = Number($(ev.currentTarget).data('delta')) || 0;
      this.stats[stat] = (Number(this.stats[stat]) || 0) + delta;
      this.render(false);
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
        this.skills.push({ name, rank, isPassive, cost: rank * 2 });
        this.render(false);
      }
    });

    // Remove Skill
    $html.find('.dcc-remove-skill-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      this.skills.splice(idx, 1);
      this.render(false);
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
        this.spells.push({ name, rank, isPassive, cost: rank * 2 });
        this.render(false);
      }
    });

    // Remove Spell
    $html.find('.dcc-remove-spell-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      this.spells.splice(idx, 1);
      this.render(false);
    });

    // Benefit Checkbox Toggle
    $html.find('.dcc-benefit-toggle').on('change', ev => {
      const benefitId = $(ev.currentTarget).data('id');
      const isChecked = ev.currentTarget.checked;

      if (isChecked) {
        const item = DCC_POINT_BUILD_BENEFITS.find(b => b.id === benefitId);
        if (item && !this.selectedBenefits.some(b => b.id === benefitId)) {
          this.selectedBenefits.push({ ...item });
        }
      } else {
        this.selectedBenefits = this.selectedBenefits.filter(b => b.id !== benefitId);
      }
      this.render(false);
    });

    // Detriment Checkbox Toggle
    $html.find('.dcc-detriment-toggle').on('change', ev => {
      const detId = $(ev.currentTarget).data('id');
      const isChecked = ev.currentTarget.checked;

      if (isChecked) {
        const item = DCC_POINT_BUILD_DETRIMENTS.find(d => d.id === detId);
        if (item && !this.selectedDetriments.some(d => d.id === detId)) {
          this.selectedDetriments.push({ ...item });
        }
      } else {
        this.selectedDetriments = this.selectedDetriments.filter(d => d.id !== detId);
      }
      this.render(false);
    });

    // Add Custom Benefit
    $html.find('.dcc-add-custom-benefit-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="customBenefitName"]').val().trim();
      const cost = Number($html.find('select[name="customBenefitCost"]').val()) || 1;
      if (name) {
        this.customBenefits.push({ name, cost });
        this.render(false);
      }
    });

    // Remove Custom Benefit
    $html.find('.dcc-remove-custom-benefit-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      this.customBenefits.splice(idx, 1);
      this.render(false);
    });

    // Add Custom Detriment
    $html.find('.dcc-add-custom-detriment-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="customDetrimentsName"]').val().trim();
      const extraPoints = Number($html.find('select[name="customDetrimentPoints"]').val()) || 1;
      if (name) {
        this.customDetriments.push({ name, extraPoints });
        this.render(false);
      }
    });

    // Remove Custom Detriment
    $html.find('.dcc-remove-custom-detriment-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      this.customDetriments.splice(idx, 1);
      this.render(false);
    });

    // Preset Loader
    $html.find('.dcc-preset-select').on('change', ev => {
      const presetId = ev.currentTarget.value;
      if (presetId) {
        this.loadPreset(presetId);
        this.render(false);
      }
    });

    // Target Actor Selector
    $html.find('.dcc-target-crawler-select').on('change', ev => {
      this.targetActorId = ev.currentTarget.value || null;
    });

    // Action: Save as Class Item
    $html.find('.dcc-save-class-btn').on('click', async ev => {
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
      a.download = `${(this.name || 'custom-class').toLowerCase().replace(/\s+/g, '-')}-build.json`;
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
          globalThis.ui.notifications.warn('Please select a target Crawler to apply this Class to.');
        }
        return;
      }

      const actor = globalThis.game?.actors?.get(this.targetActorId);
      if (actor) {
        await this.applyToActor(actor);
      }
    });

    // Action: Reset to Blank
    $html.find('.dcc-reset-btn').on('click', ev => {
      ev.preventDefault();
      this.name = '';
      this.description = '';
      this.prerequisites = '';
      this.stats = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
      this.skills = [];
      this.spells = [];
      this.selectedBenefits = [];
      this.selectedDetriments = [];
      this.customBenefits = [];
      this.customDetriments = [];
      this.render(false);
    });
  }
}
