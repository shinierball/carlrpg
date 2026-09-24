# Dungeon Crawler Carl RPG for Foundry VTT

I'm just vibe coding my way to a placeholder until the real deal comes out.  This is in no way officially associated with the DCC brand, nor is it intended to be a replacement for the official game system once it is released.

Questions or concerns contact me @ shinierball via gmail or maybe discord or whatever the cool kids use these days.  

---

## Features

- Hopefully the AI keeps this in sync reasonably with reality, but code changes so fast these days! Odds that this accurately reflects the rules are probably close to zero, but I'm committed to the process of telling the AI to do better!

- **6-Tab Modern Character Sheet**: Recreates the official DCC RPG character sheet with modern UX improvements, consolidated workflows, and full PDF export compatibility:
  - **Tab 1 (Core & Combat)**: Character details, 10-segment gradient Health Bar (10%–100%), 5 Core Stats (STR, INT, CON, DEX, CHA), EVADE ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$), DAMAGE RESISTANCE ($\text{Armor} + \text{Gear} + \text{Buffs}$), Mana, AI Favor & Selectable Creature Size category dropdown (1 Tiny to 8 Gargantuan), Active Debuffs strip with severity chips and 1-click removal, Portrait, External Buff Slots (1–3), ATTACKS table with interactive damage application, and the 10-slot combat **Hotlist** (with drag-and-drop item, spell, attack, and skill assignment, quick dropdown selection, smart owned-item duplicate prevention, and 1-click execution for attack rolls, damage, gear toggling, and spellcasting).
  - **Tab 2 (Equipment & Inventory)**: Combines Equipped Gear Slots (Head, Torso, Arms, Hands/Holding, Legs, Feet, 10 Accessories) with active bonus badges and notes inputs directly alongside the physical Backpack Items table (Gear & Loot) with drag-and-drop reordering, quantity editing, 1-click equipping, and deletion. All buffs and debuffs have been moved to their own dedicated tab to keep inventory strictly physical.
  - **Tab 3 (Skills & Spells)**: Unified abilities and magic center combining combat/utility skills and the character spellbook. Full skills table tracking Base Rank, Gear Bonuses, Weapon Group / Type Bonuses, Boon Bonuses, Modified Rank, and Total Skill, with drag-and-drop custom list reordering and 1-click deletion. Spells section includes mana tracking, quotes, ranges, durations, damage, rank scaling, and cast roll cards, backed by both the **DCC Skill Library** and **DCC Spell Library**.
  - **Tab 4 (Conditions & Effects)**: Dedicated status effect center managing character buffs, active effects, debuffs, and negative conditions. Displays severity badges (`Minor`, `Moderate`, `Major`), durations, and 1-click quick-assignment buttons (`[1]`, `[2]`, `[3]`) to assign owned buffs directly to Page 1 External Buff slots 1, 2, or 3, with direct launch to the Condition & Buff Library.
  - **Tab 5 (Story & Sponsors)**: Consolidated narrative background (Popularity, Past Traumas, Loose Ends, Regrets, Notes) featuring inline `[ 🎲 Roll 1d12 ]` buttons for Table 11 (Past Traumas), Table 12 (Loose Ends), and Table 13 (Regrets) with chat card results, trophy summary pill, Companions & Personal Space (Pet Companion with special traits & attacks, Mount/Vehicle with DR & speed, Personal Space with defense & amenities, Deity/Patron with boons & sins), and Character Features (Racial Traits, Class Talents, Corporate Sponsors 1–3).
  - **Tab 6 (Achievements)**: Dedicated Crawler trophy room collecting all achievements earned over time. Summary trophy pills tally Bronze, Silver, Gold, Platinum, Legendary, and Celestial awards along with total AI Favor gained. Includes live tier filtering, real-time search, color-coded achievement cards with iconic Dungeon AI quotes and reward details, direct **Announce to Chat** broadcasts, custom achievement creation, and 1-click access to the **Achievement Catalog & Manager**.
