import test from 'node:test';
import assert from 'node:assert/strict';

import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCC_RACES } from '../src/data/races.mjs';
import { isValidTag, getTagDefinition } from '../src/data/tags.mjs';

test('Dataset Tag Integrity - Canonical Spells', async (t) => {
  await t.test('all 54 spells have identifiers and valid registered tags', () => {
    assert.equal(DCC_SPELLS.length, 54, 'Must have exactly 54 canonical spells');

    for (const spell of DCC_SPELLS) {
      assert.ok(spell.system.identifier, `Spell ${spell.name} must have system.identifier`);
      assert.ok(Array.isArray(spell.system.tags), `Spell ${spell.name} must have system.tags array`);
      assert.ok(spell.system.tags.length > 0, `Spell ${spell.name} tags must not be empty`);

      // Every tag must be registered in tag registry
      for (const tag of spell.system.tags) {
        assert.ok(isValidTag(tag), `Spell ${spell.name} contains invalid tag: ${tag}`);
      }

      // Must have kind.spell
      assert.ok(spell.system.tags.includes('kind.spell'), `Spell ${spell.name} must have kind.spell`);

      // Must have governing stat
      const hasStat = spell.system.tags.some(t => t.startsWith('stat.'));
      assert.ok(hasStat, `Spell ${spell.name} must have a stat.* tag`);
    }
  });

  await t.test('specific spell tags match official rulebook keyword lines', () => {
    const fireball = DCC_SPELLS.find(s => s.name === 'Fireball');
    assert.ok(fireball);
    assert.deepEqual(fireball.system.tags, [
      'kind.spell',
      'action.attack',
      'element.fire',
      'shape.aoe',
      'stat.int'
    ]);

    const holyAura = DCC_SPELLS.find(s => s.name === 'Holy Aura');
    assert.ok(holyAura);
    assert.ok(holyAura.system.tags.includes('favored.cleric'));
    assert.ok(holyAura.system.tags.includes('favored.paladin'));
    assert.ok(holyAura.system.tags.includes('element.holy'));
    assert.ok(holyAura.system.tags.includes('stat.cha'));

    const badFaith = DCC_SPELLS.find(s => s.name === 'Bad Faith');
    assert.ok(badFaith);
    assert.ok(badFaith.system.tags.includes('favored.cleric'));
    assert.ok(badFaith.system.tags.includes('element.necrotic'));
    assert.ok(badFaith.system.tags.includes('stat.cha'));

    const pantyDropper = DCC_SPELLS.find(s => s.name === 'Panty Dropper');
    assert.ok(pantyDropper);
    assert.ok(pantyDropper.system.tags.includes('rule.mind-control'));
    assert.ok(pantyDropper.system.tags.includes('favored.bard'));
    assert.ok(pantyDropper.system.tags.includes('stat.cha'));
  });
});

test('Dataset Tag Integrity - Canonical Skills', async (t) => {
  await t.test('all 121 skills have identifiers and valid registered tags', () => {
    assert.equal(DCC_SKILLS.length, 121, 'Must have exactly 121 canonical skills');

    for (const skill of DCC_SKILLS) {
      assert.ok(skill.system.identifier, `Skill ${skill.name} must have system.identifier`);
      assert.ok(Array.isArray(skill.system.tags), `Skill ${skill.name} must have system.tags array`);
      assert.ok(skill.system.tags.length > 0, `Skill ${skill.name} tags must not be empty`);

      for (const tag of skill.system.tags) {
        assert.ok(isValidTag(tag), `Skill ${skill.name} contains invalid tag: ${tag}`);
      }

      assert.ok(skill.system.tags.includes('kind.skill'), `Skill ${skill.name} must have kind.skill`);
      assert.ok(skill.system.tags.some(t => t.startsWith('stat.')), `Skill ${skill.name} must have a stat.* tag`);
      assert.ok(skill.system.tags.some(t => t.startsWith('skillGroup.')), `Skill ${skill.name} must have a skillGroup.* tag`);
    }
  });

  await t.test('Unarmed Combat has rule.no-damage-effects tag', () => {
    const unarmed = DCC_SKILLS.find(s => s.name === 'Unarmed Combat');
    assert.ok(unarmed);
    assert.ok(unarmed.system.tags.includes('rule.no-damage-effects'));
  });

  await t.test('Combat Techniques have valid technique tags and appliesTo queries', () => {
    const toss = DCC_SKILLS.find(s => s.name === 'Toss');
    assert.ok(toss);
    assert.ok(toss.system.tags.includes('technique.wrasslin'));
    assert.deepEqual(toss.system.appliesTo, ['Wrasslin']);

    const dirtyFighting = DCC_SKILLS.find(s => s.name === 'Dirty Fighting');
    assert.ok(dirtyFighting);
    assert.ok(dirtyFighting.system.tags.includes('technique.pugilism'));
    assert.ok(dirtyFighting.system.tags.includes('technique.wrasslin'));
    assert.deepEqual(dirtyFighting.system.appliesTo, ['Pugilism', 'Wrasslin']);

    const powerfulStrike = DCC_SKILLS.find(s => s.name === 'Powerful Strike');
    assert.ok(powerfulStrike);
    assert.ok(powerfulStrike.system.tags.includes('technique.foot_soldier'));
    assert.ok(powerfulStrike.system.tags.includes('technique.noggin_nocker'));
    assert.ok(powerfulStrike.system.tags.includes('technique.pugilism'));
    assert.deepEqual(powerfulStrike.system.appliesTo, ['Foot Soldier', 'Noggin Nocker', 'Pugilism']);
  });
});

test('Dataset Tag Integrity - Canonical Classes and Races', async (t) => {
  await t.test('all classes have identifiers and valid archetype tags', () => {
    assert.equal(DCC_CLASSES.length, 53, 'Must have 53 canonical classes');

    for (const c of DCC_CLASSES) {
      assert.ok(c.system.identifier, `Class ${c.name} must have identifier`);
      assert.ok(Array.isArray(c.system.archetypes) && c.system.archetypes.length > 0, `Class ${c.name} must have archetypes`);
      assert.ok(c.system.tags.includes('kind.class'), `Class ${c.name} must have kind.class tag`);

      for (const a of c.system.archetypes) {
        assert.ok(isValidTag(a), `Class ${c.name} contains invalid archetype tag: ${a}`);
      }

      // Check no OCR damage left in abilities or perks
      const abilities = c.system.abilities || '';
      assert.ok(!abilities.includes('Forc e'), `Class ${c.name} still contains 'Forc e' OCR error`);
      assert.ok(!abilities.includes('differ ent'), `Class ${c.name} still contains 'differ ent' OCR error`);
      assert.ok(!abilities.includes('craft ing'), `Class ${c.name} still contains 'craft ing' OCR error`);
    }
  });

  await t.test('all races have identifiers and kind.race tag without OCR errors', () => {
    assert.equal(DCC_RACES.length, 30, 'Must have 30 canonical races');

    for (const r of DCC_RACES) {
      assert.ok(r.system.identifier, `Race ${r.name} must have identifier`);
      assert.ok(r.system.tags.includes('kind.race'), `Race ${r.name} must have kind.race tag`);

      const abilities = r.system.abilities || '';
      assert.ok(!abilities.includes('differ ent'), `Race ${r.name} still contains 'differ ent' OCR error`);
      assert.ok(!abilities.includes('craft ing'), `Race ${r.name} still contains 'craft ing' OCR error`);
    }
  });
});
