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

