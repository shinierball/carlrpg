/**
 * Canonical DCC RPG Damage Types (13 types)
 */
export const DCC_DAMAGE_TYPES = [
  "Acid",
  "Bludgeoning",
  "Electric",
  "Fire",
  "Force",
  "Holy",
  "Ice",
  "Necrotic",
  "Piercing",
  "Poison",
  "Psychic",
  "Slashing",
  "Sonic"
];

/**
 * Compendium of Generic Buffs (32 items)
 * - 5 Stat Buffs (one for each stat: str, int, con, dex, cha)
 * - 1 Temporary Health Buff
 * - 13 Damage Resistance Buffs (one for each damage type)
 * - 13 Damage Immunity Buffs (one for each damage type)
 */
export const DCC_BUFFS = [
  // --- Ability Score Buffs (5) ---
  {
    _id: "dccbuf0000000001",
    name: "Strength Buff",
    type: "buff",
    img: "icons/svg/sword.svg",
    system: {
      buffType: "stat",
      stat: "str",
      value: 2,
      damageType: "",
      duration: "1 Hour",
      description: "Temporarily increases Strength ability score by +2."
    }
  },
  {
    _id: "dccbuf0000000002",
    name: "Intelligence Buff",
    type: "buff",
    img: "icons/svg/book.svg",
    system: {
      buffType: "stat",
      stat: "int",
      value: 2,
      damageType: "",
      duration: "1 Hour",
      description: "Temporarily increases Intelligence ability score by +2."
    }
  },
  {
    _id: "dccbuf0000000003",
    name: "Constitution Buff",
    type: "buff",
    img: "icons/svg/shield.svg",
    system: {
      buffType: "stat",
      stat: "con",
      value: 2,
      damageType: "",
      duration: "1 Hour",
      description: "Temporarily increases Constitution ability score by +2."
    }
  },
  {
    _id: "dccbuf0000000004",
    name: "Dexterity Buff",
    type: "buff",
    img: "icons/svg/target.svg",
    system: {
      buffType: "stat",
      stat: "dex",
      value: 2,
      damageType: "",
      duration: "1 Hour",
      description: "Temporarily increases Dexterity ability score by +2."
    }
  },
  {
    _id: "dccbuf0000000005",
    name: "Charisma Buff",
    type: "buff",
    img: "icons/svg/sun.svg",
    system: {
      buffType: "stat",
      stat: "cha",
      value: 2,
      damageType: "",
      duration: "1 Hour",
      description: "Temporarily increases Charisma ability score by +2."
    }
  },

  // --- Temporary Health Buff (1) ---
  {
    _id: "dccbuf0000000006",
    name: "Temporary Health Buff",
    type: "buff",
    img: "icons/svg/regen.svg",
    system: {
      buffType: "tempHp",
      stat: "",
      value: 10,
      damageType: "",
      duration: "1 Hour",
      description: "Grants +10 Temporary Health points that absorb incoming damage before regular HP."
    }
  },

  // --- Damage Resistance Buffs (13) ---
  {
    _id: "dccbuf0000000007",
    name: "Acid Resistance Buff",
    type: "buff",
    img: "icons/svg/acid.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Acid",
      duration: "1 Hour",
      description: "Grants resistance to Acid damage, reducing incoming Acid damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000008",
    name: "Bludgeoning Resistance Buff",
    type: "buff",
    img: "icons/svg/mace.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Bludgeoning",
      duration: "1 Hour",
      description: "Grants resistance to Bludgeoning damage, reducing incoming Bludgeoning damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000009",
    name: "Electric Resistance Buff",
    type: "buff",
    img: "icons/svg/lightning.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Electric",
      duration: "1 Hour",
      description: "Grants resistance to Electric damage, reducing incoming Electric damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000010",
    name: "Fire Resistance Buff",
    type: "buff",
    img: "icons/svg/fire.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Fire",
      duration: "1 Hour",
      description: "Grants resistance to Fire damage, reducing incoming Fire damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000011",
    name: "Force Resistance Buff",
    type: "buff",
    img: "icons/svg/explosion.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Force",
      duration: "1 Hour",
      description: "Grants resistance to Force damage, reducing incoming Force damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000012",
    name: "Holy Resistance Buff",
    type: "buff",
    img: "icons/svg/angel.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Holy",
      duration: "1 Hour",
      description: "Grants resistance to Holy damage, reducing incoming Holy damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000013",
    name: "Ice Resistance Buff",
    type: "buff",
    img: "icons/svg/ice-aura.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Ice",
      duration: "1 Hour",
      description: "Grants resistance to Ice damage, reducing incoming Ice damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000014",
    name: "Necrotic Resistance Buff",
    type: "buff",
    img: "icons/svg/skull.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Necrotic",
      duration: "1 Hour",
      description: "Grants resistance to Necrotic damage, reducing incoming Necrotic damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000015",
    name: "Piercing Resistance Buff",
    type: "buff",
    img: "icons/svg/arrow.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Piercing",
      duration: "1 Hour",
      description: "Grants resistance to Piercing damage, reducing incoming Piercing damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000016",
    name: "Poison Resistance Buff",
    type: "buff",
    img: "icons/svg/poison.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Poison",
      duration: "1 Hour",
      description: "Grants resistance to Poison damage, reducing incoming Poison damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000017",
    name: "Psychic Resistance Buff",
    type: "buff",
    img: "icons/svg/eye.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Psychic",
      duration: "1 Hour",
      description: "Grants resistance to Psychic damage, reducing incoming Psychic damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000018",
    name: "Slashing Resistance Buff",
    type: "buff",
    img: "icons/svg/sword.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Slashing",
      duration: "1 Hour",
      description: "Grants resistance to Slashing damage, reducing incoming Slashing damage by 50%."
    }
  },
  {
    _id: "dccbuf0000000019",
    name: "Sonic Resistance Buff",
    type: "buff",
    img: "icons/svg/sound.svg",
    system: {
      buffType: "resistance",
      stat: "",
      value: 0,
      damageType: "Sonic",
      duration: "1 Hour",
      description: "Grants resistance to Sonic damage, reducing incoming Sonic damage by 50%."
    }
  },

  // --- Damage Immunity Buffs (13) ---
  {
    _id: "dccbuf0000000020",
    name: "Acid Immunity Buff",
    type: "buff",
    img: "icons/svg/acid.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Acid",
      duration: "1 Hour",
      description: "Grants complete immunity to Acid damage, negating 100% of incoming Acid damage."
    }
  },
  {
    _id: "dccbuf0000000021",
    name: "Bludgeoning Immunity Buff",
    type: "buff",
    img: "icons/svg/mace.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Bludgeoning",
      duration: "1 Hour",
      description: "Grants complete immunity to Bludgeoning damage, negating 100% of incoming Bludgeoning damage."
    }
  },
  {
    _id: "dccbuf0000000022",
    name: "Electric Immunity Buff",
    type: "buff",
    img: "icons/svg/lightning.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Electric",
      duration: "1 Hour",
      description: "Grants complete immunity to Electric damage, negating 100% of incoming Electric damage."
    }
  },
  {
    _id: "dccbuf0000000023",
    name: "Fire Immunity Buff",
    type: "buff",
    img: "icons/svg/fire.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Fire",
      duration: "1 Hour",
      description: "Grants complete immunity to Fire damage, negating 100% of incoming Fire damage."
    }
  },
  {
    _id: "dccbuf0000000024",
    name: "Force Immunity Buff",
    type: "buff",
    img: "icons/svg/explosion.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Force",
      duration: "1 Hour",
      description: "Grants complete immunity to Force damage, negating 100% of incoming Force damage."
    }
  },
  {
    _id: "dccbuf0000000025",
    name: "Holy Immunity Buff",
    type: "buff",
    img: "icons/svg/angel.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Holy",
      duration: "1 Hour",
      description: "Grants complete immunity to Holy damage, negating 100% of incoming Holy damage."
    }
  },
  {
    _id: "dccbuf0000000026",
    name: "Ice Immunity Buff",
    type: "buff",
    img: "icons/svg/ice-aura.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Ice",
      duration: "1 Hour",
      description: "Grants complete immunity to Ice damage, negating 100% of incoming Ice damage."
    }
  },
  {
    _id: "dccbuf0000000027",
    name: "Necrotic Immunity Buff",
    type: "buff",
    img: "icons/svg/skull.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Necrotic",
      duration: "1 Hour",
      description: "Grants complete immunity to Necrotic damage, negating 100% of incoming Necrotic damage."
    }
  },
  {
    _id: "dccbuf0000000028",
    name: "Piercing Immunity Buff",
    type: "buff",
    img: "icons/svg/arrow.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Piercing",
      duration: "1 Hour",
      description: "Grants complete immunity to Piercing damage, negating 100% of incoming Piercing damage."
    }
  },
  {
    _id: "dccbuf0000000029",
    name: "Poison Immunity Buff",
    type: "buff",
    img: "icons/svg/poison.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Poison",
      duration: "1 Hour",
      description: "Grants complete immunity to Poison damage, negating 100% of incoming Poison damage."
    }
  },
  {
    _id: "dccbuf0000000030",
    name: "Psychic Immunity Buff",
    type: "buff",
    img: "icons/svg/eye.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Psychic",
      duration: "1 Hour",
      description: "Grants complete immunity to Psychic damage, negating 100% of incoming Psychic damage."
    }
  },
  {
    _id: "dccbuf0000000031",
    name: "Slashing Immunity Buff",
    type: "buff",
    img: "icons/svg/sword.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Slashing",
      duration: "1 Hour",
      description: "Grants complete immunity to Slashing damage, negating 100% of incoming Slashing damage."
    }
  },
  {
    _id: "dccbuf0000000032",
    name: "Sonic Immunity Buff",
    type: "buff",
    img: "icons/svg/sound.svg",
    system: {
      buffType: "immunity",
      stat: "",
      value: 0,
      damageType: "Sonic",
      duration: "1 Hour",
      description: "Grants complete immunity to Sonic damage, negating 100% of incoming Sonic damage."
    }
  }
];

