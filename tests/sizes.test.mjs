import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCC_SIZES, getSizeInfo } from '../src/data/sizes.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';

test('DCC RPG - Official Creature Size Categories', async (t) => {
  await t.test('DCC_SIZES contains all 8 required sizes in correct sequence', () => {
    assert.equal(DCC_SIZES.length, 8);

    const expected = [
      { size: 1, name: 'Tiny', label: '1 Tiny' },
      { size: 2, name: 'Small', label: '2 Small' },
      { size: 3, name: 'Petite', label: '3 Petite' },
      { size: 4, name: 'Medium', label: '4 Medium' },
      { size: 5, name: 'Large', label: '5 Large' },
      { size: 6, name: 'Huge', label: '6 Huge' },
      { size: 7, name: 'Colossal', label: '7 Colossal' },
      { size: 8, name: 'Gargantuan', label: '8 Gargantuan' }
    ];

    for (let i = 0; i < expected.length; i++) {
      assert.equal(DCC_SIZES[i].size, expected[i].size);
      assert.equal(DCC_SIZES[i].name, expected[i].name);
      assert.equal(DCC_SIZES[i].label, expected[i].label);
    }
  });

  await t.test('getSizeInfo resolves correctly by number, name, and label', () => {
    // Exact number
    assert.deepEqual(getSizeInfo(1), { size: 1, name: 'Tiny', label: '1 Tiny' });
    assert.deepEqual(getSizeInfo(2), { size: 2, name: 'Small', label: '2 Small' });
    assert.deepEqual(getSizeInfo(3), { size: 3, name: 'Petite', label: '3 Petite' });
    assert.deepEqual(getSizeInfo(4), { size: 4, name: 'Medium', label: '4 Medium' });
    assert.deepEqual(getSizeInfo(5), { size: 5, name: 'Large', label: '5 Large' });
    assert.deepEqual(getSizeInfo(6), { size: 6, name: 'Huge', label: '6 Huge' });
    assert.deepEqual(getSizeInfo(7), { size: 7, name: 'Colossal', label: '7 Colossal' });
    assert.deepEqual(getSizeInfo(8), { size: 8, name: 'Gargantuan', label: '8 Gargantuan' });

    // Numeric strings
    assert.equal(getSizeInfo('1').name, 'Tiny');
    assert.equal(getSizeInfo('3').name, 'Petite');
    assert.equal(getSizeInfo('8').name, 'Gargantuan');

    // Case-insensitive name strings
    assert.equal(getSizeInfo('tiny').size, 1);
    assert.equal(getSizeInfo('Small').size, 2);
    assert.equal(getSizeInfo('PETITE').size, 3);
    assert.equal(getSizeInfo('medium').size, 4);
    assert.equal(getSizeInfo('LARGE').size, 5);
    assert.equal(getSizeInfo('huge').size, 6);
    assert.equal(getSizeInfo('Colossal').size, 7);
    assert.equal(getSizeInfo('gargantuan').size, 8);

    // Full label strings
    assert.equal(getSizeInfo('3 Petite').size, 3);
    assert.equal(getSizeInfo('8 Gargantuan').size, 8);

    // Fallbacks for empty or invalid
    assert.deepEqual(getSizeInfo(null), { size: 4, name: 'Medium', label: '4 Medium' });
    assert.deepEqual(getSizeInfo(undefined), { size: 4, name: 'Medium', label: '4 Medium' });
    assert.deepEqual(getSizeInfo(''), { size: 4, name: 'Medium', label: '4 Medium' });
    assert.deepEqual(getSizeInfo('UnknownSize'), { size: 4, name: 'Medium', label: '4 Medium' });
  });

  await t.test('Actor derives sizeInfo, sizeNumber, and sizeLabel during prepareDerivedData', () => {
    const actor1 = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          size: 'Petite'
        }
      }
    });
    actor1.prepareDerivedData();

    assert.ok(actor1.system.attributes.sizeInfo);
    assert.equal(actor1.system.attributes.sizeNumber, 3);
    assert.equal(actor1.system.attributes.sizeLabel, '3 Petite');

    // Change to Huge
    const actor2 = new DCCActor({
      name: 'Mongo',
      type: 'crawler',
      system: {
        attributes: {
          size: 'Huge'
        }
      }
    });
    actor2.prepareDerivedData();
    assert.equal(actor2.system.attributes.sizeNumber, 6);
    assert.equal(actor2.system.attributes.sizeLabel, '6 Huge');
  });

  await t.test('Crawler sheet getData prepares sizeOptions with proper selected state', async () => {
    const actor = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        attributes: {
          size: 'Petite'
        }
      }
    });
    actor.prepareDerivedData();

    const sheet = new DCCCrawlerSheet(actor);
    const data = await sheet.getData();

    assert.ok(Array.isArray(data.sizeOptions));
    assert.equal(data.sizeOptions.length, 8);

    const petiteOption = data.sizeOptions.find(o => o.name === 'Petite');
    assert.ok(petiteOption);
    assert.equal(petiteOption.size, 3);
    assert.equal(petiteOption.label, '3 Petite');
    assert.equal(petiteOption.selected, true);

    const mediumOption = data.sizeOptions.find(o => o.name === 'Medium');
    assert.ok(mediumOption);
    assert.equal(mediumOption.selected, false);
  });

  await t.test('Crawler creator exposes size selection and persists size to created actor', async () => {
    const creator = new DCCCrawlerCreatorApp({
      name: 'Hollis',
      size: 'Large'
    });

    const data = await creator.getData();
    assert.equal(data.size, 'Large');
    assert.ok(Array.isArray(data.sizeOptions));
    const largeOption = data.sizeOptions.find(o => o.name === 'Large');
    assert.ok(largeOption);
    assert.equal(largeOption.selected, true);

    const actor = await creator.createCrawler();
    assert.ok(actor);
    assert.equal(actor.system.attributes.size, 'Large');
  });
});
