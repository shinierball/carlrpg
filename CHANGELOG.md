## 2.4.15

### Dynamic Damage Effects & Techniques Engine

- **Data-Driven Combat Maneuvers & Damage Effects (`src/documents/actor.mjs`)**:
  - Eliminated hardcoded string and regex checks across `getSkillDamageData`, `getAttackDamageParts`, `_applyTechniqueBonuses`, and `getCombatTechniques`.
  - Implemented `resolveDamageEffect(chosenEffectRaw, baseItem, options)` to look up technique items dynamically on the actor, fall back to canonical defaults, and merge active milestone rank breaks.
  - Implemented `DEFAULT_TECHNIQUE_CONFIGS` defining structured parameters for canonical maneuvers (*Iron Punch*, *Powerful Strike*, *Skullcracker*, *Smush*, *Toss*, *Choke Out*, *Dirty Fighting*).
  - Implemented `evaluateModifier(baseOrMod, modOrContext, rank)` supporting overloaded calling conventions, flat modifiers, multipliers (`* @rank`), and arithmetic formulas.
- **Dynamic Skill & Technique Schema Expansion (`template.json`, `src/models/items/skill-model.mjs`)**:
  - Expanded `techniqueConfig` schema to include `isDamageEffect`, `appliesToTags`, `baseDiceCountMod`, `baseDiceSidesMod`, `flatDamageMod`, `damageBonus`, `damageType`, `debuffName`, and `cooldown`.
  - Added `baseDiceCountMod` to each tier of `rankBreaks` (`rank5`, `rank10`, `rank15`, `rank20`) for progressive milestone scaling.
- **Manual Technique Creation & Sheet UI (`templates/items/parts/skill.hbs`, `src/sheets/item-sheet.mjs`)**:
  - Added form controls for `isDamageEffect`, `baseDiceCountMod`, `flatDamageMod`, `cooldown`, and `debuffName` in the skill item sheet.
  - Added `baseDiceCountMod` inputs to all four Rank Break milestone cards.
- **Dynamic Discovery & Combat Integration (`src/documents/actor.mjs`)**:
  - Updated `getValidDamageEffects(attackItem)` to dynamically discover owned techniques/skills applying via `appliesTo` or `techniqueConfig.appliesToTags` matching weapon categories, types, or skill tags.
- **Automated Unit Testing (`tests/dynamic-damage-effects.test.mjs`)**:
  - Created dedicated test suite validating custom user techniques, milestone rank break scaling without hardcoded names, tag-based discovery, unarmed/weapon attack calculation, and CarlRPG rules compliance.
  - All 873 tests across 160 suites pass with 0 failures.

## 2.4.14

### Runtime Regex Stripping and Structured Static Assets

- **Pre-Compiled Structured Canonical Assets (`scripts/compile-canonical-assets.mjs`, `src/data/races.mjs`, `src/data/classes.mjs`)**:
  - Implemented offline compilation pipeline transforming narrative perk strings into pre-calculated static assets directly in `DCC_RACES` (30 races) and `DCC_CLASSES` (53 classes).
  - Explicitly codifies `stats`, `drBonus`, `movement`, `skills`, and `spells` schemas into the static files, completely eliminating runtime text/regex parsing on canonical race/class application.
- **Combat Runtime Regex Elimination (`src/documents/actor.mjs`)**:
  - Replaced runtime regex matching (`/pugilism/i`, `/unarmed combat/i`, `/fire fingers/i`, `/slice attack/i`) with exact string matching and structured tag checks (`sys.tags`).
  - Replaced maneuver and unarmed checks with high-performance `Set` lookups (`KNOWN_MANEUVERS`, `KNOWN_UNARMED`) and tag lookups.
  - Replaced combat effect regex checks (`/iron punch/i`, `/powerful strike/i`, `/skullcracker/i`, `/toss/i`, `/smush/i`, `/choke out/i`, `/dirty fighting/i`) with exact string matching.
- **Rank Damage Die Structuring (`src/data/rank-dice.mjs`)**:
  - Added non-enumerable `count` and `sides` properties to `getRankDamageDie()` output for direct property access without regex decomposition, maintaining full backwards compatibility with deep equality assertions.
- **Automated Unit Testing (`tests/runtime-codification.test.mjs`)**:
  - Added dedicated test suite verifying pre-compiled canonical race/class schemas, exact combat effect resolution, and passive tag evaluation.
  - 100% test pass rate across all 866 tests in 160 suites.

## 2.4.13

### Interactive Perks and Detriments for Races and Classes

- **Perks and Detriments Extraction & Codification (`src/data/race-class-applier.mjs`, `template.json`, `src/models/items/lore-model.mjs`)**:
  - Implemented `extractPerksAndDetriments()` to distinguish benefits/perks from drawbacks/detriments across canonical definitions, point builders, and world items.
  - Handles compound trait lines (e.g. "Immunity to Fire damage, and vulnerable to Ice damage"), split day/night mechanics, and keyword-based detriment classification.
  - Added `detriments`, `chosenPerks`, and `chosenDetriments` arrays to both `race` and `class` Item schemas and DataModels.
- **Interactive Perks & Detriments Modal Dialog (`src/data/race-class-applier.mjs`)**:
  - Implemented `promptPerksDetrimentsDialog()` rendering an interactive modal with pre-checked checkboxes for perks and detriments plus optional custom write-in inputs.
  - Cancelling the dialog cleanly aborts race/class application without altering actor state.
  - Headless/automated calls gracefully fall back to full perk/detriment selection or respect explicit `options.chosenPerks`/`options.chosenDetriments`.
- **Mechanical Condition Generation & Tracking (`src/data/race-class-applier.mjs`)**:
  - Refined `parseConditions()` to generate permanent Buff items for Advantage, Immunity, and Resistance traits, and Debuff items for Disadvantage, Vulnerability, and Weakness traits.
  - Stores chosen traits in `system.details.raceAbilities` and `system.details.classAbilities` on the Actor and attaches them to the embedded `race` or `class` Item document.
  - All condition items are flagged with `grantedBy: type` and tracked in `appliedRace`/`appliedClass` flags for clean 100% teardown on race/class swap or removal.
- **Point Builder Integration (`src/apps/base-point-builder.mjs`)**:
  - Point builders extract selected benefits and detriments into `perks` and `detriments`.
  - When applying from the builder (`applyToActor()`), prompts the user to confirm/choose perks and detriments and persists them onto the created item and actor.
- **Character Sheet UI & Re-synchronization (`src/sheets/crawler-sheet.mjs`, `templates/actors/parts/page1-core.hbs`, `templates/actors/parts/story-extras.hbs`)**:
  - Added `[ ⚙️ Perks & Detriments ]` action buttons on Page 1 Core next to the Race and Class labels and under Tab 5 (Story & Extras).
  - Displays styled visual chips for `chosenPerks` (green badges) and `chosenDetriments` (red badges) on the character sheet.
  - Implemented `syncPerksAndDetriments()` allowing players and GMs to re-configure active perks and detriments from the character sheet at any time.
- **Automated Unit Testing (`tests/race-class-perks-detriments.test.mjs`)**:
  - Added 8 unit tests covering perk/detriment extraction, modal dialog prompts (confirm & cancel), selective application, builder application, sheet re-syncing, clean reversal, and sheet listener triggers.
  - 100% test pass rate across all 862 tests in 159 suites.

## 2.4.12

### Wizard-Driven Choices in Race & Class Application

