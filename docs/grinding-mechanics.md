# Dungeon Crawler Carl RPG — Grinding & Skill Advancement Mechanics

## Overview

In the **Dungeon Crawler Carl Roleplaying Game** (published by Renegade Game Studios), **"Grinding"** is an explicit, core gameplay mechanic directly mirroring the LitRPG principles of Matt Dinniman's novels. 

Rather than bogging down sessions with endless, low-stakes combat rolls against trash mobs, CarlRPG provides a streamlined, abstracted **Grinding System**. Crawlers deliberately set aside blocks of in-game time between major story beats to hunt roaming mobs, drill weapon stances, practice spell incantations, and hone their physical and mental skills.

---

## 1. The Core Grinding Rules

### A. The 5-Hour Safe Daily Limit
- A crawler party can safely spend up to **5 hours per in-game day** grinding without penalty.
- During these 5 hours, crawlers are assumed to hunt local mobs, practice techniques, or harvest materials with standard caution.
- No exhaustion checks are required for the first 5 hours.

### B. Extended Grinding & The Endurance Check
Crawlers who choose to push their limits and grind past the 5-hour safe threshold risk physical and mental exhaustion:
- **Each Hour Past 5**: Every additional hour spent grinding beyond 5 hours requires an **Endurance Skill Check** (Unopposed Constitution-based check: $1d20 + \text{Modified Rank} + \text{CON Mod}$).
- **The DC**: The standard DC for extended grinding fatigue is typically $10 + \text{Floor Number} + (\text{Hours Past 5})$.
- **Endurance Skill Synergy**:
  - The canonical **Endurance** skill specifically notes:
    > *"Prevent fatigue and avoid Fatigued Debuff during long-distance travel and grinding."*
    - **Rank 5**: Ignore the effects of a Major Failure on Endurance checks.
    - **Rank 10**: Roll with Advantage if not already Fatigued.
    - **Rank 15**: Critical Failures are converted to Standard Failures.
- **Fatigued Debuff Penalty on Failure**:
  - Failing the Endurance check inflicts the **Fatigued Debuff** (`type: "debuff"`):
    > *"You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest."*
  - Because Fatigued is **stackable**, continuing to grind while exhausted quickly cripples a crawler's combat efficacy.

### C. The Global Floor Timer Clock & Non-Bonus Hours Decrementing
- **Global Floor Timer Setting**: The dungeon tracks a global, world-scoped **Floor Timer Clock** (`carl-rpg.floorTimer`, defaulting to 100 hours remaining on the floor).
  - Can be manually adjusted or inspected at any time via:
    - The character sheet Page 1 Core resting bar (`.dcc-floor-clock-widget`).
    - The dedicated Grinding application (`DCCGrindApp`).
    - Programmatically via `DCCActor.getFloorTimer()`, `DCCActor.setFloorTimer(val)`, and `DCCActor.decrementFloorTimer(hours)`.
- **Decrementing by Non-Bonus Hours Accrued**:
  - Executing a grinding session subtracts strictly **non-bonus hours** from the global Floor Timer Clock.
  - Bonus hours gained from maps (Neighborhood Map: $+1$ hr; Borough Map: $+2$ hrs) or Complications (Wandering Merchant: $+1$ hr) represent enhanced training efficiency and geographic optimization — they are added to the crawler's accrued training pool without consuming additional floor time!
  - **Example**: If a crawler grinds for **6 hours** and possesses a **Neighborhood Map** ($+1$ hr bonus):
    - The crawler accrues **7 grinding hours** into their persistent training pool (`totalEarnedHours = 7`).
    - The global Floor Timer Clock is decremented by only **6 floor hours** (`nonBonusHours = 6`).
- Certain enemy abilities (such as *Mind Horror* chatter on Floor 2) or dungeon hazards can drain additional hours from the floor collapse timer if an encounter goes poorly.

