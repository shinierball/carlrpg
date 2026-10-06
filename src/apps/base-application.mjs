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
   * Save focus state and cursor selection for input/textarea/button/interactive elements.
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

      // Ignore non-interactive root body or html
      const tagName = (active.tagName || '').toLowerCase();
      if (!tagName || tagName === 'body' || tagName === 'html') {
        return null;
      }

      let selector = '';
      const dataAttributes = {};

      // Collect data attributes (e.g. data-id, data-stat, data-delta, data-type, data-heritage, data-size, data-tier, data-index, data-filter)
      if (active.dataset && typeof active.dataset === 'object') {
        for (const [k, v] of Object.entries(active.dataset)) {
          const attr = 'data-' + k.replace(/([A-Z])/g, '-$1').toLowerCase();
          dataAttributes[attr] = String(v);
        }
      } else if (active.attributes && active.attributes.length) {
        for (let i = 0; i < active.attributes.length; i++) {
          const attr = active.attributes[i];
          if (attr.name && attr.name.startsWith('data-')) {
            dataAttributes[attr.name] = String(attr.value);
          }
        }
      }

      if (active.id) {
        selector = `#${active.id}`;
      } else {
        const parts = [tagName];

        // 1. Name attribute
        const name = typeof active.getAttribute === 'function' ? active.getAttribute('name') : null;
        if (name) {
          parts.push(`[name="${name}"]`);
          if (active.type === 'radio' || active.type === 'checkbox') {
            if (active.value) parts.push(`[value="${active.value}"]`);
          }
        }

        // 2. Data attributes for precise targeting
        for (const [attrName, attrVal] of Object.entries(dataAttributes)) {
          parts.push(`[${attrName}="${attrVal}"]`);
        }

        // 3. Classes (filter out volatile state classes like :hover, focus, selected, open)
        if (active.className && typeof active.className === 'string') {
          const classes = active.className.split(/\s+/).filter(c => (
            c &&
            !c.includes(':') &&
            !c.startsWith('focus') &&
            !c.startsWith('hover') &&
            c !== 'selected' &&
            c !== 'open' &&
            c !== 'active'
          ));
          if (classes.length) {
            parts.splice(1, 0, `.${classes.join('.')}`);
          }
        }

        selector = parts.join('');
      }

      let matchIndex = 0;
      if (root && selector) {
        try {
          const matches = Array.from(root.querySelectorAll ? root.querySelectorAll(selector) : (typeof $ !== 'undefined' ? $(root).find(selector) : []));
          const idx = matches.indexOf(active);
          if (idx >= 0) matchIndex = idx;
        } catch (_) {}
      }

      const hasSelection = typeof active.selectionStart === 'number';
      this._savedFocus = {
        selector,
        matchIndex,
        tagName,
        name: typeof active.getAttribute === 'function' ? active.getAttribute('name') : null,
        data: dataAttributes,
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
   * Restore focus and cursor selection range to the saved element with preventScroll.
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
          try {
            if (typeof root.querySelectorAll === 'function') {
              const matches = root.querySelectorAll(saved.selector);
              if (matches && matches.length > 0) {
                target = matches[saved.matchIndex] || matches[0];
              }
            }
            if (!target && typeof root.querySelector === 'function') {
              target = root.querySelector(saved.selector);
            }
            if (!target && typeof $ !== 'undefined') {
              const $matches = $(root).find(saved.selector);
              if ($matches.length) target = $matches[saved.matchIndex] || $matches[0];
            }
          } catch (_) {}
        }

        // Fallback: match by tagName + data attributes if class changed
        if (!target && saved.data && Object.keys(saved.data).length > 0) {
          try {
            const dataParts = [saved.tagName || ''];
            for (const [attrName, attrVal] of Object.entries(saved.data)) {
              dataParts.push(`[${attrName}="${attrVal}"]`);
            }
            const dataSelector = dataParts.join('');
            if (dataSelector && typeof root.querySelector === 'function') {
              target = root.querySelector(dataSelector);
            }
          } catch (_) {}
        }

        // Fallback: match by name
        if (!target && saved.name && typeof root.querySelector === 'function') {
          target = root.querySelector(`[name="${saved.name}"]`);
        }

        // Fallback: match by text input value
        if (!target && saved.value !== undefined && typeof root.querySelector === 'function') {
          target = root.querySelector('input[type="text"], input[type="search"], textarea');
        }

        if (target && typeof target.focus === 'function') {
          try {
            target.focus({ preventScroll: true });
          } catch (_) {
            target.focus();
          }

          if (typeof target.setSelectionRange === 'function' && typeof saved.selectionStart === 'number') {
            const valLen = target.value?.length ?? 0;
            const start = Math.min(saved.selectionStart, valLen);
            const end = Math.min(saved.selectionEnd ?? start, valLen);
            try {
              target.setSelectionRange(start, end, saved.selectionDirection || 'none');
            } catch (_) {}
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
   * Save scroll positions of all scrollable containers within the application.
   *
   * @param {jQuery|HTMLElement} [html=null]
   */
  _saveScrollPositions(html = null) {
    try {
      const root = (html && html[0]) ? html[0] : (html instanceof (globalThis.HTMLElement || Object) ? html : (this.element?.[0] || this.element));
      if (!root) return;

      this._savedScroll = this._savedScroll || new Map();

      // Collect potential scrollable container selectors
      const scrollSelectors = [
        '.dcc-studio-builder',
        '.dcc-receipt-list',
        '.dcc-studio-sidebar',
        '.dcc-studio-layout',
        '.window-content',
        '.dcc-class-creator-studio',
        '.dcc-race-creator-studio',
        '.sheet-body',
        ...(Array.isArray(this.options?.scrollY) ? this.options.scrollY : []),
        ...(Array.isArray(this.constructor?.defaultOptions?.scrollY) ? this.constructor.defaultOptions.scrollY : [])
      ];

      for (const sel of scrollSelectors) {
        let el = null;
        if (typeof root.querySelector === 'function') {
          el = root.querySelector(sel);
        } else if (typeof $ !== 'undefined') {
          el = $(root).find(sel)[0];
        }
        if (el && typeof el.scrollTop === 'number') {
          this._savedScroll.set(sel, { top: el.scrollTop, left: el.scrollLeft || 0 });
        }
      }

      // Check root element itself
      if (typeof root.scrollTop === 'number') {
        this._savedScroll.set(':root', { top: root.scrollTop, left: root.scrollLeft || 0 });
      }
    } catch (err) {
      // Ignore in mock/test environments
    }
  }

  /**
   * Restore saved scroll positions to the application containers.
   *
   * @param {jQuery|HTMLElement} [html=null]
   */
  _restoreScrollPositions(html = null) {
    if (!this._savedScroll || this._savedScroll.size === 0) return;
    const saved = this._savedScroll;

    const applyScroll = () => {
      try {
        const root = (html && html[0]) ? html[0] : (html instanceof (globalThis.HTMLElement || Object) ? html : (this.element?.[0] || this.element));
        if (!root) return;

        for (const [sel, pos] of saved.entries()) {
          if (sel === ':root') {
            if (typeof root.scrollTop === 'number') {
              root.scrollTop = pos.top;
              if (pos.left) root.scrollLeft = pos.left;
            }
            continue;
          }
          let el = null;
          if (typeof root.querySelector === 'function') {
            el = root.querySelector(sel);
          } else if (typeof $ !== 'undefined') {
            el = $(root).find(sel)[0];
          }
          if (el && typeof el.scrollTop === 'number') {
            el.scrollTop = pos.top;
            if (pos.left) el.scrollLeft = pos.left;
          }
        }
      } catch (err) {
        // Ignore in mock/test environments
      }
    };

    applyScroll();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => applyScroll());
    } else if (typeof setTimeout === 'function') {
      setTimeout(() => applyScroll(), 0);
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
    this._restoreScrollPositions($html);
    this._restoreFocusState($html);
  }

  /**
   * Application V1 listener registration hook
   */
  activateListeners(html) {
    // Implemented by subclasses; restores scroll and focus if an element had focus before render
    this._restoreScrollPositions(html);
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
    this._saveScrollPositions();

    const opts = (typeof options === 'boolean') ? { force: options } : options;
    let res = this;
    if (typeof super.render === 'function') {
      res = await super.render(opts, deprecatedOptions);
    }
    this._restoreScrollPositions();
    this._restoreFocusState();
    return res;
  }
}
