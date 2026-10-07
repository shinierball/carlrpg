# Item & Entity Idempotence Subsystem

## Overview

In Dungeon Crawler Carl RPG (CarlRPG), game entities have clear rules regarding uniqueness and persistence:
1. **Discrete Non-Consumable Items**: Gear, weapons, and armor are unique discrete entries per acquisition so each can be equipped, modified, and tracked independently. Consumable loot (potions, scrolls) stacks by quantity.
2. **Crawler Cross-Scene Persistence**: Crawlers and pets are singular, global entities. Editing a crawler on any scene persists changes directly to the world actor, keeping all scenes and tokens perfectly in sync into the future.
3. **Globally Unique Spells (Idempotence)**: Spells on an actor are globally unique. Learning or adding a spell multiple times does not produce duplicate spellbook entries; it merges and preserves the highest rank.
4. **Compendium-to-World Synchronization**: Modifying a canonical Spell, Gear, Loot, Class, Race, Buff, Debuff, or Skill in a Compendium pack automatically propagates updates to every actor and world item in the campaign, ensuring changes are reflected for all users while preserving player progression (ranks, equipped status, quantity, and invested hours).

---

## Architectural Mechanics

### 1. Crawler Cross-Scene Synchronization
- **Prototype Token & Token Linking**:
  - `DCCActor._preCreate` enforces `prototypeToken.actorLink = true` for crawlers and pets.
  - The `preCreateToken` and `preUpdateToken` hooks enforce `actorLink: true`, preventing accidental token un-linking.
  - The `ready` hook scans all scenes in `game.scenes` and auto-migrates any unlinked crawler/pet tokens.
- **Synthetic Token Forwarding**:
  - In `DCCActor.prototype.update`, `createEmbeddedDocuments`, `updateEmbeddedDocuments`, and `deleteEmbeddedDocuments`, any mutation on a synthetic token actor (`this.isToken && (this.type === 'crawler' || this.type === 'pet')`) forwards directly to `this.baseActor` or `game.actors.get(this.token.actorId)`.
  - In `DCCCrawlerSheet._updateObject`, form submissions from token sheets update the base world actor directly.

### 2. Spell & Entity Idempotence
- **Actor-Level Idempotence**:
  - When dropping an item onto `DCCCrawlerSheet` or invoking `actor.createEmbeddedDocuments('Item', ...)`, items of type `spell` are checked against existing spells by UUID, compendium ID, or normalized name.
  - If already known, duplicate document creation is blocked; the incoming rank is merged (`Math.max(existing.system.rank, incoming.system.rank)`), and the existing item is returned.
- **Consumable Stacking**:
  - Dropping consumable loot (`type === 'loot'`) with matching names increments `system.quantity` rather than cluttering inventory with duplicate rows.

### 3. Compendium-to-World Sync Engine (`src/data/compendium-sync.mjs`)
- **Automatic Hook Registration**:
  - `registerCompendiumSyncHooks()` listens to Foundry's `updateItem` hook. Whenever a document in a compendium pack (`item.pack` or `isCompendiumDocument(item)`) is updated, `syncCompendiumItemToWorld(item)` is triggered.
  - `DCCItem.prototype.update` and `_onUpdate` also trigger synchronization directly when updating compendium items.
- **Preservation of Actor-Specific Progression**:
  - `preserveItemActorState(existingItem, compendiumSystem, itemType)` preserves:
    - **Spells**: Actor-invested `rank`.
    - **Gear**: `equipped`, `slot`, `quantity`, and current `charges.value`.
    - **Loot**: Current inventory `quantity` and `charges.value`.
    - **Skills**: Current `rank`, `investedHours`, and custom bonuses.
- **Dynamic Race & Class Bonus Refresh**:
  - When a Race or Class is updated in a compendium, `syncCompendiumItemToWorld` checks if any crawler has that race or class active (`actor.system.details.race` or `actor.system.details.class`).
  - Active characters automatically refresh their bonuses via `actor.applyRace(...)` or `actor.applyClass(...)`.
- **World Items Synchronization**:
  - Any world items in `game.items` matching the compendium entry are synchronized in tandem.

---

## Verification & Testing

The subsystem is thoroughly tested in `tests/item-idempotence.test.mjs`:
- `1. Non-consumable items are unique per entry; consumables stack quantity`
- `2. Crawlers persist across scenes: editing crawler on any scene updates base world actor`
- `3. Spells are globally unique on an actor (Idempotence)`
- `4. Modifying a spell in the compendium updates every user, preserving actor rank`
- `5. Modifying gear/loot in compendium updates every user, preserving equipped state & quantity`
- `6. Modifying Class in compendium updates embedded item and refreshes class on actors`
- `7. Modifying Race in compendium updates embedded item and refreshes race on actors`
- `8. Modifying Buffs & Debuffs in compendium updates all actors`
- `9. Modifying Skills in compendium updates all actors, preserving rank and training hours`
