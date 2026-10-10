/**
 * Dungeon Crawler Carl RPG — Custom Combat Document
 * 
 * Rules:
 * - Default Turn Order: Mobs act first in combat, Crawlers act second.
 * - Surprise Round: Crawlers act first if surprise is active (rare).
 * - Action Budget:
 *   - Mobs get 2 actions per round: max 1 Attack action; the other must be Move, non-attack skill, etc.
 *   - Crawlers get 2 actions per round base; can spend 1 AI Favor once per round for +1 non-Attack Action.
 * - Auto-initiative assignment without d20 dice rolls.
 * - Health Thresholds: Green (100%-66%), Yellow (66%-33%), Red (33%-0%).
 */

const BaseCombat = CONFIG.Combat?.documentClass
  ?? globalThis.foundry?.documents?.BaseCombat
  ?? globalThis.Combat
  ?? class {};
const deepClone = (obj) => {
  if (typeof foundry !== 'undefined' && foundry?.utils?.deepClone) {
    return foundry.utils.deepClone(obj);
  }
  return structuredClone(obj);
};

export const DCC_ACTION_TYPES = {
  // Standard Actions
  attack: { id: 'attack', label: 'Attack', category: 'damage', icon: 'fa-solid fa-burst', isAttack: true, desc: 'Perform Attack Skill Check against target; roll damage on Success.' },
  move: { id: 'move', label: 'Move', category: 'utility', icon: 'fa-solid fa-person-walking', isAttack: false, desc: 'Move up to full Move distance (default 20ft + 10ft Step).' },
  cast: { id: 'cast', label: 'Cast Spell', category: 'tactical', icon: 'fa-solid fa-wand-magic-sparkles', isAttack: false, desc: 'Cast a Spell or scroll from Hotlist.' },
  check: { id: 'check', label: 'Make Check', category: 'utility', icon: 'fa-solid fa-dice-d20', isAttack: false, desc: 'Perform a Skill Check or Stat Check.' },
  item: { id: 'item', label: 'Use Item', category: 'utility', icon: 'fa-solid fa-flask', isAttack: false, desc: 'Use a prepared consumable or ready another Hotlist Item.' },
  retrieve: { id: 'retrieve', label: 'Retrieve', category: 'utility', icon: 'fa-solid fa-box-open', isAttack: false, desc: 'Move an item from Inventory into Hotlist or hand.' },
  help: { id: 'help', label: 'Help', category: 'buff', icon: 'fa-solid fa-handshake-angle', isAttack: false, desc: 'Aid another crawler on a non-combat Skill Check.' },
  play: { id: 'play', label: 'Call a Play', category: 'tactical', icon: 'fa-solid fa-clipboard-list', isAttack: false, desc: 'Plan an Action, granting an ally a bonus when executed.' },
  clues: { id: 'clues', label: 'Look for Clues', category: 'tactical', icon: 'fa-solid fa-magnifying-glass', isAttack: false, desc: 'Gain tactical info on a Boss or environment.' },
  
  // Interrupts
  evade: { id: 'evade', label: 'Evade', category: 'defensive', icon: 'fa-solid fa-shield-halved', isAttack: false, isInterrupt: true, desc: 'Attempt to avoid incoming attacks for the rest of the round.' },
  heal: { id: 'heal', label: 'Heal', category: 'buff', icon: 'fa-solid fa-heart-pulse', isAttack: false, isInterrupt: true, desc: 'Use a Spell or item to restore Health.' },
  taunt: { id: 'taunt', label: 'Taunt', category: 'defensive', icon: 'fa-solid fa-bullhorn', isAttack: false, isInterrupt: true, desc: "Redirect a Mob's attack from an ally to yourself." },
  catcher: { id: 'catcher', label: 'Catcher', category: 'defensive', icon: 'fa-solid fa-person-falling-burst', isAttack: false, isInterrupt: true, desc: 'Take a hit meant for an ally.' },
  intervene: { id: 'intervene', label: 'Intervene', category: 'tactical', icon: 'fa-solid fa-user-shield', isAttack: false, isInterrupt: true, desc: "Aid an ally's Skill Check (+1d6 added after they roll)." },
  
  // Other
  other: { id: 'other', label: 'Other Action', category: 'utility', icon: 'fa-solid fa-ellipsis', isAttack: false, desc: 'Custom or non-standard action.' }
};

