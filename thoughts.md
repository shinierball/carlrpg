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

