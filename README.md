# Dungeon Crawler Carl RPG for Foundry VTT

I'm just vibe coding my way to a placeholder until the real deal comes out.  This is in no way officially associated with the DCC brand, nor is it intended to be a replacement for the official game system once it is released.

Questions or concerns contact me @ shinierball via gmail or maybe discord or whatever the cool kids use these days.  

---

## Features

- Hopefully the AI keeps this in sync reasonably with reality, but code changes so fast these days! Odds that this accurately reflects the rules are probably close to zero, but I'm committed to the process of telling the AI to do better!

- **6-Tab Modern Character Sheet**: Recreates the official DCC RPG character sheet with modern UX improvements, consolidated workflows, and full PDF export compatibility:
  - **Tab 1 (Core & Combat)**: Character details, fixed-gradient Health Bar anchored across total health bars (10%–100%, 10 of 10 in the green, 1 of 10 in the red without shifting), 5 Core Stats (STR, INT, CON, DEX, CHA), EVADE ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$), DAMAGE RESISTANCE ($\text{Armor} + \text{Gear} + \text{Buffs}$), Mana, AI Favor & Selectable Creature Size category dropdown (1 Tiny to 8 Gargantuan), Active Debuffs strip with severity chips and 1-click removal, Portrait, External Buff Slots (1–3), ATTACKS table with hybrid physical weapon gear auto-recognition, 1-click equip toggling, expandable Stowed Attacks & Weapons drawer (`Stowed (N)`) with automatic scroll navigation back to the attacks section when toggled, interactive damage application, and the 10-slot combat **Hotlist** (with drag-and-drop item, spell, attack, and skill assignment, quick dropdown selection, smart owned-item duplicate prevention, and 1-click execution for attack rolls, damage, gear toggling, and spellcasting).
- **Weapon Skill Proficiency & Technique Subsystem (Hybrid Multi-Skill Architecture)**:
  - Extends weapons (`GearDataModel` with `isWeapon: true` and `AttackDataModel`) with `weaponCategory`, `weaponType`, `wieldMode` (`one_handed`, `two_handed`, `two_handed_disadv_1h`), `associatedSkills`, `proficiencyMode` (`highest`, `additive`, `primary_plus_half`), and `optionalEffects`.
  - Full manual item creation interface in Item Sheets (`gear`, `attack`, `skill`) allowing players and GMs to manually create custom weapons, chainsaw skills, techniques, and combat maneuvers without touching JSON.
  - Supports 4-layer dynamic skill matching (explicit associations, weapon type model, weapon group taxonomy via `DCC_WEAPON_GROUP_MAP`, and damage type).
  - Employs Specialization Precedence (`proficiencyMode: "highest"`) to resolve d20 attack bonuses without runaway stacking, while considering the crawler trained if any matching skill has Rank $\ge 1$.
  - Extends `SkillDataModel` with `isTechnique`, `appliesTo`, `techniqueConfig`, `critMultiplierR5` (e.g. 4x), `critMultiplierR15` (e.g. 8x), `fumbleDebuff` (e.g. *Minor Injury* on Nat 1), `onHitDebuff` (e.g. *Bleeding*), and `onHitDebuffMinRank`.
- **4-Tier Rank Break Configurations (Ranks 5, 10, 15, 20) for Skills & Spells**:
  - Both skills (`SkillDataModel`) and spells (`SpellDataModel`) feature dedicated, color-coded Rank Break Configuration panels for **Rank 5, Rank 10, Rank 15, and Rank 20**.
  - At each milestone, creators and GMs can configure:
    - **Additional Damage Dies (`damageDice`)**: Extra base damage dice granted at and above this rank (e.g. `+1d6`, `2d4`), scaling cumulative weapon or spell damage.
    - **Additional Rank Damage Dies (`rankDamageDice`)**: Integer count of additional rank damage dice granted (e.g. `+1` or `+2` rank dice), multiplying the evaluated rank damage die.
    - **Buffs or Resistances (`buffsResistances`)**: Descriptive buffs, stat boosts, or damage resistances unlocked at the milestone.
    - **Target Debuffs (`debuff`)**: A status condition or debuff inflicted on targets upon hit (e.g. *Bleeding*, *Crippled*, *Burned*, *Stunned*), producing 1-click **[ 🩸 Inflict Condition ]** buttons on the chat damage card.
    - **Non-Defined Ability Notes (`notes`)**: Freeform notes documenting custom narrative or mechanical perks not formally parameterized by dice.
  - Completely optional: no effects are required to be tied to any rank break, allowing flexible milestone customization.
