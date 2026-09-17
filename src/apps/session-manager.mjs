/**
 * Dungeon Crawler Carl RPG — Session Progression & Party Activity Manager
 * 
 * Provides comprehensive tracking across the entire crawler party:
 * - Session definition (Active, New, Historical/Archived)
 * - 7-tier roll outcome evaluation (Critical Failure, Major Failure, Failure, Near Miss, Success, Major Success, Critical Success)
 * - Activity ledger (trained & untrained skill checks, spells, attacks, damage given & taken)
 * - Quests, Loot boxes, AI Favor, and Popularity tracking
 * - Manual DM override & live editing controls
 * - End-of-session progression engine (untrained skill promotions, XP distribution, AI recap broadcast)
 */

import { DCCExperienceTracker } from './xp-tracker.mjs';

const BaseApplication = typeof Application !== 'undefined' ? Application : (globalThis.Application || class {});

/**
 * Canonical 7-Tier Roll Outcome Definitions for CarlRPG
 */
export const DCC_ROLL_OUTCOMES = Object.freeze({
  CRITICAL_FAILURE: 'critical_failure',
  MAJOR_FAILURE: 'major_failure',
  FAILURE: 'failure',
  NEAR_MISS: 'near_miss',
  SUCCESS: 'success',
  MAJOR_SUCCESS: 'major_success',
  CRITICAL_SUCCESS: 'critical_success',
  PENDING: 'pending'
});

export const DCC_OUTCOME_CONFIG = Object.freeze({
  critical_failure: { label: 'Critical Failure', badge: 'CRIT FAIL', class: 'outcome-crit-fail', color: '#78281f' },
  major_failure:    { label: 'Major Failure',    badge: 'MAJOR FAIL', class: 'outcome-major-fail', color: '#c0392b' },
  failure:          { label: 'Failure',          badge: 'FAILURE', class: 'outcome-fail', color: '#e67e22' },
  near_miss:        { label: 'Near Miss',        badge: 'NEAR MISS', class: 'outcome-near-miss', color: '#f39c12' },
  success:          { label: 'Success',          badge: 'SUCCESS', class: 'outcome-success', color: '#27ae60' },
  major_success:    { label: 'Major Success',    badge: 'MAJOR SUCCESS', class: 'outcome-major-success', color: '#16a085' },
  critical_success: { label: 'Critical Success', badge: 'CRIT SUCCESS', class: 'outcome-crit-success', color: '#d4ac0d' },
  pending:          { label: 'Pending DC',       badge: 'PENDING DC', class: 'outcome-pending', color: '#7f8c8d' }
});

/**
 * Evaluates a d20 roll against a Target Number (DC / AC) according to CarlRPG rules:
 * - Critical Failure: d20 shows 1
 * - Major Failure: miss by 10+ (total <= target - 10)
 * - Failure: miss by 4-9 (target - 9 <= total <= target - 4)
 * - Near Miss: miss by 1-3 (target - 3 <= total <= target - 1)
 * - Success: meet or exceed number by < 10 (target <= total <= target + 9)
 * - Major Success: exceed number by 10 or greater (total >= target + 10)
 * - Critical Success: d20 shows 20
 * 
 * @param {object} params
 * @param {number} params.total - Evaluated total roll including modifiers
 * @param {number|null} [params.d20Result=null] - Natural result of the d20 die
 * @param {number|null} [params.targetDC=null] - Target DC / AC
 * @returns {string} One of DCC_ROLL_OUTCOMES
 */
export function evaluateRollOutcome({ total, d20Result = null, targetDC = null } = {}) {
  const d20 = Number(d20Result);
  if (d20 === 1) return DCC_ROLL_OUTCOMES.CRITICAL_FAILURE;
  if (d20 === 20) return DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS;

  if (targetDC === null || targetDC === undefined || targetDC === '' || isNaN(Number(targetDC))) {
    return DCC_ROLL_OUTCOMES.PENDING;
  }

  const dc = Number(targetDC);
  const rollVal = Number(total);
  const margin = rollVal - dc;

  if (margin <= -10) return DCC_ROLL_OUTCOMES.MAJOR_FAILURE;
  if (margin <= -4)  return DCC_ROLL_OUTCOMES.FAILURE;
  if (margin < 0)    return DCC_ROLL_OUTCOMES.NEAR_MISS;
  if (margin < 10)   return DCC_ROLL_OUTCOMES.SUCCESS;
  return DCC_ROLL_OUTCOMES.MAJOR_SUCCESS;
}

/**
 * Extract natural d20 die face from a Foundry Roll instance if available
 * @param {Roll|object} roll
 * @returns {number|null}
 */
export function extractD20Result(roll) {
  if (!roll) return null;
  if (typeof roll.d20Result === 'number') return roll.d20Result;

  if (Array.isArray(roll.terms)) {
    for (const term of roll.terms) {
      if (term.faces === 20 && Array.isArray(term.results)) {
        const active = term.results.filter(r => r.active !== false);
        if (active.length === 1) return Number(active[0].result);
        if (active.length > 1) {
          // Advantage / Disadvantage: if roll formula used 2d20kl, active is kept
          return Number(active[0].result);
        }
      }
    }
  }

  // Fallback: inspect dice object in dice arrays
  if (Array.isArray(roll.dice)) {
    for (const d of roll.dice) {
      if (d.faces === 20 && Array.isArray(d.results)) {
        const kept = d.results.find(r => r.active !== false) || d.results[0];
        if (kept) return Number(kept.result);
      }
    }
  }

  return null;
}

/**
 * Session Progression & Party Ledger Engine
 */
export class DCCSessionEngine {
  /**
   * Retrieve all sessions from world settings
   * @returns {Array<object>}
   */
  static getAllSessions() {
    try {
      const stored = globalThis.game?.settings?.get?.('carl-rpg', 'sessions');
      if (Array.isArray(stored)) return structuredClone(stored);
    } catch (_) {}
    return [];
  }

  /**
   * Persist sessions array to world settings
   * @param {Array<object>} sessions
   * @returns {Promise<Array<object>>}
   */
  static async saveAllSessions(sessions) {
    if (globalThis.game?.settings?.set) {
      await globalThis.game.settings.set('carl-rpg', 'sessions', sessions);
    }
    this._refreshOpenWindows();
    return sessions;
  }

