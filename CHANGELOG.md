## 1.0.27

### Fillable Character Sheet PDF Export

- **Official 6-Page PDF Character Sheet Integration**:
  - Added direct export of Crawler character sheets to the official 6-page fillable character sheet PDF (`assets/sheet/fillable_character_sheet.pdf`).
  - Seamlessly maps all 429 AcroForm fields across all six pages:
    - **Page 1: Core**: Name, Race, Gender, Level, Crawler Number, Class, Floor, Ability Scores (Enhanced, Unenhanced, Modifiers), calibrated Health Bar (10 boxes displaying crawler CON modifier, blank checkboxes ready for play), Evade & Damage Resistance totals, Mana, Debuffs, External Buffs (automatically resolved into clean human-readable descriptions instead of internal hashes), and up to 5 Attacks.
    - **Page 2: Hotlist & Gear**: 10 Hotlist slots with damage/mana cost labels, equipped Gear slots (Head, Torso, Arms, Hands, Legs, Feet, Accessories), Popularity, Past Trauma, Loose Ends, Regrets, and Notes.
    - **Page 3: Skills & Known Spells**: Up to 20 rows with Name, Rank, Governing Stat & Modifier, Check Type / Spell MP Cost, Description/Notes (including damage, range, and effects for spells), and Trained checkboxes. Known spells are automatically appended directly to the skills list.
    - **Page 4: Inventory**: Up to 20 inventory items with Item Name, Quantity, and Description.
    - **Page 5: Extras & Space**: Pet attributes, levels, and attacks, Mount/Vehicle stats, Important Things I've Killed (13 lines), Clubs & Societies (6 lines), Personal Space (Tier, Size, Amenities over 11 lines), and Deity details.
    - **Page 6: Abilities & Sponsors**: Racial Abilities (22 lines), Class Abilities (22 lines), and Sponsor cards (up to 3 sponsors).
- **Sheet Integration & One-Click Download**:
  - Added a "Save to PDF" header button (`save-pdf-btn`) in `DCCCrawlerSheet._getHeaderButtons()` for quick window-level access.
  - Added a stylized "Save to PDF" action button in the Page 1 Core header box (`.dcc-btn-save-pdf`).
  - Triggers automatic download of `<Crawler_Name>_CharacterSheet.pdf` in browser/Foundry client.
- **Embedded Zero-Dependency PDF Engine**:
  - Bundled minified `pdf-lib.min.js` in `lib/` and registered in `system.json` under `"scripts"`, with an ES module wrapper `lib/pdf-lib.mjs` for seamless headless Node.js testing and client-side execution.
- **Automated Test Suite**:
  - Added comprehensive unit tests in `tests/pdf-export.test.mjs` verifying document structure, complete field mapping across all 6 pages, and sheet controller integration.

## 1.0.25

### System Macros Compendium & Initial Hotbar Quick-Access

- **Universal Macros Compendium (`carl-rpg.macros`)**:
  - Registered official `macros` compendium pack in `system.json` under `packs/macros` configured with `PLAYER: "OBSERVER"` permissions, ensuring macros are accessible and executable by all players and non-administrators.
  - Added prebuilt LevelDB compendium database with three canonical system macros:
    1. **Character Creator**: Launches the Fast Matrix character creation terminal (`window.carl.openCrawlerCreator()`).
    2. **Open Combat Metrics**: Opens the real-time combat performance tracker and AI Award console (`window.carl.openCombatMetrics()`).
    3. **Party Progression and Session Hub**: Opens the party dashboard, activity ledger, and end-of-session management hub (`window.carl.openSessionManager()`).
- **Player-Executable Ownership**:
  - Defined explicit default ownership (`ownership: { default: 2 }`, OBSERVER) on all system macro records in `src/data/macros.mjs`, granting non-admin players permission to view and execute the macros from the compendium, directory, or macro bar.
