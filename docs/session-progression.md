# Dungeon Crawler Carl RPG — Session Progression & 7-Tier Roll System

## Overview

In the Dungeon Crawler Carl Roleplaying Game, crawler progression and DM/AI balance correction are managed at the session level. The **Party Progression & Session Hub** (`DCCSessionManagerApp`) provides a live matrix across the entire crawler squad, an activity ledger tracking all rolls and deeds, and an automated end-of-session progression engine.

---

## 1. 7-Tier Roll Outcome Definitions

Every d20 roll evaluated against a Target Number (DC / AC) falls into one of 7 degrees of success:

| Tier | Condition | Description | Badge |
| :--- | :--- | :--- | :--- |
| **Critical Failure** | Natural 1 | Any d20 showing `1`, regardless of modifier or DC | `[CRIT FAIL]` |
| **Major Failure** | Miss by $10+$ | $\text{Total} \le \text{DC} - 10$ | `[MAJOR FAIL]` |
| **Failure** | Miss by $4 - 9$ | $\text{DC} - 9 \le \text{Total} \le \text{DC} - 4$ | `[FAILURE]` |
| **Near Miss** | Miss by $1 - 3$ | $\text{DC} - 3 \le \text{Total} \le \text{DC} - 1$ | `[NEAR MISS]` |
| **Success** | Meet or exceed by $< 10$ | $\text{DC} \le \text{Total} \le \text{DC} + 9$ | `[SUCCESS]` |
| **Major Success** | Exceed by $\ge 10$ | $\text{Total} \ge \text{DC} + 10$ | `[MAJOR SUCCESS]` |
| **Critical Success** | Natural 20 | Any d20 showing `20`, regardless of modifier or DC | `[CRIT SUCCESS]` |

---

## 2. Activity Ledger & Tracking

During an active session, the system automatically captures:
- **Trained Skill Checks**: Roll formula, natural d20, total, DC, and 7-tier outcome.
- **Untrained Skill Attempts**: Checks where Modified Rank $\le 0$ (rolled with Disadvantage `2d20kl + mod`), flagged with `[UNTRAINED]`.
- **Attacks & Spells**: Attacks to-hit and spell casts with mana consumption and damage cards.
- **Damage Given & Taken**: Synced automatically from combat and damage cards.
- **AI Favor & Popularity**: Live audience shifts, sponsor bonuses, and AI mood changes.
- **Loot Boxes**: Bronze, Silver, Gold, Platinum, Legendary, and Celestial Boss dispatches.

---

## 3. Manual DM Overrides & Customized Add Event Dialog

Every recorded event is editable inline:
- Adjust Target DC or override the outcome tier with a single click.
- **Customized Add Event Dialog (`+ Add Event`)**:
  - Modal dialog with full form inputs matching all ledger filter options:
    - **Crawler**: select any member of the crawler party.
    - **Action / Event Type**: Trained Skill, Untrained Skill Attempt, Attack, Spell, AI Favor, Popularity, Damage Dealt, Damage Taken, Loot Box, Stat Check, or Manual / Custom Event.
    - **Untrained Flag**: checkbox flagging attempts for promotion.
    - **Formula, Total & Natural d20**: custom roll parameters.
    - **Target DC / AC**: numeric threshold.
    - **7-Tier Outcome**: automatic calculation or explicit degree selection.
    - **Stat / Resource Delta**: numeric increment for favor, popularity, or damage.
    - **Notes**: custom roleplaying or descriptive notes.
  - Automatically aligns filters upon creation so the newly added event appears immediately.
- **Real-Time Live Updates**:
  - Open tracker windows update dynamically without requiring page refreshes or filter changes when rolls occur from sheets, damage is applied in/out of combat, or manual events are logged.
- Quick `[+5] / [-5]` or `[+1] / [-1]` adjustments for damage, favor, and popularity directly on crawler cards.

---

## 4. Tracked Roster & Party Grouping Management (West Marches Support)

In large campaigns or West Marches style worlds with rotating player attendance, GMs can easily organize crawlers into named parties and activate them per session:
- **Default Tracked-Only View**:
  - The Party Progression and Session Manager (PPSM) defaults to showing only tracked crawlers in the active party roster (`trackedOnly: true`). Untracked crawlers from other groups are automatically hidden to keep the view focused and clean.
- **Party Dropdown Roster Activation**:
  - Selecting a named party in the PPSM **Party** dropdown immediately tracks all members of that party in the active session and unselects/untracks all other crawlers (`session.trackedCrawlerIds = memberIds`).
  - Selecting *All Parties* tracks all world crawlers, while *Unassigned* tracks crawlers without a party affiliation.
- **"+ New Party" Modal (`[+ New Party]`)**:
  - Located directly on the Party Overview toolbar next to the Party dropdown.
  - Allows entering a new Party / Team name (or selecting an existing one with autocomplete).
  - Provides a full checkbox roster of all world crawlers with current affiliations and bulk **Select All** / **Deselect All** controls.
  - On submission: assigns the party name to all checked crawlers (`system.details.party`), sets them as the session's active tracked roster, updates the active party filter, and hides non-members.
- **Crawler Party Affiliation**:
  - Each crawler has a `Party / Team` field in their character sheet header (e.g. *"The Royal Court"*, *"Team Meadow Lark"*, or custom faction).
  - Parties can also be viewed and updated in bulk via the Session Hub or the Manage Roster modal.