  /**
   * Retrieve the active session ID
   * @returns {string|null}
   */
  static getActiveSessionId() {
    try {
      return globalThis.game?.settings?.get?.('carl-rpg', 'activeSessionId') || null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Set the active session ID
   * @param {string} sessionId
   * @returns {Promise<string>}
   */
  static async setActiveSessionId(sessionId) {
    if (globalThis.game?.settings?.set) {
      await globalThis.game.settings.set('carl-rpg', 'activeSessionId', sessionId);
    }
    this._refreshOpenWindows();
    return sessionId;
  }

  /**
   * Retrieve the active session object. Creates default Session 1 if none exists.
   * @returns {Promise<object>}
   */
  static async getActiveSession() {
    const sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    let active = sessions.find(s => s.id === activeId && s.status === 'active');

    if (!active) {
      // Find any active session
      active = sessions.find(s => s.status === 'active');
      if (active) {
        await this.setActiveSessionId(active.id);
        return active;
      }
      // Create initial session
      return this.createSession({ number: sessions.length + 1, title: `Session ${sessions.length + 1}` });
    }

    return active;
  }

  /**
   * Create a new session record and set it active
   * @param {object} params
   * @param {number} [params.number=1]
   * @param {string} [params.title='Session']
   * @param {string} [params.notes='']
   * @returns {Promise<object>}
   */
  static async createSession({ number = null, title = '', notes = '' } = {}) {
    const sessions = this.getAllSessions();
    const nextNumber = number || (sessions.length ? Math.max(...sessions.map(s => Number(s.number) || 0)) + 1 : 1);
    const sessionTitle = title.trim() || `Session ${nextNumber}`;

    const newSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      number: nextNumber,
      title: sessionTitle,
      status: 'active',
      createdAt: Date.now(),
      endedAt: null,
      notes: notes.trim(),
      crawlers: {},
      ledger: [],
      quests: [],
      lootBoxes: [],
      summary: {
        mvpActorId: null,
        chumpActorId: null,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalKills: 0,
        totalUntrainedAttempts: 0,
        notes: ''
      }
    };

    // Pre-populate with all world crawlers
    const crawlers = this.getPartyCrawlers();
    for (const crawler of crawlers) {
      newSession.crawlers[crawler.id] = this._createCrawlerRecord(crawler);
    }

    sessions.push(newSession);
    await this.saveAllSessions(sessions);
    await this.setActiveSessionId(newSession.id);
    return newSession;
  }

  /**
   * Helper to create crawler accumulator record
   */
  static _createCrawlerRecord(actor) {
    return {
      actorId: actor?.id || '',
      name: actor?.name || 'Crawler',
      img: actor?.img || actor?.prototypeToken?.texture?.src || 'icons/svg/mystery-man.svg',
      level: Number(actor?.system?.details?.level) || 1,
      damageDealt: 0,
      damageTaken: 0,
      kills: 0,
      aiFavorDelta: 0,
      popularityDelta: 0,
      skillsUsed: {},
      untrainedAttempted: {},
      spellsCast: {},
      lootBoxesAwarded: []
    };
  }

  /**
   * Get all crawler actors from world
   * @returns {Array<Actor>}
   */
  static getPartyCrawlers() {
    if (!globalThis.game?.actors) return [];
    if (typeof globalThis.game.actors.filter === 'function') {
      return Array.from(globalThis.game.actors.filter(a => a.type === 'crawler'));
    }
    if (Array.isArray(globalThis.game.actors)) {
      return globalThis.game.actors.filter(a => a.type === 'crawler');
    }
    if (Array.isArray(globalThis.game.actors.contents)) {
      return globalThis.game.actors.contents.filter(a => a.type === 'crawler');
    }
    return [];
  }

  /**
   * Universal actor lookup by ID
   * @param {string} actorId
   * @returns {Actor|null}
   */
  static _getActor(actorId) {
    if (!actorId || !globalThis.game?.actors) return null;
    if (typeof globalThis.game.actors.get === 'function') return globalThis.game.actors.get(actorId);
    if (Array.isArray(globalThis.game.actors)) return globalThis.game.actors.find(a => (a.id || a._id) === actorId) || null;
    if (Array.isArray(globalThis.game.actors.contents)) return globalThis.game.actors.contents.find(a => (a.id || a._id) === actorId) || null;
    return null;
  }

  /**
   * Record a roll action (Skill, Untrained Check, Attack, Spell, Stat) to active session
   * @param {object} params
   * @param {Actor} params.actor
   * @param {Roll|object} params.roll
   * @param {string} [params.type='skill'] - 'skill', 'untrained_skill', 'spell', 'attack', 'stat', 'manual'
   * @param {string} [params.name='Action']
   * @param {boolean} [params.isUntrained=false]
   * @param {number|null} [params.targetDC=null]
   * @param {string} [params.notes='']
   * @param {string|null} [params.sessionId=null]
   * @returns {Promise<object|null>}
   */
  /**
   * Record a roll action (Skill, Untrained Check, Attack, Spell, Stat) to active session
   * @param {object} params
   * @param {Actor} params.actor
   * @param {Roll|object} params.roll
   * @param {string} [params.type='skill'] - 'skill', 'untrained_skill', 'spell', 'attack', 'stat', 'manual'
   * @param {string} [params.name='Action']
   * @param {boolean} [params.isUntrained=false]
   * @param {number|null} [params.targetDC=null]
   * @param {string|null} [params.explicitOutcome=null]
   * @param {string} [params.notes='']
   * @param {string|null} [params.sessionId=null]
   * @returns {Promise<object|null>}
   */
  static async recordRoll({ actor, roll, type = 'skill', name = 'Action', isUntrained = false, targetDC = null, explicitOutcome = null, notes = '', sessionId = null } = {}) {
    if (!actor) return null;

    let sessions = this.getAllSessions();
    const activeId = sessionId || this.getActiveSessionId();
    let session = sessions.find(s => s.id === activeId);
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return null;

    // Ensure crawler accumulator exists
    if (!session.crawlers[actor.id]) {
      session.crawlers[actor.id] = this._createCrawlerRecord(actor);
    }
    const crawlerEntry = session.crawlers[actor.id];
    crawlerEntry.name = actor.name;
    crawlerEntry.img = actor.img;
    crawlerEntry.level = Number(actor.system?.details?.level) || 1;

    // Roll evaluation
    const total = Number(roll?.total ?? roll?.result ?? 0);
    const d20 = extractD20Result(roll);
    const outcome = (explicitOutcome && Object.values(DCC_ROLL_OUTCOMES).includes(explicitOutcome))
      ? explicitOutcome
      : evaluateRollOutcome({ total, d20Result: d20, targetDC });

    // Update crawler specific counts
    const cleanName = (name || 'Unknown Action').trim();
    if (isUntrained || type === 'untrained_skill') {
      crawlerEntry.untrainedAttempted[cleanName] = (crawlerEntry.untrainedAttempted[cleanName] || 0) + 1;
    } else if (type === 'skill') {
      crawlerEntry.skillsUsed[cleanName] = (crawlerEntry.skillsUsed[cleanName] || 0) + 1;
    } else if (type === 'spell') {
      crawlerEntry.spellsCast[cleanName] = (crawlerEntry.spellsCast[cleanName] || 0) + 1;
    }

    const ledgerEntry = {
      id: `roll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId: actor.id,
      actorName: actor.name,
      actorImg: actor.img,
      type,
      name: cleanName,
      isUntrained: Boolean(isUntrained || type === 'untrained_skill'),
      rollFormula: String(roll?.formula || total),
      d20Result: d20,
      total,
      targetDC: targetDC !== null && targetDC !== undefined && targetDC !== '' ? Number(targetDC) : null,
      outcome,
      notes: notes || '',
      gmEdited: Boolean(explicitOutcome)
    };

    session.ledger.push(ledgerEntry);
    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);

    return ledgerEntry;
  }

  /**
   * Record damage applied/taken to active session and log to ledger
   * @param {object} params
   */
  static async recordDamage({ attackerActor = null, targetActor = null, actualDamage = 0, attackName = 'Attack', type = 'damage' } = {}) {
    const netDamage = Math.max(0, Number(actualDamage) || 0);
    if (netDamage === 0) return;

    let sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    let session = sessions.find(s => s.id === activeId && s.status === 'active');
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return;

    if (attackerActor && (attackerActor.type === 'crawler' || (attackerActor.id && session.crawlers[attackerActor.id]))) {
      if (!session.crawlers[attackerActor.id] && attackerActor.type === 'crawler') {
        session.crawlers[attackerActor.id] = this._createCrawlerRecord(attackerActor);
      }
      if (session.crawlers[attackerActor.id]) {
        session.crawlers[attackerActor.id].damageDealt = (session.crawlers[attackerActor.id].damageDealt || 0) + netDamage;
        if (targetActor && Number(targetActor.system?.attributes?.hp?.value) <= 0) {
          session.crawlers[attackerActor.id].kills = (session.crawlers[attackerActor.id].kills || 0) + 1;
        }
      }

      session.ledger.push({
        id: `dmg-dealt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        actorId: attackerActor.id,
        actorName: attackerActor.name,
        actorImg: attackerActor.img || '',
        type: 'damage_dealt',
        name: attackName || 'Damage Dealt',
        isUntrained: false,
        rollFormula: `${netDamage}`,
        d20Result: null,
        total: netDamage,
        targetDC: null,
        outcome: DCC_ROLL_OUTCOMES.SUCCESS,
        notes: targetActor ? `Dealt ${netDamage} damage to ${targetActor.name}` : `Dealt ${netDamage} damage`,
        gmEdited: false
      });
    }

