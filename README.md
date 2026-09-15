# Dungeon Crawler Carl RPG for Foundry VTT

I'm just vibe coding my way to a placeholder until the real deal comes out.  This is in no way officially associated with the DCC brand, nor is it intended to be a replacement for the official game system once it is released.

Questions or concerns contact me @ shinierball via gmail or maybe discord or whatever the cool kids use these days.  

---

## Features

- Hopefully the AI keeps this in sync reasonably with reality, but code changes so fast these days! Odds that this accurately reflects the rules are probably close to zero, but I'm committed to the process of telling the AI to do better!

- **7-Tab Character Sheet**: Recreates the official DCC RPG character sheet with expanded crawler features:
  - **Page 1 (Core)**: Character details, 10-segment gradient Health Bar (10%–100%), 5 Core Stats (STR, INT, CON, DEX, CHA), EVADE ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$), DAMAGE RESISTANCE ($\text{Armor} + \text{Gear} + \text{Buffs}$), Mana, Debuffs, Portrait, External Buffs, ATTACKS table with interactive damage application, and the 10-slot combat **Hotlist**.
  - **Page 2 (Gear & Story)**: Equipped Gear Slots (Head, Torso, Arms, Hands/Holding, Legs, Feet, 10 Accessories, Tattoos, and Patches) with active bonus badges, plus roleplay tracking (Popularity, Past Trauma, Loose Ends, Regrets, Notes).
  - **Page 3 (Skills)**: Full skills table tracking Base Rank, Gear Bonuses, Boon Bonuses, Modified Rank, and Total Skill. Automatic Untrained Disadvantage (`2d20kl`), Trained (`1d20 + Total`), *Call a Play* (`2d6`), and *Intervene* (`1d6`) rolls, backed by the **DCC Skill Library & Manager**.
  - **Spells**: Dedicated spellbook with mana tracking, spell ranks, quotes, range, duration, damage, upgrades, and cast roll cards.
  - **Page 4 (Inventory)**: Gear and Loot management with slot equipping that dynamically calculates ability, DR, Evade, and skill bonuses.
  - **Page 5 (Extras & Space)**: Pet and Mount/Vehicle blocks, Important Things I've Killed, Clubs/Societies, Personal Space, and Deity tracking.
  - **Page 6 (Abilities & Sponsors)**: Racial Abilities, Class Abilities, and 3 Sponsor blocks.
- **Combat Performance & AI Awards**: Real-time tracking of net damage applied (factoring in target DR and Temp HP), kills, and tactical skills linked to Foundry's Combat Tracker, plus the **Dungeon AI Award Console** for dispensing Loot Boxes (Bronze through Celestial) and AI Favor.
- **Pure DCC Mechanics**: Automated modifier calculations, Evade checks, DR totals, and dice rolls.
- **Damage Type Integration & Multi-Typed Attacks**:
  - Full support for 13 canonical CarlRPG damage types across weapons, attacks, spells, skills, buffs, and debuffs.
  - Multi-part weapon damage (e.g. Slashing base + Necrotic + Sonic).
  - Rank-gated skill damage bonuses scaling with skill rank (e.g. +2 Bludgeoning at Rank 0, +16 Fire at Rank 15).
  - Damage multiplier buffs (e.g. `*2 Total Damage`) doubling all rolled damage components.
  - Type-specific target debuffs and resistance reductions (e.g. 50% Fire reduction rounded up) applied before DR and CON damage bars.
  - Interactive chat cards displaying color-coded typed damage breakdowns and one-click damage application to targeted tokens.
- **Drag & Drop**: Drop Races, Classes, Deities, Skills, Spells, and Gear directly onto character sheets.
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
