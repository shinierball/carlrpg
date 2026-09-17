/**
 * Dungeon Crawler Carl RPG — Custom Combat Tracker Sidebar Application
 * 
 * Features:
 * - Phase-based display: Mobs First, Crawlers Second (or Crawler Surprise Phase first).
 * - Surprise Round toggle button.
 * - Action tracking per combatant (2 base actions per round, Mob 1-attack validation, Crawler AI Favor bonus).
 * - Health threshold indicators (Green: 100%-66%, Yellow: 66%-33%, Red: 33%-0%).
 * - Cheat sheet action menu and quick action logging.
 */

import { DCCCombat, DCC_ACTION_TYPES } from '../documents/combat.mjs';
import { DCCCombatMetricsApp } from './combat-metrics.mjs';
import { DCCCombatArchiveApp } from './combat-archive.mjs';

const BaseCombatTracker = globalThis.foundry?.appv1?.sidebar?.tabs?.CombatTracker
  ?? globalThis.CombatTracker
  ?? class {};

export class DCCCombatTracker extends BaseCombatTracker {
  constructor(options = {}) {
    super(options);
    this.viewedRound = null;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    const merge = (typeof foundry !== 'undefined' && foundry?.utils?.mergeObject)
      ? foundry.utils.mergeObject
      : Object.assign;
    return merge(options, {
      id: 'combat',
      template: 'systems/carl-rpg/templates/apps/combat-tracker.hbs',
      title: 'Combat Tracker',
      scrollY: ['.directory-list', '.dcc-combat-list'],
      classes: [...(options.classes || []), 'dcc-combat-tracker-app']
    });
  }

