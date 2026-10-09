# Task Plan & Completed Solutions

## 1. Item Sheet Tag Manager Binding & Per-Tag Assignment
- **Status**: [COMPLETED]
- **Implementation**:
  - `DCCTagManager` binds directly to `options.item` when launched from `DCCItemSheet`.
  - Target item banner displays the active item name, type, and tags.
  - Interactive `[Apply]` checkboxes indicate which tags are present in `item.system.tags` (`isAssigned`).
  - Checking/unchecking immediately updates `item.system.tags` via `item.update({'system.tags': updated})` and refreshes both views.
  - Custom tag registration form features an "Apply to item" checkbox to auto-assign newly created tags immediately.
  - Verified in `tests/tag-manager-item-binding.test.mjs`.

## 2. Associated Weapon Skills on Custom Weapons & Additive Damage
- **Status**: [COMPLETED]
- **Implementation**:
  - `actor._resolveWeaponSkills()` distinguishes the primary combat weapon skill (e.g. `Shotgun`, Rank 10) from auxiliary passive skills (e.g. `Aiming`, Rank 10) using `rule.requires-weapon`, `action.attack`, and `action.passive` tags.
  - To-hit roll bonus uses the primary combat weapon skill rank (10) + ability mod (DEX 4) = +14.
  - `actor.getAttackDamageParts()` implements the official additive damage formula:
    1. Base skill damage from Shotgun Rank 10: `3d10 Piercing` (1d10 base + 1d10 R5 + 1d10 R10) + DEX mod.
    2. Weapon item damage parts: `1d6 Fire` (Boom Stick) added additively without overriding.
    3. Auxiliary passive damage bonus: `3d4 Piercing` (Aiming Rank 10).
    4. DCC Rank 10 damage die: `1d10`.
  - Verified in `tests/custom-weapon-associated-skills.test.mjs`.

## 3. Unified Tag Taxonomy Standards & Migration
- **Status**: [COMPLETED]
- **Implementation**:
  - All 18 canonical weapon skills standardized with `'rule.requires-weapon'` in `src/data/skills.mjs`.
  - Migration script `src/migrations/migration-3.0.0.mjs` enforces `'rule.requires-weapon'` on all weapon skills across actor inventories and world items.
  - Full taxonomy conventions documented in `docs/unified-tagging-system.md` Section 8.
  - Compendium packs rebuilt via `node scripts/build-packs.mjs`.
