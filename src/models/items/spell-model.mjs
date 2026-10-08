import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Spell Items.
 */
export class SpellDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      ...super.defineSchema(),
      rank: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      stat: new fields.StringField({ initial: 'int' }),
      manaCost: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      range: new fields.StringField({ initial: '30 feet' }),
      duration: new fields.StringField({ initial: 'Instantaneous' }),
      cooldown: new fields.StringField({ initial: 'None' }),
      spellType: new fields.StringField({ initial: 'Attack' }),
      damageType: new fields.StringField({ initial: '' }),
      baseDamage: new fields.StringField({ initial: '' }),
      damageModifiers: new fields.ArrayField(new fields.SchemaField({
        type: new fields.StringField({ initial: 'Fire' }),
        value: new fields.NumberField({ integer: true, initial: 0 }),
        dice: new fields.StringField({ initial: '' }),
        minRank: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        stat: new fields.StringField({ initial: '' })
      })),
      critMultiplierR5: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
      critMultiplierR15: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
      fumbleDebuff: new fields.StringField({ initial: '' }),
      onHitDebuff: new fields.StringField({ initial: '' }),
      onHitDebuffMinRank: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      optionalEffects: new fields.ArrayField(new fields.StringField()),
      selectedEffect: new fields.StringField({ initial: '' }),
      aiFavor: new fields.NumberField({ integer: true, initial: 0 }),
      favored: new fields.StringField({ initial: '' }),
      limitations: new fields.StringField({ initial: '' }),
      quote: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      upgrades: new fields.SchemaField({
        rank5: new fields.StringField({ initial: '' }),
        rank10: new fields.StringField({ initial: '' }),
        rank15: new fields.StringField({ initial: '' }),
        rank20: new fields.StringField({ initial: '' })
      }),
      rankBreaks: new fields.SchemaField({
        rank5: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank10: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank15: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank20: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        })
      })
    };
  }
}
