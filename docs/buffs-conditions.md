# Dungeon Crawler Carl RPG — Buff & Condition Subsystem

## Overview

The CarlRPG system features a robust **External Buffs & Conditions** framework on Tab 1 (Core & Combat) and Tab 4 (Conditions & Effects) of character sheets, backed by the **Condition & Buff Manager** (`DCCBuffDebuffManager`). Crawlers and mobs can have up to 3 active external buffs applied at any given time, dynamically modifying core ability scores, providing temporary health, damage resistances, immunities, or combat multipliers. Character buffs on Tab 4 also feature 1-click quick-assignment buttons (`[1]`, `[2]`, `[3]`) to directly slot any owned buff into External Buff slots 1, 2, or 3.

---

## Active External Buff Slots (Page 1 Core)

Located on Page 1 (Core), the **Active External Buffs** panel provides 3 dedicated buff slots:
- **Slot Badges**: High-contrast badges reflecting buff category (`STAT`, `TEMP HP`, `RESIST`, `IMMUNE`, `MULT`, `COMBAT`, or `BUFF`).
- **Dynamic Summaries**: Automatically displays clean effect summaries (e.g. `+5 STR`, `+10 Temp HP`, `50% Fire Dmg`).
- **Quick Clear Action**: Clicking `[ ✕ ]` in the slot header instantly clears the slot and recalculates derived actor stats.
- **Categorized Dropdown Selector**: Quick-access `<select class="external-buff-select">` organized into distinct optgroups:
  - `📦 Character Buffs`: Buff items directly owned and embedded on the character.
  - `🌍 World Buffs`: Buff items defined in the Foundry world directory.
  - `⚡ Ability Score Buffs`: Canonical compendium stat bonuses.
  - `❤️ Temporary Health Buffs`: Compendium Temp HP bonuses.
  - `🛡️ Damage Resistance Buffs`: 13 canonical damage type resistance buffs (50% reduction).
  - `🌟 Damage Immunity Buffs`: 13 canonical damage type immunity buffs (100% negation).
  - `⚔️ Damage Multiplier & Combat Buffs`: Combat and damage scaling buffs.
  - `✨ Other Compendium Buffs`: Miscellaneous buffs.

---

## Custom Buffs & Prioritized Single-Match Selection

### 1. Defining Custom Buffs
Players and Game Masters can define custom buffs at any time:
1. On the Character Sheet (Tab 1 Core or Tab 4 Conditions & Effects), click **Add Buff** / **New Buff**.
2. Open the buff item sheet to customize:
   - **Name**: Give the buff a unique name (e.g. `Strength +5`, `Hero's Might`, or `Strength Buff`).
   - **Primary Buff Type**: `stat`, `tempHp`, `damageMultiplier`, `resistance`, `immunity`, or `custom`.
   - **Value / Multiplier**: Set the numerical bonus (e.g. `5` for +5 STR).
   - **Stat Modifiers Table**: Configure one or more specific ability bonuses (`str`, `int`, `con`, `dex`, `cha`).
   - **Damage Modifiers Table**: Add typed damage bonuses or resistances.

### 2. Single-Match Hierarchical Selection Resolution
To prevent the default compendium options (e.g. default `Strength Buff (+2 STR)`) from visually overriding custom buffs when reopening or re-rendering character sheets, the sheet controller uses a strict hierarchical selection resolution:
1. **Priority 1 (Exact Resolved ID Match)**: Checks if any option's ID matches the actor's resolved buff ID (`resolvedBuff.id`). When a character's owned buff is assigned, its exact document ID matches in `📦 Character Buffs`.
2. **Priority 2 (Exact Value ID Match)**: Matches the raw stored slot string against option IDs.
3. **Priority 3 (Hierarchical Name Match)**: If assigned via a name string, searches option groups in order (`📦 Character Buffs` first, then `🌍 World Buffs`, then compendium groups), ensuring owned custom buffs are matched before compendium defaults.
4. **Single-Selection Guarantee**: Across all groups in the `<select>`, exactly ONE option receives `selected: true`. Compendium defaults never steal selection from character-owned custom buffs.

### 3. Custom String & Macro Resolution
The underlying `DCCActor.resolveBuff` engine natively parses custom buff strings set via macros or scripts:
- **Prefix Format**: `+5 STR`, `+10 Temp HP`, `*2 Fire Damage`.
- **Postfix Format**: `Strength +5`, `STR +5`, `Constitution +3`.
- Automatically maps full stat names (`strength`, `intelligence`, `constitution`, `dexterity`, `charisma`) and abbreviations (`str`, `int`, `con`, `dex`, `cha`).

---

## DCC Condition & Buff Manager (`DCCBuffDebuffManager`)

