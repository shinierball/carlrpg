import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('CarlRPG 3.0.0 Tagging — Favored Spell Mechanics & Mana Economy', () => {

  test('Favored caster casts spell at base MP cost without penalty', async () => {
    const mageActor = new DCCActor({
      name: 'Katya the Arcanist',
      type: 'crawler',
      system: {
        details: { class: 'Mage' },
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        manaCost: 5,
        identifier: 'fireball',
        tags: ['kind.spell', 'element.fire', 'favored.mage']
      }
    }, mageActor);

    const chatMsg = await mageActor.rollSpell(fireball);
    assert.ok(chatMsg);
    assert.equal(chatMsg.flags?.['carl-rpg']?.isFavored, true, 'Spell must be recognized as Favored');
    assert.equal(chatMsg.flags?.['carl-rpg']?.favoredPenalty, 0, 'Favored penalty must be 0');
    assert.equal(chatMsg.flags?.['carl-rpg']?.manaCost, 5, 'Mana cost must be base 5 MP');
    assert.equal(mageActor.system.attributes.mana.value, 15, 'Actor mana must decrease from 20 to 15');
  });

  test('Non-favored class caster incurs +1 MP penalty', async () => {
    const clericActor = new DCCActor({
      name: 'Father Paul',
      type: 'crawler',
      system: {
        details: { class: 'Cleric' },
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        manaCost: 5,
        identifier: 'fireball',
        tags: ['kind.spell', 'element.fire', 'favored.mage']
      }
    }, clericActor);

    const chatMsg = await clericActor.rollSpell(fireball);
    assert.ok(chatMsg);
    assert.equal(chatMsg.flags?.['carl-rpg']?.isFavored, false, 'Spell must be recognized as non-favored');
    assert.equal(chatMsg.flags?.['carl-rpg']?.favoredPenalty, 1, 'Non-favored penalty must be +1 MP');
    assert.equal(chatMsg.flags?.['carl-rpg']?.baseManaCost, 5, 'Base mana cost must remain 5 MP');
    assert.equal(chatMsg.flags?.['carl-rpg']?.manaCost, 6, 'Effective mana cost must be 6 MP');
    assert.equal(clericActor.system.attributes.mana.value, 14, 'Actor mana must decrease from 20 to 14 (20 - 6 = 14)');
    assert.ok(chatMsg.content.includes('+1 non-favored'), 'Chat card should display non-favored penalty notice');
  });

  test('Unclassed crawlers and pets do not incur class penalty', async () => {
    const unclassedCrawler = new DCCActor({
      name: 'Novice Crawler',
      type: 'crawler',
      system: {
        details: { class: '' },
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        manaCost: 5,
        identifier: 'fireball',
        tags: ['kind.spell', 'element.fire', 'favored.mage']
      }
    }, unclassedCrawler);

    const chatMsg = await unclassedCrawler.rollSpell(fireball);
    assert.equal(chatMsg.flags?.['carl-rpg']?.favoredPenalty, 0, 'No class penalty for unclassed caster');
    assert.equal(chatMsg.flags?.['carl-rpg']?.manaCost, 5, 'Mana cost remains base 5 MP');
  });

  test('Spell with multiple favored tags satisfies any matching archetype', async () => {
    const paladinActor = new DCCActor({
      name: 'Sir Carl',
      type: 'crawler',
      system: {
        details: { class: 'Paladin' },
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    const layOnHands = new DCCItem({
      name: 'Holy Light',
      type: 'spell',
      system: {
        manaCost: 4,
        identifier: 'holy-light',
        tags: ['kind.spell', 'element.holy', 'favored.cleric', 'favored.paladin']
      }
    }, paladinActor);

    const chatMsg = await paladinActor.rollSpell(layOnHands);
    assert.equal(chatMsg.flags?.['carl-rpg']?.isFavored, true, 'Matches favored.paladin');
    assert.equal(chatMsg.flags?.['carl-rpg']?.favoredPenalty, 0);
    assert.equal(chatMsg.flags?.['carl-rpg']?.manaCost, 4);
  });

  test('Non-favored penalty triggers insufficient mana failure when actor has exactly base MP', async () => {
    const fighterWithMagic = new DCCActor({
      name: 'Eldritch Knight',
      type: 'crawler',
      system: {
        details: { class: 'Fighter' },
        attributes: { mana: { value: 5, max: 20 } } // Has 5 MP, needs 5 + 1 = 6 MP
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        manaCost: 5,
        tags: ['kind.spell', 'favored.mage']
      }
    }, fighterWithMagic);

    const failMsg = await fighterWithMagic.rollSpell(fireball);
    assert.equal(failMsg.flags?.['carl-rpg']?.spellFailed, true, 'Cast must fail due to insufficient MP');
    assert.equal(failMsg.flags?.['carl-rpg']?.manaCost, 6, 'Required 6 MP (5 base + 1 non-favored)');
    assert.equal(fighterWithMagic.system.attributes.mana.value, 5, 'Mana must NOT be deducted on failed cast');
  });

  test('Free casts (consumables, scrolls, item effects) bypass favored penalty and mana deduction', async () => {
    const barbarian = new DCCActor({
      name: 'Conan',
      type: 'crawler',
      system: {
        details: { class: 'Barbarian' },
        attributes: { mana: { value: 0, max: 0 } }
      }
    });

    const scrollSpell = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        manaCost: 5,
        tags: ['kind.spell', 'favored.mage']
      }
    }, barbarian);

    const chatMsg = await barbarian.rollSpell(scrollSpell, { freeCast: true, isConsumable: true });
    assert.equal(chatMsg.flags?.['carl-rpg']?.manaCost, 0, 'Free cast has 0 MP cost');
    assert.equal(chatMsg.flags?.['carl-rpg']?.spellSuccess, true, 'Cast succeeds even with 0 MP');
  });
});
