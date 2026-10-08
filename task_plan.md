# Task Plan: Character Item Advancement UI & Calculation Refactor

## Status: COMPLETE (v2.4.25)

### Objectives & Results
1. **Schema & Model Support**:
   - Added structured `rankBreaks` (rank5, rank10, rank15, rank20) to `AttackDataModel` and `GearDataModel` schemas.
   - Added `healingPerRound` to `BuffDataModel` and `damagePerRound` to `DebuffDataModel`.
   - Fixed unclosed container markup in buff and debuff sheet templates (`templates/items/parts/buff.hbs`, `debuff.hbs`).
   - Extended `DCCItemSheet` to hydrate, edit, and persist milestone rank breaks for attack and gear items.

2. **Gear Granting Skills & Spells**:
   - Updated `DCCActor.prepareDerivedData` to process gear bonuses for spells alongside skills, calculating `itemBonus`, `modifiedRank`, and stat modifiers.
   - Added `actor.getSpellRank(name)` and updated `actor.getSkillRank(name)` to resolve bonuses even for unowned granted abilities.
   - Enhanced `DCCCrawlerSheet` to populate unowned spells granted by equipped gear (`this._grantedSpells`), rendering them in the Spells tab with `[EQUIPPED GEAR]` badges and wiring cast/damage actions on sheet and hotlist.

3. **Buffs & Debuffs Attributes**:
   - Verified stat modifiers, damage multipliers, damage type reductions, limb modifiers affecting hands limits, and advantage/disadvantage roll modifiers.
   - Added `actor.getHealingOverTime()` and `actor.getDamageOverTime()` aggregation methods.
   - Normalized `actor.getActiveBuffs()` across `buff1..buff3` and `slot1..slot3` naming schemes.

4. **Weapons & Attack Advancement**:
   - Verified multi-typed damage packets (`damageParts`).
   - Enhanced `_buildWeaponAttackProfile()` and `rollAttack()` to resolve item-level `rankBreaks` directly from weapons/attacks.

5. **Automated Verification**:
   - Automated unit test suite `tests/item-attributes-advancement.test.mjs` (13 tests) covering all behaviors.
   - All 956 tests across 173 test suites passing with 0 failures.
