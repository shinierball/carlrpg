/**
 * CarlRPG Unified Tag Registry
 *
 * Implements stable, namespaced tag definitions and validation helpers.
 * All mechanics, grants, proficiencies, and choices query against exact tag IDs.
 * No regex or substring guessing is permitted (GEMINI §0).
 */

export const TAG_NAMESPACES = {
  kind:         { label: 'Kind', description: 'Core item or document classification' },
  action:       { label: 'Action Type', description: 'Action classification for skills and spells' },
  element:      { label: 'Damage / Element', description: 'Damage and energy types' },
  shape:        { label: 'Area / Delivery', description: 'Targeting shape or delivery mode' },
  stat:         { label: 'Governing Stat', description: 'Core crawler attribute' },
  archetype:    { label: 'Class Archetype', description: 'Base class archetype from rulebook' },
  favored:      { label: 'Favored Archetype', description: 'Favored class archetype for spells', references: 'archetype' },
  weapon:       { label: 'Weapon Type', description: 'Specific weapon family' },
  weaponClass:  { label: 'Weapon Category', description: 'Melee, ranged, natural, unarmed' },
  weaponProp:   { label: 'Weapon Property', description: 'Weapon handling properties (two-handed, reach, etc.)' },
  skillGroup:   { label: 'Skill Discipline', description: 'Discipline grouping for skills' },
  technique:    { label: 'Combat Technique Target', description: 'Skill targeted by combat techniques' },
  rule:         { label: 'Special Rule Flag', description: 'Engine mechanics and overrides' },
  id:           { label: 'Identity Tag', description: 'Stable unique item identity: id.<type>.<slug>' },
  custom:       { label: 'Custom User Tag', description: 'User-created tags' }
};

