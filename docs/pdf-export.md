# Fillable Character Sheet PDF Export

The Dungeon Crawler Carl RPG (CarlRPG) system includes full support for exporting any Crawler actor directly into the official 6-page fillable PDF character sheet (`assets/sheet/fillable_character_sheet.pdf`). This allows players and Game Masters to save digital copies or print ready-to-use character sheets for tabletop sessions.

---

## 📄 Overview & Features

- **Direct Export**: Click the **Save to PDF** button in the character sheet window header or from the Page 1 Core tab.
- **Complete 6-Page Mapping**: Populates all 429 form fields across every page of the official character sheet:
  - **Page 1: Core**: Name, Race, Gender/Pronouns, Level, Crawler Number, Class, Floor, Ability Scores (Enhanced, Unenhanced, Modifiers), calibrated Health Bar (each of the 10 boxes displays the crawler's CON Modifier with checkboxes clean for tabletop play), Evade & Damage Resistance totals, Mana, Debuffs, External Buffs (automatically resolved from internal IDs to clean descriptions, e.g. "+2 Strength Buff", "+10 Temp HP"), and up to 5 Attacks.
  - **Page 2: Hotlist & Gear**: 10 Hotlist slots formatted with item names and damage/costs/buff descriptions (resolving raw IDs), equipped Gear slots (Head, Torso, Arms, Hands, Legs, Feet, Accessories), Popularity, Past Trauma, Loose Ends, Regrets, and Notes.
  - **Page 3: Skills & Known Spells**: Up to 20 rows with Name, Rank, Governing Stat & Modifier, Check Type / Spell MP Cost, Description/Notes (including damage, range, and effects for spells), and Trained checkboxes. Known spells are automatically appended directly to the skills list.
  - **Page 4: Inventory**: Up to 20 inventory items with Item Name, Quantity, and Description.
  - **Page 5: Extras & Space**: Pet stats and attacks, Mount/Vehicle stats, Important Things I've Killed (13 lines), Clubs & Societies (6 lines), Personal Space (Tier, Size, Amenities over 11 lines), and Deity details.
  - **Page 6: Abilities & Sponsors**: Racial Abilities (22 lines), Class Abilities (22 lines), and Sponsor cards (up to 3 sponsors).

---

## 🚀 How to Export

### In Foundry VTT
1. Open any Crawler character sheet.
2. Click **Save to PDF** in the top window title bar or the stylized **Save to PDF** button in the Page 1 header box.
3. Foundry VTT will generate the filled PDF and trigger an immediate download (`<Crawler_Name>_CharacterSheet.pdf`).

### Programmatic API
Developers and macros can also export character sheets directly:
```javascript
import { exportCrawlerToPdf, saveCrawlerPdf } from './systems/carl-rpg/src/apps/pdf-exporter.mjs';

// Get PDF bytes as Uint8Array
const pdfBytes = await exportCrawlerToPdf(actor);

// Or trigger direct browser download
await saveCrawlerPdf(actor);
```

---

## 🛠️ Architecture

- **Zero External Dependencies**: Built with a bundled `pdf-lib.min.js` in `lib/` and registered in `system.json`.
- **Cross-Platform Compatibility**: Executes natively in both browser/Foundry VTT clients and headless Node.js environments.
- **Non-Destructive**: Leaves the base template PDF intact and writes a new PDF document upon each export.