### D. Guide & Map Modifiers
Certain allies, maps, environmental factors, or quest rewards modify grinding efficiency by expanding the daily safe threshold and adding bonus training hours:
- **Guide Insight (e.g. Huey / Bob)**: Harmonizing with Huey grants insights that make grinding more efficient for the rest of the day, allowing crawlers to **add 1 safe hour** to their grind at no penalty (raising the threshold by $+1$ hour).
- **Neighborhood Map**: Having a map of the local neighborhood grants geographic familiarity, allowing crawlers to **add 1 safe hour** to their daily grind (+1 hour to safe limit) and grants **+1 bonus grinding hour** to the earned pool without consuming floor hours.
- **Borough Map (Burrough Map)**: Having a broader borough/district map provides comprehensive route and landmark awareness, allowing crawlers to **add 2 safe hours** to their daily grind (+2 hours to safe limit) and grants **+2 bonus grinding hours** to the earned pool without consuming floor hours.
- **Stacking**: Guide insights and area maps stack! For example, a crawler party with a Borough Map (+2 hrs) and Huey's guide insight (+1 hr) can safely grind for up to **8 hours per day** without making a single Endurance exhaustion check.

---

## 2. Skill Advancement Mechanics

In CarlRPG, skills advance through active use and dedicated grinding time rather than arbitrary class-wide level-ups.

### Step 1: Marking Skills Through Use ("Checked" Flag)
- Whenever a crawler actively uses a skill during an encounter, exploration, or roleplay challenge (regardless of whether the roll succeeds or fails), that skill is marked as **Checked** (`system.checked: true`).
- In the Foundry VTT system, every skill document includes a `checked` boolean flag and a sheet checkbox indicator.

### Step 2: Earning & Banking Grinding Hours (Use It or Lose It Pool)
- **Executing the Party Grind**: When crawlers execute a grinding session, all selected party members earn grinding hours equal to the session duration plus any **bonus hours** gained from maps (+1 Neighborhood Map, +2 Borough Map) or Complication events (+1 Wandering Merchant).
- **Use It or Lose It (General Pool)**:
  - Hours sitting unallocated in a crawler's general bank pool (`system.details.bankedGrindHours`) are **reduced to zero at the start of a new grind session** — *use it or lose it*!
  - Crawlers are expected to spend their earned hours immediately or bank them directly into specific skills before setting out on their next grind.
- **Skill-Invested Hours Persist Across Grinds**:
  - Hours allocated directly toward a specific skill (`system.investedHours`) are **never lost**!
  - They remain securely banked on that skill across multiple days and grind sessions until the crawler attempts an Advancement check.
- **Multi-Skill Grinding & In-Sheet Allocation**:
  - In a single grinding session or directly on their character sheet, crawlers can allocate their earned hours across **multiple skills simultaneously**!
  - Using the inline `[-1]`, `[+1]`, and `[Fill]` buttons on Page 3 (Skills) of their character sheet, crawlers can spend banked hours from their own pool at any time.

### Step 2B. Party-Wide Grinding Hub & Scene Floor Clock HUD
- **Party Selection Roster**: In the `DCCGrindApp` hub, checkboxes let the party or GM select exactly which crawlers participate in the grind.
- **Crawler Sub-Tabs**: Switch between party members within the hub to inspect each crawler's skills, banked pool, and test advancement checks individually.
- **Individual Endurance Checks**: Extended grinding excess hours ($> 5$ hours safe limit) trigger separate Endurance checks ($1d20 + \text{Rank} + \text{CON Mod}$ vs $10 + \text{Floor} + \text{Excess}$) for each crawler. `Fatigued` debuffs are applied *only* to crawlers who fail their individual checks.
- **Scene Floor Clock HUD (`DCCFloorClockHUD`)**: A persistent floating widget anchored below Foundry's scene navigation displays the real-time hours remaining until floor collapse, with quick GM adjustment controls (`-5h`, `-1h`, `+1h`, `+5h`) and a 1-click `[Grind]` launcher.
- **Single Floor Clock Decrement**: Floor clock time is decremented once for the party by non-bonus hours accrued (`hours`).

### Step 3: High-Level Accumulation (Invested Hours on Skills)
- Each skill tracks its own **Invested Hours** (`system.investedHours`) toward the current rank requirement:
  $$\text{Required Grinding Hours} = \text{Current Skill Rank}$$
