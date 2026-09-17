import { DCCActor } from './documents/actor.mjs';
import { DCCItem } from './documents/item.mjs';
import { DCCCombat } from './documents/combat.mjs';
import { DCCCrawlerSheet } from './sheets/crawler-sheet.mjs';
import { DCCItemSheet } from './sheets/item-sheet.mjs';
import { DCCSkillManager } from './apps/skill-manager.mjs';
import { DCCSpellManager } from './apps/spell-manager.mjs';
import { DCCBuffDebuffManager } from './apps/buff-manager.mjs';
import { DCCCombatTracker } from './apps/combat-tracker.mjs';
import { DCCCombatMetrics, DCCCombatMetricsApp } from './apps/combat-metrics.mjs';
import { DCCCombatArchiveApp } from './apps/combat-archive.mjs';
import { DCCSessionEngine, DCCSessionManagerApp, DCC_ROLL_OUTCOMES, DCC_OUTCOME_CONFIG, evaluateRollOutcome } from './apps/session-manager.mjs';
import { DCCCrawlerCreatorApp } from './apps/crawler-creator.mjs';
import { DCC_SKILLS } from './data/skills.mjs';
import { DCC_SPELLS } from './data/spells.mjs';
import { DCC_BUFFS, DCC_DAMAGE_TYPES, DCC_DEBUFFS } from './data/buffs.mjs';
import { DCC_STANDARD_ARRAY, DCC_SPECIES_DATA, DCC_BACKGROUND_MATRICES } from './data/crawler-creation.mjs';
import { DCC_SIZES, getSizeInfo } from './data/sizes.mjs';
import { DCC_MACROS } from './data/macros.mjs';
import {
  SkillDataModel,
  AttackDataModel,
  SpellDataModel,
  GearDataModel,
  BuffDataModel,
  DebuffDataModel,
  LootDataModel,
  RaceDataModel,
  ClassDataModel,
  DeityDataModel,
  SponsorDataModel,
  BaseActorDataModel,
  CrawlerDataModel,
  PetDataModel,
  MountVehicleDataModel,
  NPCDataModel
} from './models/index.mjs';

