import './setup.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { DCCBasePointBuilderApp } from '../src/apps/base-point-builder.mjs';
import { DCCRaceCreatorApp } from '../src/apps/race-creator.mjs';
import { DCCClassCreatorApp } from '../src/apps/class-creator.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';
import { DCCActor } from '../src/documents/actor.mjs';

test('1. Studio Point Builder - Custom Buffs & Debuffs Point Accounting & Ledger', () => {
  const builder = new DCCBasePointBuilderApp({ builderType: 'race', baseBudget: 25 });

  // Add custom Major buff (costs 4 points)
  builder.addBuff({
    name: 'Fire Immunity',
    tier: 'Major',
    cost: 4,
    description: 'Immune to all Fire damage.'
  });

  // Add custom Minor buff (costs 2 points)
  builder.addBuff({
    name: 'Burrowing Movement',
    tier: 'Minor',
    cost: 2,
    description: 'Ability to burrow at 20ft speed.'
  });

  // Add custom Minor debuff (refunds/gives 1 extra point)
  builder.addDebuff({
    name: 'Ice Vulnerability',
    tier: 'Minor',
    points: 1,
    description: 'Vulnerable to Ice damage.'
  });

  // Add custom Minor debuff (refunds/gives 1 extra point)
  builder.addDebuff({
    name: 'Inventory Heat Siphon',
    tier: 'Minor',
    points: 1,
    description: 'Lose 1 Health Bar slot each time you access inventory.'
  });

  // Add advanced action skill (Lava Burst)
  builder.addSkill({
    name: 'Lava Burst',
    rank: 1,
    stat: 'con',
    checkType: 'Stat Check',
    baseDamage: '1d8+F',
    canGainRanks: false,
    cooldown: 'None',
    category: 'Combat',
    notes: 'As an Action, make a Con Stat Check. Deal 1d8+F Fire damage.'
  });

  const data = builder.getData();
  const ledger = data.ledger;

  // Buff cost = 4 (Fire Immunity) + 2 (Burrowing) = 6 points
  assert.equal(ledger.buffCost, 6, 'Buff cost should be 6 points');

  // Debuff extra = 1 + 1 = 2 points
  assert.equal(ledger.debuffExtra, 2, 'Debuff extra points should be 2');

  // Skill cost = 2 points (rank 1 active skill)
  assert.equal(ledger.skillCost, 2, 'Skill cost should be 2 points');

  // Extra points = 2
  assert.equal(ledger.extraPoints, 2, 'Extra points from debuffs should be 2');
  assert.equal(ledger.effectiveBudget, 27, 'Effective budget should be 25 + 2 = 27');

  // Total spent = 6 (buffs) + 2 (skills) = 8
  assert.equal(ledger.spent, 8, 'Total points spent should be 8');
  assert.equal(ledger.remaining, 19, 'Remaining budget should be 27 - 8 = 19');

  // Verify receipt items
  assert.ok(ledger.receiptItems.some(i => (i.label || i.name || '').includes('Fire Immunity')), 'Ledger contains Fire Immunity cost');
  assert.ok(ledger.receiptItems.some(i => (i.label || i.name || '').includes('Ice Vulnerability')), 'Ledger contains Ice Vulnerability extra points');

  // Test export & import JSON preserves buffs, debuffs, and advanced skill fields
  const exported = builder.exportJSON();
  const parsed = JSON.parse(exported);
  assert.equal(parsed.buffs.length, 2);
  assert.equal(parsed.debuffs.length, 2);
  assert.equal(parsed.skills[0].baseDamage, '1d8+F');
  assert.equal(parsed.skills[0].canGainRanks, false);
  assert.equal(parsed.skills[0].checkType, 'Stat Check');

  // Import into a fresh builder
  const fresh = new DCCBasePointBuilderApp({ builderType: 'race', baseBudget: 25 });
  const importResult = fresh.importBuildJSON(exported);
  assert.equal(importResult.success, true);
  const freshData = fresh.getData();
  assert.equal(freshData.buffs.length, 2);
  assert.equal(freshData.debuffs.length, 2);
  assert.equal(freshData.skills[0].name, 'Lava Burst');
  assert.equal(freshData.skills[0].baseDamage, '1d8+F');
  assert.equal(freshData.skills[0].canGainRanks, false);
});

