import { DCC_SKILLS } from '../src/data/skills.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_BUFFS, DCC_DAMAGE_TYPES, DCC_DEBUFFS } from '../src/data/buffs.mjs';
import { DCC_SIZES, getSizeInfo } from '../src/data/sizes.mjs';
import { DCC_MACROS } from '../src/data/macros.mjs';
import { DCC_MOBS } from '../src/data/mobs.mjs';

/**
 * Test harness setup for DCC RPG (CarlRPG).
 * Mocks minimal Foundry VTT globals so document classes can be unit-tested in Node.js
 * without needing an active Foundry server or browser DOM.
 */

export class MockActor {
  constructor(data = {}) {
    this.id = data.id || data._id || ('mock-actor-' + Math.random().toString(36).substring(2, 9));
    this._id = this.id;
    this.name = data.name || 'Test Crawler';
    this.type = data.type || 'crawler';
    if (data.system && typeof data.system === 'object' && typeof data.system.prepareDerivedData === 'function') {
      this.system = data.system;
      this.system.parent = this;
    } else if (globalThis.CONFIG?.Actor?.dataModels?.[this.type]) {
      const ModelClass = globalThis.CONFIG.Actor.dataModels[this.type];
      this.system = new ModelClass(data.system || {}, { parent: this });
    } else {
      this.system = structuredClone(data.system || {});
    }
    this.isOwner = data.isOwner ?? true;
    this.items = (data.items || []).map(i => i instanceof MockItem ? i : new MockItem(i, this));
    this.sheet = {
      render: () => this
    };
  }
  static async create(data = {}) {
    const ActorClass = CONFIG.Actor?.documentClass || MockActor;
    const actor = new ActorClass(data);
    if (globalThis.game?.actors) {
      if (Array.isArray(globalThis.game.actors)) {
        globalThis.game.actors.push(actor);
      } else if (typeof globalThis.game.actors.set === 'function') {
        globalThis.game.actors.set(actor.id, actor);
      }
    }
    if (actor._preCreate) {
      await actor._preCreate(data, {}, globalThis.game?.user || { id: 'test-user' });
    }
    if (typeof actor.prepareData === 'function') {
      actor.prepareData();
    }
    return actor;
  }
  async _preCreate(data, options, user) {}
  prepareBaseData() {
    if (typeof this.system?.prepareBaseData === 'function') {
      this.system.prepareBaseData();
    }
  }
  prepareDerivedData() {
    if (typeof this.system?.prepareDerivedData === 'function') {
      this.system.prepareDerivedData();
    }
  }
  prepareData() {
    this.prepareBaseData();
    this.prepareDerivedData();
  }
  toObject(source = true) {
    const sys = (typeof this.system?.toObject === 'function')
      ? this.system.toObject(source)
      : structuredClone(this.system || {});
    return {
      _id: this.id,
      name: this.name,
      type: this.type,
      system: sys,
      items: (this.items || []).map(i => i.toObject ? i.toObject() : i)
    };
  }
  updateSource(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('prototypeToken.')) {
        const prop = k.replace('prototypeToken.', '');
        this.prototypeToken = this.prototypeToken || {};
        this.prototypeToken[prop] = v;
      } else if (k === 'prototypeToken') {
        this.prototypeToken = Object.assign(this.prototypeToken || {}, v);
      } else if (k.startsWith('system.')) {
        const subKey = k.replace('system.', '');
        if (typeof this.system?.updateSource === 'function') {
          this.system.updateSource({ [subKey]: v });
        } else {
          const path = subKey.split('.');
          let curr = this.system;
          for (let i = 0; i < path.length - 1; i++) {
            if (!curr[path[i]]) curr[path[i]] = {};
            curr = curr[path[i]];
          }
          curr[path[path.length - 1]] = v;
        }
      } else if (k === 'system') {
        if (typeof this.system?.updateSource === 'function') {
          this.system.updateSource(v);
        } else {
          Object.assign(this.system, v);
        }
      } else {
        this[k] = v;
      }
    }
  }
  async update(data) {
    this.updateSource(data);
    return this;
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
    if (globalThis.CONFIG?.Item?.dataModels?.[this.type]) {
      const ModelClass = globalThis.CONFIG.Item.dataModels[this.type];
      this.system = new ModelClass(data.system || {}, { parent: this });
    } else {
      this.system = structuredClone(data.system || {});
    }
    this.actor = actor;
    this.sort = Number(data.sort) || 0;
  }
  get isEmbedded() {
    return this.actor !== null;
  }
  toObject() {
    const sys = (typeof this.system?.toObject === 'function')
      ? this.system.toObject(false)
      : structuredClone(this.system || {});
    return {
      _id: this.id,
      sort: this.sort,
      name: this.name,
      type: this.type,
      img: this.img,
      system: sys
    };
  }
  prepareBaseData() {
    if (typeof this.system?.prepareBaseData === 'function') {
      this.system.prepareBaseData();
    }
  }
  prepareDerivedData() {
    if (typeof this.system?.prepareDerivedData === 'function') {
      this.system.prepareDerivedData();
    }
  }

  async update(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('system.')) {
        const subKey = k.replace('system.', '');
        if (typeof this.system?.updateSource === 'function') {
          this.system.updateSource({ [subKey]: v });
        } else {
          this.system[subKey] = v;
        }
      } else if (k === 'system') {
        if (typeof this.system?.updateSource === 'function') {
          this.system.updateSource(v);
        } else {
          Object.assign(this.system, v);
        }
      } else {
        this[k] = v;
      }
    }
    if (this._onUpdate) {
      await this._onUpdate(data, {}, globalThis.game?.user?.id || 'test-user');
    }
    return this;
  }

  async delete() {
    if (this.actor && Array.isArray(this.actor.items)) {
      const idx = this.actor.items.findIndex(i => (i.id === this.id || i._id === this.id));
      if (idx !== -1) {
        this.actor.items.splice(idx, 1);
      }
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

export class MockMacro {
  constructor(data = {}) {
    this.id = data.id || data._id || ('mock-macro-' + Math.random().toString(36).substring(2, 9));
    this._id = this.id;
    this.name = data.name || 'Test Macro';
    this.type = data.type || 'script';
    this.img = data.img || 'icons/svg/dice-target.svg';
    this.command = data.command || '';
    this.scope = data.scope || 'global';
    this.ownership = structuredClone(data.ownership || { default: 2 });
    this.flags = structuredClone(data.flags || {});
  }
  async update(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('ownership.')) {
        this.ownership[k.replace('ownership.', '')] = v;
      } else {
        this[k] = v;
      }
    }
    return this;
  }
  async execute(scope = {}) {
    const fn = new Function('window', 'game', 'ui', this.command);
    return fn(globalThis.window, globalThis.game, globalThis.ui);
  }
  static async create(data) {
    const macro = new MockMacro(data);
    if (globalThis.game?.macros) {
      if (Array.isArray(globalThis.game.macros)) {
        globalThis.game.macros.push(macro);
      } else if (typeof globalThis.game.macros.set === 'function') {
        globalThis.game.macros.set(macro.id, macro);
      }
    }
    return macro;
  }
}