- **Universal Color Contrast & Human Readability Design Standard**:
  - Full audit across sheets, edit screens, item editors, dialogs, and popups ensuring high-contrast, human-readable typography conforming to WCAG AA ($\ge 4.5:1$ contrast ratio).
  - Explicit dark text colors (`#111111`) across inputs, textareas, and select elements preventing washed-out text caused by browser or operating system dark mode style overrides.
  - Universal high-contrast input placeholders (`#444444`) on all form fields across actor sheets, item sheets, and manager applications.
  - Replaced low-contrast pastel accents (Rank 5 deep green `#196f3d`, Rank 10 deep navy `#1a5276`, Rank 15 deep purple `#6c3483`, Rank 20 deep brown `#873600`) and replaced washed-out greys and light yellows on light surfaces with high-contrast alternatives.
  - Built-in dark container frames (`#141419`) with crisp typography for Foundry dialog popups (Kill Dialogs, Add Event Modal, Party Creator).
  - **Tab 2 (Equipment & Inventory)**: Combines Equipped Gear Slots (Head, Torso, Arms, Hands/Holding, Legs, Feet, 10 Accessories) with active bonus badges and notes inputs in a responsive multi-column layout placed directly above the full-width Backpack Items table (Gear & Loot) with drag-and-drop reordering, quantity editing, 1-click equipping, and deletion. Both sections span the full width of the sheet, and all buffs and debuffs have been moved to their own dedicated tab to keep inventory strictly physical.
  - **Tab 3 (Skills & Spells)**: Unified abilities and magic center combining combat/utility skills and the character spellbook. Full skills table tracking Base Rank, Gear Bonuses, Weapon Group / Type Bonuses, Boon Bonuses, Modified Rank, and Total Skill, with drag-and-drop custom list reordering and 1-click deletion. Spells section includes mana tracking, quotes, ranges, durations, damage, 4-tier rank break configurations, multi-tiered rank-gated damage scaling (`damageModifiers`), critical milestones (Rank 5 4x, Rank 15 8x), on-hit condition/debuff triggers, fumble backfire warnings, optional metamagic riders, and cast roll cards, backed by both the **DCC Skill Library** and **DCC Spell Library**.
  - **Tab 4 (Conditions & Effects)**: Dedicated status effect center managing character buffs, active effects, debuffs, and negative conditions. Displays severity badges (`Minor`, `Moderate`, `Major`), durations, and 1-click quick-assignment buttons (`[1]`, `[2]`, `[3]`) to assign owned buffs directly to Page 1 External Buff slots 1, 2, or 3 (highlighted in vivid green when assigned, with 1-click toggle to unassign), plus direct launch to the Condition & Buff Library.
  - **Tab 5 (Story & Sponsors)**: Consolidated narrative background (Popularity, Past Traumas, Loose Ends, Regrets, Notes) featuring inline `[ 🎲 Roll 1d12 ]` buttons for Table 11 (Past Traumas), Table 12 (Loose Ends), and Table 13 (Regrets) with chat card results, trophy summary pill, Companions & Personal Space (Pet Companion with special traits & attacks, Mount/Vehicle with DR & speed, Personal Space with defense & amenities, Deity/Patron with boons & sins), and Character Features (Racial Traits, Class Talents, Corporate Sponsors 1–3).
  - **Tab 6 (Achievements & Trophy Room)**: Dedicated Crawler trophy room collecting all achievements, boss stars, and crawler skulls earned over time. Summary trophy pills tally Bronze, Silver, Gold, Platinum, Legendary, and Celestial awards along with total AI Favor gained. Features the **Public Notoriety Manager** displaying all 6 Boss Star tiers, Crawler Skulls, live count adjustments, chronological kill logs, and 1-click kill recording dialogs. Includes live tier filtering, real-time search, color-coded achievement cards with iconic Dungeon AI quotes and reward details, direct **Announce to Chat** broadcasts, custom achievement creation, and 1-click access to the **Achievement Catalog & Manager**.
