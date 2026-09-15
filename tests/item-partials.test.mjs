import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';

describe('DCC RPG Item Sheet Decomposition & Modular Partials', () => {

  test('all required item partial templates exist on disk', () => {
    const requiredPartials = [
      'templates/items/parts/header.hbs',
      'templates/items/parts/attack.hbs',
      'templates/items/parts/spell.hbs',
      'templates/items/parts/gear.hbs',
      'templates/items/parts/buff.hbs',
      'templates/items/parts/debuff.hbs',
      'templates/items/parts/skill.hbs',
      'templates/items/parts/loot.hbs',
      'templates/items/parts/traits.hbs'
    ];

    for (const partial of requiredPartials) {
      assert.ok(fs.existsSync(partial), `Required partial ${partial} must exist on disk`);
      const stat = fs.statSync(partial);
      assert.ok(stat.size > 50, `Partial ${partial} must not be empty`);
    }
  });

  test('templates/items/item-sheet.hbs delegates to modular partials', () => {
    const master = fs.readFileSync('templates/items/item-sheet.hbs', 'utf-8');
    assert.ok(master.includes('templates/items/parts/header.hbs'), 'Master item sheet must include header partial');
    assert.ok(master.includes('templates/items/parts/attack.hbs'), 'Master item sheet must include attack partial');
    assert.ok(master.includes('templates/items/parts/spell.hbs'), 'Master item sheet must include spell partial');
    assert.ok(master.includes('templates/items/parts/gear.hbs'), 'Master item sheet must include gear partial');
    assert.ok(master.includes('templates/items/parts/buff.hbs'), 'Master item sheet must include buff partial');
    assert.ok(master.includes('templates/items/parts/debuff.hbs'), 'Master item sheet must include debuff partial');
    assert.ok(master.includes('templates/items/parts/skill.hbs'), 'Master item sheet must include skill partial');
    assert.ok(master.includes('templates/items/parts/loot.hbs'), 'Master item sheet must include loot partial');
    assert.ok(master.includes('templates/items/parts/traits.hbs'), 'Master item sheet must include traits partial');
  });

  test('src/dcc.mjs preloads all item partials and manager templates', () => {
    const dccSource = fs.readFileSync('src/dcc.mjs', 'utf-8');
    const expectedTemplates = [
      'systems/carl-rpg/templates/items/parts/header.hbs',
      'systems/carl-rpg/templates/items/parts/attack.hbs',
      'systems/carl-rpg/templates/items/parts/spell.hbs',
      'systems/carl-rpg/templates/items/parts/gear.hbs',
      'systems/carl-rpg/templates/items/parts/buff.hbs',
      'systems/carl-rpg/templates/items/parts/debuff.hbs',
      'systems/carl-rpg/templates/items/parts/skill.hbs',
      'systems/carl-rpg/templates/items/parts/loot.hbs',
      'systems/carl-rpg/templates/items/parts/traits.hbs',
      'systems/carl-rpg/templates/apps/spell-manager.hbs',
      'systems/carl-rpg/templates/apps/buff-manager.hbs'
    ];

    for (const t of expectedTemplates) {
      assert.ok(dccSource.includes(t), `src/dcc.mjs loadTemplates must include ${t}`);
    }
  });

  test('DCCItemSheet getData provides expected context for multiple item types', async () => {
    const skillItem = new DCCItem({
      name: 'Brawling',
      type: 'skill',
      system: { rank: 2, stat: 'str', damageModifiers: [] }
    });
    const skillSheet = new DCCItemSheet(skillItem);
    const skillData = await skillSheet.getData();
    assert.equal(skillData.item.name, 'Brawling');
    assert.ok(Array.isArray(skillData.system.damageModifiers));

    const spellItem = new DCCItem({
      name: 'Magic Missile',
      type: 'spell',
      system: { manaCost: 2, baseDamage: '2d4 Force' }
    });
    const spellSheet = new DCCItemSheet(spellItem);
    const spellData = await spellSheet.getData();
    assert.equal(spellData.item.name, 'Magic Missile');
    assert.equal(spellData.hasDamage, true);

    const debuffItem = new DCCItem({
      name: 'Poisoned',
      type: 'debuff',
      system: { severity: 'Minor', statModifiers: [{ stat: 'con', value: -2 }] }
    });
    const debuffSheet = new DCCItemSheet(debuffItem);
    const debuffData = await debuffSheet.getData();
    assert.equal(debuffData.item.name, 'Poisoned');
    assert.ok(Array.isArray(debuffData.system.statModifiers));
  });
});
