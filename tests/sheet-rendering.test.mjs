import './setup.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCSessionManagerApp, DCCSessionEngine } from '../src/apps/session-manager.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('Sheet & App Rendering Stability: Prevents read-only getter collisions in Foundry VTT', async (t) => {
  await t.test('1. DCCCrawlerSheet instantiates, accesses actor/document getters, and renders getData without errors', async () => {
    const actor = new DCCActor({
      name: 'Carl Tester',
      type: 'crawler',
      system: {
        attributes: {
          hp: { value: 40, max: 40 },
          mana: { value: 10, max: 10 },
          size: 'Medium'
        },
        abilities: {
          str: { value: 14, unenhanced: 14, mod: 2 },
          dex: { value: 16, unenhanced: 16, mod: 3 },
          con: { value: 14, unenhanced: 14, mod: 2 },
          int: { value: 10, unenhanced: 10, mod: 0 },
          cha: { value: 8, unenhanced: 8, mod: -1 }
        }
      }
    });

    // Instantiation must NOT throw "Cannot set property actor of #<...> which has only a getter"
    let sheet;
    assert.doesNotThrow(() => {
      sheet = new DCCCrawlerSheet(actor);
    }, 'DCCCrawlerSheet instantiation should not throw');

    assert.ok(sheet);
    assert.equal(sheet.actor, actor, 'sheet.actor getter should return the actor document');
    assert.equal(sheet.document, actor, 'sheet.document getter should return the actor document');

    // Rendering and getData must succeed
    const context = await sheet.getData();
    assert.ok(context, 'getData must return context object');
    assert.equal(context.actor, actor);
    assert.ok(context.system);
    assert.ok(Array.isArray(context.attacks));
    assert.ok(Array.isArray(context.skills));
    assert.ok(Array.isArray(context.spells));
    assert.ok(context.equippedBySlot);

    // render(true) must succeed
    assert.doesNotThrow(() => {
      sheet.render(true);
    });
    assert.equal(sheet.rendered, true);
  });

  await t.test('2. DCCItemSheet instantiates, accesses item/document getters, and renders getData without errors', async () => {
    const item = new DCCItem({
      name: 'Spiked Club',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        skillModifiers: [{ name: 'Bashing Weapons', bonus: 2 }]
      }
    });

    // Instantiation must NOT throw "Cannot set property item of #<...> which has only a getter"
    let sheet;
    assert.doesNotThrow(() => {
      sheet = new DCCItemSheet(item);
    }, 'DCCItemSheet instantiation should not throw');

    assert.ok(sheet);
    assert.equal(sheet.item, item, 'sheet.item getter should return the item document');
    assert.equal(sheet.document, item, 'sheet.document getter should return the item document');

    // Rendering and getData must succeed
    const context = await sheet.getData();
    assert.ok(context, 'getData must return context object');
    assert.equal(context.item, item);
    assert.ok(context.system);

    // render(true) must succeed
    assert.doesNotThrow(() => {
      sheet.render(true);
    });
    assert.equal(sheet.rendered, true);
  });

  await t.test('3. DCCSessionManagerApp instantiates, renders, and manages lifecycle using native Foundry rendered state', async () => {
    // Instantiation must NOT throw "Cannot set property rendered of #<...> which has only a getter"
    let app;
    assert.doesNotThrow(() => {
      app = new DCCSessionManagerApp();
    }, 'DCCSessionManagerApp instantiation should not throw');

    assert.ok(app);
    assert.equal(app.rendered, false, 'app.rendered should initially be false before render');

    // render(true) transitions app.rendered to true
    app.render(true);
    assert.equal(app.rendered, true, 'app.rendered should be true after render(true)');
    assert.ok(globalThis.ui.windows[app.appId], 'app should be in ui.windows[app.appId]');

    // getData succeeds
    const data = await app.getData();
    assert.ok(data, 'getData must return session data object');
    assert.ok(Array.isArray(data.crawlersList));
    assert.ok(Array.isArray(data.ledger));

    // close() transitions app.rendered to false and cleans up
    await app.close();
    assert.equal(app.rendered, false, 'app.rendered should be false after close');
  });

  await t.test('4. Real-time updates trigger re-render on active DCCSessionManagerApp without errors', async () => {
    const session = await DCCSessionEngine.createSession({ title: 'Live Update Test' });
    await DCCSessionEngine.setActiveSessionId(session.id);

    const app = new DCCSessionManagerApp();
    let renderCount = 0;
    const origRender = app.render.bind(app);
    app.render = (force = false, options = {}) => {
      renderCount++;
      return origRender(force, options);
    };

    app.render(true);
    assert.equal(renderCount, 1);
    assert.equal(app.rendered, true);

    // Trigger update via session engine
    await DCCSessionEngine.createManualEvent({
      actorId: 'test-crawler',
      name: 'Sneak Attack',
      type: 'attack',
      total: 18
    });

    assert.ok(renderCount >= 2, 'app.render should have been called on live update');

    await app.close();
    assert.equal(app.rendered, false);
  });
});