- **Initial Macro Bar Auto-Configuration (`setupInitialHotbar`)**:
  - Automatically maps the three system macros into Hotbar slots **1**, **2**, and **3** upon user login:
    - **Slot 1**: Character Creator
    - **Slot 2**: Open Combat Metrics
    - **Slot 3**: Party Progression and Session Hub
  - Intelligently respects existing user keybindings without overwriting custom macro assignments, while providing a force option (`window.carl.setupInitialHotbar(game.user, { force: true })`) to restore system defaults.
  - Automatically ensures all three macros exist in the world `game.macros` collection with proper player observer permissions on world startup.
- **Automated Test Suite**:
  - Added comprehensive test suite in `tests/macros.test.mjs` verifying manifest compendium configuration, ownership permissions, LevelDB pack integrity, execution callbacks, non-admin access, and initial hotbar slot assignment.

## 1.0.24

### Character Creation Health & Mana Initialization

- **Dynamic Starting Health**:
  - Automatically calculates maximum health on character creation based on the assigned Constitution score:
    $$\text{Max HP} = 10 \times \text{getDCCStatModifier}(\text{CON})$$
  - Current health (`system.attributes.hp.value`) and maximum health (`system.attributes.hp.max`) are now initialized to the exact same value upon crawler creation, with `system.attributes.hp.pct` set to 100%.
  - Eliminates the previous static hardcoded default of 40 HP from `template.json`.
- **Dynamic Starting Mana**:
  - Automatically calculates maximum mana on character creation based on the assigned Intelligence score:
    $$\text{Max Mana} = \text{INT}$$
  - Current mana (`system.attributes.mana.value`) and maximum mana (`system.attributes.mana.max`) are now initialized to the exact same value upon crawler creation, with `system.attributes.mana.pct` set to 100%.
  - Eliminates the previous static hardcoded default of 10 Mana from `template.json`.
- **Induction Terminal Live Preview**:
  - Exposed live `startingHp` and `startingMana` metrics in `DCCCrawlerCreatorApp.getData()`.
  - Added visual `[HP: X / X]` and `[Mana: Y / Y]` summary pills in the Induction Terminal loadout box so players see their exact starting vitals as they allocate stats.
- **Actor Creation Lifecycle Fallback**:
  - Enhanced `DCCActor._preCreate` to automatically evaluate and set `hp.value = hp.max = 10 * conMod` and `mana.value = mana.max = intVal` for newly created crawlers and pets if attributes are omitted or match template defaults.
- **Automated Test Suite**:
  - Added unit tests in `tests/crawler-creator.test.mjs` and `tests/starter-loadouts.test.mjs` verifying that diverse stat arrays (e.g., standard array, high INT/low CON, CON 4/INT 5) produce equal current and max health/mana values at creation time.

## 1.0.23

### Starter Weapon Inventory Equipping & Attack Item Generation

- **Starter Weapon Inventory Equipping**:
  - When choosing a starter weapon on character creation (`starterMode === 'weapon'`), the selected weapon is now automatically added to the crawler's inventory as a `gear` item.
  - Automatically equipped to the `hands` slot (`system.slot = 'hands'`, `system.equipped = true`).
  - Appears in Inventory under Gear with the red `EQUIPPED` badge, and is displayed under Hands/Holding in the equipped gear overview on Page 2.
- **Configured Attack Item**:
  - Automatically creates a matching `attack` item configured with the weapon's canonical parameters: to-hit stat (`str` or `dex`), to-hit rank (Rank 3), damage dice, damage stat, damage type, and combat notes.
  - Displayed on Page 1 (Core) in the ATTACKS table with one-click to-hit and damage rolling buttons.
  - Automatically mapped into Hotlist Slot 2 for quick combat access (with Heal on Slot 1).
- **Weapon Definitions Library (`DCC_STARTER_WEAPON_DEFINITIONS`)**:
  - Defined full combat profiles for all 18 starter weapons in `src/data/crawler-creation.mjs` including `toHitStat`, `damageDice`, `damageStat`, `damageType`, and weapon properties.
- **Automated Test Suite**:
  - Updated test 2 and added test 12 in `tests/starter-loadouts.test.mjs` validating inventory gear creation, equipped status, attack item schema, and to-hit/damage roll execution.

## 1.0.22

### Heal Spell Active Mechanics & Self-Targeting

