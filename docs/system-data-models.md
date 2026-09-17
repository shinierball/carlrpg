# System Data Models & Foundry V16 Roadmap

The Dungeon Crawler Carl RPG (CarlRPG) system is migrating from legacy `template.json` definitions to modern **System Data Models** (`foundry.abstract.TypeDataModel`) in accordance with Foundry VTT core standards.

---

## 🏗️ Architecture Overview

System Data Models replace untyped JSON objects with strongly typed, schema-validated ES classes. Each document sub-type defines its exact structure using `foundry.data.fields.*`.

### Benefits
1. **Strong Typing & Auto-Validation**: Numeric bounds, integers, required strings, and nested schemas are enforced at the engine level.
2. **Encapsulated Business Logic**: Methods and computed getters (e.g., `skill.system.totalRank`, `attack.system.averageDamage`) live directly on `item.system` and `actor.system`.
3. **Data Sanitization (`htmlFields`)**: Rich-text HTML content is safely sanitized by the Foundry server on save.
4. **Seamless Migrations**: Built-in `migrateData(source)` handles legacy updates transparently.
5. **Decoupled Data Preparation**: Core stat calculations, modifiers, gear tallies, buff resolutions, skill cascading, and progression math live within model classes rather than bloated monolithic document classes.

---

## 📦 Phase 1: Item Data Models (v2.0.1)

All 11 Item document sub-types are registered in `CONFIG.Item.dataModels`:

| Item Type | Model Class | Key Schema Fields |
| :--- | :--- | :--- |
| `skill` | `SkillDataModel` | `rank`, `boonBonus`, `itemBonus`, `typeBonus`, `stat`, `checkType`, `damageModifiers`, `totalRank` |
| `attack` | `AttackDataModel` | `toHitStat`, `toHitRank`, `damageDice`, `damageStat`, `damageParts`, `effects` |
| `spell` | `SpellDataModel` | `rank`, `stat`, `manaCost`, `range`, `duration`, `cooldown`, `spellType`, `upgrades` |
| `gear` | `GearDataModel` | `slot`, `quantity`, `equipped`, `drBonus`, `evadeBonus`, `abilityModifiers`, `skillModifiers` |
| `buff` | `BuffDataModel` | `buffType`, `stat`, `value`, `damageMultiplier`, `damageType`, `duration` |
| `debuff` | `DebuffDataModel` | `severity`, `damageType`, `reductionPercent`, `rounding`, `duration` |
| `loot` | `LootDataModel` | `quantity`, `notes`, `description` |
| `race` | `RaceDataModel` | `abilities`, `description` |
| `class` | `ClassDataModel` | `abilities`, `description` |
| `deity` | `DeityDataModel` | `boons`, `description` |
| `sponsor` | `SponsorDataModel` | `gifts`, `notes`, `description` |

---

## 👥 Phase 2: Actor Data Models (v2.0.1)

All 4 Actor document sub-types are registered in `CONFIG.Actor.dataModels`:

| Actor Type | Model Class | Base Class | Key Schema Fields & Capabilities |
| :--- | :--- | :--- | :--- |
| `crawler` | `CrawlerDataModel` | `BaseActorDataModel` | Full 5 abilities (`str`, `int`, `con`, `dex`, `cha`), base attributes (`hp`, `mana`, `evade`, `dr`, `speed`, `externalBuffs`), `details` (`floor`, `race`, `class`, `level`, `xp`, `personalSpace`), `gearSlots`, `hotlist`. Computes gear bonuses, buffs, debuffs, stat modifiers, evade/DR, skill cascading bonuses, and XP level thresholds. |
| `pet` | `PetDataModel` | `BaseActorDataModel` | Core abilities, attributes (`hp` from CON mod, `evade` from DEX mod), `details` (`level`, `special`, `attack1`, `attack2`). |
| `mount_vehicle` | `MountVehicleDataModel` | `TypeDataModel` | Structural attributes: `hp` (`value`, `max`, `pct`), `size` (normalized via `getSizeInfo`), `move`, `dr`, `occupants`, `accessories`. |
| `npc` | `NPCDataModel` | `BaseActorDataModel` | Core abilities and attributes, `details` (`level`, `xpValue`, `notes`, `special`). |

### Token Trackable Attributes
Registered under `CONFIG.Actor.trackableAttributes`:
- `crawler`, `pet`, `npc`:
  - Bars: `attributes.hp`, `attributes.mana`
  - Values: `attributes.evade.total`, `attributes.dr.total`, `details.level`
- `mount_vehicle`:
  - Bars: `attributes.hp`
  - Values: `attributes.dr`, `attributes.move`

### Accessing Data Models in Code
```javascript
// Retrieve an actor and inspect typed fields
const crawler = game.actors.getName('Carl');

// Read strongly-typed fields
console.log(crawler.system.details.level); // e.g. 1
console.log(crawler.system.abilities.str.value); // Enhanced STR score
console.log(crawler.system.abilities.str.mod); // DCC stat modifier

// Model-prepared values
console.log(crawler.system.attributes.evade.total); // Evade with DEX + gear + buffs
console.log(crawler.system.details.xp.pct); // Level progression percentage
```

---

## 🗺️ Future Phases

- **Phase 3 (Application V2 / Sheet Migration)**:
  - Transition `DCCCrawlerSheet` and `DCCItemSheet` to `foundry.applications.sheets.ActorSheetV2` with `HandlebarsApplicationMixin`.
  - Deprecate FormApplication v1 patterns in preparation for Foundry V16.
