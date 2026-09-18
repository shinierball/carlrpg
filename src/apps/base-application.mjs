/**
 * Dungeon Crawler Carl RPG — Base Application Framework (ApplicationV2)
 *
 * Extends foundry.applications.api.ApplicationV2 with HandlebarsApplicationMixin
 * on Foundry v12+, eliminating V1 Application deprecation warnings while providing
 * seamless backward compatibility for getData(), activateListeners(), and defaultOptions.
 */

const AppV2 = globalThis.foundry?.applications?.api?.ApplicationV2;
const HandlebarsMixin = globalThis.foundry?.applications?.api?.HandlebarsApplicationMixin;

const ParentClass = (AppV2 && HandlebarsMixin)
  ? HandlebarsMixin(AppV2)
  : (AppV2 ?? globalThis.foundry?.appv1?.applications?.Application ?? globalThis.Application ?? class {});

export class DCCBaseApplication extends ParentClass {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Application V1 defaultOptions getter fallback
   */
  static get defaultOptions() {
    return {
      classes: ['application'],
      resizable: true,
      width: 'auto',
      height: 'auto'
    };
  }

  /**
   * Application V2 DEFAULT_OPTIONS configuration
   */
  static DEFAULT_OPTIONS = {
    classes: ['dcc-app']
  };

  /**
   * Initialize configuration options for the ApplicationV2 instance.
   * Bridges legacy V1 defaultOptions (id, title, classes, width, height, resizable)
   * while ensuring options.id is always a valid string so .replace('{id}', ...) never throws.
   *
   * @param {object} [options={}]
   * @returns {object}
   * @protected
   */
  _initializeApplicationOptions(options = {}) {
    const v1 = (typeof this.constructor.defaultOptions === 'object' && this.constructor.defaultOptions !== null)
      ? this.constructor.defaultOptions
      : {};

    const fallbackId = options.id || v1.id || `${this.constructor.name.toLowerCase()}-{id}`;

    const v2Defaults = {
      id: fallbackId,
      classes: [...(v1.classes || [])],
      tag: v1.tag || 'div',
      window: {
        title: v1.title || '',
        resizable: v1.resizable ?? true,
        ...(v1.window || {})
      },
      position: {
        width: v1.width ?? 'auto',
        height: v1.height ?? 'auto',
        ...(v1.position || {})
      }
    };

    const mergedOptions = (typeof foundry !== 'undefined' && foundry.utils?.mergeObject)
      ? foundry.utils.mergeObject(v2Defaults, options, { inplace: false })
      : Object.assign({}, v2Defaults, options);

    const initialized = (typeof super._initializeApplicationOptions === 'function')
      ? super._initializeApplicationOptions(mergedOptions)
      : mergedOptions;

    // Strict guarantee: id must always be a non-empty string so ApplicationV2's constructor never fails on id.replace
    if (typeof initialized.id !== 'string' || !initialized.id) {
      initialized.id = fallbackId;
    }

    return initialized;
  }

  /**
   * Application V2 template parts definition
   */
  static get PARTS() {
    const v1 = (typeof this.defaultOptions === 'object' && this.defaultOptions !== null)
      ? this.defaultOptions
      : {};
    if (v1.template) {
      return {
        content: {
          template: v1.template
        }
      };
    }
    return {};
  }

  get appId() {
    return Number(this.options?.uniqueId) || this.options?.appId || this._appId || 0;
  }

  get title() {
    return this.options?.window?.title || this.options?.title || this.constructor.defaultOptions?.title || '';
  }

  /**
   * Application V1 getData compatibility hook
   */
  async getData(options = {}) {
    return {};
  }

  /**
   * Application V2 Handlebars context preparation hook
   */
  async _prepareContext(options = {}) {
    if (typeof this.getData === 'function') {
      return await this.getData(options);
    }
    return {};
  }

  /**
   * Application V2 render callback
   */
  _onRender(context, options) {
    if (typeof super._onRender === 'function') {
      super._onRender(context, options);
    }
    if (globalThis.ui?.windows) {
      if (this.appId) globalThis.ui.windows[this.appId] = this;
      if (this.id) globalThis.ui.windows[this.id] = this;
    }
    const $html = (typeof globalThis.$ !== 'undefined')
      ? globalThis.$(this.element)
      : ((typeof $ !== 'undefined') ? $(this.element) : this.element);
    if (typeof this.activateListeners === 'function') {
      this.activateListeners($html);
    }
  }

  /**
   * Application V1 listener registration hook
   */
  activateListeners(html) {
    // Implemented by subclasses
  }

  /**
   * Close hook supporting both V1 and V2 cleanup
   */
  async close(options = {}) {
    if (globalThis.ui?.windows) {
      if (this.appId) delete globalThis.ui.windows[this.appId];
      if (this.id) delete globalThis.ui.windows[this.id];
    }
    if (typeof super.close === 'function') {
      return await super.close(options);
    }
    return Promise.resolve();
  }

  /**
   * Render hook supporting both V1 render(force, options) and V2 render(options)
   */
  async render(options = {}, deprecatedOptions = {}) {
    const opts = (typeof options === 'boolean') ? { force: options } : options;
    if (typeof super.render === 'function') {
      return await super.render(opts, deprecatedOptions);
    }
    return this;
  }
}
