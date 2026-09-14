import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';

describe('DCC RPG Spell Actions & Damage Rolls', () => {
  test('getSpellDamageData accurately parses dice, stat mod, flat bonuses, and damage types', () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          int: { mod: 3 },
          cha: { mod: 2 },
          con: { mod: 1 },
          dex: { mod: 4 },
          str: { mod: 0 }
        }
      }
    });

    // 1. Spell with dice, stat in text, damage type, and blast radius
    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire, 10ft Blast radius',
        upgrades: {
          rank5: '+1d12 base damage. Those who lose 1 or more Health Bar slots via this attack gain the Burned Debuff.',
          rank10: '+1d12 base damage and becomes an 80ft Line attack (and keeps the Blast).',
          rank15: '+1d12 base damage and +40ft Splash (on the Blast).'
        }
      }
    });

    const fbData = crawler.getSpellDamageData(fireball);
    assert.equal(fbData.hasDamage, true);
    assert.equal(fbData.dice, '1d12');
    assert.equal(fbData.stat, 'int');
    assert.equal(fbData.statMod, 3);
    assert.equal(fbData.formula, '1d12 + 3');
    assert.equal(fbData.damageType, 'Fire');
    assert.ok(fbData.effects.includes('10ft Blast radius'));

    // 2. Spell with Charisma stat
    const bangBro = new DCCItem({
      name: 'Bang Bro',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'cha',
        spellType: 'Attack',
        damageType: 'Necrotic',
        baseDamage: '1d8 + Cha Necrotic'
      }
    });
    const bbData = crawler.getSpellDamageData(bangBro);
    assert.equal(bbData.hasDamage, true);
    assert.equal(bbData.dice, '1d8');
    assert.equal(bbData.stat, 'cha');
    assert.equal(bbData.statMod, 2);
    assert.equal(bbData.formula, '1d8 + 2');
    assert.equal(bbData.damageType, 'Necrotic');

    // 3. Flat damage bonus without dice (Bad Faith)
    const badFaith = new DCCItem({
      name: 'Bad Faith',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Passive',
        damageType: 'Fire & Electric',
        baseDamage: '+2 mixed Fire and Electric'
      }
    });
    const bfData = crawler.getSpellDamageData(badFaith);
    assert.equal(bfData.hasDamage, true);
    assert.equal(bfData.formula, '2');
    assert.equal(bfData.damageType, 'Fire & Electric');

    // 4. Non-damage spells (Air Buddy, Heal)
    const airBuddy = new DCCItem({
      name: 'Air Buddy',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Passive',
        baseDamage: ''
      }
    });
    const abData = crawler.getSpellDamageData(airBuddy);
    assert.equal(abData.hasDamage, false);

    const heal = new DCCItem({
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Heal',
        baseDamage: '2 Health Bar slots'
      }
    });
    const healData = crawler.getSpellDamageData(heal);
    assert.equal(healData.hasDamage, false);
  });

  test('spell rank upgrades scale base damage dice automatically', () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { int: { mod: 2 } }
      }
    });

    const createFireballAtRank = rank => new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire, 10ft Blast radius',
        upgrades: {
          rank5: '+1d12 base damage. Those who lose 1 or more Health Bar slots via this attack gain the Burned Debuff.',
          rank10: '+1d12 base damage and becomes an 80ft Line attack (and keeps the Blast).',
          rank15: '+1d12 base damage and +40ft Splash (on the Blast).'
        }
      }
    });

    // Rank 1: 1d12 + 2
    const r1 = crawler.getSpellDamageData(createFireballAtRank(1));
    assert.equal(r1.dice, '1d12');
    assert.equal(r1.formula, '1d12 + 2');

    // Rank 5: 2d12 + 2
    const r5 = crawler.getSpellDamageData(createFireballAtRank(5));
    assert.equal(r5.dice, '2d12');
    assert.equal(r5.formula, '2d12 + 2');

    // Rank 10: 3d12 + 2
    const r10 = crawler.getSpellDamageData(createFireballAtRank(10));
    assert.equal(r10.dice, '3d12');
    assert.equal(r10.formula, '3d12 + 2');

    // Rank 15: 4d12 + 2
    const r15 = crawler.getSpellDamageData(createFireballAtRank(15));
    assert.equal(r15.dice, '4d12');
    assert.equal(r15.formula, '4d12 + 2');
  });

  test('rollSpellDamage generates interactive damage card with flags and action buttons', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { int: { mod: 3 } }
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire, 10ft Blast radius'
      }
    }, crawler);

    const chatMsg = await crawler.rollSpellDamage(fireball);
    assert.ok(chatMsg, 'Chat message must be created');
    assert.ok(chatMsg.content.includes('dcc-damage-card'), 'Chat message must render a dcc-damage-card');
    assert.ok(chatMsg.content.includes('dcc-apply-damage-btn'), 'Chat message must include damage application buttons');
    assert.ok(chatMsg.content.includes('Fireball Damage'), 'Chat message header should name the spell');
    assert.ok(chatMsg.content.includes('Fire'), 'Chat message should include damage type');

    // Verify flags for carl-rpg damage rolls
    const flags = chatMsg.flags?.['carl-rpg'];
    assert.ok(flags, 'carl-rpg flags must be present');
    assert.equal(flags.isDamageRoll, true);
    assert.equal(flags.attackerId, crawler.id);
    assert.equal(flags.itemId, fireball.id);
    assert.equal(flags.attackType, 'spell');
    assert.equal(typeof flags.rawDamage, 'number');
    assert.ok(flags.rawDamage > 0, 'rawDamage must be greater than 0');
  });

  test('rollSpell attack / to-hit executes attack roll', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { int: { mod: 4 } }
      }
    });

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 2,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d12 + Int Fire'
      }
    }, crawler);

    const hitMsg = await crawler.rollSpellAttack(fireball);
    assert.ok(hitMsg, 'Hit message must be returned');
    assert.ok(hitMsg.flavor.includes('Fireball'), 'Flavor must mention spell name');
    assert.ok(hitMsg.flavor.includes('To Hit') || hitMsg.flavor.includes('Spell Attack'), 'Flavor must indicate spell attack/hit');
    assert.ok(hitMsg.flavor.includes('Rank 2'), 'Flavor must include Rank 2');
    assert.ok(hitMsg.flavor.includes('+4') || hitMsg.flavor.includes('Mod 4'), 'Flavor must include INT modifier');
  });

  test('rollSpell cast card embeds "Roll Spell Damage" button when spell has damage', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { int: { mod: 3 } },
        attributes: { mana: { value: 20, max: 20 } }
      }
    });

    // Spell with damage
    const frostScar = new DCCItem({
      name: 'Frost Scar',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Attack',
        damageType: 'Ice',
        baseDamage: '1d4 + Int Ice',
        manaCost: 2
      }
    }, crawler);

    const damageSpellMsg = await crawler.rollSpell(frostScar);
    assert.ok(damageSpellMsg.content.includes('roll-spell-dmg-from-card'), 'Cast card should embed a Roll Damage button');
    assert.ok(damageSpellMsg.content.includes('1d4 + 3'), 'Damage button should indicate formula');

    // Spell without damage
    const airBuddy = new DCCItem({
      name: 'Air Buddy',
      type: 'spell',
      system: {
        rank: 1,
        stat: 'int',
        spellType: 'Passive',
        baseDamage: ''
      }
    }, crawler);

    const passiveMsg = await crawler.rollSpell(airBuddy);
    assert.equal(passiveMsg.content.includes('roll-spell-dmg-from-card'), false, 'Non-damaging spell must not have Roll Damage button');
  });

  test('polymorphic rollAttack and item.roll handle spell items seamlessly', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { cha: { mod: 2 } }
      }
    });

    const paladinSmite = new DCCItem({
      name: "Paladin's Smite",
      type: 'spell',
      system: {
        rank: 1,
        stat: 'cha',
        spellType: 'Attack',
        damageType: 'Holy',
        baseDamage: '1d8 + Cha Holy'
      }
    }, crawler);

    // 1. actor.rollAttack with type = 'damage'
    const dmgMsg = await crawler.rollAttack(paladinSmite, 'damage');
    assert.ok(dmgMsg.content.includes('dcc-damage-card'));
    assert.equal(dmgMsg.flags['carl-rpg'].attackType, 'spell');

    // 2. actor.rollAttack with type = 'hit'
    const hitMsg = await crawler.rollAttack(paladinSmite, 'hit');
    assert.ok(hitMsg.flavor.includes("Paladin's Smite"));

    // 3. paladinSmite.roll('damage')
    const itemDmgMsg = await paladinSmite.roll('damage');
    assert.ok(itemDmgMsg.content.includes('dcc-damage-card'));

    // 4. paladinSmite.roll('hit')
    const itemHitMsg = await paladinSmite.roll('hit');
    assert.ok(itemHitMsg.flavor.includes("Paladin's Smite"));
  });

  test('spell damage card applies damage to target token deducting DR via combat metrics', async () => {
    const attacker = new DCCActor({
      name: 'Mage Carl',
      type: 'crawler',
      system: {
        abilities: { int: { mod: 3 } }
      }
    });

    const target = new DCCActor({
      name: 'Goblin',
      type: 'npc',
      system: {
        attributes: {
          hp: { value: 30, max: 30, temp: 0, pct: 100 },
          dr: { total: 4 }
        }
      }
    });

    // Apply 12 raw spell damage against 4 DR: net damage = 8
    const result = await DCCCombatMetrics.applyDamageToTarget({
      targetActor: target,
      rawDamage: 12,
      attackerActor: attacker,
      attackName: 'Fireball',
      attackType: 'spell',
      ignoreDR: false,
      multiplier: 1
    });

    assert.equal(result.rawDamage, 12);
    assert.equal(result.dr, 4);
    assert.equal(result.damageAfterDR, 8);
    assert.equal(result.damageToHp, 6);
    assert.equal(target.system.attributes.hp.value, 24);
  });

  test('casting spell checks mana, subtracts mana on success, and records remaining mana', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 15, max: 20 }
        }
      }
    });

    const spell = new DCCItem({
      name: 'Magic Missile',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 5,
        baseDamage: '1d4 + Int Force'
      }
    }, crawler);

    assert.equal(crawler.system.attributes.mana.value, 15);

    const msg = await crawler.rollSpell(spell);
    assert.ok(msg, 'Message must be created');
    assert.equal(crawler.system.attributes.mana.value, 10, 'Mana must be reduced from 15 to 10');
    assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
    assert.equal(msg.flags['carl-rpg'].manaCost, 5);
    assert.equal(msg.flags['carl-rpg'].remainingMana, 10);
    assert.ok(msg.content.includes('10 MP left'));
  });

  test('casting spell fails when mana is insufficient, does not subtract mana, and posts failure card', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 3, max: 20 }
        }
      }
    });

    const spell = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 10,
        baseDamage: '1d12 + Int Fire'
      }
    }, crawler);

    assert.equal(crawler.system.attributes.mana.value, 3);

    const msg = await crawler.rollSpell(spell);
    assert.ok(msg, 'Failure message must be created');
    assert.equal(crawler.system.attributes.mana.value, 3, 'Mana must NOT be deducted on failure');
    assert.equal(msg.flags['carl-rpg'].spellFailed, true);
    assert.equal(msg.flags['carl-rpg'].reason, 'insufficient_mana');
    assert.equal(msg.flags['carl-rpg'].manaCost, 10);
    assert.equal(msg.flags['carl-rpg'].currentMana, 3);
    assert.ok(msg.content.includes('FAILED'));
    assert.ok(msg.content.includes('Insufficient Mana'));
    assert.ok(msg.content.includes('3 / 10 MP'));
  });

  test('casting 0-cost spell succeeds even with 0 mana', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 0, max: 10 }
        }
      }
    });

    const cantrip = new DCCItem({
      name: 'Dirt Clod',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 0,
        baseDamage: '1d2 + Int Bludgeoning'
      }
    }, crawler);

    const msg = await crawler.rollSpell(cantrip);
    assert.ok(msg);
    assert.equal(crawler.system.attributes.mana.value, 0);
    assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
    assert.equal(msg.flags['carl-rpg'].remainingMana, 0);
  });

  test('casting with exact mana reduces mana to 0', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 6, max: 10 }
        }
      }
    });

    const spell = new DCCItem({
      name: 'Earworm',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 6,
        baseDamage: '1d6 + Cha Sonic'
      }
    }, crawler);

    const msg = await crawler.rollSpell(spell);
    assert.ok(msg);
    assert.equal(crawler.system.attributes.mana.value, 0, 'Mana must be exactly 0 after spending all remaining mana');
    assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
  });
});
