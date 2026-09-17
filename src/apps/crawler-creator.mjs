/**
 * Dungeon Crawler Carl RPG — Fast Matrix Crawler Character Creator
 * Guided application that generates legal Crawlers from official rulebook matrices,
 * standard stat array [2, 3, 4, 5, 6], species rules, and floor starting options.
 */

import {
  DCC_STANDARD_ARRAY,
  DCC_SPECIES_DATA,
  DCC_BACKGROUND_MATRICES,
  DCC_STARTER_WEAPONS,
  DCC_STARTER_WEAPON_DEFINITIONS,
  getStarterWeaponDefinition,
  DCC_STARTER_SPELLS,
  DCC_STARTER_UNARMED_PACKAGES,
  validateStatArray,
  resolveSkillRanks,
  generateRandomCrawler
} from '../data/crawler-creation.mjs';
import { DCC_BACKGROUND_TABLES, rollBackgroundTable } from '../data/background-tables.mjs';
import { DCC_SIZES, getSizeInfo } from '../data/sizes.mjs';
import { DCC_SKILLS } from '../data/skills.mjs';
import { DCC_SPELLS } from '../data/spells.mjs';
import { getDCCStatModifier } from '../documents/actor.mjs';

const BaseApplication = globalThis.foundry?.appv1?.applications?.Application
  ?? globalThis.Application
  ?? class {};

