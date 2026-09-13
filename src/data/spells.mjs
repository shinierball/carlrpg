/**
 * Dungeon Crawler Carl RPG - Official Spells Dataset
 * Derived from the official DCC Spells Overview & Cheat Sheet.
 */

export const DCC_SPELLS = [
  {
    _id: "dccspl0000000001",
    name: "Air Buddy",
    type: "spell",
    img: "icons/svg/wing.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 12,
      range: "Self",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Passive",
      damageType: "",
      baseDamage: "",
      aiFavor: 0,
      favored: "Mage",
      limitations: "",
      quote: "There’s no dungeon rule that a dog can’t fly.",
      description: "You launch yourself with enough force to fly, hurtling forward from your current position up to 10 × your Int Mod away. You land safely if you land on solid ground; otherwise, you fall (see p. 76). You can cast this twice in a row to “double jump” just like in platforming video games.",
      upgrades: {
        rank5: "You may choose one additional willing target up to your size at touch range, who you bring with you.",
        rank10: "You can fly up to 20 × your Int Mod away with this spell.",
        rank15: "You may choose up to five additional willing targets up to your size at touch range to bring with you."
      }
    }
  },
  {
    _id: "dccspl0000000002",
    name: "Astral Paw",
    type: "spell",
    img: "icons/svg/paw.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 12,
      range: "30 feet",
      duration: "Until end of combat or 5 min",
      cooldown: "None",
      spellType: "Passive",
      damageType: "",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "You have summoned an Astral Paw. Yes, just the paw. Budget constraints.",
      description: "You conjure a spectral hand, paw, or claw, looking much like your own. You can use this astral appendage to manipulate objects up to 30ft away by spending an Action. You can use the Astral Paw to make Skill Checks but suffer Disadvantage due to a lack of fine control.",
      upgrades: {
        rank5: "Your Pugilism and Slice Attacks with the Paw add 1 Astral Paw Rank damage die.",
        rank10: "You can conjure a paw up to four size categories larger than your own, and the range increases to 50 feet.",
        rank15: "The caster no longer suffers Disadvantage when performing suitable Skill Checks using the paw, and the duration is 15 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000003",
    name: "Bad Faith",
    type: "spell",
    img: "icons/svg/sword.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 5,
      range: "5 feet",
      duration: "5 min + 1 min/Rank",
      cooldown: "15 minutes",
      spellType: "Passive",
      damageType: "Fire & Electric",
      baseDamage: "+2 mixed Fire and Electric",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "When you want more zing in your zinger.",
      description: "Place a hot and crackling temporary enchantment on a weapon you are holding. Your weapon deals +2 mixed Fire and Electric damage.",
      upgrades: {
        rank5: "+1d6 Fire and Electric damage.",
        rank10: "+1d6 Fire and Electric damage, and on an Amazing Success, the target of the weapon attack gains the Burned Debuff.",
        rank15: "+1d6 Fire and Electric damage, and on an Amazing Success, the target of the weapon attack also gains the Shocked Debuff."
      }
    }
  },
  {
    _id: "dccspl0000000004",
    name: "Bang Bro",
    type: "spell",
    img: "icons/svg/skull.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 10,
      range: "40 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Necrotic",
      baseDamage: "1d8 + Cha Necrotic",
      aiFavor: 0,
      favored: "Cleric",
      limitations: "",
      quote: "The system has classified your prayers as a hostile act.",
      description: "An unholy presence invades your victim’s mind, body, and soul.",
      upgrades: {
        rank5: "+1d8 base damage, +5ft Splash.",
        rank10: "+1d8 base damage, and end all Buffs on the victims for the duration of the combat.",
        rank15: "+1d8 base damage, +5ft Splash."
      }
    }
  },
  {
    _id: "dccspl0000000005",
    name: "Clockwork Triplicate",
    type: "spell",
    img: "icons/svg/clockwork.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 26,
      range: "5 feet",
      duration: "1 min/Rank",
      cooldown: "None",
      spellType: "Passive",
      damageType: "",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Only castable on pets and minions.",
      quote: "If one is good, then three is a party.",
      description: "When you cast this spell upon your pet or minion, it splits into three, each with its full complement of abilities. You must spend an Action making an Unopposed Animal Handling Skill Check to issue a new command to each one separately.",
      upgrades: {
        rank5: "Duration is 2 minutes per Rank.",
        rank10: "Duration is 3 minutes per Rank.",
        rank15: "When you command your pet or minion, the clockwork versions follow suit."
      }
    }
  },
  {
    _id: "dccspl0000000006",
    name: "Confusing Fog",
    type: "spell",
    img: "icons/svg/aura.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 6,
      range: "40 feet",
      duration: "2 rounds / 20 sec",
      cooldown: "15 minutes",
      spellType: "Passive",
      damageType: "",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Visibility reduced. Decision-making questionable.",
      description: "You create a billowing cloud of fog that you, your party members, and friendly NPCs can see through, but it obscures the area from Mobs, making it more difficult for them to attack you. Mobs attack with Disadvantage against targets in the fog. This fog fills a 25 × 25ft area. Smart Mobs may attempt to move the combat out of the fog if able.",
      upgrades: {
        rank5: "The fog fills a 50 × 50ft area, and its duration is 1 minute.",
        rank10: "The fog fills a 100 × 100ft area and lasts for 5 minutes.",
        rank15: "The fog fills a 500 × 500ft area and lasts for 15 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000007",
    name: "Dirt Clod",
    type: "spell",
    img: "icons/svg/stone-path.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 1,
      range: "100 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Bludgeoning",
      baseDamage: "1d2 + Int Bludgeoning",
      aiFavor: 2,
      favored: "",
      limitations: "",
      quote: "You have weaponized dirt.",
      description: "You hurl a magical clod of dirt, leaving dirt and pebbles strewn about near the target.",
      upgrades: {
        rank5: "+2d2 base damage.",
        rank10: "+1d2 base damage, and the target gains the Woozy Debuff.",
        rank15: "+1d2 base damage, and 1 Rank damage die."
      }
    }
  },
  {
    _id: "dccspl0000000008",
    name: "Drain Life",
    type: "spell",
    img: "icons/svg/drain.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 14,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Necrotic",
      baseDamage: "1d6 + Int Necrotic",
      aiFavor: 0,
      favored: "",
      limitations: "For a brief instant, you create a disgusting blood vein that reaches out and wraps itself around your target.",
      quote: "Organic tether deployed. Try not to think about where it’s been.",
      description: "For a brief instant, you create a disgusting blood vein that reaches out and wraps itself around your target, siphoning life force.",
      upgrades: {
        rank5: "+1d6 base damage, and if the target loses at least 3 Health Bar slots, you heal 1 Health Bar slot.",
        rank10: "+1d6 base damage, and if you heal this way, heal +1 Health Bar slot.",
        rank15: "+1d6 base damage, and if you heal this way, heal +1 Health Bar slot."
      }
    }
  },
  {
    _id: "dccspl0000000009",
    name: "Earworm",
    type: "spell",
    img: "icons/svg/sound.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 6,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "Once per round",
      spellType: "Attack",
      damageType: "Sonic",
      baseDamage: "1d6 + Cha Sonic",
      aiFavor: 0,
      favored: "Bard",
      limitations: "",
      quote: "Hitting every note except the right ones.",
      description: "Sing a terrible song targeting the ear holes of a victim. Yes, sing a few bars so the GM understands the pain you’re inflicting.",
      upgrades: {
        rank5: "+1d6 base damage.",
        rank10: "+1d6 base damage, and the target gains the Queasy Debuff.",
        rank15: "+1d6 base damage and +10ft Splash."
      }
    }
  },
  {
    _id: "dccspl0000000010",
    name: "Fear",
    type: "spell",
    img: "icons/svg/terror.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 3,
      range: "25 feet",
      duration: "1 round / Combat",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Mind Control",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Warning: Scary-ass Mobs are immune to Fear effects (GM’s discretion).",
      quote: "Run away, little piggies!",
      description: "Target a non-Boss Mob of half your level or less. On a Standard Success, it stands its ground, but it loses its Dex Mod for the duration of the combat. On a higher success, it uses two of its Actions during the next round to run away.",
      upgrades: {
        rank5: "Affects non-Boss Mobs up to your full level.",
        rank10: "The target drops whatever it is holding in terror on any success.",
        rank15: "Targets who fail their check are completely paralyzed with Fear for 1 round."
      }
    }
  },
  {
    _id: "dccspl0000000011",
    name: "Fire Fingers",
    type: "spell",
    img: "icons/svg/fire.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 3,
      range: "Melee",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Fire",
      baseDamage: "1d4 + Int Fire",
      aiFavor: 1,
      favored: "",
      limitations: "",
      quote: "Fire Fingers activated. Try not to make it weird.",
      description: "Brilliant flame leaps from your fingers.",
      upgrades: {
        rank5: "+1d4 base damage.",
        rank10: "+1d4 base damage, and the target gains the Burned Debuff.",
        rank15: "+1d4 base damage, and your hands begin to intermittently burn. Your Pugilism, Unarmed Combat, and Slice Attack strikes add 1 Fire Fingers Rank damage die (Fire)."
      }
    }
  },
  {
    _id: "dccspl0000000012",
    name: "Fireball",
    type: "spell",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 45,
      range: "80 feet",
      duration: "Instantaneous",
      cooldown: "Once per scene",
      spellType: "Attack",
      damageType: "Fire",
      baseDamage: "1d12 + Int Fire, 10ft Blast radius",
      aiFavor: 0,
      favored: "Mage",
      limitations: "Moves slowly; attack is made with Disadvantage.",
      quote: "It almost reluctantly meanders toward you. Then your world explodes.",
      description: "A creeping beach ball-sized sphere of fire emanates from you. Since it moves so slowly, your attack is made with Disadvantage. When the impact zone has been determined, each creature in a 10ft Blast radius takes full damage. On Fail, roll 1d8 for direction (see Figure 3, p. 200). The amount the Skill Check missed by is the distance away in feet it impacts.",
      upgrades: {
        rank5: "+1d12 base damage. Those who lose 1 or more Health Bar slots via this attack gain the Burned Debuff.",
        rank10: "+1d12 base damage and becomes an 80ft Line attack (and keeps the Blast).",
        rank15: "+1d12 base damage and +40ft Splash (on the Blast)."
      }
    }
  },
  {
    _id: "dccspl0000000013",
    name: "Frost Scar",
    type: "spell",
    img: "icons/svg/ice-cube.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 2,
      range: "Melee",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Ice",
      baseDamage: "1d4 + Int Ice",
      aiFavor: 1,
      favored: "",
      limitations: "",
      quote: "Frigid status achieved; relationships may suffer.",
      description: "With a slice of your frigid hand, you leave a scar of rime on your target.",
      upgrades: {
        rank5: "+1d4 base damage, and the target cannot heal themselves in the next combat round.",
        rank10: "+1d4 base damage, and the target gains the Stiff Legs Debuff.",
        rank15: "+1d4 base damage, and the target gains The Taint Debuff."
      }
    }
  },
  {
    _id: "dccspl0000000014",
    name: "Grand Illusion",
    type: "spell",
    img: "icons/svg/eye.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 7,
      range: "40 feet",
      duration: "2 minutes",
      cooldown: "15 minutes",
      spellType: "Intelligence",
      damageType: "Illusion",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Why, yes, that is my pet T-Rex.",
      description: "You create an illusion that might trick your foes. Make a single Int-Opposed Spell Check vs. foes who can see it. Your same roll is used against foes who see it even after the casting round. Mundane illusions seeking only to impress might be rolled with Advantage, while complex illusions seeking a specific response or images that suddenly pop up during combat might be rolled with Disadvantage (GM’s discretion). On Success, they believe your illusion.",
      upgrades: {
        rank5: "Those who believe gain the Woozy Debuff or similar based on the desired response.",
        rank10: "Those who believe also gain the Queasy Debuff or similar based on the desired response.",
        rank15: "Those who believe also gain the Shocked Debuff or similar based on the desired response."
      }
    }
  },
  {
    _id: "dccspl0000000015",
    name: "Heal",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 2,
      range: "Self only",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "2 Health Bar slots",
      aiFavor: 0,
      favored: "",
      limitations: "Rank 1 maximum. Self only.",
      quote: "Congratulations on not dying… yet.",
      description: "Heal 2 Health Bar slots.",
      upgrades: {
        rank5: "None",
        rank10: "None",
        rank15: "None"
      }
    }
  },
  {
    _id: "dccspl0000000016",
    name: "Heal Critter",
    type: "spell",
    img: "icons/svg/paw.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 8,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "100% Health Bar",
      aiFavor: 0,
      favored: "",
      limitations: "May only be cast on pets and minions (sorry, Donut).",
      quote: "Your pet has been restored to maximum cuddle capacity.",
      description: "The target glows as they heal back to 100% Health Bar.",
      upgrades: {
        rank5: "The target mends a Minor Injury Debuff.",
        rank10: "The target mends a Major Injury Debuff.",
        rank15: "The target regrows all lost appendages."
      }
    }
  },
  {
    _id: "dccspl0000000017",
    name: "Heal Others",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 6,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "1d4 Health Bar slots",
      aiFavor: 0,
      favored: "Cleric",
      limitations: "You can’t cast this Spell on yourself, pets, or minions.",
      quote: "Tell me you’re a Cleric without…",
      description: "A wave of positive vibes engulfs the target. They heal 1d4 Health Bar slots.",
      upgrades: {
        rank5: "The target heals 1d6 Health Bar slots.",
        rank10: "The target heals 2d6 Health Bar slots.",
        rank15: "Instead of a single target, all party members within a 20ft Burst radius are healed."
      }
    }
  },
  {
    _id: "dccspl0000000018",
    name: "Heal Self",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 1,
      range: "Self only",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "1d4 Health Bar slots",
      aiFavor: 0,
      favored: "",
      limitations: "You can only cast this Spell on yourself.",
      quote: "Way easier than manually shoving your guts back in!",
      description: "You center yourself, using magic to make yourself whole. You heal 1d4 Health Bar slots.",
      upgrades: {
        rank5: "You heal 1d6 Health Bar slots and mend a Minor Injury, Poison, or Disease Debuff.",
        rank10: "You heal 2d6 Health Bar slots and mend a Major Injury or other Debuff.",
        rank15: "You heal to full and gain the benefits of a short rest."
      }
    }
  },
  {
    _id: "dccspl0000000019",
    name: "Hole",
    type: "spell",
    img: "icons/svg/circle.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 12,
      range: "10 feet",
      duration: "Until end of combat or 5 min",
      cooldown: "None",
      spellType: "Passive",
      damageType: "",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Can’t be used on saferoom doors or living things.",
      quote: "It’s a hole. This will absolutely be misused.",
      description: "You create a temporary cylindrical hole in a surface or material within range, to a depth of 1 inch per Spell Rank and a diameter of 2ft. Anything that can fit in the hole can pass through it if the hole is deep enough to penetrate to the other side of the surface.",
      upgrades: {
        rank5: "You can reduce the diameter of the hole to a smaller size when cast.",
        rank10: "You can widen the hole’s diameter by 1 inch for every inch of depth you sacrifice when cast.",
        rank15: "The caster may end the spell with a thought (like an Interrupt, but it doesn’t cost an Action). Anything in the hole at that time is destroyed."
      }
    }
  },
  {
    _id: "dccspl0000000020",
    name: "Holy Aura",
    type: "spell",
    img: "icons/svg/sun.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 7,
      range: "5ft Burst radius",
      duration: "Instantaneous",
      cooldown: "Once per round",
      spellType: "Attack",
      damageType: "Holy",
      baseDamage: "1d4 + Cha Holy, 5ft Burst radius",
      aiFavor: 0,
      favored: "Cleric & Paladin",
      limitations: "",
      quote: "Look who’s all high and mighty.",
      description: "You channel your deity and emanate their essence to hurt only the enemies around you.",
      upgrades: {
        rank5: "+1d4 base damage, and affected undead Mobs take double damage.",
        rank10: "+1d4 base damage and +5ft Burst radius.",
        rank15: "+1d4 base damage and +5ft Burst radius."
      }
    }
  },
  {
    _id: "dccspl0000000021",
    name: "Hot Stuff Aura",
    type: "spell",
    img: "icons/svg/aura.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 8,
      range: "5ft Burst radius",
      duration: "2 rounds",
      cooldown: "5 minutes",
      spellType: "Passive",
      damageType: "Shield",
      baseDamage: "",
      aiFavor: 0,
      favored: "Bard",
      limitations: "These slots cannot be healed.",
      quote: "Bask in the warm glow of my machismo!",
      description: "You create a shield of pure sex appeal around you against all damage types with a number of Health Bar slots equal to your Cha Mod, and a 2 in each slot. It also protects all allies within the radius. When depleted, it disappears. These slots cannot be healed.",
      upgrades: {
        rank5: "Increase the Health to 4 in each slot.",
        rank10: "+5ft Burst radius, with a 6 in each slot.",
        rank15: "+10ft Burst radius, with a 8 in each slot."
      }
    }
  },
  {
    _id: "dccspl0000000022",
    name: "Ice Blast",
    type: "spell",
    img: "icons/svg/ice-cube.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 9,
      range: "40 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Ice",
      baseDamage: "1d8 + Int Ice",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Hope they brought a jacket.",
      description: "With the howl of blizzard winds, you let loose a compact pocket of freezing cold and ice.",
      upgrades: {
        rank5: "+1d8 base damage.",
        rank10: "+1d8 base damage, and the target is pushed 10 feet away from you.",
        rank15: "+1d8 base damage, and you can change the range to a 15ft Cone Attack."
      }
    }
  },
  {
    _id: "dccspl0000000023",
    name: "Icicles",
    type: "spell",
    img: "icons/svg/ice-cube.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 19,
      range: "60 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Ice",
      baseDamage: "1d12 + Int Ice",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Did you know that icicles are the #1 cause of home head impalements? / It’s pretty cool. I saw you shooting icicles out of your hand. —Carl",
      description: "Seizing upon the ice that runs through your veins, icicle projectiles shoot forth from your palms towards distant foes.",
      upgrades: {
        rank5: "+1d12 base damage.",
        rank10: "+1d12 base damage, and the target gains the Stiff Legs Debuff.",
        rank15: "+1d12 base damage, and the damage is Armor-Piercing."
      }
    }
  },
  {
    _id: "dccspl0000000024",
    name: "Intimate Touches",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 8,
      range: "5 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "Health Bar slots = Cha Mod",
      aiFavor: 0,
      favored: "Cleric & Paladin",
      limitations: "Unlike most healing, this spell is not an Interrupt.",
      quote: "Show me on the doll where they healed you.",
      description: "You lay hands on the target (which could be you), who heals Health Bar slots equal to your Cha Mod.",
      upgrades: {
        rank5: "The target also heals a Minor Injury Debuff.",
        rank10: "The target also heals a Major Injury Debuff.",
        rank15: "The target also heals all Poison & Disease Debuffs."
      }
    }
  },
  {
    _id: "dccspl0000000025",
    name: "Lightning Bolt",
    type: "spell",
    img: "icons/svg/lightning.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 15,
      range: "100 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Electric",
      baseDamage: "1d10 + Int Electric",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Bolt released, viewership spike detected.",
      description: "With a thunderous clap, you let loose a bolt of lightning.",
      upgrades: {
        rank5: "+1d10 base damage.",
        rank10: "+1d10 base damage and becomes a 100ft Line Attack.",
        rank15: "+1d10 base damage. The lightning bolt forks, and you may choose to apply your Attack against any number of additional targets within 15 feet of the previous target (within the range limit). Each successful Attack (including against the primary target), deals half damage."
      }
    }
  },
  {
    _id: "dccspl0000000026",
    name: "Magic Missile",
    type: "spell",
    img: "icons/svg/target.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 5,
      range: "Line of sight",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Force",
      baseDamage: "1d4 + Int Force",
      aiFavor: 1,
      favored: "",
      limitations: "",
      quote: "Standard Spell detected. Viewers appreciate the nostalgia.",
      description: "From glowing eyes, fingers, or whatever, a streak of pure force shoots out.",
      upgrades: {
        rank5: "+1d4 base damage, and you can cast the Spell at a higher or lower Mana cost (3 Mana: −4 damage; 4 Mana: −2 damage; 6 Mana: Add 1 Rank damage die).",
        rank10: "+1d4 base damage, and the missiles deal Force and Fire damage. The target gains the Burned Debuff.",
        rank15: "This attack deals base damage ×3."
      }
    }
  },
  {
    _id: "dccspl0000000027",
    name: "Mind Tickle",
    type: "spell",
    img: "icons/svg/eye.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 2,
      range: "40 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Psychic",
      baseDamage: "1d2 + Cha Psychic",
      aiFavor: 2,
      favored: "Cleric",
      limitations: "",
      quote: "Don’t think of an elephant.",
      description: "You infect your target with a small headache.",
      upgrades: {
        rank5: "+1d2 base damage.",
        rank10: "+1d2 base damage, and the target gains the Sore as Shit Debuff.",
        rank15: "+1d2 base damage, and the target gains the Muted Debuff."
      }
    }
  },
  {
    _id: "dccspl0000000028",
    name: "Minion Army",
    type: "spell",
    img: "icons/svg/skull.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 50,
      range: "50ft Burst radius",
      duration: "2 minutes",
      cooldown: "5 hours",
      spellType: "Intelligence",
      damageType: "Mind Control",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "5-minute casting time, and the caster cannot move while casting. Only works against Mobs with an Intelligence of 2+.",
      quote: "No army can triumph when subjected to internecine conflict.",
      description: "When you cast this spell, choose a target within range. On a Standard Success, 1 in 50 Mobs in the affected area (min 1) become an ally and fight for you without needing to command them. Higher levels of success can turn additional Mobs into allies (GM’s discretion).",
      upgrades: {
        rank5: "The casting time is 4 minutes. Duration is 5 minutes.",
        rank10: "Add your Charisma Stat to the Burst radius. Duration is 10 minutes.",
        rank15: "Add your Charisma Stat to the Burst radius. Duration is 15 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000029",
    name: "Nature's Breath",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "con",
      manaCost: 6,
      range: "5 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Heal",
      damageType: "Healing",
      baseDamage: "Nature's Breath Rank damage die slots",
      aiFavor: 0,
      favored: "Druid",
      limitations: "",
      quote: "This recycled dungeon air is bad for my complexion.",
      description: "You blow cool, fresh air over the target’s wounds (could be yourself), healing them. Roll a Nature’s Breath Rank damage die. That is how many Health Bar slots the target heals. May also target pets and minions.",
      upgrades: {
        rank5: "Add 1 to your die roll.",
        rank10: "Add 1 to your die roll, and remove a Minor Injury Debuff.",
        rank15: "Add 1 to your die roll, and remove a Major Injury Debuff."
      }
    }
  },
  {
    _id: "dccspl0000000030",
    name: "Oakhide",
    type: "spell",
    img: "icons/svg/shield.svg",
    system: {
      rank: 1,
      stat: "con",
      manaCost: 5,
      range: "Self",
      duration: "2 minutes",
      cooldown: "10 minutes",
      spellType: "Passive",
      damageType: "Buff",
      baseDamage: "+2 Damage Resistance",
      aiFavor: 0,
      favored: "Druid",
      limitations: "",
      quote: "My bark is worse than my bite.",
      description: "Your skin turns into solid wood, giving you great protection. You have +2 Damage Resistance for the duration of this spell.",
      upgrades: {
        rank5: "+2 DR. Duration is 3 minutes.",
        rank10: "+2 DR. You may target party members and NPCs up to 10 feet away with this spell.",
        rank15: "+2 DR. Duration is 4 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000031",
    name: "Paladin's Smite",
    type: "spell",
    img: "icons/svg/sword.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 11,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Holy",
      baseDamage: "1d8 + Cha Holy",
      aiFavor: 0,
      favored: "Paladin",
      limitations: "",
      quote: "Repent or die!",
      description: "You channel a torrent of divine wrath toward a soon-to-be repentant foe.",
      upgrades: {
        rank5: "+1d8 base damage.",
        rank10: "+1d8 base damage, and the target gains the Take Down Debuff.",
        rank15: "+1d8 base damage, and the damage is Armor-Piercing (ignores DR)."
      }
    }
  },
  {
    _id: "dccspl0000000032",
    name: "Panty Dropper",
    type: "spell",
    img: "icons/svg/heart.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 10,
      range: "10 feet",
      duration: "2 minutes or until you finish",
      cooldown: "5 minutes",
      spellType: "Charisma",
      damageType: "Mind Control",
      baseDamage: "",
      aiFavor: 0,
      favored: "Bard",
      limitations: "Non-Boss targets only.",
      quote: "You know what’s on the menu? Me-n-u.",
      description: "Make an Int-Opposed Spell Check against a non-Boss target, even in combat. Fighting’s just another form of penetration, after all. On Success, the target wants to jump your bones and won’t let anyone stop them (they cease attacking or doing other things).",
      upgrades: {
        rank5: "The duration is 5 minutes.",
        rank10: "The duration is 10 minutes.",
        rank15: "The duration is 15 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000033",
    name: "Ping",
    type: "spell",
    img: "icons/svg/target.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 5,
      range: "1 mile Burst radius",
      duration: "Instantaneous",
      cooldown: "5 minutes",
      spellType: "Passive",
      damageType: "Detection",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Here piggy, piggy.",
      description: "Sends out an audible ping that gives the distance and location of all non-crawlers and non-red-tagged Mobs in a circle around you. It will mark targets beyond the range of your map. You receive information about the Mobs that is “somewhat complete.” Targets hit with Ping will hear an audible ping noise, but they will not know where the ping originated. Environmental factors and obstacles may increase or decrease range.",
      upgrades: {
        rank5: "If you know the Fear Spell (see p. 204), you may cast it at no Action cost to affect all eligible Mobs within the Ping range. You only pay the Mana.",
        rank10: "Environmental factors and obstacles no longer decrease the range, and you receive “mostly complete” information.",
        rank15: "You pay no Mana to add the Fear Spell, and you receive “entirely complete” information."
      }
    }
  },
  {
    _id: "dccspl0000000034",
    name: "Protective Shell",
    type: "spell",
    img: "icons/svg/shield.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 0,
      range: "10ft Burst radius",
      duration: "5 seconds",
      cooldown: "30 hours",
      spellType: "Interrupt",
      damageType: "Protection",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Spell must be imbued onto something you are wearing. The shell cannot be moved by any means.",
      quote: "Hope activated. Try not to waste it.",
      description: "You create a 10 + Int-foot Burst radius magic shell around yourself and nearby party members. This shell pushes away all Mobs in its Area, which is the shell’s radius + 5ft. Mobs cannot enter the shell (unless non-corporeal) or physically attack those inside. The shell does not protect against magic effects. Crawlers inside may attack as usual.",
      upgrades: {
        rank5: "Duration is 10 seconds. In addition to knocking enemies away, it protects the occupants from all non-Spell attacks originating from outside the shell until the end of the current combat round.",
        rank10: "Duration is 20 seconds or two rounds.",
        rank15: "Duration is 30 seconds or three rounds."
      }
    }
  },
  {
    _id: "dccspl0000000035",
    name: "Puddle Jumper",
    type: "spell",
    img: "icons/svg/sun.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 20,
      range: "Line-of-sight to the destination surface",
      duration: "Instantaneous",
      cooldown: "5 hours",
      spellType: "Passive",
      damageType: "Teleportation",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "There is a 10-second delay before the effect takes place.",
      quote: "Teleportation doesn’t suck.",
      description: "You and up to 3 party members of your choice teleport to another location. Everyone feels a tingling sensation while waiting for the effect to resolve.",
      upgrades: {
        rank5: "The delay is 2 seconds, and the destination doesn’t have to be a surface.",
        rank10: "The delay is 1 second, and the destination can be anywhere within 1,000 yards in any direction, even if the exact destination cannot be seen.",
        rank15: "There is no delay, and the destination can be anywhere within 1 mile in any direction, even if the exact destination cannot be seen."
      }
    }
  },
  {
    _id: "dccspl0000000036",
    name: "Rise, Dead Minion!",
    type: "spell",
    img: "icons/svg/skull.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 10,
      range: "30 feet",
      duration: "1 round",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Necrotic",
      baseDamage: "1d8 + Int Necrotic",
      aiFavor: 0,
      favored: "Necromancer",
      limitations: "",
      quote: "The bigger they are, the deeper they’re buried.",
      description: "At your command, a Medium (4) size skeleton emerges from the ground to attack your foe in melee combat, dealing 1d8 + Int Necrotic damage. After the Attack, the skeleton collapses, creating difficult terrain in the space it occupied.",
      upgrades: {
        rank5: "The skeleton attacks twice before collapsing.",
        rank10: "The skeleton increases to size Large (5), and its Attack range is 10 feet. +1d8 base damage.",
        rank15: "The skeleton increases to size Colossal (7), and its Attack range is 15 feet. Add one Rise, Dead Minion! Rank damage die to the damage."
      }
    }
  },
  {
    _id: "dccspl0000000037",
    name: "Rootfoot",
    type: "spell",
    img: "icons/svg/cave.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 5,
      range: "30 feet",
      duration: "2 rounds",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Entangle",
      baseDamage: "",
      aiFavor: 0,
      favored: "Druid",
      limitations: "",
      quote: "The ground is never empty. It is only sleeping.",
      description: "Roots reach up from the ground to ensnare a victim of up to Size 4 (Medium). On Success, the victim gains the Held Debuff. The Rank of this Spell is used in the Opposed Difficulty to escape, instead of the default Str.",
      upgrades: {
        rank5: "Can target victims up to size Large (5). Duration is 3 rounds.",
        rank10: "Can target victims up to size Huge (6). Duration is 4 rounds.",
        rank15: "Can target victims up to size Colossal (7). The victim also gains the Poisoned Debuff."
      }
    }
  },
  {
    _id: "dccspl0000000038",
    name: "Second Chance",
    type: "spell",
    img: "icons/svg/heal.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 10,
      range: "10 feet",
      duration: "1 minute",
      cooldown: "None",
      spellType: "Passive",
      damageType: "Reanimation",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Everyone deserves one. Except for Phil. Never Phil.",
      description: "You raise a Mob with a level lower than your own from the dead. The Mob temporarily becomes your Undead Minion with half of its original Health Bar slots. You spend one Action to command it, then it acts independently with 1 Move Action and 1 other Action (usually an Attack) until given new instructions.",
      upgrades: {
        rank5: "The Mob can be up to 5 levels higher than you, and the duration is 5 minutes.",
        rank10: "The Mob can be up to 10 levels higher than the caster, with a duration of 15 minutes.",
        rank15: "The Mob can be up to 15 levels higher than the caster, with a duration of 45 minutes."
      }
    }
  },
  {
    _id: "dccspl0000000039",
    name: "Shield",
    type: "spell",
    img: "icons/svg/shield.svg",
    system: {
      rank: 1,
      stat: "con",
      manaCost: 8,
      range: "Self",
      duration: "5 minutes",
      cooldown: "None",
      spellType: "Interrupt",
      damageType: "Force Field",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "You can’t heal a Shield.",
      quote: "Enjoy the illusion of safety.",
      description: "You are surrounded by a translucent force field that moves with you and reduces non-magic damage you take. The Shield has 2 Health Bar slots, each with your Con Mod. When you take damage, reduce these Health Bar slots first. The Spell ends early if the shield loses all its Health Bar slots. You can’t heal a Shield.",
      upgrades: {
        rank5: "The Shield has 5 Health Bar slots.",
        rank10: "The Shield has 10 Health Bar slots.",
        rank15: "The Shield has 15 Health Bar slots."
      }
    }
  },
  {
    _id: "dccspl0000000040",
    name: "Shock Treatment",
    type: "spell",
    img: "icons/svg/lightning.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 2,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Electric",
      baseDamage: "1d2 + Int Electric",
      aiFavor: 2,
      favored: "",
      limitations: "",
      quote: "Electrical therapy initiated; consent not required.",
      description: "Like a deranged emperor, bolts of electricity shoot out from your fingers.",
      upgrades: {
        rank5: "+1d2 base damage, and you may choose to afflict the target with the Stunned Debuff instead of dealing damage.",
        rank10: "+1d2 base damage, and add 1 Rank damage die (Electric) at the end of the round.",
        rank15: "+1d2 base damage, and if you make this attack at melee range, you deal ×5 the total damage."
      }
    }
  },
  {
    _id: "dccspl0000000041",
    name: "Solsplash",
    type: "spell",
    img: "icons/svg/sun.svg",
    system: {
      rank: 1,
      stat: "con",
      manaCost: 13,
      range: "30 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Fire",
      baseDamage: "1d8 + Con Fire",
      aiFavor: 0,
      favored: "Druid",
      limitations: "",
      quote: "The sun is merely a star close enough to hate us.",
      description: "Beams of concentrated “sunlight” fall upon the victim and those around them. Sunscreen’s not gonna help.",
      upgrades: {
        rank5: "+1d8 base damage, +5ft Splash.",
        rank10: "+1d8 base damage and +10ft Splash. Each affected entity who loses at least 3 Health Bar slots this way gains the Burned Debuff.",
        rank15: "+1d8 base damage and +15ft Splash."
      }
    }
  },
  {
    _id: "dccspl0000000042",
    name: "Soul Collector",
    type: "spell",
    img: "icons/svg/skull.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 4,
      range: "50 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Necrotic",
      baseDamage: "1d4 + Int Necrotic",
      aiFavor: 1,
      favored: "",
      limitations: "",
      quote: "This soul appears… reusable.",
      description: "With a twist of your hand, you siphon the spirit from your target.",
      upgrades: {
        rank5: "+1d4 base damage, and if this Spell deals the killing blow to a foe of at least half your level, it deals +1 bonus damage until you complete a long rest. This damage bonus is cumulative up to the Spell’s Rank.",
        rank10: "+1d4 base damage, and the bonus continues for one week.",
        rank15: "+1d4 base damage, and the bonus continues for as long as you remain on your current floor."
      }
    }
  },
  {
    _id: "dccspl0000000043",
    name: "Thunderlash",
    type: "spell",
    img: "icons/svg/sound.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 12,
      range: "50 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Sonic",
      baseDamage: "1d10 + Int Sonic",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Loud noises and bad decisions go hand-in-hand.",
      description: "You unleash a whip-like emanation of pure sound which thunders through the air.",
      upgrades: {
        rank5: "+1d10 base damage.",
        rank10: "+1d10 base damage, and this attack deals Armor-Piercing damage (ignores DR).",
        rank15: "+1d10 base damage, and you can change the range to a 15ft Cone attack."
      }
    }
  },
  {
    _id: "dccspl0000000044",
    name: "Torch",
    type: "spell",
    img: "icons/svg/fire.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 1,
      range: "Self",
      duration: "Until saferoom/new floor",
      cooldown: "None",
      spellType: "Passive",
      damageType: "Illumination",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Congratulations. You can now see what’s trying to kill you.",
      description: "You create a magical orb of light that follows slightly above and behind you. It provides bright light for a 20ft radius and dim light for a 20ft radius past that.",
      upgrades: {
        rank5: "You can move the orb up to 20 feet away from you.",
        rank10: "You can move the orb up to 60 feet away from you and can double the radius of the brightness with a thought.",
        rank15: "You can move the orb up to 100 feet away from you and attach it to a surface as an Action."
      }
    }
  },
  {
    _id: "dccspl0000000045",
    name: "Tripper",
    type: "spell",
    img: "icons/svg/hazard.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 0,
      range: "30ft Burst radius",
      duration: "Instantaneous",
      cooldown: "5 hours",
      spellType: "Passive",
      damageType: "Detonation",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Does not detonate traps with very specific triggers. Must be imbued onto something you are wearing.",
      quote: "Let’s see if they know we’re coming.",
      description: "With a snap of your fingers, every movement, heat, and weight-triggered trap in the area “goes off.” Blades swing, bombs blow, and creatures are released.",
      upgrades: {
        rank5: "+Intelligence Burst radius.",
        rank10: "+Intelligence Burst radius.",
        rank15: "+Intelligence Burst radius, and all damage taken is considered Splash (half damage)."
      }
    }
  },
  {
    _id: "dccspl0000000046",
    name: "Turn Undead",
    type: "spell",
    img: "icons/svg/sun.svg",
    system: {
      rank: 1,
      stat: "cha",
      manaCost: 9,
      range: "10ft Cone",
      duration: "3 rounds",
      cooldown: "5 minutes",
      spellType: "Attack",
      damageType: "Holy",
      baseDamage: "",
      aiFavor: 0,
      favored: "Bard, Cleric, & Paladin",
      limitations: "Does not work against Bosses.",
      quote: "What is dead should stay dead… and far away.",
      description: "Make a single Cha-Opposed Spell Check vs. the Undead Mobs in the affected area. On Success, the Undead Mob runs away for the duration of the Spell.",
      upgrades: {
        rank5: "+5ft Cone. Duration is 5 rounds.",
        rank10: "+10ft Cone. Duration is 10 rounds.",
        rank15: "+15ft Cone. Duration is 15 rounds. On an Amazing Success or better, the Undead Mob is destroyed."
      }
    }
  },
  {
    _id: "dccspl0000000047",
    name: "Twinkle Toes",
    type: "spell",
    img: "icons/svg/paw.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 2,
      range: "5 feet",
      duration: "Sec = Int Mod",
      cooldown: "None",
      spellType: "Intelligence",
      damageType: "Buff",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "Target a pet or minion within range.",
      quote: "Fly my pretties, fly!",
      description: "Target a pet or minion within range. It has Move ×2 for the duration.",
      upgrades: {
        rank5: "The pet or minion has Move ×3 for the duration.",
        rank10: "The pet or minion has Move ×4 for the duration.",
        rank15: "The pet or minion has Move ×5 for the duration."
      }
    }
  },
  {
    _id: "dccspl0000000048",
    name: "Unnecessary Force",
    type: "spell",
    img: "icons/svg/explosion.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 13,
      range: "40 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Force",
      baseDamage: "1d12 + Int Force",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Excessive force authorized. Paperwork waived.",
      description: "A shockwave akin to that of an A-bomb crashes over your target.",
      upgrades: {
        rank5: "+1d12 base damage.",
        rank10: "+1d12 base damage, and the target is pushed 10 feet.",
        rank15: "+1d12 base damage, and the target is pushed 15 feet."
      }
    }
  },
  {
    _id: "dccspl0000000049",
    name: "Vine Porn",
    type: "spell",
    img: "icons/svg/tree.svg",
    system: {
      rank: 1,
      stat: "con",
      manaCost: 3,
      range: "20 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Piercing",
      baseDamage: "1d4 + Con Piercing",
      aiFavor: 1,
      favored: "Druid",
      limitations: "",
      quote: "It’s like tentacle porn, but with vines… sorry, Mom.",
      description: "Magical vines with pulsating veins shoot up from the ground or sprout from the target’s own body to rip and tear and smack them around a bit.",
      upgrades: {
        rank5: "+1d4 base damage.",
        rank10: "+1d4 base damage, and this Attack deals Armor-Piercing damage (ignores DR).",
        rank15: "+1d4 base damage. On a Critical Hit, the target takes ×4 damage."
      }
    }
  },
  {
    _id: "dccspl0000000050",
    name: "Wall of Fire",
    type: "spell",
    img: "icons/svg/fire.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 15,
      range: "30 feet",
      duration: "2 rounds",
      cooldown: "None",
      spellType: "Passive",
      damageType: "Fire",
      baseDamage: "1d2 Fire/ft",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "You’re gonna fall in… to a burnin’ ring of fire.",
      description: "Creates a 30ft-long × 7ft-high × 2ft-thick wall of fire. Deals 1d2 Fire for every 1ft of wall the victim passes through, and they gain the Burned Debuff.",
      upgrades: {
        rank5: "+1d2 base damage. The wall can be turned into a ring of fire. Duration is 5 rounds.",
        rank10: "+1d2 base damage. Creates a 50ft-long × 10ft-high × 3ft-thick wall. Duration is 10 rounds.",
        rank15: "+1d2 base damage. Creates a 100ft-long × 20ft-high × 5ft-thick wall. Duration is 15 rounds."
      }
    }
  },
  {
    _id: "dccspl0000000051",
    name: "Water Breathing",
    type: "spell",
    img: "icons/svg/water.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 2,
      range: "Self",
      duration: "Sec = Int Mod x 3",
      cooldown: "None",
      spellType: "Intelligence",
      damageType: "Utility",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "It’s okay to inhale.",
      description: "The target can breathe underwater without issue.",
      upgrades: {
        rank5: "You may now cast this upon others at a range of 5 feet.",
        rank10: "The targets roll Swimming Skill Checks with Advantage.",
        rank15: "You can target any or all individuals within a 15ft Burst radius."
      }
    }
  },
  {
    _id: "dccspl0000000052",
    name: "Web",
    type: "spell",
    img: "icons/svg/net.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 6,
      range: "20ft Cone",
      duration: "2 rounds",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Entangle",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Blast your goo onto foes!",
      description: "A cone of sticky webbing shoots from your fingers. Make a single Spell Attack Skill Check vs. each friend and foe’s Evade (if any). On Success, that entity gains the Held Debuff. The Rank of this spell is used in the Opposed Difficulty to escape, instead of Str.",
      upgrades: {
        rank5: "+5ft Cone. Duration is 5 rounds.",
        rank10: "+10ft Cone. Duration is 10 rounds.",
        rank15: "+15ft Cone. Duration is 15 rounds."
      }
    }
  },
  {
    _id: "dccspl0000000053",
    name: "Wilbur's Slow-Build Fireblast",
    type: "spell",
    img: "icons/svg/fire.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 60,
      range: "50 feet",
      duration: "Instantaneous",
      cooldown: "None",
      spellType: "Attack",
      damageType: "Fire",
      baseDamage: "1d8 + Int Fire",
      aiFavor: 0,
      favored: "",
      limitations: "Only one ring may be held at a time.",
      quote: "Hold. Hold! HOLD!",
      description: "This Spell can be cast and held as a swirling ring of fire around your ring finger until you unleash it. Only one ring may be held at a time. The next time you perform an Attack Action, it must be this Spell (at no additional Mana cost). If anyone touches the ring with the intent to diffuse it (you may oppose that Action), the Attack hits them for half damage. The appendage they touched you with smolders, useless for a number of rounds equal to the damage inflicted. Base damage deals 1d8 + Int Fire, and the target gains the Burned Debuff.",
      upgrades: {
        rank5: "+1d8 base damage. For each full day you hold the spell, +1d8 Fire damage.",
        rank10: "+1d8 base damage and +5ft Splash.",
        rank15: "+1d8 base damage and +5ft Splash."
      }
    }
  },
  {
    _id: "dccspl0000000054",
    name: "Wisp Armor",
    type: "spell",
    img: "icons/svg/shield.svg",
    system: {
      rank: 1,
      stat: "int",
      manaCost: 5,
      range: "Self",
      duration: "5 minutes",
      cooldown: "5 minutes",
      spellType: "Passive",
      damageType: "Defense",
      baseDamage: "",
      aiFavor: 0,
      favored: "",
      limitations: "",
      quote: "Empty minds are surprisingly easy to protect.",
      description: "You conjure a protective barrier that reduces all magic damage (typically Spells) down to its Rank 1 base damage (1 die + Stat Mod) without any Upgrades or other bonuses. This Spell also makes you immune to Mind Control.",
      upgrades: {
        rank5: "The duration is 10 minutes.",
        rank10: "The duration is 15 minutes.",
        rank15: "The duration is 20 minutes."
      }
    }
  }
];
