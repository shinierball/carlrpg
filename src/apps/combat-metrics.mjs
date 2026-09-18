/**
 * Dungeon Crawler Carl RPG — Combat Metrics & AI Awards
 * 
 * Tracks actual damage applied and skill usage per crawler,
 * scoped cleanly to Foundry VTT's Combat documents.
 */

import { DCCCombat } from '../documents/combat.mjs';
import { DCCExperienceTracker } from './xp-tracker.mjs';
import { DCCCombatArchiveApp } from './combat-archive.mjs';
import { DCCSessionEngine } from './session-manager.mjs';
import { DCCBaseApplication } from './base-application.mjs';

const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog
  ?? globalThis.Dialog;

/**
 * Calculate HP per damage bar for an actor.
 * In CarlRPG, health is measured in 10 bars, where each bar represents CON modifier HP.
 * When applying damage, only full damage bars (rounded down) are deducted; excess damage is ignored.
 * @param {Actor} targetActor
 * @returns {number}
 */
export function getHpPerBar(targetActor) {
  if (!targetActor) return 1;

  // 0. Explicit hpPerBar if specified on the actor (especially for mobs or custom creatures)
  const explicitHpPerBar = Number(targetActor.system?.attributes?.hp?.hpPerBar);
  if (Number.isFinite(explicitHpPerBar) && explicitHpPerBar > 0) {
    return explicitHpPerBar;
  }

  // 1. Direct CON modifier if already prepared
  const conMod = Number(targetActor.system?.abilities?.con?.mod);
  if (Number.isFinite(conMod) && conMod > 0) {
    return conMod;
  }

  // 2. Score lookup if modifier not computed yet
  const conScore = targetActor.system?.abilities?.con?.value ?? targetActor.system?.abilities?.con?.unenhanced;
  if (conScore !== undefined && conScore !== null && conScore !== '') {
    const val = Number(conScore) || 0;
    if (val >= 300) return 10;
    if (val >= 200) return 9;
    if (val >= 150) return 8;
    if (val >= 100) return 7;
    if (val >= 50) return 6;
    if (val >= 20) return 5;
    if (val >= 10) return 4;
    if (val >= 6) return 3;
    if (val >= 3) return 2;
    if (val >= 1) return 1;
  }

  // 3. Max HP fallback (divided by bars: default 10 for crawlers, or mob bars)
  const bars = Number(targetActor.system?.attributes?.hp?.bars) || (targetActor.type === 'mob' ? 2 : 10);
  const maxHp = Number(targetActor.system?.attributes?.hp?.max);
  if (Number.isFinite(maxHp) && maxHp > 0) {
    return Math.max(1, Math.floor(maxHp / bars));
  }

  return 1;
}

export class DCCCombatMetrics {
  /**
   * Get target combat document
   * @param {string|null} combatId 
   * @returns {Combat|null}
   */
  static getCombat(combatId = null) {
    if (typeof game === 'undefined' || !game.combats) return null;
    if (combatId) return game.combats.get(combatId) || null;
    return game.combat || game.combats.contents?.[0] || null;
  }

  /**
   * Retrieve all metrics for a combat
   * @param {Combat|null} combat 
   * @returns {object}
   */
  static getMetrics(combat = null) {
    const c = combat || this.getCombat();
    if (!c) return {};
    return c.getFlag?.('carl-rpg', 'metrics') || c.flags?.['carl-rpg']?.metrics || c.metrics || {};
  }

  /**
   * Initialize or retrieve crawler metrics record in a combat
   * @param {object} metrics 
   * @param {Actor|null} actor 
   * @param {string|null} [actorId=null]
   * @returns {object}
   */
  static _getOrCreateActorEntry(metrics, actor, actorId = null) {
    const id = actor?.id || actorId;
    if (!id) return null;
    if (!metrics[id]) {
      metrics[id] = {
        actorId: id,
        actorName: actor?.name || 'Unknown Combatant',
        actorImg: actor?.img || actor?.prototypeToken?.texture?.src || 'icons/svg/mystery-man.svg',
        totalDamage: 0,
        damageTaken: 0,
        highestHit: 0,
        kills: 0,
        attacks: {},
        skills: {}
      };
    }
    if (actor?.name) metrics[id].actorName = actor.name;
    if (actor?.img) metrics[id].actorImg = actor.img;
    return metrics[id];
  }

