# Dungeon Crawler Carl RPG — Weapon Skill Proficiency & Technique Architecture

## Overview

The **Weapon Skill Proficiency & Technique Subsystem** establishes a flexible, data-driven hybrid schema for associating weapon items (`gear` where `isWeapon: true` and dedicated `attack` items) with crawler skills and combat maneuvers.

It supports:
1. **Multi-Skill Trained Proficiency**: Weapons can draw proficiency from weapon categories, specific weapon models, broad damage types, and explicit skill links.
2. **Specialization Precedence**: The most specialized or highest-ranked skill leads the d20 attack roll, preventing runaway bonus stacking.
3. **Techniques in Conjunction**: Combat maneuvers and damage effects (e.g., *Iron Punch*, *Dirty Fighting*, *Serrated Tear*) operate alongside the base to-hit proficiency, adding damage dice, status debuffs, or special conditions without diluting the primary weapon skill.

---

## Data Schema & Architecture

### 1. Weapon Item Fields (`AttackDataModel` & `GearDataModel`)

Both `attack` items and physical `gear` items include:

| Property | Type | Default | Description |
|---|---|---|---|
| `weaponCategory` | `String` | `""` | Broad family (e.g. `"Power Weapons"`, `"Edge"`, `"Bashing"`, `"Reach"`, `"Ranged"`, `"Hand to Hand"`). |
| `weaponType` | `String` | `""` | Specific weapon model or archetype (e.g. `"Chainsaw"`, `"Longsword"`, `"Unarmed Strike"`, `"Shotgun"`). |
| `associatedSkills` | `Array<String>` | `[]` | Explicit skill references (e.g. `["Chainsaws", "Power Weapons", "Slashing"]`). |
| `proficiencyMode` | `String` | `"highest"` | Resolution strategy: `'highest'` (specialization precedence), `'synergy'` (highest +1 per secondary $\ge$ R3), or `'manual'`. |
| `selectedSkill` | `String` | `""` | Optional explicit skill lock (blank for automatic highest-rank selection). |
| `optionalEffects` | `Array<String>` | `[]` | Selectable damage effects / combat maneuvers valid for this weapon. |
| `selectedEffect` | `String` | `""` | Active damage effect pre-selected on the item. |

### 2. Skill Technique Fields (`SkillDataModel`)

Skills include dedicated properties to distinguish combat techniques from baseline to-hit proficiencies:

| Property | Type | Default | Description |
|---|---|---|---|
| `isTechnique` | `Boolean` | `false` | When `true`, indicates this skill acts as a damage effect / maneuver rather than a primary to-hit check. |
| `appliesTo` | `Array<String>` | `[]` | List of weapon types, categories, or parent skills this technique applies to (e.g. `["Chainsaws", "Power Weapons"]` or `["Pugilism"]`). |
| `techniqueConfig` | `SchemaField` | Object | Structured technique payload (`damageBonus`, `damageType`, `debuffName`, `cooldown`). |

---

## 4-Layer Hybrid Skill Matching

When evaluating a weapon, the system matches skills through four layers:
1. **Explicit Links (`associatedSkills`)**: Any skill explicitly tagged on the weapon.
2. **Specific Model (`weaponType`)**: Matches exact weapon skill (e.g. `"Chainsaw"` matches skill `"Chainsaws"`).
3. **Weapon Group (`weaponCategory`)**: Matches family skills via `DCC_WEAPON_GROUP_MAP` (e.g. `"Edge"`, `"Power Weapons"`).
4. **Damage Type**: Matches the primary damage type of the weapon parts (e.g. `"Slashing"` matches a `"Slashing"` skill).

---

## Manual Item Creation Interface

The item sheets (`DCCItemSheet`) for `gear`, `attack`, and `skill` items provide visual, form-driven configuration sections to manually build weapons and scaling combat skills:

### 1. Weapon Item Sheet (`gear` & `attack`)
Located directly below basic weapon stats in the **WEAPON PROFICIENCY & HANDLING** section:
- **Weapon Category**: Select from dropdown (`Power Weapons`, `Edge`, `Bashing`, `Reach`, `Ranged`, `Hand to Hand`, `Shield`, `Improvised`).
- **Weapon Type / Model**: Free-text weapon model (e.g. `Chainsaw`, `Longsword`, `Shotgun`).
- **Wielding Requirement**: Dropdown selecting handling behavior:
  - `one_handed`: Standard 1-handed wielding.
  - `two_handed`: Standard 2-handed wielding.
  - `two_handed_disadv_1h`: Two-handed weapon that can be wielded in one hand at disadvantage (`2d20kl`).
- **Associated Skills (Comma-Separated)**: Skills associated with this weapon (e.g. `Chainsaws, Power Weapons, Slashing`). Form submissions automatically parse these into string arrays.
- **Proficiency Mode**: Dropdown choosing `highest` (default specialization precedence), `additive`, or `primary_plus_half`.
- **Selectable Damage Effects (Comma-Separated)**: Optional maneuvers or techniques available to this weapon.

### 2. Skill Item Sheet (`skill`)
Located in the **TECHNIQUES, CONDITIONS & CRITICAL MILESTONES** panel:
- **Is Combat Technique**: Checkbox toggling maneuver behavior.
- **Applies To Weapons/Skills**: Comma-separated list of applicable weapons or categories (e.g. `Chainsaws, Power Weapons`).
- **Rank 5 Critical Multiplier**: Custom crit multiplier when crawler reaches Rank 5 (e.g. `4` for 4x critical damage).
- **Rank 15 Critical Multiplier**: Custom crit multiplier when crawler reaches Rank 15 (e.g. `8` for 8x critical damage).
- **Fumble Debuff (Natural 1)**: Status condition automatically flagged on a critical miss (e.g. `Minor Injury`).
- **On-Hit Debuff**: Status condition automatically unlocked on hit (e.g. `Bleeding`).
- **On-Hit Debuff Minimum Rank**: Minimum skill rank needed to trigger the on-hit debuff (e.g. `10`).

---

## Combat Execution & Milestone Mechanics

1. **Wielding Disadvantage**: If a weapon with `wieldMode: "two_handed_disadv_1h"` is used one-handed (via dialog or `{ hands: 1 }`), the attack check automatically evaluates with disadvantage (`2d20kl + Stat Mod + Rank vs Evade`). Standard two-handed usage uses `1d20`.
2. **Fumble Detection (Natural 1)**: Rolling a Natural 1 on an attack check triggers a critical miss fumble warning, highlighting the configured fumble debuff (such as *Minor Injury*) inflicted upon the wielder.
3. **Rank-Scaled Damage Dice**: Multiple damage modifiers with `minRank` (e.g. 2d4 Slashing at Rank 0, +2d4 at Rank 5, +2d4 at Rank 10, +2d4 at Rank 15) automatically unlock as the crawler's skill rank increases.
4. **Dynamic Critical Multipliers**: At Rank 5+, the chat damage card's Critical Hit button dynamically scales to the configured tier (e.g. `Crit (4x)`), and at Rank 15+ upgrades to the master tier (e.g. `Crit (8x)`).
5. **On-Hit Debuff Application**: When the wielder meets or exceeds `onHitDebuffMinRank` (e.g. Rank 10), the chat damage card embeds an interactive **Inflict [Bleeding]** button allowing instant 1-click status application to targets.

