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

## To-Hit Resolution vs Techniques

1. **Trained Check**: If **any** matching proficiency skill has $\text{Rank} \ge 1$, the attack is **Trained** (rolls `1d20 + Rank + Stat Mod`). Untrained disadvantage (`2d20kl`) only occurs when all matching skills are Rank 0 or unowned.
2. **Highest Precedence**: Under `proficiencyMode: "highest"`, the single highest matching skill rank provides the to-hit bonus.
3. **Techniques in Conjunction**: Combat maneuvers owned by the crawler (like *Iron Punch* for Pugilism, or *Serrated Tear* for Chainsaws) are populated into the attack's selectable damage effects dialog. The crawler rolls to hit using the primary weapon proficiency and executes the selected technique's damage bonuses upon a successful hit.
