# Dungeon Crawler Carl RPG — Crawler Character Creator

## Overview

The **Crawler Character Creator** (`DCCCrawlerCreatorApp`), also known as the **Crawler Induction Terminal**, provides a fast matrix character generation dashboard built according to the official Dungeon Crawler Carl RPG rulebooks.

The application allows players and Game Masters to rapidly build, validate, and spawn fully legal Crawlers for starting Floor 1 through Floor 5, with standard stat arrays, species-specific combat perks, 4-tier life-stage background matrices, and automatic duplicate skill rank resolution.

---

## 1. Quick Access in Foundry VTT

- **Actors Directory Sidebar**: A prominent `[ ⚔️ New Crawler ]` button is located directly next to the default Foundry "Create Actor" button in the Actors directory.
- **Developer Helper**: Run `window.carl.openCrawlerCreator()` from the developer console or macro editor.

---

## 2. Species Rules & Inherent Perks

| Species | Inherent Combat Skill | Inherent Rank | Starting AI Favor | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Human** | `Unarmed Combat` | **Rank 3** | **1** | Standard crawler entrance protocol with baseline brawling training and 1 AI favor. |
| **Animal** | `Slice Attack` | **Rank 3** | **0** | Animals surrender their AI favor to enter as animal crawlers, gaining innate natural claws/slice attacks. |

---

## 3. Standard Stat Array: `[2, 3, 4, 5, 6]`

Every crawler assigns the standard array values `[2, 3, 4, 5, 6]` across their five core abilities:
- **Strength (STR)**
- **Dexterity (DEX)**
- **Constitution (CON)**
- **Intelligence (INT)**
- **Charisma (CHA)**

### Rules:
- Each number must be assigned to exactly one ability score.
- No ability score may be skipped or duplicated.
- The interface displays the live status of the standard array pool (`Available`, `Used`, or `Duplicate`).

---

## 4. Four-Tier Life Stage Background Matrices

Crawlers select **1 Background** and **exactly 2 of 3 Skills** from each of the four life stages.

### Human Life Stages
1. **Childhood (Rank 1)**: 12 background choices (`Latchkey Kid`, `Crafty Kid`, `Excitable Kid`, `Gymnast`, `Military Brat`, `MMO Kid`, `Only Child`, `Outdoor Kid`, `Problem Child`, `Scamp`, `Teacher’s Pet`, `Wild Child`).
2. **Adolescence (Rank 1)**: 12 background choices (`Family Farm`, `Drama Nerd`, `Drop-Out`, `Greek Life`, `Influencer`, `Jock`, `McJob`, `Popular`, `Religious`, `Student Government`, `Nerd`, `Weirdo`).
3. **Career / Profession (Rank 3)**: 12 background choices (`Criminal`, `Service Industry`, `Small Business Owner`, `Medical`, `Law Enforcement`, `Gig Worker`, `Teacher`, `Office Drone`, `Entertainer`, `Unhoused`, `Middle Manager`, `Military`).
4. **Hobby (Rank 2)**: 12 background choices (`Collector`, `Cosplay`, `Drinker`, `Gamer`, `Gym Rat`, `Hunting`, `Music`, `Motorsports`, `Climber`, `Pop Culture`, `Tinkering`, `Travel`).

### Animal Life Stages
1. **Youth (Rank 1)**: 6 background choices (`Abandoned`, `Farmed`, `Litter-Raised`, `Pampered`, `Runt`, `Stray`).
2. **Training (Rank 1)**: 6 background choices (`Clever`, `Free Range`, `Pack Mentality`, `Mischievous`, `Watcher`, `Well-Trained`).
3. **Adult (Rank 3)**: 6 background choices (`Guard`, `Pile of Floof`, `Scrapper`, `Show Animal`, `Support Animal`, `Working`).
4. **Quirk (Rank 2)**: 6 background choices (`Chow Hound`, `Cuddly`, `Curious`, `Hunter`, `Playful`, `Social`).

---

## 5. Non-Additive Duplicate Skill Handling