    if (targetActor && (targetActor.type === 'crawler' || (targetActor.id && session.crawlers[targetActor.id]))) {
      if (!session.crawlers[targetActor.id] && targetActor.type === 'crawler') {
        session.crawlers[targetActor.id] = this._createCrawlerRecord(targetActor);
      }
      if (session.crawlers[targetActor.id]) {
        session.crawlers[targetActor.id].damageTaken = (session.crawlers[targetActor.id].damageTaken || 0) + netDamage;
      }

      session.ledger.push({
        id: `dmg-taken-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        actorId: targetActor.id,
        actorName: targetActor.name,
        actorImg: targetActor.img || '',
        type: 'damage_taken',
        name: attackName || 'Damage Taken',
        isUntrained: false,
        rollFormula: `${netDamage}`,
        d20Result: null,
        total: netDamage,
        targetDC: null,
        outcome: DCC_ROLL_OUTCOMES.MAJOR_FAILURE,
        notes: attackerActor ? `Took ${netDamage} damage from ${attackerActor.name}` : `Took ${netDamage} damage`,
        gmEdited: false
      });
    }

    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);
  }

  /**
   * Record AI Loot Box award to active session and ledger
   */
  static async recordLootBox({ actorId, tier = 'bronze', title = '', defaultQuote = '' } = {}) {
    let sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    let session = sessions.find(s => s.id === activeId && s.status === 'active');
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return;

    const actor = this._getActor(actorId);
    if (!session.crawlers[actorId] && actor) {
      session.crawlers[actorId] = this._createCrawlerRecord(actor);
    }

    if (session.crawlers[actorId]) {
      session.crawlers[actorId].lootBoxesAwarded.push(tier);
    }

    const boxTitle = title || `${tier.toUpperCase()} LOOT BOX`;

    session.lootBoxes.push({
      id: `loot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId,
      actorName: actor?.name || 'Unknown Crawler',
      tier,
      title: boxTitle,
      notes: defaultQuote || ''
    });

    session.ledger.push({
      id: `ledger-loot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId,
      actorName: actor?.name || 'Unknown Crawler',
      actorImg: actor?.img || '',
      type: 'loot',
      name: boxTitle,
      isUntrained: false,
      rollFormula: '1 Box',
      d20Result: null,
      total: 1,
      targetDC: null,
      outcome: DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS,
      notes: defaultQuote || `${tier.toUpperCase()} Loot Box awarded`,
      gmEdited: false
    });

    await this.saveAllSessions(sessions);
  }

  /**
   * Adjust crawler AI favor in active session
   */
  static async adjustAIFavor({ actorId, delta = 0, reason = '' } = {}) {
    let sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    let session = sessions.find(s => s.id === activeId && s.status === 'active');
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return;

    const actor = this._getActor(actorId);
    if (!session.crawlers[actorId] && actor) {
      session.crawlers[actorId] = this._createCrawlerRecord(actor);
    }

    if (session.crawlers[actorId]) {
      session.crawlers[actorId].aiFavorDelta = (session.crawlers[actorId].aiFavorDelta || 0) + Number(delta);
    }

    session.ledger.push({
      id: `favor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId,
      actorName: actor?.name || 'Crawler',
      actorImg: actor?.img || '',
      type: 'favor',
      name: `AI Favor ${delta >= 0 ? `+${delta}` : delta}`,
      isUntrained: false,
      rollFormula: `${delta >= 0 ? '+' : ''}${delta}`,
      d20Result: null,
      total: delta,
      targetDC: null,
      outcome: delta >= 0 ? DCC_ROLL_OUTCOMES.SUCCESS : DCC_ROLL_OUTCOMES.FAILURE,
      notes: reason || 'AI Favor adjustment',
      gmEdited: false
    });

    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);
  }

  /**
   * Adjust crawler popularity in active session
   */
  static async adjustPopularity({ actorId, delta = 0, reason = '' } = {}) {
    let sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    let session = sessions.find(s => s.id === activeId && s.status === 'active');
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return;

    const actor = this._getActor(actorId);
    if (!session.crawlers[actorId] && actor) {
      session.crawlers[actorId] = this._createCrawlerRecord(actor);
    }

    if (session.crawlers[actorId]) {
      session.crawlers[actorId].popularityDelta = (session.crawlers[actorId].popularityDelta || 0) + Number(delta);
    }

    session.ledger.push({
      id: `pop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId,
      actorName: actor?.name || 'Crawler',
      actorImg: actor?.img || '',
      type: 'popularity',
      name: `Popularity ${delta >= 0 ? `+${delta}` : delta}`,
      isUntrained: false,
      rollFormula: `${delta >= 0 ? '+' : ''}${delta}`,
      d20Result: null,
      total: delta,
      targetDC: null,
      outcome: delta >= 0 ? DCC_ROLL_OUTCOMES.SUCCESS : DCC_ROLL_OUTCOMES.FAILURE,
      notes: reason || 'Popularity adjustment',
      gmEdited: false
    });

    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);
  }

  /**
   * Create a manual event / action entry in a session with full support for all search filter options.
   * @param {object} params
   * @param {string} params.actorId
   * @param {string} [params.type='manual'] - 'manual', 'skill', 'untrained_skill', 'attack', 'spell', 'favor', 'popularity', 'damage_dealt', 'damage_taken', 'loot', 'stat'
   * @param {string} [params.name='Manual Event']
   * @param {boolean} [params.isUntrained=false]
   * @param {string|number} [params.rollFormula='1d20']
   * @param {number} [params.total=10]
   * @param {number|null} [params.d20Result=null]
   * @param {number|null} [params.targetDC=null]
   * @param {string} [params.outcome='auto'] - 'auto' or one of DCC_ROLL_OUTCOMES
   * @param {number} [params.statDelta=0]
   * @param {string} [params.notes='']
   * @param {string|null} [sessionId=null]
   * @returns {Promise<object|null>}
   */
  static async createManualEvent({
    actorId,
    type = 'manual',
    name = 'Manual Event',
    isUntrained = false,
    rollFormula = '1d20',
    total = 10,
    d20Result = null,
    targetDC = null,
    outcome = 'auto',
    statDelta = 0,
    notes = ''
  } = {}, sessionId = null) {
    let sessions = this.getAllSessions();
    const targetSessionId = sessionId || this.getActiveSessionId();
    let session = sessions.find(s => s.id === targetSessionId);
    if (!session) {
      const active = await this.getActiveSession();
      sessions = this.getAllSessions();
      session = sessions.find(s => s.id === active?.id);
    }
    if (!session) return null;

    const actor = this._getActor(actorId) || this.getPartyCrawlers().find(a => a.id === actorId);
    const cleanActorId = actor?.id || actorId || 'unknown-actor';
    const actorName = actor?.name || 'Party / Crawler';
    const actorImg = actor?.img || 'icons/svg/mystery-man.svg';

    if (!session.crawlers[cleanActorId] && actor) {
      session.crawlers[cleanActorId] = this._createCrawlerRecord(actor);
    }
    const crawlerEntry = session.crawlers[cleanActorId];

    const cleanName = (name || 'Manual Event').trim();
    const numTotal = Number(total) || 0;
    const numD20 = (d20Result !== null && d20Result !== undefined && d20Result !== '') ? Number(d20Result) : null;
    const dc = (targetDC !== null && targetDC !== undefined && targetDC !== '') ? Number(targetDC) : null;
    const delta = Number(statDelta) || 0;
    const isUntrainedFlag = Boolean(isUntrained || type === 'untrained_skill');

    // Determine final outcome
    let evaluatedOutcome;
    if (outcome && outcome !== 'auto' && Object.values(DCC_ROLL_OUTCOMES).includes(outcome)) {
      evaluatedOutcome = outcome;
    } else {
      evaluatedOutcome = evaluateRollOutcome({ total: numTotal, d20Result: numD20, targetDC: dc });
    }

    // Apply stat deltas & metric accumulators to crawler
    if (crawlerEntry) {
      if (type === 'favor') {
        const amt = delta !== 0 ? delta : numTotal;
        crawlerEntry.aiFavorDelta = (crawlerEntry.aiFavorDelta || 0) + amt;
      } else if (type === 'popularity') {
        const amt = delta !== 0 ? delta : numTotal;
        crawlerEntry.popularityDelta = (crawlerEntry.popularityDelta || 0) + amt;
      } else if (type === 'damage_dealt') {
        const dmg = Math.max(0, delta !== 0 ? delta : numTotal);
        crawlerEntry.damageDealt = (crawlerEntry.damageDealt || 0) + dmg;
      } else if (type === 'damage_taken') {
        const dmg = Math.max(0, delta !== 0 ? delta : numTotal);
        crawlerEntry.damageTaken = (crawlerEntry.damageTaken || 0) + dmg;
      } else if (type === 'loot') {
        crawlerEntry.lootBoxesAwarded.push(cleanName.toLowerCase().includes('gold') ? 'gold' : cleanName.toLowerCase().includes('silver') ? 'silver' : 'bronze');
      }

      if (isUntrainedFlag) {
        crawlerEntry.untrainedAttempted[cleanName] = (crawlerEntry.untrainedAttempted[cleanName] || 0) + 1;
      } else if (type === 'skill') {
        crawlerEntry.skillsUsed[cleanName] = (crawlerEntry.skillsUsed[cleanName] || 0) + 1;
      } else if (type === 'spell') {
        crawlerEntry.spellsCast[cleanName] = (crawlerEntry.spellsCast[cleanName] || 0) + 1;
      }
    }

    const ledgerEntry = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actorId: cleanActorId,
      actorName,
      actorImg,
      type,
      name: cleanName,
      isUntrained: isUntrainedFlag,
      rollFormula: String(rollFormula || numTotal),
      d20Result: numD20,
      total: numTotal,
      targetDC: dc,
      outcome: evaluatedOutcome,
      notes: notes.trim(),
      gmEdited: true
    };

    session.ledger.push(ledgerEntry);
    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);

    return ledgerEntry;
  }

  /**
   * Add or update Quest in active session
   */
  static async updateQuest({ id = null, title = '', status = 'active', reward = '', notes = '' } = {}) {
    const sessions = this.getAllSessions();
    const activeId = this.getActiveSessionId();
    const session = sessions.find(s => s.id === activeId && s.status === 'active');
    if (!session) return null;

    let quest = session.quests.find(q => q.id === id);
    if (!quest) {
      quest = {
        id: id || `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim() || 'New Quest',
        status: status || 'active',
        reward: reward.trim(),
        notes: notes.trim(),
        completedAt: status === 'completed' ? Date.now() : null
      };
      session.quests.push(quest);
    } else {
      quest.title = title.trim() || quest.title;
      quest.status = status || quest.status;
      quest.reward = reward.trim();
      quest.notes = notes.trim();
      if (status === 'completed' && !quest.completedAt) quest.completedAt = Date.now();
    }

    await this.saveAllSessions(sessions);
    return quest;
  }

  /**
   * Manually update a ledger entry (outcome, targetDC, notes, etc.)
   */
  static async updateLedgerEntry(sessionId, entryId, updateData = {}) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const entry = session.ledger.find(e => e.id === entryId);
    if (!entry) return null;

    if (updateData.targetDC !== undefined) {
      entry.targetDC = updateData.targetDC !== '' && !isNaN(Number(updateData.targetDC)) ? Number(updateData.targetDC) : null;
      if (updateData.outcome === undefined) {
        entry.outcome = evaluateRollOutcome({ total: entry.total, d20Result: entry.d20Result, targetDC: entry.targetDC });
      }
    }

    if (updateData.outcome !== undefined) {
      entry.outcome = updateData.outcome;
    }
    if (updateData.notes !== undefined) {
      entry.notes = updateData.notes;
    }
    if (updateData.total !== undefined) {
      entry.total = Number(updateData.total) || entry.total;
    }

    entry.gmEdited = true;
    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);
    return entry;
  }

  /**
   * Delete a ledger entry
   */
  static async deleteLedgerEntry(sessionId, entryId) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;

    const idx = session.ledger.findIndex(e => e.id === entryId);
    if (idx >= 0) {
      session.ledger.splice(idx, 1);
      this._recomputeSessionSummaries(session);
      await this.saveAllSessions(sessions);
      return true;
    }
    return false;
  }

  /**
   * Manually adjust a crawler's session aggregate metrics
   */
  static async updateCrawlerStats(sessionId, actorId, stats = {}) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    let c = session.crawlers[actorId];
    if (!c) {
      const actor = this._getActor(actorId);
      c = this._createCrawlerRecord(actor);
      session.crawlers[actorId] = c;
    }

    if (stats.damageDealt !== undefined) c.damageDealt = Math.max(0, Number(stats.damageDealt) || 0);
    if (stats.damageTaken !== undefined) c.damageTaken = Math.max(0, Number(stats.damageTaken) || 0);
    if (stats.kills !== undefined) c.kills = Math.max(0, Number(stats.kills) || 0);
    if (stats.aiFavorDelta !== undefined) c.aiFavorDelta = Number(stats.aiFavorDelta) || 0;
    if (stats.popularityDelta !== undefined) c.popularityDelta = Number(stats.popularityDelta) || 0;

    this._recomputeSessionSummaries(session);
    await this.saveAllSessions(sessions);
    return c;
  }

  /**
   * End & finalize a session, sealing it into historical archive
   */
  static async endSession(sessionId, { summaryNotes = '', mvpActorId = null, chumpActorId = null } = {}) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.status = 'completed';
    session.endedAt = Date.now();
    this._recomputeSessionSummaries(session);

    if (summaryNotes) session.summary.notes = summaryNotes;
    if (mvpActorId) session.summary.mvpActorId = mvpActorId;
    if (chumpActorId) session.summary.chumpActorId = chumpActorId;

    await this.saveAllSessions(sessions);
    return session;
  }

  /**
   * Reopen a completed session for further DM balancing or correction
   */
  static async reopenSession(sessionId) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.status = 'active';
    session.endedAt = null;
    await this.saveAllSessions(sessions);
    await this.setActiveSessionId(session.id);
    return session;
  }

  /**
   * Promote an untrained skill to Rank 1 on a crawler actor document
   * @param {string} actorId
   * @param {string} skillName
   * @returns {Promise<object>}
   */
  static async trainUntrainedSkill(actorId, skillName) {
    const actor = this._getActor(actorId);
    if (!actor) return { success: false, error: 'Actor not found' };

    const norm = skillName.trim().toLowerCase();
    let existing = actor.items?.find?.(i => i.type === 'skill' && i.name.toLowerCase() === norm);

    if (existing) {
      await existing.update({ 'system.rank': Math.max(1, (Number(existing.system?.rank) || 0) + 1) });
      return { success: true, actorName: actor.name, skillName, newRank: existing.system.rank };
    }

    // Try finding definition in CONFIG.DCC.skills
    const canonical = (CONFIG?.DCC?.skills || []).find(s => s.name.toLowerCase() === norm);
    if (canonical) {
      const created = await actor.createEmbeddedDocuments('Item', [{
        name: canonical.name,
        type: 'skill',
        img: canonical.img || 'icons/svg/book.svg',
        system: {
          ...canonical.system,
          rank: 1
        }
      }]);
      return { success: true, actorName: actor.name, skillName: canonical.name, newRank: 1 };
    }

    // Custom skill fallback
    await actor.createEmbeddedDocuments('Item', [{
      name: skillName.trim(),
      type: 'skill',
      img: 'icons/svg/aura.svg',
      system: {
        rank: 1,
        stat: 'str',
        type: 'Utility',
        checkType: 'Check',
        description: 'Trained from field experience during crawler session.'
      }
    }]);

    return { success: true, actorName: actor.name, skillName, newRank: 1 };
  }

  /**
   * Distribute session XP across all participating crawlers
   * @param {string} sessionId
   * @param {object} options
   */
  static async distributeSessionXP(sessionId, { customPool = null, bonusXP = 0 } = {}) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return { distributed: 0, crawlers: [] };

    const crawlerRecords = Object.values(session.crawlers || {});
    if (!crawlerRecords.length) return { distributed: 0, crawlers: [] };

    // Calculate baseline encounter pool or explicit
    let basePool = Number(customPool);
    if (!Number.isFinite(basePool) || basePool <= 0) {
      // Calculate pool from mobs defeated, total damage, and quests
      const dmgPool = Math.round((session.summary.totalDamageDealt || 0) * 1.5);
      const questPool = (session.quests.filter(q => q.status === 'completed').length) * 500;
      const killPool = (session.summary.totalKills || 0) * 200;
      basePool = Math.max(500, dmgPool + questPool + killPool);
    }
    basePool += Math.max(0, Number(bonusXP) || 0);

    // Compute distribution based on damage dealt, damage taken, skills, and kills
    let totalScore = 0;
    const scoredCrawlers = crawlerRecords.map(c => {
      const dealt = c.damageDealt || 0;
      const taken = c.damageTaken || 0;
      const skills = Object.values(c.skillsUsed || {}).reduce((a, b) => a + b, 0);
      const untrained = Object.values(c.untrainedAttempted || {}).reduce((a, b) => a + b, 0);
      const score = (dealt * 1.0) + (taken * 0.8) + (skills * 15) + (untrained * 25) + ((c.kills || 0) * 50) + 100;
      totalScore += score;
      return { ...c, score };
    });

    const results = [];
    for (const sc of scoredCrawlers) {
      const share = totalScore > 0 ? sc.score / totalScore : 1 / scoredCrawlers.length;
      const awardedXP = Math.round(basePool * share);

      const actor = this._getActor(sc.actorId);
      if (actor) {
        const currentXP = Number(actor.system?.details?.xp?.value) || 0;
        const newXP = currentXP + awardedXP;
        await actor.update({ 'system.details.xp.value': newXP });
      }

      results.push({
        actorId: sc.actorId,
        actorName: sc.name,
        awardedXP,
        sharePct: Math.round(share * 100)
      });
    }

    return { totalPool: basePool, crawlers: results };
  }

  /**
   * Broadcast an authentic Dungeon AI review chat message for the session
   */
  static async broadcastAISessionReview(sessionId) {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    this._recomputeSessionSummaries(session);
    const mvp = session.summary.mvpActorId ? session.crawlers[session.summary.mvpActorId] : null;
    const chump = session.summary.chumpActorId ? session.crawlers[session.summary.chumpActorId] : null;

    const crawlerRows = Object.values(session.crawlers || {}).map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dotted #444; padding: 4px 0; font-size: 11px;">
        <span style="font-weight: bold; color: #fff;">${c.name}</span>
        <span style="color: #e74c3c;">${c.damageDealt} DMG</span>
        <span style="color: #f39c12;">${c.damageTaken} TAKEN</span>
        <span style="color: #1abc9c;">${c.aiFavorDelta >= 0 ? `+${c.aiFavorDelta}` : c.aiFavorDelta} FAVOR</span>
        <span style="color: #f1c40f;">${c.popularityDelta >= 0 ? `+${c.popularityDelta}` : c.popularityDelta} POP</span>
      </div>
    `).join('');

    const cardHtml = `
      <div class="dcc-chat-card dcc-session-recap-card" style="font-family: 'Oswald', sans-serif; background: #1a1a20; color: #ecf0f1; border: 2px solid #c0392b; border-radius: 4px; padding: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #c0392b; padding-bottom: 6px; margin-bottom: 8px;">
          <i class="fa-solid fa-satellite-dish" style="color: #e74c3c; font-size: 20px;"></i>
          <div>
            <div style="font-size: 10px; color: #f39c12; letter-spacing: 1px; text-transform: uppercase;">Dungeon Crawler World Broadcast</div>
            <h3 style="margin: 0; color: #fff; font-size: 16px; text-transform: uppercase;">${session.title} — PERFORMANCE RECAP</h3>
          </div>
        </div>

        <p style="font-style: italic; color: #bdc3c7; font-size: 11px; margin-bottom: 8px;">
          "The syndicates were watching, crawlers. Some of you performed like champion slaughterers. The rest of you... well, the audience always enjoys a slow, messy death."
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="background: #27ae6022; border: 1px solid #27ae60; border-radius: 3px; padding: 6px; text-align: center;">
            <div style="font-size: 9px; color: #2ecc71; text-transform: uppercase; font-weight: bold;">⭐ Session MVP</div>
            <div style="font-size: 13px; font-weight: bold; color: #fff;">${mvp ? mvp.name : 'None Selected'}</div>
            <div style="font-size: 10px; color: #bdc3c7;">${mvp ? `${mvp.damageDealt} Net Damage` : ''}</div>
          </div>
          <div style="background: #c0392b22; border: 1px solid #c0392b; border-radius: 3px; padding: 6px; text-align: center;">
            <div style="font-size: 9px; color: #e74c3c; text-transform: uppercase; font-weight: bold;">💀 Target of the Night</div>
            <div style="font-size: 13px; font-weight: bold; color: #fff;">${chump ? chump.name : 'None Selected'}</div>
            <div style="font-size: 10px; color: #bdc3c7;">${chump ? `${chump.damageTaken} Damage Absorbed` : ''}</div>
          </div>
        </div>

        <div style="background: #111; border-radius: 3px; padding: 6px; margin-bottom: 8px;">
          <div style="font-size: 10px; color: #f1c40f; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Party Stats Summary</div>
          ${crawlerRows}
        </div>

        <div style="font-size: 10px; color: #95a5a6; display: flex; justify-content: space-between;">
          <span>Completed Quests: ${session.quests.filter(q => q.status === 'completed').length}</span>
          <span>Loot Boxes Dispatched: ${session.lootBoxes.length}</span>
          <span>Untrained Attempts: ${session.summary.totalUntrainedAttempts}</span>
        </div>
      </div>
    `;

    return ChatMessage.create({
      content: cardHtml,
      speaker: { alias: 'Dungeon AI Control' }
    });
  }

  /**
   * Internal helper to recalculate session summary totals
   */
  static _recomputeSessionSummaries(session) {
    let totalDmg = 0;
    let totalTaken = 0;
    let totalKills = 0;
    let maxDmg = -1;
    let maxTaken = -1;
    let mvpId = session.summary?.mvpActorId || null;
    let chumpId = session.summary?.chumpActorId || null;

    let totalUntrained = 0;
    for (const c of Object.values(session.crawlers || {})) {
      totalDmg += (c.damageDealt || 0);
      totalTaken += (c.damageTaken || 0);
      totalKills += (c.kills || 0);

      const untrainedCount = Object.values(c.untrainedAttempted || {}).reduce((a, b) => a + b, 0);
      totalUntrained += untrainedCount;

      if ((c.damageDealt || 0) > maxDmg) {
        maxDmg = c.damageDealt;
        if (!session.summary?.mvpActorId) mvpId = c.actorId;
      }
      if ((c.damageTaken || 0) > maxTaken) {
        maxTaken = c.damageTaken;
        if (!session.summary?.chumpActorId) chumpId = c.actorId;
      }
    }

    session.summary = session.summary || {};
    session.summary.totalDamageDealt = totalDmg;
    session.summary.totalDamageTaken = totalTaken;
    session.summary.totalKills = totalKills;
    session.summary.totalUntrainedAttempts = totalUntrained;
    session.summary.mvpActorId = mvpId;
    session.summary.chumpActorId = chumpId;
  }

  /**
   * Rerender open windows
   */
  static _refreshOpenWindows() {
    if (typeof ui !== 'undefined' && ui.windows) {
      for (const app of Object.values(ui.windows)) {
        if (app instanceof DCCSessionManagerApp ||
            app.constructor?.name === 'DCCSessionManagerApp' ||
            app.id === 'dcc-session-manager' ||
            app.options?.id === 'dcc-session-manager') {
          app.render(false);
        }
      }
    }
    if (typeof Hooks !== 'undefined' && Hooks.callAll) {
      Hooks.callAll('dccSessionUpdated');
    }
  }
}

/**
 * Dedicated Party Progression & Session Manager Application UI
 */
export class DCCSessionManagerApp extends BaseApplication {
  constructor(options = {}) {
    super(options);
    this.activeTab = options.tab || 'party';
    this.selectedSessionId = options.sessionId || null;
    this.filterCrawlerId = options.crawlerId || 'all';
    this.filterType = 'all';
    this.filterOutcome = 'all';
    this.searchQuery = '';

    if (typeof Hooks !== 'undefined' && Hooks.on) {
      this._hookId = Hooks.on('dccSessionUpdated', () => {
        if (this.rendered) {
          this.render(false);
        }
      });
    }
  }

  async close(options = {}) {
    if (this._hookId && typeof Hooks !== 'undefined' && Hooks.off) {
      Hooks.off('dccSessionUpdated', this._hookId);
    }
    return super.close(options);
  }

  static get defaultOptions() {
    const options = super.defaultOptions || {};
    const merge = (typeof foundry !== 'undefined' && foundry?.utils?.mergeObject)
      ? foundry.utils.mergeObject
      : Object.assign;

    return merge(options, {
      id: 'dcc-session-manager',
      template: 'systems/carl-rpg/templates/apps/session-manager.hbs',
      title: 'Party Progression & Session Manager',
      width: 980,
      height: 760,
      resizable: true,
      scrollY: ['.dcc-session-body', '.dcc-ledger-table-wrap', '.dcc-party-grid'],
      classes: ['dcc-session-manager-app']
    });
  }

  async getData(options = {}) {
    const data = (typeof super.getData === 'function') ? await super.getData(options) : {};

    const sessions = DCCSessionEngine.getAllSessions();
    const activeSessionId = DCCSessionEngine.getActiveSessionId();
    
    // Determine displayed session
    const currentSessionId = this.selectedSessionId || activeSessionId || (sessions[0]?.id) || null;
    let session = sessions.find(s => s.id === currentSessionId);
    if (!session && sessions.length) {
      session = sessions[0];
    }

    // Party crawlers
    const worldCrawlers = DCCSessionEngine.getPartyCrawlers();
    const crawlersList = worldCrawlers.map(actor => {
      const record = session?.crawlers?.[actor.id] || DCCSessionEngine._createCrawlerRecord(actor);
      const hp = actor.system?.attributes?.hp || {};
      const mana = actor.system?.attributes?.mana || {};
      const conMod = actor.system?.abilities?.con?.mod || 1;
      const bars = Math.max(0, Math.floor((Number(hp.value) || 0) / Math.max(1, conMod)));

      const totalSkillsCount = Object.values(record.skillsUsed || {}).reduce((a, b) => a + b, 0);
      const totalUntrainedCount = Object.values(record.untrainedAttempted || {}).reduce((a, b) => a + b, 0);
      const totalSpellsCount = Object.values(record.spellsCast || {}).reduce((a, b) => a + b, 0);

      return {
        ...record,
        actor,
        hpValue: hp.value ?? 0,
        hpMax: hp.max ?? 40,
        hpBars: bars,
        manaValue: mana.value ?? 0,
        manaMax: mana.max ?? 10,
        totalSkillsCount,
        totalUntrainedCount,
        totalSpellsCount,
        isSelected: this.filterCrawlerId === actor.id
      };
    });

    // Process Activity Ledger
    let ledger = (session?.ledger || []).map(entry => {
      const outcomeCfg = DCC_OUTCOME_CONFIG[entry.outcome] || DCC_OUTCOME_CONFIG.pending;
      return {
        ...entry,
        outcomeLabel: outcomeCfg.label,
        outcomeBadge: outcomeCfg.badge,
        outcomeClass: outcomeCfg.class,
        dateFormatted: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    }).reverse(); // Most recent first

    // Filtering
    if (this.filterCrawlerId && this.filterCrawlerId !== 'all') {
      ledger = ledger.filter(e => e.actorId === this.filterCrawlerId);
    }
    if (this.filterType && this.filterType !== 'all') {
      ledger = ledger.filter(e => e.type === this.filterType);
    }
    if (this.filterOutcome && this.filterOutcome !== 'all') {
      ledger = ledger.filter(e => e.outcome === this.filterOutcome);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      ledger = ledger.filter(e => 
        (e.name || '').toLowerCase().includes(q) || 
        (e.actorName || '').toLowerCase().includes(q) || 
        (e.notes || '').toLowerCase().includes(q)
      );
    }

    // Untrained skills for Wrap-up Review
    const untrainedSkillsReview = [];
    if (session?.crawlers) {
      for (const [actorId, c] of Object.entries(session.crawlers)) {
        for (const [skillName, count] of Object.entries(c.untrainedAttempted || {})) {
          untrainedSkillsReview.push({
            actorId,
            actorName: c.name,
            skillName,
            count
          });
        }
      }
    }

    return {
      ...data,
      sessions,
      session,
      isActiveSession: session?.status === 'active',
      activeSessionId,
      currentSessionId,
      activeTab: this.activeTab,
      crawlersList,
      ledger,
      untrainedSkillsReview,
      filterCrawlerId: this.filterCrawlerId,
      filterType: this.filterType,
      filterOutcome: this.filterOutcome,
      searchQuery: this.searchQuery,
      outcomeOptions: Object.entries(DCC_OUTCOME_CONFIG).map(([key, cfg]) => ({
        key,
        label: cfg.label
      }))
    };
  }

  /**
   * Generate HTML for the Add Event Dialog
   */
  static getAddEventDialogHtml({ crawlers = [], currentCrawlerId = '', currentType = 'manual', currentOutcome = 'auto', outcomes = [] } = {}) {
    const crawlerOptions = crawlers.map(c => `
      <option value="${c.actorId}" ${c.actorId === currentCrawlerId ? 'selected' : ''}>${c.name} (Lvl ${c.level})</option>
    `).join('');

    const outcomeOptions = outcomes.map(o => `
      <option value="${o.key}" ${o.key === currentOutcome ? 'selected' : ''}>${o.label}</option>
    `).join('');

    return `
      <form class="dcc-add-event-form" style="font-family: 'Oswald', sans-serif; display: flex; flex-direction: column; gap: 10px; color: #ecf0f1; padding: 4px;">
        <div style="font-size: 11px; color: #f1c40f; border-bottom: 1px solid #444; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          <i class="fa-solid fa-pen-to-square"></i> Log Party or Crawler Event
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
          <label style="font-size: 11px; text-transform: uppercase; color: #bdc3c7; font-weight: bold;">Crawler:</label>
          <select name="actorId" class="dcc-dialog-select" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif;">
            ${crawlerOptions}
          </select>
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
          <label style="font-size: 11px; text-transform: uppercase; color: #bdc3c7; font-weight: bold;">Action / Event Type:</label>
          <select name="type" class="dcc-dialog-select dcc-event-type-select" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif;">
            <option value="manual" ${currentType === 'manual' ? 'selected' : ''}>Manual / Custom Event</option>
            <option value="skill" ${currentType === 'skill' ? 'selected' : ''}>Trained Skill Check</option>
            <option value="untrained_skill" ${currentType === 'untrained_skill' ? 'selected' : ''}>Untrained Skill Attempt (Disadvantage)</option>
            <option value="attack" ${currentType === 'attack' ? 'selected' : ''}>Attack / Strike</option>
            <option value="spell" ${currentType === 'spell' ? 'selected' : ''}>Spell Cast</option>
            <option value="favor" ${currentType === 'favor' ? 'selected' : ''}>AI Favor Adjustment</option>
            <option value="popularity" ${currentType === 'popularity' ? 'selected' : ''}>Popularity Shift</option>
            <option value="damage_dealt" ${currentType === 'damage_dealt' ? 'selected' : ''}>Damage Dealt</option>
            <option value="damage_taken" ${currentType === 'damage_taken' ? 'selected' : ''}>Damage Taken</option>
            <option value="loot" ${currentType === 'loot' ? 'selected' : ''}>Loot Box Awarded</option>
            <option value="stat" ${currentType === 'stat' ? 'selected' : ''}>Stat Check</option>
          </select>
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
          <label style="font-size: 11px; text-transform: uppercase; color: #bdc3c7; font-weight: bold;">Action / Event Name:</label>
          <input type="text" name="name" class="dcc-dialog-input" placeholder="e.g. Lockpicking, Warhammer Smash, Audience Cheer..." value="" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px 6px; border-radius: 3px; font-family: 'Oswald', sans-serif;" required />
        </div>

        <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="isUntrained" id="dcc-event-is-untrained" ${currentType === 'untrained_skill' ? 'checked' : ''} style="cursor: pointer;" />
          <label for="dcc-event-is-untrained" style="font-size: 11px; color: #f5b7b1; cursor: pointer; font-weight: bold;">Flag as Untrained Attempt (Tracked for End-of-Session Promotion)</label>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
            <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Formula:</label>
            <input type="text" name="rollFormula" value="1d20" placeholder="1d20" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;" />
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
            <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Roll Total:</label>
            <input type="number" name="total" value="10" placeholder="Total" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;" />
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
            <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Natural d20 (1-20):</label>
            <input type="number" name="d20Result" min="1" max="20" placeholder="Die face" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
            <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Target DC / AC:</label>
            <input type="number" name="targetDC" placeholder="e.g. 15" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;" />
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
            <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">7-Tier Outcome:</label>
            <select name="outcome" class="dcc-dialog-select" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;">
              <option value="auto" ${currentOutcome === 'auto' ? 'selected' : ''}>[Auto-Calculate from DC & Total]</option>
              ${outcomeOptions}
            </select>
          </div>
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
          <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Stat / Resource Delta (+/- Favor, Popularity, or Damage):</label>
          <input type="number" name="statDelta" value="0" placeholder="e.g. +5, -2, 20" style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px;" />
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 3px;">
          <label style="font-size: 10px; text-transform: uppercase; color: #bdc3c7;">Notes / Description:</label>
          <textarea name="notes" rows="2" placeholder="Optional notes or details..." style="background: #1e1e28; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 3px; font-family: 'Oswald', sans-serif; font-size: 11px; resize: vertical;"></textarea>
        </div>
      </form>
    `;
  }

  /**
   * Prompt the interactive Add Event Dialog with all search filter options.
   * On submission, records the event and ensures the newly created event is immediately visible in real time.
   * @returns {Promise<object|null>}
   */
  async promptAddEventDialog() {
    const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
    const worldCrawlers = DCCSessionEngine.getPartyCrawlers();
    if (!worldCrawlers.length) {
      if (typeof ui !== 'undefined' && ui.notifications?.warn) {
        ui.notifications.warn('No crawler actors found in world to associate event with.');
      }
      return null;
    }

    const crawlers = worldCrawlers.map(a => ({
      actorId: a.id,
      name: a.name,
      level: Number(a.system?.details?.level) || 1
    }));

    const currentCrawlerId = (this.filterCrawlerId && this.filterCrawlerId !== 'all')
      ? this.filterCrawlerId
      : crawlers[0]?.actorId;

    const currentType = (this.filterType && this.filterType !== 'all') ? this.filterType : 'manual';
    const currentOutcome = (this.filterOutcome && this.filterOutcome !== 'all') ? this.filterOutcome : 'auto';

    const outcomes = Object.entries(DCC_OUTCOME_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label
    }));

    const dialogData = {
      crawlers,
      currentCrawlerId,
      currentType,
      currentOutcome,
      outcomes
    };

    let contentHtml = '';
    if (typeof renderTemplate === 'function') {
      try {
        contentHtml = await renderTemplate('systems/carl-rpg/templates/apps/add-event-dialog.hbs', dialogData);
      } catch (_) {
        contentHtml = DCCSessionManagerApp.getAddEventDialogHtml(dialogData);
      }
    } else {
      contentHtml = DCCSessionManagerApp.getAddEventDialogHtml(dialogData);
    }

    const DialogClass = (typeof Dialog !== 'undefined') ? Dialog : (globalThis.Dialog || null);
    if (!DialogClass) return null;

    return new Promise((resolve) => {
      const dlg = new DialogClass({
        title: 'Log Party or Crawler Event',
        content: contentHtml,
        buttons: {
          create: {
            icon: '<i class="fa-solid fa-plus"></i>',
            label: 'Add Event',
            callback: async (html) => {
              const form = (html && typeof html.find === 'function')
                ? (html.is?.('.dcc-add-event-form') ? html : (html.find('.dcc-add-event-form')?.length ? html.find('.dcc-add-event-form') : html))
                : ((typeof $ !== 'undefined') ? $(html) : html);

              const getVal = (selector) => {
                if (form?.find) {
                  const el = form.find(selector);
                  return (typeof el?.val === 'function') ? el.val() : (el?.value !== undefined ? el.value : '');
                }
                return '';
              };
              const isChecked = (selector) => {
                if (form?.find) {
                  const el = form.find(selector);
                  if (typeof el?.is === 'function') return el.is(':checked');
                  return Boolean(el?.checked);
                }
                return false;
              };

              const actorId = getVal('[name="actorId"]') || currentCrawlerId;
              const type = getVal('[name="type"]') || 'manual';
              const name = getVal('[name="name"]') || 'Manual Event';
              const isUntrained = isChecked('[name="isUntrained"]');
              const rollFormula = getVal('[name="rollFormula"]') || '1d20';
              const total = Number(getVal('[name="total"]')) || 0;
              const d20Val = getVal('[name="d20Result"]');
              const d20Result = (d20Val !== '' && d20Val !== undefined && d20Val !== null) ? Number(d20Val) : null;
              const dcVal = getVal('[name="targetDC"]');
              const targetDC = (dcVal !== '' && dcVal !== undefined && dcVal !== null) ? Number(dcVal) : null;
              const outcome = getVal('[name="outcome"]') || 'auto';
              const statDelta = Number(getVal('[name="statDelta"]')) || 0;
              const notes = getVal('[name="notes"]') || '';

              const entry = await DCCSessionEngine.createManualEvent({
                actorId,
                type,
                name,
                isUntrained,
                rollFormula,
                total,
                d20Result,
                targetDC,
                outcome,
                statDelta,
                notes
              }, sId);

              // Auto-adjust filters so the newly created event is immediately visible
              if (this.filterCrawlerId !== 'all' && this.filterCrawlerId !== actorId) {
                this.filterCrawlerId = 'all';
              }
              if (this.filterType !== 'all' && this.filterType !== type) {
                this.filterType = 'all';
              }
              if (this.filterOutcome !== 'all' && this.filterOutcome !== outcome && outcome !== 'auto') {
                this.filterOutcome = 'all';
              }
              this.searchQuery = '';
              this.activeTab = 'ledger';
              this.render(false);
              resolve(entry);
            }
          },
          cancel: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: 'Cancel',
            callback: () => resolve(null)
          }
        },
        default: 'create'
      });
      dlg.render(true);
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Tab Navigation
    html.find('.dcc-tab-nav-btn').click(ev => {
      ev.preventDefault();
      this.activeTab = $(ev.currentTarget).data('tab');
      this.render(false);
    });

    // Session Switcher
    html.find('#dcc-session-select').change(ev => {
      this.selectedSessionId = ev.target.value;
      this.render(false);
    });

    // + New Session Button
    html.find('.dcc-new-session-btn').click(async ev => {
      ev.preventDefault();
      const sessions = DCCSessionEngine.getAllSessions();
      const nextNum = sessions.length + 1;
      const created = await DCCSessionEngine.createSession({ number: nextNum, title: `Session ${nextNum}` });
      this.selectedSessionId = created.id;
      this.render(false);
    });

    // Set Active Session Button
    html.find('.dcc-set-active-session-btn').click(async ev => {
      ev.preventDefault();
      const sId = $(ev.currentTarget).data('session-id');
      await DCCSessionEngine.setActiveSessionId(sId);
      this.render(false);
    });

    // End / Complete Session Button
    html.find('.dcc-end-session-btn').click(async ev => {
      ev.preventDefault();
      const sId = $(ev.currentTarget).data('session-id');
      await DCCSessionEngine.endSession(sId);
      this.render(false);
    });

    // Reopen Session Button
    html.find('.dcc-reopen-session-btn').click(async ev => {
      ev.preventDefault();
      const sId = $(ev.currentTarget).data('session-id');
      await DCCSessionEngine.reopenSession(sId);
      this.render(false);
    });

    // Party Filter Selector / Click on Crawler Card
    html.find('.dcc-crawler-card').click(ev => {
      const actorId = $(ev.currentTarget).data('actor-id');
      this.filterCrawlerId = (this.filterCrawlerId === actorId) ? 'all' : actorId;
      this.render(false);
    });

    // Quick +/- adjustments on Crawler Cards
    html.find('.dcc-stat-adjust-btn').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const btn = $(ev.currentTarget);
      const actorId = btn.data('actor-id');
      const statKey = btn.data('stat');
      const delta = Number(btn.data('delta')) || 0;
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();

      const session = DCCSessionEngine.getAllSessions().find(s => s.id === sId);
      if (!session) return;
      const currentVal = Number(session.crawlers?.[actorId]?.[statKey]) || 0;
      await DCCSessionEngine.updateCrawlerStats(sId, actorId, { [statKey]: currentVal + delta });
      this.render(false);
    });

    // Filter controls in Ledger
    html.find('#dcc-filter-crawler').change(ev => {
      this.filterCrawlerId = ev.target.value;
      this.render(false);
    });
    html.find('#dcc-filter-type').change(ev => {
      this.filterType = ev.target.value;
      this.render(false);
    });
    html.find('#dcc-filter-outcome').change(ev => {
      this.filterOutcome = ev.target.value;
      this.render(false);
    });
    html.find('#dcc-filter-search').on('input', ev => {
      this.searchQuery = ev.target.value;
      // Debounce or filter in memory
      this._applyLedgerFilter(html);
    });

    // Inline edit Target DC in Ledger
    html.find('.dcc-ledger-dc-input').change(async ev => {
      const input = $(ev.currentTarget);
      const entryId = input.data('entry-id');
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
      await DCCSessionEngine.updateLedgerEntry(sId, entryId, { targetDC: input.val() });
      this.render(false);
    });

    // Inline edit Outcome in Ledger
    html.find('.dcc-ledger-outcome-select').change(async ev => {
      const select = $(ev.currentTarget);
      const entryId = select.data('entry-id');
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
      await DCCSessionEngine.updateLedgerEntry(sId, entryId, { outcome: select.val() });
      this.render(false);
    });

    // Delete Ledger Entry
    html.find('.dcc-ledger-delete-btn').click(async ev => {
      ev.preventDefault();
      const entryId = $(ev.currentTarget).data('entry-id');
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
      await DCCSessionEngine.deleteLedgerEntry(sId, entryId);
      this.render(false);
    });

    // Add Manual Ledger Event Button (opens customized dialog with search filter options)
    html.find('.dcc-add-manual-event-btn').click(async ev => {
      ev.preventDefault();
      await this.promptAddEventDialog();
    });

    // Wrap-up: Promote Untrained Skill to Rank 1
    html.find('.dcc-train-skill-btn').click(async ev => {
      ev.preventDefault();
      const btn = $(ev.currentTarget);
      const actorId = btn.data('actor-id');
      const skillName = btn.data('skill-name');
      const res = await DCCSessionEngine.trainUntrainedSkill(actorId, skillName);
      if (res.success) {
        if (ui.notifications?.info) ui.notifications.info(`DCC RPG | ${res.actorName} trained ${res.skillName} to Rank 1!`);
        btn.replaceWith('<span style="color: #27ae60; font-weight: bold;"><i class="fa-solid fa-check"></i> Trained (Rank 1)</span>');
      }
    });

    // Wrap-up: Distribute Session XP
    html.find('.dcc-distribute-session-xp-btn').click(async ev => {
      ev.preventDefault();
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
      const bonusXP = Number(html.find('#dcc-bonus-xp-input').val()) || 0;
      const res = await DCCSessionEngine.distributeSessionXP(sId, { bonusXP });
      if (ui.notifications?.info) {
        ui.notifications.info(`DCC RPG | Distributed ${res.totalPool} XP across ${res.crawlers.length} crawlers!`);
      }
      this.render(false);
    });

    // Wrap-up: Broadcast AI Review Card
    html.find('.dcc-broadcast-review-btn').click(async ev => {
      ev.preventDefault();
      const sId = this.selectedSessionId || DCCSessionEngine.getActiveSessionId();
      await DCCSessionEngine.broadcastAISessionReview(sId);
      if (ui.notifications?.info) ui.notifications.info('DCC RPG | Dungeon AI Performance Review card posted to chat!');
    });
  }

  _applyLedgerFilter(html) {
    const q = (this.searchQuery || '').toLowerCase();
    html.find('.dcc-ledger-row').each((i, el) => {
      const row = $(el);
      const text = row.text().toLowerCase();
      if (!q || text.includes(q)) {
        row.show();
      } else {
        row.hide();
      }
    });
  }
}
