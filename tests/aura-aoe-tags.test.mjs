import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import {
  TAG_NAMESPACES,
  DCC_TAGS,
  TAG_MAP,
  computeDerivedTags,
  getItemAllTags
} from '../src/data/tags.mjs';
import { BaseActorDataModel } from '../src/models/actors/base-actor-model.mjs';
import { SpellDataModel } from '../src/models/items/spell-model.mjs';
import { BuffDataModel } from '../src/models/items/buff-model.mjs';

test('Aura and AoE Tag System Taxonomy & Definitions', async (t) => {
  await t.test('TAG_NAMESPACES defines delivery, duration, and target namespaces', () => {
    assert.ok(TAG_NAMESPACES.delivery, 'delivery namespace must exist');
    assert.equal(TAG_NAMESPACES.delivery.label, 'Delivery Mode');
    assert.ok(TAG_NAMESPACES.duration, 'duration namespace must exist');
    assert.equal(TAG_NAMESPACES.duration.label, 'Duration Type');
    assert.ok(TAG_NAMESPACES.target, 'target namespace must exist');
    assert.equal(TAG_NAMESPACES.target.label, 'Target Filter');
  });

  await t.test('DCC_TAGS includes shape.aura and delivery tags', () => {
    const ids = new Set(DCC_TAGS.map(t => t.id));
    assert.ok(ids.has('shape.aura'), 'shape.aura tag must exist');
    assert.ok(ids.has('delivery.placed'), 'delivery.placed tag must exist');
    assert.ok(ids.has('delivery.aura'), 'delivery.aura tag must exist');
    assert.ok(ids.has('delivery.self'), 'delivery.self tag must exist');
    assert.ok(ids.has('delivery.target'), 'delivery.target tag must exist');
  });

  await t.test('DCC_TAGS includes duration tags', () => {
    const ids = new Set(DCC_TAGS.map(t => t.id));
    assert.ok(ids.has('duration.instant'), 'duration.instant tag must exist');
    assert.ok(ids.has('duration.rounds'), 'duration.rounds tag must exist');
    assert.ok(ids.has('duration.minutes'), 'duration.minutes tag must exist');
    assert.ok(ids.has('duration.hours'), 'duration.hours tag must exist');
    assert.ok(ids.has('duration.combat'), 'duration.combat tag must exist');
    assert.ok(ids.has('duration.permanent'), 'duration.permanent tag must exist');
  });

  await t.test('DCC_TAGS includes target filtering and rule override tags', () => {
    const ids = new Set(DCC_TAGS.map(t => t.id));
    assert.ok(ids.has('target.allies'), 'target.allies tag must exist');
    assert.ok(ids.has('target.enemies'), 'target.enemies tag must exist');
    assert.ok(ids.has('target.all'), 'target.all tag must exist');
    assert.ok(ids.has('target.self'), 'target.self tag must exist');
    assert.ok(ids.has('rule.temp-health-bars'), 'rule.temp-health-bars tag must exist');
    assert.ok(ids.has('rule.emits-light'), 'rule.emits-light tag must exist');
    assert.ok(ids.has('rule.causes-darkness'), 'rule.causes-darkness tag must exist');
    assert.ok(ids.has('rule.depletes-on-empty'), 'rule.depletes-on-empty tag must exist');
  });

  await t.test('TAG_MAP contains registered delivery, duration, and target tags', () => {
    assert.equal(TAG_MAP.get('delivery.aura')?.namespace, 'delivery');
    assert.equal(TAG_MAP.get('duration.rounds')?.namespace, 'duration');
    assert.equal(TAG_MAP.get('target.allies')?.namespace, 'target');
  });
});

