import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Buff Items.
 */
export class BuffDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      buffType: new fields.StringField({ initial: 'stat' }),
      stat: new fields.StringField({ initial: 'str' }),
      value: new fields.NumberField({ initial: 2 }),
      damageMultiplier: new fields.NumberField({ initial: 1 }),
      damageType: new fields.StringField({ initial: '' }),
      statModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      damageModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      duration: new fields.StringField({ initial: '1 Hour' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
