# Crawler Achievements & Trophy Room Subsystem

## Overview
In the Dungeon Crawler Carl Roleplaying Game (CarlRPG), Crawlers earn iconic achievements from the Dungeon AI over time as they progress through dungeon floors, defeat monstrous floor bosses, perform absurd combat maneuvers, entertain the viewing audience, and survive near-impossible encounters.

The **Crawler Achievements Subsystem** provides a persistent, first-class achievement tracking and viewing architecture across character sheets, manager dialogs, combat encounters, and session ledgers.

---

## Core Features

### 1. Dedicated Crawler Sheet Tab ("6: Achievements")
Every Crawler character sheet features a dedicated **6: Achievements** tab (`achievements.hbs`):
- **Trophy Room Summary**:
  - Displays total achievements unlocked and total AI Favor earned.
  - Interactive tier pills tallying trophies by tier: **Bronze**, **Silver**, **Gold**, **Platinum**, **Legendary**, and **Celestial**.
- **Search & Filters**:
  - Filter achievements by trophy tier (`All`, `Bronze`, `Silver`, `Gold`, `Platinum`, `Legendary`, `Celestial`, `Quest`, `Secret`, `Special`).
  - Real-time text search filtering across achievement names, AI quotes, rewards, and notes.
- **Achievement Cards**:
  - Custom tier badge, border, and background color coding.
  - Dungeon floor indicator (e.g. `1st Floor`, `3rd Floor`) and timestamp/session earned.
  - Iconic Dungeon AI announcement quote formatted in high-contrast red callouts.
  - Reward details (e.g. `Bronze Apparel Box`, `+3 AI Favor`, `Silver Quest Box`) and box contents.
  - Direct action buttons: **Announce to Chat**, **Edit**, and **Delete**.
- **Actions**:
  - **+ New Achievement**: Create a custom achievement item directly on the crawler.
  - **Achievement Catalog**: Launch the interactive `DCCAchievementManagerApp`.

### 2. Item Document Type (`achievement`)
Registered in `template.json` and `system.json`:
- `system.tier`: Trophy tier (`bronze`, `silver`, `gold`, `platinum`, `legendary`, `celestial`, `quest`, `secret`, `special`).
- `system.floor`: Floor number where the achievement was unlocked.
- `system.dateEarned`: Timestamp or session description.
- `system.quote`: The official Dungeon AI voice announcement.
- `system.reward`: Reward granted (e.g., loot box, titles, apparel).
- `system.rewardContents`: Specific loot items or benefits inside the reward.
- `system.favor`: AI Favor granted.
- `system.xp`: Bonus experience awarded.
- `system.description`: Background or unlock condition notes.

### 3. Dungeon AI Chat Announcements
Achievements can be broadcast to the Foundry VTT chat log at any time:
- Via `actor.announceAchievement(item)` or `item.announce()`.
- Renders an authentic Dungeon AI announcement card with speaker alias `THE DUNGEON AI`, Crawler portrait, tier styling, quote, and reward breakdown.

### 4. Canonical Achievement Library (`DCC_ACHIEVEMENTS`)
Includes presets directly from CarlRPG adventures and lore:
- **Where’d Ya Get Those Peepers?** (Bronze / Quest — Passive Perception Quest)
- **Ding-Dong Ditch** (Silver / Quest — Surveillance Drone destruction)
- **You’ll Shoot Your Eye Out!** (Silver / Quest — Stiggy neutralization)
- **Floor Combat MVP** (Gold / Combat — Highest damage in encounter)
- **First Blood of the Desolation** (Bronze / Combat — First dungeon kill)
- **Boss Annihilator** (Celestial / Combat — Killing blow on a Floor Boss)
- **Fashion Disaster Survivor** (Bronze / Special — Fighting without pants)
- **Improvised Demolitions Expert** (Platinum / Special — Multi-kill environmental explosion)
- **Sponsor's Little Darling** (Gold / Social — Corporate sponsor acquisition)
- **Goblin Defenestration Specialist** (Silver / Combat — Throwing enemies off cliffs/windows)

### 5. Achievement Manager & Trophy Room (`DCCAchievementManagerApp`)
An interactive application (`src/apps/achievement-manager.mjs`):
- **Canonical Library Tab**: Browse all canonical achievements, filter by tier or search terms, and award them to any crawler in the party with one click.
- **Party Trophy Room Tab**: Inspect all trophies and achievements unlocked across the entire party of crawlers in one unified screen.
- Accessible via character sheet button, macro, or `game.dcc.achievementManager` / `window.carl.openAchievementManager()`.

### 6. Combat Metrics & Session Engine Integration
- When the GM awards an MVP, loot box, or custom award via `DCCCombatMetrics.dispatchAIAward(...)`, an embedded `achievement` item is automatically created on the recipient Crawler.
- When `DCCSessionEngine.recordLootBox(...)` is executed, the loot box is persisted as an achievement in the crawler's trophy collection.

---

## Verification & Automated Tests
Comprehensive unit tests are maintained in `tests/achievements.test.mjs`:
```bash
node --test tests/achievements.test.mjs
```
Runs 8 detailed subtests validating schemas, canonical presets, actor document methods, sheet context calculations, combat metrics persistence, session engine sync, and manager app library flows.
