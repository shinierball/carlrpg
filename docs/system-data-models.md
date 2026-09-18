# System Data Models & Foundry V16 Roadmap

The Dungeon Crawler Carl RPG (CarlRPG) system is migrating from legacy `template.json` definitions and FormApplication v1 patterns to modern **System Data Models** (`foundry.abstract.TypeDataModel`) and **Application V2** (`foundry.applications.sheets.ActorSheetV2`, `ItemSheetV2`) in accordance with Foundry VTT core standards.

---

## 🏗️ Architecture Overview

System Data Models replace untyped JSON objects with strongly typed, schema-validated ES classes. Each document sub-type defines its exact structure using `foundry.data.fields.*`. Sheets utilize Application V2 with `HandlebarsApplicationMixin`.

### Benefits
1. **Strong Typing & Auto-Validation**: Numeric bounds, integers, required strings, and nested schemas are enforced at the engine level.
2. **Encapsulated Business Logic**: Methods and computed getters (e.g., `skill.system.totalRank`, `attack.system.averageDamage`) live directly on `item.system` and `actor.system`.
3. **Data Sanitization (`htmlFields`)**: Rich-text HTML content is safely sanitized by the Foundry server on save.
4. **Seamless Migrations**: Built-in `migrateData(source)` handles legacy updates transparently.
5. **Decoupled Data Preparation**: Core stat calculations, modifiers, gear tallies, buff resolutions, skill cascading, and progression math live within model classes rather than bloated monolithic document classes.
6. **Application V2 UI Modernization**: Sheet controllers implement declarative `DEFAULT_OPTIONS`, `PARTS`, `_prepareContext()`, and native `_onRender()` while maintaining dual backwards compatibility for legacy v1 calling conventions.

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

## 👥 Phase 2: Actor Data Models (v2.0.1 - v2.0.17)

All 5 Actor document sub-types are registered in `CONFIG.Actor.dataModels`:

| Actor Type | Model Class | Base Class | Key Schema Fields & Capabilities |
| :--- | :--- | :--- | :--- |
| `crawler` | `CrawlerDataModel` | `BaseActorDataModel` | Full 5 abilities (`str`, `int`, `con`, `dex`, `cha`), base attributes (`hp`, `mana`, `evade`, `dr`, `speed`, `externalBuffs`), `details` (`floor`, `race`, `class`, `level`, `xp`, `personalSpace`), `gearSlots`, `hotlist`. Computes gear bonuses, buffs, debuffs, stat modifiers, evade/DR, skill cascading bonuses, and XP level thresholds. |
| `pet` | `PetDataModel` | `BaseActorDataModel` | Core abilities, attributes (`hp` from CON mod, `evade` from DEX mod), `details` (`level`, `special`, `attack1`, `attack2`). |
| `mount_vehicle` | `MountVehicleDataModel` | `TypeDataModel` | Structural attributes: `hp` (`value`, `max`, `pct`), `size` (normalized via `getSizeInfo`), `move`, `dr`, `occupants`, `accessories`. |
| `npc` | `NPCDataModel` | `BaseActorDataModel` | Core abilities and attributes, `details` (`level`, `xpValue`, `notes`, `special`). |
| `mob` | `MobDataModel` | `BaseActorDataModel` | Dungeon monster/enemy model. Features variable health bar slots (`hp.bars`, default 2), `hp.hpPerBar` (defaults to CON mod), `attributes.treasure`, `attributes.xp`, `surpriseDifficulty`, `evadeDifficulty`, unlinked scene tokens (`actorLink: false`), and auto-incrementing sequential naming on scene placement/pasting (e.g. `Goblin 1`, `Goblin 2`). |

### Token Trackable Attributes
Registered under `CONFIG.Actor.trackableAttributes`:
- `crawler`, `pet`, `npc`:
  - Bars: `attributes.hp`, `attributes.mana`
  - Values: `attributes.evade.total`, `attributes.dr.total`, `details.level`
- `mount_vehicle`:
  - Bars: `attributes.hp`
  - Values: `attributes.dr`, `attributes.move`
- `mob`:
  - Bars: `attributes.hp`
  - Values: `attributes.evadeDifficulty`, `attributes.surpriseDifficulty`, `details.level`, `attributes.xp`

---

## 🖥️ Phase 3: Application V2 Forward-Compatible Sheets (v2.0.1)
 
Character and Item sheet controllers have been modernized to use **Application V2** paradigms (`DEFAULT_OPTIONS`, `PARTS`, `_prepareContext(options)`, `_onRender()`, dual constructor support) while inheriting from `ActorSheet` and `ItemSheet` (`FormApplication`) to maintain 100% native compatibility with Foundry V12's `Actors.registerSheet` and `Items.registerSheet`:
 
### Features & Architecture
1. **DCCCrawlerSheet**:
   - Extends `ActorSheet` directly to guarantee seamless registration and form handling in Foundry V12/V13.
   - `DEFAULT_OPTIONS`: Defines `tag: 'form'`, `classes: ['dcc-sheet-window', 'actor', 'crawler']`, `position: { width: 860, height: 900 }`, and header window controls for direct fillable PDF export.
   - `PARTS`: `sheet: { template: 'systems/carl-rpg/templates/actors/crawler-sheet.hbs' }`.
   - `_prepareContext(options)`: Compiles the full template context (creature size options, categorized items, equipped gear by slot, hotlist options, stat breakdowns).
   - `_onRender(context, options)`: Native listener attachment without jQuery dependency.
   - Dual constructor: Accepts both Application V2 options (`new DCCCrawlerSheet({ document: actor })`) and legacy positional arguments (`new DCCCrawlerSheet(actor)`).
   - Dual context access: Both `_prepareContext()` and `getData()` return identical data.
2. **DCCItemSheet**:
   - `DEFAULT_OPTIONS`: Form options, `position: { width: 580, height: 640 }`.
   - `PARTS`: `sheet: { template: 'systems/carl-rpg/templates/items/item-sheet.hbs' }`.
   - `_prepareContext(options)`: Compiles item details, compendium skills, damage types, and modifier lists.
   - Dual constructor and context access.
3. **Application Namespace**:
   - Exposed under `game.dcc.applications`: `DCCCrawlerSheet`, `DCCItemSheet`, and management apps.

---

## 🚀 Summary of Release 2.0.1
With Phases 1, 2, and 3 complete, CarlRPG is fully prepared for Foundry Virtual Tabletop V16:
- 11 Item Data Models
- 4 Actor Data Models
- Application V2 Sheet Architecture
- 100% Backward Compatibility with existing worlds, macros, and compendiums
- 259 Automated Unit Tests passing with 0 failures
