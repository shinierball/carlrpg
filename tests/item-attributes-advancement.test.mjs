import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { AttackDataModel } from '../src/models/items/attack-model.mjs';
import { GearDataModel } from '../src/models/items/gear-model.mjs';
import { BuffDataModel } from '../src/models/items/buff-model.mjs';
import { DebuffDataModel } from '../src/models/items/debuff-model.mjs';
import { LootDataModel } from '../src/models/items/loot-model.mjs';

describe('DCC RPG - Character Item Advancement UI & Calculation Refactor Subsystem', () => {
  describe('1. Non-Skill / Non-Spell Item Data Models Schema & Schema Parity', () => {
    it('GearDataModel and AttackDataModel define rankBreaks, damageParts, and weapon handling', () => {
      const gear = new GearDataModel({
        slot: 'hands',
        isWeapon: true,
        damageParts: [{ dice: '1d8', stat: 'str', type: 'Physical', value: 0 }],
        rankBreaks: {
          rank5: { damageDice: '1d4', rankDamageDice: 1, debuff: 'Bleeding', buffsResistances: '', notes: '' }
        }
      });
      assert.equal(gear.slot, 'hands');
      assert.equal(gear.isWeapon, true);
      assert.equal(gear.damageParts.length, 1);
      assert.equal(gear.damageParts[0].dice, '1d8');
      assert.ok(gear.rankBreaks);
      assert.equal(gear.rankBreaks.rank5.damageDice, '1d4');

      const attack = new AttackDataModel({
        damageDice: '1d10',
        damageStat: 'str',
        damageParts: [{ dice: '1d6', stat: '', type: 'Fire', value: 2 }],
        rankBreaks: {
          rank10: { damageDice: '1d6', rankDamageDice: 0, debuff: 'Burned', buffsResistances: '', notes: '' }
        }
      });
      assert.equal(attack.damageDice, '1d10');
      assert.equal(attack.damageParts.length, 1);
      assert.equal(attack.rankBreaks.rank10.debuff, 'Burned');
    });

    it('BuffDataModel and DebuffDataModel support healingPerRound, damagePerRound, and limbModifiers', () => {
      const buff = new BuffDataModel({
        buffType: 'hot',
        healingPerRound: '2 bars',
        duration: '3 Rounds',
        limbModifiers: { arms: 1, legs: 0, hands: 1 }
      });
      assert.equal(buff.healingPerRound, '2 bars');
      assert.equal(buff.limbModifiers.hands, 1);

      const debuff = new DebuffDataModel({
        severity: 'Major',
        damageType: 'Fire',
        damagePerRound: '1d6 Fire',
        reductionPercent: 50,
        limbModifiers: { arms: 0, legs: -1, hands: -1 }
      });
      assert.equal(debuff.damagePerRound, '1d6 Fire');
      assert.equal(debuff.reductionPercent, 50);
      assert.equal(debuff.limbModifiers.hands, -1);
    });
  });

  describe('2. DCCItemSheet UI Context & Form Saving for Gear, Attack, Buff, Debuff, and Loot', () => {
    it('_prepareContext hydrates rankBreaks, options, and lists for attack and gear items', async () => {
      const gearItem = new DCCItem({
        name: 'Thunder Hammer',
        type: 'gear',
        system: {
          slot: 'hands',
          isWeapon: true,
          damageParts: [{ dice: '1d10', stat: 'str', type: 'Physical', value: 0 }],
          upgrades: { rank5: '+1d4 base damage' }
        }
      });
      const sheet = new DCCItemSheet(gearItem);
      const context = await sheet._prepareContext();

      assert.ok(context.system.rankBreaks, 'rankBreaks should be initialized');
      assert.equal(context.system.rankBreaks.rank5.damageDice, '1d4', 'rankBreaks.rank5 should hydrate from upgrades');
      assert.ok(context.weaponCategories.length > 0);
      assert.ok(context.damageTypes.length > 0);
    });

    it('_updateObject sanitizes and saves rankBreaks and damageParts on gear and attack items', async () => {
      const attackItem = new DCCItem({
        name: 'Dragonfang Dagger',
        type: 'attack',
        system: {
          damageDice: '1d4',
          damageParts: []
        }
      });
      const sheet = new DCCItemSheet(attackItem);
      const formData = {
        'system.damageDice': '1d4',
        'system.damageParts': [
          { dice: '1d4', stat: 'dex', type: 'Physical', value: '0' },
          { dice: '1d6', stat: '', type: 'Fire', value: '2' }
        ],
        'system.rankBreaks': {
          rank5: { damageDice: '1d4', rankDamageDice: '1', debuff: 'Bleeding', buffsResistances: '', notes: '' },
          rank10: { damageDice: '', rankDamageDice: '0', debuff: '', buffsResistances: '', notes: '' },
          rank15: { damageDice: '', rankDamageDice: '0', debuff: '', buffsResistances: '', notes: '' },
          rank20: { damageDice: '', rankDamageDice: '0', debuff: '', buffsResistances: '', notes: '' }
        }
      };

      await sheet._updateObject(new Event('submit'), formData);
      assert.equal(attackItem.system.damageParts.length, 2);
      assert.equal(attackItem.system.damageParts[1].type, 'Fire');
      assert.equal(attackItem.system.rankBreaks.rank5.damageDice, '1d4');
      assert.equal(attackItem.system.rankBreaks.rank5.rankDamageDice, 1);
      assert.equal(attackItem.system.rankBreaks.rank5.debuff, 'Bleeding');
    });
  });

  describe('3. Character Sheet & Actor Derivations: Equipped Gear Granting Skills & Spells', () => {
    let crawler;

    beforeEach(async () => {
      crawler = await DCCActor.create({
        name: 'Carl Tester',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 12, unenhanced: 12 },
            dex: { value: 14, unenhanced: 14 },
            con: { value: 10, unenhanced: 10 },
            int: { value: 16, unenhanced: 16 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            hp: { value: 40, max: 40 },
            mana: { value: 16, max: 16 }
          }
        }
      });
    });

    it('Equipped gear granting a known skill increases itemBonus and modifiedRank', async () => {
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Hand to Hand',
        type: 'skill',
        system: { rank: 3, stat: 'str' }
      }]);

      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Brawler Ring',
        type: 'gear',
        system: {
          slot: 'accessory',
          equipped: true,
          skillModifiers: [{ name: 'Hand to Hand', bonus: 2 }]
        }
      }]);

      crawler.prepareDerivedData();
      const h2h = crawler.items.find(i => i.name === 'Hand to Hand');
      assert.equal(h2h.system.itemBonus, 2);
      assert.equal(h2h.system.modifiedRank, 5); // 3 + 2 = 5
      assert.equal(crawler.getSkillRank('Hand to Hand'), 5);
    });

    it('Equipped gear granting an unowned skill makes it accessible via getSkillRank and sheet context', async () => {
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Ring of Merchant Wit',
        type: 'gear',
        system: {
          slot: 'accessory',
          equipped: true,
          skillModifiers: [{ name: 'Determine Value', bonus: 10 }]
        }
      }]);

      crawler.prepareDerivedData();
      assert.equal(crawler.getSkillRank('Determine Value'), 10);
      assert.equal(crawler.canDetermineValue(), true);

      const sheet = new DCCCrawlerSheet(crawler);
      const context = await sheet.getData();
      const grantedSkill = context.skills.find(s => s.name === 'Determine Value');
      assert.ok(grantedSkill, 'Determine Value should be in context.skills');
      assert.equal(grantedSkill.isGranted, true);
      assert.equal(grantedSkill.modifiedRank, 10);
    });

    it('Equipped gear granting a known spell increases itemBonus and unlocks Rank 5 milestone', async () => {
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Fireball',
        type: 'spell',
        system: {
          rank: 3,
          stat: 'int',
          manaCost: 5,
          baseDamage: '2d6',
          spellType: 'Attack',
          rankBreaks: {
            rank5: { damageDice: '1d6', rankDamageDice: 0, debuff: 'Burned', buffsResistances: '', notes: '' }
          }
        }
      }]);

      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Pyromancer Amulet',
        type: 'gear',
        system: {
          slot: 'accessory',
          equipped: true,
          skillModifiers: [{ name: 'Fireball', bonus: 2, type: 'spell' }]
        }
      }]);

      crawler.prepareDerivedData();
      const fireball = crawler.items.find(i => i.name === 'Fireball');
      assert.equal(fireball.system.itemBonus, 2);
      assert.equal(fireball.system.modifiedRank, 5); // 3 + 2 = 5
      assert.equal(crawler.getSpellRank('Fireball'), 5);

      const dmgData = crawler.getSpellDamageData(fireball);
      assert.ok(dmgData.formula.includes('3d6'), `Damage formula should include upgraded dice 3d6, got: ${dmgData.formula}`);
      assert.ok(dmgData.debuffs.includes('Burned'), 'Rank 5 milestone Burned debuff should be active');
    });

    it('Equipped gear granting an unowned spell surfaces it on sheet context and allows rollSpell', async () => {
      await crawler.createEmbeddedDocuments('Item', [{
        name: 'Staff of Healing',
        type: 'gear',
        system: {
          slot: 'hands',
          equipped: true,
          skillModifiers: [{ name: 'Heal', bonus: 2, type: 'spell' }]
        }
      }]);

      crawler.prepareDerivedData();
      assert.equal(crawler.getSpellRank('Heal'), 2);

      const sheet = new DCCCrawlerSheet(crawler);
      const context = await sheet.getData();
      const grantedSpell = context.spells.find(s => s.name === 'Heal');
      assert.ok(grantedSpell, 'Heal spell should be in context.spells');
      assert.equal(grantedSpell.isGranted, true);
      assert.equal(grantedSpell.system.rank, 2);

      // Cast granted spell
      crawler.system.attributes.hp.value = 10;
      crawler.system.attributes.hp.max = 40;
      crawler.system.attributes.mana.value = 10;

      const chatMsg = await crawler.rollSpell(grantedSpell);
      assert.ok(chatMsg, 'Cast chat message should be created');
      assert.ok(chatMsg.content.includes('Heal'), 'Chat content should reference Heal');
    });
  });

  describe('4. Buffs and Debuffs Attributes: Stat, Damage Multipliers, HoT, DoT, Limbs & Roll Modifiers', () => {
    let crawler;

    beforeEach(async () => {
      crawler = await DCCActor.create({
        name: 'Dungeon Crawler',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 10, unenhanced: 10 },
            dex: { value: 10, unenhanced: 10 },
            con: { value: 10, unenhanced: 10 },
            int: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          },
          attributes: {
            limbs: { arms: 2, legs: 2, hands: 2 }
          }
        }
      });
    });

    it('Buffs with HoT and Debuffs with DoT are aggregated by getHealingOverTime and getDamageOverTime', async () => {
      await crawler.createEmbeddedDocuments('Item', [
        {
          name: 'Regeneration Aura',
          type: 'buff',
          system: {
            buffType: 'hot',
            healingPerRound: '1 bar',
            duration: '5 Rounds'
          }
        },
        {
          name: 'Acid Corrosion',
          type: 'debuff',
          system: {
            severity: 'Minor',
            damageType: 'Acid',
            damagePerRound: '1d4 Acid',
            duration: 'Combat'
          }
        }
      ]);

      // Assign buff to active slot
      await crawler.update({ 'system.attributes.externalBuffs.slot1': 'Regeneration Aura' });
      crawler.prepareDerivedData();

      const hots = crawler.getHealingOverTime();
      assert.equal(hots.length, 1);
      assert.equal(hots[0].name, 'Regeneration Aura');
      assert.equal(hots[0].healingPerRound, '1 bar');

      const dots = crawler.getDamageOverTime();
      assert.equal(dots.length, 1);
      assert.equal(dots[0].name, 'Acid Corrosion');
      assert.equal(dots[0].damagePerRound, '1d4 Acid');
      assert.equal(dots[0].damageType, 'Acid');
    });

    it('Buffs and Debuffs adjust limb counts and trigger hands exceeded limit warnings', async () => {
      await crawler.createEmbeddedDocuments('Item', [
        {
          name: 'Severed Arm Injury',
          type: 'debuff',
          system: {
            severity: 'Major',
            limbModifiers: { arms: -1, legs: 0, hands: -1 }
          }
        },
        {
          name: 'Heavy Greatsword',
          type: 'gear',
          system: {
            slot: 'hands',
            equipped: true,
            handsRequired: 2,
            isWeapon: true
          }
        }
      ]);

      crawler.prepareDerivedData();
      assert.equal(crawler.system.attributes.limbs.maxHands, 1, 'Max hands should be reduced from 2 to 1');
      assert.equal(crawler.system.attributes.limbs.usedHands, 2, 'Greatsword uses 2 hands');
      assert.equal(crawler.system.attributes.limbs.exceededHands, true);
      assert.ok(crawler.system.attributes.limbs.handsWarning.includes('Hands limit exceeded'));
    });

    it('Buffs and Debuffs rollModifierMode enforces Advantage and Disadvantage on rolls', async () => {
      await crawler.createEmbeddedDocuments('Item', [
        {
          name: 'Eagle Eye',
          type: 'buff',
          system: {
            rollModifierMode: 'advantage',
            affects: ['attacks', 'ranged']
          }
        },
        {
          name: 'Stiff Legs',
          type: 'debuff',
          system: {
            rollModifierMode: 'disadvantage',
            affects: ['dex']
          }
        }
      ]);

      await crawler.update({ 'system.attributes.externalBuffs.slot1': 'Eagle Eye' });

      const attackAdvState = crawler.getRollAdvantageState({ rollType: 'attack' });
      assert.equal(attackAdvState.mode, 'advantage');
      assert.ok(attackAdvState.label.includes('Eagle Eye'));

      const dexAdvState = crawler.getRollAdvantageState({ rollType: 'check', stat: 'dex' });
      assert.equal(dexAdvState.mode, 'disadvantage');
      assert.ok(dexAdvState.label.includes('Stiff Legs'));
    });
  });

  describe('5. Weapons & Attacks: Item-Level Rank Breaks & Multi-Typed Damage', () => {
    let crawler;

    beforeEach(async () => {
      crawler = await DCCActor.create({
        name: 'Weapon Master',
        type: 'crawler',
        system: {
          abilities: {
            str: { value: 14, unenhanced: 14 }, // mod +4
            dex: { value: 14, unenhanced: 14 },
            con: { value: 10, unenhanced: 10 },
            int: { value: 10, unenhanced: 10 },
            cha: { value: 10, unenhanced: 10 }
          }
        }
      });
    });

    it('Weapon with multi-typed damage parts builds profile and rolls all packets', async () => {
      const weapon = (await crawler.createEmbeddedDocuments('Item', [{
        name: 'Flaming Frost Greatsword',
        type: 'gear',
        system: {
          slot: 'hands',
          equipped: true,
          isWeapon: true,
          damageParts: [
            { dice: '1d10', stat: 'str', type: 'Physical', value: 0 },
            { dice: '1d6', stat: '', type: 'Fire', value: 2 },
            { dice: '1d4', stat: '', type: 'Cold', value: 1 }
          ]
        }
      }]))[0];

      const profile = crawler._buildWeaponAttackProfile(weapon);
      assert.equal(profile.system.damageParts.length, 3);
      assert.equal(profile.system.damageParts[1].type, 'Fire');
      assert.equal(profile.system.damageParts[2].type, 'Cold');

      const attackResult = await crawler.rollAttack(weapon, 'hit');
      assert.ok(attackResult, 'Attack roll should succeed');
    });

    it('Weapon with item-level rankBreaks scales damage at Rank 5 without requiring separate skill document', async () => {
      const artifactWeapon = (await crawler.createEmbeddedDocuments('Item', [{
        name: 'Godslayer Axe',
        type: 'gear',
        system: {
          slot: 'hands',
          equipped: true,
          isWeapon: true,
          toHitRank: 5,
          damageParts: [
            { dice: '1d8', stat: 'str', type: 'Physical', value: 0 }
          ],
          rankBreaks: {
            rank5: { damageDice: '1d4', rankDamageDice: 1, debuff: 'Bleeding', buffsResistances: '', notes: '' }
          }
        }
      }]))[0];

      const profile = crawler._buildWeaponAttackProfile(artifactWeapon);
      assert.ok(profile.displayDamage.includes('1d4'), `displayDamage should include Rank 5 extra dice 1d4, got: ${profile.displayDamage}`);
    });
  });
});
