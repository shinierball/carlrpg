/**
 * Dungeon Crawler Carl RPG Item Document
 */
export class DCCItem extends Item {
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
