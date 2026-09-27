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
   * Save focus state and cursor selection for input/textarea elements.
   * Can be passed an explicit element or defaults to document.activeElement inside this.element.
   *
   * @param {HTMLElement} [element=null]
   * @returns {object|null}
   */
  _saveFocusState(element = null) {
    try {
      const active = element || (typeof document !== 'undefined' ? document.activeElement : null);
      if (!active) return null;

      const root = this.element?.[0] || (this.element instanceof (globalThis.HTMLElement || Object) ? this.element : null);
      if (!element && root && typeof root.contains === 'function' && !root.contains(active)) {
        return null;
      }

      let selector = '';
      if (active.id) {
        selector = `#${active.id}`;
      } else if (typeof active.getAttribute === 'function' && active.getAttribute('name')) {
        selector = `[name="${active.getAttribute('name')}"]`;
      } else if (active.className && typeof active.className === 'string') {
        const classes = active.className.split(/\s+/).filter(c => c && !c.includes(':') && !c.startsWith('focus') && !c.startsWith('hover'));
        if (classes.length) {
          selector = `${(active.tagName || 'input').toLowerCase()}.${classes.join('.')}`;
        }
      }
      if (!selector && active.tagName) {
        selector = active.tagName.toLowerCase();
      }

      const hasSelection = typeof active.selectionStart === 'number';
      this._savedFocus = {
        selector,
        selectionStart: hasSelection ? active.selectionStart : null,
        selectionEnd: hasSelection ? active.selectionEnd : null,
        selectionDirection: hasSelection ? active.selectionDirection : 'none',
        value: active.value
      };
      return this._savedFocus;
    } catch (err) {
      return null;
    }
  }

  /**
   * Restore focus and cursor selection range to the saved element.
   *
   * @param {jQuery|HTMLElement} [html=null]
   */
  _restoreFocusState(html = null) {
    if (!this._savedFocus) return;
    const saved = this._savedFocus;

    const applyFocus = () => {
      try {
        const root = (html && html[0]) ? html[0] : (html instanceof (globalThis.HTMLElement || Object) ? html : (this.element?.[0] || this.element));
        if (!root) return;

        let target = null;
        if (saved.selector) {
          target = root.querySelector?.(saved.selector) || (typeof $ !== 'undefined' ? $(root).find(saved.selector)[0] : null);
        }
        if (!target && saved.value !== undefined) {
          target = root.querySelector?.('input[type="text"], input[type="search"], textarea');
        }

        if (target && typeof target.focus === 'function') {
          target.focus();
          if (typeof target.setSelectionRange === 'function' && typeof saved.selectionStart === 'number') {
            const valLen = target.value?.length ?? 0;
            const start = Math.min(saved.selectionStart, valLen);
            const end = Math.min(saved.selectionEnd ?? start, valLen);
            target.setSelectionRange(start, end, saved.selectionDirection || 'none');
          }
        }
      } catch (err) {
        // Silently ignore in mock or test environments
      }
    };

    applyFocus();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        applyFocus();
        this._savedFocus = null;
      });
    } else if (typeof setTimeout === 'function') {
      setTimeout(() => {
        applyFocus();
        this._savedFocus = null;
      }, 0);
    } else {
      this._savedFocus = null;
    }
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
    this._restoreFocusState($html);
  }

  /**
   * Application V1 listener registration hook
   */
  activateListeners(html) {
    // Implemented by subclasses; restores focus if an element had focus before render
    this._restoreFocusState(html);
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
    if (!this._savedFocus) {
      this._saveFocusState();
    }
    const opts = (typeof options === 'boolean') ? { force: options } : options;
    let res = this;
    if (typeof super.render === 'function') {
      res = await super.render(opts, deprecatedOptions);
    }
    this._restoreFocusState();
    return res;
  }
}
