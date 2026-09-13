import { DCCActor } from './documents/actor.mjs';
import { DCCItem } from './documents/item.mjs';
import { DCCCrawlerSheet } from './sheets/crawler-sheet.mjs';
import { DCCItemSheet } from './sheets/item-sheet.mjs';
import { DCCSkillManager } from './apps/skill-manager.mjs';
import { DCCCombatMetrics, DCCCombatMetricsApp } from './apps/combat-metrics.mjs';
import { DCC_SKILLS } from './data/skills.mjs';
import { DCC_SPELLS } from './data/spells.mjs';

Hooks.once('init', async function() {
  console.log('DCC RPG | Initializing Dungeon Crawler Carl Roleplaying Game System');

  CONFIG.DCC = {
    skills: DCC_SKILLS,
    spells: DCC_SPELLS
  };

  // Register document classes
  CONFIG.Actor.documentClass = DCCActor;
  CONFIG.Item.documentClass = DCCItem;

  // Register sheet classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('carl-rpg', DCCCrawlerSheet, {
    types: ['crawler', 'pet', 'mount_vehicle', 'npc'],
    makeDefault: true,
    label: 'DCC.CrawlerSheet'
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('carl-rpg', DCCItemSheet, {
    makeDefault: true,
    label: 'DCC.ItemSheet'
  });

  // Register Handlebars Helpers
  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('or', (a, b) => Boolean(a || b));
  Handlebars.registerHelper('not', (a) => !a);
  Handlebars.registerHelper('gte', (a, b) => Number(a) >= Number(b));
  Handlebars.registerHelper('numberFormat', (value, options) => {
    const num = Number(value) || 0;
    if (options?.hash?.sign && num > 0) return `+${num}`;
    return String(num);
  });
  Handlebars.registerHelper('upper', str => (str ? String(str).toUpperCase() : ''));

  // Preload Handlebars templates
  await loadTemplates([
    'systems/carl-rpg/templates/actors/parts/page1-core.hbs',
    'systems/carl-rpg/templates/actors/parts/page2-hotlist.hbs',
    'systems/carl-rpg/templates/actors/parts/hotlist.hbs',
    'systems/carl-rpg/templates/actors/parts/page3-skills.hbs',
    'systems/carl-rpg/templates/actors/parts/spells.hbs',
    'systems/carl-rpg/templates/actors/parts/page4-inventory.hbs',
    'systems/carl-rpg/templates/actors/parts/page5-extras.hbs',
    'systems/carl-rpg/templates/actors/parts/page6-abilities.hbs',
    'systems/carl-rpg/templates/apps/skill-manager.hbs',
    'systems/carl-rpg/templates/apps/combat-metrics.hbs'
  ]);

  // Developer Hot-Reload Hook Handler
  Hooks.on('hotReload', async (data) => {
    console.log(`DCC RPG | Hot Reload triggered for ${data.path}`);
    if (data.extension === 'hbs' || data.extension === 'html') {
      // Clear template cache
      if (typeof _templateCache !== 'undefined' && _templateCache[data.path]) {
        delete _templateCache[data.path];
      }
      if (Handlebars.partials[data.path]) {
        delete Handlebars.partials[data.path];
      }
      // Re-render all open DCC application sheets immediately
      for (const app of Object.values(ui.windows)) {
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet || app instanceof DCCSkillManager || app instanceof DCCCombatMetricsApp) {
          app.render(false);
        }
      }
      if (ui.combat) ui.combat.render(false);
    }
  });

  // Global Developer Helper
  window.carl = {
    combatMetrics: DCCCombatMetrics,
    openSkillManager(options = {}) {
      return new DCCSkillManager(options).render(true);
    },
    openCombatMetrics(options = {}) {
      return new DCCCombatMetricsApp(options).render(true);
    },
    reloadSheets() {
      for (const app of Object.values(ui.windows)) {
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet || app instanceof DCCSkillManager || app instanceof DCCCombatMetricsApp) {
          app.render(false);
        }
      }
      if (ui.combat) ui.combat.render(false);
      ui.notifications?.info('DCC RPG | Re-rendered all open sheets.');
    }
  };
});

