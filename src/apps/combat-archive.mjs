/**
 * Dungeon Crawler Carl RPG — Archived Battles & Encounter History Application
 * 
 * Allows GMs and players to browse, inspect, and review finished combat encounters,
 * complete with round-by-round action timelines, MVP awards, and participant summaries.
 */

import { DCCCombat, DCC_ACTION_TYPES } from '../documents/combat.mjs';
import { DCCExperienceTracker } from './xp-tracker.mjs';
import { DCCBaseApplication } from './base-application.mjs';

const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog
  ?? globalThis.Dialog;

export class DCCCombatArchiveApp extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.selectedCombatId = options.combatId || null;
    this.selectedRound = options.round || 1;
    this.searchQuery = '';
    this.activeView = options.view || 'timeline';
    this.customXPWeights = null;
    this.customXPPool = null;
  }

  static get defaultOptions() {
    const options = super.defaultOptions || {};
    const merge = (typeof foundry !== 'undefined' && foundry?.utils?.mergeObject)
      ? foundry.utils.mergeObject
      : Object.assign;

    return merge(options, {
      id: 'dcc-combat-archive',
      template: 'systems/carl-rpg/templates/apps/combat-archive.hbs',
      title: 'Archived Battles & Encounter History',
      width: 860,
      height: 720,
      resizable: true,
      scrollY: ['.dcc-archive-content', '.dcc-archive-list'],
      classes: ['dcc-archive-app']
    });
  }

  /**
   * Enrich archived encounters data for rendering.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async getData(options = {}) {
    const data = (typeof super.getData === 'function') ? await super.getData(options) : {};

    // 1. Gather permanently archived combats
    const archivedCombats = (DCCCombat.getArchivedCombats() || []).map(c => ({
      ...c,
      isArchived: true,
      isLive: false
    }));

    // 2. Gather active or world encounters from game.combats that have not yet been archived
    const liveCombats = [];
    if (globalThis.game?.combats) {
      for (const c of globalThis.game.combats) {
        if (!archivedCombats.some(a => a.id === c.id)) {
          const scene = c.scene || (globalThis.game?.scenes?.get ? globalThis.game.scenes.get(c.sceneId) : null);
          const metrics = c.getFlag?.('carl-rpg', 'metrics') || c.flags?.['carl-rpg']?.metrics || {};
          const roundHistory = c.getFlag?.('carl-rpg', 'roundHistory') || c.flags?.['carl-rpg']?.roundHistory || {};

          const combatantsData = Array.from(c.combatants || []).map(con => {
            const actor = con.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(con.actorId) : null);
            const isMob = DCCCombat.isMobCombatant(con);
            return {
              id: con.id,
              name: con.name,
              actorId: con.actorId,
              img: con.img || actor?.img || 'icons/svg/mystery-man.svg',
              type: actor?.type || (isMob ? 'npc' : 'crawler'),
              isMob,
              hp: actor?.system?.attributes?.hp?.value ?? null,
              maxHp: actor?.system?.attributes?.hp?.max ?? null,
              actions: c.getCombatantActions ? c.getCombatantActions(con) : DCCCombat.getCombatantActions(con, c)
            };
          });

          liveCombats.push({
            id: c.id,
            name: c.name || (scene ? `${scene.name} Encounter` : 'Active Encounter'),
            timestamp: c.timestamp || Date.now(),
            dateString: new Date().toLocaleString(),
            sceneId: c.sceneId || null,
            sceneName: scene?.name || 'Unknown Scene',
            totalRounds: Math.max(1, c.round || 1),
            isSurpriseRound: Boolean(c.isSurpriseRound),
            combatants: combatantsData,
            roundHistory,
            metrics: {
              totalDamageDealt: metrics.totalDamageDealt || 0,
              mvp: metrics.mvp || null,
              awards: metrics.awards || [],
              events: metrics.events || []
            },
            isArchived: false,
            isLive: true
          });
        }
      }
    }

    // Combined combats list sorted by most recent
    const allCombats = [...archivedCombats, ...liveCombats].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Filter by search query if any
    let combats = allCombats;
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      combats = allCombats.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.dateString && c.dateString.toLowerCase().includes(q))
      );
    }

    // Default to first combat if none selected or selected doesn't exist
    if (!this.selectedCombatId && combats.length > 0) {
      this.selectedCombatId = combats[0].id;
    } else if (this.selectedCombatId && !combats.some(c => c.id === this.selectedCombatId)) {
      this.selectedCombatId = combats[0]?.id || null;
    }

    const selectedCombat = allCombats.find(c => c.id === this.selectedCombatId) || combats[0] || null;
    const selectedIndex = combats.findIndex(c => c.id === (selectedCombat?.id));
    const prevCombat = selectedIndex > 0 ? combats[selectedIndex - 1] : null;
    const nextCombat = (selectedIndex >= 0 && selectedIndex < combats.length - 1) ? combats[selectedIndex + 1] : null;

    let roundsList = [];
    let mobCombatants = [];
    let crawlerCombatants = [];

    if (selectedCombat) {
      const totalRounds = Math.max(1, Number(selectedCombat.totalRounds) || 1);
      this.selectedRound = Math.max(1, Math.min(this.selectedRound, totalRounds));

      for (let r = 1; r <= totalRounds; r++) {
        roundsList.push({
          round: r,
          active: r === this.selectedRound
        });
      }

      const currentRoundData = selectedCombat.roundHistory?.[this.selectedRound] || {};
      const combatants = selectedCombat.combatants || [];

      for (const c of combatants) {
        let roundActions = currentRoundData[c.id];
        if (!roundActions && this.selectedRound === selectedCombat.totalRounds) {
          roundActions = c.actions;
        }
        roundActions = roundActions || { max: 2, spent: 0, bonusActionGranted: false, hasAttacked: false, slots: [] };
        
        const slotList = [];
        for (let i = 0; i < (roundActions.max || 2); i++) {
          const slot = roundActions.slots?.[i] || null;
          const typeDef = slot?.type ? DCC_ACTION_TYPES[slot.type] : null;
          slotList.push({
            index: i,
            isBonus: i >= 2,
            filled: Boolean(slot),
            label: slot ? (slot.label || slot.name || typeDef?.label || 'Action') : (i >= 2 ? 'Bonus Action (Unused)' : `Action ${i + 1} (Unused)`),
            icon: slot ? (slot.icon || typeDef?.icon || 'fa-solid fa-circle-check') : 'fa-regular fa-circle',
            isAttack: Boolean(slot?.isAttack || typeDef?.isAttack),
            isInterrupt: Boolean(slot?.isInterrupt || typeDef?.isInterrupt)
          });
        }

        const enriched = {
          ...c,
          roundActions,
          slotList,
          remainingActions: Math.max(0, (roundActions.max || 2) - (roundActions.spent || 0))
        };

        if (c.isMob) {
          mobCombatants.push(enriched);
        } else {
          crawlerCombatants.push(enriched);
        }
      }
    }

    const xpSummary = selectedCombat
      ? DCCExperienceTracker.calculateEncounterXP(selectedCombat, {
          customWeights: this.customXPWeights,
          customPool: this.customXPPool
        })
      : null;

    return {
      ...data,
      combats,
      allCombats,
      hasCombats: combats.length > 0,
      selectedCombat,
      selectedIndex,
      prevCombat,
      nextCombat,
      selectedRound: this.selectedRound,
      roundsList,
      mobCombatants,
      crawlerCombatants,
      searchQuery: this.searchQuery,
      activeView: this.activeView,
      xpSummary,
      customXPWeights: this.customXPWeights || xpSummary?.weights,
      customXPPool: this.customXPPool ?? xpSummary?.totalPool,
      isGM: Boolean(globalThis.game?.user?.isGM)
    };
  }

  /**
   * Activate DOM listeners for the archive application.
   * @param {jQuery} html
   */
  activateListeners(html) {
    if (typeof super.activateListeners === 'function') {
      super.activateListeners(html);
    }
    const $html = (typeof jQuery !== 'undefined' && html instanceof jQuery) ? html : $(html);

    // 1. Dropdown Combat Selector
    $html.find('.dcc-archive-combat-select').change(ev => {
      const id = ev.target.value;
      if (id && id !== this.selectedCombatId) {
        this.selectedCombatId = id;
        this.selectedRound = 1;
        this.render();
      }
    });

    // 2. Previous / Next Combat Navigation Buttons
    $html.find('.dcc-archive-nav-btn.prev-combat').click(ev => {
      ev.preventDefault();
      const prevId = $(ev.currentTarget).data('combat-id');
      if (prevId) {
        this.selectedCombatId = prevId;
        this.selectedRound = 1;
        this.render();
      }
    });

    $html.find('.dcc-archive-nav-btn.next-combat').click(ev => {
      ev.preventDefault();
      const nextId = $(ev.currentTarget).data('combat-id');
      if (nextId) {
        this.selectedCombatId = nextId;
        this.selectedRound = 1;
        this.render();
      }
    });

    // 3. Select encounter from sidebar list
    $html.find('.dcc-archive-item').click(ev => {
      ev.preventDefault();
      const id = $(ev.currentTarget).data('combat-id');
      if (id && id !== this.selectedCombatId) {
        this.selectedCombatId = id;
        this.selectedRound = 1;
        this.render();
      }
    });

    // 4. Search Filter Input
    $html.find('.dcc-archive-search').on('input', ev => {
      this.searchQuery = ev.target.value || '';
      const query = this.searchQuery.trim().toLowerCase();
      $html.find('.dcc-archive-item').each((i, el) => {
        const $el = $(el);
        const name = ($el.find('.dcc-archive-item-name').text() || '').toLowerCase();
        const date = ($el.find('.dcc-archive-item-date').text() || '').toLowerCase();
        const matches = !query || name.includes(query) || date.includes(query);
        $el.toggle(matches);
      });
    });

    // 5. Select round tab
    $html.find('.dcc-archive-round-btn').click(ev => {
      ev.preventDefault();
      const r = Number($(ev.currentTarget).data('round'));
      if (r && r !== this.selectedRound) {
        this.selectedRound = r;
        this.render();
      }
    });

    // 6. Save Active Combat to Permanent Archive
    $html.find('.dcc-archive-save-live-btn').click(async ev => {
      ev.preventDefault();
      const liveCombat = (globalThis.game?.combats || []).find(c => c.id === this.selectedCombatId);
      if (liveCombat && typeof liveCombat.archiveCombat === 'function') {
        await liveCombat.archiveCombat();
        ui.notifications?.info(`DCC RPG | Saved ${liveCombat.name || 'Encounter'} to permanent archive.`);
        this.render();
      }
    });

    // 7. Post Encounter to Chat
    $html.find('.dcc-archive-chat-btn').click(async ev => {
      ev.preventDefault();
      const combats = DCCCombat.getArchivedCombats();
      const combat = combats.find(c => c.id === this.selectedCombatId);
      if (!combat) return;

      const mvpText = combat.metrics?.mvp?.name ? `🎖️ <strong>Encounter MVP:</strong> ${combat.metrics.mvp.name}<br>` : '';
      const awardsText = (combat.metrics?.awards || []).map(a => `• <strong>${a.title}</strong>: ${a.recipient}`).join('<br>');
      const awardsHtml = awardsText ? `<div style="margin-top: 4px; font-size: 11px;">${awardsText}</div>` : '';

      const content = `
        <div style="border: 1.5px solid #c0392b; background: #fffdfd; padding: 8px 10px; border-radius: 4px; font-family: 'Oswald', sans-serif;">
          <div style="font-weight: bold; color: #c0392b; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            <i class="fa-solid fa-book-skull"></i> Archived Encounter: ${combat.name}
          </div>
          <div style="font-size: 11px; color: #555; margin-top: 4px;">
            <strong>Date:</strong> ${combat.dateString || new Date(combat.timestamp).toLocaleString()} | <strong>Duration:</strong> ${combat.totalRounds} Rounds
          </div>
          <div style="font-size: 12px; color: #222; margin-top: 6px;">
            ${mvpText}
            ${combat.metrics?.totalDamageDealt ? `💥 <strong>Total Damage:</strong> ${combat.metrics.totalDamageDealt} HP<br>` : ''}
            👥 <strong>Participants:</strong> ${combat.combatants.map(c => c.name).join(', ')}
          </div>
          ${awardsHtml}
        </div>
      `;

      if (globalThis.ChatMessage?.create) {
        await globalThis.ChatMessage.create({
          speaker: { alias: 'Dungeon AI System' },
          content
        });
        ui.notifications?.info(`DCC RPG | Posted ${combat.name} summary to chat.`);
      }
    });

    // 8. Delete archived encounter (GM only)
    $html.find('.dcc-archive-delete-btn').click(async ev => {
      ev.preventDefault();
      const id = $(ev.currentTarget).data('combat-id') || this.selectedCombatId;
      if (!id) return;

      const confirmed = DialogClass?.confirm
        ? await DialogClass.confirm({
            title: 'Delete Archived Combat',
            content: '<p>Are you sure you want to permanently delete this archived combat record?</p>'
          })
        : true;

      if (confirmed) {
        await DCCCombat.deleteArchivedCombat(id);
        const remaining = DCCCombat.getArchivedCombats();
        this.selectedCombatId = remaining[0]?.id || null;
        this.selectedRound = 1;
        this.render();
        ui.notifications?.info('DCC RPG | Archived battle deleted.');
      }
    });

    // 9. Clear all archived encounters (GM only)
    $html.find('.dcc-archive-clear-all-btn').click(async ev => {
      ev.preventDefault();
      const confirmed = DialogClass?.confirm
        ? await DialogClass.confirm({
            title: 'Clear All Archived Combats',
            content: '<p>Are you sure you want to permanently delete <strong>ALL</strong> archived combats in this world?</p>'
          })
        : true;

      if (confirmed) {
        await DCCCombat.clearArchivedCombats();
        this.selectedCombatId = null;
        this.selectedRound = 1;
        this.render();
        ui.notifications?.info('DCC RPG | Cleared all archived battles.');
      }
    });

    // 10. View Mode Tab Switching (Timeline vs Experience)
    $html.find('.dcc-archive-tab-btn').click(ev => {
      ev.preventDefault();
      const view = $(ev.currentTarget).data('view');
      if (view && view !== this.activeView) {
        this.activeView = view;
        this.render();
      }
    });

    // 11. Custom XP Pool Input Change
    $html.find('.dcc-xp-pool-input').change(ev => {
      const val = Number(ev.target.value);
      this.customXPPool = Number.isFinite(val) && val >= 0 ? val : null;
      this.render();
    });

    // 12. Weight Input Changes
    $html.find('.dcc-xp-weight-input').change(ev => {
      const key = $(ev.currentTarget).data('weight-key');
      const val = Math.max(0, Number(ev.target.value) || 0);
      this.customXPWeights = this.customXPWeights || { ...DCCExperienceTracker.getXPConfig() };
      this.customXPWeights[key] = val;
      this.render();
    });

    // 13. Reset XP Weights to Default
    $html.find('.dcc-xp-reset-weights-btn').click(async ev => {
      ev.preventDefault();
      this.customXPWeights = null;
      this.customXPPool = null;
      this.render();
    });

    // 14. Save Current XP Weights as Global Defaults
    $html.find('.dcc-xp-save-defaults-btn').click(async ev => {
      ev.preventDefault();
      if (this.customXPWeights) {
        await DCCExperienceTracker.saveXPConfig(this.customXPWeights);
        if (globalThis.ui?.notifications?.info) {
          globalThis.ui.notifications.info('DCC RPG | Saved custom XP weights as system defaults.');
        }
      }
    });

    // 15. Award Experience to Crawlers
    $html.find('.dcc-archive-award-xp-btn').click(async ev => {
      ev.preventDefault();
      if (!this.selectedCombatId) return;
      try {
        await DCCExperienceTracker.awardEncounterXP(this.selectedCombatId, {
          customWeights: this.customXPWeights,
          customPool: this.customXPPool
        });
        if (globalThis.ui?.notifications?.info) {
          globalThis.ui.notifications.info('DCC RPG | Experience awarded to crawlers.');
        }
        this.render();
      } catch (err) {
        if (globalThis.ui?.notifications?.warn) {
          globalThis.ui.notifications.warn(err.message);
        }
      }
    });

    // 16. Undo Experience Award
    $html.find('.dcc-archive-undo-xp-btn').click(async ev => {
      ev.preventDefault();
      if (!this.selectedCombatId) return;
      try {
        await DCCExperienceTracker.undoAwardEncounterXP(this.selectedCombatId);
        this.render();
      } catch (err) {
        if (globalThis.ui?.notifications?.warn) {
          globalThis.ui.notifications.warn(err.message);
        }
      }
    });
  }
}