- At higher levels, advancing a skill will naturally require **multiple grind sessions** across several in-game days:
  - *Advancing from Rank 14 to Rank 15* requires **14 hours**.
  - **Day 1**: Grind 5 safe hours, allocate 5 hours to *Pugilism* (Invested: 5 / 14 hrs).
  - **Day 2**: Grind 5 safe hours, allocate 5 hours to *Pugilism* (Invested: 10 / 14 hrs).
  - **Day 3**: Grind 4 hours, allocate 4 hours to *Pugilism* (Invested: 14 / 14 hrs).
  - The skill now meets the full requirement and is ready for the Advancement Breakthrough!

| Current Rank | Target Rank | Required Grinding Hours | Example Pacing |
| :---: | :---: | :---: | :--- |
| **Rank 0** (Untrained) | **Rank 1** (Trained) | 1 Hour | Single session |
| **Rank 1** | **Rank 2** | 1 Hour | Single session |
| **Rank 2** | **Rank 3** | 2 Hours | Single session |
| **Rank 3** | **Rank 4** | 3 Hours | Single session |
| **Rank 4** | **Rank 5** | 4 Hours | Single session |
| **Rank 5** | **Rank 6** | 5 Hours | 1 full safe daily grind |
| **Rank 9** | **Rank 10** | 9 Hours | 2 daily sessions (e.g. 5 hrs + 4 hrs) |
| **Rank 14** | **Rank 15** | 14 Hours | 3 daily sessions (e.g. 5 hrs + 5 hrs + 4 hrs) |

### Step 4: The Advancement Roll
Once a skill has banked sufficient invested hours ($\text{Invested Hours} \ge \text{Current Rank}$), the crawler triggers the **Advancement Roll**:

$$\text{Advancement Success Condition: } \mathbf{d20 \ge \text{Current Skill Rank}}$$

- **Success ($\mathbf{d20 \ge \text{Current Rank}}$)**: The skill permanently increases by **+1 Rank**.
  - All derived values (Modified Rank, Total Skill Bonus, To-Hit bonuses, and Rank Damage Dice) update automatically.
  - Milestone perks (**Rank 5**, **Rank 10**, **Rank 15**) unlock automatically.
  - Consumes the required hours and clears the `checked` flag.
- **Failure ($\mathbf{d20 < \text{Current Rank}}$)**: The skill does not advance this session. The crawler logged intensive practice, but needs further experience to achieve a breakthrough. The `checked` status is cleared for the next cycle.

> [!TIP]
> Notice how the math reflects the narrative: moving from Rank 1 to Rank 2 succeeds on a roll of $1 - 20$ (almost automatic), whereas moving from Rank 14 to Rank 15 requires rolling a $14+$ on the d20 (35% chance) and 14 cumulative hours of dedicated effort, accurately representing how mastering elite techniques demands both immense time and intense focus.


---

## 3. Grinding Complications Table

Grinding is not conducted in an empty vacuum. Wandering dungeon corridors risks attracting scouts, triggering traps, or drawing scavenging mobs.

When the party engages in a grinding session, the Game Master can roll on or select from the **Grinding Complications Table (1d20)**:

| Roll (1d20) | Complication / Event | Description & Mechanical Effect |
| :---: | :--- | :--- |
| **1** | **Bugaboo / Boss Scout Ambush** | A patrol of hostile trackers (e.g. *Bugaboo Socket-Pickers* or *Kobold Riders*) ambushes the party mid-grind. Immediate combat encounter with Surprise Difficulty check. |
| **2–3** | **Janitor Mob Infestation** | Slaying mobs without incinerating or disposing of the bodies attracts hordes of Janitor Mobs (*Pack Rats* on Floor 1; *Brindle Grubs* on Floor 2). If left unchecked, grubs begin their 10-hour cocoon pupation into *Brindled Vespas*. |
| **4–5** | **Labyrinthine Dead End / Trap** | The party gets turned around in twisting alleys or steps on a booby-trapped tile (e.g. *Pothole Plot* or *Bricktop Barrage*). Requires an Unopposed Tracking or Evade check; failure inflicts 1d6 physical damage or adds +1 wasted hour to the floor clock. |
| **6–7** | **Equipment Wear & Gear Snag** | A weapon dulls, armor straps snap, or ammunition is depleted. 1 equipped gear item loses 1 DR or requires 15 minutes of repairs before next combat. |
| **8–10** | **Rival Crawler Sighting** | The party spots or crosses paths with another crawler squad. The GM can initiate a social confrontation, mutual trade agreement, or tense standoff. |
| **11–14** | **Clean, Routine Grind** | Standard, smooth grinding. All allocated hours apply without incident. |
| **15–17** | **Valuable Scavenged Junk** | In addition to training hours, the crawlers recover $1d4$ units of *Misc Junk* suitable for Engineering/Crafting or 10–50 copper/silver dungeon coin. |
| **18–19** | **Wandering Merchant / Helpful Guide** | The party encounters a helpful friendly entity (e.g. *Bob the Sprite* or *Huey*). Grants advice allowing $+1$ bonus safe grinding hour or a chance to purchase consumables. |
| **20** | **AI-Approved Carnage (Loot Box Award)** | The crawlers dispatch a pack of mobs with such flair, brutality, or comedic timing that the Dungeon AI takes notice. The AI broadcasts an announcement and awards the crawler a **Bronze or Silver Loot Box**! |