- **Active Self Healing**:
  - Casting the `Heal` spell (`actor.rollSpell(healItem)`) dynamically evaluates the caster's Constitution modifier to determine health per bar (`CON Mod` HP per bar, 10 bars total).
  - Actively heals **up to 2 bars of health** (`2 × CON Mod` HP).
  - Target is strictly **self only** (the caster), ignoring any external canvas/token selections.
  - Automatically caps at the actor's maximum health (`system.attributes.hp.max`), preventing overhealing.
  - Updates actor `system.attributes.hp.value` and `system.attributes.hp.pct` in a clean atomic state change.
  - Displays rich healing feedback in the chat card (HP healed, Health Bar slots, HP/bar, current/max HP, and self target badge).
  - Logs heal action and recovered HP to the session manager activity ledger.
- **Automated Test Suite**:
  - Added unit tests 8 through 11 in `tests/starter-loadouts.test.mjs` verifying healing calculations, 2-bar recovery, max HP capping, full health casting, and mana requirement checks.

## 1.0.21

### Level 1 Starter Combat Loadouts & Universal Baseline Heal Spell

- **Level 1 Starter Combat Loadout Options**:
  - **Basic Weapon Option**: Choose any existing weapon skill (Axe, Bow, Club, Crossbow, Dagger, Handgun, Herding Weapons, Improvised Weapons, Javelin, Lance, Longsword, Polearm, Quarterstaff, Rapier, Shotgun, Shuriken, Slingshot, Warhammer) and receive that weapon skill at **Rank 3**.
  - **Starter Spell Option**: Choose one of the 7 initial starter spells at **Rank 3**:
    - *Dirt Clod*, *Fire Fingers*, *Frost Scar*, *Mind Tickle*, *Shock Treatment*, *Soul Collector*, *Vine Porn*.
    - Grants **5 Normal Mana Potions** in inventory and hotlist.
  - **Unarmed Combat Option**: Choose a Hand-to-Hand skill and Damage Effect package, receiving both at **Rank 3**:
    - *Pugilism* with the *Iron Punch* Damage Effect (+1d2 base dmg)
    - *Foot Soldier* with the *Smush* Damage Effect (×2 dmg on ≤20% HP)
    - *Noggin Nocker* with the *Skullcracker* Damage Effect (+1d4 base dmg vs same size)
    - *Wrasslin* with the *Toss* Damage Effect (+1d8 base dmg + throw)
- **Universal Baseline Spell (`Heal` Rank 1)**:
  - Every created crawler enters the dungeon with the **Heal** spell at **Rank 1** automatically inscribed and slotted into their hotlist.
- **Normal Mana Potion Consumable Mechanics**:
  - `Normal Mana Potion` items completely refill current mana to maximum (`system.attributes.mana.value = system.attributes.mana.max`) when used from the hotlist (`.roll-hotlist-use`) or inventory (`.item-use`).
  - Automatically decrements quantity and removes the item upon consuming the final potion.
  - Generates rich chat card with mana restoration feedback.
- **Crawler Induction Terminal (`DCCCrawlerCreatorApp`) UI**:
  - Dedicated interactive starter combat loadout deck with mode toggle cards, live dropdown selectors, dynamic perk badges, and summary tray integration.
  - Full support in the 1-click procedural randomizer.
- **Automated Test Suite**:
  - Added `tests/starter-loadouts.test.mjs` validating all starter options, hotlist mappings, mana refill mechanics, and non-additive skill rank resolutions.

## 1.0.20

### Creature Size Categories & Sheet Integration

- **Standardized Creature Size System**:
  - Implemented the 8 official DCC creature size categories:
    - **1 Tiny**
    - **2 Small**
    - **3 Petite**
    - **4 Medium**
    - **5 Large**
    - **6 Huge**
    - **7 Colossal**
    - **8 Gargantuan**
- **Crawler Sheet Integration**:
  - Replaced the plain text input on Page 1 (Core) with a styled select dropdown displaying all 8 sizes (`1 Tiny` to `8 Gargantuan`).
  - Precomputes `sizeOptions` in `DCCCrawlerSheet.getData()` with automatic `selected` resolution matching current actor size.
  - Automatically derives `system.attributes.sizeInfo`, `system.attributes.sizeNumber`, and `system.attributes.sizeLabel` in `DCCActor.prepareDerivedData()`.
