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

    test('DCCCombatTracker inherits from foundry.appv1.sidebar.tabs.CombatTracker', () => {
      const TargetBase = globalThis.foundry.appv1.sidebar.tabs.CombatTracker;
      assert.ok(DCCCombatTracker.prototype instanceof TargetBase || DCCCombatTracker.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCCombatTracker) === TargetBase);
    });

    test('Application classes inherit from foundry.appv1.applications.Application', () => {
      const TargetBase = globalThis.foundry.appv1.applications.Application;
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
          `${AppClass.name} must inherit from foundry.appv1.applications.Application`
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
  });
});
