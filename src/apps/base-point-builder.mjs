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

export class DCCBasePointBuilderApp extends DCCBaseApplication {
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
    const item = DCC_POINT_BUILD_BENEFITS.find(b => b.id === benefitId);
    if (item && !this.selectedBenefits.some(b => b.id === benefitId)) {
      this.selectedBenefits.push({ ...item });
    }
  }

  removeCatalogBenefit(benefitId) {
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
        skills: this.skills.map(s => ({ name: s.name, rank: s.rank, isPassive: s.isPassive })),
        spells: this.spells.map(sp => ({ name: sp.name, rank: sp.rank, isPassive: sp.isPassive })),
        perks: abilities,
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
   */
  async applyToActor(actor) {
    if (!actor) return null;

    const itemData = this.createItemData();

    // 1. Embed the class/race item
    let createdItem = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [item] = await actor.createEmbeddedDocuments('Item', [itemData]);
      createdItem = item;

      // 2. Also embed granted skill items
      const skillGrants = [];
      for (const s of this.skills) {
        if (s.name) {
          skillGrants.push({
            name: s.name,
            type: 'skill',
            system: {
              rank: s.rank,
              isPassive: Boolean(s.isPassive)
            }
          });
        }
      }
      for (const sp of this.spells) {
        if (sp.name) {
          skillGrants.push({
            name: sp.name,
            type: 'spell',
            system: {
              rank: sp.rank,
              mpCost: sp.mpCost || 0
            }
          });
        }
      }
      if (skillGrants.length > 0) {
        await actor.createEmbeddedDocuments('Item', skillGrants);
      }
    }

    // 3. Apply stat modifier deltas
    const currentStats = actor.system?.abilities || {};
    const updates = {};
    if (this.builderType === 'race') {
      updates['system.details.race'] = this.name || 'Custom Race';
      updates['system.attributes.size'] = this.getSizeName();
    }
    for (const [stat, delta] of Object.entries(this.stats)) {
      if (delta !== 0 && currentStats[stat]) {
        const cur = Number(currentStats[stat].value) || 10;
        updates[`system.abilities.${stat}.value`] = cur + delta;
      }
    }

    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
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
  }
}
