import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';
import { MockCombatant } from './setup.mjs';

test('DCC RPG End of Combat Round Effects Subsystem (Debuff DoT & Buff Healing)', async (t) => {

  await t.test('1. Schema and Templates support damagePerRound and healingPerRound', () => {
    const templateJson = JSON.parse(fs.readFileSync('template.json', 'utf8'));
    assert.ok(templateJson.Item.debuff.damagePerRound !== undefined, 'template.json debuff schema must define damagePerRound');
    assert.ok(templateJson.Item.buff.healingPerRound !== undefined, 'template.json buff schema must define healingPerRound');

    const debuffHbs = fs.readFileSync('templates/items/parts/debuff.hbs', 'utf8');
    assert.match(debuffHbs, /name="system\.damagePerRound"/, 'debuff.hbs must include damagePerRound input');
    assert.match(debuffHbs, /Damage Per Round/, 'debuff.hbs must label Damage Per Round');

    const buffHbs = fs.readFileSync('templates/items/parts/buff.hbs', 'utf8');
    assert.match(buffHbs, /name="system\.healingPerRound"/, 'buff.hbs must include healingPerRound input');
    assert.match(buffHbs, /Healing Per Round/, 'buff.hbs must label Healing Per Round');
    assert.match(buffHbs, /value="heal"/, 'buff.hbs must include heal buffType option');
  });

  await t.test('2. DCCCombat.evaluateEffectFormula correctly parses numbers, bars, floor variables, and dice', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 40, max: 40, hpPerBar: 4 }
        }
      }
    });

    // 1. Flat numbers
    const flatVal = await DCCCombat.evaluateEffectFormula(6, { actor });
    assert.equal(flatVal, 6, 'Numeric 6 must evaluate to 6');
    const flatStr = await DCCCombat.evaluateEffectFormula('8', { actor });
    assert.equal(flatStr, 8, 'String "8" must evaluate to 8');

    // 2. HP bars ("1 bar", "2 bars")
    const oneBar = await DCCCombat.evaluateEffectFormula('1 bar', { actor });
    assert.equal(oneBar, 4, '1 bar must evaluate to hpPerBar (4)');
    const twoBars = await DCCCombat.evaluateEffectFormula('2 bars', { actor });
    assert.equal(twoBars, 8, '2 bars must evaluate to 2 * hpPerBar (8)');

    // 3. Floor replacement (e.g. 5+F on Floor 3 -> 8)
    const floorFormula = await DCCCombat.evaluateEffectFormula('5+F', { actor, floor: 3 });
    assert.equal(floorFormula, 8, '5+F with floor 3 must evaluate to 8');

    // 4. Dice formula (e.g. 1d6)
    const diceVal = await DCCCombat.evaluateEffectFormula('1d6', { actor });
    assert.ok(diceVal >= 1 && diceVal <= 6, `1d6 should evaluate between 1 and 6, got ${diceVal}`);
  });

  await t.test('3. Advancing combat round triggers debuff damage automatically', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 40, max: 40, hpPerBar: 4 },
          dr: { total: 0 }
        }
      }
    });

    // Debuff dealing 1 bar (4 HP) of Poison damage per round
    const poisonDebuff = new DCCItem({
      id: 'deb-poison',
      name: 'Deadly Poison',
      type: 'debuff',
      system: {
        damageType: 'Poison',
        damagePerRound: '1 bar',
        severity: 'Major'
      }
    }, crawler);
    crawler.items.push(poisonDebuff);

    const combatant = new MockCombatant({
      id: 'c-carl',
      actorId: crawler.id,
      name: crawler.name,
      actor: crawler
    });

    const combat = new DCCCombat({
      id: 'combat-dot-test',
      round: 1,
      combatants: [combatant]
    });

    // ChatMessage mock tracking
    let createdMessage = null;
    globalThis.ChatMessage = {
      create: async (data) => {
        createdMessage = data;
        return data;
      }
    };

    // Advance to next round (ending Round 1)
    await combat.nextRound();

    // Verification:
    // 1 bar = 4 HP damage applied. 40 - 4 = 36.
    assert.equal(crawler.system.attributes.hp.value, 36, 'Crawler HP must be reduced by 1 bar (4 HP) from poison debuff');
    assert.ok(createdMessage, 'Chat message must be generated for end-of-round effects');
    assert.match(createdMessage.content, /End of Round 1 Effects/, 'Card must state End of Round 1 Effects');
    assert.match(createdMessage.content, /Deadly Poison/, 'Card must mention Deadly Poison');
    assert.match(createdMessage.content, /-4 HP/, 'Card must show -4 HP');
    assert.equal(combat.round, 2, 'Combat round must advance to 2');
  });

  await t.test('4. Advancing combat round triggers buff healing automatically', async () => {
    const crawler = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 20, max: 40, hpPerBar: 4 }
        }
      }
    });

    // Buff restoring 1 bar (4 HP) of health per round
    const regenBuff = new DCCItem({
      id: 'buff-regen',
      name: 'Regeneration Aura',
      type: 'buff',
      system: {
        buffType: 'heal',
        healingPerRound: '1 bar'
      }
    }, crawler);
    crawler.items.push(regenBuff);

    const combatant = new MockCombatant({
      id: 'c-donut',
      actorId: crawler.id,
      name: crawler.name,
      actor: crawler
    });

    const combat = new DCCCombat({
      id: 'combat-regen-test',
      round: 1,
      combatants: [combatant]
    });

    let createdMessage = null;
    globalThis.ChatMessage = {
      create: async (data) => {
        createdMessage = data;
        return data;
      }
    };

    // Advance round
    await combat.nextRound();

    // Verification:
    // 20 + 4 = 24 HP
    assert.equal(crawler.system.attributes.hp.value, 24, 'Donut HP must be healed by 1 bar (4 HP)');
    assert.ok(createdMessage, 'Chat message must be generated');
    assert.match(createdMessage.content, /Regeneration Aura/, 'Card must mention Regeneration Aura');
    assert.match(createdMessage.content, /\+4 HP/, 'Card must show +4 HP');
  });

  await t.test('5. Healing buff cannot exceed maximum HP', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          con: { value: 10, mod: 4 }
        },
        attributes: {
          hp: { value: 38, max: 40, hpPerBar: 4 }
        }
      }
    });

    const regenBuff = new DCCItem({
      id: 'buff-regen',
      name: 'Regeneration Aura',
      type: 'buff',
      system: {
        buffType: 'heal',
        healingPerRound: '1 bar' // 4 HP
      }
    }, crawler);
    crawler.items.push(regenBuff);

    const combatant = new MockCombatant({
      id: 'c-carl',
      actorId: crawler.id,
      name: crawler.name,
      actor: crawler
    });

    const combat = new DCCCombat({
      id: 'combat-cap-test',
      round: 1,
      combatants: [combatant]
    });

    await combat.nextRound();

    // 38 + 4 would be 42, capped at 40
    assert.equal(crawler.system.attributes.hp.value, 40, 'Healing must cap at maxHp (40)');
  });

  await t.test('6. Multiple debuffs and buffs across combatants trigger simultaneously', async () => {
    const mob = new DCCActor({
      name: 'Goblin Bruiser',
      type: 'mob',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 20, max: 20, hpPerBar: 4 }, dr: { total: 0 } }
      }
    });

    // Mob has Burned debuff dealing 4 fire damage
    const burnedDebuff = new DCCItem({
      id: 'deb-burned',
      name: 'Burned',
      type: 'debuff',
      system: {
        damageType: 'Fire',
        damagePerRound: '4'
      }
    }, mob);
    mob.items.push(burnedDebuff);

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 20, max: 40, hpPerBar: 4 } }
      }
    });

    // Crawler has Regeneration buff healing 4 HP
    const regenBuff = new DCCItem({
      id: 'buff-regen',
      name: 'Troll Blood',
      type: 'buff',
      system: {
        buffType: 'heal',
        healingPerRound: '4'
      }
    }, crawler);
    crawler.items.push(regenBuff);

    const combatantMob = new MockCombatant({ id: 'c-mob', actor: mob, name: mob.name });
    const combatantCrawler = new MockCombatant({ id: 'c-crawler', actor: crawler, name: crawler.name });

    const combat = new DCCCombat({
      id: 'multi-combat-test',
      round: 2,
      combatants: [combatantMob, combatantCrawler]
    });

    let createdMessage = null;
    globalThis.ChatMessage = {
      create: async (data) => {
        createdMessage = data;
        return data;
      }
    };

    const results = await combat.triggerRoundEndEffects(2);

    assert.equal(results.length, 2, 'Two effects should trigger (1 debuff damage, 1 buff heal)');
    assert.equal(mob.system.attributes.hp.value, 16, 'Mob takes 4 fire damage (20 -> 16)');
    assert.equal(crawler.system.attributes.hp.value, 24, 'Crawler heals 4 HP (20 -> 24)');
    assert.ok(createdMessage.content.includes('Burned'), 'Chat card mentions Burned');
    assert.ok(createdMessage.content.includes('Troll Blood'), 'Chat card mentions Troll Blood');
  });

  await t.test('7. Deduplication guard prevents running triggerRoundEndEffects multiple times for same round', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, hpPerBar: 4 } }
      }
    });

    const poisonDebuff = new DCCItem({
      id: 'deb-poison',
      name: 'Poison',
      type: 'debuff',
      system: { damageType: 'Poison', damagePerRound: '4' }
    }, crawler);
    crawler.items.push(poisonDebuff);

    const combatant = new MockCombatant({ id: 'c-carl', actor: crawler, name: crawler.name });
    const combat = new DCCCombat({ id: 'dedup-test', round: 1, combatants: [combatant] });

    const firstRun = await combat.triggerRoundEndEffects(1);
    assert.equal(firstRun.length, 1, 'First run triggers poison damage');
    assert.equal(crawler.system.attributes.hp.value, 36, 'HP drops from 40 to 36');

    // Second call for same round 1
    const secondRun = await combat.triggerRoundEndEffects(1);
    assert.equal(secondRun.length, 0, 'Second run for same round returns empty array (deduplicated)');
    assert.equal(crawler.system.attributes.hp.value, 36, 'HP remains 36 and is not double-damaged');
  });
});
