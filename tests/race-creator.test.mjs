import './setup.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { DCCBasePointBuilderApp } from '../src/apps/base-point-builder.mjs';
import { DCCRaceCreatorApp, DCC_RACE_SIZE_OPTIONS } from '../src/apps/race-creator.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

test('DCC Race Creator Studio - Default Initial State', () => {
  const app = new DCCRaceCreatorApp();
  const data = app.getData();

  assert.equal(data.builderType, 'race');
  assert.equal(data.baseBudget, 25);
  assert.equal(data.spent, 0);
  assert.equal(data.extraPoints, 0);
  assert.equal(data.effectiveBudget, 25);
  assert.equal(data.remaining, 25);
  assert.equal(data.heritage, 'Earth');
  assert.equal(data.isEarth, true);
  assert.equal(data.isAlien, false);
  assert.equal(data.size, 4);
  assert.equal(data.sizeName, 'Medium');
  assert.equal(data.sizeCost, 0);
  assert.equal(data.isOverbudget, false);
  assert.equal(data.isLegal, true);

  // Inherent Earth perk included
  assert.ok(data.benefits.some(b => b.id === 'earth_silver_box'));
});

test('DCC Race Creator Studio - Heritage Switching & Inherent Perks', () => {
  const app = new DCCRaceCreatorApp();

  // Switch to Alien Syndicate Heritage
  app.setHeritage('Alien');
  let data = app.getData();
  assert.equal(data.heritage, 'Alien');
  assert.equal(data.isAlien, true);
  assert.equal(data.isEarth, false);
  assert.ok(data.benefits.some(b => b.id === 'alien_galactic_popularity'));
  assert.ok(!data.benefits.some(b => b.id === 'earth_silver_box'));

  // Item generation includes Galactic Fanbase
  let itemData = app.createItemData();
  assert.equal(itemData.type, 'race');
  assert.equal(itemData.system.heritage, 'Alien');
  assert.ok(itemData.system.perks.some(p => p.includes('Galactic Fanbase Popularity')));

  // Switch back to Earth
  app.setHeritage('Earth');
  data = app.getData();
  assert.equal(data.heritage, 'Earth');
  assert.equal(data.isEarth, true);
  assert.ok(data.benefits.some(b => b.id === 'earth_silver_box'));
  itemData = app.createItemData();
  assert.equal(itemData.system.heritage, 'Earth');
  assert.ok(itemData.system.perks.some(p => p.includes('Silver Earth Box')));
});

test('DCC Race Creator Studio - Creature Size Pricing & Accounting', () => {
  const app = new DCCRaceCreatorApp();

  // Medium (Size 4) is 0 BP
  app.setSize(4);
  let data = app.getData();
  assert.equal(data.sizeCost, 0);
  assert.equal(data.spent, 0);

  // Petite (Size 3) is 0 BP
  app.setSize(3);
  data = app.getData();
  assert.equal(data.sizeCost, 0);
  assert.equal(data.spent, 0);

  // Small (Size 2) is a Major Benefit (3 BP)
  app.setSize(2);
  data = app.getData();
  assert.equal(data.sizeCost, 3);
  assert.equal(data.spent, 3);
  assert.equal(data.remaining, 22); // 25 - 3 = 22
  assert.ok(data.ledger.receiptItems.some(i => i.type === 'size' && i.cost === 3));

  // Large (Size 5) is a Major Benefit (3 BP)
  app.setSize(5);
  data = app.getData();
  assert.equal(data.sizeCost, 3);
  assert.equal(data.spent, 3);
  assert.equal(data.sizeName, 'Large');

  // Tiny (Size 1) is a Major Benefit (3 BP)
  app.setSize(1);
  data = app.getData();
  assert.equal(data.sizeCost, 3);

  // Huge (Size 6) is a Major Benefit (3 BP)
  app.setSize(6);
  data = app.getData();
  assert.equal(data.sizeCost, 3);
});