  /**
   * Record actual net damage applied to a target in combat
   * @param {object} params
   * @param {Combat} [params.combat]
   * @param {Actor} params.attackerActor
   * @param {Actor} [params.targetActor]
   * @param {number} params.rawDamage
   * @param {number} [params.dr=0]
   * @param {number} params.actualDamage
   * @param {string} [params.attackName='Attack']
   * @param {string} [params.attackType='Melee']
   * @returns {Promise<object>}
   */
  static async recordActualDamage({ combat = null, attackerActor, targetActor = null, rawDamage = 0, dr = 0, actualDamage = 0, attackName = 'Attack', attackType = 'Melee' } = {}) {
    if (!attackerActor) return { logged: false, reason: 'no-attacker' };

    let c = combat || this.getCombat();
    if (!c && game.combats) {
      c = game.combats.find(cb => cb.combatants?.some(con => con.actorId === attackerActor.id));
    }
    if (!c) return { logged: false, reason: 'no-combat' };

    const metrics = structuredClone(this.getMetrics(c));
    const entry = this._getOrCreateActorEntry(metrics, attackerActor);
    if (!entry) return { logged: false, reason: 'invalid-actor' };

    const netDamage = Math.max(0, Number(actualDamage) || 0);
    entry.totalDamage = (entry.totalDamage || 0) + netDamage;
    entry.highestHit = Math.max(entry.highestHit || 0, netDamage);

    // Track damage taken and kills on targetActor
    if (targetActor) {
      const targetEntry = this._getOrCreateActorEntry(metrics, targetActor);
      if (targetEntry) {
        targetEntry.damageTaken = (targetEntry.damageTaken || 0) + netDamage;
      }
      const targetHp = Number(targetActor.system?.attributes?.hp?.value);
      if (Number.isFinite(targetHp) && targetHp <= 0) {
        entry.kills = (entry.kills || 0) + 1;
      }
    }

    // Track per attack
    const key = attackName.trim() || 'Unspecified Attack';
    if (!entry.attacks[key]) {
      entry.attacks[key] = { count: 0, damage: 0, type: attackType };
    }
    entry.attacks[key].count = (entry.attacks[key].count || 0) + 1;
    entry.attacks[key].damage = (entry.attacks[key].damage || 0) + netDamage;
    entry.attacks[key].type = attackType;

    await c.setFlag('carl-rpg', 'metrics', metrics);
    this._refreshOpenWindows();

    // Sync to active session progression
    if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordDamage === 'function') {
      DCCSessionEngine.recordDamage({
        attackerActor,
        targetActor,
        actualDamage: netDamage,
        attackName,
        type: attackType
      }).catch(() => {});
    }