Hooks.once('init', async function() {
  console.log('DCC RPG | Initializing Dungeon Crawler Carl Roleplaying Game System');

  game.dcc = {
    DCCActor,
    DCCItem,
    DCCCombat,
    DCCCrawlerSheet,
    DCCItemSheet,
    DCCSkillManager,
    DCCSpellManager,
    DCCBuffDebuffManager,
    DCCCombatMetrics,
    DCCCombatTracker,
    DCCCombatArchiveApp,
    DCCSessionEngine,
    DCCSessionManagerApp,
    DCCCrawlerCreatorApp,
    applications: {
      DCCCrawlerSheet,
      DCCItemSheet,
      DCCSkillManager,
      DCCSpellManager,
      DCCBuffDebuffManager,
      DCCCombatMetrics,
      DCCCombatArchiveApp,
      DCCSessionEngine,
      DCCSessionManagerApp,
      DCCCrawlerCreatorApp
    },
    models: {
      // Items
      SkillDataModel,
      AttackDataModel,
      SpellDataModel,
      GearDataModel,
      BuffDataModel,
      DebuffDataModel,
      LootDataModel,
      RaceDataModel,
      ClassDataModel,
      DeityDataModel,
      SponsorDataModel,
      // Actors
      BaseActorDataModel,
      CrawlerDataModel,
      PetDataModel,
      MountVehicleDataModel,
      NPCDataModel
    }
  };

  CONFIG.DCC = {
    skills: DCC_SKILLS,
    spells: DCC_SPELLS,
    buffs: DCC_BUFFS,
    macros: DCC_MACROS,
    damageTypes: DCC_DAMAGE_TYPES,
    debuffs: DCC_DEBUFFS,
    outcomes: DCC_ROLL_OUTCOMES,
    outcomeConfig: DCC_OUTCOME_CONFIG,
    sizes: DCC_SIZES,
    getSizeInfo,
    crawlerCreation: {
      standardArray: DCC_STANDARD_ARRAY,
      species: DCC_SPECIES_DATA,
      matrices: DCC_BACKGROUND_MATRICES
    }
  };

  // Register document classes
  CONFIG.Actor.documentClass = DCCActor;
  CONFIG.Item.documentClass = DCCItem;

  // Register Actor Type Data Models (Foundry System Data Models)
  CONFIG.Actor.dataModels = {
    crawler: CrawlerDataModel,
    pet: PetDataModel,
    mount_vehicle: MountVehicleDataModel,
    npc: NPCDataModel
  };

  // Register trackable attributes for tokens
  CONFIG.Actor.trackableAttributes = {
    crawler: {
      bar: ['attributes.hp', 'attributes.mana'],
      value: ['attributes.evade.total', 'attributes.dr.total', 'details.level']
    },
    pet: {
      bar: ['attributes.hp', 'attributes.mana'],
      value: ['attributes.evade.total', 'attributes.dr.total', 'details.level']
    },
    mount_vehicle: {
      bar: ['attributes.hp'],
      value: ['attributes.dr', 'attributes.move']
    },
    npc: {
      bar: ['attributes.hp', 'attributes.mana'],
      value: ['attributes.evade.total', 'attributes.dr.total', 'details.level']
    }
  };

  // Register Item Type Data Models (Foundry System Data Models)
  CONFIG.Item.dataModels = {
    skill: SkillDataModel,
    attack: AttackDataModel,
    spell: SpellDataModel,
    gear: GearDataModel,
    buff: BuffDataModel,
    debuff: DebuffDataModel,
    loot: LootDataModel,
    race: RaceDataModel,
    class: ClassDataModel,
    deity: DeityDataModel,
    sponsor: SponsorDataModel
  };

  CONFIG.Combat.documentClass = DCCCombat;
  CONFIG.Combat.initiative = {
    formula: null,
    decimals: 0
  };

  // Register sheet & UI classes
  CONFIG.ui.combat = DCCCombatTracker;

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

  // Register System Settings
  game.settings.register('carl-rpg', 'archivedCombats', {
    name: 'Archived Combats',
    hint: 'Stores permanently archived combat encounters and round-by-round action history.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('carl-rpg', 'sessions', {
    name: 'Party Sessions',
    hint: 'Stores active and historical crawler party session records.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('carl-rpg', 'activeSessionId', {
    name: 'Active Session ID',
    hint: 'Current active session ID for live party progression.',
    scope: 'world',
    config: false,
    type: String,
    default: ''
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
    'systems/carl-rpg/templates/items/parts/header.hbs',
    'systems/carl-rpg/templates/items/parts/attack.hbs',
    'systems/carl-rpg/templates/items/parts/spell.hbs',
    'systems/carl-rpg/templates/items/parts/gear.hbs',
    'systems/carl-rpg/templates/items/parts/buff.hbs',
    'systems/carl-rpg/templates/items/parts/debuff.hbs',
    'systems/carl-rpg/templates/items/parts/skill.hbs',
    'systems/carl-rpg/templates/items/parts/loot.hbs',
    'systems/carl-rpg/templates/items/parts/traits.hbs',
    'systems/carl-rpg/templates/apps/skill-manager.hbs',
    'systems/carl-rpg/templates/apps/spell-manager.hbs',
    'systems/carl-rpg/templates/apps/buff-manager.hbs',
    'systems/carl-rpg/templates/apps/combat-metrics.hbs',
    'systems/carl-rpg/templates/apps/combat-tracker.hbs',
    'systems/carl-rpg/templates/apps/combat-archive.hbs',
    'systems/carl-rpg/templates/apps/session-manager.hbs',
    'systems/carl-rpg/templates/apps/add-event-dialog.hbs',
    'systems/carl-rpg/templates/apps/crawler-creator.hbs'
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
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet || app instanceof DCCSkillManager || app instanceof DCCCombatMetricsApp || app instanceof DCCCombatArchiveApp || app instanceof DCCSessionManagerApp || app instanceof DCCCrawlerCreatorApp) {
          app.render(false);
        }
      }
      if (ui.combat) ui.combat.render(false);
    }
  });

  // Global Developer Helper
  window.carl = {
    combatMetrics: DCCCombatMetrics,
    sessionEngine: DCCSessionEngine,
    setupInitialHotbar,
    openSkillManager(options = {}) {
      return new DCCSkillManager(options).render(true);
    },
    openCombatMetrics(options = {}) {
      return new DCCCombatMetricsApp(options).render(true);
    },
    openCombatArchive(options = {}) {
      return new DCCCombatArchiveApp(options).render(true);
    },
    openSessionManager(options = {}) {
      return new DCCSessionManagerApp(options).render(true);
    },
    openCrawlerCreator(options = {}) {
      return new DCCCrawlerCreatorApp(options).render(true);
    },
    reloadSheets() {
      for (const app of Object.values(ui.windows)) {
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet || app instanceof DCCSkillManager || app instanceof DCCCombatMetricsApp || app instanceof DCCCombatArchiveApp || app instanceof DCCSessionManagerApp || app instanceof DCCCrawlerCreatorApp) {
          app.render(false);
        }
      }
      if (ui.combat) ui.combat.render(false);
      ui.notifications?.info('DCC RPG | Re-rendered all open sheets.');
    }
  };
});

