export const DCC_RACES = [
  {
    "_id": "dccrce0000000001",
    "name": "Amazonian",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who have at least one Strength or Dexterity-based Skill at Rank 5+",
      "description": "<p>Amazonians are a Race of tall, well-built humanoid women from Earth mythology who are known for their athleticism. Upon choosing this Race, crawlers gain an additional foot in height and bulk up to bodybuilder levels of swole. Amazonians excel at contests of physical Strength and Endurance but have little innate magical ability. This Race is an ideal choice for Fighter and Monk-based Classes.</p>",
      "abilities": "<ul><li>+6 Strength</li><li>+3 Dexterity</li><li>+2 Bow, Endurance, and Pugilism Skills</li><li>+2 DR</li><li>Each floor, you receive a coupon good for one free training at a weapon training Guild</li></ul>",
      "perks": [
        "+6 Strength",
        "+3 Dexterity",
        "+2 Bow, Endurance, and Pugilism Skills",
        "+2 DR",
        "Each floor, you receive a coupon good for one free training at a weapon training Guild"
      ],
      "stats": {
        "str": 6,
        "dex": 3,
        "con": 0,
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
          "name": "Bow",
          "rank": 2
        },
        {
          "name": "Endurance",
          "rank": 2
        },
        {
          "name": "Pugilism",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000002",
    "name": "Arachnid",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>The way a creepy smile spreads across a face with too many eyes makes the Arachnids one of the most mistrusted Races in the World Dungeon. They’re a popular choice among crawlers, especially with cultures that revered spiders (like the Akan peoples and Marvel fans who only like Spider-Man). Their humanoid torsos on a spider’s frame give them a terrifying appearance, but they are well known for playing beautiful harp music (using silk chords), weaving silken tapestries honoring their conquests, and obsessing over death. Arachnids feel at home on the ceiling and hiding in the shadows, content to watch events play out while planning the moment to strike. Still, as much as they are obsessed with death and plotting, they are a jovial Race who express their creative side at every opportunity. Arachnids make excellent Bards and Rogues.</p>",
      "abilities": "<ul><li>+5 Dexterity</li><li>+3 Web Spell, which costs half the normal Mana to cast</li><li>+2 Climbing, Perception, and Performance (with a stringed instrument specialty) Skills</li><li>You have an innate Climb Move equal to your normal Move value, without needing Checks (unless under duress)</li></ul>",
      "perks": [
        "+5 Dexterity",
        "+3 Web Spell, which costs half the normal Mana to cast",
        "+2 Climbing, Perception, and Performance (with a stringed instrument specialty) Skills",
        "You have an innate Climb Move equal to your normal Move value, without needing Checks (unless under duress)"
      ],
      "stats": {
        "str": 0,
        "dex": 5,
        "con": 0,
        "int": 0,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 20,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [],
      "spells": [
        {
          "name": "Web",
          "rank": 3
        }
      ]
    }
  },
  {
    "_id": "dccrce0000000003",
    "name": "Cat",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Small (2); Animal",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who are already a Cat",
      "description": "<p>Cats are ordinary felines of unimpressive size common in Earth households across the world. You might not expect a Cat’s sleek grace and supernatural luck to go to their head, but Cats have considered themselves the true and rightful rulers of Earth since before the days of ancient Egypt. Note that a recent update to Syndicate Race standards has benefited the Cat, among other Races.</p>",
      "abilities": "<ul><li>+4 Dexterity</li><li>-2 Constitution</li><li>-1 Charisma</li><li>-3 Strength</li><li>+3 Cat-like Reflexes</li><li>+2 Slice Attack Skill</li><li>Can see in total darkness</li><li>Advantage on Cat-like Reflexes Skill Checks</li><li>Nine Lives: Take half damage from the first 9 attacks each day</li><li>Vulnerability: Take double damage from Dogs and Beasts</li></ul>",
      "perks": [
        "+4 Dexterity",
        "-2 Constitution",
        "-1 Charisma",
        "-3 Strength",
        "+3 Cat-like Reflexes",
        "+2 Slice Attack Skill",
        "Can see in total darkness",
        "Advantage on Cat-like Reflexes Skill Checks",
        "Nine Lives: Take half damage from the first 9 attacks each day",
        "Vulnerability: Take double damage from Dogs and Beasts"
      ],
      "stats": {
        "str": -3,
        "dex": 4,
        "con": -2,
        "int": 0,
        "cha": -1
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
          "name": "Slice",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000004",
    "name": "Cat Girl/Cat Boy",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Cat Girls/Boys are special offshoots of humanity that possess the best qualities of a Cat (though many pretend to be humble and demure to hide their ferocity and cunning). possessing feline traits on top of a Human form, Cat Girls/Boys might appear mostly Human, save for furry ears atop the head or a tail, or they might appear like a humanoid lioness/ lion in a maid’s dress. Most other species get along with Cat Girls/Boys, though natural felines often view their existence as an abomination. This Race is a great choice for Bard and Mage Classes.</p>",
      "abilities": "<ul><li>+3 Dexterity and Charisma</li><li>-2 Constitution</li><li>+2 Cat-like Reflexes, Good First Impression, Light on your Feet, and Slice Attack Skills</li><li>Your Slice Attacks may add your Cha Mod to the damage instead of Str</li><li>Toxoplasma G.: Once per day, your allies have Rank 5 Catcher Skill (and the +5 DR Upgrade!) for one round to protect only you from attacks about to hit you. Those who do gain 1 AI Favor</li><li>When dealing with felines other than Cat Girls/Boys, you make Charisma-based Skill Checks with Disadvantage</li></ul>",
      "perks": [
        "+3 Dexterity and Charisma",
        "-2 Constitution",
        "+2 Cat-like Reflexes, Good First Impression, Light on your Feet, and Slice Attack Skills",
        "Your Slice Attacks may add your Cha Mod to the damage instead of Str",
        "Toxoplasma G.: Once per day, your allies have Rank 5 Catcher Skill (and the +5 DR Upgrade!) for one round to protect only you from attacks about to hit you. Those who do gain 1 AI Favor",
        "When dealing with felines other than Cat Girls/Boys, you make Charisma-based Skill Checks with Disadvantage"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
        "con": -2,
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
          "name": "Cat-Like Reflexes",
          "rank": 2
        },
        {
          "name": "Good First Impression",
          "rank": 2
        },
        {
          "name": "Light on Your Feet",
          "rank": 2
        },
        {
          "name": "Slice",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000005",
    "name": "Changbi Demon",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>The sound of chains clinking against the floor heralds a Changbi Demon, an undead demonic crawler Race from Earth folklore. Changbi Demons are tall and slender with a pale gray-green tinge to their skin. Some Changbi Demons also sport horns, claws, and sharp teeth. Changbi Demons are innately tuned to sense divinity and those who worship gods and deities. This Race is an ideal choice for Fighters, Rogues, Assassins, and other martial Classes.</p>",
      "abilities": "<ul><li>+5 Dexterity</li><li>-3 Strength and Constitution</li><li>-2 Charisma</li><li>+3 Ambush and Creepy Chains (Club) Skills</li><li>Creepy Chains : Can use any chain as a weapon (use the Club weapon Skill, but with a 10ft range). A Changbi Demon can lengthen or shorten any chain by 50% once per scene</li><li>Each time a foe touches a Changbi Demon with their bare skin (such as with Hand-to-Hand attacks), that foe takes 1d4+F Acid</li><li>No need to breathe</li><li>vulnerable to Holy damage</li><li>Cannot w orship a deity</li></ul>",
      "perks": [
        "+5 Dexterity",
        "-3 Strength and Constitution",
        "-2 Charisma",
        "+3 Ambush and Creepy Chains (Club) Skills",
        "Creepy Chains : Can use any chain as a weapon (use the Club weapon Skill, but with a 10ft range). A Changbi Demon can lengthen or shorten any chain by 50% once per scene",
        "Each time a foe touches a Changbi Demon with their bare skin (such as with Hand-to-Hand attacks), that foe takes 1d4+F Acid",
        "No need to breathe",
        "vulnerable to Holy damage",
        "Cannot w orship a deity"
      ],
      "stats": {
        "str": -3,
        "dex": 5,
        "con": -3,
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
      "skills": [],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000006",
    "name": "Changeling",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Large (5)",
      "prerequisites": "",
      "description": "<p>A Changeling wears many faces—as many as they’ve had the pleasure (or displeasure) of meeting. Many examples of shape-stealing nightmares come from across the galaxy, making Changelings right at home among the stories Earthlings warned their children about. Like Doppelgängers, Changelings can change their form, but while Doppelgängers maintain their base stats, Changelings apply the stats of whatever form they assume. Able to slip unseen into any crowd as an anonymous stranger or to infiltrate close-knit groups by wearing the face of a friend, Changelings make powerful friends and dangerous enemies. This Race is an ideal choice for Rogue and magic-using Classes.</p>",
      "abilities": "<ul><li>+3 Charisma</li><li>-2 Intelligence</li><li>+2 Ambush and Decep tion Skills</li><li>+1 Escape Ar tist Skill</li><li>Advantage on Deception Skill Checks when no talking is needed</li><li>Changelings gain free Access to organizations and producers by impersonating other crawlers and Syndicate celebrities, but can only use those relevant to the currently shifted individual</li><li>Changeling Shapeshifting: A Changeling who touches a member of another Race can shapeshift themselves into that Race, building a “library” of Races they can transform into. A Changeling can shapeshift into another Race as an Action to make an Unopposed Deception Skill Check. While shapeshifted into that other Race, they gain that Race’s bonuses other than statistics and Skills. For example, a Changeling shapeshifted into a Crocodilian would gain the Race’s Advantage on Intimidation Skill Checks, DR Buff, bonus after a full meal, and additional fatigue penalty on Charisma-based Checks</li><li>While shapeshifted into another Race, these changes are conveyed to World Dungeon systems, including information on viewers’ HUDs, mini-maps, and other systems</li><li>Changelings can’t touch mimicstype creatures. Don’t ask why or what happens—it’s bad</li></ul>",
      "perks": [
        "+3 Charisma",
        "-2 Intelligence",
        "+2 Ambush and Decep tion Skills",
        "+1 Escape Ar tist Skill",
        "Advantage on Deception Skill Checks when no talking is needed",
        "Changelings gain free Access to organizations and producers by impersonating other crawlers and Syndicate celebrities, but can only use those relevant to the currently shifted individual",
        "Changeling Shapeshifting: A Changeling who touches a member of another Race can shapeshift themselves into that Race, building a “library” of Races they can transform into. A Changeling can shapeshift into another Race as an Action to make an Unopposed Deception Skill Check. While shapeshifted into that other Race, they gain that Race’s bonuses other than statistics and Skills. For example, a Changeling shapeshifted into a Crocodilian would gain the Race’s Advantage on Intimidation Skill Checks, DR Buff, bonus after a full meal, and additional fatigue penalty on Charisma-based Checks",
        "While shapeshifted into another Race, these changes are conveyed to World Dungeon systems, including information on viewers’ HUDs, mini-maps, and other systems",
        "Changelings can’t touch mimicstype creatures. Don’t ask why or what happens—it’s bad"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
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
          "name": "Ambush",
          "rank": 2
        },
        {
          "name": "Deception",
          "rank": 2
        },
        {
          "name": "Escape Artist",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000007",
    "name": "Crocodilian",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Large (5)",
      "prerequisites": "",
      "description": "<p>With a snout full of bone-chomping teeth and hands that will wring necks so hard that the head just falls off afterward, the bipedal wrecking machines known as Crocodilians are, pound for pound, among the most ferocious reptiles walking the Crawl. When it comes to fighting, their thick scales and predatory instincts serve Crocodilians very well. As an anthropomorphic version of one of Earth’s most vicious predators, these cold-blooded killers are here to prove they’re among the galaxy’s most dangerous denizens. Crocodilians need to consume a large amount of food each day just to stay active. That hunger is a constant companion, but aside from that, a Crocodilian is a resilient, positively terrifying killing machine that thrives in swamps, aquatic environments, and petting zoos (all of which are rich in food). Crocodilians make excellent Barbarians, Fighters, and Monks.</p>",
      "abilities": "<ul><li>-4 Strength</li><li>+3 Constitution</li><li>+2 Pugilism and Po werful Strike Skills</li><li>When phy sically menacing someone in person, roll Intimidate Skill Checks with Advantage</li><li>+3 DR Buff</li><li>+1 Buff for all of your Skill Checks for 1 hour after eating a full meal</li><li>While you ha ve the Fatigued Debuff, roll all Charisma-based Checks with Disadvantage</li></ul>",
      "perks": [
        "-4 Strength",
        "+3 Constitution",
        "+2 Pugilism and Po werful Strike Skills",
        "When phy sically menacing someone in person, roll Intimidate Skill Checks with Advantage",
        "+3 DR Buff",
        "+1 Buff for all of your Skill Checks for 1 hour after eating a full meal",
        "While you ha ve the Fatigued Debuff, roll all Charisma-based Checks with Disadvantage"
      ],
      "stats": {
        "str": -4,
        "dex": 0,
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
          "name": "Pugilism",
          "rank": 2
        },
        {
          "name": "Powerful Strike",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000008",
    "name": "Doppelgänger",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Unchanged, but size changes when shifting",
      "prerequisites": "",
      "description": "<p>Doppelgängers are shapeshifters, but they aren’t just about changing their appearance to match someone else. Earth must have had some really fucked up history for two kinds of shape-stealing boogey monsters to feature so prevalently—no wonder you’re so freaked out about your uncanny valley. In fact, Doppelgängers require a lot of practice before they can change into someone specific, and even general changes are painful and require a basic level of artistry and a good mirror. A Doppelgänger can mold its malleable body like tough clay. For all the flexibility of their form, Doppelgängers can’t change their mass, and that includes the mass of any equipment they are wearing or carrying, which must become a part of whatever form they take. This makes Doppelgängers a very adaptable Race, as they’re able to pick up something of unusual composition and integrate it into their own form, but they’re not capable of assuming identities as quickly or effectively as a Changeling. Doppelgängers are sturdy and make great front-line Fighters and Paladins.</p>",
      "abilities": "<ul><li>-4 Constitution</li><li>-3 Strength</li><li>+1 Decep tion and Endurance Skills</li><li>+2 DR</li><li>Due to shift ing mass, can determine their maximum weight to lift based on Constitution instead of Strength</li><li>Advantage on Escape Artist Skill Checks and can make such Checks while being Held or watched</li><li>Once per scene , as an Action, you can incorporate a held weapon into their mass to deal additional damage equal to their Con Mod. Items incorporated this way can’t be disarmed</li><li>Doppelgänger Shape-Changing: As an Action, you can transform into any shape of comparable mass, incorporating carried and worn items into the new shape in the same percentage (that is, a Doppelgänger holding metal equal to half their weight must assume a shape that is one-third metal). This transformation is painful, causing you to mark off 1 Health Bar slot per change. If you attempt to change your shape to resemble a specific person or object, do so with an Unopposed Deception Skill Check</li></ul>",
      "perks": [
        "-4 Constitution",
        "-3 Strength",
        "+1 Decep tion and Endurance Skills",
        "+2 DR",
        "Due to shift ing mass, can determine their maximum weight to lift based on Constitution instead of Strength",
        "Advantage on Escape Artist Skill Checks and can make such Checks while being Held or watched",
        "Once per scene , as an Action, you can incorporate a held weapon into their mass to deal additional damage equal to their Con Mod. Items incorporated this way can’t be disarmed",
        "Doppelgänger Shape-Changing: As an Action, you can transform into any shape of comparable mass, incorporating carried and worn items into the new shape in the same percentage (that is, a Doppelgänger holding metal equal to half their weight must assume a shape that is one-third metal). This transformation is painful, causing you to mark off 1 Health Bar slot per change. If you attempt to change your shape to resemble a specific person or object, do so with an Unopposed Deception Skill Check"
      ],
      "stats": {
        "str": -3,
        "dex": 0,
        "con": -4,
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
          "name": "Deception",
          "rank": 1
        },
        {
          "name": "Endurance",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000009",
    "name": "Dwarf, Classic",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Is there any RPG Race more classic than the gruff, bearded Dwarf? From Snow White to The Lord of the Rings, Dwarves have fascinated Earthlings’ imaginations for far too long. Shorter than a person and as wide as they are tall, Dwarves tend to dig and work underground, crafting items of unsurpassed beauty and durability. Dwarves are a natural fit in the tightest corridors of the World Dungeon, where their doughty Endurance and keen crafting traditions serve them well. Dwarves are quick to grouse about their troubles, even when things are otherwise going their way, and they rarely put up with frippery or foolishness. They might not all drink heavily and speak in a grumble through their beards, but you’d be hard-pressed to find one that doesn’t. Dwarves make great front-line Fighters and are excellent crafters, no matter what Class they pursue.</p>",
      "abilities": "<ul><li>-4 Constitution</li><li>-2 Intelligence</li><li>-2 Charisma</li><li>+3 in two differ ent crafting Skills of your choice</li><li>+2 Endurance Skill</li><li>Can see in total darkness</li><li>All craft ing Skills can be raised to Rank 20</li><li>When dealing with elves or fairies, make all Charisma-based Checks with Disadvantage</li></ul>",
      "perks": [
        "-4 Constitution",
        "-2 Intelligence",
        "-2 Charisma",
        "+3 in two differ ent crafting Skills of your choice",
        "+2 Endurance Skill",
        "Can see in total darkness",
        "All craft ing Skills can be raised to Rank 20",
        "When dealing with elves or fairies, make all Charisma-based Checks with Disadvantage"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": -4,
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
          "name": "Endurance",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000010",
    "name": "Dwarf, Fathom",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Fathom Dwarves, more so even than other Dwarves, have evolved and adapted to spelunk deep into mineshafts. They strap specially trained glowing lizards to their heads as light sources deep where the sun has never penetrated. No idea where this lizard symbiosis is from, but these guys are already delving so deep that Gandalf wrote their asses off as Balrog chow back on page 483 of The Silmarillion. Go ahead, look it up. Fathom Dwarves are skilled diggers and crafters with stout, hardy bodies and rough skin. They have an edge in Constitution and Strength, making them an ideal choice for Fighters, Barbarians, and crafting Classes where durability is as important as Skill.</p>",
      "abilities": "<ul><li>+3 Constitution</li><li>-2 Strength</li><li>+3 Engineerin g Skill</li><li>+2 Dumpster Di ving and Salvage Skills</li><li>Roll d20 Check s with Advantage when earth, rocks, and dirt are involved</li><li>Can produce a 15ft Cone of light from a harmless lizard nesting atop their heads, and can easily acquire a new lizard if the existing one is lost or killed</li></ul>",
      "perks": [
        "+3 Constitution",
        "-2 Strength",
        "+3 Engineerin g Skill",
        "+2 Dumpster Di ving and Salvage Skills",
        "Roll d20 Check s with Advantage when earth, rocks, and dirt are involved",
        "Can produce a 15ft Cone of light from a harmless lizard nesting atop their heads, and can easily acquire a new lizard if the existing one is lost or killed"
      ],
      "stats": {
        "str": -2,
        "dex": 0,
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
          "name": "Engineering",
          "rank": 3
        },
        {
          "name": "Dumpster Diving",
          "rank": 2
        },
        {
          "name": "Salvage",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000011",
    "name": "Elf, High",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Graceful, tall, and immortal, Elves are a species of long-limbed, pointy-eared humanoids with a natural affinity for magic. They often reside in forest groves, carefully tended over many Human generations to form natural residences, workshops, and libraries. If all this effortless aptitude seems likely to make Elves arrogant or snooty, well buckle up, brother, because they’re even worse than in the countless Earth stories that thinly veiled countless authors’ ear-point fetish. Elves consider themselves the better of nearly all other Races, particularly those Races that grub in the ground like Dwarves and Rat-Kin. Some Elves are maybe just better at not being jerks about it. Choosing this Race ensures a clear mind, easy charm, and a complexion that Hollywood starlets would kill for. This Race makes an ideal magic-user, Bard, or anyone else who wouldn’t like to get their hands dirty or stink of… ugh, effort.</p>",
      "abilities": "<ul><li>+4 Intelligence, Dexterity, and Charisma</li><li>+2 Intimida tion Skill, and you can use your Cha Mod</li><li>+1 Lore Skill</li><li>You recover Mana at twice the normal rate in a natural environment</li><li>Add 1d4 to your Evade Checks</li><li>When dealing with Dwarves, Rat-Kin, or anyone smelly or dirty, make all Charisma-based Checks with Disadvantage</li><li>Two differ ent Charisma-based Skills can be raised to Rank 20</li></ul>",
      "perks": [
        "+4 Intelligence, Dexterity, and Charisma",
        "+2 Intimida tion Skill, and you can use your Cha Mod",
        "+1 Lore Skill",
        "You recover Mana at twice the normal rate in a natural environment",
        "Add 1d4 to your Evade Checks",
        "When dealing with Dwarves, Rat-Kin, or anyone smelly or dirty, make all Charisma-based Checks with Disadvantage",
        "Two differ ent Charisma-based Skills can be raised to Rank 20"
      ],
      "stats": {
        "str": 0,
        "dex": 4,
        "con": 0,
        "int": 4,
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
          "name": "Intimida tion",
          "rank": 2
        },
        {
          "name": "Lore",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000012",
    "name": "Elf, City",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>City Elves are a subspecies of Elf that make their home in glass skyscrapers and bustling city streets rather than in groves of trees or remote castles. Not convinced these bastards came from Earth? I’d dare you to check out the depths of Urban Fantasy, or Romantasy if you’re nasty—if those still existed. Instead, your ass is stuck in the Dungeon and is going to have to trust me on this one. Lithe and tall, with pale skin and neon-colored hair, City Elves sometimes favor using modern technological interpretations of Spells and equipment compared to their more rustic kin. City Elves do not necessarily consider themselves superior to all other Races by virtue of being Elves; it’s just that all others simply fall short by comparison, and usually because of their beliefs more than their appearance. For what it’s worth, City Elves in the Dungeon are fucking morons. They are most often hypocritical sycophants and cult members who are too dumb to realize they’ve been tricked into living in a cult. But none of that has to apply to you as a crawler; it might earn you some funny looks from anyone else who has come across another City Elf in the Dungeon, though. This Race makes ideal Arcanists, Bards, or Mages.</p>",
      "abilities": "<ul><li>+6 to split as you please between Intelligence, Dexterity, and Charisma</li><li>+3 Good Fir st Impression Skill</li><li>+2 Negotiation and Streetwise Skills</li><li>Once per floor during a Long Rest, a City Elf can adjust the +4 spent between Charisma, Intelligence, and Dexterity, reassigning those points between those Stats</li><li>When entering a settlement for the first time, make your first Charisma-based Check with Advantage. On an Amazing success or better, you have made a permanent contact</li></ul>",
      "perks": [
        "+6 to split as you please between Intelligence, Dexterity, and Charisma",
        "+3 Good Fir st Impression Skill",
        "+2 Negotiation and Streetwise Skills",
        "Once per floor during a Long Rest, a City Elf can adjust the +4 spent between Charisma, Intelligence, and Dexterity, reassigning those points between those Stats",
        "When entering a settlement for the first time, make your first Charisma-based Check with Advantage. On an Amazing success or better, you have made a permanent contact"
      ],
      "stats": {
        "str": 0,
        "dex": 6,
        "con": 0,
        "int": 0,
        "cha": 6
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
          "rank": 3
        },
        {
          "name": "Negotiation",
          "rank": 2
        },
        {
          "name": "Streetwise",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000013",
    "name": "Elf, Night",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Accustomed to the darkness and navigating via the stars, Night Elves share the lithe androgynous appearance of their fellow elven kin, but their skin tones cover the spectrum of cool colors from teal to deep purple. Thank Drizzt and Blizzard for making these an Earth staple. Night Elves have longer, wider ears than other elves and an even more acute sense of hearing. Their eyes are accustomed to low light, but they have difficulty seeing in bright light, whether natural or artificial. The high Intelligence and Dexterity of Night Elves make them an ideal choice for Arcanists, Rogues, and Mages.</p>",
      "abilities": "<ul><li>+3 Intelligence and Dexterity</li><li>+3 Acut e Ears and Hide in Shadows Skills</li><li>Can see total darkness</li><li>Gain Ad vantage when you use the Hide in Shadows Skill at night</li><li>Once per da y, can instruct the shadow of a living thing to use the Taunt Skill at Rank equal to Floor Number (and no Stat Mod) to pull attacks away from you</li><li>Hide in Shadow s and one crafting Skill of your choice can be raised to Rank 20</li></ul>",
      "perks": [
        "+3 Intelligence and Dexterity",
        "+3 Acut e Ears and Hide in Shadows Skills",
        "Can see total darkness",
        "Gain Ad vantage when you use the Hide in Shadows Skill at night",
        "Once per da y, can instruct the shadow of a living thing to use the Taunt Skill at Rank equal to Floor Number (and no Stat Mod) to pull attacks away from you",
        "Hide in Shadow s and one crafting Skill of your choice can be raised to Rank 20"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
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
          "name": "Acute Ears",
          "rank": 3
        },
        {
          "name": "Hide in Shadows",
          "rank": 3
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000014",
    "name": "Frost Maiden",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Petite (3)",
      "prerequisites": "",
      "description": "<p>Chilled to the core, Frost Maidens are a Fey Race of short humanoids with ice-cold skin, pale hair, and indomitable mental fortitude that originated during European dark ages. The icy walls around their psyche give Frost Maidens an Immunity to mental infirmity. Frost Maidens are highly Charismatic and have Access to elemental ice powers, and can gain the service of their Game Guide as a Manager. This Race is a strong choice for magic-users, Bards, and Tricksters.</p>",
      "abilities": "<ul><li>-2 Charisma, Int elligence, and Dexterity</li><li>+2 Persua sion Skill</li><li>Melee attacks deal +1d4 Ice damage</li><li>Roll with Advantage on Int and Con Stat Checks</li><li>The cra wler’s Game Guide becomes their Manager</li><li>Capable of flight for up to 1 minute per scene</li></ul>",
      "perks": [
        "-2 Charisma, Int elligence, and Dexterity",
        "+2 Persua sion Skill",
        "Melee attacks deal +1d4 Ice damage",
        "Roll with Advantage on Int and Con Stat Checks",
        "The cra wler’s Game Guide becomes their Manager",
        "Capable of flight for up to 1 minute per scene"
      ],
      "stats": {
        "str": 0,
        "dex": -2,
        "con": 0,
        "int": 0,
        "cha": -2
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 20,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Persuasion",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000015",
    "name": "Human",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Typically Medium (4)",
      "prerequisites": "",
      "description": "<p>You’re already a Human. I’m gonna go out on a limb here and guess you don’t need a description. If you choose this, nothing will change, except for the scant benefits below. Choosing to remain Human offers little by way of additional Advantages, but the galaxy loves to watch Humans face the perils of the Dungeon with only their wits and tenacity to rely on!</p>",
      "abilities": "<ul><li>+2 to all St ats</li><li>At the end of each floor, roll one Skill Advancement Check with Advantage if that Skill is Rank 9 or less</li><li>Gain 1 AI Favor each time you level up</li><li>When you take damage, you may spend 1 AI Favor to gain DR equal to your Con (as many times as you have AI Favor to spend)</li><li>Once per da y, when you would make an untrained Skill Check on a non-Passive Utility Skill, you can roll as if you had 2 Ranks in the Skill</li><li>Once per floor, you can spend an Action to remove any single Debuff you’re suffering from, even Injuries</li></ul>",
      "perks": [
        "+2 to all St ats",
        "At the end of each floor, roll one Skill Advancement Check with Advantage if that Skill is Rank 9 or less",
        "Gain 1 AI Favor each time you level up",
        "When you take damage, you may spend 1 AI Favor to gain DR equal to your Con (as many times as you have AI Favor to spend)",
        "Once per da y, when you would make an untrained Skill Check on a non-Passive Utility Skill, you can roll as if you had 2 Ranks in the Skill",
        "Once per floor, you can spend an Action to remove any single Debuff you’re suffering from, even Injuries"
      ],
      "stats": {
        "str": 2,
        "dex": 2,
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
      "skills": [],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000016",
    "name": "Igneous",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Large (5)",
      "prerequisites": "",
      "description": "<p>The Earthling idea for the Igneous goes much farther back than the first stunt performer who threw on a rock costume to battle the Power Rangers. Molten rock flows through their veins, visible through the cracks in their stony flesh. This flow visibly slows when an Igneous is cold or injured. Igneous are unsurpassed in terms of Endurance and stamina. While they are not typically the fastest creatures in the universe, they can occasionally move with a burst of explosive speed to match any erupting peak. An Igneous’s rocky skin makes them ideally suited for stalking prey on their homeworld but leaves them incredibly conspicuous anywhere else. Of course, being conspicuous isn’t typically as big an issue after you’ve poured a fresh batch of lava all over anyone who might object to your presence. This Race is an ideal choice for any tank Class.</p>",
      "abilities": "<ul><li>+6 Constitution</li><li>-4 Strength</li><li>-2 Intelligence and Charisma</li><li>+1 Endurance Skill</li><li>+3 DR Buff</li><li>Once per da y, double your Move for 20 seconds</li><li>As an Action, make a Con Stat Check. On success, deal 1d8+F Fire damage, 5ft Burst radius</li><li>No Survival Checks needed in harsh heat conditions and can breathe underwater</li><li>Immunity to Fire damage, and vulnerable to Ice damage</li><li>Ability to burrow</li><li>Lose 1 Health Bar slot each time you Access your Inventory (not Hotlist)</li><li>Disadvantage on Checks to conceal your presence or nature (such as Stealth)</li><li>+2 in two Spells of your choice</li><li>+3 in one weapon Skill of your choice</li><li>Advantage when using the Ambush and Intimidation Skill</li><li>during t he day, Strength is halved, but Spells cost half the Mana to cast</li><li>during t he night, Strength is doubled, but Spells cost double the Mana to cast</li></ul>",
      "perks": [
        "+6 Constitution",
        "-4 Strength",
        "-2 Intelligence and Charisma",
        "+1 Endurance Skill",
        "+3 DR Buff",
        "Once per da y, double your Move for 20 seconds",
        "As an Action, make a Con Stat Check. On success, deal 1d8+F Fire damage, 5ft Burst radius",
        "No Survival Checks needed in harsh heat conditions and can breathe underwater",
        "Immunity to Fire damage, and vulnerable to Ice damage",
        "Ability to burrow",
        "Lose 1 Health Bar slot each time you Access your Inventory (not Hotlist)",
        "Disadvantage on Checks to conceal your presence or nature (such as Stealth)",
        "+2 in two Spells of your choice",
        "+3 in one weapon Skill of your choice",
        "Advantage when using the Ambush and Intimidation Skill",
        "during t he day, Strength is halved, but Spells cost half the Mana to cast",
        "during t he night, Strength is doubled, but Spells cost double the Mana to cast"
      ],
      "stats": {
        "str": -4,
        "dex": 0,
        "con": 6,
        "int": -2,
        "cha": -2
      },
      "drBonus": 3,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 20
      },
      "skills": [
        {
          "name": "Endurance",
          "rank": 1,
          "stat": "con",
          "checkType": "Standard",
          "canGainRanks": true,
          "category": "Combat"
        },
        {
          "name": "Lava Burst",
          "rank": 1,
          "stat": "con",
          "checkType": "Stat Check",
          "baseDamage": "1d8+F",
          "canGainRanks": false,
          "cooldown": "None",
          "category": "Combat",
          "notes": "As an Action, make a Con Stat Check. On success, deal 1d8+F Fire damage, 5ft Burst radius."
        },
        {
          "name": "Volcanic Sprint",
          "rank": 1,
          "stat": "dex",
          "checkType": "Standard",
          "canGainRanks": false,
          "cooldown": "1/Day",
          "category": "Utility",
          "notes": "Once per day, double your Move for 20 seconds."
        }
      ],
      "buffs": [
        {
          "name": "Harsh Heat Adaptation & Aquatic Respiration",
          "tier": "Major",
          "description": "No Survival Checks needed in harsh heat conditions and can breathe underwater."
        },
        {
          "name": "Fire Immunity",
          "tier": "Major",
          "description": "Immune to Fire damage."
        },
        {
          "name": "Burrowing Movement",
          "tier": "Minor",
          "description": "Ability to burrow at 20ft speed."
        }
      ],
      "debuffs": [
        {
          "name": "Ice Vulnerability",
          "tier": "Minor",
          "description": "Vulnerable to Ice damage."
        },
        {
          "name": "Inventory Heat Siphon",
          "tier": "Minor",
          "description": "Lose 1 Health Bar slot each time you access your Inventory (not Hotlist)."
        },
        {
          "name": "Conspicuous Molten Stature",
          "tier": "Minor",
          "description": "Disadvantage on Checks to conceal your presence or nature (such as Stealth)."
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000017",
    "name": "Obsidian Butterfly",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4), mostly due to wings",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who earn Rank 5+ with any Edged weapon",
      "description": "<p>Obsidian Butterflies are much like the Aztec deity that inspired them. They are deadly, graceful, and absolutely terrifying. These skeleton-faced figures move about the battlefield with frightening speed, blessing their allies and bringing devastation to their foes. Their wings contain hues of orange, red, black, and white, blending together in a colorful pattern. The vibrancy and speed of their wings can make them appear borne aloft by naked flame. More than one foe has chosen to flee the sight of an Obsidian Butterfly bearing down upon them.</p>",
      "abilities": "<ul><li>+3 Dexterity</li><li>-2 Intelligence</li><li>-4 Constitution</li><li>+2 Intimida te and Slice Attack Skills</li><li>+2 in a Spell of your c hoice</li><li>Has f our translucent butterfly wings that can reach up to 15 feet and deliver touch- or melee-range Spells</li><li>May use Cha Mod instead of Con Mod in their Health Bar</li><li>Upon entering the Sixth Floor, choose to either gain Stronger Wings (wings are now capable of flight for up to 2 minutes per scene, with +20ft Move when flying) or Ferocious Visage (Advantage when using any Skill to inspire fear or respect)</li><li>Add 1d4 to your Evade Checks</li></ul>",
      "perks": [
        "+3 Dexterity",
        "-2 Intelligence",
        "-4 Constitution",
        "+2 Intimida te and Slice Attack Skills",
        "+2 in a Spell of your c hoice",
        "Has f our translucent butterfly wings that can reach up to 15 feet and deliver touch- or melee-range Spells",
        "May use Cha Mod instead of Con Mod in their Health Bar",
        "Upon entering the Sixth Floor, choose to either gain Stronger Wings (wings are now capable of flight for up to 2 minutes per scene, with +20ft Move when flying) or Ferocious Visage (Advantage when using any Skill to inspire fear or respect)",
        "Add 1d4 to your Evade Checks"
      ],
      "stats": {
        "str": 0,
        "dex": 3,
        "con": -4,
        "int": -2,
        "cha": 0
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 20,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Intimidate",
          "rank": 2
        },
        {
          "name": "Slice",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000018",
    "name": "Lajabless",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Lajabless, creatures from Caribbean folklore, live two lives: by day, they walk the Dungeon as beautiful people, casting Spells with ease, but are weak in Strength. At night, their face turns hideous and cavernous as their magic wanes, giving way to powerful Strength. Lajabless must walk the balance between magic and martial Skill, beauty and horror, demon and Human. To show they constantly straddle these worlds, Lajabless usually have, no matter their current aspect, one humanoid leg and one animal leg (often that of a cow or goat). The versatile shifting nature of the Lajabless makes this Race an ideal choice for crawlers who want a diverse half-caster build.</p>",
      "abilities": "<ul><li>+5 Intelligence during the day, +5 Strength during the night</li></ul>",
      "perks": [
        "+5 Intelligence during the day, +5 Strength during the night"
      ],
      "stats": {
        "str": 0,
        "dex": 0,
        "con": 0,
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
      "skills": [],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000019",
    "name": "Primal",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Unchanged",
      "prerequisites": "",
      "description": "<p>For the first several seasons of Dungeon Crawler World, all contestants started off as Primals. Primals are blank slates, and your appearance does not change. The Primal Race offers little by way of specialization, but the Earth Classes you’ll have Access to make up for it. Find your current Race in this section of the book and apply those racial benefits. However, list your Race as Primal, and then apply these modifiers:</p>",
      "abilities": "<ul><li>Size: Unchanged</li><li>-1 to all Stats</li><li>All Skills can be raised to Rank 20</li></ul>",
      "perks": [
        "-1 to all St ats",
        "All Skills can be raised to Rank 20 THE WORLD Dungeon ON HARD MODE: PRIMALS Primals were the first known species to conquer the universe. After, they seemingly disappeared and have since become “the boogeymen of the cosmos.” In the first Dungeon Crawler World seasons, every crawler was a Primal, but since then, they’ve been relegated to the back catalog, behind all of the shiny and popular Race choices. Choosing a Primal is taking the World Dungeon on hard mode—you’re declining the many significant bonuses of choosing another Race (even plain old humans have more benefits) and accepting a penalty to all of your stats in exchange for the opportunity to raise any Skill above the World Dungeon’s soft cap of 15 Ranks. Raising a Skill to 15 is already difficult, requiring concentration to reach that degree of mastery. Primals get that challenge and say “Hold my beer” as they careen into maximizing as many of their Skills as possible. If you make this choice, we salute you—but don’t say we didn’t warn you."
      ],
      "stats": {
        "str": -1,
        "dex": -1,
        "con": -1,
        "int": -1,
        "cha": -1
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
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000020",
    "name": "Rat Hooligan",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Petite (3)",
      "prerequisites": "",
      "description": "<p>Rat-Kin have a reputation for being survivors, from the tales of rat-people whispered around candlelight in ancient times to Master Splinter serving as a beloved sewer-bound mentor. One of the more common Mobs in the early floors of the World Dungeon, Rat-Kin have surged forth from their warrens to resist the wholesale slaughter of their species. A crawler that chooses this Race becomes one of hundreds of siblings across all Dungeon floors. Rat-Kins’ propensity to hide in places considered gross or unnatural allows them to traverse the floors surreptitiously, gathering secrets and carrying messages. Rat Hooligans make ideal Rogues and capable magic-users.</p>",
      "abilities": "<ul><li>+2 Dexterity</li><li>+1 Constitution</li><li>+2 Escape Plan and Stealth Skills</li><li>+1 Bite and Survival Skills</li><li>Advantage on Checks to resist hunger and thirst</li><li>Can con verse with common house rats to gather minimal information while in buildings</li><li>May add Dex Mod to Bite damage instead of Str</li></ul>",
      "perks": [
        "+2 Dexterity",
        "+1 Constitution",
        "+2 Escape Plan and Stealth Skills",
        "+1 Bite and Survival Skills",
        "Advantage on Checks to resist hunger and thirst",
        "Can con verse with common house rats to gather minimal information while in buildings",
        "May add Dex Mod to Bite damage instead of Str"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 1,
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
          "name": "Escape Plan",
          "rank": 2
        },
        {
          "name": "Stealth",
          "rank": 2
        },
        {
          "name": "Bite",
          "rank": 1
        },
        {
          "name": "Survival",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000021",
    "name": "Sasquatch",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Large (5)",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who have attained Rank 5+ in the Smush Skill",
      "description": "<p>Bigfoot. Yeti (if you choose an ice-based Class). Skunk Ape. The list of nicknames for these privacy-minded Earth creatures is almost endless, but in the end, the result is the same. First, you take a Human, you cross it with a gorilla, you make them a foot-and-a-half taller, cover them with hair, and then give them size 24 feet. The resulting behemoth is a monstrous melee warrior and tank that smells like shit but hits (and smushes) like a sledgehammer.</p>",
      "abilities": "<ul><li>+6 Strength and Constitution</li><li>+2 Dexterity</li><li>-3 Intelligence</li><li>-1 Charisma</li><li>+3 Foot Soldier and Smush Skills</li><li>Smush Skill can be raised to Rank 20</li></ul>",
      "perks": [
        "+6 Strength and Constitution",
        "+2 Dexterity",
        "-3 Intelligence",
        "-1 Charisma",
        "+3 Foot Soldier and Smush Skills",
        "Smush Skill can be raised to Rank 20"
      ],
      "stats": {
        "str": 6,
        "dex": 2,
        "con": 6,
        "int": -3,
        "cha": -1
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
          "name": "Foot Soldier",
          "rank": 3
        },
        {
          "name": "Smush",
          "rank": 3
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000022",
    "name": "Tetrakai",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>What you notice first says a lot about you. Was it the blue skin or the four arms? This Race is traditionally offered to female crawlers, but some male Tetrakai have been spotted— literally. Male Tetrakai have white polka-dot spots the size of poker chips. Now you know why you don’t see many. As you can imagine, having four arms is pretty nice, though I don’t know what the males do with the other three. Holding four items at a time offers all sorts of juicy benefits. Too bad you don’t have four actions, amirite?</p>",
      "abilities": "<ul><li>+6 Dexterity</li><li>-2 Charisma</li><li>+2 Pugilism and Wr asslin’ Skills</li><li>+1 in all Edg ed weapon Skills</li><li>Four Arms : Your Hands/Holding Gear slot allows for four items (or two weapons requiring two hands)</li></ul>",
      "perks": [
        "+6 Dexterity",
        "-2 Charisma",
        "+2 Pugilism and Wr asslin’ Skills",
        "+1 in all Edg ed weapon Skills",
        "Four Arms : Your Hands/Holding Gear slot allows for four items (or two weapons requiring two hands)"
      ],
      "stats": {
        "str": 0,
        "dex": 6,
        "con": 0,
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
          "name": "Pugilism",
          "rank": 2
        },
        {
          "name": "Wrasslin",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000023",
    "name": "Tigran",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Earth",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>These tiger-headed humanoids stand more than six feet tall and are covered from head to toe in a layer of incredibly vibrant orange-and-black fur. They have the head of a tiger, a long muscular tail, and humanlike hands that end in wicked claws. These claws are excellent for attack and defense, but they can cause difficulties in performing small, delicate tasks such as picking locks. You don’t need to have fond memories of your Lisa Frank trapper keeper to know these tiger people are uniquely Earth creations. Tigrans are cunning predators. If given their choice, they attack from cover, using overwhelming speed and ferocity rather than engaging in a drawn-out encounter. Although they’re incredibly stealthy, often choosing to walk barefoot, their coloring makes stealth difficult in most of the World Dungeon. Tigrans are social creatures, especially among others of their own kind, but they harbor an inherent streak of pride. It can be difficult to change their minds, which makes them seem antisocial. Tigrans make great Barbarians, Monks, and Paladins.</p>",
      "abilities": "<ul><li>+3 Dexterity</li><li>-2 Strength</li><li>-4 Charisma</li><li>+2 Ambush, Cat-like Reflexes, and Slice Attack Skills</li><li>Can see in total darkness</li><li>+1 DR Buff</li><li>+10ft Move</li><li>When attacking during a Surprise Action, deal ×2 total damage with melee attacks</li><li>Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination </li></ul>",
      "perks": [
        "+3 Dexterity",
        "-2 Strength",
        "-4 Charisma",
        "+2 Ambush, Cat-like Reflexes, and Slice Attack Skills",
        "Can see in total darkness",
        "+1 DR Buff",
        "+10ft Move",
        "When attacking during a Surprise Action, deal ×2 total damage with melee attacks",
        "Disadvantage on Dexterity-based Skills that require fine manipulation or motor coordination"
      ],
      "stats": {
        "str": -2,
        "dex": 3,
        "con": 0,
        "int": 0,
        "cha": -4
      },
      "drBonus": 1,
      "movement": {
        "walkDelta": 10,
        "climb": 0,
        "swim": 0,
        "fly": 0,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Ambush",
          "rank": 2
        },
        {
          "name": "Cat-Like Reflexes",
          "rank": 2
        },
        {
          "name": "Slice",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000024",
    "name": "Bune",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Medium (4)",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers with 3 or more popularity",
      "description": "<p>Bunes are a slight, dragon-like people with a calm sense of superiority; if Crocodilians are the Barbarians of the lizard world, Bunes are the elves. They are naturally peaceful, but they can be clever Fighters. As part of the Syndicate, the Bune home world once hosted Dungeon Crawler World. Although Bunes can’t use their leathery wings to fly right away, their wings gain Strength at higher Levels and allow for short-distance flight. This Race is an ideal choice for Rogue and magic-using Classes.</p>",
      "abilities": "<ul><li>-3 Intelligence</li><li>+2 Dexterity</li><li>-2 Constitution</li><li>+3 Determine Value, Fabricate, and Negotiation Skills</li><li>At Le vel 50, +2 Dexterity and gain wings capable of flying up to 500ft per scene</li><li>+1 popularity each time you roll a Critical Hit in combat</li></ul>",
      "perks": [
        "-3 Intelligence",
        "+2 Dexterity",
        "-2 Constitution",
        "+3 Determine Value, Fabricate, and Negotiation Skills",
        "At Le vel 50, +2 Dexterity and gain wings capable of flying up to 500ft per scene",
        "+1 popularity each time you roll a Critical Hit in combat"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": -2,
        "int": -3,
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
          "name": "Determine Value",
          "rank": 3
        },
        {
          "name": "Fabricate",
          "rank": 3
        },
        {
          "name": "Negotiation",
          "rank": 3
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000025",
    "name": "Caprid",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Large (5)",
      "prerequisites": "",
      "description": "<p>Caprids are a Syndicate Race of bipedal, goat-headed humanoids—their hands are usually Human while their feet can be hooved or toed. Caprids come in a variety of color morphs and can possess horns in many shapes and patterns; some known Caprid colors include pitch-black, dappled white, and caramel, gray, or deep brown. Rich in both power and resources, Caprids hold a strong standing in the Syndicate, and multiple sponsor entities have Caprid board members. The high Intelligence and Charisma of Caprids make them an ideal choice for magic users, con artists, and cultleader hopefuls.</p>",
      "abilities": "<ul><li>-3 Intelligence and Charisma</li><li>-2 Strength</li><li>+3 Find Cra wler, Investigation, and Leadership Skills</li><li>Find Cra wler and Persuasion Skills can be raised to Rank 20</li><li>+1 popularity each time you roll a Critical Hit on a Charisma Skill Check or on a Spell Skill Check outside of combat</li></ul>",
      "perks": [
        "-3 Intelligence and Charisma",
        "-2 Strength",
        "+3 Find Crawler, Investigation, and Leadership Skills",
        "Find Crawler and Persuasion Skills can be raised to Rank 20",
        "+1 popularity each time you roll a Critical Hit on a Charisma Skill Check or on a Spell Skill Check outside of combat"
      ],
      "stats": {
        "str": -2,
        "dex": 0,
        "con": 0,
        "int": -3,
        "cha": -3
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
          "name": "Find Crawler",
          "rank": 3
        },
        {
          "name": "Investigation",
          "rank": 3
        },
        {
          "name": "Leadership",
          "rank": 3
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000026",
    "name": "Grulke",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Medium (4)",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who have Rank 5+ in the Jumping or Light on Your Feet Skill",
      "description": "<p>You are a toad. A five-foot-tall toad person who once conquered planets, not that anyone remembers. If anyone calls you a frog, make them regret it. The Grulke are a militaristic Race of toad warriors, though they have lost much of their organization as a Race and are now more often seen solo in mercenary halls. If only a Grulke were able to unite the disparate battalions and restore honor to their people, an up-and-comer who hasn’t been poisoned by infighting and politics. Oh, if only there were someone worthy…</p>",
      "abilities": "<ul><li>+3 Dexterity</li><li>-2 Strength</li><li>-2 Charisma</li><li>+3 in either Jumping or Light on Your Feet Skills</li><li>+2 Zone of Cont rol and a Reach weapon Skill of your choice</li><li>Tongue Lashing: Ranged attack; [Rank = Floor Number] + Dex to hit. 1d8 + Str, Bludgeoning, 30ft range. Add 1d8 at Rank 5, 10, and 15. Rank is always equal to the Floor Number and cannot be raised by other means</li><li>Gain a +2 DR bre astplate (Torso) with your Grulke Battalion crest, not that it means much anymore</li><li>Trolltype enemies have Advantage on Wrasslin’ Checks against you, and when successful, they lick you</li><li>+1 popularity when a troll-type enemy licks you or when you achieve an Amazing success or better on an Attack against a troll-type enemy</li><li>+1 popularity when you score a Critical Hit on a larger foe in combat</li></ul>",
      "perks": [
        "+3 Dexterity",
        "-2 Strength",
        "-2 Charisma",
        "+3 in either Jumping or Light on Your Feet Skills",
        "+2 Zone of Cont rol and a Reach weapon Skill of your choice",
        "Tongue Lashing: Ranged attack; [Rank = Floor Number] + Dex to hit. 1d8 + Str, Bludgeoning, 30ft range. Add 1d8 at Rank 5, 10, and 15. Rank is always equal to the Floor Number and cannot be raised by other means",
        "Gain a +2 DR bre astplate (Torso) with your Grulke Battalion crest, not that it means much anymore",
        "Trolltype enemies have Advantage on Wrasslin’ Checks against you, and when successful, they lick you",
        "+1 popularity when a troll-type enemy licks you or when you achieve an Amazing success or better on an Attack against a troll-type enemy",
        "+1 popularity when you score a Critical Hit on a larger foe in combat"
      ],
      "stats": {
        "str": -2,
        "dex": 3,
        "con": 0,
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
          "name": "Zone of Control",
          "rank": 2
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000027",
    "name": "Hobgoblin",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Medium (4)",
      "prerequisites": "Prerequisites: This limited Race is only available to crawlers who have Rank 5+ in the Explosives Handling Skill and any Trap-based Skill",
      "description": "<p>A Hobgoblin is what happens when a lady Troll manages to get a Goblin drunk enough totalk herself into his pants. While that description makes them sound like they come from bawdy Earth Bards, this alien Race of explosive hooligans is a plague among the stars. Large, muscular, and smart, Hobgoblins excel at trapmaking, explosives management, and all-out mayhem. Unfortunately, these guys are so ugly that even Gorgons lose their lunch looking upon them, and they’ve suffered a few nerfs in the most recent balancing patch. This Race is best suited for Rogue and Fighter-based Classes.</p>",
      "abilities": "<ul><li>+1 Dexterity</li><li>-5 Charisma. Charisma is capped at 10</li><li>+3 in all Trap-ba sed and Explosive-based Skills</li><li>+1 Reg eneration Skill</li><li>Free ac cess to all Hobgoblin Sapper Workshops</li><li>At the end of each floor, roll one Explosive or Trap-based Skill Advancement Check with Advantage</li><li>All explosiv es and trap-making Skills can be raised to Rank 20</li><li>+1 popularity when you kill an enemy with a trap or explosive once per scene</li></ul>",
      "perks": [
        "+1 Dexterity",
        "-5 Charisma. Charisma is capped at 10",
        "+3 in all Trap-ba sed and Explosive-based Skills",
        "+1 Reg eneration Skill",
        "Free ac cess to all Hobgoblin Sapper Workshops",
        "At the end of each floor, roll one Explosive or Trap-based Skill Advancement Check with Advantage",
        "All explosiv es and trap-making Skills can be raised to Rank 20",
        "+1 popularity when you kill an enemy with a trap or explosive once per scene"
      ],
      "stats": {
        "str": 0,
        "dex": 1,
        "con": 0,
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
          "name": "Explosive-based",
          "rank": 3
        },
        {
          "name": "Regeneration",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000028",
    "name": "Pocket Kuma",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Small (2); Animal",
      "prerequisites": "",
      "description": "<p>A Pocket Kuma is an adorable and diminutive hybrid of a bear, a capybara, and a sugar glider that comes from beyond the stars. Their small bodies and oversized eyes made them absolutely adorable, and they were quickly put into service as pets by the High Elves who bred them specifically for that purpose. However, these cute little abominations learned how to think, which inspired mass genocide of their species. Fortunately, a few clever specimens managed to escape, thus perpetuating their existence and eventual spread throughout the galaxy. A Pocket Kuma’s oversized eyes give them the ability to see incredibly well in day or night. Despite ranking among the weakest and most fragile of Races, they are some of the most agile and nimble creatures in the galaxy. It’s not uncommon for them to leap up to ten times their own body length with a running start, or half that from standing. Although their dexterous paws have opposable thumbs, they’re simply too small to wield or use any weapons or items that aren’t specifically designed for them, making them poor warriors. Members of this Race are ideal as Bards, Rogues, or magic-users.</p>",
      "abilities": "<ul><li>+5 Dexterity and Charisma</li><li>-4 Strength. Strength is capped at 10</li><li>-4 Constitution</li><li>+2 Bite, Dodge, and Slice Attack Skills</li><li>+1 Ambush Skill</li><li>You roll with Advantage on all Charisma-based Checks</li><li>Can see in total darkness</li><li>Take no damage from falling</li><li>Light on your Feet Skill can be raised to Rank 20</li><li>You deal half damage with Strength-based melee weapons</li><li>vulnerable to Bludgeoning damage</li><li>+1 popularity when you act in the Surprise Round of a combat or roll a Critical Fail on an Evade Check</li></ul>",
      "perks": [
        "+5 Dexterity and Charisma",
        "-4 Strength. Strength is capped at 10",
        "-4 Constitution",
        "+2 Bite, Dodge, and Slice Attack Skills",
        "+1 Ambush Skill",
        "You roll with Advantage on all Charisma-based Checks",
        "Can see in total darkness",
        "Take no damage from falling",
        "Light on your Feet Skill can be raised to Rank 20",
        "You deal half damage with Strength-based melee weapons",
        "vulnerable to Bludgeoning damage",
        "+1 popularity when you act in the Surprise Round of a combat or roll a Critical Fail on an Evade Check"
      ],
      "stats": {
        "str": 0,
        "dex": 5,
        "con": -4,
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
          "name": "Bite",
          "rank": 2
        },
        {
          "name": "Dodge",
          "rank": 2
        },
        {
          "name": "Slice",
          "rank": 2
        },
        {
          "name": "Ambush",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000029",
    "name": "Pterolykos",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Powerful and beautiful, the Pterolykos is the very picture of dangerous grace on land or air. Resembling a humanoid wolf with resplendent multihued feathery wings, Pterolykos inspire veneration as icons of Strength, versatility, and beauty. Their mournful howl is known to haunt the dreams of those who hear it. While Pterolykoses don’t have keen eyes, their noses rank among the most well-developed in the galaxy. They’re known to chase prey for miles, tracking them through the air by scent before swooping down to tear their victims apart with their powerful jaws. A Pterolykos can’t help but be incredibly expressive in face and body, which is perfect for grand displays of emotion and theatrical gestures, but it makes lying and deception incredibly difficult. It’s a wonderfully dramatic gesture to underline a point by snapping their wings open, but it’s a challenge to pretend they’re angry or upset when their wolf tail won’t stop wagging. This Race is ideal for any Bard-based or magic-using Class.</p>",
      "abilities": "<ul><li>-4 Charisma</li><li>+2 Dexterity</li><li>+3 Bite, Performance, and Tracking Skills</li><li>+1 Diplomacy Skill</li><li>Has wings capable of flight for up to 50 seconds per scene</li><li>Disadvantage on all Checks to conceal emotion or presence (such as Deception and Stealth)</li><li>+1 popularity when you roll a Critical Hit on a Charisma Skill Check</li></ul>",
      "perks": [
        "-4 Charisma",
        "+2 Dexterity",
        "+3 Bite, Performance, and Tracking Skills",
        "+1 Diplomacy Skill",
        "Has wings capable of flight for up to 50 seconds per scene",
        "Disadvantage on all Checks to conceal emotion or presence (such as Deception and Stealth)",
        "+1 popularity when you roll a Critical Hit on a Charisma Skill Check"
      ],
      "stats": {
        "str": 0,
        "dex": 2,
        "con": 0,
        "int": 0,
        "cha": -4
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 20,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Bite",
          "rank": 3
        },
        {
          "name": "Performance",
          "rank": 3
        },
        {
          "name": "Tracking",
          "rank": 3
        },
        {
          "name": "Diplomacy",
          "rank": 1
        }
      ],
      "spells": []
    }
  },
  {
    "_id": "dccrce0000000030",
    "name": "Skyfowl",
    "type": "race",
    "img": "icons/default-icons/ancestry.svg",
    "system": {
      "heritage": "Alien",
      "size": "Medium (4)",
      "prerequisites": "",
      "description": "<p>Regal. Devout. Loyal. Kind of opinionated. All of these describe the majestic Skyfowl people found throughout the World Dungeon and the rest of the galaxy. Skyfowl are known for two things: they’re devout warriors willing to protect their honor and social standing, and they’re kind of jerks to everyone about it. There are dozens of flights of Skyfowl, and their physical characteristics depend on their origin. Those hailing from the wilds of the World Dungeon may have bestial hawk-like characteristics or the dense muscles of a rooster protecting his flock; those from cities might have dull-colored feathers and small wings suitable for survival in crowded settlements. No matter where they originate or what their role is in a Crawl, all Skyfowl believe in the superiority of those who don’t just dream of flying high in the clouds but can do it. That, and feathers beat boring fur and itchy scales, no contest. This Race makes a good choice for any non-frontline Fighter Class.</p>",
      "abilities": "<ul><li>+3 Dexterity and Charisma</li><li>-1 Strength and Constitution</li><li>+2 Slice Attack Skill</li><li>+2 in all Charisma-based Skills</li><li>Advantage on the Perception Skill for observing things 10+ feet away</li><li>Capable of flight for up to 3 minutes per scene. However, Skyfowl who choose a Cleric-based Class have their wings clipped and can only make short hops of up to 10 seconds per scene when flying</li><li>+1 popularity when you roll a Critical Hit on a Leadership, Perception, Persuasion, or Taunt Skill Check</li></ul>",
      "perks": [
        "+3 Dexterity and Charisma",
        "-1 Strength and Constitution",
        "+2 Slice Attack Skill",
        "+2 in all Charisma-based Skills",
        "Advantage on the Perception Skill for observing things 10+ feet away",
        "Capable of flight for up to 3 minutes per scene. However, Skyfowl who choose a Cleric-based Class have their wings clipped and can only make short hops of up to 10 seconds per scene when flying",
        "+1 popularity when you roll a Critical Hit on a Leadership, Perception, Persuasion, or Taunt Skill Check"
      ],
      "stats": {
        "str": -1,
        "dex": 3,
        "con": -1,
        "int": 0,
        "cha": 3
      },
      "drBonus": 0,
      "movement": {
        "walkDelta": 0,
        "climb": 0,
        "swim": 0,
        "fly": 20,
        "burrow": 0
      },
      "skills": [
        {
          "name": "Slice",
          "rank": 2
        }
      ],
      "spells": []
    }
  }
];
