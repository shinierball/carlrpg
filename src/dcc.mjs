import { DCCActor } from './documents/actor.mjs';
import { DCCItem } from './documents/item.mjs';
import { DCCCrawlerSheet } from './sheets/crawler-sheet.mjs';
import { DCCItemSheet } from './sheets/item-sheet.mjs';
import { DCC_SKILLS } from './data/skills.mjs';

Hooks.once('init', async function() {
  console.log('DCC RPG | Initializing Dungeon Crawler Carl Roleplaying Game System');

  CONFIG.DCC = {
    skills: DCC_SKILLS
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
    'systems/carl-rpg/templates/actors/parts/page3-skills.hbs',
    'systems/carl-rpg/templates/actors/parts/page4-inventory.hbs',
    'systems/carl-rpg/templates/actors/parts/page5-extras.hbs',
    'systems/carl-rpg/templates/actors/parts/page6-abilities.hbs'
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
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet) {
          app.render(false);
        }
      }
    }
  });

  // Global Developer Helper
  window.carl = {
    reloadSheets() {
      for (const app of Object.values(ui.windows)) {
        if (app instanceof DCCCrawlerSheet || app instanceof DCCItemSheet) {
          app.render(false);
        }
      }
      ui.notifications?.info('DCC RPG | Re-rendered all open sheets.');
    }
  };
});

Hooks.once('ready', async function() {
  if (game.user.isGM) {
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
  }
});