- **Crawler Character Creator Integration**:
  - Added creature size selection dropdown to the Crawler Induction Terminal (`DCCCrawlerCreatorApp`).
  - Integrates with randomizer and resets, persisting creature size to newly spawned Crawler actors.
- **Robust Normalization Engine (`getSizeInfo`)**:
  - Robustly maps numbers (1–8), numeric strings, names (e.g. "Petite", "petite"), and full labels ("3 Petite") safely defaulting to `4 Medium`.
- **Automated Unit Test Suite**:
  - Added comprehensive unit tests in `tests/sizes.test.mjs` verifying size definitions, normalization, sheet option generation, and document derived stats.

## 1.0.19

### Fast Matrix Crawler Character Creator

- **Crawler Induction Terminal (`DCCCrawlerCreatorApp`)**:
  - Dedicated fast matrix character creation application accessible from the Actors Directory header actions (`[ ⚔️ New Crawler ]`) and global `window.carl.openCrawlerCreator()`.
  - **Species Selection & Perks**:
    - **Human**: Starts with Inherent `Unarmed Combat` (Rank 3) and `1 AI Favor`.
    - **Animal**: Surrenders AI Favor (`0 AI Favor`) to become an animal crawler, gaining Inherent `Slice Attack` (Rank 3).
  - **Standard Stat Array Engine**:
    - Assigns `[2, 3, 4, 5, 6]` across the 5 core abilities (`STR`, `DEX`, `CON`, `INT`, `CHA`).
    - Dynamic pool tracker showing Available, Used, and Duplicate indicators with real-time validation.
  - **Four-Tier Life Stage Background Matrices**:
    - Full official background matrices for Humans (Childhood, Adolescence, Career/Profession, Hobby) and Animals (Youth, Training, Adult, Quirk).
    - 1 background select and exactly 2 of 3 skill choices per stage.
    - Tier-specific rank assignments: Tier 1 (Rank 1), Tier 2 (Rank 1), Tier 3 (Rank 3), Tier 4 (Rank 2).
  - **Non-Additive Skill Duplicate Detection**:
    - Duplicate skill picks across backgrounds resolve to the highest selected rank (`Math.max(...ranks)`), preserving the official non-additive rules.
    - Real-time warning alert banner detailing each duplicated skill, source stages, and resolved rank.
  - **Procedural 1-Click Randomizer**:
    - `[ 🎲 Randomize All ]` button generates complete, legal character builds with randomized valid standard array distribution, background paths, distinct skills, and DCC-themed names.
  - **Starting Floors 1 through 5**:
    - Configurable floor entrance setting `system.details.floor` and `system.details.level`.
  - **Direct Foundry Actor Creation**:
    - `[ ⚔️ Enter the Dungeon ]` validates all choices, creates a linked `crawler` Actor document, embeds all resolved skill items, and renders the newly minted character sheet.

## 1.0.18

### Party Progression, Session Management Hub & 7-Tier Roll Outcome Engine

- **Party Progression & Session Hub (`DCCSessionManagerApp`)**:
  - Dedicated multi-tab application (`DCCSessionManagerApp`) accessible from the Actor Directory, Combat Tracker, and global `window.carl.openSessionManager()`.
  - **Party Live Overview**: Real-time cards for all active crawlers displaying portraits, Level, HP bars, Mana, Net Damage Dealt/Taken, AI Favor, Popularity, and counts for Untrained attempts and Crits.
  - Quick inline +/- adjustments on crawler cards for immediate DM balancing corrections.