export class DCCCombat extends BaseCombat {
  /**
   * Determine if a combatant belongs to the Mob side (NPCs / Hostiles)
   * or the Crawler side (Crawlers, companion pets, allied vehicles).
   * @param {Combatant} combatant
   * @returns {boolean}
   */
  static isMobCombatant(combatant) {
    if (!combatant) return true;
    const actor = combatant.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(combatant.actorId) : null);
    if (actor) {
      if (actor.type === 'crawler') return false;
      if (actor.type === 'pet') return false;
      if (actor.type === 'mount_vehicle') {
        const disp = combatant.token?.disposition;
        return disp !== undefined && disp !== null ? disp < 0 : false;
      }
      if (actor.type === 'npc') return true;
    }
    const tokenDisp = combatant.token?.disposition;
    if (tokenDisp !== undefined && tokenDisp !== null) {
      return tokenDisp <= 0;
    }
    return true;
  }

  /**
   * Calculate health threshold category according to cheat sheet HUD reference:
   * - Green: 100% to 66% Health
   * - Yellow: 66% to 33% Health
   * - Red: 33% to 0% Health
   * @param {Actor} actor
   * @returns {object}
   */
  static getHealthThreshold(actor) {
    if (!actor) return { status: 'red', label: '0%', color: '#c0392b', pct: 0 };
    const curHp = Number(actor.system?.attributes?.hp?.value) ?? 0;
    const maxHp = Number(actor.system?.attributes?.hp?.max) || 1;
    const pct = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));

    if (pct >= 66) {
      return { status: 'green', label: `${pct}%`, color: '#27ae60', pct };
    } else if (pct >= 33) {
      return { status: 'yellow', label: `${pct}%`, color: '#f39c12', pct };
    } else {
      return { status: 'red', label: `${pct}%`, color: '#c0392b', pct };
    }
  }

  /**
   * Is this encounter currently in a surprise round?
   * @type {boolean}
   */
  get isSurpriseRound() {
    return Boolean(this.getFlag?.('carl-rpg', 'isSurpriseRound') || this.flags?.['carl-rpg']?.isSurpriseRound);
  }

  /**
   * Toggle or set the surprise round state.
   * In CarlRPG, surprise rounds reverse turn order: Crawlers act first, Mobs act second.
   * @param {boolean|null} [state=null]
   * @returns {Promise<DCCCombat>}
   */
  async toggleSurpriseRound(state = null) {
    const nextState = state !== null ? Boolean(state) : !this.isSurpriseRound;
    await this.setFlag('carl-rpg', 'isSurpriseRound', nextState);
    await this.assignPhaseInitiative();
    return this;
  }

  /**
   * Assign phase-based initiative values to all combatants without rolling dice.
   * Normal round: Mobs = 20, Crawlers = 10.
   * Surprise round: Crawlers = 20, Mobs = 10.
   */
  async assignPhaseInitiative() {
    const isSurprise = this.isSurpriseRound;
    const updates = [];

    for (const c of (this.combatants || [])) {
      const isMob = DCCCombat.isMobCombatant(c);
      // Primary phase gets initiative 20; secondary gets 10
      const init = isSurprise ? (isMob ? 10 : 20) : (isMob ? 20 : 10);
      updates.push({ _id: c.id, initiative: init });
      c.initiative = init;
    }

    if (updates.length && this.updateEmbeddedDocuments) {
      await this.updateEmbeddedDocuments('Combatant', updates);
    }
  }

  /**
   * Override rollInitiative to assign phase-based initiative without random d20 dice rolls.
   * @param {string|string[]} ids
   * @param {object} [options={}]
   * @returns {Promise<DCCCombat>}
   */
  async rollInitiative(ids, options = {}) {
    const targetIds = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    const isSurprise = this.isSurpriseRound;
    const updates = [];

    for (const c of (this.combatants || [])) {
      if (targetIds.length && !targetIds.includes(c.id)) continue;
      const isMob = DCCCombat.isMobCombatant(c);
      const init = isSurprise ? (isMob ? 10 : 20) : (isMob ? 20 : 10);
      updates.push({ _id: c.id, initiative: init });
      c.initiative = init;
    }

    if (updates.length && this.updateEmbeddedDocuments) {
      await this.updateEmbeddedDocuments('Combatant', updates);
    }
    return this;
  }

  constructor(...args) {
    super(...args);
    this._sortCombatants = this._sortCombatants.bind(this);
  }

  /** @override */
  async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    if (typeof super._onCreateDescendantDocuments === 'function') {
      await super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
    }
    if (collection === 'Combatant') {
      await this.assignPhaseInitiative();
    }
  }

  /** @override */
  setupTurns() {
    this._sortCombatants = this._sortCombatants.bind(this);
    return super.setupTurns();
  }

  /**
   * Sort combatants by phase:
   * - Default Order: Mobs act first, Crawlers act second.
   * - Surprise Exception: Crawlers act first, Mobs act second.
   * - Within side: sort by unspent actions first, then name.
   */
  _sortCombatants(a, b) {
    const combat = (this && typeof this.isSurpriseRound !== 'undefined')
      ? this
      : (a?.combat || a?.parent || b?.combat || b?.parent || globalThis.game?.combat || null);
    const isSurprise = Boolean(combat?.isSurpriseRound);
    const aIsMob = DCCCombat.isMobCombatant(a);
    const bIsMob = DCCCombat.isMobCombatant(b);

    // Group priority: 1 for active phase, 2 for second phase
    const aPriority = isSurprise ? (aIsMob ? 2 : 1) : (aIsMob ? 1 : 2);
    const bPriority = isSurprise ? (bIsMob ? 2 : 1) : (bIsMob ? 1 : 2);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Within same group: prioritize combatants with remaining actions
    const aActions = DCCCombat.getCombatantActions(a, combat);
    const bActions = DCCCombat.getCombatantActions(b, combat);
    const aRemaining = (aActions.max - aActions.spent);
    const bRemaining = (bActions.max - bActions.spent);

    if (aRemaining !== bRemaining) {
      return bRemaining - aRemaining; // More actions remaining first
    }

    // Final fallback: alphabetical by name, then ID
    const nameDiff = (a?.name || '').localeCompare(b?.name || '');
    if (nameDiff !== 0) return nameDiff;
    return (a?.id || '').localeCompare(b?.id || '');
  }

  /**
   * Retrieve action tracking data for a combatant (static helper).
   * Supports retrieving active actions or past round actions from history.
   * @param {Combatant|string} combatantOrId
   * @param {Combat|null} [combat=null]
   * @param {number|null} [round=null]
   * @returns {object}
   */
  static getCombatantActions(combatantOrId, combat = null, round = null) {
    let c = null;
    let combatDoc = combat;
    if (combatantOrId && typeof combatantOrId === 'object') {
      c = combatantOrId;
      combatDoc = combat || c.combat || c.parent || globalThis.game?.combat || null;
    } else if (combat && typeof combatantOrId === 'string') {
      c = combat.combatants?.get ? combat.combatants.get(combatantOrId) : (combat.combatants?.find ? combat.combatants.find(con => con.id === combatantOrId) : null);
    }

    const cId = c?.id || (typeof combatantOrId === 'string' ? combatantOrId : null);
    const activeRound = combatDoc?.round || 1;
    const targetRound = Number(round) || activeRound;

    // If querying a past round from history
    if (combatDoc && targetRound !== activeRound) {
      const history = combatDoc.getFlag?.('carl-rpg', 'roundHistory') || combatDoc.flags?.['carl-rpg']?.roundHistory || {};
      const savedRound = history[targetRound]?.[cId];
      if (savedRound) {
        return {
          max: savedRound.max ?? 2,
          spent: savedRound.spent ?? 0,
          bonusActionGranted: Boolean(savedRound.bonusActionGranted),
          hasAttacked: Boolean(savedRound.hasAttacked),
          slots: Array.isArray(savedRound.slots) ? savedRound.slots : []
        };
      }
      return {
        max: 2,
        spent: 0,
        bonusActionGranted: false,
        hasAttacked: false,
        slots: []
      };
    }

    const saved = c?.getFlag?.('carl-rpg', 'actions') || c?.flags?.['carl-rpg']?.actions || null;

    if (saved) {
      return {
        max: saved.max ?? 2,
        spent: saved.spent ?? 0,
        bonusActionGranted: Boolean(saved.bonusActionGranted),
        hasAttacked: Boolean(saved.hasAttacked),
        slots: Array.isArray(saved.slots) ? saved.slots : []
      };
    }

    return {
      max: 2,
      spent: 0,
      bonusActionGranted: false,
      hasAttacked: false,
      slots: []
    };
  }

  /**
   * Retrieve action tracking data for a combatant.
   * @param {Combatant|string} combatantOrId
   * @param {number|null} [round=null]
   * @returns {object}
   */
  getCombatantActions(combatantOrId, round = null) {
    return DCCCombat.getCombatantActions(combatantOrId, this, round);
  }

  /**
   * Snapshot current combatant actions for a specified round into roundHistory flag.
   * @param {number} [round=this.round]
   * @returns {Promise<object>}
   */
  async snapshotRoundActions(round = this.round) {
    const r = Number(round) || 1;
    const history = deepClone(this.getFlag('carl-rpg', 'roundHistory') || {});
    history[r] = history[r] || {};
    for (const c of (this.combatants || [])) {
      history[r][c.id] = this.getCombatantActions(c);
    }
    await this.setFlag('carl-rpg', 'roundHistory', history);
    return history[r];
  }

  /**
   * Record an action performed by a combatant in the current round or a historical round.
   * Enforces rules:
   * - Base budget is 2 actions per round (or 3 with AI favor bonus action).
   * - Mobs: At most 1 Attack action per round!
   * @param {Combatant|string} combatantOrId
   * @param {object} actionData
   * @param {string} actionData.type - e.g. 'attack', 'move', 'cast', 'check', etc.
   * @param {string} [actionData.name] - custom name/label
   * @param {number} [actionData.slotIndex=null] - specific slot (0, 1, 2)
   * @param {object} [options={}]
   * @param {number|null} [options.round=null] - specific round to record against (defaults to active round)
   * @returns {Promise<object>}
   */
  async recordCombatantAction(combatantOrId, actionData = {}, { round = null } = {}) {
    const id = typeof combatantOrId === 'string' ? combatantOrId : combatantOrId?.id;
    const c = (this.combatants || []).find(con => con.id === id);
    if (!c) throw new Error(`Combatant ${id} not found in this combat.`);

    const isMob = DCCCombat.isMobCombatant(c);
    const targetRound = Number(round) || (this.round || 1);
    const isPastRound = targetRound !== (this.round || 1);
    const actions = this.getCombatantActions(c, targetRound);
    const type = actionData.type || 'other';
    const typeDef = DCC_ACTION_TYPES[type] || DCC_ACTION_TYPES.other;
    const isAttack = Boolean(typeDef.isAttack || actionData.isAttack || type === 'attack');

    // Rule enforcement: Mobs get 2 actions per round, ONE of which can be an attack
    if (isMob && isAttack && actions.hasAttacked) {
      const errorMsg = `Rule Violation: Mobs can only perform at most 1 Attack Action per round! (${c.name} has already attacked)`;
      if (globalThis.ui?.notifications?.warn) {
        globalThis.ui.notifications.warn(errorMsg);
      }
      return { success: false, error: errorMsg, actions };
    }

    // Budget check
    if (actions.spent >= actions.max && actionData.slotIndex === undefined) {
      const errorMsg = `${c.name} has no action budget remaining in Round ${targetRound} (${actions.spent}/${actions.max} spent).`;
      if (globalThis.ui?.notifications?.warn) {
        globalThis.ui.notifications.warn(errorMsg);
      }
      return { success: false, error: errorMsg, actions };
    }

    const category = actionData.category || typeDef.category || 'utility';
    const slot = {
      type,
      category,
      label: actionData.label || typeDef.label,
      icon: typeDef.icon,
      isAttack,
      isInterrupt: Boolean(typeDef.isInterrupt),
      timestamp: Date.now(),
      note: actionData.note || ''
    };

    const slots = [...actions.slots];
    if (Number.isInteger(actionData.slotIndex) && actionData.slotIndex >= 0 && actionData.slotIndex < actions.max) {
      slots[actionData.slotIndex] = slot;
    } else {
      slots.push(slot);
    }

    const spent = slots.filter(Boolean).length;
    const hasAttacked = slots.some(s => s && s.isAttack);

    const updatedActions = {
      max: actions.max,
      spent,
      bonusActionGranted: actions.bonusActionGranted,
      hasAttacked,
      slots
    };

    if (isPastRound) {
      const history = deepClone(this.getFlag('carl-rpg', 'roundHistory') || {});
      history[targetRound] = history[targetRound] || {};
      history[targetRound][c.id] = updatedActions;
      await this.setFlag('carl-rpg', 'roundHistory', history);
    } else {
      await c.setFlag('carl-rpg', 'actions', updatedActions);
      // Also sync to active round history
      const history = deepClone(this.getFlag('carl-rpg', 'roundHistory') || {});
      history[targetRound] = history[targetRound] || {};
      history[targetRound][c.id] = updatedActions;
      await this.setFlag('carl-rpg', 'roundHistory', history);
    }

    return { success: true, actions: updatedActions, combatant: c, round: targetRound };
  }

  /**
   * Clear an action slot or clear all actions for a combatant.
   * @param {Combatant|string} combatantOrId
   * @param {number|null} [slotIndex=null]
   * @param {object} [options={}]
   * @param {number|null} [options.round=null]
   * @returns {Promise<object>}
   */
  async clearCombatantAction(combatantOrId, slotIndex = null, { round = null } = {}) {
    const id = typeof combatantOrId === 'string' ? combatantOrId : combatantOrId?.id;
    const c = (this.combatants || []).find(con => con.id === id);
    if (!c) return { success: false };

    const targetRound = Number(round) || (this.round || 1);
    const isPastRound = targetRound !== (this.round || 1);
    const actions = this.getCombatantActions(c, targetRound);
    let slots = [...actions.slots];

    if (Number.isInteger(slotIndex)) {
      slots.splice(slotIndex, 1);
    } else {
      slots = [];
    }

    const spent = slots.filter(Boolean).length;
    const hasAttacked = slots.some(s => s && s.isAttack);

    const updatedActions = {
      max: actions.max,
      spent,
      bonusActionGranted: actions.bonusActionGranted,
      hasAttacked,
      slots
    };

    if (isPastRound) {
      const history = deepClone(this.getFlag('carl-rpg', 'roundHistory') || {});
      history[targetRound] = history[targetRound] || {};
      history[targetRound][c.id] = updatedActions;
      await this.setFlag('carl-rpg', 'roundHistory', history);
    } else {
      await c.setFlag('carl-rpg', 'actions', updatedActions);
      const history = deepClone(this.getFlag('carl-rpg', 'roundHistory') || {});
      history[targetRound] = history[targetRound] || {};
      history[targetRound][c.id] = updatedActions;
      await this.setFlag('carl-rpg', 'roundHistory', history);
    }

    return { success: true, actions: updatedActions, round: targetRound };
  }

  /**
   * Spend 1 AI Favor once per round to grant a Crawler +1 additional non-Attack Action.
   * @param {Combatant|string} combatantOrId
   * @returns {Promise<object>}
   */
  async spendAIFavorBonusAction(combatantOrId) {
    const id = typeof combatantOrId === 'string' ? combatantOrId : combatantOrId?.id;
    const c = (this.combatants || []).find(con => con.id === id);
    if (!c) throw new Error(`Combatant ${id} not found in this combat.`);

    const actor = c.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(c.actorId) : null);
    if (!actor) throw new Error(`Actor for combatant ${c.name} not found.`);

    if (DCCCombat.isMobCombatant(c)) {
      const errorMsg = `Rule Violation: Only Crawlers may spend AI Favor for Bonus Actions!`;
      if (globalThis.ui?.notifications?.warn) globalThis.ui.notifications.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    const actions = this.getCombatantActions(c);
    if (actions.bonusActionGranted) {
      const errorMsg = `${c.name} has already claimed their AI Favor Bonus Action this round!`;
      if (globalThis.ui?.notifications?.warn) globalThis.ui.notifications.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    const currentFavor = Number(actor.system?.attributes?.aiFavor) || 0;
    if (currentFavor < 1) {
      const errorMsg = `${actor.name} does not have enough AI Favor (${currentFavor} available, 1 required).`;
      if (globalThis.ui?.notifications?.warn) globalThis.ui.notifications.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Deduct 1 AI Favor
    await actor.update({ 'system.attributes.aiFavor': currentFavor - 1 });

    // Grant 1 additional non-attack action (max moves from 2 to 3)
    const updatedActions = {
      max: 3,
      spent: actions.spent,
      bonusActionGranted: true,
      hasAttacked: actions.hasAttacked,
      slots: actions.slots
    };

    await c.setFlag('carl-rpg', 'actions', updatedActions);

    if (globalThis.ChatMessage?.create) {
      await globalThis.ChatMessage.create({
        speaker: globalThis.ChatMessage.getSpeaker?.({ actor }) || { alias: c.name },
        content: `
          <div style="border: 1.5px solid #d32f2f; background: #fff8f8; padding: 6px 8px; border-radius: 4px; font-family: 'Oswald', sans-serif;">
            <div style="font-weight: bold; color: #d32f2f; text-transform: uppercase; font-size: 13px;">
              <i class="fa-solid fa-hand-holding-heart"></i> AI Favor Bonus Action
            </div>
            <div style="font-size: 11px; color: #333; margin-top: 2px;">
              <strong>${c.name}</strong> spent 1 AI Favor to gain <strong>+1 Non-Attack Action</strong> this round! (3 actions total)
            </div>
          </div>
        `
      });
    }

    return { success: true, actions: updatedActions, remainingFavor: currentFavor - 1 };
  }

  /**
   * Reset all combatant action slots for a new round.
   */
  async resetRoundActions() {
    for (const c of (this.combatants || [])) {
      await c.setFlag('carl-rpg', 'actions', {
        max: 2,
        spent: 0,
        bonusActionGranted: false,
        hasAttacked: false,
        slots: []
      });
    }
  }

  /**
   * Helper to parse and evaluate damage or healing effect expressions.
   * Supports:
   * - Flat numbers: 5, "4"
   * - Bars: "1 bar", "2 bars" (1 bar = hpPerBar)
   * - Floor variable: "1d10+F", "1d8+F" (F replaced with current floor)
   * - Dice expressions: "1d6", "2d4+2" (evaluated via Foundry Roll or fallback math)
   * @param {string|number} expr
   * @param {object} [options={}]
   * @param {Actor} [options.actor=null]
   * @param {number} [options.floor=1]
   * @returns {Promise<number>}
   */
  static async evaluateEffectFormula(expr, { actor = null, floor = 1 } = {}) {
    if (!expr && expr !== 0) return 0;
    if (typeof expr === 'number') return Math.max(0, Math.floor(expr));

    const str = String(expr).trim();
    if (!str) return 0;

    // Check for "X bar" or "X bars"
    const barMatch = str.match(/^(\d+)\s*bars?$/i);
    if (barMatch) {
      const bars = parseInt(barMatch[1], 10) || 0;
      let hpPerBar = 4;
      if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.getHpPerBar === 'function' && actor) {
        hpPerBar = DCCCombatMetrics.getHpPerBar(actor);
      } else if (actor?.system?.attributes?.hp?.hpPerBar) {
        hpPerBar = Number(actor.system.attributes.hp.hpPerBar) || 4;
      } else if (actor?.getDCCStatModifier && actor?.system?.abilities?.con?.value !== undefined) {
        hpPerBar = Math.max(1, actor.getDCCStatModifier(actor.system.abilities.con.value));
      }
      return bars * hpPerBar;
    }

    // Replace F (Floor) variable: e.g. 1d10+F or 1d8+F
    const fVal = Number(floor) || 1;
    const sanitized = str.replace(/\bF\b/gi, String(fVal));

    // If pure number:
    if (!isNaN(Number(sanitized))) {
      return Math.max(0, Math.floor(Number(sanitized)));
    }

    // Dice expression (e.g. 1d6, 1d8+1, 2d4):
    try {
      if (typeof Roll !== 'undefined') {
        const r = new Roll(sanitized);
        if (typeof r.evaluate === 'function') {
          const evalRes = r.evaluate({ async: false });
          if (evalRes && typeof evalRes.then === 'function') {
            const resolved = await evalRes;
            return Math.max(0, Math.floor(resolved.total || 0));
          }
          return Math.max(0, Math.floor(evalRes.total || 0));
        }
      }
    } catch (err) {
      console.warn('DCC RPG | Could not evaluate effect roll formula:', sanitized, err);
    }

    // Fallback simple dice parsing (e.g. in test harness if Roll is minimal)
    const diceMatch = sanitized.match(/^(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?$/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1], 10) || 1;
      const sides = parseInt(diceMatch[2], 10);
      const sign = diceMatch[3] === '-' ? -1 : 1;
      const mod = parseInt(diceMatch[4], 10) || 0;
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
      }
      total += (sign * mod);
      return Math.max(0, total);
    }

    return 0;
  }

  /**
   * Post an authentic DCC end-of-round chat card summarizing all debuff damage and buff healing.
   * @param {Array<object>} results
   * @param {number} round
   * @param {Combat} combat
   */
  static async postRoundEndEffectsChatCard(results, round, combat) {
    if (!globalThis.ChatMessage?.create || !results?.length) return;

    const rows = results.map(res => {
      if (res.type === 'debuff') {
        if (res.conCheck?.success) {
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; background: #eafaf1; border-left: 3px solid #27ae60; margin-bottom: 3px; font-size: 11px;">
              <div>
                <span style="color: #27ae60; font-weight: bold;"><i class="fa-solid fa-shield-heart"></i> ${res.itemName}</span>
                <span style="color: #222;"> &rarr; <strong>${res.actorName}</strong></span>
                <span style="color: #27ae60; font-size: 10px;"> (CON Check ${res.conCheck.total} vs DC ${res.conCheck.dc}: SUCCESS)</span>
              </div>
              <div style="text-align: right;">
                <span style="color: #27ae60; font-weight: bold; font-size: 11px;">DAMAGE AVOIDED (${res.itemName} Ended!)</span>
                <span style="color: #888; font-size: 10px;"> (${res.hpAfter} HP)</span>
              </div>
            </div>
          `;
        }
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; background: #fff5f5; border-left: 3px solid #c0392b; margin-bottom: 3px; font-size: 11px;">
            <div>
              <span style="color: #c0392b; font-weight: bold;"><i class="fa-solid fa-skull"></i> ${res.itemName}</span>
              <span style="color: #666; font-size: 10px;"> (${res.damageType || 'Physical'})</span>
              <span style="color: #222;"> &rarr; <strong>${res.actorName}</strong></span>
              ${res.conCheck && !res.conCheck.success ? `<span style="color: #c0392b; font-size: 10px;"> (CON Check ${res.conCheck.total} vs DC ${res.conCheck.dc}: FAILED)</span>` : ''}
            </div>
            <div style="text-align: right;">
              <span style="color: #c0392b; font-weight: bold; font-size: 12px;">-${res.actualDamage} HP</span>
              <span style="color: #888; font-size: 10px;"> (${res.hpAfter} HP)</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; background: #f4fbf7; border-left: 3px solid #27ae60; margin-bottom: 3px; font-size: 11px;">
            <div>
              <span style="color: #27ae60; font-weight: bold;"><i class="fa-solid fa-sparkles"></i> ${res.itemName}</span>
              <span style="color: #222;"> &rarr; <strong>${res.actorName}</strong></span>
            </div>
            <div style="text-align: right;">
              <span style="color: #27ae60; font-weight: bold; font-size: 12px;">+${res.actualHealed} HP</span>
              <span style="color: #888; font-size: 10px;"> (${res.hpAfter}/${res.maxHp} HP)</span>
            </div>
          </div>
        `;
      }
    }).join('');

    const content = `
      <div class="dcc-chat-card dcc-round-end-card" style="border: 2px solid #2c3e50; border-radius: 4px; overflow: hidden; font-family: 'Oswald', sans-serif;">
        <div style="background: #2c3e50; color: #fff; padding: 6px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-hourglass-end"></i> End of Round ${round} Effects</span>
          <span style="font-size: 10px; opacity: 0.85;">${results.length} Triggered</span>
        </div>
        <div style="padding: 6px 8px; background: #ffffff;">
          ${rows}
        </div>
      </div>
    `;

    return globalThis.ChatMessage.create({
      content,
      speaker: { alias: 'Combat Tracker' }
    });
  }

  /**
   * Automatically trigger all debuffs that cause damage and all buffs that cause healing
   * across all combatants at the end of a combat round.
   * @param {number} [round=this.round]
   * @returns {Promise<Array<object>>} List of applied effects
   */
  async triggerRoundEndEffects(round = this.round) {
    const r = Number(round) || 1;
    this._triggeredRoundEndEffects = this._triggeredRoundEndEffects || new Set();
    const roundKey = `${this.id || 'active'}-round-${r}`;
    if (this._triggeredRoundEndEffects.has(roundKey)) {
      return [];
    }
    this._triggeredRoundEndEffects.add(roundKey);

    let currentFloor = 1;
    if (typeof DCCActor !== 'undefined' && typeof DCCActor.getCurrentFloor === 'function') {
      currentFloor = DCCActor.getCurrentFloor();
    } else if (globalThis.CONFIG?.DCC?.getCurrentFloor) {
      currentFloor = globalThis.CONFIG.DCC.getCurrentFloor();
    } else if (globalThis.game?.settings?.get) {
      currentFloor = Number(globalThis.game.settings.get('carl-rpg', 'currentFloor')) || 1;
    }

    const results = [];
    const combatantsList = Array.from(this.combatants || []);

    for (const c of combatantsList) {
      const actor = c.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(c.actorId) : null);
      if (!actor) continue;

      // 1. Trigger Debuffs that cause damage
      const debuffs = (actor.items || []).filter(i => i.type === 'debuff');
      for (const debuff of debuffs) {
        const dmgExpr = debuff.system?.damagePerRound;
        if (!dmgExpr || (typeof dmgExpr === 'string' && !dmgExpr.trim())) continue;

        const damageVal = await DCCCombat.evaluateEffectFormula(dmgExpr, { actor, floor: currentFloor });
        if (damageVal > 0) {
          const damageType = debuff.system?.damageType || 'Physical';
          const hpBefore = Number(actor.system?.attributes?.hp?.value ?? 0);
          const tempHp = Number(actor.system?.attributes?.hp?.temp ?? 0);

          // Calculate penetrating damage and whether it would drop crawler to 0% on Health Bar
          let adjustedDamage = damageVal;
          if (typeof actor.getDamageReduction === 'function') {
            const red = actor.getDamageReduction(damageType);
            if (red.isImmune) {
              adjustedDamage = 0;
            } else {
              if (red.percent > 0) {
                const reduction = red.rounding === 'up'
                  ? Math.ceil(adjustedDamage * red.percent)
                  : Math.floor(adjustedDamage * red.percent);
                adjustedDamage = Math.max(0, adjustedDamage - reduction);
              }
              if (red.flat > 0) {
                adjustedDamage = Math.max(0, adjustedDamage - red.flat);
              }
            }
          } else if (typeof actor.hasImmunity === 'function' && actor.hasImmunity(damageType)) {
            adjustedDamage = 0;
          } else if (typeof actor.hasResistance === 'function' && actor.hasResistance(damageType)) {
            adjustedDamage = Math.floor(adjustedDamage / 2);
          }

          const damageAfterTemp = Math.max(0, adjustedDamage - tempHp);
          let hpPerBar = 4;
          if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.getHpPerBar === 'function') {
            hpPerBar = DCCCombatMetrics.getHpPerBar(actor);
          } else if (actor.system?.attributes?.hp?.hpPerBar) {
            hpPerBar = Number(actor.system.attributes.hp.hpPerBar) || 4;
          } else if (actor.getDCCStatModifier && actor.system?.abilities?.con?.value !== undefined) {
            hpPerBar = Math.max(1, actor.getDCCStatModifier(actor.system.abilities.con.value));
          }

          const barsRemoved = Math.floor(damageAfterTemp / hpPerBar);
          const damageToHp = barsRemoved * hpPerBar;
          const wouldDropToZero = (hpBefore - damageToHp) <= 0;

          let conCheckRes = null;
          if (actor.type === 'crawler' && wouldDropToZero && damageToHp > 0 && typeof actor.checkFatalDebuffProtection === 'function') {
            conCheckRes = await actor.checkFatalDebuffProtection(debuff, damageVal, { floor: currentFloor });
            if (conCheckRes?.avoided) {
              results.push({
                type: 'debuff',
                combatantId: c.id,
                combatantName: c.name,
                actorId: actor.id,
                actorName: actor.name,
                itemName: debuff.name,
                itemId: debuff.id,
                damageType,
                formula: dmgExpr,
                rolledValue: damageVal,
                actualDamage: 0,
                avoidedDamage: damageVal,
                hpBefore,
                hpAfter: hpBefore,
                conCheck: {
                  total: conCheckRes.roll?.total,
                  dc: conCheckRes.dc,
                  success: true
                },
                debuffEnded: true,
                round: r
              });
              continue;
            }
          }

          let applyRes = null;
          if (typeof actor.applyDamage === 'function') {
            applyRes = await actor.applyDamage(damageVal, {
              damageType,
              attackName: debuff.name || 'Debuff Damage',
              attackType: 'Condition',
              ignoreDR: true,
              combat: this
            });
          } else if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.applyDamageToTarget === 'function') {
            applyRes = await DCCCombatMetrics.applyDamageToTarget({
              targetActor: actor,
              rawDamage: damageVal,
              damageType,
              attackerActor: null,
              attackName: debuff.name || 'Debuff Damage',
              attackType: 'Condition',
              ignoreDR: true,
              combat: this
            });
          }

          const hpAfter = Number(actor.system?.attributes?.hp?.value ?? 0);
          const actualDamage = applyRes?.actualDamage ?? Math.max(0, hpBefore - hpAfter);

          results.push({
            type: 'debuff',
            combatantId: c.id,
            combatantName: c.name,
            actorId: actor.id,
            actorName: actor.name,
            itemName: debuff.name,
            itemId: debuff.id,
            damageType,
            formula: dmgExpr,
            rolledValue: damageVal,
            actualDamage,
            hpBefore,
            hpAfter,
            round: r
          });
        }
      }

      // 2. Trigger Buffs that cause healing
      const allBuffs = [];
      const seenBuffIds = new Set();
      for (const item of (actor.items || [])) {
        if (item.type === 'buff') {
          allBuffs.push(item);
          seenBuffIds.add(item.id);
        }
      }
      if (typeof actor.getActiveBuffs === 'function') {
        const activeExternal = actor.getActiveBuffs() || [];
        for (const ext of activeExternal) {
          if (ext && !seenBuffIds.has(ext.id)) {
            allBuffs.push(ext);
            seenBuffIds.add(ext.id);
          }
        }
      }

      for (const buff of allBuffs) {
        const healExpr = buff.system?.healingPerRound ||
          ((buff.system?.buffType === 'heal' || buff.system?.buffType === 'healing' || buff.system?.buffType === 'regeneration') ? buff.system?.value : null);
        if (!healExpr || (typeof healExpr === 'string' && !healExpr.trim())) continue;

        const healVal = await DCCCombat.evaluateEffectFormula(healExpr, { actor, floor: currentFloor });
        if (healVal > 0) {
          let hpPerBar = 4;
          if (typeof DCCCombatMetrics !== 'undefined' && typeof DCCCombatMetrics.getHpPerBar === 'function') {
            hpPerBar = DCCCombatMetrics.getHpPerBar(actor);
          } else if (actor.system?.attributes?.hp?.hpPerBar) {
            hpPerBar = Number(actor.system.attributes.hp.hpPerBar) || 4;
          } else if (actor.getDCCStatModifier && actor.system?.abilities?.con?.value !== undefined) {
            hpPerBar = Math.max(1, actor.getDCCStatModifier(actor.system.abilities.con.value));
          }

          const hpBefore = Number(actor.system?.attributes?.hp?.value ?? actor.system?.attributes?.hp?.max ?? 0);
          const maxHp = Number(actor.system?.attributes?.hp?.max) || (10 * hpPerBar);
          const newHp = Math.min(maxHp, hpBefore + healVal);
          const actualHealed = Math.max(0, newHp - hpBefore);

          if (actualHealed > 0 || healVal > 0) {
            await actor.update({ 'system.attributes.hp.value': newHp });
          }

          results.push({
            type: 'buff',
            combatantId: c.id,
            combatantName: c.name,
            actorId: actor.id,
            actorName: actor.name,
            itemName: buff.name,
            itemId: buff.id,
            formula: healExpr,
            rolledValue: healVal,
            actualHealed,
            hpBefore,
            hpAfter: newHp,
            maxHp,
            round: r
          });
        }
      }
    }

    // 3. Post Chat Card if any effects triggered
    if (results.length > 0) {
      await DCCCombat.postRoundEndEffectsChatCard(results, r, this);
    }

    return results;
  }

  /**
   * Process duration countdowns for active spells, auras, and buffs on combatants.
   * Decrements remainingRounds by 1. When remaining reaches 0, deactivates the effect
   * and cleans up any linked temporary health bars.
   * @param {number} r Current combat round
   * @returns {Promise<Array<object>>} Expired items list
   */
  async processRoundDurations(r) {
    const expiredList = [];
    for (const c of (this.combatants || [])) {
      const actor = c.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(c.actorId) : null);
      if (!actor || !actor.items) continue;

      const itemsList = Array.isArray(actor.items)
        ? actor.items
        : Array.from(actor.items.values?.() || []);

      for (const item of itemsList) {
        const sys = item.system || {};
        if (!sys.active) continue;

        const durCfg = sys.durationConfig;
        const isRoundDuration = durCfg?.type === 'rounds' || (typeof sys.duration === 'string' && sys.duration.toLowerCase().includes('round'));

        let remaining = Number(durCfg?.remainingRounds);
        if (!Number.isFinite(remaining) || remaining <= 0) {
          if (durCfg?.rounds > 0) remaining = Number(durCfg.rounds);
          else if (typeof sys.duration === 'string') {
            const m = sys.duration.match(/(\d+)\s*round/i);
            if (m) remaining = Number(m[1]);
          }
        }

        if (isRoundDuration && Number.isFinite(remaining) && remaining > 0) {
          const newRemaining = remaining - 1;
          const isExpired = newRemaining <= 0;

          const updates = {
            'system.durationConfig.remainingRounds': Math.max(0, newRemaining)
          };

          if (isExpired) {
            updates['system.active'] = false;

            // If this item was providing temporary health bars, clear them
            const currentSource = actor.system?.attributes?.hp?.tempBars?.source;
            if (currentSource && (currentSource === item.name || currentSource.toLowerCase() === item.name.toLowerCase())) {
              if (typeof actor.grantTempBars === 'function') {
                await actor.grantTempBars({ count: 0, hpPerSlot: 0 });
              } else {
                await actor.update({
                  'system.attributes.hp.tempBars.count': 0,
                  'system.attributes.hp.tempBars.currentSlotHp': 0,
                  'system.attributes.hp.tempBars.source': '',
                  'system.attributes.hp.temp': 0
                });
              }
            }

            expiredList.push({
              combatantId: c.id,
              actorId: actor.id,
              actorName: actor.name,
              itemId: item.id,
              itemName: item.name,
              itemType: item.type,
              round: r
            });
          }

          await item.update(updates);
        }
      }
    }

    if (expiredList.length > 0 && typeof ChatMessage !== 'undefined' && typeof ChatMessage.create === 'function') {
      const msgs = expiredList.map(e => `<li><strong>${e.actorName}</strong>: <em>${e.itemName}</em> has faded.</li>`).join('');
      await ChatMessage.create({
        speaker: { alias: 'Combat Clock' },
        content: `<div class="dcc-chat-card dcc-expiration-card"><header class="dcc-card-header"><span class="dcc-badge">[DURATION EXPIRED]</span><h3>Combat Round ${r} Expirations</h3></header><div class="dcc-card-body"><ul>${msgs}</ul></div></div>`
      });
    }

    return expiredList;
  }

  /**
   * Advance to the next round of combat.
   * - Triggers all debuffs that cause damage and all buffs that cause healing at the end of the round.
   * - Decrements duration on active round-based spells, auras, and buffs.
   * - Snapshots outgoing round action states into roundHistory.
   * - Resets actions for all combatants.
   * - Surprise round automatically expires after the ambush round.
   * @returns {Promise<DCCCombat>}
   */
  async nextRound() {
    const currentRound = this.round || 1;
    if (currentRound >= 1) {
      await this.triggerRoundEndEffects(currentRound);
      await this.processRoundDurations(currentRound);
    }
    await this.snapshotRoundActions(currentRound);
    await this.resetRoundActions();

    // Surprise rounds are rare and only apply to the initial ambush round
    if (this.isSurpriseRound) {
      await this.setFlag('carl-rpg', 'isSurpriseRound', false);
    }

    if (typeof super.nextRound === 'function') {
      await super.nextRound();
    }
    await this.assignPhaseInitiative();
    return this;
  }

  /**
   * Snapshot and archive this combat encounter to permanent world storage.
   * Preserves encounter metadata, combatants, round history, and AI metrics.
   * @returns {Promise<object>} The archived encounter record
   */
  async archiveCombat() {
    await this.snapshotRoundActions(this.round || 1);

    const metrics = this.getFlag('carl-rpg', 'metrics') || {};
    const roundHistory = this.getFlag('carl-rpg', 'roundHistory') || {};
    const scene = this.scene || (globalThis.game?.scenes?.get ? globalThis.game.scenes.get(this.sceneId) : null);

    const combatantsData = Array.from(this.combatants || []).map(c => {
      const actor = c.actor || (globalThis.game?.actors?.get ? globalThis.game.actors.get(c.actorId) : null);
      const isMob = DCCCombat.isMobCombatant(c);
      const actorMetrics = metrics[c.actorId] || {};
      
      // Tally action counts across all rounds in roundHistory
      const actionCategories = { damage: 0, tactical: 0, defensive: 0, buff: 0, utility: 0 };
      for (const roundData of Object.values(roundHistory)) {
        const rAct = roundData?.[c.id];
        if (rAct?.slots && Array.isArray(rAct.slots)) {
          for (const s of rAct.slots) {
            if (!s) continue;
            const cat = s.category || DCC_ACTION_TYPES[s.type]?.category || (s.isAttack ? 'damage' : 'utility');
            if (actionCategories[cat] !== undefined) {
              actionCategories[cat]++;
            } else {
              actionCategories.utility++;
            }
          }
        }
      }

      return {
        id: c.id,
        name: c.name,
        actorId: c.actorId,
        img: c.img || actor?.img || 'icons/svg/mystery-man.svg',
        type: actor?.type || (isMob ? 'npc' : 'crawler'),
        isMob,
        level: Number(actor?.system?.details?.level) || 1,
        xpValue: Number(actor?.system?.details?.xpValue) || 0,
        hp: actor?.system?.attributes?.hp?.value ?? null,
        maxHp: actor?.system?.attributes?.hp?.max ?? null,
        actions: this.getCombatantActions(c),
        damageDealt: actorMetrics.totalDamage || 0,
        damageTaken: actorMetrics.damageTaken || 0,
        actionCategories,
        highestHit: actorMetrics.highestHit || 0,
        kills: actorMetrics.kills || 0
      };
    });

    const archiveRecord = {
      id: this.id || ('archived-' + Date.now()),
      name: this.name || (scene ? `${scene.name} Encounter` : 'Dungeon Encounter'),
      timestamp: Date.now(),
      dateString: new Date().toLocaleString(),
      sceneId: this.sceneId || null,
      sceneName: scene?.name || 'Unknown Scene',
      totalRounds: Math.max(1, this.round || 1),
      isSurpriseRound: this.isSurpriseRound,
      combatants: combatantsData,
      roundHistory,
      metrics: {
        ...metrics,
        totalDamageDealt: metrics.totalDamageDealt || 0,
        mvp: metrics.mvp || null,
        awards: metrics.awards || [],
        events: metrics.events || []
      }
    };

    await DCCCombat.saveArchivedCombat(archiveRecord);
    return archiveRecord;
  }

  /** @override */
  async endCombat() {
    try {
      await this.archiveCombat();
    } catch (err) {
      console.warn('DCC RPG | Could not archive combat before ending:', err);
    }
    if (typeof super.endCombat === 'function') {
      return super.endCombat();
    }
    return this;
  }

  /**
   * Retrieve all permanently archived combats from world storage.
   * @returns {Array<object>}
   */
  static getArchivedCombats() {
    try {
      return globalThis.game?.settings?.get?.('carl-rpg', 'archivedCombats') || [];
    } catch {
      return [];
    }
  }

  /**
   * Save or update an archived combat record in world storage.
   * @param {object} record
   * @returns {Promise<Array<object>>}
   */
  static async saveArchivedCombat(record) {
    if (!globalThis.game?.settings) return [];
    const existing = DCCCombat.getArchivedCombats();
    const updated = [record, ...existing.filter(e => e.id !== record.id)];
    await globalThis.game.settings.set('carl-rpg', 'archivedCombats', updated);
    return updated;
  }

  /**
   * Delete an archived combat record by ID.
   * @param {string} id
   * @returns {Promise<Array<object>>}
   */
  static async deleteArchivedCombat(id) {
    if (!globalThis.game?.settings) return [];
    const existing = DCCCombat.getArchivedCombats();
    const updated = existing.filter(e => e.id !== id);
    await globalThis.game.settings.set('carl-rpg', 'archivedCombats', updated);
    return updated;
  }

  /**
   * Clear all archived combats.
   * @returns {Promise<Array<object>>}
   */
  static async clearArchivedCombats() {
    if (!globalThis.game?.settings) return [];
    await globalThis.game.settings.set('carl-rpg', 'archivedCombats', []);
    return [];
  }
}
