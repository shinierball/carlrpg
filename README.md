# Dungeon Crawler Carl RPG for Foundry VTT

A community game system implementation for the **Dungeon Crawler Carl Roleplaying Game** on Foundry Virtual Tabletop.

---

## Features

- **6-Page Character Sheet**: Recreates the official DCC RPG character sheet PDF across 6 tabs:
  - **Page 1 (Core)**: Character details, 10-segment gradient Health Bar (10%–100%), 5 Core Stats (STR, INT, CON, DEX, CHA), EVADE ($d20 + \text{DEX Mod} + \text{Buffs}$), DAMAGE RESISTANCE ($\text{Armor} + \text{Buffs}$), Mana, Debuffs, Portrait, External Buffs, and ATTACKS table.
  - **Page 2 (Hotlist & Gear)**: 10-slot Hotlist, dedicated Gear Slots (Head, Torso, Arms, Hands, Legs, Feet, 10 Accessories), and roleplay tracking (Popularity, Past Trauma, Loose Ends, Regrets, Notes).
  - **Page 3 (Skills)**: Full skills table with rank, associated stat, check types, and clickable d20 roll buttons.
  - **Page 4 (Inventory)**: Inventory management for Gear and Loot items.
  - **Page 5 (Extras & Space)**: Pet and Mount/Vehicle blocks, Important Things I've Killed, Clubs/Societies, Personal Space, and Deity tracking.
  - **Page 6 (Abilities & Sponsors)**: Racial Abilities, Class Abilities, and 3 Sponsor blocks.
- **Pure DCC Mechanics**: Automated modifier calculations, Evade checks, DR totals, and dice rolls.
- **Drag & Drop**: Drop Races, Classes, Deities, Skills, and Gear directly onto character sheets.
- **Hot Reload Enabled**: Live updating of styles and templates without page reloads for instant developer feedback.

---

## Installation Instructions for Foundry VTT

### Method 1: Symbolic Link (Recommended for Development)
Link this repository directory directly into your Foundry VTT User Data systems folder:

**On macOS / Linux:**
```bash
ln -s "/Users/jeremy/Code/CarlRPG" "$HOME/Library/Application Support/FoundryVTT/Data/systems/carl-rpg"
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
