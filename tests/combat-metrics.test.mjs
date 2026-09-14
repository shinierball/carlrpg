import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCCombatMetrics, DCCCombatMetricsApp } from '../src/apps/combat-metrics.mjs';
import { DCCActor } from '../src/documents/actor.mjs';

class MockCombatant {
  constructor(data = {}) {
    this.id = data.id || ('combatant-' + Math.random().toString(36).substring(2, 7));
    this.actorId = data.actorId;
    this.actor = data.actor;
  }
}

class MockCombat {
  constructor(data = {}) {
    this.id = data.id || ('combat-' + Math.random().toString(36).substring(2, 7));
    this.round = data.round || 1;
    this.turn = data.turn || 0;
    this.isActive = data.isActive ?? true;
    this.combatants = data.combatants || [];
    this.flags = data.flags || { 'carl-rpg': {} };
  }

  getFlag(scope, key) {
    return this.flags?.[scope]?.[key];
  }

  async setFlag(scope, key, value) {
    if (!this.flags) this.flags = {};
    if (!this.flags[scope]) this.flags[scope] = {};
    this.flags[scope][key] = structuredClone(value);
    return this;
  }

  async unsetFlag(scope, key) {
    if (this.flags?.[scope]) {
      delete this.flags[scope][key];
    }
    return this;
  }
}

