import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { makeMob, getDCCStatModifier } from './generate-all-mobs-helper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXISTING_MOBS = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'base_23_mobs.json'), 'utf8'));

// All 61 new entities to add to the 23 existing mobs (total: 84)
const NEW_MOBS_DEFS = [
  {
    name: "Bad Llama",
    level: 3,
    classification: "Mob",
    creatureType: "Mutated",
    floor: "Floor 1",
    location: "Webbinghoods",
    size: "Large",
    bars: 3,
    str: 3, int: 1, con: 3, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 2,
    description: "Most naughty animals aren't born bad; they just suffer from a bad reputation. In this case, that reputation is absolutely warranted as the Bad Llamas run most of the crime out of the Webbinghoods.",
    aiDescription: "It may look fuzzy and cuddly, but if you try to pet it, you’ll lose an arm in the process. It’s a Bad Llama—kind of like a normal Llama, but bad! Purveyors of some of the most powerful drugs in the dungeon, these adorable rapscallions love two things: good music and a good buzz.",
    notes: "Bad Reflux—Attacks can target the lava pouch in the Llama’s throat during rounds when it uses Lava Spit, but this adds a +2 to the Llama’s Evade. The pouch ruptures if such an attack deals damage, killing the Llama and setting its corpse aflame.",
    source: "Page 51, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Lava Spit", toHitStat: "dex", damageDice: "1d8", damageStat: "str", damageType: "Fire", effects: "30ft range. On Evade Major Fail or worse, target gains Burning Debuff." }
    ],
    loot: [
      { name: "Llama Fleece", quantity: 1, notes: "Silky denim-jacket-trimmed fleece." },
      { name: "Fire Pouch", quantity: 1, notes: "Gland capable of generating volatile fiery fluids." }
    ]
  },
  {
    name: "Ball of Swine",
    level: 15,
    classification: "Borough Boss",
    creatureType: "Amalgamation",
    floor: "Floor 1",
    location: "Orcish Supremacy Arenas",
    size: "Colossal",
    bars: 16,
    str: 20, int: 4, con: 50, dex: 10, cha: 1,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "12+F",
    move: 30,
    dr: 1,
    description: "Comprised of at least thirty fetish-friendly Tusklings joined together by magic, the Ball of Swine is one of the most formidable battle formations of the Orcish Supremacy. Speed, size, and unstoppable momentum combine to make this Borough Boss a crushing foe.",
    aiDescription: "Ever seen that movie with the guy in a rugged fedora running away from a massive unstoppable boulder? Did you think to yourself, 'That sure looks fun'? Now what if that boulder was bigger, faster, and made of bondage-loving Tusklings?",
    notes: "Amalgamation—The Ball of Swine is a 15-foot-tall ball comprised of 30 Tuskling Knights and 30 Tuskling Courtesans. Constant Momentum—The Ball of Swine can instantly change direction without losing speed. Snagged—Can be stopped by reducing space with three successful skill checks.",
    source: "Page 142, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Assimilated", toHitStat: "str", damageDice: "3d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range. On Evade Major Fail or worse, crawler gains Held Debuff." },
      { name: "Bowled Over", toHitStat: "str", damageDice: "2d10", damageStat: "str", damageType: "Bludgeoning", effects: "40ft Line. On Evade Major Fail or worse, crawler gains Take Down Debuff." }
    ],
    loot: [
      { name: "Bondage Leathers", quantity: 1, notes: "Heavy studded leather harnesses from the Tusklings." },
      { name: "Ring of Momentum", quantity: 1, notes: "Grants bonus movement on charge attacks." }
    ]
  },
  {
    name: "The Bar Render",
    level: 8,
    classification: "Neighborhood Boss",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Prickly Pack Alleys Court Tavern",
    size: "Large",
    bars: 11,
    str: 11, int: 10, con: 11, dex: 11, cha: 6,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "14+F",
    move: 30,
    dr: 1,
    description: "The Bar Render is a formidable older woman in a dusty-gray suit and spectacles. She stands nine feet tall and holds glasses in each hand. She fights mostly with long-range improvised explosives as Barflies dressed as bailiffs try to keep the crawlers back.",
    aiDescription: "The Bar Render. Former Lawyer, Current Bartender—Real done with cleaning up your mess. Level 8 Neighborhood Boss! Once upon a time, Patti dreamed of defending her fellow man from the twisted, perverted farce you know as the justice system. She utterly crushed the BAR exam and became an attorney, a public defender, and a tireless advocate for justice.",
    notes: "She has two Barflies joining her in the fight at all times until she is dead.",
    source: "Page 37, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Fiery Cocktail", toHitStat: "dex", damageDice: "1d8", damageStat: "int", damageType: "Fire", effects: "30ft range, 10ft Blast radius." },
      { name: "Punch", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range. On Evade Major Fail or worse, crawler gains Held Debuff." }
    ],
    loot: [
      { name: "Bar Render's Cocktail Shaker", quantity: 1, notes: "Improvised alchemical shaker." },
      { name: "Dusty Gray Spectacles", quantity: 1, notes: "+1 to Perception and Insight checks." }
    ]
  },
  {
    name: "Barflie",
    level: 4,
    classification: "Mob",
    creatureType: "Mutated Humanoid",
    floor: "Floor 1",
    location: "Prickly Pack Alleys",
    size: "Medium",
    bars: 4,
    str: 6, int: 1, con: 5, dex: 4, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Barflies are humanoids standing roughly five-and-a-half feet tall with ruby-red compound eyes and dripping proboscises. Utterly disgusting to behold and incredibly quick but clumsy fighters, they wield simple weapons.",
    aiDescription: "These formerly human creatures prefer to stick near bright lights and foul smells, often congregating in small groups, lapping up the latest buzz from around the dungeon. Watch out for their backwash attack!",
    notes: "Flight—Barflies can move through the air as though on the ground and hover in place.",
    source: "Page 30, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Backwash", toHitStat: "dex", damageDice: "1d6", damageStat: "con", damageType: "Poison", effects: "30ft range. On Evade Major Fail or worse, crawler gains Washed Debuff." },
      { name: "Club", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." }
    ],
    loot: [
      { name: "Barflie Proboscis", quantity: 1, notes: "Dripping insectoid feeding tube." },
      { name: "Compound Eye Lens", quantity: 2, notes: "Ruby-red multifaceted lenses." }
    ]
  },
  {
    name: "Beloved Mimic",
    level: 25,
    classification: "City Boss",
    creatureType: "Aberration",
    floor: "Floor 2",
    location: "Second Floor Boss Lair",
    size: "Colossal",
    bars: 20,
    str: 20, int: 20, con: 100, dex: 9, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "15+F",
    move: 5,
    dr: 2,
    description: "Capable of swallowing a sedan whole, the Beloved Mimic relishes the chance to sink its razor-sharp teeth into incapacitated crawlers. It uses its psychic abilities to give the illusion of transformation, perfectly mimicking whomever the observer loves the most.",
    aiDescription: "Capable of swallowing a sedan whole, the Beloved Mimic relishes the chance to sink its razor-sharp teeth into incapacitated crawlers. Armed with psionic attacks and psychic abilities, the Beloved Mimic is a foe few crawlers survive—despite the monster’s inability to physically chase them down.",
    notes: "Mesmerized—Crawlers cannot attack the Mimic while Mesmerized and must spend their 10ft Step moving towards it. Swallowed—Swallowed crawlers take 1d8+F Acid at the end of each round.",
    source: "Page 145, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "3d12", damageStat: "str", damageType: "Piercing", effects: "15ft range. On unsuccessful Evade, target gains Swallowed Debuff." },
      { name: "Heartstrings", toHitStat: "int", damageDice: "0", damageStat: "int", damageType: "Psychic", effects: "100ft range, 20ft Blast radius. Free Cha Stat Check vs Difficulty 15+F or gain Mesmerized Debuff." },
      { name: "Psionic Strike", toHitStat: "int", damageDice: "3d10", damageStat: "int", damageType: "Psychic", effects: "5ft range. On Evade Major Fail or worse, crawler gains Mental Scarring Debuff (-1 Int Mod)." }
    ],
    loot: [
      { name: "Heartstring Fibers", quantity: 3, notes: "Psychic filaments that vibrate with emotion." },
      { name: "Colossal Mimic Tooth", quantity: 2, notes: "Razor-sharp tooth the size of a gladius." }
    ]
  },
  {
    name: "Blind Goblin Survivor",
    level: 4,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Bugaboo Warrens",
    size: "Petite",
    bars: 4,
    str: 3, int: 3, con: 6, dex: 3, cha: 2,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Former captives of Stiggy's operation released alive from harvesting pens. Their empty eye sockets are wrapped in dirty bandages or smeared with resin. They navigate by sound and smell alone.",
    aiDescription: "These unlucky bastards are proof that the harvesting process is technically non-lethal. Well, at least not directly. Being a blind Mob in this dungeon is just asking to be fodder for crawlers keen on grinding to level up. But they’ve adapted, so you don’t have to feel sorry for them or anything.",
    notes: "Motion Detection—If a crawler makes a Surprise Attack against a Blind Goblin Survivor, it immediately strikes back at no Action cost. Blind—No penalties for fighting in darkness or fog.",
    source: "Page 129, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Blind Fighting", toHitStat: "dex", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range. Attacks cannot be redirected (no Taunt, Catcher, etc.)." }
    ],
    loot: [
      { name: "Scavenged Tapping Stick", quantity: 1, notes: "Sturdy stick used for echolocation." },
      { name: "Dirty Resin Bandages", quantity: 1, notes: "Hemostatic goblin wraps." }
    ]
  },
  {
    name: "Bruiser",
    level: 5,
    classification: "Crawler",
    creatureType: "Human",
    floor: "Floor 1",
    location: "Dungeon Thoroughfares",
    size: "Medium",
    bars: 5,
    str: 6, int: 2, con: 6, dex: 4, cha: 3,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 3,
    description: "A heavily-built rival crawler who relies on pure muscle and brute force. Unfortunately, muscle alone rarely keeps you alive in the World Dungeon.",
    aiDescription: "These schmucks just keep dying. Rival crawler who thought pumping iron in the saferooms would prepare him for the meat-grinder.",
    notes: "Rival Crawler—Aggressive NPC combatant.",
    source: "Page 136, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Pointy Stick", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." }
    ],
    loot: [
      { name: "Reinforced Pointy Stick", quantity: 1, notes: "Improvised spear crafted by a desperate crawler." },
      { name: "Crawler Gold", quantity: 15, notes: "Standard dungeon currency." }
    ]
  },
  {
    name: "Bugaboo Goblin-napper",
    level: 6,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Passive (Aggressive) Perception Area",
    size: "Medium",
    bars: 6,
    str: 6, int: 3, con: 7, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 30,
    dr: 2,
    description: "The lowest-ranking members of Stiggy’s operation, Bugaboo Goblin-Nappers work in pairs, roaming the dungeon looking for Goblins to steal. They carry oversized nets, man-catchers, and large cudgels.",
    aiDescription: "Oh, look. Bugaboo Goblin-Nappers! Their job is simple: find Goblins and bring them back for 'processing.' They don’t start fights—at least not fair fights. No, these guys are more likely to jump you when your pants are down and your friends aren’t there.",
    notes: "Cautious—They travel in pairs and avoid fair fights. If Surprised or when one is killed, they retreat until they find reinforcements.",
    source: "Page 128, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Cudgel", toHitStat: "str", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." },
      { name: "Net", toHitStat: "dex", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "20ft range, 10ft Blast radius. Hits apply Held Debuff until end of round." }
    ],
    loot: [
      { name: "Goblin-Catching Net", quantity: 1, notes: "Weighted reinforced netting." },
      { name: "Bugaboo Cudgel", quantity: 1, notes: "Heavy wooden club." }
    ]
  },
  {
    name: "Bugaboo Socket-Picker",
    level: 5,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Passive (Aggressive) Perception Area",
    size: "Medium",
    bars: 5,
    str: 6, int: 1, con: 6, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 30,
    dr: 2,
    description: "Harvesting specialists of Stiggy’s operation, tasked with extracting Goblin eyes and preparing them for use in Screye Cameras and Drones. They carry hooked knives, bone scoops, and padded jars.",
    aiDescription: "The willing pupils of whoever started this ocular harvest, these Bugaboos have steady hands and empty jars. While their friends handle the grabbing and dragging, these specialists harvest the parts that power the cameras. Don’t blink or you’ll mess up their work.",
    notes: "Socket-Pickers avoid direct combat whenever possible, letting other Bugaboos restrain subjects before harvesting.",
    source: "Page 128, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Hook-Knife", toHitStat: "dex", damageDice: "2d4", damageStat: "dex", damageType: "Slashing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Major Injury Debuff (dangling eye!)." },
      { name: "Bone Scoop", toHitStat: "str", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." }
    ],
    loot: [
      { name: "Surgical Hook-Knife", quantity: 1, notes: "Wicked curved blade designed for precision excision." },
      { name: "Padded Specimen Jar", quantity: 2, notes: "Jars lined with preservation fluid." }
    ]
  },
  {
    name: "Canidna",
    level: 3,
    classification: "Mob",
    creatureType: "Animal",
    floor: "Floor 1",
    location: "Pack Halls",
    size: "Medium",
    bars: 3,
    str: 3, int: 1, con: 3, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 30,
    dr: 1,
    description: "Canine creatures nearly identical to wolves, except for the jagged spines covering their backs and flanks. When cornered, they roll into tight balls to impale crawlers.",
    aiDescription: "Don’t let their beady little eyes and adorable faces fool you—these spiky bastards have personalities as prickly as their appearance. They want you dead, and they’re not shy about how they accomplish it!",
    notes: "Pack Hunting—Targets adjacent to 2+ Canidna with no adjacent allies roll Evade with Disadvantage. Desperation—Spike Ball used only when cornered or numbers halved.",
    source: "Page 31, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Spike Ball", toHitStat: "dex", damageDice: "1d8", damageStat: "dex", damageType: "Piercing", effects: "5ft range. On Major Fail or worse, crawler gains Blood Trail Debuff." }
    ],
    loot: [
      { name: "Canidna Quill Spine", quantity: 3, notes: "Hardened keratin spike." },
      { name: "Spiny Wolf Pelt", quantity: 1, notes: "Rough pelt studded with natural armor." }
    ]
  },
  {
    name: "Cardium Clam",
    level: 9,
    classification: "Neighborhood Boss",
    creatureType: "Monstrous",
    floor: "Floor 2",
    location: "Mind Maze Deep Pools",
    size: "Huge",
    bars: 12,
    str: 11, int: 20, con: 6, dex: 5, cha: 10,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "15+F",
    move: 0,
    dr: 4,
    description: "The Cardium Clam loathes all creatures with intelligence higher than its own. Rooted in place, it launches hypersonic pearl artillery across massive distances.",
    aiDescription: "The Cardium Clam, Immaculate Bivalve. Level 9 Neighborhood Boss. Sometimes our most beautiful enemies hit the hardest. Washed from the depths of oceans unplumbed by civilization, the Cardium Clam loathes all creatures with intelligence higher than its own. It’s here to prove that the world should never rely on brains over beauty and that all that glitters is gorgeous. Talk about toxic standards!",
    notes: "Exposed Foot—Foot extends and becomes targetable (–3 penalty) during rounds with Step or Foot Probe (DR 0). Probing Foot—Explosive Pearl and Pearl Grapeshot can be used in the same round as Foot Probe.",
    source: "Page 125, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Hypersonic Pearl", toHitStat: "int", damageDice: "2d10", damageStat: "int", damageType: "Bludgeoning", effects: "200ft range. On Evade Major Fail or worse, crawler is pushed 15ft." },
      { name: "Explosive Pearl", toHitStat: "int", damageDice: "2d8", damageStat: "int", damageType: "Bludgeoning", effects: "90ft range, 10ft Blast + 5ft Splash." },
      { name: "Foot Probe", toHitStat: "str", damageDice: "1d10", damageStat: "str", damageType: "Bludgeoning", effects: "10ft range." },
      { name: "Heartbeat Thump", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "30ft Burst radius." },
      { name: "Pearl Grapeshot", toHitStat: "int", damageDice: "1d8", damageStat: "int", damageType: "Bludgeoning", effects: "90ft Cone." }
    ],
    loot: [
      { name: "Immaculate Pearl", quantity: 1, notes: "Enormous shimmering pearl with psychic resonance." },
      { name: "Cardium Shell Shard", quantity: 2, notes: "Hardened shell plate (DR crafting material)." }
    ]
  },
  {
    name: "Chilly Goat",
    level: 4,
    classification: "Mob",
    creatureType: "Fanged Goat",
    floor: "Floor 1",
    location: "Serving Warrens Cold Halls",
    size: "Petite",
    bars: 4,
    str: 5, int: 1, con: 6, dex: 4, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Hardy, fanged goats bred on distant snow-covered worlds. Their fanged maws, voracious appetites, and freezing aura make them dangerous to riders and handlers alike.",
    aiDescription: "'The Chilly Goat’s Bluff' is a phrase common throughout the Syndicate. It’s a 'polite' way of saying the person in front of you is most likely a cold and unfeeling fucking sociopath. Impaled by horns? Ripped apart by fangs? Or frozen solid? If you ask nicely, maybe you can have all three.",
    notes: "Already Chilly—Immune to Cold Damage. Prefers Being Chilly—Fire deals x2 damage to Chilly Goats.",
    source: "Page 40, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Horns", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Fangs", toHitStat: "dex", damageDice: "1d4", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Icy Aura", toHitStat: "con", damageDice: "1d6", damageStat: "con", damageType: "Ice", effects: "15ft Burst radius, once every three rounds." }
    ],
    loot: [
      { name: "Chilly Goat Horn", quantity: 2, notes: "Frost-rimed spiraling horn." },
      { name: "Fanged Goat Pelt", quantity: 1, notes: "Thick fur insulating against extreme cold." }
    ]
  },
  {
    name: "Danger Dingo (Floor 2 Swarm)",
    level: 5,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 2",
    location: "Second Floor Wilderness",
    size: "Medium",
    bars: 5,
    str: 7, int: 3, con: 6, dex: 2, cha: 2,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "12+F",
    move: 30,
    dr: 2,
    description: "Aggressive pack predators of the Second Floor. They coordinate in ravenous hunting swarms and harass crawlers over long distances.",
    aiDescription: "Threat Appendix variant of the Danger Dingo. Same bad attitude, new floor, and even more pack members ready to turn your legs into breakfast.",
    notes: "Good Impressions—Injured Dingo may become non-hostile if fed or played metal music. Ravager—+1d6 damage if moving 20ft straight before Ravage.",
    source: "Page 141, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Rabies Debuff." },
      { name: "Ravage", toHitStat: "str", damageDice: "2d6", damageStat: "str", damageType: "Slashing", effects: "5ft range. On Evade Major Fail or worse, target gains Take Down Debuff." }
    ],
    loot: [
      { name: "Dingo Canine", quantity: 2, notes: "Sharp predator tooth." },
      { name: "Swarm Dingo Hide", quantity: 1, notes: "Tough canine hide." }
    ]
  },
  {
    name: "Dream Eaters",
    level: 5,
    classification: "Mob",
    creatureType: "Shadow",
    floor: "Floor 2",
    location: "Mind Maze Shadows",
    size: "Small",
    bars: 5,
    str: 3, int: 10, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "14+F",
    move: 20,
    dr: 2,
    description: "Pitch-black, cat-sized creatures that stalk the hallways of the maze, waiting for exhausted crawlers to collapse. They induce nightmares and feed on psychic tension.",
    aiDescription: "A group of shadows flits across your vision, slinking in the shadows of the alleyway. Several clumps of eyes reflect light back to you from the shadows, gleaming and hungry. A wave of tiredness washes over you—tempting you to lie down and sleep. Surely the world of dreams is better than this awful place.",
    notes: "Dream Eaters exist to haunt you while you sleep. They shift between shapes of owls, lizards, and miniature pigs.",
    source: "Page 118, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "int", damageDice: "2d6", damageStat: "int", damageType: "Psychic", effects: "5ft range. On Evade Major Fail or worse, crawler gains Nightmares Debuff (wakes Fatigued)." }
    ],
    loot: [
      { name: "Shadow Essence", quantity: 1, notes: "Condensed dream-devouring smoke." },
      { name: "Iridescent Dream Tooth", quantity: 1, notes: "Translucent tooth reflecting nightmare scenes." }
    ]
  },
  {
    name: "Fire-Fighter",
    level: 3,
    classification: "Mob",
    creatureType: "Minor Fire Elemental",
    floor: "Floor 1",
    location: "Serving Warrens",
    size: "Small",
    bars: 3,
    str: 1, int: 1, con: 6, dex: 10, cha: 1,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Shapeless blobs of living flame summoned from the wastelands of Sheol. Intangible and mindless, they squeeze through non-airtight openings and burn anything they touch.",
    aiDescription: "At first, you may have made the mistake of thinking this was your garden-variety floating tuft of fire. Given that it’s zooming directly at your face now, you’ve likely realized you were wrong. Congratulations! You were very wrong. Normal weapons won't have any effect on these fiery bastards.",
    notes: "Intangibility—Cannot be harmed by non-Spell damage. Contact with water will destroy this creature immediately.",
    source: "Page 41, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Fiery Touch", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Fire", effects: "5ft range." }
    ],
    loot: [
      { name: "Sheol Ember", quantity: 1, notes: "Perpetually glowing ember from the abyss." }
    ]
  },
  {
    name: "Giant Spiders",
    level: 3,
    classification: "Mob",
    creatureType: "Beast",
    floor: "Floor 1",
    location: "Webbinghoods",
    size: "Large",
    bars: 3,
    str: 6, int: 1, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 25,
    dr: 1,
    description: "Gargantuan arachnids the size of Highland heifers that weave immense webs as strong as steel. They keep Slimy Croakers as symbiotic pets to guard their eggs.",
    aiDescription: "Do you like spiders? Well, spend a few days running from these chunky bastards and see how you feel then. The Giant Spiders are the size of Highland heifers and excrete sticky webs as strong as steel. Stay away from their webs, their nests, and their eggs.",
    notes: "Web Movement—Other creatures on a Giant Spider’s webs move at half speed and cannot take a 10ft Step.",
    source: "Page 51, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff." },
      { name: "Webshot", toHitStat: "dex", damageDice: "1d8", damageStat: "dex", damageType: "Bludgeoning", effects: "50ft range. On Evade Major Fail or worse, crawler gains Held Debuff." }
    ],
    loot: [
      { name: "Highland Spider Silk", quantity: 2, notes: "Steel-strong gossamer threading." },
      { name: "Silky Shirt", quantity: 1, notes: "Tailored spider-silk armor shirt." }
    ]
  },
  {
    name: "Gnawtria",
    level: 3,
    classification: "Mob",
    creatureType: "Animal",
    floor: "Floor 1",
    location: "Bogbricks Vibrant Walls",
    size: "Petite",
    bars: 3,
    str: 3, int: 1, con: 3, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Large amphibious mammals the size of a dog with long prehensile tails and blood-red armor-piercing teeth that bite through solid plate as if it weren't there.",
    aiDescription: "Have you ever seen a possum mixed with a beaver and given blood-red teeth the size of small knives? You haven’t? Well, you’re in luck, because one is coming right for you! These furry little bastards are aggressive, vicious, and those teeth aren’t just for show.",
    notes: "Swim—Gnawtria can move through water as though on the ground and tread water in place.",
    source: "Page 18, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Piercing", effects: "5ft range, Armor Piercing. On Evade Major Fail or worse, crawler gains Poisoned Debuff." }
    ],
    loot: [
      { name: "Blood-Red Incisor", quantity: 2, notes: "Armor-piercing rodent fang." },
      { name: "Waterproof Gnawtria Pelt", quantity: 1, notes: "Dense amphibious fur." }
    ]
  },
  {
    name: "Gobblin’ Gators",
    level: 2,
    classification: "Mob",
    creatureType: "Animal",
    floor: "Floor 1",
    location: "Bogbricks Still Waters",
    size: "Petite",
    bars: 2,
    str: 6, int: 1, con: 1, dex: 2, cha: 1,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "11+F",
    move: 10,
    dr: 2,
    description: "Stubby-legged reptilian ambushers created by dungeon AI with disproportionately massive jaws. Their lack of dental hygiene inflicts sepsis upon victims.",
    aiDescription: "These creatures are about half the size of a normal alligator with twice the attitude. Although, if you asked them, they’d tell you it’s not the size of the gator in the fight, it’s the size of the bite from the gator!",
    notes: "Swim—Gobblin’ Gators can move twice as fast through water as they can on ground.",
    source: "Page 18, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Sepsis Debuff." },
      { name: "Tail Thrash", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range. On Evade Major Fail or worse, crawler gains Take Down Debuff." }
    ],
    loot: [
      { name: "Gator Scale Plate", quantity: 2, notes: "Rugged scutes from Bogbricks gator." },
      { name: "Septic Tooth", quantity: 1, notes: "Decaying alligator tooth teeming with bacteria." }
    ]
  },
  {
    name: "Goblin",
    level: 2,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Floor 1 Thoroughfares",
    size: "Petite",
    bars: 2,
    str: 1, int: 2, con: 1, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Classic dungeon goblin with an inflated sense of superiority, wielding a wooden club capped with a fresh tropical pineapple.",
    aiDescription: "They think they’re hot shit in a champagne glass. Run-of-the-mill tutorial goblins filled with unreasonable spite and tropical fruit.",
    notes: "Pineapple Club—Starts with pineapple on club (+1d4 damage, falls off on 3+ HB damage). Spunk—Melee attacks can only remove 1 HB slot per hit unless Amazing Success; +1 damage below full health.",
    source: "Page 136, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Club", toHitStat: "dex", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range (+1d4 while pineapple attached)." }
    ],
    loot: [
      { name: "Pineapple Club", quantity: 1, notes: "Club with slightly dented pineapple." },
      { name: "Scavenged Goblin Pocket Lint", quantity: 1, notes: "Odd assortment of shiny pebbles." }
    ]
  },
  {
    name: "Goblin Bomb Bard",
    level: 5,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Goblin Engineering Bays",
    size: "Petite",
    bars: 5,
    str: 4, int: 2, con: 3, dex: 10, cha: 1,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Reckless goblin demolitions fanatic whose musical performances consist entirely of ignited fuses, concussive blasts, and violent shrapnel.",
    aiDescription: "Who needs a lute when you have high explosives? The Goblin Bomb Bard sings a chorus of pure devastation and usually goes out with a bang.",
    notes: "Explosive Demise—Explodes on death, dealing 2d8+F to adjacent entities. Unstable Bombs—Roll 1d20 for distance traveled before detonation.",
    source: "Page 137, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bomb", toHitStat: "dex", damageDice: "2d8", damageStat: "dex", damageType: "Bludgeoning", effects: "60ft range, 5ft Blast radius (Unstable Bombs table)." },
      { name: "Dynamite", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Bludgeoning", effects: "40ft range, 5ft Blast + 5ft Splash." }
    ],
    loot: [
      { name: "Unexploded Blast Powder", quantity: 2, notes: "Volatile goblin explosive compound." },
      { name: "Singed Bandolier", quantity: 1, notes: "Leather harness smelling heavily of sulfur." }
    ]
  },
  {
    name: "Goblin Engineer",
    level: 3,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Goblin Workshops",
    size: "Petite",
    bars: 3,
    str: 3, int: 3, con: 1, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Tinkering goblin mechanic skilled at throwing together hazardous single-seat vehicles out of rusted scrap metal and jury-rigged boilers.",
    aiDescription: "Give a goblin some rusty sheet metal and a wrench, and within an hour he'll have built a contraption that's just as likely to blow him up as run you over.",
    notes: "Incel—Prioritizes attacking entities who appear female. Pilot—Can construct single-seat vehicles out of scrap in 1 hour.",
    source: "Page 137, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Sword", toHitStat: "dex", damageDice: "1d6", damageStat: "str", damageType: "Slashing", effects: "5ft range." },
      { name: "Metal Shard", toHitStat: "dex", damageDice: "1d4", damageStat: "dex", damageType: "Piercing", effects: "30ft range. On Evade Major Fail or worse, crawler gains Stiff Legs Debuff." }
    ],
    loot: [
      { name: "Engineer's Wrench", quantity: 1, notes: "Greasy makeshift wrench." },
      { name: "Scrap Boiler Plate", quantity: 2, notes: "Sheet metal salvage." }
    ]
  },
  {
    name: "Goblin Shamanka",
    level: 7,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Goblin Encampments",
    size: "Petite",
    bars: 7,
    str: 2, int: 10, con: 6, dex: 3, cha: 5,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "14+F",
    move: 20,
    dr: 1,
    description: "Revered matriarchal caster of the goblin clans who channels psychic pain and enchants clan machines with vindictive revenge spells.",
    aiDescription: "The Shamanka doesn't bother with petty firebolts—she sends searing pulses of pure mental agony straight into your skull. And if you smash her clan's rides, she makes sure you eat the explosion.",
    notes: "Revenge—Enchants clan vehicles so that explosion damage redirects entirely to the entity responsible for destroying it.",
    source: "Page 137, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Agony Missile", toHitStat: "int", damageDice: "2d6", damageStat: "int", damageType: "Psychic", effects: "50ft range. On Evade Major Fail or worse, crawler gains Blood Trail, Woozy, or Stunned Debuff." }
    ],
    loot: [
      { name: "Shamanka Agony Charm", quantity: 1, notes: "Totem pulsing with psychic energy." },
      { name: "Bone Fetish Beads", quantity: 1, notes: "Enchanted clan jewelry." }
    ]
  },
  {
    name: "Hide-Hitter Crib Daddy",
    level: 7,
    classification: "Neighborhood Boss",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Bogbricks Cypress Halls Jazz Club",
    size: "Medium",
    bars: 11,
    str: 6, int: 7, con: 10, dex: 12, cha: 11,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "13+F",
    move: 30,
    dr: 1,
    description: "An oversized raccoon wearing a blue fedora and red tie—and nothing else—laying down an ominous jazzy beat with exceptional prowess on a massive stage drum set.",
    aiDescription: "Hide-Hitter Crib Daddy. Level 7 Neighborhood Boss! Surrounded by his troop of Scat Thugs, the Hide-Hitter Crib Daddy knows how to keep things chill. A good rhythm section lays down any tune, and with the Hide-Hitter Crib Daddy leading the battle on the drums, you’re in for a screaming, steaming good time.",
    notes: "Smelly—Melee Amazing Success splashes musk (Sepsis Debuff). Bodies Hit the Floor—Trash Princesses within 10ft get +1d4 damage. Daddy's Princesses—Immune to Trash Princess Area damage. Hide-Hitter—Never unarmed near drum kit.",
    source: "Page 27, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Pocket Groove", toHitStat: "dex", damageDice: "2d6", damageStat: "cha", damageType: "Psychic", effects: "5ft range (requires drumsticks). On Evade Major Fail or worse, crawler gains Woozy Debuff." },
      { name: "Downbeat", toHitStat: "cha", damageDice: "1d6", damageStat: "cha", damageType: "Sonic", effects: "30ft Burst radius (requires drumsticks). On Evade Major Fail or worse, crawler gains Fatigued Debuff." },
      { name: "Stick-Click", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Bludgeoning", effects: "30ft range (requires drumsticks). On Evade Major Fail or worse, crawler gains Stuck Debuff." }
    ],
    loot: [
      { name: "Crib Daddy's Custom Drumsticks", quantity: 2, notes: "Balanced hardwood sticks that resonate with sonic power." },
      { name: "Jazz Master Fedora", quantity: 1, notes: "Stylish blue fedora with +1 Cha bonus." },
      { name: "Red Silk Tie", quantity: 1, notes: "Unstained red necktie smelling faintly of musk." }
    ]
  },
  {
    name: "Hissing Scatterer",
    level: 2,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 2",
    location: "Second Floor Tunnels",
    size: "Small",
    bars: 2,
    str: 4, int: 1, con: 4, dex: 1, cha: 1,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 2,
    description: "An aggressive leaping bug that hisses loudly as it bounds across ceiling surfaces to drop directly onto crawler helmets.",
    aiDescription: "Faster and springier than normal scatterers, these hissing vermin spring across the room before you even register the sound of their skittering feet.",
    notes: "Leaper—Can start round 15ft away from Leaping Kick target and jump in prior to attack. Wall Walker—Moves on walls and ceilings as ground.",
    source: "Page 139, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff." },
      { name: "Leaping Kick", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range (Leaper ability)." }
    ],
    loot: [
      { name: "Hissing Resonator Gland", quantity: 1, notes: "Chitinous organ that creates loud hisses." },
      { name: "Scatterer Leg", quantity: 2, notes: "Spring-loaded insectoid leg." }
    ]
  },
  {
    name: "The Hoarder",
    level: 7,
    classification: "Neighborhood Boss",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Hoarder's Nest",
    size: "Large",
    bars: 11,
    str: 12, int: 8, con: 11, dex: 9, cha: 6,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "13+F",
    move: 20,
    dr: 2,
    description: "Surrounded by a mountainous nest of mildewed laundry, rotting dishes, and broken toys, the Hoarder guards her trash fiercely as Scatterers pour continuously from her gaping mouth.",
    aiDescription: "Where anyone else would see a Scatterer-infested nest of useless garbage—torn pink wrapping paper, rotting dishes, half-filled coloring books, laundry stiff with mildew, shards of a hand-painted flowerpot, a pediatric hospital gown—the Hoarder clings to her valued possessions and guards them accordingly.",
    notes: "Infested—Weak group of Scatterers or Brood Guardians emerges from mouth each round. Killing all emerging Scatterers before round ends chokes and slays the Hoarder.",
    source: "Page 143, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Punch", toHitStat: "str", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "10ft range." },
      { name: "Drop and Roll", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "20ft Line. Free 20ft move during attack." },
      { name: "Throw Trash", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "60ft range." }
    ],
    loot: [
      { name: "Pediatric Hospital Gown", quantity: 1, notes: "Tragic worn garment." },
      { name: "Hand-Painted Flowerpot Shards", quantity: 1, notes: "Faded ceramic piece containing faint memories." }
    ]
  },
  {
    name: "Homogenous Humors",
    level: 3,
    classification: "Mob",
    creatureType: "Aberration",
    floor: "Floor 1",
    location: "Prickly Pack Alleys Shadows",
    size: "Medium",
    bars: 3,
    str: 1, int: 6, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "13+F",
    move: 20,
    dr: 2,
    description: "Giant floating eyeballs drifting silently through dark upper corridors, slowly opening and closing their heavy lids as they stalk prey.",
    aiDescription: "Silent and vicious, the Homogenous Humors are the literal definition of the 'Evil Eye.' Those caught in their paralyzing gaze soon have great difficulty thinking or moving. If you find more than two of them in the same vicinity, you probably want to keep them separate.",
    notes: "Flight—Moves through air as ground, hovers in place. Merge—If 2+ are within 5ft, they merge into a larger creature gaining +1 to hit and +1 damage die per merged humor.",
    source: "Page 32, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Evil Eye", toHitStat: "int", damageDice: "1d6", damageStat: "int", damageType: "Necrotic", effects: "50ft range. On Evade Major Fail or worse, crawler gains Fatigued Debuff." }
    ],
    loot: [
      { name: "Vitreous Humor Vial", quantity: 1, notes: "Thick floating fluid with alchemical properties." },
      { name: "Corneal Lens", quantity: 1, notes: "Giant reflective crystalline lens." }
    ]
  },
  {
    name: "The Juicer",
    level: 9,
    classification: "Neighborhood Boss",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Mind Maze Workout Yard",
    size: "Medium",
    bars: 12,
    str: 25, int: 5, con: 15, dex: 1, cha: 6,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 3,
    description: "A dumped gym bro fused with a troglodyte basher, pumped full of anabolic steroids and dressed in sleeveless muscle shirts covered in toxic fitness mantras.",
    aiDescription: "To create the Juicer, find a recently dumped gym bro and combine him with a Troglodyte Basher. Pump that hybrid full of even more anabolic steroids and creatine supplements, dress him in mantra-emblazoned muscle shirts, and convince him living at the gym is 'totally a life-hack', and you’ll get exactly what you deserve.",
    notes: "Feel the Burn—Weights thrown that miss targets explode on walls for 1d8+F Fire within 10ft. Get Your Blood Pumping—Bulging veins give –2 DR against edged weapons; targeting veins inflicts Blood Trail Debuff.",
    source: "Page 147, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Choke", toHitStat: "str", damageDice: "2d10", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." },
      { name: "Fiery Weight", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "50ft range. On Evade Major Fail or worse, crawler is pushed back 10ft." }
    ],
    loot: [
      { name: "Barbell of Fiery Gains", quantity: 1, notes: "Heavy cast-iron weight infused with explosive kinetic heat." },
      { name: "Torn Muscle Shirt", quantity: 1, notes: "Inscribed with 'You're Not Tired, You're Weak!'." }
    ]
  },
  {
    name: "Kobold",
    level: 3,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Kobold Warrens",
    size: "Small",
    bars: 3,
    str: 6, int: 1, con: 3, dex: 2, cha: 2,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 3,
    description: "Reptilian scaly humanoids armed with hunting spears that gather in tight phalanxes to bring down larger prey through disciplined team defense.",
    aiDescription: "Small, scaly, and constantly barking orders in raspy yaps. You wouldn't think much of one kobold, but get two or three of them together with those long spears and you'll find yourself turned into a pin cushion.",
    notes: "Pack Defense—When 2+ Kobolds are adjacent, they form a phalanx granting 1 free attack per pair at no Action cost.",
    source: "Page 140, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Spear", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Piercing", effects: "10ft range." },
      { name: "Bite", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Yap", toHitStat: "dex", damageDice: "1d4", damageStat: "cha", damageType: "Sonic", effects: "30ft Burst radius." }
    ],
    loot: [
      { name: "Kobold Phalanx Spear", quantity: 1, notes: "Sturdy long spear." },
      { name: "Hardened Reptilian Scale", quantity: 2, notes: "Thick natural armor plating." }
    ]
  },
  {
    name: "Kobold Rider",
    level: 5,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Kobold Encampments",
    size: "Small",
    bars: 5,
    str: 10, int: 1, con: 3, dex: 3, cha: 2,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 3,
    description: "Cavalry kobolds mounted atop savage Danger Dingoes, brandishing massive heavy lances and rapid-firing crossbows from the saddle.",
    aiDescription: "What's worse than a Danger Dingo trying to eat your kneecaps? A kobold strapped to its back aiming a giant lance right between your eyes.",
    notes: "Dingo Rider—Uses Danger Dingoes as mounts. Lance can only attack in the direction the mount faces; unusable if dismounted.",
    source: "Page 140, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Lance", toHitStat: "str", damageDice: "2d12", damageStat: "str", damageType: "Piercing", effects: "10ft range (mounted only)." },
      { name: "Crossbow", toHitStat: "dex", damageDice: "2d8", damageStat: "dex", damageType: "Piercing", effects: "50ft range." }
    ],
    loot: [
      { name: "Cavalry Lance", quantity: 1, notes: "Massive mounted spear." },
      { name: "Dingo Saddle & Harness", quantity: 1, notes: "Leather riding rig." }
    ]
  },
  {
    name: "Krakaren Clone",
    level: 10,
    classification: "Neighborhood Boss",
    creatureType: "Aberrant",
    floor: "Floor 2",
    location: "Second Floor Outpost",
    size: "Gargantuan",
    bars: 12,
    str: 20, int: 1, con: 10, dex: 5, cha: 15,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 3,
    description: "Massive pink octopus monstrosity with an asymmetrical bob haircut and tentacles lined with shrieking human mouths proselytizing multi-level marketing pitches.",
    aiDescription: "First off, this isn’t the Krakaren. This is a Krakaren. For every one that is killed, Krakaren Prime births two more. Part of a collective mind intent upon destroying any semblance of scientific progress in the universe, the Krakaren is the only communal brain entity in the galaxy that actually gets stupider as time moves on.",
    notes: "Bad Hair Day—Frantic if hairstyle gets messed up. Any attack resulting in Amazing Success or better causes all Held Debuffs to cease.",
    source: "Page 115, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Tentacles", toHitStat: "str", damageDice: "2d4", damageStat: "str", damageType: "Bludgeoning", effects: "15ft Cone. Hits apply Held Debuff." },
      { name: "Constrict", toHitStat: "str", damageDice: "3d6", damageStat: "str", damageType: "Bludgeoning", effects: "Auto-hits Held foes." },
      { name: "Beak Bite", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Spit Spray", toHitStat: "con", damageDice: "3d6", damageStat: "con", damageType: "Poison", effects: "30ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff." },
      { name: "Pyramid Pitch", toHitStat: "cha", damageDice: "0", damageStat: "cha", damageType: "Psychic", effects: "50ft range. Free Cha Stat Check; on Fail, spends next Action attacking an ally." }
    ],
    loot: [
      { name: "Krakaren Beak", quantity: 1, notes: "Massive curved beak." },
      { name: "Essential Oil of MLM", quantity: 1, notes: "Suspiciously fragrant, ineffective ointment." }
    ]
  },
  {
    name: "Literal Murder Hornets",
    level: 2,
    classification: "Mob",
    creatureType: "Insect",
    floor: "Floor 1",
    location: "Webbinghoods Treetops",
    size: "Petite",
    bars: 2,
    str: 3, int: 1, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 25,
    dr: 1,
    description: "Sinister flying insects that act as contract assassins of the arthropod realm, capable of shooting venomous stingers directly from their forelegs.",
    aiDescription: "A few seasons back, this crawler, a real big shot from one of the guilds, suddenly stopped talking and fell face down into her soup. There was a big freakin’ stinger sticking out the back of her neck. Then a giant wasp twenty yards behind her flew off with a creepy smile on its face. It was metal AF.",
    notes: "Flight—Literal Murder Hornets can move through the air as though on the ground and hover in place.",
    source: "Page 52, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Stinger", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Piercing", effects: "30ft range. On Evade Major Fail or worse, crawler gains Poison Debuff." }
    ],
    loot: [
      { name: "Murder Stinger Projectile", quantity: 2, notes: "Aerodynamic barbed stinger." },
      { name: "Horned Insect Carapace", quantity: 1, notes: "Black-and-yellow chitin." }
    ]
  },
  {
    name: "Lost Souls",
    level: 3,
    classification: "Mob",
    creatureType: "Undead",
    floor: "Floor 2",
    location: "Mind Maze Dead Ends",
    size: "Medium",
    bars: 3,
    str: 3, int: 4, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "12+F",
    move: 10,
    dr: 2,
    description: "Shambling shades of deceased crawlers who failed to find their way out of the maze. Blank-eyed and envious, they seek to disorient any living crawlers they meet.",
    aiDescription: "Muttering voices reach your ears before you see the source of the sound, all asking disjointed questions: Where are we? Was it left or right? I’ve seen that door before… A group of shambling figures stumbles into view, touching the walls and looking around with empty eyes, desperate for a new way out.",
    notes: "Jealous of the living; attacks confuse crawler parties and accelerate dungeon collapse countdown.",
    source: "Page 119, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bump", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." },
      { name: "Muttering", toHitStat: "int", damageDice: "1d4", damageStat: "int", damageType: "Sonic", effects: "15ft Burst radius. Hits reduce Time to Floor Collapse by 1d2 hours." }
    ],
    loot: [
      { name: "Faded Crawler Dogtags", quantity: 1, notes: "Tags from an unlucky season crawler." },
      { name: "Ghostly Residue", quantity: 1, notes: "Ectoplasmic dust." }
    ]
  },
  {
    name: "Melon-Baller Marvin, Head Bugaboo Socket-Picker",
    level: 11,
    classification: "Mob",
    creatureType: "Unique Humanoid",
    floor: "Floor 1",
    location: "Passive (Aggressive) Perception Harvesting Hub",
    size: "Medium",
    bars: 10,
    str: 10, int: 6, con: 10, dex: 10, cha: 2,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "13+F",
    move: 30,
    dr: 2,
    description: "Stiggy’s first and most devoted lieutenant. Where other Bugaboos flee from open conflict, Marvin relishes it, utilizing an enlarged surgical melon-baller to extract eyeballs in the blink of an eye.",
    aiDescription: "Melon Baller Marvin is the worst kind of monster: middle management. The first Bugaboo taken under the wing of our mysterious villain, Marvin took a ragtag group of pervy loners and turned them into an organized band of organ-harvesting menaces. He perfected the backhanded eye removal with one quick flash of his melon baller.",
    notes: "Supervises harvesting pens, enforces quotas, and guarantees quality control. Unlike his subordinates, Marvin never runs from danger.",
    source: "Page 130, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Melon-Baller", toHitStat: "dex", damageDice: "3d4", damageStat: "dex", damageType: "Slashing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Major Injury Debuff (dangling eye!)." },
      { name: "Bone Scoop", toHitStat: "str", damageDice: "3d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." }
    ],
    loot: [
      { name: "Marvin's Precision Melon-Baller", quantity: 1, notes: "Razor-edged kitchen tool repurposed for ocular harvest." },
      { name: "Harvest Overseer Ring of Keys", quantity: 1, notes: "Opens holding cages throughout Stiggy's complex." }
    ]
  },
  {
    name: "Mind Horror",
    level: 4,
    classification: "Mob",
    creatureType: "Aberrant",
    floor: "Floor 2",
    location: "Mind Maze Corridors",
    size: "Petite",
    bars: 4,
    str: 1, int: 8, con: 3, dex: 1, cha: 4,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "13+F",
    move: 0,
    dr: 2,
    description: "Floating gelatinous brains lingering in packs with squirming tentacles dangling beneath, constantly draining the intelligence and sanity of nearby crawlers.",
    aiDescription: "The constant, low-level headache that plagued you since you entered the Neighborhood gets stronger as you turn a corner, a cluster of Mind Horrors coming into view. The floating jellified brains turn toward you, tentacles squirming in anticipation of the intelligence they are about to consume.",
    notes: "Ego Screen—Entities with Int greater than Mind Horror are immune to its Debuffs. Mandatory Flight—Hovers by default; splatters on ground if killed or forced down.",
    source: "Page 119, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Mindspike Spell", toHitStat: "int", damageDice: "1d12", damageStat: "int", damageType: "Psychic", effects: "30ft range." },
      { name: "Psionic Spell", toHitStat: "int", damageDice: "0", damageStat: "int", damageType: "Psychic", effects: "60ft Burst radius. Hits apply Splitting Headache Debuff (1d6+F Psychic/round, stackable)." },
      { name: "Splatter", toHitStat: "dex", damageDice: "1d6", damageStat: "int", damageType: "Acid", effects: "5ft Burst radius. Hits apply Queasy Debuff." }
    ],
    loot: [
      { name: "Preserved Jellified Brain Matter", quantity: 1, notes: "Potent psionic catalyst for potions." },
      { name: "Writhing Nerve Tendril", quantity: 2, notes: "Sensory filament sensitive to psychic energy." }
    ]
  },
  {
    name: "Mirror Cat",
    level: 2,
    classification: "Mob",
    creatureType: "Animal",
    floor: "Floor 1",
    location: "Packrooms",
    size: "Small",
    bars: 2,
    str: 1, int: 1, con: 1, dex: 6, cha: 2,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 30,
    dr: 1,
    description: "Hairless sphinx-like cats that appear perfectly bisected down the middle, slipping between dimensional rifts to strike from two sides at once.",
    aiDescription: "And I’ll bet you thought sphinx cats couldn’t get any weirder, huh? Well, watch out, because the weird doesn’t stop with their bisected appearance. These guys don’t make their home in holes in the ground, but in holes between dimensions. Hope you were good at Whack-a-Mole…",
    notes: "Multiplies exponentially—At end of every other round, another Mirror Cat appears until their numbers double the party size.",
    source: "Page 31, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Claw", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Slashing", effects: "5ft range." },
      { name: "Phase Claw", toHitStat: "dex", damageDice: "1d4", damageStat: "dex", damageType: "Psychic", effects: "30ft range. On Evade Major Fail or worse, crawler gains Confused Debuff." }
    ],
    loot: [
      { name: "Phase Whiskers", quantity: 2, notes: "Shimmering whiskers that blur out of focus." },
      { name: "Dimensional Cat Hair", quantity: 1, notes: "Trans-spatial fuzz." }
    ]
  },
  {
    name: "MisChief",
    level: 7,
    classification: "Neighborhood Boss",
    creatureType: "Rat Knight",
    floor: "Floor 1",
    location: "10th and Baltimore Intersection",
    size: "Large",
    bars: 11,
    str: 10, int: 8, con: 10, dex: 10, cha: 8,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "13+F",
    move: 20,
    dr: 2,
    description: "A grizzled Rat-kin standing nine feet tall, wearing red pants and wielding a devastating mining mattock with desperation born of loyalty to his horde.",
    aiDescription: "MisChief. Leader of the Rat-kin Horde. Level 7 Neighborhood Boss! The MisChief is a new position. It’s fallen on this Rat’s head by circumstance and loyalty rather than desire. Right now, he’s staring at you like a rat fleeing a sinking ship. You might wonder what that look of desperation is about, but I wouldn’t. I’d worry more about the giant-ass mattock swinging for your head instead.",
    notes: "Leader of the Rat-kin Horde. Fights to protect the Rat Bastard child.",
    source: "Page 47, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Mattock", toHitStat: "str", damageDice: "2d10", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Manhole Cover", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Bludgeoning", effects: "30ft range." },
      { name: "Traffic Dodger", toHitStat: "dex", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "30ft Line. Cars appear out of nowhere driving in a straight line." }
    ],
    loot: [
      { name: "MisChief's Heavy Mattock", quantity: 1, notes: "Heavy two-handed piercing pick." },
      { name: "Manhole Shield", quantity: 1, notes: "Cast iron Kansas City manhole cover." },
      { name: "Red Boss Pants", quantity: 1, notes: "Bright crimson trousers." }
    ]
  },
  {
    name: "Pickmees",
    level: 7,
    classification: "Mob",
    creatureType: "Aberration",
    floor: "Floor 2",
    location: "ADHypermarket Corridors",
    size: "Large",
    bars: 7,
    str: 8, int: 4, con: 7, dex: 5, cha: 2,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Towering aberrant shoppers mutated by endless commercialization in the ADHypermarket, brandishing volatile jugs of promotional Rev-Up fuel.",
    aiDescription: "Living monuments to consumer desperation, these multi-limbed horrors throw incendiary sales jugs and grab anyone who doesn't respect the clearance aisle.",
    notes: "Lurks among towering retail shelves and Rev-Up retention vaults.",
    source: "Page 109, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Rev Jug", toHitStat: "str", damageDice: "2d4", damageStat: "str", damageType: "Fire", effects: "20ft range, 5ft Burst + 5ft Splash. On Evade Major Fail or worse, crawler gains Burned Debuff." },
      { name: "Tentacles", toHitStat: "str", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "10ft range. On Evade Major Fail or worse, crawler gains Held Debuff." }
    ],
    loot: [
      { name: "Jug of Rev-Up Fuel", quantity: 1, notes: "Highly flammable high-octane chemical beverage." },
      { name: "ADHypermarket VIP Card", quantity: 1, notes: "Plastic membership badge." }
    ]
  },
  {
    name: "Prosperity Prophet",
    level: 23,
    classification: "City Boss",
    creatureType: "Undead",
    floor: "Floor 2",
    location: "Cathedral of Wealth",
    size: "Medium",
    bars: 23,
    str: 20, int: 55, con: 20, dex: 20, cha: 25,
    evadeDifficulty: "15+F",
    surpriseDifficulty: "16+F",
    move: 20,
    dr: 1,
    description: "An ancient Seraphian Vampire disguised as a pious prosperity preacher, swindling the vulnerable and draining the lifeblood of his coven-gregation.",
    aiDescription: "Although the Prosperity Prophet may appear human at first glance, further inspection will reveal the fiendish truth: Twisted by the loss of their idyllic home world, this ancient race has been corrupted into Seraphian Vampires. In exchange for unquestioned devotion, the Prosperity Prophet promises their coven-gregation wealth and power.",
    notes: "Drain Blood—Victims who die from Drain Blood rise as Undead Minions. Flight—Hovers and moves through air as ground. Money Grubbing—Loses 1 Action per 100 gold thrown at him.",
    source: "Page 144, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "3d10", damageStat: "str", damageType: "Necrotic", effects: "5ft range. On Evade Major Fail or worse, crawler gains Drain Blood Debuff." },
      { name: "Claw", toHitStat: "dex", damageDice: "3d12", damageStat: "str", damageType: "Necrotic", effects: "5ft range." },
      { name: "Sleep Spell", toHitStat: "int", damageDice: "0", damageStat: "int", damageType: "Psychic", effects: "50ft range, 20ft Blast radius. Con Stat Check vs 16+F or gain Unconscious Debuff." }
    ],
    loot: [
      { name: "Robes of Seraphian Prosperity", quantity: 1, notes: "Opulent velvet vestments woven with gold thread." },
      { name: "Coven Tithe Chalice", quantity: 1, notes: "Solid gold goblet for collecting blood offerings." }
    ]
  },
  {
    name: "Rage Elemental",
    level: 93,
    classification: "Mob",
    creatureType: "Elemental",
    floor: "Floor 2",
    location: "Rule-Breaker Penalty Zones",
    size: "Colossal",
    bars: 10,
    str: 136, int: 1, con: 66, dex: 15, cha: 66,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "11+F",
    move: 60,
    dr: 13,
    description: "A cataclysmic, terrifying entity of pure incandescent fury spawned directly by the System AI when dungeon crawlers flagrantly violate core rules.",
    aiDescription: "Not truly a Second Floor Mob, but this is what happens when you break the rules… When you push the AI too far, it stops playing by the handbook and drops an extinction event directly on your head.",
    notes: "Elemental—Immune to non-magical physical damage. Gravity Reversed—Creatures fall wrong direction taking 1d6/10ft. Reincarnation—Revives at full health once per claimed soul. Soul Reaper—Dissipates after 666 souls.",
    source: "Page 141, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Claw", toHitStat: "str", damageDice: "5d8", damageStat: "str", damageType: "Slashing", effects: "10ft range." },
      { name: "Roar", toHitStat: "cha", damageDice: "0", damageStat: "cha", damageType: "Sonic", effects: "20ft Burst radius. Hits apply Paralyzed Debuff." }
    ],
    loot: [
      { name: "Pure Rage Core", quantity: 1, notes: "Pulsing crystallized heart of raw primordial anger." },
      { name: "System Retribution Fragment", quantity: 1, notes: "Glitch-textured matter extracted from rule enforcement." }
    ]
  },
  {
    name: "Rakish Werehound Shocker",
    level: 19,
    classification: "Borough Boss",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Soho Borough Enclave",
    size: "Medium",
    bars: 17,
    str: 20, int: 20, con: 20, dex: 20, cha: 21,
    evadeDifficulty: "15+F",
    surpriseDifficulty: "15+F",
    move: 30,
    dr: 2,
    description: "Stoic, sharply dressed in an all-black bespoke suit with immaculately styled hair, leading his pack of Werehound Greys with brutal elegance and electric fury.",
    aiDescription: "Stoic and sharply dressed in an all-black suit, the inspiration for this nocturnal hunter was pulled from Gerrard Street in Soho. Armed with a ferocious headbutt attack, shocking speed, and lightning-strike abilities, the Rakish Werehound Shocker is the alpha male in his loyal pack of Werehound Greys.",
    notes: "Savagely Sexy—Double Str Mod for damage against cats, royalty, and women aged 40+. Silver Weakness—Silver weapons deal x2 damage, bypass DR, and apply The Taint Debuff.",
    source: "Page 147, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "3d8", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Lycanthropy Debuff." },
      { name: "Claw", toHitStat: "dex", damageDice: "3d10", damageStat: "dex", damageType: "Slashing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Blood Trail Debuff." },
      { name: "Headbutt", toHitStat: "str", damageDice: "3d6", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range. Cha Stat Check vs 15+F or gain Charmed Debuff." },
      { name: "Lightning Bolt Spell", toHitStat: "int", damageDice: "2d10", damageStat: "int", damageType: "Electric", effects: "30ft Line. On Evade Major Fail or worse, crawler gains Shocked Debuff." }
    ],
    loot: [
      { name: "Bespoke Soho Black Suit", quantity: 1, notes: "Impeccably tailored suit granting +1 to all social checks." },
      { name: "Werehound Alpha Fang", quantity: 2, notes: "Electrified canine tooth." }
    ]
  },
  {
    name: "Ralph the Frenzied Gerbil",
    level: 11,
    classification: "Neighborhood Boss",
    creatureType: "Beastly",
    floor: "Floor 2",
    location: "Kobold Arena Fighting Pit",
    size: "Tiny",
    bars: 12,
    str: 14, int: 7, con: 6, dex: 20, cha: 11,
    evadeDifficulty: "15+F",
    surpriseDifficulty: "13+F",
    move: 30,
    dr: 2,
    description: "Undisputed champion pit fighter of the kobold arenas, a lightning-fast rodent filled with ancestral hatred for mankind and relentless combat drive.",
    aiDescription: "The champion pit fighter of the training grounds, Ralph is filled with rage. When his kin carried the Black Death across the world in the 1300s, they claimed over 200 million human lives. Ralph is here to finish the job. Gone are the days starving in a dirty neglected cage. He may not look like much, but man, is that little rodent fast.",
    notes: "Cuteness Appeal—Crawlers make Int/Cha Stat Check vs 14+F at start or attack with Disadvantage round 1. Frenzied—Step distance 20ft. Hatred of Humans—Prioritizes humans (+5 damage bonus). Still a Tiny Gerbil—If eaten by Dingo, takes 2 actions to kill and escape.",
    source: "Page 148, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Ravening Jaw", toHitStat: "dex", damageDice: "3d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Rat Bite Fever Debuff (1d6+F Poison/round)." },
      { name: "Scratch", toHitStat: "dex", damageDice: "2d8", damageStat: "dex", damageType: "Slashing", effects: "5ft range." },
      { name: "Squeal", toHitStat: "cha", damageDice: "2d4", damageStat: "cha", damageType: "Sonic", effects: "60ft range. On Evade Major Fail or worse, crawler gains Staggered Debuff." }
    ],
    loot: [
      { name: "Tiny Champion Pit Belt", quantity: 1, notes: "Gold-plated gerbil-sized championship belt." },
      { name: "Frenzied Whisker Set", quantity: 1, notes: "Vibrating sensory whiskers granting speed bonuses." }
    ]
  },
  {
    name: "Rat Janitor",
    level: 1,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Floor 1 Corridors",
    size: "Tiny",
    bars: 1,
    str: 3, int: 1, con: 1, dex: 2, cha: 1,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 0,
    description: "Official First Floor Janitor Mob responsible for cleaning messes and eating corpses left behind by violent crawler encounters.",
    aiDescription: "Floor 1 Janitor Mob—This Mob is responsible for cleaning messes on floor 1 and prioritizes eating corpses. It attacks crawlers when provoked, or when no other food options are nearby.",
    notes: "Janitor Mob—Prioritizes devouring corpses. Attacks crawlers when provoked or hungry.",
    source: "Page 138, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d4", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff." }
    ],
    loot: [
      { name: "Janitor Rat Pelt", quantity: 1, notes: "Scruffy rodent fur smelling faintly of floor wax." }
    ]
  },
  {
    name: "Rayzer",
    level: 3,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Bogbricks Neighborhood",
    size: "Petite",
    bars: 3,
    str: 2, int: 1, con: 4, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 2,
    description: "Air-swimming stingray creature with protruding eyestalks that shoots force missiles and stings with disorienting toxins from dungeon ceilings.",
    aiDescription: "The Rayzer is a deceptively cunning ambush predator. Sure, they can fly and shoot magic and even blend in with their surroundings, but that’s not what makes them so successful. Their true power lies in their patience and their intelligence.",
    notes: "Wall Cling—Can land vertically or upside down. Flight—Moves through air as ground and hovers in place.",
    source: "Page 19, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Magic Missile Spell", toHitStat: "dex", damageDice: "1d4", damageStat: "con", damageType: "Force", effects: "Line of Sight range." },
      { name: "Tail Sting", toHitStat: "dex", damageDice: "1d4", damageStat: "str", damageType: "Poison", effects: "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff." }
    ],
    loot: [
      { name: "Rayzer Eyestalk", quantity: 2, notes: "Flexible optic stalk with innate force magic." },
      { name: "Barbed Rayzer Barb", quantity: 1, notes: "Poison-dripping tail spine." }
    ]
  },
  {
    name: "Riff Roughers",
    level: 4,
    classification: "Mob",
    creatureType: "Animal",
    floor: "Floor 1",
    location: "Bogbricks Cypress Halls",
    size: "Petite",
    bars: 4,
    str: 6, int: 1, con: 6, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Four-foot-tall coatimundi-headed swashbucklers dressed in 1800s pirate garb, brandishing cutlasses with ferocious precision and noxious breath.",
    aiDescription: "If you’ve ever wanted to get into a swordfight with a pirate, well… here’s your chance, Orlando Bloom! Some think the Riff Roughers are just older Scat Thugs while others think they’re a separate species entirely. One thing is sure: That debate is for Nerds!",
    notes: "Swordsmen—Expert melee combatants.",
    source: "Page 19, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Breath", toHitStat: "con", damageDice: "1d4", damageStat: "con", damageType: "Acid", effects: "10ft Cone. On Evade Major Fail or worse, crawler gains Poisoned Debuff." },
      { name: "Cutlass", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Slashing", effects: "5ft range." }
    ],
    loot: [
      { name: "Pirate Cutlass", quantity: 1, notes: "Curved naval sword." },
      { name: "1800s Ruffled Collar", quantity: 1, notes: "Antique pirate neckwear." }
    ]
  },
  {
    name: "Rot Sticker",
    level: 1,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Floor 1 Corridors",
    size: "Tiny",
    bars: 1,
    str: 2, int: 1, con: 1, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Tiny parasitic creatures that stick tenaciously to crawlers and vertical walls, detonating in explosive suicide attacks when attached.",
    aiDescription: "Small, sticky, and suicidal. They jump onto you like burrs on a wool sweater, and then they blow themselves to smithereens.",
    notes: "Overly-Attached—Stick attaches to target sharing space; can only Explode while attached (slaying itself). Sticky—Sticks to walls and ceilings.",
    source: "Page 138, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Stick", toHitStat: "dex", damageDice: "0", damageStat: "dex", damageType: "Physical", effects: "5ft range. On Evade Fail, attaches to crawler." },
      { name: "Explode", toHitStat: "dex", damageDice: "1d6", damageStat: "con", damageType: "Bludgeoning", effects: "0ft range (while attached). On Evade Major Fail, crawler gains Take Down Debuff." }
    ],
    loot: [
      { name: "Sticky Gland", quantity: 1, notes: "Natural adhesive sac." }
    ]
  },
  {
    name: "Scat Thug",
    level: 3,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Bogbricks Gaslamp District",
    size: "Petite",
    bars: 3,
    str: 3, int: 3, con: 1, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 30,
    dr: 1,
    description: "Three-foot-tall raccoon-headed creatures that excel in trap-making, pickpocketing, and hurling foul-smelling scat pellets from shadows.",
    aiDescription: "Don’t let their adorable little faces and sad beady eyes fool you—these scrappy little guys rob and ambush crawlers whenever an opportunity presents itself. And if they’re hungry, all bets are off.",
    notes: "Thief—Adjacent crawlers must make Int check or lose item. Trapper—Can activate one trap within 60ft alongside Action.",
    source: "Page 20, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Spear", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Piercing", effects: "10ft range." },
      { name: "Scat Pellet", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Bludgeoning", effects: "30ft range. On Evade Major Fail or worse, crawler gains Stank Rot Debuff." }
    ],
    loot: [
      { name: "Scat Thug Spear", quantity: 1, notes: "Light wooden spear." },
      { name: "Pellet Pouch", quantity: 1, notes: "Pouch of noxious projectile pellets." }
    ]
  },
  {
    name: "Scatterer",
    level: 1,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Floor 1 Walls and Ceilings",
    size: "Small",
    bars: 1,
    str: 1, int: 1, con: 4, dex: 1, cha: 1,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 2,
    description: "Skittering cockroach-like insectoids crawling along ceilings and walls in search of waste, spitting foul toxic bile at trespassers.",
    aiDescription: "Standard dungeon creepy-crawly. Tough shell, nasty bite, and an unfortunate habit of spitting taint right down your collar.",
    notes: "Wall Walker—Scatterers can move along vertical surfaces and upside down on ceilings as though on the ground.",
    source: "Page 138, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Spit", toHitStat: "con", damageDice: "1d4", damageStat: "con", damageType: "Poison", effects: "30ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff." }
    ],
    loot: [
      { name: "Scatterer Chitin Shard", quantity: 1, notes: "Shiny brown exoskeleton plate." }
    ]
  },
  {
    name: "Scatterer Brood Guardian",
    level: 4,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Scatterer Brood Chambers",
    size: "Small",
    bars: 4,
    str: 6, int: 1, con: 6, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 30,
    dr: 2,
    description: "Large, heavily armored guardian scatterer that protects the egg clutches with reckless ferocity, shielding adjacent swarm-mates.",
    aiDescription: "When scatterers feel their nests are threatened, these armored brutes step forward with snapping jaws and a protective frenzy that covers the whole swarm.",
    notes: "Guardian—Other Scatterers adjacent to a brood guardian gain +3 bonus to Evade. Wall Walker. Riled Up—Adds Stat Mod twice to damage in first round.",
    source: "Page 139, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "str", damageDice: "1d8", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains The Taint Debuff." }
    ],
    loot: [
      { name: "Guardian Brood Plate", quantity: 2, notes: "Reinforced chitinous armor segment." }
    ]
  },
  {
    name: "Screye Drone",
    level: 7,
    classification: "Mob",
    creatureType: "Organic Machinery",
    floor: "Floor 1",
    location: "Bugaboo Surveillance Corridors",
    size: "Small",
    bars: 7,
    str: 6, int: 6, con: 6, dex: 6, cha: 2,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "16+F",
    move: 10,
    dr: 2,
    description: "Wobbling airborne surveillance unit assembled from harvested goblin eyes, scrap lenses, and clockwork, relaying feeds back to Stiggy's central hub.",
    aiDescription: "A terrifying blend of optometry and artisanal crafts, these guys are awfully nosy for something made out of eyeballs and pipe cleaners. Screye Drones are the evolved form of the doorbell cameras you see all over the place. They spy on you, scream for help, and carry messages from their overlord.",
    notes: "Alarm—Emits high-pitched chimes summoning nearby Bugaboos. The Eyes Have It—Covered with eyes, very hard to surprise. Hover.",
    source: "Page 129, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Weeping Eye Discharge", toHitStat: "dex", damageDice: "0", damageStat: "dex", damageType: "Physical", effects: "25ft range. Hits apply Take Down and Fatigued Debuffs." }
    ],
    loot: [
      { name: "Screye Lens Assembly", quantity: 1, notes: "Optical sensory lens." },
      { name: "Preserved Camera Eye", quantity: 2, notes: "Intact harvested eyeball." }
    ]
  },
  {
    name: "Shambling Acid Impaler",
    level: 6,
    classification: "Mob",
    creatureType: "Zombie",
    floor: "Floor 1",
    location: "Arcadia Outskirts",
    size: "Large",
    bars: 6,
    str: 3, int: 1, con: 6, dex: 10, cha: 3,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "11+F",
    move: 10,
    dr: 2,
    description: "A bloated, decomposing zombie studded with acidic bone spikes, projecting caustic darts across long distances and lashing out with a prehensile tongue.",
    aiDescription: "Decaying undead monstrosity that launches corrosive darts and whips targets with a dissolution-inducing tongue.",
    notes: "Inflicts severe acid damage and ongoing Dissolving Debuffs with each attack.",
    source: "Page 86, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Acid Dart", toHitStat: "dex", damageDice: "2d6", damageStat: "str", damageType: "Acid", effects: "40ft range. On Evade Major Fail or worse, crawler gains Queasy and Dissolving Debuffs (1d6+F Acid/round)." },
      { name: "Tongue Lash", toHitStat: "dex", damageDice: "2d8", damageStat: "str", damageType: "Bludgeoning", effects: "10ft range. On Evade Major Fail or worse, crawler gains Dissolving Debuff." }
    ],
    loot: [
      { name: "Corrosive Acid Gland", quantity: 1, notes: "Vial of concentrated zombie acid." },
      { name: "Impaler Bone Barb", quantity: 2, notes: "Dense barbed bone spike." }
    ]
  },
  {
    name: "Slimy Croakers",
    level: 3,
    classification: "Mob",
    creatureType: "Beastly",
    floor: "Floor 1",
    location: "Webbinghoods Spiders' Lairs",
    size: "Small",
    bars: 3,
    str: 3, int: 1, con: 3, dex: 5, cha: 2,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 1,
    description: "Anthropomorphic frogs wearing spider-silk robes that serve as cleaners, gardeners, and guardians for Giant Spider nests.",
    aiDescription: "Mobs keeping other Mobs as pets? It’s not just some GM’s twisted power fantasy—turns out it’s true and at least vaguely canon! While the Giant Spiders are out hunting, making websites, or doing other spider-stuff, these little amphibious guys keep their homes clean and free of pests.",
    notes: "Slippery Slime—Leaves puddle of slime on attack and upon death (Dex check or Take Down). Egg Protector—Croaks summon all Croakers within 60ft if eggs damaged.",
    source: "Page 52, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Tongue Whip", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Bludgeoning", effects: "10ft range. On Evade Major Fail or worse, crawler gains Paralyzed Debuff." },
      { name: "Croak", toHitStat: "cha", damageDice: "1d4", damageStat: "con", damageType: "Sonic", effects: "20ft Cone + 10ft Splash." }
    ],
    loot: [
      { name: "Spider-Silk Robes (Torn)", quantity: 1, notes: "Delicate woven spider silk garment." },
      { name: "Paralyzing Slime Phial", quantity: 1, notes: "Gooey frog secretion causing numbness." }
    ]
  },
  {
    name: "Spit—Goblin Survivor Who Lives in the Now",
    level: 6,
    classification: "Mob",
    creatureType: "Unique Humanoid",
    floor: "Floor 1",
    location: "Passive (Aggressive) Perception Survivor Camp",
    size: "Petite",
    bars: 6,
    str: 6, int: 4, con: 6, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Twin brother of Spat. Spit speaks strictly in the present tense, remaining stubbornly optimistic and focused exclusively on what is happening right now.",
    aiDescription: "Spit is a lovable little Goblin who just narrowly avoided having his eyes plucked out of his head thanks to your brave efforts. He and his twin brother, Spat, make quite the pair, with Spit being the more level-headed and optimistic of the two. Weirdly, he only speaks in the present tense… probably got dropped on his head as a baby or something.",
    notes: "Speaks only in the present tense. Helps crawlers track Bugaboo patrol routes.",
    source: "Page 130, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Rock", toHitStat: "dex", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "30ft range." },
      { name: "Spear", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." }
    ],
    loot: [
      { name: "Spit's Lucky Spear", quantity: 1, notes: "Reliable sharpened goblin spear." },
      { name: "Smooth Skipping Rock", quantity: 3, notes: "Perfect throwing stones." }
    ]
  },
  {
    name: "Spit—Goblin Who Just Can’t Seem to Let Go of the Past",
    level: 7,
    classification: "Mob",
    creatureType: "Unique Humanoid",
    floor: "Floor 1",
    location: "Passive (Aggressive) Perception Survivor Camp",
    size: "Petite",
    bars: 7,
    str: 10, int: 3, con: 6, dex: 6, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Twin brother of Spit (named Spat in story text). He speaks strictly in the past tense, brooding over past goblin traditions and nursing deep vengeance against Stiggy.",
    aiDescription: "Spat was a cheerful Goblin scout who took glee in doing the things Goblin Mobs do in the dungeon. He used to pillage, terrorize crawlers, raid, and do all the gobliny sorts of things he was supposed to. That all changed when the Bugaboos descended on his camp to harvest his family’s eyes.",
    notes: "Speaks only in the past tense. Listed as Spit in TOC and Spat in chapter text.",
    source: "Page 131, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Rock", toHitStat: "dex", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "30ft range." },
      { name: "Spear", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." }
    ],
    loot: [
      { name: "Spat's Vengeance Spear", quantity: 1, notes: "Blood-notched spear dedicated to fallen kin." },
      { name: "Grudge Stone", quantity: 1, notes: "Carved stone recording Bugaboo crimes." }
    ]
  },
  {
    name: "Sprites",
    level: 7,
    classification: "Mob",
    creatureType: "Humanoid, Winged Fairy",
    floor: "Floor 1",
    location: "Arcadia",
    size: "Tiny",
    bars: 7,
    str: 3, int: 3, con: 6, dex: 7, cha: 7,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 2,
    description: "Tiny, generic fairy humanoids planted by the System AI across Arcadia. Mild and repetitive at first, they form terrifying torch-and-pitchfork mobs when angered.",
    aiDescription: "Gotta admit: These guys are pretty mundane until you get ’em all riled up. They’re single-minded, but that’s just how they’re created. Don’t count them all out, though! For every 'Did you hear that noise from across the floor?' Sprite you find, there’s one that harbors a clue to a rare treasure.",
    notes: "Communicate sub-harmonically. Can swarm in large groups with torches and pitchforks.",
    source: "Page 86, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Pitchfork", toHitStat: "dex", damageDice: "2d8", damageStat: "str", damageType: "Piercing", effects: "5ft range." },
      { name: "Thrown Rock", toHitStat: "dex", damageDice: "2d6", damageStat: "str", damageType: "Bludgeoning", effects: "30ft range." }
    ],
    loot: [
      { name: "Tiny Iron Pitchfork", quantity: 1, notes: "Fairy-sized but remarkably sharp weapon." },
      { name: "Gossamer Sprite Dust", quantity: 1, notes: "Glittering fairy dust." }
    ]
  },
  {
    name: "Stiggy, Dungeon Surveillance Architect",
    level: 14,
    classification: "Borough Boss",
    creatureType: "Cybernetic Humanoid",
    floor: "Floor 1",
    location: "Central Surveillance Hub",
    size: "Petite",
    bars: 10,
    str: 7, int: 50, con: 7, dex: 10, cha: 7,
    evadeDifficulty: "14+F",
    surpriseDifficulty: "22+F",
    move: 10,
    dr: 3,
    description: "Suspended aloft by an electrified hydraulic armature in a circular control room plastered with monitors, Stiggy watches every corner of the dungeon through stolen eyes.",
    aiDescription: "Stiggy—Dungeon Surveillance Architect. Level 14 Borough Boss! Stiggy is what happens when a Peeping Tom gets access to Big Brother techno-sorcery and an unlimited supply of potential muses. Now Stiggy installs eyes in walls to hoard information and peek at your naughty bits. Smile for the camera, crawlers. Stiggy has his eye on you.",
    notes: "Hands Off—One attack per round; opens trapdoors and rotates floor. Hydraulic Arm—DR 5, 8 bars of 3 HP (smashing kills Stiggy). Electrified Arm—1:1 damage reflection buff. Screens Everywhere—High surprise DC.",
    source: "Page 135, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Probe", toHitStat: "int", damageDice: "3d6", damageStat: "int", damageType: "Psychic", effects: "10ft range. Cha Stat Check to avoid (no Evade) or live out past traumas on screens." },
      { name: "Camera Flash", toHitStat: "dex", damageDice: "2d4", damageStat: "dex", damageType: "Electric", effects: "30ft range. Disadvantage to Evade; on hit gains Blinded Debuff." }
    ],
    loot: [
      { name: "Screye Camera Monitor Slab", quantity: 1, notes: "Administrative monitor stone accessing surveillance network." },
      { name: "Stiggy's Cybernetic Visor", quantity: 1, notes: "Multi-optic HUD visor with true-sight feeds." }
    ]
  },
  {
    name: "Trash Princess",
    level: 4,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 1",
    location: "Bogbricks Gaslamp District",
    size: "Petite",
    bars: 4,
    str: 1, int: 3, con: 3, dex: 3, cha: 7,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "12+F",
    move: 20,
    dr: 1,
    description: "Female Scat Thugs who revere the Hide-Hitter Crib Daddy, fighting with weaponized trash, concussive thunderclaps, and bizarre pheromone seduction.",
    aiDescription: "Female Scat Thugs, known as Trash Princesses, outnumber the males in this Neighborhood by a factor of 15 to 1. Despite their propensity for thievery, both genders smell as awful as the scat they live in.",
    notes: "Collateral Trashing—If Area attacks hit 3+ entities (allies or enemies), deals +1d6 extra damage to each target.",
    source: "Page 21, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Eat Trash and Die", toHitStat: "cha", damageDice: "1d6", damageStat: "cha", damageType: "Poison", effects: "30ft range, 10ft Blast radius. On Evade Major Fail, crawler gains Stank Rot Debuff." },
      { name: "Trash Thunderclap", toHitStat: "dex", damageDice: "1d6", damageStat: "cha", damageType: "Force", effects: "15ft Cone. On Evade Major Fail, crawler is pushed back 10ft." },
      { name: "Seduction", toHitStat: "cha", damageDice: "1d6", damageStat: "cha", damageType: "Psychic", effects: "15ft Cone. Free Int Stat Check vs 14 or gain Seduced Debuff." }
    ],
    loot: [
      { name: "Princess Tiara (Recycled)", quantity: 1, notes: "Bent aluminum tiara decorated with bottle caps." },
      { name: "Stank Rot Perfume Bottle", quantity: 1, notes: "Pungent raccoon musk spray." }
    ]
  },
  {
    name: "Troglodyte Basher",
    level: 6,
    classification: "Mob",
    creatureType: "Humanoid",
    floor: "Floor 2",
    location: "Mind Maze concrete tunnels",
    size: "Medium",
    bars: 6,
    str: 7, int: 1, con: 7, dex: 7, cha: 1,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "11+F",
    move: 20,
    dr: 2,
    description: "Lizard-faced humanoids coated in thick, foul-smelling protective slime, bashing targets with heavy clubs and spitting caustic venom.",
    aiDescription: "Slick slapping noises echo against the walls and floor of this street, the sound of slightly-wet, slightly tacky flesh on concrete. Slime-coated troglodytes pause in their scavenging as they smell you approaching, turning toward you with gaping maws, drool dripping from their teeth.",
    notes: "Slimed!—When adjacent crawler rolls Amazing Success or better with an attack, they get Queasy Debuff from splashing slime.",
    source: "Page 120, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bash", toHitStat: "str", damageDice: "2d8", damageStat: "str", damageType: "Bludgeoning", effects: "5ft range." },
      { name: "Venom Spit", toHitStat: "con", damageDice: "1d6", damageStat: "con", damageType: "Poison", effects: "20ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff." }
    ],
    loot: [
      { name: "Troglodyte Basher Club", quantity: 1, notes: "Slime-coated heavy war club." },
      { name: "Numbing Troglodyte Slime", quantity: 1, notes: "Secretion used in crafting salves." }
    ]
  },
  {
    name: "Troglodyte Pygmy",
    level: 2,
    classification: "Mob",
    creatureType: "Mutated",
    floor: "Floor 2",
    location: "Troglodyte Burrows",
    size: "Petite",
    bars: 2,
    str: 2, int: 3, con: 2, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "12+F",
    move: 30,
    dr: 1,
    description: "Diminutive, lightning-fast troglodyte pack hunters that dart in to inflict venomous bites before immediately stepping away out of reach.",
    aiDescription: "Pygmy troglodytes don't try to bash your head in—they dart between your legs, deliver a quick venomous nip to your achilles, and skip back before you can swing.",
    notes: "Dine and Dash—Pygmies Move in and attack their prey, then immediately Step Away.",
    source: "Page 142, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Bite", toHitStat: "dex", damageDice: "1d6", damageStat: "dex", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff." }
    ],
    loot: [
      { name: "Pygmy Troglodyte Tooth", quantity: 1, notes: "Sharp venom-grooved tooth." }
    ]
  },
  {
    name: "Troglodyte Virtuoso",
    level: 4,
    classification: "Mob",
    creatureType: "Mutated",
    floor: "Floor 2",
    location: "Mind Maze Rafters",
    size: "Petite",
    bars: 4,
    str: 3, int: 3, con: 3, dex: 6, cha: 2,
    evadeDifficulty: "13+F",
    surpriseDifficulty: "12+F",
    move: 25,
    dr: 1,
    description: "Slime-covered mutant troglodyte equipped with a fifteen-foot prehensile tongue that whips through the air to grapple and drag distant crawlers.",
    aiDescription: "You think you're safe at range until a glistening fifteen-foot tongue shoots around the corner and wraps around your neck like a greasy scarf.",
    notes: "Got Your Tongue—Target can attempt Wrasslin' attack to grab tongue as Interrupt. Tongue of War—Pulling contest dealing 1d4+F per 5ft moved.",
    source: "Page 142, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Tongue Whip", toHitStat: "dex", damageDice: "1d6", damageStat: "str", damageType: "Bludgeoning", effects: "15ft range. On Evade Major Fail or worse, crawler gains Held Debuff." },
      { name: "Bite", toHitStat: "dex", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Poisoned Debuff." }
    ],
    loot: [
      { name: "Elastic Troglodyte Tongue", quantity: 1, notes: "Tough stretchy muscular organ." },
      { name: "Virtuoso Slime Vial", quantity: 1, notes: "Prehensile grip lubricant." }
    ]
  },
  {
    name: "Vine Creeper",
    level: 2,
    classification: "Mob",
    creatureType: "Plant",
    floor: "Floor 1",
    location: "Webbinghoods Overgrowth",
    size: "Huge",
    bars: 2,
    str: 3, int: 1, con: 3, dex: 3, cha: 1,
    evadeDifficulty: "12+F",
    surpriseDifficulty: "11+F",
    move: 15,
    dr: 1,
    description: "Gigantic eggplant-shaped leafy pods that sleep deep inside ruined houses, sending out long sensitive vines that snatch unsuspecting prey and drag them into digestive pods.",
    aiDescription: "Remember the end of Little Shop of Horrors when Audrey II breaks out of its flowerpot and shoots a bunch of singing vines in every direction while trying to eat Rick Moranis? Take away the singing and Audrey II’s huge head and replace it with a giant transforming eggplant, and it’ll be pretty much identical to a Vine Creeper.",
    notes: "Pod ambush predator. Dragged victims are digested by acids inside pod.",
    source: "Page 50, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Fang", toHitStat: "str", damageDice: "1d6", damageStat: "str", damageType: "Piercing", effects: "5ft range. On Evade Major Fail or worse, crawler gains Poison Debuff." },
      { name: "Vine", toHitStat: "str", damageDice: "1d4", damageStat: "str", damageType: "Bludgeoning", effects: "30ft range. Hit crawler gains Held Debuff and is pulled closer (broken on Creeper death)." }
    ],
    loot: [
      { name: "Creeper Constricting Vine", quantity: 2, notes: "Tough flexible plant tendril." },
      { name: "Enzyme Pod Shell", quantity: 1, notes: "Fibrous pod shell resistant to digestive acids." }
    ]
  },
  {
    name: "Wise-Guyy",
    level: 5,
    classification: "Crawler",
    creatureType: "Human",
    floor: "Floor 1",
    location: "Floor 1 Saferoom Outskirts",
    size: "Medium",
    bars: 5,
    str: 3, int: 6, con: 4, dex: 2, cha: 5,
    evadeDifficulty: "11+F",
    surpriseDifficulty: "13+F",
    move: 20,
    dr: 3,
    description: "Arrogant rival crawler who fancies himself an arcane mastermind, flinging magic missiles while sneering at newer adventurers.",
    aiDescription: "They think they’re hot shit in a champagne glass. Arrogant rival crawler whose ego far exceeds his hit bar count.",
    notes: "Rival Crawler—Smart-ass NPC mage.",
    source: "Page 136, Game Master's Campaign Toolkit",
    attacks: [
      { name: "Magic Missile Spell", toHitStat: "int", damageDice: "2d4", damageStat: "int", damageType: "Force", effects: "Line of Sight range." }
    ],
    loot: [
      { name: "Wise-Guy's Arcane Ring", quantity: 1, notes: "Silver ring inscribed with rudimentary spell formulas." },
      { name: "Crawler Gold", quantity: 25, notes: "Stolen or won dungeon coins." }
    ]
  }
];

// Combine existing 23 mobs + 61 new mobs = 84 total mobs
const allMobs = [...EXISTING_MOBS];

let nextIndex = EXISTING_MOBS.length + 1;
for (const def of NEW_MOBS_DEFS) {
  const mob = makeMob(nextIndex++, def);
  allMobs.push(mob);
}

console.log(`Total mobs assembled: ${allMobs.length}`);

// Write src/data/mobs.mjs
const fileHeader = `/**
 * Dungeon Crawler Carl RPG - Official Mobs Dataset
 * Populated from the official Game Master's Toolkit - Entities List.
 * Contains all 84 mobs, bosses, and rival crawlers from Page 3 of the Toolkit.
 */

export const DCC_MOBS = ${JSON.stringify(allMobs, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/mobs.mjs'), fileHeader, 'utf8');
console.log("Successfully wrote src/data/mobs.mjs!");
