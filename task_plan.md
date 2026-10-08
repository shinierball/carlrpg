[x] ***Verify Combat Techniques*** Verify skills are attributed correctly as attacks or Damage Effects.  This should be clearly stated but for clarity the only CANONICAL 
damage effects are:
    Choke Out
    Dirty Fighting
    Iron Punch
    Powerful Strike
    Skullcracker
    Toss
    Smush

They will have as part of their description the strike they are associated with. 
example: 

Toss
Wrasslin’ Damage Effect, Passive
You deal +1d8 base damage + Str Bludgeoning, end
the Held Debuff, and throw the target 5 feet for every
five Ranks (minimum 5 feet) you have in this Skill. You
can only Toss foes of a smaller size than you.
UPGRADES
Rank 5: You can Toss foes up to your own size or smaller.
Rank 10: You can Toss foes one size larger than you or
smaller.
Rank 15: +1d8 base damage, and you can throw foes
two sizes larger than you or smaller.

Is a Wrasslin' Damage Effect

Damage effects may be applicable for multiple skills. We need to ensure that the correct skills are associated with the correct damage effects.

They will have as part of their description the strike they are associated with. 

Combat Techniques or attacks will be clearly marked as such. For example:

Unarmed Combat
Melee Attack, Str
AI Favor: 1
Limitations: Cannot choose a Damage Effect.
Every crawler starts out with this Skill. This is a mixture
of all strikes, so call it what you will when you Attack.
Base Damage: 1d4 + Str Bludgeoning
UPGRADES
Rank 5: +1d4 base damage
Rank 10: +1d4 base damage
Rank 15: +2d4 base damage

States it is a Str based Melee Attack.

Check all of the Combat skills and make sure they are correctly classified as attacks or damage effects.

**Verification Status: COMPLETED**
- Validated all 121 compendium skills in `DCC_SKILLS` (`src/data/skills.mjs`):
  - 26 Primary Attack Skills: `isAttack: true`, `isTechnique: false`, `hasDamage: true`, valid `baseDamage`, `damageStat`, and `damageType`.
    - Natural strikes: *Bite*, *Back Claw*, *Slice Attack*
    - Bashing: *Club*, *Improvised Weapons*, *Warhammer*
    - Edge: *Axe*, *Dagger*, *Longsword*, *Rapier*
    - Hand to Hand: *Foot Soldier*, *Noggin Nocker*, *Pugilism*, *Unarmed Combat*, *Wrasslin*
    - Ranged: *Bow*, *Crossbow*, *Handgun*, *Javelin*, *Shotgun*, *Shuriken*, *Slingshot*
    - Reach: *Herding Weapons*, *Lance*, *Polearm*, *Quarterstaff*
  - 7 Canonical Damage Effects: `isTechnique: true`, `isAttack: false`, `hasDamage: false`, `techniqueConfig.isDamageEffect: true`.
    - *Choke Out*: Wrasslin
    - *Dirty Fighting*: Pugilism, Wrasslin
    - *Iron Punch*: Pugilism
    - *Powerful Strike*: Foot Soldier, Noggin Nocker, Pugilism
    - *Skullcracker*: Noggin Nocker
    - *Smush*: Foot Soldier
    - *Toss*: Wrasslin
    - Strictly purged `Unarmed Combat` from `appliesTo` and `appliesToTags` for all damage effects.
  - 5 Weapon Group Masteries (*Edged Weapons*, *Blunt Weapons*, *Reach Weapons*, *Ranged Weapons*, *Strike Weapons*): `isAttack: false`, `isTechnique: false`, `hasDamage: false`.
  - 2 Tactical Combat Actions (*Call a Play*, *Intervene*): `isAttack: false`, `isTechnique: false`, `hasDamage: false`.
  - 81 Utility / Passive / Crafting / Exploration skills: `isAttack: false`, `isTechnique: false`, `hasDamage: false`.
- Compendium pack builder `scripts/build-packs.mjs` preserves all skill system metadata (`isAttack`, `isTechnique`, `hasDamage`, etc.).
- Automated test coverage in `tests/attack-vs-technique-classification.test.mjs` validates all 121 skills. 930 tests passing across 163 suites.
