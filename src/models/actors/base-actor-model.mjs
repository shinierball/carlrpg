import { getSizeInfo } from '../../data/sizes.mjs';
import { getDCCStatModifier, isWeaponGear } from '../../documents/actor.mjs';

/**
 * Canonical Condition & Status Effect Limb Modifiers
 * Maps condition keys to default changes in arms, legs, or hands.
 */
export const CANONICAL_CONDITION_LIMB_MODIFIERS = {
  'amputated arm': { arms: -1, hands: -1, legs: 0 },
  'severed arm': { arms: -1, hands: -1, legs: 0 },
  'lost arm': { arms: -1, hands: -1, legs: 0 },
  'amputated leg': { arms: 0, hands: 0, legs: -1 },
  'severed leg': { arms: 0, hands: 0, legs: -1 },
  'lost leg': { arms: 0, hands: 0, legs: -1 },
  'severed hand': { arms: 0, hands: -1, legs: 0 },
  'amputated hand': { arms: 0, hands: -1, legs: 0 },
  'lost hand': { arms: 0, hands: -1, legs: 0 },
  'extra arms': { arms: 2, hands: 2, legs: 0 },
  'extra arm': { arms: 1, hands: 1, legs: 0 },
  'prosthetic arm': { arms: 1, hands: 1, legs: 0 },
  'prosthetic hand': { arms: 0, hands: 1, legs: 0 },
  'prosthetic leg': { arms: 0, hands: 0, legs: 1 }
};

/**
 * Calculate the number of hands required to wield an item.
 * @param {object} item
 * @returns {number}
 */
