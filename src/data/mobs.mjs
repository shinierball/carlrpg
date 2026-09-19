/**
 * Dungeon Crawler Carl RPG - Official Mobs Dataset
 * Populated from the official Game Master's Toolkit - Entities List.
 */

export const DCC_MOBS = [
  {
    "_id": "dccmob0000000001",
    "name": "Aranaea Magnus",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 12,
          "unenhanced": 12,
          "mod": 4
        },
        "int": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "cha": {
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 40,
          "max": 40,
          "temp": 0,
          "pct": 100,
          "bars": 10,
          "hpPerBar": 4
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 4
        },
        "dr": {
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "speed": {
          "move": 30,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Venom Sac, Burning Silk Glands, Spider Silk",
        "xp": 350,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 7,
        "classification": "Neighborhood Boss",
        "creatureType": "Monstrous",
        "floor": "Floor 1",
        "location": "Aranaea's Lair",
        "description": "Aranaea Magnus is an enormous spider the size of a bull, with talons on the ends of her eight arms and numerous strands of webbing streaming off her sides. Her main strengths are her sharp talons, her ability to generate a special web fluid that burns anything caught in it, and her pedipalps capable of paralyzing her prey.",
        "aiDescription": "Aranaea Magnus, the Great Big Spider Level 7 Neighborhood Boss! Our Boss Sense is tingling! Looks like the crawlers got themselves in a sticky situation! Aranaea Magnus is the biggest, baddest arachnid on the block, and her lair is full of the bodies to prove it. You'd think her bad attitude is the worst thing about her, but this angry spider menace has a bottomless appetite and a need to sate her hunger at all costs! If crawlers think she's angry now, then they better not mess with her eggs: Aranaea will shred anyone who threatens her babies or the Slimy Croakers she keeps as pets.",
        "notes": "Eight Middle Fingers to Gravity—An Aranaea Magnus can move along vertical surfaces and upside down on ceilings as though on the ground.\n\nWebbing—Aranaea Magnus Web attacks cover surfaces in the affected area when it doesn't hit a target. Entities who enter a webbed space must make a STR Stat Check or become Webbed. Regardless of the result, the entity clears the space and its adjacent spaces of webs.\n\nTangled—The Aranaea Magnus tangles easily in its own webbing. It suffers a -10 Move penalty in webbing.",
        "special": "Eight Middle Fingers to Gravity (Climb/Ceiling move); Webbing (STR check to avoid Webbed); Tangled (-10 Move in webbing).",
        "source": "Page 59, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000001",
        "name": "Venomous Fangs",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "14+F to hit, 5ft range (once per round). On an Evade Major Fail or worse, the target gains the Poisoned Debuff and a -1 penalty to Evade."
        }
      },
      {
        "_id": "dccatkmob0000002",
        "name": "Web",
        "type": "attack",
        "img": "icons/svg/net.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 90ft range, 5ft Blast radius. Any hit crawlers have Disadvantage on next Evade and can't Step until an Action is used to pull off webs."
        }
      },
      {
        "_id": "dccatkmob0000003",
        "name": "Rending Leg-Claws",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "14+F to hit, 10ft range."
        }
      },
      {
        "_id": "dccatkmob0000004",
        "name": "Caustic Silk Spray",
        "type": "attack",
        "img": "icons/svg/acid.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Acid",
          "effects": "14+F to hit, 30ft Cone (once per round). On an Evade Major Fail or worse, the target gains the Webbed Debuff and takes 1d6+F Acid at the end of each round."
        }
      },
      {
        "_id": "dccatkmob0000005",
        "name": "Drop",
        "type": "attack",
        "img": "icons/svg/falling.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d10",
          "damageStat": "int",
          "damageType": "Bludgeoning",
          "effects": "12+F to hit. Once at start of a fight, can Drop when above ground, attacking enemies landed on and adjacent. If area contains Slimy Croaker slime, slips and loses 2 Health Bar slots. If Drop misses all crawlers, Stunned and loses remaining Actions this round and 1 Action next round."
        }
      },
      {
        "_id": "dccatkmob0000006",
        "name": "Paralyzing Pedipalps",
        "type": "attack",
        "img": "icons/svg/daze.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 5ft range (once per round). On an Evade Major Fail or worse, the target gains the Staggered Debuff."
        }
      },
      {
        "_id": "dcclootmob000001",
        "name": "Venom Sac",
        "type": "loot",
        "img": "icons/svg/potion.svg",
        "system": {
          "quantity": 1,
          "notes": "A gland dripping with potent arachnid venom. Can be used in alchemy or weapon coating.",
          "description": "A gland dripping with potent arachnid venom. Can be used in alchemy or weapon coating."
        }
      },
      {
        "_id": "dcclootmob000002",
        "name": "Burning Silk Glands",
        "type": "loot",
        "img": "icons/svg/acid.svg",
        "system": {
          "quantity": 1,
          "notes": "Internal organs producing caustic, burning silk fluid.",
          "description": "Internal organs producing caustic, burning silk fluid."
        }
      },
      {
        "_id": "dcclootmob000003",
        "name": "Spider Silk",
        "type": "loot",
        "img": "icons/svg/net.svg",
        "system": {
          "quantity": 1,
          "notes": "Incredibly tough and sticky giant spider webbing. Valuable crafting material.",
          "description": "Incredibly tough and sticky giant spider webbing. Valuable crafting material."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000002",
    "name": "Chef BoyardOoze",
    "type": "mob",
    "img": "icons/svg/hazard.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 12,
          "max": 12,
          "temp": 0,
          "pct": 100,
          "bars": 4,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 10,
          "step": 5
        },
        "aiFavor": 0,
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Dented tomato sauce can, acidic residue",
        "xp": 80,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Ooze",
        "floor": "Floor 1",
        "location": "Kitchens & Sewers",
        "description": "Chef BoyardOozes are tomato-sauce slimes that leave slick trails that can trip creatures with low Dexterity. An empty sauce can sits atop their forms like crowns. They generate tendrils dripping with cheese strings to drag foes into their acidic bodies, which quickly and painfully dissolve organic material and metal. Their bodies have a high viscosity that hinders creatures from escaping, and they regenerate Health. While they aren't intelligent, they instinctively lurch toward living creatures. Extreme temperatures stop their Health regeneration and can disable them entirely. High temperatures thin their consistency until they dissolve, and cold temperatures temporarily freeze them solid.",
        "aiDescription": "Chef BoyardOoze, Level 4 It turns out that just watching mafia movies doesn't make one a Michelin-recognized chef. Rat-kin chefs are far more interested in mobster suits and tough talk than Italian cucina povera. Half-used cans of tomato sauce sit forgotten until they go bad, then get slurped by Clurichauns who think they're natural immune boosters. The Fairy-flavored remains turn into this sentient slurry that's so full of preservatives it even developed rapid regeneration. Buon appetito!",
        "notes": "Chef BoyardOoze leaves slick trails that add +2 Difficulty to Dexterity-based Skills.\n\nCold Vulnerability—Attacks that do Ice damage to Chef BoyardOozes bypass DR and do ×2 damage.\n\nHeat Vulnerability—Attacks that do Fire damage to Chef BoyardOozes bypass DR and do ×2 damage.\n\nRegenerate Health—Chef BoyardOozes heals 1 Health Bar slot at the end of each round.",
        "special": "Slick trails (+2 Difficulty to DEX skills); Cold Vulnerability (Ice bypasses DR, x2 dmg); Heat Vulnerability (Fire bypasses DR, x2 dmg); Regenerate Health (heals 1 HB slot/round).",
        "source": "Page 62, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000007",
        "name": "Tendril",
        "type": "attack",
        "img": "icons/svg/acid.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 10ft range. On Evade Major Fail or worse, the crawler gains the Held Debuff and the Saucy Debuff: Take 1d6+F Acid at the end of each round until combat ends."
        }
      },
      {
        "_id": "dcclootmob000004",
        "name": "Dented Tomato Sauce Can",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "An empty tin can worn like a crown, crusted with acidic tomato residue.",
          "description": "An empty tin can worn like a crown, crusted with acidic tomato residue."
        }
      },
      {
        "_id": "dcclootmob000005",
        "name": "Acidic Slime Residue",
        "type": "loot",
        "img": "icons/svg/acid.svg",
        "system": {
          "quantity": 1,
          "notes": "A bubbling vial of acidic tomato slurry that dissolves organic material.",
          "description": "A bubbling vial of acidic tomato slurry that dissolves organic material."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000003",
    "name": "Rat Brute",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 12,
          "max": 12,
          "temp": 0,
          "pct": 100,
          "bars": 4,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Crude Knife, Crossbow Bolts, Empty energy drink can",
        "xp": 80,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Rat Warrens",
        "description": "Rat Brutes are heavily muscled Rat-kin with distorted proportions: thick shoulders, knotted forearms, and an overdeveloped jaw that juts forward beneath small unfocused eyes. Blood and sports drinks mat their patchy fur. Their attacks rely on brute force: tackling foes and crushing them with their arms, charging at full speed to slam targets (and themselves) into obstacles, and shoving opponents off balance.",
        "aiDescription": "Rat Brute, Level 4 Most Rat-kin are twitchy flea-bitten little cowards who would sooner shank you in the kidney than look you in the eye. Then there's these guys. Rat Brutes are what happens when Rat-kin decide they're tired of being pushed around. They pump themselves full of magical growth hormones and take any excuse to show off their bulging biceps. Warning: Do not try to reason with Rat Brutes. Their brains shrank to the size of a dried raisin to make room for more jaw muscles.",
        "notes": "Roid Rage—Rat Brutes are very volatile: sudden noises, bright lights, or perceived insults can trigger an immediate rage response. This doubles the Stat Mod bonus to their damage rolls. In addition, their chemically-fueled endurance allows them to push through pain and fight past \"reasonable\" limits. Rat Brutes can attack one more time after they have been reduced to 0% HB.\n\nWeak-Minded—Rat Brutes are difficult to Intimidate, but attempts to charm and other mind-control effects are made with Advantage.",
        "special": "Roid Rage (doubles stat mod damage bonus; attacks once more after reduced to 0% HB); Weak-Minded (hard to Intimidate, charm/mind-control made with Advantage).",
        "source": "Page 62, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000008",
        "name": "Knife",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000009",
        "name": "Crossbow",
        "type": "attack",
        "img": "icons/svg/target.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "",
          "damageType": "Piercing",
          "effects": "12+F to hit, 50ft range."
        }
      },
      {
        "_id": "dcclootmob000006",
        "name": "Crude Knife",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "A rusted, jagged shiv fashioned from dungeon scrap metal.",
          "description": "A rusted, jagged shiv fashioned from dungeon scrap metal."
        }
      },
      {
        "_id": "dcclootmob000007",
        "name": "Crossbow Bolts",
        "type": "loot",
        "img": "icons/svg/target.svg",
        "system": {
          "quantity": 10,
          "notes": "Crude bolts notched for rat-kin crossbows.",
          "description": "Crude bolts notched for rat-kin crossbows."
        }
      },
      {
        "_id": "dcclootmob000008",
        "name": "Empty Energy Drink Can",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "Crushed aluminum can that once contained a radioactive energy beverage.",
          "description": "Crushed aluminum can that once contained a radioactive energy beverage."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000004",
    "name": "Rat Shaman",
    "type": "mob",
    "img": "icons/svg/wand.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 10,
          "max": 10,
          "temp": 0,
          "pct": 100,
          "bars": 5,
          "hpPerBar": 2
        },
        "mana": {
          "value": 10,
          "max": 10,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Bone trinkets, scavenged burlap robes, glowing trash",
        "xp": 120,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Rat Warrens",
        "description": "Rat Shamans are lanky Rat-kin draped in scavenged burlap bags and jewelry made from bones, nails, and bits of bright trash. They constantly mutter to themselves while tracing symbols in grime to cast Spells. Their fragility from years of drug abuse means they prefer to stay at range behind tougher Rat-kin.",
        "aiDescription": "Rat Shaman, Level 5 While the Brutes were getting jacked, the Shamans were getting weird. They spent their youth huffing toxic sewer fumes and \"communing\" with the Great Vermin in the Sky. But don't let their coughing fits fool you; they somehow got real magical powers from that nonsense. They mainly launch fireballs but can also transmit plagues.",
        "notes": "Prefers to stay at range behind tougher Rat-kin and disengages if threatened in melee.",
        "special": "Backline spellcaster; flees or disengages if cornered in melee.",
        "source": "Page 63, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000010",
        "name": "Clap Cloud Spell",
        "type": "attack",
        "img": "icons/svg/daze.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "int",
          "damageType": "Force",
          "effects": "14+F to hit, 50ft range, 20ft Blast radius. On an Evade Major Fail or worse, the crawler gains the Queasy Debuff."
        }
      },
      {
        "_id": "dccatkmob0000011",
        "name": "Firestrike Spell",
        "type": "attack",
        "img": "icons/svg/fire.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Fire",
          "effects": "14+F to hit, 30ft range (once per round)."
        }
      },
      {
        "_id": "dccatkmob0000012",
        "name": "Mini Fireball Spell",
        "type": "attack",
        "img": "icons/svg/fire.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "int",
          "damageType": "Fire",
          "effects": "14+F to hit, 60ft range, 15ft Blast radius."
        }
      },
      {
        "_id": "dcclootmob000009",
        "name": "Bone Trinkets",
        "type": "loot",
        "img": "icons/svg/bone.svg",
        "system": {
          "quantity": 1,
          "notes": "Charms and fetishes carved from small rodent and crawler bones.",
          "description": "Charms and fetishes carved from small rodent and crawler bones."
        }
      },
      {
        "_id": "dcclootmob000010",
        "name": "Scavenged Burlap Robes",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Torn burlap sacks stitched together with twine, smelling faintly of sulfur.",
          "description": "Torn burlap sacks stitched together with twine, smelling faintly of sulfur."
        }
      },
      {
        "_id": "dcclootmob000011",
        "name": "Glowing Trash",
        "type": "loot",
        "img": "icons/svg/sparkles.svg",
        "system": {
          "quantity": 1,
          "notes": "Luminescent dungeon rubbish emitting an eerie magical glow.",
          "description": "Luminescent dungeon rubbish emitting an eerie magical glow."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000005",
    "name": "Rat Hooligan",
    "type": "mob",
    "img": "icons/svg/sword.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        },
        "int": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 16,
          "max": 16,
          "temp": 0,
          "pct": 100,
          "bars": 8,
          "hpPerBar": 2
        },
        "mana": {
          "value": 11,
          "max": 11,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Quality Longsword, Artisanal Corpse Starch Crust, 2d6 copper nibs",
        "xp": 220,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 8,
        "classification": "Mob",
        "creatureType": "Rat Hybrid",
        "floor": "Floor 1",
        "location": "Rat Warrens",
        "description": "Rat Hooligans are the offspring of a Shaman and a Brute, possessing the strengths of both. They're lean but strong, magical but lucid enough to remember what they ate for breakfast. Fights are dirty affairs in which they exploit any advantage.",
        "aiDescription": "Rat Hooligan, Level 8 Crawlers, you found the dungeon's \"premium\" rat product. When a Shaman and a Brute love each other very much and do dirty rat things together, you get Rat Hooligans! Because they're actually capable of basic addition and don't try to eat their own feet, they get pampered with the pizza dough made from artisanal corpse starch. As a quick procedural note: these guys are really hard to replace, so it's better for all of us if you just let them eat your face off.",
        "notes": "Sets ambushes to pick off isolated targets and then retreats to prepare for another strike. Coordinates well with allies.",
        "special": "Ambush tactician; coordinates attacks and heals injured allies with Heal Others Spell.",
        "source": "Page 64, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000013",
        "name": "Longsword",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "con",
          "damageType": "Slashing",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000014",
        "name": "Firebolt Spell",
        "type": "attack",
        "img": "icons/svg/fire.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "con",
          "damageType": "Fire",
          "effects": "14+F to hit, 30ft range."
        }
      },
      {
        "_id": "dccatkmob0000015",
        "name": "Heal Others Spell",
        "type": "attack",
        "img": "icons/svg/heal.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "",
          "damageType": "Healing",
          "effects": "None to hit, 10ft range. Heals one target within 10 feet for 1d6 Health Bar slots."
        }
      },
      {
        "_id": "dcclootmob000012",
        "name": "Quality Longsword",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "A surprisingly well-maintained steel longsword looted from a fallen crawler.",
          "description": "A surprisingly well-maintained steel longsword looted from a fallen crawler."
        }
      },
      {
        "_id": "dcclootmob000013",
        "name": "Artisanal Corpse Starch Crust",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "A hardened, baked crust of dungeon ration starch.",
          "description": "A hardened, baked crust of dungeon ration starch."
        }
      },
      {
        "_id": "dcclootmob000014",
        "name": "Copper Nibs",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 7,
          "notes": "Currency of the dungeon. 2d6 copper nibs.",
          "description": "Currency of the dungeon. 2d6 copper nibs."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000006",
    "name": "Critical Consensus",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 15,
          "unenhanced": 15,
          "mod": 4
        },
        "int": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "con": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "dex": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "cha": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 55,
          "max": 55,
          "temp": 0,
          "pct": 100,
          "bars": 11,
          "hpPerBar": 5
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 10,
          "step": 5
        },
        "aiFavor": 0,
        "size": "Huge",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Smashed smartphones, Yelp gold badges, gourmet restaurant vouchers",
        "xp": 450,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 8,
        "classification": "Neighborhood Boss",
        "creatureType": "Zombie",
        "floor": "Floor 1",
        "location": "Gourmet Dining Halls",
        "description": "The Critical Consensus is made entirely of arms (with hands) and heads. The arms/hands either grasp food or pull cell phones from the recesses of its stitched-together body to take selfies. The heads talk nonstop about fancy restaurants they visited and inane food trivia.",
        "aiDescription": "The Critical Consensus. Shambling Berserker Made of Restaurant Influencers Level 8 Neighborhood Boss! Crawlers, congratulations. You took a heartfelt story about love, food, and forced eugenics... and somehow made it worse. Meet the Critical Consensus! It's a Shambling Berserker stitched together from the remains of twenty-six failed food influencers. Now in zombie form, they're still doing what they did in life: chasing free meals and filming their own faces while they chew. Be warned: Like any social media presence, their public image isn't who they are when no one's looking. They're slow and clumsy under bright light but four times more dangerous in darkness. So, give us your best duck face! Whether you emerge winner, winner, or chicken dinner, this battle will be immortalized in a blog post. Like and subscribe, bitches!",
        "notes": "Constant Hunger—As an Action, Critical Consensus devours any food it sees and heals 1d4 Health Bar slots each time it does so. In addition, Critical Consensus will single-mindedly attack any crawler with food in their Inventory, and moves twice as fast as it does so.\n\nFoodporn—The first time Critical Consensus applies the Held Debuff to each crawler, it snaps a picture and posts it in a public forum.\n\nOver-Seasoned—Food that has been oversalted will reduce Critical Consensus by 1 Health Bar slot rather than heal it.\n\nPower Boost—Critical Consensus is a Shambling Berserker and as such is more powerful in the dark—its Stat Mod to damage is quadrupled.",
        "special": "Constant Hunger (devours food to heal 1d4 HB; 2x speed toward food); Foodporn (snaps photo when applying Held); Over-Seasoned (oversalted food deals 1 HB damage); Power Boost (quadruples stat mod damage in darkness).",
        "source": "Page 69, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000016",
        "name": "Slam",
        "type": "attack",
        "img": "icons/svg/falling.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Necrotic",
          "effects": "14+F to hit, 5ft range. Any hit crawler gains the Held Debuff. On an Evade Major Fail or worse, the crawler also gains the Staggered Debuff."
        }
      },
      {
        "_id": "dccatkmob0000051",
        "name": "Devour",
        "type": "attack",
        "img": "icons/svg/heal.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "",
          "damageType": "Healing",
          "effects": "Action. Constant Hunger: Devours any food seen or an already deceased entity to heal 1d4 Health Bar slots."
        }
      },
      {
        "_id": "dcclootmob000015",
        "name": "Smashed Smartphones",
        "type": "loot",
        "img": "icons/svg/hazard.svg",
        "system": {
          "quantity": 1,
          "notes": "Cracked smartphones still buzzing with phantom notifications and 1-star reviews.",
          "description": "Cracked smartphones still buzzing with phantom notifications and 1-star reviews."
        }
      },
      {
        "_id": "dcclootmob000016",
        "name": "Yelp Gold Badges",
        "type": "loot",
        "img": "icons/svg/shield.svg",
        "system": {
          "quantity": 1,
          "notes": "Tacky gold-plated pins awarded to top dungeon reviewers.",
          "description": "Tacky gold-plated pins awarded to top dungeon reviewers."
        }
      },
      {
        "_id": "dcclootmob000017",
        "name": "Gourmet Restaurant Vouchers",
        "type": "loot",
        "img": "icons/svg/book.svg",
        "system": {
          "quantity": 1,
          "notes": "Expired coupon vouchers for Floor 1 eateries.",
          "description": "Expired coupon vouchers for Floor 1 eateries."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000007",
    "name": "Canis Knights",
    "type": "mob",
    "img": "icons/svg/shield.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 10,
          "max": 10,
          "temp": 0,
          "pct": 100,
          "bars": 5,
          "hpPerBar": 2
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Pint-sized fantasy armor, Canine insignia spear, Polished steel dog tags",
        "xp": 110,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1 / Arcadia",
        "location": "Arcadia Guard Posts",
        "description": "Canis Knights serve as one of the primary guard Mobs for Arcadia. Created by designers with a limited understanding of how the monsters in old Earth video games work, these dog-like soldiers wearing fantasy armor are assigned to guard specific areas and march in formation until they detect a threat.",
        "aiDescription": "Canis Knight, Level 5 I'm not gonna lie, these things seem like they'd be cute! Fluffy fur, pint-sized armor-you'd think they'd be your best friend... until they move in to attack. Don't let their cartoonish appearance fool you; those spears and swords are plenty sharp, and they fight like trained warriors.",
        "notes": "Adorable—Canis Knights are furry, petite, and canine-appearing. This makes them utterly adorable and prompts many attempts to pet them. Crawlers that encounter Canis Knights for the first time gain the Fascinated Debuff: Roll with Disadvantage during the first round of combat.\n\nStrict Adherence—Canis Knights always do precisely as directed, doing little or no thinking on their own. If given a certain schedule or patrol route to follow, they will do so to the letter without deviation.",
        "special": "Adorable (crawlers encounter gain Fascinated: Disadvantage in 1st round); Strict Adherence (never deviates from patrol/orders).",
        "source": "Page 87, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000017",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "13+F to hit, 30ft range."
        }
      },
      {
        "_id": "dccatkmob0000018",
        "name": "Sword",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000018",
        "name": "Pint-Sized Fantasy Armor",
        "type": "loot",
        "img": "icons/svg/shield.svg",
        "system": {
          "quantity": 1,
          "notes": "Miniature plate mail tailored for heroic, adorable canines.",
          "description": "Miniature plate mail tailored for heroic, adorable canines."
        }
      },
      {
        "_id": "dcclootmob000019",
        "name": "Canine Insignia Spear",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "A small thrusting spear stamped with a loyal pawprint crest.",
          "description": "A small thrusting spear stamped with a loyal pawprint crest."
        }
      },
      {
        "_id": "dcclootmob000020",
        "name": "Polished Steel Dog Tags",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 1,
          "notes": "Shiny identification tags inscribed with knightly canine oaths.",
          "description": "Shiny identification tags inscribed with knightly canine oaths."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000008",
    "name": "Grimes",
    "type": "mob",
    "img": "icons/svg/hazard.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 20,
          "max": 20,
          "temp": 0,
          "pct": 100,
          "bars": 5,
          "hpPerBar": 4
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 15,
          "step": 5
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Acidic slime globule, tutorial monster tokens",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Ooze",
        "floor": "Arcadia / Tutorial",
        "location": "Cracks & Crevices",
        "description": "Grimes were a tutorial creature that could be produced as quickly and cheaply as possible. To help create more Mobs more efficiently, they were given a self-replication feature so that new crawlers could test out a variety of combat moves on them without straining the system.",
        "aiDescription": "Grimes, Level 5 Just when you think I'd run out of things to hate, here come the Grimes! Have you ever wondered what it would be like to stick your hand in a jellyfish? Well, now you can, as these stinging buggers hide in cracks and crevices before oozing out to strike. Just when you think you've killed one, it splits in two! How's that even fair?",
        "notes": "The first time during the entire combat that a Grime is killed, it splits in two. Contrary to what the AI said, they don't all split in two. Just the first.",
        "special": "Split (the first time a Grime is killed in combat, it splits into two full-health Grimes).",
        "source": "Page 87, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000019",
        "name": "Gloop",
        "type": "attack",
        "img": "icons/svg/acid.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "dex",
          "damageType": "Acid",
          "effects": "11+F to hit, 30ft range. On an Evade Major Fail or worse, the crawler gains the Dissolving Debuff: Take 1d6+F Acid at the end of each round until combat ends."
        }
      },
      {
        "_id": "dccatkmob0000020",
        "name": "Tendril",
        "type": "attack",
        "img": "icons/svg/acid.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler gains the Held Debuff."
        }
      },
      {
        "_id": "dcclootmob000021",
        "name": "Acidic Slime Globule",
        "type": "loot",
        "img": "icons/svg/acid.svg",
        "system": {
          "quantity": 1,
          "notes": "A gelatinous blob of acidic tutorial slime.",
          "description": "A gelatinous blob of acidic tutorial slime."
        }
      },
      {
        "_id": "dcclootmob000022",
        "name": "Tutorial Monster Tokens",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 1,
          "notes": "Plastic promotional tokens commemorating Level 1 encounters.",
          "description": "Plastic promotional tokens commemorating Level 1 encounters."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000009",
    "name": "Trollogs",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "con": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 10,
          "max": 10,
          "temp": 0,
          "pct": 100,
          "bars": 5,
          "hpPerBar": 2
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Bone Javelins, Shattered mirror shards, Sprite disguise garments",
        "xp": 120,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Arcadia",
        "location": "Arcadia Woodlands",
        "description": "Trollogs are gray-skinned humanoids with thick hair spreading down their heads and across their backs. Their sharp teeth and glowing red eyes give them a frightening appearance, but that pales in comparison to their ability to shapeshift into the appearance of Sprites. They're known for using this ability to get closer to their prey before they revert to their original form and attack.",
        "aiDescription": "Trollog. Level 5. The Sprites may be annoying, but you can usually just walk around them after you engage them once in conversation. What's annoying but also dangerous are those who go beyond simple-minded peasants. Trollogs love to get close to you so they can transform and attack, and they often take on the appearance of Sprites to do it.",
        "notes": "Mirror Change—If a Trollog is exposed to a mirror, the mirror will crack and the Trollog will be forced to transform into their original form.\n\nShapeshifting—Trollogs can change their appearance to look like Sprites in order to get close to an enemy and attack them in their natural frightening form.",
        "special": "Mirror Change (exposure to mirror cracks it and forces natural form); Shapeshifting (appears as harmless Sprite until striking).",
        "source": "Page 88, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000021",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000022",
        "name": "Javelin",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "12+F to hit, 30ft range; once per combat."
        }
      },
      {
        "_id": "dcclootmob000023",
        "name": "Bone Javelins",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 2,
          "notes": "Sharpened femur javelins wrapped in sinew.",
          "description": "Sharpened femur javelins wrapped in sinew."
        }
      },
      {
        "_id": "dcclootmob000024",
        "name": "Shattered Mirror Shards",
        "type": "loot",
        "img": "icons/svg/hazard.svg",
        "system": {
          "quantity": 1,
          "notes": "Reflective glass slivers that reveal true forms.",
          "description": "Reflective glass slivers that reveal true forms."
        }
      },
      {
        "_id": "dcclootmob000025",
        "name": "Sprite Disguise Garments",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Illusion-woven fairy garments used to deceive unsuspecting crawlers.",
          "description": "Illusion-woven fairy garments used to deceive unsuspecting crawlers."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000010",
    "name": "Dread Wizard Grimblegore",
    "type": "mob",
    "img": "icons/svg/wand.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "int": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "con": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "dex": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "cha": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 60,
          "max": 60,
          "temp": 0,
          "pct": 100,
          "bars": 12,
          "hpPerBar": 5
        },
        "mana": {
          "value": 10,
          "max": 10,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 4
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Dread Robes of Grimblegore, Potion of Frog Leaping, Arcane Grime Focus",
        "xp": 600,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 10,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Arcadia",
        "location": "Grimblegore's Sanctum",
        "description": "Grimblegore is the real deal. He can summon Mobs to defend himself, and he can unleash fireballs from his webbed hands. He pulls mysterious potions from his robe and chugs them mid-battle while his powerful legs allow long leaps that smash those in his path.",
        "aiDescription": "Dread Wizard Grimblegore, the Lord of the Grimes. Level 10 Neighborhood Boss! Prepare for a cutscene like you wouldn't believe - it's time for the crawlers to take on the big guy! Dread Wizard Grimblegore is the self-appointed overlord of Arcadia, and as far as you and me are concerned, he's got the firepower to prove it. His interests include going for long hops on the beach, enjoying a lovely soak in swamps, and raising the dead to eviscerate his enemies-pretty standard for an amphibian-themed wizard.",
        "notes": "Dread Wizard Grimblegore always attacks with Fireball-Fireball-Jump Smash-Jump Smash-Gloat-Gloat. Fireball is rolled with Disadvantage, so the Difficulty to Evade is reduced by 5, and crawlers get a free Evade Check against it.",
        "special": "Fixed Attack Sequence (Fireball -> Fireball -> Jump Smash -> Jump Smash -> Gloat -> Gloat); Fireball Disadvantage (Evade DC reduced by 5, crawlers get free Evade).",
        "source": "Page 93, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000023",
        "name": "Fireball Spell",
        "type": "attack",
        "img": "icons/svg/fire.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d12",
          "damageStat": "int",
          "damageType": "Fire",
          "effects": "14+F to hit, 80ft range, 20ft Blast radius +20ft Splash. Rolled with Disadvantage: Difficulty to Evade reduced by 5, crawlers get free Evade Check."
        }
      },
      {
        "_id": "dccatkmob0000024",
        "name": "Gloat Spell",
        "type": "attack",
        "img": "icons/svg/sound.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Sonic",
          "effects": "14+F to hit, 50ft range, 10ft Blast radius. On an Evade Major Fail or worse, the crawler gains the Muted Debuff."
        }
      },
      {
        "_id": "dccatkmob0000025",
        "name": "Jump Smash",
        "type": "attack",
        "img": "icons/svg/falling.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 30ft range. On an Evade Major Fail or worse, the crawler gains the Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob000026",
        "name": "Dread Robes of Grimblegore",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Dramatic, billowy wizard robes embroidered with tacky flaming skulls.",
          "description": "Dramatic, billowy wizard robes embroidered with tacky flaming skulls."
        }
      },
      {
        "_id": "dcclootmob000027",
        "name": "Potion of Frog Leaping",
        "type": "loot",
        "img": "icons/svg/potion.svg",
        "system": {
          "quantity": 1,
          "notes": "An effervescent green tonic that grants incredible vertical leap for 1 minute.",
          "description": "An effervescent green tonic that grants incredible vertical leap for 1 minute."
        }
      },
      {
        "_id": "dcclootmob000028",
        "name": "Arcane Grime Focus",
        "type": "loot",
        "img": "icons/svg/wand.svg",
        "system": {
          "quantity": 1,
          "notes": "A grime-encrusted wand focusing necrotic and fire evocation spells.",
          "description": "A grime-encrusted wand focusing necrotic and fire evocation spells."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000011",
    "name": "Cocaine Kobold",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "int": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 18,
          "max": 18,
          "temp": 0,
          "pct": 100,
          "bars": 6,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Mirror pouch of suspicious white powder, Short spear, Reptilian leather scraps",
        "xp": 140,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Lizard",
        "floor": "Floor 2",
        "location": "Suburban Enclaves",
        "description": "These three-foot-tall reptiles served for centuries as whipping boys for novices just dipping their toes into the adventuring lifestyle. These constant attacks caused them to seek solace through the heavy use of mind-numbing pharmaceuticals. Their current drug of choice is cocaine, which fuels these cold-blooded canine-busters' never-ending desire to take revenge on all adventurers.",
        "aiDescription": "Cocaine Kobold, Level 6 These little lizards enjoy Latin music and luxury goods, but they love cocaine even more. Not to be confused with normal Kobolds, which are basically tiny dogs, Cocaine Kobolds are reptilian. Their pupils are perpetually absurdly dilated, giving them the appearance of a paranoid gecko who just realized he should have bundled his home and auto insurance.",
        "notes": "Mounted—Cocaine Kobolds are often astride Danger Dingos, and deal +1 damage with their spears when mounted.",
        "special": "Mounted (+1 damage with spears when mounted on Danger Dingo); Coke Dusting (evade major fail inflicts Enraged).",
        "source": "Page 96, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000026",
        "name": "Rock",
        "type": "attack",
        "img": "icons/svg/target.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 30ft range. On an Evade Major Fail or worse, the crawler gains the Enraged Debuff (from the dusting of coke)."
        }
      },
      {
        "_id": "dccatkmob0000027",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "12+F to hit, 5ft range (+1 damage when mounted). On an Evade Major Fail or worse, the crawler gains the Enraged Debuff (from the dusting of coke)."
        }
      },
      {
        "_id": "dcclootmob000029",
        "name": "Mirror Pouch of Suspicious White Powder",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "A compact mirrored pouch containing an intensely stimulating crystalline powder.",
          "description": "A compact mirrored pouch containing an intensely stimulating crystalline powder."
        }
      },
      {
        "_id": "dcclootmob000030",
        "name": "Short Spear",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "A jagged reptile-bone spear.",
          "description": "A jagged reptile-bone spear."
        }
      },
      {
        "_id": "dcclootmob000031",
        "name": "Reptilian Leather Scraps",
        "type": "loot",
        "img": "icons/svg/shield.svg",
        "system": {
          "quantity": 1,
          "notes": "Tough hide scraps from subterranean lizards.",
          "description": "Tough hide scraps from subterranean lizards."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000012",
    "name": "Danger Dingo",
    "type": "mob",
    "img": "icons/svg/paw.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "int": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 15,
          "max": 15,
          "temp": 0,
          "pct": 100,
          "bars": 5,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 30,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Norwegian black metal cassette, Gnawed rugby ball, Dingo pelt",
        "xp": 120,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Outback Wastes",
        "description": "Danger Dingoes branched off from their canine brethren because \"eating babies\" just isn't cool-it's necessary. With a penchant for Norwegian black metal and rugby, Danger Dingoes are powerfully built, standing over three feet tall at the shoulder and packing a cool 220 pounds of misanthropic muscle.",
        "aiDescription": "Danger Dingo, Level 5 These aren't the cute, cuddly, baby-eating puppies from the land down under. No, mate. The Danger Dingo features a stronger body, sharper teeth, and a penchant for black metal bands such as Dimmyu Borgir and Satyricon. Where there are Dingoes, their Kobold Riders and slave masters usually aren't far behind.",
        "notes": "Good Impressions—An injured Dingo may become non-hostile to a crawler party if none of the crawlers attack any member of the Dingo's pack, and the crawlers heal or feed the Dingo or play music from metal bands the Dingo likes.\n\nRavager—If a Danger Dingo moves at least 20ft in a straight line at its Ravage target before attacking, add +1d6 to the damage.",
        "special": "Good Impressions (can be pacified with metal music, food, or healing if pack is unattacked); Ravager (+1d6 damage on 20ft straight charge).",
        "source": "Page 97, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000028",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "13+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler gains the Rabies Debuff: 1d6+F Poison damage at the end of each round until combat ends."
        }
      },
      {
        "_id": "dccatkmob0000029",
        "name": "Ravage",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "11+F to hit, 5ft range (+1d6 damage if charged 20ft straight line). On an Evade Major Fail or worse, the target gains the Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob000032",
        "name": "Norwegian Black Metal Cassette",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "A magnetic tape labelled Transilvanian Hunger in unreadable gothic font.",
          "description": "A magnetic tape labelled Transilvanian Hunger in unreadable gothic font."
        }
      },
      {
        "_id": "dcclootmob000033",
        "name": "Gnawed Rugby Ball",
        "type": "loot",
        "img": "icons/svg/target.svg",
        "system": {
          "quantity": 1,
          "notes": "A deflated leather ball with deep tooth marks.",
          "description": "A deflated leather ball with deep tooth marks."
        }
      },
      {
        "_id": "dcclootmob000034",
        "name": "Dingo Pelt",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Coarse golden fur pelt from an Australian outback predator.",
          "description": "Coarse golden fur pelt from an Australian outback predator."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000013",
    "name": "Jacked Kangaroo",
    "type": "mob",
    "img": "icons/svg/paw.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "int": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 32,
          "max": 32,
          "temp": 0,
          "pct": 100,
          "bars": 8,
          "hpPerBar": 4
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 25,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Creatine tub, Gym gym bag, Boxing hand wraps",
        "xp": 220,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 8,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 2",
        "location": "Outback Gyms & Gymnasiums",
        "description": "Unlike your typical gym bro, these Mobs never skip leg day. Standing at over six-and-a-half feet of rippling marsupial fury, the Jacked Kangaroos have abs that can grate cheese, biceps like steel pistons, and legs that make Ronnie Coleman envious. Using an MMA fighting style that blends Muay Thai kicks with Wushu-style tail whips, Jacked Kangaroos are vicious close-combat fighters.",
        "aiDescription": "Jacked Kangaroo, Level 8 Who needs cardio when you've got legs like these! The Jacked Kangaroo is a vicious, albeit vain, close-combat fighter. Easily distracted by mirrors and lower limb-based flattery, Jacked Kangaroos are especially dangerous to those who dare to go at them-ahem-toe-to-toe.",
        "notes": "Jacked Kangaroos maintain nearly perfect balance with their hefty tail, making them nearly impossible to knock prone or off-kilter. If a Jacked Kangaroo is in mid-squat, even in the middle of combat, their training takes over, and they start banging out reps instead of continuing the fight.",
        "special": "Tail Balance (immune to prone/off-kilter); Squat Distraction (flattery or gym mirrors triggers mid-combat squat reps).",
        "source": "Page 97, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000030",
        "name": "Kick",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler is pushed 15ft."
        }
      },
      {
        "_id": "dccatkmob0000031",
        "name": "Punch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "14+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000032",
        "name": "Tail Whip",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d10",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "14+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler gains the Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob000035",
        "name": "Creatine Tub",
        "type": "loot",
        "img": "icons/svg/potion.svg",
        "system": {
          "quantity": 1,
          "notes": "A 5lb tub of micronized creatine monohydrate. Smells like vanilla chalk.",
          "description": "A 5lb tub of micronized creatine monohydrate. Smells like vanilla chalk."
        }
      },
      {
        "_id": "dcclootmob000036",
        "name": "Gym Gym Bag",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "A sweaty canvas duffel bag packed with lifting straps and shaker cups.",
          "description": "A sweaty canvas duffel bag packed with lifting straps and shaker cups."
        }
      },
      {
        "_id": "dcclootmob000037",
        "name": "Boxing Hand Wraps",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Elastic wraps soaked in sweat and gym chalk.",
          "description": "Elastic wraps soaked in sweat and gym chalk."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000014",
    "name": "Jazmanian Devil",
    "type": "mob",
    "img": "icons/svg/combat.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 21,
          "max": 21,
          "temp": 0,
          "pct": 100,
          "bars": 7,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Neon spandex, Knitted leg warmers, Aerobic mixtape",
        "xp": 180,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Community Centers & Church Basements",
        "description": "These terrifying predators prowl suburban community centers and church basements, identified by their signature high-cut spandex and knitted leg warmers. Jazmanian Devils attack without warning, using violent hip thrusts and aggressive grapevine maneuvers to corner their prey before decimating them with a series of high kicks and lunges.",
        "aiDescription": "Jazmanian Devil, Level 7 These passionate dancing and fitness fashionistas know all the moves and aren't afraid to use them! A hearty combination of a carnivorous Earth marsupial and the old ladies who gather on weeknights to work their jazzy moves, the Jazmanian Devil may look ridiculous, but their fighting style is relentless- because their cardio is just so good.",
        "notes": "Hard Fighting—Each time a crawler kills a Jazmanian Devil, they gain the Fatigued Debuff.",
        "special": "Hard Fighting (killing a Jazmanian Devil inflicts the Fatigued Debuff on the slayer).",
        "source": "Page 98, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000033",
        "name": "Wrist Weight",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000034",
        "name": "Sweatband",
        "type": "attack",
        "img": "icons/svg/daze.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler gains the Muted Debuff."
        }
      },
      {
        "_id": "dccatkmob0000035",
        "name": "Kick",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000036",
        "name": "Lunge",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 10ft range."
        }
      },
      {
        "_id": "dcclootmob000038",
        "name": "Neon Spandex",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Blindingly bright 80s aerobic bodysuit.",
          "description": "Blindingly bright 80s aerobic bodysuit."
        }
      },
      {
        "_id": "dcclootmob000039",
        "name": "Knitted Leg Warmers",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Striped acrylic leg warmers offering questionable thermal defense.",
          "description": "Striped acrylic leg warmers offering questionable thermal defense."
        }
      },
      {
        "_id": "dcclootmob000040",
        "name": "Aerobic Mixtape",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "High-tempo synthwave cassette designed for max heart rate workouts.",
          "description": "High-tempo synthwave cassette designed for max heart rate workouts."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000015",
    "name": "Whambat",
    "type": "mob",
    "img": "icons/svg/wing.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 6,
          "max": 6,
          "temp": 0,
          "pct": 100,
          "bars": 3,
          "hpPerBar": 2
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Leathery bat wing, Guinea pig fluff, Empty energy drink",
        "xp": 60,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 2",
        "location": "Caves & Rafters",
        "description": "Imagine taking a giant guinea pig, infusing it with Red Bull, and then adding a massive set of leathery wings. The result would be a Whambat: a rotund, furry abomination roughly the size of a fattened Thanksgiving turkey that has absolutely zero chill and the aerodynamics of a brick.",
        "aiDescription": "Whambat, Level 3 It's a bird! It's a plane! It's a-what the hell is that? Wait, there's more of 'em? Wham! Wham! Wham!",
        "notes": "Flight—Whambats can move through the air as though on the ground.\n\nHell Dive—Whambats die from the impact of a Hell Dive that hits their target.",
        "special": "Flight (moves through air as ground); Hell Dive (sacrificial dive: dies upon hitting target).",
        "source": "Page 98, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000037",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "11+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000038",
        "name": "Hell Dive",
        "type": "attack",
        "img": "icons/svg/falling.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 60ft range. On an Evade Major Fail or worse, the crawler gains the Staggered Debuff. Whambats die from the impact of a Hell Dive that hits."
        }
      },
      {
        "_id": "dcclootmob000041",
        "name": "Leathery Bat Wing",
        "type": "loot",
        "img": "icons/svg/wing.svg",
        "system": {
          "quantity": 1,
          "notes": "Stretchy membranous wing suitable for potion brewing or glider repair.",
          "description": "Stretchy membranous wing suitable for potion brewing or glider repair."
        }
      },
      {
        "_id": "dcclootmob000042",
        "name": "Guinea Pig Fluff",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Shockingly soft fur tufts from an oversized rodent bat.",
          "description": "Shockingly soft fur tufts from an oversized rodent bat."
        }
      },
      {
        "_id": "dcclootmob000043",
        "name": "Empty Energy Drink",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "Tallboy can of Nuclear Blitz taurine blast.",
          "description": "Tallboy can of Nuclear Blitz taurine blast."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000016",
    "name": "Mick Moran",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "int": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "con": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 60,
          "max": 60,
          "temp": 0,
          "pct": 100,
          "bars": 12,
          "hpPerBar": 5
        },
        "mana": {
          "value": 10,
          "max": 10,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Twin Machete-Bowie Knives, Crocodile Chef Apron, Barbeque Spices",
        "xp": 800,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 12,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Chef Moran's Outback Kitchen",
        "description": "Mick is a nine-foot-tall crocodilian, wielding twin Bowie knives the size of machetes. He rasps the blades against each other, as if honing them. Sparks begin to fly, and a flash illuminates the area as another bolt streaks toward the crawlers.",
        "aiDescription": "Mick Moran, Hulking Crocodilian Chef Level 12 Neighborhood Boss! Looks like you came to the kitchen to complain to the chef. Well, Chef Moran doesn't take kindly to those who dis his food. This apex food-preparer takes farm-to-table way too literally, and tonight, you're on the menu! He'll slice and dice you just to bring out the flavor, then he'll braise you on the barbie until you're perfectly charred on the outside but still nice and rare on the inside. Talk about fresh meat!",
        "notes": "For Those About To Rock—The party is prevented from taking more than one Action until Mick has directly engaged them in combat. Once Mick has attacked any of the crawlers, this effect dissipates.\n\nWater Scarcity—Water-based attacks do extra damage to Mick, and partial immersion in water disables his Thunderstrike attack. When totally submerged in water he becomes nearly comatose with fear and will die if left that way as he never learned to swim.",
        "special": "For Those About To Rock (crawlers limited to 1 action until Mick attacks); Water Scarcity (water attacks deal extra dmg; water immersion disables Thunderstrike; drowning hazard).",
        "source": "Page 103, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000039",
        "name": "That's a Knife",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d8",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "15+F to hit, 5ft range. On an Evade Major Fail or worse, the crawler gains the Blood Trail Debuff."
        }
      },
      {
        "_id": "dccatkmob0000040",
        "name": "Thunderstrike",
        "type": "attack",
        "img": "icons/svg/lightning.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Electric",
          "effects": "14+F to hit, 40ft range. On an Evade Major Fail or worse, the crawler gains the Shocked Debuff."
        }
      },
      {
        "_id": "dcclootmob000044",
        "name": "Twin Machete-Bowie Knives",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 2,
          "notes": "Massive Australian survival blades capable of butchering crocodiles and crawlers alike.",
          "description": "Massive Australian survival blades capable of butchering crocodiles and crawlers alike."
        }
      },
      {
        "_id": "dcclootmob000045",
        "name": "Crocodile Chef Apron",
        "type": "loot",
        "img": "icons/svg/shield.svg",
        "system": {
          "quantity": 1,
          "notes": "Heavy-duty leather apron stained with barbecue grease and seasonings.",
          "description": "Heavy-duty leather apron stained with barbecue grease and seasonings."
        }
      },
      {
        "_id": "dcclootmob000046",
        "name": "Barbeque Spices",
        "type": "loot",
        "img": "icons/svg/item-bag.svg",
        "system": {
          "quantity": 1,
          "notes": "A tin of secret outback dry rub: fiery, smoky, and salty.",
          "description": "A tin of secret outback dry rub: fiery, smoky, and salty."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000017",
    "name": "Brindle Grub",
    "type": "mob",
    "img": "icons/svg/paw.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "dex": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 6,
          "max": 6,
          "temp": 0,
          "pct": 100,
          "bars": 2,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 5,
          "step": 5
        },
        "aiFavor": 0,
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Mottled grub fuzz, Janitor mob secretion",
        "xp": 40,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Corpse piles & Waste areas",
        "description": "Brindle Grubs are the Janitor Mob of the Second Floor. One to fifteen Brindle Grubs spawn every time a corpse is created until their numbers cap out at 5,000 per quarter. Destroying corpses prevents Brindle Grubs from leveling up but not from spawning. These large, fuzzy, fat worms have a mottled black-and-brown hide and are approximately the size of a large cat.",
        "aiDescription": "Brindle Grub, Level 2 Here on the Second Floor, Rats are yesterday's news. Brindle Grubs are now all the rage, and janitor duty falls to them. The more monsters you kill in an area, the more the grubs eat. The more the grubs eat, the bigger they get. Once you start finding them in the pupa stage, you'd best move on. Grubs are easy to kill. Their older siblings are not.",
        "notes": "Janitor Mob—This Mob is responsible for cleaning messes on Floor 2 and prioritizes eating corpses. It targets crawlers when no other food options are nearby. The System AI spawns 1 to 15 Brindle Grubs each time an entity dies in the area, up to 5,000 active Brindle Grubs per quarter. When a Brindle Grub has eaten enough corpses, it levels up to become a Cow-Tailed Brindle Grub.\n\nOvercrowding—Up to 5 Brindle Grubs can share a space. Entities can attempt to move through a space containing Brindle Grubs but must make a DEX Stat Check with a Difficulty of 4 × the number of Brindle Grubs in the space. On Fail, the entity steps on and kills one of the Brindle Grubs, triggering the system AI to spawn more Brindle Grubs to eat the corpse.",
        "special": "Janitor Mob (prioritizes corpses; spawns 1-15 on death up to 5,000; levels up to Cow-Tailed); Overcrowding (up to 5 per space; DEX check 4x count to avoid stepping on and spawning more).",
        "source": "Page 106, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000041",
        "name": "Chew",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "11+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000047",
        "name": "Mottled Grub Fuzz",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Bristly caterpillar-like fuzz that irritates skin.",
          "description": "Bristly caterpillar-like fuzz that irritates skin."
        }
      },
      {
        "_id": "dcclootmob000048",
        "name": "Janitor Mob Secretion",
        "type": "loot",
        "img": "icons/svg/acid.svg",
        "system": {
          "quantity": 1,
          "notes": "Enzymatic slime used to break down corpses and biological waste.",
          "description": "Enzymatic slime used to break down corpses and biological waste."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000018",
    "name": "Cow-Tailed Brindle Grub",
    "type": "mob",
    "img": "icons/svg/paw.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "dex": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 9,
          "max": 9,
          "temp": 0,
          "pct": 100,
          "bars": 3,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 10,
          "step": 5
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Pointed stinger tail, Grub silk cocoon strands",
        "xp": 60,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Corpse piles & Waste areas",
        "description": "Cow-Tailed Brindle Grubs are roughly twice as large as Brindle Grubs, reaching the size of a large dog. As they grow, they develop long, pointed tails that they whip about with minimal effectiveness.",
        "aiDescription": "Cow-Tailed Brindle Grub, Level 3 The final form before they hit the pupa stage, the Cow-Tailed Brindle Grub is finally able to defend itself, kind of like the way a toddler holding a plastic baseball bat is able to defend himself.",
        "notes": "Upgraded Janitor Mob—This Mob is the leveled-up form of the Brindle Grub. It continues to prioritize eating corpses and upon eating enough to level up again, transforms into a pupa for 10 hours, then transforms again into a Brindled Vespa. As a pupa, it has the same stats but can't attack and gains a +2 DR Buff from encasing itself in a cocoon.\n\nWhen a crawler rolls an Amazing Success or better with a melee weapon and kills a Cow-Tailed Brindle Grub, the crawler is covered in white goo. They suffer Disadvantage to Dexterity-based skills until cleaned off in a saferoom.",
        "special": "Upgraded Janitor Mob (pupates for 10 hrs with +2 DR into Brindled Vespa); Goo Explosion (Amazing Success melee kill covers crawler in goo: Disadvantage on DEX skills).",
        "source": "Page 106, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000042",
        "name": "Sting",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "12+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000049",
        "name": "Pointed Stinger Tail",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "Hardened chitinous stinger filled with mild paralytic venom.",
          "description": "Hardened chitinous stinger filled with mild paralytic venom."
        }
      },
      {
        "_id": "dcclootmob000050",
        "name": "Grub Silk Cocoon Strands",
        "type": "loot",
        "img": "icons/svg/net.svg",
        "system": {
          "quantity": 1,
          "notes": "Silken fibers ready to form a metamorphic cocoon.",
          "description": "Silken fibers ready to form a metamorphic cocoon."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000019",
    "name": "Brindled Vespa",
    "type": "mob",
    "img": "icons/svg/hazard.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 32,
          "max": 32,
          "temp": 0,
          "pct": 100,
          "bars": 8,
          "hpPerBar": 4
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 4
        },
        "dr": {
          "armor": 0,
          "items": 0,
          "buffs": 0,
          "total": 0
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Vespa wing membranes, Potent acid gland, Mutated stinger",
        "xp": 240,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 8,
        "classification": "Mob",
        "creatureType": "Mutated",
        "floor": "Floor 2",
        "location": "Hives & Rafters",
        "description": "Brindled Vespas are the fully matured flying form of the Brindle Grub line. Having emerged from their pupa stage, they take to the air as dangerous, aggressive mutated wasps.",
        "aiDescription": "Brindled Vespa, Level 8 The final, horrifying evolution of those fat little janitor worms! Now they've got wings, venom, and a whole lot of attitude. If you let those grubs pupate, this is the nightmare you have to deal with. Aim for the wings if you want to keep 'em grounded!",
        "notes": "Flight—Brindled vespas can move through the air as though on the ground and hover in place.\n\nFragile Wings—Brindled vespas have large wings that can be targeted by attacks (with a -2 penalty). If it loses 1 or more HB slots this way, remove their Acid Goo attack and Flight abilities.",
        "special": "Flight (moves and hovers in air); Fragile Wings (targeting wings at -2 penalty: 1+ HB loss removes Acid Goo and Flight).",
        "source": "Page 107, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000043",
        "name": "Acid Goo",
        "type": "attack",
        "img": "icons/svg/acid.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Acid",
          "effects": "11+F to hit, 40ft range. On an Evade Major Fail or worse, the crawler gains the Acid Goo Debuff: 1d6+F Acid at the end of each round until combat ends."
        }
      },
      {
        "_id": "dccatkmob0000044",
        "name": "Sting",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000051",
        "name": "Vespa Wing Membranes",
        "type": "loot",
        "img": "icons/svg/wing.svg",
        "system": {
          "quantity": 1,
          "notes": "Delicate translucent insect wings that shimmer with iridescent hues.",
          "description": "Delicate translucent insect wings that shimmer with iridescent hues."
        }
      },
      {
        "_id": "dcclootmob000052",
        "name": "Potent Acid Gland",
        "type": "loot",
        "img": "icons/svg/acid.svg",
        "system": {
          "quantity": 1,
          "notes": "An organ holding concentrated digestive acid.",
          "description": "An organ holding concentrated digestive acid."
        }
      },
      {
        "_id": "dcclootmob000053",
        "name": "Mutated Stinger",
        "type": "loot",
        "img": "icons/svg/sword.svg",
        "system": {
          "quantity": 1,
          "notes": "An oversized barbed stinger designed to penetrate armor.",
          "description": "An oversized barbed stinger designed to penetrate armor."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000020",
    "name": "Unvaccinated Clurichaun Rev-Up Consultant",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "int": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "con": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "dex": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 3,
          "max": 3,
          "temp": 0,
          "pct": 100,
          "bars": 3,
          "hpPerBar": 1
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 25,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Tattered overalls, Rev-Up pyramid brochures, Contagious handkerchief",
        "xp": 60,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Rev-Up Encampments",
        "description": "Small and troll-like with humanoid bodies and oversized heads, Clurichauns are marked by curly black hair, hooked noses, small feet, and very few teeth. They frequently appear in tattered overalls and other clothing favored by deep rural sects. They make a piglike gurgling noise when attacking.",
        "aiDescription": "Unvaccinated Clurichaun Rev-Up Consultant, Level 3 Clurichauns are distant hillbilly relatives of the Leprechauns. And while the Leprechauns are said to guard vast piles of gold, the only thing Clurichauns might hoard are Polaroids of their own sisters sitting on the can and questionable business schemes. This particular sect is of the unvaccinated variety. Don't let them sneeze on you.",
        "notes": "Fairy-class Mob. Makes piglike gurgling noises in combat.",
        "special": "Fairy-class (makes piglike gurgles; Sneeze spreads Diseased, The Taint, or Stiff Legs).",
        "source": "Page 107, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000045",
        "name": "Slingshot",
        "type": "attack",
        "img": "icons/svg/target.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d2",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "13+F to hit, 40ft range."
        }
      },
      {
        "_id": "dccatkmob0000046",
        "name": "Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "12+F to hit, 5ft range."
        }
      },
      {
        "_id": "dccatkmob0000047",
        "name": "Sneeze",
        "type": "attack",
        "img": "icons/svg/poison.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "con",
          "damageType": "Poison",
          "effects": "13+F to hit, 15ft Cone. Any crawler who loses 1+ HB gains one of: The Taint, Stiff Legs, or Diseased (1d6+F Poison at end of each round)."
        }
      },
      {
        "_id": "dcclootmob000054",
        "name": "Tattered Overalls",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Dungarees worn thin at the knees from relentless door-to-door pitching.",
          "description": "Dungarees worn thin at the knees from relentless door-to-door pitching."
        }
      },
      {
        "_id": "dcclootmob000055",
        "name": "Rev-Up Pyramid Brochures",
        "type": "loot",
        "img": "icons/svg/book.svg",
        "system": {
          "quantity": 1,
          "notes": "Glossy multi-level marketing pamphlets promising financial freedom on Floor 2.",
          "description": "Glossy multi-level marketing pamphlets promising financial freedom on Floor 2."
        }
      },
      {
        "_id": "dcclootmob000056",
        "name": "Contagious Handkerchief",
        "type": "loot",
        "img": "icons/svg/hazard.svg",
        "system": {
          "quantity": 1,
          "notes": "A suspiciously damp cloth swarming with unidentifiable pathogens.",
          "description": "A suspiciously damp cloth swarming with unidentifiable pathogens."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000021",
    "name": "Laminak Rev-Up Consultant Manager",
    "type": "mob",
    "img": "icons/svg/wing.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 12,
          "max": 12,
          "temp": 0,
          "pct": 100,
          "bars": 6,
          "hpPerBar": 2
        },
        "mana": {
          "value": 6,
          "max": 6,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 45,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Rev-Up Manager clip-on tie, Hummingbird wing dust, Glowing red focus beads",
        "xp": 150,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Rev-Up Executive Suites",
        "description": "Laminaks are a Fairy-class Mob. They're fat humanlike crow-sized Fairies with buzzing hummingbird wings. They can fly lightning-fast, and their hands glow red when they cast spells.",
        "aiDescription": "Laminak Rev-Up Consultant Manager, Level 6 The second tier of the Rev-Up empire, these Laminak consultants don't need to speak to a manager. They are the managers. They run their business with brutal efficiency.",
        "notes": "\"Natural\" Immunity—Laminaks are immune to all damage-dealing Debuffs.\n\nFlight—Laminaks are fairies with wings. They can move through the air as though on the ground and hover in place.",
        "special": "Natural Immunity (immune to all damage-dealing Debuffs); Flight (moves through air at 45ft, hovers).",
        "source": "Page 107, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000048",
        "name": "Magic Missile Spell",
        "type": "attack",
        "img": "icons/svg/wand.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Force",
          "effects": "13+F to hit, 90ft range."
        }
      },
      {
        "_id": "dccatkmob0000049",
        "name": "Scream",
        "type": "attack",
        "img": "icons/svg/sound.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "13+F to hit, 15ft Burst radius. Crawlers make free CHA Stat Checks to avoid this attack (cannot Evade)."
        }
      },
      {
        "_id": "dcclootmob000057",
        "name": "Rev-Up Manager Clip-On Tie",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "A clip-on polyester tie marking mid-level fairy management authority.",
          "description": "A clip-on polyester tie marking mid-level fairy management authority."
        }
      },
      {
        "_id": "dcclootmob000058",
        "name": "Hummingbird Wing Dust",
        "type": "loot",
        "img": "icons/svg/sparkles.svg",
        "system": {
          "quantity": 1,
          "notes": "Glittering dust shaken from rapid fairy wings.",
          "description": "Glittering dust shaken from rapid fairy wings."
        }
      },
      {
        "_id": "dcclootmob000059",
        "name": "Glowing Red Focus Beads",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 1,
          "notes": "Beads radiating arcane force, used to channel Magic Missile spells.",
          "description": "Beads radiating arcane force, used to channel Magic Missile spells."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000022",
    "name": "Smombie",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 12,
          "max": 12,
          "temp": 0,
          "pct": 100,
          "bars": 4,
          "hpPerBar": 3
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Fused VR visor lens, Cracked smartphone screen, 1d4 copper nibs",
        "xp": 80,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Undead",
        "floor": "Floor 2",
        "location": "Transit Hubs & Corridors",
        "description": "Smombies appear as humans with VR-style visors fused to their skulls, covering their eyes. They spend their time mindlessly scrolling random feeds from across the dungeon, while barely paying attention to their surroundings. Smombies are prone to seemingly random fits of emotion (outbursts of laughter or yelling are common), lasting from a few seconds to minutes, usually provoked by visuals in their feeds.",
        "aiDescription": "Smombie, Level 4 What's better than the hypnotic scrolling of pointless reels one after another? Having the doomscroll connected directly to your brain! While these zombified creatures are oblivious to almost everything around them, disturbing their scrolling even in the slightest can quickly bring about a rage-fueled tantrum of death.",
        "notes": "Mindlessly scrolls feeds; oblivious to surroundings until interrupted, which triggers immediate hostile outbursts.",
        "special": "Doomscroll Trance (oblivious to surroundings until touched/interrupted, triggering immediate rage outbursts).",
        "source": "Page 108, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000050",
        "name": "Tantrum",
        "type": "attack",
        "img": "icons/svg/sound.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "13+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000060",
        "name": "Fused VR Visor Lens",
        "type": "loot",
        "img": "icons/svg/eye.svg",
        "system": {
          "quantity": 1,
          "notes": "Plastic optical lens melted directly onto cranial bone.",
          "description": "Plastic optical lens melted directly onto cranial bone."
        }
      },
      {
        "_id": "dcclootmob000061",
        "name": "Cracked Smartphone Screen",
        "type": "loot",
        "img": "icons/svg/hazard.svg",
        "system": {
          "quantity": 1,
          "notes": "Shattered Gorilla Glass still flickering with infinite scrolling feeds.",
          "description": "Shattered Gorilla Glass still flickering with infinite scrolling feeds."
        }
      },
      {
        "_id": "dcclootmob000062",
        "name": "Copper Nibs",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 2,
          "notes": "2 copper nibs found in loose pockets.",
          "description": "2 copper nibs found in loose pockets."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000023",
    "name": "Pack Rat",
    "type": "mob",
    "img": "icons/svg/paw.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "int": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "cha": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 4,
          "max": 4,
          "temp": 0,
          "pct": 100,
          "bars": 2,
          "hpPerBar": 2
        },
        "mana": {
          "value": 0,
          "max": 0,
          "pct": 100
        },
        "evade": {
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "dr": {
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Tiny",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Gnawed cloth, 1 copper nib",
        "xp": 35,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1 (Tutorial)",
        "location": "Prickly Pack Alleys",
        "description": "Scrappy dungeon rodents that travel in packs through the back alleys of the tutorial level, hoarding bits of trash and shiny objects.",
        "aiDescription": "Pack Rat, Level 2 Every tutorial level needs its generic cannon fodder, and congratulations, you've found ours! These flea-ridden vermin think your shinbones look delicious. Squash them like the bugs they wish they were!",
        "notes": "Travels in large packs. Avoids isolated targets when outnumbered.",
        "special": "Pack Tactics (often found in groups of 3-6).",
        "source": "Page 32, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0000051",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 1,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "12+F to hit, 5ft range."
        }
      },
      {
        "_id": "dcclootmob000063",
        "name": "Gnawed Cloth",
        "type": "loot",
        "img": "icons/svg/cloth.svg",
        "system": {
          "quantity": 1,
          "notes": "Scraps of crawler clothing chewed into nesting material.",
          "description": "Scraps of crawler clothing chewed into nesting material."
        }
      },
      {
        "_id": "dcclootmob000064",
        "name": "Copper Nib",
        "type": "loot",
        "img": "icons/svg/coins.svg",
        "system": {
          "quantity": 1,
          "notes": "A single copper nib hoarded in the rat cheek pouch.",
          "description": "A single copper nib hoarded in the rat cheek pouch."
        }
      }
    ]
  }
];
