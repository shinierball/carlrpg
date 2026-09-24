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
import { DCCAchievementManagerApp } from './apps/achievement-manager.mjs';
import { DCC_ACHIEVEMENTS, DCC_ACHIEVEMENT_TIERS } from './data/achievements.mjs';
import { DCC_SKILLS } from './data/skills.mjs';
import { DCC_SPELLS } from './data/spells.mjs';
import { DCC_BUFFS, DCC_DAMAGE_TYPES, DCC_DEBUFFS } from './data/buffs.mjs';
import { DCC_STANDARD_ARRAY, DCC_SPECIES_DATA, DCC_BACKGROUND_MATRICES } from './data/crawler-creation.mjs';
import { DCC_SIZES, getSizeInfo } from './data/sizes.mjs';
import { DCC_MACROS } from './data/macros.mjs';
import { DCC_MOBS } from './data/mobs.mjs';
import {
  DCC_BACKGROUND_TABLES,
  getBackgroundTable,
  rollBackgroundTable,
  ensureBackgroundTables
} from './data/background-tables.mjs';
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
  NPCDataModel,
  MobDataModel
} from './models/index.mjs';

Hooks.once('init', async function() {
  console.log('DCC RPG | Initializing Dungeon Crawler Carl Roleplaying Game System');

  // Ensure chat message hook is registered with canonical version detection
  registerChatMessageHook();

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
    DCCAchievementManagerApp,
    achievements: DCC_ACHIEVEMENTS,
    achievementTiers: DCC_ACHIEVEMENT_TIERS,
    mobs: DCC_MOBS,
    backgroundTables: DCC_BACKGROUND_TABLES,
    getBackgroundTable,
    rollBackgroundTable,
    ensureBackgroundTables,
    getCurrentFloor,
    setCurrentFloor,
    onRenderChatMessage,
    registerChatMessageHook,
    applications: {
      DCCCrawlerSheet,
      DCCItemSheet,
      DCCSkillManager,
      DCCSpellManager,
      DCCBuffDebuffManager,
      DCCCrawlerCreatorApp,
      DCCAchievementManagerApp,
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
      NPCDataModel,
      MobDataModel
    }
  };

  CONFIG.DCC = {
    skills: DCC_SKILLS,
    spells: DCC_SPELLS,
    buffs: DCC_BUFFS,
    macros: DCC_MACROS,
    mobs: DCC_MOBS,
    damageTypes: DCC_DAMAGE_TYPES,
    debuffs: DCC_DEBUFFS,
    outcomes: DCC_ROLL_OUTCOMES,
    outcomeConfig: DCC_OUTCOME_CONFIG,
    sizes: DCC_SIZES,
    getSizeInfo,
    achievements: DCC_ACHIEVEMENTS,
    achievementTiers: DCC_ACHIEVEMENT_TIERS,
    achievementManager: DCCAchievementManagerApp,
    crawlerCreation: {
      standardArray: DCC_STANDARD_ARRAY,
      species: DCC_SPECIES_DATA,
      matrices: DCC_BACKGROUND_MATRICES
    },
    backgroundTables: DCC_BACKGROUND_TABLES,
    rollBackgroundTable
  };

  // Register document classes
  CONFIG.Actor.documentClass = DCCActor;
  CONFIG.Item.documentClass = DCCItem;

  // Register Actor Type Data Models (Foundry System Data Models)
  CONFIG.Actor.dataModels = {
    crawler: CrawlerDataModel,
    pet: PetDataModel,
    mount_vehicle: MountVehicleDataModel,
    npc: NPCDataModel,
    mob: MobDataModel
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
    },
    mob: {
      bar: ['attributes.hp'],
      value: ['attributes.evadeDifficulty', 'attributes.surpriseDifficulty', 'details.level', 'attributes.xp']
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

  const ActorsClass = globalThis.foundry?.documents?.collections?.Actors ?? globalThis.Actors;
  const ItemsClass = globalThis.foundry?.documents?.collections?.Items ?? globalThis.Items;
  const BaseActorSheet = globalThis.foundry?.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
  const BaseItemSheet = globalThis.foundry?.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;

  if (ActorsClass) {
    ActorsClass.unregisterSheet('core', BaseActorSheet);
    ActorsClass.registerSheet('carl-rpg', DCCCrawlerSheet, {
      types: ['crawler', 'pet', 'mount_vehicle', 'npc', 'mob'],
      makeDefault: true,
      label: 'DCC.CrawlerSheet'
    });
  }

  if (ItemsClass) {
    ItemsClass.unregisterSheet('core', BaseItemSheet);
    ItemsClass.registerSheet('carl-rpg', DCCItemSheet, {
      makeDefault: true,
      label: 'DCC.ItemSheet'
    });
  }

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

  game.settings.register('carl-rpg', 'currentFloor', {
    name: 'Current Dungeon Floor',
    hint: 'The active dungeon floor (1-18) where all crawlers and encounters currently reside.',
    scope: 'world',
    config: true,
    type: Number,
    default: 1
  });

  DCCActor.getCurrentFloor = getCurrentFloor;
  DCCActor.setCurrentFloor = setCurrentFloor;
  CONFIG.DCC.getCurrentFloor = getCurrentFloor;
  CONFIG.DCC.setCurrentFloor = setCurrentFloor;

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
  const loadTemplatesFn = globalThis.foundry?.applications?.handlebars?.loadTemplates
    ?? globalThis.foundry?.utils?.loadTemplates
    ?? globalThis.loadTemplates;

  await loadTemplatesFn([
    'systems/carl-rpg/templates/actors/parts/page1-core.hbs',
    'systems/carl-rpg/templates/actors/parts/page2-hotlist.hbs',
    'systems/carl-rpg/templates/actors/parts/hotlist.hbs',
    'systems/carl-rpg/templates/actors/parts/page3-skills.hbs',
    'systems/carl-rpg/templates/actors/parts/spells.hbs',
    'systems/carl-rpg/templates/actors/parts/page4-inventory.hbs',
    'systems/carl-rpg/templates/actors/parts/conditions.hbs',
    'systems/carl-rpg/templates/actors/parts/story-extras.hbs',
    'systems/carl-rpg/templates/actors/parts/achievements.hbs',
    'systems/carl-rpg/templates/actors/parts/page5-extras.hbs',
    'systems/carl-rpg/templates/actors/parts/page6-abilities.hbs',
    'systems/carl-rpg/templates/items/parts/header.hbs',
    'systems/carl-rpg/templates/items/parts/attack.hbs',
    'systems/carl-rpg/templates/items/parts/spell.hbs',
    'systems/carl-rpg/templates/items/parts/gear.hbs',
    'systems/carl-rpg/templates/items/parts/buff.hbs',
    'systems/carl-rpg/templates/items/parts/debuff.hbs',
    'systems/carl-rpg/templates/items/parts/achievement.hbs',
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
    'systems/carl-rpg/templates/apps/crawler-creator.hbs',
    'systems/carl-rpg/templates/apps/achievement-manager.hbs'
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
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet || app instanceof DCCSkillManager || app instanceof DCCCombatMetricsApp || app instanceof DCCCombatArchiveApp || app instanceof DCCSessionManagerApp || app instanceof DCCCrawlerCreatorApp || app instanceof DCCAchievementManagerApp) {
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
    backgroundTables: DCC_BACKGROUND_TABLES,
    rollBackgroundTable,
    getCurrentFloor,
    setCurrentFloor,
    setupInitialHotbar,
    openAchievementManager(options = {}) {
      return new DCCAchievementManagerApp(options).render(true);
    },
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

  // Register or re-verify chat message hook on Foundry init
  registerChatMessageHook();
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

// Helper function to inject Skill Library & Manager button into the Items Directory
function injectItemDirectoryButtons(app, html) {
  const $html = $(html ?? app?.element);
  if (!$html || !$html.length) return;
  if ($html.find('.dcc-open-skill-manager-btn').length) return;

  const btn = $(`
    <button type="button" class="dcc-open-skill-manager-btn" style="width: 100%; margin: 4px 0 6px 0; font-family: 'Oswald', sans-serif; font-weight: bold; font-size: 12px; background: #c0392b; color: #fff; border: 1.5px solid #000; border-radius: 3px; padding: 5px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
      <i class="fa-solid fa-book-bookmark"></i> Skill Library & Manager
    </button>
  `);

  btn.click(ev => {
    ev.preventDefault();
    new DCCSkillManager().render(true);
  });

  const headerActions = $html.find('.header-actions');
  if (headerActions.length) {
    headerActions.after(btn);
  } else {
    $html.find('.directory-footer').before(btn);
  }
}

// Hook into the Foundry Items Directory sidebar to add a top-level Skill Library & Manager button
Hooks.on('renderItemDirectory', (app, html) => {
  injectItemDirectoryButtons(app, html);
});

// Helper function to inject New Crawler and Session Manager buttons into the Actors Directory
function injectActorDirectoryButtons(app, html) {
  const $html = $(html ?? app?.element);
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
  } else if (app?.tabName === 'items' || app?.id === 'items' || app?.options?.id === 'items') {
    injectItemDirectoryButtons(app, html);
  }
});

// Add header button if ActorDirectory is popped out into a floating window
Hooks.on('getApplicationHeaderButtons', (app, buttons) => {
  const ActorDirectoryClass = globalThis.foundry?.applications?.sidebar?.tabs?.ActorDirectory
    ?? globalThis.foundry?.appv1?.sidebar?.tabs?.ActorDirectory
    ?? globalThis.ActorDirectory;

  const isActorDirectory = app?.constructor?.name === 'ActorDirectory'
    || (ActorDirectoryClass && app instanceof ActorDirectoryClass)
    || app?.id === 'actors'
    || app?.tabName === 'actors';

  if (isActorDirectory) {
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
  const $html = $(html ?? app?.element);

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

let _registeredChatHook = null;

/**
 * Hook handler for Chat Message rendering.
 * Compatible with both Foundry v13+ (renderChatMessageHTML with HTMLElement)
 * and v12 (renderChatMessage with jQuery).
 * @param {ChatMessage} message
 * @param {HTMLElement|jQuery} html
 * @param {object} data
 */
export function onRenderChatMessage(message, html, data) {
  const root = (typeof HTMLElement !== 'undefined' && html instanceof HTMLElement)
    ? html
    : (html?.[0] || html);

  if (!root) return;

  const query = (selector) => {
    if (typeof root.querySelectorAll === 'function') {
      return Array.from(root.querySelectorAll(selector));
    }
    if (typeof $ !== 'undefined' && typeof $(root).find === 'function') {
      return Array.from($(root).find(selector));
    }
    return [];
  };

  // 1. Handle "Apply Damage to Target(s)" buttons
  const applyDamageButtons = query('.dcc-apply-damage-btn');
  for (const btn of applyDamageButtons) {
    if (btn.dataset) {
      if (btn.dataset.dccBound) continue;
      btn.dataset.dccBound = 'true';
    }

    const clickHandler = async (ev) => {
      ev.preventDefault();
      const card = (typeof btn.closest === 'function')
        ? btn.closest('.dcc-damage-card')
        : (typeof $ !== 'undefined' ? $(btn).closest('.dcc-damage-card')[0] : null);
      if (!card) return;

      const $card = (typeof $ !== 'undefined') ? $(card) : null;
      const $btn = (typeof $ !== 'undefined') ? $(btn) : null;

      const attackerId = card.dataset?.attackerId || $card?.data('attacker-id');
      const itemName = card.dataset?.itemName || $card?.data('item-name') || 'Attack';
      const attackType = card.dataset?.attackType || $card?.data('attack-type') || 'attack';
      const rawDamage = Number(card.dataset?.damageValue ?? $card?.data('damage-value')) || 0;
      const multiplier = Number(btn.dataset?.multiplier ?? $btn?.data('multiplier')) || 1;
      const ignoreDR = Boolean(btn.dataset?.ignoreDr ?? $btn?.data('ignore-dr'));

      const attacker = game.actors?.get(attackerId) || null;

      let targetTokens = Array.from(game.user?.targets || []);
      if (!targetTokens.length && canvas?.tokens) {
        targetTokens = canvas.tokens.controlled.filter(t => t.actor && t.actor.id !== attackerId);
      }

      if (!targetTokens.length) {
        ui.notifications?.warn('DCC RPG | No targets selected! Please target or select at least one token on the canvas.');
        return;
      }

      const rawTyped = card.dataset?.typedDamage ||
        card.getAttribute?.('data-typed-damage') ||
        $card?.attr('data-typed-damage') ||
        $card?.data('typed-damage');
      let typedDamage = null;
      if (rawTyped) {
        try {
          typedDamage = typeof rawTyped === 'string' ? JSON.parse(rawTyped) : rawTyped;
        } catch (_) {}
      }
      const damageType = card.dataset?.damageType || $card?.data('damage-type') || '';

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

      if (typeof card.querySelectorAll === 'function') {
        card.querySelectorAll('.dcc-damage-applied-feedback').forEach(el => el.remove());
      } else if ($card) {
        $card.find('.dcc-damage-applied-feedback').remove();
      }

      const feedbackHtml = `
        <div class="dcc-damage-applied-feedback" style="margin-top: 6px; font-size: 11px; background: #e8f8f5; border: 1px solid #27ae60; color: #1e8449; padding: 4px 6px; border-radius: 3px; font-family: 'Oswald', sans-serif;">
          <i class="fa-solid fa-check"></i> Applied to ${results.length} target(s). Logged to combat!
        </div>
      `;
      if (typeof card.insertAdjacentHTML === 'function') {
        card.insertAdjacentHTML('beforeend', feedbackHtml);
      } else if ($card) {
        $card.append(feedbackHtml);
      }
    };

    if (typeof btn.addEventListener === 'function') {
      btn.addEventListener('click', clickHandler);
    } else if (typeof $ !== 'undefined') {
      $(btn).click(clickHandler);
    }
  }

  // 2. Handle click on "Roll Spell Damage" from a cast spell card in chat
  const rollSpellButtons = query('.roll-spell-dmg-from-card');
  for (const btn of rollSpellButtons) {
    if (btn.dataset) {
      if (btn.dataset.dccBound) continue;
      btn.dataset.dccBound = 'true';
    }

    const spellClickHandler = async (ev) => {
      ev.preventDefault();
      const $btn = (typeof $ !== 'undefined') ? $(btn) : null;
      const actorId = btn.dataset?.actorId || $btn?.data('actor-id');
      const spellId = btn.dataset?.spellId || $btn?.data('spell-id');
      const actor = game.actors?.get(actorId) || null;
      if (!actor) return;
      const spell = (typeof actor.items?.get === 'function')
        ? actor.items.get(spellId)
        : (Array.isArray(actor.items) ? actor.items.find(it => it.id === spellId) : actor.items?.find?.(it => it.id === spellId));
      if (spell && typeof actor.rollSpellDamage === 'function') {
        await actor.rollSpellDamage(spell);
      }
    };

    if (typeof btn.addEventListener === 'function') {
      btn.addEventListener('click', spellClickHandler);
    } else if (typeof $ !== 'undefined') {
      $(btn).click(spellClickHandler);
    }
  }

  // 3. Handle click on "Roll Attack Damage" / "Roll Skill Damage" from a hit/check card in chat
  const rollAttackButtons = query('.roll-skill-dmg-from-card, .roll-attack-dmg-from-card');
  for (const btn of rollAttackButtons) {
    if (btn.dataset) {
      if (btn.dataset.dccBound) continue;
      btn.dataset.dccBound = 'true';
    }

    const attackClickHandler = async (ev) => {
      ev.preventDefault();
      const $btn = (typeof $ !== 'undefined') ? $(btn) : null;
      const actorId = btn.dataset?.actorId || $btn?.data('actor-id');
      const itemId = btn.dataset?.itemId || btn.dataset?.skillId || $btn?.data('item-id') || $btn?.data('skill-id');
      const actor = (typeof game !== 'undefined' && game.actors?.get) ? game.actors.get(actorId) : null;
      if (!actor) return;
      const item = (typeof actor.items?.get === 'function')
        ? actor.items.get(itemId)
        : (Array.isArray(actor.items) ? actor.items.find(it => it.id === itemId) : actor.items?.find?.(it => it.id === itemId));
      if (item) {
        if (typeof actor.rollSkillDamage === 'function' && item.type === 'skill') {
          await actor.rollSkillDamage(item);
        } else if (typeof actor.rollAttack === 'function') {
          await actor.rollAttack(item, 'damage');
        }
      }
    };

    if (typeof btn.addEventListener === 'function') {
      btn.addEventListener('click', attackClickHandler);
    } else if (typeof $ !== 'undefined') {
      $(btn).click(attackClickHandler);
    }
  }

  // 4. Handle click on "Roll Evade" from an incoming attack card in chat
  const rollEvadeButtons = query('.dcc-evade-roll-btn');
  for (const btn of rollEvadeButtons) {
    if (btn.dataset) {
      if (btn.dataset.dccBound) continue;
      btn.dataset.dccBound = 'true';
    }

    const evadeClickHandler = async (ev) => {
      ev.preventDefault();
      const $btn = (typeof $ !== 'undefined') ? $(btn) : null;
      const attackerId = btn.dataset?.attackerId || $btn?.data('attacker-id');
      const attackerName = btn.dataset?.attackerName || $btn?.data('attacker-name') || 'Attacker';
      const attackTotal = Number(btn.dataset?.attackTotal ?? $btn?.data('attack-total'));
      const floor = Number(btn.dataset?.floor ?? $btn?.data('floor')) || getCurrentFloor();

      // Resolve acting crawler
      let crawler = null;
      if (game.user?.character && game.user.character.type === 'crawler') {
        crawler = game.user.character;
      } else if (canvas?.tokens?.controlled?.length) {
        const controlled = canvas.tokens.controlled.find(t => t.actor?.type === 'crawler');
        if (controlled) crawler = controlled.actor;
      }
      if (!crawler && typeof game !== 'undefined' && game.actors) {
        const ownedCrawlers = Array.from(game.actors.values?.() || game.actors).filter(a => a.type === 'crawler' && a.isOwner);
        if (ownedCrawlers.length >= 1) {
          crawler = ownedCrawlers[0];
        }
      }

      if (!crawler) {
        ui.notifications?.warn('DCC RPG | Please select or assign a Crawler character to roll Evade!');
        return;
      }

      if (typeof crawler.rollEvade === 'function') {
        await crawler.rollEvade({ attackTotal, attackerName, floor });
      }
    };

    if (typeof btn.addEventListener === 'function') {
      btn.addEventListener('click', evadeClickHandler);
    } else if (typeof $ !== 'undefined') {
      $(btn).click(evadeClickHandler);
    }
  }
}

/**
 * Get current active dungeon floor number (global across all crawlers)
 * @returns {number}
 */
export function getCurrentFloor() {
  try {
    const val = globalThis.game?.settings?.get?.('carl-rpg', 'currentFloor');
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  } catch (_) {
    return 1;
  }
}

/**
 * Set current active dungeon floor number
 * @param {number|string} floor
 * @returns {Promise<number>}
 */
export async function setCurrentFloor(floor) {
  const parsed = Math.max(1, parseInt(floor, 10) || 1);
  if (globalThis.game?.settings?.set) {
    await globalThis.game.settings.set('carl-rpg', 'currentFloor', parsed);
  }
  if (typeof globalThis.ui !== 'undefined' && globalThis.ui?.windows) {
    for (const app of Object.values(globalThis.ui.windows)) {
      if (typeof app.render === 'function') app.render(false);
    }
  }
  return parsed;
}

if (typeof globalThis.window !== 'undefined') {
  globalThis.window.carl = globalThis.window.carl || {};
  globalThis.window.carl.getCurrentFloor = getCurrentFloor;
  globalThis.window.carl.setCurrentFloor = setCurrentFloor;
}
if (globalThis.CONFIG?.DCC) {
  globalThis.CONFIG.DCC.getCurrentFloor = getCurrentFloor;
  globalThis.CONFIG.DCC.setCurrentFloor = setCurrentFloor;
}

/**
 * Detect whether the current Foundry environment is Version 13 or newer.
 * Safely evaluates across module evaluation (when `game` may not be initialized yet)
 * and runtime hooks.
 * @returns {boolean}
 */
export function isFoundryV13Plus() {
  // If game is defined and has explicit release or version info, use it as source of truth
  if (typeof game !== 'undefined' && game) {
    if (typeof game.release?.generation === 'number') {
      return game.release.generation >= 13;
    }
    if (typeof game.version === 'string') {
      return Number(game.version.split('.')[0]) >= 13;
    }
  }
  // If foundry has explicit release info
  if (typeof foundry !== 'undefined' && foundry) {
    if (typeof foundry.release?.generation === 'number') {
      return foundry.release.generation >= 13;
    }
  }
  // If CONST has explicit version info
  if (typeof CONST !== 'undefined' && CONST) {
    if (typeof CONST.BUILD_RELEASE?.generation === 'number') {
      return CONST.BUILD_RELEASE.generation >= 13;
    }
    if (typeof CONST.VERSION === 'string') {
      return Number(CONST.VERSION.split('.')[0]) >= 13;
    }
  }
  // Structural checks if release/version properties are not yet populated (e.g. at early module load)
  if (typeof foundry !== 'undefined' && foundry) {
    if (Boolean(foundry.appv1)) return true;
    if (Boolean(foundry.applications?.sidebar?.tabs?.CombatTracker)) return true;
  }
  return false;
}

/**
 * Register chat message hook using renderChatMessageHTML on Foundry v13+ (or renderChatMessage on v12)
 * to eliminate deprecation warnings.
 * @returns {string} The registered hook name
 */
export function registerChatMessageHook() {
  const isV13Plus = isFoundryV13Plus();
  const hookName = isV13Plus ? 'renderChatMessageHTML' : 'renderChatMessage';

  // In v13+, ensure legacy hook is cleanly removed if it was ever registered
  if (isV13Plus && typeof Hooks !== 'undefined' && typeof Hooks.off === 'function') {
    Hooks.off('renderChatMessage', onRenderChatMessage);
  }

  if (_registeredChatHook && _registeredChatHook !== hookName && typeof Hooks !== 'undefined' && typeof Hooks.off === 'function') {
    Hooks.off(_registeredChatHook, onRenderChatMessage);
  }

  if (typeof Hooks !== 'undefined' && typeof Hooks.on === 'function') {
    const currentListeners = Hooks.events?.[hookName] || [];
    const alreadyRegistered = currentListeners.some(e => e === onRenderChatMessage || e?.fn === onRenderChatMessage);
    if (!alreadyRegistered) {
      Hooks.on(hookName, onRenderChatMessage);
    }
    _registeredChatHook = hookName;
  }
  return hookName;
}

// Register chat message render hook on module evaluation
registerChatMessageHook();

/**
 * Enforce linked actor data for player characters (crawlers) and companion pets,
 * and handle unlinked independent tokens with sequential naming for mobs.
 */
Hooks.on('preCreateToken', (tokenDoc, createData, options, userId) => {
  const actor = tokenDoc.actor || game.actors?.get(tokenDoc.actorId);
  if (actor && (actor.type === 'crawler' || actor.type === 'pet')) {
    tokenDoc.updateSource({ actorLink: true });
  } else if (actor && actor.type === 'mob') {
    const updates = { actorLink: false };

    // Sequential unique naming upon placement or pasting onto a scene:
    // "Goblin" -> "Goblin 1", "Goblin 2", etc.
    // If copying/pasting "Goblin 2", base name is extracted as "Goblin" and increments to "Goblin 3".
    const rawName = tokenDoc.name || actor.name || 'Mob';
    const baseMatch = rawName.match(/^(.*?)(?:\s+(\d+))?$/);
    const baseName = (baseMatch ? baseMatch[1] : rawName).trim();

    const scene = tokenDoc.parent || canvas?.scene;
    let nextNum = 1;
    if (scene?.tokens) {
      const escaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}(?:\\s+(\\d+))?$`, 'i');
      const numbers = [];
      for (const t of scene.tokens) {
        if (t.id && t.id === tokenDoc.id) continue;
        const match = (t.name || '').match(regex);
        if (match) {
          numbers.push(match[1] ? parseInt(match[1], 10) : 1);
        }
      }
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    updates.name = `${baseName} ${nextNum}`;
    tokenDoc.updateSource(updates);
  }
});

Hooks.once('ready', async function() {
  if (game.user.isGM) {
    // 0. Ensure official background RollTables (Tables 11, 12, 13) exist in the world
    await ensureBackgroundTables();

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