export const DCC_TAGS = [
  // --- Kinds ---
  { id: 'kind.spell', label: 'Spell', namespace: 'kind' },
  { id: 'kind.skill', label: 'Skill', namespace: 'kind' },
  { id: 'kind.attack', label: 'Attack', namespace: 'kind' },
  { id: 'kind.weapon', label: 'Weapon', namespace: 'kind' },
  { id: 'kind.armor', label: 'Armor', namespace: 'kind' },
  { id: 'kind.gear', label: 'Gear', namespace: 'kind' },
  { id: 'kind.loot', label: 'Loot', namespace: 'kind' },
  { id: 'kind.class', label: 'Class', namespace: 'kind' },
  { id: 'kind.race', label: 'Race', namespace: 'kind' },
  { id: 'kind.buff', label: 'Buff', namespace: 'kind' },
  { id: 'kind.debuff', label: 'Debuff', namespace: 'kind' },
  { id: 'kind.achievement', label: 'Achievement', namespace: 'kind' },

  // --- Actions ---
  { id: 'action.attack', label: 'Attack', namespace: 'action' },
  { id: 'action.heal', label: 'Heal', namespace: 'action' },
  { id: 'action.passive', label: 'Passive', namespace: 'action' },
  { id: 'action.interrupt', label: 'Interrupt', namespace: 'action' },

  // --- Damage / Elements ---
  { id: 'element.fire', label: 'Fire', namespace: 'element' },
  { id: 'element.ice', label: 'Ice', namespace: 'element' },
  { id: 'element.electric', label: 'Electric', namespace: 'element' },
  { id: 'element.force', label: 'Force', namespace: 'element' },
  { id: 'element.sonic', label: 'Sonic', namespace: 'element' },
  { id: 'element.holy', label: 'Holy', namespace: 'element' },
  { id: 'element.necrotic', label: 'Necrotic', namespace: 'element' },
  { id: 'element.psychic', label: 'Psychic', namespace: 'element' },
  { id: 'element.bludgeoning', label: 'Bludgeoning', namespace: 'element' },
  { id: 'element.piercing', label: 'Piercing', namespace: 'element' },
  { id: 'element.slashing', label: 'Slashing', namespace: 'element' },

  // --- Area / Shapes ---
  { id: 'shape.aoe', label: 'Area of Effect', namespace: 'shape' },
  { id: 'shape.burst', label: 'Burst', namespace: 'shape' },
  { id: 'shape.cone', label: 'Cone', namespace: 'shape' },
  { id: 'shape.line', label: 'Line', namespace: 'shape' },
  { id: 'shape.splash', label: 'Splash', namespace: 'shape' },
  { id: 'shape.single', label: 'Single Target', namespace: 'shape' },

  // --- Governing Stats ---
  { id: 'stat.str', label: 'Strength', namespace: 'stat' },
  { id: 'stat.dex', label: 'Dexterity', namespace: 'stat' },
  { id: 'stat.con', label: 'Constitution', namespace: 'stat' },
  { id: 'stat.int', label: 'Intelligence', namespace: 'stat' },
  { id: 'stat.cha', label: 'Charisma', namespace: 'stat' },

  // --- Class Archetypes ---
  { id: 'archetype.arcanist', label: 'Arcanist', namespace: 'archetype' },
  { id: 'archetype.barbarian', label: 'Barbarian', namespace: 'archetype' },
  { id: 'archetype.bard', label: 'Bard', namespace: 'archetype' },
  { id: 'archetype.cleric', label: 'Cleric', namespace: 'archetype' },
  { id: 'archetype.druid', label: 'Druid', namespace: 'archetype' },
  { id: 'archetype.fighter', label: 'Fighter', namespace: 'archetype' },
  { id: 'archetype.mage', label: 'Mage', namespace: 'archetype' },
  { id: 'archetype.merchant', label: 'Merchant', namespace: 'archetype' },
  { id: 'archetype.monk', label: 'Monk', namespace: 'archetype' },
  { id: 'archetype.necromancer', label: 'Necromancer', namespace: 'archetype' },
  { id: 'archetype.paladin', label: 'Paladin', namespace: 'archetype' },
  { id: 'archetype.rogue', label: 'Rogue', namespace: 'archetype' },

  // --- Favored Archetypes (references archetype.<name>) ---
  { id: 'favored.mage', label: 'Favored: Mage', namespace: 'favored', references: 'archetype.mage' },
  { id: 'favored.bard', label: 'Favored: Bard', namespace: 'favored', references: 'archetype.bard' },
  { id: 'favored.cleric', label: 'Favored: Cleric', namespace: 'favored', references: 'archetype.cleric' },
  { id: 'favored.paladin', label: 'Favored: Paladin', namespace: 'favored', references: 'archetype.paladin' },
  { id: 'favored.druid', label: 'Favored: Druid', namespace: 'favored', references: 'archetype.druid' },
  { id: 'favored.necromancer', label: 'Favored: Necromancer', namespace: 'favored', references: 'archetype.necromancer' },

  // --- Weapon Types ---
  { id: 'weapon.axe', label: 'Axe', namespace: 'weapon' },
  { id: 'weapon.bow', label: 'Bow', namespace: 'weapon' },
  { id: 'weapon.club', label: 'Club', namespace: 'weapon' },
  { id: 'weapon.crossbow', label: 'Crossbow', namespace: 'weapon' },
  { id: 'weapon.dagger', label: 'Dagger', namespace: 'weapon' },
  { id: 'weapon.handgun', label: 'Handgun', namespace: 'weapon' },
  { id: 'weapon.herding_weapon', label: 'Herding Weapon', namespace: 'weapon' },
  { id: 'weapon.improvised', label: 'Improvised Weapon', namespace: 'weapon' },
  { id: 'weapon.javelin', label: 'Javelin', namespace: 'weapon' },
  { id: 'weapon.lance', label: 'Lance', namespace: 'weapon' },
  { id: 'weapon.longsword', label: 'Longsword', namespace: 'weapon' },
  { id: 'weapon.polearm', label: 'Polearm', namespace: 'weapon' },
  { id: 'weapon.quarterstaff', label: 'Quarterstaff', namespace: 'weapon' },
  { id: 'weapon.rapier', label: 'Rapier', namespace: 'weapon' },
  { id: 'weapon.shotgun', label: 'Shotgun', namespace: 'weapon' },
  { id: 'weapon.shuriken', label: 'Shuriken', namespace: 'weapon' },
  { id: 'weapon.slingshot', label: 'Slingshot', namespace: 'weapon' },
  { id: 'weapon.warhammer', label: 'Warhammer', namespace: 'weapon' },

  // --- Weapon Categories ---
  { id: 'weaponClass.melee', label: 'Melee Weapon', namespace: 'weaponClass' },
  { id: 'weaponClass.ranged', label: 'Ranged Weapon', namespace: 'weaponClass' },
  { id: 'weaponClass.natural', label: 'Natural Attack', namespace: 'weaponClass' },
  { id: 'weaponClass.unarmed', label: 'Unarmed Attack', namespace: 'weaponClass' },

  // --- Weapon Properties ---
  { id: 'weaponProp.two_handed', label: 'Two-Handed', namespace: 'weaponProp' },
  { id: 'weaponProp.reach', label: 'Reach', namespace: 'weaponProp' },
  { id: 'weaponProp.thrown', label: 'Thrown', namespace: 'weaponProp' },

  // --- Skill Disciplines ---
  { id: 'skillGroup.combat', label: 'Combat Skill', namespace: 'skillGroup' },
  { id: 'skillGroup.crafting', label: 'Crafting Skill', namespace: 'skillGroup' },
  { id: 'skillGroup.knowledge', label: 'Knowledge Skill', namespace: 'skillGroup' },
  { id: 'skillGroup.social', label: 'Social Skill', namespace: 'skillGroup' },
  { id: 'skillGroup.survival', label: 'Survival Skill', namespace: 'skillGroup' },
  { id: 'skillGroup.utility', label: 'Utility Skill', namespace: 'skillGroup' },

  // --- Combat Technique Targets ---
  { id: 'technique.wrasslin', label: 'Wrasslin’ Technique', namespace: 'technique', references: 'id.skill.wrasslin' },
  { id: 'technique.pugilism', label: 'Pugilism Technique', namespace: 'technique', references: 'id.skill.pugilism' },
  { id: 'technique.noggin_nocker', label: 'Noggin Nocker Technique', namespace: 'technique', references: 'id.skill.noggin_nocker' },
  { id: 'technique.foot_soldier', label: 'Foot Soldier Technique', namespace: 'technique', references: 'id.skill.foot_soldier' },

  // --- Engine Rule Overrides ---
  { id: 'rule.no-damage-effects', label: 'Cannot Take Damage Effects', namespace: 'rule' },
  { id: 'rule.requires-weapon', label: 'Requires Equipped Weapon', namespace: 'rule' },
  { id: 'rule.mind-control', label: 'Mind Control', namespace: 'rule' }
];

