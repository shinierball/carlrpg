import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Loot and Consumable Items.
 */
export class LootDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      value: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      cooldown: new fields.StringField({ initial: 'None' }),
      lootType: new fields.StringField({ initial: 'consumable' }),
      executionMode: new fields.StringField({ initial: '' }),
      charges: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        max: new fields.NumberField({ integer: true, min: 0, initial: 0 })
      }),
      spellId: new fields.StringField({ initial: '' }),
      spellName: new fields.StringField({ initial: '' }),
      tableUuid: new fields.StringField({ initial: '' }),
      tableName: new fields.StringField({ initial: '' }),
      outcomes: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
