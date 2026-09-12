/**
 * Dungeon Crawler Carl RPG Item Document
 */
export class DCCItem extends Item {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === 'skill') {
      const baseRank = Number(this.system.rank) || 0;
      const itemBonus = Number(this.system.itemBonus) || 0;
      const boonBonus = Number(this.system.boonBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus);
      this.system.modifiedRank = modifiedRank;
      this.modifiedRank = modifiedRank;
      this.effectiveRank = modifiedRank;
    }
  }

  /**
   * Roll item trigger (attack, skill check, etc.)
   */
  async roll() {
    if (!this.actor) return;
    if (this.type === 'attack') {
      return this.actor.rollAttack(this, 'hit');
    }
    if (this.type === 'skill') {
      return this.actor.rollSkill(this);
    }
  }
}
