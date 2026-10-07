/**
 * Dungeon Crawler Carl RPG - Compendium Synchronization Engine
 * Handles globally unique item/spell/class/race/buff/debuff idempotence and
 * propagates compendium modifications across all world actors and items.
 */

/**
 * Checks whether a document belongs to a compendium pack.
 * @param {object} doc
 * @returns {boolean}
 */
export function isCompendiumDocument(doc) {
  if (!doc) return false;
  return Boolean(
    doc.pack ||
    doc.compendium ||
    doc.isCompendium ||
    doc.collection?.isCompendium ||
    (typeof doc.uuid === 'string' && doc.uuid.startsWith('Compendium.'))
  );
}

/**
 * Preserves actor-specific progression and state when syncing a compendium item.
 * @param {object} existingItem - The embedded item currently on the actor
 * @param {object} compendiumSystem - The system data from the compendium
 * @param {string} itemType - Item type (spell, gear, loot, skill, etc.)
 * @returns {object} Merged system data with actor progression preserved
 */
export function preserveItemActorState(existingItem, compendiumSystem, itemType) {
  const merged = structuredClone(compendiumSystem || {});
  const existingSystem = existingItem.system || {};

  switch (itemType) {
    case 'spell':
      // Preserve actor-specific spell rank
      if (existingSystem.rank !== undefined) {
        merged.rank = existingSystem.rank;
      }
      break;

    case 'gear':
      // Preserve equipped state, quantity, and current charge value
      if (existingSystem.equipped !== undefined) {
        merged.equipped = existingSystem.equipped;
      }
      if (existingSystem.quantity !== undefined) {
        merged.quantity = existingSystem.quantity;
      }
      if (existingSystem.slot !== undefined && existingSystem.slot !== '') {
        merged.slot = existingSystem.slot;
      }
      if (existingSystem.charges?.value !== undefined) {
        merged.charges = {
          ...(merged.charges || {}),
          value: existingSystem.charges.value
        };
      }
      break;

    case 'loot':
      // Preserve inventory quantity and current charges
      if (existingSystem.quantity !== undefined) {
        merged.quantity = existingSystem.quantity;
      }
      if (existingSystem.charges?.value !== undefined) {
        merged.charges = {
          ...(merged.charges || {}),
          value: existingSystem.charges.value
        };
      }
      break;

    case 'skill':
      // Preserve skill rank and invested training hours
      if (existingSystem.rank !== undefined) {
        merged.rank = existingSystem.rank;
      }
      if (existingSystem.investedHours !== undefined) {
        merged.investedHours = existingSystem.investedHours;
      }
      if (existingSystem.itemBonus !== undefined) {
        merged.itemBonus = existingSystem.itemBonus;
      }
      if (existingSystem.boonBonus !== undefined) {
        merged.boonBonus = existingSystem.boonBonus;
      }
      if (existingSystem.typeBonus !== undefined) {
        merged.typeBonus = existingSystem.typeBonus;
      }
      break;

    case 'buff':
    case 'debuff':
      // Preserve active state or specific duration remaining if present
      if (existingSystem.active !== undefined) {
        merged.active = existingSystem.active;
      }
      break;

    default:
      break;
  }

  return merged;
}

/**
 * Synchronizes an updated compendium item to all world actors and world items.
 * Guarantees that compendium modifications update for every user.
 * @param {object} compendiumItem - The modified compendium item
 * @param {object} [options={}] - Additional sync options (e.g. previousName)
 * @returns {Promise<{ actorsUpdated: number, itemsUpdated: number, worldItemsUpdated: number }>}
 */
