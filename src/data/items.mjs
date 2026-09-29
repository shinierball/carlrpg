/**
 * Dungeon Crawler Carl RPG - Official Items & Equipment Dataset
 * Includes canonical gear (weapons, armor, accessories), consumables, wands, scrolls,
 * and World Dungeon lottery scratch-off tickets.
 */

export const DCC_ITEMS = [
  // --- WEAPONS (GEAR) ---
  {
    _id: "dccwpn0000000001",
    name: "Spiked Baseball Bat",
    type: "gear",
    img: "icons/weapons/clubs/club-barbed-wood.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 15,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d8", type: "Bludgeoning" },
        { formula: "1d4", type: "Piercing" }
      ],
      skillModifiers: [{ name: "Bashing", bonus: 1 }],
      notes: "Heavy wooden bat driven through with rusty nails. Bashing skill bonus +1.",
      description: "A crude but undeniably effective dungeon classic. Delivers crushing bludgeoning damage alongside piercing puncture wounds from rusty steel nails."
    }
  },
  {
    _id: "dccwpn0000000002",
    name: "Hunting Bow",
    type: "gear",
    img: "icons/weapons/bows/shortbow-recurve-leather.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 25,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d8", type: "Piercing" }
      ],
      skillModifiers: [{ name: "Ranged", bonus: 1 }],
      notes: "Compound hunting bow with balanced draw string. Range: 60ft.",
      description: "A precision hunting bow scavenged from sporting goods displays. Silent, reliable, and lethal at a distance."
    }
  },
  {
    _id: "dccwpn0000000003",
    name: "Combat Dagger",
    type: "gear",
    img: "icons/weapons/daggers/dagger-straight-curved-grey.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 12,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d6", type: "Piercing" }
      ],
      skillModifiers: [{ name: "Edged", bonus: 1 }],
      notes: "Serrated steel blade with non-slip polymer grip.",
      description: "A tactical military dagger with a dark matte anti-glare finish and razor-sharp serrations."
    }
  },
  {
    _id: "dccwpn0000000004",
    name: "Boarding Spear",
    type: "gear",
    img: "icons/weapons/polearms/spear-flanged-iron.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 20,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d10", type: "Piercing" }
      ],
      skillModifiers: [{ name: "Reach", bonus: 1 }],
      notes: "Long reach polearm. Can strike enemies from 10ft away.",
      description: "A heavy reinforced spear that keeps ravenous goblins and burrowing pests at a comfortable arm's length."
    }
  },
  {
    _id: "dccwpn0000000005",
    name: "Heavy Crossbow",
    type: "gear",
    img: "icons/weapons/crossbows/crossbow-black.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 35,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d10", type: "Piercing" }
      ],
      notes: "High-tension steel prod delivering punchy bolts with armor penetration.",
      description: "Mechanical devastation in a compact frame. Requires two hands to load, but punches straight through light armor."
    }
  },
  {
    _id: "dccwpn0000000006",
    name: "Brass Knuckles",
    type: "gear",
    img: "icons/weapons/fist/fist-knuckles-steel.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 8,
      equipped: false,
      isWeapon: true,
      cooldown: "None",
      damageParts: [
        { formula: "1d4", type: "Bludgeoning" }
      ],
      skillModifiers: [{ name: "Unarmed Combat", bonus: 1 }],
      notes: "Close-quarters punch reinforcer. Grants +1 bonus to Unarmed Combat checks.",
      description: "Cast metal knuckles designed to turn ordinary punches into bone-cracking strikes."
    }
  },
  {
    _id: "dccwpn0000000007",
    name: "Riot Shield",
    type: "gear",
    img: "icons/equipment/shield/heater-wooden-shield.webp",
    system: {
      slot: "hands",
      quantity: 1,
      value: 30,
      equipped: false,
      drBonus: 1,
      evadeBonus: 1,
      notes: "+1 Damage Resistance and +1 Evade when held.",
      description: "A reinforced polycarbonate protective shield that deflects incoming physical projectiles and blunt strikes."
    }
  },

  // --- ARMOR & APPAREL (GEAR) ---
  {
    _id: "dccamr0000000001",
    name: "Pink Heart Boxer Shorts",
    type: "gear",
    img: "icons/equipment/leg/pants-cloth-red.webp",
    system: {
      slot: "legs",
      quantity: 1,
      value: 5,
      equipped: true,
      drBonus: 0,
      notes: "Carl's iconic starting attire. Breathable cotton with bright red hearts.",
      description: "You entered the World Dungeon in your underwear during the middle of the night. At least they're 100% cotton and surprisingly stylish."
    }
  },
  {
    _id: "dccamr0000000002",
    name: "Leather Biker Vest",
    type: "gear",
    img: "icons/equipment/chest/vest-leather-studded-brown.webp",
    system: {
      slot: "torso",
      quantity: 1,
      value: 25,
      equipped: false,
      drBonus: 1,
      notes: "+1 Damage Resistance.",
      description: "Thick oiled steerhide that absorbs bites and blunt impacts without sacrificing torso mobility."
    }
  },
  {
    _id: "dccamr0000000003",
    name: "Reinforced Tactical Armor",
    type: "gear",
    img: "icons/equipment/chest/breastplate-leather-brown.webp",
    system: {
      slot: "torso",
      quantity: 1,
      value: 65,
      equipped: false,
      drBonus: 2,
      evadeBonus: -1,
      notes: "+2 Damage Resistance, -1 Evade penalty due to bulk.",
      description: "Rigid composite plating over ballistics nylon. Offers formidable protection at the cost of agility."
    }
  },
  {
    _id: "dccamr0000000004",
    name: "Tactical Combat Helmet",
    type: "gear",
    img: "icons/equipment/head/helm-open-steel.webp",
    system: {
      slot: "head",
      quantity: 1,
      value: 30,
      equipped: false,
      drBonus: 1,
      notes: "+1 Damage Resistance. Protects against critical cranial concussions.",
      description: "Hardened kevlar helmet with chin strap and padded inner suspension."
    }
  },
  {
    _id: "dccamr0000000005",
    name: "Steel-Toed Combat Boots",
    type: "gear",
    img: "icons/equipment/feet/boots-leather-steel-toe.webp",
    system: {
      slot: "feet",
      quantity: 1,
      value: 25,
      equipped: false,
      drBonus: 0,
      notes: "Reinforced soles. Stomp damage bonus against grounded foes.",
      description: "Rugged military boots designed for marching through broken glass, sewage, and shattered monster carapaces."
    }
  },
  {
    _id: "dccacc0000000001",
    name: "Crown of the Desolation",
    type: "gear",
    img: "icons/equipment/head/circlet-gold-gem.webp",
    system: {
      slot: "head",
      quantity: 1,
      value: 120,
      equipped: false,
      abilityModifiers: {
        int: { value: 1, type: "flat" },
        cha: { value: 1, type: "flat" }
      },
      notes: "+1 INT and +1 CHA while worn.",
      description: "An ornate gilded circlet humming with ancient dungeon authority. Makes the wearer look both commanding and slightly intimidating."
    }
  },
  {
    _id: "dccacc0000000002",
    name: "Ring of Minor Flames",
    type: "gear",
    img: "icons/equipment/finger/ring-band-fire.webp",
    system: {
      slot: "accessory",
      quantity: 1,
      value: 75,
      equipped: false,
      hasActivatedAbility: true,
      cooldown: "Once per scene",
      charges: { value: 1, max: 1 },
      outcomes: [
        {
          name: "Fireball",
          type: "spell",
          spellName: "Fireball",
          damage: "2d10 + Int",
          damageType: "Fire",
          targetType: "closest_mob",
          description: "Unleashes an explosive burst of fire at the closest mob. Costs 0 mana."
        }
      ],
      notes: "Activated Ability: Casts Fireball (0 Mana) once per scene.",
      description: "A bronze ring set with a warm ember stone. Flickers with eager flame whenever combat erupts."
    }
  },
  {
    _id: "dccacc0000000003",
    name: "Tortoise Shell Ring",
    type: "gear",
    img: "icons/equipment/finger/ring-band-wood-green.webp",
    system: {
      slot: "accessory",
      quantity: 1,
      value: 50,
      equipped: false,
      drBonus: 1,
      notes: "+1 Damage Resistance.",
      description: "Carved from polished reptile carapace, this ring wraps the wearer in subtle earthen warding."
    }
  },
  {
    _id: "dccacc0000000004",
    name: "Enchanted Pet Collar",
    type: "gear",
    img: "icons/equipment/neck/choker-leather-ruby.webp",
    system: {
      slot: "accessory",
      quantity: 1,
      value: 90,
      equipped: false,
      abilityModifiers: {
        cha: { value: 1, type: "flat" }
      },
      notes: "+1 Charisma. Suitable for Princess Donut or any companion.",
      description: "A glamorous red velvet collar studded with sparkling imitation rubies. Guaranteed to impress the Syndicate broadcast audience."
    }
  },

  // --- CONSUMABLES, POTIONS, WANDS & SCROLLS (LOOT) ---
  {
    _id: "dccitm0000000001",
    name: "Normal Mana Potion",
    type: "loot",
    img: "icons/svg/potion.svg",
    system: {
      quantity: 1,
      value: 10,
      cooldown: "None",
      lootType: "consumable",
      notes: "Refills mana completely to maximum.",
      description: "A crystalline blue flask filled with shimmering liquid mana. Consuming this item mid-battle immediately restores your mana reserves to full.",
      outcomes: []
    }
  },
  {
    _id: "dccitm0000000003",
    name: "Lesser Health Potion",
    type: "loot",
    img: "icons/consumables/potions/potion-tube-corked-red.webp",
    system: {
      quantity: 1,
      value: 15,
      cooldown: "None",
      lootType: "consumable",
      executionMode: "all",
      notes: "Restores 2 Health Bars immediately (2 * CON Mod HP).",
      description: "A vibrant crimson vial of soothing restorative brew. Closes lacerations and stabilizes broken ribs.",
      outcomes: [
        {
          name: "Lesser Healing",
          type: "heal",
          healBars: 2,
          targetType: "self",
          description: "Restores up to 2 Health Bars to the user."
        }
      ]
    }
  },
  {
    _id: "dccitm0000000004",
    name: "Greater Health Potion",
    type: "loot",
    img: "icons/consumables/potions/potion-bottle-corked-glowing-red.webp",
    system: {
      quantity: 1,
      value: 45,
      cooldown: "None",
      lootType: "consumable",
      executionMode: "all",
      notes: "Restores 5 Health Bars immediately (5 * CON Mod HP).",
      description: "A glowing ruby potion that reknits shattered organs and rapidly heals severe trauma.",
      outcomes: [
        {
          name: "Greater Healing",
          type: "heal",
          healBars: 5,
          targetType: "self",
          description: "Restores up to 5 full Health Bars to the user."
        }
      ]
    }
  },
  {
    _id: "dccitm0000000005",
    name: "Troll Blood Elixir",
    type: "loot",
    img: "icons/consumables/potions/potion-bottle-corked-green.webp",
    system: {
      quantity: 1,
      value: 40,
      cooldown: "None",
      lootType: "consumable",
      executionMode: "all",
      notes: "Applies Troll Blood HoT: Restores 2 Health Bars per round for 3 combat rounds.",
      description: "A thick emerald tonic distilled from regenerating river troll bile. Grants rapid regeneration over multiple rounds.",
      outcomes: [
        {
          name: "Troll Blood HoT",
          type: "heal_over_time",
          healBars: 2,
          rounds: 3,
          targetType: "self",
          description: "Ticks 2 bars of regeneration each combat turn for 3 rounds."
        }
      ]
    }
  },
  {
    _id: "dccitm0000000006",
    name: "Antidote Flask",
    type: "loot",
    img: "icons/consumables/potions/potion-flask-corked-yellow.webp",
    system: {
      quantity: 1,
      value: 12,
      cooldown: "None",
      lootType: "consumable",
      executionMode: "all",
      notes: "Cures all Poison, Acid, and Toxic debuffs immediately.",
      description: "A pungent herbal concoction that neutralizes venom, acid burns, and systemic poisons.",
      outcomes: [
        {
          name: "Detox Cleansing",
          type: "cure_debuff",
          cureFilter: "all",
          targetType: "self",
          description: "Removes all active debuffs from the crawler."
        }
      ]
    }
  },
  {
    _id: "dccitm0000000007",
    name: "Scroll of Fireball",
    type: "loot",
    img: "icons/sundries/scrolls/scroll-bound-red.webp",
    system: {
      quantity: 1,
      value: 30,
      cooldown: "None",
      lootType: "scroll",
      spellName: "Fireball",
      notes: "Single-use spell scroll. Casts Fireball with 0 mana required.",
      description: "A parchment scroll inscribed with fiery runes. Reading the inscription casts a devastating Fireball at zero mana cost, burning the scroll to ash."
    }
  },
  {
    _id: "dccitm0000000008",
    name: "Scroll of Heal",
    type: "loot",
    img: "icons/sundries/scrolls/scroll-bound-blue.webp",
    system: {
      quantity: 1,
      value: 20,
      cooldown: "None",
      lootType: "scroll",
      spellName: "Heal",
      notes: "Single-use spell scroll. Casts Heal with 0 mana required.",
      description: "A holy illuminated scroll that invokes soothing restorative magic, healing up to 2 health bars with no mana spent."
    }
  },
  {
    _id: "dccitm0000000009",
    name: "Scroll of Earworm",
    type: "loot",
    img: "icons/sundries/scrolls/scroll-bound-purple.webp",
    system: {
      quantity: 1,
      value: 35,
      cooldown: "None",
      lootType: "scroll",
      spellName: "Earworm",
      notes: "Single-use spell scroll. Casts Earworm (Sonic damage) for 0 mana.",
      description: "Inscribed with hypnotic musical notation that lodges unbearable sonic noise in an enemy's mind."
    }
  },
  {
    _id: "dccitm0000000010",
    name: "Wand of Magic Sparks",
    type: "loot",
    img: "icons/weapons/wands/wand-carved-gold.webp",
    system: {
      quantity: 1,
      value: 50,
      cooldown: "None",
      lootType: "wand",
      charges: { value: 5, max: 5 },
      executionMode: "all",
      notes: "Wand with 5 charges. Shoots Magic Sparks (1d6 + Int Force damage) for 0 mana.",
      description: "A polished wooden wand topped with a brass spark plug. Expends charges to fire energetic bolts without draining caster mana.",
      outcomes: [
        {
          name: "Magic Spark",
          type: "spell",
          damage: "1d6 + Int",
          damageType: "Force",
          targetType: "closest_mob",
          description: "Shoots a crackling bolt of force at the closest enemy."
        }
      ]
    }
  },
  {
    _id: "dccitm0000000011",
    name: "Wand of Lightning",
    type: "loot",
    img: "icons/weapons/wands/wand-gem-blue.webp",
    system: {
      quantity: 1,
      value: 95,
      cooldown: "None",
      lootType: "wand",
      charges: { value: 3, max: 3 },
      spellName: "Lightning Bolt",
      notes: "Wand with 3 charges. Casts Lightning Bolt for 0 mana.",
      description: "A silver conductor wand tipped with a crackling sapphire. Casts powerful Lightning Bolt spells at zero mana cost."
    }
  },
  {
    _id: "dccitm0000000002",
    name: "Scratch-off Ticket - Fireball or Custard",
    type: "loot",
    img: "icons/sundries/gaming/playing-cards-purple.webp",
    system: {
      quantity: 6,
      value: 5,
      cooldown: "Once per scene",
      lootType: "scratch_ticket",
      notes: "Scratch to win! 50% Level 5 Fireball vs 50% Healing Custard (5 Health Bars) at closest mob. Limit 1 use per scene.",
      description: "An official World Dungeon lottery scratch-off ticket sponsored by the Borant Corporation. Scratching off the silver coating immediately unleashes chaotic dungeon magic at the nearest enemy. 50% chance of a devastating Rank 5 Fireball, or 50% chance of accidentally healing them with a warm blob of vanilla custard (5 Health Bars)!",
      outcomes: [
        {
          name: "Level 5 Fireball",
          weight: 50,
          type: "spell",
          spellRank: 5,
          damage: "2d12 + Int",
          damageType: "Fire",
          targetType: "closest_mob",
          debuff: "Burned",
          description: "A beach ball-sized sphere of roaring flame meanders toward the closest mob. Attack made with Disadvantage. 10ft blast radius. Targets losing 1+ Health Bar gain the Burned Debuff."
        },
        {
          name: "Healing Blob of Custard",
          weight: 50,
          type: "heal",
          healBars: 5,
          targetType: "closest_mob",
          description: "*SPLAT!* A warm, comforting glob of restorative vanilla custard strikes the closest mob, healing 5 full Health Bar slots. The Dungeon AI is thoroughly entertained."
        }
      ]
    }
  }
];
