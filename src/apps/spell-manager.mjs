/**
 * DCC RPG — Spell Library & Manager Application
 * Centralized interface for browsing, filtering, and learning spells.
 */
const BaseApplication = typeof Application !== 'undefined' ? Application : (globalThis.Application || class {});

export class DCCSpellManager extends BaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.onSelect = options.onSelect || null;
    this.activeSpellType = 'all';
    this.activeStat = 'all';
    this.activeDamageType = 'all';
    this.searchQuery = '';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-spell-manager',
      classes: ['dcc-sheet-window', 'dcc-spell-manager-window'],
      template: 'systems/carl-rpg/templates/apps/spell-manager.hbs',
      title: 'DCC RPG — Spell Library & Compendium',
      width: 820,
      height: 760,
      resizable: true,
      dragDrop: [{ dragSelector: '.dcc-spell-card-draggable', dropSelector: null }]
    });
  }

  /**
   * Retrieve all spells from official CONFIG, compendium pack, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getUnifiedSpells() {
    const spellsMap = new Map();

    // 1. From compendium pack carl-rpg.spells
    const pack = typeof game !== 'undefined' ? game.packs?.get('carl-rpg.spells') : null;
    if (pack) {
      try {
        const index = await pack.getIndex({
          fields: [
            'system.manaCost', 'system.range', 'system.duration', 'system.spellType',
            'system.stat', 'system.damageType', 'system.baseDamage', 'system.description',
            'system.favored', 'system.limitations', 'system.quote', 'system.aiFavor', 'img'
          ]
        });
        for (const entry of index) {
          spellsMap.set(entry.name.toLowerCase().trim(), {
            id: entry._id,
            _id: entry._id,
            name: entry.name,
            img: entry.img || 'icons/svg/wand.svg',
            source: 'compendium',
            isCompendium: true,
            isWorld: false,
            system: {
              manaCost: entry.system?.manaCost ?? 0,
              range: entry.system?.range || '30 feet',
              duration: entry.system?.duration || 'Instantaneous',
              spellType: entry.system?.spellType || 'Attack',
              stat: entry.system?.stat || 'int',
              damageType: entry.system?.damageType || '',
              baseDamage: entry.system?.baseDamage || '',
              description: entry.system?.description || '',
              favored: entry.system?.favored || '',
              limitations: entry.system?.limitations || '',
              quote: entry.system?.quote || '',
              aiFavor: entry.system?.aiFavor || 0
            }
          });
        }
      } catch (err) {
        console.warn('DCC RPG | Could not load spells pack index:', err);
      }
    }

    // 2. From CONFIG.DCC.spells fallback
    const configSpells = typeof CONFIG !== 'undefined' ? (CONFIG.DCC?.spells || []) : [];
    for (const s of configSpells) {
      const key = s.name.toLowerCase().trim();
      if (!spellsMap.has(key)) {
        spellsMap.set(key, {
          id: s._id || key,
          _id: s._id || key,
          name: s.name,
          img: s.img || 'icons/svg/wand.svg',
          source: 'compendium',
          isCompendium: true,
          isWorld: false,
          system: {
            manaCost: s.system?.manaCost ?? 0,
            range: s.system?.range || '30 feet',
            duration: s.system?.duration || 'Instantaneous',
            spellType: s.system?.spellType || 'Attack',
            stat: s.system?.stat || 'int',
            damageType: s.system?.damageType || '',
            baseDamage: s.system?.baseDamage || '',
            description: s.system?.description || '',
            favored: s.system?.favored || '',
            limitations: s.system?.limitations || '',
            quote: s.system?.quote || '',
            aiFavor: s.system?.aiFavor || 0
          }
        });
      }
    }

    // 3. From world items (custom/user-created spells)
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'spell') {
          const key = item.name.toLowerCase().trim();
          spellsMap.set(key, {
            id: item.id,
            _id: item.id,
            name: item.name,
            img: item.img || 'icons/svg/wand.svg',
            source: 'world',
            isCompendium: false,
            isWorld: true,
            system: {
              manaCost: item.system?.manaCost ?? 0,
              range: item.system?.range || '30 feet',
              duration: item.system?.duration || 'Instantaneous',
              spellType: item.system?.spellType || 'Attack',
              stat: item.system?.stat || 'int',
              damageType: item.system?.damageType || '',
              baseDamage: item.system?.baseDamage || '',
              description: item.system?.description || '',
              favored: item.system?.favored || '',
              limitations: item.system?.limitations || '',
              quote: item.system?.quote || '',
              aiFavor: item.system?.aiFavor || 0
            }
          });
        }
      }
    }

    // Determine 'isKnown' state if actor is bound
    const ownedSpellNames = new Set(
      this.actor?.items?.filter ? this.actor.items.filter(i => i.type === 'spell').map(i => i.name.toLowerCase().trim()) : []
    );

    const spells = Array.from(spellsMap.values()).map(spell => {
      const norm = spell.name.toLowerCase().trim();
      return {
        ...spell,
        isKnown: ownedSpellNames.has(norm),
        statUpper: (spell.system.stat || 'int').toUpperCase()
      };
    });

    return spells.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** @override */
  async getData(options) {
    const allSpells = await this.getUnifiedSpells();

    // Compute type counts
    const counts = {
      all: allSpells.length,
      attack: allSpells.filter(s => (s.system.spellType || '').toLowerCase().includes('attack')).length,
      heal: allSpells.filter(s => (s.system.spellType || '').toLowerCase().includes('heal')).length,
      buff: allSpells.filter(s => (s.system.spellType || '').toLowerCase().includes('buff') || (s.system.spellType || '').toLowerCase().includes('utility')).length,
      passive: allSpells.filter(s => (s.system.spellType || '').toLowerCase().includes('passive')).length,
      world: allSpells.filter(s => s.isWorld).length
    };

    // Filter spells based on state
    const filteredSpells = allSpells.filter(s => {
      // Spell Type Filter
      if (this.activeSpellType !== 'all') {
        if (this.activeSpellType === 'world') {
          if (!s.isWorld) return false;
        } else {
          const t = (s.system.spellType || '').toLowerCase();
          if (!t.includes(this.activeSpellType)) return false;
        }
      }

      // Stat Filter
      if (this.activeStat !== 'all') {
        if ((s.system.stat || '').toLowerCase() !== this.activeStat) return false;
      }

      // Damage Type Filter
      if (this.activeDamageType !== 'all') {
        if ((s.system.damageType || '').toLowerCase() !== this.activeDamageType.toLowerCase()) return false;
      }

      // Search Query Filter
      if (this.searchQuery) {
        const q = this.searchQuery;
        const nameMatch = s.name.toLowerCase().includes(q);
        const descMatch = (s.system.description || '').toLowerCase().includes(q);
        const dmgMatch = (s.system.damageType || '').toLowerCase().includes(q) || (s.system.baseDamage || '').toLowerCase().includes(q);
        const quoteMatch = (s.system.quote || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !dmgMatch && !quoteMatch) return false;
      }

      return true;
    });

    const damageTypes = CONFIG.DCC?.damageTypes || [
      'Acid', 'Bludgeoning', 'Electric', 'Fire', 'Force',
      'Holy', 'Ice', 'Necrotic', 'Piercing', 'Poison',
      'Psychic', 'Slashing', 'Sonic'
    ];

    return {
      spells: filteredSpells,
      counts,
      activeSpellType: this.activeSpellType,
      activeStat: this.activeStat,
      activeDamageType: this.activeDamageType,
      searchQuery: this.searchQuery,
      damageTypes,
      isActorPicker: Boolean(this.actor),
      actor: this.actor,
      isGM: typeof game !== 'undefined' ? Boolean(game.user?.isGM) : true,
      canCreate: typeof game !== 'undefined' ? (game.user?.isGM || game.user?.can?.('ITEM_CREATE')) : true
    };
  }

  /**
   * Add a spell to the bound actor.
   * @param {object} spellData
   */
  async addSpellToActor(spellData) {
    if (!this.actor) {
      globalThis.ui?.notifications?.warn('No character open to learn this spell.');
      return;
    }

    const norm = spellData.name.toLowerCase().trim();
    const existing = this.actor.items.find(i => i.type === 'spell' && i.name.toLowerCase().trim() === norm);
    if (existing) {
      globalThis.ui?.notifications?.info(`${this.actor.name} already knows "${spellData.name}".`);
      return;
    }

    const itemPayload = {
      name: spellData.name,
      type: 'spell',
      img: spellData.img || 'icons/svg/wand.svg',
      system: structuredClone(spellData.system || {})
    };

    await this.actor.createEmbeddedDocuments('Item', [itemPayload]);
    globalThis.ui?.notifications?.info(`Added spell "${spellData.name}" to ${this.actor.name}.`);
    if (typeof this.render === 'function') this.render(false);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Search query input with instant filtering
    html.find('.spell-search-input').on('input', ev => {
      this.searchQuery = (ev.currentTarget.value || '').toLowerCase().trim();
      this.render(false);
    });

    // Clear search
    html.find('.spell-search-clear').click(ev => {
      ev.preventDefault();
      this.searchQuery = '';
      this.render(false);
    });

    // Spell type filter pills
    html.find('.spell-type-pill').click(ev => {
      ev.preventDefault();
      this.activeSpellType = $(ev.currentTarget).data('type') || 'all';
      this.render(false);
    });

    // Stat filter dropdown
    html.find('.spell-stat-filter').change(ev => {
      this.activeStat = ev.currentTarget.value || 'all';
      this.render(false);
    });

    // Damage type filter dropdown
    html.find('.spell-damage-filter').change(ev => {
      this.activeDamageType = ev.currentTarget.value || 'all';
      this.render(false);
    });

    // Add Spell to Crawler
    html.find('.btn-learn-spell').click(async ev => {
      ev.preventDefault();
      const spellKey = $(ev.currentTarget).data('spellName');
      const allSpells = await this.getUnifiedSpells();
      const match = allSpells.find(s => s.name.toLowerCase().trim() === String(spellKey).toLowerCase().trim());
      if (match) {
        await this.addSpellToActor(match);
      }
    });

    // Cast / Post to Chat preview
    html.find('.btn-cast-spell').click(async ev => {
      ev.preventDefault();
      const spellKey = $(ev.currentTarget).data('spellName');
      const allSpells = await this.getUnifiedSpells();
      const match = allSpells.find(s => s.name.toLowerCase().trim() === String(spellKey).toLowerCase().trim());
      if (match) {
        if (CONFIG.Item?.documentClass?.rollSpellCard) {
          await CONFIG.Item.documentClass.rollSpellCard(match);
        } else {
          globalThis.ui?.notifications?.info(`Spell: ${match.name}`);
        }
      }
    });
  }

  /** @override */
  _onDragStart(event) {
    const el = event.currentTarget;
    const spellName = el.dataset.spellName;
    if (!spellName) return;

    const dragData = {
      type: 'Item',
      name: spellName,
      data: {
        name: spellName,
        type: 'spell'
      }
    };
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }
}