    return {
      logged: true,
      combatId: c.id,
      actualDamage: netDamage,
      totalDamage: entry.totalDamage,
      attackerName: attackerActor.name
    };
  }

  /**
   * Record net damage taken by a target actor in combat
   * @param {object} params
   * @param {Combat} [params.combat]
   * @param {Actor} params.targetActor
   * @param {Actor} [params.attackerActor=null]
   * @param {number} params.actualDamage
   * @returns {Promise<object>}
   */
  static async recordDamageTaken({ combat = null, targetActor, attackerActor = null, actualDamage = 0 } = {}) {
    if (!targetActor) return { logged: false, reason: 'no-target' };

    let c = combat || this.getCombat();
    if (!c && game.combats) {
      c = game.combats.find(cb => cb.combatants?.some(con => con.actorId === targetActor.id));
    }
    if (!c) return { logged: false, reason: 'no-combat' };

    const metrics = structuredClone(this.getMetrics(c));
    const targetEntry = this._getOrCreateActorEntry(metrics, targetActor);
    if (!targetEntry) return { logged: false, reason: 'invalid-target' };

    const netDamage = Math.max(0, Number(actualDamage) || 0);
    targetEntry.damageTaken = (targetEntry.damageTaken || 0) + netDamage;

    await c.setFlag('carl-rpg', 'metrics', metrics);
    this._refreshOpenWindows();

    return {
      logged: true,
      combatId: c.id,
      damageTaken: netDamage,
      totalDamageTaken: targetEntry.damageTaken,
      targetName: targetActor.name
    };
  }

  /**
   * Calculate HP per damage bar for an actor (each bar represents CON mod HP)
   * @param {Actor} targetActor
   * @returns {number}
   */
  static getHpPerBar(targetActor) {
    return getHpPerBar(targetActor);
  }

  /**
   * Apply damage to a target actor, accounting for DR, Temp HP, and full damage bars.
   * Only full damage bars (rounded down) are removed from regular HP; excess damage is ignored.
   * @param {object} params
   * @param {Actor} params.targetActor
   * @param {number} params.rawDamage
   * @param {Actor} [params.attackerActor=null]
   * @param {string} [params.attackName='Attack']
   * @param {string} [params.attackType='Melee']
   * @param {boolean} [params.ignoreDR=false]
   * @param {number} [params.multiplier=1]
   * @param {Combat} [params.combat=null]
   * @returns {Promise<object>}
   */
  static async applyDamageToTarget({ targetActor, rawDamage, attackerActor = null, attackName = 'Attack', attackType = 'Melee', ignoreDR = false, multiplier = 1, combat = null, damageType = '', typedDamage = null }) {
    if (!targetActor) return { error: 'No target actor' };

    const mult = Number(multiplier) || 1;

    // Process either typedDamage dictionary or legacy rawDamage + damageType
    let totalAdjustedRaw = 0;
    let anyImmune = false;
    let anyResistant = false;
    const typeBreakdown = {};

    const damageBuckets = typedDamage && typeof typedDamage === 'object'
      ? { ...typedDamage }
      : (damageType ? { [damageType]: Number(rawDamage) || 0 } : { 'Physical': Number(rawDamage) || 0 });

    for (const [dt, rawAmt] of Object.entries(damageBuckets)) {
      const initialAmt = Math.max(0, Math.floor((Number(rawAmt) || 0) * mult));
      let currentAmt = initialAmt;
      let isImmune = false;
      let isResistant = false;

      // 1. Check if targetActor has getDamageReduction (handles immunity, resistance, debuffs with rounding)
      if (typeof targetActor.getDamageReduction === 'function') {
        const red = targetActor.getDamageReduction(dt);
        if (red.isImmune) {
          isImmune = true;
          anyImmune = true;
          currentAmt = 0;
        } else {
          if (red.isResistant) {
            isResistant = true;
            anyResistant = true;
          }
          if (red.percent > 0) {
            const reduction = red.rounding === 'up'
              ? Math.ceil(currentAmt * red.percent)
              : Math.floor(currentAmt * red.percent);
            currentAmt = Math.max(0, currentAmt - reduction);
          }
          if (red.flat > 0) {
            currentAmt = Math.max(0, currentAmt - red.flat);
          }
        }
      } else {
        // Fallback to legacy hasImmunity / hasResistance
        if (typeof targetActor.hasImmunity === 'function' && targetActor.hasImmunity(dt)) {
          isImmune = true;
          anyImmune = true;
          currentAmt = 0;
        } else if (typeof targetActor.hasResistance === 'function' && targetActor.hasResistance(dt)) {
          isResistant = true;
          anyResistant = true;
          currentAmt = Math.floor(currentAmt / 2);
        }
      }

      typeBreakdown[dt] = {
        initial: initialAmt,
        final: currentAmt,
        isImmune,
        isResistant
      };
      totalAdjustedRaw += currentAmt;
    }

    const adjustedRaw = totalAdjustedRaw;
    const isImmune = anyImmune && totalAdjustedRaw === 0;
    const isResistant = anyResistant;
    const dr = ignoreDR ? 0 : (Number(targetActor.system?.attributes?.dr?.total) || 0);
    const damageAfterDR = Math.max(0, adjustedRaw - dr);

    // HP per damage bar (determined by CON modifier: 1 bar = CON mod HP)
    const hpPerBar = this.getHpPerBar(targetActor);

    // Deduct from Temp HP first point-for-point
    const currentTemp = Number(targetActor.system?.attributes?.hp?.temp) || 0;
    const currentHp = Number(targetActor.system?.attributes?.hp?.value) || 0;
    let tempRemaining = currentTemp;
    let tempDamage = 0;
    let damagePenetrating = damageAfterDR;

    if (currentTemp > 0) {
      if (damageAfterDR <= currentTemp) {
        tempDamage = damageAfterDR;
        tempRemaining = currentTemp - damageAfterDR;
        damagePenetrating = 0;
      } else {
        tempDamage = currentTemp;
        tempRemaining = 0;
        damagePenetrating = damageAfterDR - currentTemp;
      }
    }

    // Only remove full damage bars rounded down from regular HP. Excess damage is ignored.
    const barsRemoved = Math.floor(damagePenetrating / hpPerBar);
    const damageToHp = barsRemoved * hpPerBar;
    const excessDamage = damagePenetrating - damageToHp;
    const actualDamage = tempDamage + damageToHp;

    const newHp = Math.max(0, currentHp - damageToHp);

    await targetActor.update({
      'system.attributes.hp.value': newHp,
      'system.attributes.hp.temp': tempRemaining
    });

    // Record in combat metrics if attacker provided
    let loggedMetrics = null;
    if (attackerActor) {
      loggedMetrics = await this.recordActualDamage({
        combat,
        attackerActor,
        targetActor,
        rawDamage: adjustedRaw,
        dr,
        actualDamage,
        attackName,
        attackType
      });
    } else if (targetActor && actualDamage > 0) {
      loggedMetrics = await this.recordDamageTaken({
        combat,
        targetActor,
        attackerActor: null,
        actualDamage
      });
    }

    // Always ensure damage logs to session progression even if out of combat
    if ((!loggedMetrics || !loggedMetrics.logged) && actualDamage > 0) {
      if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordDamage === 'function') {
        DCCSessionEngine.recordDamage({
          attackerActor,
          targetActor,
          actualDamage,
          attackName,
          type: attackType
        }).catch(() => {});
      }
    }

    return {
      targetId: targetActor.id,
      targetName: targetActor.name,
      rawDamage: adjustedRaw,
      dr,
      damageAfterDR,
      hpPerBar,
      barsRemoved,
      excessDamage,
      damageToHp,
      tempDamage,
      actualDamage,
      newHp,
      tempRemaining,
      damageType,
      typedDamage: damageBuckets,
      typeBreakdown,
      isImmune,
      isResistant,
      loggedMetrics
    };
  }

  /**
   * Record tactical skill usage in active combat
   * @param {object} params
   * @param {Combat} [params.combat]
   * @param {Actor} params.actor
   * @param {string} params.skillName
   * @returns {Promise<boolean>}
   */
  static async recordSkillUsage({ combat = null, actor, skillName } = {}) {
    if (!actor || !skillName) return false;

    let c = combat || this.getCombat();
    if (!c && game.combats) {
      c = game.combats.find(cb => cb.combatants?.some(con => con.actorId === actor.id));
    }
    if (!c) return false;

    // Only track if actor is in this combat
    const isCombatant = c.combatants?.some(con => con.actorId === actor.id);
    if (!isCombatant) return false;

    const metrics = structuredClone(this.getMetrics(c));
    const entry = this._getOrCreateActorEntry(metrics, actor);
    if (!entry) return false;

    const key = skillName.trim();
    entry.skills[key] = (entry.skills[key] || 0) + 1;

    await c.setFlag('carl-rpg', 'metrics', metrics);
    this._refreshOpenWindows();
    return true;
  }

  /**
   * Manually adjust damage for an actor in a combat
   * @param {Combat} combat 
   * @param {string} actorId 
   * @param {number} delta 
   * @returns {Promise<object>}
   */
  static async adjustDamage(combat, actorId, delta) {
    const c = combat || this.getCombat();
    if (!c) return null;

    const metrics = structuredClone(this.getMetrics(c));
    let actor = game.actors?.get?.(actorId) || c.combatants?.find?.(con => (con.actorId || con.actor?.id) === actorId)?.actor || null;
    if (!metrics[actorId]) {
      this._getOrCreateActorEntry(metrics, actor, actorId);
    }

    const entry = metrics[actorId];
    if (!entry) return null;
    entry.totalDamage = Math.max(0, (entry.totalDamage || 0) + Number(delta));

    if (typeof c.setFlag === 'function') {
      await c.setFlag('carl-rpg', 'metrics', metrics);
    } else if (typeof DCCCombat !== 'undefined') {
      c.metrics = metrics;
      const combatant = (c.combatants || []).find(con => (con.actorId || con.actor?.id) === actorId);
      if (combatant) {
        combatant.damageDealt = entry.totalDamage;
      }
      await DCCCombat.saveArchivedCombat(c);
    }
    this._refreshOpenWindows();
    return entry;
  }

  /**
   * Reset all metrics for a combat
   * @param {Combat} combat 
   */
  static async resetMetrics(combat = null) {
    const c = combat || this.getCombat();
    if (!c) return;
    if (typeof c.unsetFlag === 'function') {
      await c.unsetFlag('carl-rpg', 'metrics');
    } else if (typeof DCCCombat !== 'undefined') {
      c.metrics = {
        totalDamageDealt: 0,
        mvp: null,
        awards: [],
        events: []
      };
      for (const combatant of (c.combatants || [])) {
        combatant.damageDealt = 0;
        combatant.damageTaken = 0;
        combatant.highestHit = 0;
        combatant.kills = 0;
      }
      await DCCCombat.saveArchivedCombat(c);
    }
    this._refreshOpenWindows();
  }

  /**
   * Dispatch an AI Award to chat and update actor stats (e.g. AI Favor)
   * @param {object} params
   * @param {Combat} [params.combat]
   * @param {Actor} params.recipientActor
   * @param {string} params.awardType - 'favor'|'bronze'|'silver'|'gold'|'celestial'|'mvp'|'custom'
   * @param {string} [params.customTitle]
   * @param {string} [params.customQuote]
   * @param {number} [params.favorAmount=0]
   * @returns {Promise<ChatMessage>}
   */
  static async dispatchAIAward({ combat = null, recipientActor, awardType = 'bronze', customTitle = '', customQuote = '', favorAmount = 0 } = {}) {
    if (!recipientActor) throw new Error('Recipient actor is required');

    let title = customTitle;
    let badgeIcon = 'fa-solid fa-gift';
    let rewardText = '';
    let defaultQuote = '';
    let favorDelta = Number(favorAmount) || 0;

    switch (awardType) {
      case 'favor':
        if (!title) title = `AI FAVOR GRANTED (+${favorDelta || 5})`;
        badgeIcon = 'fa-solid fa-hand-holding-heart';
        rewardText = `+${favorDelta || 5} AI Favor`;
        defaultQuote = 'The AI is entertained. Do not make it regret this indulgence.';
        if (!favorDelta) favorDelta = 5;
        break;
      case 'bronze':
        if (!title) title = 'BRONZE LOOT BOX DISPATCHED';
        badgeIcon = 'fa-solid fa-box-open';
        rewardText = '1x Bronze Loot Box';
        defaultQuote = 'Look at you, surviving like a real boy. Here is a shiny piece of garbage to keep you going.';
        break;
      case 'silver':
        if (!title) title = 'SILVER LOOT BOX DISPATCHED';
        badgeIcon = 'fa-solid fa-box-archive';
        rewardText = '1x Silver Loot Box';
        defaultQuote = 'Acceptable violence detected. The viewers loved that crunch.';
        break;
      case 'gold':
        if (!title) title = 'GOLD LOOT BOX DISPATCHED';
        badgeIcon = 'fa-solid fa-gem';
        rewardText = '1x Gold Loot Box';
        defaultQuote = 'Sensational carnage! Truly top-tier slaughterhouse performance.';
        break;
      case 'platinum':
        if (!title) title = 'PLATINUM LOOT BOX DISPATCHED';
        badgeIcon = 'fa-solid fa-ring';
        rewardText = '1x Platinum Loot Box';
        defaultQuote = 'Look at moneybags over here. You earned a Platinum Box. May it contain something suitably deadly and mildly humiliating.';
        break;
      case 'legendary':
        if (!title) title = 'LEGENDARY LOOT BOX DISPATCHED';
        badgeIcon = 'fa-solid fa-dragon';
        rewardText = '1x Legendary Loot Box';
        defaultQuote = 'LEGENDARY PERFORMANCE! The showrunners are weeping with joy and the sponsors are throwing credits at the screen. Open it before they change their minds.';
        break;
      case 'celestial':
        if (!title) title = 'CELESTIAL / BOSS LOOT BOX';
        badgeIcon = 'fa-solid fa-crown';
        rewardText = '1x Celestial Boss Loot Box';
        defaultQuote = 'Floor-shaking performance. You earned this, crawler. Now try not to blow yourself up with it.';
        break;
      case 'mvp':
        if (!title) title = 'FLOOR COMBAT MVP AWARD';
        badgeIcon = 'fa-solid fa-trophy';
        rewardText = 'Combat MVP Recognition & +3 AI Favor';
        defaultQuote = 'Highest total damage output in the encounter. You carried the party on your sweaty shoulders.';
        if (!favorDelta) favorDelta = 3;
        break;
      default:
        if (!title) title = 'CRAWLER SPECIAL RECOGNITION';
        badgeIcon = 'fa-solid fa-award';
        rewardText = rewardText || 'Special Achievement';
        defaultQuote = 'The Dungeon AI sees all. And unfortunately, that includes whatever you just did.';
        break;
    }

    // Apply AI Favor if granted
    if (favorDelta !== 0) {
      const currentFavor = Number(recipientActor.system?.attributes?.aiFavor) || 0;
      const newFavor = currentFavor + favorDelta;
      await recipientActor.update({ 'system.attributes.aiFavor': newFavor });

      if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.adjustAIFavor === 'function') {
        DCCSessionEngine.adjustAIFavor({ actorId: recipientActor.id, delta: favorDelta, reason: title || 'AI Award' }).catch(() => {});
      }
    } else if (['bronze', 'silver', 'gold', 'platinum', 'legendary', 'celestial'].includes(awardType)) {
      if (typeof DCCSessionEngine !== 'undefined' && typeof DCCSessionEngine.recordLootBox === 'function') {
        DCCSessionEngine.recordLootBox({ actorId: recipientActor.id, tier: awardType, title, defaultQuote }).catch(() => {});
      }
    }

    const quote = customQuote.trim() || defaultQuote;

    const chatContent = `
      <div class="dcc-chat-card dcc-ai-announcement-card" style="border: 2px solid #c0392b; background: #181818; color: #fff; border-radius: 6px; padding: 12px; font-family: 'Oswald', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        <div style="background: #c0392b; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; padding: 4px 8px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 8px;">
          <i class="fa-solid fa-bullhorn"></i> DUNGEON ANNOUNCEMENT
        </div>
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 8px;">
          <img src="${recipientActor.img || 'icons/svg/mystery-man.svg'}" style="width: 44px; height: 44px; border-radius: 4px; border: 1.5px solid #d4af37;" />
          <div>
            <div style="color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Recipient: ${recipientActor.name}</div>
            <h3 style="margin: 0; color: #fff; font-size: 16px; font-weight: bold; text-shadow: 0 1px 2px #000;">
              <i class="${badgeIcon}" style="color: #e74c3c;"></i> ${title}
            </h3>
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.4); border-left: 3px solid #e74c3c; padding: 6px 10px; font-style: italic; font-size: 12px; color: #eee; margin-bottom: 8px; line-height: 1.4;">
          “${quote}”
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #222; border: 1px solid #333; padding: 6px 10px; border-radius: 4px; font-size: 12px;">
          <span style="color: #aaa; text-transform: uppercase;">Award Granted:</span>
          <span style="color: #2ecc71; font-weight: bold;"><i class="fa-solid fa-gift"></i> ${rewardText}</span>
        </div>
      </div>
    `;

    // Persist award in combat metrics (active or archived)
    if (combat) {
      const awardRecord = {
        recipientId: recipientActor.id,
        recipientName: recipientActor.name,
        awardType,
        title,
        rewardText,
        quote,
        timestamp: Date.now()
      };
      if (typeof combat.setFlag === 'function') {
        const metrics = structuredClone(this.getMetrics(combat));
        metrics.awards = metrics.awards || [];
        metrics.awards.push(awardRecord);
        await combat.setFlag('carl-rpg', 'metrics', metrics);
      } else if (typeof DCCCombat !== 'undefined') {
        combat.metrics = combat.metrics || {};
        combat.metrics.awards = combat.metrics.awards || [];
        combat.metrics.awards.push(awardRecord);
        await DCCCombat.saveArchivedCombat(combat);
      }
      this._refreshOpenWindows();
    }

    return ChatMessage.create({
      speaker: { alias: 'THE DUNGEON AI' },
      content: chatContent
    });
  }

  /**
   * Helper to re-render any open metrics windows
   */
  static _refreshOpenWindows() {
    if (typeof ui === 'undefined' || !ui.windows) return;
    for (const app of Object.values(ui.windows)) {
      if (app instanceof DCCCombatMetricsApp) {
        app.render(false);
      }
    }
  }
}

