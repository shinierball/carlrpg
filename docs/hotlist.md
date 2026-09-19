# Dungeon Crawler Carl RPG — Combat Hotlist System

## Overview

The **Hotlist** is a persistent 10-slot quick-access bar located at the base of Page 1 (Core) on the Crawler and Mob character sheets. It provides fast 1-click execution for a crawler's most crucial combat abilities, spells, weapons, consumables, and gear toggles during dungeon encounters.

---

## Features & Mechanics

### 1. Dual Assignment: Drag & Drop and Dropdowns
- **Drag & Drop**: Players and GMs can drag any item, spell, attack, or skill directly from the character sheet (attacks table, inventory, spellbook, skills table) or from compendium packs onto any of the 10 Hotlist slot boxes (`.dcc-hotlist-box`).
- **Dropdown Selector (`.hotlist-select`)**: Each slot provides a categorized `<select>` dropdown grouped into:
  - ⚡ **Spells**: Owned spells with MP costs.
  - ⚔️ **Attacks**: Configured physical and ranged attacks with to-hit stats.
  - 🎯 **Skills**: Trained combat weapon skills (Edge, Bashing, Reach, Strike, H2H) and utility skills.
  - 🛡️ **Gear**: Equippable armor, weapons, and accessories.
  - 🎒 **Inventory / Items**: Consumables, potions, and other loot.

### 2. Smart Compendium Drops & Duplicate Prevention
- When dragging an item or spell from a compendium pack or external library onto a character sheet or Hotlist slot, the drop handler inspects the actor's owned items:
  - If the actor already possesses an item with the same name and type, the existing owned item is linked to the slot.
  - If the item is not yet owned, it is automatically created on the actor and immediately assigned to the slot.
  - This prevents duplicate items from cluttering the actor's inventory.

### 3. Immediate Event Isolation
- Dropdown changes invoke `ev.stopPropagation()`. This prevents the `<select>` change event from bubbling up to Foundry's form harvester, eliminating race conditions with automatic sheet form submission (`submitOnChange`).
- Hotlist and external buff dropdowns are explicitly excluded from the generic blur submission listener.

### 4. Slot Badges & 1-Click Action Buttons

Each populated Hotlist slot dynamically detects its item type and displays a stylized card:

| Item Type | Badge | Details | Action Buttons |
| :--- | :--- | :--- | :--- |
| **Attack** | `ATTACK` | Damage formula (e.g. `1d8 + STR`) | `[ 🎲 Attack ]` (To Hit) & `[ 💥 Dmg ]` (Damage) |
| **Combat Skill** | `ATTACK` | Rank & damage formula | `[ 🎲 Attack ]` (To Hit) & `[ 💥 Dmg ]` (Damage) |
| **Utility Skill** | `SKILL` | Current modified rank | `[ 🧪 Use ]` (Rolls skill check) |
| **Spell** | `SPELL` | MP cost & spell type | `[ 🪄 Cast ]` (Cast spell) & `[ 💥 Dmg ]` (if spell deals damage) |
| **Gear** | Slot Name (e.g. `HEAD`, `TORSO`) | `Equipped` / `Unequipped` | `[ 🛡️ Equip / Unequip ]` (Toggles slot) |
| **Loot / Consumables** | `ITEM` | Quantity & effect summary | `[ 🧪 Use ]` (Consumes item / posts to chat) |

---

## Clearing & Customization
- Clicking the `[ ✕ ]` clear icon in the slot header unbinds the item and resets the slot to empty.
- Selecting `-- + Assign Spell / Item --` resets the slot.
