import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Debuff Items.
 */
export class DebuffDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      severity: new fields.StringField({ initial: 'Minor' }),
      damageType: new fields.StringField({ initial: '' }),
      reductionPercent: new fields.NumberField({ initial: 0 }),
      rounding: new fields.StringField({ initial: 'up' }),
      statModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      damageModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      duration: new fields.StringField({ initial: 'Combat' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
