# Dungeon Crawler Carl RPG — Consumables, Loot & Outcome Builder 2.0 System

## Overview

The **Loot, Consumable & Gear Outcome System** in CarlRPG provides a unified effects engine for consumable items (potions, elixirs), spell scrolls, wands with charges, lottery scratch-off tickets, and activated gear pieces.

Items can be triggered and activated from:
1. **Crawler Character Sheet** (Page 4: Inventory tab -> `.item-use` button on consumables or activated gear)
2. **Combat Hotlist** (Slots 1–10 -> `.roll-hotlist-use`)
3. **Crawler Token Action HUD** (Token action overlay -> `[ Use ]`)

---

## Key Features & Mechanics

### 1. Execution Modes (`system.executionMode`)
- **All Effects (Guaranteed Combo)** (`executionMode: "all"`):
  - Every defined effect in the outcomes list resolves simultaneously upon item use.
  - Ideal for restorative elixirs, multi-benefit potions (e.g. heal 2 bars, mend minor injury, cure debuffs, and apply Troll Blood HoT), and activated gear abilities.
  - Chat card lists all applied effects in an organized multi-effect summary card with 1-click apply/re-apply buttons.
- **Weighted Random Outcome** (`executionMode: "random"`):
  - Single outcome randomly rolled based on integer weights summing to 100%.
  - Used for World Dungeon lottery tickets (e.g., Scratch-Off Tickets).
  - Displays a weight warning banner if weights do not sum to 100% and provides a 1-click `[ Auto-balance to 100% ]` helper.
- **Roll Table** (`executionMode: "table"`):
  - Draws directly from a designated Foundry VTT RollTable (`system.tableUuid` / `system.tableName`).

---

### 2. Supported Effect & Outcome Types

| Outcome Type | Description | Target Options | Mechanics & Resolution |
| :--- | :--- | :--- | :--- |
| **Heal Bars (Fixed)** | Restores $X$ Health Bars immediately. | Self, Closest Mob, Targeted Token | Calculates $X \times \text{CON Mod}$ HP restored; capped at max HP. |
| **Heal over Time (HoT)** | Restores $X$ Health Bars per round for $Y$ rounds. | Self, Closest Mob, Targeted Token | Creates embedded buff item with `buffType: "heal"`, `healingPerRound: "$X$ bars"`, automatically ticked during `DCCCombat` rounds. |
| **Mend Injury** | Removes Minor, Major, or All injuries. | Self, Targeted Token | Mends injury debuffs matching severity (`minor`, `major`, or `all`). |
| **Cure Debuff(s)** | Removes specific or all active debuffs. | Self, Targeted Token | Cures debuffs matching filter (e.g., `all`, `Burned`, `Poisoned`, `Bleeding`). |
| **Grant Buff** | Bestows a temporary or structured buff. | Self, Closest Mob, Targeted Token | Selectable from canonical DCC buffs or custom. Placed into external buff slot or embedded buff. |
| **Inflict Debuff** | Inflicts a debuff condition on target(s). | Self, Closest Mob, Targeted Token | Selectable from canonical DCC debuffs or custom. Embedded onto recipient. |
| **Raise Skill Rank (+)** | Permanently increments a skill's rank by $+N$. | Self, Targeted Token | Permanently updates `system.rank` and recomputes effective/modified skill rank. |
| **Permanent Stat Boost (+)** | Permanently increments an unenhanced ability score by $+N$. | Self, Targeted Token | Permanently updates `system.abilities.<stat>.unenhanced` and recalculates DCC stat modifier and max HP. |
| **Cast Spell / Damage** | Unleashes spell attack or damage packet. | Self, Closest Mob, Targeted Token | Evaluates dice formula (e.g., `2d12 + Int Mod`), damage type, and disadvantage rules. |
| **Roll Table** | Triggers a draw from a specified RollTable. | Self, Targeted Token | Draws from designated table UUID. |
| **Custom** | Displays customized flavor and effect descriptions. | Self, Closest Mob, Targeted Token | Outputs rich chat card text. |

---

### 3. Wands with Charges Pool & Spell Scrolls

- **Wands & Charged Items** (`lootType: "wand"`):
  - Equipped with a charges pool (`system.charges.value` / `system.charges.max`).
  - Using the wand decrements `charges.value` by 1.
  - When charges reach 0, the item is **retained** in inventory (not deleted) and alerts the user when attempted to be used while depleted.
- **Spell Scrolls** (`lootType: "scroll"`):
  - Single-use items inscribed with a specific spell (`system.spellId` / `system.spellName`).
  - Casting from a scroll incurs **0 mana cost** to the crawler, allowing casting even with 0 MP remaining.
  - Consuming the scroll decrements quantity and removes it on final use.

---

### 4. Activated Gear with On-Use Effects

- Pieces of armor, weapons, or accessories can enable `system.hasActivatedAbility: true`.
- Supports usage limits / cooldowns (e.g. `"Once per scene"`, `"1/Day"`).
- Supports charges pool (`system.charges`) or uses.
- Includes the full Outcomes Builder:
  - Attach multi-effect guaranteed combos or random effects to any piece of gear.
  - Uses can be triggered directly from the sheet Inventory tab via the red bolt `[ ⚡ ]` action button, hotlist, or token HUD.
  - Gear is never deleted when uses run out (retains 0 quantity or 0 charges).

---

### 5. Interactive Chat Cards

All consumable and activated gear usages produce rich, themed chat cards with 1-click GM/player interaction buttons:
- `[ Apply Damage ]`: Applies evaluated damage deducting DR via `DCCCombatMetrics`.
- `[ Apply Healing ]`: Restores health bars directly, capped at max HP.
- `[ Apply Regeneration ]`: Applies HoT buff condition with round duration.
- `[ Mend Injury ]`: Clears minor/major injury debuffs from target.
- `[ Cure Debuff ]`: Clears debuffs matching the filter.
- `[ Grant Skill Rank ]`: Increases target's skill rank.
- `[ Grant Stat Boost ]`: Permanently increases target's unenhanced stat.
- `[ Apply Buff ]` / `[ Apply Debuff ]`: Instantly applies condition items.
- `[ Draw from Table ]`: Rolls on the linked roll table.

---

## Canonical Compendium Pack (`carl-rpg.items`)

1. **Normal Mana Potion** (`dccitm0000000001`):
   - Refills crawler mana completely to maximum (10 MP base).
   - Quantity: 1.
2. **Scratch-off Ticket - Fireball or Custard** (`dccitm0000000002`):
   - 6 Scratches total (`quantity: 6`).
   - Limit: `"Once per scene"`.
   - Outcomes (50/50 Chance):
     - **50% Level 5 Fireball**: `2d12 + Int Mod` Fire damage to closest mob. Attack made with Disadvantage. Targets losing 1+ Health Bar gain Burned Debuff.
     - **50% Healing Blob of Custard**: Strikes closest mob with soothing vanilla custard, healing 5 full Health Bars (`5 * hpPerBar`).
