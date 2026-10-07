# Dungeon Crawler Carl RPG — Skills System & Weapon Group Mastery

## Overview

In the Dungeon Crawler Carl Roleplaying Game, skills govern attacks, exploration, crafting, and tactical survival maneuvers. Each attack skill represents mastery over a specific weapon or fighting technique (e.g. *Longsword*, *Axe*, *Club*, *Bite*, *Bow*, *Quarterstaff*).

Attack skills are grouped by an explicit **Skill Type**, allowing more generic weapon mastery skills (such as **Edged Weapons**, **Blunt Weapons**, and **Reach Weapons**) to grant cascading rank bonuses to all member skills of that type.

---

## Skill Types

Every skill in the DCC system belongs to one of the following canonical types:

| Skill Type | Description | Member Skills (Examples) | Generic Mastery Skill |
| :--- | :--- | :--- | :--- |
| **Edge** | Slashing and piercing bladed weapons | *Axe*, *Dagger*, *Longsword*, *Rapier* | **Edged Weapons** |
| **Bashing** | Heavy blunt trauma weapons | *Club*, *Improvised Weapons*, *Warhammer* | **Blunt Weapons** |
| **Reach** | Weapons with extended 10ft melee reach | *Herding Weapons*, *Lance*, *Polearm*, *Quarterstaff* | **Reach Weapons** |
| **Ranged** | Projectile and thrown distance weapons | *Bow*, *Crossbow*, *Handgun*, *Javelin*, *Shotgun*, *Shuriken*, *Slingshot* | **Ranged Weapons** |
| **Strike** | Natural biological and beast attacks | *Bite*, *Back Claw*, *Slice Attack* | **Strike Weapons** |
| **Hand to Hand** | Unarmed brawling and martial maneuvers | *Foot Soldier*, *Noggin Nocker*, *Pugilism*, *Unarmed Combat*, *Wrasslin* | — |
| **Utility** | Exploration, survival, crafting, and passive perks | *First Aid*, *Lockpicking*, *Perception*, *Stealth*, *Survival*, *Tactics*, etc. | — |

---

## Generic Weapon Group Bonus Calculations

When an actor trains a generic weapon group skill (e.g., **Edged Weapons** at Rank 2), that bonus automatically applies to all member skills of that type:

$$\text{Modified Rank} = \max(0, \text{Base Rank} + \text{Item Bonus} + \text{Boon Bonus} + \text{Type Bonus})$$

$$\text{Total Skill Check} = \text{Modified Rank} + \text{Governing Stat Modifier}$$

### Example:
- A crawler has:
  - **Longsword** (Type: *Edge*): Base Rank 1
  - **Edged Weapons** (Type: *Edge*): Base Rank 2
  - **Blademaster Belt**: Equipped gear giving +1 to *Longsword*
- **Longsword** calculations:
  - Base Rank: 1
  - Item Bonus: +1 (*Blademaster Belt*)
  - Type Bonus: +2 (*Edged Weapons*)
  - **Modified Rank**: $1 + 1 + 2 = 4$
  - With Strength modifier +4, the total skill check is **1d20 + 8**.

> [!NOTE]
> Generic group skills do not apply the type bonus to themselves recursively. Equipped gear providing bonuses directly to weapon groups (e.g. `+2 Edged Weapons` or `+2 Edge`) will cascade to all member weapons even if the actor has not trained the generic group skill document.

---

## Compendium & Sheet Features

- **Compendium Packs**: All 120+ official skills from the rulebook are preloaded in the `carl-rpg.skills` compendium pack and accessible through the **DCC Skill Library & Manager** (`open-skill-picker`).
- **Crawler Sheet Badges**: Skills display crisp type badges (`[EDGE]`, `[BASHING]`, `[REACH]`, `[RANGED]`, `[STRIKE]`, `[HAND TO HAND]`, `[UTILITY]`) and separate item/group/boon breakdown pills.
- **Attack Skill Rolling**: Clicking the `.roll-skill` icon on an attack/combat skill directly rolls **To Hit vs Target Evade** (`actor.rollAttack(item, 'hit')`), matching the attacks tab and hotlist behaviors. Non-combat utility skills roll standard skill checks (`actor.rollSkill(item)`).
- **Inline Burst Damage Button**: Attack skills with damage feature a dedicated `.roll-skill-dmg` burst button next to the d20 roll icon for rolling damage directly from the sheet.
- **Interactive Chat Damage Cards**: To-Hit and skill roll cards embed a **[ 💥 Roll Attack Damage ]** button. Clicking the button from chat calculates multi-typed damage, includes Rank Damage Dice, and renders an interactive CarlRPG damage card with target application buttons (`Apply to Target(s)`, `Half`, `Ignore DR`, `Crit`).

