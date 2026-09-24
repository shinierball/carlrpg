/**
 * Dungeon Crawler Carl RPG — Achievement Manager & Trophy Room Application
 * Centralized interface for browsing canonical achievements, inspecting party trophies,
 * and awarding achievements to Crawlers with official Dungeon AI announcements.
 */
import { DCCBaseApplication } from './base-application.mjs';
import { DCC_ACHIEVEMENTS, DCC_ACHIEVEMENT_TIERS } from '../data/achievements.mjs';

export class DCCAchievementManagerApp extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.activeTab = options.activeTab || 'library';
    this.selectedTier = options.selectedTier || 'all';
    this.searchQuery = '';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-achievement-manager',
      classes: ['dcc-sheet-window', 'dcc-achievement-manager-window'],
      template: 'systems/carl-rpg/templates/apps/achievement-manager.hbs',
      title: 'DCC RPG — Achievement Library & Trophy Room',
      width: 860,
      height: 780,
      resizable: true
    });
  }

  /**
   * Application V2 DEFAULT_OPTIONS configuration
   */
  static DEFAULT_OPTIONS = {
    classes: ['dcc-sheet-window', 'dcc-achievement-manager-window'],
    position: {
      width: 860,
      height: 780
    },
    window: {
      resizable: true,
      title: 'DCC RPG — Achievement Library & Trophy Room'
    }
  };

  /**
   * Application V2 Parts definition
   */
  static PARTS = {
    manager: {
      template: 'systems/carl-rpg/templates/apps/achievement-manager.hbs'
    }
  };

  /**
   * Retrieve all party crawlers available in the current world.
   * @returns {Array<DCCActor>}
   */
  getPartyCrawlers() {
    if (typeof game === 'undefined' || !game.actors) return [];
    return game.actors.filter(a => a.type === 'crawler');
  }

  /**
   * Retrieve canonical and custom achievement templates.
   * @returns {Array<object>}
   */
  getUnifiedAchievements() {
    const list = structuredClone(DCC_ACHIEVEMENTS);

    // If game.items has world achievements, merge them
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'achievement') {
          const norm = item.name.toLowerCase().trim();
          if (!list.some(a => a.name.toLowerCase().trim() === norm)) {
            list.push({
              id: item.id,
              name: item.name,
              type: 'achievement',
              img: item.img || 'icons/svg/trophy.svg',
              source: 'world',
              system: structuredClone(item.system || {})
            });
          }
        }
      }
    }

    return list;
  }

  /**
   * Application context preparation
   * @override
   */
  async getData(options = {}) {
    const context = {};

    const crawlers = this.getPartyCrawlers();
    let currentActor = this.actor;
    if (!currentActor && crawlers.length > 0) {
      currentActor = crawlers[0];
    }

    const allLibrary = this.getUnifiedAchievements();

    // Prepare tier options for dropdown
    const tierOptions = [
      { id: 'all', label: 'All Tiers', selected: this.selectedTier === 'all' }
    ];
    for (const [key, tier] of Object.entries(DCC_ACHIEVEMENT_TIERS)) {
      tierOptions.push({
        id: key,
        label: tier.label,
        selected: this.selectedTier === key
      });
    }

    // Filter library achievements
    const query = this.searchQuery.toLowerCase().trim();
    const filteredLibrary = allLibrary.filter(ach => {
      const t = (ach.system?.tier || 'bronze').toLowerCase();
      const matchTier = this.selectedTier === 'all' || t === this.selectedTier;
      const matchQuery = !query ||
        ach.name.toLowerCase().includes(query) ||
        (ach.system?.quote || '').toLowerCase().includes(query) ||
        (ach.system?.reward || '').toLowerCase().includes(query) ||
        (ach.system?.description || '').toLowerCase().includes(query);
      return matchTier && matchQuery;
    }).map(ach => {
      const tierKey = (ach.system?.tier || 'bronze').toLowerCase();
      const tierConfig = DCC_ACHIEVEMENT_TIERS[tierKey] || DCC_ACHIEVEMENT_TIERS.special;
      return {
        ...ach,
        tierConfig
      };
    });

    // Party achievements: collect from all crawlers
    const partyData = crawlers.map(c => {
      const achievements = (c.items || []).filter(i => i.type === 'achievement').map(i => {
        const t = (i.system?.tier || 'bronze').toLowerCase();
        const tierConfig = DCC_ACHIEVEMENT_TIERS[t] || DCC_ACHIEVEMENT_TIERS.special;
        return {
          id: i.id,
          name: i.name,
          img: i.img || 'icons/svg/trophy.svg',
          system: i.system,
          tierConfig
        };
      });

      const tierCounts = {};
      for (const k of Object.keys(DCC_ACHIEVEMENT_TIERS)) tierCounts[k] = 0;
      let totalFavor = 0;
      for (const a of achievements) {
        const t = (a.system?.tier || 'bronze').toLowerCase();
        if (tierCounts[t] !== undefined) tierCounts[t]++;
        totalFavor += Number(a.system?.favor) || 0;
      }

      return {
        actorId: c.id,
        actorName: c.name,
        actorImg: c.img || 'icons/svg/mystery-man.svg',
        floor: c.system?.details?.floor || '1st Floor',
        achievements,
        count: achievements.length,
        tierCounts,
        totalFavor,
        isCurrent: currentActor ? c.id === currentActor.id : false
      };
    });

    context.crawlers = crawlers;
    context.currentActor = currentActor;
    context.activeTab = this.activeTab;
    context.selectedTier = this.selectedTier;
    context.tierOptions = tierOptions;
    context.tiers = DCC_ACHIEVEMENT_TIERS;
    context.libraryAchievements = filteredLibrary;
    context.partyData = partyData;
    context.totalLibraryCount = allLibrary.length;

    return context;
  }

  /**
   * Award an achievement to a target crawler actor.
   * @param {string} actorId
   * @param {object} achData
   */
  async grantAchievement(actorId, achData) {
    const actor = (typeof game !== 'undefined' && game.actors) ? game.actors.get(actorId) : null;
    if (!actor) {
      ui.notifications?.warn('Target crawler actor not found.');
      return null;
    }

    const itemData = {
      name: achData.name,
      type: 'achievement',
      img: achData.img || 'icons/svg/trophy.svg',
      system: {
        quote: achData.system?.quote || '',
        reward: achData.system?.reward || 'Special Recognition',
        rewardContents: achData.system?.rewardContents || '',
        tier: achData.system?.tier || 'bronze',
        floor: actor.system?.details?.floor || '1st Floor',
        dateEarned: new Date().toLocaleDateString(),
        session: '',
        favor: Number(achData.system?.favor) || 0,
        xp: Number(achData.system?.xp) || 0,
        unlocked: true,
        description: achData.system?.description || ''
      }
    };

    let createdItem = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const created = await actor.createEmbeddedDocuments('Item', [itemData]);
      createdItem = created?.[0];
    } else if (Array.isArray(actor.items)) {
      actor.items.push(itemData);
      createdItem = itemData;
    }

    // Apply Favor if specified
    const favorBonus = Number(achData.system?.favor) || 0;
    if (favorBonus > 0) {
      const curFavor = Number(actor.system?.attributes?.aiFavor) || 0;
      await actor.update({ 'system.attributes.aiFavor': curFavor + favorBonus });
    }

    // Apply XP if specified
    const xpBonus = Number(achData.system?.xp) || 0;
    if (xpBonus > 0) {
      const curXp = Number(actor.system?.details?.xp?.value) || 0;
      await actor.update({ 'system.details.xp.value': curXp + xpBonus });
    }

    // Announce to chat
    if (createdItem && typeof actor.announceAchievement === 'function') {
      await actor.announceAchievement(createdItem);
    }

    ui.notifications?.info(`Achievement "${achData.name}" awarded to ${actor.name}!`);
    this.render(false);
    return createdItem;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Tab navigation
    html.find('.dcc-nav-tab').click(ev => {
      ev.preventDefault();
      const tab = $(ev.currentTarget).data('tab');
      this.activeTab = tab;
      this.render(false);
    });

    // Crawler selection switch
    html.find('.dcc-crawler-select').change(ev => {
      const id = $(ev.currentTarget).val();
      const found = (typeof game !== 'undefined' && game.actors) ? game.actors.get(id) : null;
      if (found) {
        this.actor = found;
        this.render(false);
      }
    });

    // Tier filter
    html.find('.dcc-tier-select').change(ev => {
      this.selectedTier = $(ev.currentTarget).val();
      this.render(false);
    });

    // Search query input
    html.find('.dcc-search-input').on('input', ev => {
      this.searchQuery = $(ev.currentTarget).val();
      // Fast client-side filtering
      const q = this.searchQuery.toLowerCase().trim();
      html.find('.dcc-library-card').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (!q || text.includes(q)) {
          $(el).show();
        } else {
          $(el).hide();
        }
      });
    });

    // Grant Achievement to Selected Crawler
    html.find('.dcc-grant-achievement-btn').click(async ev => {
      ev.preventDefault();
      const achId = $(ev.currentTarget).data('achId');
      const all = this.getUnifiedAchievements();
      const targetAch = all.find(a => a.id === achId);
      if (!targetAch) return;

      const actorId = html.find('.dcc-crawler-select').val() || this.actor?.id;
      if (!actorId) {
        ui.notifications?.warn('Please select a Crawler to award this achievement to.');
        return;
      }

      await this.grantAchievement(actorId, targetAch);
    });

    // Announce achievement from Party tab
    html.find('.dcc-party-announce-btn').click(async ev => {
      ev.preventDefault();
      const actorId = $(ev.currentTarget).data('actorId');
      const itemId = $(ev.currentTarget).data('itemId');
      const actor = (typeof game !== 'undefined' && game.actors) ? game.actors.get(actorId) : null;
      if (actor && typeof actor.announceAchievement === 'function') {
        await actor.announceAchievement(itemId);
      }
    });

    // Delete achievement from Party tab
    html.find('.dcc-party-delete-btn').click(async ev => {
      ev.preventDefault();
      const actorId = $(ev.currentTarget).data('actorId');
      const itemId = $(ev.currentTarget).data('itemId');
      const actor = (typeof game !== 'undefined' && game.actors) ? game.actors.get(actorId) : null;
      if (!actor) return;

      const item = actor.items.get ? actor.items.get(itemId) : (actor.items || []).find(i => i.id === itemId);
      if (item && typeof item.delete === 'function') {
        await item.delete();
      } else if (Array.isArray(actor.items)) {
        actor.items = actor.items.filter(i => i.id !== itemId);
      }
      this.render(false);
    });
  }
}
