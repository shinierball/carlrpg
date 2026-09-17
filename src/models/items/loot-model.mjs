import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Loot and Consumable Items.
 */
export class LootDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