/** Fast lookup map of registered tags */
export const TAG_MAP = new Map(DCC_TAGS.map(t => [t.id, t]));

/** Damage type string to element tag lookup */
export const DAMAGE_TYPE_TO_ELEMENT = {
  fire: 'element.fire',
  ice: 'element.ice',
  electric: 'element.electric',
  electricity: 'element.electric',
  force: 'element.force',
  sonic: 'element.sonic',
  holy: 'element.holy',
  necrotic: 'element.necrotic',
  psychic: 'element.psychic',
  bludgeoning: 'element.bludgeoning',
  piercing: 'element.piercing',
  slashing: 'element.slashing'
};

/** Element tag to canonical display damage type */
export const ELEMENT_TO_DAMAGE_TYPE = {
  'element.fire': 'Fire',
  'element.ice': 'Ice',
  'element.electric': 'Electric',
  'element.force': 'Force',
  'element.sonic': 'Sonic',
  'element.holy': 'Holy',
  'element.necrotic': 'Necrotic',
  'element.psychic': 'Psychic',
  'element.bludgeoning': 'Bludgeoning',
  'element.piercing': 'Piercing',
  'element.slashing': 'Slashing'
};

/** Stat slug to stat tag */
export const STAT_TO_TAG = {
  str: 'stat.str',
  dex: 'stat.dex',
  con: 'stat.con',
  int: 'stat.int',
  cha: 'stat.cha'
};

/** Archetype name to archetype tag */
export const ARCHETYPE_TO_TAG = {
  arcanist: 'archetype.arcanist',
  barbarian: 'archetype.barbarian',
  bard: 'archetype.bard',
  cleric: 'archetype.cleric',
  druid: 'archetype.druid',
  fighter: 'archetype.fighter',
  mage: 'archetype.mage',
  merchant: 'archetype.merchant',
  monk: 'archetype.monk',
  necromancer: 'archetype.necromancer',
  paladin: 'archetype.paladin',
  rogue: 'archetype.rogue'
};

/**
 * Retrieve custom tags configured in Foundry world setting or global memory.
 * @returns {Array<object>}
 */
export function getCustomTags() {
  if (typeof game !== 'undefined' && game?.settings?.get) {
    try {
      const saved = game.settings.get('carl-rpg', 'customTags');
      if (Array.isArray(saved)) return saved;
    } catch {
      // Setting not registered yet, proceed to in-memory fallback
    }
  }
  return globalThis._carlRpgCustomTags || [];
}

/**
 * Register a custom tag in the world setting and in-memory cache.
 * @param {object} tagDef
 */
export async function registerCustomTag(tagDef) {
  if (!tagDef || !tagDef.id) throw new Error('Tag definition must have an id');
  const id = tagDef.id.trim();
  const label = tagDef.label?.trim() || id;
  const namespace = tagDef.namespace?.trim() || (id.includes('.') ? id.split('.')[0] : 'custom');

  const customTags = getCustomTags().filter(t => t.id !== id);
  const newTag = { id, label, namespace, description: tagDef.description || '', references: tagDef.references || null };
  customTags.push(newTag);

  globalThis._carlRpgCustomTags = customTags;

  if (typeof game !== 'undefined' && game?.settings?.set) {
    try {
      await game.settings.set('carl-rpg', 'customTags', customTags);
    } catch (e) {
      console.warn('CarlRPG | Could not save custom tag to settings', e);
    }
  }
  return newTag;
}

