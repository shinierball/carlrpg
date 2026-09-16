import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';

import {
  DCC_STANDARD_ARRAY,
  DCC_SPECIES_DATA,
  DCC_BACKGROUND_MATRICES,
  validateStatArray,
  resolveSkillRanks,
  generateRandomCrawler
} from '../src/data/crawler-creation.mjs';
import { DCCCrawlerCreatorApp } from '../src/apps/crawler-creator.mjs';

test('DCC RPG Crawler Character Creator Subsystem', async (t) => {

  await t.test('1. Background Matrices Dataset Integrity', () => {
    // Human matrix validation
    assert.strictEqual(DCC_BACKGROUND_MATRICES.human.tier1.length, 12, 'Human Tier 1 (Childhood) should have 12 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.human.tier2.length, 12, 'Human Tier 2 (Adolescence) should have 12 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.human.tier3.length, 12, 'Human Tier 3 (Career) should have 12 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.human.tier4.length, 12, 'Human Tier 4 (Hobby) should have 12 backgrounds');

    for (const [tierKey, bgs] of Object.entries(DCC_BACKGROUND_MATRICES.human)) {
      for (const bg of bgs) {
        assert.ok(bg.name, `Human ${tierKey} background must have a name`);
        assert.strictEqual(bg.skills.length, 3, `Human background "${bg.name}" must have exactly 3 skills`);
        for (const skill of bg.skills) {
          assert.ok(skill.name, `Skill in "${bg.name}" must have a name`);
          assert.ok(skill.stat, `Skill "${skill.name}" in "${bg.name}" must have a governing stat`);
        }
      }
    }

    // Animal matrix validation
    assert.strictEqual(DCC_BACKGROUND_MATRICES.animal.tier1.length, 6, 'Animal Tier 1 (Youth) should have 6 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.animal.tier2.length, 6, 'Animal Tier 2 (Training) should have 6 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.animal.tier3.length, 6, 'Animal Tier 3 (Adult) should have 6 backgrounds');
    assert.strictEqual(DCC_BACKGROUND_MATRICES.animal.tier4.length, 6, 'Animal Tier 4 (Quirk) should have 6 backgrounds');

    for (const [tierKey, bgs] of Object.entries(DCC_BACKGROUND_MATRICES.animal)) {
      for (const bg of bgs) {
        assert.ok(bg.name, `Animal ${tierKey} background must have a name`);
        assert.strictEqual(bg.skills.length, 3, `Animal background "${bg.name}" must have exactly 3 skills`);
        for (const skill of bg.skills) {
          assert.ok(skill.name, `Skill in "${bg.name}" must have a name`);
          assert.ok(skill.stat, `Skill "${skill.name}" in "${bg.name}" must have a governing stat`);
        }
      }
    }
  });

  await t.test('2. Species Inherent Rules & Perks', () => {
    const human = DCC_SPECIES_DATA.human;
    assert.strictEqual(human.aiFavor, 1, 'Humans start with 1 AI Favor');
    assert.strictEqual(human.inherentSkill.name, 'Unarmed Combat', 'Humans start with Unarmed Combat');
    assert.strictEqual(human.inherentSkill.rank, 3, 'Human Unarmed Combat starts at rank 3');
    assert.strictEqual(human.tierRanks.tier1, 1, 'Childhood grants rank 1');
    assert.strictEqual(human.tierRanks.tier2, 1, 'Adolescence grants rank 1');
    assert.strictEqual(human.tierRanks.tier3, 3, 'Career grants rank 3');
    assert.strictEqual(human.tierRanks.tier4, 2, 'Hobby grants rank 2');

    const animal = DCC_SPECIES_DATA.animal;
    assert.strictEqual(animal.aiFavor, 0, 'Animals surrender AI Favor to be animals (0 favor)');
    assert.strictEqual(animal.inherentSkill.name, 'Slice Attack', 'Animals start with Slice Attack');
    assert.strictEqual(animal.inherentSkill.rank, 3, 'Animal Slice Attack starts at rank 3');
    assert.strictEqual(animal.tierRanks.tier1, 1, 'Youth grants rank 1');
    assert.strictEqual(animal.tierRanks.tier2, 1, 'Training grants rank 1');
    assert.strictEqual(animal.tierRanks.tier3, 3, 'Adult grants rank 3');
    assert.strictEqual(animal.tierRanks.tier4, 2, 'Quirk grants rank 2');
  });

  await t.test('3. Standard Array Stat Validation', () => {
    assert.deepStrictEqual(DCC_STANDARD_ARRAY, [2, 3, 4, 5, 6]);

    // Valid assignment
    const validAssign = { str: 5, con: 6, int: 2, dex: 4, cha: 3 };
    const resValid = validateStatArray(validAssign);
    assert.strictEqual(resValid.valid, true);
    assert.deepStrictEqual(resValid.remaining, []);

    // Incomplete assignment
    const incomplete = { str: 5, con: 6, int: 2 };
    const resIncomplete = validateStatArray(incomplete);
    assert.strictEqual(resIncomplete.valid, false);
    assert.ok(resIncomplete.error.includes('All 5 stats must be assigned'));

    // Duplicate value
    const duplicateVal = { str: 6, con: 6, int: 2, dex: 4, cha: 3 };
    const resDuplicate = validateStatArray(duplicateVal);
    assert.strictEqual(resDuplicate.valid, false);
    assert.ok(resDuplicate.error.includes('without duplicates'));

    // Invalid score outside standard array
    const outsideArray = { str: 10, con: 5, int: 2, dex: 4, cha: 3 };
    const resOutside = validateStatArray(outsideArray);
    assert.strictEqual(resOutside.valid, false);
  });

  await t.test('4. Non-Additive Skill Rank Resolution & Duplicate Warnings', () => {
    // Human picks Streetwise in Childhood (Rank 1) and in Career (Rank 3)
    const tierSelections = {
      tier1: {
        background: 'Latchkey Kid',
        skills: ['Streetwise', 'Perception']
      },
      tier2: {
        background: 'Nerd',
        skills: ['Investigation', 'Fabricate']
      },
      tier3: {
        background: 'Criminal',
        skills: ['Streetwise', 'Stealth']
      },
      tier4: {
        background: 'Gamer',
        skills: ['Aiming', 'Tactics']
      }
    };

    const resolved = resolveSkillRanks('human', tierSelections);

    // Inherent skill should be present
    const unarmed = resolved.skills.find(s => s.name === 'Unarmed Combat');
    assert.ok(unarmed, 'Inherent Unarmed Combat should be present');
    assert.strictEqual(unarmed.rank, 3);

    // Streetwise should be Rank 3, NOT Rank 4 (1 + 3)
    const streetwise = resolved.skills.find(s => s.name === 'Streetwise');
    assert.ok(streetwise, 'Streetwise should be present');
    assert.strictEqual(streetwise.rank, 3, 'Streetwise must resolve to highest rank (3), not additive (4)');

    // Duplicate detection
    assert.strictEqual(resolved.duplicates.length, 1, 'Should detect 1 duplicate skill');
    assert.strictEqual(resolved.duplicates[0].name, 'Streetwise');
    assert.strictEqual(resolved.duplicates[0].appliedRank, 3);
    assert.strictEqual(resolved.warnings.length, 1);
    assert.ok(resolved.warnings[0].includes('Duplicate skill selected: "Streetwise"'));
    assert.ok(resolved.warnings[0].includes('Rank 3'));

    // Perception should be Rank 1
    const perception = resolved.skills.find(s => s.name === 'Perception');
    assert.strictEqual(perception.rank, 1);

    // Stealth should be Rank 3 (from Career)
    const stealth = resolved.skills.find(s => s.name === 'Stealth');
    assert.strictEqual(stealth.rank, 3);

    // Aiming should be Rank 2 (from Hobby)
    const aiming = resolved.skills.find(s => s.name === 'Aiming');
    assert.strictEqual(aiming.rank, 2);
  });

  await t.test('5. Animal Skill Rank Resolution & Non-Additive Merging', () => {
    // Animal picks Escape Artist in Youth (Rank 1) and in Adult (Rank 3)
    const tierSelections = {
      tier1: {
        background: 'Farmed',
        skills: ['Escape Artist', 'Climbing']
      },
      tier2: {
        background: 'Clever',
        skills: ['Investigation', 'Detect Lies']
      },
      tier3: {
        background: 'Pile of Floof',
        skills: ['Escape Artist', 'Persuasion']
      },
      tier4: {
        background: 'Hunter',
        skills: ['Hide in Shadows', 'Stealth']
      }
    };

    const resolved = resolveSkillRanks('animal', tierSelections);

    // Inherent Slice Attack
    const slice = resolved.skills.find(s => s.name === 'Slice Attack');
    assert.ok(slice, 'Slice Attack should be inherent');
    assert.strictEqual(slice.rank, 3);

    // Escape artist must be rank 3 (not 1 + 3 = 4)
    const escape = resolved.skills.find(s => s.name === 'Escape Artist');
    assert.strictEqual(escape.rank, 3);
    assert.strictEqual(resolved.duplicates.length, 1);
    assert.strictEqual(resolved.duplicates[0].name, 'Escape Artist');
  });

  await t.test('6. Procedural Legal Randomizer', () => {
    for (let i = 0; i < 5; i++) {
      const randomCrawler = generateRandomCrawler('human', '2nd Floor');
      assert.ok(randomCrawler.name.length > 0);
      assert.strictEqual(randomCrawler.species, 'human');
      assert.strictEqual(randomCrawler.aiFavor, 1);
      assert.strictEqual(randomCrawler.floor, '2nd Floor');
      assert.strictEqual(randomCrawler.level, 2);

      // Verify stats are legal permutation of [2, 3, 4, 5, 6]
      const statValidation = validateStatArray(randomCrawler.stats);
      assert.strictEqual(statValidation.valid, true);

      // Verify all 4 tiers have exactly 2 skills
      for (let t = 1; t <= 4; t++) {
        const tier = randomCrawler.tierSelections[`tier${t}`];
        assert.ok(tier.background);
        assert.strictEqual(tier.skills.length, 2);
      }
    }
  });

  await t.test('7. DCCCrawlerCreatorApp View Model & State Evaluation', async () => {
    const app = new DCCCrawlerCreatorApp({
      name: 'Carl',
      species: 'human',
      floor: '1st Floor',
      stats: { str: 5, con: 6, int: 2, dex: 4, cha: 3 }
    });

    const data = await app.getData();
    assert.strictEqual(data.name, 'Carl');
    assert.strictEqual(data.isHuman, true);
    assert.strictEqual(data.speciesData.aiFavor, 1);
    assert.strictEqual(data.tiers.length, 4);
    assert.strictEqual(data.canCreate, true, 'Default setup with valid stats should be ready to create');

    // Invalidate a stat
    app.stats.str = 6; // causes duplicate 6
    const dataInvalid = await app.getData();
    assert.strictEqual(dataInvalid.statValidation.valid, false);
    assert.strictEqual(dataInvalid.canCreate, false);
  });

  await t.test('8. Full Actor Document Generation & Embedding', async () => {
    const app = new DCCCrawlerCreatorApp({
      name: 'Princess Donut',
      species: 'animal',
      floor: '3rd Floor',
      stats: { str: 2, dex: 6, con: 4, int: 5, cha: 3 }
    });

    // Configure selections
    app.tierSelections = {
      tier1: {
        background: 'Pampered',
        skills: ['Good First Impression', 'Persuasion']
      },
      tier2: {
        background: 'Clever',
        skills: ['Investigation', 'Detect Lies']
      },
      tier3: {
        background: 'Show Animal',
        skills: ['Light on Your Feet', 'Performance']
      },
      tier4: {
        background: 'Social',
        skills: ['Animal Handling', 'Taunt']
      }
    };

    const actor = await app.createCrawler();
    assert.ok(actor, 'Actor should be created successfully');
    assert.strictEqual(actor.name, 'Princess Donut');
    assert.strictEqual(actor.type, 'crawler');
    assert.strictEqual(actor.system.details.race, 'Animal');
    assert.strictEqual(actor.system.details.floor, '3rd Floor');
    assert.strictEqual(actor.system.details.level, 3);
    assert.strictEqual(actor.system.attributes.aiFavor, 0);

    // Abilities check
    assert.strictEqual(actor.system.abilities.str.value, 2);
    assert.strictEqual(actor.system.abilities.dex.value, 6);
    assert.strictEqual(actor.system.abilities.con.value, 4);
    assert.strictEqual(actor.system.abilities.int.value, 5);
    assert.strictEqual(actor.system.abilities.cha.value, 3);

    // Items check (inherent + 8 background skills + 1 starter weapon skill)
    const skills = actor.items.filter(i => i.type === 'skill');
    assert.strictEqual(skills.length, 10, 'Actor should have 1 inherent + 8 background skills + 1 starter weapon skill');

    const sliceSkill = skills.find(s => s.name === 'Slice Attack');
    assert.ok(sliceSkill, 'Should have Slice Attack');
    assert.strictEqual(sliceSkill.system.rank, 3);

    const performanceSkill = skills.find(s => s.name === 'Performance');
    assert.ok(performanceSkill, 'Should have Performance');
    assert.strictEqual(performanceSkill.system.rank, 3, 'Performance from Show Animal Adult should be Rank 3');

    const persuasionSkill = skills.find(s => s.name === 'Persuasion');
    assert.ok(persuasionSkill, 'Should have Persuasion');
    assert.strictEqual(persuasionSkill.system.rank, 1, 'Persuasion from Pampered Youth should be Rank 1');

    const starterWeaponSkill = skills.find(s => s.name === 'Longsword');
    assert.ok(starterWeaponSkill, 'Should have starter weapon skill Longsword');
    assert.strictEqual(starterWeaponSkill.system.rank, 3, 'Starter weapon skill should be Rank 3');

    // Spells check (universal Heal spell at Rank 1)
    const healSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Heal');
    assert.ok(healSpell, 'Should start with universal Heal spell');
    assert.strictEqual(healSpell.system.rank, 1, 'Heal spell should be Rank 1');
  });
});
