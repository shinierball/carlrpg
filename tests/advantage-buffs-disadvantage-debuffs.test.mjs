import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('DCC RPG Advantage Buffs and Disadvantage Debuffs Subsystem', async (t) => {
  await t.test('1. Active Buff granting Advantage rolls 2d20kh on attacks', async () => {
    const actor = new DCCActor({
      name: 'Hero Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 14, unenhanced: 14, mod: 4 },
          dex: { value: 12, unenhanced: 12, mod: 4 }
        }
      }
    });

    // Add trained weapon attack item
    const sword = new DCCItem({
      name: 'Broadsword',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'str',
        toHitRank: 3,
        rank: 3
      }
    }, actor);
    actor.items = [sword];

    // Standard attack without buff
    const baseMsg = await actor.rollAttack(sword, 'hit');
    assert.equal(baseMsg.formula, '1d20 + 7', 'Standard trained attack should roll 1d20');

    // Add active Advantage Buff affecting all attacks
    const heroismBuff = new DCCItem({
      name: 'Heroism Aura',
      type: 'buff',
      system: {
        rollModifierMode: 'advantage',
        affects: ['attacks']
      }
    }, actor);
    actor.items.push(heroismBuff);

    const advMsg = await actor.rollAttack(sword, 'hit');
    assert.ok(advMsg.formula.startsWith('2d20kh'), `Advantage roll formula must start with 2d20kh: ${advMsg.formula}`);
    assert.ok(advMsg.flavor.includes('Advantage'), 'Flavor text must mention Advantage');
  });

  await t.test('2. Active Debuff inflicting Disadvantage rolls 2d20kl on attacks', async () => {
    const actor = new DCCActor({
      name: 'Weakened Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          dex: { value: 10, unenhanced: 10, mod: 4 }
        }
      }
    });

    const axe = new DCCItem({
      name: 'Battleaxe',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'str',
        toHitRank: 2,
        rank: 2
      }
    }, actor);

    // Staggered Debuff: attacks made with Disadvantage
    const staggeredDebuff = new DCCItem({
      name: 'Staggered',
      type: 'debuff',
      system: {
        rollModifierMode: 'disadvantage',
        affects: ['attacks']
      }
    }, actor);
    actor.items = [axe, staggeredDebuff];

    const disadvMsg = await actor.rollAttack(axe, 'hit');
    assert.ok(disadvMsg.formula.startsWith('2d20kl'), `Disadvantage roll formula must start with 2d20kl: ${disadvMsg.formula}`);
    assert.ok(disadvMsg.flavor.includes('Disadvantage'), 'Flavor text must mention Disadvantage');
  });

  await t.test('3. Simultaneous Advantage and Disadvantage cancel out to standard 1d20 roll', async () => {
    const actor = new DCCActor({
      name: 'Balanced Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 12, unenhanced: 12, mod: 4 }
        }
      }
    });

    const mace = new DCCItem({
      name: 'Iron Mace',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'str',
        toHitRank: 2,
        rank: 2
      }
    }, actor);

    const buff = new DCCItem({
      name: 'Blessing of Power',
      type: 'buff',
      system: {
        rollModifierMode: 'advantage',
        affects: ['attacks']
      }
    }, actor);

    const debuff = new DCCItem({
      name: 'Blinded',
      type: 'debuff',
      system: {
        rollModifierMode: 'disadvantage',
        affects: ['attacks']
      }
    }, actor);

    actor.items = [mace, buff, debuff];

    const cancelledMsg = await actor.rollAttack(mace, 'hit');
    assert.ok(cancelledMsg.formula.startsWith('1d20'), `Cancelled roll must use 1d20: ${cancelledMsg.formula}`);
    assert.ok(cancelledMsg.flavor.includes('Cancelled'), 'Flavor text must mention Cancelled');
  });

  await t.test('4. Scoped Targeting: Buff affecting spells only grants advantage on spells, not weapon attacks', async () => {
    const actor = new DCCActor({
      name: 'Mage Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10, unenhanced: 10, mod: 4 },
          int: { value: 16, unenhanced: 16, mod: 4 }
        }
      }
    });

    const dagger = new DCCItem({
      name: 'Dagger',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'str',
        toHitRank: 1,
        rank: 1
      }
    }, actor);

    const fireball = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        stat: 'int',
        rank: 3,
        spellType: 'Attack'
      }
    }, actor);

    // Buff affecting only spells
    const arcaneSurge = new DCCItem({
      name: 'Arcane Surge',
      type: 'buff',
      system: {
        rollModifierMode: 'advantage',
        affects: ['spells']
      }
    }, actor);

    actor.items = [dagger, fireball, arcaneSurge];

    // Attack roll should NOT have advantage
    const attackMsg = await actor.rollAttack(dagger, 'hit');
    assert.ok(attackMsg.formula.startsWith('1d20'), 'Weapon attack should not receive spell advantage');

    // Spell attack roll SHOULD have advantage
    const spellMsg = await actor.rollSpellAttack(fireball);
    assert.ok(spellMsg.formula.startsWith('2d20kh'), 'Spell attack roll must receive 2d20kh advantage');
    assert.ok(spellMsg.flavor.includes('Advantage'), 'Spell attack flavor must mention Advantage');
  });

  await t.test('5. Canonical condition defaults apply advantage/disadvantage when rollModifierMode is unset', async () => {
    const actor = new DCCActor({
      name: 'Afflicted Crawler',
      type: 'crawler',
      system: {
        abilities: {
          dex: { value: 10, unenhanced: 10, mod: 4 },
          str: { value: 10, unenhanced: 10, mod: 4 }
        },
        attributes: {
          debuffs: 'Shakey'
        }
      }
    });

    const bow = new DCCItem({
      name: 'Hunting Bow',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'dex',
        toHitRank: 2,
        rank: 2
      }
    }, actor);
    actor.items = [bow];

    // 'Shakey' is in CANONICAL_CONDITION_ROLL_MODIFIERS affecting 'all' with disadvantage
    const attackMsg = await actor.rollAttack(bow, 'hit');
    assert.ok(attackMsg.formula.startsWith('2d20kl'), 'Canonical Shakey condition must inflict 2d20kl disadvantage');

    // Stat check with Shakey
    const statMsg = await actor.rollStat('dex');
    assert.ok(statMsg.formula.startsWith('2d20kl'), 'Canonical Shakey condition must inflict 2d20kl on stat checks');
  });

  await t.test('6. External Buff slot assignment grants advantage on roll checks', async () => {
    const actor = new DCCActor({
      name: 'Blessed Crawler',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 12, unenhanced: 12, mod: 4 }
        },
        attributes: {
          externalBuffs: {
            buff1: 'Blessed'
          }
        }
      }
    });

    const club = new DCCItem({
      name: 'War Club',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        toHitStat: 'str',
        toHitRank: 1,
        rank: 1
      }
    }, actor);
    actor.items = [club];

    // 'Blessed' canonical condition gives advantage on attacks
    const attackMsg = await actor.rollAttack(club, 'hit');
    assert.ok(attackMsg.formula.startsWith('2d20kh'), 'External buff Blessed must grant 2d20kh advantage on attacks');
  });

  await t.test('7. Manual options override can force advantage or disadvantage', async () => {
    const actor = new DCCActor({
      name: 'Manual Crawler',
      type: 'crawler',
      system: {
        abilities: {
          dex: { value: 14, unenhanced: 14, mod: 4 }
        }
      }
    });

    const sneakSkill = new DCCItem({
      name: 'Sneak',
      type: 'skill',
      system: {
        stat: 'dex',
        rank: 3,
        modifiedRank: 3
      }
    }, actor);
    actor.items = [sneakSkill];

    // Manual advantage option
    const advSkillMsg = await actor.rollSkill(sneakSkill, { advantage: true });
    assert.ok(advSkillMsg.formula.startsWith('2d20kh'), 'Manual advantage option must roll 2d20kh');

    // Manual disadvantage option
    const disadvSkillMsg = await actor.rollSkill(sneakSkill, { disadvantage: true });
    assert.ok(disadvSkillMsg.formula.startsWith('2d20kl'), 'Manual disadvantage option must roll 2d20kl');
  });
});
