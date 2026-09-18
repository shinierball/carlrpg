import { DCCCombatMetrics, getHpPerBar } from '../apps/combat-metrics.mjs';
import { DCCSessionEngine } from '../apps/session-manager.mjs';
import { getSizeInfo } from '../data/sizes.mjs';
import { getRankDamageDie, parseUpgrades, getEvadeTargetDifficulty } from '../data/rank-dice.mjs';

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

export class DCCActor extends Actor {
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
    }
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
    }
    // Ensure abilities have unenhanced initialized if missing
    if (this.system.abilities) {
      for (const ability of Object.values(this.system.abilities)) {
        if (ability && (ability.unenhanced === undefined || ability.unenhanced === null || ability.unenhanced === '')) {
          ability.unenhanced = ability.value || 10;
        }
      }
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
    if (system.attributes) {
      system.attributes.resistances = Array.from(resistances);
      system.attributes.immunities = Array.from(immunities);
      system.attributes.damageMultipliers = damageMultipliers;
      system.attributes.damageMultiplier = damageMultipliers.all;
      system.attributes.activeBuffs = activeBuffs;

      const dexMod = system.abilities?.dex?.mod ?? 0;
      const evadeBuffs = Number(system.attributes.evade?.buffs) || 0;
      if (system.attributes.evade) {
        system.attributes.evade.items = gearEvade;
        system.attributes.evade.gear = gearEvade;
        system.attributes.evade.total = dexMod + evadeBuffs + gearEvade;
      }

      const drArmor = Number(system.attributes.dr?.armor) || 0;
      const drBuffs = Number(system.attributes.dr?.buffs) || 0;
      if (system.attributes.dr) {
        system.attributes.dr.items = gearDR;
        system.attributes.dr.gear = gearDR;
        system.attributes.dr.total = drArmor + drBuffs + gearDR;
      }

      if (system.attributes.hp) {
        const conMod = system.abilities?.con?.mod ?? 1;
        system.attributes.hp.max = 10 * conMod;
        const rawVal = Number(system.attributes.hp.value);
        const hpVal = Number.isFinite(rawVal) ? rawVal : system.attributes.hp.max;
        system.attributes.hp.value = hpVal;
        const hpMax = Number(system.attributes.hp.max) || 1;
        system.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((hpVal / hpMax) * 100)));

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
    }

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
        const itemBonus = gearData ? gearData.bonus : 0;
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
  async rollStat(statKey) {
    const ability = this.system.abilities?.[statKey];
    if (!ability) return;

    const mod = ability.mod ?? 0;
    const statName = statKey.toUpperCase();
    const formula = `1d20 + ${mod}`;
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

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${statName} Check`
    });
  }

  /**
   * Roll Evade check
   */
  async rollEvade() {
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

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: Evade Roll (1d20 + ${parts.join(' + ')})`
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
   * Resolve all damage parts for an attack from the weapon/attack item itself,
   * equipped gear bonuses, and active skill modifiers (with rank gating).
  /**
   * Parse and calculate skill attack damage formula and metadata based on official DCC RPG rules.
   * Weapon Attack Damage = Weapon Base Damage + Skill Rank Damage Die + Stat Mod.
   * Handles Hand-to-Hand Damage Effects (Pugilism + Iron Punch), rank damage die scaling table,
   * Fire Fingers rank 15 passive melee bonus, and rank upgrade additions.
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
      : (Number(skillItem?.modifiedRank ?? sys.modifiedRank ?? skillItem?.effectiveRank ?? sys.rank) || 0);

    const rawNotes = sys.notes || '';
    const rawBaseDamage = sys.baseDamage || '';
    const textToSearch = rawBaseDamage || rawNotes;

    let baseCount = 1;
    let baseSides = 4;
    let statKey = (sys.stat || 'str').toLowerCase();
    let damageType = sys.damageType || 'Physical';

    // Parse Base Damage e.g. "Base Damage: 1d4 + Str Bludgeoning", "1d2 + Str Bludgeoning", or "Deal +1d2 base damage"
    const diceMatch = textToSearch.match(/(?:(?:Base Damage|deal)\s*:?\s*)?(\+?\d+d\d+)(?:\s*\+\s*([a-zA-Z]+))?\s*([a-zA-Z\s]+)?/i);
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
      const simpleDice = textToSearch.match(/(\d+)d(\d+)/i);
      if (simpleDice) {
        baseCount = parseInt(simpleDice[1], 10);
        baseSides = parseInt(simpleDice[2], 10);
      }
    }

    const skillType = sys.skillType || sys.type || '';
    const checkType = (sys.checkType || '').toLowerCase();
    const isCombatSkill = /combat/i.test(sys.category || '') ||
      ['Edge', 'Bashing', 'Reach', 'Ranged', 'Strike', 'Hand to Hand'].includes(skillType) ||
      checkType.includes('attack') ||
      /pugilism|unarmed combat/i.test(skillName);

    const hasExplicitDamage = Boolean(rawBaseDamage || diceMatch || textToSearch.match(/(\d+)d(\d+)/i) || /base damage/i.test(textToSearch));

    if (!isCombatSkill && !hasExplicitDamage) {
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

    // Ensure statKey is valid ability on this actor
    if (!this.system?.abilities?.[statKey]) {
      statKey = (sys.stat || 'str').toLowerCase();
    }
    const statMod = this.system?.abilities?.[statKey]?.mod ?? 0;

    // Upgrades parsing
    const upgrades = parseUpgrades(sys.upgrades);
    if (rank >= 5 && upgrades.rank5) {
      const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)\s+base damage/i);
      if (u5 && parseInt(u5[2], 10) === baseSides) {
        baseCount += parseInt(u5[1], 10);
      }
    }
    if (rank >= 10 && upgrades.rank10) {
      const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)\s+base damage/i);
      if (u10 && parseInt(u10[2], 10) === baseSides) {
        baseCount += parseInt(u10[1], 10);
      }
    }
    if (rank >= 15 && upgrades.rank15) {
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
    // Pugilism can combine with Iron Punch.
    const isUnarmed = /unarmed combat/i.test(skillName);
    const isPugilism = /pugilism/i.test(skillName);
    let ironPunchApplied = false;
    let ironPunchRank = 0;

    if (!isUnarmed && (isPugilism || options.effect)) {
      const effectParam = options.effect;
      const effectName = typeof effectParam === 'string' ? effectParam : (effectParam?.name || '');
      let ironPunchItem = null;

      if (/iron punch/i.test(effectName)) {
        ironPunchItem = typeof effectParam === 'object' ? effectParam : (this.items ? (this.items.find ? this.items.find(i => i.type === 'skill' && /iron punch/i.test(i.name)) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'skill' && /iron punch/i.test(i.name))) : null);
        ironPunchApplied = true;
      } else if (options.ironPunch) {
        ironPunchApplied = true;
        ironPunchItem = typeof options.ironPunch === 'object' ? options.ironPunch : (this.items ? (this.items.find ? this.items.find(i => i.type === 'skill' && /iron punch/i.test(i.name)) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'skill' && /iron punch/i.test(i.name))) : null);
      } else if (isPugilism) {
        const ownedIp = this.items ? (this.items.find ? this.items.find(i => i.type === 'skill' && /iron punch/i.test(i.name)) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'skill' && /iron punch/i.test(i.name))) : null;
        if (ownedIp) {
          ironPunchApplied = true;
          ironPunchItem = ownedIp;
        }
      }

      if (ironPunchApplied) {
        ironPunchRank = options.effectRank !== undefined
          ? Number(options.effectRank)
          : (Number(ironPunchItem?.system?.modifiedRank ?? ironPunchItem?.system?.rank ?? rank) || 0);

        // Iron Punch adds +1d2 base damage to Pugilism strike, plus +1d2 at R5, R10, R15 milestones
        if (baseSides === 2) {
          let ipBonusCount = 1;
          if (ironPunchRank >= 5) ipBonusCount += 1;
          if (ironPunchRank >= 10) ipBonusCount += 1;
          if (ironPunchRank >= 15) ipBonusCount += 1;
          baseCount += ipBonusCount;
        }
      }
    }

    // Rank Damage Die
    const rankDie = getRankDamageDie(rank);
    let ironPunchRankDie = null;
    if (ironPunchApplied && ironPunchRank >= 5) {
      ironPunchRankDie = getRankDamageDie(ironPunchRank);
    }

    let combinedRankDieStr = '';
    if (ironPunchRankDie && ironPunchRankDie.dice && rankDie.dice) {
      const m1 = rankDie.dice.match(/(\d+)d(\d+)/i);
      const m2 = ironPunchRankDie.dice.match(/(\d+)d(\d+)/i);
      if (m1 && m2 && m1[2] === m2[2]) {
        const totalRankCount = parseInt(m1[1], 10) + parseInt(m2[1], 10);
        combinedRankDieStr = `${totalRankCount}d${m1[2]}`;
      } else {
        combinedRankDieStr = `${rankDie.dice} + ${ironPunchRankDie.dice}`;
      }
    } else if (ironPunchRankDie && ironPunchRankDie.dice) {
      combinedRankDieStr = ironPunchRankDie.dice;
    } else if (rankDie.dice) {
      combinedRankDieStr = rankDie.dice;
    } else if (rankDie.value > 0) {
      combinedRankDieStr = String(rankDie.value);
    }

    // Fire Fingers Rank 15 Passive Melee Bonus:
    // "Your Pugilism, Unarmed Combat, and Slice Attack strikes add 1 Fire Fingers Rank damage die (Fire)."
    let fireFingersBonus = null;
    if (isPugilism || isUnarmed || /slice attack/i.test(skillName)) {
      const ffSpell = this.items ? (this.items.find ? this.items.find(i => i.type === 'spell' && /fire fingers/i.test(i.name)) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'spell' && /fire fingers/i.test(i.name))) : null;
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

    const baseDiceStr = `${baseCount}d${baseSides}`;
    const formulaElements = [baseDiceStr];
    if (combinedRankDieStr) {
      formulaElements.push(combinedRankDieStr);
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
      ironPunchApplied,
      ironPunchRank,
      ironPunchRankDie,
      combinedRankDieStr,
      fireFingersBonus,
      formula,
      formulaWithStat,
      rawNotes
    };
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

      // 3. Fire Fingers Rank 15 Passive
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

      // 4. Equipped Gear damage parts
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

      // 5. Active Buffs
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

      return parts;
    }

    const parts = [];
    const sys = attackItem?.system || {};
    let primaryType = sys.damageType || 'Physical';

    // Identify skill rank for weapon attack
    const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
    const matchingSkill = skills.find(s => s.name?.toLowerCase().trim() === attackItem.name?.toLowerCase().trim());
    const skillRank = matchingSkill
      ? Number(matchingSkill.system?.modifiedRank ?? matchingSkill.system?.rank) || 0
      : (sys.toHitRank !== undefined ? Number(sys.toHitRank) || 0 : (sys.rank !== undefined ? Number(sys.rank) || 0 : 0));

    // Base damage scaling from matching skill rank upgrades
    let upgradedDice = '';
    if (matchingSkill && skillRank >= 5) {
      const upgrades = parseUpgrades(matchingSkill.system?.upgrades);
      const baseDiceStr = sys.damageDice || sys.damageParts?.[0]?.dice || '';
      const dm = baseDiceStr.match(/(\d+)d(\d+)/i);
      if (dm) {
        let count = parseInt(dm[1], 10);
        const sides = parseInt(dm[2], 10);
        if (skillRank >= 5 && upgrades.rank5) {
          const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u5 && parseInt(u5[2], 10) === sides) count += parseInt(u5[1], 10);
        }
        if (skillRank >= 10 && upgrades.rank10) {
          const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u10 && parseInt(u10[2], 10) === sides) count += parseInt(u10[1], 10);
        }
        if (skillRank >= 15 && upgrades.rank15) {
          const u15 = upgrades.rank15.match(/\+(\d+)d(\d+)\s+base damage/i);
          if (u15 && parseInt(u15[2], 10) === sides) count += parseInt(u15[1], 10);
        }
        upgradedDice = `${count}d${sides}`;
      }
    }

    // 1. Primary parts on attackItem
    const rawParts = sys.damageParts || [];
    const itemParts = Array.isArray(rawParts) ? rawParts : Object.values(rawParts);

    if (itemParts.length > 0) {
      let isFirst = true;
      for (const p of itemParts) {
        if (!p) continue;
        const statKey = (p.stat || '').toLowerCase();
        const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
        const type = p.type || sys.damageType || 'Physical';
        if (isFirst) primaryType = type;
        const dice = (isFirst && upgradedDice ? upgradedDice : (p.dice || '')).trim();
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
    } else {
      // Legacy fallback: damageDice + damageStat + effects/damageType
      const statKey = (sys.damageStat || 'str').toLowerCase();
      const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
      const dice = (upgradedDice || sys.damageDice || '1d6').trim();
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
    }

    // Rank Damage Die for Weapon Attack
    if (skillRank > 0) {
      const rankDie = getRankDamageDie(skillRank);
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
    const isMeleeH2H = /pugilism|unarmed combat|slice attack/i.test(attackItem.name || '') ||
      (matchingSkill && /pugilism|unarmed combat|slice attack/i.test(matchingSkill.name || ''));
    if (isMeleeH2H) {
      const ffSpell = this.items ? (this.items.find ? this.items.find(i => i.type === 'spell' && /fire fingers/i.test(i.name)) : Array.from(this.items.values?.() || this.items).find(i => i.type === 'spell' && /fire fingers/i.test(i.name))) : null;
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
      const rank = Number(skill.system?.modifiedRank ?? skill.system?.rank) || 0;
      const rawMods = skill.system?.damageModifiers;
      const mods = Array.isArray(rawMods) ? rawMods : Object.values(rawMods || {});

      for (const m of mods) {
        if (!m) continue;
        const minRank = Number(m.minRank) || 0;
        if (rank >= minRank) {
          const statKey = (m.stat || '').toLowerCase();
          const statMod = statKey && this.system?.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;
          parts.push({
            id: m.id || `skill-${skill.id}-${parts.length}`,
            type: m.type || 'Physical',
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

    return parts;
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

    const sys = attackItem.system || {};
    if (type === 'hit') {
      let toHitStat = 'dex';
      let rank = 0;

      if (attackItem.type === 'skill') {
        const checkType = (sys.checkType || '').toLowerCase();
        const statMatch = checkType.match(/,\s*([a-zA-Z]+)/);
        toHitStat = statMatch ? statMatch[1].toLowerCase() : (sys.stat || 'str').toLowerCase();
        rank = Number(attackItem.modifiedRank ?? sys.modifiedRank ?? attackItem.effectiveRank ?? sys.rank) || 0;
      } else {
        toHitStat = (sys.toHitStat || 'dex').toLowerCase();
        const skills = this.items ? (this.items.filter ? this.items.filter(i => i.type === 'skill') : Array.from(this.items.values?.() || this.items).filter(i => i.type === 'skill')) : [];
        const matchingSkill = skills.find(s => s.name?.toLowerCase().trim() === attackItem.name?.toLowerCase().trim());
        rank = matchingSkill ? (Number(matchingSkill.system?.modifiedRank ?? matchingSkill.system?.rank) || 0) : (Number(sys.toHitRank ?? sys.rank) || 0);
      }

      const statMod = this.system.abilities?.[toHitStat]?.mod ?? 0;
      const isUntrained = rank <= 0;

      let roll;
      let flavorText = '';
      if (isUntrained) {
        const formula = `2d20kl + ${statMod}`;
        roll = await new Roll(formula, { mod: statMod }).evaluate();
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (<strong>Untrained Attack Check with Disadvantage</strong>: 2d20kl + ${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
      } else {
        const total = rank + statMod;
        const formula = `1d20 + ${total}`;
        roll = await new Roll(formula, { rank, mod: statMod }).evaluate();
        flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (To Hit: 1d20 + Rank ${rank} + ${toHitStat.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod} vs Target Evade)`;
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
        const dmgData = this.getSkillDamageData(attackItem);
        if (dmgData.hasDamage) {
          dmgFormula = dmgData.formulaWithStat || dmgData.formula;
        }
      } else if (attackItem.type === 'spell') {
        const dmgData = this.getSpellDamageData(attackItem);
        if (dmgData.hasDamage) {
          dmgFormula = dmgData.formulaWithStat || dmgData.formula;
        }
      } else {
        const parts = this.getAttackDamageParts(attackItem, options);
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
        dmgBtnHtml = `
          <div style="margin-top: 6px;">
            <button type="button" class="dcc-attack-roll-btn roll-attack-dmg-from-card roll-skill-dmg-from-card" data-actor-id="${this.id}" data-item-id="${attackItem.id}" data-skill-id="${attackItem.id}" data-item-type="${attackItem.type || 'attack'}" style="width: 100%; padding: 4px 8px; font-size: 11px; cursor: pointer; background: #c0392b; color: #fff; border: 1px solid #962d22; border-radius: 3px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: bold; font-family: var(--font-primary, 'Oswald', sans-serif);">
              <i class="fa-solid fa-burst"></i> Roll Attack Damage (${dmgFormula})
            </button>
          </div>
        `;
      }

      const rollHtml = typeof roll.render === 'function' ? await roll.render() : '';
      const content = rollHtml ? `${rollHtml}${dmgBtnHtml}` : (dmgBtnHtml || undefined);

      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: flavorText,
        content
      });
    } else {
      const parts = this.getAttackDamageParts(attackItem, options);
      const evaluatedParts = [];
      const typedDamage = {};

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

        // Apply attacker damage multiplier (Scenario 3)
        const mult = this.getDamageMultiplier(part.type);
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
      const hasMult = globalMult !== 1 || evaluatedParts.some(p => p.multiplier !== 1);

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
      const cardContent = `
        <div class="dcc-chat-card dcc-damage-card"
          data-attacker-id="${this.id}"
          data-item-id="${attackItem.id}"
          data-item-name="${attackItem.name}"
          data-damage-value="${totalRawDamage}"
          data-typed-damage='${typedDamageJson}'
          data-attack-type="${attackItem.type || 'attack'}">
          <div class="dcc-damage-card-header">
            <strong>${this.name}</strong>: ${attackItem.name} Damage
          </div>
          <div class="dcc-damage-card-result" style="margin: 6px 0;">
            <span class="dcc-damage-value" style="font-size: 20px; font-weight: bold; color: #c0392b;">${totalRawDamage}</span>
            <span class="dcc-damage-formula">${hasMult ? `(Buff Multiplied Total)` : `Total Damage`}</span>
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
              <button type="button" class="dcc-apply-damage-btn" data-multiplier="2" title="Apply double (critical) damage">Crit (2x)</button>
            </div>
          </div>
        </div>
      `;

      const flavorBreakdown = Object.entries(typedDamage).map(([t, val]) => `${val} ${t}`).join(', ');
      const flavorText = `<strong>${this.name}</strong>: ${attackItem.name} (Damage: ${flavorBreakdown}${hasMult ? ` [x${globalMult}]` : ''})${sys.effects ? ` - <em>${sys.effects}</em>` : ''}`;

      const mainRoll = await new Roll(`${totalRawDamage}`).evaluate();

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
   * Resolve and return details for the up to 3 active external buffs
   * @returns {Array<object>}
   */
  getActiveBuffs() {
    const rawBuffs = this.system?.attributes?.externalBuffs;
    if (!rawBuffs) return [];

    let buffKeys = [];
    if (Array.isArray(rawBuffs)) {
      buffKeys = rawBuffs.slice(0, 3);
    } else if (typeof rawBuffs === 'object') {
      buffKeys = [rawBuffs.buff1, rawBuffs.buff2, rawBuffs.buff3];
    }

    const resolved = [];
    for (const key of buffKeys) {
      if (!key) continue;
      const buffObj = this.resolveBuff(key);
      if (buffObj) resolved.push(buffObj);
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

    const statMatch = lower.match(/\+?(\d+)?\s*(str|int|con|dex|cha|strength|intelligence|constitution|dexterity|charisma)/i);
    if (statMatch) {
      const statMap = { str: 'str', strength: 'str', int: 'int', intelligence: 'int', con: 'con', constitution: 'con', dex: 'dex', dexterity: 'dex', cha: 'cha', charisma: 'cha' };
      const stat = statMap[statMatch[2].toLowerCase()];
      const val = Number(statMatch[1]) || 2;
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

    if (this.hasImmunity(damageType)) {
      return { percent: 1, flat: 0, rounding: 'up', isResistant: false, isImmune: true };
    }

    let percent = 0;
    let flat = 0;
    let rounding = 'up';
    let isResistant = this.hasResistance(damageType);
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

      // Check multi damageModifiers if present
      if (Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0) {
        for (const dm of sys.damageModifiers) {
          if (!dm) continue;
          const kind = (dm.kind || dm.type || '').toLowerCase();
          const dt = (dm.damageType || '').toLowerCase().trim();
          const applies = !dt || dt === 'all' || dt === targetType;

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
        // Legacy single modifier fallback
        const itemDmg = (sys.damageType || '').toLowerCase().trim();
        const appliesToType = !itemDmg || itemDmg === targetType || itemDmg === 'all' || desc.includes(targetType) || desc.includes('all damage') || desc.includes('all attacks');
        if (appliesToType) {
          if (sys.reductionPercent) {
            const rawPct = Number(sys.reductionPercent) || 0;
            percent += rawPct > 1 ? rawPct / 100 : rawPct;
          } else {
            // Parse e.g. "reduces all fire damage by 50% rounded up"
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
  async rollSkill(skillItem) {
    // Record skill usage in active combat if applicable
    if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.recordSkillUsage === 'function') {
      DCCCombatMetrics.recordSkillUsage({ actor: this, skillName: skillItem.name }).catch(() => {});
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

    // Untrained Check (Modified Rank <= 0): Disadvantage (2d20kl + mod)
    if (modifiedRank <= 0) {
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

    // Trained Check (Modified Rank > 0): 1d20 + Total Skill (Modified Rank + Stat Mod)
    const breakdown = [`Rank ${modifiedRank}`];
    if (itemBonus > 0 || boonBonus > 0 || typeBonus > 0) {
      const parts = [`Base ${baseRank}`];
      if (itemBonus > 0) parts.push(`Items +${itemBonus}`);
      if (typeBonus > 0) parts.push(`Type +${typeBonus}`);
      if (boonBonus > 0) parts.push(`Boons +${boonBonus}`);
      breakdown[0] += ` [${parts.join(', ')}]`;
    }
    breakdown.push(`${statName} Mod ${statMod >= 0 ? `+${statMod}` : statMod}`);

    const formula = `1d20 + ${totalSkill}`;
    const roll = await new Roll(formula, { rank: modifiedRank, mod: statMod }).evaluate();
    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'skill',
        name: skillItem.name,
        isUntrained: false
      }).catch(() => {});
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
      flavor: `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check: 1d20 + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`,
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
    if (!baseDmg || sys.spellType === 'Heal' || /health bar|resistance/i.test(baseDmg)) {
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '', debuffs: [] };
    }

    const diceMatch = baseDmg.match(/(\d+)d(\d+)/i);
    const flatMatch = !diceMatch ? baseDmg.match(/^[+]?(\d+)/) : null;

    if (!diceMatch && !flatMatch) {
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '', debuffs: [] };
    }

    let diceStr = '';
    let sides = 0;
    let count = 0;
    let damageType = sys.damageType || '';
    const debuffs = [];

    const rank = Number(sys.modifiedRank ?? sys.rank) || 1;
    const rawUpgrades = sys.upgrades || {};
    const upgrades = parseUpgrades(rawUpgrades);

    if (diceMatch) {
      count = parseInt(diceMatch[1], 10);
      sides = parseInt(diceMatch[2], 10);

      // Check rank upgrades for bonus damage dice and effects
      if (rank >= 5 && upgrades.rank5) {
        const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)/i);
        if (u5 && parseInt(u5[2], 10) === sides) count += parseInt(u5[1], 10);
        if (/Burned Debuff/i.test(upgrades.rank5)) {
          debuffs.push(/1\s*or\s*more\s*Health\s*Bar/i.test(upgrades.rank5) ? 'Burned (on 1+ HB loss)' : 'Burned');
        }
      }
      if (rank >= 10 && upgrades.rank10) {
        const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)/i);
        if (u10 && parseInt(u10[2], 10) === sides) count += parseInt(u10[1], 10);
        if (/Force and Fire/i.test(upgrades.rank10)) {
          damageType = 'Force & Fire';
        }
        if (/Burned Debuff/i.test(upgrades.rank10) && !debuffs.includes('Burned')) {
          debuffs.push('Burned');
        }
      }
      if (rank >= 15 && upgrades.rank15) {
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
      diceStr = `${count}d${sides}`;
    }

    // Determine governing stat
    let statKey = null;
    const statMatch = baseDmg.match(/\+\s*(int|cha|con|dex|str)\b/i);
    if (statMatch) {
      statKey = statMatch[1].toLowerCase();
    } else if (diceMatch && sys.stat && !/per|ft|\//i.test(baseDmg.split(diceMatch[0])[1] || '')) {
      if (sys.spellType === 'Attack') statKey = (sys.stat || 'int').toLowerCase();
    }

    const statMod = statKey && this.system.abilities?.[statKey] ? (this.system.abilities[statKey].mod ?? 0) : 0;

    // Rank Damage Die scaling table
    const rankDie = getRankDamageDie(rank);
    let formula = diceStr;

    if (flatMatch) {
      formula = flatMatch[1];
      if (sys.spellType !== 'Passive') {
        if (rankDie.dice) {
          formula += ` + ${rankDie.dice}`;
        } else if (rankDie.value) {
          formula += ` + ${rankDie.value}`;
        }
      }
    } else {
      if (rankDie.dice) {
        formula += ` + ${rankDie.dice}`;
      } else if (rankDie.value) {
        formula += ` + ${rankDie.value}`;
      }
    }

    if (statKey) {
      formula += statMod >= 0 ? ` + ${statMod}` : ` - ${Math.abs(statMod)}`;
    }

    // Extract rider effects (e.g. blast radius, splash)
    let effects = '';
    if (baseDmg.includes(',')) {
      effects = baseDmg.split(',').slice(1).join(',').trim();
    }

    // Formulate readable formulaWithStat
    const formulaWithStatParts = [diceStr || (flatMatch ? flatMatch[1] : '')];
    if (rankDie.dice) {
      formulaWithStatParts.push(rankDie.dice);
    } else if (rankDie.value && sys.spellType !== 'Passive') {
      formulaWithStatParts.push(String(rankDie.value));
    }
    if (statKey) {
      formulaWithStatParts.push(statKey.charAt(0).toUpperCase() + statKey.slice(1));
    }
    const formulaWithStat = `${formulaWithStatParts.join(' + ')}${damageType ? ` ${damageType}` : ''}`.trim();

    return {
      hasDamage: true,
      dice: diceStr,
      baseDice: diceStr,
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
            <button type="button" class="dcc-apply-damage-btn" data-multiplier="2" title="Apply double (critical) damage">Crit (2x)</button>
          </div>
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
          debuffs: dmgData.debuffs || []
        }
      }
    });
  }

  /**
   * Roll Spell Attack / To-Hit
   * @param {DCCItem} spellItem
   */
  async rollSpellAttack(spellItem) {
    const sys = spellItem.system || {};
    const statKey = (sys.stat || 'int').toLowerCase();
    const statMod = this.system.abilities?.[statKey]?.mod ?? 0;
    const rank = Number(sys.rank) || 1;
    const total = rank + statMod;
    const formula = `1d20 + ${total}`;
    const roll = await new Roll(formula).evaluate();
    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll,
        type: 'spell',
        name: `${spellItem.name} (Attack)`,
        isUntrained: false
      }).catch(() => {});
    }

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${spellItem.name} (Spell Attack / To Hit: 1d20 + Rank ${rank} + ${statKey.toUpperCase()} Mod ${statMod >= 0 ? `+${statMod}` : statMod})`
    });
  }

  /**
   * Cast/Roll a DCC Spell, posting a formatted chat card to chat
   * @param {DCCItem} spellItem
   * @param {'cast'|'damage'|'hit'} [action='cast']
   */
  async rollSpell(spellItem, action = 'cast') {
    if (action === 'damage') {
      return this.rollSpellDamage(spellItem);
    }
    if (action === 'hit') {
      return this.rollSpellAttack(spellItem);
    }

    const sys = spellItem.system || {};
    const manaCost = Math.max(0, Number(sys.manaCost) || 0);
    const rawMana = this.system?.attributes?.mana?.value !== undefined
      ? Number(this.system.attributes.mana.value)
      : (Number(this.system?.attributes?.mana?.max) || 0);
    const currentMana = Number.isFinite(rawMana) ? rawMana : 0;

    // Check existing mana: if insufficient, the spell fails
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
            currentMana
          }
        }
      });
    }

    // Subtract mana on successful cast
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

    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordRoll === 'function') {
      DCCSessionEngine.recordRoll({
        actor: this,
        roll: { total: 0, formula: manaCost > 0 ? `${manaCost} MP` : '0 MP' },
        type: 'spell',
        name: spellItem.name,
        notes: healInfo
          ? `Cast Heal (+${healInfo.actualHealed} HP to self, ${healInfo.newHp}/${healInfo.maxHp} HP)`
          : `Cast ${spellItem.name} (${manaCost} MP)`
      }).catch(() => {});
    }

    const dmgData = this.getSpellDamageData(spellItem);

    let content = `
      <div class="dcc-chat-card dcc-spell-card" style="font-family: var(--font-primary, sans-serif);">
        <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
          <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px;" />
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${spellItem.name}</h3>
            <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">${sys.spellType || 'Spell'}${sys.damageType ? ` • ${sys.damageType}` : ''}</span>
          </div>
        </div>
    `;

    if (sys.quote) {
      content += `<div style="font-style: italic; color: #555; font-size: 12px; margin-bottom: 8px; border-left: 3px solid #d4af37; padding-left: 6px;">“${sys.quote}”</div>`;
    }

    content += `
      <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #fdfaf2; border: 1px solid #e2d9c2; padding: 4px 6px; border-radius: 3px;">
        <div><strong>Mana:</strong> <span style="color: #2980b9; font-weight: bold;">${manaCost ? `${manaCost} MP` : 'None'}</span>${manaCost > 0 ? ` <small style="color: #7f8c8d;">(${newMana} MP left)</small>` : ''}</div>
        <div><strong>Range:</strong> ${sys.range || 'Self'}</div>
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

    if (sys.upgrades?.rank5 || sys.upgrades?.rank10 || sys.upgrades?.rank15) {
      content += `<div style="border-top: 1px dashed #ccc; padding-top: 4px; font-size: 11px; color: #444;">`;
      if (sys.upgrades.rank5 && sys.upgrades.rank5 !== 'None') content += `<div><strong style="color: #27ae60;">Rank 5:</strong> ${sys.upgrades.rank5}</div>`;
      if (sys.upgrades.rank10 && sys.upgrades.rank10 !== 'None') content += `<div><strong style="color: #2980b9;">Rank 10:</strong> ${sys.upgrades.rank10}</div>`;
      if (sys.upgrades.rank15 && sys.upgrades.rank15 !== 'None') content += `<div><strong style="color: #8e44ad;">Rank 15:</strong> ${sys.upgrades.rank15}</div>`;
      content += `</div>`;
    }

    // Embed Roll Spell Damage action button if the spell discusses damage
    if (dmgData.hasDamage) {
      content += `
        <div style="margin-top: 10px; padding-top: 6px; border-top: 1px dashed #c0392b;">
          <button type="button" class="dcc-btn roll-spell-dmg-from-card" data-spell-id="${spellItem.id}" data-actor-id="${this.id}" style="width: 100%; background: #c0392b; color: #fff; border: 1px solid #7f1d1d; border-radius: 4px; padding: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font-primary, sans-serif); font-size: 12px;">
            <i class="fa-solid fa-burst"></i> Roll Spell Damage (${dmgData.formula})
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
          remainingMana: newMana,
          isHeal: Boolean(healInfo),
          healInfo: healInfo || null
        }
      }
    });
  }
}
