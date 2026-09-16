## 1.0.17

### Skill Compendium Overhaul & Generic Weapon Group Mastery

- **Official Skills Compendium Overhaul**:
  - Completely updated `DCC_SKILLS` compendium dataset with the full canonical ruleset from `skills.txt` (121 skills across Strike, Bashing, Edge, Hand to Hand, Hand-to-Hand Damage Effects, Ranged, Reach, and Utility skills).
  - Prebuilt LevelDB compendium pack in `packs/skills`.
- **Skill Types & Weapon Groups**:
  - Every skill item now includes an explicit `skillType` / `type` (`Edge`, `Bashing`, `Reach`, `Ranged`, `Strike`, `Hand to Hand`, `Utility`).
  - Added generic weapon mastery skills: **Edged Weapons**, **Blunt Weapons**, **Reach Weapons**, **Ranged Weapons**, and **Strike Weapons**.
- **Automated Cascading Weapon Group Bonuses**:
  - Trained generic group skills automatically grant their rank bonus to all member weapon skills of that type (e.g. *Edged Weapons* Rank 2 gives +2 to *Axe*, *Dagger*, *Longsword*, and *Rapier*).
  - Equipped gear modifiers referencing weapon types or generic group skills (e.g. `+2 Edged Weapons` or `+2 Edge`) automatically apply to all member skills of that type.
  - Stacking calculation: $\text{Modified Rank} = \max(0, \text{Base} + \text{Item} + \text{Boon} + \text{Type Bonus})$.
  - Group bonuses prevent recursive self-buffing on the generic mastery skill itself.
- **UI & Character Sheet Enhancements**:
  - Skills table on Page 3 displays color-coded skill type badges (`[EDGE]`, `[BASHING]`, `[REACH]`, `[RANGED]`, `[STRIKE]`, `[HAND TO HAND]`, `[UTILITY]`).
  - Expanded Item / Group / Boon column displaying active `typeBonus` badges with source tooltips.
  - Skill item sheet partial (`templates/items/parts/skill.hbs`) supports selecting and editing `Skill Type` and viewing `Type Bonus`.
  - Skill Manager (`DCCSkillManager`) displays type badges and searches across skill types.

## 1.0.16

### Item Sheet Decomposition, Debuff Management & Dedicated Spell/Condition Browsers

- **Modular Item Sheet Partials**: Decomposed the monolithic item sheet into modular, purpose-built partial templates (`header.hbs`, `attack.hbs`, `spell.hbs`, `gear.hbs`, `buff.hbs`, `debuff.hbs`, `skill.hbs`, `loot.hbs`, `traits.hbs`) under `templates/items/parts/`, registered dynamically in `loadTemplates`.
- **First-Class Debuff Visibility & Management**:
  - Expanded `DCC_DEBUFFS` canonical dataset with 16 complete Item schemas including severity tags, duration, stat penalties, and damage modifiers.
  - Interactive condition badge strip on character sheet Page 1 (Core) displaying active debuffs with severity styling (`is-major`/`is-minor`), penalty badges, and one-click removal.
  - Dedicated "Character Debuffs & Conditions" table on Page 4 (Inventory) showing severity badges, effect summaries, remaining duration, inline edit/delete actions, and quick-add shortcuts.
- **Dedicated Spell Manager (`DCCSpellManager`)**:
  - Interactive popup catalog (`src/apps/spell-manager.mjs`) for browsing, searching, and filtering all canonical and world spells by type and governing stat.
  - Displays mana cost, spell type, cast range, duration, damage, and iconic crawler quotes.
  - 1-click spell learning/assignment to crawler spellbook with known-spell state detection.
- **Dedicated Buff & Debuff Manager (`DCCBuffDebuffManager`)**:
  - Tabbed browser for searching and inspecting canonical buffs and debuffs.
  - Real-time search query filtering and category/severity filtering.
  - 1-click condition application directly onto character sheets (assigning to external buff slots or adding embedded debuffs).
  - Accessible via "Browse" buttons in the character sheet Core debuffs box, External Buffs header, and Inventory tables.

## 1.0.15

### Multi-Modifier Buffs & Debuffs

- **Multi-Modifier Buffs & Debuffs**: Buff and debuff items now support configuring arbitrary multiple stat modifiers (e.g. +2 STR, +2 DEX on buffs; -2 STR, -4 CON on debuffs) with full automated recalculation across ability scores, ability modifiers, and derived stats (HP max, Mana max, etc.).
- **Multiple Damage & Defense Modifiers**: Buffs support multiple concurrent damage effects (damage multipliers, bonus damage parts with damage type and dice/flat values, damage resistances, immunities, and Temp HP bonuses).
- **Multiple Damage Reductions on Debuffs**: Debuffs support configuring multiple damage reduction entries (reduction %, damage type, rounding direction, resistance, or immunity) applying cleanly against incoming multi-typed attacks.
- **Universal Buff Selection in External Buff Slots**: Any item of type Buff (actor-owned, world items from `game.items`, or compendium packs) is selectable across all 3 External Buff slots on character sheets with grouped, descriptive option labels.
- **Direct Drag & Drop Assignment**: Dragging and dropping any buff item directly onto an External Buff slot automatically equips it into that slot and imports it to the character if needed.
- **Dynamic Item Sheet Repeater Tables**: Item sheet for buffs and debuffs features interactive tables for adding, editing, and deleting stat modifiers and damage modifiers with automatic form synchronization.
- **Quick Buff Creation**: Direct "+ New Buff" shortcuts in the sheet's External Buffs header and Inventory tab.
- **Backward Compatible**: Maintains full backward compatibility with legacy single-stat, single-damage, and compendium buffs.

## 1.0.14

### Damage Type Integration & Mechanics

- **Multi-Typed Weapons & Attacks**: Weapons and attack items support composite `damageParts` across all 13 canonical CarlRPG damage types with distinct dice and flat values.
- **Rank-Gated Skill Damage Bonuses**: Skills support scaling typed damage bonuses (e.g. +2 Bludgeoning at Rank 0, +2 Fire at Rank 5, +4 Fire at Rank 10, and +10 Fire at Rank 15).
- **Buff Damage Multipliers**: External buffs and buff items support global and type-specific damage multipliers (e.g. `*2 Total Damage`).
- **Target Debuffs & Resistance Reductions**: Debuffs and resistances selectively reduce incoming damage packets by percentages with configurable rounding (e.g. 50% Fire reduction rounded up) prior to general DR and CON damage bars.
- **Interactive Typed Damage Cards**: Chat cards display categorized damage pills, source attribution, multiplier tags, and pass typed data directly into target application.

