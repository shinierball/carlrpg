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
    .replace(/\+\s+(\d+)/g, '+$1')
    .replace(/-\s+(\d+)/g, '-$1')
    .replace(/Sk\s*ills?/gi, 'Skill')
    .replace(/Spe\s*lls?/gi, 'Spell')
    .replace(/Ear\s*th/gi, 'Earth')
    .replace(/Rag\s*e/gi, 'Rage')
    .replace(/Arc\s*anist/gi, 'Arcanist')
    .replace(/Alchem\s*y/gi, 'Alchemy')
    .replace(/Smithin\s*g/gi, 'Smithing')
    .replace(/Ta\s*ttoo/gi, 'Tattoo')
    .replace(/cr\s*afting/gi, 'crafting')
    .replace(/Salv\s*age/gi, 'Salvage')
    .replace(/Intimida\s*te/gi, 'Intimidate')
    .replace(/Att\s*ack/gi, 'Attack')
    .replace(/Dodg\s*e/gi, 'Dodge')
    .replace(/Bloc\s*k/gi, 'Block')
    .replace(/gr\s*ant/gi, 'grant')
    .replace(/siz\s*e/gi, 'size')
    .replace(/r\s*oom/gi, 'room')
    .replace(/interes\s*t/gi, 'interest')
    .replace(/s\s*tores/gi, 'stores')
    .replace(/Manag\s*er/gi, 'Manager')
    .replace(/Pet\s*s/gi, 'Pets')
    .replace(/friendl\s*y/gi, 'friendly')
    .replace(/re\s*generation/gi, 'regeneration')
    .replace(/t\s*wice/gi, 'twice')
    .replace(/c\s*an/gi, 'can')
    .replace(/Collec\s*tor/gi, 'Collector')
    .replace(/res\s*t/gi, 'rest')
    .replace(/da\s*y/gi, 'day')
    .replace(/Whenev\s*er/gi, 'Whenever')
    .replace(/ag\s*ainst/gi, 'against')
    .replace(/Ether\s*eal/gi, 'Ethereal')
    .replace(/St\s*at/gi, 'Stat')
    .replace(/g\s*ain/gi, 'gain')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a parsed skill name against canonical DCC_SKILLS.
 */
export function matchKnownSkill(raw) {
  let clean = String(raw || '').trim().replace(/^and\s+/i, '').replace(/\s+Attack$/i, '').trim();
  clean = clean.replace(/\s*\(.*?\)/g, '').trim();
  const norm = normalizeKey(clean);
  const found = DCC_SKILLS.find(s => normalizeKey(s.name) === norm);
  return found ? found.name : clean;
}

/**
 * Normalizes a parsed spell name against canonical DCC_SPELLS.
 */
