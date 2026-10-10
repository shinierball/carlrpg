# GEMINI.md - Agent Directives & Repository Guidelines

This document defines the core directives, workflow rules, architecture standards, and verification requirements for developing the **Dungeon Crawler Carl Roleplaying Game (CarlRPG)** system on Foundry Virtual Tabletop.

---

## 🚨 Non-Negotiable Core Directives

1. **Meaningful Tests Are Mandatory**:
   - Whenever implementing new functionality, bug fixes, or behavioral changes, create or update automated unit tests in `tests/` that **directly and rigorously check the requested behavior**.
   - Tests must never be trivial, hollow, or pass unconditionally. They must validate real logic, schemas, state transitions, event handling, or roll evaluations.

2. **Code to Pass the Tests**:
   - Implement the necessary source code changes across templates, document models, sheet controllers, and stylesheets to make the tests pass.

3. **Run the Test Suite Before Declaring Completion**:
   - Always run the full test suite before any commit or before reporting that a task is done:
     ```bash
     node --test tests/*.test.mjs
     ```
   - **You are NOT done until all tests pass with 0 failures.** If any test fails, diagnose the root cause, fix the issue, and rerun until 100% passing.

4. **Strict CarlRPG Mechanics — Absolutely No D&D Math, D&D Spell Descriptions, or D&D Rules**:
   - **Never use D&D math `(score - 10) / 2`** or standard D&D stat modifier tables under any circumstances.
   - Always use the official Dungeon Crawler Carl RPG stat modifier table (`getDCCStatModifier`):
     - $\le 0$: `+0`
     - 1–2: `+1`
     - 3–5: `+2`
     - 6–9: `+3`
     - 10–19: `+4`
     - 20–49: `+5`
     - 50–99: `+6`
     - 100–149: `+7`
     - 150–199: `+8`
     - 200–299: `+9`
     - 300+: `+10`
   - **There are NO negative ability modifiers** in CarlRPG.
   - Evade is calculated as $\text{DEX Mod} + \text{Gear} + \text{Buffs}$ (attacker target DC is $10 + \text{Foe DEX Mod} + \text{Floor Number}$), never $10 + \text{DEX Mod}$ as a character's base AC.
   - **Never use D&D terminology or mechanics**: No cantrips, spell slots, saving throws, proficiency bonuses, or D&D spell text/components. All spells, skills, damage bars (10 bars of CON mod HP each), actions, and combat mechanics must strictly conform to official DCC RPG rules.

---

## 🏗️ Project Architecture & Conventions

- **System ID**: `carl-rpg`
- **Platform**: Foundry VTT (v12+)
- **Module System**: Pure ES Modules (`.mjs` files). No bundler or transpiler; code runs natively in Node.js and modern browser environments.
- **Testing Framework**: Node.js built-in test runner (`node --test`), backed by the headless test harness in `tests/setup.mjs` which mocks minimal Foundry VTT globals (`Actor`, `Item`, `ActorSheet`, `ChatMessage`, `Roll`, `CONFIG.DCC`, etc.).

### Directory Structure
```
/
├── src/
│   ├── dcc.mjs                 # Main entry point, hook registration, template preloading
│   ├── documents/
│   │   ├── actor.mjs           # DCCActor document class (stat checks, rolls, derived stats)
│   │   └── item.mjs            # DCCItem document class (gear, spells, attacks, loot)
│   ├── sheets/
│   │   ├── crawler-sheet.mjs   # DCCCrawlerSheet (main actor sheet controller)
│   │   └── item-sheet.mjs      # DCCItemSheet (item sheet controller)
│   ├── apps/                   # Interactive applications (SkillManager, CombatMetricsApp)
│   └── data/                   # Compendium data definitions (skills, spells)
├── templates/
│   ├── actors/
│   │   ├── crawler-sheet.hbs   # Sheet layout and tab navigation
│   │   └── parts/              # Tab and component partials (page1-core, hotlist, spells, etc.)
│   ├── items/                  # Item sheet templates
│   └── apps/                   # Application templates
├── styles/
│   └── dcc.css                 # System stylesheet (vanilla CSS, Oswald font, DCC theme)
├── tests/
│   ├── setup.mjs               # Node test harness & Foundry mock globals
│   └── *.test.mjs              # Test suites for each subsystem
├── system.json                 # System manifest & metadata
└── template.json               # Actor & Item data schema definitions
```

---

## 🛠️ Implementation Best Practices & Gotchas

### 0. DO NOT USE REGEXP or pattern matching unless absolutely necessary and then ask for permission
- Do not use regexp or pattern matching unless absolutely necessary and then ask for permission.
- Instead use data driven code to store information and use that information to make decisions
- Do not use string matching. Use data structures to store information.
- A vast majority of unintended functionality and bugs have been caused by greedy pattern matching it is mostly unnecessary
- Assume all content is created by users so make any functionality dependent on selecting and utilizing arbitrary data forced into a structure rather than well defined strings.  No magic numbers or strings allowed everything should be pulled from a compendium or item definition where possible. 

### 1. Template Preloading
- Any new `.hbs` partial template added to `templates/` **must be registered in `loadTemplates` in `src/dcc.mjs`**, or Foundry will fail to render the partial dynamically.

