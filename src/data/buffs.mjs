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
 * Common Canonical Debuffs for quick lookup and reference
 */
export const DCC_DEBUFFS = [
  { name: "Burned", severity: "Minor", description: "Takes periodic fire damage." },
  { name: "Shocked", severity: "Minor", description: "Disadvantage on Dex-based checks." },
  { name: "Poisoned", severity: "Minor", description: "Disadvantage on physical checks." },
  { name: "Held", severity: "Major", description: "Incapacitated and cannot move or act." },
  { name: "Stunned", severity: "Major", description: "Cannot take actions or reactions." },
  { name: "Woozy", severity: "Minor", description: "-2 penalty to attack and perception rolls." },
  { name: "Queasy", severity: "Minor", description: "-2 penalty to physical rolls." },
  { name: "Stiff Legs", severity: "Minor", description: "Movement speed reduced by 50%." },
  { name: "The Taint", severity: "Major", description: "Permanent corruption or necrosis." },
  { name: "Sore as Shit", severity: "Minor", description: "-1 to all physical stat checks." },
  { name: "Muted", severity: "Minor", description: "Unable to speak or cast vocal spells." },
  { name: "Minor Injury", severity: "Minor", description: "Impairment to a limb or organ." },
  { name: "Major Injury", severity: "Major", description: "Severe impairment or broken bone." }
];
