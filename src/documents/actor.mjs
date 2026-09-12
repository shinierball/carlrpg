/**
 * Dungeon Crawler Carl RPG Actor Document
 */

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

export class DCCActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (this.type === 'crawler' || this.type === 'pet') {
      this.updateSource({
        prototypeToken: {
          actorLink: true,
          disposition: 1
        }
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
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${attackItem.name} (Damage: ${dice} + ${sys.damageStat.toUpperCase()} Mod ${statMod}) ${sys.effects ? ` - <em>${sys.effects}</em>` : ''}`
      });
    }
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
}
