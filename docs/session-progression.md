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

## 4. End-of-Session Progression

When concluding a session:
1. **Untrained Skills Review**: Inspects all untrained attempts with a one-click `[Train to Rank 1]` action that updates the crawler's actor sheet.
2. **Session XP Distribution**: Aggregates total damage dealt/taken, kills, quests, and tactical actions into an experience pool and distributes it across the party.
3. **Dungeon AI Review Broadcast**: Posts an authentic Dungeon AI recap chat card highlighting the Session MVP, Target of the Night, and audience statistics.
4. **Session Archiving**: Seals the session record into the permanent archive and prepares a fresh session.
