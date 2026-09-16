/**
 * Dungeon Crawler Carl RPG - Crawler Character Creation Dataset & Logic
 * Contains background matrices for Humans and Animals, standard stat array,
 * species rules, duplicate skill rank resolution, and crawler generation logic.
 */

export const DCC_STANDARD_ARRAY = [2, 3, 4, 5, 6];

export const DCC_SPECIES_DATA = {
  human: {
    id: 'human',
    label: 'Human',
    aiFavor: 1,
    inherentSkill: {
      name: 'Unarmed Combat',
      rank: 3,
      stat: 'str',
      source: 'Species Inherent'
    },
    tierLabels: {
      tier1: 'Childhood',
      tier2: 'Adolescence',
      tier3: 'Career / Profession',
      tier4: 'Hobby'
    },
    tierRanks: {
      tier1: 1,
      tier2: 1,
      tier3: 3,
      tier4: 2
    }
  },
  animal: {
    id: 'animal',
    label: 'Animal',
    aiFavor: 0,
    inherentSkill: {
      name: 'Slice Attack',
      rank: 3,
      stat: 'dex',
      source: 'Species Inherent'
    },
    tierLabels: {
      tier1: 'Youth',
      tier2: 'Training',
      tier3: 'Adult',
      tier4: 'Quirk'
    },
    tierRanks: {
      tier1: 1,
      tier2: 1,
      tier3: 3,
      tier4: 2
    }
  }
};