if (!globalThis.Macro) {
  globalThis.Macro = MockMacro;
}

if (!globalThis.CONST) {
  globalThis.CONST = {};
}
globalThis.CONST.TABLE_RESULT_TYPES = globalThis.CONST.TABLE_RESULT_TYPES || {
  TEXT: 0,
  DOCUMENT: 1,
  COMPENDIUM: 2
};
globalThis.CONST.DOCUMENT_OWNERSHIP_LEVELS = globalThis.CONST.DOCUMENT_OWNERSHIP_LEVELS || {
  NONE: 0,
  LIMITED: 1,
  OBSERVER: 2,
  OWNER: 3
};

const _settingsStore = new Map();

if (!globalThis.game) {
  globalThis.game = {
    user: {
      id: 'test-user',
      isGM: true,
      can: () => true,
      hotbar: {},
      flags: {},
      getFlag(scope, key) {
        return this.flags?.[scope]?.[key];
      },
      async setFlag(scope, key, val) {
        this.flags = this.flags || {};
        this.flags[scope] = this.flags[scope] || {};
        this.flags[scope][key] = val;
      },
      async assignHotbarMacro(macro, slot) {
        this.hotbar = this.hotbar || {};
        this.hotbar[slot] = macro ? (macro.id || macro._id) : null;
      },
      async update(data) {
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('hotbar.')) {
            const slot = k.replace('hotbar.', '');
            this.hotbar = this.hotbar || {};
            this.hotbar[slot] = v;
          } else {
            this[k] = v;
          }
        }
        return this;
      }
    },
    actors: [],
    items: [],
    macros: [],
    folders: [],
    tables: [],
    packs: new Map(),
    settings: {
      register: (module, key, options) => {
        if (!_settingsStore.has(`${module}.${key}`)) {
          _settingsStore.set(`${module}.${key}`, options.default);
        }
      },
      get: (module, key) => _settingsStore.get(`${module}.${key}`),
      set: async (module, key, value) => {
        _settingsStore.set(`${module}.${key}`, value);
        return value;
      }
    },
    dcc: {
      mobs: DCC_MOBS
    }
  };
} else {
  globalThis.game.dcc = globalThis.game.dcc || {};
  globalThis.game.dcc.mobs = DCC_MOBS;
  if (!globalThis.game.folders) globalThis.game.folders = [];
  if (!globalThis.game.macros) globalThis.game.macros = [];
  if (!globalThis.game.user.hotbar) globalThis.game.user.hotbar = {};
  if (!globalThis.game.user.flags) globalThis.game.user.flags = {};
  if (!globalThis.game.user.getFlag) globalThis.game.user.getFlag = function(s, k) { return this.flags?.[s]?.[k]; };
  if (!globalThis.game.user.setFlag) globalThis.game.user.setFlag = async function(s, k, v) {
    this.flags = this.flags || {};
    this.flags[s] = this.flags[s] || {};
    this.flags[s][k] = v;
  };
  if (!globalThis.game.user.assignHotbarMacro) globalThis.game.user.assignHotbarMacro = async function(m, s) {
    this.hotbar = this.hotbar || {};
    this.hotbar[s] = m ? (m.id || m._id) : null;
  };
  if (!globalThis.game.user.update) globalThis.game.user.update = async function(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('hotbar.')) {
        const slot = k.replace('hotbar.', '');
        this.hotbar = this.hotbar || {};
        this.hotbar[slot] = v;
      } else {
        this[k] = v;
      }
    }
    return this;
  };
  if (!globalThis.game.settings) {
    globalThis.game.settings = {
      register: (module, key, options) => {
        if (!_settingsStore.has(`${module}.${key}`)) {
          _settingsStore.set(`${module}.${key}`, options.default);
        }
      },
      get: (module, key) => _settingsStore.get(`${module}.${key}`),
      set: async (module, key, value) => {
        _settingsStore.set(`${module}.${key}`, value);
        return value;
      }
    };
  }
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
      if (globalThis.ui?.windows) {
        const id = this.options?.id || `mock-dialog-${Date.now()}`;
        globalThis.ui.windows[id] = this;
      }
      return this;
    }
    close() {
      if (globalThis.ui?.windows && this.options?.id) {
        delete globalThis.ui.windows[this.options.id];
      }
    }
    async triggerButton(buttonKey, html = null) {
      const btn = this.data?.buttons?.[buttonKey];
      if (btn && typeof btn.callback === 'function') {
        return btn.callback(html || { find: () => ({ val: () => '', is: () => false }) });
      }
    }
  };
}

