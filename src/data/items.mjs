/**
 * Dungeon Crawler Carl RPG - Official Items & Loot Dataset
 * Includes canonical consumables, lottery scratch-off tickets, and adventuring supplies.
 */

export const DCC_ITEMS = [
  {
    _id: "dccitm0000000001",
    name: "Normal Mana Potion",
    type: "loot",
    img: "icons/svg/potion.svg",
    system: {
      quantity: 1,
      cooldown: "None",
      lootType: "consumable",
      notes: "Refills mana completely to maximum.",
      description: "A crystalline blue flask filled with shimmering liquid mana. Consuming this item mid-battle immediately restores your mana reserves to full.",
      outcomes: []
    }
  },
  {
    _id: "dccitm0000000002",
    name: "Scratch-off Ticket - Fireball or Custard",
    type: "loot",
    img: "icons/sundries/gaming/playing-cards-purple.webp",
    system: {
      quantity: 6,
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