/**
 * The Dungeon Crawler Carl AI Combat Awards & Performance Dashboard
 */
export class DCCCombatMetricsApp extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.selectedCombatId = options.combatId || null;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-combat-metrics-app',
      classes: ['dcc-sheet-window', 'dcc-combat-metrics-window'],
      template: 'systems/carl-rpg/templates/apps/combat-metrics.hbs',
      title: 'DCC RPG — AI Combat Performance & Awards',
      width: 780,
      height: 680,
      resizable: true
    });
  }

  /**
   * Helper to retrieve active combat document or archived encounter record.
   * @returns {Combat|object|null}
   */
  getTargetCombat() {
    if (this.selectedCombatId) {
      const active = (Array.isArray(game.combats) ? game.combats : (game.combats?.contents || []))
        .find(c => c.id === this.selectedCombatId) || (game.combats?.get ? game.combats.get(this.selectedCombatId) : null);
      if (active) return active;
      if (typeof DCCCombat !== 'undefined') {
        const archived = DCCCombat.getArchivedCombats().find(a => a.id === this.selectedCombatId);
        if (archived) return archived;
      }
    }
    const current = DCCCombatMetrics.getCombat();
    if (current) return current;
    if (typeof DCCCombat !== 'undefined') {
      const archives = DCCCombat.getArchivedCombats();
      if (archives.length > 0) return archives[0];
    }
    return null;
  }

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);

    const activeCombats = (Array.isArray(game.combats) ? game.combats : (game.combats?.contents || [])).map(c => ({
      id: c.id,
      name: c.name || (c.scene?.name ? `${c.scene.name} (Round ${c.round})` : `Combat ${c.id} (Round ${c.round})`),
      isActive: c.isActive,
      round: c.round,
      isArchived: false
    }));

    const archivedCombatsList = (typeof DCCCombat !== 'undefined' ? DCCCombat.getArchivedCombats() : []).map(a => ({
      id: a.id,
      name: a.name || 'Archived Encounter',
      dateString: a.dateString || '',
      totalRounds: a.totalRounds || 1,
      isActive: false,
      isArchived: true,
      round: a.totalRounds || 1
    }));

    const allCombats = [...activeCombats, ...archivedCombatsList];
    const targetCombat = this.getTargetCombat();
    const isArchived = Boolean(targetCombat && typeof targetCombat.setFlag !== 'function');

    const selectedCombatId = targetCombat?.id || null;
    const rawMetrics = targetCombat ? DCCCombatMetrics.getMetrics(targetCombat) : {};

    // Gather combatants in this combat
    const crawlers = [];
    if (targetCombat) {
      const combatantsList = isArchived
        ? (targetCombat.combatants || [])
        : Array.from(targetCombat.combatants || []);

      for (const cb of combatantsList) {
        const isMob = typeof cb.isMob === 'boolean'
          ? cb.isMob
          : (typeof DCCCombat !== 'undefined' && typeof DCCCombat.isMobCombatant === 'function'
              ? DCCCombat.isMobCombatant(cb)
              : (cb.actor?.type === 'npc' || cb.type === 'npc'));

        if (isMob) continue;

        const actorId = cb.actorId || cb.actor?.id;
        const liveActor = (actorId && game.actors?.get) ? game.actors.get(actorId) : null;
        const actor = cb.actor || liveActor;
        const m = rawMetrics[actorId] || {
          totalDamage: cb.damageDealt || 0,
          damageTaken: cb.damageTaken || 0,
          highestHit: cb.highestHit || 0,
          kills: cb.kills || 0,
          attacks: {},
          skills: {}
        };

        const attacksList = Object.entries(m.attacks || {}).map(([name, att]) => ({
          name,
          count: att.count || 0,
          damage: att.damage || 0,
          type: att.type || 'Melee',
          avg: att.count > 0 ? Math.round(att.damage / att.count) : 0
        }));

        const skillsList = Object.entries(m.skills || {}).map(([name, count]) => ({
          name,
          count
        }));

        const name = cb.name || actor?.name || 'Crawler';
        const img = cb.img || actor?.img || 'icons/svg/mystery-man.svg';
        const level = actor?.system?.details?.level || cb.level || 1;
        const aiFavor = actor?.system?.attributes?.aiFavor || cb.aiFavor || 0;
        const totalDamage = Math.max(0, Number(cb.damageDealt ?? m.totalDamage) || 0);
        const damageTaken = Math.max(0, Number(cb.damageTaken ?? m.damageTaken) || 0);
        const highestHit = Math.max(0, Number(cb.highestHit ?? m.highestHit) || 0);
        const kills = Math.max(0, Number(cb.kills ?? m.kills) || 0);

        crawlers.push({
          actorId,
          combatantId: cb.id,
          name,
          type: cb.type || liveActor?.type || 'crawler',
          img,
          level,
          aiFavor,
          totalDamage,
          damageTaken,
          highestHit,
          kills,
          attacks: attacksList,
          skills: skillsList,
          hasAttacks: attacksList.length > 0,
          hasSkills: skillsList.length > 0
        });
      }
    }

    // Sort crawlers by total damage descending
    crawlers.sort((a, b) => b.totalDamage - a.totalDamage);

    // XP calculation for post-battle awarding
    let xpInfo = null;
    if (targetCombat && typeof DCCExperienceTracker !== 'undefined') {
      try {
        xpInfo = DCCExperienceTracker.calculateEncounterXP(targetCombat);
      } catch (err) {
        console.warn('DCC RPG | Could not calculate encounter XP:', err);
      }
    }

    const previousAwards = rawMetrics.awards || targetCombat?.metrics?.awards || [];

    return {
      ...data,
      activeCombats,
      archivedCombats: archivedCombatsList,
      allCombats,
      selectedCombatId,
      hasCombat: Boolean(targetCombat),
      isArchived,
      combatName: targetCombat?.name || (isArchived ? 'Archived Encounter' : 'Active Encounter'),
      dateString: targetCombat?.dateString || null,
      round: isArchived ? (targetCombat.totalRounds || 1) : (targetCombat?.round || 0),
      totalRounds: targetCombat?.totalRounds || targetCombat?.round || 1,
      crawlers,
      hasCrawlers: crawlers.length > 0,
      xpInfo,
      previousAwards,
      hasPreviousAwards: previousAwards.length > 0
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Combat switcher
    html.find('.dcc-combat-select').change(ev => {
      this.selectedCombatId = ev.target.value;
      this.render(false);
    });

    // Reset combat stats
    html.find('.dcc-reset-metrics-btn').click(async ev => {
      ev.preventDefault();
      const targetCombat = this.getTargetCombat();
      if (!targetCombat) return;

      const confirm = await DialogClass?.confirm?.({
        title: 'Reset Combat Metrics?',
        content: '<p>Are you sure you want to reset all tracked damage and skill stats for this combat encounter?</p>'
      });
      if (confirm) {
        await DCCCombatMetrics.resetMetrics(targetCombat);
        ui.notifications?.info('DCC RPG | Combat metrics reset.');
        this.render(false);
      }
    });

    // Manual damage adjustment button
    html.find('.dcc-adjust-damage-btn').click(async ev => {
      ev.preventDefault();
      const actorId = $(ev.currentTarget).data('actor-id');
      const targetCombat = this.getTargetCombat();
      if (!targetCombat || !actorId) return;

      new DialogClass({
        title: 'Manual Damage Adjustment',
        content: `
          <div style="padding: 6px;">
            <p>Enter the net damage amount to add (or negative to subtract):</p>
            <input type="number" id="dcc-manual-damage-input" value="10" style="width: 100%; font-size: 16px; margin-bottom: 8px;" />
          </div>
        `,
        buttons: {
          apply: {
            icon: '<i class="fa-solid fa-check"></i>',
            label: 'Adjust',
            callback: async (dlgHtml) => {
              const val = Number(dlgHtml.find('#dcc-manual-damage-input').val()) || 0;
              await DCCCombatMetrics.adjustDamage(targetCombat, actorId, val);
              this.render(false);
            }
          },
          cancel: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: 'Cancel'
          }
        },
        default: 'apply'
      }).render(true);
    });

    // Dispatch AI Award Form
    html.find('.dcc-dispatch-award-btn').click(async ev => {
      ev.preventDefault();
      const recipientId = html.find('.dcc-award-recipient-select').val();
      const awardType = html.find('.dcc-award-type-select').val();
      const customQuote = html.find('.dcc-award-quote-input').val() || '';
      const favorAmount = Number(html.find('.dcc-award-favor-input').val()) || 0;

      const actor = game.actors?.get ? game.actors.get(recipientId) : null;
      if (!actor) {
        ui.notifications?.warn('DCC RPG | Please select a recipient crawler.');
        return;
      }

      const targetCombat = this.getTargetCombat();

      try {
        await DCCCombatMetrics.dispatchAIAward({
          combat: targetCombat,
          recipientActor: actor,
          awardType,
          customQuote,
          favorAmount
        });
        ui.notifications?.info(`DCC RPG | Dispatched ${awardType} award to ${actor.name}!`);
        html.find('.dcc-award-quote-input').val('');
        this.render(false);
      } catch (err) {
        console.error('DCC RPG | Failed to dispatch award:', err);
        ui.notifications?.error(`Failed to dispatch award: ${err.message}`);
      }
    });

    // Award Encounter Experience
    html.find('.dcc-award-encounter-xp-btn').click(async ev => {
      ev.preventDefault();
      const targetCombat = this.getTargetCombat();
      if (!targetCombat) return;

      try {
        await DCCExperienceTracker.awardEncounterXP(targetCombat.id);
        this.render(false);
      } catch (err) {
        console.error('DCC RPG | Failed to award encounter XP:', err);
        ui.notifications?.error(err.message);
      }
    });

    // Undo Encounter Experience
    html.find('.dcc-undo-encounter-xp-btn').click(async ev => {
      ev.preventDefault();
      const targetCombat = this.getTargetCombat();
      if (!targetCombat) return;

      try {
        await DCCExperienceTracker.undoAwardEncounterXP(targetCombat.id);
        this.render(false);
      } catch (err) {
        console.error('DCC RPG | Failed to undo encounter XP:', err);
        ui.notifications?.error(err.message);
      }
    });

    // Open Combat Archive Timeline
    html.find('.dcc-open-archive-btn').click(ev => {
      ev.preventDefault();
      const targetCombat = this.getTargetCombat();
      if (typeof DCCCombatArchiveApp !== 'undefined') {
        new DCCCombatArchiveApp({ combatId: targetCombat?.id }).render(true);
      }
    });

    // Toggle award favor input visibility
    html.find('.dcc-award-type-select').change(ev => {
      const isFavor = ev.target.value === 'favor' || ev.target.value === 'mvp';
      html.find('.dcc-award-favor-group').toggle(isFavor);
    });
  }
}