if (!globalThis.Application) {
  globalThis.Application = class MockApplication {
    constructor(options = {}) {
      const defaults = this.constructor.defaultOptions || {};
      this.options = Object.assign({}, defaults, options);
      this.id = this.options.id || 'mock-app';
      this.appId = Math.floor(1000 + Math.random() * 9000);
      this._state = -1;
    }
    get rendered() {
      return this._state > 0;
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
    render(force = false, options = {}) {
      this._state = 2;
      if (globalThis.ui && globalThis.ui.windows) {
        globalThis.ui.windows[this.appId] = this;
        const key = this.id || this.options?.id;
        if (key) globalThis.ui.windows[key] = this;
      }
      return this;
    }
    async close(options = {}) {
      this._state = 0;
      if (globalThis.ui && globalThis.ui.windows) {
        if (this.appId) delete globalThis.ui.windows[this.appId];
        const key = this.id || this.options?.id;
        if (key) delete globalThis.ui.windows[key];
      }
      return Promise.resolve();
    }
  };
}

class MockDocumentSheet extends globalThis.Application {
  constructor(object, options = {}) {
    super(options);
    this.object = object;
  }
  get document() {
    return this.object;
  }
  get isEditable() {
    return true;
  }
}

if (!globalThis.ActorSheet) {
  globalThis.ActorSheet = class MockActorSheet extends MockDocumentSheet {
    get actor() {
      return this.object;
    }
    get isEditable() {
      return true;
    }
    _getHeaderButtons() {
      return [];
    }
    activateListeners(html) {}
    async getData() {
      return {
        actor: this.actor,
        document: this.document,
        data: this.actor,
        items: this.actor?.items || []
      };
    }
    async _onDropItemCreate(itemData) {
      if (typeof this.actor?.createEmbeddedDocuments === 'function') {
        return this.actor.createEmbeddedDocuments('Item', Array.isArray(itemData) ? itemData : [itemData]);
      }
      return [];
    }
    async _onDropItem(event, data) {
      const item = await globalThis.Item.fromDropData(data);
      const itemData = item.toObject ? item.toObject() : item;
      return this._onDropItemCreate(itemData);
    }
  };
}

if (!globalThis.ItemSheet) {
  globalThis.ItemSheet = class MockItemSheet extends MockDocumentSheet {
    get item() {
      return this.object;
    }
    async getData() {
      return {
        item: this.item,
        document: this.document,
        data: this.item
      };
    }
    async _updateObject(event, formData) {
      await this.item.update(formData);
      return this.item;
    }
  };
}

class MockApplicationV2 {
  static _appId = 0;
  static DEFAULT_OPTIONS = {
    id: 'app-{id}',
    tag: 'div',
    classes: ['application'],
    window: {
      title: '',
      resizable: false
    },
    position: { width: 'auto', height: 'auto' }
  };
  static PARTS = {};

  #id;

  constructor(options = {}) {
    this.options = Object.freeze(this._initializeApplicationOptions(options));
    this.#id = this.options.id.replace("{id}", this.options.uniqueId);
    this._appId = Number(this.options.uniqueId);
    this._state = -1;
    this.element = {
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      dataset: {}
    };
  }

  get id() {
    return this.#id;
  }

  get appId() {
    return this._appId || Number(this.options?.uniqueId) || 0;
  }

  get rendered() {
    return this._state > 0;
  }

  static *inheritanceChain() {
    let cls = this;
    while ( cls ) {
      yield cls;
      if ( cls === MockApplicationV2 ) return;
      cls = Object.getPrototypeOf(cls);
    }
  }

  _initializeApplicationOptions(options = {}) {
    const order = [options];
    for ( const cls of this.constructor.inheritanceChain() ) {
      if ( Object.prototype.hasOwnProperty.call(cls, 'DEFAULT_OPTIONS') ) {
        order.unshift(cls.DEFAULT_OPTIONS);
      }
    }
    const applicationOptions = {};
    for ( const opts of order ) {
      Object.assign(applicationOptions, opts);
      if (opts.window) applicationOptions.window = Object.assign({}, applicationOptions.window, opts.window);
      if (opts.position) applicationOptions.position = Object.assign({}, applicationOptions.position, opts.position);
    }
    applicationOptions.uniqueId = String(++MockApplicationV2._appId);
    return applicationOptions;
  }

  async render(force = false, options = {}) {
    this._state = 2;
    if (globalThis.ui && globalThis.ui.windows) {
      globalThis.ui.windows[this.appId] = this;
      const key = this.id || this.options?.id;
      if (key) globalThis.ui.windows[key] = this;
    }
    return this;
  }

  async close(options = {}) {
    this._state = 0;
    if (globalThis.ui && globalThis.ui.windows) {
      if (this.appId) delete globalThis.ui.windows[this.appId];
      const key = this.id || this.options?.id;
      if (key) delete globalThis.ui.windows[key];
    }
    return Promise.resolve();
  }
}

function MockHandlebarsApplicationMixin(Base) {
  return class extends Base {
    async _prepareContext(options = {}) {
      if (typeof super._prepareContext === 'function') {
        return super._prepareContext(options);
      }
      return {};
    }
    async _preparePartContext(partId, context, options) {
      return context;
    }
    async _onRender(context, options) {}
  };
}

class MockActorSheetV2 extends MockApplicationV2 {
  constructor(options = {}) {
    const opts = (options instanceof MockActor || (globalThis.Actor && options instanceof globalThis.Actor))
      ? { document: options }
      : options;
    super(opts);
    this.document = opts.document || null;
    this.actor = this.document;
  }
  get isEditable() {
    return true;
  }
  async _prepareContext(options = {}) {
    return {
      actor: this.actor,
      document: this.actor,
      data: this.actor,
      items: this.actor?.items || []
    };
  }
}

class MockItemSheetV2 extends MockApplicationV2 {
  constructor(options = {}) {
    const opts = (options instanceof MockItem || (globalThis.Item && options instanceof globalThis.Item))
      ? { document: options }
      : options;
    super(opts);
    this.document = opts.document || null;
    this.item = this.document;
  }
  get isEditable() {
    return true;
  }
  async _prepareContext(options = {}) {
    return {
      item: this.item,
      document: this.item,
      data: this.item
    };
  }
}

if (!globalThis.foundry) {
  globalThis.foundry = {};
}

globalThis.foundry.applications = globalThis.foundry.applications || {};
globalThis.foundry.applications.api = globalThis.foundry.applications.api || {
  ApplicationV2: MockApplicationV2,
  HandlebarsApplicationMixin: MockHandlebarsApplicationMixin
};
globalThis.foundry.applications.sheets = globalThis.foundry.applications.sheets || {
  ActorSheetV2: MockActorSheetV2,
  ItemSheetV2: MockItemSheetV2
};

if (!globalThis.foundry.utils) {
  globalThis.foundry.utils = {
    mergeObject: (target, source) => Object.assign(target, source),
    duplicate: (obj) => structuredClone(obj),
    deepClone: (obj) => structuredClone(obj),
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
  };
}

class MockDataField {
  constructor(options = {}) {
    this.options = options;
    this.required = options.required ?? false;
    this.nullable = options.nullable ?? false;
    this.initial = options.initial;
    this.choices = options.choices;
  }
  getInitialValue() {
    if (typeof this.initial === 'function') return this.initial();
    if (this.initial !== undefined) return structuredClone(this.initial);
    return this.nullable ? null : undefined;
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    if (value === null && this.nullable) return null;
    return value;
  }
}

class MockStringField extends MockDataField {
  constructor(options = {}) {
    super(options);
    this.blank = options.blank ?? true;
    if (this.initial === undefined) this.initial = '';
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    if (value === null && this.nullable) return null;
    return String(value ?? '');
  }
}

class MockNumberField extends MockDataField {
  constructor(options = {}) {
    super(options);
    this.integer = options.integer ?? false;
    this.min = options.min;
    this.max = options.max;
    if (this.initial === undefined) this.initial = 0;
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    if (value === null && this.nullable) return null;
    let n = Number(value);
    if (Number.isNaN(n)) return this.getInitialValue();
    if (this.integer) n = Math.trunc(n);
    if (this.min != null) n = Math.max(this.min, n);
    if (this.max != null) n = Math.min(this.max, n);
    return n;
  }
}

class MockBooleanField extends MockDataField {
  constructor(options = {}) {
    super(options);
    if (this.initial === undefined) this.initial = false;
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    return Boolean(value);
  }
}

class MockArrayField extends MockDataField {
  constructor(element, options = {}) {
    super(options);
    this.element = element;
    if (this.initial === undefined) this.initial = () => [];
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    let arr = value;
    if (arr && !Array.isArray(arr) && typeof arr === 'object') {
      arr = Object.values(arr);
    }
    if (!Array.isArray(arr)) arr = [];
    if (this.element) {
      return arr.map(el => this.element.clean(el, options));
    }
    return arr;
  }
}

class MockObjectField extends MockDataField {
  constructor(options = {}) {
    super(options);
    if (this.initial === undefined) this.initial = () => ({});
  }
  clean(value, options = {}) {
    if (value === undefined) return this.getInitialValue();
    if (value && typeof value === 'object') return structuredClone(value);
    return this.getInitialValue();
  }
}

class MockSchemaField extends MockDataField {
  constructor(fields = {}, options = {}) {
    super(options);
    this.fields = fields;
  }
  clean(value, options = {}) {
    const raw = (value && typeof value === 'object') ? value : {};
    const result = {};
    for (const [key, field] of Object.entries(this.fields)) {
      result[key] = field.clean(raw[key], options);
    }
    return result;
  }
}

class MockHTMLField extends MockStringField {}
class MockFilePathField extends MockStringField {
  constructor(options = {}) {
    super(options);
    this.categories = options.categories || [];
  }
}

class MockDataModel {
  constructor(data = {}, { parent = null } = {}) {
    this.parent = parent;
    const schema = this.constructor.schema;
    const migrated = this.constructor.migrateData(data ? structuredClone(data) : {});
    const cleaned = schema.clean(migrated);
    Object.assign(this, cleaned);
    if (typeof this.prepareBaseData === 'function') {
      this.prepareBaseData();
    }
  }

  static defineSchema() {
    return {};
  }

  static get schema() {
    if (!this._schema) {
      this._schema = new MockSchemaField(this.defineSchema());
    }
    return this._schema;
  }

  static cleanData(source = {}) {
    const migrated = this.migrateData(structuredClone(source));
    return this.schema.clean(migrated);
  }

  static migrateData(source = {}) {
    return source;
  }

  toObject(source = true) {
    if (!source) {
      const obj = {};
      for (const [k, v] of Object.entries(this)) {
        if (k === 'parent') continue;
        obj[k] = structuredClone(v);
      }
      return obj;
    }
    const obj = {};
    for (const key of Object.keys(this.constructor.schema.fields)) {
      obj[key] = structuredClone(this[key]);
    }
    return obj;
  }

  updateSource(changes = {}) {
    const merge = (target, source) => {
      for (const [key, val] of Object.entries(source)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          if (!target[key] || typeof target[key] !== 'object') target[key] = {};
          merge(target[key], val);
        } else {
          target[key] = val;
        }
      }
    };

    for (const [k, v] of Object.entries(changes)) {
      if (k.includes('.')) {
        const parts = k.split('.');
        let curr = this;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        const last = parts[parts.length - 1];
        if (v && typeof v === 'object' && !Array.isArray(v) && curr[last] && typeof curr[last] === 'object' && !Array.isArray(curr[last])) {
          merge(curr[last], v);
        } else {
          curr[last] = v;
        }
      } else {
        if (v && typeof v === 'object' && !Array.isArray(v) && this[k] && typeof this[k] === 'object' && !Array.isArray(this[k])) {
          merge(this[k], v);
        } else {
          this[k] = v;
        }
      }
    }
  }
}

