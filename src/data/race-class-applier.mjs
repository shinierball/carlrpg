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
    .replace(/craft\s*ing/gi, 'crafting')
    .replace(/c\s*hoice/gi, 'choice')
    .replace(/differ\s*ent/gi, 'different')
    .replace(/We\s*apon/gi, 'Weapon')
    .replace(/we\s*apon/gi, 'weapon')
    .replace(/Edg\s*ed/gi, 'Edged')
    .replace(/Cont\s*rol/gi, 'Control')
    .replace(/Cat\s*cher/gi, 'Catcher')
    .replace(/Acut\s*e/gi, 'Acute')
    .replace(/Shadow\s*s/gi, 'Shadows')
    .replace(/Fir\s*st/gi, 'First')
    .replace(/bre\s*astplate/gi, 'breastplate')
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
    .replace(/per\s+da\s*y/gi, 'per day')
    .replace(/da\s*y/gi, 'day')
    .replace(/\bt\s*he\b/gi, 'the')
    .replace(/Ac\s*cess/gi, 'access')
    .replace(/bur\s*st/gi, 'burst')
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
  let clean = String(raw || '').trim().replace(/^(?:and|or)\s+/i, '').replace(/\s+Attack$/i, '').trim();
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
        if (s.name && s.rank && !s.name.includes('(Choice)')) {
          skills.push({ name: s.name, rank: Number(s.rank) || 1, isPassive: Boolean(s.isPassive) });
        }
      }
    }
    if (Array.isArray(data?.system?.spells) && data.system.spells.length > 0) {
      for (const sp of data.system.spells) {
        if (sp.name && sp.rank && !sp.name.includes('(Choice)')) {
          spells.push({ name: sp.name, rank: Number(sp.rank) || 1, mpCost: Number(sp.mpCost) || 0 });
        }
      }
    }

    // Include chosenSkills & chosenSpells already attached to the definition
    if (Array.isArray(data?.system?.chosenSkills)) {
      for (const cs of data.system.chosenSkills) {
        if (cs.name && cs.rank && !skills.some(s => normalizeKey(s.name) === normalizeKey(cs.name))) {
          skills.push({ name: cs.name, rank: Number(cs.rank) || 1, isPassive: Boolean(cs.isPassive) });
        }
      }
    }
    if (Array.isArray(data?.system?.chosenSpells)) {
      for (const csp of data.system.chosenSpells) {
        if (csp.name && csp.rank && !spells.some(s => normalizeKey(s.name) === normalizeKey(csp.name))) {
          spells.push({ name: csp.name, rank: Number(csp.rank) || 1, mpCost: Number(csp.mpCost) || 0 });
        }
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

      // Skip lines that deal with popularity, not skill grants
      if (p.includes('popularity')) continue;

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

      // Check for compound perk: "+2 Zone of Control and a Reach weapon Skill of your choice"
      if (p.includes('Zone of Control and a Reach weapon Skill of your choice')) {
        const rankMatch = p.match(/^\+(\d+)/);
        const rank = rankMatch ? parseInt(rankMatch[1], 10) : 2;
        skills.push({ name: 'Zone of Control', rank });
        continue;
      }

      // Skip lines that represent skill/spell choices (handled via detectChoices & wizard)
      if (
        p.includes('of your choice') ||
        p.includes('of the following') ||
        /^\+\d+\s+in\s+either\b/i.test(p) ||
        /^\+\d+\s+[A-Za-z\s]+?\s+or\s+[A-Za-z\s]+?\s+Skills?$/i.test(p)
      ) {
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
            !sk.toLowerCase().includes('different') &&
            !sk.toLowerCase().includes('crafting') &&
            !sk.toLowerCase().includes('either') &&
            !sk.toLowerCase().includes(' or ')
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
   * Extracts benefits/perks and detriments from a race or class definition.
   *
   * @param {object} def
   * @returns {{ perks: string[], detriments: string[] }}
   */
  static extractPerksAndDetriments(def) {
    if (!def) return { perks: [], detriments: [] };

    // 1. Explicit arrays if defined on system or root
    const explicitDetriments = Array.isArray(def.system?.detriments)
      ? def.system.detriments
      : (Array.isArray(def.detriments) ? def.detriments : null);

    const explicitPerks = Array.isArray(def.system?.perks)
      ? def.system.perks
      : (Array.isArray(def.perks) ? def.perks : null);

    if (explicitDetriments && explicitDetriments.length > 0) {
      return {
        perks: (explicitPerks || []).map(p => typeof p === 'string' ? cleanOCRText(p) : (p?.name || String(p))),
        detriments: explicitDetriments.map(d => typeof d === 'string' ? cleanOCRText(d) : (d?.name || String(d)))
      };
    }

    // 2. Builder data (selectedBenefits, customBenefits, selectedDetriments, customDetriments)
    const bBenefits = def.selectedBenefits || def.system?.selectedBenefits;
    const bCustomBen = def.customBenefits || def.system?.customBenefits;
    const bDetriments = def.selectedDetriments || def.system?.selectedDetriments;
    const bCustomDet = def.customDetriments || def.system?.customDetriments;

    if (bBenefits || bCustomBen || bDetriments || bCustomDet) {
      const perks = [
        ...(bBenefits || []).map(b => b.customText || b.name),
        ...(bCustomBen || []).map(cb => cb.name)
      ];
      const detriments = [
        ...(bDetriments || []).map(d => d.customText || d.name),
        ...(bCustomDet || []).map(cd => cd.name)
      ];
      return { perks, detriments };
    }

    // 3. Parse from raw perks array (canonical definitions)
    const perks = [];
    const detriments = [];
    const rawList = explicitPerks || [];

    for (const raw of rawList) {
      const line = cleanOCRText(typeof raw === 'string' ? raw : (raw?.name || ''));
      if (!line) continue;

      // Skip pure stat modifiers (e.g. +6 Strength, -4 Constitution, Split +6 between...)
      if (/^[+-]\d+\s+(Strength|Dexterity|Constitution|Intelligence|Charisma)\b/i.test(line)) continue;
      if (/^Split\s+\+\d+\s+between/i.test(line)) continue;
      if (/^Flexible\s+\+\d+/i.test(line)) continue;
      if (/^[+-]\d+\s+to\s+(all\s+)?(abilities|stats)\b/i.test(line)) continue;

      // Skip pure choices (handled by detectChoices)
      if (/^[+-]\d+\s+in\s+(one|two|\d+|an?)\s+.*?\s+of\s+your\s+choice/i.test(line)) continue;
      if (line.includes('(Choice)')) continue;

      // Skip pure DR lines
      if (/^[+-]\d+\s+DR(\s+Buff)?$/i.test(line)) continue;

      // Skip pure skill grants (unless describing conditional advantage/popularity)
      if (/^[+-]\d+\s+.*?(Skills?|Skill\s+Check)\b/i.test(line) && !line.includes('Advantage') && !line.includes('Disadvantage') && !line.includes('popularity')) {
        continue;
      }

      // Skip pure spell grants
      if (/^[+-]\d+\s+.*?Spell\b/i.test(line) && !line.includes('Advantage') && !line.includes('Disadvantage')) {
        continue;
      }

      // Handle compound perk + detriment line (e.g., "Immunity to Fire damage, and vulnerable to Ice damage")
      if (/Immunity to Fire.*?vulnerable to Ice/i.test(line)) {
        perks.push('Immunity to Fire damage');
        detriments.push('Vulnerable to Ice damage');
        continue;
      }

      // Handle split day / night mechanics
      if (/during\s+the\s+day,\s*Strength is halved,\s*but Spells cost half the Mana/i.test(line)) {
        detriments.push('During the day, Strength is halved');
        perks.push('During the day, Spells cost half the Mana to cast');
        continue;
      }
      if (/during\s+the\s+night,\s*Strength is doubled,\s*but Spells cost double the Mana/i.test(line)) {
        perks.push('During the night, Strength is doubled');
        detriments.push('During the night, Spells cost double the Mana to cast');
        continue;
      }

      // Detriment detection
      const isDetriment = /\b(vulnerab\w*|disadvantage|penalty|cannot|prohibited|lose\s+\d+\s+health|halved|weakness|decrease|bait)\b/i.test(line)
        || /Troll-?type enemies have Advantage/i.test(line);

      if (isDetriment) {
        detriments.push(line);
      } else {
        perks.push(line);
      }
    }

    return { perks, detriments };
  }

  /**
   * Parses Advantage (Buffs) and Disadvantage (Debuffs) conditions and general perk/detriment items.
   */
  static parseConditions(data, type = 'race', options = {}) {
    const buffs = [];
    const debuffs = [];

    const { perks: allPerks, detriments: allDetriments } = this.extractPerksAndDetriments(data);
    const activePerks = options.chosenPerks || data?.system?.chosenPerks || data?.chosenPerks || allPerks;
    const activeDetriments = options.chosenDetriments || data?.system?.chosenDetriments || data?.chosenDetriments || allDetriments;

    for (const raw of activePerks) {
      const p = cleanOCRText(raw);
      if (!p) continue;

      // Skip lines that represent stat bonuses, DR, granted skills, granted spells, movement, or size
      if (/^[+-]?\d+\s+(Strength|Dexterity|Constitution|Intelligence|Charisma)\b/i.test(p)) continue;
      if (/^[+-]?\d+\s*(Damage Reduction|DR)\b/i.test(p) || /Damage Reduction\s*\(DR\)/i.test(p)) continue;
      if (/^\+?\d+ft\s+Move/i.test(p)) continue;
      if (/\bSkills?(\b|$)/i.test(p) && /^[+-]?\d+/i.test(p)) continue;
      if (/\bSpells?(\b|$)/i.test(p) && /^[+-]?\d+/i.test(p)) continue;
      if (/^Size\s+\d+/i.test(p)) continue;

      // Advantage / Resistance / Immunity -> Custom Buff item
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
              sourceName: data?.name || '',
              isAdvantage: true,
              isPerk: true,
              condition: p
            }
          }
        });
      } else if (/\b(Immunity|Resistance)\b/i.test(p)) {
        let cleanTitle = p.split(':')[0].trim();
        if (cleanTitle.length > 40) cleanTitle = cleanTitle.slice(0, 37).trim() + '...';

        buffs.push({
          name: cleanTitle,
          type: 'buff',
          img: 'icons/svg/aura.svg',
          system: {
            buffType: 'special',
            duration: `Permanent (${type === 'race' ? 'Racial' : 'Class'})`,
            description: `<p><strong>${type === 'race' ? 'Racial Perk' : 'Class Feature'}</strong>: ${p}</p>`
          },
          flags: {
            'carl-rpg': {
              grantedBy: type,
              sourceName: data?.name || '',
              isPerk: true,
              condition: p
            }
          }
        });
      }
    }

    for (const raw of activeDetriments) {
      const d = cleanOCRText(raw);
      if (!d) continue;

      // Skip lines that represent stat bonuses, DR, granted skills, granted spells, movement, or size
      if (/^[+-]?\d+\s+(Strength|Dexterity|Constitution|Intelligence|Charisma)\b/i.test(d)) continue;
      if (/^[+-]?\d+\s*(Damage Reduction|DR)\b/i.test(d) || /Damage Reduction\s*\(DR\)/i.test(d)) continue;
      if (/^\+?\d+ft\s+Move/i.test(d)) continue;
      if (/\bSkills?(\b|$)/i.test(d) && /^[+-]?\d+/i.test(d)) continue;
      if (/\bSpells?(\b|$)/i.test(d) && /^[+-]?\d+/i.test(d)) continue;
      if (/^Size\s+\d+/i.test(d)) continue;

      // Disadvantage / Vulnerability -> Custom Debuff item
      if (/\bDisadvantage\b/i.test(d) || /Troll-?type enemies have Advantage/i.test(d)) {
        let title = 'Disadvantage on Checks';
        const dLower = d.toLowerCase();
        if (dLower.includes('felines')) title = 'Disadvantage: Uncanny Feline Valley';
        else if (dLower.includes('fatigued')) title = 'Disadvantage: Cold-Blooded Torpor';
        else if (dLower.includes('elves') || dLower.includes('fairies')) title = 'Disadvantage: Ancient Grudge';
        else if (dLower.includes('dwarves') || dLower.includes('rat-kin')) title = 'Disadvantage: Highborn Arrogance';
        else if (dLower.includes('conceal') || dLower.includes('stealth')) title = 'Disadvantage: Smoldering Presence';
        else if (dLower.includes('fine manipulation') || dLower.includes('motor coordination')) title = 'Disadvantage: Clawed Clumsiness';
        else if (dLower.includes('wrasslin') || dLower.includes('troll')) title = 'Disadvantage: Troll Bait';
        else title = `Disadvantage: ${d.slice(0, 40)}`;

        debuffs.push({
          name: title,
          type: 'debuff',
          img: 'icons/svg/downgrade.svg',
          system: {
            severity: 'Minor',
            duration: `Permanent (${type === 'race' ? 'Racial' : 'Class'})`,
            description: `<p><strong>Disadvantage</strong>: ${d}</p>`
          },
          flags: {
            'carl-rpg': {
              grantedBy: type,
              sourceName: data?.name || '',
              isDisadvantage: true,
              isDetriment: true,
              condition: d
            }
          }
        });
      } else if (/\b(vulnerab\w*|weakness)\b/i.test(d)) {
        let cleanTitle = d.split(':')[0].trim();
        if (cleanTitle.length > 40) cleanTitle = cleanTitle.slice(0, 37).trim() + '...';

        debuffs.push({
          name: cleanTitle,
          type: 'debuff',
          img: 'icons/svg/downgrade.svg',
          system: {
            severity: 'Minor',
            duration: `Permanent (${type === 'race' ? 'Racial' : 'Class'})`,
            description: `<p><strong>${type === 'race' ? 'Racial Detriment' : 'Class Drawback'}</strong>: ${d}</p>`
          },
          flags: {
            'carl-rpg': {
              grantedBy: type,
              sourceName: data?.name || '',
              isDetriment: true,
              condition: d
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
  static parseRaceBonuses(raceDef, options = {}) {
    if (!raceDef) return null;
    const stats = this.parseStats(raceDef);
    const { skills, spells } = this.parseSkillsAndSpells(raceDef);
    const drBonus = this.parseDR(raceDef);
    const movement = this.parseMovement(raceDef);
    const choices = this.detectChoices(raceDef);
    const { perks, detriments } = this.extractPerksAndDetriments(raceDef);
    const chosenPerks = options.chosenPerks || raceDef.system?.chosenPerks || raceDef.chosenPerks || perks;
    const chosenDetriments = options.chosenDetriments || raceDef.system?.chosenDetriments || raceDef.chosenDetriments || detriments;
    const conditions = this.parseConditions(raceDef, 'race', { chosenPerks, chosenDetriments });
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
      choices,
      perks,
      detriments,
      chosenPerks,
      chosenDetriments,
      drBonus,
      movement,
      conditions
    };
  }

  /**
   * Fully decomposes a class definition into applied bonuses.
   */
  static parseClassBonuses(classDef, options = {}) {
    if (!classDef) return null;
    const stats = this.parseStats(classDef);
    const { skills, spells } = this.parseSkillsAndSpells(classDef);
    const choices = this.detectChoices(classDef);
    const drBonus = this.parseDR(classDef);
    const movement = this.parseMovement(classDef);
    const { perks, detriments } = this.extractPerksAndDetriments(classDef);
    const chosenPerks = options.chosenPerks || classDef.system?.chosenPerks || classDef.chosenPerks || perks;
    const chosenDetriments = options.chosenDetriments || classDef.system?.chosenDetriments || classDef.chosenDetriments || detriments;
    const conditions = this.parseConditions(classDef, 'class', { chosenPerks, chosenDetriments });
    const classType = classDef.system?.classType || 'Fighter';

    return {
      name: classDef.name,
      classType,
      stats,
      skills,
      spells,
      choices,
      perks,
      detriments,
      chosenPerks,
      chosenDetriments,
      drBonus,
      movement,
      conditions
    };
  }

  // =========================================================================
  // CHOICE DETECTION, CATALOGING, & WIZARD PROMPT
  // =========================================================================

  /**
   * Detects pending skill or spell choices in a race or class definition.
   *
   * @param {object} def - Race or Class definition (canonical, world item, or studio build)
   * @returns {Array<object>} Array of choice objects { id, label, type, category, rank, options, sourcePerk }
   */
  static detectChoices(def) {
    if (!def) return [];
    const choices = [];
    let idx = 0;

    // 1. Structured pre-existing system.choices
    if (Array.isArray(def.system?.choices) && def.system.choices.length > 0) {
      return def.system.choices;
    }

    // 2. Structured items ending with "(Choice)" from Studio / Custom builds
    const rawSkills = def.system?.skills || def.skills || [];
    for (const s of rawSkills) {
      if (typeof s.name === 'string' && s.name.includes('(Choice)')) {
        const cleanName = s.name.replace(/\(Choice\)/i, '').trim();
        let cat = 'weapon';
        if (/craft/i.test(cleanName)) cat = 'crafting';
        else if (/spell/i.test(cleanName)) cat = 'spell';
        else if (/edged/i.test(cleanName)) cat = 'edged_weapon';
        else if (/reach/i.test(cleanName)) cat = 'reach_weapon';
        else if (/melee/i.test(cleanName)) cat = 'melee_weapon';
        choices.push({
          id: `choice_${idx++}`,
          label: `${cleanName || 'Skill'} Choice (Rank ${s.rank || 1})`,
          type: /spell/i.test(cleanName) ? 'spell' : 'skill',
          category: cat,
          rank: Number(s.rank) || 1,
          sourcePerk: s.name
        });
      }
    }
    const rawSpells = def.system?.spells || def.spells || [];
    for (const sp of rawSpells) {
      if (typeof sp.name === 'string' && sp.name.includes('(Choice)')) {
        const cleanName = sp.name.replace(/\(Choice\)/i, '').trim();
        choices.push({
          id: `choice_${idx++}`,
          label: `${cleanName || 'Spell'} Choice (Rank ${sp.rank || 1})`,
          type: 'spell',
          category: 'spell',
          rank: Number(sp.rank) || 1,
          sourcePerk: sp.name
        });
      }
    }

    // 3. Text parsing from perks
    const perks = Array.isArray(def.system?.perks)
      ? def.system.perks
      : (Array.isArray(def.perks) ? def.perks : []);

    for (const raw of perks) {
      const p = cleanOCRText(raw);

      // A. Crafting choice: +3 in two different crafting Skills of your choice, +2 in a crafting Skill of your choice, +1 in a crafting Skill of your choice
      const craftM = p.match(/^\+(\d+)\s+in\s+(?:(two|three|\d+)\s+different\s+crafting\s+Skills?|a\s+crafting\s+Skill)\s+of\s+your\s+choice/i);
      if (craftM) {
        const rank = parseInt(craftM[1], 10);
        const count = (craftM[2] === 'two' || craftM[2] === '2') ? 2 : (craftM[2] === 'three' || craftM[2] === '3') ? 3 : 1;
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `choice_${idx++}`,
            label: count > 1 ? `Crafting Skill ${i + 1} (Rank ${rank})` : `Crafting Skill (Rank ${rank})`,
            type: 'skill',
            category: 'crafting',
            rank,
            sourcePerk: raw
          });
        }
        continue;
      }

      // B. Spell choice: +2 in two Spells of your choice, +2 in a Spell of your choice, +3 in a Spell of your choice
      const spellM = p.match(/^\+(\d+)\s+in\s+(?:(two|three|\d+)\s+Spells?|a\s+Spell)\s+of\s+your\s+choice/i);
      if (spellM) {
        const rank = parseInt(spellM[1], 10);
        const count = (spellM[2] === 'two' || spellM[2] === '2') ? 2 : (spellM[2] === 'three' || spellM[2] === '3') ? 3 : 1;
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `choice_${idx++}`,
            label: count > 1 ? `Spell ${i + 1} (Rank ${rank})` : `Spell (Rank ${rank})`,
            type: 'spell',
            category: 'spell',
            rank,
            sourcePerk: raw
          });
        }
        continue;
      }

      // C. Edged weapon choice: +3 in an Edged weapon Skill of your choice
      const edgedM = p.match(/^\+(\d+)\s+in\s+an\s+Edged\s+weapon\s+Skill\s+of\s+your\s+choice/i);
      if (edgedM) {
        const rank = parseInt(edgedM[1], 10);
        choices.push({
          id: `choice_${idx++}`,
          label: `Edged Weapon Skill (Rank ${rank})`,
          type: 'skill',
          category: 'edged_weapon',
          rank,
          sourcePerk: raw
        });
        continue;
      }

      // D. Melee weapon choice: +3 in one Melee Weapon Skill of your choice
      const meleeM = p.match(/^\+(\d+)\s+in\s+(?:one|a)\s+Melee\s+Weapon\s+Skill\s+of\s+your\s+choice/i);
      if (meleeM) {
        const rank = parseInt(meleeM[1], 10);
        choices.push({
          id: `choice_${idx++}`,
          label: `Melee Weapon Skill (Rank ${rank})`,
          type: 'skill',
          category: 'melee_weapon',
          rank,
          sourcePerk: raw
        });
        continue;
      }

      // E. Reach weapon choice: +2 Zone of Control and a Reach weapon Skill of your choice
      const reachM = p.match(/^\+(\d+)\s+Zone of Control\s+and\s+a\s+Reach\s+weapon\s+Skill\s+of\s+your\s+choice/i);
      if (reachM) {
        const rank = parseInt(reachM[1], 10);
        choices.push({
          id: `choice_${idx++}`,
          label: `Reach Weapon Skill (Rank ${rank})`,
          type: 'skill',
          category: 'reach_weapon',
          rank,
          sourcePerk: raw
        });
        continue;
      }

      // F. Generic weapon choice: +3 in a weapon Skill of your choice, +2 in one weapon Skill of your choice, +2 to a Weapon Skill of your choice, +5 in a weapon Skill of your choice
      const weaponM = p.match(/^\+(\d+)\s+(?:in|to)\s+(?:(two|three|\d+)|one|a)\s+(?:different\s+)?Weapon\s+Skills?\s+of\s+your\s+choice/i);
      if (weaponM) {
        const rank = parseInt(weaponM[1], 10);
        const count = (weaponM[2] === 'two' || weaponM[2] === '2') ? 2 : 1;
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `choice_${idx++}`,
            label: count > 1 ? `Weapon Skill ${i + 1} (Rank ${rank})` : `Weapon Skill (Rank ${rank})`,
            type: 'skill',
            category: 'weapon',
            rank,
            sourcePerk: raw
          });
        }
        continue;
      }

      // G. Multi-choice list: +2 to your choice of two of the following Skills: Aiming, Attack of Opportunity, Catcher, Shield Block, or Zone of Control Skills
      const listM = p.match(/^\+(\d+)\s+to\s+your\s+choice\s+of\s+(two|three|\d+)\s+of\s+the\s+following\s+Skills?:\s*(.+)$/i);
      if (listM) {
        const rank = parseInt(listM[1], 10);
        const count = (listM[2] === 'two' || listM[2] === '2') ? 2 : (listM[2] === 'three' || listM[2] === '3') ? 3 : 1;
        const optsRaw = listM[3].replace(/\s+Skills?$/i, '');
        const options = optsRaw.split(/(?:,\s*or\s+|,\s*|\s+or\s+)/i).map(s => s.trim()).filter(Boolean);
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `choice_${idx++}`,
            label: `Combat Skill Choice ${i + 1} (Rank ${rank})`,
            type: 'skill',
            category: 'options',
            options,
            rank,
            sourcePerk: raw
          });
        }
        continue;
      }

      // H. Either X or Y: +3 in either Jumping or Light on Your Feet Skills
      const eitherM = p.match(/^\+(\d+)\s+in\s+either\s+([A-Za-z\s]+?)\s+or\s+([A-Za-z\s]+?)\s+Skills?/i);
      if (eitherM) {
        const rank = parseInt(eitherM[1], 10);
        const options = [eitherM[2].trim(), eitherM[3].trim()];
        choices.push({
          id: `choice_${idx++}`,
          label: `Skill Choice: ${options.join(' or ')} (Rank ${rank})`,
          type: 'skill',
          category: 'options',
          options,
          rank,
          sourcePerk: raw
        });
        continue;
      }

      // I. X or Y Skills: +2 Catcher or Shield Block Skills, +3 Rapier or Longsword Skill
      const orSkillM = p.match(/^\+(\d+)\s+([A-Za-z\s]+?)\s+or\s+([A-Za-z\s]+?)\s+Skills?$/i);
      if (orSkillM) {
        const rank = parseInt(orSkillM[1], 10);
        const options = [orSkillM[2].trim(), orSkillM[3].trim()];
        choices.push({
          id: `choice_${idx++}`,
          label: `Skill Choice: ${options.join(' or ')} (Rank ${rank})`,
          type: 'skill',
          category: 'options',
          options,
          rank,
          sourcePerk: raw
        });
        continue;
      }
    }

    return choices;
  }

  /**
   * Returns catalog options for a choice descriptor.
   *
   * @param {object} choice
   * @returns {string[]}
   */
  static getCatalogOptions(choice) {
    if (!choice) return [];
    if (choice.category === 'options' && Array.isArray(choice.options)) {
      return choice.options;
    }

    if (choice.category === 'crafting') {
      return [
        'Alchemy', 'Brewing', 'Carpentry', 'Cooking', 'Fabricate',
        'Gemcutting', 'Leatherworking', 'Repair', 'Salvage', 'Smithing',
        'Tailoring', 'Tattoo', 'Tinkering', 'Trap Engineer'
      ];
    }

    if (choice.category === 'edged_weapon') {
      return [
        'Axe', 'Dagger', 'Edged Weapons', 'Greatsword', 'Handaxe',
        'Longsword', 'Rapier', 'Shortsword', 'Slice Attack'
      ];
    }

    if (choice.category === 'reach_weapon') {
      return ['Halberd', 'Lance', 'Polearm', 'Reach Weapons', 'Spear', 'Whip'];
    }

    if (choice.category === 'melee_weapon') {
      return [
        'Axe', 'Blunt Weapons', 'Club', 'Dagger', 'Edged Weapons', 'Flail',
        'Greatsword', 'Halberd', 'Handaxe', 'Herding Weapons', 'Improvised Weapons',
        'Lance', 'Longsword', 'Mace', 'Polearm', 'Pugilism', 'Quarterstaff',
        'Rapier', 'Reach Weapons', 'Shortsword', 'Spear', 'Staff',
        'Unarmed Combat', 'Warhammer', 'Whip', 'Wrasslin'
      ];
    }

    if (choice.category === 'weapon') {
      return [
        'Axe', 'Blunt Weapons', 'Bow', 'Chainsaw', 'Club', 'Crossbow',
        'Dagger', 'Edged Weapons', 'Flail', 'Greatsword', 'Gun', 'Halberd',
        'Handaxe', 'Handgun', 'Herding Weapons', 'Improvised Weapons', 'Javelin',
        'Lance', 'Longbow', 'Longsword', 'Mace', 'Polearm', 'Pugilism',
        'Quarterstaff', 'Ranged Weapons', 'Rapier', 'Reach Weapons', 'Shotgun',
        'Shortbow', 'Shortsword', 'Shuriken', 'Slice Attack', 'Sling', 'Spear',
        'Staff', 'Throwing Weapons', 'Unarmed Combat', 'Warhammer', 'Whip', 'Wrasslin'
      ];
    }

    if (choice.type === 'spell' || choice.category === 'spell') {
      return DCC_SPELLS.map(s => s.name).sort();
    }

    return DCC_SKILLS.map(s => s.name).sort();
  }

  /**
   * Prompts the user with an interactive dialog to choose skills or spells.
   *
   * @param {object} def - Race or Class definition object
   * @param {Array<object>} choices - Array of choice objects from detectChoices
   * @param {object} [options={}]
   * @returns {Promise<object|null>} Object mapping choice IDs to selected names, or null if cancelled
   */
  static async promptChoicesDialog(def, choices, options = {}) {
    if (!choices || choices.length === 0) return {};

    const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog ?? globalThis.Dialog ?? null;
    if (!DialogClass) return null;

    // Build Choice HTML rows
    const rowsHtml = choices.map((ch) => {
      const catalog = this.getCatalogOptions(ch);
      const optionsHtml = catalog.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      return `
        <div class="dcc-choice-row" style="margin-bottom: 12px; padding: 8px; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
          <div style="font-weight: bold; font-family: 'Oswald', sans-serif; font-size: 13px; color: #333; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span><i class="fa-solid fa-crosshairs" style="color: #c0392b;"></i> ${ch.label}</span>
            <span class="dcc-badge" style="background: #c0392b; color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 2px;">Rank +${ch.rank}</span>
          </div>
          ${ch.sourcePerk ? `<div style="font-size: 11px; color: #666; margin-bottom: 6px; font-style: italic;">From perk: "${ch.sourcePerk}"</div>` : ''}
          <div style="display: flex; gap: 8px; align-items: center;">
            <select name="${ch.id}" class="dcc-choice-select" data-choice-id="${ch.id}" style="flex: 1; padding: 4px; font-size: 12px;">
              ${optionsHtml}
              <option value="__custom__">-- Custom Write-in... --</option>
            </select>
          </div>
          <input type="text" name="${ch.id}_custom" class="dcc-choice-custom" data-choice-id="${ch.id}" placeholder="Enter custom name..." style="display: none; width: 100%; margin-top: 6px; padding: 4px; font-size: 12px; box-sizing: border-box;" />
        </div>
      `;
    }).join('');

    const content = `
      <div class="dcc-dialog-choices" style="padding: 6px; font-family: 'Oswald', sans-serif;">
        <div style="background: #c0392b; color: #fff; padding: 8px 10px; border-radius: 4px 4px 0 0; margin-bottom: 10px;">
          <h3 style="margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-list-check"></i> Choose Perks: ${def.name}
          </h3>
          <p style="margin: 4px 0 0; font-size: 11px; opacity: 0.9;">
            This ${def.type || 'definition'} provides choices for skills or spells. Select your preferences below:
          </p>
        </div>
        <form class="dcc-choices-form">
          ${rowsHtml}
        </form>
      </div>
    `;

    return new Promise((resolve) => {
      let isResolved = false;

      const dlg = new DialogClass({
        title: `${def.name} - Select Choices`,
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Confirm & Apply',
            callback: (html) => {
              isResolved = true;
              const selections = {};
              for (const ch of choices) {
                const sel = html.find(`select[name="${ch.id}"]`);
                const selVal = typeof sel.val === 'function' ? sel.val() : sel.value;
                if (selVal === '__custom__') {
                  const customInp = html.find(`input[name="${ch.id}_custom"]`);
                  const customVal = (typeof customInp.val === 'function' ? customInp.val() : customInp.value || '').trim();
                  selections[ch.id] = customVal || (this.getCatalogOptions(ch)[0] || 'Custom Choice');
                } else {
                  selections[ch.id] = selVal || (this.getCatalogOptions(ch)[0] || 'Choice');
                }
              }
              resolve(selections);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel',
            callback: () => {
              isResolved = true;
              resolve(null);
            }
          }
        },
        default: 'confirm',
        close: () => {
          if (!isResolved) resolve(null);
        },
        render: (html) => {
          html.find('.dcc-choice-select').on?.('change', (ev) => {
            const select = ev.currentTarget;
            const choiceId = select.dataset?.choiceId || select.getAttribute?.('data-choice-id');
            const customInput = html.find(`input[name="${choiceId}_custom"]`);
            if (select.value === '__custom__') {
              if (customInput.show) customInput.show();
              if (customInput.focus) customInput.focus();
            } else {
              if (customInput.hide) customInput.hide();
            }
          });
        }
      }, {
        width: 480,
        classes: ['dcc-dialog', 'dcc-choices-wizard']
      });

      dlg.render(true);
    });
  }

  /**
   * Resolves detected choices against user selections or options into structured arrays.
   *
   * @param {object} def
   * @param {Array<object>} choices
   * @param {Array|object|string} userSelections
   * @returns {{ chosenSkills: Array<object>, chosenSpells: Array<object> }}
   */
  static resolveChoices(def, choices, userSelections = {}) {
    const chosenSkills = [];
    const chosenSpells = [];

    if (!choices || choices.length === 0) {
      return { chosenSkills, chosenSpells };
    }

    choices.forEach((ch, idx) => {
      let selectedName = '';

      if (Array.isArray(userSelections)) {
        const item = userSelections[idx];
        if (typeof item === 'string') selectedName = item;
        else if (item && typeof item === 'object') selectedName = item.name;
      } else if (typeof userSelections === 'string') {
        if (idx === 0) selectedName = userSelections;
      } else if (userSelections && typeof userSelections === 'object') {
        selectedName = userSelections[ch.id] ||
          userSelections[ch.label] ||
          userSelections[idx] ||
          userSelections[ch.category];
      }

      if (!selectedName) {
        const opts = this.getCatalogOptions(ch);
        selectedName = opts[0] || (ch.type === 'spell' ? 'Fireball' : 'Longsword');
      }

      selectedName = String(selectedName).trim();
      const rank = ch.rank || 1;

      if (ch.type === 'spell') {
        const matchedName = matchKnownSpell(selectedName);
        const spellDoc = DCC_SPELLS.find(s => normalizeKey(s.name) === normalizeKey(matchedName));
        chosenSpells.push({
          name: matchedName,
          rank,
          mpCost: spellDoc?.system?.manaCost || 0,
          choiceId: ch.id
        });
      } else {
        const matchedName = matchKnownSkill(selectedName);
        const skillDoc = DCC_SKILLS.find(s => normalizeKey(s.name) === normalizeKey(matchedName));
        chosenSkills.push({
          name: matchedName,
          rank,
          isPassive: Boolean(skillDoc?.system?.isPassive),
          choiceId: ch.id
        });
      }
    });

    return { chosenSkills, chosenSpells };
  }

  /**
   * Prompts the user with an interactive modal dialog to select perks and detriments.
   *
   * @param {object} def - Race or Class definition
   * @param {{ perks: string[], detriments: string[] }} features - Extracted perks and detriments
   * @param {object} options - Optional flags or pre-selections
   * @returns {Promise<{ chosenPerks: string[], chosenDetriments: string[] }|null>}
   */
  static async promptPerksDetrimentsDialog(def, { perks = [], detriments = [] }, options = {}) {
    if (typeof Dialog === 'undefined') {
      return {
        chosenPerks: options.chosenPerks || [...perks],
        chosenDetriments: options.chosenDetriments || [...detriments]
      };
    }

    const preSelectedPerks = options.chosenPerks || options.selectedPerks || perks;
    const preSelectedDetriments = options.chosenDetriments || options.selectedDetriments || detriments;

    let perksHtml = '';
    if (perks.length > 0) {
      perksHtml = `
        <div class="dcc-dialog-card" style="border: 1px solid #27ae60; background: #fff; border-radius: 4px; padding: 10px; margin-bottom: 12px;">
          <div style="font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: bold; color: #27ae60; margin-bottom: 8px; border-bottom: 1px solid #c3e6cb; padding-bottom: 4px;">
            <i class="fa-solid fa-star"></i> PERKS &amp; BENEFITS
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${perks.map((p) => {
              const isChecked = preSelectedPerks.includes(p);
              return `
                <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; background: #f0f9f2; border: 1px solid #d4edda; border-radius: 3px; padding: 6px;">
                  <input type="checkbox" name="perk" value="${p.replace(/"/g, '&quot;')}" ${isChecked ? 'checked' : ''} style="margin-top: 2px;" />
                  <span style="color: #155724; font-weight: 500;">${p}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let detrimentsHtml = '';
    if (detriments.length > 0) {
      detrimentsHtml = `
        <div class="dcc-dialog-card" style="border: 1px solid #c0392b; background: #fff; border-radius: 4px; padding: 10px; margin-bottom: 12px;">
          <div style="font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: bold; color: #c0392b; margin-bottom: 8px; border-bottom: 1px solid #f5c6cb; padding-bottom: 4px;">
            <i class="fa-solid fa-triangle-exclamation"></i> DETRIMENTS &amp; DRAWBACKS
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${detriments.map((d) => {
              const isChecked = preSelectedDetriments.includes(d);
              return `
                <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; background: #fdf7f7; border: 1px solid #f8d7da; border-radius: 3px; padding: 6px;">
                  <input type="checkbox" name="detriment" value="${d.replace(/"/g, '&quot;')}" ${isChecked ? 'checked' : ''} style="margin-top: 2px;" />
                  <span style="color: #721c24; font-weight: 500;">${d}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    const content = `
      <div class="dcc-perks-wizard-dialog" style="font-family: 'Oswald', sans-serif; padding: 4px;">
        <p style="font-size: 12px; color: #333; margin-bottom: 10px; line-height: 1.4;">
          Select active <strong>Perks</strong> and <strong>Detriments</strong> for <strong>${def.name}</strong>.
        </p>
        ${perksHtml}
        ${detrimentsHtml}
        <div style="border: 1px dashed #ccc; background: #f9f9f9; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">CUSTOM WRITE-IN (OPTIONAL)</div>
          <input type="text" name="customPerk" placeholder="Add custom perk write-in..." style="width: 100%; margin-bottom: 4px; font-size: 11px; padding: 4px;" />
          <input type="text" name="customDetriment" placeholder="Add custom detriment write-in..." style="width: 100%; font-size: 11px; padding: 4px;" />
        </div>
      </div>
    `;

    return new Promise(resolve => {
      let isResolved = false;
      const dlg = new Dialog({
        title: `[PERKS & DETRIMENTS] ${def.name}`,
        content,
        buttons: {
          apply: {
            icon: '<i class="fa-solid fa-check"></i>',
            label: 'Apply Features',
            callback: html => {
              isResolved = true;
              const chosenPerks = [];
              const chosenDetriments = [];

              const perkEls = html.find('input[name="perk"]:checked');
              if (perkEls && perkEls.each) {
                perkEls.each((i, el) => {
                  const val = el.value || (typeof el.val === 'function' ? el.val() : '');
                  if (val) chosenPerks.push(val);
                });
              }

              const detEls = html.find('input[name="detriment"]:checked');
              if (detEls && detEls.each) {
                detEls.each((i, el) => {
                  const val = el.value || (typeof el.val === 'function' ? el.val() : '');
                  if (val) chosenDetriments.push(val);
                });
              }

              const customP = html.find('input[name="customPerk"]').val?.()?.trim?.();
              if (customP) chosenPerks.push(customP);

              const customD = html.find('input[name="customDetriments"], input[name="customDetriment"]').val?.()?.trim?.();
              if (customD) chosenDetriments.push(customD);

              resolve({ chosenPerks, chosenDetriments });
            }
          },
          cancel: {
            icon: '<i class="fa-solid fa-xmark"></i>',
            label: 'Cancel',
            callback: () => {
              isResolved = true;
              resolve(null);
            }
          }
        },
        default: 'apply',
        close: () => {
          if (!isResolved) resolve(null);
        }
      }, {
        width: 500,
        classes: ['dcc-dialog', 'dcc-perks-dialog']
      });

      dlg.render(true);
    });
  }

  /**
   * Synchronizes perks and detriments on an actor for an active race or class.
   *
   * @param {Actor} actor
   * @param {'race'|'class'} type
   * @param {Array<string>} chosenPerks
   * @param {Array<string>} chosenDetriments
   * @param {object|null} def
   * @returns {Promise<boolean>}
   */
  static async syncPerksAndDetriments(actor, type, chosenPerks, chosenDetriments, def = null) {
    if (!actor) return false;
    if (!def) {
      def = type === 'race'
        ? this.findRace(actor.system?.details?.race)
        : this.findClass(actor.system?.details?.class);
    }
    if (!def) return false;

    // 1. Delete existing condition items granted by this source
    const toDelete = [];
    for (const item of (actor.items || [])) {
      if (['buff', 'debuff'].includes(item.type) && item.getFlag?.('carl-rpg', 'grantedBy') === type) {
        toDelete.push(item.id);
      }
    }
    if (toDelete.length > 0 && typeof actor.deleteEmbeddedDocuments === 'function') {
      await actor.deleteEmbeddedDocuments('Item', toDelete);
    }

    // 2. Generate new condition items
    const { buffs, debuffs } = this.parseConditions(def, type, { chosenPerks, chosenDetriments });
    const newItems = [...buffs, ...debuffs];
    const createdConditionIds = [];
    if (newItems.length > 0 && typeof actor.createEmbeddedDocuments === 'function') {
      const created = await actor.createEmbeddedDocuments('Item', newItems);
      for (const c of (created || [])) {
        if (c?.id) createdConditionIds.push(c.id);
      }
    }

    // 3. Update embedded race or class document
    const embeddedDoc = actor.items?.find?.(i => i.type === type);
    if (embeddedDoc && typeof embeddedDoc.update === 'function') {
      await embeddedDoc.update({
        'system.chosenPerks': chosenPerks,
        'system.chosenDetriments': chosenDetriments
      });
    }

    // 4. Update actor flag
    const flagKey = type === 'race' ? 'appliedRace' : 'appliedClass';
    const currentFlag = actor.getFlag?.('carl-rpg', flagKey) || {};
    if (typeof actor.setFlag === 'function') {
      await actor.setFlag('carl-rpg', flagKey, {
        ...currentFlag,
        chosenPerks,
        chosenDetriments,
        conditionItemIds: createdConditionIds
      });
    }

    // 5. Update narrative details
    const updates = {};
    const abilitiesSummary = [...chosenPerks, ...chosenDetriments].join('; ');
    if (type === 'race') {
      updates['system.details.raceAbilities'] = abilitiesSummary;
    } else {
      updates['system.details.classAbilities'] = abilitiesSummary;
    }
    if (typeof actor.update === 'function') {
      await actor.update(updates);
    }

    return true;
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
    updates['system.details.raceAbilities'] = '';

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
  static async applyRace(actor, raceIdentifier, options = {}) {
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

    // Choice resolution
    const choices = this.detectChoices(def);
    let resolvedChoices = { chosenSkills: [], chosenSpells: [] };

    if (choices.length > 0) {
      if (options.choices !== undefined) {
        resolvedChoices = this.resolveChoices(def, choices, options.choices);
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog)) {
        const userSelections = await this.promptChoicesDialog(def, choices, options);
        if (userSelections === null) return false; // User cancelled
        resolvedChoices = this.resolveChoices(def, choices, userSelections);
      } else {
        // Headless default fallback
        resolvedChoices = this.resolveChoices(def, choices, {});
      }
    }

    // Perks & Detriments resolution
    const { perks, detriments } = this.extractPerksAndDetriments(def);
    let chosenPerks = perks;
    let chosenDetriments = detriments;

    if (perks.length > 0 || detriments.length > 0) {
      if (options.chosenPerks !== undefined || options.chosenDetriments !== undefined) {
        chosenPerks = options.chosenPerks || perks;
        chosenDetriments = options.chosenDetriments || detriments;
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog && !options.skipPerksDialog)) {
        const perkSelection = await this.promptPerksDetrimentsDialog(def, { perks, detriments }, options);
        if (perkSelection === null) return false; // User cancelled
        chosenPerks = perkSelection.chosenPerks;
        chosenDetriments = perkSelection.chosenDetriments;
      }
    }

    // 1. Revert previous race first
    await this.removeRace(actor);

    // 2. Parse new race bonuses
    const bonuses = this.parseRaceBonuses(def, { chosenPerks, chosenDetriments });
    const updates = {};
    updates['system.details.race'] = def.name;
    const abilitiesSummary = [...chosenPerks, ...chosenDetriments].join('; ');
    if (abilitiesSummary) {
      updates['system.details.raceAbilities'] = abilitiesSummary;
    }

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

    // 6. Apply Granted Skills (base + chosen)
    const allSkillsToGrant = [...bonuses.skills, ...(resolvedChoices.chosenSkills || [])];
    const appliedSkills = [];
    for (const s of allSkillsToGrant) {
      const existing = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + s.rank });
        appliedSkills.push({ id: existing.id, name: existing.name, rank: s.rank, preExistingRank: curRank, createdByRace: false, isChoice: Boolean(s.choiceId) });
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
                grantedBy: 'race',
                isChoice: Boolean(s.choiceId)
              }
            }
          }]);
          appliedSkills.push({ id: created?.id, name: s.name, rank: s.rank, preExistingRank: 0, createdByRace: true, isChoice: Boolean(s.choiceId) });
        }
      }
    }

    // 7. Apply Granted Spells (base + chosen)
    const allSpellsToGrant = [...bonuses.spells, ...(resolvedChoices.chosenSpells || [])];
    const appliedSpells = [];
    for (const sp of allSpellsToGrant) {
      const existing = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + sp.rank });
        appliedSpells.push({ id: existing.id, name: existing.name, rank: sp.rank, preExistingRank: curRank, createdByRace: false, isChoice: Boolean(sp.choiceId) });
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
                grantedBy: 'race',
                isChoice: Boolean(sp.choiceId)
              }
            }
          }]);
          appliedSpells.push({ id: created?.id, name: sp.name, rank: sp.rank, preExistingRank: 0, createdByRace: true, isChoice: Boolean(sp.choiceId) });
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

    // 9. Embed Race Item Document with chosenSkills and chosenSpells
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
          stats: bonuses.stats,
          perks: bonuses.perks,
          detriments: bonuses.detriments,
          chosenPerks,
          chosenDetriments,
          chosenSkills: resolvedChoices.chosenSkills || [],
          chosenSpells: resolvedChoices.chosenSpells || [],
          skills: [...(def.system?.skills || []), ...(resolvedChoices.chosenSkills || [])],
          spells: [...(def.system?.spells || []), ...(resolvedChoices.chosenSpells || [])]
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
        chosenSkills: resolvedChoices.chosenSkills || [],
        chosenSpells: resolvedChoices.chosenSpells || [],
        chosenPerks,
        chosenDetriments,
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
    updates['system.details.classAbilities'] = '';

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
  static async applyClass(actor, classIdentifier, options = {}) {
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

    // Choice resolution
    const choices = this.detectChoices(def);
    let resolvedChoices = { chosenSkills: [], chosenSpells: [] };

    if (choices.length > 0) {
      if (options.choices !== undefined) {
        resolvedChoices = this.resolveChoices(def, choices, options.choices);
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog)) {
        const userSelections = await this.promptChoicesDialog(def, choices, options);
        if (userSelections === null) return false; // User cancelled
        resolvedChoices = this.resolveChoices(def, choices, userSelections);
      } else {
        // Headless default fallback
        resolvedChoices = this.resolveChoices(def, choices, {});
      }
    }

    // Perks & Detriments resolution
    const { perks, detriments } = this.extractPerksAndDetriments(def);
    let chosenPerks = perks;
    let chosenDetriments = detriments;

    if (perks.length > 0 || detriments.length > 0) {
      if (options.chosenPerks !== undefined || options.chosenDetriments !== undefined) {
        chosenPerks = options.chosenPerks || perks;
        chosenDetriments = options.chosenDetriments || detriments;
      } else if (options.interactive || (typeof document !== 'undefined' && !options.skipDialog && !options.skipPerksDialog)) {
        const perkSelection = await this.promptPerksDetrimentsDialog(def, { perks, detriments }, options);
        if (perkSelection === null) return false; // User cancelled
        chosenPerks = perkSelection.chosenPerks;
        chosenDetriments = perkSelection.chosenDetriments;
      }
    }

    // 1. Revert previous class first
    await this.removeClass(actor);

    // 2. Parse new class bonuses
    const bonuses = this.parseClassBonuses(def, { chosenPerks, chosenDetriments });
    const updates = {};
    updates['system.details.class'] = def.name;
    const abilitiesSummary = [...chosenPerks, ...chosenDetriments].join('; ');
    if (abilitiesSummary) {
      updates['system.details.classAbilities'] = abilitiesSummary;
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

    // 6. Apply Granted Skills (base + chosen)
    const allSkillsToGrant = [...bonuses.skills, ...(resolvedChoices.chosenSkills || [])];
    const appliedSkills = [];
    for (const s of allSkillsToGrant) {
      const existing = actor.items?.find?.(i => i.type === 'skill' && normalizeKey(i.name) === normalizeKey(s.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + s.rank });
        appliedSkills.push({ id: existing.id, name: existing.name, rank: s.rank, preExistingRank: curRank, createdByClass: false, isChoice: Boolean(s.choiceId) });
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
                grantedBy: 'class',
                isChoice: Boolean(s.choiceId)
              }
            }
          }]);
          appliedSkills.push({ id: created?.id, name: s.name, rank: s.rank, preExistingRank: 0, createdByClass: true, isChoice: Boolean(s.choiceId) });
        }
      }
    }

    // 7. Apply Granted Spells (base + chosen)
    const allSpellsToGrant = [...bonuses.spells, ...(resolvedChoices.chosenSpells || [])];
    const appliedSpells = [];
    for (const sp of allSpellsToGrant) {
      const existing = actor.items?.find?.(i => i.type === 'spell' && normalizeKey(i.name) === normalizeKey(sp.name));
      if (existing) {
        const curRank = Number(existing.system?.rank) || 0;
        await existing.update?.({ 'system.rank': curRank + sp.rank });
        appliedSpells.push({ id: existing.id, name: existing.name, rank: sp.rank, preExistingRank: curRank, createdByClass: false, isChoice: Boolean(sp.choiceId) });
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
                grantedBy: 'class',
                isChoice: Boolean(sp.choiceId)
              }
            }
          }]);
          appliedSpells.push({ id: created?.id, name: sp.name, rank: sp.rank, preExistingRank: 0, createdByClass: true, isChoice: Boolean(sp.choiceId) });
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

    // 9. Embed Class Item Document with chosenSkills and chosenSpells
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
          stats: bonuses.stats,
          perks: bonuses.perks,
          detriments: bonuses.detriments,
          chosenPerks,
          chosenDetriments,
          chosenSkills: resolvedChoices.chosenSkills || [],
          chosenSpells: resolvedChoices.chosenSpells || [],
          skills: [...(def.system?.skills || []), ...(resolvedChoices.chosenSkills || [])],
          spells: [...(def.system?.spells || []), ...(resolvedChoices.chosenSpells || [])]
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
        chosenSkills: resolvedChoices.chosenSkills || [],
        chosenSpells: resolvedChoices.chosenSpells || [],
        chosenPerks,
        chosenDetriments,
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
