import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCGrindApp } from '../src/apps/grind-app.mjs';
import { DCCSessionEngine } from '../src/apps/session-manager.mjs';
import { DCCFloorClockHUD } from '../src/apps/floor-clock-hud.mjs';
import { CrawlerDataModel } from '../src/models/actors/crawler-model.mjs';
import { SkillDataModel } from '../src/models/items/skill-model.mjs';
import {
  DCC_GRINDING_COMPLICATIONS,
  getGrindingComplication,
  getRequiredGrindingHours,
  getAdvancementTarget,
  getEnduranceDC
} from '../src/data/grinding.mjs';

describe('DCC RPG — Grinding & Downtime Mechanics', () => {

  describe('1. Grinding Data & Progression Formulas', () => {
    it('calculates required grinding hours as equal to current rank (minimum 1)', () => {
      assert.equal(getRequiredGrindingHours(0), 1, 'Rank 0 requires 1 hour');
      assert.equal(getRequiredGrindingHours(1), 1, 'Rank 1 requires 1 hour');
      assert.equal(getRequiredGrindingHours(2), 2, 'Rank 2 requires 2 hours');
      assert.equal(getRequiredGrindingHours(3), 3, 'Rank 3 requires 3 hours');
      assert.equal(getRequiredGrindingHours(5), 5, 'Rank 5 requires 5 hours');
      assert.equal(getRequiredGrindingHours(9), 9, 'Rank 9 requires 9 hours');
      assert.equal(getRequiredGrindingHours(14), 14, 'Rank 14 requires 14 hours');
    });

    it('calculates advancement target as 1d20 >= Current Rank', () => {
      assert.equal(getAdvancementTarget(0), 0);
      assert.equal(getAdvancementTarget(1), 1);
      assert.equal(getAdvancementTarget(5), 5);
      assert.equal(getAdvancementTarget(10), 10);
      assert.equal(getAdvancementTarget(15), 15);
    });

    it('calculates Endurance DC as 10 + Floor + Hours Past Safe Limit', () => {
      // Floor 1, 1 hour past safe limit
      assert.equal(getEnduranceDC(1, 1), 12);
      // Floor 1, 3 hours past safe limit
      assert.equal(getEnduranceDC(1, 3), 14);
      // Floor 3, 2 hours past safe limit
      assert.equal(getEnduranceDC(3, 2), 15);
    });

    it('indexes all 9 discrete complication tiers on the 1d20 table', () => {
      assert.equal(getGrindingComplication(1).title, 'Bugaboo / Boss Scout Ambush');
      assert.equal(getGrindingComplication(2).title, 'Janitor Mob Infestation');
      assert.equal(getGrindingComplication(3).title, 'Janitor Mob Infestation');
      assert.equal(getGrindingComplication(4).title, 'Labyrinthine Dead End / Trap');
      assert.equal(getGrindingComplication(5).title, 'Labyrinthine Dead End / Trap');
      assert.equal(getGrindingComplication(6).title, 'Equipment Wear & Gear Snag');
      assert.equal(getGrindingComplication(7).title, 'Equipment Wear & Gear Snag');
      assert.equal(getGrindingComplication(8).title, 'Rival Crawler Sighting');
      assert.equal(getGrindingComplication(10).title, 'Rival Crawler Sighting');
      assert.equal(getGrindingComplication(11).title, 'Clean, Routine Grind');
      assert.equal(getGrindingComplication(14).title, 'Clean, Routine Grind');
      assert.equal(getGrindingComplication(15).title, 'Valuable Scavenged Junk');
      assert.equal(getGrindingComplication(17).title, 'Valuable Scavenged Junk');
      assert.equal(getGrindingComplication(18).title, 'Wandering Merchant / Helpful Guide');
      assert.equal(getGrindingComplication(19).title, 'Wandering Merchant / Helpful Guide');
      assert.equal(getGrindingComplication(20).title, 'AI-Approved Carnage (Loot Box Award)');
    });
  });

  describe('2. Safe Grinding vs Extended Grinding & Endurance Checks', () => {
    let crawler;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Grind Tester',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, mod: 4 },
            int: { value: 10, mod: 4 },
            con: { value: 10, mod: 4 },
            dex: { value: 10, mod: 4 },
            cha: { value: 10, mod: 4 }
          },
          attributes: {
            hp: { value: 40, max: 40, pct: 100 },
            mana: { value: 10, max: 10 }
          },
          details: {
            floor: '1st Floor'
          }
        }
      });
    });

    it('safely grinds up to 5 hours with 0 endurance checks and 0 fatigue', async () => {
      const res = await crawler.grindSession({ hours: 5, silent: true });

      assert.equal(res.hours, 5);
      assert.equal(res.safeThreshold, 5);
      assert.equal(res.excessHours, 0);
      assert.equal(res.enduranceChecks.length, 0);
      assert.equal(res.fatigueGained, 0);
      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 0);
    });

    it('guide bonus (e.g. Huey) increases safe threshold to 6 hours without fatigue checks', async () => {
      const res = await crawler.grindSession({ hours: 6, hasGuideBonus: true, silent: true });

      assert.equal(res.hours, 6);
      assert.equal(res.safeThreshold, 6);
      assert.equal(res.excessHours, 0);
      assert.equal(res.enduranceChecks.length, 0);
      assert.equal(res.fatigueGained, 0);
    });

    it('neighborhood map option adds 1 safe hour (+1 hr, safe limit 6 hrs)', async () => {
      const res = await crawler.grindSession({ hours: 6, mapType: 'neighborhood', silent: true });

      assert.equal(res.hours, 6);
      assert.equal(res.safeThreshold, 6);
      assert.equal(res.mapBonus, 1);
      assert.equal(res.mapType, 'neighborhood');
      assert.equal(res.excessHours, 0);
      assert.equal(res.enduranceChecks.length, 0);
      assert.equal(res.fatigueGained, 0);
    });

    it('borough map option adds 2 safe hours (+2 hrs, safe limit 7 hrs)', async () => {
      const res = await crawler.grindSession({ hours: 7, mapType: 'borough', silent: true });

      assert.equal(res.hours, 7);
      assert.equal(res.safeThreshold, 7);
      assert.equal(res.mapBonus, 2);
      assert.equal(res.mapType, 'borough');
      assert.equal(res.excessHours, 0);
      assert.equal(res.enduranceChecks.length, 0);
      assert.equal(res.fatigueGained, 0);
    });

    it('burrough map spelling alias and hasBoroughMap flag also grant +2 safe hours', async () => {
      const resAlias = await crawler.grindSession({ hours: 7, mapType: 'burrough', silent: true });
      assert.equal(resAlias.safeThreshold, 7);
      assert.equal(resAlias.mapBonus, 2);

      const resFlag = await crawler.grindSession({ hours: 7, hasBurroughMap: true, silent: true });
      assert.equal(resFlag.safeThreshold, 7);
      assert.equal(resFlag.mapBonus, 2);
    });

    it('combined guide bonus (+1) and borough map (+2) allows safely grinding 8 hours', async () => {
      const res = await crawler.grindSession({
        hours: 8,
        hasGuideBonus: true,
        mapType: 'borough',
        silent: true
      });

      assert.equal(res.hours, 8);
      assert.equal(res.safeThreshold, 8); // 5 base + 1 guide + 2 borough map
      assert.equal(res.excessHours, 0);
      assert.equal(res.enduranceChecks.length, 0);
      assert.equal(res.fatigueGained, 0);
    });

    it('extended grinding beyond safe limit executes an Endurance check per excess hour', async () => {
      // 7 hours = 2 hours past 5 safe hours
      const res = await crawler.grindSession({ hours: 7, floor: 1, silent: true });

      assert.equal(res.hours, 7);
      assert.equal(res.excessHours, 2);
      assert.equal(res.enduranceChecks.length, 2);
      assert.equal(res.enduranceChecks[0].hour, 6);
      assert.equal(res.enduranceChecks[0].dc, 12); // 10 + 1 + 1
      assert.equal(res.enduranceChecks[1].hour, 7);
      assert.equal(res.enduranceChecks[1].dc, 13); // 10 + 1 + 2
    });

    it('inflicts stackable Fatigued debuff on failed Endurance check', async () => {
      // Mock Roll to force a low roll that fails DC 12
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 5; // Fails DC 12
          return this;
        }
      };

      try {
        const res = await crawler.grindSession({ hours: 6, floor: 1, silent: true });
        assert.equal(res.excessHours, 1);
        assert.equal(res.enduranceChecks[0].passed, false);
        assert.equal(res.fatigueGained, 1);

        const debuffs = crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued');
        assert.equal(debuffs.length, 1);
        assert.equal(debuffs[0].name, 'Fatigued');
        assert.equal(debuffs[0].system.severity, 'Minor');
        assert.match(debuffs[0].system.description, /[−-]1 penalty on all Checks/);
        assert.ok(debuffs[0].system.duration.toLowerCase().includes('long rest'));
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('endurance skill with Rank 10 rolls with advantage (2d20kh) when not fatigued', async () => {
      // Add Endurance skill at Rank 10
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Endurance',
        type: 'skill',
        system: {
          rank: 10,
          stat: 'con',
          checked: false
        }
      }]);

      let capturedFormula = '';
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        constructor(formula, data) {
          super(formula, data);
          if (formula.includes('2d20kh')) capturedFormula = formula;
        }
        async evaluate() {
          this.total = 25;
          return this;
        }
      };

      try {
        await crawler.grindSession({ hours: 6, floor: 1, silent: true });
        assert.match(capturedFormula, /2d20kh \+ 10 \+ 4/, 'Rank 10 Endurance rolls with advantage when not fatigued');
      } finally {
        globalThis.Roll = origRoll;
      }
    });
  });

  describe('3. Skill Advancement Workflow', () => {
    let crawler;
    let brawlingSkill;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Advancement Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 }, str: { value: 10, mod: 4 } },
          attributes: { hp: { value: 40, max: 40 }, mana: { value: 10, max: 10 } },
          details: { floor: '1st Floor' }
        }
      });

      const created = await crawler.createEmbeddedDocuments('Item', [{
        name: 'Brawling',
        type: 'skill',
        system: {
          rank: 3,
          stat: 'str',
          checked: true
        }
      }]);
      brawlingSkill = created[0];
    });

    it('does not test advancement if invested hours are less than current skill rank', async () => {
      // Brawling is Rank 3 (requires 3 hours). Grinding for 2 hours is insufficient.
      const res = await crawler.grindSession({
        hours: 2,
        skillId: brawlingSkill.id,
        silent: true
      });

      assert.equal(res.skillAdvancement.insufficientHours, true);
      assert.equal(res.skillAdvancement.passed, false);
      assert.equal(brawlingSkill.system.rank, 3, 'Skill rank remains unchanged');
      assert.equal(brawlingSkill.system.checked, true, 'Skill remains checked when hours are insufficient');
    });

    it('advances skill rank by +1 on successful 1d20 >= Current Rank and clears checked status', async () => {
      // Mock Roll to ensure advancement success (roll 15 >= 3)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 15;
          return this;
        }
      };

      try {
        const res = await crawler.grindSession({
          hours: 3,
          skillId: brawlingSkill.id,
          silent: true
        });

        assert.equal(res.skillAdvancement.passed, true);
        assert.equal(res.skillAdvancement.previousRank, 3);
        assert.equal(res.skillAdvancement.newRank, 4);
        assert.equal(brawlingSkill.system.rank, 4, 'Rank incremented to 4');
        assert.equal(brawlingSkill.system.checked, false, 'Checked status cleared upon advancement');
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('keeps skill rank on failed 1d20 < Current Rank and clears checked status for next session', async () => {
      // Set rank to 12
      await brawlingSkill.update({ 'system.rank': 12, 'system.checked': true });

      // Mock Roll to fail (roll 5 < 12)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 5;
          return this;
        }
      };

      try {
        const res = await crawler.grindSession({
          hours: 12,
          skillId: brawlingSkill.id,
          silent: true
        });

        assert.equal(res.skillAdvancement.passed, false);
        assert.equal(res.skillAdvancement.newRank, 12, 'Rank remains 12');
        assert.equal(brawlingSkill.system.rank, 12);
        assert.equal(brawlingSkill.system.checked, false, 'Checked status resets after attempt');
      } finally {
        globalThis.Roll = origRoll;
      }
    });
  });

  describe('4. Automatic Use-Marking During Play', () => {
    let crawler;
    let dodgeSkill;
    let punchSkill;
    let swordItem;
    let edgeSkill;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Auto-Check Tester',
        type: 'crawler',
        system: {
          abilities: { dex: { value: 10, mod: 4 }, str: { value: 10, mod: 4 } },
          attributes: { hp: { value: 40, max: 40 } }
        }
      });

      const items = await crawler.createEmbeddedDocuments('Item', [
        { name: 'Dodge', type: 'skill', system: { rank: 2, stat: 'dex', checked: false } },
        { name: 'Punch', type: 'skill', system: { rank: 1, stat: 'str', checked: false } },
        { name: 'Sword', type: 'attack', system: { toHitStat: 'dex', checked: false } },
        { name: 'Sword', type: 'skill', system: { rank: 3, stat: 'dex', checked: false } }
      ]);
      dodgeSkill = items[0];
      punchSkill = items[1];
      swordItem = items[2];
      edgeSkill = items[3];
    });

    it('automatically marks skill as checked: true when rollSkill() is called', async () => {
      assert.equal(dodgeSkill.system.checked, false);
      await crawler.rollSkill(dodgeSkill);
      assert.equal(dodgeSkill.system.checked, true, 'rollSkill automatically sets checked: true');
    });

    it('automatically marks attack skill as checked: true when rollAttack() is called', async () => {
      assert.equal(punchSkill.system.checked, false);
      await crawler.rollAttack(punchSkill, 'hit', { damageEffect: 'none' });
      assert.equal(punchSkill.system.checked, true, 'rollAttack on skill sets checked: true');
    });

    it('automatically marks matching skill as checked: true when weapon rollAttack() is called', async () => {
      assert.equal(edgeSkill.system.checked, false);
      await crawler.rollAttack(swordItem, 'hit', { damageEffect: 'none' });
      assert.equal(edgeSkill.system.checked, true, 'matching weapon skill is marked checked: true');
    });
  });

  describe('5. Resting Subsystem (1h, 2h Short, 8h Long, 30h Full Day)', () => {
    let crawler;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Rest Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } },
          attributes: {
            hp: { value: 12, max: 40, temp: 0, pct: 30 },
            mana: { value: 2, max: 10 }
          }
        }
      });
    });

    it('1-hour non-combat rest recovers 1 Health Bar slot (+4 HP) and +5 Mana', async () => {
      // Current HP = 12, CON mod = 4 (1 HB slot = 4 HP). Expected HP = 16.
      // Current Mana = 2, +5 Mana = 7.
      const res = await crawler.rest('1hour', { silent: true });

      assert.equal(res.hours, 1);
      assert.equal(res.hpRestored, 4);
      assert.equal(res.manaRestored, 5);
      assert.equal(crawler.system.attributes.hp.value, 16);
      assert.equal(crawler.system.attributes.mana.value, 7);
    });

    it('1-hour non-combat rest caps recovery at maximum HP and Mana', async () => {
      await crawler.update({
        'system.attributes.hp.value': 39,
        'system.attributes.mana.value': 8
      });

      const res = await crawler.rest('1hour', { silent: true });

      assert.equal(res.hpRestored, 1);
      assert.equal(res.manaRestored, 2);
      assert.equal(crawler.system.attributes.hp.value, 40);
      assert.equal(crawler.system.attributes.mana.value, 10);
    });

    it('2-hour short rest recovers 5 Health Bar slots (+20 HP) and half Mana round down', async () => {
      // HP: 12 + (5 * 4) = 32.
      // Mana: max 10 / 2 = 5. Current 2 + 5 = 7.
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Minor Injury',
        type: 'debuff',
        system: { duration: 'Until the end of a short rest.' }
      }]);

      const res = await crawler.rest('short', { silent: true });

      assert.equal(res.hours, 2);
      assert.equal(res.hpRestored, 20);
      assert.equal(res.manaRestored, 5);
      assert.equal(crawler.system.attributes.hp.value, 32);
      assert.equal(crawler.system.attributes.mana.value, 7);
      assert.equal(crawler.items.filter(i => i.name === 'Minor Injury').length, 0, 'Minor Injury cleared on short rest');
    });

    it('1-hour and 2-hour rests do not clear the Fatigued debuff', async () => {
      await crawler.applyFatiguedDebuff();
      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 1);

      // 1-hour rest
      const res1h = await crawler.rest('1hour', { silent: true });
      assert.equal(res1h.fatigueCleared, 0);
      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 1);

      // 2-hour short rest
      const res2h = await crawler.rest('short', { silent: true });
      assert.equal(res2h.fatigueCleared, 0);
      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 1);
    });

    it('8-hour safe room long rest fully heals all 10 health bars, restores mana, and clears fatigue', async () => {
      await crawler.applyFatiguedDebuff();
      await crawler.applyFatiguedDebuff();
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Major Injury',
        type: 'debuff',
        system: { duration: 'Until the end of a long rest.' }
      }]);

      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 2);

      const summary = await crawler.rest('long', { silent: true });

      assert.equal(crawler.system.attributes.hp.value, 40, 'Health restored to maximum');
      assert.equal(crawler.system.attributes.hp.pct, 100, 'Health percentage reset to 100');
      assert.equal(crawler.system.attributes.mana.value, 10, 'Mana refilled to maximum');
      assert.equal(summary.fatigueCleared, 2, 'Reported 2 fatigue debuffs cleared');
      assert.equal(crawler.items.filter(i => i.type === 'debuff' && i.name.toLowerCase() === 'fatigued').length, 0, 'Zero fatigue debuffs remaining');
      assert.equal(crawler.items.filter(i => i.name === 'Major Injury').length, 0, 'Major Injury cleared on long rest');
    });

    it('30-hour full day rest fully recovers health, mana, clears fatigue, and heals all injuries', async () => {
      await crawler.applyFatiguedDebuff();
      await crawler.createEmbeddedDocuments('Item', [
        { name: 'Minor Injury', type: 'debuff', system: { duration: 'Until the end of a short rest.' } },
        { name: 'Major Injury', type: 'debuff', system: { duration: 'Until the end of a long rest.' } },
        { name: 'Long-Term Major Injury', type: 'debuff', system: { duration: 'Until the end of a full day of rest.' } },
        { name: 'Broken Leg', type: 'debuff', system: { duration: 'Severe injury.' } }
      ]);

      assert.equal(crawler.items.filter(i => i.type === 'debuff').length, 5);

      const summary = await crawler.rest('fullDay', { silent: true });

      assert.equal(summary.hours, 30);
      assert.equal(crawler.system.attributes.hp.value, 40);
      assert.equal(crawler.system.attributes.mana.value, 10);
      assert.equal(summary.fatigueCleared, 1);
      assert.equal(crawler.items.filter(i => i.type === 'debuff').length, 0, 'All injuries and fatigue cleared after full 30h day rest');
    });
  });

  describe('6. DCCGrindApp Application Subsystem', () => {
    let crawler;
    let stealthSkill;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'App Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 }, dex: { value: 10, mod: 4 } },
          attributes: { hp: { value: 40, max: 40 }, mana: { value: 10, max: 10 } },
          details: { floor: '2nd Floor' }
        }
      });

      const items = await crawler.createEmbeddedDocuments('Item', [{
        name: 'Stealth',
        type: 'skill',
        system: { rank: 2, stat: 'dex', checked: true, investedHours: 2 }
      }]);
      stealthSkill = items[0];
    });

    it('prepares correct initial data for DCCGrindApp', async () => {
      const app = new DCCGrindApp({ actor: crawler, hours: 5 });
      const data = await app.getData();

      assert.equal(data.actor.name, 'App Tester');
      assert.equal(data.hours, 5);
      assert.equal(data.floorNumber, 2);
      assert.equal(data.safeThreshold, 5);
      assert.equal(data.excessHours, 0);
      assert.equal(data.enduranceBonusStr, '+4');

      assert.equal(data.skills.length, 1);
      const sk = data.skills[0];
      assert.equal(sk.name, 'Stealth');
      assert.equal(sk.checked, true);
      assert.equal(sk.requiredHours, 2);
      assert.equal(sk.target, 2);
      assert.equal(sk.canAdvance, true, '5 hours >= 2 hours required');
    });

    it('correctly calculates excess hours when hours exceed safe threshold in app', async () => {
      const app = new DCCGrindApp({ actor: crawler, hours: 8, hasGuideBonus: true });
      const data = await app.getData();

      assert.equal(data.hours, 8);
      assert.equal(data.safeThreshold, 6);
      assert.equal(data.excessHours, 2);
    });

    it('correctly incorporates neighborhood map (+1 hr) and borough map (+2 hrs) in DCCGrindApp', async () => {
      const appNeigh = new DCCGrindApp({ actor: crawler, hours: 6, mapType: 'neighborhood' });
      const dataNeigh = await appNeigh.getData();
      assert.equal(dataNeigh.safeThreshold, 6);
      assert.equal(dataNeigh.mapBonus, 1);
      assert.equal(dataNeigh.isMapNeighborhood, true);
      assert.equal(dataNeigh.excessHours, 0);

      const appBorough = new DCCGrindApp({ actor: crawler, hours: 8, hasGuideBonus: true, mapType: 'borough' });
      const dataBorough = await appBorough.getData();
      assert.equal(dataBorough.safeThreshold, 8); // 5 base + 1 guide + 2 borough
      assert.equal(dataBorough.mapBonus, 2);
      assert.equal(dataBorough.isMapBorough, true);
      assert.equal(dataBorough.excessHours, 0);
    });

    it('auto-detects neighborhood or burrough map from actor inventory in DCCGrindApp', async () => {
      // Add a Burrough Map loot item to actor
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Burrough Map: Queens',
        type: 'loot',
        system: { quantity: 1 }
      }]);

      const app = new DCCGrindApp({ actor: crawler, hours: 7 });
      assert.equal(app.mapType, 'borough');
      const data = await app.getData();
      assert.equal(data.safeThreshold, 7);
      assert.equal(data.mapBonus, 2);
      assert.equal(data.isMapBorough, true);
    });
  });

  describe('7. Crawler Sheet Integration', () => {
    it('crawler sheet getData attaches isChecked and requiredGrindHours to skills', async () => {
      const crawler = new DCCActor({
        name: 'Sheet Tester',
        type: 'crawler',
        system: {
          abilities: { str: { value: 10, mod: 4 } }
        }
      });

      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Athletics',
        type: 'skill',
        system: { rank: 4, stat: 'str', checked: true }
      }]);

      const sheet = new DCCCrawlerSheet(crawler);
      const context = await sheet.getData();

      assert.ok(context.skills, 'Skills array exists');
      const ath = context.skills.find(s => s.name === 'Athletics');
      assert.ok(ath, 'Athletics skill present');
      assert.equal(ath.isChecked, true);
      assert.equal(ath.requiredGrindHours, 4);
      assert.equal(ath.advancementTarget, 4);
    });

    it('crawler sheet getData calculates hpPerBar and fiveHpBars for resting', async () => {
      const crawler = new DCCActor({
        name: 'HP Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } }
        }
      });
      const sheet = new DCCCrawlerSheet(crawler);
      const context = await sheet.getData();
      assert.equal(context.hpPerBar, 4);
      assert.equal(context.fiveHpBars, 20);
    });
  });

  describe('8. Persistent Banked Hours, Multi-Skill Grinding & Complication Bonus Hours', () => {
    let crawler;
    let pugilism;
    let dodge;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Banker Crawler',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 }, str: { value: 10, mod: 4 } },
          details: { floor: '1st Floor', bankedGrindHours: 0 }
        }
      });

      const items = await crawler.createEmbeddedDocuments('Item', [
        {
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 14, stat: 'str', checked: true, investedHours: 0 }
        },
        {
          name: 'Dodge',
          type: 'skill',
          system: { rank: 2, stat: 'dex', checked: true, investedHours: 0 }
        }
      ]);
      pugilism = items[0];
      dodge = items[1];
    });

    it('resets unspent hours in the pool to zero at start of new grind (use it or lose it)', async () => {
      // Grind session 1: 5 hours, no skill assigned
      const res1 = await crawler.grindSession({ hours: 5, rollComplication: false, silent: true });
      assert.equal(res1.hours, 5);
      assert.equal(res1.bankedHours, 5);
      assert.equal(crawler.system.details.bankedGrindHours, 5);

      // Grind session 2: 5 hours -> unspent 5 hours from session 1 are forfeited (use it or lose it)
      const res2 = await crawler.grindSession({ hours: 5, rollComplication: false, silent: true });
      assert.equal(res2.forfeitedHours, 5, 'Unspent hours from previous grind were forfeited');
      assert.equal(res2.bankedHours, 5, 'Pool has 5 hours from session 2');
      assert.equal(crawler.system.details.bankedGrindHours, 5);

      // If resetPool is explicitly false, hours accumulate
      const res3 = await crawler.grindSession({ hours: 5, resetPool: false, rollComplication: false, silent: true });
      assert.equal(res3.bankedHours, 10, 'Accumulates to 10 when resetPool is false');
    });

    it('advancing high-level skill requires multiple grinds to accumulate hours (Rank 14 -> 15)', async () => {
      // Rank 14 requires 14 hours.
      // Grind 1: 5 hours applied to Pugilism
      const res1 = await crawler.grindSession({
        hours: 5,
        skillId: pugilism.id,
        rollComplication: false,
        silent: true
      });
      assert.equal(res1.skillAdvancement.insufficientHours, true);
      assert.equal(res1.skillAdvancement.investedHours, 5);
      assert.equal(pugilism.system.investedHours, 5);
      assert.equal(pugilism.system.rank, 14);

      // Grind 2: 5 hours applied to Pugilism (now 10 / 14)
      const res2 = await crawler.grindSession({
        hours: 5,
        skillId: pugilism.id,
        rollComplication: false,
        silent: true
      });
      assert.equal(res2.skillAdvancement.insufficientHours, true);
      assert.equal(res2.skillAdvancement.investedHours, 10);
      assert.equal(pugilism.system.investedHours, 10);
      assert.equal(pugilism.system.rank, 14);

      // Grind 3: 4 hours applied to Pugilism (now 14 / 14 -> meets requirement!)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 16; // Roll 16 >= 14 passes!
          return this;
        }
      };

      try {
        const res3 = await crawler.grindSession({
          hours: 4,
          skillId: pugilism.id,
          rollComplication: false,
          silent: true
        });
        assert.equal(res3.skillAdvancement.passed, true);
        assert.equal(res3.skillAdvancement.previousRank, 14);
        assert.equal(res3.skillAdvancement.newRank, 15);
        assert.equal(pugilism.system.rank, 15);
        assert.equal(pugilism.system.checked, false);
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('allows grinding multiple skills at the same time in a single grind session', async () => {
      // Grind 6 hours and allocate 2 to Dodge (rank 2, needs 2) and 3 to Pugilism (needs 14)
      const res = await crawler.grindSession({
        hours: 6,
        allocations: {
          [dodge.id]: 2,
          [pugilism.id]: 3
        },
        rollComplication: false,
        silent: true
      });

      assert.equal(dodge.system.investedHours, 2, 'Dodge received 2 hours');
      assert.equal(pugilism.system.investedHours, 3, 'Pugilism received 3 hours');
      assert.equal(crawler.system.details.bankedGrindHours, 1, '1 unallocated hour remains in pool');
    });

    it('gaining bonus hour from complication adds extra hour to grind pool', async () => {
      // Force complication roll 18 (Wandering Merchant / Helpful Guide -> bonusHours: 1)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 18;
          return this;
        }
      };

      try {
        const res = await crawler.grindSession({ hours: 5, silent: true });
        assert.equal(res.hours, 5);
        assert.equal(res.bonusHours, 1);
        assert.equal(res.totalEarnedHours, 6);
        assert.equal(res.bankedHours, 6, '5 ground hours + 1 bonus hour = 6 hours added to pool');
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('allocateGrindHours transfers hours between actor pool and skill', async () => {
      // Set actor banked hours to 10
      await crawler.update({ 'system.details.bankedGrindHours': 10 });

      // Allocate 2 hours to Dodge (Rank 2, needs 2)
      const alloc1 = await crawler.allocateGrindHours(dodge.id, 2);
      assert.equal(alloc1.newBank, 8);
      assert.equal(alloc1.newInvested, 2);
      assert.equal(alloc1.canAdvance, true);
      assert.equal(dodge.system.investedHours, 2);

      // Remove 1 hour back to bank
      const alloc2 = await crawler.allocateGrindHours(dodge.id, -1);
      assert.equal(alloc2.newBank, 9);
      assert.equal(alloc2.newInvested, 1);
      assert.equal(alloc2.canAdvance, false);
      assert.equal(dodge.system.investedHours, 1);
    });

    it('attemptSkillAdvancement tests advancement and increments rank when sufficient hours are banked', async () => {
      // Invest 2 hours into Dodge
      await dodge.update({ 'system.investedHours': 2 });

      // Mock roll 10 >= 2 (Success)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 10;
          return this;
        }
      };

      try {
        const adv = await crawler.attemptSkillAdvancement(dodge.id, { silent: true });
        assert.equal(adv.passed, true);
        assert.equal(adv.previousRank, 2);
        assert.equal(adv.newRank, 3);
        assert.equal(dodge.system.rank, 3);
        assert.equal(dodge.system.checked, false);
        assert.equal(dodge.system.investedHours, 0);
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('DCCGrindApp prepares bankedHours and per-skill progress and allocation data', async () => {
      await crawler.update({ 'system.details.bankedGrindHours': 4 });
      await pugilism.update({ 'system.investedHours': 6 });

      const app = new DCCGrindApp({ actor: crawler, hours: 5 });
      const data = await app.getData();

      assert.equal(data.bankedHours, 4);
      const pug = data.skills.find(s => s.id === pugilism.id);
      assert.ok(pug);
      assert.equal(pug.investedHours, 6);
      assert.equal(pug.requiredHours, 14);
      assert.equal(pug.neededHours, 8);
      assert.equal(pug.canAddHour, true);
      assert.equal(pug.canSubHour, true);
      assert.equal(pug.canAdvance, false);
    });
  });

  describe('9. Global Floor Timer Clock & Non-Bonus Hours Decrementing', () => {
    let crawler;

    beforeEach(async () => {
      await DCCActor.setFloorTimer(100);

      crawler = new DCCActor({
        name: 'Floor Clock Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } },
          details: { floor: '1st Floor', bankedGrindHours: 0 }
        }
      });
    });

    it('global floor timer clock has getFloorTimer, setFloorTimer, and can be manually set', async () => {
      assert.equal(typeof DCCActor.getFloorTimer, 'function');
      assert.equal(typeof DCCActor.setFloorTimer, 'function');
      assert.equal(typeof DCCActor.decrementFloorTimer, 'function');

      assert.equal(DCCActor.getFloorTimer(), 100);

      await DCCActor.setFloorTimer(150);
      assert.equal(DCCActor.getFloorTimer(), 150);
      assert.equal(crawler.getFloorTimer(), 150);

      await crawler.decrementFloorTimer(15);
      assert.equal(DCCActor.getFloorTimer(), 135);

      // Floor timer cannot go below 0
      await DCCActor.decrementFloorTimer(200);
      assert.equal(DCCActor.getFloorTimer(), 0);
    });

    it('grinding for 6 hours with neighborhood map accrues 7 grinding hours but only decrements floor timer by 6 non-bonus hours', async () => {
      await DCCActor.setFloorTimer(100);

      const res = await crawler.grindSession({
        hours: 6,
        mapType: 'neighborhood',
        rollComplication: false,
        silent: true
      });

      // 6 base hours + 1 neighborhood map bonus hour = 7 accrued grinding hours
      assert.equal(res.hours, 6, 'Base grinding duration is 6 hours');
      assert.equal(res.mapBonusHours, 1, 'Neighborhood map grants 1 bonus grinding hour');
      assert.equal(res.totalEarnedHours, 7, 'Total grinding hours accrued is 7 hours');
      assert.equal(res.nonBonusHours, 6, 'Non-bonus hours accrued is 6 hours');

      // Floor timer only decrements by the 6 non-bonus hours
      assert.equal(res.previousFloorTimer, 100, 'Previous floor timer was 100');
      assert.equal(res.floorTimer, 94, 'Floor timer decremented by exactly 6 non-bonus hours (100 -> 94)');
      assert.equal(DCCActor.getFloorTimer(), 94, 'Global floor timer state updated to 94');

      // Banked hours received full 7 hours
      assert.equal(crawler.system.details.bankedGrindHours, 7, 'Banked grind hours pool received all 7 accrued hours');
    });

    it('grinding with borough map (+2) and complication bonus (+1) accrues 9 grinding hours and uses 6 floor hours', async () => {
      await DCCActor.setFloorTimer(100);

      // Mock roll 18 for complication bonus (+1 hour)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 18; // Wandering Merchant / Helpful Guide
          return this;
        }
      };

      try {
        const res = await crawler.grindSession({
          hours: 6,
          mapType: 'borough',
          rollComplication: true,
          silent: true
        });

        // 6 base hours + 2 borough map bonus + 1 event bonus = 9 accrued grinding hours
        assert.equal(res.hours, 6);
        assert.equal(res.mapBonusHours, 2, 'Borough map grants 2 bonus grinding hours');
        assert.equal(res.complicationBonusHours, 1, 'Complication event grants 1 bonus hour');
        assert.equal(res.bonusHours, 3, 'Total bonus hours is 3 (2 map + 1 event)');
        assert.equal(res.totalEarnedHours, 9, 'Total grinding hours accrued is 9 hours');
        assert.equal(res.nonBonusHours, 6, 'Non-bonus hours is 6 hours');

        // Floor timer only decremented by 6 non-bonus hours
        assert.equal(res.floorTimer, 94, 'Floor clock decremented by 6 hours (100 -> 94)');
        assert.equal(DCCActor.getFloorTimer(), 94);
        assert.equal(crawler.system.details.bankedGrindHours, 9);
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('DCCGrindApp prepares floorTimer and resultingFloorTimer based on duration', async () => {
      await DCCActor.setFloorTimer(80);

      const app = new DCCGrindApp({ actor: crawler, hours: 6 });
      const data = await app.getData();

      assert.equal(data.floorTimer, 80);
      assert.equal(data.resultingFloorTimer, 74, '80 - 6 = 74 hrs remaining');
    });

    it('DCCCrawlerSheet getData exposes global floorTimer', async () => {
      await DCCActor.setFloorTimer(65);

      const sheet = new DCCCrawlerSheet(crawler);
      const data = await sheet.getData();

      assert.equal(data.floorTimer, 65, 'Sheet context exposes live floorTimer');
    });
  });

  describe('10. DataModel Schema Persistence & Live Pool Incrementing', () => {
    let crawler;

    beforeEach(async () => {
      crawler = new DCCActor({
        name: 'Schema Bank Tester',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } },
          details: { floor: '1st Floor', bankedGrindHours: 0 }
        }
      });
    });

    it('CrawlerDataModel.defineSchema includes bankedGrindHours field', () => {
      const schema = CrawlerDataModel.defineSchema();
      assert.ok(schema.details, 'schema.details exists');
      assert.ok(schema.details.fields.bankedGrindHours, 'bankedGrindHours field exists in CrawlerDataModel details');
      assert.equal(schema.details.fields.bankedGrindHours.initial, 0);
    });

    it('SkillDataModel.defineSchema includes investedHours field', () => {
      const schema = SkillDataModel.defineSchema();
      assert.ok(schema.investedHours, 'investedHours field exists in SkillDataModel');
      assert.equal(schema.investedHours.initial, 0);
    });

    it('grinding session increases available pool hours and immediately reflects in DCCGrindApp and sheet', async () => {
      await crawler.update({ 'system.details.bankedGrindHours': 0 });
      assert.equal(crawler.system.details.bankedGrindHours, 0);

      // Grind 6 hours with neighborhood map (+1 hr bonus = 7 hours added)
      const res = await crawler.grindSession({
        hours: 6,
        mapType: 'neighborhood',
        rollComplication: false,
        silent: true
      });

      assert.equal(res.totalEarnedHours, 7);
      assert.equal(res.bankedHours, 7);
      assert.equal(crawler.system.details.bankedGrindHours, 7, 'Actor system.details.bankedGrindHours updated to 7');

      // Check DCCGrindApp with lastGrindResult
      const app = new DCCGrindApp({ actor: crawler, hours: 6, mapType: 'neighborhood' });
      app.lastGrindResult = res;
      const appData = await app.getData();

      assert.equal(appData.bankedHours, 7, 'DCCGrindApp context.bankedHours is 7, not 0');
      assert.equal(appData.lastGrindResult.totalEarnedHours, 7);
      assert.equal(appData.lastGrindResult.bankedHours, 7);

      // Check DCCCrawlerSheet
      const sheet = new DCCCrawlerSheet(crawler);
      const sheetData = await sheet.getData();
      assert.equal(sheetData.bankedGrindHours, 7, 'CrawlerSheet context.bankedGrindHours is 7');
    });
  });

  describe('Party-Wide Grinding & Individual Crawler Execution', () => {
    let carl, donut, katia;

    beforeEach(async () => {
      await DCCActor.setFloorTimer(100);

      carl = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { con: { value: 16, mod: 4 } },
          details: { floor: '1st Floor', bankedGrindHours: 3 }
        }
      });
      await carl.createEmbeddedDocuments('Item', [
        {
          name: 'Endurance',
          type: 'skill',
          system: { rank: 5, stat: 'con', checked: true, investedHours: 0 }
        },
        {
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, stat: 'str', checked: true, investedHours: 0 }
        }
      ]);

      donut = new DCCActor({
        name: 'Princess Donut',
        type: 'crawler',
        system: {
          abilities: { con: { value: 8, mod: 3 } },
          details: { floor: '1st Floor', bankedGrindHours: 4 }
        }
      });
      await donut.createEmbeddedDocuments('Item', [
        {
          name: 'Endurance',
          type: 'skill',
          system: { rank: 1, stat: 'con', checked: false, investedHours: 0 }
        },
        {
          name: 'Magic Missile',
          type: 'skill',
          system: { rank: 2, stat: 'int', checked: true, investedHours: 0 }
        }
      ]);

      katia = new DCCActor({
        name: 'Katia',
        type: 'crawler',
        system: {
          abilities: { con: { value: 10, mod: 4 } },
          details: { floor: '1st Floor', bankedGrindHours: 0 }
        }
      });
      await katia.createEmbeddedDocuments('Item', [
        {
          name: 'Endurance',
          type: 'skill',
          system: { rank: 0, stat: 'con', checked: false, investedHours: 0 }
        }
      ]);
    });

    it('decrements floor timer once for the party by non-bonus hours accrued', async () => {
      assert.equal(DCCActor.getFloorTimer(), 100);

      const result = await DCCActor.executePartyGrindSession([carl, donut], {
        hours: 6, // 6 non-bonus hours
        mapType: 'neighborhood', // +1 bonus hour
        rollComplication: false,
        silent: true
      });

      // Floor clock decreases by exactly 6 hours, once for the party session
      assert.equal(result.nonBonusHours, 6);
      assert.equal(result.newFloorTimer, 94);
      assert.equal(DCCActor.getFloorTimer(), 94);
    });

    it('resets unspent hours in pool to zero for each crawler (use it or lose it) while awarding new hours', async () => {
      // Carl had 3 unspent banked hours, Donut had 4
      const result = await DCCActor.executePartyGrindSession([carl, donut], {
        hours: 5,
        rollComplication: false,
        silent: true
      });

      assert.equal(result.crawlerResults.length, 2);
      const carlRes = result.crawlerResults.find(r => r.id === carl.id);
      const donutRes = result.crawlerResults.find(r => r.id === donut.id);

      assert.equal(carlRes.forfeitedHours, 3, 'Carl forfeited 3 unspent pool hours');
      assert.equal(carlRes.totalEarnedHours, 5);
      assert.equal(carlRes.bankedHours, 5);
      assert.equal(carl.system.details.bankedGrindHours, 5);

      assert.equal(donutRes.forfeitedHours, 4, 'Donut forfeited 4 unspent pool hours');
      assert.equal(donutRes.totalEarnedHours, 5);
      assert.equal(donutRes.bankedHours, 5);
      assert.equal(donut.system.details.bankedGrindHours, 5);
    });

    it('runs Endurance checks individually per crawler and applies Fatigued debuff only to failures', async () => {
      // 7 hours grind (base safe 5). Excess = 2 hours (Hour 6 and Hour 7 checks)
      // Mock Roll so Carl rolls high (passes) and Donut rolls low (fails)
      const origRoll = globalThis.Roll;
      let rollCount = 0;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          rollCount++;
          // First 2 rolls are for Carl (e.g. 18, 19), next 2 rolls are for Donut (e.g. 2, 3)
          this.total = (rollCount <= 2) ? 18 : 3;
          return this;
        }
      };

      try {
        const result = await DCCActor.executePartyGrindSession([carl, donut], {
          hours: 7,
          floor: 1,
          rollComplication: false,
          silent: true
        });

        const carlRes = result.crawlerResults.find(r => r.id === carl.id);
        const donutRes = result.crawlerResults.find(r => r.id === donut.id);

        // Carl passed all checks
        assert.equal(carlRes.enduranceChecks.length, 2);
        assert.ok(carlRes.enduranceChecks.every(c => c.passed));
        assert.equal(carlRes.fatigueGained, 0);
        const carlDebuffs = carl.items.filter(i => i.type === 'debuff');
        assert.equal(carlDebuffs.length, 0, 'Carl gained 0 fatigue debuffs');

        // Donut failed checks and gained Fatigued debuff
        assert.equal(donutRes.enduranceChecks.length, 2);
        assert.ok(donutRes.enduranceChecks.some(c => !c.passed));
        assert.ok(donutRes.fatigueGained > 0);
        const donutDebuffs = donut.items.filter(i => i.type === 'debuff' && /fatigued/i.test(i.name));
        assert.ok(donutDebuffs.length > 0, 'Donut gained Fatigued debuff on failure');
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('allows crawlers to spend their banked hours individually from their sheet and advance skills', async () => {
      // Carl earns 6 banked hours
      await carl.update({ 'system.details.bankedGrindHours': 6 });
      const pugilism = carl.items.find(i => i.name === 'Pugilism');
      assert.ok(pugilism);
      assert.equal(pugilism.system.rank, 3); // Rank 3 requires 3 hours, target d20 >= 3

      // CrawlerSheet getData computes grinding properties
      const sheet = new DCCCrawlerSheet(carl);
      let sheetData = await sheet.getData();
      let pugData = sheetData.skills.find(s => s.id === pugilism.id);
      assert.equal(pugData.requiredGrindHours, 3);
      assert.equal(pugData.investedHours, 0);
      assert.equal(pugData.canAddHour, true);
      assert.equal(pugData.canAdvance, false);

      // Spend hours from sheet: allocate 3 hours to Pugilism
      await carl.allocateGrindHours(pugilism.id, 3);
      assert.equal(carl.system.details.bankedGrindHours, 3, 'Carl pool reduced to 3');
      assert.equal(pugilism.system.investedHours, 3, 'Pugilism now has 3 invested hours');

      // Now sheet reflects canAdvance: true
      sheetData = await sheet.getData();
      pugData = sheetData.skills.find(s => s.id === pugilism.id);
      assert.equal(pugData.canAdvance, true);

      // Mock Roll to pass advancement (e.g. 15 >= 3)
      const origRoll = globalThis.Roll;
      globalThis.Roll = class extends origRoll {
        async evaluate() {
          this.total = 15;
          return this;
        }
      };

      try {
        const advResult = await carl.attemptSkillAdvancement(pugilism.id);
        assert.equal(advResult.passed, true);
        assert.equal(advResult.previousRank, 3);
        assert.equal(advResult.newRank, 4);
        assert.equal(pugilism.system.rank, 4, 'Pugilism advanced to Rank 4');
        assert.equal(pugilism.system.checked, false, 'Checked flag reset after advancement');
        assert.equal(pugilism.system.investedHours, 0, 'Invested hours deducted');
      } finally {
        globalThis.Roll = origRoll;
      }
    });

    it('DCCGrindApp allows selecting party crawlers and switching active crawler tabs', async () => {
      // Setup world actors
      globalThis.game.actors = [carl, donut, katia];

      const hub = new DCCGrindApp({ actor: carl });
      let data = await hub.getData();

      assert.equal(data.crawlers.length, 3, 'Lists all 3 crawlers in party roster');
      assert.equal(data.selectedCount, 3, 'All crawlers initially selected');
      assert.equal(data.actor.id, carl.id, 'Carl is active crawler tab');

      // Deselect Katia
      hub.selectedActorIds.delete(katia.id);
      data = await hub.getData();
      assert.equal(data.selectedCount, 2);

      // Switch active tab to Donut
      hub.activeCrawlerId = donut.id;
      data = await hub.getData();
      assert.equal(data.actor.id, donut.id);
      assert.ok(data.skills.some(s => s.name === 'Magic Missile'));
    });

    it('defaults selected crawlers in DCCGrindApp to those selected in session tracking', async () => {
      globalThis.game.actors = [carl, donut, katia];

      // Create an active session that tracks only Carl and Donut (not Katia)
      await DCCSessionEngine.saveAllSessions([
        {
          id: 'session-test-grind',
          number: 1,
          title: 'Test Session',
          status: 'active',
          trackedCrawlerIds: [carl.id, donut.id],
          crawlers: {
            [carl.id]: { id: carl.id, name: carl.name },
            [donut.id]: { id: donut.id, name: donut.name }
          },
          ledger: []
        }
      ]);
      await DCCSessionEngine.setActiveSessionId('session-test-grind');

      // Initialize DCCGrindApp with no explicit crawler selection
      const hub = new DCCGrindApp();
      const data = await hub.getData();

      assert.equal(data.crawlers.length, 3, 'All 3 world crawlers listed');
      assert.equal(data.selectedCount, 2, 'Default selected count matches session tracking (2)');

      const carlItem = data.crawlers.find(c => c.id === carl.id);
      const donutItem = data.crawlers.find(c => c.id === donut.id);
      const katiaItem = data.crawlers.find(c => c.id === katia.id);

      assert.equal(carlItem.isSelected, true, 'Carl is selected (tracked in session)');
      assert.equal(donutItem.isSelected, true, 'Donut is selected (tracked in session)');
      assert.equal(katiaItem.isSelected, false, 'Katia is NOT selected (not in session tracking)');
    });

    it('Start Grind button is visible and present across Page 1 Core and Grind App ', async () => {
      // 1. Page 1 Core template includes Start Grind button
      const fs = await import('fs');
      const page1Content = fs.readFileSync('templates/actors/parts/page1-core.hbs', 'utf-8');
      assert.ok(page1Content.includes('open-grind-app'), 'Page 1 Core contains open-grind-app class');
      assert.ok(page1Content.includes('Start Grind'), 'Page 1 Core has explicit "Start Grind" button');

      // 2. Grind App template contains explicit Start Grind execute buttons
      const grindAppContent = fs.readFileSync('templates/apps/grind-app.hbs', 'utf-8');
      assert.ok(grindAppContent.includes('Start Grind'), 'Grind App contains "Start Grind" button');
    });
  });
});


