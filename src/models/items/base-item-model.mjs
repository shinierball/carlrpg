/**
 * Base TypeDataModel for DCC RPG Item types.
 * Provides shared utilities and parent document access.
 */
export class BaseItemDataModel extends (globalThis.foundry?.abstract?.TypeDataModel || class {}) {
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
}
