# Dungeon Crawler Carl RPG for Foundry VTT

I'm just vibe coding my way to a placeholder until the real deal comes out.  This is in no way officially associated with the DCC brand, nor is it intended to be a replacement for the official game system once it is released.

Questions or concerns contact me @ shinierball via gmail or maybe discord or whatever the cool kids use these days.  

---

## Features

- Hopefully the AI keeps this in sync reasonably with reality, but code changes so fast these days! Odds that this accurately reflects the rules are probably close to zero, but I'm committed to the process of telling the AI to do better!

- **7-Tab Character Sheet**: Recreates the official DCC RPG character sheet with expanded crawler features:
  - **Page 1 (Core)**: Character details, 10-segment gradient Health Bar (10%–100%), 5 Core Stats (STR, INT, CON, DEX, CHA), EVADE ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$), DAMAGE RESISTANCE ($\text{Armor} + \text{Gear} + \text{Buffs}$), Mana, AI Favor & Selectable Creature Size category dropdown (1 Tiny to 8 Gargantuan), Active Debuffs strip with severity chips and 1-click removal, Portrait, External Buffs, ATTACKS table with interactive damage application, and the 10-slot combat **Hotlist**.
  - **Page 2 (Gear & Story)**: Equipped Gear Slots (Head, Torso, Arms, Hands/Holding, Legs, Feet, 10 Accessories, Tattoos, and Patches) with active bonus badges, plus roleplay tracking (Popularity, Past Trauma, Loose Ends, Regrets, Notes).
  - **Page 3 (Skills)**: Full skills table tracking Base Rank, Gear Bonuses, Weapon Group / Type Bonuses, Boon Bonuses, Modified Rank, and Total Skill. Explicit skill types (`Edge`, `Bashing`, `Reach`, `Ranged`, `Strike`, `Hand to Hand`, `Utility`) with automatic cascading bonuses from generic mastery skills (e.g. *Edged Weapons*, *Blunt Weapons*, *Reach Weapons*). Automatic Untrained Disadvantage (`2d20kl`), Trained (`1d20 + Total`), *Call a Play* (`2d6`), and *Intervene* (`1d6`) rolls, backed by the **DCC Skill Library & Manager**.
  - **Spells**: Dedicated spellbook with mana tracking, spell ranks, quotes, range, duration, damage, upgrades, and cast roll cards, backed by the **DCC Spell Library & Manager**.
  - **Page 4 (Inventory)**: Gear and Loot management with slot equipping that dynamically calculates ability, DR, Evade, and skill bonuses, plus a dedicated **Character Debuffs & Conditions** management table.
  - **Page 5 (Extras & Space)**: Pet and Mount/Vehicle blocks, Important Things I've Killed, Clubs/Societies, Personal Space, and Deity tracking.
  - **Page 6 (Abilities & Sponsors)**: Racial Abilities, Class Abilities, and 3 Sponsor blocks.
- **Dedicated Interactive Catalog Managers**:
  - **Crawler Character Creator (`DCCCrawlerCreatorApp`)**: Fast matrix character creation terminal accessible right from the Actors directory (`[ ⚔️ New Crawler ]`). Full support for Human and Animal species, standard stat arrays `[2, 3, 4, 5, 6]`, dynamic starting Health & Mana initialization (ensuring current health and mana match max values at 100% on creation based on CON and INT), 4-tier life-stage background matrices (Childhood/Youth, Adolescence/Training, Career/Adult, Hobby/Quirk), non-additive duplicate skill rank resolution (`Math.max`), **Level 1 Starter Combat Loadouts** (choose a Basic Weapon at Rank 3 with physical weapon equipped to Hands and attack item configured, Starter Spell at Rank 3 + 5 Normal Mana Potions with 100% mana refill, or Unarmed Combat H2H + Damage Effect combo at Rank 3), universal baseline **Heal (Rank 1)** for all Crawlers (actively restores up to 2 health bars to self only, capped at maximum HP), 1-click procedural randomizer, and starting floor selection (Floors 1–5).
  - **DCC Spell Library & Manager (`DCCSpellManager`)**: Comprehensive popup search catalog indexing all canonical DCC spells. Filter by spell category and governing stat, view quotes, costs, ranges, and add spells directly to character sheets with a single click.
  - **DCC Condition & Buff Manager (`DCCBuffDebuffManager`)**: Unified browser for buffs and debuffs with live search, severity indicators, and 1-click assignment to External Buff slots or character debuffs.
