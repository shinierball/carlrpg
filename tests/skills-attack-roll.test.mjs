import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import { DCCCrawlerSheet } from '../src/sheets/crawler-sheet.mjs';
import { onRenderChatMessage } from '../src/dcc.mjs';

test('Skills Attack Roll and Chat Damage Button Integration', async (t) => {

  await t.test('1. Sheet getData properly classifies attack vs non-attack skills', async () => {
    const actor = new DCCActor({
      id: 'crawler-carl-1',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 },
          dex: { value: 16, unenhanced: 16, mod: 4 },
          con: { value: 8, unenhanced: 8, mod: 3 },
          int: { value: 4, unenhanced: 4, mod: 2 },
          cha: { value: 2, unenhanced: 2, mod: 1 }
        }
      }
    });

    const pugilism = new DCCItem({
      id: 'skill-pugilism',
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        skillType: 'Hand to Hand',
        checkType: 'Attack, Str',
        baseDamage: '1d4 + Str Bludgeoning'
      }
    }, actor);

    const sneak = new DCCItem({
      id: 'skill-sneak',
      name: 'Sneak',
      type: 'skill',
      system: {
        rank: 2,
        stat: 'dex',
        category: 'Utility',
        skillType: 'General',
        checkType: 'Stat Check'
      }
    }, actor);

    actor.items = [pugilism, sneak];
    actor.items.get = (id) => actor.items.find(i => i.id === id);

    const sheet = new DCCCrawlerSheet(actor);
    const data = await sheet.getData();

    const pugilismData = data.skills.find(s => s.id === 'skill-pugilism');
    const sneakData = data.skills.find(s => s.id === 'skill-sneak');

    assert.ok(pugilismData, 'Pugilism must be present in sheet skills');
    assert.equal(pugilismData.isAttack, true, 'Pugilism must be marked as isAttack = true');
    assert.equal(pugilismData.hasDamage, true, 'Pugilism must have hasDamage = true');

    assert.ok(sneakData, 'Sneak must be present in sheet skills');
    assert.equal(sneakData.isAttack, false, 'Sneak must be marked as isAttack = false');
    assert.equal(sneakData.hasDamage, false, 'Sneak must have hasDamage = false');
  });

  await t.test('2. Sheet .roll-skill listener routes attack skills to rollAttack("hit") and other skills to rollSkill()', async () => {
    const actor = new DCCActor({
      id: 'crawler-carl-2',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 },
          dex: { value: 16, unenhanced: 16, mod: 4 },
          int: { value: 8, unenhanced: 8, mod: 3 }
        }
      }
    });

    let rollAttackCalled = null;
    let rollSkillCalled = null;

    actor.rollAttack = async (item, type) => {
      rollAttackCalled = { item, type };
    };
    actor.rollSkill = async (item) => {
      rollSkillCalled = { item };
    };

    const pugilism = new DCCItem({
      id: 'skill-pugilism-2',
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        skillType: 'Hand to Hand',
        checkType: 'Attack, Str',
        baseDamage: '1d4 + Str Bludgeoning'
      }
    }, actor);

    const firstAid = new DCCItem({
      id: 'skill-first-aid',
      name: 'First Aid',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'int',
        category: 'Utility',
        checkType: 'Stat Check'
      }
    }, actor);

    actor.items = [pugilism, firstAid];
    actor.items.get = (id) => actor.items.find(i => i.id === id);

    const sheet = new DCCCrawlerSheet(actor);

    // Simulate clicking Pugilism .roll-skill
    const handlers = {};
    const mockHtml = {
      find: (selector) => {
        return {
          click: (fn) => {
            handlers[selector] = fn;
          },
          on: () => {},
          change: () => {}
        };
      }
    };

    sheet.activateListeners(mockHtml);

    assert.ok(handlers['.roll-skill'], 'roll-skill click handler must be registered');

    // Click Pugilism (attack skill)
    const fakeEvPugilism = {
      currentTarget: {
        closest: (sel) => ({
          data: (key) => (key === 'itemId' ? 'skill-pugilism-2' : null)
        })
      }
    };
    handlers['.roll-skill'](fakeEvPugilism);

    assert.ok(rollAttackCalled, 'actor.rollAttack must be called for attack skill');
    assert.equal(rollAttackCalled.item.id, 'skill-pugilism-2');
    assert.equal(rollAttackCalled.type, 'hit');
    assert.equal(rollSkillCalled, null, 'rollSkill should NOT be called for attack skill');

    // Reset spies
    rollAttackCalled = null;
    rollSkillCalled = null;

    // Click First Aid (utility skill)
    const fakeEvFirstAid = {
      currentTarget: {
        closest: (sel) => ({
          data: (key) => (key === 'itemId' ? 'skill-first-aid' : null)
        })
      }
    };
    handlers['.roll-skill'](fakeEvFirstAid);

    assert.equal(rollAttackCalled, null, 'rollAttack should NOT be called for utility skill');
    assert.ok(rollSkillCalled, 'actor.rollSkill must be called for utility skill');
    assert.equal(rollSkillCalled.item.id, 'skill-first-aid');
  });

  await t.test('3. actor.rollAttack(skillItem, "hit") includes rendered dice roll and damage button', async () => {
    const actor = new DCCActor({
      id: 'crawler-carl-3',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 },
          dex: { value: 16, unenhanced: 16, mod: 4 }
        }
      }
    });

    const pugilism = new DCCItem({
      id: 'skill-pugilism-3',
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        checkType: 'Attack, Str',
        baseDamage: '1d4 + Str Bludgeoning'
      }
    }, actor);

    actor.items = [pugilism];
    actor.items.get = (id) => actor.items.find(i => i.id === id);

    const message = await actor.rollAttack(pugilism, 'hit');
    assert.ok(message, 'rollAttack should return a ChatMessage');
    assert.ok(message.flavor.includes('To Hit'), 'Flavor must indicate To Hit check');
    assert.ok(message.flavor.includes('vs Target Evade'), 'Flavor must mention Target Evade');

    // Check content contains rendered roll box
    assert.ok(message.content.includes('dice-roll'), 'Message content must include the rendered dice roll box');
    // Check content contains damage button
    assert.ok(message.content.includes('roll-attack-dmg-from-card'), 'Message content must include roll-attack-dmg-from-card button');
    assert.ok(message.content.includes('roll-skill-dmg-from-card'), 'Message content must include roll-skill-dmg-from-card button');
    assert.ok(message.content.includes(`data-actor-id="crawler-carl-3"`), 'Button must have data-actor-id');
    assert.ok(message.content.includes(`data-item-id="skill-pugilism-3"`), 'Button must have data-item-id');
  });

  await t.test('4. Chat message hook binds click on damage button to roll damage', async () => {
    let rolledDamage = null;
    const actor = new DCCActor({
      id: 'crawler-carl-4',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 }
        }
      }
    });

    const pugilism = new DCCItem({
      id: 'skill-pugilism-4',
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        checkType: 'Attack, Str',
        baseDamage: '1d4 + Str Bludgeoning'
      }
    }, actor);

    actor.items = [pugilism];
    actor.items.get = (id) => actor.items.find(i => i.id === id);
    actor.rollSkillDamage = async (item) => {
      rolledDamage = item;
    };

    globalThis.game.actors = [actor];
    globalThis.game.actors.get = (id) => (id === 'crawler-carl-4' ? actor : null);

    const listeners = {};
    const dmgBtn = {
      dataset: {
        actorId: 'crawler-carl-4',
        itemId: 'skill-pugilism-4',
        skillId: 'skill-pugilism-4'
      },
      addEventListener: (event, fn) => {
        listeners[event] = fn;
      }
    };

    const rootElem = {
      querySelectorAll: (sel) => {
        if (sel === '.roll-skill-dmg-from-card, .roll-attack-dmg-from-card') return [dmgBtn];
        return [];
      }
    };

    onRenderChatMessage({}, rootElem, {});
    assert.ok(listeners.click, 'Click listener must be attached to roll damage button in chat');

    await listeners.click({ preventDefault: () => {} });
    assert.ok(rolledDamage, 'actor.rollSkillDamage must be executed when clicking chat card button');
    assert.equal(rolledDamage.id, 'skill-pugilism-4');
  });

  await t.test('5. Rolling skill damage outputs damage card with breakdown and apply buttons', async () => {
    const actor = new DCCActor({
      id: 'crawler-carl-5',
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 24, unenhanced: 24, mod: 5 }
        }
      }
    });

    const pugilism = new DCCItem({
      id: 'skill-pugilism-5',
      name: 'Pugilism',
      type: 'skill',
      system: {
        rank: 1,
        stat: 'str',
        category: 'Combat',
        checkType: 'Attack, Str',
        baseDamage: '1d4 + Str Bludgeoning'
      }
    }, actor);

    actor.items = [pugilism];
    actor.items.get = (id) => actor.items.find(i => i.id === id);

    const dmgMessage = await actor.rollSkillDamage(pugilism);
    assert.ok(dmgMessage, 'Damage roll message must be returned');
    assert.ok(dmgMessage.content.includes('dcc-damage-card'), 'Content must contain dcc-damage-card');
    assert.ok(dmgMessage.content.includes('dcc-apply-damage-btn'), 'Content must contain apply damage button');
    assert.ok(dmgMessage.content.includes('Bludgeoning'), 'Content must show typed damage breakdown');
  });

});
