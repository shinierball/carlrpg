import { PDFDocument as importedPDFDocument } from '../../lib/pdf-lib.mjs';
import { DCC_BUFFS } from '../data/buffs.mjs';
import { DCC_SPELLS } from '../data/spells.mjs';
import { DCC_SKILLS } from '../data/skills.mjs';

function getPDFDocument() {
  return globalThis.PDFLib?.PDFDocument || importedPDFDocument;
}

/**
 * Helper to safely set text on a PDF text field
 */
function setTextField(form, fieldName, value) {
  if (value == null) return;
  try {
    const field = form.getTextField(fieldName);
    if (field) {
      try {
        field.setText(String(value));
      } catch (_err) {
        // Fallback for non-WinAnsi characters (e.g. high Unicode or emojis)
        const safe = String(value).replace(/[^\x00-\x7F\xA0-\xFF\u2018-\u201D\u2022\u2026]/g, '');
        field.setText(safe);
      }
    }
  } catch (_e) {
    // Gracefully ignore missing or mismatched field
  }
}

/**
 * Helper to safely set a checkbox state
 */
function setCheckBox(form, fieldName, checked) {
  try {
    const field = form.getCheckBox(fieldName);
    if (field) {
      if (checked) field.check();
      else field.uncheck();
    }
  } catch (_e) {
    // Gracefully ignore missing or mismatched checkbox
  }
}

/**
 * Helper to split multi-line or comma-delimited text into lines
 */
function splitToLines(text, maxLines = 10) {
  if (!text) return [];
  const raw = String(text);
  let lines = raw.includes('\n')
    ? raw.split('\n')
    : raw.split('; ');
  return lines.map(l => l.trim()).filter(Boolean).slice(0, maxLines);
}

/**
 * Format stat modifier with explicit sign (+/-)
 */
function formatMod(mod) {
  const num = Number(mod) || 0;
  return num >= 0 ? `+${num}` : `${num}`;
}

/**
 * Resolves an external buff key or ID into a clean, human-readable description
 * (e.g. "+2 Strength Buff", "+10 Temp HP", "Resist Fire (50%)")
 * @param {Actor} actor The DCC Crawler Actor
 * @param {string} rawVal The raw buff ID, key, or custom text
 * @returns {string} Human-readable description
 */
export function resolveBuffDescription(actor, rawVal) {
  if (!rawVal) return '';
  let str = String(rawVal).trim();
  if (Array.isArray(rawVal)) str = String(rawVal[0] || '').trim();
  if (str.includes(',')) str = str.split(',')[0].trim();
  if (!str) return '';

  let buff = null;
  if (typeof actor?.resolveBuff === 'function') {
    buff = actor.resolveBuff(str);
  }
  if (!buff && actor?.items) {
    const itemsList = Array.isArray(actor.items) ? actor.items : Array.from(actor.items);
    buff = itemsList.find(i => i.id === str || i._id === str || i.name?.toLowerCase() === str.toLowerCase());
  }
  if (!buff && CONFIG.DCC?.buffs) {
    buff = CONFIG.DCC.buffs.find(b => b._id === str || b.name?.toLowerCase() === str.toLowerCase());
  }
  if (!buff && DCC_BUFFS) {
    buff = DCC_BUFFS.find(b => b._id === str || b.name?.toLowerCase() === str.toLowerCase());
  }

  if (!buff) {
    return str;
  }

  const sys = buff.system || {};
  const bType = (sys.buffType || '').toLowerCase();
  const name = buff.name || '';

  // Multi-stat modifiers
  if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
    const mods = sys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
    return name && !name.toLowerCase().includes('buff') ? `${name} (${mods})` : `${mods} Buff`;
  }

  // Single stat buff (e.g. "+2 Strength Buff")
  if (bType === 'stat' && sys.stat) {
    const val = sys.value != null ? (Number(sys.value) >= 0 ? `+${sys.value}` : `${sys.value}`) : '+2';
    if (name.toLowerCase().includes('buff')) {
      return `${val} ${name}`;
    }
    const statName = (sys.stat || '').toUpperCase();
    return `${val} ${statName} Buff`;
  }

  // Temporary health
  if (bType === 'temphp' || bType === 'temp_hp') {
    const val = sys.value != null ? (Number(sys.value) >= 0 ? `+${sys.value}` : `${sys.value}`) : '+10';
    return `${val} Temp HP`;
  }

  // Damage resistance
  if (bType === 'resistance') {
    const type = sys.damageType || '';
    return type ? `Resist ${type} (50%)` : name;
  }

  // Damage immunity
  if (bType === 'immunity') {
    const type = sys.damageType || '';
    return type ? `Immune ${type}` : name;
  }

  // Damage multiplier
  if (bType === 'damagemultiplier' || Number(sys.damageMultiplier) > 1) {
    const mult = sys.damageMultiplier || sys.value || 2;
    const type = sys.damageType ? ` ${sys.damageType}` : ' Total';
    return `*${mult}${type} Damage`;
  }

  // Damage modifiers
  if (Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0) {
    const mods = sys.damageModifiers.map(m => m.type || m.damageType || 'Mod').join(', ');
    return `${name} (${mods})`;
  }

  return name || str;
}

