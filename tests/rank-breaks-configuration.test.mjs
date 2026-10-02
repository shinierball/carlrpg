import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import './setup.mjs';

import { DCCItemSheet } from '../src/sheets/item-sheet.mjs';
import { SkillDataModel } from '../src/models/items/skill-model.mjs';
import { SpellDataModel } from '../src/models/items/spell-model.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('DCC RPG - Rank Break Configurations (Ranks 5, 10, 15, 20) for Skills and Spells', () => {
  let templateData;

  before(async () => {
    const rawTemplate = await readFile(resolve(process.cwd(), 'template.json'), 'utf8');
    templateData = JSON.parse(rawTemplate);
  });

  describe('1. Schema Validation (template.json, SkillDataModel, SpellDataModel)', () => {
    it('template.json defines rankBreaks for skill with Rank 5, 10, 15, 20 and all required keys', () => {
      const skillTemplate = templateData.Item?.skill;
      assert.ok(skillTemplate, 'Item.skill template must exist');
      assert.ok(skillTemplate.rankBreaks, 'Item.skill.rankBreaks must exist');

      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        const breakConfig = skillTemplate.rankBreaks[tier];
        assert.ok(breakConfig, `Item.skill.rankBreaks.${tier} must exist`);
        assert.equal(breakConfig.damageDice, '', 'damageDice defaults to empty string');
        assert.equal(breakConfig.rankDamageDice, 0, 'rankDamageDice defaults to 0');
        assert.equal(breakConfig.buffsResistances, '', 'buffsResistances defaults to empty string');
        assert.equal(breakConfig.debuff, '', 'debuff defaults to empty string');
        assert.equal(breakConfig.notes, '', 'notes defaults to empty string');
      }
    });

    it('template.json defines rankBreaks for spell with Rank 5, 10, 15, 20 and all required keys', () => {
      const spellTemplate = templateData.Item?.spell;
      assert.ok(spellTemplate, 'Item.spell template must exist');
      assert.ok(spellTemplate.rankBreaks, 'Item.spell.rankBreaks must exist');

      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        const breakConfig = spellTemplate.rankBreaks[tier];
        assert.ok(breakConfig, `Item.spell.rankBreaks.${tier} must exist`);
        assert.equal(breakConfig.damageDice, '', 'damageDice defaults to empty string');
        assert.equal(breakConfig.rankDamageDice, 0, 'rankDamageDice defaults to 0');
        assert.equal(breakConfig.buffsResistances, '', 'buffsResistances defaults to empty string');
        assert.equal(breakConfig.debuff, '', 'debuff defaults to empty string');
        assert.equal(breakConfig.notes, '', 'notes defaults to empty string');
      }
    });

    it('SkillDataModel instantiates with default empty rank breaks without requiring any effect', () => {
      const model = new SkillDataModel({});
      assert.ok(model.rankBreaks, 'model.rankBreaks must be defined');
      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        assert.equal(model.rankBreaks[tier].damageDice, '');
        assert.equal(model.rankBreaks[tier].rankDamageDice, 0);
        assert.equal(model.rankBreaks[tier].buffsResistances, '');
        assert.equal(model.rankBreaks[tier].debuff, '');
        assert.equal(model.rankBreaks[tier].notes, '');
      }
    });

    it('SpellDataModel instantiates with default empty rank breaks without requiring any effect', () => {
      const model = new SpellDataModel({});
      assert.ok(model.rankBreaks, 'model.rankBreaks must be defined');
      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        assert.equal(model.rankBreaks[tier].damageDice, '');
        assert.equal(model.rankBreaks[tier].rankDamageDice, 0);
        assert.equal(model.rankBreaks[tier].buffsResistances, '');
        assert.equal(model.rankBreaks[tier].debuff, '');
        assert.equal(model.rankBreaks[tier].notes, '');
      }
    });
  });

  describe('2. DCCItemSheet Integration (_prepareContext and _updateObject)', () => {
    it('_prepareContext initializes fallback rankBreaks structure for skill item', async () => {
      const item = new DCCItem({
        id: 'test-skill-1',
        name: 'Brawling',
        type: 'skill',
        system: { rank: 1 }
      });
      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext({});

      assert.ok(context.system.rankBreaks, 'context.system.rankBreaks must exist');
      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        assert.ok(context.system.rankBreaks[tier], `${tier} configuration must exist in context`);
        assert.equal(context.system.rankBreaks[tier].rankDamageDice, 0);
      }
    });

    it('_prepareContext initializes fallback rankBreaks structure for spell item', async () => {
      const item = new DCCItem({
        id: 'test-spell-1',
        name: 'Magic Missile',
        type: 'spell',
        system: { rank: 1, manaCost: 2 }
      });
      const sheet = new DCCItemSheet(item);
      const context = await sheet._prepareContext({});

      assert.ok(context.system.rankBreaks, 'context.system.rankBreaks must exist');
      for (const tier of ['rank5', 'rank10', 'rank15', 'rank20']) {
        assert.ok(context.system.rankBreaks[tier], `${tier} configuration must exist in context`);
      }
    });

    it('_updateObject normalizes and persists rankBreaks data for skill', async () => {
      let updatedData = null;
      const item = new DCCItem({
        id: 'test-skill-2',
        name: 'Longsword Mastery',
        type: 'skill',
        system: { rank: 5 }
      });
      item.update = async (data) => {
        updatedData = data;
        return item;
      };

      const sheet = new DCCItemSheet(item);
      const formData = {
        'name': 'Longsword Mastery',
        'system.rankBreaks.rank5.damageDice': '1d8',
        'system.rankBreaks.rank5.rankDamageDice': '1',
        'system.rankBreaks.rank5.buffsResistances': '+2 Slash Defense',
        'system.rankBreaks.rank5.debuff': 'Bleeding',
        'system.rankBreaks.rank5.notes': 'Bleed deals 2 dmg/turn',
        'system.rankBreaks.rank10.damageDice': '1d8',
        'system.rankBreaks.rank10.rankDamageDice': '2',
        'system.rankBreaks.rank10.buffsResistances': '',
        'system.rankBreaks.rank10.debuff': 'Crippled',
        'system.rankBreaks.rank10.notes': 'Disarms target on crit',
        'system.rankBreaks.rank15.damageDice': '2d8',
        'system.rankBreaks.rank15.rankDamageDice': 0,
        'system.rankBreaks.rank15.buffsResistances': 'Slash Resistance',
        'system.rankBreaks.rank15.debuff': '',
        'system.rankBreaks.rank15.notes': '',
        'system.rankBreaks.rank20.damageDice': '',
        'system.rankBreaks.rank20.rankDamageDice': '1',
        'system.rankBreaks.rank20.buffsResistances': '+5 STR',
        'system.rankBreaks.rank20.debuff': 'Stunned',
        'system.rankBreaks.rank20.notes': 'Legendary Blade Art'
      };

      await sheet._updateObject({}, formData);

      assert.ok(updatedData, 'Item update must have been called');
      const rb = updatedData['system.rankBreaks'];
      assert.ok(rb, 'system.rankBreaks must be updated');
      assert.equal(rb.rank5.damageDice, '1d8');
      assert.equal(rb.rank5.rankDamageDice, 1);
      assert.equal(rb.rank5.buffsResistances, '+2 Slash Defense');
      assert.equal(rb.rank5.debuff, 'Bleeding');
      assert.equal(rb.rank5.notes, 'Bleed deals 2 dmg/turn');

      assert.equal(rb.rank10.damageDice, '1d8');
      assert.equal(rb.rank10.rankDamageDice, 2);
      assert.equal(rb.rank10.debuff, 'Crippled');

      assert.equal(rb.rank15.damageDice, '2d8');
      assert.equal(rb.rank15.rankDamageDice, 0);
      assert.equal(rb.rank15.buffsResistances, 'Slash Resistance');

      assert.equal(rb.rank20.rankDamageDice, 1);
      assert.equal(rb.rank20.buffsResistances, '+5 STR');
      assert.equal(rb.rank20.debuff, 'Stunned');
      assert.equal(rb.rank20.notes, 'Legendary Blade Art');
    });

    it('_updateObject handles empty rankBreaks without errors when no effects are selected', async () => {
      let updatedData = null;
      const item = new DCCItem({
        id: 'test-skill-empty',
        name: 'Basic Stealth',
        type: 'skill',
        system: { rank: 1 }
      });
      item.update = async (data) => {
        updatedData = data;
        return item;
      };

      const sheet = new DCCItemSheet(item);
      const formData = {
        'name': 'Basic Stealth',
        'system.rankBreaks.rank5.damageDice': '',
        'system.rankBreaks.rank5.rankDamageDice': 0,
        'system.rankBreaks.rank5.buffsResistances': '',
        'system.rankBreaks.rank5.debuff': '',
        'system.rankBreaks.rank5.notes': '',
        'system.rankBreaks.rank10.damageDice': '',
        'system.rankBreaks.rank10.rankDamageDice': 0,
        'system.rankBreaks.rank10.buffsResistances': '',
        'system.rankBreaks.rank10.debuff': '',
        'system.rankBreaks.rank10.notes': '',
        'system.rankBreaks.rank15.damageDice': '',
        'system.rankBreaks.rank15.rankDamageDice': 0,
        'system.rankBreaks.rank15.buffsResistances': '',
        'system.rankBreaks.rank15.debuff': '',
        'system.rankBreaks.rank15.notes': '',
        'system.rankBreaks.rank20.damageDice': '',
        'system.rankBreaks.rank20.rankDamageDice': 0,
        'system.rankBreaks.rank20.buffsResistances': '',
        'system.rankBreaks.rank20.debuff': '',
        'system.rankBreaks.rank20.notes': ''
      };

      await sheet._updateObject({}, formData);

      assert.ok(updatedData);
      const rb = updatedData['system.rankBreaks'];
      assert.equal(rb.rank5.damageDice, '');
      assert.equal(rb.rank5.rankDamageDice, 0);
      assert.equal(rb.rank5.debuff, '');
    });
  });

  describe('3. Skill Damage Scaling & Rank Breaks Execution', () => {
    it('actor.getSkillDamageData scales base dice, rank damage dice, debuffs, and notes across rank thresholds', async () => {
      const actor = new DCCActor({
        name: 'Test Crawler',
        type: 'crawler',
        system: {
          abilities: { str: { value: 16, unenhanced: 16, mod: 4 } }
        }
      });

      const skillItem = new DCCItem({
        id: 'axe-skill-1',
        name: 'Battleaxe',
        type: 'skill',
        system: {
          stat: 'str',
          rank: 1,
          baseDamage: '1d8',
          rankBreaks: {
            rank5: {
              damageDice: '1d8',
              rankDamageDice: 1,
              buffsResistances: '+1 Cleave',
              debuff: 'Bleeding',
              notes: 'Inflicts Bleed on hit'
            },
            rank10: {
              damageDice: '1d8',
              rankDamageDice: 1,
              buffsResistances: '',
              debuff: 'Crippled',
              notes: 'Cripples leg'
            },
            rank15: {
              damageDice: '2d8',
              rankDamageDice: 0,
              buffsResistances: 'Blunt Resistance',
              debuff: '',
              notes: 'Staggers foes'
            },
            rank20: {
              damageDice: '',
              rankDamageDice: 2,
              buffsResistances: '+3 STR',
              debuff: 'Stunned',
              notes: 'Executioner Chop'
            }
          }
        }
      }, actor);

      // Rank 1: Base 1d8, 1 rank die (1d2 at Rank 1), no rank break additions
      skillItem.system.rank = 1;
      skillItem.modifiedRank = 1;
      skillItem.system.modifiedRank = 1;
      let dmg1 = actor.getSkillDamageData(skillItem);
      assert.equal(dmg1.baseCount, 1, '1 base die at Rank 1');
      assert.equal(dmg1.baseSides, 8);
      assert.deepEqual(dmg1.targetDebuffs, [], 'No debuffs at Rank 1');

      // Rank 5: +1d8 damage dice, +1 rank damage die, 'Bleeding' debuff
      skillItem.system.rank = 5;
      skillItem.modifiedRank = 5;
      skillItem.system.modifiedRank = 5;
      let dmg5 = actor.getSkillDamageData(skillItem);
      assert.equal(dmg5.baseCount, 2, '2d8 base damage (1 base + 1 from Rank 5)');
      assert.equal(dmg5.baseSides, 8);
      // Rank 5 normally has 1d4 rank die; +1 extra rank die from Rank 5 break = 2d4
      assert.ok(dmg5.rankDie.dice.includes('2d4'), `Rank die should be 2d4, got: ${dmg5.rankDie.dice}`);
      assert.ok(dmg5.targetDebuffs.includes('Bleeding'), 'Target debuffs should include Bleeding');
      assert.ok(dmg5.rankBreakBuffs.some(b => b.includes('+1 Cleave')), 'Should record buffs');
      assert.ok(dmg5.rankBreakNotes.some(n => n.includes('Inflicts Bleed on hit')), 'Should record notes');

      // Rank 10: +2d8 total damage dice, +2 extra rank dice, both Bleeding & Crippled
      skillItem.system.rank = 10;
      skillItem.modifiedRank = 10;
      skillItem.system.modifiedRank = 10;
      let dmg10 = actor.getSkillDamageData(skillItem);
      assert.equal(dmg10.baseCount, 3, '3d8 base damage (1 + 1 + 1)');
      // Rank 10 normally has 1d10; +2 extra rank dice = 3d10
      assert.ok(dmg10.rankDie.dice.includes('3d10'), `Rank die should be 3d10, got: ${dmg10.rankDie.dice}`);
      assert.ok(dmg10.targetDebuffs.includes('Bleeding'));
      assert.ok(dmg10.targetDebuffs.includes('Crippled'));

      // Rank 15: +2d8 more damage dice (total +4d8 = 5d8), 0 additional rank dice (still +2)
      skillItem.system.rank = 15;
      skillItem.modifiedRank = 15;
      skillItem.system.modifiedRank = 15;
      let dmg15 = actor.getSkillDamageData(skillItem);
      assert.equal(dmg15.baseCount, 5, '5d8 base damage (1 + 1 + 1 + 2)');
      assert.ok(dmg15.rankDie.dice.includes('3d12'), `Rank die should be 3d12, got: ${dmg15.rankDie.dice}`);

      // Rank 20: +2 more rank dice (total +4 rank dice = 5 rank dice), Stunned debuff, notes
      skillItem.system.rank = 20;
      skillItem.modifiedRank = 20;
      skillItem.system.modifiedRank = 20;
      let dmg20 = actor.getSkillDamageData(skillItem);
      assert.equal(dmg20.baseCount, 5, '5d8 base damage');
      assert.ok(dmg20.rankDie.dice.includes('5d12'), `Rank die should be 5d12, got: ${dmg20.rankDie.dice}`);
      assert.ok(dmg20.targetDebuffs.includes('Bleeding'));
      assert.ok(dmg20.targetDebuffs.includes('Crippled'));
      assert.ok(dmg20.targetDebuffs.includes('Stunned'));
      assert.ok(dmg20.rankBreakNotes.some(n => n.includes('Executioner Chop')));
    });

    it('equipped weapon attack damage inherits rank break bonuses from matched skill', async () => {
      const actor = new DCCActor({
        name: 'Grom',
        type: 'crawler',
        system: {
          abilities: { str: { value: 16, unenhanced: 16, mod: 4 } }
        }
      });

      const skillItem = new DCCItem({
        id: 'hammer-skill',
        name: 'Warhammer',
        type: 'skill',
        system: {
          stat: 'str',
          rank: 10,
          rankBreaks: {
            rank5: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '',
              debuff: 'Dazed',
              notes: ''
            },
            rank10: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '',
              debuff: 'Prone',
              notes: ''
            }
          }
        }
      }, actor);
      actor.items.push(skillItem);

      const weaponItem = new DCCItem({
        id: 'warhammer-weapon',
        name: 'Heavy Warhammer',
        type: 'attack',
        system: {
          equipped: true,
          damageDice: '1d6',
          damageType: 'Bludgeoning',
          associatedSkills: ['Warhammer']
        }
      }, actor);
      actor.items.push(weaponItem);

      const parts = actor.getAttackDamageParts(weaponItem);
      assert.ok(parts.length >= 1, 'Should evaluate attack damage parts');

      // Base weapon 1d6 + 1d6 (rank5) + 1d6 (rank10) = 3d6
      const basePart = parts.find(p => p.type === 'Bludgeoning' && p.id === 'legacy-base');
      assert.ok(basePart, 'Should have base Bludgeoning damage part');
      assert.ok(basePart.dice.startsWith('3d6'), `Base weapon dice should scale to 3d6 from skill rank breaks, got: ${basePart.dice}`);

      // Rank die at Rank 10 is 1d10; +2 extra rank dice = 3d10
      const rankPart = parts.find(p => p.id && p.id.startsWith('rank-die'));
      assert.ok(rankPart, 'Should have rank die damage part');
      assert.ok(rankPart.dice.includes('3d10'), `Rank die should be 3d10, got: ${rankPart.dice}`);
    });

    it('weapon rollAttack generates chat card with Inflict condition buttons for all active rank break debuffs', async () => {
      const actor = new DCCActor({
        name: 'Carl',
        type: 'crawler',
        system: {
          abilities: { str: { value: 18, unenhanced: 18, mod: 4 } }
        }
      });

      const skillItem = new DCCItem({
        id: 'sword-skill',
        name: 'Broadsword',
        type: 'skill',
        system: {
          stat: 'str',
          rank: 10,
          rankBreaks: {
            rank5: {
              damageDice: '',
              rankDamageDice: 0,
              buffsResistances: '',
              debuff: 'Bleeding',
              notes: ''
            },
            rank10: {
              damageDice: '',
              rankDamageDice: 0,
              buffsResistances: '',
              debuff: 'Hamstrung',
              notes: ''
            }
          }
        }
      }, actor);
      actor.items.push(skillItem);

      const attackItem = new DCCItem({
        id: 'broadsword-atk',
        name: 'Iron Broadsword',
        type: 'attack',
        system: {
          damageDice: '1d8',
          damageType: 'Slashing',
          associatedSkills: ['Broadsword']
        }
      }, actor);
      actor.items.push(attackItem);

      const msg = await actor.rollAttack(attackItem, 'damage');
      assert.ok(msg, 'Damage message should be created');
      const content = msg.content;

      assert.ok(content.includes('Inflict [Bleeding]'), 'Chat card must include button to inflict Bleeding');
      assert.ok(content.includes('Inflict [Hamstrung]'), 'Chat card must include button to inflict Hamstrung');
    });
  });

  describe('4. Spell Damage Scaling & Rank Breaks Execution', () => {
    it('actor.getSpellDamageData scales base damage, rank dice, and debuffs across rank breaks', async () => {
      const actor = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: { int: { value: 16, unenhanced: 16, mod: 4 } },
          attributes: { mana: { value: 20, max: 20 } }
        }
      });

      const spellItem = new DCCItem({
        id: 'fire-blast',
        name: 'Fire Blast',
        type: 'spell',
        system: {
          rank: 5,
          stat: 'int',
          manaCost: 3,
          baseDamage: '2d6',
          damageType: 'Fire',
          rankBreaks: {
            rank5: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '+5 Fire Resist',
              debuff: 'Burned',
              notes: 'Sets flammable objects ablaze'
            },
            rank10: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '',
              debuff: 'Blinded',
              notes: 'Dazzling explosion'
            }
          }
        }
      }, actor);

      // At Rank 5: Base 2d6 + 1d6 = 3d6, +1 rank die (Rank 5 is 1d4, +1 = 2d4 rank die), Burned debuff
      const dmg5 = actor.getSpellDamageData(spellItem);
      assert.equal(dmg5.count, 3, 'Should scale to 3d6 (2 base + 1 from Rank 5 break)');
      assert.equal(dmg5.sides, 6);
      assert.ok(dmg5.rankDie.includes('2d4'), `Spell rank die should be 2d4, got: ${dmg5.rankDie}`);
      assert.ok(dmg5.debuffs.includes('Burned'), 'Spell debuffs should include Burned');

      // At Rank 10: Base 2d6 + 1d6 + 1d6 = 4d6, +2 rank dice (Rank 10 is 1d10, +2 = 3d10 rank die), Burned & Blinded
      spellItem.system.rank = 10;
      const dmg10 = actor.getSpellDamageData(spellItem);
      assert.equal(dmg10.count, 4, 'Should scale to 4d6 (2 base + 1 + 1)');
      assert.ok(dmg10.rankDie.includes('3d10'), `Spell rank die should be 3d10, got: ${dmg10.rankDie}`);
      assert.ok(dmg10.debuffs.includes('Burned'));
      assert.ok(dmg10.debuffs.includes('Blinded'));
    });

    it('actor.rollSpellDamage renders debuff buttons for active rank breaks', async () => {
      const actor = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: { int: { value: 16, unenhanced: 16, mod: 4 } },
          attributes: { mana: { value: 20, max: 20 } }
        }
      });

      const spellItem = new DCCItem({
        id: 'frost-bolt',
        name: 'Frost Bolt',
        type: 'spell',
        system: {
          rank: 5,
          stat: 'int',
          manaCost: 2,
          baseDamage: '1d8',
          damageType: 'Cold',
          rankBreaks: {
            rank5: {
              damageDice: '1d8',
              rankDamageDice: 0,
              buffsResistances: 'Cold Resistance',
              debuff: 'Frozen',
              notes: 'Slows movement speed'
            }
          }
        }
      }, actor);

      const msg = await actor.rollSpellDamage(spellItem);
      assert.ok(msg, 'Damage roll message created');
      const content = msg.content;
      assert.ok(content.includes('Inflict [Frozen]'), 'Damage card must include button to inflict Frozen');
    });

    it('rollSpell and rollSpellCard format Rank Break summaries cleanly in chat cards', async () => {
      const actor = new DCCActor({
        name: 'Donut',
        type: 'crawler',
        system: {
          abilities: { int: { value: 16, unenhanced: 16, mod: 4 } },
          attributes: { mana: { value: 20, max: 20 } }
        }
      });

      const spellItem = new DCCItem({
        id: 'arcane-nova',
        name: 'Arcane Nova',
        type: 'spell',
        system: {
          rank: 15,
          stat: 'int',
          manaCost: 4,
          baseDamage: '3d6',
          damageType: 'Arcane',
          rankBreaks: {
            rank5: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '+2 Spell Shield',
              debuff: 'Dazed',
              notes: 'Minor shockwave'
            },
            rank10: {
              damageDice: '1d6',
              rankDamageDice: 1,
              buffsResistances: '',
              debuff: 'Vulnerable',
              notes: 'Shreds magic resistance'
            },
            rank15: {
              damageDice: '2d6',
              rankDamageDice: 0,
              buffsResistances: 'Arcane Immunity',
              debuff: 'Silenced',
              notes: 'Anti-magic blast'
            },
            rank20: {
              damageDice: '',
              rankDamageDice: 2,
              buffsResistances: '+10 Max Mana',
              debuff: 'Stunned',
              notes: 'Cataclysmic burst'
            }
          }
        }
      }, actor);

      // Test actor.rollSpell card output
      const castMsg = await actor.rollSpell(spellItem);
      assert.ok(castMsg);
      const castContent = castMsg.content;
      assert.ok(castContent.includes('Rank Breaks:'), 'Should display Rank Breaks header');
      assert.ok(castContent.includes('Rank 5:'), 'Should display Rank 5 break');
      assert.ok(castContent.includes('Rank 10:'), 'Should display Rank 10 break');
      assert.ok(castContent.includes('Rank 15:'), 'Should display Rank 15 break');
      assert.ok(castContent.includes('Rank 20:'), 'Should display Rank 20 break');
      assert.ok(castContent.includes('+1d6 Dmg'), 'Should display damage dice');
      assert.ok(castContent.includes('Debuff: [Dazed]'), 'Should display debuff badge');
      assert.ok(castContent.includes('Buff/Resist: +2 Spell Shield'), 'Should display buff/resist');
      assert.ok(castContent.includes('Anti-magic blast'), 'Should display notes');

      // Test DCCItem.rollSpellCard output
      const staticMsg = await DCCItem.rollSpellCard(spellItem);
      assert.ok(staticMsg);
      const staticContent = staticMsg.content;
      assert.ok(staticContent.includes('Rank Breaks:'), 'rollSpellCard should include Rank Breaks header');
      assert.ok(staticContent.includes('Rank 5:'));
      assert.ok(staticContent.includes('Rank 20:'));
    });
  });
});