export const DCC_BACKGROUND_MATRICES = {
  human: {
    tier1: [
      {
        name: 'Latchkey Kid',
        skills: [
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Perception', stat: 'int' },
          { name: 'Stealth', stat: 'dex' }
        ]
      },
      {
        name: 'Crafty Kid',
        skills: [
          { name: 'Fabricate', stat: 'int' },
          { name: 'Repair', stat: 'int' },
          { name: 'Salvage', stat: 'int' }
        ]
      },
      {
        name: 'Excitable Kid',
        skills: [
          { name: 'Escape Artist', stat: 'dex' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Running', stat: 'dex' }
        ]
      },
      {
        name: 'Gymnast',
        skills: [
          { name: 'Endurance', stat: 'con' },
          { name: 'Jumping', stat: 'str' },
          { name: 'Performance', stat: 'cha' }
        ]
      },
      {
        name: 'Military Brat',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Tactics', stat: 'int' }
        ]
      },
      {
        name: 'MMO Kid',
        skills: [
          { name: 'Fabricate', stat: 'int' },
          { name: 'Engineering', stat: 'int' },
          { name: 'Tactics', stat: 'int' }
        ]
      },
      {
        name: 'Only Child',
        skills: [
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Investigation', stat: 'int' },
          { name: 'Negotiation', stat: 'cha' }
        ]
      },
      {
        name: 'Outdoor Kid',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Climbing', stat: 'str' },
          { name: 'Swimming', stat: 'str' }
        ]
      },
      {
        name: 'Problem Child',
        skills: [
          { name: 'Intimidate', stat: 'str' },
          { name: 'Deception', stat: 'cha' },
          { name: 'Pugilism', stat: 'dex' }
        ]
      },
      {
        name: 'Scamp',
        skills: [
          { name: 'Hide in Shadows', stat: 'dex' },
          { name: 'Jumping', stat: 'str' },
          { name: 'Throwing', stat: 'str' }
        ]
      },
      {
        name: 'Teacher’s Pet',
        skills: [
          { name: 'Catcher', stat: 'none' },
          { name: 'Perception', stat: 'int' },
          { name: 'Good First Impression', stat: 'cha' }
        ]
      },
      {
        name: 'Wild Child',
        skills: [
          { name: 'Stealth', stat: 'dex' },
          { name: 'Survival', stat: 'con' },
          { name: 'Running', stat: 'dex' }
        ]
      }
    ],
    tier2: [
      {
        name: 'Family Farm',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Fabricate', stat: 'int' },
          { name: 'Tracking', stat: 'int' }
        ]
      },
      {
        name: 'Drama Nerd',
        skills: [
          { name: 'Fabricate', stat: 'int' },
          { name: 'Deception', stat: 'cha' },
          { name: 'Performance', stat: 'cha' }
        ]
      },
      {
        name: 'Drop-Out',
        skills: [
          { name: 'Chopper Pilot', stat: 'dex' },
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Survival', stat: 'con' }
        ]
      },
      {
        name: 'Greek Life',
        skills: [
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Intimidate', stat: 'str' },
          { name: 'Taunt', stat: 'cha' }
        ]
      },
      {
        name: 'Influencer',
        skills: [
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Performance', stat: 'cha' }
        ]
      },
      {
        name: 'Jock',
        skills: [
          { name: 'Endurance', stat: 'con' },
          { name: 'Jumping', stat: 'str' },
          { name: 'Throwing', stat: 'str' }
        ]
      },
      {
        name: 'McJob',
        skills: [
          { name: 'Determine Value', stat: 'none' },
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Repair', stat: 'int' }
        ]
      },
      {
        name: 'Popular',
        skills: [
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Perception', stat: 'int' },
          { name: 'Persuasion', stat: 'cha' }
        ]
      },
      {
        name: 'Religious',
        skills: [
          { name: 'Catcher', stat: 'none' },
          { name: 'First Aid', stat: 'int' },
          { name: 'Persuasion', stat: 'cha' }
        ]
      },
      {
        name: 'Student Government',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Investigation', stat: 'int' }
        ]
      },
      {
        name: 'Nerd',
        skills: [
          { name: 'Investigation', stat: 'int' },
          { name: 'Repair', stat: 'int' },
          { name: 'Fabricate', stat: 'int' }
        ]
      },
      {
        name: 'Weirdo',
        skills: [
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Intimidate', stat: 'str' },
          { name: 'Fabricate', stat: 'int' }
        ]
      }
    ],
    tier3: [
      {
        name: 'Criminal',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Stealth', stat: 'dex' },
          { name: 'Streetwise', stat: 'cha' }
        ]
      },
      {
        name: 'Service Industry',
        skills: [
          { name: 'Dagger', stat: 'dex' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Sleight of Hand', stat: 'dex' }
        ]
      },
      {
        name: 'Small Business Owner',
        skills: [
          { name: 'Determine Value', stat: 'none' },
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Perception', stat: 'int' }
        ]
      },
      {
        name: 'Medical',
        skills: [
          { name: 'Sleight of Hand', stat: 'dex' },
          { name: 'Detect Lies', stat: 'int' },
          { name: 'First Aid', stat: 'int' }
        ]
      },
      {
        name: 'Law Enforcement',
        skills: [
          { name: 'Detect Lies', stat: 'int' },
          { name: 'Handgun', stat: 'dex' },
          { name: 'Investigation', stat: 'int' }
        ]
      },
      {
        name: 'Gig Worker',
        skills: [
          { name: 'Driving', stat: 'dex' },
          { name: 'Escape Artist', stat: 'str' },
          { name: 'Negotiation', stat: 'cha' }
        ]
      },
      {
        name: 'Teacher',
        skills: [
          { name: 'Detect Lies', stat: 'int' },
          { name: 'Perception', stat: 'int' },
          { name: 'Performance', stat: 'int' }
        ]
      },
      {
        name: 'Office Drone',
        skills: [
          { name: 'Dumpster Diving', stat: 'int' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Investigation', stat: 'int' }
        ]
      },
      {
        name: 'Entertainer',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Performance', stat: 'cha' }
        ]
      },
      {
        name: 'Unhoused',
        skills: [
          { name: 'Dumpster Diving', stat: 'int' },
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Survival', stat: 'con' }
        ]
      },
      {
        name: 'Middle Manager',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Intimidate', stat: 'str' },
          { name: 'Negotiation', stat: 'cha' }
        ]
      },
      {
        name: 'Military',
        skills: [
          { name: 'Handgun', stat: 'dex' },
          { name: 'Survival', stat: 'con' },
          { name: 'Tactics', stat: 'int' }
        ]
      }
    ],
    tier4: [
      {
        name: 'Collector',
        skills: [
          { name: 'Fabricate', stat: 'int' },
          { name: 'Determine Value', stat: 'none' },
          { name: 'Investigation', stat: 'int' }
        ]
      },
      {
        name: 'Cosplay',
        skills: [
          { name: 'Fabricate', stat: 'int' },
          { name: 'Performance', stat: 'cha' },
          { name: 'Salvage', stat: 'int' }
        ]
      },
      {
        name: 'Drinker',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Intimidate', stat: 'str' },
          { name: 'Streetwise', stat: 'cha' }
        ]
      },
      {
        name: 'Gamer',
        skills: [
          { name: 'Aiming', stat: 'dex' },
          { name: 'Perception', stat: 'int' },
          { name: 'Tactics', stat: 'int' }
        ]
      },
      {
        name: 'Gym Rat',
        skills: [
          { name: 'Running', stat: 'dex' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Swimming', stat: 'str' }
        ]
      },
      {
        name: 'Hunting',
        skills: [
          { name: 'Tracking', stat: 'int' },
          { name: 'Shotgun', stat: 'dex' },
          { name: 'Stealth', stat: 'dex' }
        ]
      },
      {
        name: 'Music',
        skills: [
          { name: 'Perception', stat: 'int' },
          { name: 'Performance', stat: 'cha' },
          { name: 'Sleight of Hand', stat: 'dex' }
        ]
      },
      {
        name: 'Motorsports',
        skills: [
          { name: 'Driving', stat: 'dex' },
          { name: 'Repair', stat: 'int' },
          { name: 'Salvage', stat: 'int' }
        ]
      },
      {
        name: 'Climber',
        skills: [
          { name: 'Climbing', stat: 'str' },
          { name: 'Jumping', stat: 'str' },
          { name: 'Endurance', stat: 'con' }
        ]
      },
      {
        name: 'Pop Culture',
        skills: [
          { name: 'Determine Value', stat: 'none' },
          { name: 'Investigation', stat: 'int' },
          { name: 'Perception', stat: 'int' }
        ]
      },
      {
        name: 'Tinkering',
        skills: [
          { name: 'Engineering', stat: 'int' },
          { name: 'Repair', stat: 'int' },
          { name: 'Salvage', stat: 'int' }
        ]
      },
      {
        name: 'Travel',
        skills: [
          { name: 'Endurance', stat: 'con' },
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Streetwise', stat: 'cha' }
        ]
      }
    ]
  },
  animal: {
    tier1: [
      {
        name: 'Abandoned',
        skills: [
          { name: 'Hide in Shadows', stat: 'dex' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Survival', stat: 'con' }
        ]
      },
      {
        name: 'Farmed',
        skills: [
          { name: 'Escape Artist', stat: 'dex' },
          { name: 'Climbing', stat: 'str' },
          { name: 'Light on Your Feet', stat: 'dex' }
        ]
      },
      {
        name: 'Litter-Raised',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Detect Lies', stat: 'int' },
          { name: 'Back Claw', stat: 'str' }
        ]
      },
      {
        name: 'Pampered',
        skills: [
          { name: 'Negotiation', stat: 'cha' },
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' }
        ]
      },
      {
        name: 'Runt',
        skills: [
          { name: 'Hide in Shadows', stat: 'dex' },
          { name: 'Escape Artist', stat: 'dex' },
          { name: 'Stealth', stat: 'dex' }
        ]
      },
      {
        name: 'Stray',
        skills: [
          { name: 'Back Claw', stat: 'str' },
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Survival', stat: 'con' }
        ]
      }
    ],
    tier2: [
      {
        name: 'Clever',
        skills: [
          { name: 'Investigation', stat: 'int' },
          { name: 'Detect Lies', stat: 'int' },
          { name: 'Dodge', stat: 'none' }
        ]
      },
      {
        name: 'Free Range',
        skills: [
          { name: 'Escape Artist', stat: 'dex' },
          { name: 'Survival', stat: 'con' },
          { name: 'Tracking', stat: 'int' }
        ]
      },
      {
        name: 'Pack Mentality',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Tactics', stat: 'int' }
        ]
      },
      {
        name: 'Mischievous',
        skills: [
          { name: 'Deception', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Sleight of Hand', stat: 'dex' }
        ]
      },
      {
        name: 'Watcher',
        skills: [
          { name: 'Ambush', stat: 'int' },
          { name: 'Investigation', stat: 'int' },
          { name: 'Perception', stat: 'int' }
        ]
      },
      {
        name: 'Well-Trained',
        skills: [
          { name: 'Light on Your Feet', stat: 'dex' },
          { name: 'Catcher', stat: 'none' },
          { name: 'Performance', stat: 'cha' }
        ]
      }
    ],
    tier3: [
      {
        name: 'Guard',
        skills: [
          { name: 'Catcher', stat: 'none' },
          { name: 'Perception', stat: 'int' },
          { name: 'Taunt', stat: 'cha' }
        ]
      },
      {
        name: 'Pile of Floof',
        skills: [
          { name: 'Escape Artist', stat: 'dex' },
          { name: 'Deception', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' }
        ]
      },
      {
        name: 'Scrapper',
        skills: [
          { name: 'Light on Your Feet', stat: 'dex' },
          { name: 'Streetwise', stat: 'cha' },
          { name: 'Survival', stat: 'con' }
        ]
      },
      {
        name: 'Show Animal',
        skills: [
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Light on Your Feet', stat: 'dex' },
          { name: 'Performance', stat: 'cha' }
        ]
      },
      {
        name: 'Support Animal',
        skills: [
          { name: 'Determine Value', stat: 'none' },
          { name: 'First Aid', stat: 'int' },
          { name: 'Perception', stat: 'int' }
        ]
      },
      {
        name: 'Working',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Endurance', stat: 'con' },
          { name: 'Perception', stat: 'int' }
        ]
      }
    ],
    tier4: [
      {
        name: 'Chow Hound',
        skills: [
          { name: 'Dumpster Diving', stat: 'int' },
          { name: 'Investigation', stat: 'int' },
          { name: 'Intimidate', stat: 'str' }
        ]
      },
      {
        name: 'Cuddly',
        skills: [
          { name: 'Good First Impression', stat: 'cha' },
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Negotiation', stat: 'cha' }
        ]
      },
      {
        name: 'Curious',
        skills: [
          { name: 'Climbing', stat: 'str' },
          { name: 'Perception', stat: 'int' },
          { name: 'Swimming', stat: 'str' }
        ]
      },
      {
        name: 'Hunter',
        skills: [
          { name: 'Hide in Shadows', stat: 'dex' },
          { name: 'Stealth', stat: 'dex' },
          { name: 'Tracking', stat: 'int' }
        ]
      },
      {
        name: 'Playful',
        skills: [
          { name: 'Persuasion', stat: 'cha' },
          { name: 'Dodge', stat: 'none' },
          { name: 'Intimidate', stat: 'str' }
        ]
      },
      {
        name: 'Social',
        skills: [
          { name: 'Animal Handling', stat: 'cha' },
          { name: 'Taunt', stat: 'cha' },
          { name: 'Perception', stat: 'int' }
        ]
      }
    ]
  }
};

