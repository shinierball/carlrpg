import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Race Items.
 */
export class RaceDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      heritage: new fields.StringField({ initial: 'Earth' }),
      size: new fields.StringField({ initial: 'Medium (4)' }),
      prerequisites: new fields.StringField({ initial: '' }),
      drBonus: new fields.NumberField({ integer: true, initial: 0 }),
      movement: new fields.SchemaField({
        walkDelta: new fields.NumberField({ integer: true, initial: 0 }),
        climb: new fields.NumberField({ integer: true, initial: 0 }),
        swim: new fields.NumberField({ integer: true, initial: 0 }),
        fly: new fields.NumberField({ integer: true, initial: 0 }),
        burrow: new fields.NumberField({ integer: true, initial: 0 })
      }),
      stats: new fields.SchemaField({
        str: new fields.NumberField({ integer: true, initial: 0 }),
        dex: new fields.NumberField({ integer: true, initial: 0 }),
        con: new fields.NumberField({ integer: true, initial: 0 }),
        int: new fields.NumberField({ integer: true, initial: 0 }),
        cha: new fields.NumberField({ integer: true, initial: 0 })
      }),
      skills: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      spells: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenSkills: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenSpells: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      buffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      debuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenBuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenDebuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      perks: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      detriments: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      chosenPerks: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      chosenDetriments: new fields.ArrayField(new fields.StringField(), { initial: [] }),
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
      classType: new fields.StringField({ initial: 'Fighter' }),
      archetype: new fields.StringField({ initial: 'Fighter' }),
      prerequisites: new fields.StringField({ initial: '' }),
      drBonus: new fields.NumberField({ integer: true, initial: 0 }),
      movement: new fields.SchemaField({
        walkDelta: new fields.NumberField({ integer: true, initial: 0 }),
        climb: new fields.NumberField({ integer: true, initial: 0 }),
        swim: new fields.NumberField({ integer: true, initial: 0 }),
        fly: new fields.NumberField({ integer: true, initial: 0 }),
        burrow: new fields.NumberField({ integer: true, initial: 0 })
      }),
      stats: new fields.SchemaField({
        str: new fields.NumberField({ integer: true, initial: 0 }),
        dex: new fields.NumberField({ integer: true, initial: 0 }),
        con: new fields.NumberField({ integer: true, initial: 0 }),
        int: new fields.NumberField({ integer: true, initial: 0 }),
        cha: new fields.NumberField({ integer: true, initial: 0 })
      }),
      skills: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      spells: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenSkills: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenSpells: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      buffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      debuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenBuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      chosenDebuffs: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      perks: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      detriments: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      chosenPerks: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      chosenDetriments: new fields.ArrayField(new fields.StringField(), { initial: [] }),
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