/**
 * Resolves a hotlist slot entry (id or name) into a readable display string
 */
export function resolveHotlistDisplay(actor, rawVal, items = []) {
  if (!rawVal) return '';
  const valStr = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal[0] || '').trim();
  if (!valStr) return '';

  let matchedItem = items.find(it => it.id === valStr || it._id === valStr || it.name.toLowerCase() === valStr.toLowerCase());
  if (!matchedItem && CONFIG.DCC?.spells) {
    matchedItem = CONFIG.DCC.spells.find(s => s._id === valStr || s.name.toLowerCase() === valStr.toLowerCase());
  }
  if (!matchedItem && DCC_SPELLS) {
    matchedItem = DCC_SPELLS.find(s => s._id === valStr || s.name.toLowerCase() === valStr.toLowerCase());
  }
  if (!matchedItem && CONFIG.DCC?.skills) {
    matchedItem = CONFIG.DCC.skills.find(sk => sk._id === valStr || sk.name.toLowerCase() === valStr.toLowerCase());
  }
  if (!matchedItem && DCC_SKILLS) {
    matchedItem = DCC_SKILLS.find(sk => sk._id === valStr || sk.name.toLowerCase() === valStr.toLowerCase());
  }
  if (!matchedItem && CONFIG.DCC?.buffs) {
    matchedItem = CONFIG.DCC.buffs.find(b => b._id === valStr || b.name.toLowerCase() === valStr.toLowerCase());
  }
  if (!matchedItem && DCC_BUFFS) {
    matchedItem = DCC_BUFFS.find(b => b._id === valStr || b.name.toLowerCase() === valStr.toLowerCase());
  }

  if (matchedItem) {
    if (matchedItem.type === 'spell') {
      const cost = matchedItem.system?.manaCost ?? 0;
      return `${matchedItem.name} (${cost} MP)`;
    } else if (matchedItem.type === 'attack') {
      const dice = matchedItem.system?.damageDice || '';
      return dice ? `${matchedItem.name} [${dice}]` : matchedItem.name;
    } else if (matchedItem.type === 'buff') {
      return resolveBuffDescription(actor, matchedItem._id || matchedItem.id || matchedItem.name);
    }
    return matchedItem.name;
  }

  return valStr;
}

/**
 * Load template PDF bytes dynamically in browser or Node.js
 */
