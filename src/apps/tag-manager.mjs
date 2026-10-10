/**
 * CarlRPG Tag Manager & Taxonomy Application
 *
 * Provides GMs and players with an interactive browser to explore registered tags,
 * view usage frequency across world and compendium items, and register custom tags.
 */

import { DCCBaseApplication } from './base-application.mjs';
import { DCC_TAGS, TAG_NAMESPACES, registerCustomTag, getTagDefinition } from '../data/tags.mjs';
import { tagIndex } from './tag-index.mjs';
import { openTagSystemJournal } from '../data/journal-tag-system.mjs';

export class DCCTagManager extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.activeNamespace = options.activeNamespace || 'all';
    this.searchQuery = '';
    this.item = options.item || options.document || null;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-tag-manager',
      classes: ['dcc-sheet-window', 'dcc-tag-manager-window'],
      template: 'systems/carl-rpg/templates/apps/tag-manager.hbs',
      title: 'DCC RPG — Tag Manager & Taxonomy',
      width: 780,
      height: 680,
      resizable: true
    });
  }

  /**
   * Application context preparation
   * @override
   */
  async getData(options = {}) {
    const context = (typeof super.getData === 'function') ? await super.getData(options) : {};

    // 1. Gather all registered tags (core + custom)
    const allTags = [...DCC_TAGS];

    // Load any custom tags persisted in game settings
    let savedCustomTags = [];
    if (globalThis.game?.settings) {
      try {
        savedCustomTags = globalThis.game.settings.get('carl-rpg', 'customTags') || [];
      } catch {
        savedCustomTags = [];
      }
    }
    for (const ct of savedCustomTags) {
      if (!allTags.some(t => t.id === ct.id)) {
        allTags.push(ct);
        registerCustomTag(ct);
      }
    }

    // 2. Compute usage counts via tagIndex
    const tagCounts = tagIndex.getTagCounts ? tagIndex.getTagCounts() : {};

    // Identify tags assigned to the target item (if opened in item context)
    const targetItem = this.item ? {
      id: this.item.id,
      name: this.item.name,
      type: this.item.type,
      tags: Array.isArray(this.item.system?.tags) ? [...this.item.system.tags] : []
    } : null;
    const itemTagsSet = new Set(targetItem?.tags || []);

    const enrichedTags = allTags.map(t => {
      const count = tagCounts[t.id] ?? (tagIndex.find ? tagIndex.find(t.id).length : 0);
      return {
        ...t,
        count,
        isCustom: Boolean(t.isCustom || t.namespace === 'custom'),
        isAssigned: itemTagsSet.has(t.id)
      };
    });

    // 3. Build namespace tabs with counts
    const namespaces = [
      { id: 'all', label: 'All' },
      ...Object.entries(TAG_NAMESPACES).map(([ns, def]) => ({ id: ns, label: def.label || (ns.charAt(0).toUpperCase() + ns.slice(1)) })),
      { id: 'custom', label: 'Custom' }
    ];

    const namespaceTabs = namespaces.map(ns => {
      let count = 0;
      if (ns.id === 'all') {
        count = enrichedTags.length;
      } else if (ns.id === 'custom') {
        count = enrichedTags.filter(t => t.isCustom).length;
      } else {
        count = enrichedTags.filter(t => t.namespace === ns.id).length;
      }
      return {
        id: ns.id,
        label: ns.label,
        count,
        active: this.activeNamespace === ns.id
      };
    });

    // 4. Filter tags by activeNamespace and searchQuery
    let filteredTags = enrichedTags;
    if (this.activeNamespace !== 'all') {
      if (this.activeNamespace === 'custom') {
        filteredTags = filteredTags.filter(t => t.isCustom);
      } else {
        filteredTags = filteredTags.filter(t => t.namespace === this.activeNamespace);
      }
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      filteredTags = filteredTags.filter(t =>
        t.id.toLowerCase().includes(q) ||
        (t.label && t.label.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    filteredTags.sort((a, b) => a.id.localeCompare(b.id));

    context.targetItem = targetItem;
    context.totalTagsCount = enrichedTags.length;
    context.searchQuery = this.searchQuery;
    context.namespaceTabs = namespaceTabs;
    context.tagsList = filteredTags;

    return context;
  }

  /**
   * DOM Listeners
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Namespace tabs
    html.find('.dcc-tm-tab').click(ev => {
      ev.preventDefault();
      this.activeNamespace = ev.currentTarget.dataset.namespace || 'all';
      this.render(false);
    });

    // Search input
    html.find('.dcc-tag-search-input').on('input', ev => {
      this.searchQuery = ev.target.value;
      this.render(false);
    });

    // Clear search
    html.find('.dcc-clear-search-btn').click(ev => {
      ev.preventDefault();
      this.searchQuery = '';
      this.render(false);
    });

    // Toggle Tag Assignment on Target Item
    html.find('.dcc-tag-assign-toggle').on('change', async ev => {
      ev.preventDefault();
      if (!this.item) return;
      const tagId = ev.currentTarget.dataset.tagId;
      if (!tagId) return;
      const checked = Boolean(ev.currentTarget.checked);
      const curTags = Array.isArray(this.item.system?.tags) ? [...this.item.system.tags] : [];
      let updated = curTags;
      if (checked && !curTags.includes(tagId)) {
        updated = [...curTags, tagId];
      } else if (!checked && curTags.includes(tagId)) {
        updated = curTags.filter(t => t !== tagId);
      }
      await this.item.update({ 'system.tags': updated });
      if (this.item.sheet?.rendered) {
        this.item.sheet.render(false);
      }
      this.render(false);
    });

    // Register Custom Tag
    html.find('.dcc-register-custom-tag-btn').click(async ev => {
      ev.preventDefault();
      const idInput = html.find('.dcc-custom-tag-id').val()?.trim() || '';
      const labelInput = html.find('.dcc-custom-tag-label').val()?.trim() || '';
      const nsSelect = html.find('.dcc-custom-tag-namespace').val()?.trim() || 'custom';
      const applyToItem = html.find('.dcc-custom-tag-apply-item').is(':checked');

      if (!idInput) {
        ui.notifications?.warn('DCC RPG | Please enter a Tag ID.');
        return;
      }

      // Format clean namespaced tag ID
      let cleanId = idInput.toLowerCase().replace(/[^a-z0-9_.-]/g, '-');
      if (!cleanId.includes('.')) {
        cleanId = `${nsSelect}.${cleanId}`;
      }

      const cleanLabel = labelInput || cleanId;
      const newTag = {
        id: cleanId,
        label: cleanLabel,
        namespace: nsSelect,
        isCustom: true
      };

      registerCustomTag(newTag);

      // Persist to game settings if available
      if (globalThis.game?.settings) {
        try {
          const cur = globalThis.game.settings.get('carl-rpg', 'customTags') || [];
          if (!cur.some(t => t.id === cleanId)) {
            await globalThis.game.settings.set('carl-rpg', 'customTags', [...cur, newTag]);
          }
        } catch (err) {
          console.warn('DCC RPG | Could not save custom tag to settings', err);
        }
      }

      // Auto-apply newly created tag to target item if requested
      if (applyToItem && this.item) {
        const curTags = Array.isArray(this.item.system?.tags) ? [...this.item.system.tags] : [];
        if (!curTags.includes(cleanId)) {
          await this.item.update({ 'system.tags': [...curTags, cleanId] });
          if (this.item.sheet?.rendered) {
            this.item.sheet.render(false);
          }
        }
      }

      ui.notifications?.info(`DCC RPG | Registered custom tag "${cleanId}".`);
      this.render(false);
    });

    // Delete Custom Tag
    html.find('.dcc-delete-tag-btn').click(async ev => {
      ev.preventDefault();
      const tagId = ev.currentTarget.dataset.tagId;
      if (!tagId) return;

      if (globalThis.game?.settings) {
        try {
          const cur = globalThis.game.settings.get('carl-rpg', 'customTags') || [];
          const updated = cur.filter(t => t.id !== tagId);
          await globalThis.game.settings.set('carl-rpg', 'customTags', updated);
        } catch (err) {
          console.warn('DCC RPG | Could not delete custom tag from settings', err);
        }
      }

      this.render(false);
    });

    // Open Tag Guide Journal Entry
    html.find('.dcc-open-tag-guide-btn').click(async ev => {
      ev.preventDefault();
      await openTagSystemJournal();
    });
  }
}
