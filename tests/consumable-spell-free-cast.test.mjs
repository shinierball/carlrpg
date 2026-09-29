/**
 * Tests for Free Spell Casting from Consumables, Items, Scrolls, Wands, and Gear
 * Verifies that when a consumable or item is used and a spell is cast as the effect,
 * the spell costs 0 mana and succeeds even if the caster has 0 current MP.
 */

import './setup.mjs';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';

describe('Consumable and Item Spell Free Cast Subsystem (0 Mana Cost)', () => {
  let crawler;
  let fireballSpell;
  let healSpell;

  before(() => {
    CONFIG.Actor.documentClass = DCCActor;
    CONFIG.Item.documentClass = DCCItem;
  });

  beforeEach(() => {

    crawler = new DCCActor({
      name: 'Princess Donut',
      type: 'crawler',
      system: {
        attributes: {
          hp: { value: 10, max: 20 },
          mana: { value: 0, max: 20 } // Starts with 0 MP
        },
        abilities: {
          con: { value: 14, unenhanced: 14, mod: 4 },
          int: { value: 16, unenhanced: 16, mod: 4 }
        }
      }
    });

    fireballSpell = new DCCItem({
      id: 'spell-fireball',
      name: 'Fireball',
      type: 'spell',
      system: {
        rank: 3,
        manaCost: 10,
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '3d10 + Int'
      }
    }, crawler);

    healSpell = new DCCItem({
      id: 'spell-heal',
      name: 'Heal',
      type: 'spell',
      system: {
        rank: 1,
        manaCost: 2,
        spellType: 'Heal',
        baseDamage: '2 health bar slots'
      }
    }, crawler);

    crawler.items.push(fireballSpell, healSpell);

    // Register global spells compendium mock
    CONFIG.DCC = CONFIG.DCC || {};
    CONFIG.DCC.spells = [
      {
        _id: 'spell-fireball',
        id: 'spell-fireball',
        name: 'Fireball',
        type: 'spell',
        system: {
          rank: 3,
          manaCost: 10,
          spellType: 'Attack',
          damageType: 'Fire',
          baseDamage: '3d10 + Int'
        }
      },
      {
        _id: 'spell-heal',
        id: 'spell-heal',
        name: 'Heal',
        type: 'spell',
        system: {
          rank: 1,
          manaCost: 2,
          spellType: 'Heal',
          baseDamage: '2 health bar slots'
        }
      },
      {
        _id: 'spell-lightning',
        id: 'spell-lightning',
        name: 'Lightning Bolt',
        type: 'spell',
        system: {
          rank: 2,
          manaCost: 8,
          spellType: 'Attack',
          damageType: 'Lightning',
          baseDamage: '2d12 + Int'
        }
      }
    ];
  });

  describe('1. Direct rollSpell Free Cast Support', () => {
    it('standard cast fails with insufficient mana when crawler has 0 MP', async () => {
      assert.equal(crawler.system.attributes.mana.value, 0);

      const msg = await crawler.rollSpell(fireballSpell);
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg'].spellFailed, true);
      assert.equal(msg.flags['carl-rpg'].reason, 'insufficient_mana');
      assert.equal(crawler.system.attributes.mana.value, 0);
      assert.ok(msg.content.includes('FAILED'));
    });

    it('free cast succeeds with 0 mana cost and does not deduct mana even at 0 MP', async () => {
      assert.equal(crawler.system.attributes.mana.value, 0);

      const msg = await crawler.rollSpell(fireballSpell, { freeCast: true, isConsumable: true });
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
      assert.equal(msg.flags['carl-rpg'].manaCost, 0, 'Mana cost must be 0 for free casts');
      assert.equal(msg.flags['carl-rpg'].baseManaCost, 10, 'Base mana cost preserved in flags');
      assert.equal(msg.flags['carl-rpg'].freeCast, true);
      assert.equal(msg.flags['carl-rpg'].remainingMana, 0);
      assert.equal(crawler.system.attributes.mana.value, 0, 'Caster mana remains 0');
      assert.ok(msg.content.includes('0 MP (Free Cast)'));
    });

    it('free cast works when passing action="cast" and options as 3rd parameter', async () => {
      crawler.system.attributes.mana.value = 5;

      const msg = await crawler.rollSpell(fireballSpell, 'cast', { freeCast: true });
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
      assert.equal(msg.flags['carl-rpg'].manaCost, 0);
      assert.equal(crawler.system.attributes.mana.value, 5, '5 MP preserved with no deduction');
    });

    it('free cast Heal restores HP while spending 0 MP', async () => {
      crawler.system.attributes.mana.value = 0;
      crawler.system.attributes.hp.value = 6; // Missing HP

      const msg = await crawler.rollSpell(healSpell, { freeCast: true });
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg'].spellSuccess, true);
      assert.equal(msg.flags['carl-rpg'].manaCost, 0);
      assert.equal(msg.flags['carl-rpg'].isHeal, true);
      assert.equal(crawler.system.attributes.mana.value, 0, 'Mana stays at 0');
      assert.ok(crawler.system.attributes.hp.value > 6, 'Health was restored');
    });
  });

  describe('2. Scrolls (Single-Use Consumables with Inscribed Spell)', () => {
    it('using scroll casts inscribed spell with 0 mana and consumes item', async () => {
      crawler.system.attributes.mana.value = 0;

      const scroll = new DCCItem({
        id: 'scroll-fireball',
        name: 'Scroll of Fireball',
        type: 'loot',
        system: {
          quantity: 1,
          lootType: 'scroll',
          spellId: 'spell-fireball',
          spellName: 'Fireball'
        }
      }, crawler);
      crawler.items.push(scroll);

      const msg = await scroll.useLoot();
      assert.ok(msg, 'Spell chat card or result must be generated');

      // Verified spell cast succeeded with 0 mana
      assert.equal(msg.flags['carl-rpg']?.spellSuccess, true);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.equal(msg.flags['carl-rpg']?.freeCast, true);

      // Caster mana is untouched at 0 MP
      assert.equal(crawler.system.attributes.mana.value, 0);

      // Scroll consumed and deleted
      assert.ok(!crawler.items.some(i => i.id === 'scroll-fireball'));
    });
  });

  describe('3. Wands (Multi-Charge Items with Inscribed Spell)', () => {
    it('using wand casts inscribed spell with 0 mana and decrements charges', async () => {
      crawler.system.attributes.mana.value = 0;

      const wand = new DCCItem({
        id: 'wand-lightning',
        name: 'Wand of Lightning',
        type: 'loot',
        system: {
          lootType: 'wand',
          charges: { value: 3, max: 3 },
          spellId: 'spell-lightning',
          spellName: 'Lightning Bolt'
        }
      }, crawler);
      crawler.items.push(wand);

      const msg = await wand.useLoot();
      assert.ok(msg);

      // Cast succeeded with 0 mana
      assert.equal(msg.flags['carl-rpg']?.spellSuccess, true);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.equal(msg.flags['carl-rpg']?.freeCast, true);

      // Caster mana untouched
      assert.equal(crawler.system.attributes.mana.value, 0);

      // Wand charges decremented from 3 to 2
      assert.equal(wand.system.charges.value, 2);
    });
  });

  describe('4. Consumables with Outcomes Builder Spell Effects', () => {
    it('consumable elixir with spell outcome triggers cast at 0 mana cost', async () => {
      crawler.system.attributes.mana.value = 0;
      crawler.system.attributes.hp.value = 8;

      const battlePotion = new DCCItem({
        id: 'potion-battle',
        name: 'Battle Surge Potion',
        type: 'loot',
        system: {
          quantity: 1,
          lootType: 'potion',
          executionMode: 'all',
          outcomes: [
            {
              name: 'Heal',
              type: 'spell',
              spellId: 'spell-heal',
              spellName: 'Heal',
              targetType: 'self'
            },
            {
              name: 'Fireball',
              type: 'spell',
              spellId: 'spell-fireball',
              spellName: 'Fireball',
              targetType: 'closest_mob'
            }
          ]
        }
      }, crawler);
      crawler.items.push(battlePotion);

      const msg = await battlePotion.useLoot();
      assert.ok(msg);

      // Mana stays at 0
      assert.equal(crawler.system.attributes.mana.value, 0);

      // Multi-effect card generated with Free Cast badge
      assert.ok(msg.content.includes('Battle Surge Potion'));
      assert.ok(msg.content.includes('0 MP (FREE CAST)') || msg.content.includes('Free Cast'));
      assert.ok(msg.content.includes('Costs <strong>0 Mana</strong>'));
    });
  });

  describe('5. Activated Gear with Spell Effects', () => {
    it('activating gear with spell casts with 0 mana', async () => {
      crawler.system.attributes.mana.value = 0;

      const ringOfFlames = new DCCItem({
        id: 'ring-flames',
        name: 'Ring of Minor Flames',
        type: 'gear',
        system: {
          equipped: true,
          slot: 'accessory',
          hasActivatedAbility: true,
          cooldown: 'Once per scene',
          charges: { value: 1, max: 1 },
          spellName: 'Fireball',
          spellId: 'spell-fireball'
        }
      }, crawler);
      crawler.items.push(ringOfFlames);

      const msg = await ringOfFlames.useGear();
      assert.ok(msg);

      assert.equal(msg.flags['carl-rpg']?.spellSuccess, true);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.equal(msg.flags['carl-rpg']?.freeCast, true);
      assert.equal(crawler.system.attributes.mana.value, 0);
      assert.equal(ringOfFlames.system.charges.value, 0);
    });
  });

  describe('6. DCCItem.rollSpellCard static fallback', () => {
    it('generates chat card reflecting 0 MP free cast when freeCast option is passed', async () => {
      const msg = await DCCItem.rollSpellCard(fireballSpell, { freeCast: true, originItem: { name: 'Mystery Scroll' } });
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg']?.freeCast, true);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.ok(msg.content.includes('0 MP (Free Cast)'));
      assert.ok(msg.content.includes('Mystery Scroll'));
    });
  });

  describe('7. Mana Preservation When Caster Has Available MP', () => {
    it('using scroll does not deduct mana even when crawler has plenty of mana', async () => {
      crawler.system.attributes.mana.value = 18;

      const scroll = new DCCItem({
        id: 'scroll-fb-18',
        name: 'Scroll of Fireball',
        type: 'loot',
        system: {
          quantity: 1,
          lootType: 'scroll',
          spellId: 'spell-fireball',
          spellName: 'Fireball'
        }
      }, crawler);
      crawler.items.push(scroll);

      const msg = await scroll.useLoot();
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.equal(msg.flags['carl-rpg']?.freeCast, true);
      assert.equal(crawler.system.attributes.mana.value, 18, 'Mana must remain exactly 18 MP');
    });

    it('using wand does not deduct mana even when crawler has plenty of mana', async () => {
      crawler.system.attributes.mana.value = 14;

      const wand = new DCCItem({
        id: 'wand-lt-14',
        name: 'Wand of Lightning',
        type: 'loot',
        system: {
          lootType: 'wand',
          charges: { value: 2, max: 2 },
          spellId: 'spell-lightning',
          spellName: 'Lightning Bolt'
        }
      }, crawler);
      crawler.items.push(wand);

      const msg = await wand.useLoot();
      assert.ok(msg);
      assert.equal(msg.flags['carl-rpg']?.manaCost, 0);
      assert.equal(crawler.system.attributes.mana.value, 14, 'Mana must remain exactly 14 MP');
    });
  });

  describe('8. Chat Card Cast Spell Button Hook Integration', () => {
    it('clicking .dcc-cast-spell-btn triggers freeCast rollSpell on target actor', async () => {
      crawler.system.attributes.mana.value = 0;
      globalThis.game.actors = {
        get: (id) => (id === crawler.id ? crawler : null)
      };

      const { onRenderChatMessage } = await import('../src/dcc.mjs');

      let clicked = false;
      const fakeBtn = {
        dataset: {
          actorId: crawler.id,
          spellId: 'spell-fireball',
          spellName: 'Fireball',
          freeCast: 'true'
        },
        addEventListener: (evType, fn) => {
          if (evType === 'click') {
            fakeBtn._handler = fn;
          }
        }
      };

      const fakeHtml = {
        querySelectorAll: (selector) => {
          if (selector === '.dcc-cast-spell-btn') return [fakeBtn];
          return [];
        }
      };

      onRenderChatMessage({}, fakeHtml);

      assert.ok(fakeBtn._handler, 'Click handler must be bound to button');

      // Trigger the click
      let prevented = false;
      await fakeBtn._handler({ preventDefault: () => { prevented = true; } });

      assert.equal(prevented, true);
      assert.equal(crawler.system.attributes.mana.value, 0, 'Caster MP must remain 0');
    });
  });
});