In the DCC RPG system:
- **Skill ranks chosen across multiple backgrounds do NOT stack additively.**
- If a skill is selected more than once (e.g. `Perception` in Childhood at Rank 1 and in Hobby at Rank 2), the final rank is calculated as the **highest rank selected** (`Math.max(1, 2) = Rank 2`).
- The application displays an explicit visual alert banner informing the player whenever duplicate selections occur.

---

## 6. Procedural 1-Click Randomizer

Clicking `[ 🎲 Randomize All ]` instantly generates a fully legal Crawler:
- Selects species and randomized standard array `[2, 3, 4, 5, 6]`.
- Picks 1 random background and 2 distinct skills for all 4 life stages.
- Resolves all duplicate ranks and flags warnings.
- Generates a thematic crawler name (e.g. *Carl the Unbroken*, *Princess Donut III*) and crawler number.

---

## 7. Starting Floors (1 through 5)

Players can designate the crawler's starting floor:
- Sets `system.details.floor` (e.g., `1st Floor`, `2nd Floor`, `3rd Floor`, `4th Floor`, `5th Floor`).
- Sets `system.details.level` (1 to 5).
- Future updates will layer automated roll tables for starting loot, additional skill ranks, and spell allocations for higher floor spawns.

---

## 8. Creature Size Categories

The CarlRPG system provides official standardized creature size categories:

| Size Number | Size Name | Full Label |
| :---: | :--- | :--- |
| **1** | `Tiny` | `1 Tiny` |
| **2** | `Small` | `2 Small` |
| **3** | `Petite` | `3 Petite` |
| **4** | `Medium` | `4 Medium` |
| **5** | `Large` | `5 Large` |
| **6** | `Huge` | `6 Huge` |
| **7** | `Colossal` | `7 Colossal` |
| **8** | `Gargantuan` | `8 Gargantuan` |

- **Character Sheet Selection**: Crawlers can select their creature size category from the dedicated dropdown on Page 1 (Core) in the AI Favor & Size stat block.
- **Creator Induction Terminal**: The induction terminal includes a Size dropdown pre-populated with all 8 sizes, defaulting to `Medium` for humans and customizable for animals.
- **Data Model**: Normalizes `system.attributes.size` with derived `sizeNumber`, `sizeLabel`, and `sizeInfo` object under `system.attributes`.

---

## 9. Level 1 Starter Combat Loadout & Universal Heal Spell

When creating a Level 1 Crawler, players choose their combat starter loadout from three distinct archetypes:

### 1. Basic Weapon (Rank 3), Equipped Gear & Attack
- Choose any existing weapon skill in the CarlRPG system (e.g. *Axe*, *Bow*, *Club*, *Crossbow*, *Dagger*, *Handgun*, *Herding Weapons*, *Improvised Weapons*, *Javelin*, *Lance*, *Longsword*, *Polearm*, *Quarterstaff*, *Rapier*, *Shotgun*, *Shuriken*, *Slingshot*, *Warhammer*).
- Receive that weapon skill at **Rank 3** (non-additive with background skills).
- **Equipped Gear in Inventory**: Automatically adds the physical weapon item to the crawler's inventory as a `gear` item equipped to the `hands` slot (`system.equipped = true`).
- **Configured Attack**: Automatically creates an `attack` item configured with the weapon's damage dice, damage stat, to-hit stat, to-hit rank (Rank 3), damage type, and combat notes, ready to roll to-hit and damage from Page 1 (Core) and Hotlist Slot 2.

### 2. Starter Spell (Rank 3) + 5 Normal Mana Potions
- Choose one of the 7 initial starter spells at **Rank 3**:
  - `Dirt Clod`
  - `Fire Fingers`
  - `Frost Scar`
  - `Mind Tickle`
  - `Shock Treatment`
  - `Soul Collector`
  - `Vine Porn`
- **5 Normal Mana Potions**:
  - Automatically added to the crawler's inventory.
  - Placed into Hotlist **Slot 3** (with the chosen spell on **Slot 1** and Heal on **Slot 2**).
  - When consumed via hotlist or inventory, completely refills current mana to maximum (`100% MP`) and decrements quantity.

