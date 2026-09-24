import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_MOBS } from '../src/data/mobs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Spell definitions to assign to specific mobs
const SPELLCASTER_CONFIGS = {
  'Dread Wizard Grimblegore': {
    mana: 60,
    spells: [
      {
        name: 'Fireball',
        rank: 2,
        stat: 'int',
        manaCost: 20,
        range: '80 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '2d12',
        effects: '80ft range, 20ft Blast radius +20ft Splash. Rolled with Disadvantage: Difficulty to Evade reduced by 5, crawlers get free Evade Check.'
      },
      {
        name: 'Gloat',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: '50 feet',
        duration: '1 round',
        spellType: 'Attack',
        damageType: 'Sonic',
        baseDamage: '2d6',
        effects: '50ft range, 10ft Blast radius. On an Evade Major Fail or worse, the crawler gains the Muted Debuff.'
      },
      {
        name: 'Mini Fireball',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d8',
        effects: '60ft range. On Evade Major Fail or worse, target catches fire.'
      }
    ],
    additionalAttacks: [
      {
        name: 'Staff Strike',
        toHitStat: 'str',
        toHitRank: 0,
        damageDice: '1d8',
        damageStat: 'str',
        damageType: 'Bludgeoning',
        effects: '5ft range melee strike.'
      }
    ]
  },
  'Rat Shaman': {
    mana: 30,
    spells: [
      {
        name: 'Clap Cloud',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '30 feet',
        duration: '1 round',
        spellType: 'Attack',
        damageType: 'Sonic',
        baseDamage: '1d8',
        effects: '30ft range. On Evade Major Fail or worse, crawler has Disadvantage on their next Action.'
      },
      {
        name: 'Firestrike',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d10',
        effects: '60ft range, 5ft Blast radius.'
      },
      {
        name: 'Mini Fireball',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d8',
        effects: '60ft range. On Evade Major Fail or worse, target gains Burning Debuff.'
      }
    ],
    additionalAttacks: [
      {
        name: 'Staff Whack',
        toHitStat: 'str',
        toHitRank: 0,
        damageDice: '1d4',
        damageStat: 'str',
        damageType: 'Bludgeoning',
        effects: '5ft range melee strike.'
      }
    ]
  },
  'Rat Hooligan': {
    mana: 20,
    spells: [
      {
        name: 'Firebolt',
        rank: 1,
        stat: 'int',
        manaCost: 6,
        range: '40 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '1d6',
        effects: '40ft range bolt of magical fire.'
      },
      {
        name: 'Heal Others',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: 'Touch',
        duration: 'Instantaneous',
        spellType: 'Healing',
        damageType: '',
        baseDamage: '',
        effects: 'Restores up to 2 health bars to an adjacent rat or ally.'
      }
    ],
    additionalAttacks: []
  },
  'Goblin Shamanka': {
    mana: 30,
    spells: [
      {
        name: 'Agony Missile',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Force',
        baseDamage: '1d8',
        effects: '60ft range. On Evade Major Fail or worse, target takes an extra 1d6 Force damage.'
      },
      {
        name: 'Hex of Weakness',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: '40 feet',
        duration: '3 rounds',
        spellType: 'Utility',
        damageType: '',
        baseDamage: '',
        effects: '40ft range. Target suffers a -1 penalty to all Stat Checks for 3 rounds.'
      }
    ],
    additionalAttacks: [
      {
        name: 'Ritual Bone Dagger',
        toHitStat: 'dex',
        toHitRank: 0,
        damageDice: '1d6',
        damageStat: 'dex',
        damageType: 'Piercing',
        effects: '5ft range melee strike with a cursed bone dagger.'
      }
    ]
  },
  'Wise-Guyy': {
    mana: 40,
    spells: [
      {
        name: 'Magic Missile',
        rank: 2,
        stat: 'int',
        manaCost: 12,
        range: 'Line of Sight',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Force',
        baseDamage: '2d6',
        effects: 'Hurls tracking magical missiles that strike with arcane force.'
      },
      {
        name: 'Arcane Shield',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: 'Self',
        duration: '1 minute',
        spellType: 'Buff',
        damageType: '',
        baseDamage: '',
        effects: 'Conjures a shimmering barrier granting +2 to Evade for 1 minute.'
      }
    ],
    additionalAttacks: [
      {
        name: 'Dagger Jab',
        toHitStat: 'dex',
        toHitRank: 0,
        damageDice: '1d4',
        damageStat: 'dex',
        damageType: 'Piercing',
        effects: '5ft range melee stab.'
      }
    ]
  },
  'Prosperity Prophet': {
    mana: 50,
    spells: [
      {
        name: 'Sleep',
        rank: 2,
        stat: 'int',
        manaCost: 15,
        range: '40 feet',
        duration: '1 minute',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '1d8',
        effects: '40ft range, 15ft Blast radius. Entities caught in the blast must make a CON Stat Check or fall asleep.'
      },
      {
        name: 'Golden Radiance',
        rank: 2,
        stat: 'cha',
        manaCost: 16,
        range: '30 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Radiant',
        baseDamage: '2d8',
        effects: '30ft Burst of golden light. Crawlers who suffer Major Fail on Evade are blinded for 1 round.'
      }
    ],
    additionalAttacks: []
  },
  'Mind Horror': {
    mana: 40,
    spells: [
      {
        name: 'Mindspike',
        rank: 2,
        stat: 'int',
        manaCost: 14,
        range: '50 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '2d8',
        effects: '50ft range. On Evade Major Fail or worse, target is Stunned until the end of their next turn.'
      },
      {
        name: 'Psionic Blast',
        rank: 1,
        stat: 'int',
        manaCost: 12,
        range: '30 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '2d6',
        effects: '30ft Cone blast of psychic pressure.'
      }
    ],
    additionalAttacks: []
  },
  'Rakish Werehound Shocker': {
    mana: 35,
    spells: [
      {
        name: 'Lightning Bolt',
        rank: 2,
        stat: 'int',
        manaCost: 16,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Electric',
        baseDamage: '2d10',
        effects: '60ft Line of crackling electricity. Crawlers suffer Shocked Debuff on Major Fail.'
      },
      {
        name: 'Static Discharge',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '10 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Electric',
        baseDamage: '1d8',
        effects: '10ft Burst around the Werehound.'
      }
    ],
    additionalAttacks: []
  },
  'Laminak Rev-Up Consultant Manager': {
    mana: 30,
    spells: [
      {
        name: 'Magic Missile',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Force',
        baseDamage: '1d8',
        effects: '60ft range force dart targeting an unpaid crawler.'
      },
      {
        name: 'Corporate Mandate',
        rank: 1,
        stat: 'cha',
        manaCost: 10,
        range: '30 feet',
        duration: '1 round',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '1d6',
        effects: '30ft range. On an Evade Major Fail, the target gains the Woozy Debuff.'
      }
    ],
    additionalAttacks: []
  },
  'Rayzer': {
    mana: 20,
    spells: [
      {
        name: 'Magic Missile',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: '60 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Force',
        baseDamage: '1d8',
        effects: '60ft range mystical force darts.'
      }
    ],
    additionalAttacks: []
  },
  'Troglodyte Virtuoso': {
    mana: 25,
    spells: [
      {
        name: 'Dissonant Discord',
        rank: 1,
        stat: 'cha',
        manaCost: 8,
        range: '40 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Sonic',
        baseDamage: '1d8',
        effects: '40ft range screeching bone flute solo.'
      },
      {
        name: 'Song of Clumsiness',
        rank: 1,
        stat: 'cha',
        manaCost: 10,
        range: '30 feet',
        duration: '2 rounds',
        spellType: 'Utility',
        damageType: '',
        baseDamage: '',
        effects: '30ft range. Target suffers a -2 penalty to Evade for 2 rounds.'
      }
    ],
    additionalAttacks: []
  },
  'Goblin Bomb Bard': {
    mana: 25,
    spells: [
      {
        name: 'Explosive Ballad',
        rank: 1,
        stat: 'cha',
        manaCost: 10,
        range: '40 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Fire',
        baseDamage: '2d6',
        effects: '40ft range, 10ft Blast radius detonating an acoustic fire charge.'
      }
    ],
    additionalAttacks: []
  },
  'Krakaren Clone': {
    mana: 40,
    spells: [
      {
        name: 'Shrieking Entitlement',
        rank: 1,
        stat: 'cha',
        manaCost: 10,
        range: '30 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Sonic',
        baseDamage: '2d6',
        effects: '30ft Cone of deafening outrage. Crawlers gain Deafened Debuff on Major Fail.'
      },
      {
        name: 'Call the Manager',
        rank: 2,
        stat: 'cha',
        manaCost: 15,
        range: '50 feet',
        duration: 'Instantaneous',
        spellType: 'Utility',
        damageType: '',
        baseDamage: '',
        effects: 'Summons 1d4 Smombies to defend the Krakaren Clone.'
      }
    ],
    additionalAttacks: []
  },
  'Beloved Mimic': {
    mana: 50,
    spells: [
      {
        name: 'Psionic Shriek',
        rank: 2,
        stat: 'int',
        manaCost: 15,
        range: '40 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '2d10',
        effects: '40ft Burst. Screeching telepathic broadcast overwhelming crawler minds.'
      }
    ],
    additionalAttacks: []
  },
  'Dream Eaters': {
    mana: 20,
    spells: [
      {
        name: 'Nightmare Touch',
        rank: 1,
        stat: 'int',
        manaCost: 8,
        range: 'Touch',
        duration: '1 minute',
        spellType: 'Attack',
        damageType: 'Psychic',
        baseDamage: '1d8',
        effects: 'Touch attack. Target gains the Woozy Debuff on an Evade Major Fail.'
      }
    ],
    additionalAttacks: []
  },
  'The Hoarder': {
    mana: 25,
    spells: [
      {
        name: 'Junk Swarm',
        rank: 1,
        stat: 'int',
        manaCost: 10,
        range: '30 feet',
        duration: 'Instantaneous',
        spellType: 'Attack',
        damageType: 'Physical',
        baseDamage: '2d6',
        effects: '30ft Cone of telekinetically hurled jagged dungeon trash.'
      }
    ],
    additionalAttacks: []
  }
};

