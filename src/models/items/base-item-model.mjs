/**
 * Base TypeDataModel for DCC RPG Item types.
 * Provides shared utilities and parent document access.
 */
export class BaseItemDataModel extends (globalThis.foundry?.abstract?.TypeDataModel || class {}) {
  /**
   * Base schema for all DCC RPG items: stable identifier and tags array.
   */
  static defineSchema() {
    const fields = globalThis.foundry?.data?.fields;
    if (!fields) return {};
    return {
      identifier: new fields.StringField({ initial: '' }),
      tags: new fields.ArrayField(new fields.StringField(), { initial: [] })
    };
  }

  /**
   * Helper to retrieve the parent item document
   * @type {Item|null}
   */
  get item() {
    return this.parent;
  }

  /**
   * Retrieve the actor owning this item, if embedded.
   * @type {Actor|null}
   */
  get actor() {
    return this.parent?.actor || null;
  }

  /**
   * Gold value of the item.
   * Safely returns numeric value or defaults to 0 without recursive parent lookups.
   * @type {number}
   */
  get goldValue() {
    return Number(this.value ?? this._source?.goldValue ?? this._source?.value ?? 0);
  }

  set goldValue(val) {
    if ('value' in this || this.schema?.has?.('value')) {
      this.value = Number(val) || 0;
    }
  }

  /**
   * Migrate legacy data fields on load.
   * Transparently migrates legacy goldValue to value for items.
   * @param {object} source
   * @returns {object}
   */
  static migrateData(source = {}) {
    if (source.goldValue !== undefined && (source.value === undefined || source.value === 0)) {
      source.value = Number(source.goldValue) || 0;
    }
    return super.migrateData ? super.migrateData(source) : source;
  }
}
