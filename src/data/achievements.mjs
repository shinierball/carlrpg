/**
 * Dungeon Crawler Carl RPG — Canonical Achievements & Tier Definitions
 * Official and canonical Dungeon AI achievements earned by Crawlers over time.
 */

export const DCC_ACHIEVEMENT_TIERS = {
  bronze: {
    id: 'bronze',
    label: 'Bronze',
    color: '#cd7f32',
    bgColor: 'rgba(205, 127, 50, 0.15)',
    borderColor: '#cd7f32',
    icon: 'fa-solid fa-medal'
  },
  silver: {
    id: 'silver',
    label: 'Silver',
    color: '#bdc3c7',
    bgColor: 'rgba(189, 195, 199, 0.15)',
    borderColor: '#bdc3c7',
    icon: 'fa-solid fa-shield'
  },
  gold: {
    id: 'gold',
    label: 'Gold',
    color: '#f1c40f',
    bgColor: 'rgba(241, 196, 15, 0.15)',
    borderColor: '#f1c40f',
    icon: 'fa-solid fa-trophy'
  },
  platinum: {
    id: 'platinum',
    label: 'Platinum',
    color: '#00d2d3',
    bgColor: 'rgba(0, 210, 211, 0.15)',
    borderColor: '#00d2d3',
    icon: 'fa-solid fa-gem'
  },
  legendary: {
    id: 'legendary',
    label: 'Legendary',
    color: '#e67e22',
    bgColor: 'rgba(230, 126, 34, 0.15)',
    borderColor: '#e67e22',
    icon: 'fa-solid fa-dragon'
  },
  celestial: {
    id: 'celestial',
    label: 'Celestial',
    color: '#9b59b6',
    bgColor: 'rgba(155, 89, 182, 0.15)',
    borderColor: '#9b59b6',
    icon: 'fa-solid fa-crown'
  },
  quest: {
    id: 'quest',
    label: 'Quest',
    color: '#3498db',
    bgColor: 'rgba(52, 152, 219, 0.15)',
    borderColor: '#3498db',
    icon: 'fa-solid fa-map'
  },
  secret: {
    id: 'secret',
    label: 'Secret',
    color: '#1abc9c',
    bgColor: 'rgba(26, 188, 156, 0.15)',
    borderColor: '#1abc9c',
    icon: 'fa-solid fa-mask'
  },
  special: {
    id: 'special',
    label: 'Special',
    color: '#e74c3c',
    bgColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: '#e74c3c',
    icon: 'fa-solid fa-award'
  }
};