export function calculateItemHandsRequired(item) {
  if (!item) return 0;
  if (item.type !== 'gear' && item.type !== 'attack') return 0;
  const sys = item.system || {};

  // Unassigned or unequipped items require 0 hands
  if (item.type === 'gear' && !sys.equipped) return 0;
  if (item.type === 'attack' && sys.equipped === false) return 0;

  // Explicit handsRequired override if specified
  if (sys.handsRequired !== undefined && sys.handsRequired !== null && sys.handsRequired !== '') {
    const parsed = Number(sys.handsRequired);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  // Natural attacks require 0 hands unless configured
  if (sys.isNatural === true) return 0;

  if (item.type === 'gear') {
    const slot = (sys.slot || '').toLowerCase();
    const isWpn = sys.isWeapon || slot === 'hands' || slot === 'holding' || (typeof isWeaponGear === 'function' && isWeaponGear(item));
    if (!isWpn) return 0;
  }

  if (item.type === 'attack') {
    // If not a weapon or explicitly natural attack without category/type
    if (!sys.weaponCategory && !sys.weaponType && !sys.wieldMode && !sys.isWeapon) {
      return 0;
    }
  }

  const wieldMode = sys.wieldMode || 'one_handed';
  if (wieldMode === 'two_handed') {
    return 2;
  }
  if (wieldMode === 'two_handed_disadv_1h') {
    if (sys.oneHanded || sys.wieldedOneHanded) {
      return 1;
    }
    return 2;
  }
  return 1;
}

/**
 * Base TypeDataModel for DCC RPG Actor types.
 * Provides shared abilities, base attributes, and stat derivation methods.
 */
export class BaseActorDataModel extends (globalThis.foundry?.abstract?.TypeDataModel || class {}) {
  /**
   * Helper to retrieve the parent Actor document
   * @type {Actor|null}
   */
  get actor() {
    return this.parent || null;
  }

  /**
   * Define the 5 DCC RPG core ability score fields
   * @returns {foundry.data.fields.SchemaField}
   */
  static defineAbilitiesField() {
    const fields = globalThis.foundry.data.fields;
    const defineAbility = () => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, initial: 10 }),
      unenhanced: new fields.NumberField({ required: true, integer: true, initial: 10 }),
      mod: new fields.NumberField({ required: true, integer: true, initial: 4 })
    });

    return new fields.SchemaField({
      str: defineAbility(),
      int: defineAbility(),
      con: defineAbility(),
      dex: defineAbility(),
      cha: defineAbility()
    });
  }

  /**
   * Define standard DCC RPG base attributes schema
   * @returns {foundry.data.fields.SchemaField}
   */
  static defineBaseAttributesField() {
    const fields = globalThis.foundry.data.fields;

    return new fields.SchemaField({
      hp: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 40 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 40 }),
        temp: new fields.NumberField({ integer: true, initial: 0 }),
        pct: new fields.NumberField({ integer: true, initial: 100 }),
        tempBars: new fields.SchemaField({
          count: new fields.NumberField({ integer: true, initial: 0 }),
          maxCount: new fields.NumberField({ integer: true, initial: 0 }),
          hpPerSlot: new fields.NumberField({ integer: true, initial: 0 }),
          currentSlotHp: new fields.NumberField({ integer: true, initial: 0 }),
          source: new fields.StringField({ initial: '' })
        })
      }),
      mana: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 10 }),
        max: new fields.NumberField({ required: true, integer: true, initial: 10 }),
        pct: new fields.NumberField({ integer: true, initial: 100 })
      }),
      evade: new fields.SchemaField({
        items: new fields.NumberField({ integer: true, initial: 0 }),
        buffs: new fields.NumberField({ integer: true, initial: 0 }),
        total: new fields.NumberField({ integer: true, initial: 4 })
      }),
      dr: new fields.SchemaField({
        armor: new fields.NumberField({ integer: true, initial: 0 }),
        items: new fields.NumberField({ integer: true, initial: 0 }),
        buffs: new fields.NumberField({ integer: true, initial: 0 }),
        total: new fields.NumberField({ integer: true, initial: 0 })
      }),
      speed: new fields.SchemaField({
        move: new fields.NumberField({ integer: true, initial: 20 }),
        step: new fields.NumberField({ integer: true, initial: 10 }),
        climb: new fields.NumberField({ integer: true, initial: 0 }),
        swim: new fields.NumberField({ integer: true, initial: 0 }),
        fly: new fields.NumberField({ integer: true, initial: 0 }),
        burrow: new fields.NumberField({ integer: true, initial: 0 })
      }),
      aiFavor: new fields.NumberField({ integer: true, initial: 0 }),
      size: new fields.StringField({ initial: 'Medium' }),
      debuffs: new fields.StringField({ initial: '' }),
      externalBuffs: new fields.SchemaField({
        buff1: new fields.StringField({ initial: '' }),
        buff2: new fields.StringField({ initial: '' }),
        buff3: new fields.StringField({ initial: '' })
      }),
      limbs: new fields.SchemaField({
        arms: new fields.NumberField({ integer: true, min: 0, initial: 2 }),
        legs: new fields.NumberField({ integer: true, min: 0, initial: 2 }),
        hands: new fields.NumberField({ integer: true, min: 0, initial: 2 })
      })
    });
  }

  /** @override */
  prepareBaseData() {
    // Ensure unenhanced values exist for each ability score
    if (this.abilities) {
      for (const ability of Object.values(this.abilities)) {
        if (ability && (ability.unenhanced === undefined || ability.unenhanced === null || ability.unenhanced === '')) {
          ability.unenhanced = ability.value || 10;
        }
      }
    }

    // Ensure base limbs exist
    if (this.attributes) {
      if (!this.attributes.limbs) {
        this.attributes.limbs = { arms: 2, legs: 2, hands: 2 };
      }
      if (this.attributes.limbs.arms === undefined || this.attributes.limbs.arms === null) this.attributes.limbs.arms = 2;
      if (this.attributes.limbs.legs === undefined || this.attributes.limbs.legs === null) this.attributes.limbs.legs = 2;
      if (this.attributes.limbs.hands === undefined || this.attributes.limbs.hands === null) this.attributes.limbs.hands = 2;
    }
  }

  /**
   * Shared derived data preparation for actors with core abilities and attributes.
   * Computes gear bonuses, external buffs, debuff penalties, core stat values & modifiers,
   * Evade, DR, HP (with temp HP), and Mana.
   */
  prepareDerivedBaseStats() {
    const actor = this.actor;

    // 1. Normalize size
    if (this.attributes) {
      const sizeInfo = getSizeInfo(this.attributes.size);
      this.attributes.sizeInfo = sizeInfo;
      this.attributes.sizeNumber = sizeInfo.size;
      this.attributes.sizeLabel = sizeInfo.label;
    }

    // 2. Gather equipped gear
    const items = actor?.items ? (Array.isArray(actor.items) ? actor.items : Array.from(actor.items.values?.() || [])) : [];
    const equippedGear = items.filter(i => i.type === 'gear' && i.system?.equipped);

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
      if (sys?.abilityModifiers) {
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
      gearDR += Number(sys?.drBonus ?? sys?.armorBonus) || 0;
      gearEvade += Number(sys?.evadeBonus) || 0;
    }

    // 3. Resolve active external buffs (up to 3)
    const activeBuffs = actor?.getActiveBuffs ? actor.getActiveBuffs() : [];
    const buffStatBonuses = { str: 0, int: 0, con: 0, dex: 0, cha: 0 };
    const resistances = new Set();
    const immunities = new Set();
    let buffTempHp = 0;
    let deltaArms = 0;
    let deltaLegs = 0;
    let deltaHands = 0;
    const damageMultipliers = { all: 1 };
    if (globalThis.CONFIG?.DCC?.damageTypes) {
      for (const dt of globalThis.CONFIG.DCC.damageTypes) {
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

    // 4. Process debuff stat penalties from embedded debuff items
    const debuffItems = items.filter(i => i.type === 'debuff');
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

    // 5. Calculate 5 Core Ability Scores and Modifiers using unenhanced base + gear bonuses + external buff bonuses
    if (this.abilities) {
      for (const [key, ability] of Object.entries(this.abilities)) {
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

    // 6. Calculate Evade, DR, HP, and Mana
    if (this.attributes) {
      this.attributes.resistances = Array.from(resistances);
      this.attributes.immunities = Array.from(immunities);
      this.attributes.damageMultipliers = damageMultipliers;
      this.attributes.damageMultiplier = damageMultipliers.all;
      this.attributes.activeBuffs = activeBuffs;

      const dexMod = this.abilities?.dex?.mod ?? 0;
      const evadeBuffs = Number(this.attributes.evade?.buffs) || 0;
      if (this.attributes.evade) {
        this.attributes.evade.items = gearEvade;
        this.attributes.evade.gear = gearEvade;
        this.attributes.evade.total = dexMod + evadeBuffs + gearEvade;
      }

      const drArmor = Number(this.attributes.dr?.armor) || 0;
      const drBuffs = Number(this.attributes.dr?.buffs) || 0;
      if (this.attributes.dr) {
        this.attributes.dr.items = gearDR;
        this.attributes.dr.gear = gearDR;
        this.attributes.dr.total = drArmor + drBuffs + gearDR;
      }

      if (this.attributes.hp) {
        const conMod = this.abilities?.con?.mod ?? 1;
        this.attributes.hp.max = 10 * conMod;
        const rawVal = Number(this.attributes.hp.value);
        const hpVal = Number.isFinite(rawVal) ? rawVal : this.attributes.hp.max;
        this.attributes.hp.value = hpVal;
        const hpMax = Number(this.attributes.hp.max) || 1;
        this.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((hpVal / hpMax) * 100)));

        if (buffTempHp > 0) {
          this.attributes.hp.buffTemp = buffTempHp;
          if (this.attributes.hp.temp === undefined || this.attributes.hp.temp === null || Number(this.attributes.hp.temp) <= 0) {
            this.attributes.hp.temp = buffTempHp;
          }
        }
      }

      if (this.attributes.mana) {
        const enhancedInt = Number(this.abilities?.int?.value) || 0;
        this.attributes.mana.max = enhancedInt;
        const rawMana = Number(this.attributes.mana.value);
        const manaVal = Number.isFinite(rawMana) ? rawMana : this.attributes.mana.max;
        this.attributes.mana.value = manaVal;
        const manaMax = Number(this.attributes.mana.max) || 1;
        this.attributes.mana.pct = Math.min(100, Math.max(0, Math.round((manaVal / manaMax) * 100)));
      }

      if (this.attributes.speed) {
        if (this.attributes.speed.move === undefined || this.attributes.speed.move === null || this.attributes.speed.move === '') {
          this.attributes.speed.move = 20;
        }
        if (this.attributes.speed.step === undefined || this.attributes.speed.step === null || this.attributes.speed.step === '') {
          this.attributes.speed.step = 10;
        }
      }

      // 7. Calculate Limbs (Arms, Legs, Hands) and Wielding Hand Limit
      const baseArms = Number(this.attributes?.limbs?.arms ?? 2);
      const baseLegs = Number(this.attributes?.limbs?.legs ?? 2);
      const baseHands = Number(this.attributes?.limbs?.hands ?? 2);

      const maxArms = Math.max(0, (Number.isFinite(baseArms) ? baseArms : 2) + deltaArms);
      const maxLegs = Math.max(0, (Number.isFinite(baseLegs) ? baseLegs : 2) + deltaLegs);
      const maxHands = Math.max(0, (Number.isFinite(baseHands) ? baseHands : 2) + deltaHands);

      let usedHands = 0;
      const equippedHandItems = [];

      for (const item of items) {
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

      if (!this.attributes.limbs) {
        this.attributes.limbs = { arms: baseArms, legs: baseLegs, hands: baseHands };
      }
      this.attributes.limbs.arms = baseArms;
      this.attributes.limbs.legs = baseLegs;
      this.attributes.limbs.hands = baseHands;
      this.attributes.limbs.maxArms = maxArms;
      this.attributes.limbs.maxLegs = maxLegs;
      this.attributes.limbs.maxHands = maxHands;
      this.attributes.limbs.deltaArms = deltaArms;
      this.attributes.limbs.deltaLegs = deltaLegs;
      this.attributes.limbs.deltaHands = deltaHands;
      this.attributes.limbs.usedHands = usedHands;
      this.attributes.limbs.equippedHandItems = equippedHandItems;
      this.attributes.limbs.exceededHands = exceededHands;
      this.attributes.limbs.handsWarning = handsWarning;
    }

    return { equippedGear };
  }
}
