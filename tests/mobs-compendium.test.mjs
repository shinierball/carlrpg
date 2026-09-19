import './setup.mjs';
import '../src/dcc.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_MOBS } from '../src/data/mobs.mjs';
import { DCCActor, getDCCStatModifier } from '../src/documents/actor.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('DCC RPG Mobs Compendium Subsystem', () => {
  describe('1. System Manifest & Template Schema Validation', () => {
    test('system.json registers carl-rpg.mobs compendium pack with Actor type', () => {
      const sysJsonPath = path.resolve(__dirname, '../system.json');
      const system = JSON.parse(fs.readFileSync(sysJsonPath, 'utf8'));

      const mobsPack = system.packs?.find(p => p.name === 'mobs');
      assert.ok(mobsPack, 'system.json must declare a "mobs" pack');
      assert.equal(mobsPack.path, 'packs/mobs');
      assert.equal(mobsPack.type, 'Actor');
      assert.equal(mobsPack.system, 'carl-rpg');
      assert.equal(mobsPack.ownership?.PLAYER, 'OBSERVER');
      assert.equal(mobsPack.ownership?.ASSISTANT, 'OWNER');
    });

    test('system.json defines htmlFields for mob including description and aiDescription', () => {
      const sysJsonPath = path.resolve(__dirname, '../system.json');
      const system = JSON.parse(fs.readFileSync(sysJsonPath, 'utf8'));
      const mobHtmlFields = system.documentTypes?.Actor?.mob?.htmlFields || [];

      assert.ok(mobHtmlFields.includes('details.description'), 'details.description must be an htmlField');
      assert.ok(mobHtmlFields.includes('details.aiDescription'), 'details.aiDescription must be an htmlField');
      assert.ok(mobHtmlFields.includes('details.notes'), 'details.notes must be an htmlField');
      assert.ok(mobHtmlFields.includes('details.special'), 'details.special must be an htmlField');
    });

    test('template.json registers Actor.mob with description and aiDescription fields', () => {
      const tplJsonPath = path.resolve(__dirname, '../template.json');
      const template = JSON.parse(fs.readFileSync(tplJsonPath, 'utf8'));

      assert.ok(template.Actor.types.includes('mob'), 'template.json Actor.types must include "mob"');
      assert.ok(template.Actor.mob, 'template.json must define Actor.mob template');
      assert.ok('description' in template.Actor.mob.details, 'details.description must exist in template.json');
      assert.ok('aiDescription' in template.Actor.mob.details, 'details.aiDescription must exist in template.json');
      assert.ok('notes' in template.Actor.mob.details, 'details.notes must exist in template.json');
      assert.ok('special' in template.Actor.mob.details, 'details.special must exist in template.json');
      assert.ok('source' in template.Actor.mob.details, 'details.source must exist in template.json');
    });
  });

  describe('2. Game Master\'s Toolkit - Entities List Dataset Integrity', () => {
    const requiredMobNames = [
      'Aranaea Magnus',
      'Chef BoyardOoze',
      'Rat Brute',
      'Rat Shaman',
      'Rat Hooligan',
      'Critical Consensus',
      'Canis Knights',
      'Grimes',
      'Trollogs',
      'Dread Wizard Grimblegore',
      'Cocaine Kobold',
      'Danger Dingo',
      'Jacked Kangaroo',
      'Jazmanian Devil',
      'Whambat',
      'Mick Moran',
      'Brindle Grub',
      'Cow-Tailed Brindle Grub',
      'Brindled Vespa',
      'Unvaccinated Clurichaun Rev-Up Consultant',
      'Laminak Rev-Up Consultant Manager',
      'Smombie'
    ];

    test('DCC_MOBS contains all 22 entities from the Game Master\'s Toolkit', () => {
      const mobNames = DCC_MOBS.map(m => m.name);
      for (const reqName of requiredMobNames) {
        assert.ok(mobNames.includes(reqName), `DCC_MOBS must include "${reqName}"`);
      }
      assert.ok(DCC_MOBS.length >= 22, `DCC_MOBS must contain at least 22 mobs (found ${DCC_MOBS.length})`);
    });

    test('CONFIG.DCC.mobs and game.dcc.mobs expose the dataset globally', () => {
      assert.ok(Array.isArray(globalThis.CONFIG?.DCC?.mobs), 'CONFIG.DCC.mobs must be an array');
      assert.equal(globalThis.CONFIG.DCC.mobs.length, DCC_MOBS.length);
      assert.ok(Array.isArray(globalThis.game?.dcc?.mobs), 'game.dcc.mobs must be an array');
      assert.equal(globalThis.game.dcc.mobs.length, DCC_MOBS.length);
    });

    test('every mob has unique 16-character _id', () => {
      const ids = new Set();
      for (const mob of DCC_MOBS) {
        assert.ok(mob._id, `Mob ${mob.name} must have an _id`);
        assert.equal(mob._id.length, 16, `Mob ${mob.name} _id must be 16 characters`);
        assert.ok(!ids.has(mob._id), `Mob ${mob.name} has duplicate _id: ${mob._id}`);
        ids.add(mob._id);
      }
    });

    test('all ability modifiers adhere strictly to official CarlRPG stat modifier table', () => {
      for (const mob of DCC_MOBS) {
        for (const [statKey, statData] of Object.entries(mob.system.abilities)) {
          const expectedMod = getDCCStatModifier(statData.value);
          assert.equal(
            statData.mod,
            expectedMod,
            `${mob.name} ${statKey.toUpperCase()} value ${statData.value} mod must be ${expectedMod}, got ${statData.mod}`
          );
          assert.ok(statData.mod >= 0, `CarlRPG has no negative modifiers: ${mob.name} ${statKey}`);
        }
      }
    });

    test('health bars calculation strictly conforms to CON modifier rules', () => {
      for (const mob of DCC_MOBS) {
        const conVal = mob.system.abilities.con.value;
        const conMod = getDCCStatModifier(conVal);
        const hp = mob.system.attributes.hp;

        assert.equal(
          hp.hpPerBar,
          conMod,
          `${mob.name} CON ${conVal} (+${conMod}) must have ${conMod} HP per health bar, got ${hp.hpPerBar}`
        );
        assert.equal(
          hp.max,
          hp.bars * hp.hpPerBar,
          `${mob.name} Max HP must equal bars (${hp.bars}) × hpPerBar (${hp.hpPerBar}) = ${hp.bars * hp.hpPerBar}`
        );
        assert.equal(hp.value, hp.max, `${mob.name} starts at full HP`);
      }
    });

    test('every mob has valid Evade and Surprise difficulties', () => {
      for (const mob of DCC_MOBS) {
        assert.match(
          mob.system.attributes.evadeDifficulty,
          /^\d+\+F$/,
          `${mob.name} evadeDifficulty must match format "X+F", got "${mob.system.attributes.evadeDifficulty}"`
        );
        assert.match(
          mob.system.attributes.surpriseDifficulty,
          /^\d+\+F$/,
          `${mob.name} surpriseDifficulty must match format "X+F", got "${mob.system.attributes.surpriseDifficulty}"`
        );
      }
    });

    test('every mob has descriptions, AI announcements, and citation source', () => {
      for (const mob of DCC_MOBS) {
        assert.ok(mob.system.details.description?.length > 0, `${mob.name} must have description`);
        assert.ok(mob.system.details.aiDescription?.length > 0, `${mob.name} must have aiDescription`);
        assert.ok(mob.system.details.source?.length > 0, `${mob.name} must have source citation`);
      }
    });
  });

  describe('3. Specific Mob Statistical Verifications', () => {
    test('Aranaea Magnus: Level 7 Neighborhood Boss with 10 bars (4 HP/bar), 40 Max HP, DR 1', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Aranaea Magnus');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 7);
      assert.equal(mob.system.details.classification, 'Neighborhood Boss');
      assert.equal(mob.system.details.creatureType, 'Monstrous');
      assert.equal(mob.system.attributes.size, 'Large');
      assert.equal(mob.tokenWidth, 2);
      assert.equal(mob.system.attributes.hp.bars, 10);
      assert.equal(mob.system.attributes.hp.hpPerBar, 4);
      assert.equal(mob.system.attributes.hp.max, 40);
      assert.equal(mob.system.attributes.dr.total, 1);
      assert.equal(mob.system.attributes.speed.move, 30);
      assert.equal(mob.system.attributes.evadeDifficulty, '14+F');
      assert.equal(mob.system.attributes.surpriseDifficulty, '12+F');
      assert.equal(mob.items.length, 6, 'Aranaea Magnus has 6 attacks');
    });

    test('Dread Wizard Grimblegore: Level 10 Neighborhood Boss with 12 bars (5 HP/bar), 60 Max HP, DR 2', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Dread Wizard Grimblegore');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 10);
      assert.equal(mob.system.details.classification, 'Neighborhood Boss');
      assert.equal(mob.system.attributes.hp.bars, 12);
      assert.equal(mob.system.attributes.hp.hpPerBar, 5);
      assert.equal(mob.system.attributes.hp.max, 60);
      assert.equal(mob.system.attributes.dr.total, 2);
      assert.equal(mob.system.attributes.evadeDifficulty, '14+F');
      assert.equal(mob.system.attributes.surpriseDifficulty, '14+F');
      assert.ok(mob.items.some(i => i.name === 'Fireball Spell'));
      assert.ok(mob.items.some(i => i.name === 'Gloat Spell'));
      assert.ok(mob.items.some(i => i.name === 'Jump Smash'));
    });

    test('Critical Consensus: Level 8 Neighborhood Boss, Huge (3x3), 11 bars (5 HP/bar), 55 Max HP', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Critical Consensus');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 8);
      assert.equal(mob.system.attributes.size, 'Huge');
      assert.equal(mob.tokenWidth, 3);
      assert.equal(mob.tokenHeight, 3);
      assert.equal(mob.system.attributes.hp.bars, 11);
      assert.equal(mob.system.attributes.hp.hpPerBar, 5);
      assert.equal(mob.system.attributes.hp.max, 55);
    });

    test('Chef BoyardOoze: Level 4 Ooze with 4 bars (3 HP/bar), 12 Max HP, DR 2, Move 10+S', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Chef BoyardOoze');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 4);
      assert.equal(mob.system.details.creatureType, 'Ooze');
      assert.equal(mob.system.attributes.hp.bars, 4);
      assert.equal(mob.system.attributes.hp.hpPerBar, 3);
      assert.equal(mob.system.attributes.hp.max, 12);
      assert.equal(mob.system.attributes.speed.move, 10);
      assert.equal(mob.system.attributes.dr.total, 2);
    });

    test('Brindled Vespa: Level 8 Mutated wasp with 8 bars (4 HP/bar), 32 Max HP, DR 0, Evade 14+F', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Brindled Vespa');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 8);
      assert.equal(mob.system.attributes.hp.bars, 8);
      assert.equal(mob.system.attributes.hp.hpPerBar, 4);
      assert.equal(mob.system.attributes.hp.max, 32);
      assert.equal(mob.system.attributes.dr.total, 0);
      assert.equal(mob.system.attributes.evadeDifficulty, '14+F');
    });

    test('Mick Moran: Level 12 Crocodilian Chef with 12 bars (5 HP/bar), 60 Max HP, DR 2', () => {
      const mob = DCC_MOBS.find(m => m.name === 'Mick Moran');
      assert.ok(mob);
      assert.equal(mob.system.details.level, 12);
      assert.equal(mob.system.abilities.str.value, 20);
      assert.equal(mob.system.abilities.str.mod, 5);
      assert.equal(mob.system.abilities.con.value, 20);
      assert.equal(mob.system.abilities.con.mod, 5);
      assert.equal(mob.system.attributes.hp.bars, 12);
      assert.equal(mob.system.attributes.hp.hpPerBar, 5);
      assert.equal(mob.system.attributes.hp.max, 60);
    });
  });

  describe('4. DCCActor Document & Action Execution for Compendium Mobs', () => {
    test('DCCActor instantiates Aranaea Magnus with unlinked prototype token and rolls attacks', async () => {
      const data = DCC_MOBS.find(m => m.name === 'Aranaea Magnus');
      const actor = new DCCActor(data);
      await actor._preCreate(actor.toObject(), {}, 'user-1');
      actor.prepareData();

      assert.equal(actor.type, 'mob');
      assert.equal(actor.prototypeToken.actorLink, false);
      assert.equal(actor.prototypeToken.disposition, -1);
      assert.equal(actor.system.attributes.hp.max, 40);

      // Roll Venomous Fangs to-hit
      const fangs = actor.items.find(i => i.name === 'Venomous Fangs');
      assert.ok(fangs);
      const hitRoll = await actor.rollAttack(fangs, 'hit');
      assert.ok(hitRoll);
      // toHitStat dex (+4) + rank 0 = +4
      assert.match(hitRoll.formula, /1d20 \+ 4/);

      // Roll Venomous Fangs damage
      const dmgMsg = await actor.rollAttack(fangs, 'damage');
      assert.ok(dmgMsg);
      const flags = dmgMsg.flags?.['carl-rpg'];
      assert.ok(flags?.isDamageRoll);
      assert.equal(flags.parts[0]?.type, 'Piercing');
    });

    test('DCCActor instantiates Grimblegore and executes Fireball attack and damage', async () => {
      const data = DCC_MOBS.find(m => m.name === 'Dread Wizard Grimblegore');
      const actor = new DCCActor(data);
      actor.prepareData();

      const fireball = actor.items.find(i => i.name === 'Fireball Spell');
      assert.ok(fireball);

      const hitRoll = await actor.rollAttack(fireball, 'hit');
      assert.ok(hitRoll);
      // INT mod +4 -> 1d20 + 4
      assert.match(hitRoll.formula, /1d20 \+ 4/);

      const dmgMsg = await actor.rollAttack(fireball, 'damage');
      assert.ok(dmgMsg);
      const flags = dmgMsg.flags?.['carl-rpg'];
      assert.equal(flags.parts[0]?.type, 'Fire');
      assert.equal(flags.parts[0]?.dice, '2d12');
    });
  });

  describe('5. CrawlerSheet Context Generation for Compendium Mobs', () => {
    test('CrawlerSheet._prepareContext populates isMob, lore, dynamic segments, and attacks', async () => {
      const data = DCC_MOBS.find(m => m.name === 'Chef BoyardOoze');
      const actor = new DCCActor(data);
      actor.prepareData();

      const sheet = new DCCCrawlerSheet(actor);
      const context = await sheet._prepareContext();

      assert.equal(context.isMob, true);
      assert.equal(context.isCrawler, false);
      assert.equal(context.system.details.description, data.system.details.description);
      assert.equal(context.system.details.aiDescription, data.system.details.aiDescription);
      assert.equal(context.system.details.source, data.system.details.source);
      assert.equal(context.system.attributes.hp.bars, 4);

      // 4 health segments for 4 bars (25%, 50%, 75%, 100%)
      assert.equal(context.healthSegments.length, 4);
      assert.equal(context.healthSegments[0].label, '25%');
      assert.equal(context.healthSegments[1].label, '50%');
      assert.equal(context.healthSegments[2].label, '75%');
      assert.equal(context.healthSegments[3].label, '100%');

      // Attacks categorized
      assert.equal(context.attacks.length, 1);
      assert.equal(context.attacks[0].name, 'Tendril');
    });
  });

  describe('6. Built LevelDB Compendium Pack Verification', () => {
    test('packs/mobs directory exists and contains built database files', () => {
      const packDir = path.resolve(__dirname, '../packs/mobs');
      assert.ok(fs.existsSync(packDir), 'packs/mobs directory must exist');
      const files = fs.readdirSync(packDir);
      assert.ok(files.some(f => f.startsWith('MANIFEST') || f.endsWith('.ldb') || f === 'CURRENT'), 'packs/mobs must contain LevelDB database files');
    });

    test('packs/mobs ClassicLevel database can be read and contains all actors', async () => {
      let ClassicLevel;
      const foundryModulePath = '/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level';
      if (fs.existsSync(foundryModulePath)) {
        const mod = await import(foundryModulePath + '/index.js');
        ClassicLevel = mod.ClassicLevel || mod.default?.ClassicLevel || mod.default;
      } else {
        const mod = await import('classic-level');
        ClassicLevel = mod.ClassicLevel;
      }

      const packDir = path.resolve(__dirname, '../packs/mobs');
      const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
      await db.open();

      for (const mob of DCC_MOBS) {
        const doc = await db.get(`!actors!${mob._id}`);
        assert.ok(doc, `Database must contain !actors!${mob._id}`);
        assert.equal(doc.name, mob.name);
        assert.equal(doc.type, 'mob');
        assert.equal(doc.system.attributes.hp.bars, mob.system.attributes.hp.bars);
        assert.equal(doc.system.attributes.hp.hpPerBar, mob.system.attributes.hp.hpPerBar);
        assert.equal(doc.prototypeToken.actorLink, false);
      }

      await db.close();
    });
  });
});