- **Selective Session Tracking**:
  - A session can track all world crawlers (open roster) or be scoped to a specific party or custom subset (`trackedCrawlerIds`).
  - Only tracked crawlers have rolls, combat damage, favor, and loot logged into the active session ledger and crawler metrics.
  - Summary metrics (Total Damage, Kills, MVP, and Target of the Night) and end-of-session XP distribution strictly isolate to tracked crawlers.
- **Roster Controls & Filtering**:
  - **Quick Card Toggle**: Click the eye badge (`[Tracked]` / `[Untracked]`) on any crawler card to add or remove them from the active session tracking roster with one click.
  - **View Modes**: Switch between **Tracked Only** (hiding inactive crawlers) and **All Crawlers** (showing untracked crawlers dimmed with quick-add buttons).
  - **Party Dropdown Filter**: Select a party to activate its members and filter the Party Matrix and Activity Ledger.
  - **Manage Roster Modal (`[Manage Roster]`)**:
    - Opens a management dialog showing all world crawlers.
    - Quick actions: **Select All**, **Deselect All**, and **Select by Party** (unselecting non-members automatically).
    - Checkbox selection for precise crawler inclusion.
    - Inline party name editing to reassign crawlers without opening individual character sheets.

---

## 5. End-of-Session Progression

When concluding a session:
1. **Untrained Skills Review**: Inspects all untrained attempts with a one-click `[Train to Rank 1]` action that updates the crawler's actor sheet.
2. **Session XP Distribution**: Aggregates total damage dealt/taken, kills, quests, and tactical actions into an experience pool and distributes it across participating tracked crawlers.
3. **Dungeon AI Review Broadcast**: Posts an authentic Dungeon AI recap chat card highlighting the Session MVP, Target of the Night, and audience statistics for tracked participants.
4. **Session Archiving**: Seals the session record into the permanent archive and prepares a fresh session.

---

## 6. Global Floor & Combat Evade Resolution System

In the Dungeon Crawler Carl RPG, combat difficulty scales dynamically with the current dungeon floor. The entire game world is synchronized to a single active floor value at any given time.

### Global Floor Setting
- **Single Source of Truth**: The active floor is stored in the world setting `carl-rpg.currentFloor` (default: Floor 1, minimum: 1).
- **GM Floor Controls**:
  - Accessible directly in the **Party Progression & Session Hub** (`DCCSessionManagerApp`) header controls (`Floor: [ 1 - Floor 1 ... 18 - Floor 18 ]`).
  - Accessible via standard Foundry VTT System Settings.
  - Programmatic access via `game.dcc.getCurrentFloor()`, `game.dcc.setCurrentFloor(floor)`, `DCCActor.getCurrentFloor()`, `DCCActor.setCurrentFloor(floor)`, or `window.carl.getCurrentFloor()`.
  - Changing the floor immediately re-renders open sheets and updates effective mob target DCs across the system.

### Mob Evade Difficulty: Base + F
- **Formula**: Every mob entity has an Evade difficulty defined as a base number plus the current floor:
  $$\text{Target Evade DC} = \text{Base Evade} + F$$
  where $F$ is the current floor number.
- **Base Evade Value**:
  - Extracted from the mob's statblock (e.g., `12+F`, `14+F`, `18+F`).
  - If unspecified, defaults to $10 + \text{DEX Mod}$.
- **Dynamic Derivation**:
  - The mob's character sheet displays both the base formula (e.g. `14+F`) and the active threshold (e.g. `(DC 15)` on Floor 1, `(DC 18)` on Floor 4).
  - Accessed programmatically via `mob.getEvadeTargetDC()` or `mob.system.attributes.effectiveEvadeDC`.

### Automatic Attack Target Hit Resolution
- When an attack roll (`rollAttack`) or spell attack (`rollSpellAttack`) is executed, the system automatically checks for active targets:
  1. Targets passed explicitly via roll options (`options.targets` or `options.target`).
  2. Targeted tokens currently selected by the rolling user (`game.user.targets`).
- **Hit / Miss Evaluation**:
  - Compares the attack total directly to each target's Target DC (for mobs: $\text{Base} + F$; for crawlers: $\text{Attack Total} \text{ vs Evade}$).
  - Automatically embeds an interactive **Target Evaluation** badge row in the attack chat card:
    - Target Name
    - Target DC
    - `[HIT (+X)]` in bright green or `[MISS (-X)]` in vivid red
  - Recorded in the chat message flags (`flags['carl-rpg'].targetResults`).

### Non-Crawler Attack Evade Button
- When an attack is rolled by a **non-crawler** (such as a mob, boss, or hostile NPC), the attack chat card automatically embeds an interactive **Roll Evade** button (`.dcc-evade-roll-btn`).
- **Crawler One-Click Evade**:
  - Any player crawler who is the target of the attack can click the button.
  - The system resolves the user's controlled token or assigned character (`game.user.character`).
  - Executes `crawler.rollEvade({ attackTotal, attackerName, floor })`.
  - Generates an official Evade roll card comparing the crawler's Evade roll ($d20 + \text{DEX Mod} + \text{Gear} + \text{Buffs}$) against the incoming attack total:
    - **SUCCESSFULLY EVADED!** if Evade $\ge$ Attack Total.
    - **EVADE FAILED — HIT TAKEN!** if Evade $<$ Attack Total.
