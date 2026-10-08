import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TAG_NAMESPACES,
  DCC_TAGS,
  TAG_MAP,
  getTagDefinition,
  isValidTag,
  damageTypeToElement,
  elementToDamageType,
  computeDerivedTags,
  getItemAllTags,
  registerCustomTag,
  getCustomTags
} from '../src/data/tags.mjs';

import { MockItem, MockActor } from './setup.mjs';

test('Tag Registry - Namespaces and Core Tag Definitions', async (t) => {
  await t.test('all expected namespaces are defined', () => {
    const expected = [
      'kind', 'action', 'element', 'shape', 'stat',
      'archetype', 'favored', 'weapon', 'weaponClass', 'weaponProp',
      'skillGroup', 'technique', 'rule', 'id', 'custom'
    ];
    for (const ns of expected) {
      assert.ok(TAG_NAMESPACES[ns], `Namespace ${ns} must exist`);
      assert.ok(TAG_NAMESPACES[ns].label, `Namespace ${ns} must have a label`);
    }
  });

  await t.test('all registered tag IDs are unique and well-formed', () => {
    const seen = new Set();
    for (const tag of DCC_TAGS) {
      assert.ok(!seen.has(tag.id), `Duplicate tag ID detected: ${tag.id}`);
      seen.add(tag.id);

      assert.ok(tag.id.includes('.'), `Tag ID must be namespaced: ${tag.id}`);
      const [ns] = tag.id.split('.');
      assert.equal(tag.namespace, ns, `Tag namespace property must match ID prefix: ${tag.id}`);
      assert.ok(TAG_NAMESPACES[ns], `Tag namespace ${ns} must be in TAG_NAMESPACES: ${tag.id}`);
      assert.ok(tag.label && tag.label.length > 0, `Tag ${tag.id} must have a non-empty label`);
    }
  });

  await t.test('favored tags reference their corresponding archetype', () => {
    const favored = DCC_TAGS.filter(t => t.namespace === 'favored');
    assert.ok(favored.length >= 6, 'Must have at least 6 favored archetypes');
    for (const f of favored) {
      assert.ok(f.references, `Favored tag ${f.id} must define references`);
      assert.ok(f.references.startsWith('archetype.'), `Favored tag ${f.id} must reference archetype.*`);
      assert.ok(TAG_MAP.has(f.references), `Referenced tag ${f.references} must exist in TAG_MAP`);
    }
  });
});

test('Tag Registry - Lookup and Validation Functions', async (t) => {
  await t.test('getTagDefinition retrieves core tags', () => {
    const fire = getTagDefinition('element.fire');
    assert.ok(fire);
    assert.equal(fire.id, 'element.fire');
    assert.equal(fire.label, 'Fire');
    assert.equal(fire.namespace, 'element');

    const invalid = getTagDefinition('nonexistent.fake');
    assert.equal(invalid, null);
  });

  await t.test('getTagDefinition auto-generates descriptors for identity tags', () => {
    const ident = getTagDefinition('id.skill.wrasslin');
    assert.ok(ident);
    assert.equal(ident.id, 'id.skill.wrasslin');
    assert.equal(ident.namespace, 'id');
    assert.equal(ident.label, 'Wrasslin');
  });

  await t.test('isValidTag accurately validates core, identity, and invalid tags', () => {
    assert.equal(isValidTag('element.fire'), true);
    assert.equal(isValidTag('archetype.mage'), true);
    assert.equal(isValidTag('action.attack'), true);
    assert.equal(isValidTag('id.spell.fireball'), true);
    assert.equal(isValidTag('invalid.garbage.tag'), false);
    assert.equal(isValidTag(''), false);
    assert.equal(isValidTag(null), false);
  });

  await t.test('damageTypeToElement and elementToDamageType convert bidirectionally', () => {
    assert.equal(damageTypeToElement('Fire'), 'element.fire');
    assert.equal(damageTypeToElement('fire'), 'element.fire');
    assert.equal(damageTypeToElement('Electric'), 'element.electric');
    assert.equal(damageTypeToElement('Electricity'), 'element.electric');
    assert.equal(damageTypeToElement('Necrotic'), 'element.necrotic');
    assert.equal(damageTypeToElement('Bludgeoning'), 'element.bludgeoning');
    assert.equal(damageTypeToElement('UnknownType'), null);

    assert.equal(elementToDamageType('element.fire'), 'Fire');
    assert.equal(elementToDamageType('element.ice'), 'Ice');
    assert.equal(elementToDamageType('element.holy'), 'Holy');
    assert.equal(elementToDamageType('element.nonexistent'), null);
  });
});

