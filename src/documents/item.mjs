import { getHpPerBar } from '../apps/combat-metrics.mjs';
import { syncCompendiumItemToWorld, isCompendiumDocument } from '../data/compendium-sync.mjs';
import { getItemAllTags } from '../data/tags.mjs';

/**
 * Target detection helper for item outcomes: closest mob, self, or targeted token.
 */
export function resolveOutcomeTarget(actor, targetType = 'self') {
  let targetToken = null;
  let targetActor = null;
  let targetDistFt = null;

  const tType = String(targetType || 'self').toLowerCase().trim();

  if (tType === 'closest_mob' || tType === 'closest' || tType === 'closest_enemy') {
    if (typeof canvas !== 'undefined' && canvas?.tokens?.placeables) {
      const casterToken = actor?.token?.object ||
        canvas.tokens.placeables.find(t => t.actor?.id === actor?.id);

      const candidateTokens = canvas.tokens.placeables.filter(t =>
        t.actor &&
        t.actor.id !== actor?.id &&
        (t.actor.type === 'mob' || t.actor.type === 'npc') &&
        Number(t.actor.system?.attributes?.hp?.value ?? 1) > 0
      );

      let minDist = Infinity;
      for (const cand of candidateTokens) {
        let dist;
        if (canvas.grid && typeof canvas.grid.measureDistance === 'function' && casterToken) {
          dist = canvas.grid.measureDistance(casterToken, cand);
        } else if (casterToken) {
          dist = Math.hypot(cand.x - casterToken.x, cand.y - casterToken.y);
        } else {
          dist = 0;
        }
        if (dist < minDist) {
          minDist = dist;
          targetToken = cand;
          targetActor = cand.actor;
        }
      }
      if (minDist !== Infinity) {
        targetDistFt = Math.round(minDist);
      }
    }
  } else if (tType === 'self') {
    targetActor = actor;
  }

  if (!targetActor && typeof game !== 'undefined' && game.user?.targets?.size) {
    targetToken = Array.from(game.user.targets)[0];
    targetActor = targetToken?.actor || null;
  }

  if (!targetActor) {
    targetActor = actor;
  }

  const targetName = targetActor ? targetActor.name : (tType === 'closest_mob' ? 'Closest Mob (None in range)' : 'Target');
  const distLabel = targetDistFt !== null ? ` (${targetDistFt} ft away)` : '';

  return { targetToken, targetActor, targetDistFt, targetName, distLabel };
}

/**
 * Resolves a single outcome definition, optionally applying active changes to the target actor.
 * @param {object} outcome
 * @param {Actor} actor
 * @param {Item} originItem
 * @param {boolean} [isMultiMode=false]
 * @returns {Promise<object>}
 */
