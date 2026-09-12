/**
 * Test harness setup for DCC RPG (CarlRPG).
 * Mocks minimal Foundry VTT globals so document classes can be unit-tested in Node.js
 * without needing an active Foundry server or browser DOM.
 */

export class MockActor {
  constructor(data = {}) {
    this.name = data.name || 'Test Crawler';
    this.type = data.type || 'crawler';
    this.system = structuredClone(data.system || {});
    this.items = (data.items || []).map(i => i instanceof MockItem ? i : new MockItem(i, this));
  }
  prepareDerivedData() {}
  updateSource(data) {
    Object.assign(this.system, data.system || data);
  }
}

export class MockItem {
  constructor(data = {}, actor = null) {
    this.name = data.name || 'Test Item';
    this.type = data.type || 'gear';
    this.system = structuredClone(data.system || {});
    this.actor = actor;
  }
  prepareDerivedData() {}
}

if (!globalThis.Actor) {
  globalThis.Actor = MockActor;
}

if (!globalThis.Item) {
  globalThis.Item = MockItem;
}

if (!globalThis.ChatMessage) {
  globalThis.ChatMessage = {
    getSpeaker: (opts) => ({ actor: opts?.actor?.id || null }),
    create: async (msg) => msg
  };
}

if (!globalThis.Roll) {
  globalThis.Roll = class MockRoll {
    constructor(formula, data) {
      this.formula = formula;
      this.data = data;
    }
    async evaluate() {
      return {
        formula: this.formula,
        total: 10,
        toMessage: async () => {}
      };
    }
  };
}