/**
 * Retrieve a tag definition by its stable ID.
 * Checks core tags, custom tags, and auto-generated identity tags.
 * @param {string} tagId
 * @returns {object|null}
 */
export function getTagDefinition(tagId) {
  if (!tagId || typeof tagId !== 'string') return null;
  const normalizedId = tagId.trim();

  // 1. Core tag lookup
  if (TAG_MAP.has(normalizedId)) {
    return TAG_MAP.get(normalizedId);
  }

  // 2. Custom tag lookup
  const custom = getCustomTags().find(t => t.id === normalizedId);
  if (custom) return custom;

  // 3. Identity tag auto-descriptor (e.g. id.skill.wrasslin)
  if (normalizedId.startsWith('id.')) {
    const parts = normalizedId.split('.');
    const slug = parts.slice(2).join('.');
    return {
      id: normalizedId,
      label: slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      namespace: 'id',
      description: `Identity tag for ${slug}`
    };
  }

  return null;
}

/**
 * Check whether a given tag ID is valid.
 * @param {string} tagId
 * @returns {boolean}
 */
export function isValidTag(tagId) {
  return getTagDefinition(tagId) !== null;
}

/**
 * Convert damage type string to element tag.
 * @param {string} damageType
 * @returns {string|null}
 */
export function damageTypeToElement(damageType) {
  if (!damageType || typeof damageType !== 'string') return null;
  const key = damageType.trim().toLowerCase();
  return DAMAGE_TYPE_TO_ELEMENT[key] || null;
}

/**
 * Convert element tag to canonical damage type string.
 * @param {string} elementTag
 * @returns {string|null}
 */
export function elementToDamageType(elementTag) {
  if (!elementTag || typeof elementTag !== 'string') return null;
  return ELEMENT_TO_DAMAGE_TYPE[elementTag.trim()] || null;
}

/**
 * Compute derived runtime tags for an item from its structured properties.
 * These tags are NOT persisted in the database; they are calculated on the fly.
 * @param {object} item
 * @returns {Set<string>}
 */
export function computeDerivedTags(item) {
  const derived = new Set();
  if (!item) return derived;

  const type = item.type;
  if (type) {
    derived.add(`kind.${type}`);
  }

  const sys = item.system || {};

  // Identity tag if identifier is present
  if (sys.identifier && typeof sys.identifier === 'string' && sys.identifier.trim()) {
    derived.add(`id.${type}.${sys.identifier.trim()}`);
  }

  // Governing Stat
  const statVal = (sys.stat || sys.toHitStat || '').toLowerCase().trim();
  if (statVal && STAT_TO_TAG[statVal]) {
    derived.add(STAT_TO_TAG[statVal]);
  }

  // Damage type -> element
  if (sys.damageType) {
    const el = damageTypeToElement(sys.damageType);
    if (el) derived.add(el);
  }

  // Spell action type
  if (type === 'spell' && sys.spellType) {
    const actKey = sys.spellType.toLowerCase().trim();
    if (actKey === 'attack') derived.add('action.attack');
    else if (actKey === 'heal') derived.add('action.heal');
    else if (actKey === 'passive') derived.add('action.passive');
    else if (actKey === 'interrupt') derived.add('action.interrupt');
  }

  // Skill attack vs utility
  if (type === 'skill') {
    if (sys.isAttack) {
      derived.add('action.attack');
    }
  }

  // Weapon gear
  if (type === 'gear' && sys.isWeapon) {
    derived.add('kind.weapon');
  }

  // Class archetypes
  if (type === 'class') {
    if (Array.isArray(sys.archetypes)) {
      for (const a of sys.archetypes) {
        const key = a.replace(/^archetype\./, '').toLowerCase().trim();
        if (ARCHETYPE_TO_TAG[key]) derived.add(ARCHETYPE_TO_TAG[key]);
        else if (a.startsWith('archetype.')) derived.add(a);
      }
    } else {
      const arch = (sys.archetype || sys.classType || '').toLowerCase().trim();
      if (arch && ARCHETYPE_TO_TAG[arch]) {
        derived.add(ARCHETYPE_TO_TAG[arch]);
      }
    }
  }

  return derived;
}

/**
 * Get the full set of all tags (explicit + derived + identity) for an item document.
 * @param {object} item
 * @returns {Set<string>}
 */
export function getItemAllTags(item) {
  const all = new Set();
  if (!item) return all;

  // 1. Explicit tags from system.tags
  const explicit = item.system?.tags;
  if (Array.isArray(explicit)) {
    for (const t of explicit) {
      if (typeof t === 'string' && t.trim()) {
        all.add(t.trim());
      }
    }
  }

  // 2. Add derived tags
  for (const dt of computeDerivedTags(item)) {
    all.add(dt);
  }

  return all;
}
