/**
 * One-time Foundry data migration script.
 * Call this from a macro or system ready hook to migrate all legacy
 * regex-based data strings into the new structured schema fields.
 */
import { cleanOCRText } from './data/race-class-applier.mjs';

export async function migrateWorld() {
  ui.notifications.info("Starting CarlRPG System Migration. Please wait...");
  
  // 1. Migrate World Items
  for (let item of game.items) {
    try {
      const updateData = migrateItemData(item);
      if (!isEmpty(updateData)) {
        await item.update(updateData);
        console.log(`Migrated Item ${item.name}`);
      }
    } catch (err) {
      console.error(`Failed migrating Item ${item.name}`, err);
    }
  }

  // 2. Migrate World Actors
  for (let actor of game.actors) {
    try {
      const updateData = migrateActorData(actor);
      if (!isEmpty(updateData)) {
        await actor.update(updateData);
        console.log(`Migrated Actor ${actor.name}`);
      }
    } catch (err) {
      console.error(`Failed migrating Actor ${actor.name}`, err);
    }
  }

  ui.notifications.info("CarlRPG System Migration Complete!");
}

export function migrateItemData(item) {
  const updateData = {};
  const sys = item.system;

  // Add tags if missing
  if (!sys.tags) {
    updateData['system.tags'] = [];
  }

  // Parse legacy regex fields into tags or explicit properties
  if (['skill', 'attack', 'spell'].includes(item.type)) {
    const tags = sys.tags || [];
    const name = item.name.toLowerCase();

    if (/pugilism/i.test(name) && !tags.includes('pugilism')) tags.push('pugilism');
    if (/smush/i.test(name) && !tags.includes('smush')) tags.push('smush');
    if (/choke out/i.test(name) && !tags.includes('choke_out')) tags.push('choke_out');
    if (/fire fingers/i.test(name) && !tags.includes('fire_fingers')) tags.push('fire_fingers');

    if (tags.length > 0) updateData['system.tags'] = tags;
  }

  if (['race', 'class'].includes(item.type)) {
    if (!sys.grantedItems) updateData['system.grantedItems'] = [];
    if (!sys.choices) updateData['system.choices'] = [];
    
    // We would parse legacy text here into grantedItems
  }

  return updateData;
}

export function migrateActorData(actor) {
  const updateData = {};
  const sys = actor.system;

  // Future actor data migrations
  return updateData;
}