test('DCC Race Creator Studio - Stat Point Accounting & Negative Refunds', () => {
  const app = new DCCRaceCreatorApp();

  // +3 DEX, +2 CON -> Costs 5 BP
  app.setStatBonus('dex', 3);
  app.setStatBonus('con', 2);
  let data = app.getData();
  assert.equal(data.statCost, 5);
  assert.equal(data.spent, 5);
  assert.equal(data.remaining, 20);

  // Negative stat penalty: -2 STR refunds +1 Extra BP
  app.setStatBonus('str', -2);
  data = app.getData();
  assert.equal(data.statPenaltyExtra, 1);
  assert.equal(data.extraPoints, 1);
  assert.equal(data.effectiveBudget, 26); // 25 + 1 = 26
  assert.equal(data.remaining, 21); // 26 - 5 = 21
});

test('DCC Race Creator Studio - Racial Skills, Spells & Passive Cap', () => {
  const app = new DCCRaceCreatorApp();

  // Active skill Rank 2 (4 BP), Spell Rank 1 (2 BP)
  app.addSkill({ name: 'Web Spinning', type: 'active', rank: 2 });
  app.addSpell({ name: 'Venom Dart', rank: 1, mpCost: 2 });
  let data = app.getData();
  assert.equal(data.skillCost, 4);
  assert.equal(data.spellCost, 2);
  assert.equal(data.spent, 6);
  assert.equal(data.hasSkillRankCapWarning, false);

  // Add passive skill Rank 6 (> 5 cap)
  app.addSkill({ name: 'Cat Reflexes', type: 'passive', rank: 6 });
  data = app.getData();
  assert.equal(data.hasSkillRankCapWarning, true);
  assert.equal(data.isLegal, false); // Flags soft limit warning
});

test('DCC Race Creator Studio - Catalog Benefits and Detriments', () => {
  const app = new DCCRaceCreatorApp();

  // Add Minor Darkvision (1 BP) and Moderate DR (2 BP)
  app.addCatalogBenefit('minor_darkvision');
  app.addCatalogBenefit('mod_dr_buff_1');
  let data = app.getData();
  assert.equal(data.benefitCost, 3);
  assert.equal(data.spent, 3);

  // Add Detriments
  app.addCatalogDetriment('det_minor_stat_penalties'); // +1 BP
  app.addCatalogDetriment('det_mod_broad_disadvantage'); // +2 BP
  app.addCatalogDetriment('det_major_common_vulnerability'); // +3 BP
  data = app.getData();
  assert.equal(data.rawDetrimentPoints, 6);
  assert.equal(data.detrimentExtraPoints, 5); // Standard +5 extra BP legal cap
  assert.equal(data.ledger.isDetrimentCapped, true);
  assert.equal(data.effectiveBudget, 31); // 25 base + 6 raw detriments
  assert.equal(data.remaining, 28); // 31 - 3 = 28
});

test('DCC Race Creator Studio - Soft-Limit Non-Enforcement Policy', () => {
  const app = new DCCRaceCreatorApp();

  // Overspend massively (45 BP spent out of 25)
  app.setStatBonus('str', 15);
  app.setStatBonus('dex', 15);
  app.setStatBonus('con', 15);

  const data = app.getData();
  assert.equal(data.spent, 45);
  assert.equal(data.remaining, -20);
  assert.equal(data.isOverbudget, true);
  assert.equal(data.isLegal, false);

  // CRITICAL REQUIREMENT: createItemData() must succeed without blocking or failing!
  const itemData = app.createItemData();
  assert.ok(itemData);
  assert.equal(itemData.name, 'Unnamed Custom Race');
  assert.equal(itemData.type, 'race');
  assert.equal(itemData.system.buildLedger.spent, 45);
  assert.equal(itemData.system.buildLedger.isOverbudget, true);
});