class MockTypeDataModel extends MockDataModel {}

globalThis.foundry.data = globalThis.foundry.data || {};
globalThis.foundry.data.fields = globalThis.foundry.data.fields || {
  DataField: MockDataField,
  StringField: MockStringField,
  NumberField: MockNumberField,
  BooleanField: MockBooleanField,
  ArrayField: MockArrayField,
  ObjectField: MockObjectField,
  SchemaField: MockSchemaField,
  HTMLField: MockHTMLField,
  FilePathField: MockFilePathField
};

globalThis.foundry.abstract = globalThis.foundry.abstract || {};
globalThis.foundry.abstract.DataModel = globalThis.foundry.abstract.DataModel || MockDataModel;
globalThis.foundry.abstract.TypeDataModel = globalThis.foundry.abstract.TypeDataModel || MockTypeDataModel;

export class MockCombatant {
  constructor(data = {}, combat = null) {
    this.id = data.id || data._id || ('combatant-' + Math.random().toString(36).substring(2, 7));
    this._id = this.id;
    this.name = data.name || data.actor?.name || 'Combatant';
    this.actorId = data.actorId || data.actor?.id;
    this.actor = data.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(this.actorId) : null);
    this.initiative = data.initiative ?? null;
    this.defeated = data.defeated ?? false;
    this.hidden = data.hidden ?? false;
    this.flags = structuredClone(data.flags || {});
    this.combat = combat;
  }

  getFlag(scope, key) {
    return this.flags?.[scope]?.[key];
  }

  async setFlag(scope, key, value) {
    if (!this.flags) this.flags = {};
    if (!this.flags[scope]) this.flags[scope] = {};
    this.flags[scope][key] = structuredClone(value);
    return this;
  }

  async unsetFlag(scope, key) {
    if (this.flags?.[scope]) {
      delete this.flags[scope][key];
    }
    return this;
  }

  async update(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('flags.')) {
        const parts = k.split('.');
        let curr = this;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = v;
      } else {
        this[k] = v;
      }
    }
    return this;
  }
}