/**
 * Validate standard array assignment.
 * Checks that values are a strict permutation of [2, 3, 4, 5, 6].
 * @param {Record<string, number>} assignments - e.g. { str: 5, dex: 4, con: 6, int: 2, cha: 3 }
 * @returns {{ valid: boolean, error?: string, remaining: number[] }}
 */
export function validateStatArray(assignments = {}) {
  const stats = ['str', 'dex', 'con', 'int', 'cha'];
  const values = stats.map(s => Number(assignments[s])).filter(n => Number.isInteger(n) && n > 0);
  const sortedValues = [...values].sort((a, b) => a - b);
  const expected = [...DCC_STANDARD_ARRAY].sort((a, b) => a - b);

  const remaining = DCC_STANDARD_ARRAY.filter(num => !values.includes(num));

  if (values.length < 5) {
    return {
      valid: false,
      error: `All 5 stats must be assigned. Remaining: [${remaining.join(', ')}]`,
      remaining
    };
  }

  const matches = expected.every((val, i) => val === sortedValues[i]);
  if (!matches) {
    return {
      valid: false,
      error: `Stats must use each number in [${DCC_STANDARD_ARRAY.join(', ')}] exactly once without duplicates.`,
      remaining
    };
  }

  return { valid: true, remaining: [] };
}

