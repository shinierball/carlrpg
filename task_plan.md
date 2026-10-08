# Task Plan: Advancement Milestones (Rank 5, 10, 15, 20) UI & Calculation Synchronization

- [x] **Investigation**:
  - Identified root cause: Spells in `src/data/spells.mjs` and skills in `src/data/skills.mjs` historically stored advancements only as unstructured text in `upgrades` (either objects with `rank5`, `rank10`, `rank15` string properties or multiline strings).
  - The Item Sheet (`src/sheets/item-sheet.mjs`) expected structured `rankBreaks` objects (`damageDice`, `rankDamageDice`, `buffsResistances`, `debuff`, `notes`), leaving UI inputs empty.
  - Runtime damage calculation previously parsed `upgrades` via regular expressions on the fly, creating risk of double-counting if `rankBreaks` was populated.
  - Gear weapons scale through associated weapon proficiency skills (e.g., Bow, Longsword), so populating skill `rankBreaks` propagates to weapon scaling.

- [x] **Data-Driven Hydration & Controller Update**:
  - Implemented `parseUpgradeTextToRankBreak()` and `hydrateRankBreaks()` in `src/data/rank-dice.mjs` to parse legacy upgrade text into structured `rankBreaks` dynamically.
  - Updated `DCCItemSheet._prepareContext()` in `src/sheets/item-sheet.mjs` to auto-hydrate `rankBreaks` on all existing and imported items.
  - Updated `DCCItemSheet._updateObject()` to persist modified `rankBreaks` and sync `upgrades` while preserving existing notes.

- [x] **Canonical Dataset & Compendium Packaging**:
  - Updated all 54 spells in `src/data/spells.mjs` and all 121 skills in `src/data/skills.mjs` with explicit, canonical `rankBreaks` objects.
  - Updated `buildSpells()` in `scripts/build-packs.mjs` to preserve `...spell.system` (including `rankBreaks`).
  - Rebuilt all compendium packs via `scripts/build-packs.mjs`.

- [x] **Actor Roll Calculation & Double-Counting Elimination**:
  - Refactored `getSpellDamageData()`, `getSkillDamageData()`, and `_buildWeaponAttackProfile()` in `src/documents/actor.mjs` to prioritize structured `rankBreaks` and track processed tiers to guarantee zero double-counting.
  - Used `Math.max` across `modifiedRank` and `sys.rank` in `getSkillDamageData()` for reliable rank scaling.

- [x] **Verification**:
  - Created automated test suite in `tests/rank-breaks-advancement.test.mjs` with 11 unit tests.
  - Full test suite passing with 0 failures: `node --test tests/*.test.mjs` (943 tests passing across 167 suites).
  - Version bumped to `2.4.24` in `system.json` and documented in `CHANGELOG.md`.