---

## Rank Damage Die Rules & Scaling Table

Whenever rolling damage for a weapon attack, attack skill, or attack spell, the actor adds their **Rank Damage Die** based on their skill/spell rank:

| Skill / Spell Rank | Rank Damage Die |
| :--- | :--- |
| **Rank 0** | +0 (Untrained Check with Disadvantage: `2d20kl + Stat Mod`) |
| **Rank 1** | +1 flat bonus |
| **Rank 2 – 3** | +1d2 |
| **Rank 4 – 5** | +1d4 |
| **Rank 6 – 7** | +1d6 |
| **Rank 8 – 9** | +1d8 |
| **Rank 10 – 13** | +1d10 |
| **Rank 14 – 15+** | +1d12 |

### Core Damage Formulas:
- **Spell Attack Damage** = $\text{Spell Base Damage} + \text{Rank Upgrade Additions} + \text{Skill Rank Damage Die} + \text{Stat Mod}$
- **Weapon Attack Damage** = $\text{Weapon Base Damage} + \text{Skill Rank Damage Die} + \text{Stat Mod}$
- **Attack Skill Damage** = $\text{Skill Base Damage} + \text{Rank Upgrade Additions} + \text{Skill Rank Damage Die} + \text{Stat Mod}$

### Hand-to-Hand Combos & Interactions:
- **Unarmed Combat**: $1d4 + \text{Str Bludgeoning}$. *Cannot combine with Hand-to-Hand Damage Effects.*
- **Pugilism**: $1d2 + \text{Str Bludgeoning}$ (to hit rolled with DEX). *Combines with Hand-to-Hand Damage Effects.*
- **Iron Punch Combo**: Adds $+1d2$ base damage to Pugilism strike (scaling to $+2d2$ at Rank 5, $+3d2$ at Rank 10, $+4d2$ at Rank 15). At Iron Punch Rank 5+, adds an additional Iron Punch Rank Damage Die (e.g. at Rank 5, Pugilism 1d4 + Iron Punch 1d4 = 2d4 rank dice; total $4d2 + 2d4 + \text{Str Bludgeoning}$).
- **Fire Fingers Rank 15 Passive**: Adds $+1d12\text{ Fire}$ to Pugilism, Unarmed Combat, and Slice Attack strikes.
- **Untrained Attack Checks**: Ranks $\le 0$ roll with Disadvantage (`2d20kl + Stat Mod` vs Target Evade).
- **Evade Target Difficulty**: $\text{Target DC} = 10 + \text{Foe DEX Mod} + \text{Floor Number}$.
- **Skill Non-Stacking Rule**: Skill ranks from different skills do not stack together.

---

## Rank Break Configurations (Ranks 5, 10, 15, 20)

Every skill provides an optional 4-tier **Rank Break Configuration** for **Rank 5, Rank 10, Rank 15, and Rank 20**. There is no requirement for any effect to be tied to a rank break; each field is completely optional and defaults to inactive.

At each milestone, the following options can be independently configured:
1. **Additional Damage Dies (`damageDice`)**: Extra base damage dice granted at and above this rank (e.g. `+1d6`, `2d4`). When the skill is used directly or paired with an equipped weapon sharing the skill association, matching weapon damage dice scale cumulatively.
2. **Additional Rank Damage Dies (`rankDamageDice`)**: Integer count of additional rank damage dice granted (e.g. `1` or `2`). These extra rank dice scale the active rank damage die evaluated from the rank die table.
3. **Buffs or Resistances (`buffsResistances`)**: Descriptive buffs, stat bonuses, or damage resistances unlocked at the milestone (e.g. `+2 STR`, `Fire Resistance`, `+1 Cleave`).
4. **Target Debuffs (`debuff`)**: A status condition or debuff inflicted on targets upon successful hit (e.g. `Bleeding`, `Crippled`, `Stunned`, `Burned`). Active debuffs generate interactive **[ 🩸 Inflict Condition ]** buttons on the chat damage card for one-click target application.
5. **Non-Defined Ability Notes (`notes`)**: Freeform notes documenting custom narrative or mechanical perks not formally parameterized by standard dice or conditions (e.g. *Instant decapitation chance on critical hits against humanoids*).
6. **Milestone Base Dice Count Modifier (`baseDiceCountMod`)**: Explicit formula or integer adjustment modifying base attack dice count (e.g. `+1`, `+2`, `* @rank`) unlocked at this rank break.

