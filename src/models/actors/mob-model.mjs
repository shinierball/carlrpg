import { BaseActorDataModel } from './base-actor-model.mjs';
import { getDCCStatModifier } from '../../documents/actor.mjs';

/**
 * TypeDataModel for Mob Actors in Dungeon Crawler Carl RPG.
 * Mobs represent dungeon enemies and monsters with:
 * - Variable health bar slots (each bar = CON mod HP, or explicitly defined hpPerBar)
 * - Independent, unlinked scene tokens (actorLink = false)
 * - Unique sequential numbering when placed on a scene
 * - Unique treasure and xp attributes
 * - Evade and Surprise difficulty ratings
 */
export class MobDataModel extends BaseActorDataModel {
  /** @override */
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;

    return {
      abilities: BaseActorDataModel.defineAbilitiesField(),
      attributes: new fields.SchemaField({
        hp: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 4 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 4 }),
          temp: new fields.NumberField({ integer: true, initial: 0 }),
          pct: new fields.NumberField({ integer: true, initial: 100 }),
          bars: new fields.NumberField({ integer: true, initial: 2, min: 1 }),
          hpPerBar: new fields.NumberField({ integer: true, initial: 0, min: 0 })
        }),
        mana: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 0 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 0 }),
          pct: new fields.NumberField({ integer: true, initial: 100 })
        }),
        evade: new fields.SchemaField({
          items: new fields.NumberField({ integer: true, initial: 0 }),
          buffs: new fields.NumberField({ integer: true, initial: 0 }),
          total: new fields.NumberField({ integer: true, initial: 2 })
        }),
        dr: new fields.SchemaField({
          armor: new fields.NumberField({ integer: true, initial: 0 }),
          items: new fields.NumberField({ integer: true, initial: 0 }),
          buffs: new fields.NumberField({ integer: true, initial: 0 }),
          total: new fields.NumberField({ integer: true, initial: 0 })
        }),
        speed: new fields.SchemaField({
          move: new fields.NumberField({ integer: true, initial: 20 }),
          step: new fields.NumberField({ integer: true, initial: 10 })
        }),
        aiFavor: new fields.NumberField({ integer: true, initial: 0 }),
        size: new fields.StringField({ initial: 'Tiny' }),
        debuffs: new fields.StringField({ initial: '' }),
        externalBuffs: new fields.SchemaField({
          buff1: new fields.StringField({ initial: '' }),
          buff2: new fields.StringField({ initial: '' }),
          buff3: new fields.StringField({ initial: '' })
        }),
        treasure: new fields.StringField({ initial: '' }),
        xp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        surpriseDifficulty: new fields.StringField({ initial: '' }),
        evadeDifficulty: new fields.StringField({ initial: '' })
      }),
      details: new fields.SchemaField({
        level: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
        classification: new fields.StringField({ initial: 'Mob' }),
        creatureType: new fields.StringField({ initial: 'Animal' }),
        floor: new fields.StringField({ initial: '' }),
        location: new fields.StringField({ initial: '' }),
        notes: new fields.HTMLField({ initial: '' }),
        special: new fields.HTMLField({ initial: '' }),
        source: new fields.StringField({ initial: '' })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    this.prepareDerivedBaseStats();

    // Health Bar logic for Mobs:
    // Number of health bars is variable (default 2), not fixed to 10.
    // HP per bar is CON modifier unless explicitly set by hpPerBar.
    const conMod = this.abilities?.con?.mod ?? getDCCStatModifier(this.abilities?.con?.value ?? 10);
    const bars = Math.max(1, Number(this.attributes.hp?.bars) || 2);
    const explicitHpPerBar = Number(this.attributes.hp?.hpPerBar) || 0;
    const hpPerBar = explicitHpPerBar > 0 ? explicitHpPerBar : (conMod > 0 ? conMod : 1);

    this.attributes.hp.bars = bars;
    this.attributes.hp.hpPerBar = hpPerBar;
    this.attributes.hp.max = bars * hpPerBar;

    const rawVal = Number(this.attributes.hp.value);
    const hpVal = Number.isFinite(rawVal) ? rawVal : this.attributes.hp.max;
    this.attributes.hp.value = Math.max(0, hpVal);
    const hpMax = this.attributes.hp.max || 1;
    this.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((this.attributes.hp.value / hpMax) * 100)));

    // Derived Evade Difficulty default: 10 + DEX Mod + Floor (represented as e.g. "12+F")
    const dexMod = this.abilities?.dex?.mod ?? getDCCStatModifier(this.abilities?.dex?.value ?? 10);
    if (!this.attributes.evadeDifficulty) {
      this.attributes.evadeDifficulty = `${10 + dexMod}+F`;
    }
  }
}