### 3. Unarmed Combat & Damage Effect (Both Rank 3)
- Come in unarmed without a spell, choosing one of the 4 synergistic Hand-to-Hand and Damage Effect combo packages (both granted at **Rank 3**):
  - **Pugilism** + **Iron Punch** (+1d2 base bludgeoning damage)
  - **Foot Soldier** + **Smush** (deal ×2 total damage against targets at ≤20% Health Bar)
  - **Noggin Nocker** + **Skullcracker** (+1d4 base bludgeoning damage against foes of the same size)
  - **Wrasslin** + **Toss** (+1d8 base damage and throws the target 5 ft per 5 Ranks)

### 4. Universal Baseline: `Heal` (Rank 1)
- **All Crawlers** start with the **Heal** spell at **Rank 1** inscribed and assigned to Hotlist Slot 1 (or Slot 2 if a starter attack spell was chosen).
- **Active Healing Mechanics**: Casting `Heal` spends 2 MP and heals **up to 2 bars of health** (`2 × CON Mod` HP, or 20% of max HP). Target is **self only** (the caster). Healing is capped at maximum health, preventing overhealing, and displays full health recovery feedback on the chat card.

---

## 10. Health & Mana Initialization on Creation

When a crawler is created through the Induction Terminal or generated directly, their starting health and mana are dynamically bound to their core stats:

### Starting Health:
$$\text{Max HP} = 10 \times \text{getDCCStatModifier}(\text{CON})$$
- Current health (`hp.value`) and maximum health (`hp.max`) are initialized to the exact same value ($100\%$ full health).
- **Stat Modifier Scaling**:
  - CON 2: Modifier $+1 \implies \mathbf{10\text{ HP}}$
  - CON 3–5: Modifier $+2 \implies \mathbf{20\text{ HP}}$
  - CON 6–9: Modifier $+3 \implies \mathbf{30\text{ HP}}$

### Starting Mana:
$$\text{Max Mana} = \text{Intelligence Score (INT)}$$
- Current mana (`mana.value`) and maximum mana (`mana.max`) are initialized to the exact same value ($100\%$ full mana).
- E.g., INT 2 starts with $2\text{ MP}$, INT 5 starts with $5\text{ MP}$, INT 6 starts with $6\text{ MP}$.

---

## 11. Step 9: Psychological Background & Story Rollable Tables

During Step 9 of character creation, crawlers establish their backstory, emotional baggage, and unresolved motivations using three official rollable tables:
- **Table 11: Past Traumas (1d12)**: Endured hardships, losses, or phobias (e.g. *I witnessed a death*, *I have a fear of heights*).
- **Table 12: Loose Ends (1d12)**: Unfinished business from the surface world (e.g. *I didn’t finish writing my novel*, *I was about to open a restaurant*).
- **Table 13: Regrets (1d12)**: Lingering remorse or past moral dilemmas (e.g. *I didn’t ask them to marry me*, *I trusted the wrong people*).

### Induction Terminal Integration
- **1d12 Roll Buttons**: Each trait card includes a dedicated `[ 🎲 Roll 1d12 ]` button to generate a random entry directly from the table.
- **Table Dropdowns**: Players can choose any of the 12 official entries from a selector dropdown.
- **Full Text Editing**: A multi-line textarea lets players edit, elaborate, or type completely custom backstories from scratch.
- **1-Click Roll All**: A top-level `[ 🎲 Roll All 3 Tables ]` action button rolls all three background tables in a single click.
- **Randomize All Support**: The procedural randomizer (`[ 🎲 Randomize All ]`) rolls on all three tables automatically.

### Character Sheet Manual Editability & Creative Freedom
- **Page 2 (Gear & Story)**: The Past Trauma, Loose Ends, and Regrets story boxes feature inline `[ 🎲 Roll 1d12 ]` buttons in their headers.
- **Chat Cards**: Rolling from the sheet produces an interactive chat card displaying the table name, roll total, and italicized result quote.
- **Non-Destructive Appending**: Rolling on the character sheet preserves existing text by appending new rolls on a new line.
- **100% Freeform Editing**: The textareas remain standard, fully editable form fields bound to `system.details.pastTrauma`, `system.details.looseEnds`, and `system.details.regrets`, ensuring players never lose the option to be creative.
