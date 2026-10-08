# Task Plan: Unified Tagging System (CarlRPG 3.0.0)

## Status: Plan Finalized, Ready for Phase 0 Implementation

The rulebook (`docs/crpgrules.pdf`) has been extracted into clean intermediary reference files:
- `docs/extracted_classes_races.txt`: Races & Classes (all 52 classes and 12 base archetypes)
- `docs/extracted_skills.txt`: Attack Skills, Utility Skills, and Damage Effects
- `docs/extracted_spells.txt`: All 54 canonical spells with keywords, damage types, delivery, and favored archetypes
- `docs/extracted_gear_rules.txt`: Equipment, gear slots, loot, and crafting
- `docs/extracted_combat_rules.txt`: Core combat, health bars, buffs, and debuffs

### Resolved Core Decisions
1. **Tag ID Format**: Namespaced IDs (`element.fire`, `action.attack`, `archetype.mage`, `favored.cleric`, `id.skill.wrasslin`).
2. **Favored Mechanics**: Derived from Class Archetype. Crawlers without the favored archetype pay **+1 Mana Point** to cast the spell.
3. **Custom Tags & Discovery**: Custom tags can be freely created; a dedicated **Tag Manager** (`TagManagerApp`) provides searching, browsing, and tag creation.
4. **Clean Break (No Deprecation Baggage)**: Complete removal of legacy regex perk parsers, string matching maps, and obsolete schema fields (`spellType`, etc.).
5. **Separation of Scope**: Combat fixes from `next.md` deferred to be handled separately.

### Implementation Phases
- [x] **Phase 0: Foundations & Data Models** (`tags.mjs`, `tag-query.mjs`, schema updates in `template.json` & models, test suites)
- [ ] **Phase 1: Canonical Dataset Tagging** (Spells, Skills, Classes, Races tagged with exact rulebook values)
- [ ] **Phase 2: Tag Index Service** (`TagIndex` for reactive compendium/world item queries)
- [ ] **Phase 3: Structured Grants & Class/Race Applier Rewrite** (`grants` array replacing all perk regex)
- [ ] **Phase 4: Combat Technique & Skill Associations** (Data-driven techniques via `TagQuery`)
- [ ] **Phase 5: Spell Casting & Favored Mana Mechanics** (+1 MP penalty evaluation)
- [ ] **Phase 6: User Interface** (Tag chip editor partial + Tag Manager App)
- [ ] **Phase 7: Migration & Release (3.0.0)** (Migration script, docs, tests)
- [ ] **Phase 8: Final Codebase Cleanup** (Purge obsolete code & verify 0 failures)
