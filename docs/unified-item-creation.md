# Dungeon Crawler Carl RPG — Unified Item Creation & Association System

## Overview

The **Unified Item Creation & Association Subsystem** establishes a unified builder workflow across all CarlRPG entities, data-driven skill and combat technique suggestions, GM-restricted gold valuation, and standard 1x critical hit multipliers.

---

## 1. Unified Global Creation & Editing Interface

All game items—weapons, equipment, spells, skills, classes, races, buffs, debuffs, and loot—share the exact same editor interface (`DCCItemSheet`) for both initial creation and subsequent editing.

### Entry Points
1. **Right Global Sidebar Navigation**:
   - The Item Directory `Create Item` button triggers `openGlobalItemCreatorDialog()`.
   - Selecting any object type immediately creates the item document and opens `DCCItemSheet`.
2. **Dedicated Studio & Library Applications**:
   - **Skill Studio (`SkillManagerApp`)**: `Create Custom Skill` creates the skill and launches `DCCItemSheet`.
   - **Spell Studio (`SpellManagerApp`)**: `Custom Spell` creates the spell and launches `DCCItemSheet`.
   - **Item Manager (`ItemManagerApp`)**: `Create Custom Gear` / `Create Custom Loot` creates the item and launches `DCCItemSheet`.
3. **Programmatic API**:
   - `game.dcc.createAndEditItem(type, initialData)` creates any document type and automatically calls `item.sheet.render(true)`.

---

## 2. Data-Driven Skill & Technique Associations

Instead of requiring users to remember or type comma-separated lists of skills and techniques, weapon items provide interactive, data-driven tag pills and suggestion controls.

### Architecture (`src/data/weapon-associations.mjs`)
- **No Regex or Arbitrary Substring Matching (GEMINI.md Rule 0)**:
  - Weapon-skill suggestions are driven by canonical dictionary maps (`CANONICAL_WEAPON_SKILL_MAP`, `CANONICAL_WEAPON_TECHNIQUE_MAP`) and dynamic skill definitions.
- **Dynamic `appliesTo` Querying**:
  - Any custom or compendium skill can define `system.appliesTo` with weapon types or categories (e.g. `['Crossbow', 'Ranged']`).
  - When editing a weapon, `getRecommendedAssociatedSkills(item, allSkills)` and `getRecommendedOptionalEffects(item, allSkills)` dynamically match skills and techniques configured to apply to that weapon.
- **Precedence Order**:
  - Specific weapon types (e.g., `Crossbow`, `Chainsaw`, `Dagger`) are prioritized before broad categories (e.g., `Ranged`, `Power Weapons`, `Edge`).
  - Crossbows automatically receive `['Crossbow', 'Ranged Weapons', 'Aiming']`.
  - Generic ranged weapons receive `['Ranged Weapons', 'Aiming']`.

### UI Controls in `DCCItemSheet`
- **Pill Badge Lists**: Shows active associated skills and optional effects with `[×]` removal buttons.
- **Dropdown Adders**: Dropdowns populate all available skills and combat techniques from the world and compendiums.
- **Custom Add Input**: Allows entering arbitrary or homebrew skill names.
- **Auto-Suggest Buttons**:
  - `⚡ Auto-Suggest Skills`: Applies canonical proficiencies for the weapon model and category with a single click.
  - `⚡ Auto-Suggest Techniques`: Applies canonical combat maneuvers and damage effects with a single click.

---

## 3. Default 1x Critical Hit Multipliers

In CarlRPG, base critical hit damage multipliers default to **1x** across all ranks during creation:
- **Weapons & Attacks**: `system.critMultiplier` defaults to `1`.
- **Skills**: `system.critMultiplierR5` and `system.critMultiplierR15` default to `1`.
- **Spells**: `system.critMultiplierR5` and `system.critMultiplierR15` default to `1`.
- **GM Adjustability**:
  - Critical multiplier fields are exposed in `DCCItemSheet` for weapons, skills, and spells, allowing the Game Master to customize crit scaling at any time.

---

## 4. Gold Value Permission Security

In DCC RPG, item values are strictly managed by the Game Master:
- **GM Mode**:
  - The Gold Value input (`system.value`) is fully editable on item creation and on the item sheet.
- **Player Mode**:
  - Gold value input is disabled and marked read-only.
  - Non-GM players require *Determine Value* Rank 10 to inspect an item's true gold appraisal.
  - Form submission explicitly strips `system.value` updates from non-GM users in `DCCItemSheet._updateObject`, preventing malicious tampering.
