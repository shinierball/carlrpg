/**
 * CarlRPG 3.2.0 System Migration
 *
 * Migrates existing items, gear, consumables, buffs, and debuffs
 * into the Unified Tag-Driven Effects & Grants Engine.
 *
 * 1. Gear: populates structured system.grants from legacy abilityModifiers, skillModifiers, and grantedSpells.
 * 2. Consumables: populates data-driven outcomes for mana potions and tags for healing/resources.
 * 3. Debuffs/Buffs: migrates prose damage reduction descriptions into structured damageModifiers and element tags.
 */

import { damageTypeToElement } from '../data/tags.mjs';
import { normalizeTagList } from '../utils/tag-query.mjs';

/**
 * Migrate single item document or item data object to 3.2.0 Tag-Driven Effects & Grants schema.
 * @param {object} item
 * @returns {object} Update object for item.update()
 */
export function migrateItemData320(item) {
  if (!item) return {};
  const sys = item.system || {};
  const itemType = item.type || '';
  const itemName = (item.name || '').toLowerCase().trim();
  const updateData = {};

  // 1. Gear Grants Migration
  if (itemType === 'gear') {
    const existingGrants = Array.isArray(sys.grants) ? [...sys.grants] : [];
    let grantsChanged = false;

    // Convert abilityModifiers
    if (sys.abilityModifiers && typeof sys.abilityModifiers === 'object') {
      for (const [stat, mod] of Object.entries(sys.abilityModifiers)) {
        if (!mod) continue;
        const val = Number(mod.value ?? mod.flat);
        const type = (mod.type || 'flat').toLowerCase();
        if (Number.isFinite(val) && val !== 0) {
          const exists = existingGrants.some(g => g.kind === 'stat' && g.stat?.toLowerCase() === stat.toLowerCase());
          if (!exists) {
            existingGrants.push({ kind: 'stat', stat: stat.toLowerCase(), value: val, type });
            grantsChanged = true;
          }
        }
      }
    }

    // Convert skillModifiers
    let rawSkillMods = sys.skillModifiers;
    if (rawSkillMods && !Array.isArray(rawSkillMods) && typeof rawSkillMods === 'object') {
      rawSkillMods = Object.values(rawSkillMods);
    }
    if (Array.isArray(rawSkillMods)) {
      for (const sm of rawSkillMods) {
        if (!sm || !sm.name) continue;
        const exists = existingGrants.some(g => g.kind === 'skill' && g.name?.toLowerCase() === sm.name.toLowerCase());
        if (!exists) {
          existingGrants.push({
            kind: 'skill',
            name: sm.name,
            bonus: Number(sm.bonus ?? sm.rank) || 1
          });
          grantsChanged = true;
        }
      }
    }

    // Convert grantedSpells / spells
    const rawSpells = sys.grantedSpells || sys.spells;
    const explicitSpells = Array.isArray(rawSpells) ? rawSpells : (rawSpells && typeof rawSpells === 'object' ? Object.values(rawSpells) : []);
    for (const sp of explicitSpells) {
      if (!sp) continue;
      const sName = typeof sp === 'string' ? sp : (sp.name || sp.spellName);
      if (!sName) continue;
      const exists = existingGrants.some(g => g.kind === 'spell' && (g.name || g.spellName)?.toLowerCase() === sName.toLowerCase());
      if (!exists) {
        existingGrants.push({
          kind: 'spell',
          name: sName,
          rank: Number(sp.rank ?? sp.bonus) || 1,
          cooldownHours: Number(sp.cooldownHours) || 0
        });
        grantsChanged = true;
      }
    }

    // Convert drBonus / evadeBonus into grants if not present
    if (Number(sys.drBonus) > 0 && !existingGrants.some(g => g.kind === 'dr')) {
      existingGrants.push({ kind: 'dr', value: Number(sys.drBonus) });
      grantsChanged = true;
    }
    if (Number(sys.evadeBonus) !== 0 && !existingGrants.some(g => g.kind === 'evade')) {
      existingGrants.push({ kind: 'evade', value: Number(sys.evadeBonus) });
      grantsChanged = true;
    }

    if (grantsChanged) {
      updateData['system.grants'] = existingGrants;
    }
  }

  // 2. Consumable / Loot Resource & Healing Migration
  if (itemType === 'loot') {
    const existingOutcomes = Array.isArray(sys.outcomes) ? [...sys.outcomes] : [];
    const existingTags = new Set(Array.isArray(sys.tags) ? sys.tags : []);
    let outcomesChanged = false;
    let tagsChanged = false;

    // Check if item is a Mana Potion
    const isManaItem = itemName.includes('mana potion') ||
      (sys.notes && sys.notes.toLowerCase().includes('mana') && sys.notes.toLowerCase().includes('refill'));

    if (isManaItem) {
      const hasManaOutcome = existingOutcomes.some(o => o.type === 'restore_resource' || o.type === 'mana' || o.resource === 'mana');
      if (!hasManaOutcome) {
        existingOutcomes.push({
          name: 'Refill Mana',
          type: 'restore_resource',
          resource: 'mana',
          mode: 'full',
          targetType: 'self',
          description: 'Refills mana completely to maximum reserves.'
        });
        outcomesChanged = true;
        updateData['system.executionMode'] = 'all';
      }
      if (!existingTags.has('resource.mana')) {
        existingTags.add('resource.mana');
        tagsChanged = true;
      }
      if (!existingTags.has('action.restore')) {
        existingTags.add('action.restore');
        tagsChanged = true;
      }
    }

    // Check if item has healing outcomes
    const hasHealOutcome = existingOutcomes.some(o => o.type === 'heal' || o.type === 'heal_bars' || o.healBars);
    if (hasHealOutcome) {
      if (!existingTags.has('action.heal')) {
        existingTags.add('action.heal');
        tagsChanged = true;
      }
      if (!existingTags.has('resource.hp-bars')) {
        existingTags.add('resource.hp-bars');
        tagsChanged = true;
      }
    }

    if (outcomesChanged) {
      updateData['system.outcomes'] = existingOutcomes;
    }
    if (tagsChanged) {
      updateData['system.tags'] = Array.from(existingTags);
    }
  }

  // 3. Debuff / Buff Structured Damage Modifiers Migration
  if (itemType === 'debuff') {
    const existingModifiers = Array.isArray(sys.damageModifiers) ? [...sys.damageModifiers] : [];
    const existingTags = new Set(Array.isArray(sys.tags) ? sys.tags : []);
    let modifiersChanged = false;
    let tagsChanged = false;

    // If debuff specifies reductionPercent or description mentions damage reduction without damageModifiers
    if (existingModifiers.length === 0) {
      const desc = (sys.description || item.name || '').toLowerCase();
      let dt = sys.damageType || '';
      let pct = Number(sys.reductionPercent) || 0;
      let rounding = sys.rounding || 'up';

      // Parse damage type from description if missing
      if (!dt) {
        for (const candidate of ['fire', 'ice', 'electric', 'acid', 'poison', 'force', 'sonic', 'holy', 'necrotic', 'psychic', 'bludgeoning', 'piercing', 'slashing']) {
          if (desc.includes(candidate)) {
            dt = candidate.charAt(0).toUpperCase() + candidate.slice(1);
            break;
          }
        }
      }

      if (!pct) {
        const pctMatch = desc.match(/(\d+)%\s*(?:reduction|damage)?/i);
        if (pctMatch) {
          pct = Number(pctMatch[1]);
        }
      }

      if (desc.includes('rounded up') || desc.includes('round up')) rounding = 'up';
      else if (desc.includes('rounded down') || desc.includes('round down')) rounding = 'down';

      if (pct > 0 || dt) {
        const elTag = damageTypeToElement(dt);
        existingModifiers.push({
          kind: 'reduction',
          damageType: dt,
          elementTag: elTag || '',
          reductionPercent: pct,
          rounding
        });
        modifiersChanged = true;

        if (elTag && !existingTags.has(elTag)) {
          existingTags.add(elTag);
          tagsChanged = true;
        }
      }
    }

    if (modifiersChanged) {
      updateData['system.damageModifiers'] = existingModifiers;
    }
    if (tagsChanged) {
      updateData['system.tags'] = Array.from(existingTags);
    }
  }

  return updateData;
}

