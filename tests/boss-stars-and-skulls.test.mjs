import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import {
  DCCActor,
  DCC_BOSS_TIERS,
  getBossTierFromClassification
} from '../src/documents/actor.mjs';
import { DCCCombat } from '../src/documents/combat.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { DCCCombatTracker } from '../src/apps/combat-tracker.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

test('DCC RPG - Boss Stars & Crawler Skulls Public Notoriety', async (suite) => {
  CONFIG.Actor.documentClass = DCCActor;
  await suite.test('1. Boss Level & Color-Coded Star Tiers Hierarchy', () => {
    // Verify all 6 canonical DCC Boss tiers
    assert.ok(DCC_BOSS_TIERS.bronze, 'Bronze tier must exist');
    assert.equal(DCC_BOSS_TIERS.bronze.bossLevel, 'Neighborhood Boss');
    assert.equal(DCC_BOSS_TIERS.bronze.color, '#cd7f32');
    assert.equal(DCC_BOSS_TIERS.bronze.cssClass, 'star-bronze');

    assert.ok(DCC_BOSS_TIERS.silver, 'Silver tier must exist');
    assert.equal(DCC_BOSS_TIERS.silver.bossLevel, 'Borough Boss');
    assert.equal(DCC_BOSS_TIERS.silver.color, '#dcdde1');
    assert.equal(DCC_BOSS_TIERS.silver.cssClass, 'star-silver');

    assert.ok(DCC_BOSS_TIERS.gold, 'Gold tier must exist');
    assert.equal(DCC_BOSS_TIERS.gold.bossLevel, 'City Boss');
    assert.equal(DCC_BOSS_TIERS.gold.color, '#f1c40f');
    assert.equal(DCC_BOSS_TIERS.gold.cssClass, 'star-gold');

    assert.ok(DCC_BOSS_TIERS.platinum, 'Platinum tier must exist');
    assert.equal(DCC_BOSS_TIERS.platinum.bossLevel, 'Country Boss');
    assert.equal(DCC_BOSS_TIERS.platinum.color, '#00d2d3');
    assert.equal(DCC_BOSS_TIERS.platinum.cssClass, 'star-platinum');

    assert.ok(DCC_BOSS_TIERS.legendary, 'Legendary tier must exist');
    assert.equal(DCC_BOSS_TIERS.legendary.bossLevel, 'Floor Boss');
    assert.equal(DCC_BOSS_TIERS.legendary.color, '#e67e22');
    assert.equal(DCC_BOSS_TIERS.legendary.cssClass, 'star-legendary');

    assert.ok(DCC_BOSS_TIERS.celestial, 'Celestial tier must exist');
    assert.equal(DCC_BOSS_TIERS.celestial.bossLevel, 'Dungeon Boss');
    assert.equal(DCC_BOSS_TIERS.celestial.color, '#9b59b6');
    assert.equal(DCC_BOSS_TIERS.celestial.cssClass, 'star-celestial');

    // Classification mapping logic
    assert.equal(getBossTierFromClassification('Neighborhood Boss'), 'bronze');
    assert.equal(getBossTierFromClassification('neighborhood'), 'bronze');
    assert.equal(getBossTierFromClassification('Borough Boss'), 'silver');
    assert.equal(getBossTierFromClassification('Burrough Boss'), 'silver');
    assert.equal(getBossTierFromClassification('borough'), 'silver');
    assert.equal(getBossTierFromClassification('City Boss'), 'gold');
    assert.equal(getBossTierFromClassification('city guardian'), 'gold');
    assert.equal(getBossTierFromClassification('Country Boss'), 'platinum');
    assert.equal(getBossTierFromClassification('country tyrant'), 'platinum');
    assert.equal(getBossTierFromClassification('Floor Boss'), 'legendary');
    assert.equal(getBossTierFromClassification('floor staircase guardian'), 'legendary');
    assert.equal(getBossTierFromClassification('Dungeon Boss'), 'celestial');
    assert.equal(getBossTierFromClassification('dungeon sovereign deity'), 'celestial');
    assert.equal(getBossTierFromClassification('Generic Mob Boss'), 'bronze');
  });

  await suite.test('2. getBadgeSummary Formats 9 Boss Stars & Crawler Skulls', async () => {
    const crawler = await DCCActor.create({
      name: 'Carl',
      type: 'crawler',
      system: {
        trophies: {
          bosses: {
            bronze: 2,      // 2 Neighborhood
            silver: 2,      // 2 Borough
            gold: 2,        // 2 City
            platinum: 1,    // 1 Country
            legendary: 1,   // 1 Floor
            celestial: 1    // 1 Dungeon -> Total 9 Boss Stars!
          },
          crawlers: { count: 3 }
        }
      }
    });

    const summary = crawler.getBadgeSummary();
    assert.equal(summary.totalBossKills, 9, 'Should have exactly 9 total boss stars');
    assert.equal(summary.crawlerKills, 3, 'Should have exactly 3 crawler skulls');
    assert.equal(summary.hasBadges, true);
    assert.equal(summary.stars.length, 9);
    assert.equal(summary.skulls.length, 3);

    // Verify star sorting: Celestial down to Bronze
    const starTiers = summary.stars.map(s => s.tier);
    assert.deepEqual(starTiers, [
      'celestial',
      'legendary',
      'platinum',
      'gold', 'gold',
      'silver', 'silver',
      'bronze', 'bronze'
    ]);

    // HTML strip must contain colored star elements and skulls
    assert.ok(summary.html.includes('star-celestial'));
    assert.ok(summary.html.includes('star-legendary'));
    assert.ok(summary.html.includes('star-platinum'));
    assert.ok(summary.html.includes('star-gold'));
    assert.ok(summary.html.includes('star-silver'));
    assert.ok(summary.html.includes('star-bronze'));
    assert.ok(summary.html.includes('crawler-skull'));
    assert.ok(summary.html.includes('dcc-badge-strip'));

    // Text representation for overhead token names
    assert.equal(summary.text, '★★★★★★★★★ 💀💀💀');
    assert.ok(summary.fullTooltip.includes('9 Boss Stars'));
    assert.ok(summary.fullTooltip.includes('3 Crawler Kills'));
  });

  await suite.test('3. recordBossKill & recordCrawlerKill Updates Counts & Logs', async () => {
    const crawler = await DCCActor.create({
      name: 'Donut',
      type: 'crawler',
      system: {
        trophies: {
          bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
          bossLog: [],
          crawlers: { count: 0 },
          crawlerLog: []
        }
      }
    });

    // Record a Floor Boss Kill
    const bossKill = await crawler.recordBossKill({
      name: 'Gravekeeper Vane',
      tier: 'Floor Boss',
      floor: '3rd Floor'
    });

    assert.equal(crawler.system.trophies.bosses.legendary, 1);
    assert.equal(crawler.system.trophies.bossLog.length, 1);
    assert.equal(crawler.system.trophies.bossLog[0].name, 'Gravekeeper Vane');
    assert.equal(crawler.system.trophies.bossLog[0].tier, 'legendary');
    assert.equal(crawler.system.trophies.bossLog[0].bossLevel, 'Floor Boss');

    // Record a Crawler Kill
    const crawlerKill = await crawler.recordCrawlerKill({
      name: 'Bucky',
      crawlerNumber: '#9941',
      floor: '3rd Floor'
    });

    assert.equal(crawler.system.trophies.crawlers.count, 1);
    assert.equal(crawler.system.trophies.crawlerLog.length, 1);
    assert.equal(crawler.system.trophies.crawlerLog[0].name, 'Bucky');
    assert.equal(crawler.system.trophies.crawlerLog[0].crawlerNumber, '#9941');

    // Verify deletion functionality
    await crawler.removeBossKill(bossKill.id);
    assert.equal(crawler.system.trophies.bosses.legendary, 0);
    assert.equal(crawler.system.trophies.bossLog.length, 0);

    await crawler.removeCrawlerKill(crawlerKill.id);
    assert.equal(crawler.system.trophies.crawlers.count, 0);
    assert.equal(crawler.system.trophies.crawlerLog.length, 0);
  });

  await suite.test('4. Automated Combat Lethal Damage Awards Star to Crawler on Boss Kill', async () => {
    const crawler = await DCCActor.create({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 } },
        trophies: {
          bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
          bossLog: [],
          crawlers: { count: 0 },
          crawlerLog: []
        }
      }
    });

    const bossMob = await DCCActor.create({
      name: 'Juicer the Blood-Bather',
      type: 'mob',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: { value: 8, max: 40, temp: 0, hpPerBar: 4 },
          dr: { total: 0 }
        },
        details: {
          classification: 'City Boss',
          floor: '2nd Floor'
        }
      }
    });

    // Apply lethal damage to boss mob
    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: bossMob,
      rawDamage: 12, // More than 8 HP
      attackerActor: crawler
    });

    assert.equal(bossMob.system.attributes.hp.value, 0, 'Boss HP should drop to 0');
    assert.equal(crawler.system.trophies.bosses.gold, 1, 'Crawler should be awarded Gold Star');
    assert.equal(crawler.system.trophies.bossLog.length, 1);
    assert.equal(crawler.system.trophies.bossLog[0].name, 'Juicer the Blood-Bather');
  });

  await suite.test('5. Automated Combat Lethal Damage Awards Skull to Crawler on Crawler Kill', async () => {
    const killer = await DCCActor.create({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 } },
        trophies: {
          bosses: { bronze: 0, silver: 0, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
          bossLog: [],
          crawlers: { count: 0 },
          crawlerLog: []
        }
      }
    });

    const victim = await DCCActor.create({
      name: 'Rival Crawler Frank',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: {
          hp: { value: 4, max: 40, temp: 0, hpPerBar: 4 },
          dr: { total: 0 }
        },
        details: {
          crawlerNumber: '#7733',
          floor: '4th Floor'
        }
      }
    });

    await DCCCombatMetrics.applyDamageToTarget({
      targetActor: victim,
      rawDamage: 8,
      attackerActor: killer
    });

    assert.equal(victim.system.attributes.hp.value, 0, 'Victim HP should drop to 0');
    assert.equal(killer.system.trophies.crawlers.count, 1, 'Killer should be awarded 1 Skull');
    assert.equal(killer.system.trophies.crawlerLog.length, 1);
    assert.equal(killer.system.trophies.crawlerLog[0].name, 'Rival Crawler Frank');
    assert.equal(killer.system.trophies.crawlerLog[0].crawlerNumber, '#7733');
  });

  await suite.test('6. Combat Tracker Enriches Combatants with trophyBadges', async () => {
    const crawler = await DCCActor.create({
      name: 'Katya',
      type: 'crawler',
      system: {
        abilities: { con: { value: 10, mod: 4 } },
        attributes: { hp: { value: 40, max: 40, temp: 0 }, aiFavor: 2 },
        trophies: {
          bosses: { bronze: 1, silver: 0, gold: 1, platinum: 0, legendary: 0, celestial: 0 },
          crawlers: { count: 1 }
        }
      }
    });

    const mockCombatant = {
      id: 'cbt-katya',
      actorId: crawler.id,
      actor: crawler,
      name: crawler.name,
      img: 'icons/svg/mystery-man.svg',
      defeated: false
    };

    const combat = new DCCCombat({
      id: 'combat-trophy-test',
      round: 1,
      combatants: [mockCombatant],
      turns: [mockCombatant]
    });

    const tracker = new DCCCombatTracker();
    tracker.viewed = combat;

    const data = await tracker.getData();
    assert.ok(data.phases, 'Combat data should have phases');
    const crawlerPhase = data.phases.find(p => !p.isMob);
    assert.ok(crawlerPhase, 'Crawler phase must exist');
    assert.equal(crawlerPhase.turns.length, 1);

    const turn = crawlerPhase.turns[0];
    assert.ok(turn.trophyBadges, 'Turn should contain trophyBadges');
    assert.equal(turn.trophyBadges.totalBossKills, 2);
    assert.equal(turn.trophyBadges.crawlerKills, 1);
    assert.ok(turn.trophyBadges.html.includes('star-gold'));
    assert.ok(turn.trophyBadges.html.includes('star-bronze'));
    assert.ok(turn.trophyBadges.html.includes('crawler-skull'));
  });

  await suite.test('7. Crawler Sheet Prepares Trophies Context Data', async () => {
    const crawler = await DCCActor.create({
      name: 'Prepotente',
      type: 'crawler',
      system: {
        trophies: {
          bosses: { bronze: 3, silver: 1, gold: 0, platinum: 0, legendary: 0, celestial: 0 },
          bossLog: [
            { id: 'b1', name: 'Goblin Chief', tier: 'bronze', bossLevel: 'Neighborhood Boss', floor: '1st Floor', date: '2026-09-27' }
          ],
          crawlers: { count: 2 },
          crawlerLog: [
            { id: 'c1', name: 'Sneaky Petey', crawlerNumber: '#101', floor: '1st Floor', date: '2026-09-27' }
          ]
        }
      }
    });

    const sheet = new DCCCrawlerSheet(crawler);
    const context = await sheet._prepareContext();

    assert.ok(context.trophyBadges, 'trophyBadges should be prepared in sheet context');
    assert.equal(context.trophyBadges.totalBossKills, 4);
    assert.equal(context.trophyBadges.crawlerKills, 2);
    assert.equal(context.crawlerKillCount, 2);
    assert.equal(context.bossLog.length, 1);
    assert.equal(context.crawlerLog.length, 1);
    assert.equal(context.trophyTiers.length, 6);
  });

  await suite.test('8. onRenderChatMessage Enriches Message Sender with Badges', async () => {
    const crawler = await DCCActor.create({
      name: 'Carl',
      type: 'crawler',
      system: {
        trophies: {
          bosses: { bronze: 0, silver: 0, gold: 1, platinum: 0, legendary: 0, celestial: 0 },
          crawlers: { count: 1 }
        }
      }
    });

    // Ensure game.actors.get can retrieve crawler
    if (globalThis.game?.actors) {
      if (typeof globalThis.game.actors.set === 'function') {
        globalThis.game.actors.set(crawler.id, crawler);
      } else if (typeof globalThis.game.actors.get !== 'function') {
        globalThis.game.actors.get = (id) => id === crawler.id ? crawler : null;
      }
    }

    // Create mock DOM for chat message
    let appendedChild = null;
    const senderElem = {
      className: 'message-sender',
      dataset: {},
      querySelector: (sel) => null,
      appendChild: (el) => {
        appendedChild = el;
      }
    };

    const rootElem = {
      querySelectorAll: (sel) => {
        if (sel === '.message-sender, .message-header .sender') return [senderElem];
        return [];
      }
    };

    const message = {
      speaker: { actor: crawler.id }
    };

    onRenderChatMessage(message, rootElem, {});

    assert.ok(appendedChild, 'Sender element should have badge element appended');
    assert.ok(appendedChild.innerHTML.includes('star-gold'), 'Should render Gold Star');
    assert.ok(appendedChild.innerHTML.includes('crawler-skull'), 'Should render Crawler Skull');
  });
});
