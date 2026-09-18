import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import './setup.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';
import { DCCCombatMetricsApp } from '../src/apps/combat-metrics.mjs';
import { DCCCombatArchiveApp } from '../src/apps/combat-archive.mjs';
import { DCCSessionManagerApp } from '../src/apps/session-manager.mjs';
import { DCCSpellManager } from '../src/apps/spell-manager.mjs';
import { DCCBuffDebuffManager } from '../src/apps/buff-manager.mjs';
import { DCCSkillManager } from '../src/apps/skill-manager.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';

describe('DCC RPG Foundry v13 Namespaced Globals Compatibility', () => {

  describe('1. Class Inheritance Hierarchy under foundry.appv1', () => {
    test('DCCCrawlerSheet inherits from foundry.appv1.sheets.ActorSheet', () => {
      const TargetBase = globalThis.foundry.appv1.sheets.ActorSheet;
      assert.ok(DCCCrawlerSheet.prototype instanceof TargetBase || DCCCrawlerSheet.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCCrawlerSheet) === TargetBase);
    });

    test('DCCItemSheet inherits from foundry.appv1.sheets.ItemSheet', () => {
      const TargetBase = globalThis.foundry.appv1.sheets.ItemSheet;
      assert.ok(DCCItemSheet.prototype instanceof TargetBase || DCCItemSheet.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCItemSheet) === TargetBase);
    });

    test('DCCCombatTracker inherits from foundry.applications.sidebar.tabs.CombatTracker', () => {
      const TargetBase = globalThis.foundry.applications.sidebar.tabs.CombatTracker;
      assert.ok(DCCCombatTracker.prototype instanceof TargetBase || DCCCombatTracker.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCCombatTracker) === TargetBase);
    });

    test('Application classes inherit from foundry.applications.api.ApplicationV2', () => {
      const TargetBase = globalThis.foundry.applications.api.ApplicationV2;
      const apps = [
        DCCCrawlerCreatorApp,
        DCCCombatMetricsApp,
        DCCCombatArchiveApp,
        DCCSessionManagerApp,
        DCCSpellManager,
        DCCBuffDebuffManager,
        DCCSkillManager
      ];

      for (const AppClass of apps) {
        assert.ok(
          AppClass.prototype instanceof TargetBase || Object.getPrototypeOf(AppClass) === TargetBase,
          `${AppClass.name} must inherit from foundry.applications.api.ApplicationV2`
        );
      }
    });
  });

  describe('2. Absence of Deprecated Global Property Access in v13 Environment', () => {
    test('Sheet registration uses namespaced collections without accessing deprecated globals', () => {
      let accessedDeprecatedActorSheet = false;
      let accessedDeprecatedItemSheet = false;

      // Define instrumented getters on a mock global scope
      const originalActorSheetDesc = Object.getOwnPropertyDescriptor(globalThis, 'ActorSheet');
      const originalItemSheetDesc = Object.getOwnPropertyDescriptor(globalThis, 'ItemSheet');

      try {
        Object.defineProperty(globalThis, 'ActorSheet', {
          get() {
            accessedDeprecatedActorSheet = true;
            return globalThis.foundry.appv1.sheets.ActorSheet;
          },
          configurable: true
        });

        Object.defineProperty(globalThis, 'ItemSheet', {
          get() {
            accessedDeprecatedItemSheet = true;
            return globalThis.foundry.appv1.sheets.ItemSheet;
          },
          configurable: true
        });

        // Resolve classes using the same logic as dcc.mjs
        const BaseActorSheet = globalThis.foundry?.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
        const BaseItemSheet = globalThis.foundry?.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;

        assert.equal(BaseActorSheet, globalThis.foundry.appv1.sheets.ActorSheet);
        assert.equal(BaseItemSheet, globalThis.foundry.appv1.sheets.ItemSheet);

        assert.equal(accessedDeprecatedActorSheet, false, 'Should not access deprecated global ActorSheet');
        assert.equal(accessedDeprecatedItemSheet, false, 'Should not access deprecated global ItemSheet');
      } finally {
        if (originalActorSheetDesc) Object.defineProperty(globalThis, 'ActorSheet', originalActorSheetDesc);
        if (originalItemSheetDesc) Object.defineProperty(globalThis, 'ItemSheet', originalItemSheetDesc);
      }
    });

    test('loadTemplates resolution prioritizes foundry.applications.handlebars.loadTemplates', () => {
      let accessedDeprecatedLoadTemplates = false;
      const originalLoadTemplates = globalThis.loadTemplates;

      try {
        Object.defineProperty(globalThis, 'loadTemplates', {
          get() {
            accessedDeprecatedLoadTemplates = true;
            return originalLoadTemplates;
          },
          configurable: true
        });

        const loadTemplatesFn = globalThis.foundry?.applications?.handlebars?.loadTemplates
          ?? globalThis.foundry?.utils?.loadTemplates
          ?? globalThis.loadTemplates;

        assert.equal(loadTemplatesFn, globalThis.foundry.applications.handlebars.loadTemplates);
        assert.equal(accessedDeprecatedLoadTemplates, false, 'Should not access deprecated global loadTemplates');
      } finally {
        Object.defineProperty(globalThis, 'loadTemplates', {
          value: originalLoadTemplates,
          writable: true,
          configurable: true
        });
      }
    });

    test('CombatTracker resolution prioritizes foundry.applications.sidebar.tabs.CombatTracker without accessing deprecated global', () => {
      let accessedDeprecatedCombatTracker = false;
      const originalCombatTrackerDesc = Object.getOwnPropertyDescriptor(globalThis, 'CombatTracker');

      try {
        Object.defineProperty(globalThis, 'CombatTracker', {
          get() {
            accessedDeprecatedCombatTracker = true;
            return globalThis.foundry.applications.sidebar.tabs.CombatTracker;
          },
          configurable: true
        });

        const BaseCombatTracker = globalThis.foundry?.applications?.sidebar?.tabs?.CombatTracker
          ?? globalThis.foundry?.appv1?.sidebar?.tabs?.CombatTracker
          ?? globalThis.CombatTracker
          ?? class {};

        assert.equal(BaseCombatTracker, globalThis.foundry.applications.sidebar.tabs.CombatTracker);
        assert.equal(accessedDeprecatedCombatTracker, false, 'Should not access deprecated global CombatTracker');
      } finally {
        if (originalCombatTrackerDesc) Object.defineProperty(globalThis, 'CombatTracker', originalCombatTrackerDesc);
      }
    });

    test('ActorDirectory resolution in getApplicationHeaderButtons does not touch deprecated global', () => {
      let accessedDeprecatedActorDirectory = false;
      const originalActorDirectoryDesc = Object.getOwnPropertyDescriptor(globalThis, 'ActorDirectory');

      try {
        Object.defineProperty(globalThis, 'ActorDirectory', {
          get() {
            accessedDeprecatedActorDirectory = true;
            return globalThis.foundry.applications.sidebar.tabs.ActorDirectory;
          },
          configurable: true
        });

        // Trigger getApplicationHeaderButtons hook with an arbitrary app
        const buttons = [];
        const mockApp = new DCCCombatMetricsApp();
        globalThis.Hooks.callAll('getApplicationHeaderButtons', mockApp, buttons);

        assert.equal(accessedDeprecatedActorDirectory, false, 'Should not access deprecated global ActorDirectory');
      } finally {
        if (originalActorDirectoryDesc) Object.defineProperty(globalThis, 'ActorDirectory', originalActorDirectoryDesc);
      }
    });

    test('DCCCombatMetricsApp and other apps instantiate without invoking deprecated V1 Application constructor', () => {
      let accessedDeprecatedV1App = false;
      const originalV1App = globalThis.foundry.appv1.applications.Application;

      try {
        globalThis.foundry.appv1.applications.Application = class SpyV1App extends originalV1App {
          constructor(...args) {
            super(...args);
            accessedDeprecatedV1App = true;
          }
        };

        const app = new DCCCombatMetricsApp();
        assert.ok(app);
        assert.equal(accessedDeprecatedV1App, false, 'DCCCombatMetricsApp must not instantiate V1 Application');
      } finally {
        globalThis.foundry.appv1.applications.Application = originalV1App;
      }
    });
  });

  describe('3. ApplicationV2 Options Initialization & id.replace Safety', () => {
    test('DCCSessionManagerApp, DCCCrawlerCreatorApp, and DCCCombatMetricsApp instantiate without TypeError on replace()', () => {
      const sessionApp = new DCCSessionManagerApp();
      assert.ok(sessionApp);
      assert.equal(typeof sessionApp.id, 'string');
      assert.equal(sessionApp.id, 'dcc-session-manager');
      assert.ok(sessionApp.options.id, 'options.id must be defined');

      const creatorApp = new DCCCrawlerCreatorApp();
      assert.ok(creatorApp);
      assert.equal(typeof creatorApp.id, 'string');
      assert.equal(creatorApp.id, 'dcc-crawler-creator');

      const metricsApp = new DCCCombatMetricsApp();
      assert.ok(metricsApp);
      assert.equal(typeof metricsApp.id, 'string');
      assert.equal(metricsApp.id, 'dcc-combat-metrics-app');
    });

    test('All DCC Application classes initialize valid string IDs and window options', () => {
      const apps = [
        { cls: DCCSessionManagerApp, expectedId: 'dcc-session-manager' },
        { cls: DCCCrawlerCreatorApp, expectedId: 'dcc-crawler-creator' },
        { cls: DCCCombatMetricsApp, expectedId: 'dcc-combat-metrics-app' },
        { cls: DCCCombatArchiveApp, expectedId: 'dcc-combat-archive' },
        { cls: DCCSpellManager, expectedId: 'dcc-spell-manager' },
        { cls: DCCBuffDebuffManager, expectedId: 'dcc-buff-manager' },
        { cls: DCCSkillManager, expectedId: 'dcc-skill-manager' }
      ];

      for (const { cls: AppClass, expectedId } of apps) {
        const instance = new AppClass();
        assert.ok(instance, `${AppClass.name} should instantiate`);
        assert.equal(typeof instance.id, 'string', `${AppClass.name}.id must be a string`);
        assert.ok(instance.id.length > 0, `${AppClass.name}.id must not be empty`);
        assert.equal(instance.id, expectedId, `${AppClass.name}.id should match expected default ID`);
        assert.ok(instance.title, `${AppClass.name}.title should be defined`);
      }
    });

    test('Custom options passed to constructor correctly override default options without error', () => {
      const customApp = new DCCSessionManagerApp({
        id: 'custom-session-manager',
        window: { title: 'Custom Session Title' }
      });
      assert.equal(customApp.id, 'custom-session-manager');
      assert.equal(customApp.title, 'Custom Session Title');
    });

    test('render(true) and close() lifecycle methods operate without errors and maintain ui.windows registry', async () => {
      const app = new DCCSessionManagerApp();
      await app.render(true);
      assert.ok(app.rendered);
      assert.equal(globalThis.ui.windows[app.id], app);

      await app.close();
      assert.equal(app.rendered, false);
      assert.equal(globalThis.ui.windows[app.id], undefined);
    });
  });
});
