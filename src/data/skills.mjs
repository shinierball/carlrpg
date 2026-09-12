/**
 * Dungeon Crawler Carl RPG - Official Skills Dataset
 * Derived from the official DCC Combat & Exploration Action Quick Sheets.
 */

export const DCC_SKILLS = [
  // ==========================================
  // UTILITY SKILLS (Exploration & Survival)
  // ==========================================
  {
    _id: "dccskl0000000001",
    name: "Ambush",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Opposed",
      category: "Utility",
      notes: "Make an Int-Opposed check vs. approaching Mobs. On Success, gain a surprise Action before combat starts and attack with Advantage.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000002",
    name: "Climbing",
    type: "skill",
    img: "icons/svg/stone-path.svg",
    system: {
      rank: 0,
      stat: "str",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Make a check every minute during hazardous climbs. Making attacks while climbing imposes Disadvantage on attack rolls.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000003",
    name: "Deception",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "cha",
      checkType: "Opposed",
      category: "Utility",
      notes: "Int-Opposed check to mislead NPCs or opponents. Suffers Disadvantage if the target possesses Detect Lies.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000004",
    name: "Detect Lies",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Opposed",
      category: "Utility",
      notes: "Cha-Opposed check to discern whether an entity is actively lying to you.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000005",
    name: "Detect Trap",
    type: "skill",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Detect non-magical physical traps. Scanning an entire room rapidly or checking while moving imposes Disadvantage.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000006",
    name: "Dumpster Diving",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Search dungeon debris and junk piles for useful craftables or items. Takes 1 hour per 50ft-square area.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000007",
    name: "Endurance",
    type: "skill",
    img: "icons/svg/aura.svg",
    system: {
      rank: 0,
      stat: "con",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Prevent physical exhaustion and avoid the Fatigued Debuff during long-distance travel, grinding, or environmental hardship.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000008",
    name: "Explosives Handling",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Safely prime, disarm, or manage explosive devices prior to deployment.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000009",
    name: "First Aid",
    type: "skill",
    img: "icons/svg/heal.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Provide immediate field medical assistance. Restores 1 Health Bar (HB) slot on Success (plus additional slots on higher degrees of success). Limit once per rest per patient.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000010",
    name: "Hide in Shadows",
    type: "skill",
    img: "icons/svg/blind.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Opposed",
      category: "Utility",
      notes: "Int-Opposed check to become invisible to Mobs and HUD minimaps while remaining stationary in dim light or behind cover.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000011",
    name: "Investigation",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Analyze complex mechanisms, structural clues, or environmental puzzles (takes 10 minutes, or 1 Action when taking Look for Clues).",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000012",
    name: "Lockpicking",
    type: "skill",
    img: "icons/svg/padlock.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Pick mechanical locks. Takes time equal to the Floor Number in minutes. Lacking proper lockpicking tools imposes Disadvantage.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000013",
    name: "Perception",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Spot hidden details, auditory cues, or environmental hazards. Also used during Look for Clues.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000014",
    name: "Persuasion",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      checkType: "Opposed",
      category: "Utility",
      notes: "Int-Opposed check requiring ~10 minutes of conversation to convince neutral entities to follow reasonable suggestions.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000015",
    name: "Running",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Used for chases and emergency sprints. Check every minute; add +1 to the check for every 10ft of base Move speed.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000016",
    name: "Stealth",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Opposed",
      category: "Utility",
      notes: "Int-Opposed check to move undetected. Success prior to combat grants 1 bonus non-Attack Action.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000017",
    name: "Survival",
    type: "skill",
    img: "icons/svg/cave.svg",
    system: {
      rank: 0,
      stat: "con",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Endure harsh biomes, forage for sustenance, and negate environmental hazards or starvation debuffs.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000018",
    name: "Tactics",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Usable once per combat. On Success, grant yourself and all party members a +1 (or higher) bonus to Attack, Damage, or Evade checks.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000019",
    name: "Throwing",
    type: "skill",
    img: "icons/svg/d20.svg",
    system: {
      rank: 0,
      stat: "str",
      checkType: "Unopposed / Evade",
      category: "Utility",
      notes: "Throw items up to Str x 10 feet. Hitting an area target is an Unopposed check; targeting a foe requires an Attack check vs. Evade.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000020",
    name: "Tracking",
    type: "skill",
    img: "icons/svg/direction.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Unopposed",
      category: "Utility",
      notes: "Locate and follow footprints, scent lines, or disturbance trails. Requires a renewed check every 15 minutes of tracking.",
      upgrades: "",
      checked: false
    }
  },

  // ==========================================
  // COMBAT SKILL ACTIONS
  // ==========================================
  {
    _id: "dccskl0000000021",
    name: "Attack",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      checkType: "Opposed vs Evade",
      category: "Combat",
      notes: "Standard Action. Attack a target within range. Default melee range is 5 feet (adjacent) using Str to hit. Ranged attacks default to Dex to hit. Roll vs. foe's Evade.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000022",
    name: "Cast a Spell",
    type: "skill",
    img: "icons/svg/daze.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Opposed vs Evade",
      category: "Combat",
      notes: "Standard Action. Select a Spell or scroll in your Hotlist. If an Attack Spell, make a Spell Skill Check against target's Evade. Non-scroll spells require spending specified Mana cost.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000023",
    name: "Catcher",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      checkType: "Interrupt Action",
      category: "Combat",
      notes: "Interrupt Action. Intercept a direct, non-area attack intended for an adjacent party member. You may take a 10ft Step to get into position. You automatically take the damage and cannot perform an Evade check against it.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000024",
    name: "Look for Clues",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      checkType: "Standard Action",
      category: "Combat",
      notes: "Standard Action. Use Perception, Investigation, or a related Skill to analyze a Boss monster. Takes 1 Action in combat. A successful check reveals critical tactics or mechanical weaknesses to benefit the party.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000025",
    name: "Taunt",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      checkType: "Opposed (Cha)",
      category: "Combat",
      notes: "Interrupt Action. Shout or gesture to redirect announced enemy attacks from an ally within 30 feet to yourself. Requires a Charisma-Opposed check. Unlike Catcher, you can roll Evade checks against redirected attacks.",
      upgrades: "",
      checked: false
    }
  },

  // ==========================================
  // PASSIVE SKILLS
  // ==========================================
  {
    _id: "dccskl0000000026",
    name: "Aiming",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Passive (No Roll)",
      category: "Passive",
      notes: "Passive Skill. Requires no dice rolls to function. Provides static ranged accuracy bonuses. Advances through magic gear, scrolls, or floor-leveling rewards.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000027",
    name: "Dodge",
    type: "skill",
    img: "icons/svg/wing.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Passive (No Roll)",
      category: "Passive",
      notes: "Passive Skill. Requires no dice rolls to function. Provides static bonuses to Evade and avoidance. Advances through magic gear, scrolls, or floor-leveling rewards.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000028",
    name: "Regeneration",
    type: "skill",
    img: "icons/svg/regen.svg",
    system: {
      rank: 0,
      stat: "con",
      checkType: "Passive (No Roll)",
      category: "Passive",
      notes: "Passive Skill. Requires no dice rolls to function. Provides static health recovery over time or between encounters. Advances through magic gear, scrolls, or floor-leveling rewards.",
      upgrades: "",
      checked: false
    }
  },

  // ==========================================
  // TACTICAL COMBAT ACTIONS
  // ==========================================
  {
    _id: "dccskl0000000029",
    name: "Call a Play",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "cha",
      checkType: "Standard Action (2d6)",
      category: "Combat",
      notes: "Standard Action. Encourage an ally to perform a non-Interrupt action. Roll 2d6. The targeted ally adds the higher d6 result to their upcoming Skill Check or damage roll.",
      upgrades: "",
      checked: false
    }
  },
  {
    _id: "dccskl0000000030",
    name: "Intervene",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "dex",
      checkType: "Interrupt Action (1d6)",
      category: "Combat",
      notes: "Interrupt Action. Assist an ally's roll. Roll 1d6 and add the result directly to a party member's d20 roll. This die is applied after determining whether the initial roll was a Success or Failure.",
      upgrades: "",
      checked: false
    }
  }
];
