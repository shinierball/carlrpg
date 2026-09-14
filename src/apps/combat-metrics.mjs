/**
 * Dungeon Crawler Carl RPG — Combat Metrics & AI Awards
 * 
 * Tracks actual damage applied and skill usage per crawler,
 * scoped cleanly to Foundry VTT's Combat documents.
 */

const BaseApplication = typeof Application !== 'undefined' ? Application : (globalThis.Application || class {});

/**
 * Calculate HP per damage bar for an actor.
 * In CarlRPG, health is measured in 10 bars, where each bar represents CON modifier HP.
 * When applying damage, only full damage bars (rounded down) are deducted; excess damage is ignored.
 * @param {Actor} targetActor
 * @returns {number}
 */
export function getHpPerBar(targetActor) {
  if (!targetActor) return 1;

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

  // 3. Max HP fallback (in CarlRPG max HP = 10 * CON mod, so 10 bars)
  const maxHp = Number(targetActor.system?.attributes?.hp?.max);
  if (Number.isFinite(maxHp) && maxHp > 0) {
    return Math.max(1, Math.floor(maxHp / 10));
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
    return c.getFlag?.('carl-rpg', 'metrics') || c.flags?.['carl-rpg']?.metrics || {};
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

    // Track kills if target HP reduced to 0
    if (targetActor) {
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

    return {
      logged: true,
      combatId: c.id,
      actualDamage: netDamage,
      totalDamage: entry.totalDamage,
      attackerName: attackerActor.name
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
  static async applyDamageToTarget({ targetActor, rawDamage, attackerActor = null, attackName = 'Attack', attackType = 'Melee', ignoreDR = false, multiplier = 1, combat = null }) {
    if (!targetActor) return { error: 'No target actor' };

    const mult = Number(multiplier) || 1;
    const adjustedRaw = Math.max(0, Math.floor((Number(rawDamage) || 0) * mult));
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
    let actor = game.actors?.get?.(actorId) || c.combatants?.find?.(con => con.actorId === actorId)?.actor || null;
    if (!metrics[actorId]) {
      this._getOrCreateActorEntry(metrics, actor, actorId);
    }

    const entry = metrics[actorId];
    if (!entry) return null;
    entry.totalDamage = Math.max(0, (entry.totalDamage || 0) + Number(delta));
    await c.setFlag('carl-rpg', 'metrics', metrics);
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
    await c.unsetFlag('carl-rpg', 'metrics');
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
export class DCCCombatMetricsApp extends BaseApplication {
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

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);

    const allCombats = (game.combats?.contents || []).map(c => ({
      id: c.id,
      name: c.scene?.name ? `${c.scene.name} (Round ${c.round})` : `Combat ${c.id} (Round ${c.round})`,
      isActive: c.isActive,
      round: c.round
    }));

    const activeCombat = this.selectedCombatId
      ? game.combats?.get(this.selectedCombatId)
      : DCCCombatMetrics.getCombat();

    const selectedCombatId = activeCombat?.id || null;
    const rawMetrics = activeCombat ? DCCCombatMetrics.getMetrics(activeCombat) : {};

    // Gather combatants in this combat
    const crawlers = [];
    if (activeCombat && activeCombat.combatants) {
      for (const cb of activeCombat.combatants) {
        const actor = cb.actor;
        if (!actor) continue;

        const m = rawMetrics[actor.id] || {
          totalDamage: 0,
          highestHit: 0,
          kills: 0,
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

        crawlers.push({
          actorId: actor.id,
          name: actor.name,
          type: actor.type,
          img: actor.img || 'icons/svg/mystery-man.svg',
          level: actor.system?.details?.level || 1,
          aiFavor: actor.system?.attributes?.aiFavor || 0,
          totalDamage: m.totalDamage || 0,
          highestHit: m.highestHit || 0,
          kills: m.kills || 0,
          attacks: attacksList,
          skills: skillsList,
          hasAttacks: attacksList.length > 0,
          hasSkills: skillsList.length > 0
        });
      }
    }

    // Sort crawlers by total damage descending
    crawlers.sort((a, b) => b.totalDamage - a.totalDamage);

    return {
      ...data,
      allCombats,
      selectedCombatId,
      hasCombat: Boolean(activeCombat),
      round: activeCombat?.round || 0,
      crawlers,
      hasCrawlers: crawlers.length > 0
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
      const activeCombat = this.selectedCombatId
        ? game.combats?.get(this.selectedCombatId)
        : DCCCombatMetrics.getCombat();
      if (!activeCombat) return;

      const confirm = await Dialog.confirm({
        title: 'Reset Combat Metrics?',
        content: '<p>Are you sure you want to reset all tracked damage and skill stats for this combat encounter?</p>'
      });
      if (confirm) {
        await DCCCombatMetrics.resetMetrics(activeCombat);
        ui.notifications?.info('DCC RPG | Combat metrics reset.');
      }
    });

    // Manual damage adjustment button
    html.find('.dcc-adjust-damage-btn').click(async ev => {
      ev.preventDefault();
      const actorId = $(ev.currentTarget).data('actor-id');
      const activeCombat = this.selectedCombatId
        ? game.combats?.get(this.selectedCombatId)
        : DCCCombatMetrics.getCombat();
      if (!activeCombat || !actorId) return;

      new Dialog({
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
              await DCCCombatMetrics.adjustDamage(activeCombat, actorId, val);
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

      const actor = game.actors?.get(recipientId);
      if (!actor) {
        ui.notifications?.warn('DCC RPG | Please select a recipient crawler.');
        return;
      }

      const activeCombat = this.selectedCombatId
        ? game.combats?.get(this.selectedCombatId)
        : DCCCombatMetrics.getCombat();

      try {
        await DCCCombatMetrics.dispatchAIAward({
          combat: activeCombat,
          recipientActor: actor,
          awardType,
          customQuote,
          favorAmount
        });
        ui.notifications?.info(`DCC RPG | Dispatched ${awardType} award to ${actor.name}!`);
        html.find('.dcc-award-quote-input').val('');
      } catch (err) {
        console.error('DCC RPG | Failed to dispatch award:', err);
        ui.notifications?.error(`Failed to dispatch award: ${err.message}`);
      }
    });

    // Toggle award favor input visibility
    html.find('.dcc-award-type-select').change(ev => {
      const isFavor = ev.target.value === 'favor' || ev.target.value === 'mvp';
      html.find('.dcc-award-favor-group').toggle(isFavor);
    });
  }
}
