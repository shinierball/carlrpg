import { BaseActorDataModel } from './base-actor-model.mjs';

/**
 * TypeDataModel for Pets / Companions.
 * Encapsulates core abilities, derived health and evasion, level, and signature attacks.
 */
export class PetDataModel extends BaseActorDataModel {
  /** @override */
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;

    return {
      abilities: BaseActorDataModel.defineAbilitiesField(),
      attributes: BaseActorDataModel.defineBaseAttributesField(),
      details: new fields.SchemaField({
        level: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
        special: new fields.HTMLField({ initial: '' }),
        attack1: new fields.StringField({ initial: '' }),
        attack2: new fields.StringField({ initial: '' })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    this.prepareDerivedBaseStats();
  }
}
