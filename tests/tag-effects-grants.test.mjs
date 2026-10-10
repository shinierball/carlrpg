import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { migrateItemData, migrateItemData320 } from '../src/migration.mjs';
import { damageTypeToElement, elementToDamageType, getItemAllTags } from '../src/data/tags.mjs';

test('Tag-Driven Effects & Grants Subsystem', async (t) => {

  await t.test('1. Data-Driven Mana Restoration: Consumable with structured outcome', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 3, max: 20 }
        }
      }
    });

    // Potion with arbitrary non-standard name ("Gnomish Focused Cordial")
    const manaPotion = new DCCItem({
      name: 'Gnomish Focused Cordial',
      type: 'loot',
      system: {
        quantity: 1,
        lootType: 'consumable',
        executionMode: 'all',
        outcomes: [
          {
            name: 'Refill Mana',
            type: 'restore_resource',
            resource: 'mana',
            mode: 'full',
            targetType: 'self'
          }
        ],
        tags: ['kind.loot', 'action.restore', 'resource.mana']
      }
    }, actor);

    assert.equal(actor.system.attributes.mana.value, 3);
    await manaPotion.useItem();
    assert.equal(actor.system.attributes.mana.value, 20, 'Mana should refill to maximum (20 MP)');
  });

  await t.test('2. Data-Driven Flat Mana Restoration: Partial amount', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        attributes: {
          mana: { value: 5, max: 30 }
        }
      }
    });

    const manaVial = new DCCItem({
      name: 'Spark Tonic',
      type: 'loot',
      system: {
        quantity: 1,
        lootType: 'consumable',
        executionMode: 'all',
        outcomes: [
          {
            name: 'Minor Mana Restore',
            type: 'restore_resource',
            resource: 'mana',
            amount: 10,
            targetType: 'self'
          }
        ],
        tags: ['kind.loot', 'action.restore', 'resource.mana']
      }
    }, actor);

    await manaVial.useItem();
    assert.equal(actor.system.attributes.mana.value, 15, 'Mana should increase from 5 to 15 MP');
  });

  await t.test('3. Gear Grants: Stats, DR, and Evade via structured system.grants', async () => {
    const actor = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10 },
          int: { value: 12 },
          con: { value: 10 },
          dex: { value: 14 },
          cha: { value: 16 }
        }
      }
    });

    const magicAmulet = new DCCItem({
      name: 'Amulet of the Warlord',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'accessories',
        grants: [
          { kind: 'stat', stat: 'str', value: 4, type: 'flat' },
          { kind: 'stat', stat: 'cha', value: 2, type: 'flat' },
          { kind: 'dr', value: 2 },
          { kind: 'evade', value: 1 }
        ],
        tags: ['kind.gear', 'stat.str', 'stat.cha']
      }
    }, actor);

    actor.items.push(magicAmulet);
    actor.prepareDerivedData();

    // Base STR 10 + 4 = 14 (DCC Mod +4)
    assert.equal(actor.system.abilities.str.value, 14);
    // Base CHA 16 + 2 = 18 (DCC Mod +4)
    assert.equal(actor.system.abilities.cha.value, 18);
    // Gear DR 2
    assert.equal(actor.system.attributes.dr.gear, 2);
    // Gear Evade 1
    assert.equal(actor.system.attributes.evade.gear, 1);
  });

  await t.test('4. Gear Grants: Skill ranks via system.grants', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          dex: { value: 15 } // Mod +4
        }
      }
    });

    const punchKnuckles = new DCCItem({
      name: 'Brawler Grips',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'hands',
        grants: [
          { kind: 'skill', name: 'Pugilism', ref: 'id.skill.pugilism', bonus: 3 }
        ],
        tags: ['kind.gear', 'kind.weapon', 'technique.pugilism']
      }
    }, actor);

    actor.items.push(punchKnuckles);
    actor.prepareDerivedData();

    const pugilismRank = actor.getSkillRank('Pugilism');
    assert.equal(pugilismRank, 3, 'Gear grants should confer rank 3 in Pugilism');
  });

  await t.test('5. Gear Grants: Spell granting via system.grants and crawler sheet', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          int: { value: 14 }
        }
      }
    });

    const flameBracers = new DCCItem({
      name: 'Bracers of Pyromancy',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'arms',
        grants: [
          { kind: 'spell', name: 'Fireball', ref: 'id.spell.fireball', rank: 4, cooldownHours: 8 }
        ],
        tags: ['kind.gear', 'kind.spell', 'element.fire']
      }
    }, actor);

    actor.items.push(flameBracers);
    actor.prepareDerivedData();

    const spellRank = actor.getSpellRank('Fireball');
    assert.equal(spellRank, 4, 'Gear grant should provide Fireball at Rank 4');

    // Test crawler sheet presentation
    const sheet = new DCCCrawlerSheet(actor);
    const context = await sheet.getData();
    const fireballGranted = context.spells.find(s => s.name.toLowerCase() === 'fireball');
    assert.ok(fireballGranted, 'Fireball should appear in sheet spell roster');
    assert.equal(fireballGranted.modifiedRank, 4);
    assert.equal(fireballGranted.isGranted, true);
  });

  await t.test('6. Tag Query Grants: Boosting spells matching element tag', async () => {
    const actor = new DCCActor({
      name: 'Pyromancer Carl',
      type: 'crawler',
      system: {
        abilities: {
          int: { value: 16 }
        }
      }
    });

    const fireballSpell = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 3,
        damageType: 'Fire',
        tags: ['kind.spell', 'element.fire']
      }
    }, actor);

    const iceSpikeSpell = new DCCItem({
      name: 'Ice Spike',
      type: 'spell',
      system: {
        rank: 2,
        damageType: 'Ice',
        tags: ['kind.spell', 'element.ice']
      }
    }, actor);

    // Gear that gives +2 to all Fire spells via Tag Query!
    const pyromancerRing = new DCCItem({
      name: 'Signet of True Fire',
      type: 'gear',
      system: {
        equipped: true,
        slot: 'accessories',
        grants: [
          {
            kind: 'tag_bonus',
            query: { all: ['kind.spell', 'element.fire'] },
            bonus: 2,
            label: '+2 to Fire Spells'
          }
        ],
        tags: ['kind.gear', 'element.fire']
      }
    }, actor);

    actor.items.push(fireballSpell, iceSpikeSpell, pyromancerRing);
    actor.prepareDerivedData();

    // Fireball (Base 3 + 2 tag bonus = 5)
    assert.equal(fireballSpell.system.modifiedRank, 5, 'Fireball should gain +2 rank from Fire tag query');
    // Ice Spike (Base 2 + 0 tag bonus = 2)
    assert.equal(iceSpikeSpell.system.modifiedRank, 2, 'Ice Spike should not gain bonus from Fire tag query');
  });

  await t.test('7. Tag-Driven Damage Reduction without regex matching', async () => {
    const actor = new DCCActor({
      name: 'Target Dummy',
      type: 'crawler',
      system: {}
    });

    // Debuff item with structured damageModifiers and tag
    const fireVulnerabilityDebuff = new DCCItem({
      name: 'Chilled Ward',
      type: 'debuff',
      system: {
        damageModifiers: [
          {
            kind: 'reduction',
            elementTag: 'element.fire',
            damageType: 'Fire',
            reductionPercent: 50,
            rounding: 'up'
          }
        ],
        tags: ['kind.debuff', 'element.fire']
      }
    }, actor);

    actor.items.push(fireVulnerabilityDebuff);

    // Test reducing Fire damage
    const redFire = actor.getDamageReduction('Fire');
    assert.equal(redFire.percent, 0.5, 'Fire reduction should be 50%');
    assert.equal(redFire.rounding, 'up');

    // Test element tag query
    const redElementTag = actor.getDamageReduction('element.fire');
    assert.equal(redElementTag.percent, 0.5, 'element.fire query should also resolve to 50% reduction');

    // Test Ice damage has 0% reduction
    const redIce = actor.getDamageReduction('Ice');
    assert.equal(redIce.percent, 0, 'Ice should have 0% reduction');
  });

  await t.test('8. Migration: Legacy item data migrating into structured grants and tags', async () => {
    // 1. Legacy Gear item
    const legacyGear = {
      name: 'Iron Breastplate',
      type: 'gear',
      system: {
        drBonus: 2,
        evadeBonus: -1,
        abilityModifiers: {
          con: { value: 2, type: 'flat' }
        },
        skillModifiers: [
          { name: 'Armor Training', bonus: 1 }
        ]
      }
    };

    const gearUpdates = migrateItemData(legacyGear);
    assert.ok(Array.isArray(gearUpdates['system.grants']), 'Should populate system.grants');
    const grants = gearUpdates['system.grants'];
    assert.ok(grants.some(g => g.kind === 'stat' && g.stat === 'con' && g.value === 2));
    assert.ok(grants.some(g => g.kind === 'skill' && g.name === 'Armor Training' && g.bonus === 1));
    assert.ok(grants.some(g => g.kind === 'dr' && g.value === 2));
    assert.ok(grants.some(g => g.kind === 'evade' && g.value === -1));

    // 2. Legacy Mana Potion
    const legacyManaPotion = {
      name: 'Old Mana Potion',
      type: 'loot',
      system: {
        lootType: 'consumable',
        notes: 'Refills mana completely'
      }
    };

    const manaUpdates = migrateItemData(legacyManaPotion);
    assert.ok(Array.isArray(manaUpdates['system.outcomes']));
    assert.ok(manaUpdates['system.outcomes'].some(o => o.type === 'restore_resource' && o.resource === 'mana'));
    assert.ok(manaUpdates['system.tags'].includes('resource.mana'));
    assert.ok(manaUpdates['system.tags'].includes('action.restore'));

    // 3. Legacy Debuff with regex description
    const legacyDebuff = {
      name: 'Scorched Earth',
      type: 'debuff',
      system: {
        description: 'Reduces all fire damage by 50% rounded up'
      }
    };

    const debuffUpdates = migrateItemData(legacyDebuff);
    assert.ok(Array.isArray(debuffUpdates['system.damageModifiers']));
    const dm = debuffUpdates['system.damageModifiers'][0];
    assert.equal(dm.kind, 'reduction');
    assert.equal(dm.reductionPercent, 50);
    assert.equal(dm.rounding, 'up');
    assert.ok(debuffUpdates['system.tags'].includes('element.fire'));
  });

});
