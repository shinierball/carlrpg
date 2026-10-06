import './setup.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { DCCBasePointBuilderApp } from '../src/apps/base-point-builder.mjs';
import { DCCClassCreatorApp } from '../src/apps/class-creator.mjs';
import { DCC_POINT_BUILD_BENEFITS, DCC_POINT_BUILD_DETRIMENTS } from '../src/data/point-build-catalog.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('DCC Point Build Engine - Basic Initial State', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });
  const data = app.getData();

  assert.equal(data.baseBudget, 30);
  assert.equal(data.spent, 0);
  assert.equal(data.extraPoints, 0);
  assert.equal(data.effectiveBudget, 30);
  assert.equal(data.remaining, 30);
  assert.equal(data.isOverbudget, false);
  assert.equal(data.isLegal, true);
  assert.equal(data.ledger.receiptItems.length, 0);
});

test('DCC Point Build Engine - Stat Point Accounting', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });
  
  // STR +2, CON +1 -> Costs 3 BP
  app.setStatBonus('str', 2);
  app.setStatBonus('con', 1);

  let data = app.getData();
  assert.equal(data.statCost, 3);
  assert.equal(data.spent, 3);
  assert.equal(data.remaining, 27);

  // Negative stat penalty: -2 DEX grants +1 extra BP to spend
  app.setStatBonus('dex', -2);
  data = app.getData();
  assert.equal(data.statPenaltyExtra, 1);
  assert.equal(data.extraPoints, 1);
  assert.equal(data.effectiveBudget, 31);
  assert.equal(data.remaining, 28); // 31 - 3 = 28
});

test('DCC Point Build Engine - Skill and Spell Point Accounting', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });

  // Add an active skill rank 2 -> Costs 4 BP (2 BP per rank)
  app.addSkill({ name: 'Power Cleave', type: 'active', rank: 2 });
  // Add a passive skill rank 3 -> Costs 6 BP
  app.addSkill({ name: 'Iron Hide', type: 'passive', rank: 3 });
  // Add a spell rank 1 -> Costs 2 BP
  app.addSpell({ name: 'Fire Dart', rank: 1, mpCost: 3 });

  const data = app.getData();
  assert.equal(data.skillCost, 10); // 4 + 6
  assert.equal(data.spellCost, 2);
  assert.equal(data.spent, 12);
  assert.equal(data.hasSkillRankCapWarning, false);

  // Exceed passive rank cap (> 5) -> triggers warning flag but does not block build
  app.addSkill({ name: 'Super Sense', type: 'passive', rank: 6 });
  const capData = app.getData();
  assert.equal(capData.hasSkillRankCapWarning, true);
  assert.equal(capData.isLegal, false);
});

test('DCC Point Build Engine - Catalog Benefits and Detriments', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });

  // Add Minor Benefit (1 BP), Moderate Benefit (2 BP), Extreme Benefit (4 BP)
  app.addCatalogBenefit('minor_darkvision'); // 1 BP
  app.addCatalogBenefit('mod_dr_buff_1'); // 2 BP
  app.addCatalogBenefit('extreme_poison_immunity'); // 4 BP

  let data = app.getData();
  assert.equal(data.benefitCost, 7);
  assert.equal(data.spent, 7);

  // Add Detriments (Refund Extra BP, max 5 extra BP)
  app.addCatalogDetriment('det_minor_stat_penalties'); // Minor (+1 BP)
  app.addCatalogDetriment('det_mod_broad_disadvantage'); // Moderate (+2 BP)
  app.addCatalogDetriment('det_major_common_vulnerability'); // Major (+3 BP)
  // Total detriment points = 1 + 2 + 3 = 6, but capped at 5 extra BP
  data = app.getData();
  assert.equal(data.detrimentExtraPoints, 5);
  assert.equal(data.rawDetrimentPoints, 6);
  assert.equal(data.effectiveBudget, 36); // 30 base + 6 raw detriments under soft limit
  assert.equal(data.spent, 7);
  assert.equal(data.remaining, 29); // 36 - 7 = 29
  assert.equal(data.ledger.isDetrimentCapped, true);
});

test('DCC Point Build Engine - Custom Freeform Perks', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });

  app.addCustomPerk({ name: 'Secret Tunnel Sense', type: 'benefit', tier: 'Moderate', points: 2, description: 'Senses hidden doors' });
  app.addCustomPerk({ name: 'Loud Breathing', type: 'detriment', tier: 'Minor', points: 1, extraPoints: 1, description: 'Disadvantage on stealth' });

  const data = app.getData();
  assert.equal(data.customCost, 2);
  assert.equal(data.detrimentExtraPoints, 1);
  assert.equal(data.spent, 2);
  assert.equal(data.effectiveBudget, 31);
});

