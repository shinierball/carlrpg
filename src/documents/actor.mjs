/**
 * Dungeon Crawler Carl RPG Actor Document
 */
export class DCCActor extends Actor {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const system = this.system;

    // Calculate 5 Core Ability Modifiers
    if (system.abilities) {
      for (const [key, ability] of Object.entries(system.abilities)) {
        const enhancedVal = Number(ability.value) || 10;
        ability.mod = Math.floor((enhancedVal - 10) / 2);
      }
    }

    // Calculate Evade, DR, and HP percentage for Crawler/Creature
    if (system.attributes) {
      const dexMod = system.abilities?.dex?.mod ?? 0;
      const evadeBuffs = Number(system.attributes.evade?.buffs) || 0;
      if (system.attributes.evade) {
        system.attributes.evade.total = 10 + dexMod + evadeBuffs;
      }

      const drArmor = Number(system.attributes.dr?.armor) || 0;
      const drBuffs = Number(system.attributes.dr?.buffs) || 0;
      if (system.attributes.dr) {
        system.attributes.dr.total = drArmor + drBuffs;
      }

      if (system.attributes.hp) {
        const hpVal = Number(system.attributes.hp.value) || 0;
        const hpMax = Number(system.attributes.hp.max) || 1;
        system.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((hpVal / hpMax) * 100)));
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
    const formula = `1d20 + ${dexMod} + ${buffs}`;
    const roll = await new Roll(formula).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: Evade Roll`
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
      const formula = `1d20 + ${rank} + ${statMod}`;
      const roll = await new Roll(formula).evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${attackItem.name} (To Hit)`
      });
    } else {
      const statMod = this.system.abilities?.[sys.damageStat]?.mod ?? 0;
      const dice = sys.damageDice || '1d6';
      const formula = `${dice} + ${statMod}`;
      const roll = await new Roll(formula).evaluate();
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<strong>${this.name}</strong>: ${attackItem.name} (Damage) ${sys.effects ? ` - <em>${sys.effects}</em>` : ''}`
      });
    }
  }

  /**
   * Roll Skill Check
   * @param {Item} skillItem
   */
  async rollSkill(skillItem) {
    const sys = skillItem.system;
    const statMod = this.system.abilities?.[sys.stat]?.mod ?? 0;
    const rank = Number(sys.rank) || 0;
    const formula = `1d20 + ${rank} + ${statMod}`;
    const roll = await new Roll(formula).evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<strong>${this.name}</strong>: ${skillItem.name} (${sys.stat.toUpperCase()}) Skill Check`
    });
  }
}
