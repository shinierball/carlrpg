import { DCCSkillManager } from '../apps/skill-manager.mjs';
import { DCCSpellManager } from '../apps/spell-manager.mjs';
import { DCCBuffDebuffManager } from '../apps/buff-manager.mjs';
import { DCCAchievementManagerApp } from '../apps/achievement-manager.mjs';
import { DCC_ACHIEVEMENT_TIERS } from '../data/achievements.mjs';
import { DCC_WEAPON_GROUP_MAP, DAMAGE_EFFECT_AI_FAVOR } from '../documents/actor.mjs';
import { DCC_SIZES, getSizeInfo } from '../data/sizes.mjs';
import { rollBackgroundTable } from '../data/background-tables.mjs';

/**
 * Helper to format active gear bonuses into a readable string summary
 */
export function formatGearBonuses(gearItem) {
  const parts = [];
  const sys = gearItem.system;
  if (!sys) return '';
  const dr = Number(sys.drBonus ?? sys.armorBonus) || 0;
  if (dr !== 0) parts.push(`${dr > 0 ? '+' : ''}${dr} DR`);
  const evade = Number(sys.evadeBonus) || 0;
  if (evade !== 0) parts.push(`${evade > 0 ? '+' : ''}${evade} Evade`);

  if (sys.abilityModifiers) {
    for (const [stat, mods] of Object.entries(sys.abilityModifiers)) {
      if (!mods) continue;
      const val = Number(mods.value);
      const type = (mods.type || 'flat').toLowerCase();
      if (Number.isFinite(val) && val !== 0) {
        if (type === 'pct' || type === '%') {
          parts.push(`${val > 0 ? '+' : ''}${val}% ${stat.toUpperCase()}`);
        } else {
          parts.push(`${val > 0 ? '+' : ''}${val} ${stat.toUpperCase()}`);
        }
      } else {
        // Fallback for legacy format { flat, pct }
        const flat = Number(mods.flat) || 0;
        const pct = Number(mods.pct) || 0;
        if (flat !== 0) parts.push(`${flat > 0 ? '+' : ''}${flat} ${stat.toUpperCase()}`);
        if (pct !== 0) parts.push(`${pct > 0 ? '+' : ''}${pct}% ${stat.toUpperCase()}`);
      }
    }
  }

  let rawMods = sys.skillModifiers;
  if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
    rawMods = Object.values(rawMods);
  }
  if (Array.isArray(rawMods)) {
    for (const sm of rawMods) {
      if (sm && sm.name) {
        const bonus = Number(sm.bonus) || 0;
        parts.push(`${bonus >= 0 ? '+' : ''}${bonus} ${sm.name}`);
      }
    }
  }
  return parts.join(', ');
}

/**
 * Determines whether a gear item functions as an attack / weapon.
 * Recognized if:
 * 1. Explicitly marked as weapon (system.isWeapon === true)
 * 2. Slot is 'hands' or 'holding'
 * 3. Defines weapon damageParts
 * @param {object} item 
 * @returns {boolean}
 */
export function isWeaponGear(item) {
  if (!item || item.type !== 'gear') return false;
  const sys = item.system || {};
  if (sys.isWeapon === true) return true;
  const slot = (sys.slot || '').toLowerCase();
  const rawParts = sys.damageParts;
  const parts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts || {});
  const hasDamageParts = parts.length > 0 && parts.some(p => p && (p.dice || p.value || p.stat));
  if (hasDamageParts) return true;
  if (slot === 'hands' || slot === 'holding') return true;
  return false;
}

/**
 * Prepares consistent display properties for attack table rows
 * (supporting both native attack items and equipped weapon gear).
 * @param {object} item 
 * @param {object} actor 
 * @returns {object}
 */
export function prepareAttackDisplay(item, actor) {
  const sys = item.system || {};
  const isGear = item.type === 'gear';
  const skills = actor?.items ? (actor.items.filter ? actor.items.filter(i => i.type === 'skill') : Array.from(actor.items.values?.() || actor.items).filter(i => i.type === 'skill')) : [];
  const matchingSkill = skills.find(s => s.name?.toLowerCase().trim() === item.name?.toLowerCase().trim());

  // To-Hit resolution
  let toHitStat = sys.toHitStat;
  if (!toHitStat) {
    if (matchingSkill?.system?.stat) {
      toHitStat = matchingSkill.system.stat;
    } else if (isGear && Array.isArray(sys.damageParts) && sys.damageParts[0]?.stat) {
      toHitStat = sys.damageParts[0].stat;
    } else {
      toHitStat = isGear ? 'str' : 'dex';
    }
  }
  const toHitRank = matchingSkill
    ? (Number(matchingSkill.system?.modifiedRank ?? matchingSkill.system?.rank) || 0)
    : (Number(sys.toHitRank ?? sys.rank) || 0);

  item.displayToHitStat = toHitStat.toUpperCase();
  item.displayToHitRank = toHitRank;
  item.displayToHit = `${item.displayToHitStat} (${toHitRank})`;

  // Damage formula display
  const rawParts = sys.damageParts;
  const parts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts || {});
  if (parts.length > 0 && parts[0]) {
    const p = parts[0];
    const statStr = p.stat ? ` + ${p.stat.toUpperCase()}` : '';
    const typeStr = p.type ? ` (${p.type})` : '';
    const extra = parts.length > 1 ? ` (+${parts.length - 1} parts)` : '';
    item.displayDamage = `${p.dice || '1d6'}${statStr}${typeStr}${extra}`;
  } else {
    const dice = sys.damageDice || '1d6';
    const stat = sys.damageStat ? ` + ${sys.damageStat.toUpperCase()}` : '';
    const type = sys.damageType ? ` (${sys.damageType})` : '';
    item.displayDamage = `${dice}${stat}${type}`;
  }

  item.displayEffects = sys.effects || sys.notes || '';
  item.isWeaponGear = isGear;
  item.isAttackEquipped = sys.equipped !== false;

  if (typeof actor?.getValidDamageEffects === 'function') {
    const validEffects = actor.getValidDamageEffects(item);
    item.validDamageEffects = validEffects;
    item.hasOptionalEffects = validEffects.length > 0;
    const normName = (item.name || '').toLowerCase().trim();
    item.favorBonus = DAMAGE_EFFECT_AI_FAVOR[normName] || 0;
    item.selectedEffect = sys.selectedEffect || 'none';
  } else {
    item.validDamageEffects = [];
    item.hasOptionalEffects = false;
    item.selectedEffect = sys.selectedEffect || 'none';
    item.favorBonus = 0;
  }

  return item;
}

/**
 * Dungeon Crawler Carl Character Sheet Controller
 * Extends ActorSheet (FormApplication V1) for native Foundry V12/V13 stability,
 * while maintaining Application V2 structure (_prepareContext, DEFAULT_OPTIONS, PARTS).
 */
const BaseActorSheet = globalThis.foundry?.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;

export class DCCCrawlerSheet extends BaseActorSheet {
  constructor(actorOrOptions, options = {}) {
    let actorDoc = actorOrOptions;
    let sheetOptions = options;
    if (actorOrOptions && typeof actorOrOptions === 'object' && actorOrOptions.document) {
      actorDoc = actorOrOptions.document;
      sheetOptions = actorOrOptions;
    }
    super(actorDoc, sheetOptions);
  }

  /**
   * Application V2 Options
   */
  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['dcc-sheet-window', 'actor', 'crawler'],
    position: {
      width: 860,
      height: 900
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    window: {
      resizable: true,
      controls: [
        {
          icon: 'fa-solid fa-file-pdf',
          label: 'Save to PDF',
          action: 'exportPdf'
        }
      ]
    },
    actions: {
      exportPdf: DCCCrawlerSheet.#onExportPdfAction
    }
  };

  /**
   * Application V2 Parts definition
   */
  static PARTS = {
    sheet: {
      template: 'systems/carl-rpg/templates/actors/crawler-sheet.hbs'
    }
  };