---

## Dynamic Damage Effects & Techniques Engine

Combat techniques and damage effects (such as *Iron Punch*, *Powerful Strike*, *Skullcracker*, *Smush*, *Toss*, *Choke Out*, *Dirty Fighting*, or custom player/GM techniques) are fully data-driven and dynamic, eliminating hardcoded string checks in combat resolution.

### Technique Configuration (`techniqueConfig`)
Any skill item configured with `isTechnique: true` or `techniqueConfig.isDamageEffect: true` provides structured combat maneuver parameters:
- **`appliesToTags`**: Target categories, weapon types, or skills this technique can be used with (e.g. `["bashing", "hammer", "pugilism"]`, `["edge", "dagger"]`).
- **`baseDiceCountMod`**: Modifier formula applied to the base attack's dice count (e.g. `+1`, `+2`, `* @rank`).
- **`flatDamageMod`**: Numeric or formula flat damage added to the attack.
- **`damageBonus`**: Bonus damage packet die (e.g. `1d4`, `1d6`, `1d8`).
- **`damageType`**: Damage type of the bonus packet (e.g. `Bludgeoning`, `Fire`, `Slashing`).
- **`debuffName`**: Condition inflicted on the target on hit (e.g. `Dazed`, `Burning`, `Woozy`).
- **`cooldown`**: Maneuver cooldown or usage constraint (e.g. `2 hours`, `1/round`, `30 hours`).

### Combat Resolution Flow
1. **Dynamic Discovery (`getValidDamageEffects`)**: When rolling an attack (or opening an attack dialog), the system dynamically queries the actor's inventory for skills with `isTechnique: true` whose `appliesToTags` match the weapon category, weapon model, or skill tags.
2. **Resolution (`resolveDamageEffect`)**: Merges the technique's baseline `techniqueConfig` with active milestone `rankBreaks` (Rank 5, 10, 15, 20) based on the actor's modified technique rank.
3. **Execution**: Multiplies or adds base dice (`baseDiceCountMod`), injects typed bonus packets (`bonusParts`), adds extra rank damage dice (`extraRankDice`), and binds on-hit condition buttons (`debuffs`) directly into interactive chat damage cards.

---

## Skill Classification & Action Discrimination

CarlRPG strictly differentiates between attack actions that deal damage and tactical/utility/interrupt combat maneuvers:

- **Action Classification (`isAttack`)**:
  - Attack skills target enemies, roll to hit vs Evade (`actor.rollAttack(item, 'hit')`), and show up as attacks on the character sheet, Hotlist, and Token HUD with the `[ATTACK]` badge.
  - Non-attack actions (e.g. *Call a Play*, *Intervene*, *Taunt*, *Catcher*, *Throwing*, *Tracking*) have `isAttack: false`. They roll as skill checks (`actor.rollSkill(item)`) and display with the `[SKILL]` badge.
  - Setting `category: "Combat"` on an action does **not** make it an attack. Category defines when the action is used, while `isAttack` defines whether it functions as an offensive combat strike.

- **Explicit Damage Resolution (`hasDamage` & `baseDamage`)**:
  - A skill only rolls damage if it has explicit damage configured via `system.baseDamage` or `system.hasDamage: true`, or is a canonical unarmed combat form (*Pugilism*, *Unarmed Combat*).
  - Utility and tactical combat skills that describe dice rolls in their rules notes (such as *Call a Play*'s "Roll 2d6" or *Intervene*'s "Roll 1d6") are cleanly evaluated as `hasDamage: false` and do not generate false damage rolls.