/**
 * Setup canonical DCC macro bar shortcuts (slots 1-3) for a given user.
 * Slot 1: Character Creator
 * Slot 2: Open Combat Metrics
 * Slot 3: Party Progression and Session Hub
 * @param {User} [user=game.user] - The target Foundry user
 * @param {object} [options={}] - Configuration options
 * @param {boolean} [options.force=false] - Force assignment even if already configured
 */
export async function setupInitialHotbar(user = globalThis.game?.user, { force = false } = {}) {
  if (!user) return;
  if (!force && typeof user.getFlag === 'function' && user.getFlag('carl-rpg', 'initialHotbarConfigured')) {
    return;
  }

  const findMacro = (key, altNames) => {
    if (globalThis.game?.macros?.find) {
      const found = globalThis.game.macros.find(m => m.flags?.['carl-rpg']?.macroKey === key || altNames.includes(m.name));
      if (found) return found;
    }
    if (Array.isArray(globalThis.game?.macros)) {
      const found = globalThis.game.macros.find(m => m.flags?.['carl-rpg']?.macroKey === key || altNames.includes(m.name));
      if (found) return found;
    }
    return null;
  };

  const macroCreator = findMacro('crawler-creator', ['Character Creator', 'Open Character Creator']);
  const macroMetrics = findMacro('combat-metrics', ['Open Combat Metrics', 'Combat Metrics']);
  const macroSession = findMacro('session-manager', ['Party Progression and Session Hub', 'Party Progression & Session Hub']);

  const assignments = [
    { slot: 1, macro: macroCreator },
    { slot: 2, macro: macroMetrics },
    { slot: 3, macro: macroSession }
  ];

  for (const { slot, macro } of assignments) {
    if (!macro) continue;
    const currentSlotVal = user.hotbar ? user.hotbar[slot] : null;
    if (force || !currentSlotVal) {
      if (typeof user.assignHotbarMacro === 'function') {
        await user.assignHotbarMacro(macro, slot);
      } else if (typeof user.update === 'function') {
        await user.update({ [`hotbar.${slot}`]: macro.id || macro._id });
      } else if (user.hotbar) {
        user.hotbar[slot] = macro.id || macro._id;
      }
    }
  }

  if (typeof user.setFlag === 'function') {
    await user.setFlag('carl-rpg', 'initialHotbarConfigured', true);
  }
}

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