export class MockCombat {
  constructor(data = {}) {
    this.id = data.id || data._id || ('combat-' + Math.random().toString(36).substring(2, 7));
    this._id = this.id;
    this.round = data.round ?? 0;
    this.turn = data.turn ?? 0;
    this.isActive = data.isActive ?? true;
    this.flags = structuredClone(data.flags || { 'carl-rpg': {} });
    this.combatants = (data.combatants || []).map(c => c instanceof MockCombatant ? c : new MockCombatant(c, this));
  }

  getFlag(scope, key) {
    return this.flags?.[scope]?.[key];
  }

  async setFlag(scope, key, value) {
    if (!this.flags) this.flags = {};
    if (!this.flags[scope]) this.flags[scope] = {};
    this.flags[scope][key] = structuredClone(value);
    return this;
  }

  async unsetFlag(scope, key) {
    if (this.flags?.[scope]) {
      delete this.flags[scope][key];
    }
    return this;
  }

  async update(data) {
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('flags.')) {
        const parts = k.split('.');
        let curr = this;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = v;
      } else {
        this[k] = v;
      }
    }
    return this;
  }

  getCombatantByActor(actorOrId) {
    const id = typeof actorOrId === 'string' ? actorOrId : actorOrId?.id;
    return this.combatants.find(c => c.actorId === id || c.actor?.id === id) || null;
  }

  async startCombat() {
    this.round = 1;
    this.turn = 0;
    return this;
  }

  async nextRound() {
    this.round += 1;
    this.turn = 0;
    return this;
  }

  async nextTurn() {
    this.turn += 1;
    return this;
  }

  async endCombat() {
    this.round = 0;
    this.turn = 0;
    return this;
  }

  _sortCombatants(a, b) {
    return (b.initiative || 0) - (a.initiative || 0);
  }
}

