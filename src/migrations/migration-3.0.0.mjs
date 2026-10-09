/**
 * CarlRPG 3.0.0 System Migration
 *
 * Migrates legacy items, actors, classes, and races into the Unified Tagging System.
 * Ensures all entities possess stable identifiers, explicit tags arrays,
 * structured grants, and technique associations without using regular expressions.
 */

import { DCC_SKILLS } from '../data/skills.mjs';
import { DCC_SPELLS } from '../data/spells.mjs';
import { DCC_CLASSES } from '../data/classes.mjs';
import { DCC_RACES } from '../data/races.mjs';
import { DCC_ITEMS } from '../data/items.mjs';
import { DCC_BUFFS, DCC_DEBUFFS } from '../data/buffs.mjs';
import { normalizeTagList } from '../utils/tag-query.mjs';
import { DCCRaceClassApplier } from '../data/race-class-applier.mjs';

export function normalizeLookupKey(str) {
  if (!str) return '';
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Ignore apostrophes and quotes: ' (39), " (34), ‘ (8216), ’ (8217), “ (8220), ” (8221)
    if (code === 39 || code === 34 || code === 8216 || code === 8217 || code === 8220 || code === 8221) continue;
    const ch = str[i].toLowerCase();
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
      out += ch;
    }
  }
  return out;
}

const CANONICAL_ITEMS_MAP = new Map();

function registerCanonicalBatch(list, defaultType) {
  if (!Array.isArray(list)) return;
  for (const entry of list) {
    if (!entry || !entry.name) continue;
    const typeKey = entry.type || defaultType;
    const key = `${typeKey}:${normalizeLookupKey(entry.name)}`;
    if (!CANONICAL_ITEMS_MAP.has(key)) {
      CANONICAL_ITEMS_MAP.set(key, entry);
    }
  }
}

registerCanonicalBatch(DCC_SKILLS, 'skill');
registerCanonicalBatch(DCC_SPELLS, 'spell');
registerCanonicalBatch(DCC_CLASSES, 'class');
registerCanonicalBatch(DCC_RACES, 'race');
registerCanonicalBatch(DCC_ITEMS, 'gear');
registerCanonicalBatch(DCC_BUFFS, 'buff');
registerCanonicalBatch(DCC_DEBUFFS, 'debuff');

/**
 * Generate a clean kebab-case slug without regular expressions.
 * @param {string} text
 * @returns {string}
 */
export function slugifyText(text) {
  if (!text || typeof text !== 'string') return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toLowerCase();
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) {
      result += ch;
    } else if (result.length > 0 && result[result.length - 1] !== '-') {
      result += '-';
    }
  }
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
}

/**
 * Migrate single item document or item data object to 3.0.0 Unified Tagging schema.
 * @param {object} item
 * @returns {object} Update object for item.update() or migration payload
 */
export function migrateItemData300(item) {
  if (!item) return {};
  const sys = item.system || {};
  const itemType = item.type || '';
  const itemName = (item.name || '').toLowerCase().trim();
  const updateData = {};

  // 1. Look up canonical counterpart
  const canonical = CANONICAL_ITEMS_MAP.get(`${itemType}:${normalizeLookupKey(itemName)}`) || null;

  // 2. Ensure Identifier
  const currentIdentifier = sys.identifier;
  if (!currentIdentifier || typeof currentIdentifier !== 'string' || !currentIdentifier.trim()) {
    const canonicalIdentifier = canonical?.system?.identifier;
    updateData['system.identifier'] = canonicalIdentifier || slugifyText(item.name || 'unnamed-item');
  }

  // 3. Ensure Tags
  let tags = sys.tags;
  if (!Array.isArray(tags)) {
    if (typeof tags === 'string' && tags.trim()) {
      tags = normalizeTagList(tags);
    } else if (canonical?.system?.tags && Array.isArray(canonical.system.tags)) {
      tags = [...canonical.system.tags];
    } else {
      tags = [];
    }
    updateData['system.tags'] = tags;
    // If existing tags are empty, check if canonical dataset supplies tags
    if (tags.length === 0 && canonical?.system?.tags?.length) {
      updateData['system.tags'] = [...canonical.system.tags];
    }
  }

  // Ensure rule.requires-weapon on weapon skills
  if (itemType === 'skill') {
    const activeTags = updateData['system.tags'] ? [...updateData['system.tags']] : (Array.isArray(sys.tags) ? [...sys.tags] : []);
    const hasWeaponTag = activeTags.some(t => t.startsWith('weapon.') || t === 'weaponClass.ranged' || t === 'weaponClass.melee');
    const isUnarmed = activeTags.includes('weaponClass.unarmed') || activeTags.includes('weaponClass.natural');
    if (hasWeaponTag && !isUnarmed && !activeTags.includes('rule.requires-weapon')) {
      activeTags.push('rule.requires-weapon');
      updateData['system.tags'] = activeTags;
    }
  }

  // 4. Ensure Grants for Classes and Races
  if (itemType === 'class' || itemType === 'race') {
    const currentGrants = sys.grants;
    if (!Array.isArray(currentGrants) || currentGrants.length === 0) {
      if (canonical?.system?.grants && Array.isArray(canonical.system.grants) && canonical.system.grants.length > 0) {
        updateData['system.grants'] = structuredClone(canonical.system.grants);
      } else if (canonical) {
        const parsed = DCCRaceClassApplier.parseGrants(canonical);
        if (parsed.length > 0) {
          updateData['system.grants'] = parsed;
        }
      }
    }
  }

  return updateData;
}

/**
 * Migrate an actor document and all its embedded items.
 * @param {object} actor
 * @returns {Promise<number>} Number of migrated embedded items
 */
export async function migrateActorData300(actor) {
  if (!actor) return 0;
  let migratedCount = 0;
  const items = actor.items ? (Array.isArray(actor.items) ? actor.items : Array.from(actor.items.values?.() || [])) : [];

  for (const embeddedItem of items) {
    const updateData = migrateItemData300(embeddedItem);
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
 * Migrate all world items and actors to 3.0.0.
 * @returns {Promise<{itemsMigrated: number, actorsMigrated: number}>}
 */
export async function migrateWorld300() {
  let itemsMigrated = 0;
  let actorsMigrated = 0;

  if (globalThis.ui?.notifications?.info) {
    globalThis.ui.notifications.info('Starting CarlRPG 3.0.0 Unified Tagging Migration...');
  }

  // 1. World items
  if (globalThis.game?.items) {
    for (const item of globalThis.game.items) {
      const updateData = migrateItemData300(item);
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
      const count = await migrateActorData300(actor);
      if (count > 0) {
        actorsMigrated++;
      }
    }
  }

  if (globalThis.ui?.notifications?.info) {
    globalThis.ui.notifications.info(`CarlRPG 3.0.0 Migration Complete: ${itemsMigrated} items, ${actorsMigrated} actors updated.`);
  }

  return { itemsMigrated, actorsMigrated };
}