let enrichedMobs = 0;

for (let mobIdx = 0; mobIdx < DCC_MOBS.length; mobIdx++) {
  const mob = DCC_MOBS[mobIdx];
  const config = SPELLCASTER_CONFIGS[mob.name];
  if (!config) continue;

  enrichedMobs++;

  // 1. Update Mana
  mob.system.attributes.mana = {
    value: config.mana,
    max: config.mana,
    pct: 100
  };

  // 2. Filter out attacks that were actually spells (e.g. named "Fireball Spell")
  const existingAttacks = (mob.items || []).filter(i => {
    if (i.type !== 'attack') return false;
    const isNamedSpell = i.name.toLowerCase().includes('spell') || config.spells.some(s => i.name.toLowerCase().includes(s.name.toLowerCase()));
    return !isNamedSpell;
  });

  const existingLoot = (mob.items || []).filter(i => i.type === 'loot');

  // Add any additional attacks configured
  for (let aIdx = 0; aIdx < (config.additionalAttacks || []).length; aIdx++) {
    const atk = config.additionalAttacks[aIdx];
    if (existingAttacks.some(a => a.name.toLowerCase() === atk.name.toLowerCase())) continue;
    const aIdStr = String((mobIdx + 1) * 100 + existingAttacks.length + aIdx + 1).padStart(7, '0');
    existingAttacks.push({
      _id: `dccatkmob${aIdStr}`,
      name: atk.name,
      type: 'attack',
      img: atk.img || 'icons/svg/sword.svg',
      system: {
        toHitStat: atk.toHitStat || 'dex',
        toHitRank: 0,
        damageDice: atk.damageDice || '1d6',
        damageStat: atk.damageStat || 'str',
        damageType: atk.damageType || 'Physical',
        effects: atk.effects || ''
      }
    });
  }

  // 3. Generate Spell items
  const spellItems = config.spells.map((spl, sIdx) => {
    const sIdStr = String((mobIdx + 1) * 100 + sIdx + 1).padStart(7, '0');
    return {
      _id: `dccsplmob${sIdStr}`,
      name: spl.name,
      type: 'spell',
      img: spl.img || 'icons/svg/wand.svg',
      system: {
        rank: spl.rank ?? 1,
        stat: spl.stat || 'int',
        manaCost: spl.manaCost ?? 10,
        range: spl.range || '60 feet',
        duration: spl.duration || 'Instantaneous',
        cooldown: 'None',
        spellType: spl.spellType || 'Attack',
        damageType: spl.damageType || '',
        baseDamage: spl.baseDamage || '',
        aiFavor: 0,
        favored: '',
        limitations: '',
        quote: `Casting ${spl.name}`,
        description: spl.effects || '',
        notes: spl.effects || '',
        upgrades: { rank5: '', rank10: '', rank15: '' }
      }
    };
  });

  // Reassemble mob.items: attacks, spells, loot
  mob.items = [...existingAttacks, ...spellItems, ...existingLoot];
  console.log(`Enriched ${mob.name}: ${existingAttacks.length} attacks, ${spellItems.length} spells, ${existingLoot.length} loot.`);
}

console.log(`\nEnriched ${enrichedMobs} spellcaster mobs total.`);

// Write back to src/data/mobs.mjs
const fileHeader = `/**
 * Dungeon Crawler Carl RPG - Official Mobs Dataset
 * Populated from the official Game Master's Toolkit - Entities List.
 * Contains all 84 mobs, bosses, and rival crawlers from Page 3 of the Toolkit.
 */

export const DCC_MOBS = ${JSON.stringify(DCC_MOBS, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/mobs.mjs'), fileHeader, 'utf8');
console.log('Successfully updated src/data/mobs.mjs!');