/**
 * Common Canonical DCC RPG Debuffs and Status Conditions
 */
export const DCC_DEBUFFS = [
  {
    _id: "dccdeb0000000001",
    name: "Burned",
    type: "debuff",
    img: "icons/svg/fire.svg",
    severity: "Minor",
    description: "Takes periodic fire damage and suffers lingering burning pain.",
    system: {
      severity: "Minor",
      damageType: "Fire",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Combat",
      description: "Takes periodic fire damage and suffers lingering burning pain."
    }
  },
  {
    _id: "dccdeb0000000002",
    name: "Shocked",
    type: "debuff",
    img: "icons/svg/lightning.svg",
    severity: "Minor",
    description: "Muscles twitch violently from electric currents. Disadvantage on Dex-based checks.",
    system: {
      severity: "Minor",
      damageType: "Electric",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "dex", value: -2 }],
      damageModifiers: [],
      duration: "Combat",
      description: "Muscles twitch violently from electric currents. Disadvantage on Dex-based checks."
    }
  },
  {
    _id: "dccdeb0000000003",
    name: "Poisoned",
    type: "debuff",
    img: "icons/svg/poison.svg",
    severity: "Minor",
    description: "Toxic venom coursing through the bloodstream. -2 to physical stats.",
    system: {
      severity: "Minor",
      damageType: "Poison",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "con", value: -2 },
        { stat: "str", value: -2 }
      ],
      damageModifiers: [],
      duration: "1 Hour",
      description: "Toxic venom coursing through the bloodstream. -2 to physical stats."
    }
  },
  {
    _id: "dccdeb0000000004",
    name: "Held",
    type: "debuff",
    img: "icons/svg/net.svg",
    severity: "Major",
    description: "Physically or magically restrained. Incapacitated and cannot move or take actions.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "dex", value: -5 }],
      damageModifiers: [],
      duration: "Combat",
      description: "Physically or magically restrained. Incapacitated and cannot move or take actions."
    }
  },
  {
    _id: "dccdeb0000000005",
    name: "Stunned",
    type: "debuff",
    img: "icons/svg/daze.svg",
    severity: "Major",
    description: "Completely dazed and concussed. Cannot take actions or reactions.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "dex", value: -4 },
        { stat: "int", value: -4 }
      ],
      damageModifiers: [],
      duration: "1 Round",
      description: "Completely dazed and concussed. Cannot take actions or reactions."
    }
  },
  {
    _id: "dccdeb0000000006",
    name: "Woozy",
    type: "debuff",
    img: "icons/svg/sleep.svg",
    severity: "Minor",
    description: "Dizzy and lightheaded. -2 penalty to attack, intelligence, and perception rolls.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "int", value: -2 }],
      damageModifiers: [],
      duration: "10 Minutes",
      description: "Dizzy and lightheaded. -2 penalty to attack, intelligence, and perception rolls."
    }
  },
  {
    _id: "dccdeb0000000007",
    name: "Queasy",
    type: "debuff",
    img: "icons/svg/acid.svg",
    severity: "Minor",
    description: "Violent stomach cramps and nausea. -2 penalty to physical rolls.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "con", value: -2 },
        { stat: "str", value: -1 }
      ],
      damageModifiers: [],
      duration: "30 Minutes",
      description: "Violent stomach cramps and nausea. -2 penalty to physical rolls."
    }
  },
  {
    _id: "dccdeb0000000008",
    name: "Stiff Legs",
    type: "debuff",
    img: "icons/svg/hazard.svg",
    severity: "Minor",
    description: "Muscles or joints frozen. Movement speed reduced by 50% and -2 Dexterity.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "dex", value: -2 }],
      damageModifiers: [],
      duration: "Combat",
      description: "Muscles or joints frozen. Movement speed reduced by 50% and -2 Dexterity."
    }
  },
  {
    _id: "dccdeb0000000009",
    name: "The Taint",
    type: "debuff",
    img: "icons/svg/skull.svg",
    severity: "Major",
    description: "Permanent dungeon corruption or creeping necrotic rot eating away at vitality.",
    system: {
      severity: "Major",
      damageType: "Necrotic",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "con", value: -3 },
        { stat: "cha", value: -3 }
      ],
      damageModifiers: [],
      duration: "Permanent",
      description: "Permanent dungeon corruption or creeping necrotic rot eating away at vitality."
    }
  },
  {
    _id: "dccdeb0000000010",
    name: "Sore as Shit",
    type: "debuff",
    img: "icons/svg/falling.svg",
    severity: "Minor",
    description: "Every muscle aches after a brutal encounter. -1 to all physical stat checks.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "str", value: -1 },
        { stat: "dex", value: -1 },
        { stat: "con", value: -1 }
      ],
      damageModifiers: [],
      duration: "Rest",
      description: "Every muscle aches after a brutal encounter. -1 to all physical stat checks."
    }
  },
  {
    _id: "dccdeb0000000011",
    name: "Muted",
    type: "debuff",
    img: "icons/svg/silenced.svg",
    severity: "Minor",
    description: "Vocal cords silenced or magically sealed. Unable to speak or cast verbal spells.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "cha", value: -2 }],
      damageModifiers: [],
      duration: "10 Minutes",
      description: "Vocal cords silenced or magically sealed. Unable to speak or cast verbal spells."
    }
  },
  {
    _id: "dccdeb0000000012",
    name: "Bleeding",
    type: "debuff",
    img: "icons/svg/blood.svg",
    severity: "Minor",
    description: "Active open wound leaking blood each turn.",
    system: {
      severity: "Minor",
      damageType: "Slashing",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "con", value: -1 }],
      damageModifiers: [],
      duration: "Combat",
      description: "Active open wound leaking blood each turn."
    }
  },
  {
    _id: "dccdeb0000000013",
    name: "Frozen",
    type: "debuff",
    img: "icons/svg/ice-cube.svg",
    severity: "Minor",
    description: "Deep chill numbing limbs and slowing reactions. -2 Dexterity.",
    system: {
      severity: "Minor",
      damageType: "Ice",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "dex", value: -2 }],
      damageModifiers: [],
      duration: "Combat",
      description: "Deep chill numbing limbs and slowing reactions. -2 Dexterity."
    }
  },
  {
    _id: "dccdeb0000000014",
    name: "Crippled",
    type: "debuff",
    img: "icons/svg/broken-bone.svg",
    severity: "Major",
    description: "Severely broken limb or torn tendon. -4 Dexterity and -2 Strength.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "dex", value: -4 },
        { stat: "str", value: -2 }
      ],
      damageModifiers: [],
      duration: "Until Treated",
      description: "Severely broken limb or torn tendon. -4 Dexterity and -2 Strength."
    }
  },
  {
    _id: "dccdeb0000000015",
    name: "Minor Injury",
    type: "debuff",
    img: "icons/svg/wound.svg",
    severity: "Minor",
    description: "Laceration, sprain, or surface burn impairing physical actions.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [{ stat: "con", value: -1 }],
      damageModifiers: [],
      duration: "Rest",
      description: "Laceration, sprain, or surface burn impairing physical actions."
    }
  },
  {
    _id: "dccdeb0000000016",
    name: "Major Injury",
    type: "debuff",
    img: "icons/svg/trauma.svg",
    severity: "Major",
    description: "Severe compound fracture, punctured organ, or massive trauma. -3 to all stats.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [
        { stat: "str", value: -3 },
        { stat: "dex", value: -3 },
        { stat: "con", value: -3 }
      ],
      damageModifiers: [],
      duration: "Until Med-Bay",
      description: "Severe compound fracture, punctured organ, or massive trauma. -3 to all stats."
    }
  }
];
