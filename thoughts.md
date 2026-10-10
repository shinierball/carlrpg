# Agent Thoughts Log

## Task: Rework Effects & Item Definitions to Leverage Tag System + Create Migrations for All Existing Items
**Date**: 2026-10-10

### User Request Analysis
The user requested:
1. Reworking effects (healing, damage types, mana potions refilling mana, item definitions granting spells, skills, and stats) to leverage the Unified Tag System rather than brittle name/regex parsing.
2. Creating migrations for all existing items.

### Intent & Architectural Decisions
1. **Rule 0 Compliance (No Regexp / Pattern Matching)**:
   - Previously, mana potions checked `itemName.includes('mana potion')` or `item.name.toLowerCase().includes('mana')`.
   - Damage reduction checked debuff descriptions using `desc.match(/(\d+)%/)`.
   - Items with spell or skill grants relied on loose fields or ad-hoc properties.
   - **Resolution**:
     - Introduced `resource.*` namespace (`resource.mana`, `resource.hp-bars`, `resource.temp-bars`) and `action.restore`.
     - In `item.mjs`, structured outcomes define `{ type: 'restore_resource', resource: 'mana', formula: '1d10 + 5' }` with tags `['action.restore', 'resource.mana']`.
     - In `actor.mjs`, `getDamageReduction(damageType)` maps damage type to element via `damageTypeToElement()` and checks debuff tags (`element.<type>`), comparing against structured `reductionPercent` / `reductionFlat` without any regex.
     - In `template.json`, added `grants: []` schema to `gear`, `loot`, `buff`, `debuff`.
     - Structured grant kinds: `stat`, `skill`, `spell`, `dr`, `evade`, `tag_bonus`.
     - `prepareDerivedData` evaluates equipped gear grants, active buff grants, and tag query bonuses (e.g. `+2 to all element.fire spells`).

2. **Migration Pipeline (`src/migrations/migration-3.2.0.mjs`)**:
   - Built `migrateItemData320(itemData)`:
     - Detects legacy mana items / potions and converts to structured `outcomes` (`type: 'restore_resource'`, `resource: 'mana'`) and adds canonical tags.
     - Converts legacy healing potions to structured `heal` outcomes with tags `['action.heal', 'resource.hp-bars']`.
     - Converts legacy gear stat bonuses (`system.statBonuses`, `system.grantedSkills`, `system.grantedSpells`) into structured `system.grants`.
     - Assigns canonical tags (`resource.mana`, `resource.hp-bars`, `action.restore`, `action.heal`) based on structured outcomes.
   - Built `migrateActorData320(actorData)`: migrates all embedded items on actors.
   - Built `migrateWorld320()` and integrated into `migrateWorld()` in `src/migration.mjs`.
   - Rebuilt all compendium packs using `scripts/build-packs.mjs`.

3. **Verification**:
   - Created `tests/tag-effects-grants.test.mjs` verifying all 8 scenarios (mana potions, healing potions, damage reduction without regex, gear stat grants, tag query bonuses, sheet display of granted spells, and migration of legacy items).
   - Ran `node --test tests/*.test.mjs`: all 1,142 tests passing across 201 suites with 0 failures.

4. **Documentation & Release Artifacts**:
   - Bumped system version to `3.2.0` in `system.json`.
   - Updated `CHANGELOG.md` with complete 3.2.0 section.
   - Updated `README.md` with 3.2.0 features.
   - Updated `next.md` marking task completed.
   - Rebuilt all compendium packs using `scripts/build-packs.mjs`.

## Task: Fix Hot Stuff Aura Burst Radius, Ally Application, Character Sheet & Combat Tracker Display
**Date**: 2026-10-10

### User Request Analysis
- When casting Hot Stuff Aura:
  1. The burst distance calculation was using 20ft instead of 5ft at Rank 1.
  2. Allies in the burst radius were not receiving the bonus health bars.
  3. Temporary health bars were not being used properly after an attack.
  4. Ensure bonus health bars / hitpoints are clearly displayed on the character sheet or combat tracker or both, and applied to all allies in the burst radius.

### Architectural Decisions & Root Cause Analysis
1. **Burst Radius Calculation**:
   - `Hot Stuff Aura` has base radius 5ft (`area.radius: 5`).
   - Rank 10 upgrade adds +5ft radius (`rankBreaks.rank10.area.radiusBonus: 5`).
   - Rank 15 upgrade adds +10ft radius (`rankBreaks.rank15.area.radiusBonus: 10`).
   - Cumulative upgrade at Rank 15 is 5 + 5 + 10 = 20ft.
   - At Rank 1, radius must strictly be 5ft.
   - In `src/documents/actor.mjs` line 6135 and `src/dcc.mjs` line 2030, fallback was hardcoded as `|| 20`. If `sys.area.radius` was 0 or unset on legacy items, it defaulted to 20ft!
   - In `activateAura()`, rank upgrade bonuses used `else if` instead of cumulative progression, and fallback wasn't referencing canonical spell data.
   - **Fix**: Calculate cumulative rank upgrades (5ft base at rank 1, 10ft at rank 10, 20ft at rank 15). Fallback to 5ft for auras and burst spells. Look up canonical `DCC_SPELLS` if item properties are incomplete.

2. **Ally Application**:
   - `activateAura()` only granted temp bars to `this` (caster).
   - Hot Stuff Aura description states: "It also protects all allies within the radius."
   - **Fix**: In `activateAura()`, inspect canvas tokens (or `options.allies` / combatants), detect allies within `radius` ft, and call `grantTempBars()` on each ally. In `deactivateAura()`, clear temp bars with matching source on all allies within the scene/combat.

3. **Attack Damage Absorption Pipeline**:
   - `DCCCombatMetrics.applyDamageToTarget` absorbs from `tempBars` first.
   - However, if damage was applied via token HUD bar or direct actor update without `applyDamageToTarget`, `tempBars` were bypassed.
   - **Fix**: Override `modifyTokenAttribute` on `DCCActor` to route negative HP deltas through `applyDamage()`. Add `_preUpdate` absorption logic so any HP drop absorbs from active `tempBars` first slot-by-slot before reducing permanent HP bars.

4. **Character Sheet & Combat Tracker UI**:
   - Add shield badge indicator `[🛡️ +X Bars (Y Temp HP)]` in `DCCCombatTracker` combatant row (`templates/apps/combat-tracker.hbs`, `src/apps/combat-tracker.mjs`).
   - Add shield badge indicator on character sheet next to Temp HP numeric input (`templates/actors/parts/page1-core.hbs`).

5. **Verification & Tests**:
   - Updated `tests/setup.mjs` with MockActor cumulative radius calculation, ally detection, and `_absorbDamageIntoTempBars`.
   - Added 6 new test cases (10 through 15) in `tests/aura-workflow.test.mjs`.
   - Ran `node --test tests/*.test.mjs`: all 1,148 tests passing across 201 suites with 0 failures.
   - Bumped system version to `3.2.1` in `system.json`.
   - Updated `CHANGELOG.md` and `README.md`.
