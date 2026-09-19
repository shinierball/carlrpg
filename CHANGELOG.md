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

