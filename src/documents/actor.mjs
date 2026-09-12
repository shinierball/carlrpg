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
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const system = this.system;

    // Calculate 5 Core Ability Modifiers using Enhanced values
    if (system.abilities) {
      for (const [key, ability] of Object.entries(system.abilities)) {
        const enhancedVal = Number(ability.value) || 0;
        ability.mod = getDCCStatModifier(enhancedVal);
      }
    }

    // Calculate Evade, DR, and HP percentage for Crawler/Creature
    if (system.attributes) {
      const dexMod = system.abilities?.dex?.mod ?? 0;
      const evadeBuffs = Number(system.attributes.evade?.buffs) || 0;
      if (system.attributes.evade) {
        system.attributes.evade.total = dexMod + evadeBuffs;
      }

      const drArmor = Number(system.attributes.dr?.armor) || 0;
      const drBuffs = Number(system.attributes.dr?.buffs) || 0;
      if (system.attributes.dr) {
        system.attributes.dr.total = drArmor + drBuffs;
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
    const buffs = Number(this.system.attributes?.evade?.buffs) || 0;
    const total = dexMod + buffs;
    const formula = `1d20 + ${total}`;
    const roll = await new Roll(formula).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: Evade Roll (1d20 + DEX Mod ${dexMod} + Buffs ${buffs})`
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
   * - Untrained (Rank 0): Roll with Disadvantage (2d20kl + Stat Mod).
   * - Trained (Rank > 0): Roll Standard (1d20 + Rank + Stat Mod).
   * - Passive Skills: Informational message (no roll required).
   * - Call a Play: Roll 2d6.
   * - Intervene: Roll 1d6.
   * @param {Item} skillItem
   */
  async rollSkill(skillItem) {
    const sys = skillItem.system;
    const statKey = sys.stat || 'str';
    const statName = statKey.toUpperCase();
    const statMod = this.system.abilities?.[statKey]?.mod ?? 0;
    const rank = Number(sys.rank) || 0;
    const checkType = (sys.checkType || '').toLowerCase();

    // Passive skill handling
    if (checkType.includes('passive') || checkType.includes('no roll')) {
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `<div class="dcc-chat-card">
          <h4><strong>${this.name}</strong>: ${skillItem.name}</h4>
          <p><em>Passive Skill (No roll required)</em></p>
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

    // Untrained Check (Rank 0): Disadvantage (2d20kl + mod)
    if (rank <= 0) {
      const formula = `2d20kl + ${statMod}`;
      const roll = await new Roll(formula, { mod: statMod }).evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${skillItem.name} (<strong>Untrained Check with Disadvantage</strong>: 2d20kl + ${statName} Mod ${statMod})`
      });
    }

    // Trained Check (Rank > 0): 1d20 + rank + mod
    const total = rank + statMod;
    const formula = `1d20 + ${total}`;
    const roll = await new Roll(formula, { rank, mod: statMod }).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${skillItem.name} (${statName} Check: 1d20 + Rank ${rank} + Stat Mod ${statMod})`
    });
  }
}