  static async #onExportPdfAction(event, target) {
    return this._onExportPdf();
  }

  /** @override (V1 compatibility) */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions || {}, {
      classes: ['dcc-sheet-window', 'actor', 'crawler'],
      template: 'systems/carl-rpg/templates/actors/crawler-sheet.hbs',
      width: 860,
      height: 900,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'page1' }],
      dragDrop: [{ dragSelector: '[data-item-id]', dropSelector: null }],
      scrollY: ['.sheet-body'],
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false
    });
  }

  /** @override */
  _onDragStart(event) {
    const li = event.currentTarget.closest?.('[data-item-id]');
    if (!li) return super._onDragStart ? super._onDragStart(event) : undefined;
    const itemId = li.dataset?.itemId;
    const item = this.actor.items.get?.(itemId) ||
      (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
    if (!item) return super._onDragStart ? super._onDragStart(event) : undefined;
    const dragData = typeof item.toDragData === 'function'
      ? item.toDragData()
      : { type: 'Item', uuid: item.uuid || item.id, id: item.id, data: item.toObject ? item.toObject() : item };
    event.dataTransfer?.setData('text/plain', JSON.stringify(dragData));
  }

  /** @override (V1 compatibility) */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons ? super._getHeaderButtons() : [];
    buttons.unshift({
      label: 'Save to PDF',
      class: 'save-pdf-btn',
      icon: 'fa-solid fa-file-pdf',
      onclick: () => this._onExportPdf()
    });
    return buttons;
  }

  /**
   * Application V2 context preparation
   * @override
   */
  async _prepareContext(options = {}) {
    const context = (typeof super._prepareContext === 'function')
      ? await super._prepareContext(options)
      : (typeof super.getData === 'function' ? await super.getData(options) : {});

    const actor = this.actor || this.document || this.object;
    const actorData = context.data || actor;

    context.actor = actor;
    context.document = actor;
    context.data = actor;
    context.system = actor?.system || actorData?.system || {};
    context.isMob = actor?.type === 'mob';
    context.isCrawler = actor?.type === 'crawler';
    context.isPet = actor?.type === 'pet';
    context.isNPC = actor?.type === 'npc';
    context.currentFloor = typeof DCCActor !== 'undefined' && typeof DCCActor.getCurrentFloor === 'function' ? DCCActor.getCurrentFloor() : 1;

    // Dynamic health segments for health bar visualization
    const numBars = context.isMob
      ? Math.max(1, Number(context.system.attributes?.hp?.bars) || 2)
      : 10;
    context.healthSegments = [];
    for (let i = 1; i <= numBars; i++) {
      context.healthSegments.push({
        pct: Math.round((i / numBars) * 100),
        label: `${Math.round((i / numBars) * 100)}%`
      });
    }

    // Prepare creature size options
    const currentSize = context.system.attributes?.size ?? 'Medium';
    const currentSizeInfo = getSizeInfo(currentSize);
    context.currentSizeInfo = currentSizeInfo;
    context.sizeOptions = (CONFIG.DCC?.sizes || DCC_SIZES).map(s => ({
      size: s.size,
      name: s.name,
      label: s.label,
      selected: s.size === currentSizeInfo.size
    }));

    // Categorize embedded items
    context.attacks = [];
    context.stowedAttacks = [];
    context.skills = [];
    context.spells = [];
    context.gear = [];
    context.races = [];
    context.classes = [];
    context.deities = [];
    context.sponsors = [];
    context.loot = [];
    context.buffs = [];
    context.debuffs = [];
    context.achievements = [];

    // Track equipped items by slot
    context.equippedBySlot = {
      head: null,
      torso: null,
      arms: null,
      hands: null,
      legs: null,
      feet: null,
      accessory: [],
      tattoo: [],
      patch: []
    };

    for (const item of this.actor.items) {
      if (item.type === 'attack') {
        prepareAttackDisplay(item, this.actor);
        const isEquipped = item.system?.equipped !== false;
        if (isEquipped) {
          context.attacks.push(item);
        } else {
          context.stowedAttacks.push(item);
        }
      }
      else if (item.type === 'skill') context.skills.push(item);
      else if (item.type === 'spell') context.spells.push(item);
      else if (item.type === 'gear') {
        item.bonusesSummary = formatGearBonuses(item);
        context.gear.push(item);

        const isWeapon = isWeaponGear(item);
        if (isWeapon) {
          prepareAttackDisplay(item, this.actor);
          if (item.system?.equipped) {
            context.attacks.push(item);
          } else {
            context.stowedAttacks.push(item);
          }
        }

        if (item.system?.equipped) {
          const slot = (item.system.slot || 'torso').toLowerCase();
          if (Array.isArray(context.equippedBySlot[slot])) {
            context.equippedBySlot[slot].push(item);
          } else {
            context.equippedBySlot[slot] = item;
          }
        }
      }
      else if (item.type === 'race') context.races.push(item);
      else if (item.type === 'class') context.classes.push(item);
      else if (item.type === 'deity') context.deities.push(item);
      else if (item.type === 'sponsor') context.sponsors.push(item);
      else if (item.type === 'loot') context.loot.push(item);
      else if (item.type === 'buff') {
        const sys = item.system || {};
        const parts = [];
        if (sys.healingPerRound) {
          parts.push(`+${sys.healingPerRound} HP/rnd`);
        } else if ((sys.buffType === 'heal' || sys.buffType === 'healing' || sys.buffType === 'regeneration') && sys.value) {
          parts.push(`+${sys.value} HP/rnd`);
        }
        if (sys.buffType === 'stat' && sys.stat) {
          parts.push(`+${sys.value || 0} ${(sys.stat || '').toUpperCase()}`);
        }
        item.summary = parts.join(' • ') || sys.description || '';
        context.buffs.push(item);
      }
      else if (item.type === 'debuff') {
        const sys = item.system || {};
        const sev = (sys.severity || 'Minor').toLowerCase();
        item.severityClass = sev === 'major' ? 'is-major' : 'is-minor';
        const parts = [];
        if (sys.damagePerRound) {
          parts.push(`${sys.damagePerRound} ${sys.damageType || ''} DoT/rnd`.trim());
        }
        if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
          parts.push(sys.statModifiers.map(m => `${m.value > 0 ? '+' : ''}${m.value} ${(m.stat || '').toUpperCase()}`).join(', '));
        } else if (sys.stat) {
          parts.push(`${Number(sys.value) > 0 ? '+' : ''}${sys.value} ${(sys.stat || '').toUpperCase()}`);
        }
        if (sys.reductionPercent && sys.damageType) {
          parts.push(`-${sys.reductionPercent}% ${sys.damageType}`);
        }
        item.summary = parts.join(' • ') || sys.description || '';
        context.debuffs.push(item);
      }
      else if (item.type === 'achievement') {
        const sys = item.system || {};
        const tier = (sys.tier || 'bronze').toLowerCase();
        const tierConfig = DCC_ACHIEVEMENT_TIERS?.[tier] || {
          label: tier.toUpperCase(),
          color: '#e74c3c',
          icon: 'fa-solid fa-trophy',
          bgColor: 'rgba(231, 76, 60, 0.15)'
        };
        item.tierLabel = tierConfig.label || tier.toUpperCase();
        item.tierColor = tierConfig.color || '#e74c3c';
        item.tierIcon = tierConfig.icon || 'fa-solid fa-trophy';
        item.tierBgColor = tierConfig.bgColor || 'rgba(231, 76, 60, 0.15)';
        context.achievements.push(item);
      }
    }

    // Calculate achievement statistics
    const tierCounts = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      legendary: 0,
      celestial: 0,
      quest: 0,
      secret: 0,
      special: 0
    };
    let totalAchievementFavor = 0;
    let totalAchievementXP = 0;
    for (const ach of context.achievements) {
      const t = (ach.system?.tier || 'bronze').toLowerCase();
      if (tierCounts[t] !== undefined) tierCounts[t]++;
      else tierCounts.special = (tierCounts.special || 0) + 1;
      totalAchievementFavor += Number(ach.system?.favor) || 0;
      totalAchievementXP += Number(ach.system?.xp) || 0;
    }
    context.achievementStats = {
      total: context.achievements.length,
      byTier: tierCounts,
      totalFavor: totalAchievementFavor,
      totalXP: totalAchievementXP
    };

    // Prepare Boss Stars & Crawler Skulls (Trophies & Public Notoriety Badges)
    context.trophyBadges = typeof this.actor?.getBadgeSummary === 'function' ? this.actor.getBadgeSummary() : null;
    const trophies = this.actor?.system?.trophies || {};
    context.trophyTiers = [
      { id: 'bronze', label: 'Bronze Star', bossLevel: 'Neighborhood Boss', count: trophies.bosses?.bronze || 0, color: '#cd7f32', class: 'star-bronze' },
      { id: 'silver', label: 'Silver Star', bossLevel: 'Borough Boss', count: trophies.bosses?.silver || 0, color: '#dcdde1', class: 'star-silver' },
      { id: 'gold', label: 'Gold Star', bossLevel: 'City Boss', count: trophies.bosses?.gold || 0, color: '#f1c40f', class: 'star-gold' },
      { id: 'platinum', label: 'Platinum Star', bossLevel: 'Country Boss', count: trophies.bosses?.platinum || 0, color: '#00d2d3', class: 'star-platinum' },
      { id: 'legendary', label: 'Legendary Star', bossLevel: 'Floor Boss', count: trophies.bosses?.legendary || 0, color: '#e67e22', class: 'star-legendary' },
      { id: 'celestial', label: 'Celestial Star', bossLevel: 'Dungeon Boss', count: trophies.bosses?.celestial || 0, color: '#9b59b6', class: 'star-celestial' }
    ];
    context.crawlerKillCount = trophies.crawlers?.count || 0;
    context.bossLog = Array.isArray(trophies.bossLog) ? trophies.bossLog : [];
    context.crawlerLog = Array.isArray(trophies.crawlerLog) ? trophies.crawlerLog : [];

    // Tally gear skill bonuses from equipped gear
    const gearSkillBonuses = new Map();
    for (const item of context.gear) {
      if (!item.system?.equipped) continue;
      let rawMods = item.system.skillModifiers;
      if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
        rawMods = Object.values(rawMods);
      }
      const skillMods = Array.isArray(rawMods) ? rawMods : [];
      for (const sm of skillMods) {
        if (!sm || !sm.name) continue;
        const norm = sm.name.toLowerCase().trim();
        const bonus = Number(sm.bonus) || 0;
        if (!gearSkillBonuses.has(norm)) {
          gearSkillBonuses.set(norm, { bonus: 0, sources: [], originalName: sm.name });
        }
        const entry = gearSkillBonuses.get(norm);
        entry.bonus += bonus;
        entry.sources.push(`${item.name} (+${bonus})`);
      }
    }

    // Calculate generic weapon group bonuses and apply to actor skills
    const ownedSkillNames = new Set(context.skills.map(s => s.name.toLowerCase().trim()));
    const genericTypeBonuses = new Map(); // e.g. 'Edge' -> { bonus: 0, sources: [] }

    // First pass: collect bonuses from owned generic weapon group skills
    for (const skill of context.skills) {
      const norm = skill.name.toLowerCase().trim();
      const baseRank = Number(skill.system?.rank) || 0;
      const gearData = gearSkillBonuses.get(norm);
      const itemBonus = gearData ? gearData.bonus : 0;
      const boonBonus = Number(skill.system?.boonBonus) || 0;
      const selfRank = Math.max(0, baseRank + itemBonus + boonBonus);

      const groupType = DCC_WEAPON_GROUP_MAP[norm];
      if (groupType && selfRank > 0) {
        if (!genericTypeBonuses.has(groupType)) {
          genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
        }
        const entry = genericTypeBonuses.get(groupType);
        entry.bonus += selfRank;
        entry.sources.push(`${skill.name} (+${selfRank})`);
      }
    }

    // Incorporate gear modifiers referencing a weapon group/type directly when not owned
    for (const [norm, data] of gearSkillBonuses.entries()) {
      const groupType = DCC_WEAPON_GROUP_MAP[norm];
      if (groupType && !ownedSkillNames.has(norm) && data.bonus > 0) {
        if (!genericTypeBonuses.has(groupType)) {
          genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
        }
        const entry = genericTypeBonuses.get(groupType);
        entry.bonus += data.bonus;
        entry.sources.push(...data.sources);
      }
    }

    // Second pass: apply item, boon, and type bonuses to existing skills
    for (const skill of context.skills) {
      const norm = skill.name.toLowerCase().trim();
      const isGroupSkill = Boolean(DCC_WEAPON_GROUP_MAP[norm]);
      const skillType = skill.system?.skillType || skill.system?.type || '';

      let typeBonus = 0;
      let typeSources = '';

      if (!isGroupSkill && skillType && genericTypeBonuses.has(skillType)) {
        const tData = genericTypeBonuses.get(skillType);
        typeBonus = tData.bonus;
        typeSources = tData.sources.join(', ');
      }

      const baseRank = Number(skill.system?.rank) || 0;
      const gearData = gearSkillBonuses.get(norm);
      const itemBonus = gearData ? gearData.bonus : 0;
      const boonBonus = Number(skill.system?.boonBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus + typeBonus);

      const stat = skill.system?.stat || 'str';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      const totalSkill = modifiedRank + mod;

      skill.baseRank = baseRank;
      skill.itemBonus = itemBonus;
      skill.boonBonus = boonBonus;
      skill.typeBonus = typeBonus;
      skill.modifiedRank = modifiedRank;
      skill.effectiveRank = modifiedRank;
      skill.statMod = mod;
      skill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
      skill.totalSkill = totalSkill;
      skill.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
      skill.itemSources = gearData ? gearData.sources.join(', ') : '';
      skill.typeSources = typeSources;

      if (skill.system) {
        skill.system.itemBonus = itemBonus;
        skill.system.boonBonus = boonBonus;
        skill.system.typeBonus = typeBonus;
        skill.system.modifiedRank = modifiedRank;
        skill.system.totalSkill = totalSkill;
        skill.system.statMod = mod;
      }

      const dmgData = this.actor.getSkillDamageData(skill);
      skill.hasDamage = dmgData.hasDamage;
      skill.damageFormulaWithStat = dmgData.formulaWithStat;
      const checkType = (skill.system?.checkType || '').toLowerCase();
      skill.isAttack = dmgData.hasDamage ||
        checkType.includes('attack') ||
        ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
        (skill.system?.category || '').toLowerCase() === 'combat';
    }

    // Add granted skills from equipped gear that the actor doesn't own
    this._grantedSkills = new Map();
    for (const [norm, data] of gearSkillBonuses.entries()) {
      if (!ownedSkillNames.has(norm)) {
        const official = (CONFIG.DCC?.skills || []).find(s => s.name.toLowerCase().trim() === norm);
        const grantedId = `granted-${norm.replace(/\s+/g, '-')}`;
        const stat = official ? official.system.stat : 'str';
        const mod = context.system.abilities?.[stat]?.mod ?? 0;
        const skillType = official ? (official.system?.skillType || official.system?.type || 'Utility') : 'Combat';
        const isGroupSkill = Boolean(DCC_WEAPON_GROUP_MAP[norm]);

        let typeBonus = 0;
        let typeSources = '';
        if (!isGroupSkill && skillType && genericTypeBonuses.has(skillType)) {
          const tData = genericTypeBonuses.get(skillType);
          typeBonus = tData.bonus;
          typeSources = tData.sources.join(', ');
        }

        const modifiedRank = data.bonus + typeBonus;
        const totalSkill = modifiedRank + mod;

        const grantedSkill = {
          id: grantedId,
          _id: grantedId,
          name: official ? official.name : data.originalName,
          type: 'skill',
          img: official ? official.img : 'icons/magic/defensive/shield-barrier-blue.webp',
          isGranted: true,
          baseRank: 0,
          itemBonus: data.bonus,
          boonBonus: 0,
          typeBonus: typeBonus,
          modifiedRank: modifiedRank,
          effectiveRank: modifiedRank,
          statMod: mod,
          statModStr: mod >= 0 ? `+${mod}` : `${mod}`,
          totalSkill: totalSkill,
          totalSkillStr: totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`,
          itemSources: data.sources.join(', '),
          typeSources: typeSources,
          system: {
            rank: 0,
            itemBonus: data.bonus,
            boonBonus: 0,
            typeBonus: typeBonus,
            modifiedRank: modifiedRank,
            totalSkill: totalSkill,
            stat: stat,
            skillType: skillType,
            type: skillType,
            checkType: official ? official.system.checkType : 'Stat Check',
            category: official ? (official.system.category || 'Utility') : 'Combat',
            notes: `Granted by ${data.sources.join(', ')}`,
            upgrades: '',
            checked: false
          }
        };

        const grantedDmg = this.actor.getSkillDamageData(grantedSkill);
        grantedSkill.hasDamage = grantedDmg.hasDamage;
        grantedSkill.damageFormulaWithStat = grantedDmg.formulaWithStat;
        const checkType = (grantedSkill.system?.checkType || '').toLowerCase();
        grantedSkill.isAttack = grantedDmg.hasDamage ||
          checkType.includes('attack') ||
          ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
          (grantedSkill.system?.category || '').toLowerCase() === 'combat';

        this._grantedSkills.set(grantedId, grantedSkill);
        context.skills.push(grantedSkill);
      }
    }

    // Sort helper: prioritize item.sort index, fallback to alphabetical
    const sortItems = (a, b) => (a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name);

    context.skills.sort(sortItems);

    // Prepare spells (stat modifiers, damage data, sorting)
    for (const spell of context.spells) {
      const stat = spell.system?.stat || 'int';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      spell.statMod = mod;
      spell.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
      const dmgData = typeof this.actor.getSpellDamageData === 'function' ? this.actor.getSpellDamageData(spell) : null;
      spell.hasDamage = dmgData?.hasDamage ?? false;
      spell.damageFormula = dmgData?.formula ?? '';
      spell.damageDice = dmgData?.dice ?? '';
      spell.damageType = dmgData?.damageType || spell.system?.damageType || '';
      spell.isAttack = spell.system?.spellType === 'Attack';
    }
    context.spells.sort(sortItems);
    context.gear.sort(sortItems);
    context.loot.sort(sortItems);
    context.buffs.sort(sortItems);
    context.debuffs.sort(sortItems);
    context.attacks.sort(sortItems);
    context.stowedAttacks.sort(sortItems);
    context.stowedAttacksCount = context.stowedAttacks.length;
    context.showStowedAttacks = Boolean(this._showStowedAttacks);

    // Prepare Hotlist Slots (1-10)
    const hotlistData = context.system.hotlist || {};
    context.hotlistSlots = [];

    for (let i = 1; i <= 10; i++) {
      const slotKey = `slot${i}`;
      let rawVal = hotlistData[slotKey] || '';

      // Safely sanitize array or comma-separated concatenation
      if (Array.isArray(rawVal)) {
        rawVal = rawVal[0] || '';
      }
      let valStr = String(rawVal).trim();
      if (valStr.includes(',')) {
        const parts = valStr.split(',').map(s => s.trim()).filter(Boolean);
        const match = parts.find(p => this.actor.items.get?.(p) ||
          (Array.isArray(this.actor.items)
            ? this.actor.items.find(it => it.id === p || it.name.toLowerCase() === p.toLowerCase())
            : this.actor.items.find?.(it => it.id === p || it.name.toLowerCase() === p.toLowerCase())));
        valStr = match || parts[0] || '';
      }

      let resolvedItem = null;
      if (valStr) {
        // 1. Look up by ID on actor items
        resolvedItem = this.actor.items.get?.(valStr);
        // 2. Look up by ID or name in actor items array/collection
        if (!resolvedItem) {
          const norm = valStr.toLowerCase().trim();
          resolvedItem = Array.isArray(this.actor.items)
            ? this.actor.items.find(it => it.id === valStr || it._id === valStr || it.name.toLowerCase().trim() === norm)
            : this.actor.items.find?.(it => it.id === valStr || it._id === valStr || it.name.toLowerCase().trim() === norm);
        }
        // 3. Look up official spells if ID is a compendium spell ID or name
        if (!resolvedItem && CONFIG.DCC?.spells) {
          const compSpell = CONFIG.DCC.spells.find(s => s._id === valStr || s.name.toLowerCase().trim() === valStr.toLowerCase().trim());
          if (compSpell) {
            const owned = context.spells.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
            resolvedItem = owned || {
              id: compSpell._id,
              name: compSpell.name,
              type: 'spell',
              img: compSpell.img,
              system: compSpell.system,
              isCompendium: true
            };
          }
        }
        // 4. Look up in world items
        if (!resolvedItem && globalThis.game?.items) {
          const worldItem = game.items.find(it => it.id === valStr || it.name.toLowerCase().trim() === valStr.toLowerCase().trim());
          if (worldItem) resolvedItem = worldItem;
        }
      }

      let slotType = '';
      let badge = '';
      let detail = '';
      let gearSlot = '';
      let isEquipped = false;
      let isSpell = false;
      let isGear = false;
      let isLoot = false;
      let isAttack = false;
      let slotHasDamage = false;

      let displayName = valStr;
      if (resolvedItem) {
        displayName = resolvedItem.name;
        slotType = resolvedItem.type;
        if (slotType === 'spell') {
          isSpell = true;
          badge = 'SPELL';
          detail = `${resolvedItem.system?.manaCost ?? 0} MP`;
          if (resolvedItem.system?.spellType) {
            detail += ` • ${resolvedItem.system.spellType}`;
          }
          const dmgData = typeof this.actor.getSpellDamageData === 'function' ? this.actor.getSpellDamageData(resolvedItem) : null;
          slotHasDamage = dmgData?.hasDamage ?? false;
        } else if (slotType === 'gear') {
          isGear = true;
          gearSlot = resolvedItem.system?.slot || 'gear';
          isEquipped = Boolean(resolvedItem.system?.equipped);
          badge = gearSlot.toUpperCase();
          detail = isEquipped ? 'Equipped' : 'Unequipped';
        } else if (slotType === 'loot') {
          isLoot = true;
          badge = 'ITEM';
          detail = `x${resolvedItem.system?.quantity ?? 1}`;
          if (resolvedItem.system?.notes) {
            detail += ` • ${resolvedItem.system.notes}`;
          }
        } else if (slotType === 'attack') {
          isAttack = true;
          badge = 'ATTACK';
          detail = resolvedItem.system?.damageDice || '';
          if (resolvedItem.system?.damageStat) {
            detail += ` + ${resolvedItem.system.damageStat.toUpperCase()}`;
          }
        } else if (slotType === 'skill') {
          const dmgData = typeof this.actor.getSkillDamageData === 'function' ? this.actor.getSkillDamageData(resolvedItem) : null;
          slotHasDamage = dmgData?.hasDamage ?? false;
          const checkType = (resolvedItem.system?.checkType || '').toLowerCase();
          const skillType = resolvedItem.system?.skillType || resolvedItem.system?.type || '';
          isAttack = slotHasDamage ||
            checkType.includes('attack') ||
            ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
            (resolvedItem.system?.category || '').toLowerCase() === 'combat';
          badge = isAttack ? 'ATTACK' : 'SKILL';
          const rk = resolvedItem.system?.modifiedRank ?? resolvedItem.system?.rank ?? 1;
          detail = `Rank ${rk}`;
          if (slotHasDamage && dmgData?.formulaWithStat) {
            detail += ` • ${dmgData.formulaWithStat}`;
          } else if (resolvedItem.statModStr) {
            detail += ` (${resolvedItem.statModStr})`;
          }
        } else {
          badge = slotType.toUpperCase();
        }
      } else if (valStr) {
        // If unresolvable ID string, do not show raw hash/ID if we can avoid it
        if (/^dccspl\d+/.test(valStr) && CONFIG.DCC?.spells) {
          const found = CONFIG.DCC.spells.find(s => s._id === valStr);
          if (found) displayName = found.name;
        }
      }

      // Build grouped selectable options for this slot
      const groups = [];

      // Spells group
      if (context.spells.length) {
        groups.push({
          label: 'Spells',
          items: context.spells.map(s => ({
            id: s.id,
            label: `⚡ ${s.name} (${s.system?.manaCost ?? 0} MP)`,
            selected: s.id === valStr || s.name.toLowerCase() === valStr.toLowerCase() || s.id === resolvedItem?.id
          }))
        });
      }

      // Attacks group
      if (context.attacks.length) {
        groups.push({
          label: 'Attacks',
          items: context.attacks.map(a => ({
            id: a.id,
            label: `⚔️ ${a.name}${a.system?.damageDice ? ` (${a.system.damageDice})` : ''}`,
            selected: a.id === valStr || a.name.toLowerCase() === valStr.toLowerCase() || a.id === resolvedItem?.id
          }))
        });
      }

      // Skills group
      if (context.skills.length) {
        groups.push({
          label: 'Skills',
          items: context.skills.map(sk => ({
            id: sk.id,
            label: `🎯 ${sk.name} (Rank ${sk.system?.modifiedRank ?? sk.system?.rank ?? 1})`,
            selected: sk.id === valStr || sk.name.toLowerCase() === valStr.toLowerCase() || sk.id === resolvedItem?.id
          }))
        });
      }

      // Gear group
      if (context.gear.length) {
        groups.push({
          label: 'Gear (Equipment)',
          items: context.gear.map(g => ({
            id: g.id,
            label: `🛡️ ${g.name} [${(g.system?.slot || 'gear').toUpperCase()}]${g.system?.equipped ? ' (Equipped)' : ''}`,
            selected: g.id === valStr || g.name.toLowerCase() === valStr.toLowerCase() || g.id === resolvedItem?.id
          }))
        });
      }

      // Inventory / Loot group
      if (context.loot.length) {
        groups.push({
          label: 'Inventory Items',
          items: context.loot.map(l => ({
            id: l.id,
            label: `📦 ${l.name} (x${l.system?.quantity ?? 1})`,
            selected: l.id === valStr || l.name.toLowerCase() === valStr.toLowerCase() || l.id === resolvedItem?.id
          }))
        });
      }

      context.hotlistSlots.push({
        index: i,
        key: slotKey,
        value: valStr,
        isEmpty: !valStr,
        item: resolvedItem,
        itemId: resolvedItem?.id || '',
        name: displayName,
        img: resolvedItem ? (resolvedItem.img || 'icons/svg/item-bag.svg') : '',
        type: slotType,
        isSpell,
        isGear,
        isLoot,
        isAttack,
        hasDamage: slotHasDamage,
        isEquipped,
        gearSlot,
        badge,
        detail,
        groups,
        isCustom: Boolean(valStr && !resolvedItem)
      });
    }

    // -------------------------------------------------------------------------
    // EXTERNAL BUFF SLOTS (Max 3)
    // -------------------------------------------------------------------------
    const rawExternalBuffs = context.system.attributes?.externalBuffs || {};
    context.externalBuffSlots = [];

    // Helper to format descriptive labels for any buff item
    const formatBuffOptionLabel = (b, defaultIcon = '✨') => {
      const sys = b.system || {};
      const bType = (sys.buffType || '').toLowerCase();
      let details = '';

      if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
        details = sys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
      } else if (bType === 'stat' && sys.stat) {
        details = `+${sys.value || 2} ${(sys.stat || '').toUpperCase()}`;
      } else if (bType === 'temphp' || bType === 'temp_hp') {
        details = `+${sys.value || 10} Temp HP`;
      } else if (bType === 'resistance' && sys.damageType) {
        details = `Resist ${sys.damageType}`;
      } else if (bType === 'immunity' && sys.damageType) {
        details = `Immune ${sys.damageType}`;
      } else if (bType === 'damagemultiplier' || sys.damageMultiplier > 1) {
        details = `*${sys.damageMultiplier || sys.value || 2} ${sys.damageType || 'Total'} Dmg`;
      } else if (Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0) {
        details = sys.damageModifiers.map(m => m.type || m.damageType || 'Mod').join(', ');
      }

      return details ? `${defaultIcon} ${b.name} (${details})` : `${defaultIcon} ${b.name}`;
    };

    // 1. Owned Buffs on Actor
    const ownedBuffs = context.buffs || (this.actor.items ? Array.from(this.actor.items).filter(it => it.type === 'buff') : []);
    const ownedBuffOptions = ownedBuffs.map(b => ({
      id: b.id || b._id,
      name: b.name,
      label: formatBuffOptionLabel(b, '✨')
    }));

    // 2. World Buff Items (items created in the world directory of type buff)
    const worldBuffs = globalThis.game?.items
      ? Array.from(game.items).filter(it => it.type === 'buff' && !ownedBuffs.some(ob => (ob.id && ob.id === it.id) || ob.name.toLowerCase() === it.name.toLowerCase()))
      : [];
    const worldBuffOptions = worldBuffs.map(b => ({
      id: b.id || b._id,
      name: b.name,
      label: formatBuffOptionLabel(b, '🔮')
    }));

    // 3. Compendium & Preloaded System Buffs
    const compBuffsMap = new Map();
    if (CONFIG.DCC?.buffs) {
      for (const b of CONFIG.DCC.buffs) {
        compBuffsMap.set(b._id || b.name.toLowerCase().trim(), {
          id: b._id,
          name: b.name,
          system: b.system || {}
        });
      }
    }
    if (globalThis.game?.packs) {
      const buffPack = game.packs.get('carl-rpg.buffs');
      if (buffPack) {
        const index = buffPack.index || [];
        for (const entry of index) {
          const key = entry._id || entry.name.toLowerCase().trim();
          if (!compBuffsMap.has(key)) {
            compBuffsMap.set(key, {
              id: entry._id,
              name: entry.name,
              system: entry.system || {}
            });
          }
        }
      }
    }

    const allCompBuffs = Array.from(compBuffsMap.values());
    const statBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'stat' || (Array.isArray(b.system?.statModifiers) && b.system.statModifiers.length > 0))
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '⚡') }));
    const tempHpBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'tempHp' || b.system?.buffType === 'temp_hp')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '❤️') }));
    const resistBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'resistance')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '🛡️') }));
    const immuneBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'immunity')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '🌟') }));
    const combatBuffOptions = allCompBuffs
      .filter(b => (b.system?.buffType === 'damageMultiplier' || Number(b.system?.damageMultiplier) > 1 || (Array.isArray(b.system?.damageModifiers) && b.system.damageModifiers.length > 0)) && b.system?.buffType !== 'stat')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '⚔️') }));
    const otherBuffOptions = allCompBuffs
      .filter(b => {
        const t = (b.system?.buffType || '').toLowerCase();
        return !['stat', 'temphp', 'temp_hp', 'resistance', 'immunity'].includes(t) &&
          !Number(b.system?.damageMultiplier > 1) &&
          (!Array.isArray(b.system?.statModifiers) || !b.system.statModifiers.length) &&
          (!Array.isArray(b.system?.damageModifiers) || !b.system.damageModifiers.length);
      })
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '✨') }));

    for (let i = 1; i <= 3; i++) {
      const slotKey = `buff${i}`;
      let rawVal = rawExternalBuffs[slotKey] || '';
      if (Array.isArray(rawVal)) rawVal = rawVal[0] || '';
      let valStr = String(rawVal).trim();
      if (valStr.includes(',')) {
        valStr = valStr.split(',')[0].trim();
      }

      const resolvedBuff = typeof this.actor.resolveBuff === 'function' ? this.actor.resolveBuff(valStr) : null;
      let displayName = valStr;
      let badge = '';
      let detail = '';
      let isKnownOption = false;

      if (resolvedBuff) {
        displayName = resolvedBuff.name;
        const bSys = resolvedBuff.system || {};
        const bType = (bSys.buffType || '').toLowerCase();
        if (Array.isArray(bSys.statModifiers) && bSys.statModifiers.length > 0) {
          badge = 'STAT';
          detail = bSys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
        } else if (bType === 'stat') {
          badge = 'STAT';
          detail = `+${bSys.value || 2} ${(bSys.stat || '').toUpperCase()}`;
        } else if (bType === 'temphp' || bType === 'temp_hp') {
          badge = 'TEMP HP';
          detail = `+${bSys.value || 10} Temp HP`;
        } else if (bType === 'resistance') {
          badge = 'RESIST';
          detail = `50% ${bSys.damageType || ''} Dmg`;
        } else if (bType === 'immunity') {
          badge = 'IMMUNE';
          detail = `Negate ${bSys.damageType || ''} Dmg`;
        } else if (bType === 'damagemultiplier' || Number(bSys.damageMultiplier) > 1) {
          badge = 'MULT';
          detail = `*${bSys.damageMultiplier || bSys.value || 2} ${bSys.damageType || 'Total'} Dmg`;
        } else if (Array.isArray(bSys.damageModifiers) && bSys.damageModifiers.length > 0) {
          badge = 'COMBAT';
          detail = bSys.damageModifiers.map(m => m.type || m.damageType || 'Mod').join(', ');
        } else {
          badge = 'BUFF';
          detail = bSys.description || '';
        }
      }

      // Build available buff option groups in display order
      const rawGroups = [
        { label: '📦 Character Buffs', options: ownedBuffOptions },
        { label: '🌍 World Buffs', options: worldBuffOptions },
        { label: '⚡ Ability Score Buffs', options: statBuffOptions },
        { label: '❤️ Temporary Health Buffs', options: tempHpBuffOptions },
        { label: '🛡️ Damage Resistance Buffs', options: resistBuffOptions },
        { label: '🌟 Damage Immunity Buffs', options: immuneBuffOptions },
        { label: '⚔️ Damage Multiplier & Combat Buffs', options: combatBuffOptions },
        { label: '✨ Other Compendium Buffs', options: otherBuffOptions }
      ].filter(g => g.options.length > 0);

      // Determine the single matching option to mark selected across all groups
      let selectedOptionId = null;

      if (valStr) {
        // Priority 1: Exact ID match against resolvedBuff.id
        if (resolvedBuff?.id) {
          for (const g of rawGroups) {
            const match = g.options.find(o => o.id === resolvedBuff.id);
            if (match) {
              selectedOptionId = match.id;
              break;
            }
          }
        }

        // Priority 2: Exact ID match against valStr
        if (!selectedOptionId) {
          for (const g of rawGroups) {
            const match = g.options.find(o => o.id === valStr);
            if (match) {
              selectedOptionId = match.id;
              break;
            }
          }
        }

        // Priority 3: Exact Name match against valStr or resolvedBuff.name
        // Priority order ensures Character Buffs are chosen over Compendium defaults
        if (!selectedOptionId) {
          const lowerVal = valStr.toLowerCase();
          const lowerResolvedName = resolvedBuff?.name?.toLowerCase();
          for (const g of rawGroups) {
            const match = g.options.find(o => {
              const oNameLower = o.name?.toLowerCase();
              return oNameLower && (oNameLower === lowerVal || oNameLower === lowerResolvedName);
            });
            if (match) {
              selectedOptionId = match.id;
              break;
            }
          }
        }
      }

      isKnownOption = Boolean(selectedOptionId);

      // Collect buffs assigned to other slots to prevent assigning the same buff to multiple slots
      const otherAssigned = [];
      for (let j = 1; j <= 3; j++) {
        if (j !== i) {
          const otherVal = rawExternalBuffs[`buff${j}`];
          if (otherVal) {
            const otherStr = String(otherVal).trim().toLowerCase();
            const otherItem = (this.actor?.items?.get ? this.actor.items.get(otherVal) : null) ||
              (Array.isArray(this.actor?.items) ? this.actor.items.find(it => String(it.id).toLowerCase() === otherStr || String(it.name).trim().toLowerCase() === otherStr) : null);
            otherAssigned.push({
              slotNum: j,
              id: otherItem?.id ? String(otherItem.id).toLowerCase() : otherStr,
              name: otherItem?.name ? String(otherItem.name).trim().toLowerCase() : otherStr
            });
          }
        }
      }

      const groups = rawGroups.map(g => ({
        label: g.label,
        items: g.options.map(o => {
          const isSelected = Boolean(selectedOptionId && o.id === selectedOptionId);
          let disabled = false;
          let assignedSlot = null;

          if (!isSelected) {
            const oId = String(o.id || '').toLowerCase();
            const oName = String(o.name || '').trim().toLowerCase();
            const inOther = otherAssigned.find(oa => oa.id === oId || oa.name === oName || oa.id === oName || oa.name === oId);
            if (inOther) {
              disabled = true;
              assignedSlot = inOther.slotNum;
            }
          }

          return {
            ...o,
            selected: isSelected,
            disabled,
            assignedSlot
          };
        })
      }));

      context.externalBuffSlots.push({
        index: i,
        key: slotKey,
        value: valStr,
        isEmpty: !valStr,
        name: displayName,
        badge,
        badgeClass: badge ? ('dcc-buff-badge-' + badge.toLowerCase().replace(/\s+/g, '-')) : '',
        detail,
        groups,
        isCustom: Boolean(valStr && !isKnownOption)
      });
    }

    // Mark slot assignment flags on each buff in context.buffs for Tab 4 slot buttons
    const slot1 = context.externalBuffSlots?.[0];
    const slot2 = context.externalBuffSlots?.[1];
    const slot3 = context.externalBuffSlots?.[2];

    const isMatch = (item, slot) => {
      if (!slot || slot.isEmpty) return false;
      const itemId = String(item.id || item._id || '').toLowerCase();
      const itemName = String(item.name || '').toLowerCase().trim();
      const valStr = String(slot.value || '').toLowerCase().trim();
      const slotName = String(slot.name || '').toLowerCase().trim();
      return (valStr && (valStr === itemId || valStr === itemName)) ||
             (slotName && slotName === itemName);
    };

    if (Array.isArray(context.buffs)) {
      for (const b of context.buffs) {
        b.isSlot1 = isMatch(b, slot1);
        b.isSlot2 = isMatch(b, slot2);
        b.isSlot3 = isMatch(b, slot3);
        b.isAssignedToAnySlot = b.isSlot1 || b.isSlot2 || b.isSlot3;
      }
    }

    return context;
  }

  /**
   * Compatibility method for FormApplication V1 callers
   * @override
   */
  async getData(options) {
    return this._prepareContext(options);
  }

  /**
   * Save focus state and cursor selection for inputs inside the sheet.
   */
  _saveFocusState(element = null) {
    try {
      const active = element || (typeof document !== 'undefined' ? document.activeElement : null);
      if (!active) return null;

      const root = this.element?.[0] || (this.element instanceof (globalThis.HTMLElement || Object) ? this.element : null);
      if (!element && root && typeof root.contains === 'function' && !root.contains(active)) {
        return null;
      }

      let selector = '';
      if (active.id) {
        selector = `#${active.id}`;
      } else if (typeof active.getAttribute === 'function' && active.getAttribute('name')) {
        selector = `[name="${active.getAttribute('name')}"]`;
      } else if (active.className && typeof active.className === 'string') {
        const classes = active.className.split(/\s+/).filter(c => c && !c.includes(':') && !c.startsWith('focus') && !c.startsWith('hover'));
        if (classes.length) {
          selector = `${(active.tagName || 'input').toLowerCase()}.${classes.join('.')}`;
        }
      }
      if (!selector && active.tagName) {
        selector = active.tagName.toLowerCase();
      }

      const hasSelection = typeof active.selectionStart === 'number';
      this._savedFocus = {
        selector,
        selectionStart: hasSelection ? active.selectionStart : null,
        selectionEnd: hasSelection ? active.selectionEnd : null,
        selectionDirection: hasSelection ? active.selectionDirection : 'none',
        value: active.value
      };
      return this._savedFocus;
    } catch (err) {
      return null;
    }
  }

  /**
   * Restore focus and cursor selection range to the saved element.
   */
  _restoreFocusState(html = null) {
    if (!this._savedFocus) return;
    const saved = this._savedFocus;

    const applyFocus = () => {
      try {
        const root = (html && html[0]) ? html[0] : (html instanceof (globalThis.HTMLElement || Object) ? html : (this.element?.[0] || this.element));
        if (!root) return;

        let target = null;
        if (saved.selector) {
          target = root.querySelector?.(saved.selector) || (typeof $ !== 'undefined' ? $(root).find(saved.selector)[0] : null);
        }
        if (!target && saved.value !== undefined) {
          target = root.querySelector?.('input[type="text"], input[type="search"], textarea');
        }

        if (target && typeof target.focus === 'function') {
          target.focus();
          if (typeof target.setSelectionRange === 'function' && typeof saved.selectionStart === 'number') {
            const valLen = target.value?.length ?? 0;
            const start = Math.min(saved.selectionStart, valLen);
            const end = Math.min(saved.selectionEnd ?? start, valLen);
            target.setSelectionRange(start, end, saved.selectionDirection || 'none');
          }
        }
      } catch (err) {
        // Silently ignore in mock or headless runs
      }
    };

    applyFocus();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        applyFocus();
        this._savedFocus = null;
      });
    } else if (typeof setTimeout === 'function') {
      setTimeout(() => {
        applyFocus();
        this._savedFocus = null;
      }, 0);
    } else {
      this._savedFocus = null;
    }
  }

  /**
   * Render hook supporting focus preservation and attack section navigation
   * @override
   */
  render(force, options = {}) {
    if (!this._savedFocus) {
      this._saveFocusState();
    }
    const res = super.render(force, options);
    this._restoreFocusState();
    if (this._scrollToAttacks) {
      this._scrollToAttacksSection();
    }
    return res;
  }

  /**
   * Application V2 render hook
   * @override
   */
  _onRender(context, options) {
    if (typeof super._onRender === 'function') {
      super._onRender(context, options);
    }
    if (this.element) {
      const $el = globalThis.$ ? globalThis.$(this.element) : this.element;
      this.activateListeners($el);
      this._restoreFocusState($el);
      if (this._scrollToAttacks) {
        this._scrollToAttacks = false;
        this._scrollToAttacksSection($el);
      }
    }
  }

  /**
   * Restore scroll positions hook (FormApplication V1)
   * Prevents stale scroll positions from overriding attack section navigation.
   * @override
   */
  _restoreScrollPositions(html) {
    if (this._scrollToAttacks) {
      this._scrollToAttacks = false;
      this._scrollToAttacksSection(html);
      return;
    }
    if (typeof super._restoreScrollPositions === 'function') {
      super._restoreScrollPositions(html);
    }
  }

  /**
   * Scrolls the sheet body to bring the attacks section into view.
   * @param {HTMLElement|JQuery} [html]
   */
  _scrollToAttacksSection(html = null) {
    this._scrollToAttacks = false;
    const isElement = (obj) => obj && (
      (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement) ||
      (typeof obj.querySelector === 'function' && typeof obj.querySelectorAll === 'function')
    );
    const root = (html && html[0]) || (isElement(html) ? html : null) || this.element?.[0] || (isElement(this.element) ? this.element : null);
    if (!root) return;

    const findEl = (sel) => {
      if (typeof root.querySelector === 'function') return root.querySelector(sel);
      if (globalThis.$ && typeof globalThis.$(root).find === 'function') return globalThis.$(root).find(sel)[0];
      return null;
    };

    const target = findEl('[data-section="attacks"]') ||
                   findEl('#attacks-section') ||
                   findEl('.dcc-attacks-section:not(.mob-spells-section)') ||
                   findEl('.dcc-attacks-section');
    if (!target) return;

    const container = findEl('.sheet-body') || (typeof target.closest === 'function' ? target.closest('.sheet-body') : null);

    const performScroll = () => {
      let scrolled = false;
      if (container && typeof container.scrollTo === 'function' && typeof container.getBoundingClientRect === 'function' && typeof target.getBoundingClientRect === 'function') {
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        if (cRect && tRect && (cRect.height > 0 || cRect.top !== 0 || tRect.top !== 0)) {
          const offset = (tRect.top - cRect.top) + (container.scrollTop || 0);
          container.scrollTo({ top: Math.max(0, offset - 6), behavior: 'smooth' });
          scrolled = true;
        }
      }
      if (!scrolled && container && typeof container.scrollTop === 'number' && typeof target.offsetTop === 'number') {
        container.scrollTop = target.offsetTop;
        scrolled = true;
      }
      if (typeof target.scrollIntoView === 'function') {
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_err) {
          target.scrollIntoView(true);
        }
      }
      if (container && this._scrollPositions) {
        this._scrollPositions['.sheet-body'] = container.scrollTop;
      }
    };

    performScroll();

    if (typeof setTimeout === 'function') {
      setTimeout(performScroll, 25);
    }
  }

  /** @override */
  activateListeners(html) {
    if (typeof super.activateListeners === 'function') {
      super.activateListeners(html);
    }
    this._restoreFocusState(html);

    if (this._scrollToAttacks) {
      this._scrollToAttacks = false;
      this._scrollToAttacksSection(html);
    }

    if (!this.isEditable) return;

    // Save to PDF Export button
    html.find('.dcc-btn-save-pdf, .export-pdf-btn').click(ev => {
      ev.preventDefault();
      this._onExportPdf();
    });

    // Roll Story Background Table (Past Trauma, Loose Ends, Regrets)
    html.find('.dcc-roll-story-table-btn').click(async ev => {
      ev.preventDefault();
      const tableKey = $(ev.currentTarget).data('table');
      if (!tableKey) return;
      try {
        const res = await rollBackgroundTable(tableKey);
        // Post chat card with the roll and story result
        if (typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
          const content = `
            <div class="dcc-chat-card dcc-story-roll-card">
              <header class="dcc-card-header flexrow">
                <span class="dcc-card-title"><strong>${res.tableName}</strong></span>
                <span class="dcc-badge roll-badge">Roll: ${res.roll}</span>
              </header>
              <div class="dcc-card-body">
                <p class="dcc-story-result-text"><em>"${res.text}"</em></p>
              </div>
            </div>
          `;
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content
          });
        }
        // Update actor field (if actor has existing text, append, else set)
        const currentText = this.actor.system?.details?.[tableKey] || '';
        const newText = currentText ? `${currentText}\n${res.text}` : res.text;
        await this.actor.update({ [`system.details.${tableKey}`]: newText });
        ui.notifications?.info(`Rolled [${res.roll}] on ${res.tableName}: "${res.text}"`);
      } catch (err) {
        console.error('DCC RPG | Error rolling story table:', err);
      }
    });

    // Open Skill Library Picker
    html.find('.open-skill-picker').click(ev => {
      ev.preventDefault();
      this._openSkillPicker();
    });

    // Open Spells Compendium / Manager
    html.find('.open-spell-picker').click(ev => {
      ev.preventDefault();
      this._openSpellPicker();
    });

    // Open Buffs Compendium / Manager
    html.find('.open-buff-picker').click(ev => {
      ev.preventDefault();
      const targetSlot = $(ev.currentTarget).data('slot') || null;
      this._openBuffPicker(targetSlot, 'buffs');
    });

    // Open Debuffs Compendium / Manager
    html.find('.open-debuff-picker').click(ev => {
      ev.preventDefault();
      this._openBuffPicker(null, 'debuffs');
    });

    // Open Achievement Manager / Library
    html.find('.open-achievement-picker').click(ev => {
      ev.preventDefault();
      this._openAchievementPicker();
    });

    // Announce Achievement to Chat
    html.find('.announce-achievement').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      if (itemId && typeof this.actor.announceAchievement === 'function') {
        await this.actor.announceAchievement(itemId);
      }
    });

    // Filter Achievements by Tier or Search
    const filterAchievements = () => {
      const selectedTier = html.find('.dcc-achievement-filter-tier').val() || 'all';
      const query = (html.find('.dcc-achievement-search').val() || '').toLowerCase().trim();

      html.find('.dcc-achievement-card-entry').each((i, el) => {
        const itemTier = ($(el).data('tier') || '').toLowerCase();
        const text = $(el).text().toLowerCase();

        const matchTier = selectedTier === 'all' || itemTier === selectedTier;
        const matchQuery = !query || text.includes(query);

        if (matchTier && matchQuery) {
          $(el).show();
        } else {
          $(el).hide();
        }
      });
    };

    html.find('.dcc-achievement-filter-tier').change(filterAchievements);
    html.find('.dcc-achievement-search').on('input', filterAchievements);

    // Adjust Trophy Counts (+ / - buttons)
    html.find('.dcc-trophy-tier-adjust').click(async ev => {
      ev.preventDefault();
      const tier = $(ev.currentTarget).data('tier');
      const delta = Number($(ev.currentTarget).data('delta')) || 0;
      if (!tier || !delta) return;

      const trophies = structuredClone(this.actor.system?.trophies || {
        bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
        bossLog: [],
        crawlers: { count: 0 },
        crawlerLog: []
      });

      if (tier === 'crawlers') {
        if (!trophies.crawlers) trophies.crawlers = { count: 0 };
        trophies.crawlers.count = Math.max(0, (Number(trophies.crawlers.count) || 0) + delta);
      } else {
        if (!trophies.bosses) trophies.bosses = { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 };
        trophies.bosses[tier] = Math.max(0, (Number(trophies.bosses[tier]) || 0) + delta);
      }
      await this.actor.update({ 'system.trophies': trophies });
    });

    // Delete Logged Boss Kill
    html.find('.dcc-delete-boss-kill').click(async ev => {
      ev.preventDefault();
      const killId = $(ev.currentTarget).data('killId');
      if (killId && typeof this.actor.removeBossKill === 'function') {
        await this.actor.removeBossKill(killId);
      }
    });

    // Delete Logged Crawler Kill
    html.find('.dcc-delete-crawler-kill').click(async ev => {
      ev.preventDefault();
      const killId = $(ev.currentTarget).data('killId');
      if (killId && typeof this.actor.removeCrawlerKill === 'function') {
        await this.actor.removeCrawlerKill(killId);
      }
    });

    // Record Boss Kill Dialog
    html.find('.dcc-record-boss-kill-btn').click(async ev => {
      ev.preventDefault();
      const DialogClass = globalThis.Dialog || (typeof foundry !== 'undefined' ? foundry.applications?.api?.DialogV2 : null);
      if (DialogClass) {
        new DialogClass({
          title: 'Record Boss Kill',
          content: `
            <div style="font-family: 'Oswald', sans-serif; display: flex; flex-direction: column; gap: 8px; padding: 6px;">
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Boss Name:</label>
                <input type="text" id="boss-kill-name" placeholder="e.g. Goblin King, Juicer" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;" />
              </div>
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Boss Level / Star Tier:</label>
                <select id="boss-kill-tier" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;">
                  <option value="bronze">Bronze Star - Neighborhood Boss</option>
                  <option value="silver">Silver Star - Borough Boss</option>
                  <option value="gold" selected>Gold Star - City Boss</option>
                  <option value="platinum">Platinum Star - Country Boss</option>
                  <option value="legendary">Legendary Star - Floor Boss</option>
                  <option value="celestial">Celestial Star - Dungeon Boss</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Floor:</label>
                <input type="text" id="boss-kill-floor" value="${this.actor.system?.details?.floor || '1st Floor'}" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;" />
              </div>
            </div>
          `,
          buttons: {
            confirm: {
              icon: '<i class="fa-solid fa-star" style="color: #f1c40f;"></i>',
              label: 'Record Kill & Award Star',
              callback: async (dlgHtml) => {
                const $h = typeof dlgHtml.find === 'function' ? dlgHtml : $(dlgHtml);
                const name = $h.find('#boss-kill-name').val()?.trim() || 'Unnamed Boss';
                const tier = $h.find('#boss-kill-tier').val() || 'bronze';
                const floor = $h.find('#boss-kill-floor').val()?.trim() || '1st Floor';
                if (typeof this.actor.recordBossKill === 'function') {
                  await this.actor.recordBossKill({ name, tier, floor });
                }
              }
            },
            cancel: {
              icon: '<i class="fa-solid fa-xmark"></i>',
              label: 'Cancel'
            }
          },
          default: 'confirm'
        }).render(true);
      }
    });

    // Record Crawler Kill Dialog
    html.find('.dcc-record-crawler-kill-btn').click(async ev => {
      ev.preventDefault();
      const DialogClass = globalThis.Dialog || (typeof foundry !== 'undefined' ? foundry.applications?.api?.DialogV2 : null);
      if (DialogClass) {
        new DialogClass({
          title: 'Record Crawler Kill (PvP)',
          content: `
            <div style="font-family: 'Oswald', sans-serif; display: flex; flex-direction: column; gap: 8px; padding: 6px;">
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Slain Crawler Name:</label>
                <input type="text" id="crawler-kill-name" placeholder="e.g. Frank, Meatball" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;" />
              </div>
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Crawler Number (Optional):</label>
                <input type="text" id="crawler-kill-number" placeholder="e.g. #4091" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;" />
              </div>
              <div>
                <label style="display: block; font-size: 11px; text-transform: uppercase; color: #888;">Floor:</label>
                <input type="text" id="crawler-kill-floor" value="${this.actor.system?.details?.floor || '1st Floor'}" style="width: 100%; background: #111; color: #fff; border: 1px solid #444;" />
              </div>
            </div>
          `,
          buttons: {
            confirm: {
              icon: '<i class="fa-solid fa-skull" style="color: #e74c3c;"></i>',
              label: 'Record Kill & Claim Skull',
              callback: async (dlgHtml) => {
                const $h = typeof dlgHtml.find === 'function' ? dlgHtml : $(dlgHtml);
                const name = $h.find('#crawler-kill-name').val()?.trim() || 'Rival Crawler';
                const crawlerNumber = $h.find('#crawler-kill-number').val()?.trim() || '';
                const floor = $h.find('#crawler-kill-floor').val()?.trim() || '1st Floor';
                if (typeof this.actor.recordCrawlerKill === 'function') {
                  await this.actor.recordCrawlerKill({ name, crawlerNumber, floor });
                }
              }
            },
            cancel: {
              icon: '<i class="fa-solid fa-xmark"></i>',
              label: 'Cancel'
            }
          },
          default: 'confirm'
        }).render(true);
      }
    });

    // Roll Stat Check
    html.find('.roll-stat').click(ev => {
      const stat = $(ev.currentTarget).data('stat');
      this.actor.rollStat(stat);
    });

    // Roll Evade
    html.find('.roll-evade').click(() => {
      this.actor.rollEvade();
    });

    // Roll Attack: Hit or Damage
    html.find('.roll-attack-hit').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollAttack(item, 'hit', { showDialog: !ev.shiftKey });
    });

    html.find('.roll-attack-dmg').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollAttack(item, 'damage', { showDialog: !ev.shiftKey });
    });

    // Roll Skill (owned or gear-granted)
    html.find('.roll-skill').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId) || this._grantedSkills?.get(itemId);
      if (!item) return;

      const checkType = (item.system?.checkType || '').toLowerCase();
      const skillType = item.system?.skillType || item.system?.type || '';
      const dmgData = typeof this.actor.getSkillDamageData === 'function' ? this.actor.getSkillDamageData(item) : { hasDamage: false };
      const isAttack = item.isAttack ?? (
        dmgData.hasDamage ||
        checkType.includes('attack') ||
        ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
        (item.system?.category || '').toLowerCase() === 'combat'
      );

      if (isAttack) {
        this.actor.rollAttack(item, 'hit', { showDialog: !ev.shiftKey });
      } else {
        this.actor.rollSkill(item);
      }
    });

    // Roll Skill Damage (owned or gear-granted)
    html.find('.roll-skill-dmg, .roll-skill-damage').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId) || this._grantedSkills?.get(itemId);
      if (item) this.actor.rollSkillDamage(item, { showDialog: !ev.shiftKey });
    });

    // Change selected optional damage effect on sheet
    html.find('.attack-damage-effect-select').change(async ev => {
      ev.preventDefault();
      const select = ev.currentTarget;
      const itemId = $(select).data('itemId') || $(select).closest('[data-item-id]').data('itemId');
      const val = $(select).val();
      const item = this.actor.items.get(itemId);
      if (item) {
        await item.update({ 'system.selectedEffect': val });
      }
    });

    // Roll / Cast Spell
    html.find('.roll-spell').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpell(item);
    });

    // Roll Spell Damage
    html.find('.roll-spell-dmg, .roll-spell-damage').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpellDamage(item);
    });

    // Roll Spell Attack / To Hit
    html.find('.roll-spell-hit').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpellAttack(item);
    });

    // Toggle Attack / Weapon Equipped State
    html.find('.attack-toggle-equipped').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items?.get ? this.actor.items.get(itemId) : (this.actor.items || []).find(i => i.id === itemId);
      if (item) {
        const isCurrentlyEquipped = item.system?.equipped !== false;
        await item.update({ 'system.equipped': !isCurrentlyEquipped });
      }
    });

    // Toggle Stowed Attacks View
    html.find('.toggle-stowed-attacks-view').click(ev => {
      ev.preventDefault();
      this._showStowedAttacks = !this._showStowedAttacks;
      this._scrollToAttacks = true;
      if (this._scrollPositions) {
        delete this._scrollPositions['.sheet-body'];
      }
      this.render(false);
    });

    // Toggle Gear Equipped
    html.find('.gear-toggle-equipped').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) {
        const newEquipped = !item.system.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Immediate form submission on input blur (excluding auxiliary hotlist and buff dropdowns)
    html.find('input, select:not(.hotlist-select):not(.external-buff-select), textarea').on('blur', () => {
      if (this.isEditable) this.submit();
    });

    // Item Create
    html.find('.item-create').click(async ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type') || 'skill';
      const name = `New ${type.capitalize()}`;
      const created = await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
      if (created && created[0]) {
        created[0].sheet?.render(true);
      }
    });

    // Item Edit
    html.find('.item-edit').click(ev => {
      ev.preventDefault();
      const el = $(ev.currentTarget);
      const itemId = el.data('itemId') ||
        el.attr('data-item-id') ||
        el.closest('[data-item-id]').data('itemId') ||
        el.closest('[data-item-id]').attr('data-item-id') ||
        ev.currentTarget.dataset?.itemId ||
        ev.currentTarget.closest?.('[data-item-id]')?.dataset?.itemId;
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(i => i.id === itemId || i._id === itemId) : this.actor.items.find?.(i => i.id === itemId || i._id === itemId));
      item?.sheet?.render(true);
    });

    // Item Delete
    html.find('.item-delete').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const el = $(ev.currentTarget);
      const itemId = el.data('itemId') ||
        el.attr('data-item-id') ||
        el.closest('[data-item-id]').data('itemId') ||
        el.closest('[data-item-id]').attr('data-item-id') ||
        ev.currentTarget.dataset?.itemId ||
        ev.currentTarget.closest?.('[data-item-id]')?.dataset?.itemId;
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(i => i.id === itemId || i._id === itemId) : this.actor.items.find?.(i => i.id === itemId || i._id === itemId));
      if (item) {
        // Clean up any references in hotlist or external buffs if this item was assigned
        const updates = {};
        const hotlist = this.actor.system?.hotlist || {};
        for (const [slot, val] of Object.entries(hotlist)) {
          if (val === itemId || (val && typeof val === 'string' && val.toLowerCase() === item.name?.toLowerCase())) {
            updates[`system.hotlist.${slot}`] = '';
          }
        }
        const buffs = this.actor.system?.attributes?.externalBuffs || {};
        for (const [slot, val] of Object.entries(buffs)) {
          if (val === itemId || (val && typeof val === 'string' && val.toLowerCase() === item.name?.toLowerCase())) {
            updates[`system.attributes.externalBuffs.${slot}`] = '';
          }
        }
        if (Object.keys(updates).length > 0) {
          await this.actor.update(updates);
        }
        await item.delete();
        this.render(false);
      }
    });

    // Inline Item Edit on Actor Sheet (Skills, Gear, Loot)
    html.find('.item-inline-edit').change(async ev => {
      ev.preventDefault();
      const input = $(ev.currentTarget);
      const itemId = input.closest('[data-item-id]').data('itemId');
      const field = input.data('field');
      const item = this.actor.items.get(itemId);
      if (item && field) {
        const val = input.attr('type') === 'number' ? Number(input.val()) : input.val();
        await item.update({ [field]: val });
      }
    });

    // Hotlist Slot Selection
    html.find('.hotlist-select').change(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const select = $(ev.currentTarget);
      const slot = select.data('slot') || ev.currentTarget.dataset?.slot;
      const val = select.val();
      if (slot) {
        await this.actor.update({ [`system.hotlist.${slot}`]: val });
      }
    });

    // External Buff Slot Selection
    html.find('.external-buff-select').change(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const select = $(ev.currentTarget);
      const slot = select.data('slot') || ev.currentTarget.dataset?.slot;
      const val = select.val();
      if (slot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: val });
      }
    });

    // External Buff Slot Clear
    html.find('.external-buff-clear').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = $(ev.currentTarget).data('slot');
      if (slot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: '' });
      }
    });

    // Assign or Toggle Buff to External Buff Slot (from Conditions tab)
    html.find('.buff-assign-slot-btn').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const itemId = $(ev.currentTarget).data('itemId');
      const slot = $(ev.currentTarget).data('slot');
      if (itemId && slot) {
        const currentVal = this.actor.system?.attributes?.externalBuffs?.[slot] || '';
        const item = this.actor.items.get?.(itemId) ||
          (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
        const slotNum = slot.replace('buff', '');

        const isCurrentlyAssigned = currentVal === itemId ||
          (item?.name && String(currentVal).toLowerCase().trim() === item.name.toLowerCase().trim());

        if (isCurrentlyAssigned) {
          await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: '' });
          ui.notifications?.info?.(`Removed ${item?.name || 'Buff'} from External Buff Slot ${slotNum}`);
        } else {
          await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: itemId });
          ui.notifications?.info?.(`Assigned ${item?.name || 'Buff'} to External Buff Slot ${slotNum}`);
        }
      }
    });

    // Hotlist Slot Clear
    html.find('.hotlist-clear').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = $(ev.currentTarget).data('slot');
      if (slot) {
        await this.actor.update({ [`system.hotlist.${slot}`]: '' });
      }
    });

    // Hotlist Action: Roll Attack
    html.find('.roll-hotlist-attack').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'hit');
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Hotlist Action: Roll Attack Damage
    html.find('.roll-hotlist-attack-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'damage');
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Hotlist Action: Cast Spell
    html.find('.roll-hotlist-spell').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));

      // Fallback: check if it matches a compendium spell
      if (!item && CONFIG.DCC?.spells) {
        const compSpell = CONFIG.DCC.spells.find(s => s._id === itemId || s.name === itemId);
        if (compSpell) {
          const owned = this.actor.items.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
          item = owned;
        }
      }

      if (item && typeof this.actor.rollSpell === 'function') {
        await this.actor.rollSpell(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Hotlist Action: Roll Spell Damage
    html.find('.roll-hotlist-spell-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));

      if (!item && CONFIG.DCC?.spells) {
        const compSpell = CONFIG.DCC.spells.find(s => s._id === itemId || s.name === itemId);
        if (compSpell) {
          const owned = this.actor.items.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
          item = owned;
        }
      }

      if (item && typeof this.actor.rollSpellDamage === 'function') {
        await this.actor.rollSpellDamage(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Hotlist Action: Toggle Gear Equip
    html.find('.toggle-hotlist-equip').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item) {
        const newEquipped = !item.system?.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Hotlist Action: Use Item (Loot / Consumables / Skills)
    html.find('.roll-hotlist-use').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
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
      } else {
        const sys = item.system || {};
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <div class="dcc-chat-card" style="font-family: var(--font-primary, sans-serif);">
              <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
                <img src="${item.img || 'icons/svg/item-bag.svg'}" style="width: 32px; height: 32px; border: 1px solid #000; border-radius: 4px;" />
                <div>
                  <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${item.name}</h3>
                  <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">Used Item</span>
                </div>
              </div>
              ${sys.quantity !== undefined ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Quantity:</strong> ${sys.quantity}</p>` : ''}
              ${sys.notes ? `<p style="margin: 4px 0; font-size: 12px;">${sys.notes}</p>` : ''}
              ${sys.description ? `<div style="font-size: 12px; margin-top: 4px;">${sys.description}</div>` : ''}
            </div>
          `
        });
      }
    });

    // Inventory Table Action: Use Consumable Item
    html.find('.item-use').click(async ev => {
      ev.preventDefault();
      const tr = $(ev.currentTarget).closest('[data-item-id]');
      const itemId = tr.data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (!item) return;

      if (typeof item.useLoot === 'function') {
        await item.useLoot();
      } else if (typeof item.roll === 'function') {
        await item.roll();
      }
    });
  }

  /**
   * Open interactive modal to choose skills from the DCC Skill Library & Manager
   */
  _openSkillPicker() {
    new DCCSkillManager({ actor: this.actor }).render(true);
  }

  /**
   * Open interactive modal to choose spells from the DCC Spell Library & Manager
   */
  _openSpellPicker() {
    new DCCSpellManager({ actor: this.actor }).render(true);
  }

  /**
   * Open interactive modal to choose buffs or debuffs from the Condition Library
   * @param {string|null} targetSlot
   * @param {string} initialTab
   */
  _openBuffPicker(targetSlot = null, initialTab = 'all') {
    new DCCBuffDebuffManager({ actor: this.actor, targetSlot, activeTab: initialTab }).render(true);
  }

  /**
   * Open interactive modal to browse and award achievements
   */
  _openAchievementPicker() {
    new DCCAchievementManagerApp({ actor: this.actor }).render(true);
  }

  /** @override */
  async _onDropItem(event, data) {
    if (this.actor.isOwner === false) return false;
    const item = await Item.fromDropData(data);
    if (!item) return false;

    // If dropping a Race, Class, or Deity, automatically update actor detail string too
    if (item.type === 'race') {
      await this.actor.update({ 'system.details.race': item.name });
    } else if (item.type === 'class') {
      await this.actor.update({ 'system.details.class': item.name });
    } else if (item.type === 'deity') {
      await this.actor.update({ 'system.details.deity': item.name });
    }

    // Check if dropped directly onto an External Buff slot
    const buffSlotBox = event.target?.closest?.('.dcc-buff-slot-entry, .dcc-buff-slot');
    const buffSlotKey = buffSlotBox?.dataset?.slot;

    if (buffSlotKey && item.type === 'buff') {
      const isDirectlyOwned = item.actor?.id === this.actor.id ||
        (this.actor.items.get ? this.actor.items.get(item.id) : (Array.isArray(this.actor.items) && this.actor.items.some(i => i.id === item.id)));

      if (isDirectlyOwned) {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: item.id });
        return item;
      }

      const existingOwned = Array.isArray(this.actor.items)
        ? this.actor.items.find(i => i.id === item.id || (i.name.toLowerCase().trim() === item.name?.toLowerCase().trim() && i.type === 'buff'))
        : this.actor.items.find?.(i => i.id === item.id || (i.name.toLowerCase().trim() === item.name?.toLowerCase().trim() && i.type === 'buff'));

      if (existingOwned) {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: existingOwned.id });
        return existingOwned;
      }

      const createdItems = await super._onDropItem(event, data);
      const createdItem = Array.isArray(createdItems) ? createdItems[0] : createdItems;
      if (createdItem?.id) {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: createdItem.id });
      } else {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: item.id || item.name });
      }
      return createdItems;
    }

    // Check if dropped directly onto a Hotlist box
    const hotlistBox = event.target?.closest?.('.dcc-hotlist-box');
    const hotlistSlot = hotlistBox?.dataset?.slot;

    if (hotlistSlot) {
      // If item is already on this actor (by reference or ID), assign directly without creating duplicate
      const isDirectlyOwned = item.actor?.id === this.actor.id ||
        (this.actor.items.get ? this.actor.items.get(item.id) : (Array.isArray(this.actor.items) && this.actor.items.some(i => i.id === item.id)));

      if (isDirectlyOwned) {
        await this.actor.update({ [`system.hotlist.${hotlistSlot}`]: item.id });
        return item;
      }

      // Check if actor already has an item with matching name and type (e.g. from compendium or spell library)
      const existingOwned = Array.isArray(this.actor.items)
        ? this.actor.items.find(i => i.id === item.id || (i.name.toLowerCase().trim() === item.name?.toLowerCase().trim() && i.type === item.type))
        : this.actor.items.find?.(i => i.id === item.id || (i.name.toLowerCase().trim() === item.name?.toLowerCase().trim() && i.type === item.type));

      if (existingOwned) {
        await this.actor.update({ [`system.hotlist.${hotlistSlot}`]: existingOwned.id });
        return existingOwned;
      }

      // If from compendium or world and not yet on actor, create item on actor first and assign to slot
      const createdItems = await super._onDropItem(event, data);
      const createdItem = Array.isArray(createdItems) ? createdItems[0] : createdItems;
      if (createdItem?.id) {
        await this.actor.update({ [`system.hotlist.${hotlistSlot}`]: createdItem.id });
      }
      return createdItems;
    }

    // Handle item reordering/sorting within the sheet if dropped on another item row
    const isDirectlyOwned = item.actor?.id === this.actor.id ||
      item.parent?.id === this.actor.id ||
      (this.actor.items.get ? this.actor.items.get(item.id) : (Array.isArray(this.actor.items) && this.actor.items.some(i => i.id === item.id)));

    const dropTarget = event.target?.closest?.('[data-item-id]');
    if (isDirectlyOwned && dropTarget && dropTarget.dataset?.itemId && dropTarget.dataset.itemId !== item.id) {
      return this._onSortItem(event, item.toObject ? item.toObject() : item);
    }

    return super._onDropItem ? super._onDropItem(event, data) : this._onDropItemCreate(item.toObject ? item.toObject() : item);
  }

  /**
   * Handle reordering/sorting an item within the sheet.
   * @param {DragEvent} event
   * @param {object} itemData
   */
  async _onSortItem(event, itemData) {
    const sourceId = itemData._id || itemData.id;
    const dropTarget = event.target?.closest?.('[data-item-id]');
    const targetId = dropTarget?.dataset?.itemId;
    if (!dropTarget || !targetId || targetId === sourceId) return;

    const source = this.actor.items.get?.(sourceId) ||
      (Array.isArray(this.actor.items) ? this.actor.items.find(i => i.id === sourceId) : this.actor.items.find?.(i => i.id === sourceId));
    const target = this.actor.items.get?.(targetId) ||
      (Array.isArray(this.actor.items) ? this.actor.items.find(i => i.id === targetId) : this.actor.items.find?.(i => i.id === targetId));
    if (!source || !target) return;

    // Sibling items in the same collection/category
    const allItems = Array.from(this.actor.items.values ? this.actor.items.values() : this.actor.items);
    const siblings = allItems.filter(i => {
      if (i.id === source.id) return false;
      if (['gear', 'loot'].includes(source.type)) {
        return ['gear', 'loot'].includes(i.type);
      }
      return i.type === source.type;
    });

    // Determine drop position (sortBefore: dropped in upper half vs lower half)
    let sortBefore = true;
    if (typeof dropTarget.getBoundingClientRect === 'function' && event.clientY) {
      const rect = dropTarget.getBoundingClientRect();
      sortBefore = (event.clientY - rect.top) < (rect.height / 2);
    }

    // Sort siblings by existing sort key
    siblings.sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.name.localeCompare(b.name));

    // Try Foundry SortingHelpers first
    const SortingHelpers = globalThis.foundry?.utils?.SortingHelpers || globalThis.SortingHelpers;
    if (typeof SortingHelpers?.performIntegerSort === 'function') {
      try {
        const sortUpdates = SortingHelpers.performIntegerSort(source, {
          target,
          siblings,
          sortBefore
        });
        if (Array.isArray(sortUpdates) && sortUpdates.length > 0) {
          if (typeof this.actor.updateEmbeddedDocuments === 'function') {
            const updateData = sortUpdates.map(u => ({ _id: u.target.id, sort: u.update.sort }));
            return await this.actor.updateEmbeddedDocuments('Item', updateData);
          } else {
            for (const u of sortUpdates) {
              await u.target.update?.({ sort: u.update.sort });
            }
            return sortUpdates;
          }
        }
      } catch (err) {
        // Fall back to manual sort below
      }
    }

    // Fallback: manual sort calculation
    const DENSITY = (typeof CONST !== 'undefined' && CONST.SORT_INTEGER_DENSITY) ? CONST.SORT_INTEGER_DENSITY : 100000;
    const targetIdx = siblings.findIndex(s => s.id === target.id);
    let newSort;
    if (targetIdx === -1) {
      newSort = (target.sort || DENSITY) + (sortBefore ? -DENSITY : DENSITY);
    } else if (sortBefore) {
      const prev = siblings[targetIdx - 1];
      const next = siblings[targetIdx];
      const prevSort = prev ? (prev.sort || 0) : ((next.sort || 0) - DENSITY);
      const nextSort = next.sort || 0;
      newSort = Math.round((prevSort + nextSort) / 2);
      if (newSort === prevSort || newSort === nextSort) {
        newSort = prevSort - DENSITY;
      }
    } else {
      const prev = siblings[targetIdx];
      const next = siblings[targetIdx + 1];
      const prevSort = prev.sort || 0;
      const nextSort = next ? (next.sort || 0) : (prevSort + DENSITY);
      newSort = Math.round((prevSort + nextSort) / 2);
      if (newSort === prevSort || newSort === nextSort) {
        newSort = prevSort + DENSITY;
      }
    }

    if (typeof this.actor.updateEmbeddedDocuments === 'function') {
      return await this.actor.updateEmbeddedDocuments('Item', [{ _id: source.id, sort: newSort }]);
    }
    return await source.update({ sort: newSort });
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure actor name is strictly a single string and never an array
    if (Array.isArray(formData.name)) {
      formData.name = formData.name[0];
    }
    // Sanitize any hotlist slot entries in form data
    for (let i = 1; i <= 10; i++) {
      const k = `system.hotlist.slot${i}`;
      if (Array.isArray(formData[k])) {
        formData[k] = formData[k][0] || '';
      }
    }
    if (typeof super._updateObject === 'function') {
      return super._updateObject(event, formData);
    }
    return this.actor.update(formData);
  }

  /**
   * Export character sheet to official fillable PDF
   */
  async _onExportPdf() {
    try {
      if (globalThis.ui?.notifications) {
        ui.notifications.info(`Exporting ${this.actor.name || 'crawler'} to fillable PDF...`);
      }
      const { saveCrawlerPdf } = await import('../apps/pdf-exporter.mjs');
      await saveCrawlerPdf(this.actor);
      if (globalThis.ui?.notifications) {
        ui.notifications.info(`Successfully exported ${this.actor.name || 'crawler'} to character sheet PDF.`);
      }
    } catch (err) {
      console.error('Failed to export crawler sheet to PDF:', err);
      if (globalThis.ui?.notifications) {
        ui.notifications.error(`Failed to export PDF: ${err.message}`);
      }
    }
  }
}
