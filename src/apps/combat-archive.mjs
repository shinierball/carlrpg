/**
 * Dungeon Crawler Carl RPG — Archived Battles & Encounter History Application
 * 
 * Allows GMs and players to browse, inspect, and review finished combat encounters,
 * complete with round-by-round action timelines, MVP awards, and participant summaries.
 */

import { DCCCombat, DCC_ACTION_TYPES } from '../documents/combat.mjs';

const BaseApplication = typeof Application !== 'undefined' ? Application : (globalThis.Application || class {});

export class DCCCombatArchiveApp extends BaseApplication {
  constructor(options = {}) {
    super(options);
    this.selectedCombatId = options.combatId || null;
    this.selectedRound = options.round || 1;
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
      width: 740,
      height: 620,
      resizable: true,
      classes: ['dcc-sheet', 'dcc-archive-app']
    });
  }

  /**
   * Enrich archived encounters data for rendering.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async getData(options = {}) {
    const data = (typeof super.getData === 'function') ? await super.getData(options) : {};
    const combats = DCCCombat.getArchivedCombats() || [];

    if (!this.selectedCombatId && combats.length > 0) {
      this.selectedCombatId = combats[0].id;
    }

    const selectedCombat = combats.find(c => c.id === this.selectedCombatId) || combats[0] || null;

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
        const roundActions = currentRoundData[c.id] || c.actions || { max: 2, spent: 0, bonusActionGranted: false, hasAttacked: false, slots: [] };
        
        const slotList = [];
        for (let i = 0; i < (roundActions.max || 2); i++) {
          const slot = roundActions.slots?.[i] || null;
          slotList.push({
            index: i,
            isBonus: i >= 2,
            filled: Boolean(slot),
            label: slot ? slot.label : (i >= 2 ? 'Bonus Action' : `Action ${i + 1}`),
            icon: slot ? (slot.icon || 'fa-solid fa-circle-check') : 'fa-regular fa-circle',
            isAttack: Boolean(slot?.isAttack),
            isInterrupt: Boolean(slot?.isInterrupt)
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

    return {
      ...data,
      combats,
      hasCombats: combats.length > 0,
      selectedCombat,
      selectedRound: this.selectedRound,
      roundsList,
      mobCombatants,
      crawlerCombatants,
      isGM: Boolean(globalThis.game?.user?.isGM)
    };
  }

  /**
   * Activate DOM listeners for the archive application.
   * @param {jQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);
    const $html = (html instanceof jQuery) ? html : $(html);

    // 1. Select encounter from sidebar list
    $html.find('.dcc-archive-item').click(ev => {
      ev.preventDefault();
      const id = $(ev.currentTarget).data('combat-id');
      if (id && id !== this.selectedCombatId) {
        this.selectedCombatId = id;
        this.selectedRound = 1;
        this.render();
      }
    });

    // 2. Select round tab
    $html.find('.dcc-archive-round-btn').click(ev => {
      ev.preventDefault();
      const r = Number($(ev.currentTarget).data('round'));
      if (r && r !== this.selectedRound) {
        this.selectedRound = r;
        this.render();
      }
    });

    // 3. Post Encounter to Chat
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

    // 4. Delete archived encounter (GM only)
    $html.find('.dcc-archive-delete-btn').click(async ev => {
      ev.preventDefault();
      const id = $(ev.currentTarget).data('combat-id') || this.selectedCombatId;
      if (!id) return;

      const confirmed = globalThis.Dialog?.confirm
        ? await globalThis.Dialog.confirm({
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

    // 5. Clear all archived encounters (GM only)
    $html.find('.dcc-archive-clear-all-btn').click(async ev => {
      ev.preventDefault();
      const confirmed = globalThis.Dialog?.confirm
        ? await globalThis.Dialog.confirm({
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
  }
}