/**
 * Resolve skill ranks and detect duplicate selections across tiers.
 * Rule: Skills chosen more than once are non-additive; they take the highest rank selected.
 * 
 * @param {string} species - 'human' | 'animal'
 * @param {object} tierSelections - {
 *   tier1: { background: string, skills: string[] },
 *   tier2: { background: string, skills: string[] },
 *   tier3: { background: string, skills: string[] },
 *   tier4: { background: string, skills: string[] }
 * }
 * @returns {{
 *   skills: Array<{ name: string, rank: number, stat: string, sources: Array<{ tier: string, rank: number }> }>,
 *   duplicates: Array<{ name: string, sources: Array<{ tier: string, rank: number }>, appliedRank: number }>,
 *   warnings: string[]
 * }}
 */
export function resolveSkillRanks(species = 'human', tierSelections = {}) {
  const spec = DCC_SPECIES_DATA[species] || DCC_SPECIES_DATA.human;
  const matrix = DCC_BACKGROUND_MATRICES[species] || DCC_BACKGROUND_MATRICES.human;

  const skillRegistry = new Map();

  // 1. Inherent Species Skill
  if (spec.inherentSkill) {
    const inh = spec.inherentSkill;
    skillRegistry.set(inh.name.toLowerCase().trim(), {
      name: inh.name,
      stat: inh.stat,
      ranks: [inh.rank],
      sources: [{ tier: 'Species Inherent', rank: inh.rank }]
    });
  }

  // Helper to find stat from matrix
  function findStat(skillName, tierKey) {
    const list = matrix[tierKey] || [];
    for (const bg of list) {
      const match = bg.skills.find(s => s.name.toLowerCase().trim() === skillName.toLowerCase().trim());
      if (match) return match.stat;
    }
    return 'str';
  }

  // 2. Process tiers 1 to 4
  for (let i = 1; i <= 4; i++) {
    const tierKey = `tier${i}`;
    const rank = spec.tierRanks[tierKey];
    const tierLabel = spec.tierLabels[tierKey];
    const sel = tierSelections[tierKey];
    if (!sel || !Array.isArray(sel.skills)) continue;

    for (const sName of sel.skills) {
      if (!sName) continue;
      const key = sName.toLowerCase().trim();
      const stat = findStat(sName, tierKey);

      if (!skillRegistry.has(key)) {
        skillRegistry.set(key, {
          name: sName,
          stat,
          ranks: [rank],
          sources: [{ tier: `${tierLabel} (${sel.background || 'Background'})`, rank }]
        });
      } else {
        const entry = skillRegistry.get(key);
        entry.ranks.push(rank);
        entry.sources.push({ tier: `${tierLabel} (${sel.background || 'Background'})`, rank });
      }
    }
  }

  const resolvedSkills = [];
  const duplicates = [];
  const warnings = [];

  for (const entry of skillRegistry.values()) {
    const maxRank = Math.max(...entry.ranks);
    resolvedSkills.push({
      name: entry.name,
      rank: maxRank,
      stat: entry.stat,
      sources: entry.sources
    });

    if (entry.ranks.length > 1) {
      duplicates.push({
        name: entry.name,
        sources: entry.sources,
        appliedRank: maxRank
      });
      const sourceDesc = entry.sources.map(s => `${s.tier} [Rank ${s.rank}]`).join(' and ');
      warnings.push(`Duplicate skill selected: "${entry.name}" appeared in ${sourceDesc}. Ranks do not stack; applied at highest selected Rank ${maxRank}.`);
    }
  }

  return {
    skills: resolvedSkills,
    duplicates,
    warnings
  };
}