/**
 * Migrate an actor document and all its embedded items to 3.2.0.
 * @param {object} actor
 * @returns {Promise<number>} Number of migrated embedded items
 */
export async function migrateActorData320(actor) {
  if (!actor) return 0;
  let migratedCount = 0;
  const items = actor.items ? (Array.isArray(actor.items) ? actor.items : Array.from(actor.items.values?.() || [])) : [];

  for (const embeddedItem of items) {
    const updateData = migrateItemData320(embeddedItem);
    if (Object.keys(updateData).length > 0) {
      if (typeof embeddedItem.update === 'function') {
        await embeddedItem.update(updateData);
      } else if (embeddedItem.system) {
        for (const [key, val] of Object.entries(updateData)) {
          if (key.startsWith('system.')) {
            embeddedItem.system[key.slice(7)] = val;
          }
        }
      }
      migratedCount++;
    }
  }

  return migratedCount;
}

/**
 * Migrate all world items and actors to 3.2.0.
 * @returns {Promise<{itemsMigrated: number, actorsMigrated: number}>}
 */
export async function migrateWorld320() {
  let itemsMigrated = 0;
  let actorsMigrated = 0;

  if (globalThis.ui?.notifications?.info) {
    globalThis.ui.notifications.info('Starting CarlRPG 3.2.0 Tag-Driven Effects & Grants Migration...');
  }

  // 1. World items
  if (globalThis.game?.items) {
    for (const item of globalThis.game.items) {
      const updateData = migrateItemData320(item);
      if (Object.keys(updateData).length > 0) {
        if (typeof item.update === 'function') {
          await item.update(updateData);
        }
        itemsMigrated++;
      }
    }
  }

  // 2. World actors
  if (globalThis.game?.actors) {
    for (const actor of globalThis.game.actors) {
      const count = await migrateActorData320(actor);
      if (count > 0) {
        actorsMigrated++;
      }
    }
  }

  if (globalThis.ui?.notifications?.info) {
    globalThis.ui.notifications.info(`CarlRPG 3.2.0 Migration Complete: ${itemsMigrated} items, ${actorsMigrated} actors updated.`);
  }

  return { itemsMigrated, actorsMigrated };
}
