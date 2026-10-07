- [x] **Meta Codification**: Audit identified 100+ runtime text/pattern parsing locations (documented in artifacts `runtime_parsing_audit.md`). Transform these parsing patterns into explicitly codified data schemas, relational foreign keys, and typed models rather than runtime text matching. Do not store data as html unless it is strictly for display. (Completed: pre-compiled canonical static assets, removed combat/technique runtime regex in `actor.mjs`, added structured schema tags/grantedItems).
- [x] **Dynamic Damage Effects & Techniques Engine**: Make combat techniques and damage effects (Iron Punch, Powerful Strike, Skullcracker, Toss, Smush, Choke Out, Dirty Fighting) completely dynamic and data-driven without hardcoded strings or switch statements. Support user-created techniques via `techniqueConfig` (`isDamageEffect`, `appliesToTags`, `baseDiceCountMod`, `flatDamageMod`, `damageBonus`, `debuffName`, `cooldown`) and milestone `rankBreaks` scaling. (Completed: schema expansion, actor resolution engine, sheet UI, and dedicated tests).

- **Wizard driven choices in race/class definitions**: When creating a new race or class users should be able to define new buffs, debuffs, skills and spells that are unique to that race or class. For instance the Igneous race has an ability "As an Action, make a Con Stat Check. On Success,
deal 1d8+F Fire damage, 5ft Burst radius". This is essentially a reskinned fireball that can't gain ranks but uses an unopposed con stat check to trigger. This would be a new skill. Here are a list of other abilities that would need to be created 
    - Once per day, double your Move for 20 seconds
        - this needs to be a reminder its possible so a skill but does not have to be functional in the VTT
    - As an Action, make a Con Stat Check. On Success,
deal 1d8+F Fire damage, 5ft Burst radius
        - this is a skill
    - No Survival Checks needed in harsh heat
conditions and can breathe underwater
        - this is a permanent buff
    - Immunity to Fire damage, and vulnerable to Ice
damage
        - this is a permanent debuff and a permanent buff
    - Ability to burrow
        - this is a permanent buff
    - Lose 1 Health Bar slot each time you access your Inventory (not Hotlist)
        - permanent debuff - does not need to be functionally implemented
    - Disadvantage on Checks to conceal your presence or nature (such as Stealth)
        - permanent debuff

    Evaluate all existing classes for similar situations and implement the skills, spells, buffs, debuffs etc in the system

- **Clean up class and race definitions in the compendium**: Currently there are skills and spells like "two" which is a misinterpretation of the pick 2 spells or skills option on creation.  Remove the extra definitions and replace them with the correct implementations that are enabled in the previous tasks.