export async function resolveSingleOutcome(outcome, actor, originItem, isMultiMode = false) {
  const { targetToken, targetActor, targetDistFt, targetName, distLabel } =
    resolveOutcomeTarget(actor, outcome.targetType || (isMultiMode ? 'self' : 'closest_mob'));

  const outType = String(outcome.type || '').toLowerCase().trim();
  let outcomeHtml = '';
  let evaluatedDmg = 0;
  let damageType = '';
  let healAmount = 0;
  let healBars = 0;
  let buff = null;
  let debuff = null;
  let isDamageCard = false;

  if (outType === 'buff') {
    const buffName = outcome.name || 'Buff';
    const buffDesc = outcome.description || '';
    const buffId = outcome.buffId || '';
    buff = buffName;

    if (isMultiMode && targetActor) {
      const allBuffs = CONFIG.DCC?.buffs || [];
      const match = allBuffs.find(b => b._id === buffId || b.id === buffId || b.name?.toLowerCase() === buffName.toLowerCase());
      const buffData = match ? {
        name: match.name,
        type: 'buff',
        img: match.img || 'icons/svg/aura.svg',
        system: structuredClone(match.system || {})
      } : {
        name: buffName,
        type: 'buff',
        img: 'icons/svg/aura.svg',
        system: { description: buffDesc }
      };
      if (typeof targetActor.createEmbeddedDocuments === 'function') {
        await targetActor.createEmbeddedDocuments('Item', [buffData]);
      } else if (Array.isArray(targetActor.items)) {
        const ItemCls = CONFIG.Item?.documentClass || DCCItem;
        targetActor.items.push(new ItemCls(buffData, targetActor));
      }
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(41, 128, 185, 0.1); border-left: 4px solid #2980b9; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #2980b9; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-sparkles"></i> ${buffName}
          </h4>
          <span class="dcc-badge" style="background: #2980b9; color: #fff; font-size: 10px;">BUFF</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        ${buffDesc ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${buffDesc}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-buff-btn" data-buff-id="${buffId}" data-buff-name="${buffName}" data-target-id="${targetActor?.id || ''}" style="background: #2980b9; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-hand-sparkles"></i> Apply Buff (${buffName})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'debuff') {
    const debuffName = outcome.name || 'Debuff';
    const debuffDesc = outcome.description || '';
    const debuffId = outcome.debuffId || '';
    debuff = debuffName;

    if (isMultiMode && targetActor) {
      const allDebuffs = CONFIG.DCC?.debuffs || [];
      const match = allDebuffs.find(d => d._id === debuffId || d.id === debuffId || d.name?.toLowerCase() === debuffName.toLowerCase());
      const debuffData = match ? {
        name: match.name,
        type: 'debuff',
        img: match.img || 'icons/svg/skull.svg',
        system: structuredClone(match.system || {})
      } : {
        name: debuffName,
        type: 'debuff',
        img: 'icons/svg/skull.svg',
        system: { description: debuffDesc, duration: outcome.duration || (outcome.permanent ? 'Permanent' : 'Combat') }
      };
      if (typeof targetActor.createEmbeddedDocuments === 'function') {
        await targetActor.createEmbeddedDocuments('Item', [debuffData]);
      } else if (Array.isArray(targetActor.items)) {
        const ItemCls = CONFIG.Item?.documentClass || DCCItem;
        targetActor.items.push(new ItemCls(debuffData, targetActor));
      }
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-debuff" style="background: rgba(142, 68, 173, 0.1); border-left: 4px solid #8e44ad; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #8e44ad; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-skull"></i> ${debuffName}
          </h4>
          <span class="dcc-badge" style="background: #8e44ad; color: #fff; font-size: 10px;">DEBUFF</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        ${debuffDesc ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${debuffDesc}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-debuff-btn" data-debuff-id="${debuffId}" data-debuff-name="${debuffName}" data-target-id="${targetActor?.id || ''}" style="background: #8e44ad; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-biohazard"></i> Apply Debuff (${debuffName})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'heal' || outType === 'heal_bars' || (outcome.healBars && outType !== 'spell' && outType !== 'heal_over_time' && outType !== 'hot')) {
    const healTarget = targetActor || actor;
    const hpPerBar = getHpPerBar(healTarget);
    healBars = Number(outcome.healBars) || Number(outcome.bars) || 5;
    healAmount = healBars * hpPerBar;

    if (isMultiMode && healTarget && typeof healTarget.applyHealingBars === 'function') {
      await healTarget.applyHealingBars(healBars);
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-heal" style="background: rgba(241, 196, 15, 0.12); border-left: 4px solid #f39c12; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #d35400; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-cake-candles"></i> ${outcome.name || 'Healing Custard'}
          </h4>
          <span class="dcc-badge" style="background: #f39c12; color: #fff; font-size: 10px;">HEALING</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 14px; font-weight: bold; color: #27ae60; margin: 4px 0;">
          Healing: +${healBars} Health Bars <span style="font-size: 11px; font-weight: normal; color: #555;">(~${healAmount} HP restored)</span>
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-healing-btn" data-bars="${healBars}" data-healing="${healAmount}" data-target-id="${targetActor?.id || ''}" style="background: #27ae60; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-heart"></i> Apply Healing (+${healBars} Bars)
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'heal_over_time' || outType === 'hot') {
    healBars = Number(outcome.healBars) || Number(outcome.bars) || 1;
    const rounds = Number(outcome.rounds) || 3;
    const hotTarget = targetActor || actor;

    if (isMultiMode && hotTarget && typeof hotTarget.applyHoT === 'function') {
      await hotTarget.applyHoT({ name: outcome.name || `${originItem.name} - Regeneration`, healBars, rounds });
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-heal" style="background: rgba(46, 204, 113, 0.12); border-left: 4px solid #27ae60; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #27ae60; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-heart-pulse"></i> ${outcome.name || 'Regeneration'}
          </h4>
          <span class="dcc-badge" style="background: #27ae60; color: #fff; font-size: 10px;">HEAL OVER TIME</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 13px; font-weight: bold; color: #27ae60; margin: 4px 0;">
          Regeneration: +${healBars} Health Bar${healBars > 1 ? 's' : ''} / round for ${rounds} rounds
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-hot-btn" data-bars="${healBars}" data-rounds="${rounds}" data-name="${outcome.name || 'Regeneration'}" data-target-id="${targetActor?.id || ''}" style="background: #27ae60; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-heart-pulse"></i> Apply Regeneration (+${healBars} Bars/rnd)
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'mend_injury') {
    const severity = outcome.injurySeverity || outcome.severity || 'minor';
    const mendTarget = targetActor || actor;
    let mended = [];
    if (isMultiMode && mendTarget && typeof mendTarget.mendInjury === 'function') {
      mended = await mendTarget.mendInjury(severity);
    }
    const mendedLabel = mended.length ? `Mended: ${mended.map(m => m.name).join(', ')}` : `Mends ${severity.toUpperCase()} Injury`;

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(26, 188, 156, 0.12); border-left: 4px solid #16a085; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #16a085; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-bandage"></i> ${outcome.name || 'Mend Injury'}
          </h4>
          <span class="dcc-badge" style="background: #16a085; color: #fff; font-size: 10px;">MEND INJURY</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 12px; font-weight: bold; color: #16a085; margin: 4px 0;">
          ${mendedLabel}
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-mend-injury-btn" data-severity="${severity}" data-target-id="${targetActor?.id || ''}" style="background: #16a085; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-bandage"></i> Mend Injury (${severity.toUpperCase()})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'cure_debuff') {
    const filter = outcome.debuffTarget || outcome.filter || 'all';
    const cureTarget = targetActor || actor;
    let cured = [];
    if (isMultiMode && cureTarget && typeof cureTarget.cureDebuffs === 'function') {
      cured = await cureTarget.cureDebuffs(filter);
    }
    const curedLabel = cured.length ? `Cured: ${cured.map(c => c.name).join(', ')}` : `Cures ${filter.toUpperCase()} Debuff(s)`;

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(52, 152, 219, 0.12); border-left: 4px solid #2980b9; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #2980b9; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-shield-virus"></i> ${outcome.name || 'Cure Debuff'}
          </h4>
          <span class="dcc-badge" style="background: #2980b9; color: #fff; font-size: 10px;">CURE DEBUFF</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 12px; font-weight: bold; color: #2980b9; margin: 4px 0;">
          ${curedLabel}
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-cure-debuff-btn" data-filter="${filter}" data-target-id="${targetActor?.id || ''}" style="background: #2980b9; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-shield-virus"></i> Cure Debuff (${filter.toUpperCase()})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'skill_rank') {
    const skillName = outcome.skillName || outcome.name || 'Skill';
    const bonus = Number(outcome.rankBonus || outcome.delta) || 1;
    const skillTarget = targetActor || actor;
    let skillRes = null;
    if (isMultiMode && skillTarget && typeof skillTarget.increaseSkillRank === 'function') {
      skillRes = await skillTarget.increaseSkillRank(skillName, bonus);
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(243, 156, 18, 0.12); border-left: 4px solid #f39c12; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #d35400; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-book-bookmark"></i> ${outcome.name || `Skill: ${skillName}`}
          </h4>
          <span class="dcc-badge" style="background: #f39c12; color: #fff; font-size: 10px;">SKILL TRAINING</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 13px; font-weight: bold; color: #d35400; margin: 4px 0;">
          Permanently increases <strong>${skillName}</strong> by +${bonus} Rank! ${skillRes ? `(Now Rank ${skillRes.newRank})` : ''}
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-skill-rank-btn" data-skill="${skillName}" data-bonus="${bonus}" data-target-id="${targetActor?.id || ''}" style="background: #d35400; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-book-bookmark"></i> Grant Skill Rank (+${bonus})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'stat_permanent') {
    const stat = String(outcome.stat || 'str').toLowerCase();
    const bonus = Number(outcome.value || outcome.delta) || 1;
    const statTarget = targetActor || actor;
    let statRes = null;
    if (isMultiMode && statTarget && typeof statTarget.increaseUnenhancedStat === 'function') {
      statRes = await statTarget.increaseUnenhancedStat(stat, bonus);
    }

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(230, 126, 34, 0.12); border-left: 4px solid #e67e22; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #d35400; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-arrow-up-right-dots"></i> ${outcome.name || `Permanent ${stat.toUpperCase()} Boost`}
          </h4>
          <span class="dcc-badge" style="background: #e67e22; color: #fff; font-size: 10px;">STAT BOOST</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 13px; font-weight: bold; color: #d35400; margin: 4px 0;">
          Permanently increases <strong>${stat.toUpperCase()}</strong> by +${bonus}! ${statRes ? `(Now ${statRes.newUnenhanced})` : ''}
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-apply-stat-btn" data-stat="${stat}" data-bonus="${bonus}" data-target-id="${targetActor?.id || ''}" style="background: #e67e22; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-arrow-up-right-dots"></i> Grant Stat Boost (+${bonus} ${stat.toUpperCase()})
          </button>
        </div>
      </div>
    `;
  } else if (outType === 'spell') {
    const spellIdOrName = (outcome.spellId || outcome.spellName || outcome.name || '').toLowerCase().trim();
    const allSpells = CONFIG.DCC?.spells || [];
    const linkedSpell = allSpells.find(s => (s._id && s._id.toLowerCase() === spellIdOrName) || (s.id && s.id.toLowerCase() === spellIdOrName) || (s.name && s.name.toLowerCase().trim() === spellIdOrName))
      || (actor?.items ? (actor.items.find ? actor.items.find(i => i.type === 'spell' && ((i._id && i._id.toLowerCase() === spellIdOrName) || (i.id && i.id.toLowerCase() === spellIdOrName) || (i.name && i.name.toLowerCase().trim() === spellIdOrName))) : Array.from(actor.items.values?.() || actor.items).find(i => i.type === 'spell' && ((i._id && i._id.toLowerCase() === spellIdOrName) || (i.id && i.id.toLowerCase() === spellIdOrName) || (i.name && i.name.toLowerCase().trim() === spellIdOrName)))) : null);

    const spellName = linkedSpell?.name || outcome.name || 'Spell Effect';
    const spellImg = linkedSpell?.img || outcome.img || 'icons/svg/wand.svg';
    damageType = linkedSpell?.system?.damageType || outcome.damageType || 'Fire';

    const baseDamage = linkedSpell?.system?.baseDamage || outcome.damage;
    let parsedFormula = '';
    if (baseDamage) {
      const intMod = Number(actor?.system?.abilities?.int?.mod) || 0;
      parsedFormula = baseDamage
        .replace(/\bint\b/gi, String(intMod))
        .replace(/\+\s*\+/g, '+');
      if (typeof Roll !== 'undefined') {
        const dRoll = await (new Roll(parsedFormula)).evaluate();
        evaluatedDmg = dRoll.total;
      } else {
        evaluatedDmg = 12 + intMod;
      }
      isDamageCard = evaluatedDmg > 0;
    }

    // When an item or consumable with a spell effect is used, cast the spell with 0 mana!
    if (isMultiMode && actor && typeof actor.rollSpell === 'function') {
      const spellToCast = linkedSpell || (CONFIG.Item?.documentClass ? new CONFIG.Item.documentClass({
        name: spellName,
        type: 'spell',
        img: spellImg,
        system: {
          manaCost: 0,
          freeCast: true,
          damageType,
          baseDamage: baseDamage || '',
          description: outcome.description || ''
        }
      }, actor) : {
        id: outcome.spellId || 'temp-spell',
        name: spellName,
        type: 'spell',
        img: spellImg,
        system: {
          manaCost: 0,
          freeCast: true,
          damageType,
          baseDamage: baseDamage || '',
          description: outcome.description || ''
        }
      });

      await actor.rollSpell(spellToCast, {
        freeCast: true,
        originItem,
        isConsumable: true,
        isItemEffect: true
      });
    }

    const debuffNote = outcome.debuff
      ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #c0392b;"><strong>Debuff:</strong> Targets losing 1+ Health Bar gain the <strong>${outcome.debuff} Debuff</strong>.</p>`
      : '';

    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-spell" style="background: rgba(142, 68, 173, 0.08); border-left: 4px solid #8e44ad; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #8e44ad; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> ${spellName}
          </h4>
          <span class="dcc-badge dcc-badge-spell" style="font-size: 10px; background: #8e44ad; color: #fff;">0 MP (FREE CAST)</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
        </p>
        <div style="font-size: 12px; color: #666; margin: 4px 0;">
          <i class="fa-solid fa-bolt"></i> <strong>Spell Effect:</strong> Costs <strong>0 Mana</strong> (Item / Consumable Effect)
          ${evaluatedDmg > 0 ? ` • Damage: <strong>${evaluatedDmg}</strong> (${damageType})` : ''}
        </div>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        ${debuffNote}
        <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">
          <button type="button" class="dcc-cast-spell-btn" data-spell-id="${linkedSpell?.id || outcome.spellId || ''}" data-spell-name="${spellName}" data-free-cast="true" data-actor-id="${actor?.id || ''}" style="background: #8e44ad; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Cast Spell (0 Mana)
          </button>
          ${evaluatedDmg > 0 ? `
          <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" data-damage-value="${evaluatedDmg}" data-damage-type="${damageType}" data-target-id="${targetActor?.id || ''}" style="background: #c0392b; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-burst"></i> Apply Damage (${evaluatedDmg})
          </button>` : ''}
        </div>
      </div>
    `;
  } else if (outType === 'damage' || outcome.damage) {
  } else if (outType === 'roll_table') {
    const tableName = outcome.tableName || outcome.name || 'Roll Table';
    const tableId = outcome.tableId || '';
    outcomeHtml = `
      <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(142, 68, 173, 0.1); border-left: 4px solid #8e44ad; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; color: #8e44ad; font-size: 15px; font-weight: bold; text-transform: uppercase;">
            <i class="fa-solid fa-table-list"></i> ${tableName}
          </h4>
          <span class="dcc-badge" style="background: #8e44ad; color: #fff; font-size: 10px;">ROLL TABLE</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Target:</strong> ${targetName}${distLabel}</p>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
        <div style="margin-top: 8px;">
          <button type="button" class="dcc-roll-table-btn" data-table-id="${tableId}" data-table-name="${tableName}" data-target-id="${targetActor?.id || ''}" style="background: #8e44ad; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
            <i class="fa-solid fa-dice-d20"></i> Draw from Table (${tableName})
          </button>
        </div>
      </div>
    `;
  } else {
    outcomeHtml = `
      <div class="dcc-scratch-outcome" style="background: rgba(41, 128, 185, 0.1); border-left: 4px solid #2980b9; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
        <h4 style="margin: 0; color: #2980b9; font-size: 15px; font-weight: bold; text-transform: uppercase;">
          ${outcome.name || 'Effect'}
        </h4>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Target:</strong> ${targetName}${distLabel}</p>
        ${outcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${outcome.description}</p>` : ''}
      </div>
    `;
  }

  return {
    outcomeHtml,
    evaluatedDmg,
    damageType,
    healAmount,
    healBars,
    buff,
    debuff,
    isDamageCard,
    targetActor,
    targetName
  };
}

const BaseItem = globalThis.foundry?.documents?.Item
  ?? globalThis.foundry?.documents?.BaseItem
  ?? globalThis.Item
  ?? class {};

/**
 * Dungeon Crawler Carl RPG Item Document
 */
export class DCCItem extends BaseItem {
  /**
   * Get the complete set of tags for this item (explicit + derived + identity).
   * @type {Set<string>}
   */
  get allTags() {
    return getItemAllTags(this);
  }

  /** @override */
  prepareBaseData() {
    if (super.prepareBaseData) super.prepareBaseData();
    if (this.type === 'gear' && this.system) {
      let mods = this.system.skillModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.skillModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'attack' || this.type === 'gear') && this.system) {
      let parts = this.system.damageParts;
      if (parts && !Array.isArray(parts) && typeof parts === 'object') {
        parts = Object.values(parts);
      }
      this.system.damageParts = Array.isArray(parts) ? parts : [];
    }
    if (this.type === 'attack' && this.system) {
      if (this.system.equipped === undefined) {
        this.system.equipped = true;
      }
    }
    if ((this.type === 'gear' || this.type === 'loot') && this.system) {
      if ((this.system.value === undefined || this.system.value === 0) && this.system.goldValue !== undefined) {
        this.system.value = Number(this.system.goldValue) || 0;
      }
      if ((this.system.value === undefined || this.system.value === 0) && this._source?.system?.goldValue !== undefined) {
        this.system.value = Number(this._source.system.goldValue) || 0;
      }
    }
    if (this.type === 'gear' && this.system) {
      if (this.system.isWeapon === undefined) {
        const slot = (this.system.slot || '').toLowerCase();
        this.system.isWeapon = slot === 'hands' || slot === 'holding';
      }
    }
    if (this.type === 'skill' && this.system) {
      let mods = this.system.damageModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.damageModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'buff' || this.type === 'debuff') && this.system) {
      let stats = this.system.statModifiers;
      if (stats && !Array.isArray(stats) && typeof stats === 'object') {
        stats = Object.values(stats);
      }
      this.system.statModifiers = Array.isArray(stats) ? stats : [];

      let dmgs = this.system.damageModifiers;
      if (dmgs && !Array.isArray(dmgs) && typeof dmgs === 'object') {
        dmgs = Object.values(dmgs);
      }
      this.system.damageModifiers = Array.isArray(dmgs) ? dmgs : [];
    }
    if (this.type === 'loot' && this.system) {
      let outcomes = this.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      this.system.outcomes = Array.isArray(outcomes) ? outcomes : [];
      for (const out of this.system.outcomes) {
        if (!out) continue;
        if (typeof out.weight === 'string') {
          const digits = out.weight.trim().replace(/[^0-9]/g, '');
          out.weight = digits === '' ? 0 : parseInt(digits, 10);
        } else if (typeof out.weight === 'number' && Number.isFinite(out.weight)) {
          out.weight = Math.max(0, Math.floor(out.weight));
        } else {
          out.weight = 0;
        }
      }
    }
  }

  /** @override */
  prepareData() {
    if (super.prepareData) {
      super.prepareData();
    } else {
      this.prepareBaseData();
      this.prepareDerivedData();
    }
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === 'gear' && this.system) {
      let mods = this.system.skillModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.skillModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'attack' || this.type === 'gear') && this.system) {
      let parts = this.system.damageParts;
      if (parts && !Array.isArray(parts) && typeof parts === 'object') {
        parts = Object.values(parts);
      }
      this.system.damageParts = Array.isArray(parts) ? parts : [];
    }
    if (this.type === 'attack' && this.system) {
      if (this.system.equipped === undefined) {
        this.system.equipped = true;
      }
    }
    if (this.type === 'gear' && this.system) {
      if (this.system.isWeapon === undefined) {
        const slot = (this.system.slot || '').toLowerCase();
        this.system.isWeapon = slot === 'hands' || slot === 'holding';
      }
    }
    if (this.type === 'skill' && this.system) {
      const baseRank = Number(this.system.rank) || 0;
      const itemBonus = Number(this.system.itemBonus) || 0;
      const boonBonus = Number(this.system.boonBonus) || 0;
      const typeBonus = Number(this.system.typeBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus + typeBonus);
      this.system.modifiedRank = modifiedRank;
      this.modifiedRank = modifiedRank;
      this.effectiveRank = modifiedRank;

      let mods = this.system.damageModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.damageModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'buff' || this.type === 'debuff') && this.system) {
      let stats = this.system.statModifiers;
      if (stats && !Array.isArray(stats) && typeof stats === 'object') {
        stats = Object.values(stats);
      }
      this.system.statModifiers = Array.isArray(stats) ? stats : [];

      let dmgs = this.system.damageModifiers;
      if (dmgs && !Array.isArray(dmgs) && typeof dmgs === 'object') {
        dmgs = Object.values(dmgs);
      }
      this.system.damageModifiers = Array.isArray(dmgs) ? dmgs : [];
    }
    if (this.type === 'loot' && this.system) {
      let outcomes = this.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      this.system.outcomes = Array.isArray(outcomes) ? outcomes : [];
      for (const out of this.system.outcomes) {
        if (!out) continue;
        if (typeof out.weight === 'string') {
          const digits = out.weight.trim().replace(/[^0-9]/g, '');
          out.weight = digits === '' ? 0 : parseInt(digits, 10);
        } else if (typeof out.weight === 'number' && Number.isFinite(out.weight)) {
          out.weight = Math.max(0, Math.floor(out.weight));
        } else {
          out.weight = 0;
        }
      }
    }
  }

  /** @override */
  async _onCreate(data, options, userId) {
    if (super._onCreate) await super._onCreate(data, options, userId);

    // Only process on the client that initiated creation to avoid duplicate requests
    if (typeof game !== 'undefined' && game.user && userId !== game.user.id) return;

    // When an embedded item is created on an actor, automatically register it in Foundry's items section
    if (this.isEmbedded && typeof game !== 'undefined' && game.items) {
      if (game.user && !game.user.isGM && !game.user.can?.('ITEM_CREATE')) return;

      const norm = (this.name || '').toLowerCase().trim();
      const existing = game.items.find(i => i.name.toLowerCase().trim() === norm && i.type === this.type);
      if (!existing) {
        try {
          const itemData = this.toObject ? this.toObject() : {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system || {})
          };
          delete itemData._id;
          delete itemData.id;
          await DCCItem.create(itemData);
          console.log(`DCC RPG | Added newly created item "${this.name}" (${this.type}) to Foundry items section.`);
        } catch (err) {
          console.warn(`DCC RPG | Could not add "${this.name}" to Foundry items section:`, err);
        }
      }
    }
  }

  /** @override */
  async update(data, options = {}) {
    const res = super.update ? await super.update(data, options) : this;
    if (isCompendiumDocument(this) || this.pack || options?.pack) {
      await syncCompendiumItemToWorld(this, { changed: data, options });
    }
    return res;
  }

  /** @override */
  async _onUpdate(changed, options, userId) {
    if (super._onUpdate) await super._onUpdate(changed, options, userId);

    if (typeof game !== 'undefined' && game.user && userId !== game.user.id) return;

    // If a compendium item is updated, automatically synchronize it to all world actors & items
    if (isCompendiumDocument(this) || this.pack || options?.pack) {
      await syncCompendiumItemToWorld(this, { changed, options });
    }

    // If an embedded item is renamed or modified, ensure the item is known in Foundry's items section
    if (this.isEmbedded && typeof game !== 'undefined' && game.items && (changed.name || changed.system)) {
      if (game.user && !game.user.isGM && !game.user.can?.('ITEM_CREATE')) return;

      const norm = (this.name || '').toLowerCase().trim();
      if (!norm) return;

      const existing = game.items.find(i => i.name.toLowerCase().trim() === norm && i.type === this.type);
      if (!existing) {
        try {
          const itemData = this.toObject ? this.toObject() : {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system || {})
          };
          delete itemData._id;
          delete itemData.id;
          await DCCItem.create(itemData);
          console.log(`DCC RPG | Synced updated item "${this.name}" (${this.type}) to Foundry items section.`);
        } catch (err) {
          console.warn(`DCC RPG | Could not sync "${this.name}" to Foundry items section:`, err);
        }
      }
    }
  }

  /**
   * Gold value of the item.
   * Safely resolves gold value from system value, legacy goldValue, or data model.
   * @type {number}
   */
  get goldValue() {
    if (!this.system) return 0;
    if (this.system.value !== undefined && this.system.value !== 0) return Number(this.system.value);
    const sourceVal = this._source?.system?.goldValue ?? this._source?.system?.value;
    if (sourceVal !== undefined && Number(sourceVal) !== 0) return Number(sourceVal);
    if (typeof this.system.goldValue === 'number') return this.system.goldValue;
    return Number(this.system.value ?? 0);
  }

  set goldValue(val) {
    if (this.system) {
      if ('value' in this.system || this.system.schema?.has?.('value')) {
        this.system.value = Number(val) || 0;
      }
    }
  }

  async roll(action = 'cast') {
    if (this.type === 'spell') {
      if (this.actor) return this.actor.rollSpell(this, action);
      return DCCItem.rollSpellCard(this);
    }
    if (this.type === 'loot') {
      return this.useLoot();
    }
    if (this.type === 'gear' && (this.system?.hasActivatedAbility || this.system?.outcomes?.length > 0)) {
      return this.useLoot();
    }
    if (!this.actor) return;
    if (this.type === 'attack') {
      return this.actor.rollAttack(this, action === 'damage' ? 'damage' : 'hit');
    }
    if (this.type === 'skill') {
      return this.actor.rollSkill(this);
    }
  }

  /**
   * Alias to activate gear with on-use effects or scratch-off tables.
   * @returns {Promise<ChatMessage|object>}
   */
  async useGear() {
    return this.useLoot();
  }

  /**
   * Use a loot / consumable item (e.g. Normal Mana Potion, healing items, scratch-off lottery tickets, wands, scrolls)
   * or activate gear with on-use effects.
   * Refills resources, decrements uses/charges, checks scene limits, resolves outcome tables, and outputs rich chat cards.
   * @returns {Promise<ChatMessage|object>}
   */
  async useLoot() {
    const actor = this.actor;
    const sys = this.system || {};
    const itemName = this.name || 'Item';
    const lootType = String(sys.lootType || '').toLowerCase().trim();
    const isScratch = lootType === 'scratch_ticket' || lootType === 'scratch-off-ticket' || lootType.includes('scratch');

    // 1. Scene Cooldown Check (e.g. "Once per scene")
    const cooldownStr = String(sys.cooldown || '').toLowerCase().trim();
    const isOncePerScene = cooldownStr.includes('scene');
    const currentSceneId = (typeof canvas !== 'undefined' && canvas?.scene?.id) ? canvas.scene.id : null;

    if (isOncePerScene && currentSceneId) {
      const lastScene = (typeof this.getFlag === 'function')
        ? this.getFlag('carl-rpg', 'lastUsedScene')
        : (this.flags?.['carl-rpg']?.lastUsedScene);

      if (lastScene === currentSceneId) {
        const msg = `"${itemName}" can only be used once per scene, and was already used in this scene!`;
        if (typeof ui !== 'undefined' && ui.notifications?.warn) {
          ui.notifications.warn(msg);
        }
        return { error: 'cooldown_scene', message: msg };
      }
    }

    // 2. Uses / Charges / Quantity Check
    const hasCharges = Boolean(
      (lootType === 'wand' || sys.usesCharges || sys.hasCharges || (sys.charges && Number(sys.charges.max) > 0 && !isScratch)) &&
      sys.charges && Number(sys.charges.max) > 0
    );
    const currentCharges = hasCharges ? (Number(sys.charges.value) || 0) : 0;
    const currentQty = Number(sys.quantity) || 1;

    if (hasCharges) {
      if (currentCharges <= 0) {
        const msg = `"${itemName}" has no charges remaining!`;
        if (typeof ui !== 'undefined' && ui.notifications?.warn) {
          ui.notifications.warn(msg);
        }
        return { error: 'depleted', message: msg };
      }
    } else {
      if (currentQty <= 0) {
        const msg = `"${itemName}" has no uses remaining!`;
        if (typeof ui !== 'undefined' && ui.notifications?.warn) {
          ui.notifications.warn(msg);
        }
        return { error: 'depleted', message: msg };
      }
    }

    const consumeItemUse = async () => {
      if (hasCharges) {
        await this.update({ 'system.charges.value': currentCharges - 1 });
      } else {
        if (currentQty > 1) {
          await this.update({ 'system.quantity': currentQty - 1 });
        } else {
          if (this.type === 'gear') {
            await this.update({ 'system.quantity': 0 });
          } else {
            if (typeof this.delete === 'function') {
              await this.delete();
            } else if (actor && typeof actor.deleteEmbeddedDocuments === 'function') {
              await actor.deleteEmbeddedDocuments('Item', [this.id]);
            } else if (actor && Array.isArray(actor.items)) {
              const idx = actor.items.findIndex(i => (i.id === this.id || i._id === this.id));
              if (idx !== -1) actor.items.splice(idx, 1);
            }
          }
        }
      }
    };

    // 3. Multi-Outcome Logic
    const outcomes = Array.isArray(sys.outcomes) ? sys.outcomes : [];
    let executionMode = String(sys.executionMode || '').toLowerCase().trim();
    if (!executionMode) {
      executionMode = isScratch ? 'random' : (outcomes.length > 0 ? 'all' : 'none');
    }

    if (outcomes.length > 0) {
      if (isOncePerScene && currentSceneId) {
        if (typeof this.setFlag === 'function') {
          await this.setFlag('carl-rpg', 'lastUsedScene', currentSceneId);
        } else {
          this.flags = this.flags || {};
          this.flags['carl-rpg'] = this.flags['carl-rpg'] || {};
          this.flags['carl-rpg'].lastUsedScene = currentSceneId;
        }
      }

      // --- RANDOM SELECTION MODE (Scratch-Off / Gamble) ---
      if (executionMode === 'random') {
        const totalWeight = outcomes.reduce((acc, o) => acc + Math.max(1, Number(o.weight) || 1), 0);
        let rollVal = 1;
        if (typeof Roll !== 'undefined') {
          const rollObj = await (new Roll(`1d${totalWeight}`)).evaluate();
          rollVal = rollObj.total;
        } else {
          rollVal = Math.floor(Math.random() * totalWeight) + 1;
        }

        let runningWeight = 0;
        let chosenOutcome = outcomes[0];
        for (const out of outcomes) {
          runningWeight += Math.max(1, Number(out.weight) || 1);
          if (rollVal <= runningWeight) {
            chosenOutcome = out;
            break;
          }
        }

        await consumeItemUse();

        const singleRes = await resolveSingleOutcome(chosenOutcome, actor, this, false);
        const remainingUsesLabel = hasCharges
          ? `<strong>Remaining Charges:</strong> ${Math.max(0, currentCharges - 1)} / ${sys.charges.max}`
          : `<strong>Remaining Uses:</strong> ${Math.max(0, currentQty - 1)}`;

        const cardHtml = `
          <div class="dcc-chat-card dcc-item-card ${singleRes.isDamageCard ? 'dcc-damage-card' : ''} dcc-scratchoff-card"
            data-attacker-id="${actor?.id || ''}"
            data-item-name="${itemName}"
            data-damage-value="${singleRes.evaluatedDmg}"
            data-damage-type="${singleRes.damageType || ''}"
            data-target-id="${singleRes.targetActor?.id || ''}"
            style="font-family: var(--font-primary, sans-serif);">
            <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #8e44ad; padding-bottom: 4px; margin-bottom: 6px;">
              <img src="${this.img || 'icons/svg/item-bag.svg'}" style="width: 34px; height: 34px; border: 1px solid #000; border-radius: 4px;" />
              <div>
                <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${itemName}</h3>
                <span style="font-size: 11px; text-transform: uppercase; color: #8e44ad; font-weight: bold;">
                  <i class="fa-solid fa-ticket"></i> Scratch-off Result
                </span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px;">
              <span>${remainingUsesLabel}</span>
              ${sys.cooldown ? `<span><strong>Limit:</strong> ${sys.cooldown}</span>` : ''}
            </div>
            ${singleRes.outcomeHtml}
          </div>
        `;

        return ChatMessage.create({
          speaker: actor ? ChatMessage.getSpeaker({ actor }) : undefined,
          content: cardHtml,
          flags: {
            'carl-rpg': {
              outcome: chosenOutcome,
              roll: rollVal,
              damage: singleRes.evaluatedDmg,
              healBars: singleRes.healBars,
              healAmount: singleRes.healAmount,
              buff: singleRes.buff,
              debuff: singleRes.debuff,
              targetId: singleRes.targetActor?.id || null
            }
          }
        });
      }

      // --- ALL EFFECTS MODE (Guaranteed Consumable / Potion Combo / Activated Gear) ---
      await consumeItemUse();

      const outcomeHtmls = [];
      const appliedResults = [];
      let totalHealBars = 0;
      let totalDmg = 0;

      for (const out of outcomes) {
        const res = await resolveSingleOutcome(out, actor, this, true);
        outcomeHtmls.push(res.outcomeHtml);
        appliedResults.push(res);
        totalHealBars += res.healBars || 0;
        totalDmg += res.evaluatedDmg || 0;
      }

      const remainingUsesLabel = hasCharges
        ? `<strong>Remaining Charges:</strong> ${Math.max(0, currentCharges - 1)} / ${sys.charges.max}`
        : `<strong>Remaining Uses:</strong> ${Math.max(0, currentQty - 1)}`;

      const headerColor = this.type === 'gear' ? '#c0392b' : (lootType === 'wand' ? '#8e44ad' : '#27ae60');
      const headerTitle = this.type === 'gear' ? 'Activated Gear' : (lootType === 'wand' ? 'Wand Activated' : (lootType === 'scroll' ? 'Scroll Used' : 'Consumable Used'));
      const headerIcon = this.type === 'gear' ? 'fa-shield-halved' : (lootType === 'wand' ? 'fa-wand-magic-sparkles' : (lootType === 'scroll' ? 'fa-scroll' : 'fa-flask'));

      const multiCardHtml = `
        <div class="dcc-chat-card dcc-item-card dcc-multi-effect-card ${totalDmg > 0 ? 'dcc-damage-card' : ''}"
          data-attacker-id="${actor?.id || ''}"
          data-item-name="${itemName}"
          data-damage-value="${totalDmg}"
          style="font-family: var(--font-primary, sans-serif);">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid ${headerColor}; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${this.img || (lootType === 'wand' ? 'icons/svg/wand.svg' : (lootType === 'scroll' ? 'icons/svg/scroll.svg' : 'icons/svg/item-bag.svg'))}" style="width: 34px; height: 34px; border: 1px solid #000; border-radius: 4px;" />
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${itemName}</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: ${headerColor}; font-weight: bold;">
                <i class="fa-solid ${headerIcon}"></i> ${headerTitle} (${outcomes.length} Effect${outcomes.length > 1 ? 's' : ''})
              </span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px;">
            <span>${remainingUsesLabel}</span>
            ${sys.cooldown ? `<span><strong>Limit:</strong> ${sys.cooldown}</span>` : ''}
          </div>
          ${sys.notes ? `<p style="margin: 3px 0 6px 0; font-size: 11px; color: #555;">${sys.notes}</p>` : ''}
          <div class="dcc-outcomes-container" style="display: flex; flex-direction: column; gap: 4px;">
            ${outcomeHtmls.join('')}
          </div>
        </div>
      `;

      return ChatMessage.create({
        speaker: actor ? ChatMessage.getSpeaker({ actor }) : undefined,
        content: multiCardHtml,
        flags: {
          'carl-rpg': {
            executionMode: 'all',
            itemType: this.type,
            lootType: sys.lootType,
            outcomes: outcomes,
            totalHealBars,
            totalDmg,
            results: appliedResults
          }
        }
      });
    }

    // 4. Scrolls, Wands, & Direct Spell Consumables (without explicit outcome array)
    if (lootType === 'scroll' || lootType === 'wand' || sys.spellId || sys.spellName) {
      const spellIdOrName = (sys.spellId || sys.spellName || '').toLowerCase().trim();
      const allSpells = CONFIG.DCC?.spells || [];
      const match = allSpells.find(s => (s._id && s._id.toLowerCase() === spellIdOrName) || (s.id && s.id.toLowerCase() === spellIdOrName) || (s.name && s.name.toLowerCase().trim() === spellIdOrName))
        || (actor?.items ? (actor.items.find ? actor.items.find(i => i.type === 'spell' && ((i._id && i._id.toLowerCase() === spellIdOrName) || (i.id && i.id.toLowerCase() === spellIdOrName) || (i.name && i.name.toLowerCase().trim() === spellIdOrName))) : Array.from(actor.items.values?.() || actor.items).find(i => i.type === 'spell' && ((i._id && i._id.toLowerCase() === spellIdOrName) || (i.id && i.id.toLowerCase() === spellIdOrName) || (i.name && i.name.toLowerCase().trim() === spellIdOrName)))) : null);

      if (match) {
        await consumeItemUse();
        if (actor && typeof actor.rollSpell === 'function') {
          return actor.rollSpell(match, {
            freeCast: true,
            originItem: this,
            isConsumable: true,
            isItemEffect: true
          });
        }
        return DCCItem.rollSpellCard(match, {
          freeCast: true,
          originItem: this,
          isConsumable: true,
          isItemEffect: true
        });
      }
    }

    // 5. Standard Consumable / Mana Potion Path
    const isManaPotion = itemName.toLowerCase().includes('mana potion') ||
      (sys.notes && sys.notes.toLowerCase().includes('mana') && sys.notes.toLowerCase().includes('refill'));

    let extraEffectHtml = '';
    if (isManaPotion && actor && actor.system?.attributes?.mana) {
      const currentMana = actor.system.attributes.mana.value ?? 0;
      const maxMana = actor.system.attributes.mana.max ?? 10;
      await actor.update({ 'system.attributes.mana.value': maxMana });
      extraEffectHtml = `
        <div style="margin-top: 6px; padding: 6px 8px; background: rgba(41, 128, 185, 0.15); border-left: 3px solid #2980b9; color: #2980b9; font-weight: bold; font-size: 12px; border-radius: 2px;">
          <i class="fa-solid fa-bolt"></i> Mana refilled completely to <strong>${maxMana} MP</strong>! (Was ${currentMana} MP)
        </div>
      `;
    }

    await consumeItemUse();

    const remainingUsesLabel = hasCharges
      ? `<strong>Remaining Charges:</strong> ${Math.max(0, currentCharges - 1)} / ${sys.charges.max}`
      : (currentQty > 1 ? `<strong>Remaining Quantity:</strong> ${currentQty - 1}` : '<em>Last consumable used.</em>');

    return ChatMessage.create({
      speaker: actor ? ChatMessage.getSpeaker({ actor }) : undefined,
      content: `
        <div class="dcc-chat-card dcc-item-card" style="font-family: var(--font-primary, sans-serif);">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #2980b9; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${this.img || 'icons/svg/item-bag.svg'}" style="width: 32px; height: 32px; border: 1px solid #000; border-radius: 4px;" />
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${itemName}</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: #2980b9; font-weight: bold;">Used Consumable</span>
            </div>
          </div>
          <p style="margin: 2px 0; font-size: 12px;">${remainingUsesLabel}</p>
          ${sys.notes ? `<p style="margin: 4px 0; font-size: 12px;">${sys.notes}</p>` : ''}
          ${sys.description ? `<div style="font-size: 12px; margin-top: 4px;">${sys.description}</div>` : ''}
          ${extraEffectHtml}
        </div>
      `
    });
  }

  static async rollSpellCard(spellItem, options = {}) {
    const sys = spellItem.system || {};
    const isFreeCast = Boolean(options.freeCast || options.noMana || options.isConsumable || options.isItemEffect || sys.freeCast);
    const manaCost = isFreeCast ? 0 : (sys.manaCost ?? 0);

    const manaDisplay = isFreeCast
      ? `<span style="color: #27ae60; font-weight: bold;"><i class="fa-solid fa-gift"></i> 0 MP (Free Cast)</span>`
      : (manaCost ? `<span style="color: #2980b9; font-weight: bold;">${manaCost} MP</span>` : '<span style="color: #2980b9; font-weight: bold;">None</span>');

    const sourceBadge = options.originItem || options.isConsumable || options.isItemEffect
      ? `<div><strong>Source:</strong> <span style="color: #8e44ad; font-weight: bold;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${options.originItem?.name || 'Item / Consumable Effect'}</span></div>`
      : '';

    let content = `
      <div class="dcc-chat-card dcc-spell-card ${isFreeCast ? 'dcc-free-cast' : ''}" style="font-family: var(--font-primary, sans-serif);">
        <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
          <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px;" />
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${spellItem.name}</h3>
            <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">${sys.spellType || 'Spell'}${sys.damageType ? ` • ${sys.damageType}` : ''}${isFreeCast ? ' • FREE CAST' : ''}</span>
          </div>
        </div>
        ${sys.quote ? `<div style="font-style: italic; color: #555; font-size: 12px; margin-bottom: 8px; border-left: 3px solid #d4af37; padding-left: 6px;">“${sys.quote}”</div>` : ''}
        <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #fdfaf2; border: 1px solid #e2d9c2; padding: 4px 6px; border-radius: 3px;">
          <div><strong>Mana:</strong> ${manaDisplay}</div>
          ${sourceBadge}
          <div><strong>Range:</strong> ${sys.range || 'Self'}</div>
          <div><strong>Duration:</strong> ${sys.duration || 'Instantaneous'}</div>
          ${sys.cooldown && sys.cooldown !== 'None' ? `<div><strong>Cooldown:</strong> ${sys.cooldown}</div>` : ''}
          ${sys.favored ? `<div><strong>Favored:</strong> ${sys.favored}</div>` : ''}
          ${sys.aiFavor ? `<div><strong>AI Favor:</strong> +${sys.aiFavor}</div>` : ''}
        </div>
        ${sys.baseDamage ? `<div style="margin-bottom: 6px; font-weight: bold; color: #c0392b; font-size: 13px;">Base Damage: ${sys.baseDamage}</div>` : ''}
        ${sys.description ? `<div style="font-size: 12px; line-height: 1.4; margin-bottom: 8px;">${sys.description}</div>` : ''}
        ${(() => {
          const formatRankBreak = (rb, legacy) => {
            const parts = [];
            if (rb) {
              if (rb.damageDice) parts.push(`+${rb.damageDice.replace(/^\+/, '')} Dmg`);
              if (rb.rankDamageDice && Number(rb.rankDamageDice) > 0) parts.push(`+${rb.rankDamageDice} Rank ${Number(rb.rankDamageDice) === 1 ? 'Die' : 'Dice'}`);
              if (rb.buffsResistances) parts.push(`Buff/Resist: ${rb.buffsResistances}`);
              if (rb.debuff) parts.push(`Debuff: [${rb.debuff}]`);
              if (rb.notes) parts.push(rb.notes);
            }
            if (parts.length === 0 && legacy && legacy !== 'None') {
              return legacy;
            }
            return parts.join(' | ');
          };

          const rb5 = formatRankBreak(sys.rankBreaks?.rank5, sys.upgrades?.rank5);
          const rb10 = formatRankBreak(sys.rankBreaks?.rank10, sys.upgrades?.rank10);
          const rb15 = formatRankBreak(sys.rankBreaks?.rank15, sys.upgrades?.rank15);
          const rb20 = formatRankBreak(sys.rankBreaks?.rank20, sys.upgrades?.rank20);

          if (rb5 || rb10 || rb15 || rb20) {
            return `
              <div style="border-top: 1px dashed #ccc; padding-top: 4px; font-size: 11px; color: #444; margin-top: 6px;">
                <div style="font-weight: bold; font-size: 10px; text-transform: uppercase; color: #7f8c8d; margin-bottom: 3px;">Rank Breaks:</div>
                ${rb5 ? `<div><strong style="color: #27ae60;">Rank 5:</strong> ${rb5}</div>` : ''}
                ${rb10 ? `<div><strong style="color: #2980b9;">Rank 10:</strong> ${rb10}</div>` : ''}
                ${rb15 ? `<div><strong style="color: #8e44ad;">Rank 15:</strong> ${rb15}</div>` : ''}
                ${rb20 ? `<div><strong style="color: #d35400;">Rank 20:</strong> ${rb20}</div>` : ''}
              </div>
            `;
          }
          return '';
        })()}
      </div>
    `;

    return ChatMessage.create({
      content,
      flags: {
        'carl-rpg': {
          isSpellCast: true,
          spellSuccess: true,
          manaCost,
          freeCast: isFreeCast,
          originItemName: options.originItem?.name || null,
          isItemEffect: Boolean(options.isItemEffect || options.isConsumable || options.originItem)
        }
      }
    });
  }

  get skillType() {
    if (this.type !== 'skill') return '';
    return this.system?.skillType || this.system?.type || 'Utility';
  }

  /**
   * Broadcast achievement to chat if this item is an achievement.
   */
  async announce() {
    if (this.type === 'achievement' && this.actor && typeof this.actor.announceAchievement === 'function') {
      return this.actor.announceAchievement(this);
    }
    return null;
  }
}
