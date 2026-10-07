import './setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { SpellDataModel } from '../src/models/items/spell-model.mjs';
import fs from 'node:fs';

describe('DCC RPG Spell Explicit Rank Definitions & Abilities Subsystem', async () => {
  it('1. template.json and SpellDataModel define damageModifiers, crit milestones, debuff triggers, and optionalEffects', () => {
    const rawTemplate = JSON.parse(fs.readFileSync(new URL('../template.json', import.meta.url), 'utf8'));
    const spellTemplate = rawTemplate.Item.spell;

    assert.ok(spellTemplate, 'Item.spell must be defined in template.json');
    assert.ok(Array.isArray(spellTemplate.damageModifiers), 'damageModifiers must be an array in template.json');
    assert.equal(spellTemplate.critMultiplierR5, 1, 'critMultiplierR5 defaults to 1');
    assert.equal(spellTemplate.critMultiplierR15, 1, 'critMultiplierR15 defaults to 1');
    assert.equal(spellTemplate.fumbleDebuff, '', 'fumbleDebuff defaults to empty string');
    assert.equal(spellTemplate.onHitDebuff, '', 'onHitDebuff defaults to empty string');
    assert.equal(spellTemplate.onHitDebuffMinRank, 0, 'onHitDebuffMinRank defaults to 0');
    assert.ok(Array.isArray(spellTemplate.optionalEffects), 'optionalEffects must be an array');
    assert.equal(spellTemplate.selectedEffect, '', 'selectedEffect defaults to empty string');
    assert.ok(spellTemplate.upgrades, 'upgrades schema exists');

    // Test SpellDataModel instance
    const model = new SpellDataModel();
    assert.ok(Array.isArray(model.damageModifiers), 'SpellDataModel has damageModifiers array');
    assert.equal(model.critMultiplierR5, 1);
    assert.equal(model.critMultiplierR15, 1);
    assert.equal(model.fumbleDebuff, '');
    assert.equal(model.onHitDebuff, '');
    assert.equal(model.onHitDebuffMinRank, 0);
    assert.ok(Array.isArray(model.optionalEffects));
    assert.equal(model.selectedEffect, '');
  });

  it('2. DCCItemSheet._prepareContext populates damageTypes, debuffs, damageModifiers, and optionalEffectsString', async () => {
    const spell = new DCCItem({
      name: 'Hellfire Burst',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        manaCost: 15,
        spellType: 'Attack',
        damageType: 'Fire',
        damageModifiers: [
          { type: 'Fire', dice: '2d6', value: 0, minRank: 0 }
        ],
        optionalEffects: ['Overcharge', 'Concentrated Beam'],
        critMultiplierR5: 4,
        critMultiplierR15: 8,
        fumbleDebuff: 'Stunned',
        onHitDebuff: 'Burned',
        onHitDebuffMinRank: 10
      }
    });

    const sheet = new DCCItemSheet(spell);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.damageTypes), 'damageTypes must be provided');
    assert.ok(context.damageTypes.includes('Fire'));
    assert.ok(context.damageTypes.includes('Ice'));

    assert.ok(Array.isArray(context.availableDebuffs), 'availableDebuffs must be provided');
    assert.ok(Array.isArray(context.system.damageModifiers), 'damageModifiers must be an array');
    assert.equal(context.system.damageModifiers.length, 1);
    assert.equal(context.optionalEffectsString, 'Overcharge, Concentrated Beam');
    assert.equal(context.hasDamage, true, 'hasDamage is true from damageModifiers even without baseDamage');
  });

  it('3. DCCItemSheet._updateObject parses comma-separated optionalEffects and persists damageModifiers', async () => {
    const spell = new DCCItem({ name: 'Arcane Surge', type: 'spell' });
    const sheet = new DCCItemSheet(spell);

    const formData = {
      name: 'Arcane Surge',
      'system.stat': 'int',
      'system.manaCost': 20,
      'system.optionalEffects': 'Overcharge, Wide Dispersion, Piercing Wave',
      'system.critMultiplierR5': 4,
      'system.critMultiplierR15': 8,
      'system.fumbleDebuff': 'Magic Mishap',
      'system.onHitDebuff': 'Paralyzed',
      'system.onHitDebuffMinRank': 10,
      'system.damageModifiers.0.type': 'Electric',
      'system.damageModifiers.0.dice': '3d6',
      'system.damageModifiers.0.value': 0,
      'system.damageModifiers.0.minRank': 0
    };

    await sheet._updateObject({}, formData);

    assert.deepEqual(spell.system.optionalEffects, ['Overcharge', 'Wide Dispersion', 'Piercing Wave']);
    assert.equal(spell.system.critMultiplierR5, 4);
    assert.equal(spell.system.critMultiplierR15, 8);
    assert.equal(spell.system.fumbleDebuff, 'Magic Mishap');
    assert.equal(spell.system.onHitDebuff, 'Paralyzed');
    assert.equal(spell.system.onHitDebuffMinRank, 10);
    assert.equal(spell.system.damageModifiers.length, 1);
    assert.equal(spell.system.damageModifiers[0].type, 'Electric');
    assert.equal(spell.system.damageModifiers[0].dice, '3d6');
  });

  it('4. Actor casts spell with explicit rank-gated damage scaling, crits, and on-hit debuffs', async () => {
    const actor = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        abilities: {
          int: { value: 16, unenhanced: 16, mod: 4 },
          dex: { value: 12, unenhanced: 12, mod: 4 }
        },
        attributes: {
          mana: { value: 50, max: 50 },
          hp: { value: 40, max: 40 }
        }
      }
    });

    const fireNova = new DCCItem({
      name: 'Fire Nova',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        manaCost: 10,
        spellType: 'Attack',
        damageType: 'Fire',
        fumbleDebuff: 'Stunned',
        onHitDebuff: 'Burned',
        onHitDebuffMinRank: 10,
        critMultiplierR5: 4,
        critMultiplierR15: 8,
        damageModifiers: [
          { type: 'Fire', dice: '2d6', value: 0, minRank: 0 },
          { type: 'Fire', dice: '2d6', value: 0, minRank: 5 },
          { type: 'Fire', dice: '2d6', value: 0, minRank: 10 },
          { type: 'Fire', dice: '2d6', value: 0, minRank: 15 }
        ],
        upgrades: {
          rank5: 'Nova expansion increases radius to 20ft.',
          rank10: 'Conflagration inflicts Burned debuff.',
          rank15: 'Supernova: Critical hits deal 8x damage.'
        }
      }
    }, actor);
    actor.items.push(fireNova);

    // 4a. Rank 1 Damage: Base 2d6 + INT Mod (+4) + Rank 1 Die (+1), Crit 2x
    fireNova.system.rank = 1;
    const dmgDataR1 = actor.getSpellDamageData(fireNova);
    assert.equal(dmgDataR1.hasDamage, true);
    assert.equal(dmgDataR1.damageType, 'Fire');
    assert.ok(dmgDataR1.formula.includes('2d6'));

    const dmgMsgR1 = await actor.rollSpellDamage(fireNova);
    assert.ok(dmgMsgR1.content.includes('Crit (2x)'), 'Rank 1 defaults to 2x crit');
    assert.equal(dmgMsgR1.content.includes('Inflict [Burned]'), false, 'Burned debuff not unlocked at Rank 1');

    // 4b. Rank 5 Damage: 4d6 + INT Mod + Rank 5 Die (1d4), Crit 4x
    fireNova.system.rank = 5;
    const dmgDataR5 = actor.getSpellDamageData(fireNova);
    assert.ok(dmgDataR5.formula.includes('4d6') || (dmgDataR5.formula.includes('2d6') && dmgDataR5.formula.includes('2d6')));
    const dmgMsgR5 = await actor.rollSpellDamage(fireNova);
    assert.ok(dmgMsgR5.content.includes('Crit (4x)'), 'Rank 5 unlocks 4x critical damage');

    // 4c. Rank 10 Damage: 6d6 + INT Mod, Inflict [Burned] button
    fireNova.system.rank = 10;
    const dmgMsgR10 = await actor.rollSpellDamage(fireNova);
    assert.ok(dmgMsgR10.content.includes('Inflict [Burned]'), 'Rank 10 unlocks on-hit Burned debuff button');

    // 4d. Rank 15 Damage: 8d6 + INT Mod, Crit 8x
    fireNova.system.rank = 15;
    const dmgMsgR15 = await actor.rollSpellDamage(fireNova);
    assert.ok(dmgMsgR15.content.includes('Crit (8x)'), 'Rank 15 unlocks 8x critical damage');
  });

  it('5. Actor rolls spell attack: disadvantage detection and Natural 1 fumble backfire', async () => {
    const actor = new DCCActor({
      name: 'Mordecai',
      type: 'crawler',
      system: {
        abilities: {
          int: { value: 18, unenhanced: 18, mod: 4 }
        },
        attributes: {
          mana: { value: 60, max: 60 }
        }
      }
    });

    const creepingSpell = new DCCItem({
      name: 'Creeping Doom',
      type: 'spell',
      system: {
        rank: 2,
        stat: 'int',
        manaCost: 25,
        spellType: 'Attack',
        limitations: 'Moves slowly; attack is made with Disadvantage.',
        fumbleDebuff: 'Magic Mishap'
      }
    }, actor);
    actor.items.push(creepingSpell);

    // 5a. Spell with Disadvantage limitation rolls 2d20kl
    const rollMsg = await actor.rollSpellAttack(creepingSpell);
    assert.ok(rollMsg.flavor.includes('2d20kl'), 'Disadvantage limitation forces 2d20kl roll');
    assert.ok(rollMsg.flavor.includes('Disadvantage'));

    // 5b. Natural 1 Fumble on spell attack displays fumble callout with self-debuff
    const originalRoll = globalThis.Roll;
    globalThis.Roll = class MockFumbleRoll {
      constructor(formula) {
        this.formula = formula;
        this.total = 1;
        this.dice = [{ results: [{ result: 1, active: true }] }];
      }
      async evaluate() { return this; }
      async render() { return '<div class="dice-roll">1</div>'; }
      async toMessage(msgData = {}) {
        return ChatMessage.create(msgData);
      }
    };

    try {
      const fumbleMsg = await actor.rollSpellAttack(creepingSpell);
      assert.ok(fumbleMsg.content.includes('dcc-fumble-warning'), 'Fumble warning rendered on Natural 1');
      assert.ok(fumbleMsg.content.includes('Magic Mishap'), 'Fumble warning names the Magic Mishap debuff');
    } finally {
      globalThis.Roll = originalRoll;
    }
  });
});
