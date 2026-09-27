import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Loot and Consumable Items.
 */
export class LootDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      cooldown: new fields.StringField({ initial: 'None' }),
      lootType: new fields.StringField({ initial: 'consumable' }),
      outcomes: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
