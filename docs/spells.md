# Dungeon Crawler Carl RPG — Spell System & Explicit Rank Progression

## Overview

In the Dungeon Crawler Carl Roleplaying Game, spells represent tactical, offensive, defensive, and utility magic fueled by mana. Spells can be cast from character sheets, the combat Hotlist, or mob sheets.

The spell system provides complete parity with weapons and skills, allowing players and GMs to define spells either via authentic cheat sheet text perks (`upgrades.rank5`, `upgrades.rank10`, `upgrades.rank15`) or via explicit, rank-gated data models with multi-tiered scaling damage, dynamic critical milestones, condition/debuff triggers, and optional metamagic riders.

---

## Spell Data Architecture

Every spell item (`type: "spell"`) is backed by `SpellDataModel` and defined in `template.json`:

```json
{
  "spellType": "offensive",
  "stat": "int",
  "manaCost": 5,
  "range": "30 ft",
  "duration": "Instantaneous",
  "baseDamage": "2d6",
  "damageType": "fire",
  "quote": "Burn, baby, burn!",
  "description": "Unleashes a torrent of flame.",
  "damageModifiers": [
    { "minRank": 5, "formula": "1d6", "damageType": "fire" },
    { "minRank": 10, "formula": "2d6", "damageType": "fire" }
  ],
  "critMultiplierR5": 4,
  "critMultiplierR15": 8,
  "fumbleDebuff": "Burning",
  "onHitDebuff": "Bleeding",
  "onHitDebuffMinRank": 10,
  "optionalEffects": ["Piercing Fire", "Lingering Embers"],
  "selectedEffect": ""
}
```

---

## Explicit Rank Scaling & Damage Modifiers

### 1. Multi-Tiered Damage Scaling (`damageModifiers`)
Rather than relying solely on raw text strings, spells support explicit rank-gated damage entries. Each modifier specifies:
- **Min Rank (`minRank`)**: The minimum spell rank required for this damage bonus to activate.
- **Formula (`formula`)**: The additional damage dice or flat bonus (e.g. `1d6`, `2d4`, `+3`).
- **Damage Type (`damageType`)**: The typed packet for this modifier (e.g. `fire`, `cold`, `bludgeoning`, `piercing`, `slashing`, `acid`, `electric`, `force`, `psychic`, `radiant`, `necrotic`).

When rolling spell damage via `actor.rollSpellDamage(spellItem)` or `actor.getSpellDamageData(spellItem)`:
1. Active rank modifiers where $\text{spell.rank} \ge \text{minRank}$ are gathered.
2. If `baseDamage` is empty, active rank modifiers form the entire spell damage expression.
3. If both `baseDamage` and `damageModifiers` exist, formulas are combined (e.g. `2d6[fire] + 1d6[fire]`).
4. Rank dice and governing DCC ability modifiers (e.g. INT mod) are appended automatically.

### 2. Backward-Compatible Text Upgrades
Existing cheat sheet spells with text descriptions in `upgrades.rank5`, `upgrades.rank10`, and `upgrades.rank15` (such as `+1d12 fire damage at Rank 5`) continue to be parsed automatically if explicit `damageModifiers` are not configured.

---

## Critical Milestones & Dynamic Multipliers

Spells support explicit critical hit milestones that mirror physical weapon skills:
- **Rank 5+ Critical Milestone (`critMultiplierR5`)**: Defaults to `4` ($4\times$ damage). When a crawler of Rank 5 or higher casts the spell and rolls damage, the chat card presents an interactive **[ 💥 Crit (4x) ]** button.
- **Rank 15+ Critical Milestone (`critMultiplierR15`)**: Defaults to `8` ($8\times$ damage). When a crawler of Rank 15 or higher casts the spell, the damage card unlocks an interactive **[ ⚡ Crit (8x) ]** button.
- Standard casts prior to Rank 5 use the system default $2\times$ critical hit multiplier.

---

## Condition Triggers & Debuff Automation

### 1. On-Hit Debuff Infliction (`onHitDebuff` & `onHitDebuffMinRank`)
- Spells can define an on-hit condition (e.g. *Bleeding*, *Burning*, *Poisoned*, *Stunned*).
- When the spell rank meets or exceeds `onHitDebuffMinRank` (or if `onHitDebuffMinRank` is 0), the generated spell damage card includes an interactive **[ 🩸 Inflict Bleeding ]** button.
- Clicking the button allows players or GMs to immediately apply the status effect to targeted tokens.

### 2. Critical Miss / Fumble Backfire (`fumbleDebuff`)
- When making an attack roll with a spell (`actor.rollSpellAttack(spellItem)`), rolling a Natural 1 triggers a high-contrast **DCC Fumble Warning** in the chat card.
- If a `fumbleDebuff` is configured on the spell (e.g. *Minor Injury* or *Burning*), the warning explicitly notifies the table that the caster suffers that debuff as a spell mishap/backfire.

---

## Disadvantage & Spell Limitations

Spells can be cast under adverse conditions or subject to environmental limitations (e.g. *Fireball* cast in cramped 5ft corridors or against targets behind heavy cover):
- Setting `disadvantage: true` in roll options or via spell limitation triggers rolls `2d20kl` (rolling two d20s and taking the lower result).
- Attack cards clearly tag the roll with a `[DISADVANTAGE]` badge.

---

## Item Sheet UI (`DCCItemSheet`)

The Spell Item Sheet (`templates/items/parts/spell.hbs`) provides dedicated, intuitive visual panels for all features:
1. **SPELL CRITICAL MILESTONES & CONDITION TRIGGERS**:
   - `critMultiplierR5` and `critMultiplierR15` number inputs.
   - `fumbleDebuff` selection dropdown (listing canonical DCC debuffs).
   - `onHitDebuff` dropdown and `onHitDebuffMinRank` threshold input.
2. **SPELL DAMAGE MODIFIERS & SCALING (RANK-GATED)**:
   - Interactive table with Min Rank, Formula, and Damage Type columns.
   - `[+ Add]` and `[- Remove]` buttons for managing scaling tiers.
3. **OPTIONAL EFFECTS & METAMAGIC RIDERS**:
   - Comma-separated input for custom metamagic riders (e.g. *Lingering Flame*, *Overcharge*, *Sculpted Blast*).
   - Active effect selector dropdown.
4. **RANK BREAK CONFIGURATIONS (RANKS 5, 10, 15, 20)**:
   - Dedicated 4-tier configuration panels color-coded by milestone (Green, Blue, Purple, Orange).
   - Each rank break can configure additional base damage dice (`damageDice`), additional rank damage dies (`rankDamageDice`), buffs/resistances (`buffsResistances`), on-hit debuffs (`debuff`), and freeform ability notes (`notes`).
   - Completely optional: no effect is required to be tied to any rank break.
   - Evaluated dynamically in `actor.getSpellDamageData()`, `actor.rollSpellDamage()`, `actor.rollSpell()`, and `DCCItem.rollSpellCard()`.