export async function syncCompendiumItemToWorld(compendiumItem, options = {}) {
  if (!compendiumItem) return { actorsUpdated: 0, itemsUpdated: 0, worldItemsUpdated: 0 };

  const id = compendiumItem.id || compendiumItem._id;
  const name = compendiumItem.name;
  const type = compendiumItem.type;
  const img = compendiumItem.img;
  const pack = compendiumItem.pack || compendiumItem.collection?.collection || options.pack || '';
  const uuid = compendiumItem.uuid || (pack ? `Compendium.${pack}.${id}` : null);
  const canonicalSourceId = uuid || (pack ? `Compendium.${pack}.${id}` : null);
  const previousName = options.previousName || options.changed?.name || null;

  let actorsUpdated = 0;
  let itemsUpdated = 0;
  let worldItemsUpdated = 0;

  // 1. Synchronize to all World Actors
  const actors = Array.from(globalThis.game?.actors || []);
  for (const actor of actors) {
    const actorItems = Array.from(actor.items?.values?.() || actor.items || []);
    const matchingItems = actorItems.filter(item => {
      if (item.type !== type) return false;

      // Check explicit source references
      const sourceId = item.flags?.core?.sourceId || item.flags?.['carl-rpg']?.sourceUuid;
      const compId = item.flags?.['carl-rpg']?.compendiumId;

      if (canonicalSourceId && sourceId === canonicalSourceId) return true;
      if (id && compId === id) return true;
      if (canonicalSourceId && item._stats?.compendiumSource === canonicalSourceId) return true;

      // Check name match (case-insensitive)
      const curNorm = (item.name || '').toLowerCase().trim();
      const targetNorm = (name || '').toLowerCase().trim();
      if (curNorm === targetNorm) return true;

      // Check previous name match if renamed
      if (previousName && curNorm === previousName.toLowerCase().trim()) return true;

      return false;
    });

    if (matchingItems.length > 0) {
      actorsUpdated++;
      for (const item of matchingItems) {
        const updatedSystem = preserveItemActorState(item, compendiumItem.system, type);
        const updatePayload = {
          name,
          img: img || item.img,
          system: updatedSystem,
          flags: {
            core: {
              ...(item.flags?.core || {}),
              sourceId: canonicalSourceId || item.flags?.core?.sourceId
            },
            'carl-rpg': {
              ...(item.flags?.['carl-rpg'] || {}),
              compendiumId: id,
              sourceUuid: canonicalSourceId || item.flags?.['carl-rpg']?.sourceUuid
            }
          }
        };

        if (typeof item.update === 'function') {
          await item.update(updatePayload);
        } else if (typeof actor.updateEmbeddedDocuments === 'function') {
          await actor.updateEmbeddedDocuments('Item', [{ _id: item.id || item._id, ...updatePayload }]);
        }
        itemsUpdated++;
      }
    }

    // Special handling: If this is a Race, and the actor's race matches, refresh race bonuses
    if (type === 'race') {
      const actorRace = (actor.system?.details?.race || '').toLowerCase().trim();
      const targetRace = (name || '').toLowerCase().trim();
      const prevRace = previousName ? previousName.toLowerCase().trim() : null;

      if (actorRace === targetRace || (prevRace && actorRace === prevRace)) {
        if (typeof actor.applyRace === 'function') {
          await actor.applyRace(name, { interactive: false });
        }
      }
    }

    // Special handling: If this is a Class, and the actor's class matches, refresh class bonuses
    if (type === 'class') {
      const actorClass = (actor.system?.details?.class || '').toLowerCase().trim();
      const targetClass = (name || '').toLowerCase().trim();
      const prevClass = previousName ? previousName.toLowerCase().trim() : null;

      if (actorClass === targetClass || (prevClass && actorClass === prevClass)) {
        if (typeof actor.applyClass === 'function') {
          await actor.applyClass(name, { interactive: false });
        }
      }
    }
  }

  // 2. Synchronize to World Items in game.items
  const worldItems = Array.from(globalThis.game?.items || []);
  for (const wItem of worldItems) {
    if (wItem.type !== type) continue;

    const sourceId = wItem.flags?.core?.sourceId || wItem.flags?.['carl-rpg']?.sourceUuid;
    const compId = wItem.flags?.['carl-rpg']?.compendiumId;
    const curNorm = (wItem.name || '').toLowerCase().trim();
    const targetNorm = (name || '').toLowerCase().trim();
    const prevNorm = previousName ? previousName.toLowerCase().trim() : null;

    const isMatch = (canonicalSourceId && sourceId === canonicalSourceId) ||
      (id && compId === id) ||
      (curNorm === targetNorm) ||
      (prevNorm && curNorm === prevNorm);

    if (isMatch) {
      const updatedSystem = structuredClone(compendiumItem.system || {});
      const updatePayload = {
        name,
        img: img || wItem.img,
        system: updatedSystem,
        flags: {
          core: {
            ...(wItem.flags?.core || {}),
            sourceId: canonicalSourceId || wItem.flags?.core?.sourceId
          },
          'carl-rpg': {
            ...(wItem.flags?.['carl-rpg'] || {}),
            compendiumId: id,
            sourceUuid: canonicalSourceId || wItem.flags?.['carl-rpg']?.sourceUuid
          }
        }
      };

      if (typeof wItem.update === 'function') {
        await wItem.update(updatePayload);
      }
      worldItemsUpdated++;
    }
  }

  // 3. Update canonical entries in CONFIG.DCC if present
  if (globalThis.CONFIG?.DCC) {
    const pluralKey = type === 'loot' || type === 'gear' ? 'items' : `${type}s`;
    const targetArr = globalThis.CONFIG.DCC[pluralKey];
    if (Array.isArray(targetArr)) {
      const match = targetArr.find(c =>
        (id && (c._id === id || c.id === id)) ||
        (c.name && c.name.toLowerCase().trim() === (name || '').toLowerCase().trim())
      );
      if (match) {
        match.name = name;
        if (img) match.img = img;
        match.system = structuredClone(compendiumItem.system || {});
      }
    }
  }

  return { actorsUpdated, itemsUpdated, worldItemsUpdated };
}

/**
 * Registers Foundry VTT hooks for automatic compendium item synchronization.
 */
let _compendiumHooksRegistered = false;
export function registerCompendiumSyncHooks() {
  if (_compendiumHooksRegistered) return;
  if (typeof globalThis.Hooks === 'undefined') return;

  _compendiumHooksRegistered = true;

  // When any item is updated, check if it's a compendium document and sync
  globalThis.Hooks.on('updateItem', async (item, changed, options, userId) => {
    // Only execute on active GM or initiating client to avoid duplicate passes
    if (globalThis.game?.user && userId && userId !== globalThis.game.user.id) return;
    if (isCompendiumDocument(item) || options?.pack) {
      await syncCompendiumItemToWorld(item, { changed, options });
    }
  });

  // Guard against unlinking crawler or pet tokens on scene update
  globalThis.Hooks.on('preUpdateToken', (tokenDoc, changes, options, userId) => {
    const actor = tokenDoc.actor || globalThis.game?.actors?.get?.(tokenDoc.actorId);
    if (actor && (actor.type === 'crawler' || actor.type === 'pet')) {
      if (changes.actorLink === false) {
        changes.actorLink = true;
      }
    }
  });
}
