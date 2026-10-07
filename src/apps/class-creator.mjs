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
import { DCCRaceClassApplier, cleanOCRText } from '../data/race-class-applier.mjs';

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
      this._saveScrollPositions();
      if (typeof this.render === 'function') this.render(false);
    }
  }

  toggleEarthClass(enabled) {
    this.isEarthClass = Boolean(enabled);
    this._saveScrollPositions();
    if (typeof this.render === 'function') this.render(false);
  }

  loadPreset(presetId) {
    super.loadPreset(presetId);

    // 1. Check DCC_CANONICAL_PRESETS (e.g. Dungeon Dad)
    const preset = DCC_CANONICAL_PRESETS.find(p => p.id === presetId);
    if (preset) {
      if (preset.classTypes) this.classTypes = [...preset.classTypes];
      this.archetype = this.classTypes[0] || 'Fighter';
      if (preset.isEarth !== undefined) this.isEarthClass = Boolean(preset.isEarth);
      return;
    }

    // 2. Check DCC_CLASSES (all canonical classes)
    const canonicalClass = DCC_CLASSES.find(c => c._id === presetId || c.name.toLowerCase() === String(presetId).toLowerCase());
    if (canonicalClass) {
      this.resetBuild();
      this.name = canonicalClass.name;
      this.description = canonicalClass.system?.description ? canonicalClass.system.description.replace(/<[^>]+>/g, '').trim() : '';
      this.prerequisites = canonicalClass.system?.prerequisites || '';
      this.notes = canonicalClass.system?.notes || '';

      const rawTypes = canonicalClass.system?.classType || 'Fighter';
      this.classTypes = rawTypes.split(',').map(t => t.trim()).filter(Boolean);
      this.archetype = this.classTypes[0] || 'Fighter';
      if (this.archetype) {
        this.archetype = this.archetype.charAt(0).toUpperCase() + this.archetype.slice(1);
      }

      const perks = Array.isArray(canonicalClass.system?.perks) ? canonicalClass.system.perks : [];
      const abilities = canonicalClass.system?.abilities || '';
      this.isEarthClass = perks.some(p => /silver earth box/i.test(p) || /earth hobby/i.test(p)) ||
                          /silver earth box/i.test(abilities) ||
                          /earth hobby/i.test(abilities);

      // Parse stats
      const parsedStats = DCCRaceClassApplier.parseStats(canonicalClass);
      this.stats = { ...parsedStats };

      // Parse DR bonus
      const dr = DCCRaceClassApplier.parseDR(canonicalClass);
      this.setDRBonus(dr);

      // Parse granted skills and spells
      const parsedGrants = DCCRaceClassApplier.parseSkillsAndSpells(canonicalClass);
      for (const sk of parsedGrants.skills) {
        this.addSkill({ name: sk.name, rank: sk.rank, isPassive: sk.isPassive });
      }
      for (const sp of parsedGrants.spells) {
        this.addSpell({ name: sp.name, rank: sp.rank, mpCost: sp.mpCost || 0 });
      }

      // Check choice skills in perks
      for (const raw of perks) {
        const p = cleanOCRText(raw);
        const choiceMatch = p.match(/^\+(\d+)\s+in\s+(?:a|one)\s+(weapon|crafting|combat)\s+Skill\s+of\s+your\s+choice/i);
        if (choiceMatch) {
          const rank = parseInt(choiceMatch[1], 10);
          const typeName = choiceMatch[2].charAt(0).toUpperCase() + choiceMatch[2].slice(1).toLowerCase();
          this.addSkill({ name: `${typeName} Skill (Choice)`, rank, isPassive: false });
        }
      }

      // Map perks to catalog benefits / detriments or custom perks
      this._populateClassPerks(canonicalClass);
    }
  }

  _populateClassPerks(cls) {
    const perks = Array.isArray(cls.system?.perks) ? cls.system.perks : [];
    
    for (const raw of perks) {
      const p = cleanOCRText(raw);

      // 1. Skip stat modifiers (already handled in stats)
      const statMatch = p.match(/^([+\-]\s*\d+)\s+(?:to\s+)?([A-Za-z,\s]+?)(?:\s+(?:Skills?|Spells?|table|Buff|DR|\(benefit\)|table of your choice))?(?:\s*\(.*?\))?$/i);
      if (statMatch) {
        const words = statMatch[2].split(/(?:,\s*|\s+and\s+)/i).map(w => w.trim().toLowerCase());
        const isStat = words.some(w => ['strength', 'str', 'dexterity', 'dex', 'constitution', 'con', 'intelligence', 'int', 'charisma', 'cha'].includes(w));
        if (isStat) continue;
      }
      if (p.includes('-1 to all St')) continue;

      // 2. Skip DR bonus (already handled in drBonus)
      if (/^[+\-]\d+\s+DR/i.test(p) || /^[+\-]\d+\s+Damage\s+Reduction/i.test(p)) continue;

      // 3. Skip Spells (already handled in spells)
      if (/^\+\d+\s+(?:in\s+)?[A-Za-z0-9\s,\u0027’\-!]+?\s+Spells?/i.test(p)) continue;

      // 4. Skip Skills (already handled in skills)
      if (/^\+\d+\s+(?:in\s+)?[A-Za-z0-9\s,\u0027’\-]+?\s+Skills?/i.test(p)) continue;
      if (/^\+\d+\s+in\s+(?:a|one)\s+(weapon|crafting|combat)\s+Skill\s+of\s+your\s+choice/i.test(p)) continue;

      // 5. Skip Earth Box (handled by isEarthClass)
      if (/silver earth box/i.test(p) || /earth hobby/i.test(p)) continue;

      // 6. Match catalog benefits / detriments
      const low = p.toLowerCase();

      // Catalog Benefits:
      if (low.includes('rage (benefit)')) {
        this.addCatalogBenefit('major_rage');
        continue;
      }
      if (low.includes('immunity to poison and all diseases')) {
        this.addCatalogBenefit('epic_disease_poison_immunity');
        continue;
      }
      if (low.includes('immunity to poison')) {
        this.addCatalogBenefit('extreme_poison_immunity');
        continue;
      }
      if (low.includes('can see in total darkness')) {
        this.addCatalogBenefit('minor_darkvision');
        continue;
      }
      if (low.includes('access to the desperado club')) {
        this.addCatalogBenefit('minor_club_desperado');
        continue;
      }
      if (low.includes('access to club vanquisher')) {
        this.addCatalogBenefit('minor_club_vanquisher');
        continue;
      }
      if (low.includes('access to all membership-based clubs')) {
        this.addCatalogBenefit('mod_all_clubs');
        continue;
      }
      if (low.includes('dungeon book of the floor club') || low.includes('spell book of the level') || low.includes('spellbook of the floor')) {
        this.addCatalogBenefit('mod_book_of_the_floor');
        continue;
      }
      if (low.includes('crafting table') || low.includes('arcanist table') || low.includes('alchemy table') || low.includes('smithing table') || low.includes('tattoo chair') || low.includes('makeup table')) {
        this.addCatalogBenefit('minor_crafting_table_t1');
        continue;
      }
      if (low.includes('ability to fly')) {
        this.addCatalogBenefit('epic_unrestricted_flight');
        continue;
      }
      if (low.includes('ability to breathe underwater')) {
        this.addCatalogBenefit('mod_water_breathing');
        continue;
      }
      if (low.includes('ability to burrow')) {
        this.addCatalogBenefit('mod_burrow');
        continue;
      }
      if (low.includes('limb regeneration benefit')) {
        this.addCatalogBenefit('epic_limb_regeneration');
        continue;
      }
      if (low.includes('free room at all saferooms')) {
        this.addCatalogBenefit('minor_safe_room');
        continue;
      }
      if (low.includes('discount at all stores') || low.includes('interest earned on all coins')) {
        this.addCatalogBenefit('minor_store_discount');
        continue;
      }
      if (low.includes('gain a friendly pet') || low.includes('gain a bonded mount')) {
        this.addCatalogBenefit('major_pet_or_mount');
        continue;
      }
      if (low.includes('the manager benefit')) {
        this.addCatalogBenefit('major_manager_assistance');
        continue;
      }
      if (low.includes('can be raised to rank 20') || low.includes('can be raised to 20')) {
        if (low.includes('and')) this.addCatalogBenefit('mod_linked_rank_20');
        else this.addCatalogBenefit('minor_rank_20_cap');
        continue;
      }
      if (low.includes('gold for every mob killed') || low.includes('gold for every mob you kill')) {
        this.addCatalogBenefit('mod_mob_gold_bounty');
        continue;
      }
      if (low.includes('gain +1 popularity') || low.includes('+1 popularity')) {
        this.addCatalogBenefit('mod_popularity_action');
        continue;
      }
      if (low.includes('mod a second time')) {
        this.addCatalogBenefit('mod_secondary_stat_mod');
        continue;
      }
      if (low.includes('mana recovers at twice the normal rate') || low.includes('double mana regeneration')) {
        this.addCatalogBenefit('minor_double_mana_terrain');
        continue;
      }
      if (low.includes('resistance to')) {
        this.addCatalogBenefit('mod_uncommon_resistance');
        continue;
      }
      if (low.includes('heal 1 additional health bar slot')) {
        this.addCatalogBenefit('mod_healing_spell_boost');
        continue;
      }
      if (low.includes('gain access to a patron') || low.includes('choose a patron') || low.includes('may gain access to a patron')) {
        this.addCatalogBenefit('mod_patron_benefit');
        continue;
      }
      if (low.includes('all the damage you deal is sonic')) {
        this.addCatalogBenefit('mod_damage_type_shift');
        continue;
      }
      if (low.includes('grant +1 dr to your party') || low.includes('grant regeneration at your skill rank to all party members')) {
        this.addCatalogBenefit('major_party_buff_daily');
        continue;
      }
      if (low.includes('can access any weapon training guild')) {
        this.addCatalogBenefit('mod_guild_access');
        continue;
      }
      if (low.includes('can see twice as far')) {
        this.addCatalogBenefit('minor_telescopic_vision');
        continue;
      }
      if (low.includes('double the duration of your rank 5')) {
        this.addCatalogBenefit('extreme_double_spell_duration');
        continue;
      }
      if (low.includes('skill advancement checks')) {
        this.addCatalogBenefit('minor_advancement_check');
        continue;
      }
      if (low.includes('advantage when making a repair') || low.includes('advantage when attacking') || low.includes('advantage on checks against') || low.includes('advantage when using a melee attack')) {
        this.addCatalogBenefit('minor_conditional_advantage');
        continue;
      }
      if (low.includes('roll a bonus 1d4 when you make the help')) {
        this.addCatalogBenefit('major_bonus_die_1d4');
        continue;
      }

      // Catalog Detriments:
      if (low.includes('must worship a deity')) {
        this.addCatalogDetriment('det_minor_mandatory_worship');
        continue;
      }
      if (low.includes('vulnerable to') || low.includes('vulnerability:') || low.includes('no dr against ice')) {
        this.addCatalogDetriment('det_minor_uncommon_vulnerability');
        continue;
      }
      if (low.includes('pay +1 mana')) {
        this.addCatalogDetriment('det_minor_unfavored_spell_mana');
        continue;
      }
      if (low.includes('pay +3 mana')) {
        this.addCatalogDetriment('det_mod_class_spell_mana_3');
        continue;
      }
      if (low.includes('may not use melee weapons other than')) {
        this.addCatalogDetriment('det_mod_weapon_restriction');
        continue;
      }
      if (low.includes('add no stat mod bonus damage') || low.includes('add no stat mod')) {
        this.addCatalogDetriment('det_mod_no_weapon_stat_mod');
        continue;
      }
      if (low.includes('cannot choose this class if you have access') || low.includes('cannot choose a cleric-type class')) {
        this.addCatalogDetriment('det_minor_club_exclusion');
        continue;
      }
      if (low.includes('ranks in all dexterity skill') || low.includes('ranks in all strength skill')) {
        this.addCatalogDetriment('det_minor_skill_penalties');
        continue;
      }

      // 7. Otherwise, add as Custom Perk
      const isDetriment = low.includes('vulnerability') || low.includes('penalty') || low.includes('disadvantage') || low.includes('cannot') || low.includes('prohibited');
      this.addCustomPerk({
        name: p,
        type: isDetriment ? 'detriment' : 'benefit',
        tier: 'Moderate',
        points: 2,
        extraPoints: 1,
        description: p
      });
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
    },
    scrollY: [
      '.dcc-studio-builder',
      '.dcc-receipt-list',
      '.dcc-studio-sidebar',
      '.dcc-studio-layout',
      '.window-content'
    ]
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

    // Presets list: Canonical Custom Presets + All Canonical DCC Classes
    const presets = [
      ...DCC_CANONICAL_PRESETS.map(p => ({
        id: p.id,
        name: `${p.name} (Canonical Custom Class)`,
        isCanonical: true
      })),
      ...DCC_CLASSES.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => ({
        id: c._id,
        name: `${c.name} (${c.system.classType || 'Class'})`,
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
      drBonus: this.drBonus,
      drCost: this.drBonus * 2,
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
    super.activateListeners(html);
    const $html = (html && typeof html.find === 'function') ? html : (typeof $ !== 'undefined' ? $(html) : html);

    // Helper to safely trigger re-render while preserving scroll and focus
    const reRenderWithState = (ev, fn) => {
      if (ev?.currentTarget) this._saveFocusState(ev.currentTarget);
      this._saveScrollPositions($html);
      if (typeof fn === 'function') fn();
      return this.render(false);
    };

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
    $html.find('input[name="isEarthClass"]').on('change', ev => {
      reRenderWithState(ev, () => {
        this.isEarthClass = ev.currentTarget.checked;
      });
    });

    // Archetype selection pills
    $html.find('.dcc-type-pill').on('click', ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type');
      reRenderWithState(ev, () => {
        if (this.classTypes.includes(type)) {
          if (this.classTypes.length > 1) {
            this.classTypes = this.classTypes.filter(t => t !== type);
          }
        } else {
          this.classTypes.push(type);
        }
      });
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

    // Damage Reduction (DR) Stepper
    $html.find('.dcc-dr-step-btn').on('click', ev => {
      ev.preventDefault();
      const delta = Number($(ev.currentTarget).data('delta')) || 0;
      reRenderWithState(ev, () => {
        this.stepDR(delta);
      });
    });

    // Add Skill
    $html.find('.dcc-add-skill-btn').on('click', ev => {
      ev.preventDefault();
      const nameInput = $html.find('input[name="newSkillName"]');
      const rankInput = $html.find('select[name="newSkillRank"]');
      const passiveInput = $html.find('input[name="newSkillPassive"]');
      const statInput = $html.find('select[name="newSkillStat"]');
      const checkTypeInput = $html.find('select[name="newSkillCheckType"]');
      const baseDamageInput = $html.find('input[name="newSkillBaseDamage"]');
      const canGainRanksInput = $html.find('input[name="newSkillCanGainRanks"]');
      const cooldownInput = $html.find('input[name="newSkillCooldown"]');

      const name = nameInput.val().trim();
      const rank = Number(rankInput.val()) || 1;
      const isPassive = Boolean(passiveInput.prop('checked'));
      const stat = statInput.val() || 'str';
      const checkType = checkTypeInput.val() || 'Stat Check';
      const baseDamage = baseDamageInput.val()?.trim() || '';
      const canGainRanks = canGainRanksInput.length ? Boolean(canGainRanksInput.prop('checked')) : true;
      const cooldown = cooldownInput.val()?.trim() || 'None';

      if (name) {
        reRenderWithState(ev, () => {
          this.addSkill({ name, rank, isPassive, stat, checkType, baseDamage, canGainRanks, cooldown });
        });
      }
    });

    // Remove Skill
    $html.find('.dcc-remove-skill-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.removeSkill(idx);
      });
    });

    // Add Custom Buff
    $html.find('.dcc-add-buff-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="newBuffName"]').val().trim();
      const desc = $html.find('input[name="newBuffDesc"]').val()?.trim() || '';
      const tier = $html.find('select[name="newBuffTier"]').val() || 'moderate';
      if (name) {
        reRenderWithState(ev, () => {
          this.addBuff({ name, description: desc, tier });
        });
      }
    });

    // Remove Custom Buff
    $html.find('.dcc-remove-buff-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.removeBuff(idx);
      });
    });

    // Add Custom Debuff
    $html.find('.dcc-add-debuff-btn').on('click', ev => {
      ev.preventDefault();
      const name = $html.find('input[name="newDebuffName"]').val().trim();
      const desc = $html.find('input[name="newDebuffDesc"]').val()?.trim() || '';
      const tier = $html.find('select[name="newDebuffTier"]').val() || 'moderate';
      if (name) {
        reRenderWithState(ev, () => {
          this.addDebuff({ name, description: desc, tier });
        });
      }
    });

    // Remove Custom Debuff
    $html.find('.dcc-remove-debuff-btn').on('click', ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      reRenderWithState(ev, () => {
        this.removeDebuff(idx);
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
        if (benefitId && String(benefitId).startsWith('mod_dr_buff_')) {
          if (isChecked) {
            const rank = benefitId === 'mod_dr_buff_1' ? 1 : (benefitId === 'mod_dr_buff_2' ? 2 : (benefitId === 'mod_dr_buff_3' ? 3 : 1));
            this.setDRBonus(rank);
          } else {
            this.setDRBonus(0);
          }
          return;
        }

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
        await this.applyToActor(actor, { interactive: true });
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