  /**
   * Enrich combat data for CarlRPG custom display.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async getData(options = {}) {
    const data = await super.getData(options);
    const combat = data?.combat || this.viewed || globalThis.game?.combat;

    if (!combat) {
      return {
        ...data,
        isCarlCombat: false,
        actionTypes: Object.values(DCC_ACTION_TYPES)
      };
    }

    const isSurpriseRound = Boolean(combat?.isSurpriseRound);
    const activeRound = Number(combat.round) || 1;
    if (!this.viewedRound || this.viewedRound > activeRound) {
      this.viewedRound = activeRound;
    }
    const viewedRound = Math.max(1, Math.min(this.viewedRound, activeRound));
    this.viewedRound = viewedRound;
    const isViewingHistory = viewedRound !== activeRound;

    const mobTurns = [];
    const crawlerTurns = [];

    // Process each turn / combatant
    const turns = (data.turns && data.turns.length) ? data.turns : (combat.combatants ? Array.from(combat.combatants) : []);

    for (const turn of turns) {
      const combatant = combat.combatants.get ? combat.combatants.get(turn.id) : (combat.combatants.find ? combat.combatants.find(c => c.id === turn.id) : turn);
      if (!combatant) continue;

      const actor = combatant.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(combatant.actorId) : null);
      const isMob = DCCCombat.isMobCombatant(combatant);
      const healthThreshold = DCCCombat.getHealthThreshold(actor);
      const actions = combat.getCombatantActions ? combat.getCombatantActions(combatant, viewedRound) : { max: 2, spent: 0, bonusActionGranted: false, hasAttacked: false, slots: [] };

      // Precompute slots array for Handlebars rendering
      const slotList = [];
      for (let i = 0; i < actions.max; i++) {
        const slotData = actions.slots[i] || null;
        slotList.push({
          index: i,
          isBonus: i >= 2,
          filled: Boolean(slotData),
          action: slotData,
          label: slotData ? slotData.label : (i >= 2 ? 'Bonus Action' : `Action ${i + 1}`),
          icon: slotData ? slotData.icon : 'fa-regular fa-circle',
          isAttack: Boolean(slotData?.isAttack)
        });
      }

      const remainingActions = Math.max(0, actions.max - actions.spent);
      const canAttack = isMob ? !actions.hasAttacked : true;
      const currentFavor = Number(actor?.system?.attributes?.aiFavor) || 0;
      const canSpendAIFavor = !isMob && !actions.bonusActionGranted && currentFavor >= 1;

      const enrichedTurn = {
        ...turn,
        combatant,
        actor,
        isMob,
        healthThreshold,
        actions,
        slotList,
        remainingActions,
        isComplete: remainingActions <= 0,
        canAttack,
        currentFavor,
        canSpendAIFavor,
        actorTypeLabel: isMob ? 'MOB' : (actor?.type?.toUpperCase() || 'CRAWLER')
      };

      if (isMob) {
        mobTurns.push(enrichedTurn);
      } else {
        crawlerTurns.push(enrichedTurn);
      }
    }

    // Determine phase order based on Surprise Round
    let phases = [];
    if (isSurpriseRound) {
      phases = [
        {
          id: 'crawlers',
          name: 'Crawler Surprise Phase',
          icon: 'fa-solid fa-bolt',
          isMob: false,
          isSurprise: true,
          badge: 'AMBUSH ACTIVE',
          subtitle: 'Crawlers Act First & Coordinate In Any Order',
          turns: crawlerTurns,
          count: crawlerTurns.length
        },
        {
          id: 'mobs',
          name: 'Mob Phase',
          icon: 'fa-solid fa-skull',
          isMob: true,
          isSurprise: false,
          badge: 'SECOND',
          subtitle: 'Hostiles Act Second (Max 1 Attack Per Mob)',
          turns: mobTurns,
          count: mobTurns.length
        }
      ];
    } else {
      phases = [
        {
          id: 'mobs',
          name: 'Mob Phase',
          icon: 'fa-solid fa-skull',
          isMob: true,
          isSurprise: false,
          badge: 'FIRST',
          subtitle: 'Hostiles Act First (Max 1 Attack Per Mob)',
          turns: mobTurns,
          count: mobTurns.length
        },
        {
          id: 'crawlers',
          name: 'Crawler Phase',
          icon: 'fa-solid fa-shield-halved',
          isMob: false,
          isSurprise: false,
          badge: 'SECOND',
          subtitle: 'Crawlers Act Second & Coordinate In Any Order',
          turns: crawlerTurns,
          count: crawlerTurns.length
        }
      ];
    }

    return {
      ...data,
      isCarlCombat: true,
      combat,
      round: activeRound,
      viewedRound,
      isViewingHistory,
      canStepPrev: viewedRound > 1,
      canStepNext: viewedRound < activeRound,
      isSurpriseRound,
      phases,
      mobCount: mobTurns.length,
      crawlerCount: crawlerTurns.length,
      totalCount: mobTurns.length + crawlerTurns.length,
      actionTypes: Object.values(DCC_ACTION_TYPES)
    };
  }

  /**
   * Activate interactive listeners for the custom combat tracker.
   * @param {jQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);
    const $html = (html instanceof jQuery) ? html : $(html);

    // 1. Surprise Round Toggle Button
    $html.find('.dcc-surprise-toggle').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;
      if (!globalThis.game?.user?.isGM) {
        ui.notifications?.warn('Only the GM can toggle Surprise Rounds.');
        return;
      }
      await combat.toggleSurpriseRound();
      this.render();
    });

    // 2. Round Stepper Navigation (History Mode)
    $html.find('.dcc-step-round-btn.prev-round').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;
      const cur = this.viewedRound || combat.round || 1;
      if (cur > 1) {
        this.viewedRound = cur - 1;
        this.render();
      }
    });

    $html.find('.dcc-step-round-btn.next-round').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;
      const maxR = combat.round || 1;
      const cur = this.viewedRound || maxR;
      if (cur < maxR) {
        this.viewedRound = cur + 1;
        this.render();
      }
    });

    $html.find('.dcc-return-live-btn').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combat = this.viewed || globalThis.game?.combat;
      this.viewedRound = combat?.round || 1;
      this.render();
    });

    // 3. Reset Round Actions Button
    $html.find('.dcc-reset-round-actions-btn').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;
      await combat.resetRoundActions();
      this.render();
      ui.notifications?.info('DCC RPG | Reset round action budgets for all combatants.');
    });

    // 4. Open AI Combat Awards Dashboard
    $html.find('.dcc-combat-awards-btn').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      new DCCCombatMetricsApp().render(true);
    });

    // 5. Open Archived Battles & Encounter History
    $html.find('.dcc-combat-archive-btn').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      new DCCCombatArchiveApp().render(true);
    });

    // 6. Action Pip Click: Direct toggle between Used and Unused (right-click to choose specific action)
    $html.find('.dcc-action-pip').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const pip = $(ev.currentTarget);
      const combatantId = pip.data('combatant-id');
      const slotIndex = Number(pip.data('slot-index')) || 0;
      const isFilled = pip.hasClass('pip-filled');
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;

      const targetRound = this.viewedRound || combat.round || 1;

      if (isFilled) {
        await combat.clearCombatantAction(combatantId, slotIndex, { round: targetRound });
      } else {
        const c = combat.combatants?.get ? combat.combatants.get(combatantId) : null;
        const isMob = DCCCombat.isMobCombatant(c);
        await combat.recordCombatantAction(combatantId, {
          type: isMob ? 'move' : 'check',
          slotIndex,
          label: isMob ? 'Mob Action' : 'Crawler Action'
        }, { round: targetRound });
      }
      this.render();
    }).on('contextmenu', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const pip = $(ev.currentTarget);
      const row = pip.closest('.dcc-combatant-row');
      const menu = row.find('.dcc-action-picker-popover');
      const slotIndex = Number(pip.data('slot-index')) || 0;

      $html.find('.dcc-action-picker-popover').not(menu).hide();
      menu.data('slot-index', slotIndex);
      menu.toggle();
    });

    // Action budget counter click: quick toggle next action
    $html.find('.dcc-action-budget-counter').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combatantId = $(ev.currentTarget).data('combatant-id');
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;

      const targetRound = this.viewedRound || combat.round || 1;
      const c = combat.combatants?.get ? combat.combatants.get(combatantId) : null;
      const actions = combat.getCombatantActions(c, targetRound);
      const isMob = DCCCombat.isMobCombatant(c);

      if (actions.spent < actions.max) {
        await combat.recordCombatantAction(combatantId, {
          type: isMob ? 'move' : 'check',
          label: isMob ? 'Mob Action' : 'Crawler Action'
        }, { round: targetRound });
      } else {
        for (let s = 0; s < actions.max; s++) {
          await combat.clearCombatantAction(combatantId, s, { round: targetRound });
        }
      }
      this.render();
    });

    // 7. Select Action Option from Menu
    $html.find('.dcc-action-option').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const opt = $(ev.currentTarget);
      const popover = opt.closest('.dcc-action-picker-popover');
      const combatantId = popover.data('combatant-id');
      const slotIndex = Number(popover.data('slot-index')) || 0;
      const actionType = opt.data('action-type');

      popover.hide();

      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;

      const targetRound = this.viewedRound || combat.round || 1;
      const res = await combat.recordCombatantAction(combatantId, {
        type: actionType,
        slotIndex
      }, { round: targetRound });

      if (res && res.success) {
        this.render();
      }
    });

    // 8. Clear Action Slot
    $html.find('.dcc-action-clear-opt').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const opt = $(ev.currentTarget);
      const popover = opt.closest('.dcc-action-picker-popover');
      const combatantId = popover.data('combatant-id');
      const slotIndex = Number(popover.data('slot-index')) || 0;

      popover.hide();

      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;

      const targetRound = this.viewedRound || combat.round || 1;
      await combat.clearCombatantAction(combatantId, slotIndex, { round: targetRound });
      this.render();
    });

    // 9. Spend AI Favor Bonus Action Button
    $html.find('.dcc-spend-favor-btn').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const btn = $(ev.currentTarget);
      const combatantId = btn.data('combatant-id');
      const combat = this.viewed || globalThis.game?.combat;
      if (!combat) return;

      const res = await combat.spendAIFavorBonusAction(combatantId);
      if (res && res.success) {
        this.render();
      }
    });

    // Close open action menus when clicking anywhere else
    $(document).off('click.dccCombatTracker').on('click.dccCombatTracker', () => {
      $html.find('.dcc-action-picker-popover').hide();
    });
  }
}