- **Public Notoriety: Boss Stars & Crawler Skulls System**:
  - **Color-Coded Star Tiers**: Boss kills award visible stars color-coded by boss level and dungeon scope:
    - **Bronze**: Neighborhood Boss (`#cd7f32`, warm bronze sheen)
    - **Silver**: Borough Boss (`#dcdde1`, polished steel silver)
    - **Gold**: City Boss (`#f1c40f`, radiant gold halo)
    - **Platinum**: Country Boss (`#00d2d3`, icy platinum cyan shimmer)
    - **Legendary**: Floor Boss (`#e67e22`, molten fiery flame pulse)
    - **Celestial**: Dungeon Boss (`#9b59b6`, cosmic violet prismatic aura)
  - **Crawler Skulls (PvP)**: Eliminating a fellow crawler awards a bone-white skull with a crimson shadow (`#ecf0f1` / `#c0392b`).
  - **Public Display Across Foundry VTT**:
    - **Crawler Sheet**: Rendered next to Crawler Name in the Core Header, plus full Trophy Room management in Tab 6.
    - **Combat Tracker**: Displayed alongside each crawler's name in `DCCCombatTracker`.
    - **Chat Message Headers**: Publicly attached to sender names on rolls, spells, attacks, and chat messages.
    - **Overhead Token Names**: Unicode star and skull representation formatted for token nameplates.
  - **Automated Combat Tracking**: Delivering lethal damage to a Boss Mob or Crawler automatically records the kill, awards the corresponding badge, and triggers a broadcast from the Dungeon AI.
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
  - **Unique Mob Attributes & Sheet Display**: Dedicated fields for `Treasure` drops, `XP` defeat rewards, `Classification` (Mob, Janitor Mob, Neighborhood Boss, Borough Boss, City Boss, Crawler), `Creature Type` (Animal, Humanoid, Ooze, Monstrous, etc.), `Floor & Location`, `Source Citation`, `Surprise Difficulty` (e.g. `11+F`), and `Evade Difficulty` (e.g. `12+F` based on $10 + \text{Foe DEX Mod} + \text{Floor Number}$ or mob base $+ F$).
  - **Dynamic Mob Evade DC (Base + F) & Global Floor**: All mobs dynamically compute effective Target Evade DC as $\text{Base} + F$, where $F$ is the active world floor (e.g. `14+F` scales to DC 15 on Floor 1, DC 18 on Floor 4), displayed directly on the mob sheet alongside base values.
  - **Automatic Target Hit Resolution & Non-Crawler Evade Button**:
    - **Active Target Hit Evaluation**: Attack rolls (`rollAttack`) and spell attacks (`rollSpellAttack`) automatically check active targets (`game.user.targets` or roll options) and embed a high-contrast target matrix pill row in chat cards showing `[HIT (+X)]` or `[MISS (-X)]`.
    - **Interactive Evade Button**: Any attack rolled by a non-crawler (mob, boss, hostile NPC) embeds a 1-click **Roll Evade** button in the chat message. Defending crawlers clicking this button immediately roll their Evade action ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$) against the attack total with instant chat evaluation (`SUCCESSFULLY EVADED!` or `EVADE FAILED — HIT TAKEN!`).
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
  - **DCC Item & Equipment Library (`DCCItemManager`)**: Centralized browser for weapons, armor, accessories, consumables, potions, wands, scrolls, and lottery tickets. Features category counts, slot filters, real-time search with focus retention, 1-click addition to actor inventory, Determine Value skill appraisal integration, drag-and-drop item support, and custom item creation dialogs.
  - **DCC Spell Library & Manager (`DCCSpellManager`)**: Comprehensive popup search catalog indexing all canonical DCC spells with instant search, focus/cursor retention, filter by spell category and governing stat, view quotes, costs, ranges, and add spells directly to character sheets with a single click.
  - **DCC Condition & Buff Manager (`DCCBuffDebuffManager`)**: Unified browser for buffs and debuffs with live search, focus/cursor retention, severity indicators, and 1-click assignment to External Buff slots or character debuffs. Supports direct discovery of character-owned custom buffs alongside world and compendium effects.
  - **External Buff Slots & Custom Buff Management**: Up to 3 active external buffs on Page 1 (Core) with single-match option selection and strict duplicate prevention (a buff cannot occupy multiple slots at once; assigning to a new slot clears previous assignments and options already in use are disabled). Character-owned custom buffs take precedence over compendium defaults, ensuring custom modifiers (e.g. custom +5 STR) are visually preserved upon reopening the sheet and accurately reflected in derived ability score totals.
