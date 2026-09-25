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
  // --- Canonical Debuffs from Table 11 & System Rules (30 items: 27 Table 11 + 3 Unmatched) ---
  {
    _id: "dccdeb0000000001",
    name: "Burned",
    type: "debuff",
    img: "icons/svg/fire.svg",
    severity: "Minor",
    description: "You take 1d10+F Fire damage at the end of each round.",
    system: {
      severity: "Minor",
      damageType: "Fire",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of combat or 5 minutes. As an Action, a victim may perform a Dex Stat Check to extinguish the flames.",
      description: "You take 1d10+F Fire damage at the end of each round."
    }
  },
  {
    _id: "dccdeb0000000002",
    name: "Shocked",
    type: "debuff",
    img: "icons/svg/lightning.svg",
    severity: "Minor",
    description: "You lose your next Action.",
    system: {
      severity: "Minor",
      damageType: "Electric",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Once you forfeit that Action.",
      description: "You lose your next Action."
    }
  },
  {
    _id: "dccdeb0000000003",
    name: "Poisoned",
    type: "debuff",
    img: "icons/svg/poison.svg",
    severity: "Minor",
    description: "You take 1d8+F Poison damage at the end of each round. Stackable.",
    system: {
      severity: "Minor",
      damageType: "Poison",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until treated with an antidote.",
      description: "You take 1d8+F Poison damage at the end of each round. Stackable."
    }
  },
  {
    _id: "dccdeb0000000004",
    name: "Held",
    type: "debuff",
    img: "icons/svg/net.svg",
    severity: "Major",
    description: "You are actively being held. You can’t use Move Actions or take a Step but may still twist your body to Evade. Attacks against a Held foe are made with Advantage.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until you are released by whatever is holding you, or you escape. Make a Str-Opposed Escape Artist Skill Check. If not physically held, it is Unopposed.",
      description: "You are actively being held. You can’t use Move Actions or take a Step but may still twist your body to Evade. Attacks against a Held foe are made with Advantage."
    }
  },
  {
    _id: "dccdeb0000000005",
    name: "Stunned",
    type: "debuff",
    img: "icons/conditions/stunned.webp",
    severity: "Minor",
    description: "You gain Disadvantage on your next Check.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Once you make a Check.",
      description: "You gain Disadvantage on your next Check."
    }
  },
  {
    _id: "dccdeb0000000006",
    name: "Woozy",
    type: "debuff",
    img: "icons/svg/sleep.svg",
    severity: "Minor",
    description: "You can’t add your Dex Mod to Attack or Evade Checks.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the next round.",
      description: "You can’t add your Dex Mod to Attack or Evade Checks."
    }
  },
  {
    _id: "dccdeb0000000007",
    name: "Queasy",
    type: "debuff",
    img: "icons/svg/acid.svg",
    severity: "Minor",
    description: "If your next Action requires a roll, it’s made with Disadvantage.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "At the end of the next Action you take.",
      description: "If your next Action requires a roll, it’s made with Disadvantage."
    }
  },
  {
    _id: "dccdeb0000000008",
    name: "Stiff Legs",
    type: "debuff",
    img: "icons/svg/hazard.svg",
    severity: "Minor",
    description: "You can’t take 10ft Steps.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the combat or 5 minutes.",
      description: "You can’t take 10ft Steps."
    }
  },
  {
    _id: "dccdeb0000000009",
    name: "The Taint",
    type: "debuff",
    img: "icons/svg/skull.svg",
    severity: "Major",
    description: "You can’t be healed.",
    system: {
      severity: "Major",
      damageType: "Necrotic",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of combat or 5 minutes.",
      description: "You can’t be healed."
    }
  },
  {
    _id: "dccdeb0000000010",
    name: "Sore as Shit",
    type: "debuff",
    img: "icons/svg/falling.svg",
    severity: "Minor",
    description: "You suffer a −1 penalty to all rolls.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of 1 hour.",
      description: "You suffer a −1 penalty to all rolls."
    }
  },
  {
    _id: "dccdeb0000000011",
    name: "Muted",
    type: "debuff",
    img: "icons/svg/silenced.svg",
    severity: "Minor",
    description: "You can’t speak or cast Spells.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the combat or 5 minutes.",
      description: "You can’t speak or cast Spells."
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
    description: "You take a −2 penalty to all Checks. Gaining a Minor Injury a second time changes it to a Long-Term Minor Injury.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of a short rest.",
      description: "You take a −2 penalty to all Checks. Gaining a Minor Injury a second time changes it to a Long-Term Minor Injury."
    }
  },
  {
    _id: "dccdeb0000000016",
    name: "Major Injury",
    type: "debuff",
    img: "icons/svg/trauma.svg",
    severity: "Major",
    description: "You take a −5 penalty to all Checks. Gaining a Major Injury a second time changes it to a Long-Term Major Injury.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of a long rest.",
      description: "You take a −5 penalty to all Checks. Gaining a Major Injury a second time changes it to a Long-Term Major Injury."
    }
  },
  {
    _id: "dccdeb0000000017",
    name: "Blinded",
    type: "debuff",
    img: "icons/conditions/blinded.webp",
    severity: "Minor",
    description: "Roll all Skill Checks that require sight with Disadvantage.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the next round.",
      description: "Roll all Skill Checks that require sight with Disadvantage."
    }
  },
  {
    _id: "dccdeb0000000018",
    name: "Blood Trail",
    type: "debuff",
    img: "icons/conditions-2/status_dotbleed.webp",
    severity: "Minor",
    description: "You take 1d6+F at the end of each round. Stackable.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until cured with a bandage or a First Aid Skill Check.",
      description: "You take 1d6+F at the end of each round. Stackable."
    }
  },
  {
    _id: "dccdeb0000000019",
    name: "Drowning",
    type: "debuff",
    img: "icons/spells/wall-of-water.webp",
    severity: "Major",
    description: "You take 1d6+F damage at the end of each round.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until your head is above water.",
      description: "You take 1d6+F damage at the end of each round."
    }
  },
  {
    _id: "dccdeb0000000020",
    name: "Dying",
    type: "debuff",
    img: "icons/conditions/dying.webp",
    severity: "Major",
    description: "You are at 0% HB. Your Con Mod is how many rounds you have before you die. Subtract 1 from this countdown value at the end of each round. Additionally, each time a Dying Crawler would take damage from any source, they instead subtract 1 from the countdown value.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until you die or heal at least 1 HB slot.",
      description: "You are at 0% HB. Your Con Mod is how many rounds you have before you die. Subtract 1 from this countdown value at the end of each round. Additionally, each time a Dying Crawler would take damage from any source, they instead subtract 1 from the countdown value."
    }
  },
  {
    _id: "dccdeb0000000021",
    name: "Enraged",
    type: "debuff",
    img: "icons/conditions-2/status_rage.webp",
    severity: "Minor",
    description: "You are in a state of extreme uncontrolled fury. You may only perform Attack and Move Actions.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of 2 rounds or 20 seconds.",
      description: "You are in a state of extreme uncontrolled fury. You may only perform Attack and Move Actions."
    }
  },
  {
    _id: "dccdeb0000000022",
    name: "Fatigued",
    type: "debuff",
    img: "icons/conditions/fatigued.webp",
    severity: "Minor",
    description: "You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of a long rest.",
      description: "You have a −1 penalty on all Checks and your Move is halved. Stackable. Until the end of a long rest."
    }
  },
  {
    _id: "dccdeb0000000023",
    name: "Long-Term Major Injury",
    type: "debuff",
    img: "icons/conditions/wounded.webp",
    severity: "Major",
    description: "You take a −5 penalty to all Checks.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of a full day of rest.",
      description: "You take a −5 penalty to all Checks."
    }
  },
  {
    _id: "dccdeb0000000024",
    name: "Long-Term Minor Injury",
    type: "debuff",
    img: "icons/conditions/wounded.webp",
    severity: "Minor",
    description: "You take a −2 penalty to all Checks.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of a long rest.",
      description: "You take a −2 penalty to all Checks."
    }
  },
  {
    _id: "dccdeb0000000025",
    name: "Paralyzed",
    type: "debuff",
    img: "icons/conditions/paralyzed.webp",
    severity: "Major",
    description: "You can’t take any Actions.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the next round.",
      description: "You can’t take any Actions."
    }
  },
  {
    _id: "dccdeb0000000026",
    name: "Sepsis",
    type: "debuff",
    img: "icons/conditions-2/status_dotpoison.webp",
    severity: "Major",
    description: "You’re Staggered (see below) and take 1d10+F Poison damage at the end of each round.",
    system: {
      severity: "Major",
      damageType: "Poison",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "As Staggered, and the damage continues until you’re healed.",
      description: "You’re Staggered (see below) and take 1d10+F Poison damage at the end of each round."
    }
  },
  {
    _id: "dccdeb0000000027",
    name: "Shit-Faced",
    type: "debuff",
    img: "icons/conditions/confused.webp",
    severity: "Minor",
    description: "You make all your Checks with Disadvantage.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of 10 minutes.",
      description: "You make all your Checks with Disadvantage."
    }
  },
  {
    _id: "dccdeb0000000028",
    name: "Staggered",
    type: "debuff",
    img: "icons/conditions/slowed.webp",
    severity: "Minor",
    description: "The next Action you take can’t be a Move, and if it is an Attack, its Check is made with Disadvantage. You can’t take a 10ft Step with your next Action.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "At the end of the next Action you take.",
      description: "The next Action you take can’t be a Move, and if it is an Attack, its Check is made with Disadvantage. You can’t take a 10ft Step with your next Action."
    }
  },
  {
    _id: "dccdeb0000000029",
    name: "Take Down",
    type: "debuff",
    img: "icons/conditions/prone.webp",
    severity: "Minor",
    description: "You fall prone. While prone, all Attacks made against you are made with Advantage.",
    system: {
      severity: "Minor",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Use your 10ft Step to stand.",
      description: "You fall prone. While prone, all Attacks made against you are made with Advantage."
    }
  },
  {
    _id: "dccdeb0000000030",
    name: "Terrified",
    type: "debuff",
    img: "icons/conditions/frightened.webp",
    severity: "Major",
    description: "You can’t take Move Actions or 10ft Steps. You make all Attacks with Disadvantage.",
    system: {
      severity: "Major",
      damageType: "",
      reductionPercent: 0,
      rounding: "up",
      statModifiers: [],
      damageModifiers: [],
      duration: "Until the end of the next round, or you take at least 1 HB slot damage.",
      description: "You can’t take Move Actions or 10ft Steps. You make all Attacks with Disadvantage."
    }
  }
];
