# Dungeon Crawler Carl RPG — Attacks & Weapon Equipment Integration

## Overview

The **Attacks & Weapon Equipment Integration** (Option 3 Hybrid System) synchronizes physical weapon gear with the character sheet's active **Attacks** table and provides seamless equipping, stowing, and un-stowing of offensive capabilities.

---

## Architecture & Mechanics

### 1. Hybrid Weapon & Attack Recognition

Characters can wage combat using either dedicated `attack` items or physical `gear` weapons:

- **Weapon Gear Items (`type: "gear"`)**:
  - Automatically classified as a weapon if:
    - Equipped in the `hands` or `holding` gear slots.
    - Explicitly flagged with `system.isWeapon: true`.
    - Defines damage formulas or damage parts (`system.damageParts`).
  - When equipped (`system.equipped: true` or equipped slot), the weapon is immediately recognized as an attack and added to the Page 1 **Attacks** section.
  - When unequipped, the weapon is removed from the active Attacks table and moved to the **Stowed Attacks & Weapons** drawer.

- **Dedicated Attack Items (`type: "attack"`)**:
  - Represent natural attacks, racial strikes, special combat actions, or configured attack profiles.
  - Support an `equipped` state (`system.equipped: boolean`, default `true`).
  - When equipped (`system.equipped !== false`), they appear in the active Attacks table.
  - When unequipped (`system.equipped: false`), they are stowed into the **Stowed Attacks & Weapons** drawer.

---

## Sheet & UI Features

### 1. Active Attacks Table (Page 1 Core & Combat)
- **Equipped Status Badges & Toggle Button**:
  - Each attack row features a 1-click equip toggle button (`.attack-toggle-equipped`).
  - Weapon gear items display an icon toggle with a `[WEAPON]` badge indicating their physical gear status.
  - Clicking the toggle on an active attack un-equips it and moves it into the Stowed drawer.

### 2. Stowed Attacks & Weapons Drawer
- **Expandable Stowed Drawer**:
  - The Attacks table header displays a dynamic counter: `Stowed (N)` button (`.toggle-stowed-attacks-view`).
  - Clicking `Stowed (N)` expands or collapses the stowed drawer.
  - **Attack Section Navigation**: Toggling stowed attacks view (showing or hiding) automatically scrolls and navigates the sheet container (`.sheet-body`) back into view at the Attacks section (`.dcc-attacks-section` / `[data-section="attacks"]`), preventing the attacks section from becoming lost below the fold upon re-render.
  - The drawer lists all currently unequipped attacks and stowed weapon gear with their damage formulas, range, and type badges.
  - Each stowed item has a 1-click `[ Ready / Equip ]` button that immediately equips it and returns it to the active Attacks table.

---

## Optional Damage Effects Subsystem

### 1. Interactive Choice Before Rolling
Whenever an attack or skill supports optional damage effects, the system prompts the crawler with an interactive dialog (`promptDamageEffectDialog`) before rolling:
- **No Damage Effect**: Standard attack without consuming an effect. Grants **+AI Favor** on a hit for canonical hand-to-hand styles.
- **Valid Damage Effects**: Displays effect names, descriptions, and current rank badges (if owned by the crawler).
- **Aborting**: Clicking Cancel cleanly aborts the roll without rolling dice or sending a chat message.

### 2. Canonical Hand-to-Hand Skills
- **Pugilism**: Dirty Fighting, Iron Punch, Powerful Strike (+2 AI Favor on hit if "No Damage Effect" selected).
- **Noggin Knocker**: Skullcracker, Powerful Strike (+1 AI Favor on hit if "No Damage Effect" selected).
- **Wrasslin**: Choke Out, Dirty Fighting, Toss (+1 AI Favor on hit if "No Damage Effect" selected).
- **Foot Soldier**: Powerful Strike, Smush (+1 AI Favor on hit if "No Damage Effect" selected).

### 3. Custom Optional Effects on Any Attack Item
Any attack item can define comma-separated or array optional damage effects (`system.optionalEffects`).
The attack item sheet provides 4 quick-preset buttons (`[+ Pugilism]`, `[+ Noggin Knocker]`, `[+ Wrasslin]`, `[+ Foot Soldier]`) and an input field.

### 4. Page 1 Attacks Table Quick Selector
The Effects column in the active attacks table displays a dropdown selector (`.attack-damage-effect-select`) for any attack with optional effects, allowing crawlers to pre-select their active stance directly on the character sheet.

### 5. Chat Card Continuity
When rolling to hit, the chosen effect (or No Effect bonus) is recorded on the chat card and passed into the "Roll Attack Damage" button via `data-damage-effect`. Rolling damage from the card automatically applies the chosen effect without re-prompting.

---

## Token HUD & PDF Export Integration

- **Crawler Left Action HUD (`DCCCrawlerActionHUD`)**:
  - Displays all equipped attacks and equipped weapon gear in the token combat quick bar.
  - Automatically filters out stowed/unequipped attacks and stowed weapons to keep combat choices clean.

- **Fillable PDF Export (`assets/sheet/fillable_character_sheet.pdf`)**:
  - Populates the official sheet's 5 Attack rows with active, equipped attacks and weapons.
  - Respects the equipped state so stowed weapons and unequipped attacks do not occupy primary attack slots on exported character sheets.

---

## Automated Verification

The subsystem is fully tested in `tests/attack-equipment-integration.test.mjs`, verifying:
1. `AttackDataModel` defaults to `equipped: true`; `GearDataModel` defines `equipped: false` and `isWeapon: false`.
2. `isWeaponGear` accurately classifies weapon gear based on slot, `isWeapon`, and `damageParts`.
3. Equipping weapon gear adds it to `context.attacks`; unequipping moves it to `context.stowedAttacks`.
4. Dedicated attack items toggle smoothly between active attacks and stowed attacks.
5. Interactive sheet click listeners `.attack-toggle-equipped` and `.toggle-stowed-attacks-view` function without form conflicts.
6. Rolling to-hit and rolling damage on weapon gear functions seamlessly with DCC modifier tables and chat damage cards.
7. Token Action HUD reflects equipped attacks and weapon gear while excluding stowed items.
