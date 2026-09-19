# Testing and Code Coverage Guide

This document details the testing architecture, headless Foundry VTT mocking harness, and code coverage auditing mechanisms for the **Dungeon Crawler Carl RPG (CarlRPG)** system.

---

## 1. Overview & Architecture

The CarlRPG system uses Node.js built-in test runner (`node:test` and `node:assert/strict`) combined with a headless Foundry VTT global mock in `tests/setup.mjs`.

- **Pure ES Modules**: Code and tests execute without Webpack, Vite, or Babel.
- **No Heavy Browser Overhead**: Fast headless execution completes in ~3–5 seconds for the entire 470+ assertion suite.
- **Isolated Domain Logic**: Core CarlRPG math, modifier tables, dice mechanics, condition tracking, and document models are strictly validated against official DCC RPG rules.

---

## 2. Test Execution Commands

### Run Full Test Suite
```bash
node --test tests/*.test.mjs
```

### Run a Single Test File
```bash
node --test tests/mob-and-item-models-extended.test.mjs
```

---

## 3. Measuring Code Coverage

Code coverage is calculated using Node.js's native V8 coverage collector (`--experimental-test-coverage`) targeting the `src/` directory.

### Running Coverage Audit Script
```bash
node scripts/coverage.mjs
```

The script:
1. Executes `node --test --experimental-test-coverage --test-coverage-include="src/**" tests/*.test.mjs`.
2. Filters out third-party/test dependencies and prints a formatted per-file summary table.
3. Checks every single file in `src/` against the **$\ge 75\%$ line coverage threshold**.
4. Exits with code `0` if all files meet or exceed 75%, or `1` if any file falls below.

### Direct Node.js Command
```bash
node --test --experimental-test-coverage --test-coverage-include="src/**" tests/*.test.mjs
```

---

## 4. Coverage Thresholds & Benchmarks

All modules in `src/` must meet or exceed 75% line coverage:

| Category | Typical Line Coverage | Status |
| :--- | :---: | :---: |
| **Actor & Item Data Models** (`src/models/`) | 90% – 100% | ✅ Meets Threshold ($\ge 75\%$) |
| **Game Data & Compendiums** (`src/data/`) | 89% – 100% | ✅ Meets Threshold ($\ge 75\%$) |
| **Documents** (`src/documents/`) | 84% – 95% | ✅ Meets Threshold ($\ge 75\%$) |
| **Sheets & Controllers** (`src/sheets/`) | 81% – 82% | ✅ Meets Threshold ($\ge 75\%$) |
| **Applications** (`src/apps/`) | 75% – 97% | ✅ Meets Threshold ($\ge 75\%$) |
| **System Entry Point** (`src/dcc.mjs`) | 76% – 77% | ✅ Meets Threshold ($\ge 75\%$) |
| **Overall Codebase Benchmark** | **> 91%** | ✅ Meets Threshold ($\ge 75\%$) |

---

## 5. Mocking Strategy in `tests/setup.mjs`

To test Foundry documents and UI components headlessly:
- **`MockActor` / `MockItem` / `DCCActor` / `DCCItem`**: Implements document lifecycles, embedded collections, and `update()`.
- **`MockDocumentSheet`**: Simulates sheet state with `isEditable = true`, form data harvesting, and listener attachment.
- **`createMockJQuery`**: Provides chainable jQuery methods (`.find()`, `.closest()`, `.data()`, `.val()`, `.click()`, `.on()`, `.off()`, `.hasClass()`).
- **`Hooks`**: Provides `Hooks.on`, `Hooks.once`, `Hooks.off`, and `Hooks.callAll` returning `Promise.all` for async callbacks.
