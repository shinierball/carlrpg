/**
 * Dungeon Crawler Carl RPG - Official Mobs Dataset
 * Populated from the official Game Master's Toolkit - Entities List.
 * Contains all 84 mobs, bosses, and rival crawlers from Page 3 of the Toolkit.
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
  },
  {
    "_id": "dccmob0000000024",
    "name": "Bad Llama",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Llama Fleece, Fire Pouch",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Mutated",
        "floor": "Floor 1",
        "location": "Webbinghoods",
        "description": "Most naughty animals aren't born bad; they just suffer from a bad reputation. In this case, that reputation is absolutely warranted as the Bad Llamas run most of the crime out of the Webbinghoods.",
        "aiDescription": "It may look fuzzy and cuddly, but if you try to pet it, you’ll lose an arm in the process. It’s a Bad Llama—kind of like a normal Llama, but bad! Purveyors of some of the most powerful drugs in the dungeon, these adorable rapscallions love two things: good music and a good buzz.",
        "notes": "Bad Reflux—Attacks can target the lava pouch in the Llama’s throat during rounds when it uses Lava Spit, but this adds a +2 to the Llama’s Evade. The pouch ruptures if such an attack deals damage, killing the Llama and setting its corpse aflame.",
        "special": "Bad Reflux—Attacks can target the lava pouch in the Llama’s throat during rounds when it uses Lava Spit, but this adds a +2 to the Llama’s Evade. The pouch ruptures if such an attack deals damage, killing the Llama and setting its corpse aflame.",
        "source": "Page 51, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002401",
        "name": "Lava Spit",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Fire",
          "effects": "30ft range. On Evade Major Fail or worse, target gains Burning Debuff."
        }
      },
      {
        "_id": "dcclootmob002401",
        "name": "Llama Fleece",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Silky denim-jacket-trimmed fleece.",
          "description": "Silky denim-jacket-trimmed fleece."
        }
      },
      {
        "_id": "dcclootmob002402",
        "name": "Fire Pouch",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Gland capable of generating volatile fiery fluids.",
          "description": "Gland capable of generating volatile fiery fluids."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000025",
    "name": "Ball of Swine",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "int": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "con": {
          "value": 50,
          "unenhanced": 50,
          "mod": 6
        },
        "dex": {
          "value": 10,
          "unenhanced": 10,
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
          "value": 96,
          "max": 96,
          "temp": 0,
          "pct": 100,
          "bars": 16,
          "hpPerBar": 6
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
        "size": "Colossal",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Bondage Leathers, Ring of Momentum",
        "xp": 750,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 15,
        "classification": "Borough Boss",
        "creatureType": "Amalgamation",
        "floor": "Floor 1",
        "location": "Orcish Supremacy Arenas",
        "description": "Comprised of at least thirty fetish-friendly Tusklings joined together by magic, the Ball of Swine is one of the most formidable battle formations of the Orcish Supremacy. Speed, size, and unstoppable momentum combine to make this Borough Boss a crushing foe.",
        "aiDescription": "Ever seen that movie with the guy in a rugged fedora running away from a massive unstoppable boulder? Did you think to yourself, 'That sure looks fun'? Now what if that boulder was bigger, faster, and made of bondage-loving Tusklings?",
        "notes": "Amalgamation—The Ball of Swine is a 15-foot-tall ball comprised of 30 Tuskling Knights and 30 Tuskling Courtesans. Constant Momentum—The Ball of Swine can instantly change direction without losing speed. Snagged—Can be stopped by reducing space with three successful skill checks.",
        "special": "Amalgamation—The Ball of Swine is a 15-foot-tall ball comprised of 30 Tuskling Knights and 30 Tuskling Courtesans. Constant Momentum—The Ball of Swine can instantly change direction without losing speed. Snagged—Can be stopped by reducing space with three successful skill checks.",
        "source": "Page 142, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002501",
        "name": "Assimilated",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Held Debuff."
        }
      },
      {
        "_id": "dccatkmob0002502",
        "name": "Bowled Over",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d10",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "40ft Line. On Evade Major Fail or worse, crawler gains Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob002501",
        "name": "Bondage Leathers",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Heavy studded leather harnesses from the Tusklings.",
          "description": "Heavy studded leather harnesses from the Tusklings."
        }
      },
      {
        "_id": "dcclootmob002502",
        "name": "Ring of Momentum",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Grants bonus movement on charge attacks.",
          "description": "Grants bonus movement on charge attacks."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000026",
    "name": "The Bar Render",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "int": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "con": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "dex": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 44,
          "max": 44,
          "temp": 0,
          "pct": 100,
          "bars": 11,
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
        "treasure": "Bar Render's Cocktail Shaker, Dusty Gray Spectacles",
        "xp": 400,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 8,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Prickly Pack Alleys Court Tavern",
        "description": "The Bar Render is a formidable older woman in a dusty-gray suit and spectacles. She stands nine feet tall and holds glasses in each hand. She fights mostly with long-range improvised explosives as Barflies dressed as bailiffs try to keep the crawlers back.",
        "aiDescription": "The Bar Render. Former Lawyer, Current Bartender—Real done with cleaning up your mess. Level 8 Neighborhood Boss! Once upon a time, Patti dreamed of defending her fellow man from the twisted, perverted farce you know as the justice system. She utterly crushed the BAR exam and became an attorney, a public defender, and a tireless advocate for justice.",
        "notes": "She has two Barflies joining her in the fight at all times until she is dead.",
        "special": "She has two Barflies joining her in the fight at all times until she is dead.",
        "source": "Page 37, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002601",
        "name": "Fiery Cocktail",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "int",
          "damageType": "Fire",
          "effects": "30ft range, 10ft Blast radius."
        }
      },
      {
        "_id": "dccatkmob0002602",
        "name": "Punch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Held Debuff."
        }
      },
      {
        "_id": "dcclootmob002601",
        "name": "Bar Render's Cocktail Shaker",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Improvised alchemical shaker.",
          "description": "Improvised alchemical shaker."
        }
      },
      {
        "_id": "dcclootmob002602",
        "name": "Dusty Gray Spectacles",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "+1 to Perception and Insight checks.",
          "description": "+1 to Perception and Insight checks."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000027",
    "name": "Barflie",
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
          "value": 5,
          "unenhanced": 5,
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
          "value": 8,
          "max": 8,
          "temp": 0,
          "pct": 100,
          "bars": 4,
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
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Barflie Proboscis, Compound Eye Lens",
        "xp": 200,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Mutated Humanoid",
        "floor": "Floor 1",
        "location": "Prickly Pack Alleys",
        "description": "Barflies are humanoids standing roughly five-and-a-half feet tall with ruby-red compound eyes and dripping proboscises. Utterly disgusting to behold and incredibly quick but clumsy fighters, they wield simple weapons.",
        "aiDescription": "These formerly human creatures prefer to stick near bright lights and foul smells, often congregating in small groups, lapping up the latest buzz from around the dungeon. Watch out for their backwash attack!",
        "notes": "Flight—Barflies can move through the air as though on the ground and hover in place.",
        "special": "Flight—Barflies can move through the air as though on the ground and hover in place.",
        "source": "Page 30, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002701",
        "name": "Backwash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "con",
          "damageType": "Poison",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains Washed Debuff."
        }
      },
      {
        "_id": "dccatkmob0002702",
        "name": "Club",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob002701",
        "name": "Barflie Proboscis",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Dripping insectoid feeding tube.",
          "description": "Dripping insectoid feeding tube."
        }
      },
      {
        "_id": "dcclootmob002702",
        "name": "Compound Eye Lens",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Ruby-red multifaceted lenses.",
          "description": "Ruby-red multifaceted lenses."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000028",
    "name": "Beloved Mimic",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "int": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "con": {
          "value": 100,
          "unenhanced": 100,
          "mod": 7
        },
        "dex": {
          "value": 9,
          "unenhanced": 9,
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
          "value": 140,
          "max": 140,
          "temp": 0,
          "pct": 100,
          "bars": 20,
          "hpPerBar": 7
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
          "move": 5,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Colossal",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Heartstring Fibers, Colossal Mimic Tooth",
        "xp": 1250,
        "surpriseDifficulty": "15+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 25,
        "classification": "City Boss",
        "creatureType": "Aberration",
        "floor": "Floor 2",
        "location": "Second Floor Boss Lair",
        "description": "Capable of swallowing a sedan whole, the Beloved Mimic relishes the chance to sink its razor-sharp teeth into incapacitated crawlers. It uses its psychic abilities to give the illusion of transformation, perfectly mimicking whomever the observer loves the most.",
        "aiDescription": "Capable of swallowing a sedan whole, the Beloved Mimic relishes the chance to sink its razor-sharp teeth into incapacitated crawlers. Armed with psionic attacks and psychic abilities, the Beloved Mimic is a foe few crawlers survive—despite the monster’s inability to physically chase them down.",
        "notes": "Mesmerized—Crawlers cannot attack the Mimic while Mesmerized and must spend their 10ft Step moving towards it. Swallowed—Swallowed crawlers take 1d8+F Acid at the end of each round.",
        "special": "Mesmerized—Crawlers cannot attack the Mimic while Mesmerized and must spend their 10ft Step moving towards it. Swallowed—Swallowed crawlers take 1d8+F Acid at the end of each round.",
        "source": "Page 145, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002801",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "3d12",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "15ft range. On unsuccessful Evade, target gains Swallowed Debuff."
        }
      },
      {
        "_id": "dccatkmob0002802",
        "name": "Heartstrings",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "100ft range, 20ft Blast radius. Free Cha Stat Check vs Difficulty 15+F or gain Mesmerized Debuff."
        }
      },
      {
        "_id": "dccatkmob0002803",
        "name": "Psionic Strike",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "3d10",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Mental Scarring Debuff (-1 Int Mod)."
        }
      },
      {
        "_id": "dcclootmob002801",
        "name": "Heartstring Fibers",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 3,
          "notes": "Psychic filaments that vibrate with emotion.",
          "description": "Psychic filaments that vibrate with emotion."
        }
      },
      {
        "_id": "dcclootmob002802",
        "name": "Colossal Mimic Tooth",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Razor-sharp tooth the size of a gladius.",
          "description": "Razor-sharp tooth the size of a gladius."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000029",
    "name": "Blind Goblin Survivor",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
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
        "treasure": "Scavenged Tapping Stick, Dirty Resin Bandages",
        "xp": 200,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Bugaboo Warrens",
        "description": "Former captives of Stiggy's operation released alive from harvesting pens. Their empty eye sockets are wrapped in dirty bandages or smeared with resin. They navigate by sound and smell alone.",
        "aiDescription": "These unlucky bastards are proof that the harvesting process is technically non-lethal. Well, at least not directly. Being a blind Mob in this dungeon is just asking to be fodder for crawlers keen on grinding to level up. But they’ve adapted, so you don’t have to feel sorry for them or anything.",
        "notes": "Motion Detection—If a crawler makes a Surprise Attack against a Blind Goblin Survivor, it immediately strikes back at no Action cost. Blind—No penalties for fighting in darkness or fog.",
        "special": "Motion Detection—If a crawler makes a Surprise Attack against a Blind Goblin Survivor, it immediately strikes back at no Action cost. Blind—No penalties for fighting in darkness or fog.",
        "source": "Page 129, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0002901",
        "name": "Blind Fighting",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range. Attacks cannot be redirected (no Taunt, Catcher, etc.)."
        }
      },
      {
        "_id": "dcclootmob002901",
        "name": "Scavenged Tapping Stick",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Sturdy stick used for echolocation.",
          "description": "Sturdy stick used for echolocation."
        }
      },
      {
        "_id": "dcclootmob002902",
        "name": "Dirty Resin Bandages",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Hemostatic goblin wraps.",
          "description": "Hemostatic goblin wraps."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000030",
    "name": "Bruiser",
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
          "value": 4,
          "unenhanced": 4,
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
          "total": 2
        },
        "dr": {
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
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
        "treasure": "Reinforced Pointy Stick, Crawler Gold",
        "xp": 250,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 5,
        "classification": "Crawler",
        "creatureType": "Human",
        "floor": "Floor 1",
        "location": "Dungeon Thoroughfares",
        "description": "A heavily-built rival crawler who relies on pure muscle and brute force. Unfortunately, muscle alone rarely keeps you alive in the World Dungeon.",
        "aiDescription": "These schmucks just keep dying. Rival crawler who thought pumping iron in the saferooms would prepare him for the meat-grinder.",
        "notes": "Rival Crawler—Aggressive NPC combatant.",
        "special": "Rival Crawler—Aggressive NPC combatant.",
        "source": "Page 136, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003001",
        "name": "Pointy Stick",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob003001",
        "name": "Reinforced Pointy Stick",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Improvised spear crafted by a desperate crawler.",
          "description": "Improvised spear crafted by a desperate crawler."
        }
      },
      {
        "_id": "dcclootmob003002",
        "name": "Crawler Gold",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 15,
          "notes": "Standard dungeon currency.",
          "description": "Standard dungeon currency."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000031",
    "name": "Bugaboo Goblin-napper",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "con": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
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
        "treasure": "Goblin-Catching Net, Bugaboo Cudgel",
        "xp": 300,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Passive (Aggressive) Perception Area",
        "description": "The lowest-ranking members of Stiggy’s operation, Bugaboo Goblin-Nappers work in pairs, roaming the dungeon looking for Goblins to steal. They carry oversized nets, man-catchers, and large cudgels.",
        "aiDescription": "Oh, look. Bugaboo Goblin-Nappers! Their job is simple: find Goblins and bring them back for 'processing.' They don’t start fights—at least not fair fights. No, these guys are more likely to jump you when your pants are down and your friends aren’t there.",
        "notes": "Cautious—They travel in pairs and avoid fair fights. If Surprised or when one is killed, they retreat until they find reinforcements.",
        "special": "Cautious—They travel in pairs and avoid fair fights. If Surprised or when one is killed, they retreat until they find reinforcements.",
        "source": "Page 128, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003101",
        "name": "Cudgel",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0003102",
        "name": "Net",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "20ft range, 10ft Blast radius. Hits apply Held Debuff until end of round."
        }
      },
      {
        "_id": "dcclootmob003101",
        "name": "Goblin-Catching Net",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Weighted reinforced netting.",
          "description": "Weighted reinforced netting."
        }
      },
      {
        "_id": "dcclootmob003102",
        "name": "Bugaboo Cudgel",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Heavy wooden club.",
          "description": "Heavy wooden club."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000032",
    "name": "Bugaboo Socket-Picker",
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
          "total": 3
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
        "treasure": "Surgical Hook-Knife, Padded Specimen Jar",
        "xp": 250,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Passive (Aggressive) Perception Area",
        "description": "Harvesting specialists of Stiggy’s operation, tasked with extracting Goblin eyes and preparing them for use in Screye Cameras and Drones. They carry hooked knives, bone scoops, and padded jars.",
        "aiDescription": "The willing pupils of whoever started this ocular harvest, these Bugaboos have steady hands and empty jars. While their friends handle the grabbing and dragging, these specialists harvest the parts that power the cameras. Don’t blink or you’ll mess up their work.",
        "notes": "Socket-Pickers avoid direct combat whenever possible, letting other Bugaboos restrain subjects before harvesting.",
        "special": "Socket-Pickers avoid direct combat whenever possible, letting other Bugaboos restrain subjects before harvesting.",
        "source": "Page 128, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003201",
        "name": "Hook-Knife",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "dex",
          "damageType": "Slashing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Major Injury Debuff (dangling eye!)."
        }
      },
      {
        "_id": "dccatkmob0003202",
        "name": "Bone Scoop",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob003201",
        "name": "Surgical Hook-Knife",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Wicked curved blade designed for precision excision.",
          "description": "Wicked curved blade designed for precision excision."
        }
      },
      {
        "_id": "dcclootmob003202",
        "name": "Padded Specimen Jar",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Jars lined with preservation fluid.",
          "description": "Jars lined with preservation fluid."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000033",
    "name": "Canidna",
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
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Canidna Quill Spine, Spiny Wolf Pelt",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1",
        "location": "Pack Halls",
        "description": "Canine creatures nearly identical to wolves, except for the jagged spines covering their backs and flanks. When cornered, they roll into tight balls to impale crawlers.",
        "aiDescription": "Don’t let their beady little eyes and adorable faces fool you—these spiky bastards have personalities as prickly as their appearance. They want you dead, and they’re not shy about how they accomplish it!",
        "notes": "Pack Hunting—Targets adjacent to 2+ Canidna with no adjacent allies roll Evade with Disadvantage. Desperation—Spike Ball used only when cornered or numbers halved.",
        "special": "Pack Hunting—Targets adjacent to 2+ Canidna with no adjacent allies roll Evade with Disadvantage. Desperation—Spike Ball used only when cornered or numbers halved.",
        "source": "Page 31, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003301",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0003302",
        "name": "Spike Ball",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "5ft range. On Major Fail or worse, crawler gains Blood Trail Debuff."
        }
      },
      {
        "_id": "dcclootmob003301",
        "name": "Canidna Quill Spine",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 3,
          "notes": "Hardened keratin spike.",
          "description": "Hardened keratin spike."
        }
      },
      {
        "_id": "dcclootmob003302",
        "name": "Spiny Wolf Pelt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Rough pelt studded with natural armor.",
          "description": "Rough pelt studded with natural armor."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000034",
    "name": "Cardium Clam",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "int": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "cha": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        }
      },
      "attributes": {
        "hp": {
          "value": 36,
          "max": 36,
          "temp": 0,
          "pct": 100,
          "bars": 12,
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
          "armor": 4,
          "items": 0,
          "buffs": 0,
          "total": 4
        },
        "speed": {
          "move": 0,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Huge",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Immaculate Pearl, Cardium Shell Shard",
        "xp": 450,
        "surpriseDifficulty": "15+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 9,
        "classification": "Neighborhood Boss",
        "creatureType": "Monstrous",
        "floor": "Floor 2",
        "location": "Mind Maze Deep Pools",
        "description": "The Cardium Clam loathes all creatures with intelligence higher than its own. Rooted in place, it launches hypersonic pearl artillery across massive distances.",
        "aiDescription": "The Cardium Clam, Immaculate Bivalve. Level 9 Neighborhood Boss. Sometimes our most beautiful enemies hit the hardest. Washed from the depths of oceans unplumbed by civilization, the Cardium Clam loathes all creatures with intelligence higher than its own. It’s here to prove that the world should never rely on brains over beauty and that all that glitters is gorgeous. Talk about toxic standards!",
        "notes": "Exposed Foot—Foot extends and becomes targetable (–3 penalty) during rounds with Step or Foot Probe (DR 0). Probing Foot—Explosive Pearl and Pearl Grapeshot can be used in the same round as Foot Probe.",
        "special": "Exposed Foot—Foot extends and becomes targetable (–3 penalty) during rounds with Step or Foot Probe (DR 0). Probing Foot—Explosive Pearl and Pearl Grapeshot can be used in the same round as Foot Probe.",
        "source": "Page 125, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003401",
        "name": "Hypersonic Pearl",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d10",
          "damageStat": "int",
          "damageType": "Bludgeoning",
          "effects": "200ft range. On Evade Major Fail or worse, crawler is pushed 15ft."
        }
      },
      {
        "_id": "dccatkmob0003402",
        "name": "Explosive Pearl",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "int",
          "damageType": "Bludgeoning",
          "effects": "90ft range, 10ft Blast + 5ft Splash."
        }
      },
      {
        "_id": "dccatkmob0003403",
        "name": "Foot Probe",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d10",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "10ft range."
        }
      },
      {
        "_id": "dccatkmob0003404",
        "name": "Heartbeat Thump",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft Burst radius."
        }
      },
      {
        "_id": "dccatkmob0003405",
        "name": "Pearl Grapeshot",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "int",
          "damageType": "Bludgeoning",
          "effects": "90ft Cone."
        }
      },
      {
        "_id": "dcclootmob003401",
        "name": "Immaculate Pearl",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Enormous shimmering pearl with psychic resonance.",
          "description": "Enormous shimmering pearl with psychic resonance."
        }
      },
      {
        "_id": "dcclootmob003402",
        "name": "Cardium Shell Shard",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Hardened shell plate (DR crafting material).",
          "description": "Hardened shell plate (DR crafting material)."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000035",
    "name": "Chilly Goat",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
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
        "treasure": "Chilly Goat Horn, Fanged Goat Pelt",
        "xp": 200,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Fanged Goat",
        "floor": "Floor 1",
        "location": "Serving Warrens Cold Halls",
        "description": "Hardy, fanged goats bred on distant snow-covered worlds. Their fanged maws, voracious appetites, and freezing aura make them dangerous to riders and handlers alike.",
        "aiDescription": "'The Chilly Goat’s Bluff' is a phrase common throughout the Syndicate. It’s a 'polite' way of saying the person in front of you is most likely a cold and unfeeling fucking sociopath. Impaled by horns? Ripped apart by fangs? Or frozen solid? If you ask nicely, maybe you can have all three.",
        "notes": "Already Chilly—Immune to Cold Damage. Prefers Being Chilly—Fire deals x2 damage to Chilly Goats.",
        "special": "Already Chilly—Immune to Cold Damage. Prefers Being Chilly—Fire deals x2 damage to Chilly Goats.",
        "source": "Page 40, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003501",
        "name": "Horns",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0003502",
        "name": "Fangs",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0003503",
        "name": "Icy Aura",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "con",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "con",
          "damageType": "Ice",
          "effects": "15ft Burst radius, once every three rounds."
        }
      },
      {
        "_id": "dcclootmob003501",
        "name": "Chilly Goat Horn",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Frost-rimed spiraling horn.",
          "description": "Frost-rimed spiraling horn."
        }
      },
      {
        "_id": "dcclootmob003502",
        "name": "Fanged Goat Pelt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Thick fur insulating against extreme cold.",
          "description": "Thick fur insulating against extreme cold."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000036",
    "name": "Danger Dingo (Floor 2 Swarm)",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
        "treasure": "Dingo Canine, Swarm Dingo Hide",
        "xp": 250,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Second Floor Wilderness",
        "description": "Aggressive pack predators of the Second Floor. They coordinate in ravenous hunting swarms and harass crawlers over long distances.",
        "aiDescription": "Threat Appendix variant of the Danger Dingo. Same bad attitude, new floor, and even more pack members ready to turn your legs into breakfast.",
        "notes": "Good Impressions—Injured Dingo may become non-hostile if fed or played metal music. Ravager—+1d6 damage if moving 20ft straight before Ravage.",
        "special": "Good Impressions—Injured Dingo may become non-hostile if fed or played metal music. Ravager—+1d6 damage if moving 20ft straight before Ravage.",
        "source": "Page 141, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003601",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Rabies Debuff."
        }
      },
      {
        "_id": "dccatkmob0003602",
        "name": "Ravage",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "5ft range. On Evade Major Fail or worse, target gains Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob003601",
        "name": "Dingo Canine",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Sharp predator tooth.",
          "description": "Sharp predator tooth."
        }
      },
      {
        "_id": "dcclootmob003602",
        "name": "Swarm Dingo Hide",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Tough canine hide.",
          "description": "Tough canine hide."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000037",
    "name": "Dream Eaters",
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Shadow Essence, Iridescent Dream Tooth",
        "xp": 250,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Shadow",
        "floor": "Floor 2",
        "location": "Mind Maze Shadows",
        "description": "Pitch-black, cat-sized creatures that stalk the hallways of the maze, waiting for exhausted crawlers to collapse. They induce nightmares and feed on psychic tension.",
        "aiDescription": "A group of shadows flits across your vision, slinking in the shadows of the alleyway. Several clumps of eyes reflect light back to you from the shadows, gleaming and hungry. A wave of tiredness washes over you—tempting you to lie down and sleep. Surely the world of dreams is better than this awful place.",
        "notes": "Dream Eaters exist to haunt you while you sleep. They shift between shapes of owls, lizards, and miniature pigs.",
        "special": "Dream Eaters exist to haunt you while you sleep. They shift between shapes of owls, lizards, and miniature pigs.",
        "source": "Page 118, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003701",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Nightmares Debuff (wakes Fatigued)."
        }
      },
      {
        "_id": "dcclootmob003701",
        "name": "Shadow Essence",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Condensed dream-devouring smoke.",
          "description": "Condensed dream-devouring smoke."
        }
      },
      {
        "_id": "dcclootmob003702",
        "name": "Iridescent Dream Tooth",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Translucent tooth reflecting nightmare scenes.",
          "description": "Translucent tooth reflecting nightmare scenes."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000038",
    "name": "Fire-Fighter",
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
          "value": 10,
          "unenhanced": 10,
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
          "total": 4
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Sheol Ember",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Minor Fire Elemental",
        "floor": "Floor 1",
        "location": "Serving Warrens",
        "description": "Shapeless blobs of living flame summoned from the wastelands of Sheol. Intangible and mindless, they squeeze through non-airtight openings and burn anything they touch.",
        "aiDescription": "At first, you may have made the mistake of thinking this was your garden-variety floating tuft of fire. Given that it’s zooming directly at your face now, you’ve likely realized you were wrong. Congratulations! You were very wrong. Normal weapons won't have any effect on these fiery bastards.",
        "notes": "Intangibility—Cannot be harmed by non-Spell damage. Contact with water will destroy this creature immediately.",
        "special": "Intangibility—Cannot be harmed by non-Spell damage. Contact with water will destroy this creature immediately.",
        "source": "Page 41, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003801",
        "name": "Fiery Touch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Fire",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob003801",
        "name": "Sheol Ember",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Perpetually glowing ember from the abyss.",
          "description": "Perpetually glowing ember from the abyss."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000039",
    "name": "Giant Spiders",
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
          "total": 2
        },
        "dr": {
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
        },
        "speed": {
          "move": 25,
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
        "treasure": "Highland Spider Silk, Silky Shirt",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Beast",
        "floor": "Floor 1",
        "location": "Webbinghoods",
        "description": "Gargantuan arachnids the size of Highland heifers that weave immense webs as strong as steel. They keep Slimy Croakers as symbiotic pets to guard their eggs.",
        "aiDescription": "Do you like spiders? Well, spend a few days running from these chunky bastards and see how you feel then. The Giant Spiders are the size of Highland heifers and excrete sticky webs as strong as steel. Stay away from their webs, their nests, and their eggs.",
        "notes": "Web Movement—Other creatures on a Giant Spider’s webs move at half speed and cannot take a 10ft Step.",
        "special": "Web Movement—Other creatures on a Giant Spider’s webs move at half speed and cannot take a 10ft Step.",
        "source": "Page 51, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0003901",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff."
        }
      },
      {
        "_id": "dccatkmob0003902",
        "name": "Webshot",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "50ft range. On Evade Major Fail or worse, crawler gains Held Debuff."
        }
      },
      {
        "_id": "dcclootmob003901",
        "name": "Highland Spider Silk",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Steel-strong gossamer threading.",
          "description": "Steel-strong gossamer threading."
        }
      },
      {
        "_id": "dcclootmob003902",
        "name": "Silky Shirt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Tailored spider-silk armor shirt.",
          "description": "Tailored spider-silk armor shirt."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000040",
    "name": "Gnawtria",
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
        "treasure": "Blood-Red Incisor, Waterproof Gnawtria Pelt",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1",
        "location": "Bogbricks Vibrant Walls",
        "description": "Large amphibious mammals the size of a dog with long prehensile tails and blood-red armor-piercing teeth that bite through solid plate as if it weren't there.",
        "aiDescription": "Have you ever seen a possum mixed with a beaver and given blood-red teeth the size of small knives? You haven’t? Well, you’re in luck, because one is coming right for you! These furry little bastards are aggressive, vicious, and those teeth aren’t just for show.",
        "notes": "Swim—Gnawtria can move through water as though on the ground and tread water in place.",
        "special": "Swim—Gnawtria can move through water as though on the ground and tread water in place.",
        "source": "Page 18, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004001",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "5ft range, Armor Piercing. On Evade Major Fail or worse, crawler gains Poisoned Debuff."
        }
      },
      {
        "_id": "dcclootmob004001",
        "name": "Blood-Red Incisor",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Armor-piercing rodent fang.",
          "description": "Armor-piercing rodent fang."
        }
      },
      {
        "_id": "dcclootmob004002",
        "name": "Waterproof Gnawtria Pelt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Dense amphibious fur.",
          "description": "Dense amphibious fur."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000041",
    "name": "Gobblin’ Gators",
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
          "value": 1,
          "unenhanced": 1,
          "mod": 1
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
          "value": 2,
          "max": 2,
          "temp": 0,
          "pct": 100,
          "bars": 2,
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
        "treasure": "Gator Scale Plate, Septic Tooth",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1",
        "location": "Bogbricks Still Waters",
        "description": "Stubby-legged reptilian ambushers created by dungeon AI with disproportionately massive jaws. Their lack of dental hygiene inflicts sepsis upon victims.",
        "aiDescription": "These creatures are about half the size of a normal alligator with twice the attitude. Although, if you asked them, they’d tell you it’s not the size of the gator in the fight, it’s the size of the bite from the gator!",
        "notes": "Swim—Gobblin’ Gators can move twice as fast through water as they can on ground.",
        "special": "Swim—Gobblin’ Gators can move twice as fast through water as they can on ground.",
        "source": "Page 18, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004101",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Sepsis Debuff."
        }
      },
      {
        "_id": "dccatkmob0004102",
        "name": "Tail Thrash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob004101",
        "name": "Gator Scale Plate",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Rugged scutes from Bogbricks gator.",
          "description": "Rugged scutes from Bogbricks gator."
        }
      },
      {
        "_id": "dcclootmob004102",
        "name": "Septic Tooth",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Decaying alligator tooth teeming with bacteria.",
          "description": "Decaying alligator tooth teeming with bacteria."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000042",
    "name": "Goblin",
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
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 2,
          "max": 2,
          "temp": 0,
          "pct": 100,
          "bars": 2,
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
        "treasure": "Pineapple Club, Scavenged Goblin Pocket Lint",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Floor 1 Thoroughfares",
        "description": "Classic dungeon goblin with an inflated sense of superiority, wielding a wooden club capped with a fresh tropical pineapple.",
        "aiDescription": "They think they’re hot shit in a champagne glass. Run-of-the-mill tutorial goblins filled with unreasonable spite and tropical fruit.",
        "notes": "Pineapple Club—Starts with pineapple on club (+1d4 damage, falls off on 3+ HB damage). Spunk—Melee attacks can only remove 1 HB slot per hit unless Amazing Success; +1 damage below full health.",
        "special": "Pineapple Club—Starts with pineapple on club (+1d4 damage, falls off on 3+ HB damage). Spunk—Melee attacks can only remove 1 HB slot per hit unless Amazing Success; +1 damage below full health.",
        "source": "Page 136, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004201",
        "name": "Club",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range (+1d4 while pineapple attached)."
        }
      },
      {
        "_id": "dcclootmob004201",
        "name": "Pineapple Club",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Club with slightly dented pineapple.",
          "description": "Club with slightly dented pineapple."
        }
      },
      {
        "_id": "dcclootmob004202",
        "name": "Scavenged Goblin Pocket Lint",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Odd assortment of shiny pebbles.",
          "description": "Odd assortment of shiny pebbles."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000043",
    "name": "Goblin Bomb Bard",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 10,
          "unenhanced": 10,
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
          "total": 4
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
        "treasure": "Unexploded Blast Powder, Singed Bandolier",
        "xp": 250,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Goblin Engineering Bays",
        "description": "Reckless goblin demolitions fanatic whose musical performances consist entirely of ignited fuses, concussive blasts, and violent shrapnel.",
        "aiDescription": "Who needs a lute when you have high explosives? The Goblin Bomb Bard sings a chorus of pure devastation and usually goes out with a bang.",
        "notes": "Explosive Demise—Explodes on death, dealing 2d8+F to adjacent entities. Unstable Bombs—Roll 1d20 for distance traveled before detonation.",
        "special": "Explosive Demise—Explodes on death, dealing 2d8+F to adjacent entities. Unstable Bombs—Roll 1d20 for distance traveled before detonation.",
        "source": "Page 137, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004301",
        "name": "Bomb",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "60ft range, 5ft Blast radius (Unstable Bombs table)."
        }
      },
      {
        "_id": "dccatkmob0004302",
        "name": "Dynamite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "40ft range, 5ft Blast + 5ft Splash."
        }
      },
      {
        "_id": "dcclootmob004301",
        "name": "Unexploded Blast Powder",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Volatile goblin explosive compound.",
          "description": "Volatile goblin explosive compound."
        }
      },
      {
        "_id": "dcclootmob004302",
        "name": "Singed Bandolier",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Leather harness smelling heavily of sulfur.",
          "description": "Leather harness smelling heavily of sulfur."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000044",
    "name": "Goblin Engineer",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "value": 1,
          "unenhanced": 1,
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
        "treasure": "Engineer's Wrench, Scrap Boiler Plate",
        "xp": 150,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Goblin Workshops",
        "description": "Tinkering goblin mechanic skilled at throwing together hazardous single-seat vehicles out of rusted scrap metal and jury-rigged boilers.",
        "aiDescription": "Give a goblin some rusty sheet metal and a wrench, and within an hour he'll have built a contraption that's just as likely to blow him up as run you over.",
        "notes": "Incel—Prioritizes attacking entities who appear female. Pilot—Can construct single-seat vehicles out of scrap in 1 hour.",
        "special": "Incel—Prioritizes attacking entities who appear female. Pilot—Can construct single-seat vehicles out of scrap in 1 hour.",
        "source": "Page 137, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004401",
        "name": "Sword",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0004402",
        "name": "Metal Shard",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains Stiff Legs Debuff."
        }
      },
      {
        "_id": "dcclootmob004401",
        "name": "Engineer's Wrench",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Greasy makeshift wrench.",
          "description": "Greasy makeshift wrench."
        }
      },
      {
        "_id": "dcclootmob004402",
        "name": "Scrap Boiler Plate",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Sheet metal salvage.",
          "description": "Sheet metal salvage."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000045",
    "name": "Goblin Shamanka",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "int": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
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
          "value": 5,
          "unenhanced": 5,
          "mod": 2
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
        "treasure": "Shamanka Agony Charm, Bone Fetish Beads",
        "xp": 350,
        "surpriseDifficulty": "14+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Goblin Encampments",
        "description": "Revered matriarchal caster of the goblin clans who channels psychic pain and enchants clan machines with vindictive revenge spells.",
        "aiDescription": "The Shamanka doesn't bother with petty firebolts—she sends searing pulses of pure mental agony straight into your skull. And if you smash her clan's rides, she makes sure you eat the explosion.",
        "notes": "Revenge—Enchants clan vehicles so that explosion damage redirects entirely to the entity responsible for destroying it.",
        "special": "Revenge—Enchants clan vehicles so that explosion damage redirects entirely to the entity responsible for destroying it.",
        "source": "Page 137, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004501",
        "name": "Agony Missile",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "50ft range. On Evade Major Fail or worse, crawler gains Blood Trail, Woozy, or Stunned Debuff."
        }
      },
      {
        "_id": "dcclootmob004501",
        "name": "Shamanka Agony Charm",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Totem pulsing with psychic energy.",
          "description": "Totem pulsing with psychic energy."
        }
      },
      {
        "_id": "dcclootmob004502",
        "name": "Bone Fetish Beads",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Enchanted clan jewelry.",
          "description": "Enchanted clan jewelry."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000046",
    "name": "Hide-Hitter Crib Daddy",
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
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 12,
          "unenhanced": 12,
          "mod": 4
        },
        "cha": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        }
      },
      "attributes": {
        "hp": {
          "value": 44,
          "max": 44,
          "temp": 0,
          "pct": 100,
          "bars": 11,
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
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Crib Daddy's Custom Drumsticks, Jazz Master Fedora, Red Silk Tie",
        "xp": 350,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 7,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Bogbricks Cypress Halls Jazz Club",
        "description": "An oversized raccoon wearing a blue fedora and red tie—and nothing else—laying down an ominous jazzy beat with exceptional prowess on a massive stage drum set.",
        "aiDescription": "Hide-Hitter Crib Daddy. Level 7 Neighborhood Boss! Surrounded by his troop of Scat Thugs, the Hide-Hitter Crib Daddy knows how to keep things chill. A good rhythm section lays down any tune, and with the Hide-Hitter Crib Daddy leading the battle on the drums, you’re in for a screaming, steaming good time.",
        "notes": "Smelly—Melee Amazing Success splashes musk (Sepsis Debuff). Bodies Hit the Floor—Trash Princesses within 10ft get +1d4 damage. Daddy's Princesses—Immune to Trash Princess Area damage. Hide-Hitter—Never unarmed near drum kit.",
        "special": "Smelly—Melee Amazing Success splashes musk (Sepsis Debuff). Bodies Hit the Floor—Trash Princesses within 10ft get +1d4 damage. Daddy's Princesses—Immune to Trash Princess Area damage. Hide-Hitter—Never unarmed near drum kit.",
        "source": "Page 27, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004601",
        "name": "Pocket Groove",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "cha",
          "damageType": "Psychic",
          "effects": "5ft range (requires drumsticks). On Evade Major Fail or worse, crawler gains Woozy Debuff."
        }
      },
      {
        "_id": "dccatkmob0004602",
        "name": "Downbeat",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "30ft Burst radius (requires drumsticks). On Evade Major Fail or worse, crawler gains Fatigued Debuff."
        }
      },
      {
        "_id": "dccatkmob0004603",
        "name": "Stick-Click",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "30ft range (requires drumsticks). On Evade Major Fail or worse, crawler gains Stuck Debuff."
        }
      },
      {
        "_id": "dcclootmob004601",
        "name": "Crib Daddy's Custom Drumsticks",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Balanced hardwood sticks that resonate with sonic power.",
          "description": "Balanced hardwood sticks that resonate with sonic power."
        }
      },
      {
        "_id": "dcclootmob004602",
        "name": "Jazz Master Fedora",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Stylish blue fedora with +1 Cha bonus.",
          "description": "Stylish blue fedora with +1 Cha bonus."
        }
      },
      {
        "_id": "dcclootmob004603",
        "name": "Red Silk Tie",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Unstained red necktie smelling faintly of musk.",
          "description": "Unstained red necktie smelling faintly of musk."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000047",
    "name": "Hissing Scatterer",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 4,
          "unenhanced": 4,
          "mod": 2
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
          "total": 1
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Hissing Resonator Gland, Scatterer Leg",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Second Floor Tunnels",
        "description": "An aggressive leaping bug that hisses loudly as it bounds across ceiling surfaces to drop directly onto crawler helmets.",
        "aiDescription": "Faster and springier than normal scatterers, these hissing vermin spring across the room before you even register the sound of their skittering feet.",
        "notes": "Leaper—Can start round 15ft away from Leaping Kick target and jump in prior to attack. Wall Walker—Moves on walls and ceilings as ground.",
        "special": "Leaper—Can start round 15ft away from Leaping Kick target and jump in prior to attack. Wall Walker—Moves on walls and ceilings as ground.",
        "source": "Page 139, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004701",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff."
        }
      },
      {
        "_id": "dccatkmob0004702",
        "name": "Leaping Kick",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range (Leaper ability)."
        }
      },
      {
        "_id": "dcclootmob004701",
        "name": "Hissing Resonator Gland",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Chitinous organ that creates loud hisses.",
          "description": "Chitinous organ that creates loud hisses."
        }
      },
      {
        "_id": "dcclootmob004702",
        "name": "Scatterer Leg",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Spring-loaded insectoid leg.",
          "description": "Spring-loaded insectoid leg."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000048",
    "name": "The Hoarder",
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
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        },
        "con": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        },
        "dex": {
          "value": 9,
          "unenhanced": 9,
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
          "value": 44,
          "max": 44,
          "temp": 0,
          "pct": 100,
          "bars": 11,
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
        "treasure": "Pediatric Hospital Gown, Hand-Painted Flowerpot Shards",
        "xp": 350,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 7,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Hoarder's Nest",
        "description": "Surrounded by a mountainous nest of mildewed laundry, rotting dishes, and broken toys, the Hoarder guards her trash fiercely as Scatterers pour continuously from her gaping mouth.",
        "aiDescription": "Where anyone else would see a Scatterer-infested nest of useless garbage—torn pink wrapping paper, rotting dishes, half-filled coloring books, laundry stiff with mildew, shards of a hand-painted flowerpot, a pediatric hospital gown—the Hoarder clings to her valued possessions and guards them accordingly.",
        "notes": "Infested—Weak group of Scatterers or Brood Guardians emerges from mouth each round. Killing all emerging Scatterers before round ends chokes and slays the Hoarder.",
        "special": "Infested—Weak group of Scatterers or Brood Guardians emerges from mouth each round. Killing all emerging Scatterers before round ends chokes and slays the Hoarder.",
        "source": "Page 143, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004801",
        "name": "Punch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "10ft range."
        }
      },
      {
        "_id": "dccatkmob0004802",
        "name": "Drop and Roll",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "20ft Line. Free 20ft move during attack."
        }
      },
      {
        "_id": "dccatkmob0004803",
        "name": "Throw Trash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "60ft range."
        }
      },
      {
        "_id": "dcclootmob004801",
        "name": "Pediatric Hospital Gown",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Tragic worn garment.",
          "description": "Tragic worn garment."
        }
      },
      {
        "_id": "dcclootmob004802",
        "name": "Hand-Painted Flowerpot Shards",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Faded ceramic piece containing faint memories.",
          "description": "Faded ceramic piece containing faint memories."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000049",
    "name": "Homogenous Humors",
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
        "treasure": "Vitreous Humor Vial, Corneal Lens",
        "xp": 150,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Aberration",
        "floor": "Floor 1",
        "location": "Prickly Pack Alleys Shadows",
        "description": "Giant floating eyeballs drifting silently through dark upper corridors, slowly opening and closing their heavy lids as they stalk prey.",
        "aiDescription": "Silent and vicious, the Homogenous Humors are the literal definition of the 'Evil Eye.' Those caught in their paralyzing gaze soon have great difficulty thinking or moving. If you find more than two of them in the same vicinity, you probably want to keep them separate.",
        "notes": "Flight—Moves through air as ground, hovers in place. Merge—If 2+ are within 5ft, they merge into a larger creature gaining +1 to hit and +1 damage die per merged humor.",
        "special": "Flight—Moves through air as ground, hovers in place. Merge—If 2+ are within 5ft, they merge into a larger creature gaining +1 to hit and +1 damage die per merged humor.",
        "source": "Page 32, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0004901",
        "name": "Evil Eye",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "int",
          "damageType": "Necrotic",
          "effects": "50ft range. On Evade Major Fail or worse, crawler gains Fatigued Debuff."
        }
      },
      {
        "_id": "dcclootmob004901",
        "name": "Vitreous Humor Vial",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Thick floating fluid with alchemical properties.",
          "description": "Thick floating fluid with alchemical properties."
        }
      },
      {
        "_id": "dcclootmob004902",
        "name": "Corneal Lens",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Giant reflective crystalline lens.",
          "description": "Giant reflective crystalline lens."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000050",
    "name": "The Juicer",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 25,
          "unenhanced": 25,
          "mod": 5
        },
        "int": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "con": {
          "value": 15,
          "unenhanced": 15,
          "mod": 4
        },
        "dex": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "cha": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 48,
          "max": 48,
          "temp": 0,
          "pct": 100,
          "bars": 12,
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
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
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
        "treasure": "Barbell of Fiery Gains, Torn Muscle Shirt",
        "xp": 450,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 9,
        "classification": "Neighborhood Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Mind Maze Workout Yard",
        "description": "A dumped gym bro fused with a troglodyte basher, pumped full of anabolic steroids and dressed in sleeveless muscle shirts covered in toxic fitness mantras.",
        "aiDescription": "To create the Juicer, find a recently dumped gym bro and combine him with a Troglodyte Basher. Pump that hybrid full of even more anabolic steroids and creatine supplements, dress him in mantra-emblazoned muscle shirts, and convince him living at the gym is 'totally a life-hack', and you’ll get exactly what you deserve.",
        "notes": "Feel the Burn—Weights thrown that miss targets explode on walls for 1d8+F Fire within 10ft. Get Your Blood Pumping—Bulging veins give –2 DR against edged weapons; targeting veins inflicts Blood Trail Debuff.",
        "special": "Feel the Burn—Weights thrown that miss targets explode on walls for 1d8+F Fire within 10ft. Get Your Blood Pumping—Bulging veins give –2 DR against edged weapons; targeting veins inflicts Blood Trail Debuff.",
        "source": "Page 147, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005001",
        "name": "Choke",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d10",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005002",
        "name": "Fiery Weight",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "50ft range. On Evade Major Fail or worse, crawler is pushed back 10ft."
        }
      },
      {
        "_id": "dcclootmob005001",
        "name": "Barbell of Fiery Gains",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Heavy cast-iron weight infused with explosive kinetic heat.",
          "description": "Heavy cast-iron weight infused with explosive kinetic heat."
        }
      },
      {
        "_id": "dcclootmob005002",
        "name": "Torn Muscle Shirt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Inscribed with 'You're Not Tired, You're Weak!'.",
          "description": "Inscribed with 'You're Not Tired, You're Weak!'."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000051",
    "name": "Kobold",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "total": 1
        },
        "dr": {
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "speed": {
          "move": 20,
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
        "treasure": "Kobold Phalanx Spear, Hardened Reptilian Scale",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Kobold Warrens",
        "description": "Reptilian scaly humanoids armed with hunting spears that gather in tight phalanxes to bring down larger prey through disciplined team defense.",
        "aiDescription": "Small, scaly, and constantly barking orders in raspy yaps. You wouldn't think much of one kobold, but get two or three of them together with those long spears and you'll find yourself turned into a pin cushion.",
        "notes": "Pack Defense—When 2+ Kobolds are adjacent, they form a phalanx granting 1 free attack per pair at no Action cost.",
        "special": "Pack Defense—When 2+ Kobolds are adjacent, they form a phalanx granting 1 free attack per pair at no Action cost.",
        "source": "Page 140, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005101",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "10ft range."
        }
      },
      {
        "_id": "dccatkmob0005102",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005103",
        "name": "Yap",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "30ft Burst radius."
        }
      },
      {
        "_id": "dcclootmob005101",
        "name": "Kobold Phalanx Spear",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Sturdy long spear.",
          "description": "Sturdy long spear."
        }
      },
      {
        "_id": "dcclootmob005102",
        "name": "Hardened Reptilian Scale",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Thick natural armor plating.",
          "description": "Thick natural armor plating."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000052",
    "name": "Kobold Rider",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
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
          "total": 2
        },
        "dr": {
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "speed": {
          "move": 20,
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
        "treasure": "Cavalry Lance, Dingo Saddle & Harness",
        "xp": 250,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 5,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Kobold Encampments",
        "description": "Cavalry kobolds mounted atop savage Danger Dingoes, brandishing massive heavy lances and rapid-firing crossbows from the saddle.",
        "aiDescription": "What's worse than a Danger Dingo trying to eat your kneecaps? A kobold strapped to its back aiming a giant lance right between your eyes.",
        "notes": "Dingo Rider—Uses Danger Dingoes as mounts. Lance can only attack in the direction the mount faces; unusable if dismounted.",
        "special": "Dingo Rider—Uses Danger Dingoes as mounts. Lance can only attack in the direction the mount faces; unusable if dismounted.",
        "source": "Page 140, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005201",
        "name": "Lance",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d12",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "10ft range (mounted only)."
        }
      },
      {
        "_id": "dccatkmob0005202",
        "name": "Crossbow",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "50ft range."
        }
      },
      {
        "_id": "dcclootmob005201",
        "name": "Cavalry Lance",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Massive mounted spear.",
          "description": "Massive mounted spear."
        }
      },
      {
        "_id": "dcclootmob005202",
        "name": "Dingo Saddle & Harness",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Leather riding rig.",
          "description": "Leather riding rig."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000053",
    "name": "Krakaren Clone",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
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
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "cha": {
          "value": 15,
          "unenhanced": 15,
          "mod": 4
        }
      },
      "attributes": {
        "hp": {
          "value": 48,
          "max": 48,
          "temp": 0,
          "pct": 100,
          "bars": 12,
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
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "speed": {
          "move": 20,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Gargantuan",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Krakaren Beak, Essential Oil of MLM",
        "xp": 500,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 10,
        "classification": "Neighborhood Boss",
        "creatureType": "Aberrant",
        "floor": "Floor 2",
        "location": "Second Floor Outpost",
        "description": "Massive pink octopus monstrosity with an asymmetrical bob haircut and tentacles lined with shrieking human mouths proselytizing multi-level marketing pitches.",
        "aiDescription": "First off, this isn’t the Krakaren. This is a Krakaren. For every one that is killed, Krakaren Prime births two more. Part of a collective mind intent upon destroying any semblance of scientific progress in the universe, the Krakaren is the only communal brain entity in the galaxy that actually gets stupider as time moves on.",
        "notes": "Bad Hair Day—Frantic if hairstyle gets messed up. Any attack resulting in Amazing Success or better causes all Held Debuffs to cease.",
        "special": "Bad Hair Day—Frantic if hairstyle gets messed up. Any attack resulting in Amazing Success or better causes all Held Debuffs to cease.",
        "source": "Page 115, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005301",
        "name": "Tentacles",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "15ft Cone. Hits apply Held Debuff."
        }
      },
      {
        "_id": "dccatkmob0005302",
        "name": "Constrict",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "Auto-hits Held foes."
        }
      },
      {
        "_id": "dccatkmob0005303",
        "name": "Beak Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005304",
        "name": "Spit Spray",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "con",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "con",
          "damageType": "Poison",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff."
        }
      },
      {
        "_id": "dccatkmob0005305",
        "name": "Pyramid Pitch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "cha",
          "damageType": "Psychic",
          "effects": "50ft range. Free Cha Stat Check; on Fail, spends next Action attacking an ally."
        }
      },
      {
        "_id": "dcclootmob005301",
        "name": "Krakaren Beak",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Massive curved beak.",
          "description": "Massive curved beak."
        }
      },
      {
        "_id": "dcclootmob005302",
        "name": "Essential Oil of MLM",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Suspiciously fragrant, ineffective ointment.",
          "description": "Suspiciously fragrant, ineffective ointment."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000054",
    "name": "Literal Murder Hornets",
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
        "treasure": "Murder Stinger Projectile, Horned Insect Carapace",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Insect",
        "floor": "Floor 1",
        "location": "Webbinghoods Treetops",
        "description": "Sinister flying insects that act as contract assassins of the arthropod realm, capable of shooting venomous stingers directly from their forelegs.",
        "aiDescription": "A few seasons back, this crawler, a real big shot from one of the guilds, suddenly stopped talking and fell face down into her soup. There was a big freakin’ stinger sticking out the back of her neck. Then a giant wasp twenty yards behind her flew off with a creepy smile on its face. It was metal AF.",
        "notes": "Flight—Literal Murder Hornets can move through the air as though on the ground and hover in place.",
        "special": "Flight—Literal Murder Hornets can move through the air as though on the ground and hover in place.",
        "source": "Page 52, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005401",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005402",
        "name": "Stinger",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains Poison Debuff."
        }
      },
      {
        "_id": "dcclootmob005401",
        "name": "Murder Stinger Projectile",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Aerodynamic barbed stinger.",
          "description": "Aerodynamic barbed stinger."
        }
      },
      {
        "_id": "dcclootmob005402",
        "name": "Horned Insect Carapace",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Black-and-yellow chitin.",
          "description": "Black-and-yellow chitin."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000055",
    "name": "Lost Souls",
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
          "value": 4,
          "unenhanced": 4,
          "mod": 2
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
        "treasure": "Faded Crawler Dogtags, Ghostly Residue",
        "xp": 150,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Undead",
        "floor": "Floor 2",
        "location": "Mind Maze Dead Ends",
        "description": "Shambling shades of deceased crawlers who failed to find their way out of the maze. Blank-eyed and envious, they seek to disorient any living crawlers they meet.",
        "aiDescription": "Muttering voices reach your ears before you see the source of the sound, all asking disjointed questions: Where are we? Was it left or right? I’ve seen that door before… A group of shambling figures stumbles into view, touching the walls and looking around with empty eyes, desperate for a new way out.",
        "notes": "Jealous of the living; attacks confuse crawler parties and accelerate dungeon collapse countdown.",
        "special": "Jealous of the living; attacks confuse crawler parties and accelerate dungeon collapse countdown.",
        "source": "Page 119, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005501",
        "name": "Bump",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005502",
        "name": "Muttering",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "int",
          "damageType": "Sonic",
          "effects": "15ft Burst radius. Hits reduce Time to Floor Collapse by 1d2 hours."
        }
      },
      {
        "_id": "dcclootmob005501",
        "name": "Faded Crawler Dogtags",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Tags from an unlucky season crawler.",
          "description": "Tags from an unlucky season crawler."
        }
      },
      {
        "_id": "dcclootmob005502",
        "name": "Ghostly Residue",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Ectoplasmic dust.",
          "description": "Ectoplasmic dust."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000056",
    "name": "Melon-Baller Marvin, Head Bugaboo Socket-Picker",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
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
        "treasure": "Marvin's Precision Melon-Baller, Harvest Overseer Ring of Keys",
        "xp": 550,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 11,
        "classification": "Mob",
        "creatureType": "Unique Humanoid",
        "floor": "Floor 1",
        "location": "Passive (Aggressive) Perception Harvesting Hub",
        "description": "Stiggy’s first and most devoted lieutenant. Where other Bugaboos flee from open conflict, Marvin relishes it, utilizing an enlarged surgical melon-baller to extract eyeballs in the blink of an eye.",
        "aiDescription": "Melon Baller Marvin is the worst kind of monster: middle management. The first Bugaboo taken under the wing of our mysterious villain, Marvin took a ragtag group of pervy loners and turned them into an organized band of organ-harvesting menaces. He perfected the backhanded eye removal with one quick flash of his melon baller.",
        "notes": "Supervises harvesting pens, enforces quotas, and guarantees quality control. Unlike his subordinates, Marvin never runs from danger.",
        "special": "Supervises harvesting pens, enforces quotas, and guarantees quality control. Unlike his subordinates, Marvin never runs from danger.",
        "source": "Page 130, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005601",
        "name": "Melon-Baller",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d4",
          "damageStat": "dex",
          "damageType": "Slashing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Major Injury Debuff (dangling eye!)."
        }
      },
      {
        "_id": "dccatkmob0005602",
        "name": "Bone Scoop",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob005601",
        "name": "Marvin's Precision Melon-Baller",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Razor-edged kitchen tool repurposed for ocular harvest.",
          "description": "Razor-edged kitchen tool repurposed for ocular harvest."
        }
      },
      {
        "_id": "dcclootmob005602",
        "name": "Harvest Overseer Ring of Keys",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Opens holding cages throughout Stiggy's complex.",
          "description": "Opens holding cages throughout Stiggy's complex."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000057",
    "name": "Mind Horror",
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
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        },
        "con": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "dex": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "cha": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        }
      },
      "attributes": {
        "hp": {
          "value": 8,
          "max": 8,
          "temp": 0,
          "pct": 100,
          "bars": 4,
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
          "total": 1
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 0,
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
        "treasure": "Preserved Jellified Brain Matter, Writhing Nerve Tendril",
        "xp": 200,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Aberrant",
        "floor": "Floor 2",
        "location": "Mind Maze Corridors",
        "description": "Floating gelatinous brains lingering in packs with squirming tentacles dangling beneath, constantly draining the intelligence and sanity of nearby crawlers.",
        "aiDescription": "The constant, low-level headache that plagued you since you entered the Neighborhood gets stronger as you turn a corner, a cluster of Mind Horrors coming into view. The floating jellified brains turn toward you, tentacles squirming in anticipation of the intelligence they are about to consume.",
        "notes": "Ego Screen—Entities with Int greater than Mind Horror are immune to its Debuffs. Mandatory Flight—Hovers by default; splatters on ground if killed or forced down.",
        "special": "Ego Screen—Entities with Int greater than Mind Horror are immune to its Debuffs. Mandatory Flight—Hovers by default; splatters on ground if killed or forced down.",
        "source": "Page 119, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005701",
        "name": "Mindspike Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "1d12",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "30ft range."
        }
      },
      {
        "_id": "dccatkmob0005702",
        "name": "Psionic Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "60ft Burst radius. Hits apply Splitting Headache Debuff (1d6+F Psychic/round, stackable)."
        }
      },
      {
        "_id": "dccatkmob0005703",
        "name": "Splatter",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "int",
          "damageType": "Acid",
          "effects": "5ft Burst radius. Hits apply Queasy Debuff."
        }
      },
      {
        "_id": "dcclootmob005701",
        "name": "Preserved Jellified Brain Matter",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Potent psionic catalyst for potions.",
          "description": "Potent psionic catalyst for potions."
        }
      },
      {
        "_id": "dcclootmob005702",
        "name": "Writhing Nerve Tendril",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Sensory filament sensitive to psychic energy.",
          "description": "Sensory filament sensitive to psychic energy."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000058",
    "name": "Mirror Cat",
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
          "value": 2,
          "max": 2,
          "temp": 0,
          "pct": 100,
          "bars": 2,
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Phase Whiskers, Dimensional Cat Hair",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1",
        "location": "Packrooms",
        "description": "Hairless sphinx-like cats that appear perfectly bisected down the middle, slipping between dimensional rifts to strike from two sides at once.",
        "aiDescription": "And I’ll bet you thought sphinx cats couldn’t get any weirder, huh? Well, watch out, because the weird doesn’t stop with their bisected appearance. These guys don’t make their home in holes in the ground, but in holes between dimensions. Hope you were good at Whack-a-Mole…",
        "notes": "Multiplies exponentially—At end of every other round, another Mirror Cat appears until their numbers double the party size.",
        "special": "Multiplies exponentially—At end of every other round, another Mirror Cat appears until their numbers double the party size.",
        "source": "Page 31, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005801",
        "name": "Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Slashing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005802",
        "name": "Phase Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "dex",
          "damageType": "Psychic",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains Confused Debuff."
        }
      },
      {
        "_id": "dcclootmob005801",
        "name": "Phase Whiskers",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Shimmering whiskers that blur out of focus.",
          "description": "Shimmering whiskers that blur out of focus."
        }
      },
      {
        "_id": "dcclootmob005802",
        "name": "Dimensional Cat Hair",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Trans-spatial fuzz.",
          "description": "Trans-spatial fuzz."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000059",
    "name": "MisChief",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        },
        "con": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "dex": {
          "value": 10,
          "unenhanced": 10,
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
          "value": 44,
          "max": 44,
          "temp": 0,
          "pct": 100,
          "bars": 11,
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
        "treasure": "MisChief's Heavy Mattock, Manhole Shield, Red Boss Pants",
        "xp": 350,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 7,
        "classification": "Neighborhood Boss",
        "creatureType": "Rat Knight",
        "floor": "Floor 1",
        "location": "10th and Baltimore Intersection",
        "description": "A grizzled Rat-kin standing nine feet tall, wearing red pants and wielding a devastating mining mattock with desperation born of loyalty to his horde.",
        "aiDescription": "MisChief. Leader of the Rat-kin Horde. Level 7 Neighborhood Boss! The MisChief is a new position. It’s fallen on this Rat’s head by circumstance and loyalty rather than desire. Right now, he’s staring at you like a rat fleeing a sinking ship. You might wonder what that look of desperation is about, but I wouldn’t. I’d worry more about the giant-ass mattock swinging for your head instead.",
        "notes": "Leader of the Rat-kin Horde. Fights to protect the Rat Bastard child.",
        "special": "Leader of the Rat-kin Horde. Fights to protect the Rat Bastard child.",
        "source": "Page 47, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0005901",
        "name": "Mattock",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d10",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0005902",
        "name": "Manhole Cover",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft range."
        }
      },
      {
        "_id": "dccatkmob0005903",
        "name": "Traffic Dodger",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft Line. Cars appear out of nowhere driving in a straight line."
        }
      },
      {
        "_id": "dcclootmob005901",
        "name": "MisChief's Heavy Mattock",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Heavy two-handed piercing pick.",
          "description": "Heavy two-handed piercing pick."
        }
      },
      {
        "_id": "dcclootmob005902",
        "name": "Manhole Shield",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Cast iron Kansas City manhole cover.",
          "description": "Cast iron Kansas City manhole cover."
        }
      },
      {
        "_id": "dcclootmob005903",
        "name": "Red Boss Pants",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Bright crimson trousers.",
          "description": "Bright crimson trousers."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000060",
    "name": "Pickmees",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 8,
          "unenhanced": 8,
          "mod": 3
        },
        "int": {
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "con": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "dex": {
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
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
        "size": "Large",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Jug of Rev-Up Fuel, ADHypermarket VIP Card",
        "xp": 350,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Aberration",
        "floor": "Floor 2",
        "location": "ADHypermarket Corridors",
        "description": "Towering aberrant shoppers mutated by endless commercialization in the ADHypermarket, brandishing volatile jugs of promotional Rev-Up fuel.",
        "aiDescription": "Living monuments to consumer desperation, these multi-limbed horrors throw incendiary sales jugs and grab anyone who doesn't respect the clearance aisle.",
        "notes": "Lurks among towering retail shelves and Rev-Up retention vaults.",
        "special": "Lurks among towering retail shelves and Rev-Up retention vaults.",
        "source": "Page 109, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006001",
        "name": "Rev Jug",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "str",
          "damageType": "Fire",
          "effects": "20ft range, 5ft Burst + 5ft Splash. On Evade Major Fail or worse, crawler gains Burned Debuff."
        }
      },
      {
        "_id": "dccatkmob0006002",
        "name": "Tentacles",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "10ft range. On Evade Major Fail or worse, crawler gains Held Debuff."
        }
      },
      {
        "_id": "dcclootmob006001",
        "name": "Jug of Rev-Up Fuel",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Highly flammable high-octane chemical beverage.",
          "description": "Highly flammable high-octane chemical beverage."
        }
      },
      {
        "_id": "dcclootmob006002",
        "name": "ADHypermarket VIP Card",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Plastic membership badge.",
          "description": "Plastic membership badge."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000061",
    "name": "Prosperity Prophet",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "int": {
          "value": 55,
          "unenhanced": 55,
          "mod": 6
        },
        "con": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "dex": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "cha": {
          "value": 25,
          "unenhanced": 25,
          "mod": 5
        }
      },
      "attributes": {
        "hp": {
          "value": 115,
          "max": 115,
          "temp": 0,
          "pct": 100,
          "bars": 23,
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
          "total": 5
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
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Robes of Seraphian Prosperity, Coven Tithe Chalice",
        "xp": 1150,
        "surpriseDifficulty": "16+F",
        "evadeDifficulty": "15+F"
      },
      "details": {
        "level": 23,
        "classification": "City Boss",
        "creatureType": "Undead",
        "floor": "Floor 2",
        "location": "Cathedral of Wealth",
        "description": "An ancient Seraphian Vampire disguised as a pious prosperity preacher, swindling the vulnerable and draining the lifeblood of his coven-gregation.",
        "aiDescription": "Although the Prosperity Prophet may appear human at first glance, further inspection will reveal the fiendish truth: Twisted by the loss of their idyllic home world, this ancient race has been corrupted into Seraphian Vampires. In exchange for unquestioned devotion, the Prosperity Prophet promises their coven-gregation wealth and power.",
        "notes": "Drain Blood—Victims who die from Drain Blood rise as Undead Minions. Flight—Hovers and moves through air as ground. Money Grubbing—Loses 1 Action per 100 gold thrown at him.",
        "special": "Drain Blood—Victims who die from Drain Blood rise as Undead Minions. Flight—Hovers and moves through air as ground. Money Grubbing—Loses 1 Action per 100 gold thrown at him.",
        "source": "Page 144, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006101",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d10",
          "damageStat": "str",
          "damageType": "Necrotic",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Drain Blood Debuff."
        }
      },
      {
        "_id": "dccatkmob0006102",
        "name": "Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d12",
          "damageStat": "str",
          "damageType": "Necrotic",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0006103",
        "name": "Sleep Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "50ft range, 20ft Blast radius. Con Stat Check vs 16+F or gain Unconscious Debuff."
        }
      },
      {
        "_id": "dcclootmob006101",
        "name": "Robes of Seraphian Prosperity",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Opulent velvet vestments woven with gold thread.",
          "description": "Opulent velvet vestments woven with gold thread."
        }
      },
      {
        "_id": "dcclootmob006102",
        "name": "Coven Tithe Chalice",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Solid gold goblet for collecting blood offerings.",
          "description": "Solid gold goblet for collecting blood offerings."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000062",
    "name": "Rage Elemental",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 136,
          "unenhanced": 136,
          "mod": 7
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 66,
          "unenhanced": 66,
          "mod": 6
        },
        "dex": {
          "value": 15,
          "unenhanced": 15,
          "mod": 4
        },
        "cha": {
          "value": 66,
          "unenhanced": 66,
          "mod": 6
        }
      },
      "attributes": {
        "hp": {
          "value": 60,
          "max": 60,
          "temp": 0,
          "pct": 100,
          "bars": 10,
          "hpPerBar": 6
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
          "armor": 13,
          "items": 0,
          "buffs": 0,
          "total": 13
        },
        "speed": {
          "move": 60,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Colossal",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Pure Rage Core, System Retribution Fragment",
        "xp": 4650,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 93,
        "classification": "Mob",
        "creatureType": "Elemental",
        "floor": "Floor 2",
        "location": "Rule-Breaker Penalty Zones",
        "description": "A cataclysmic, terrifying entity of pure incandescent fury spawned directly by the System AI when dungeon crawlers flagrantly violate core rules.",
        "aiDescription": "Not truly a Second Floor Mob, but this is what happens when you break the rules… When you push the AI too far, it stops playing by the handbook and drops an extinction event directly on your head.",
        "notes": "Elemental—Immune to non-magical physical damage. Gravity Reversed—Creatures fall wrong direction taking 1d6/10ft. Reincarnation—Revives at full health once per claimed soul. Soul Reaper—Dissipates after 666 souls.",
        "special": "Elemental—Immune to non-magical physical damage. Gravity Reversed—Creatures fall wrong direction taking 1d6/10ft. Reincarnation—Revives at full health once per claimed soul. Soul Reaper—Dissipates after 666 souls.",
        "source": "Page 141, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006201",
        "name": "Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "5d8",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "10ft range."
        }
      },
      {
        "_id": "dccatkmob0006202",
        "name": "Roar",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "20ft Burst radius. Hits apply Paralyzed Debuff."
        }
      },
      {
        "_id": "dcclootmob006201",
        "name": "Pure Rage Core",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Pulsing crystallized heart of raw primordial anger.",
          "description": "Pulsing crystallized heart of raw primordial anger."
        }
      },
      {
        "_id": "dcclootmob006202",
        "name": "System Retribution Fragment",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Glitch-textured matter extracted from rule enforcement.",
          "description": "Glitch-textured matter extracted from rule enforcement."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000063",
    "name": "Rakish Werehound Shocker",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "int": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "con": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "dex": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "cha": {
          "value": 21,
          "unenhanced": 21,
          "mod": 5
        }
      },
      "attributes": {
        "hp": {
          "value": 85,
          "max": 85,
          "temp": 0,
          "pct": 100,
          "bars": 17,
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
          "total": 5
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
        "treasure": "Bespoke Soho Black Suit, Werehound Alpha Fang",
        "xp": 950,
        "surpriseDifficulty": "15+F",
        "evadeDifficulty": "15+F"
      },
      "details": {
        "level": 19,
        "classification": "Borough Boss",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Soho Borough Enclave",
        "description": "Stoic, sharply dressed in an all-black bespoke suit with immaculately styled hair, leading his pack of Werehound Greys with brutal elegance and electric fury.",
        "aiDescription": "Stoic and sharply dressed in an all-black suit, the inspiration for this nocturnal hunter was pulled from Gerrard Street in Soho. Armed with a ferocious headbutt attack, shocking speed, and lightning-strike abilities, the Rakish Werehound Shocker is the alpha male in his loyal pack of Werehound Greys.",
        "notes": "Savagely Sexy—Double Str Mod for damage against cats, royalty, and women aged 40+. Silver Weakness—Silver weapons deal x2 damage, bypass DR, and apply The Taint Debuff.",
        "special": "Savagely Sexy—Double Str Mod for damage against cats, royalty, and women aged 40+. Silver Weakness—Silver weapons deal x2 damage, bypass DR, and apply The Taint Debuff.",
        "source": "Page 147, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006301",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Lycanthropy Debuff."
        }
      },
      {
        "_id": "dccatkmob0006302",
        "name": "Claw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d10",
          "damageStat": "dex",
          "damageType": "Slashing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Blood Trail Debuff."
        }
      },
      {
        "_id": "dccatkmob0006303",
        "name": "Headbutt",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range. Cha Stat Check vs 15+F or gain Charmed Debuff."
        }
      },
      {
        "_id": "dccatkmob0006304",
        "name": "Lightning Bolt Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d10",
          "damageStat": "int",
          "damageType": "Electric",
          "effects": "30ft Line. On Evade Major Fail or worse, crawler gains Shocked Debuff."
        }
      },
      {
        "_id": "dcclootmob006301",
        "name": "Bespoke Soho Black Suit",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Impeccably tailored suit granting +1 to all social checks.",
          "description": "Impeccably tailored suit granting +1 to all social checks."
        }
      },
      {
        "_id": "dcclootmob006302",
        "name": "Werehound Alpha Fang",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Electrified canine tooth.",
          "description": "Electrified canine tooth."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000064",
    "name": "Ralph the Frenzied Gerbil",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 14,
          "unenhanced": 14,
          "mod": 4
        },
        "int": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "con": {
          "value": 6,
          "unenhanced": 6,
          "mod": 3
        },
        "dex": {
          "value": 20,
          "unenhanced": 20,
          "mod": 5
        },
        "cha": {
          "value": 11,
          "unenhanced": 11,
          "mod": 4
        }
      },
      "attributes": {
        "hp": {
          "value": 36,
          "max": 36,
          "temp": 0,
          "pct": 100,
          "bars": 12,
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
          "total": 5
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
        "size": "Tiny",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Tiny Champion Pit Belt, Frenzied Whisker Set",
        "xp": 550,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "15+F"
      },
      "details": {
        "level": 11,
        "classification": "Neighborhood Boss",
        "creatureType": "Beastly",
        "floor": "Floor 2",
        "location": "Kobold Arena Fighting Pit",
        "description": "Undisputed champion pit fighter of the kobold arenas, a lightning-fast rodent filled with ancestral hatred for mankind and relentless combat drive.",
        "aiDescription": "The champion pit fighter of the training grounds, Ralph is filled with rage. When his kin carried the Black Death across the world in the 1300s, they claimed over 200 million human lives. Ralph is here to finish the job. Gone are the days starving in a dirty neglected cage. He may not look like much, but man, is that little rodent fast.",
        "notes": "Cuteness Appeal—Crawlers make Int/Cha Stat Check vs 14+F at start or attack with Disadvantage round 1. Frenzied—Step distance 20ft. Hatred of Humans—Prioritizes humans (+5 damage bonus). Still a Tiny Gerbil—If eaten by Dingo, takes 2 actions to kill and escape.",
        "special": "Cuteness Appeal—Crawlers make Int/Cha Stat Check vs 14+F at start or attack with Disadvantage round 1. Frenzied—Step distance 20ft. Hatred of Humans—Prioritizes humans (+5 damage bonus). Still a Tiny Gerbil—If eaten by Dingo, takes 2 actions to kill and escape.",
        "source": "Page 148, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006401",
        "name": "Ravening Jaw",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Rat Bite Fever Debuff (1d6+F Poison/round)."
        }
      },
      {
        "_id": "dccatkmob0006402",
        "name": "Scratch",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "dex",
          "damageType": "Slashing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0006403",
        "name": "Squeal",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "cha",
          "damageType": "Sonic",
          "effects": "60ft range. On Evade Major Fail or worse, crawler gains Staggered Debuff."
        }
      },
      {
        "_id": "dcclootmob006401",
        "name": "Tiny Champion Pit Belt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Gold-plated gerbil-sized championship belt.",
          "description": "Gold-plated gerbil-sized championship belt."
        }
      },
      {
        "_id": "dcclootmob006402",
        "name": "Frenzied Whisker Set",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Vibrating sensory whiskers granting speed bonuses.",
          "description": "Vibrating sensory whiskers granting speed bonuses."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000065",
    "name": "Rat Janitor",
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
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
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
          "value": 1,
          "max": 1,
          "temp": 0,
          "pct": 100,
          "bars": 1,
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
          "total": 1
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
        "size": "Tiny",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Janitor Rat Pelt",
        "xp": 50,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 1,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Floor 1 Corridors",
        "description": "Official First Floor Janitor Mob responsible for cleaning messes and eating corpses left behind by violent crawler encounters.",
        "aiDescription": "Floor 1 Janitor Mob—This Mob is responsible for cleaning messes on floor 1 and prioritizes eating corpses. It attacks crawlers when provoked, or when no other food options are nearby.",
        "notes": "Janitor Mob—Prioritizes devouring corpses. Attacks crawlers when provoked or hungry.",
        "special": "Janitor Mob—Prioritizes devouring corpses. Attacks crawlers when provoked or hungry.",
        "source": "Page 138, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006501",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff."
        }
      },
      {
        "_id": "dcclootmob006501",
        "name": "Janitor Rat Pelt",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Scruffy rodent fur smelling faintly of floor wax.",
          "description": "Scruffy rodent fur smelling faintly of floor wax."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000066",
    "name": "Rayzer",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
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
        "treasure": "Rayzer Eyestalk, Barbed Rayzer Barb",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Bogbricks Neighborhood",
        "description": "Air-swimming stingray creature with protruding eyestalks that shoots force missiles and stings with disorienting toxins from dungeon ceilings.",
        "aiDescription": "The Rayzer is a deceptively cunning ambush predator. Sure, they can fly and shoot magic and even blend in with their surroundings, but that’s not what makes them so successful. Their true power lies in their patience and their intelligence.",
        "notes": "Wall Cling—Can land vertically or upside down. Flight—Moves through air as ground and hovers in place.",
        "special": "Wall Cling—Can land vertically or upside down. Flight—Moves through air as ground and hovers in place.",
        "source": "Page 19, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006601",
        "name": "Magic Missile Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "con",
          "damageType": "Force",
          "effects": "Line of Sight range."
        }
      },
      {
        "_id": "dccatkmob0006602",
        "name": "Tail Sting",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Poison",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff."
        }
      },
      {
        "_id": "dcclootmob006601",
        "name": "Rayzer Eyestalk",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Flexible optic stalk with innate force magic.",
          "description": "Flexible optic stalk with innate force magic."
        }
      },
      {
        "_id": "dcclootmob006602",
        "name": "Barbed Rayzer Barb",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Poison-dripping tail spine.",
          "description": "Poison-dripping tail spine."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000067",
    "name": "Riff Roughers",
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
        "treasure": "Pirate Cutlass, 1800s Ruffled Collar",
        "xp": 200,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Animal",
        "floor": "Floor 1",
        "location": "Bogbricks Cypress Halls",
        "description": "Four-foot-tall coatimundi-headed swashbucklers dressed in 1800s pirate garb, brandishing cutlasses with ferocious precision and noxious breath.",
        "aiDescription": "If you’ve ever wanted to get into a swordfight with a pirate, well… here’s your chance, Orlando Bloom! Some think the Riff Roughers are just older Scat Thugs while others think they’re a separate species entirely. One thing is sure: That debate is for Nerds!",
        "notes": "Swordsmen—Expert melee combatants.",
        "special": "Swordsmen—Expert melee combatants.",
        "source": "Page 19, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006701",
        "name": "Breath",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "con",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "con",
          "damageType": "Acid",
          "effects": "10ft Cone. On Evade Major Fail or worse, crawler gains Poisoned Debuff."
        }
      },
      {
        "_id": "dccatkmob0006702",
        "name": "Cutlass",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Slashing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob006701",
        "name": "Pirate Cutlass",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Curved naval sword.",
          "description": "Curved naval sword."
        }
      },
      {
        "_id": "dcclootmob006702",
        "name": "1800s Ruffled Collar",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Antique pirate neckwear.",
          "description": "Antique pirate neckwear."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000068",
    "name": "Rot Sticker",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "int": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
        },
        "con": {
          "value": 1,
          "unenhanced": 1,
          "mod": 1
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
          "value": 1,
          "max": 1,
          "temp": 0,
          "pct": 100,
          "bars": 1,
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
        "treasure": "Sticky Gland",
        "xp": 50,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 1,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Floor 1 Corridors",
        "description": "Tiny parasitic creatures that stick tenaciously to crawlers and vertical walls, detonating in explosive suicide attacks when attached.",
        "aiDescription": "Small, sticky, and suicidal. They jump onto you like burrs on a wool sweater, and then they blow themselves to smithereens.",
        "notes": "Overly-Attached—Stick attaches to target sharing space; can only Explode while attached (slaying itself). Sticky—Sticks to walls and ceilings.",
        "special": "Overly-Attached—Stick attaches to target sharing space; can only Explode while attached (slaying itself). Sticky—Sticks to walls and ceilings.",
        "source": "Page 138, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006801",
        "name": "Stick",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "dex",
          "damageType": "Physical",
          "effects": "5ft range. On Evade Fail, attaches to crawler."
        }
      },
      {
        "_id": "dccatkmob0006802",
        "name": "Explode",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "con",
          "damageType": "Bludgeoning",
          "effects": "0ft range (while attached). On Evade Major Fail, crawler gains Take Down Debuff."
        }
      },
      {
        "_id": "dcclootmob006801",
        "name": "Sticky Gland",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Natural adhesive sac.",
          "description": "Natural adhesive sac."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000069",
    "name": "Scat Thug",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "value": 1,
          "unenhanced": 1,
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
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Scat Thug Spear, Pellet Pouch",
        "xp": 150,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Bogbricks Gaslamp District",
        "description": "Three-foot-tall raccoon-headed creatures that excel in trap-making, pickpocketing, and hurling foul-smelling scat pellets from shadows.",
        "aiDescription": "Don’t let their adorable little faces and sad beady eyes fool you—these scrappy little guys rob and ambush crawlers whenever an opportunity presents itself. And if they’re hungry, all bets are off.",
        "notes": "Thief—Adjacent crawlers must make Int check or lose item. Trapper—Can activate one trap within 60ft alongside Action.",
        "special": "Thief—Adjacent crawlers must make Int check or lose item. Trapper—Can activate one trap within 60ft alongside Action.",
        "source": "Page 20, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0006901",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "10ft range."
        }
      },
      {
        "_id": "dccatkmob0006902",
        "name": "Scat Pellet",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains Stank Rot Debuff."
        }
      },
      {
        "_id": "dcclootmob006901",
        "name": "Scat Thug Spear",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Light wooden spear.",
          "description": "Light wooden spear."
        }
      },
      {
        "_id": "dcclootmob006902",
        "name": "Pellet Pouch",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Pouch of noxious projectile pellets.",
          "description": "Pouch of noxious projectile pellets."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000070",
    "name": "Scatterer",
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
          "value": 4,
          "unenhanced": 4,
          "mod": 2
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
          "value": 2,
          "max": 2,
          "temp": 0,
          "pct": 100,
          "bars": 1,
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
          "total": 1
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Scatterer Chitin Shard",
        "xp": 50,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 1,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Floor 1 Walls and Ceilings",
        "description": "Skittering cockroach-like insectoids crawling along ceilings and walls in search of waste, spitting foul toxic bile at trespassers.",
        "aiDescription": "Standard dungeon creepy-crawly. Tough shell, nasty bite, and an unfortunate habit of spitting taint right down your collar.",
        "notes": "Wall Walker—Scatterers can move along vertical surfaces and upside down on ceilings as though on the ground.",
        "special": "Wall Walker—Scatterers can move along vertical surfaces and upside down on ceilings as though on the ground.",
        "source": "Page 138, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007001",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0007002",
        "name": "Spit",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "con",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "con",
          "damageType": "Poison",
          "effects": "30ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff."
        }
      },
      {
        "_id": "dcclootmob007001",
        "name": "Scatterer Chitin Shard",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Shiny brown exoskeleton plate.",
          "description": "Shiny brown exoskeleton plate."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000071",
    "name": "Scatterer Brood Guardian",
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Guardian Brood Plate",
        "xp": 200,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Scatterer Brood Chambers",
        "description": "Large, heavily armored guardian scatterer that protects the egg clutches with reckless ferocity, shielding adjacent swarm-mates.",
        "aiDescription": "When scatterers feel their nests are threatened, these armored brutes step forward with snapping jaws and a protective frenzy that covers the whole swarm.",
        "notes": "Guardian—Other Scatterers adjacent to a brood guardian gain +3 bonus to Evade. Wall Walker. Riled Up—Adds Stat Mod twice to damage in first round.",
        "special": "Guardian—Other Scatterers adjacent to a brood guardian gain +3 bonus to Evade. Wall Walker. Riled Up—Adds Stat Mod twice to damage in first round.",
        "source": "Page 139, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007101",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff."
        }
      },
      {
        "_id": "dcclootmob007101",
        "name": "Guardian Brood Plate",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Reinforced chitinous armor segment.",
          "description": "Reinforced chitinous armor segment."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000072",
    "name": "Screye Drone",
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
          "move": 10,
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
        "treasure": "Screye Lens Assembly, Preserved Camera Eye",
        "xp": 350,
        "surpriseDifficulty": "16+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Organic Machinery",
        "floor": "Floor 1",
        "location": "Bugaboo Surveillance Corridors",
        "description": "Wobbling airborne surveillance unit assembled from harvested goblin eyes, scrap lenses, and clockwork, relaying feeds back to Stiggy's central hub.",
        "aiDescription": "A terrifying blend of optometry and artisanal crafts, these guys are awfully nosy for something made out of eyeballs and pipe cleaners. Screye Drones are the evolved form of the doorbell cameras you see all over the place. They spy on you, scream for help, and carry messages from their overlord.",
        "notes": "Alarm—Emits high-pitched chimes summoning nearby Bugaboos. The Eyes Have It—Covered with eyes, very hard to surprise. Hover.",
        "special": "Alarm—Emits high-pitched chimes summoning nearby Bugaboos. The Eyes Have It—Covered with eyes, very hard to surprise. Hover.",
        "source": "Page 129, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007201",
        "name": "Weeping Eye Discharge",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "0",
          "damageStat": "dex",
          "damageType": "Physical",
          "effects": "25ft range. Hits apply Take Down and Fatigued Debuffs."
        }
      },
      {
        "_id": "dcclootmob007201",
        "name": "Screye Lens Assembly",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Optical sensory lens.",
          "description": "Optical sensory lens."
        }
      },
      {
        "_id": "dcclootmob007202",
        "name": "Preserved Camera Eye",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Intact harvested eyeball.",
          "description": "Intact harvested eyeball."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000073",
    "name": "Shambling Acid Impaler",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 2,
    "tokenHeight": 2,
    "system": {
      "abilities": {
        "str": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "cha": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "total": 4
        },
        "dr": {
          "armor": 2,
          "items": 0,
          "buffs": 0,
          "total": 2
        },
        "speed": {
          "move": 10,
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
        "treasure": "Corrosive Acid Gland, Impaler Bone Barb",
        "xp": 300,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Zombie",
        "floor": "Floor 1",
        "location": "Arcadia Outskirts",
        "description": "A bloated, decomposing zombie studded with acidic bone spikes, projecting caustic darts across long distances and lashing out with a prehensile tongue.",
        "aiDescription": "Decaying undead monstrosity that launches corrosive darts and whips targets with a dissolution-inducing tongue.",
        "notes": "Inflicts severe acid damage and ongoing Dissolving Debuffs with each attack.",
        "special": "Inflicts severe acid damage and ongoing Dissolving Debuffs with each attack.",
        "source": "Page 86, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007301",
        "name": "Acid Dart",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Acid",
          "effects": "40ft range. On Evade Major Fail or worse, crawler gains Queasy and Dissolving Debuffs (1d6+F Acid/round)."
        }
      },
      {
        "_id": "dccatkmob0007302",
        "name": "Tongue Lash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "10ft range. On Evade Major Fail or worse, crawler gains Dissolving Debuff."
        }
      },
      {
        "_id": "dcclootmob007301",
        "name": "Corrosive Acid Gland",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Vial of concentrated zombie acid.",
          "description": "Vial of concentrated zombie acid."
        }
      },
      {
        "_id": "dcclootmob007302",
        "name": "Impaler Bone Barb",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Dense barbed bone spike.",
          "description": "Dense barbed bone spike."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000074",
    "name": "Slimy Croakers",
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
          "value": 5,
          "unenhanced": 5,
          "mod": 2
        },
        "cha": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
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
        "size": "Small",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Spider-Silk Robes (Torn), Paralyzing Slime Phial",
        "xp": 150,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 3,
        "classification": "Mob",
        "creatureType": "Beastly",
        "floor": "Floor 1",
        "location": "Webbinghoods Spiders' Lairs",
        "description": "Anthropomorphic frogs wearing spider-silk robes that serve as cleaners, gardeners, and guardians for Giant Spider nests.",
        "aiDescription": "Mobs keeping other Mobs as pets? It’s not just some GM’s twisted power fantasy—turns out it’s true and at least vaguely canon! While the Giant Spiders are out hunting, making websites, or doing other spider-stuff, these little amphibious guys keep their homes clean and free of pests.",
        "notes": "Slippery Slime—Leaves puddle of slime on attack and upon death (Dex check or Take Down). Egg Protector—Croaks summon all Croakers within 60ft if eggs damaged.",
        "special": "Slippery Slime—Leaves puddle of slime on attack and upon death (Dex check or Take Down). Egg Protector—Croaks summon all Croakers within 60ft if eggs damaged.",
        "source": "Page 52, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007401",
        "name": "Tongue Whip",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Bludgeoning",
          "effects": "10ft range. On Evade Major Fail or worse, crawler gains Paralyzed Debuff."
        }
      },
      {
        "_id": "dccatkmob0007402",
        "name": "Croak",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "con",
          "damageType": "Sonic",
          "effects": "20ft Cone + 10ft Splash."
        }
      },
      {
        "_id": "dcclootmob007401",
        "name": "Spider-Silk Robes (Torn)",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Delicate woven spider silk garment.",
          "description": "Delicate woven spider silk garment."
        }
      },
      {
        "_id": "dcclootmob007402",
        "name": "Paralyzing Slime Phial",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Gooey frog secretion causing numbness.",
          "description": "Gooey frog secretion causing numbness."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000075",
    "name": "Spit—Goblin Survivor Who Lives in the Now",
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
          "value": 4,
          "unenhanced": 4,
          "mod": 2
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
          "value": 1,
          "unenhanced": 1,
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
        "treasure": "Spit's Lucky Spear, Smooth Skipping Rock",
        "xp": 300,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Unique Humanoid",
        "floor": "Floor 1",
        "location": "Passive (Aggressive) Perception Survivor Camp",
        "description": "Twin brother of Spat. Spit speaks strictly in the present tense, remaining stubbornly optimistic and focused exclusively on what is happening right now.",
        "aiDescription": "Spit is a lovable little Goblin who just narrowly avoided having his eyes plucked out of his head thanks to your brave efforts. He and his twin brother, Spat, make quite the pair, with Spit being the more level-headed and optimistic of the two. Weirdly, he only speaks in the present tense… probably got dropped on his head as a baby or something.",
        "notes": "Speaks only in the present tense. Helps crawlers track Bugaboo patrol routes.",
        "special": "Speaks only in the present tense. Helps crawlers track Bugaboo patrol routes.",
        "source": "Page 130, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007501",
        "name": "Rock",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft range."
        }
      },
      {
        "_id": "dccatkmob0007502",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob007501",
        "name": "Spit's Lucky Spear",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Reliable sharpened goblin spear.",
          "description": "Reliable sharpened goblin spear."
        }
      },
      {
        "_id": "dcclootmob007502",
        "name": "Smooth Skipping Rock",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 3,
          "notes": "Perfect throwing stones.",
          "description": "Perfect throwing stones."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000076",
    "name": "Spit—Goblin Who Just Can’t Seem to Let Go of the Past",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 1,
          "unenhanced": 1,
          "mod": 1
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
        "treasure": "Spat's Vengeance Spear, Grudge Stone",
        "xp": 350,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Unique Humanoid",
        "floor": "Floor 1",
        "location": "Passive (Aggressive) Perception Survivor Camp",
        "description": "Twin brother of Spit (named Spat in story text). He speaks strictly in the past tense, brooding over past goblin traditions and nursing deep vengeance against Stiggy.",
        "aiDescription": "Spat was a cheerful Goblin scout who took glee in doing the things Goblin Mobs do in the dungeon. He used to pillage, terrorize crawlers, raid, and do all the gobliny sorts of things he was supposed to. That all changed when the Bugaboos descended on his camp to harvest his family’s eyes.",
        "notes": "Speaks only in the past tense. Listed as Spit in TOC and Spat in chapter text.",
        "special": "Speaks only in the past tense. Listed as Spit in TOC and Spat in chapter text.",
        "source": "Page 131, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007601",
        "name": "Rock",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft range."
        }
      },
      {
        "_id": "dccatkmob0007602",
        "name": "Spear",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dcclootmob007601",
        "name": "Spat's Vengeance Spear",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Blood-notched spear dedicated to fallen kin.",
          "description": "Blood-notched spear dedicated to fallen kin."
        }
      },
      {
        "_id": "dcclootmob007602",
        "name": "Grudge Stone",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Carved stone recording Bugaboo crimes.",
          "description": "Carved stone recording Bugaboo crimes."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000077",
    "name": "Sprites",
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
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "cha": {
          "value": 7,
          "unenhanced": 7,
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
        "size": "Tiny",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Tiny Iron Pitchfork, Gossamer Sprite Dust",
        "xp": 350,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 7,
        "classification": "Mob",
        "creatureType": "Humanoid, Winged Fairy",
        "floor": "Floor 1",
        "location": "Arcadia",
        "description": "Tiny, generic fairy humanoids planted by the System AI across Arcadia. Mild and repetitive at first, they form terrifying torch-and-pitchfork mobs when angered.",
        "aiDescription": "Gotta admit: These guys are pretty mundane until you get ’em all riled up. They’re single-minded, but that’s just how they’re created. Don’t count them all out, though! For every 'Did you hear that noise from across the floor?' Sprite you find, there’s one that harbors a clue to a rare treasure.",
        "notes": "Communicate sub-harmonically. Can swarm in large groups with torches and pitchforks.",
        "special": "Communicate sub-harmonically. Can swarm in large groups with torches and pitchforks.",
        "source": "Page 86, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007701",
        "name": "Pitchfork",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0007702",
        "name": "Thrown Rock",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft range."
        }
      },
      {
        "_id": "dcclootmob007701",
        "name": "Tiny Iron Pitchfork",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Fairy-sized but remarkably sharp weapon.",
          "description": "Fairy-sized but remarkably sharp weapon."
        }
      },
      {
        "_id": "dcclootmob007702",
        "name": "Gossamer Sprite Dust",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Glittering fairy dust.",
          "description": "Glittering fairy dust."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000078",
    "name": "Stiggy, Dungeon Surveillance Architect",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 50,
          "unenhanced": 50,
          "mod": 6
        },
        "con": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        },
        "dex": {
          "value": 10,
          "unenhanced": 10,
          "mod": 4
        },
        "cha": {
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 30,
          "max": 30,
          "temp": 0,
          "pct": 100,
          "bars": 10,
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
          "total": 4
        },
        "dr": {
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
        },
        "speed": {
          "move": 10,
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
        "treasure": "Screye Camera Monitor Slab, Stiggy's Cybernetic Visor",
        "xp": 700,
        "surpriseDifficulty": "22+F",
        "evadeDifficulty": "14+F"
      },
      "details": {
        "level": 14,
        "classification": "Borough Boss",
        "creatureType": "Cybernetic Humanoid",
        "floor": "Floor 1",
        "location": "Central Surveillance Hub",
        "description": "Suspended aloft by an electrified hydraulic armature in a circular control room plastered with monitors, Stiggy watches every corner of the dungeon through stolen eyes.",
        "aiDescription": "Stiggy—Dungeon Surveillance Architect. Level 14 Borough Boss! Stiggy is what happens when a Peeping Tom gets access to Big Brother techno-sorcery and an unlimited supply of potential muses. Now Stiggy installs eyes in walls to hoard information and peek at your naughty bits. Smile for the camera, crawlers. Stiggy has his eye on you.",
        "notes": "Hands Off—One attack per round; opens trapdoors and rotates floor. Hydraulic Arm—DR 5, 8 bars of 3 HP (smashing kills Stiggy). Electrified Arm—1:1 damage reflection buff. Screens Everywhere—High surprise DC.",
        "special": "Hands Off—One attack per round; opens trapdoors and rotates floor. Hydraulic Arm—DR 5, 8 bars of 3 HP (smashing kills Stiggy). Electrified Arm—1:1 damage reflection buff. Screens Everywhere—High surprise DC.",
        "source": "Page 135, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007801",
        "name": "Probe",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "3d6",
          "damageStat": "int",
          "damageType": "Psychic",
          "effects": "10ft range. Cha Stat Check to avoid (no Evade) or live out past traumas on screens."
        }
      },
      {
        "_id": "dccatkmob0007802",
        "name": "Camera Flash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "dex",
          "damageType": "Electric",
          "effects": "30ft range. Disadvantage to Evade; on hit gains Blinded Debuff."
        }
      },
      {
        "_id": "dcclootmob007801",
        "name": "Screye Camera Monitor Slab",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Administrative monitor stone accessing surveillance network.",
          "description": "Administrative monitor stone accessing surveillance network."
        }
      },
      {
        "_id": "dcclootmob007802",
        "name": "Stiggy's Cybernetic Visor",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Multi-optic HUD visor with true-sight feeds.",
          "description": "Multi-optic HUD visor with true-sight feeds."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000079",
    "name": "Trash Princess",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "value": 7,
          "unenhanced": 7,
          "mod": 3
        }
      },
      "attributes": {
        "hp": {
          "value": 8,
          "max": 8,
          "temp": 0,
          "pct": 100,
          "bars": 4,
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
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Princess Tiara (Recycled), Stank Rot Perfume Bottle",
        "xp": 200,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 1",
        "location": "Bogbricks Gaslamp District",
        "description": "Female Scat Thugs who revere the Hide-Hitter Crib Daddy, fighting with weaponized trash, concussive thunderclaps, and bizarre pheromone seduction.",
        "aiDescription": "Female Scat Thugs, known as Trash Princesses, outnumber the males in this Neighborhood by a factor of 15 to 1. Despite their propensity for thievery, both genders smell as awful as the scat they live in.",
        "notes": "Collateral Trashing—If Area attacks hit 3+ entities (allies or enemies), deals +1d6 extra damage to each target.",
        "special": "Collateral Trashing—If Area attacks hit 3+ entities (allies or enemies), deals +1d6 extra damage to each target.",
        "source": "Page 21, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0007901",
        "name": "Eat Trash and Die",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Poison",
          "effects": "30ft range, 10ft Blast radius. On Evade Major Fail, crawler gains Stank Rot Debuff."
        }
      },
      {
        "_id": "dccatkmob0007902",
        "name": "Trash Thunderclap",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Force",
          "effects": "15ft Cone. On Evade Major Fail, crawler is pushed back 10ft."
        }
      },
      {
        "_id": "dccatkmob0007903",
        "name": "Seduction",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "cha",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "cha",
          "damageType": "Psychic",
          "effects": "15ft Cone. Free Int Stat Check vs 14 or gain Seduced Debuff."
        }
      },
      {
        "_id": "dcclootmob007901",
        "name": "Princess Tiara (Recycled)",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Bent aluminum tiara decorated with bottle caps.",
          "description": "Bent aluminum tiara decorated with bottle caps."
        }
      },
      {
        "_id": "dcclootmob007902",
        "name": "Stank Rot Perfume Bottle",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Pungent raccoon musk spray.",
          "description": "Pungent raccoon musk spray."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000080",
    "name": "Troglodyte Basher",
    "type": "mob",
    "img": "icons/svg/skull.svg",
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
          "value": 7,
          "unenhanced": 7,
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
        "size": "Medium",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Troglodyte Basher Club, Numbing Troglodyte Slime",
        "xp": 300,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 6,
        "classification": "Mob",
        "creatureType": "Humanoid",
        "floor": "Floor 2",
        "location": "Mind Maze concrete tunnels",
        "description": "Lizard-faced humanoids coated in thick, foul-smelling protective slime, bashing targets with heavy clubs and spitting caustic venom.",
        "aiDescription": "Slick slapping noises echo against the walls and floor of this street, the sound of slightly-wet, slightly tacky flesh on concrete. Slime-coated troglodytes pause in their scavenging as they smell you approaching, turning toward you with gaping maws, drool dripping from their teeth.",
        "notes": "Slimed!—When adjacent crawler rolls Amazing Success or better with an attack, they get Queasy Debuff from splashing slime.",
        "special": "Slimed!—When adjacent crawler rolls Amazing Success or better with an attack, they get Queasy Debuff from splashing slime.",
        "source": "Page 120, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0008001",
        "name": "Bash",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "2d8",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "5ft range."
        }
      },
      {
        "_id": "dccatkmob0008002",
        "name": "Venom Spit",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "con",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "con",
          "damageType": "Poison",
          "effects": "20ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff."
        }
      },
      {
        "_id": "dcclootmob008001",
        "name": "Troglodyte Basher Club",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Slime-coated heavy war club.",
          "description": "Slime-coated heavy war club."
        }
      },
      {
        "_id": "dcclootmob008002",
        "name": "Numbing Troglodyte Slime",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Secretion used in crafting salves.",
          "description": "Secretion used in crafting salves."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000081",
    "name": "Troglodyte Pygmy",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 1,
    "tokenHeight": 1,
    "system": {
      "abilities": {
        "str": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "int": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
        },
        "con": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
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
          "value": 2,
          "max": 2,
          "temp": 0,
          "pct": 100,
          "bars": 2,
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
          "total": 2
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
        "size": "Petite",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Pygmy Troglodyte Tooth",
        "xp": 100,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Mutated",
        "floor": "Floor 2",
        "location": "Troglodyte Burrows",
        "description": "Diminutive, lightning-fast troglodyte pack hunters that dart in to inflict venomous bites before immediately stepping away out of reach.",
        "aiDescription": "Pygmy troglodytes don't try to bash your head in—they dart between your legs, deliver a quick venomous nip to your achilles, and skip back before you can swing.",
        "notes": "Dine and Dash—Pygmies Move in and attack their prey, then immediately Step Away.",
        "special": "Dine and Dash—Pygmies Move in and attack their prey, then immediately Step Away.",
        "source": "Page 142, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0008101",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "dex",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff."
        }
      },
      {
        "_id": "dcclootmob008101",
        "name": "Pygmy Troglodyte Tooth",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Sharp venom-grooved tooth.",
          "description": "Sharp venom-grooved tooth."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000082",
    "name": "Troglodyte Virtuoso",
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
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        }
      },
      "attributes": {
        "hp": {
          "value": 8,
          "max": 8,
          "temp": 0,
          "pct": 100,
          "bars": 4,
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
          "armor": 1,
          "items": 0,
          "buffs": 0,
          "total": 1
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
        "treasure": "Elastic Troglodyte Tongue, Virtuoso Slime Vial",
        "xp": 200,
        "surpriseDifficulty": "12+F",
        "evadeDifficulty": "13+F"
      },
      "details": {
        "level": 4,
        "classification": "Mob",
        "creatureType": "Mutated",
        "floor": "Floor 2",
        "location": "Mind Maze Rafters",
        "description": "Slime-covered mutant troglodyte equipped with a fifteen-foot prehensile tongue that whips through the air to grapple and drag distant crawlers.",
        "aiDescription": "You think you're safe at range until a glistening fifteen-foot tongue shoots around the corner and wraps around your neck like a greasy scarf.",
        "notes": "Got Your Tongue—Target can attempt Wrasslin' attack to grab tongue as Interrupt. Tongue of War—Pulling contest dealing 1d4+F per 5ft moved.",
        "special": "Got Your Tongue—Target can attempt Wrasslin' attack to grab tongue as Interrupt. Tongue of War—Pulling contest dealing 1d4+F per 5ft moved.",
        "source": "Page 142, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0008201",
        "name": "Tongue Whip",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "15ft range. On Evade Major Fail or worse, crawler gains Held Debuff."
        }
      },
      {
        "_id": "dccatkmob0008202",
        "name": "Bite",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "dex",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff."
        }
      },
      {
        "_id": "dcclootmob008201",
        "name": "Elastic Troglodyte Tongue",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Tough stretchy muscular organ.",
          "description": "Tough stretchy muscular organ."
        }
      },
      {
        "_id": "dcclootmob008202",
        "name": "Virtuoso Slime Vial",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Prehensile grip lubricant.",
          "description": "Prehensile grip lubricant."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000083",
    "name": "Vine Creeper",
    "type": "mob",
    "img": "icons/svg/skull.svg",
    "tokenWidth": 3,
    "tokenHeight": 3,
    "system": {
      "abilities": {
        "str": {
          "value": 3,
          "unenhanced": 3,
          "mod": 2
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
          "move": 15,
          "step": 10
        },
        "aiFavor": 0,
        "size": "Huge",
        "debuffs": "",
        "externalBuffs": {
          "buff1": "",
          "buff2": "",
          "buff3": ""
        },
        "treasure": "Creeper Constricting Vine, Enzyme Pod Shell",
        "xp": 100,
        "surpriseDifficulty": "11+F",
        "evadeDifficulty": "12+F"
      },
      "details": {
        "level": 2,
        "classification": "Mob",
        "creatureType": "Plant",
        "floor": "Floor 1",
        "location": "Webbinghoods Overgrowth",
        "description": "Gigantic eggplant-shaped leafy pods that sleep deep inside ruined houses, sending out long sensitive vines that snatch unsuspecting prey and drag them into digestive pods.",
        "aiDescription": "Remember the end of Little Shop of Horrors when Audrey II breaks out of its flowerpot and shoots a bunch of singing vines in every direction while trying to eat Rick Moranis? Take away the singing and Audrey II’s huge head and replace it with a giant transforming eggplant, and it’ll be pretty much identical to a Vine Creeper.",
        "notes": "Pod ambush predator. Dragged victims are digested by acids inside pod.",
        "special": "Pod ambush predator. Dragged victims are digested by acids inside pod.",
        "source": "Page 50, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0008301",
        "name": "Fang",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d6",
          "damageStat": "str",
          "damageType": "Piercing",
          "effects": "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff."
        }
      },
      {
        "_id": "dccatkmob0008302",
        "name": "Vine",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "str",
          "toHitRank": 0,
          "damageDice": "1d4",
          "damageStat": "str",
          "damageType": "Bludgeoning",
          "effects": "30ft range. Hit crawler gains Held Debuff and is pulled closer (broken on Creeper death)."
        }
      },
      {
        "_id": "dcclootmob008301",
        "name": "Creeper Constricting Vine",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 2,
          "notes": "Tough flexible plant tendril.",
          "description": "Tough flexible plant tendril."
        }
      },
      {
        "_id": "dcclootmob008302",
        "name": "Enzyme Pod Shell",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Fibrous pod shell resistant to digestive acids.",
          "description": "Fibrous pod shell resistant to digestive acids."
        }
      }
    ]
  },
  {
    "_id": "dccmob0000000084",
    "name": "Wise-Guyy",
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
          "value": 4,
          "unenhanced": 4,
          "mod": 2
        },
        "dex": {
          "value": 2,
          "unenhanced": 2,
          "mod": 1
        },
        "cha": {
          "value": 5,
          "unenhanced": 5,
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
          "armor": 3,
          "items": 0,
          "buffs": 0,
          "total": 3
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
        "treasure": "Wise-Guy's Arcane Ring, Crawler Gold",
        "xp": 250,
        "surpriseDifficulty": "13+F",
        "evadeDifficulty": "11+F"
      },
      "details": {
        "level": 5,
        "classification": "Crawler",
        "creatureType": "Human",
        "floor": "Floor 1",
        "location": "Floor 1 Saferoom Outskirts",
        "description": "Arrogant rival crawler who fancies himself an arcane mastermind, flinging magic missiles while sneering at newer adventurers.",
        "aiDescription": "They think they’re hot shit in a champagne glass. Arrogant rival crawler whose ego far exceeds his hit bar count.",
        "notes": "Rival Crawler—Smart-ass NPC mage.",
        "special": "Rival Crawler—Smart-ass NPC mage.",
        "source": "Page 136, Game Master's Campaign Toolkit"
      }
    },
    "items": [
      {
        "_id": "dccatkmob0008401",
        "name": "Magic Missile Spell",
        "type": "attack",
        "img": "icons/svg/sword.svg",
        "system": {
          "toHitStat": "int",
          "toHitRank": 0,
          "damageDice": "2d4",
          "damageStat": "int",
          "damageType": "Force",
          "effects": "Line of Sight range."
        }
      },
      {
        "_id": "dcclootmob008401",
        "name": "Wise-Guy's Arcane Ring",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 1,
          "notes": "Silver ring inscribed with rudimentary spell formulas.",
          "description": "Silver ring inscribed with rudimentary spell formulas."
        }
      },
      {
        "_id": "dcclootmob008402",
        "name": "Crawler Gold",
        "type": "loot",
        "img": "icons/svg/chest.svg",
        "system": {
          "quantity": 25,
          "notes": "Stolen or won dungeon coins.",
          "description": "Stolen or won dungeon coins."
        }
      }
    ]
  }
];