test('Derived Tag Computation for Area, Delivery, Duration, and Temp Health', async (t) => {
  await t.test('computes area shape tags from system.area', () => {
    const spellItem = {
      type: 'spell',
      system: {
        area: {
          hasArea: true,
          shape: 'burst',
          radius: 20
        }
      }
    };
    const derived = computeDerivedTags(spellItem);
    assert.ok(derived.has('shape.aoe'), 'should derive shape.aoe');
    assert.ok(derived.has('shape.burst'), 'should derive shape.burst');
  });

  await t.test('computes delivery, target filter, and duration tags', () => {
    const auraSpell = {
      type: 'spell',
      system: {
        delivery: 'aura',
        area: {
          hasArea: true,
          shape: 'burst',
          radius: 5,
          targetFilter: 'allies'
        },
        durationConfig: {
          type: 'rounds',
          rounds: 2
        },
        tempBars: {
          hasTempBars: true,
          slotsFormula: '@abilities.cha.mod',
          hpPerSlot: 2
        }
      }
    };
    const derived = computeDerivedTags(auraSpell);
    assert.ok(derived.has('delivery.aura'), 'should derive delivery.aura');
    assert.ok(derived.has('shape.aura'), 'should derive shape.aura from delivery.aura');
    assert.ok(derived.has('target.allies'), 'should derive target.allies');
    assert.ok(derived.has('duration.rounds'), 'should derive duration.rounds');
    assert.ok(derived.has('rule.temp-health-bars'), 'should derive rule.temp-health-bars');
  });

  await t.test('getItemAllTags unions explicit tags and derived tags for aura spell', () => {
    const hotStuffItem = {
      type: 'spell',
      system: {
        tags: ['stat.cha', 'favored.bard'],
        delivery: 'aura',
        area: {
          hasArea: true,
          shape: 'burst',
          radius: 5,
          targetFilter: 'allies'
        },
        durationConfig: {
          type: 'rounds',
          rounds: 2
        },
        tempBars: {
          hasTempBars: true
        }
      }
    };
    const allTags = getItemAllTags(hotStuffItem);
    assert.ok(allTags.has('stat.cha'), 'explicit stat.cha preserved');
    assert.ok(allTags.has('favored.bard'), 'explicit favored.bard preserved');
    assert.ok(allTags.has('delivery.aura'), 'derived delivery.aura present');
    assert.ok(allTags.has('shape.aura'), 'derived shape.aura present');
    assert.ok(allTags.has('target.allies'), 'derived target.allies present');
    assert.ok(allTags.has('duration.rounds'), 'derived duration.rounds present');
    assert.ok(allTags.has('rule.temp-health-bars'), 'derived rule.temp-health-bars present');
  });
});

test('Actor and Item Data Models — Schema & Default Values', async (t) => {
  await t.test('BaseActorDataModel defines hp.tempBars in base attributes', () => {
    const baseAttrs = BaseActorDataModel.defineBaseAttributesField();
    const hpSchema = baseAttrs.fields.hp;
    assert.ok(hpSchema.fields.tempBars, 'hp.tempBars must be defined in schema');
    const tempBarsFields = hpSchema.fields.tempBars.fields;
    assert.ok(tempBarsFields.count, 'tempBars.count must exist');
    assert.ok(tempBarsFields.maxCount, 'tempBars.maxCount must exist');
    assert.ok(tempBarsFields.hpPerSlot, 'tempBars.hpPerSlot must exist');
    assert.ok(tempBarsFields.currentSlotHp, 'tempBars.currentSlotHp must exist');
    assert.ok(tempBarsFields.source, 'tempBars.source must exist');
  });

  await t.test('SpellDataModel defines area, delivery, tempBars, durationConfig, and light schemas', () => {
    const spellSchema = SpellDataModel.defineSchema();
    assert.ok(spellSchema.area, 'area schema must exist');
    assert.ok(spellSchema.delivery, 'delivery schema must exist');
    assert.ok(spellSchema.tempBars, 'tempBars schema must exist');
    assert.ok(spellSchema.durationConfig, 'durationConfig schema must exist');
    assert.ok(spellSchema.light, 'light schema must exist');
    assert.ok(spellSchema.active, 'active boolean schema must exist');

    assert.equal(spellSchema.delivery.initial, 'placed');
    assert.equal(spellSchema.area.fields.shape.initial, 'burst');
    assert.equal(spellSchema.active.initial, false);
  });

  await t.test('BuffDataModel defines area, delivery, tempBars, durationConfig, and light schemas', () => {
    const buffSchema = BuffDataModel.defineSchema();
    assert.ok(buffSchema.area, 'area schema must exist on buff');
    assert.ok(buffSchema.delivery, 'delivery schema must exist on buff');
    assert.ok(buffSchema.tempBars, 'tempBars schema must exist on buff');
    assert.ok(buffSchema.durationConfig, 'durationConfig schema must exist on buff');
    assert.ok(buffSchema.light, 'light schema must exist on buff');
    assert.ok(buffSchema.active, 'active schema must exist on buff');
  });
});