export async function loadTemplatePdf(options = {}) {
  if (options.templateBytes) return options.templateBytes;

  const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node);

  // Browser / Foundry environment
  if (!isNode && typeof fetch === 'function') {
    const url = options.url || 'systems/carl-rpg/assets/sheet/fillable_character_sheet.pdf';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load PDF template from ${url}: ${res.statusText}`);
    return await res.arrayBuffer();
  }

  // Headless Node.js environment
  const fsMod = 'node:fs/promises';
  const pathMod = 'node:path';
  const fs = await import(fsMod);
  const path = await import(pathMod);
  const filePath = options.templatePath || path.resolve(process.cwd(), 'assets/sheet/fillable_character_sheet.pdf');
  return await fs.readFile(filePath);
}

/**
 * Exports a Crawler actor to the official 6-page fillable character sheet PDF
 * @param {Actor} actor The DCC Crawler Actor
 * @param {object} options Export and template options
 * @returns {Promise<Uint8Array>} Filled PDF document bytes
 */
export async function exportCrawlerToPdf(actor, options = {}) {
  if (!actor) throw new Error('Cannot export PDF without a valid Actor instance');

  const PDFDocClass = getPDFDocument();
  if (!PDFDocClass) throw new Error('PDFLib is not available');

  const templateBytes = await loadTemplatePdf(options);
  const pdfDoc = await PDFDocClass.load(templateBytes);
  const form = pdfDoc.getForm();

  const system = actor.system || {};
  const details = system.details || {};
  const abilities = system.abilities || {};
  const attributes = system.attributes || {};
  const gearSlots = system.gearSlots || {};
  const hotlist = system.hotlist || {};

  // Extract embedded items
  const items = Array.from(actor.items || []);
  const attacks = items.filter(i => i.type === 'attack');
  const skills = items.filter(i => i.type === 'skill');
  const spells = items.filter(i => i.type === 'spell');
  const gear = items.filter(i => i.type === 'gear');
  const loot = items.filter(i => i.type === 'loot' || i.type === 'consumable');
  const races = items.filter(i => i.type === 'race');
  const classes = items.filter(i => i.type === 'class');
  const deities = items.filter(i => i.type === 'deity');
  const sponsors = items.filter(i => i.type === 'sponsor');

  // =========================================================================
  // PAGE 1: CORE CHARACTER SHEET
  // =========================================================================
  // 1. Identity
  setTextField(form, 'Name', actor.name || '');
  const raceName = details.race || (races[0] ? races[0].name : '');
  setTextField(form, 'Race', raceName);
  setTextField(form, 'Gender', details.gender || '');
  setTextField(form, 'level', details.level != null ? details.level : 1);
  setTextField(form, 'crawler number', details.crawlerNumber || '');
  const className = details.class || (classes[0] ? classes[0].name : '');
  setTextField(form, 'class', className);
  setTextField(form, 'Floor', details.floor || '1st Floor');

  // 2. Health Bar (10% to 100%)
  // In DCC RPG, each Health Bar slot has a capacity equal to the crawler's CON Mod (Max HP = 10 * CON Mod).
  // Each slot box displays the slot capacity (CON Mod), with checkboxes left blank for tabletop play.
  const conMod = abilities.con?.mod != null ? Number(abilities.con.mod) : 0;
  const maxHp = Number(attributes.hp?.max) || 40;
  const slotHpValue = conMod > 0 ? conMod : Math.max(1, Math.round(maxHp / 10));

  const hpBoxes = [
    { textKey: '10', checkKey: 'Check Box6 2' },
    { textKey: '20', checkKey: 'Check Box6 1' },
    { textKey: '30', checkKey: 'Check Box6 1 1' },
    { textKey: '40', checkKey: 'Check Box6 1 2' },
    { textKey: '50', checkKey: 'Check Box6 1 3' },
    { textKey: '60', checkKey: 'Check Box6 1 4' },
    { textKey: '70', checkKey: 'Check Box6 1 5' },
    { textKey: '80', checkKey: 'Check Box6 1 6' },
    { textKey: '90', checkKey: 'Check Box6 1 7' },
    { textKey: '100', checkKey: 'Check Box6 1 8' }
  ];

  for (const box of hpBoxes) {
    setTextField(form, box.textKey, slotHpValue);
    setCheckBox(form, box.checkKey, false);
  }

  // 3. Ability Scores (Enhanced, Unenhanced, Stat Mod)
  const statMap = [
    { key: 'str', enhancedField: 'Text Field 21', unenhancedField: 'Text Field 22', modField: 'Text Field 23' },
    { key: 'int', enhancedField: 'Text Field 34', unenhancedField: 'Text Field 35', modField: 'Text Field 36' },
    { key: 'con', enhancedField: 'Text Field 43', unenhancedField: 'Text Field 44', modField: 'Text Field 45' },
    { key: 'dex', enhancedField: 'Text Field 46', unenhancedField: 'Text Field 47', modField: 'Text Field 48' },
    { key: 'cha', enhancedField: 'Text Field 49', unenhancedField: 'Text Field 50', modField: 'Text Field 51' }
  ];

  for (const stat of statMap) {
    const ab = abilities[stat.key] || {};
    const enhanced = ab.value != null ? ab.value : 10;
    const unenhanced = ab.unenhanced != null ? ab.unenhanced : enhanced;
    const mod = ab.mod != null ? ab.mod : 0;
    setTextField(form, stat.enhancedField, enhanced);
    setTextField(form, stat.unenhancedField, unenhanced);
    setTextField(form, stat.modField, formatMod(mod));
  }

  // 4. EVADE Row
  const dexMod = abilities.dex?.mod != null ? abilities.dex.mod : 0;
  setTextField(form, 'Text Field 24', formatMod(dexMod));
  setTextField(form, 'Text Field 25', attributes.evade?.buffs || 0);
  setTextField(form, 'Text Field 26', attributes.evade?.total != null ? attributes.evade.total : 10);
  setTextField(form, 'Text Field 27', attributes.speed?.move != null ? attributes.speed.move : 20);
  setTextField(form, 'Text Field 28', attributes.speed?.step != null ? attributes.speed.step : 10);

  // 5. DAMAGE RESISTANCE Row
  const drArmor = (Number(attributes.dr?.armor) || 0) + (Number(attributes.dr?.items) || 0);
  setTextField(form, 'Text Field 29', drArmor);
  setTextField(form, 'Text Field 30', attributes.dr?.buffs || 0);
  setTextField(form, 'Text Field 31', attributes.dr?.total != null ? attributes.dr.total : 0);
  setTextField(form, 'Text Field 32', attributes.aiFavor != null ? attributes.aiFavor : 0);
  setTextField(form, 'Text Field 33', attributes.size || 'Medium');

  // 6. Mana & Debuffs
  setTextField(form, 'Text Field 38', attributes.mana?.max != null ? attributes.mana.max : 10);
  setTextField(form, 'Text Field 37', attributes.mana?.value != null ? attributes.mana.value : 10);
  setTextField(form, 'Text Field 39', attributes.debuffs || '');

  // 7. External Buffs (Max 3)
  const extBuffs = attributes.externalBuffs || {};
  setTextField(form, 'Text Field 40', resolveBuffDescription(actor, extBuffs.buff1));
  setTextField(form, 'Text Field 41', resolveBuffDescription(actor, extBuffs.buff2));
  setTextField(form, 'Text Field 42', resolveBuffDescription(actor, extBuffs.buff3));

  // 8. Attacks (Up to 5 rows)
  const attackRowMap = [
    { name: 'Text Field 55', rank: 'Text Field 551', toHitMod: 'Text Field 52', dice: 'Text Field 53', dmgMod: 'Text Field 54', effects: 'Text Field 56' },
    { name: 'Text Field 61', rank: 'Text Field 57', toHitMod: 'Text Field 59', dice: 'Text Field 58', dmgMod: 'Text Field 60', effects: 'Text Field 62' },
    { name: 'Text Field 67', rank: 'Text Field 63', toHitMod: 'Text Field 65', dice: 'Text Field 64', dmgMod: 'Text Field 66', effects: 'Text Field 68' },
    { name: 'Text Field 73', rank: 'Text Field 69', toHitMod: 'Text Field 71', dice: 'Text Field 70', dmgMod: 'Text Field 72', effects: 'Text Field 74' },
    { name: 'Text Field 79', rank: 'Text Field 75', toHitMod: 'Text Field 77', dice: 'Text Field 76', dmgMod: 'Text Field 78', effects: 'Text Field 80' }
  ];

  for (let i = 0; i < attackRowMap.length; i++) {
    const row = attackRowMap[i];
    const atk = attacks[i];
    if (atk) {
      const atkSys = atk.system || {};
      setTextField(form, row.name, atk.name);
      setTextField(form, row.rank, atkSys.rank ?? '');
      const toHitMod = atkSys.toHitMod ?? atkSys.statMod;
      setTextField(form, row.toHitMod, toHitMod != null && toHitMod !== '' ? formatMod(toHitMod) : '');
      setTextField(form, row.dice, atkSys.damageDice ?? atkSys.dice ?? '');
      const dmgMod = atkSys.damageMod ?? atkSys.damageStatMod;
      setTextField(form, row.dmgMod, dmgMod != null && dmgMod !== '' ? formatMod(dmgMod) : '');
      setTextField(form, row.effects, atkSys.effects ?? atkSys.description ?? '');
    }
  }

  // =========================================================================
  // PAGE 2: HOTLIST & GEAR
  // =========================================================================
  // 1. Hotlist (10 slots)
  const hotlistFields = [
    'Text Field 81', 'Text Field 82', 'Text Field 83', 'Text Field 84', 'Text Field 85',
    'Text Field 86', 'Text Field 87', 'Text Field 88', 'Text Field 89', 'Text Field 90'
  ];

  for (let i = 0; i < 10; i++) {
    const slotKey = `slot${i + 1}`;
    const rawVal = hotlist[slotKey];
    if (rawVal) {
      const display = resolveHotlistDisplay(actor, rawVal, items);
      setTextField(form, hotlistFields[i], display);
    }
  }

  // 2. Gear Slots
  const gearSlotMap = {
    head: 'Text Field 92',
    torso: 'Text Field 93',
    arms: 'Text Field 94',
    hands: 'Text Field 95',
    legs: 'Text Field 96',
    feet: 'Text Field 97'
  };

  for (const [slot, fieldName] of Object.entries(gearSlotMap)) {
    const val = gearSlots[slot] || '';
    // Look up equipped gear for this slot
    const equippedItem = gear.find(g => g.system?.equipped && (g.system.slot || '').toLowerCase() === slot);
    const text = equippedItem ? equippedItem.name : val;
    setTextField(form, fieldName, text);
  }

  // Accessories (multi-line)
  const equippedAccessories = gear
    .filter(g => g.system?.equipped && (g.system.slot || '').toLowerCase() === 'accessory')
    .map(g => g.name);
  const accessoriesText = (equippedAccessories.length ? equippedAccessories.join('\n') : gearSlots.accessories) || '';
  setTextField(form, 'Text Field 91', accessoriesText);

  // 3. Details & Character Notes
  setTextField(form, 'Text Field 98', details.popularity || '');
  setTextField(form, 'Text Field 99', details.pastTrauma || '');
  setTextField(form, 'Text Field 100', details.looseEnds || '');
  setTextField(form, 'Text Field 101', details.regrets || '');
  setTextField(form, 'Text Field 102', details.notes || '');

  // =========================================================================
  // PAGE 3: SKILLS & KNOWN SPELLS (20 Rows)
  // Known spells are appended directly to the skills list.
  // =========================================================================
  const skillAndSpellEntries = [...skills, ...spells];
  for (let i = 0; i < 20; i++) {
    const entry = skillAndSpellEntries[i];
    const nameField = `Text Field ${103 + 6 * i}`;
    const rankField = `Text Field ${104 + 6 * i}`;
    const statField = `Text Field ${105 + 6 * i}`;
    const checkTypeField = `Text Field ${106 + 6 * i}`;
    const notesField = `Text Field ${107 + 6 * i}`;
    const checkBox = `Check Box ${i + 1}`;

    if (entry) {
      const sys = entry.system || {};
      const isSpell = entry.type === 'spell';

      if (isSpell) {
        setTextField(form, nameField, entry.name);
        setTextField(form, rankField, sys.rank != null ? sys.rank : 1);

        const statKey = (sys.stat || 'int').toLowerCase();
        const govStat = statKey.toUpperCase();
        const statMod = abilities[statKey]?.mod ?? abilities.int?.mod;
        const statDisplay = statMod != null ? `${govStat} ${formatMod(statMod)}` : govStat;
        setTextField(form, statField, statDisplay);

        const manaCost = sys.manaCost != null ? `${sys.manaCost} MP` : '';
        const spellType = sys.spellType && sys.spellType.toLowerCase() !== 'spell' ? sys.spellType : '';
        let typeDisplay = 'Spell';
        if (spellType && manaCost) {
          typeDisplay = `Spell: ${spellType} (${manaCost})`;
        } else if (manaCost) {
          typeDisplay = `Spell (${manaCost})`;
        } else if (spellType) {
          typeDisplay = `Spell (${spellType})`;
        }
        setTextField(form, checkTypeField, typeDisplay);

        const notesParts = [];
        if (sys.baseDamage) {
          notesParts.push(`Dmg: ${sys.baseDamage}${sys.damageType ? ' ' + sys.damageType : ''}`);
        }
        if (sys.range && sys.range !== 'Self') {
          notesParts.push(`Rng: ${sys.range}`);
        }
        if (sys.duration && sys.duration !== 'Instantaneous') {
          notesParts.push(`Dur: ${sys.duration}`);
        }
        if (sys.description) {
          notesParts.push(sys.description);
        }
        const notesText = notesParts.join(' | ') || sys.quote || sys.notes || '';
        setTextField(form, notesField, notesText);

        setCheckBox(form, checkBox, (Number(sys.rank) || 1) > 0);
      } else {
        setTextField(form, nameField, entry.name);
        setTextField(form, rankField, sys.rank != null ? sys.rank : '');
        const govStat = (sys.stat || sys.governingStat || '').toUpperCase();
        const statMod = sys.statMod != null ? formatMod(sys.statMod) : '';
        const statDisplay = govStat && statMod ? `${govStat} ${statMod}` : (govStat || statMod);
        setTextField(form, statField, statDisplay);
        setTextField(form, checkTypeField, sys.checkType || sys.type || '');
        setTextField(form, notesField, sys.description || sys.notes || '');
        setCheckBox(form, checkBox, (Number(sys.rank) || 0) > 0);
      }
    }
  }

  // =========================================================================
  // PAGE 4: INVENTORY (20 Rows)
  // =========================================================================
  const inventoryItems = [...gear, ...loot];
  for (let i = 0; i < 20; i++) {
    const itemField = `Text Field ${223 + 3 * i}`;
    const qtyField = `Text Field ${224 + 3 * i}`;
    const notesField = `Text Field ${225 + 3 * i}`;
    const it = inventoryItems[i];
    if (it) {
      setTextField(form, itemField, it.name);
      const qty = it.system?.quantity != null ? it.system.quantity : 1;
      setTextField(form, qtyField, qty);
      const notes = it.system?.description || it.system?.notes || '';
      setTextField(form, notesField, notes);
    }
  }

  // =========================================================================
  // PAGE 5: EXTRAS & SPACE
  // =========================================================================
  // Pet (if defined on actor or system)
  const petData = details.pet || system.pet || {};
  if (petData.level != null || petData.name) {
    setTextField(form, 'Text Field 3075', petData.level || 1);
    setTextField(form, 'Text Field 3074', petData.abilities?.str?.value ?? petData.str ?? '');
    setTextField(form, 'Text Field 3076', petData.abilities?.int?.value ?? petData.int ?? '');
    setTextField(form, 'Text Field 3078', petData.abilities?.con?.value ?? petData.con ?? '');
    setTextField(form, 'Text Field 3080', petData.abilities?.dex?.value ?? petData.dex ?? '');
    setTextField(form, 'Text Field 3082', petData.abilities?.cha?.value ?? petData.cha ?? '');
    setTextField(form, 'Text Field 3077', petData.attributes?.dr?.total ?? petData.dr ?? '');
    setTextField(form, 'Text Field 3079', petData.attributes?.evade?.total ?? petData.evade ?? '');
    setTextField(form, 'Text Field 3081', petData.attributes?.speed?.move ?? petData.move ?? '');
    setTextField(form, 'Text Field 3083', petData.attributes?.size ?? petData.size ?? 'Small');
    setTextField(form, 'Text Field 3084', petData.attack1 || '');
    setTextField(form, 'Text Field 3085', petData.attack2 || '');
    setTextField(form, 'Text Field 3086', petData.special || '');

    const petConMod = petData.abilities?.con?.mod ?? petData.conMod ?? petData.abilities?.con?.value;
    const petSlotVal = petConMod ? Number(petConMod) : '';
    const petHpTextFields = ['Text Field 3064', 'Text Field 3065', 'Text Field 3066', 'Text Field 3067', 'Text Field 3068',
                             'Text Field 3069', 'Text Field 3070', 'Text Field 3071', 'Text Field 3072', 'Text Field 3073'];
    const petCheckBoxes = ['Check Box 800', 'Check Box 801', 'Check Box 802', 'Check Box 803', 'Check Box 804',
                           'Check Box 805', 'Check Box 806', 'Check Box 807', 'Check Box 808', 'Check Box 809'];
    for (let i = 0; i < 10; i++) {
      if (petSlotVal) setTextField(form, petHpTextFields[i], petSlotVal);
      setCheckBox(form, petCheckBoxes[i], false);
    }
  }

  // Mount / Vehicle
  const mountData = details.mount || system.mount_vehicle || {};
  if (mountData.size || mountData.move || mountData.occupants) {
    setTextField(form, 'Text Field 3098', mountData.size || '');
    setTextField(form, 'Text Field 3099', mountData.move || '');
    setTextField(form, 'Text Field 30100', mountData.occupants || '');
    setTextField(form, 'Text Field 30101', mountData.dr || '');
    setTextField(form, 'Text Field 30102', mountData.accessories || '');
  }

  // Important Things I've Killed (13 lines: Text Field 30103 to 301015)
  const killLines = splitToLines(details.importantKills, 13);
  for (let i = 0; i < 13; i++) {
    const fieldName = `Text Field ${30103 + i}`;
    setTextField(form, fieldName, killLines[i] || '');
  }

  // Clubs, Societies, Guilds (6 lines: Text Field 301016 to 301021)
  const clubLines = splitToLines(details.clubsSocieties, 6);
  for (let i = 0; i < 6; i++) {
    const fieldName = `Text Field ${301016 + i}`;
    setTextField(form, fieldName, clubLines[i] || '');
  }

  // Personal Space
  const space = details.personalSpace || {};
  setTextField(form, 'Text Field 301022', space.tier || '');
  setTextField(form, 'Text Field 301023', space.size || '');
  const amenityLines = splitToLines(space.amenities, 11);
  for (let i = 0; i < 11; i++) {
    const fieldName = `Text Field ${301024 + i}`;
    setTextField(form, fieldName, amenityLines[i] || '');
  }

  // Deity
  const deityText = details.deity || (deities[0] ? `${deities[0].name}: ${deities[0].system?.description || ''}` : '');
  setTextField(form, 'Text Field 301035', deityText);

  // =========================================================================
  // PAGE 6: ABILITIES & SPONSORS
  // =========================================================================
  // Racial Abilities (22 lines: Text Field 301036, 301038, ..., 301078)
  const racialTraits = [];
  if (races[0]?.system?.description) {
    racialTraits.push(...splitToLines(races[0].system.description, 22));
  } else if (details.racialAbilities) {
    racialTraits.push(...splitToLines(details.racialAbilities, 22));
  }
  for (let i = 0; i < 22; i++) {
    const fieldName = `Text Field ${301036 + 2 * i}`;
    setTextField(form, fieldName, racialTraits[i] || '');
  }

  // Class Abilities (22 lines: Text Field 301037, 301039, ..., 301079)
  const classTraits = [];
  if (classes[0]?.system?.description) {
    classTraits.push(...splitToLines(classes[0].system.description, 22));
  } else if (details.classAbilities) {
    classTraits.push(...splitToLines(details.classAbilities, 22));
  }
  for (let i = 0; i < 22; i++) {
    const fieldName = `Text Field ${301037 + 2 * i}`;
    setTextField(form, fieldName, classTraits[i] || '');
  }

  // Sponsors (3 boxes: Text Field 301080, 301081, 301082)
  const sponsorFields = ['Text Field 301080', 'Text Field 301081', 'Text Field 301082'];
  for (let i = 0; i < 3; i++) {
    const sp = sponsors[i];
    if (sp) {
      const desc = sp.system?.description ? `\n${sp.system.description}` : '';
      setTextField(form, sponsorFields[i], `${sp.name}${desc}`);
    }
  }

  return await pdfDoc.save();
}

/**
 * Downloads or saves the filled PDF document to the user's computer
 * @param {Actor} actor The DCC Crawler Actor
 * @param {object} options
 */
export async function saveCrawlerPdf(actor, options = {}) {
  const pdfBytes = await exportCrawlerToPdf(actor, options);
  const rawName = actor?.name || 'crawler';
  const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_CharacterSheet.pdf`;

  // 1. Foundry VTT saveDataToFile
  if (typeof globalThis.saveDataToFile === 'function') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return globalThis.saveDataToFile(blob, 'application/pdf', filename);
  }

  // 2. Standard browser anchor download
  if (typeof document !== 'undefined' && document.createElement) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
    return filename;
  }

  return pdfBytes;
}
