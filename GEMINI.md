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
  - **Attacks**: Roll to hit (`actor.rollAttack(item, 'hit')`) and damage.
  - **Spells**: Cast spell with chat card (`actor.rollSpell(item)`).
  - **Gear**: Toggle equipment slot (`item.update({ 'system.equipped': !item.system.equipped })`).
  - **Loot / Consumables**: Use item and output chat message (`ChatMessage.create(...)`).

### 6. Design & Styling (DCC Theme)
- Follow the established Dungeon Crawler Carl visual theme:
  - Primary font: `'Oswald', sans-serif`
  - Accent / DCC Red: `#c0392b` / `#962d22`
  - Clean borders, high contrast, readable inputs, and crisp state badges (`[EQUIPPED]`, `[SPELL]`, `[ATTACK]`, `[ITEM]`).

---

## 📋 Standard Workflow for Every Task

1. **Understand & Inspect**: Review the active code, schemas in `template.json`, and existing tests before making assumptions.
2. **Formulate the Test Case**: Identify the exact conditions and assertions needed in a corresponding `tests/<feature>.test.mjs` file.
3. **Implement**: Make clean, focused changes across source files, templates, and styles.
4. **Verify**: Execute `node --test tests/*.test.mjs`. Fix any failures.
5. **Inspect Diff**: Verify `git diff` to ensure no stray files or accidental edits.
6. **Report**: Summarize changes clearly and point out verified test results.
7. **Release**: Increment the patch version in `system.json` and `template.json` to all foundry to detect system changes for updates.
