/**
 * Dungeon Crawler Carl RPG - Official Skills Dataset
 * Derived from the official DCC Combat & Exploration Action Quick Sheets and skills.txt.
 */

export const DCC_SKILLS = [
  {
    "_id": "dccskl0000000001",
    "name": "Bite",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Strike",
      "type": "Strike",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Limitations: The target must have an appendage you can clamp down onto. You taste your victim’s blood. Base Damage: 1d8 + Str Piercing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage. You may latch on to move when the foe moves during their next Action (then you let go).\nRank 15: +1d8 base damage, and the target gains the Woozy Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage. You may latch on to move when the foe moves during their next Action (then you let go)."
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Woozy",
          "notes": "+1d8 base damage, and the target gains the Woozy Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "bite",
      "tags": [
        "action.attack",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.natural"
      ]
    }
  },
  {
    "_id": "dccskl0000000002",
    "name": "Back Claw",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Strike",
      "type": "Strike",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Base Damage: 1d6 + Str Slashing.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage\nRank 15: +1d6 base damage, and the target gains the Blood Trail Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "str",
      "damageType": "Slashing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Blood Trail",
          "notes": "+1d6 base damage, and the target gains the Blood Trail Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "back-claw",
      "tags": [
        "action.attack",
        "element.slashing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.natural"
      ]
    }
  },
  {
    "_id": "dccskl0000000003",
    "name": "Slice Attack",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Strike",
      "type": "Strike",
      "category": "Combat",
      "checkType": "Melee Attack, Dex",
      "notes": "AI Favor: 1. Base Damage: 1d4 + Str Slashing.",
      "upgrades": "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +2d4 base damage",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Slashing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank15": {
          "damageDice": "2d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+2d4 base damage"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "slice-attack",
      "tags": [
        "action.attack",
        "element.slashing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weaponClass.natural"
      ]
    }
  },
  {
    "_id": "dccskl0000000004",
    "name": "Club",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Bashing",
      "type": "Bashing",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Base Damage: 1d6 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and the target gains the Woozy Debuff.\nRank 15: +1d6 base damage, and if the target loses at least 3 Health Bar slots, they gain the Take Down Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Woozy",
          "notes": "+1d6 base damage, and the target gains the Woozy Debuff."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Take Down",
          "notes": "+1d6 base damage, and if the target loses at least 3 Health Bar slots, they gain the Take Down Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "club",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.club",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000005",
    "name": "Improvised Weapons",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Bashing",
      "type": "Bashing",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "AI Favor: 1. Pick up something and smack someone else with it. Object must weigh at least 1 lb and no more than your Str in lbs. Base Damage: 1d4 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d4 base damage, and you can throw the item (using this Skill) up to a range of Rank ×5 feet.\nRank 10: +1d4 base damage, and you roll your first Attack each combat with Advantage.\nRank 15: +1d4 base damage.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and you can throw the item (using this Skill) up to a range of Rank ×5 feet."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and you roll your first Attack each combat with Advantage."
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "improvised-weapons",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.improvised",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000006",
    "name": "Warhammer",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Bashing",
      "type": "Bashing",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Limitations: Requires two hands to wield. Base Damage: 1d10 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d10 base damage\nRank 10: +1d10 base damage\nRank 15: +1d10 base damage, and the target (of your size or smaller) is pushed 15 feet.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d10",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage"
        },
        "rank10": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage"
        },
        "rank15": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage, and the target (of your size or smaller) is pushed 15 feet."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "warhammer",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.warhammer",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000007",
    "name": "Axe",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Edge",
      "type": "Edge",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Base Damage: 1d6 + Str Slashing.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and you may make an extra free Attack with Disadvantage against another adjacent foe.\nRank 15: +1d6 base damage, and on an Amazing Success or better, sever an arm (disarming two-handed weapons).",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "str",
      "damageType": "Slashing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage, and you may make an extra free Attack with Disadvantage against another adjacent foe."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage, and on an Amazing Success or better, sever an arm (disarming two-handed weapons)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "axe",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.slashing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.axe",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000008",
    "name": "Dagger",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Edge",
      "type": "Edge",
      "category": "Combat",
      "checkType": "Melee Attack, Dex",
      "notes": "AI Favor: 1. Base Damage: 1d4 + Str Piercing.",
      "upgrades": "Rank 5: +1d4 base damage, and this Attack deals Armor-Piercing damage (ignores DR).\nRank 10: +1d4 base damage, and you can throw this weapon up to a range of Rank × 5 feet.\nRank 15: +1d4 base damage, and Attacks targeting the back deal ×2 damage.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and this Attack deals Armor-Piercing damage (ignores DR)."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and you can throw this weapon up to a range of Rank × 5 feet."
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and Attacks targeting the back deal ×2 damage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "dagger",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.dagger",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000009",
    "name": "Longsword",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Edge",
      "type": "Edge",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Base Damage: 1d8 + Str Slashing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage\nRank 15: +1d8 base damage, and you gain a +1 Evade Buff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "str",
      "damageType": "Slashing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1d8 base damage, and you gain a +1 Evade Buff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "longsword",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.slashing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.longsword",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000010",
    "name": "Rapier",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Edge",
      "type": "Edge",
      "category": "Combat",
      "checkType": "Melee Attack, Dex",
      "notes": "Base Damage: 1d6 + Dex Piercing.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and you gain a +1 Evade Buff.\nRank 15: +1d6 base damage, and you gain a +1 Evade Buff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "dex",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1d6 base damage, and you gain a +1 Evade Buff."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1d6 base damage, and you gain a +1 Evade Buff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "rapier",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.rapier",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000011",
    "name": "Foot Soldier",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "AI Favor: 1 (only if no Damage Effect is used). Choose Powerful Strike or Smush Damage Effect before rolling to hit. Base Damage: 1d4 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage, and the target gains the Sore as Shit Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "optionalEffects": [
        "Powerful Strike",
        "Smush"
      ],
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Sore as Shit",
          "notes": "+1d4 base damage, and the target gains the Sore as Shit Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "foot-soldier",
      "tags": [
        "action.attack",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.unarmed"
      ]
    }
  },
  {
    "_id": "dccskl0000000012",
    "name": "Noggin Nocker",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "AI Favor: 1 (only if no Damage Effect is used). Limitations: On Success, you lose 1 Health Bar slot. Choose Skullcracker or Powerful Strike. Base Damage: 1d4 + Con Bludgeoning.",
      "upgrades": "Rank 5: +1d4 base damage, and you don’t take any damage from your own Attack.\nRank 10: +1d4 base damage, and add 1 Rank damage die.\nRank 15: +1d4 base damage, and the target gains the Woozy Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "con",
      "damageType": "Bludgeoning",
      "optionalEffects": [
        "Skullcracker",
        "Powerful Strike"
      ],
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and you don’t take any damage from your own Attack."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, and add 1 Rank damage die."
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Woozy",
          "notes": "+1d4 base damage, and the target gains the Woozy Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "noggin-nocker",
      "tags": [
        "action.attack",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.unarmed"
      ]
    }
  },
  {
    "_id": "dccskl0000000013",
    "name": "Pugilism",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Combat",
      "checkType": "Melee Attack, Dex",
      "notes": "AI Favor: 2 (only if no Damage Effect is used). Choose Dirty Fighting, Iron Punch, or Powerful Strike before rolling. Base Damage: 1d2 + Str Bludgeoning.",
      "upgrades": "Rank 5: +2d2 base damage\nRank 10: +1d2 base damage\nRank 15: +1d2 base damage, and you may make an extra free Attack with Disadvantage.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d2",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "optionalEffects": [
        "Dirty Fighting",
        "Iron Punch",
        "Powerful Strike"
      ],
      "rankBreaks": {
        "rank5": {
          "damageDice": "2d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+2d2 base damage"
        },
        "rank10": {
          "damageDice": "1d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d2 base damage"
        },
        "rank15": {
          "damageDice": "1d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d2 base damage, and you may make an extra free Attack with Disadvantage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "pugilism",
      "tags": [
        "action.attack",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weaponClass.unarmed"
      ]
    }
  },
  {
    "_id": "dccskl0000000014",
    "name": "Unarmed Combat",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "AI Favor: 1. Limitations: Cannot choose a Damage Effect. Mixture of all strikes. Base Damage: 1d4 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d4 base damage\nRank 10: +1d4 base damage\nRank 15: +2d4 base damage",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "optionalEffects": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank15": {
          "damageDice": "2d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+2d4 base damage"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "unarmed-combat",
      "tags": [
        "action.attack",
        "element.bludgeoning",
        "kind.skill",
        "rule.no-damage-effects",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.unarmed"
      ]
    }
  },
  {
    "_id": "dccskl0000000015",
    "name": "Wrasslin",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "AI Favor: 1 (only if no Damage Effect is used). Limitations: Requires two hands. Choose Choke Out, Dirty Fighting, or Toss. On Success, target gains Held Debuff. Base Damage: 1d4 + Str Bludgeoning.",
      "upgrades": "Rank 5: Maintain Held at no Action cost, but check to prevent escape is at Disadvantage.\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "optionalEffects": [
        "Choke Out",
        "Dirty Fighting",
        "Toss"
      ],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Held",
          "notes": "Maintain Held at no Action cost, but check to prevent escape is at Disadvantage."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "wrasslin",
      "tags": [
        "action.attack",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weaponClass.unarmed"
      ]
    }
  },
  {
    "_id": "dccskl0000000016",
    "name": "Choke Out",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Wrasslin' Damage Effect, Passive",
      "notes": "Wrasslin' Damage Effect, Passive. If target is at 10% Health Bar or less, you deal ×2 total damage.",
      "upgrades": "Rank 5: Activates at 20% Health Bar or less.\nRank 10: Activates at 40% Health Bar or less, deals ×4 total damage.\nRank 15: Activates at 80% Health Bar or less, deals ×8 total damage.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Wrasslin"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "wrasslin",
          "wrasslin'"
        ],
        "baseDiceCountMod": "",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "",
        "damageType": "",
        "debuffName": "",
        "cooldown": "None"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Activates at 20% Health Bar or less"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Activates at 40% Health Bar or less, deals ×4 total damage"
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Activates at 80% Health Bar or less, deals ×8 total damage"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "choke-out",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.wrasslin"
      ]
    }
  },
  {
    "_id": "dccskl0000000017",
    "name": "Dirty Fighting",
    "type": "skill",
    "img": "icons/svg/cowled.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Pugilism / Wrasslin' Damage Effect, Passive",
      "notes": "Pugilism or Wrasslin' Damage Effect, Passive. If Attack is Critical Fail, lose 1 Popularity. Apply Woozy Debuff to target.",
      "upgrades": "Rank 5: Also apply The Taint Debuff.\nRank 10: Also apply Blinded Debuff. No longer lose Popularity on Critical Fails.\nRank 15: Apply an immediate Minor Injury Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Pugilism",
        "Wrasslin"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "pugilism",
          "wrasslin",
          "wrasslin'"
        ],
        "baseDiceCountMod": "",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "",
        "damageType": "",
        "debuffName": "Woozy",
        "cooldown": "None"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "The Taint",
          "notes": "Also apply The Taint Debuff"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Blinded",
          "notes": "Also apply Blinded Debuff. No longer lose Popularity on Critical Fails."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Minor Injury",
          "notes": "Apply an immediate Minor Injury Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "dirty-fighting",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.pugilism",
        "technique.wrasslin"
      ]
    }
  },
  {
    "_id": "dccskl0000000018",
    "name": "Iron Punch",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Pugilism Damage Effect, Passive",
      "notes": "Pugilism Damage Effect, Passive. Deal +1d2 base damage.",
      "upgrades": "Rank 5: Add 1 Rank damage die.\nRank 10: Choose to have target gain Stunned Debuff instead of rolling damage.\nRank 15: Add 1 Rank damage die, and target gains Stunned Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Pugilism"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "pugilism"
        ],
        "baseDiceCountMod": "+1",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "1d2",
        "damageType": "Physical",
        "debuffName": "",
        "cooldown": "None"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "+1",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Add 1 Rank damage die"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "+1",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Stunned",
          "notes": "Choose to have target gain Stunned Debuff"
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "+1",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "Stunned",
          "notes": "Add 1 Rank damage die, and target gains Stunned Debuff"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "iron-punch",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.pugilism"
      ]
    }
  },
  {
    "_id": "dccskl0000000019",
    "name": "Powerful Strike",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Damage Effect, Passive",
      "notes": "Foot Soldier, Noggin Nocker, or Pugilism Damage Effect. Cooldown: 30 hours. Multiply base damage dice by Rank in this Skill, then add modifiers.",
      "upgrades": "Rank 5: Cooldown is 10 hours.\nRank 10: Cooldown is 5 hours.\nRank 15: Cooldown is 2 hours.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Foot Soldier",
        "Noggin Nocker",
        "Pugilism"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "foot soldier",
          "noggin knocker",
          "noggin nocker",
          "pugilism"
        ],
        "baseDiceCountMod": "* @rank",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "1d6",
        "damageType": "",
        "debuffName": "",
        "cooldown": "30 hours"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Cooldown is 10 hours"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Cooldown is 5 hours"
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Cooldown is 2 hours"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "powerful-strike",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.foot_soldier",
        "technique.noggin_nocker",
        "technique.pugilism"
      ]
    }
  },
  {
    "_id": "dccskl0000000020",
    "name": "Skullcracker",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Noggin Nocker Damage Effect, Passive",
      "notes": "Noggin Nocker Damage Effect, Passive. If target is same size as you, gain +1d4 base damage.",
      "upgrades": "Rank 5: +1d4 base damage if target is same size.\nRank 10: If same size, add 1 Rank damage die and target gains Stunned Debuff.\nRank 15: Add 1 Rank damage die and target gains Blood Trail Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Noggin Nocker"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "noggin knocker",
          "noggin nocker"
        ],
        "baseDiceCountMod": "+1",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "1d4",
        "damageType": "Physical",
        "debuffName": "",
        "cooldown": "None"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "+1",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage if target is same size"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "Stunned",
          "notes": "If same size, add 1 Rank damage die and target gains Stunned Debuff"
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "Blood Trail",
          "notes": "Add 1 Rank damage die and target gains Blood Trail Debuff"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "skullcracker",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.noggin_nocker"
      ]
    }
  },
  {
    "_id": "dccskl0000000021",
    "name": "Smush",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Foot Soldier Damage Effect, Passive",
      "notes": "Foot Soldier Damage Effect, Passive. Target must have 20% Health Bar or less. Cooldown: Once per round. Deal ×2 total damage.",
      "upgrades": "Rank 5: Activates at 30% Health Bar or less and deals ×3 damage.\nRank 10: No cooldown.\nRank 15: Activates at 40% Health Bar or less and deals ×4 damage.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Foot Soldier"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "foot soldier"
        ],
        "baseDiceCountMod": "",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "",
        "damageType": "",
        "debuffName": "",
        "cooldown": "Once per round"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Activates at 30% Health Bar or less and deals ×3 damage"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No cooldown"
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Activates at 40% Health Bar or less and deals ×4 damage"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "smush",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.foot_soldier"
      ]
    }
  },
  {
    "_id": "dccskl0000000022",
    "name": "Toss",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Hand to Hand",
      "type": "Hand to Hand",
      "category": "Passive",
      "checkType": "Wrasslin' Damage Effect, Passive",
      "notes": "Wrasslin' Damage Effect, Passive. Deal +1d8 base damage + Str Bludgeoning, end Held Debuff, and throw target 5 ft per 5 Ranks (min 5 ft). Only foes smaller than you.",
      "upgrades": "Rank 5: Toss foes up to own size.\nRank 10: Toss foes one size larger.\nRank 15: +1d8 base damage, toss foes two sizes larger.",
      "checked": false,
      "damageModifiers": [],
      "isTechnique": true,
      "isAttack": false,
      "hasDamage": false,
      "appliesTo": [
        "Wrasslin"
      ],
      "techniqueConfig": {
        "isDamageEffect": true,
        "appliesToTags": [
          "wrasslin",
          "wrasslin'"
        ],
        "baseDiceCountMod": "",
        "baseDiceSidesMod": "",
        "flatDamageMod": "",
        "damageBonus": "1d8",
        "damageType": "Bludgeoning",
        "debuffName": "",
        "cooldown": "None"
      },
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Toss foes up to own size"
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Toss foes one size larger"
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage, toss foes two sizes larger"
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "toss",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.str",
        "technique.wrasslin"
      ]
    }
  },
  {
    "_id": "dccskl0000000023",
    "name": "Bow",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 100 feet. Requires two hands and ammunition. Base Damage: 1d6 + Str Piercing.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, add 1 Rank damage die.\nRank 15: +1d6 base damage, and target gains Blood Trail Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage, add 1 Rank damage die."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Blood Trail",
          "notes": "+1d6 base damage, and target gains Blood Trail Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "bow",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.bow",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000024",
    "name": "Crossbow",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 50 feet. Requires two hands and ammunition. Cooldown: Once per round. Base Damage: 1d8 Piercing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, target gains Blood Trail Debuff.\nRank 15: +1d8 base damage, range is 100 feet.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "dex",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Blood Trail",
          "notes": "+1d8 base damage, target gains Blood Trail Debuff."
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage, range is 100 feet."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "crossbow",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.crossbow",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000025",
    "name": "Handgun",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 150 feet. Requires ammunition. Spend one Action to reload after Major Fail or worse. Base Damage: 1d8 Piercing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage\nRank 15: +1d8 base damage, target gains Staggered Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "dex",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Staggered",
          "notes": "+1d8 base damage, target gains Staggered Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "handgun",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.handgun",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000026",
    "name": "Javelin",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 40 feet. Base Damage: 1d8 + Str Piercing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, deals Armor-Piercing damage (ignores DR).\nRank 15: +1d8 base damage, range increases by Str in feet.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage, deals Armor-Piercing damage (ignores DR)."
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage, range increases by Str in feet."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "javelin",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.javelin",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000027",
    "name": "Shotgun",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 30 feet. Requires two hands and ammunition. Spend one Action to reload after Major Fail or worse. Base Damage: 1d10 Piercing.",
      "upgrades": "Rank 5: +1d10 base damage\nRank 10: +1d10 base damage\nRank 15: +1d10 base damage, +5ft Splash.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d10",
      "damageStat": "dex",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage"
        },
        "rank10": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage"
        },
        "rank15": {
          "damageDice": "1d10",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d10 base damage, +5ft Splash."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "shotgun",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.shotgun",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000028",
    "name": "Shuriken",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 30 feet. AI Favor: 1. Base Damage: 1d4 + Str Piercing.",
      "upgrades": "Rank 5: +1d4 base damage, range is 40 feet.\nRank 10: +1d4 base damage, make an extra free attack with Disadvantage.\nRank 15: +1d4 base damage, make an extra free attack with Disadvantage.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, range is 40 feet."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, make an extra free attack with Disadvantage."
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, make an extra free attack with Disadvantage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "shuriken",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.shuriken",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000029",
    "name": "Slingshot",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Ranged Attack, Dex",
      "notes": "Range: 30 feet. AI Favor: 2. Requires two hands. Base Damage: 1d2 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d2 base damage, range increases by Str in feet.\nRank 10: +1d2 base damage, add 1 Rank damage die.\nRank 15: +1d2 base damage, add 1 Rank damage die.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d2",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d2 base damage, range increases by Str in feet."
        },
        "rank10": {
          "damageDice": "1d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d2 base damage, add 1 Rank damage die."
        },
        "rank15": {
          "damageDice": "1d2",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d2 base damage, add 1 Rank damage die."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "slingshot",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.dex",
        "weapon.slingshot",
        "weaponClass.ranged"
      ]
    }
  },
  {
    "_id": "dccskl0000000030",
    "name": "Herding Weapons",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Reach",
      "type": "Reach",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Range: 10 feet. AI Favor: 1. Requires two hands. Base Damage: 1d4 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d4 base damage, slide target 5 feet.\nRank 10: +1d4 base damage, can make a Sling attack with range 50 ft using Dex to hit.\nRank 15: +1d4 base damage, target gains Take Down Debuff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d4",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, slide target 5 feet."
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage, can make a Sling attack with range 50 ft using Dex to hit."
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Take Down",
          "notes": "+1d4 base damage, target gains Take Down Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "herding-weapons",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.herding_weapon",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000031",
    "name": "Lance",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Reach",
      "type": "Reach",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Range: 10 feet. Must be mounted. Cannot be used with Attack of Opportunity or Zone of Control. Base Damage: 1d12 + Str Piercing.",
      "upgrades": "Rank 5: +1d12 base damage\nRank 10: +1d12 base damage, +1 damage per 10 ft mount moved this turn.\nRank 15: +1d12 base damage, +X damage (X = size of mount).",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d12",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d12",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d12 base damage"
        },
        "rank10": {
          "damageDice": "1d12",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 dam",
          "debuff": "",
          "notes": "+1d12 base damage, +1 damage per 10 ft mount moved this turn."
        },
        "rank15": {
          "damageDice": "1d12",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d12 base damage, +X damage (X = size of mount)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "lance",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.lance",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000032",
    "name": "Polearm",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Reach",
      "type": "Reach",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Range: 10 feet. Requires two hands. Base Damage: 1d8 + Str Piercing.",
      "upgrades": "Rank 5: +1d8 base damage\nRank 10: +1d8 base damage, and +1 Rank in Zone of Control Skill.\nRank 15: +1d8 base damage, and +1 Rank in Zone of Control Skill.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d8",
      "damageStat": "str",
      "damageType": "Piercing",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d8 base damage"
        },
        "rank10": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Ran",
          "debuff": "",
          "notes": "+1d8 base damage, and +1 Rank in Zone of Control Skill."
        },
        "rank15": {
          "damageDice": "1d8",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Ran",
          "debuff": "",
          "notes": "+1d8 base damage, and +1 Rank in Zone of Control Skill."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "polearm",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.piercing",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.polearm",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000033",
    "name": "Quarterstaff",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Reach",
      "type": "Reach",
      "category": "Combat",
      "checkType": "Melee Attack, Str",
      "notes": "Range: 10 feet. Requires two hands. Base Damage: 1d6 + Str Bludgeoning.",
      "upgrades": "Rank 5: +1d6 base damage\nRank 10: +1d6 base damage, and gain a +1 Evade Buff.\nRank 15: +1d6 base damage, and gain a +1 Evade Buff.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": true,
      "isTechnique": false,
      "hasDamage": true,
      "baseDamage": "1d6",
      "damageStat": "str",
      "damageType": "Bludgeoning",
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 base damage"
        },
        "rank10": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1d6 base damage, and gain a +1 Evade Buff."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1d6 base damage, and gain a +1 Evade Buff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "quarterstaff",
      "tags": [
        "action.attack",
        "rule.requires-weapon",
        "element.bludgeoning",
        "kind.skill",
        "skillGroup.combat",
        "stat.str",
        "weapon.quarterstaff",
        "weaponClass.melee"
      ]
    }
  },
  {
    "_id": "dccskl0000000034",
    "name": "Edged Weapons",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Edge",
      "type": "Edge",
      "category": "Combat",
      "checkType": "Passive / Weapon Group",
      "notes": "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Edge (Axe, Dagger, Longsword, Rapier).",
      "upgrades": "Rank advances weapon mastery for all edged weapons.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "edged-weapons",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000035",
    "name": "Blunt Weapons",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Bashing",
      "type": "Bashing",
      "category": "Combat",
      "checkType": "Passive / Weapon Group",
      "notes": "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Bashing (Club, Improvised Weapons, Warhammer).",
      "upgrades": "Rank advances weapon mastery for all blunt/bashing weapons.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "blunt-weapons",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000036",
    "name": "Reach Weapons",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Reach",
      "type": "Reach",
      "category": "Combat",
      "checkType": "Passive / Weapon Group",
      "notes": "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Reach (Herding Weapons, Lance, Polearm, Quarterstaff).",
      "upgrades": "Rank advances weapon mastery for all reach weapons.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "reach-weapons",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000037",
    "name": "Ranged Weapons",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Ranged",
      "type": "Ranged",
      "category": "Combat",
      "checkType": "Passive / Weapon Group",
      "notes": "Generic weapon mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Ranged (Bow, Crossbow, Handgun, Javelin, Shotgun, Shuriken, Slingshot).",
      "upgrades": "Rank advances weapon mastery for all ranged weapons.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "ranged-weapons",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000038",
    "name": "Strike Weapons",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Strike",
      "type": "Strike",
      "category": "Combat",
      "checkType": "Passive / Weapon Group",
      "notes": "Generic mastery skill. Grants a generic bonus equal to its Rank to all member skills of type Strike (Bite, Back Claw, Slice Attack).",
      "upgrades": "Rank advances mastery for natural strike attacks.",
      "checked": false,
      "damageModifiers": [],
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "strike-weapons",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000039",
    "name": "Acute Ears",
    "type": "skill",
    "img": "icons/svg/eye.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Passive",
      "notes": "Improves hearing and allows crawler to see more Mobs on minimap in HUD.",
      "upgrades": "Rank 5: Mob size and encounter history added to red dot.\nRank 10: Lower level Mobs cannot Ambush your party.\nRank 15: Mobs cannot Ambush your party.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mob size and encounter history added to red dot."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Lower level Mobs cannot Ambush your party."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mobs cannot Ambush your party."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "acute-ears",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000040",
    "name": "Aiming",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Used only with Ranged Attacks. Add Ranks to Attack check if made with Disadvantage. On Success, add 1d4 to damage.",
      "upgrades": "Rank 5: +1d4 damage\nRank 10: +1d4 base damage\nRank 15: +1d4 base damage.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 damage"
        },
        "rank10": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage"
        },
        "rank15": {
          "damageDice": "1d4",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d4 base damage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "aiming",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000041",
    "name": "Alchemy",
    "type": "skill",
    "img": "icons/svg/daze.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Used for crafting potions and poisons up to +5 bonus level.",
      "upgrades": "Rank 5: Craft potions up to +10 bonus level.\nRank 10: Create additional potions without extra time.\nRank 15: Write the recipe for any potion you find.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+10 bon",
          "debuff": "",
          "notes": "Craft potions up to +10 bonus level."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Create additional potions without extra time."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Write the recipe for any potion you find."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "alchemy",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000042",
    "name": "Ambush",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check when Mob is approaching. On Success, gain a surprise Action before combat and attack with Advantage.",
      "upgrades": "Rank 5: Add Ambush Rank damage die to Surprise Attack damage.\nRank 10: Party members roll this skill untrained normally.\nRank 15: Gain a second bonus surprise Action (non-Attack).",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Add Ambush Rank damage die to Surprise Attack damage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party members roll this skill untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Gain a second bonus surprise Action (non-Attack)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "ambush",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000043",
    "name": "Animal Handling",
    "type": "skill",
    "img": "icons/svg/paw.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to calm, befriend, or guide animals.",
      "upgrades": "Rank 5: Specialize in animal type (Advantage). Gain bonus surprise Action.\nRank 10: Pet bonding takes half time.\nRank 15: Can have up to two pets.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Specialize in animal type (Advantage). Gain bonus surprise Action."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Pet bonding takes half time."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Can have up to two pets."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "animal-handling",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000044",
    "name": "Arcane",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "General knowledge of magic; identify whether items are magical.",
      "upgrades": "Rank 5: Determine Rank and bonus level of magical items.\nRank 10: Imbue items with inherent spells at Arcanist Table.\nRank 15: Default cooldown of imbued spells is 3 hours.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Determine Rank and bonus level of magical items."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Imbue items with inherent spells at Arcanist Table."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Default cooldown of imbued spells is 3 hours."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "arcane",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000045",
    "name": "Attack of Opportunity",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Passive, Interrupt",
      "notes": "Requires single-handed melee weapon (range <= 5 ft). When foe leaves adjacent space (except Step), spend Action to make Attack as Interrupt.",
      "upgrades": "Rank 5: If foe moves into adjacent space, they must stop.\nRank 10: Foe Step no longer prevents this ability.\nRank 15: Roll Attack check with Advantage.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "If foe moves into adjacent space, they must stop."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Foe Step no longer prevents this ability."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Roll Attack check with Advantage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "attack-of-opportunity",
      "tags": [
        "action.interrupt",
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000046",
    "name": "Backfire",
    "type": "skill",
    "img": "icons/svg/hazard.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Compensated Anarchist Class only. Neutralize (10 min) and deconstruct (1 hr) traps without Sapper's Table.",
      "upgrades": "Rank 5: Identify placement time; neutralize takes 5 min.\nRank 10: Identify creation time; deconstruct takes 30 min.\nRank 15: Identify trap designer; deconstruct takes 15 min.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Identify placement time; neutralize takes 5 min."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Identify creation time; deconstruct takes 30 min."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Identify trap designer; deconstruct takes 15 min."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "backfire",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000047",
    "name": "Balance",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Traverse tricky surfaces with general ease.",
      "upgrades": "Rank 5: Move Actions in difficult terrain without penalty.\nRank 10: Avoid Take Down or involuntary Move as free Interrupt.\nRank 15: Step on vertical surfaces.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Move Actions in difficult terrain without penalty."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Avoid Take Down or involuntary Move as free Interrupt."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Step on vertical surfaces."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "balance",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000048",
    "name": "Basic Science",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Conduct experiments involving chemistry, physics, or biology (takes 2 hours).",
      "upgrades": "Rank 5: Experiments take 1 hour.\nRank 10: Choose specialty; roll with Advantage.\nRank 15: Experiments take 30 minutes.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Experiments take 1 hour."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Choose specialty; roll with Advantage."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Experiments take 30 minutes."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "basic-science",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000049",
    "name": "Bomb Surgeon",
    "type": "skill",
    "img": "icons/svg/explosion.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Deconstruct explosive and smoke bombs (takes 1 hour).",
      "upgrades": "Rank 5: Takes 30 minutes.\nRank 10: Never make Explosives Handling check when using this skill.\nRank 15: Round dice up when cutting dynamite; takes 15 minutes.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes 30 minutes."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Never make Explosives Handling check when using this skill."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Round dice up when cutting dynamite; takes 15 minutes."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "bomb-surgeon",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000050",
    "name": "Calligraphy",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Make documents look super elegant and official.",
      "upgrades": "Rank 5: Advantage on next Cha check vs recipient.\nRank 10: Craft scrolls as if a crafting skill.\nRank 15: Once per floor, craft scroll for spell seen within 2 hours.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage on next Cha check vs recipient."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Craft scrolls as if a crafting skill."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Once per floor, craft scroll for spell seen within 2 hours."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "calligraphy",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000051",
    "name": "Cartography",
    "type": "skill",
    "img": "icons/svg/direction.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Map dungeon and figure out locations in relation to landmarks.",
      "upgrades": "Rank 5: Return from whence you came quickly.\nRank 10: Provide Advantage die to Tracking or spatial relation checks.\nRank 15: Navigate point A to point B via most direct path.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Return from whence you came quickly."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Provide Advantage die to Tracking or spatial relation checks."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Navigate point A to point B via most direct path."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "cartography",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000052",
    "name": "Cat-Like Reflexes",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Stat Check",
      "notes": "Cat-based Races only. Gain +10ft Move. Use this check when making Dexterity Stat Checks.",
      "upgrades": "Rank 5: Reduce Surprise Attack damage taken by Rank.\nRank 10: Reduce all Area damage by 50%.\nRank 15: +10ft Move, +1 Evade Buff, Advantage to Evade Held effects.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Reduce Surprise Attack damage taken by Rank."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Reduce all Area damage by 50%."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "Held",
          "notes": "+10ft Move, +1 Evade Buff, Advantage to Evade Held effects."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "cat-like-reflexes",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000053",
    "name": "Catcher",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Defensive",
      "checkType": "Passive, Interrupt",
      "isAttack": false,
      "hasDamage": false,
      "baseDamage": "",
      "notes": "When non-Area Attack damages an adjacent ally, leap in and take damage instead. Can take 10ft Step before.",
      "upgrades": "Rank 5: Gain +5 DR when using this Skill.\nRank 10: Gain +5 DR when using this Skill.\nRank 15: Gain +5 DR and ignore attached Debuffs.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 DR",
          "debuff": "",
          "notes": "Gain +5 DR when using this Skill."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 DR",
          "debuff": "",
          "notes": "Gain +5 DR when using this Skill."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 DR",
          "debuff": "",
          "notes": "Gain +5 DR and ignore attached Debuffs."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "catcher",
      "tags": [
        "action.interrupt",
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000054",
    "name": "Cesta Punta",
    "type": "skill",
    "img": "icons/svg/d20.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Stat Check",
      "notes": "Acquired via Earth Hobby Potion. Play jai alai or throw things that fit in the xistera.",
      "upgrades": "Rank 5: Throw range Str × 20 feet.\nRank 10: Add 1 Rank damage die to thrown Attacks.\nRank 15: Throw range Str × 30 feet.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Throw range Str × 20 feet."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 1,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Add 1 Rank damage die to thrown Attacks."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Throw range Str × 30 feet."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "cesta-punta",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000055",
    "name": "Character Actor",
    "type": "skill",
    "img": "icons/svg/cowled.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive, Charisma",
      "notes": "Former Child Actor only. Choose new Class randomly each floor and gain listed abilities on 1d2 = 2.",
      "upgrades": "Rank 5: Random Classes increase in rarity and power.\nRank 10: Skill Ranks in granted skills persist across floors.\nRank 15: Choose Class from any available.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Random Classes increase in rarity and power."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Skill Ranks in granted skills persist across floors."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Choose Class from any available."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "character-actor",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000056",
    "name": "Chopper Pilot",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Piloting motorcycles. Disadvantage on Attacks while piloting; cannot use two-handed weapons.",
      "upgrades": "Rank 5: Chopper has +5ft Move.\nRank 10: Attacking while piloting no longer suffers Disadvantage.\nRank 15: Chopper has +5ft Move; Advantage on crazy stunts.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Chopper has +5ft Move."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Attacking while piloting no longer suffers Disadvantage."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Chopper has +5ft Move; Advantage on crazy stunts."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "chopper-pilot",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000057",
    "name": "Climbing",
    "type": "skill",
    "img": "icons/svg/stone-path.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Make check every minute during dangerous climbs. Attacking while climbing suffers Disadvantage.",
      "upgrades": "Rank 5: Check every 5 minutes.\nRank 10: Check every 10 minutes; no Disadvantage on Attacks.\nRank 15: Check every 15 minutes; party rolls untrained normally.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Check every 5 minutes."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Check every 10 minutes; no Disadvantage on Attacks."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Check every 15 minutes; party rolls untrained normally."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "climbing",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000058",
    "name": "Cockroach",
    "type": "skill",
    "img": "icons/svg/aura.svg",
    "system": {
      "rank": 0,
      "stat": "con",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "When Attack drops you to 0% Health Bar, roll Unopposed. On Success, drop to 10% instead. Cooldown: Once per scene.",
      "upgrades": "Rank 5: No check required.\nRank 10: Health Bar unaffected by damage that would drop to 0%.\nRank 15: Cooldown twice per scene. Heal to 100% and gain +Rank DR for 1 round.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No check required."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Health Bar unaffected by damage that would drop to 0%."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Cooldown twice per scene. Heal to 100% and gain +Rank DR for 1 round."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "cockroach",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.con"
      ]
    }
  },
  {
    "_id": "dccskl0000000059",
    "name": "Cooking",
    "type": "skill",
    "img": "icons/svg/heal.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Prepare edible food for party in 1 hour.",
      "upgrades": "Rank 5: Takes 30 minutes with makeshift ingredients.\nRank 10: Diners gain 'You are full!' Buff (heal 2 HB slots/hr).\nRank 15: 'You are full!' Buff ends Debuffs if dropping to 10% HB.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes 30 minutes with makeshift ingredients."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Diners gain 'You are full!' Buff (heal 2 HB slots/hr)."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "'You are full!' Buff ends Debuffs if dropping to 10% HB."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "cooking",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000060",
    "name": "Deception",
    "type": "skill",
    "img": "icons/svg/cowled.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to obscure truth and lie. Disadvantage if target has Detect Lies.",
      "upgrades": "Rank 5: Usable while gambling.\nRank 10: Usable to forge documents.\nRank 15: If failed, perform one Action before foes react.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Usable while gambling."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Usable to forge documents."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "If failed, perform one Action before foes react."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "deception",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000061",
    "name": "Detect Lies",
    "type": "skill",
    "img": "icons/svg/eye.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Cha-Opposed check to sense bullshit and lies. Disadvantage if target has Deception.",
      "upgrades": "Rank 5: Ignore effects of Major Fail.\nRank 10: Ignore effects of Critical Fail.\nRank 15: Detect lies in text and audio without seeing speaker.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Ignore effects of Major Fail."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Ignore effects of Critical Fail."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Detect lies in text and audio without seeing speaker."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "detect-lies",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000062",
    "name": "Detect Trap",
    "type": "skill",
    "img": "icons/svg/hazard.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Detect active non-magic traps. Disadvantage when scanning entire room or while moving.",
      "upgrades": "Rank 5: Detect magical traps.\nRank 10: No Disadvantage when scanning broadly or moving.\nRank 15: Party gains Advantage on first check to avoid detected trap.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Detect magical traps."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No Disadvantage when scanning broadly or moving."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party gains Advantage on first check to avoid detected trap."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "detect-trap",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000063",
    "name": "Determine Value",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Sort inventory by item value and appraise items and gear. Advances only by magical means.",
      "upgrades": "Rank 5: Sort inventory and gear by value (without revealing exact value).\nRank 10: View exact gold values of all items and gear.\nRank 15: Gold value of new items displayed on pickup.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Sort inventory and gear by value (without revealing exact value)."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "View exact gold values of all items and gear."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Gold value of new items displayed on pickup."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "determine-value",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000064",
    "name": "Diplomacy",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check for mediation between opposing parties.",
      "upgrades": "Rank 5: Advantage if not a member of either party.\nRank 10: Parties accept consequences for breaking deal.\nRank 15: Hostilities cease for remainder of the day.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage if not a member of either party."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Parties accept consequences for breaking deal."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Hostilities cease for remainder of the day."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "diplomacy",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000065",
    "name": "Dodge",
    "type": "skill",
    "img": "icons/svg/wing.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Gain +1 Evade Buff.",
      "upgrades": "Rank 5: +1 Evade Buff, Step additional 5 ft when Evading.\nRank 10: +2 Evade Buff, Advantage to Evade Spells and Ranged Attacks.\nRank 15: +2 Evade Buff, Evade Action costs no Action in combat.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "+1 Evade Buff, Step additional 5 ft when Evading."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+2 Eva",
          "debuff": "",
          "notes": "+2 Evade Buff, Advantage to Evade Spells and Ranged Attacks."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+2 Eva",
          "debuff": "",
          "notes": "+2 Evade Buff, Evade Action costs no Action in combat."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "dodge",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000066",
    "name": "Double Tap",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Declare at start of round; use all Actions to Attack single target. If 1st Attack is Amazing Success+, 2nd is upgraded to Critical Hit.",
      "upgrades": "Rank 5: First Attack made with Advantage.\nRank 10: 2nd Attack upgrades to Crit on Standard Success+.\nRank 15: 2nd Attack with Advantage; deals ×3 damage on Crit.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "First Attack made with Advantage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "2nd Attack upgrades to Crit on Standard Success+."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "2nd Attack with Advantage; deals ×3 damage on Crit."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "double-tap",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000067",
    "name": "Driving",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Operate four-wheeled vehicles in extreme circumstances.",
      "upgrades": "Rank 5: No Disadvantage when attacking while driving.\nRank 10: Vehicle has +5ft Move; Advantage to Evade vehicle attacks.\nRank 15: Vehicle has +5ft Move; Advantage on extreme stunts.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No Disadvantage when attacking while driving."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Vehicle has +5ft Move; Advantage to Evade vehicle attacks."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Vehicle has +5ft Move; Advantage on extreme stunts."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "driving",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000068",
    "name": "Dumpster Diving",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Scrounge clutter and junk piles (takes 1 hour per 50ft area).",
      "upgrades": "Rank 5: Find 1 Rank damage die's worth of Misc Junk.\nRank 10: Takes 30 minutes; additional item on Crit.\nRank 15: Takes 10 minutes; additional item on Amazing Success.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Find 1 Rank damage die's worth of Misc Junk."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes 30 minutes; additional item on Crit."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes 10 minutes; additional item on Amazing Success."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "dumpster-diving",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000069",
    "name": "Endurance",
    "type": "skill",
    "img": "icons/svg/aura.svg",
    "system": {
      "rank": 0,
      "stat": "con",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Prevent fatigue and avoid Fatigued Debuff during long-distance travel and grinding.",
      "upgrades": "Rank 5: Ignore effects of Major Fail.\nRank 10: Advantage if not Fatigued or in extreme conditions.\nRank 15: Critical Fail converted to Standard Fail.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Ignore effects of Major Fail."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Fatigued",
          "notes": "Advantage if not Fatigued or in extreme conditions."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Critical Fail converted to Standard Fail."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "endurance",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.con"
      ]
    }
  },
  {
    "_id": "dccskl0000000070",
    "name": "Engineering",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Design and build mechanisms with moving parts, fluids, or chemicals out of Misc Junk.",
      "upgrades": "Rank 5: Specialize in mundane item type with Advantage.\nRank 10: Craft specialty item with +1 bonus level enchantment.\nRank 15: Craft up to +2 bonus level enchantment; takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Specialize in mundane item type with Advantage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 bon",
          "debuff": "",
          "notes": "Craft specialty item with +1 bonus level enchantment."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+2 bon",
          "debuff": "",
          "notes": "Craft up to +2 bonus level enchantment; takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "engineering",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000071",
    "name": "Escape Plan",
    "type": "skill",
    "img": "icons/svg/direction.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "HUD reveals hidden doors and passages. Advances only by magical means.",
      "upgrades": "Rank 5: Access system-concealed displays and Dungeon Locator signs.\nRank 10: Read hidden sigils used to direct Mob movement.\nRank 15: Read hidden messages and redactions in dungeon documents.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Access system-concealed displays and Dungeon Locator signs."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Read hidden sigils used to direct Mob movement."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Read hidden messages and redactions in dungeon documents."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "escape-plan",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000072",
    "name": "Escape Artist",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed / Opposed",
      "notes": "Escape bonds (Unopposed) or escape being Held (Str-Opposed).",
      "upgrades": "Rank 5: Escape unseen and take unseen Step.\nRank 10: Party rolls untrained normally.\nRank 15: Immediately take an Action with Advantage upon slipping out.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Escape unseen and take unseen Step."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party rolls untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Immediately take an Action with Advantage upon slipping out."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "escape-artist",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000073",
    "name": "Explosives Handling",
    "type": "skill",
    "img": "icons/svg/explosion.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Safely prime, disarm, or manage explosive devices.",
      "upgrades": "Rank 5: Determine type, status, and raw materials of explosives.\nRank 10: Craft explosives with Sapper's Table.\nRank 15: Create explosive raw materials out of non-volatile materials; takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Determine type, status, and raw materials of explosives."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Craft explosives with Sapper's Table."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Create explosive raw materials out of non-volatile materials; takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "explosives-handling",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000074",
    "name": "Fabricate",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Craft generic mundane items with no moving parts wholly out of Misc Junk.",
      "upgrades": "Rank 5: Specialize in mundane item with Advantage.\nRank 10: Craft specialty item with +1 bonus level enchantment.\nRank 15: Craft with up to +2 bonus level enchantment; takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Specialize in mundane item with Advantage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 bon",
          "debuff": "",
          "notes": "Craft specialty item with +1 bonus level enchantment."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+2 bon",
          "debuff": "",
          "notes": "Craft with up to +2 bonus level enchantment; takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "fabricate",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000075",
    "name": "Find Crawler",
    "type": "skill",
    "img": "icons/svg/target.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "HUD displays other crawlers within 1,000 ft with a blue dot.",
      "upgrades": "Rank 5: Detection range increases to 5 miles.\nRank 10: Detection range increases to 10 miles.\nRank 15: Input crawler's name to learn exact location anywhere in dungeon.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Detection range increases to 5 miles."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Detection range increases to 10 miles."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Input crawler's name to learn exact location anywhere in dungeon."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "find-crawler",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000076",
    "name": "Find Trap",
    "type": "skill",
    "img": "icons/svg/hazard.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Traps within 5 feet appear on HUD 1 second prior to triggering.",
      "upgrades": "Rank 5: Traps appear on HUD up to 5 seconds before triggering.\nRank 10: Traps within 10 ft appear as you approach.\nRank 15: Traps within 15 ft appear as you approach.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Traps appear on HUD up to 5 seconds before triggering."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Traps within 10 ft appear as you approach."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Traps within 15 ft appear as you approach."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "find-trap",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000077",
    "name": "First Aid",
    "type": "skill",
    "img": "icons/svg/heal.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Provide medical aid. Patient regains 1 HB slot (+1 per higher degree of success). Once per rest.",
      "upgrades": "Rank 5: Spend 5 min to heal Minor Injury Debuff.\nRank 10: Spend 10 min to heal Long-Term Minor Injury Debuff.\nRank 15: Regain +1 HB slot; spend 15 min to heal Major Injury Debuff.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Spend 5 min to heal Minor Injury Debuff."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Spend 10 min to heal Long-Term Minor Injury Debuff."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Regain +1 HB slot; spend 15 min to heal Major Injury Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "first-aid",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000078",
    "name": "Gear Head",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Build high-performance vehicle engines with Engine Stand attachment to Engineering Table.",
      "upgrades": "Rank 5: Build custom vehicles with no bonus level limits.\nRank 10: +10ft Move per +1 Bonus Level; use as Repair for engines.\nRank 15: Cut engine/vehicle crafting time in half.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Build custom vehicles with no bonus level limits."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Bon",
          "debuff": "",
          "notes": "+10ft Move per +1 Bonus Level; use as Repair for engines."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Cut engine/vehicle crafting time in half."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "gear-head",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000079",
    "name": "Goblin Explosives",
    "type": "skill",
    "img": "icons/svg/explosion.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Safely use Goblin Explosives. Critical Fails occur on Natural 1–4.",
      "upgrades": "Rank 5: Critical Fail on Nat 3-; determine type and status.\nRank 10: Critical Fail on Nat 2-; craft explosives with Sapper's Table.\nRank 15: Critical Fail on Nat 1 as usual; create raw materials.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Critical Fail on Nat 3-; determine type and status."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Critical Fail on Nat 2-; craft explosives with Sapper's Table."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Critical Fail on Nat 1 as usual; create raw materials."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "goblin-explosives",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000080",
    "name": "Good First Impression",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check when encountering neutral NPC/Mob. Mob approaches with wary curiosity.",
      "upgrades": "Rank 5: Lower level Mob won't attack party unless attacked.\nRank 10: Up to double level won't attack unless provoked.\nRank 15: Group of Mobs up to double level won't attack unless provoked.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Lower level Mob won't attack party unless attacked."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Up to double level won't attack unless provoked."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Group of Mobs up to double level won't attack unless provoked."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "good-first-impression",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000081",
    "name": "Improvised Explosive Device",
    "type": "skill",
    "img": "icons/svg/explosion.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Manipulate explosive material into bombs and traps without a Sapper's Table.",
      "upgrades": "Rank 5: Crafting takes half time.\nRank 10: Devices deal d10s of damage instead of d6s.\nRank 15: Devices can be set to trigger only against a specific Mob/NPC/crawler.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Crafting takes half time."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Devices deal d10s of damage instead of d6s."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Devices can be set to trigger only against a specific Mob/NPC/crawler."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "improvised-explosive-device",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000082",
    "name": "Hide in Shadows",
    "type": "skill",
    "img": "icons/svg/blind.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to become invisible to Mobs and HUDs while stationary in shadows or behind cover.",
      "upgrades": "Rank 5: Usable in dim light without cover.\nRank 10: Party rolls untrained normally.\nRank 15: Usable in lightly shaded area; can Step without breaking stealth.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Usable in dim light without cover."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party rolls untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Usable in lightly shaded area; can Step without breaking stealth."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "hide-in-shadows",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000083",
    "name": "Incendiary Device Handling",
    "type": "skill",
    "img": "icons/svg/explosion.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Safely handle and deploy incendiary devices.",
      "upgrades": "Rank 5: Determine type, status, and raw materials.\nRank 10: Craft incendiary devices with Sapper's Table.\nRank 15: Add +5 Splash at no added Difficulty; takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Determine type, status, and raw materials."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Craft incendiary devices with Sapper's Table."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 Spl",
          "debuff": "",
          "notes": "Add +5 Splash at no added Difficulty; takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "incendiary-device-handling",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000084",
    "name": "Infusion",
    "type": "skill",
    "img": "icons/svg/daze.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Infuse potion bonuses onto consumable items (e.g. Invisibility smoke bomb).",
      "upgrades": "Rank 5: One potion infuses 2 items at once.\nRank 10: One potion infuses 5 items at once.\nRank 15: One potion infuses 10 items at once.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "One potion infuses 2 items at once."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "One potion infuses 5 items at once."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "One potion infuses 10 items at once."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "infusion",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000085",
    "name": "Intimidate",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Cha-Opposed check to scare foe. On Success, target gains Staggered Debuff.",
      "upgrades": "Rank 5: Target can only move away until end of next round.\nRank 10: Target also gains Woozy Debuff.\nRank 15: Target drops held items and gains Paralyzed Debuff.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Target can only move away until end of next round."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Woozy",
          "notes": "Target also gains Woozy Debuff."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Paralyzed",
          "notes": "Target drops held items and gains Paralyzed Debuff."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "intimidate",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000086",
    "name": "Investigation",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Analyze environmental puzzle or clue area (takes 10 min, or 1 Action with Look for Clues).",
      "upgrades": "Rank 5: Advantage if familiar with area.\nRank 10: Each attempt takes 5 minutes.\nRank 15: Advantage if you know the parties involved.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage if familiar with area."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Each attempt takes 5 minutes."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage if you know the parties involved."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "investigation",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000087",
    "name": "Iron Stomach",
    "type": "skill",
    "img": "icons/svg/aura.svg",
    "system": {
      "rank": 0,
      "stat": "con",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Eat magic items! On Amazing Success+, gain 1 permanent Intelligence.",
      "upgrades": "Rank 5: On Crit, gain +1 additional permanent Int.\nRank 10: Standard Success+ grants +1 permanent Int; eat cursed items safely.\nRank 15: Choose which Stat is permanently increased.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 add",
          "debuff": "",
          "notes": "On Crit, gain +1 additional permanent Int."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 per",
          "debuff": "",
          "notes": "Standard Success+ grants +1 permanent Int; eat cursed items safely."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Choose which Stat is permanently increased."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "iron-stomach",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.con"
      ]
    }
  },
  {
    "_id": "dccskl0000000088",
    "name": "Jumping",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "With running start of 10 ft, leap distance up to Rank + Str ft with height 1 ft.",
      "upgrades": "Rank 5: Add Dex to height of Jump.\nRank 10: Gain +1 Evade Buff.\nRank 15: Leap distance is Rank + (Str × 2).",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Add Dex to height of Jump."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+1 Eva",
          "debuff": "",
          "notes": "Gain +1 Evade Buff."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Leap distance is Rank + (Str × 2)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "jumping",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000089",
    "name": "Leadership",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to coordinate multiple parties against Bosses. Advantage on first Attack.",
      "upgrades": "Rank 5: Extend free Call a Play to group Quest members.\nRank 10: Party members may perform a free Move Action.\nRank 15: Party members may perform a free Evade Action.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Extend free Call a Play to group Quest members."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party members may perform a free Move Action."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party members may perform a free Evade Action."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "leadership",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000090",
    "name": "Light on Your Feet",
    "type": "skill",
    "img": "icons/svg/paw.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Animals only. Leap distance up to Rank × 2 with height Dex × 2 ft.",
      "upgrades": "Rank 5: Distance Rank × 3, height Dex × 3.\nRank 10: Leap straight up without arcing trajectory.\nRank 15: Leap may last Rank in seconds (gliding).",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Distance Rank × 3, height Dex × 3."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Leap straight up without arcing trajectory."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Leap may last Rank in seconds (gliding)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "light-on-your-feet",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000091",
    "name": "Lockpicking",
    "type": "skill",
    "img": "icons/svg/padlock.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Pick mechanical locks (takes Floor number in minutes). Disadvantage without proper tools.",
      "upgrades": "Rank 5: Make no noise and leave no trace.\nRank 10: Takes half time; alter lock so key no longer works.\nRank 15: No Disadvantage when lacking tools.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Make no noise and leave no trace."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes half time; alter lock so key no longer works."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No Disadvantage when lacking tools."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "lockpicking",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000092",
    "name": "Lore",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Know neighborhood lore, Mob quirks, and local factions.",
      "upgrades": "Rank 5: Identify major factions in the area.\nRank 10: Aware of important local NPCs.\nRank 15: Advantage on first Cha check when encountering organized group.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Identify major factions in the area."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Aware of important local NPCs."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage on first Cha check when encountering organized group."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "lore",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000093",
    "name": "Negotiation",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Spend 5 min haggling price 10% in favor with merchant. Disadvantage with non-merchants.",
      "upgrades": "Rank 5: Party members also buy/sell at negotiated price.\nRank 10: Price adjusted an additional 10% in favor.\nRank 15: Price adjusted an additional 15% in favor.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party members also buy/sell at negotiated price."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Price adjusted an additional 10% in favor."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Price adjusted an additional 15% in favor."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "negotiation",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000094",
    "name": "Pathfinder",
    "type": "skill",
    "img": "icons/svg/direction.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "HUD map zooms out with thought by multiplier equal to Rank.",
      "upgrades": "Rank 5: Notified when near saferoom or stairwell.\nRank 10: See through HUD map while open.\nRank 15: Mobs appear as red dots on HUD map.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Notified when near saferoom or stairwell."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "See through HUD map while open."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mobs appear as red dots on HUD map."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "pathfinder",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000095",
    "name": "Perception",
    "type": "skill",
    "img": "icons/svg/eye.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Concentrate senses to notice hidden details and environmental cues. Used with Look for Clues.",
      "upgrades": "Rank 5: Halve penalty for cluttered areas.\nRank 10: Halve penalty for short notice window.\nRank 15: Halve penalty for distance range.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Halve penalty for cluttered areas."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Halve penalty for short notice window."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Halve penalty for distance range."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "perception",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000096",
    "name": "Performance",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Electrify an audience through acting, dancing, singing, or comedy.",
      "upgrades": "Rank 5: Choose additional performance specialty.\nRank 10: Coach others so they roll unskilled without Disadvantage.\nRank 15: Mimic another's performance after seeing it once.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Choose additional performance specialty."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Coach others so they roll unskilled without Disadvantage."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mimic another's performance after seeing it once."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "performance",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000097",
    "name": "Persuasion",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check after 10 min schmoozing to convince target to follow suggestion.",
      "upgrades": "Rank 5: Follow suggestion even if costly.\nRank 10: Follow suggestion even if dangerous.\nRank 15: Follow suggestion even if against their nature.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow suggestion even if costly."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow suggestion even if dangerous."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow suggestion even if against their nature."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "persuasion",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000098",
    "name": "Regeneration",
    "type": "skill",
    "img": "icons/svg/regen.svg",
    "system": {
      "rank": 0,
      "stat": "con",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Passive",
      "checkType": "Passive",
      "notes": "Heal 1 Health Bar slot at start of each round (if Rank >= Con) or every other round.",
      "upgrades": "Rank 5: Minor Injury ends after 5 min; Major Injury ends after 10 min.\nRank 10: Long-Term Minor ends after 20 min; Long-Term Major ends after 1 hr.\nRank 15: Time required to end injury debuffs halved.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Minor Injury",
          "notes": "Minor Injury ends after 5 min; Major Injury ends after 10 min."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Long-Term Minor ends after 20 min; Long-Term Major ends after 1 hr."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Time required to end injury debuffs halved."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "regeneration",
      "tags": [
        "action.passive",
        "kind.skill",
        "skillGroup.utility",
        "stat.con"
      ]
    }
  },
  {
    "_id": "dccskl0000000099",
    "name": "Religion",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Understand gods, rituals, boons, and followers.",
      "upgrades": "Rank 5: Identify followers on sight even when concealed.\nRank 10: Know how to sow discord among religion's followers.\nRank 15: Know specific strengths and weaknesses of gods.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Identify followers on sight even when concealed."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Know how to sow discord among religion's followers."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Know specific strengths and weaknesses of gods."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "religion",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000100",
    "name": "Repair",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Spend 2 hours to repair simple broken or damaged items.",
      "upgrades": "Rank 5: Repair things with moving parts.\nRank 10: Repairs take 1 hour.\nRank 15: Rebuild destroyed items.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Repair things with moving parts."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Repairs take 1 hour."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Rebuild destroyed items."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "repair",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000101",
    "name": "Ropework",
    "type": "skill",
    "img": "icons/svg/stone-path.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Tie secure knots, bind prisoners, and manage ropes.",
      "upgrades": "Rank 5: Use as Attack (range 10 ft vs Evade); target gains Held Debuff.\nRank 10: Whip line to untie knot from distance and recover rope.\nRank 15: Attack range increases to Strength score (min 15 ft).",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Held",
          "notes": "Use as Attack (range 10 ft vs Evade); target gains Held Debuff."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Whip line to untie knot from distance and recover rope."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Attack range increases to Strength score (min 15 ft)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "ropework",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000102",
    "name": "Riding",
    "type": "skill",
    "img": "icons/svg/paw.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Control living mounts during action and combat scenes. Rider attacks with Disadvantage.",
      "upgrades": "Rank 5: Mount has +5ft Move; no Disadvantage on Attacks while riding.\nRank 10: Mount has +10ft Move; party rolls untrained normally.\nRank 15: Mount has +15ft Move; Advantage on extreme stunts.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mount has +5ft Move; no Disadvantage on Attacks while riding."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mount has +10ft Move; party rolls untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Mount has +15ft Move; Advantage on extreme stunts."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "riding",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000103",
    "name": "Running",
    "type": "skill",
    "img": "icons/svg/wingfoot.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Short bursts of running and emergency sprints. Check every minute; +1 per 10ft Move.",
      "upgrades": "Rank 5: Permanent +5ft Move Buff; check every 2 minutes.\nRank 10: Additional permanent +10ft Move Buff; check every 4 minutes.\nRank 15: Additional permanent +15ft Move Buff; check every 6 minutes.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Permanent +5ft Move Buff; check every 2 minutes."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Additional permanent +10ft Move Buff; check every 4 minutes."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Additional permanent +15ft Move Buff; check every 6 minutes."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "running",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000104",
    "name": "Salvage",
    "type": "skill",
    "img": "icons/svg/chest.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Collect useful materials from deconstructed or failed craft items (takes 1 hour).",
      "upgrades": "Rank 5: Salvage checks take 30 minutes.\nRank 10: Recover 100% of important raw materials on Success.\nRank 15: On crafting Fail or Near Miss, reroll with Advantage (extra 15 min).",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Salvage checks take 30 minutes."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Recover 100% of important raw materials on Success."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "On crafting Fail or Near Miss, reroll with Advantage (extra 15 min)."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "salvage",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000105",
    "name": "Scutelliphily",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Collect, identify, sew, and iron patches onto clothing.",
      "upgrades": "Rank 5: Sew and iron patches onto clothing.\nRank 10: Craft enchanted patches (1 per gear slot, no accessory slot cost).\nRank 15: Takes half time; bonus value of patch enchantments increased by +1.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Sew and iron patches onto clothing."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Craft enchanted patches (1 per gear slot, no accessory slot cost)."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Takes half time; bonus value of patch enchantments increased by +1."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "scutelliphily",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000106",
    "name": "Shield Block",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed, Interrupt",
      "notes": "Requires shield. Spend 1 Action to make Shield Block check vs Mob to-hit. On Success, take half damage before DR.",
      "upgrades": "Rank 5: Usable against Spells and magical damage.\nRank 10: On Crit, make free Shield Bash Interrupt Attack (3d6 + Str Bludgeoning).\nRank 15: +1d6 Shield Bash damage; further reduce incoming damage by Str Mod.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Usable against Spells and magical damage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "On Crit, make free Shield Bash Interrupt Attack (3d6 + Str Bludgeoning)."
        },
        "rank15": {
          "damageDice": "1d6",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "+1d6 Shield Bash damage; further reduce incoming damage by Str Mod."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "shield-block",
      "tags": [
        "action.interrupt",
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000107",
    "name": "Sleight of Hand",
    "type": "skill",
    "img": "icons/svg/cowled.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to manipulate small objects without being spotted.",
      "upgrades": "Rank 5: Pick pockets of NPCs and Mobs.\nRank 10: Plant items on targets.\nRank 15: Manipulate items up to half own size.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Pick pockets of NPCs and Mobs."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Plant items on targets."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Manipulate items up to half own size."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "sleight-of-hand",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000108",
    "name": "Smithing",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Forge mundane metal items, weapons, and armor.",
      "upgrades": "Rank 5: Craft items up to +5 bonus level.\nRank 10: Craft items up to +10 bonus level.\nRank 15: Smithing takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 bon",
          "debuff": "",
          "notes": "Craft items up to +5 bonus level."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+10 bon",
          "debuff": "",
          "notes": "Craft items up to +10 bonus level."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Smithing takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "smithing",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000109",
    "name": "Stealth",
    "type": "skill",
    "img": "icons/svg/blind.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Opposed",
      "notes": "Int-Opposed check to move undetected. Success before combat grants 1 non-Attack Action.",
      "upgrades": "Rank 5: Surprise Action can be an Attack with Advantage.\nRank 10: Party rolls untrained normally.\nRank 15: Take full Move and Step; deal ×2 base damage dice on Surprise Attack.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Surprise Action can be an Attack with Advantage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party rolls untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Take full Move and Step; deal ×2 base damage dice on Surprise Attack."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "stealth",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000110",
    "name": "Streetwise",
    "type": "skill",
    "img": "icons/svg/cowled.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Navigate towns without attracting attention, contact criminal networks, and learn rumors.",
      "upgrades": "Rank 5: Hear or spread an additional rumor.\nRank 10: Quickly locate a hiding place in town.\nRank 15: Uncover leverage on important person in town.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Hear or spread an additional rumor."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Quickly locate a hiding place in town."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Uncover leverage on important person in town."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "streetwise",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000111",
    "name": "Survival",
    "type": "skill",
    "img": "icons/svg/cave.svg",
    "system": {
      "rank": 0,
      "stat": "con",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Survive dangerous wilderness and harsh conditions unscathed.",
      "upgrades": "Rank 5: No extra damage from Critical Fails.\nRank 10: Party rolls untrained normally.\nRank 15: No extra damage from Major Fails.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No extra damage from Critical Fails."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Party rolls untrained normally."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "No extra damage from Major Fails."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "survival",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.con"
      ]
    }
  },
  {
    "_id": "dccskl0000000112",
    "name": "Swimming",
    "type": "skill",
    "img": "icons/svg/stone-path.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Swim in dangerous waters. Check every 30 seconds. Gain Fatigued Debuff after 1 min.",
      "upgrades": "Rank 5: Fatigued Debuff delayed to 2 minutes.\nRank 10: Swim at full Move speed as Action.\nRank 15: Check every 5 minutes; Fatigued Debuff only on Critical Fail.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Fatigued",
          "notes": "Fatigued Debuff delayed to 2 minutes."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Swim at full Move speed as Action."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "Fatigued",
          "notes": "Check every 5 minutes; Fatigued Debuff only on Critical Fail."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "swimming",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000113",
    "name": "Tactics",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Limit once per combat. Grant self and party members +1 bonus to Attack, Damage, or Evade.",
      "upgrades": "Rank 5: Advantage if observing battlefield 5 min prior to combat.\nRank 10: Roll 2d10 when you Call a Play (choose one).\nRank 15: Bonus applies to all three disciplines simultaneously.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage if observing battlefield 5 min prior to combat."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Roll 2d10 when you Call a Play (choose one)."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Bonus applies to all three disciplines simultaneously."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "tactics",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000114",
    "name": "Tattoo Artistry",
    "type": "skill",
    "img": "icons/svg/book.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Create mundane and magical tattoos.",
      "upgrades": "Rank 5: Craft tattoos with up to +5 bonus level.\nRank 10: Craft tattoos with up to +10 bonus level.\nRank 15: Crafting tattoos takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 bon",
          "debuff": "",
          "notes": "Craft tattoos with up to +5 bonus level."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+10 bon",
          "debuff": "",
          "notes": "Craft tattoos with up to +10 bonus level."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Crafting tattoos takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "tattoo-artistry",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000115",
    "name": "Taunt",
    "type": "skill",
    "img": "icons/svg/sound.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Defensive",
      "checkType": "Opposed, Interrupt",
      "isAttack": false,
      "hasDamage": false,
      "baseDamage": "",
      "notes": "Int-Opposed check to redirect Mob Attack within 30 ft away from ally onto yourself.",
      "upgrades": "Rank 5: Free Evade check against each taunted Attack.\nRank 10: Affect Mobs within 60 feet.\nRank 15: Free Evade checks against taunted Attacks rolled with Advantage.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Free Evade check against each taunted Attack."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Affect Mobs within 60 feet."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Free Evade checks against taunted Attacks rolled with Advantage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "taunt",
      "tags": [
        "action.interrupt",
        "kind.skill",
        "skillGroup.utility",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000116",
    "name": "Throwing",
    "type": "skill",
    "img": "icons/svg/d20.svg",
    "system": {
      "rank": 0,
      "stat": "str",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed / Evade",
      "notes": "Throw items up to Str × 10 ft. Area targeting is Unopposed; targeting foes is vs Evade.",
      "upgrades": "Rank 5: Advantage when throwing to ally who wants to catch.\nRank 10: Choose direction on miss instead of rolling 1d8.\nRank 15: Throw range increases to Str × 20 feet.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage when throwing to ally who wants to catch."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Choose direction on miss instead of rolling 1d8."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Throw range increases to Str × 20 feet."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "throwing",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.str"
      ]
    }
  },
  {
    "_id": "dccskl0000000117",
    "name": "Tracking",
    "type": "skill",
    "img": "icons/svg/direction.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Locate and follow footprints or trails. Renew check every 15 minutes.",
      "upgrades": "Rank 5: Follow for 30 min per check; gain 1 target info.\nRank 10: Follow for 1 hr per check; gain 2 target info.\nRank 15: Follow for 2 hrs per check; gain 4 target info.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow for 30 min per check; gain 1 target info."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow for 1 hr per check; gain 2 target info."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Follow for 2 hrs per check; gain 4 target info."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "tracking",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000118",
    "name": "Trap Engineer",
    "type": "skill",
    "img": "icons/svg/hazard.svg",
    "system": {
      "rank": 0,
      "stat": "int",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Unopposed",
      "notes": "Craft traps using a Sapper's Table with Trap Module.",
      "upgrades": "Rank 5: Advantage when crafting non-explosive traps.\nRank 10: Traps can be set to trigger only against specific target.\nRank 15: Add +5 Splash to trap at no added Difficulty; takes half time.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Advantage when crafting non-explosive traps."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Traps can be set to trigger only against specific target."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "+5 Spl",
          "debuff": "",
          "notes": "Add +5 Splash to trap at no added Difficulty; takes half time."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "trap-engineer",
      "tags": [
        "kind.skill",
        "skillGroup.utility",
        "stat.int"
      ]
    }
  },
  {
    "_id": "dccskl0000000119",
    "name": "Zone of Control",
    "type": "skill",
    "img": "icons/svg/sword.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Utility",
      "checkType": "Passive, Interrupt",
      "notes": "Requires Reach weapon. When enemy enters adjacent space for first time in round, spend 1 Action to make Interrupt Attack with Disadvantage.",
      "upgrades": "Rank 5: Attack no longer made with Disadvantage.\nRank 10: Target is pushed 5 feet.\nRank 15: Attack check made with Advantage.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Attack no longer made with Disadvantage."
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Target is pushed 5 feet."
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": "Attack check made with Advantage."
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "zone-of-control",
      "tags": [
        "action.interrupt",
        "kind.skill",
        "skillGroup.utility",
        "stat.dex"
      ]
    }
  },
  {
    "_id": "dccskl0000000120",
    "name": "Call a Play",
    "type": "skill",
    "img": "icons/svg/combat.svg",
    "system": {
      "rank": 0,
      "stat": "cha",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Combat",
      "checkType": "Standard Action (2d6)",
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "baseDamage": "",
      "notes": "Standard Action. Encourage an ally. Roll 2d6; targeted ally adds higher d6 to upcoming Skill Check or damage roll.",
      "upgrades": "Tactical combat maneuver.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "call-a-play",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.cha"
      ]
    }
  },
  {
    "_id": "dccskl0000000121",
    "name": "Intervene",
    "type": "skill",
    "img": "icons/svg/shield.svg",
    "system": {
      "rank": 0,
      "stat": "dex",
      "skillType": "Utility",
      "type": "Utility",
      "category": "Combat",
      "checkType": "Interrupt Action (1d6)",
      "isAttack": false,
      "isTechnique": false,
      "hasDamage": false,
      "baseDamage": "",
      "notes": "Interrupt Action. Assist an ally's roll. Roll 1d6 and add result directly to party member's d20 roll.",
      "upgrades": "Tactical combat maneuver.",
      "checked": false,
      "damageModifiers": [],
      "rankBreaks": {
        "rank5": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank10": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank15": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        },
        "rank20": {
          "damageDice": "",
          "baseDiceCountMod": "",
          "rankDamageDice": 0,
          "buffsResistances": "",
          "debuff": "",
          "notes": ""
        }
      },
      "identifier": "intervene",
      "tags": [
        "kind.skill",
        "skillGroup.combat",
        "stat.dex"
      ]
    }
  }
];
