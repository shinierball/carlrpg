/**
 * Dungeon Crawler Carl RPG — Weapon & Skill Association Definitions
 * Data-driven mappings and auto-suggestion strategies for weapon skills,
 * techniques, and combat damage effects.
 *
 * Rules: Strict CarlRPG mechanics, NO regex pattern matching (Rule 0).
 * Hardcoded associations are stored in skill/item definitions and canonical maps,
 * not in arbitrary substring or regex code.
 */

export const CANONICAL_WEAPON_SKILL_MAP = {
  // Broad Weapon Categories
  'Ranged': ['Ranged Weapons', 'Aiming'],
  'Power Weapons': ['Power Weapons', 'Melee Combat'],
  'Edge': ['Blade Weapons', 'Melee Combat'],
  'Bashing': ['Blunt Weapons', 'Melee Combat'],
  'Blunt': ['Blunt Weapons', 'Melee Combat'],
  'Reach': ['Reach Weapons', 'Melee Combat'],
  'Hand to Hand': ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat'],
  'Unarmed': ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat'],
  'Exotic': ['Exotic Weapons'],
  'Utility': ['Utility'],

  // Specific Weapon Types / Canonical Keys (exact lowercase keys for data-driven lookup)
  'crossbow': ['Crossbow', 'Ranged Weapons', 'Aiming'],
  'crossbows': ['Crossbow', 'Ranged Weapons', 'Aiming'],
  'heavy crossbow': ['Crossbow', 'Ranged Weapons', 'Aiming'],
  'light crossbow': ['Crossbow', 'Ranged Weapons', 'Aiming'],
  'repeating crossbow': ['Crossbow', 'Ranged Weapons', 'Aiming'],
  'bow': ['Bow', 'Ranged Weapons', 'Aiming'],
  'longbow': ['Bow', 'Ranged Weapons', 'Aiming'],
  'shortbow': ['Bow', 'Ranged Weapons', 'Aiming'],
  'pistol': ['Firearms', 'Ranged Weapons', 'Aiming'],
  'rifle': ['Firearms', 'Ranged Weapons', 'Aiming'],
  'shotgun': ['Firearms', 'Ranged Weapons', 'Aiming'],
  'blaster': ['Firearms', 'Ranged Weapons', 'Aiming'],
  'chainsaw': ['Chainsaws', 'Power Weapons', 'Melee Combat'],
  'chainsaws': ['Chainsaws', 'Power Weapons', 'Melee Combat'],
  'sword': ['Blade Weapons', 'Melee Combat'],
  'broadsword': ['Blade Weapons', 'Melee Combat'],
  'longsword': ['Blade Weapons', 'Melee Combat'],
  'shortsword': ['Blade Weapons', 'Melee Combat'],
  'dagger': ['Daggers', 'Blade Weapons', 'Melee Combat', 'Backstabbing'],
  'knife': ['Daggers', 'Blade Weapons', 'Melee Combat'],
  'axe': ['Blade Weapons', 'Melee Combat'],
  'battleaxe': ['Blade Weapons', 'Melee Combat'],
  'mace': ['Blunt Weapons', 'Melee Combat'],
  'club': ['Blunt Weapons', 'Melee Combat'],
  'warhammer': ['Blunt Weapons', 'Melee Combat'],
  'hammer': ['Blunt Weapons', 'Melee Combat'],
  'spear': ['Reach Weapons', 'Melee Combat'],
  'polearm': ['Reach Weapons', 'Melee Combat'],
  'halberd': ['Reach Weapons', 'Blade Weapons', 'Melee Combat'],
  'pike': ['Reach Weapons', 'Melee Combat'],
  'staff': ['Staff', 'Blunt Weapons', 'Melee Combat'],
  'quarterstaff': ['Staff', 'Blunt Weapons', 'Melee Combat'],
  'fist': ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat'],
  'unarmed': ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat'],
  'brass knuckles': ['Hand-to-Hand Combat', 'Brawling', 'Melee Combat'],
  'pugilism': ['Pugilism', 'Hand-to-Hand Combat', 'Brawling'],
  'wrasslin': ['Wrasslin', 'Hand-to-Hand Combat', 'Brawling'],
  "wrasslin'": ['Wrasslin', 'Hand-to-Hand Combat', 'Brawling'],
  'shield': ['Shield Defense', 'Melee Combat']
};

