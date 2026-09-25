import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './setup.mjs';
import { DCCActor } from '../src/documents/actor.mjs';
import { DCCItem } from '../src/documents/item.mjs';
import {
  isPassiveSkill,
  resolveHotlistItem,
  DCCCrawlerHotbarHUD,
  DCCCrawlerActionHUD,
  DCCCrawlerTokenHUD,
  getCrawlerTokenHUD,
  initCrawlerTokenHUD
} from '../src/apps/crawler-token-hud.mjs';

test('DCC RPG Crawler Token HUDs — Hotbar (Above Macro Bar) & Left Action Panel (Below Scene List)', async (t) => {

  await t.test('1. Template Preloading & DOM Integrity', () => {
    const dccMjs = fs.readFileSync('src/dcc.mjs', 'utf8');
    assert.ok(
      dccMjs.includes("'systems/carl-rpg/templates/apps/crawler-hotbar-hud.hbs'"),
      'crawler-hotbar-hud.hbs must be registered in loadTemplates in src/dcc.mjs'
    );
    assert.ok(
      dccMjs.includes("'systems/carl-rpg/templates/apps/crawler-action-hud.hbs'"),
      'crawler-action-hud.hbs must be registered in loadTemplates in src/dcc.mjs'
    );

    const hotbarHbs = fs.readFileSync('templates/apps/crawler-hotbar-hud.hbs', 'utf8');
    assert.ok(hotbarHbs.includes('dcc-crawler-hotbar-hud'), 'Hotbar template defines dcc-crawler-hotbar-hud');
    assert.ok(hotbarHbs.includes('dcc-hotbar-hud-grid'), 'Hotbar template defines 10 slots grid');
    assert.ok(hotbarHbs.includes('roll-hotlist-attack'), 'Hotbar template defines roll-hotlist-attack');
    assert.ok(hotbarHbs.includes('roll-hotlist-attack-dmg'), 'Hotbar template defines roll-hotlist-attack-dmg');
    assert.ok(hotbarHbs.includes('toggle-hotlist-equip'), 'Hotbar template defines toggle-hotlist-equip');
    assert.ok(hotbarHbs.includes('roll-hotlist-spell'), 'Hotbar template defines roll-hotlist-spell');
    assert.ok(hotbarHbs.includes('roll-hotlist-spell-dmg'), 'Hotbar template defines roll-hotlist-spell-dmg');
    assert.ok(hotbarHbs.includes('roll-hotlist-use'), 'Hotbar template defines roll-hotlist-use');
    assert.ok(hotbarHbs.includes('hotlist-slot-clear'), 'Hotbar template defines hotlist-slot-clear');

    const actionHbs = fs.readFileSync('templates/apps/crawler-action-hud.hbs', 'utf8');
    assert.ok(actionHbs.includes('dcc-crawler-action-hud'), 'Action HUD template defines dcc-crawler-action-hud');
    assert.ok(actionHbs.includes('roll-attack-hit'), 'Action HUD template defines roll-attack-hit');
    assert.ok(actionHbs.includes('roll-attack-dmg'), 'Action HUD template defines roll-attack-dmg');
    assert.ok(actionHbs.includes('roll-skill'), 'Action HUD template defines roll-skill');
    assert.ok(actionHbs.includes('dcc-action-hud-toggle'), 'Action HUD template defines toggle button');
  });

  await t.test('2. Passive Skill Discrimination Logic', () => {
    // Passive skills
    assert.equal(isPassiveSkill({ system: { category: 'Passive', checkType: 'Stat Check' } }), true);
    assert.equal(isPassiveSkill({ system: { category: 'Combat', checkType: 'Passive, No Roll' } }), true);
    assert.equal(isPassiveSkill({ system: { category: 'Combat', checkType: 'Wrasslin\' Damage Effect, Passive' } }), true);
    assert.equal(isPassiveSkill({ system: { category: 'Utility', skillType: 'Passive' } }), true);
    assert.equal(isPassiveSkill({ system: { type: 'Passive' } }), true);
    assert.equal(isPassiveSkill({ system: { isPassive: true } }), true);

    // Non-passive (active) skills
    assert.equal(isPassiveSkill({ system: { category: 'Utility', checkType: 'Stat Check', skillType: 'Utility' } }), false);
    assert.equal(isPassiveSkill({ system: { category: 'Combat', checkType: 'Opposed Check', skillType: 'Edge' } }), false);
    assert.equal(isPassiveSkill({ system: { category: 'Combat', checkType: 'Attack Check', skillType: 'Hand to Hand' } }), false);
    assert.equal(isPassiveSkill({ system: { category: 'Utility', checkType: '1d20 + DEX' } }), false);
    assert.equal(isPassiveSkill(null), false);
  });

  await t.test('3. Hotbar HUD getData & Slot Resolution', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 18, unenhanced: 18, mod: 4 },
          dex: { value: 14, unenhanced: 14, mod: 4 },
          int: { value: 10, unenhanced: 10, mod: 4 }
        },
        hotlist: {
          slot1: 'atk-sword',
          slot2: 'spell-fire',
          slot3: 'gear-shield',
          slot4: 'loot-potion',
          slot5: 'skill-h2h',
          slot6: 'skill-climb',
          slot7: '',
          slot8: '',
          slot9: '',
          slot10: ''
        }
      }
    });

    const sword = new DCCItem({
      id: 'atk-sword',
      name: 'Broadsword',
      type: 'attack',
      system: { damageDice: '1d8', damageStat: 'str' }
    }, crawler);

    const spell = new DCCItem({
      id: 'spell-fire',
      name: 'Flame Jet',
      type: 'spell',
      system: { manaCost: 3, spellType: 'Attack', baseDamage: '1d6' }
    }, crawler);

    const shield = new DCCItem({
      id: 'gear-shield',
      name: 'Heavy Shield',
      type: 'gear',
      system: { slot: 'hands', equipped: true }
    }, crawler);

    const potion = new DCCItem({
      id: 'loot-potion',
      name: 'Mana Potion',
      type: 'loot',
      system: { quantity: 3 }
    }, crawler);

    const h2h = new DCCItem({
      id: 'skill-h2h',
      name: 'Hand to Hand',
      type: 'skill',
      system: { rank: 2, stat: 'str', skillType: 'Hand to Hand', checkType: 'Attack Check' }
    }, crawler);

    const climb = new DCCItem({
      id: 'skill-climb',
      name: 'Climbing',
      type: 'skill',
      system: { rank: 3, stat: 'str', skillType: 'Utility', checkType: 'Stat Check' }
    }, crawler);

    crawler.items.push(sword, spell, shield, potion, h2h, climb);

    const mockToken = { id: 'token-carl', actor: crawler };
    const hud = new DCCCrawlerHotbarHUD(crawler, mockToken);
    const data = await hud.getData();

    assert.equal(data.slots.length, 10, 'Hotbar HUD must contain exactly 10 slots');
    assert.equal(data.crawlerName, 'Carl');

    // Slot 1: Attack
    const s1 = data.slots[0];
    assert.equal(s1.index, 1);
    assert.equal(s1.name, 'Broadsword');
    assert.equal(s1.isAttack, true);
    assert.equal(s1.badge, 'ATTACK');
    assert.equal(s1.hasDamage, true);

    // Slot 2: Spell
    const s2 = data.slots[1];
    assert.equal(s2.index, 2);
    assert.equal(s2.name, 'Flame Jet');
    assert.equal(s2.isSpell, true);
    assert.equal(s2.badge, 'SPELL');
    assert.ok(s2.detail.includes('3 MP'));

    // Slot 3: Gear
    const s3 = data.slots[2];
    assert.equal(s3.index, 3);
    assert.equal(s3.name, 'Heavy Shield');
    assert.equal(s3.isGear, true);
    assert.equal(s3.isEquipped, true);
    assert.equal(s3.detail, 'Equipped');

    // Slot 4: Loot
    const s4 = data.slots[3];
    assert.equal(s4.index, 4);
    assert.equal(s4.name, 'Mana Potion');
    assert.equal(s4.isLoot, true);
    assert.equal(s4.badge, 'ITEM');
    assert.equal(s4.detail, 'x3');

    // Slot 5: Attack Skill
    const s5 = data.slots[4];
    assert.equal(s5.index, 5);
    assert.equal(s5.name, 'Hand to Hand');
    assert.equal(s5.isSkill, true);
    assert.equal(s5.isAttack, true);
    assert.equal(s5.badge, 'ATTACK');

    // Slot 6: Utility Skill
    const s6 = data.slots[5];
    assert.equal(s6.index, 6);
    assert.equal(s6.name, 'Climbing');
    assert.equal(s6.isSkill, true);
    assert.equal(s6.isAttack, false);
    assert.equal(s6.badge, 'SKILL');

    // Slots 7-10: Empty
    for (let i = 6; i < 10; i++) {
      assert.equal(data.slots[i].isEmpty, true, `Slot ${i + 1} must be empty`);
    }
  });

  await t.test('4. Hotbar HUD Usable Action Triggers', async () => {
    let rolledAttackHit = false;
    let rolledAttackDmg = false;
    let rolledSpellCast = false;
    let rolledSpellDmg = false;
    let toggledEquip = false;
    let usedLoot = false;
    let rolledSkill = false;
    let clearedSlot = null;

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        hotlist: {
          slot1: 'atk-sword',
          slot2: 'spell-fire',
          slot3: 'gear-shield',
          slot4: 'loot-potion',
          slot5: 'skill-climb'
        }
      }
    });

    crawler.rollAttack = async (item, mode) => {
      if (mode === 'damage') rolledAttackDmg = true;
      else rolledAttackHit = true;
    };
    crawler.rollSpell = async () => { rolledSpellCast = true; };
    crawler.rollSpellDamage = async () => { rolledSpellDmg = true; };
    crawler.rollSkill = async () => { rolledSkill = true; };
    crawler.update = async (payload) => {
      for (const [k, v] of Object.entries(payload)) {
        if (k.startsWith('system.hotlist.')) {
          clearedSlot = k.replace('system.hotlist.', '');
        }
      }
    };

    const sword = new DCCItem({ id: 'atk-sword', name: 'Broadsword', type: 'attack' }, crawler);
    const spell = new DCCItem({ id: 'spell-fire', name: 'Flame Jet', type: 'spell' }, crawler);
    const shield = new DCCItem({ id: 'gear-shield', name: 'Shield', type: 'gear', system: { equipped: false } }, crawler);
    shield.update = async (payload) => {
      if ('system.equipped' in payload) toggledEquip = payload['system.equipped'];
    };
    const potion = new DCCItem({ id: 'loot-potion', name: 'Potion', type: 'loot' }, crawler);
    potion.useLoot = async () => { usedLoot = true; };
    const climb = new DCCItem({ id: 'skill-climb', name: 'Climbing', type: 'skill' }, crawler);

    crawler.items.push(sword, spell, shield, potion, climb);

    const hud = new DCCCrawlerHotbarHUD(crawler);

    // Mock jQuery event dispatcher
    const clickListeners = {};
    const mockRoot = {
      find: (sel) => ({
        click: (fn) => { clickListeners[sel] = fn; return mockRoot.find(sel); },
        on: () => mockRoot.find(sel),
        addClass: () => {},
        removeClass: () => {}
      })
    };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => ({
      data: (k) => {
        if (k === 'itemId') return el.itemId;
        if (k === 'slot') return el.slot;
        return null;
      },
      addClass: () => {},
      removeClass: () => {}
    });

    hud.activateListeners(mockRoot);

    // 1. Attack Hit & Damage
    await clickListeners['.roll-hotlist-attack']({ preventDefault: () => {}, currentTarget: { itemId: 'atk-sword', slot: 'slot1' } });
    assert.equal(rolledAttackHit, true, 'Attack Hit button must call rollAttack(item, hit)');

    await clickListeners['.roll-hotlist-attack-dmg']({ preventDefault: () => {}, currentTarget: { itemId: 'atk-sword', slot: 'slot1' } });
    assert.equal(rolledAttackDmg, true, 'Attack Dmg button must call rollAttack(item, damage)');

    // 2. Spell Cast & Damage
    await clickListeners['.roll-hotlist-spell']({ preventDefault: () => {}, currentTarget: { itemId: 'spell-fire', slot: 'slot2' } });
    assert.equal(rolledSpellCast, true, 'Spell Cast button must call rollSpell(item)');

    await clickListeners['.roll-hotlist-spell-dmg']({ preventDefault: () => {}, currentTarget: { itemId: 'spell-fire', slot: 'slot2' } });
    assert.equal(rolledSpellDmg, true, 'Spell Dmg button must call rollSpellDamage(item)');

    // 3. Gear Equip Toggle
    await clickListeners['.toggle-hotlist-equip']({ preventDefault: () => {}, currentTarget: { itemId: 'gear-shield', slot: 'slot3' } });
    assert.equal(toggledEquip, true, 'Gear Toggle button must toggle equipped state to true');

    // 4. Loot Use
    await clickListeners['.roll-hotlist-use']({ preventDefault: () => {}, currentTarget: { itemId: 'loot-potion', slot: 'slot4' } });
    assert.equal(usedLoot, true, 'Loot Use button must call item.useLoot()');

    // 5. Skill Roll
    await clickListeners['.roll-hotlist-use']({ preventDefault: () => {}, currentTarget: { itemId: 'skill-climb', slot: 'slot5' } });
    assert.equal(rolledSkill, true, 'Skill Roll button must call actor.rollSkill(item)');

    // 6. Clear slot
    await clickListeners['.hotlist-slot-clear']({ preventDefault: () => {}, stopPropagation: () => {}, currentTarget: { slot: 'slot1' } });
    assert.equal(clearedSlot, 'slot1', 'Clear button must update hotlist.slot1 to empty');

    globalThis.$ = orig$;
  });

  await t.test('5. Left Action HUD: Attacks & Non-Passive Skills Separation', async () => {
    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: {
          str: { value: 16, unenhanced: 16, mod: 4 },
          dex: { value: 12, unenhanced: 12, mod: 4 }
        }
      }
    });

    const meleeAttack = new DCCItem({
      id: 'atk-sword',
      name: 'Broadsword',
      type: 'attack',
      system: { damageDice: '1d8', damageStat: 'str', damageType: 'Slashing' }
    }, crawler);

    const rangedAttack = new DCCItem({
      id: 'atk-bow',
      name: 'Shortbow',
      type: 'attack',
      system: { damageDice: '1d6', damageStat: 'dex', damageType: 'Piercing' }
    }, crawler);

    const activeUtilitySkill = new DCCItem({
      id: 'sk-climb',
      name: 'Climbing',
      type: 'skill',
      system: { rank: 3, stat: 'str', skillType: 'Utility', checkType: 'Stat Check', category: 'Utility' }
    }, crawler);

    const activeCombatSkill = new DCCItem({
      id: 'sk-edge',
      name: 'Edged Weapons',
      type: 'skill',
      system: { rank: 4, stat: 'str', skillType: 'Edge', checkType: 'Attack Check', category: 'Combat' }
    }, crawler);

    const passiveSkill1 = new DCCItem({
      id: 'sk-wrasslin-dmg',
      name: 'Wrasslin\' Damage Effect',
      type: 'skill',
      system: { rank: 1, category: 'Passive', checkType: 'Wrasslin\' Damage Effect, Passive' }
    }, crawler);

    const passiveSkill2 = new DCCItem({
      id: 'sk-iron-gut',
      name: 'Iron Gut',
      type: 'skill',
      system: { rank: 1, checkType: 'Passive, no roll required' }
    }, crawler);

    crawler.items.push(meleeAttack, rangedAttack, activeUtilitySkill, activeCombatSkill, passiveSkill1, passiveSkill2);

    const actionHUD = new DCCCrawlerActionHUD(crawler);
    const data = await actionHUD.getData();

    // 1. Attacks: Must contain Broadsword and Shortbow
    assert.equal(data.attacks.length, 2, 'Must contain exactly 2 attacks');
    assert.ok(data.attacks.some(a => a.name === 'Broadsword'));
    assert.ok(data.attacks.some(a => a.name === 'Shortbow'));
    assert.equal(data.attacks[0].formula.includes('Slashing') || data.attacks[1].formula.includes('Slashing'), true);

    // 2. Skills: Must contain ONLY non-passive skills
    assert.equal(data.skills.length, 2, 'Must contain exactly 2 active non-passive skills');
    assert.ok(data.skills.some(s => s.name === 'Climbing'), 'Climbing must be present');
    assert.ok(data.skills.some(s => s.name === 'Edged Weapons'), 'Edged Weapons must be present');
    assert.equal(data.skills.some(s => s.name.includes('Wrasslin')), false, 'Passive skill must NOT be included');
    assert.equal(data.skills.some(s => s.name.includes('Iron Gut')), false, 'Passive skill must NOT be included');

    // 3. Combat skill detection
    const edgeSkill = data.skills.find(s => s.name === 'Edged Weapons');
    assert.equal(edgeSkill.isAttack, true, 'Combat/Edge skill must be flagged as attack');

    const climbSkill = data.skills.find(s => s.name === 'Climbing');
    assert.equal(climbSkill.isAttack, false, 'Utility skill must not be flagged as attack');
  });

  await t.test('6. Left Action HUD Usable Action Triggers', async () => {
    let hitRolled = false;
    let dmgRolled = false;
    let skillHitRolled = false;
    let skillCheckRolled = false;

    const crawler = new DCCActor({
      name: 'Carl',
      type: 'crawler',
      system: {
        abilities: { str: { mod: 4 } }
      }
    });

    crawler.rollAttack = async (item, mode) => {
      if (item.type === 'skill') {
        skillHitRolled = true;
      } else if (mode === 'damage') {
        dmgRolled = true;
      } else {
        hitRolled = true;
      }
    };
    crawler.rollSkill = async () => { skillCheckRolled = true; };

    const sword = new DCCItem({ id: 'atk-1', name: 'Sword', type: 'attack' }, crawler);
    const combatSkill = new DCCItem({ id: 'sk-edge', name: 'Edged Weapons', type: 'skill', system: { skillType: 'Edge' } }, crawler);
    const utilitySkill = new DCCItem({ id: 'sk-stealth', name: 'Stealth', type: 'skill', system: { skillType: 'Utility' } }, crawler);

    crawler.items.push(sword, combatSkill, utilitySkill);

    const actionHUD = new DCCCrawlerActionHUD(crawler);

    const clickListeners = {};
    const mockRoot = {
      find: (sel) => ({
        click: (fn) => { clickListeners[sel] = fn; return mockRoot.find(sel); }
      })
    };

    const orig$ = globalThis.$;
    globalThis.$ = (el) => ({
      closest: () => ({ data: () => el.itemId })
    });

    actionHUD.activateListeners(mockRoot);

    // Roll Attack Hit
    await clickListeners['.roll-attack-hit']({ preventDefault: () => {}, currentTarget: { itemId: 'atk-1' } });
    assert.equal(hitRolled, true, 'Attack Hit button must trigger rollAttack(item, hit)');

    // Roll Attack Damage
    await clickListeners['.roll-attack-dmg']({ preventDefault: () => {}, currentTarget: { itemId: 'atk-1' } });
    assert.equal(dmgRolled, true, 'Attack Damage button must trigger rollAttack(item, damage)');

    // Roll Combat Skill Hit
    await clickListeners['.roll-skill']({ preventDefault: () => {}, currentTarget: { itemId: 'sk-edge' } });
    assert.equal(skillHitRolled, true, 'Combat skill must route to rollAttack(item, hit)');

    // Roll Utility Skill Check
    await clickListeners['.roll-skill']({ preventDefault: () => {}, currentTarget: { itemId: 'sk-stealth' } });
    assert.equal(skillCheckRolled, true, 'Utility skill must route to rollSkill(item)');

    globalThis.$ = orig$;
  });

  await t.test('7. Token Selection Lifecycle & Crawler Filtering', async () => {
    const crawlerActor = new DCCActor({ name: 'Carl', type: 'crawler' });
    const mobActor = new DCCActor({ name: 'Goblin', type: 'mob' });

    const crawlerToken = { id: 't-carl', actor: crawlerActor };
    const mobToken = { id: 't-goblin', actor: mobActor };

    const tokenHUD = new DCCCrawlerTokenHUD();

    // 1. Control non-crawler token (mob): should NOT activate HUDs
    globalThis.canvas.tokens.controlled = [mobToken];
    tokenHUD.onControlToken(mobToken, true);
    assert.equal(tokenHUD.activeActor, null, 'Mob token selection should not activate crawler HUDs');
    assert.equal(tokenHUD.hotbarHUD, null);
    assert.equal(tokenHUD.actionHUD, null);

    // 2. Control crawler token: should activate both HUDs
    globalThis.canvas.tokens.controlled = [crawlerToken];
    await tokenHUD.onControlToken(crawlerToken, true);
    assert.equal(tokenHUD.activeActor?.name, 'Carl', 'Crawler token selection must activate HUDs for crawler');
    assert.ok(tokenHUD.hotbarHUD, 'Hotbar HUD must be created');
    assert.ok(tokenHUD.actionHUD, 'Action HUD must be created');

    // 3. Deselect all tokens: should close HUDs
    globalThis.canvas.tokens.controlled = [];
    await tokenHUD.onControlToken(crawlerToken, false);
    assert.equal(tokenHUD.activeActor, null, 'Deselection must close HUDs');
    assert.equal(tokenHUD.hotbarHUD, null, 'Hotbar HUD must be cleared');
    assert.equal(tokenHUD.actionHUD, null, 'Action HUD must be cleared');
  });

  await t.test('8. Reactive Updates on Actor and Item Mutations', async () => {
    const crawler = new DCCActor({ name: 'Donut', type: 'crawler' });
    const token = { id: 't-donut', actor: crawler };

    const tokenHUD = new DCCCrawlerTokenHUD();
    tokenHUD.init();

    globalThis.canvas.tokens.controlled = [token];
    await tokenHUD.updateForToken(token);

    assert.equal(tokenHUD.activeActor?.name, 'Donut');

    let hotbarRenderCount = 0;
    let actionRenderCount = 0;

    tokenHUD.hotbarHUD.render = async () => { hotbarRenderCount++; };
    tokenHUD.actionHUD.render = async () => { actionRenderCount++; };

    // Trigger updateActor hook for Donut
    await Hooks.callAll('updateActor', crawler);
    assert.equal(hotbarRenderCount, 1, 'updateActor must re-render Hotbar HUD');
    assert.equal(actionRenderCount, 1, 'updateActor must re-render Action HUD');

    // Trigger updateItem on Donut's item
    const item = new DCCItem({ name: 'Spike Collar', type: 'gear' }, crawler);
    await Hooks.callAll('updateItem', item);
    assert.equal(hotbarRenderCount, 2, 'updateItem on owned item must re-render Hotbar HUD');
    assert.equal(actionRenderCount, 2, 'updateItem on owned item must re-render Action HUD');

    // Trigger updateActor for unrelated actor: should NOT re-render
    const otherCrawler = new DCCActor({ name: 'Prepotente', type: 'crawler' });
    await Hooks.callAll('updateActor', otherCrawler);
    assert.equal(hotbarRenderCount, 2, 'Unrelated actor update should not trigger re-render');

    // Trigger deleteToken on active token
    await Hooks.callAll('deleteToken', token);
    assert.equal(tokenHUD.activeActor, null, 'Deleting controlled token must close HUDs');
  });

  await t.test('9. Window Position Calculation Below Scene Navigation', () => {
    const actionHUD = new DCCCrawlerActionHUD(new DCCActor({ name: 'Carl', type: 'crawler' }));

    const mockElement = {
      style: {
        setProperty: (k, v) => { mockElement.style[k] = v; }
      }
    };
    actionHUD.element = mockElement;

    // Test with mock document navigation element
    const origDoc = globalThis.document;
    globalThis.document = {
      getElementById: (id) => {
        if (id === 'navigation') {
          return {
            getBoundingClientRect: () => ({ top: 10, bottom: 42, left: 130, right: 400 })
          };
        }
        return null;
      }
    };

    actionHUD.updatePosition();

    assert.equal(mockElement.style['--dcc-action-hud-top'], '48px', 'top should be bottom + 6px');
    assert.equal(mockElement.style['--dcc-action-hud-left'], '130px', 'left should match navigation left');

    globalThis.document = origDoc;
  });
});
