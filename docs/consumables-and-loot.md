# Dungeon Crawler Carl RPG — Consumables, Loot & Scratch-off System

## Overview

The **Loot & Consumable System** in CarlRPG provides complete support for consumable inventory items, potion resources, scene-restricted items, and multi-outcome random tables (such as World Dungeon lottery scratch-off tickets).

Consumable items can be triggered from:
1. **Crawler Character Sheet** (Page 4: Inventory tab -> `.item-use`)
2. **Combat Hotlist** (Slots 1–10 -> `.roll-hotlist-use`)
3. **Crawler Token Action HUD** (Hotbar & Token action overlay -> `[ Use ]`)

---

## Key Features & Mechanics

### 1. $N$ Uses & Charges (`system.quantity`)
- `system.quantity` tracks remaining uses.
- Using an item via `item.useLoot()` decrements `system.quantity` by 1.
- Consuming the final use (quantity drops to 0 or 1 on last use) automatically deletes the item from the character's inventory, keeping the sheet tidy.

### 2. Scene Cooldown Enforcement (`system.cooldown`)
- Configurable per item (e.g., `"Once per scene"`, `"None"`, `"1/Round"`).
- When set to `"Once per scene"`:
  - The system checks `item.getFlag('carl-rpg', 'lastUsedScene')` against `canvas.scene.id`.
  - If the item has already been used in the current scene, further uses are rejected with a warning notification: *"Item can only be used once per scene and was already used in this scene!"*.
  - When the crawler moves to a new scene / dungeon chamber, the cooldown automatically refreshes.

### 3. Multi-Outcome & Scratch-off Random Tables (`system.outcomes`)
- **Conditional Random Table Display**:
  - The Scratch-off Outcomes / Random Table builder is **only displayed when the item's Loot Type is set to `scratch_ticket` (`Scratch-off Ticket / Lottery`)**.
  - Standard consumable, treasure, quest, or crafting items keep their sheets clean and uncluttered without the scratch-off table builder.
  - Dynamically updates upon changing the Loot Type dropdown.
- **Auto-Calculated Outcome Weights**:
  - When outcomes are added via `[ Add Outcome ]`, weights are automatically calculated and distributed evenly to sum to exactly **100%** (e.g. 1 outcome = 100%, 2 outcomes = 50%/50%, 3 outcomes = 34%/33%/33%, 4 outcomes = 25% each).
  - Removing an outcome via `[ Delete ]` automatically re-balances remaining outcomes to sum to 100%.
  - Includes a 1-click `[ Auto-balance to 100% ]` action in the UI to redistribute weights at any time.
- **Manual Overwrite & Summation Warning**:
  - Users are free to overwrite any outcome's weight to create custom probability distributions.
  - If the sum of all outcome weights does not equal 100%, the sheet displays a prominent orange warning banner (`Total outcome weight is X% (summation must equal 100%)`) with a quick auto-balance button, and emits a notification warning upon saving.
- **Strictly Numeric Weights**:
  - Non-numeric input is strictly disallowed. The input field enforces `type="number"` and sanitizes non-numeric characters in real time, during data preparation, and on form submission.
- **Outcome Types & Mechanics**:
  - **Spell / Attack**: Evaluates damage with actor stat modifiers (e.g. `2d12 + Int Mod` Fire), applies DCC Disadvantage rules, and flags Debuffs (such as the Burned Debuff if 1+ Health Bar is lost).
  - **Healing**: Heals a specified number of **Health Bars** (`healBars * hpPerBar`, where 1 Health Bar = CON modifier).
  - **Buff**: Allows selecting from existing canonical buffs (e.g. *Strength Buff*, *Damage Resistance*). **Buff outcomes strictly have NO damage component** — damage and damage types are omitted from the sheet UI, stripped from data, and excluded from chat cards. Generates a 1-click `[ Apply Buff ]` action button.
  - **Debuff**: Allows selecting from existing canonical debuffs (e.g. *Blinded*, *Burned*, *Shocked*). **Debuff outcomes strictly have NO damage component** — damage and damage types are omitted from the sheet UI, stripped from data, and excluded from chat cards. Generates a 1-click `[ Apply Debuff ]` action button.
- **Target Detection**:
  - `targetType: "closest_mob"`: Calculates grid/Euclidean distance from the crawler's token to all alive mob tokens on the canvas scene and targets the closest foe.
  - `targetType: "self"`: Targets the user.
  - `targetType: "target"`: Targets the player's selected canvas token.

### 4. Interactive Chat Cards
- **Scratch-off Reveal Theme**: Rich DCC-themed cards displaying remaining scratches, revealed outcome banner, target details, and mechanics text.
- **1-Click Action Buttons**:
  - `[ Apply Damage ]`: Applies evaluated damage directly to the target token deducting DR via `DCCCombatMetrics`.
  - `[ Apply Healing ]`: Applies evaluated Health Bar healing directly to the recipient, capped at maximum HP.
  - `[ Apply Buff ]`: Applies the buff condition directly to the target crawler (assigning to an open external buff slot or embedded buff document).
  - `[ Apply Debuff ]`: Inflicts the debuff condition as an embedded item directly onto target actor(s).

---

## Canonical Compendium Pack (`carl-rpg.items`)

The system ships with a native items compendium pack pre-loaded with:

1. **Normal Mana Potion** (`dccitm0000000001`):
   - Refills mana completely to maximum (10 MP base).
   - Quantity: 1.
2. **Scratch-off Ticket - Fireball or Custard** (`dccitm0000000002`):
   - 6 Scratches total (`quantity: 6`).
   - Limit: `"Once per scene"`.
   - Outcomes (50/50 Chance):
     - **50% Level 5 Fireball**: `2d12 + Int Mod` Fire damage to the closest mob (moves slowly; attack with Disadvantage). 10ft blast radius. Targets losing 1+ Health Bar gain the Burned Debuff.
     - **50% Healing Blob of Custard**: Strikes the closest mob with a soothing glob of vanilla custard, healing them for 5 full Health Bars (`5 * hpPerBar`).
