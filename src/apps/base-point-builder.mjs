/**
 * Dungeon Crawler Carl RPG — Base Point Builder Engine (ApplicationV2)
 *
 * Core interactive controller and point accounting engine for custom creation.
 * Shared foundation for both DCCClassCreatorApp (30 BP base) and DCCRaceCreatorApp (25 BP base).
 *
 * Per Chapter 3 (Page 158) of the official DCC RPG Core Rulebook:
 * - Shows exact points used for each attribute, perk, skill, and detriment.
 * - Does NOT enforce a hard point limit: soft badges and indicators inform the user
 *   without blocking item creation, export, or actor application.
 */

import { DCCBaseApplication } from './base-application.mjs';
import {
  DCC_BENEFIT_TIERS,
  DCC_DETRIMENT_TIERS,
  DCC_POINT_BUILD_BENEFITS,
  DCC_POINT_BUILD_DETRIMENTS,
  DCC_CANONICAL_PRESETS
} from '../data/point-build-catalog.mjs';
import { DCC_SIZES, getSizeInfo } from '../data/sizes.mjs';
import { DCCRaceClassApplier } from '../data/race-class-applier.mjs';

export class DCCBasePointBuilderApp extends DCCBaseApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      scrollY: [
        '.dcc-studio-builder',
        '.dcc-receipt-list',
        '.dcc-studio-sidebar',
        '.dcc-studio-layout',
        '.window-content'
      ]
    });
  }

  static DEFAULT_OPTIONS = {
    scrollY: [
      '.dcc-studio-builder',
      '.dcc-receipt-list',
      '.dcc-studio-sidebar',
      '.dcc-studio-layout',
      '.window-content'
    ]
  };

  constructor(options = {}) {
    super(options);

    this.builderType = options.builderType || 'class'; // 'class' | 'race'
    this.baseBudget = options.baseBudget ?? (this.builderType === 'race' ? 25 : 30);
    this.targetActorId = options.targetActorId || options.actor?.id || null;

    // Basic Information
    this.name = options.name || '';
    this.description = options.description || '';
    this.prerequisites = options.prerequisites || '';
    this.notes = options.notes || '';
    this.heritage = options.heritage || 'Earth';
    this.size = options.size !== undefined ? Number(options.size) : 4;

    // Ability Score Deltas (starts at 0)
    this.stats = {
      str: Number(options.stats?.str) || 0,
      dex: Number(options.stats?.dex) || 0,
      con: Number(options.stats?.con) || 0,
      int: Number(options.stats?.int) || 0,
      cha: Number(options.stats?.cha) || 0
    };

    // Damage Reduction (DR) Bonus (starts at 0, 2 BP per +1 DR)
    this.drBonus = options.drBonus !== undefined ? Number(options.drBonus) : 0;

    // Skills & Spells Arrays
    this.skills = Array.isArray(options.skills)
      ? options.skills.map(s => ({
          name: s.name || '',
          rank: Number(s.rank) || 1,
          isPassive: Boolean(s.isPassive),
          cost: (Number(s.rank) || 1) * 2
        }))
      : [];

    this.spells = Array.isArray(options.spells)
      ? options.spells.map(s => ({
          name: s.name || '',
          rank: Number(s.rank) || 1,
          isPassive: Boolean(s.isPassive),
          cost: (Number(s.rank) || 1) * 2
        }))
      : [];

    // Selected Benefits & Detriments from Catalog
    this.selectedBenefits = Array.isArray(options.selectedBenefits)
      ? [...options.selectedBenefits]
      : [];

    this.selectedDetriments = Array.isArray(options.selectedDetriments)
      ? [...options.selectedDetriments]
      : [];

    // Custom Freeform Perks
    this.customBenefits = Array.isArray(options.customBenefits)
      ? [...options.customBenefits]
      : [];

    this.customDetriments = Array.isArray(options.customDetriments)
      ? [...options.customDetriments]
      : [];

    // UI State (Accordion and search)
    this.searchQuery = '';
    this.activeTierFilter = 'all';
    this.accordionOpen = {
      minor: false,
      moderate: false,
      major: false,
      extreme: false,
      epic: false,
      detriments: false,
      custom: false
    };
  }

  // =========================================================================
  // BUILD PROXY ACCESSORS
  // =========================================================================

  get build() {
    return this;
  }

  get benefits() {
    return this.selectedBenefits;
  }

  set benefits(val) {
    this.selectedBenefits = Array.isArray(val) ? val : [];
  }

  get detriments() {
    return this.selectedDetriments;
  }

  set detriments(val) {
    this.selectedDetriments = Array.isArray(val) ? val : [];
  }

  // =========================================================================
  // PROGRAMMATIC BUILD MUTATORS
  // =========================================================================

  setStatBonus(stat, value) {
    const key = String(stat).toLowerCase();
    this.stats[key] = Number(value) || 0;
  }

  /**
   * Adjust Damage Reduction (DR) by delta (+1 or -1).
   * Automatically synchronizes with the Moderate Benefit catalog (2 BP per +1 DR).
   */
  stepDR(delta) {
    const cur = Number(this.drBonus) || 0;
    this.setDRBonus(Math.max(0, cur + Number(delta)));
  }

  /**
   * Sets Damage Reduction (DR) to an absolute value and synchronizes catalog benefits.
   */
  setDRBonus(val) {
    const next = Math.max(0, Number(val) || 0);
    this.drBonus = next;

    // Synchronize selectedBenefits: remove existing DR benefits
    this.selectedBenefits = this.selectedBenefits.filter(b => !b.id.startsWith('mod_dr_buff_'));

    if (next === 1) {
      const b = DCC_POINT_BUILD_BENEFITS.find(x => x.id === 'mod_dr_buff_1');
      if (b) this.selectedBenefits.push({ ...b });
    } else if (next === 2) {
      const b = DCC_POINT_BUILD_BENEFITS.find(x => x.id === 'mod_dr_buff_2');
      if (b) this.selectedBenefits.push({ ...b });
    } else if (next === 3) {
      const b = DCC_POINT_BUILD_BENEFITS.find(x => x.id === 'mod_dr_buff_3');
      if (b) this.selectedBenefits.push({ ...b });
    } else if (next > 3) {
      this.selectedBenefits.push({
        id: `mod_dr_buff_${next}`,
        name: `+${next} DR Buff`,
        tier: 'moderate',
        cost: next * 2,
        category: 'Defense',
        description: `Permanently gain +${next} Damage Reduction (DR). Costs ${next * 2} BP (2 BP per +1 DR).`
      });
    }
  }

  addSkill({ name, rank = 1, isPassive = false, type = 'active' } = {}) {
    const passive = Boolean(isPassive || type === 'passive');
    const r = Math.max(0, Number(rank) || 1);
    this.skills.push({
      name: name || '',
      rank: r,
      isPassive: passive,
      type: passive ? 'passive' : 'active',
      cost: r * 2
    });
  }

  removeSkill(index) {
    if (index >= 0 && index < this.skills.length) {
      this.skills.splice(index, 1);
    }
  }

  addSpell({ name, rank = 1, isPassive = false, mpCost = 0 } = {}) {
    const r = Math.max(0, Number(rank) || 1);
    this.spells.push({
      name: name || '',
      rank: r,
      isPassive: Boolean(isPassive),
      mpCost: Number(mpCost) || 0,
      cost: r * 2
    });
  }

  removeSpell(index) {
    if (index >= 0 && index < this.spells.length) {
      this.spells.splice(index, 1);
    }
  }

  addCatalogBenefit(benefitId) {
    if (benefitId && benefitId.startsWith('mod_dr_buff_')) {
      const rank = benefitId === 'mod_dr_buff_1' ? 1 : (benefitId === 'mod_dr_buff_2' ? 2 : (benefitId === 'mod_dr_buff_3' ? 3 : 1));
      this.setDRBonus(rank);
      return;
    }

    const item = DCC_POINT_BUILD_BENEFITS.find(b => b.id === benefitId);
    if (item && !this.selectedBenefits.some(b => b.id === benefitId)) {
      this.selectedBenefits.push({ ...item });
    }
  }

  removeCatalogBenefit(benefitId) {
    if (benefitId && benefitId.startsWith('mod_dr_buff_')) {
      this.setDRBonus(0);
      return;
    }

    this.selectedBenefits = this.selectedBenefits.filter(b => b.id !== benefitId);
  }

  addCatalogDetriment(detrimentId) {
    const item = DCC_POINT_BUILD_DETRIMENTS.find(d => d.id === detrimentId);
    if (item && !this.selectedDetriments.some(d => d.id === detrimentId)) {
      this.selectedDetriments.push({ ...item });
    }
  }

  removeCatalogDetriment(detrimentId) {
    this.selectedDetriments = this.selectedDetriments.filter(d => d.id !== detrimentId);
  }

  addCustomPerk({ name, type = 'benefit', tier = 'Moderate', points = 1, extraPoints = 1, description = '' } = {}) {
    if (type === 'detriment') {
      this.customDetriments.push({
        name: name || 'Custom Detriment',
        tier,
        extraPoints: Number(extraPoints ?? points) || 1,
        description
      });
    } else {
      this.customBenefits.push({
        name: name || 'Custom Benefit',
        tier,
        cost: Number(points) || 1,
        description
      });
    }
  }

  resetBuild() {
    this.name = this.builderType === 'race' ? 'Unnamed Custom Race' : 'Custom Class';
    this.description = '';
    this.prerequisites = '';
    this.notes = '';
    this.stats = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
    this.drBonus = 0;
    this.skills = [];
    this.spells = [];
    this.selectedBenefits = [];
    this.selectedDetriments = [];
    this.customBenefits = [];
    this.customDetriments = [];
  }

  exportBuildJSON() {
    return this.exportJSON();
  }

  importBuildJSON(jsonStr) {
    const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    if (data.name) this.name = data.name;
    if (data.system?.description || data.description) this.description = data.system?.description || data.description;
    if (data.system?.prerequisites || data.prerequisites) this.prerequisites = data.system?.prerequisites || data.prerequisites;
    if (data.system?.statModifiers || data.stats) {
      const s = data.system?.statModifiers || data.stats;
      this.stats = {
        str: Number(s.str) || 0,
        dex: Number(s.dex) || 0,
        con: Number(s.con) || 0,
        int: Number(s.int) || 0,
        cha: Number(s.cha) || 0
      };
    }
    if (Array.isArray(data.system?.skills || data.skills)) {
      this.skills = (data.system?.skills || data.skills).map(sk => ({
        name: sk.name,
        rank: Number(sk.rank) || 1,
        isPassive: Boolean(sk.isPassive),
        cost: (Number(sk.rank) || 1) * 2
      }));
    }
    if (Array.isArray(data.system?.spells || data.spells)) {
      this.spells = (data.system?.spells || data.spells).map(sp => ({
        name: sp.name,
        rank: Number(sp.rank) || 1,
        isPassive: Boolean(sp.isPassive),
        cost: (Number(sp.rank) || 1) * 2
      }));
    }
    if (Array.isArray(data.selectedBenefits || data.benefits)) {
      this.selectedBenefits = [...(data.selectedBenefits || data.benefits)];
    }
    if (Array.isArray(data.selectedDetriments || data.detriments)) {
      this.selectedDetriments = [...(data.selectedDetriments || data.detriments)];
    }

    if (data.system?.drBonus !== undefined || data.drBonus !== undefined) {
      this.setDRBonus(data.system?.drBonus ?? data.drBonus);
    } else {
      const drBenefit = this.selectedBenefits.find(b => b.id?.startsWith('mod_dr_buff_'));
      if (drBenefit) {
        const rank = drBenefit.id === 'mod_dr_buff_3' ? 3 : (drBenefit.id === 'mod_dr_buff_2' ? 2 : 1);
        this.drBonus = rank;
      } else {
        this.drBonus = 0;
      }
    }
  }

  // =========================================================================
  // POINT ACCOUNTING ENGINE
  // =========================================================================

  /**
   * Calculate point cost for creature size (Races only).
   * Size 1 (Tiny) or Size 2 (Small): 3 BP (Major Benefit per official catalog).
   * Size 5 (Large) or Size 6 (Huge): 3 BP (Major Benefit per official catalog).
   * Size 3 (Petite) or Size 4 (Medium): 0 BP baseline.
   */
  calculateSizeCost() {
    if (this.builderType !== 'race') return 0;
    const sz = Number(this.size) || 4;
    if (sz === 1 || sz === 2) return 3;
    if (sz >= 5) return 3;
    return 0;
  }

  getSizeName() {
    return getSizeInfo(this.size).name;
  }

  /**
   * Calculate point cost for ability score deltas.
   * Positive points: 1 BP per +1 stat.
   * Negative points: 1 extra BP per -2 penalty (handled under detriments).
   */
  calculateStatPoints() {
    let positiveCost = 0;
    let negativePoints = 0;

    for (const [key, val] of Object.entries(this.stats)) {
      const num = Number(val) || 0;
      if (num > 0) {
        positiveCost += num;
      } else if (num < 0) {
        negativePoints += Math.abs(num);
      }
    }

    // 1 extra build point for every 2 points of penalties
    const extraPointsFromNegatives = Math.floor(negativePoints / 2);

    return {
      positiveCost,
      negativePoints,
      extraPointsFromNegatives
    };
  }

  /**
   * Calculate points spent on skills and spells (2 BP per rank).
   */
  calculateSkillSpellPoints() {
    let skillCost = 0;
    let spellCost = 0;
    let passiveSkillRanks = 0;

    for (const s of this.skills) {
      const r = Math.max(0, Number(s.rank) || 0);
      skillCost += r * 2;
      if (s.isPassive) passiveSkillRanks += r;
    }

    for (const sp of this.spells) {
      const r = Math.max(0, Number(sp.rank) || 0);
      spellCost += r * 2;
      if (sp.isPassive) passiveSkillRanks += r;
    }

    return {
      skillCost,
      spellCost,
      passiveSkillRanks,
      isPassiveExceeded: passiveSkillRanks > 5
    };
  }

  /**
   * Calculate points spent on benefits (catalog + custom).
   */
  calculateBenefitPoints() {
    let catalogCost = 0;
    for (const b of this.selectedBenefits) {
      catalogCost += Number(b.cost) || 0;
    }

    let customCost = 0;
    for (const cb of this.customBenefits) {
      customCost += Number(cb.cost) || 0;
    }

    return {
      catalogCost,
      customCost,
      totalBenefitCost: catalogCost + customCost
    };
  }

  /**
   * Calculate extra build points gained from detriments (catalog + custom + stats).
   */
  calculateDetrimentPoints() {
    let catalogExtra = 0;
    for (const d of this.selectedDetriments) {
      catalogExtra += Number(d.extraPoints) || 0;
    }

    let customExtra = 0;
    for (const cd of this.customDetriments) {
      customExtra += Number(cd.extraPoints) || 0;
    }

    const { extraPointsFromNegatives } = this.calculateStatPoints();
    const totalExtra = catalogExtra + customExtra + extraPointsFromNegatives;

    return {
      catalogExtra,
      customExtra,
      statExtra: extraPointsFromNegatives,
      totalExtraPoints: totalExtra,
      isDetrimentCapped: totalExtra > 5 // Rule: max +5 extra BP per class/race
    };
  }

  /**
   * Compute complete point ledger and receipt.
   */
  getPointLedger() {
    const statData = this.calculateStatPoints();
    const skillData = this.calculateSkillSpellPoints();
    const benefitData = this.calculateBenefitPoints();
    const detrimentData = this.calculateDetrimentPoints();

    const sizeCost = this.calculateSizeCost();
    const pointsSpent =
      statData.positiveCost +
      skillData.skillCost +
      skillData.spellCost +
      benefitData.totalBenefitCost +
      sizeCost;

    const extraPoints = detrimentData.totalExtraPoints;
    const effectiveBudget = this.baseBudget + extraPoints;
    const balance = effectiveBudget - pointsSpent;
    const isOverbudget = pointsSpent > effectiveBudget;
    const overbudgetAmount = Math.max(0, pointsSpent - effectiveBudget);

    // Itemized receipt lines
    const receiptItems = [];

    // Stats
    for (const [stat, val] of Object.entries(this.stats)) {
      if (val > 0) {
        receiptItems.push({
          type: 'stat',
          label: `+${val} ${stat.toUpperCase()}`,
          cost: val,
          isExtra: false
        });
      } else if (val < 0) {
        receiptItems.push({
          type: 'stat_detriment',
          label: `${val} ${stat.toUpperCase()}`,
          cost: `-${Math.abs(val)}`,
          isExtra: true
        });
      }
    }

    // Skills
    for (const s of this.skills) {
      if (s.name && s.rank > 0) {
        receiptItems.push({
          type: 'skill',
          label: `+${s.rank} ${s.name} Skill${s.isPassive ? ' (Passive)' : ''}`,
          cost: s.rank * 2,
          isExtra: false
        });
      }
    }

    // Spells
    for (const sp of this.spells) {
      if (sp.name && sp.rank > 0) {
        receiptItems.push({
          type: 'spell',
          label: `+${sp.rank} ${sp.name} Spell${sp.isPassive ? ' (Passive)' : ''}`,
          cost: sp.rank * 2,
          isExtra: false
        });
      }
    }

    // Benefits
    for (const b of this.selectedBenefits) {
      receiptItems.push({
        type: 'benefit',
        label: b.name,
        cost: b.cost,
        isExtra: false
      });
    }

    // Custom Benefits
    for (const cb of this.customBenefits) {
      receiptItems.push({
        type: 'custom_benefit',
        label: cb.name,
        cost: cb.cost,
        isExtra: false
      });
    }

    // Detriments
    for (const d of this.selectedDetriments) {
      receiptItems.push({
        type: 'detriment',
        label: d.name,
        extraPoints: d.extraPoints,
        isExtra: true
      });
    }

    // Custom Detriments
    for (const cd of this.customDetriments) {
      receiptItems.push({
        type: 'custom_detriment',
        label: cd.name,
        extraPoints: cd.extraPoints,
        isExtra: true
      });
    }

    // Size Cost (for Races)
    if (sizeCost > 0) {
      receiptItems.push({
        type: 'size',
        label: `Size ${this.size} (${this.getSizeName()})`,
        cost: sizeCost,
        isExtra: false
      });
    }

    return {
      baseBudget: this.baseBudget,
      extraPoints,
      effectiveBudget,
      spent: pointsSpent,
      pointsSpent,
      balance,
      remaining: balance,
      isOverbudget,
      overbudgetAmount,
      isLegal: !isOverbudget && !skillData.isPassiveExceeded,
      hasSkillRankCapWarning: skillData.isPassiveExceeded,
      statCost: statData.positiveCost,
      statPenaltyExtra: statData.extraPointsFromNegatives,
      skillCost: skillData.skillCost,
      spellCost: skillData.spellCost,
      benefitCost: benefitData.catalogCost,
      customCost: benefitData.customCost,
      sizeCost,
      detrimentExtraPoints: Math.min(5, detrimentData.catalogExtra + detrimentData.customExtra),
      rawDetrimentPoints: detrimentData.catalogExtra + detrimentData.customExtra,
      receiptItems,
      items: receiptItems,
      passiveSkillRanks: skillData.passiveSkillRanks,
      isPassiveExceeded: skillData.isPassiveExceeded,
      isDetrimentCapped: detrimentData.isDetrimentCapped
    };
  }

  /**
   * Prepares context data for display and testing.
   */
  getData() {
    const ledger = this.getPointLedger();
    return {
      builderType: this.builderType,
      name: this.name,
      description: this.description,
      prerequisites: this.prerequisites,
      notes: this.notes,
      stats: this.stats,
      drBonus: this.drBonus,
      drCost: this.drBonus * 2,
      skills: this.skills,
      spells: this.spells,
      benefits: this.selectedBenefits,
      detriments: this.selectedDetriments,
      selectedBenefits: this.selectedBenefits,
      selectedDetriments: this.selectedDetriments,
      customBenefits: this.customBenefits,
      customDetriments: this.customDetriments,
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
      heritage: this.heritage,
      size: this.size,
      sizeName: this.getSizeName(),
      sizeCost: ledger.sizeCost,
      statCost: ledger.statCost,
      statPenaltyExtra: ledger.statPenaltyExtra,
      skillCost: ledger.skillCost,
      spellCost: ledger.spellCost,
      benefitCost: ledger.benefitCost,
      customCost: ledger.customCost,
      detrimentExtraPoints: ledger.detrimentExtraPoints,
      rawDetrimentPoints: ledger.rawDetrimentPoints
    };
  }

  // =========================================================================
  // DOCUMENT GENERATION & EXPORT
  // =========================================================================

  /**
   * Generates a clean bullet list of all abilities, perks, stat bonuses, skills, and detriments.
   * @returns {string[]}
   */
  compileAbilitiesList() {
    const list = [];

    // Stat bonuses / penalties
    const statPartsPos = [];
    const statPartsNeg = [];
    for (const [s, v] of Object.entries(this.stats)) {
      if (v > 0) statPartsPos.push(`+${v} ${this.formatStatName(s)}`);
      else if (v < 0) statPartsNeg.push(`${v} ${this.formatStatName(s)}`);
    }
    if (statPartsPos.length) list.push(statPartsPos.join(', '));
    if (statPartsNeg.length) list.push(statPartsNeg.join(', '));

    // DR bonus (if not already represented in selectedBenefits)
    if (this.drBonus > 0 && !this.selectedBenefits.some(b => b.id?.startsWith('mod_dr_buff_'))) {
      list.push(`+${this.drBonus} Damage Reduction (DR)`);
    }

    // Skills
    for (const s of this.skills) {
      if (s.name && s.rank > 0) {
        list.push(`+${s.rank} ${s.name} Skill${s.isPassive ? ' (Passive)' : ''}`);
      }
    }

    // Spells
    for (const sp of this.spells) {
      if (sp.name && sp.rank > 0) {
        list.push(`+${sp.rank} ${sp.name} Spell${sp.isPassive ? ' (Passive)' : ''}`);
      }
    }

    // Benefits
    for (const b of this.selectedBenefits) {
      list.push(b.customText || b.name);
    }
    for (const cb of this.customBenefits) {
      list.push(cb.name);
    }

    // Detriments
    for (const d of this.selectedDetriments) {
      list.push(d.customText || d.name);
    }
    for (const cd of this.customDetriments) {
      list.push(cd.name);
    }

    return list;
  }

  formatStatName(abbr) {
    const map = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      cha: 'Charisma'
    };
    return map[abbr.toLowerCase()] || abbr.toUpperCase();
  }

  /**
   * Generates a complete Item document payload conforming to Foundry VTT Item schema.
   */
  createItemData() {
    const abilities = this.compileAbilitiesList();
    const abilitiesHtml = abilities.length
      ? `<ul>${abilities.map(a => `<li>${a}</li>`).join('')}</ul>`
      : '';
    const descHtml = this.description
      ? `<p>${this.description}</p>`
      : '';

    const ledger = this.getPointLedger();

    const perks = [
      ...this.selectedBenefits.map(b => b.customText || b.name),
      ...this.customBenefits.map(cb => cb.name)
    ];
    const detriments = [
      ...this.selectedDetriments.map(d => d.customText || d.name),
      ...this.customDetriments.map(cd => cd.name)
    ];

    return {
      name: this.name || (this.builderType === 'race' ? 'Unnamed Custom Race' : 'Custom Class'),
      type: this.builderType,
      img: this.builderType === 'race' ? 'icons/default-icons/ancestry.svg' : 'icons/default-icons/class.svg',
      system: {
        description: descHtml,
        abilities: abilitiesHtml,
        prerequisites: this.prerequisites || '',
        heritage: this.heritage || 'Earth',
        size: this.builderType === 'race' ? `${this.getSizeName()} (${this.size})` : 'Medium (4)',
        sizeNumber: this.size,
        statModifiers: { ...this.stats },
        bonuses: {
          stats: { ...this.stats }
        },
        drBonus: this.drBonus,
        skills: this.skills.map(s => ({ name: s.name, rank: s.rank, isPassive: s.isPassive })),
        spells: this.spells.map(sp => ({ name: sp.name, rank: sp.rank, isPassive: sp.isPassive })),
        perks: perks.length > 0 ? perks : abilities,
        detriments,
        chosenPerks: this.chosenPerks || (perks.length > 0 ? perks : abilities),
        chosenDetriments: this.chosenDetriments || detriments,
        buildPoints: ledger.pointsSpent,
        buildLedger: ledger,
        isCustomBuild: true
      }
    };
  }

  /**
   * Save the created item directly into the world's Items directory.
   */
  async saveToWorldItem() {
    const itemData = this.createItemData();
    if (globalThis.Item && typeof globalThis.Item.create === 'function') {
      const created = await globalThis.Item.create(itemData);
      if (globalThis.ui?.notifications) {
        globalThis.ui.notifications.info(`Created ${this.builderType}: "${created.name}" in Items directory!`);
      }
      return created;
    }
    return null;
  }

  /**
   * Exports the build specification as formatted JSON.
   */
  exportJSON() {
    const itemData = this.createItemData();
    const ledger = this.getPointLedger();
    return JSON.stringify({
      ...itemData,
      ledger,
      selectedBenefits: this.selectedBenefits,
      selectedDetriments: this.selectedDetriments,
      customBenefits: this.customBenefits,
      customDetriments: this.customDetriments
    }, null, 2);
  }

  /**
   * Applies the custom class/race directly to a Crawler Actor.
   *
   * @param {Actor} actor
   * @param {object} [options={}]
   * @returns {Promise<Item|null>}
   */
  async applyToActor(actor, options = {}) {
    if (!actor) return null;

    let itemData = this.createItemData();

    // Check for detected choices or (Choice) items
    const choices = DCCRaceClassApplier.detectChoices(itemData);
    let resolvedChoices = { chosenSkills: [], chosenSpells: [] };

    if (choices.length > 0) {
      if (options.choices !== undefined) {
        resolvedChoices = DCCRaceClassApplier.resolveChoices(itemData, choices, options.choices);
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog)) {
        const userSelections = await DCCRaceClassApplier.promptChoicesDialog(itemData, choices, options);
        if (userSelections === null) return null; // Cancelled
        resolvedChoices = DCCRaceClassApplier.resolveChoices(itemData, choices, userSelections);
      } else {
        resolvedChoices = DCCRaceClassApplier.resolveChoices(itemData, choices, {});
      }
    }

    // Resolve into builder's skill/spell lists
    if (resolvedChoices.chosenSkills.length > 0) {
      for (const cs of resolvedChoices.chosenSkills) {
        const choiceIdx = this.skills.findIndex(s => s.name?.includes('(Choice)'));
        if (choiceIdx !== -1) {
          this.skills[choiceIdx] = { ...this.skills[choiceIdx], name: cs.name, rank: cs.rank, isPassive: Boolean(cs.isPassive) };
        } else if (!this.skills.some(s => s.name === cs.name)) {
          this.skills.push({ name: cs.name, rank: cs.rank, isPassive: Boolean(cs.isPassive) });
        }
      }
    }
    if (resolvedChoices.chosenSpells.length > 0) {
      for (const csp of resolvedChoices.chosenSpells) {
        const choiceIdx = this.spells.findIndex(sp => sp.name?.includes('(Choice)'));
        if (choiceIdx !== -1) {
          this.spells[choiceIdx] = { ...this.spells[choiceIdx], name: csp.name, rank: csp.rank, mpCost: csp.mpCost || 0 };
        } else if (!this.spells.some(sp => sp.name === csp.name)) {
          this.spells.push({ name: csp.name, rank: csp.rank, mpCost: csp.mpCost || 0 });
        }
      }
    }

    // Perks & Detriments resolution
    const { perks, detriments } = DCCRaceClassApplier.extractPerksAndDetriments({
      ...itemData,
      selectedBenefits: this.selectedBenefits,
      selectedDetriments: this.selectedDetriments,
      customBenefits: this.customBenefits,
      customDetriments: this.customDetriments
    });

    let chosenPerks = perks;
    let chosenDetriments = detriments;

    if (perks.length > 0 || detriments.length > 0) {
      if (options.chosenPerks !== undefined || options.chosenDetriments !== undefined) {
        chosenPerks = options.chosenPerks || perks;
        chosenDetriments = options.chosenDetriments || detriments;
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog && !options.skipPerksDialog)) {
        const perkSelection = await DCCRaceClassApplier.promptPerksDetrimentsDialog(itemData, { perks, detriments }, options);
        if (perkSelection === null) return null; // Cancelled
        chosenPerks = perkSelection.chosenPerks;
        chosenDetriments = perkSelection.chosenDetriments;
      }
    }

    // Recreate item data with updated skills/spells & chosen choices/perks/detriments
    itemData = this.createItemData();
    if (!itemData.system) itemData.system = {};
    itemData.system.chosenSkills = resolvedChoices.chosenSkills;
    itemData.system.chosenSpells = resolvedChoices.chosenSpells;
    itemData.system.perks = perks;
    itemData.system.detriments = detriments;
    itemData.system.chosenPerks = chosenPerks;
    itemData.system.chosenDetriments = chosenDetriments;

    // 1. Embed the class/race item
    let createdItem = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [item] = await actor.createEmbeddedDocuments('Item', [itemData]);
      createdItem = item;

      // 2. Also embed granted skill and spell items
      const skillGrants = [];
      for (const s of this.skills) {
        if (s.name && !s.name.includes('(Choice)')) {
          skillGrants.push({
            name: s.name,
            type: 'skill',
            system: {
              rank: s.rank,
              isPassive: Boolean(s.isPassive)
            },
            flags: {
              'carl-rpg': {
                grantedBy: this.builderType || 'custom'
              }
            }
          });
        }
      }
      for (const sp of this.spells) {
        if (sp.name && !sp.name.includes('(Choice)')) {
          skillGrants.push({
            name: sp.name,
            type: 'spell',
            system: {
              rank: sp.rank,
              mpCost: sp.mpCost || 0
            },
            flags: {
              'carl-rpg': {
                grantedBy: this.builderType || 'custom'
              }
            }
          });
        }
      }
      if (skillGrants.length > 0) {
        await actor.createEmbeddedDocuments('Item', skillGrants);
      }

      // 3. Embed condition items (perk buffs & detriment debuffs)
      const conditions = DCCRaceClassApplier.parseConditions(itemData, this.builderType, { chosenPerks, chosenDetriments });
      const conditionItemsToCreate = [
        ...(conditions.buffs || []),
        ...(conditions.debuffs || [])
      ];
      if (conditionItemsToCreate.length > 0) {
        await actor.createEmbeddedDocuments('Item', conditionItemsToCreate);
      }
    }

    // 4. Apply stat modifier deltas and detail strings
    const currentStats = actor.system?.abilities || {};
    const updates = {};
    const abilitiesSummary = [...chosenPerks, ...chosenDetriments].join('; ');
    if (this.builderType === 'race') {
      updates['system.details.race'] = this.name || 'Custom Race';
      if (abilitiesSummary) updates['system.details.raceAbilities'] = abilitiesSummary;
      updates['system.attributes.size'] = this.getSizeName();
    } else {
      updates['system.details.class'] = this.name || 'Custom Class';
      if (abilitiesSummary) updates['system.details.classAbilities'] = abilitiesSummary;
    }
    for (const [stat, delta] of Object.entries(this.stats)) {
      if (delta !== 0 && currentStats[stat]) {
        const cur = Number(currentStats[stat].value) || 10;
        updates[`system.abilities.${stat}.value`] = cur + delta;
      }
    }

    // 5. Apply DR bonus if defined
    if (this.drBonus > 0) {
      const curDR = Number(actor.system?.attributes?.dr?.buffs) || 0;
      updates['system.attributes.dr.buffs'] = curDR + this.drBonus;
    }

    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    // 6. Set actor tracking flag
    const flagKey = this.builderType === 'race' ? 'appliedRace' : 'appliedClass';
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', flagKey, {
        name: itemData.name,
        stats: { ...this.stats },
        drBonus: this.drBonus,
        chosenSkills: resolvedChoices.chosenSkills,
        chosenSpells: resolvedChoices.chosenSpells,
        chosenPerks,
        chosenDetriments,
        itemId: createdItem?.id
      });
    }

    if (typeof this.render === 'function') {
      this.render();
    }

    if (globalThis.ui?.notifications) {
      globalThis.ui.notifications.info(`Successfully applied ${this.builderType} "${itemData.name}" to ${actor.name}!`);
    }

    return createdItem;
  }

  // =========================================================================
  // PRESET HANDLING
  // =========================================================================

  loadPreset(presetId) {
    const preset = DCC_CANONICAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.name = preset.name;
    this.description = preset.description || '';
    this.prerequisites = preset.prerequisites || '';
    if (preset.stats) this.stats = { ...preset.stats };
    if (preset.skills) this.skills = preset.skills.map(s => ({ ...s }));
    if (preset.spells) this.spells = preset.spells.map(sp => ({ ...sp }));
    if (preset.selectedBenefits) this.selectedBenefits = preset.selectedBenefits.map(b => ({ ...b }));
    if (preset.selectedDetriments) this.selectedDetriments = preset.selectedDetriments.map(d => ({ ...d }));
    this.customBenefits = [];
    this.customDetriments = [];

    // Synchronize drBonus from preset benefits
    const drBenefit = this.selectedBenefits.find(b => b.id?.startsWith('mod_dr_buff_') || (b.category === 'Defense' && b.name.includes('DR')));
    if (drBenefit) {
      if (drBenefit.id === 'mod_dr_buff_3' || drBenefit.name.includes('+3')) this.drBonus = 3;
      else if (drBenefit.id === 'mod_dr_buff_2' || drBenefit.name.includes('+2') || drBenefit.cost === 4) this.drBonus = 2;
      else if (drBenefit.id === 'mod_dr_buff_1' || drBenefit.name.includes('+1') || drBenefit.cost === 2) this.drBonus = 1;
      else this.drBonus = Math.max(0, Math.floor((drBenefit.cost || 0) / 2));
    } else {
      this.drBonus = preset.drBonus || 0;
    }
  }

  /**
   * Binds global scroll retention and focus capture across all point builder studios.
   */
  activateListeners(html) {
    super.activateListeners(html);
    const $html = (html && typeof html.find === 'function') ? html : ((typeof $ !== 'undefined') ? $(html) : html);
    if (!$html || typeof $html.on !== 'function') return;

    // Continuous scroll tracking
    $html.find('.dcc-studio-builder, .dcc-receipt-list, .dcc-studio-sidebar, .dcc-studio-layout').on('scroll', () => {
      this._saveScrollPositions($html);
    });

    // Mousedown & focusin capture for exact target tracking
    $html.on('mousedown focusin', 'input, select, textarea, button, [tabindex], .dcc-accordion-header, .dcc-type-pill, .dcc-heritage-pill, .dcc-size-pill, .dcc-filter-pill', ev => {
      this._saveFocusState(ev.currentTarget);
      this._saveScrollPositions($html);
    });
  }
}
