import { DCC_SKILLS } from '../src/data/skills.mjs';

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
  async _preCreate(data, options, user) {}
  prepareBaseData() {}
  prepareDerivedData() {}
  updateSource(data) {
    Object.assign(this.system, data.system || data);
    if (data.prototypeToken) {
      this.prototypeToken = Object.assign(this.prototypeToken || {}, data.prototypeToken);
    }
  }
  async createEmbeddedDocuments(embeddedType, dataArray) {
    if (embeddedType === 'Item') {
      const created = [];
      const ItemClass = CONFIG.Item?.documentClass || MockItem;
      for (const d of dataArray) {
        const item = new ItemClass(d, this);
        this.items.push(item);
        created.push(item);
        if (item._onCreate) {
          await item._onCreate(d, {}, globalThis.game?.user?.id || 'test-user');
        }
      }
      return created;
    }
    return [];
  }
}

export class MockItem {
  constructor(data = {}, actor = null) {
    this.id = data.id || data._id || ('mock-item-' + Math.random().toString(36).substring(2, 9));
    this._id = this.id;
    this.name = data.name || 'Test Item';
    this.type = data.type || 'gear';
    this.img = data.img || 'icons/svg/item-bag.svg';
    this.system = structuredClone(data.system || {});
    this.actor = actor;
  }
  get isEmbedded() {
    return this.actor !== null;
  }
  toObject() {
    return {
      _id: this.id,
      name: this.name,
      type: this.type,
      img: this.img,
      system: structuredClone(this.system || {})
    };
  }
  prepareBaseData() {}
  prepareDerivedData() {}

  async update(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('system.')) {
        const subKey = k.replace('system.', '');
        this.system[subKey] = v;
      } else if (k === 'system') {
        Object.assign(this.system, v);
      } else {
        this[k] = v;
      }
    }
    if (this._onUpdate) {
      await this._onUpdate(data, {}, globalThis.game?.user?.id || 'test-user');
    }
    return this;
  }

  static async create(data) {
    const ItemClass = CONFIG.Item?.documentClass || MockItem;
    const item = new ItemClass(data);
    if (globalThis.game?.items) {
      globalThis.game.items.push(item);
    }
    return item;
  }
}

if (!globalThis.Actor) {
  globalThis.Actor = MockActor;
}

if (!globalThis.Item) {
  globalThis.Item = MockItem;
}

if (!globalThis.game) {
  globalThis.game = {
    user: { id: 'test-user', isGM: true, can: () => true },
    items: [],
    folders: [],
    packs: new Map()
  };
} else if (!globalThis.game.folders) {
  globalThis.game.folders = [];
}

if (!globalThis.Folder) {
  globalThis.Folder = class MockFolder {
    constructor(data = {}) {
      this.id = data.id || ('folder-' + Math.random().toString(36).substring(2, 9));
      this._id = this.id;
      this.name = data.name || 'Folder';
      this.type = data.type || 'Item';
      this.color = data.color || '#c0392b';
    }
    static async create(data) {
      const folder = new MockFolder(data);
      globalThis.game.folders.push(folder);
      return folder;
    }
  };
}


if (!globalThis.Dialog) {
  globalThis.Dialog = class MockDialog {
    constructor(data, options = {}) {
      this.data = data;
      this.options = options;
    }
    render() {
      return this;
    }
    close() {}
  };
}

if (!globalThis.ActorSheet) {
  globalThis.ActorSheet = class MockActorSheet {
    constructor(actor, options = {}) {
      this.actor = actor;
      this.options = options;
    }
    async getData() {
      return {
        actor: this.actor,
        data: this.actor,
        items: this.actor.items
      };
    }
  };
}

if (!globalThis.Application) {
  globalThis.Application = class MockApplication {
    constructor(options = {}) {
      this.options = options;
    }
    static get defaultOptions() {
      return {
        id: 'mock-app',
        title: 'Mock Application'
      };
    }
    async getData() {
      return {};
    }
    render(force, options) {
      return this;
    }
    close() {
      return Promise.resolve();
    }
  };
}

if (!globalThis.ItemSheet) {
  globalThis.ItemSheet = class MockItemSheet {
    constructor(item, options = {}) {
      this.item = item;
      this.options = options;
    }
    async getData() {
      return {
        item: this.item,
        data: this.item
      };
    }
    async _updateObject(event, formData) {
      await this.item.update(formData);
      return this.item;
    }
  };
}

if (!globalThis.foundry) {
  globalThis.foundry = {
    utils: {
      mergeObject: (target, source) => Object.assign(target, source),
      duplicate: (obj) => structuredClone(obj),
      expandObject: (obj) => {
        const result = {};
        for (const [key, val] of Object.entries(obj)) {
          const parts = key.split('.');
          let curr = result;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in curr)) curr[part] = {};
            curr = curr[part];
          }
          curr[parts[parts.length - 1]] = val;
        }
        return result;
      }
    }
  };
}


if (!globalThis.CONFIG) {
  globalThis.CONFIG = {
    DCC: {
      skills: DCC_SKILLS
    }
  };
} else {
  globalThis.CONFIG.DCC = globalThis.CONFIG.DCC || {};
  globalThis.CONFIG.DCC.skills = DCC_SKILLS;
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
        toMessage: async (opts = {}) => ({
          formula: this.formula,
          total: 10,
          ...opts
        })
      };
    }
  };
}