export const CANONICAL_WEAPON_TECHNIQUE_MAP = {
  // Categories
  'Ranged': ['Aiming', 'Power Shot'],
  'Power Weapons': ['Serrated Tear', 'Powerful Strike'],
  'Edge': ['Serrated Tear', 'Powerful Strike'],
  'Bashing': ['Skullcracker', 'Smush', 'Powerful Strike'],
  'Blunt': ['Skullcracker', 'Smush', 'Powerful Strike'],
  'Reach': ['Impale', 'Powerful Strike'],
  'Hand to Hand': [],
  'Unarmed': [],

  // Specific Types
  'crossbow': ['Aiming', 'Power Shot'],
  'bow': ['Aiming', 'Power Shot'],
  'longbow': ['Aiming', 'Power Shot'],
  'chainsaw': ['Serrated Tear', 'Powerful Strike'],
  'mace': ['Skullcracker', 'Smush'],
  'club': ['Skullcracker', 'Smush'],
  'warhammer': ['Skullcracker', 'Smush'],
  'hammer': ['Skullcracker', 'Smush'],
  'sword': ['Serrated Tear', 'Powerful Strike'],
  'broadsword': ['Serrated Tear', 'Powerful Strike'],
  'dagger': ['Serrated Tear', 'Dirty Fighting'],
  'unarmed': [],
  'unarmed combat': [],
  'fist': [],
  'pugilism': ['Dirty Fighting', 'Iron Punch', 'Powerful Strike'],
  'wrasslin': ['Choke Out', 'Dirty Fighting', 'Toss'],
  "wrasslin'": ['Choke Out', 'Dirty Fighting', 'Toss'],
  'foot soldier': ['Powerful Strike', 'Smush'],
  'noggin knocker': ['Skullcracker', 'Powerful Strike'],
  'noggin nocker': ['Skullcracker', 'Powerful Strike']
};

/**
 * Returns recommended associated skill names for a given item based on its
 * weaponType, weaponCategory, name, and available skills' appliesTo definitions.
 * Evaluates specific weapon types before general categories to prioritize specific proficiencies.
 *
 * @param {object} itemData - Item document or plain object
 * @param {Array<object>} [availableSkills=[]] - Optional list of skill items/definitions with appliesTo metadata
 * @returns {Array<string>}
 */
export function getRecommendedAssociatedSkills(itemData, availableSkills = []) {
  const skillsSet = new Set();
  const sys = itemData?.system || {};

  const wType = (sys.weaponType || '').trim();
  const wTypeLower = wType.toLowerCase();
  const category = (sys.weaponCategory || '').trim();
  const name = (itemData?.name || '').trim();
  const nameLower = name.toLowerCase();

  // 1. Dynamic check: Skills whose appliesTo explicitly targets this weaponType, category, or name
  if (Array.isArray(availableSkills) && availableSkills.length > 0) {
    for (const sk of availableSkills) {
      const applies = Array.isArray(sk.system?.appliesTo)
        ? sk.system.appliesTo
        : (typeof sk.system?.appliesTo === 'string' && sk.system.appliesTo
            ? sk.system.appliesTo.split(',').map(s => s.trim())
            : []);

      for (const target of applies) {
        const tLower = target.toLowerCase();
        if (
          (wType && tLower === wTypeLower) ||
          (category && tLower === category.toLowerCase()) ||
          (name && tLower === nameLower)
        ) {
          skillsSet.add(sk.name);
          break;
        }
      }
    }
  }

  // 2. Specific Weapon Type lookup (Exact match prioritized)
  if (wTypeLower && CANONICAL_WEAPON_SKILL_MAP[wTypeLower]) {
    for (const sk of CANONICAL_WEAPON_SKILL_MAP[wTypeLower]) {
      skillsSet.add(sk);
    }
  } else if (wType) {
    const words = wTypeLower.split(' ').filter(Boolean);
    for (const word of words) {
      if (CANONICAL_WEAPON_SKILL_MAP[word]) {
        for (const sk of CANONICAL_WEAPON_SKILL_MAP[word]) {
          skillsSet.add(sk);
        }
      }
    }
  }

  // 3. Item Name token lookup
  if (nameLower && CANONICAL_WEAPON_SKILL_MAP[nameLower]) {
    for (const sk of CANONICAL_WEAPON_SKILL_MAP[nameLower]) {
      skillsSet.add(sk);
    }
  } else if (name) {
    const nameWords = nameLower.split(' ').filter(Boolean);
    for (const word of nameWords) {
      if (CANONICAL_WEAPON_SKILL_MAP[word]) {
        for (const sk of CANONICAL_WEAPON_SKILL_MAP[word]) {
          skillsSet.add(sk);
        }
      }
    }
  }

  // 4. Broad Weapon Category lookup (adds general masteries like Ranged Weapons or Melee Combat)
  if (category && CANONICAL_WEAPON_SKILL_MAP[category]) {
    for (const sk of CANONICAL_WEAPON_SKILL_MAP[category]) {
      skillsSet.add(sk);
    }
  }

  return Array.from(skillsSet);
}