test('2. Canonical Igneous Race - All 7 Unique Abilities Applied to Actor', async () => {
  const actor = new DCCActor({
    name: 'Carl the Volcanic',
    type: 'crawler',
    system: {
      attributes: {
        size: 'Medium',
        dr: { buffs: 0 },
        speed: { move: 20, burrow: 0 }
      },
      abilities: {
        str: { value: 10, unenhanced: 10, mod: 4 },
        dex: { value: 10, unenhanced: 10, mod: 4 },
        con: { value: 10, unenhanced: 10, mod: 4 },
        int: { value: 10, unenhanced: 10, mod: 4 },
        cha: { value: 10, unenhanced: 10, mod: 4 }
      },
      details: {
        race: '',
        class: ''
      }
    }
  });

  // Apply canonical Igneous race
  const applied = await actor.applyRace('Igneous');
  assert.equal(applied, true, 'Igneous race successfully applied');
  assert.equal(actor.system.details.race, 'Igneous');

  // Verify Stats: CON +6 (16), STR -4 (6), INT -2 (8), CHA -2 (8), DEX 10
  assert.equal(actor.system.abilities.con.value, 16, 'CON should be 10 + 6 = 16');
  assert.equal(actor.system.abilities.str.value, 6, 'STR should be 10 - 4 = 6');
  assert.equal(actor.system.abilities.int.value, 8, 'INT should be 10 - 2 = 8');
  assert.equal(actor.system.abilities.cha.value, 8, 'CHA should be 10 - 2 = 8');
  assert.equal(actor.system.abilities.dex.value, 10, 'DEX should remain 10');

  // Verify DR & Movement & Size
  assert.equal(actor.system.attributes.dr.buffs, 3, 'DR should be +3');
  assert.equal(actor.system.attributes.speed.burrow, 20, 'Burrow speed should be 20ft');
  assert.equal(actor.system.attributes.size, 'Large', 'Size should be Large');

  // Ability 1: Lava Burst (Action skill, unranked, 1d8+F)
  const lavaBurst = actor.items.find(i => i.type === 'skill' && i.name === 'Lava Burst');
  assert.ok(lavaBurst, 'Lava Burst skill item must be embedded');
  assert.equal(lavaBurst.system.stat, 'con');
  assert.equal(lavaBurst.system.checkType, 'Stat Check');
  assert.equal(lavaBurst.system.baseDamage, '1d8+F');
  assert.equal(lavaBurst.system.canGainRanks, false);
  assert.equal(lavaBurst.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 2: Volcanic Sprint (Reminder skill, 1/Day cooldown)
  const volcanicSprint = actor.items.find(i => i.type === 'skill' && i.name === 'Volcanic Sprint');
  assert.ok(volcanicSprint, 'Volcanic Sprint skill item must be embedded');
  assert.equal(volcanicSprint.system.cooldown, '1/Day');
  assert.equal(volcanicSprint.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 3: Harsh Heat Adaptation & Aquatic Respiration (Permanent Buff)
  const heatAdapt = actor.items.find(i => i.type === 'buff' && i.name === 'Harsh Heat Adaptation & Aquatic Respiration');
  assert.ok(heatAdapt, 'Harsh Heat Adaptation & Aquatic Respiration buff item must be embedded');
  assert.equal(heatAdapt.system.duration, 'Permanent (Racial)');
  assert.equal(heatAdapt.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 4: Fire Immunity (Buff) & Ice Vulnerability (Debuff)
  const fireImmune = actor.items.find(i => i.type === 'buff' && i.name === 'Fire Immunity');
  assert.ok(fireImmune, 'Fire Immunity buff must be embedded');
  assert.equal(fireImmune.getFlag('carl-rpg', 'grantedBy'), 'race');

  const iceVuln = actor.items.find(i => i.type === 'debuff' && i.name === 'Ice Vulnerability');
  assert.ok(iceVuln, 'Ice Vulnerability debuff must be embedded');
  assert.equal(iceVuln.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 5: Burrowing Movement (Buff)
  const burrowBuff = actor.items.find(i => i.type === 'buff' && i.name === 'Burrowing Movement');
  assert.ok(burrowBuff, 'Burrowing Movement buff must be embedded');
  assert.equal(burrowBuff.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 6: Inventory Heat Siphon (Debuff)
  const heatSiphon = actor.items.find(i => i.type === 'debuff' && i.name === 'Inventory Heat Siphon');
  assert.ok(heatSiphon, 'Inventory Heat Siphon debuff must be embedded');
  assert.equal(heatSiphon.getFlag('carl-rpg', 'grantedBy'), 'race');

  // Ability 7: Conspicuous Molten Stature (Debuff)
  const conspicuous = actor.items.find(i => i.type === 'debuff' && i.name === 'Conspicuous Molten Stature');
  assert.ok(conspicuous, 'Conspicuous Molten Stature debuff must be embedded');
  assert.equal(conspicuous.getFlag('carl-rpg', 'grantedBy'), 'race');

  // NO bogus "two" spell should be created!
  const bogusSpell = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'two');
  assert.equal(bogusSpell, undefined, 'No bogus "two" spell should ever be granted by Igneous');
});

test('3. Igneous Race - Clean Lifecycle Revocation Leaves No Orphan Items', async () => {
  const actor = new DCCActor({
    name: 'Carl the Volcanic',
    type: 'crawler',
    system: {
      attributes: {
        size: 'Medium',
        dr: { buffs: 0 },
        speed: { move: 20, burrow: 0 }
      },
      abilities: {
        str: { value: 10, unenhanced: 10, mod: 4 },
        dex: { value: 10, unenhanced: 10, mod: 4 },
        con: { value: 10, unenhanced: 10, mod: 4 },
        int: { value: 10, unenhanced: 10, mod: 4 },
        cha: { value: 10, unenhanced: 10, mod: 4 }
      },
      details: {
        race: '',
        class: ''
      }
    }
  });

  await actor.applyRace('Igneous');
  assert.equal(actor.system.details.race, 'Igneous');

  // Now switch race to Human
  await actor.applyRace('Human');
  assert.equal(actor.system.details.race, 'Human');

  // Verify all 7 Igneous items are revoked
  assert.equal(actor.items.find(i => i.name === 'Lava Burst'), undefined, 'Lava Burst revoked');
  assert.equal(actor.items.find(i => i.name === 'Volcanic Sprint'), undefined, 'Volcanic Sprint revoked');
  assert.equal(actor.items.find(i => i.name === 'Harsh Heat Adaptation & Aquatic Respiration'), undefined, 'Heat adaptation revoked');
  assert.equal(actor.items.find(i => i.name === 'Fire Immunity'), undefined, 'Fire immunity revoked');
  assert.equal(actor.items.find(i => i.name === 'Ice Vulnerability'), undefined, 'Ice vulnerability revoked');
  assert.equal(actor.items.find(i => i.name === 'Burrowing Movement'), undefined, 'Burrowing buff revoked');
  assert.equal(actor.items.find(i => i.name === 'Inventory Heat Siphon'), undefined, 'Heat siphon revoked');
  assert.equal(actor.items.find(i => i.name === 'Conspicuous Molten Stature'), undefined, 'Conspicuous debuff revoked');
  assert.equal(actor.items.find(i => i.name === 'Endurance'), undefined, 'Endurance skill revoked');

  // Size restored to Medium
  assert.equal(actor.system.attributes.size, 'Medium', 'Size reverted from Large back to Medium');

  // DR restored to 0
  assert.equal(actor.system.attributes.dr.buffs, 0, 'DR reverted back to 0');

  // Burrow speed restored to 0
  assert.equal(actor.system.attributes.speed.burrow, 0, 'Burrow speed reverted back to 0');

  // Human stats applied: +2 to all stats (10 + 2 = 12)
  assert.equal(actor.system.abilities.str.value, 12, 'STR should be 12 (10 base + 2 Human)');
  assert.equal(actor.system.abilities.con.value, 12, 'CON should be 12 (10 base + 2 Human)');
  assert.equal(actor.system.abilities.dex.value, 12, 'DEX should be 12 (10 base + 2 Human)');
  assert.equal(actor.system.abilities.int.value, 12, 'INT should be 12 (10 base + 2 Human)');
  assert.equal(actor.system.abilities.cha.value, 12, 'CHA should be 12 (10 base + 2 Human)');
});

test('4. Canonical Class & Race Datasets - Bogus Items Sanitization', async () => {
  const actor = new DCCActor({
    name: 'Sanitization Test Actor',
    type: 'crawler',
    system: {
      attributes: { size: 'Medium' },
      abilities: {
        str: { value: 10, unenhanced: 10 },
        dex: { value: 10, unenhanced: 10 },
        con: { value: 10, unenhanced: 10 },
        int: { value: 10, unenhanced: 10 },
        cha: { value: 10, unenhanced: 10 }
      },
      details: { race: '', class: '' }
    }
  });

  // 1. Boring Ol' Bard
  await actor.applyClass('Boring Ol’ Bard');
  const bardBogusSpell = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'a');
  assert.equal(bardBogusSpell, undefined, 'Boring Ol’ Bard has no bogus "a" spell');

  // 2. Boring Ol' Druid
  await actor.applyClass('Boring Ol’ Druid');
  const druidBogusSpell = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'a');
  assert.equal(druidBogusSpell, undefined, 'Boring Ol’ Druid has no bogus "a" spell');
  const naturesBreath = actor.items.find(i => i.type === 'spell' && i.name === "Nature's Breath");
  assert.ok(naturesBreath, 'Boring Ol’ Druid correctly has Nature\'s Breath spell');

  // 3. Necromancer
  await actor.applyClass('Necromancer');
  const splitRise = actor.items.find(i => i.type === 'spell' && i.name === 'Rise');
  const splitDeadMinion = actor.items.find(i => i.type === 'spell' && i.name === 'Dead Minion!');
  assert.equal(splitRise, undefined, 'Necromancer does not have split "Rise" spell');
  assert.equal(splitDeadMinion, undefined, 'Necromancer does not have split "Dead Minion!" spell');
  const combinedSpell = actor.items.find(i => i.type === 'spell' && i.name === 'Rise, Dead Minion!');
  assert.ok(combinedSpell, 'Necromancer has combined "Rise, Dead Minion!" spell at rank 4');
  assert.equal(combinedSpell.system.rank, 4);

  // 4. Black Inquisitor General
  await actor.applyClass('Black Inquisitor General');
  const inquisitorBogusSpell = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'a');
  assert.equal(inquisitorBogusSpell, undefined, 'Black Inquisitor General has no bogus "a" spell');

  // 5. Obsidian Butterfly
  await actor.applyRace('Obsidian Butterfly');
  const butterflyBogusSpell = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase() === 'a');
  assert.equal(butterflyBogusSpell, undefined, 'Obsidian Butterfly has no bogus "a" spell');
});

