/**
 * Dungeon Crawler Carl RPG - Race & Class Application & Reversal Engine
 * Manages selecting, applying, and cleanly reverting Race and Class benefits,
 * ability modifiers, skill ranks, spells, and sizes on Crawler characters.
 */

import { DCC_RACES } from './races.mjs';
import { DCC_CLASSES } from './classes.mjs';
import { DCC_SKILLS } from './skills.mjs';
import { DCC_SPELLS } from './spells.mjs';
import { getSizeInfo } from './sizes.mjs';

/**
 * Normalizes text for comparison by removing whitespace and non-alphanumeric chars.
 */
export function normalizeKey(str) {
  return String(str || '')
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

/**
 * Returns inverted key for comma-separated names, e.g. "Elf, High" -> "highelf".
 */
export function getInvertedKey(str) {
  const raw = String(str || '');
  if (raw.includes(',')) {
    const parts = raw.split(',').map(p => p.trim());
    return normalizeKey(parts.reverse().join(' '));
  }
  return normalizeKey(raw);
}

/**
 * Clean OCR spacing artifacts from text lines.
 */
export function cleanOCRText(t) {
  return String(t || '')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/Sk\s*ills?/gi, 'Skill')
    .replace(/Spe\s*lls?/gi, 'Spell')
    .replace(/Ear\s*th/gi, 'Earth')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a parsed skill name against canonical DCC_SKILLS.
 */
export function matchKnownSkill(raw) {
  const clean = String(raw || '').trim().replace(/^and\s+/i, '').replace(/\s+Attack$/i, '').trim();
  const norm = normalizeKey(clean);
  const found = DCC_SKILLS.find(s => normalizeKey(s.name) === norm);
  return found ? found.name : clean;
}

/**
 * Normalizes a parsed spell name against canonical DCC_SPELLS.
 */
export function matchKnownSpell(raw) {
  const clean = String(raw || '').trim().replace(/^and\s+/i, '').trim();
  const norm = normalizeKey(clean);
  const found = DCC_SPELLS.find(s => normalizeKey(s.name) === norm);
  return found ? found.name : clean;
}

export class DCCRaceClassApplier {

  // =========================================================================
  // DEFINITION LOOKUPS
  // =========================================================================

  /**
   * Finds a race definition from canonical DCC_RACES or world Item documents.
   *
   * @param {string} identifier - Name or ID
   * @returns {object|null}
   */
  static findRace(identifier) {
    if (!identifier) return null;
    let norm = normalizeKey(identifier);
    if (norm === 'shapeshifter' || norm === 'shapeshifters') norm = 'changeling';
    const normOl = norm.replace(/old/g, 'ol');

    // 1. Canonical dataset
    const canonical = DCC_RACES.find(r => {
      if (r._id === identifier) return true;
      const rn = normalizeKey(r.name);
      const invR = getInvertedKey(r.name);
      return rn === norm || rn === normOl || invR === norm || invR === normOl;
    });
    if (canonical) return canonical;

    // 2. World Items
    if (globalThis.game?.items) {
      const worldItem = globalThis.game.items.find(i => {
        if (i.type !== 'race') return false;
        if (i.id === identifier) return true;
        const rn = normalizeKey(i.name);
        const invR = getInvertedKey(i.name);
        return rn === norm || rn === normOl || invR === norm || invR === normOl;
      });
      if (worldItem) return worldItem.toObject ? worldItem.toObject() : worldItem;
    }

    return null;
  }

  /**
   * Finds a class definition from canonical DCC_CLASSES or world Item documents.
   *
   * @param {string} identifier - Name or ID
   * @returns {object|null}
   */
  static findClass(identifier) {
    if (!identifier) return null;
    const norm = normalizeKey(identifier);
    const normOl = norm.replace(/old/g, 'ol');

    // 1. Canonical dataset
    const canonical = DCC_CLASSES.find(c => {
      if (c._id === identifier) return true;
      const cn = normalizeKey(c.name);
      return cn === norm || cn === normOl;
    });
    if (canonical) return canonical;

    // 2. World Items
    if (globalThis.game?.items) {
      const worldItem = globalThis.game.items.find(i => {
        if (i.type !== 'class') return false;
        if (i.id === identifier) return true;
        const cn = normalizeKey(i.name);
        return cn === norm || cn === normOl;
      });
      if (worldItem) return worldItem.toObject ? worldItem.toObject() : worldItem;
    }

    return null;
  }

  // =========================================================================
  // BENEFIT PARSING (STATS, SKILLS, SPELLS, SIZE)
  // =========================================================================

  /**
   * Parses ability stat modifiers from perks or structured system data.
   */
  static parseStats(data) {
    const stats = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };

    // Direct structured stats (e.g. from Custom Studio builds)
    if (data?.system?.stats && typeof data.system.stats === 'object') {
      for (const [k, v] of Object.entries(data.system.stats)) {
        if (stats.hasOwnProperty(k)) stats[k] = Number(v) || 0;
      }
      return stats;
    }
    if (data?.stats && typeof data.stats === 'object') {
      for (const [k, v] of Object.entries(data.stats)) {
        if (stats.hasOwnProperty(k)) stats[k] = Number(v) || 0;
      }
      return stats;
    }

    // Text parsing from perks / abilities
    const perks = Array.isArray(data?.system?.perks)
      ? data.system.perks
      : (Array.isArray(data?.perks) ? data.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);
      if (p.includes('-1 to all St')) {
        stats.str -= 1; stats.dex -= 1; stats.con -= 1; stats.int -= 1; stats.cha -= 1;
        continue;
      }

      // Regex matching "+3 Strength", "+2 to Dexterity and Constitution", "-2 Charisma", "+3 Strength, Constitution, and Charisma"
      const m = p.match(/^([+\-]\d+)\s+(?:to\s+)?([A-Za-z,\s]+?)(?:\s+(?:Skills?|Spells?|table|Buff|DR|\(benefit\)|table of your choice))?$/i);
      if (m) {
        const val = parseInt(m[1], 10);
        const wordsStr = m[2];
        const words = wordsStr.split(/(?:,\s*|\s+and\s+)/i).map(w => w.trim().toLowerCase());
        for (const w of words) {
          if (['strength', 'str'].includes(w)) stats.str += val;
          else if (['dexterity', 'dex'].includes(w)) stats.dex += val;
          else if (['constitution', 'con'].includes(w)) stats.con += val;
          else if (['intelligence', 'int'].includes(w)) stats.int += val;
          else if (['charisma', 'cha'].includes(w)) stats.cha += val;
        }
      }
    }

    return stats;
  }

  /**
   * Parses granted skills and spells from definition.
   */
  static parseSkillsAndSpells(data) {
    const skills = [];
    const spells = [];

    // Structured skills/spells from Studio Point Builds
    if (Array.isArray(data?.system?.skills) && data.system.skills.length > 0) {
      for (const s of data.system.skills) {
        if (s.name && s.rank) skills.push({ name: s.name, rank: Number(s.rank) || 1, isPassive: Boolean(s.isPassive) });
      }
    }
    if (Array.isArray(data?.system?.spells) && data.system.spells.length > 0) {
      for (const sp of data.system.spells) {
        if (sp.name && sp.rank) spells.push({ name: sp.name, rank: Number(sp.rank) || 1, mpCost: Number(sp.mpCost) || 0 });
      }
    }

    if (skills.length > 0 || spells.length > 0) {
      return { skills, spells };
    }

    // Text parsing from perks
    const perks = Array.isArray(data?.system?.perks)
      ? data.system.perks
      : (Array.isArray(data?.perks) ? data.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);

      // Check for Spells: e.g. "+3 Web Spell", "+2 Earworm, Heal Others, and Shield Spells"
      const spellMatch = p.match(/^\+(\d+)\s+(?:in\s+)?([A-Za-z0-9\s,\u0027’\-]+?)\s+Spell/i);
      if (spellMatch) {
        const rank = parseInt(spellMatch[1], 10);
        const spellNames = spellMatch[2].split(/(?:,\s*|\s+and\s+)/i).map(s => s.trim()).filter(Boolean);
        for (const sp of spellNames) {
          if (!sp.toLowerCase().includes('choice') && !sp.toLowerCase().includes('cost')) {
            spells.push({ name: matchKnownSpell(sp), rank });
          }
        }
        continue;
      }

      // Check for Skills: e.g. "+5 Arcane Skill", "+2 Bow, Endurance, and Pugilism Skills", "+3 Cat-like Reflexes"
      const skillMatch = p.match(/^\+(\d+)\s+(?:in\s+)?([A-Za-z0-9\s,\u0027’\-]+?)\s+Skill/i);
      if (skillMatch) {
        const rank = parseInt(skillMatch[1], 10);
        const skillNames = skillMatch[2].split(/(?:,\s*|\s+and\s+)/i).map(s => s.trim()).filter(Boolean);
        for (const sk of skillNames) {
          if (
            !sk.toLowerCase().includes('choice') &&
            !sk.toLowerCase().includes('all ') &&
            !sk.toLowerCase().includes('following') &&
            !sk.toLowerCase().includes('weapon') &&
            !sk.toLowerCase().includes('differ ent') &&
            !sk.toLowerCase().includes('craft ing')
          ) {
            skills.push({ name: matchKnownSkill(sk), rank });
          }
        }
      }
    }

    return { skills, spells };
  }

  /**
   * Fully decomposes a race definition into applied bonuses.
   */
  static parseRaceBonuses(raceDef) {
    if (!raceDef) return null;
    const stats = this.parseStats(raceDef);
    const { skills, spells } = this.parseSkillsAndSpells(raceDef);
    const size = raceDef.system?.size || 'Medium (4)';
    const parsedSize = getSizeInfo(size);

    return {
      name: raceDef.name,
      heritage: raceDef.system?.heritage || 'Earth',
      size: parsedSize.name || 'Medium',
      sizeRaw: size,
      stats,
      skills,
      spells
    };
  }

  /**
   * Fully decomposes a class definition into applied bonuses.
   */
  static parseClassBonuses(classDef) {
    if (!classDef) return null;
    const stats = this.parseStats(classDef);
    const { skills, spells } = this.parseSkillsAndSpells(classDef);
    const classType = classDef.system?.classType || 'Fighter';

    return {
      name: classDef.name,
      classType,
      stats,
      skills,
      spells
    };
  }

  // =========================================================================
  // SELECT OPTION GROUP BUILDERS (FOR TEMPLATES)
  // =========================================================================

  /**
   * Generates precomputed select options for Race and Class dropdowns.
   *
   * @param {Actor} actor
   * @returns {object} { raceOptions, classOptions, hasCustomRace, hasCustomClass }
   */
  static getRaceClassContext(actor) {
    const currentRace = (actor?.system?.details?.race || '').trim();
    const currentClass = (actor?.system?.details?.class || '').trim();
    const normCurRace = normalizeKey(currentRace);
    const normCurClass = normalizeKey(currentClass);

    // 1. Race Options
    const earthRaces = [];
    const alienRaces = [];
    let raceFound = false;

    for (const r of DCC_RACES) {
      const normR = normalizeKey(r.name);
      const invR = getInvertedKey(r.name);
      const isSelected = normCurRace && (normR === normCurRace || invR === normCurRace);
      if (isSelected) raceFound = true;
      const opt = { value: r.name, label: r.name, selected: Boolean(isSelected) };
      if (r.system?.heritage === 'Alien') {
        alienRaces.push(opt);
      } else {
        earthRaces.push(opt);
      }
    }

    const worldRaces = [];
    if (globalThis.game?.items) {
      for (const item of globalThis.game.items.values()) {
        if (item.type === 'race' && !DCC_RACES.some(r => normalizeKey(r.name) === normalizeKey(item.name))) {
          const isSelected = normCurRace && normalizeKey(item.name) === normCurRace;
          if (isSelected) raceFound = true;
          worldRaces.push({ value: item.name, label: `${item.name} (Custom)`, selected: isSelected });
        }
      }
    }

    const raceOptions = [
      { label: 'Earth Races (Silver Earth Box)', options: earthRaces },
      { label: 'Alien Syndicate Races (Galactic Popularity)', options: alienRaces }
    ];
    if (worldRaces.length > 0) {
      raceOptions.push({ label: 'Custom / World Races', options: worldRaces });
    }

    const hasCustomRace = Boolean(currentRace && !raceFound);

    // 2. Class Options
    const archetypes = [
      'Arcanist', 'Barbarian', 'Bard', 'Cleric', 'Druid',
      'Fighter', 'Mage', 'Monk', 'Paladin', 'Rogue'
    ];
    const archetypeMap = {};
    for (const arch of archetypes) archetypeMap[arch] = [];
    const multiclassClasses = [];
    let classFound = false;

    for (const c of DCC_CLASSES) {
      const isSelected = normCurClass && normalizeKey(c.name) === normCurClass;
      if (isSelected) classFound = true;
      const opt = { value: c.name, label: c.name, selected: isSelected };

      const classType = c.system?.classType || 'Fighter';
      if (classType.includes(',')) {
        multiclassClasses.push(opt);
      } else {
        const matchArch = archetypes.find(a => a.toLowerCase() === classType.trim().toLowerCase());
        if (matchArch) {
          archetypeMap[matchArch].push(opt);
        } else {
          multiclassClasses.push(opt);
        }
      }
    }

    const worldClasses = [];
    if (globalThis.game?.items) {
      for (const item of globalThis.game.items.values()) {
        if (item.type === 'class' && !DCC_CLASSES.some(c => normalizeKey(c.name) === normalizeKey(item.name))) {
          const isSelected = normCurClass && normalizeKey(item.name) === normCurClass;
          if (isSelected) classFound = true;
          worldClasses.push({ value: item.name, label: `${item.name} (Custom)`, selected: isSelected });
        }
      }
    }

    const classOptions = [];
    for (const arch of archetypes) {
      if (archetypeMap[arch].length > 0) {
        classOptions.push({ label: `${arch} Classes`, options: archetypeMap[arch] });
      }
    }
    if (multiclassClasses.length > 0) {
      classOptions.push({ label: 'Multiclass & Special Classes', options: multiclassClasses });
    }
    if (worldClasses.length > 0) {
      classOptions.push({ label: 'Custom / World Classes', options: worldClasses });
    }

    const hasCustomClass = Boolean(currentClass && !classFound);

    return {
      raceOptions,
      classOptions,
      hasCustomRace,
      hasCustomClass,
      currentRace,
      currentClass
    };
  }

  // =========================================================================
  // RACE MUTATORS (APPLY & REVERSE)
  // =========================================================================

  /**
   * Reverses and removes the actor's current race benefits.
   *
   * @param {Actor} actor
   * @returns {Promise<boolean>}
   */
  static async removeRace(actor) {
    if (!actor) return false;

    // 1. Retrieve applied race metadata
    let applied = actor.getFlag?.('carl-rpg', 'appliedRace');
    const currentRaceName = (actor.system?.details?.race || '').trim();

    // Fallback: If no flag exists but race detail string is set, look up definition to parse what to revert
    if (!applied && currentRaceName) {
      const def = this.findRace(currentRaceName);
      if (def) {
        const bonuses = this.parseRaceBonuses(def);
        applied = {
          name: def.name,
          stats: bonuses.stats,
          skills: bonuses.skills.map(s => ({ name: s.name, rank: s.rank, createdByRace: true })),
          spells: bonuses.spells.map(sp => ({ name: sp.name, rank: sp.rank, createdByRace: true })),
          size: bonuses.size,
          originalSize: 'Medium'
        };
      }
    }

    if (!applied && !currentRaceName) return false;

    const updates = {};
    updates['system.details.race'] = '';

    // 2. Revert Ability Stats
    if (applied?.stats) {
      for (const [stat, delta] of Object.entries(applied.stats)) {
        if (delta !== 0 && actor.system?.abilities?.[stat]) {
          const curVal = Number(actor.system.abilities[stat].value) || 10;
          const curUnenh = Number(actor.system.abilities[stat].unenhanced) ?? curVal;
          updates[`system.abilities.${stat}.value`] = curVal - delta;
          updates[`system.abilities.${stat}.unenhanced`] = curUnenh - delta;
        }
      }
    }

    // 3. Revert Creature Size
    if (applied?.size) {
      const orig = applied.originalSize || 'Medium';
      updates['system.attributes.size'] = orig;
    }

    // 4. Revert Skills
    if (Array.isArray(applied?.skills)) {
      const itemsToDelete = [];
      for (const s of applied.skills) {
        const skillItem = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
        if (skillItem) {
          const curRank = Number(skillItem.system?.rank) || 0;
          const remainingRank = curRank - (Number(s.rank) || 0);

          if (remainingRank > 0) {
            // Keep the skill with remaining non-item ranks!
            if (typeof skillItem.update === 'function') {
              await skillItem.update({ 'system.rank': remainingRank });
            }
          } else {
            // No non-item ranks remain: delete if granted by race or 0
            const wasCreated = s.createdByRace || (skillItem.getFlag?.('carl-rpg', 'grantedBy') === 'race');
            if (wasCreated && typeof actor.deleteEmbeddedDocuments === 'function') {
              itemsToDelete.push(skillItem.id);
            } else if (typeof skillItem.update === 'function') {
              await skillItem.update({ 'system.rank': Math.max(0, remainingRank) });
            }
          }
        }
      }
      if (itemsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
        await actor.deleteEmbeddedDocuments('Item', itemsToDelete);
      }
    }

    // 5. Revert Spells
    if (Array.isArray(applied?.spells)) {
      const spellsToDelete = [];
      for (const sp of applied.spells) {
        const spellItem = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
        if (spellItem) {
          const curRank = Number(spellItem.system?.rank) || 0;
          const remainingRank = curRank - (Number(sp.rank) || 0);
          if (remainingRank > 0) {
            if (typeof spellItem.update === 'function') {
              await spellItem.update({ 'system.rank': remainingRank });
            }
          } else {
            const wasCreated = sp.createdByRace || (spellItem.getFlag?.('carl-rpg', 'grantedBy') === 'race');
            if (wasCreated && typeof actor.deleteEmbeddedDocuments === 'function') {
              spellsToDelete.push(spellItem.id);
            } else if (typeof spellItem.update === 'function') {
              await spellItem.update({ 'system.rank': Math.max(0, remainingRank) });
            }
          }
        }
      }
      if (spellsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
        await actor.deleteEmbeddedDocuments('Item', spellsToDelete);
      }
    }

    // 6. Delete embedded Race Item documents
    const raceItems = actor.items?.filter?.(i => i.type === 'race') || [];
    if (raceItems.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', raceItems.map(i => i.id));
    }

    // 7. Clear flag
    if (typeof actor.unsetFlag === 'function') {
      await actor.unsetFlag('carl-rpg', 'appliedRace');
    }

    // 8. Commit actor updates
    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    return true;
  }

  /**
   * Applies a new race to the actor, automatically reverting previous race benefits.
   *
   * @param {Actor} actor
   * @param {string} raceIdentifier
   * @returns {Promise<boolean>}
   */
  static async applyRace(actor, raceIdentifier) {
    if (!actor) return false;

    // Clearing race
    if (!raceIdentifier) {
      await this.removeRace(actor);
      return true;
    }

    const def = this.findRace(raceIdentifier);
    if (!def) {
      // Custom uncataloged name: simply update string
      await this.removeRace(actor);
      await actor.update?.({ 'system.details.race': raceIdentifier });
      return true;
    }

    // 1. Revert previous race first
    await this.removeRace(actor);

    // 2. Parse new race bonuses
    const bonuses = this.parseRaceBonuses(def);
    const updates = {};
    updates['system.details.race'] = def.name;

    const originalSize = actor.system?.attributes?.size || 'Medium';
    if (bonuses.size) {
      updates['system.attributes.size'] = bonuses.size;
    }

    // 3. Apply Stat Deltas
    for (const [stat, delta] of Object.entries(bonuses.stats)) {
      if (delta !== 0 && actor.system?.abilities?.[stat]) {
        const curVal = Number(actor.system.abilities[stat].value) || 10;
        const curUnenh = Number(actor.system.abilities[stat].unenhanced) ?? curVal;
        updates[`system.abilities.${stat}.value`] = curVal + delta;
        updates[`system.abilities.${stat}.unenhanced`] = curUnenh + delta;
      }
    }

    // 4. Apply Granted Skills
    const appliedSkills = [];
    for (const s of bonuses.skills) {
      const existing = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + s.rank });
        appliedSkills.push({ id: existing.id, name: existing.name, rank: s.rank, preExistingRank: curRank, createdByRace: false });
      } else {
        const skillDoc = DCC_SKILLS.find(sk => normalizeKey(sk.name) === normalizeKey(s.name));
        if (typeof actor.createEmbeddedDocuments === 'function') {
          const [created] = await actor.createEmbeddedDocuments('Item', [{
            name: s.name,
            type: 'skill',
            img: skillDoc?.img || 'icons/svg/sword.svg',
            system: {
              rank: s.rank,
              stat: skillDoc?.system?.stat || 'str',
              skillType: skillDoc?.system?.skillType || 'Utility',
              category: skillDoc?.system?.category || 'Combat',
              isPassive: Boolean(s.isPassive)
            },
            flags: {
              'carl-rpg': {
                grantedBy: 'race'
              }
            }
          }]);
          appliedSkills.push({ id: created?.id, name: s.name, rank: s.rank, preExistingRank: 0, createdByRace: true });
        }
      }
    }

    // 5. Apply Granted Spells
    const appliedSpells = [];
    for (const sp of bonuses.spells) {
      const existing = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + sp.rank });
        appliedSpells.push({ id: existing.id, name: existing.name, rank: sp.rank, preExistingRank: curRank, createdByRace: false });
      } else {
        const spellDoc = DCC_SPELLS.find(spd => normalizeKey(spd.name) === normalizeKey(sp.name));
        if (typeof actor.createEmbeddedDocuments === 'function') {
          const [created] = await actor.createEmbeddedDocuments('Item', [{
            name: sp.name,
            type: 'spell',
            img: spellDoc?.img || 'icons/svg/lightning.svg',
            system: {
              rank: sp.rank,
              mpCost: spellDoc?.system?.mpCost || sp.mpCost || 0
            },
            flags: {
              'carl-rpg': {
                grantedBy: 'race'
              }
            }
          }]);
          appliedSpells.push({ id: created?.id, name: sp.name, rank: sp.rank, preExistingRank: 0, createdByRace: true });
        }
      }
    }

    // 6. Embed Race Item Document
    let embeddedId = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [embedded] = await actor.createEmbeddedDocuments('Item', [{
        name: def.name,
        type: 'race',
        img: def.img || 'icons/default-icons/ancestry.svg',
        system: {
          ...(def.system || {}),
          heritage: bonuses.heritage,
          size: bonuses.sizeRaw || `${bonuses.size} (4)`
        },
        flags: {
          'carl-rpg': {
            isAppliedRace: true
          }
        }
      }]);
      embeddedId = embedded?.id;
    }

    // 7. Store Applied Race Metadata Flag
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', 'appliedRace', {
        name: def.name,
        stats: bonuses.stats,
        skills: appliedSkills,
        spells: appliedSpells,
        size: bonuses.size,
        originalSize,
        itemId: embeddedId
      });
    }

    // 8. Commit Actor Updates
    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    if (globalThis.ui?.notifications) {
      globalThis.ui.notifications.info(`Applied Race "${def.name}" to ${actor.name}.`);
    }

    return true;
  }

  // =========================================================================
  // CLASS MUTATORS (APPLY & REVERSE)
  // =========================================================================

  /**
   * Reverses and removes the actor's current class benefits.
   *
   * @param {Actor} actor
   * @returns {Promise<boolean>}
   */
  static async removeClass(actor) {
    if (!actor) return false;

    // 1. Retrieve applied class metadata
    let applied = actor.getFlag?.('carl-rpg', 'appliedClass');
    const currentClassName = (actor.system?.details?.class || '').trim();

    // Fallback: If no flag exists but class detail string is set, look up definition to parse what to revert
    if (!applied && currentClassName) {
      const def = this.findClass(currentClassName);
      if (def) {
        const bonuses = this.parseClassBonuses(def);
        applied = {
          name: def.name,
          stats: bonuses.stats,
          skills: bonuses.skills.map(s => ({ name: s.name, rank: s.rank, createdByClass: true })),
          spells: bonuses.spells.map(sp => ({ name: sp.name, rank: sp.rank, createdByClass: true }))
        };
      }
    }

    if (!applied && !currentClassName) return false;

    const updates = {};
    updates['system.details.class'] = '';

    // 2. Revert Ability Stats
    if (applied?.stats) {
      for (const [stat, delta] of Object.entries(applied.stats)) {
        if (delta !== 0 && actor.system?.abilities?.[stat]) {
          const curVal = Number(actor.system.abilities[stat].value) || 10;
          const curUnenh = Number(actor.system.abilities[stat].unenhanced) ?? curVal;
          updates[`system.abilities.${stat}.value`] = curVal - delta;
          updates[`system.abilities.${stat}.unenhanced`] = curUnenh - delta;
        }
      }
    }

    // 3. Revert Skills
    if (Array.isArray(applied?.skills)) {
      const itemsToDelete = [];
      for (const s of applied.skills) {
        const skillItem = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
        if (skillItem) {
          const curRank = Number(skillItem.system?.rank) || 0;
          const remainingRank = curRank - (Number(s.rank) || 0);

          if (remainingRank > 0) {
            // Keep skill with non-item ranks intact!
            if (typeof skillItem.update === 'function') {
              await skillItem.update({ 'system.rank': remainingRank });
            }
          } else {
            // No non-item ranks remain: delete if granted by class or 0
            const wasCreated = s.createdByClass || (skillItem.getFlag?.('carl-rpg', 'grantedBy') === 'class');
            if (wasCreated && typeof actor.deleteEmbeddedDocuments === 'function') {
              itemsToDelete.push(skillItem.id);
            } else if (typeof skillItem.update === 'function') {
              await skillItem.update({ 'system.rank': Math.max(0, remainingRank) });
            }
          }
        }
      }
      if (itemsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
        await actor.deleteEmbeddedDocuments('Item', itemsToDelete);
      }
    }

    // 4. Revert Spells
    if (Array.isArray(applied?.spells)) {
      const spellsToDelete = [];
      for (const sp of applied.spells) {
        const spellItem = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
        if (spellItem) {
          const curRank = Number(spellItem.system?.rank) || 0;
          const remainingRank = curRank - (Number(sp.rank) || 0);
          if (remainingRank > 0) {
            if (typeof spellItem.update === 'function') {
              await spellItem.update({ 'system.rank': remainingRank });
            }
          } else {
            const wasCreated = sp.createdByClass || (spellItem.getFlag?.('carl-rpg', 'grantedBy') === 'class');
            if (wasCreated && typeof actor.deleteEmbeddedDocuments === 'function') {
              spellsToDelete.push(spellItem.id);
            } else if (typeof spellItem.update === 'function') {
              await spellItem.update({ 'system.rank': Math.max(0, remainingRank) });
            }
          }
        }
      }
      if (spellsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
        await actor.deleteEmbeddedDocuments('Item', spellsToDelete);
      }
    }

    // 5. Delete embedded Class Item documents
    const classItems = actor.items?.filter?.(i => i.type === 'class') || [];
    if (classItems.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', classItems.map(i => i.id));
    }

    // 6. Clear flag
    if (typeof actor.unsetFlag === 'function') {
      await actor.unsetFlag('carl-rpg', 'appliedClass');
    }

    // 7. Commit actor updates
    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    return true;
  }

  /**
   * Applies a new class to the actor, automatically reverting previous class benefits.
   *
   * @param {Actor} actor
   * @param {string} classIdentifier
   * @returns {Promise<boolean>}
   */
  static async applyClass(actor, classIdentifier) {
    if (!actor) return false;

    // Clearing class
    if (!classIdentifier) {
      await this.removeClass(actor);
      return true;
    }

    const def = this.findClass(classIdentifier);
    if (!def) {
      // Custom uncataloged name: simply update string
      await this.removeClass(actor);
      await actor.update?.({ 'system.details.class': classIdentifier });
      return true;
    }

    // 1. Revert previous class first
    await this.removeClass(actor);

    // 2. Parse new class bonuses
    const bonuses = this.parseClassBonuses(def);
    const updates = {};
    updates['system.details.class'] = def.name;

    // 3. Apply Stat Deltas
    for (const [stat, delta] of Object.entries(bonuses.stats)) {
      if (delta !== 0 && actor.system?.abilities?.[stat]) {
        const curVal = Number(actor.system.abilities[stat].value) || 10;
        const curUnenh = Number(actor.system.abilities[stat].unenhanced) ?? curVal;
        updates[`system.abilities.${stat}.value`] = curVal + delta;
        updates[`system.abilities.${stat}.unenhanced`] = curUnenh + delta;
      }
    }

    // 4. Apply Granted Skills
    const appliedSkills = [];
    for (const s of bonuses.skills) {
      const existing = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + s.rank });
        appliedSkills.push({ id: existing.id, name: existing.name, rank: s.rank, preExistingRank: curRank, createdByClass: false });
      } else {
        const skillDoc = DCC_SKILLS.find(sk => normalizeKey(sk.name) === normalizeKey(s.name));
        if (typeof actor.createEmbeddedDocuments === 'function') {
          const [created] = await actor.createEmbeddedDocuments('Item', [{
            name: s.name,
            type: 'skill',
            img: skillDoc?.img || 'icons/svg/sword.svg',
            system: {
              rank: s.rank,
              stat: skillDoc?.system?.stat || 'str',
              skillType: skillDoc?.system?.skillType || 'Utility',
              category: skillDoc?.system?.category || 'Combat',
              isPassive: Boolean(s.isPassive)
            },
            flags: {
              'carl-rpg': {
                grantedBy: 'class'
              }
            }
          }]);
          appliedSkills.push({ id: created?.id, name: s.name, rank: s.rank, preExistingRank: 0, createdByClass: true });
        }
      }
    }

    // 5. Apply Granted Spells
    const appliedSpells = [];
    for (const sp of bonuses.spells) {
      const existing = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + sp.rank });
        appliedSpells.push({ id: existing.id, name: existing.name, rank: sp.rank, preExistingRank: curRank, createdByClass: false });
      } else {
        const spellDoc = DCC_SPELLS.find(spd => normalizeKey(spd.name) === normalizeKey(sp.name));
        if (typeof actor.createEmbeddedDocuments === 'function') {
          const [created] = await actor.createEmbeddedDocuments('Item', [{
            name: sp.name,
            type: 'spell',
            img: spellDoc?.img || 'icons/svg/lightning.svg',
            system: {
              rank: sp.rank,
              mpCost: spellDoc?.system?.mpCost || sp.mpCost || 0
            },
            flags: {
              'carl-rpg': {
                grantedBy: 'class'
              }
            }
          }]);
          appliedSpells.push({ id: created?.id, name: sp.name, rank: sp.rank, preExistingRank: 0, createdByClass: true });
        }
      }
    }

    // 6. Embed Class Item Document
    let embeddedId = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [embedded] = await actor.createEmbeddedDocuments('Item', [{
        name: def.name,
        type: 'class',
        img: def.img || 'icons/default-icons/class.svg',
        system: {
          ...(def.system || {}),
          classType: bonuses.classType
        },
        flags: {
          'carl-rpg': {
            isAppliedClass: true
          }
        }
      }]);
      embeddedId = embedded?.id;
    }

    // 7. Store Applied Class Metadata Flag
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', 'appliedClass', {
        name: def.name,
        stats: bonuses.stats,
        skills: appliedSkills,
        spells: appliedSpells,
        itemId: embeddedId
      });
    }

    // 8. Commit Actor Updates
    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    if (globalThis.ui?.notifications) {
      globalThis.ui.notifications.info(`Applied Class "${def.name}" to ${actor.name}.`);
    }

    return true;
  }
}
