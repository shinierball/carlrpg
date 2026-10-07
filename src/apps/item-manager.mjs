/**
 * DCC RPG — Item & Equipment Library / Manager Application
 * Centralized interface for browsing, selecting, creating, and managing
 * physical gear (weapons, armor, accessories), consumables, potions, wands, and scrolls.
 */
import { DCCBaseApplication } from './base-application.mjs';
import { DCC_ITEMS } from '../data/items.mjs';

const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog
  ?? globalThis.Dialog;

export class DCCItemManager extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.onSelect = options.onSelect || null;
    this.activeCategory = options.activeCategory || options.activeType || 'all';
    this.activeSlot = options.activeSlot || 'all';
    this.searchQuery = '';
    this.rawSearchQuery = '';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-item-manager',
      classes: ['dcc-sheet-window', 'dcc-item-manager-window'],
      template: 'systems/carl-rpg/templates/apps/item-manager.hbs',
      title: 'DCC RPG — Item & Equipment Library',
      width: 860,
      height: 780,
      resizable: true,
      dragDrop: [{ dragSelector: '.dcc-item-card-draggable', dropSelector: null }]
    });
  }

  /**
   * Retrieve all items and gear from compendium packs, official CONFIG datasets, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getUnifiedItems() {
    const itemsMap = new Map();

    // 1. From compendium pack carl-rpg.items
    const pack = typeof game !== 'undefined' ? game.packs?.get('carl-rpg.items') : null;
    if (pack) {
      try {
        const index = await pack.getIndex({
          fields: [
            'type', 'img', 'system.value', 'system.quantity', 'system.slot', 'system.lootType',
            'system.equipped', 'system.isWeapon', 'system.drBonus', 'system.evadeBonus',
            'system.damageParts', 'system.charges', 'system.outcomes', 'system.notes', 'system.description'
          ]
        });
        for (const entry of index) {
          const key = entry.name.toLowerCase().trim();
          itemsMap.set(key, {
            id: entry._id,
            _id: entry._id,
            name: entry.name,
            type: entry.type || 'gear',
            img: entry.img || (entry.type === 'gear' ? 'icons/svg/shield.svg' : 'icons/svg/item-bag.svg'),
            source: 'compendium',
            isCompendium: true,
            isWorld: false,
            system: structuredClone(entry.system || {})
          });
        }
      } catch (err) {
        console.warn('DCC RPG | Could not load items pack index:', err);
      }
    }

    // 2. From CONFIG.DCC.items or DCC_ITEMS canonical dataset
    const configItems = typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.DCC?.items)
      ? CONFIG.DCC.items
      : DCC_ITEMS;

    for (const it of configItems) {
      const key = it.name.toLowerCase().trim();
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          id: it._id || it.id || key,
          _id: it._id || it.id || key,
          name: it.name,
          type: it.type || 'gear',
          img: it.img || (it.type === 'gear' ? 'icons/svg/shield.svg' : 'icons/svg/item-bag.svg'),
          source: 'canonical',
          isCompendium: true,
          isWorld: false,
          system: structuredClone(it.system || {})
        });
      }
    }

    // 3. World Items (User-created or imported gear/loot)
    if (typeof game !== 'undefined' && game.items) {
      for (const it of game.items) {
        if (it.type !== 'gear' && it.type !== 'loot') continue;
        const key = it.name.toLowerCase().trim();
        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: it.id || it._id,
            _id: it.id || it._id,
            name: it.name,
            type: it.type,
            img: it.img || (it.type === 'gear' ? 'icons/svg/shield.svg' : 'icons/svg/item-bag.svg'),
            source: 'world',
            isCompendium: false,
            isWorld: true,
            system: (typeof it.toObject === 'function') ? it.toObject().system : structuredClone(it.system || {})
          });
        }
      }
    }

    return Array.from(itemsMap.values());
  }

  /** @override */
  async getData(options = {}) {
    const rawItems = await this.getUnifiedItems();
    const canSeeValue = this.actor ? (typeof this.actor.canSeeItemValue === 'function' ? this.actor.canSeeItemValue() : true) : true;

    // Build decorated item list
    const decoratedItems = rawItems.map(item => {
      const sys = item.system || {};
      const type = item.type || 'gear';
      const slot = String(sys.slot || 'torso').toLowerCase().trim();
      const lootType = String(sys.lootType || 'consumable').toLowerCase().trim();
      const isWeapon = Boolean(sys.isWeapon || slot === 'hands' || (sys.damageParts && sys.damageParts.length > 0));
      const goldVal = Number(sys.value) || 0;
      const displayValue = canSeeValue ? `${goldVal} GP` : '???';

      // Check ownership on current actor
      let isOwned = false;
      let ownedQty = 0;
      if (this.actor && Array.isArray(this.actor.items)) {
        const match = this.actor.items.find(i => (i.id === item.id || i._id === item.id) || (i.name && i.name.toLowerCase().trim() === item.name.toLowerCase().trim()));
        if (match) {
          isOwned = true;
          ownedQty = Number(match.system?.quantity) || 1;
        }
      }

      // Format badges & summaries
      let badgeLabel = 'GEAR';
      let badgeColor = '#c0392b';
      if (type === 'gear') {
        if (isWeapon) {
          badgeLabel = 'WEAPON';
          badgeColor = '#d35400';
        } else if (slot === 'accessory') {
          badgeLabel = 'ACCESSORY';
          badgeColor = '#8e44ad';
        } else {
          badgeLabel = `ARMOR (${slot.toUpperCase()})`;
          badgeColor = '#2980b9';
        }
      } else {
        if (lootType === 'scroll') {
          badgeLabel = 'SPELL SCROLL';
          badgeColor = '#16a085';
        } else if (lootType === 'wand') {
          badgeLabel = 'WAND';
          badgeColor = '#8e44ad';
        } else if (lootType.includes('scratch')) {
          badgeLabel = 'LOTTERY TICKET';
          badgeColor = '#d4af37';
        } else {
          badgeLabel = 'CONSUMABLE';
          badgeColor = '#27ae60';
        }
      }

      // Mechanics summary text
      const mechanics = [];
      if (sys.drBonus) mechanics.push(`+${sys.drBonus} DR`);
      if (sys.evadeBonus) mechanics.push(`${sys.evadeBonus > 0 ? `+${sys.evadeBonus}` : sys.evadeBonus} Evade`);
      if (sys.damageParts?.length) {
        mechanics.push(sys.damageParts.map(p => `${p.formula} ${p.type || ''}`.trim()).join(' + '));
      }
      if (sys.charges?.max > 0) mechanics.push(`${sys.charges.value ?? sys.charges.max}/${sys.charges.max} Charges`);
      if (sys.cooldown && sys.cooldown !== 'None') mechanics.push(sys.cooldown);
      if (sys.spellName) mechanics.push(`Spell: ${sys.spellName}`);

      return {
        ...item,
        slot,
        lootType,
        isWeapon,
        goldVal,
        displayValue,
        canSeeValue,
        isOwned,
        ownedQty,
        badgeLabel,
        badgeColor,
        mechanicsSummary: mechanics.join(' • '),
        descriptionSnippet: sys.notes || sys.description || ''
      };
    });

    // Compute category counts
    const counts = {
      all: decoratedItems.length,
      gear: decoratedItems.filter(i => i.type === 'gear').length,
      weapons: decoratedItems.filter(i => i.type === 'gear' && i.isWeapon).length,
      armor: decoratedItems.filter(i => i.type === 'gear' && !i.isWeapon && i.slot !== 'accessory').length,
      accessories: decoratedItems.filter(i => i.type === 'gear' && i.slot === 'accessory').length,
      loot: decoratedItems.filter(i => i.type === 'loot').length,
      consumables: decoratedItems.filter(i => i.type === 'loot' && (i.lootType === 'consumable' || i.lootType === 'potion')).length,
      scrolls: decoratedItems.filter(i => i.type === 'loot' && i.lootType === 'scroll').length,
      wands: decoratedItems.filter(i => i.type === 'loot' && i.lootType === 'wand').length,
      lottery: decoratedItems.filter(i => i.type === 'loot' && i.lootType.includes('scratch')).length
    };

    // Filter by category
    let filtered = decoratedItems;
    const cat = this.activeCategory;
    if (cat === 'gear') {
      filtered = filtered.filter(i => i.type === 'gear');
    } else if (cat === 'weapons') {
      filtered = filtered.filter(i => i.type === 'gear' && i.isWeapon);
    } else if (cat === 'armor') {
      filtered = filtered.filter(i => i.type === 'gear' && !i.isWeapon && i.slot !== 'accessory');
    } else if (cat === 'accessories') {
      filtered = filtered.filter(i => i.type === 'gear' && i.slot === 'accessory');
    } else if (cat === 'loot') {
      filtered = filtered.filter(i => i.type === 'loot');
    } else if (cat === 'consumables') {
      filtered = filtered.filter(i => i.type === 'loot' && (i.lootType === 'consumable' || i.lootType === 'potion'));
    } else if (cat === 'scrolls') {
      filtered = filtered.filter(i => i.type === 'loot' && i.lootType === 'scroll');
    } else if (cat === 'wands') {
      filtered = filtered.filter(i => i.type === 'loot' && i.lootType === 'wand');
    } else if (cat === 'lottery') {
      filtered = filtered.filter(i => i.type === 'loot' && i.lootType.includes('scratch'));
    }

    // Filter by specific gear slot if selected
    if (this.activeSlot !== 'all') {
      filtered = filtered.filter(i => i.type === 'gear' && i.slot === this.activeSlot);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery;
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.descriptionSnippet && i.descriptionSnippet.toLowerCase().includes(q)) ||
        (i.mechanicsSummary && i.mechanicsSummary.toLowerCase().includes(q)) ||
        i.badgeLabel.toLowerCase().includes(q)
      );
    }

    // Sort alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return {
      actor: this.actor,
      items: filtered,
      activeCategory: this.activeCategory,
      activeSlot: this.activeSlot,
      searchQuery: this.rawSearchQuery || this.searchQuery,
      counts,
      canSeeValue,
      slots: [
        { key: 'all', label: 'All Slots' },
        { key: 'head', label: 'Head' },
        { key: 'torso', label: 'Torso' },
        { key: 'arms', label: 'Arms' },
        { key: 'hands', label: 'Hands / Weapons' },
        { key: 'legs', label: 'Legs' },
        { key: 'feet', label: 'Feet' },
        { key: 'accessory', label: 'Accessories' }
      ]
    };
  }

  /**
   * Add a selected item to the current crawler's inventory.
   * @param {object} itemData
   * @returns {Promise<DCCItem|null>}
   */
  async addItemToActor(itemData) {
    if (!this.actor) {
      globalThis.ui?.notifications?.warn?.('No actor bound to add this item to!');
      return null;
    }

    const itemPayload = {
      name: itemData.name,
      type: itemData.type,
      img: itemData.img,
      system: structuredClone(itemData.system || {})
    };

    let created = null;
    if (typeof this.actor.createEmbeddedDocuments === 'function') {
      const res = await this.actor.createEmbeddedDocuments('Item', [itemPayload]);
      created = res?.[0] || null;
    } else if (Array.isArray(this.actor.items)) {
      const ItemCls = CONFIG.Item?.documentClass || class { constructor(d) { Object.assign(this, d); } };
      created = new ItemCls(itemPayload, this.actor);
      this.actor.items.push(created);
    }

    globalThis.ui?.notifications?.info?.(`Added "${itemData.name}" to ${this.actor.name}'s inventory.`);
    if (typeof this.render === 'function') this.render(false);
    return created;
  }

  /**
   * Open modal dialog to create a custom Gear or Loot item.
   * @param {'gear'|'loot'} type
   */
  async createCustomItem(type = 'gear') {
    const isGear = type === 'gear';
    const defaultIcon = isGear ? 'icons/svg/shield.svg' : 'icons/svg/item-bag.svg';
    const name = isGear ? 'New Custom Gear' : 'New Custom Item';

    const itemData = {
      name,
      type: isGear ? 'gear' : 'loot',
      img: defaultIcon,
      system: isGear ? {
        slot: 'torso',
        drBonus: 0,
        isWeapon: false,
        quantity: 1,
        equipped: false,
        critMultiplier: 1
      } : {
        lootType: 'consumable',
        quantity: 1,
        cooldown: 'None',
        outcomes: []
      }
    };

    if (this.actor) {
      const created = await this.addItemToActor(itemData);
      if (created && typeof created.sheet?.render === 'function') {
        created.sheet.render(true);
      }
      return created;
    } else {
      const ItemClass = CONFIG.Item?.documentClass
        ?? globalThis.foundry?.documents?.Item
        ?? globalThis.Item;
      const created = await ItemClass.create(itemData);
      if (created && typeof created.sheet?.render === 'function') {
        created.sheet.render(true);
      }
      this.render(false);
      return created;
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Search query input with instant filtering and focus retention
    html.find('.item-search-input').on('input', ev => {
      this._saveFocusState(ev.currentTarget);
      const val = ev.currentTarget?.value !== undefined
        ? ev.currentTarget.value
        : (typeof $(ev.currentTarget).val === 'function' ? $(ev.currentTarget).val() : '');
      this.rawSearchQuery = val;
      this.searchQuery = String(val).toLowerCase().trim();
      this.render(false);
    });

    // Clear search
    html.find('.item-search-clear').click(ev => {
      ev.preventDefault();
      this.rawSearchQuery = '';
      this.searchQuery = '';
      this._savedFocus = { selector: '.item-search-input', selectionStart: 0, selectionEnd: 0 };
      this.render(false);
    });

    // Category filter pills
    html.find('.item-category-pill').click(ev => {
      ev.preventDefault();
      this.activeCategory = $(ev.currentTarget).data('category') || 'all';
      this.render(false);
    });

    // Slot filter dropdown
    html.find('.item-slot-filter').change(ev => {
      this.activeSlot = ev.currentTarget.value || 'all';
      this.render(false);
    });

    // Add Item to Actor Inventory
    html.find('.btn-add-item').click(async ev => {
      ev.preventDefault();
      const itemName = $(ev.currentTarget).data('itemName');
      const allItems = await this.getUnifiedItems();
      const match = allItems.find(i => i.name.toLowerCase().trim() === String(itemName).toLowerCase().trim());
      if (match) {
        await this.addItemToActor(match);
      }
    });

    // Preview Item / Open Sheet
    html.find('.btn-preview-item').click(async ev => {
      ev.preventDefault();
      const itemName = $(ev.currentTarget).data('itemName');
      const allItems = await this.getUnifiedItems();
      const match = allItems.find(i => i.name.toLowerCase().trim() === String(itemName).toLowerCase().trim());
      if (match) {
        if (CONFIG.Item?.documentClass) {
          const tempDoc = new CONFIG.Item.documentClass(match);
          if (typeof tempDoc.sheet?.render === 'function') {
            tempDoc.sheet.render(true);
            return;
          }
        }
        globalThis.ui?.notifications?.info?.(`Item: ${match.name} (${match.type})`);
      }
    });

    // Create Custom Gear Button
    html.find('.btn-create-custom-gear').click(ev => {
      ev.preventDefault();
      this.createCustomItem('gear');
    });

    // Create Custom Loot Button
    html.find('.btn-create-custom-loot').click(ev => {
      ev.preventDefault();
      this.createCustomItem('loot');
    });
  }

  /** @override */
  _onDragStart(event) {
    const el = event.currentTarget;
    const itemName = el.dataset.itemName;
    if (!itemName) return;

    let itemData = null;
    const norm = itemName.toLowerCase().trim();
    if (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.DCC?.items)) {
      itemData = CONFIG.DCC.items.find(i => i.name?.toLowerCase().trim() === norm);
    }
    if (!itemData) {
      itemData = DCC_ITEMS.find(i => i.name?.toLowerCase().trim() === norm);
    }
    if (!itemData && typeof game !== 'undefined' && game.items) {
      itemData = game.items.find(i => i.name?.toLowerCase().trim() === norm);
    }

    const uuid = itemData?.uuid || (itemData?._id ? `Compendium.carl-rpg.items.${itemData._id}` : undefined);
    const dragData = {
      type: 'Item',
      name: itemName,
      uuid,
      data: {
        name: itemName,
        type: itemData?.type || 'gear',
        img: itemData?.img || 'icons/svg/item-bag.svg',
        system: itemData?.system ? structuredClone(itemData.system) : {},
        flags: {
          core: { sourceId: uuid },
          'carl-rpg': {
            compendiumId: itemData?._id || itemData?.id,
            sourceUuid: uuid
          }
        }
      }
    };
    event.dataTransfer?.setData('text/plain', JSON.stringify(dragData));
  }
}
