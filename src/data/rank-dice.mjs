/**
 * Dungeon Crawler Carl RPG - Rank Damage Die & Upgrades Utility
 * Implements the official DCC RPG Rank Damage Die scaling table,
 * upgrade parsing, and combat difficulty calculations.
 */

/**
 * Rank Damage Die Scaling Table
 * Determines the rank damage die based on skill rank.
 *
 * | Skill Rank | Rank Damage Die | Operational Notes |
 * | Rank 0 (Untrained) | +0 | Check rolled with Disadvantage (2d20, keep lowest) |
 * | Rank 1 | +1 | Adds a flat +1 damage bonus |
 * | Rank 2–3 | +1d2 | Adds a 1d2 Rank damage die |
 * | Rank 4–5 | +1d4 | Adds a 1d4 Rank damage die |
 * | Rank 6–7 | +1d6 | Adds a 1d6 Rank damage die |
 * | Rank 8–9 | +1d8 | Adds a 1d8 Rank damage die |
 * | Rank 10–11 | +1d10 | Adds a 1d10 Rank damage die |
 * | Rank 12–13 | +1d12 | Adds a 1d12 Rank damage die |
 * | Rank 14–15 | +1d8 + 1d6 | Adds a d8 and d6 Rank damage die |
 * | Rank 16–17 | +2d8 | Adds 2d8 Rank damage die |
 * | Rank 18–19 | +1d10 + 1d8 | Adds a d10 and d8 Rank damage die |
 * | Rank 20+ | +2d10 | Adds 2d10 Rank damage die |
 *
 * @param {number} rank
 * @returns {{ dice: string, value: number, text: string }}
 */
export function getRankDamageDie(rank) {
  const r = Math.max(0, Number(rank) || 0);
  let base;
  let count = 0;
  let sides = 0;
  let parts = [];
  if (r <= 0) {
    base = { dice: '', value: 0, text: '+0' };
  } else if (r === 1) {
    base = { dice: '', value: 1, text: '+1' };
  } else if (r <= 3) {
    base = { dice: '1d2', value: 0, text: '+1d2' };
    count = 1; sides = 2; parts = [{ count: 1, sides: 2 }];
  } else if (r <= 5) {
    base = { dice: '1d4', value: 0, text: '+1d4' };
    count = 1; sides = 4; parts = [{ count: 1, sides: 4 }];
  } else if (r <= 7) {
    base = { dice: '1d6', value: 0, text: '+1d6' };
    count = 1; sides = 6; parts = [{ count: 1, sides: 6 }];
  } else if (r <= 9) {
    base = { dice: '1d8', value: 0, text: '+1d8' };
    count = 1; sides = 8; parts = [{ count: 1, sides: 8 }];
  } else if (r <= 11) {
    base = { dice: '1d10', value: 0, text: '+1d10' };
    count = 1; sides = 10; parts = [{ count: 1, sides: 10 }];
  } else if (r <= 13) {
    base = { dice: '1d12', value: 0, text: '+1d12' };
    count = 1; sides = 12; parts = [{ count: 1, sides: 12 }];
  } else if (r <= 15) { // 1d8 + 1d6
    base = { dice: '1d8 + 1d6', value: 0, text: '+1d8 + 1d6' };
    count = 2; sides = 8; parts = [{ count: 1, sides: 8 }, { count: 1, sides: 6 }];
  } else if (r <= 17) {
    base = { dice: '2d8', value: 0, text: '+2d8' };
    count = 2; sides = 8; parts = [{ count: 2, sides: 8 }];
  } else if (r <= 19) { // 1d10 + 1d8
    base = { dice: '1d10 + 1d8', value: 0, text: '+1d10 + 1d8' };
    count = 2; sides = 10; parts = [{ count: 1, sides: 10 }, { count: 1, sides: 8 }];
  } else { // max 20+
    base = { dice: '2d10', value: 0, text: '+2d10' };
    count = 2; sides = 10; parts = [{ count: 2, sides: 10 }];
  }
  Object.defineProperties(base, {
    count: { value: count, enumerable: false, writable: true },
    sides: { value: sides, enumerable: false, writable: true },
    parts: { value: parts, enumerable: false, writable: true }
  });
  return base;
}

/**
 * Extract rank upgrade strings (Rank 5, Rank 10, Rank 15) from an upgrades object or string.
 * @param {object|string} upgrades
 * @returns {{ rank5: string, rank10: string, rank15: string }}
 */
