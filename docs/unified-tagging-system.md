# CarlRPG 3.0.0 — Unified Tagging System Architecture & Taxonomy

## 1. Overview

CarlRPG 3.0.0 introduces a comprehensive, data-driven **Unified Tagging System** that replaces legacy string matching, regex heuristics, and hardcoded mechanics with exact, namespaced keyword tags and set queries.

The tagging engine powers:
- Categorization and lookup across world items and compendium entries.
- Combat Technique applicability (e.g. *Iron Punch*, *Dirty Fighting*, *Toss*).
- Spell favored class detection and mana penalty calculation (+1 MP for non-favored classes).
- Structured Class and Race grants (skills, spells, choices, stat modifiers).
- Fast O(1) in-memory indexing and live mutation tracking.

---

## 2. Tag Taxonomy & Namespaces

Tags follow the lowercase dot-separated notation: `<namespace>.<identifier>`.

| Namespace | Purpose | Examples |
|---|---|---|
| `kind` | Core entity kind | `kind.spell`, `kind.skill`, `kind.attack`, `kind.gear`, `kind.class`, `kind.race` |
| `action` | Ability function | `action.attack`, `action.heal`, `action.passive`, `action.interrupt` |
| `element` | Damage types and schools | `element.fire`, `element.acid`, `element.bludgeoning`, `element.force` |
| `archetype` | Official class archetypes | `archetype.mage`, `archetype.fighter`, `archetype.rogue`, `archetype.cleric` |
| `favored` | Spell favored archetype | `favored.mage`, `favored.fighter`, `favored.cleric`, `favored.druid` |
| `weapon` | Weapon type | `weapon.sword`, `weapon.dagger`, `weapon.bow`, `weapon.unarmed` |
| `weaponClass` | Category | `weaponClass.melee`, `weaponClass.ranged`, `weaponClass.unarmed` |
| `weaponProp` | Handling properties | `weaponProp.two-handed`, `weaponProp.reach`, `weaponProp.versatile` |
| `skillGroup` | Skill disciplines | `skillGroup.combat`, `skillGroup.magic`, `skillGroup.survival`, `skillGroup.crafting` |
| `technique` | Combat technique target | `technique.unarmed`, `technique.pugilism`, `technique.wrasslin` |
| `rule` | Special mechanics | `rule.no-damage-effects` (Unarmed Combat rule limitation) |
| `id` | Unique item identity | `id.skill.pugilism`, `id.spell.fireball`, `id.class.boring-ol-mage` |
| `custom` | User/Homebrew tags | `custom.quantum-flux`, `custom.infernal-brand` |

---

## 3. TagQuery Engine (`src/utils/tag-query.mjs`)

The `matchesTagQuery(targetTags, query)` function supports three query forms:

1. **Exact String Match**:
   ```javascript
   matchesTagQuery(item.allTags, 'element.fire');
   ```

2. **Array Conjunction (All Required)**:
   ```javascript
   matchesTagQuery(item.allTags, ['kind.spell', 'element.fire']);
   ```

3. **Structured Boolean Query Object**:
   ```javascript
   matchesTagQuery(item.allTags, {
     all: ['kind.skill'],
     any: ['weaponClass.unarmed', 'weapon.dagger'],
     none: ['rule.no-damage-effects']
   });
   ```

### Reference Expansion (`expandTagReferences`)

The `expandTagReferences(tags)` helper maps referencing tags to their counterparts. For instance, `favored.mage` automatically references `archetype.mage`, enabling caster archetype comparisons without string manipulation.

---

## 4. Tag Index Service (`src/apps/tag-index.mjs`)

The system initializes a global `TagIndex` singleton accessible via `game.dcc.tags` and `game.carlRpg.tags`.

- **In-Memory Set Indexing**: Maps tag IDs to item document IDs for instantaneous lookups.
- **Filtering by Source and Type**: `game.dcc.tags.find('element.fire', { type: 'spell', source: 'world' })`.
- **Live Mutation Tracking**: Reactively updates the index via Foundry lifecycle hooks (`createItem`, `updateItem`, `deleteItem`).

---

## 5. Structured Grants (`src/data/race-class-applier.mjs`)

Classes and Races define structured `system.grants` arrays:

```json
[
  { "kind": "stat", "stats": { "str": -2, "dex": -2, "int": 5, "cha": 5 } },
  { "kind": "skill", "name": "Lore", "rank": 2, "ref": "id.skill.lore" },
  { "kind": "choice", "count": 1, "query": { "all": ["kind.spell", "element.fire"] }, "rank": 3 },
  { "kind": "skillModifier", "stat": "dex", "delta": -3, "floor": 1 }
]
```

---

## 6. Favored Spell Mechanics

When an actor casts a spell (`actor.rollSpell(item)`):
1. Evaluates `favored.*` tags against the caster's archetype tags (`actor.getArchetypeTags()`).
2. If the caster has a class and does not match any of the spell's favored archetypes, a **+1 MP penalty** is applied.
3. Classless crawlers (Levels 1–2) and pets are explicitly exempted from the penalty per canonical DCC rules.

---

## 7. Tag Manager UI (`DCCTagManager`)

GMs and players can open the Tag Manager from the Items Directory sidebar via the **Tag Taxonomy** button or in code via `carl.openTagManager()`.

Features:
- Filter tags across official namespaces (`kind`, `action`, `element`, `archetype`, etc.).
- Search tags by keyword or description.
- View live usage counts across world and compendium items.
- Register and delete custom world tags persisted in world settings (`carl-rpg.customTags`).
