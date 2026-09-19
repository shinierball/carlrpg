# Dungeon Crawler Carl RPG — Buff & Condition Subsystem

## Overview

The CarlRPG system features a robust **External Buffs & Conditions** framework on Tab 1 (Core & Combat) and Tab 4 (Conditions & Effects) of character sheets, backed by the **Condition & Buff Manager** (`DCCBuffDebuffManager`). Crawlers and mobs can have up to 3 active external buffs applied at any given time, dynamically modifying core ability scores, providing temporary health, damage resistances, immunities, or combat multipliers. Character buffs on Tab 4 also feature 1-click quick-assignment buttons (`[1]`, `[2]`, `[3]`) to directly slot any owned buff into External Buff slots 1, 2, or 3.

---

## Active External Buff Slots (Page 1 Core)

Located on Page 1 (Core), the **Active External Buffs** panel provides 3 dedicated buff slots:
- **Slot Badges**: High-contrast badges reflecting buff category (`STAT`, `TEMP HP`, `RESIST`, `IMMUNE`, `MULT`, `COMBAT`, or `BUFF`).
- **Dynamic Summaries**: Automatically displays clean effect summaries (e.g. `+5 STR`, `+10 Temp HP`, `50% Fire Dmg`).
- **Quick Clear Action**: Clicking `[ ✕ ]` in the slot header instantly clears the slot and recalculates derived actor stats.
- **Categorized Dropdown Selector**: Quick-access `<select class="external-buff-select">` organized into distinct optgroups:
  - `📦 Character Buffs`: Buff items directly owned and embedded on the character.
  - `🌍 World Buffs`: Buff items defined in the Foundry world directory.
  - `⚡ Ability Score Buffs`: Canonical compendium stat bonuses.
  - `❤️ Temporary Health Buffs`: Compendium Temp HP bonuses.
  - `🛡️ Damage Resistance Buffs`: 13 canonical damage type resistance buffs (50% reduction).
  - `🌟 Damage Immunity Buffs`: 13 canonical damage type immunity buffs (100% negation).
  - `⚔️ Damage Multiplier & Combat Buffs`: Combat and damage scaling buffs.
  - `✨ Other Compendium Buffs`: Miscellaneous buffs.

---

## Custom Buffs & Prioritized Single-Match Selection

### 1. Defining Custom Buffs
Players and Game Masters can define custom buffs at any time:
1. On the Character Sheet (Tab 1 Core or Tab 4 Conditions & Effects), click **Add Buff** / **New Buff**.
2. Open the buff item sheet to customize:
   - **Name**: Give the buff a unique name (e.g. `Strength +5`, `Hero's Might`, or `Strength Buff`).
   - **Primary Buff Type**: `stat`, `tempHp`, `damageMultiplier`, `resistance`, `immunity`, or `custom`.
   - **Value / Multiplier**: Set the numerical bonus (e.g. `5` for +5 STR).
   - **Stat Modifiers Table**: Configure one or more specific ability bonuses (`str`, `int`, `con`, `dex`, `cha`).
   - **Damage Modifiers Table**: Add typed damage bonuses or resistances.

### 2. Single-Match Hierarchical Selection Resolution
To prevent the default compendium options (e.g. default `Strength Buff (+2 STR)`) from visually overriding custom buffs when reopening or re-rendering character sheets, the sheet controller uses a strict hierarchical selection resolution:
1. **Priority 1 (Exact Resolved ID Match)**: Checks if any option's ID matches the actor's resolved buff ID (`resolvedBuff.id`). When a character's owned buff is assigned, its exact document ID matches in `📦 Character Buffs`.
2. **Priority 2 (Exact Value ID Match)**: Matches the raw stored slot string against option IDs.
3. **Priority 3 (Hierarchical Name Match)**: If assigned via a name string, searches option groups in order (`📦 Character Buffs` first, then `🌍 World Buffs`, then compendium groups), ensuring owned custom buffs are matched before compendium defaults.
4. **Single-Selection Guarantee**: Across all groups in the `<select>`, exactly ONE option receives `selected: true`. Compendium defaults never steal selection from character-owned custom buffs.

### 3. Custom String & Macro Resolution
The underlying `DCCActor.resolveBuff` engine natively parses custom buff strings set via macros or scripts:
- **Prefix Format**: `+5 STR`, `+10 Temp HP`, `*2 Fire Damage`.
- **Postfix Format**: `Strength +5`, `STR +5`, `Constitution +3`.
- Automatically maps full stat names (`strength`, `intelligence`, `constitution`, `dexterity`, `charisma`) and abbreviations (`str`, `int`, `con`, `dex`, `cha`).

---

## DCC Condition & Buff Manager (`DCCBuffDebuffManager`)

Accessible via the header button or macro, the **Condition & Buff Manager** provides:
- Live search across all canonical, world, and actor-owned conditions.
- Categorized filter tabs (`All`, `Buffs`, `Debuffs`, `Stat Modifiers`, `Defenses & Temp HP`).
- One-click application to any active external buff slot or embedded debuffs.