- **7-Tier Roll Outcome Engine**:
  - Automated classification of all rolls against Target DC / AC:
    - **Critical Failure**: Natural 1 on d20.
    - **Major Failure**: Miss by 10 or more ($\text{Total} \le \text{DC} - 10$).
    - **Failure**: Miss by 4 to 9 ($\text{DC} - 9 \le \text{Total} \le \text{DC} - 4$).
    - **Near Miss**: Miss by 1 to 3 ($\text{DC} - 3 \le \text{Total} \le \text{DC} - 1$).
    - **Success**: Meet or exceed by less than 10 ($\text{DC} \le \text{Total} \le \text{DC} + 9$).
    - **Major Success**: Exceed by 10 or more ($\text{Total} \ge \text{DC} + 10$).
    - **Critical Success**: Natural 20 on d20.
  - High-contrast color-coded badges (`.outcome-crit-fail`, `.outcome-major-fail`, `.outcome-fail`, `.outcome-near-miss`, `.outcome-success`, `.outcome-major-success`, `.outcome-crit-success`, `.outcome-pending`).
- **Activity & Roll Ledger**:
  - Automatic interception and logging of trained skills, untrained checks (rolled with disadvantage `2d20kl`), attacks, spells, combat damage, AI Favor deltas, Popularity deltas, and Loot Boxes.
  - Interactive filters by Crawler, Action Type, Outcome Tier, and text search.
  - Inline editing of Target DC with instant outcome re-evaluation, outcome dropdown override, notes editing, and manual event creation.
- **End-of-Session Progression**:
  - **Field Training Checklist**: Inspects all untrained skills attempted during the session and provides a 1-click `[Train to Rank 1]` promotion directly updating the crawler's actor document.
  - **Session XP Distribution**: Computes proportional experience distribution based on deeds, damage, and kills, with custom bonus/milestone XP support.
  - **Dungeon AI Review Card**: Posts an authentic recap chat message celebrating Session MVP, Target of the Night, and audience statistics.
  - **Session Archiving**: Seals the session record and increments to the next session while maintaining full historical archive access.

## 1.0.17

### Skill Compendium Overhaul & Generic Weapon Group Mastery

- **Official Skills Compendium Overhaul**:
  - Completely updated `DCC_SKILLS` compendium dataset with the full canonical ruleset from `skills.txt` (121 skills across Strike, Bashing, Edge, Hand to Hand, Hand-to-Hand Damage Effects, Ranged, Reach, and Utility skills).
  - Prebuilt LevelDB compendium pack in `packs/skills`.
- **Skill Types & Weapon Groups**:
  - Every skill item now includes an explicit `skillType` / `type` (`Edge`, `Bashing`, `Reach`, `Ranged`, `Strike`, `Hand to Hand`, `Utility`).
  - Added generic weapon mastery skills: **Edged Weapons**, **Blunt Weapons**, **Reach Weapons**, **Ranged Weapons**, and **Strike Weapons**.
- **Automated Cascading Weapon Group Bonuses**:
  - Trained generic group skills automatically grant their rank bonus to all member weapon skills of that type (e.g. *Edged Weapons* Rank 2 gives +2 to *Axe*, *Dagger*, *Longsword*, and *Rapier*).
  - Equipped gear modifiers referencing weapon types or generic group skills (e.g. `+2 Edged Weapons` or `+2 Edge`) automatically apply to all member skills of that type.
  - Stacking calculation: $\text{Modified Rank} = \max(0, \text{Base} + \text{Item} + \text{Boon} + \text{Type Bonus})$.
  - Group bonuses prevent recursive self-buffing on the generic mastery skill itself.
- **UI & Character Sheet Enhancements**:
  - Skills table on Page 3 displays color-coded skill type badges (`[EDGE]`, `[BASHING]`, `[REACH]`, `[RANGED]`, `[STRIKE]`, `[HAND TO HAND]`, `[UTILITY]`).
  - Expanded Item / Group / Boon column displaying active `typeBonus` badges with source tooltips.
  - Skill item sheet partial (`templates/items/parts/skill.hbs`) supports selecting and editing `Skill Type` and viewing `Type Bonus`.
  - Skill Manager (`DCCSkillManager`) displays type badges and searches across skill types.

## 1.0.16

### Item Sheet Decomposition, Debuff Management & Dedicated Spell/Condition Browsers