export class MockCombatTracker extends (globalThis.Application || class {}) {
  constructor(options = {}) {
    super(options);
    this.viewed = null;
  }
  static get defaultOptions() {
    return {
      id: 'combat',
      title: 'Combat Tracker',
      template: 'templates/sidebar/combat-tracker.html'
    };
  }
  async getData() {
    return {
      combat: this.viewed || globalThis.game?.combat || null,
      combats: globalThis.game?.combats || [],
      turns: []
    };
  }
}

if (!globalThis.Combat) {
  globalThis.Combat = MockCombat;
}
if (!globalThis.Combatant) {
  globalThis.Combatant = MockCombatant;
}
if (!globalThis.CombatTracker) {
  globalThis.CombatTracker = MockCombatTracker;
}

if (!globalThis.CONFIG) {
  globalThis.CONFIG = {
    Actor: { documentClass: MockActor, dataModels: {} },
    Item: { documentClass: MockItem, dataModels: {} },
    DCC: {
      skills: DCC_SKILLS,
      spells: DCC_SPELLS,
      buffs: DCC_BUFFS,
      macros: DCC_MACROS,
      mobs: DCC_MOBS,
      damageTypes: DCC_DAMAGE_TYPES,
      debuffs: DCC_DEBUFFS,
      sizes: DCC_SIZES,
      getSizeInfo
    },
    Combat: { documentClass: MockCombat, initiative: { formula: null, decimals: 0 } },
    ui: { combat: MockCombatTracker }
  };
} else {
  globalThis.CONFIG.Actor = globalThis.CONFIG.Actor || { documentClass: MockActor, dataModels: {} };
  globalThis.CONFIG.Actor.dataModels = globalThis.CONFIG.Actor.dataModels || {};
  globalThis.CONFIG.Item = globalThis.CONFIG.Item || { documentClass: MockItem, dataModels: {} };
  globalThis.CONFIG.Item.dataModels = globalThis.CONFIG.Item.dataModels || {};
  globalThis.CONFIG.DCC = globalThis.CONFIG.DCC || {};
  globalThis.CONFIG.DCC.skills = DCC_SKILLS;
  globalThis.CONFIG.DCC.spells = DCC_SPELLS;
  globalThis.CONFIG.DCC.buffs = DCC_BUFFS;
  globalThis.CONFIG.DCC.macros = DCC_MACROS;
  globalThis.CONFIG.DCC.mobs = DCC_MOBS;
  globalThis.CONFIG.DCC.damageTypes = DCC_DAMAGE_TYPES;
  globalThis.CONFIG.DCC.debuffs = DCC_DEBUFFS;
  globalThis.CONFIG.DCC.sizes = DCC_SIZES;
  globalThis.CONFIG.DCC.getSizeInfo = getSizeInfo;
  globalThis.CONFIG.Combat = globalThis.CONFIG.Combat || { documentClass: MockCombat, initiative: { formula: null, decimals: 0 } };
  globalThis.CONFIG.Combat.initiative = globalThis.CONFIG.Combat.initiative || { formula: null, decimals: 0 };
  globalThis.CONFIG.ui = globalThis.CONFIG.ui || { combat: MockCombatTracker };
}