// Hook into the Foundry Items Directory sidebar to add a top-level Skill Library & Manager button
Hooks.on('renderItemDirectory', (app, html) => {
  if (html.find('.dcc-open-skill-manager-btn').length) return;

  const btn = $(`
    <button type="button" class="dcc-open-skill-manager-btn" style="width: 100%; margin: 4px 0 6px 0; font-family: 'Oswald', sans-serif; font-weight: bold; font-size: 12px; background: #c0392b; color: #fff; border: 1.5px solid #000; border-radius: 3px; padding: 5px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
      <i class="fa-solid fa-book-bookmark"></i> Skill Library & Manager
    </button>
  `);

  btn.click(ev => {
    ev.preventDefault();
    new DCCSkillManager().render(true);
  });

  const headerActions = html.find('.header-actions');
  if (headerActions.length) {
    headerActions.after(btn);
  } else {
    html.find('.directory-footer').before(btn);
  }
});

// Hook into Combat Tracker sidebar to inject AI Awards button
Hooks.on('renderCombatTracker', (app, html, data) => {
  const $html = (html instanceof jQuery) ? html : $(html);
  if ($html.find('.dcc-combat-awards-btn').length) return;

  const btn = $(`
    <button type="button" class="dcc-combat-awards-btn" style="width: calc(100% - 8px); margin: 4px 4px 6px 4px; font-family: 'Oswald', sans-serif; font-weight: bold; font-size: 12px; background: #c0392b; color: #fff; border: 1.5px solid #000; border-radius: 3px; padding: 6px 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 1;">
      <i class="fa-solid fa-trophy" style="color: #f1c40f; font-size: 14px;"></i> AI Combat Awards & Performance
    </button>
  `);

  btn.click(ev => {
    ev.preventDefault();
    ev.stopPropagation();
    new DCCCombatMetricsApp().render(true);
  });

  const header = $html.find('.combat-tracker-header');
  if (header.length) {
    header.after(btn);
  } else {
    const list = $html.find('#combat-tracker, .directory-list');
    if (list.length) {
      list.before(btn);
    } else {
      $html.prepend(btn);
    }
  }

  // Also inject compact trophy icon into encounter navigation if active encounters exist
  const encountersNav = $html.find('nav.encounters');
  if (encountersNav.length && !$html.find('.dcc-combat-awards-header-btn').length) {
    const iconBtn = $(`
      <a class="combat-button dcc-combat-awards-header-btn" data-tooltip="DCC AI Combat Performance & Awards" title="DCC AI Combat Performance & Awards" style="color: #e74c3c; font-weight: bold; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer;">
        <i class="fa-solid fa-trophy" style="font-size: 14px; color: #e74c3c;"></i>
      </a>
    `);
    iconBtn.click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      new DCCCombatMetricsApp().render(true);
    });
    encountersNav.append(iconBtn);
  }
});

// Hook into Chat Messages to handle "Apply Damage to Target(s)" button clicks
Hooks.on('renderChatMessage', (message, html, data) => {
  html.find('.dcc-apply-damage-btn').click(async ev => {
    ev.preventDefault();
    const btn = $(ev.currentTarget);
    const card = btn.closest('.dcc-damage-card');
    const attackerId = card.data('attacker-id');
    const itemName = card.data('item-name') || 'Attack';
    const attackType = card.data('attack-type') || 'attack';
    const rawDamage = Number(card.data('damage-value')) || 0;
    const multiplier = Number(btn.data('multiplier')) || 1;
    const ignoreDR = Boolean(btn.data('ignore-dr'));

    const attacker = game.actors?.get(attackerId) || null;

    let targetTokens = Array.from(game.user?.targets || []);
    if (!targetTokens.length && canvas?.tokens) {
      targetTokens = canvas.tokens.controlled.filter(t => t.actor && t.actor.id !== attackerId);
    }

    if (!targetTokens.length) {
      ui.notifications?.warn('DCC RPG | No targets selected! Please target or select at least one token on the canvas.');
      return;
    }

    const results = [];
    for (const token of targetTokens) {
      const targetActor = token.actor;
      if (!targetActor) continue;

      const res = await DCCCombatMetrics.applyDamageToTarget({
        targetActor,
        rawDamage,
        attackerActor: attacker,
        attackName: itemName,
        attackType,
        ignoreDR,
        multiplier
      });
      results.push(res);
    }

    const summary = results.map(r => `<strong>${r.targetName}</strong>: ${r.actualDamage} net dmg (${r.newHp} HP left)`).join(', ');
    ui.notifications?.info(`DCC RPG | Damage applied: ${summary}`);

    card.find('.dcc-damage-applied-feedback').remove();
    card.append(`
      <div class="dcc-damage-applied-feedback" style="margin-top: 6px; font-size: 11px; background: #e8f8f5; border: 1px solid #27ae60; color: #1e8449; padding: 4px 6px; border-radius: 3px; font-family: 'Oswald', sans-serif;">
        <i class="fa-solid fa-check"></i> Applied to ${results.length} target(s). Logged to combat!
      </div>
    `);
  });
});

