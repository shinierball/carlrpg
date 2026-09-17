import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Attack Items.
 */
export class AttackDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      toHitStat: new fields.StringField({ initial: 'dex' }),
      toHitRank: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      toHitMod: new fields.NumberField({ integer: true, initial: 0 }),
      damageDice: new fields.StringField({ initial: '1d6' }),
      damageStat: new fields.StringField({ initial: 'str' }),
      damageMod: new fields.NumberField({ integer: true, initial: 0 }),
      damageType: new fields.StringField({ initial: '' }),
      damageParts: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      effects: new fields.HTMLField({ initial: '' })
    };
  }
}
