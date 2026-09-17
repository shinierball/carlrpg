import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Race Items.
 */
export class RaceDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      abilities: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}

/**
 * Data Model for DCC RPG Class Items.
 */
export class ClassDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      abilities: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}

/**
 * Data Model for DCC RPG Deity Items.
 */
export class DeityDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      boons: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}

/**
 * Data Model for DCC RPG Sponsor Items.
 */
export class SponsorDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      gifts: new fields.HTMLField({ initial: '' }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    };
  }
}
