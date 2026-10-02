# Dungeon Crawler Carl RPG — Rapid Batch Roll & Event Importer

## Overview

When running an in-person Dungeon Crawler Carl tabletop game, players roll physical dice, declare actions, and tally damage quickly without operating digital character sheets directly. The **Rapid Batch Roll & Event Importer** (`DCCRapidBatchImportApp`) and conversational text parser (`DCCRapidTextParser`) provide ultra-fast ways for GMs or scribes to transcribe physical table play directly into Foundry's active session ledger.

---

## ⚡ Fast Input Methods

### 1. Batch / Paste Modal (`[ ⚡ Rapid Batch Import ]`)
- Accessible from:
  - The Session Manager header toolbar (`[ ⚡ Rapid Import ]`)
  - The Activity Ledger tab toolbar (`[ ⚡ Rapid Batch Import ]`)
  - Programmatically via `game.dcc.applications.DCCRapidBatchImportApp` or `window.carl.rapidBatchImport()`
  - Chat command: `/rapidlog` or `/batchlog`
- Paste raw multi-line notes, speech-to-text transcripts, or shorthand logs.
- Click **"Parse Text into Preview"** (or press the button) to instantly parse all lines into a live, editable preview table.
- Edit any crawler, action name, roll total, DC, 7-tier outcome, damage, healing, mitigation, kill flag, or untrained flag before saving.
- Click **"⚡ Import All to Session Ledger"** to commit all rows in a single transaction.

### 2. Instant Chat Command (`/log <shorthand>` or `/rlog <shorthand>`)
Type directly into the Foundry chat prompt during in-person play:
```
/log Carl Dodge 16 vs 14 blocked 5 dmg
/log Donut Magic Missile 18 vs 12 hit 14 dmg
/log Elle Heal 8 healing on Carl
/log Prepotente Headbutt nat 20 crit 35 dmg killing blow
/log Katia Disarm 9 vs 15 untrained fail
/log Carl took 12 dmg from acid trap
/log Party AI Favor: +5 favor for audience stunt
```
- Suppresses the message from normal chat broadcast.
- Instantly parses the shorthand line, adds the entry to the active session ledger, increments the crawler's combat metrics (`damageDealt`, `damageTaken`, `healingDone`, `damageMitigated`, `kills`, `untrainedAttempted`), and refreshes open session windows in real time!

---

## 🔍 Intelligent Shorthand Syntax

The conversational parser automatically extracts fields without requiring strict syntax:

| Component | Example Formats | Extracted Value |
| :--- | :--- | :--- |
| **Crawler Name** | `Carl ...`, `Donut ...`, `Princess Donut ...` | Matched to world crawler by full name or first name |
| **Roll Total vs DC** | `18 vs 14`, `16/12`, `total 19 vs dc 15`, `rolled 15 against AC 12` | Total: `18`, Target DC: `14` |
| **Natural Crits** | `nat 20`, `natural twenty`, `crit`, `nat 1`, `crit fail`, `fumble` | 7-tier Critical Success or Critical Failure outcome |
| **Damage Dealt** | `14 dmg`, `25 damage`, `dealt 18` | `damage: 14` (accumulated in `crawler.damageDealt`) |
| **Damage Taken** | `took 12 dmg`, `took 15 damage from trap` | `damage: 12` (accumulated in `crawler.damageTaken`) |
| **Damage Mitigation** | `blocked 5 dmg`, `mitigated 8`, `dr 4`, `5 mit` | `mitigation: 5` (accumulated in `crawler.damageMitigated`) |
| **Healing Done** | `8 healing`, `healed 12`, `10 hp`, `heal: 8` | `healing: 8` (accumulated in `crawler.healingDone`) |
| **Killing Blow** | `killing blow`, `boss kill`, `slain`, `fatal`, `killed` | `isKill: true` (accumulated in `crawler.kills` & XP bonus) |
| **Untrained Attempt** | `untrained`, `u/t`, `disadv`, `no training` | `isUntrained: true` (flagged for End-of-Session Promotion) |
| **Favor & Popularity** | `+5 favor`, `-2 favor`, `+10 pop`, `popularity: +15` | Accumulated into AI Favor / Popularity score |
| **Recipient Notes** | `on Carl`, `to Donut`, `at Katia` | Automatically formatted as note (`Target: Carl`) |

---

## 📊 Automatic Metrics Integration

Every batch imported or chat-logged roll automatically feeds into:
1. **Crawler Performance Matrix**:
   - `damageDealt`, `damageTaken`, `healingDone`, `damageMitigated`, `kills`, `untrainedAttempted`
2. **Session Summary Analytics**:
   - `totalDamageDealt`, `totalDamageTaken`, `totalKills`, `totalHealingDone`, `totalDamageMitigated`, `totalUntrainedAttempts`
   - Real-time MVP and Target of the Night calculations
3. **End-of-Session Review**:
   - Untrained skill attempts appear in the Wrap-up tab with 1-click `[Train to Rank 1]` buttons.
   - Kills, damage, and tactical deeds directly calculate into session XP distribution without manual recalculation.