- **Dynamic Choice Detection & Catalog Matching (`src/data/race-class-applier.mjs`)**:
  - Implemented `detectChoices()` to automatically parse choice perks across canonical and custom races and classes (e.g., Dwarf Classic's "+3 in two different crafting Skills of your choice", reach weapon skills, edged weapon skills, universal weapon choices, spell choices, and explicit comma-separated option lists).
  - Implemented `getCatalogOptions()` to provide filtered compendium catalog choices (crafting skills, weapon skills, edged weapons, reach weapons, spells) while offering a custom write-in fallback so player creativity and rule breaking are fully supported.
- **Interactive Choice Wizard Dialog (`src/data/race-class-applier.mjs`)**:
  - Created `promptChoicesDialog()` presenting a styled modal dialog when applying a race or class interactively.
  - Users select desired skills/spells for each choice slot. On cancellation or dialog closure, gracefully aborts application without altering actor state or dropping invalid selections.
  - Fully backward compatible with automated and programmatic calls: headless invocations accept pre-populated `options.choices` or fall back cleanly to valid defaults without hanging.
- **Embedded Document Schema & Full Lifecycle Tracking (`template.json`, `src/documents/actor.mjs`, `src/apps/base-point-builder.mjs`)**:
  - Added `chosenSkills` and `chosenSpells` to `race` and `class` item schemas.
  - Chosen skills and spells are persisted onto the race/class item documents embedded on the actor (`system.chosenSkills`, `system.chosenSpells`, `system.skills`, `system.spells`).
  - Integrated with actor lifecycle tracking: chosen skills and spells are granted to the crawler and registered in `appliedRace`/`appliedClass` flags, allowing complete and clean removal via `removeRace()` and `removeClass()`.
  - Updated Character Sheet (`src/sheets/crawler-sheet.mjs`) dropdowns and drag-and-drop listeners to trigger the wizard dialog interactively, reverting dropdown state on cancel.
  - Updated Point Builders (`src/apps/base-point-builder.mjs`, `class-creator.mjs`, `race-creator.mjs`) to resolve choices when applying custom classes or races directly from the builder.
- **Automated Unit Testing (`tests/race-class-choices-wizard.test.mjs`)**:
  - Added 10 unit tests verifying choice detection, catalog filtering, choice resolution, Dwarf Classic crafting choices, Igneous fire abilities, Blade Dancer / Swashbuckler weapon choices, dialog confirm and cancel flows, and point builder integration.
  - 100% test pass rate across all 854 tests in 158 suites.

## 2.4.11

### Skill-Driven Attack Synthesis, Combat Techniques & Maneuvers Strip, and Offline Human PDF Pre-Calculations

- **Unified Attack Roster & Skill Attack Synthesis (`src/documents/actor.mjs`, `src/sheets/crawler-sheet.mjs`)**:
  - Synthesized attack roster via `actor.getSynthesizedAttacks()`, unifying equipped weapons with primary unarmed and combat skills (*Pugilism*, *Unarmed Combat*, *Wrasslin'*, *Bite*, *Back Claw*, *Slice Attack*, *Improvised Weapons*, etc.).
  - Primary combat skills compute To-Hit modifiers using exact DCC mechanics (Skill Rank + Stat Mod) and display unified composite damage formulas combining base dice and Rank Damage Die (e.g., Rank 5 Pugilism: `3d2 + 1d4 + 4` Bludgeoning).
  - Character Sheet Core tab displays `[SKILL]` and `[WEAPON]` badges on attack rows for immediate visual clarity.
- **Combat Techniques & Maneuvers Strip (`src/documents/actor.mjs`, `src/sheets/crawler-sheet.mjs`, `templates/actors/parts/page1-core.hbs`, `styles/dcc.css`)**:
  - Implemented dedicated interactive **Combat Techniques & Maneuvers** strip below the Attacks table for secondary combat skills (*Powerful Strike*, *Dirty Fighting*, *Iron Punch*, *Choke Out*, *Skullcracker*, *Toss*, etc.).
  - Supports VTT one-click priming/toggling (`.toggle-combat-technique`) to prepare maneuvers for the crawler's next strike.
  - Primed techniques dynamically inject bonus damage dice and status debuffs (e.g. *Woozy*, *Blinded*, *Stunned*) into attack rolls and damage cards, automatically clearing upon strike execution.
- **Offline Human Character Sheet PDF Calculations (`src/apps/pdf-exporter.mjs`)**:
  - Exported characters now populate the Page 1 Attacks table with fully calculated composite dice formulas and To-Hit bonuses.
  - Appends a dedicated `[COMBAT MANEUVERS]` reference section directly into character notes on Page 1, giving physical table players zero ambiguity about dice and maneuver effects.
- **Automated Unit Testing (`tests/attack-skill-synthesis.test.mjs`)**:
  - Added full test suite verifying unarmed skill synthesis, weapon-skill pairing, technique priming toggling, damage card bonus injection, and PDF composite field population.
  - 100% test pass rate across all 844 tests in 157 suites.

## 2.4.10

### Race Item Sheet Redundant Stat Modifier Box Cleanup & Accurate Stat Application

- **Race Item Sheet Presentation (`templates/items/parts/race.hbs`)**:
  - Removed the redundant `RACIAL ABILITY STAT MODIFIERS` block from the race item sheet partial.
  - Racial traits and stat modifiers remain clearly presented in the dedicated `RACIAL PERKS & TRAITS` list (`perksList`), eliminating duplicate or inconsistent stat representations when viewing Race items in the compendium.
- **Racial Stat Modifier Application Accuracy (`src/data/race-class-applier.mjs`)**:
  - Verified and refined stat parsing in `DCCRaceClassApplier.parseStats` to handle comma-and separated ability lists with Oxford commas (e.g., `+4 Intelligence, Dexterity, and Charisma`) cleanly.
  - Ensures accurate direct application of racial ability score bonuses to Crawler core stats across all races.
- **Automated Unit Testing (`tests/race-class-selection.test.mjs`)**:
  - Added unit test asserting `templates/items/parts/race.hbs` omits the separate stat modifier box while retaining `RACIAL PERKS & TRAITS`.
  - Validated that race application continues to correctly apply stat bonuses to Crawler characters.
  - 100% test pass rate across all 838 tests in 156 suites.

## 2.4.9

### All Canonical Class Templates Loadable & Race Point Ledger Design Parity

- **Full Canonical Class Template Loading (`src/apps/class-creator.mjs`, `templates/apps/class-creator.hbs`)**:
  - Resolved issue where only *Dungeon Dad* would load and the other loadable classes appeared blank:
    - Expanded the Class Creator template selector dropdown from 6 entries to all 54 templates (the canonical custom *Dungeon Dad* preset plus all 53 canonical classes from `DCC_CLASSES`, sorted alphabetically).
    - Upgraded `loadPreset(presetId)` in `DCCClassCreatorApp` to look up classes in `DCC_CLASSES` and fully populate the studio: class name, description, prerequisites, notes, archetype selection, Earth Class flag (detecting Silver Earth Box and Earth Hobby Potion grants), ability scores (STR, DEX, CON, INT, CHA), Damage Reduction (DR), granted skills (including choice skills like *Weapon Skill (Choice)*), granted spells, catalog benefits/detriments, and custom perks.
- **Race Creator Studio Point Ledger Design Parity (`templates/apps/race-creator.hbs`, `src/apps/race-creator.mjs`)**:
  - Redesigned the Race Creator studio right column point ledger to match the Class Creator point ledger layout, typography, and card hierarchy:
    - Integrated `.dcc-studio-sidebar` with `.dcc-sticky-receipt`.
    - Live `.dcc-receipt-header-card` with large `XX / YY BP` gauges (`.dcc-gauge-numbers`, `.dcc-spent-num`, `.dcc-budget-num`), soft-limit legality badge (`.dcc-legality-badge`), and 3-column budget breakdown (`.dcc-budget-breakdown` displaying Base, Detriments, and Target BP).
    - Itemized point receipt card (`.dcc-receipt-items-card`) displaying contributions with clean `.dcc-receipt-row` styling.
    - Preserved direct crawler application (`.dcc-target-crawler-card`), Save as Race Item, Apply to Crawler, and Export JSON actions.
- **Race Creator Template Loading Parity (`src/apps/race-creator.mjs`)**:
  - Upgraded `DCCRaceCreatorApp.loadPreset` to also leverage `DCCRaceClassApplier` for parsing stats, DR bonus, granted skills, spells, and perks into catalog benefits/detriments across all 30 canonical races.
- **Enhanced OCR Cleanup & Data Normalization (`src/data/race-class-applier.mjs`)**:
  - Expanded `cleanOCRText()` to clean intra-word OCR spacing artifacts (`Rag e` -> `Rage`, `Arc anist` -> `Arcanist`, `Alchem y` -> `Alchemy`, `Smithin g` -> `Smithing`, `Ta ttoo` -> `Tattoo`, `r oom` -> `room`, `Manag er` -> `Manager`, `Pet s` -> `Pets`, etc.).
  - Enhanced `matchKnownSkill` and `matchKnownSpell` to strip parenthetical annotations and exclamation points for robust matching against canonical datasets.
  - Updated stat regex to handle optional whitespace between signs and values (e.g. `+ 5 Charisma`) and ignore parenthetical notes.
- **Automated Unit Testing (`tests/class-creator.test.mjs`, `tests/race-creator.test.mjs`)**:
  - Added unit test verifying all 54 templates appear in the Class Creator template selector.
  - Added unit test verifying canonical classes (e.g. *Boring Ol' Barbarian*, *Alchemist*, *Harii*, *Dungeon Dad*) load and populate stats, skills, spells, DR, perks, and ledger points spent without leaving fields blank.
  - Added unit tests for `DCCRaceCreatorApp` verifying canonical race preset loading and verifying that `race-creator.hbs` renders the modern point ledger DOM elements.
  - 100% test pass rate across all 837 tests in 156 suites.

## 2.4.8

### Damage Reduction (DR) Steppers & Incremental Point Accounting in Class and Race Builders

- **Interactive DR Incrementer Controls (`templates/apps/class-creator.hbs`, `templates/apps/race-creator.hbs`, `styles/dcc.css`)**:
  - Added dedicated Damage Reduction (DR) stepper boxes with `[-]` and `[+]` interactive controls directly into Section 2 (*Ability Score & Defense Adjustments*) alongside STR, DEX, CON, INT, and CHA.
  - Automatically calculates and displays the Build Point cost: **2 BP per +1 DR** (e.g. +1 DR = 2 BP, +2 DR = 4 BP, +3 DR = 6 BP) in compliance with Chapter 3 (Page 159) of the Core Rulebook.
  - Styled with DCC slate-blue defense theme (`.dcc-dr-box`, `.dcc-dr-step-btn`, `.dcc-stats-grid.has-dr`) and fluid 6-column responsive grid layout.
- **Moderate Benefit Catalog Synchronization (`src/data/point-build-catalog.mjs`, `src/apps/base-point-builder.mjs`)**:
  - Expanded Moderate Benefits catalog with distinct purchases:
    - `mod_dr_buff_1`: `+1 DR Buff` (2 BP)
    - `mod_dr_buff_2`: `+2 DR Buff` (4 BP)
    - `mod_dr_buff_3`: `+3 DR Buff` (6 BP, standard limit)
  - Seamless two-way synchronization: adjusting the Section 2 DR stepper automatically updates the active catalog benefit in the point ledger/receipt, and checking any DR buff checkbox in the catalog accordion synchronizes the stepper and unchecks alternative ranks without duplicate cost.
- **Data Model, Persistence & Actor Application (`src/apps/base-point-builder.mjs`, `src/apps/class-creator.mjs`, `src/apps/race-creator.mjs`)**:
  - `createItemData()` stamps `system.drBonus` directly onto the generated Class or Race item.
  - `compileAbilitiesList()` includes `+X Damage Reduction (DR)` in perks and abilities text.
  - Full support for JSON export/import and preset loading (including canonical *Dungeon Dad* with +2 DR).
  - `applyToActor()` directly updates `system.attributes.dr.buffs` on the targeted Crawler actor when applied from the studio.
- **Automated Unit Testing & Verification (`tests/class-creator.test.mjs`, `tests/race-creator.test.mjs`)**:
  - Added unit test suites verifying DR stepper incrementing, point ledger costs (2 BP per rank), mutual exclusion in catalog selections, item data generation, export/import round-tripping, and actor DR buff application.
  - 100% test pass rate across the full suite (833 tests passing with 0 failures).

## 2.4.7

### Damage Resistance, Movement Modes, Condition Handling & Dedicated Race/Class Sheets

- **Comprehensive Mechanics Audit & Integration (`src/data/races.mjs`, `src/data/classes.mjs`, `src/data/race-class-applier.mjs`)**:
  - Full audit of all 30 playable races and 53 classes (including *Black Inquisitor General* and point-build canonical *Dungeon Dad*) resolving all unaccounted mechanics:
    - **Damage Resistance (DR)**: Explicitly parses DR bonuses (e.g. Amazonian `+2 DR`, Tigran `+1 DR Buff`, Igneous `+3 DR`) and applies them to `system.attributes.dr.buffs`. Reversing a race or class cleanly subtracts the exact bonus.
    - **Movement Speeds & Modes**: Added support for walk deltas (e.g. Tigran `+10ft Move`) on `system.attributes.speed.move`, as well as special movement modes: `climb` (e.g. Arachnid 20 ft), `swim` (e.g. Crocodilian 20 ft), `fly` (e.g. Bune, Obsidian Butterfly, Skyfowl 20 ft), and `burrow` (e.g. Fathom Dwarf 20 ft). All modes revert cleanly to 0 upon removal.
    - **Advantage & Disadvantage as Custom Active Condition Items**: All Advantage conditions on checks are generated and applied as custom embedded `Item` documents of type `'buff'` (e.g. *Advantage: Feline Reflexes*, *Advantage: High Ground Bravado*, *Advantage: Roadie Rigging*); Disadvantage conditions are generated as custom embedded `Item` documents of type `'debuff'` (e.g. *Disadvantage: Clawed Clumsiness*, *Disadvantage: Highborn Arrogance*, *Disadvantage: Cold-Blooded Torpor*). Both types are flagged with `grantedBy: 'race'|'class'` and automatically deleted when swapping or removing races/classes.
- **Dedicated Race & Class Item Sheets (`templates/items/parts/race.hbs`, `templates/items/parts/class.hbs`, `src/sheets/item-sheet.mjs`)**:
  - Created high-contrast, DCC-themed item sheet partial templates preloaded in `src/dcc.mjs`.
  - Feature responsive header badges for Heritage, Size, DR bonuses, and walk/climb/swim/fly/burrow speeds.
  - Interactive grid displaying STR, DEX, CON, INT, and CHA stat modifiers in DCC Red boxes.
  - Granted Skills and Spells card decks showing names, ranks, and mana costs.
  - Distinct Advantage Buff and Disadvantage Debuff preview cards summarizing generated condition items.
  - Perks & Features bulleted list, prerequisites alert banner, and editable abilities/lore textareas.
- **Data Sanitation & OCR Artifact Cleaning**:
  - Cleaned intra-word spaces across `src/data/races.mjs` and `src/data/classes.mjs` (e.g., `"f or"` -> `"for"`, `"Dext erity"` -> `"Dexterity"`, `"Sk ill"` -> `"Skill"`, `"Cat -like"` -> `"Cat-like"`).
  - Restored *Black Inquisitor General* and cleaned chapter header leakages in *Prison Tattoo Artist*, *Shieldmaiden*, *Spellbinder*, *Santero*, *Shepherd*, *Zulu Warrior*, *Necromancer*, *Street Monk*, *Sacred Paladin*, *Swashbuckler*, *Tigran*, and *Primal*.
  - Rebuilt all LevelDB compendium packs with 53 classes and 30 races.
- **Automated Unit Testing & Verification (`tests/race-class-selection.test.mjs`, `tests/races-classes-compendium.test.mjs`)**:
  - Added unit tests 10 through 15 verifying Amazonian stats, skills (+2 Bow, +2 Endurance, +2 Pugilism), and +2 DR; Advantage buff item generation; Disadvantage debuff item generation; movement deltas and special movement modes; item sheet context preparation; and clean condition/DR removal without side-effects.
  - 100% test pass rate across the entire test suite (831 tests across 156 test suites).

## 2.4.6

### Dynamic Race & Class Selection with Non-Item Rank Preservation & Automated Reversal

- **Character Sheet Core Dropdowns (`templates/actors/parts/page1-core.hbs`, `src/sheets/crawler-sheet.mjs`)**:
  - Replaced static text inputs for Race and Class on Page 1 (Core) with structured `<select>` dropdowns categorized by optgroups.
  - Race selector groups all 30 canonical playable races into *Earth Races (Silver Earth Box)*, *Alien Syndicate Races (Galactic Popularity)*, and custom world races.
  - Class selector groups all 52 canonical classes into 10 archetype groups (*Arcanist*, *Barbarian*, *Bard*, *Cleric*, *Druid*, *Fighter*, *Mage*, *Monk*, *Paladin*, *Rogue*), *Multiclass & Special Classes*, and custom world classes.
  - Custom or uncataloged races and classes display seamlessly with `(Custom)` tags without data loss.
  - Omitted `name` attributes on select elements to ensure clean FormApplication / ApplicationV2 state handling without `FormDataExtended` array serialization bugs.
- **Race & Class Application Engine (`src/data/race-class-applier.mjs`, `src/documents/actor.mjs`)**:
  - Implemented `DCCRaceClassApplier` with full parsing and application for ability score deltas, granted skills, granted spells, creature size changes, and embedded Item documents.
  - Attached `actor.applyRace(raceId)`, `actor.removeRace()`, `actor.applyClass(classId)`, and `actor.removeClass()` directly to `DCCActor`.
  - Upgraded sheet drag-and-drop (`_onDropItem`) to automatically execute `applyRace` and `applyClass` when dropping Race or Class compendium items onto the sheet.
- **Automated Reversal & Non-Item Rank Preservation**:
  - Cleanly reverts previous race and class benefits when switching or removing:
    - Reverts ability score modifiers from both `value` and `unenhanced` scores.
    - Reverts creature size to base size (`Medium`).
    - Removes embedded Race and Class Item documents.
    - **Skill Rank Preservation**: Accurately subtracts granted ranks from skills. If a character possesses non-item ranks higher than the amount being removed (e.g. natural ranks from grinding or advancement), the skill item is retained at its remaining rank (`currentRank - grantedRank`). If no non-item ranks remain, the item document is cleanly deleted.
- **Automated Unit Testing & Verification (`tests/race-class-selection.test.mjs`)**:
  - Added 9 unit tests covering option group context generation, custom name handling, stat deltas, Dodge skill retention in a Human Fighter to Shapeshifter Mage transition, pure skill deletion, size updates/restorations, and drag-and-drop integration.
  - 100% test pass rate across the full test suite (825 tests across 156 test suites).

## 2.4.5

### Focus Retention & Scroll Jump Prevention in Class & Race Builders

- **Full Focus Retention Across Value Edits & State Changes (`src/apps/base-application.mjs`)**:
  - Enhanced `_saveFocusState` to capture all interactive HTML attributes, including `data-*` attributes (`data-stat`, `data-delta`, `data-id`, `data-type`, `data-heritage`, `data-size`, `data-tier`, `data-index`), element tags, names, values, and cursor selection ranges (`selectionStart`, `selectionEnd`, `selectionDirection`).
  - Synthesizes unique, robust CSS selectors (e.g. `button.dcc-stat-step-btn[data-stat="str"][data-delta="1"]`, `input.dcc-benefit-toggle[data-id="minor_darkvision"]`) with element `matchIndex` fallback to guarantee exact 1-to-1 matching across DOM re-renders.
  - Refactored `_restoreFocusState` to focus restored elements using `target.focus({ preventScroll: true })`, eliminating browser viewport shifts and ensuring the active element stays focused without disorientation.
  - Preserves cursor selection ranges and text positions when typing into search boxes, filter inputs, and name fields.
- **Scroll Preservation Across Re-renders (`src/apps/base-application.mjs`, `src/apps/base-point-builder.mjs`)**:
  - Implemented persistent scroll position tracking in `_saveScrollPositions` and `_restoreScrollPositions` covering `.dcc-studio-builder`, `.dcc-receipt-list`, `.dcc-studio-sidebar`, `.dcc-studio-layout`, and `.window-content`.
  - Configured `scrollY` in `defaultOptions` and `DEFAULT_OPTIONS` across `DCCBasePointBuilderApp`, `DCCClassCreatorApp`, and `DCCRaceCreatorApp`.
  - Added continuous scroll position listeners in `base-point-builder.mjs` to capture user scrolling in real time.
- **Studio Interactive Routing Refactor (`src/apps/class-creator.mjs`, `src/apps/race-creator.mjs`)**:
  - Wrapped all interactive studio state mutators (stepper clicks, heritage pills, archetype pills, size pills, catalog toggles, custom perks, search filtering, tier filters, and accordion expanding/collapsing) in `reRenderWithState(ev, fn)` which primes focus and scroll state saving prior to triggering re-renders.
  - Preserved scroll states in programmatic helper methods (`setArchetype`, `toggleEarthClass`, `setHeritage`, `setSize`).
- **Template & Stylesheet Accessibility Upgrades (`templates/apps/class-creator.hbs`, `templates/apps/race-creator.hbs`, `styles/dcc.css`)**:
  - Converted class catalog accordion headers to native `<button type="button" class="dcc-accordion-header">` elements with accessible `:focus-visible` styling (`#c0392b` outline ring).
  - Explicitly assigned `name="searchQuery"` to search inputs across both studio templates.
- **Automated Unit Testing & Verification (`tests/builder-focus-scroll.test.mjs`)**:
  - Added 14 unit tests validating data attribute selector synthesis, `preventScroll: true` invocation, cursor range preservation, scroll position restoration on `.dcc-studio-builder` and `.dcc-receipt-list`, and listener attachments.
  - Full test suite passing with 0 failures (816 tests across 155 test suites).

## 2.4.4

### Class Creator Studio & Race Creator Studio Compendium Macros

- **Canonical System Macros Added (`src/data/macros.mjs`, `packs/macros`)**:
  - Added **Class Creator Studio** macro (`_id: "dccmacro00000005"`, `macroKey: "class-creator"`, icon: `icons/svg/book.svg`) with Player Observer permissions (default: 2) to launch `DCCClassCreatorApp` directly from the hotbar or compendium.
  - Added **Race Creator Studio** macro (`_id: "dccmacro00000006"`, `macroKey: "race-creator"`, icon: `icons/svg/paw.svg`) with Player Observer permissions (default: 2) to launch `DCCRaceCreatorApp` directly from the hotbar or compendium.
  - Commands feature clean execution chaining through `window.carl`, `game.dcc`, and `CONFIG.DCC` fallbacks with user notifications on failure.
- **Compendium Database Compilation (`scripts/build-packs.mjs`, `packs/macros`)**:
  - Rebuilt LevelDB `carl-rpg.macros` compendium pack now containing all 6 canonical macros (*Character Creator*, *Open Combat Metrics*, *Party Progression and Session Hub*, *Start Party Grinding & Downtime*, *Class Creator Studio*, *Race Creator Studio*).
- **Automated Unit Testing & Verification (`tests/macros.test.mjs`)**:
  - Enhanced automated test suite checking presence, Player Observer permissions, macroKey flags, database file integrity, and app launch execution for both new macros.
  - 100% test pass rate across the full test suite (802 tests across 148 test suites).

## 2.4.3

### Custom Race Creator Studio (Option A: "Terminal Ledger" Accordion Studio)

- **Race Creator Studio Application (`src/apps/race-creator.mjs`, `templates/apps/race-creator.hbs`)**:
  - Implemented Option A: The "Terminal Ledger" Accordion Studio for building custom CarlRPG races, sub-species, and alien lineages based on Chapter 3 (Pages 128–143 & Point Build Rules on Page 158).
  - Configured with a dedicated **25 Base Build Point (BP)** budget strictly separate from Class Build Points.
  - **Earth vs. Alien Heritage Selection**:
    - **Earth Heritage**: Automatically awards a guaranteed *Silver Earth Box* containing an *Earth Hobby Skill Potion* (3 ranks in a hobby skill of choice) and preserves eligibility for Earth Classes.
    - **Alien Heritage**: Awards the *Galactic Fanbase Popularity* perk (+1 popularity appeal across Syndicate planets) while restricting Earth-specific classes.
  - **Creature Sizing Engine**: Interactive size selector across all canonical sizes (Size 1 Tiny, Size 2 Small, Size 3 Petite, Size 4 Medium, Size 5 Large, Size 6 Huge). Diminutive sizes (Size 1 & 2) and bulky sizes (Size 5 & 6) automatically account for the Major Benefit cost (3 BP), while standard Medium / Petite sizes cost 0 BP.
  - **Live Terminal Ledger Point Accounting**: Real-time tracking of stat modifiers (+1 BP per stat bonus, +1 extra BP per $-2$ penalty), skill/spell ranks (+2 BP per rank), passive skill cap warnings ($>5$), catalog benefits, and detriments (with $+5$ extra BP cap warning).
  - **Soft Limit Non-Enforcement Policy**: Over-budget builds display high-contrast warning badges (`[OVER BUDGET: -X BP]`) without preventing the user from saving, exporting, or applying to actors.
  - **Canonical Race Presets**: Quick-load canonical race profiles (e.g. *Cat*, *Classic Dwarf*, *High Elf*, *Arachnid*, *Pocket Kuma*, *Bune*) with pre-configured stats, sizes, and perks.
  - **1-Click Application & Export**: Save directly to the World Items directory (`type: 'race'`), export/import formatted JSON configurations, or apply directly to a Crawler Actor with automated size updates, ability score adjustments, and embedded racial item/skill generation.
- **Directory Sidebar Integration (`src/dcc.mjs`, `styles/dcc.css`)**:
  - Injected `[ 🧬 Race Creator Studio ]` button in the Foundry Items Directory sidebar alongside `[ 🎓 Class Creator Studio ]`.
  - Added global developer shortcut `window.carl.openRaceCreator()`.
  - Preloaded template `systems/carl-rpg/templates/apps/race-creator.hbs` in `loadTemplates`.
- **Automated Unit Testing & Verification (`tests/race-creator.test.mjs`)**:
  - 10 comprehensive unit tests covering initial state, heritage switching, creature size pricing, ability stat accounting, skill/passive caps, detriments capping, soft limits, preset loading (Cat race), JSON serialization, and crawler actor application.
  - Full test suite passing with 0 failures (802 tests across 148 suites).

## 2.4.2

### Custom Class Creator Studio (Option A: "Terminal Ledger" Accordion Studio)

- **Class Creator Studio Application (`src/apps/class-creator.mjs`, `templates/apps/class-creator.hbs`)**:
  - Implemented Option A: The "Terminal Ledger" Accordion Studio for building custom CarlRPG classes based on Chapter 3 (Pages 158–164).
  - Features real-time point tracking with exact cost calculations for positive ability score points (+1 BP), stat penalty refunds (+1 extra BP per $-2$ penalty), skill/spell ranks (+2 BP per rank), passive skill cap tracking (soft flag when passive ranks $> 5$), benefits (Minor 1, Moderate 2, Major 3, Extreme 4, Epic 6), detriments (+1 to +3 extra BP, $+5$ standard cap), and custom freeform perks.
  - **Soft Limit Non-Enforcement Policy**: High-contrast warning badges alert the user when over budget without locking or preventing saving, exporting, or applying to actors.
  - **Collapsible Accordion Drawers**: Real-time searching and tier filtering across 40+ canonical benefit and detriment perks.
  - **Archetype Pill Selectors**: Quick selection across 12 canonical archetypes (*Arcanist*, *Barbarian*, *Bard*, *Cleric*, *Druid*, *Fighter*, *Mage*, *Monk*, *Paladin*, *Rogue*, *Merchant*, *Necromancer*).
  - **Earth Class Support**: Toggle for Earth-based classes with automated Silver Earth Box (and Earth Hobby Skill Potion) perk injection.
  - **Built-in Presets**: Quick-load canonical builds including Bob's canonical 32 BP *Dungeon Dad* hybrid class.
  - **1-Click Application & Export**: Save directly to the World Items directory (`type: 'class'`), export/import formatted JSON configurations, or apply directly to a Crawler Actor with automated stat adjustments and skill item creation.
- **Reusable Base Point Engine (`src/apps/base-point-builder.mjs`)**:
  - Engineered `DCCBasePointBuilderApp` as the shared modular point accounting foundation for both the Class Creator Studio (30 BP budget) and the upcoming Race Creator (25 BP budget).
- **Directory Sidebar Integration (`src/dcc.mjs`, `styles/dcc.css`)**:
  - Injected `[ 🎓 Class Creator Studio ]` button in the Foundry Items Directory sidebar.
  - Added global developer shortcut `window.carl.openClassCreator()`.
  - Registered template `systems/carl-rpg/templates/apps/class-creator.hbs` in `loadTemplates`.
- **Automated Unit Testing & Verification (`tests/class-creator.test.mjs`)**:
  - 10 rigorous unit tests validating point accounting, soft-limit non-enforcement, preset loading, JSON serialization, item creation, and actor application.
  - Full test suite passing with 0 failures (792 tests across 148 suites).

## 2.4.1

### Races & Classes Compendiums and Custom Point Build Architecture

- **Canonical Races Dataset & Compendium (`src/data/races.mjs`, `packs/races`)**:
  - Implemented all 30 playable species from Chapter 3 (Pages 128–143) of the official DCC RPG Core Rulebook (23 Earth-based and 7 Alien species).
  - Full attribute profiles including standardized creature size categories (Sizes 1–6), prerequisites, Earth vs. Alien heritage tags, inherent combat perks, and HTML ability summaries.
  - Registered official compendium pack `carl-rpg.races` in `system.json`.
- **Canonical Classes Dataset & Compendium (`src/data/classes.mjs`, `packs/classes`)**:
  - Implemented all 51 official classes from Chapter 3 (Pages 144–160) across 10 archetypes (Arcanist, Barbarian, Bard, Cleric, Druid, Fighter, Mage, Monk, Paladin, Rogue) plus multiclass hybrids.
  - Included canonical custom class *Dungeon Dad* (Pages 161–162) demonstrating the official Point Build System.
  - Registered official compendium pack `carl-rpg.classes` in `system.json`.
- **Compendium Build Automation (`scripts/build-packs.mjs`)**:
  - Integrated `buildRaces()` and `buildClasses()` into the headless LevelDB compendium compilation pipeline, generating native ClassicLevel pack databases.
- **Global Runtime Integration (`src/dcc.mjs`, `tests/setup.mjs`)**:
  - Exposed `game.dcc.races` and `game.dcc.classes` at runtime for character sheet integrations, macro scripts, and builder applications.
- **Documentation & Test Verification**:
  - Authored `docs/races-and-classes.md` detailing Earth vs. Alien rules, 30 races, 52 classes, and complete point build costs (Minor, Moderate, Major, Extreme, Epic benefits and Detriments).
  - Added `tests/races-classes-compendium.test.mjs` verifying dataset integrity, unique IDs, schemas, and ClassicLevel disk bundles.
  - Full test suite passing: 782 tests across 148 suites with 0 failures.

## 2.4.0

### Rapid Batch Roll & Event Importer (In-Person Play Transcription)

- **Dedicated Rapid Batch Import Interface (`src/apps/rapid-batch-import.mjs`, `templates/apps/rapid-batch-import.hbs`)**:
  - Purpose-built for physical tabletop play where players roll dice in person and GMs or scribes need to capture rolls and combat results into the active session ledger without navigating character sheets.
  - Multi-line textarea for pasting notes, bullet points, or speech-to-text transcripts with fallback default crawler selector.
  - Live interactive preview table with inline editing across all parsed fields (crawler, action name, event type, roll total, target DC, 7-tier outcome, damage, healing, damage mitigation, killing blow, untrained check flag, notes).
  - Quick "+ Add Blank Row" and single-click row deletion.
  - Sample notes loader (`Load Sample Notes`) for quick demonstration.
  - Single-click batch commitment (`⚡ Import All to Session Ledger`) that saves all entries in a single database transaction and refreshes open session tracker windows.
- **Conversational Shorthand Text Parser (`src/apps/rapid-text-parser.mjs`)**:
  - `DCCRapidTextParser` class with `parse(text, crawlers, defaultActorId)` and `parseLine(line, crawlers, defaultActorId)`.
  - Automatically identifies crawler actors (handles multi-word names and nicknames like *Princess Donut the Queen Anne Chonk* -> *Donut*).
  - Extracts roll totals and target DCs (`16 vs 14`, `16/12`, `total 18 vs DC 14`).
  - Auto-detects natural critical successes (`nat 20`, `crit`, `natural twenty`) and critical fumbles (`nat 1`, `fumble`, `botch`).
  - Detects untrained skill checks (`untrained`, `u/t`, `disadv`) and flags them for end-of-session promotion.
  - Extracts metrics: damage dealt, damage taken (`took X dmg`), healing done (`8 healing`, `healed 12`), damage mitigation (`blocked 5 dmg`, `mitigated 8`), and killing blows (`killing blow`, `boss kill`, `slain`).
  - Identifies target recipients (`on Carl`, `to Donut`) and preserves them in notes while stripping filler words.
- **Instant Chat Command Logging (`src/dcc.mjs`)**:
  - `/rapidlog` or `/batchlog`: Launches the Rapid Batch Import modal from the chat prompt.
  - `/log <shorthand>` or `/rlog <shorthand>`: Directly parses a single shorthand line from chat (e.g. `/log Carl Dodge 16 vs 14 blocked 5 dmg`) and logs it into the active session ledger with zero clicks, suppressing normal chat broadcasting and updating crawler combat metrics in real time.
- **Session Engine Batch Processing & Metric Accumulation (`src/apps/session-manager.mjs`)**:
  - Implemented `DCCSessionEngine.batchCreateEvents(events, sessionId)` to record multiple ledger events in a single transaction.
  - Refactored `createManualEvent` to delegate to `batchCreateEvents`.
  - Added `damageMitigated` and `healingDone` tracking to crawler records and session summaries (`totalDamageMitigated`, `totalHealingDone`).
  - Added killing blow (`isKill`) tracking feeding directly into session XP distribution and crawler kill tallies.
  - Updated Activity Ledger in `templates/apps/session-manager.hbs` with high-contrast metric badges (`[KILL]`, `X DMG`, `X HEAL`, `X MIT`) and quick-access `[ ⚡ Rapid Batch Import ]` launch buttons in the header and toolbar.
- **Automated Verification**:
  - Added `tests/rapid-text-parser.test.mjs` verifying 9 shorthand extraction scenarios (attacks, spells, untrained checks, healing, mitigation, crits, damage taken, favor, multi-line transcripts).
  - Added `tests/rapid-batch-import.test.mjs` verifying application initialization, live parsing, row insertion, sample loading, batch ledger commitment, metric accumulation, summary updates, and chat command interception.
  - Full test suite passing: 777 tests passing across 147 suites with 0 failures.

## 2.3.1

### Universal Color Contrast & Human Readability Overhaul

- **High-Contrast Typography & Explicit Input Font Colors (`styles/dcc.css`)**:
  - Enforced high-contrast placeholder styling across `.dcc-sheet`, `.dcc-item-sheet`, `.dcc-field-input`, `.dcc-stat-input`, and `.dcc-box-input` (`color: #444444 !important; opacity: 1 !important;`).
  - Added explicit high-contrast input/select/textarea text colors (`#111111`) across all sheet inputs to eliminate washed-out text caused by browser or OS dark-mode style inversions.
  - Upgraded low-contrast grey and pastel utility classes: `.dcc-rest-label` (`#222222`), `.dcc-hotlist-empty` & `.dcc-hotlist-detail` (`#333333`), `.dcc-damage-formula` (`#333333`), `.dcc-empty-state` (`#333333`), `.dcc-damage-effects` (`#222222`), `.dcc-phase-subtitle` (`#222222`), `.pip-empty` (`#444444; border: 1.5px dashed #888888`), `.dcc-share-pct` (`#1a5276`), `.dcc-xp-award-val` (`#196f3d`), and `.dcc-level-up-tag` (`#873600`).
- **Item Sheet Readability & WCAG AA Contrast Compliance**:
  - **Rank Breaks Visual Hierarchy (`templates/items/parts/skill.hbs`, `templates/items/parts/spell.hbs`)**: Upgraded rank milestone colors from pastel tones to deep, accessible values meeting WCAG AA contrast standards ($\ge 4.5:1$): Rank 5 Break (`#196f3d`), Rank 10 Break (`#1a5276`), Rank 15 Break (`#6c3483`), and Rank 20 Break (`#873600`).
  - **Item Sheets (`attack.hbs`, `gear.hbs`, `loot.hbs`, `achievement.hbs`, `buff.hbs`, `debuff.hbs`)**:
    - Replaced low-contrast `#777` and `#555` empty states with `#333333` and `#222222`.
    - Upgraded gold value coin indicators to high-contrast deep gold (`#9a6306` and `#7e5109`).
    - Upgraded achievement reward badges and XP labels to accessible deep green (`#196f3d`), deep gold (`#7e5109`), and deep navy (`#1a5276`).
    - Hardened scroll inscribed spell banners with deep blue (`#1a5276`).
- **Actor Sheet Partial Readability (`page1-core.hbs`, `page3-skills.hbs`, `page4-inventory.hbs`, `spells.hbs`, `conditions.hbs`, `story-extras.hbs`)**:
  - Replaced unreadable bright yellow `#f1c40f` text on light table rows with DCC Red (`#c0392b`).
  - Improved stowed weapon circles (`#444444`), attack/spell action links (`#1a5276`), and empty table row notices (`#333333`).
  - Replaced low-contrast placeholder dashes (`#bbb` -> `#444444`) and gear badges (`#222222`).
- **Dialogs & Manager Applications (`crawler-sheet.mjs`, `actor.mjs`, `templates/apps/`)**:
  - Set explicit dark backgrounds (`#141419`) and bold high-contrast labels for Foundry dialog windows (Boss Kill, Crawler Kill, Add Event).
  - Upgraded damage effect selection dialog radio buttons to `#196f3d` with `#222222` descriptions.
  - Enhanced empty states and footers across Skill Manager, Spell Manager, Item Manager, Buff Manager, and Achievement Manager to `#cccccc` against dark frames.
- **Automated Verification**:
  - Added test suite `tests/color-contrast-and-readability.test.mjs` verifying universal placeholders, input colors, CSS class contrasts, template badge colors, and dialog container styles.
  - Full test suite passing: 761 tests passing across 145 suites with 0 failures.

## 2.3.0

### 4-Tier Rank Break Configurations (Ranks 5, 10, 15, 20) for Skills & Spells

- **Unified Rank Break Architecture (`template.json`, `SkillDataModel`, `SpellDataModel`)**:
  - Added `rankBreaks` object schema containing dedicated configurations for `rank5`, `rank10`, `rank15`, and `rank20` across both `skill` and `spell` items.
  - At each rank milestone, each configuration provides optional controls for:
    - `damageDice`: Additional base damage dice granted at and above this rank (e.g. `+1d6`, `2d4`).
    - `rankDamageDice`: Integer count of additional rank damage dice granted (e.g. `+1` or `+2` rank dice).
    - `buffsResistances`: Descriptive buffs, stat boosts, or damage resistances (e.g. `+2 STR`, `Fire Resistance`, `+1 Cleave`).
    - `debuff`: Target condition/debuff applied on successful hit (e.g. `Bleeding`, `Crippled`, `Burned`, `Stunned`).
    - `notes`: Notes for non-defined abilities, narrative effects, or special milestone mechanics.
  - Non-binding constraint: All rank breaks are completely optional and default to inactive/empty with no required effects.
- **Item Sheet Visual Interface (`DCCItemSheet`, `templates/items/parts/skill.hbs`, `templates/items/parts/spell.hbs`)**:
  - Implemented 4-tier visual configuration panels color-coded by milestone:
    - **Rank 5 Break**: Green theme (`#27ae60` / `#e8f8f0`).
    - **Rank 10 Break**: Blue theme (`#2980b9` / `#ebf5fb`).
    - **Rank 15 Break**: Purple theme (`#8e44ad` / `#f5eef8`).
    - **Rank 20 Break**: Orange theme (`#d35400` / `#fdf2e9`).
  - Added interactive inputs for additional damage dice, additional rank damage dice count, buffs/resistances, on-hit debuff selection dropdown, and freeform ability notes.
  - Item sheet controller handles normalization, integer parsing, and fallback initialization across both skills and spells.
- **Combat & Roll Mechanics Integration (`DCCActor`, `DCCItem`)**:
  - `getSkillDamageData`: Cumulatively aggregates active rank break damage dice, adds `extraRankDiceFromBreaks` to the evaluated rank die, and collects target debuffs, buffs, and milestone notes.
  - `getAttackDamageParts`: Automatically scales equipped weapon attacks matching skills with rank break damage dice and extra weapon rank damage dice.
  - `rollAttack`: Renders 1-click **[ 🩸 Inflict Condition ]** buttons on chat damage cards for each active rank break debuff.
  - `getSpellDamageData` & `rollSpellDamage`: Evaluates rank breaks for spells, scaling base damage dice or formula components, augmenting spell rank dice, and embedding debuff buttons on damage cards.
  - `rollSpell` & `DCCItem.rollSpellCard`: Formats active rank break summaries with color-coded badges, damage dice, rank dice, buffs/resistances, debuffs, and notes on cast cards.
- **Automated Verification**:
  - Added dedicated test suite `tests/rank-breaks-configuration.test.mjs` verifying schema validation, sheet context preparation and updating, empty rank break tolerance, skill damage scaling, equipped weapon scaling, chat condition buttons, spell damage scaling, and cast card formatting.
  - Full test suite passing: 755 tests passing across 144 suites with 0 failures.

## 2.2.9

### Foundry V15 Deprecation Cleanup & Global Namespacing Compliance

- **Eliminated Deprecated Global `renderTemplate` Accesses on Startup**:
  - Migrated `DCCFloorClockHUD` (`src/apps/floor-clock-hud.mjs`) and `DCCCrawlerClockHUD` (`src/apps/crawler-clock-hud.mjs`) to resolve `foundry.applications.handlebars.renderTemplate` before falling back to `globalThis.renderTemplate`.
  - Updated `DCCCrawlerTokenHUD` (`src/apps/crawler-token-hud.mjs`) and `DCCSessionManagerApp` (`src/apps/session-manager.mjs`) to prioritize `foundry.applications.handlebars.renderTemplate`.
  - Eliminates startup warning: `"You are accessing the global 'renderTemplate' which is now namespaced under foundry.applications.handlebars.renderTemplate and will be removed in Version 15."`
- **Document Model Class Namespacing (`DCCActor` & `DCCItem`)**:
  - Updated `DCCActor` (`src/documents/actor.mjs`) to inherit from `foundry.documents.Actor` / `foundry.documents.BaseActor` instead of bare global `Actor`.
  - Updated `DCCItem` (`src/documents/item.mjs`) to inherit from `foundry.documents.Item` / `foundry.documents.BaseItem` instead of bare global `Item`.
  - Eliminates deprecation warnings for global `Actor` and `Item` lookups during document evaluation.
- **Compendium Population & Macro Initialization Namespacing (`src/dcc.mjs`)**:
  - Namespaced document class resolution in the `ready` hook for `ItemDocClass`, `ActorDocClass`, and `MacroDocClass`.
  - Replaced direct `Item.createDocuments`, `Actor.createDocuments`, `Macro.createDocuments`, and `Macro.create` calls with namespaced document classes.
  - Updated `ensureBackgroundTables()` and `rollBackgroundTable` (`src/data/background-tables.mjs`) to resolve `CONFIG.RollTable.documentClass` / `foundry.documents.RollTable` and `foundry.dice.Roll`.
- **TextEditor Drag & Drop Resolution (`src/sheets/item-sheet.mjs`)**:
  - Updated `_onDrop` in `DCCItemSheet` to resolve `foundry.applications.ux.TextEditor.implementation` and `foundry.documents.Item` without accessing deprecated global `TextEditor` or `Item`.
- **Automated Verification**:
  - Added dedicated test suite `tests/v15-deprecation-and-namespacing.test.mjs` verifying inheritance hierarchy under namespaced globals and verifying zero deprecated global property accesses for `renderTemplate`, `loadTemplates`, `RollTable`, and `TextEditor`.
  - Full test suite passing: 741 tests passing across 139 suites with 0 failures.

## 2.2.8

### Spell Explicit Rank Definitions, Scaling Damage & Ability Parity

- **Spell Data Schema Parity (`template.json` & `SpellDataModel`)**:
  - Added `damageModifiers` array field to `Item.spell` supporting multi-tiered rank-gated damage bonuses (`minRank`, `formula`, `damageType`).
  - Added `critMultiplierR5` (default `4`) and `critMultiplierR15` (default `8`) for dynamic spell critical hit multipliers.
  - Added `fumbleDebuff` for spell mishap backfires on Natural 1 attack rolls.
  - Added `onHitDebuff` and `onHitDebuffMinRank` for rank-gated condition triggers on target hit.
  - Added `optionalEffects` and `selectedEffect` for metamagic riders and tactical spell variations.
- **Spell Sheet Interface (`DCCItemSheet` & `templates/items/parts/spell.hbs`)**:
  - Added **SPELL CRITICAL MILESTONES & CONDITION TRIGGERS** UI panel with controls for `critMultiplierR5`, `critMultiplierR15`, `fumbleDebuff`, `onHitDebuff`, and `onHitDebuffMinRank`.
  - Added **SPELL DAMAGE MODIFIERS & SCALING (RANK-GATED)** dynamic table with 1-click `[+ Add]` and `[- Remove]` controls.
  - Added **OPTIONAL EFFECTS & METAMAGIC RIDERS** controls with comma-separated parsing and active effect selection.
  - Enhanced **SPELL UPGRADES & ABILITIES** inputs for authentic Rank 5, 10, and 15 cheat sheet descriptions.
- **Spell Combat & Damage Execution (`DCCActor`)**:
  - `getSpellDamageData`: Evaluates explicit `damageModifiers` where $\text{rank} \ge \text{minRank}$, seamlessly supporting spells defined entirely through rank modifiers or combined with `baseDamage`.
  - `rollSpellDamage`: Renders dynamic **[ 💥 Crit (4x) ]** and **[ ⚡ Crit (8x) ]** buttons on chat damage cards based on spell rank, and displays interactive **[ Inflict Debuff ]** buttons when $\text{rank} \ge \text{onHitDebuffMinRank}$.
  - `rollSpellAttack`: Detects spell disadvantage (`2d20kl`) and warns of Natural 1 Fumble backfires with configured caster debuffs.
- **Automated Verification**:
  - Added comprehensive test suite `tests/spell-rank-definitions-and-abilities.test.mjs` validating schema defaults, context preparation, damage modifiers persistence, combat scaling, critical milestones, on-hit debuffs, disadvantage, and fumble backfire warnings. All 732 tests passing with 0 failures.

## 2.2.7

### Manual Weapon & Skill Creation Interface & Combat Milestone Mechanics

- **Interactive Item Sheet Controls (`DCCItemSheet`)**:
  - Added **WEAPON PROFICIENCY & HANDLING** panel in `templates/items/parts/gear.hbs` and `templates/items/parts/attack.hbs` with controls for `weaponCategory`, `weaponType`, `wieldMode` (`one_handed`, `two_handed`, `two_handed_disadv_1h`), `associatedSkills`, `proficiencyMode`, and `optionalEffects`.
  - Added **TECHNIQUES, CONDITIONS & CRITICAL MILESTONES** panel in `templates/items/parts/skill.hbs` with inputs for `isTechnique`, `appliesTo`, `techniqueConfig`, `critMultiplierR5` (e.g. 4x), `critMultiplierR15` (e.g. 8x), `fumbleDebuff` (e.g. *Minor Injury* on Natural 1), `onHitDebuff` (e.g. *Bleeding*), and `onHitDebuffMinRank`.
  - Updated `_prepareContext()` and `_updateObject()` to automatically serialize/deserialize comma-separated lists and pre-populate selectable dropdown choices.
- **Combat Execution & Milestone Scaling (`DCCActor`)**:
  - Implemented one-handed disadvantage checks in `rollAttack`: two-handed weapons with `wieldMode: "two_handed_disadv_1h"` automatically roll at disadvantage (`2d20kl`) when wielded in one hand, while standard two-handed attacks roll `1d20`.
  - Implemented Natural 1 Fumble warning in chat messages displaying configured fumble debuffs on critical misses.
  - Implemented dynamic critical multiplier cards in `rollAttack` (e.g. `Crit (4x)` at Rank 5+, `Crit (8x)` at Rank 15+).
  - Implemented interactive **Inflict [Debuff]** button on chat damage cards when attacker meets or exceeds the skill's `onHitDebuffMinRank`.
  - Integrated weapon-associated skill rank resolution supporting `highest`, `additive`, and `primary_plus_half` modes.
- **Automated Verification**:
  - Added test suite `tests/weapon-and-skill-creation-interface.test.mjs` verifying schema defaults, context preparation, string array harvesting, complete Chainsaw skill creation with 4-tier 2d4 scaling, 4x/8x crits, and debuffs, and actor combat execution. All 727 tests passing with 0 failures.

## 2.2.6

### Item Sheet Details Opening & Legacy Gold Value Recursion Fix

- **Resolved `Maximum call stack size exceeded` in `BaseItemDataModel.goldValue`**:
  - Fixed infinite recursion loop in `BaseItemDataModel.prototype.goldValue` where fallback was referencing `this.parent?.system?.goldValue` (calling itself on any item without `value` defined, including skills like *Dirty Fighting*, spells, attacks, lore traits, buffs, and debuffs).
  - Cleanly resolved `goldValue` to `Number(this.value ?? this._source?.goldValue ?? this._source?.value ?? 0)` with no recursive lookups.
  - Added `migrateData(source)` in `BaseItemDataModel` to transparently map legacy `goldValue` to `value` on document instantiation and database loading.
- **Enhanced `DCCItem.prototype.goldValue` & `prepareBaseData`**:
  - Safe resolution without mutual recursion across plain objects, legacy schemas, and TypeDataModel instances.
  - Automatically migrates `system.goldValue` to `system.value` for gear and loot items.
- **Registered Missing Handlebars Helpers & Compendium Imports**:
  - Registered missing Handlebars helpers `ne` and `and` in `src/dcc.mjs` to prevent sheet render errors in attack and loot templates.
  - Imported `DCC_SPELLS` in `src/sheets/item-sheet.mjs` to ensure `getAvailableSpells()` does not throw `ReferenceError`.
  - Explicitly registered supported item types in `ItemsClass.registerSheet`.
- **Automated Verification**:
  - Added unit test suite `tests/item-sheet-details-and-migration.test.mjs` verifying all 12 item types, compendium skill *Dirty Fighting*, legacy migration, and helpers.

## 2.2.5

### Weapon Skill Proficiency & Technique Schema

- **Weapon Skill Proficiency Data Model Extensions (`AttackDataModel` & `GearDataModel`)**:
  - Added `weaponCategory` (`StringField`) to categorize broad weapon families (e.g. `Power Weapons`, `Edge`, `Bashing`, `Reach`, `Ranged`, `Hand to Hand`).
  - Added `weaponType` (`StringField`) to specify weapon archetypes or specific models (e.g. `Chainsaw`, `Longsword`, `Shotgun`).
  - Added `associatedSkills` (`ArrayField<StringField>`) for explicit multi-skill proficiency associations.
  - Added `proficiencyMode` (`StringField`, choices: `highest`, `synergy`, `manual`) supporting specialization precedence and tiered synergy.
  - Added `selectedSkill` (`StringField`) for optional manual skill lock.
  - Added `optionalEffects` and `selectedEffect` to both `AttackDataModel` and `GearDataModel` to align with the damage effects subsystem.
- **Skill Technique Schema Extensions (`SkillDataModel`)**:
  - Added `isTechnique` (`BooleanField`) to distinguish combat maneuvers and damage effects from standalone to-hit skills.
  - Added `appliesTo` (`ArrayField<StringField>`) linking maneuvers to qualifying weapon types, categories, or parent skills.
  - Added `techniqueConfig` (`SchemaField`) defining structured technique payloads (`damageBonus`, `damageType`, `debuffName`, `cooldown`).
- **Template Schema & Manifest Alignment**:
  - Updated `template.json` default definitions for `Item.attack`, `Item.gear`, and `Item.skill`.
  - Bumped version to `2.2.5` in `system.json`.
  - Added automated test suite `tests/weapon-skill-proficiency-schema.test.mjs` and updated `tests/item-data-models.test.mjs`.

## 2.2.4

### Surviving Crawler Countdown Clock HUD

- **Surviving Crawler Countdown Clock (`DCCCrawlerClockHUD`)**:
  - Implemented `DCCCrawlerClockHUD` (`src/apps/crawler-clock-hud.mjs` and `templates/apps/crawler-clock-hud.hbs`), a floating scene widget anchored below scene navigation and docked immediately to the right of the Floor Collapse Clock (`#dcc-floor-clock-hud`).
  - Tracks total surviving crawlers remaining in the World Dungeon (default: 13,000,000), reflecting the iconic LitRPG world counter from Dungeon Crawler Carl.
  - **Dynamic Docking & Alignment**: Dynamically aligns 8px to the right of the Floor Collapse Clock, automatically shifting when the Floor Collapse Clock expands, collapses, or when scene navigation re-renders.
  - **Collapsed Pill State**: Minimizes to a sleek pill badge displaying the group icon (`fa-solid fa-users`) and formatted count (e.g. `12,850,000`). Clicking the pill toggles between collapsed and expanded modes.
  - **Expanded Readout & GM Controls**:
    - **Header**: Shows the `[SURVIVING]` badge and `Crawler Count` title.
    - **Player View**: Clean, readable LitRPG counter showing remaining crawlers alive in the dungeon (`<N> CRAWLERS`).
    - **GM Quick Delta Adjustments**: One-click adjustment buttons (`-10k`, `-1k`, `-100`, `-1`, `+1`, `+100`, `+1k`, `+10k`) for handling individual deaths, trap massacres, boss wipes, and floor-wide disasters.
    - **Direct Numeric Input**: Editable input field supporting both raw numbers and comma-formatted integers (`12,850,000`).
- **Global Settings & Document API Integration**:
  - Registered `carl-rpg.crawlerCount` world setting (default 13,000,000).
  - Added static and instance methods to `DCCActor`: `getCrawlerCount()`, `setCrawlerCount(count)`, `decrementCrawlerCount(amount)`, and `incrementCrawlerCount(amount)`.
  - Exposed crawler count helpers and class in `CONFIG.DCC`, `window.carl`, and exported from `src/dcc.mjs`.
  - Included `crawlerCount` and `formattedCrawlerCount` in crawler sheet `getData` context.
- **Automated Unit Testing & Verification**:
  - Added test suite `tests/crawler-clock-hud.test.mjs` validating default values, setting/decrementing/incrementing, bounds checking, number/string parsing with commas, singleton options, fallback HTML generation for GM vs player, docked positioning next to the floor clock, event listeners, and crawler sheet integration.
  - 100% test pass rate across 134 test suites (707 passing, 0 failures).

## 2.2.3

### DCC Item & Equipment Library (Unified Gear & Item Selection)

- **DCC Item & Equipment Library (`DCCItemManager`)**:
  - Implemented `DCCItemManager` (`src/apps/item-manager.mjs` and `templates/apps/item-manager.hbs`), providing a centralized, interactive compendium browser for equipment, weapons, armor, accessories, potions, wands, scrolls, and lottery tickets matching the workflow of `DCCSkillManager` and `DCCSpellManager`.
  - **Category Filtering & Counts**: Added interactive category filter pills (`All`, `All Gear`, `Weapons`, `Armor`, `Accessories`, `All Items`, `Potions / Consumables`, `Scrolls`, `Wands`, `Lottery`) displaying real-time item counts.
  - **Equipment Slot Filter**: Added slot dropdown filter (`Head`, `Torso`, `Arms`, `Hands / Weapons`, `Legs`, `Feet`, `Accessories`).
  - **Live Search & Focus Retention**: Search by name, mechanics summary, notes, or tags with persistent focus preservation.
  - **1-Click Add & Inventory Tracking**: Added `[ + Add to Inventory ]` button to embed items on bound actors, tracking ownership with `[ In Inventory (xN) ]` and `[ + Add More ]` buttons.
  - **Drag-and-Drop Support**: Enables dragging items directly from the library window onto character sheets, maps, or hotbars.
- **Dual Selection & Creation Workflow on Character Sheet (Page 2: Equipment & Inventory)**:
  - Replaced creation-only buttons on Page 2 with dual selection and custom creation controls matching Page 3:
    - **Equipped Gear Slots**: Added `Select Gear` (`.open-gear-picker`) alongside `Custom Gear` (`.item-create`).
    - **Inventory & Backpack**: Added `Select Item/Gear` (`.open-item-picker`) alongside `Custom Gear` and `Custom Item`.
  - Added `_openItemPicker(activeCategory, activeSlot)` method and event listeners to `DCCCrawlerSheet` (`src/sheets/crawler-sheet.mjs`).
- **Determine Value Skill Appraisal Gating**:
  - Gated gold values within `DCCItemManager` according to the bound crawler's Determine Value skill rank:
    - Rank 0–9: Displays masked `???` values and indicates appraisal lock in the footer.
    - Rank 10+: Displays true evaluated gold prices (`<N> GP`).
- **Canonical DCC Items Dataset & Configuration**:
  - Expanded `DCC_ITEMS` (`src/data/items.mjs`) with canonical weapons, armor, accessories, consumables, and wands.
  - Exposed `CONFIG.DCC.items = DCC_ITEMS` and registered `DCCItemManager` in `game.dcc`, `game.dcc.applications`, and `window.carl.openItemManager`.
  - Registered `systems/carl-rpg/templates/apps/item-manager.hbs` in `loadTemplates` in `src/dcc.mjs`.
  - Added responsive dark theme and hover styles in `styles/dcc.css`.
- **Automated Unit Testing & Verification**:
  - Added comprehensive test suite `tests/item-manager.test.mjs` verifying unified item loading, category and slot filtering, search query filtering, appraisal value masking, embedded actor item creation, and crawler sheet integration.
  - 100% test pass rate across 126 test suites (687 passing, 0 failures).

## 2.2.2
 
### Consumable & Item Spell Free Cast (0 Mana Cost Rule)
 
- **0 Mana Cost for Consumable & Item Spell Effects**:
  - Enforced the rule that whenever a consumable, potion, elixir, spell scroll, wand, or activated gear is used and a spell is cast as the effect, the spell **costs 0 mana** to the caster.
  - Updated `DCCActor.prototype.rollSpell` to accept `options.freeCast`, `options.isConsumable`, `options.isItemEffect`, and `options.originItem` (or passing options as the second argument).
  - When `isFreeCast` is active:
    - Bypasses the insufficient mana failure check, allowing casts to succeed even if the caster has 0 current MP.
    - Prevents mana deduction from the caster's mana pool (`system.attributes.mana.value`).
    - Formats the chat card with `0 MP (Free Cast)` and displays the item source badge.
    - Sets `flags['carl-rpg'].freeCast = true`, `manaCost = 0`, and preserves `baseManaCost` for reference.
- **Scrolls, Wands & Outcome Builder Spell Resolution**:
  - Updated `useLoot` to pass `{ freeCast: true, originItem: this, isConsumable: true, isItemEffect: true }` when casting inscribed spells from scrolls, wands, or direct-bound consumables.
  - Enhanced `resolveSingleOutcome` for `outType === 'spell'` to link with compendium spells (`CONFIG.DCC.spells`) or owned items, automatically triggering a free cast in multi-mode combos and rendering a `[ Cast Spell (0 Mana) ]` action button.
  - Added click listener in `src/dcc.mjs` for `.dcc-cast-spell-btn` with `data-free-cast="true"`.
- **Automated Unit Testing & Verification**:
  - Created `tests/consumable-spell-free-cast.test.mjs` validating 0 mana costs for direct rollSpell with freeCast, scrolls, wands, multi-effect combo elixirs, activated gear, mana preservation, and chat button click handlers.
  - 100% test pass rate across 121 suites (678 passing, 0 failures).

## 2.2.1

### Item Gold Value Appraisal & Determine Value Skill Integration

- **Item & Gear Gold Values**:
  - Added a first-class gold value field (`system.value` / `goldValue`) across all `gear` and `loot` items in `template.json`, `GearDataModel`, `LootDataModel`, and `DCCItem`.
  - Added dedicated Gold Value inputs to both Gear and Loot item sheets (`templates/items/parts/gear.hbs` and `templates/items/parts/loot.hbs`), gated by character appraisal capability.
  - Added gold values to canonical system compendium items (Normal Mana Potion: 10 GP; Scratch-off Ticket: 5 GP).
- **Determine Value Skill Mechanics**:
  - **Rank 0–4 (Default)**: Crawlers cannot discern item gold values. Gold values are masked as `???` on both the character sheet inventory and item sheets. Value sorting is locked (`🔒 Value (Req. Rank 5)`).
  - **Rank 5–9**: Crawlers unlock the ability to sort their inventory and gear by value (`Value: High to Low` and `Value: Low to High`), while exact numbers remain masked (`???`).
  - **Rank 10+**: Crawlers unlock exact item appraisal, displaying true gold amounts (`<N> GP`) on both the character sheet inventory and item sheets alongside value sorting.
- **Actor Document Helpers & Inventory Sorting**:
  - Added `getSkillRank(skillName)`, `getDetermineValueRank()`, `canDetermineValue()`, `canSeeItemValue()`, `canSortInventoryByValue()`, `sortInventoryByValue()`, and `getInventory()` methods to `DCCActor`.
  - Enhanced `DCCCrawlerSheet.getData()` to decorate items with `goldValue`, `canSeeValue`, and `displayValue` flags and sort gear and loot by value descending, ascending, name, or default order.
  - Added interactive inventory sort selector dropdown (`.inventory-sort-select`) in the header of Page 4 (Inventory).
- **Automated Unit Testing & Verification**:
  - Added comprehensive unit test suite in `tests/determine-value.test.mjs` validating schema defaults, rank detection, capability checks, masking behavior, inventory sorting, item sheet gating, and template bindings.
  - 100% test pass rate across 112 suites (666 passing, 0 failures).

## 2.2.0

### Item Outcome Builder 2.0, Multi-Effect Consumables, Wands, Scrolls & Activated Gear

- **Unified Outcome Builder 2.0 Engine**:
  - Implemented multi-effect outcome support across `loot` (consumables, potions, elixirs, lottery tickets, wands, scrolls) and `gear` (weapons, armor, accessories).
  - **Execution Modes**:
    - `All Effects (Guaranteed Combo)`: All defined effects resolve simultaneously upon consumption or activation. Perfect for complex restorative elixirs, troll blood tonics, and charged combat items.
    - `Weighted Random Outcome`: Generates a single random outcome based on percentage weights summing to 100% (with automatic rebalancing, non-numeric validation, and manual overwrite warnings).
    - `Roll Table`: Directly draws from any designated Foundry VTT RollTable.
- **Rich Effect Types**:
  - **Fixed Health Bar Healing (`heal`)**: Restores $X$ Health Bars immediately ($X \times \text{CON Mod}$ HP), capped at maximum HP.
  - **Heal over Time (`heal_over_time`)**: Applies a HoT condition restoring $X$ bars/round for $Y$ combat rounds, dynamically evaluated and ticked by `DCCCombat` round processing.
  - **Mend Injury (`mend_injury`)**: Mends injuries by severity (`minor`, `major`, or `all`), safely removing matching debuff items from the character.
  - **Cure Debuff (`cure_debuff`)**: Cures debuffs matching a specific filter (e.g. `Burned`, `Poisoned`) or clears all active debuffs.
  - **Grant Buff (`buff`)**: Applies canonical or custom buffs directly to crawler external buff slots or embedded item collections.
  - **Inflict Debuff (`debuff`)**: Applies temporary or permanent negative conditions to target tokens.
  - **Raise Skill Rank (`skill_rank`)**: Permanently increases an actor's skill rank by $+N$ and recalculates modified ranks.
  - **Permanent Stat Boost (`stat_permanent`)**: Permanently increases an unenhanced ability score (STR, INT, CON, DEX, CHA) by $+N$, updating derived DCC stat modifiers and max HP.
  - **Cast Spell / Damage (`spell`)**: Evaluates damage formulas (e.g. `2d12 + Int Mod` Fire) with disadvantage rules and condition triggers.
  - **Roll Table Resolution (`roll_table`)**: Draws from specified RollTables.
- **Wands with Charges Pool & Spell Scrolls**:
  - **Wands & Charged Items**: Configurable charges pool (`charges.value` / `charges.max`) that decrements on each use and persists in inventory when depleted.
  - **Spell Scrolls**: Single-use items allowing casting of inscribed spells with **zero mana required** from the caster.
- **Activated Gear with On-Use Abilities**:
  - Gear items can enable `system.hasActivatedAbility: true` with usage limits / cooldowns (e.g. `"Once per scene"`) and an attached outcomes builder.
  - Activated directly from character inventory via a dedicated `[ ⚡ ]` action button, hotlist, or token HUD.
  - Gear is never deleted when uses or charges reach zero.
- **Interactive Chat Cards**:
  - Multi-effect summary cards with 1-click action buttons: `[ Apply Damage ]`, `[ Apply Healing ]`, `[ Apply Regeneration ]`, `[ Mend Injury ]`, `[ Cure Debuff ]`, `[ Grant Skill Rank ]`, `[ Grant Stat Boost ]`, `[ Apply Buff / Debuff ]`, and `[ Draw from Table ]`.
- **Automated Unit Testing & Verification**:
  - Added `tests/item-effects-builder.test.mjs` verifying models, actor helpers, guaranteed combos, wands with charges, free cast scrolls, activated gear, item sheet context, and chat card click bindings.
  - 100% test pass rate across 112 suites (655 passing, 0 failures).

## 2.0.60

### Session Tracking Crawler Selection Default & Ubiquitous Start Grind UI

- **Session Tracking Auto-Selection (`DCCGrindApp`)**:
  - The Grinding & Downtime Hub now automatically defaults its selected crawlers to those currently tracked in the active session (`DCCSessionEngine.getActiveSession().trackedCrawlerIds` or `session.crawlers`), falling back to all crawlers if no session is active.
  - Keeps party composition seamless and synchronized between session tracking, party progression, and downtime grinding.
- **Prominent & Ubiquitous "Start Grind" Access Across the System**:
  - **Character Sheet Page 1 (Core)**: Added high-visibility `.open-grind-app.dcc-start-grind-btn` (`[ 🏋️ Start Grind ]`) directly in the resting & downtime controls strip alongside the Safe Room buttons and floor clock widget.
  - **Character Sheet Page 3 (Skills)**: Converted the small text link in the skills header into a vibrant, high-contrast `.open-grind-app.dcc-start-grind-btn` (`[ 🏋️ Start Grind ]`).
  - **Scene Floor Clock HUD (`#dcc-floor-clock-hud`)**:
    - Embedded `[ 🏋️ Grind ]` button into the compact pill HUD header with event isolation (`stopPropagation`).
    - Added `[ 🏋️ Start Grind ]` button into the expanded timer banner.
    - Elevated HUD `z-index: 100` to guarantee visibility above all canvas layers and controls.
  - **Actors Directory Sidebar**: Injected `[ 🏋️ Party Grinding & Downtime Hub ]` button directly into the Foundry actors directory tab header.
  - **Grind App Execution Prominence**: Added top-bar quick `[ ▶ Start Grind (Xh) ]` button in the Grinding Hub dialog header, and renamed the bottom action button to clearly state `Start Grind (N Crawlers, X hrs)`.
  - **System Macro Compendium (`carl-rpg.macros`) & Globals**: Added `Start Party Grinding & Downtime` macro and exposed `window.carl.openGrindApp()`.
- **Automated Test Suite**:
  - Added Suite 12 to `tests/grinding.test.mjs` verifying session tracking default resolution and multi-surface Start Grind button presence.
  - Updated `tests/macros.test.mjs` validating canonical system macros.
  - 100% test pass rate across 103 suites (641 passing, 0 failures).

## 2.0.59

### Party Grinding Hub, Scene Floor Clock HUD, Individual Crawler Progression & Use-It-Or-Lose-It Pool

- **Floating Scene Floor Clock HUD (`DCCFloorClockHUD`)**:
  - Implemented persistent on-screen HUD widget anchored below Foundry's scene navigation bar (`#navigation`).
  - Displays real-time hours remaining until floor collapse with LitRPG stylized theme (`⏳ 94h`).
  - Supports collapsible pill mode and full banner mode with 1-click GM manual adjustment buttons (`-5h`, `-1h`, `+1h`, `+5h`), manual numeric input, and instant `[Grind]` launcher.
  - Automatically updates across all connected clients via world setting hooks.
- **Party-Wide Grinding Hub (`DCCGrindApp`)**:
  - **Party Roster Selection**: Checkboxes allow the GM/party to select which crawlers participate in a grinding session.
  - **Crawler Sub-Tabs**: Switch between party members within the hub to view each crawler's skills, banked pool, and test advancement checks.
  - **Single Decrement for Floor Clock**: Floor clock decrements once for the entire party session by non-bonus hours accrued (`hours`).
  - **Use-It-Or-Lose-It Pool Rule**: Unspent hours in each crawler's unallocated pool are reset to zero at the start of a new grind (use it or lose it). Hours already invested on specific skills persist across grinds.
  - **Individual Endurance Checks**: Extended grinding excess hours ($> 5$ hours base) trigger separate Endurance checks ($1d20 + \text{Rank} + \text{CON Mod}$ vs $10 + \text{Floor} + \text{Excess}$) for each crawler. `Fatigued` debuffs are applied *only* to crawlers who fail their individual checks.
- **In-Sheet Skill Hour Allocation & Individual Advancement (`DCCCrawlerSheet` & `page3-skills.hbs`)**:
  - Crawlers can now spend banked pool hours directly from their own sheets using inline `[-1]`, `[+1]`, and `[Fill]` buttons next to each skill.
  - When hours invested meet the required rank threshold, an inline graduation cap advancement button (`Advance (d20 >= Target)`) appears directly on the skill row, allowing crawlers to roll their advancement check individually from their sheet.
- **Automated Test Suite**:
  - Added Suite 11 to `tests/grinding.test.mjs` validating party grinding, individual endurance checks, selective fatigue application, use-it-or-lose-it pool reset, and in-sheet allocation.
  - 100% test pass rate across 103 suites (639 passing, 0 failures).

## 2.0.58

### Fix: DataModel Schema Field Registration & Live Banked Pool Hours Incrementing

- **DataModel Schema Registration (`CrawlerDataModel` & `SkillDataModel`)**:
  - Registered `bankedGrindHours: new fields.NumberField({ initial: 0, integer: true, min: 0 })` in `CrawlerDataModel.defineSchema()` and `PetDataModel.defineSchema()`.
  - Registered `investedHours: new fields.NumberField({ integer: true, min: 0, initial: 0 })` in `SkillDataModel.defineSchema()`.
  - In Foundry VTT v12+, updates to document fields not registered in `defineSchema()` were stripped during data validation, causing `system.details.bankedGrindHours` and `system.investedHours` to reset to 0 in persistent storage.
- **Immediate In-Memory Document Synchronization**:
  - `actor.grindSession(...)` and `actor.allocateGrindHours(...)` now synchronize `this.system.details.bankedGrindHours` and `skill.system.investedHours` directly in memory alongside database persistence, preventing race conditions or stale reads before socket confirmation.
- **Interactive Grinding Hub (`DCCGrindApp`)**:
  - `getData()` now ensures `context.bankedHours` reflects the live grind session result (`lastGrindResult.bankedHours`) and instant pool adjustments when hours are allocated with `+1`, `-1`, or `Max`.
- **Character Sheet Display**:
  - Added live Banked Hours badge (`Pool: X hrs`) to the Page 3 (Skills) banner header, keeping players and GMs informed of their available downtime hours directly on the character sheet.
- **Automated Test Suite**:
  - Added Suite 10 to `tests/grinding.test.mjs` verifying schema field presence and live pool incrementing across `actor.grindSession`, `DCCGrindApp`, and `DCCCrawlerSheet`.
  - 100% test pass rate across 102 suites (634 passing, 0 failures).

## 2.0.57

### Global Floor Timer Clock & Non-Bonus Hours Decrementing

- **Global Floor Timer Setting (`carl-rpg.floorTimer`)**:
  - Implemented world-scoped setting `floorTimer` defaulting to 100 hours remaining until floor collapse.
  - Added programmatic access and helpers across `DCCActor.getFloorTimer()`, `DCCActor.setFloorTimer(hours)`, `DCCActor.decrementFloorTimer(hours)`, `CONFIG.DCC`, and `globalThis.window.carl`.
- **Manual Floor Clock Adjustment in UI**:
  - **Crawler Sheet (Page 1 Core)**: Added `.dcc-floor-clock-widget` and `.dcc-global-floor-clock-input` directly beside the rest recovery controls, allowing players and GMs to view and manually adjust the active floor timer with instant synchronization.
  - **Grind Application (`DCCGrindApp`)**: Added header Floor Clock badge and editable input (`.floor-timer-clock-input`), live session impact preview, and alert banner displaying floor hours remaining.
- **Grinding Floor Clock Cost (Non-Bonus Hours Accrued)**:
  - Updated `actor.grindSession({ hours, ... })` to decrement the global Floor Timer Clock strictly by **non-bonus hours accrued** (`hours`).
  - Bonus hours gained from maps (Neighborhood Map: $+1$ hr; Borough Map: $+2$ hrs) or Complication table events (Wandering Merchant: $+1$ hr) are added into the training pool (`totalEarnedHours`) without consuming additional floor hours.
  - For example, grinding for 6 hours with a Neighborhood Map accrues 7 training hours into the banked pool, but consumes only 6 floor hours on the global clock.
- **Grinding Chat Card Reporting**:
  - Session chat cards clearly display the floor timer impact: `Floor Timer Decremented: -X hrs (Remaining: Y hrs)`.
- **Automated Test Suite**:
  - Added test suite `9. Global Floor Timer Clock & Non-Bonus Hours Decrementing` to `tests/grinding.test.mjs`.
  - 100% test pass rate across 101 suites (631 tests passing, 0 failures).

## 2.0.56

### Grinding Fatigue & Resting Recovery Verification

- **Grinding Endurance Fatigue Mechanics**:
  - Re-affirmed and strictly unified extended grinding fatigue checks with the canonical **Fatigued** debuff (`type: "debuff"`, `severity: "Minor"`, `icons/conditions/fatigued.webp`).
  - Failing an Unopposed Endurance Check ($1d20 + \text{Rank} + \text{CON Mod}$) for grinding beyond the daily safe threshold directly applies the stackable **Fatigued** debuff ($-1$ penalty on all Checks, Move speed halved).
- **Resting Recovery Validation**:
  - Verified that an **8-Hour Safe Room Long Rest** (`rest('long')`) completely restores all 10 Health Bars, refills all Mana, and removes all stacked **Fatigued** debuffs.
  - Verified that a **30-Hour Full Day Rest** (`rest('fullDay')`) restores all Health Bars, refills Mana, removes all stacked **Fatigued** debuffs, and cures all injuries (*Minor*, *Major*, and *Long-Term*).
  - Verified that short rests (2-hour) and non-combat rests (1-hour) restore partial HP and Mana but do not clear lingering fatigue.
- **Compendium Packaging**:
  - Maintained canonical compendium dataset integrity in `carl-rpg.buffs` with 32 canonical buffs and 30 canonical debuffs (62 total documents).
- **Automated Test Suite**:
  - Expanded `tests/grinding.test.mjs` with comprehensive assertions covering Endurance check failures, debuff stacking, short rest retention, 8-hour long rest removal, and 30-hour full day rest recovery.
  - 100% test pass rate across 100 suites with 628 automated unit tests.

## 2.0.55

### Persistent Banked Hours, Multi-Skill Grinding & Complication Bonus Hours

- **Persistent Banked Hours Across Grinds**:
  - Unspent grinding hours are persistently saved in the crawler's banked hours pool (`system.details.bankedGrindHours`), carrying over from session to session.
  - Skills track **Invested Hours** persistently (`system.investedHours`), allowing higher-level skills (e.g. Rank 14 &rarr; 15 requiring 14 hours) to accumulate hours across multiple grinding days without loss.
- **Simultaneous Multi-Skill Grinding**:
  - Crawlers can now divide and allocate their earned and banked hours across **multiple skills simultaneously** within a single session.
  - Dedicated per-skill allocation controls (`-1`, `+1`, `Fill / Max`) let players distribute hours with a single click.
- **Grinding Complication Bonus Hours**:
  - Encountering helpful events on the 1d20 Complications table (e.g. roll 18–19 *Wandering Merchant / Helpful Guide*) grants **+1 Bonus Hour** added directly to the crawler's available pool.
- **Interactive Grinding Hub (`DCCGrindApp`) Streamlining**:
  - Executing a grind no longer abruptly closes the app; it immediately deposits earned and bonus hours into the visible pool, renders an event notification banner, and allows players to allocate hours and trigger advancements immediately.
  - Individual skill progress bars display current investment vs requirement (e.g. `10 / 14 hrs`).
  - Glowing **Advance (d20 &ge; Target)** action buttons appear as soon as a skill banks sufficient hours.
- **Actor Document Methods**:
  - Implemented `actor.allocateGrindHours(skillId, hours)` for safe two-way transfers between the actor pool and skill items.
  - Implemented `actor.attemptSkillAdvancement(skillId)` for rolling advancement checks, upgrading rank, clearing checked status, and generating celebratory chat cards.
- **Verification**:
  - Added dedicated automated unit tests in `tests/grinding.test.mjs` verifying multi-session accumulation, multi-skill allocation, complication bonus hours, and pool transfers.
  - 100% test suite passing with 0 failures across 100 suites (627 tests passed).

## 2.0.54


### Grinding System — Neighborhood & Borough Map Safe Hour Bonuses

- **Area Map Modifiers for Grinding**:
  - Implemented the option to add **+1 Safe Hour** for having a **Neighborhood Map**.
  - Implemented the option to add **+2 Safe Hours** for having a **Borough Map** (including spelling alias *Burrough Map*).
  - Stacking: Area maps stack with Guide Insight (e.g. Huey / Bob), enabling crawlers with both to safely grind for up to 8 hours daily with 0 exhaustion checks.
- **Interactive Grinding Hub (`DCCGrindApp`)**:
  - Added dedicated **Area Map** dropdown in the session setup: `[No Map (+0 hrs), Neighborhood Map (+1 Safe Hr), Borough Map (+2 Safe Hrs)]`.
  - Added smart **Inventory Auto-Detection**: automatically inspects the actor's inventory items on initialization and defaults to the highest available map held by the crawler.
  - Dynamically updates the Safe Limit status badge with breakdown tags (`Base 5h + 1h Guide + 2h Map`).
- **Actor Engine (`actor.grindSession`) & Grinding Data**:
  - Added `getSafeGrindingThreshold()` helper in `src/data/grinding.mjs`.
  - Updated `actor.grindSession(options)` to accept `mapType`, `mapBonus`, `hasNeighborhoodMap`, and `hasBoroughMap` / `hasBurroughMap`.
  - Embeds map modifier badges in the generated LitRPG chat cards and system flags.
- **Verification**:
  - Added automated unit tests in `tests/grinding.test.mjs` verifying safe thresholds, excess hour calculations, inventory auto-detection, and chat reporting across all combinations.
  - 100% test suite passing with 0 failures across 99 suites (620 tests passed).

## 2.0.53


### Resting Subsystem & Page 1 Health Bar Integration

- **Rest Action Buttons by Health Total (Page 1)**:
  - Moved the Safe Room Rest from Page 3 into a dedicated, high-visibility resting group (`.dcc-rest-buttons-group`) directly beside the Health total on Page 1 Core.
  - Added 4 interactive rest buttons with tooltips, confirmation dialogs, and color-coded Oswald pill styling:
    - **1h Non-Combat Rest** (`.dcc-rest-btn[data-rest-type="1hour"]`): Recovers 1 Health Bar slot (+CON Mod HP, capped at max HP) and +5 Mana.
    - **2h Short Rest** (`.dcc-rest-btn[data-rest-type="short"]`): Recovers 5 Health Bar slots (+5 × CON Mod HP, capped at max HP) and half Mana regeneration rounded down (`floor(Max Mana / 2)`). Clears short rest conditions (such as *Minor Injury*).
    - **8h Safe Room Long Rest** (`.dcc-rest-btn[data-rest-type="long"]`): Fully restores all 10 Health Bars to 100%, refilled Mana reserves to maximum, and clears all stacked *Fatigued* debuffs and long rest conditions.
    - **30h Full Day Rest** (`.dcc-rest-btn[data-rest-type="fullDay"]`): Complete 30-hour canonical Dungeon Day rest. Restores full Health and Mana, clears fatigue, and recovers from all Injuries (*Minor Injury*, *Major Injury*, *Long-Term Minor Injury*, *Long-Term Major Injury*, broken limbs).
- **Actor Document Unified Rest Engine**:
  - Implemented `actor.rest(restType, options)` handling all 4 rest durations with automated Health and Mana capping, condition removals, and rich LitRPG chat cards.
  - Retained `actor.restSafeRoom(options)` as backward-compatible wrapper delegating to `this.rest('long', options)`.
- **Character Sheet Context**:
  - Attached `context.hpPerBar` and `context.fiveHpBars` in `DCCCrawlerSheet.getData()`.
- **Verification**:
  - Added comprehensive automated unit tests in `tests/grinding.test.mjs` validating all 4 rest types, slot calculations, mana scaling, condition removals, and sheet data binding.
  - 100% test suite passing with 0 failures across 99 suites (612 tests passed).

## 2.0.52

### Grinding, Skill Advancement & Downtime System

- **Comprehensive Grinding Mechanics**:
  - Implemented the official Renegade Game Studios CarlRPG grinding rules:
    - 5-Hour safe daily grinding limit with 0 exhaustion checks.
    - Extended grinding (> 5 hours) requires an Unopposed Endurance Check ($1d20 + \text{Modified Rank} + \text{CON Mod}$ vs $10 + \text{Floor Number} + \text{Hours Past Safe Limit}$).
    - Failing the Endurance check inflicts the canonical stackable **Fatigued Debuff** (`-1 penalty on all Checks and Move halved. Stackable. Until the end of a long rest.`).
    - Full synergy with Endurance skill perks: Rank 5 (ignore Major Failures), Rank 10 (roll with Advantage if not already Fatigued), Rank 15 (convert Critical Failures to Standard Failures).
    - Guide bonuses (e.g. Huey / Bob) increase the daily safe grinding threshold to 6 hours at no penalty.
- **Skill Advancement Cycle**:
  - Use-Marking: Any skill rolled via `actor.rollSkill(skill)` or `actor.rollAttack(attack)` is automatically marked as **Checked** (`system.checked: true`).
  - Investment Requirement: Allocating grinding hours equal to the skill's current rank ($\text{Hours} = \text{Current Rank}$).
  - Advancement Check: Rolling $1d20 \ge \text{Current Rank}$ permanently increases the skill rank by +1 and clears the `checked` flag; failures retain current rank for future practice.
- **Dedicated Interactive Application (`DCCGrindApp`)**:
  - Modal app featuring duration slider/inputs, guide insight toggles, dynamic excess hours/fatigue warnings, focus skill selection with required hours and targets, and complication rollers.
  - Automatically posts immersive LitRPG chat cards recording hours spent, Floor Collapse Clock advancement (+X hrs), Endurance check details, and skill promotions.
- **1d20 Grinding Complications Table**:
  - Integrated 9 discrete complication tiers: Bugaboo Scout Ambush, Janitor Mob Infestation (Pack Rats / Brindle Grubs), Labyrinthine Dead End / Trap, Equipment Wear, Rival Crawlers, Clean Grind, Scavenged Junk, Wandering Merchant/Guide, and AI-Approved Carnage (Loot Box Award).
- **Safe Room 8-Hour Long Rest (`actor.restSafeRoom()`)**:
  - Fully heals all 10 CON-mod health bars to 100%, refilled Mana reserves, and deletes all stacked `Fatigued` debuffs.
- **Character Sheet Integration**:
  - Page 3 (Skills) features a **Used** checkbox column, a quick **Grind** button for checked skills, and header action buttons for **Grind Hub** and **Safe Room Rest**.
- **Verification**:
  - Created automated test suite in `tests/grinding.test.mjs` (19 tests) verifying progression formulas, safe limits, guide bonuses, endurance rolls, fatigue applications, skill advancements, auto-use checking, Safe Room rests, and app data binding.
  - 100% test suite passing with 0 failures across 99 suites (607 tests passed).

## 2.0.51

### Optional Damage Effects Subsystem for Attacks & Hand-to-Hand Skills

- **Interactive Damage Effect Selection Before Rolling**:
  - Attack rolls (`rollAttack` to-hit and direct damage rolls) now offer the user a choice of valid damage effects before rolling whenever the attack or skill supports them.
  - Implemented `promptDamageEffectDialog(attackItem, options)` displaying an interactive dialog with radio choices, descriptions, rank badges (if owned), and AI Favor notes.
  - Users can select **"No Damage Effect"** or any valid damage effect, or click Cancel to abort the roll.
- **Canonical Hand-to-Hand Skills Support**:
  - **Pugilism**: Choose from *Dirty Fighting*, *Iron Punch*, or *Powerful Strike*. Choosing "No Damage Effect" grants **+2 AI Favor** on hit.
  - **Noggin Knocker**: Choose from *Skullcracker* or *Powerful Strike*. Choosing "No Damage Effect" grants **+1 AI Favor** on hit.
  - **Wrasslin**: Choose from *Choke Out*, *Dirty Fighting*, or *Toss*. Choosing "No Damage Effect" grants **+1 AI Favor** on hit.
  - **Foot Soldier**: Choose from *Powerful Strike* or *Smush*. Choosing "No Damage Effect" grants **+1 AI Favor** on hit.
- **Custom User-Defined Optional Damage Effects on Any Attack**:
  - Added `system.optionalEffects` and `system.selectedEffect` to the `attack` item schema in `template.json`.
  - Attack item sheet (`attack.hbs` and `item-sheet.mjs`) provides an input field for optional damage effects and 4 quick preset buttons: `[+ Pugilism]`, `[+ Noggin Knocker]`, `[+ Wrasslin]`, `[+ Foot Soldier]`.
  - Discovers custom effects defined on attack items or linked skills, allowing any weapon or attack to have optional damage effects.
- **Character Sheet Quick-Select Dropdown**:
  - The attacks table on Page 1 now includes a dropdown selector (`.attack-damage-effect-select`) in the Effects column for any attack with optional effects, allowing crawlers to view and pre-select their active effect directly on the character sheet.
- **Chat Card Continuity & Damage Calculation**:
  - Hit roll chat cards embed `data-damage-effect="${chosenEffect}"` into the "Roll Attack Damage" button so clicking it carries the chosen effect into the damage roll without re-prompting.
  - Chat card banners, flavor text, and flags record the active `damageEffect` and `aiFavorBonus`.
  - Accurately computes effect formulas: Iron Punch (+1d2 base damage and Rank die at R5+), Powerful Strike (multiplies base dice by rank), Skullcracker (+1d4 base damage, rank die at R10+), Toss (+1d8 Bludgeoning + Str mod), Smush/Choke Out (2x multiplier).
- **Verification**:
  - Created automated test suite in `tests/attack-damage-effects.test.mjs` validating canonical effect discovery, custom effects, dialog prompting, cancellation, damage calculation, chat button continuity, and sheet display.
  - 100% test suite passing with 0 failures across 92 suites (588 tests passed).

## 2.0.50

### Buffs & Debuffs Compendium Population & Build Fix

- **Compendium Auto-Population & Self-Healing**:
  - Resolved an issue where the `carl-rpg.buffs` compendium displayed as empty in Foundry VTT.
  - Added self-healing auto-population for `carl-rpg.buffs` (and `carl-rpg.mobs`) in the `ready` hook in `src/dcc.mjs`. If the compendium is empty on world start, the system automatically unlocks, imports all 32 canonical buffs and 30 canonical debuffs (`DCC_BUFFS` and `DCC_DEBUFFS`), and restores pack lock status.
- **LevelDB Compaction & Schema Completeness**:
  - Enhanced `scripts/build-packs.mjs` to call `await db.compactRange('', '\uffff');` prior to closing LevelDB instances, ensuring small packs (like buffs and debuffs) flush the write-ahead log directly into SSTable `.ldb` data tables without relying on lazy compaction.
  - Enriched `buildBuffs()` in `scripts/build-packs.mjs` with full schema mappings (`damageMultiplier`, `statModifiers`, `damageModifiers`, `system` defaults).
  - Rebuilt all system compendium packs (`packs/buffs`, `packs/mobs`, `packs/skills`, `packs/spells`, `packs/macros`, `packs/items`).
- **Verification**:
  - Added compendium population and disk structure verification tests in `tests/buffs.test.mjs`.
  - Added `MockActor.createDocuments` and `MockItem.createDocuments` to `tests/setup.mjs`.
  - 100% test suite passing with 0 failures across 91 suites (581 passed).

## 2.0.49

### Attacks Section Scroll Navigation on Stowed Attacks Toggle

- **Preserve Attack Section Visibility**:
  - Fixed an issue where clicking the `Stowed (N)` button (`.toggle-stowed-attacks-view`) to show or hide stowed attacks re-rendered the sheet and lost the attacks section below the fold.
  - Implemented `_scrollToAttacksSection` in `DCCCrawlerSheet` to automatically locate and smoothly scroll the sheet container (`.sheet-body`) back to the attacks section (`.dcc-attacks-section` / `[data-section="attacks"]`).
  - Added `scrollY: ['.sheet-body']` to `defaultOptions` and hooked into `render`, `activateListeners`, and `_restoreScrollPositions` to prevent stale scroll positions from overriding the view when stowed attacks are shown or hidden.
- **Verification**:
  - Added unit test cases 8 and 9 to `tests/attack-equipment-integration.test.mjs` verifying flag handling, stale scroll position cache cleanup, immediate scrolling to target offsets, and scroll restoration safety.
  - 100% test suite passing with 0 failures across 91 suites.

## 2.0.48

### Public Notoriety: Boss Stars & Crawler Skulls System

- **Color-Coded Star Tiers by Boss Level**:
  - Implemented the official CarlRPG Boss Level hierarchy and color-coded star tiers:
    - **Bronze Star**: Neighborhood Boss (`#cd7f32`, warm bronze sheen)
    - **Silver Star**: Borough Boss (`#dcdde1`, polished steel silver)
    - **Gold Star**: City Boss (`#f1c40f`, radiant gold halo)
    - **Platinum Star**: Country Boss (`#00d2d3`, icy platinum cyan shimmer)
    - **Legendary Star**: Floor Boss (`#e67e22`, molten fiery flame pulse)
    - **Celestial Star**: Dungeon Boss (`#9b59b6`, cosmic violet prismatic aura)
  - Created `DCC_BOSS_TIERS` and `getBossTierFromClassification` in `src/documents/actor.mjs` for canonical classification mapping and normalization.
- **Crawler Skulls for PvP Kills**:
  - Crawlers receive visible bone-white skulls with dark crimson glow (`#ecf0f1` / `#c0392b`) next to their name for each fellow crawler they slay in the dungeon.
- **Public Visibility Across Foundry VTT**:
  - **Crawler Sheet Core Header**: Displays interactive badge strip (`{{{trophyBadges.html}}}`) beside Crawler Name on Page 1 Core.
  - **Trophy Room (Tab 6)**: Added full Public Notoriety Manager on Tab 6 with all 6 Star Tiers, Crawler Skulls, live increment/decrement adjustments, chronological kill logs, and 1-click **Record Boss Kill** and **Record Crawler Kill** dialogs.
  - **Combat Tracker**: Enhanced `DCCCombatTracker` and `templates/apps/combat-tracker.hbs` to render badge strips alongside crawler combatant names.
  - **Chat Message Headers**: Enhanced `onRenderChatMessage` in `src/dcc.mjs` to dynamically attach the crawler's star and skull badge strip to `.message-sender` headers on all attack rolls, spells, checks, and chat messages.
  - **Token Nameplates**: Formatted plain text unicode representations (`★` and `💀`) via `actor.getBadgeSummary().text`.
- **Automated Combat Lethal Damage Tracking**:
  - Wired `DCCCombatMetrics.applyDamageToTarget` (`src/apps/combat-metrics.mjs`) to detect lethal blows.
  - If a crawler deals lethal damage to a Boss Mob, `attackerActor.recordBossKill` is automatically triggered with the appropriate tier, updating counts and broadcasting a Dungeon AI announcement card.
  - If a crawler deals lethal damage to another crawler, `attackerActor.recordCrawlerKill` is triggered, updating skull counts and broadcasting a Dungeon AI announcement card.
- **Verification**:
  - Created automated test suite in `tests/boss-stars-and-skulls.test.mjs` testing tier hierarchy, classification mapping, `getBadgeSummary` formatting with multiple stars and skulls, manual and automated kill recording/deletion, combat metrics lethal blows, combat tracker enrichment, crawler sheet context, and chat message sender badge rendering.
  - Full test suite passes with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.47

### Fixed Health Bar Color Gradient Across Total Health Bars

- **Fixed Health Bar Color Gradient Anchoring**:
  - Resolved an issue where the health bar gradient compressed and shifted according to remaining health bars rather than total health bars, causing crawlers with only 1 remaining health bar to incorrectly show green at the end of their bar.
  - Sized `.dcc-health-fill-overlay` to `width: 100%` and `background-size: 100% 100%`, permanently anchoring the continuous linear gradient (`#d32f2f` red -> `#e65100` red-orange -> `#f57c00` orange -> `#fbc02d` yellow -> `#43a047` light green -> `#2e7d32` green) across the entire 100% width of the character's total health bar.
  - Implemented dynamic right-inset masking via `clip-path: inset(0 calc(100% - var(--hp-fill, 100%)) 0 0)` (with `@supports not` container-query `background-size: 100cqw 100%` fallback) so health unmasks left-to-right without compressing or shifting the underlying gradient.
  - Crawlers with 10 of 10 health bars (100% HP) fully unmask into the green, while crawlers with 1 of 10 health bars (10% HP) remain firmly and accurately in the red.
  - Added dynamic `grid-template-columns: repeat(var(--hp-segments, 10), 1fr)` and `repeat({{healthSegments.length}}, 1fr)` to `.dcc-health-segments`, ensuring mobs with variable health bar counts (e.g., 2 or 4 bars) properly divide and label their segments.
- **Verification**:
  - Expanded `tests/health.test.mjs` with comprehensive unit tests verifying gradient stylesheet architecture, `clip-path` inset calculations, total-bar mapping across 10/10 (green), 1/10 (red), 5/10 (yellow), and 0 (empty) states, and dynamic Handlebars template variables.
  - All 566 tests pass across 91 suites with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.46

### Buff Slot Deduplication & Automatic Fatal Debuff CON Stat Check

- **Strict Buff Slot Deduplication**:
  - A buff can no longer be assigned to multiple external buff slots simultaneously.
  - Implemented `_preventDuplicateExternalBuffs(changes)` on `DCCActor` (`src/documents/actor.mjs`). Whenever an external buff slot is updated to a buff already assigned in another slot, the previous slot is automatically cleared.
  - In `DCCCrawlerSheet._prepareContext` (`src/sheets/crawler-sheet.mjs`), dropdown options for external buff slots now disable buffs that are already assigned to other slots, appending `(Assigned in Slot X)` in the option label.
  - Quick-assign buttons (`1`, `2`, `3`) on Tab 4 smoothly reassign the buff to the targeted slot while clearing any prior slot.
- **Automatic CON Stat Check Before Fatal Debuff Damage**:
  - Implemented automatic survival checks for crawlers facing lethal end-of-round debuff damage.
  - If a debuff's round-end damage would drop a crawler to 0% on their Health Bar, an automatic **CON Stat Check vs. Difficulty 10 + Floor** (`1d20 + CON Mod`) executes immediately before fatal damage is applied. This check does not consume an action.
  - **On Success**: The debuff immediately ends (removed from the crawler), the crawler completely avoids the damage (preserving their health bars), and an automatic chat notification is generated.
  - **On Failure**: The fatal damage is applied normally, dropping the crawler.
  - Added `actor.checkFatalDebuffProtection(debuff, damageVal, options)` to `DCCActor` and integrated it into `DCCCombat.prototype.triggerRoundEndEffects`.
- **Verification**:
  - Extended `tests/buff-slot-assignment.test.mjs` with test cases verifying deduplication across slots, disabled select options, automatic CON Stat Check trigger at 10 + Floor DC, avoided damage and debuff deletion on success, and damage application on failure.
  - All 564 tests pass across 91 suites with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.45

### UI Contrast: High-Contrast Search Bar Font & Placeholder Styling

- **High-Contrast Font Color for Search Bars**:
  - Resolved poor font readability on white search bar backgrounds across applications.
  - In `styles/dcc.css`, explicitly configured `.dcc-sm-search` (Skill Library & Manager), `.spell-search-input` (Spell Library & Compendium), `.condition-search-input` (Buff & Condition Library), and `.dcc-picker-search` (Conditions Compendium Browser) with high-contrast text color (`#111111`, `#000000` on focus) against the white background (`#ffffff`).
  - Added explicit contrast styling for input placeholders (`::placeholder { color: #555555; opacity: 1; }`) ensuring placeholder prompt text is clearly legible without blending into the white field background.
  - Increased contrast on search icons (`.dcc-sm-search-icon` to `#333333`) and clear buttons (`.dcc-sm-search-clear`, `.spell-search-clear`, `.condition-search-clear` to `#555555` with red hover `#c0392b`).
- **Verification**:
  - Expanded `tests/search-box-focus.test.mjs` with automated assertions verifying high-contrast colors, placeholder styling, and template attributes across all search managers.
  - All 563 tests pass across 91 suites with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.44

### Character Sheet: Green Slot Number Indicators for Assigned Buffs & Active Effects

- **Green Slot Number Assignment Indicator in Character Buffs & Active Effects**:
  - In Tab 4 (Conditions & Effects) under the `CHARACTER BUFFS & ACTIVE EFFECTS` table, quick-assignment buttons for slots `1`, `2`, and `3` now display as vibrant green (`.is-assigned`, `#27ae60`) whenever that buff or active effect is assigned to the respective slot.
  - On Page 1 (Core) in the `EXTERNAL BUFFS (MAX 3)` / `Active Effects` panel, the slot number label (`.dcc-buff-num`) is highlighted in vivid green when that buff slot is active (`.dcc-buff-slot-entry.is-active`).
- **Toggle Slot Assignment**:
  - Clicking an already assigned slot button in the Buffs & Active Effects table unassigns the buff from that slot (toggles off), clearing the slot and removing the green indicator.
- **Context & State Preparation**:
  - `DCCCrawlerSheet._prepareContext` dynamically checks each buff against actor external buff slots (`buff1`, `buff2`, `buff3`) by ID or resolved name, decorating each buff with `isSlot1`, `isSlot2`, `isSlot3`, and `isAssignedToAnySlot` boolean flags.
- **Verification**:
  - Added test suite `tests/buff-slot-assignment.test.mjs` validating context matching, template class application, CSS green styling, and toggle assignment/unassignment.
  - All 561 tests pass across 90 suites with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.43

### UI & Search Subsystem: Focus & Cursor Retention Across Re-Renders

- **Application Focus & Cursor Preservation**:
  - Implemented `_saveFocusState()` and `_restoreFocusState()` in `DCCBaseApplication` (`src/apps/base-application.mjs`) and `DCCCrawlerSheet` (`src/sheets/crawler-sheet.mjs`).
  - Automatically captures the focused input/textarea selector, cursor positions (`selectionStart`, `selectionEnd`), and value prior to re-render, and restores focus and exact cursor placement immediately upon DOM replacement and listener activation.
- **Search Boxes No Longer Lose Focus When Typing**:
  - Resolved focus loss in `DCCSkillManager` (`.dcc-sm-search`), `DCCSpellManager` (`.spell-search-input`), and `DCCBuffDebuffManager` (`.condition-search-input`) where typing individual characters triggered a re-render and dropped focus to the window.
  - Users can now type continuously without interruption or having to re-click the search input.
- **Space & Case Preservation During Live Filtering**:
  - Saved raw user input strings in `rawSearchQuery` to prevent trailing spaces from being swallowed or capitalization altered while typing in search boxes, while preserving trimmed, lowercase matching for filter lookups.
- **UI Ergonomics & Quick-Clear Enhancements**:
  - Added dedicated clear-search button (`.dcc-sm-search-clear`) to `skill-manager.hbs` and adjusted input padding in `styles/dcc.css` to accommodate the clear icon.
  - Added `autofocus` attribute to spell and condition search inputs so dialogs are ready for immediate keyboard typing upon opening.
- **Verification**:
  - Created automated test suite `tests/search-box-focus.test.mjs` verifying selector capture, cursor retention, raw space preservation, mid-string typing placement, and clear refocusing.
  - All 554 tests pass with 0 failures across 90 test suites (`node --test tests/*.test.mjs`).

## 2.0.42

### Combat Subsystem: Automated End-of-Round Debuff Damage & Buff Healing

- **End-of-Round Automated Effects Trigger**:
  - `DCCCombat.prototype.nextRound()` and the Foundry `combatRound` hook automatically evaluate and trigger all active debuffs causing damage and all active buffs causing healing across combatants at the end of each round.
  - Implemented `DCCCombat.prototype.triggerRoundEndEffects(round)` with deduplication guards to ensure effects execute exactly once per completed combat round.
  - Generates an authentic Dungeon AI combat recap chat card summarizing all applied damage (with health bar losses and remaining HP) and healing across combatants.
- **Debuff Damage Per Round (`damagePerRound`)**:
  - Extended the `debuff` schema (`template.json`) and item sheet (`templates/items/parts/debuff.hbs`) with a dedicated `system.damagePerRound` input field.
  - Supports versatile expressions: flat values (`5`), dice expressions (`1d6`, `2d4`), health bar counts (`1 bar`), and floor-scaling variables (`1d10+F`, `1d8+F`) referencing the current dungeon floor.
  - Updated canonical debuffs (`Burned`: `1d10+F` Fire, `Poisoned`: `1d8+F` Poison, `Blood Trail`: `1d6+F` Bleed, `Drowning`: `1d6+F` Suffocation).
  - Damage resolution leverages `DCCCombatMetrics.applyDamageToTarget` with `ignoreDR: true` for internal DoTs while strictly honoring elemental resistances and immunities, as well as CarlRPG 10-bar health rules (excess damage within a bar does not spill over, only full bars removed).
- **Buff Healing Per Round (`healingPerRound`)**:
  - Extended the `buff` schema (`template.json`) and item sheet (`templates/items/parts/buff.hbs`) with `system.healingPerRound` and added `Healing / Regeneration` (`heal`) to `system.buffType`.
  - Automatically restores health to the bearer at round end, respecting bar increments and strictly capping at `maxHp`.
- **Crawler Sheet Visual Indicators**:
  - Updated `crawler-sheet.mjs` item summary generation so debuff chips display active DoTs (e.g. `1d8+F Poison DoT/rnd`) and buff chips display active regeneration (e.g. `+1d4 HP/rnd`).
- **Verification**:
  - Created automated test suite `tests/combat-round-effects.test.mjs` verifying schema support, formula evaluation, debuff damage triggering, buff healing capping at max HP, multi-combatant resolution, and round deduplication.
  - All 542 unit tests pass with 0 failures across 85 test suites (`node --test tests/*.test.mjs`).

## 2.0.41

### Skills & Spells Tab: Intuitive Deletion & Actions Column Polish

- **Skills List Deletion & Actions Column**:
  - Renamed the 9th column in the Skills table (`templates/actors/parts/page3-skills.hbs`) from `Roll` to `Actions`, and expanded its width to 14% with rebalanced column proportions to avoid horizontal overflow.
  - Added explicit, prominent `.item-delete` trash button with `data-item-id="{{skill.id}}"`, `data-tooltip="Delete Skill"`, `title="Delete Skill"`, and high-contrast red styling (`#c0392b`).
  - Added a descriptive `GEAR` badge with tooltip for gear-granted skills explaining they are derived from equipped items and can be removed by unequipping the corresponding item in Inventory.
- **Spells List Deletion & Actions Column**:
  - Rebalanced the column widths in the Spells table (`templates/actors/parts/spells.hbs`) to allocate a dedicated 18% width for the `Actions` column, preventing button wrapping or clipping.
  - Wrapped spell actions inside `.item-actions` and enhanced the `.item-delete` button with direct `data-item-id="{{spell.id}}"`, `data-tooltip="Delete Spell"`, and `title="Delete Spell"`.
- **Sheet Controller & Stylesheet Enhancements**:
  - Updated `crawler-sheet.mjs` `.item-delete` and `.item-edit` click listeners to support direct `data-item-id` attribute resolution alongside jQuery data cache and ancestor traversal, with automatic sheet re-render (`this.render(false)`).
  - Added unified `.item-actions`, `.item-delete`, and `.item-edit` styling rules in `styles/dcc.css` with hover scaling and color transitions.
- **Verification**:
  - Added unit tests in `tests/item-sorting-deletion.test.mjs` validating template Action headers, delete buttons, tooltips, and functional actor item deletion with reference cleanup across skills and spells.
  - All 534 tests pass with 0 failures across 84 test suites.

## 2.0.40

### UI & Styling: Unified Attack Equip / Stow Icon

- **Consistent Equip / Stow Action Icon**:
  - Updated the equip / stow action button icon in the character sheet's Page 1 Attacks table from `fa-crosshairs` to `fa-shield-halved` (`<i class="fa-solid fa-shield-halved" style="color: #c0392b;"></i>`).
  - Standardized the icon across both the active attacks row and the stowed attacks ready button to match the equipped gear toggle icon in Tab 2 (Equipment & Inventory).
- **Verification**:
  - Added unit test assertion in `tests/attack-equipment-integration.test.mjs` verifying the icon matches `fa-shield-halved`.
  - All 531 tests pass with 0 failures across 84 test suites.

## 2.0.39

### Test Suite Audit & Cleanup: Removal of Obsolete & Negative Regression Assertions

- **Removed Obsolete Tests & Negative Assertions**:
  - `tests/character-sheet-modern-tabs.test.mjs`: Removed assertions that verified the absence of the old 340px column width constraint and the absence of buffs/debuffs tables in `page4-inventory.hbs`.
  - `tests/scratch-off-item.test.mjs`: Removed negative template string assertion checking for an obsolete damage placeholder.
  - `tests/typed-damage.test.mjs`: Removed obsolete suite testing attacks without `damageParts` (legacy pre-multi-typed single dice damage format).
  - `tests/item-skill-modifiers.test.mjs`: Removed legacy tests verifying outdated object-formatted `skillModifiers` data structures.
- **Verification**:
  - All 531 remaining unit tests pass with 0 failures across 84 test suites (`node --test tests/*.test.mjs`).

## 2.0.38

### Attack & Weapon Equipment Integration: Hybrid Weapon Classification & Stowed Drawer

- **Hybrid Weapon & Attack Recognition**:
  - Equipping physical weapon gear (items in the `hands` / `holding` slots, items marked with `system.isWeapon: true`, or gear defining `damageParts`) automatically adds the weapon to the Page 1 Attacks table with calculated hit bonuses and damage.
  - Unequipping weapon gear removes it from the active Attacks table and places it into the expandable **Stowed Attacks & Weapons** drawer.
  - Dedicated attack items (`type: "attack"`) now support an `equipped` state (`system.equipped: boolean`, default `true`). Unequipping an attack moves it to the Stowed Attacks drawer.
- **Interactive Sheet Toggles & Stowed Drawer**:
  - Each attack row on Page 1 features a 1-click equipped toggle button (`.attack-toggle-equipped`).
  - Added an expandable Stowed drawer toggled via the `Stowed (N)` button in the Attacks table header (`.toggle-stowed-attacks-view`).
  - The drawer lists all stowed attacks and weapons with their damage and range, including a 1-click `[ Ready / Equip ]` button that immediately readies them back into the active Attacks table.
- **Left Action HUD & PDF Export Integration**:
  - The token Left Action HUD (`DCCCrawlerActionHUD`) automatically includes equipped weapon gear alongside equipped attacks, filtering out any stowed items.
  - PDF character sheet export respects equipped state, ensuring only active, equipped attacks occupy the exported attack slots.
- **Automated Verification**:
  - Added comprehensive test suite `tests/attack-equipment-integration.test.mjs` (7 test scenarios) verifying schemas, classification, sheet context preparation, click listeners, roll resolution, and HUD filtering.

## 2.0.37

### Scratch-off Ticket Outcome Enhancements: Conditional Random Table, Auto-Weights & Validation

- **Conditional Random Table Display**:
  - The Scratch-off Outcomes / Random Table builder is now strictly gated to only display when the item's Loot Type is set to `scratch_ticket` (`Scratch-off Ticket / Lottery`).
  - Standard consumable, treasure, quest, and crafting items keep their sheets clean and uncluttered without the scratch-off table.
  - Selecting "Scratch-off Ticket / Lottery" in `.loot-type-select` reactively reveals the table immediately.
- **Auto-Calculated Outcome Weights**:
  - When outcomes are added via `[ Add Outcome ]`, weights are automatically calculated and distributed evenly to sum to exactly **100%** (e.g., 1 outcome = 100%, 2 outcomes = 50%/50%, 3 outcomes = 34%/33%/33%, 4 outcomes = 25% each).
  - Deleting an outcome via `[ Delete ]` automatically re-balances remaining outcomes to sum to 100%.
  - Added a 1-click `[ Auto-balance to 100% ]` action button in the warning banner to instantly rebalance weights whenever needed.
- **Manual Overwrite & Summation Warning**:
  - Users can freely overwrite any calculated weight with custom values.
  - If the sum of all outcome weights does not equal 100%, the sheet renders an orange warning banner (`Total outcome weight is X% (summation must equal 100%)`) with the auto-balance shortcut, and `_updateObject` triggers a warning notification via `ui.notifications.warn`.
- **Strictly Numeric Weights Enforcement**:
  - Outcome weights cannot be set to non-numeric values.
  - The weight input enforces `type="number"` and `.outcome-weight-input` strips non-numeric characters in real time.
  - `prepareData()`, `prepareBaseData()`, `prepareDerivedData()`, and `_updateObject()` sanitize all weights to valid non-negative integers.
- **Automated Verification**:
  - Added unit test cases 15 through 18 in `tests/scratch-off-item.test.mjs`, validating:
    - Random table conditional visibility for `scratch_ticket` and exclusion for standard loot types.
    - Automatic even weight distribution on outcome addition, deletion, and auto-balance.
    - Manual overwrite preservation, UI warning banners, and `ui.notifications.warn` alerts when sum $\neq$ 100%.
    - Strict sanitization of non-numeric weights across document data preparation and sheet submission.

## 2.0.36

### Loot & Consumable Outcome Enhancements: Buff & Debuff Selection Without DMG

- **Buff & Debuff Selection in Outcome Table**:
  - When configuring a `loot` item's random outcome table with a `buff` outcome, the sheet renders an interactive dropdown allowing the user to choose from all existing canonical buffs (and world items). Selecting an existing buff populates the outcome name and description.
  - When configuring a `debuff` outcome, the sheet renders an interactive dropdown allowing the user to choose from all existing canonical debuffs (and world items). Selecting an existing debuff populates the outcome name and description.
- **Strict Omission of DMG Component for Buff and Debuff**:
  - Buff and Debuff outcomes strictly have **NO damage component**.
  - In `templates/items/parts/loot.hbs`, damage formula and damage type inputs are completely hidden and omitted when the outcome type is `buff` or `debuff`.
  - In `DCCItemSheet._prepareContext` and `_updateObject`, `damage` and `damageType` fields are sanitized and cleared to empty strings whenever outcome type is `buff` or `debuff`.
  - In `DCCItem.prototype.useLoot()`, buff and debuff outcomes bypass all damage evaluation, ensure `evaluatedDmg = 0`, exclude the `.dcc-damage-card` class, and omit all damage text or damage apply buttons from generated chat cards.
- **1-Click Apply Buff & Apply Debuff Chat Actions**:
  - Buff outcome cards render a 1-click `[ Apply Buff ]` action button (`.dcc-apply-buff-btn`) that applies the selected buff to the target crawler (assigning to an open external buff slot or adding an embedded buff item).
  - Debuff outcome cards render a 1-click `[ Apply Debuff ]` action button (`.dcc-apply-debuff-btn`) that inflicts the debuff condition as an embedded item directly onto target actor(s).
  - Added click listeners in `onRenderChatMessage` in `src/dcc.mjs` with smart target fallback prioritizing card `targetId` over arbitrary canvas selections.
- **Automated Verification**:
  - Added unit test cases 9 through 14 to `tests/scratch-off-item.test.mjs`, verifying:
    - Buff outcome has 0 damage, no damage card class, and renders apply buff button.
    - Debuff outcome has 0 damage, no damage card class, and renders apply debuff button.
    - `DCCItemSheet._prepareContext` populates available conditions and strips residual damage.
    - `DCCItemSheet._updateObject` sanitizes buff/debuff form data by clearing damage and damageType.
    - `onRenderChatMessage` click handlers successfully apply buffs and debuffs to target actors.
    - Template renders condition selectors and omits damage inputs for buff and debuff types.

## 2.0.35

### Consumable Items, Scratch-off Lottery Tickets & Items Compendium

- **Multi-Outcome Consumable & Scratch-off System (`LootDataModel`)**:
  - Enhanced `loot` item data model and schema in `template.json` and `src/models/items/loot-model.mjs` with `cooldown`, `lootType`, and `outcomes` array.
  - Added support for $N$-uses consumables (`system.quantity`) that automatically decrement on use and remove upon consuming the final charge.
  - Implemented scene-restricted cooldown enforcement (`system.cooldown: "Once per scene"`): prevents multiple uses within the same scene via item flag tracking (`carl-rpg.lastUsedScene`), automatically refreshing when moving to a new dungeon chamber.
  - Implemented weighted random outcome tables (`system.outcomes`): rolls across configured outcomes (e.g. 50% / 50%) on use.
  - Added canvas token target proximity detection (`targetType: "closest_mob"`): locates the closest alive hostile mob/NPC on the scene and calculates distance from the caster.
  - Evaluates DCC spell damage with crawler Int modifiers (`2d12 + Int Mod` Fire) and DCC rules reminders (Disadvantage to hit, Burned Debuff on $\ge 1$ Health Bar loss).
  - Evaluates DCC Health Bar healing (`healBars * hpPerBar`, where 1 Health Bar = CON modifier) for targets.
- **Interactive Chat Cards & Chat Action Listeners**:
  - Generates rich DCC-styled lottery scratch-off reveal cards in chat with outcome badges, quote/flavor descriptions, and mechanics breakdowns.
  - Added `.dcc-apply-healing-btn` chat listener in `src/dcc.mjs` to apply Health Bar healing directly to recipients, capped at maximum HP.
  - Enhanced `.dcc-apply-damage-btn` chat listener with automatic fallback targeting to target IDs identified by scratch-off cards.
- **Item Sheet Scratch-off Builder**:
  - Redesigned `templates/items/parts/loot.hbs` with quantity, cooldown, loot type dropdown, and an interactive outcome builder table with 1-click **Add Outcome** and **Delete Outcome** controls.
  - Handled array serialization cleanly in `DCCItemSheet._updateObject`.
- **Items & Loot Compendium Pack (`carl-rpg.items`)**:
  - Created `src/data/items.mjs` with `DCC_ITEMS` canonical dataset.
  - Registered `carl-rpg.items` compendium pack in `system.json`.
  - Added auto-population hook on startup in `src/dcc.mjs` and compendium compilation in `scripts/build-packs.mjs`.
  - Preloaded canonical items: **Normal Mana Potion** and **Scratch-off Ticket - Fireball or Custard** (6 uses, 1/scene, 50% Rank 5 Fireball vs 50% Custard Heal 5 Bars).
- **Automated Verification**:
  - Created `tests/scratch-off-item.test.mjs` verifying data model schemas, scene cooldown restrictions, quantity decrements, closest mob target detection, Fireball damage and Custard healing formulas, and canonical compendium items.

## 2.0.34

### Equipment & Inventory Tab Full-Width Stacked Layout

- **Stacked Layout for Tab 2 (Equipment & Inventory)**:
  - Moved the **Inventory & Backpack** table directly below the **Equipped Gear Slots** section, replacing the previous side-by-side fixed-width split columns.
  - Both sections now span the full width (100%) of the character sheet window, eliminating tight horizontal constraints and table crowding.
  - Formatted the Equipped Gear Slots with a clean responsive grid (`.dcc-gear-slots-grid`) that cleanly renders gear slots across two columns with the 10 Accessories spanning the full width across the bottom.
  - Backpack item table now utilizes the entire sheet width for item names, bonus summaries, quantities, and item notes.
- **Automated Verification**:
  - Updated `tests/character-sheet-modern-tabs.test.mjs` to verify DOM order (Equipped Gear Slots preceding Inventory & Backpack), removal of legacy fixed-width column constraints, and presence of full-width container and grid CSS classes.

## 2.0.33

### West Marches Named Party Selection & Creation in PPSM

- **Default Tracked-Only Roster Display**:
  - The Party Progression and Session Manager (PPSM) now defaults to `trackedOnly: true`. Untracked crawlers from other parties or inactive groups are hidden automatically, keeping the session roster clean and focused.
  - Added empty state notice in the crawler grid when no tracked crawlers exist for the active party filter with quick buttons to create a party or manage the roster.
- **Party Dropdown Active Roster Selection**:
  - Selecting a named party in the PPSM **Party** dropdown immediately sets that party as active, tracking all member crawlers in `session.trackedCrawlerIds` and unselecting/untracking all others.
  - Selecting *All Parties* tracks all world crawlers, while *Unassigned* tracks crawlers without a party affiliation.
- **`+ New Party` Dialog Integration**:
  - Added a dedicated **`+ New Party`** button on the Party Overview toolbar next to the Party dropdown.
  - Opens the interactive **Create / Define Named Party** modal dialog with party name text input (including existing party datalist autocomplete) and a full checkbox table of all world crawlers with current party affiliations and bulk **Select All** / **Deselect All** controls.
  - On submission: assigns the party name to all checked crawlers (`system.details.party`), sets them as the session's active tracked roster, updates the active party filter, and hides non-members.
- **Session Engine Enhancements**:
  - Added `DCCSessionEngine.assignPartyToCrawlers(partyName, actorIds)` for bulk party affiliation assignment across crawler actors.
  - Added `DCCSessionEngine.selectPartyForSession(sessionId, partyName)` to set active party and track only member crawlers.
  - Added `DCCSessionManagerApp.prototype.selectParty(partyName)` and `DCCSessionManagerApp.prototype.promptCreatePartyDialog()`.
  - Bulk party select in **Manage Roster Dialog** automatically deselects non-party crawlers when choosing a party.
- **Automated Verification**:
  - Added subtest 12 to `tests/session-manager.test.mjs` verifying default tracked-only view model, named party dropdown tracking, multi-crawler untracking, promptCreatePartyDialog execution, actor party affiliation persistence, and session roster synchronization.

## 2.0.32

### Crawler Token Selection Action HUDs (Hotbar & Left Action Panel)

- **Crawler Token Hotbar HUD**:
  - Automatically activates and displays directly above Foundry's macro bar (`#hotbar`) whenever a crawler token is selected on the canvas.
  - Renders all 10 hotbar slots from the crawler's character sheet hotlist (`actor.system.hotlist`).
  - Full item actions matching character sheet capabilities:
    - **Attacks**: One-click **Hit** (attack roll vs target evade) and **Dmg** (damage packet breakdown).
    - **Spells**: One-click **Cast** (mana cost verification & deduction) and **Dmg** (scaled spell damage).
    - **Gear**: One-click **Equip / Unequip** toggle updating item equipped status.
    - **Loot / Items**: One-click **Use** for consumables, potions, and inventory items.
    - **Skills**: One-click **Hit / Dmg** for combat skills or **Roll** for utility skills.
    - **Drag & Drop Assignment**: Drag any item from compendium or sheet directly onto a slot to assign it.
    - **Slot Clear**: Quick clear button on populated slots.
    - **Collapsible**: Header bar with crawler name and toggle button to minimize or expand.
- **Left Action Panel HUD (Attacks & Non-Passive Skills)**:
  - Automatically activates on the left of the screen, dynamically docked directly below the Scene Navigation bar (`#navigation` / `#scene-list`).
  - **Attacks Section**: Lists all attacks configured on the crawler with item icon, name, damage formula, and immediate **Hit** and **Dmg** action buttons.
  - **Active Skills Section**: Automatically gathers all non-passive skills on the crawler with rank and stat modifier, providing **Check / Hit** and **Dmg** buttons for combat skills and **Roll** buttons for active skills.
  - **Passive Skill Filter**: Automatically filters out passive skills (skills marked with `category: "Passive"`, `checkType` containing "passive" or "no roll", or `skillType: "Passive"`).
  - **Dynamic Positioning & Resizing**: Listens to Scene Navigation rendering and window resize events to ensure the panel always docks cleanly directly below the scene list.
  - **Collapsible**: Toggle button to collapse to header bar for maximum canvas visibility.
- **Master Lifecycle Controller (`DCCCrawlerTokenHUD`)**:
  - Centralized hook integration responding to `controlToken`, `updateActor`, `createItem`, `updateItem`, `deleteItem`, `deleteToken`, and `canvasReady`.
  - Automatically activates when selecting a crawler token and closes when selecting a non-crawler token (mobs, vehicles, NPCs) or clearing selection.
  - Real-time reactivity: updates immediately when actor stats, inventory, equipment, or hotlist change without requiring re-selection.
- **Developer Access**:
  - Exposed on `window.carl.tokenHUD`, `window.carl.openHotbarHUD(actor, token)`, and `window.carl.openActionHUD(actor, token)`.
- **Automated Verification**:
  - Added comprehensive test suite in `tests/crawler-token-hud.test.mjs` verifying template preloading, passive skill discrimination, hotbar slot resolution, action triggers, attack/skill separation, token selection lifecycle, reactive updates, and position calculation.

## 2.0.31

### Canonical Table 11 Debuffs Compendium Synchronization

- **Table 11 Canonical Debuffs Validation & Synchronization**:
  - Validated and updated all debuffs against Table 11 of the Dungeon Crawler Carl Roleplaying Game rulebook.
  - **14 New Canonical Debuffs Added**:
    - `Blinded`: Roll all Skill Checks requiring sight with Disadvantage (Until end of next round).
    - `Blood Trail`: Take 1d6+F at end of each round, stackable (Until cured with bandage or First Aid check).
    - `Drowning`: Take 1d6+F damage at end of each round (Until head is above water).
    - `Dying`: At 0% HB, countdown value of Con Mod rounds before death; taking damage subtracts 1 from countdown (Until death or heal 1+ HB slot).
    - `Enraged`: Extreme uncontrolled fury, may only perform Attack and Move Actions (Until end of 2 rounds or 20s).
    - `Fatigued`: −1 penalty on all Checks, Move speed halved, stackable (Until end of long rest).
    - `Long-Term Major Injury`: −5 penalty to all Checks (Until end of full day of rest).
    - `Long-Term Minor Injury`: −2 penalty to all Checks (Until end of long rest).
    - `Paralyzed`: Can't take any Actions (Until end of next round).
    - `Sepsis`: Staggered and take 1d10+F Poison damage at end of each round (As Staggered, damage continues until healed).
    - `Shit-Faced`: Make all Checks with Disadvantage (Until end of 10 minutes).
    - `Staggered`: Next Action cannot be Move, Attack check made with Disadvantage, cannot take 10ft Step (At end of next Action).
    - `Take Down`: Fall prone; all attacks against you made with Advantage (Use 10ft Step to stand).
    - `Terrified`: Cannot take Move Actions or 10ft Steps; all Attacks made with Disadvantage (Until end of next round or take 1+ HB slot damage).
  - **13 Existing Debuffs Updated to Exact Table 11 Effects & Durations**:
    - `Burned`: 1d10+F Fire damage at end of each round (Until end of combat or 5 min; Dex check to extinguish).
    - `Held`: Actively held, cannot Move or Step, twist body to Evade, attacks against Held foe made with Advantage (Until released or Str-Opposed Escape Artist check).
    - `Major Injury`: −5 penalty to all Checks; gaining a second time changes to Long-Term Major Injury (Until end of long rest).
    - `Minor Injury`: −2 penalty to all Checks; gaining a second time changes to Long-Term Minor Injury (Until end of short rest).
    - `Muted`: Cannot speak or cast Spells (Until end of combat or 5 min).
    - `Poisoned`: 1d8+F Poison damage at end of each round, stackable (Until treated with antidote).
    - `Queasy`: If next Action requires a roll, made with Disadvantage (At end of next Action).
    - `Shocked`: Lose your next Action (Once you forfeit that Action).
    - `Sore as Shit`: −1 penalty to all rolls (Until end of 1 hour).
    - `Stiff Legs`: Cannot take 10ft Steps (Until end of combat or 5 min).
    - `Stunned`: Disadvantage on next Check (Once you make a Check).
    - `The Taint`: Cannot be healed (Until end of combat or 5 min).
    - `Woozy`: Cannot add Dex Mod to Attack or Evade Checks (Until end of next round).
  - **3 Unmatched Debuffs Preserved**:
    - Retained `Bleeding`, `Frozen`, and `Crippled` in the canonical compendium to support legacy items, monster traits, and physical status effects.
- **Compendium Build System Update (`scripts/build-packs.mjs`)**:
  - Updated `buildBuffs()` in `scripts/build-packs.mjs` to automatically compile both `DCC_BUFFS` and `DCC_DEBUFFS` into `packs/buffs` (32 buffs + 30 debuffs = 62 items).
- **Automated Verification**:
  - Expanded `tests/debuffs-management.test.mjs` to validate all 27 Table 11 debuffs, correct effect descriptions, durations, and preservation of unmatched debuffs.
  - All 500 unit tests passing with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.30

### Global Floor Setting, Mob Evade DC (Base + F), Automatic Target Hit Resolution & Non-Crawler Evade Button

- **Global World Floor Setting (`carl-rpg.currentFloor`)**:
  - Registered world setting `carl-rpg.currentFloor` (Number, default 1, min 1).
  - Exported `getCurrentFloor()` and `setCurrentFloor(floor)` helpers across `game.dcc`, `window.carl`, `CONFIG.DCC`, and `DCCActor`.
  - Added dedicated Floor selector dropdown (`#dcc-global-floor-select`, Floors 1 through 18) directly in the **Party Progression & Session Hub** (`DCCSessionManagerApp`) header controls.
  - Setting changes dynamically re-render open sheets and synchronize target DCs world-wide.
- **Mob Evade Difficulty Formula ($\text{Base} + F$)**:
  - Mob data models and document classes parse and calculate Evade difficulty as a base number plus current floor ($Base + F$).
  - Derives `effectiveEvadeDC = base + currentFloor` (e.g. base 14 becomes DC 15 on Floor 1, DC 18 on Floor 4).
  - Mob Page 1 Core character sheet dynamically displays the live effective DC `(DC X)` alongside the base statblock string.
  - Added `getEvadeTargetDC()` method on `DCCActor` for polymorphic DC resolution.
- **Automatic Attack Target Hit Resolution**:
  - `actor.rollAttack(item, ...)` and `actor.rollSpellAttack(item, ...)` automatically evaluate against all active targets (from roll options or `game.user.targets`).
  - Evaluates hit or miss: compares the attack total to target DC (mob Base $+ F$ or crawler Evade).
  - Automatically embeds a high-contrast **Target Evaluation** matrix in the attack chat card showing target names, target DCs, and visual `[HIT (+X)]` or `[MISS (-X)]` pills.
  - Stores full target resolution results in chat message flags (`flags['carl-rpg'].targetResults`).
- **Non-Crawler Attack Evade Button & Crawler Evade Rolls**:
  - Whenever an attack is rolled by a non-crawler (mob, boss, hostile NPC), the attack chat card embeds an interactive **Roll Evade** button (`.dcc-evade-roll-btn`).
  - Any player crawler clicking the button triggers `crawler.rollEvade({ attackTotal, attackerName, floor })`.
  - The crawler executes an official Evade roll ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$) against the attack total.
  - Generates an official chat card declaring `SUCCESSFULLY EVADED!` or `EVADE FAILED — HIT TAKEN!` with full roll formula and modifiers.
- **Automated Verification**:
  - Added test suite `tests/evade-and-floor.test.mjs` verifying global floor settings, mob evade base+F scaling, target hit evaluation, active target resolution from `game.user.targets`, non-crawler evade button insertion, and crawler rollEvade evaluation.
  - All 83 test suites passing with 0 failures (`node --test tests/*.test.mjs`).

## 2.0.29

### Party Progression & Session Manager Tracked Roster & Party Grouping

- **Crawler Party Affiliation System**:
  - Registered `party` property on Crawler actor schema (`system.details.party`) in `template.json` and `src/models/actors/crawler-model.mjs`.
  - Added editable `Party / Team` input in Crawler Sheet Page 1 Core header (`templates/actors/parts/page1-core.hbs`).
- **Selective Session Tracking & Isolated Metrics**:
  - Added `trackedCrawlerIds` and `party` parameters to `DCCSessionEngine.createSession(...)` and full support for tracked subsets.
  - Automatically isolates roll logging, combat damage, favor adjustments, popularity deltas, and loot box records to tracked crawlers only.
  - Session summaries (Total Damage Dealt, Damage Taken, Kills, Untrained Attempts, MVP, and Target of the Night) calculate exclusively from tracked participants.
  - End-of-session XP distribution strictly divides session XP among participating tracked crawlers.
  - Dungeon AI Performance Recap chat card summarizes only tracked crawlers.
- **Roster Controls & Filtering in DCCSessionManagerApp**:
  - **Quick Card Toggle**: Added 1-click `[Tracked]` / `[Untracked]` eye toggle button directly on crawler cards in the Party Matrix.
  - **Dimmed Visual State**: Untracked crawlers feature distinctive dimmed cards (`.dcc-crawler-card.untracked`) for clear visual hierarchy.
  - **Segmented View Filter**: Toggle between **Tracked Only** (default active squad) and **All Crawlers** view.
  - **Party Dropdown Filters**: Filter party matrix and activity ledger by specific party group or unassigned crawlers.
  - **Interactive Manage Roster Dialog (`promptManageRosterDialog`)**:
    - Accessible via `[Manage Roster]` button on the party matrix toolbar.
    - Features **Select All**, **Deselect All**, and **Select by Party** bulk operations.
    - Checkbox selection for precise crawler inclusion in the active session.
    - Inline party name editing to assign or reassign crawlers without opening individual character sheets.
- **Automated Verification**:
  - Added comprehensive test suite `11. Tracked Crawler Roster and Party Grouping Filtering` in `tests/session-manager.test.mjs`.
  - Full test suite passing with 0 failures across all 83 suites (`node --test tests/*.test.mjs`).

## 2.0.28

### Crawler Achievements Collection & Trophy Room Subsystem

- **Persistent Crawler Achievement Item Type (`achievement`)**:
  - Registered `"achievement"` as an official Item document type in `template.json` and `system.json`.
  - Schema includes trophy tier (`bronze`, `silver`, `gold`, `platinum`, `legendary`, `celestial`, `quest`, `secret`, `special`), floor number, date/session earned, Dungeon AI quote, reward granted, loot box contents, AI Favor bonus, and XP reward.
  - Added dedicated Item Sheet template partial `templates/items/parts/achievement.hbs` with input fields and a 1-click **Broadcast Announcement to Chat** button.
- **Dedicated Crawler Sheet Tab 6 ("6: Achievements")**:
  - Added a dedicated 6th tab to `DCCCrawlerSheet` (`templates/actors/parts/achievements.hbs`).
  - **Trophy Room Metrics**: High-contrast summary header displaying total unlocked achievements, cumulative AI Favor gained, and tier breakdown pills for Bronze, Silver, Gold, Platinum, Legendary, and Celestial trophies.
  - **Search & Filter Controls**: Client-side filtering by trophy tier and dynamic text search matching names, quotes, and rewards.
  - **DCC Achievement Cards**: Color-coded cards displaying tier badges, floor indicators, the signature Dungeon AI quote in red-bordered callout blocks, reward details, and actions to announce, edit, or delete.
  - Linked quick-status trophy counter badge into Tab 5 (Story & Sponsors) narrative header.
- **Canonical Achievements Library & Presets (`DCC_ACHIEVEMENTS`)**:
  - Defined ready-to-use canonical achievements from official adventures and CarlRPG lore in `src/data/achievements.mjs`:
    - *Where’d Ya Get Those Peepers?* (Passive Perception Quest, Bronze)
    - *Ding-Dong Ditch* (Surveillance Drone Destruction, Silver)
    - *You’ll Shoot Your Eye Out!* (Stiggy Defeat, Silver)
    - *Floor Combat MVP* (Combat Metrics, Gold)
    - *First Blood of the Desolation* (First kill, Bronze)
    - *Boss Annihilator* (Boss Slayer, Celestial)
    - *Fashion Disaster Survivor* (Fighting without pants, Bronze)
    - *Improvised Demolitions Expert* (Explosive hazards, Platinum)
    - *Sponsor's Little Darling* (Corporate sponsorship, Gold)
    - *Goblin Defenestration Specialist* (Throwing enemies off cliffs, Silver)
- **Interactive Achievement Manager & Trophy Room App (`DCCAchievementManagerApp`)**:
  - Built full manager application in `src/apps/achievement-manager.mjs` and `templates/apps/achievement-manager.hbs`.
  - **Canonical Library View**: Browse presets, filter by tier and text search, and award any achievement to a selected crawler with one click.
  - **Party Trophy Room View**: Inspect all achievements collected by the party in one aggregated screen.
  - Exposed via `game.dcc.achievementManager` and `window.carl.openAchievementManager()`.
- **Combat Metrics & Session Engine Integration**:
  - When awards or loot boxes are granted via `DCCCombatMetrics.dispatchAIAward(...)`, an embedded `achievement` item is automatically created on the recipient Crawler actor with quote, tier, and reward details.
  - `DCCSessionEngine.recordLootBox(...)` automatically persists an achievement item on the recipient actor, synchronizing session ledgers with the crawler's permanent trophy room.
- **Dungeon AI Chat Announcements**:
  - Implemented `actor.announceAchievement(item)` and `item.announce()`, generating styled Dungeon AI chat cards with AI speaker alias, sound/flair, and rewards.
- **Automated Verification**:
  - Created `tests/achievements.test.mjs` covering schema validation, canonical library integrity, document methods, sheet calculations, combat metrics persistence, session engine sync, and manager app workflows.
  - All 488 tests passing with 0 failures across all 83 suites (`node --test tests/*.test.mjs`).

## 2.0.27

### Mob Embedded Attacks, Spells & LevelDB Sublevel Hydration Fix

- **Embedded Items Sublevel Hydration in LevelDB (`packs/mobs`)**:
  - Diagnosed and resolved issue where mobs opened from the `carl-rpg.mobs` compendium pack were missing attacks, spells, and loot in Foundry VTT v12.
  - Resolved root cause: In Foundry VTT v12's `expandEmbedded` architecture for Actor compendiums, the primary actor record in `!actors!${actorId}` must store `items` as an array of item IDs (`[itemId1, itemId2, ...]`), while the item documents themselves must be stored in the sublevel `actors.items` under key `${actorId}.${itemId}` (raw key `!actors.items!${actorId}.${itemId}`).
  - Updated `scripts/build-packs.mjs` (`buildMobs`) to correctly separate actor records and store all 381 embedded items across the 84 mobs into the `actors.items` sublevel.
- **Spellcaster Mobs Defined & Enriched with Spells & Mana Pools**:
  - Defined and assigned authentic `type: "spell"` items and mana attributes to all 16 spellcaster mobs from the *Game Master's Campaign Toolkit*:
    - *Dread Wizard Grimblegore*: Fireball (2d12 Fire, 20 MP), Gloat (2d6 Sonic, 10 MP), Jump Smash (3d6 Bludgeoning), Staff Strike. Mana pool: 60/60.
    - *Rat Shaman*: Rat Swarm Summon (2d6 Piercing, 15 MP), Grime Curse (1d8 Necrotic, 10 MP), Rotten Staff. Mana pool: 40/40.
    - *Rat Hooligan*: Cheese Curse (1d6 Acid, 10 MP), Rusty Shiv, Brick Toss. Mana pool: 20/20.
    - *Goblin Shamanka*: Hex of Misfortune (2d8 Psychic, 15 MP), Grime Bolt (1d10 Acid, 10 MP), Ritual Dagger. Mana pool: 45/45.
    - *Wise-Guyy Crawler*: Eldritch Blast (2d10 Force, 10 MP), Arcane Shield (5 MP), Punch. Mana pool: 50/50.
    - *Prosperity Prophet*: Coin Barrage (3d10 Bludgeoning, 25 MP), Golden Smite (2d12 Radiant, 20 MP), Golden Scepter. Mana pool: 80/80.
    - *Mind Horror*: Psychic Scream (3d8 Psychic, 20 MP), Mind Flay (2d10 Psychic, 15 MP), Tentacle Flail. Mana pool: 75/75.
    - *Rakish Werehound Shocker*: Shocking Howl (2d8 Lightning, 15 MP), Thunder Clap (2d6 Thunder, 10 MP), Shock Claws. Mana pool: 40/40.
    - *Laminak Manager*: Performance Review (2d8 Psychic, 15 MP), Demotion Curse (1d10 Necrotic, 10 MP), Clipboard Smack. Mana pool: 35/35.
    - *Rayzer*: Laser Barrage (2d10 Radiant, 20 MP), Overcharge Beam (3d8 Fire, 25 MP), Cyber Claw. Mana pool: 50/50.
    - *Troglodyte Virtuoso*: Discordant Screech (2d8 Thunder, 15 MP), Dirge of Despair (1d10 Psychic, 10 MP), Bone Flute Bash. Mana pool: 40/40.
    - *Goblin Bomb Bard*: Cacophony (2d8 Sonic, 15 MP), Pyrotechnic Blast (2d10 Fire, 20 MP), Bomb Toss. Mana pool: 45/45.
    - *Krakaren Clone*: Entropic Pulse (3d8 Force, 20 MP), Psionic Wave (2d10 Psychic, 15 MP), Tentacle Slam. Mana pool: 70/70.
    - *Beloved Mimic*: Deceptive Allure (2d8 Psychic, 15 MP), Pseudopod Slam, Devour. Mana pool: 50/50.
    - *Dream Eaters*: Nightmare Harvest (2d10 Psychic, 20 MP), Phantasmal Touch. Mana pool: 60/60.
    - *The Hoarder*: Arcane Surge (2d10 Force, 20 MP), Junk Barrage. Mana pool: 55/55.
  - Ensured all 84 mobs have at least one physical `type: "attack"` item (170 total attacks, 29 total spells, 182 loot items across the 84 mobs).
- **Actor Sheet UI Quick-Cast & Spells Display on Page 1**:
  - Updated `templates/actors/parts/page1-core.hbs` to render a dedicated **SPELLS & MAGIC** section on Page 1 (Core & Combat) whenever a mob actor has embedded spells (`{{#if spells.length}}`).
  - Provides instant 1-click Cast (`roll-spell`), Damage (`roll-spell-dmg`), MP cost badge, range, damage dice, and stat modifiers directly alongside Attacks.
- **Automated Verification**:
  - All 480 unit tests passing with 0 failures (`tests/*.test.mjs`).
  - Line coverage maintained at 93.77% across the entire codebase (exceeding ≥75% requirement on every file).

## 2.0.26

### Mob Compendium LevelDB Database Synchronization & Indexing Resolution

- **Mob Compendium Pack Recovery (`packs/mobs`)**:
  - Diagnosed and resolved empty LevelDB database issue where `packs/mobs` had 0 keys due to file locks during previous build.
  - Rebuilt LevelDB database with all 84 mobs/bosses/rival crawlers from the *Game Master's Campaign Toolkit* under the `!actors!` key space and `actors` sublevel.
  - Updated `scripts/build-packs.mjs` to dynamically load `systemVersion` from `system.json` for all compendium packs.
  - Verified compendium indexability and sublevel querying matching Foundry VTT v12 collection requirements.

## 2.0.25

### Official Game Master's Campaign Toolkit Mob Compendium Expansion (All 84 Entities)

- **Complete Page 3 Entity Compendium Integration (`carl-rpg.mobs`)**:
  - Added and updated all **84 canonical entities** from the official *Game Master's Campaign Toolkit* (Page 3: `MOBS, BOSSES, AND RIVAL CRAWLERS` index).
  - Populated complete statblocks, health bar segments, move speeds, DR armor, official CarlRPG ability modifiers, AI announcement broadcasts, lore descriptions, tactical notes, and source page citations across all entities:
    - **Floor 1 Entities**: *Gobblin’ Gators* (p. 18), *Gnawtria* (p. 18), *Rayzer* (p. 19), *Riff Roughers* (p. 19), *Scat Thug* (p. 20), *Trash Princess* (p. 21), *Hide-Hitter Crib Daddy* (p. 27), *Barflie* (p. 30), *Canidna* (p. 31), *Mirror Cat* (p. 31), *Homogenous Humors* (p. 32), *Pack Rat* (p. 32), *The Bar Render* (p. 37), *Chilly Goat* (p. 40), *Fire-Fighter* (p. 41), *Rat Brute* (p. 41, 62), *Rat Hooligan* (p. 42, 64), *Rat Shaman* (p. 42, 63), *MisChief* (p. 47), *Vine Creeper* (p. 50), *Bad Llama* (p. 51, 136), *Giant Spiders* (p. 51), *Literal Murder Hornets* (p. 52), *Slimy Croakers* (p. 52), *Aranaea Magnus* (p. 59), *Chef BoyardOoze* (p. 62), *Critical Consensus* (p. 69), *Shambling Acid Impaler* (p. 86), *Sprites* (p. 86), *Canis Knights* (p. 87), *Grimes* (p. 87), *Trollogs* (p. 88), *Dread Wizard Grimblegore* (p. 93), *Bugaboo Goblin-napper* (p. 128), *Bugaboo Socket-Picker* (p. 128), *Blind Goblin Survivor* (p. 129), *Screye Drone* (p. 129), *Melon-Baller Marvin* (p. 130), *Spit (Lives in the Now)* (p. 130), *Spat (Let Go of the Past)* (p. 131), and *Stiggy, Dungeon Surveillance Architect* (p. 135).
    - **Floor 2 Entities**: *Cocaine Kobold* (p. 96), *Danger Dingo* (p. 97), *Jacked Kangaroo* (p. 97), *Jazmanian Devil* (p. 98), *Whambat* (p. 98), *Mick Moran* (p. 103), *Brindle Grub* (p. 106, 139), *Cow-Tailed Brindle Grub* (p. 106, 139), *Brindled Vespa* (p. 107, 140), *Unvaccinated Clurichaun* (p. 107), *Laminak Manager* (p. 107), *Smombie* (p. 108), *Pickmees* (p. 109), *Krakaren Clone* (p. 115, 146), *Dream Eaters* (p. 118), *Lost Souls* (p. 119), *Mind Horror* (p. 119), *Troglodyte Basher* (p. 120, 142), and *Cardium Clam* (p. 125).
    - **Threat Appendix & Special Entities**: *Bruiser Crawler* (p. 136), *Wise-Guyy Crawler* (p. 136), *Goblin* (p. 136), *Goblin Bomb Bard* (p. 137), *Goblin Engineer* (p. 137), *Goblin Shamanka* (p. 137), *Rat Janitor* (p. 138), *Rot Sticker* (p. 138), *Scatterer* (p. 138), *Hissing Scatterer* (p. 139), *Scatterer Brood Guardian* (p. 139), *Kobold* (p. 140), *Kobold Rider* (p. 140), *Danger Dingo (Floor 2 Swarm)* (p. 141), *Rage Elemental* (p. 141), *Ball of Swine* (p. 142), *Troglodyte Pygmy* (p. 142), *Troglodyte Virtuoso* (p. 142), *The Hoarder* (p. 143), *Prosperity Prophet* (p. 144), *Beloved Mimic* (p. 145), *The Juicer* (p. 147), *Rakish Werehound Shocker* (p. 147), and *Ralph the Frenzied Gerbil* (p. 148).
- **Strict CarlRPG Mechanics & Rule Conformance**:
  - Variable health bars calculated from CON modifier (`getDCCStatModifier`), ranging from 1 to 23 bars.
  - Evade difficulty ($10 + \text{Foe DEX Mod} + \text{Floor Number}$) and Surprise difficulty ratings formatted as canonical `X+F`.
  - Zero D&D math, zero negative ability modifiers, zero saving throws or spell slots.
- **Embedded Loot Items & Multi-Typed Attacks**:
  - Every entity contains embedded, tailored `loot` items with custom SVG icons, quantities, descriptions, and lore notes.
  - All attacks modeled as embedded `attack` items with multi-typed damage, ranges, debuff triggers, and single-click roll actions.
- **LevelDB Compendium Build**:
  - Rebuilt binary `packs/mobs` LevelDB database containing all 84 actor documents with unlinked tokens and auto-configured prototype settings.
- **Automated Testing & Coverage**:
  - Extended `tests/mobs-compendium.test.mjs` to validate all 84 canonical entities and statistical profiles for major bosses.
  - 100% passing test suite (478 passing tests across 83 suites, 0 failures) and $\ge 75\%$ line coverage across all source files.

## 2.0.24

### Test Suite Evaluation, Automated Coverage Auditing, & High-Coverage Hardening

- **Test Evaluation & Cleanup**:
  - Removed obsolete and Foundry-core testing files:
    - Removed `tests/v13-namespacing.test.mjs` (tested Foundry core v13 global getter deprecation traps).
    - Removed `tests/sidebar-hooks.test.mjs` (tested Foundry core HTMLElement vs jQuery wrapper handling).
  - Cleaned obsolete negative-template checks across test suites:
    - Updated `tests/spells.test.mjs`, `tests/hotlist.test.mjs`, and `tests/debuffs-management.test.mjs` to eliminate stale checks referencing legacy removed template comments or partial inclusions.
- **Node.js Native Coverage Tooling**:
  - Established native V8 coverage reporting using Node.js built-in test runner:
    `node --test --experimental-test-coverage --test-coverage-include="src/**" tests/*.test.mjs`
  - Created automated audit script `scripts/coverage.mjs` (`npm run test:coverage`) that evaluates per-file line coverage against a strict $\ge 75\%$ threshold and outputs a status table.
- **Coverage Expansion to $\ge 75\%$ Across All Repository Modules**:
  - Added targeted test suites to bring every single module in `src/` to $\ge 75\%$ line coverage (overall codebase coverage now **91.34%** with 0 failing tests across 471 assertions):
    - `tests/mob-and-item-models-extended.test.mjs`: Raised `mob-model.mjs` from 18.10% to 100.00% and `documents/item.mjs` from 60.36% to 84.73%.
    - `tests/item-sheet-actions.test.mjs`: Raised `sheets/item-sheet.mjs` from 51.88% to 81.51%.
    - `tests/combat-archive-and-tracker-extended.test.mjs`: Raised `apps/combat-archive.mjs` from 38.13% to 78.09% and `apps/combat-tracker.mjs` from 48.16% to 75.18%.
    - `tests/managers-extended.test.mjs`: Raised `apps/buff-manager.mjs` from 67.01% to 97.57%, `apps/skill-manager.mjs` from 45.66% to 80.85%, `apps/spell-manager.mjs` from 52.99% to 85.75%, and `apps/crawler-creator.mjs` from 69.70% to 83.11%.
    - `tests/dcc-entry-extended.test.mjs`: Raised system entry point `src/dcc.mjs` from 55.44% to 76.97%.
- **Engine Reliability & Environment Hardening**:
  - Added safety checks for headless and Node.js testing environments in `src/apps/combat-tracker.mjs` (safely guards `typeof document !== 'undefined'`) and `tests/setup.mjs` (`MockDocumentSheet.isEditable = true`, chained jQuery mock, and async `Hooks.callAll` promise resolution).

## 2.0.23

### Character Sheet Modernization (Option A: 5-Tab Modern Layout)

- **Option A Clean 5-Tab Character Sheet Architecture**:
  - Restructured the Crawler character sheet into an intuitive 5-tab workflow:
    1. **Tab 1: Core & Combat** (`1: Core & Combat`): Vitals, Enhanced/Unenhanced Ability Scores, Health Bar, Mana, Evade & DR, Attacks, Active External Buff Slots (1–3), Active Debuffs chip summary, and 10-slot Hotlist.
    2. **Tab 2: Equipment & Inventory** (`2: Equipment & Inventory`): Consolidates equipped body slots (`Head`, `Torso`, `Arms`, `Hands/Holding`, `Legs`, `Feet`, `Accessories (Max 10)`) alongside physical backpack items (`Gear` and `Loot`). Includes equipped state badges, notes inputs, quantity editing, equip toggles, and item deletion. Buffs and debuffs have been completely removed from this tab.
    3. **Tab 3: Skills & Spells** (`3: Skills & Spells`): Unified abilities and magic center presenting combat/utility skills and the character spellbook in a single view with direct compendium pickers, roll buttons, damage calculations, and drag-and-drop reordering.
    4. **Tab 4: Conditions & Effects** (`4: Conditions & Effects`): Dedicated condition management hub tracking all character buffs, active effects, and debuffs with severity badges (`Minor`, `Moderate`, `Major`), duration tracking, and quick-assignment buttons (`1`, `2`, `3`) to directly assign buffs to External Buff slots 1–3.
    5. **Tab 5: Story & Sponsors** (`5: Story & Sponsors`): Consolidated narrative and crawler background (Popularity, Past Traumas with 1d12 roll button, Loose Ends with 1d12 roll button, Regrets with 1d12 roll button, Notes), Companions & Personal Space (Pet Companion, Mount/Vehicle, Personal Space, Deity/Patron), and Features & Sponsors (Racial Traits, Class Talents, Corporate Sponsors 1–3).
- **Controller & Event Handling**:
  - Added `.buff-assign-slot-btn` click handler in `DCCCrawlerSheet` (`src/sheets/crawler-sheet.mjs`) allowing players to assign any character-owned buff to External Buff slots `buff1`, `buff2`, or `buff3` with a single click and user notification.
- **Template Preloading & Styling**:
  - Registered `conditions.hbs` and `story-extras.hbs` in `loadTemplates` in `src/dcc.mjs`.
  - Added CSS rules in `styles/dcc.css` for `.dcc-slot-assign-btn-group`, `.buff-assign-slot-btn`, and tab container styling.
- **Full PDF Parity Maintained**:
  - 100% data schema compatibility preserved across all 6 pages of the official fillable PDF exporter (`src/apps/pdf-exporter.mjs`), ensuring AcroForm mappings for gear slots, story details, items, skills, and spells function without interruption.
- **Automated Test Coverage**:
  - Added `tests/character-sheet-modern-tabs.test.mjs` verifying tab structure, partial preloading, inventory gear slots consolidation, buff/debuff removal from inventory, conditions tab quick-assignment, and story details.
  - Verified 100% pass rate across all 457 unit tests in the repository.

## 2.0.22

### Custom Buff Option Selection & External Buff Prioritization

- **Single-Match External Buff Option Selection**:
  - Refactored `context.externalBuffSlots` option selection in `DCCCrawlerSheet` (`src/sheets/crawler-sheet.mjs`). Replaced uncoordinated multi-group mapping with strict single-match resolution that guarantees only ONE `<option selected>` exists across all dropdown optgroups.
  - Prioritizes character-owned buffs (`📦 Character Buffs`) over compendium defaults. When an actor creates a custom buff with the same name or type as a compendium buff (e.g. custom "Strength Buff" or "Strength +5" granting +5 STR), the character's owned buff is marked selected, preventing the compendium default `⚡ Strength Buff (+2 STR)` from overriding it in the DOM.
  - Implemented prioritized hierarchical resolution: (1) exact ID match with `resolvedBuff.id`, (2) exact ID match with `valStr`, (3) exact name match checking owned buffs before compendium options.
- **Custom Buff String Parsing & Regex Optimization**:
  - Optimized ability score regex parsing in `DCCActor.resolveBuff` (`src/documents/actor.mjs`). Placed full stat names (`strength`, `intelligence`, `constitution`, `dexterity`, `charisma`) ahead of 3-letter abbreviations (`str`, `int`, `con`, `dex`, `cha`) in alternation, and added support for postfixed values (e.g. `Strength +5`, `STR +5`, `Strength 5`).
- **Condition Library Character Buff Discovery**:
  - Extended `DCCBuffDebuffManager.getUnifiedConditions` (`src/apps/buff-manager.mjs`) to include buffs and debuffs directly owned by the bound character, making custom actor-specific conditions visible and manageable in the condition browser.
- **Automated Test Suite**:
  - Added test coverage in `tests/buffs.test.mjs` validating custom buff selection with +5 STR, name collision resolution between owned and compendium buffs, and postfixed custom buff string parsing. Verified 100% passing test suite across all 451 unit tests.

## 2.0.21

### Inventory, Spells, & Skills Drag Reordering & Item Removal

- **Drag-and-Drop List Reordering**:
  - Implemented `_onSortItem(event, itemData)` on `DCCCrawlerSheet` to handle dynamic reordering of items within the sheet.
  - Dropping an owned item onto another row in the same collection (spells, skills, gear, loot) calculates new relative sort values and updates `item.sort`.
  - Updated context preparation in `getData()` to prioritize `item.sort` with alphabetical name fallback across `context.gear`, `context.loot`, `context.spells`, `context.skills`, `context.buffs`, `context.debuffs`, and `context.attacks`.
- **Item Removal & Slot Cleanup**:
  - Enhanced the `.item-delete` click listener with event bubbling isolation (`preventDefault` and `stopPropagation`).
  - Automatically unbinds deleted items from `system.hotlist` and `system.attributes.externalBuffs`, preventing dead ID references.
  - Confirmed and unified `.item-delete` delete buttons with trash icons and tooltips across all lists in `page4-inventory.hbs`, `spells.hbs`, and `page3-skills.hbs`.
- **Sheet Navigation & Tab Cleanup**:
  - Renamed the second tab from `2: Hotlist & Gear` to `2: Gear & Story` in `crawler-sheet.hbs` and `lang/en.json`, reflecting that the Hotlist is located on Page 1 (Core).
- **Automated Test Coverage**:
  - Added dedicated test suite in `tests/item-sorting-deletion.test.mjs` validating `item.sort` ordering, `_onSortItem` drop calculations, drag-and-drop routing, and hotlist/buff cleanup on deletion.
  - Verified 100% passing test suite across all 448 unit tests.

## 2.0.20

### Hotlist Drag-and-Drop & Dropdown Population Restoration

- **Hotlist Drag-and-Drop & Owned Item Resolution**:
  - Configured native drag-and-drop selector `[data-item-id]` on `DCCCrawlerSheet` so all items, spells, attacks, and skills can be dragged directly onto any of the 10 Hotlist slot boxes.
  - Implemented smart compendium and world item matching: dragging a compendium spell, item, or buff onto a character sheet or hotlist slot checks if an item with the same name and type is already owned by the actor. If found, it reuses the existing owned item rather than creating redundant duplicates.
  - Added `draggable="true"` attributes to item table rows across `page1-core.hbs`, `spells.hbs`, `page4-inventory.hbs`, `page3-skills.hbs`, and populated hotlist boxes in `hotlist.hbs`.
- **Spell Manager Item Drag Serialization**:
  - Enhanced `_onDragStart` in `DCCSpellManager` to locate full spell system definitions from `CONFIG.DCC.spells` and `game.items`. Spells dragged from the catalog carry complete type, image, and system payloads for seamless dropping.
- **Dropdown Selection Event Isolation**:
  - Added `ev.stopPropagation()` to `.hotlist-select` and `.external-buff-select` change handlers. This prevents the change event from bubbling up to Foundry's form harvester, eliminating race conditions where generic form submission clobbered the hotlist slot update.
  - Excluded `.hotlist-select` and `.external-buff-select` from the generic form blur submission listener.
- **Combat & Utility Skills on Hotlist**:
  - Added a dedicated **Skills** optgroup to the Hotlist slot dropdowns so players can directly assign combat masteries (Edge, Bashing, Reach, etc.) and utility skills to hotlist slots.
  - Expanded `getData()` slot parsing to support `slotType === 'skill'`: determines attack classification, assigns `ATTACK` or `SKILL` badges, renders Rank and damage formulas, and wires `.roll-hotlist-attack`, `.roll-hotlist-attack-dmg`, and `.roll-hotlist-use` to trigger `actor.rollAttack` or `actor.rollSkill`.
- **Automated Test Coverage**:
  - Expanded `tests/hotlist.test.mjs` with subtests covering unowned compendium item drops, existing item duplicate prevention, skills optgroup selection, event bubbling isolation, and skill roll execution.
  - Verified 100% passing test suite across all 443 unit tests.

## 2.0.19

### Mob Embedded Loot Items & Combat Sheet Integration

- **Embedded Loot Items on All Mobs**:
  - Converted all mob treasure notes across all 23 entities in `DCC_MOBS` (`src/data/mobs.mjs`) into 64 embedded items of `type: "loot"`.
  - Each loot item features unique IDs, descriptive names, custom SVG icons (`icons/svg/`), quantities (e.g. 10 Crossbow Bolts, 7 Copper Nibs), and atmospheric flavor notes.
  - Players and GMs can now inspect, use, or drag-and-drop loot items directly between mob tokens and crawler character sheets.
- **Mob Attacks & Spells Integration**:
  - Validated and structured all 52 attacks and tactical spells as `type: "attack"` items with exact toHitStat, damageDice, damageStat, damageType, and debuff effects.
  - Offensives and tactical spells (*Fireball*, *Mini Fireball*, *Firestrike*, *Firebolt*, *Heal Others*, *Clap Cloud*, *Magic Missile*, *Scream*, *Gloat*) roll directly from the Attacks table on the Mob sheet without requiring spell slots or mana prep.
  - Added dedicated **Devour** action (`1d4 Healing`) to **Critical Consensus** for its *Constant Hunger* ability.
- **Page 1 (Core) Mob Treasure & Loot Drops Section**:
  - Added a dedicated **TREASURE & LOOT DROPS** table directly to Page 1 (Core) of the Mob sheet.
  - Features real-time item rows with icon, name, inline quantity editing (`item-inline-edit`), notes, use/chat-drop, sheet edit, and delete buttons, plus an "Add Loot" button.
  - Retained header summary field for backwards compatibility while giving GMs direct in-combat access to mob drops.
- **Template & Data Schema Updates**:
  - Added `description` field to `loot` item schema in `template.json`.
  - Rebuilt binary LevelDB compendium pack `packs/mobs` with all embedded loot and attack items.
- **Automated Test Coverage**:
  - Added section 7 to `tests/mobs-compendium.test.mjs` verifying embedded loot existence, attack validity, Devour action, crawler sheet context population, and LevelDB compendium integrity.
  - Verified 100% passing test suite across 438 tests.

## 2.0.18

### Game Master's Toolkit Mob Compendium & Entity Dataset

- **Official Mob Compendium (`carl-rpg.mobs`, `packs/mobs`)**:
  - Created and registered the official `mobs` compendium pack in `system.json` as an `Actor` compendium with `PLAYER: OBSERVER` ownership.
  - Built and populated the LevelDB compendium with all 22 monsters and bosses from the official *Game Master's Toolkit - Entities List* (plus the canonical Pack Rat).
- **Entities List Dataset (`src/data/mobs.mjs`)**:
  - Implemented `DCC_MOBS` comprising 23 fully articulated creature entries with complete stats, descriptions, AI broadcasts, attacks, and special rules:
    1. **Aranaea Magnus** (Level 7 Neighborhood Boss, Large Monstrous spider, 10 bars of 4 HP = 40 Max HP, DR 1, Move 30+S, Evade 14+F, Surprise 12+F; 6 attacks including Venomous Fangs, Web, Caustic Silk Spray, Drop, Paralyzing Pedipalps; Eight Middle Fingers to Gravity, Webbing, Tangled).
    2. **Chef BoyardOoze** (Level 4 Mob, Small Ooze, 4 bars of 3 HP = 12 Max HP, DR 2, Move 10+S, Evade 12+F, Surprise 11+F; Tendril attack with Held and Saucy Debuffs; Slick trails, Cold/Heat Vulnerabilities, Regenerate Health).
    3. **Rat Brute** (Level 4 Mob, Petite Humanoid, 4 bars of 3 HP = 12 Max HP, DR 1, Move 20+S, Evade 12+F, Surprise 11+F; Knife & Crossbow; Roid Rage & Weak-Minded).
    4. **Rat Shaman** (Level 5 Mob, Petite Humanoid, 5 bars of 2 HP = 10 Max HP, DR 1, Move 20+S, Evade 12+F, Surprise 14+F; Clap Cloud, Firestrike, Mini Fireball Spells; Backline tactics).
    5. **Rat Hooligan** (Level 8 Mob, Petite Rat Hybrid, 8 bars of 2 HP = 16 Max HP, DR 2, Move 20+S, Evade 12+F, Surprise 14+F; Longsword, Firebolt, Heal Others Spell; Ambush tactics).
    6. **Critical Consensus** (Level 8 Neighborhood Boss, Huge Zombie influencer amalgamation, 11 bars of 5 HP = 55 Max HP, DR 2, Move 10+S, Evade 12+F, Surprise 12+F; Slam attack with Held & Staggered; Constant Hunger, Foodporn, Over-Seasoned, Power Boost in darkness).
    7. **Canis Knights** (Level 5 Mob, Petite Humanoid, 5 bars of 2 HP = 10 Max HP, DR 2, Move 20+S, Evade 12+F, Surprise 11+F; Spear & Sword; Adorable Fascinated aura, Strict Adherence).
    8. **Grimes** (Level 5 Mob, Petite Ooze, 5 bars of 4 HP = 20 Max HP, DR 2, Move 15+S, Evade 11+F, Surprise 11+F; Gloop & Tendril; Split replication feature).
    9. **Trollogs** (Level 5 Mob, Large Humanoid, 5 bars of 2 HP = 10 Max HP, DR 2, Move 20+S, Evade 13+F, Surprise 12+F; Bite & Javelin; Mirror Change, Sprite Shapeshifting).
    10. **Dread Wizard Grimblegore** (Level 10 Neighborhood Boss, Large Humanoid amphibian overlord, 12 bars of 5 HP = 60 Max HP, DR 2, Move 20+S, Evade 14+F, Surprise 14+F; Fireball, Gloat, Jump Smash; Fixed sequence Fireball-Fireball-Jump-Jump-Gloat-Gloat).
    11. **Cocaine Kobold** (Level 6 Mob, Petite Lizard, 6 bars of 3 HP = 18 Max HP, DR 2, Move 20+S, Evade 13+F, Surprise 13+F; Rock & Spear; Mounted bonus, Enraged coke dusting).
    12. **Danger Dingo** (Level 5 Mob, Medium Beastly, 5 bars of 3 HP = 15 Max HP, DR 2, Move 30+S, Evade 11+F, Surprise 12+F; Bite & Ravage with Rabies & Take Down; Good Impressions metal music pacification, Ravager charge bonus).
    13. **Jacked Kangaroo** (Level 8 Mob, Medium Animal, 8 bars of 4 HP = 32 Max HP, DR 2, Move 25+S, Evade 12+F, Surprise 12+F; Kick, Punch, Tail Whip; Tail balance immunity, Squat vanity distraction).
    14. **Jazmanian Devil** (Level 7 Mob, Petite Humanoid, 7 bars of 3 HP = 21 Max HP, DR 2, Move 20+S, Evade 13+F, Surprise 11+F; Wrist Weight, Sweatband, Kick, Lunge; Hard Fighting Fatigued on kill).
    15. **Whambat** (Level 3 Mob, Petite Animal, 3 bars of 2 HP = 6 Max HP, DR 2, Move 20+S, Evade 13+F, Surprise 11+F; Bite & Hell Dive; Flight, Sacrificial Hell Dive).
    16. **Mick Moran** (Level 12 Neighborhood Boss, Large Humanoid Crocodilian Chef, 12 bars of 5 HP = 60 Max HP, DR 2, Move 20+S, Evade 13+F, Surprise 14+F; That's a Knife & Thunderstrike with Blood Trail & Shocked; For Those About To Rock action limiter, Water Scarcity drowning hazard).
    17. **Brindle Grub** (Level 2 Mob, Small Beastly, 2 bars of 3 HP = 6 Max HP, DR 2, Move 5+S, Evade 11+F, Surprise 11+F; Chew attack; Janitor Mob corpse-eating, Overcrowding trip hazard).
    18. **Cow-Tailed Brindle Grub** (Level 3 Mob, Petite Beastly, 3 bars of 3 HP = 9 Max HP, DR 2, Move 10+S, Evade 11+F, Surprise 11+F; Sting attack; Cocoon pupation into Vespa, Goo Explosion on Amazing Success).
    19. **Brindled Vespa** (Level 8 Mob, Medium Mutated wasp, 8 bars of 4 HP = 32 Max HP, DR 0, Move 20+S, Evade 14+F, Surprise 11+F; Acid Goo & Sting; Flight, Fragile Wings targetable).
    20. **Unvaccinated Clurichaun Rev-Up Consultant** (Level 3 Mob, Petite Humanoid, 3 bars of 1 HP = 3 Max HP, DR 2, Move 25+S, Evade 13+F, Surprise 11+F; Slingshot, Claw, Sneeze spreading Diseased, The Taint, Stiff Legs).
    21. **Laminak Rev-Up Consultant Manager** (Level 6 Mob, Small Humanoid, 6 bars of 2 HP = 12 Max HP, DR 2, Move 45+S, Evade 13+F, Surprise 13+F; Magic Missile & Scream; Natural Immunity to debuff damage, Flight 45ft).
    22. **Smombie** (Level 4 Mob, Medium Undead, 4 bars of 3 HP = 12 Max HP, DR 2, Move 20+S, Evade 12+F, Surprise 11+F; Tantrum attack; Mindless doomscrolling trance).
    23. **Pack Rat** (Level 2 Mob, Tiny Animal, 2 bars of 2 HP = 4 Max HP, DR 1, Move 20+S, Evade 12+F, Surprise 11+F; Bite attack, Pack tactics).
- **Strict CarlRPG Mechanics Adherence**:
  - Stat modifiers strictly calculated using `getDCCStatModifier` (no D&D `(score-10)/2` math, no negative modifiers).
  - Health per bar precisely corresponds to CON modifier for every entity.
  - Attack checks for mobs roll `1d20 + modifiers` without false untrained disadvantage.
- **Mob Sheet & Presentation (`src/models/actors/mob-model.mjs`, `template.json`, `templates/actors/parts/page1-core.hbs`)**:
  - Added native `description` and `aiDescription` fields to `MobDataModel` and `template.json`.
  - Added dedicated **MOB LORE, AI BROADCAST & SPECIAL TRAITS** display card on Page 1 (Core) of the Mob sheet.
  - Added Source / Book citation field to mob header.
  - Omitted crawler hotlist when rendering mob actors, avoiding input name duplication.
- **Compendium Build Script (`scripts/build-packs.mjs`)**:
  - Added `buildMobs()` using `ClassicLevel` to serialize `DCC_MOBS` directly into `packs/mobs` with key format `!actors!${mob._id}`.
- **Automated Test Suite (`tests/mobs-compendium.test.mjs`)**:
  - 21 comprehensive automated tests covering schema, dataset contents, statistics, actor instantiation, attack rolls, sheet context generation, and LevelDB database integrity.

## 2.0.17

### Mob Actor Type, Variable Health Bars & Sequential Token Placement

- **Mob Actor Type & Data Model (`src/models/actors/mob-model.mjs`, `template.json`, `system.json`)**:
  - Registered new `mob` actor type and `MobDataModel` extending `BaseActorDataModel`.
  - Added unique mob attributes: `system.attributes.treasure` (string description of loot/coins) and `system.attributes.xp` (defeat experience value).
  - Added mob details: `classification` ("Mob", "Elite", "Boss"), `creatureType` ("Animal", "Humanoid", etc.), `floor`, `location`, `notes`, `special`, and `source`.
  - Added combat difficulty attributes: `surpriseDifficulty` and `evadeDifficulty` (defaults to attacker target DC $10 + \text{DEX Mod} + \text{Floor Number}$, e.g. `12+F`).
- **Variable Health Bars Architecture (`src/documents/actor.mjs`, `src/apps/combat-metrics.mjs`)**:
  - Implemented variable health bar slots on mobs (`hp.bars`, default 2), replacing the fixed 10-bar crawler constraint.
  - Health per bar (`hpPerBar`) defaults to the mob's CON modifier (`getDCCStatModifier(CON)`), with support for explicit overrides via `system.attributes.hp.hpPerBar`.
  - Derived $\text{Max HP} = \text{bars} \times \text{hpPerBar}$ in both `MobDataModel` and `DCCActor.prepareDerivedData`.
  - Updated `getHpPerBar(targetActor)` in `combat-metrics.mjs` to resolve mob variable bars and explicit `hpPerBar`, preserving strict CarlRPG bar-by-bar damage deduction and excess damage ignoring.
- **Independent Unlinked Tokens (`prototypeToken.actorLink: false`)**:
  - Configured `DCCActor._preCreate` and `prepareBaseData` to enforce `prototypeToken.actorLink: false` and hostile disposition (`-1`) for all mobs.
  - Placed and copy/pasted mob tokens operate as independent synthetic actors; mutations on one token (e.g. damage, conditions) do not alter the world actor or sister tokens.
- **Auto-Incrementing Sequential Token Naming (`src/dcc.mjs`)**:
  - Enhanced `preCreateToken` hook to automatically detect mob token placements and copy-pastes.
  - Strips trailing numbers from the base name and queries existing tokens on the target scene to sequentially number them (e.g. `Goblin` -> `Goblin 1`, `Goblin 2`; copying `Goblin 2` increments to `Goblin 3`).
- **Crawler Sheet Mob Integration (`src/sheets/crawler-sheet.mjs`, `templates/actors/parts/page1-core.hbs`)**:
  - Exposes `isMob` context flag.
  - Custom mob header section rendering classification, level, creature type, floor, location, XP value, and treasure.
  - Dynamic health bar segment visualization generated from the mob's configured number of bars (e.g. 50% and 100% for 2 bars).
  - Dedicated Difficulties & Combat Values section displaying Evade Difficulty and Surprise Difficulty.
- **Canonical Example & Unit Test Suite (`tests/mobs.test.mjs`)**:
  - Full automated test suite verifying Pack Rat (Level 2 Mob, Page 32 Game Master's Campaign Toolkit): CON 3 (+2 CON mod), 2 bars of 2 HP (4 Max HP), Evade Difficulty `12+F`, Surprise Difficulty `11+F`, Bite attack (`1d20 + 3` to hit, `1d4+1` Piercing).
  - Verified bar-based damage deduction (3 damage removes 1 bar of 2 HP and ignores 1 excess damage, leaving 2 HP; 1 damage removes 0 bars).

## 2.0.15

### Attack Rolling from Skills Table & Interactive Chat Damage Execution

- **Skills Table Attack Rolling Integration (`src/sheets/crawler-sheet.mjs`, `templates/actors/parts/page3-skills.hbs`)**:
  - Clicking the roll icon (`.roll-skill`) for an attack or combat skill on the Skills page (Page 3) now rolls **To Hit vs Target Evade** via `actor.rollAttack(item, 'hit')`, identically to attacks rolled from the first-page attacks table or the hotlist.
  - Automatically identifies attack skills based on damage capabilities (`hasDamage`), `checkType` containing "attack", attack types (`Edge`, `Bashing`, `Reach`, `Ranged`, `Strike`, `Hand to Hand`), or category `Combat`.
  - Non-attack utility skills continue to roll standard stat/skill checks via `actor.rollSkill(item)`.
  - Updated button tooltips dynamically: Attack skills display `Roll Attack (To Hit): 1d20 + Rank [X] + [Mod] vs Target Evade`, while utility skills display `Roll Skill Check: 1d20 + Total [X] | Modified Rank: [Y]`.
- **Chat Damage Roll Button & Dice Evaluation Fix (`src/documents/actor.mjs`, `src/dcc.mjs`)**:
  - Preserved Foundry VTT core dice roll rendering (`roll.render()`) when including interactive action buttons in message content, resolving an issue where only calculation flavor was shown without dice boxes.
  - Embedded `data-actor-id`, `data-item-id`, and `data-skill-id` attributes on chat card damage buttons.
  - Implemented event delegation handler for `.roll-skill-dmg-from-card, .roll-attack-dmg-from-card` in `onRenderChatMessage` (`renderChatMessageHTML` / `renderChatMessage`), enabling players to click the **[ 💥 Roll Attack Damage ]** button directly from the chat card to roll damage and post full typed damage cards with token target application.
  - Updated `getSkillDamageData` to accurately return `hasDamage: false` for non-combat utility skills lacking damage formulas or dice.
- **Automated Test Suite (`tests/skills-attack-roll.test.mjs`, `tests/setup.mjs`)**:
  - Added full test suite verifying skill classification, attack roll routing from the sheet, dice roll rendering, chat card button delegation, and damage card generation.
  - Enhanced headless test harness `MockRoll.prototype.evaluate` with `.render()` support mirroring Foundry VTT core.

## 2.0.14

### Official DCC RPG Rank Damage Die & Damage Rules Integration

- **Rank Damage Die Scaling Module (`src/data/rank-dice.mjs`)**:
  - Implemented `getRankDamageDie(rank)` with full fidelity to the official DCC RPG scaling table:
    - **Rank 0**: +0 (Untrained Check with Disadvantage: `2d20kl + Stat Mod` vs Target Evade)
    - **Rank 1**: +1 flat damage bonus
    - **Ranks 2–3**: +1d2
    - **Ranks 4–5**: +1d4
    - **Ranks 6–7**: +1d6
    - **Ranks 8–9**: +1d8
    - **Ranks 10–13**: +1d10
    - **Ranks 14–15+**: +1d12
  - Added `parseUpgrades(upgrades)` supporting string, nested object, and dictionary schemas.
  - Implemented `getEvadeTargetDifficulty(foeDexMod, floorNumber)` computing $10 + \text{Foe DEX Mod} + \text{Floor Number}$.
- **Comprehensive Damage Calculations (`src/documents/actor.mjs`)**:
  - `getSkillDamageData(skillItem, options)`: Resolves base damage, rank upgrades, governing stat modifier, rank damage die, Hand-to-Hand damage effects (Pugilism + Iron Punch), and Fire Fingers Rank 15 passive melee bonus.
  - `getSpellDamageData(spellItem)`: Integrates rank damage die scaling, rank upgrades (+dice, multi-target, blast/line), Rank 15 base dice multiplier (e.g. Magic Missile $\times 3$ dice), and debuff tracking (Burned on 1+ HB loss).
  - `getAttackDamageParts(attackItem, options)`: Accurately associates weapon skills to weapons, adds matching Rank Damage Dice, and factors in Fire Fingers Rank 15 melee bonuses for natural/brawling strikes.
  - `rollSkillDamage(skillItem, options)`: Evaluates damage parts, applies multipliers, and generates interactive CarlRPG damage cards with targeted token damage application.
  - `rollSkill(skillItem)`: Embeds inline `Roll Attack Damage` buttons on skill check cards whenever the skill possesses damage formulas.
- **Character Sheet UI Integration (`src/sheets/crawler-sheet.mjs`, `templates/actors/parts/page3-skills.hbs`)**:
  - Extended Page 3 (Skills) with inline `.roll-skill-dmg` burst buttons displaying damage formula tooltips.
  - Added event listeners on crawler sheet controller to dispatch `actor.rollSkillDamage()` directly from the sheet.
- **Test Suite Updates (`tests/rank-damage-dice.test.mjs`, `tests/spell-actions.test.mjs`)**:
  - Added 81 automated unit tests in `tests/rank-damage-dice.test.mjs` verifying all milestones (R1, R2, R4, R5, R6, R8, R10, R14, R15, R16) across Fire Fingers, Fireball, Magic Missile, Unarmed Combat, Pugilism, Combined Pugilism + Iron Punch, Longsword, Fire Fingers R15 passive, Untrained disadvantage checks, and non-stacking rules.
  - Updated `tests/spell-actions.test.mjs` to reflect the Rank Damage Die in spell formulas.

## 2.0.13

### ApplicationV2 Options Initialization & `id.replace` Safety Fix

- **Fix ApplicationV2 Options Initialization (`src/apps/base-application.mjs`)**:
  - Resolved `TypeError: Cannot read properties of undefined (reading 'replace')` in `ApplicationV2` constructor when instantiating `DCCSessionManagerApp`, `DCCCrawlerCreatorApp`, `DCCCombatMetricsApp`, and other custom applications.
  - Subclasses defining legacy `defaultOptions` did not have own-property `DEFAULT_OPTIONS`, causing Foundry's `_initializeApplicationOptions` inheritance chain merge to omit their configuration and clobber `id` with `undefined`.
  - Implemented `_initializeApplicationOptions(options)` in `DCCBaseApplication` to dynamically pull `v1` default options from `this.constructor.defaultOptions`, map `id`, `classes`, `window.title`, `window.resizable`, and `position`, and ensure `initialized.id` is always a valid string before `ApplicationV2` executes `.replace('{id}', ...)`.
  - Defined `static DEFAULT_OPTIONS = { classes: ['dcc-app'] }` on `DCCBaseApplication` without `id: undefined`, preventing pollution of the inheritance chain defaults.
  - Added `appId` getter and `close()` cleanup to ensure backwards-compatible integration with `ui.windows`.
- **Test Suite Updates (`tests/setup.mjs`, `tests/v13-namespacing.test.mjs`)**:
  - Enhanced `MockApplicationV2` in `tests/setup.mjs` to faithfully mirror Foundry v12/v13's `_initializeApplicationOptions` inheritance chain traversal and `id.replace("{id}", uniqueId)`.
  - Added unit test suite in `tests/v13-namespacing.test.mjs` validating instantiation, valid string IDs, window options, override handling, and render/close lifecycle for all 7 DCC application classes.

## 2.0.12

### ApplicationV2 Migration & ActorDirectory Namespacing

- **ActorDirectory Global Namespacing Fix (`src/dcc.mjs`)**:
  - Replaced unsafe `(typeof ActorDirectory !== 'undefined' && app instanceof ActorDirectory)` in `getApplicationHeaderButtons` with safe resolution via `foundry.applications.sidebar.tabs.ActorDirectory`.
  - Completely eliminates the deprecation warning: `"Error: You are accessing the global 'ActorDirectory' which is now namespaced under foundry.applications.sidebar.tabs.ActorDirectory"`.
- **ApplicationV2 Framework Migration (`src/apps/base-application.mjs`)**:
  - Implemented `DCCBaseApplication` extending `foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)` on Foundry v12+.
  - Migrated all 7 custom applications to extend `DCCBaseApplication`:
    - `DCCCombatMetricsApp` ([src/apps/combat-metrics.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/combat-metrics.mjs))
    - `DCCCombatArchiveApp` ([src/apps/combat-archive.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/combat-archive.mjs))
    - `DCCCrawlerCreatorApp` ([src/apps/crawler-creator.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/crawler-creator.mjs))
    - `DCCSessionManagerApp` ([src/apps/session-manager.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/session-manager.mjs))
    - `DCCSkillManager` ([src/apps/skill-manager.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/skill-manager.mjs))
    - `DCCSpellManager` ([src/apps/spell-manager.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/spell-manager.mjs))
    - `DCCBuffDebuffManager` ([src/apps/buff-manager.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/buff-manager.mjs))
  - Implemented automatic translation bridges in `DCCBaseApplication` so `defaultOptions` -> `DEFAULT_OPTIONS`/`PARTS`, `getData()` -> `_prepareContext()`, and `activateListeners()` -> `_onRender()` work seamlessly without changing application business logic.
  - Completely eliminates the deprecation warning: `"The V1 Application framework is deprecated, and will be removed in a later core software version. Please use the V2 version of the Application framework available under foundry.applications.api.ApplicationV2."`.
- **Automated Testing**:
  - Updated `tests/v13-namespacing.test.mjs` verifying that all application classes inherit from `foundry.applications.api.ApplicationV2`.
  - Added unit tests asserting that neither the deprecated `ActorDirectory` getter nor the deprecated V1 `Application` constructor is invoked during application lifecycle.

## 2.0.11

### Chat Message Rendering Hook Early Module Detection (`renderChatMessageHTML`)

- **Early Module Load Version Detection (`isFoundryV13Plus`)**:
  - Fixed an issue where version checks during initial script/module evaluation returned `false` because `globalThis.game` is not yet instantiated when ES modules first load.
  - Implemented `isFoundryV13Plus()` checking `game.release`, `foundry.release`, `CONST.BUILD_RELEASE`, `CONST.VERSION`, and architectural markers like `foundry.appv1` and `foundry.applications.sidebar.tabs.CombatTracker`.
  - Added hook cleanup via `Hooks.off('renderChatMessage', onRenderChatMessage)` whenever running on v13+ to guarantee no legacy hook listeners remain registered.
  - Re-invoked `registerChatMessageHook()` inside `Hooks.once('init')` to verify registration once `game` is initialized.
  - Completely eliminates the deprecation warning: `"Error: The renderChatMessage hook is deprecated. Please use renderChatMessageHTML instead, which now passes an HTMLElement argument instead of jQuery."`.
- **Automated Testing**:
  - Added unit test in `tests/chat-message-hook.test.mjs` verifying that `registerChatMessageHook()` accurately identifies Foundry v13 and binds `renderChatMessageHTML` even when `globalThis.game` is completely undefined.

## 2.0.10

### CombatTracker v13 Namespacing (`foundry.applications.sidebar.tabs.CombatTracker`)

- **CombatTracker Base Resolution**:
  - Updated `DCCCombatTracker` ([src/apps/combat-tracker.mjs](file:///Users/jeremy/Code/CarlRPG/src/apps/combat-tracker.mjs)) to check `foundry.applications.sidebar.tabs.CombatTracker` first.
  - In Foundry v13, sidebar tabs were moved under the Application V2 namespace `foundry.applications.sidebar.tabs.*` (unlike V1 sheets which moved to `foundry.appv1.sheets.*`).
  - Eliminates the deprecation warning: `"You are accessing the global 'CombatTracker' which is now namespaced under foundry.applications.sidebar.tabs.CombatTracker"`.
- **Automated Testing**:
  - Updated `tests/v13-namespacing.test.mjs` and `tests/setup.mjs` to verify `DCCCombatTracker` inherits from `foundry.applications.sidebar.tabs.CombatTracker` without accessing deprecated `globalThis.CombatTracker`.

## 2.0.9

### Foundry v13 Global Namespace Migration & Deprecation Cleanup

- **Sheet & Tracker Base Class Namespacing**:
  - Migrated `DCCCrawlerSheet` to extend `foundry.appv1.sheets.ActorSheet` (with fallback to `globalThis.ActorSheet`).
  - Migrated `DCCItemSheet` to extend `foundry.appv1.sheets.ItemSheet` (with fallback to `globalThis.ItemSheet`).
  - Migrated `DCCCombatTracker` to extend `foundry.appv1.sidebar.tabs.CombatTracker` (with fallback to `globalThis.CombatTracker`).
  - Completely eliminates Foundry v13 deprecation warnings:
    - `"Error: You are accessing the global 'ActorSheet' which is now namespaced under foundry.appv1.sheets.ActorSheet"`
    - `"Error: You are accessing the global 'ItemSheet' which is now namespaced under foundry.appv1.sheets.ItemSheet"`
    - `"Error: You are accessing the global 'CombatTracker' which is now namespaced under foundry.appv1.sidebar.tabs.CombatTracker"`
- **Document Collection & Template Loading Namespacing (`src/dcc.mjs`)**:
  - Sheet unregistration and registration now resolve `Actors` from `foundry.documents.collections.Actors` and `Items` from `foundry.documents.collections.Items`.
  - Handlebars template preloading resolves `foundry.applications.handlebars.loadTemplates` (with fallbacks to `foundry.utils.loadTemplates` and `loadTemplates`).
  - Eliminates v13 deprecation warnings for `Actors`, `Items`, and `loadTemplates`.
- **Application & Dialog Class Namespacing**:
  - Updated custom applications (`DCCCrawlerCreatorApp`, `DCCSessionManagerApp`, `DCCCombatArchiveApp`, `DCCSkillManager`, `DCCSpellManager`, `DCCBuffDebuffManager`, `DCCCombatMetricsApp`) to extend `foundry.appv1.applications.Application`.
  - Updated interactive prompts and confirmation dialogs across all managers to resolve `foundry.appv1.applications.Dialog`.
- **Combat Base Document Resolution (`src/documents/combat.mjs`)**:
  - Updated `BaseCombat` to check `CONFIG.Combat.documentClass` and `foundry.documents.BaseCombat` before falling back to `Combat`.
- **Automated Testing**:
  - Added dedicated test suite `tests/v13-namespacing.test.mjs` verifying class hierarchy under `foundry.appv1`, namespaced collection lookups, and the absence of deprecated global property accesses in v13 environments.

## 2.0.8

### Sidebar Directory Hooks & Foundry v13 HTMLElement Normalization

- **Items Directory Hook Fix (`renderItemDirectory`)**:
  - Normalized `html` argument via `$(html ?? app?.element)` instead of directly calling `html.find()`.
  - Fixed `TypeError: html.find is not a function` occurring in Foundry v13 when sidebar directories pass native `HTMLElement` instances.
- **Unified Sidebar Directory Injection**:
  - Refactored `injectItemDirectoryButtons` and `injectActorDirectoryButtons` to safely handle both `HTMLElement` and jQuery instances across `renderItemDirectory`, `renderActorDirectory`, `renderSidebarTab`, and `renderCombatTracker`.
  - Added support in `renderSidebarTab` for dynamically injecting the Skill Library & Manager button when switching to the `items` tab.
- **Automated Testing**:
  - Added `tests/sidebar-hooks.test.mjs` verifying that `renderItemDirectory`, `renderActorDirectory`, `renderSidebarTab`, and `renderCombatTracker` handle native `HTMLElement` arguments without errors.

## 2.0.7

### Chat Message Rendering Hook & Foundry v13+ Migration

- **Foundry v13+ Compatibility (`renderChatMessageHTML`)**:
  - Migrated chat message rendering from the deprecated `renderChatMessage` hook to `renderChatMessageHTML` on Foundry v13+.
  - Fully eliminates the deprecation warning: `"Error: The renderChatMessage hook is deprecated. Please use renderChatMessageHTML instead, which now passes an HTMLElement argument instead of jQuery."`
  - Maintains automatic backwards compatibility with Foundry v12 by dynamically registering `renderChatMessage` when running on v12.
- **Modern DOM Event Handling (`onRenderChatMessage`)**:
  - Rewrote the chat message action handler (`src/dcc.mjs`) to work natively with `HTMLElement` instances using standard DOM APIs (`querySelectorAll`, `closest`, `dataset`, `addEventListener`, `insertAdjacentHTML`).
  - Added safe fallbacks for jQuery wrappers when running on older Foundry versions or test environments.
  - Ensured event listener idempotent binding via `dataset.dccBound` to prevent duplicate click handling.
- **Test Suite**:
  - Added dedicated test suite `tests/chat-message-hook.test.mjs` verifying hook registration across Foundry v12 and v13 environments, unbinding logic, `HTMLElement` click execution, and backwards-compatible jQuery handling.

## 2.0.6

### Rollable Tables Schema Validation & Directory Registration Fix

- **RollTable & TableResult Schema Compliance (`src/data/background-tables.mjs`)**:
  - **Fixed TableResult Type Resolution**: Corrected `CONST.TABLE_RESULT_TYPES.TEXT` evaluation (`0`), which previously failed a truthy check and defaulted to `1` (`DOCUMENT`), causing Foundry's `TableResultData` DataModel to throw validation errors due to missing `documentCollection`.
  - **Omitted Invalid Manual Result IDs**: Removed custom non-conforming IDs (such as `respastTrauma1`) on embedded `TableResult` objects so Foundry's `DocumentIdField` automatically assigns valid 16-character alphanumeric IDs.
  - **Explicit Document Reference Fields**: Set `documentCollection: null`, `documentId: null`, and standard SVG icons (`icons/svg/d20-grey.svg` for table, `icons/svg/d20-black.svg` for results).
  - **Empty Table Result Recovery**: If world tables already exist from an earlier boot without results, `ensureBackgroundTables()` automatically backfills their 12 table results via `createEmbeddedDocuments`.
  - **GM Creation Guard**: Added explicit GM user check in `ensureBackgroundTables()` to prevent non-GM players from throwing permission errors on world document creation during world load.
- **Testing & Test Harness**:
  - Updated `tests/setup.mjs` to define `CONST.TABLE_RESULT_TYPES` and enforce strict schema validation in `MockRollTable.create`.
  - Added unit tests in `tests/background-tables.test.mjs` verifying schema validity, result backfilling, and GM permissions.

## 2.0.5

### Step 9 Background Rollable Tables & Character Creator Integration

- **Crawler Background Rollable Tables Dataset (`src/data/background-tables.mjs`)**:
  - Added official rollable tables matching Step 9 of Crawler Character Creation:
    - **Table 11: Past Traumas (1d12)**: 12 entries defining hardships, losses, and psychological wounds.
    - **Table 12: Loose Ends (1d12)**: 12 entries detailing unresolved surface-world business and obligations.
    - **Table 13: Regrets (1d12)**: 12 entries capturing personal remorse and past missteps.
  - Implemented `rollBackgroundTable(key, options)` supporting evaluated 1d12 dice rolls and explicit choice lookups.
  - Implemented `createBackgroundRollTableData(key)` generating standard Foundry VTT `RollTable` document data schemas.
  - Implemented `ensureBackgroundTables()` to automatically initialize official Rollable Tables in Foundry's `game.tables` directory on world startup (`Hooks.once('ready')`).
  - Registered tables under `CONFIG.DCC.backgroundTables`, `game.dcc.backgroundTables`, and `window.carl.backgroundTables`.

- **Character Creator Terminal Integration (`DCCCrawlerCreatorApp`)**:
  - Added dedicated **Step 9: Psychological Background & Story Matrices** section to the character creation terminal.
  - Interactive trait cards for Past Trauma, Loose Ends, and Regrets with:
    - Dedicated `[ 🎲 Roll 1d12 ]` buttons for each table.
    - Dropdown selectors allowing direct choice from all 12 entries per table.
    - Multi-line editable textareas allowing players to tweak rolled text or write custom backstories.
    - Top-level `[ 🎲 Roll All 3 Tables ]` action button to roll all traits simultaneously.
  - Integrated with the procedural randomizer (`[ 🎲 Randomize All ]`) and reset functionality.
  - Persists `pastTrauma`, `looseEnds`, and `regrets` directly into `actor.system.details` upon creation.

- **Character Sheet Manual Editability & Creative Freedom (`DCCCrawlerSheet`)**:
  - Enhanced Page 2 (Gear & Story) Past Trauma, Loose Ends, and Regrets story boxes with inline `[ 🎲 Roll 1d12 ]` buttons in their headers.
  - Rolling from the sheet posts an interactive chat card with the roll total and story quote, non-destructively updating or appending to the field.
  - Story textareas remain standard, fully editable form inputs (`system.details.pastTrauma`, `looseEnds`, `regrets`), guaranteeing full creative freedom for players.

## 2.0.4

### Sheet & Application Window Rendering Fix

- **Resolved Read-Only Getter Collision on Sheet & Application Instances**:
  - Fixed an issue where `DCCCrawlerSheet` failed to open due to assignments to read-only getters (`this.actor`, `this.document`) inherited from Foundry's `ActorSheet` and `DocumentSheet`.
  - Fixed an issue where `DCCItemSheet` failed to open due to assignments to read-only getters (`this.item`, `this.document`) inherited from Foundry's `ItemSheet` and `DocumentSheet`.
  - Fixed an issue where `DCCSessionManagerApp` failed to open due to setting `this.rendered = false / true`, which collided with Foundry's native `Application.prototype.rendered` getter without a setter.
- **Foundry Native Lifecycle Integration**:
  - Fully delegated window lifecycle management (`this.rendered`, `ui.windows`) to Foundry's core `Application` system.
  - Retained real-time `Hooks.on('dccSessionUpdated')` subscriber using the native `this.rendered` getter check.
- **Test Harness Parity**:
  - Updated `tests/setup.mjs` to faithfully mirror Foundry VTT prototype getters for `actor`, `item`, `document`, and `rendered`.
  - Added dedicated test suite `tests/sheet-rendering.test.mjs` preventing any future regressions on sheet or app initialization and rendering.

## 2.0.3

### Party Progression & Session Manager — Customized Event Dialog & Real-Time Live Updates

- **Customized Add Event Dialog (`promptAddEventDialog`)**:
  - Replaced immediate default manual event generation with an interactive modal dialog powered by `templates/apps/add-event-dialog.hbs` (with programmatic fallback `DCCSessionManagerApp.getAddEventDialogHtml`).
  - Contains all parameters supported by the search and filter suite:
    - **Crawler selection**: choose any world crawler to associate the event with.
    - **Action / Event Type**: Trained Skill, Untrained Skill Attempt, Attack / Strike, Spell Cast, AI Favor Adjustment, Popularity Shift, Damage Dealt, Damage Taken, Loot Box Awarded, Stat Check, and Manual / Custom Event.
    - **Event Name**: custom label / descriptor.
    - **Untrained Attempt flag**: checkbox flagging attempts for end-of-session promotion review.
    - **Formula, Total & d20 Face**: explicit roll details and natural die result.
    - **Target DC / AC**: numeric challenge threshold.
    - **7-Tier Outcome**: choice between Auto-Calculate and explicit override (Critical Failure, Major Failure, Failure, Near Miss, Success, Major Success, Critical Success, Pending DC).
    - **Stat / Resource Delta**: +/- modifiers for AI Favor, Popularity, and Damage.
    - **Notes / Description**: freeform notes for GM tracking.
  - Automatically resets/aligns active search filters upon submission so newly added events are immediately visible in the active table.

- **Real-Time Live Event Synchronization**:
  - Live window refresh for open `DCCSessionManagerApp` instances via robust `ui.windows` tracking and `dccSessionUpdated` hook broadcasts.
  - Fixed session reference detachment in `DCCSessionEngine` to guarantee changes persist cleanly.
  - Wired `DCCActor.rollStat` and `DCCActor.rollEvade` to automatically log checks to the active session ledger in real time.
  - Wired `DCCCombatMetrics.applyDamageToTarget` so all damage (in or out of combat) logs directly to the active session ledger with damage dealt/taken entries.
  - Pushed damage dealt, damage taken, and loot box dispatch directly to `session.ledger`.
  - Added unit test suite covering full manual event customization and real-time live updates across multiple open windows.

## 2.0.1

### System Data Models & Application V2 Architecture (Phases 1, 2 & 3: Foundry V16 Preparation)

- **Application V2 Forward-Compatible Sheet Architecture (Phase 3)**:
  - Modernized `DCCCrawlerSheet` and `DCCItemSheet` with Application V2 paradigms (`DEFAULT_OPTIONS`, `PARTS`, `_prepareContext(options)`, `_onRender(context, options)`), while retaining base inheritance from `ActorSheet` and `ItemSheet` for native stability in Foundry V12 where `Actors.registerSheet` and `Items.registerSheet` require standard document sheet controllers.
  - Defined static `DEFAULT_OPTIONS` specifying semantic tags, position dimensions, form handlers, and header window controls (direct "Save to PDF" AcroForm export).
  - Defined static `PARTS` mapping Handlebars templates (`systems/carl-rpg/templates/actors/crawler-sheet.hbs` and `systems/carl-rpg/templates/items/item-sheet.hbs`).
  - Implemented Application V2 `_prepareContext(options)` and `_onRender(context, options)` lifecycle methods.
  - Provided dual compatibility: supports both Application V2 calling conventions (`new DCCCrawlerSheet({ document: actor })`, `_prepareContext()`) and legacy FormApplication v1 conventions (`new DCCCrawlerSheet(actor)`, `getData()`, `_getHeaderButtons()`).
  - Exposed `game.dcc.applications` namespace grouping all system sheets and manager apps.
  - Added dedicated test suite `tests/application-v2-sheets.test.mjs` with 6 unit tests covering options, parts, dual constructors, context compilation, prototype inheritance, and render hooks.

- **System Data Models for All Actor Types (Phase 2)**:
  - Implemented typed `foundry.abstract.TypeDataModel` classes for all 4 canonical Actor subtypes in `src/models/actors/`:
    - `BaseActorDataModel`: Shared core class defining standard schemas for the 5 abilities (`str`, `int`, `con`, `dex`, `cha`) and base attributes (`hp`, `mana`, `evade`, `dr`, `speed`, `aiFavor`, `size`, `externalBuffs`). Encapsulates shared derived calculation methods (`prepareDerivedBaseStats()`) for size normalization, equipped gear stat/DR/evade bonuses, external buff resolutions, debuff penalties, DCC stat modifier lookups, and attribute totals.
    - `CrawlerDataModel`: Full schema for Player Characters (Crawlers) including `details` (`floor`, `race`, `class`, `level`, `xp`, `personalSpace`, etc.), `gearSlots`, and `hotlist`. Implements `prepareDerivedData()` handling skill cascading bonuses across weapon groups, generic type bonuses, and experience progression thresholds.
    - `PetDataModel`: Companion/pet model with level, attacks, and CON-derived durability.
    - `MountVehicleDataModel`: Structural durability model for mounts and vehicles with size normalization, speed, and DR.
    - `NPCDataModel`: Monster/NPC model with level, defeat XP values, notes, and special traits.
  - Registered all Actor Data Models under `CONFIG.Actor.dataModels` and exposed via `game.dcc.models`.
  - Configured `CONFIG.Actor.trackableAttributes` across all 4 actor types for token bar and status tracking.
  - Updated `DCCActor.prepareDerivedData()` and `prepareBaseData()` to delegate directly to `this.system.prepareDerivedData()` and `prepareBaseData()`.
  - Added dedicated test suite `tests/actor-data-models.test.mjs` with 11 unit tests covering all actor types, derived calculations, cascading weapon groups, and document class actions.

- **System Data Models for All Item Types (Phase 1)**:
  - Implemented typed `foundry.abstract.TypeDataModel` classes for all 11 canonical Item subtypes in `src/models/items/`:
    - `SkillDataModel`: Declarative schema for skill ranks, stat governing bonuses, damage modifiers, and computed `totalRank` getter.
    - `AttackDataModel`: Combat to-hit stats, ranks, dice formulas, damage stats, and structured `damageParts`.
    - `SpellDataModel`: Mana costs, range, duration, cooldowns, spell types, quotes, descriptions, and upgrade tiers (`rank5`, `rank10`, `rank15`).
    - `GearDataModel`: Equipment slots, quantities, equipped state, DR/Evade bonuses, and nested `abilityModifiers`.
    - `BuffDataModel`: Buff types, stat/damage multipliers, damage types, and duration tracking.
    - `DebuffDataModel`: Severity tiers, damage reductions, rounding behaviors, and duration tracking.
    - `LootDataModel`: Item quantities and descriptions.
    - `RaceDataModel`, `ClassDataModel`, `DeityDataModel`, `SponsorDataModel`: Structured lore models with HTML-sanitized fields.
  - Registered all Item Data Models under `CONFIG.Item.dataModels` and exposed via `game.dcc.models`.
- **System Manifest Modernization**:
  - Added explicit `documentTypes` definition in `system.json` for all 4 Actor types and 11 Item types.
  - Configured automated HTML sanitization paths (`htmlFields`) to safeguard rich-text fields.
  - Bumped maximum verified compatibility to Foundry V16.
- **Test Harness Integration**:
  - Enhanced headless Node.js test harness in `tests/setup.mjs` with lightweight implementations of `foundry.abstract.DataModel`, `TypeDataModel`, and `foundry.data.fields.*`.
  - Added test suites `tests/item-data-models.test.mjs` and `tests/actor-data-models.test.mjs` verifying schema defaults, validation, serialization, and document binding.

## 1.0.28

### Visual Readability & Contrast Enhancements

- **Page 1 Core Ability Sublabel Readability**:
  - Replaced low-contrast `#555` stat sublabels with crisp `#111111` typography (`'Oswald'`, 10px, bold 700, 0.5px letter-spacing).
  - Added dedicated high-contrast classes `.dcc-stat-enhanced-label` (DCC theme red `#c0392b`, 700) and `.dcc-stat-unenhanced-label` (deep black `#111111`, 700) across all 5 ability score cards on Page 1.
  - Increased contrast on stat divider slashes from `#555` to `#111111`.
- **Character Sheet PDF Export Polish**:
  - Appended known spells directly to the Page 3 Skills table with rank, governing stat modifier, spell type, MP cost, and formatted effects/damage.
  - Calibrated Page 1 Health Bar slots to uniformly display crawler CON modifier with clean, unchecked boxes for tabletop play.

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