- **Modular Item Sheet Partials**: Decomposed the monolithic item sheet into modular, purpose-built partial templates (`header.hbs`, `attack.hbs`, `spell.hbs`, `gear.hbs`, `buff.hbs`, `debuff.hbs`, `skill.hbs`, `loot.hbs`, `traits.hbs`) under `templates/items/parts/`, registered dynamically in `loadTemplates`.
- **First-Class Debuff Visibility & Management**:
  - Expanded `DCC_DEBUFFS` canonical dataset with 16 complete Item schemas including severity tags, duration, stat penalties, and damage modifiers.
  - Interactive condition badge strip on character sheet Page 1 (Core) displaying active debuffs with severity styling (`is-major`/`is-minor`), penalty badges, and one-click removal.
  - Dedicated "Character Debuffs & Conditions" table on Page 4 (Inventory) showing severity badges, effect summaries, remaining duration, inline edit/delete actions, and quick-add shortcuts.
- **Dedicated Spell Manager (`DCCSpellManager`)**:
  - Interactive popup catalog (`src/apps/spell-manager.mjs`) for browsing, searching, and filtering all canonical and world spells by type and governing stat.
  - Displays mana cost, spell type, cast range, duration, damage, and iconic crawler quotes.
  - 1-click spell learning/assignment to crawler spellbook with known-spell state detection.
- **Dedicated Buff & Debuff Manager (`DCCBuffDebuffManager`)**:
  - Tabbed browser for searching and inspecting canonical buffs and debuffs.
  - Real-time search query filtering and category/severity filtering.
  - 1-click condition application directly onto character sheets (assigning to external buff slots or adding embedded debuffs).
  - Accessible via "Browse" buttons in the character sheet Core debuffs box, External Buffs header, and Inventory tables.

## 1.0.15

### Multi-Modifier Buffs & Debuffs

- **Multi-Modifier Buffs & Debuffs**: Buff and debuff items now support configuring arbitrary multiple stat modifiers (e.g. +2 STR, +2 DEX on buffs; -2 STR, -4 CON on debuffs) with full automated recalculation across ability scores, ability modifiers, and derived stats (HP max, Mana max, etc.).
- **Multiple Damage & Defense Modifiers**: Buffs support multiple concurrent damage effects (damage multipliers, bonus damage parts with damage type and dice/flat values, damage resistances, immunities, and Temp HP bonuses).
- **Multiple Damage Reductions on Debuffs**: Debuffs support configuring multiple damage reduction entries (reduction %, damage type, rounding direction, resistance, or immunity) applying cleanly against incoming multi-typed attacks.
- **Universal Buff Selection in External Buff Slots**: Any item of type Buff (actor-owned, world items from `game.items`, or compendium packs) is selectable across all 3 External Buff slots on character sheets with grouped, descriptive option labels.
- **Direct Drag & Drop Assignment**: Dragging and dropping any buff item directly onto an External Buff slot automatically equips it into that slot and imports it to the character if needed.
- **Dynamic Item Sheet Repeater Tables**: Item sheet for buffs and debuffs features interactive tables for adding, editing, and deleting stat modifiers and damage modifiers with automatic form synchronization.
- **Quick Buff Creation**: Direct "+ New Buff" shortcuts in the sheet's External Buffs header and Inventory tab.
- **Backward Compatible**: Maintains full backward compatibility with legacy single-stat, single-damage, and compendium buffs.

## 1.0.14

### Damage Type Integration & Mechanics

- **Multi-Typed Weapons & Attacks**: Weapons and attack items support composite `damageParts` across all 13 canonical CarlRPG damage types with distinct dice and flat values.
- **Rank-Gated Skill Damage Bonuses**: Skills support scaling typed damage bonuses (e.g. +2 Bludgeoning at Rank 0, +2 Fire at Rank 5, +4 Fire at Rank 10, and +10 Fire at Rank 15).
- **Buff Damage Multipliers**: External buffs and buff items support global and type-specific damage multipliers (e.g. `*2 Total Damage`).
- **Target Debuffs & Resistance Reductions**: Debuffs and resistances selectively reduce incoming damage packets by percentages with configurable rounding (e.g. 50% Fire reduction rounded up) prior to general DR and CON damage bars.
- **Interactive Typed Damage Cards**: Chat cards display categorized damage pills, source attribution, multiplier tags, and pass typed data directly into target application.

