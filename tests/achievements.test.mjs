import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import './setup.mjs';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCC_ACHIEVEMENTS, DCC_ACHIEVEMENT_TIERS } from '../src/data/achievements.mjs';
import { DCCAchievementManagerApp } from '../src/apps/achievement-manager.mjs';
import { DCCCombatMetrics, DCCCombatMetricsApp } from '../src/apps/combat-metrics.mjs';
import { DCCSessionEngine } from '../src/apps/session-manager.mjs';

test('DCC RPG — Crawler Achievements Subsystem Suite', async (t) => {

  await t.test('1. Schema & System Manifest Validation', async () => {
    // Validate template.json
    const templatePath = path.resolve('template.json');
    const templateJson = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

    assert.ok(templateJson.Item.types.includes('achievement'), 'template.json Item.types must include achievement');
    assert.ok(templateJson.Item.achievement, 'template.json must define achievement item schema');
    assert.equal(typeof templateJson.Item.achievement.quote, 'string');
    assert.equal(typeof templateJson.Item.achievement.reward, 'string');
    assert.equal(templateJson.Item.achievement.tier, 'bronze');

    // Validate system.json
    const systemPath = path.resolve('system.json');
    const systemJson = JSON.parse(fs.readFileSync(systemPath, 'utf8'));

    assert.ok(systemJson.version >= '2.0.28', 'system.json version must be at least 2.0.28');
    assert.ok(systemJson.documentTypes.Item.achievement, 'system.json documentTypes.Item must register achievement');
    assert.ok(Array.isArray(systemJson.documentTypes.Item.achievement.htmlFields));
    assert.ok(systemJson.documentTypes.Item.achievement.htmlFields.includes('quote'));
  });

  await t.test('2. Canonical Achievements Library Integrity', async () => {
    assert.ok(Array.isArray(DCC_ACHIEVEMENTS), 'DCC_ACHIEVEMENTS must be an array');
    assert.ok(DCC_ACHIEVEMENTS.length >= 8, 'DCC_ACHIEVEMENTS must have canonical presets');

    // Check iconic achievements from the book & GM toolkit
    const peepers = DCC_ACHIEVEMENTS.find(a => a.name.includes("Where’d Ya Get Those Peepers?"));
    assert.ok(peepers, 'Must contain "Where’d Ya Get Those Peepers?" from Passive (Aggressive) Perception quest');
    assert.equal(peepers.system.reward, 'Bronze Apparel Box');
    assert.ok(peepers.system.quote.includes('Bugaboo Socket-Picker'));

    const dingDong = DCC_ACHIEVEMENTS.find(a => a.name.includes('Ding-Dong Ditch'));
    assert.ok(dingDong, 'Must contain "Ding-Dong Ditch"');
    assert.equal(dingDong.system.reward, 'Silver Anarchist Box');

    const mvp = DCC_ACHIEVEMENTS.find(a => a.name.includes('Floor Combat MVP'));
    assert.ok(mvp, 'Must contain Floor Combat MVP');
    assert.equal(mvp.system.tier, 'gold');
    assert.equal(mvp.system.favor, 3);

    // Verify tier definitions
    assert.ok(DCC_ACHIEVEMENT_TIERS.bronze);
    assert.ok(DCC_ACHIEVEMENT_TIERS.silver);
    assert.ok(DCC_ACHIEVEMENT_TIERS.gold);
    assert.ok(DCC_ACHIEVEMENT_TIERS.platinum);
    assert.ok(DCC_ACHIEVEMENT_TIERS.legendary);
    assert.ok(DCC_ACHIEVEMENT_TIERS.celestial);
    assert.equal(DCC_ACHIEVEMENT_TIERS.gold.color, '#f1c40f');
  });

  await t.test('3. DCCActor & DCCItem Achievement Document Integration', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { aiFavor: 5 },
        details: { floor: '3rd Floor' }
      }
    });

    const achItem = new DCCItem({
      id: 'test-ach-1',
      name: 'Boss Annihilator',
      type: 'achievement',
      system: {
        tier: 'celestial',
        quote: 'Floor-shaking performance. You earned this, crawler.',
        reward: '1x Celestial Boss Loot Box',
        rewardContents: 'Doomsday Weapon',
        floor: '3rd Floor',
        favor: 5,
        xp: 1000
      }
    }, actor);

    actor.items = [achItem];

    // getAchievements()
    const collected = actor.getAchievements();
    assert.equal(collected.length, 1);
    assert.equal(collected[0].name, 'Boss Annihilator');

    // announceAchievement()
    const chatMsg = await actor.announceAchievement(achItem);
    assert.ok(chatMsg, 'Chat message must be created');
    assert.equal(chatMsg.speaker.alias, 'THE DUNGEON AI');
    assert.ok(chatMsg.content.includes('NEW ACHIEVEMENT UNLOCKED!'));
    assert.ok(chatMsg.content.includes('Boss Annihilator'));
    assert.ok(chatMsg.content.includes('1x Celestial Boss Loot Box'));
    assert.ok(chatMsg.content.includes('Floor-shaking performance'));
    assert.ok(chatMsg.flags['carl-rpg'].isAchievement);

    // item.announce()
    const itemChatMsg = await achItem.announce();
    assert.ok(itemChatMsg, 'Item announce() must trigger actor.announceAchievement');
    assert.equal(itemChatMsg.speaker.alias, 'THE DUNGEON AI');
  });

  await t.test('4. DCCCrawlerSheet Context & Statistics Computation', async () => {
    const actor = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        details: { floor: '1st Floor' }
      }
    });

    actor.items = [
      new DCCItem({
        id: 'ach-1',
        name: 'First Blood',
        type: 'achievement',
        system: { tier: 'bronze', favor: 1, xp: 50, reward: 'Bronze Box' }
      }, actor),
      new DCCItem({
        id: 'ach-2',
        name: 'Ding-Dong Ditch',
        type: 'achievement',
        system: { tier: 'silver', favor: 2, xp: 150, reward: 'Silver Box' }
      }, actor),
      new DCCItem({
        id: 'ach-3',
        name: 'Floor Combat MVP',
        type: 'achievement',
        system: { tier: 'gold', favor: 3, xp: 300, reward: 'Gold Box' }
      }, actor)
    ];

    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.achievements), 'context.achievements must be an array');
    assert.equal(context.achievements.length, 3);
    assert.equal(context.achievementStats.total, 3);
    assert.equal(context.achievementStats.byTier.bronze, 1);
    assert.equal(context.achievementStats.byTier.silver, 1);
    assert.equal(context.achievementStats.byTier.gold, 1);
    assert.equal(context.achievementStats.totalFavor, 6);
    assert.equal(context.achievementStats.totalXP, 500);

    // Check formatted tier styling on items
    const goldAch = context.achievements.find(a => a.name === 'Floor Combat MVP');
    assert.equal(goldAch.tierColor, '#f1c40f');
    assert.equal(goldAch.tierLabel, 'Gold');
    assert.equal(goldAch.tierIcon, 'fa-solid fa-trophy');
  });

  await t.test('5. Combat Metrics Award Creates Persistent Achievement on Recipient Crawler', async () => {
    const crawler = new DCCActor({
      id: 'crawler-recipient-1',
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: { aiFavor: 2 },
        details: { floor: '2nd Floor' }
      }
    });
    crawler.items = [];

    globalThis.game.actors = [crawler];
    globalThis.game.actors.get = id => (id === crawler.id ? crawler : null);

    // Mock createEmbeddedDocuments
    crawler.createEmbeddedDocuments = async (docType, docs) => {
      const created = docs.map(d => new DCCItem(d, crawler));
      crawler.items.push(...created);
      return created;
    };

    const mockCombat = {
      id: 'combat-123',
      metrics: {},
      setFlag: async (scope, key, val) => {
        mockCombat.metrics = val;
      }
    };

    // Award MVP to crawler via DCCCombatMetrics.dispatchAIAward
    await DCCCombatMetrics.dispatchAIAward({
      combat: mockCombat,
      recipientActor: crawler,
      awardType: 'mvp',
      customQuote: 'Unbelievable destruction!',
      favorAmount: 3
    });

    // Verify achievement item was created on the crawler
    assert.equal(crawler.items.length, 1);
    const createdAch = crawler.items[0];
    assert.equal(createdAch.type, 'achievement');
    assert.equal(createdAch.name, 'FLOOR COMBAT MVP AWARD');
    assert.equal(createdAch.system.tier, 'gold');
    assert.equal(createdAch.system.quote, 'Unbelievable destruction!');
    assert.equal(createdAch.system.favor, 3);
    assert.equal(crawler.system.attributes.aiFavor, 5);
  });

  await t.test('6. Session Engine recordLootBox Persists Achievement Item on Crawler', async () => {
    const crawler = new DCCActor({
      id: 'session-crawler-1',
      name: 'Katia',
      type: 'crawler',
      system: {
        attributes: { aiFavor: 0 },
        details: { floor: '1st Floor' }
      }
    });
    crawler.items = [];

    globalThis.game.actors = [crawler];
    globalThis.game.actors.get = id => (id === crawler.id ? crawler : null);

    crawler.createEmbeddedDocuments = async (docType, docs) => {
      const created = docs.map(d => new DCCItem(d, crawler));
      crawler.items.push(...created);
      return created;
    };

    // Setup active session
    await DCCSessionEngine.createSession({ number: 5, title: 'Session 5' });
    const active = await DCCSessionEngine.getActiveSession();
    await DCCSessionEngine.setActiveSessionId(active.id);

    await DCCSessionEngine.recordLootBox({
      actorId: crawler.id,
      tier: 'platinum',
      title: 'PLATINUM LOOT BOX',
      defaultQuote: 'Look at moneybags over here.'
    });

    const ach = crawler.items.find(i => i.type === 'achievement');
    assert.ok(ach, 'recordLootBox must create achievement item on crawler actor');
    assert.equal(ach.name, 'PLATINUM LOOT BOX');
    assert.equal(ach.system.tier, 'platinum');
    assert.equal(ach.system.reward, '1x PLATINUM Loot Box');
  });

  await t.test('7. DCCAchievementManagerApp Library Browsing & Awarding', async () => {
    const crawler1 = new DCCActor({
      id: 'c1',
      name: 'Carl',
      type: 'crawler',
      system: { attributes: { aiFavor: 0 }, details: { floor: '1st Floor', xp: { value: 0 } } }
    });
    crawler1.items = [];
    crawler1.createEmbeddedDocuments = async (docType, docs) => {
      const created = docs.map(d => new DCCItem(d, crawler1));
      crawler1.items.push(...created);
      return created;
    };

    const crawler2 = new DCCActor({
      id: 'c2',
      name: 'Donut',
      type: 'crawler',
      system: { attributes: { aiFavor: 4 }, details: { floor: '1st Floor', xp: { value: 200 } } }
    });
    crawler2.items = [];

    globalThis.game.actors = [crawler1, crawler2];
    globalThis.game.actors.filter = fn => [crawler1, crawler2].filter(fn);
    globalThis.game.actors.get = id => (id === 'c1' ? crawler1 : (id === 'c2' ? crawler2 : null));

    const app = new DCCAchievementManagerApp({ actor: crawler1 });
    const context = await app.getData();

    assert.equal(context.crawlers.length, 2);
    assert.ok(context.libraryAchievements.length >= 8);
    assert.equal(context.partyData.length, 2);

    // Test filtering library by tier
    app.selectedTier = 'gold';
    const goldContext = await app.getData();
    assert.ok(goldContext.libraryAchievements.length >= 1);
    assert.ok(goldContext.libraryAchievements.every(a => a.system.tier === 'gold'));

    // Test awarding achievement via manager
    const targetPreset = DCC_ACHIEVEMENTS.find(a => a.name.includes("Where’d Ya Get Those Peepers?"));
    assert.ok(targetPreset);

    const awarded = await app.grantAchievement('c1', targetPreset);
    assert.ok(awarded);
    assert.equal(crawler1.items.length, 1);
    assert.equal(crawler1.items[0].name, targetPreset.name);
    assert.equal(crawler1.system.attributes.aiFavor, 1);
    assert.equal(crawler1.system.details.xp.value, 100);
  });

});
