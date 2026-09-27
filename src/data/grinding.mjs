/**
 * Dungeon Crawler Carl RPG — Grinding & Downtime System Data & Helpers
 *
 * Canonical mechanics based on Renegade Game Studios CarlRPG rules:
 * - 5-Hour Safe Daily Limit (no fatigue checks)
 * - Extended grinding requires Unopposed Endurance Checks (CON) per hour past 5
 * - Fatigue: Inflicts stackable Fatigued Debuff (-1 on checks, Move halved)
 * - Skill Advancement: Allocate grinding hours equal to current rank (Hours = Current Rank)
 * - Advancement Roll: 1d20 >= Current Rank
 * - 1d20 Grinding Complications Table
 */

export const DCC_GRINDING_COMPLICATIONS = [
  {
    range: [1, 1],
    title: 'Bugaboo / Boss Scout Ambush',
    icon: 'fa-solid fa-skull-crossbones',
    severity: 'danger',
    color: '#c0392b',
    description: 'A patrol of hostile trackers (e.g. Bugaboo Socket-Pickers or Kobold Riders) ambushes the party mid-grind. Immediate combat encounter with Surprise Difficulty check.'
  },
  {
    range: [2, 3],
    title: 'Janitor Mob Infestation',
    icon: 'fa-solid fa-bug',
    severity: 'warning',
    color: '#e67e22',
    description: 'Slaying mobs without incinerating or disposing of the bodies attracts hordes of Janitor Mobs (Pack Rats on Floor 1; Brindle Grubs on Floor 2). If left unchecked, grubs begin their 10-hour cocoon pupation into Brindled Vespas.'
  },
  {
    range: [4, 5],
    title: 'Labyrinthine Dead End / Trap',
    icon: 'fa-solid fa-triangle-exclamation',
    severity: 'warning',
    color: '#d35400',
    description: 'The party gets turned around in twisting alleys or steps on a booby-trapped tile (e.g. Pothole Plot or Bricktop Barrage). Requires an Unopposed Tracking or Evade check; failure inflicts 1d6 physical damage or adds +1 wasted hour to the floor clock.'
  },
  {
    range: [6, 7],
    title: 'Equipment Wear & Gear Snag',
    icon: 'fa-solid fa-wrench',
    severity: 'warning',
    color: '#7f8c8d',
    description: 'A weapon dulls, armor straps snap, or ammunition is depleted. 1 equipped gear item loses 1 DR or requires 15 minutes of repairs before next combat.'
  },
  {
    range: [8, 10],
    title: 'Rival Crawler Sighting',
    icon: 'fa-solid fa-users-viewfinder',
    severity: 'info',
    color: '#2980b9',
    description: 'The party spots or crosses paths with another crawler squad. The GM can initiate a social confrontation, mutual trade agreement, or tense standoff.'
  },
  {
    range: [11, 14],
    title: 'Clean, Routine Grind',
    icon: 'fa-solid fa-shield-halved',
    severity: 'success',
    color: '#27ae60',
    description: 'Standard, smooth grinding. All allocated hours apply without incident.'
  },
  {
    range: [15, 17],
    title: 'Valuable Scavenged Junk',
    icon: 'fa-solid fa-coins',
    severity: 'success',
    color: '#f39c12',
    description: 'In addition to training hours, the crawlers recover 1d4 units of Misc Junk suitable for Engineering/Crafting or 10–50 copper/silver dungeon coin.'
  },
  {
    range: [18, 19],
    title: 'Wandering Merchant / Helpful Guide',
    icon: 'fa-solid fa-person-walking-luggage',
    severity: 'success',
    color: '#16a085',
    bonusHours: 1,
    description: 'The party encounters a helpful friendly entity (e.g. Bob the Sprite or Huey). Grants advice allowing +1 bonus grinding hour to allocate to skills or a chance to purchase consumables.'
  },
  {
    range: [20, 20],
    title: 'AI-Approved Carnage (Loot Box Award)',
    icon: 'fa-solid fa-box-open',
    severity: 'celestial',
    color: '#8e44ad',
    description: 'The crawlers dispatch a pack of mobs with such flair, brutality, or comedic timing that the Dungeon AI takes notice. The AI broadcasts an announcement and awards the crawler a Bronze or Silver Loot Box!'
  }
];

/**
 * Lookup complication by 1d20 roll value.
 * @param {number} roll
 * @returns {object}
 */
export function getGrindingComplication(roll) {
  const r = Math.max(1, Math.min(20, Math.floor(roll)));
  return DCC_GRINDING_COMPLICATIONS.find(c => r >= c.range[0] && r <= c.range[1]) || DCC_GRINDING_COMPLICATIONS[5];
}

/**
 * Calculate grinding hours required to attempt advancing a skill.
 * Hours = Current Rank (Rank 0/1 requires 1 hour).
 * @param {number} currentRank
 * @returns {number}
 */
export function getRequiredGrindingHours(currentRank) {
  const rank = Number(currentRank) || 0;
  return Math.max(1, rank);
}

/**
 * Calculate target number on 1d20 to advance a skill.
 * Success if 1d20 >= currentRank.
 * @param {number} currentRank
 * @returns {number}
 */
export function getAdvancementTarget(currentRank) {
  return Number(currentRank) || 0;
}

/**
 * Calculate the safe grinding threshold in hours based on guide insight and map bonuses.
 * Base safe limit = 5 hours.
 * Guide bonus (Huey/Bob) = +1 hour.
 * Neighborhood map = +1 hour.
 * Borough / Burrough map = +2 hours.
 * @param {object} [options={}]
 * @param {boolean} [options.hasGuideBonus=false]
 * @param {string} [options.mapType='none'] 'none', 'neighborhood', 'borough', 'burrough'
 * @param {boolean} [options.hasNeighborhoodMap=false]
 * @param {boolean} [options.hasBoroughMap=false]
 * @param {boolean} [options.hasBurroughMap=false]
 * @param {number} [options.mapBonus=0]
 * @returns {{ safeThreshold: number, guideBonus: number, mapBonus: number }}
 */
export function getSafeGrindingThreshold(options = {}) {
  const base = 5;
  const guideBonus = options.hasGuideBonus ? 1 : 0;

  let mapBonus = Number(options.mapBonus) || 0;
  const mapType = String(options.mapType || '').toLowerCase().trim();
  if (mapType === 'neighborhood' || options.hasNeighborhoodMap) {
    mapBonus = Math.max(mapBonus, 1);
  }
  if (mapType === 'borough' || mapType === 'burrough' || options.hasBoroughMap || options.hasBurroughMap) {
    mapBonus = Math.max(mapBonus, 2);
  }

  const safeThreshold = base + guideBonus + mapBonus;
  const hours = Number(options.hours) || 0;
  const excessHours = Math.max(0, hours - safeThreshold);
  return { safeThreshold, guideBonus, mapBonus, excessHours };
}

/**
 * Calculate DC for an extended grinding Endurance check.
 * DC = 10 + Floor Number + Hours Past Safe Limit.
 * @param {number} floor
 * @param {number} hoursPastSafe
 * @returns {number}
 */
export function getEnduranceDC(floor = 1, hoursPastSafe = 1) {
  const f = Math.max(1, Number(floor) || 1);
  const h = Math.max(1, Number(hoursPastSafe) || 1);
  return 10 + f + h;
}

