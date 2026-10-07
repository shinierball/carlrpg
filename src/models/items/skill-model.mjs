import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Skill Items.
 */
export class SkillDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      rank: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      boonBonus: new fields.NumberField({ integer: true, initial: 0 }),
      itemBonus: new fields.NumberField({ integer: true, initial: 0 }),
      typeBonus: new fields.NumberField({ integer: true, initial: 0 }),
      modifiedRank: new fields.NumberField({ integer: true, initial: 1 }),
      stat: new fields.StringField({ initial: 'str' }),
      skillType: new fields.StringField({ initial: 'Utility' }),
      type: new fields.StringField({ initial: 'Utility' }),
      checkType: new fields.StringField({ initial: 'Stat Check' }),
      category: new fields.StringField({ initial: 'Utility' }),
      notes: new fields.HTMLField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      upgrades: new fields.StringField({ initial: '' }),
      damageModifiers: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      checked: new fields.BooleanField({ initial: false }),
      investedHours: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      isTechnique: new fields.BooleanField({ initial: false }),
      appliesTo: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      techniqueConfig: new fields.SchemaField({
        isDamageEffect: new fields.BooleanField({ initial: false }),
        appliesToTags: new fields.ArrayField(new fields.StringField(), { initial: [] }),
        baseDiceCountMod: new fields.StringField({ initial: '' }),
        baseDiceSidesMod: new fields.StringField({ initial: '' }),
        flatDamageMod: new fields.StringField({ initial: '' }),
        damageBonus: new fields.StringField({ initial: '' }),
        damageType: new fields.StringField({ initial: '' }),
        debuffName: new fields.StringField({ initial: '' }),
        cooldown: new fields.StringField({ initial: 'None' })
      }),
      optionalEffects: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      selectedEffect: new fields.StringField({ initial: '' }),
      fumbleDebuff: new fields.StringField({ initial: '' }),
      onHitDebuff: new fields.StringField({ initial: '' }),
      onHitDebuffMinRank: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      critMultiplierR5: new fields.NumberField({ integer: true, min: 1, initial: 4 }),
      critMultiplierR15: new fields.NumberField({ integer: true, min: 1, initial: 8 }),
      rankBreaks: new fields.SchemaField({
        rank5: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          baseDiceCountMod: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank10: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          baseDiceCountMod: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank15: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          baseDiceCountMod: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        }),
        rank20: new fields.SchemaField({
          damageDice: new fields.StringField({ initial: '' }),
          baseDiceCountMod: new fields.StringField({ initial: '' }),
          rankDamageDice: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
          buffsResistances: new fields.StringField({ initial: '' }),
          debuff: new fields.StringField({ initial: '' }),
          notes: new fields.StringField({ initial: '' })
        })
      })
    };
  }

  /**
   * Calculates total effective rank including all bonus sources.
   * @type {number}
   */
  get totalRank() {
    return (this.rank || 0) + (this.boonBonus || 0) + (this.itemBonus || 0) + (this.typeBonus || 0);
  }
}
