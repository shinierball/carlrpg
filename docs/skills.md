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