/**
 * Enforce linked actor data for player characters (crawlers) and companion pets
 * whenever a token is created on a scene.
 */
Hooks.on('preCreateToken', (tokenDoc, createData, options, userId) => {
  const actor = tokenDoc.actor || game.actors?.get(tokenDoc.actorId);
  if (actor && (actor.type === 'crawler' || actor.type === 'pet')) {
    tokenDoc.updateSource({ actorLink: true });
  }
});

Hooks.once('ready', async function() {
  if (game.user.isGM) {
    // 1. Ensure existing world crawlers and pets have prototypeToken.actorLink = true
    if (game.actors) {
      for (const actor of game.actors) {
        if ((actor.type === 'crawler' || actor.type === 'pet') && !actor.prototypeToken?.actorLink) {
          console.log(`DCC RPG | Ensuring prototypeToken.actorLink = true for world actor "${actor.name}"`);
          await actor.update({ 'prototypeToken.actorLink': true });
        }
      }
    }

    // 2. Ensure existing tokens placed across all scenes are linked for crawlers and pets
    if (game.scenes) {
      for (const scene of game.scenes) {
        const updates = [];
        for (const token of scene.tokens) {
          const actor = token.actor || game.actors?.get(token.actorId);
          if (actor && (actor.type === 'crawler' || actor.type === 'pet') && !token.actorLink) {
            console.log(`DCC RPG | Migrating scene token "${token.name}" on scene "${scene.name}" to actorLink = true`);
            updates.push({ _id: token.id, actorLink: true });
          }
        }
        if (updates.length) {
          await scene.updateEmbeddedDocuments('Token', updates);
        }
      }
    }

    const pack = game.packs.get('carl-rpg.skills');
    if (pack) {
      try {
        const index = await pack.getIndex();
        if (index.size === 0) {
          console.log('DCC RPG | Populating empty skills compendium...');
          const docs = DCC_SKILLS.map(s => ({
            name: s.name,
            type: 'skill',
            img: s.img,
            system: s.system
          }));
          await Item.createDocuments(docs, { pack: 'carl-rpg.skills' });
          console.log(`DCC RPG | Successfully imported ${docs.length} skills into carl-rpg.skills.`);
        }
      } catch (err) {
        console.warn('DCC RPG | Could not inspect/populate skills compendium:', err);
      }
    }

    const spellsPack = game.packs.get('carl-rpg.spells');
    if (spellsPack) {
      try {
        const index = await spellsPack.getIndex();
        if (index.size === 0) {
          console.log('DCC RPG | Populating empty spells compendium...');
          const docs = DCC_SPELLS.map(s => ({
            name: s.name,
            type: 'spell',
            img: s.img,
            system: s.system
          }));
          await Item.createDocuments(docs, { pack: 'carl-rpg.spells' });
          console.log(`DCC RPG | Successfully imported ${docs.length} spells into carl-rpg.spells.`);
        }
      } catch (err) {
        console.warn('DCC RPG | Could not inspect/populate spells compendium:', err);
      }
    }
  }

  // Ensure Combat Tracker renders with DCC AI Awards button on load
  if (ui.combat) {
    ui.combat.render(false);
  }
});