if (!globalThis.window) {
  globalThis.window = globalThis;
}

if (!globalThis.Hooks) {
  const _hooks = {};
  globalThis.Hooks = {
    events: _hooks,
    once: (event, fn) => {
      _hooks[event] = _hooks[event] || [];
      _hooks[event].push({ fn, once: true });
    },
    on: (event, fn) => {
      _hooks[event] = _hooks[event] || [];
      _hooks[event].push({ fn, once: false });
    },
    off: (event, fn) => {
      if (!_hooks[event]) return;
      const idx = _hooks[event].findIndex(e => e.fn === fn || e === fn);
      if (idx !== -1) _hooks[event].splice(idx, 1);
    },
    callAll: (event, ...args) => {
      const cbs = _hooks[event] || [];
      const promises = [];
      for (const entry of [...cbs]) {
        const res = entry.fn(...args);
        if (res instanceof Promise) promises.push(res);
        if (entry.once) {
          const idx = _hooks[event].indexOf(entry);
          if (idx !== -1) _hooks[event].splice(idx, 1);
        }
      }
      return Promise.all(promises);
    },
    call: (event, ...args) => {
      return globalThis.Hooks.callAll(event, ...args);
    }
  };
}

if (!globalThis.Handlebars) {
  globalThis.Handlebars = {
    registerHelper: () => {},
    partials: {}
  };
}

if (!globalThis.loadTemplates) {
  globalThis.loadTemplates = async () => [];
}

if (!globalThis.Actors) {
  globalThis.Actors = {
    registerSheet: () => {},
    unregisterSheet: () => {}
  };
}

if (!globalThis.Items) {
  globalThis.Items = {
    registerSheet: () => {},
    unregisterSheet: () => {}
  };
}

