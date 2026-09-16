import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import './setup.mjs';

import { DCC_MACROS } from '../src/data/macros.mjs';
import { setupInitialHotbar } from '../src/dcc.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('DCC RPG - System Macros & Compendium Integration', async (t) => {

  await t.test('1. System Manifest (system.json) registers macros compendium with Player Observer ownership', () => {
    const sysJsonPath = path.resolve(__dirname, '../system.json');
    const systemJson = JSON.parse(fs.readFileSync(sysJsonPath, 'utf8'));

    const macroPack = systemJson.packs.find(p => p.name === 'macros');
    assert.ok(macroPack, 'system.json must register "macros" pack');
    assert.equal(macroPack.type, 'Macro', 'Pack type must be Macro');
    assert.equal(macroPack.path, 'packs/macros', 'Pack path must be packs/macros');
    assert.equal(macroPack.ownership?.PLAYER, 'OBSERVER', 'Players must have OBSERVER permissions on macro compendium');
  });

  await t.test('2. DCC_MACROS dataset contains the 3 canonical macros with Observer permissions', () => {
    assert.equal(DCC_MACROS.length, 3, 'Must define exactly 3 canonical system macros');

    const creatorMacro = DCC_MACROS.find(m => m.name === 'Character Creator');
    assert.ok(creatorMacro, 'Must include Character Creator macro');
    assert.equal(creatorMacro.type, 'script');
    assert.equal(creatorMacro.ownership?.default, 2, 'Must have default: 2 (OBSERVER) for all users');
    assert.equal(creatorMacro.flags?.['carl-rpg']?.macroKey, 'crawler-creator');

    const metricsMacro = DCC_MACROS.find(m => m.name === 'Open Combat Metrics');
    assert.ok(metricsMacro, 'Must include Open Combat Metrics macro');
    assert.equal(metricsMacro.type, 'script');
    assert.equal(metricsMacro.ownership?.default, 2, 'Must have default: 2 (OBSERVER) for all users');
    assert.equal(metricsMacro.flags?.['carl-rpg']?.macroKey, 'combat-metrics');

    const sessionMacro = DCC_MACROS.find(m => m.name === 'Party Progression and Session Hub');
    assert.ok(sessionMacro, 'Must include Party Progression and Session Hub macro');
    assert.equal(sessionMacro.type, 'script');
    assert.equal(sessionMacro.ownership?.default, 2, 'Must have default: 2 (OBSERVER) for all users');
    assert.equal(sessionMacro.flags?.['carl-rpg']?.macroKey, 'session-manager');
  });

  await t.test('3. Prebuilt LevelDB pack directory packs/macros exists and contains database files', () => {
    const packDir = path.resolve(__dirname, '../packs/macros');
    assert.ok(fs.existsSync(packDir), 'packs/macros directory must exist');
    const files = fs.readdirSync(packDir);
    assert.ok(files.length > 0, 'packs/macros must contain LevelDB files');
  });

  await t.test('4. Macro script commands execute without error and invoke the respective apps', async () => {
    let creatorOpened = false;
    let metricsOpened = false;
    let sessionOpened = false;

    globalThis.window.carl = {
      openCrawlerCreator: () => { creatorOpened = true; return { rendered: true }; },
      openCombatMetrics: () => { metricsOpened = true; return { rendered: true }; },
      openSessionManager: () => { sessionOpened = true; return { rendered: true }; }
    };

    const creator = new Macro(DCC_MACROS[0]);
    await creator.execute();
    assert.equal(creatorOpened, true, 'Character Creator macro command must invoke openCrawlerCreator()');

    const metrics = new Macro(DCC_MACROS[1]);
    await metrics.execute();
    assert.equal(metricsOpened, true, 'Combat Metrics macro command must invoke openCombatMetrics()');

    const session = new Macro(DCC_MACROS[2]);
    await session.execute();
    assert.equal(sessionOpened, true, 'Session Hub macro command must invoke openSessionManager()');
  });

  await t.test('5. setupInitialHotbar assigns slots 1, 2, and 3 on first login for users', async () => {
    // Populate game.macros with the canonical macros
    globalThis.game.macros = DCC_MACROS.map(m => new Macro(m));

    const testUser = {
      id: 'player-1',
      name: 'Player One',
      isGM: false,
      hotbar: {},
      flags: {},
      getFlag(scope, key) {
        return this.flags?.[scope]?.[key];
      },
      async setFlag(scope, key, val) {
        this.flags = this.flags || {};
        this.flags[scope] = this.flags[scope] || {};
        this.flags[scope][key] = val;
      },
      async assignHotbarMacro(macro, slot) {
        this.hotbar = this.hotbar || {};
        this.hotbar[slot] = macro ? macro.id : null;
      }
    };

    await setupInitialHotbar(testUser);

    assert.equal(testUser.hotbar[1], DCC_MACROS[0]._id, 'Slot 1 must contain Character Creator');
    assert.equal(testUser.hotbar[2], DCC_MACROS[1]._id, 'Slot 2 must contain Open Combat Metrics');
    assert.equal(testUser.hotbar[3], DCC_MACROS[2]._id, 'Slot 3 must contain Party Progression and Session Hub');
    assert.equal(testUser.getFlag('carl-rpg', 'initialHotbarConfigured'), true, 'initialHotbarConfigured flag must be set');

    // Second call without force should not overwrite user changes
    testUser.hotbar[1] = 'custom-user-macro';
    await setupInitialHotbar(testUser);
    assert.equal(testUser.hotbar[1], 'custom-user-macro', 'Existing user slot assignment should be preserved');

    // With force: true, re-populates slot
    await setupInitialHotbar(testUser, { force: true });
    assert.equal(testUser.hotbar[1], DCC_MACROS[0]._id, 'force: true must re-apply slot 1');
  });

  await t.test('6. Macro availability to non-administrator players', async () => {
    for (const macroData of DCC_MACROS) {
      assert.ok(
        macroData.ownership.default >= 2,
        `Macro "${macroData.name}" must have default ownership >= 2 (OBSERVER) to be executable by all non-admin players`
      );
    }
  });
});