- **Combat Performance & AI Awards**: Real-time tracking of net damage applied (factoring in target DR and Temp HP), kills, and tactical skills linked to Foundry's Combat Tracker, plus the **Dungeon AI Award Console** for dispensing Loot Boxes (Bronze through Celestial) and AI Favor.
- **Party Progression & Session Hub (`DCCSessionManagerApp`)**:
  - Live party dashboard providing real-time party vitals, health bars, mana, net damage dealt/taken, AI favor, popularity, and untrained checks attempted.
  - Full activity and roll ledger tracking trained skills, untrained checks (with disadvantage), spells, attacks, damage, and DM events.
  - **7-Tier Roll Outcome Engine**: Automated outcome classification (Critical Failure, Major Failure, Failure, Near Miss, Success, Major Success, Critical Success) based on exact CarlRPG margin thresholds, with inline DM DC and outcome overrides.
  - **End-of-Session Progression**: Field training opportunities allowing one-click promotion of attempted untrained skills to Rank 1, session XP pool distribution across the party, Dungeon AI recap card broadcast, and session archiving.
- **Universal Macros Compendium & Initial Macro Bar**:
  - Pre-packaged system compendium (`carl-rpg.macros`) with **Player Observer** permissions, allowing all users (players and GMs alike) to execute the system macros directly.
  - **Initial Macro Bar Auto-Setup**: Automatically populates hotbar slots on first launch without overriding customized bars:
    - **Slot 1**: Character Creator (`DCCCrawlerCreatorApp`)
    - **Slot 2**: Open Combat Metrics (`DCCCombatMetricsApp`)
    - **Slot 3**: Party Progression and Session Hub (`DCCSessionManagerApp`)
- **Pure DCC Mechanics**: Automated modifier calculations, Evade checks, DR totals, and dice rolls.
- **Damage Type Integration & Multi-Typed Attacks**:
  - Full support for 13 canonical CarlRPG damage types across weapons, attacks, spells, skills, buffs, and debuffs.
  - Multi-part weapon damage (e.g. Slashing base + Necrotic + Sonic).
  - Rank-gated skill damage bonuses scaling with skill rank (e.g. +2 Bludgeoning at Rank 0, +16 Fire at Rank 15).
  - Damage multiplier buffs (e.g. `*2 Total Damage`) doubling all rolled damage components.
  - Type-specific target debuffs and resistance reductions (e.g. 50% Fire reduction rounded up) applied before DR and CON damage bars.
  - Interactive chat cards displaying color-coded typed damage breakdowns and one-click damage application to targeted tokens.
- **Multi-Modifier Buffs & Debuffs**:
  - Create buffs with multiple stat bonuses (e.g. +2 STR, +2 DEX) and multiple damage/defense modifiers (damage multipliers, bonus typed damage, resistances, immunities, and Temp HP).
  - Create debuffs with multiple stat penalties (-2 STR, -4 CON) and multi-typed incoming damage reductions.
  - Interactive repeater tables in item sheets for real-time adding, removing, and tuning of modifiers.
  - **Universal External Buff Slots**: Any Buff item (actor-owned, world items in `game.items`, or compendium packs) can be selected in any of the 3 External Buff slots or dragged directly onto a slot.
- **Modular Item Sheet Architecture**: Decomposed item sheet system with dedicated partial templates under `templates/items/parts/` for weapons/attacks, spells, gear, buffs, debuffs, skills, loot, and traits.
- **Drag & Drop**: Drop Races, Classes, Deities, Skills, Spells, Buffs, and Gear directly onto character sheets.
- **Hot Reload Enabled**: Live updating of styles and templates without page reloads for instant developer feedback.

---

## Installation Instructions for Foundry VTT

### Method 1: Symbolic Link (Recommended for Development)
Link this repository directory directly into your Foundry VTT User Data systems folder:

**On macOS / Linux:**
```bash
ln -s "~/Code/CarlRPG" "$HOME/Library/Application Support/FoundryVTT/Data/systems/carl-rpg"
```
*(Or wherever your Foundry User Data folder is located, e.g., `~/FoundryVTT/Data/systems/carl-rpg`)*

**On Windows (PowerShell as Admin):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\carl-rpg" -Target "C:\path\to\CarlRPG"
```

---

### Method 2: Copy Directory
1. Copy the entire `CarlRPG` folder.
2. Navigate to your Foundry VTT User Data folder:
   - **macOS**: `~/Library/Application Support/FoundryVTT/Data/systems/`
   - **Windows**: `%localappdata%/FoundryVTT/Data/systems/`
   - **Linux**: `~/.local/share/FoundryVTT/Data/systems/`
3. Paste the folder into the `systems` directory and name it `carl-rpg`.

---

### Method 3: Manifest URL (If Hosted on GitHub / GitLab)
1. Open Foundry VTT.
2. Go to the **Game Systems** tab in the Foundry configuration menu.
3. Click **Install System**.
4. In the **Manifest URL** box at the bottom, paste the raw link to your `system.json`:
   ```
   https://raw.githubusercontent.com/<username>/<repo>/main/system.json
   ```
5. Click **Install**.

---

## Starting a Game World
1. Launch Foundry VTT and go to the **Game Worlds** tab.
2. Click **Create World**.
3. Set your World Title (e.g., *Dungeon Crawler Carl Campaign*).
4. Under **Game System**, select **Dungeon Crawler Carl RPG**.
5. Launch the world and start crawling!
