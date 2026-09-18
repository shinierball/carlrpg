import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import './setup.mjs';
import { onRenderChatMessage, registerChatMessageHook } from '../src/dcc.mjs';
import { DCCCombatMetrics } from '../src/apps/combat-metrics.mjs';

describe('DCC RPG Chat Message Rendering Hook & Foundry v13+ Compatibility', () => {

  describe('1. Hook Registration Strategy (v13+ vs v12)', () => {
    test('registers renderChatMessageHTML on Foundry v13+ and avoids renderChatMessage', () => {
      // Configure v13 environment
      globalThis.game.release = { generation: 13 };
      globalThis.game.version = '13.334';
      delete globalThis.Hooks.events['renderChatMessage'];
      delete globalThis.Hooks.events['renderChatMessageHTML'];

      const hookName = registerChatMessageHook();
      assert.equal(hookName, 'renderChatMessageHTML');

      // Crucial: renderChatMessage must NOT have any listeners to avoid deprecation warning in Foundry v13+
      const legacyListeners = globalThis.Hooks.events['renderChatMessage'] || [];
      assert.equal(legacyListeners.length, 0, 'renderChatMessage must not be registered in v13 to prevent deprecation warning');

      const v13Listeners = globalThis.Hooks.events['renderChatMessageHTML'] || [];
      assert.equal(v13Listeners.length, 1, 'renderChatMessageHTML must be registered in v13');
    });

    test('registers renderChatMessage on Foundry v12 for backwards compatibility', () => {
      // Configure v12 environment
      globalThis.game.release = { generation: 12 };
      globalThis.game.version = '12.331';
      delete globalThis.Hooks.events['renderChatMessage'];
      delete globalThis.Hooks.events['renderChatMessageHTML'];

      const hookName = registerChatMessageHook();
      assert.equal(hookName, 'renderChatMessage');

      const legacyListeners = globalThis.Hooks.events['renderChatMessage'] || [];
      assert.equal(legacyListeners.length, 1, 'renderChatMessage must be registered in v12');
    });

    test('re-registering unbinds previous hook if version changes dynamically', () => {
      globalThis.game.release = { generation: 12 };
      globalThis.game.version = '12.331';
      registerChatMessageHook();
      assert.equal(globalThis.Hooks.events['renderChatMessage']?.length, 1);

      // Now upgrade to v13
      globalThis.game.release = { generation: 13 };
      globalThis.game.version = '13.0.0';
      registerChatMessageHook();

      assert.equal(globalThis.Hooks.events['renderChatMessage']?.length || 0, 0, 'Old v12 hook should be unbound');
      assert.equal(globalThis.Hooks.events['renderChatMessageHTML']?.length, 1, 'New v13 hook should be active');
    });

    test('correctly identifies v13 at early module evaluation time when game is undefined', () => {
      const origGame = globalThis.game;
      try {
        delete globalThis.game;
        delete globalThis.Hooks.events['renderChatMessage'];
        delete globalThis.Hooks.events['renderChatMessageHTML'];

        const hookName = registerChatMessageHook();
        assert.equal(hookName, 'renderChatMessageHTML');

        const legacyListeners = globalThis.Hooks.events['renderChatMessage'] || [];
        assert.equal(legacyListeners.length, 0, 'renderChatMessage must not be registered even when game is undefined');
      } finally {
        globalThis.game = origGame;
      }
    });
  });

  describe('2. DOM / HTMLElement Compatibility (v13+ HTMLElement)', () => {
    test('onRenderChatMessage handles HTMLElement and binds Apply Damage button', async () => {
      let appliedDamageCall = null;
      const originalApply = DCCCombatMetrics.applyDamageToTarget;
      DCCCombatMetrics.applyDamageToTarget = async (params) => {
        appliedDamageCall = params;
        return {
          targetName: 'Goblin',
          actualDamage: 10,
          barsRemoved: 1,
          newHp: 30,
          excessDamage: 0
        };
      };

      const attacker = { id: 'attacker-1', name: 'Carl' };
      const targetActor = { id: 'target-1', name: 'Goblin' };
      globalThis.game.actors = [attacker, targetActor];
      globalThis.game.actors.get = (id) => (id === 'attacker-1' ? attacker : (id === 'target-1' ? targetActor : null));
      globalThis.game.user = { id: 'u1', targets: [{ actor: targetActor }] };

      // Create a mock DOM element tree simulating a chat card
      const listeners = {};
      const cardElem = {
        dataset: {
          attackerId: 'attacker-1',
          itemName: 'Crowbar',
          attackType: 'melee',
          damageValue: '12',
          damageType: 'bludgeoning'
        },
        querySelectorAll: (sel) => [],
        insertAdjacentHTML: (pos, html) => {
          cardElem.innerHTML = (cardElem.innerHTML || '') + html;
        }
      };

      const btnElem = {
        dataset: {
          multiplier: '1',
          ignoreDr: ''
        },
        closest: (sel) => (sel === '.dcc-damage-card' ? cardElem : null),
        addEventListener: (event, fn) => {
          listeners[event] = fn;
        }
      };

      const rootElem = {
        querySelectorAll: (sel) => {
          if (sel === '.dcc-apply-damage-btn') return [btnElem];
          if (sel === '.roll-spell-dmg-from-card') return [];
          return [];
        }
      };

      try {
        onRenderChatMessage({}, rootElem, {});

        assert.ok(listeners.click, 'Click listener must be attached to apply damage button');

        // Simulate click
        await listeners.click({ preventDefault: () => {} });

        assert.ok(appliedDamageCall, 'applyDamageToTarget should have been called');
        assert.equal(appliedDamageCall.rawDamage, 12);
        assert.equal(appliedDamageCall.attackName, 'Crowbar');
        assert.equal(appliedDamageCall.damageType, 'bludgeoning');
        assert.equal(appliedDamageCall.targetActor.name, 'Goblin');
        assert.ok(cardElem.innerHTML.includes('Applied to 1 target(s)'));
      } finally {
        DCCCombatMetrics.applyDamageToTarget = originalApply;
      }
    });

    test('onRenderChatMessage handles HTMLElement and binds Roll Spell Damage button', async () => {
      let rolledSpell = null;
      const spellItem = { id: 'spell-fireball', name: 'Fireball' };
      const caster = {
        id: 'caster-1',
        name: 'Donut',
        items: [spellItem],
        rollSpellDamage: async (sp) => {
          rolledSpell = sp;
        }
      };
      globalThis.game.actors = [caster];
      globalThis.game.actors.get = (id) => (id === 'caster-1' ? caster : null);

      const listeners = {};
      const spellBtn = {
        dataset: {
          actorId: 'caster-1',
          spellId: 'spell-fireball'
        },
        addEventListener: (event, fn) => {
          listeners[event] = fn;
        }
      };

      const rootElem = {
        querySelectorAll: (sel) => {
          if (sel === '.dcc-apply-damage-btn') return [];
          if (sel === '.roll-spell-dmg-from-card') return [spellBtn];
          return [];
        }
      };

      onRenderChatMessage({}, rootElem, {});
      assert.ok(listeners.click, 'Click listener must be attached to roll spell damage button');

      await listeners.click({ preventDefault: () => {} });
      assert.ok(rolledSpell, 'rollSpellDamage should have been executed');
      assert.equal(rolledSpell.id, 'spell-fireball');
    });

    test('onRenderChatMessage handles jQuery elements for backwards compatibility', async () => {
      const btnClickHandlers = [];
      const mockJQuery = {
        find: (sel) => {
          return {
            [Symbol.iterator]: function* () {
              yield {
                dataset: {},
                addEventListener: (ev, fn) => btnClickHandlers.push(fn)
              };
            }
          };
        }
      };

      // Should run cleanly without throwing
      assert.doesNotThrow(() => {
        onRenderChatMessage({}, mockJQuery, {});
      });
    });
  });
});
