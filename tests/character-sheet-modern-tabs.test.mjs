import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

test('DCC RPG Character Sheet 5-Tab Modern Layout (Option A)', async (t) => {
  await t.test('1. crawler-sheet.hbs defines the 5 modern tabs and preloads required templates', () => {
    const crawlerSheet = fs.readFileSync('templates/actors/crawler-sheet.hbs', 'utf8');

    // 5 primary navigation tabs
    assert.ok(crawlerSheet.includes('data-tab="page1"'), 'Tab 1: Core & Combat must exist');
    assert.ok(crawlerSheet.includes('data-tab="page4"'), 'Tab 2: Equipment & Inventory must exist');
    assert.ok(crawlerSheet.includes('data-tab="page3"'), 'Tab 3: Skills & Spells must exist');
    assert.ok(crawlerSheet.includes('data-tab="conditions"'), 'Tab 4: Conditions & Effects must exist');
    assert.ok(crawlerSheet.includes('data-tab="story"'), 'Tab 5: Story & Sponsors must exist');

    // Verification that partials are embedded
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/page1-core.hbs'), 'Must include page1-core.hbs');
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/page4-inventory.hbs'), 'Must include page4-inventory.hbs');
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/page3-skills.hbs'), 'Must include page3-skills.hbs');
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/spells.hbs'), 'Must include spells.hbs');
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/conditions.hbs'), 'Must include conditions.hbs');
    assert.ok(crawlerSheet.includes('systems/carl-rpg/templates/actors/parts/story-extras.hbs'), 'Must include story-extras.hbs');

    // Preloads in dcc.mjs
    const dccMjs = fs.readFileSync('src/dcc.mjs', 'utf8');
    assert.ok(dccMjs.includes("'systems/carl-rpg/templates/actors/parts/conditions.hbs'"), 'dcc.mjs must preload conditions.hbs');
    assert.ok(dccMjs.includes("'systems/carl-rpg/templates/actors/parts/story-extras.hbs'"), 'dcc.mjs must preload story-extras.hbs');
  });

  await t.test('2. Tab 2 (page4-inventory.hbs) merges gear slots with inventory and completely removes buffs & debuffs', () => {
    const invContent = fs.readFileSync('templates/actors/parts/page4-inventory.hbs', 'utf8');

    // Gear slots must be present
    assert.ok(invContent.includes('EQUIPPED GEAR SLOTS'), 'Must include Equipped Gear Slots banner');
    assert.ok(invContent.includes('system.gearSlots.head'), 'Must include head gear slot input');
    assert.ok(invContent.includes('system.gearSlots.torso'), 'Must include torso gear slot input');
    assert.ok(invContent.includes('system.gearSlots.arms'), 'Must include arms gear slot input');
    assert.ok(invContent.includes('system.gearSlots.hands'), 'Must include hands gear slot input');
    assert.ok(invContent.includes('system.gearSlots.legs'), 'Must include legs gear slot input');
    assert.ok(invContent.includes('system.gearSlots.feet'), 'Must include feet gear slot input');
    assert.ok(invContent.includes('system.gearSlots.accessories'), 'Must include accessories gear slot input');

    // Inventory items table must be present
    assert.ok(invContent.includes('INVENTORY &amp; BACKPACK') || invContent.includes('INVENTORY & BACKPACK'), 'Must include Inventory & Backpack banner');
    assert.ok(invContent.includes('data-type="gear"'), 'Must include Add Gear button');
    assert.ok(invContent.includes('data-type="loot"'), 'Must include Add Item button');
    assert.ok(invContent.includes('gear-toggle-equipped'), 'Must include gear equip toggle button');

    // Buffs and Debuffs must NOT be present in inventory tab
    assert.equal(invContent.includes('CHARACTER BUFFS'), false, 'Inventory tab must not contain Buffs table');
    assert.equal(invContent.includes('CHARACTER DEBUFFS'), false, 'Inventory tab must not contain Debuffs table');
  });

  await t.test('3. Tab 4 (conditions.hbs) houses Buffs, Debuffs, Browse tools, and Quick-Assign buttons', () => {
    const condContent = fs.readFileSync('templates/actors/parts/conditions.hbs', 'utf8');

    // Headers and Browse tools
    assert.ok(condContent.includes('CHARACTER BUFFS'), 'Must include Character Buffs section');
    assert.ok(condContent.includes('CHARACTER DEBUFFS'), 'Must include Character Debuffs section');
    assert.ok(condContent.includes('open-buff-picker'), 'Must include browse buffs compendium button');
    assert.ok(condContent.includes('open-debuff-picker'), 'Must include browse debuffs compendium button');

    // Slot assign buttons
    assert.ok(condContent.includes('buff-assign-slot-btn'), 'Must include buff-assign-slot-btn');
    assert.ok(condContent.includes('data-slot="buff1"'), 'Must include assignment to buff1');
    assert.ok(condContent.includes('data-slot="buff2"'), 'Must include assignment to buff2');
    assert.ok(condContent.includes('data-slot="buff3"'), 'Must include assignment to buff3');
  });

  await t.test('4. Quick-Assign buff buttons update actor externalBuffs slots', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          externalBuffs: { buff1: '', buff2: '', buff3: '' }
        }
      }
    });

    const buffItem = new DCCItem({
      id: 'buff-str-boost',
      name: 'Strength Elixir',
      type: 'buff',
      system: {
        buffType: 'stat',
        stat: 'str',
        value: 5
      }
    }, crawler);
    crawler.items.push(buffItem);

    const sheet = new DCCCrawlerSheet(crawler);

    const clickHandlers = {};
    const mockHtml = {
      find: (sel) => ({
        click: (fn) => { clickHandlers[sel] = fn; },
        change: () => {},
        contextmenu: () => {},
        on: () => {}
      })
    };

    sheet.activateListeners(mockHtml);

    assert.ok(clickHandlers['.buff-assign-slot-btn'], 'Sheet must register .buff-assign-slot-btn click listener');

    // Spy on actor.update
    let updatedPayload = null;
    crawler.update = async (payload) => {
      updatedPayload = payload;
      return crawler;
    };

    // Set up jQuery mock data lookup
    globalThis.$ = (el) => ({
      data: (key) => {
        if (key === 'itemId') return 'buff-str-boost';
        if (key === 'slot') return 'buff2';
        return null;
      },
      closest: () => ({ data: () => null })
    });

    await clickHandlers['.buff-assign-slot-btn']({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: {}
    });

    assert.ok(updatedPayload, 'Actor update should have been triggered');
    assert.equal(updatedPayload['system.attributes.externalBuffs.buff2'], 'buff-str-boost');
  });

  await t.test('5. Tab 5 (story-extras.hbs) consolidates narrative, companions, and sponsors', () => {
    const storyContent = fs.readFileSync('templates/actors/parts/story-extras.hbs', 'utf8');

    // Narrative & Psychology
    assert.ok(storyContent.includes('system.details.popularity'), 'Must include popularity');
    assert.ok(storyContent.includes('system.details.pastTrauma'), 'Must include past trauma');
    assert.ok(storyContent.includes('system.details.looseEnds'), 'Must include loose ends');
    assert.ok(storyContent.includes('system.details.regrets'), 'Must include regrets');
    assert.ok(storyContent.includes('system.details.notes'), 'Must include notes');
    assert.ok(storyContent.includes('dcc-roll-story-table-btn'), 'Must include story roll buttons');

    // Companions & Spaces
    assert.ok(storyContent.includes('system.details.petSpecial'), 'Must include pet details');
    assert.ok(storyContent.includes('system.details.mountSize'), 'Must include mount details');
    assert.ok(storyContent.includes('system.details.personalSpaceSize'), 'Must include personal space details');
    assert.ok(storyContent.includes('system.details.deityBoons'), 'Must include deity details');

    // Features & Sponsors
    assert.ok(storyContent.includes('data-type="race"'), 'Must include race management');
    assert.ok(storyContent.includes('data-type="class"'), 'Must include class management');
    assert.ok(storyContent.includes('data-type="sponsor"'), 'Must include sponsor management');
    assert.ok(storyContent.includes('system.details.sponsor1'), 'Must include sponsor 1');
    assert.ok(storyContent.includes('system.details.sponsor2'), 'Must include sponsor 2');
    assert.ok(storyContent.includes('system.details.sponsor3'), 'Must include sponsor 3');
  });
});
