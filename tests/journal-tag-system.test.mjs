import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import './setup.mjs';
import {
  TAG_SYSTEM_JOURNAL_DATA,
  ensureTagSystemJournal,
  openTagSystemJournal
} from '../src/data/journal-tag-system.mjs';
import { DCCTagManager } from '../src/apps/tag-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('CarlRPG Tag System & Content Creation Journal Entry (next.md Requirement)', async (t) => {

  await t.test('1. TAG_SYSTEM_JOURNAL_DATA provides structured 7-page comprehensive content', () => {
    assert.ok(TAG_SYSTEM_JOURNAL_DATA, 'Journal data exists');
    assert.strictEqual(
      TAG_SYSTEM_JOURNAL_DATA.name,
      'CarlRPG — Tag System & Content Creation Guide',
      'Matches official guide name'
    );
    assert.ok(Array.isArray(TAG_SYSTEM_JOURNAL_DATA.pages), 'Pages is an array');
    assert.strictEqual(TAG_SYSTEM_JOURNAL_DATA.pages.length, 7, 'Has exactly 7 comprehensive chapters');

    for (const [index, page] of TAG_SYSTEM_JOURNAL_DATA.pages.entries()) {
      assert.ok(page.name, `Page ${index + 1} has a name`);
      assert.strictEqual(page.type, 'text', `Page ${index + 1} is text type`);
      assert.ok(page.text?.content, `Page ${index + 1} has content HTML`);
      assert.ok(page.text.content.length > 200, `Page ${index + 1} has substantive content`);
    }
  });

  await t.test('2. Page 1 documents Tag Taxonomy, namespaces, and syntax', () => {
    const page1 = TAG_SYSTEM_JOURNAL_DATA.pages[0];
    assert.match(page1.name, /1\.\s*Overview/i);
    const content = page1.text.content;
    assert.ok(content.includes('&lt;namespace&gt;.&lt;identifier&gt;') || content.includes('<namespace>.<identifier>'), 'Documents tag syntax');
    assert.ok(content.includes('Rule 0'), 'References Rule 0 data-driven architecture');

    const expectedNamespaces = [
      'kind', 'action', 'element', 'archetype', 'favored',
      'weapon', 'weaponClass', 'weaponProp', 'skillGroup',
      'technique', 'rule', 'id', 'custom'
    ];
    for (const ns of expectedNamespaces) {
      assert.ok(content.includes(ns), `Page 1 lists namespace: ${ns}`);
    }
  });

  await t.test('3. Page 2 documents Tag Manager and Item Sheet Tag Editor interfaces', () => {
    const page2 = TAG_SYSTEM_JOURNAL_DATA.pages[1];
    assert.match(page2.name, /2\.\s*Tag Manager/i);
    const content = page2.text.content;
    assert.ok(content.includes('DCCTagManager'), 'Mentions DCCTagManager');
    assert.ok(content.includes('carl.openTagManager()'), 'Documents carl.openTagManager() macro command');
    assert.ok(content.includes('Explicit Tags'), 'Explains Explicit Tags');
    assert.ok(content.includes('Derived Tags'), 'Explains Derived Tags');
    assert.ok(content.includes('Identity Tags'), 'Explains Identity Tags');
    assert.ok(content.includes('Apply'), 'Explains 1-click Apply checkbox');
  });

  await t.test('4. Page 3 documents custom weapon creation and additive damage resolution', () => {
    const page3 = TAG_SYSTEM_JOURNAL_DATA.pages[2];
    assert.match(page3.name, /3\.\s*Creating Custom Weapons/i);
    const content = page3.text.content;
    assert.ok(content.includes('Goblin Boom Stick'), 'Provides concrete Boom Stick walkthrough');
    assert.ok(content.includes('associatedSkills'), 'Explains associatedSkills field');
    assert.ok(content.includes('weapon.shotgun'), 'Includes weapon.shotgun tag');
    assert.ok(content.includes('rule.requires-weapon'), 'Explains rule.requires-weapon');
    assert.ok(content.includes('Strictly Additive Damage'), 'Explains additive damage calculation');
  });

  await t.test('5. Page 4 documents secondary skills (Aiming disadvantage & damage) and cooldowns', () => {
    const page4 = TAG_SYSTEM_JOURNAL_DATA.pages[3];
    assert.match(page4.name, /4\.\s*Secondary Skills/i);
    const content = page4.text.content;
    assert.ok(content.includes('Aiming'), 'Details Aiming skill mechanics');
    assert.ok(content.includes('2d20kl'), 'Explains disadvantage 2d20kl calculation with Aiming rank');
    assert.ok(content.includes('rule.requires-weapon'), 'Explains unequipped weapon attack roster filtering');
    assert.ok(content.includes('cooldown'), 'Explains special item grants and 2 hours per rank cooldown rule');
  });

  await t.test('6. Page 5 documents custom spells and favored archetype +1 MP penalties', () => {
    const page5 = TAG_SYSTEM_JOURNAL_DATA.pages[4];
    assert.match(page5.name, /5\.\s*Custom Spells/i);
    const content = page5.text.content;
    assert.ok(content.includes('favored.'), 'Explains favored.<archetype> tags');
    assert.ok(content.includes('+1 MP Penalty') || content.includes('+1 MP'), 'Explains +1 MP penalty for non-favored class');
    assert.ok(content.includes('Classless') || content.includes('classless'), 'Explains classless crawler exemption (Levels 1-2)');
    assert.ok(content.includes('Frostfire Lance'), 'Includes Frostfire Lance example');
  });

  await t.test('7. Page 6 documents custom classes and races with structured grants and TagQuery', () => {
    const page6 = TAG_SYSTEM_JOURNAL_DATA.pages[5];
    assert.match(page6.name, /6\.\s*Custom Classes/i);
    const content = page6.text.content;
    assert.ok(content.includes('system.grants'), 'Explains system.grants array');
    assert.ok(content.includes('stat'), 'Lists stat grant');
    assert.ok(content.includes('skill'), 'Lists skill grant');
    assert.ok(content.includes('spell'), 'Lists spell grant');
    assert.ok(content.includes('choice'), 'Lists choice grant');
    assert.ok(content.includes('query'), 'Documents Tag Query in choice grants');
  });

  await t.test('8. Page 7 documents CarlRPG rule-breaking principles and developer APIs', () => {
    const page7 = TAG_SYSTEM_JOURNAL_DATA.pages[6];
    assert.match(page7.name, /7\.\s*Rule Breaking/i);
    const content = page7.text.content;
    assert.ok(content.includes('All rules will be broken'), 'Quotes official DCC RPG rule-breaking philosophy');
    assert.ok(content.includes('carl.openTagManager()'), 'Lists carl.openTagManager() API');
    assert.ok(content.includes('carl.openTagGuide()'), 'Lists carl.openTagGuide() API');
    assert.ok(content.includes('game.dcc.tags.find'), 'Lists game.dcc.tags.find API');
  });

  await t.test('9. ensureTagSystemJournal creates or updates world JournalEntry in game.journal', async () => {
    // Reset mock game.journal
    game.journal = [];
    game.user = { isGM: true };

    const created = await ensureTagSystemJournal();
    assert.ok(created, 'ensureTagSystemJournal returns created JournalEntry');
    assert.strictEqual(created.name, 'CarlRPG — Tag System & Content Creation Guide');
    assert.strictEqual(game.journal.length, 1);
    assert.strictEqual(created.pages.length, 7);

    // Calling again returns existing without duplicating
    const secondCall = await ensureTagSystemJournal();
    assert.strictEqual(secondCall.id, created.id);
    assert.strictEqual(game.journal.length, 1);
  });

  await t.test('10. openTagSystemJournal renders the journal sheet', async () => {
    const sheet = await openTagSystemJournal();
    assert.ok(sheet, 'openTagSystemJournal returns rendered sheet');
    assert.strictEqual(sheet.rendered, true, 'Sheet rendered is true');
  });

  await t.test('11. Tag Manager template contains Tag Guide button hook', () => {
    const tmHbs = fs.readFileSync(path.resolve(__dirname, '../templates/apps/tag-manager.hbs'), 'utf8');
    assert.ok(tmHbs.includes('dcc-open-tag-guide-btn'), 'Tag Manager template contains .dcc-open-tag-guide-btn');
    assert.ok(tmHbs.includes('Tag Guide'), 'Button label is Tag Guide');
  });

  await t.test('12. system.json declares journals compendium pack', () => {
    const sysJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../system.json'), 'utf8'));
    const journalPack = sysJson.packs?.find(p => p.name === 'journals');
    assert.ok(journalPack, 'journals pack defined in system.json');
    assert.strictEqual(journalPack.type, 'JournalEntry');
    assert.strictEqual(journalPack.path, 'packs/journals');
    assert.strictEqual(journalPack.system, 'carl-rpg');
  });
});