test('DCC RPG Combat Metrics & AI Awards System', async (t) => {

  await t.test('1. Target Damage Application and DR Calculation', async (sub) => {
    await sub.test('deducts target DR from raw damage and applies full damage bars rounded down', async () => {
      const target = new DCCActor({
        name: 'Goblin Grunt',
        type: 'npc',
        system: {
          attributes: {
            hp: { value: 30, max: 30, temp: 0 },
            dr: { total: 4 }
          }
        }
      });

      const res = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 14,
        ignoreDR: false
      });

      // 14 raw - 4 DR = 10 damage after DR
      // With max HP 30, each bar has 3 HP (30 / 10 = 3)
      // 10 / 3 = 3 full bars removed (9 HP damage), 1 excess damage ignored
      assert.equal(res.rawDamage, 14);
      assert.equal(res.dr, 4);
      assert.equal(res.damageAfterDR, 10);
      assert.equal(res.hpPerBar, 3);
      assert.equal(res.barsRemoved, 3);
      assert.equal(res.excessDamage, 1);
      assert.equal(res.actualDamage, 9);
      assert.equal(target.system.attributes.hp.value, 21);
    });

    await sub.test('absorbs damage using Temp HP first then deducts remainder from regular HP in full bars', async () => {
      const target = new DCCActor({
        name: 'Shielded Crawler',
        type: 'crawler',
        system: {
          attributes: {
            hp: { value: 40, max: 40, temp: 10 },
            dr: { total: 0 }
          }
        }
      });

      // 15 damage: 10 absorbed by temp HP, 5 penetrates to regular HP
      // With max HP 40 (4 HP per bar): 5 / 4 = 1 bar removed (4 HP), 1 excess ignored
      const res = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 15
      });

      assert.equal(res.tempDamage, 10);
      assert.equal(res.barsRemoved, 1);
      assert.equal(res.damageToHp, 4);
      assert.equal(res.excessDamage, 1);
      assert.equal(res.actualDamage, 14); // 10 temp + 4 hp
      assert.equal(target.system.attributes.hp.temp, 0);
      assert.equal(target.system.attributes.hp.value, 36);
    });

    await sub.test('respects ignoreDR flag and applies full raw damage in full bars', async () => {
      const target = new DCCActor({
        name: 'Armored Boss',
        type: 'npc',
        system: {
          attributes: {
            hp: { value: 50, max: 50, temp: 0 },
            dr: { total: 8 }
          }
        }
      });

      const res = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 12,
        ignoreDR: true
      });

      // 12 raw, DR ignored -> 12 damage after DR
      // With max HP 50 (5 HP per bar): 12 / 5 = 2 bars removed (10 HP), 2 excess ignored
      assert.equal(res.dr, 0);
      assert.equal(res.damageAfterDR, 12);
      assert.equal(res.hpPerBar, 5);
      assert.equal(res.barsRemoved, 2);
      assert.equal(res.excessDamage, 2);
      assert.equal(res.actualDamage, 10);
      assert.equal(target.system.attributes.hp.value, 40);
    });

    await sub.test('respects multipliers (0.5 for half, 2 for crit) with bar rounding', async () => {
      const target = new DCCActor({
        name: 'Training Dummy',
        type: 'npc',
        system: {
          attributes: {
            hp: { value: 60, max: 60, temp: 0 },
            dr: { total: 2 }
          }
        }
      });

      // Half: 15 * 0.5 = 7 raw - 2 DR = 5 net damage
      // Max 60 -> 6 HP per bar. 5 < 6 -> 0 bars removed, 5 excess ignored!
      const halfRes = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 15,
        multiplier: 0.5
      });
      assert.equal(halfRes.barsRemoved, 0);
      assert.equal(halfRes.excessDamage, 5);
      assert.equal(target.system.attributes.hp.value, 60);

      // Crit: 10 * 2 = 20 raw - 2 DR = 18 net damage
      // 18 / 6 = 3 bars removed (18 HP damage), 0 excess ignored
      const critRes = await DCCCombatMetrics.applyDamageToTarget({
        targetActor: target,
        rawDamage: 10,
        multiplier: 2
      });
      assert.equal(critRes.barsRemoved, 3);
      assert.equal(critRes.actualDamage, 18);
      assert.equal(target.system.attributes.hp.value, 42);
    });
  });

  await t.test('2. Scoped Combat Tracking & Metrics Attribution', async (sub) => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { hp: { value: 40, max: 40 }, aiFavor: 5 }
      }
    });
    crawler.id = 'crawler-carl-1';

    const enemy = new DCCActor({
      name: 'Ruffian',
      type: 'npc',
      system: {
        attributes: { hp: { value: 20, max: 20 }, dr: { total: 2 } }
      }
    });
    enemy.id = 'enemy-ruffian-1';

    const combat = new MockCombat({
      id: 'combat-floor-1',
      combatants: [
        new MockCombatant({ actorId: crawler.id, actor: crawler }),
        new MockCombatant({ actorId: enemy.id, actor: enemy })
      ]
    });

    // Set as active combat in global game
    globalThis.game.combat = combat;
    globalThis.game.combats = [combat];
    globalThis.game.combats.get = (id) => (id === combat.id ? combat : null);

    await sub.test('records attack name, type, and damage into combat flags', async () => {
      // 12 raw - 2 DR = 10 net damage with Pugilism
      await DCCCombatMetrics.applyDamageToTarget({
        combat,
        attackerActor: crawler,
        targetActor: enemy,
        rawDamage: 12,
        attackName: 'Pugilism',
        attackType: 'Melee'
      });

      const metrics = DCCCombatMetrics.getMetrics(combat);
      assert.ok(metrics[crawler.id]);
      assert.equal(metrics[crawler.id].totalDamage, 10);
      assert.equal(metrics[crawler.id].highestHit, 10);
      assert.equal(metrics[crawler.id].attacks['Pugilism'].count, 1);
      assert.equal(metrics[crawler.id].attacks['Pugilism'].damage, 10);
      assert.equal(metrics[crawler.id].attacks['Pugilism'].type, 'Melee');
    });

    await sub.test('accumulates multiple attacks and updates highest hit', async () => {
      // Second attack with Magic Missile: 22 raw - 2 DR = 20 net damage
      await DCCCombatMetrics.applyDamageToTarget({
        combat,
        attackerActor: crawler,
        targetActor: enemy,
        rawDamage: 22,
        attackName: 'Magic Missile',
        attackType: 'Spell'
      });

      const metrics = DCCCombatMetrics.getMetrics(combat);
      assert.equal(metrics[crawler.id].totalDamage, 30); // 10 + 20
      assert.equal(metrics[crawler.id].highestHit, 20);
      assert.equal(metrics[crawler.id].attacks['Pugilism'].count, 1);
      assert.equal(metrics[crawler.id].attacks['Magic Missile'].count, 1);
      assert.equal(metrics[crawler.id].attacks['Magic Missile'].damage, 20);
    });

    await sub.test('records kill count when target HP drops to 0 or below', async () => {
      assert.equal(enemy.system.attributes.hp.value, 0); // reduced to 0 by 30 damage
      const metrics = DCCCombatMetrics.getMetrics(combat);
      assert.equal(metrics[crawler.id].kills, 1);
    });
  });

  await t.test('3. Multi-Combat Isolation', async (sub) => {
    const crawler = new DCCActor({ name: 'Donut', type: 'crawler' });
    crawler.id = 'crawler-donut-1';

    const target1 = new DCCActor({ name: 'Llama 1', type: 'npc', system: { attributes: { hp: { value: 30 } } } });
    const target2 = new DCCActor({ name: 'Llama 2', type: 'npc', system: { attributes: { hp: { value: 30 } } } });

    const combatA = new MockCombat({
      id: 'combat-a',
      combatants: [new MockCombatant({ actorId: crawler.id, actor: crawler })]
    });
    const combatB = new MockCombat({
      id: 'combat-b',
      combatants: [new MockCombatant({ actorId: crawler.id, actor: crawler })]
    });

    await DCCCombatMetrics.applyDamageToTarget({
      combat: combatA,
      attackerActor: crawler,
      targetActor: target1,
      rawDamage: 15,
      attackName: 'Screaming Fireball'
    });

    await DCCCombatMetrics.applyDamageToTarget({
      combat: combatB,
      attackerActor: crawler,
      targetActor: target2,
      rawDamage: 25,
      attackName: 'Screaming Fireball'
    });

    const metricsA = DCCCombatMetrics.getMetrics(combatA);
    const metricsB = DCCCombatMetrics.getMetrics(combatB);

    assert.equal(metricsA[crawler.id].totalDamage, 15);
    assert.equal(metricsB[crawler.id].totalDamage, 25);
  });

  await t.test('4. Tactical Skill Tracking in Combat', async (sub) => {
    const crawler = new DCCActor({ name: 'Katia', type: 'crawler' });
    crawler.id = 'crawler-katia-1';

    const combat = new MockCombat({
      id: 'combat-skill-test',
      combatants: [new MockCombatant({ actorId: crawler.id, actor: crawler })]
    });

    globalThis.game.combat = combat;

    await DCCCombatMetrics.recordSkillUsage({
      combat,
      actor: crawler,
      skillName: 'Call a Play'
    });
    await DCCCombatMetrics.recordSkillUsage({
      combat,
      actor: crawler,
      skillName: 'Call a Play'
    });
    await DCCCombatMetrics.recordSkillUsage({
      combat,
      actor: crawler,
      skillName: 'Trip'
    });

    const metrics = DCCCombatMetrics.getMetrics(combat);
    assert.equal(metrics[crawler.id].skills['Call a Play'], 2);
    assert.equal(metrics[crawler.id].skills['Trip'], 1);
  });

  await t.test('5. Manual Damage Adjustment & Reset', async (sub) => {
    const crawler = new DCCActor({ name: 'Mordecai', type: 'crawler' });
    crawler.id = 'crawler-mordecai-1';

    const combat = new MockCombat({
      id: 'combat-adjust-test',
      combatants: [new MockCombatant({ actorId: crawler.id, actor: crawler })]
    });

    // Manually add 15 damage
    await DCCCombatMetrics.adjustDamage(combat, crawler.id, 15);
    let metrics = DCCCombatMetrics.getMetrics(combat);
    assert.equal(metrics[crawler.id].totalDamage, 15);

    // Subtract 5
    await DCCCombatMetrics.adjustDamage(combat, crawler.id, -5);
    metrics = DCCCombatMetrics.getMetrics(combat);
    assert.equal(metrics[crawler.id].totalDamage, 10);

    // Reset metrics
    await DCCCombatMetrics.resetMetrics(combat);
    metrics = DCCCombatMetrics.getMetrics(combat);
    assert.deepEqual(metrics, {});
  });

  await t.test('6. AI Awards Dispatcher & AI Favor Updates', async (sub) => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { aiFavor: 10 }
      }
    });
    crawler.id = 'crawler-carl-award';

    // Dispatch AI Favor (+5)
    let postedMessage = null;
    globalThis.ChatMessage.create = async (msg) => {
      postedMessage = msg;
      return msg;
    };

    await DCCCombatMetrics.dispatchAIAward({
      recipientActor: crawler,
      awardType: 'favor',
      favorAmount: 5,
      customQuote: 'Keep breaking things, Carl.'
    });

    // AI Favor updated on crawler (10 -> 15)
    assert.equal(crawler.system.attributes.aiFavor, 15);
    assert.ok(postedMessage);
    assert.equal(postedMessage.speaker.alias, 'THE DUNGEON AI');
    assert.ok(postedMessage.content.includes('AI FAVOR GRANTED (+5)'));
    assert.ok(postedMessage.content.includes('Keep breaking things, Carl.'));

    // Dispatch Bronze Loot Box
    await DCCCombatMetrics.dispatchAIAward({
      recipientActor: crawler,
      awardType: 'bronze'
    });
    assert.ok(postedMessage.content.includes('BRONZE LOOT BOX DISPATCHED'));
    assert.ok(postedMessage.content.includes('1x Bronze Loot Box'));

    // Dispatch Platinum Loot Box
    await DCCCombatMetrics.dispatchAIAward({
      recipientActor: crawler,
      awardType: 'platinum'
    });
    assert.ok(postedMessage.content.includes('PLATINUM LOOT BOX DISPATCHED'));
    assert.ok(postedMessage.content.includes('1x Platinum Loot Box'));

    // Dispatch Legendary Loot Box
    await DCCCombatMetrics.dispatchAIAward({
      recipientActor: crawler,
      awardType: 'legendary'
    });
    assert.ok(postedMessage.content.includes('LEGENDARY LOOT BOX DISPATCHED'));
    assert.ok(postedMessage.content.includes('1x Legendary Loot Box'));
  });

  await t.test('7. DCCCombatMetricsApp getData Aggregation and Sorting', async (sub) => {
    const crawlerA = new DCCActor({ name: 'Alpha', type: 'crawler', system: { details: { level: 3 }, attributes: { aiFavor: 2 } } });
    crawlerA.id = 'actor-alpha';
    const crawlerB = new DCCActor({ name: 'Beta', type: 'crawler', system: { details: { level: 2 }, attributes: { aiFavor: 4 } } });
    crawlerB.id = 'actor-beta';

    const combat = new MockCombat({
      id: 'combat-ui-test',
      round: 3,
      combatants: [
        new MockCombatant({ actorId: crawlerA.id, actor: crawlerA }),
        new MockCombatant({ actorId: crawlerB.id, actor: crawlerB })
      ]
    });

    // Give Alpha 10 dmg and Beta 40 dmg
    await combat.setFlag('carl-rpg', 'metrics', {
      [crawlerA.id]: {
        totalDamage: 10,
        highestHit: 10,
        kills: 0,
        attacks: { 'Stab': { count: 1, damage: 10, type: 'Melee' } },
        skills: {}
      },
      [crawlerB.id]: {
        totalDamage: 40,
        highestHit: 25,
        kills: 2,
        attacks: { 'Bomb': { count: 2, damage: 40, type: 'Ranged' } },
        skills: { 'Throw': 2 }
      }
    });

    globalThis.game.combat = combat;
    globalThis.game.combats = [combat];
    globalThis.game.combats.get = (id) => (id === combat.id ? combat : null);

    const app = new DCCCombatMetricsApp({ combatId: combat.id });
    const data = await app.getData();

    assert.equal(data.hasCombat, true);
    assert.equal(data.round, 3);
    assert.equal(data.crawlers.length, 2);

    // Sorted descending by total damage: Beta (40) should be first, Alpha (10) second
    assert.equal(data.crawlers[0].name, 'Beta');
    assert.equal(data.crawlers[0].totalDamage, 40);
    assert.equal(data.crawlers[0].attacks[0].avg, 20); // 40 / 2
    assert.equal(data.crawlers[0].skills[0].name, 'Throw');

    assert.equal(data.crawlers[1].name, 'Alpha');
    assert.equal(data.crawlers[1].totalDamage, 10);
  });
});
