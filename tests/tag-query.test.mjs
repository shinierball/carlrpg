import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeTagList,
  matchesTagQuery,
  expandTagReferences
} from '../src/utils/tag-query.mjs';

test('Tag Query - normalizeTagList', async (t) => {
  await t.test('handles comma-separated strings', () => {
    const list = normalizeTagList('element.fire, shape.aoe, kind.spell');
    assert.deepEqual(list, ['element.fire', 'kind.spell', 'shape.aoe']);
  });

  await t.test('handles whitespace-separated strings', () => {
    const list = normalizeTagList('element.fire shape.aoe');
    assert.deepEqual(list, ['element.fire', 'shape.aoe']);
  });

  await t.test('deduplicates and sorts arrays', () => {
    const list = normalizeTagList(['shape.aoe', 'element.fire', 'shape.aoe']);
    assert.deepEqual(list, ['element.fire', 'shape.aoe']);
  });

  await t.test('handles Set input', () => {
    const set = new Set(['b', 'a']);
    const list = normalizeTagList(set);
    assert.deepEqual(list, ['a', 'b']);
  });

  await t.test('handles null, undefined, and empty string', () => {
    assert.deepEqual(normalizeTagList(null), []);
    assert.deepEqual(normalizeTagList(undefined), []);
    assert.deepEqual(normalizeTagList(''), []);
  });
});

test('Tag Query - matchesTagQuery evaluation', async (t) => {
  const candidateTags = new Set([
    'kind.spell',
    'action.attack',
    'element.fire',
    'shape.aoe',
    'stat.int',
    'id.spell.fireball'
  ]);

  await t.test('empty, null, or undefined query always matches', () => {
    assert.equal(matchesTagQuery(candidateTags, null), true);
    assert.equal(matchesTagQuery(candidateTags, undefined), true);
    assert.equal(matchesTagQuery(candidateTags, []), true);
    assert.equal(matchesTagQuery(candidateTags, {}), true);
  });

  await t.test('single string query evaluates exact match', () => {
    assert.equal(matchesTagQuery(candidateTags, 'element.fire'), true);
    assert.equal(matchesTagQuery(candidateTags, 'element.ice'), false);
    // Strict exact matching (no substring guessing)
    assert.equal(matchesTagQuery(candidateTags, 'element'), false);
    assert.equal(matchesTagQuery(candidateTags, 'fire'), false);
  });

  await t.test('array query requires ALL tags present', () => {
    assert.equal(matchesTagQuery(candidateTags, ['kind.spell', 'element.fire']), true);
    assert.equal(matchesTagQuery(candidateTags, ['kind.spell', 'element.ice']), false);
    assert.equal(matchesTagQuery(candidateTags, ['kind.spell', 'element.fire', 'shape.aoe']), true);
  });

  await t.test('object query with all requirement', () => {
    assert.equal(matchesTagQuery(candidateTags, { all: ['kind.spell', 'stat.int'] }), true);
    assert.equal(matchesTagQuery(candidateTags, { all: ['kind.spell', 'stat.dex'] }), false);
  });

  await t.test('object query with any requirement', () => {
    assert.equal(matchesTagQuery(candidateTags, { any: ['element.ice', 'element.fire'] }), true);
    assert.equal(matchesTagQuery(candidateTags, { any: ['element.ice', 'element.sonic'] }), false);
  });

  await t.test('object query with none requirement', () => {
    assert.equal(matchesTagQuery(candidateTags, { none: ['action.passive'] }), true);
    assert.equal(matchesTagQuery(candidateTags, { none: ['action.attack'] }), false);
  });

  await t.test('combined object query: all, any, and none', () => {
    const complexQuery = {
      all: ['kind.spell', 'action.attack'],
      any: ['element.fire', 'element.ice'],
      none: ['action.passive', 'stat.str']
    };
    assert.equal(matchesTagQuery(candidateTags, complexQuery), true);

    // Fail if an 'all' is missing
    assert.equal(matchesTagQuery(candidateTags, { ...complexQuery, all: ['kind.spell', 'kind.weapon'] }), false);

    // Fail if an 'any' is not met
    assert.equal(matchesTagQuery(candidateTags, { ...complexQuery, any: ['element.holy', 'element.necrotic'] }), false);

    // Fail if a 'none' is present
    assert.equal(matchesTagQuery(candidateTags, { ...complexQuery, none: ['element.fire'] }), false);
  });

  await t.test('works with array of candidate tags as well as Set', () => {
    const arrayCandidate = ['kind.skill', 'id.skill.wrasslin', 'stat.str'];
    assert.equal(matchesTagQuery(arrayCandidate, 'id.skill.wrasslin'), true);
    assert.equal(matchesTagQuery(arrayCandidate, { all: ['kind.skill', 'stat.str'] }), true);
    assert.equal(matchesTagQuery(arrayCandidate, 'id.skill.pugilism'), false);
  });
});

test('Tag Query - expandTagReferences', async (t) => {
  await t.test('expands favored tags to referenced archetypes', () => {
    const tags = new Set(['favored.paladin', 'element.holy']);
    const expanded = expandTagReferences(tags);

    assert.ok(expanded.has('favored.paladin'));
    assert.ok(expanded.has('element.holy'));
    assert.ok(expanded.has('archetype.paladin'), 'Must expand to referenced archetype.paladin');
  });

  await t.test('leaves tags without references unchanged', () => {
    const tags = new Set(['element.fire', 'kind.spell']);
    const expanded = expandTagReferences(tags);
    assert.equal(expanded.size, 2);
    assert.ok(expanded.has('element.fire'));
    assert.ok(expanded.has('kind.spell'));
  });
});