export const DCC_STARTER_WEAPONS = [
  'Axe',
  'Bow',
  'Club',
  'Crossbow',
  'Dagger',
  'Handgun',
  'Herding Weapons',
  'Improvised Weapons',
  'Javelin',
  'Lance',
  'Longsword',
  'Polearm',
  'Quarterstaff',
  'Rapier',
  'Shotgun',
  'Shuriken',
  'Slingshot',
  'Warhammer'
];

export const DCC_STARTER_SPELLS = [
  'Dirt Clod',
  'Fire Fingers',
  'Frost Scar',
  'Mind Tickle',
  'Shock Treatment',
  'Soul Collector',
  'Vine Porn'
];

export const DCC_STARTER_UNARMED_PACKAGES = [
  {
    key: 'pugilism',
    name: 'Pugilism',
    skill: 'Pugilism',
    effect: 'Iron Punch',
    label: 'Pugilism with Iron Punch Damage Effect (+1d2 base dmg)'
  },
  {
    key: 'foot_soldier',
    name: 'Foot Soldier',
    skill: 'Foot Soldier',
    effect: 'Smush',
    label: 'Foot Soldier with Smush Damage Effect (×2 dmg on ≤20% HP)'
  },
  {
    key: 'noggin_nocker',
    name: 'Noggin Nocker',
    skill: 'Noggin Nocker',
    effect: 'Skullcracker',
    label: 'Noggin Nocker with Skullcracker Damage Effect (+1d4 base dmg vs same size)'
  },
  {
    key: 'wrasslin',
    name: 'Wrasslin',
    skill: 'Wrasslin',
    effect: 'Toss',
    label: 'Wrasslin with Toss Damage Effect (+1d8 base dmg + throw)'
  }
];

