import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { getCurrentFloor, setCurrentFloor, onRenderChatMessage } from '../src/dcc.mjs';
import { getEvadeTargetDifficulty } from '../src/data/rank-dice.mjs';
import { DCCSessionManagerApp } from '../src/apps/session-manager.mjs';

test('DCC RPG Global Floor, Mob Evade DC & Target Hit Resolution', async (t) => {
  // Reset floor to 1 before testing
  await setCurrentFloor(1);

  await t.test('1. Global Floor Setting and Helpers', async () => {
    assert.equal(DCCActor.getCurrentFloor(), 1, 'Initial floor should be 1');
    assert.equal(getCurrentFloor(), 1);
    assert.equal(globalThis.game.dcc.getCurrentFloor(), 1);
    assert.equal(globalThis.window.carl.getCurrentFloor(), 1);
    assert.equal(globalThis.CONFIG.DCC.getCurrentFloor(), 1);

    // Update floor to 3
    const updated = await DCCActor.setCurrentFloor(3);
    assert.equal(updated, 3);
    assert.equal(DCCActor.getCurrentFloor(), 3);
    assert.equal(getCurrentFloor(), 3);

    // Minimum floor clamped to 1
    await DCCActor.setCurrentFloor(0);
    assert.equal(DCCActor.getCurrentFloor(), 1, 'Floor cannot be less than 1');

    await DCCActor.setCurrentFloor(-5);
    assert.equal(DCCActor.getCurrentFloor(), 1);

    // Reset back to Floor 1
    await DCCActor.setCurrentFloor(1);
    assert.equal(DCCActor.getCurrentFloor(), 1);
  });

  await t.test('2. Mob Evade Difficulty (Base Number + F)', async () => {
    // Mob with DEX 10 (Mod +4 in CarlRPG): default base = 10 + 4 = 14 -> "14+F"
    const goblin = new DCCActor({
      name: 'Goblin Scout',
      type: 'mob',
      system: {
        abilities: {
          dex: { value: 10 } // mod +4
        }
      }
    });
    goblin.prepareDerivedData();

    assert.equal(goblin.system.attributes.evadeDifficulty, '14+F');
    assert.equal(goblin.system.attributes.evadeBaseDifficulty, 14);

    // On Floor 1, Target Evade DC is 14 + 1 = 15
    await DCCActor.setCurrentFloor(1);
    goblin.prepareDerivedData();
    assert.equal(goblin.getEvadeTargetDC(), 15);
    assert.equal(goblin.system.attributes.effectiveEvadeDC, 15);

    // On Floor 4, Target Evade DC is 14 + 4 = 18
    await DCCActor.setCurrentFloor(4);
    goblin.prepareDerivedData();
    assert.equal(goblin.getEvadeTargetDC(), 18);
    assert.equal(goblin.system.attributes.effectiveEvadeDC, 18);

    // Mob with explicit base evade difficulty (e.g., Boss with 16+F)
    const boss = new DCCActor({
      name: 'Dungeon Boss',
      type: 'mob',
      system: {
        attributes: {
          evadeDifficulty: '16+F'
        },
        abilities: {
          dex: { value: 6 } // mod +3
        }
      }
    });
    boss.prepareDerivedData();

    assert.equal(boss.system.attributes.evadeDifficulty, '16+F');
    assert.equal(boss.system.attributes.evadeBaseDifficulty, 16);
    // On Floor 4, 16 + 4 = 20
    assert.equal(boss.getEvadeTargetDC(), 20);
    assert.equal(boss.system.attributes.effectiveEvadeDC, 20);

    // getEvadeTargetDifficulty helper in rank-dice.mjs
    assert.equal(getEvadeTargetDifficulty(4, 1), 15); // 10 + 4 + 1
    assert.equal(getEvadeTargetDifficulty(4, 4), 18); // 10 + 4 + 4

    // Reset floor to 1
    await DCCActor.setCurrentFloor(1);
  });

  await t.test('3. Automatic Target Hit Resolution on Attacks', async () => {
    await DCCActor.setCurrentFloor(1);

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 10 }, // mod +4
          dex: { value: 6 }   // mod +3
        }
      }
    });

    const sword = new DCCItem({
      name: 'Goblin Cleaver',
      type: 'attack',
      system: {
        toHitStat: 'str',
        toHitRank: 3,
        dice: '1d8',
        stat: 'str'
      }
    });
    crawler.items = [sword];

    // Mob target with base 14+F (DC 15 on Floor 1)
    const mob1 = new DCCActor({
      name: 'Pack Rat',
      type: 'mob',
      system: {
        abilities: { dex: { value: 4 } }, // mod +2 -> 12+F
        attributes: { evadeDifficulty: '12+F' } // DC 13 on Floor 1
      }
    });

    const mob2 = new DCCActor({
      name: 'Armored Troll',
      type: 'mob',
      system: {
        attributes: { evadeDifficulty: '18+F' } // DC 19 on Floor 1
      }
    });
    mob1.prepareDerivedData();
    mob2.prepareDerivedData();

    // Mock roll that totals 15
    const origRoll = globalThis.Roll;
    globalThis.Roll = class FixedRoll {
      constructor(formula) {
        this.formula = formula;
        this.total = 15;
      }
      async evaluate() {
        return {
          formula: this.formula,
          total: 15,
          dice: [{ total: 8 }],
          terms: [{ results: [{ result: 8 }] }],
          render: async () => `<div class="dice-roll"><h4 class="dice-total">15</h4></div>`,
          toMessage: async (opts = {}) => ({
            formula: this.formula,
            total: 15,
            ...opts
          })
        };
      }
    };

    // Attack targeting both mob1 (DC 13) and mob2 (DC 19)
    const attackMsg = await crawler.rollAttack(sword, 'hit', { targets: [mob1, mob2] });

    assert.ok(attackMsg, 'Attack message should be generated');
    const flags = attackMsg.flags['carl-rpg'];
    assert.ok(flags, 'carl-rpg flags must exist');
    assert.equal(flags.isAttackRoll, true);
    assert.equal(flags.attackTotal, 15);
    assert.equal(flags.currentFloor, 1);
    assert.equal(flags.targetResults.length, 2);

    // mob1: DC 13 <= 15 -> HIT (+2)
    const res1 = flags.targetResults.find(r => r.actorId === mob1.id);
    assert.equal(res1.targetDC, 13);
    assert.equal(res1.isHit, true);
    assert.equal(res1.diff, 2);
    assert.equal(res1.outcome, 'Hit');

    // mob2: DC 19 > 15 -> MISS (-4)
    const res2 = flags.targetResults.find(r => r.actorId === mob2.id);
    assert.equal(res2.targetDC, 19);
    assert.equal(res2.isHit, false);
    assert.equal(res2.diff, -4);
    assert.equal(res2.outcome, 'Miss');

    // Chat content embeds target evaluation rows
    assert.ok(attackMsg.content.includes('Target Evaluation'));
    assert.ok(attackMsg.content.includes('Pack Rat'));
    assert.ok(attackMsg.content.includes('Armored Troll'));
    assert.ok(attackMsg.content.includes('HIT'));
    assert.ok(attackMsg.content.includes('MISS'));

    // Crawler attack must NOT have the evade button
    assert.equal(attackMsg.content.includes('dcc-evade-roll-btn'), false, 'Crawler attack must not include evade button');

    // Restore Roll
    globalThis.Roll = origRoll;
  });

  await t.test('4. Active Targets Resolved from game.user.targets', async () => {
    await DCCActor.setCurrentFloor(2);

    const crawler = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: {
        abilities: { dex: { value: 6 } }
      }
    });

    const claws = new DCCItem({
      name: 'Cat Claws',
      type: 'attack',
      system: { toHitStat: 'dex', toHitRank: 2, dice: '1d6' }
    });
    crawler.items = [claws];

    const targetMob = new DCCActor({
      name: 'Cave Spider',
      type: 'mob',
      system: {
        attributes: { evadeDifficulty: '11+F' } // DC on Floor 2 = 11 + 2 = 13
      }
    });
    targetMob.prepareDerivedData();

    // Add target to game.user.targets
    globalThis.game.user.targets.clear();
    globalThis.game.user.targets.add({ actor: targetMob, name: targetMob.name, id: targetMob.id });

    const msg = await crawler.rollAttack(claws, 'hit');
    const flags = msg.flags['carl-rpg'];
    assert.equal(flags.targetResults.length, 1);
    assert.equal(flags.targetResults[0].actorName, 'Cave Spider');
    assert.equal(flags.targetResults[0].targetDC, 13); // 11 + F2

    globalThis.game.user.targets.clear();
    await DCCActor.setCurrentFloor(1);
  });

  await t.test('5. Non-Crawler Attacks Include Evade Button in Chat', async () => {
    await DCCActor.setCurrentFloor(1);

    const mob = new DCCActor({
      name: 'Dread Wizard',
      type: 'mob',
      system: {
        abilities: { int: { value: 10 } }
      }
    });

    const staffAttack = new DCCItem({
      name: 'Staff Strike',
      type: 'attack',
      system: { toHitStat: 'str', toHitRank: 2, dice: '1d6' }
    });
    mob.items = [staffAttack];

    const attackMsg = await mob.rollAttack(staffAttack, 'hit');
    assert.ok(attackMsg.content.includes('dcc-evade-roll-btn'), 'Mob attack must include Evade button in chat content');
    assert.ok(attackMsg.content.includes('data-attack-total'));
    assert.ok(attackMsg.content.includes('Roll Evade vs Attack'));

    // Mob spell attack also includes evade button
    const fireSpell = new DCCItem({
      name: 'Fireball',
      type: 'spell',
      system: { stat: 'int', rank: 2, dice: '2d6', damageType: 'Fire' }
    });
    mob.items.push(fireSpell);

    const spellAttackMsg = await mob.rollSpellAttack(fireSpell);
    assert.ok(spellAttackMsg.content.includes('dcc-evade-roll-btn'), 'Mob spell attack must include Evade button');
  });

  await t.test('6. Crawler rollEvade Evaluates Against Attack Total', async () => {
    const crawler = new DCCActor({
      name: 'Katia',
      type: 'crawler',
      system: {
        abilities: {
          dex: { value: 6 } // mod +3
        },
        attributes: {
          evade: { gear: 1, buffs: 1 } // total modifier = 3 + 1 + 1 = 5
        }
      }
    });
    crawler.prepareDerivedData();

    // 1. Evade succeeds: Crawler rolls 10 + 5 = 15 against attack total 14
    const successMsg = await crawler.rollEvade({ attackTotal: 14, attackerName: 'Goblin Archer' });
    assert.ok(successMsg, 'rollEvade should produce a chat message');
    assert.equal(successMsg.flags['carl-rpg'].isEvadeRoll, true);
    assert.equal(successMsg.flags['carl-rpg'].isEvaded, true);
    assert.equal(successMsg.flags['carl-rpg'].attackTotal, 14);
    assert.ok(successMsg.content.includes('SUCCESSFULLY EVADED!'));
    assert.ok(successMsg.flavor.includes('vs Goblin Archer'));

    // 2. Evade fails: Crawler rolls 15 against attack total 18
    const failMsg = await crawler.rollEvade({ attackTotal: 18, attackerName: 'Boss Minotaur' });
    assert.equal(failMsg.flags['carl-rpg'].isEvaded, false);
    assert.ok(failMsg.content.includes('EVADE FAILED — HIT TAKEN!'));
  });

  await t.test('7. Chat Message Click Listener for Evade Button', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { dex: { value: 6 } } }
    });
    globalThis.game.actors = [crawler];
    globalThis.game.user.character = crawler;

    let evadeCalled = false;
    let evadeOpts = null;
    const origRollEvade = crawler.rollEvade.bind(crawler);
    crawler.rollEvade = async (options = {}) => {
      evadeCalled = true;
      evadeOpts = options;
      return origRollEvade(options);
    };

    // Simulate chat message with Evade button
    let buttonClickHandler = null;
    const mockHtml = {
      querySelectorAll: (sel) => {
        if (sel === '.dcc-evade-roll-btn') {
          return [{
            dataset: {
              attackerId: 'mob-123',
              attackerName: 'Cave Ogre',
              attackTotal: '17',
              floor: '2'
            },
            addEventListener: (evt, handler) => {
              if (evt === 'click') buttonClickHandler = handler;
            }
          }];
        }
        return [];
      }
    };

    onRenderChatMessage({}, mockHtml, {});
    assert.ok(buttonClickHandler, 'Evade button click handler must be bound in onRenderChatMessage');

    // Simulate clicking the Evade button
    const mockEv = { preventDefault: () => {} };
    await buttonClickHandler(mockEv);

    assert.equal(evadeCalled, true, 'Clicking Evade button should trigger crawler.rollEvade');
    assert.equal(evadeOpts.attackTotal, 17);
    assert.equal(evadeOpts.attackerName, 'Cave Ogre');
    assert.equal(evadeOpts.floor, 2);

    globalThis.game.user.character = null;
  });

  await t.test('8. DCCSessionManagerApp Floor Context & Listener', async () => {
    await DCCActor.setCurrentFloor(3);

    const app = new DCCSessionManagerApp();
    const data = await app.getData();

    assert.equal(data.currentFloor, 3, 'Session Manager context must contain currentFloor');
    assert.ok(Array.isArray(data.floorOptions), 'floorOptions must be an array');
    const selectedFloor = data.floorOptions.find(f => f.selected);
    assert.equal(selectedFloor?.value, 3, 'Floor 3 should be marked selected');

    // Reset floor to 1
    await DCCActor.setCurrentFloor(1);
    await app.close();
  });
});
