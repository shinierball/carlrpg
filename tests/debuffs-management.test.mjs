import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCC_DEBUFFS, DCC_BUFFS } from '../src/data/buffs.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG Debuff Visibility & Management Subsystem', () => {

  describe('1. Canonical Debuffs Dataset & Schema', () => {
    test('contains rich canonical debuff items with valid document schemas', () => {
      assert.ok(DCC_DEBUFFS.length >= 16, 'Expected at least 16 canonical debuffs');

      for (const debuff of DCC_DEBUFFS) {
        assert.ok(debuff._id, `Debuff ${debuff.name} must have an _id`);
        assert.equal(debuff.type, 'debuff', `Debuff ${debuff.name} must have type "debuff"`);
        assert.ok(debuff.name, 'Debuff must have a name');
        assert.ok(debuff.img, `Debuff ${debuff.name} must have an icon img`);
        assert.ok(debuff.system, `Debuff ${debuff.name} must have a system object`);
        assert.ok(['Minor', 'Major'].includes(debuff.system.severity), `Debuff ${debuff.name} severity must be Minor or Major`);
        assert.ok(Array.isArray(debuff.system.statModifiers), `Debuff ${debuff.name} statModifiers must be an array`);
        assert.ok(Array.isArray(debuff.system.damageModifiers), `Debuff ${debuff.name} damageModifiers must be an array`);
      }
    });

    test('CONFIG.DCC exposes canonical debuffs and buffs', () => {
      assert.ok(CONFIG.DCC.debuffs, 'CONFIG.DCC.debuffs must be registered');
      assert.ok(CONFIG.DCC.buffs, 'CONFIG.DCC.buffs must be registered');
      assert.equal(CONFIG.DCC.debuffs.length, DCC_DEBUFFS.length);
    });
  });

  describe('2. Crawler Sheet Debuff Categorization & Formatting', () => {
    test('getData categorizes embedded debuffs with severity classes and summaries', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            dex: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 }
          }
        },
        items: [
          new DCCItem({
            name: 'Shocked',
            type: 'debuff',
            system: {
              severity: 'Minor',
              damageType: 'Electric',
              statModifiers: [{ stat: 'dex', value: -2 }],
              duration: 'Combat'
            }
          }),
          new DCCItem({
            name: 'Held',
            type: 'debuff',
            system: {
              severity: 'Major',
              damageType: '',
              statModifiers: [{ stat: 'dex', value: -5 }],
              duration: 'Combat'
            }
          })
        ]
      });

      const sheet = new DCCCrawlerSheet(actor);
      const data = await sheet.getData();

      assert.ok(Array.isArray(data.debuffs), 'context.debuffs must be an array');
      assert.equal(data.debuffs.length, 2, 'Expected 2 embedded debuffs');

      const shocked = data.debuffs.find(d => d.name === 'Shocked');
      assert.ok(shocked, 'Shocked debuff must be present');
      assert.equal(shocked.severityClass, 'is-minor', 'Shocked must have is-minor severityClass');
      assert.ok(shocked.summary.includes('-2 DEX'), 'Shocked summary must mention -2 DEX');

      const held = data.debuffs.find(d => d.name === 'Held');
      assert.ok(held, 'Held debuff must be present');
      assert.equal(held.severityClass, 'is-major', 'Held must have is-major severityClass');
    });
  });

  describe('3. Dynamic Derived Stat Impact from Embedded Debuffs', () => {
    test('embedded debuff penalties reduce ability scores and heal upon deletion', async () => {
      const actor = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: {
            dex: { value: 14, unenhanced: 14 },
            con: { value: 12, unenhanced: 12 }
          }
        }
      });

      actor.prepareData();
      assert.equal(actor.system.abilities.dex.value, 14, 'Initial unenhanced DEX is 14');

      // Add Poisoned debuff (-2 Con, -2 Str)
      const poisonData = DCC_DEBUFFS.find(d => d.name === 'Poisoned');
      const debuffItem = new DCCItem({
        id: 'debuff-poison-1',
        name: poisonData.name,
        type: 'debuff',
        system: poisonData.system
      }, actor);

      actor.items.push(debuffItem);
      actor.prepareData();

      assert.equal(actor.system.abilities.con.value, 10, 'CON must be reduced by 2 from Poisoned debuff');

      // Delete the debuff
      const idx = actor.items.indexOf(debuffItem);
      actor.items.splice(idx, 1);
      actor.prepareData();

      assert.equal(actor.system.abilities.con.value, 12, 'CON must restore to 12 after debuff is removed');
    });
  });

  describe('4. Template Integration', () => {
    test('page1-core.hbs includes debuff chips and browse button', () => {
      const content = fs.readFileSync('templates/actors/parts/page1-core.hbs', 'utf-8');
      assert.ok(content.includes('dcc-debuff-chip'), 'page1-core.hbs must render dcc-debuff-chip');
      assert.ok(content.includes('open-debuff-picker'), 'page1-core.hbs must include open-debuff-picker action');
      assert.ok(content.includes('system.attributes.debuffs'), 'page1-core.hbs must preserve freeform textarea');
    });

    test('page4-inventory.hbs includes debuffs & conditions table', () => {
      const content = fs.readFileSync('templates/actors/parts/page4-inventory.hbs', 'utf-8');
      assert.ok(content.includes('CHARACTER DEBUFFS & CONDITIONS'), 'page4-inventory.hbs must include Debuffs table header');
      assert.ok(content.includes('open-debuff-picker'), 'page4-inventory.hbs must include open-debuff-picker');
      assert.ok(content.includes('data-type="debuff"'), 'page4-inventory.hbs must allow creating debuff items');
    });
  });
});
