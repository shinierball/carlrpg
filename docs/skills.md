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
- **Roll Cards**: Chat cards display a full breakdown of Base, Item, Type, and Boon bonuses when rolling skill checks or viewing passive skills.

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