- **Combat Performance & AI Awards**: Real-time tracking of net damage applied (factoring in target DR and Temp HP), kills, and tactical skills linked to Foundry's Combat Tracker, plus the **Dungeon AI Award Console** for dispensing Loot Boxes (Bronze through Celestial) and AI Favor.
  - **Automated End-of-Round Combat Effects (Debuff DoT & Buff HoT)**: Advancing combat rounds (`nextRound`) automatically triggers all active debuffs causing damage per round (`system.damagePerRound`) and all active buffs causing healing per round (`system.healingPerRound`). Supports flat damage/healing, dice formulas, health bars, and floor scaling (`1d10+F`), with full CarlRPG damage bar rules, elemental resistances/immunities, max HP capping, automatic **CON Stat Check vs. Difficulty 10 + Floor** for crawlers before fatal debuff damage (on success, the debuff ends and damage is avoided), and automated Dungeon AI chat card broadcasts.
- **Party Progression & Session Hub (`DCCSessionManagerApp`)**:
  - Live party dashboard providing real-time party vitals, health bars, mana, net damage dealt/taken, AI favor, popularity, and untrained checks attempted.
  - **Party Grouping & Tracked Roster Management (West Marches Support)**: Configure crawler party affiliations directly on character sheets or in bulk. In PPSM, untracked crawlers from inactive parties are hidden by default (`trackedOnly: true`). Selecting a named party in the **Party** dropdown immediately tracks all members of that party in the active session and untracks all others (`session.trackedCrawlerIds = memberIds`). Includes the **`+ New Party`** modal dialog to define and name a party with crawler checkbox roster selection and instant session activation, 1-click card tracking toggles (`[Tracked]` / `[Untracked]`), segmented view filters (Tracked Only vs All Crawlers), and the interactive **Manage Roster Modal** (`[Manage Roster]`).
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
- **Crawler Token Selection Action HUDs**:
  - **Dynamic Token Hotbar HUD**: Automatically appears directly above Foundry's macro bar (`#hotbar`) whenever a crawler token is selected on the canvas. Features all 10 character sheet hotlist slots with complete interactivity (Hit & Damage for attacks, Cast & Damage for spells, Equip/Unequip toggling for gear, Use for consumables/loot, Roll & Damage for skills, drag-and-drop item assignment, and slot clearing).
  - **Left Action Panel (Attacks & Active Skills)**: Automatically appears on the left of the screen directly below the scene list (`#navigation` / `#scene-list`). Displays all character attacks with one-click Hit & Damage buttons, plus all active non-passive skills with Check/Hit & Damage buttons (passive skills are automatically filtered out). Fully reactive to actor updates, item changes, and canvas selection changes.
- **Consumables, Outcome Builder 2.0, Wands, Scrolls, Activated Gear & Items Compendium (`carl-rpg.items`)**:
  - **Outcome Builder 2.0 Engine**: Full support for multi-effect consumable items, elixirs, potions, wands with charges, single-use scrolls, and activated gear with on-use effects.
  - **Execution Modes**: Select between **All Effects (Guaranteed Combo)** where all defined effects resolve simultaneously, **Weighted Random** (lottery scratch-offs summing to 100%), and **Roll Table** resolution.
  - **Rich Effect Types**: Supports fixed Health Bar healing, Heal over Time (HoT) ticking per combat round, injury mending (Minor, Major, All), curing debuffs, granting buffs, inflicting debuffs, permanent skill rank upgrades, permanent unenhanced ability score boosts, and casting spells without caster mana cost.
  - **Wands with Charges Pool & Free Cast Scrolls**: Wands track remaining charges and persist in inventory when depleted; scrolls allow 1-time free casting of inscribed spells with zero MP required.
  - **Activated Gear with On-Use Abilities**: Armor and accessories can enable activated abilities with usage cooldowns (e.g. `"Once per scene"`) and attached outcomes, triggered directly from character inventory via `[ ⚡ ]`.
  - Scene-restricted usage limits (`system.cooldown: "Once per scene"`): prevents multiple uses in the same chamber or encounter, automatically refreshing upon entering a new scene.
  - Smart canvas proximity targeting (`targetType: "closest_mob"`): detects nearest hostile mob token on the canvas, calculates distance, and aims chaotic magic at the foe.
  - Interactive chat cards featuring reveal graphics, 1-click **Apply Damage** (with DR deductions), 1-click **Apply Healing**, 1-click **Apply Regeneration (HoT)**, 1-click **Mend Injury**, 1-click **Cure Debuff**, 1-click **Grant Skill Rank**, 1-click **Grant Stat Boost**, and 1-click **Apply Buff / Debuff**.
  - Preloaded system items compendium (`carl-rpg.items`) with canonical **Normal Mana Potion** and **Scratch-off Ticket - Fireball or Custard**.