// Helper function to inject New Crawler and Session Manager buttons into the Actors Directory
function injectActorDirectoryButtons(app, html) {
  const $html = (html instanceof jQuery) ? html : $(html ?? app?.element);
  if (!$html || !$html.length) return;

  // 1. New Crawler Button next to default Create Actor button inside .header-actions
  if (!$html.find('.dcc-create-crawler-btn-sidebar').length) {
    const crawlerBtn = $(`
      <button type="button" class="create-entry dcc-create-crawler-btn-sidebar" title="Open Crawler Induction Terminal">
        <i class="fa-solid fa-skull-crossbones"></i> New Crawler
      </button>
    `);

    crawlerBtn.on('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      new DCCCrawlerCreatorApp().render(true);
    });

    const headerActions = $html.find('.header-actions, .action-buttons, header.directory-header .action-buttons');
    if (headerActions.length) {
      const createActorBtn = headerActions.find('.create-document, .create-entry, [data-action="createEntry"], [data-action="createDocument"], button:first-child');
      if (createActorBtn.length) {
        createActorBtn.after(crawlerBtn);
      } else {
        headerActions.prepend(crawlerBtn);
      }
    } else {
      const dirHeader = $html.find('.directory-header');
      if (dirHeader.length) {
        const actionsRow = $('<div class="header-actions action-buttons flexrow" style="display: flex; gap: 4px; margin-bottom: 4px;"></div>');
        actionsRow.append(crawlerBtn);
        dirHeader.prepend(actionsRow);
      } else {
        $html.find('.directory-list').before(crawlerBtn);
      }
    }
  }

  // 2. Party Progression & Session Hub button
  if (!$html.find('.dcc-open-session-manager-btn').length) {
    const btn = $(`
      <button type="button" class="dcc-open-session-manager-btn" style="width: 100%; margin: 4px 0 6px 0; font-family: 'Oswald', sans-serif; font-weight: bold; font-size: 12px; background: #c0392b; color: #fff; border: 1.5px solid #000; border-radius: 3px; padding: 5px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
        <i class="fa-solid fa-users-gear" style="color: #f1c40f;"></i> Party Progression & Session Hub
      </button>
    `);

    btn.on('click', ev => {
      ev.preventDefault();
      new DCCSessionManagerApp().render(true);
    });

    const headerActions = $html.find('.header-actions, .action-buttons, header.directory-header .action-buttons');
    if (headerActions.length) {
      headerActions.after(btn);
    } else {
      $html.find('.directory-footer').before(btn);
    }
  }
}

// Hook into the Foundry Actors Directory sidebar
Hooks.on('renderActorDirectory', (app, html) => {
  injectActorDirectoryButtons(app, html);
});

// Hook into generic sidebar tab render in case of tab switching
Hooks.on('renderSidebarTab', (app, html) => {
  if (app?.tabName === 'actors' || app?.id === 'actors' || app?.options?.id === 'actors') {
    injectActorDirectoryButtons(app, html);
  }
});

// Add header button if ActorDirectory is popped out into a floating window
Hooks.on('getApplicationHeaderButtons', (app, buttons) => {
  if (app?.constructor?.name === 'ActorDirectory' || (typeof ActorDirectory !== 'undefined' && app instanceof ActorDirectory)) {
    buttons.unshift({
      label: 'New Crawler',
      class: 'dcc-header-crawler-btn',
      icon: 'fa-solid fa-skull-crossbones',
      onclick: () => new DCCCrawlerCreatorApp().render(true)
    });
  }
});

