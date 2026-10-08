/**
 * Dungeon Crawler Carl RPG - Official Classes Dataset
 * Extracted from Chapter 3: Character Creation (pp. 144-165).
 */

export const DCC_CLASSES = [
  {
    "_id": "dcccls0000000001",
    "name": "Boring Ol’ Arcanist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist",
      "prerequisites": "",
      "description": "<p>You decided long ago that you wanted to craft powerful magical items, but really never settled on a specialty. You’re pretty good in some areas and just average in others. At higher Levels, you may gain some additional expertise, but for the most part, you are a generalist. Still, when someone needs that special arcane item to defeat that big Boss, you might just be the Arcanist for the job. And if not, well, you’re probably the only Arcanist they can find, so you’ll make do.</p>",
      "abilities": "<ul><li>+3 Intelligence</li><li>-2 Dexterity</li><li>+5 Arcane Skill</li><li>+3 Salv age Skill</li><li>+2 in a crafting Skill of your choice</li><li>+1 in a crafting Skill of your choice</li><li>Tier 1 Arc anist table</li><li>Arcane and one cr afting Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Intelligence",
        "+2 Dexterity",
        "+5 Arcane Skill",
        "+3 Salv age Skill",
        "+2 in a crafting Skill of your choice",
        "+1 in a crafting Skill of your choice",
        "Tier 1 Arc anist table",
        "Arcane and one cr afting Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 0,
        "int": 3,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Arcane",
          "rank": 5
        },
        {
          "name": "Salvage",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "boring-ol-arcanist",
      "archetypes": [
        "archetype.arcanist"
      ],
      "tags": [
        "archetype.arcanist",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": 0,
            "int": 3,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Arcane",
          "rank": 5,
          "ref": "id.skill.arcane"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Salvage",
          "rank": 3,
          "ref": "id.skill.salvage"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "crafting",
          "filter": {
            "all": [
              "kind.skill",
              "skillGroup.crafting"
            ]
          },
          "label": "Crafting Skill 1 (Rank 2)"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 1,
          "category": "crafting",
          "filter": {
            "all": [
              "kind.skill",
              "skillGroup.crafting"
            ]
          },
          "label": "Crafting Skill 2 (Rank 1)"
        },
        {
          "kind": "perk",
          "name": "+3 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+5 Arcane Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Salv age Skill"
        },
        {
          "kind": "perk",
          "name": "+2 in a crafting Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+1 in a crafting Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "Tier 1 Arc anist table"
        },
        {
          "kind": "perk",
          "name": "Arcane and one cr afting Skill can be raised to Rank 20"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000002",
    "name": "Alchemist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist",
      "prerequisites": "",
      "description": "<p>Crafting arcane liquids, now that’s a fun thing! You can make all kinds of potions for all sorts of occasions. Plus, you’ve messed up enough potions to know how to make some pretty cool poisons, ranging from merely annoying to extremely deadly. Luckily, you’ve also learned, often the hard way, how to negate these poisons. Well, mostly. Don’t drink that gray one, just in case.</p>",
      "abilities": "<ul><li>+3 Constitution and Intelligence</li><li>+5 Alchemy Skill</li><li>+3 Infusion Skill</li><li>Immunity to Poison</li><li>Tier 1 Alchem y table</li><li>At the end of each floor, add 1 to your Skill Advancement Checks for Alchemy and Infusion</li><li>Alchemy Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Constitution and Intelligence",
        "+5 Alchemy Skill",
        "+3 Infusion Skill",
        "Immunity to Poison",
        "Tier 1 Alchem y table",
        "At the end of each floor, add 1 to your Skill Advancement Checks for Alchemy and Infusion",
        "Alchemy Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 3,
        "int": 3,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Alchemy",
          "rank": 5
        },
        {
          "name": "Infusion",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "alchemist",
      "archetypes": [
        "archetype.arcanist"
      ],
      "tags": [
        "archetype.arcanist",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 3,
            "int": 3,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Alchemy",
          "rank": 5,
          "ref": "id.skill.alchemy"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Infusion",
          "rank": 3,
          "ref": "id.skill.infusion"
        },
        {
          "kind": "perk",
          "name": "+3 Constitution and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+5 Alchemy Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Infusion Skill"
        },
        {
          "kind": "perk",
          "name": "Immunity to Poison"
        },
        {
          "kind": "perk",
          "name": "Tier 1 Alchem y table"
        },
        {
          "kind": "perk",
          "name": "At the end of each floor, add 1 to your Skill Advancement Checks for Alchemy and Infusion"
        },
        {
          "kind": "perk",
          "name": "Alchemy Skill can be raised to Rank 20"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000003",
    "name": "Douchy Wizard School Wand-Maker",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist",
      "prerequisites": "",
      "description": "<p>Everyone wants that special wand. Rare materials, finely sculpted form, Access to powerful magics. Well, someone has to fill all these custom orders! Not only can you make wands, but you can also make fancy staves and… toys? Well, maybe wand-shaped toys… not asking why you want those. All of these can be used by their wielder to focus their arcane energies and do wondrous things. Or maybe just make light and shoot Magic Missiles—to each their own.</p>",
      "abilities": "<ul><li>+5 Intelligence</li><li>+1 Strength and Dexterity</li><li>−2 Charisma</li><li>+5 Arcane Skill</li><li>+2 Lore , Negotiation, and Salvage Skills</li><li>Tier-1 cr afting table of your choice</li><li>Arcanis t Skill can be raised to Rank 20</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+5 Intelligence",
        "+1 Strength and Dexterity",
        "−2 Charisma",
        "+5 Arcane Skill",
        "+2 Lore , Negotiation, and Salvage Skills",
        "Tier-1 cr afting table of your choice",
        "Arcanis t Skill can be raised to Rank 20",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 1,
        "dex": 1,
        "con": 0,
        "int": 5,
        "cha": -2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Arcane",
          "rank": 5
        },
        {
          "name": "Lore",
          "rank": 2
        },
        {
          "name": "Negotiation",
          "rank": 2
        },
        {
          "name": "Salvage",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "douchy-wizard-school-wand-maker",
      "archetypes": [
        "archetype.arcanist"
      ],
      "tags": [
        "archetype.arcanist",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": 1,
            "con": 0,
            "int": 5,
            "cha": -2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Arcane",
          "rank": 5,
          "ref": "id.skill.arcane"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lore",
          "rank": 2,
          "ref": "id.skill.lore"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Negotiation",
          "rank": 2,
          "ref": "id.skill.negotiation"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Salvage",
          "rank": 2,
          "ref": "id.skill.salvage"
        },
        {
          "kind": "perk",
          "name": "+5 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+1 Strength and Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+5 Arcane Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Lore , Negotiation, and Salvage Skills"
        },
        {
          "kind": "perk",
          "name": "Tier-1 cr afting table of your choice"
        },
        {
          "kind": "perk",
          "name": "Arcanis t Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000004",
    "name": "Infernocrafter",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist",
      "prerequisites": "",
      "description": "<p>Lighting stuff on fire is fun. You make a lot of things that inherently burn with magical fire, including flaming weapons and fiery magical items. Flaming arrows? Check. Flaming swords? Check.</p>",
      "abilities": "<ul><li>+3 Strength and Constitution</li><li>+1 Dexterity</li><li>+5 Arcane Skill</li><li>+3 Smithing Skill</li><li>resistance to Fire damage</li><li>Tier 1 Arc anist table</li><li>Tier 1 Smithin g table</li><li>Arcane Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Strength and Constitution",
        "+1 Dexterity",
        "+5 Arcane Skill",
        "+3 Smithing Skill",
        "resistance to Fire damage",
        "Tier 1 Arc anist table",
        "Tier 1 Smithin g table",
        "Arcane Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 3,
        "dex": 1,
        "con": 3,
        "int": 0,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Arcane",
          "rank": 5
        },
        {
          "name": "Smithing",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "infernocrafter",
      "archetypes": [
        "archetype.arcanist"
      ],
      "tags": [
        "archetype.arcanist",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 1,
            "con": 3,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Arcane",
          "rank": 5,
          "ref": "id.skill.arcane"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Smithing",
          "rank": 3,
          "ref": "id.skill.smithing"
        },
        {
          "kind": "perk",
          "name": "+3 Strength and Constitution"
        },
        {
          "kind": "perk",
          "name": "+1 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+5 Arcane Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Smithing Skill"
        },
        {
          "kind": "perk",
          "name": "resistance to Fire damage"
        },
        {
          "kind": "perk",
          "name": "Tier 1 Arc anist table"
        },
        {
          "kind": "perk",
          "name": "Tier 1 Smithin g table"
        },
        {
          "kind": "perk",
          "name": "Arcane Skill can be raised to Rank 20"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000005",
    "name": "Prison Tattoo Artist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist",
      "prerequisites": "",
      "description": "<p>Sometimes you just gotta make do with the tools you have on hand and hope for the best. They might not be pretty, but they do the job. Who are we kidding? You can’t tell what these motherfucking tattoos are supposed to be! Just don’t say that to the lifer who’s been working on them all month for you. You can create functional, but not aesthetically pleasing, magical tattoos that grant a wide range of arcane abilities for a limited amount of time.</p>",
      "abilities": "<ul><li>+3 Constitution and Dexterity</li><li>-2 Intelligence</li><li>+5 Tat too Artistry Skill</li><li>+3 Calligr aphy Skill</li><li>+2 Dagger Skill</li><li>Tier 1 Ta ttoo chair (table)</li><li>Tat too Artistry Skill can be raised to Rank 20</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Constitution and Dexterity",
        "+2 Intelligence",
        "+5 Tat too Artistry Skill",
        "+3 Calligr aphy Skill",
        "+2 Dagger Skill",
        "Tier 1 Ta ttoo chair (table)",
        "Tat too Artistry Skill can be raised to Rank 20",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
        "con": 3,
        "int": 2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Tattoo Artistry",
          "rank": 5
        },
        {
          "name": "Calligraphy",
          "rank": 3
        },
        {
          "name": "Dagger",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "prison-tattoo-artist",
      "archetypes": [
        "archetype.arcanist"
      ],
      "tags": [
        "archetype.arcanist",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 3,
            "con": 3,
            "int": 2,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Tattoo Artistry",
          "rank": 5,
          "ref": "id.skill.tattoo-artistry"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Calligraphy",
          "rank": 3,
          "ref": "id.skill.calligraphy"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dagger",
          "rank": 2,
          "ref": "id.skill.dagger"
        },
        {
          "kind": "perk",
          "name": "+3 Constitution and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+5 Tat too Artistry Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Calligr aphy Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Dagger Skill"
        },
        {
          "kind": "perk",
          "name": "Tier 1 Ta ttoo chair (table)"
        },
        {
          "kind": "perk",
          "name": "Tat too Artistry Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000006",
    "name": "Boring Ol’ Barbarian",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Barbarian",
      "prerequisites": "",
      "description": "<p>Like parading around in a loincloth and bashing heads? This is the Class for you! Just remember the Barbarian’s motto: what doesn’t kill you makes you stronger—as well as probably bleed a whole lot in the process.</p>",
      "abilities": "<ul><li>+6 Strength</li><li>+5 Constitution</li><li>+3 in a weapon Skill of your choice</li><li>+2 Endurance Skill</li><li>+1 Intimida te Skill</li><li>Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost</li><li>+2 DR Buff</li></ul>",
      "perks": [
        "+6 Strength",
        "+5 Constitution",
        "+3 in a weapon Skill of your choice",
        "+2 Endurance Skill",
        "+1 Intimida te Skill",
        "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost",
        "+2 DR Buff"
      ],
      "stats": {
        "str": 6,
        "dex": 0,
        "con": 5,
        "int": 0,
        "cha": 0
      },
      "drBonus": 2,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Endurance",
          "rank": 2
        },
        {
          "name": "Intimidate",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "boring-ol-barbarian",
      "archetypes": [
        "archetype.barbarian"
      ],
      "tags": [
        "archetype.barbarian",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 6,
            "dex": 0,
            "con": 5,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 2
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Endurance",
          "rank": 2,
          "ref": "id.skill.endurance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Intimidate",
          "rank": 1,
          "ref": "id.skill.intimidate"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 3,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill (Rank 3)"
        },
        {
          "kind": "perk",
          "name": "+6 Strength"
        },
        {
          "kind": "perk",
          "name": "+5 Constitution"
        },
        {
          "kind": "perk",
          "name": "+3 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Endurance Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Intimida te Skill"
        },
        {
          "kind": "perk",
          "name": "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost"
        },
        {
          "kind": "perk",
          "name": "+2 DR Buff"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000007",
    "name": "Gladiator",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Barbarian, Bard",
      "prerequisites": "",
      "description": "<p>You were once a slave, but now you fight for glory! Well, you’re probably still a slave (you are trapped in a world-spanning Dungeon where you’re fighting hordes of enemies for the entertainment of countless strangers, after all), but you do get some additional perks—as long as you manage to stay alive. You’ve been used and abused, but that has only toughened you and made you stronger. So strong, in fact, that your masters might be fearful of you and want to knock you down a peg. Or ten.</p>",
      "abilities": "<ul><li>+3 Strength, Constitution, and Charisma</li><li>+2 in a weapon Skill of your choice</li><li>+2 Performance and Intimidation Skills</li><li>+1 Att ack of Opportunity Skill</li><li>Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost</li><li>+1 DR Buff</li><li>Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing success or better, gain +1 popularity</li><li>One weapon Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Strength, Constitution, and Charisma",
        "+2 in a weapon Skill of your choice",
        "+2 Performance and Intimidation Skills",
        "+1 Att ack of Opportunity Skill",
        "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost",
        "+1 DR Buff",
        "Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing success or better, gain +1 popularity",
        "One weapon Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 3,
        "dex": 0,
        "con": 3,
        "int": 0,
        "cha": 3
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Performance",
          "rank": 2
        },
        {
          "name": "Intimidation",
          "rank": 2
        },
        {
          "name": "Attack of Opportunity",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "gladiator",
      "archetypes": [
        "archetype.barbarian",
        "archetype.bard"
      ],
      "tags": [
        "archetype.barbarian",
        "archetype.bard",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 0,
            "con": 3,
            "int": 0,
            "cha": 3
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 2,
          "ref": "id.skill.performance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Intimidation",
          "rank": 2,
          "ref": "id.skill.intimidation"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Attack of Opportunity",
          "rank": 1,
          "ref": "id.skill.attack-of-opportunity"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+3 Strength, Constitution, and Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Performance and Intimidation Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Att ack of Opportunity Skill"
        },
        {
          "kind": "perk",
          "name": "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost"
        },
        {
          "kind": "perk",
          "name": "+1 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing success or better, gain +1 popularity"
        },
        {
          "kind": "perk",
          "name": "One weapon Skill can be raised to Rank 20"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000008",
    "name": "Harii",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Barbarian, Rogue",
      "prerequisites": "",
      "description": "<p>You’re a lean, mean killing machine. And you look good in black. Like, all-black, head to toe. Some think you’re a ghostly myth, but others know better, as you use your stealth to terrorize your enemies at night, making them think you’re some sort of demonic spirit.</p>",
      "abilities": "<ul><li>+1 Strength, Dexterity, and Intelligence</li><li>+4 Ambush and Stealth Skills</li><li>+2 in one weapon Skill of your choice</li><li>Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost</li><li>+1 DR Buff</li><li>Can see in total darkness</li><li>Access to the Desperado Club</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+1 Strength, Dexterity, and Intelligence",
        "+4 Ambush and Stealth Skills",
        "+2 in one weapon Skill of your choice",
        "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost",
        "+1 DR Buff",
        "Can see in total darkness",
        "Access to the Desperado Club",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 1,
        "dex": 1,
        "con": 0,
        "int": 1,
        "cha": 0
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Ambush",
          "rank": 4
        },
        {
          "name": "Stealth",
          "rank": 4
        }
      ],
      "spells": [],
      "identifier": "harii",
      "archetypes": [
        "archetype.barbarian",
        "archetype.rogue"
      ],
      "tags": [
        "archetype.barbarian",
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": 1,
            "con": 0,
            "int": 1,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Ambush",
          "rank": 4,
          "ref": "id.skill.ambush"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Stealth",
          "rank": 4,
          "ref": "id.skill.stealth"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+1 Strength, Dexterity, and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+4 Ambush and Stealth Skills"
        },
        {
          "kind": "perk",
          "name": "+2 in one weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost"
        },
        {
          "kind": "perk",
          "name": "+1 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Can see in total darkness"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000009",
    "name": "Feral Cat Berserker",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Barbarian",
      "prerequisites": "Prerequisites: This limited Class is only available to cat-based Races, such as Cat, Cat Girl, and Tigran",
      "description": "<p>Cats couldn’t care less about you and your needs. Feral cats somehow manage to care even less as they barely eke out their own survival, living off cockroaches and rodents of unusual size. And sometimes things just get a little out of hand—out of paw?</p>",
      "abilities": "<ul><li>-2 Dexterity, Strength, and Charisma</li><li>+3 Slice Attack and Unarmed combat Skills</li><li>+2 Dodg e Skill</li><li>+1 Ambush Skill</li><li>Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost</li><li>+1 DR Buff</li><li>Can see in total darkness</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+2 Dexterity, Strength, and Charisma",
        "+3 Slice Attack and Unarmed combat Skills",
        "+2 Dodg e Skill",
        "+1 Ambush Skill",
        "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost",
        "+1 DR Buff",
        "Can see in total darkness",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 2,
        "dex": 2,
        "con": 0,
        "int": 0,
        "cha": 2
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Slice",
          "rank": 3
        },
        {
          "name": "Unarmed Combat",
          "rank": 3
        },
        {
          "name": "Dodge",
          "rank": 2
        },
        {
          "name": "Ambush",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "feral-cat-berserker",
      "archetypes": [
        "archetype.barbarian"
      ],
      "tags": [
        "archetype.barbarian",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 2,
            "con": 0,
            "int": 0,
            "cha": 2
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Slice",
          "rank": 3,
          "ref": "id.skill.slice"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 3,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 2,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Ambush",
          "rank": 1,
          "ref": "id.skill.ambush"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity, Strength, and Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Slice Attack and Unarmed combat Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Dodg e Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Ambush Skill"
        },
        {
          "kind": "perk",
          "name": "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost"
        },
        {
          "kind": "perk",
          "name": "+1 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Can see in total darkness"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000010",
    "name": "Shieldmaiden",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Barbarian, Fighter",
      "prerequisites": "Prerequisite: This limited Class is only available to female crawlers",
      "description": "<p>You are a fierce and skilled warrior who strikes fear in the hearts of your enemies—especially all those boys who used to bully you as a child. When you’re not busy kicking ass and taking names, you might be found working out in the gym, helping your family, or volunteering in your community. You can bring home the bacon and fry it up in a pan—after you hunt down the boar and butcher it, just like you did to that wretched boy Dustin who used to tease you and pull your pigtails.</p>",
      "abilities": "<ul><li>+3 Strength, Dexterity, and Charisma</li><li>−2 Intelligence</li><li>+5 Shield Bloc k Skill</li><li>+2 in one weapon Skill of your choice</li><li>Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost</li><li>+1 DR Buff</li><li>One weapon Skill can be raised to Rank 20</li><li>Add your Str Mod a second time to your melee attack damage against males</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Strength, Dexterity, and Charisma",
        "−2 Intelligence",
        "+5 Shield Bloc k Skill",
        "+2 in one weapon Skill of your choice",
        "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost",
        "+1 DR Buff",
        "One weapon Skill can be raised to Rank 20",
        "Add your Str Mod a second time to your melee attack damage against males",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 3,
        "dex": 3,
        "con": 0,
        "int": -2,
        "cha": 3
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Shield Block",
          "rank": 5
        }
      ],
      "spells": [],
      "identifier": "shieldmaiden",
      "archetypes": [
        "archetype.barbarian",
        "archetype.fighter"
      ],
      "tags": [
        "archetype.barbarian",
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 3,
            "con": 0,
            "int": -2,
            "cha": 3
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Shield Block",
          "rank": 5,
          "ref": "id.skill.shield-block"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+3 Strength, Dexterity, and Charisma"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+5 Shield Bloc k Skill"
        },
        {
          "kind": "perk",
          "name": "+2 in one weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "Rag e (benefit): Your melee attacks deal +1 damage for each Health Bar slot you have lost"
        },
        {
          "kind": "perk",
          "name": "+1 DR Buff"
        },
        {
          "kind": "perk",
          "name": "One weapon Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Add your Str Mod a second time to your melee attack damage against males"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000011",
    "name": "Boring Ol’ Bard",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard",
      "prerequisites": "",
      "description": "<p>Every town and village has that one Bard who parties hard all night yet still manages to look refreshed in the morning. They drink, sing or play an instrument, then drink some more, pass out, then wake up to do it all over again the next day. If mead and beer weren’t so rich in carbs and sugars, they’d probably already be dead by now.</p>",
      "abilities": "<ul><li>+3 Charisma</li><li>+3 Performance Skill</li><li>+1 in a weapon Skill of your choice</li><li>+2 in a Spell of your c hoice</li><li>+2 Diplomacy Skill</li><li>+1 Good Fir st Impression and Lore Skills</li><li>Access to all membership-based clubs, regardless of current memberships</li><li>Membership in the Dungeon Book of the Floor Club (all Spells)</li><li>Free r oom at all saferooms</li><li>You may g ain Access to a Patron</li><li>You pay +1 Mana to cast Spells that are not “Favored: Bard”</li></ul>",
      "perks": [
        "+3 Charisma",
        "+3 Performance Skill",
        "+1 in a weapon Skill of your choice",
        "+2 in a Spell of your c hoice",
        "+2 Diplomacy Skill",
        "+1 Good Fir st Impression and Lore Skills",
        "Access to all membership-based clubs, regardless of current memberships",
        "Membership in the Dungeon Book of the Floor Club (all Spells)",
        "Free r oom at all saferooms",
        "You may g ain Access to a Patron",
        "You pay +1 Mana to cast Spells that are not “Favored: Bard”"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 0,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Performance",
          "rank": 3
        },
        {
          "name": "Diplomacy",
          "rank": 2
        },
        {
          "name": "Good First Impression",
          "rank": 1
        },
        {
          "name": "Lore",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "boring-ol-bard",
      "archetypes": [
        "archetype.bard"
      ],
      "tags": [
        "archetype.bard",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 0,
            "cha": 3
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 3,
          "ref": "id.skill.performance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Diplomacy",
          "rank": 2,
          "ref": "id.skill.diplomacy"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Good First Impression",
          "rank": 1,
          "ref": "id.skill.good-first-impression"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lore",
          "rank": 1,
          "ref": "id.skill.lore"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 1,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 1)"
        },
        {
          "kind": "perk",
          "name": "+3 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Performance Skill"
        },
        {
          "kind": "perk",
          "name": "+1 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 in a Spell of your c hoice"
        },
        {
          "kind": "perk",
          "name": "+2 Diplomacy Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Good Fir st Impression and Lore Skills"
        },
        {
          "kind": "perk",
          "name": "Access to all membership-based clubs, regardless of current memberships"
        },
        {
          "kind": "perk",
          "name": "Membership in the Dungeon Book of the Floor Club (all Spells)"
        },
        {
          "kind": "perk",
          "name": "Free r oom at all saferooms"
        },
        {
          "kind": "perk",
          "name": "You may g ain Access to a Patron"
        },
        {
          "kind": "perk",
          "name": "You pay +1 Mana to cast Spells that are not “Favored: Bard”"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000012",
    "name": "Artist Alley Mogul",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Merchant",
      "prerequisites": "",
      "description": "<p>This Charisma and Intelligence-based Class is a modern-day merchant, using the siren song of merchandise to cast a spell on the wallets and purses of their prey. Using their superior artistic talent to entertain and entice fellow nerds, the Artist Alley Mogul travels the world to sell their copyright-infringing wares. While not particularly menacing physically, this plucky merchant is extremely difficult to hurt. A recent balance patch hit the Class, increasing gold-generating potency while reducing survivability. Members of this Class receive the following benefits:</p>",
      "abilities": "<ul><li>+5 Dexterity</li><li>+5 Charisma</li><li>+2 Dodg e, Negotiation, and Pathfinder Skills</li><li>+2 Shield Spell</li><li>A 25% discount at all s tores plus a 15% bonus to money earned from sales</li><li>10% interes t earned on all coins upon descent to the next floor</li><li>Dodg e Skill can be raised to Rank 20</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+5 Dexterity",
        "+5 Charisma",
        "+2 Dodg e, Negotiation, and Pathfinder Skills",
        "+2 Shield Spell",
        "A 25% discount at all s tores plus a 15% bonus to money earned from sales",
        "10% interes t earned on all coins upon descent to the next floor",
        "Dodg e Skill can be raised to Rank 20",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 5,
        "con": 0,
        "int": 0,
        "cha": 5
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Dodge",
          "rank": 2
        },
        {
          "name": "Negotiation",
          "rank": 2
        },
        {
          "name": "Pathfinder",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Shield",
          "rank": 2
        }
      ],
      "identifier": "artist-alley-mogul",
      "archetypes": [
        "archetype.bard",
        "archetype.merchant"
      ],
      "tags": [
        "archetype.bard",
        "archetype.merchant",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 5,
            "con": 0,
            "int": 0,
            "cha": 5
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 2,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Negotiation",
          "rank": 2,
          "ref": "id.skill.negotiation"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pathfinder",
          "rank": 2,
          "ref": "id.skill.pathfinder"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Shield",
          "rank": 2,
          "ref": "id.spell.shield"
        },
        {
          "kind": "perk",
          "name": "+5 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+5 Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 Dodg e, Negotiation, and Pathfinder Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Shield Spell"
        },
        {
          "kind": "perk",
          "name": "A 25% discount at all s tores plus a 15% bonus to money earned from sales"
        },
        {
          "kind": "perk",
          "name": "10% interes t earned on all coins upon descent to the next floor"
        },
        {
          "kind": "perk",
          "name": "Dodg e Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000013",
    "name": "Former Child Actor",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard",
      "prerequisites": "Prerequisites: Must have popularity 3+, receiving the Cut! achievement, to take this Class",
      "description": "<p>This rare subclass is an offshoot of the Bard Class. It can only be obtained by crawlers who have both earned the “Cut!” achievement and reached at least one trillion views. Once a spoiled brat superstar, then addicted to drugs, you have crawled back from the brink stronger than ever. You’re ready for your comeback. This Charisma and Chance-based Class could go either way. You’ll either rise to the top, or you’ll be dead in a ditch in a week. After a balance patch, it’s slightly more likely you’ll end up dead in that ditch, but this is your chance to prove them wrong! This unique Earth Class is based on the Bard/Rogue Jack-Of-All-Trades subclass, but with a few distinctive differences. In addition to the following benefits, the most distinct aspect of this multi-faceted Class is the Rank 3 Character Actor Skill. This Skill increases in Rank only upon descent to the next floor.</p>",
      "abilities": "<ul><li>+10 Charisma</li><li>+3 Charact er Actor Skill</li><li>+2 Cock roach Skill</li><li>Add 1 to your Skill Advancement Checks for Charisma-based Skills</li><li>Immunity to Poison and all diseases</li><li>The Manag er benefit</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+10 Charisma",
        "+3 Charact er Actor Skill",
        "+2 Cock roach Skill",
        "Add 1 to your Skill Advancement Checks for Charisma-based Skills",
        "Immunity to Poison and all diseases",
        "The Manag er benefit",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 0,
        "cha": 10
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Character Actor",
          "rank": 3
        },
        {
          "name": "Cockroach",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "former-child-actor",
      "archetypes": [
        "archetype.bard"
      ],
      "tags": [
        "archetype.bard",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 0,
            "cha": 10
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Character Actor",
          "rank": 3,
          "ref": "id.skill.character-actor"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Cockroach",
          "rank": 2,
          "ref": "id.skill.cockroach"
        },
        {
          "kind": "perk",
          "name": "+10 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Charact er Actor Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Cock roach Skill"
        },
        {
          "kind": "perk",
          "name": "Add 1 to your Skill Advancement Checks for Charisma-based Skills"
        },
        {
          "kind": "perk",
          "name": "Immunity to Poison and all diseases"
        },
        {
          "kind": "perk",
          "name": "The Manag er benefit"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000014",
    "name": "NecroBard",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Necromancer",
      "prerequisites": "",
      "description": "<p>This unusual Class combines one of the mostloved occupations with one of the most reviled. Necromancers specialize in magic related to raising the dead. Bards must choose an entertainment-based Skill. Depending on this choice, whether it be singing, the kazoo, or storytelling, the resulting crawler will use this Skill to either entertain, protect, or glamour both the living and the dead. The NecroBard receives the following benefits:</p>",
      "abilities": "<ul><li>+3 to Intelligence, Constitution, and Charisma</li><li>−2 Strength</li><li>+4 Performance Skill</li><li>+3 Turn Undead and Panty Dropper Spells</li><li>Access to all membership-based clubs, regardless of current memberships</li><li>Free r oom at all saferooms</li><li>You pay +1 Mana to cast Spells that are not “Favored: Bard” or that don’t deal Necrotic damage</li></ul>",
      "perks": [
        "+3 to Intelligence, Constitution, and Charisma",
        "−2 Strength",
        "+4 Performance Skill",
        "+3 Turn Undead and Panty Dropper Spells",
        "Access to all membership-based clubs, regardless of current memberships",
        "Free r oom at all saferooms",
        "You pay +1 Mana to cast Spells that are not “Favored: Bard” or that don’t deal Necrotic damage"
      ],
      "stats": {
        "str": -2,
        "dex": 0,
        "con": 3,
        "int": 3,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Performance",
          "rank": 4
        }
      ],
      "spells": [
        {
          "name": "Turn Undead",
          "rank": 3
        },
        {
          "name": "Panty Dropper",
          "rank": 3
        }
      ],
      "identifier": "necrobard",
      "archetypes": [
        "archetype.bard",
        "archetype.necromancer"
      ],
      "tags": [
        "archetype.bard",
        "archetype.necromancer",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": -2,
            "dex": 0,
            "con": 3,
            "int": 3,
            "cha": 3
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 4,
          "ref": "id.skill.performance"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Turn Undead",
          "rank": 3,
          "ref": "id.spell.turn-undead"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Panty Dropper",
          "rank": 3,
          "ref": "id.spell.panty-dropper"
        },
        {
          "kind": "perk",
          "name": "+3 to Intelligence, Constitution, and Charisma"
        },
        {
          "kind": "perk",
          "name": "−2 Strength"
        },
        {
          "kind": "perk",
          "name": "+4 Performance Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Turn Undead and Panty Dropper Spells"
        },
        {
          "kind": "perk",
          "name": "Access to all membership-based clubs, regardless of current memberships"
        },
        {
          "kind": "perk",
          "name": "Free r oom at all saferooms"
        },
        {
          "kind": "perk",
          "name": "You pay +1 Mana to cast Spells that are not “Favored: Bard” or that don’t deal Necrotic damage"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000015",
    "name": "Poet Laureate",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard",
      "prerequisites": "",
      "description": "<p>The spoken word is your jam. Rather than singing or playing an instrument, you craft entertaining and usually scandalous verses about the rich and famous. This not only endears you to the common folk, but it also enables you to use your words to convince others to do your will.</p>",
      "abilities": "<ul><li>+3 Intelligence</li><li>-2 Charisma</li><li>+5 Performance Skill with the written word specialty</li><li>+2 Earworm (as spoken word poetry), Heal Others, and Shield Spells</li><li>Access to all membership-based clubs, regardless of current memberships</li><li>You pay +1 Mana to cast Spells that are not “Favored: Bard”</li><li>Performance Skill can be raised to 20</li><li>You must choose a Patron. The GM will give you a choice of at least two options when you select this class.</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Intelligence",
        "+2 Charisma",
        "+5 Performance Skill with the written word specialty",
        "+2 Earworm (as spoken word poetry), Heal Others, and Shield Spells",
        "Access to all membership-based clubs, regardless of current memberships",
        "You pay +1 Mana to cast Spells that are not “Favored: Bard”",
        "Performance Skill can be raised to 20",
        "You must choose a Patron. The GM will give you a choice of at least two options when you select this class.",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 3,
        "cha": 2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Performance",
          "rank": 5
        }
      ],
      "spells": [],
      "identifier": "poet-laureate",
      "archetypes": [
        "archetype.bard"
      ],
      "tags": [
        "archetype.bard",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 3,
            "cha": 2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 5,
          "ref": "id.skill.performance"
        },
        {
          "kind": "perk",
          "name": "+3 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+5 Performance Skill with the written word specialty"
        },
        {
          "kind": "perk",
          "name": "+2 Earworm (as spoken word poetry), Heal Others, and Shield Spells"
        },
        {
          "kind": "perk",
          "name": "Access to all membership-based clubs, regardless of current memberships"
        },
        {
          "kind": "perk",
          "name": "You pay +1 Mana to cast Spells that are not “Favored: Bard”"
        },
        {
          "kind": "perk",
          "name": "Performance Skill can be raised to 20"
        },
        {
          "kind": "perk",
          "name": "You must choose a Patron. The GM will give you a choice of at least two options when you select this class."
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000016",
    "name": "Professional Roadie",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Rogue",
      "prerequisites": "",
      "description": "<p>Considered by some to be the backup singer to a Bard, the Professional Roadie possesses powers that can boost their comrades and maximize sonic effects. Whether working on a team or taking your act solo, the Professional Roadie has a wealth of experience to draw on and has dealt with the most difficult patrons. The ability to sort out broken equipment and manage healing elixirs makes you invaluable to a group trying to survive the Floor. The Professional Roadie spends a long time exploring the World Dungeon, utilizing their Skills to bargain for food and lodging from others. Highly versatile, a Professional Roadie often has a wealth of contacts on call should they need favors, information, or money that is owed to them. You also tell the best stories and can hypnotize a crowd with tales of days gone by and gigs you’ve played.</p>",
      "abilities": "<ul><li>+8 split bet ween Strength, Constitution, and Charisma</li><li>+4 Performance Skill, with a guitar specialty</li><li>+3 Negotiation Skill</li><li>+1 Iron Stomach and Repair Skills</li><li>Advantage on Checks against Poison or effects that give the Shit-Faced Debuff</li><li>At the start of each combat, you may declare that all the damage you deal is Sonic damage</li><li>Roll with Advantage when making a Repair Skill Check</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+8 split bet ween Strength, Constitution, and Charisma",
        "+4 Performance Skill, with a guitar specialty",
        "+3 Negotiation Skill",
        "+1 Iron Stomach and Repair Skills",
        "Advantage on Checks against Poison or effects that give the Shit-Faced Debuff",
        "At the start of each combat, you may declare that all the damage you deal is Sonic damage",
        "Roll with Advantage when making a Repair Skill Check",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 8,
        "int": 0,
        "cha": 8
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Performance",
          "rank": 4
        },
        {
          "name": "Negotiation",
          "rank": 3
        },
        {
          "name": "Iron Stomach",
          "rank": 1
        },
        {
          "name": "Repair",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "professional-roadie",
      "archetypes": [
        "archetype.bard",
        "archetype.rogue"
      ],
      "tags": [
        "archetype.bard",
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 8,
            "int": 0,
            "cha": 8
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 4,
          "ref": "id.skill.performance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Negotiation",
          "rank": 3,
          "ref": "id.skill.negotiation"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Iron Stomach",
          "rank": 1,
          "ref": "id.skill.iron-stomach"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Repair",
          "rank": 1,
          "ref": "id.skill.repair"
        },
        {
          "kind": "perk",
          "name": "+8 split bet ween Strength, Constitution, and Charisma"
        },
        {
          "kind": "perk",
          "name": "+4 Performance Skill, with a guitar specialty"
        },
        {
          "kind": "perk",
          "name": "+3 Negotiation Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Iron Stomach and Repair Skills"
        },
        {
          "kind": "perk",
          "name": "Advantage on Checks against Poison or effects that give the Shit-Faced Debuff"
        },
        {
          "kind": "perk",
          "name": "At the start of each combat, you may declare that all the damage you deal is Sonic damage"
        },
        {
          "kind": "perk",
          "name": "Roll with Advantage when making a Repair Skill Check"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000017",
    "name": "Spellbinder",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard",
      "prerequisites": "",
      "description": "<p>Everyone loves a good story, and most Bards are pretty good at telling them. You, on the other hand, are the master weaver of fantastical tales. Glorious adventures are your forte, and you effortlessly bring even the most dry and voluminous tomes to life with your passionate narration (with the exception perhaps of those from authors who seem to write several 1,000-page books a year, with a never-ending narrative). Your storytelling demands the rapt attention of all who hear, even when they’d rather ignore you. Like in the midst of battle. Or during sex. Your oration is so immersive that your listeners can’t help but feel a sense of loss when the story eventually ends, making them yearn for the next, even though it might be years before it reaches their ears. (Yeah, thanks for that, Jeff Hays).</p>",
      "abilities": "<ul><li>-2 Charisma and Intelligence</li><li>+2 Good Fir st Impression, Lore, and Performance Skills</li><li>+2 in Hot St uff Aura and Panty Dropper Spells</li><li>Add your Cha Mod a second time when making a Cha Skill Check during a potentially hostile situation</li><li>Access to the Spellbook of the Floor club (“Favored: Bard” Spells only)</li><li>Once per da y, you can draw the attention of everyone on the battlefield for around, preventing them from attacking (this includes party members, Mobs, and minions, but not Bosses)</li></ul>",
      "perks": [
        "+2 Charisma and Intelligence",
        "+2 Good Fir st Impression, Lore, and Performance Skills",
        "+2 in Hot St uff Aura and Panty Dropper Spells",
        "Add your Cha Mod a second time when making a Cha Skill Check during a potentially hostile situation",
        "Access to the Spellbook of the Floor club (“Favored: Bard” Spells only)",
        "Once per da y, you can draw the attention of everyone on the battlefield for around, preventing them from attacking (this includes party members, Mobs, and minions, but not Bosses)"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 2,
        "cha": 2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Good First Impression",
          "rank": 2
        },
        {
          "name": "Lore",
          "rank": 2
        },
        {
          "name": "Performance",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Hot Stuff Aura",
          "rank": 2
        },
        {
          "name": "Panty Dropper",
          "rank": 2
        }
      ],
      "identifier": "spellbinder",
      "archetypes": [
        "archetype.bard"
      ],
      "tags": [
        "archetype.bard",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 2,
            "cha": 2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Good First Impression",
          "rank": 2,
          "ref": "id.skill.good-first-impression"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lore",
          "rank": 2,
          "ref": "id.skill.lore"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 2,
          "ref": "id.skill.performance"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Hot Stuff Aura",
          "rank": 2,
          "ref": "id.spell.hot-stuff-aura"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Panty Dropper",
          "rank": 2,
          "ref": "id.spell.panty-dropper"
        },
        {
          "kind": "perk",
          "name": "+2 Charisma and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Good Fir st Impression, Lore, and Performance Skills"
        },
        {
          "kind": "perk",
          "name": "+2 in Hot St uff Aura and Panty Dropper Spells"
        },
        {
          "kind": "perk",
          "name": "Add your Cha Mod a second time when making a Cha Skill Check during a potentially hostile situation"
        },
        {
          "kind": "perk",
          "name": "Access to the Spellbook of the Floor club (“Favored: Bard” Spells only)"
        },
        {
          "kind": "perk",
          "name": "Once per da y, you can draw the attention of everyone on the battlefield for around, preventing them from attacking (this includes party members, Mobs, and minions, but not Bosses)"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000018",
    "name": "Boring Ol’ Cleric",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Cleric",
      "prerequisites": "",
      "description": "<p>Whether do-gooders or downright evil, Clerics exist ostensibly to serve their god and lead their god’s followers. Some do this with loyalty and reverence. Others do so out of fear or in hopes of rewards. Either way, being a Cleric has its ups and downs, sometimes leaving you dirt-poor and other times providing you with that private jet you “need” to serve your god.</p>",
      "abilities": "<ul><li>+4 Charisma</li><li>+3 Intelligence</li><li>+2 in a Weapon Skill of your choice</li><li>+3 Religion Skill</li><li>+2 Heal Others, Shield, and Turn Undead Spells</li><li>Access to the Spell Book of the Level club (“Favored: Cleric” Spells only)</li><li>Access to Club Vanquisher</li><li>Must worship a deity (see Deities & Worship, p. 163)</li><li>You cannot choose a Cleric-type Class if you have Access to the Desperado Club</li></ul>",
      "perks": [
        "+4 Charisma",
        "+3 Intelligence",
        "+2 in a Weapon Skill of your choice",
        "+3 Religion Skill",
        "+2 Heal Others, Shield, and Turn Undead Spells",
        "Access to the Spell Book of the Level club (“Favored: Cleric” Spells only)",
        "Access to Club Vanquisher",
        "Must worship a deity (see Deities & Worship, p. 163)",
        "You cannot choose a Cleric-type Class if you have Access to the Desperado Club"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 3,
        "cha": 4
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Religion",
          "rank": 3
        }
      ],
      "spells": [
        {
          "name": "Heal Others",
          "rank": 2
        },
        {
          "name": "Shield",
          "rank": 2
        },
        {
          "name": "Turn Undead",
          "rank": 2
        }
      ],
      "identifier": "boring-ol-cleric",
      "archetypes": [
        "archetype.cleric"
      ],
      "tags": [
        "archetype.cleric",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 3,
            "cha": 4
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Religion",
          "rank": 3,
          "ref": "id.skill.religion"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 2,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Shield",
          "rank": 2,
          "ref": "id.spell.shield"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Turn Undead",
          "rank": 2,
          "ref": "id.spell.turn-undead"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+4 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 in a Weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+3 Religion Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Heal Others, Shield, and Turn Undead Spells"
        },
        {
          "kind": "perk",
          "name": "Access to the Spell Book of the Level club (“Favored: Cleric” Spells only)"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity (see Deities & Worship, p. 163)"
        },
        {
          "kind": "perk",
          "name": "You cannot choose a Cleric-type Class if you have Access to the Desperado Club"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000019",
    "name": "Santero",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Cleric",
      "prerequisites": "",
      "description": "<p>You can call upon powerful spirits for aid as you provide guidance and protection to others, and you do it with color and flair! This Class is a hybrid Necromancer Cleric with tanking and support tendencies.</p>",
      "abilities": "<ul><li>+3 Strength and Charisma</li><li>-2 Constitution</li><li>−2 Intelligence</li><li>+2 Heal Others, Shield, and Soul Collector Spells</li><li>+2 in a weapon Skill of your choice</li><li>+2 Reli gion Skill</li><li>+1 Endurance Skill</li><li>Access to the Dungeon Book of the Floor club (“Favored: Cleric” Spells only)</li><li>Access to Club Vanquisher</li><li>Must worship a deity (see Deities & Worship, p. 163)</li><li>You cannot choose this Class if you have Access to the Desperado Club</li></ul>",
      "perks": [
        "+3 Strength and Charisma",
        "+2 Constitution",
        "−2 Intelligence",
        "+2 Heal Others, Shield, and Soul Collector Spells",
        "+2 in a weapon Skill of your choice",
        "+2 Reli gion Skill",
        "+1 Endurance Skill",
        "Access to the Dungeon Book of the Floor club (“Favored: Cleric” Spells only)",
        "Access to Club Vanquisher",
        "Must worship a deity (see Deities & Worship, p. 163)",
        "You cannot choose this Class if you have Access to the Desperado Club"
      ],
      "stats": {
        "str": 3,
        "dex": 0,
        "con": 2,
        "int": -2,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Religion",
          "rank": 2
        },
        {
          "name": "Endurance",
          "rank": 1
        }
      ],
      "spells": [
        {
          "name": "Heal Others",
          "rank": 2
        },
        {
          "name": "Shield",
          "rank": 2
        },
        {
          "name": "Soul Collector",
          "rank": 2
        }
      ],
      "identifier": "santero",
      "archetypes": [
        "archetype.cleric"
      ],
      "tags": [
        "archetype.cleric",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 0,
            "con": 2,
            "int": -2,
            "cha": 3
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Religion",
          "rank": 2,
          "ref": "id.skill.religion"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Endurance",
          "rank": 1,
          "ref": "id.skill.endurance"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 2,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Shield",
          "rank": 2,
          "ref": "id.spell.shield"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Soul Collector",
          "rank": 2,
          "ref": "id.spell.soul-collector"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+3 Strength and Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 Constitution"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Heal Others, Shield, and Soul Collector Spells"
        },
        {
          "kind": "perk",
          "name": "+2 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Reli gion Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Endurance Skill"
        },
        {
          "kind": "perk",
          "name": "Access to the Dungeon Book of the Floor club (“Favored: Cleric” Spells only)"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity (see Deities & Worship, p. 163)"
        },
        {
          "kind": "perk",
          "name": "You cannot choose this Class if you have Access to the Desperado Club"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000020",
    "name": "Boring Ol’ Druid",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Druid",
      "prerequisites": "",
      "description": "<p>Typical tree-hugging nature lovers, Druids are protectors of flora and fauna alike. Sometimes they can get a bit overprotective. Don’t get caught littering, as they’re more than willing to exploit ecological forces to punish their enemies. So pick up your trash, or else your pulverized bones will serve as bricks for a retaining wall around some Druid’s garden.</p>",
      "abilities": "<ul><li>-2 Intelligence, Constitution, and Dexterity</li><li>+3 Nature’s Breath Spell</li><li>+3 in a Spell of your c hoice</li><li>+2 in a Spell of your c hoice</li><li>+2 Survival Skill</li><li>Your Mana recovers at twice the normal rate in a natural environment</li><li>Access to the Dungeon Book of the Floor club (“Favored: Druid” Spells only)</li></ul>",
      "perks": [
        "+2 Intelligence, Constitution, and Dexterity",
        "+3 Nature’s Breath Spell",
        "+3 in a Spell of your c hoice",
        "+2 in a Spell of your c hoice",
        "+2 Survival Skill",
        "Your Mana recovers at twice the normal rate in a natural environment",
        "Access to the Dungeon Book of the Floor club (“Favored: Druid” Spells only)"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 2,
        "int": 2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Survival",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Nature's Breath",
          "rank": 3
        }
      ],
      "identifier": "boring-ol-druid",
      "archetypes": [
        "archetype.druid"
      ],
      "tags": [
        "archetype.druid",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": 2,
            "int": 2,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Survival",
          "rank": 2,
          "ref": "id.skill.survival"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Nature's Breath",
          "rank": 3,
          "ref": "id.spell.nature-s-breath"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence, Constitution, and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 Nature’s Breath Spell"
        },
        {
          "kind": "perk",
          "name": "+3 in a Spell of your c hoice"
        },
        {
          "kind": "perk",
          "name": "+2 in a Spell of your c hoice"
        },
        {
          "kind": "perk",
          "name": "+2 Survival Skill"
        },
        {
          "kind": "perk",
          "name": "Your Mana recovers at twice the normal rate in a natural environment"
        },
        {
          "kind": "perk",
          "name": "Access to the Dungeon Book of the Floor club (“Favored: Druid” Spells only)"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000021",
    "name": "Herbalist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Arcanist, Druid",
      "prerequisites": "",
      "description": "<p>You’ve spent years mastering the arcane properties of herbs—not the boring culinary kind, but the kind that make people question their life choices and maybe make a few more bad ones along the way. Every herb is a piece of the puzzle, every blend a calculated risk. The Dungeon is your garden, and you harvest it with the enthusiasm of someone who genuinely does not understand the concept of “too much.”</p>",
      "abilities": "<ul><li>-2 Constitution and Intelligence</li><li>+2 Alchemy , Cooking, First Aid, and Survival Skills</li><li>+2 Nature’s Breath and Dirt Clod Spells</li><li>Your Mana recovers at twice the normal rate in a natural environment</li></ul>",
      "perks": [
        "+2 Constitution and Intelligence",
        "+2 Alchemy , Cooking, First Aid, and Survival Skills",
        "+2 Nature’s Breath and Dirt Clod Spells",
        "Your Mana recovers at twice the normal rate in a natural environment"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 2,
        "int": 2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Alchemy",
          "rank": 2
        },
        {
          "name": "Cooking",
          "rank": 2
        },
        {
          "name": "First Aid",
          "rank": 2
        },
        {
          "name": "Survival",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Nature's Breath",
          "rank": 2
        },
        {
          "name": "Dirt Clod",
          "rank": 2
        }
      ],
      "identifier": "herbalist",
      "archetypes": [
        "archetype.arcanist",
        "archetype.druid"
      ],
      "tags": [
        "archetype.arcanist",
        "archetype.druid",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 2,
            "int": 2,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Alchemy",
          "rank": 2,
          "ref": "id.skill.alchemy"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Cooking",
          "rank": 2,
          "ref": "id.skill.cooking"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "First Aid",
          "rank": 2,
          "ref": "id.skill.first-aid"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Survival",
          "rank": 2,
          "ref": "id.skill.survival"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Nature's Breath",
          "rank": 2,
          "ref": "id.spell.nature-s-breath"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Dirt Clod",
          "rank": 2,
          "ref": "id.spell.dirt-clod"
        },
        {
          "kind": "perk",
          "name": "+2 Constitution and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Alchemy , Cooking, First Aid, and Survival Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Nature’s Breath and Dirt Clod Spells"
        },
        {
          "kind": "perk",
          "name": "Your Mana recovers at twice the normal rate in a natural environment"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000022",
    "name": "Lifebringer",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Druid",
      "prerequisites": "",
      "description": "<p>You’ve traveled the wasteland, past former refineries, down furious roads, and around thunderous strongholds. You’re a survivor, and you’ve learned how to restore the dead lands and help flora to grow and thrive. While others fought the limited resources, often wearing nothing but chaps and some poorly applied sunscreen, you sought to bring life back to the desert. When you encountered lost souls, you took them in and helped them find their way, both figuratively and spiritually. You only wish you could get rid of all that sand that keeps getting stuck in the most uncomfortable places. There’s gotta be a spell for that!</p>",
      "abilities": "<ul><li>-2 Constitution</li><li>+1 Intelligence</li><li>+2 Firs t Aid, Pathfinder, Regeneration, and Survival Skills</li><li>+2 Nature’s Breath Spell</li><li>+1 Rank in all Spells with the Heal keyword</li><li>Once per da y, you can grant Regeneration at your Skill Rank to all party members within 30 feet for 10 minutes</li></ul>",
      "perks": [
        "+2 Constitution",
        "+1 Intelligence",
        "+2 Firs t Aid, Pathfinder, Regeneration, and Survival Skills",
        "+2 Nature’s Breath Spell",
        "+1 Rank in all Spells with the Heal keyword",
        "Once per da y, you can grant Regeneration at your Skill Rank to all party members within 30 feet for 10 minutes"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 2,
        "int": 1,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "First Aid",
          "rank": 2
        },
        {
          "name": "Pathfinder",
          "rank": 2
        },
        {
          "name": "Regeneration",
          "rank": 2
        },
        {
          "name": "Survival",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Nature's Breath",
          "rank": 2
        },
        {
          "name": "Rank in all",
          "rank": 1
        }
      ],
      "identifier": "lifebringer",
      "archetypes": [
        "archetype.druid"
      ],
      "tags": [
        "archetype.druid",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 2,
            "int": 1,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "First Aid",
          "rank": 2,
          "ref": "id.skill.first-aid"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pathfinder",
          "rank": 2,
          "ref": "id.skill.pathfinder"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Regeneration",
          "rank": 2,
          "ref": "id.skill.regeneration"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Survival",
          "rank": 2,
          "ref": "id.skill.survival"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Nature's Breath",
          "rank": 2,
          "ref": "id.spell.nature-s-breath"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Rank in all",
          "rank": 1,
          "ref": "id.spell.rank-in-all"
        },
        {
          "kind": "perk",
          "name": "+2 Constitution"
        },
        {
          "kind": "perk",
          "name": "+1 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Firs t Aid, Pathfinder, Regeneration, and Survival Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Nature’s Breath Spell"
        },
        {
          "kind": "perk",
          "name": "+1 Rank in all Spells with the Heal keyword"
        },
        {
          "kind": "perk",
          "name": "Once per da y, you can grant Regeneration at your Skill Rank to all party members within 30 feet for 10 minutes"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000023",
    "name": "PHysicker",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Druid",
      "prerequisites": "",
      "description": "<p>Your calling is to heal and protect others, and Mother Nature gives you the tools to do so. The natural environment comes to your aid in curing the physical ailments of the sick and protecting the weak. While some might think your “home remedies” are crude and archaic, they are every bit as effective as other magic and modern medicine (though they can get a bit smelly and gross by comparison!). I mean, leeches aren’t everyone’s cup of tea, and sometimes your remedies are slow to effect, but they can’t deny how much better they feel after a good bloodletting…</p>",
      "abilities": "<ul><li>+3 Constitution and Intelligence</li><li>+3 Nature’s Breath and Oakhide Spells</li><li>+2 Rootfoot and Solsplash Spells</li><li>Double Mana re generation when outdoors</li><li>Able to gr ant +1 DR to your party for 1 scene, once per day</li></ul>",
      "perks": [
        "+3 Constitution and Intelligence",
        "+3 Nature’s Breath and Oakhide Spells",
        "+2 Rootfoot and Solsplash Spells",
        "Double Mana re generation when outdoors",
        "Able to gr ant +1 DR to your party for 1 scene, once per day"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 3,
        "int": 3,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [],
      "spells": [
        {
          "name": "Nature's Breath",
          "rank": 3
        },
        {
          "name": "Oakhide",
          "rank": 3
        },
        {
          "name": "Rootfoot",
          "rank": 2
        },
        {
          "name": "Solsplash",
          "rank": 2
        }
      ],
      "identifier": "physicker",
      "archetypes": [
        "archetype.druid"
      ],
      "tags": [
        "archetype.druid",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 3,
            "int": 3,
            "cha": 0
          }
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Nature's Breath",
          "rank": 3,
          "ref": "id.spell.nature-s-breath"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Oakhide",
          "rank": 3,
          "ref": "id.spell.oakhide"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Rootfoot",
          "rank": 2,
          "ref": "id.spell.rootfoot"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Solsplash",
          "rank": 2,
          "ref": "id.spell.solsplash"
        },
        {
          "kind": "perk",
          "name": "+3 Constitution and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+3 Nature’s Breath and Oakhide Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Rootfoot and Solsplash Spells"
        },
        {
          "kind": "perk",
          "name": "Double Mana re generation when outdoors"
        },
        {
          "kind": "perk",
          "name": "Able to gr ant +1 DR to your party for 1 scene, once per day"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000024",
    "name": "Shepherd",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Druid",
      "prerequisites": "",
      "description": "<p>Considered by some to be pacifists, Shepherds do their best to maintain an appearance of docility before unleashing their most potent weapons: their herds. Trained in the arts of healing, animal care, and protection, you have dedicated yourself to protecting your flock, no matter what form that may take. It may be a herd of goats, several cast-off Robogolems, or even the people you’re traveling with, but once you decide they’re part of your family? May the higher powers protect those transgressors who attempt to harm them.</p>",
      "abilities": "<ul><li>-2 Intelligence, Charisma, and Constitution</li><li>+3 Animal Handling Skill</li><li>+2 Pat hfinder Skill</li><li>+2 Nature’s Breath and Drain Life Spells</li><li>You can see t wice as far as most creatures</li><li>Your Mana recovers at twice the normal rate in a natural environment</li><li>The Shepherd may not use melee weapons other than Herding weapons (see p. 182)</li><li>Gain a friendl y Pet</li><li>Pet s in your Herd gain +2 DR</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+2 Intelligence, Charisma, and Constitution",
        "+3 Animal Handling Skill",
        "+2 Pat hfinder Skill",
        "+2 Nature’s Breath and Drain Life Spells",
        "You can see t wice as far as most creatures",
        "Your Mana recovers at twice the normal rate in a natural environment",
        "The Shepherd may not use melee weapons other than Herding weapons (see p. 182)",
        "Gain a friendl y Pet",
        "Pet s in your Herd gain +2 DR",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 2,
        "int": 2,
        "cha": 2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Animal Handling",
          "rank": 3
        },
        {
          "name": "Pathfinder",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Nature's Breath",
          "rank": 2
        },
        {
          "name": "Drain Life",
          "rank": 2
        }
      ],
      "identifier": "shepherd",
      "archetypes": [
        "archetype.druid"
      ],
      "tags": [
        "archetype.druid",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 2,
            "int": 2,
            "cha": 2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Animal Handling",
          "rank": 3,
          "ref": "id.skill.animal-handling"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pathfinder",
          "rank": 2,
          "ref": "id.skill.pathfinder"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Nature's Breath",
          "rank": 2,
          "ref": "id.spell.nature-s-breath"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Drain Life",
          "rank": 2,
          "ref": "id.spell.drain-life"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence, Charisma, and Constitution"
        },
        {
          "kind": "perk",
          "name": "+3 Animal Handling Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Pat hfinder Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Nature’s Breath and Drain Life Spells"
        },
        {
          "kind": "perk",
          "name": "You can see t wice as far as most creatures"
        },
        {
          "kind": "perk",
          "name": "Your Mana recovers at twice the normal rate in a natural environment"
        },
        {
          "kind": "perk",
          "name": "The Shepherd may not use melee weapons other than Herding weapons (see p. 182)"
        },
        {
          "kind": "perk",
          "name": "Gain a friendl y Pet"
        },
        {
          "kind": "perk",
          "name": "Pet s in your Herd gain +2 DR"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000025",
    "name": "Boring Ol’ Fighter",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>You’re not sure which Class to pick, so why not stick with the classic Boring Ol’ Fighter? No big decisions to make here—just run up and hit stuff. You’ve got decent fighting ability but really suck at magic and Spells. Oh, well. Those things run out anyway, and why bother counting and calculating when you can just throw hands or get stabby with the bad guys? Nothing is as sure and consistent as punching, kick - ing, bludgeoning, hacking, and slashing your way through Mobs.</p>",
      "abilities": "<ul><li>-2 Strength and Constitution</li><li>+5 in a weapon Skill of your choice</li><li>+3 Dodg e Skill</li><li>+2 to your c hoice of two of the following Skills: Aiming, Attack of Opportunity, Catcher, Shield Block, or Zone of Control Skills</li><li>Can Access any weapon training Guild. Upon arrival on each floor, you receive a coupon good for one free training at a weapon training Guild</li></ul>",
      "perks": [
        "+2 Strength and Constitution",
        "+5 in a weapon Skill of your choice",
        "+3 Dodg e Skill",
        "+2 to your c hoice of two of the following Skills: Aiming, Attack of Opportunity, Catcher, Shield Block, or Zone of Control Skills",
        "Can Access any weapon training Guild. Upon arrival on each floor, you receive a coupon good for one free training at a weapon training Guild"
      ],
      "stats": {
        "str": 2,
        "dex": 0,
        "con": 2,
        "int": 0,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Dodge",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "boring-ol-fighter",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 0,
            "con": 2,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 3,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 5,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill (Rank 5)"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "options",
          "options": [
            "Aiming",
            "Bludgeoning Weapon",
            "Bow",
            "Catcher",
            "Crossbow",
            "Dirty Fighting",
            "Dodge",
            "Edged Weapon",
            "Exotic Ranged Weapon",
            "Firearms",
            "Flail Weapon",
            "Heavy Armor",
            "Light Armor",
            "Medium Armor",
            "Mounted Combat",
            "Polearm Weapon",
            "Power Attack",
            "Pugilism",
            "Quick Draw",
            "Reach Weapon",
            "Shield Block",
            "Slings",
            "Small Blades",
            "Thrown Weapon",
            "Whips",
            "Wrasslin"
          ],
          "label": "Combat Skill Choice 1 (Rank 2)"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "options",
          "options": [
            "Aiming",
            "Bludgeoning Weapon",
            "Bow",
            "Catcher",
            "Crossbow",
            "Dirty Fighting",
            "Dodge",
            "Edged Weapon",
            "Exotic Ranged Weapon",
            "Firearms",
            "Flail Weapon",
            "Heavy Armor",
            "Light Armor",
            "Medium Armor",
            "Mounted Combat",
            "Polearm Weapon",
            "Power Attack",
            "Pugilism",
            "Quick Draw",
            "Reach Weapon",
            "Shield Block",
            "Slings",
            "Small Blades",
            "Thrown Weapon",
            "Whips",
            "Wrasslin"
          ],
          "label": "Combat Skill Choice 2 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+2 Strength and Constitution"
        },
        {
          "kind": "perk",
          "name": "+5 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+3 Dodg e Skill"
        },
        {
          "kind": "perk",
          "name": "+2 to your c hoice of two of the following Skills: Aiming, Attack of Opportunity, Catcher, Shield Block, or Zone of Control Skills"
        },
        {
          "kind": "perk",
          "name": "Can Access any weapon training Guild. Upon arrival on each floor, you receive a coupon good for one free training at a weapon training Guild"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000026",
    "name": "Pit Fighter",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>Although you might not wear furs and carry a spiked stick, you’re often mistaken for a Barbarian. Unlike those rage-filled Barbarians, though, Pit Fighters are much more cunning and adept at survival, especially in close-quarters combat. You’ll use anything at your disposal to defeat your opponent, including the pit itself.</p>",
      "abilities": "<ul><li>+3 Dexterity</li><li>-2 Intelligence</li><li>+1 Strength</li><li>+3 Att ack of Opportunity and Dirty Fighting Skills</li><li>+2 Dodg e and Improvised weapons Skills</li><li>+2 DR Buff</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Dexterity",
        "+2 Intelligence",
        "+1 Strength",
        "+3 Att ack of Opportunity and Dirty Fighting Skills",
        "+2 Dodg e and Improvised weapons Skills",
        "+2 DR Buff",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 1,
        "dex": 3,
        "con": 0,
        "int": 2,
        "cha": 0
      },
      "drBonus": 2,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Attack of Opportunity",
          "rank": 3
        },
        {
          "name": "Dirty Fighting",
          "rank": 3
        },
        {
          "name": "Dodge",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "pit-fighter",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": 3,
            "con": 0,
            "int": 2,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 2
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Attack of Opportunity",
          "rank": 3,
          "ref": "id.skill.attack-of-opportunity"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dirty Fighting",
          "rank": 3,
          "ref": "id.skill.dirty-fighting"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 2,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "perk",
          "name": "+3 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+1 Strength"
        },
        {
          "kind": "perk",
          "name": "+3 Att ack of Opportunity and Dirty Fighting Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Dodg e and Improvised weapons Skills"
        },
        {
          "kind": "perk",
          "name": "+2 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000027",
    "name": "Shotgun Messenger",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>Sometimes you gotta make sure someone gets the message, especially when it’s time for your pregnant daughter’s ex-boyfriend to show up at the courthouse and do the right thing. In those cases, the Shotgun Messenger guarantees that message lands the way it’s supposed to—one way or another.</p>",
      "abilities": "<ul><li>-2 Strength, Constitution, and Dexterity</li><li>−2 Charisma</li><li>+5 in a Ranged weapon Skill</li><li>+2 Aiming and Intimid ate Skills</li><li>+1 in all muscle-po wered movement-related Skills</li><li>Can Access any weapon training Guild. Each floor, you receive a coupon good for one free training at a weapon training Guild</li><li>Access to the Desperado Club</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+2 Strength, Constitution, and Dexterity",
        "−2 Charisma",
        "+5 in a Ranged weapon Skill",
        "+2 Aiming and Intimid ate Skills",
        "+1 in all muscle-po wered movement-related Skills",
        "Can Access any weapon training Guild. Each floor, you receive a coupon good for one free training at a weapon training Guild",
        "Access to the Desperado Club",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 2,
        "dex": 2,
        "con": 2,
        "int": 0,
        "cha": -2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Aiming",
          "rank": 2
        },
        {
          "name": "Intimidate",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "shotgun-messenger",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 2,
            "con": 2,
            "int": 0,
            "cha": -2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Aiming",
          "rank": 2,
          "ref": "id.skill.aiming"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Intimidate",
          "rank": 2,
          "ref": "id.skill.intimidate"
        },
        {
          "kind": "perk",
          "name": "+2 Strength, Constitution, and Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+5 in a Ranged weapon Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Aiming and Intimid ate Skills"
        },
        {
          "kind": "perk",
          "name": "+1 in all muscle-po wered movement-related Skills"
        },
        {
          "kind": "perk",
          "name": "Can Access any weapon training Guild. Each floor, you receive a coupon good for one free training at a weapon training Guild"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000028",
    "name": "Straight-to-DVD Action Hero",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>While A-Listers get to star in big-budget blockbuster movies, the Straight-to-DVD Action Hero barely makes enough to cover his rent and groceries. Forced to do his own stunts, the Straight-to-DVD Action Hero knows the basics of stunt work and weapons handling, though they’re also worse for wear due to the perpetually hazardous learning process. This is a Fighter subclass. Straight-to-DVD Action Heroes receive the following benefits:</p>",
      "abilities": "<ul><li>+3 Strength, Constitution, Dexterity, and Charisma</li><li>−2 Intelligence</li><li>+2 Unarmed Combat Skill</li><li>+1 Driv ing, Running, and Performance Skills</li><li>Take no damage from falling</li><li>+1 DR</li><li>The Manag er benefit</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Strength, Constitution, Dexterity, and Charisma",
        "−2 Intelligence",
        "+2 Unarmed Combat Skill",
        "+1 Driv ing, Running, and Performance Skills",
        "Take no damage from falling",
        "+1 DR",
        "The Manag er benefit",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 3,
        "dex": 3,
        "con": 3,
        "int": -2,
        "cha": 3
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Unarmed Combat",
          "rank": 2
        },
        {
          "name": "Driving",
          "rank": 1
        },
        {
          "name": "Running",
          "rank": 1
        },
        {
          "name": "Performance",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "straight-to-dvd-action-hero",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 3,
            "con": 3,
            "int": -2,
            "cha": 3
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 2,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Driving",
          "rank": 1,
          "ref": "id.skill.driving"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Running",
          "rank": 1,
          "ref": "id.skill.running"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 1,
          "ref": "id.skill.performance"
        },
        {
          "kind": "perk",
          "name": "+3 Strength, Constitution, Dexterity, and Charisma"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Unarmed Combat Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Driv ing, Running, and Performance Skills"
        },
        {
          "kind": "perk",
          "name": "Take no damage from falling"
        },
        {
          "kind": "perk",
          "name": "+1 DR"
        },
        {
          "kind": "perk",
          "name": "The Manag er benefit"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000029",
    "name": "Sword and Boarder",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>Some people excel at fighting, but you specialize in taking ships and buildings. Often the first one through the breach, you’re not afraid to charge ahead and clear the room while your allies filter in behind you. It’s not like you prefer to charge in mindlessly, but if you have to, you become a rampaging juggernaut who gets in, inflicts damage, and holds the line while others catch up. Using your massive shield to keep yourself safe, you prefer to use the terrain around you to pin your foes down. They may have the numbers, but even a war party of ravenous Crocodilians would struggle to break past you! Your only weakness is that you cannot do things in half-measures: once you’re sent in, you’re gonna need a plan to get out if you can’t hold your ground.</p>",
      "abilities": "<ul><li>-2 Strength, Constitution, and Dexterity</li><li>−2 Intelligence</li><li>+5 Shield Bloc k Skill</li><li>+3 in an Edg ed weapon Skill of your choice</li><li>+2 Att ack of Opportunity and Catcher Skills</li><li>Access to the Desperado Club</li></ul>",
      "perks": [
        "+2 Strength, Constitution, and Dexterity",
        "−2 Intelligence",
        "+5 Shield Bloc k Skill",
        "+3 in an Edg ed weapon Skill of your choice",
        "+2 Att ack of Opportunity and Catcher Skills",
        "Access to the Desperado Club"
      ],
      "stats": {
        "str": 2,
        "dex": 2,
        "con": 2,
        "int": -2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Shield Block",
          "rank": 5
        },
        {
          "name": "Attack of Opportunity",
          "rank": 2
        },
        {
          "name": "Catcher",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "sword-and-boarder",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 2,
            "con": 2,
            "int": -2,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Shield Block",
          "rank": 5,
          "ref": "id.skill.shield-block"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Attack of Opportunity",
          "rank": 2,
          "ref": "id.skill.attack-of-opportunity"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Catcher",
          "rank": 2,
          "ref": "id.skill.catcher"
        },
        {
          "kind": "perk",
          "name": "+2 Strength, Constitution, and Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+5 Shield Bloc k Skill"
        },
        {
          "kind": "perk",
          "name": "+3 in an Edg ed weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Att ack of Opportunity and Catcher Skills"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000030",
    "name": "Monster Truck Driver",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "Prerequisite: This limited Class is only available to crawlers who have Rank 5+ in the Driving Skill",
      "description": "<p>You’re the type who walks down a nursing home hallway and doesn’t veer from your path, no matter how many shoulder-checks you have to deliver to grannies recovering from carpal tunnel surgery. You specialize in loud entrances, poor decisions, and turning perfectly good terrain into a highlight reel. This Class uses speed and size as both offense and defense, whether on wheel or heel, to make the crawler into an excellent tank.</p>",
      "abilities": "<ul><li>+4 Constitution</li><li>-2 Dexterity</li><li>−2 Strength</li><li>−2 Intelligence</li><li>+3 Gear He ad, Driving, and Pathfinder Skills</li><li>While moving in combat, you have a Con Mod bonus in your Health Bar slots (only) equal to 1/10th of the Move value of your means of conveyance. If on foot, you must have spent a Move Action during the previous round to gain this bonus</li><li>You bolt across the room and slam through each entity in the way. [Rank = Floor Number] + Dex to hit, 1d12 Bludgeoning, 2d10+3ft Line, then you gain the Fatigued Debuff. Critical Fail on a natural 4 or less. Cooldown: 30 hours. Add 1d at Rank 5, 10, and 15. Rank only increases by Floor</li><li>Once per combat, roll 1d2 when you lose 2+ Health Bar slots. On a 1, the attacker loses 1 Health Bar slot</li><li>resistance to Force damage</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+4 Constitution",
        "+2 Dexterity",
        "−2 Strength",
        "−2 Intelligence",
        "+3 Gear He ad, Driving, and Pathfinder Skills",
        "While moving in combat, you have a Con Mod bonus in your Health Bar slots (only) equal to 1/10th of the Move value of your means of conveyance. If on foot, you must have spent a Move Action during the previous round to gain this bonus",
        "You bolt across the room and slam through each entity in the way. [Rank = Floor Number] + Dex to hit, 1d12 Bludgeoning, 2d10+3ft Line, then you gain the Fatigued Debuff. Critical Fail on a natural 4 or less. Cooldown: 30 hours. Add 1d at Rank 5, 10, and 15. Rank only increases by Floor",
        "Once per combat, roll 1d2 when you lose 2+ Health Bar slots. On a 1, the attacker loses 1 Health Bar slot",
        "resistance to Force damage",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": -2,
        "dex": 2,
        "con": 4,
        "int": -2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Gear Head",
          "rank": 3
        },
        {
          "name": "Driving",
          "rank": 3
        },
        {
          "name": "Pathfinder",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "monster-truck-driver",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": -2,
            "dex": 2,
            "con": 4,
            "int": -2,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Gear Head",
          "rank": 3,
          "ref": "id.skill.gear-head"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Driving",
          "rank": 3,
          "ref": "id.skill.driving"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pathfinder",
          "rank": 3,
          "ref": "id.skill.pathfinder"
        },
        {
          "kind": "perk",
          "name": "+4 Constitution"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Strength"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+3 Gear He ad, Driving, and Pathfinder Skills"
        },
        {
          "kind": "perk",
          "name": "While moving in combat, you have a Con Mod bonus in your Health Bar slots (only) equal to 1/10th of the Move value of your means of conveyance. If on foot, you must have spent a Move Action during the previous round to gain this bonus"
        },
        {
          "kind": "perk",
          "name": "You bolt across the room and slam through each entity in the way. [Rank = Floor Number] + Dex to hit, 1d12 Bludgeoning, 2d10+3ft Line, then you gain the Fatigued Debuff. Critical Fail on a natural 4 or less. Cooldown: 30 hours. Add 1d at Rank 5, 10, and 15. Rank only increases by Floor"
        },
        {
          "kind": "perk",
          "name": "Once per combat, roll 1d2 when you lose 2+ Health Bar slots. On a 1, the attacker loses 1 Health Bar slot"
        },
        {
          "kind": "perk",
          "name": "resistance to Force damage"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000031",
    "name": "Zulu Warrior",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter",
      "prerequisites": "",
      "description": "<p>You’ve trained from an early age under the tutelage of your elders, learning discipline and Endurance. While others might prefer the relative safety of firearms and other ranged weapons, you prefer getting up close and personal to give your enemies an old-fashioned beatdown. Using your swift mobility, you can quickly flank foes and catch them off guard.</p>",
      "abilities": "<ul><li>+3 Strength, Constitution, and Dexterity</li><li>+3 in one Melee We apon Skill of your choice</li><li>+2 Att ack of Opportunity, Endurance, and Running Skills</li><li>+1 DR</li><li>One weapon Skill can be raised to Rank 20</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Strength, Constitution, and Dexterity",
        "+3 in one Melee We apon Skill of your choice",
        "+2 Att ack of Opportunity, Endurance, and Running Skills",
        "+1 DR",
        "One weapon Skill can be raised to Rank 20",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 3,
        "dex": 3,
        "con": 3,
        "int": 0,
        "cha": 0
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Attack of Opportunity",
          "rank": 2
        },
        {
          "name": "Endurance",
          "rank": 2
        },
        {
          "name": "Running",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "zulu-warrior",
      "archetypes": [
        "archetype.fighter"
      ],
      "tags": [
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 3,
            "con": 3,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Attack of Opportunity",
          "rank": 2,
          "ref": "id.skill.attack-of-opportunity"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Endurance",
          "rank": 2,
          "ref": "id.skill.endurance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Running",
          "rank": 2,
          "ref": "id.skill.running"
        },
        {
          "kind": "perk",
          "name": "+3 Strength, Constitution, and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 in one Melee We apon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Att ack of Opportunity, Endurance, and Running Skills"
        },
        {
          "kind": "perk",
          "name": "+1 DR"
        },
        {
          "kind": "perk",
          "name": "One weapon Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000032",
    "name": "Boring Ol’ Mage",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage",
      "prerequisites": "",
      "description": "<p>Ever faithful to the old traditions, you, as an adherent of the Boring Ol’ Mage School (as their foes would describe them), strive to learn how to channel sheer arcane power at the cost of other Skills. Though some believe this equips the Boring Ol’ Mage Class with glass jaws, your rigorous focus on magic channels portions of your intellect into impressive effects. Several crawlers have attempted to waylay one of these Mages only to find they’re capable of channeling sudden destructive powers and manifesting Spells straight out of legend, often with the same showmanship and magical-sounding words found in movies, TV shows, and fantasy books.</p>",
      "abilities": "<ul><li>+5 Intelligence and Charisma</li><li>−2 Strength and Dexterity</li><li>+3 in a Fire Spell</li><li>+2 in one Force Spell and one Sonic Spell</li><li>+2 in two different Passive Spells</li><li>+2 Lore Skill</li><li>+1 Arcane Skill</li><li>−3 Ranks in all Dexterity Skills (to a minimum of 1 Rank if you have any Ranks)</li><li>−3 Ranks in all Strength Skills (to a minimum of 1 Rank if you have any Ranks)</li></ul>",
      "perks": [
        "+5 Intelligence and Charisma",
        "−2 Strength and Dexterity",
        "+3 in a Fire Spell",
        "+2 in one Force Spell and one Sonic Spell",
        "+2 in two different Passive Spells",
        "+2 Lore Skill",
        "+1 Arcane Skill",
        "−3 Ranks in all Dexterity Skills (to a minimum of 1 Rank if you have any Ranks)",
        "−3 Ranks in all Strength Skills (to a minimum of 1 Rank if you have any Ranks)"
      ],
      "stats": {
        "str": -2,
        "dex": -2,
        "con": 0,
        "int": 5,
        "cha": 5
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Lore",
          "rank": 2
        },
        {
          "name": "Arcane",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "boring-ol-mage",
      "archetypes": [
        "archetype.mage"
      ],
      "tags": [
        "archetype.mage",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": -2,
            "dex": -2,
            "con": 0,
            "int": 5,
            "cha": 5
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lore",
          "rank": 2,
          "ref": "id.skill.lore"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Arcane",
          "rank": 1,
          "ref": "id.skill.arcane"
        },
        {
          "kind": "spell",
          "mode": "choice",
          "count": 1,
          "rank": 3,
          "filter": {
            "all": [
              "kind.spell",
              "element.fire"
            ]
          },
          "label": "1 Fire Spell"
        },
        {
          "kind": "spell",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "filter": {
            "all": [
              "kind.spell",
              "element.force"
            ]
          },
          "label": "1 Force Spell"
        },
        {
          "kind": "spell",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "filter": {
            "all": [
              "kind.spell",
              "element.sonic"
            ]
          },
          "label": "1 Sonic Spell"
        },
        {
          "kind": "spell",
          "mode": "choice",
          "count": 2,
          "rank": 2,
          "distinct": true,
          "filter": {
            "all": [
              "kind.spell",
              "action.passive"
            ]
          },
          "label": "2 Different Passive Spells"
        },
        {
          "kind": "skillModifier",
          "filter": {
            "all": [
              "kind.skill",
              "stat.dex"
            ]
          },
          "rankDelta": -3,
          "floor": 1,
          "onlyIfOwned": true
        },
        {
          "kind": "skillModifier",
          "filter": {
            "all": [
              "kind.skill",
              "stat.str"
            ]
          },
          "rankDelta": -3,
          "floor": 1,
          "onlyIfOwned": true
        },
        {
          "kind": "perk",
          "name": "+5 Intelligence and Charisma"
        },
        {
          "kind": "perk",
          "name": "−2 Strength and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 in a Fire Spell"
        },
        {
          "kind": "perk",
          "name": "+2 in one Force Spell and one Sonic Spell"
        },
        {
          "kind": "perk",
          "name": "+2 in two different Passive Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Lore Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Arcane Skill"
        },
        {
          "kind": "perk",
          "name": "−3 Ranks in all Dexterity Skills (to a minimum of 1 Rank if you have any Ranks)"
        },
        {
          "kind": "perk",
          "name": "−3 Ranks in all Strength Skills (to a minimum of 1 Rank if you have any Ranks)"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000033",
    "name": "Blizzardmancer",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage",
      "prerequisites": "",
      "description": "<p>The Blizzardmancer represents the first step on a journey most Mages are too sensible—or too cold-averse—to attempt. While your peers are out there hurling fireballs and lightning bolts, you’ve chosen the deeply inconvenient powers of water and ice. You don’t explode things. You preserve them. In a block of ice. Yeah, that’ll teach ’em! And while you’re on your way back to your dorm to cry frigid tears into your pillow at night, don’t forget to drop some ice cubes in my drink.</p>",
      "abilities": "<ul><li>+4 Intelligence</li><li>+3 Dexterity</li><li>−2 Strength</li><li>+4 Ice Blas t and Frost Scar Spells</li><li>+2 Aiming Skill</li><li>resistance to Ice damage</li><li>You can use t he Aiming Skill for single-target Ice Spells</li></ul>",
      "perks": [
        "+4 Intelligence",
        "+3 Dexterity",
        "−2 Strength",
        "+4 Ice Blas t and Frost Scar Spells",
        "+2 Aiming Skill",
        "resistance to Ice damage",
        "You can use t he Aiming Skill for single-target Ice Spells"
      ],
      "stats": {
        "str": -2,
        "dex": 3,
        "con": 0,
        "int": 4,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Aiming",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Ice Blast",
          "rank": 4
        },
        {
          "name": "Frost Scar",
          "rank": 4
        }
      ],
      "identifier": "blizzardmancer",
      "archetypes": [
        "archetype.mage"
      ],
      "tags": [
        "archetype.mage",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": -2,
            "dex": 3,
            "con": 0,
            "int": 4,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Aiming",
          "rank": 2,
          "ref": "id.skill.aiming"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Ice Blast",
          "rank": 4,
          "ref": "id.spell.ice-blast"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Frost Scar",
          "rank": 4,
          "ref": "id.spell.frost-scar"
        },
        {
          "kind": "perk",
          "name": "+4 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+3 Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Strength"
        },
        {
          "kind": "perk",
          "name": "+4 Ice Blas t and Frost Scar Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Aiming Skill"
        },
        {
          "kind": "perk",
          "name": "resistance to Ice damage"
        },
        {
          "kind": "perk",
          "name": "You can use t he Aiming Skill for single-target Ice Spells"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000034",
    "name": "Crisper",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage",
      "prerequisites": "",
      "description": "<p>To say you’re hot is putting it mildly: You’re literally on fire! You can generate flames out of nothing to protect yourself and absolutely roast others. Unlike other fire users, you can modulate how much heat you’re putting out, meaning you can do anything from cooking a quick meal to pelting your opponent with fiery pine cones. The Crisper can also add additional effects to their fire abilities. You can burn your opponents, sear them, scorch their armor, and even extend healing magic through your flames to heal others… as long as they don’t mind a few blisters in the process. By laying on your hands, you can also use your abilities to burn out harmful magics and effects hurting your allies. Crispers don’t excel in humid or wet environments, and despite their abilities, water tends to reduce their effectiveness. But if you need a fire user who knows the sheer versatility of one of the primal elements, the Crisper makes for a great support Class who can keep things warm and friendly among friends and fiery and destructive toward foes.</p>",
      "abilities": "<ul><li>+3 Intelligence</li><li>-2 Dexterity</li><li>−2 Constitution</li><li>+3 Wall of Fire and Fire Fingers Spells</li><li>+2 Fireball and Wilbur’s Slow-Build Fireblast Spells</li><li>+2 Lore Skill</li><li>resistance to Fire damage</li><li>No DR ag ainst Ice or water-based damage</li></ul>",
      "perks": [
        "+3 Intelligence",
        "+2 Dexterity",
        "−2 Constitution",
        "+3 Wall of Fire and Fire Fingers Spells",
        "+2 Fireball and Wilbur’s Slow-Build Fireblast Spells",
        "+2 Lore Skill",
        "resistance to Fire damage",
        "No DR ag ainst Ice or water-based damage"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": -2,
        "int": 3,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Lore",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Wall of Fire",
          "rank": 3
        },
        {
          "name": "Fire Fingers",
          "rank": 3
        },
        {
          "name": "Fireball",
          "rank": 2
        },
        {
          "name": "Wilbur's Slow-Build Fireblast",
          "rank": 2
        }
      ],
      "identifier": "crisper",
      "archetypes": [
        "archetype.mage"
      ],
      "tags": [
        "archetype.mage",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": -2,
            "int": 3,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lore",
          "rank": 2,
          "ref": "id.skill.lore"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Wall of Fire",
          "rank": 3,
          "ref": "id.spell.wall-of-fire"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Fire Fingers",
          "rank": 3,
          "ref": "id.spell.fire-fingers"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Fireball",
          "rank": 2,
          "ref": "id.spell.fireball"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Wilbur's Slow-Build Fireblast",
          "rank": 2,
          "ref": "id.spell.wilbur-s-slow-build-fireblast"
        },
        {
          "kind": "perk",
          "name": "+3 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Constitution"
        },
        {
          "kind": "perk",
          "name": "+3 Wall of Fire and Fire Fingers Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Fireball and Wilbur’s Slow-Build Fireblast Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Lore Skill"
        },
        {
          "kind": "perk",
          "name": "resistance to Fire damage"
        },
        {
          "kind": "perk",
          "name": "No DR ag ainst Ice or water-based damage"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000035",
    "name": "Fire Spiritualist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Mage",
      "prerequisites": "",
      "description": "<p>Every party wants that healer who will wade into battle and pluck them from the brink of death. Well, that’s you! You have the burning desire to help others. I mean literally—your body glows, practically smoldering with powerful healing energies that can help your allies and harm your enemies. Just be careful not to get too close to any out-of-control water sources as they are bound to douse your healing flames!</p>",
      "abilities": "<ul><li>-2 Intelligence and Charisma</li><li>+2 Holy Aur a and Hot Stuff Aura Spells</li><li>+2 Heal Others and Intimate Touches Spells</li><li>Heal Others Spell can be raised to 20</li><li>Ether eal Hug: Once per day for one scene, you can grant your party +1 DR, Rank 4 Regeneration (as per the Skill), +1 to hit on weapon and Spell Skill Checks, and add 1d4 bonus when they deal damage</li><li>vulnerable to Ice damage</li></ul>",
      "perks": [
        "+2 Intelligence and Charisma",
        "+2 Holy Aur a and Hot Stuff Aura Spells",
        "+2 Heal Others and Intimate Touches Spells",
        "Heal Others Spell can be raised to 20",
        "Ether eal Hug: Once per day for one scene, you can grant your party +1 DR, Rank 4 Regeneration (as per the Skill), +1 to hit on weapon and Spell Skill Checks, and add 1d4 bonus when they deal damage",
        "vulnerable to Ice damage"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 2,
        "cha": 2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [],
      "spells": [
        {
          "name": "Holy Aura",
          "rank": 2
        },
        {
          "name": "Hot Stuff Aura",
          "rank": 2
        },
        {
          "name": "Heal Others",
          "rank": 2
        },
        {
          "name": "Intimate Touches",
          "rank": 2
        }
      ],
      "identifier": "fire-spiritualist",
      "archetypes": [
        "archetype.bard",
        "archetype.mage"
      ],
      "tags": [
        "archetype.bard",
        "archetype.mage",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 2,
            "cha": 2
          }
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Holy Aura",
          "rank": 2,
          "ref": "id.spell.holy-aura"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Hot Stuff Aura",
          "rank": 2,
          "ref": "id.spell.hot-stuff-aura"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 2,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Intimate Touches",
          "rank": 2,
          "ref": "id.spell.intimate-touches"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence and Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 Holy Aur a and Hot Stuff Aura Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Heal Others and Intimate Touches Spells"
        },
        {
          "kind": "perk",
          "name": "Heal Others Spell can be raised to 20"
        },
        {
          "kind": "perk",
          "name": "Ether eal Hug: Once per day for one scene, you can grant your party +1 DR, Rank 4 Regeneration (as per the Skill), +1 to hit on weapon and Spell Skill Checks, and add 1d4 bonus when they deal damage"
        },
        {
          "kind": "perk",
          "name": "vulnerable to Ice damage"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000036",
    "name": "Forsaken Aerialist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage",
      "prerequisites": "",
      "description": "<p>Some Mages use powerful magic to blast and destroy with all the subtlety of a runaway locomotive or a scorching fireball. But not you. You eschew the spotlight and instead seek out more elegant and discreet ways to take on your foes. You have learned how to bypass certain magical limitations to make even the simplest and weakest of spells into something capable of slowly and steadily taking down the most powerful of creatures, all while they are completely unaware of their plight. That frog in the boiling pot never knew what hit him!</p>",
      "abilities": "<ul><li>+5 Intelligence</li><li>−2 Charisma</li><li>+3 Drain Life and Soul Collector Spells</li><li>+1 Alchemy , Infusion, and Tactics Skills</li><li>Double the duration of your Rank 5 and lower Spells that have a duration</li><li>Your Spells c an be applied to a creature without it realizing it is under a Spell effect</li></ul>",
      "perks": [
        "+5 Intelligence",
        "−2 Charisma",
        "+3 Drain Life and Soul Collector Spells",
        "+1 Alchemy , Infusion, and Tactics Skills",
        "Double the duration of your Rank 5 and lower Spells that have a duration",
        "Your Spells c an be applied to a creature without it realizing it is under a Spell effect"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 5,
        "cha": -2
      },
      "drBonus": 3,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Alchemy",
          "rank": 1
        },
        {
          "name": "Infusion",
          "rank": 1
        },
        {
          "name": "Tactics",
          "rank": 1
        }
      ],
      "spells": [
        {
          "name": "Drain Life",
          "rank": 3
        },
        {
          "name": "Soul Collector",
          "rank": 3
        }
      ],
      "identifier": "forsaken-aerialist",
      "archetypes": [
        "archetype.mage"
      ],
      "tags": [
        "archetype.mage",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 5,
            "cha": -2
          }
        },
        {
          "kind": "dr",
          "value": 3
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Alchemy",
          "rank": 1,
          "ref": "id.skill.alchemy"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Infusion",
          "rank": 1,
          "ref": "id.skill.infusion"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Tactics",
          "rank": 1,
          "ref": "id.skill.tactics"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Drain Life",
          "rank": 3,
          "ref": "id.spell.drain-life"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Soul Collector",
          "rank": 3,
          "ref": "id.spell.soul-collector"
        },
        {
          "kind": "perk",
          "name": "+5 Intelligence"
        },
        {
          "kind": "perk",
          "name": "−2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Drain Life and Soul Collector Spells"
        },
        {
          "kind": "perk",
          "name": "+1 Alchemy , Infusion, and Tactics Skills"
        },
        {
          "kind": "perk",
          "name": "Double the duration of your Rank 5 and lower Spells that have a duration"
        },
        {
          "kind": "perk",
          "name": "Your Spells c an be applied to a creature without it realizing it is under a Spell effect"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000037",
    "name": "Necromancer",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage, Necromancer",
      "prerequisites": "",
      "description": "<p>You’re a Mage that specializes in manipulating life forces, sucking the life out of the living to raise the dead to do your bidding. Ever wonder why there are so many zombie apocalypse scenarios out there? It’s just Necromancers practicing their craft. Sure, the undead might be unruly and difficult to control at times, but they’re cheap labor, and there’s no threat of them unionizing—not intentionally, anyway.</p>",
      "abilities": "<ul><li>-2 Intelligence and Dexterity</li><li>−2 Constitution and Charisma</li><li>+4 Soul Collec tor and Rise, Dead Minion! Spells</li><li>+2 Drain Life and Second Chance Spells</li><li>Once per res t, you can ask the corpse of a dead creature a number of questions equal to your Int. The creature answers as truthfully as it can based on what it knew in life</li><li>Whenev er you kill an undead Mob, you heal 1 Health Bar, up to 5 Health Bar per combat</li></ul>",
      "perks": [
        "+2 Intelligence and Dexterity",
        "−2 Constitution and Charisma",
        "+4 Soul Collec tor and Rise, Dead Minion! Spells",
        "+2 Drain Life and Second Chance Spells",
        "Once per res t, you can ask the corpse of a dead creature a number of questions equal to your Int. The creature answers as truthfully as it can based on what it knew in life",
        "Whenev er you kill an undead Mob, you heal 1 Health Bar, up to 5 Health Bar per combat"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": -2,
        "int": 2,
        "cha": -2
      },
      "drBonus": 2,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [],
      "spells": [
        {
          "name": "Soul Collector",
          "rank": 4
        },
        {
          "name": "Rise, Dead Minion!",
          "rank": 4
        },
        {
          "name": "Drain Life",
          "rank": 2
        },
        {
          "name": "Second Chance",
          "rank": 2
        }
      ],
      "identifier": "necromancer",
      "archetypes": [
        "archetype.mage",
        "archetype.necromancer"
      ],
      "tags": [
        "archetype.mage",
        "archetype.necromancer",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": -2,
            "int": 2,
            "cha": -2
          }
        },
        {
          "kind": "dr",
          "value": 2
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Soul Collector",
          "rank": 4,
          "ref": "id.spell.soul-collector"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Rise, Dead Minion!",
          "rank": 4,
          "ref": "id.spell.rise-dead-minion"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Drain Life",
          "rank": 2,
          "ref": "id.spell.drain-life"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Second Chance",
          "rank": 2,
          "ref": "id.spell.second-chance"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence and Dexterity"
        },
        {
          "kind": "perk",
          "name": "−2 Constitution and Charisma"
        },
        {
          "kind": "perk",
          "name": "+4 Soul Collec tor and Rise, Dead Minion! Spells"
        },
        {
          "kind": "perk",
          "name": "+2 Drain Life and Second Chance Spells"
        },
        {
          "kind": "perk",
          "name": "Once per res t, you can ask the corpse of a dead creature a number of questions equal to your Int. The creature answers as truthfully as it can based on what it knew in life"
        },
        {
          "kind": "perk",
          "name": "Whenev er you kill an undead Mob, you heal 1 Health Bar, up to 5 Health Bar per combat"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000038",
    "name": "Boring Ol’ Monk",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Monk",
      "prerequisites": "",
      "description": "<p>Often pugilists and unarmed combatants, Monks aren’t really all that devout or faithful: they’re just a boring ol’ Class from some dated kung fu movie or an archaic video game. You’re not like those Earth-based Monks who hang out in their monasteries chanting all the time, though you might want to be like those Shaolin Monks—they’re pretty fast and badass.</p>",
      "abilities": "<ul><li>+3 Constitution and Dexterity</li><li>+1 Strength</li><li>+3 Unarmed Combat Skill</li><li>+1 Foot Soldier, Iron Punch, Powerful Strike, Pugilism, and Smush Skills</li><li>+1 in Dexterity-based weapon Skills</li><li>Unarmed Combat Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Constitution and Dexterity",
        "+1 Strength",
        "+3 Unarmed Combat Skill",
        "+1 Foot Soldier, Iron Punch, Powerful Strike, Pugilism, and Smush Skills",
        "+1 in Dexterity-based weapon Skills",
        "Unarmed Combat Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 1,
        "dex": 3,
        "con": 3,
        "int": 0,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Unarmed Combat",
          "rank": 3
        },
        {
          "name": "Foot Soldier",
          "rank": 1
        },
        {
          "name": "Iron Punch",
          "rank": 1
        },
        {
          "name": "Powerful Strike",
          "rank": 1
        },
        {
          "name": "Pugilism",
          "rank": 1
        },
        {
          "name": "Smush",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "boring-ol-monk",
      "archetypes": [
        "archetype.monk"
      ],
      "tags": [
        "archetype.monk",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": 3,
            "con": 3,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 3,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Foot Soldier",
          "rank": 1,
          "ref": "id.skill.foot-soldier"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Iron Punch",
          "rank": 1,
          "ref": "id.skill.iron-punch"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Powerful Strike",
          "rank": 1,
          "ref": "id.skill.powerful-strike"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pugilism",
          "rank": 1,
          "ref": "id.skill.pugilism"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Smush",
          "rank": 1,
          "ref": "id.skill.smush"
        },
        {
          "kind": "perk",
          "name": "+3 Constitution and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+1 Strength"
        },
        {
          "kind": "perk",
          "name": "+3 Unarmed Combat Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Foot Soldier, Iron Punch, Powerful Strike, Pugilism, and Smush Skills"
        },
        {
          "kind": "perk",
          "name": "+1 in Dexterity-based weapon Skills"
        },
        {
          "kind": "perk",
          "name": "Unarmed Combat Skill can be raised to Rank 20"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000039",
    "name": "Elemental Monk",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Mage, Monk",
      "prerequisites": "",
      "description": "<p>You have focused your monastic training on mastering the elements. It’s not that you wanted to, but your monastery was too cheap to provide proper weapons or training facilities. So instead, you learned to work with what you had, and harnessed earth, wind, water, and fire in subtle and not-so-subtle ways. Your understanding of the elements enables you to see how they both complement and work against each other, revealing the weaknesses of elemental beings and giving you knowledge of how best to defeat them.</p>",
      "abilities": "<ul><li>-2 Intelligence and Dexterity</li><li>+3 Unarmed Combat Skill</li><li>+1 Dirt Clod, Fir e Fingers, and Frost Scar Spells</li><li>+1 in all Spells wit h the Electric, Fire, and Ice damage types</li><li>Advantage when attacking elemental creatures</li><li>The ability to breathe underwater</li><li>The ability to burrow</li><li>The ability to fly</li></ul>",
      "perks": [
        "+2 Intelligence and Dexterity",
        "+3 Unarmed Combat Skill",
        "+1 Dirt Clod, Fir e Fingers, and Frost Scar Spells",
        "+1 in all Spells wit h the Electric, Fire, and Ice damage types",
        "Advantage when attacking elemental creatures",
        "The ability to breathe underwater",
        "The ability to burrow",
        "The ability to fly"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 0,
        "int": 2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 20,
        "burrow": 20
      },
      "skills": [
        {
          "name": "Unarmed Combat",
          "rank": 3
        }
      ],
      "spells": [
        {
          "name": "Dirt Clod",
          "rank": 1
        },
        {
          "name": "Fire Fingers",
          "rank": 1
        },
        {
          "name": "Frost Scar",
          "rank": 1
        },
        {
          "name": "all",
          "rank": 1
        }
      ],
      "identifier": "elemental-monk",
      "archetypes": [
        "archetype.mage",
        "archetype.monk"
      ],
      "tags": [
        "archetype.mage",
        "archetype.monk",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": 0,
            "int": 2,
            "cha": 0
          }
        },
        {
          "kind": "movement",
          "movement": {
            "walkDelta": 0,
            "climb": 0,
            "swim": 0,
            "fly": 20,
            "burrow": 20
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 3,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Dirt Clod",
          "rank": 1,
          "ref": "id.spell.dirt-clod"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Fire Fingers",
          "rank": 1,
          "ref": "id.spell.fire-fingers"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Frost Scar",
          "rank": 1,
          "ref": "id.spell.frost-scar"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "all",
          "rank": 1,
          "ref": "id.spell.all"
        },
        {
          "kind": "perk",
          "name": "+2 Intelligence and Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 Unarmed Combat Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Dirt Clod, Fir e Fingers, and Frost Scar Spells"
        },
        {
          "kind": "perk",
          "name": "+1 in all Spells wit h the Electric, Fire, and Ice damage types"
        },
        {
          "kind": "perk",
          "name": "Advantage when attacking elemental creatures"
        },
        {
          "kind": "perk",
          "name": "The ability to breathe underwater"
        },
        {
          "kind": "perk",
          "name": "The ability to burrow"
        },
        {
          "kind": "perk",
          "name": "The ability to fly"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000040",
    "name": "Prizefighter",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Monk",
      "prerequisites": "Prerequisite: This limited Class is only available to crawlers who have Rank 5+ in the Pugilism Skill",
      "description": "<p>Just like the galaxy loves a big, multi-floor battle royale death Dungeon, they love watching two creatures beat the snot out of each other. Some do it for money, some do it for glory, but they all turn their faces into raw pulp for the crowd. The creatures in this audience don’t care who is fighting who, as long as one of them ends up a crumpled, bloody heap on the mat before the night is done.</p>",
      "abilities": "<ul><li>+5 Constitution</li><li>-2 Strength</li><li>−2 Intelligence and Charisma</li><li>+5 Pugilism and Iron Punc h Skills</li><li>1 × Floor Number gold for every Mob you kill with a Pugilism or Unarmed combat Skill attack</li><li>When you kill a foe with a Pugilism or Unarmed combat Skill attack, +1 popularity</li><li>Pugilism Skill c an be raised to Rank 20</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+5 Constitution",
        "+2 Strength",
        "−2 Intelligence and Charisma",
        "+5 Pugilism and Iron Punc h Skills",
        "1 × Floor Number gold for every Mob you kill with a Pugilism or Unarmed combat Skill attack",
        "When you kill a foe with a Pugilism or Unarmed combat Skill attack, +1 popularity",
        "Pugilism Skill c an be raised to Rank 20",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 2,
        "dex": 0,
        "con": 5,
        "int": -2,
        "cha": -2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Pugilism",
          "rank": 5
        },
        {
          "name": "Iron Punch",
          "rank": 5
        }
      ],
      "spells": [],
      "identifier": "prizefighter",
      "archetypes": [
        "archetype.bard",
        "archetype.monk"
      ],
      "tags": [
        "archetype.bard",
        "archetype.monk",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 0,
            "con": 5,
            "int": -2,
            "cha": -2
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pugilism",
          "rank": 5,
          "ref": "id.skill.pugilism"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Iron Punch",
          "rank": 5,
          "ref": "id.skill.iron-punch"
        },
        {
          "kind": "perk",
          "name": "+5 Constitution"
        },
        {
          "kind": "perk",
          "name": "+2 Strength"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence and Charisma"
        },
        {
          "kind": "perk",
          "name": "+5 Pugilism and Iron Punc h Skills"
        },
        {
          "kind": "perk",
          "name": "1 × Floor Number gold for every Mob you kill with a Pugilism or Unarmed combat Skill attack"
        },
        {
          "kind": "perk",
          "name": "When you kill a foe with a Pugilism or Unarmed combat Skill attack, +1 popularity"
        },
        {
          "kind": "perk",
          "name": "Pugilism Skill c an be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000041",
    "name": "Spirit Healer",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Druid, Monk",
      "prerequisites": "",
      "description": "<p>Rather than focusing your knowledge of the body to harm, you use it to heal yourself and others through manipulating pressure points, lymph nodes, crystals, and any other health craze that was active when the World Dungeon opened. When pressured, you can also unleash your knowledge in practically painful ways on those who threaten you or your patients.</p>",
      "abilities": "<ul><li>+3 Strength and Constitution</li><li>+1 Dexterity</li><li>+3 Drain Life Spell</li><li>+3 Smush Skill</li><li>+2 Heal Others and Heal Self Spells</li><li>Your healing Skills and Spells heal 1 additional Health Bar slot when targeting a single individual</li><li>Heal Others Spell can be raised to Rank 20</li><li>Access to Club Vanquisher</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+3 Strength and Constitution",
        "+1 Dexterity",
        "+3 Drain Life Spell",
        "+3 Smush Skill",
        "+2 Heal Others and Heal Self Spells",
        "Your healing Skills and Spells heal 1 additional Health Bar slot when targeting a single individual",
        "Heal Others Spell can be raised to Rank 20",
        "Access to Club Vanquisher",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 3,
        "dex": 1,
        "con": 3,
        "int": 0,
        "cha": 0
      },
      "drBonus": 3,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Smush",
          "rank": 3
        }
      ],
      "spells": [
        {
          "name": "Drain Life",
          "rank": 3
        },
        {
          "name": "Heal Others",
          "rank": 2
        },
        {
          "name": "Heal Self",
          "rank": 2
        }
      ],
      "identifier": "spirit-healer",
      "archetypes": [
        "archetype.druid",
        "archetype.monk"
      ],
      "tags": [
        "archetype.druid",
        "archetype.monk",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 1,
            "con": 3,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 3
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Smush",
          "rank": 3,
          "ref": "id.skill.smush"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Drain Life",
          "rank": 3,
          "ref": "id.spell.drain-life"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 2,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Self",
          "rank": 2,
          "ref": "id.spell.heal-self"
        },
        {
          "kind": "perk",
          "name": "+3 Strength and Constitution"
        },
        {
          "kind": "perk",
          "name": "+1 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 Drain Life Spell"
        },
        {
          "kind": "perk",
          "name": "+3 Smush Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Heal Others and Heal Self Spells"
        },
        {
          "kind": "perk",
          "name": "Your healing Skills and Spells heal 1 additional Health Bar slot when targeting a single individual"
        },
        {
          "kind": "perk",
          "name": "Heal Others Spell can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000042",
    "name": "Street Monk",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter, Monk",
      "prerequisites": "",
      "description": "<p>You grew up on the streets, scraping by every day to survive. It was there that your gritty, unorthodox fighting style germinated, then took root and blossomed into a beautiful flower with petals shaped like kicking ass. You thrive in close-quarters fighting and can readily use the terrain around you for both offense and defense.</p>",
      "abilities": "<ul><li>-2 Dexterity</li><li>+1 Strength and Charisma</li><li>+2 Dirty Fighting Skill</li><li>+2 Str eetwise and Unarmed combat Skills</li><li>+1 Pugilism Skill</li><li>+1 in Dexterity-based weapon Skills</li><li>+3 DR Buff</li><li>Silver Earth Box, with guaranteed Earth Hobby Skill Potion</li></ul>",
      "perks": [
        "+2 Dexterity",
        "+1 Strength and Charisma",
        "+2 Dirty Fighting Skill",
        "+2 Str eetwise and Unarmed combat Skills",
        "+1 Pugilism Skill",
        "+1 in Dexterity-based weapon Skills",
        "+3 DR Buff",
        "Silver Earth Box, with guaranteed Earth Hobby Skill Potion"
      ],
      "stats": {
        "str": 1,
        "dex": 2,
        "con": 0,
        "int": 0,
        "cha": 1
      },
      "drBonus": 3,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Dirty Fighting",
          "rank": 2
        },
        {
          "name": "Streetwise",
          "rank": 2
        },
        {
          "name": "Unarmed Combat",
          "rank": 2
        },
        {
          "name": "Pugilism",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "street-monk",
      "archetypes": [
        "archetype.fighter",
        "archetype.monk"
      ],
      "tags": [
        "archetype.fighter",
        "archetype.monk",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": 2,
            "con": 0,
            "int": 0,
            "cha": 1
          }
        },
        {
          "kind": "dr",
          "value": 3
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dirty Fighting",
          "rank": 2,
          "ref": "id.skill.dirty-fighting"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Streetwise",
          "rank": 2,
          "ref": "id.skill.streetwise"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 2,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Pugilism",
          "rank": 1,
          "ref": "id.skill.pugilism"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+1 Strength and Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 Dirty Fighting Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Str eetwise and Unarmed combat Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Pugilism Skill"
        },
        {
          "kind": "perk",
          "name": "+1 in Dexterity-based weapon Skills"
        },
        {
          "kind": "perk",
          "name": "+3 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Skill Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000043",
    "name": "Boring Ol’ Paladin",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Paladin",
      "prerequisites": "",
      "description": "<p>You can call upon powerful spirits (the ethereal kind, not the drinking kind) for aid as you provide guidance and protection for others, and you manage to do it with color and flair!</p>",
      "abilities": "<ul><li>-2 Charisma</li><li>+1 Charisma</li><li>+3 Protective Shell, Heal Others, and Holy Aura Spells</li><li>+3 in a weapon Skill of your choice</li><li>+2 Cat cher or Shield Block Skills</li><li>Access to Club Vanquisher</li><li>Must worship a deity</li><li>You cannot choose this Class if you have Access to the Desperado Club</li></ul>",
      "perks": [
        "+2 Charisma",
        "+1 Charisma",
        "+3 Protective Shell, Heal Others, and Holy Aura Spells",
        "+3 in a weapon Skill of your choice",
        "+2 Cat cher or Shield Block Skills",
        "Access to Club Vanquisher",
        "Must worship a deity",
        "You cannot choose this Class if you have Access to the Desperado Club"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 0,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [],
      "spells": [
        {
          "name": "Protective Shell",
          "rank": 3
        },
        {
          "name": "Heal Others",
          "rank": 3
        },
        {
          "name": "Holy Aura",
          "rank": 3
        }
      ],
      "identifier": "boring-ol-paladin",
      "archetypes": [
        "archetype.paladin"
      ],
      "tags": [
        "archetype.paladin",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 0,
            "cha": 3
          }
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Protective Shell",
          "rank": 3,
          "ref": "id.spell.protective-shell"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 3,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Holy Aura",
          "rank": 3,
          "ref": "id.spell.holy-aura"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 3,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill (Rank 3)"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "options",
          "options": [
            "Catcher",
            "Shield Block"
          ],
          "label": "Catcher or Shield Block (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+1 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Protective Shell, Heal Others, and Holy Aura Spells"
        },
        {
          "kind": "perk",
          "name": "+3 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Cat cher or Shield Block Skills"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity"
        },
        {
          "kind": "perk",
          "name": "You cannot choose this Class if you have Access to the Desperado Club"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000044",
    "name": "Cavalier",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Fighter, Paladin",
      "prerequisites": "",
      "description": "<p>This classic mounted knight type is bound by a code the Dungeon doesn’t fully understand. They’re a frontline duelist optimized for momentum, spectacle, and catastrophic commitment. Many mounts are fragile, but yours is a trained warhorse (or similar), and its armor (called “barding” if it’s not natural armor) should help keep it alive for a while. The code you follow is up to you. You might be the protector of the downtrodden, of the frail, of lower-Level crawlers, of an opposite (or the same?) sex, of pets, or the badly injured. Or you might sell your sword to the highest bidder so you can make some sweet coin and live the good life—what little of it you have left down here. Who am I to judge?</p>",
      "abilities": "<ul><li>-2 Strength and Constitution</li><li>+2 Cat cher, Riding, and Lance Skills</li><li>+2 Shield and Smite Spells</li><li>When protecting someone under your code by using Catcher, gain the benefit of Playing to the Cameras (no Disadvantage, as this is a Passive Skill). This counts as your “once per session” usage</li><li>Gain a bonded Mount one siz e bigger than you with Move 40, barding with DR 10, a Trample attack, and a pet carrier for it</li><li>When you or your Mount is the target of an Attack, your fancy riding allows you to redirect an attack at your Mount to yourself or vice versa</li><li>Access to Club Vanquisher</li><li>Must worship a deity</li></ul>",
      "perks": [
        "+2 Strength and Constitution",
        "+2 Cat cher, Riding, and Lance Skills",
        "+2 Shield and Smite Spells",
        "When protecting someone under your code by using Catcher, gain the benefit of Playing to the Cameras (no Disadvantage, as this is a Passive Skill). This counts as your “once per session” usage",
        "Gain a bonded Mount one siz e bigger than you with Move 40, barding with DR 10, a Trample attack, and a pet carrier for it",
        "When you or your Mount is the target of an Attack, your fancy riding allows you to redirect an attack at your Mount to yourself or vice versa",
        "Access to Club Vanquisher",
        "Must worship a deity"
      ],
      "stats": {
        "str": 2,
        "dex": 0,
        "con": 2,
        "int": 0,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Catcher",
          "rank": 2
        },
        {
          "name": "Riding",
          "rank": 2
        },
        {
          "name": "Lance",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Shield",
          "rank": 2
        },
        {
          "name": "Smite",
          "rank": 2
        }
      ],
      "identifier": "cavalier",
      "archetypes": [
        "archetype.fighter",
        "archetype.paladin"
      ],
      "tags": [
        "archetype.fighter",
        "archetype.paladin",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 2,
            "dex": 0,
            "con": 2,
            "int": 0,
            "cha": 0
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Catcher",
          "rank": 2,
          "ref": "id.skill.catcher"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Riding",
          "rank": 2,
          "ref": "id.skill.riding"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lance",
          "rank": 2,
          "ref": "id.skill.lance"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Shield",
          "rank": 2,
          "ref": "id.spell.shield"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Smite",
          "rank": 2,
          "ref": "id.spell.smite"
        },
        {
          "kind": "perk",
          "name": "+2 Strength and Constitution"
        },
        {
          "kind": "perk",
          "name": "+2 Cat cher, Riding, and Lance Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Shield and Smite Spells"
        },
        {
          "kind": "perk",
          "name": "When protecting someone under your code by using Catcher, gain the benefit of Playing to the Cameras (no Disadvantage, as this is a Passive Skill). This counts as your “once per session” usage"
        },
        {
          "kind": "perk",
          "name": "Gain a bonded Mount one siz e bigger than you with Move 40, barding with DR 10, a Trample attack, and a pet carrier for it"
        },
        {
          "kind": "perk",
          "name": "When you or your Mount is the target of an Attack, your fancy riding allows you to redirect an attack at your Mount to yourself or vice versa"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000045",
    "name": "Sacred Paladin",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Paladin",
      "prerequisites": "",
      "description": "<p>Piety is not a choice: it’s a calling. You are pure and noble, a valiant protector of the innocent and avenger of the wronged. You can fight the good fight, heal the sick, and provide solace to the dying. Yeah, you’re that guy in the party—the one who won’t let anyone have any fun in this godforsaken Dungeon.</p>",
      "abilities": "<ul><li>+3 Strength</li><li>-2 Charisma</li><li>+2 Cat cher Skill</li><li>+2 in a weapon Skill of your choice</li><li>+2 Heal Others, Smite, and Turn Undead Spells</li><li>Access to the Dungeon Book of the Floor club (Favored: Cleric or Paladin Spells only)</li><li>+2 DR Buff</li><li>Access to Club Vanquisher</li><li>Must worship a deity</li><li>You cannot choose this Class if you have Access to the Desperado Club</li></ul>",
      "perks": [
        "+3 Strength",
        "+2 Charisma",
        "+2 Cat cher Skill",
        "+2 in a weapon Skill of your choice",
        "+2 Heal Others, Smite, and Turn Undead Spells",
        "Access to the Dungeon Book of the Floor club (Favored: Cleric or Paladin Spells only)",
        "+2 DR Buff",
        "Access to Club Vanquisher",
        "Must worship a deity",
        "You cannot choose this Class if you have Access to the Desperado Club"
      ],
      "stats": {
        "str": 3,
        "dex": 0,
        "con": 0,
        "int": 0,
        "cha": 2
      },
      "drBonus": 2,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Catcher",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Heal Others",
          "rank": 2
        },
        {
          "name": "Smite",
          "rank": 2
        },
        {
          "name": "Turn Undead",
          "rank": 2
        }
      ],
      "identifier": "sacred-paladin",
      "archetypes": [
        "archetype.paladin"
      ],
      "tags": [
        "archetype.paladin",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 0,
            "con": 0,
            "int": 0,
            "cha": 2
          }
        },
        {
          "kind": "dr",
          "value": 2
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Catcher",
          "rank": 2,
          "ref": "id.skill.catcher"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Heal Others",
          "rank": 2,
          "ref": "id.spell.heal-others"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Smite",
          "rank": 2,
          "ref": "id.spell.smite"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Turn Undead",
          "rank": 2,
          "ref": "id.spell.turn-undead"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+3 Strength"
        },
        {
          "kind": "perk",
          "name": "+2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+2 Cat cher Skill"
        },
        {
          "kind": "perk",
          "name": "+2 in a weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Heal Others, Smite, and Turn Undead Spells"
        },
        {
          "kind": "perk",
          "name": "Access to the Dungeon Book of the Floor club (Favored: Cleric or Paladin Spells only)"
        },
        {
          "kind": "perk",
          "name": "+2 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity"
        },
        {
          "kind": "perk",
          "name": "You cannot choose this Class if you have Access to the Desperado Club"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000046",
    "name": "Boring Ol’ Rogue",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Rogue",
      "prerequisites": "",
      "description": "<p>Thieves. Assassins. Black market merchants. Rogues come in all sizes and flavors, but the one thing they have in common is their love of money. Maybe money can’t buy you love, but it sure makes for a good time in the Desperado Club. Lookin’ at you, Author Steve Rowland.</p>",
      "abilities": "<ul><li>+1 Intelligence, Dexterity, and Charisma</li><li>+3 Stealth Skill</li><li>+2 Dagger, Detect Trap, Dodge, and Lockpicking Skills</li><li>+1 Ambush Skill</li><li>Can see in total darkness</li><li>1 x Floor Number gold for every Mob killed with a melee weapon</li><li>Access to the Desperado Club</li><li>Cannot choose this Class if you have Access to Club Vanquisher</li></ul>",
      "perks": [
        "+1 Intelligence, Dexterity, and Charisma",
        "+3 Stealth Skill",
        "+2 Dagger, Detect Trap, Dodge, and Lockpicking Skills",
        "+1 Ambush Skill",
        "Can see in total darkness",
        "1 x Floor Number gold for every Mob killed with a melee weapon",
        "Access to the Desperado Club",
        "Cannot choose this Class if you have Access to Club Vanquisher"
      ],
      "stats": {
        "str": 0,
        "dex": 1,
        "con": 0,
        "int": 1,
        "cha": 1
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Stealth",
          "rank": 3
        },
        {
          "name": "Dagger",
          "rank": 2
        },
        {
          "name": "Detect Trap",
          "rank": 2
        },
        {
          "name": "Dodge",
          "rank": 2
        },
        {
          "name": "Lockpicking",
          "rank": 2
        },
        {
          "name": "Ambush",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "boring-ol-rogue",
      "archetypes": [
        "archetype.rogue"
      ],
      "tags": [
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 1,
            "con": 0,
            "int": 1,
            "cha": 1
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Stealth",
          "rank": 3,
          "ref": "id.skill.stealth"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dagger",
          "rank": 2,
          "ref": "id.skill.dagger"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Detect Trap",
          "rank": 2,
          "ref": "id.skill.detect-trap"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 2,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Lockpicking",
          "rank": 2,
          "ref": "id.skill.lockpicking"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Ambush",
          "rank": 1,
          "ref": "id.skill.ambush"
        },
        {
          "kind": "perk",
          "name": "+1 Intelligence, Dexterity, and Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Stealth Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Dagger, Detect Trap, Dodge, and Lockpicking Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Ambush Skill"
        },
        {
          "kind": "perk",
          "name": "Can see in total darkness"
        },
        {
          "kind": "perk",
          "name": "1 x Floor Number gold for every Mob killed with a melee weapon"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Cannot choose this Class if you have Access to Club Vanquisher"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000047",
    "name": "Bomb Squad Tech",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Rogue",
      "prerequisites": "Prerequisite: This limited Class is only available to crawlers who’ve earned the Boom! Achievement",
      "description": "<p>People who actually choose to work with explosives are the craziest bastards around. You excel at making things blow up. And while you’re good at keeping the bombs from going off in your own hands, Bomb Squad Techs still tend to lose both friends and limbs at alarming rates. Luckily, this Class comes with a benefit that can fix 50% of that problem.</p>",
      "abilities": "<ul><li>-2 Dexterity</li><li>+1 Constitution</li><li>−2 Intelligence (After all, only dumbasses would choose to do this for a living.)</li><li>+3 Bomb Surgeon and Find Trap Skills</li><li>+2 in all Explosive -based Skills</li><li>+1 DR Buff</li><li>Limb Re generation benefit: In 12 days minus your Con Mod, one limb fully regrows</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+2 Dexterity",
        "+1 Constitution",
        "−2 Intelligence (After all, only dumbasses would choose to do this for a living.)",
        "+3 Bomb Surgeon and Find Trap Skills",
        "+2 in all Explosive -based Skills",
        "+1 DR Buff",
        "Limb Re generation benefit: In 12 days minus your Con Mod, one limb fully regrows",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 1,
        "int": -2,
        "cha": 0
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Bomb Surgeon",
          "rank": 3
        },
        {
          "name": "Find Trap",
          "rank": 3
        }
      ],
      "spells": [],
      "identifier": "bomb-squad-tech",
      "archetypes": [
        "archetype.rogue"
      ],
      "tags": [
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 2,
            "con": 1,
            "int": -2,
            "cha": 0
          }
        },
        {
          "kind": "dr",
          "value": 1
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Bomb Surgeon",
          "rank": 3,
          "ref": "id.skill.bomb-surgeon"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Find Trap",
          "rank": 3,
          "ref": "id.skill.find-trap"
        },
        {
          "kind": "perk",
          "name": "+2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+1 Constitution"
        },
        {
          "kind": "perk",
          "name": "−2 Intelligence (After all, only dumbasses would choose to do this for a living.)"
        },
        {
          "kind": "perk",
          "name": "+3 Bomb Surgeon and Find Trap Skills"
        },
        {
          "kind": "perk",
          "name": "+2 in all Explosive -based Skills"
        },
        {
          "kind": "perk",
          "name": "+1 DR Buff"
        },
        {
          "kind": "perk",
          "name": "Limb Re generation benefit: In 12 days minus your Con Mod, one limb fully regrows"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000048",
    "name": "Compensated Anarchist",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Monk, Rogue",
      "prerequisites": "Prerequisites: This limited Class is only available to crawlers who have popularity 3 or higher and have Rank 5+ in the Explosives Handling Skill",
      "description": "<p>When the oligarchs want to manufacture a social movement, or better yet, stop one in its tracks, they must first bring in the big guns. The paid protestors. The Agent Provocateur. This Monk/Rogue hybrid Class is a trapmaking, bomb-making, social-media dynamo. The Compensated Anarchist will happily throw a Molotov through a window one moment and step in front of a camera to plead for the violence to stop the next. Experts in hand-to-hand and dirty tactics, the Compensated Anarchist only suffers in more traditional fighting techniques. A recent balance patch has adjusted this Class’s values, but those who want to follow in Carl’s bare, delightful footsteps can still benefit from this Class’s wide array of bonuses.</p>",
      "abilities": "<ul><li>+ 5 Charisma</li><li>+1 Intelligence</li><li>+2 Backfire , Escape Plan, and Find Trap Skills</li><li>+1 Bomb Surgeon, Hide in Shadows, Trap Engineer, and Unarmed combat Skills</li><li>+1 Fear Spell</li><li>Add no St at Mod bonus damage when using Edged weapons</li><li>You pay +3 Mana to cast damage-dealing Spells</li><li>At the end of each floor, add 1 to one of your trap-related Skill Advancement Checks</li><li>At the end of each floor, add 1 to one of your bomb-related Skill Advancement Checks</li><li>Access to the Desperado Club</li><li>Access to the Naughty Boys Employment Agency</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+ 5 Charisma",
        "+1 Intelligence",
        "+2 Backfire , Escape Plan, and Find Trap Skills",
        "+1 Bomb Surgeon, Hide in Shadows, Trap Engineer, and Unarmed combat Skills",
        "+1 Fear Spell",
        "Add no St at Mod bonus damage when using Edged weapons",
        "You pay +3 Mana to cast damage-dealing Spells",
        "At the end of each floor, add 1 to one of your trap-related Skill Advancement Checks",
        "At the end of each floor, add 1 to one of your bomb-related Skill Advancement Checks",
        "Access to the Desperado Club",
        "Access to the Naughty Boys Employment Agency",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 1,
        "cha": 5
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Backfire",
          "rank": 2
        },
        {
          "name": "Escape Plan",
          "rank": 2
        },
        {
          "name": "Find Trap",
          "rank": 2
        },
        {
          "name": "Bomb Surgeon",
          "rank": 1
        },
        {
          "name": "Hide in Shadows",
          "rank": 1
        },
        {
          "name": "Trap Engineer",
          "rank": 1
        },
        {
          "name": "Unarmed Combat",
          "rank": 1
        }
      ],
      "spells": [
        {
          "name": "Fear",
          "rank": 1
        }
      ],
      "identifier": "compensated-anarchist",
      "archetypes": [
        "archetype.monk",
        "archetype.rogue"
      ],
      "tags": [
        "archetype.monk",
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 1,
            "cha": 5
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Backfire",
          "rank": 2,
          "ref": "id.skill.backfire"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Escape Plan",
          "rank": 2,
          "ref": "id.skill.escape-plan"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Find Trap",
          "rank": 2,
          "ref": "id.skill.find-trap"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Bomb Surgeon",
          "rank": 1,
          "ref": "id.skill.bomb-surgeon"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Hide in Shadows",
          "rank": 1,
          "ref": "id.skill.hide-in-shadows"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Trap Engineer",
          "rank": 1,
          "ref": "id.skill.trap-engineer"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Unarmed Combat",
          "rank": 1,
          "ref": "id.skill.unarmed-combat"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Fear",
          "rank": 1,
          "ref": "id.spell.fear"
        },
        {
          "kind": "perk",
          "name": "+ 5 Charisma"
        },
        {
          "kind": "perk",
          "name": "+1 Intelligence"
        },
        {
          "kind": "perk",
          "name": "+2 Backfire , Escape Plan, and Find Trap Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Bomb Surgeon, Hide in Shadows, Trap Engineer, and Unarmed combat Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Fear Spell"
        },
        {
          "kind": "perk",
          "name": "Add no St at Mod bonus damage when using Edged weapons"
        },
        {
          "kind": "perk",
          "name": "You pay +3 Mana to cast damage-dealing Spells"
        },
        {
          "kind": "perk",
          "name": "At the end of each floor, add 1 to one of your trap-related Skill Advancement Checks"
        },
        {
          "kind": "perk",
          "name": "At the end of each floor, add 1 to one of your bomb-related Skill Advancement Checks"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Access to the Naughty Boys Employment Agency"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000049",
    "name": "High Rise Grifter",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Rogue",
      "prerequisites": "",
      "description": "<p>Pickpocketing marks in the park is nothing compared to making a big score, like ripping off a techbro high up in his tower, but with higher rewards come higher stakes. Only through meticulous planning and cunning execution can you hope to come out of your nefarious plots unscathed. Even then, you still need to assemble the right crew and acquire the right equipment. And after that job is complete, it’s on to the next one!</p>",
      "abilities": "<ul><li>+1 Intelligence and Charisma</li><li>+4 Decep tion and Stealth Skills</li><li>+2 Dagger and Escape Plan Skills</li><li>+1 Determine Value and Negotiation Skills</li><li>Access to the Desperado Club</li><li>Cannot choose this Class if you have Access to Club Vanquisher</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+1 Intelligence and Charisma",
        "+4 Decep tion and Stealth Skills",
        "+2 Dagger and Escape Plan Skills",
        "+1 Determine Value and Negotiation Skills",
        "Access to the Desperado Club",
        "Cannot choose this Class if you have Access to Club Vanquisher",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
        "int": 1,
        "cha": 1
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Deception",
          "rank": 4
        },
        {
          "name": "Stealth",
          "rank": 4
        },
        {
          "name": "Dagger",
          "rank": 2
        },
        {
          "name": "Escape Plan",
          "rank": 2
        },
        {
          "name": "Determine Value",
          "rank": 1
        },
        {
          "name": "Negotiation",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "high-rise-grifter",
      "archetypes": [
        "archetype.rogue"
      ],
      "tags": [
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 0,
            "con": 0,
            "int": 1,
            "cha": 1
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Deception",
          "rank": 4,
          "ref": "id.skill.deception"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Stealth",
          "rank": 4,
          "ref": "id.skill.stealth"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dagger",
          "rank": 2,
          "ref": "id.skill.dagger"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Escape Plan",
          "rank": 2,
          "ref": "id.skill.escape-plan"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Determine Value",
          "rank": 1,
          "ref": "id.skill.determine-value"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Negotiation",
          "rank": 1,
          "ref": "id.skill.negotiation"
        },
        {
          "kind": "perk",
          "name": "+1 Intelligence and Charisma"
        },
        {
          "kind": "perk",
          "name": "+4 Decep tion and Stealth Skills"
        },
        {
          "kind": "perk",
          "name": "+2 Dagger and Escape Plan Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Determine Value and Negotiation Skills"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Cannot choose this Class if you have Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000050",
    "name": "Identity Thief",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Rogue",
      "prerequisites": "",
      "description": "<p>Direct confrontation isn’t your style. Instead, you make your living through guile and deception, adopting the role of a rich noble, a trusted merchant, or a long-estranged relative to work your way into wealthy families and organizations where you can pilfer treasures and escape unawares. When it works, it’s great. When it doesn’t… well, as long as your legs still work, you can always run away, right?</p>",
      "abilities": "<ul><li>+4 Charisma</li><li>+3 Dexterity</li><li>+5 Decep tion Skill</li><li>+3 Dagger Skill</li><li>+2 Investigation Skill</li><li>Tier 3 Makeup Table</li><li>Access to the Desperado Club</li><li>Cannot choose this Class if you have Access to Club Vanquisher</li><li>Silver Earth Box, with guaranteed Earth Hobby Potion</li></ul>",
      "perks": [
        "+4 Charisma",
        "+3 Dexterity",
        "+5 Decep tion Skill",
        "+3 Dagger Skill",
        "+2 Investigation Skill",
        "Tier 3 Makeup Table",
        "Access to the Desperado Club",
        "Cannot choose this Class if you have Access to Club Vanquisher",
        "Silver Earth Box, with guaranteed Earth Hobby Potion"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
        "con": 0,
        "int": 0,
        "cha": 4
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Deception",
          "rank": 5
        },
        {
          "name": "Dagger",
          "rank": 3
        },
        {
          "name": "Investigation",
          "rank": 2
        }
      ],
      "spells": [],
      "identifier": "identity-thief",
      "archetypes": [
        "archetype.rogue"
      ],
      "tags": [
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 3,
            "con": 0,
            "int": 0,
            "cha": 4
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Deception",
          "rank": 5,
          "ref": "id.skill.deception"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dagger",
          "rank": 3,
          "ref": "id.skill.dagger"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Investigation",
          "rank": 2,
          "ref": "id.skill.investigation"
        },
        {
          "kind": "perk",
          "name": "+4 Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+5 Decep tion Skill"
        },
        {
          "kind": "perk",
          "name": "+3 Dagger Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Investigation Skill"
        },
        {
          "kind": "perk",
          "name": "Tier 3 Makeup Table"
        },
        {
          "kind": "perk",
          "name": "Access to the Desperado Club"
        },
        {
          "kind": "perk",
          "name": "Cannot choose this Class if you have Access to Club Vanquisher"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000051",
    "name": "Swashbuckler",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Fighter, Rogue",
      "prerequisites": "",
      "description": "<p>You are daring and flamboyant, combining your exceptional swordsmanship and acrobatic agility with irresistible charm to win the hearts and purses of others. Your motivation may vary—perhaps someone killed your father when you were young, or your true love was lost to you while you were indentured at sea. Regardless, your tenacity and tenor have made you a foe to be reckoned with, while your charming wit and dashing style have generated a cult-like following. Even in the most inconceivable of circumstances, you can virtually do as you wish, with few dread repercussions.</p>",
      "abilities": "<ul><li>+3 Dexterity and Charisma</li><li>+3 Rapier or Longsword Skill</li><li>+2 Balance and Dodge Skills</li><li>+1 Performance Skill</li><li>+1 Light on Your Feet Skill</li><li>Rapier or Longsword Skill can be raised to Rank 20</li><li>You have Advantage when using a melee attack from a higher position than your opponent</li><li>Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing Success or better, gain +1 Popularity</li></ul>",
      "perks": [
        "+3 Dexterity and Charisma",
        "+3 Rapier or Longsword Skill",
        "+2 Balance and Dodge Skills",
        "+1 Performance Skill",
        "+1 Light on Your Feet Skill",
        "Rapier or Longsword Skill can be raised to Rank 20",
        "You have Advantage when using a melee attack from a higher position than your opponent",
        "Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing Success or better, gain +1 Popularity"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
        "con": 0,
        "int": 0,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Balance",
          "rank": 2
        },
        {
          "name": "Dodge",
          "rank": 2
        },
        {
          "name": "Performance",
          "rank": 1
        },
        {
          "name": "Light on Your Feet",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "swashbuckler",
      "archetypes": [
        "archetype.bard",
        "archetype.fighter",
        "archetype.rogue"
      ],
      "tags": [
        "archetype.bard",
        "archetype.fighter",
        "archetype.rogue",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 0,
            "dex": 3,
            "con": 0,
            "int": 0,
            "cha": 3
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Balance",
          "rank": 2,
          "ref": "id.skill.balance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Dodge",
          "rank": 2,
          "ref": "id.skill.dodge"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Performance",
          "rank": 1,
          "ref": "id.skill.performance"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Light on Your Feet",
          "rank": 1,
          "ref": "id.skill.light-on-your-feet"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 3,
          "category": "options",
          "options": [
            "Rapier",
            "Longsword"
          ],
          "label": "Rapier or Longsword (Rank 3)"
        },
        {
          "kind": "perk",
          "name": "+3 Dexterity and Charisma"
        },
        {
          "kind": "perk",
          "name": "+3 Rapier or Longsword Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Balance and Dodge Skills"
        },
        {
          "kind": "perk",
          "name": "+1 Performance Skill"
        },
        {
          "kind": "perk",
          "name": "+1 Light on Your Feet Skill"
        },
        {
          "kind": "perk",
          "name": "Rapier or Longsword Skill can be raised to Rank 20"
        },
        {
          "kind": "perk",
          "name": "You have Advantage when using a melee attack from a higher position than your opponent"
        },
        {
          "kind": "perk",
          "name": "Once per combat, after you kill an enemy, you can make an Unopposed Performance Skill Check. On an Amazing Success or better, gain +1 Popularity"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000052",
    "name": "Dungeon Dad",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Bard, Fighter",
      "prerequisites": "",
      "description": "<p>Once a little league coach, you’ve watched much of life pass you by, but you’re determined to protect and guide the youth—even if they’re a group of 20- to 30-somethings who should have learned basics like reading warnings, how to share, and talk about their feelings without being an asshole before now. Well, you’re here to make sure they learn by teaching them the lessons the world never did and doing your damnedest to keep them alive.</p>",
      "abilities": "<ul><li>-2 Charisma</li><li>+1 Strength and Constitution</li><li>−2 Dexterity</li><li>+3 Catcher Skill</li><li>+2 Repair and Tactics Skills</li><li>+2 to a Weapon Skill of your choice</li><li>+2 Hot Stuff Aura Spell</li><li>+2 DR</li><li>When you and up to 6 allies consume a meal you cooked (taking at least 30 minutes to cook), each eater gains +1 Buff for all of their Skill Checks for 1 hour</li><li>You roll a bonus 1d4 when you make the Help or Intervene Actions and add it to the benefit provided to your target</li><li>Vulnerability: Necrotic damage</li><li>Silver Earth Box, with guaranteed Earth Hobby Skill Potion</li></ul>",
      "perks": [
        "+2 Charisma",
        "+1 Strength and Constitution",
        "−2 Dexterity",
        "+3 Catcher Skill",
        "+2 Repair and Tactics Skills",
        "+2 to a Weapon Skill of your choice",
        "+2 Hot Stuff Aura Spell",
        "+2 DR",
        "When you and up to 6 allies consume a meal you cooked (taking at least 30 minutes to cook), each eater gains +1 Buff for all of their Skill Checks for 1 hour",
        "You roll a bonus 1d4 when you make the Help or Intervene Actions and add it to the benefit provided to your target",
        "Vulnerability: Necrotic damage",
        "Silver Earth Box, with guaranteed Earth Hobby Skill Potion"
      ],
      "stats": {
        "str": 1,
        "dex": -2,
        "con": 1,
        "int": 0,
        "cha": 2
      },
      "drBonus": 2,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Catcher",
          "rank": 3
        },
        {
          "name": "Repair",
          "rank": 2
        },
        {
          "name": "Tactics",
          "rank": 2
        }
      ],
      "spells": [
        {
          "name": "Hot Stuff Aura",
          "rank": 2
        }
      ],
      "identifier": "dungeon-dad",
      "archetypes": [
        "archetype.bard",
        "archetype.fighter"
      ],
      "tags": [
        "archetype.bard",
        "archetype.fighter",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 1,
            "dex": -2,
            "con": 1,
            "int": 0,
            "cha": 2
          }
        },
        {
          "kind": "dr",
          "value": 2
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Catcher",
          "rank": 3,
          "ref": "id.skill.catcher"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Repair",
          "rank": 2,
          "ref": "id.skill.repair"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Tactics",
          "rank": 2,
          "ref": "id.skill.tactics"
        },
        {
          "kind": "spell",
          "mode": "fixed",
          "name": "Hot Stuff Aura",
          "rank": 2,
          "ref": "id.spell.hot-stuff-aura"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+2 Charisma"
        },
        {
          "kind": "perk",
          "name": "+1 Strength and Constitution"
        },
        {
          "kind": "perk",
          "name": "−2 Dexterity"
        },
        {
          "kind": "perk",
          "name": "+3 Catcher Skill"
        },
        {
          "kind": "perk",
          "name": "+2 Repair and Tactics Skills"
        },
        {
          "kind": "perk",
          "name": "+2 to a Weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Hot Stuff Aura Spell"
        },
        {
          "kind": "perk",
          "name": "+2 DR"
        },
        {
          "kind": "perk",
          "name": "When you and up to 6 allies consume a meal you cooked (taking at least 30 minutes to cook), each eater gains +1 Buff for all of their Skill Checks for 1 hour"
        },
        {
          "kind": "perk",
          "name": "You roll a bonus 1d4 when you make the Help or Intervene Actions and add it to the benefit provided to your target"
        },
        {
          "kind": "perk",
          "name": "Vulnerability: Necrotic damage"
        },
        {
          "kind": "perk",
          "name": "Silver Earth Box, with guaranteed Earth Hobby Skill Potion"
        }
      ]
    }
  },
  {
    "_id": "dcccls0000000053",
    "name": "Black Inquisitor General",
    "type": "class",
    "img": "icons/default-icons/class.svg",
    "system": {
      "classType": "Cleric, Mage, Paladin",
      "prerequisites": "",
      "description": "<p>You are a true believer who seeks out and kills those who have betrayed the faith… and you might enjoy this sacred duty a little too much. Yeah, who are we kidding? You’re a psychopath who’s out to inflict pain on others, and you’re using your deity as a convenient excuse.</p>",
      "abilities": "<ul><li>+3 Strength and Intelligence</li><li>+1 Charisma</li><li>−2 Constitution</li><li>+3 Find Trap Skill</li><li>+3 in a Weapon Skill of your choice</li><li>+2 Trap Engineer Skill</li><li>+2 in a Spell of your choice</li><li>+1 Religion Skill</li><li>Can see in total darkness</li><li>Must worship a deity (see Deities & Worship, p. 163)</li><li>Access to all membership-based clubs, regardless of current memberships</li></ul>",
      "perks": [
        "+3 Strength and Intelligence",
        "+1 Charisma",
        "−2 Constitution",
        "+3 Find Trap Skill",
        "+3 in a Weapon Skill of your choice",
        "+2 Trap Engineer Skill",
        "+2 in a Spell of your choice",
        "+1 Religion Skill",
        "Can see in total darkness",
        "Must worship a deity (see Deities & Worship, p. 163)",
        "Access to all membership-based clubs, regardless of current memberships"
      ],
      "stats": {
        "str": 3,
        "dex": 0,
        "con": -2,
        "int": 3,
        "cha": 1
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Find Trap",
          "rank": 3
        },
        {
          "name": "Trap Engineer",
          "rank": 2
        },
        {
          "name": "Religion",
          "rank": 1
        }
      ],
      "spells": [],
      "identifier": "black-inquisitor-general",
      "archetypes": [
        "archetype.cleric",
        "archetype.mage",
        "archetype.paladin"
      ],
      "tags": [
        "archetype.cleric",
        "archetype.mage",
        "archetype.paladin",
        "kind.class"
      ],
      "grants": [
        {
          "kind": "stat",
          "stats": {
            "str": 3,
            "dex": 0,
            "con": -2,
            "int": 3,
            "cha": 1
          }
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Find Trap",
          "rank": 3,
          "ref": "id.skill.find-trap"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Trap Engineer",
          "rank": 2,
          "ref": "id.skill.trap-engineer"
        },
        {
          "kind": "skill",
          "mode": "fixed",
          "name": "Religion",
          "rank": 1,
          "ref": "id.skill.religion"
        },
        {
          "kind": "skill",
          "mode": "choice",
          "count": 1,
          "rank": 3,
          "category": "weapon",
          "filter": {
            "any": [
              "skillGroup.combat",
              "kind.weapon"
            ]
          },
          "label": "Weapon Skill 1 (Rank 3)"
        },
        {
          "kind": "spell",
          "mode": "choice",
          "count": 1,
          "rank": 2,
          "category": "spell",
          "filter": {
            "all": [
              "kind.spell"
            ]
          },
          "label": "Spell 1 (Rank 2)"
        },
        {
          "kind": "perk",
          "name": "+3 Strength and Intelligence"
        },
        {
          "kind": "perk",
          "name": "+1 Charisma"
        },
        {
          "kind": "perk",
          "name": "−2 Constitution"
        },
        {
          "kind": "perk",
          "name": "+3 Find Trap Skill"
        },
        {
          "kind": "perk",
          "name": "+3 in a Weapon Skill of your choice"
        },
        {
          "kind": "perk",
          "name": "+2 Trap Engineer Skill"
        },
        {
          "kind": "perk",
          "name": "+2 in a Spell of your choice"
        },
        {
          "kind": "perk",
          "name": "+1 Religion Skill"
        },
        {
          "kind": "perk",
          "name": "Can see in total darkness"
        },
        {
          "kind": "perk",
          "name": "Must worship a deity (see Deities & Worship, p. 163)"
        },
        {
          "kind": "perk",
          "name": "Access to all membership-based clubs, regardless of current memberships"
        }
      ]
    }
  }
];
