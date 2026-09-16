/**
 * Dungeon Crawler Carl RPG - Official Skills Dataset
 * Derived from the official DCC Combat & Exploration Action Quick Sheets and skills.txt.
 */

export const DCC_SKILLS = [
  // ==========================================
  // ATTACK SKILLS: STRIKE
  // ==========================================
  {
    _id: "dccskl0000000001",
    name: "Bite",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Strike",
      type: "Strike",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Limitations: The target must have an appendage you can clamp down onto. You taste your victim’s blood. Base Damage: 1d8 + Str Piercing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage. You may latch on to move when the foe moves during their next Action (then you let go).\nRank 15: +1d8 base damage, and the target gains the Woozy Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000002",
    name: "Back Claw",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Strike",
      type: "Strike",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Base Damage: 1d6 + Str Slashing.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage\nRank 15: +1d6 base damage, and the target gains the Blood Trail Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000003",
    name: "Slice Attack",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Strike",
      type: "Strike",
      category: "Combat",
      checkType: "Melee Attack, Dex",
      notes: "AI Favor: 1. Base Damage: 1d4 + Str Slashing.",
      upgrades: "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +2d4 base damage",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // ATTACK SKILLS: BASHING
  // ==========================================
  {
    _id: "dccskl0000000004",
    name: "Club",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Bashing",
      type: "Bashing",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Base Damage: 1d6 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and the target gains the Woozy Debuff.\nRank 15: +1d6 base damage, and if the target loses at least 3 Health Bar slots, they gain the Take Down Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000005",
    name: "Improvised Weapons",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Bashing",
      type: "Bashing",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "AI Favor: 1. Pick up something and smack someone else with it. Object must weigh at least 1 lb and no more than your Str in lbs. Base Damage: 1d4 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d4 base damage, and you can throw the item (using this Skill) up to a range of Rank ×5 feet.\nRank 10: +1d4 base damage, and you roll your first Attack each combat with Advantage.\nRank 15: +1d4 base damage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000006",
    name: "Warhammer",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Bashing",
      type: "Bashing",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Limitations: Requires two hands to wield. Base Damage: 1d10 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d10 base damage\nRank 10: +1d10 base damage\nRank 15: +1d10 base damage, and the target (of your size or smaller) is pushed 15 feet.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // ATTACK SKILLS: EDGE
  // ==========================================
  {
    _id: "dccskl0000000007",
    name: "Axe",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Edge",
      type: "Edge",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Base Damage: 1d6 + Str Slashing.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and you may make an extra free Attack with Disadvantage against another adjacent foe.\nRank 15: +1d6 base damage, and on an Amazing Success or better, sever an arm (disarming two-handed weapons).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000008",
    name: "Dagger",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Edge",
      type: "Edge",
      category: "Combat",
      checkType: "Melee Attack, Dex",
      notes: "AI Favor: 1. Base Damage: 1d4 + Str Piercing.",
      upgrades: "Rank 5: +1d4 base damage, and this Attack deals Armor-Piercing damage (ignores DR).\nRank 10: +1d4 base damage, and you can throw this weapon up to a range of Rank × 5 feet.\nRank 15: +1d4 base damage, and Attacks targeting the back deal ×2 damage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000009",
    name: "Longsword",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Edge",
      type: "Edge",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Base Damage: 1d8 + Str Slashing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage\nRank 15: +1d8 base damage, and you gain a +1 Evade Buff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000010",
    name: "Rapier",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Edge",
      type: "Edge",
      category: "Combat",
      checkType: "Melee Attack, Dex",
      notes: "Base Damage: 1d6 + Dex Piercing.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and you gain a +1 Evade Buff.\nRank 15: +1d6 base damage, and you gain a +1 Evade Buff.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // HAND-TO-HAND COMBAT SKILLS
  // ==========================================
  {
    _id: "dccskl0000000011",
    name: "Foot Soldier",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "AI Favor: 1 (only if no Damage Effect is used). Choose Powerful Strike or Smush Damage Effect before rolling to hit. Base Damage: 1d4 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage, and the target gains the Sore as Shit Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000012",
    name: "Noggin Nocker",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "AI Favor: 1 (only if no Damage Effect is used). Limitations: On Success, you lose 1 Health Bar slot. Choose Skullcracker or Powerful Strike. Base Damage: 1d4 + Con Bludgeoning.",
      upgrades: "Rank 5: +1d4 base damage, and you don’t take any damage from your own Attack.\nRank 10: +1d4 base damage, and add 1 Rank damage die.\nRank 15: +1d4 base damage, and the target gains the Woozy Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000013",
    name: "Pugilism",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Combat",
      checkType: "Melee Attack, Dex",
      notes: "AI Favor: 2 (only if no Damage Effect is used). Choose Dirty Fighting, Iron Punch, or Powerful Strike before rolling. Base Damage: 1d2 + Str Bludgeoning.",
      upgrades: "Rank 5: +2d2 base damage\nRank 10: +1d2 base damage\nRank 15: +1d2 base damage, and you may make an extra free Attack with Disadvantage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000014",
    name: "Unarmed Combat",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "AI Favor: 1. Limitations: Cannot choose a Damage Effect. Mixture of all strikes. Base Damage: 1d4 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +2d4 base damage",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000015",
    name: "Wrasslin",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "AI Favor: 1 (only if no Damage Effect is used). Limitations: Requires two hands. Choose Choke Out, Dirty Fighting, or Toss. On Success, target gains Held Debuff. Base Damage: 1d4 + Str Bludgeoning.",
      upgrades: "Rank 5: Maintain Held at no Action cost, but check to prevent escape is at Disadvantage.\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // HAND-TO-HAND DAMAGE EFFECT SKILLS
  // ==========================================
  {
    _id: "dccskl0000000016",
    name: "Choke Out",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Wrasslin' Damage Effect, Passive",
      notes: "Wrasslin' Damage Effect, Passive. If target is at 10% Health Bar or less, you deal ×2 total damage.",
      upgrades: "Rank 5: Activates at 20% Health Bar or less.\nRank 10: Activates at 40% Health Bar or less, deals ×4 total damage.\nRank 15: Activates at 80% Health Bar or less, deals ×8 total damage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000017",
    name: "Dirty Fighting",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Pugilism / Wrasslin' Damage Effect, Passive",
      notes: "Pugilism or Wrasslin' Damage Effect, Passive. If Attack is Critical Fail, lose 1 Popularity. Apply Woozy Debuff to target.",
      upgrades: "Rank 5: Also apply The Taint Debuff.\nRank 10: Also apply Blinded Debuff. No longer lose Popularity on Critical Fails.\nRank 15: Apply an immediate Minor Injury Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000018",
    name: "Iron Punch",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Pugilism Damage Effect, Passive",
      notes: "Pugilism Damage Effect, Passive. Deal +1d2 base damage.",
      upgrades: "Rank 5: Add 1 Rank damage die.\nRank 10: Choose to have target gain Stunned Debuff instead of rolling damage.\nRank 15: Add 1 Rank damage die, and target gains Stunned Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000019",
    name: "Powerful Strike",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Damage Effect, Passive",
      notes: "Foot Soldier, Noggin Nocker, or Pugilism Damage Effect. Cooldown: 30 hours. Multiply base damage dice by Rank in this Skill, then add modifiers.",
      upgrades: "Rank 5: Cooldown is 10 hours.\nRank 10: Cooldown is 5 hours.\nRank 15: Cooldown is 2 hours.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000020",
    name: "Skullcracker",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Noggin Nocker Damage Effect, Passive",
      notes: "Noggin Nocker Damage Effect, Passive. If target is same size as you, gain +1d4 base damage.",
      upgrades: "Rank 5: +1d4 base damage if target is same size.\nRank 10: If same size, add 1 Rank damage die and target gains Stunned Debuff.\nRank 15: Add 1 Rank damage die and target gains Blood Trail Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000021",
    name: "Smush",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Foot Soldier Damage Effect, Passive",
      notes: "Foot Soldier Damage Effect, Passive. Target must have 20% Health Bar or less. Cooldown: Once per round. Deal ×2 total damage.",
      upgrades: "Rank 5: Activates at 30% Health Bar or less and deals ×3 damage.\nRank 10: No cooldown.\nRank 15: Activates at 40% Health Bar or less and deals ×4 damage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000022",
    name: "Toss",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Hand to Hand",
      type: "Hand to Hand",
      category: "Passive",
      checkType: "Wrasslin' Damage Effect, Passive",
      notes: "Wrasslin' Damage Effect, Passive. Deal +1d8 base damage + Str Bludgeoning, end Held Debuff, and throw target 5 ft per 5 Ranks (min 5 ft). Only foes smaller than you.",
      upgrades: "Rank 5: Toss foes up to own size.\nRank 10: Toss foes one size larger.\nRank 15: +1d8 base damage, toss foes two sizes larger.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // RANGED WEAPON SKILLS
  // ==========================================
  {
    _id: "dccskl0000000023",
    name: "Bow",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 100 feet. Requires two hands and ammunition. Base Damage: 1d6 + Str Piercing.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, add 1 Rank damage die.\nRank 15: +1d6 base damage, and target gains Blood Trail Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000024",
    name: "Crossbow",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 50 feet. Requires two hands and ammunition. Cooldown: Once per round. Base Damage: 1d8 Piercing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, target gains Blood Trail Debuff.\nRank 15: +1d8 base damage, range is 100 feet.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000025",
    name: "Handgun",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 150 feet. Requires ammunition. Spend one Action to reload after Major Fail or worse. Base Damage: 1d8 Piercing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage\nRank 15: +1d8 base damage, target gains Staggered Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000026",
    name: "Javelin",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 40 feet. Base Damage: 1d8 + Str Piercing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, deals Armor-Piercing damage (ignores DR).\nRank 15: +1d8 base damage, range increases by Str in feet.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000027",
    name: "Shotgun",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 30 feet. Requires two hands and ammunition. Spend one Action to reload after Major Fail or worse. Base Damage: 1d10 Piercing.",
      upgrades: "Rank 5: +1d10 base damage\nRank 10: +1d10 base damage\nRank 15: +1d10 base damage, +5ft Splash.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000028",
    name: "Shuriken",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 30 feet. AI Favor: 1. Base Damage: 1d4 + Str Piercing.",
      upgrades: "Rank 5: +1d4 base damage, range is 40 feet.\nRank 10: +1d4 base damage, make an extra free attack with Disadvantage.\nRank 15: +1d4 base damage, make an extra free attack with Disadvantage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000029",
    name: "Slingshot",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Ranged Attack, Dex",
      notes: "Range: 30 feet. AI Favor: 2. Requires two hands. Base Damage: 1d2 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d2 base damage, range increases by Str in feet.\nRank 10: +1d2 base damage, add 1 Rank damage die.\nRank 15: +1d2 base damage, add 1 Rank damage die.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // REACH WEAPON SKILLS
  // ==========================================
  {
    _id: "dccskl0000000030",
    name: "Herding Weapons",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Reach",
      type: "Reach",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Range: 10 feet. AI Favor: 1. Requires two hands. Base Damage: 1d4 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d4 base damage, slide target 5 feet.\nRank 10: +1d4 base damage, can make a Sling attack with range 50 ft using Dex to hit.\nRank 15: +1d4 base damage, target gains Take Down Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000031",
    name: "Lance",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Reach",
      type: "Reach",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Range: 10 feet. Must be mounted. Cannot be used with Attack of Opportunity or Zone of Control. Base Damage: 1d12 + Str Piercing.",
      upgrades: "Rank 5: +1d12 base damage\nRank 10: +1d12 base damage, +1 damage per 10 ft mount moved this turn.\nRank 15: +1d12 base damage, +X damage (X = size of mount).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000032",
    name: "Polearm",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Reach",
      type: "Reach",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Range: 10 feet. Requires two hands. Base Damage: 1d8 + Str Piercing.",
      upgrades: "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, and +1 Rank in Zone of Control Skill.\nRank 15: +1d8 base damage, and +1 Rank in Zone of Control Skill.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000033",
    name: "Quarterstaff",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Reach",
      type: "Reach",
      category: "Combat",
      checkType: "Melee Attack, Str",
      notes: "Range: 10 feet. Requires two hands. Base Damage: 1d6 + Str Bludgeoning.",
      upgrades: "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and gain a +1 Evade Buff.\nRank 15: +1d6 base damage, and gain a +1 Evade Buff.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // GENERIC WEAPON GROUP SKILLS
  // ==========================================
  {
    _id: "dccskl0000000034",
    name: "Edged Weapons",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Edge",
      type: "Edge",
      category: "Combat",
      checkType: "Passive / Weapon Group",
      notes: "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Edge (Axe, Dagger, Longsword, Rapier).",
      upgrades: "Rank advances weapon mastery for all edged weapons.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000035",
    name: "Blunt Weapons",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Bashing",
      type: "Bashing",
      category: "Combat",
      checkType: "Passive / Weapon Group",
      notes: "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Bashing (Club, Improvised Weapons, Warhammer).",
      upgrades: "Rank advances weapon mastery for all blunt/bashing weapons.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000036",
    name: "Reach Weapons",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Reach",
      type: "Reach",
      category: "Combat",
      checkType: "Passive / Weapon Group",
      notes: "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Reach (Herding Weapons, Lance, Polearm, Quarterstaff).",
      upgrades: "Rank advances weapon mastery for all reach weapons.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000037",
    name: "Ranged Weapons",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Ranged",
      type: "Ranged",
      category: "Combat",
      checkType: "Passive / Weapon Group",
      notes: "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Ranged (Bow, Crossbow, Handgun, Javelin, Shotgun, Shuriken, Slingshot).",
      upgrades: "Rank advances weapon mastery for all ranged weapons.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000038",
    name: "Strike Weapons",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Strike",
      type: "Strike",
      category: "Combat",
      checkType: "Passive / Weapon Group",
      notes: "Generic mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Strike (Bite, Back Claw, Slice Attack).",
      upgrades: "Rank advances mastery for natural strike attacks.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // UTILITY SKILLS (SURVIVAL & EXPLORATION)
  // ==========================================
  {
    _id: "dccskl0000000039",
    name: "Acute Ears",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Passive",
      notes: "Improves hearing and allows crawler to see more Mobs on minimap in HUD.",
      upgrades: "Rank 5: Mob size and encounter history added to red dot.\nRank 10: Lower level Mobs cannot Ambush your party.\nRank 15: Mobs cannot Ambush your party.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000040",
    name: "Aiming",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Used only with Ranged Attacks. Add Ranks to Attack check if made with Disadvantage. On Success, add 1d4 to damage.",
      upgrades: "Rank 5: +1d4 damage\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000041",
    name: "Alchemy",
    type: "skill",
    img: "icons/svg/daze.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Used for crafting potions and poisons up to +5 bonus level.",
      upgrades: "Rank 5: Craft potions up to +10 bonus level.\nRank 10: Create additional potions without extra time.\nRank 15: Write the recipe for any potion you find.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000042",
    name: "Ambush",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check when Mob is approaching. On Success, gain a surprise Action before combat and attack with Advantage.",
      upgrades: "Rank 5: Add Ambush Rank damage die to Surprise Attack damage.\nRank 10: Party members roll this skill untrained normally.\nRank 15: Gain a second bonus surprise Action (non-Attack).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000043",
    name: "Animal Handling",
    type: "skill",
    img: "icons/svg/paw.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to calm, befriend, or guide animals.",
      upgrades: "Rank 5: Specialize in animal type (Advantage). Gain bonus surprise Action.\nRank 10: Pet bonding takes half time.\nRank 15: Can have up to two pets.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000044",
    name: "Arcane",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "General knowledge of magic; identify whether items are magical.",
      upgrades: "Rank 5: Determine Rank and bonus level of magical items.\nRank 10: Imbue items with inherent spells at Arcanist Table.\nRank 15: Default cooldown of imbued spells is 3 hours.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000045",
    name: "Attack of Opportunity",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Passive, Interrupt",
      notes: "Requires single-handed melee weapon (range <= 5 ft). When foe leaves adjacent space (except Step), spend Action to make Attack as Interrupt.",
      upgrades: "Rank 5: If foe moves into adjacent space, they must stop.\nRank 10: Foe Step no longer prevents this ability.\nRank 15: Roll Attack check with Advantage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000046",
    name: "Backfire",
    type: "skill",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Compensated Anarchist Class only. Neutralize (10 min) and deconstruct (1 hr) traps without Sapper's Table.",
      upgrades: "Rank 5: Identify placement time; neutralize takes 5 min.\nRank 10: Identify creation time; deconstruct takes 30 min.\nRank 15: Identify trap designer; deconstruct takes 15 min.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000047",
    name: "Balance",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Traverse tricky surfaces with general ease.",
      upgrades: "Rank 5: Move Actions in difficult terrain without penalty.\nRank 10: Avoid Take Down or involuntary Move as free Interrupt.\nRank 15: Step on vertical surfaces.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000048",
    name: "Basic Science",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Conduct experiments involving chemistry, physics, or biology (takes 2 hours).",
      upgrades: "Rank 5: Experiments take 1 hour.\nRank 10: Choose specialty; roll with Advantage.\nRank 15: Experiments take 30 minutes.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000049",
    name: "Bomb Surgeon",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Deconstruct explosive and smoke bombs (takes 1 hour).",
      upgrades: "Rank 5: Takes 30 minutes.\nRank 10: Never make Explosives Handling check when using this skill.\nRank 15: Round dice up when cutting dynamite; takes 15 minutes.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000050",
    name: "Calligraphy",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Make documents look super elegant and official.",
      upgrades: "Rank 5: Advantage on next Cha check vs recipient.\nRank 10: Craft scrolls as if a crafting skill.\nRank 15: Once per floor, craft scroll for spell seen within 2 hours.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000051",
    name: "Cartography",
    type: "skill",
    img: "icons/svg/direction.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Map dungeon and figure out locations in relation to landmarks.",
      upgrades: "Rank 5: Return from whence you came quickly.\nRank 10: Provide Advantage die to Tracking or spatial relation checks.\nRank 15: Navigate point A to point B via most direct path.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000052",
    name: "Cat-Like Reflexes",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Stat Check",
      notes: "Cat-based Races only. Gain +10ft Move. Use this check when making Dexterity Stat Checks.",
      upgrades: "Rank 5: Reduce Surprise Attack damage taken by Rank.\nRank 10: Reduce all Area damage by 50%.\nRank 15: +10ft Move, +1 Evade Buff, Advantage to Evade Held effects.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000053",
    name: "Catcher",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Passive, Interrupt",
      notes: "When non-Area Attack damages an adjacent ally, leap in and take damage instead. Can take 10ft Step before.",
      upgrades: "Rank 5: Gain +5 DR when using this Skill.\nRank 10: Gain +5 DR when using this Skill.\nRank 15: Gain +5 DR and ignore attached Debuffs.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000054",
    name: "Cesta Punta",
    type: "skill",
    img: "icons/svg/d20.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Stat Check",
      notes: "Acquired via Earth Hobby Potion. Play jai alai or throw things that fit in the xistera.",
      upgrades: "Rank 5: Throw range Str × 20 feet.\nRank 10: Add 1 Rank damage die to thrown Attacks.\nRank 15: Throw range Str × 30 feet.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000055",
    name: "Character Actor",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive, Charisma",
      notes: "Former Child Actor only. Choose new Class randomly each floor and gain listed abilities on 1d2 = 2.",
      upgrades: "Rank 5: Random Classes increase in rarity and power.\nRank 10: Skill Ranks in granted skills persist across floors.\nRank 15: Choose Class from any available.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000056",
    name: "Chopper Pilot",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Piloting motorcycles. Disadvantage on Attacks while piloting; cannot use two-handed weapons.",
      upgrades: "Rank 5: Chopper has +5ft Move.\nRank 10: Attacking while piloting no longer suffers Disadvantage.\nRank 15: Chopper has +5ft Move; Advantage on crazy stunts.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000057",
    name: "Climbing",
    type: "skill",
    img: "icons/svg/stone-path.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Make check every minute during dangerous climbs. Attacking while climbing suffers Disadvantage.",
      upgrades: "Rank 5: Check every 5 minutes.\nRank 10: Check every 10 minutes; no Disadvantage on Attacks.\nRank 15: Check every 15 minutes; party rolls untrained normally.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000058",
    name: "Cockroach",
    type: "skill",
    img: "icons/svg/aura.svg",
    system: {
      rank: 0,
      stat: "con",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "When Attack drops you to 0% Health Bar, roll Unopposed. On Success, drop to 10% instead. Cooldown: Once per scene.",
      upgrades: "Rank 5: No check required.\nRank 10: Health Bar unaffected by damage that would drop to 0%.\nRank 15: Cooldown twice per scene. Heal to 100% and gain +Rank DR for 1 round.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000059",
    name: "Cooking",
    type: "skill",
    img: "icons/svg/heal.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Prepare edible food for party in 1 hour.",
      upgrades: "Rank 5: Takes 30 minutes with makeshift ingredients.\nRank 10: Diners gain 'You are full!' Buff (heal 2 HB slots/hr).\nRank 15: 'You are full!' Buff ends Debuffs if dropping to 10% HB.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000060",
    name: "Deception",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to obscure truth and lie. Disadvantage if target has Detect Lies.",
      upgrades: "Rank 5: Usable while gambling.\nRank 10: Usable to forge documents.\nRank 15: If failed, perform one Action before foes react.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000061",
    name: "Detect Lies",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Cha-Opposed check to sense bullshit and lies. Disadvantage if target has Deception.",
      upgrades: "Rank 5: Ignore effects of Major Fail.\nRank 10: Ignore effects of Critical Fail.\nRank 15: Detect lies in text and audio without seeing speaker.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000062",
    name: "Detect Trap",
    type: "skill",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Detect active non-magic traps. Disadvantage when scanning entire room or while moving.",
      upgrades: "Rank 5: Detect magical traps.\nRank 10: No Disadvantage when scanning broadly or moving.\nRank 15: Party gains Advantage on first check to avoid detected trap.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000063",
    name: "Determine Value",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Sort HUD Inventory by item value. Advances only by magical means.",
      upgrades: "Rank 5: Inventory tabbed by item type with usage history.\nRank 10: Determine loot box origin.\nRank 15: Gold value of new items displayed on pickup.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000064",
    name: "Diplomacy",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check for mediation between opposing parties.",
      upgrades: "Rank 5: Advantage if not a member of either party.\nRank 10: Parties accept consequences for breaking deal.\nRank 15: Hostilities cease for remainder of the day.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000065",
    name: "Dodge",
    type: "skill",
    img: "icons/svg/wing.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Gain +1 Evade Buff.",
      upgrades: "Rank 5: +1 Evade Buff, Step additional 5 ft when Evading.\nRank 10: +2 Evade Buff, Advantage to Evade Spells and Ranged Attacks.\nRank 15: +2 Evade Buff, Evade Action costs no Action in combat.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000066",
    name: "Double Tap",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Declare at start of round; use all Actions to Attack single target. If 1st Attack is Amazing Success+, 2nd is upgraded to Critical Hit.",
      upgrades: "Rank 5: First Attack made with Advantage.\nRank 10: 2nd Attack upgrades to Crit on Standard Success+.\nRank 15: 2nd Attack with Advantage; deals ×3 damage on Crit.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000067",
    name: "Driving",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Operate four-wheeled vehicles in extreme circumstances.",
      upgrades: "Rank 5: No Disadvantage when attacking while driving.\nRank 10: Vehicle has +5ft Move; Advantage to Evade vehicle attacks.\nRank 15: Vehicle has +5ft Move; Advantage on extreme stunts.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000068",
    name: "Dumpster Diving",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Scrounge clutter and junk piles (takes 1 hour per 50ft area).",
      upgrades: "Rank 5: Find 1 Rank damage die's worth of Misc Junk.\nRank 10: Takes 30 minutes; additional item on Crit.\nRank 15: Takes 10 minutes; additional item on Amazing Success.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000069",
    name: "Endurance",
    type: "skill",
    img: "icons/svg/aura.svg",
    system: {
      rank: 0,
      stat: "con",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Prevent fatigue and avoid Fatigued Debuff during long-distance travel and grinding.",
      upgrades: "Rank 5: Ignore effects of Major Fail.\nRank 10: Advantage if not Fatigued or in extreme conditions.\nRank 15: Critical Fail converted to Standard Fail.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000070",
    name: "Engineering",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Design and build mechanisms with moving parts, fluids, or chemicals out of Misc Junk.",
      upgrades: "Rank 5: Specialize in mundane item type with Advantage.\nRank 10: Craft specialty item with +1 bonus level enchantment.\nRank 15: Craft up to +2 bonus level enchantment; takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000071",
    name: "Escape Plan",
    type: "skill",
    img: "icons/svg/direction.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "HUD reveals hidden doors and passages. Advances only by magical means.",
      upgrades: "Rank 5: Access system-concealed displays and Dungeon Locator signs.\nRank 10: Read hidden sigils used to direct Mob movement.\nRank 15: Read hidden messages and redactions in dungeon documents.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000072",
    name: "Escape Artist",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed / Opposed",
      notes: "Escape bonds (Unopposed) or escape being Held (Str-Opposed).",
      upgrades: "Rank 5: Escape unseen and take unseen Step.\nRank 10: Party rolls untrained normally.\nRank 15: Immediately take an Action with Advantage upon slipping out.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000073",
    name: "Explosives Handling",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Safely prime, disarm, or manage explosive devices.",
      upgrades: "Rank 5: Determine type, status, and raw materials of explosives.\nRank 10: Craft explosives with Sapper's Table.\nRank 15: Create explosive raw materials out of non-volatile materials; takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000074",
    name: "Fabricate",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Craft generic mundane items with no moving parts wholly out of Misc Junk.",
      upgrades: "Rank 5: Specialize in mundane item with Advantage.\nRank 10: Craft specialty item with +1 bonus level enchantment.\nRank 15: Craft with up to +2 bonus level enchantment; takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000075",
    name: "Find Crawler",
    type: "skill",
    img: "icons/svg/target.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "HUD displays other crawlers within 1,000 ft with a blue dot.",
      upgrades: "Rank 5: Detection range increases to 5 miles.\nRank 10: Detection range increases to 10 miles.\nRank 15: Input crawler's name to learn exact location anywhere in dungeon.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000076",
    name: "Find Trap",
    type: "skill",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Traps within 5 feet appear on HUD 1 second prior to triggering.",
      upgrades: "Rank 5: Traps appear on HUD up to 5 seconds before triggering.\nRank 10: Traps within 10 ft appear as you approach.\nRank 15: Traps within 15 ft appear as you approach.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000077",
    name: "First Aid",
    type: "skill",
    img: "icons/svg/heal.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Provide medical aid. Patient regains 1 HB slot (+1 per higher degree of success). Once per rest.",
      upgrades: "Rank 5: Spend 5 min to heal Minor Injury Debuff.\nRank 10: Spend 10 min to heal Long-Term Minor Injury Debuff.\nRank 15: Regain +1 HB slot; spend 15 min to heal Major Injury Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000078",
    name: "Gear Head",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Build high-performance vehicle engines with Engine Stand attachment to Engineering Table.",
      upgrades: "Rank 5: Build custom vehicles with no bonus level limits.\nRank 10: +10ft Move per +1 Bonus Level; use as Repair for engines.\nRank 15: Cut engine/vehicle crafting time in half.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000079",
    name: "Goblin Explosives",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Safely use Goblin Explosives. Critical Fails occur on Natural 1–4.",
      upgrades: "Rank 5: Critical Fail on Nat 3-; determine type and status.\nRank 10: Critical Fail on Nat 2-; craft explosives with Sapper's Table.\nRank 15: Critical Fail on Nat 1 as usual; create raw materials.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000080",
    name: "Good First Impression",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check when encountering neutral NPC/Mob. Mob approaches with wary curiosity.",
      upgrades: "Rank 5: Lower level Mob won't attack party unless attacked.\nRank 10: Up to double level won't attack unless provoked.\nRank 15: Group of Mobs up to double level won't attack unless provoked.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000081",
    name: "Improvised Explosive Device",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Manipulate explosive material into bombs and traps without a Sapper's Table.",
      upgrades: "Rank 5: Crafting takes half time.\nRank 10: Devices deal d10s of damage instead of d6s.\nRank 15: Devices can be set to trigger only against a specific Mob/NPC/crawler.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000082",
    name: "Hide in Shadows",
    type: "skill",
    img: "icons/svg/blind.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to become invisible to Mobs and HUDs while stationary in shadows or behind cover.",
      upgrades: "Rank 5: Usable in dim light without cover.\nRank 10: Party rolls untrained normally.\nRank 15: Usable in lightly shaded area; can Step without breaking stealth.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000083",
    name: "Incendiary Device Handling",
    type: "skill",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Safely handle and deploy incendiary devices.",
      upgrades: "Rank 5: Determine type, status, and raw materials.\nRank 10: Craft incendiary devices with Sapper's Table.\nRank 15: Add +5 Splash at no added Difficulty; takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000084",
    name: "Infusion",
    type: "skill",
    img: "icons/svg/daze.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Infuse potion bonuses onto consumable items (e.g. Invisibility smoke bomb).",
      upgrades: "Rank 5: One potion infuses 2 items at once.\nRank 10: One potion infuses 5 items at once.\nRank 15: One potion infuses 10 items at once.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000085",
    name: "Intimidate",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Cha-Opposed check to scare foe. On Success, target gains Staggered Debuff.",
      upgrades: "Rank 5: Target can only move away until end of next round.\nRank 10: Target also gains Woozy Debuff.\nRank 15: Target drops held items and gains Paralyzed Debuff.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000086",
    name: "Investigation",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Analyze environmental puzzle or clue area (takes 10 min, or 1 Action with Look for Clues).",
      upgrades: "Rank 5: Advantage if familiar with area.\nRank 10: Each attempt takes 5 minutes.\nRank 15: Advantage if you know the parties involved.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000087",
    name: "Iron Stomach",
    type: "skill",
    img: "icons/svg/aura.svg",
    system: {
      rank: 0,
      stat: "con",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Eat magic items! On Amazing Success+, gain 1 permanent Intelligence.",
      upgrades: "Rank 5: On Crit, gain +1 additional permanent Int.\nRank 10: Standard Success+ grants +1 permanent Int; eat cursed items safely.\nRank 15: Choose which Stat is permanently increased.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000088",
    name: "Jumping",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "With running start of 10 ft, leap distance up to Rank + Str ft with height 1 ft.",
      upgrades: "Rank 5: Add Dex to height of Jump.\nRank 10: Gain +1 Evade Buff.\nRank 15: Leap distance is Rank + (Str × 2).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000089",
    name: "Leadership",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to coordinate multiple parties against Bosses. Advantage on first Attack.",
      upgrades: "Rank 5: Extend free Call a Play to group Quest members.\nRank 10: Party members may perform a free Move Action.\nRank 15: Party members may perform a free Evade Action.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000090",
    name: "Light on Your Feet",
    type: "skill",
    img: "icons/svg/paw.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Animals only. Leap distance up to Rank × 2 with height Dex × 2 ft.",
      upgrades: "Rank 5: Distance Rank × 3, height Dex × 3.\nRank 10: Leap straight up without arcing trajectory.\nRank 15: Leap may last Rank in seconds (gliding).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000091",
    name: "Lockpicking",
    type: "skill",
    img: "icons/svg/padlock.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Pick mechanical locks (takes Floor number in minutes). Disadvantage without proper tools.",
      upgrades: "Rank 5: Make no noise and leave no trace.\nRank 10: Takes half time; alter lock so key no longer works.\nRank 15: No Disadvantage when lacking tools.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000092",
    name: "Lore",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Know neighborhood lore, Mob quirks, and local factions.",
      upgrades: "Rank 5: Identify major factions in the area.\nRank 10: Aware of important local NPCs.\nRank 15: Advantage on first Cha check when encountering organized group.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000093",
    name: "Negotiation",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Spend 5 min haggling price 10% in favor with merchant. Disadvantage with non-merchants.",
      upgrades: "Rank 5: Party members also buy/sell at negotiated price.\nRank 10: Price adjusted an additional 10% in favor.\nRank 15: Price adjusted an additional 15% in favor.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000094",
    name: "Pathfinder",
    type: "skill",
    img: "icons/svg/direction.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "HUD map zooms out with thought by multiplier equal to Rank.",
      upgrades: "Rank 5: Notified when near saferoom or stairwell.\nRank 10: See through HUD map while open.\nRank 15: Mobs appear as red dots on HUD map.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000095",
    name: "Perception",
    type: "skill",
    img: "icons/svg/eye.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Concentrate senses to notice hidden details and environmental cues. Used with Look for Clues.",
      upgrades: "Rank 5: Halve penalty for cluttered areas.\nRank 10: Halve penalty for short notice window.\nRank 15: Halve penalty for distance range.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000096",
    name: "Performance",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Electrify an audience through acting, dancing, singing, or comedy.",
      upgrades: "Rank 5: Choose additional performance specialty.\nRank 10: Coach others so they roll unskilled without Disadvantage.\nRank 15: Mimic another's performance after seeing it once.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000097",
    name: "Persuasion",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check after 10 min schmoozing to convince target to follow suggestion.",
      upgrades: "Rank 5: Follow suggestion even if costly.\nRank 10: Follow suggestion even if dangerous.\nRank 15: Follow suggestion even if against their nature.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000098",
    name: "Regeneration",
    type: "skill",
    img: "icons/svg/regen.svg",
    system: {
      rank: 0,
      stat: "con",
      skillType: "Utility",
      type: "Utility",
      category: "Passive",
      checkType: "Passive",
      notes: "Heal 1 Health Bar slot at start of each round (if Rank >= Con) or every other round.",
      upgrades: "Rank 5: Minor Injury ends after 5 min; Major Injury ends after 10 min.\nRank 10: Long-Term Minor ends after 20 min; Long-Term Major ends after 1 hr.\nRank 15: Time required to end injury debuffs halved.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000099",
    name: "Religion",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Understand gods, rituals, boons, and followers.",
      upgrades: "Rank 5: Identify followers on sight even when concealed.\nRank 10: Know how to sow discord among religion's followers.\nRank 15: Know specific strengths and weaknesses of gods.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000100",
    name: "Repair",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Spend 2 hours to repair simple broken or damaged items.",
      upgrades: "Rank 5: Repair things with moving parts.\nRank 10: Repairs take 1 hour.\nRank 15: Rebuild destroyed items.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000101",
    name: "Ropework",
    type: "skill",
    img: "icons/svg/stone-path.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Tie secure knots, bind prisoners, and manage ropes.",
      upgrades: "Rank 5: Use as Attack (range 10 ft vs Evade); target gains Held Debuff.\nRank 10: Whip line to untie knot from distance and recover rope.\nRank 15: Attack range increases to Strength score (min 15 ft).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000102",
    name: "Riding",
    type: "skill",
    img: "icons/svg/paw.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Control living mounts during action and combat scenes. Rider attacks with Disadvantage.",
      upgrades: "Rank 5: Mount has +5ft Move; no Disadvantage on Attacks while riding.\nRank 10: Mount has +10ft Move; party rolls untrained normally.\nRank 15: Mount has +15ft Move; Advantage on extreme stunts.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000103",
    name: "Running",
    type: "skill",
    img: "icons/svg/wingfoot.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Short bursts of running and emergency sprints. Check every minute; +1 per 10ft Move.",
      upgrades: "Rank 5: Permanent +5ft Move Buff; check every 2 minutes.\nRank 10: Additional permanent +10ft Move Buff; check every 4 minutes.\nRank 15: Additional permanent +15ft Move Buff; check every 6 minutes.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000104",
    name: "Salvage",
    type: "skill",
    img: "icons/svg/chest.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Collect useful materials from deconstructed or failed craft items (takes 1 hour).",
      upgrades: "Rank 5: Salvage checks take 30 minutes.\nRank 10: Recover 100% of important raw materials on Success.\nRank 15: On crafting Fail or Near Miss, reroll with Advantage (extra 15 min).",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000105",
    name: "Scutelliphily",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Collect, identify, sew, and iron patches onto clothing.",
      upgrades: "Rank 5: Sew and iron patches onto clothing.\nRank 10: Craft enchanted patches (1 per gear slot, no accessory slot cost).\nRank 15: Takes half time; bonus value of patch enchantments increased by +1.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000106",
    name: "Shield Block",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed, Interrupt",
      notes: "Requires shield. Spend 1 Action to make Shield Block check vs Mob to-hit. On Success, take half damage before DR.",
      upgrades: "Rank 5: Usable against Spells and magical damage.\nRank 10: On Crit, make free Shield Bash Interrupt Attack (3d6 + Str Bludgeoning).\nRank 15: +1d6 Shield Bash damage; further reduce incoming damage by Str Mod.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000107",
    name: "Sleight of Hand",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to manipulate small objects without being spotted.",
      upgrades: "Rank 5: Pick pockets of NPCs and Mobs.\nRank 10: Plant items on targets.\nRank 15: Manipulate items up to half own size.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000108",
    name: "Smithing",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Forge mundane metal items, weapons, and armor.",
      upgrades: "Rank 5: Craft items up to +5 bonus level.\nRank 10: Craft items up to +10 bonus level.\nRank 15: Smithing takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000109",
    name: "Stealth",
    type: "skill",
    img: "icons/svg/blind.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed",
      notes: "Int-Opposed check to move undetected. Success before combat grants 1 non-Attack Action.",
      upgrades: "Rank 5: Surprise Action can be an Attack with Advantage.\nRank 10: Party rolls untrained normally.\nRank 15: Take full Move and Step; deal ×2 base damage dice on Surprise Attack.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000110",
    name: "Streetwise",
    type: "skill",
    img: "icons/svg/cowled.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Navigate towns without attracting attention, contact criminal networks, and learn rumors.",
      upgrades: "Rank 5: Hear or spread an additional rumor.\nRank 10: Quickly locate a hiding place in town.\nRank 15: Uncover leverage on important person in town.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000111",
    name: "Survival",
    type: "skill",
    img: "icons/svg/cave.svg",
    system: {
      rank: 0,
      stat: "con",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Survive dangerous wilderness and harsh conditions unscathed.",
      upgrades: "Rank 5: No extra damage from Critical Fails.\nRank 10: Party rolls untrained normally.\nRank 15: No extra damage from Major Fails.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000112",
    name: "Swimming",
    type: "skill",
    img: "icons/svg/stone-path.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Swim in dangerous waters. Check every 30 seconds. Gain Fatigued Debuff after 1 min.",
      upgrades: "Rank 5: Fatigued Debuff delayed to 2 minutes.\nRank 10: Swim at full Move speed as Action.\nRank 15: Check every 5 minutes; Fatigued Debuff only on Critical Fail.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000113",
    name: "Tactics",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Limit once per combat. Grant self and party members +1 bonus to Attack, Damage, or Evade.",
      upgrades: "Rank 5: Advantage if observing battlefield 5 min prior to combat.\nRank 10: Roll 2d10 when you Call a Play (choose one).\nRank 15: Bonus applies to all three disciplines simultaneously.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000114",
    name: "Tattoo Artistry",
    type: "skill",
    img: "icons/svg/book.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Create mundane and magical tattoos.",
      upgrades: "Rank 5: Craft tattoos with up to +5 bonus level.\nRank 10: Craft tattoos with up to +10 bonus level.\nRank 15: Crafting tattoos takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000115",
    name: "Taunt",
    type: "skill",
    img: "icons/svg/sound.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Opposed, Interrupt",
      notes: "Int-Opposed check to redirect Mob Attack within 30 ft away from ally onto yourself.",
      upgrades: "Rank 5: Free Evade check against each taunted Attack.\nRank 10: Affect Mobs within 60 feet.\nRank 15: Free Evade checks against taunted Attacks rolled with Advantage.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000116",
    name: "Throwing",
    type: "skill",
    img: "icons/svg/d20.svg",
    system: {
      rank: 0,
      stat: "str",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed / Evade",
      notes: "Throw items up to Str × 10 ft. Area targeting is Unopposed; targeting foes is vs Evade.",
      upgrades: "Rank 5: Advantage when throwing to ally who wants to catch.\nRank 10: Choose direction on miss instead of rolling 1d8.\nRank 15: Throw range increases to Str × 20 feet.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000117",
    name: "Tracking",
    type: "skill",
    img: "icons/svg/direction.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Locate and follow footprints or trails. Renew check every 15 minutes.",
      upgrades: "Rank 5: Follow for 30 min per check; gain 1 target info.\nRank 10: Follow for 1 hr per check; gain 2 target info.\nRank 15: Follow for 2 hrs per check; gain 4 target info.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000118",
    name: "Trap Engineer",
    type: "skill",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 0,
      stat: "int",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Unopposed",
      notes: "Craft traps using a Sapper's Table with Trap Module.",
      upgrades: "Rank 5: Advantage when crafting non-explosive traps.\nRank 10: Traps can be set to trigger only against specific target.\nRank 15: Add +5 Splash to trap at no added Difficulty; takes half time.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000119",
    name: "Zone of Control",
    type: "skill",
    img: "icons/svg/sword.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Utility",
      checkType: "Passive, Interrupt",
      notes: "Requires Reach weapon. When enemy enters adjacent space for first time in round, spend 1 Action to make Interrupt Attack with Disadvantage.",
      upgrades: "Rank 5: Attack no longer made with Disadvantage.\nRank 10: Target is pushed 5 feet.\nRank 15: Attack check made with Advantage.",
      checked: false,
      damageModifiers: []
    }
  },

  // ==========================================
  // TACTICAL COMBAT ACTIONS
  // ==========================================
  {
    _id: "dccskl0000000120",
    name: "Call a Play",
    type: "skill",
    img: "icons/svg/combat.svg",
    system: {
      rank: 0,
      stat: "cha",
      skillType: "Utility",
      type: "Utility",
      category: "Combat",
      checkType: "Standard Action (2d6)",
      notes: "Standard Action. Encourage an ally. Roll 2d6; targeted ally adds higher d6 to upcoming Skill Check or damage roll.",
      upgrades: "Tactical combat maneuver.",
      checked: false,
      damageModifiers: []
    }
  },
  {
    _id: "dccskl0000000121",
    name: "Intervene",
    type: "skill",
    img: "icons/svg/shield.svg",
    system: {
      rank: 0,
      stat: "dex",
      skillType: "Utility",
      type: "Utility",
      category: "Combat",
      checkType: "Interrupt Action (1d6)",
      notes: "Interrupt Action. Assist an ally's roll. Roll 1d6 and add result directly to party member's d20 roll.",
      upgrades: "Tactical combat maneuver.",
      checked: false,
      damageModifiers: []
    }
  }
];