### 2. Form Harvester & Duplicate Inputs
- Foundry's `FormDataExtended` collects all inputs with a `name` attribute into the form submission payload.
- **Never duplicate the same input `name` attribute across tabs or partials** within `<form class="dcc-sheet">`. If multiple elements share a `name`, Foundry serializes them as arrays (e.g. `['id1', 'id2']`), causing data corruption and lookups to fail.
- For auxiliary selectors or quick-access dropdowns (like the Hotlist), omit the `name` attribute and handle updates explicitly via change listeners and `data-*` attributes.

### 3. Bulletproof Data Sanitization
- Always sanitize data incoming from `system` properties against unexpected array or comma-separated formats:
  ```javascript
  let val = rawVal || '';
  if (Array.isArray(val)) val = val[0] || '';
  if (typeof val === 'string' && val.includes(',')) val = val.split(',')[0].trim();
  ```

### 4. Handlebars Scoping & Precomputed Options
- Handlebars `as |item|` block parameters in nested `{{#each}}` loops can shadow outer variables depending on the runtime environment.
- **Prefer precomputing complex select option groups in `getData()`**:
  Format display labels (`⚡ Fireball (5 MP)`), calculate `selected: true/false`, and structure option groups in JavaScript before passing them into the template.

### 5. Specialized Item & Hotlist Actions
- Differentiate behavior cleanly based on item types:
  - **Attacks**: Roll to hit (`actor.rollAttack(item, 'hit')`) and damage. Allow for both 1d20 + modifiers to hit and roll under. If a roll to hit is performed, generate a chat card with the results.
    Allow application of damage to targeted actors or groups of actors. Allow undue of damage, including negative HP.
  - **Spells**: Cast spell with chat card (`actor.rollSpell(item)`). Include damage and effects in chat cards and calculations.  Allow application of damage to targeted actors or groups of actors. Allow undue of damage, including negative HP. Allow casting of spells with no MP cost.
  - **Gear**: Toggle equipment slot (`item.update({ 'system.equipped': !item.system.equipped })`). 
  - **Loot / Consumables**: Use item and output chat message (`ChatMessage.create(...)`).
  - **Buff / Debuff**: Apply or remove the buff/debuff to the actor. Include Buff/Debuff calculation and affects in chat cards and calculations.  Allow application of buffs or debuffs to targeted actors or groups of actors. 

### 6. Users Will Create Content
- Players and GMs will create new content such as new races, classes, items, etc. This content should be supported by the system and should be easy to create and use and interact with existing builders and calculations. 
  - For instance secondary skills like Dirty Fighting will interact with multiple checks and game mechanics, and new skills like this should be able to be created and interact with existing mechanics and skills. 
  - Magic users will frequently want to create and use custom spells.  These should be supported by the system and should be easy to create and use.  
  - New items should be easily composed and allow for all the same interactions as existing items. This should include the ability to give skills and spells that users cannot normally acquire.  Often this involves rules like cooldowns of 2 hours per rank of skill or spell given.  Example A level 15 Iron Shell skill grants the user the ability to cast Iron Shell at will but with a 30 hour cooldown.
  
### 7. All rules will be broken
- When players break the rules they should be rewarded for doing so. 
- This means anything that can be created should not enforce rules like the 30 point buy class creation.  The system should track and calculate the correct values based on the rules, but the rules should not be enforced.  For example a class could be created with 100 points of stats and the system should track the correct values based on the rules. Calling out the violation is good so that its clear this is an exception which the AI might patch at any time. 

### 8. Design & Styling (DCC Theme)
- Follow the established Dungeon Crawler Carl visual theme:
  - Primary font: `'Oswald', sans-serif`
  - Accent / DCC Red: `#c0392b` / `#962d22`
  - Clean borders, high contrast, readable inputs, and crisp state badges (`[EQUIPPED]`, `[SPELL]`, `[ATTACK]`, `[ITEM]`, `[BUFF]`, `[DEBUFF]`).
### 9. Use the tag system wherever possible
Do not create new systems if the tag system can be leveraged to create the same effect. Do not force the tag system in as a solution if it increases complexity significantly but the cost of adding a new system far exceeds a minor complexity increase. 

---

## 📋 Standard Workflow for Every Task

0. **I like to read your thoughts** Keep a running log of your thoughts for the current conversation in thoughts.md. It just makes it easier for me to understand your intent.
1. **Understand & Inspect**: Review the active code, schemas in `template.json`, and existing tests before making assumptions.
2. **Formulate the Test Case**: Identify the exact conditions and assertions needed in a corresponding `tests/<feature>.test.mjs` file.
3. **Implement**: Make clean, focused changes across source files, templates, and styles.
4. **Verify**: Execute `node --test tests/*.test.mjs`. Fix any failures.
5. **Migrate**: Create a migration script for any data changes if required. Run migration script to update all existing data in the compendium and non compendium data.
6. **Inspect Diff**: Verify `git diff` to ensure no stray files or accidental edits.
7. **Report**: Summarize changes clearly and point out verified test results.
8. **Documentation**: Create or update documentation in the `docs/` directory to reflect the changes. Update the README.md to reflect the changes. Update the CHANGELOG.md to reflect the changes.
9. **Release**: Increment the patch version in `system.json` and `template.json` to all foundry to detect system changes for updates. For major functional changes increment the minor version. For breaking changes increment the major version. For minor functional changes increment the patch version. Identify and create any migrations required to maintain the integrity of old data specifically skills/spells/classes/races and items. This should include migration for all compendium entries and non compendium items. 