test('Tag Registry - Custom Tag Management', async (t) => {
  await t.test('registerCustomTag registers and retrieves custom tags', async () => {
    const custom = await registerCustomTag({
      id: 'custom.my_special_tag',
      label: 'My Special Tag',
      description: 'Test custom tag'
    });

    assert.equal(custom.id, 'custom.my_special_tag');
    assert.equal(custom.namespace, 'custom');
    assert.equal(isValidTag('custom.my_special_tag'), true);

    const found = getTagDefinition('custom.my_special_tag');
    assert.ok(found);
    assert.equal(found.label, 'My Special Tag');

    const allCustom = getCustomTags();
    assert.ok(allCustom.some(t => t.id === 'custom.my_special_tag'));
  });
});

test('Tag Registry - Derived and AllTags Computation', async (t) => {
  await t.test('computeDerivedTags extracts tags for spell', () => {
    const spellData = {
      type: 'spell',
      system: {
        identifier: 'fireball',
        spellType: 'Attack',
        stat: 'int',
        damageType: 'Fire'
      }
    };
    const derived = computeDerivedTags(spellData);
    assert.ok(derived.has('kind.spell'), 'Must derive kind.spell');
    assert.ok(derived.has('id.spell.fireball'), 'Must derive id.spell.fireball');
    assert.ok(derived.has('action.attack'), 'Must derive action.attack');
    assert.ok(derived.has('stat.int'), 'Must derive stat.int');
    assert.ok(derived.has('element.fire'), 'Must derive element.fire');
  });

  await t.test('computeDerivedTags extracts tags for weapon gear', () => {
    const gearData = {
      type: 'gear',
      system: {
        identifier: 'shotgun',
        isWeapon: true,
        toHitStat: 'dex'
      }
    };
    const derived = computeDerivedTags(gearData);
    assert.ok(derived.has('kind.gear'));
    assert.ok(derived.has('kind.weapon'));
    assert.ok(derived.has('id.gear.shotgun'));
    assert.ok(derived.has('stat.dex'));
  });

  await t.test('computeDerivedTags extracts tags for class archetype', () => {
    const classData = {
      type: 'class',
      system: {
        identifier: 'boring-ol-mage',
        classType: 'Mage',
        archetypes: ['archetype.mage']
      }
    };
    const derived = computeDerivedTags(classData);
    assert.ok(derived.has('kind.class'));
    assert.ok(derived.has('id.class.boring-ol-mage'));
    assert.ok(derived.has('archetype.mage'));
  });

  await t.test('getItemAllTags unions explicit, derived, and identity tags', () => {
    const item = new MockItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        identifier: 'fireball',
        spellType: 'Attack',
        stat: 'int',
        damageType: 'Fire',
        tags: ['shape.aoe', 'element.fire']
      }
    });

    const all = item.allTags;
    assert.ok(all instanceof Set);
    assert.ok(all.has('kind.spell'));
    assert.ok(all.has('id.spell.fireball'));
    assert.ok(all.has('action.attack'));
    assert.ok(all.has('stat.int'));
    assert.ok(all.has('element.fire'));
    assert.ok(all.has('shape.aoe'));
  });

  await t.test('MockActor getArchetypeTags and getIdentityTags extract correctly', () => {
    const actor = new MockActor({
      name: 'Crawler Carl',
      type: 'crawler',
      system: {
        details: { class: 'Mage' }
      },
      items: [
        new MockItem({
          name: 'Boring Ol’ Mage',
          type: 'class',
          system: {
            identifier: 'boring-ol-mage',
            classType: 'Mage',
            archetypes: ['archetype.mage'],
            tags: ['class.boring-ol-mage']
          }
        })
      ]
    });

    const archetypes = actor.getArchetypeTags();
    assert.ok(archetypes.has('archetype.mage'));

    const identity = actor.getIdentityTags();
    assert.ok(identity.has('archetype.mage'));
    assert.ok(identity.has('kind.class'));
    assert.ok(identity.has('id.class.boring-ol-mage'));
  });
});
