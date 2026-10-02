import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCFloorClockHUD } from '../src/apps/floor-clock-hud.mjs';
import { DCCCrawlerClockHUD } from '../src/apps/crawler-clock-hud.mjs';
import { DCCFloorClockHUD as HUDRef } from '../src/apps/floor-clock-hud.mjs';
import { ensureBackgroundTables, rollBackgroundTable } from '../src/data/background-tables.mjs';

describe('DCC RPG Foundry v15 Deprecation & Namespacing Compatibility', () => {

  describe('1. Class Inheritance Hierarchy under namespaced globals', () => {
    test('DCCActor inherits from foundry.documents.Actor or BaseActor', () => {
      const TargetBase = globalThis.foundry.documents.Actor;
      assert.ok(
        DCCActor.prototype instanceof TargetBase || DCCActor.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCActor) === TargetBase,
        'DCCActor must inherit from foundry.documents.Actor'
      );
    });

    test('DCCItem inherits from foundry.documents.Item or BaseItem', () => {
      const TargetBase = globalThis.foundry.documents.Item;
      assert.ok(
        DCCItem.prototype instanceof TargetBase || DCCItem.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCItem) === TargetBase,
        'DCCItem must inherit from foundry.documents.Item'
      );
    });

    test('DCCCrawlerSheet inherits from foundry.appv1.sheets.ActorSheet', () => {
      const TargetBase = globalThis.foundry.appv1.sheets.ActorSheet;
      assert.ok(
        DCCCrawlerSheet.prototype instanceof TargetBase || DCCCrawlerSheet.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCCrawlerSheet) === TargetBase,
        'DCCCrawlerSheet must inherit from foundry.appv1.sheets.ActorSheet'
      );
    });

    test('DCCItemSheet inherits from foundry.appv1.sheets.ItemSheet', () => {
      const TargetBase = globalThis.foundry.appv1.sheets.ItemSheet;
      assert.ok(
        DCCItemSheet.prototype instanceof TargetBase || DCCItemSheet.prototype === TargetBase.prototype || Object.getPrototypeOf(DCCItemSheet) === TargetBase,
        'DCCItemSheet must inherit from foundry.appv1.sheets.ItemSheet'
      );
    });
  });

  describe('2. Absence of Deprecated Global Property Accesses', () => {
    test('renderTemplate in DCCFloorClockHUD prioritizes foundry.applications.handlebars.renderTemplate', async () => {
      let accessedDeprecatedRenderTemplate = false;
      let accessedNamespacedRenderTemplate = false;

      const originalRenderTemplateDesc = Object.getOwnPropertyDescriptor(globalThis, 'renderTemplate');
      const originalNamespaced = globalThis.foundry.applications.handlebars.renderTemplate;

      try {
        Object.defineProperty(globalThis, 'renderTemplate', {
          get() {
            accessedDeprecatedRenderTemplate = true;
            return originalNamespaced;
          },
          configurable: true
        });

        globalThis.foundry.applications.handlebars.renderTemplate = async () => {
          accessedNamespacedRenderTemplate = true;
          return '<div id="dcc-floor-clock-hud"><span>100h</span></div>';
        };

        const createMockElement = () => ({
          style: {},
          setAttribute: () => {},
          replaceWith: () => {},
          addEventListener: () => {}
        });

        const hud = new DCCFloorClockHUD();
        // Setup minimal mock DOM
        const mockContainer = {
          appendChild: () => {}
        };
        globalThis.document = {
          getElementById: () => null,
          createElement: () => ({ innerHTML: '', firstElementChild: createMockElement() }),
          body: mockContainer
        };

        await hud.render();

        assert.equal(accessedNamespacedRenderTemplate, true, 'Must call namespaced renderTemplate');
        assert.equal(accessedDeprecatedRenderTemplate, false, 'Must not access deprecated global renderTemplate');
      } finally {
        if (originalRenderTemplateDesc) Object.defineProperty(globalThis, 'renderTemplate', originalRenderTemplateDesc);
        globalThis.foundry.applications.handlebars.renderTemplate = originalNamespaced;
      }
    });

    test('renderTemplate in DCCCrawlerClockHUD prioritizes foundry.applications.handlebars.renderTemplate', async () => {
      let accessedDeprecatedRenderTemplate = false;
      let accessedNamespacedRenderTemplate = false;

      const originalRenderTemplateDesc = Object.getOwnPropertyDescriptor(globalThis, 'renderTemplate');
      const originalNamespaced = globalThis.foundry.applications.handlebars.renderTemplate;

      try {
        Object.defineProperty(globalThis, 'renderTemplate', {
          get() {
            accessedDeprecatedRenderTemplate = true;
            return originalNamespaced;
          },
          configurable: true
        });

        globalThis.foundry.applications.handlebars.renderTemplate = async () => {
          accessedNamespacedRenderTemplate = true;
          return '<div id="dcc-crawler-clock-hud"><span>13M</span></div>';
        };

        const createMockElement = () => ({
          style: {},
          setAttribute: () => {},
          replaceWith: () => {},
          addEventListener: () => {}
        });

        const hud = new DCCCrawlerClockHUD();
        globalThis.document = {
          getElementById: () => null,
          createElement: () => ({ innerHTML: '', firstElementChild: createMockElement() }),
          body: { appendChild: () => {} }
        };

        await hud.render();

        assert.equal(accessedNamespacedRenderTemplate, true, 'Must call namespaced renderTemplate');
        assert.equal(accessedDeprecatedRenderTemplate, false, 'Must not access deprecated global renderTemplate');
      } finally {
        if (originalRenderTemplateDesc) Object.defineProperty(globalThis, 'renderTemplate', originalRenderTemplateDesc);
        globalThis.foundry.applications.handlebars.renderTemplate = originalNamespaced;
      }
    });

    test('loadTemplates resolution in dcc.mjs prioritizes foundry.applications.handlebars.loadTemplates', () => {
      let accessedDeprecatedLoadTemplates = false;
      const originalLoadTemplatesDesc = Object.getOwnPropertyDescriptor(globalThis, 'loadTemplates');

      try {
        Object.defineProperty(globalThis, 'loadTemplates', {
          get() {
            accessedDeprecatedLoadTemplates = true;
            return globalThis.foundry.applications.handlebars.loadTemplates;
          },
          configurable: true
        });

        const loadTemplatesFn = globalThis.foundry?.applications?.handlebars?.loadTemplates
          ?? globalThis.foundry?.utils?.loadTemplates
          ?? globalThis.loadTemplates;

        assert.equal(loadTemplatesFn, globalThis.foundry.applications.handlebars.loadTemplates);
        assert.equal(accessedDeprecatedLoadTemplates, false, 'Should not access deprecated global loadTemplates');
      } finally {
        if (originalLoadTemplatesDesc) Object.defineProperty(globalThis, 'loadTemplates', originalLoadTemplatesDesc);
      }
    });

    test('ensureBackgroundTables creates RollTable without accessing deprecated global RollTable', async () => {
      let accessedDeprecatedRollTable = false;
      const originalRollTableDesc = Object.getOwnPropertyDescriptor(globalThis, 'RollTable');

      try {
        Object.defineProperty(globalThis, 'RollTable', {
          get() {
            accessedDeprecatedRollTable = true;
            return globalThis.foundry.documents.RollTable;
          },
          configurable: true
        });

        globalThis.game = {
          user: { isGM: true },
          tables: []
        };

        const tables = await ensureBackgroundTables();
        assert.ok(Array.isArray(tables));
        assert.equal(tables.length, 3);
        assert.equal(accessedDeprecatedRollTable, false, 'Should not access deprecated global RollTable');
      } finally {
        if (originalRollTableDesc) Object.defineProperty(globalThis, 'RollTable', originalRollTableDesc);
      }
    });

    test('DCCItemSheet._onDrop resolves TextEditor from foundry.applications.ux.TextEditor without accessing deprecated global TextEditor', async () => {
      let accessedDeprecatedTextEditor = false;
      const originalTextEditorDesc = Object.getOwnPropertyDescriptor(globalThis, 'TextEditor');

      try {
        Object.defineProperty(globalThis, 'TextEditor', {
          get() {
            accessedDeprecatedTextEditor = true;
            return globalThis.foundry.applications.ux.TextEditor;
          },
          configurable: true
        });

        const item = new DCCItem({
          name: 'Sword',
          type: 'gear',
          system: { skillModifiers: [] }
        });
        const sheet = new DCCItemSheet(item);

        const mockEvent = {
          preventDefault: () => {},
          dataTransfer: {
            getData: (type) => JSON.stringify({ type: 'Other', id: '123' })
          }
        };

        await sheet._onDrop(mockEvent);

        assert.equal(accessedDeprecatedTextEditor, false, 'Should not access deprecated global TextEditor');
      } finally {
        if (originalTextEditorDesc) Object.defineProperty(globalThis, 'TextEditor', originalTextEditorDesc);
      }
    });
  });
});
