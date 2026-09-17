import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Skill Items.
 */
export class SkillDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      rank: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      boonBonus: new fields.NumberField({ integer: true, initial: 0 }),
      itemBonus: new fields.NumberField({ integer: true, initial: 0 }),
      typeBonus: new fields.NumberField({ integer: true, initial: 0 }),
      modifiedRank: new fields.NumberField({ integer: true, initial: 1 }),
      stat: new fields.StringField({ initial: 'str' }),
      skillType: new fields.StringField({ initial: 'Utility' }),
      type: new fields.StringField({ initial: 'Utility' }),
      checkType: new fields.StringField({ initial: 'Stat Check' }),
      category: new fields.StringField({ initial: 'Utility' }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      upgrades: new fields.StringField({ initial: '' }),
      damageModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      checked: new fields.BooleanField({ initial: false })
    };
  }

  /**
   * Calculates total effective rank including all bonus sources.
   * @type {number}
   */
  get totalRank() {
    return (this.rank || 0) + (this.boonBonus || 0) + (this.itemBonus || 0) + (this.typeBonus || 0);
  }
}
