import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Buff Items.
 */
export class BuffDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      ...super.defineSchema(),
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
      description: new fields.HTMLField({ initial: '' }),
      area: new fields.SchemaField({
        hasArea: new fields.BooleanField({ initial: false }),
        shape: new fields.StringField({ initial: 'burst' }),
        radius: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        coneAngle: new fields.NumberField({ initial: 53.13 }),
        lineLength: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        lineWidth: new fields.NumberField({ integer: true, min: 0, initial: 5 }),
        origin: new fields.StringField({ initial: 'caster' }),
        targetFilter: new fields.StringField({ initial: 'allies' }),
        radiusBonus: new fields.NumberField({ integer: true, initial: 0 })
      }),
      delivery: new fields.StringField({ initial: 'self' }),
      tempBars: new fields.SchemaField({
        hasTempBars: new fields.BooleanField({ initial: false }),
        slotsFormula: new fields.StringField({ initial: '' }),
        hpPerSlot: new fields.NumberField({ integer: true, min: 0, initial: 0 })
      }),
      durationConfig: new fields.SchemaField({
        type: new fields.StringField({ initial: 'minutes' }),
        rounds: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        minutes: new fields.NumberField({ integer: true, min: 0, initial: 60 }),
        hours: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
        remainingRounds: new fields.NumberField({ integer: true, min: 0, initial: 0 })
      }),
      light: new fields.SchemaField({
        emits: new fields.BooleanField({ initial: false }),
        dim: new fields.NumberField({ min: 0, initial: 0 }),
        bright: new fields.NumberField({ min: 0, initial: 0 }),
        color: new fields.StringField({ initial: '' }),
        animation: new fields.StringField({ initial: '' })
      }),
      active: new fields.BooleanField({ initial: false })
    };
  }
}
