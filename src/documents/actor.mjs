import { DCCCombatMetrics } from '../apps/combat-metrics.mjs';

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
      this.updateSource({
        'prototypeToken.actorLink': true,
        'prototypeToken.disposition': 1
      });
    }
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
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
    const system = this.system;

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

    // Calculate 5 Core Ability Scores and Modifiers using unenhanced base + gear bonuses
    if (system.abilities) {
      for (const [key, ability] of Object.entries(system.abilities)) {
        let unenhanced = Number(ability.unenhanced);
        if (!Number.isFinite(unenhanced) || unenhanced <= 0) {
          unenhanced = Number(ability.value) || 10;
          ability.unenhanced = unenhanced;
        }
        const flatMod = gearStatBonuses[key]?.flat || 0;
        const pctMod = gearStatBonuses[key]?.pct || 0;

        // Percentage bonus rounded up (e.g. +10% of 10 = +1)
        const pctBonus = pctMod !== 0
          ? (pctMod > 0 ? Math.ceil((unenhanced * pctMod) / 100) : Math.floor((unenhanced * pctMod) / 100))
          : 0;

        ability.gearBonus = flatMod + pctBonus;
        ability.value = unenhanced + ability.gearBonus;
        ability.mod = getDCCStatModifier(ability.value);
      }
    }

    // Calculate Evade, DR, HP, and Mana for Crawler/Creature
    if (system.attributes) {
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
        const hpMax = Number(system.attributes.hp.max) || 1;
        system.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((hpVal / hpMax) * 100)));
      }

      if (system.attributes.mana) {
        const enhancedInt = Number(system.abilities?.int?.value) || 0;
        system.attributes.mana.max = enhancedInt;
        const rawMana = Number(system.attributes.mana.value);
        const manaVal = Number.isFinite(rawMana) ? rawMana : system.attributes.mana.max;
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
      for (const item of skills) {
        const norm = item.name.toLowerCase().trim();
        const baseRank = Number(item.system.rank) || 0;
        const gearData = gearSkillBonuses.get(norm);
        const itemBonus = gearData ? gearData.bonus : 0;
        const boonBonus = Number(item.system.boonBonus) || 0;
        const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus);

        const stat = item.system.stat || 'str';
        const statMod = system.abilities?.[stat]?.mod ?? 0;
        const totalSkill = modifiedRank + statMod;

        // Store on system
        item.system.itemBonus = itemBonus;
        item.system.boonBonus = boonBonus;
        item.system.modifiedRank = modifiedRank;
        item.system.totalSkill = totalSkill;
        item.system.statMod = statMod;

        // Direct accessors
        item.baseRank = baseRank;
        item.itemBonus = itemBonus;
        item.boonBonus = boonBonus;
        item.modifiedRank = modifiedRank;
        item.effectiveRank = modifiedRank;
        item.statMod = statMod;
        item.statModStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;
        item.totalSkill = totalSkill;
        item.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
        item.itemSources = gearData ? gearData.sources.join(', ') : '';
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

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: Evade Roll (1d20 + ${parts.join(' + ')})`
    });
  }

  /**
   * Roll Attack: To-Hit and Damage
   * @param {Item} attackItem
   * @param {'hit'|'damage'} type
   */
  async rollAttack(attackItem, type = 'hit') {
    if (attackItem.type === 'spell') {
      if (type === 'damage') {
        return this.rollSpellDamage(attackItem);
      }
      return this.rollSpellAttack(attackItem);
    }

    const sys = attackItem.system;
    if (type === 'hit') {
      const statMod = this.system.abilities?.[sys.toHitStat]?.mod ?? 0;
      const rank = Number(sys.toHitRank) || 0;
      const total = rank + statMod;
      const formula = `1d20 + ${total}`;
      const roll = await new Roll(formula).evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${attackItem.name} (To Hit: 1d20 + Rank ${rank} + ${sys.toHitStat.toUpperCase()} Mod ${statMod})`
      });
    } else {
      const statMod = this.system.abilities?.[sys.damageStat]?.mod ?? 0;
      const dice = sys.damageDice || '1d6';
      const formula = `${dice} + ${statMod}`;
      const roll = await new Roll(formula).evaluate();

      const cardContent = `
        <div class="dcc-chat-card dcc-damage-card" data-attacker-id="${this.id}" data-item-id="${attackItem.id}" data-item-name="${attackItem.name}" data-damage-value="${roll.total}" data-attack-type="${attackItem.type || 'attack'}">
          <div class="dcc-damage-card-header">
            <strong>${this.name}</strong>: ${attackItem.name} Damage
          </div>
          <div class="dcc-damage-card-result">
            <span class="dcc-damage-value">${roll.total}</span>
            <span class="dcc-damage-formula">(${formula})</span>
          </div>
          ${sys.effects ? `<div class="dcc-damage-effects"><em>${sys.effects}</em></div>` : ''}
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
        flavor: `<strong>${this.name}</strong>: ${attackItem.name} (Damage: ${dice} + ${sys.damageStat.toUpperCase()} Mod ${statMod}) ${sys.effects ? ` - <em>${sys.effects}</em>` : ''}`,
        content: cardContent,
        flags: {
          'carl-rpg': {
            isDamageRoll: true,
            attackerId: this.id,
            itemId: attackItem.id,
            itemName: attackItem.name,
            attackType: attackItem.type || 'attack',
            rawDamage: roll.total
          }
        }
      });
    }
  }

  /**
   * Apply incoming damage to this actor using DCC RPG rules (DR, Temp HP, full damage bars).
   * @param {number} rawDamage
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async applyDamage(rawDamage, options = {}) {
    return DCCCombatMetrics.applyDamageToTarget({
      targetActor: this,
      rawDamage,
      ...options
    });
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
    const totalSkill = modifiedRank + statMod;
    const checkType = (sys.checkType || '').toLowerCase();

    // Passive skill handling
    if (checkType.includes('passive') || checkType.includes('no roll')) {
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `<div class="dcc-chat-card">
          <h4><strong>${this.name}</strong>: ${skillItem.name}</h4>
          <p><em>Passive Skill (No roll required)</em></p>
          <p><strong>Modified Rank:</strong> ${modifiedRank} (Base ${baseRank}${itemBonus ? `, Items +${itemBonus}` : ''}${boonBonus ? `, Boons +${boonBonus}` : ''})</p>
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
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${skillItem.name} (<strong>Untrained Check with Disadvantage</strong>: 2d20kl + ${statName} Mod ${statMod >= 0 ? `+${statMod}` : statMod})`
      });
    }

    // Trained Check (Modified Rank > 0): 1d20 + Total Skill (Modified Rank + Stat Mod)
    const breakdown = [`Rank ${modifiedRank}`];
    if (itemBonus > 0 || boonBonus > 0) {
      const parts = [`Base ${baseRank}`];
      if (itemBonus > 0) parts.push(`Items +${itemBonus}`);
      if (boonBonus > 0) parts.push(`Boons +${boonBonus}`);
      breakdown[0] += ` [${parts.join(', ')}]`;
    }
    breakdown.push(`${statName} Mod ${statMod >= 0 ? `+${statMod}` : statMod}`);

    const formula = `1d20 + ${totalSkill}`;
    const roll = await new Roll(formula, { rank: modifiedRank, mod: statMod }).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check: 1d20 + ${breakdown.join(' + ')} = <strong>Total ${totalSkill >= 0 ? `+${totalSkill}` : totalSkill}</strong>)`
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
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '' };
    }

    const diceMatch = baseDmg.match(/(\d+)d(\d+)/i);
    const flatMatch = !diceMatch ? baseDmg.match(/^[+]?(\d+)/) : null;

    if (!diceMatch && !flatMatch) {
      return { hasDamage: false, formula: '', dice: '', statMod: 0, effects: '' };
    }

    let diceStr = '';
    let sides = 0;
    let count = 0;

    if (diceMatch) {
      count = parseInt(diceMatch[1], 10);
      sides = parseInt(diceMatch[2], 10);

      // Check rank upgrades for bonus damage dice
      const rank = Number(sys.rank) || 1;
      const upgrades = sys.upgrades || {};
      if (rank >= 5 && upgrades.rank5) {
        const u5 = upgrades.rank5.match(/\+(\d+)d(\d+)/i);
        if (u5 && parseInt(u5[2], 10) === sides) count += parseInt(u5[1], 10);
      }
      if (rank >= 10 && upgrades.rank10) {
        const u10 = upgrades.rank10.match(/\+(\d+)d(\d+)/i);
        if (u10 && parseInt(u10[2], 10) === sides) count += parseInt(u10[1], 10);
      }
      if (rank >= 15 && upgrades.rank15) {
        const u15 = upgrades.rank15.match(/\+(\d+)d(\d+)/i);
        if (u15 && parseInt(u15[2], 10) === sides) count += parseInt(u15[1], 10);
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

    let formula = diceStr;
    if (flatMatch) {
      formula = flatMatch[1];
    } else if (statKey) {
      formula += statMod >= 0 ? ` + ${statMod}` : ` - ${Math.abs(statMod)}`;
    }

    // Extract rider effects (e.g. blast radius, splash)
    let effects = '';
    if (baseDmg.includes(',')) {
      effects = baseDmg.split(',').slice(1).join(',').trim();
    }

    const damageType = sys.damageType || '';

    return {
      hasDamage: true,
      dice: diceStr,
      count,
      sides,
      stat: statKey,
      statMod,
      formula,
      damageType,
      effects,
      rawBase: baseDmg
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
    const effectsStr = dmgData.effects || sys.limitations || '';

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
          rawDamage: roll.total
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
    const manaCost = sys.manaCost ?? 0;
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
        <div><strong>Mana:</strong> <span style="color: #2980b9; font-weight: bold;">${manaCost ? manaCost : 'None'}</span></div>
        <div><strong>Range:</strong> ${sys.range || 'Self'}</div>
        <div><strong>Duration:</strong> ${sys.duration || 'Instantaneous'}</div>
        ${sys.cooldown && sys.cooldown !== 'None' ? `<div><strong>Cooldown:</strong> ${sys.cooldown}</div>` : ''}
        ${sys.favored ? `<div><strong>Favored:</strong> ${sys.favored}</div>` : ''}
        ${sys.aiFavor ? `<div><strong>AI Favor:</strong> +${sys.aiFavor}</div>` : ''}
      </div>
    `;

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
      content
    });
  }
}