Accessible via the header button or macro, the **Condition & Buff Manager** provides:
- Live search across all canonical, world, and actor-owned conditions.
- Categorized filter tabs (`All`, `Buffs`, `Debuffs`, `Stat Modifiers`, `Defenses & Temp HP`).
- One-click application to any active external buff slot or embedded debuffs.

---

## Canonical Debuffs (Table 11: Debuffs)

The system compendium (`carl-rpg.buffs`) includes all canonical debuffs from Table 11 of the Dungeon Crawler Carl Roleplaying Game, alongside legacy conditions:

| Debuff Name | Severity | Effect | Duration |
| :--- | :--- | :--- | :--- |
| **Blinded** | Minor | Roll all Skill Checks that require sight with Disadvantage. | Until the end of the next round. |
| **Blood Trail** | Minor | You take 1d6+F at the end of each round. Stackable. | Until cured with a bandage or a First Aid Skill Check. |
| **Burned** | Minor | You take 1d10+F Fire damage at the end of each round. | Until the end of combat or 5 minutes. As an Action, a victim may perform a Dex Stat Check to extinguish the flames. |
| **Drowning** | Major | You take 1d6+F damage at the end of each round. | Until your head is above water. |
| **Dying** | Major | You are at 0% HB. Your Con Mod is how many rounds you have before you die. Subtract 1 from this countdown value at the end of each round. Additionally, each time a Dying Crawler would take damage from any source, they instead subtract 1 from the countdown value. | Until you die or heal at least 1 HB slot. |
| **Enraged** | Minor | You are in a state of extreme uncontrolled fury. You may only perform Attack and Move Actions. | Until the end of 2 rounds or 20 seconds. |
| **Fatigued** | Minor | You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest. | Until the end of a long rest. |
| **Held** | Major | You are actively being held. You can’t use Move Actions or take a Step but may still twist your body to Evade. Attacks against a Held foe are made with Advantage. | Until you are released by whatever is holding you, or you escape. Make a Str-Opposed Escape Artist Skill Check. If not physically held, it is Unopposed. |
| **Long-Term Major Injury** | Major | You take a −5 penalty to all Checks. | Until the end of a full day of rest. |
| **Long-Term Minor Injury** | Minor | You take a −2 penalty to all Checks. | Until the end of a long rest. |
| **Major Injury** | Major | You take a −5 penalty to all Checks. Gaining a Major Injury a second time changes it to a Long-Term Major Injury. | Until the end of a long rest. |
| **Minor Injury** | Minor | You take a −2 penalty to all Checks. Gaining a Minor Injury a second time changes it to a Long-Term Minor Injury. | Until the end of a short rest. |
| **Muted** | Minor | You can’t speak or cast Spells. | Until the end of the combat or 5 minutes. |
| **Poisoned** | Minor | You take 1d8+F Poison damage at the end of each round. Stackable. | Until treated with an antidote. |
| **Paralyzed** | Major | You can’t take any Actions. | Until the end of the next round. |
| **Queasy** | Minor | If your next Action requires a roll, it’s made with Disadvantage. | At the end of the next Action you take. |
| **Sepsis** | Major | You’re Staggered (see below) and take 1d10+F Poison damage at the end of each round. | As Staggered, and the damage continues until you’re healed. |
| **Shit-Faced** | Minor | You make all your Checks with Disadvantage. | Until the end of 10 minutes. |
| **Shocked** | Minor | You lose your next Action. | Once you forfeit that Action. |
| **Sore as Shit** | Minor | You suffer a −1 penalty to all rolls. | Until the end of 1 hour. |
| **Staggered** | Minor | The next Action you take can’t be a Move, and if it is an Attack, its Check is made with Disadvantage. You can’t take a 10ft Step with your next Action. | At the end of the next Action you take. |
| **Stiff Legs** | Minor | You can’t take 10ft Steps. | Until the end of the combat or 5 minutes. |
| **Stunned** | Minor | You gain Disadvantage on your next Check. | Once you make a Check. |
| **Take Down** | Minor | You fall prone. While prone, all Attacks made against you are made with Advantage. | Use your 10ft Step to stand. |
| **Terrified** | Major | You can’t take Move Actions or 10ft Steps. You make all Attacks with Disadvantage. | Until the end of the next round, or you take at least 1 HB slot damage. |
| **The Taint** | Major | You can’t be healed. | Until the end of combat or 5 minutes. |
| **Woozy** | Minor | You can’t add your Dex Mod to Attack or Evade Checks. | Until the end of the next round. |
| *Bleeding (Legacy)* | Minor | Active open wound leaking blood each turn. | Combat |
| *Frozen (Legacy)* | Minor | Deep chill numbing limbs and slowing reactions. -2 Dexterity. | Combat |
| *Crippled (Legacy)* | Major | Severely broken limb or torn tendon. -4 Dexterity and -2 Strength. | Until Treated |