- **Crawler Achievements & Trophy Room Subsystem**:
  - **Persistent Achievement Item Type (`type: "achievement"`)**: Registered as an official Item document type with rich schema for tier, floor, date/session earned, Dungeon AI quote, reward granted, loot box contents, AI Favor, and XP bonuses.
  - **Canonical Achievement Library (`DCC_ACHIEVEMENTS`)**: Preloaded library of iconic achievements from the book and official *Game Master's Campaign Toolkit* (*Where’d Ya Get Those Peepers?*, *Ding-Dong Ditch*, *You’ll Shoot Your Eye Out!*, *Floor Combat MVP*, *First Blood of the Desolation*, *Boss Annihilator*, *Fashion Disaster Survivor*, *Improvised Demolitions Expert*, *Sponsor's Little Darling*, *Goblin Defenestration Specialist*).
  - **Achievement Manager & Party Trophy Room (`DCCAchievementManagerApp`)**: Interactive browser allowing GMs to browse canonical achievements and grant them to party crawlers with a single click, or inspect all achievements unlocked across the entire party.
  - **Combat Metrics & Session Engine Synchronization**: Awards and loot boxes granted during encounters via `DCCCombatMetrics.dispatchAIAward(...)` or session ledgers via `DCCSessionEngine.recordLootBox(...)` automatically persist as achievement items on recipient Crawler actors.
  - **Dungeon AI Chat Broadcasts**: 1-click announcements generate authentic Dungeon AI broadcast cards in the chat log.
- **Mob Actor Type, Monster Statblocks & Compendium**:
  - **Official Mob Compendium (`carl-rpg.mobs`)**: Pre-packaged Actor compendium populated with all **84 mobs, bosses, and rival crawlers** from Page 3 of the official *Game Master's Campaign Toolkit* (`MOBS, BOSSES, AND RIVAL CRAWLERS`). Includes Floor 1 Mobs, Floor 2 Mobs, Threat Appendix additions, Neighborhood Bosses (*Aranaea Magnus*, *Critical Consensus*, *The Bar Render*, *Hide-Hitter Crib Daddy*, *Dread Wizard Grimblegore*, *MisChief*, *Mick Moran*, *Cardium Clam*, *The Hoarder*, *The Juicer*, *Krakaren Clone*, *Ralph the Frenzied Gerbil*), Borough Bosses (*Ball of Swine*, *Stiggy*, *Rakish Werehound Shocker*), City Bosses (*Beloved Mimic*, *Prosperity Prophet*), Janitor Mobs (*Brindle Grub*, *Cow-Tailed Brindle Grub*, *Brindled Vespa*, *Rat Janitor*), and Rival Crawlers (*Bruiser*, *Wise-Guyy*).
  - **Variable Health Bars**: Mobs support variable health bar slots (`hp.bars`, from 1 bar up to 23 bars). Health per bar defaults strictly to the mob's CON modifier (`getDCCStatModifier(CON)`), with support for explicit overrides via `hp.hpPerBar`. Damage resolution removes full bars and ignores excess damage per CarlRPG rules.
  - **Independent Unlinked Scene Tokens**: Placed mob tokens default to `prototypeToken.actorLink: false` and hostile disposition. Each token operates completely independently on scenes.
  - **Auto-Incrementing Sequential Token Naming**: Dropping or pasting tokens on a scene automatically appends sequential numbering (`Goblin 1`, `Goblin 2`, `Goblin 3`).
  - **Unique Mob Attributes & Sheet Display**: Dedicated fields for `Treasure` drops, `XP` defeat rewards, `Classification` (Mob, Janitor Mob, Neighborhood Boss, Borough Boss, City Boss, Crawler), `Creature Type` (Animal, Humanoid, Ooze, Monstrous, etc.), `Floor & Location`, `Source Citation`, `Surprise Difficulty` (e.g. `11+F`), and `Evade Difficulty` (e.g. `12+F` based on $10 + \text{Foe DEX Mod} + \text{Floor Number}$).
  - **Embedded Loot Items & Combat Sheet Integration**: All mob treasure drops are embedded directly as first-class `loot` items across all 84 entities. Page 1 (Core) features a dedicated **Treasure & Loot Drops** quick-access table with inline quantity editing and direct drag-and-drop to player characters.
  - **Direct Combat Attacks & Tactical Spells**: All mob offensive actions are modeled with authentic DCC mechanics. Physical strikes are configured as `type: "attack"` items with damage dice, stat modifiers, and ranges. Spellcaster mobs (e.g. *Dread Wizard Grimblegore*, *Rat Shaman*, *Goblin Shamanka*, *Prosperity Prophet*, *Mind Horror*) feature full mana pools and dedicated `type: "spell"` items (*Fireball*, *Gloat*, *Rat Swarm Summon*, *Grime Curse*, *Eldritch Blast*, *Coin Barrage*, etc.) with 1-click Cast and Damage buttons directly on Page 1 (Core & Combat).
  - **Foundry VTT v12 Sublevel Hydration**: Pack compilation ensures embedded items are properly indexed in the `actors.items` LevelDB sublevel, guaranteeing seamless hydration of all attacks, spells, and loot when actors are opened or spawned from the compendium.
  - **Mob Lore & AI Announcement Terminal**: Dedicated display card on Page 1 (Core) presenting the visual mob description, the iconic Dungeon AI voice broadcast quote, and special combat mechanics/traits.