---

## 4. Resting & Safe Rooms

Crawlers recover their Health Bars and Mana reserves through four canonical resting durations, accessible directly by the Health total on Page 1 of the Character Sheet:

### A. 1-Hour Non-Combat Rest (`1h`)
- **Duration**: 1 hour of quiet, uninterrupted non-combat time.
- **Health Recovery**: **1 Health Bar slot** (+CON Mod HP, capped at max HP).
- **Mana Recovery**: **+5 Mana** (capped at max Mana).
- **Conditions**: Does not clear fatigue or injuries.

### B. 2-Hour Short Rest (`2h Short`)
- **Duration**: 2 hours of rest in a barricaded or secure area.
- **Health Recovery**: **5 Health Bar slots** (+5 × CON Mod HP, capped at max HP).
- **Mana Recovery**: **Half Mana regeneration** rounded down (`floor(Max Mana / 2)`).
- **Conditions**: Clears temporary short rest conditions (such as *Minor Injury*).

### C. 8-Hour Safe Room Long Rest (`8h Safe Room`)
- **Duration**: 8 hours of uninterrupted sleep inside a certified Dungeon Safe Room.
- **Health Recovery**: **All 10 Health Bars restored to 100%** (full HP).
- **Mana Recovery**: **Reserves fully refilled** to maximum Mana.
- **Conditions**: Clears all stacked **Fatigued Debuffs** accumulated during grinding or forced marches, as well as temporary combat conditions and *Major Injuries*.
- **Loot Box Ceremony**: Safe rooms are the canonical setting for crawlers to crack open their earned Loot Boxes, equip new armor, and assign new spells to their Hotlist.

### D. 30-Hour Full Day Rest (`30h Full Day`)
- **Duration**: 30 hours (one full canonical Dungeon Day) in a Safe Room or secure sanctuary.
- **Health & Mana Recovery**: 100% Health and 100% Mana.
- **Recover From Injuries**: Complete biological and skeletal regeneration. Clears all stacked fatigue and cures all injuries, including *Minor Injury*, *Major Injury*, *Long-Term Minor Injury*, and *Long-Term Major Injury*.

---

## 5. Summary Matrix for Players & GMs

```mermaid
flowchart TD
    A["Begin Daily Grinding Session"] --> B{"Hours Spent?"}
    B -->|<= 5 Hours| C["Safe Grind: No Fatigue Checks"]
    B -->|> 5 Hours| D["Extended Grind: Make Endurance Check per Hour"]
    
    D -->|Success| E["Avoid Fatigue: Accrue Hours"]
    D -->|Failure| F["Gain Fatigued Debuff (-1 Checks, Half Move)"]
    
    C --> G["Allocate Hours to Checked Skill (Hours = Current Rank)"]
    E --> G
    F --> G
    
    G --> H["Roll Advancement: 1d20 >= Current Rank"]
    H -->|Success| I["Skill Rank Increases by +1!"]
    H -->|Failure| J["Skill Remains at Current Rank (Try Again Next Session)"]
    
    I --> K["Floor Timer Advances by Total Hours Spent"]
    J --> K
    K --> L["Retreat to Safe Room for 8-Hour Long Rest"]
```
