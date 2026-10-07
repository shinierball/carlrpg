import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { createAndEditItem } from '../src/dcc.mjs';
import {
  getRecommendedAssociatedSkills,
  getRecommendedOptionalEffects,
  CANONICAL_WEAPON_SKILL_MAP,
  CANONICAL_WEAPON_TECHNIQUE_MAP
} from '../src/data/weapon-associations.mjs';

test('DCC RPG Unified Item Creation, Canonical Associations, and Value Security', async (t) => {
  // Ensure CONFIG.Item.documentClass is registered
  CONFIG.Item.documentClass = DCCItem;

  await t.test('1. createAndEditItem creates items across all types with 1x crit multipliers and renders DCCItemSheet', async () => {
    const typesToTest = [
      { type: 'weapon', expectedType: 'gear', isWeapon: true, checkCrit: true },
      { type: 'gear', expectedType: 'gear', isWeapon: false },
      { type: 'spell', expectedType: 'spell', checkCritSpells: true },
      { type: 'skill', expectedType: 'skill', checkCritSkills: true },
      { type: 'class', expectedType: 'class' },
      { type: 'race', expectedType: 'race' },
      { type: 'buff', expectedType: 'buff' },
      { type: 'debuff', expectedType: 'debuff' },
      { type: 'loot', expectedType: 'loot' }
    ];

    for (const config of typesToTest) {
      const item = await createAndEditItem(config.type, {
        name: `Test Created ${config.type}`
      });

      assert.ok(item instanceof DCCItem, `Item for type ${config.type} should be instance of DCCItem`);
      assert.equal(item.type, config.expectedType, `Item type should match ${config.expectedType}`);

      if (config.isWeapon) {
        assert.equal(item.system.isWeapon, true, 'Weapon gear must have isWeapon: true');
        assert.equal(item.system.slot, 'hands', 'Weapon gear must default to slot: hands');
        assert.equal(item.system.critMultiplier, 1, 'Weapon critMultiplier must default to 1x on creation');
      }

      if (config.checkCritSpells) {
        assert.equal(item.system.critMultiplierR5, 1, 'Spell critMultiplierR5 must default to 1x');
        assert.equal(item.system.critMultiplierR15, 1, 'Spell critMultiplierR15 must default to 1x');
      }

      if (config.checkCritSkills) {
        assert.equal(item.system.critMultiplierR5, 1, 'Skill critMultiplierR5 must default to 1x');
        assert.equal(item.system.critMultiplierR15, 1, 'Skill critMultiplierR15 must default to 1x');
      }
    }
  });

  await t.test('2. getRecommendedAssociatedSkills accurately maps weapons to canonical skill sets without regex', () => {
    // Crossbow rule: Crossbows must always include Crossbow, Ranged Weapons, Aiming
    const crossbowSkills = getRecommendedAssociatedSkills({
      name: 'Heavy Dwarven Crossbow',
      system: { weaponType: 'Crossbow', weaponCategory: 'Ranged' }
    });
    assert.deepEqual(crossbowSkills, ['Crossbow', 'Ranged Weapons', 'Aiming']);

    // Standard Bow
    const bowSkills = getRecommendedAssociatedSkills({
      name: 'Longbow of the Forest',
      system: { weaponType: 'Longbow', weaponCategory: 'Ranged' }
    });
    assert.deepEqual(bowSkills, ['Bow', 'Ranged Weapons', 'Aiming']);

    // Generic Ranged Weapon (e.g. Slingshot, Javelin)
    const genericRangedSkills = getRecommendedAssociatedSkills({
      name: 'Hunting Sling',
      system: { weaponCategory: 'Ranged' }
    });
    assert.deepEqual(genericRangedSkills, ['Ranged Weapons', 'Aiming']);

    // Sword / Edge
    const swordSkills = getRecommendedAssociatedSkills({
      name: 'Steel Broadsword',
      system: { weaponType: 'Broadsword', weaponCategory: 'Edge' }
    });
    assert.deepEqual(swordSkills, ['Blade Weapons', 'Melee Combat']);

    // Dagger
    const daggerSkills = getRecommendedAssociatedSkills({
      name: 'Shadow Dagger',
      system: { weaponType: 'Dagger', weaponCategory: 'Edge' }
    });
    assert.deepEqual(daggerSkills, ['Daggers', 'Blade Weapons', 'Melee Combat', 'Backstabbing']);

    // Chainsaw / Power Weapon
    const chainsawSkills = getRecommendedAssociatedSkills({
      name: 'Goblin Cleaver Chainsaw',
      system: { weaponType: 'Chainsaw', weaponCategory: 'Power Weapons' }
    });
    assert.deepEqual(chainsawSkills, ['Chainsaws', 'Power Weapons', 'Melee Combat']);

    // Unarmed
    const unarmedSkills = getRecommendedAssociatedSkills({
      name: 'Spiked Cestus',
      system: { weaponType: 'Fist', weaponCategory: 'Unarmed' }
    });
    assert.deepEqual(unarmedSkills, ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat']);

    // Dynamic custom skill appliesTo resolution without hardcoded regex
    const customEnergySkill = {
      name: 'Exotic Energy Mastery',
      system: { appliesTo: ['Laser Rifle'] }
    };
    const laserSkills = getRecommendedAssociatedSkills(
      { system: { weaponType: 'Laser Rifle' } },
      [customEnergySkill]
    );
    assert.ok(laserSkills.includes('Exotic Energy Mastery'), 'Dynamic skill with appliesTo must be recommended');
  });

  await t.test('3. getRecommendedOptionalEffects accurately maps weapons to combat techniques', () => {
    const crossbowEffects = getRecommendedOptionalEffects({
      name: 'Heavy Crossbow',
      system: { weaponType: 'Crossbow', weaponCategory: 'Ranged' }
    });
    assert.ok(crossbowEffects.includes('Aiming'));
    assert.ok(crossbowEffects.includes('Power Shot'));

    const swordEffects = getRecommendedOptionalEffects({
      name: 'Gladius',
      system: { weaponType: 'Sword', weaponCategory: 'Edge' }
    });
    assert.ok(swordEffects.includes('Serrated Tear'));
    assert.ok(swordEffects.includes('Powerful Strike'));

    const bluntEffects = getRecommendedOptionalEffects({
      name: 'Warhammer',
      system: { weaponType: 'Hammer', weaponCategory: 'Blunt' }
    });
    assert.ok(bluntEffects.includes('Skullcracker'));
    assert.ok(bluntEffects.includes('Smush'));

    // Dynamic technique appliesTo resolution
    const customTechnique = {
      name: 'Overcharge Blast',
      system: { isTechnique: true, appliesTo: ['Plasma Cannon'] }
    };
    const plasmaEffects = getRecommendedOptionalEffects(
      { system: { weaponType: 'Plasma Cannon' } },
      [customTechnique]
    );
    assert.ok(plasmaEffects.includes('Overcharge Blast'), 'Dynamic technique with appliesTo must be recommended');
  });

  await t.test('4. DCCItemSheet._prepareContext populates data-driven associations and pill lists', async () => {
    const weapon = new DCCItem({
      name: 'Sniper Crossbow',
      type: 'gear',
      system: {
        isWeapon: true,
        slot: 'hands',
        weaponType: 'Crossbow',
        weaponCategory: 'Ranged',
        associatedSkills: ['Crossbow', 'Aiming'],
        optionalEffects: ['Pinning Shot']
      }
    });

    const sheet = new DCCItemSheet(weapon);
    const context = await sheet.getData();

    assert.ok(Array.isArray(context.availableSkills), 'availableSkills should be an array');
    assert.ok(context.availableSkills.some(s => s.name === 'Aiming'), 'availableSkills should contain Aiming');
    assert.ok(context.availableSkills.some(s => s.name === 'Crossbow'), 'availableSkills should contain Crossbow');

    assert.ok(Array.isArray(context.availableTechniques), 'availableTechniques should be an array');
    assert.ok(context.availableTechniques.some(t => t.name === 'Aiming' || t.name === 'Power Shot'), 'availableTechniques should contain Aiming/Power Shot');

    assert.ok(Array.isArray(context.recommendedSkills), 'recommendedSkills should be an array');
    assert.ok(context.recommendedSkills.includes('Crossbow'));
    assert.ok(context.recommendedSkills.includes('Ranged Weapons'));

    assert.ok(Array.isArray(context.recommendedEffects), 'recommendedEffects should be an array');
    assert.ok(context.recommendedEffects.includes('Aiming'));

    assert.deepEqual(context.associatedSkillsList, ['Crossbow', 'Aiming']);
    assert.deepEqual(context.optionalEffectsList, ['Pinning Shot']);
  });

  await t.test('5. Gold Values: GM can edit item value, non-GM is prevented from modifying value', async () => {
    const item = new DCCItem({
      name: 'Mystic Gem',
      type: 'loot',
      system: {
        value: 50
      }
    });

    const sheet = new DCCItemSheet(item);

    // Case 1: Game Master editing value
    globalThis.game.user.isGM = true;
    let context = await sheet.getData();
    assert.equal(context.isGM, true);
    assert.equal(context.canEditItemValue, true, 'GM can edit item value');

    await sheet._updateObject({}, {
      'system.value': 150
    });
    assert.equal(item.system.value, 150, 'GM update to system.value must persist');

    // Case 2: Non-GM player editing
    globalThis.game.user.isGM = false;
    context = await sheet.getData();
    assert.equal(context.isGM, false);
    assert.equal(context.canEditItemValue, false, 'Non-GM cannot edit item value');

    await sheet._updateObject({}, {
      'system.value': 9999,
      'name': 'Hacked Gem Name'
    });
    assert.equal(item.system.value, 150, 'Non-GM must NOT be allowed to update system.value');
    assert.equal(item.name, 'Hacked Gem Name', 'Non-GM allowed fields should still update');

    // Restore GM status for subsequent tests
    globalThis.game.user.isGM = true;
  });

  await t.test('6. Critical Hit Multiplier defaults to 1x on creation and is adjustable by GM', async () => {
    const weapon = await createAndEditItem('weapon', {
      name: 'Custom Katana',
      system: {
        weaponType: 'Katana'
      }
    });

    assert.equal(weapon.system.critMultiplier, 1, 'Default critMultiplier must be 1x');

    // GM modifies crit multiplier to 3x
    const sheet = new DCCItemSheet(weapon);
    await sheet._updateObject({}, {
      'system.critMultiplier': 3
    });

    assert.equal(weapon.system.critMultiplier, 3, 'GM should be able to adjust critMultiplier');
  });
});
