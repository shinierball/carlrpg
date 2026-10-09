# Next Items & Backlog

## Completed in 3.0.1
- **Unequipped weapon skill showing as attack when stowed**: [COMPLETED]
  - Fixed in `actor.getSynthesizedAttacks()`: weapon skills requiring an equipped weapon (`rule.requires-weapon` / `weapon.*`) are excluded from attack synthesis unless an appropriate weapon is equipped.
  - Stowed/unequipped weapon items (`equipped: false`) are filtered out of attack rosters. Only equipped weapons and natural/unarmed attacks (`weaponClass.unarmed`, `weaponClass.natural`, `Pugilism`, `Bite`, etc.) appear.
  - Verified in `tests/unequipped-weapon-skill-attack.test.mjs`.

- **Weapon damage parts overriding skill-based damage**: [COMPLETED]
  - Fixed in `actor.getAttackDamageParts()`: weapon item damage parts (e.g. 1d6 Fire) are added additively to skill base damage (e.g. 3d10 Piercing), auxiliary passive skill damage (Aiming 3d4), and DCC rank damage dice.
  - Verified in `tests/custom-weapon-associated-skills.test.mjs`.

## Upcoming Tasks
- (Add upcoming priorities or new feature requests here)
