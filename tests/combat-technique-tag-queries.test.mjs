import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('CarlRPG 3.0.0 Tagging — Combat Technique Tag Query Engine', () => {

  describe('1. Technique Applicability via Strict Tag Queries', () => {
    test('Technique with { any: ["id.skill.pugilism"] } applies to Pugilism and associated weapons', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const ironPunch = new DCCItem({
        name: 'Iron Punch',
        type: 'skill',
        system: {
          isTechnique: true,
          appliesTo: { any: ['id.skill.pugilism'] }
        }
      }, actor);

      const pugilism = new DCCItem({
        name: 'Pugilism',
        type: 'skill',
        system: {
          identifier: 'pugilism',
          tags: ['action.attack', 'kind.skill', 'weaponClass.unarmed']
        }
      }, actor);

      const brassKnuckles = new DCCItem({
        name: 'Brass Knuckles',
        type: 'gear',
        system: {
          equipped: true,
          weaponCategory: 'Hand to Hand',
          associatedSkills: ['Pugilism']
        }
      }, actor);

      const wrasslin = new DCCItem({
        name: 'Wrasslin',
        type: 'skill',
        system: {
          identifier: 'wrasslin',
          tags: ['action.attack', 'kind.skill', 'weaponClass.unarmed']
        }
      }, actor);

      assert.equal(actor.isTechniqueApplicable(ironPunch, pugilism), true, 'Iron Punch applies to Pugilism skill');
      assert.equal(actor.isTechniqueApplicable(ironPunch, brassKnuckles), true, 'Iron Punch applies to weapon associated with Pugilism');
      assert.equal(actor.isTechniqueApplicable(ironPunch, wrasslin), false, 'Iron Punch does NOT apply to Wrasslin');
    });

    test('rule.no-damage-effects strictly blocks all techniques regardless of appliesTo query', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const universalTech = new DCCItem({
        name: 'Universal Strike',
        type: 'skill',
        system: {
          isTechnique: true,
          appliesTo: { any: ['id.skill.unarmed-combat', 'weaponClass.unarmed', 'kind.skill'] }
        }
      }, actor);

      const unarmedCombat = new DCCItem({
        name: 'Unarmed Combat',
        type: 'skill',
        system: {
          identifier: 'unarmed-combat',
          tags: ['action.attack', 'kind.skill', 'rule.no-damage-effects', 'weaponClass.unarmed']
        }
      }, actor);

      assert.equal(
        actor.isTechniqueApplicable(universalTech, unarmedCombat),
        false,
        'rule.no-damage-effects tag MUST block technique application even if query matches'
      );
      assert.deepEqual(
        actor.getValidDamageEffects(unarmedCombat),
        [],
        'getValidDamageEffects MUST return empty array for items with rule.no-damage-effects'
      );
    });

    test('Complex TagQuery { all, none } restricts custom weapon techniques', () => {
      const actor = new DCCActor({ name: 'Carl', type: 'crawler' });

      const shadowBlade = new DCCItem({
        name: 'Shadow Blade Technique',
        type: 'skill',
        system: {
          isTechnique: true,
          appliesTo: {
            all: ['weaponClass.melee'],
            none: ['weaponClass.ranged']
          }
        }
      }, actor);

      const dagger = new DCCItem({
        name: 'Shadow Dagger',
        type: 'gear',
        system: {
          equipped: true,
          weaponCategory: 'Edge',
          tags: ['weaponClass.melee', 'element.physical']
        }
      }, actor);

      const throwingKnife = new DCCItem({
        name: 'Throwing Knife',
        type: 'gear',
        system: {
          equipped: true,
          weaponCategory: 'Ranged',
          tags: ['weaponClass.melee', 'weaponClass.ranged']
        }
      }, actor);

      assert.equal(actor.isTechniqueApplicable(shadowBlade, dagger), true, 'Matches melee non-ranged weapon');
      assert.equal(actor.isTechniqueApplicable(shadowBlade, throwingKnife), false, 'Blocked by none: [weaponClass.ranged]');
    });
  });

  describe('2. Dynamic Discovery of Tagged Techniques in Attack Synthesizer', () => {
    test('Synthesizes attacks recognizing action.attack tags and applies matching primed techniques', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: { abilities: { str: { value: 14, mod: 4 } } }
      });

      const tossTech = new DCCItem({
        name: 'Toss',
        type: 'skill',
        system: {
          isTechnique: true,
          appliesTo: { any: ['id.skill.wrasslin', 'technique.wrasslin'] },
          techniqueConfig: { isDamageEffect: true, damageBonus: '1d8' },
          rank: 2
        }
      }, actor);

      const wrasslin = new DCCItem({
        name: 'Wrasslin',
        type: 'skill',
        system: {
          identifier: 'wrasslin',
          isAttack: true,
          tags: ['action.attack', 'weaponClass.unarmed', 'kind.skill'],
          rank: 3
        }
      }, actor);

      actor.items = [tossTech, wrasslin];
      if (!actor.items.get) actor.items.get = (id) => actor.items.find(i => i.id === id);

      // Prime Toss
      await actor.setFlag('carl-rpg', `primed_technique_${tossTech.id}`, true);

      const synth = actor.getSynthesizedAttacks();
      const wrasslinAttack = synth.find(a => a.name.toLowerCase() === 'wrasslin');

      assert.ok(wrasslinAttack, 'Wrasslin attack synthesized');
      assert.ok(wrasslinAttack.displayDamage.includes('[Toss]'), 'Primed Toss reflected in Wrasslin attack profile');
    });
  });
});
