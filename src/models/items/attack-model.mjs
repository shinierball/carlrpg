import { BaseItemDataModel } from './base-item-model.mjs';

/**
 * Data Model for DCC RPG Attack Items.
 */
export class AttackDataModel extends BaseItemDataModel {
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;
    return {
      equipped: new fields.BooleanField({ initial: true }),
      handsRequired: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      wieldMode: new fields.StringField({
        initial: 'one_handed',
        choices: ['one_handed', 'two_handed', 'two_handed_disadv_1h']
      }),
      weaponCategory: new fields.StringField({ initial: '' }),
      weaponType: new fields.StringField({ initial: '' }),
      associatedSkills: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      proficiencyMode: new fields.StringField({
        initial: 'highest',
        choices: ['highest', 'synergy', 'manual']
      }),
      selectedSkill: new fields.StringField({ initial: '' }),
      toHitStat: new fields.StringField({ initial: 'dex' }),
      toHitRank: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      toHitMod: new fields.NumberField({ integer: true, initial: 0 }),
      damageDice: new fields.StringField({ initial: '1d6' }),
      damageStat: new fields.StringField({ initial: 'str' }),
      damageMod: new fields.NumberField({ integer: true, initial: 0 }),
      damageType: new fields.StringField({ initial: '' }),
      damageParts: new fields.ArrayField(new fields.ObjectField(), { initial: [] }),
      effects: new fields.HTMLField({ initial: '' }),
      critMultiplier: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
      optionalEffects: new fields.ArrayField(new fields.StringField(), { initial: [] }),
      selectedEffect: new fields.StringField({ initial: '' })
    };
  }
}