if (!globalThis.ui) {
  globalThis.ui = {
    notifications: {
      info: () => {},
      warn: () => {},
      error: () => {}
    },
    windows: {}
  };
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
      this.formula = String(formula || '10');
      this.data = data;
    }
    async evaluate() {
      let total = 10;
      try {
        const clean = this.formula.replace(/(\d+)d(\d+)/gi, (m, count, sides) => {
          return String(parseInt(count, 10) * Math.ceil(parseInt(sides, 10) / 2));
        });
        const evalTotal = Function(`"use strict"; return (${clean});`)();
        if (Number.isFinite(evalTotal)) {
          total = evalTotal;
        }
      } catch (_) {
        total = 10;
      }
      return {
        formula: this.formula,
        total,
        render: async () => `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${this.formula}</div><h4 class="dice-total">${total}</h4></div></div>`,
        toMessage: async (opts = {}) => ({
          formula: this.formula,
          total,
          ...opts
        })
      };
    }
  };
}

if (!globalThis.RollTable) {
  globalThis.RollTable = class MockRollTable {
    constructor(data = {}) {
      Object.assign(this, structuredClone(data));
      this.id = data.id || data._id || ('mock-table-' + Math.random().toString(36).substring(2, 9));
      this._id = this.id;
      if (Array.isArray(this.results)) {
        this.results = this.results.map((r, idx) => ({
          _id: r._id || ('res' + Math.random().toString(36).substring(2, 10) + '00000000').slice(0, 16),
          ...r
        }));
      } else {
        this.results = [];
      }
    }
    static async create(data, options = {}) {
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('RollTable#name: must be a non-empty string');
      }
      if (Array.isArray(data.results)) {
        for (const [index, r] of data.results.entries()) {
          if (r._id && !/^[a-zA-Z0-9]{16}$/.test(r._id)) {
            throw new Error(`TableResult#_id: "${r._id}" at index ${index} is not a valid 16-character alphanumeric string`);
          }
          if (r.type === 1 && !r.documentCollection) {
            throw new Error(`TableResult#documentCollection: must be specified for type 1 (DOCUMENT)`);
          }
        }
      }
      const t = new MockRollTable(data);
      if (globalThis.game?.tables) {
        if (Array.isArray(globalThis.game.tables)) globalThis.game.tables.push(t);
        else if (typeof globalThis.game.tables.set === 'function') globalThis.game.tables.set(t.id, t);
      }
      return t;
    }
    async createEmbeddedDocuments(embeddedType, dataArray) {
      if (embeddedType === 'TableResult') {
        const created = dataArray.map((r, idx) => ({
          _id: ('res' + Math.random().toString(36).substring(2, 10) + '00000000').slice(0, 16),
          ...r
        }));
        this.results.push(...created);
        return created;
      }
      return [];
    }
  };
}

if (!globalThis.foundry) {
  globalThis.foundry = {
    utils: {
      deepClone: (obj) => structuredClone(obj),
      duplicate: (obj) => structuredClone(obj)
    }
  };
} else if (!globalThis.foundry.utils) {
  globalThis.foundry.utils = {
    deepClone: (obj) => structuredClone(obj),
    duplicate: (obj) => structuredClone(obj)
  };
}


globalThis.foundry.appv1 = globalThis.foundry.appv1 || {
  sheets: {
    ActorSheet: globalThis.ActorSheet,
    ItemSheet: globalThis.ItemSheet
  },
  applications: {
    Application: globalThis.Application,
    get Dialog() {
      return globalThis.Dialog;
    }
  },
  get sidebar() {
    return {
      tabs: {
        CombatTracker: MockCombatTracker
      }
    };
  }
};

globalThis.foundry.documents = globalThis.foundry.documents || {
  collections: {
    Actors: globalThis.Actors,
    Items: globalThis.Items
  }
};

globalThis.foundry.applications = globalThis.foundry.applications || {};
globalThis.foundry.applications.sidebar = globalThis.foundry.applications.sidebar || {
  tabs: {
    CombatTracker: MockCombatTracker,
    ActorDirectory: globalThis.ActorDirectory,
    ItemDirectory: globalThis.ItemDirectory
  }
};
globalThis.foundry.applications.handlebars = globalThis.foundry.applications.handlebars || {
  loadTemplates: globalThis.loadTemplates
};

if (!globalThis.$) {
  const createMockJQuery = (target) => {
    const mock = {
      data: (key) => target?.dataset?.[key],
      val: () => target?.value,
      attr: (attr) => target?.getAttribute?.(attr) || target?.[attr],
      find: () => createMockJQuery(null),
      closest: (sel) => target?.closest?.(sel),
      on: () => mock,
      off: () => mock,
      click: () => mock,
      change: () => mock,
      remove: () => mock,
      after: () => mock,
      before: () => mock,
      prepend: () => mock,
      append: () => mock,
      each: () => mock,
      not: () => mock,
      hide: () => mock,
      show: () => mock,
      length: 0,
      [Symbol.iterator]: function* () {}
    };
    return mock;
  };
  globalThis.$ = createMockJQuery;
}
