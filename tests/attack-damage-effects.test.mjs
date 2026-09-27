import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor, CANONICAL_DAMAGE_EFFECTS, DAMAGE_EFFECT_AI_FAVOR } from '../src/documents/actor.mjs';
import { prepareAttackDisplay } from '../src/sheets/crawler-sheet.mjs';

test('DCC RPG - Optional Damage Effects Subsystem', async (t) => {

  await t.test('1. Canonical Effect Discovery and AI Favor Mappings', () => {
    // 1. Pugilism
    assert.deepEqual(CANONICAL_DAMAGE_EFFECTS['pugilism'], ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);
    assert.equal(DAMAGE_EFFECT_AI_FAVOR['pugilism'], 2);

    // 2. Noggin Knocker
    assert.deepEqual(CANONICAL_DAMAGE_EFFECTS['noggin knocker'], ['Skullcracker', 'Powerful Strike']);
    assert.deepEqual(CANONICAL_DAMAGE_EFFECTS['noggin nocker'], ['Skullcracker', 'Powerful Strike']);
    assert.equal(DAMAGE_EFFECT_AI_FAVOR['noggin knocker'], 1);

    // 3. Wrasslin
    assert.deepEqual(CANONICAL_DAMAGE_EFFECTS['wrasslin'], ['Choke Out', 'Dirty Fighting', 'Toss']);
    assert.equal(DAMAGE_EFFECT_AI_FAVOR['wrasslin'], 1);

    // 4. Foot Soldier
    assert.deepEqual(CANONICAL_DAMAGE_EFFECTS['foot soldier'], ['Powerful Strike', 'Smush']);
    assert.equal(DAMAGE_EFFECT_AI_FAVOR['foot soldier'], 1);
  });

  await t.test('2. Discovery on Actor for Skills and Linked Attacks', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-noggin',
          name: 'Noggin Knocker',
          type: 'skill',
          system: { rank: 2, modifiedRank: 2, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-wrasslin',
          name: 'Wrasslin',
          type: 'skill',
          system: { rank: 1, modifiedRank: 1, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-foot',
          name: 'Foot Soldier',
          type: 'skill',
          system: { rank: 4, modifiedRank: 4, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        }
      ]
    });

    const pugilism = actor.items.find(i => i.name === 'Pugilism');
    const noggin = actor.items.find(i => i.name === 'Noggin Knocker');
    const wrasslin = actor.items.find(i => i.name === 'Wrasslin');
    const foot = actor.items.find(i => i.name === 'Foot Soldier');

    assert.deepEqual(actor.getValidDamageEffects(pugilism), ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);
    assert.deepEqual(actor.getValidDamageEffects(noggin), ['Skullcracker', 'Powerful Strike']);
    assert.deepEqual(actor.getValidDamageEffects(wrasslin), ['Choke Out', 'Dirty Fighting', 'Toss']);
    assert.deepEqual(actor.getValidDamageEffects(foot), ['Powerful Strike', 'Smush']);

    // Weapon/Attack item linked to a canonical skill
    const attackItem = {
      id: 'atk-pugilism',
      name: 'Pugilism',
      type: 'attack',
      system: { toHitStat: 'str', damageDice: '1d2', damageStat: 'str' }
    };
    assert.deepEqual(actor.getValidDamageEffects(attackItem), ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);
  });

  await t.test('3. Custom User-Defined Optional Damage Effects on Any Attack', () => {
    const actor = new DCCActor({
      name: 'Donut',
      type: 'crawler',
      system: { abilities: { str: { score: 10, mod: 4 }, dex: { score: 16, mod: 4 } } }
    });

    // Array of string effects
    const customAttack1 = {
      id: 'atk-custom-1',
      name: 'Katana Slash',
      type: 'attack',
      system: {
        damageDice: '1d8',
        optionalEffects: ['Bleed', 'Armor Piercing', 'Flame Infusion']
      }
    };
    assert.deepEqual(actor.getValidDamageEffects(customAttack1), ['Bleed', 'Armor Piercing', 'Flame Infusion']);

    // Comma-separated string of effects
    const customAttack2 = {
      id: 'atk-custom-2',
      name: 'Sniper Shot',
      type: 'attack',
      system: {
        damageDice: '1d10',
        optionalEffects: 'Headshot, Leg Cripple, Disarm'
      }
    };
    assert.deepEqual(actor.getValidDamageEffects(customAttack2), ['Headshot', 'Leg Cripple', 'Disarm']);

    // Attack without optional effects
    const plainAttack = {
      id: 'atk-plain',
      name: 'Club',
      type: 'attack',
      system: { damageDice: '1d6' }
    };
    assert.deepEqual(actor.getValidDamageEffects(plainAttack), []);
  });

  await t.test('4. Interactive Dialog Prompting and Selection', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-iron-punch',
          name: 'Iron Punch',
          type: 'skill',
          system: { rank: 2, modifiedRank: 2, stat: 'str' }
        }
      ]
    });

    const pugilism = actor.items.find(i => i.name === 'Pugilism');

    // Test selection of Iron Punch via interactive dialog prompt
    const promptPromise = actor.promptDamageEffectDialog(pugilism, { showDialog: true });
    const lastDialog = globalThis._lastCreatedDialog;
    assert.ok(lastDialog, 'Dialog instance should be created');
    assert.match(lastDialog.data.title, /Pugilism: Choose Damage Effect/);
    assert.match(lastDialog.data.content, /Dirty Fighting/);
    assert.match(lastDialog.data.content, /Iron Punch/);
    assert.match(lastDialog.data.content, /Powerful Strike/);
    assert.match(lastDialog.data.content, /\+2 AI Favor/);

    // Simulate user selecting "Iron Punch" and submitting
    lastDialog.triggerButton('roll', {
      find: (selector) => {
        if (selector === 'input[name="damageEffect"]:checked') {
          return { val: () => 'Iron Punch', value: 'Iron Punch' };
        }
        return { val: () => '', value: '' };
      }
    });

    const chosen = await promptPromise;
    assert.equal(chosen, 'Iron Punch');
    assert.equal(pugilism.system.selectedEffect, 'Iron Punch');

    // Test cancellation of dialog
    const cancelPromise = actor.promptDamageEffectDialog(pugilism, { showDialog: true });
    const cancelDialog = globalThis._lastCreatedDialog;
    cancelDialog.triggerButton('cancel');
    const cancelledResult = await cancelPromise;
    assert.equal(cancelledResult, null);
  });

  await t.test('5. Pugilism Damage Effects Resolution', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', baseDamage: '1d2 + Str Bludgeoning' }
        },
        {
          id: 'sk-iron-punch',
          name: 'Iron Punch',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str' }
        },
        {
          id: 'sk-powerful-strike',
          name: 'Powerful Strike',
          type: 'skill',
          system: { rank: 4, modifiedRank: 4, stat: 'str' }
        }
      ]
    });

    const pugilism = actor.items.find(i => i.name === 'Pugilism');

    // Choice 1: "none" (No Damage Effect -> Standard 1d2, Iron Punch NOT applied, +2 AI Favor)
    const noneData = actor.getSkillDamageData(pugilism, { damageEffect: 'none' });
    assert.equal(noneData.baseDice, '1d2');
    assert.equal(noneData.ironPunchApplied, false);
    assert.equal(noneData.chosenEffect, 'none');

    // Choice 2: "Iron Punch" (Pugilism base 1d2 + 1d2 = 2d2 base)
    const ipData = actor.getSkillDamageData(pugilism, { damageEffect: 'Iron Punch' });
    assert.equal(ipData.baseDice, '2d2');
    assert.equal(ipData.ironPunchApplied, true);

    // Choice 3: "Powerful Strike" (Pugilism base 1d2 * Rank 4 = 4d2)
    const psData = actor.getSkillDamageData(pugilism, { damageEffect: 'Powerful Strike' });
    assert.equal(psData.baseDice, '4d2');
    assert.equal(psData.powerfulStrikeApplied, true);

    // Choice 4: "Dirty Fighting" (Base 1d2, dirty fighting applied)
    const dfData = actor.getSkillDamageData(pugilism, { damageEffect: 'Dirty Fighting' });
    assert.equal(dfData.baseDice, '1d2');
    assert.equal(dfData.dirtyFightingApplied, true);
  });

  await t.test('6. Noggin Knocker, Wrasslin, and Foot Soldier Effects Resolution', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-noggin',
          name: 'Noggin Knocker',
          type: 'skill',
          system: { rank: 5, modifiedRank: 5, stat: 'str', baseDamage: '1d4 + Str Bludgeoning' }
        },
        {
          id: 'sk-wrasslin',
          name: 'Wrasslin',
          type: 'skill',
          system: { rank: 2, modifiedRank: 2, stat: 'str', baseDamage: '1d4 + Str Bludgeoning' }
        },
        {
          id: 'sk-foot',
          name: 'Foot Soldier',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', baseDamage: '1d4 + Str Bludgeoning' }
        }
      ]
    });

    const noggin = actor.items.find(i => i.name === 'Noggin Knocker');
    const wrasslin = actor.items.find(i => i.name === 'Wrasslin');
    const foot = actor.items.find(i => i.name === 'Foot Soldier');

    // Skullcracker on Noggin Knocker (adds base damage dice)
    const scData = actor.getSkillDamageData(noggin, { damageEffect: 'Skullcracker', effectRank: 5 });
    assert.equal(scData.skullcrackerApplied, true);
    assert.equal(scData.baseCount > 1, true);

    // Toss on Wrasslin (adds 1d8 Bludgeoning damage part)
    const tossParts = actor.getAttackDamageParts(wrasslin, { damageEffect: 'Toss' });
    const tossPart = tossParts.find(p => p.source === 'Toss');
    assert.ok(tossPart, 'Toss damage part must be present');
    assert.equal(tossPart.dice, '1d8');
    assert.equal(tossPart.type, 'Bludgeoning');

    // Smush on Foot Soldier
    const smushData = actor.getSkillDamageData(foot, { damageEffect: 'Smush' });
    assert.equal(smushData.smushApplied, true);
  });

  await t.test('7. rollAttack hit and damage integration with damage effects', async () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        }
      ]
    });

    const pugilism = actor.items.find(i => i.name === 'Pugilism');

    // 1. Roll to Hit with "Iron Punch"
    const hitMsg = await actor.rollAttack(pugilism, 'hit', { damageEffect: 'Iron Punch' });
    assert.ok(hitMsg, 'Hit message should be created');
    assert.match(hitMsg.flavor, /Iron Punch/);
    assert.equal(hitMsg.flags['carl-rpg'].damageEffect, 'Iron Punch');
    assert.match(hitMsg.content, /data-damage-effect="Iron Punch"/);

    // 2. Roll to Hit with "none" (+2 AI Favor)
    const noneHitMsg = await actor.rollAttack(pugilism, 'hit', { damageEffect: 'none' });
    assert.match(noneHitMsg.flavor, /\+2 AI Favor/);
    assert.equal(noneHitMsg.flags['carl-rpg'].damageEffect, 'none');
    assert.equal(noneHitMsg.flags['carl-rpg'].aiFavorBonus, 2);
    assert.match(noneHitMsg.content, /data-damage-effect="none"/);

    // 3. Roll Damage with "Iron Punch"
    const dmgMsg = await actor.rollAttack(pugilism, 'damage', { damageEffect: 'Iron Punch' });
    assert.ok(dmgMsg, 'Damage message should be created');
    assert.equal(dmgMsg.flags['carl-rpg'].damageEffect, 'Iron Punch');
    assert.match(dmgMsg.content, /IRON PUNCH/i);

    // 4. Abort rollAttack when dialog is cancelled
    let cancelCalled = false;
    const originalPrompt = actor.promptDamageEffectDialog.bind(actor);
    actor.promptDamageEffectDialog = async () => {
      cancelCalled = true;
      return null; // Simulate user clicking Cancel
    };

    const abortedHit = await actor.rollAttack(pugilism, 'hit');
    assert.equal(cancelCalled, true);
    assert.equal(abortedHit, null, 'rollAttack should return null when user cancels dialog');

    actor.promptDamageEffectDialog = originalPrompt;
  });

  await t.test('8. Character Sheet prepareAttackDisplay integration', () => {
    const actor = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: { abilities: { str: { score: 14, mod: 4 }, dex: { score: 12, mod: 4 } } },
      items: [
        {
          id: 'sk-pugilism',
          name: 'Pugilism',
          type: 'skill',
          system: { rank: 3, modifiedRank: 3, stat: 'str', checkType: 'Hand to Hand Attack, Str', baseDamage: '1d2 + Str Bludgeoning' }
        }
      ]
    });

    const attackItem = {
      id: 'atk-pugilism',
      name: 'Pugilism',
      type: 'attack',
      system: { toHitStat: 'str', damageDice: '1d2', damageStat: 'str', selectedEffect: 'Iron Punch' }
    };

    prepareAttackDisplay(attackItem, actor);
    assert.equal(attackItem.hasOptionalEffects, true);
    assert.deepEqual(attackItem.validDamageEffects, ['Dirty Fighting', 'Iron Punch', 'Powerful Strike']);
    assert.equal(attackItem.favorBonus, 2);
    assert.equal(attackItem.selectedEffect, 'Iron Punch');
  });

});