export function parseUpgrades(upgrades) {
  if (!upgrades) return { rank5: '', rank10: '', rank15: '' };
  if (typeof upgrades === 'object') {
    return {
      rank5: String(upgrades.rank5 || ''),
      rank10: String(upgrades.rank10 || ''),
      rank15: String(upgrades.rank15 || '')
    };
  }
  if (typeof upgrades === 'string') {
    const r5 = upgrades.match(/Rank\s*5\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || '';
    const r10 = upgrades.match(/Rank\s*10\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || '';
    const r15 = upgrades.match(/Rank\s*15\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || '';
    return { rank5: r5, rank10: r10, rank15: r15 };
  }
  return { rank5: '', rank10: '', rank15: '' };
}

/**
 * Convert an unstructured milestone upgrade text into a structured rankBreak object.
 * Extracts damageDice, baseDiceCountMod, rankDamageDice, debuff, buffsResistances, and notes.
 *
 * @param {string} text
 * @param {string[]} [knownDebuffs=[]]
 * @returns {{ damageDice: string, baseDiceCountMod: string, rankDamageDice: number, buffsResistances: string, debuff: string, notes: string }}
 */
export function parseUpgradeTextToRankBreak(text, knownDebuffs = []) {
  const result = {
    damageDice: '',
    baseDiceCountMod: '',
    rankDamageDice: 0,
    buffsResistances: '',
    debuff: '',
    notes: ''
  };
  if (!text || typeof text !== 'string') return result;
  const t = text.trim();
  if (!t) return result;
  result.notes = t;

  // 1. Additional Damage Dice (e.g. +2d2 base damage, +1d6, 1d12 base damage)
  const dmg = t.match(/\+(\d+d\d+)(?:\s+(?:base\s+)?damage)?/i) || t.match(/(\d+d\d+)\s+(?:base\s+)?damage/i);
  if (dmg) {
    result.damageDice = dmg[1];
  }

  // 2. Base Dice Count Mod (e.g. base dice count +1, etc.)
  const countMod = t.match(/base\s+dice\s+count\s*([+-]\d+)/i);
  if (countMod) {
    result.baseDiceCountMod = countMod[1];
  }

  // 3. Rank Damage Dice (e.g. 1 Rank damage die, add 1 Rank damage die)
  const rDie = t.match(/(\d+)\s+Rank\s+damage\s+di[ec]/i) || t.match(/add\s+(?:one|1)\s+.*Rank\s+damage\s+di[ec]/i);
  if (rDie && !t.includes("Misc Junk")) {
    result.rankDamageDice = rDie[1] ? parseInt(rDie[1], 10) : 1;
  }

  // 4. Debuff match against known canonical debuffs (data-driven)
  const debuffList = Array.isArray(knownDebuffs) && knownDebuffs.length > 0 ? knownDebuffs : [
    'Woozy', 'Queasy', 'Burned', 'Shocked', 'Stunned', 'Bleeding', 'Poisoned', 'Held', 'Stiff Legs',
    'The Taint', 'Sore as Shit', 'Muted', 'Take Down', 'Fatigued', 'Exhausted', 'Frightened', 'Prone',
    'Blinded', 'Reduced Sight', 'Terrified', 'Staggered', 'Shakey', 'Frozen', 'Crippled',
    'Minor Injury', 'Major Injury', 'Blood Trail', 'Drowning', 'Dying', 'Enraged',
    'Long-Term Major Injury', 'Long-Term Minor Injury', 'Paralyzed', 'Sepsis', 'Shit-Faced'
  ];
  for (const dName of debuffList) {
    const regex = new RegExp(`\\b${dName}\\b(?:\\s+Debuff)?`, 'i');
    if (regex.test(t)) {
      const isHealing = new RegExp(`(?:heal|mend|remove|cure|end|avoid)\\w*\\s+(?:an?\\s+)?(?:Long-Term\\s+)?(?:Minor\\s+Injury|Major\\s+Injury|${dName})`, 'i').test(t);
      const isHeldItems = dName.toLowerCase() === 'held' && /held\s+items?/i.test(t);
      if (!isHealing && !isHeldItems) {
        result.debuff = dName;
        break;
      }
    }
  }

  // 5. Buffs / Resistances
  const buff = t.match(/([A-Za-z\s]+?\s+Resistance|\+\d+\s+DR|\+\d+\s+[A-Z]{3}|\bDR\s*\+\s*\d+)/i);
  if (buff) {
    result.buffsResistances = buff[1].trim();
  }

  return result;
}

/**
 * Hydrate rankBreaks with structured properties derived from upgrades when rankBreaks is incomplete.
 * @param {object} [existingRankBreaks={}]
 * @param {object|string} [rawUpgrades={}]
 * @param {string[]} [knownDebuffs=[]]
 * @returns {object} Fully populated rankBreaks object with rank5, rank10, rank15, rank20
 */
export function hydrateRankBreaks(existingRankBreaks = {}, rawUpgrades = {}, knownDebuffs = []) {
  const breaks = {};
  const upgrades = parseUpgrades(rawUpgrades);

  for (const rKey of ['rank5', 'rank10', 'rank15', 'rank20']) {
    const existing = existingRankBreaks?.[rKey] || {};
    const parsed = parseUpgradeTextToRankBreak(upgrades[rKey] || '', knownDebuffs);

    breaks[rKey] = {
      damageDice: existing.damageDice !== undefined && existing.damageDice !== '' ? String(existing.damageDice).trim() : parsed.damageDice,
      baseDiceCountMod: existing.baseDiceCountMod !== undefined && existing.baseDiceCountMod !== '' ? String(existing.baseDiceCountMod).trim() : parsed.baseDiceCountMod,
      rankDamageDice: existing.rankDamageDice !== undefined && Number(existing.rankDamageDice) > 0 ? Number(existing.rankDamageDice) : parsed.rankDamageDice,
      buffsResistances: existing.buffsResistances !== undefined && existing.buffsResistances !== '' ? String(existing.buffsResistances).trim() : parsed.buffsResistances,
      debuff: existing.debuff !== undefined && existing.debuff !== '' ? String(existing.debuff).trim() : parsed.debuff,
      notes: existing.notes !== undefined && existing.notes !== '' ? String(existing.notes).trim() : (parsed.notes || '')
    };
  }

  return breaks;
}

/**
 * Standard Evade difficulty formula:
 * Target Evade (Standard Difficulty) = 10 + Foe Dex Mod + Floor Number
 * @param {number} [foeDexMod=0]
 * @param {number|null} [floorNumber=null]
 * @returns {number}
 */
export function getEvadeTargetDifficulty(foeDexMod = 0, floorNumber = null) {
  let floor = floorNumber;
  if (floor === null || floor === undefined) {
    try {
      const stored = globalThis.game?.settings?.get?.('carl-rpg', 'currentFloor');
      const parsed = parseInt(stored, 10);
      floor = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    } catch (_) {
      floor = 1;
    }
  }
  return 10 + (Number(foeDexMod) || 0) + (Number(floor) || 1);
}