- **Item Gold Value & Determine Value Skill Progression**:
  - Every piece of gear and loot item possesses an authentic gold appraisal value (`system.value` / `goldValue`).
  - **Rank 0–4 (Default)**: Crawlers cannot see gold values (`???` display) and value-based inventory sorting is locked.
  - **Rank 5–9**: Crawlers unlock the ability to sort their inventory and gear by gold value (`Value: High to Low` / `Value: Low to High`), though exact numbers remain hidden (`???`).
  - **Rank 10+**: Crawlers unlock exact item appraisal, displaying true gold amounts (`50 GP`, `150 GP`) on both the inventory sheet and item sheets alongside value-based sorting.
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
  - **Optional Damage Effects & Hand-to-Hand Skill Combinations**:
    - **Interactive Pre-Roll Effect Selection**: When attacking with any attack or skill that defines or links to optional effects, an interactive dialog automatically prompts the user before rolling to select **"No Damage Effect"** or any valid damage effect. The dialog displays current rank badges, effect descriptions, and AI Favor notes.
    - **Pugilism**: Choose from *Dirty Fighting* (applies Woozy), *Iron Punch* (adds $+1d2$ base damage, milestone dice, and secondary rank die at R5+), or *Powerful Strike* (multiplies base dice by rank). Selecting "No Damage Effect" grants **+2 AI Favor** on hit.
    - **Noggin Knocker**: Choose from *Skullcracker* (+1d4 base damage, rank die at R10+) or *Powerful Strike*. Selecting "No Damage Effect" grants **+1 AI Favor** on hit.
    - **Wrasslin**: Choose from *Choke Out* (2x damage at <=10% HP), *Dirty Fighting*, or *Toss* (+1d8 Bludgeoning + Str mod). Selecting "No Damage Effect" grants **+1 AI Favor** on hit.
    - **Foot Soldier**: Choose from *Powerful Strike* or *Smush* (2x damage at <=20% HP). Selecting "No Damage Effect" grants **+1 AI Favor** on hit.
    - **Custom Optional Effects on Any Attack**: Configure custom comma-separated effects (`system.optionalEffects`) on any attack item with quick-preset buttons (`[+ Pugilism]`, `[+ Noggin Knocker]`, `[+ Wrasslin]`, `[+ Foot Soldier]`).
    - **Character Sheet Quick Select**: An active effect dropdown (`.attack-damage-effect-select`) in the attacks table allows crawlers to view or change active effects directly on Page 1.
    - **Roll Card Continuity**: The hit roll card carries the selected effect forward onto the "Roll Attack Damage" button, automatically applying the effect in the damage roll without duplicate prompts.
    - **Unarmed Combat Restriction**: Unarmed Combat ($1d4 + \text{Str}$) cannot combine with Hand-to-Hand damage effects.
  - **Fire Fingers Rank 15 Passive**: Automatically adds $+1d12\text{ Fire}$ damage to Pugilism, Unarmed Combat, and Slice Attack.
  - **Attack Skill Rolling & Interactive Damage Execution**:
    - Clicking the roll icon on Page 3 (Skills) for any attack skill rolls **To Hit vs Target Evade** identically to attacks in the hotlist and attacks section. Non-combat utility skills roll standard skill checks.
    - Inline `.roll-skill-dmg` burst buttons allow rolling damage directly from the skills table.
    - Embedded `[ 💥 Roll Attack Damage ]` buttons on chat cards allow players to click directly from chat to roll multi-typed damage and apply damage to targeted tokens with one click.
