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
      healingPerRound: new fields.StringField({ initial: '' }),
      damageMultiplier: new fields.NumberField({ initial: 1 }),
      damageType: new fields.StringField({ initial: '' }),
      rollModifierMode: new fields.StringField({ initial: 'none' }),
      affects: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      limbModifiers: new fields.SchemaField({
        arms: new fields.NumberField({ integer: true, initial: 0 }),
        legs: new fields.NumberField({ integer: true, initial: 0 }),
        hands: new fields.NumberField({ integer: true, initial: 0 })
      }),
      statModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      damageModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      duration: new fields.StringField({ initial: '1 Hour' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
