import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCGrindApp } from '../src/apps/grind-app.mjs';
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
        system: { rank: 2, stat: 'dex', checked: true }
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
});