- **Grinding & Skill Advancement Mechanics**:
  - Full support for the official CarlRPG downtime grinding system (see [docs/grinding-mechanics.md](docs/grinding-mechanics.md)).
  - **Party Grinding Hub (`DCCGrindApp`)**: Select participating crawlers with party roster checkboxes (automatically defaulted to crawlers tracked in the active session hub), switch between crawler sub-tabs to inspect skills and allocate hours, and execute grinds affecting all participants simultaneously.
  - **Prominent & Convenient Access**: Open the Grinding Hub anytime from the **Start Grind** button on Page 1 (Core) recovery controls, the **Actors Directory Sidebar** (`Party Grinding & Downtime Hub`), or via the system macro (`Start Party Grinding & Downtime`).
  - **Floating Scene Floor Clock HUD (`DCCFloorClockHUD`)**: High-visibility on-screen HUD widget anchored below scene navigation displaying real-time hours remaining until floor collapse, with quick GM adjustment buttons (`-5h`, `-1h`, `+1h`, `+5h`) and a 1-click `[Grind]` launcher.
  - **Floating Scene Crawler Countdown Clock HUD (`DCCCrawlerClockHUD`)**: High-visibility on-screen widget docked immediately to the right of the Floor Collapse Clock tracking the total surviving crawlers remaining in the World Dungeon (e.g. 13,000,000), featuring quick GM adjustment buttons (`-10k`, `-1k`, `-100`, `-1`, `+1`, `+100`, `+1k`, `+10k`), direct numeric entry, and a compact collapsible pill view (see [docs/crawler-clock.md](docs/crawler-clock.md)).
  - **Use-It-Or-Lose-It Pool Rule**: Unspent hours sitting in a crawler's general bank pool are reset to zero at the start of a new grind session, while hours invested directly on specific skills persist indefinitely across sessions.
  - **Individual Endurance Checks & Fatigue**: Grinding beyond safe limits triggers individual Endurance checks for each crawler; the stackable **Fatigued Debuff** (−1 Checks, halved Move speed) is applied *only* to crawlers who fail their checks.
  - **In-Sheet Skill Hour Allocation & Advancement**: Crawlers can spend banked hours directly on Page 3 (Skills) of their character sheet with inline `[-1]`, `[+1]`, and `[Fill]` buttons, and trigger individual advancement rolls ($d20 \ge \text{Rank}$) via inline graduation cap buttons.
  - **5-Hour Safe Daily Limit**: Crawlers can safely grind up to 5 hours per in-game day without fatigue checks; guide insight (+1 hr) and area maps (+1 Neighborhood Map, +2 Borough Map) extend safe limits and award bonus hours.
  - **Single Floor Clock Cost**: Grinding decrements the global Floor Timer Clock once for the party by non-bonus hours accrued (`hours`).
  - **Grinding Complications Table**: 1d20 random GM event table covering mob ambushes, Janitor Mob corpse swarms, environmental hazards, rival crawlers, and AI-awarded Loot Boxes.
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

## 🛡️ Foundry V15 Compatibility & Namespacing

CarlRPG is fully prepared for Foundry Virtual Tabletop Version 15:
- **Zero Startup Warnings**: All startup routines, HUD widgets (`DCCFloorClockHUD`, `DCCCrawlerClockHUD`, `DCCCrawlerTokenHUD`), and interactive managers prioritize `foundry.applications.handlebars.renderTemplate` and `foundry.applications.handlebars.loadTemplates`.
- **Namespaced Base Classes**: Core document models (`DCCActor`, `DCCItem`) inherit safely from `foundry.documents.Actor` / `foundry.documents.Item` with fallback to base classes before legacy globals.
- **Document Creation & Drop Serialization**: Background roll tables, macros, and drag-and-drop actions resolve via `foundry.documents.*` and `foundry.applications.ux.TextEditor`.

---

## 🧪 Testing & Code Coverage

The CarlRPG system features a headless automated test harness powered by Node.js built-in test runner (`node:test`). Tests run natively without browser dependencies or heavy bundlers.

### Running Unit Tests
Execute the full test suite (740+ assertions across 139 test suites):
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

