import { DCCCombatMetrics, getHpPerBar } from '../apps/combat-metrics.mjs';
import { DCCSessionEngine } from '../apps/session-manager.mjs';
import { getSizeInfo } from '../data/sizes.mjs';
import { getRankDamageDie, parseUpgrades, getEvadeTargetDifficulty } from '../data/rank-dice.mjs';
import {
  DCC_GRINDING_COMPLICATIONS,
  getGrindingComplication,
  getRequiredGrindingHours,
  getAdvancementTarget,
  getEnduranceDC,
  getSafeGrindingThreshold
} from '../data/grinding.mjs';
import { DCCRaceClassApplier } from '../data/race-class-applier.mjs';
import { CANONICAL_CONDITION_ROLL_MODIFIERS } from '../data/buffs.mjs';
import { CANONICAL_WEAPON_TECHNIQUE_MAP, getRecommendedAssociatedSkills } from '../data/weapon-associations.mjs';
import { ARCHETYPE_TO_TAG, getItemAllTags, getTagDefinition, damageTypeToElement, elementToDamageType } from '../data/tags.mjs';
import { matchesTagQuery, expandTagReferences } from '../utils/tag-query.mjs';

/**
 * Calculate DCC RPG stat modifier based on enhanced stat value:
 * 1–2: +1
 * 3–5: +2
 * 6–9: +3
 * 10–19: +4
 * 20–49: +5
 * 50–99: +6
 * 100–149: +7
 * 150–199: +8
 * 200–299: +9
 * 300+: +10
 * @param {number|string} statValue - The enhanced stat score
 * @returns {number} The calculated modifier
 */
export function getDCCStatModifier(statValue) {
  const val = Number(statValue) || 0;
  if (val >= 300) return 10;
  if (val >= 200) return 9;
  if (val >= 150) return 8;
  if (val >= 100) return 7;
  if (val >= 50) return 6;
  if (val >= 20) return 5;
  if (val >= 10) return 4;
  if (val >= 6) return 3;
  if (val >= 3) return 2;
  if (val >= 1) return 1;
  return 0;
}

/**
 * Mapping of generic weapon group skill names (lowercase) to the skill type they buff.
 */
export const DCC_WEAPON_GROUP_MAP = {
  'edge': 'Edge',
  'edged': 'Edge',
  'edged weapons': 'Edge',
  'edge weapons': 'Edge',
  'bashing': 'Bashing',
  'blunt': 'Bashing',
  'blunt weapons': 'Bashing',
  'bashing weapons': 'Bashing',
  'reach': 'Reach',
  'reach weapons': 'Reach',
  'ranged': 'Ranged',
  'ranged weapons': 'Ranged',
  'strike': 'Strike',
  'strike weapons': 'Strike',
  'hand to hand': 'Hand to Hand',
  'hand-to-hand': 'Hand to Hand',
  'hand to hand combat': 'Hand to Hand',
  'hand-to-hand combat': 'Hand to Hand'
};

/**
 * Canonical optional damage effects for official DCC hand-to-hand combat skills.
 */
export const CANONICAL_DAMAGE_EFFECTS = {
  'pugilism': ['Dirty Fighting', 'Iron Punch', 'Powerful Strike'],
  'noggin knocker': ['Skullcracker', 'Powerful Strike'],
  'noggin nocker': ['Skullcracker', 'Powerful Strike'],
  'wrasslin': ['Choke Out', 'Dirty Fighting', 'Toss'],
  'wrasslin\'': ['Choke Out', 'Dirty Fighting', 'Toss'],
  'foot soldier': ['Powerful Strike', 'Smush']
};

/**
 * AI Favor awarded when performing an attack without using any Damage Effect.
 */
export const DAMAGE_EFFECT_AI_FAVOR = {
  'pugilism': 2,
  'noggin knocker': 1,
  'noggin nocker': 1,
  'wrasslin': 1,
  'wrasslin\'': 1,
  'foot soldier': 1
};

/**
 * Structured configurations for canonical DCC RPG combat techniques and damage effects.
 * Used for dynamic damage resolution and fallback defaults.
 */
export const DEFAULT_TECHNIQUE_CONFIGS = {
  'iron punch': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.pugilism', 'technique.pugilism'] },
    appliesToTags: ['pugilism', 'id.skill.pugilism', 'technique.pugilism'],
    baseDiceCountMod: '+1',
    damageBonus: '1d2',
    damageType: 'Physical',
    rankBreaks: {
      rank5: { baseDiceCountMod: '+1', rankDamageDice: 1, notes: 'Add 1 Rank damage die' },
      rank10: { baseDiceCountMod: '+1', rankDamageDice: 0, debuff: 'Stunned', notes: 'Target gains Stunned Debuff' },
      rank15: { baseDiceCountMod: '+1', rankDamageDice: 1, debuff: 'Stunned', notes: 'Add 1 Rank damage die and target gains Stunned Debuff' }
    }
  },
  'powerful strike': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.foot-soldier', 'id.skill.noggin-nocker', 'id.skill.pugilism', 'technique.foot_soldier', 'technique.noggin_nocker', 'technique.pugilism'] },
    appliesToTags: ['foot soldier', 'noggin knocker', 'noggin nocker', 'pugilism', 'id.skill.foot-soldier', 'id.skill.noggin-nocker', 'id.skill.pugilism'],
    baseDiceCountMod: '* @rank',
    damageBonus: '1d6',
    damageType: '',
    cooldown: '30 hours',
    rankBreaks: {
      rank5: { notes: 'Cooldown: 10 hours' },
      rank10: { notes: 'Cooldown: 5 hours' },
      rank15: { notes: 'Cooldown: 2 hours' }
    }
  },
  'skullcracker': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.noggin-nocker', 'technique.noggin_nocker'] },
    appliesToTags: ['noggin knocker', 'noggin nocker', 'id.skill.noggin-nocker', 'technique.noggin_nocker'],
    baseDiceCountMod: '+1',
    damageBonus: '1d4',
    damageType: 'Physical',
    rankBreaks: {
      rank5: { baseDiceCountMod: '+1', notes: '+1d4 base damage' },
      rank10: { rankDamageDice: 1, debuff: 'Stunned', notes: 'Add 1 Rank damage die and Stunned Debuff' },
      rank15: { rankDamageDice: 1, debuff: 'Blood Trail', notes: 'Add 1 Rank damage die and Blood Trail Debuff' }
    }
  },
  'toss': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.wrasslin', 'technique.wrasslin'] },
    appliesToTags: ['wrasslin', "wrasslin'", 'id.skill.wrasslin', 'technique.wrasslin'],
    damageBonus: '1d8',
    damageType: 'Bludgeoning',
    stat: 'str',
    notes: 'Deal +1d8 base damage + Str Bludgeoning, end Held Debuff, and throw target'
  },
  'dirty fighting': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.pugilism', 'id.skill.wrasslin', 'technique.pugilism', 'technique.wrasslin'] },
    appliesToTags: ['pugilism', 'wrasslin', "wrasslin'", 'id.skill.pugilism', 'id.skill.wrasslin'],
    debuffName: 'Woozy',
    rankBreaks: {
      rank5: { debuff: 'The Taint' },
      rank10: { debuff: 'Blinded' }
    }
  },
  'smush': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.foot-soldier', 'technique.foot_soldier'] },
    appliesToTags: ['foot soldier', 'id.skill.foot-soldier', 'technique.foot_soldier'],
    cooldown: '1/round',
    notes: 'Deal ×2 total damage if target has 20% Health Bar or less'
  },
  'choke out': {
    isDamageEffect: true,
    appliesTo: { any: ['id.skill.wrasslin', 'technique.wrasslin'] },
    appliesToTags: ['wrasslin', "wrasslin'", 'id.skill.wrasslin', 'technique.wrasslin'],
    notes: 'Deal ×2 total damage if target is at 10% Health Bar or less'
  }
};

/**
 * Safely evaluates a numeric modifier string or formula against a base numeric value and rank.
 * Supports:
 * - "+1", "-2", "3" (addition/subtraction)
 * - "* @rank", "* 2" (multiplication)
 * - "/ 2" (division)
 *
 * @param {number} baseValue
 * @param {string|number} modString
 * @param {number} [rank=1]
 * @returns {number}
 */
export function evaluateModifier(baseOrMod, modOrContext, rankOrNothing = 1) {
  let baseValue = 0;
  let modString = baseOrMod;
  let rank = 1;

  if (typeof baseOrMod === 'number' && (typeof modOrContext === 'string' || typeof modOrContext === 'number' || modOrContext === null || modOrContext === undefined)) {
    baseValue = baseOrMod;
    modString = modOrContext;
    rank = typeof rankOrNothing === 'number' ? rankOrNothing : (rankOrNothing?.rank ?? 1);
  } else {
    modString = baseOrMod;
    if (typeof modOrContext === 'object' && modOrContext !== null) {
      rank = Number(modOrContext.rank) || 1;
      baseValue = Number(modOrContext.base) || 0;
    } else if (typeof modOrContext === 'number') {
      rank = modOrContext;
    }
  }

  if (modString === undefined || modString === null || modString === '') return baseValue;
  if (typeof modString === 'number') {
    return Number.isFinite(modString) ? (baseValue !== 0 ? baseValue + modString : modString) : baseValue;
  }
  const clean = String(modString).replace(/@rank/gi, String(Math.max(1, rank))).trim();
  if (!clean) return baseValue;

  if (clean.startsWith('*')) {
    const mult = parseFloat(clean.slice(1).trim());
    return Number.isFinite(mult) ? Math.max(1, Math.round((baseValue || 1) * mult)) : baseValue;
  }
  if (clean.startsWith('/')) {
    const div = parseFloat(clean.slice(1).trim());
    return (Number.isFinite(div) && div !== 0) ? Math.max(1, Math.round((baseValue || 1) / div)) : baseValue;
  }

  const mathMatch = clean.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*') res = a * b;
    else if (op === '/' && b !== 0) res = a / b;
    return Math.round(res);
  }

  const num = parseFloat(clean.replace(/^\+/, ''));
  if (Number.isFinite(num)) {
    return baseValue !== 0 ? Math.max(0, baseValue + num) : num;
  }
  return baseValue;
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
  if (sys.weaponCategory || sys.weaponType) return true;
  const slot = (sys.slot || '').toLowerCase();
  const rawParts = sys.damageParts;
  const parts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts || {});
  const hasDamageParts = parts.length > 0 && parts.some(p => p && (p.dice || p.value || p.stat));
  if (hasDamageParts) return true;
  if (slot === 'hands' || slot === 'holding') return true;
  return false;
}

import { calculateItemHandsRequired, CANONICAL_CONDITION_LIMB_MODIFIERS } from '../models/actors/base-actor-model.mjs';
export { calculateItemHandsRequired, CANONICAL_CONDITION_LIMB_MODIFIERS };

/**
 * Calculate required cumulative XP to reach the next level.
 * Level 1 -> 1,000 XP (reaches Level 2)
 * Level 2 -> 2,500 XP (reaches Level 3)
 * Level 3 -> 4,500 XP (reaches Level 4)
 * Level 4 -> 7,000 XP (reaches Level 5)
 * Formula: 250 * L^2 + 750 * L
 * @param {number} level
 * @returns {number}
 */
export function getRequiredXPForLevel(level) {
  const lvl = Math.max(1, Number(level) || 1);
  return 250 * lvl * lvl + 750 * lvl;
}

/**
 * Official CarlRPG Boss Level Hierarchy and Color-Coded Star Tiers:
 * - Bronze: Neighborhood Boss (local outpost / minion leader)
 * - Silver: Borough Boss (district commander)
 * - Gold: City Boss (major zone guardian)
 * - Platinum: Country Boss (continental / realm tyrant)
 * - Legendary: Floor Boss (end-of-floor staircase guardian)
 * - Celestial: Dungeon Boss (core deity / dungeon sovereign)
 */
export const DCC_BOSS_TIERS = {
  bronze: {
    id: 'bronze',
    label: 'Bronze Star',
    bossLevel: 'Neighborhood Boss',
    scope: 'neighborhood',
    color: '#cd7f32',
    icon: 'fa-solid fa-star',
    cssClass: 'star-bronze',
    order: 6
  },
  silver: {
    id: 'silver',
    label: 'Silver Star',
    bossLevel: 'Borough Boss',
    scope: 'borough',
    color: '#dcdde1',
    icon: 'fa-solid fa-star',
    cssClass: 'star-silver',
    order: 5
  },
  gold: {
    id: 'gold',
    label: 'Gold Star',
    bossLevel: 'City Boss',
    scope: 'city',
    color: '#f1c40f',
    icon: 'fa-solid fa-star',
    cssClass: 'star-gold',
    order: 4
  },
  platinum: {
    id: 'platinum',
    label: 'Platinum Star',
    bossLevel: 'Country Boss',
    scope: 'country',
    color: '#00d2d3',
    icon: 'fa-solid fa-star',
    cssClass: 'star-platinum',
    order: 3
  },
  legendary: {
    id: 'legendary',
    label: 'Legendary Star',
    bossLevel: 'Floor Boss',
    scope: 'floor',
    color: '#e67e22',
    icon: 'fa-solid fa-star',
    cssClass: 'star-legendary',
    order: 2
  },
  celestial: {
    id: 'celestial',
    label: 'Celestial Star',
    bossLevel: 'Dungeon Boss',
    scope: 'dungeon',
    color: '#9b59b6',
    icon: 'fa-solid fa-star',
    cssClass: 'star-celestial',
    order: 1
  }
};

/**
 * Maps arbitrary classification or boss name string to canonical boss tier.
 * @param {string} raw
 * @returns {string} One of 'bronze'|'silver'|'gold'|'platinum'|'legendary'|'celestial'
 */
export function getBossTierFromClassification(raw) {
  if (!raw) return 'bronze';
  const str = String(raw).toLowerCase().trim();
  if (DCC_BOSS_TIERS[str]) return str;
  if (str.includes('dungeon')) return 'celestial';
  if (str.includes('floor')) return 'legendary';
  if (str.includes('country')) return 'platinum';
  if (str.includes('city')) return 'gold';
  if (str.includes('borough') || str.includes('burrough')) return 'silver';
  if (str.includes('neighborhood') || str.includes('minion') || str.includes('boss')) return 'bronze';
  return 'bronze';
}

const BaseActor = globalThis.foundry?.documents?.Actor
  ?? globalThis.foundry?.documents?.BaseActor
  ?? globalThis.Actor
  ?? class {};

export class DCCActor extends BaseActor {
  /**
   * Helper getter returning the actor's limbs state.
   * @type {object}
   */
  get limbs() {
    return this.system?.attributes?.limbs || {
      arms: 2,
      legs: 2,
      hands: 2,
      maxArms: 2,
      maxLegs: 2,
      maxHands: 2,
      usedHands: 0,
      exceededHands: false,
      handsWarning: ''
    };
  }

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (this.type === 'crawler' || this.type === 'pet') {
      const updates = {
        'prototypeToken.actorLink': true,
        'prototypeToken.disposition': 1
      };

      const conVal = data?.system?.abilities?.con?.value ?? this.system?.abilities?.con?.value;
      if (conVal !== undefined) {
        const conMod = getDCCStatModifier(conVal);
        const computedMaxHp = 10 * conMod;
        const rawHp = data?.system?.attributes?.hp?.value;
        if (rawHp === undefined || (rawHp === 40 && computedMaxHp !== 40)) {
          updates['system.attributes.hp.value'] = computedMaxHp;
          updates['system.attributes.hp.max'] = computedMaxHp;
          updates['system.attributes.hp.pct'] = 100;
        }
      }

      const intVal = data?.system?.abilities?.int?.value ?? this.system?.abilities?.int?.value;
      if (intVal !== undefined) {
        const computedMaxMana = Number(intVal) || 0;
        const rawMana = data?.system?.attributes?.mana?.value;
        if (rawMana === undefined || (rawMana === 10 && computedMaxMana !== 10)) {
          updates['system.attributes.mana.value'] = computedMaxMana;
          updates['system.attributes.mana.max'] = computedMaxMana;
          updates['system.attributes.mana.pct'] = 100;
        }
      }

      this.updateSource(updates);
    } else if (this.type === 'mob') {
      const updates = {
        'prototypeToken.actorLink': false,
        'prototypeToken.disposition': -1
      };

      const conVal = data?.system?.abilities?.con?.value ?? this.system?.abilities?.con?.value ?? 10;
      const conMod = getDCCStatModifier(conVal);
      const bars = Math.max(1, Number(data?.system?.attributes?.hp?.bars ?? this.system?.attributes?.hp?.bars) || 2);
      const explicitHpPerBar = Number(data?.system?.attributes?.hp?.hpPerBar ?? this.system?.attributes?.hp?.hpPerBar) || 0;
      const hpPerBar = explicitHpPerBar > 0 ? explicitHpPerBar : (conMod > 0 ? conMod : 1);
      const computedMaxHp = bars * hpPerBar;

      const rawHp = data?.system?.attributes?.hp?.value;
      if (rawHp === undefined || rawHp === 40 || rawHp === 4) {
        updates['system.attributes.hp.value'] = computedMaxHp;
        updates['system.attributes.hp.max'] = computedMaxHp;
        updates['system.attributes.hp.pct'] = 100;
        updates['system.attributes.hp.bars'] = bars;
        updates['system.attributes.hp.hpPerBar'] = hpPerBar;
      }

      this.updateSource(updates);
    }
  }

  /** @override */
  async _preUpdate(changes, options, user) {
    if (typeof super._preUpdate === 'function') {
      await super._preUpdate(changes, options, user);
    }
    this._preventDuplicateExternalBuffs(changes);
  }

  /**
   * Enforces that the same buff cannot be assigned to different external buff slots.
   * If a slot is updated to a buff that is already assigned elsewhere on this actor,
   * the other slot is cleared.
   * @param {object} changes
   */
  _preventDuplicateExternalBuffs(changes) {
    if (!changes || typeof changes !== 'object') return;

    const slots = ['buff1', 'buff2', 'buff3'];
    const incoming = {};

    // Check dot notation
    for (const s of slots) {
      const key = `system.attributes.externalBuffs.${s}`;
      if (key in changes) {
        incoming[s] = changes[key];
      }
    }

    // Check nested notation
    const nestedBuffs = changes.system?.attributes?.externalBuffs;
    if (nestedBuffs && typeof nestedBuffs === 'object') {
      for (const s of slots) {
        if (s in nestedBuffs) {
          incoming[s] = nestedBuffs[s];
        }
      }
    }

    if (Object.keys(incoming).length === 0) return;

    const resolveBuff = (val) => {
      if (!val) return null;
      const strVal = String(val).trim().toLowerCase();
      const item = (this.items?.get ? this.items.get(val) : null) ||
        (Array.isArray(this.items) ? this.items.find(i => String(i.id).toLowerCase() === strVal || String(i.name).trim().toLowerCase() === strVal) : null);
      return {
        id: (item?.id ? String(item.id).toLowerCase() : strVal),
        name: (item?.name ? String(item.name).trim().toLowerCase() : strVal)
      };
    };

    const isSameBuff = (b1, b2) => {
      if (!b1 || !b2) return false;
      return b1.id === b2.id || b1.name === b2.name || b1.id === b2.name || b1.name === b2.id;
    };

    for (const [targetSlot, targetVal] of Object.entries(incoming)) {
      if (!targetVal) continue;
      const targetBuff = resolveBuff(targetVal);
      if (!targetBuff) continue;

      for (const otherSlot of slots) {
        if (otherSlot === targetSlot) continue;

        let otherVal = null;
        if (otherSlot in incoming) {
          otherVal = incoming[otherSlot];
        } else {
          otherVal = this.system?.attributes?.externalBuffs?.[otherSlot];
        }

        if (otherVal) {
          const otherBuff = resolveBuff(otherVal);
          if (isSameBuff(targetBuff, otherBuff)) {
            changes[`system.attributes.externalBuffs.${otherSlot}`] = '';
            if (nestedBuffs && typeof nestedBuffs === 'object') {
              nestedBuffs[otherSlot] = '';
            }
          }
        }
      }
    }
  }

  /**
   * Compatibility wrapper ensuring _preUpdate is invoked across environments.
   * Also enforces that any update made to a crawler or pet on a scene persists
   * to the base world actor, ensuring scene-independent persistence.
   * @override
   */
  async update(data, options = {}) {
    if (typeof this._preUpdate === 'function') {
      await this._preUpdate(data, options, globalThis.game?.user?.id || 'test-user');
    }
    // If this is a crawler or pet token actor on a scene, persist changes to the base world actor!
    if (this.isToken && (this.type === 'crawler' || this.type === 'pet')) {
      const baseActor = this.token?.baseActor || globalThis.game?.actors?.get?.(this.token?.actorId || this.id);
      if (baseActor && baseActor !== this) {
        await baseActor.update(data, options);
      }
    }
    return super.update ? super.update(data, options) : this;
  }

  /**
   * Enforces spell idempotence (a spell is globally unique on an actor) and
   * forwards embedded document creations on crawler/pet scene tokens to the base actor.
   * @override
   */
  async createEmbeddedDocuments(embeddedType, dataArray, options = {}) {
    // Forward embedded creations on scene tokens to the base actor
    if (this.isToken && (this.type === 'crawler' || this.type === 'pet')) {
      const baseActor = this.token?.baseActor || globalThis.game?.actors?.get?.(this.token?.actorId || this.id);
      if (baseActor && baseActor !== this) {
        return baseActor.createEmbeddedDocuments(embeddedType, dataArray, options);
      }
    }

    if (embeddedType === 'Item' && Array.isArray(dataArray)) {
      const filteredData = [];
      const existingReturns = [];

      for (const itemData of dataArray) {
        if (itemData.type === 'spell') {
          const norm = (itemData.name || '').toLowerCase().trim();
          const sourceUuid = itemData.flags?.core?.sourceId || itemData.flags?.['carl-rpg']?.sourceUuid || itemData.uuid;
          const compId = itemData.flags?.['carl-rpg']?.compendiumId || itemData.id || itemData._id;

          const existingItems = Array.isArray(this.items) ? this.items : Array.from(this.items?.values?.() || []);
          const existingSpell = existingItems.find(i => {
            if (i.type !== 'spell') return false;
            const iSource = i.flags?.core?.sourceId || i.flags?.['carl-rpg']?.sourceUuid;
            const iCompId = i.flags?.['carl-rpg']?.compendiumId;
            if (sourceUuid && iSource === sourceUuid) return true;
            if (compId && iCompId === compId) return true;
            return (i.name || '').toLowerCase().trim() === norm;
          });

          if (existingSpell) {
            // Already known: do not duplicate. Keep maximum rank.
            const incomingRank = Number(itemData.system?.rank) || 1;
            const currentRank = Number(existingSpell.system?.rank) || 1;
            if (incomingRank > currentRank) {
              await existingSpell.update({ 'system.rank': incomingRank });
            }
            existingReturns.push(existingSpell);
            continue;
          }
        } else if (itemData.type === 'skill') {
          const norm = (itemData.name || '').toLowerCase().trim();
          const sourceUuid = itemData.flags?.core?.sourceId || itemData.flags?.['carl-rpg']?.sourceUuid || itemData.uuid;
          const compId = itemData.flags?.['carl-rpg']?.compendiumId || itemData.id || itemData._id;

          const existingItems = Array.isArray(this.items) ? this.items : Array.from(this.items?.values?.() || []);
          const existingSkills = existingItems.filter(i => {
            if (i.type !== 'skill') return false;
            const iSource = i.flags?.core?.sourceId || i.flags?.['carl-rpg']?.sourceUuid;
            const iCompId = i.flags?.['carl-rpg']?.compendiumId;
            if (sourceUuid && iSource === sourceUuid) return true;
            if (compId && iCompId === compId) return true;
            return (i.name || '').toLowerCase().trim() === norm;
          });

          if (existingSkills.length > 0) {
            // Sort existing skills by rank descending
            existingSkills.sort((a, b) => (Number(b.system?.rank) || 0) - (Number(a.system?.rank) || 0));
            const bestExisting = existingSkills[0];
            const incomingRank = Number(itemData.system?.rank) || 0;
            const currentRank = Number(bestExisting.system?.rank) || 0;

            // Remove any redundant duplicate skill documents that may already exist
            if (existingSkills.length > 1) {
              const toDelete = existingSkills.slice(1).map(i => i.id || i._id).filter(Boolean);
              if (toDelete.length > 0 && typeof this.deleteEmbeddedDocuments === 'function') {
                await this.deleteEmbeddedDocuments('Item', toDelete);
              }
            }

            // Retain the higher rank between incoming and existing
            if (incomingRank > currentRank) {
              await bestExisting.update({ 'system.rank': incomingRank });
            }
            existingReturns.push(bestExisting);
            continue;
          }
        }
        filteredData.push(itemData);
      }

      let created = [];
      if (filteredData.length > 0) {
        created = super.createEmbeddedDocuments
          ? await super.createEmbeddedDocuments(embeddedType, filteredData, options)
          : [];
      }
      return [...existingReturns, ...created];
    }

    return super.createEmbeddedDocuments ? super.createEmbeddedDocuments(embeddedType, dataArray, options) : [];
  }

  /**
   * Forwards embedded updates on crawler/pet scene tokens to the base actor.
   * @override
   */
  async updateEmbeddedDocuments(embeddedType, updates = [], options = {}) {
    if (this.isToken && (this.type === 'crawler' || this.type === 'pet')) {
      const baseActor = this.token?.baseActor || globalThis.game?.actors?.get?.(this.token?.actorId || this.id);
      if (baseActor && baseActor !== this) {
        await baseActor.updateEmbeddedDocuments(embeddedType, updates, options);
      }
    }
    return super.updateEmbeddedDocuments ? super.updateEmbeddedDocuments(embeddedType, updates, options) : [];
  }

  /**
   * Forwards embedded deletions on crawler/pet scene tokens to the base actor.
   * @override
   */
  async deleteEmbeddedDocuments(embeddedType, ids = [], options = {}) {
    if (this.isToken && (this.type === 'crawler' || this.type === 'pet')) {
      const baseActor = this.token?.baseActor || globalThis.game?.actors?.get?.(this.token?.actorId || this.id);
      if (baseActor && baseActor !== this) {
        await baseActor.deleteEmbeddedDocuments(embeddedType, ids, options);
      }
    }
    return super.deleteEmbeddedDocuments ? super.deleteEmbeddedDocuments(embeddedType, ids, options) : [];
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
    if (typeof this.system?.prepareBaseData === 'function') {
      this.system.prepareBaseData();
    }
    if ((this.type === 'crawler' || this.type === 'pet') && !this.isToken) {
      if (this.prototypeToken && !this.prototypeToken.actorLink) {
        this.prototypeToken.actorLink = true;
      }
    } else if (this.type === 'mob' && !this.isToken) {
      if (this.prototypeToken && this.prototypeToken.actorLink) {
        this.prototypeToken.actorLink = false;
      }
    }
    // Ensure abilities have unenhanced initialized if missing
    if (this.system.abilities) {
      for (const ability of Object.values(this.system.abilities)) {
        if (ability && (ability.unenhanced === undefined || ability.unenhanced === null || ability.unenhanced === '')) {
          ability.unenhanced = ability.value || 10;
        }
      }
    }

    // Ensure base limbs exist
    if (this.system.attributes) {
      if (!this.system.attributes.limbs) {
        this.system.attributes.limbs = { arms: 2, legs: 2, hands: 2 };
      }
      if (this.system.attributes.limbs.arms === undefined || this.system.attributes.limbs.arms === null) this.system.attributes.limbs.arms = 2;
      if (this.system.attributes.limbs.legs === undefined || this.system.attributes.limbs.legs === null) this.system.attributes.limbs.legs = 2;
      if (this.system.attributes.limbs.hands === undefined || this.system.attributes.limbs.hands === null) this.system.attributes.limbs.hands = 2;
    }
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (typeof this.system?.prepareDerivedData === 'function') {
      this.system.prepareDerivedData();
      return;
    }
    const system = this.system;

    // Derive size normalization
    if (system.attributes) {
      const sizeInfo = getSizeInfo(system.attributes.size);
      system.attributes.sizeInfo = sizeInfo;
      system.attributes.sizeNumber = sizeInfo.size;
      system.attributes.sizeLabel = sizeInfo.label;
    }

    // Gather equipped gear
    const equippedGear = this.items ? this.items.filter(i => i.type === 'gear' && i.system?.equipped) : [];

    // Tally gear bonuses to stats, DR, and evade
    const gearStatBonuses = {
      str: { flat: 0, pct: 0 },
      int: { flat: 0, pct: 0 },
      con: { flat: 0, pct: 0 },
      dex: { flat: 0, pct: 0 },
      cha: { flat: 0, pct: 0 }
    };
    let gearDR = 0;
    let gearEvade = 0;

    for (const item of equippedGear) {
      const sys = item.system;
      if (sys.abilityModifiers) {
        for (const [key, mods] of Object.entries(sys.abilityModifiers)) {
          if (!gearStatBonuses[key] || !mods) continue;

          // Support { value, type: 'flat' | 'pct' } schema
          const val = Number(mods.value);
          const type = (mods.type || 'flat').toLowerCase();
          if (Number.isFinite(val) && val !== 0) {
            if (type === 'pct' || type === '%') {
              gearStatBonuses[key].pct += val;
            } else {
              gearStatBonuses[key].flat += val;
            }
          }

          // Legacy format fallback { flat, pct }
          if (mods.value === undefined || mods.value === null || mods.value === '') {
            if (mods.flat) gearStatBonuses[key].flat += Number(mods.flat) || 0;
            if (mods.pct) gearStatBonuses[key].pct += Number(mods.pct) || 0;
          }
        }
      }

      // Structured grants on gear (grants: [{ kind: 'stat', stat: 'str', value: 2, type: 'flat' }])
      if (Array.isArray(sys.grants)) {
        for (const g of sys.grants) {
          if (!g) continue;
          if (g.kind === 'stat') {
            const statKey = (g.stat || '').toLowerCase().trim();
            if (gearStatBonuses[statKey]) {
              const val = Number(g.value);
              const type = (g.type || 'flat').toLowerCase();
              if (Number.isFinite(val) && val !== 0) {
                if (type === 'pct' || type === '%') {
                  gearStatBonuses[statKey].pct += val;
                } else {
                  gearStatBonuses[statKey].flat += val;
                }
              }
            }
          } else if (g.kind === 'dr') {
            gearDR += Number(g.value) || 0;
          } else if (g.kind === 'evade') {
            gearEvade += Number(g.value) || 0;
          }
        }
      }

      gearDR += Number(sys.drBonus ?? sys.armorBonus) || 0;
      gearEvade += Number(sys.evadeBonus) || 0;
    }

    // -------------------------------------------------------------------------
    // EXTERNAL BUFFS (Max 3)
    // -------------------------------------------------------------------------
    const activeBuffs = this.getActiveBuffs();
    const buffStatBonuses = { str: 0, int: 0, con: 0, dex: 0, cha: 0 };
    const resistances = new Set();
    const immunities = new Set();
    let buffTempHp = 0;
    let deltaArms = 0;
    let deltaLegs = 0;
    let deltaHands = 0;
    const damageMultipliers = { all: 1 };
    if (CONFIG.DCC?.damageTypes) {
      for (const dt of CONFIG.DCC.damageTypes) {
        damageMultipliers[dt] = 1;
      }
    }

    for (const buff of activeBuffs) {
      if (!buff) continue;
      const bSys = buff.system || buff;
      const bType = (bSys.buffType || '').toLowerCase();
      const bStat = (bSys.stat || '').toLowerCase();
      const bVal = Number(bSys.value) || 0;
      const bDmg = bSys.damageType || '';
      const bMult = Number(bSys.damageMultiplier) || (bType === 'damagemultiplier' ? bVal : 1);

      // Limb modifiers on buff
      const bLimb = bSys.limbModifiers || {};
      if (bLimb.arms) deltaArms += Number(bLimb.arms) || 0;
      if (bLimb.legs) deltaLegs += Number(bLimb.legs) || 0;
      if (bLimb.hands) deltaHands += Number(bLimb.hands) || 0;
      const bNorm = (buff.name || '').toLowerCase().trim();
      if (!bLimb.arms && !bLimb.legs && !bLimb.hands && CANONICAL_CONDITION_LIMB_MODIFIERS[bNorm]) {
        const can = CANONICAL_CONDITION_LIMB_MODIFIERS[bNorm];
        if (can.arms) deltaArms += can.arms;
        if (can.legs) deltaLegs += can.legs;
        if (can.hands) deltaHands += can.hands;
      }

      // Support multiple statModifiers on buff
      if (Array.isArray(bSys.statModifiers) && bSys.statModifiers.length > 0) {
        for (const sm of bSys.statModifiers) {
          const sKey = (sm?.stat || '').toLowerCase();
          const sVal = Number(sm?.value) || 0;
          if (sKey && buffStatBonuses[sKey] !== undefined) {
            buffStatBonuses[sKey] += sVal;
          }
        }
      } else if (bType === 'stat' && bStat && buffStatBonuses[bStat] !== undefined) {
        buffStatBonuses[bStat] += bVal;
      }

      // Support multiple damageModifiers on buff
      if (Array.isArray(bSys.damageModifiers) && bSys.damageModifiers.length > 0) {
        for (const dm of bSys.damageModifiers) {
          if (!dm) continue;
          const kind = (dm.kind || dm.type || '').toLowerCase();
          const dt = dm.damageType || '';
          const val = Number(dm.value) || 0;
          const mult = Number(dm.multiplier ?? dm.value) || 1;

          if (kind === 'temphp' || kind === 'temp_hp') {
            buffTempHp += val;
          } else if (kind === 'resistance' && dt) {
            resistances.add(dt);
          } else if (kind === 'immunity' && dt) {
            immunities.add(dt);
          } else if (kind === 'damagemultiplier' || kind === 'multiplier' || mult > 1) {
            if (dt && damageMultipliers[dt] !== undefined) {
              damageMultipliers[dt] *= mult;
            } else {
              damageMultipliers.all *= mult;
            }
          }
        }
      } else {
        if (bType === 'temphp' || bType === 'temp_hp') {
          buffTempHp += bVal;
        } else if (bType === 'resistance' && bDmg) {
          resistances.add(bDmg);
        } else if (bType === 'immunity' && bDmg) {
          immunities.add(bDmg);
        } else if (bType === 'damagemultiplier' || bMult > 1) {
          if (bDmg && damageMultipliers[bDmg] !== undefined) {
            damageMultipliers[bDmg] *= bMult;
          } else {
            damageMultipliers.all *= bMult;
          }
        }
      }
    }

    // Process debuff stat penalties from embedded debuff items
    const debuffItems = this.items
      ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff'))
      : [];
    for (const debuff of debuffItems) {
      const dSys = debuff.system || {};

      // Limb modifiers on debuff
      const dLimb = dSys.limbModifiers || {};
      if (dLimb.arms) deltaArms += Number(dLimb.arms) || 0;
      if (dLimb.legs) deltaLegs += Number(dLimb.legs) || 0;
      if (dLimb.hands) deltaHands += Number(dLimb.hands) || 0;
      const dNorm = (debuff.name || '').toLowerCase().trim();
      if (!dLimb.arms && !dLimb.legs && !dLimb.hands && CANONICAL_CONDITION_LIMB_MODIFIERS[dNorm]) {
        const can = CANONICAL_CONDITION_LIMB_MODIFIERS[dNorm];
        if (can.arms) deltaArms += can.arms;
        if (can.legs) deltaLegs += can.legs;
        if (can.hands) deltaHands += can.hands;
      }

      if (Array.isArray(dSys.statModifiers) && dSys.statModifiers.length > 0) {
        for (const sm of dSys.statModifiers) {
          const sKey = (sm?.stat || '').toLowerCase();
          const sVal = Number(sm?.value) || 0;
          if (sKey && buffStatBonuses[sKey] !== undefined) {
            buffStatBonuses[sKey] += sVal;
          }
        }
      } else if (dSys.stat && buffStatBonuses[dSys.stat.toLowerCase()] !== undefined) {
        buffStatBonuses[dSys.stat.toLowerCase()] += Number(dSys.value) || 0;
      }
    }

    // Calculate 5 Core Ability Scores and Modifiers using unenhanced base + gear bonuses + external buff bonuses
    if (system.abilities) {
      for (const [key, ability] of Object.entries(system.abilities)) {
        let unenhanced = Number(ability.unenhanced);
        if (!Number.isFinite(unenhanced) || unenhanced <= 0) {
          unenhanced = Number(ability.value) || 10;
          ability.unenhanced = unenhanced;
        }
        const flatMod = gearStatBonuses[key]?.flat || 0;
        const pctMod = gearStatBonuses[key]?.pct || 0;
        const buffMod = buffStatBonuses[key] || 0;

        // Percentage bonus rounded up (e.g. +10% of 10 = +1)
        const pctBonus = pctMod !== 0
          ? (pctMod > 0 ? Math.ceil((unenhanced * pctMod) / 100) : Math.floor((unenhanced * pctMod) / 100))
          : 0;

        ability.gearBonus = flatMod + pctBonus;
        ability.buffBonus = buffMod;
        ability.value = unenhanced + ability.gearBonus + ability.buffBonus;
        ability.mod = getDCCStatModifier(ability.value);
      }
    }

    // Calculate Evade, DR, HP, and Mana for Crawler/Creature
    system.attributes = system.attributes || {};
    system.attributes.resistances = Array.from(resistances);
      system.attributes.immunities = Array.from(immunities);
      system.attributes.damageMultipliers = damageMultipliers;
      system.attributes.damageMultiplier = damageMultipliers.all;
      system.attributes.activeBuffs = activeBuffs;

      const dexMod = system.abilities?.dex?.mod ?? 0;
      system.attributes.evade = system.attributes.evade || { base: dexMod, gear: 0, items: 0, buffs: 0, total: 0 };
      const evadeBuffs = Number(system.attributes.evade.buffs) || 0;
      system.attributes.evade.items = gearEvade;
      system.attributes.evade.gear = gearEvade;
      system.attributes.evade.total = dexMod + evadeBuffs + gearEvade;

      // Derive Evade Difficulty and effective Evade DC
      const currentFloor = DCCActor.getCurrentFloor ? DCCActor.getCurrentFloor() : 1;
      if (this.type === 'mob') {
        let baseEvade = 10 + dexMod;
        const rawDiff = system.attributes.evadeDifficulty;
        if (typeof rawDiff === 'string' && rawDiff.trim()) {
          const match = rawDiff.trim().match(/^(\d+)(?:\s*\+\s*F)?$/i);
          if (match) baseEvade = parseInt(match[1], 10);
        } else if (Number.isFinite(Number(rawDiff)) && Number(rawDiff) > 0) {
          baseEvade = Number(rawDiff);
        }
        system.attributes.evadeDifficulty = `${baseEvade}+F`;
        system.attributes.evadeBaseDifficulty = baseEvade;
        system.attributes.effectiveEvadeDC = baseEvade + currentFloor;
      } else {
        system.attributes.effectiveEvadeDC = 10 + dexMod + currentFloor;
      }

      system.attributes.dr = system.attributes.dr || { armor: 0, gear: 0, items: 0, buffs: 0, total: 0 };
      const drArmor = Number(system.attributes.dr.armor) || 0;
      const drBuffs = Number(system.attributes.dr.buffs) || 0;
      system.attributes.dr.items = gearDR;
      system.attributes.dr.gear = gearDR;
      system.attributes.dr.total = drArmor + drBuffs + gearDR;

      if (system.attributes.hp) {
        const conMod = system.abilities?.con?.mod ?? 1;
        if (this.type === 'mob') {
          const bars = Math.max(1, Number(system.attributes.hp?.bars) || 2);
          const explicitHpPerBar = Number(system.attributes.hp?.hpPerBar) || 0;
          const hpPerBar = explicitHpPerBar > 0 ? explicitHpPerBar : (conMod > 0 ? conMod : 1);
          system.attributes.hp.bars = bars;
          system.attributes.hp.hpPerBar = hpPerBar;
          system.attributes.hp.max = bars * hpPerBar;
        } else {
          system.attributes.hp.max = 10 * conMod;
        }
        const rawVal = Number(system.attributes.hp.value);
        const hpVal = Number.isFinite(rawVal) ? rawVal : system.attributes.hp.max;
        system.attributes.hp.value = Math.max(0, hpVal);
        const hpMax = Number(system.attributes.hp.max) || 1;
        system.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((system.attributes.hp.value / hpMax) * 100)));

        if (buffTempHp > 0) {
          system.attributes.hp.buffTemp = buffTempHp;
          if (system.attributes.hp.temp === undefined || system.attributes.hp.temp === null || Number(system.attributes.hp.temp) <= 0) {
            system.attributes.hp.temp = buffTempHp;
          }
        }
      }

      if (system.attributes.mana) {
        const enhancedInt = Number(system.abilities?.int?.value) || 0;
        system.attributes.mana.max = enhancedInt;
        const rawMana = Number(system.attributes.mana.value);
        const manaVal = Number.isFinite(rawMana) ? rawMana : system.attributes.mana.max;
        system.attributes.mana.value = manaVal;
        const manaMax = Number(system.attributes.mana.max) || 1;
        system.attributes.mana.pct = Math.min(100, Math.max(0, Math.round((manaVal / manaMax) * 100)));
      }

      if (system.attributes.speed) {
        if (system.attributes.speed.move === undefined || system.attributes.speed.move === null || system.attributes.speed.move === '') {
          system.attributes.speed.move = 20;
        }
        if (system.attributes.speed.step === undefined || system.attributes.speed.step === null || system.attributes.speed.step === '') {
          system.attributes.speed.step = 10;
        }
      }

      // 7. Calculate Limbs (Arms, Legs, Hands) and Wielding Hand Limit
      const baseArms = Number(system.attributes?.limbs?.arms ?? 2);
      const baseLegs = Number(system.attributes?.limbs?.legs ?? 2);
      const baseHands = Number(system.attributes?.limbs?.hands ?? 2);

      const maxArms = Math.max(0, (Number.isFinite(baseArms) ? baseArms : 2) + deltaArms);
      const maxLegs = Math.max(0, (Number.isFinite(baseLegs) ? baseLegs : 2) + deltaLegs);
      const maxHands = Math.max(0, (Number.isFinite(baseHands) ? baseHands : 2) + deltaHands);

      let usedHands = 0;
      const equippedHandItems = [];
      const allItems = this.items
        ? (this.items.filter ? this.items : Array.from(this.items.values?.() || this.items))
        : [];

      for (const item of allItems) {
        const hands = calculateItemHandsRequired(item);
        if (hands > 0) {
          usedHands += hands;
          equippedHandItems.push({
            id: item.id || item._id,
            name: item.name,
            hands
          });
        }
      }

      const exceededHands = usedHands > maxHands;
      const handsWarning = exceededHands
        ? `Hands limit exceeded: Wielding gear in ${usedHands} hands, but only ${maxHands} hands available!`
        : '';

      if (!system.attributes.limbs) {
        system.attributes.limbs = { arms: baseArms, legs: baseLegs, hands: baseHands };
      }
      system.attributes.limbs.arms = baseArms;
      system.attributes.limbs.legs = baseLegs;
      system.attributes.limbs.hands = baseHands;
      system.attributes.limbs.maxArms = maxArms;
      system.attributes.limbs.maxLegs = maxLegs;
      system.attributes.limbs.maxHands = maxHands;
      system.attributes.limbs.deltaArms = deltaArms;
      system.attributes.limbs.deltaLegs = deltaLegs;
      system.attributes.limbs.deltaHands = deltaHands;
      system.attributes.limbs.usedHands = usedHands;
      system.attributes.limbs.equippedHandItems = equippedHandItems;
      system.attributes.limbs.exceededHands = exceededHands;
      system.attributes.limbs.handsWarning = handsWarning;

    // -------------------------------------------------------------------------
    // SKILLS: Calculate Item Bonuses, Boon Bonuses, Modified Rank & Total Skill
    // -------------------------------------------------------------------------
    const gearSkillBonuses = new Map();
    for (const item of equippedGear) {
      let rawMods = item.system?.skillModifiers;
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

      // Structured grants on gear (grants: [{ kind: 'skill', name: 'Pugilism', bonus: 1 }])
      if (Array.isArray(item.system?.grants)) {
        for (const g of item.system.grants) {
          if (!g) continue;
          if (g.kind === 'skill' && g.name) {
            const norm = g.name.toLowerCase().trim();
            const bonus = Number(g.bonus ?? g.rank) || 0;
            if (!gearSkillBonuses.has(norm)) {
              gearSkillBonuses.set(norm, { bonus: 0, sources: [], originalName: g.name });
            }
            const entry = gearSkillBonuses.get(norm);
            entry.bonus += bonus;
            entry.sources.push(`${item.name} (+${bonus})`);
          }
        }
      }
    }

    // Collect active tag_bonus grants across gear, active buffs, classes, and races
    const activeTagGrants = [];
    for (const item of equippedGear) {
      if (Array.isArray(item.system?.grants)) {
        for (const g of item.system.grants) {
          if (g && (g.kind === 'tag_bonus' || g.kind === 'tagBonus')) activeTagGrants.push(g);
        }
      }
    }
    for (const buff of activeBuffs) {
      if (Array.isArray(buff?.system?.grants)) {
        for (const g of buff.system.grants) {
          if (g && (g.kind === 'tag_bonus' || g.kind === 'tagBonus')) activeTagGrants.push(g);
        }
      }
    }
    const classRaceItems = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'class' || i.type === 'race') : Array.from(this.items.values?.() ?? this.items).filter(i => i.type === 'class' || i.type === 'race')) : [];
    for (const cr of classRaceItems) {
      if (Array.isArray(cr.system?.grants)) {
        for (const g of cr.system.grants) {
          if (g && (g.kind === 'tag_bonus' || g.kind === 'tagBonus')) activeTagGrants.push(g);
        }
      }
    }

    if (this.items) {
      const skills = this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() ?? this.items).filter(i => i.type === 'skill');

      // First Pass: Calculate base, item, and boon ranks for all skills,
      // and collect generic weapon group bonuses from trained group skills.
      const genericTypeBonuses = new Map(); // e.g. 'Edge' -> { bonus: 0, sources: [] }

      for (const item of skills) {
        const norm = item.name.toLowerCase().trim();
        const baseRank = Number(item.system?.rank) || 0;
        const gearData = gearSkillBonuses.get(norm);
        let itemBonus = gearData ? gearData.bonus : 0;

        // Apply active tag_bonus grants matching this skill
        if (activeTagGrants.length > 0) {
          const skillTags = item.allTags || getItemAllTags(item);
          for (const tg of activeTagGrants) {
            if (tg.query && matchesTagQuery(skillTags, tg.query)) {
              itemBonus += Number(tg.bonus) || 0;
            }
          }
        }

        const boonBonus = Number(item.system?.boonBonus) || 0;
        const selfRank = Math.max(0, baseRank + itemBonus + boonBonus);

        const groupType = DCC_WEAPON_GROUP_MAP[norm];
        if (groupType && selfRank > 0) {
          if (!genericTypeBonuses.has(groupType)) {
            genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
          }
          const entry = genericTypeBonuses.get(groupType);
          entry.bonus += selfRank;
          entry.sources.push(`${item.name} (+${selfRank})`);
        }
      }

      // Also incorporate gear modifiers that reference a weapon group or type directly
      // when the actor does not own that skill document
      const ownedSkillNorms = new Set(skills.map(s => s.name.toLowerCase().trim()));
      for (const [norm, data] of gearSkillBonuses.entries()) {
        const groupType = DCC_WEAPON_GROUP_MAP[norm];
        if (groupType && !ownedSkillNorms.has(norm) && data.bonus > 0) {
          if (!genericTypeBonuses.has(groupType)) {
            genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
          }
          const entry = genericTypeBonuses.get(groupType);
          entry.bonus += data.bonus;
          entry.sources.push(...data.sources);
        }
      }

      // Second Pass: Apply type bonuses to member skills
      for (const item of skills) {
        const norm = item.name.toLowerCase().trim();
        const isGroupSkill = Boolean(DCC_WEAPON_GROUP_MAP[norm]);
        const skillType = item.system?.skillType || item.system?.type || '';

        let typeBonus = 0;
        let typeSources = '';

        if (!isGroupSkill && skillType && genericTypeBonuses.has(skillType)) {
          const tData = genericTypeBonuses.get(skillType);
          typeBonus = tData.bonus;
          typeSources = tData.sources.join(', ');
        }

        const baseRank = Number(item.system?.rank) || 0;
        const gearData = gearSkillBonuses.get(norm);
        const itemBonus = gearData ? gearData.bonus : 0;
        const boonBonus = Number(item.system?.boonBonus) || 0;
        const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus + typeBonus);

        const stat = item.system?.stat || 'str';
        const statMod = system.abilities?.[stat]?.mod ?? 0;
        const totalSkill = modifiedRank + statMod;

        // Store on system
        item.system.itemBonus = itemBonus;
        item.system.boonBonus = boonBonus;
        item.system.typeBonus = typeBonus;
        item.system.modifiedRank = modifiedRank;
        item.system.totalSkill = totalSkill;
        item.system.statMod = statMod;

        // Direct accessors
        item.baseRank = baseRank;
        item.itemBonus = itemBonus;
        item.boonBonus = boonBonus;
        item.typeBonus = typeBonus;
        item.modifiedRank = modifiedRank;
        item.effectiveRank = modifiedRank;
        item.statMod = statMod;
        item.statModStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;
        item.totalSkill = totalSkill;
        item.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
        item.itemSources = gearData ? gearData.sources.join(', ') : '';
        item.typeSources = typeSources;
      }

      // Prepare Spells: item bonuses from equipped gear, tag queries, and modifiedRank
      const spells = this.items.filter ? this.items.filter(i => i.type === 'spell') : Array.from(this.items.values?.() ?? this.items).filter(i => i.type === 'spell');
      for (const spell of spells) {
        const norm = spell.name.toLowerCase().trim();
        const baseRank = Number(spell.system?.rank) || 1;
        const gearData = gearSkillBonuses.get(norm);
        let itemBonus = gearData ? gearData.bonus : 0;

        // Apply active tag_bonus grants matching this spell
        if (activeTagGrants.length > 0) {
          const spellTags = spell.allTags || getItemAllTags(spell);
          for (const tg of activeTagGrants) {
            if (tg.query && matchesTagQuery(spellTags, tg.query)) {
              itemBonus += Number(tg.bonus) || 0;
            }
          }
        }

        const modifiedRank = Math.max(1, baseRank + itemBonus);

        const stat = spell.system?.stat || 'int';
        const statMod = system.abilities?.[stat]?.mod ?? 0;

        if (spell.system) {
          spell.system.itemBonus = itemBonus;
          spell.system.modifiedRank = modifiedRank;
          spell.system.statMod = statMod;
        }
        spell.baseRank = baseRank;
        spell.itemBonus = itemBonus;
        spell.modifiedRank = modifiedRank;
        spell.statMod = statMod;
        spell.statModStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;
      }
    }

    // -------------------------------------------------------------------------
    // EXPERIENCE & LEVEL PROGRESSION (Crawlers)
    // -------------------------------------------------------------------------
    if (this.type === 'crawler' && system.details) {
      system.details.xp = system.details.xp || {};
      const lvl = Math.max(1, Number(system.details.level) || 1);
      const levelMinXP = (lvl > 1) ? (250 * (lvl - 1) * (lvl - 1) + 750 * (lvl - 1)) : 0;
      const levelMaxXP = 250 * lvl * lvl + 750 * lvl;
      const levelSpan = Math.max(1, levelMaxXP - levelMinXP);
      
      const currentXP = Number(system.details.xp.value) || 0;
      system.details.xp.value = currentXP;
      system.details.xp.min = levelMinXP;
      system.details.xp.max = levelMaxXP;
      system.details.xp.toNext = Math.max(0, levelMaxXP - currentXP);
      system.details.xp.levelSpan = levelSpan;
      const progressInLevel = Math.max(0, currentXP - levelMinXP);
      system.details.xp.pct = Math.min(100, Math.max(0, Math.round((progressInLevel / levelSpan) * 100)));
    }
  }

  /**
   * Award experience points to a crawler, automatically checking for level advancements.
   * @param {number} amount - XP amount to add
   * @param {object} [options={}]
   * @param {boolean} [options.notify=true] - Whether to post a ChatMessage on level up
   * @returns {Promise<object|null>}
   */
  async awardExperience(amount, { notify = true } = {}) {
    if (this.type !== 'crawler') return null;
    const add = Math.max(0, Number(amount) || 0);
    const currentXP = Number(this.system.details?.xp?.value) || 0;
    const newXP = currentXP + add;
    const currentLevel = Math.max(1, Number(this.system.details?.level) || 1);
    
    // Check if newXP crosses any level thresholds
    let newLevel = currentLevel;
    while (newXP >= getRequiredXPForLevel(newLevel)) {
      newLevel++;
    }

    const leveledUp = newLevel > currentLevel;
    await this.update({
      'system.details.xp.value': newXP,
      'system.details.level': newLevel
    });

    if (leveledUp && notify && globalThis.ChatMessage?.create) {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <div class="dcc-chat-card dcc-level-up-card" style="border: 2px solid #f39c12; background: #1a1a1a; color: #fff; padding: 10px; border-radius: 4px; font-family: 'Oswald', sans-serif;">
            <h3 style="color: #f1c40f; margin: 0 0 6px 0; font-size: 16px;">
              <i class="fa-solid fa-angles-up"></i> LEVEL UP!
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${this.name}</strong> advanced from Level <strong>${currentLevel}</strong> to Level <strong>${newLevel}</strong>!</p>
            <p style="margin: 0; font-size: 11px; color: #bdc3c7;">Total Experience: <strong>${newXP} XP</strong></p>
          </div>
        `
      });
    }

    return {
      actor: this,
      oldXP: currentXP,
      newXP,
      oldLevel: currentLevel,
      newLevel,
      leveledUp,
      added: add
    };
  }

  /**
   * Roll a stat check
   * @param {string} statKey - str, int, con, dex, cha
   */
  async rollStat(statKey, options = {}) {
    const ability = this.system.abilities?.[statKey];
    if (!ability) return;

    const mod = ability.mod ?? 0;
    const statName = statKey.toUpperCase();

    const advState = this.getRollAdvantageState({
      rollType: 'stat',
      stat: statKey,
      options
    });

    const formula = `${advState.formula} + ${mod}`;
    const roll = await new Roll(formula, { mod }).evaluate();

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'stat',
        name: `${statName} Check`,
        isUntrained: false
      }).catch(() => {});
    }

    const flavor = advState.label
      ? `<strong>${this.name}</strong>: ${statName} Check (<strong>${advState.label}</strong>: ${advState.formula} + ${statName} Mod ${mod >= 0 ? `+${mod}` : mod})`
      : `<strong>${this.name}</strong>: ${statName} Check`;

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor
    });
  }

  /**
   * Get active global floor
   * @returns {number}
   */
  static getCurrentFloor() {
    try {
      const val = globalThis.game?.settings?.get?.('carl-rpg', 'currentFloor');
      const parsed = parseInt(val, 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    } catch (_) {
      return 1;
    }
  }

  /**
   * Set active global floor
   * @param {number|string} floor
   * @returns {Promise<number>}
   */
  static async setCurrentFloor(floor) {
    const parsed = Math.max(1, parseInt(floor, 10) || 1);
    if (globalThis.game?.settings?.set) {
      await globalThis.game.settings.set('carl-rpg', 'currentFloor', parsed);
    }
    if (typeof globalThis.ui !== 'undefined' && globalThis.ui?.windows) {
      for (const app of Object.values(globalThis.ui.windows)) {
        if (typeof app.render === 'function') app.render(false);
      }
    }
    return parsed;
  }

  /**
   * Get current floor for this actor
   * @returns {number}
   */
  getCurrentFloor() {
    return DCCActor.getCurrentFloor();
  }

  /**
   * Get current global floor timer clock (hours remaining until floor collapse)
   * @returns {number}
   */
  static getFloorTimer() {
    try {
      const val = globalThis.game?.settings?.get?.('carl-rpg', 'floorTimer');
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : 100;
    } catch (_) {
      return 100;
    }
  }

  /**
   * Set current global floor timer clock
   * @param {number|string} hours
   * @returns {Promise<number>}
   */
  static async setFloorTimer(hours) {
    const parsed = Number(hours);
    const val = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    if (globalThis.game?.settings?.set) {
      await globalThis.game.settings.set('carl-rpg', 'floorTimer', val);
    }
    if (typeof globalThis.ui !== 'undefined' && globalThis.ui?.windows) {
      for (const app of Object.values(globalThis.ui.windows)) {
        if (typeof app.render === 'function') app.render(false);
      }
    }
    return val;
  }

  /**
   * Decrement global floor timer clock by specified hours
   * @param {number|string} hours
   * @returns {Promise<number>}
   */
  static async decrementFloorTimer(hours) {
    const dec = Number(hours) || 0;
    const cur = DCCActor.getFloorTimer();
    const nextVal = Math.max(0, cur - dec);
    return DCCActor.setFloorTimer(nextVal);
  }

  getFloorTimer() {
    return DCCActor.getFloorTimer();
  }

  setFloorTimer(hours) {
    return DCCActor.setFloorTimer(hours);
  }

  decrementFloorTimer(hours) {
    return DCCActor.decrementFloorTimer(hours);
  }

  /**
   * Get current global crawler count (surviving crawlers in dungeon)
   * @returns {number}
   */
  static getCrawlerCount() {
    try {
      const val = globalThis.game?.settings?.get?.('carl-rpg', 'crawlerCount');
      const parsed = parseInt(String(val).replace(/,/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : 13000000;
    } catch (_) {
      return 13000000;
    }
  }

  /**
   * Set current global crawler count
   * @param {number|string} count
   * @returns {Promise<number>}
   */
  static async setCrawlerCount(count) {
    const raw = String(count ?? '').replace(/,/g, '').trim();
    const parsed = parseInt(raw, 10);
    const val = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    if (globalThis.game?.settings?.set) {
      await globalThis.game.settings.set('carl-rpg', 'crawlerCount', val);
    }
    if (typeof globalThis.ui !== 'undefined' && globalThis.ui?.windows) {
      for (const app of Object.values(globalThis.ui.windows)) {
        if (typeof app.render === 'function') app.render(false);
      }
    }
    const crawlerHUD = globalThis.CONFIG?.DCC?.crawlerClockHUD || globalThis.carl?.crawlerClockHUD;
    if (typeof crawlerHUD?.get === 'function') {
      crawlerHUD.get().render();
    }
    return val;
  }

  /**
   * Decrement global crawler count by specified amount
   * @param {number|string} amount
   * @returns {Promise<number>}
   */
  static async decrementCrawlerCount(amount = 1) {
    const dec = parseInt(String(amount).replace(/,/g, ''), 10) || 1;
    const cur = DCCActor.getCrawlerCount();
    const nextVal = Math.max(0, cur - dec);
    return DCCActor.setCrawlerCount(nextVal);
  }

  /**
   * Increment global crawler count by specified amount
   * @param {number|string} amount
   * @returns {Promise<number>}
   */
  static async incrementCrawlerCount(amount = 1) {
    const inc = parseInt(String(amount).replace(/,/g, ''), 10) || 1;
    const cur = DCCActor.getCrawlerCount();
    const nextVal = Math.max(0, cur + inc);
    return DCCActor.setCrawlerCount(nextVal);
  }

  getCrawlerCount() {
    return DCCActor.getCrawlerCount();
  }

  setCrawlerCount(count) {
    return DCCActor.setCrawlerCount(count);
  }

  decrementCrawlerCount(amount) {
    return DCCActor.decrementCrawlerCount(amount);
  }

  incrementCrawlerCount(amount) {
    return DCCActor.incrementCrawlerCount(amount);
  }

  /**
   * Automatic CON Stat Check vs Fatal Debuff Damage
   * If a Debuff applies damage to a crawler that would drop them to 0% on their Health Bar,
   * they make a Con Stat Check vs. Difficulty 10 + Floor at the end of the round.
   * This Stat Check doesn't require an Action but occurs automatically before fatal damage.
   * On a Success, the Debuff ends, and the crawler avoids the damage.
   *
   * @param {Item|object} debuff
   * @param {number} damageVal
   * @param {object} [options={}]
   * @returns {Promise<{ avoided: boolean, roll: Roll, dc: number, success: boolean }|null>}
   */
  async checkFatalDebuffProtection(debuff, damageVal, options = {}) {
    if (this.type !== 'crawler') return null;

    let currentFloor = options.floor;
    if (currentFloor === undefined || currentFloor === null) {
      currentFloor = typeof DCCActor.getCurrentFloor === 'function' ? DCCActor.getCurrentFloor() : 1;
    }
    currentFloor = Number(currentFloor) || 1;

    const dc = 10 + currentFloor;
    const conVal = this.system?.abilities?.con?.value ?? 10;
    const conMod = this.system?.abilities?.con?.mod ?? getDCCStatModifier(conVal);
    const roll = await new Roll(`1d20 + ${conMod}`, { mod: conMod }).evaluate();
    const success = roll.total >= dc;

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'stat',
        name: `CON Check vs Fatal ${debuff?.name || 'Debuff'}`,
        isUntrained: false,
        dc
      }).catch(() => {});
    }

    if (success) {
      if (typeof debuff?.delete === 'function') {
        try { await debuff.delete(); } catch (_) {}
      }
      if (typeof this.deleteEmbeddedDocuments === 'function' && debuff?.id) {
        try { await this.deleteEmbeddedDocuments('Item', [debuff.id]); } catch (_) {}
      }
      if (Array.isArray(this.items) && debuff?.id) {
        this.items = this.items.filter(i => i.id !== debuff.id && i._id !== debuff.id);
      }
    }

    const cardContent = `
      <div class="dcc-chat-card dcc-con-check-card" style="border: 2px solid ${success ? '#27ae60' : '#c0392b'}; border-radius: 4px; padding: 8px; background: #14141c; color: #fff; font-family: 'Oswald', sans-serif;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #333; padding-bottom: 4px;">
          <span style="font-weight: bold; color: #f1c40f;"><i class="fa-solid fa-heart-pulse"></i> AUTOMATIC CON STAT CHECK</span>
          <span style="font-size: 11px; background: #333; padding: 1px 6px; border-radius: 3px;">DC ${dc} (10 + Floor ${currentFloor})</span>
        </div>
        <div style="font-size: 13px; margin-bottom: 6px;">
          <strong>${this.name}</strong> faces fatal damage from <strong>${debuff?.name || 'Debuff'}</strong>!
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; background: #222; padding: 6px; border-radius: 3px;">
          <span style="font-size: 14px; color: #aaa;">CON Roll (1d20 + ${conMod}):</span>
          <span style="font-size: 18px; font-weight: bold; color: ${success ? '#2ecc71' : '#e74c3c'};">${roll.total}</span>
          <span style="margin-left: auto; font-size: 12px; font-weight: bold; padding: 2px 8px; border-radius: 3px; background: ${success ? '#27ae60' : '#c0392b'}; color: #fff;">
            ${success ? 'SUCCESS' : 'FAILED'}
          </span>
        </div>
        <div style="font-size: 12px; color: ${success ? '#2ecc71' : '#e74c3c'}; font-style: italic;">
          ${success 
            ? `On a Success, ${debuff?.name || 'the Debuff'} ends, and ${this.name} avoids the damage!` 
            : `The check failed. Fatal damage is applied.`}
        </div>
      </div>
    `;

    if (typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
      await ChatMessage.create({
        speaker: (typeof ChatMessage.getSpeaker === 'function') ? ChatMessage.getSpeaker({ actor: this }) : { alias: this.name },
        content: cardContent
      });
    }

    return {
      avoided: success,
      roll,
      dc,
      success
    };
  }

  /**
   * Calculate Target Evade DC for an attacker aiming at this actor
   * For mobs: base evade difficulty + floor (e.g. 14 + F)
   * For crawlers/others: 10 + dexMod + floor
   * @param {number|null} [floor=null]
   * @returns {number}
   */
  getEvadeTargetDC(floor = null) {
    const currentFloor = floor !== null ? (parseInt(floor, 10) || 1) : DCCActor.getCurrentFloor();
    if (this.type === 'mob') {
      const existingDiff = this.system.attributes?.evadeDifficulty;
      let base = 10 + (this.system.abilities?.dex?.mod ?? 0);
      if (typeof existingDiff === 'string' && existingDiff.trim()) {
        const match = existingDiff.trim().match(/^(\d+)/);
        if (match) base = parseInt(match[1], 10);
      } else if (Number.isFinite(Number(existingDiff)) && Number(existingDiff) > 0) {
        base = Number(existingDiff);
      }
      return base + currentFloor;
    }
    const dexMod = this.system.abilities?.dex?.mod ?? 0;
    return 10 + dexMod + currentFloor;
  }

  /**
   * Determine and evaluate attack hits against active targets
   * @param {Roll} roll
   * @param {object} [options={}]
   * @returns {{ targetResults: Array<object>, targetResultsHtml: string, currentFloor: number }}
   */
  _resolveAttackTargets(roll, options = {}) {
    const currentFloor = DCCActor.getCurrentFloor();
    let targetActors = [];
    if (options.targets && Array.isArray(options.targets)) {
      targetActors = options.targets.map(t => t.actor || t).filter(Boolean);
    } else if (options.target) {
      targetActors = [options.target.actor || options.target].filter(Boolean);
    } else if (typeof game !== 'undefined' && game.user?.targets && game.user.targets.size > 0) {
      targetActors = Array.from(game.user.targets).map(t => t.actor || t).filter(Boolean);
    }

    const d20Face = roll.dice?.[0]?.total ?? roll.terms?.[0]?.results?.[0]?.result ?? null;

    const targetResults = targetActors.map(target => {
      const targetDC = typeof target.getEvadeTargetDC === 'function'
        ? target.getEvadeTargetDC(currentFloor)
        : (10 + (target.system?.abilities?.dex?.mod ?? 0) + currentFloor);
      const isHit = roll.total >= targetDC;
      const diff = roll.total - targetDC;
      let outcome = isHit ? 'Hit' : 'Miss';
      if (d20Face === 20) {
        outcome = 'Critical Hit';
      } else if (d20Face === 1) {
        outcome = 'Critical Miss';
      } else if (diff >= 10) {
        outcome = 'Major Hit';
      } else if (diff >= -3 && !isHit) {
        outcome = 'Near Miss';
      } else if (diff <= -10) {
        outcome = 'Major Miss';
      }
      return {
        actor: target,
        actorId: target.id,
        actorName: target.name,
        targetDC,
        isHit,
        diff,
        outcome
      };
    });

    let targetResultsHtml = '';
    if (targetResults.length > 0) {
      const rows = targetResults.map(tr => {
        const img = tr.actor?.img || tr.actor?.prototypeToken?.texture?.src || 'icons/svg/mystery-man.svg';
        const hit = tr.isHit;
        const badgeBg = hit ? '#27ae60' : '#c0392b';
        const diffStr = tr.diff >= 0 ? `+${tr.diff}` : `${tr.diff}`;
        return `
          <div class="dcc-target-eval-row ${hit ? 'hit' : 'miss'}" data-target-id="${tr.actorId}" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 4px 6px; background: ${hit ? 'rgba(39, 174, 96, 0.15)' : 'rgba(192, 57, 43, 0.15)'}; border: 1px solid ${hit ? '#27ae60' : '#c0392b'}; border-radius: 3px; margin-top: 3px;">
            <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
              <img src="${img}" style="width: 20px; height: 20px; border-radius: 2px; border: 1px solid #555; object-fit: cover;" />
              <span style="font-size: 11px; font-weight: bold; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tr.actorName}</span>
              <span style="font-size: 10px; color: #bdc3c7;">(DC ${tr.targetDC})</span>
            </div>
            <div style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 2px; background: ${badgeBg}; color: #fff; text-transform: uppercase; white-space: nowrap;">
              ${tr.outcome.toUpperCase()} (${diffStr})
            </div>
          </div>
        `;
      }).join('');

      targetResultsHtml = `
        <div class="dcc-attack-targets-container" style="margin-top: 6px; font-family: var(--font-primary, 'Oswald', sans-serif);">
          <div style="font-size: 10px; font-weight: bold; color: #f1c40f; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: space-between;">
            <span><i class="fa-solid fa-crosshairs"></i> Target Evaluation</span>
            <span>Floor ${currentFloor}</span>
          </div>
          ${rows}
        </div>
      `;
    }

    return { targetResults, targetResultsHtml, currentFloor };
  }

  /**
   * Helper to build Evade button HTML for non-crawler attacks
   * @param {Roll} roll
   * @param {number} currentFloor
   * @returns {string}
   */
  _getEvadeButtonHtml(roll, currentFloor) {
    if (this.type === 'crawler') return '';
    return `
      <div class="dcc-evade-btn-container" style="margin-top: 6px;">
        <button type="button" class="dcc-evade-roll-btn" data-attacker-id="${this.id}" data-attacker-name="${this.name}" data-attack-total="${roll.total}" data-floor="${currentFloor}" style="width: 100%; padding: 4px 8px; font-size: 11px; cursor: pointer; background: #2980b9; color: #fff; border: 1px solid #1f618d; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; font-family: var(--font-primary, 'Oswald', sans-serif); text-transform: uppercase;">
          <i class="fa-solid fa-person-running"></i> Roll Evade vs Attack (${roll.total})
        </button>
      </div>
    `;
  }

  /**
   * Roll Evade check
   * @param {object} [options={}]
   * @param {number} [options.attackTotal] - Incoming attack total to evaluate against
   * @param {string} [options.attackerName] - Name of the attacker
   * @param {number} [options.floor] - Dungeon floor
   */
  async rollEvade(options = {}) {
    const dexMod = this.system.abilities?.dex?.mod ?? 0;
    const items = Number(this.system.attributes?.evade?.items ?? this.system.attributes?.evade?.gear) || 0;
    const buffs = Number(this.system.attributes?.evade?.buffs) || 0;
    const total = dexMod + items + buffs;
    const formula = `1d20 + ${total}`;
    const roll = await new Roll(formula).evaluate();

    const parts = [`DEX Mod ${dexMod}`];
    if (items) parts.push(`Items ${items >= 0 ? '+' : ''}${items}`);
    if (buffs) parts.push(`Buffs ${buffs >= 0 ? '+' : ''}${buffs}`);

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'stat',
        name: 'Evade Roll',
        isUntrained: false
      }).catch(() => {});
    }

    let resultHtml = '';
    let flavor = `<strong>${this.name}</strong>: Evade Roll (1d20 + ${parts.join(' + ')})`;

    if (options.attackTotal !== undefined && options.attackTotal !== null) {
      const atkTotal = Number(options.attackTotal) || 0;
      const isEvaded = roll.total >= atkTotal;
      const attackerLabel = options.attackerName ? ` vs ${options.attackerName}` : '';
      flavor = `<strong>${this.name}</strong>: Evade Roll${attackerLabel} (vs Attack Roll ${atkTotal})`;

      resultHtml = `
        <div class="dcc-evade-result-banner" style="margin-top: 6px; padding: 4px 8px; border-radius: 3px; font-family: var(--font-primary, 'Oswald', sans-serif); font-size: 12px; font-weight: bold; text-align: center; text-transform: uppercase; background: ${isEvaded ? '#27ae60' : '#c0392b'}; color: #fff; border: 1px solid ${isEvaded ? '#1e8449' : '#962d22'};">
          <i class="fa-solid ${isEvaded ? 'fa-shield-halved' : 'fa-burst'}"></i>
          ${isEvaded ? 'SUCCESSFULLY EVADED!' : 'EVADE FAILED — HIT TAKEN!'}
          <span style="font-size: 10px; font-weight: normal; margin-left: 4px;">(${roll.total} vs ${atkTotal})</span>
        </div>
      `;
    }

    const rollHtml = typeof roll.render === 'function' ? await roll.render() : '';
    const content = rollHtml ? `${rollHtml}${resultHtml}` : (resultHtml || undefined);

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor,
      content,
      flags: {
        'carl-rpg': {
          isEvadeRoll: true,
          evadeTotal: roll.total,
          attackTotal: options.attackTotal !== undefined ? Number(options.attackTotal) : null,
          isEvaded: options.attackTotal !== undefined ? (roll.total >= Number(options.attackTotal)) : null
        }
      }
    });
  }

  /**
   * Retrieve active damage multiplier for this actor (global or type-specific)
   * @param {string} [damageType='']
   * @returns {number}
   */
  getDamageMultiplier(damageType = '') {
    const mults = this.system?.attributes?.damageMultipliers || { all: 1 };
    const globalMult = Number(mults.all) || 1;
    if (!damageType) return globalMult;
    const typeMult = Number(mults[damageType]) || 1;
    return globalMult * typeMult;
  }

  /**
   * Checks whether a combat technique is applicable to a specific weapon or attack item.
   * Enforces official DCC RPG limitations (Unarmed Combat cannot choose or receive damage effects)
   * and matches weapon category, weapon type, and associated skill tags.
   * @param {object|Item} tech
   * @param {object|Item} attackItem
   * @returns {boolean}
   */
  isTechniqueApplicable(tech, attackItem) {
    if (!tech || !attackItem) return false;

    // 1. Gather all tags of the attackItem
    const attackItemTags = attackItem.allTags instanceof Set
      ? new Set(attackItem.allTags)
      : (typeof getItemAllTags === 'function' ? getItemAllTags(attackItem) : new Set(attackItem.system?.tags || []));

    const attackName = (attackItem.name || '').toLowerCase().trim();
    if (attackName) {
      attackItemTags.add(attackName);
      attackItemTags.add(`id.skill.${attackName.replace(/[\s_']+/g, '-')}`);
      attackItemTags.add(`id.weapon.${attackName.replace(/[\s_']+/g, '-')}`);
      attackItemTags.add(`id.attack.${attackName.replace(/[\s_']+/g, '-')}`);
    }

    const sys = attackItem.system || {};
    if (sys.weaponType) attackItemTags.add(String(sys.weaponType).toLowerCase().trim());
    if (sys.weaponCategory) attackItemTags.add(String(sys.weaponCategory).toLowerCase().trim());
    if (sys.skillType || sys.type) attackItemTags.add(String(sys.skillType || sys.type).toLowerCase().trim());

    if (Array.isArray(sys.associatedSkills)) {
      for (const as of sys.associatedSkills) {
        const clean = String(as).toLowerCase().trim();
        attackItemTags.add(clean);
        attackItemTags.add(clean.startsWith('id.skill.') ? clean : `id.skill.${clean.replace(/[\s_']+/g, '-')}`);
      }
    }
    if (Array.isArray(sys.tags)) {
      for (const t of sys.tags) {
        attackItemTags.add(String(t).toLowerCase().trim());
      }
    }
    if (attackItem.matchingSkillName) {
      const clean = attackItem.matchingSkillName.toLowerCase().trim();
      attackItemTags.add(clean);
      attackItemTags.add(`id.skill.${clean.replace(/[\s_']+/g, '-')}`);
    }
    if (attackItem.matchingSkill?.allTags) {
      for (const t of attackItem.matchingSkill.allTags) attackItemTags.add(t);
    }

    // Expand references (e.g. technique.pugilism -> id.skill.pugilism)
    const expandedAttackTags = expandTagReferences(attackItemTags);

    // 2. Official DCC RPG rule: Entity with rule.no-damage-effects explicitly cannot choose or receive any Damage Effect/Technique.
    if (expandedAttackTags.has('rule.no-damage-effects') || attackName === 'unarmed combat' || attackName === 'unarmed') {
      return false;
    }

    // 3. Resolve technique requirement / appliesTo
    const techName = (tech.name || '').toLowerCase().trim();
    const tSys = tech.system || tech.item?.system || {};
    const defConfig = DEFAULT_TECHNIQUE_CONFIGS[techName];

    // Priority 3a: Explicit TagQuery on technique
    const appliesTo = tech.appliesTo || tSys.appliesTo || defConfig?.appliesTo;
    if (appliesTo) {
      if (typeof appliesTo === 'object' && !Array.isArray(appliesTo)) {
        if (matchesTagQuery(expandedAttackTags, appliesTo)) return true;
      } else if (Array.isArray(appliesTo) && appliesTo.length > 0) {
        for (const target of appliesTo) {
          const cleanTarget = String(target).toLowerCase().trim();
          const targetTag = cleanTarget.startsWith('id.skill.') ? cleanTarget : `id.skill.${cleanTarget.replace(/[\s_']+/g, '-')}`;
          if (expandedAttackTags.has(cleanTarget) || expandedAttackTags.has(targetTag)) return true;
        }
      }
    }

    // Priority 3b: techniqueConfig.appliesToTags (legacy / sheet form)
    const rawAppliesTags = [
      ...(Array.isArray(tech.appliesTo) ? tech.appliesTo : []),
      ...(Array.isArray(tSys.appliesTo) ? tSys.appliesTo : (typeof tSys.appliesTo === 'string' ? tSys.appliesTo.split(',') : [])),
      ...(Array.isArray(tSys.techniqueConfig?.appliesToTags) ? tSys.techniqueConfig.appliesToTags : (typeof tSys.techniqueConfig?.appliesToTags === 'string' ? tSys.techniqueConfig.appliesToTags.split(',') : [])),
      ...(Array.isArray(defConfig?.appliesToTags) ? defConfig.appliesToTags : [])
    ];
    for (const ra of rawAppliesTags) {
      if (!ra) continue;
      const clean = String(ra).toLowerCase().trim();
      const idTag = clean.startsWith('id.skill.') ? clean : `id.skill.${clean.replace(/[\s_']+/g, '-')}`;
      if (expandedAttackTags.has(clean) || expandedAttackTags.has(idTag)) {
        return true;
      }
    }

    // Priority 3c: Canonical weapon technique map and damage effects fallback
    for (const tag of expandedAttackTags) {
      const canonTechs = CANONICAL_WEAPON_TECHNIQUE_MAP[tag];
      if (Array.isArray(canonTechs) && canonTechs.some(ct => ct.toLowerCase().trim() === techName)) {
        return true;
      }
      const canonEffects = CANONICAL_DAMAGE_EFFECTS[tag];
      if (Array.isArray(canonEffects) && canonEffects.some(ce => ce.toLowerCase().trim() === techName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine all valid optional damage effects for an attack item or skill.
   * Discovers canonical effects for Pugilism, Noggin Knocker, Wrasslin, and Foot Soldier,
   * as well as custom user-defined optionalEffects configured on the item or matching skill.
   * Filters discovered techniques to those the actor actually knows or has from gear.
   * @param {Item} attackItem
   * @returns {string[]} List of valid damage effect names
   */
  getValidDamageEffects(attackItem) {
    if (!attackItem) return [];

    const attackTags = attackItem.allTags instanceof Set
      ? attackItem.allTags
      : (typeof getItemAllTags === 'function' ? getItemAllTags(attackItem) : new Set(attackItem.system?.tags || []));

    // Official DCC RPG rule: Entities with rule.no-damage-effects cannot choose any damage effect.
    if (attackTags.has('rule.no-damage-effects')) {
      return [];
    }
    const normName = (attackItem.name || '').toLowerCase().trim();
    if (normName === 'unarmed combat' || normName === 'unarmed') {
      return [];
    }

    const sys = attackItem.system || {};

    // 1. Explicitly configured optionalEffects on the item itself (e.g. artifact weapons)
    let intrinsicEffects = [];
    if (Array.isArray(sys.optionalEffects) && sys.optionalEffects.length > 0) {
      intrinsicEffects = sys.optionalEffects.map(e => (typeof e === 'string' ? e.trim() : (e?.name || '').trim())).filter(Boolean);
    } else if (typeof sys.optionalEffects === 'string' && sys.optionalEffects.trim()) {
      intrinsicEffects = sys.optionalEffects.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (intrinsicEffects.length > 0) {
      return [...new Set(intrinsicEffects)];
    }

    // Helper: check if actor actually knows the effect (embedded skill or gear-granted)
    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    let candidateEffects = [];

    // 2. Canonical mapping by attackItem.name
    if (CANONICAL_DAMAGE_EFFECTS[normName]) {
      candidateEffects.push(...CANONICAL_DAMAGE_EFFECTS[normName]);
    }

    // 3. Check matching skill if attackItem is not a skill itself
    const matchingSkill = skills.find(s => s.name?.toLowerCase().trim() === normName);
    if (matchingSkill) {
      const msNorm = (matchingSkill.name || '').toLowerCase().trim();
      if (CANONICAL_DAMAGE_EFFECTS[msNorm]) {
        candidateEffects.push(...CANONICAL_DAMAGE_EFFECTS[msNorm]);
      }
      const msSys = matchingSkill.system || {};
      if (Array.isArray(msSys.optionalEffects) && msSys.optionalEffects.length > 0) {
        candidateEffects.push(...msSys.optionalEffects.map(e => (typeof e === 'string' ? e.trim() : (e?.name || '').trim())).filter(Boolean));
      } else if (typeof msSys.optionalEffects === 'string' && msSys.optionalEffects.trim()) {
        candidateEffects.push(...msSys.optionalEffects.split(',').map(s => s.trim()).filter(Boolean));
      }
    }

    // 4. Dynamic discovery from owned skills configured as techniques / damage effects
    for (const s of skills) {
      const sSys = s.system || {};
      const isTech = sSys.isTechnique === true || sSys.techniqueConfig?.isDamageEffect === true;
      const cType = (sSys.checkType || '').toLowerCase();
      if (!isTech && !cType.includes('damage effect')) continue;

      if (this.isTechniqueApplicable(s, attackItem) && s.name) {
        candidateEffects.push(s.name.trim());
      }
    }

    return [...new Set(candidateEffects)];
  }

  /**
   * Determine the selectable damage effects for an attack item or skill,
   * filtered strictly to those the actor actually knows or possesses via gear.
   * @param {Item|object} attackItem
   * @returns {string[]} List of damage effects the actor can select
   */
  getSelectableDamageEffects(attackItem) {
    if (!attackItem) return [];
    const validEffects = this.getValidDamageEffects(attackItem);
    if (!validEffects || validEffects.length === 0) return [];

    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const knowsEffect = (effectName) => {
      const normEf = effectName.toLowerCase().trim();
      if (skills.some(s => (s.name || '').toLowerCase().trim() === normEf)) return true;
      if (typeof this.getSkillRank === 'function' && this.getSkillRank(effectName) > 0) return true;
      return false;
    };

    const selectable = validEffects.filter(knowsEffect);
    const selected = attackItem.system?.selectedEffect || attackItem.selectedEffect;
    if (selected && selected !== 'none' && !selectable.includes(selected)) {
      selectable.push(selected);
    }
    return [...new Set(selectable)];
  }

  /**
   * Dynamically resolves a Damage Effect item, its active rank, technique configuration,
   * rank breaks, and calculated bonuses for a skill or attack.
   *
   * @param {string|object} chosenEffectRaw Name, tag, or Item instance of the chosen damage effect
   * @param {Item} [baseItem=null] The weapon/skill receiving the damage effect
   * @param {object} [options={}]
   * @returns {object|null}
   */
  resolveDamageEffect(chosenEffectRaw, baseItem = null, options = {}) {
    if (!chosenEffectRaw) return null;
    const effectName = typeof chosenEffectRaw === 'string'
      ? chosenEffectRaw.trim()
      : (chosenEffectRaw?.name ? String(chosenEffectRaw.name).trim() : '');
    if (!effectName || effectName.toLowerCase() === 'none') return null;

    const effLower = effectName.toLowerCase();
    const effTag = effLower.replace(/\s+/g, '_');

    // 1. Locate effect Item (either passed in or in actor's inventory)
    let effectItem = (typeof chosenEffectRaw === 'object' && (chosenEffectRaw.system || chosenEffectRaw._id || chosenEffectRaw.id))
      ? chosenEffectRaw
      : null;

    if (!effectItem) {
      const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
      effectItem = skills.find(s => (s.name || '').toLowerCase().trim() === effLower || s.system?.tags?.includes(effTag)) || null;
    }

    // 2. Resolve default canonical definition if item is missing or unconfigured
    const canonicalDefault = DEFAULT_TECHNIQUE_CONFIGS[effLower] || null;

    const sys = effectItem?.system || {};
    const tConfig = sys.techniqueConfig || {};

    // 3. Determine effective rank of the damage effect
    const rank = options.effectRank !== undefined
      ? Number(options.effectRank)
      : (options.rank !== undefined
        ? Number(options.rank)
        : (Number(effectItem?.modifiedRank ?? sys.modifiedRank ?? effectItem?.effectiveRank ?? sys.rank) || (effLower === 'powerful strike' ? 1 : (canonicalDefault ? 1 : 0))));

    // 4. Gather active rank breaks
    const activeBreaks = [];
    const sourceBreaks = (sys.rankBreaks && Object.keys(sys.rankBreaks).length > 0)
      ? sys.rankBreaks
      : canonicalDefault?.rankBreaks;

    if (sourceBreaks) {
      const thresholds = [
        { thresh: 5, data: sourceBreaks.rank5, label: 'Rank 5' },
        { thresh: 10, data: sourceBreaks.rank10, label: 'Rank 10' },
        { thresh: 15, data: sourceBreaks.rank15, label: 'Rank 15' },
        { thresh: 20, data: sourceBreaks.rank20, label: 'Rank 20' }
      ];
      for (const b of thresholds) {
        if (rank >= b.thresh && b.data) {
          activeBreaks.push(b);
        }
      }
    }

    // 5. Consolidate modifiers
    const baseCountMod = tConfig.baseDiceCountMod || canonicalDefault?.baseDiceCountMod || '';
    const breakCountMods = activeBreaks.map(b => b.data.baseDiceCountMod).filter(Boolean);
    const breakDamageDice = activeBreaks.map(b => b.data.damageDice).filter(Boolean);
    const extraRankDice = activeBreaks.reduce((sum, b) => sum + (Number(b.data.rankDamageDice) || 0), 0);
    const debuffs = [];
    if (tConfig.debuffName || canonicalDefault?.debuffName) {
      debuffs.push(tConfig.debuffName || canonicalDefault.debuffName);
    }
    for (const b of activeBreaks) {
      if (b.data.debuff && !debuffs.includes(b.data.debuff)) {
        debuffs.push(b.data.debuff);
      }
    }

    const damageBonus = tConfig.damageBonus || canonicalDefault?.damageBonus || '';
    const damageType = tConfig.damageType || canonicalDefault?.damageType || '';
    const stat = (tConfig.stat || canonicalDefault?.stat || '').toLowerCase();
    const cooldown = tConfig.cooldown || canonicalDefault?.cooldown || 'None';
    const flatMod = evaluateModifier(0, tConfig.flatDamageMod || canonicalDefault?.flatDamageMod || '', rank);
    const totalBaseCountMod = evaluateModifier(0, baseCountMod, rank) + breakCountMods.reduce((sum, mod) => sum + evaluateModifier(0, mod, rank), 0);

    const bonusParts = [];
    if (damageBonus) {
      const dm = damageBonus.match(/(\d+)d(\d+)/i);
      if (dm) {
        bonusParts.push({ count: parseInt(dm[1], 10), sides: parseInt(dm[2], 10), type: damageType });
      }
    }
    for (const bDice of breakDamageDice) {
      const dm = bDice.replace(/^\+/, '').trim().match(/(\d+)d(\d+)/i);
      if (dm) {
        bonusParts.push({ count: parseInt(dm[1], 10), sides: parseInt(dm[2], 10), type: damageType });
      }
    }

    return {
      name: effectItem?.name || effectName,
      lowerName: effLower,
      item: effectItem,
      rank,
      effectiveRank: rank,
      isDamageEffect: Boolean(tConfig.isDamageEffect ?? canonicalDefault?.isDamageEffect ?? true),
      baseCountMod,
      totalBaseCountMod,
      breakCountMods,
      breakDamageDice,
      extraRankDice,
      damageBonus,
      damageType,
      stat,
      flatMod,
      bonusParts,
      debuff: debuffs[debuffs.length - 1] || '',
      debuffs,
      cooldown,
      notes: sys.notes || canonicalDefault?.notes || '',
      activeBreaks
    };
  }

  /**
   * Prompt the interactive "Choose Damage Effect" dialog before rolling an attack.
   * Allows choosing between "No Damage Effect" (with AI Favor bonus if applicable)
   * or any valid damage effect for the attack.
   * @param {Item} attackItem
   * @param {object} [options={}]
   * @returns {Promise<string|null>} The selected effect name ('none', 'Iron Punch', etc.), or null if cancelled
   */
  async promptDamageEffectDialog(attackItem, options = {}) {
    if (options.damageEffect !== undefined) return options.damageEffect;
    if (options.effect !== undefined) return options.effect;

    const validEffects = this.getValidDamageEffects(attackItem);
    if (!validEffects || validEffects.length === 0) return null;

    if (options.skipDialog) {
      return options.defaultEffect || attackItem.system?.selectedEffect || 'none';
    }

    const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog ?? globalThis.Dialog ?? null;
    if (!DialogClass) {
      return options.defaultEffect || attackItem.system?.selectedEffect || 'none';
    }

    // In headless test environments without document or ui.windows, auto-resolve unless explicitly interactive
    if (typeof document === 'undefined' && !options.showDialog && !options.interactive) {
      return options.defaultEffect || attackItem.system?.selectedEffect || 'none';
    }

    const normName = (attackItem.name || '').toLowerCase().trim();
    const favorBonus = DAMAGE_EFFECT_AI_FAVOR[normName] || 0;
    const currentSelected = (options.selectedEffect || attackItem.system?.selectedEffect || 'none').toLowerCase().trim();

    const effectDescriptions = {
      'dirty fighting': 'Apply Woozy Debuff to target. (Critical Fail: lose 1 Popularity)',
      'iron punch': 'Deal +1d2 base damage. (At Rank 5+: adds Rank damage die; Rank 10+: Stunned)',
      'powerful strike': 'Multiply base damage dice by Rank in Powerful Strike. (Cooldown: 30 hours)',
      'skullcracker': 'Gain +1d4 base damage against targets of your size. (Rank 10+: Stunned)',
      'smush': 'Deal ×2 total damage if target has 20% Health Bar or less. (Cooldown: 1/round)',
      'choke out': 'Deal ×2 total damage if target is at 10% Health Bar or less.',
      'toss': 'Deal +1d8 base damage + Str Bludgeoning, end Held Debuff, and throw target.'
    };

    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];

    const effectRowsHtml = validEffects.map(eff => {
      const eLower = eff.toLowerCase().trim();
      const ownedSkill = skills.find(s => s.name?.toLowerCase().trim() === eLower);
      const rankBadge = ownedSkill ? `<span style="background: #27ae60; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 2px; margin-left: 6px;">Rank ${ownedSkill.system?.modifiedRank ?? ownedSkill.system?.rank ?? 0}</span>` : '';
      const desc = effectDescriptions[eLower] || ownedSkill?.system?.notes || 'Optional damage effect for this attack.';
      const isChecked = currentSelected === eLower;

      return `
        <label style="display: block; padding: 6px 8px; margin-bottom: 6px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; transition: background 0.15s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="radio" name="damageEffect" value="${eff}" ${isChecked ? 'checked' : ''} style="cursor: pointer;" />
              <strong style="font-size: 13px; color: #c0392b;">${eff}</strong>
              ${rankBadge}
            </div>
          </div>
          <div style="margin-left: 24px; font-size: 11px; color: #222222; margin-top: 2px;">
            ${desc}
          </div>
        </label>
      `;
    }).join('');

    const noneChecked = (currentSelected === 'none' || !currentSelected || !validEffects.some(e => e.toLowerCase().trim() === currentSelected));
    const favorNote = favorBonus > 0 ? ` (+${favorBonus} AI Favor on Hit)` : '';

    const content = `
      <form class="dcc-choose-damage-effect-form" style="font-family: var(--font-primary, 'Oswald', sans-serif); padding: 4px 0;">
        <div style="font-size: 12px; margin-bottom: 8px; color: #111;">
          Choose a Damage Effect for <strong>${attackItem.name}</strong> before rolling:
        </div>
        <label style="display: block; padding: 6px 8px; margin-bottom: 6px; border: 1px solid #ddd; border-radius: 4px; background: #fdfdfd; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="radio" name="damageEffect" value="none" ${noneChecked ? 'checked' : ''} style="cursor: pointer;" />
            <strong style="font-size: 13px; color: #196f3d;">No Damage Effect</strong>
            ${favorBonus > 0 ? `<span style="background: #196f3d; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 2px; margin-left: 4px;">+${favorBonus} AI Favor</span>` : ''}
          </div>
          <div style="margin-left: 24px; font-size: 11px; color: #222222; margin-top: 2px;">
            Standard attack without consuming an effect${favorNote}.
          </div>
        </label>
        ${effectRowsHtml}
      </form>
    `;

    return new Promise((resolve) => {
      let resolved = false;
      const dlg = new DialogClass({
        title: `${attackItem.name}: Choose Damage Effect`,
        content,
        buttons: {
          roll: {
            icon: '<i class="fa-solid fa-dice-d20"></i>',
            label: 'Roll Attack',
            callback: (html) => {
              resolved = true;
              let chosen = 'none';
              if (html && typeof html.find === 'function') {
                const checkedRadio = html.find('input[name="damageEffect"]:checked');
                chosen = (typeof checkedRadio.val === 'function' ? checkedRadio.val() : checkedRadio.value) || 'none';
              }
              if (attackItem && typeof attackItem.update === 'function') {
                attackItem.update({ 'system.selectedEffect': chosen }).catch(() => {});
              } else if (attackItem?.system) {
                attackItem.system.selectedEffect = chosen;
              }
              resolve(chosen);
            }
          },
          cancel: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: 'Cancel',
            callback: () => {
              resolved = true;
              resolve(null);
            }
          }
        },
        default: 'roll',
        close: () => {
          if (!resolved) resolve(null);
        }
      }, {
        width: 400
      });
      dlg.render(true);
    });
  }

  /**
   * Parse and calculate skill attack damage formula and metadata based on official DCC RPG rules.
   * Weapon Attack Damage = Weapon Base Damage + Skill Rank Damage Die + Stat Mod.
   * Handles Hand-to-Hand Damage Effects (Pugilism, Iron Punch, Powerful Strike, Skullcracker, etc.),
   * rank damage die scaling table, Fire Fingers rank 15 passive melee bonus, and rank upgrade additions.
   *
   * @param {Item} skillItem
   * @param {object} [options={}]
   * @returns {object}
   */
  getSkillDamageData(skillItem, options = {}) {
    const sys = skillItem?.system || {};
    const skillName = skillItem?.name || 'Skill';
    const rank = options.rank !== undefined
      ? Number(options.rank)
      : Math.max(Number(skillItem?.modifiedRank) || 0, Number(sys.modifiedRank) || 0, Number(skillItem?.effectiveRank) || 0, Number(sys.rank) || 0);

    const rawNotes = sys.notes || '';
    let rawBaseDamage = (sys.baseDamage || '').trim();

    // If baseDamage is not populated, check if notes contains an explicit "Base Damage:" clause
    if (!rawBaseDamage && typeof rawNotes === 'string' && rawNotes.includes('Base Damage:')) {
      const parts = rawNotes.split('Base Damage:');
      if (parts[1]) {
        rawBaseDamage = parts[1].split('.')[0].split('\n')[0].trim();
      }
    }

    const sLower = skillName.toLowerCase().trim();
    const isPugilism = sLower === 'pugilism' || Boolean(sys.tags?.includes('pugilism'));
    const isUnarmed = sLower === 'unarmed combat' || Boolean(sys.tags?.includes('unarmed'));
    const isWrasslin = sLower === 'wrasslin' || sLower === "wrasslin'" || Boolean(sys.tags?.includes('wrasslin'));
    const isFootSoldier = sLower === 'foot soldier' || Boolean(sys.tags?.includes('foot_soldier'));
    const isNogginKnocker = sLower === 'noggin knocker' || sLower === 'noggin nocker' || Boolean(sys.tags?.includes('noggin_knocker'));
    const isPrimaryAttack = isPugilism || isUnarmed || isWrasslin || isFootSoldier || isNogginKnocker;
    const skillType = sys.skillType || sys.type || '';
    const checkType = (sys.checkType || '').toLowerCase();

    // Fallback for built-in unarmed attack items where base damage formula was stored in notes
    if (!rawBaseDamage && isPrimaryAttack && typeof rawNotes === 'string' && /(\d+)d(\d+)/i.test(rawNotes)) {
      rawBaseDamage = rawNotes;
    }

    // Strict data-driven damage determination:
    // Non-attack skills or explicitly non-damaging skills NEVER deal damage unless forced.
    const explicitNoDamage = (sys.hasDamage === false && !isPrimaryAttack) || (sys.isAttack === false && !isPrimaryAttack && !rawBaseDamage && !options.forceDamage);
    const explicitHasDamage = sys.hasDamage === true;
    const hasDamageConfig = Boolean(rawBaseDamage) || isPrimaryAttack || Boolean(options.forceDamage);

    let hasDamage = false;
    if (explicitNoDamage && !options.forceDamage) {
      hasDamage = false;
    } else if (explicitHasDamage) {
      hasDamage = true;
    } else {
      hasDamage = hasDamageConfig;
    }

    let defaultStat = isNogginKnocker ? 'con' : (isPugilism ? 'str' : (sys.stat || 'str'));
    let statKey = (sys.damageStat || defaultStat).toLowerCase();
    if (!hasDamage) {
      if (!this.system?.abilities?.[statKey]) {
        statKey = (sys.stat || 'str').toLowerCase();
      }
      return {
        hasDamage: false,
        skillName,
        rank,
        baseDice: '',
        baseCount: 0,
        baseSides: 0,
        stat: statKey,
        statMod: this.system?.abilities?.[statKey]?.mod ?? 0,
        damageType: '',
        formula: '',
        formulaWithStat: '',
        rawNotes
      };
    }

    let baseCount = isPugilism ? (rank >= 15 ? 5 : (rank >= 10 ? 4 : (rank >= 5 ? 3 : 1))) : 1;
    let baseSides = isPugilism ? 2 : 4;
    let damageType = sys.damageType || (isPrimaryAttack ? 'Bludgeoning' : 'Physical');

    // Parse Base Damage formula only if rawBaseDamage is defined
    if (rawBaseDamage) {
      const diceMatch = rawBaseDamage.match(/(?:(?:Base Damage|deal)\s*:?\s*)?(\+?\d+d\d+)(?:\s*\+\s*([a-zA-Z]+))?\s*([a-zA-Z\s]+)?/i);
      if (diceMatch) {
        const dParts = diceMatch[1].replace('+', '').match(/(\d+)d(\d+)/i);
        if (dParts) {
          baseCount = parseInt(dParts[1], 10);
          baseSides = parseInt(dParts[2], 10);
        }
        if (diceMatch[2] && !/per|ft|\//i.test(diceMatch[2])) {
          statKey = diceMatch[2].toLowerCase();
        }
        if (diceMatch[3]) {
          const dt = diceMatch[3].trim().split(/[.,\n]/)[0].trim();
          if (dt && !/base|damage|upgrade/i.test(dt)) damageType = dt;
        }
      } else {
        const simpleDice = rawBaseDamage.match(/(\d+)d(\d+)/i);
        if (simpleDice) {
          baseCount = parseInt(simpleDice[1], 10);
          baseSides = parseInt(simpleDice[2], 10);
        }
      }
    }

    // Ensure statKey is valid ability on this actor
    if (!this.system?.abilities?.[statKey]) {
      statKey = (sys.stat || 'str').toLowerCase();
    }
    const statMod = this.system?.abilities?.[statKey]?.mod ?? 0;

    // Upgrades and Rank Breaks parsing (prioritize structured rankBreaks)
    let extraRankDiceFromBreaks = 0;
    const rankBreakExtraDamageDice = [];
    const targetDebuffsFromBreaks = [];
    const rankBreakBuffs = [];
    const rankBreakNotes = [];
    const processedSkillTiers = new Set();

    if (sys.rankBreaks) {
      const breaks = [
        { thresh: 5, key: 'rank5', data: sys.rankBreaks.rank5, label: 'Rank 5' },
        { thresh: 10, key: 'rank10', data: sys.rankBreaks.rank10, label: 'Rank 10' },
        { thresh: 15, key: 'rank15', data: sys.rankBreaks.rank15, label: 'Rank 15' },
        { thresh: 20, key: 'rank20', data: sys.rankBreaks.rank20, label: 'Rank 20' }
      ];
      for (const b of breaks) {
        if (rank >= b.thresh && b.data) {
          let tierHandled = false;
          if (b.data.damageDice) {
            const cleanDice = b.data.damageDice.replace(/^\+/, '').trim();
            const dm = cleanDice.match(/^(\d+)d(\d+)$/i);
            if (dm && parseInt(dm[2], 10) === baseSides) {
              baseCount += parseInt(dm[1], 10);
              tierHandled = true;
            } else if (cleanDice) {
              rankBreakExtraDamageDice.push(cleanDice);
              tierHandled = true;
            }
          }
          if (b.data.baseDiceCountMod) {
            const m = parseInt(String(b.data.baseDiceCountMod).replace('+', ''), 10);
            if (Number.isFinite(m)) {
              baseCount += m;
              tierHandled = true;
            }
          }
          if (b.data.rankDamageDice) {
            extraRankDiceFromBreaks += Number(b.data.rankDamageDice) || 0;
            tierHandled = true;
          }
          if (b.data.debuff && !targetDebuffsFromBreaks.includes(b.data.debuff)) {
            targetDebuffsFromBreaks.push(b.data.debuff);
            tierHandled = true;
          }
          if (b.data.buffsResistances) {
            rankBreakBuffs.push(`${b.label}: ${b.data.buffsResistances}`);
            tierHandled = true;
          }
          if (b.data.notes) {
            rankBreakNotes.push(`${b.label}: ${b.data.notes}`);
            if (b.thresh === 15) {
              const multMatch = b.data.notes.match(/base damage\s*[×x*]\s*(\d+)/i) || b.data.notes.match(/(\d+)\s*[×x*]\s*base damage/i);
              if (multMatch) {
                baseCount *= parseInt(multMatch[1], 10);
                tierHandled = true;
              }
            }
          }
          if (tierHandled) processedSkillTiers.add(b.key);
        }
      }
    }

    // Secondary fallback: only parse legacy string upgrades if not already handled by structured rankBreaks
    const upgrades = parseUpgrades(sys.upgrades);
    if (rank >= 5 && upgrades.rank5 && !processedSkillTiers.has('rank5')) {
      const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)\s+base damage/i);
      if (u5 && parseInt(u5[2], 10) === baseSides) {
        baseCount += parseInt(u5[1], 10);
      }
    }
    if (rank >= 10 && upgrades.rank10 && !processedSkillTiers.has('rank10')) {
      const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)\s+base damage/i);
      if (u10 && parseInt(u10[2], 10) === baseSides) {
        baseCount += parseInt(u10[1], 10);
      }
    }
    if (rank >= 15 && upgrades.rank15 && !processedSkillTiers.has('rank15')) {
      const u15 = upgrades.rank15.match(/\+(\d+)d(\d+)\s+base damage/i);
      if (u15 && parseInt(u15[2], 10) === baseSides) {
        baseCount += parseInt(u15[1], 10);
      }
      const multMatch = upgrades.rank15.match(/base damage\s*[×x*]\s*(\d+)/i) || upgrades.rank15.match(/(\d+)\s*[×x*]\s*base damage/i);
      if (multMatch) {
        baseCount *= parseInt(multMatch[1], 10);
      }
    }

    // Hand-to-Hand Damage Effects:
    // Unarmed Combat cannot combine with Damage Effects.

    const chosenEffectRaw = (options.damageEffect !== undefined ? options.damageEffect : (options.chosenEffect !== undefined ? options.chosenEffect : options.effect));
    const chosenEffect = typeof chosenEffectRaw === 'string'
      ? chosenEffectRaw.trim()
      : (chosenEffectRaw?.name ? String(chosenEffectRaw.name).trim() : '');
    const isNone = chosenEffect.toLowerCase() === 'none';

    let effectData = null;
    if (!isUnarmed && !isNone) {
      if (chosenEffect) {
        effectData = this.resolveDamageEffect(chosenEffectRaw, skillItem, options);
      } else if (options.ironPunch) {
        effectData = this.resolveDamageEffect('Iron Punch', skillItem, options);
      } else if (isPugilism && chosenEffectRaw === undefined) {
        // Fallback for tests when no effect option was passed
        const ownedIp = this.items ? (this.items.find ? this.items.find(i => i.type === 'skill' && (i.name.toLowerCase() === 'iron punch' || i.system?.tags?.includes('iron_punch'))) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'skill' && (i.name.toLowerCase() === 'iron punch' || i.system?.tags?.includes('iron_punch')))) : null;
        if (ownedIp) {
          effectData = this.resolveDamageEffect(ownedIp, skillItem, options);
        }
      }
    }

    let ironPunchApplied = false;
    let ironPunchRank = 0;
    let powerfulStrikeApplied = false;
    let powerfulStrikeRank = 0;
    let skullcrackerApplied = false;
    let skullcrackerRank = 0;
    let tossApplied = false;
    let smushApplied = false;
    let chokeOutApplied = false;
    let dirtyFightingApplied = false;
    let extraEffectRankDie = null;
    let tossBonus = null;
    const extraDamageParts = [];

    if (effectData) {
      const eName = effectData.lowerName;
      const eRank = effectData.rank;

      // Dynamic Base Dice Count Modification
      if (effectData.baseCountMod) {
        baseCount = evaluateModifier(baseCount, effectData.baseCountMod, eRank);
      }
      for (const mod of effectData.breakCountMods) {
        baseCount = evaluateModifier(baseCount, mod, eRank);
      }

      // Dynamic debuffs from technique / breaks
      for (const d of effectData.debuffs) {
        if (!targetDebuffsFromBreaks.includes(d)) {
          targetDebuffsFromBreaks.push(d);
        }
      }

      // Dynamic Rank Damage Die on the Effect (for effects that grant rank dice like Iron Punch R5+, Skullcracker R10+)
      if (eRank >= 5 && (effectData.extraRankDice > 0 || eName === 'iron punch' || (eName === 'skullcracker' && eRank >= 10))) {
        extraEffectRankDie = getRankDamageDie(eRank);
      }

      // Dynamic Bonus Packet (e.g. Toss or custom damage bonus)
      if (effectData.damageBonus && (eName === 'toss' || !effectData.baseCountMod)) {
        const bonusStatKey = effectData.stat || 'str';
        const bonusStatMod = this.system?.abilities?.[bonusStatKey]?.mod ?? 0;
        tossBonus = {
          type: effectData.damageType || 'Bludgeoning',
          dice: effectData.damageBonus,
          stat: bonusStatKey,
          statMod: bonusStatMod,
          source: effectData.name
        };
      }

      if (effectData.bonusParts?.length > 0 && eName !== 'toss') {
        for (const bp of effectData.bonusParts) {
          extraDamageParts.push({
            id: `effect-bonus-${extraDamageParts.length}`,
            type: bp.type || damageType,
            dice: `${bp.count}d${bp.sides}`,
            source: effectData.name
          });
        }
      }

      // Backward-compatibility flags
      if (eName === 'iron punch') {
        ironPunchApplied = true;
        ironPunchRank = eRank;
      } else if (eName === 'powerful strike') {
        powerfulStrikeApplied = true;
        powerfulStrikeRank = eRank;
      } else if (eName === 'skullcracker') {
        skullcrackerApplied = true;
        skullcrackerRank = eRank;
      } else if (eName === 'toss') {
        tossApplied = true;
      } else if (eName === 'smush') {
        smushApplied = true;
      } else if (eName === 'choke out') {
        chokeOutApplied = true;
      } else if (eName === 'dirty fighting') {
        dirtyFightingApplied = true;
      }
    }

    // Rank Damage Die
    const rankDie = getRankDamageDie(rank);
    if (extraRankDiceFromBreaks > 0 && rankDie.dice) {
      if (rankDie.dice.includes('+')) {
        rankDie.dice = rankDie.dice.replace(/(\d+)d(\d+)/, (_, c, s) => `${parseInt(c, 10) + extraRankDiceFromBreaks}d${s}`);
      } else {
        const dm = rankDie.dice.match(/(\d+)d(\d+)/i);
        if (dm) {
          const total = parseInt(dm[1], 10) + extraRankDiceFromBreaks;
          rankDie.dice = `${total}d${dm[2]}`;
        }
      }
    } else if (extraRankDiceFromBreaks > 0 && rankDie.value > 0) {
      rankDie.value += extraRankDiceFromBreaks;
    }
    const ironPunchRankDie = (ironPunchApplied && ironPunchRank >= 5) ? extraEffectRankDie : null;
    const skullcrackerRankDie = (skullcrackerApplied && skullcrackerRank >= 10) ? extraEffectRankDie : null;

    if (!extraEffectRankDie) {
      extraEffectRankDie = ironPunchRankDie || skullcrackerRankDie;
    }
    let combinedRankDieStr = '';
    if (extraEffectRankDie && extraEffectRankDie.dice && rankDie.dice) {
      const m1 = rankDie.dice.match(/(\d+)d(\d+)/i);
      const m2 = extraEffectRankDie.dice.match(/(\d+)d(\d+)/i);
      if (m1 && m2 && m1[2] === m2[2] && !rankDie.dice.includes('+') && !extraEffectRankDie.dice.includes('+')) {
        const totalRankCount = parseInt(m1[1], 10) + parseInt(m2[1], 10);
        combinedRankDieStr = `${totalRankCount}d${m1[2]}`;
      } else {
        combinedRankDieStr = `${rankDie.dice} + ${extraEffectRankDie.dice}`;
      }
    } else if (extraEffectRankDie && extraEffectRankDie.dice) {
      combinedRankDieStr = extraEffectRankDie.dice;
    } else if (rankDie.dice) {
      combinedRankDieStr = rankDie.dice;
    } else if (rankDie.value > 0) {
      combinedRankDieStr = String(rankDie.value);
    }

    // Fire Fingers Rank 15 Passive Melee Bonus:
    // "Your Pugilism, Unarmed Combat, and Slice Attack strikes add 1 Fire Fingers Rank damage die (Fire)."
    let fireFingersBonus = null;
    const sLowerName = skillName.toLowerCase();
    if (isPugilism || isUnarmed || sLowerName === 'slice attack' || Boolean(sys.tags?.includes('slice_attack'))) {
      const ffSpell = this.items ? (this.items.find ? this.items.find(i => i.type === 'spell' && (i.name.toLowerCase() === 'fire fingers' || i.system?.tags?.includes('fire_fingers'))) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'spell' && (i.name.toLowerCase() === 'fire fingers' || i.system?.tags?.includes('fire_fingers')))) : null;
      const ffRank = Number(ffSpell?.system?.modifiedRank ?? ffSpell?.system?.rank) || 0;
      if (ffRank >= 15) {
        const ffDie = getRankDamageDie(ffRank);
        fireFingersBonus = {
          type: 'Fire',
          dice: ffDie.dice || '1d12',
          value: ffDie.value || 0,
          source: `Fire Fingers (Rank ${ffRank} Passive)`
        };
      }
    }

    // Fallback Toss Effect Bonus if not already created
    if (!tossBonus && tossApplied) {
      tossBonus = {
        type: 'Bludgeoning',
        dice: '1d8',
        stat: 'str',
        statMod: this.system?.abilities?.str?.mod ?? 0,
        source: 'Toss'
      };
    }

    const baseDiceStr = `${baseCount}d${baseSides}`;
    const formulaElements = [baseDiceStr];
    if (combinedRankDieStr) {
      formulaElements.push(combinedRankDieStr);
    }
    for (const d of rankBreakExtraDamageDice) {
      formulaElements.push(d);
    }
    if (tossBonus && tossBonus.dice) {
      formulaElements.push(tossBonus.dice);
    }
    if (fireFingersBonus && (fireFingersBonus.dice || fireFingersBonus.value)) {
      formulaElements.push(fireFingersBonus.dice || String(fireFingersBonus.value));
    }
    if (statKey) {
      formulaElements.push(statMod >= 0 ? `+ ${statMod}` : `- ${Math.abs(statMod)}`);
    }
    const formula = formulaElements.join(' + ').replace(/\+\s*\+/g, '+').replace(/\+\s*-\s*/g, '- ').trim();

    const formulaWithStatElements = [baseDiceStr];
    if (combinedRankDieStr) {
      formulaWithStatElements.push(combinedRankDieStr);
    }
    for (const d of rankBreakExtraDamageDice) {
      formulaWithStatElements.push(d);
    }
    if (tossBonus && tossBonus.dice) {
      formulaWithStatElements.push(`${tossBonus.dice} ${tossBonus.type}`);
    }
    if (statKey) {
      formulaWithStatElements.push(statKey.charAt(0).toUpperCase() + statKey.slice(1));
    }
    let formulaWithStat = `${formulaWithStatElements.join(' + ')} ${damageType}`.trim();
    if (fireFingersBonus && (fireFingersBonus.dice || fireFingersBonus.value)) {
      formulaWithStat += ` + ${fireFingersBonus.dice || fireFingersBonus.value} ${fireFingersBonus.type}`;
    }

    return {
      hasDamage: true,
      skillName,
      rank,
      baseDice: baseDiceStr,
      baseCount,
      baseSides,
      stat: statKey,
      statMod,
      damageType,
      rankDie,
      chosenEffect: isNone ? 'none' : chosenEffect,
      effectData,
      chosenEffectItem: effectData?.item || null,
      extraEffectRankDie,
      ironPunchApplied,
      ironPunchRank,
      ironPunchRankDie,
      powerfulStrikeApplied,
      powerfulStrikeRank,
      skullcrackerApplied,
      skullcrackerRank,
      skullcrackerRankDie,
      tossApplied,
      tossBonus,
      smushApplied,
      chokeOutApplied,
      dirtyFightingApplied,
      combinedRankDieStr,
      extraDamageParts,
      rankDamageDie: combinedRankDieStr || rankDie.dice || '',
      debuff: targetDebuffsFromBreaks[targetDebuffsFromBreaks.length - 1] || '',
      debuffs: targetDebuffsFromBreaks,
      fireFingersBonus,
      formula,
      formulaWithStat,
      targetDebuffs: targetDebuffsFromBreaks,
      rankBreakBuffs,
      rankBreakNotes,
      rawNotes
    };
  }

  /**
   * Resolves associated skills for a weapon or attack item.
   * Classifies skills into the primary combat weapon skill and auxiliary/passive skills.
   * @param {Item|object} attackItem
   * @param {Array<Item>} [availableSkills=null]
   * @returns {{ matchingSkill: Item|null, auxiliarySkills: Array<Item>, skillRank: number, matchedSkills: Array<Item> }}
   */
  _resolveWeaponSkills(attackItem, availableSkills = null) {
    if (!attackItem) return { matchingSkill: null, auxiliarySkills: [], skillRank: 0, matchedSkills: [] };
    const sys = attackItem.system || {};
    const normName = (attackItem.name || '').toLowerCase().trim();
    const skillList = availableSkills || (this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : []);
    const explicitAssociated = Array.isArray(sys.associatedSkills) ? sys.associatedSkills : [];
    const recommended = typeof getRecommendedAssociatedSkills === 'function' ? getRecommendedAssociatedSkills(attackItem, skillList) : [];
    const associated = [...new Set([...explicitAssociated, ...recommended])];

    const attackTags = attackItem.allTags instanceof Set
      ? attackItem.allTags
      : (typeof getItemAllTags === 'function' ? getItemAllTags(attackItem) : new Set(sys.tags || []));

    // Match skills by name, associatedSkills, weaponType, or weapon.* tags
    const matchedSkills = skillList.filter(s => {
      const sName = s.name?.toLowerCase().trim();
      const sId = (s.system?.identifier || '').toLowerCase().trim();
      if (sName === normName) return true;
      if (associated.some(as => {
        const asClean = String(as).toLowerCase().trim();
        return asClean === sName || asClean === sId || asClean === `id.skill.${sId}`;
      })) return true;
      if (sys.weaponType && (sName === sys.weaponType.toLowerCase().trim() || sName.includes(sys.weaponType.toLowerCase().trim()))) return true;
      if (normName.includes(sName)) return true;
      const sTags = s.allTags instanceof Set ? s.allTags : (typeof getItemAllTags === 'function' ? getItemAllTags(s) : new Set(s.system?.tags || []));
      for (const t of attackTags) {
        if (t.startsWith('weapon.') && sTags.has(t)) return true;
      }
      return false;
    });

    if (matchedSkills.length === 0) {
      return { matchingSkill: null, auxiliarySkills: [], skillRank: Number(sys.toHitRank ?? sys.rank) || 0, matchedSkills: [] };
    }

    const isPrimaryCombatSkill = (s) => {
      const sTags = s.allTags instanceof Set ? s.allTags : (typeof getItemAllTags === 'function' ? getItemAllTags(s) : new Set(s.system?.tags || []));
      if (sTags.has('action.passive') || (s.system?.category || '').toLowerCase() === 'passive') return false;
      if (s.system?.isAttack || s.system?.hasDamage || s.system?.baseDamage || sTags.has('action.attack') || (s.system?.category || '').toLowerCase() === 'combat') return true;
      if (sTags.has('rule.requires-weapon')) return true;
      return false;
    };

    // Sort matching skills: selectedSkill -> primary combat -> highest rank
    matchedSkills.sort((a, b) => {
      if (sys.selectedSkill) {
        const sel = sys.selectedSkill.toLowerCase().trim();
        const aSel = a.name.toLowerCase().trim() === sel;
        const bSel = b.name.toLowerCase().trim() === sel;
        if (aSel && !bSel) return -1;
        if (!aSel && bSel) return 1;
      }
      const aCombat = isPrimaryCombatSkill(a);
      const bCombat = isPrimaryCombatSkill(b);
      if (aCombat && !bCombat) return -1;
      if (!aCombat && bCombat) return 1;

      const rA = Math.max(Number(a.system?.modifiedRank) || 0, Number(a.system?.rank) || 0);
      const rB = Math.max(Number(b.system?.modifiedRank) || 0, Number(b.system?.rank) || 0);
      return rB - rA;
    });

    const matchingSkill = matchedSkills.find(isPrimaryCombatSkill) || matchedSkills[0];
    const auxiliarySkills = matchedSkills.filter(s => s.id !== matchingSkill.id);

    let skillRank = 0;
    const mode = sys.proficiencyMode || 'highest';
    const ranks = matchedSkills.map(s => Math.max(Number(s.system?.modifiedRank) || 0, Number(s.system?.rank) || 0));
    if (mode === 'additive') {
      skillRank = ranks.reduce((sum, r) => sum + r, 0);
    } else if (mode === 'primary_plus_half') {
      const sorted = [...ranks].sort((a, b) => b - a);
      const primary = sorted[0] || 0;
      const halfSum = sorted.slice(1).reduce((sum, r) => sum + Math.floor(r / 2), 0);
      skillRank = primary + halfSum;
    } else { // 'highest'
      skillRank = Math.max(Number(matchingSkill.system?.modifiedRank) || 0, Number(matchingSkill.system?.rank) || 0, ...ranks);
    }

    return { matchingSkill, auxiliarySkills, skillRank, matchedSkills };
  }

  /**
   * Resolve all damage parts for an attack from the weapon/attack item itself,
   * equipped gear bonuses, active skill modifiers (with rank gating),
   * and official DCC Rank damage dice.
   * @param {Item} attackItem
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  getAttackDamageParts(attackItem, options = {}) {
    if (attackItem?.type === 'skill') {
      const sData = this.getSkillDamageData(attackItem, options);
      const parts = [];

      // 1. Base damage part
      parts.push({
        id: `skill-base-${attackItem.id || 'part'}`,
        type: sData.damageType || 'Physical',
        dice: sData.baseDice,
        stat: sData.stat,
        statMod: sData.statMod,
        value: 0,
        source: `${sData.skillName} (Base)`
      });

      // 2. Rank damage die
      if (sData.combinedRankDieStr) {
        const isFlat = /^\d+$/.test(sData.combinedRankDieStr);
        parts.push({
          id: `skill-rank-die-${attackItem.id || 'part'}`,
          type: sData.damageType || 'Physical',
          dice: isFlat ? '' : sData.combinedRankDieStr,
          stat: '',
          statMod: 0,
          value: isFlat ? Number(sData.combinedRankDieStr) : 0,
          source: sData.ironPunchApplied && sData.ironPunchRank >= 5
            ? `Rank Die (${sData.skillName} R${sData.rank} + Iron Punch R${sData.ironPunchRank})`
            : `Rank ${sData.rank} Damage Die`
        });
      }

      // 3. Toss bonus damage part
      if (sData.tossBonus) {
        parts.push({
          id: `skill-toss-${attackItem.id || 'part'}`,
          type: sData.tossBonus.type || 'Bludgeoning',
          dice: sData.tossBonus.dice,
          stat: sData.tossBonus.stat,
          statMod: sData.tossBonus.statMod,
          value: 0,
          source: 'Toss'
        });
      }

      // Extra Technique Damage Parts
      for (const ep of (sData.extraDamageParts || [])) {
        parts.push({
          id: ep.id || `skill-extra-${parts.length}`,
          type: ep.type || sData.damageType || 'Physical',
          dice: ep.dice || '',
          stat: ep.stat || '',
          statMod: ep.statMod || 0,
          value: ep.value || 0,
          source: ep.source || 'Technique'
        });
      }

      // 4. Fire Fingers Rank 15 Passive
      if (sData.fireFingersBonus) {
        parts.push({
          id: `fire-fingers-passive-${attackItem.id || 'part'}`,
          type: sData.fireFingersBonus.type,
          dice: sData.fireFingersBonus.dice,
          stat: '',
          statMod: 0,
          value: sData.fireFingersBonus.value,
          source: sData.fireFingersBonus.source
        });
      }

      // 5. Equipped Gear damage parts
      const equippedGear = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'gear' && i.system?.equipped) : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'gear' && i.system?.equipped)) : [];
      for (const gear of equippedGear) {
        if (gear.id === attackItem.id) continue;
        const gearParts = Array.isArray(gear.system?.damageParts) ? gear.system.damageParts : Object.values(gear.system?.damageParts || {});
        for (const gp of gearParts) {
          if (!gp) continue;
          const statKey = (gp.stat || '').toLowerCase();
          const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
          parts.push({
            id: gp.id || `gear-${gear.id}-${parts.length}`,
            type: gp.type || 'Physical',
            dice: (gp.dice || '').trim(),
            stat: statKey,
            statMod,
            value: Number(gp.value) || 0,
            source: gear.name
          });
        }
      }

      // 6. Active Buffs
      const activeBuffs = this.getActiveBuffs();
      for (const buff of activeBuffs) {
        if (!buff) continue;
        const bSys = buff.system || buff;
        const mods = Array.isArray(bSys.damageModifiers) ? bSys.damageModifiers : Object.values(bSys.damageModifiers || {});
        for (const dm of mods) {
          if (!dm) continue;
          const kind = (dm.kind || dm.type || '').toLowerCase();
          if (kind === 'damagebonus' || kind === 'bonus') {
            const statKey = (dm.stat || '').toLowerCase();
            const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
            parts.push({
              id: dm.id || `buff-${buff.id || 'buff'}-${parts.length}`,
              type: dm.damageType || dm.type || 'Physical',
              dice: (dm.dice || '').trim(),
              stat: statKey,
              statMod,
              value: Number(dm.value) || 0,
              source: buff.name
            });
          }
        }
      }

      this._applyTechniquesToDamageParts(parts, options, options.damageEffect || options.effect || '', sData.damageType || 'Physical', attackItem);
      return parts;
    }

    const parts = [];
    const sys = attackItem?.system || {};
    let primaryType = sys.damageType || 'Physical';

    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const { matchingSkill, auxiliarySkills, skillRank, matchedSkills } = this._resolveWeaponSkills(attackItem, skills);

    // Base damage scaling from matching skill rank upgrades & rank breaks
    let upgradedDice = '';
    let extraWeaponRankDiceCount = 0;
    const baseDiceCandidate = matchingSkill?.system?.baseDamage || sys.damageDice || sys.damageParts?.[0]?.dice || '';
    if ((matchingSkill || sys.rankBreaks) && skillRank >= 5) {
      const dm = baseDiceCandidate.match(/(\d+)d(\d+)/i);
      if (dm) {
        let count = parseInt(dm[1], 10);
        const sides = parseInt(dm[2], 10);
        const processedWeaponTiers = new Set();

        // 1. Structured Rank Breaks scaling (primary)
        const rb = matchingSkill?.system?.rankBreaks || sys.rankBreaks;
        if (rb) {
          const breaks = [
            { thresh: 5, key: 'rank5', data: rb.rank5 },
            { thresh: 10, key: 'rank10', data: rb.rank10 },
            { thresh: 15, key: 'rank15', data: rb.rank15 },
            { thresh: 20, key: 'rank20', data: rb.rank20 }
          ];
          for (const b of breaks) {
            if (skillRank >= b.thresh && b.data) {
              let handled = false;
              if (b.data.damageDice) {
                const cleanDice = b.data.damageDice.replace(/^\+/, '').trim();
                const mDice = cleanDice.match(/^(\d+)d(\d+)$/i);
                if (mDice && parseInt(mDice[2], 10) === sides) {
                  count += parseInt(mDice[1], 10);
                  handled = true;
                }
              }
              if (b.data.rankDamageDice) {
                extraWeaponRankDiceCount += Number(b.data.rankDamageDice) || 0;
                handled = true;
              }
              if (handled) processedWeaponTiers.add(b.key);
            }
          }
        }

        // 2. Secondary fallback for legacy upgrades
        const upgrades = parseUpgrades(matchingSkill?.system?.upgrades);
        if (skillRank >= 5 && upgrades.rank5 && !processedWeaponTiers.has('rank5')) {
          const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u5 && parseInt(u5[2], 10) === sides) count += parseInt(u5[1], 10);
        }
        if (skillRank >= 10 && upgrades.rank10 && !processedWeaponTiers.has('rank10')) {
          const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u10 && parseInt(u10[2], 10) === sides) count += parseInt(u10[1], 10);
        }
        if (skillRank >= 15 && upgrades.rank15 && !processedWeaponTiers.has('rank15')) {
          const u15 = upgrades.rank15.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u15 && parseInt(u15[2], 10) === sides) count += parseInt(u15[1], 10);
        }

        upgradedDice = `${count}d${sides}`;
      }
    }

    // 1. If matching skill provides base damage, push it as the primary base damage part
    let hasBaseSkillPart = false;
    if (matchingSkill && (matchingSkill.system?.baseDamage || (!sys.damageParts?.length && !sys.damageDice))) {
      const bDice = upgradedDice || matchingSkill.system?.baseDamage || '';
      if (bDice) {
        const statKey = (matchingSkill.system?.damageStat || matchingSkill.system?.stat || sys.damageStat || 'dex').toLowerCase();
        const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
        primaryType = matchingSkill.system?.damageType || primaryType;
        parts.push({
          id: `skill-base-${matchingSkill.id}`,
          type: primaryType,
          dice: bDice,
          stat: statKey,
          statMod,
          value: 0,
          source: `${matchingSkill.name} (Rank ${skillRank})`
        });
        hasBaseSkillPart = true;
      }
    }

    // 2. Weapon item damageParts (additive parts when matching skill provides base damage, or primary parts if not)
    const rawParts = sys.damageParts || [];
    const itemParts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts);

    if (itemParts.length > 0) {
      let isFirst = !hasBaseSkillPart;
      for (const p of itemParts) {
        if (!p) continue;
        const statKey = (p.stat || '').toLowerCase();
        const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
        const type = p.type || sys.damageType || primaryType;
        if (isFirst) primaryType = type;
        const dice = (isFirst && upgradedDice && !hasBaseSkillPart ? upgradedDice : (p.dice || '')).trim();
        const value = Number(p.value) || 0;
        parts.push({
          id: p.id || `item-part-${parts.length}`,
          type,
          dice,
          stat: statKey,
          statMod,
          value,
          source: attackItem.name || 'Weapon'
        });
        isFirst = false;
      }
    } else if (!hasBaseSkillPart && sys.damageDice) {
      // Legacy fallback: damageDice + damageStat + effects/damageType
      const statKey = (sys.damageStat || 'str').toLowerCase();
      const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
      const dice = (upgradedDice || sys.damageDice).trim();
      const type = sys.damageType || 'Physical';
      primaryType = type;
      parts.push({
        id: 'legacy-base',
        type,
        dice,
        stat: statKey,
        statMod,
        value: 0,
        source: attackItem.name || 'Weapon'
      });
    } else if (!hasBaseSkillPart && (skills.length === 0 || !skills.some(s => (s.system?.damageModifiers?.length > 0 || s.system?.damageParts?.length > 0)))) {
      // Default fallback if no weapon parts, no damage dice, and no skills provide damage
      parts.push({
        id: 'legacy-base',
        type: 'Physical',
        dice: '1d6',
        stat: 'str',
        statMod: this.system?.abilities?.str?.mod ?? 0,
        value: 0,
        source: attackItem.name || 'Weapon'
      });
    }

    // 3. Auxiliary Associated Skill Bonuses (e.g. Aiming)
    const aimingSkill = auxiliarySkills?.find(s => s.name?.toLowerCase().trim() === 'aiming');
    if (aimingSkill) {
      const aRank = Math.max(Number(aimingSkill.system?.modifiedRank) || 0, Number(aimingSkill.system?.rank) || 0);
      let aCount = 1;
      if (aRank >= 15) aCount = 4;
      else if (aRank >= 10) aCount = 3;
      else if (aRank >= 5) aCount = 2;
      parts.push({
        id: `aiming-bonus-${aimingSkill.id}`,
        type: primaryType,
        dice: `${aCount}d4`,
        stat: '',
        statMod: 0,
        value: 0,
        source: `Aiming (Rank ${aRank})`
      });
    }

    // Optional Damage Effects handling for weapon/attack items
    const chosenEffectRaw = (options.damageEffect !== undefined ? options.damageEffect : (options.chosenEffect !== undefined ? options.chosenEffect : options.effect));
    const chosenEffect = typeof chosenEffectRaw === 'string'
      ? chosenEffectRaw.trim()
      : (chosenEffectRaw?.name ? String(chosenEffectRaw.name).trim() : '');
    const isNone = chosenEffect.toLowerCase() === 'none';

    if (chosenEffect && !isNone) {
      const effectData = this.resolveDamageEffect(chosenEffectRaw, attackItem, options);
      if (effectData) {
        const eLower = effectData.lowerName;
        const eRank = effectData.rank;

        // Base Dice Multiplier (e.g. Powerful Strike * @rank)
        const isMultiplierMod = typeof effectData.baseCountMod === 'string' && effectData.baseCountMod.trim().startsWith('*');
        if (isMultiplierMod && parts.length > 0 && parts[0].dice) {
          const m = parts[0].dice.match(/(\d+)d(\d+)/i);
          if (m) {
            const count = evaluateModifier(parseInt(m[1], 10), effectData.baseCountMod, eRank);
            parts[0].dice = `${count}d${m[2]}`;
            parts[0].source = `${parts[0].source} (${effectData.name} R${eRank})`;
          }
        }

        // Damage Bonus packet (e.g. Iron Punch, Toss, Skullcracker, or custom technique)
        if (effectData.damageBonus || effectData.breakCountMods.length > 0 || effectData.breakDamageDice?.length > 0 || effectData.bonusParts?.length > 0) {
          let bDice = effectData.damageBonus;
          if (eLower === 'skullcracker') {
            bDice = eRank >= 5 ? '2d4' : '1d4';
          }
          if (eRank >= 5 && (effectData.extraRankDice > 0 || eLower === 'iron punch')) {
            const rDie = getRankDamageDie(eRank);
            if (rDie.dice) bDice = bDice ? `${bDice} + ${rDie.dice}` : rDie.dice;
          }
          const bStat = effectData.stat;
          const bStatMod = bStat ? (this.system?.abilities?.[bStat]?.mod ?? 0) : 0;
          if (bDice) {
            parts.push({
              id: `effect-${effectData.lowerName.replace(/\s+/g, '-')}-${parts.length}`,
              type: effectData.damageType || primaryType,
              dice: bDice,
              stat: bStat || '',
              statMod: bStatMod,
              value: 0,
              source: `${effectData.name}${eRank > 0 ? ` (Rank ${eRank})` : ''}`
            });
          }
          if (effectData.breakDamageDice?.length > 0 && eLower !== 'skullcracker' && eLower !== 'iron punch') {
            for (const bd of effectData.breakDamageDice) {
              const cleanD = bd.replace(/^\+/, '').trim();
              if (cleanD) {
                parts.push({
                  id: `effect-break-${parts.length}`,
                  type: effectData.damageType || primaryType,
                  dice: cleanD,
                  stat: '',
                  statMod: 0,
                  value: 0,
                  source: `${effectData.name} Rank Break`
                });
              }
            }
          }
        }

        // Skullcracker R10+ Rank Die in parts
        if (eRank >= 10 && eLower === 'skullcracker') {
          const scDie = getRankDamageDie(eRank);
          if (scDie.dice || scDie.value) {
            parts.push({
              id: `effect-skullcracker-rankdie-${parts.length}`,
              type: 'Physical',
              dice: scDie.dice || '',
              stat: '',
              statMod: 0,
              value: scDie.value || 0,
              source: `Skullcracker Rank ${eRank} Die`
            });
          }
        }
      } else {
        const customDiceMatch = chosenEffect.match(/(\+?\d+d\d+)(?:\s+([a-zA-Z]+))?/i);
        if (customDiceMatch) {
          parts.push({
            id: `effect-custom-${parts.length}`,
            type: customDiceMatch[2] || primaryType,
            dice: customDiceMatch[1].replace('+', '').trim(),
            stat: '',
            statMod: 0,
            value: 0,
            source: chosenEffect
          });
        }
      }
    }

    // Rank Damage Die for Weapon Attack
    if (skillRank > 0) {
      const rankDie = getRankDamageDie(skillRank);
      if (extraWeaponRankDiceCount > 0 && rankDie.dice) {
        const dm = rankDie.dice.match(/(\d+)d(\d+)/i);
        if (dm) {
          const total = parseInt(dm[1], 10) + extraWeaponRankDiceCount;
          rankDie.dice = `${total}d${dm[2]}`;
        }
      } else if (extraWeaponRankDiceCount > 0 && rankDie.value > 0) {
        rankDie.value += extraWeaponRankDiceCount;
      }
      if (rankDie.dice || rankDie.value) {
        parts.push({
          id: `rank-die-${attackItem.id || 'atk'}`,
          type: primaryType,
          dice: rankDie.dice,
          stat: '',
          statMod: 0,
          value: rankDie.value,
          source: matchingSkill ? `${matchingSkill.name} (Rank ${skillRank} Die)` : `Rank ${skillRank} Damage Die`
        });
      }
    }

    // Fire Fingers Rank 15 Passive Melee Bonus on Weapon Attack
    const aName = (attackItem.name || '').toLowerCase();
    const mName = (matchingSkill?.name || '').toLowerCase();
    const isMeleeH2H = ['pugilism', 'unarmed combat', 'slice attack'].includes(aName) ||
      Boolean(attackItem.system?.tags?.includes('unarmed')) ||
      ['pugilism', 'unarmed combat', 'slice attack'].includes(mName) ||
      Boolean(matchingSkill?.system?.tags?.includes('unarmed'));
    if (isMeleeH2H) {
      const ffSpell = this.items ? (this.items.find ? this.items.find(i => i.type === 'spell' && (i.name.toLowerCase() === 'fire fingers' || i.system?.tags?.includes('fire_fingers'))) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'spell' && (i.name.toLowerCase() === 'fire fingers' || i.system?.tags?.includes('fire_fingers')))) : null;
      const ffRank = Number(ffSpell?.system?.modifiedRank ?? ffSpell?.system?.rank) || 0;
      if (ffRank >= 15) {
        const ffDie = getRankDamageDie(ffRank);
        parts.push({
          id: 'fire-fingers-passive',
          type: 'Fire',
          dice: ffDie.dice || '1d12',
          stat: '',
          statMod: 0,
          value: ffDie.value || 0,
          source: `Fire Fingers (Rank ${ffRank} Passive)`
        });
      }
    }

    // 2. Equipped Gear damage parts
    const equippedGear = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'gear' && i.system?.equipped) : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'gear' && i.system?.equipped)) : [];
    for (const gear of equippedGear) {
      if (gear.id === attackItem.id) continue;
      const gearParts = Array.isArray(gear.system?.damageParts) ? gear.system.damageParts : Object.values(gear.system?.damageParts || {});
      for (const gp of gearParts) {
        if (!gp) continue;
        const statKey = (gp.stat || '').toLowerCase();
        const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
        parts.push({
          id: gp.id || `gear-${gear.id}-${parts.length}`,
          type: gp.type || 'Physical',
          dice: (gp.dice || '').trim(),
          stat: statKey,
          statMod,
          value: Number(gp.value) || 0,
          source: gear.name
        });
      }
    }

    // 3. Skills: Rank-gated damage bonuses
    for (const skill of skills) {
      if (matchingSkill && skill.id === matchingSkill.id && hasBaseSkillPart) continue;
      if (aimingSkill && skill.id === aimingSkill.id) continue;
      const rank = Math.max(Number(skill.system?.modifiedRank) || 0, Number(skill.system?.rank) || 0);
      const rawMods = (skill.system?.damageModifiers && skill.system.damageModifiers.length > 0)
        ? skill.system.damageModifiers
        : (skill.system?.damageParts || []);
      const mods = Array.isArray(rawMods) ? rawMods : Object.values(rawMods || {});

      for (const m of mods) {
        if (!m) continue;
        const minRank = Number(m.minRank) || 0;
        if (rank >= minRank) {
          const statKey = (m.stat || '').toLowerCase();
          const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
          parts.push({
            id: m.id || `skill-${skill.id}-${parts.length}`,
            type: m.type || m.damageType || 'Physical',
            dice: (m.dice || '').trim(),
            stat: statKey,
            statMod,
            value: Number(m.value) || 0,
            source: `${skill.name} (Rank ${rank})`
          });
        }
      }
    }

    // 4. Buffs: Active Damage Bonuses
    const activeBuffs = this.getActiveBuffs();
    for (const buff of activeBuffs) {
      if (!buff) continue;
      const bSys = buff.system || buff;
      const mods = Array.isArray(bSys.damageModifiers) ? bSys.damageModifiers : Object.values(bSys.damageModifiers || {});
      for (const dm of mods) {
        if (!dm) continue;
        const kind = (dm.kind || dm.type || '').toLowerCase();
        if (kind === 'damagebonus' || kind === 'bonus') {
          const statKey = (dm.stat || '').toLowerCase();
          const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
          parts.push({
            id: dm.id || `buff-${buff.id || 'buff'}-${parts.length}`,
            type: dm.damageType || dm.type || 'Physical',
            dice: (dm.dice || '').trim(),
            stat: statKey,
            statMod,
            value: Number(dm.value) || 0,
            source: buff.name
          });
        }
      }
    }

    this._applyTechniquesToDamageParts(parts, options, chosenEffect, primaryType, attackItem);
    return parts;
  }

  /**
   * Helper alias for resolving weapon damage parts.
   * @param {Item} attackItem
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  _calculateWeaponDamageParts(attackItem, options = {}) {
    return this.getAttackDamageParts(attackItem, options);
  }

  /**
   * Applies primed or active combat technique modifications to attack damage parts.
   * @param {Array<object>} parts
   * @param {object} options
   * @param {string|object} chosenEffect
   * @param {string} primaryType
   * @param {Item|object} [attackItem=null]
   * @private
   */
  _applyTechniquesToDamageParts(parts, options = {}, chosenEffect = '', primaryType = 'Physical', attackItem = null) {
    const activeTechs = options.techniques || (options.includePrimedTechniques !== false && typeof this.getPrimedTechniques === 'function' ? this.getPrimedTechniques() : []);
    if (!Array.isArray(activeTechs) || activeTechs.length === 0) return;

    const effLower = (typeof chosenEffect === 'string' ? chosenEffect : (chosenEffect?.name || '')).toLowerCase();

    for (const tech of activeTechs) {
      if (attackItem && typeof this.isTechniqueApplicable === 'function' && !this.isTechniqueApplicable(tech, attackItem)) {
        continue;
      }
      const normTech = (tech.name || '').toLowerCase().trim();
      if (effLower && effLower.includes(normTech)) continue;

      const effectData = this.resolveDamageEffect(tech.name, null, { effectRank: tech.rank });
      if (effectData) {
        const eLower = effectData.lowerName;
        const eRank = effectData.rank;

        const isMultiplierMod = typeof effectData.baseCountMod === 'string' && effectData.baseCountMod.trim().startsWith('*');
        if (isMultiplierMod && parts.length > 0 && parts[0].dice && !parts[0].source?.includes(effectData.name)) {
          const m = parts[0].dice.match(/(\d+)d(\d+)/i);
          if (m) {
            const count = evaluateModifier(parseInt(m[1], 10), effectData.baseCountMod, eRank);
            parts[0].dice = `${count}d${m[2]}`;
            parts[0].source = `${parts[0].source} (${effectData.name} R${eRank})`;
          }
        } else if (effectData.damageBonus || effectData.breakCountMods.length > 0) {
          let bDice = effectData.damageBonus;
          if (eLower === 'skullcracker') {
            bDice = eRank >= 5 ? '2d4' : '1d4';
          }
          if (eRank >= 5 && (effectData.extraRankDice > 0 || eLower === 'iron punch')) {
            const rDie = getRankDamageDie(eRank);
            if (rDie.dice) bDice = bDice ? `${bDice} + ${rDie.dice}` : rDie.dice;
          }
          const bStat = effectData.stat;
          const bStatMod = bStat ? (this.system?.abilities?.[bStat]?.mod ?? 0) : 0;
          if (bDice) {
            parts.push({
              id: `technique-${effectData.lowerName.replace(/\s+/g, '-')}-${parts.length}`,
              type: effectData.damageType || primaryType,
              dice: bDice,
              stat: bStat || '',
              statMod: bStatMod,
              value: 0,
              source: `${effectData.name} (Rank ${eRank})`
            });
          }
          if (eRank >= 10 && eLower === 'skullcracker') {
            const scDie = getRankDamageDie(eRank);
            if (scDie.dice || scDie.value) {
              parts.push({
                id: `technique-skullcracker-rankdie-${parts.length}`,
                type: 'Physical',
                dice: scDie.dice || '',
                stat: '',
                statMod: 0,
                value: scDie.value || 0,
                source: `Skullcracker Rank ${eRank} Die`
              });
            }
          }
        }
      }
    }
  }

  /**
   * Identifies all owned skills that function as combat techniques / maneuvers.
   * @returns {Array<object>}
   */
  getCombatTechniques() {
    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const techniques = [];

    const PRIMARY_ATTACK_SKILLS = new Set([
      'pugilism',
      'wrasslin',
      "wrasslin'",
      'foot soldier',
      'noggin knocker',
      'noggin nocker',
      'unarmed combat',
      'bite',
      'back claw',
      'slice attack',
      'club',
      'improvised weapons',
      'martial arts'
    ]);

    for (const s of skills) {
      const sys = s.system || {};
      const name = (s.name || '').trim();
      const normName = name.toLowerCase();

      // Explicit Rule: Primary attacks are strictly attacks, NEVER combat techniques
      if (sys.isAttack === true || PRIMARY_ATTACK_SKILLS.has(normName) || sys.isTechnique === false) {
        continue;
      }

      const cType = (sys.checkType || '').toLowerCase();
      
      const isExplicitTech = sys.isTechnique === true || sys.techniqueConfig?.isDamageEffect === true;
      const isDmgEffect = cType.includes('damage effect');
      const KNOWN_MANEUVERS = new Set(['powerful strike', 'dirty fighting', 'iron punch', 'choke out', 'skullcracker', 'toss', 'low blow', 'sneak attack', 'disarm', 'cleave', 'smush']);
      const isKnownManeuver = Boolean(sys.tags?.includes('maneuver')) || Boolean(sys.tags?.includes('technique')) || KNOWN_MANEUVERS.has(normName) || Boolean(DEFAULT_TECHNIQUE_CONFIGS[normName]);

      if (isExplicitTech || isDmgEffect || isKnownManeuver) {
        const rank = Number(s.modifiedRank ?? sys.modifiedRank ?? sys.rank) || 0;
        const isPrimed = this.isTechniquePrimed(s.id);
        
        let summary = '';
        let icon = 'fa-burst';
        let damageBonus = '';
        let debuffName = '';

        if (normName === 'powerful strike' || sys.tags?.includes('powerful_strike')) {
          summary = 'Multiply base dice x Rank';
          icon = 'fa-hand-back-fist';
          damageBonus = '1d6';
        } else if (normName === 'dirty fighting' || sys.tags?.includes('dirty_fighting')) {
          summary = rank >= 10 ? 'Inflict Blinded / Taint' : (rank >= 5 ? 'Inflict Woozy / Taint' : 'Inflict Woozy Debuff');
          icon = 'fa-eye-slash';
          debuffName = rank >= 10 ? 'Blinded' : 'Woozy';
        } else if (normName === 'iron punch' || sys.tags?.includes('iron_punch')) {
          summary = rank >= 10 ? '+1d2 Dmg + Stunned' : (rank >= 5 ? '+1d2 + 1d4 Dmg' : '+1d2 Base Dmg');
          icon = 'fa-shield-halved';
          damageBonus = '1d2';
          if (rank >= 10) debuffName = 'Stunned';
        } else if (normName === 'choke out' || sys.tags?.includes('choke_out')) {
          summary = rank >= 15 ? '8x Total Dmg' : (rank >= 10 ? '4x Total Dmg' : '2x Total Dmg vs <10% HP');
          icon = 'fa-hand-cuffs';
        } else if (normName === 'skullcracker' || sys.tags?.includes('skullcracker')) {
          summary = rank >= 15 ? '+1d4 Dmg + Woozy' : (rank >= 5 ? '+2d4 Base Dmg' : '+1d4 Base Dmg');
          icon = 'fa-skull';
          damageBonus = rank >= 5 ? '2d4' : '1d4';
        } else if (normName === 'toss' || sys.tags?.includes('toss')) {
          summary = '1d8 Dmg + Opposed Throw';
          icon = 'fa-person-falling';
          damageBonus = '1d8';
        } else if (sys.techniqueConfig?.damageBonus || sys.techniqueConfig?.baseDiceCountMod) {
          damageBonus = sys.techniqueConfig.damageBonus || '';
          const countMod = sys.techniqueConfig.baseDiceCountMod ? `Dice: ${sys.techniqueConfig.baseDiceCountMod}` : '';
          summary = [damageBonus ? `+${damageBonus} Dmg` : '', countMod].filter(Boolean).join(' | ');
          if (sys.techniqueConfig.debuffName) {
            debuffName = sys.techniqueConfig.debuffName;
            summary += ` + ${debuffName}`;
          }
        } else if (sys.notes) {
          summary = sys.notes.split('.')[0].trim();
        } else {
          summary = `Rank ${rank} Maneuver`;
        }

        techniques.push({
          id: s.id,
          name,
          rank,
          summary,
          icon,
          isPrimed,
          damageBonus,
          debuffName,
          notes: sys.notes || '',
          system: sys,
          item: s
        });
      }
    }

    return techniques;
  }

  /**
   * Checks if a technique is primed for the next attack.
   * @param {string} techniqueId
   * @returns {boolean}
   */
  isTechniquePrimed(techniqueId) {
    if (typeof this.getFlag !== 'function') return false;
    return Boolean(this.getFlag('carl-rpg', `primed_technique_${techniqueId}`));
  }

  /**
   * Toggles a technique primed state.
   * @param {string} techniqueId
   * @returns {Promise<boolean>}
   */
  async toggleTechniquePrimed(techniqueId) {
    const key = `primed_technique_${techniqueId}`;
    const cur = this.isTechniquePrimed(techniqueId);
    if (typeof this.setFlag === 'function') {
      await this.setFlag('carl-rpg', key, !cur);
    }
    return !cur;
  }

  /**
   * Returns all currently primed combat techniques.
   * @returns {Array<object>}
   */
  getPrimedTechniques() {
    return this.getCombatTechniques().filter(t => t.isPrimed);
  }

  /**
   * Clears all primed combat techniques.
   * @returns {Promise<void>}
   */
  async clearPrimedTechniques() {
    const techs = this.getCombatTechniques();
    for (const t of techs) {
      if (t.isPrimed) {
        if (typeof this.unsetFlag === 'function') {
          await this.unsetFlag('carl-rpg', `primed_technique_${t.id}`);
        } else if (typeof this.setFlag === 'function') {
          await this.setFlag('carl-rpg', `primed_technique_${t.id}`, false);
        }
      }
    }
  }

  /**
   * Generates synthesized attack profiles combining equipped weapons and combat skills.
   * Ensures offline players (via PDF) and VTT players have a complete, unified attack roster.
   * @returns {Array<object>}
   */
  getSynthesizedAttacks() {
    const attacks = [];
    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const primedTechs = this.getCombatTechniques().filter(t => t.isPrimed);

    // 1. Equipped Weapons and Dedicated Attack items
    const rawAttacks = this.items ? (this.items.filter ? this.items.filter(i => (i.type === 'attack' && i.system?.equipped !== false) || (i.type === 'gear' && isWeaponGear(i) && i.system?.equipped)) : Array.from(this.items.values?.() || this.items).filter(i => (i.type === 'attack' && i.system?.equipped !== false) || (i.type === 'gear' && isWeaponGear(i) && i.system?.equipped))) : [];

    for (const item of rawAttacks) {
      const applicableTechs = primedTechs.filter(t => this.isTechniqueApplicable(t, item));
      const profile = this._buildWeaponAttackProfile(item, skills, applicableTechs);
      if (profile) attacks.push(profile);
    }

    // 2. Unarmed / Combat Strike Skills (that function as primary attacks without requiring weapon gear)
    const KNOWN_UNARMED = new Set([
      'pugilism', 'unarmed combat', 'wrasslin', "wrasslin'", 'foot soldier', 'noggin knocker', 'noggin nocker',
      'bite', 'back claw', 'slice attack', 'club', 'improvised weapons', 'martial arts'
    ]);

    const attackSkills = skills.filter(s => {
      const sys = s.system || {};
      if (sys.isTechnique || sys.techniqueConfig?.isDamageEffect) return false;
      const cType = (sys.checkType || '').toLowerCase();
      if (cType.includes('damage effect') || cType.includes('passive')) return false;

      const sTags = s.allTags instanceof Set
        ? s.allTags
        : (typeof getItemAllTags === 'function' ? getItemAllTags(s) : new Set(sys.tags || []));
      if (sTags.has('action.passive')) return false;

      // A skill requiring an equipped weapon cannot function as an unarmed attack
      const requiresWeapon = sys.requiresWeapon === true ||
        sTags.has('rule.requires-weapon') ||
        (Array.from(sTags).some(t => t.startsWith('weapon.')) && !sTags.has('weaponClass.unarmed') && !sTags.has('weaponClass.natural')) ||
        (['ranged', 'edge', 'reach'].includes((sys.skillType || sys.type || '').toLowerCase()) && !sTags.has('weaponClass.unarmed') && !sTags.has('weaponClass.natural'));
      if (requiresWeapon) return false;

      const normName = s.name.toLowerCase().trim();
      const KNOWN_MANEUVERS = new Set(['powerful strike', 'dirty fighting', 'iron punch', 'choke out', 'skullcracker', 'toss', 'low blow', 'sneak attack', 'disarm', 'cleave', 'smush']);
      if (KNOWN_MANEUVERS.has(normName) || sTags.has('kind.technique') || Boolean(sys.tags?.includes('maneuver')) || Boolean(sys.tags?.includes('technique')) || Boolean(DEFAULT_TECHNIQUE_CONFIGS[normName])) return false;

      const isKnownUnarmed = KNOWN_UNARMED.has(normName) || sTags.has('weaponClass.unarmed') || Boolean(sys.tags?.includes('unarmed'));
      const isKnownAttack = isKnownUnarmed || sTags.has('action.attack') || Boolean(sys.tags?.includes('attack'));

      if (sys.isAttack === false && !isKnownAttack) return false;

      const dmgData = typeof this.getSkillDamageData === 'function' ? this.getSkillDamageData(s) : { hasDamage: false };
      const sType = (sys.skillType || sys.type || '').toLowerCase();
      const isCombatType = ['strike', 'bashing', 'hand to hand', 'edge', 'reach', 'ranged'].includes(sType);

      if (sys.isAttack === true || isKnownAttack) return true;
      return dmgData.hasDamage && (isKnownUnarmed || cType.includes('attack') || isCombatType);
    });

    for (const skill of attackSkills) {
      const normSkill = skill.name.toLowerCase().trim();
      if (attacks.some(a => a.name.toLowerCase() === normSkill || a.displayName?.toLowerCase() === normSkill || a.matchingSkillName?.toLowerCase() === normSkill)) continue;
      const applicableTechs = primedTechs.filter(t => this.isTechniqueApplicable(t, skill));
      const profile = this._buildSkillAttackProfile(skill, applicableTechs);
      if (profile) attacks.push(profile);
    }

    return attacks;
  }

  _buildWeaponAttackProfile(item, skills = (this.items?.filter(i => i.type === 'skill') || []), primedTechs = []) {
    const sys = item.system || {};
    const normName = (item.name || '').toLowerCase().trim();
    const isGear = item.type === 'gear';
    const skillList = Array.isArray(skills) ? skills : (this.items?.filter(i => i.type === 'skill') || []);
    const { matchingSkill, auxiliarySkills, skillRank } = this._resolveWeaponSkills(item, skillList);

    const rawParts = sys.damageParts;
    const parts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts || {});
    const primaryPart = parts[0] || null;

    let toHitStat = sys.toHitStat;
    if (!toHitStat) {
      if (matchingSkill?.system?.stat) {
        toHitStat = matchingSkill.system.stat;
      } else if (isGear && primaryPart?.stat) {
        toHitStat = primaryPart.stat;
      } else {
        toHitStat = isGear ? 'str' : 'dex';
      }
    }
    const statMod = this.system?.abilities?.[toHitStat.toLowerCase()]?.mod ?? 0;
    const toHitMod = skillRank + statMod;
    const displayToHitStat = toHitStat.toUpperCase();
    const displayToHitRank = skillRank;
    const displayToHit = `${displayToHitStat} (${skillRank})`;

    const isUntrained = this.type === 'mob' ? false : (skillRank <= 0);
    const isOneHandedPenalty = (sys.wieldMode === 'two_handed_disadv_1h' && (sys.hands === 1 || sys.wieldMode === 'one_handed' || sys.oneHanded));
    let baseDieStr = '1d20';
    let advMode = 'normal';
    if (typeof this.getRollAdvantageState === 'function') {
      const advState = this.getRollAdvantageState({
        rollType: 'attack',
        stat: toHitStat,
        item,
        isUntrained,
        isOneHandedPenalty,
        tags: [sys.weaponCategory, sys.weaponType, sys.slot].filter(Boolean)
      });
      baseDieStr = advState?.formula || (isUntrained ? '2d20kl' : '1d20');
      advMode = advState?.mode || 'normal';
    } else if (isUntrained || isOneHandedPenalty) {
      baseDieStr = '2d20kl';
      advMode = 'disadvantage';
    }

    const aimingAux = auxiliarySkills?.find(s => s.name?.toLowerCase().trim() === 'aiming');
    let aimingBonus = 0;
    if (advMode === 'disadvantage' && aimingAux) {
      aimingBonus = Math.max(Number(aimingAux.system?.modifiedRank) || 0, Number(aimingAux.system?.rank) || 0);
    }

    const totalToHit = isUntrained ? statMod : (toHitMod + aimingBonus);
    let toHitFormula = '';
    if (totalToHit > 0) {
      toHitFormula = `${baseDieStr} + ${totalToHit}`;
    } else if (totalToHit < 0) {
      toHitFormula = `${baseDieStr} - ${Math.abs(totalToHit)}`;
    } else {
      toHitFormula = baseDieStr;
    }

    // Base damage and rank damage die
    let baseDice = '';
    let dmgType = 'Physical';
    if (matchingSkill?.system?.baseDamage) {
      baseDice = matchingSkill.system.baseDamage;
      dmgType = matchingSkill.system.damageType || primaryPart?.type || sys.damageType || 'Physical';
    } else if (primaryPart) {
      baseDice = primaryPart.dice || '1d6';
      dmgType = primaryPart.type || 'Physical';
    } else {
      baseDice = sys.damageDice || '1d6';
      dmgType = sys.damageType || 'Physical';
    }

    const rankDie = skillRank > 0 ? getRankDamageDie(skillRank).dice : '';
    let combinedDice = baseDice;
    if (rankDie) {
      combinedDice = `${baseDice} + ${rankDie}`;
    }

    // Rank break extra dice
    const activeRankBreaks = matchingSkill?.system?.rankBreaks || sys.rankBreaks;
    if (activeRankBreaks) {
      if (skillRank >= 5 && activeRankBreaks.rank5?.damageDice) combinedDice += ` + ${activeRankBreaks.rank5.damageDice.replace(/^\+/, '')}`;
      if (skillRank >= 10 && activeRankBreaks.rank10?.damageDice) combinedDice += ` + ${activeRankBreaks.rank10.damageDice.replace(/^\+/, '')}`;
      if (skillRank >= 15 && activeRankBreaks.rank15?.damageDice) combinedDice += ` + ${activeRankBreaks.rank15.damageDice.replace(/^\+/, '')}`;
      if (skillRank >= 20 && activeRankBreaks.rank20?.damageDice) combinedDice += ` + ${activeRankBreaks.rank20.damageDice.replace(/^\+/, '')}`;
    }

    // Include extra weapon damage parts additively
    const extraParts = (matchingSkill?.system?.baseDamage && parts.length > 0) ? parts : parts.slice(1);
    for (const ep of extraParts) {
      if (ep?.dice) {
        combinedDice += ` + ${ep.dice}${ep.type ? ` ${ep.type}` : ''}`;
      }
    }

    const applicableTechs = primedTechs.filter(t => this.isTechniqueApplicable(t, item));
    let activeEffect = (sys.selectedEffect && sys.selectedEffect !== 'none') ? sys.selectedEffect : null;
    if (!activeEffect && applicableTechs.length > 0) {
      activeEffect = applicableTechs[0].name;
    }

    let techniqueBonusDice = '';
    if (activeEffect) {
      const effectData = this.resolveDamageEffect(activeEffect, item);
      if (effectData?.damageBonus) {
        techniqueBonusDice = `+ ${effectData.damageBonus} [${effectData.name}]`;
      }
    } else {
      for (const tech of applicableTechs) {
        if (tech.damageBonus) {
          techniqueBonusDice += `+ ${tech.damageBonus} [${tech.name}] `;
        }
      }
      techniqueBonusDice = techniqueBonusDice.trim();
    }

    const dmgStatKey = (primaryPart?.stat || matchingSkill?.system?.damageStat || matchingSkill?.system?.stat || sys.damageStat || toHitStat).toLowerCase();
    const dmgStatMod = this.system?.abilities?.[dmgStatKey]?.mod ?? 0;
    const displayDmgMod = dmgStatMod >= 0 ? `+${dmgStatMod}` : `${dmgStatMod}`;
    const typeStr = dmgType ? ` (${dmgType})` : '';
    const extraPartsCount = (matchingSkill?.system?.baseDamage && parts.length > 0) ? parts.length : (parts.length > 1 ? parts.length - 1 : 0);
    const extra = extraPartsCount > 0 ? ` (+${extraPartsCount} part${extraPartsCount > 1 ? 's' : ''})` : '';

    const formulaTokens = [baseDice];
    if (rankDie) {
      formulaTokens.push(rankDie.replace(/^\+/, '').trim());
    }
    if (techniqueBonusDice) {
      formulaTokens.push(techniqueBonusDice.replace(/^\s*\+\s*/, '').trim());
    }
    if (dmgStatKey) {
      formulaTokens.push(dmgStatKey.toUpperCase());
    }
    const cleanFormula = formulaTokens.join(' + ')
      .replace(/\+\s*\+/g, '+')
      .replace(/\+\s*-\s*/g, '- ')
      .trim();
    const displayDamage = `${cleanFormula}${typeStr}${extra}`;

    const critMult = (skillRank >= 15 && matchingSkill?.system?.critMultiplierR15) ? matchingSkill.system.critMultiplierR15
      : ((skillRank >= 5 && matchingSkill?.system?.critMultiplierR5) ? matchingSkill.system.critMultiplierR5 : (sys.critMultiplier !== undefined ? Number(sys.critMultiplier) : 2));
    let effects = sys.effects || sys.notes || '';
    if (critMult > 1) {
      effects = effects ? `${critMult}x Crit (R${skillRank >= 15 ? 15 : 5}). ${effects}` : `${critMult}x Crit (R${skillRank >= 15 ? 15 : 5})`;
    }

    return {
      id: item.id,
      item,
      system: sys,
      name: item.name,
      displayName: matchingSkill && matchingSkill.name.toLowerCase() !== normName ? `${item.name} (${matchingSkill.name})` : item.name,
      matchingSkillName: matchingSkill ? matchingSkill.name : '',
      isSkillAttack: false,
      isWeaponGear: isGear,
      isSynthetic: false,
      isEquipped: true,
      skillRank,
      toHitStat,
      statMod,
      toHitMod,
      toHitFormula,
      displayToHitFormula: toHitFormula,
      displayToHitStat,
      displayToHitRank,
      displayToHit,
      baseDice,
      rankDamageDie: rankDie,
      combinedDice,
      dmgStat: dmgStatKey,
      dmgStatMod,
      displayDmgMod,
      displayDamage,
      damageType: dmgType,
      effects,
      displayEffects: effects,
      validDamageEffects: typeof this.getValidDamageEffects === 'function' ? this.getValidDamageEffects(item) : [],
      selectableDamageEffects: typeof this.getSelectableDamageEffects === 'function' ? this.getSelectableDamageEffects(item) : [],
      hasOptionalEffects: (typeof this.getValidDamageEffects === 'function' ? this.getValidDamageEffects(item).length > 0 : false),
      selectedEffect: activeEffect || sys.selectedEffect || 'none',
      favorBonus: DAMAGE_EFFECT_AI_FAVOR[normName] || 0,
      primedTechniquesCount: applicableTechs.length
    };
  }

  _buildSkillAttackProfile(skill, primedTechs = []) {
    const sys = skill.system || {};
    const rank = Math.max(Number(skill.modifiedRank) || 0, Number(sys.modifiedRank) || 0, Number(sys.rank) || 0);
    const dmgData = typeof this.getSkillDamageData === 'function' ? this.getSkillDamageData(skill) : { hasDamage: false };

    const normName = skill.name.toLowerCase().trim();
    const isPugilism = normName === 'pugilism';
    const isWrasslin = normName === 'wrasslin' || normName === "wrasslin'";
    const isNogginKnocker = normName === 'noggin knocker' || normName === 'noggin nocker';
    const isFootSoldier = normName === 'foot soldier';
    const toHitStat = (sys.toHitStat || (isPugilism ? 'dex' : (sys.stat || 'str'))).toLowerCase();
    const statMod = this.system?.abilities?.[toHitStat]?.mod ?? 0;
    const toHitMod = rank + statMod;
    const displayToHitStat = toHitStat.toUpperCase();
    const displayToHitRank = rank;
    const displayToHit = `${displayToHitStat} (${rank})`;

    const isUntrained = this.type === 'mob' ? false : (rank <= 0);
    let baseDieStr = '1d20';
    if (typeof this.getRollAdvantageState === 'function') {
      const advState = this.getRollAdvantageState({
        rollType: 'attack',
        stat: toHitStat,
        item: skill,
        isUntrained
      });
      baseDieStr = advState?.formula || (isUntrained ? '2d20kl' : '1d20');
    } else if (isUntrained) {
      baseDieStr = '2d20kl';
    }

    const totalToHit = isUntrained ? statMod : toHitMod;
    let toHitFormula = '';
    if (totalToHit > 0) {
      toHitFormula = `${baseDieStr} + ${totalToHit}`;
    } else if (totalToHit < 0) {
      toHitFormula = `${baseDieStr} - ${Math.abs(totalToHit)}`;
    } else {
      toHitFormula = baseDieStr;
    }

    const applicableTechs = primedTechs.filter(t => this.isTechniqueApplicable(t, skill));
    let activeEffect = (sys.selectedEffect && sys.selectedEffect !== 'none') ? sys.selectedEffect : null;
    if (!activeEffect && applicableTechs.length > 0) {
      activeEffect = applicableTechs[0].name;
    }

    let techniqueBonusDice = '';
    if (activeEffect) {
      const effectData = this.resolveDamageEffect(activeEffect, skill);
      if (effectData?.damageBonus) {
        techniqueBonusDice = `+ ${effectData.damageBonus} [${effectData.name}]`;
      }
    } else {
      for (const tech of applicableTechs) {
        if (tech.damageBonus) {
          techniqueBonusDice += `+ ${tech.damageBonus} [${tech.name}] `;
        }
      }
      techniqueBonusDice = techniqueBonusDice.trim();
    }

    let baseDicePart = '';
    if (isPugilism && (!sys.baseDamage || !sys.notes?.includes('Base Damage'))) {
      let diceCount = 1;
      if (rank >= 15) diceCount = 5;
      else if (rank >= 10) diceCount = 4;
      else if (rank >= 5) diceCount = 3;
      baseDicePart = `${diceCount}d2`;
    } else {
      baseDicePart = dmgData.baseDice || (isPugilism ? (rank >= 5 ? '3d2' : '1d2') : '1d4');
    }

    let rankDiePart = dmgData.rankDamageDie || getRankDamageDie(rank).dice;

    const dmgStatKey = (isNogginKnocker ? (sys.damageStat || 'con') : (isPugilism ? (sys.damageStat || 'str') : (dmgData.stat || sys.damageStat || sys.stat || 'str'))).toLowerCase();
    const dmgStatMod = this.system?.abilities?.[dmgStatKey]?.mod ?? 0;
    const displayDmgMod = dmgStatMod >= 0 ? `+${dmgStatMod}` : `${dmgStatMod}`;
    const damageType = dmgData.damageType || sys.damageType || (isPugilism || isWrasslin ? 'Bludgeoning' : 'Physical');

    const formulaTokens = [baseDicePart];
    if (rankDiePart) {
      formulaTokens.push(rankDiePart.replace(/^\+/, '').trim());
    }
    if (techniqueBonusDice) {
      formulaTokens.push(techniqueBonusDice.replace(/^\s*\+\s*/, '').trim());
    }
    if (dmgStatMod !== 0) {
      formulaTokens.push(String(dmgStatMod));
    }

    const cleanFormula = formulaTokens.join(' + ')
      .replace(/\+\s*\+/g, '+')
      .replace(/\+\s*-\s*/g, '- ')
      .trim();
    const displayDamage = `${cleanFormula} (${damageType})`;

    const critMult = (rank >= 15 && sys.critMultiplierR15) ? sys.critMultiplierR15
      : ((rank >= 5 && sys.critMultiplierR5) ? sys.critMultiplierR5 : (rank >= 5 ? 4 : 2));

    let effects = sys.notes || '';
    if (critMult > 2) {
      effects = `${critMult}x Crit (R${rank >= 15 ? 15 : 5}). ${effects}`;
    }

    const validEffects = typeof this.getValidDamageEffects === 'function' ? this.getValidDamageEffects(skill) : [];
    const attackName = isPugilism ? `${skill.name} (Unarmed)` : skill.name;

    return {
      id: skill.id,
      item: skill,
      system: sys,
      name: attackName,
      displayName: attackName,
      matchingSkillName: skill.name,
      isSkillAttack: true,
      isWeaponGear: false,
      isSynthetic: true,
      isEquipped: true,
      skillRank: rank,
      toHitStat,
      statMod,
      toHitMod,
      toHitFormula,
      displayToHitFormula: toHitFormula,
      displayToHitStat,
      displayToHitRank,
      displayToHit,
      baseDice: baseDicePart,
      rankDamageDie: rankDiePart,
      combinedDice: rankDiePart ? `${baseDicePart} + ${rankDiePart}` : baseDicePart,
      dmgStat: dmgStatKey,
      dmgStatMod,
      displayDmgMod,
      displayDamage,
      damageType,
      effects,
      displayEffects: effects,
      validDamageEffects: validEffects,
      selectableDamageEffects: typeof this.getSelectableDamageEffects === 'function' ? this.getSelectableDamageEffects(skill) : validEffects,
      hasOptionalEffects: validEffects.length > 0,
      selectedEffect: activeEffect || sys.selectedEffect || 'none',
      favorBonus: DAMAGE_EFFECT_AI_FAVOR[normName] || 0,
      primedTechniquesCount: applicableTechs.length
    };
  }

  /**
   * Evaluate Advantage and Disadvantage state for a given roll.
   * Checks options, active buffs (external + embedded), active debuffs,
   * canonical conditions, untrained status, and weapon wield penalties.
   * Cancels out if both advantage and disadvantage are present.
   *
   * @param {object} context
   * @param {string} context.rollType - 'attack' | 'spell' | 'skill' | 'stat'
   * @param {string} [context.stat] - 'str' | 'dex' | 'con' | 'int' | 'cha'
   * @param {object} [context.item] - Item document or payload
   * @param {boolean} [context.isUntrained=false]
   * @param {boolean} [context.isOneHandedPenalty=false]
   * @param {object} [context.options={}] - User roll options (options.advantage, options.disadvantage)
   * @param {Array<string>} [context.tags=[]]
   * @returns {{ mode: 'advantage'|'disadvantage'|'cancelled'|'normal', formula: string, label: string|null, reasons: Array<string> }}
   */
  getRollAdvantageState(context = {}) {
    const rollType = (context.rollType || '').toLowerCase();
    const stat = (context.stat || '').toLowerCase();
    const item = context.item || null;
    const itemSys = item?.system || {};
    const options = context.options || {};
    const tags = Array.isArray(context.tags) ? context.tags.map(t => String(t).toLowerCase()) : [];

    const advantages = [];
    const disadvantages = [];

    // Helper: test if a list of affected targets matches this roll's context
    const matchesScope = (affectsList) => {
      if (!Array.isArray(affectsList) || affectsList.length === 0) return false;
      const lowerList = affectsList.map(a => String(a).toLowerCase().trim());
      if (lowerList.includes('all') || lowerList.includes('all_rolls') || lowerList.includes('any')) return true;

      // Match rollType (supports singular and plural e.g. 'attack' and 'attacks')
      if (rollType) {
        if (lowerList.includes(rollType)) return true;
        if (lowerList.includes(`${rollType}s`)) return true;
        if (rollType.endsWith('s') && lowerList.includes(rollType.slice(0, -1))) return true;
      }

      // Match stat
      if (stat && lowerList.includes(stat)) return true;

      // Match item name
      if (item?.name && lowerList.includes(item.name.toLowerCase().trim())) return true;

      // Match weapon category or type
      if (itemSys.weaponCategory && lowerList.includes(itemSys.weaponCategory.toLowerCase().trim())) return true;
      if (itemSys.weaponType && lowerList.includes(itemSys.weaponType.toLowerCase().trim())) return true;

      // Match tags
      for (const t of tags) {
        if (lowerList.includes(t)) return true;
      }

      return false;
    };

    // 1. Manual Option Overrides
    if (options.advantage === true) {
      advantages.push('Advantage (Manual Selection)');
    }
    if (options.disadvantage === true) {
      disadvantages.push('Disadvantage (Manual Selection)');
    }

    // 2. Untrained penalty
    if (context.isUntrained === true) {
      disadvantages.push('Untrained Check');
    }

    // 3. One-Handed penalty for two-handed weapons
    if (context.isOneHandedPenalty === true) {
      disadvantages.push('One-Handed Disadvantage');
    }

    // 4. Item specific limitations (e.g. spells with "Disadvantage" in limitations)
    if (itemSys.limitations && typeof itemSys.limitations === 'string' && itemSys.limitations.toLowerCase().includes('disadvantage')) {
      disadvantages.push(`${item.name} Limitation`);
    }

    // 5. Active Buffs (External Buff slots + Embedded Buff Items)
    const activeBuffs = [];
    if (this.items) {
      const itemsList = this.items.filter ? this.items.filter(i => i.type === 'buff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'buff');
      for (const b of itemsList) {
        if (b.system?.active !== false) activeBuffs.push(b);
      }
    }
    if (typeof this.getActiveBuffs === 'function') {
      const ext = this.getActiveBuffs();
      for (const b of ext) {
        if (!activeBuffs.some(ab => (ab.id && ab.id === b.id) || ab.name.toLowerCase() === b.name.toLowerCase())) {
          activeBuffs.push(b);
        }
      }
    }

    for (const buff of activeBuffs) {
      const bSys = buff.system || {};
      const bName = (buff.name || '').toLowerCase().trim();
      const canon = CANONICAL_CONDITION_ROLL_MODIFIERS?.[bName];

      const mode = (bSys.rollModifierMode && bSys.rollModifierMode !== 'none')
        ? bSys.rollModifierMode.toLowerCase()
        : (canon?.mode || (bSys.buffType === 'roll' ? 'advantage' : 'none'));

      const affects = (Array.isArray(bSys.affects) && bSys.affects.length > 0)
        ? bSys.affects
        : (Array.isArray(bSys.advantageTargets) && bSys.advantageTargets.length > 0
            ? bSys.advantageTargets
            : (canon?.affects || (mode !== 'none' ? ['all'] : [])));

      if (mode === 'advantage' && matchesScope(affects)) {
        advantages.push(`Buff: ${buff.name}`);
      } else if (mode === 'disadvantage' && matchesScope(affects)) {
        disadvantages.push(`Buff: ${buff.name}`);
      }
    }

    // 6. Active Debuffs (Embedded Debuff Items + Actor Condition List)
    const activeDebuffs = [];
    if (this.items) {
      const debuffsList = this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff');
      for (const d of debuffsList) {
        if (d.system?.active !== false) activeDebuffs.push(d);
      }
    }

    const rawDebuffs = this.system?.attributes?.debuffs;
    if (rawDebuffs) {
      const debuffNames = Array.isArray(rawDebuffs)
        ? rawDebuffs
        : (typeof rawDebuffs === 'string' ? rawDebuffs.split(',').map(s => s.trim()).filter(Boolean) : []);
      for (const dName of debuffNames) {
        if (!activeDebuffs.some(ad => ad.name.toLowerCase() === dName.toLowerCase())) {
          activeDebuffs.push({ name: dName, system: {} });
        }
      }
    }

    for (const debuff of activeDebuffs) {
      const dSys = debuff.system || {};
      const dName = (debuff.name || '').toLowerCase().trim();
      const canon = CANONICAL_CONDITION_ROLL_MODIFIERS?.[dName];

      const mode = (dSys.rollModifierMode && dSys.rollModifierMode !== 'none')
        ? dSys.rollModifierMode.toLowerCase()
        : (canon?.mode || 'disadvantage');

      const affects = (Array.isArray(dSys.affects) && dSys.affects.length > 0)
        ? dSys.affects
        : (Array.isArray(dSys.disadvantageTargets) && dSys.disadvantageTargets.length > 0
            ? dSys.disadvantageTargets
            : (canon?.affects || (mode !== 'none' ? ['all'] : [])));

      if (mode === 'disadvantage' && matchesScope(affects)) {
        disadvantages.push(`Debuff: ${debuff.name}`);
      } else if (mode === 'advantage' && matchesScope(affects)) {
        advantages.push(`Debuff: ${debuff.name}`);
      }
    }

    // 7. Resolve Combination & Cancellation
    if (advantages.length > 0 && disadvantages.length === 0) {
      return {
        mode: 'advantage',
        formula: '2d20kh',
        label: `Advantage (${advantages.join(', ')})`,
        reasons: advantages
      };
    } else if (advantages.length === 0 && disadvantages.length > 0) {
      return {
        mode: 'disadvantage',
        formula: '2d20kl',
        label: `Disadvantage (${disadvantages.join(', ')})`,
        reasons: disadvantages
      };
    } else if (advantages.length > 0 && disadvantages.length > 0) {
      return {
        mode: 'cancelled',
        formula: '1d20',
        label: `Cancelled (Advantage: ${advantages.join(', ')} vs Disadvantage: ${disadvantages.join(', ')})`,
        reasons: [...advantages, ...disadvantages]
      };
    } else {
      return {
        mode: 'normal',
        formula: '1d20',
        label: null,
        reasons: []
      };
    }
  }

  /**
   * Roll Attack: To-Hit and Multi-Typed Damage
   * @param {Item} attackItem
   * @param {'hit'|'damage'} type
   * @param {object} [options={}]
   */
  async rollAttack(attackItem, type = 'hit', options = {}) {
    if (attackItem.type === 'spell') {
      if (type === 'damage') {
        return this.rollSpellDamage(attackItem);
      }
      return this.rollSpellAttack(attackItem);
    }

    // Check for optional damage effects on attack or skill
    const validEffects = this.getValidDamageEffects(attackItem);
    let chosenEffect = options.damageEffect !== undefined
      ? options.damageEffect
      : (options.effect !== undefined
          ? options.effect
          : (attackItem.system?.selectedEffect || null));

    if (chosenEffect === null && validEffects && validEffects.length > 0 && !options.skipDialog) {
      chosenEffect = await this.promptDamageEffectDialog(attackItem, options);
      if (chosenEffect === null) {
        // User cancelled dialog
        return null;
      }
    }

    const currentOptions = { ...options, damageEffect: chosenEffect };
    const normName = (attackItem.name || '').toLowerCase().trim();
    const favorBonus = DAMAGE_EFFECT_AI_FAVOR[normName] || 0;

    const sys = attackItem.system || {};
    if (type === 'hit') {
      let toHitStat = 'dex';
      let rank = 0;

      if (attackItem.type === 'skill') {
        const checkType = (sys.checkType || '').toLowerCase();
        const statMatch = checkType.match(/,\s*([a-zA-Z]+)/);
        toHitStat = statMatch ? statMatch[1].toLowerCase() : (sys.stat || 'str').toLowerCase();
        rank = Number(attackItem.modifiedRank ?? sys.modifiedRank ?? attackItem.effectiveRank ?? sys.rank) || 0;
        if (typeof attackItem.update === 'function' && !attackItem.system?.checked) {
          attackItem.update({ 'system.checked': true }).catch(() => {});
        }
      } else {
        const { matchingSkill, auxiliarySkills, skillRank, matchedSkills } = this._resolveWeaponSkills(attackItem);
        rank = skillRank;

        const primaryPart = Array.isArray(sys.damageParts) ? sys.damageParts[0] : Object.values(sys.damageParts || {})[0];
        toHitStat = (sys.toHitStat || matchingSkill?.system?.stat || primaryPart?.stat || (attackItem.type === 'gear' ? 'str' : 'dex')).toLowerCase();

        for (const s of matchedSkills) {
          if (typeof s.update === 'function' && !s.system?.checked) {
            s.update({ 'system.checked': true }).catch(() => {});
          }
        }
      }

      const statMod = this.system.abilities?.[toHitStat]?.mod ?? 0;
      const isUntrained = this.type === 'mob' ? false : (rank <= 0);

      const allActiveTechs = options.techniques || (typeof this.getPrimedTechniques === 'function' ? this.getPrimedTechniques() : []);
      const activeTechs = allActiveTechs.filter(t => typeof this.isTechniqueApplicable !== 'function' || this.isTechniqueApplicable(t, attackItem));
      let effectTag = '';
      if (chosenEffect && chosenEffect !== 'none') {
        effectTag = ` [Effect: ${chosenEffect}]`;
      } else if (chosenEffect === 'none' && favorBonus > 0) {
        effectTag = ` [No Effect: +${favorBonus} AI Favor]`;
      }
      if (activeTechs.length > 0) {
        effectTag += ` [Techniques: ${activeTechs.map(t => t.name).join(', ')}]`;
      }

      const isOneHandedPenalty = (sys.wieldMode === 'two_handed_disadv_1h' && (options.hands === 1 || options.wieldMode === 'one_handed' || options.oneHanded));

      const advState = this.getRollAdvantageState({
        rollType: 'attack',
        stat: toHitStat,
        item: attackItem,
        isUntrained,
        isOneHandedPenalty,
        options,
        tags: [sys.weaponCategory, sys.weaponType, sys.slot].filter(Boolean)
      });

      // Aiming skill bonus when making a ranged attack with disadvantage
      const { auxiliarySkills } = this._resolveWeaponSkills(attackItem);
      const aimingAux = auxiliarySkills?.find(s => s.name?.toLowerCase().trim() === 'aiming');
      let aimingBonus = 0;
      if (advState.mode === 'disadvantage' && aimingAux) {
        aimingBonus = Math.max(Number(aimingAux.system?.modifiedRank) || 0, Number(aimingAux.system?.rank) || 0);
      }

      const total = isUntrained ? statMod : (rank + statMod + aimingBonus);
      const formula = `${advState.formula} + ${total}`;
      const roll = await new Roll(formula, { rank: isUntrained ? 0 : rank, mod: statMod }).evaluate();

      let flavorText = '';
      if (advState.mode === 'disadvantage') {
        const reason = isOneHandedPenalty ? 'One-Handed Disadvantage' : (isUntrained ? 'Untrained Attack Check with Disadvantage' : (advState.label || 'Disadvantage'));
        const aimStr = aimingBonus > 0 ? ` + Aiming R${aimingBonus}` : '';
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (<strong>${reason}</strong>: 2d20kl + ${isUntrained ? '' : (rank > 0 ? `Rank ${rank} + ` : '')}${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod}${aimStr} vs Target Evade)${effectTag}`;
      } else if (advState.mode === 'advantage') {
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (<strong>${advState.label}</strong>: 2d20kh + ${isUntrained ? '' : (rank > 0 ? `Rank ${rank} + ` : '')}${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)${effectTag}`;
      } else if (advState.mode === 'cancelled') {
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (<strong>${advState.label}</strong>: 1d20 + ${isUntrained ? '' : (rank > 0 ? `Rank ${rank} + ` : '')}${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)${effectTag}`;
      } else {
        const rankPart = rank > 0 ? `Rank ${rank} + ` : '';
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (To Hit: 1d20 + ${rankPart}${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)${effectTag}`;
      }

      // Check for Fumble on Natural 1
      const isFumble = roll.dice?.[0]?.results ? roll.dice[0].results.some(r => r.result === 1 && (r.active ?? true)) : (roll.terms?.[0]?.results ? roll.terms[0].results.some(r => r.result === 1 && (r.active ?? true)) : roll.total === 1);
      const { matchingSkill: matchedSkill } = this._resolveWeaponSkills(attackItem);
      const fumbleDebuff = matchedSkill?.system?.fumbleDebuff || attackItem.system?.fumbleDebuff || '';
      let fumbleTag = '';
      if (isFumble && fumbleDebuff) {
        fumbleTag = `
          <div class="dcc-fumble-warning" style="margin-top: 6px; padding: 4px 6px; background: #fdf2e9; border: 1px solid #e67e22; border-radius: 3px; color: #d35400; font-size: 11px;">
            <i class="fa-solid fa-triangle-exclamation"></i> <strong>FUMBLE!</strong> Critical Miss inflicts <strong>${fumbleDebuff}</strong> on wielder!
          </div>
        `;
      }

      if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
        DCCSessionEngine.recordRoll({
          actor: this,
          roll,
          type: isUntrained ? 'untrained_attack' : 'attack',
          name: attackItem.name,
          isUntrained
        }).catch(() => {});
      }

      let dmgBtnHtml = '';
      let dmgFormula = '';
      if (attackItem.type === 'skill') {
        const dmgData = this.getSkillDamageData(attackItem, currentOptions);
        if (dmgData.hasDamage) {
          dmgFormula = dmgData.formulaWithStat || dmgData.formula;
        }
      } else if (attackItem.type === 'spell') {
        const dmgData = this.getSpellDamageData(attackItem);
        if (dmgData.hasDamage) {
          dmgFormula = dmgData.formulaWithStat || dmgData.formula;
        }
      } else {
        const parts = this.getAttackDamageParts(attackItem, currentOptions);
        if (parts.length > 0) {
          const pFormulas = parts.map(p => {
            const dice = p.dice || '';
            const mod = p.statMod ? (p.statMod >= 0 ? `+${p.statMod}` : `${p.statMod}`) : '';
            const val = p.value ? (p.value >= 0 ? `+${p.value}` : `${p.value}`) : '';
            return [dice, mod, val].filter(Boolean).join(' ');
          }).filter(Boolean);
          dmgFormula = pFormulas.join(' + ');
        }
      }

      if (dmgFormula) {
        let effectBtnTag = '';
        if (chosenEffect && chosenEffect !== 'none') {
          effectBtnTag = ` [${chosenEffect}]`;
        } else if (chosenEffect === 'none' && favorBonus > 0) {
          effectBtnTag = ` [+${favorBonus} AI Favor]`;
        }
        dmgBtnHtml = `
          <div style="margin-top: 6px;">
            <button type="button" class="dcc-attack-roll-btn roll-attack-dmg-from-card roll-skill-dmg-from-card" data-actor-id="${this.id}" data-item-id="${attackItem.id}" data-skill-id="${attackItem.id}" data-item-type="${attackItem.type || 'attack'}" data-damage-effect="${chosenEffect || 'none'}" style="width: 100%; padding: 4px 8px; font-size: 11px; cursor: pointer; background: #c0392b; color: #fff; border: 1px solid #962d22; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; font-family: var(--font-primary, 'Oswald', sans-serif);">
              <i class="fa-solid fa-burst"></i> Roll Attack Damage (${dmgFormula})${effectBtnTag}
            </button>
          </div>
        `;
      }

      const { targetResults, targetResultsHtml, currentFloor } = this._resolveAttackTargets(roll, options);
      const evadeBtnHtml = this._getEvadeButtonHtml(roll, currentFloor);

      const rollHtml = typeof roll.render === 'function' ? await roll.render() : '';
      const content = [rollHtml, fumbleTag, targetResultsHtml, dmgBtnHtml, evadeBtnHtml].filter(Boolean).join('');

      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: flavorText,
        content,
        flags: {
          'carl-rpg': {
            isAttackRoll: true,
            attackerId: this.id,
            attackerType: this.type,
            attackTotal: roll.total,
            currentFloor,
            damageEffect: chosenEffect,
            activeTechniques: activeTechs.map(t => ({ id: t.id, name: t.name, rank: t.rank })),
            aiFavorBonus: (chosenEffect === 'none' && favorBonus > 0) ? favorBonus : 0,
            targetResults: targetResults.map(tr => ({
              actorId: tr.actorId,
              actorName: tr.actorName,
              targetDC: tr.targetDC,
              isHit: tr.isHit,
              diff: tr.diff,
              outcome: tr.outcome
            }))
          }
        }
      });
    } else {
      const parts = this.getAttackDamageParts(attackItem, currentOptions);
      const evaluatedParts = [];
      const typedDamage = {};

      let effectMult = options.effectMultiplier || 1;
      if (chosenEffect) {
        const ce = chosenEffect.toLowerCase();
        if (ce === 'smush' || ce === 'choke out') {
          effectMult = 2;
        }
      }

      for (const part of parts) {
        let formulaParts = [];
        if (part.dice) formulaParts.push(part.dice);
        if (part.stat && part.statMod) {
          formulaParts.push(part.statMod >= 0 ? `+ ${part.statMod}` : `- ${Math.abs(part.statMod)}`);
        }
        if (part.value) {
          if (!part.dice && !part.stat) {
            formulaParts.push(String(part.value));
          } else {
            formulaParts.push(part.value >= 0 ? `+ ${part.value}` : `- ${Math.abs(part.value)}`);
          }
        }

        const formula = formulaParts.join(' ').trim() || '0';
        let baseRollTotal = 0;
        if (!part.dice) {
          baseRollTotal = (Number(part.value) || 0) + (part.stat ? Number(part.statMod) || 0 : 0);
        } else {
          const roll = await new Roll(formula).evaluate();
          baseRollTotal = roll.total;
        }

        // Apply attacker damage multiplier (Scenario 3) and effectMultiplier
        const mult = this.getDamageMultiplier(part.type) * effectMult;
        const finalPartDamage = Math.max(0, Math.floor(baseRollTotal * mult));

        typedDamage[part.type] = (typedDamage[part.type] || 0) + finalPartDamage;

        evaluatedParts.push({
          ...part,
          formula,
          baseTotal: baseRollTotal,
          finalDamage: finalPartDamage,
          multiplier: mult
        });
      }

      const totalRawDamage = Object.values(typedDamage).reduce((acc, v) => acc + v, 0);
      const globalMult = this.getDamageMultiplier();
      const hasMult = globalMult !== 1 || effectMult !== 1 || evaluatedParts.some(p => p.multiplier !== 1);

      // Construct rich breakdown HTML for chat card
      const partPills = evaluatedParts.map(p => {
        const multTag = p.multiplier !== 1 ? ` <span class="dcc-mult-tag">(x${p.multiplier})</span>` : '';
        const sourceTag = p.source ? ` <span class="dcc-source-tag">[${p.source}]</span>` : '';
        return `
          <div class="dcc-damage-part-row" style="display: flex; justify-content: space-between; align-items: center; padding: 2px 4px; font-size: 11px; border-bottom: 1px dashed #ddd;">
            <div>
              <strong style="color: #c0392b;">${p.finalDamage}</strong>
              <span style="font-weight: bold; text-transform: uppercase; margin-left: 4px;">${p.type}</span>
              ${sourceTag}
            </div>
            <div style="color: #666; font-size: 10px;">
              <span>(${p.formula})</span>${multTag}
            </div>
          </div>
        `;
      }).join('');

      const typedDamageJson = JSON.stringify(typedDamage);

      // Resolve custom critical multiplier and on-hit debuffs from matching skill and active techniques
      let critMultiplier = (attackItem?.system?.critMultiplier !== undefined) ? Number(attackItem.system.critMultiplier) : 2;
      const onHitDebuffs = [];
      const allActiveTechs = options.techniques || (typeof this.getPrimedTechniques === 'function' ? this.getPrimedTechniques() : []);
      const activeTechs = allActiveTechs.filter(t => typeof this.isTechniqueApplicable !== 'function' || this.isTechniqueApplicable(t, attackItem));
      for (const t of activeTechs) {
        if (t.debuffName && !onHitDebuffs.includes(t.debuffName)) {
          onHitDebuffs.push(t.debuffName);
        }
      }

      const { matchingSkill: matchedSkill } = this._resolveWeaponSkills(attackItem);
      if (matchedSkill) {
        const skillRank = Math.max(Number(matchedSkill.modifiedRank) || 0, Number(matchedSkill.system?.modifiedRank) || 0, Number(matchedSkill.system?.rank) || 0);
        if (matchedSkill.system?.critMultiplierR15 && skillRank >= 15) {
          critMultiplier = Number(matchedSkill.system.critMultiplierR15);
        } else if (matchedSkill.system?.critMultiplierR5 && skillRank >= 5) {
          critMultiplier = Number(matchedSkill.system.critMultiplierR5);
        }
        if (matchedSkill.system?.onHitDebuff && skillRank >= (Number(matchedSkill.system?.onHitDebuffMinRank) || 0)) {
          onHitDebuffs.push(matchedSkill.system.onHitDebuff);
        }
        const rb = matchedSkill.system?.rankBreaks;
        if (rb) {
          if (skillRank >= 5 && rb.rank5?.debuff && !onHitDebuffs.includes(rb.rank5.debuff)) onHitDebuffs.push(rb.rank5.debuff);
          if (skillRank >= 10 && rb.rank10?.debuff && !onHitDebuffs.includes(rb.rank10.debuff)) onHitDebuffs.push(rb.rank10.debuff);
          if (skillRank >= 15 && rb.rank15?.debuff && !onHitDebuffs.includes(rb.rank15.debuff)) onHitDebuffs.push(rb.rank15.debuff);
          if (skillRank >= 20 && rb.rank20?.debuff && !onHitDebuffs.includes(rb.rank20.debuff)) onHitDebuffs.push(rb.rank20.debuff);
        }
      }

      const cardContent = `
        <div class="dcc-chat-card dcc-damage-card"
          data-attacker-id="${this.id}"
          data-item-id="${attackItem.id}"
          data-item-name="${attackItem.name}"
          data-damage-value="${totalRawDamage}"
          data-typed-damage='${typedDamageJson}'
          data-damage-effect="${chosenEffect || 'none'}"
          data-attack-type="${attackItem.type || 'attack'}">
          <div class="dcc-damage-card-header">
            <strong>${this.name}</strong>: ${attackItem.name} Damage
            ${chosenEffect && chosenEffect !== 'none' ? `<span style="background: #c0392b; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-left: 6px; text-transform: uppercase;">${chosenEffect}</span>` : ''}
            ${chosenEffect === 'none' && favorBonus > 0 ? `<span style="background: #27ae60; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-left: 6px; text-transform: uppercase;">+${favorBonus} AI Favor</span>` : ''}
            ${activeTechs.map(t => `<span class="dcc-technique-badge" style="background: #d35400; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-left: 4px; text-transform: uppercase;">⚡ ${t.name}</span>`).join('')}
          </div>
          <div class="dcc-damage-card-result" style="margin: 6px 0;">
            <span class="dcc-damage-value" style="font-size: 20px; font-weight: bold; color: #c0392b;">${totalRawDamage}</span>
            <span class="dcc-damage-formula">${hasMult ? `(Multiplied Total)` : `Total Damage`}</span>
          </div>
          <div class="dcc-typed-breakdown" style="background: #faf8f5; border: 1px solid #e0dacf; border-radius: 4px; padding: 4px 6px; margin-bottom: 8px;">
            ${partPills}
          </div>
          ${sys.effects ? `<div class="dcc-damage-effects" style="font-size: 11px; margin-bottom: 6px;"><em>${sys.effects}</em></div>` : ''}
          <div class="dcc-damage-actions">
            <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" title="Apply damage to targeted token(s), deducting their DR">
              <i class="fa-solid fa-crosshairs"></i> Apply to Target(s)
            </button>
            <div class="dcc-damage-sub-actions">
              <button type="button" class="dcc-apply-damage-btn" data-multiplier="0.5" title="Apply half damage">Half</button>
              <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" data-ignore-dr="true" title="Apply ignoring DR">Ignore DR</button>
              <button type="button" class="dcc-apply-damage-btn" data-multiplier="${critMultiplier}" title="Apply critical damage (${critMultiplier}x)">Crit (${critMultiplier}x)</button>
              ${onHitDebuffs.map(deb => `<button type="button" class="dcc-apply-condition-btn" data-condition-name="${deb}" data-condition-type="debuff" title="Inflict ${deb} on target(s)" style="background: #8e44ad; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 3px; border: none; cursor: pointer;"><i class="fa-solid fa-droplet"></i> Inflict [${deb}]</button>`).join(' ')}
            </div>
          </div>
        </div>
      `;

      let effectFlavorTag = '';
      if (chosenEffect && chosenEffect !== 'none') {
        effectFlavorTag = ` [Effect: ${chosenEffect}]`;
      } else if (chosenEffect === 'none' && favorBonus > 0) {
        effectFlavorTag = ` [No Effect: +${favorBonus} AI Favor]`;
      }

      const flavorBreakdown = Object.entries(typedDamage).map(([t, val]) => `${val} ${t}`).join(', ');
      const flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (Damage: ${flavorBreakdown}${hasMult ? ` [x${globalMult * effectMult}]` : ''})${effectFlavorTag}${sys.effects ? ` - <em>${sys.effects}</em>` : ''}`;

      const mainRoll = await new Roll(`${totalRawDamage}`).evaluate();

      if (options.clearPrimed !== false && typeof this.clearPrimedTechniques === 'function') {
        await this.clearPrimedTechniques();
      }

      return mainRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: flavorText,
        content: cardContent,
        flags: {
          'carl-rpg': {
            isDamageRoll: true,
            attackerId: this.id,
            itemId: attackItem.id,
            itemName: attackItem.name,
            attackType: attackItem.type || 'attack',
            damageEffect: chosenEffect,
            activeTechniques: activeTechs.map(t => ({ id: t.id, name: t.name, rank: t.rank })),
            aiFavorBonus: (chosenEffect === 'none' && favorBonus > 0) ? favorBonus : 0,
            rawDamage: totalRawDamage,
            typedDamage,
            parts: evaluatedParts
          }
        }
      });
    }
  }

  /**
   * Roll Skill Damage, producing an interactive CarlRPG damage card
   * @param {Item} skillItem
   * @param {object} [options={}]
   * @returns {Promise<ChatMessage>}
   */
  async rollSkillDamage(skillItem, options = {}) {
    return this.rollAttack(skillItem, 'damage', options);
  }

  /**
   * Apply incoming damage to this actor using DCC RPG rules (DR, Temp HP, full damage bars).
   * @param {number} rawDamage
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async applyDamage(rawDamage, options = {}) {
    let payload = { targetActor: this, ...options };
    if (typeof rawDamage === 'object' && rawDamage !== null) {
      payload.typedDamage = rawDamage;
      payload.rawDamage = Object.values(rawDamage).reduce((a, b) => a + (Number(b) || 0), 0);
    } else {
      payload.rawDamage = Number(rawDamage) || 0;
    }
    return DCCCombatMetrics.applyDamageToTarget(payload);
  }

  /**
   * Grant or set temporary health bars for this actor.
   * @param {object} params
   * @param {number} params.count - Number of temporary bar slots
   * @param {number} params.hpPerSlot - HP capacity per slot
   * @param {string} [params.source=''] - Source spell or item name
   * @returns {Promise<DCCActor>}
   */
  async grantTempBars({ count, hpPerSlot, source = '' } = {}) {
    const numCount = Math.max(0, Math.floor(Number(count) || 0));
    const numPerSlot = Math.max(0, Math.floor(Number(hpPerSlot) || 0));
    if (numCount <= 0 || numPerSlot <= 0) {
      return this.update({
        'system.attributes.hp.tempBars.count': 0,
        'system.attributes.hp.tempBars.maxCount': 0,
        'system.attributes.hp.tempBars.hpPerSlot': 0,
        'system.attributes.hp.tempBars.currentSlotHp': 0,
        'system.attributes.hp.tempBars.source': '',
        'system.attributes.hp.temp': 0
      });
    }
    const totalHp = numCount * numPerSlot;
    return this.update({
      'system.attributes.hp.tempBars.count': numCount,
      'system.attributes.hp.tempBars.maxCount': numCount,
      'system.attributes.hp.tempBars.hpPerSlot': numPerSlot,
      'system.attributes.hp.tempBars.currentSlotHp': numPerSlot,
      'system.attributes.hp.tempBars.source': String(source || ''),
      'system.attributes.hp.temp': totalHp
    });
  }

  /**
   * Activate an aura spell/item on this actor and grant linked aura effects (e.g. temporary health bars).
   * @param {DCCItem} spellItem
   * @returns {Promise<object>}
   */
  async activateAura(spellItem) {
    if (!spellItem) return { active: false, error: 'No item provided' };
    const sys = spellItem.system || {};
    const rank = Number(sys.rank) || 1;

    // 1. Calculate aura radius with rank upgrades
    let radius = Number(sys.area?.radius) || 5;
    if (rank >= 15 && sys.rankBreaks?.rank15?.area?.radiusBonus) {
      radius += Number(sys.rankBreaks.rank15.area.radiusBonus);
    } else if (rank >= 10 && sys.rankBreaks?.rank10?.area?.radiusBonus) {
      radius += Number(sys.rankBreaks.rank10.area.radiusBonus);
    }

    // 2. Calculate temporary health bars if configured
    let slots = 0;
    let hpPerSlot = 0;
    let totalTempHp = 0;

    if (sys.tempBars?.hasTempBars) {
      const formula = (sys.tempBars.slotsFormula || '').trim();
      if (formula.includes('cha')) {
        slots = Number(this.system?.abilities?.cha?.mod) || 0;
      } else if (formula.includes('con')) {
        slots = Number(this.system?.abilities?.con?.mod) || 0;
      } else if (formula.includes('str')) {
        slots = Number(this.system?.abilities?.str?.mod) || 0;
      } else if (formula.includes('int')) {
        slots = Number(this.system?.abilities?.int?.mod) || 0;
      } else if (formula.includes('dex')) {
        slots = Number(this.system?.abilities?.dex?.mod) || 0;
      } else {
        slots = Number(formula) || Number(this.system?.abilities?.cha?.mod) || 1;
      }
      slots = Math.max(1, slots);

      if (rank >= 15 && sys.rankBreaks?.rank15?.tempBars?.hpPerSlot) {
        hpPerSlot = Number(sys.rankBreaks.rank15.tempBars.hpPerSlot);
      } else if (rank >= 10 && sys.rankBreaks?.rank10?.tempBars?.hpPerSlot) {
        hpPerSlot = Number(sys.rankBreaks.rank10.tempBars.hpPerSlot);
      } else if (rank >= 5 && sys.rankBreaks?.rank5?.tempBars?.hpPerSlot) {
        hpPerSlot = Number(sys.rankBreaks.rank5.tempBars.hpPerSlot);
      } else {
        hpPerSlot = Number(sys.tempBars.hpPerSlot) || 2;
      }

      totalTempHp = slots * hpPerSlot;
      await this.grantTempBars({ count: slots, hpPerSlot, source: spellItem.name });
    }

    // 3. Set spell active and reset round duration
    const rounds = Number(sys.durationConfig?.rounds) || 2;
    await spellItem.update({
      'system.active': true,
      'system.durationConfig.remainingRounds': rounds
    });

    // 4. Center aura on caster token (target: self)
    let token = null;
    let template = null;
    if (typeof canvas !== 'undefined' && canvas?.scene) {
      if (canvas?.tokens?.placeables) {
        token = canvas.tokens.placeables.find(t => t.actor?.id === this.id) || canvas.tokens.controlled?.[0];
      }
      if (token) {
        const x = token.center?.x ?? (token.x + (canvas.grid?.size || 50) / 2);
        const y = token.center?.y ?? (token.y + (canvas.grid?.size || 50) / 2);

        if (canvas.scene.templates && canvas.scene.deleteEmbeddedDocuments) {
          const old = canvas.scene.templates.filter(t => t.flags?.['carl-rpg']?.auraItemId === (spellItem.id || spellItem._id));
          if (old.length) {
            await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', old.map(t => t.id));
          }
        }

        const templateData = {
          t: 'circle',
          user: globalThis.game?.user?.id,
          distance: radius,
          direction: 0,
          x,
          y,
          fillColor: '#d4af37',
          flags: {
            'carl-rpg': {
              auraItemId: spellItem.id || spellItem._id,
              actorId: this.id,
              isAura: true,
              target: 'self'
            }
          }
        };
        if (typeof MeasuredTemplateDocument !== 'undefined' && canvas.scene.createEmbeddedDocuments) {
          const created = await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]);
          template = created?.[0] || null;
        }
      }
    }

    return {
      active: true,
      radius,
      slots,
      hpPerSlot,
      totalTempHp,
      remainingRounds: rounds,
      target: sys.target || 'Self',
      targetFilter: sys.area?.targetFilter || 'allies',
      tokenCenter: token ? { x: token.center?.x, y: token.center?.y } : null,
      templateId: template?.id || null
    };
  }

  /**
   * Deactivate an aura spell/item and clear any granted temporary health bars.
   * @param {DCCItem} spellItem
   * @returns {Promise<object>}
   */
  async deactivateAura(spellItem) {
    if (!spellItem) return { active: false };

    await spellItem.update({
      'system.active': false,
      'system.durationConfig.remainingRounds': 0
    });

    const currentSource = this.system?.attributes?.hp?.tempBars?.source;
    if (currentSource && (currentSource === spellItem.name || currentSource.toLowerCase() === spellItem.name.toLowerCase())) {
      await this.grantTempBars({ count: 0, hpPerSlot: 0 });
    }

    if (typeof canvas !== 'undefined' && canvas?.scene?.templates && canvas.scene.deleteEmbeddedDocuments) {
      const auraTemplates = canvas.scene.templates.filter(t => t.flags?.['carl-rpg']?.auraItemId === (spellItem.id || spellItem._id));
      if (auraTemplates.length) {
        await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', auraTemplates.map(t => t.id));
      }
    }

    return { active: false };
  }

  /**
   * Get all archetype tags associated with this actor (e.g. Set {'archetype.mage'}).
   * Evaluates embedded class and race items, as well as details.class.
   * @returns {Set<string>}
   */
  getArchetypeTags() {
    const archetypes = new Set();
    const itemsList = this.items ? (Array.isArray(this.items) ? this.items : Array.from(this.items.values?.() || [])) : [];

    for (const item of itemsList) {
      if (item.type === 'class' || item.type === 'race') {
        const itemTags = item.allTags || getItemAllTags(item);
        for (const t of itemTags) {
          if (t.startsWith('archetype.')) archetypes.add(t);
        }
      }
    }

    const className = (this.system?.details?.class || '').trim();
    if (className) {
      const parts = className.toLowerCase().split(/[\s,]+/);
      for (const p of parts) {
        if (ARCHETYPE_TO_TAG[p]) {
          archetypes.add(ARCHETYPE_TO_TAG[p]);
        }
      }
    }

    return archetypes;
  }

  /**
   * Get all identity and classification tags for this actor.
   * Includes archetype tags, race, class, deity, and sponsor tags.
   * @returns {Set<string>}
   */
  getIdentityTags() {
    const tags = new Set(this.getArchetypeTags());
    const itemsList = this.items ? (Array.isArray(this.items) ? this.items : Array.from(this.items.values?.() || [])) : [];

    for (const item of itemsList) {
      if (['class', 'race', 'deity', 'sponsor'].includes(item.type)) {
        const itemTags = item.allTags || getItemAllTags(item);
        for (const t of itemTags) {
          tags.add(t);
        }
      }
    }

    return tags;
  }

  /**
   * Resolve and return details for the up to 3 active external buffs
   * @returns {Array<object>}
   */
  getActiveBuffs() {
    const rawBuffs = this.system?.attributes?.externalBuffs;
    const resolved = [];

    if (rawBuffs) {
      let buffKeys = [];
      if (Array.isArray(rawBuffs)) {
        buffKeys = rawBuffs.slice(0, 3);
      } else if (typeof rawBuffs === 'object') {
        buffKeys = [
          rawBuffs.buff1 || rawBuffs.slot1,
          rawBuffs.buff2 || rawBuffs.slot2,
          rawBuffs.buff3 || rawBuffs.slot3
        ].filter(Boolean);
        if (buffKeys.length === 0) {
          buffKeys = Object.values(rawBuffs).filter(Boolean).slice(0, 3);
        }
      }

      for (const key of buffKeys) {
        if (!key) continue;
        const buffObj = this.resolveBuff(key);
        if (buffObj) resolved.push(buffObj);
      }
    }

    // Also include any embedded buff items explicitly flagged as active
    if (this.items) {
      const itemsList = Array.isArray(this.items) ? this.items : Array.from(this.items.values?.() || []);
      for (const item of itemsList) {
        if (item.type === 'buff' && item.system?.active) {
          if (!resolved.some(r => r.id === (item.id || item._id))) {
            const sysData = (typeof item.system?.toObject === 'function')
              ? item.system.toObject(false)
              : structuredClone(item.system || {});
            resolved.push({
              id: item.id || item._id,
              name: item.name,
              type: item.type,
              system: sysData,
              ...sysData
            });
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Resolve a buff by ID, compendium ID, or name
   * @param {string} rawVal
   * @returns {object|null}
   */
  resolveBuff(rawVal) {
    if (!rawVal) return null;
    const str = String(rawVal).trim();
    if (!str) return null;

    // 1. Check embedded item on actor
    const owned = this.items?.get?.(str) ||
      (Array.isArray(this.items) ? this.items.find(i => i.id === str || i._id === str || i.name.toLowerCase() === str.toLowerCase()) : this.items?.find?.(i => i.id === str || i._id === str || i.name.toLowerCase() === str.toLowerCase()));
    if (owned && (owned.type === 'buff' || owned.system?.buffType)) {
      const sysData = (typeof owned.system?.toObject === 'function')
        ? owned.system.toObject(false)
        : (globalThis.foundry?.utils?.deepClone ? foundry.utils.deepClone(owned.system || {}) : structuredClone(owned.system || {}));
      return {
        id: owned.id || owned._id,
        name: owned.name,
        type: 'buff',
        img: owned.img || 'icons/svg/aura.svg',
        system: sysData
      };
    }

    // 2. Check compendium dataset in CONFIG.DCC.buffs
    const compBuff = CONFIG.DCC?.buffs?.find(b => b._id === str || b.name.toLowerCase() === str.toLowerCase());
    if (compBuff) {
      const sysData = (typeof compBuff.system?.toObject === 'function')
        ? compBuff.system.toObject(false)
        : (globalThis.foundry?.utils?.deepClone ? foundry.utils.deepClone(compBuff.system || {}) : structuredClone(compBuff.system || {}));
      return {
        id: compBuff._id,
        name: compBuff.name,
        type: 'buff',
        img: compBuff.img || 'icons/svg/aura.svg',
        system: sysData
      };
    }

    // 3. Check world items
    if (globalThis.game?.items) {
      const worldItem = Array.from(game.items).find(i => (i.id === str || i._id === str || i.name.toLowerCase() === str.toLowerCase()) && i.type === 'buff');
      if (worldItem) {
        const sysData = (typeof worldItem.system?.toObject === 'function')
          ? worldItem.system.toObject(false)
          : (globalThis.foundry?.utils?.deepClone ? foundry.utils.deepClone(worldItem.system || {}) : structuredClone(worldItem.system || {}));
        return {
          id: worldItem.id || worldItem._id,
          name: worldItem.name,
          type: 'buff',
          img: worldItem.img || 'icons/svg/aura.svg',
          system: sysData
        };
      }
    }

    // 4. Check compendium packs (e.g. carl-rpg.buffs or any Item pack)
    if (globalThis.game?.packs) {
      for (const pack of game.packs) {
        if (pack.documentName === 'Item' || pack.type === 'Item' || pack.metadata?.type === 'Item') {
          const entry = pack.index?.get?.(str) ||
            (pack.index ? Array.from(pack.index.values ? pack.index.values() : pack.index).find(e => (e.id === str || e._id === str || e.name?.toLowerCase() === str.toLowerCase()) && (e.type === 'buff' || !e.type)) : null);
          if (entry) {
            return {
              id: entry._id || entry.id,
              name: entry.name,
              type: 'buff',
              img: entry.img || 'icons/svg/aura.svg',
              system: structuredClone(entry.system || {})
            };
          }
        }
      }
    }

    // 4. Fallback for custom buff string (e.g. "+2 STR", "Fire Resistance", "*2 Damage", "10 Temp HP")
    const lower = str.toLowerCase();

    // Damage Multiplier buff string (e.g. "*2", "2x damage", "double damage", "*2 fire damage")
    const multMatch = lower.match(/(?:\*|x)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:x|\*)/i);
    if (multMatch || lower.includes('double damage') || lower.includes('triple damage')) {
      const mult = multMatch ? Number(multMatch[1] || multMatch[2]) : (lower.includes('double') ? 2 : 3);
      const dmgType = CONFIG.DCC?.damageTypes?.find(dt => lower.includes(dt.toLowerCase())) || '';
      return {
        id: 'custom-' + str,
        name: str,
        type: 'buff',
        img: 'icons/svg/sword.svg',
        system: { buffType: 'damageMultiplier', stat: '', value: mult, damageMultiplier: mult, damageType: dmgType, duration: '', description: str }
      };
    }

    const statMatch = lower.match(/(?:\+?(\d+)\s*)?(strength|intelligence|constitution|dexterity|charisma|str|int|con|dex|cha)(?:\s*\+?(\d+))?/i);
    if (statMatch) {
      const statMap = { str: 'str', strength: 'str', int: 'int', intelligence: 'int', con: 'con', constitution: 'con', dex: 'dex', dexterity: 'dex', cha: 'cha', charisma: 'cha' };
      const stat = statMap[statMatch[2].toLowerCase()];
      const val = Number(statMatch[1] || statMatch[3]) || 2;
      return {
        id: 'custom-' + str,
        name: str,
        type: 'buff',
        img: 'icons/svg/sword.svg',
        system: { buffType: 'stat', stat, value: val, damageType: '', duration: '', description: str }
      };
    }

    if (lower.includes('resist')) {
      const dmgType = CONFIG.DCC?.damageTypes?.find(dt => lower.includes(dt.toLowerCase())) || '';
      return {
        id: 'custom-' + str,
        name: str,
        type: 'buff',
        img: 'icons/svg/shield.svg',
        system: { buffType: 'resistance', stat: '', value: 0, damageType: dmgType, duration: '', description: str }
      };
    }

    if (lower.includes('immun')) {
      const dmgType = CONFIG.DCC?.damageTypes?.find(dt => lower.includes(dt.toLowerCase())) || '';
      return {
        id: 'custom-' + str,
        name: str,
        type: 'buff',
        img: 'icons/svg/shield.svg',
        system: { buffType: 'immunity', stat: '', value: 0, damageType: dmgType, duration: '', description: str }
      };
    }

    if (lower.includes('temp') || lower.includes('health') || lower.includes('hp')) {
      const hpMatch = lower.match(/\+?(\d+)/);
      const val = hpMatch ? Number(hpMatch[1]) : 10;
      return {
        id: 'custom-' + str,
        name: str,
        type: 'buff',
        img: 'icons/svg/regen.svg',
        system: { buffType: 'temphp', stat: '', value: val, damageType: '', duration: '', description: str }
      };
    }

    return {
      id: 'custom-' + str,
      name: str,
      type: 'buff',
      img: 'icons/svg/aura.svg',
      system: { buffType: 'custom', stat: '', value: 0, damageType: '', duration: '', description: str }
    };
  }

  /**
   * Check if actor has resistance to a specific damage type
   * @param {string} damageType
   * @returns {boolean}
   */
  hasResistance(damageType) {
    if (!damageType) return false;
    const list = this.system?.attributes?.resistances || [];
    const target = damageType.toLowerCase().trim();
    return list.some(r => {
      const rLower = r.toLowerCase().trim();
      return target === rLower || target.includes(rLower) || rLower.includes(target);
    });
  }

  /**
   * Check if actor has immunity to a specific damage type
   * @param {string} damageType
   * @returns {boolean}
   */
  hasImmunity(damageType) {
    if (!damageType) return false;
    const list = this.system?.attributes?.immunities || [];
    const target = damageType.toLowerCase().trim();
    return list.some(i => {
      const iLower = i.toLowerCase().trim();
      return target === iLower || target.includes(iLower) || iLower.includes(target);
    });
  }

  /**
   * Get damage reduction for an incoming damage type from debuffs, resistances, or active effects.
   * Returns { percent: number, flat: number, rounding: 'up'|'down', isResistant: boolean, isImmune: boolean }
   * @param {string} damageType
   * @returns {object}
   */
  getDamageReduction(damageType) {
    if (!damageType) return { percent: 0, flat: 0, rounding: 'up', isResistant: false, isImmune: false };
    const targetType = damageType.toLowerCase().trim();
    const elementTag = damageTypeToElement(targetType) || (targetType.startsWith('element.') ? targetType : null);
    const canonicalName = (elementToDamageType(elementTag) || targetType).toLowerCase();

    if (this.hasImmunity(damageType) || (elementTag && this.hasImmunity(elementTag))) {
      return { percent: 1, flat: 0, rounding: 'up', isResistant: false, isImmune: true };
    }

    let percent = 0;
    let flat = 0;
    let rounding = 'up';
    let isResistant = this.hasResistance(damageType) || (elementTag && this.hasResistance(elementTag));
    if (isResistant) {
      percent += 0.5;
    }

    // Check embedded debuff items
    const debuffItems = this.items
      ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff'))
      : [];

    for (const item of debuffItems) {
      const sys = item.system || {};
      const desc = (sys.description || item.name || '').toLowerCase();
      const itemTags = item.allTags || (typeof getItemAllTags === 'function' ? getItemAllTags(item) : new Set(sys.tags || []));

      // Check multi damageModifiers if present
      if (Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0) {
        for (const dm of sys.damageModifiers) {
          if (!dm) continue;
          const kind = (dm.kind || dm.type || '').toLowerCase();
          const dt = (dm.damageType || '').toLowerCase().trim();
          const dTag = (dm.elementTag || dm.tag || '').toLowerCase().trim();
          const applies = !dt || dt === 'all' || dt === targetType || dt === canonicalName || (elementTag && (dt === elementTag || dTag === elementTag));

          if (applies) {
            if (kind === 'immunity') {
              return { percent: 1, flat: 0, rounding: 'up', isResistant: false, isImmune: true };
            }
            if (kind === 'resistance') {
              isResistant = true;
              percent += 0.5;
            }
            if (kind === 'reduction' || kind === 'damagereduction' || dm.reductionPercent !== undefined) {
              const rawPct = Number(dm.reductionPercent ?? dm.value) || 0;
              percent += rawPct > 1 ? rawPct / 100 : rawPct;
              if (dm.rounding) rounding = dm.rounding;
              if (dm.flat) flat += Number(dm.flat) || 0;
            }
          }
        }
      } else {
        // Tag-driven single modifier check
        const itemDmg = (sys.damageType || '').toLowerCase().trim();
        const hasTagMatch = elementTag && itemTags.has(elementTag);
        const appliesToType = !itemDmg || itemDmg === targetType || itemDmg === canonicalName || itemDmg === 'all' || hasTagMatch || desc.includes(targetType) || desc.includes('all damage') || desc.includes('all attacks');
        if (appliesToType) {
          if (sys.reductionPercent) {
            const rawPct = Number(sys.reductionPercent) || 0;
            percent += rawPct > 1 ? rawPct / 100 : rawPct;
          } else {
            // Legacy description fallback for unmigrated items
            const pctMatch = desc.match(/(\d+)%\s*(?:reduction|damage)?/i);
            if (pctMatch) {
              percent += Number(pctMatch[1]) / 100;
            }
          }

          if (sys.rounding) {
            rounding = sys.rounding;
          } else if (desc.includes('rounded up') || desc.includes('round up')) {
            rounding = 'up';
          } else if (desc.includes('rounded down') || desc.includes('round down')) {
            rounding = 'down';
          }

          if (sys.flatReduction) {
            flat += Number(sys.flatReduction) || 0;
          }
        }
      }
    }

    // Also check text in system.attributes.debuffs
    const debuffStr = typeof this.system?.attributes?.debuffs === 'string' ? this.system.attributes.debuffs.toLowerCase() : '';
    if (debuffStr && (debuffStr.includes(targetType) || debuffStr.includes('all damage') || debuffStr.includes('all fire'))) {
      const pctMatch = debuffStr.match(new RegExp(`(\\d+)%\\s*(?:reduction|damage)?.*?${targetType}|${targetType}.*?(\\d+)%`, 'i'));
      if (pctMatch) {
        const p = Number(pctMatch[1] || pctMatch[2]) || 0;
        percent += p > 1 ? p / 100 : p;
      }
      if (debuffStr.includes('rounded up') || debuffStr.includes('round up')) {
        rounding = 'up';
      } else if (debuffStr.includes('rounded down') || debuffStr.includes('round down')) {
        rounding = 'down';
      }
    }

    return {
      percent: Math.min(1, Math.max(0, percent)),
      flat,
      rounding,
      isResistant,
      isImmune: false
    };
  }

  /**
   * Roll Skill Check
   * Implements official DCC rules:
   * - Uses Modified Rank (calculated rank after boons and items).
   * - Untrained (Modified Rank <= 0): Roll with Disadvantage (2d20kl + Stat Mod).
   * - Trained (Modified Rank > 0): Roll Standard (1d20 + Total Skill = 1d20 + Modified Rank + Stat Mod).
   * - Passive Skills: Informational message (no roll required).
   * - Call a Play: Roll 2d6.
   * - Intervene: Roll 1d6.
   * @param {Item} skillItem
   */
  async rollSkill(skillItem, options = {}) {
    // Record skill usage in active combat if applicable
    if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.recordSkillUsage === 'function') {
      DCCCombatMetrics.recordSkillUsage({ actor: this, skillName: skillItem.name }).catch(() => {});
    }

    // Mark skill as checked/used in play for grinding advancement
    if (skillItem && typeof skillItem.update === 'function' && !skillItem.system?.checked) {
      skillItem.update({ 'system.checked': true }).catch(() => {});
    }

    const sys = skillItem.system || {};
    const statKey = sys.stat || 'str';
    const statName = statKey.toUpperCase();
    const statMod = this.system.abilities?.[statKey]?.mod ?? 0;

    // Use calculated modified rank after boons and items
    const modifiedRank = Number(
      skillItem.modifiedRank ??
      sys.modifiedRank ??
      skillItem.effectiveRank ??
      sys.rank
    ) || 0;

    const baseRank = Number(sys.rank) || 0;
    const itemBonus = Number(skillItem.itemBonus ?? sys.itemBonus) || 0;
    const boonBonus = Number(skillItem.boonBonus ?? sys.boonBonus) || 0;
    const typeBonus = Number(skillItem.typeBonus ?? sys.typeBonus) || 0;
    const totalSkill = modifiedRank + statMod;
    const checkType = (sys.checkType || '').toLowerCase();

    // Passive skill handling
    if (checkType.includes('passive') || checkType.includes('no roll')) {
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `<div class="dcc-chat-card">
          <h4><strong>${this.name}</strong>: ${skillItem.name}</h4>
          <p><em>Passive Skill (No roll required)</em></p>
          <p><strong>Modified Rank:</strong> ${modifiedRank} (Base ${baseRank}${itemBonus ? `, Items +${itemBonus}` : ''}${typeBonus ? `, Type +${typeBonus}` : ''}${boonBonus ? `, Boons +${boonBonus}` : ''})</p>
          <p>${sys.notes || 'Static bonus active.'}</p>
        </div>`
      });
    }

    // Call a Play (2d6)
    if (skillItem.name.toLowerCase() === 'call a play' || checkType.includes('2d6')) {
      const roll = await new Roll('2d6').evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: Call a Play (Roll 2d6 - ally adds higher d6 to upcoming check/damage)`
      });
    }

    // Intervene (1d6)
    if (skillItem.name.toLowerCase() === 'intervene' || checkType.includes('1d6')) {
      const roll = await new Roll('1d6').evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: Intervene (Roll 1d6 - added to ally's d20 after check)`
      });
    }

    const isUntrained = modifiedRank <= 0;
    const advState = this.getRollAdvantageState({
      rollType: 'skill',
      stat: statKey,
      item: skillItem,
      isUntrained,
      options
    });

    // Untrained Check with Disadvantage (Rank <= 0 and disadvantage applies)
    if (isUntrained && (advState.mode === 'disadvantage' || advState.mode === 'normal')) {
      const formula = `2d20kl + ${statMod}`;
      const roll = await new Roll(formula, { mod: statMod }).evaluate();
      if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
        DCCSessionEngine.recordRoll({
          actor: this,
          roll,
          type: 'untrained_skill',
          name: skillItem.name,
          isUntrained: true
        }).catch(() => {});
      }
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${skillItem.name} (<strong>Untrained Check with Disadvantage</strong>: 2d20kl + ${statName} Mod ${statMod >= 0 ? `+${statMod}` : statMod})`
      });
    }

    // Trained Check or Non-Disadvantage Untrained Check
    const breakdown = [`Rank ${modifiedRank}`];
    if (itemBonus > 0 || boonBonus > 0 || typeBonus > 0) {
      const parts = [`Base ${baseRank}`];
      if (itemBonus > 0) parts.push(`Items +${itemBonus}`);
      if (typeBonus > 0) parts.push(`Type +${typeBonus}`);
      if (boonBonus > 0) parts.push(`Boons +${boonBonus}`);
      breakdown[0] += ` [${parts.join(', ')}]`;
    }
    breakdown.push(`${statName} Mod ${statMod >= 0 ? `+${statMod}` : statMod}`);

    const checkValue = isUntrained ? statMod : totalSkill;
    const formula = `${advState.formula} + ${checkValue}`;
    const roll = await new Roll(formula, { rank: isUntrained ? 0 : modifiedRank, mod: statMod }).evaluate();

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: isUntrained ? 'untrained_skill' : 'skill',
        name: skillItem.name,
        isUntrained
      }).catch(() => {});
    }

    let flavorText = '';
    if (advState.mode === 'disadvantage') {
      flavorText = `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check [<strong>${advState.label || 'Disadvantage'}</strong>]: ${advState.formula} + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`;
    } else if (advState.mode === 'advantage') {
      flavorText = `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check [<strong>${advState.label}</strong>]: ${advState.formula} + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`;
    } else if (advState.mode === 'cancelled') {
      flavorText = `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check [<strong>${advState.label}</strong>]: 1d20 + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`;
    } else {
      flavorText = `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check: 1d20 + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`;
    }

    const dmgData = this.getSkillDamageData(skillItem);
    const hasDmg = dmgData.hasDamage;
    const dmgBtnHtml = hasDmg ? `
      <div style="margin-top: 6px;">
        <button type="button" class="dcc-attack-roll-btn roll-skill-dmg roll-skill-dmg-from-card" data-actor-id="${this.id}" data-item-id="${skillItem.id}" data-skill-id="${skillItem.id}" data-item-type="skill" data-formula="${dmgData.formula}" style="width: 100%; padding: 4px 8px; font-size: 11px; cursor: pointer; background: #c0392b; color: #fff; border: 1px solid #962d22; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; font-family: var(--font-primary, 'Oswald', sans-serif);">
          <i class="fa-solid fa-burst"></i> Roll Attack Damage (${dmgData.formulaWithStat || dmgData.formula})
        </button>
      </div>
    ` : '';

    const rollHtml = typeof roll.render === 'function' ? await roll.render() : '';
    const content = rollHtml ? `${rollHtml}${dmgBtnHtml}` : (dmgBtnHtml || undefined);

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: flavorText,
      content
    });
  }

  /**
   * Parse and calculate spell damage formula and metadata based on spell description, stat, and rank upgrades
   * @param {DCCItem} spellItem
   * @returns {object}
   */
  getSpellDamageData(spellItem) {
    const sys = spellItem?.system || {};
    const baseDmg = (sys.baseDamage || '').trim();
    if (sys.spellType === 'Heal' || /health bar|resistance/i.test(baseDmg)) {
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '', debuffs: [] };
    }

    const rank = Math.max(Number(sys.modifiedRank) || 0, Number(sys.rank) || 0, 1);
    const rawMods = Array.isArray(sys.damageModifiers) ? sys.damageModifiers : Object.values(sys.damageModifiers || {});
    const activeMods = rawMods.filter(m => m && (m.dice || m.value) && rank >= (Number(m.minRank) || 0));

    const diceMatch = baseDmg ? baseDmg.match(/(\d+)d(\d+)/i) : null;
    const flatMatch = (!diceMatch && baseDmg) ? baseDmg.match(/^[+]?(\d+)/) : null;

    if (!diceMatch && !flatMatch && activeMods.length === 0) {
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '', debuffs: [] };
    }

    let diceStr = '';
    let sides = 0;
    let count = 0;
    let damageType = sys.damageType || (activeMods[0]?.type || activeMods[0]?.damageType || '');
    const debuffs = [];

    if (sys.onHitDebuff && rank >= (Number(sys.onHitDebuffMinRank) || 0)) {
      if (!debuffs.includes(sys.onHitDebuff)) {
        debuffs.push(sys.onHitDebuff);
      }
    }

    // 1. Structured Rank Breaks configuration parsing (Ranks 5, 10, 15, 20) (primary)
    let extraSpellRankDice = 0;
    const rankBreakExtraDice = [];
    const rankBreakBuffs = [];
    const rankBreakNotes = [];
    const processedSpellTiers = new Set();

    if (diceMatch) {
      count = parseInt(diceMatch[1], 10);
      sides = parseInt(diceMatch[2], 10);
    }

    if (sys.rankBreaks) {
      const breaks = [
        { thresh: 5, key: 'rank5', data: sys.rankBreaks.rank5, label: 'Rank 5' },
        { thresh: 10, key: 'rank10', data: sys.rankBreaks.rank10, label: 'Rank 10' },
        { thresh: 15, key: 'rank15', data: sys.rankBreaks.rank15, label: 'Rank 15' },
        { thresh: 20, key: 'rank20', data: sys.rankBreaks.rank20, label: 'Rank 20' }
      ];
      for (const b of breaks) {
        if (rank >= b.thresh && b.data) {
          let tierHandled = false;
          if (b.data.damageDice) {
            const cleanDice = b.data.damageDice.replace(/^\+/, '').trim();
            const dm = cleanDice.match(/^(\d+)d(\d+)$/i);
            if (dm && sides && parseInt(dm[2], 10) === sides) {
              count += parseInt(dm[1], 10);
              tierHandled = true;
            } else if (cleanDice) {
              rankBreakExtraDice.push(cleanDice);
              tierHandled = true;
            }
          }
          if (b.data.rankDamageDice) {
            extraSpellRankDice += Number(b.data.rankDamageDice) || 0;
            tierHandled = true;
          }
          if (b.data.debuff && !debuffs.includes(b.data.debuff)) {
            debuffs.push(b.data.debuff);
            tierHandled = true;
          }
          if (b.data.buffsResistances) {
            rankBreakBuffs.push(`${b.label}: ${b.data.buffsResistances}`);
            tierHandled = true;
          }
          if (b.data.notes) {
            rankBreakNotes.push(`${b.label}: ${b.data.notes}`);
            if (b.thresh === 15) {
              const multMatch = b.data.notes.match(/multiply\s+(?:the\s+)?base damage(?:\s+dice)?\s+by\s+(\d+)/i) ||
                b.data.notes.match(/base damage(?:\s+dice)?\s*(?:multiplied by|[×x*])\s*(\d+)/i) ||
                b.data.notes.match(/(\d+)\s*[×x*]\s*base damage/i);
              if (multMatch) {
                count *= parseInt(multMatch[1], 10);
                tierHandled = true;
              }
            }
          }
          if (tierHandled) processedSpellTiers.add(b.key);
        }
      }
    }

    // 2. Secondary fallback: check legacy rank upgrades if tier not already handled by structured rankBreaks
    const rawUpgrades = sys.upgrades || {};
    const upgrades = parseUpgrades(rawUpgrades);

    if (diceMatch) {
      if (rank >= 5 && upgrades.rank5 && !processedSpellTiers.has('rank5')) {
        const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)/i);
        if (u5 && parseInt(u5[2], 10) === sides) count += parseInt(u5[1], 10);
        if (/Burned Debuff/i.test(upgrades.rank5)) {
          debuffs.push(/1\s*or\s*more\s*Health\s*Bar/i.test(upgrades.rank5) ? 'Burned (on 1+ HB loss)' : 'Burned');
        }
      }
      if (rank >= 10 && upgrades.rank10 && !processedSpellTiers.has('rank10')) {
        const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)/i);
        if (u10 && parseInt(u10[2], 10) === sides) count += parseInt(u10[1], 10);
        if (/Force and Fire/i.test(upgrades.rank10)) {
          damageType = 'Force & Fire';
        }
        if (/Burned Debuff/i.test(upgrades.rank10) && !debuffs.includes('Burned')) {
          debuffs.push('Burned');
        }
      }
      if (rank >= 15 && upgrades.rank15 && !processedSpellTiers.has('rank15')) {
        const u15 = upgrades.rank15.match(/\+(\d+)d(\d+)/i);
        if (u15 && parseInt(u15[2], 10) === sides) count += parseInt(u15[1], 10);
        const multMatch = upgrades.rank15.match(/multiply\s+(?:the\s+)?base damage(?:\s+dice)?\s+by\s+(\d+)/i) ||
          upgrades.rank15.match(/base damage(?:\s+dice)?\s*(?:multiplied by|[×x*])\s*(\d+)/i) ||
          upgrades.rank15.match(/(\d+)\s*[×x*]\s*base damage/i);
        if (multMatch) {
          count *= parseInt(multMatch[1], 10);
        }
        if (/Burned Debuff/i.test(upgrades.rank15) && !debuffs.includes('Burned')) {
          debuffs.push('Burned');
        }
      }
    }

    if (sides > 0 && count > 0) {
      diceStr = `${count}d${sides}`;
    }

    // Determine governing stat
    let statKey = null;
    const statMatch = baseDmg ? baseDmg.match(/\+\s*(int|cha|con|dex|str)\b/i) : null;
    if (statMatch) {
      statKey = statMatch[1].toLowerCase();
    } else if (sys.stat) {
      if (sys.spellType === 'Attack') statKey = (sys.stat || 'int').toLowerCase();
    }

    const statMod = statKey && this.system.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;

    // Rank Damage Die scaling table
    const rankDie = getRankDamageDie(rank);
    if (extraSpellRankDice > 0 && rankDie.dice) {
      if (rankDie.dice.includes('+')) {
        rankDie.dice = rankDie.dice.replace(/(\d+)d(\d+)/, (_, c, s) => `${parseInt(c, 10) + extraSpellRankDice}d${s}`);
      } else {
        const dm = rankDie.dice.match(/(\d+)d(\d+)/i);
        if (dm) {
          const total = parseInt(dm[1], 10) + extraSpellRankDice;
          rankDie.dice = `${total}d${dm[2]}`;
        }
      }
    } else if (extraSpellRankDice > 0 && rankDie.value > 0) {
      rankDie.value += extraSpellRankDice;
    }

    const formulaComponents = [];
    if (diceStr) {
      formulaComponents.push(diceStr);
    } else if (flatMatch) {
      formulaComponents.push(flatMatch[1]);
    }

    for (const extraD of rankBreakExtraDice) {
      formulaComponents.push(extraD);
    }

    // Include explicit rank-gated damage modifiers
    let activeModFlat = 0;
    for (const m of activeMods) {
      if (m.dice) {
        formulaComponents.push(m.dice.trim());
      }
      if (m.value) {
        activeModFlat += Number(m.value) || 0;
      }
    }
    if (activeModFlat > 0) {
      formulaComponents.push(String(activeModFlat));
    }

    if (rankDie.dice) {
      formulaComponents.push(rankDie.dice);
    } else if (rankDie.value && sys.spellType !== 'Passive') {
      formulaComponents.push(String(rankDie.value));
    }

    let formula = formulaComponents.join(' + ') || '1d6';
    if (statKey) {
      formula += statMod >= 0 ? ` + ${statMod}` : ` - ${Math.abs(statMod)}`;
    }

    // Extract rider effects (e.g. blast radius, splash)
    let effects = '';
    if (baseDmg.includes(',')) {
      effects = baseDmg.split(',').slice(1).join(',').trim();
    }

    // Formulate readable formulaWithStat
    const formulaWithStatParts = [...formulaComponents];
    if (statKey) {
      formulaWithStatParts.push(statKey.charAt(0).toUpperCase() + statKey.slice(1));
    }
    const formulaWithStat = `${formulaWithStatParts.join(' + ')}${damageType ? ` ${damageType}` : ''}`.trim();

    return {
      hasDamage: true,
      dice: diceStr || (activeMods.map(m => m.dice).filter(Boolean).join(' + ')),
      baseDice: diceStr || (activeMods.map(m => m.dice).filter(Boolean).join(' + ')),
      rankDie: rankDie.dice || (rankDie.value ? String(rankDie.value) : ''),
      rankDieObj: rankDie,
      count,
      sides,
      stat: statKey,
      statMod,
      formula,
      formulaWithStat,
      damageType,
      effects,
      debuffs,
      rawBase: baseDmg,
      rank
    };
  }

  /**
   * Roll Spell Damage, producing an interactive CarlRPG damage card
   * @param {DCCItem} spellItem
   */
  async rollSpellDamage(spellItem) {
    const sys = spellItem.system || {};
    const rank = Math.max(Number(sys.modifiedRank) || 0, Number(sys.rank) || 0, 1);
    const dmgData = this.getSpellDamageData(spellItem);
    const formula = dmgData.hasDamage && dmgData.formula ? dmgData.formula : (sys.baseDamage || '1d6');
    const roll = await new Roll(formula).evaluate();

    const damageTypeStr = dmgData.damageType ? ` (${dmgData.damageType})` : '';
    const effectsList = [];
    if (dmgData.effects) effectsList.push(dmgData.effects);
    if (sys.limitations) effectsList.push(sys.limitations);
    if (dmgData.debuffs && dmgData.debuffs.length > 0) {
      effectsList.push(`Inflicts: ${dmgData.debuffs.map(d => `<strong>[${d} Debuff]</strong>`).join(', ')}`);
    }
    const effectsStr = effectsList.join(' | ');

    // Dynamic critical multiplier
    let critMultiplier = (sys.critMultiplier !== undefined) ? Number(sys.critMultiplier) : 2;
    if (sys.critMultiplierR15 && rank >= 15) {
      critMultiplier = Number(sys.critMultiplierR15);
    } else if (sys.critMultiplierR5 && rank >= 5) {
      critMultiplier = Number(sys.critMultiplierR5);
    }

    // On-hit debuff buttons
    let debuffButtonHtml = '';
    const allDebuffs = (dmgData.debuffs || []).filter(Boolean);
    if (allDebuffs.length > 0) {
      debuffButtonHtml = `
        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
          ${allDebuffs.map(deb => `
            <button type="button" class="dcc-apply-damage-btn" data-inflict-debuff="${deb}" style="width: 100%; background: #e74c3c; color: #fff; border: 1px solid #c0392b; border-radius: 3px; padding: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">
              <i class="fa-solid fa-skull-crossbones"></i> Inflict [${deb}]
            </button>
          `).join('')}
        </div>
      `;
    }

    const cardContent = `
      <div class="dcc-chat-card dcc-damage-card" data-attacker-id="${this.id}" data-item-id="${spellItem.id}" data-item-name="${spellItem.name}" data-damage-value="${roll.total}" data-attack-type="spell">
        <div class="dcc-damage-card-header">
          <strong>${this.name}</strong>: ${spellItem.name} Damage${damageTypeStr}
        </div>
        <div class="dcc-damage-card-result">
          <span class="dcc-damage-value">${roll.total}</span>
          <span class="dcc-damage-formula">(${formula})</span>
        </div>
        ${effectsStr ? `<div class="dcc-damage-effects"><em>${effectsStr}</em></div>` : ''}
        <div class="dcc-damage-actions">
          <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" title="Apply damage to targeted token(s), deducting their DR">
            <i class="fa-solid fa-crosshairs"></i> Apply to Target(s)
          </button>
          <div class="dcc-damage-sub-actions">
            <button type="button" class="dcc-apply-damage-btn" data-multiplier="0.5" title="Apply half damage">Half</button>
            <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" data-ignore-dr="true" title="Apply ignoring DR">Ignore DR</button>
            <button type="button" class="dcc-apply-damage-btn" data-multiplier="${critMultiplier}" title="Apply critical damage">Crit (${critMultiplier}x)</button>
          </div>
          ${debuffButtonHtml}
        </div>
      </div>
    `;

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${spellItem.name} (Spell Damage: ${formula})${damageTypeStr ? ` [${dmgData.damageType}]` : ''}${effectsStr ? ` - <em>${effectsStr}</em>` : ''}`,
      content: cardContent,
      flags: {
        'carl-rpg': {
          isDamageRoll: true,
          attackerId: this.id,
          itemId: spellItem.id,
          itemName: spellItem.name,
          attackType: 'spell',
          damageType: dmgData.damageType || '',
          rawDamage: roll.total,
          critMultiplier,
          debuffs: dmgData.debuffs || []
        }
      }
    });
  }

  /**
   * Roll Spell Attack / To-Hit
   * @param {DCCItem} spellItem
   */
  async rollSpellAttack(spellItem, options = {}) {
    const sys = spellItem.system || {};
    const statKey = (sys.stat || 'int').toLowerCase();
    const statMod = this.system.abilities?.[statKey]?.mod ?? 0;
    const rank = Math.max(Number(sys.modifiedRank) || 0, Number(sys.rank) || 0, 1);
    const total = rank + statMod;

    const advState = this.getRollAdvantageState({
      rollType: 'spell',
      stat: statKey,
      item: spellItem,
      options,
      tags: [sys.spellType].filter(Boolean)
    });

    let roll;
    let flavorText = '';
    if (advState.mode === 'disadvantage') {
      const formula = `2d20kl + ${total}`;
      roll = await new Roll(formula, { rank, mod: statMod }).evaluate();
      flavorText = `<strong>${this.name}</strong>: ${spellItem.name} (<strong>${advState.label || 'Disadvantage'}</strong>: 2d20kl + Rank ${rank} + ${statKey.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
    } else if (advState.mode === 'advantage') {
      const formula = `2d20kh + ${total}`;
      roll = await new Roll(formula, { rank, mod: statMod }).evaluate();
      flavorText = `<strong>${this.name}</strong>: ${spellItem.name} (<strong>${advState.label}</strong>: 2d20kh + Rank ${rank} + ${statKey.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
    } else if (advState.mode === 'cancelled') {
      const formula = `1d20 + ${total}`;
      roll = await new Roll(formula, { rank, mod: statMod }).evaluate();
      flavorText = `<strong>${this.name}</strong>: ${spellItem.name} (<strong>${advState.label}</strong>: 1d20 + Rank ${rank} + ${statKey.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
    } else {
      const formula = `1d20 + ${total}`;
      roll = await new Roll(formula, { rank, mod: statMod }).evaluate();
      flavorText = `<strong>${this.name}</strong>: ${spellItem.name} (Spell Attack / To Hit: 1d20 + Rank ${rank} + ${statKey.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
    }

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'spell',
        name: `${spellItem.name} (Attack)`,
        isUntrained: false
      }).catch(() => {});
    }

    const { targetResults, targetResultsHtml, currentFloor } = this._resolveAttackTargets(roll, options);
    const evadeBtnHtml = this._getEvadeButtonHtml(roll, currentFloor);

    // Check for Fumble on Natural 1
    const isFumble = roll.dice?.[0]?.results ? roll.dice[0].results.some(r => r.result === 1 && (r.active ?? true)) : (roll.terms?.[0]?.results ? roll.terms[0].results.some(r => r.result === 1 && (r.active ?? true)) : roll.total === 1);
    const fumbleDebuff = sys.fumbleDebuff || '';
    let fumbleTag = '';
    if (isFumble && fumbleDebuff) {
      fumbleTag = `
        <div class="dcc-fumble-warning" style="margin-top: 6px; padding: 4px 6px; background: #fdf2e9; border: 1px solid #e67e22; border-radius: 3px; color: #d35400; font-size: 11px;">
          <i class="fa-solid fa-triangle-exclamation"></i> <strong>FUMBLE!</strong> Spell critical miss inflicts <strong>${fumbleDebuff}</strong> on caster!
        </div>
      `;
    }

    let dmgBtnHtml = '';
    const dmgData = this.getSpellDamageData(spellItem);
    if (dmgData?.hasDamage) {
      const dmgFormula = dmgData.formulaWithStat || dmgData.formula;
      dmgBtnHtml = `
        <div style="margin-top: 6px;">
          <button type="button" class="dcc-attack-roll-btn roll-spell-dmg-from-card" data-actor-id="${this.id}" data-spell-id="${spellItem.id}" style="width: 100%; padding: 4px 8px; font-size: 11px; cursor: pointer; background: #8e44ad; color: #fff; border: 1px solid #71368a; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; font-family: var(--font-primary, 'Oswald', sans-serif);">
            <i class="fa-solid fa-burst"></i> Roll Spell Damage (${dmgFormula})
          </button>
        </div>
      `;
    }

    const rollHtml = typeof roll.render === 'function' ? await roll.render() : '';
    const content = [rollHtml, targetResultsHtml, fumbleTag, dmgBtnHtml, evadeBtnHtml].filter(Boolean).join('');

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: flavorText,
      content,
      flags: {
        'carl-rpg': {
          isAttackRoll: true,
          isSpellAttack: true,
          attackerId: this.id,
          attackerType: this.type,
          attackTotal: roll.total,
          currentFloor,
          targetResults: targetResults.map(tr => ({
            actorId: tr.actorId,
            actorName: tr.actorName,
            targetDC: tr.targetDC,
            isHit: tr.isHit,
            diff: tr.diff,
            outcome: tr.outcome
          }))
        }
      }
    });
  }

  /**
   * Cast/Roll a DCC Spell, posting a formatted chat card to chat
   * @param {DCCItem} spellItem
   * @param {'cast'|'damage'|'hit'|object} [action='cast']
   * @param {object} [options={}]
   */
  async rollSpell(spellItem, action = 'cast', options = {}) {
    let act = action;
    let opts = options;
    if (typeof action === 'object' && action !== null) {
      opts = action;
      act = action.action || 'cast';
    }
    if (act === 'damage') {
      return this.rollSpellDamage(spellItem);
    }
    if (act === 'hit') {
      return this.rollSpellAttack(spellItem, opts);
    }

    const sys = spellItem.system || {};
    const spellTags = spellItem.allTags || (typeof getItemAllTags === 'function' ? getItemAllTags(spellItem) : new Set(sys.tags || []));
    const isAura = sys.delivery === 'aura' || sys.area?.isAura || (spellTags && (spellTags.has('delivery.aura') || spellTags.has('shape.aura')));

    // If an aura is currently active, casting it toggles/dismisses it
    if (isAura && sys.active) {
      await this.deactivateAura(spellItem);
      const dismissContent = `
        <div class="dcc-chat-card dcc-spell-card dcc-aura-dismissed" style="font-family: var(--font-primary, sans-serif); border: 2px solid #7f8c8d;">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #7f8c8d; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px;" />
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${spellItem.name} — DISMISSED</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">Aura Deactivated</span>
            </div>
          </div>
          <div style="font-size: 12px; color: #555; background: #f8f9fa; border: 1px solid #e9ecef; padding: 6px 8px; border-radius: 3px;">
            <i class="fa-solid fa-power-off"></i> <strong>${this.name}</strong> dismissed the <strong>${spellItem.name}</strong> aura. Any temporary health bars or persistent effects have been cleared.
          </div>
        </div>
      `;
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: dismissContent,
        flags: {
          'carl-rpg': {
            isSpellCast: true,
            isAuraDismiss: true,
            auraItem: spellItem.id || spellItem._id
          }
        }
      });
    }

    const isFreeCast = Boolean(
      opts.freeCast ||
      opts.noMana ||
      opts.manaCost === 0 ||
      opts.originItem ||
      opts.isConsumable ||
      opts.isItemEffect ||
      sys.freeCast
    );
    const baseManaCost = Math.max(0, Number(sys.manaCost) || 0);

    // Check Favored spell mechanics (+1 MP for non-favored classes when caster has a class)
    const favoredTags = Array.from(spellTags).filter(t => typeof t === 'string' && t.startsWith('favored.'));

    let isFavored = true;
    let favoredPenalty = 0;

    const actorArchetypes = typeof this.getArchetypeTags === 'function' ? this.getArchetypeTags() : new Set();
    if (favoredTags.length > 0 && actorArchetypes.size > 0) {
      isFavored = favoredTags.some(ft => {
        const def = getTagDefinition(ft);
        const targetArchetype = def?.references || `archetype.${ft.replace(/^favored\./, '')}`;
        return targetArchetype && actorArchetypes.has(targetArchetype);
      });

      if (!isFavored) {
        favoredPenalty = 1;
      }
    }

    const effectiveCost = isFreeCast ? 0 : (opts.manaCost !== undefined ? Number(opts.manaCost) : (baseManaCost + favoredPenalty));
    const manaCost = effectiveCost;
    const rawMana = this.system?.attributes?.mana?.value !== undefined
      ? Number(this.system.attributes.mana.value)
      : (Number(this.system?.attributes?.mana?.max) || 0);
    const currentMana = Number.isFinite(rawMana) ? rawMana : 0;

    // Check existing mana: if insufficient and not a free cast, the spell fails
    if (manaCost > 0 && currentMana < manaCost) {
      globalThis.ui?.notifications?.warn?.(`DCC RPG | ${this.name} has insufficient Mana to cast ${spellItem.name}! (Needs ${manaCost} MP, has ${currentMana} MP)`);

      const failContent = `
        <div class="dcc-chat-card dcc-spell-card dcc-spell-failed" style="font-family: var(--font-primary, sans-serif); border: 2px solid #e74c3c;">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px; filter: grayscale(100%);" />
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #c0392b;">${spellItem.name} — FAILED</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">Insufficient Mana (${currentMana} / ${manaCost} MP)</span>
            </div>
          </div>
          <div style="font-size: 12px; color: #c0392b; background: #fdf2f2; border: 1px solid #f5c6cb; padding: 6px 8px; border-radius: 3px;">
            <i class="fa-solid fa-triangle-exclamation"></i> <strong>${this.name}</strong> attempted to cast <strong>${spellItem.name}</strong>, but lacks sufficient Mana! (Required: <strong>${manaCost} MP</strong>, Available: <strong>${currentMana} MP</strong>)
          </div>
        </div>
      `;

      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: failContent,
        flags: {
          'carl-rpg': {
            isSpellCast: true,
            spellFailed: true,
            reason: 'insufficient_mana',
            manaCost,
            baseManaCost,
            favoredPenalty,
            isFavored,
            currentMana
          }
        }
      });
    }

    // Subtract mana on successful cast (free casts from consumables/items never subtract mana)
    const updates = {};
    const newMana = Math.max(0, currentMana - manaCost);
    if (this.system?.attributes?.mana && manaCost > 0) {
      updates['system.attributes.mana.value'] = newMana;
    }

    // Check if casting Heal (target: self only, heals up to 2 bars of health, capped at max HP)
    const isHealSpell = spellItem.name?.trim().toLowerCase() === 'heal' ||
      (sys.spellType === 'Heal' && /2\s*(?:health\s*bar)?\s*slots?/i.test(sys.baseDamage || ''));

    let healInfo = null;
    if (isHealSpell) {
      const hpPerBar = getHpPerBar(this);
      const barsToHeal = 2;
      const maxHealAmount = barsToHeal * hpPerBar;
      const currentHp = Number(this.system?.attributes?.hp?.value ?? this.system?.attributes?.hp?.max ?? 0);
      const maxHp = Number(this.system?.attributes?.hp?.max) || (10 * hpPerBar);
      const newHp = Math.min(maxHp, currentHp + maxHealAmount);
      const actualHealed = Math.max(0, newHp - currentHp);
      const newPct = maxHp > 0 ? Math.min(100, Math.max(0, Math.round((newHp / maxHp) * 100))) : 100;

      if (this.system?.attributes?.hp) {
        updates['system.attributes.hp.value'] = newHp;
        updates['system.attributes.hp.pct'] = newPct;
      }

      healInfo = {
        hpPerBar,
        barsToHeal,
        maxHealAmount,
        actualHealed,
        currentHp,
        newHp,
        maxHp,
        newPct,
        target: 'self'
      };
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }

    let auraData = null;
    if (isAura) {
      auraData = await this.activateAura(spellItem);
    }

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      const freeCastSuffix = isFreeCast ? ' [0 MP Free Cast / Item Effect]' : '';
      DCCSessionEngine.recordRoll({
        actor: this,
        roll: { total: 0, formula: manaCost > 0 ? `${manaCost} MP` : '0 MP' },
        type: 'spell',
        name: spellItem.name,
        notes: healInfo
          ? `Cast Heal (+${healInfo.actualHealed} HP to self, ${healInfo.newHp}/${healInfo.maxHp} HP)${freeCastSuffix}`
          : `Cast ${spellItem.name} (${manaCost} MP)${freeCastSuffix}`
      }).catch(() => {});
    }

    const dmgData = this.getSpellDamageData(spellItem);

    const manaDisplay = isFreeCast
      ? `<span style="color: #27ae60; font-weight: bold;"><i class="fa-solid fa-gift"></i> 0 MP (Free Cast)</span>`
      : (manaCost > 0 ? `<span style="color: #2980b9; font-weight: bold;">${manaCost} MP</span>${favoredPenalty > 0 ? ` <small style="color: #c0392b; font-weight: bold;">(+1 non-favored)</small>` : ''} <small style="color: #7f8c8d;">(${newMana} MP left)</small>` : '<span style="color: #2980b9; font-weight: bold;">None</span>');

    const sourceBadge = opts.originItem || opts.isConsumable || opts.isItemEffect
      ? `<div><strong>Source:</strong> <span style="color: #8e44ad; font-weight: bold;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${opts.originItem?.name || 'Item / Consumable Effect'}</span></div>`
      : '';

    let content = `
      <div class="dcc-chat-card dcc-spell-card ${isFreeCast ? 'dcc-free-cast' : ''}" style="font-family: var(--font-primary, sans-serif);">
        <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
          <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px;" />
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${spellItem.name}</h3>
            <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">${sys.spellType || 'Spell'}${sys.damageType ? ` • ${sys.damageType}` : ''}${isFreeCast ? ' • FREE CAST' : ''}</span>
          </div>
        </div>
    `;

    if (sys.quote) {
      content += `<div style="font-style: italic; color: #555; font-size: 12px; margin-bottom: 8px; border-left: 3px solid #d4af37; padding-left: 6px;">“${sys.quote}”</div>`;
    }

    content += `
      <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #fdfaf2; border: 1px solid #e2d9c2; padding: 4px 6px; border-radius: 3px;">
        <div><strong>Mana:</strong> ${manaDisplay}</div>
        ${sourceBadge}
        <div><strong>Range:</strong> ${sys.range || (isAura ? 'Self' : '30 feet')}</div>
        <div><strong>Target:</strong> ${sys.target || (isAura ? 'Self' : (healInfo ? 'Self only' : 'Target'))}</div>
        <div><strong>Duration:</strong> ${sys.duration || 'Instantaneous'}</div>
        ${sys.cooldown && sys.cooldown !== 'None' ? `<div><strong>Cooldown:</strong> ${sys.cooldown}</div>` : ''}
        ${sys.favored ? `<div><strong>Favored:</strong> ${sys.favored}</div>` : ''}
        ${sys.aiFavor ? `<div><strong>AI Favor:</strong> +${sys.aiFavor}</div>` : ''}
      </div>
    `;

    if (healInfo) {
      content += `
        <div class="dcc-heal-effect" style="margin: 8px 0; padding: 8px 10px; background: #eafaf1; border: 1px solid #2ecc71; border-radius: 4px; color: #1e8449; font-size: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-heart-pulse" style="font-size: 18px; color: #27ae60;"></i>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 13px;">
              ${healInfo.actualHealed > 0 ? `Healed +${healInfo.actualHealed} HP` : 'Already at Full Health'}
              <span style="font-weight: normal; font-size: 11px; color: #27ae60;">(up to ${healInfo.barsToHeal} Health Bar slots)</span>
            </div>
            <div style="font-size: 11px; color: #444; margin-top: 2px;">
              Target: <strong>Self only</strong> • Health: <strong>${healInfo.newHp} / ${healInfo.maxHp} HP</strong> (${healInfo.newPct}%)
            </div>
          </div>
        </div>
      `;
    }

    if (sys.baseDamage) {
      content += `<div style="margin-bottom: 6px; font-weight: bold; color: #c0392b; font-size: 13px;">Base Damage: ${sys.baseDamage}</div>`;
    }

    if (sys.description) {
      content += `<div style="font-size: 12px; line-height: 1.4; margin-bottom: 8px;">${sys.description}</div>`;
    }

    const formatRankBreak = (rb, legacy) => {
      const parts = [];
      if (rb) {
        if (rb.damageDice) parts.push(`+${rb.damageDice.replace(/^\+/, '')} Dmg`);
        if (rb.rankDamageDice && Number(rb.rankDamageDice) > 0) parts.push(`+${rb.rankDamageDice} Rank ${Number(rb.rankDamageDice) === 1 ? 'Die' : 'Dice'}`);
        if (rb.buffsResistances) parts.push(`Buff/Resist: ${rb.buffsResistances}`);
        if (rb.debuff) parts.push(`Debuff: [${rb.debuff}]`);
        if (rb.notes) parts.push(rb.notes);
      }
      if (parts.length === 0 && legacy && legacy !== 'None') {
        return legacy;
      }
      return parts.join(' | ');
    };

    const rb5 = formatRankBreak(sys.rankBreaks?.rank5, sys.upgrades?.rank5);
    const rb10 = formatRankBreak(sys.rankBreaks?.rank10, sys.upgrades?.rank10);
    const rb15 = formatRankBreak(sys.rankBreaks?.rank15, sys.upgrades?.rank15);
    const rb20 = formatRankBreak(sys.rankBreaks?.rank20, sys.upgrades?.rank20);

    if (rb5 || rb10 || rb15 || rb20) {
      content += `<div style="border-top: 1px dashed #ccc; padding-top: 4px; font-size: 11px; color: #444; margin-top: 6px;">`;
      content += `<div style="font-weight: bold; font-size: 10px; text-transform: uppercase; color: #7f8c8d; margin-bottom: 3px;">Rank Breaks:</div>`;
      if (rb5) content += `<div><strong style="color: #27ae60;">Rank 5:</strong> ${rb5}</div>`;
      if (rb10) content += `<div><strong style="color: #2980b9;">Rank 10:</strong> ${rb10}</div>`;
      if (rb15) content += `<div><strong style="color: #8e44ad;">Rank 15:</strong> ${rb15}</div>`;
      if (rb20) content += `<div><strong style="color: #d35400;">Rank 20:</strong> ${rb20}</div>`;
      content += `</div>`;
    }

    // Embed Roll Spell Damage action button if the spell discusses damage
    if (dmgData.hasDamage) {
      content += `
        <div style="margin-top: 10px; padding-top: 6px; border-top: 1px dashed #c0392b;">
          <button type="button" class="dcc-btn roll-spell-dmg-from-card" data-spell-id="${spellItem.id || spellItem._id || ''}" data-actor-id="${this.id}" style="width: 100%; background: #c0392b; color: #fff; border: 1px solid #7f1d1d; border-radius: 4px; padding: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font-primary, sans-serif); font-size: 12px;">
            <i class="fa-solid fa-burst"></i> Roll Spell Damage (${dmgData.formula})
          </button>
        </div>
      `;
    }

    if (auraData) {
      content += `
        <div class="dcc-aura-effect" style="margin: 8px 0; padding: 8px 10px; background: #fff8e7; border: 1px solid #d4af37; border-radius: 4px; color: #856404; font-size: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: bold; font-size: 13px; color: #b7791f;"><i class="fa-solid fa-atom"></i> Aura Active: ${auraData.radius}ft Radius</span>
            <button type="button" class="dcc-btn dcc-dismiss-aura-btn" data-actor-id="${this.id}" data-spell-id="${spellItem.id || spellItem._id}" style="padding: 2px 6px; font-size: 11px; background: #e2e8f0; border: 1px solid #cbd5e0; border-radius: 3px; cursor: pointer; color: #2d3748;">
              <i class="fa-solid fa-power-off"></i> Dismiss
            </button>
          </div>
          ${auraData.totalTempHp > 0 ? `<div><i class="fa-solid fa-shield-heart" style="color: #d4af37;"></i> Granted <strong>${auraData.slots}</strong> Temporary Health Bars (${auraData.hpPerSlot} HP/slot, <strong>${auraData.totalTempHp} Temp HP</strong> total)</div>` : ''}
          <div><i class="fa-solid fa-users"></i> Target: <strong>${auraData.target || 'Self'}</strong> (${auraData.targetFilter} within <strong>${auraData.radius}ft</strong>) • Duration: <strong>${auraData.remainingRounds} combat rounds</strong></div>
        </div>
      `;
    }

    if (sys.delivery === 'placed' || (sys.area?.hasArea && !isAura)) {
      const areaShape = sys.area?.shape || 'circle';
      const areaRadius = Number(sys.area?.radius) || 20;
      content += `
        <div style="margin-top: 10px; padding-top: 6px; border-top: 1px dashed #e74c3c;">
          <button type="button" class="dcc-btn place-aoe-template-btn" data-spell-id="${spellItem.id || spellItem._id || ''}" data-actor-id="${this.id}" data-radius="${areaRadius}" data-shape="${areaShape}" style="width: 100%; background: #e67e22; color: #fff; border: 1px solid #d35400; border-radius: 4px; padding: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font-primary, sans-serif); font-size: 12px;">
            <i class="fa-solid fa-bullseye"></i> Place Area of Effect (${areaRadius}ft ${areaShape})
          </button>
        </div>
      `;
    }

    content += `</div>`;

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content,
      flags: {
        'carl-rpg': {
          isSpellCast: true,
          spellSuccess: true,
          manaCost,
          baseManaCost,
          favoredPenalty,
          isFavored,
          freeCast: isFreeCast,
          remainingMana: isFreeCast ? currentMana : newMana,
          isHeal: Boolean(healInfo),
          healInfo: healInfo || null,
          isAura: Boolean(isAura),
          auraData: auraData || null,
          originItemName: opts.originItem?.name || null,
          isItemEffect: Boolean(opts.isItemEffect || opts.isConsumable || opts.originItem)
        }
      }
    });
  }

  /**
   * Retrieve all achievements collected by this actor.
   * @returns {Array<DCCItem>}
   */
  getAchievements() {
    return (this.items || []).filter(i => i.type === 'achievement');
  }

  /**
   * Announce an achievement unlocked by this crawler to the chat log with Dungeon AI flair.
   * @param {DCCItem|string} achievement
   */
  async announceAchievement(achievement) {
    const item = typeof achievement === 'string'
      ? (this.items.get ? this.items.get(achievement) : (this.items || []).find(i => i.id === achievement))
      : achievement;

    if (!item) return null;

    const sys = item.system || {};
    const title = item.name || 'UNNAMED ACHIEVEMENT';
    const quote = sys.quote || sys.description || 'The Dungeon AI watches in silent, amused judgment.';
    const reward = sys.reward || 'Special Recognition';
    const contents = sys.rewardContents || '';
    const tier = (sys.tier || 'bronze').toLowerCase();
    const floor = sys.floor || this.system?.details?.floor || '1st Floor';

    // Tier styling
    const tierIcons = {
      bronze: 'fa-solid fa-medal',
      silver: 'fa-solid fa-shield',
      gold: 'fa-solid fa-trophy',
      platinum: 'fa-solid fa-gem',
      legendary: 'fa-solid fa-dragon',
      celestial: 'fa-solid fa-crown',
      quest: 'fa-solid fa-map',
      secret: 'fa-solid fa-mask',
      special: 'fa-solid fa-award'
    };
    const tierColors = {
      bronze: '#cd7f32',
      silver: '#bdc3c7',
      gold: '#f1c40f',
      platinum: '#00d2d3',
      legendary: '#e67e22',
      celestial: '#9b59b6',
      quest: '#3498db',
      secret: '#1abc9c',
      special: '#e74c3c'
    };

    const icon = tierIcons[tier] || 'fa-solid fa-trophy';
    const color = tierColors[tier] || '#e74c3c';

    const chatContent = `
      <div class="dcc-chat-card dcc-ai-announcement-card dcc-achievement-card" style="border: 2px solid #c0392b; background: #181818; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
        <div style="background: #c0392b; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-bullhorn"></i> NEW ACHIEVEMENT UNLOCKED!
        </div>
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 8px;">
          <img src="${this.img || 'icons/svg/mystery-man.svg'}" style="width: 44px; height: 44px; border-radius: 4px; border: 2px solid ${color}; object-fit: cover;" />
          <div style="flex: 1;">
            <div style="color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Crawler: <strong style="color: #fff;">${this.name}</strong> • ${floor}</div>
            <h3 style="margin: 2px 0 0 0; color: #fff; font-size: 17px; font-weight: bold; text-shadow: 0 1px 3px #000; line-height: 1.2;">
              <i class="${icon}" style="color: ${color};"></i> ${title}
            </h3>
          </div>
          <span style="border: 1px solid ${color}; color: ${color}; font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
            ${tier}
          </span>
        </div>
        <div style="background: rgba(0,0,0,0.5); border-left: 3px solid #c0392b; padding: 8px 12px; font-style: italic; font-size: 13px; color: #eee; margin-bottom: 10px; line-height: 1.45;">
          “${quote}”
        </div>
        <div style="background: #222; border: 1px solid #333; padding: 8px 10px; border-radius: 4px; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #aaa; text-transform: uppercase; font-size: 11px;"><i class="fa-solid fa-gift"></i> Reward:</span>
            <span style="color: #2ecc71; font-weight: bold; font-size: 13px;">${reward}</span>
          </div>
          ${contents ? `<div style="font-size: 11px; color: #ccc; border-top: 1px solid #333; padding-top: 4px;"><strong>Contents:</strong> ${contents}</div>` : ''}
          ${sys.favor ? `<div style="font-size: 11px; color: #f1c40f;"><i class="fa-solid fa-hand-sparkles"></i> AI Favor: +${sys.favor}</div>` : ''}
          ${sys.xp ? `<div style="font-size: 11px; color: #3498db;"><i class="fa-solid fa-bolt"></i> XP: +${sys.xp}</div>` : ''}
        </div>
      </div>
    `;

    return ChatMessage.create({
      speaker: { alias: 'THE DUNGEON AI' },
      content: chatContent,
      flags: {
        'carl-rpg': {
          isAchievement: true,
          actorId: this.id,
          achievementId: item.id,
          title,
          tier,
          reward
        }
      }
    });
  }

  /**
   * Compute stars and skulls summary for display across tokens, sheets, combat tracker, and chat.
   * @returns {object} { stars, skulls, counts, totalBossKills, crawlerKills, hasBadges, fullTooltip, html, text }
   */
  getBadgeSummary() {
    const trophies = this.system?.trophies || {};
    const bosses = trophies.bosses || {};
    const tierOrder = ['celestial', 'legendary', 'platinum', 'gold', 'silver', 'bronze'];

    const counts = {
      bronze: Math.max(0, Number(bosses.bronze) || 0),
      silver: Math.max(0, Number(bosses.silver) || 0),
      gold: Math.max(0, Number(bosses.gold) || 0),
      platinum: Math.max(0, Number(bosses.platinum) || 0),
      legendary: Math.max(0, Number(bosses.legendary) || 0),
      celestial: Math.max(0, Number(bosses.celestial) || 0)
    };

    const stars = [];
    let textStars = '';
    for (const tierKey of tierOrder) {
      const count = counts[tierKey];
      const tierDef = DCC_BOSS_TIERS[tierKey];
      if (!tierDef) continue;
      for (let i = 0; i < count; i++) {
        stars.push({
          tier: tierKey,
          label: tierDef.label,
          bossLevel: tierDef.bossLevel,
          color: tierDef.color,
          icon: tierDef.icon,
          class: tierDef.cssClass,
          title: `${tierDef.label} (${tierDef.bossLevel})`
        });
        textStars += '★';
      }
    }

    const crawlerKills = Math.max(0, Number(trophies.crawlers?.count) || 0);
    const skulls = [];
    let textSkulls = '';
    for (let i = 0; i < crawlerKills; i++) {
      skulls.push({
        label: 'Crawler Skull',
        color: '#ecf0f1',
        icon: 'fa-solid fa-skull',
        class: 'crawler-skull',
        title: 'Crawler Kill (Slain Crawler)'
      });
      textSkulls += '💀';
    }

    const totalBossKills = stars.length;
    const hasBadges = totalBossKills > 0 || crawlerKills > 0;

    const breakdownParts = [];
    if (counts.celestial > 0) breakdownParts.push(`${counts.celestial} Celestial (${DCC_BOSS_TIERS.celestial.bossLevel})`);
    if (counts.legendary > 0) breakdownParts.push(`${counts.legendary} Legendary (${DCC_BOSS_TIERS.legendary.bossLevel})`);
    if (counts.platinum > 0) breakdownParts.push(`${counts.platinum} Platinum (${DCC_BOSS_TIERS.platinum.bossLevel})`);
    if (counts.gold > 0) breakdownParts.push(`${counts.gold} Gold (${DCC_BOSS_TIERS.gold.bossLevel})`);
    if (counts.silver > 0) breakdownParts.push(`${counts.silver} Silver (${DCC_BOSS_TIERS.silver.bossLevel})`);
    if (counts.bronze > 0) breakdownParts.push(`${counts.bronze} Bronze (${DCC_BOSS_TIERS.bronze.bossLevel})`);

    const summaryTitleParts = [];
    if (totalBossKills > 0) {
      summaryTitleParts.push(`${totalBossKills} Boss Star${totalBossKills === 1 ? '' : 's'} [${breakdownParts.join(', ')}]`);
    }
    if (crawlerKills > 0) {
      summaryTitleParts.push(`${crawlerKills} Crawler Kill${crawlerKills === 1 ? '' : 's'} (Skull${crawlerKills === 1 ? '' : 's'})`);
    }
    const fullTooltip = summaryTitleParts.join(' • ') || 'No Boss Stars or Crawler Skulls';

    let starsHtml = '';
    for (const star of stars) {
      starsHtml += `<i class="${star.icon} ${star.class}" data-tooltip="${star.title}" style="color: ${star.color}; margin: 0 1px;"></i>`;
    }

    let skullsHtml = '';
    for (const skull of skulls) {
      skullsHtml += `<i class="${skull.icon} ${skull.class}" data-tooltip="${skull.title}" style="color: ${skull.color}; margin: 0 1px;"></i>`;
    }

    const html = hasBadges
      ? `<span class="dcc-badge-strip" data-tooltip="${fullTooltip}"><span class="dcc-star-cluster">${starsHtml}</span>${skullsHtml ? `<span class="dcc-skull-cluster" style="margin-left: 4px;">${skullsHtml}</span>` : ''}</span>`
      : '';

    const text = [textStars, textSkulls].filter(Boolean).join(' ');

    return {
      stars,
      skulls,
      counts,
      totalBossKills,
      crawlerKills,
      hasBadges,
      fullTooltip,
      html,
      text
    };
  }

  /**
   * Record a boss kill, awarding a color-coded star and posting an AI announcement.
   * @param {object} params
   * @param {string} params.name - Boss name
   * @param {string} params.tier - Boss tier or classification
   * @param {string} [params.floor] - Floor where kill occurred
   * @param {string} [params.date] - Optional date stamp
   * @param {boolean} [params.announce=true] - Whether to post chat card
   * @returns {Promise<object>} The recorded kill log entry
   */
  async recordBossKill({ name = 'Unnamed Boss', tier = 'bronze', floor = '', date = '', announce = true } = {}) {
    const normalizedTier = getBossTierFromClassification(tier);
    const trophies = structuredClone(this.system?.trophies || {
      bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
      bossLog: [],
      crawlers: { count: 0 },
      crawlerLog: []
    });

    if (!trophies.bosses) {
      trophies.bosses = { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 };
    }
    if (!Array.isArray(trophies.bossLog)) {
      trophies.bossLog = [];
    }

    trophies.bosses[normalizedTier] = Math.max(0, Number(trophies.bosses[normalizedTier]) || 0) + 1;

    const killFloor = floor || this.system?.details?.floor || (typeof DCCActor !== 'undefined' && typeof DCCActor.getCurrentFloor === 'function' ? `Floor ${DCCActor.getCurrentFloor()}` : '1st Floor');
    const killDate = date || (typeof game !== 'undefined' && game.time?.worldTime ? `World Time ${game.time.worldTime}` : new Date().toLocaleDateString());
    const killId = (typeof foundry !== 'undefined' && foundry.utils?.randomID)
      ? foundry.utils.randomID()
      : ('bkill-' + Math.random().toString(36).substring(2, 9));

    const killEntry = {
      id: killId,
      name,
      tier: normalizedTier,
      bossLevel: DCC_BOSS_TIERS[normalizedTier]?.bossLevel || 'Boss',
      floor: killFloor,
      date: killDate
    };
    trophies.bossLog.unshift(killEntry);

    await this.update({
      'system.trophies': trophies
    });

    if (announce && typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
      await this.postBossKillCard(killEntry);
    }

    return killEntry;
  }

  /**
   * Record a fellow crawler kill, awarding a skull and posting an AI announcement.
   * @param {object} params
   * @param {string} params.name - Slain crawler name
   * @param {string} [params.crawlerNumber] - Slain crawler number
   * @param {string} [params.floor] - Floor where kill occurred
   * @param {string} [params.date] - Optional date stamp
   * @param {boolean} [params.announce=true] - Whether to post chat card
   * @returns {Promise<object>} The recorded kill log entry
   */
  async recordCrawlerKill({ name = 'Rival Crawler', crawlerNumber = '', floor = '', date = '', announce = true } = {}) {
    const trophies = structuredClone(this.system?.trophies || {
      bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
      bossLog: [],
      crawlers: { count: 0 },
      crawlerLog: []
    });

    if (!trophies.crawlers) {
      trophies.crawlers = { count: 0 };
    }
    if (!Array.isArray(trophies.crawlerLog)) {
      trophies.crawlerLog = [];
    }

    trophies.crawlers.count = Math.max(0, Number(trophies.crawlers.count) || 0) + 1;

    const killFloor = floor || this.system?.details?.floor || (typeof DCCActor !== 'undefined' && typeof DCCActor.getCurrentFloor === 'function' ? `Floor ${DCCActor.getCurrentFloor()}` : '1st Floor');
    const killDate = date || (typeof game !== 'undefined' && game.time?.worldTime ? `World Time ${game.time.worldTime}` : new Date().toLocaleDateString());
    const killId = (typeof foundry !== 'undefined' && foundry.utils?.randomID)
      ? foundry.utils.randomID()
      : ('ckill-' + Math.random().toString(36).substring(2, 9));

    const killEntry = {
      id: killId,
      name,
      crawlerNumber: crawlerNumber || '',
      floor: killFloor,
      date: killDate
    };
    trophies.crawlerLog.unshift(killEntry);

    await this.update({
      'system.trophies': trophies
    });

    if (announce && typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
      await this.postCrawlerKillCard(killEntry);
    }

    return killEntry;
  }

  /**
   * Remove a logged boss kill by ID and decrement tier count.
   * @param {string} killId
   */
  async removeBossKill(killId) {
    const trophies = structuredClone(this.system?.trophies || {});
    if (!Array.isArray(trophies.bossLog)) return;
    const index = trophies.bossLog.findIndex(k => k.id === killId);
    if (index === -1) return;
    const [removed] = trophies.bossLog.splice(index, 1);
    if (removed?.tier && trophies.bosses && trophies.bosses[removed.tier] !== undefined) {
      trophies.bosses[removed.tier] = Math.max(0, (Number(trophies.bosses[removed.tier]) || 0) - 1);
    }
    await this.update({ 'system.trophies': trophies });
  }

  /**
   * Remove a logged crawler kill by ID and decrement skull count.
   * @param {string} killId
   */
  async removeCrawlerKill(killId) {
    const trophies = structuredClone(this.system?.trophies || {});
    if (!Array.isArray(trophies.crawlerLog)) return;
    const index = trophies.crawlerLog.findIndex(k => k.id === killId);
    if (index === -1) return;
    trophies.crawlerLog.splice(index, 1);
    if (trophies.crawlers) {
      trophies.crawlers.count = Math.max(0, (Number(trophies.crawlers.count) || 0) - 1);
    }
    await this.update({ 'system.trophies': trophies });
  }

  /**
   * Broadcast Dungeon AI Announcement chat card when a boss is slain.
   * @param {object} killEntry
   */
  async postBossKillCard(killEntry) {
    const tierDef = DCC_BOSS_TIERS[killEntry.tier] || DCC_BOSS_TIERS.bronze;
    const summary = this.getBadgeSummary();
    const totalStars = summary.totalBossKills;

    const chatContent = `
      <div class="dcc-chat-card dcc-ai-announcement-card dcc-boss-kill-card" style="border: 2px solid ${tierDef.color}; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.7);">
        <div style="background: ${tierDef.color}; color: #111; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-star"></i> NEW BOSS STAR AWARDED!
        </div>
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
          <img src="${this.img || 'icons/svg/mystery-man.svg'}" style="width: 44px; height: 44px; border-radius: 4px; border: 2px solid ${tierDef.color}; object-fit: cover;" />
          <div style="flex: 1;">
            <div style="color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Crawler: <strong style="color: #fff;">${this.name}</strong> • ${killEntry.floor}</div>
            <h3 style="margin: 2px 0 0 0; color: #fff; font-size: 17px; font-weight: bold; line-height: 1.2;">
              <i class="fa-solid fa-star" style="color: ${tierDef.color};"></i> ${tierDef.label} (${tierDef.bossLevel})
            </h3>
          </div>
          <span style="border: 1px solid ${tierDef.color}; color: ${tierDef.color}; font-size: 11px; text-transform: uppercase; padding: 3px 8px; border-radius: 3px; font-weight: bold;">
            ${tierDef.bossLevel}
          </span>
        </div>
        <div style="background: rgba(0,0,0,0.5); border-left: 3px solid ${tierDef.color}; padding: 8px 12px; font-style: italic; font-size: 13px; color: #eee; margin-bottom: 10px; line-height: 1.4;">
          “ATTENTION CRAWLERS! A boss has been slaughtered! <strong>${this.name}</strong> dealt the final blow to <strong>${killEntry.name}</strong>! A brand new ${tierDef.label} has been pinned to their name for the entire dungeon to see.”
        </div>
        <div style="background: #1e1e24; border: 1px solid #333; padding: 8px 10px; border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #aaa; text-transform: uppercase; font-size: 11px;"><i class="fa-solid fa-trophy"></i> Total Boss Stars:</span>
          <span style="color: #f1c40f; font-weight: bold; font-size: 14px;">${totalStars} ⭐</span>
        </div>
      </div>
    `;

    return ChatMessage.create({
      speaker: { alias: 'THE DUNGEON AI' },
      content: chatContent,
      flags: {
        'carl-rpg': {
          isBossKill: true,
          actorId: this.id,
          bossName: killEntry.name,
          tier: killEntry.tier
        }
      }
    });
  }

  /**
   * Broadcast Dungeon AI Announcement chat card when a rival crawler is slain.
   * @param {object} killEntry
   */
  async postCrawlerKillCard(killEntry) {
    const summary = this.getBadgeSummary();
    const totalSkulls = summary.crawlerKills;

    const chatContent = `
      <div class="dcc-chat-card dcc-ai-announcement-card dcc-crawler-kill-card" style="border: 2px solid #c0392b; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.7);">
        <div style="background: #c0392b; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-skull"></i> COLD-BLOODED CRAWLER KILL!
        </div>
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
          <img src="${this.img || 'icons/svg/mystery-man.svg'}" style="width: 44px; height: 44px; border-radius: 4px; border: 2px solid #c0392b; object-fit: cover;" />
          <div style="flex: 1;">
            <div style="color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Killer: <strong style="color: #fff;">${this.name}</strong> • ${killEntry.floor}</div>
            <h3 style="margin: 2px 0 0 0; color: #e74c3c; font-size: 17px; font-weight: bold; line-height: 1.2;">
              <i class="fa-solid fa-skull" style="color: #fff;"></i> Slain: ${killEntry.name} ${killEntry.crawlerNumber ? `(${killEntry.crawlerNumber})` : ''}
            </h3>
          </div>
          <span style="border: 1px solid #c0392b; color: #e74c3c; font-size: 11px; text-transform: uppercase; padding: 3px 8px; border-radius: 3px; font-weight: bold;">
            PvP Kill
          </span>
        </div>
        <div style="background: rgba(0,0,0,0.5); border-left: 3px solid #c0392b; padding: 8px 12px; font-style: italic; font-size: 13px; color: #eee; margin-bottom: 10px; line-height: 1.4;">
          “Someone call the clean-up crew! <strong>${this.name}</strong> just eliminated <strong>${killEntry.name}</strong>. A new skull has been freshly carved beside their name. Watch your back around this one, folks!”
        </div>
        <div style="background: #1e1e24; border: 1px solid #333; padding: 8px 10px; border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #aaa; text-transform: uppercase; font-size: 11px;"><i class="fa-solid fa-skull"></i> Total Crawler Skulls:</span>
          <span style="color: #e74c3c; font-weight: bold; font-size: 14px;">${totalSkulls} 💀</span>
        </div>
      </div>
    `;

    return ChatMessage.create({
      speaker: { alias: 'THE DUNGEON AI' },
      content: chatContent,
      flags: {
        'carl-rpg': {
          isCrawlerKill: true,
          actorId: this.id,
          slainName: killEntry.name
        }
      }
    });
  }

  /**
   * Apply the canonical stackable Fatigued debuff to this actor.
   * "You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest."
   * @returns {Promise<Item>}
   */
  async applyFatiguedDebuff() {
    const debuffData = {
      name: 'Fatigued',
      type: 'debuff',
      img: 'icons/conditions/fatigued.webp',
      system: {
        severity: 'Minor',
        damageType: '',
        reductionPercent: 0,
        rounding: 'up',
        statModifiers: [],
        damageModifiers: [],
        duration: 'Until the end of a long rest.',
        description: 'You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest.'
      }
    };
    const created = await this.createEmbeddedDocuments('Item', [debuffData]);
    return created[0] || null;
  }


  /**
   * Mend injury debuffs from this actor.
   * @param {string} [severity='minor'] 'minor' | 'major' | 'long_term' | 'any'
   * @returns {Promise<Array<object>>} Removed debuffs
   */
  async mendInjury(severity = 'minor') {
    const norm = String(severity || 'minor').toLowerCase().trim();
    const allDebuffs = this.items
      ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff'))
      : [];

    const toRemove = [];
    for (const debuff of allDebuffs) {
      const dName = debuff.name.toLowerCase().trim();
      const dSev = String(debuff.system?.injurySeverity || debuff.system?.severity || '').toLowerCase().trim();
      const isInjury = Boolean(dSev) || dName.includes('injury') || dName.includes('wound') || dName.includes('broken') || dName.includes('fracture') || dName.includes('sprain') || dName.includes('shatter');
      if (!isInjury) continue;

      if (norm === 'all' || norm === 'any') {
        toRemove.push(debuff);
      } else if (norm === 'minor') {
        if (dSev === 'minor' || (dName.includes('minor') && !dName.includes('long-term')) || dName.includes('sprain') || (!dSev && !dName.includes('major') && !dName.includes('long-term') && !dName.includes('shatter'))) {
          toRemove.push(debuff);
          break;
        }
      } else if (norm === 'major') {
        if (dSev === 'major' || (dName.includes('major') && !dName.includes('long-term')) || dName.includes('shatter') || dName.includes('broken')) {
          toRemove.push(debuff);
          break;
        }
      } else if (norm.includes('long')) {
        if (dSev.includes('long') || dName.includes('long-term')) {
          toRemove.push(debuff);
          break;
        }
      } else if (dSev === norm || dName.includes(norm)) {
        toRemove.push(debuff);
        break;
      }
    }

    if (toRemove.length > 0) {
      const ids = toRemove.map(i => i.id || i._id).filter(Boolean);
      if (typeof this.deleteEmbeddedDocuments === 'function' && ids.length) {
        await this.deleteEmbeddedDocuments('Item', ids);
      } else {
        for (const item of toRemove) {
          if (typeof item.delete === 'function') {
            await item.delete();
          } else if (Array.isArray(this.items)) {
            const idx = this.items.findIndex(i => (i.id === item.id || i._id === item.id));
            if (idx !== -1) this.items.splice(idx, 1);
          }
        }
      }
    }
    return toRemove;
  }

  /**
   * Cure debuffs matching filter ('all', 'poison', 'disease', 'bleed', etc.)
   * @param {string} [filter='all']
   * @returns {Promise<Array<object>>} Removed debuffs
   */
  async cureDebuffs(filter = 'all') {
    const norm = String(filter || 'all').toLowerCase().trim();
    const allDebuffs = this.items
      ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff'))
      : [];

    const toRemove = [];
    for (const debuff of allDebuffs) {
      const dName = debuff.name.toLowerCase().trim();
      const dType = String(debuff.system?.damageType || '').toLowerCase().trim();
      if (norm === 'all') {
        toRemove.push(debuff);
      } else if (dName.includes(norm) || dType.includes(norm)) {
        toRemove.push(debuff);
      }
    }

    if (toRemove.length > 0) {
      const ids = toRemove.map(i => i.id || i._id).filter(Boolean);
      if (typeof this.deleteEmbeddedDocuments === 'function' && ids.length) {
        await this.deleteEmbeddedDocuments('Item', ids);
      } else {
        for (const item of toRemove) {
          if (typeof item.delete === 'function') {
            await item.delete();
          } else if (Array.isArray(this.items)) {
            const idx = this.items.findIndex(i => (i.id === item.id || i._id === item.id));
            if (idx !== -1) this.items.splice(idx, 1);
          }
        }
      }
    }
    return toRemove;
  }

  /**
   * Apply fixed number of health bars of healing to this actor.
   * @param {number} [bars=1]
   * @returns {Promise<object>}
   */
  async applyHealingBars(bars = 1) {
    const hpPerBar = getHpPerBar(this);
    const healAmt = bars * hpPerBar;
    const currentHp = Number(this.system?.attributes?.hp?.value ?? this.system?.attributes?.hp?.max ?? 0);
    const maxHp = Number(this.system?.attributes?.hp?.max) || (10 * hpPerBar);
    const newHp = Math.min(maxHp, currentHp + healAmt);
    const actualHealed = Math.max(0, newHp - currentHp);
    const hpPct = maxHp > 0 ? Math.round((newHp / maxHp) * 100) : 100;
    await this.update({
      'system.attributes.hp.value': newHp,
      'system.attributes.hp.pct': hpPct
    });
    return { actualHealed, newHp, maxHp, bars, hpPerBar };
  }

  /**
   * Apply a Heal Over Time (HoT) buff to this actor.
   * @param {object} params
   * @param {string} [params.name]
   * @param {number} [params.healBars=1]
   * @param {number} [params.rounds=3]
   * @returns {Promise<Item>}
   */
  async applyHoT({ name = 'Regeneration', healBars = 1, rounds = 3 } = {}) {
    const buffData = {
      name,
      type: 'buff',
      img: 'icons/svg/aura.svg',
      system: {
        buffType: 'heal',
        healingPerRound: `${healBars} bar${healBars > 1 ? 's' : ''}`,
        durationRounds: rounds,
        duration: `${rounds} Rounds`,
        description: `Restores ${healBars} Health Bar(s) per combat round for ${rounds} combat rounds.`
      }
    };
    if (typeof this.createEmbeddedDocuments === 'function') {
      const created = await this.createEmbeddedDocuments('Item', [buffData]);
      return created[0] || null;
    } else if (Array.isArray(this.items)) {
      const DCCItemClass = CONFIG.Item?.documentClass || DCCItem;
      const item = new DCCItemClass(buffData, this);
      this.items.push(item);
      return item;
    }
    return null;
  }

  /**
   * Permanently increase a skill's rank by a specified amount.
   * @param {string} skillName
   * @param {number} [delta=1]
   * @returns {Promise<object>}
   */
  async increaseSkillRank(skillName, delta = 1) {
    if (!skillName) return null;
    const cleanName = skillName.trim().toLowerCase();
    const existing = this.items
      ? (this.items.find ? this.items.find(i => i.type === 'skill' && i.name.toLowerCase().trim() === cleanName) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'skill' && i.name.toLowerCase().trim() === cleanName))
      : null;

    if (existing) {
      const oldRank = Number(existing.system?.rank) || 1;
      const newRank = oldRank + delta;
      await existing.update({ 'system.rank': newRank });
      return { skill: existing, oldRank, previousRank: oldRank, newRank, isNew: false };
    }

    const compSkill = (CONFIG.DCC?.skills || []).find(s => s.name.toLowerCase().trim() === cleanName);
    const skillData = compSkill ? {
      name: compSkill.name,
      type: 'skill',
      img: compSkill.img || 'icons/svg/book.svg',
      system: {
        ...structuredClone(compSkill.system || {}),
        rank: delta,
        modifiedRank: delta
      }
    } : {
      name: skillName.trim(),
      type: 'skill',
      img: 'icons/svg/book.svg',
      system: {
        rank: delta,
        modifiedRank: delta,
        stat: 'str',
        skillType: 'Utility',
        category: 'Utility'
      }
    };

    let createdSkill = null;
    if (typeof this.createEmbeddedDocuments === 'function') {
      const created = await this.createEmbeddedDocuments('Item', [skillData]);
      createdSkill = created[0] || null;
    } else if (Array.isArray(this.items)) {
      const DCCItemClass = CONFIG.Item?.documentClass || DCCItem;
      createdSkill = new DCCItemClass(skillData, this);
      this.items.push(createdSkill);
    }
    return { skill: createdSkill, oldRank: 0, previousRank: 0, newRank: delta, isNew: true };
  }

  /**
   * Permanently increase an unenhanced ability score by a specified amount.
   * @param {string} stat 'str' | 'int' | 'con' | 'dex' | 'cha'
   * @param {number} [delta=1]
   * @returns {Promise<object>}
   */
  async increaseUnenhancedStat(stat, delta = 1) {
    const s = String(stat || '').toLowerCase().trim();
    if (!['str', 'int', 'con', 'dex', 'cha'].includes(s)) return null;
    const curObj = this.system?.abilities?.[s] || { value: 10, unenhanced: 10 };
    const curUnenhanced = Number(curObj.unenhanced ?? curObj.value ?? 10);
    const curVal = Number(curObj.value ?? 10);
    const newUnenhanced = curUnenhanced + delta;
    const newVal = curVal + delta;

    await this.update({
      [`system.abilities.${s}.unenhanced`]: newUnenhanced,
      [`system.abilities.${s}.value`]: newVal
    });
    return { stat: s, oldUnenhanced: curUnenhanced, newUnenhanced, oldValue: curVal, newValue: newVal };
  }

  /**
   * Perform resting for this crawler.
   * Supports all official CarlRPG rest durations:
   * - '1hour': 1 hour of non-combat rest -> 1 Health Bar slot (+hpPerBar HP) & 5 Mana recovered.
   * - 'short': 2 hour short rest -> 5 Health Bar slots (+5*hpPerBar HP) & half Mana regeneration (round down). Clears short rest conditions.
   * - 'long': 8 hour Safe Room rest -> Full Health (all 10 bars), full Mana, and removes all stacked Fatigued debuffs.
   * - 'fullDay': 30 hour full day rest -> Full Health, full Mana, removes fatigue, and recovers from all Injuries (Minor, Major, Long-Term).
   * @param {string} [restType='long'] '1hour' | 'short' | 'long' | 'fullDay'
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async rest(restType = 'long', options = {}) {
    const normType = String(restType || 'long').toLowerCase().trim();
    const maxHP = Number(this.system.attributes?.hp?.max) || 40;
    const currentHP = Number(this.system.attributes?.hp?.value) || 0;
    const maxMana = Number(this.system.attributes?.mana?.max) || 10;
    const currentMana = Number(this.system.attributes?.mana?.value) || 0;
    const hpPerBar = getHpPerBar(this);

    let newHP = currentHP;
    let newMana = currentMana;
    let title = '';
    let icon = '';
    let color = '';
    let hours = 0;
    let hpDesc = '';
    let manaDesc = '';
    const clearedConditions = [];

    const allDebuffs = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff')) : [];

    if (normType === '1hour' || normType === '1h' || normType === 'hour') {
      hours = 1;
      title = '1-HOUR NON-COMBAT REST';
      icon = 'fa-solid fa-hourglass-start';
      color = '#34495e';

      const healAmount = hpPerBar;
      newHP = Math.min(maxHP, currentHP + healAmount);
      const manaAmount = 5;
      newMana = Math.min(maxMana, currentMana + manaAmount);

      hpDesc = `Regained 1 Health Bar slot (+${Math.max(0, newHP - currentHP)} HP)`;
      manaDesc = `Recovered +${Math.max(0, newMana - currentMana)} Mana`;

    } else if (normType === 'short' || normType === '2hour' || normType === '2h') {
      hours = 2;
      title = '2-HOUR SHORT REST';
      icon = 'fa-solid fa-mug-hot';
      color = '#2980b9';

      const healAmount = 5 * hpPerBar;
      newHP = Math.min(maxHP, currentHP + healAmount);
      const manaGain = Math.floor(maxMana / 2);
      newMana = Math.min(maxMana, currentMana + manaGain);

      hpDesc = `Regained 5 Health Bar slots (+${Math.max(0, newHP - currentHP)} HP)`;
      manaDesc = `Recovered half Mana rounded down (+${Math.max(0, newMana - currentMana)} Mana)`;

      // Clear conditions with short rest duration (e.g. Minor Injury)
      for (const debuff of allDebuffs) {
        const dur = (debuff.system?.duration || '').toLowerCase();
        if (dur.includes('short rest')) {
          clearedConditions.push(debuff);
        }
      }

    } else if (normType === 'long' || normType === '8hour' || normType === '8h' || normType === 'safe' || normType === 'saferoom') {
      hours = 8;
      title = '8-HOUR SAFE ROOM LONG REST';
      icon = 'fa-solid fa-bed';
      color = '#27ae60';

      newHP = maxHP;
      newMana = maxMana;

      hpDesc = `All 10 Health Bars restored to 100% (+${Math.max(0, newHP - currentHP)} HP)`;
      manaDesc = `Mana fully refilled to maximum (+${Math.max(0, newMana - currentMana)} Mana)`;

      // Clear all Fatigued debuffs and conditions lasting until end of long rest / short rest
      for (const debuff of allDebuffs) {
        const dName = debuff.name.toLowerCase().trim();
        const dur = (debuff.system?.duration || '').toLowerCase();
        if (dName === 'fatigued' || dur.includes('long rest') || dur.includes('short rest')) {
          clearedConditions.push(debuff);
        }
      }

    } else if (normType === 'fullday' || normType === 'day' || normType === '30hour' || normType === '30h') {
      hours = 30;
      title = '30-HOUR FULL DAY REST';
      icon = 'fa-solid fa-sun';
      color = '#8e44ad';

      newHP = maxHP;
      newMana = maxMana;

      hpDesc = `All 10 Health Bars restored to 100% (+${Math.max(0, newHP - currentHP)} HP)`;
      manaDesc = `Mana fully refilled to maximum (+${Math.max(0, newMana - currentMana)} Mana)`;

      // Recover from injuries! Clears Fatigued and all injury debuffs: Minor Injury, Major Injury, Long-Term Minor/Major Injury, broken limbs, etc.
      for (const debuff of allDebuffs) {
        const dName = debuff.name.toLowerCase().trim();
        const dur = (debuff.system?.duration || '').toLowerCase();
        const isInjury = dName.includes('injury') || dName.includes('wound') || dName.includes('broken');
        if (dName === 'fatigued' || isInjury || dur.includes('full day') || dur.includes('day') || dur.includes('long rest') || dur.includes('short rest')) {
          clearedConditions.push(debuff);
        }
      }
    } else {
      // Default to long rest
      return this.rest('long', options);
    }

    const hpRestored = Math.max(0, newHP - currentHP);
    const manaRestored = Math.max(0, newMana - currentMana);
    const hpPct = maxHP > 0 ? Math.round((newHP / maxHP) * 100) : 100;

    await this.update({
      'system.attributes.hp.value': newHP,
      'system.attributes.hp.temp': 0,
      'system.attributes.hp.pct': hpPct,
      'system.attributes.mana.value': newMana
    });

    let conditionsClearedCount = 0;
    if (clearedConditions.length > 0 && typeof this.deleteEmbeddedDocuments === 'function') {
      const ids = [...new Set(clearedConditions.map(i => i.id || i._id))];
      await this.deleteEmbeddedDocuments('Item', ids);
      conditionsClearedCount = ids.length;
    }

    const fatigueCleared = clearedConditions.filter(c => c.name?.toLowerCase().trim() === 'fatigued').length;

    if (!options.silent) {
      const conditionLines = clearedConditions.map(c => `<li>Cleared: <strong>${c.name}</strong></li>`).join('');
      const card = `
        <div class="dcc-chat-card dcc-rest-card" style="border: 2px solid ${color}; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif;">
          <div style="background: ${color}; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
            <i class="${icon}"></i> ${title} COMPLETE
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa; border-bottom: 1px solid #333; padding-bottom: 6px;">
            <span>Crawler: <strong style="color: #fff;">${this.name}</strong></span>
            <span>Duration: <strong style="color: #f1c40f;">${hours} Hours</strong></span>
          </div>
          <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; color: #ddd; line-height: 1.6;">
            <li><strong>Health:</strong> ${hpDesc} &rarr; <strong>${newHP} / ${maxHP} HP</strong></li>
            <li><strong>Mana:</strong> ${manaDesc} &rarr; <strong>${newMana} / ${maxMana} MP</strong></li>
            ${conditionLines ? conditionLines : (hours >= 8 ? '<li><strong>Conditions:</strong> No lingering fatigue or rest conditions.</li>' : '')}
          </ul>
        </div>
      `;
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: card,
        flags: {
          'carl-rpg': {
            isRest: true,
            restType: normType,
            hours,
            hpRestored,
            manaRestored,
            conditionsCleared: conditionsClearedCount
          }
        }
      });
    }

    return {
      restType: normType,
      hours,
      hpRestored,
      manaRestored,
      newHP,
      newMana,
      conditionsCleared: conditionsClearedCount,
      fatigueCleared,
      exhaustionCleared: fatigueCleared,
      clearedConditions
    };
  }

  /**
   * Perform an 8-Hour Long Rest in a certified Safe Room.
   * Alias for this.rest('long', options).
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async restSafeRoom(options = {}) {
    return this.rest('long', options);
  }

  /**
   * Execute a Grinding & Downtime session for this crawler.
   * Implements official Renegade CarlRPG rules:
   * - 5-Hour Safe Limit (or 6 if guide bonus active)
   * - Hours > Safe require an Endurance check per excess hour
   * - Failing check inflicts stackable Fatigued Debuff
   * - Skill Advancement: requires grinding hours equal to current rank (Hours = Current Rank)
   * - Advancement Check: 1d20 >= Current Rank
   * - 1d20 Grinding Complications Table
   * @param {object} options
   * @param {number} [options.hours=5] Total hours to grind
   * @param {boolean} [options.hasGuideBonus=false] Whether guide insight (Huey/Bob) grants +1 safe hour
   * @param {string} [options.mapType='none'] 'none' | 'neighborhood' (+1 hr) | 'borough' / 'burrough' (+2 hrs)
   * @param {boolean} [options.hasNeighborhoodMap=false] Whether crawler has a neighborhood map (+1 hr)
   * @param {boolean} [options.hasBoroughMap=false] Whether crawler has a borough map (+2 hrs)
   * @param {boolean} [options.hasBurroughMap=false] Alias for hasBoroughMap (+2 hrs)
   * @param {number} [options.mapBonus=0] Explicit bonus safe hours from maps
   * @param {string|null} [options.skillId=null] ID of skill selected for advancement
   * @param {number|null} [options.floor=null] Dungeon floor number (defaults to parsed details.floor or 1)
   * @param {boolean} [options.rollComplication=true] Whether to roll on the Grinding Complications Table
   * @returns {Promise<object>}
   */
  async grindSession(options = {}) {
    const hours = Math.max(1, Number(options.hours) || 5);
    const hasGuideBonus = Boolean(options.hasGuideBonus);
    const { safeThreshold, mapBonus } = getSafeGrindingThreshold(options);
    const excessHours = Math.max(0, hours - safeThreshold);
    const mapType = options.mapType || (mapBonus === 2 ? 'borough' : mapBonus === 1 ? 'neighborhood' : 'none');

    // Floor number resolution
    let floorNumber = 1;
    if (options.floor !== undefined && options.floor !== null) {
      floorNumber = Math.max(1, Number(options.floor) || 1);
    } else {
      const rawFloor = String(this.system.details?.floor || '1');
      const match = rawFloor.match(/\d+/);
      floorNumber = match ? Math.max(1, parseInt(match[0], 10)) : 1;
    }

    // 1. Fatigue & Endurance Checks for Excess Hours
    const enduranceChecks = [];
    let fatigueGained = 0;

    if (excessHours > 0) {
      // Find Endurance skill on actor
      const allItems = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
      const enduranceSkill = allItems.find(i => i.name.toLowerCase().trim() === 'endurance');
      const endSys = enduranceSkill?.system || {};
      const endRank = Number(enduranceSkill?.modifiedRank ?? endSys.modifiedRank ?? enduranceSkill?.effectiveRank ?? endSys.rank) || 0;
      const conMod = this.system.abilities?.con?.mod ?? 0;

      // Check current fatigue count for Rank 10 advantage perk
      const currentFatigueItems = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued')) : [];
      const initialFatigueCount = currentFatigueItems.length;

      for (let i = 1; i <= excessHours; i++) {
        const hourPast = i;
        const dc = getEnduranceDC(floorNumber, hourPast);

        // Determine roll formula
        let formula;
        let flavor;
        if (endRank <= 0) {
          // Untrained: Disadvantage
          formula = `2d20kl + ${conMod}`;
          flavor = `Untrained Endurance Check (2d20kl + ${conMod})`;
        } else if (endRank >= 10 && (initialFatigueCount + fatigueGained === 0)) {
          // Rank 10 Perk: Advantage if not already Fatigued
          formula = `2d20kh + ${endRank} + ${conMod}`;
          flavor = `Rank 10 Advantage Endurance Check (2d20kh + Rank ${endRank} + CON ${conMod})`;
        } else {
          formula = `1d20 + ${endRank} + ${conMod}`;
          flavor = `Endurance Check (1d20 + Rank ${endRank} + CON ${conMod})`;
        }

        const roll = await new Roll(formula).evaluate();
        const total = roll.total;
        let passed = total >= dc;

        if (!passed) {
          await this.applyFatiguedDebuff();
          fatigueGained++;
        }

        enduranceChecks.push({
          hour: safeThreshold + i,
          dc,
          formula,
          rollTotal: total,
          passed
        });
      }
    }

    // 2. Map Bonus Hours & Grinding Complications
    let mapBonusHours = 0;
    if (mapType === 'neighborhood' || options.hasNeighborhoodMap) {
      mapBonusHours = Math.max(mapBonusHours, 1);
    }
    if (mapType === 'borough' || mapType === 'burrough' || options.hasBoroughMap || options.hasBurroughMap) {
      mapBonusHours = Math.max(mapBonusHours, 2);
    }
    if (options.mapBonusHours !== undefined) {
      mapBonusHours = Number(options.mapBonusHours) || 0;
    }

    let complication = null;
    let eventBonusHours = 0;
    if (options.rollComplication !== false) {
      const compRoll = await new Roll('1d20').evaluate();
      const compData = getGrindingComplication(compRoll.total);
      eventBonusHours = Number(compData?.bonusHours) || 0;
      complication = {
        roll: compRoll.total,
        ...compData,
        bonusHours: eventBonusHours
      };
    }

    const totalBonusHours = eventBonusHours + mapBonusHours;
    const totalEarnedHours = hours + totalBonusHours;
    const nonBonusHours = hours;

    // Decrement global Floor timer clock by non-bonus hours accrued
    const previousFloorTimer = typeof DCCActor.getFloorTimer === 'function' ? DCCActor.getFloorTimer() : 100;
    let newFloorTimer = previousFloorTimer;
    if (options.decrementFloorTimer !== false && typeof DCCActor.decrementFloorTimer === 'function') {
      newFloorTimer = await DCCActor.decrementFloorTimer(nonBonusHours);
    }

    // Use it or lose it: unspent pool hours reset to 0 at the start of a new grind session
    // (Hours already invested into specific skills remain on those skills!)
    const previousUnspentBank = Number(this.system.details?.bankedGrindHours ?? this.system.bankedGrindHours) || 0;
    const currentBanked = options.resetPool === false ? previousUnspentBank : 0;
    const forfeitedHours = (options.resetPool !== false && previousUnspentBank > 0) ? previousUnspentBank : 0;
    let newBanked = currentBanked + totalEarnedHours;

    // 3. Multi-Skill Allocations or Targeted Skill Advancement Check
    let skillAdvancement = null;
    if (options.allocations && typeof options.allocations === 'object') {
      // Allocate hours across multiple skills
      for (const [sId, allocHours] of Object.entries(options.allocations)) {
        const h = Math.max(0, parseInt(allocHours, 10) || 0);
        if (h > 0) {
          const actualAlloc = Math.min(newBanked, h);
          if (actualAlloc > 0) {
            newBanked -= actualAlloc;
            const skItem = this.items?.get ? this.items.get(sId) : this.items?.find?.(i => i.id === sId || i._id === sId);
            if (skItem && skItem.type === 'skill') {
              const prevInvested = Number(skItem.system?.investedHours ?? skItem.system?.grindHours) || 0;
              await skItem.update({ 'system.investedHours': prevInvested + actualAlloc });
            }
          }
        }
      }
    }

    if (options.skillId) {
      const skillItem = this.items?.get ? this.items.get(options.skillId) : this.items?.find?.(i => i.id === options.skillId || i._id === options.skillId);
      if (skillItem) {
        const currentRank = Number(skillItem.system?.rank) || 0;
        const reqHours = getRequiredGrindingHours(currentRank);
        const target = getAdvancementTarget(currentRank);
        const currentInvested = Number(skillItem.system?.investedHours ?? skillItem.system?.grindHours) || 0;

        const hoursToInvest = Number(options.allocatedHours ?? hours) || 0;
        const newInvested = currentInvested + hoursToInvest;
        newBanked = Math.max(0, newBanked - hoursToInvest);

        if (newInvested >= reqHours) {
          const advRoll = await new Roll('1d20').evaluate();
          const rollResult = advRoll.total;
          const passed = rollResult >= target;

          if (passed) {
            const newRank = currentRank + 1;
            const remainingInvested = Math.max(0, newInvested - reqHours);
            await skillItem.update({
              'system.rank': newRank,
              'system.checked': false,
              'system.investedHours': remainingInvested
            });
            skillAdvancement = {
              skillName: skillItem.name,
              previousRank: currentRank,
              newRank,
              requiredHours: reqHours,
              investedHours: remainingInvested,
              target,
              roll: rollResult,
              passed: true
            };
          } else {
            await skillItem.update({
              'system.checked': false,
              'system.investedHours': 0
            });
            skillAdvancement = {
              skillName: skillItem.name,
              previousRank: currentRank,
              newRank: currentRank,
              requiredHours: reqHours,
              investedHours: 0,
              target,
              roll: rollResult,
              passed: false
            };
          }
        } else {
          // Insufficient hours allocated, but save the invested hours persistently on the skill!
          await skillItem.update({
            'system.investedHours': newInvested
          });
          skillAdvancement = {
            skillName: skillItem.name,
            previousRank: currentRank,
            newRank: currentRank,
            requiredHours: reqHours,
            investedHours: newInvested,
            target,
            roll: null,
            passed: false,
            insufficientHours: true
          };
        }
      }
    }

    // Persist actor's banked grind hours pool
    if (this.system?.details) {
      this.system.details.bankedGrindHours = newBanked;
    } else if (this.system) {
      this.system.bankedGrindHours = newBanked;
    }
    await this.update({ 'system.details.bankedGrindHours': newBanked });

    // 4. Generate LitRPG Chat Card
    if (!options.silent) {
      let checksHtml = '';
      if (enduranceChecks.length > 0) {
        checksHtml = `
          <div style="background: rgba(0,0,0,0.3); border: 1px solid #444; border-radius: 4px; padding: 6px 10px; margin-top: 8px;">
            <div style="font-weight: bold; color: #e67e22; font-size: 11px; text-transform: uppercase;">
              <i class="fa-solid fa-person-running"></i> Endurance Checks (${enduranceChecks.length} Hours Over Safe Limit):
            </div>
            ${enduranceChecks.map(c => `
              <div style="font-size: 11px; margin-top: 2px; color: ${c.passed ? '#2ecc71' : '#e74c3c'};">
                • Hour ${c.hour} (DC ${c.dc}): Rolled <strong>${c.rollTotal}</strong> — ${c.passed ? 'PASSED (Fatigue avoided)' : 'FAILED (Gained Fatigued Debuff)'}
              </div>
            `).join('')}
          </div>
        `;
      }

      let advHtml = '';
      if (skillAdvancement) {
        if (skillAdvancement.insufficientHours) {
          advHtml = `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #444; border-radius: 4px; padding: 6px 10px; margin-top: 8px;">
              <div style="font-weight: bold; color: #f1c40f; font-size: 11px; text-transform: uppercase;">
                <i class="fa-solid fa-graduation-cap"></i> Skill Training: ${skillAdvancement.skillName}
              </div>
              <div style="font-size: 11px; color: #ccc; margin-top: 2px;">
                Invested ${hours} hrs, but Rank ${skillAdvancement.previousRank} requires <strong>${skillAdvancement.requiredHours} hrs</strong> to test advancement. Practice logged!
              </div>
            </div>
          `;
        } else if (skillAdvancement.passed) {
          advHtml = `
            <div style="background: rgba(39, 174, 96, 0.2); border: 1px solid #27ae60; border-radius: 4px; padding: 6px 10px; margin-top: 8px;">
              <div style="font-weight: bold; color: #2ecc71; font-size: 12px; text-transform: uppercase;">
                <i class="fa-solid fa-circle-check"></i> SKILL ADVANCEMENT: ${skillAdvancement.skillName}!
              </div>
              <div style="font-size: 11px; color: #eee; margin-top: 2px;">
                Advancement Roll: <strong>${skillAdvancement.roll}</strong> (Target: &ge; ${skillAdvancement.target}).
                <br/><strong style="color: #f1c40f;">Rank ${skillAdvancement.previousRank} &rarr; Rank ${skillAdvancement.newRank}</strong>!
              </div>
            </div>
          `;
        } else {
          advHtml = `
            <div style="background: rgba(192, 57, 43, 0.2); border: 1px solid #c0392b; border-radius: 4px; padding: 6px 10px; margin-top: 8px;">
              <div style="font-weight: bold; color: #e74c3c; font-size: 11px; text-transform: uppercase;">
                <i class="fa-solid fa-circle-xmark"></i> SKILL ADVANCEMENT FAILED: ${skillAdvancement.skillName}
              </div>
              <div style="font-size: 11px; color: #ccc; margin-top: 2px;">
                Advancement Roll: <strong>${skillAdvancement.roll}</strong> (Needed &ge; ${skillAdvancement.target}).
                Remains at Rank ${skillAdvancement.previousRank}. Practice logged.
              </div>
            </div>
          `;
        }
      }

      let compHtml = '';
      if (complication) {
        compHtml = `
          <div style="background: rgba(0,0,0,0.4); border-left: 3px solid ${complication.color}; border-radius: 2px; padding: 6px 10px; margin-top: 8px;">
            <div style="font-weight: bold; color: ${complication.color}; font-size: 11px; text-transform: uppercase;">
              <i class="${complication.icon}"></i> Grinding Event (d20: ${complication.roll}): ${complication.title}
            </div>
            <div style="font-size: 11px; color: #bbb; margin-top: 2px; line-height: 1.3;">
              ${complication.description}
            </div>
          </div>
        `;
      }

      const card = `
        <div class="dcc-chat-card dcc-grind-card" style="border: 2px solid #e67e22; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif;">
          <div style="background: #e67e22; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
            <i class="fa-solid fa-dumbbell"></i> GRINDING SESSION: ${hours} HOURS
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa; border-bottom: 1px solid #333; padding-bottom: 6px;">
            <span>Crawler: <strong style="color: #fff;">${this.name}</strong></span>
            <span>Floor: <strong style="color: #f1c40f;">${floorNumber}</strong></span>
            <span>Safe Limit: <strong style="color: #2ecc71;">${safeThreshold} hrs${hasGuideBonus ? ' (+1 Guide)' : ''}${mapBonus === 1 ? ' (+1 Neighborhood Map)' : mapBonus === 2 ? ' (+2 Borough Map)' : mapBonus > 0 ? ` (+${mapBonus} Map)` : ''}</strong></span>
          </div>
          <div style="margin-top: 6px; font-size: 12px; color: #ddd;">
            <i class="fa-solid fa-hourglass-half" style="color: #e67e22;"></i> <strong>Floor Timer Clock:</strong> Decremented by <strong>-${nonBonusHours} Hours</strong> (${previousFloorTimer} &rarr; <strong style="color: #f39c12;">${newFloorTimer} hrs remaining</strong>).
          </div>
          <div style="margin-top: 4px; font-size: 12px; color: #f1c40f;">
            <i class="fa-solid fa-vault"></i> <strong>Banked Grind Hours:</strong> +${totalEarnedHours} hrs added (Total Pool: <strong>${newBanked} hrs</strong>)${totalBonusHours > 0 ? ` <em>(+${totalBonusHours} bonus hrs${mapBonusHours > 0 ? ` [${mapBonusHours}h map]` : ''}${eventBonusHours > 0 ? ` [${eventBonusHours}h event]` : ''})</em>` : ''}.
          </div>
          ${checksHtml}
          ${advHtml}
          ${compHtml}
        </div>
      `;

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: card,
        flags: {
          'carl-rpg': {
            isGrindSession: true,
            hours,
            nonBonusHours,
            bonusHours: totalBonusHours,
            complicationBonusHours: eventBonusHours,
            mapBonusHours,
            totalEarnedHours,
            bankedHours: newBanked,
            previousFloorTimer,
            floorTimer: newFloorTimer,
            hasGuideBonus,
            mapType,
            mapBonus,
            fatigueGained,
            exhaustedGained: fatigueGained,
            skillAdvancement,
            complication
          }
        }
      });
    }

    return {
      hours,
      nonBonusHours,
      bonusHours: totalBonusHours,
      complicationBonusHours: eventBonusHours,
      mapBonusHours,
      totalEarnedHours,
      bankedHours: newBanked,
      forfeitedHours,
      previousFloorTimer,
      floorTimer: newFloorTimer,
      floorNumber,
      safeThreshold,
      excessHours,
      hasGuideBonus,
      mapType,
      mapBonus,
      enduranceChecks,
      fatigueGained,
      exhaustedGained: fatigueGained,
      skillAdvancement,
      complication
    };
  }

  /**
   * Execute a grinding session for an entire party of crawlers.
   *
   * Rules:
   * 1. Floor timer decrements once by non-bonus hours accrued.
   * 2. Complication table roll applies once to the session.
   * 3. Unallocated hours in each crawler's pool are reset to zero at the start of a new grind (use it or lose it).
   * 4. Each crawler runs their own Endurance checks individually, with Fatigued debuff applied only to those who fail.
   * 5. Each participating crawler accrues the session's earned hours (base + bonus) into their personal pool.
   *
   * @param {Actor[]} [partyActors] Array of Crawler actors (defaults to all world crawlers).
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  static async executePartyGrindSession(partyActors, options = {}) {
    let crawlers = Array.isArray(partyActors) && partyActors.length > 0
      ? partyActors
      : (globalThis.game?.actors ? Array.from(globalThis.game.actors.values ? globalThis.game.actors.values() : globalThis.game.actors).filter(a => a.type === 'crawler') : []);

    const hours = Math.max(1, parseInt(options.hours, 10) || 5);
    const hasGuideBonus = Boolean(options.hasGuideBonus);
    let mapType = (options.mapType || 'none').toLowerCase().trim();
    if (options.hasBoroughMap || options.hasBurroughMap || options.mapBonus === 2) mapType = 'borough';
    else if (options.hasNeighborhoodMap || options.mapBonus === 1) mapType = 'neighborhood';

    const { safeThreshold, excessHours, mapBonus } = getSafeGrindingThreshold({
      hours,
      hasGuideBonus,
      mapType,
      mapBonus: options.mapBonus
    });

    const floorNumber = Number(options.floor) || (typeof DCCActor.getCurrentFloor === 'function' ? DCCActor.getCurrentFloor() : 1);

    // 1. Roll Complications once for the party
    let complication = null;
    let eventBonusHours = 0;
    if (options.rollComplication !== false) {
      const compRoll = await new Roll('1d20').evaluate();
      complication = getGrindingComplication(compRoll.total);
      if (complication && complication.bonusGrindHour) {
        eventBonusHours = 1;
      }
    }

    const mapBonusHours = mapBonus > 0 ? mapBonus : 0;
    const totalBonusHours = eventBonusHours + mapBonusHours;
    const totalEarnedHours = hours + totalBonusHours;
    const nonBonusHours = hours;

    // 2. Decrement global Floor timer clock once by non-bonus hours accrued
    const previousFloorTimer = typeof DCCActor.getFloorTimer === 'function' ? DCCActor.getFloorTimer() : 100;
    let newFloorTimer = previousFloorTimer;
    if (options.decrementFloorTimer !== false && typeof DCCActor.decrementFloorTimer === 'function') {
      newFloorTimer = await DCCActor.decrementFloorTimer(nonBonusHours);
    }

    // 3. Process each participating crawler individually
    const crawlerResults = [];
    for (const crawler of crawlers) {
      if (!crawler) continue;

      // Use it or lose it: unspent pool hours reset to 0 at start of new grind
      const prevBanked = Number(crawler.system?.details?.bankedGrindHours ?? crawler.system?.bankedGrindHours) || 0;
      const forfeitedHours = (options.resetPool !== false) ? prevBanked : 0;

      // Individual Endurance Checks
      const allSkills = crawler.items ? (crawler.items.filter ? crawler.items.filter(i => i.type === 'skill') : Array.from(crawler.items.values ? crawler.items.values() : crawler.items).filter(i => i.type === 'skill')) : [];
      const endSkill = allSkills.find(s => s.name?.toLowerCase().trim() === 'endurance');
      const endRank = Number(endSkill?.modifiedRank ?? endSkill?.system?.rank) || 0;
      const conMod = crawler.system?.abilities?.con?.mod ?? 0;

      const allDebuffs = crawler.items ? (crawler.items.filter ? crawler.items.filter(i => i.type === 'debuff') : Array.from(crawler.items.values ? crawler.items.values() : crawler.items).filter(i => i.type === 'debuff')) : [];
      const isFatigued = allDebuffs.some(d => d.name?.toLowerCase().trim() === 'fatigued');

      const enduranceChecks = [];
      let fatigueGained = 0;

      if (excessHours > 0) {
        for (let h = 1; h <= excessHours; h++) {
          const dc = getEnduranceDC(floorNumber, h);
          let formula = '1d20';
          if (endRank >= 10 && !isFatigued) formula = '2d20kh';

          const roll = await new Roll(formula).evaluate();
          const total = roll.total + endRank + conMod;
          const passed = total >= dc;

          if (!passed) {
            fatigueGained++;
            if (typeof crawler.applyFatiguedDebuff === 'function') {
              await crawler.applyFatiguedDebuff();
            }
          }

          enduranceChecks.push({
            hour: safeThreshold + h,
            dc,
            rollTotal: total,
            diceRoll: roll.total,
            formula,
            passed
          });
        }
      }

      // Credit totalEarnedHours
      const newBanked = totalEarnedHours;
      if (crawler.system?.details) {
        crawler.system.details.bankedGrindHours = newBanked;
      } else if (crawler.system) {
        crawler.system.bankedGrindHours = newBanked;
      }
      await crawler.update({ 'system.details.bankedGrindHours': newBanked });

      crawlerResults.push({
        id: crawler.id,
        actor: crawler,
        actorId: crawler.id,
        name: crawler.name,
        img: crawler.img || 'icons/svg/mystery-man.svg',
        forfeitedHours,
        enduranceChecks,
        fatigueGained,
        totalEarnedHours,
        bankedHours: newBanked
      });
    }

    // 4. Generate unified Party Chat Card
    if (!options.silent) {
      await DCCActor._postPartyGrindChatCard({
        hours,
        nonBonusHours,
        totalBonusHours,
        eventBonusHours,
        mapBonusHours,
        totalEarnedHours,
        previousFloorTimer,
        newFloorTimer,
        floorNumber,
        safeThreshold,
        excessHours,
        hasGuideBonus,
        mapType,
        mapBonus,
        complication,
        crawlerResults
      });
    }

    return {
      hours,
      nonBonusHours,
      bonusHours: totalBonusHours,
      complicationBonusHours: eventBonusHours,
      mapBonusHours,
      totalEarnedHours,
      previousFloorTimer,
      floorTimer: newFloorTimer,
      newFloorTimer,
      floorNumber,
      safeThreshold,
      excessHours,
      hasGuideBonus,
      mapType,
      mapBonus,
      complication,
      crawlerResults
    };
  }

  /**
   * Helper to format and send the party grind session chat card
   */
  static async _postPartyGrindChatCard(data) {
    let compHtml = '';
    if (data.complication) {
      compHtml = `
        <div style="background: rgba(0,0,0,0.4); border-left: 3px solid ${data.complication.color}; border-radius: 2px; padding: 6px 10px; margin-top: 8px;">
          <div style="font-weight: bold; color: ${data.complication.color}; font-size: 11px; text-transform: uppercase;">
            <i class="${data.complication.icon}"></i> Party Event (d20: ${data.complication.roll}): ${data.complication.title}
          </div>
          <div style="font-size: 11px; color: #bbb; margin-top: 2px; line-height: 1.3;">
            ${data.complication.description}
          </div>
        </div>
      `;
    }

    const crawlersHtml = data.crawlerResults.map(cr => {
      let checksStr = '';
      if (cr.enduranceChecks.length > 0) {
        checksStr = `
          <div style="margin-top: 3px; font-size: 10px;">
            ${cr.enduranceChecks.map(c => `
              <span style="display: inline-block; padding: 1px 4px; border-radius: 2px; margin-right: 4px; background: ${c.passed ? 'rgba(39, 174, 96, 0.3)' : 'rgba(192, 57, 43, 0.3)'}; color: ${c.passed ? '#2ecc71' : '#e74c3c'}; border: 1px solid ${c.passed ? '#27ae60' : '#c0392b'};">
                H${c.hour} (${c.rollTotal} vs DC${c.dc}): ${c.passed ? 'PASS' : 'FAIL (+1 Fatigue)'}
              </span>
            `).join('')}
          </div>
        `;
      } else {
        checksStr = `<div style="font-size: 10px; color: #2ecc71;">Safe Grind (No checks)</div>`;
      }

      const forfeitNotice = cr.forfeitedHours > 0
        ? `<span style="font-size: 10px; color: #888; margin-left: 4px;">(${cr.forfeitedHours} unspent hrs forfeited)</span>`
        : '';

      return `
        <div style="display: flex; gap: 8px; align-items: flex-start; padding: 6px 8px; background: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 4px; margin-top: 4px;">
          <img src="${cr.img}" width="32" height="32" style="border-radius: 3px; object-fit: cover; border: 1px solid #555;" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #fff; font-size: 12px;">${cr.name}</strong>
              <span style="color: #f1c40f; font-size: 11px; font-weight: bold;">
                <i class="fa-solid fa-vault"></i> +${cr.totalEarnedHours}h (Pool: ${cr.bankedHours}h) ${forfeitNotice}
              </span>
            </div>
            ${checksStr}
          </div>
        </div>
      `;
    }).join('');

    const card = `
      <div class="dcc-chat-card dcc-party-grind-card" style="border: 2px solid #e67e22; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif;">
        <div style="background: linear-gradient(90deg, #c0392b, #d35400); color: #fff; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
          <i class="fa-solid fa-people-group"></i> PARTY GRINDING SESSION: ${data.hours} HOURS
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa; border-bottom: 1px solid #333; padding-bottom: 6px;">
          <span>Floor: <strong style="color: #f1c40f;">${data.floorNumber}</strong></span>
          <span>Participants: <strong style="color: #fff;">${data.crawlerResults.length} Crawlers</strong></span>
          <span>Safe Limit: <strong style="color: #2ecc71;">${data.safeThreshold} hrs${data.hasGuideBonus ? ' (+1 Guide)' : ''}${data.mapBonus === 1 ? ' (+1 Neighborhood Map)' : data.mapBonus === 2 ? ' (+2 Borough Map)' : data.mapBonus > 0 ? ` (+${data.mapBonus} Map)` : ''}</strong></span>
        </div>
        <div style="margin-top: 6px; font-size: 12px; color: #ddd;">
          <i class="fa-solid fa-hourglass-half" style="color: #e67e22;"></i> <strong>Floor Timer Clock:</strong> Decremented by <strong>-${data.nonBonusHours} Hours</strong> (${data.previousFloorTimer} &rarr; <strong style="color: #f39c12;">${data.newFloorTimer} hrs remaining</strong>).
        </div>
        <div style="margin-top: 4px; font-size: 11px; color: #bbb;">
          <i class="fa-solid fa-circle-info" style="color: #3498db;"></i> Hours in pool reset at start of grind (use it or lose it). Earned hours added to each crawler's pool.
        </div>
        ${compHtml}
        <div style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #f1c40f; margin-bottom: 4px;">
            <i class="fa-solid fa-users"></i> Party Results:
          </div>
          ${crawlersHtml}
        </div>
      </div>
    `;

    if (typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
      await ChatMessage.create({
        content: card,
        speaker: { alias: 'Dungeon Grinding Master' },
        flags: {
          'carl-rpg': {
            isPartyGrindSession: true,
            hours: data.hours,
            nonBonusHours: data.nonBonusHours,
            bonusHours: data.totalBonusHours,
            floorTimer: data.newFloorTimer
          }
        }
      });
    }
  }

  async executePartyGrindSession(partyActors, options = {}) {
    return DCCActor.executePartyGrindSession(partyActors || [this], options);
  }

  /**
   * Allocate banked hours from the actor pool into a specific skill (or remove hours back to pool if negative).
   * @param {string} skillId
   * @param {number} hours
   * @returns {Promise<object>}
   */
  async allocateGrindHours(skillId, hours) {
    const delta = parseInt(hours, 10) || 0;
    if (delta === 0) return null;
    const skill = this.items?.get ? this.items.get(skillId) : this.items?.find?.(i => i.id === skillId || i._id === skillId);
    if (!skill || skill.type !== 'skill') return null;

    const currentBank = Number(this.system.details?.bankedGrindHours ?? this.system.bankedGrindHours) || 0;
    const currentInvested = Number(skill.system?.investedHours ?? skill.system?.grindHours) || 0;
    const reqHours = getRequiredGrindingHours(skill.system?.rank || 0);

    let actualDelta = delta;
    if (actualDelta > 0) {
      actualDelta = Math.min(actualDelta, currentBank);
      actualDelta = Math.min(actualDelta, Math.max(0, reqHours - currentInvested));
    } else {
      actualDelta = -Math.min(Math.abs(actualDelta), currentInvested);
    }

    if (actualDelta === 0) return { currentBank, currentInvested };

    const newBank = Math.max(0, currentBank - actualDelta);
    const newInvested = Math.max(0, currentInvested + actualDelta);

    if (this.system?.details) {
      this.system.details.bankedGrindHours = newBank;
    } else if (this.system) {
      this.system.bankedGrindHours = newBank;
    }
    await this.update({ 'system.details.bankedGrindHours': newBank });

    if (skill.system) {
      skill.system.investedHours = newInvested;
    }
    await skill.update({ 'system.investedHours': newInvested });

    return {
      skillId,
      newBank,
      newInvested,
      reqHours,
      canAdvance: newInvested >= reqHours
    };
  }

  /**
   * Attempt skill advancement once sufficient hours are banked on the skill.
   * Success if 1d20 >= Current Rank.
   * @param {string} skillId
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async attemptSkillAdvancement(skillId, options = {}) {
    const skillItem = this.items?.get ? this.items.get(skillId) : this.items?.find?.(i => i.id === skillId || i._id === skillId);
    if (!skillItem || skillItem.type !== 'skill') return null;

    const currentRank = Number(skillItem.system?.rank) || 0;
    const reqHours = getRequiredGrindingHours(currentRank);
    const target = getAdvancementTarget(currentRank);
    const currentInvested = Number(skillItem.system?.investedHours ?? skillItem.system?.grindHours) || 0;

    if (currentInvested < reqHours && !options.force) {
      return {
        skillName: skillItem.name,
        previousRank: currentRank,
        newRank: currentRank,
        requiredHours: reqHours,
        investedHours: currentInvested,
        target,
        roll: null,
        passed: false,
        insufficientHours: true
      };
    }

    const advRoll = await new Roll('1d20').evaluate();
    const rollResult = advRoll.total;
    const passed = rollResult >= target;

    let skillAdvancement;
    if (passed) {
      const newRank = currentRank + 1;
      const remainingInvested = Math.max(0, currentInvested - reqHours);
      await skillItem.update({
        'system.rank': newRank,
        'system.checked': false,
        'system.investedHours': remainingInvested
      });
      skillAdvancement = {
        skillName: skillItem.name,
        previousRank: currentRank,
        newRank,
        requiredHours: reqHours,
        investedHours: remainingInvested,
        target,
        roll: rollResult,
        passed: true
      };
    } else {
      await skillItem.update({
        'system.checked': false,
        'system.investedHours': 0
      });
      skillAdvancement = {
        skillName: skillItem.name,
        previousRank: currentRank,
        newRank: currentRank,
        requiredHours: reqHours,
        investedHours: 0,
        target,
        roll: rollResult,
        passed: false
      };
    }

    if (!options.silent) {
      let cardContent = '';
      if (passed) {
        cardContent = `
          <div class="dcc-chat-card dcc-advancement-card" style="border: 2px solid #27ae60; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif;">
            <div style="background: #27ae60; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
              <i class="fa-solid fa-graduation-cap"></i> SKILL ADVANCEMENT: ${skillItem.name}!
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa; border-bottom: 1px solid #333; padding-bottom: 6px;">
              <span>Crawler: <strong style="color: #fff;">${this.name}</strong></span>
              <span>Target: <strong style="color: #f1c40f;">d20 &ge; ${target}</strong></span>
              <span>Roll: <strong style="color: #2ecc71;">${rollResult}</strong></span>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: #fff; text-align: center;">
              Advancement Breakthrough! <strong style="color: #f1c40f;">Rank ${currentRank} &rarr; Rank ${skillAdvancement.newRank}</strong>
            </div>
          </div>
        `;
      } else {
        cardContent = `
          <div class="dcc-chat-card dcc-advancement-card" style="border: 2px solid #c0392b; background: #141418; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif;">
            <div style="background: #c0392b; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; padding: 5px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
              <i class="fa-solid fa-circle-xmark"></i> ADVANCEMENT ATTEMPT FAILED: ${skillItem.name}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa; border-bottom: 1px solid #333; padding-bottom: 6px;">
              <span>Crawler: <strong style="color: #fff;">${this.name}</strong></span>
              <span>Target: <strong style="color: #f1c40f;">d20 &ge; ${target}</strong></span>
              <span>Roll: <strong style="color: #e74c3c;">${rollResult}</strong></span>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #ccc; text-align: center;">
              Remains at <strong style="color: #fff;">Rank ${currentRank}</strong>. Dedicated practice logged; grind again next session!
            </div>
          </div>
        `;
      }

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: cardContent,
        flags: {
          'carl-rpg': {
            isSkillAdvancement: true,
            skillId,
            skillAdvancement
          }
        }
      });
    }

    return skillAdvancement;
  }

  /**
   * Look up an actor's effective or modified rank for a skill by name (case-insensitive).
   * @param {string} skillName
   * @returns {number} The skill rank (0 if not possessed)
   */
  getSkillRank(skillName) {
    if (!skillName) return 0;
    const norm = skillName.toLowerCase().trim();
    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const skill = skills.find(s => s.name?.toLowerCase().trim() === norm);
    if (skill) {
      return Number(skill.system?.modifiedRank ?? skill.system?.rank) || 0;
    }
    // Check equipped gear skill bonuses when not owned directly
    const equippedGear = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'gear' && i.system?.equipped) : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'gear' && i.system?.equipped)) : [];
    let gearBonus = 0;
    for (const item of equippedGear) {
      let rawMods = item.system?.skillModifiers;
      if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
        rawMods = Object.values(rawMods);
      }
      const skillMods = Array.isArray(rawMods) ? rawMods : [];
      for (const sm of skillMods) {
        if (sm?.name && sm.name.toLowerCase().trim() === norm) {
          gearBonus += Number(sm.bonus) || 0;
        }
      }
      if (Array.isArray(item.system?.grants)) {
        for (const g of item.system.grants) {
          if (g?.kind === 'skill' && g.name && g.name.toLowerCase().trim() === norm) {
            gearBonus += Number(g.bonus ?? g.rank) || 0;
          }
        }
      }
    }
    return gearBonus;
  }

  /**
   * Look up an actor's effective or modified rank for a spell by name (case-insensitive).
   * @param {string} spellName
   * @returns {number} The spell rank (0 if not possessed)
   */
  getSpellRank(spellName) {
    if (!spellName) return 0;
    const norm = spellName.toLowerCase().trim();
    const spells = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'spell') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'spell')) : [];
    const spell = spells.find(s => s.name?.toLowerCase().trim() === norm);
    if (spell) {
      return Number(spell.system?.modifiedRank ?? spell.system?.rank) || 1;
    }
    // Check equipped gear granting the spell
    const equippedGear = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'gear' && i.system?.equipped) : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'gear' && i.system?.equipped)) : [];
    for (const item of equippedGear) {
      let rawMods = item.system?.skillModifiers;
      if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
        rawMods = Object.values(rawMods);
      }
      const skillMods = Array.isArray(rawMods) ? rawMods : [];
      for (const sm of skillMods) {
        if (sm?.name && sm.name.toLowerCase().trim() === norm) {
          return Number(sm.bonus ?? sm.rank) || 1;
        }
      }
      const rawSpells = item.system?.grantedSpells || item.system?.spells;
      const explicitSpells = Array.isArray(rawSpells) ? rawSpells : (rawSpells && typeof rawSpells === 'object' ? Object.values(rawSpells) : []);
      for (const sp of explicitSpells) {
        const sName = typeof sp === 'string' ? sp : (sp?.name || sp?.spellName);
        if (sName && sName.toLowerCase().trim() === norm) {
          return Number(sp.rank ?? sp.bonus) || 1;
        }
      }
      const rawOutcomes = item.system?.outcomes;
      const outcomes = Array.isArray(rawOutcomes) ? rawOutcomes : (rawOutcomes && typeof rawOutcomes === 'object' ? Object.values(rawOutcomes) : []);
      for (const out of outcomes) {
        if (out?.type === 'spell' && (out.spellName || out.name)?.toLowerCase().trim() === norm) {
          return Number(out.rank ?? out.bonus) || 1;
        }
      }
      if (Array.isArray(item.system?.grants)) {
        for (const g of item.system.grants) {
          if (g?.kind === 'spell' && (g.name || g.spellName) && (g.name || g.spellName).toLowerCase().trim() === norm) {
            return Number(g.rank ?? g.bonus) || 1;
          }
        }
      }
    }
    return 0;
  }

  /**
   * Aggregate active Heal-Over-Time (HoT) effects from active buffs.
   * @returns {Array<{ name: string, healingPerRound: string|number, duration: string }>}
   */
  getHealingOverTime() {
    const activeBuffs = this.getActiveBuffs();
    const hots = [];
    for (const buff of activeBuffs) {
      if (!buff) continue;
      const bSys = buff.system || buff;
      if (bSys.healingPerRound) {
        hots.push({
          name: buff.name,
          healingPerRound: bSys.healingPerRound,
          duration: bSys.duration || ''
        });
      }
    }
    return hots;
  }

  /**
   * Aggregate active Damage-Over-Time (DoT) effects from active debuffs.
   * @returns {Array<{ name: string, damagePerRound: string|number, damageType: string, duration: string }>}
   */
  getDamageOverTime() {
    const debuffs = this.items
      ? (this.items.filter ? this.items.filter(i => i.type === 'debuff') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'debuff'))
      : [];
    const dots = [];
    for (const debuff of debuffs) {
      if (!debuff) continue;
      const dSys = debuff.system || {};
      if (dSys.damagePerRound) {
        dots.push({
          name: debuff.name,
          damagePerRound: dSys.damagePerRound,
          damageType: dSys.damageType || '',
          duration: dSys.duration || ''
        });
      }
    }
    return dots;
  }

  /**
   * Get the actor's effective rank in the "Determine Value" skill.
   * @returns {number}
   */
  getDetermineValueRank() {
    return this.getSkillRank('Determine Value');
  }

  /**
   * Whether the actor has reached Rank 10 in Determine Value to see item/gear gold values.
   * @returns {boolean}
   */
  canDetermineValue() {
    return this.getDetermineValueRank() >= 10;
  }

  /**
   * Alias for canDetermineValue.
   * @returns {boolean}
   */
  canSeeItemValue() {
    return this.canDetermineValue();
  }

  /**
   * Whether the actor has reached Rank 5 in Determine Value to sort inventory items by gold value.
   * @returns {boolean}
   */
  canSortInventoryByValue() {
    return this.getDetermineValueRank() >= 5;
  }

  /**
   * Sort an array of items by gold value.
   * @param {Array<Item>} items
   * @param {object} [options={}]
   * @param {boolean} [options.descending=true]
   * @returns {Array<Item>}
   */
  sortInventoryByValue(items, { descending = true } = {}) {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
      const valA = Number(a.system?.value ?? a.goldValue ?? 0);
      const valB = Number(b.system?.value ?? b.goldValue ?? 0);
      const diff = descending ? valB - valA : valA - valB;
      if (diff !== 0) return diff;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  /**
   * Retrieve inventory items (gear and/or loot) optionally sorted by value or default sort.
   * @param {object} [options={}]
   * @param {string} [options.type='all'] 'all' | 'gear' | 'loot'
   * @param {string} [options.sortBy='default'] 'default' | 'value' | 'name'
   * @param {boolean} [options.descending=true]
   * @returns {Array<Item>}
   */
  getInventory({ type = 'all', sortBy = 'default', descending = true } = {}) {
    const all = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'gear' || i.type === 'loot') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'gear' || i.type === 'loot')) : [];
    let filtered = all;
    if (type === 'gear') filtered = all.filter(i => i.type === 'gear');
    else if (type === 'loot') filtered = all.filter(i => i.type === 'loot');

    if (sortBy === 'value' && this.canSortInventoryByValue()) {
      return this.sortInventoryByValue(filtered, { descending });
    } else if (sortBy === 'name') {
      return [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'value') {
      // Cannot sort by value without rank 5; return default order
      return [...filtered].sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));
    }
    return [...filtered].sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));
  }

  /**
   * Apply a race to this character, automatically reverting previous race benefits.
   * @param {string} raceIdentifier - Race name or ID
   * @param {object} [options={}] - Options such as { choices, interactive }
   * @returns {Promise<boolean>}
   */
  async applyRace(raceIdentifier, options = {}) {
    return DCCRaceClassApplier.applyRace(this, raceIdentifier, options);
  }

  /**
   * Remove any applied race benefits from this character.
   * @returns {Promise<boolean>}
   */
  async removeRace() {
    return DCCRaceClassApplier.removeRace(this);
  }

  /**
   * Apply a class to this character, automatically reverting previous class benefits.
   * @param {string} classIdentifier - Class name or ID
   * @param {object} [options={}] - Options such as { choices, interactive }
   * @returns {Promise<boolean>}
   */
  async applyClass(classIdentifier, options = {}) {
    return DCCRaceClassApplier.applyClass(this, classIdentifier, options);
  }

  /**
   * Remove any applied class benefits from this character.
   * @returns {Promise<boolean>}
   */
  async removeClass() {
    return DCCRaceClassApplier.removeClass(this);
  }
}