// Hook into Combat Tracker sidebar to inject CarlRPG Action Tracker & AI Awards, and remove initiative rolling
Hooks.on('renderCombatTracker', (app, html, data) => {
  const $html = (html instanceof jQuery) ? html : $(html);

  // 1. Remove all initiative roll buttons and inputs to prevent confusion
  $html.find('[data-action="rollAll"], [data-action="rollNPC"], [data-control="rollAll"], [data-control="rollNPC"]').remove();
  $html.find('.combatant-control.roll, [data-action="rollInitiative"], [data-control="rollInitiative"]').remove();

  // 2. Inject AI Awards button if not already present
  if (!$html.find('.dcc-combat-awards-btn').length) {
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
  }

  // 3. Inject compact trophy icon and archived battles icon into encounter navigation if active encounters exist
  const encountersNav = $html.find('nav.encounters');
  if (encountersNav.length) {
    if (!$html.find('.dcc-combat-awards-header-btn').length) {
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

    if (!$html.find('.dcc-combat-archive-header-btn').length) {
      const archiveBtn = $(`
        <a class="combat-button dcc-combat-archive-header-btn" data-tooltip="Archived Battles & Encounter History" title="Archived Battles & Encounter History" style="color: #c0392b; font-weight: bold; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer;">
          <i class="fa-solid fa-book-skull" style="font-size: 14px; color: #c0392b;"></i>
        </a>
      `);
      archiveBtn.click(ev => {
        ev.preventDefault();
        ev.stopPropagation();
        new DCCCombatArchiveApp().render(true);
      });
      encountersNav.append(archiveBtn);
    }

    if (!$html.find('.dcc-session-manager-header-btn').length) {
      const sessionBtn = $(`
        <a class="combat-button dcc-session-manager-header-btn" data-tooltip="Party Progression & Session Manager" title="Party Progression & Session Manager" style="color: #f1c40f; font-weight: bold; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer;">
          <i class="fa-solid fa-users-gear" style="font-size: 14px; color: #f1c40f;"></i>
        </a>
      `);
      sessionBtn.click(ev => {
        ev.preventDefault();
        ev.stopPropagation();
        new DCCSessionManagerApp().render(true);
      });
      encountersNav.append(sessionBtn);
    }
  }

  // 4. Handle any archived battles buttons in tracker
  $html.find('.dcc-combat-archive-btn').off('click.dccArchive').on('click.dccArchive', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    new DCCCombatArchiveApp().render(true);
  });

  // 5. Inject CarlRPG Action Economy Dock for each combatant (showing remaining actions & clickable used/unused pips)
  const combat = app.viewed || globalThis.game?.combat;
  if (combat) {
    const targetRound = app.viewedRound || combat.round || 1;

    $html.find('.combatant, li[data-combatant-id]').each((i, el) => {
      const $li = $(el);
      const combatantId = $li.data('combatant-id') || $li.attr('data-combatant-id');
      if (!combatantId) return;

      const combatant = combat.combatants?.get ? combat.combatants.get(combatantId) : (combat.combatants?.find ? combat.combatants.find(c => c.id === combatantId) : null);
      if (!combatant) return;

      const actions = combat.getCombatantActions ? combat.getCombatantActions(combatant, targetRound) : DCCCombat.getCombatantActions(combatant, combat, targetRound);
      const isMob = DCCCombat.isMobCombatant(combatant);
      const remaining = Math.max(0, actions.max - actions.spent);
      const isComplete = remaining <= 0;

      let pipsHtml = '';
      for (let s = 0; s < actions.max; s++) {
        const isUsed = Boolean(actions.slots[s]);
        const isBonus = s >= 2;
        pipsHtml += `
          <button type="button" class="dcc-action-dock-pip ${isUsed ? 'pip-used' : ''} ${isBonus ? 'pip-bonus' : ''}" 
                  data-slot-index="${s}" 
                  data-combatant-id="${combatantId}"
                  title="Action ${s + 1}${isBonus ? ' (Bonus)' : ''}: ${isUsed ? 'Used (Click to mark Unused)' : 'Unused (Click to mark Used)'}">
          </button>
        `;
      }

      const dockHtml = `
        <div class="dcc-action-dock ${isMob ? 'dock-mob' : 'dock-crawler'} ${isComplete ? 'dock-complete' : ''}" data-combatant-id="${combatantId}">
          <button type="button" class="dcc-action-dock-btn" data-combatant-id="${combatantId}" title="${remaining} of ${actions.max} actions remaining. Click to use next action. Right-click to restore.">
            <i class="fa-solid fa-clock" style="font-size: 9px;"></i>
            <span>${remaining}/${actions.max} ACT</span>
          </button>
          <div class="dcc-action-dock-pips">
            ${pipsHtml}
          </div>
        </div>
      `;

      const tokenInit = $li.find('.token-initiative');
      if (tokenInit.length) {
        tokenInit.empty().append(dockHtml).show();
      } else if (!$li.find('.dcc-action-dock').length) {
        const nameCol = $li.find('.dcc-combatant-details, .token-name').first();
        if (nameCol.length) {
          nameCol.after(dockHtml);
        } else {
          $li.append(dockHtml);
        }
      }
    });

    // Pips: click toggles Used <-> Unused for that slot
    $html.find('.dcc-action-dock-pip').off('click').on('click', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const btn = $(ev.currentTarget);
      const combatantId = btn.data('combatant-id');
      const slotIndex = Number(btn.data('slot-index')) || 0;
      const isUsed = btn.hasClass('pip-used');

      if (isUsed) {
        await combat.clearCombatantAction(combatantId, slotIndex, { round: targetRound });
      } else {
        const c = combat.combatants?.get ? combat.combatants.get(combatantId) : null;
        const isMob = DCCCombat.isMobCombatant(c);
        await combat.recordCombatantAction(combatantId, {
          type: isMob ? 'move' : 'check',
          slotIndex,
          label: isMob ? 'Mob Action' : 'Crawler Action'
        }, { round: targetRound });
      }
      app.render(false);
    });

    // Action button: click uses next action (or resets if 0 left); right-click restores action
    $html.find('.dcc-action-dock-btn').off('click contextmenu').on('click', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combatantId = $(ev.currentTarget).data('combatant-id');
      const c = combat.combatants?.get ? combat.combatants.get(combatantId) : null;
      const actions = combat.getCombatantActions(c, targetRound);
      const isMob = DCCCombat.isMobCombatant(c);

      if (actions.spent < actions.max) {
        await combat.recordCombatantAction(combatantId, {
          type: isMob ? 'move' : 'check',
          label: isMob ? 'Mob Action' : 'Crawler Action'
        }, { round: targetRound });
      } else {
        for (let s = 0; s < actions.max; s++) {
          await combat.clearCombatantAction(combatantId, s, { round: targetRound });
        }
      }
      app.render(false);
    }).on('contextmenu', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const combatantId = $(ev.currentTarget).data('combatant-id');
      const c = combat.combatants?.get ? combat.combatants.get(combatantId) : null;
      const actions = combat.getCombatantActions(c, targetRound);
      if (actions.spent > 0) {
        await combat.clearCombatantAction(combatantId, actions.spent - 1, { round: targetRound });
        app.render(false);
      }
    });
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

    const rawTyped = card.attr('data-typed-damage') || card.data('typed-damage');
    let typedDamage = null;
    if (rawTyped) {
      try {
        typedDamage = typeof rawTyped === 'string' ? JSON.parse(rawTyped) : rawTyped;
      } catch (_) {}
    }
    const damageType = card.data('damage-type') || '';

    const results = [];
    for (const token of targetTokens) {
      const targetActor = token.actor;
      if (!targetActor) continue;

      const res = await DCCCombatMetrics.applyDamageToTarget({
        targetActor,
        rawDamage,
        typedDamage,
        damageType,
        attackerActor: attacker,
        attackName: itemName,
        attackType,
        ignoreDR,
        multiplier
      });
      results.push(res);
    }

    const summary = results.map(r => {
      let text = `<strong>${r.targetName}</strong>: ${r.actualDamage} net dmg (${r.barsRemoved ?? 0} bar${r.barsRemoved === 1 ? '' : 's'}, ${r.newHp} HP left`;
      if (r.excessDamage > 0) {
        text += `, ${r.excessDamage} excess ignored`;
      }
      text += ')';
      return text;
    }).join(', ');
    ui.notifications?.info(`DCC RPG | Damage applied: ${summary}`);

    card.find('.dcc-damage-applied-feedback').remove();
    card.append(`
      <div class="dcc-damage-applied-feedback" style="margin-top: 6px; font-size: 11px; background: #e8f8f5; border: 1px solid #27ae60; color: #1e8449; padding: 4px 6px; border-radius: 3px; font-family: 'Oswald', sans-serif;">
        <i class="fa-solid fa-check"></i> Applied to ${results.length} target(s). Logged to combat!
      </div>
    `);
  });

  // Handle click on "Roll Spell Damage" from a cast spell card in chat
  html.find('.roll-spell-dmg-from-card').click(async ev => {
    ev.preventDefault();
    const btn = $(ev.currentTarget);
    const actorId = btn.data('actor-id');
    const spellId = btn.data('spell-id');
    const actor = game.actors?.get(actorId) || null;
    if (!actor) return;
    const spell = actor.items?.get(spellId) ||
      (Array.isArray(actor.items) ? actor.items.find(it => it.id === spellId) : actor.items.find?.(it => it.id === spellId));
    if (spell && typeof actor.rollSpellDamage === 'function') {
      await actor.rollSpellDamage(spell);
    }
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
          const wasLocked = Boolean(pack.locked);
          if (wasLocked) {
            if (typeof pack.configure === 'function') await pack.configure({ locked: false });
            else pack.locked = false;
          }
          await Item.createDocuments(docs, { pack: pack.collection || 'carl-rpg.skills' });
          if (wasLocked) {
            if (typeof pack.configure === 'function') await pack.configure({ locked: true });
            else pack.locked = true;
          }
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
          const wasLocked = Boolean(spellsPack.locked);
          if (wasLocked) {
            if (typeof spellsPack.configure === 'function') await spellsPack.configure({ locked: false });
            else spellsPack.locked = false;
          }
          await Item.createDocuments(docs, { pack: spellsPack.collection || 'carl-rpg.spells' });
          if (wasLocked) {
            if (typeof spellsPack.configure === 'function') await spellsPack.configure({ locked: true });
            else spellsPack.locked = true;
          }
          console.log(`DCC RPG | Successfully imported ${docs.length} spells into carl-rpg.spells.`);
        }
      } catch (err) {
        console.warn('DCC RPG | Could not inspect/populate spells compendium:', err);
      }
    }

    // 3. Ensure macros compendium pack is populated if empty
    const macrosPack = game.packs.get('carl-rpg.macros');
    if (macrosPack && typeof Macro !== 'undefined') {
      try {
        const index = await macrosPack.getIndex();
        if (index.size === 0) {
          console.log('DCC RPG | Populating empty macros compendium...');
          const docs = DCC_MACROS.map(m => ({
            _id: m._id,
            name: m.name,
            type: m.type,
            img: m.img,
            command: m.command,
            scope: m.scope || 'global',
            ownership: m.ownership || { default: 2 },
            flags: m.flags || {}
          }));
          const wasLocked = Boolean(macrosPack.locked);
          if (wasLocked) {
            if (typeof macrosPack.configure === 'function') await macrosPack.configure({ locked: false });
            else macrosPack.locked = false;
          }
          await Macro.createDocuments(docs, { pack: macrosPack.collection || 'carl-rpg.macros' });
          if (wasLocked) {
            if (typeof macrosPack.configure === 'function') await macrosPack.configure({ locked: true });
            else macrosPack.locked = true;
          }
          console.log(`DCC RPG | Successfully imported ${docs.length} macros into carl-rpg.macros.`);
        }
      } catch (err) {
        console.warn('DCC RPG | Could not inspect/populate macros compendium:', err);
      }
    }

    // 4. Ensure canonical DCC macros exist in world with Observer ownership (default: 2) so all users can execute them
    if (game.macros && typeof Macro !== 'undefined') {
      for (const mData of DCC_MACROS) {
        const existing = game.macros.find ? game.macros.find(m => m.flags?.['carl-rpg']?.macroKey === mData.flags?.['carl-rpg']?.macroKey || m.name === mData.name) : null;
        if (!existing) {
          try {
            await Macro.create({
              name: mData.name,
              type: mData.type,
              img: mData.img,
              command: mData.command,
              scope: mData.scope || 'global',
              ownership: { default: 2 },
              flags: mData.flags || {}
            });
          } catch (err) {
            console.warn(`DCC RPG | Could not create world macro "${mData.name}":`, err);
          }
        } else if (existing.ownership && existing.ownership.default < 2) {
          try {
            await existing.update({ 'ownership.default': 2 });
          } catch (_) {}
        }
      }
    }
  }

  // Ensure initial macro bar has Character Creator, Combat Metrics, and Session Hub in slots 1, 2, 3
  await setupInitialHotbar(game.user);

  // Ensure Actor Directory has New Crawler & Session buttons on startup
  if (ui.actors?.element?.length) {
    injectActorDirectoryButtons(ui.actors, ui.actors.element);
  }

  // Ensure Combat Tracker renders with DCC AI Awards button on load
  if (ui.combat) {
    ui.combat.render(false);
  }
});


