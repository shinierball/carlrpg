import { getSizeInfo } from '../../data/sizes.mjs';

/**
 * TypeDataModel for Mounts and Vehicles.
 * Encapsulates structural durability (HP), carrying capacity (occupants),
 * movement speed, and natural damage resistance (DR).
 */
export class MountVehicleDataModel extends (globalThis.foundry?.abstract?.TypeDataModel || class {}) {
  /**
   * Helper to retrieve the parent Actor document
   * @type {Actor|null}
   */
  get actor() {
    return this.parent || null;
  }

  /** @override */
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;

    return {
      attributes: new fields.SchemaField({
        hp: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, initial: 30 }),
          max: new fields.NumberField({ required: true, integer: true, initial: 30 }),
          pct: new fields.NumberField({ integer: true, initial: 100 })
        }),
        size: new fields.StringField({ initial: 'Large' }),
        occupants: new fields.StringField({ initial: '' }),
        accessories: new fields.StringField({ initial: '' }),
        move: new fields.NumberField({ integer: true, initial: 40 }),
        dr: new fields.NumberField({ integer: true, initial: 2 })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    if (this.attributes) {
      const sizeInfo = getSizeInfo(this.attributes.size);
      this.attributes.sizeInfo = sizeInfo;
      this.attributes.sizeNumber = sizeInfo.size;
      this.attributes.sizeLabel = sizeInfo.label;

      const hpVal = Number(this.attributes.hp?.value) || 0;
      const hpMax = Number(this.attributes.hp?.max) || 1;
      if (this.attributes.hp) {
        this.attributes.hp.pct = Math.min(100, Math.max(0, Math.round((hpVal / hpMax) * 100)));
      }
    }
  }
}