- **Fillable Character Sheet PDF Export**:
  - One-click **Save to PDF** export directly into the official 6-page fillable character sheet (`assets/sheet/fillable_character_sheet.pdf`).
  - Populates all 429 AcroForm fields (Core vitals & stats, HP gradient threshold boxes, Evade, DR, Attacks, Hotlist, Equipped Gear, Skills, Inventory, Pet & Mount blocks, Personal Space, Kills, Deity, Racial & Class Abilities, and Sponsors).
  - Includes header window action (`Save to PDF`) and stylized quick-action button on Page 1 for immediate downloading and printing outside of Foundry VTT.
- **Dedicated Interactive Catalog Managers**:
  - **Crawler Character Creator (`DCCCrawlerCreatorApp`)**: Fast matrix character creation terminal accessible right from the Actors directory (`[ ⚔️ New Crawler ]`). Full support for Human and Animal species, standard stat arrays `[2, 3, 4, 5, 6]`, dynamic starting Health & Mana initialization (ensuring current health and mana match max values at 100% on creation based on CON and INT), 4-tier life-stage background matrices (Childhood/Youth, Adolescence/Training, Career/Adult, Hobby/Quirk), non-additive duplicate skill rank resolution (`Math.max`), **Step 9 Psychological Background Rollable Tables** for Past Traumas (Table 11), Loose Ends (Table 12), and Regrets (Table 13) with 1d12 roll buttons, table selection dropdowns, and freeform editable textareas, **Level 1 Starter Combat Loadouts** (choose a Basic Weapon at Rank 3 with physical weapon equipped to Hands and attack item configured, Starter Spell at Rank 3 + 5 Normal Mana Potions with 100% mana refill, or Unarmed Combat H2H + Damage Effect combo at Rank 3), universal baseline **Heal (Rank 1)** for all Crawlers (actively restores up to 2 health bars to self only, capped at maximum HP), 1-click procedural randomizer, and starting floor selection (Floors 1–5).
  - **DCC Spell Library & Manager (`DCCSpellManager`)**: Comprehensive popup search catalog indexing all canonical DCC spells. Filter by spell category and governing stat, view quotes, costs, ranges, and add spells directly to character sheets with a single click.
  - **DCC Condition & Buff Manager (`DCCBuffDebuffManager`)**: Unified browser for buffs and debuffs with live search, severity indicators, and 1-click assignment to External Buff slots or character debuffs. Supports direct discovery of character-owned custom buffs alongside world and compendium effects.
  - **External Buff Slots & Custom Buff Management**: Up to 3 active external buffs on Page 1 (Core) with single-match option selection. Character-owned custom buffs take precedence over compendium defaults, ensuring custom modifiers (e.g. custom +5 STR) are visually preserved upon reopening the sheet and accurately reflected in derived ability score totals.