export class DCCCrawlerCreatorApp extends BaseApplication {
  constructor(options = {}) {
    super(options);

    this.name = options.name || 'Carl';
    this.crawlerNumber = options.crawlerNumber || `#${Math.floor(1000 + Math.random() * 9000)}`;
    this.species = options.species || 'human';
    this.floor = options.floor || '1st Floor';
    this.size = options.size || 'Medium';

    // Background story traits (Step 9: Traumas, Loose Ends, Regrets)
    this.pastTrauma = options.pastTrauma || '';
    this.looseEnds = options.looseEnds || '';
    this.regrets = options.regrets || '';

    // Starter combat loadout (Level 1)
    this.starterMode = options.starterMode || 'weapon'; // 'weapon' | 'spell' | 'unarmed'
    this.starterWeapon = options.starterWeapon || 'Longsword';
    this.starterSpell = options.starterSpell || 'Fire Fingers';
    this.starterUnarmed = options.starterUnarmed || 'pugilism';

    // Standard array assignments for stats
    this.stats = {
      str: options.stats?.str ?? null,
      dex: options.stats?.dex ?? null,
      con: options.stats?.con ?? null,
      int: options.stats?.int ?? null,
      cha: options.stats?.cha ?? null
    };

    // Life Stage Tier Selections
    this.tierSelections = {
      tier1: { background: '', skills: [] },
      tier2: { background: '', skills: [] },
      tier3: { background: '', skills: [] },
      tier4: { background: '', skills: [] }
    };

    this._initializeDefaultSelections();
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-crawler-creator',
      classes: ['dcc-sheet-window', 'dcc-crawler-creator-window'],
      template: 'systems/carl-rpg/templates/apps/crawler-creator.hbs',
      title: 'DCC RPG — Crawler Induction Terminal',
      width: 960,
      height: 840,
      resizable: true
    });
  }

  /**
   * Set sensible default background and skill selections for the current species.
   */
  _initializeDefaultSelections() {
    const matrix = DCC_BACKGROUND_MATRICES[this.species] || DCC_BACKGROUND_MATRICES.human;
    for (let i = 1; i <= 4; i++) {
      const tierKey = `tier${i}`;
      const backgrounds = matrix[tierKey] || [];
      if (backgrounds.length > 0) {
        const bg = backgrounds[0];
        this.tierSelections[tierKey] = {
          background: bg.name,
          skills: [bg.skills[0].name, bg.skills[1].name]
        };
      }
    }

    // Default standard array if not already provided
    if (!this.stats.str && !this.stats.dex && !this.stats.con && !this.stats.int && !this.stats.cha) {
      this.stats = { str: 5, con: 6, int: 2, dex: 4, cha: 3 };
    }
  }

  /** @override */
  async getData() {
    const speciesData = DCC_SPECIES_DATA[this.species] || DCC_SPECIES_DATA.human;
    const matrix = DCC_BACKGROUND_MATRICES[this.species] || DCC_BACKGROUND_MATRICES.human;

    // Stat array validation & remaining pool numbers
    const statValidation = validateStatArray(this.stats);
    const assignedValues = Object.values(this.stats).map(Number).filter(n => Number.isInteger(n) && n > 0);
    const availableNumbers = DCC_STANDARD_ARRAY.map(num => ({
      value: num,
      used: assignedValues.filter(v => v === num).length > 1 ? 'duplicate' : assignedValues.includes(num)
    }));

    const statList = [
      { key: 'str', label: 'Strength', short: 'STR', value: this.stats.str },
      { key: 'dex', label: 'Dexterity', short: 'DEX', value: this.stats.dex },
      { key: 'con', label: 'Constitution', short: 'CON', value: this.stats.con },
      { key: 'int', label: 'Intelligence', short: 'INT', value: this.stats.int },
      { key: 'cha', label: 'Charisma', short: 'CHA', value: this.stats.cha }
    ];

    // Build the 4 life stage tier views
    const tiers = [];
    for (let i = 1; i <= 4; i++) {
      const tierKey = `tier${i}`;
      const label = speciesData.tierLabels[tierKey];
      const rank = speciesData.tierRanks[tierKey];
      const backgrounds = matrix[tierKey] || [];
      const currentSel = this.tierSelections[tierKey] || { background: '', skills: [] };

      const activeBg = backgrounds.find(b => b.name === currentSel.background) || backgrounds[0] || { name: '', skills: [] };
      const selectedSkillSet = new Set((currentSel.skills || []).map(s => s.toLowerCase().trim()));

      const skills = activeBg.skills.map(s => {
        const isChecked = selectedSkillSet.has(s.name.toLowerCase().trim());
        return {
          name: s.name,
          stat: (s.stat || 'none').toUpperCase(),
          checked: isChecked
        };
      });

      tiers.push({
        key: tierKey,
        label,
        rank,
        backgrounds: backgrounds.map(b => ({
          name: b.name,
          selected: b.name === activeBg.name
        })),
        activeBackground: activeBg.name,
        skills,
        selectedCount: currentSel.skills.length,
        isValid: currentSel.skills.length === 2
      });
    }

    // Resolve final skills, ranks, and duplicate warnings
    const resolved = resolveSkillRanks(this.species, this.tierSelections);

    const floorOptions = [
      { value: '1st Floor', label: 'Floor 1 (Level 1)', selected: this.floor === '1st Floor' },
      { value: '2nd Floor', label: 'Floor 2 (Level 2)', selected: this.floor === '2nd Floor' },
      { value: '3rd Floor', label: 'Floor 3 (Level 3)', selected: this.floor === '3rd Floor' },
      { value: '4th Floor', label: 'Floor 4 (Level 4)', selected: this.floor === '4th Floor' },
      { value: '5th Floor', label: 'Floor 5 (Level 5)', selected: this.floor === '5th Floor' }
    ];

    const sizeInfo = getSizeInfo(this.size);
    const sizeOptions = (CONFIG.DCC?.sizes || DCC_SIZES).map(s => ({
      size: s.size,
      name: s.name,
      label: s.label,
      selected: s.size === sizeInfo.size
    }));

    // Starter loadout options (Level 1)
    const starterModeOptions = [
      { key: 'weapon', label: 'Basic Weapon', desc: 'Rank 3 Weapon Skill', icon: 'fa-solid fa-sword', selected: this.starterMode === 'weapon' },
      { key: 'spell', label: 'Starter Spell', desc: 'Rank 3 Spell + 5 Mana Potions', icon: 'fa-solid fa-wand-magic-sparkles', selected: this.starterMode === 'spell' },
      { key: 'unarmed', label: 'Unarmed & Damage Effect', desc: 'Rank 3 H2H & Effect Combo', icon: 'fa-solid fa-hand-fist', selected: this.starterMode === 'unarmed' }
    ];

    const starterWeaponOptions = DCC_STARTER_WEAPONS.map(w => ({
      name: w,
      selected: w === this.starterWeapon
    }));

    const starterSpellOptions = DCC_STARTER_SPELLS.map(sp => ({
      name: sp,
      selected: sp === this.starterSpell
    }));

    const starterUnarmedOptions = DCC_STARTER_UNARMED_PACKAGES.map(pkg => ({
      key: pkg.key,
      name: pkg.name,
      skill: pkg.skill,
      effect: pkg.effect,
      label: pkg.label,
      selected: pkg.key === this.starterUnarmed
    }));

    const activeUnarmedPkg = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === this.starterUnarmed) || DCC_STARTER_UNARMED_PACKAGES[0];

    // Compute display skills incorporating starter package for summary display
    const displaySkillsMap = new Map();
    for (const s of resolved.skills) {
      displaySkillsMap.set(s.name.toLowerCase().trim(), { ...s });
    }

    if (this.starterMode === 'weapon') {
      const norm = this.starterWeapon.toLowerCase().trim();
      const existing = displaySkillsMap.get(norm);
      if (existing) {
        existing.rank = Math.max(existing.rank, 3);
        existing.isStarter = true;
      } else {
        const canonical = (CONFIG.DCC?.skills || DCC_SKILLS).find(cs => cs.name.toLowerCase().trim() === norm);
        displaySkillsMap.set(norm, {
          name: this.starterWeapon,
          rank: 3,
          stat: (canonical?.system?.stat || 'str').toLowerCase(),
          isStarter: true
        });
      }
    } else if (this.starterMode === 'unarmed') {
      for (const sName of [activeUnarmedPkg.skill, activeUnarmedPkg.effect]) {
        const norm = sName.toLowerCase().trim();
        const existing = displaySkillsMap.get(norm);
        if (existing) {
          existing.rank = Math.max(existing.rank, 3);
          existing.isStarter = true;
        } else {
          const canonical = (CONFIG.DCC?.skills || DCC_SKILLS).find(cs => cs.name.toLowerCase().trim() === norm);
          displaySkillsMap.set(norm, {
            name: sName,
            rank: 3,
            stat: (canonical?.system?.stat || 'str').toLowerCase(),
            isStarter: true
          });
        }
      }
    }

    const allTiersValid = tiers.every(t => t.isValid);
    const canCreate = statValidation.valid && allTiersValid && Boolean(this.name?.trim());

    const conMod = getDCCStatModifier(this.stats.con);
    const startingHp = 10 * conMod;
    const startingMana = Number(this.stats.int) || 0;

    const backgroundTables = {
      pastTrauma: {
        key: 'pastTrauma',
        tableNumber: 11,
        name: 'Table 11: Past Traumas',
        value: this.pastTrauma,
        options: DCC_BACKGROUND_TABLES.pastTrauma.results.map(r => ({
          roll: r.roll,
          text: r.text,
          selected: r.text === this.pastTrauma
        }))
      },
      looseEnds: {
        key: 'looseEnds',
        tableNumber: 12,
        name: 'Table 12: Loose Ends',
        value: this.looseEnds,
        options: DCC_BACKGROUND_TABLES.looseEnds.results.map(r => ({
          roll: r.roll,
          text: r.text,
          selected: r.text === this.looseEnds
        }))
      },
      regrets: {
        key: 'regrets',
        tableNumber: 13,
        name: 'Table 13: Regrets',
        value: this.regrets,
        options: DCC_BACKGROUND_TABLES.regrets.results.map(r => ({
          roll: r.roll,
          text: r.text,
          selected: r.text === this.regrets
        }))
      }
    };

    return {
      name: this.name,
      crawlerNumber: this.crawlerNumber,
      species: this.species,
      isHuman: this.species === 'human',
      isAnimal: this.species === 'animal',
      speciesData,
      size: this.size,
      sizeInfo,
      sizeOptions,
      floor: this.floor,
      floorOptions,
      statList,
      standardArray: DCC_STANDARD_ARRAY,
      statValidation,
      availableNumbers,
      startingHp,
      startingMana,
      tiers,
      starterMode: this.starterMode,
      isStarterWeapon: this.starterMode === 'weapon',
      isStarterSpell: this.starterMode === 'spell',
      isStarterUnarmed: this.starterMode === 'unarmed',
      starterWeapon: this.starterWeapon,
      starterSpell: this.starterSpell,
      starterUnarmed: this.starterUnarmed,
      starterUnarmedLabel: activeUnarmedPkg.label,
      starterModeOptions,
      starterWeaponOptions,
      starterSpellOptions,
      starterUnarmedOptions,
      pastTrauma: this.pastTrauma,
      looseEnds: this.looseEnds,
      regrets: this.regrets,
      backgroundTables,
      resolvedSkills: Array.from(displaySkillsMap.values()),
      duplicates: resolved.duplicates,
      warnings: resolved.warnings,
      canCreate
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Species selector toggle
    html.find('input[name="creator-species"]').on('change', ev => {
      const newSpecies = ev.currentTarget.value;
      if (newSpecies !== this.species) {
        this.species = newSpecies;
        this._initializeDefaultSelections();
        this.render(false);
      }
    });

    // Name & Number inputs
    html.find('input[name="creator-name"]').on('input', ev => {
      this.name = ev.currentTarget.value;
    });

    html.find('input[name="creator-number"]').on('input', ev => {
      this.crawlerNumber = ev.currentTarget.value;
    });

    // Floor select
    html.find('select[name="creator-floor"]').on('change', ev => {
      this.floor = ev.currentTarget.value;
    });

    // Size select
    html.find('select[name="creator-size"]').on('change', ev => {
      this.size = ev.currentTarget.value;
      this.render(false);
    });

    // Ability score dropdowns
    html.find('.dcc-stat-select').on('change', ev => {
      const stat = ev.currentTarget.dataset.stat;
      const val = parseInt(ev.currentTarget.value, 10);
      this.stats[stat] = Number.isInteger(val) ? val : null;
      this.render(false);
    });

    // Tier background select
    html.find('.dcc-tier-bg-select').on('change', ev => {
      const tierKey = ev.currentTarget.dataset.tier;
      const newBgName = ev.currentTarget.value;
      const matrix = DCC_BACKGROUND_MATRICES[this.species];
      const bg = matrix[tierKey]?.find(b => b.name === newBgName);

      if (bg) {
        // Automatically select the first 2 skills of the new background as default
        this.tierSelections[tierKey] = {
          background: bg.name,
          skills: [bg.skills[0].name, bg.skills[1].name]
        };
        this.render(false);
      }
    });

    // Skill checkbox toggle (enforcing exactly 2 skills per tier)
    html.find('.dcc-skill-checkbox').on('change', ev => {
      const checkbox = ev.currentTarget;
      const tierKey = checkbox.dataset.tier;
      const skillName = checkbox.dataset.skill;
      const currentSkills = this.tierSelections[tierKey]?.skills || [];

      if (checkbox.checked) {
        if (currentSkills.length >= 2) {
          checkbox.checked = false;
          ui.notifications?.warn(`You may only pick 2 skills for this stage.`);
          return;
        }
        if (!currentSkills.includes(skillName)) {
          currentSkills.push(skillName);
        }
      } else {
        const idx = currentSkills.indexOf(skillName);
        if (idx !== -1) {
          currentSkills.splice(idx, 1);
        }
      }

      this.tierSelections[tierKey].skills = currentSkills;
      this.render(false);
    });

    // Starter mode selection
    html.find('input[name="creator-starter-mode"]').on('change', ev => {
      this.starterMode = ev.currentTarget.value;
      this.render(false);
    });

    html.find('select[name="creator-starter-weapon"]').on('change', ev => {
      this.starterWeapon = ev.currentTarget.value;
      this.render(false);
    });

    html.find('select[name="creator-starter-spell"]').on('change', ev => {
      this.starterSpell = ev.currentTarget.value;
      this.render(false);
    });

    html.find('select[name="creator-starter-unarmed"]').on('change', ev => {
      this.starterUnarmed = ev.currentTarget.value;
      this.render(false);
    });

    // Story Background Traits (Step 9) - Manual Text Input
    html.find('.dcc-trait-input').on('input', ev => {
      const trait = ev.currentTarget.dataset.trait;
      if (trait && trait in this) {
        this[trait] = ev.currentTarget.value;
      }
    });

    // Story Background Traits (Step 9) - Dropdown Select Option
    html.find('.dcc-trait-select').on('change', ev => {
      const trait = ev.currentTarget.dataset.trait;
      const val = ev.currentTarget.value;
      if (trait && trait in this) {
        this[trait] = val;
        this.render(false);
      }
    });

    // Story Background Traits (Step 9) - Roll Single Table (1d12)
    html.find('.dcc-roll-trait-btn').on('click', async ev => {
      ev.preventDefault();
      const trait = ev.currentTarget.dataset.trait;
      if (trait && trait in this) {
        const res = await rollBackgroundTable(trait);
        this[trait] = res.text;
        this.render(false);
        ui.notifications?.info(`Rolled [${res.roll}] on ${res.tableName}: "${res.text}"`);
      }
    });

    // Story Background Traits (Step 9) - Roll All 3 Tables
    html.find('.dcc-roll-all-traits-btn').on('click', async ev => {
      ev.preventDefault();
      const [tRes, lRes, rRes] = await Promise.all([
        rollBackgroundTable('pastTrauma'),
        rollBackgroundTable('looseEnds'),
        rollBackgroundTable('regrets')
      ]);
      this.pastTrauma = tRes.text;
      this.looseEnds = lRes.text;
      this.regrets = rRes.text;
      this.render(false);
      ui.notifications?.info('Rolled all 3 background tables for Past Trauma, Loose Ends, and Regrets.');
    });

    // Randomize button
    html.find('.dcc-randomize-btn').on('click', ev => {
      ev.preventDefault();
      const generated = generateRandomCrawler(this.species, this.floor);
      this.name = generated.name;
      this.crawlerNumber = generated.crawlerNumber;
      this.stats = generated.stats;
      this.tierSelections = generated.tierSelections;
      if (generated.size) this.size = generated.size;
      if (generated.starterMode) this.starterMode = generated.starterMode;
      if (generated.starterWeapon) this.starterWeapon = generated.starterWeapon;
      if (generated.starterSpell) this.starterSpell = generated.starterSpell;
      if (generated.starterUnarmed) this.starterUnarmed = generated.starterUnarmed;
      this.pastTrauma = generated.pastTrauma || '';
      this.looseEnds = generated.looseEnds || '';
      this.regrets = generated.regrets || '';
      this.render(false);
      ui.notifications?.info(`Generated random Crawler build: ${this.name} (${this.species.toUpperCase()})`);
    });

    // Reset button
    html.find('.dcc-reset-btn').on('click', ev => {
      ev.preventDefault();
      this.size = 'Medium';
      this.starterMode = 'weapon';
      this.starterWeapon = 'Longsword';
      this.starterSpell = 'Fire Fingers';
      this.starterUnarmed = 'pugilism';
      this.pastTrauma = '';
      this.looseEnds = '';
      this.regrets = '';
      this._initializeDefaultSelections();
      this.render(false);
    });

    // Create Crawler button
    html.find('.dcc-create-crawler-btn').on('click', async ev => {
      ev.preventDefault();
      await this.createCrawler();
    });
  }

  /**
   * Validate, build document payload, create the Actor, embed all skills, and render the sheet.
   * @returns {Promise<Actor|null>}
   */
  async createCrawler() {
    const statValidation = validateStatArray(this.stats);
    if (!statValidation.valid) {
      ui.notifications?.error(statValidation.error || 'Invalid stat array.');
      return null;
    }

    for (let i = 1; i <= 4; i++) {
      const tierKey = `tier${i}`;
      const sel = this.tierSelections[tierKey];
      if (!sel || sel.skills.length !== 2) {
        ui.notifications?.error(`Please select exactly 2 skills for every stage.`);
        return null;
      }
    }

    const speciesData = DCC_SPECIES_DATA[this.species] || DCC_SPECIES_DATA.human;
    const resolved = resolveSkillRanks(this.species, this.tierSelections);
    const floorNumber = parseInt(this.floor, 10) || 1;

    // Merge skills with starter combat loadout
    const finalSkillsMap = new Map();
    for (const s of resolved.skills) {
      finalSkillsMap.set(s.name.toLowerCase().trim(), { ...s });
    }

    const officialSkills = CONFIG.DCC?.skills || DCC_SKILLS;
    const officialSpells = CONFIG.DCC?.spells || DCC_SPELLS;
    const itemPayloads = [];

    if (this.starterMode === 'weapon') {
      const norm = this.starterWeapon.toLowerCase().trim();
      const existing = finalSkillsMap.get(norm);
      if (existing) {
        existing.rank = Math.max(existing.rank, 3);
      } else {
        const canonical = officialSkills.find(cs => cs.name.toLowerCase().trim() === norm);
        finalSkillsMap.set(norm, {
          name: this.starterWeapon,
          rank: 3,
          stat: canonical?.system?.stat || 'str'
        });
      }
    } else if (this.starterMode === 'unarmed') {
      const activeUnarmedPkg = DCC_STARTER_UNARMED_PACKAGES.find(p => p.key === this.starterUnarmed) || DCC_STARTER_UNARMED_PACKAGES[0];
      for (const sName of [activeUnarmedPkg.skill, activeUnarmedPkg.effect]) {
        const norm = sName.toLowerCase().trim();
        const existing = finalSkillsMap.get(norm);
        if (existing) {
          existing.rank = Math.max(existing.rank, 3);
        } else {
          const canonical = officialSkills.find(cs => cs.name.toLowerCase().trim() === norm);
          finalSkillsMap.set(norm, {
            name: sName,
            rank: 3,
            stat: canonical?.system?.stat || 'str'
          });
        }
      }
    }

    // Build embedded Skill Items
    for (const s of finalSkillsMap.values()) {
      const normName = s.name.toLowerCase().trim();
      const canonical = officialSkills.find(os => os.name.toLowerCase().trim() === normName);

      if (canonical) {
        const itemObj = (globalThis.foundry?.utils?.deepClone ? globalThis.foundry.utils.deepClone(canonical) : structuredClone(canonical));
        itemObj.system = itemObj.system || {};
        itemObj.system.rank = s.rank;
        if (s.stat && s.stat !== 'none') {
          itemObj.system.stat = s.stat.toLowerCase();
        }
        delete itemObj._id;
        delete itemObj.id;
        itemPayloads.push(itemObj);
      } else {
        itemPayloads.push({
          name: s.name,
          type: 'skill',
          img: 'icons/svg/book.svg',
          system: {
            rank: s.rank,
            stat: (s.stat || 'str').toLowerCase(),
            category: 'General',
            checkType: `${(s.stat || 'str').toUpperCase()} Check`,
            notes: `Skill: ${s.name}`,
            damageModifiers: []
          }
        });
      }
    }

    // All crawlers start with the Heal spell at Rank 1
    const healCanonical = officialSpells.find(sp => sp.name.toLowerCase().trim() === 'heal');
    if (healCanonical) {
      const healItem = (globalThis.foundry?.utils?.deepClone ? globalThis.foundry.utils.deepClone(healCanonical) : structuredClone(healCanonical));
      healItem.system = healItem.system || {};
      healItem.system.rank = 1;
      delete healItem._id;
      delete healItem.id;
      itemPayloads.push(healItem);
    } else {
      itemPayloads.push({
        name: 'Heal',
        type: 'spell',
        img: 'icons/svg/heal.svg',
        system: {
          rank: 1,
          stat: 'int',
          manaCost: 2,
          range: 'Self only',
          duration: 'Instantaneous',
          cooldown: 'None',
          spellType: 'Heal',
          damageType: 'Healing',
          baseDamage: '2 Health Bar slots',
          description: 'Heal 2 Health Bar slots.'
        }
      });
    }

    // If starterMode === 'weapon': add the weapon to inventory (gear), equip it, and add an attack using it
    if (this.starterMode === 'weapon') {
      const wDef = getStarterWeaponDefinition(this.starterWeapon);

      // 1. Add weapon to inventory and equip it
      itemPayloads.push({
        name: this.starterWeapon,
        type: 'gear',
        img: wDef.img || 'icons/svg/sword.svg',
        system: {
          slot: 'hands',
          quantity: 1,
          equipped: true,
          drBonus: 0,
          evadeBonus: 0,
          abilityModifiers: {
            str: { value: 0, type: 'flat' },
            int: { value: 0, type: 'flat' },
            con: { value: 0, type: 'flat' },
            dex: { value: 0, type: 'flat' },
            cha: { value: 0, type: 'flat' }
          },
          skillModifiers: [],
          damageParts: [
            {
              type: wDef.damageType,
              dice: wDef.damageDice,
              stat: wDef.damageStat,
              effects: wDef.effects || ''
            }
          ],
          notes: wDef.effects || `Equipped weapon: ${this.starterWeapon}`
        }
      });

      // 2. Add an attack using the equipped item
      itemPayloads.push({
        name: this.starterWeapon,
        type: 'attack',
        img: wDef.img || 'icons/svg/sword.svg',
        system: {
          toHitStat: wDef.toHitStat,
          toHitRank: 3,
          damageDice: wDef.damageDice,
          damageStat: wDef.damageStat,
          damageType: wDef.damageType,
          damageParts: [
            {
              type: wDef.damageType,
              dice: wDef.damageDice,
              stat: wDef.damageStat,
              effects: wDef.effects || ''
            }
          ],
          effects: wDef.effects || ''
        }
      });
    }

    // If starterMode === 'spell': grant starter spell at Rank 3 and 5 Normal Mana Potions
    if (this.starterMode === 'spell') {
      const spellCanonical = officialSpells.find(sp => sp.name.toLowerCase().trim() === this.starterSpell.toLowerCase().trim());
      if (spellCanonical) {
        const spellItem = (globalThis.foundry?.utils?.deepClone ? globalThis.foundry.utils.deepClone(spellCanonical) : structuredClone(spellCanonical));
        spellItem.system = spellItem.system || {};
        spellItem.system.rank = 3;
        delete spellItem._id;
        delete spellItem.id;
        itemPayloads.push(spellItem);
      } else {
        itemPayloads.push({
          name: this.starterSpell,
          type: 'spell',
          img: 'icons/svg/wand.svg',
          system: {
            rank: 3,
            stat: 'int',
            manaCost: 3,
            spellType: 'Attack',
            description: `Starter Spell: ${this.starterSpell}`
          }
        });
      }

      itemPayloads.push({
        name: 'Normal Mana Potion',
        type: 'loot',
        img: 'icons/svg/potion.svg',
        system: {
          quantity: 5,
          notes: 'Refills your mana completely when used.'
        }
      });
    }

    const conMod = getDCCStatModifier(this.stats.con);
    const maxHp = 10 * conMod;
    const maxMana = Number(this.stats.int) || 0;

    const actorPayload = {
      name: this.name.trim() || 'New Crawler',
      type: 'crawler',
      prototypeToken: {
        actorLink: true,
        name: this.name.trim() || 'New Crawler'
      },
      system: {
        abilities: {
          str: { value: this.stats.str, unenhanced: this.stats.str },
          dex: { value: this.stats.dex, unenhanced: this.stats.dex },
          con: { value: this.stats.con, unenhanced: this.stats.con },
          int: { value: this.stats.int, unenhanced: this.stats.int },
          cha: { value: this.stats.cha, unenhanced: this.stats.cha }
        },
        attributes: {
          aiFavor: speciesData.aiFavor,
          size: this.size || 'Medium',
          hp: {
            value: maxHp,
            max: maxHp,
            temp: 0,
            buffTemp: 0,
            pct: 100
          },
          mana: {
            value: maxMana,
            max: maxMana,
            pct: 100
          }
        },
        details: {
          race: speciesData.label,
          floor: this.floor,
          level: floorNumber,
          crawlerNumber: this.crawlerNumber || '',
          pastTrauma: this.pastTrauma || '',
          looseEnds: this.looseEnds || '',
          regrets: this.regrets || ''
        }
      },
      items: itemPayloads
    };

    try {
      const actor = await Actor.create(actorPayload);
      if (actor) {
        // Map hotlist slots
        const hotlistUpdates = {};
        const healItem = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase().trim() === 'heal');

        if (this.starterMode === 'spell') {
          const spellItem = actor.items.find(i => i.type === 'spell' && i.name.toLowerCase().trim() === this.starterSpell.toLowerCase().trim());
          const potionItem = actor.items.find(i => i.type === 'loot' && i.name.toLowerCase().trim() === 'normal mana potion');
          if (spellItem) hotlistUpdates['system.hotlist.slot1'] = spellItem.id;
          if (healItem) hotlistUpdates['system.hotlist.slot2'] = healItem.id;
          if (potionItem) hotlistUpdates['system.hotlist.slot3'] = potionItem.id;
        } else if (this.starterMode === 'weapon') {
          const attackItem = actor.items.find(i => i.type === 'attack' && i.name.toLowerCase().trim() === this.starterWeapon.toLowerCase().trim());
          if (healItem) hotlistUpdates['system.hotlist.slot1'] = healItem.id;
          if (attackItem) hotlistUpdates['system.hotlist.slot2'] = attackItem.id;
        } else {
          if (healItem) hotlistUpdates['system.hotlist.slot1'] = healItem.id;
        }

        if (Object.keys(hotlistUpdates).length > 0) {
          await actor.update(hotlistUpdates);
        }

        ui.notifications?.info(`Crawler "${actor.name}" has entered the dungeon!`);
        this.close();
        if (actor.sheet) {
          actor.sheet.render(true);
        }
        return actor;
      }
    } catch (err) {
      console.error('DCC RPG | Failed to create crawler:', err);
      ui.notifications?.error(`Failed to create Crawler: ${err.message}`);
    }

    return null;
  }
}
