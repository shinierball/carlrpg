/**
 * Canonical DCC RPG System Macros
 * Available to all players and administrators.
 */

export const DCC_MACROS = [
  {
    _id: "dccmacro00000001",
    name: "Character Creator",
    type: "script",
    img: "icons/svg/skull.svg",
    scope: "global",
    command: `// Open the DCC RPG Crawler Induction Terminal (Character Creator)
if (typeof window.carl?.openCrawlerCreator === 'function') {
  window.carl.openCrawlerCreator();
} else if (typeof game.dcc?.DCCCrawlerCreatorApp !== 'undefined') {
  new game.dcc.DCCCrawlerCreatorApp().render(true);
} else {
  ui.notifications?.warn('DCC Crawler Creator application is not available.');
}`,
    ownership: {
      default: 2 // Observer: available to all users to view and execute
    },
    flags: {
      "carl-rpg": {
        macroKey: "crawler-creator"
      }
    }
  },
  {
    _id: "dccmacro00000002",
    name: "Open Combat Metrics",
    type: "script",
    img: "icons/svg/combat.svg",
    scope: "global",
    command: `// Open DCC RPG Combat Metrics & AI Awards
if (typeof window.carl?.openCombatMetrics === 'function') {
  window.carl.openCombatMetrics();
} else if (typeof game.dcc?.DCCCombatMetricsApp !== 'undefined') {
  new game.dcc.DCCCombatMetricsApp().render(true);
} else {
  ui.notifications?.warn('DCC Combat Metrics application is not available.');
}`,
    ownership: {
      default: 2 // Observer: available to all users to view and execute
    },
    flags: {
      "carl-rpg": {
        macroKey: "combat-metrics"
      }
    }
  },
  {
    _id: "dccmacro00000003",
    name: "Party Progression and Session Hub",
    type: "script",
    img: "icons/svg/community.svg",
    scope: "global",
    command: `// Open DCC RPG Party Progression & Session Hub
if (typeof window.carl?.openSessionManager === 'function') {
  window.carl.openSessionManager();
} else if (typeof game.dcc?.DCCSessionManagerApp !== 'undefined') {
  new game.dcc.DCCSessionManagerApp().render(true);
} else {
  ui.notifications?.warn('DCC Session Manager application is not available.');
}`,
    ownership: {
      default: 2 // Observer: available to all users to view and execute
    },
    flags: {
      "carl-rpg": {
        macroKey: "session-manager"
      }
    }
  },
  {
    _id: "dccmacro00000004",
    name: "Start Party Grinding & Downtime",
    type: "script",
    img: "icons/skills/melee/strike-hammer-orange.webp",
    scope: "global",
    command: `// Open DCC RPG Party Grinding & Downtime Hub
if (typeof window.carl?.openGrindApp === 'function') {
  window.carl.openGrindApp();
} else if (typeof game.dcc?.DCCGrindApp !== 'undefined') {
  new game.dcc.DCCGrindApp().render(true);
} else {
  ui.notifications?.warn('DCC Grinding Hub is not available.');
}`,
    ownership: {
      default: 2
    },
    flags: {
      "carl-rpg": {
        macroKey: "grind-hub"
      }
    }
  },
  {
    _id: "dccmacro00000005",
    name: "Class Creator Studio",
    type: "script",
    img: "icons/svg/book.svg",
    scope: "global",
    command: `// Open DCC RPG Custom Class Creator Studio (Class Builder)
if (typeof window.carl?.openClassCreator === 'function') {
  window.carl.openClassCreator();
} else if (typeof game.dcc?.DCCClassCreatorApp !== 'undefined') {
  new game.dcc.DCCClassCreatorApp().render(true);
} else if (typeof CONFIG.DCC?.DCCClassCreatorApp !== 'undefined') {
  new CONFIG.DCC.DCCClassCreatorApp().render(true);
} else {
  ui.notifications?.warn('DCC Class Creator Studio is not available.');
}`,
    ownership: {
      default: 2 // Observer: available to all users to view and execute
    },
    flags: {
      "carl-rpg": {
        macroKey: "class-creator"
      }
    }
  },
  {
    _id: "dccmacro00000006",
    name: "Race Creator Studio",
    type: "script",
    img: "icons/svg/paw.svg",
    scope: "global",
    command: `// Open DCC RPG Custom Race Creator Studio (Race Builder)
if (typeof window.carl?.openRaceCreator === 'function') {
  window.carl.openRaceCreator();
} else if (typeof game.dcc?.DCCRaceCreatorApp !== 'undefined') {
  new game.dcc.DCCRaceCreatorApp().render(true);
} else if (typeof CONFIG.DCC?.DCCRaceCreatorApp !== 'undefined') {
  new CONFIG.DCC.DCCRaceCreatorApp().render(true);
} else {
  ui.notifications?.warn('DCC Race Creator Studio is not available.');
}`,
    ownership: {
      default: 2 // Observer: available to all users to view and execute
    },
    flags: {
      "carl-rpg": {
        macroKey: "race-creator"
      }
    }
  }
];
