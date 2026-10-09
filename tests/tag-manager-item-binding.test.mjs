import './setup.mjs';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DCCTagManager } from '../src/apps/tag-manager.mjs';
import { MockItem } from './setup.mjs';

describe('DCCTagManager Item Binding & Tag Assignment', () => {

  beforeEach(() => {
    if (globalThis.game?.settings?.set) {
      globalThis.game.settings.set('carl-rpg', 'customTags', []);
    }
  });

  test('initializes with item option and binds targetItem in getData()', async () => {
    const item = new MockItem({
      name: 'Boom Stick',
      type: 'gear',
      system: {
        tags: ['weapon.shotgun', 'element.fire']
      }
    });

    const app = new DCCTagManager({ item });
    assert.strictEqual(app.item, item);

    const data = await app.getData();
    assert.ok(data.targetItem, 'targetItem must be populated in template context');
    assert.strictEqual(data.targetItem.id, item.id);
    assert.strictEqual(data.targetItem.name, 'Boom Stick');
    assert.strictEqual(data.targetItem.type, 'gear');
    assert.deepStrictEqual(data.targetItem.tags, ['weapon.shotgun', 'element.fire']);

    // Check tagsList for isAssigned flags
    const shotgunTag = data.tagsList.find(t => t.id === 'weapon.shotgun');
    assert.ok(shotgunTag, 'weapon.shotgun tag should exist');
    assert.strictEqual(shotgunTag.isAssigned, true, 'weapon.shotgun should be marked as assigned');

    const slashingTag = data.tagsList.find(t => t.id === 'damage.slashing');
    if (slashingTag) {
      assert.strictEqual(slashingTag.isAssigned, false, 'damage.slashing should not be marked as assigned');
    }
  });

  test('toggle checkbox event adds and removes tags from item.system.tags', async () => {
    let updatePayload = null;
    const item = new MockItem({
      name: 'Test Sword',
      type: 'gear',
      system: {
        tags: ['weapon.blade']
      }
    });
    item.update = async function(data) {
      updatePayload = data;
      if (data['system.tags']) {
        this.system.tags = [...data['system.tags']];
      }
      return this;
    };

    const app = new DCCTagManager({ item });

    // Mock html element with listeners
    const handlers = {};
    const mockHtml = {
      find(selector) {
        return {
          click(fn) { handlers[selector + ':click'] = fn; return this; },
          on(evt, fn) { handlers[`${selector}:${evt}`] = fn; return this; },
          val() { return ''; },
          is() { return false; }
        };
      }
    };

    app.activateListeners(mockHtml);
    assert.ok(handlers['.dcc-tag-assign-toggle:change'], 'Change handler for tag toggle must be registered');

    // Simulate checking 'element.fire'
    await handlers['.dcc-tag-assign-toggle:change']({
      preventDefault() {},
      currentTarget: { dataset: { tagId: 'element.fire' }, checked: true }
    });

    assert.ok(updatePayload, 'item.update should be called');
    assert.deepStrictEqual(updatePayload['system.tags'], ['weapon.blade', 'element.fire']);
    assert.ok(item.system.tags.includes('element.fire'));

    // Simulate unchecking 'weapon.blade'
    await handlers['.dcc-tag-assign-toggle:change']({
      preventDefault() {},
      currentTarget: { dataset: { tagId: 'weapon.blade' }, checked: false }
    });

    assert.deepStrictEqual(updatePayload['system.tags'], ['element.fire']);
    assert.ok(!item.system.tags.includes('weapon.blade'));
  });

  test('registering custom tag with applyToItem: true adds the tag to item.system.tags', async () => {
    let updatePayload = null;
    const item = new MockItem({
      name: 'Custom Wand',
      type: 'gear',
      system: {
        tags: ['gear.attunement']
      }
    });
    item.update = async function(data) {
      updatePayload = data;
      if (data['system.tags']) {
        this.system.tags = [...data['system.tags']];
      }
      return this;
    };

    const app = new DCCTagManager({ item });

    const handlers = {};
    const inputVals = {
      '.dcc-custom-tag-id': 'overloaded',
      '.dcc-custom-tag-label': 'Overloaded Battery',
      '.dcc-custom-tag-namespace': 'tech'
    };

    const mockHtml = {
      find(selector) {
        return {
          click(fn) { handlers[selector + ':click'] = fn; return this; },
          on(evt, fn) { handlers[`${selector}:${evt}`] = fn; return this; },
          val() { return inputVals[selector] || ''; },
          is(filter) {
            if (selector === '.dcc-custom-tag-apply-item' && filter === ':checked') return true;
            return false;
          }
        };
      }
    };

    app.activateListeners(mockHtml);
    assert.ok(handlers['.dcc-register-custom-tag-btn:click']);

    await handlers['.dcc-register-custom-tag-btn:click']({
      preventDefault() {}
    });

    assert.ok(updatePayload, 'item.update must have been called when applyToItem is checked');
    assert.ok(item.system.tags.includes('tech.overloaded'));
    assert.deepStrictEqual(item.system.tags, ['gear.attunement', 'tech.overloaded']);
  });
});