- **Combat Performance & AI Awards**: Real-time tracking of net damage applied (factoring in target DR and Temp HP), kills, and tactical skills linked to Foundry's Combat Tracker, plus the **Dungeon AI Award Console** for dispensing Loot Boxes (Bronze through Celestial) and AI Favor.
- **Party Progression & Session Hub (`DCCSessionManagerApp`)**:
  - Live party dashboard providing real-time party vitals, health bars, mana, net damage dealt/taken, AI favor, popularity, and untrained checks attempted.
  - **Party Grouping & Tracked Roster Management**: Configure crawler party affiliations directly on character sheets or in bulk. Selectively limit active session tracking to a chosen party or custom crawler subset (`trackedCrawlerIds`), complete with 1-click card tracking toggles (`[Tracked]` / `[Untracked]`), segmented view filters (Tracked Only vs All Crawlers), party dropdown filters in the matrix and ledger, and an interactive **Manage Roster Modal** (`[Manage Roster]`) featuring Select All, Deselect All, Select by Party, and inline party updates.
  - Full activity and roll ledger tracking trained skills, untrained checks (with disadvantage), spells, attacks, damage, and DM events.
  - **Customized Add Event Dialog (`promptAddEventDialog`)**: Interactive modal dialog supporting all filter options (Crawler selector, Action/Event Type, Untrained Attempt flag, Roll Formula, Total, d20 die face, Target DC, 7-Tier Outcome selector/auto-calculator, Stat/Resource Delta for Favor/Popularity/Damage, and Notes) with automatic filter alignment so new events are immediately visible.
  - **Real-Time Live Event Synchronization**: Open tracker windows update dynamically without requiring screen refresh or search adjustments when events are manually added, attacks/spells/skills/stats/evade checks are rolled, or combat/environmental damage occurs.
  - **7-Tier Roll Outcome Engine**: Automated outcome classification (Critical Failure, Major Failure, Failure, Near Miss, Success, Major Success, Critical Success) based on exact CarlRPG margin thresholds, with inline DM DC and outcome overrides.
  - **End-of-Session Progression**: Field training opportunities allowing one-click promotion of attempted untrained skills to Rank 1, session XP pool distribution across participating tracked crawlers, Dungeon AI recap card broadcast, and session archiving.
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
- **Rank Damage Die System & Skill/Spell Damage Calculations**:
  - Full automated implementation of the official DCC RPG Rank Damage Die scaling table:
    - **Rank 0**: +0 (Untrained Attack Check with Disadvantage `2d20kl + mod` vs Target Evade).
    - **Rank 1**: +1 flat damage bonus.
    - **Ranks 2–3**: +1d2.
    - **Ranks 4–5**: +1d4.
    - **Ranks 6–7**: +1d6.
    - **Ranks 8–9**: +1d8.
    - **Ranks 10–13**: +1d10.
    - **Ranks 14–15+**: +1d12.
  - Automatically factors into Spell Attack Damage, Weapon Attack Damage, and Attack Skill Damage formulas alongside governing ability modifiers and rank upgrades.
  - **Hand-to-Hand Damage Effects & Combinations**: Unarmed Combat ($1d4 + \text{Str}$) cannot combine with Hand-to-Hand damage effects, whereas Pugilism ($1d2 + \text{Str}$, DEX to hit) combines with Iron Punch (adding $+1d2$ base damage, scaling to $+2d2$ at R5, $+3d2$ at R10, $+4d2$ at R15, and adding a secondary Iron Punch rank damage die at Rank 5+ for $4d2 + 2d4 + \text{Str}$).
  - **Fire Fingers Rank 15 Passive**: Automatically adds $+1d12\text{ Fire}$ damage to Pugilism, Unarmed Combat, and Slice Attack.
  - **Attack Skill Rolling & Interactive Damage Execution**:
    - Clicking the roll icon on Page 3 (Skills) for any attack skill rolls **To Hit vs Target Evade** identically to attacks in the hotlist and attacks section. Non-combat utility skills roll standard skill checks.
    - Inline `.roll-skill-dmg` burst buttons allow rolling damage directly from the skills table.
    - Embedded `[ 💥 Roll Attack Damage ]` buttons on chat cards allow players to click directly from chat to roll multi-typed damage and apply damage to targeted tokens with one click.
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

---

## 🧪 Testing & Code Coverage

The CarlRPG system features a headless automated test harness powered by Node.js built-in test runner (`node:test`). Tests run natively without browser dependencies or heavy bundlers.

### Running Unit Tests
Execute the full test suite (470+ assertions):
```bash
node --test tests/*.test.mjs
```

### Running Test Coverage Audit
Run native V8 code coverage analysis across all system source files in `src/`:
```bash
node scripts/coverage.mjs
```
Or directly via Node:
```bash
node --test --experimental-test-coverage --test-coverage-include="src/**" tests/*.test.mjs
```
*Current benchmark: **>90%** overall line coverage, with every individual module in `src/` exceeding the strict 75% coverage threshold.*