test('DCC Race Creator Studio - Preset Loading (Canonical Cat Race)', () => {
  const app = new DCCRaceCreatorApp();

  // Load canonical Cat race preset
  app.loadPreset('Cat');
  const data = app.getData();

  assert.equal(app.name, 'Cat');
  assert.equal(data.heritage, 'Earth');
  assert.equal(data.size, 2);
  assert.equal(data.sizeName, 'Small');
  assert.equal(data.sizeCost, 3); // Small size is 3 BP

  // Stats parsed: +4 DEX, -2 CON, -1 CHA, -3 STR
  assert.equal(app.stats.dex, 4);
  assert.equal(app.stats.con, -2);
  assert.equal(app.stats.cha, -1);
  assert.equal(app.stats.str, -3);

  const itemData = app.createItemData();
  assert.equal(itemData.name, 'Cat');
  assert.equal(itemData.type, 'race');
  assert.equal(itemData.system.size, 'Small (2)');
  assert.equal(itemData.system.heritage, 'Earth');
});

test('DCC Race Creator Studio - JSON Export & Import', () => {
  const app = new DCCRaceCreatorApp();
  app.name = 'Tetrakai Stalker';
  app.setHeritage('Earth');
  app.setSize(4);
  app.setStatBonus('dex', 4);
  app.addCatalogBenefit('minor_darkvision');

  const jsonStr = app.exportBuildJSON();
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.name, 'Tetrakai Stalker');
  assert.equal(parsed.system.heritage, 'Earth');
  assert.equal(parsed.system.statModifiers.dex, 4);

  // Reset
  app.resetBuild();
  assert.equal(app.name, 'Unnamed Custom Race');
  assert.equal(app.stats.dex, 0);

  // Import
  app.importBuildJSON(jsonStr);
  assert.equal(app.name, 'Tetrakai Stalker');
  assert.equal(app.stats.dex, 4);
  assert.equal(app.selectedBenefits.length, 1);
});

test('DCC Race Creator Studio - World Item Creation and Crawler Sheet Application', async () => {
  const app = new DCCRaceCreatorApp();
  app.name = 'Obsidian Drake';
  app.setHeritage('Alien');
  app.setSize(5); // Large (3 BP)
  app.setStatBonus('con', 4);
  app.setStatBonus('str', 3);
  app.addSkill({ name: 'Scale Hardening', type: 'active', rank: 2 });

  // 1. Save to World Item
  const createdItem = await app.saveToWorldItem();
  assert.ok(createdItem);
  assert.equal(createdItem.name, 'Obsidian Drake');
  assert.equal(createdItem.type, 'race');
  assert.equal(createdItem.system.heritage, 'Alien');
  assert.equal(createdItem.system.size, 'Large (5)');
  assert.equal(createdItem.system.bonuses.stats.con, 4);

  // 2. Apply to Crawler Actor
  const actor = new DCCActor({
    name: 'Donut Drake',
    type: 'crawler',
    system: {
      details: {
        race: 'Human'
      },
      attributes: {
        size: 'Medium'
      },
      abilities: {
        str: { value: 10 },
        con: { value: 10 }
      }
    }
  });

  const appliedRaceItem = await app.applyToActor(actor);
  assert.ok(appliedRaceItem);

  // Check Actor updates
  assert.equal(actor.system.details.race, 'Obsidian Drake');
  assert.equal(actor.system.attributes.size, 'Large');
  assert.equal(actor.system.abilities.str.value, 13); // 10 + 3
  assert.equal(actor.system.abilities.con.value, 14); // 10 + 4

  // Check Embedded Items (1 Race + 1 Skill)
  assert.equal(actor.items.length, 2);
  const raceItem = actor.items.find(i => i.name === 'Obsidian Drake');
  assert.ok(raceItem);
  assert.equal(raceItem.type, 'race');
  const skillItem = actor.items.find(i => i.name === 'Scale Hardening');
  assert.ok(skillItem);
  assert.equal(skillItem.type, 'skill');
  assert.equal(skillItem.system.rank, 2);
});