test('5. Studio Builder applyToActor Embeds Custom Buffs & Debuffs', async () => {
  const actor = new DCCActor({
    name: 'Custom Build Test Character',
    type: 'crawler',
    system: {
      attributes: { size: 'Medium' },
      abilities: {
        str: { value: 10, unenhanced: 10 },
        dex: { value: 10, unenhanced: 10 },
        con: { value: 10, unenhanced: 10 },
        int: { value: 10, unenhanced: 10 },
        cha: { value: 10, unenhanced: 10 }
      },
      details: { race: '', class: '' }
    }
  });

  const builder = new DCCRaceCreatorApp();
  builder.name = 'Magma Golem';
  builder.addBuff({
    name: 'Molten Core',
    tier: 'Major',
    description: 'Radiate intense thermal energy.'
  });
  builder.addDebuff({
    name: 'Water Sensitivity',
    tier: 'Minor',
    description: 'Take 1d4 damage when submerged in water.'
  });

  const success = await builder.applyToActor(actor);
  assert.ok(success);
  assert.equal(actor.system.details.race, 'Magma Golem');

  const moltenCore = actor.items.find(i => i.type === 'buff' && i.name === 'Molten Core');
  assert.ok(moltenCore, 'Molten Core custom buff embedded on actor');
  assert.equal(moltenCore.getFlag('carl-rpg', 'grantedBy'), 'race');

  const waterSens = actor.items.find(i => i.type === 'debuff' && i.name === 'Water Sensitivity');
  assert.ok(waterSens, 'Water Sensitivity custom debuff embedded on actor');
  assert.equal(waterSens.getFlag('carl-rpg', 'grantedBy'), 'race');
});
