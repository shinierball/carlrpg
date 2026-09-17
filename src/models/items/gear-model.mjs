import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Gear and Equipment Items.
 */
export class GearDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    const abilityModifierField = () => new fields.SchemaField({
      value: new fields.NumberField({ integer: true, initial: 0 }),
      type: new fields.StringField({ initial: 'flat' })
    });

    return {
      slot: new fields.StringField({ initial: 'torso' }),
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      equipped: new fields.BooleanField({ initial: false }),
      drBonus: new fields.NumberField({ integer: true, initial: 0 }),
      evadeBonus: new fields.NumberField({ integer: true, initial: 0 }),
      abilityModifiers: new fields.SchemaField({
        str: abilityModifierField(),
        int: abilityModifierField(),
        con: abilityModifierField(),
        dex: abilityModifierField(),
        cha: abilityModifierField()
      }),
      skillModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      damageParts: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