/**
 * Generate a randomized legal crawler setup.
 * @param {string} [chosenSpecies] - Optional forced species ('human' | 'animal')
 * @param {string} [floor] - Optional starting floor ('1st Floor', etc.)
 * @returns {object} Full valid creation state
 */
export function generateRandomCrawler(chosenSpecies = null, floor = '1st Floor') {
  const species = chosenSpecies || (Math.random() < 0.7 ? 'human' : 'animal');
  const spec = DCC_SPECIES_DATA[species];
  const matrix = DCC_BACKGROUND_MATRICES[species];

  // Randomize stats using permutations of [2, 3, 4, 5, 6]
  const shuffledNumbers = [...DCC_STANDARD_ARRAY].sort(() => Math.random() - 0.5);
  const stats = {
    str: shuffledNumbers[0],
    dex: shuffledNumbers[1],
    con: shuffledNumbers[2],
    int: shuffledNumbers[3],
    cha: shuffledNumbers[4]
  };

  const tierSelections = {};
  for (let i = 1; i <= 4; i++) {
    const tierKey = `tier${i}`;
    const backgrounds = matrix[tierKey];
    const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    
    // Pick 2 distinct skills out of 3
    const bgSkills = [...bg.skills];
    const pickedSkills = [];
    const firstIdx = Math.floor(Math.random() * bgSkills.length);
    pickedSkills.push(bgSkills[firstIdx].name);
    bgSkills.splice(firstIdx, 1);
    const secondIdx = Math.floor(Math.random() * bgSkills.length);
    pickedSkills.push(bgSkills[secondIdx].name);

    tierSelections[tierKey] = {
      background: bg.name,
      skills: pickedSkills
    };
  }

  const resolved = resolveSkillRanks(species, tierSelections);

  // Randomize Level 1 starter loadout
  const starterModes = ['weapon', 'spell', 'unarmed'];
  const starterMode = starterModes[Math.floor(Math.random() * starterModes.length)];
  const starterWeapon = DCC_STARTER_WEAPONS[Math.floor(Math.random() * DCC_STARTER_WEAPONS.length)];
  const starterSpell = DCC_STARTER_SPELLS[Math.floor(Math.random() * DCC_STARTER_SPELLS.length)];
  const starterUnarmedPkg = DCC_STARTER_UNARMED_PACKAGES[Math.floor(Math.random() * DCC_STARTER_UNARMED_PACKAGES.length)];

  const randomNames = species === 'human' ? [
    'Carl the Unbroken', 'Katya Vane', 'Preacher Paul', 'Zack Maverick',
    'Tara Ironheart', 'Hollis Vance', 'Samantha Spark', 'Devon Cruz'
  ] : [
    'Princess Donut III', 'Mongo the Destroyer', 'Sir Paws-a-Lot',
    'Barnaby Fuzz', 'Shadow Fang', 'Grizz the Tank', 'Whiskers of Fury'
  ];

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const size = species === 'animal'
    ? ['Tiny', 'Small', 'Petite', 'Medium', 'Large'][Math.floor(Math.random() * 5)]
    : 'Medium';

  return {
    name,
    crawlerNumber: `#${randomNum}`,
    species,
    size,
    aiFavor: spec.aiFavor,
    floor,
    level: parseInt(floor, 10) || 1,
    stats,
    tierSelections,
    starterMode,
    starterWeapon,
    starterSpell,
    starterUnarmed: starterUnarmedPkg.key,
    skills: resolved.skills,
    duplicates: resolved.duplicates,
    warnings: resolved.warnings
  };
}