test('DCC Race Creator Studio - Damage Reduction (DR) Stepper and Point Accounting', async () => {
  const app = new DCCRaceCreatorApp();

  assert.equal(app.drBonus, 0);
  assert.equal(app.getData().drBonus, 0);
  assert.equal(app.getData().drCost, 0);

  // Increment DR to +2 (costs 4 BP)
  app.stepDR(2);
  assert.equal(app.drBonus, 2);
  assert.equal(app.getData().drCost, 4);
  assert.equal(app.getData().benefitCost, 4);
  assert.ok(app.selectedBenefits.some(b => b.id === 'mod_dr_buff_2'));

  const itemData = app.createItemData();
  assert.equal(itemData.system.drBonus, 2);
  assert.ok(itemData.system.perks.some(p => p.includes('DR')));

  const actor = new DCCActor({
    name: 'Carapace Crawler',
    type: 'crawler',
    system: {
      attributes: {
        dr: { value: 0, buffs: 0 }
      }
    }
  });

  await app.applyToActor(actor);
  assert.equal(actor.system.attributes.dr.buffs, 2);
});

test('DCC Race Creator Studio - Canonical Race Templates Load and Populate All Fields', () => {
  const app = new DCCRaceCreatorApp();
  const data = app.getData();

  // All 30 Canonical DCC Races listed in presets
  assert.equal(data.presets.length, 30);

  // Test loading Amazonian
  const amazonPreset = data.presets.find(p => p.name.includes("Amazonian"));
  assert.ok(amazonPreset);
  app.loadPreset(amazonPreset.id);

  assert.equal(app.name, "Amazonian");
  assert.equal(app.heritage, 'Earth');
  assert.equal(app.size, 4);
  assert.equal(app.stats.str, 6);
  assert.equal(app.stats.dex, 3);
  assert.equal(app.drBonus, 2);
  assert.ok(app.skills.some(s => s.name === 'Bow'));
  assert.ok(app.skills.some(s => s.name === 'Endurance'));
  assert.ok(app.skills.some(s => s.name === 'Pugilism'));
  assert.ok(app.getPointLedger().pointsSpent > 0);

  // Test loading Cat (Size 2, negative STR, positive DEX)
  const catPreset = data.presets.find(p => p.name.startsWith("Cat "));
  assert.ok(catPreset);
  app.loadPreset(catPreset.id);

  assert.equal(app.name, "Cat");
  assert.equal(app.size, 2); // Small size category
  assert.equal(app.stats.str, -3);
  assert.equal(app.stats.dex, 4);
  assert.ok(app.skills.some(s => s.name === 'Slice'));
  assert.ok(app.getPointLedger().pointsSpent > 0);
});

test('DCC Race Creator Studio - Template Renders Sidebar Matching Class Creator Point Ledger', async () => {
  const { readFileSync } = await import('node:fs');
  const templatePath = new URL('../templates/apps/race-creator.hbs', import.meta.url).pathname;
  const templateSrc = readFileSync(templatePath, 'utf8');

  // Verify modern point ledger classes match class builder point ledger
  assert.ok(templateSrc.includes('dcc-studio-sidebar'), 'Must use dcc-studio-sidebar container');
  assert.ok(templateSrc.includes('dcc-sticky-receipt'), 'Must use dcc-sticky-receipt container');
  assert.ok(templateSrc.includes('dcc-receipt-header-card'), 'Must use dcc-receipt-header-card');
  assert.ok(templateSrc.includes('dcc-gauge-numbers'), 'Must use dcc-gauge-numbers for large spent/budget numbers');
  assert.ok(templateSrc.includes('dcc-spent-num'), 'Must use dcc-spent-num');
  assert.ok(templateSrc.includes('dcc-budget-num'), 'Must use dcc-budget-num');
  assert.ok(templateSrc.includes('dcc-legality-badge'), 'Must use dcc-legality-badge');
  assert.ok(templateSrc.includes('dcc-budget-breakdown'), 'Must use dcc-budget-breakdown');
  assert.ok(templateSrc.includes('dcc-receipt-items-card'), 'Must use dcc-receipt-items-card');
  assert.ok(templateSrc.includes('dcc-receipt-row'), 'Must use dcc-receipt-row');
  assert.ok(templateSrc.includes('dcc-target-crawler-card'), 'Must use dcc-target-crawler-card');
  assert.ok(templateSrc.includes('dcc-receipt-actions'), 'Must use dcc-receipt-actions');
});

