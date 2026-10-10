/**
 * Foundry VTT CarlRPG System Migration Facade
 * Delegates to versioned migration modules (e.g. CarlRPG 3.0.0 Unified Tagging).
 */

import { migrateWorld300, migrateItemData300, migrateActorData300, slugifyText } from './migrations/migration-3.0.0.mjs';
import { migrateWorld320, migrateItemData320, migrateActorData320 } from './migrations/migration-3.2.0.mjs';

export {
  migrateWorld300, migrateItemData300, migrateActorData300, slugifyText,
  migrateWorld320, migrateItemData320, migrateActorData320
};

export async function migrateWorld() {
  const res300 = await migrateWorld300();
  const res320 = await migrateWorld320();
  return {
    itemsMigrated: (res300?.itemsMigrated || 0) + (res320?.itemsMigrated || 0),
    actorsMigrated: (res300?.actorsMigrated || 0) + (res320?.actorsMigrated || 0)
  };
}

export function migrateItemData(item) {
  const up300 = migrateItemData300(item) || {};
  const up320 = migrateItemData320(item) || {};
  return { ...up300, ...up320 };
}

export async function migrateActorData(actor) {
  const count300 = await migrateActorData300(actor);
  const count320 = await migrateActorData320(actor);
  return count300 + count320;
}
