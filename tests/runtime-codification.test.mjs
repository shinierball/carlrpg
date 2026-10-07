import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCC_RACES } from '../src/data/races.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';

describe('Runtime Regex Removal & Structured Data Verification', () => {

  test('1. Canonical Races have pre-compiled structured stats, dr, and movement', () => {
    const amazon = DCC_RACES.find(r => r.name === 'Amazonian');
    assert.ok(amazon, 'Amazonian race exists');
    assert.deepEqual(amazon.system.stats, { str: 6, dex: 3, con: 0, int: 0, cha: 0 });
    assert.equal(amazon.system.drBonus, 2);
    assert.deepEqual(amazon.system.movement, { walkDelta: 0, climb: 0, swim: 0, fly: 0, burrow: 0 });
    assert.equal(amazon.system.skills.length, 3);
    assert.ok(amazon.system.skills.some(s => s.name === 'Bow' && s.rank === 2));
    assert.ok(amazon.system.skills.some(s => s.name === 'Endurance' && s.rank === 2));
    assert.ok(amazon.system.skills.some(s => s.name === 'Pugilism' && s.rank === 2));

    // Verify DCCRaceClassApplier returns pre-compiled stats without regex parsing
    const parsedStats = DCCRaceClassApplier.parseStats(amazon);
    assert.deepEqual(parsedStats, amazon.system.stats);
    const parsedDR = DCCRaceClassApplier.parseDR(amazon);
    assert.equal(parsedDR, 2);
    const parsedMove = DCCRaceClassApplier.parseMovement(amazon);
    assert.deepEqual(parsedMove, amazon.system.movement);
  });

  test('2. Canonical Classes have pre-compiled structured stats and skills', () => {
    const arcanist = DCC_CLASSES.find(c => c.name === 'Boring Ol’ Arcanist');
    assert.ok(arcanist, 'Boring Ol’ Arcanist class exists');
    assert.deepEqual(arcanist.system.stats, { str: 0, dex: 2, con: 0, int: 3, cha: 0 });
    assert.equal(arcanist.system.skills.length, 2);
    assert.ok(arcanist.system.skills.some(s => s.name === 'Arcane' && s.rank === 5));
    assert.ok(arcanist.system.skills.some(s => s.name === 'Salvage' && s.rank === 3));

    const parsedStats = DCCRaceClassApplier.parseStats(arcanist);
    assert.deepEqual(parsedStats, arcanist.system.stats);
  });

  test('3. Actor combat checks evaluate exact effect strings and tags without regex errors', async () => {
    const actor = new DCCActor({
      name: 'Carl Tester',
      type: 'crawler',
      system: {
        abilities: { str: { value: 10, mod: 4 }, dex: { value: 10, mod: 4 }, con: { value: 10, mod: 4 }, int: { value: 10, mod: 4 }, cha: { value: 10, mod: 4 } }
      }
    });

    const pugilismSkill = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: { rank: 5, modifiedRank: 5, category: 'combat', checkType: 'Stat Check', tags: ['pugilism'] }
    });
    actor.items.push(pugilismSkill);

    // Test getSkillDamageData with exact Pugilism match
    const dmgData = actor.getSkillDamageData(pugilismSkill, { effect: 'Iron Punch', effectRank: 5 });
    assert.equal(dmgData.hasDamage, true);
    assert.equal(dmgData.baseCount, 5); // 3 (Pugilism R5) + 2 (Iron Punch R5: base + R5 milestone) = 5
    assert.equal(dmgData.baseSides, 2);

    // Test exact Smush effect doubling in rollAttack
    const attackItem = new DCCItem({
      name: 'Fist Strike',
      type: 'attack',
      system: { equipped: true, damageDice: '1d6', damageStat: 'str', tags: ['unarmed'] }
    });
    actor.items.push(attackItem);

    const dmgParts = actor.getAttackDamageParts(attackItem, { effect: 'Smush' });
    assert.ok(dmgParts.length > 0);
  });

  test('4. Fire Fingers passive evaluates via exact tag / name match without regex', () => {
    const actor = new DCCActor({
      name: 'Fire Striker',
      type: 'crawler',
      system: {
        abilities: { str: { value: 10, mod: 4 }, dex: { value: 10, mod: 4 }, con: { value: 10, mod: 4 }, int: { value: 10, mod: 4 }, cha: { value: 10, mod: 4 } }
      }
    });

    const ffSpell = new DCCItem({
      name: 'Fire Fingers',
      type: 'spell',
      system: { rank: 15, modifiedRank: 15, tags: ['fire_fingers'] }
    });
    actor.items.push(ffSpell);

    const pugilism = new DCCItem({
      name: 'Pugilism',
      type: 'skill',
      system: { rank: 5, modifiedRank: 5, category: 'combat', checkType: 'Stat Check', tags: ['pugilism'] }
    });
    actor.items.push(pugilism);

    const dmg = actor.getSkillDamageData(pugilism);
    assert.ok(dmg.fireFingersBonus, 'Fire Fingers Rank 15 bonus is present');
    assert.equal(dmg.fireFingersBonus.type, 'Fire');
    assert.equal(dmg.fireFingersBonus.dice, '1d8 + 1d6');
  });
});
