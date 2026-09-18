import './setup.mjs';
import '../src/dcc.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor, getDCCStatModifier } from '../src/documents/actor.mjs';
import { MobDataModel } from '../src/models/actors/mob-model.mjs';
import { getHpPerBar, DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

describe('DCC RPG Mob Actor Subsystem', () => {
  describe('1. Mob Data Model Schema & Attributes', () => {
    test('MobDataModel defines required mob-specific schema fields including treasure and xp', () => {
      const mob = new DCCActor({
        name: 'Pack Rat',
        type: 'mob',
        system: {
          abilities: {
            str: { value: 1, unenhanced: 1 },
            int: { value: 2, unenhanced: 2 },
            con: { value: 3, unenhanced: 3 },
            dex: { value: 4, unenhanced: 4 },
            cha: { value: 1, unenhanced: 1 }
          },
          attributes: {
            treasure: 'Gnawed bone, 1d4 copper nibs',
            xp: 25,
            hp: { bars: 2, hpPerBar: 0 },
            surpriseDifficulty: '11+F',
            evadeDifficulty: '12+F'
          },
          details: {
            level: 2,
            classification: 'Mob',
            creatureType: 'Animal',
            floor: 'Floor 1 (Tutorial)',
            location: 'Prickly Pack Alleys'
          }
        }
      });

      assert.equal(mob.type, 'mob');
      assert.equal(mob.system.attributes.treasure, 'Gnawed bone, 1d4 copper nibs');
      assert.equal(mob.system.attributes.xp, 25);
      assert.equal(mob.system.details.classification, 'Mob');
      assert.equal(mob.system.details.creatureType, 'Animal');
      assert.equal(mob.system.details.floor, 'Floor 1 (Tutorial)');
      assert.equal(mob.system.details.location, 'Prickly Pack Alleys');
    });

    test('Regular crawler actors do NOT have mob treasure attribute by default', () => {
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: {
            con: { value: 14 }
          }
        }
      });

      assert.equal(crawler.type, 'crawler');
      assert.equal(crawler.system?.attributes?.treasure, undefined);
    });
  });

  describe('2. Independent Token Unlinking & Copy/Paste Isolation', () => {
    test('DCCActor._preCreate sets prototypeToken.actorLink to false and hostile disposition for mobs', async () => {
      const mob = new DCCActor({
        name: 'Goblin',
        type: 'mob'
      });
      await mob._preCreate({}, {}, 'user-1');

      assert.equal(mob.prototypeToken?.actorLink, false, 'Mob prototypeToken must be unlinked');
      assert.equal(mob.prototypeToken?.disposition, -1, 'Mob disposition must be hostile (-1)');
    });

    test('Mob prepareBaseData maintains prototypeToken.actorLink as false', () => {
      const mob = new DCCActor({
        name: 'Goblin',
        type: 'mob'
      });
      mob.prototypeToken = { actorLink: true };
      mob.prepareBaseData();

      assert.equal(mob.prototypeToken.actorLink, false, 'actorLink must be forced to false for mob');
    });

    test('Token copies on a scene are independent: modifying one does not affect the world actor or other copies', () => {
      const worldMob = new DCCActor({
        name: 'Goblin',
        type: 'mob',
        system: {
          abilities: { con: { value: 3, unenhanced: 3 } },
          attributes: { hp: { value: 4, max: 4, bars: 2, hpPerBar: 2 } }
        }
      });
      worldMob.prepareData();

      // Synthetic token actor 1
      const tokenActor1 = new DCCActor({
        name: 'Goblin 1',
        type: 'mob',
        system: {
          abilities: { con: { value: 3, unenhanced: 3 } },
          attributes: { hp: { value: 4, max: 4, bars: 2, hpPerBar: 2 } }
        }
      });
      tokenActor1.isToken = true;
      tokenActor1.prepareData();

      // Synthetic token actor 2
      const tokenActor2 = new DCCActor({
        name: 'Goblin 2',
        type: 'mob',
        system: {
          abilities: { con: { value: 3, unenhanced: 3 } },
          attributes: { hp: { value: 4, max: 4, bars: 2, hpPerBar: 2 } }
        }
      });
      tokenActor2.isToken = true;
      tokenActor2.prepareData();

      // Damage token 1
      tokenActor1.system.attributes.hp.value = 2;

      // Verify independence
      assert.equal(tokenActor1.system.attributes.hp.value, 2, 'Token 1 HP reduced');
      assert.equal(tokenActor2.system.attributes.hp.value, 4, 'Token 2 HP remains untouched');
      assert.equal(worldMob.system.attributes.hp.value, 4, 'World mob HP remains untouched');
    });
  });

  describe('3. Sequential Unique Token Naming on Scene Placement & Pasting', () => {
    test('preCreateToken hook assigns sequential numbering "Mob 1", "Mob 2", etc. on scene placement', () => {
      const registeredHooks = globalThis.Hooks?.events?.['preCreateToken'] || [];
      const preCreateTokenHook = registeredHooks.find(h => !h.once)?.fn;
      assert.ok(preCreateTokenHook, 'preCreateToken hook must be registered');

      const mobActor = new DCCActor({ type: 'mob', name: 'Pack Rat' });
      const mockScene = {
        tokens: []
      };

      // 1. First token added to scene
      const tokenDoc1 = {
        name: 'Pack Rat',
        actor: mobActor,
        actorLink: true, // will be forced to false
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tokenDoc1, {}, {}, 'user-1');
      assert.equal(tokenDoc1.name, 'Pack Rat 1');
      assert.equal(tokenDoc1.actorLink, false);
      mockScene.tokens.push(tokenDoc1);

      // 2. Second token added to scene
      const tokenDoc2 = {
        name: 'Pack Rat',
        actor: mobActor,
        actorLink: true,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tokenDoc2, {}, {}, 'user-1');
      assert.equal(tokenDoc2.name, 'Pack Rat 2');
      assert.equal(tokenDoc2.actorLink, false);
      mockScene.tokens.push(tokenDoc2);

      // 3. Third token created by copying/pasting "Pack Rat 2"
      const tokenDoc3 = {
        name: 'Pack Rat 2',
        actor: mobActor,
        actorLink: false,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tokenDoc3, {}, {}, 'user-1');
      assert.equal(tokenDoc3.name, 'Pack Rat 3', 'Pasting Pack Rat 2 increments to Pack Rat 3');
      mockScene.tokens.push(tokenDoc3);

      // 4. Fourth token added
      const tokenDoc4 = {
        name: 'Pack Rat',
        actor: mobActor,
        actorLink: false,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tokenDoc4, {}, {}, 'user-1');
      assert.equal(tokenDoc4.name, 'Pack Rat 4');
    });

    test('Different mob types on the same scene maintain distinct numbering sequences', () => {
      const registeredHooks = globalThis.Hooks?.events?.['preCreateToken'] || [];
      const preCreateTokenHook = registeredHooks.find(h => !h.once)?.fn;

      const goblinActor = new DCCActor({ type: 'mob', name: 'Goblin' });
      const ratActor = new DCCActor({ type: 'mob', name: 'Pack Rat' });
      const mockScene = {
        tokens: []
      };

      const tGoblin1 = {
        name: 'Goblin',
        actor: goblinActor,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tGoblin1, {}, {}, 'user-1');
      assert.equal(tGoblin1.name, 'Goblin 1');
      mockScene.tokens.push(tGoblin1);

      const tRat1 = {
        name: 'Pack Rat',
        actor: ratActor,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tRat1, {}, {}, 'user-1');
      assert.equal(tRat1.name, 'Pack Rat 1');
      mockScene.tokens.push(tRat1);

      const tGoblin2 = {
        name: 'Goblin',
        actor: goblinActor,
        parent: mockScene,
        updateSource(data) { Object.assign(this, data); }
      };
      preCreateTokenHook(tGoblin2, {}, {}, 'user-1');
      assert.equal(tGoblin2.name, 'Goblin 2');
    });
  });

  describe('4. Canonical Example Verification: Pack Rat (Mob)', () => {
    test('Pack Rat attributes, health bars, and combat values match GM Toolkit Page 32 specification', async () => {
      // Create Pack Rat according to official statblock:
      // Level 2 Mob, Tiny (1) Animal.
      // STR 1 (+1), INT 2 (+1), CON 3 (+2), DEX 4 (+2), CHA 1 (+1)
      // 2 Health Bar slots (2 HP each, total 4 Max HP)
      // Surprise Difficulty 11+F, Evade Difficulty 12+F, Move 20+S, DR 1
      const packRat = new DCCActor({
        name: 'Pack Rat',
        type: 'mob',
        system: {
          abilities: {
            str: { value: 1, unenhanced: 1 },
            int: { value: 2, unenhanced: 2 },
            con: { value: 3, unenhanced: 3 },
            dex: { value: 4, unenhanced: 4 },
            cha: { value: 1, unenhanced: 1 }
          },
          attributes: {
            hp: { bars: 2, hpPerBar: 0 },
            dr: { armor: 1 },
            speed: { move: 20 },
            surpriseDifficulty: '11+F',
            evadeDifficulty: '12+F',
            treasure: 'Gnawed cloth, 1 copper nib',
            xp: 35
          },
          details: {
            level: 2,
            classification: 'Mob',
            creatureType: 'Animal',
            floor: 'Floor 1 (Tutorial)',
            location: 'Prickly Pack Alleys (Pack Alley Palls)',
            source: "Page 32, Game Master's Campaign Toolkit"
          }
        }
      });

      await packRat._preCreate(packRat.toObject(), {}, 'user-1');
      packRat.prepareData();

      // Ability modifiers check (Strict CarlRPG table: 1-2 -> +1, 3-5 -> +2)
      assert.equal(packRat.system.abilities.str.mod, 1, 'STR 1 mod is +1');
      assert.equal(packRat.system.abilities.int.mod, 1, 'INT 2 mod is +1');
      assert.equal(packRat.system.abilities.con.mod, 2, 'CON 3 mod is +2');
      assert.equal(packRat.system.abilities.dex.mod, 2, 'DEX 4 mod is +2');
      assert.equal(packRat.system.abilities.cha.mod, 1, 'CHA 1 mod is +1');

      // Health Bar calculation: 2 slots × CON mod (+2) = 4 Max HP
      assert.equal(packRat.system.attributes.hp.bars, 2, 'Pack Rat has 2 health bars');
      assert.equal(packRat.system.attributes.hp.hpPerBar, 2, 'Pack Rat has 2 HP per health bar');
      assert.equal(packRat.system.attributes.hp.max, 4, 'Pack Rat has 4 Max HP');
      assert.equal(packRat.system.attributes.hp.value, 4, 'Pack Rat starts at full HP (4)');

      // Combat metrics getHpPerBar returns 2
      assert.equal(getHpPerBar(packRat), 2, 'getHpPerBar returns 2 HP per bar');

      // Combat values
      assert.equal(packRat.system.attributes.surpriseDifficulty, '11+F');
      assert.equal(packRat.system.attributes.evadeDifficulty, '12+F');
      assert.equal(packRat.system.attributes.dr.total, 1);
      assert.equal(packRat.system.attributes.speed.move, 20);
    });

    test('Damage resolution against Pack Rat respects 2 HP bars and ignores excess damage', async () => {
      const packRat = new DCCActor({
        name: 'Pack Rat',
        type: 'mob',
        system: {
          abilities: { con: { value: 3, unenhanced: 3 } }, // mod +2
          attributes: {
            hp: { value: 4, max: 4, bars: 2, hpPerBar: 2 },
            dr: { total: 0, armor: 0 }
          }
        }
      });
      packRat.prepareData();

      // 1. Deal 1 damage: does not fill a full 2-HP bar -> 0 bars removed, HP remains 4
      const applied1 = await packRat.applyDamage(1);
      assert.equal(applied1.barsRemoved, 0, '1 damage does not fill a 2-HP bar');
      assert.equal(applied1.damageToHp, 0);
      assert.equal(packRat.system.attributes.hp.value, 4);

      // 2. Deal 3 damage: fills 1 full bar (2 HP), 1 excess ignored -> 2 HP remaining (1 bar)
      const applied2 = await packRat.applyDamage(3);
      assert.equal(applied2.barsRemoved, 1, '3 damage fills 1 full bar of 2 HP');
      assert.equal(applied2.damageToHp, 2, 'Lost exactly 2 HP');
      assert.equal(applied2.excessDamage, 1, '1 damage excess is ignored');
      assert.equal(packRat.system.attributes.hp.value, 2, 'Remaining HP is 2');

      // 3. Deal 2 damage: removes the last bar -> 0 HP remaining (defeated)
      const applied3 = await packRat.applyDamage(2);
      assert.equal(applied3.barsRemoved, 1);
      assert.equal(applied3.damageToHp, 2);
      assert.equal(packRat.system.attributes.hp.value, 0);
    });

    test('Pack Rat Bite attack executes to-hit roll and Piercing damage', async () => {
      const packRat = new DCCActor({
        name: 'Pack Rat',
        type: 'mob',
        system: {
          abilities: {
            str: { value: 1, unenhanced: 1 },
            dex: { value: 4, unenhanced: 4 }
          }
        },
        items: [
          {
            name: 'Bite',
            type: 'attack',
            system: {
              toHitStat: 'dex',
              toHitRank: 1,
              damageDice: '1d4',
              damageStat: 'str',
              damageType: 'Piercing'
            }
          }
        ]
      });
      packRat.prepareData();

      const bite = packRat.items[0];
      const rollHit = await packRat.rollAttack(bite, 'hit');
      assert.ok(rollHit, 'Bite to-hit roll executed');
      // toHitRank 1 + DEX mod (+2) = +3
      assert.equal(rollHit.formula, '1d20 + 3', 'Bite to hit uses Rank 1 + DEX mod (+2) = 1d20 + 3');

      const rollDmgMsg = await packRat.rollAttack(bite, 'damage');
      assert.ok(rollDmgMsg, 'Bite damage roll executed');
      const cardFlags = rollDmgMsg.flags?.['carl-rpg'];
      assert.ok(cardFlags?.isDamageRoll, 'Damage card flag is set');
      assert.match(cardFlags.parts[0]?.formula, /1d4/, 'Bite rolls 1d4 damage dice');
      assert.equal(cardFlags.parts[0]?.type, 'Piercing', 'Bite damage type is Piercing');
    });
  });

  describe('5. Variable Health Bars with Custom Number of Slots & hpPerBar', () => {
    test('Mob with 3 bars and custom hpPerBar of 5 computes 15 Max HP', () => {
      const eliteMob = new DCCActor({
        name: 'Hobgoblin Brute',
        type: 'mob',
        system: {
          abilities: { con: { value: 12, unenhanced: 12 } }, // CON 12 -> mod +4
          attributes: {
            hp: { bars: 3, hpPerBar: 5 } // explicitly overridden hpPerBar = 5
          }
        }
      });
      eliteMob.prepareData();

      assert.equal(eliteMob.system.attributes.hp.bars, 3);
      assert.equal(eliteMob.system.attributes.hp.hpPerBar, 5);
      assert.equal(eliteMob.system.attributes.hp.max, 15, '3 bars × 5 HP/bar = 15 Max HP');
      assert.equal(getHpPerBar(eliteMob), 5, 'getHpPerBar respects explicit hpPerBar');
    });

    test('Mob with 5 bars defaulting to CON modifier computes Max HP correctly', () => {
      const bossMob = new DCCActor({
        name: 'Dungeon Boss',
        type: 'mob',
        system: {
          abilities: { con: { value: 25, unenhanced: 25 } }, // CON 25 -> mod +5
          attributes: {
            hp: { bars: 5, hpPerBar: 0 } // 0 means default to CON mod
          }
        }
      });
      bossMob.prepareData();

      assert.equal(bossMob.system.attributes.hp.bars, 5);
      assert.equal(bossMob.system.attributes.hp.hpPerBar, 5);
      assert.equal(bossMob.system.attributes.hp.max, 25, '5 bars × 5 HP/bar = 25 Max HP');
    });
  });

  describe('6. Crawler Sheet Context for Mob Actors', () => {
    test('CrawlerSheet._prepareContext sets isMob = true, isCrawler = false, and generates dynamic healthSegments', async () => {
      const mob = new DCCActor({
        name: 'Pack Rat',
        type: 'mob',
        system: {
          abilities: { con: { value: 3, unenhanced: 3 } },
          attributes: {
            hp: { value: 4, max: 4, bars: 2, hpPerBar: 2 },
            treasure: '1 gold coin',
            xp: 50
          }
        }
      });
      mob.prepareData();

      const sheet = new DCCCrawlerSheet(mob);
      const context = await sheet._prepareContext();

      assert.equal(context.isMob, true, 'context.isMob is true');
      assert.equal(context.isCrawler, false, 'context.isCrawler is false');
      assert.equal(context.system.attributes.treasure, '1 gold coin');
      assert.equal(context.system.attributes.xp, 50);

      // Verify dynamic healthSegments for 2 bars
      assert.equal(context.healthSegments.length, 2, '2 health segments for 2 bars');
      assert.equal(context.healthSegments[0].label, '50%');
      assert.equal(context.healthSegments[1].label, '100%');
    });

    test('CrawlerSheet._prepareContext for crawlers generates 10 standard health segments', async () => {
      const crawler = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, unenhanced: 10 } }
        }
      });
      crawler.prepareData();

      const sheet = new DCCCrawlerSheet(crawler);
      const context = await sheet._prepareContext();

      assert.equal(context.isMob, false);
      assert.equal(context.isCrawler, true);
      assert.equal(context.healthSegments.length, 10, 'Crawlers always have 10 health segments');
      assert.equal(context.healthSegments[0].label, '10%');
      assert.equal(context.healthSegments[9].label, '100%');
    });
  });
});
