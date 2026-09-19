# Game Master's Toolkit - Mob Compendium (`carl-rpg.mobs`)

The **CarlRPG Mob Compendium** (`carl-rpg.mobs`) provides an out-of-the-box library of all 22 entities from the official *Game Master's Campaign Toolkit - Entities List* (plus the canonical *Pack Rat* tutorial mob).

---

## 📋 Compendium Overview

- **Compendium Name**: `carl-rpg.mobs`
- **Compendium Type**: `Actor`
- **Ownership**: `PLAYER: OBSERVER`, `ASSISTANT: OWNER`
- **Storage**: Foundry VTT v12+ ClassicLevel binary database (`packs/mobs`)

---

## 👹 Included Entities & Statblock Summary

| # | Mob Name | Type | Size | Level | Health Bars | Max HP | DR | Move | Evade Diff | Surprise Diff | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Aranaea Magnus** | Neighborhood Boss | Large (5) | 7 | 10 × 4 HP | 40 | 1 | 30+S | 14+F | 12+F | Page 59 |
| 2 | **Chef BoyardOoze** | Mob | Small (2) | 4 | 4 × 3 HP | 12 | 2 | 10+S | 12+F | 11+F | Page 62 |
| 3 | **Rat Brute** | Mob | Petite (3) | 4 | 4 × 3 HP | 12 | 1 | 20+S | 12+F | 11+F | Page 62 |
| 4 | **Rat Shaman** | Mob | Petite (3) | 5 | 5 × 2 HP | 10 | 1 | 20+S | 12+F | 14+F | Page 63 |
| 5 | **Rat Hooligan** | Mob | Petite (3) | 8 | 8 × 2 HP | 16 | 2 | 20+S | 12+F | 14+F | Page 64 |
| 6 | **Critical Consensus** | Neighborhood Boss | Huge (6) | 8 | 11 × 5 HP | 55 | 2 | 10+S | 12+F | 12+F | Page 69 |
| 7 | **Canis Knights** | Mob | Petite (3) | 5 | 5 × 2 HP | 10 | 2 | 20+S | 12+F | 11+F | Page 87 |
| 8 | **Grimes** | Mob | Petite (3) | 5 | 5 × 4 HP | 20 | 2 | 15+S | 11+F | 11+F | Page 87 |
| 9 | **Trollogs** | Mob | Large (5) | 5 | 5 × 2 HP | 10 | 2 | 20+S | 13+F | 12+F | Page 88 |
| 10 | **Dread Wizard Grimblegore** | Neighborhood Boss | Large (5) | 10 | 12 × 5 HP | 60 | 2 | 20+S | 14+F | 14+F | Page 93 |
| 11 | **Cocaine Kobold** | Mob | Petite (3) | 6 | 6 × 3 HP | 18 | 2 | 20+S | 13+F | 13+F | Page 96 |
| 12 | **Danger Dingo** | Mob | Medium (4) | 5 | 5 × 3 HP | 15 | 2 | 30+S | 11+F | 12+F | Page 97 |
| 13 | **Jacked Kangaroo** | Mob | Medium (4) | 8 | 8 × 4 HP | 32 | 2 | 25+S | 12+F | 12+F | Page 97 |
| 14 | **Jazmanian Devil** | Mob | Petite (3) | 7 | 7 × 3 HP | 21 | 2 | 20+S | 13+F | 11+F | Page 98 |
| 15 | **Whambat** | Mob | Petite (3) | 3 | 3 × 2 HP | 6 | 2 | 20+S | 13+F | 11+F | Page 98 |
| 16 | **Mick Moran** | Neighborhood Boss | Large (5) | 12 | 12 × 5 HP | 60 | 2 | 20+S | 13+F | 14+F | Page 103 |
| 17 | **Brindle Grub** | Mob | Small (2) | 2 | 2 × 3 HP | 6 | 2 | 5+S | 11+F | 11+F | Page 106 |
| 18 | **Cow-Tailed Brindle Grub** | Mob | Petite (3) | 3 | 3 × 3 HP | 9 | 2 | 10+S | 11+F | 11+F | Page 106 |
| 19 | **Brindled Vespa** | Mob | Medium (4) | 8 | 8 × 4 HP | 32 | 0 | 20+S | 14+F | 11+F | Page 107 |
| 20 | **Unvaccinated Clurichaun** | Mob | Petite (3) | 3 | 3 × 1 HP | 3 | 2 | 25+S | 13+F | 11+F | Page 107 |
| 21 | **Laminak Manager** | Mob | Small (2) | 6 | 6 × 2 HP | 12 | 2 | 45+S | 13+F | 13+F | Page 107 |
| 22 | **Smombie** | Mob | Medium (4) | 4 | 4 × 3 HP | 12 | 2 | 20+S | 12+F | 11+F | Page 108 |
| 23 | **Pack Rat** | Mob | Tiny (1) | 2 | 2 × 2 HP | 4 | 1 | 20+S | 12+F | 11+F | Page 32 |

---

## ⚙️ Core Mechanics & Architecture

### 1. Variable Health Bars
Unlike player Crawlers (who always have 10 health bars), Mobs feature a variable number of bars (`hp.bars`) from 2 to 12.
- **HP Per Bar**: Strictly determined by the mob's CON modifier (`getDCCStatModifier(CON)`), unless explicitly overridden by `system.attributes.hp.hpPerBar`.
- **Damage Resolution**: Excess damage beyond an individual health bar is discarded according to official DCC RPG rules.

### 2. Evade & Surprise Difficulty Ratings
In CarlRPG, mobs do not roll active defense or evade rolls like crawlers. Instead, crawlers attack against the mob's **Evade Difficulty DC** ($10 + \text{Foe DEX Mod} + \text{Floor Number}$, written as e.g. `14+F`).
Mobs also possess a **Surprise Difficulty DC** (e.g. `12+F`) used when crawlers attempt to ambush or sneak past them.

### 3. Native Token Behavior
- **Actor Link**: Defaulted to `false` for all mobs. Each placed token on a scene maintains its own isolated synthetic actor state.
- **Sequential Naming**: The `preCreateToken` hook numbers mobs sequentially on scene drag-and-drop or copy-paste (`Mob 1`, `Mob 2`, `Mob 3`).
- **Token Dimensions**: Scaled automatically according to creature size (Petite/Small/Medium: 1x1, Large: 2x2, Huge: 3x3).

### 4. Mob Lore & AI Announcement Terminal
Page 1 (Core) of the mob sheet features a dedicated **Mob Lore & AI Announcement Terminal** containing:
- **Visual Description**: Biology, anatomy, and physical appearance.
- **Dungeon AI Announcement**: Broadcast quote in the voice of the snarky Dungeon AI.
- **Special Traits & Rules**: Passives, split mechanics, immunities, vulnerabilities, and environmental interactions.
- **Tactics & Notes**: Combat positioning, preferred targets, and attack sequences.

---

## 🛠️ Rebuilding the Compendium

To regenerate the binary LevelDB compendium after editing `src/data/mobs.mjs`:
```bash
node scripts/build-packs.mjs
```
The script writes all actor records into `packs/mobs` using `ClassicLevel`.