export const DCC_ACHIEVEMENTS = [
  {
    id: 'ach-peepers',
    name: "Where’d Ya Get Those Peepers?",
    type: 'achievement',
    img: 'icons/svg/eye.svg',
    system: {
      tier: 'bronze',
      category: 'Quest',
      floor: '1st Floor',
      quote: "You’ve made it so a Bugaboo Socket-Picker can only wink from now on. How will anyone know if he’s serious or not?",
      reward: "Bronze Apparel Box",
      rewardContents: "An eyepatch, glasses, contact lenses, or another eye-themed apparel item.",
      favor: 1,
      xp: 100,
      unlocked: true,
      description: "Maim a Bugaboo Socket-Picker's optical surveillance gear during the Passive (Aggressive) Perception quest."
    }
  },
  {
    id: 'ach-ding-dong',
    name: "Ding-Dong Ditch",
    type: 'achievement',
    img: 'icons/svg/hazard.svg',
    system: {
      tier: 'silver',
      category: 'Quest',
      floor: '1st Floor',
      quote: "You’ve stood up to Big Brother and maimed one of his many surveillance devices. Resistance is adorable!",
      reward: "Silver Anarchist Box",
      rewardContents: "A stylish hat (Head) with a random benefit.",
      favor: 2,
      xp: 250,
      unlocked: true,
      description: "Destroy an active Screye Camera or surveillance station."
    }
  },
  {
    id: 'ach-shoot-eye-out',
    name: "You’ll Shoot Your Eye Out!",
    type: 'achievement',
    img: 'icons/svg/target.svg',
    system: {
      tier: 'silver',
      category: 'Quest',
      floor: '1st Floor',
      quote: "You’ve put a stop to Stiggy’s reign of technological terror. Now the only people watching you are countless quadrillions of people enjoying your plight from the comfort of their own homes.",
      reward: "Silver Quest Box",
      rewardContents: "An official Enchanted Crimson Crawler crossbow with one random benefit.",
      favor: 2,
      xp: 500,
      unlocked: true,
      description: "Neutralize Stiggy and disable the floor surveillance hub."
    }
  },
  {
    id: 'ach-mvp',
    name: "Floor Combat MVP",
    type: 'achievement',
    img: 'icons/svg/combat.svg',
    system: {
      tier: 'gold',
      category: 'Combat',
      floor: 'Current Floor',
      quote: "Highest total damage output in the encounter. You carried the party on your sweaty shoulders.",
      reward: "Combat MVP Recognition & +3 AI Favor",
      rewardContents: "Party adulation and guaranteed sponsor interest.",
      favor: 3,
      xp: 300,
      unlocked: true,
      description: "Achieve the highest total damage output in an encounter."
    }
  },
  {
    id: 'ach-first-blood',
    name: "First Blood of the Desolation",
    type: 'achievement',
    img: 'icons/svg/sword.svg',
    system: {
      tier: 'bronze',
      category: 'Combat',
      floor: '1st Floor',
      quote: "You took down your first real dungeon abomination. Don't get cocky; that was just the appetizer.",
      reward: "Bronze Loot Box & +1 AI Favor",
      rewardContents: "Basic crawler starter kit or consumable potion.",
      favor: 1,
      xp: 150,
      unlocked: true,
      description: "Defeat your first dungeon monster."
    }
  },
  {
    id: 'ach-boss-annihilator',
    name: "Boss Annihilator",
    type: 'achievement',
    img: 'icons/svg/skull.svg',
    system: {
      tier: 'celestial',
      category: 'Combat',
      floor: 'Current Floor',
      quote: "Floor-shaking performance. You earned this, crawler. Now try not to blow yourself up with it.",
      reward: "1x Celestial Boss Loot Box",
      rewardContents: "A high-tier enchanted weapon, boss relic, or unique class catalyst.",
      favor: 5,
      xp: 1000,
      unlocked: true,
      description: "Deliver the killing blow to an official Dungeon Floor Boss."
    }
  },
  {
    id: 'ach-fashion-disaster',
    name: "Fashion Disaster Survivor",
    type: 'achievement',
    img: 'icons/svg/mystery-man.svg',
    system: {
      tier: 'bronze',
      category: 'Special',
      floor: '1st Floor',
      quote: "You entered combat wearing mismatched armor, no pants, and a towel. The viewing audience is thoroughly appalled yet strangely captivated.",
      reward: "Bronze Apparel Box",
      rewardContents: "A pair of heart-patterned boxers or an absurd novelty cape.",
      favor: 1,
      xp: 50,
      unlocked: true,
      description: "Engage in combat while missing one or more major clothing slots."
    }
  },
  {
    id: 'ach-improvised-demo',
    name: "Improvised Demolitions Expert",
    type: 'achievement',
    img: 'icons/svg/explosion.svg',
    system: {
      tier: 'platinum',
      category: 'Special',
      floor: 'Current Floor',
      quote: "You solved a tactical dilemma by detonating something you definitely weren't supposed to touch. We respect the hustle.",
      reward: "Platinum Loot Box & +3 AI Favor",
      rewardContents: "Experimental explosive munitions or high-tier alchemical reagents.",
      favor: 3,
      xp: 400,
      unlocked: true,
      description: "Kill two or more enemies simultaneously using environmental hazards or improvised explosives."
    }
  },
  {
    id: 'ach-sponsor-darling',
    name: "Sponsor's Little Darling",
    type: 'achievement',
    img: 'icons/svg/angel.svg',
    system: {
      tier: 'gold',
      category: 'Social',
      floor: 'Current Floor',
      quote: "A corporate sponsor noticed you! They still expect you to die terribly, but they gave you something shiny anyway.",
      reward: "Gold Sponsor Gift Box & +2 AI Favor",
      rewardContents: "A corporate sponsor branded item or potent consumable crate.",
      favor: 2,
      xp: 300,
      unlocked: true,
      description: "Sign your first corporate sponsorship contract or receive a direct sponsor crate."
    }
  },
  {
    id: 'ach-goblin-defenestration',
    name: "Goblin Defenestration Specialist",
    type: 'achievement',
    img: 'icons/svg/falling.svg',
    system: {
      tier: 'silver',
      category: 'Combat',
      floor: 'Current Floor',
      quote: "There is no tactical problem in this dungeon that cannot be solved by throwing a goblin through a window, off a parapet, or into a meat grinder.",
      reward: "Silver Brawler Box",
      rewardContents: "Reinforced spiked gauntlets or a ring of brute momentum.",
      favor: 2,
      xp: 200,
      unlocked: true,
      description: "Defeat an enemy by throwing them off a precipice, into a hazard, or through a window."
    }
  }
];
