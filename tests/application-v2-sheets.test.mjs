import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import '../src/dcc.mjs';

import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

Hooks.callAll('init');

test('Application V2 Sheet Modernization (Phase 3)', async (t) => {

  await t.test('1. DCCCrawlerSheet Application V2 Architecture & Options', () => {
    assert.ok(DCCCrawlerSheet.DEFAULT_OPTIONS, 'DCCCrawlerSheet defines static DEFAULT_OPTIONS');
    assert.strictEqual(DCCCrawlerSheet.DEFAULT_OPTIONS.tag, 'form');
    assert.ok(DCCCrawlerSheet.DEFAULT_OPTIONS.classes.includes('crawler'));
    assert.strictEqual(DCCCrawlerSheet.DEFAULT_OPTIONS.position.width, 860);
    assert.strictEqual(DCCCrawlerSheet.DEFAULT_OPTIONS.position.height, 900);

    // Window controls (PDF export)
    const pdfControl = DCCCrawlerSheet.DEFAULT_OPTIONS.window?.controls?.find(c => c.action === 'exportPdf');
    assert.ok(pdfControl, 'DEFAULT_OPTIONS defines window control for exportPdf');
    assert.strictEqual(pdfControl.label, 'Save to PDF');

    // Parts definition
    assert.ok(DCCCrawlerSheet.PARTS?.sheet, 'DCCCrawlerSheet defines static PARTS.sheet');
    assert.strictEqual(DCCCrawlerSheet.PARTS.sheet.template, 'systems/carl-rpg/templates/actors/crawler-sheet.hbs');

    // V1 defaultOptions compatibility
    const v1Opts = DCCCrawlerSheet.defaultOptions;
    assert.ok(v1Opts, 'defaultOptions getter preserved for FormApplication V1 callers');
    assert.strictEqual(v1Opts.width, 860);
    assert.strictEqual(v1Opts.template, 'systems/carl-rpg/templates/actors/crawler-sheet.hbs');
  });

  await t.test('2. DCCCrawlerSheet Dual Constructor & Context Preparation', async () => {
    const actor = await DCCActor.create({
      name: 'Carl Sheet Test',
      type: 'crawler',
      system: {
        abilities: {
          str: { unenhanced: 18, value: 18 }
        },
        attributes: {
          size: 'Medium'
        }
      }
    });

    // Test legacy positional constructor: new DCCCrawlerSheet(actor)
    const v1Sheet = new DCCCrawlerSheet(actor);
    assert.strictEqual(v1Sheet.actor, actor);
    assert.strictEqual(v1Sheet.document, actor);

    // Test Application V2 constructor: new DCCCrawlerSheet({ document: actor })
    const v2Sheet = new DCCCrawlerSheet({ document: actor });
    assert.strictEqual(v2Sheet.actor, actor);
    assert.strictEqual(v2Sheet.document, actor);

    // Context preparation via App V2 _prepareContext()
    const context = await v2Sheet._prepareContext();
    assert.ok(context, 'context returned');
    assert.strictEqual(context.actor, actor);
    assert.strictEqual(context.system.abilities.str.value, 18);
    assert.ok(Array.isArray(context.sizeOptions), 'context contains sizeOptions');
    assert.ok(Array.isArray(context.attacks), 'context categorizes attacks array');
    assert.ok(Array.isArray(context.skills), 'context categorizes skills array');
    assert.ok(Array.isArray(context.spells), 'context categorizes spells array');
    assert.ok(Array.isArray(context.gear), 'context categorizes gear array');
    assert.ok(context.equippedBySlot, 'context defines equippedBySlot mapping');
    assert.ok(Array.isArray(context.hotlistSlots), 'context defines hotlistSlots array');

    // Compatibility check: getData() returns the same context
    const v1Context = await v1Sheet.getData();
    assert.strictEqual(v1Context.actor, actor);
    assert.strictEqual(v1Context.system.abilities.str.value, 18);

    // Header buttons (V1)
    const headerButtons = v1Sheet._getHeaderButtons();
    assert.ok(headerButtons.some(b => b.label === 'Save to PDF'));

    // Render hook (_onRender)
    assert.doesNotThrow(() => {
      v2Sheet._onRender(context, {});
    });
  });

  await t.test('3. DCCItemSheet Application V2 Architecture & Options', () => {
    assert.ok(DCCItemSheet.DEFAULT_OPTIONS, 'DCCItemSheet defines static DEFAULT_OPTIONS');
    assert.strictEqual(DCCItemSheet.DEFAULT_OPTIONS.tag, 'form');
    assert.ok(DCCItemSheet.DEFAULT_OPTIONS.classes.includes('item'));
    assert.strictEqual(DCCItemSheet.DEFAULT_OPTIONS.position.width, 580);
    assert.strictEqual(DCCItemSheet.DEFAULT_OPTIONS.position.height, 640);

    // Parts definition
    assert.ok(DCCItemSheet.PARTS?.sheet, 'DCCItemSheet defines static PARTS.sheet');
    assert.strictEqual(DCCItemSheet.PARTS.sheet.template, 'systems/carl-rpg/templates/items/item-sheet.hbs');

    // V1 defaultOptions compatibility
    const v1Opts = DCCItemSheet.defaultOptions;
    assert.ok(v1Opts, 'defaultOptions getter preserved');
    assert.strictEqual(v1Opts.width, 580);
  });

  await t.test('4. DCCItemSheet Dual Constructor & Context Preparation', async () => {
    const item = await DCCItem.create({
      name: 'Warhammer of Smiting',
      type: 'gear',
      system: {
        slot: 'hands',
        drBonus: 0,
        evadeBonus: 0,
        abilityModifiers: {
          str: { value: 3, type: 'flat' }
        }
      }
    });

    // Test legacy constructor: new DCCItemSheet(item)
    const v1Sheet = new DCCItemSheet(item);
    assert.strictEqual(v1Sheet.item, item);
    assert.strictEqual(v1Sheet.document, item);

    // Test App V2 constructor: new DCCItemSheet({ document: item })
    const v2Sheet = new DCCItemSheet({ document: item });
    assert.strictEqual(v2Sheet.item, item);
    assert.strictEqual(v2Sheet.document, item);

    // Context preparation
    const context = await v2Sheet._prepareContext();
    assert.ok(context);
    assert.strictEqual(context.item, item);
    assert.strictEqual(context.system.slot, 'hands');
    assert.ok(context.abilities, 'context provides abilities list');
    assert.ok(Array.isArray(context.damageTypes), 'context provides damageTypes');

    // V1 getData() alias
    const v1Context = await v1Sheet.getData();
    assert.strictEqual(v1Context.item, item);

    // Render hook
    assert.doesNotThrow(() => {
      v2Sheet._onRender(context, {});
    });
  });

  await t.test('5. Foundry V12 Sheet Inheritance & Prototype Safety', () => {
    // Both sheet controllers must inherit from ActorSheet and ItemSheet for native V12 compatibility
    assert.ok(DCCCrawlerSheet.prototype instanceof ActorSheet, 'DCCCrawlerSheet inherits from ActorSheet');
    assert.ok(DCCItemSheet.prototype instanceof ItemSheet, 'DCCItemSheet inherits from ItemSheet');
  });

  await t.test('6. Global Applications Namespace', () => {
    assert.strictEqual(game.dcc.applications.DCCCrawlerSheet, DCCCrawlerSheet);
    assert.strictEqual(game.dcc.applications.DCCItemSheet, DCCItemSheet);
  });
});

