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
 * | Rank 10–13 | +1d10 | Adds a 1d10 Rank damage die |
 * | Rank 14–15+ | +1d12 | Adds a 1d12 Rank damage die |
 *
 * @param {number} rank
 * @returns {{ dice: string, value: number, text: string }}
 */
export function getRankDamageDie(rank) {
  const r = Math.max(0, Number(rank) || 0);
  if (r <= 0) return { dice: '', value: 0, text: '+0' };
  if (r === 1) return { dice: '', value: 1, text: '+1' };
  if (r <= 3) return { dice: '1d2', value: 0, text: '+1d2' };
  if (r <= 5) return { dice: '1d4', value: 0, text: '+1d4' };
  if (r <= 7) return { dice: '1d6', value: 0, text: '+1d6' };
  if (r <= 9) return { dice: '1d8', value: 0, text: '+1d8' };
  if (r <= 13) return { dice: '1d10', value: 0, text: '+1d10' };
  return { dice: '1d12', value: 0, text: '+1d12' };
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