test('DCC Point Build Engine - Soft-Limit Non-Enforcement Policy', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });

  // Spend 45 BP (over budget of 30)
  app.setStatBonus('str', 15);
  app.setStatBonus('dex', 15);
  app.setStatBonus('con', 15);

  const data = app.getData();
  assert.equal(data.spent, 45);
  assert.equal(data.remaining, -15);
  assert.equal(data.isOverbudget, true);
  assert.equal(data.isLegal, false);

  // CRITICAL REQUIREMENT: createItemData() must succeed and not throw or fail!
  const itemData = app.createItemData();
  assert.ok(itemData);
  assert.equal(itemData.name, 'Custom Class');
  assert.equal(itemData.type, 'class');
  assert.equal(itemData.system.buildLedger.spent, 45);
  assert.equal(itemData.system.buildLedger.isOverbudget, true);
});

test('DCC Point Build Engine - Reset and JSON Export/Import', () => {
  const app = new DCCBasePointBuilderApp({ mode: 'class', baseBudget: 30 });
  app.build.name = 'Test Shadowblade';
  app.setStatBonus('dex', 3);
  app.addCatalogBenefit('mod_dr_buff_1');

  const jsonStr = app.exportBuildJSON();
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.name, 'Test Shadowblade');
  assert.equal(parsed.system.statModifiers.dex, 3);

  // Reset
  app.resetBuild();
  assert.equal(app.build.name, 'Custom Class');
  assert.equal(app.build.stats.dex, 0);
  assert.equal(app.build.benefits.length, 0);

  // Import
  app.importBuildJSON(jsonStr);
  assert.equal(app.build.name, 'Test Shadowblade');
  assert.equal(app.build.stats.dex, 3);
  assert.equal(app.build.selectedBenefits.length, 1);
});

test('DCC Class Creator App - Archetypes and Earth Class Perk', () => {
  const app = new DCCClassCreatorApp();

  assert.equal(app.build.archetype, 'fighter');
  app.setArchetype('Barbarian');
  assert.equal(app.build.archetype, 'barbarian');

  // Toggle Earth Class
  app.toggleEarthClass(false);
  assert.equal(app.build.isEarthClass, false);
  app.toggleEarthClass(true);
  assert.equal(app.build.isEarthClass, true);

  const data = app.getData();
  assert.ok(data.benefits.some(b => b.id === 'earth_class_knowledge'));
  // Earth class benefit is free (0 BP)
  const earthPerk = data.benefits.find(b => b.id === 'earth_class_knowledge');
  assert.equal(earthPerk.points, 0);
});

test('DCC Class Creator App - Preset Bob "Dungeon Dad"', () => {
  const app = new DCCClassCreatorApp();
  app.loadPreset('dungeon_dad');

  const data = app.getData();
  assert.equal(app.build.name, 'Dungeon Dad');
  assert.equal(app.build.archetype, 'bard');
  assert.equal(app.build.stats.cha, 2);
  assert.equal(app.build.stats.dex, -2);
  assert.equal(data.statPenaltyExtra, 1); // -2 DEX gives +1 extra BP

  // Verify skills are present
  assert.ok(app.build.skills.some(s => s.name === 'Catcher'));
  assert.ok(app.build.skills.some(s => s.name === 'Repair'));
  assert.ok(app.build.skills.some(s => s.name === 'Tactics'));
  assert.ok(app.build.skills.some(s => s.name === 'Longsword (Choice)'));

  // Verify benefits and detriments
  assert.ok(app.build.selectedBenefits.some(b => b.id === 'extreme_party_buff'));
  assert.ok(app.build.selectedDetriments.some(d => d.id === 'det_minor_stat_penalties'));

  // Ledger summary
  assert.ok(data.spent >= 30);
  const itemData = app.createItemData();
  assert.equal(itemData.name, 'Dungeon Dad');
  assert.equal(itemData.type, 'class');
  assert.equal(itemData.system.archetype, 'bard');
});

test('DCC Class Creator App - World Item Creation and Actor Application', async () => {
  const app = new DCCClassCreatorApp();
  app.build.name = 'Crawling Berserker';
  app.setStatBonus('str', 3);
  app.setStatBonus('con', 2);
  app.addSkill({ name: 'Rage Whirlwind', type: 'active', rank: 2 });
  app.addCatalogBenefit('mod_dr_buff_1');

  // Save to world item
  const createdItem = await app.saveToWorldItem();
  assert.ok(createdItem);
  assert.equal(createdItem.name, 'Crawling Berserker');
  assert.equal(createdItem.type, 'class');
  assert.equal(createdItem.system.bonuses.stats.str, 3);
  assert.equal(createdItem.system.bonuses.stats.con, 2);

  // Apply to Actor
  const actor = new DCCActor({
    name: 'Carl Tester',
    type: 'crawler',
    system: {
      abilities: {
        str: { value: 12 },
        con: { value: 10 }
      }
    }
  });

  const appliedClassItem = await app.applyToActor(actor);
  assert.ok(appliedClassItem);
  assert.equal(actor.items.length, 2); // 1 Class item + 1 Skill item
  const skillItem = actor.items.find(i => i.name === 'Rage Whirlwind');
  assert.ok(skillItem);
  assert.equal(skillItem.type, 'skill');
  assert.equal(skillItem.system.rank, 2);
});
