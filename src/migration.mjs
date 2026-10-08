/**
 * Foundry VTT CarlRPG System Migration Facade
 * Delegates to versioned migration modules (e.g. CarlRPG 3.0.0 Unified Tagging).
 */

import { migrateWorld300, migrateItemData300, migrateActorData300, slugifyText } from './migrations/migration-3.0.0.mjs';

export { migrateWorld300, migrateItemData300, migrateActorData300, slugifyText };

export async function migrateWorld() {
  return migrateWorld300();
}

export function migrateItemData(item) {
  return migrateItemData300(item);
}

export async function migrateActorData(actor) {
  return migrateActorData300(actor);
}