export function matchKnownSpell(raw) {
  let clean = String(raw || '').trim().replace(/^and\s+/i, '').trim();
  clean = clean.replace(/\s*\(.*?\)/g, '').trim();
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
      const m = p.match(/^([+\-]\s*\d+)\s+(?:to\s+)?([A-Za-z,\s]+?)(?:\s+(?:Skills?|Spells?|table|Buff|DR|\(benefit\)|table of your choice))?(?:\s*\(.*?\))?$/i);
      if (m) {
        const val = parseInt(m[1].replace(/\s+/g, ''), 10);
        const wordsStr = m[2];
        const words = wordsStr.split(/(?:,\s*(?:and\s+)?|\s+and\s+)/i).map(w => w.replace(/^and\s+/i, '').trim().toLowerCase());
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
      const spellMatch = p.match(/^\+(\d+)\s+(?:in\s+)?([A-Za-z0-9\s,\u0027’\-!]+?)\s+Spells?/i);
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
      const skillMatch = p.match(/^\+(\d+)\s+(?:in\s+)?([A-Za-z0-9\s,\u0027’\-]+?)\s+Skills?/i);
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
   * Parses passive Damage Resistance/Reduction from definition.
   */
  static parseDR(data) {
    if (data?.system?.drBonus !== undefined && data.system.drBonus !== null && Number(data.system.drBonus) > 0) {
      return Number(data.system.drBonus);
    }
    if (data?.drBonus !== undefined && data.drBonus !== null && Number(data.drBonus) > 0) {
      return Number(data.drBonus);
    }

    const perks = Array.isArray(data?.system?.perks)
      ? data.system.perks
      : (Array.isArray(data?.perks) ? data.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);
      const m = p.match(/^\+(\d+)\s+DR(?:\s+Buff)?/i) || p.match(/^\+(\d+)\s+Damage\s+Reduction/i);
      if (m) {
        return parseInt(m[1], 10);
      }
    }
    return 0;
  }

  /**
   * Parses movement deltas and special movement modes (climb, swim, fly, burrow).
   */
  static parseMovement(data) {
    const move = { walkDelta: 0, climb: 0, swim: 0, fly: 0, burrow: 0 };

    if (data?.system?.movement && typeof data.system.movement === 'object') {
      if (data.system.movement.walkDelta) move.walkDelta = Number(data.system.movement.walkDelta) || 0;
      if (data.system.movement.climb) move.climb = Number(data.system.movement.climb) || 0;
      if (data.system.movement.swim) move.swim = Number(data.system.movement.swim) || 0;
      if (data.system.movement.fly) move.fly = Number(data.system.movement.fly) || 0;
      if (data.system.movement.burrow) move.burrow = Number(data.system.movement.burrow) || 0;
      return move;
    }

    const perks = Array.isArray(data?.system?.perks)
      ? data.system.perks
      : (Array.isArray(data?.perks) ? data.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);
      const walkMatch = p.match(/^\+(\d+)ft\s+Move/i);
      if (walkMatch) {
        move.walkDelta += parseInt(walkMatch[1], 10);
      }
      if (/\bclimb\b/i.test(p) && !/Skill/i.test(p)) {
        move.climb = 20;
      }
      if (/\bswim\b/i.test(p) && !/Skill/i.test(p)) {
        move.swim = 20;
      }
      if (/\bburrow\b/i.test(p)) {
        move.burrow = 20;
      }
      if (/\b(flight|fly|wings capable of flight)\b/i.test(p) && !/Spell/i.test(p)) {
        move.fly = 20;
      }
    }

    return move;
  }

  /**
   * Parses Advantage (Buffs) and Disadvantage (Debuffs) conditions from perks.
   */
  static parseConditions(data, type = 'race') {
    const buffs = [];
    const debuffs = [];

    const perks = Array.isArray(data?.system?.perks)
      ? data.system.perks
      : (Array.isArray(data?.perks) ? data.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);

      // Advantage -> Custom Buff item
      if (/\bAdvantage\b/i.test(p) && !/\bDisadvantage\b/i.test(p) && !/Troll-?type enemies have Advantage/i.test(p)) {
        let title = 'Advantage on Checks';
        const pLower = p.toLowerCase();
        if (pLower.includes('cat-like reflexes')) title = 'Advantage: Feline Reflexes';
        else if (pLower.includes('deception')) title = 'Advantage: Silent Deception';
        else if (pLower.includes('intimidat')) title = 'Advantage: Menacing Presence';
        else if (pLower.includes('escape artist')) title = 'Advantage: Slippery Contortionist';
        else if (pLower.includes('earth') || pLower.includes('dirt')) title = 'Advantage: Earthen Affinity';
        else if (pLower.includes('settlement')) title = 'Advantage: Cosmopolitan Charm';
        else if (pLower.includes('int and con')) title = 'Advantage: Glacial Fortitude';
        else if (pLower.includes('advancement')) title = 'Advantage: Skill Advancement';
        else if (pLower.includes('ambush')) title = 'Advantage: Volcanic Ambush & Intimidation';
        else if (pLower.includes('fear') || pLower.includes('respect')) title = 'Advantage: Ferocious Visage';
        else if (pLower.includes('hunger') || pLower.includes('thirst')) title = 'Advantage: Scavenger Guts';
        else if (pLower.includes('charisma')) title = 'Advantage: Unbearably Cute';
        else if (pLower.includes('perception')) title = 'Advantage: Raptor Vision';
        else if (pLower.includes('poison') || pLower.includes('shit-faced')) title = 'Advantage: Cast Iron Liver';
        else if (pLower.includes('repair')) title = 'Advantage: Roadie Rigging';
        else if (pLower.includes('higher position') || pLower.includes('higher ground')) title = 'Advantage: High Ground Bravado';
        else if (pLower.includes('elemental creatures')) title = 'Advantage: Elemental Attunement';
        else title = `Advantage: ${p.slice(0, 40)}`;

        buffs.push({
          name: title,
          type: 'buff',
          img: 'icons/svg/aura.svg',
          system: {
            buffType: 'special',
            duration: `Permanent (${type === 'race' ? 'Racial' : 'Class'})`,
            description: `<p><strong>Advantage</strong>: ${p}</p>`
          },
          flags: {
            'carl-rpg': {
              grantedBy: type,
              sourceName: data.name,
              isAdvantage: true,
              condition: p
            }
          }
        });
      }

      // Disadvantage -> Custom Debuff item
      if (/\bDisadvantage\b/i.test(p) || /Troll-?type enemies have Advantage/i.test(p)) {
        let title = 'Disadvantage on Checks';
        const pLower = p.toLowerCase();
        if (pLower.includes('felines')) title = 'Disadvantage: Uncanny Feline Valley';
        else if (pLower.includes('fatigued')) title = 'Disadvantage: Cold-Blooded Torpor';
        else if (pLower.includes('elves') || pLower.includes('fairies')) title = 'Disadvantage: Ancient Grudge';
        else if (pLower.includes('dwarves') || pLower.includes('rat-kin')) title = 'Disadvantage: Highborn Arrogance';
        else if (pLower.includes('conceal') || pLower.includes('stealth')) title = 'Disadvantage: Smoldering Presence';
        else if (pLower.includes('fine manipulation') || pLower.includes('motor coordination')) title = 'Disadvantage: Clawed Clumsiness';
        else if (pLower.includes('wrasslin') || pLower.includes('troll')) title = 'Disadvantage: Troll Bait';
        else title = `Disadvantage: ${p.slice(0, 40)}`;

        debuffs.push({
          name: title,
          type: 'debuff',
          img: 'icons/svg/downgrade.svg',
          system: {
            severity: 'Minor',
            duration: `Permanent (${type === 'race' ? 'Racial' : 'Class'})`,
            description: `<p><strong>Disadvantage</strong>: ${p}</p>`
          },
          flags: {
            'carl-rpg': {
              grantedBy: type,
              sourceName: data.name,
              isDisadvantage: true,
              condition: p
            }
          }
        });
      }
    }

    return { buffs, debuffs };
  }

  /**
   * Fully decomposes a race definition into applied bonuses.
   */
  static parseRaceBonuses(raceDef) {
    if (!raceDef) return null;
    const stats = this.parseStats(raceDef);
    const { skills, spells } = this.parseSkillsAndSpells(raceDef);
    const drBonus = this.parseDR(raceDef);
    const movement = this.parseMovement(raceDef);
    const conditions = this.parseConditions(raceDef, 'race');
    const size = raceDef.system?.size || 'Medium (4)';
    const parsedSize = getSizeInfo(size);

    return {
      name: raceDef.name,
      heritage: raceDef.system?.heritage || 'Earth',
      size: parsedSize.name || 'Medium',
      sizeRaw: size,
      stats,
      skills,
      spells,
      drBonus,
      movement,
      conditions
    };
  }

  /**
   * Fully decomposes a class definition into applied bonuses.
   */
  static parseClassBonuses(classDef) {
    if (!classDef) return null;
    const stats = this.parseStats(classDef);
    const { skills, spells } = this.parseSkillsAndSpells(classDef);
    const drBonus = this.parseDR(classDef);
    const movement = this.parseMovement(classDef);
    const conditions = this.parseConditions(classDef, 'class');
    const classType = classDef.system?.classType || 'Fighter';

    return {
      name: classDef.name,
      classType,
      stats,
      skills,
      spells,
      drBonus,
      movement,
      conditions
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

    // 4. Revert DR
    if (applied?.drBonus) {
      const curDR = Number(actor.system?.attributes?.dr?.buffs) || 0;
      updates['system.attributes.dr.buffs'] = Math.max(0, curDR - applied.drBonus);
    }

    // 5. Revert Movement
    if (applied?.movement) {
      if (applied.movement.walkDelta) {
        const curMove = Number(actor.system?.attributes?.speed?.move) || 20;
        updates['system.attributes.speed.move'] = curMove - applied.movement.walkDelta;
      }
      if (applied.movement.climb) updates['system.attributes.speed.climb'] = 0;
      if (applied.movement.swim) updates['system.attributes.speed.swim'] = 0;
      if (applied.movement.fly) updates['system.attributes.speed.fly'] = 0;
      if (applied.movement.burrow) updates['system.attributes.speed.burrow'] = 0;
    }

    // 6. Delete Condition Items (Buffs & Debuffs)
    const condIdsToDelete = [];
    if (Array.isArray(applied?.conditionItemIds)) {
      condIdsToDelete.push(...applied.conditionItemIds);
    }
    if (actor.items) {
      for (const item of actor.items) {
        if (['buff', 'debuff'].includes(item.type) && item.getFlag?.('carl-rpg', 'grantedBy') === 'race') {
          if (!condIdsToDelete.includes(item.id)) condIdsToDelete.push(item.id);
        }
      }
    }
    if (condIdsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', condIdsToDelete);
    }

    // 7. Revert Skills
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

    // 8. Revert Spells
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

    // 9. Delete embedded Race Item documents
    const raceItems = actor.items?.filter?.(i => i.type === 'race') || [];
    if (raceItems.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', raceItems.map(i => i.id));
    }

    // 10. Clear flag
    if (typeof actor.unsetFlag === 'function') {
      await actor.unsetFlag('carl-rpg', 'appliedRace');
    }

    // 11. Commit actor updates
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

    // 4. Apply DR
    if (bonuses.drBonus) {
      const curDR = Number(actor.system?.attributes?.dr?.buffs) || 0;
      updates['system.attributes.dr.buffs'] = curDR + bonuses.drBonus;
    }

    // 5. Apply Movement
    if (bonuses.movement) {
      if (bonuses.movement.walkDelta) {
        const curMove = Number(actor.system?.attributes?.speed?.move) || 20;
        updates['system.attributes.speed.move'] = curMove + bonuses.movement.walkDelta;
      }
      if (bonuses.movement.climb) updates['system.attributes.speed.climb'] = bonuses.movement.climb;
      if (bonuses.movement.swim) updates['system.attributes.speed.swim'] = bonuses.movement.swim;
      if (bonuses.movement.fly) updates['system.attributes.speed.fly'] = bonuses.movement.fly;
      if (bonuses.movement.burrow) updates['system.attributes.speed.burrow'] = bonuses.movement.burrow;
    }

    // 6. Apply Granted Skills
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
              skillType: skillDoc?.system?.skillType || skillDoc?.system?.type || 'Utility',
              type: skillDoc?.system?.type || skillDoc?.system?.skillType || 'Utility',
              category: skillDoc?.system?.category || 'Combat',
              notes: skillDoc?.system?.notes || '',
              upgrades: skillDoc?.system?.upgrades || '',
              isPassive: Boolean(s.isPassive || skillDoc?.system?.isPassive)
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

    // 7. Apply Granted Spells
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
              stat: spellDoc?.system?.stat || 'int',
              manaCost: spellDoc?.system?.manaCost || sp.mpCost || 0,
              range: spellDoc?.system?.range || 'Self',
              duration: spellDoc?.system?.duration || 'Instantaneous',
              spellType: spellDoc?.system?.spellType || 'Attack',
              description: spellDoc?.system?.description || ''
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

    // 8. Apply Advantage & Disadvantage as Custom Buffs & Debuffs
    const conditionItemsToCreate = [
      ...(bonuses.conditions?.buffs || []),
      ...(bonuses.conditions?.debuffs || [])
    ];
    const createdConditionIds = [];
    if (conditionItemsToCreate.length > 0 && typeof actor.createEmbeddedDocuments === 'function') {
      const created = await actor.createEmbeddedDocuments('Item', conditionItemsToCreate);
      for (const doc of (created || [])) {
        if (doc?.id) createdConditionIds.push(doc.id);
      }
    }

    // 9. Embed Race Item Document
    let embeddedId = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [embedded] = await actor.createEmbeddedDocuments('Item', [{
        name: def.name,
        type: 'race',
        img: def.img || 'icons/default-icons/ancestry.svg',
        system: {
          ...(def.system || {}),
          heritage: bonuses.heritage,
          size: bonuses.sizeRaw || `${bonuses.size} (4)`,
          drBonus: bonuses.drBonus,
          movement: bonuses.movement,
          stats: bonuses.stats
        },
        flags: {
          'carl-rpg': {
            isAppliedRace: true
          }
        }
      }]);
      embeddedId = embedded?.id;
    }

    // 10. Store Applied Race Metadata Flag
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', 'appliedRace', {
        name: def.name,
        stats: bonuses.stats,
        drBonus: bonuses.drBonus,
        movement: bonuses.movement,
        conditionItemIds: createdConditionIds,
        skills: appliedSkills,
        spells: appliedSpells,
        size: bonuses.size,
        originalSize,
        itemId: embeddedId
      });
    }

    // 11. Commit Actor Updates
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

    // 3. Revert DR
    if (applied?.drBonus) {
      const curDR = Number(actor.system?.attributes?.dr?.buffs) || 0;
      updates['system.attributes.dr.buffs'] = Math.max(0, curDR - applied.drBonus);
    }

    // 4. Revert Movement
    if (applied?.movement) {
      if (applied.movement.walkDelta) {
        const curMove = Number(actor.system?.attributes?.speed?.move) || 20;
        updates['system.attributes.speed.move'] = curMove - applied.movement.walkDelta;
      }
      if (applied.movement.climb) updates['system.attributes.speed.climb'] = 0;
      if (applied.movement.swim) updates['system.attributes.speed.swim'] = 0;
      if (applied.movement.fly) updates['system.attributes.speed.fly'] = 0;
      if (applied.movement.burrow) updates['system.attributes.speed.burrow'] = 0;
    }

    // 5. Delete Condition Items (Buffs & Debuffs)
    const condIdsToDelete = [];
    if (Array.isArray(applied?.conditionItemIds)) {
      condIdsToDelete.push(...applied.conditionItemIds);
    }
    if (actor.items) {
      for (const item of actor.items) {
        if (['buff', 'debuff'].includes(item.type) && item.getFlag?.('carl-rpg', 'grantedBy') === 'class') {
          if (!condIdsToDelete.includes(item.id)) condIdsToDelete.push(item.id);
        }
      }
    }
    if (condIdsToDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', condIdsToDelete);
    }

    // 6. Revert Skills
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

    // 7. Revert Spells
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

    // 8. Delete embedded Class Item documents
    const classItems = actor.items?.filter?.(i => i.type === 'class') || [];
    if (classItems.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', classItems.map(i => i.id));
    }

    // 9. Clear flag
    if (typeof actor.unsetFlag === 'function') {
      await actor.unsetFlag('carl-rpg', 'appliedClass');
    }

    // 10. Commit actor updates
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

    // 4. Apply DR
    if (bonuses.drBonus) {
      const curDR = Number(actor.system?.attributes?.dr?.buffs) || 0;
      updates['system.attributes.dr.buffs'] = curDR + bonuses.drBonus;
    }

    // 5. Apply Movement
    if (bonuses.movement) {
      if (bonuses.movement.walkDelta) {
        const curMove = Number(actor.system?.attributes?.speed?.move) || 20;
        updates['system.attributes.speed.move'] = curMove + bonuses.movement.walkDelta;
      }
      if (bonuses.movement.climb) updates['system.attributes.speed.climb'] = bonuses.movement.climb;
      if (bonuses.movement.swim) updates['system.attributes.speed.swim'] = bonuses.movement.swim;
      if (bonuses.movement.fly) updates['system.attributes.speed.fly'] = bonuses.movement.fly;
      if (bonuses.movement.burrow) updates['system.attributes.speed.burrow'] = bonuses.movement.burrow;
    }

    // 6. Apply Granted Skills
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
              skillType: skillDoc?.system?.skillType || skillDoc?.system?.type || 'Utility',
              type: skillDoc?.system?.type || skillDoc?.system?.skillType || 'Utility',
              category: skillDoc?.system?.category || 'Combat',
              notes: skillDoc?.system?.notes || '',
              upgrades: skillDoc?.system?.upgrades || '',
              isPassive: Boolean(s.isPassive || skillDoc?.system?.isPassive)
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

    // 7. Apply Granted Spells
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
              stat: spellDoc?.system?.stat || 'int',
              manaCost: spellDoc?.system?.manaCost || sp.mpCost || 0,
              range: spellDoc?.system?.range || 'Self',
              duration: spellDoc?.system?.duration || 'Instantaneous',
              spellType: spellDoc?.system?.spellType || 'Attack',
              description: spellDoc?.system?.description || ''
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

    // 8. Apply Advantage & Disadvantage as Custom Buffs & Debuffs
    const conditionItemsToCreate = [
      ...(bonuses.conditions?.buffs || []),
      ...(bonuses.conditions?.debuffs || [])
    ];
    const createdConditionIds = [];
    if (conditionItemsToCreate.length > 0 && typeof actor.createEmbeddedDocuments === 'function') {
      const created = await actor.createEmbeddedDocuments('Item', conditionItemsToCreate);
      for (const doc of (created || [])) {
        if (doc?.id) createdConditionIds.push(doc.id);
      }
    }

    // 9. Embed Class Item Document
    let embeddedId = null;
    if (typeof actor.createEmbeddedDocuments === 'function') {
      const [embedded] = await actor.createEmbeddedDocuments('Item', [{
        name: def.name,
        type: 'class',
        img: def.img || 'icons/default-icons/class.svg',
        system: {
          ...(def.system || {}),
          classType: bonuses.classType,
          drBonus: bonuses.drBonus,
          movement: bonuses.movement,
          stats: bonuses.stats
        },
        flags: {
          'carl-rpg': {
            isAppliedClass: true
          }
        }
      }]);
      embeddedId = embedded?.id;
    }

    // 10. Store Applied Class Metadata Flag
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', 'appliedClass', {
        name: def.name,
        stats: bonuses.stats,
        drBonus: bonuses.drBonus,
        movement: bonuses.movement,
        conditionItemIds: createdConditionIds,
        skills: appliedSkills,
        spells: appliedSpells,
        itemId: embeddedId
      });
    }

    // 11. Commit Actor Updates
    if (Object.keys(updates).length > 0 && typeof actor.update === 'function') {
      await actor.update(updates);
    }

    if (globalThis.ui?.notifications) {
      globalThis.ui.notifications.info(`Applied Class "${def.name}" to ${actor.name}.`);
    }

    return true;
  }
}
