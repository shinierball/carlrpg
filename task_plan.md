- # Task Plan: Wrasslin Attack Integration & Compendium Skill Validation

## User Request
- "I can't seem to get wrasslin added as an attack on the character sheet. It is an attack action, how do I get it added?"

## Root Cause Diagnosed
1. In `template.json`, skills have `"isAttack": false` and `"hasDamage": false` as schema defaults.
2. In `src/apps/skill-manager.mjs`, when adding a skill to an actor via `addSkillToActor`, `toCreate` omitted `isAttack`, `hasDamage`, `baseDamage`, `damageStat`, `damageType`, and `optionalEffects`. Foundry merged with `template.json` defaults, leaving `isAttack: false` on the created item.
3. In `src/documents/actor.mjs` line 3239, `getSynthesizedAttacks()` checked `if (sys.isAttack === false) return false;`. Because `sys.isAttack` defaulted to `false`, canonical strike/unarmed attack skills (like Wrasslin) were immediately rejected and never reached the `isKnownUnarmed` check.
4. In `src/documents/actor.mjs` line 2094, `getSkillDamageData()` checked `explicitNoDamage = sys.hasDamage === false...`, which marked `hasDamage: false` if `sys.hasDamage` was `false` from `template.json`.
5. In `templates/actors/parts/page1-core.hbs`, the ATTACKS header only had `Add Attack` (which created a blank "New Attack" item) with no library picker to select known attack skills like Wrasslin.

## Resolution Implemented
1. `src/apps/skill-manager.mjs`:
   - Updated `getUnifiedSkills()` to index all system fields (`isAttack`, `isTechnique`, `hasDamage`, `baseDamage`, `damageStat`, `damageType`, `optionalEffects`, `techniqueConfig`, `upgrades`, `rankBreaks`).
   - Updated `addSkillToActor` to spread `...(def.system || {})`, preserving all attack and damage definitions.
   - Added support for `options.activeCategory` in `DCCSkillManager`.
2. `src/documents/actor.mjs`:
   - In `getSynthesizedAttacks()`, canonical unarmed/strike attack skills (`KNOWN_UNARMED`, including Wrasslin) bypass the `sys.isAttack === false` check, allowing them to synthesize into the Attacks table even if `isAttack: false` was set by schema defaults or legacy data.
   - In `getSkillDamageData()`, `isPrimaryAttack` protects against `explicitNoDamage`, ensuring Wrasslin calculates base damage (`1d4`), stat mod (`STR`), and rank damage dice.
   - In `_buildSkillAttackProfile()`, set `name` and `displayName` cleanly to `skill.name` (preserving `Pugilism (Unarmed)` for backwards compatibility).
3. `templates/actors/parts/page1-core.hbs` & `src/sheets/crawler-sheet.mjs`:
   - Added a `Select Attack` link in the ATTACKS banner header (`<a class="open-skill-picker" data-category="combat">`) next to `Add Attack`.
   - Updated `_openSkillPicker(activeCategory)` to pre-filter `DCCSkillManager` to Combat skills when opened from the Attacks section.
4. Verification:
   - Added automated tests 11 & 12 in `tests/attack-vs-technique-classification.test.mjs`.
   - All 932 tests across 163 suites pass with 0 failures (`node --test tests/*.test.mjs`).