/**
 * Returns recommended optional combat techniques/effects for a given item.
 * Evaluates specific weapon types before general categories to prioritize specific techniques.
 *
 * @param {object} itemData - Item document or plain object
 * @param {Array<object>} [availableSkills=[]] - Optional list of skill items/definitions with appliesTo metadata
 * @returns {Array<string>}
 */
export function getRecommendedOptionalEffects(itemData, availableSkills = []) {
  const effectsSet = new Set();
  const sys = itemData?.system || {};

  const wType = (sys.weaponType || '').trim();
  const wTypeLower = wType.toLowerCase();
  const category = (sys.weaponCategory || '').trim();
  const name = (itemData?.name || '').trim();
  const nameLower = name.toLowerCase();

  // 1. Dynamic check: Techniques whose appliesTo explicitly targets this weapon
  if (Array.isArray(availableSkills) && availableSkills.length > 0) {
    for (const sk of availableSkills) {
      if (sk.system?.isTechnique !== true && !sk.system?.techniqueConfig?.isDamageEffect) continue;
      const applies = Array.isArray(sk.system?.appliesTo)
        ? sk.system.appliesTo
        : (typeof sk.system?.appliesTo === 'string' && sk.system.appliesTo
            ? sk.system.appliesTo.split(',').map(s => s.trim())
            : []);

      for (const target of applies) {
        const tLower = target.toLowerCase();
        if (
          (wType && tLower === wTypeLower) ||
          (category && tLower === category.toLowerCase()) ||
          (name && tLower === nameLower)
        ) {
          effectsSet.add(sk.name);
          break;
        }
      }
    }
  }

  // 2. Specific Weapon Type lookup
  if (wTypeLower && CANONICAL_WEAPON_TECHNIQUE_MAP[wTypeLower]) {
    for (const ef of CANONICAL_WEAPON_TECHNIQUE_MAP[wTypeLower]) {
      effectsSet.add(ef);
    }
  } else if (wType) {
    const words = wTypeLower.split(' ').filter(Boolean);
    for (const word of words) {
      if (CANONICAL_WEAPON_TECHNIQUE_MAP[word]) {
        for (const ef of CANONICAL_WEAPON_TECHNIQUE_MAP[word]) {
          effectsSet.add(ef);
        }
      }
    }
  }

  // 3. Item Name token lookup
  if (nameLower && CANONICAL_WEAPON_TECHNIQUE_MAP[nameLower]) {
    for (const ef of CANONICAL_WEAPON_TECHNIQUE_MAP[nameLower]) {
      effectsSet.add(ef);
    }
  } else if (name) {
    const nameWords = nameLower.split(' ').filter(Boolean);
    for (const word of nameWords) {
      if (CANONICAL_WEAPON_TECHNIQUE_MAP[word]) {
        for (const ef of CANONICAL_WEAPON_TECHNIQUE_MAP[word]) {
          effectsSet.add(ef);
        }
      }
    }
  }

  // 4. Broad Weapon Category lookup
  if (category && CANONICAL_WEAPON_TECHNIQUE_MAP[category]) {
    for (const ef of CANONICAL_WEAPON_TECHNIQUE_MAP[category]) {
      effectsSet.add(ef);
    }
  }

  return Array.from(effectsSet);
}
