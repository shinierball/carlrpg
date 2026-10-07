import { DCCSkillManager } from '../apps/skill-manager.mjs';
import { DCC_BUFFS, DCC_DEBUFFS } from '../data/buffs.mjs';
import { DCC_SPELLS } from '../data/spells.mjs';
import { DCCRaceClassApplier } from '../data/race-class-applier.mjs';

/**
 * Dungeon Crawler Carl Item Sheet Controller
 * Extends ItemSheet (FormApplication V1) for native Foundry V12/V13 stability,
 * while maintaining Application V2 structure (_prepareContext, DEFAULT_OPTIONS, PARTS).
 */
const BaseItemSheet = globalThis.foundry?.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;

export class DCCItemSheet extends BaseItemSheet {
  constructor(itemOrOptions, options = {}) {
    let itemDoc = itemOrOptions;
    let sheetOptions = options;
    if (itemOrOptions && typeof itemOrOptions === 'object' && itemOrOptions.document) {
      itemDoc = itemOrOptions.document;
      sheetOptions = itemOrOptions;
    }
    super(itemDoc, sheetOptions);
  }

  /**
   * Application V2 Options
   */
  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['dcc-sheet-window', 'item'],
    position: {
      width: 580,
      height: 640
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  /**
   * Application V2 Parts definition
   */
  static PARTS = {
    sheet: {
      template: 'systems/carl-rpg/templates/items/item-sheet.hbs'
    }
  };

  /** @override (V1 compatibility) */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions || {}, {
      classes: ['dcc-sheet-window', 'item'],
      template: 'systems/carl-rpg/templates/items/item-sheet.hbs',
      width: 580,
      height: 640,
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false,
      dragDrop: [{ dragSelector: null, dropSelector: null }]
    });
  }

  /**
   * Retrieve all skills from the DCC compendium pack, CONFIG fallback, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getCompendiumSkills() {
    const skillsMap = new Map();

    // 1. From compendium pack carl-rpg.skills
    const pack = game.packs?.get('carl-rpg.skills');
    if (pack) {
      try {
        const index = await pack.getIndex({ fields: ['system.stat', 'system.checkType', 'system.category', 'system.skillType', 'system.type', 'system.notes', 'img'] });
        for (const entry of index) {
          skillsMap.set(entry.name.toLowerCase().trim(), {
            id: entry._id,
            name: entry.name,
            img: entry.img || 'icons/svg/book.svg',
            system: {
              stat: entry.system?.stat || 'str',
              skillType: entry.system?.skillType || entry.system?.type || 'Utility',
              type: entry.system?.type || entry.system?.skillType || 'Utility',
              checkType: entry.system?.checkType || 'Stat Check',
              category: entry.system?.category || 'Utility',
              notes: entry.system?.notes || ''
            }
          });
        }
      } catch (err) {
        console.warn('DCC RPG | Could not load skills pack index:', err);
      }
    }

    // 2. From CONFIG.DCC.skills (defined in src/data/skills.mjs)
    if (CONFIG.DCC?.skills) {
      for (const s of CONFIG.DCC.skills) {
        const key = s.name.toLowerCase().trim();
        if (!skillsMap.has(key)) {
          skillsMap.set(key, {
            id: s._id,
            name: s.name,
            img: s.img || 'icons/svg/book.svg',
            system: {
              stat: s.system?.stat || 'str',
              skillType: s.system?.skillType || s.system?.type || 'Utility',
              type: s.system?.type || s.system?.skillType || 'Utility',
              checkType: s.system?.checkType || 'Stat Check',
              category: s.system?.category || 'Utility',
              notes: s.system?.notes || ''
            }
          });
        }
      }
    }

    // 3. World skills created by user
    if (game.items) {
      for (const item of game.items) {
        if (item.type === 'skill') {
          const key = item.name.toLowerCase().trim();
          if (!skillsMap.has(key)) {
            skillsMap.set(key, {
              id: item.id,
              name: item.name,
              img: item.img || 'icons/svg/book.svg',
              system: {
                stat: item.system?.stat || 'str',
                skillType: item.system?.skillType || item.system?.type || 'Utility',
                type: item.system?.type || item.system?.skillType || 'Utility',
                checkType: item.system?.checkType || 'Stat Check',
                category: item.system?.category || 'General',
                notes: item.system?.notes || ''
              }
            });
          }
        }
      }
    }

    return Array.from(skillsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieve all canonical buffs from CONFIG.DCC.buffs, compendiums, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getAvailableBuffs() {
    const map = new Map();
    const baseBuffs = CONFIG.DCC?.buffs || DCC_BUFFS || [];
    for (const b of baseBuffs) {
      const key = (b.name || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, {
          id: b._id || b.id || b.name,
          name: b.name,
          type: 'buff',
          img: b.img || 'icons/svg/aura.svg',
          system: b.system || {}
        });
      }
    }
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'buff') {
          const key = item.name.toLowerCase().trim();
          if (key && !map.has(key)) {
            map.set(key, {
              id: item.id,
              name: item.name,
              type: 'buff',
              img: item.img || 'icons/svg/aura.svg',
              system: item.system || {}
            });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieve all canonical debuffs from CONFIG.DCC.debuffs, compendiums, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getAvailableDebuffs() {
    const map = new Map();
    const baseDebuffs = CONFIG.DCC?.debuffs || DCC_DEBUFFS || [];
    for (const d of baseDebuffs) {
      const key = (d.name || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, {
          id: d._id || d.id || d.name,
          name: d.name,
          type: 'debuff',
          img: d.img || 'icons/svg/skull.svg',
          system: d.system || {}
        });
      }
    }
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'debuff') {
          const key = item.name.toLowerCase().trim();
          if (key && !map.has(key)) {
            map.set(key, {
              id: item.id,
              name: item.name,
              type: 'debuff',
              img: item.img || 'icons/svg/skull.svg',
              system: item.system || {}
            });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieve all canonical and custom spells from CONFIG.DCC.spells, compendiums, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getAvailableSpells() {
    const map = new Map();
    const baseSpells = CONFIG.DCC?.spells || DCC_SPELLS || [];
    for (const s of baseSpells) {
      const key = (s.name || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, {
          id: s._id || s.id || s.name,
          name: s.name,
          type: 'spell',
          img: s.img || 'icons/svg/daze.svg',
          system: s.system || {}
        });
      }
    }
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'spell') {
          const key = item.name.toLowerCase().trim();
          if (key && !map.has(key)) {
            map.set(key, {
              id: item.id,
              name: item.name,
              type: 'spell',
              img: item.img || 'icons/svg/daze.svg',
              system: item.system || {}
            });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieve all available RollTables from world and compendiums.
   * @returns {Promise<Array<object>>}
   */
  async getAvailableRollTables() {
    const tables = [];
    if (typeof game !== 'undefined' && game.tables) {
      for (const t of game.tables) {
        tables.push({
          id: t.id || t._id,
          uuid: t.uuid || t.id,
          name: t.name,
          img: t.img || 'icons/svg/d20-grey.svg'
        });
      }
    }
    return tables.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Helper to normalize skillModifiers to an array regardless of whether it's an Array or Object.
   * @param {Array|object} raw
   * @returns {Array<{name: string, bonus: number}>}
   */
  _normalizeSkillModifiers(raw) {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (typeof raw === 'object' ? Object.values(raw) : []);
    return list
      .filter(m => m && (m.name || '').trim())
      .map(m => ({
        name: (m.name || '').trim(),
        bonus: Number(m.bonus) || 0
      }));
  }

  /**
   * Application V2 context preparation
   * @override
   */
  async _prepareContext(options = {}) {
    const context = (typeof super._prepareContext === 'function')
      ? await super._prepareContext(options)
      : (typeof super.getData === 'function' ? await super.getData(options) : {});

    const item = this.item || this.document || this.object;
    context.item = item;
    context.document = item;
    context.data = item;
    context.system = item?.system || context.system || {};
    context.abilities = {
      str: 'Strength',
      int: 'Intelligence',
      con: 'Constitution',
      dex: 'Dexterity',
      cha: 'Charisma'
    };

    // Determine Value capability check for Item Sheet
    const actor = item.actor;
    const determineValueRank = actor
      ? (typeof actor.getDetermineValueRank === 'function' ? actor.getDetermineValueRank() : (typeof actor.getSkillRank === 'function' ? actor.getSkillRank('Determine Value') : 0))
      : 10;
    const isGM = Boolean(globalThis.game?.user?.isGM);
    context.isGM = isGM;
    context.canSeeItemValue = !actor || determineValueRank >= 10;
    context.determineValueRank = determineValueRank;
    context.goldValue = Number(item.system?.value ?? item.goldValue ?? 0);

    // Ensure skillModifiers array exists and handles object fallback
    let skillMods = context.system.skillModifiers;
    if (skillMods && !Array.isArray(skillMods) && typeof skillMods === 'object') {
      skillMods = Object.values(skillMods);
    }
    context.system.skillModifiers = Array.isArray(skillMods) ? skillMods : [];

    // Ensure statModifiers and damageModifiers arrays exist for buff, debuff, skill, and spell
    if (['buff', 'debuff', 'skill', 'spell'].includes(context.item.type)) {
      let statMods = context.system.statModifiers;
      if (statMods && !Array.isArray(statMods) && typeof statMods === 'object') {
        statMods = Object.values(statMods);
      }
      if (context.item.type === 'buff' || context.item.type === 'debuff') {
        context.system.statModifiers = Array.isArray(statMods) ? statMods : [];
      }

      let dmgMods = context.system.damageModifiers;
      if (dmgMods && !Array.isArray(dmgMods) && typeof dmgMods === 'object') {
        dmgMods = Object.values(dmgMods);
      }
      context.system.damageModifiers = Array.isArray(dmgMods) ? dmgMods : [];
    }

    // Ensure abilityModifiers structure exists with { value, type: 'flat' | 'pct' }
    if (!context.system.abilityModifiers) {
      context.system.abilityModifiers = {};
    }
    for (const key of ['str', 'int', 'con', 'dex', 'cha']) {
      if (!context.system.abilityModifiers[key]) {
        context.system.abilityModifiers[key] = { value: 0, type: 'flat' };
      } else {
        const mod = context.system.abilityModifiers[key];
        if (mod.value === undefined || mod.value === null || mod.value === '') {
          if (mod.pct) {
            mod.value = mod.pct;
            mod.type = 'pct';
          } else if (mod.flat) {
            mod.value = mod.flat;
            mod.type = 'flat';
          } else {
            mod.value = 0;
            mod.type = 'flat';
          }
        }
        if (!mod.type) mod.type = 'flat';
      }
    }

    // Retrieve available compendium skills for datalist & interactive picking
    context.availableSkills = await this.getCompendiumSkills();

    if (context.item.type === 'attack') {
      const optEff = context.system.optionalEffects;
      if (Array.isArray(optEff)) {
        context.optionalEffectsDisplay = optEff.map(e => (typeof e === 'string' ? e : e?.name || '')).filter(Boolean).join(', ');
      } else if (typeof optEff === 'string') {
        context.optionalEffectsDisplay = optEff;
      } else {
        context.optionalEffectsDisplay = '';
      }
    }

    if (context.item.type === 'skill') {
      const base = Number(context.system.rank) || 0;
      const boons = Number(context.system.boonBonus) || 0;
      const items = Number(context.system.itemBonus) || 0;
      context.system.modifiedRank = Math.max(0, base + boons + items);
    }

    if (context.item.type === 'spell') {
      const actor = this.item.actor || null;
      const dmgData = actor && typeof actor.getSpellDamageData === 'function'
        ? actor.getSpellDamageData(this.item)
        : null;
      if (dmgData) {
        context.hasDamage = dmgData.hasDamage;
        context.damageFormula = dmgData.formula;
      } else {
        const sys = context.item.system || {};
        const baseDmg = (sys.baseDamage || '').trim();
        const hasMods = Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0;
        context.hasDamage = Boolean((baseDmg || hasMods) && sys.spellType !== 'Heal' && !/health bar|resistance/i.test(baseDmg));
        context.damageFormula = sys.baseDamage || (hasMods ? sys.damageModifiers.map(m => m.dice || m.value).filter(Boolean).join(' + ') : '');
      }
    }

    context.damageTypes = CONFIG.DCC?.damageTypes || [
      'Acid', 'Bludgeoning', 'Electric', 'Fire', 'Force',
      'Holy', 'Ice', 'Necrotic', 'Piercing', 'Poison',
      'Psychic', 'Slashing', 'Sonic'
    ];

    // Weapon proficiency & wielding configuration options
    context.weaponCategories = [
      'Power Weapons', 'Edge', 'Bashing', 'Reach', 'Ranged', 'Hand to Hand', 'Utility', 'Exotic'
    ];
    context.proficiencyModes = [
      { id: 'highest', label: 'Highest Precedence (Specialization)' },
      { id: 'synergy', label: 'Tiered Synergy (+1 per R3+ Secondary)' },
      { id: 'manual', label: 'Manual Selection' }
    ];
    context.wieldModes = [
      { id: 'one_handed', label: 'One-Handed' },
      { id: 'two_handed', label: 'Two-Handed' },
      { id: 'two_handed_disadv_1h', label: 'Two-Handed (Disadvantage if 1-Handed)' }
    ];

    // Format array fields as editable comma-separated strings
    context.associatedSkillsString = Array.isArray(context.system?.associatedSkills)
      ? context.system.associatedSkills.join(', ')
      : (context.system?.associatedSkills || '');

    context.appliesToString = Array.isArray(context.system?.appliesTo)
      ? context.system.appliesTo.join(', ')
      : (context.system?.appliesTo || '');

    context.optionalEffectsString = Array.isArray(context.system?.optionalEffects)
      ? context.system.optionalEffects.join(', ')
      : (context.system?.optionalEffects || '');

    context.availableBuffs = await this.getAvailableBuffs();
    context.availableDebuffs = await this.getAvailableDebuffs();
    context.availableSpells = await this.getAvailableSpells();
    context.availableRollTables = await this.getAvailableRollTables();

    // Prepare Rank Breaks configuration for skills and spells (Ranks 5, 10, 15, 20)
    if (['skill', 'spell'].includes(context.item.type)) {
      if (!context.system.rankBreaks) context.system.rankBreaks = {};
      for (const rKey of ['rank5', 'rank10', 'rank15', 'rank20']) {
        if (!context.system.rankBreaks[rKey]) {
          context.system.rankBreaks[rKey] = {
            damageDice: '',
            rankDamageDice: 0,
            buffsResistances: '',
            debuff: '',
            notes: ''
          };
        } else {
          context.system.rankBreaks[rKey].damageDice = context.system.rankBreaks[rKey].damageDice || '';
          context.system.rankBreaks[rKey].rankDamageDice = Number(context.system.rankBreaks[rKey].rankDamageDice) || 0;
          context.system.rankBreaks[rKey].buffsResistances = context.system.rankBreaks[rKey].buffsResistances || '';
          context.system.rankBreaks[rKey].debuff = context.system.rankBreaks[rKey].debuff || '';
          context.system.rankBreaks[rKey].notes = context.system.rankBreaks[rKey].notes || (context.system.upgrades?.[rKey] || '');
        }
      }
    }

    if (context.item.type === 'loot') {
      const lootType = String(context.system?.lootType || '').toLowerCase().trim();
      context.isScratchTicket = lootType === 'scratch_ticket' || lootType === 'scratch-off-ticket' || lootType.includes('scratch');
      const isRandomMode = context.isScratchTicket || context.system?.executionMode === 'random';
      context.isRandomMode = isRandomMode;

      let outcomes = context.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      let totalWeight = 0;
      if (Array.isArray(outcomes)) {
        for (const out of outcomes) {
          if (!out) continue;
          // Ensure weight is strictly numeric integer
          let w = out.weight;
          if (typeof w === 'string') {
            const digits = w.trim().replace(/[^0-9]/g, '');
            w = digits === '' ? 0 : parseInt(digits, 10);
          } else if (typeof w === 'number') {
            w = Number.isFinite(w) ? Math.floor(w) : 0;
          } else {
            w = 0;
          }
          out.weight = Math.max(0, w);
          totalWeight += out.weight;

          if (out.type === 'buff' || out.type === 'debuff') {
            out.damage = '';
            out.damageType = '';
          }
          out.buffOptions = context.availableBuffs.map(b => ({
            id: b.id,
            name: b.name,
            selected: Boolean((out.buffId && (out.buffId === b.id || out.buffId === b.name)) || (out.name && out.name.toLowerCase() === b.name.toLowerCase()))
          }));
          out.debuffOptions = context.availableDebuffs.map(d => ({
            id: d.id,
            name: d.name,
            selected: Boolean((out.debuffId && (out.debuffId === d.id || out.debuffId === d.name)) || (out.name && out.name.toLowerCase() === d.name.toLowerCase()))
          }));
          out.spellOptions = context.availableSpells.map(s => ({
            id: s.id,
            name: s.name,
            selected: Boolean((out.spellId && out.spellId === s.id) || (out.name && out.name.toLowerCase() === s.name.toLowerCase()))
          }));
          out.tableOptions = context.availableRollTables.map(t => ({
            id: t.id,
            uuid: t.uuid,
            name: t.name,
            selected: Boolean((out.tableUuid && (out.tableUuid === t.uuid || out.tableUuid === t.id)) || (out.name && out.name.toLowerCase() === t.name.toLowerCase()))
          }));
          out.skillOptions = (context.availableSkills || []).map(sk => ({
            name: sk.name,
            selected: Boolean((out.skillName && out.skillName.toLowerCase() === sk.name.toLowerCase()) || (out.name && out.name.toLowerCase() === sk.name.toLowerCase()))
          }));
        }
        context.system.outcomes = outcomes;
      }
      context.outcomesTotalWeight = totalWeight;
      context.isWeightValid = totalWeight === 100;
      context.weightWarning = isRandomMode ? (outcomes?.length > 0 && totalWeight !== 100) : false;
    }

    if (context.item.type === 'gear') {
      let outcomes = context.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      let totalWeight = 0;
      if (Array.isArray(outcomes)) {
        for (const out of outcomes) {
          if (!out) continue;
          let w = out.weight;
          if (typeof w === 'string') {
            const digits = w.trim().replace(/[^0-9]/g, '');
            w = digits === '' ? 0 : parseInt(digits, 10);
          } else if (typeof w === 'number') {
            w = Number.isFinite(w) ? Math.floor(w) : 0;
          } else {
            w = 0;
          }
          out.weight = Math.max(0, w);
          totalWeight += out.weight;

          if (out.type === 'buff' || out.type === 'debuff') {
            out.damage = '';
            out.damageType = '';
          }
          out.buffOptions = context.availableBuffs.map(b => ({
            id: b.id,
            name: b.name,
            selected: Boolean((out.buffId && (out.buffId === b.id || out.buffId === b.name)) || (out.name && out.name.toLowerCase() === b.name.toLowerCase()))
          }));
          out.debuffOptions = context.availableDebuffs.map(d => ({
            id: d.id,
            name: d.name,
            selected: Boolean((out.debuffId && (out.debuffId === d.id || out.debuffId === d.name)) || (out.name && out.name.toLowerCase() === d.name.toLowerCase()))
          }));
          out.spellOptions = context.availableSpells.map(s => ({
            id: s.id,
            name: s.name,
            selected: Boolean((out.spellId && out.spellId === s.id) || (out.name && out.name.toLowerCase() === s.name.toLowerCase()))
          }));
          out.tableOptions = context.availableRollTables.map(t => ({
            id: t.id,
            uuid: t.uuid,
            name: t.name,
            selected: Boolean((out.tableUuid && (out.tableUuid === t.uuid || out.tableUuid === t.id)) || (out.name && out.name.toLowerCase() === t.name.toLowerCase()))
          }));
          out.skillOptions = (context.availableSkills || []).map(sk => ({
            name: sk.name,
            selected: Boolean((out.skillName && out.skillName.toLowerCase() === sk.name.toLowerCase()) || (out.name && out.name.toLowerCase() === sk.name.toLowerCase()))
          }));
        }
        context.system.outcomes = outcomes;
      }
      context.outcomesTotalWeight = totalWeight;
      context.isWeightValid = totalWeight === 100;
    }

    if (context.item.type === 'race') {
      const bonuses = DCCRaceClassApplier.parseRaceBonuses(this.item);
      context.parsedBonuses = bonuses;
      context.heritage = this.item.system?.heritage || bonuses?.heritage || 'Earth';
      context.size = this.item.system?.size || bonuses?.sizeRaw || 'Medium (4)';
      context.prerequisites = this.item.system?.prerequisites || '';
      context.perksList = Array.isArray(this.item.system?.perks) ? this.item.system.perks : (this.item.perks || []);
    }

    if (context.item.type === 'class') {
      const bonuses = DCCRaceClassApplier.parseClassBonuses(this.item);
      context.parsedBonuses = bonuses;
      context.archetype = this.item.system?.archetype || this.item.system?.classType || bonuses?.classType || 'Fighter';
      context.prerequisites = this.item.system?.prerequisites || '';
      context.perksList = Array.isArray(this.item.system?.perks) ? this.item.system.perks : (this.item.perks || []);
    }

    return context;
  }

  /**
   * Compatibility method for FormApplication V1 callers
   * @override
   */
  async getData(options) {
    return this._prepareContext(options);
  }

  /**
   * Application V2 render hook
   * @override
   */
  _onRender(context, options) {
    if (typeof super._onRender === 'function') {
      super._onRender(context, options);
    }
    if (this.element) {
      const $el = globalThis.$ ? globalThis.$(this.element) : this.element;
      this.activateListeners($el);
    }
  }

  /**
   * Open interactive modal to choose skills from the DCC Skill Library & Manager for this item
   * @param {number|null} targetIndex If provided, selects a skill to replace the given row index
   */
  async _openSkillPicker(targetIndex = null) {
    new DCCSkillManager({ item: this.item, targetIndex }).render(true);
  }

  /** @override */
  async _onDrop(event) {
    const TextEditorClass = globalThis.foundry?.applications?.ux?.TextEditor?.implementation
      ?? globalThis.foundry?.applications?.ux?.TextEditor
      ?? globalThis.TextEditor;
    const data = TextEditorClass?.getDragEventData ? TextEditorClass.getDragEventData(event) : null;
    if (data?.type === 'Item') {
      const ItemClass = CONFIG.Item?.documentClass
        ?? globalThis.foundry?.documents?.Item
        ?? globalThis.Item;
      const item = await (ItemClass?.implementation?.fromDropData
        ? ItemClass.implementation.fromDropData(data)
        : (ItemClass?.fromDropData ? ItemClass.fromDropData(data) : null));
      if (item && item.type === 'skill') {
        const current = this._normalizeSkillModifiers(this.item.system?.skillModifiers);
        const existing = current.find(m => m.name.toLowerCase() === item.name.toLowerCase().trim());
        if (existing) {
          existing.bonus = (Number(existing.bonus) || 0) + 1;
        } else {
          current.push({ name: item.name.trim(), bonus: 1 });
        }
        await this.item.update({ 'system.skillModifiers': current });
        if (this.item.actor?.sheet?.rendered) {
          this.item.actor.render(false);
        }
        ui.notifications?.info(`Added "${item.name}" skill modifier to ${this.item.name}.`);
        return;
      }
    }
    if (super._onDrop) return super._onDrop(event);
  }

  /** @override */
  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);

    if (this.item.type === 'gear') {
      let mods = expanded.system?.skillModifiers;
      if (mods !== undefined) {
        expanded.system.skillModifiers = this._normalizeSkillModifiers(mods);
      } else {
        expanded.system = expanded.system || {};
        expanded.system.skillModifiers = [];
      }

      // Remove flattened dot-notation system.skillModifiers.* keys from formData
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.skillModifiers')) {
          delete formData[key];
        }
      }

      formData['system.skillModifiers'] = expanded.system.skillModifiers;
    }

    if (this.item.type === 'attack' || this.item.type === 'gear') {
      let parts = expanded.system?.damageParts;
      if (parts !== undefined) {
        expanded.system.damageParts = Array.isArray(parts) ? parts : Object.values(parts);
      } else {
        expanded.system = expanded.system || {};
        expanded.system.damageParts = [];
      }
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.damageParts')) {
          delete formData[key];
        }
      }
      formData['system.damageParts'] = expanded.system.damageParts;

      if (typeof formData['system.associatedSkills'] === 'string') {
        formData['system.associatedSkills'] = formData['system.associatedSkills']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      if (typeof formData['system.optionalEffects'] === 'string') {
        formData['system.optionalEffects'] = formData['system.optionalEffects']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    if (this.item.type === 'skill' || this.item.type === 'spell') {
      if (typeof formData['system.appliesTo'] === 'string') {
        formData['system.appliesTo'] = formData['system.appliesTo']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      if (typeof formData['system.optionalEffects'] === 'string') {
        formData['system.optionalEffects'] = formData['system.optionalEffects']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      let mods = expanded.system?.damageModifiers;
      if (mods !== undefined) {
        expanded.system.damageModifiers = Array.isArray(mods) ? mods : Object.values(mods);
      } else {
        expanded.system = expanded.system || {};
        expanded.system.damageModifiers = [];
      }
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.damageModifiers')) {
          delete formData[key];
        }
      }
      formData['system.damageModifiers'] = expanded.system.damageModifiers;

      if (expanded.system?.rankBreaks) {
        const cleanedBreaks = {};
        for (const rKey of ['rank5', 'rank10', 'rank15', 'rank20']) {
          const raw = expanded.system.rankBreaks[rKey] || {};
          cleanedBreaks[rKey] = {
            damageDice: (raw.damageDice || '').trim(),
            rankDamageDice: parseInt(raw.rankDamageDice, 10) || 0,
            buffsResistances: (raw.buffsResistances || '').trim(),
            debuff: (raw.debuff || '').trim(),
            notes: (raw.notes || '').trim()
          };
        }
        for (const key of Object.keys(formData)) {
          if (key.startsWith('system.rankBreaks')) {
            delete formData[key];
          }
        }
        formData['system.rankBreaks'] = cleanedBreaks;

        // Keep legacy upgrades synchronized
        if (this.item.type === 'spell' && !formData['system.upgrades']) {
          formData['system.upgrades'] = {
            rank5: cleanedBreaks.rank5.notes,
            rank10: cleanedBreaks.rank10.notes,
            rank15: cleanedBreaks.rank15.notes,
            rank20: cleanedBreaks.rank20.notes
          };
        }
      }
    }

    if (this.item.type === 'buff' || this.item.type === 'debuff') {
      let statMods = expanded.system?.statModifiers;
      if (statMods !== undefined) {
        expanded.system.statModifiers = Array.isArray(statMods) ? statMods : Object.values(statMods);
      } else {
        expanded.system = expanded.system || {};
        expanded.system.statModifiers = [];
      }
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.statModifiers')) {
          delete formData[key];
        }
      }
      formData['system.statModifiers'] = expanded.system.statModifiers;

      let dmgMods = expanded.system?.damageModifiers;
      if (dmgMods !== undefined) {
        expanded.system.damageModifiers = Array.isArray(dmgMods) ? dmgMods : Object.values(dmgMods);
      } else {
        expanded.system = expanded.system || {};
        expanded.system.damageModifiers = [];
      }
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.damageModifiers')) {
          delete formData[key];
        }
      }
      formData['system.damageModifiers'] = expanded.system.damageModifiers;
    }

    if (this.item.type === 'loot' || this.item.type === 'gear') {
      let outcomes = expanded.system?.outcomes;
      if (outcomes !== undefined) {
        outcomes = Array.isArray(outcomes) ? outcomes : Object.values(outcomes);
        let totalWeight = 0;
        for (const out of outcomes) {
          if (!out) continue;
          // Ensure weights are strictly numeric integer
          let w = out.weight;
          if (typeof w === 'string') {
            const digits = w.trim().replace(/[^0-9]/g, '');
            w = digits === '' ? 0 : parseInt(digits, 10);
          } else if (typeof w === 'number') {
            w = Number.isFinite(w) ? Math.floor(w) : 0;
          } else {
            w = 0;
          }
          out.weight = Math.max(0, w);
          totalWeight += out.weight;

          if (out.type === 'buff' || out.type === 'debuff') {
            out.damage = '';
            out.damageType = '';
          }
          if (out.type === 'heal' || out.type === 'heal_over_time') {
            out.healBars = Number(out.healBars) || 1;
          }
          if (out.type === 'heal_over_time') {
            out.rounds = Number(out.rounds) || 3;
          }
          if (out.type === 'skill_rank') {
            out.rankBonus = Number(out.rankBonus ?? out.bonus ?? out.delta) || 1;
          }
          if (out.type === 'stat_permanent') {
            out.value = Number(out.value ?? out.bonus ?? out.delta) || 1;
          }
        }
        expanded.system.outcomes = outcomes;

        const lootType = String(expanded.system?.lootType || this.item.system?.lootType || '').toLowerCase().trim();
        const isScratch = lootType === 'scratch_ticket' || lootType === 'scratch-off-ticket' || lootType.includes('scratch');
        const execMode = String(expanded.system?.executionMode || this.item.system?.executionMode || '').toLowerCase().trim();
        const isRandom = execMode === 'random' || isScratch;
        if (isRandom && outcomes.length > 0 && totalWeight !== 100) {
          if (typeof ui !== 'undefined' && ui?.notifications?.warn) {
            ui.notifications.warn(`Warning: Total weight of scratch-off ticket outcomes is ${totalWeight}% (must equal 100%).`);
          }
        }
      } else {
        expanded.system = expanded.system || {};
        expanded.system.outcomes = [];
      }
      for (const key of Object.keys(formData)) {
        if (key.startsWith('system.outcomes')) {
          delete formData[key];
        }
      }
      formData['system.outcomes'] = expanded.system.outcomes;
    }

    if (this.item.type === 'attack') {
      if (typeof formData['system.optionalEffects'] === 'string') {
        formData['system.optionalEffects'] = formData['system.optionalEffects']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    const result = (typeof super._updateObject === 'function')
      ? await super._updateObject(event, formData)
      : await this.item.update(formData);

    // Re-render parent actor sheet if open so skills tab reflects changes immediately
    if (this.item.actor?.sheet?.rendered) {
      this.item.actor.render(false);
    }

    return result;
  }

  /** @override */
  activateListeners(html) {
    if (typeof super.activateListeners === 'function') {
      super.activateListeners(html);
    }

    if (!this.isEditable) return;

    // Immediate blur save
    html.find('input, select, textarea').on('blur', () => {
      this.submit();
    });

    // Add Skill Modifier from DCC Compendium
    html.find('.add-skill-mod').click(ev => {
      ev.preventDefault();
      this._openSkillPicker();
    });

    // Broadcast Achievement
    html.find('.dcc-broadcast-achievement-btn').click(async ev => {
      ev.preventDefault();
      if (typeof this.item.announce === 'function') {
        await this.item.announce();
      }
    });

    // Pick Skill from Compendium for a specific row
    html.find('.pick-skill-for-row').click(ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      this._openSkillPicker(idx);
    });

    // Delete Skill Modifier
    html.find('.delete-skill-mod').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = this._normalizeSkillModifiers(this.item.system?.skillModifiers);
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.skillModifiers': current });
        if (this.item.actor?.sheet?.rendered) {
          this.item.actor.render(false);
        }
      }
    });

    // Change Loot Type (show/hide scratch-off table reactively)
    html.find('.loot-type-select').change(async ev => {
      ev.preventDefault();
      const newType = $(ev.currentTarget).val();
      await this.item.update({ 'system.lootType': newType });
      this.render(false);
    });

    // Add Loot Outcome (Scratch-off) with auto-calculated weights summing to 100%
    html.find('.add-loot-outcome').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      current.push({
        name: `Outcome ${current.length + 1}`,
        weight: 0,
        type: 'spell',
        targetType: 'closest_mob',
        damage: '2d12 + Int',
        damageType: 'Fire',
        healBars: 0,
        description: ''
      });
      // Auto-calculate the weight of outcomes as outcomes are added
      const count = current.length;
      if (count > 0) {
        const base = Math.floor(100 / count);
        const remainder = 100 % count;
        for (let i = 0; i < count; i++) {
          current[i].weight = base + (i < remainder ? 1 : 0);
        }
      }
      await this.item.update({ 'system.outcomes': current });
      this.render(false);
    });

    // Delete Loot Outcome and auto-rebalance remaining weights
    html.find('.delete-loot-outcome').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        const count = current.length;
        if (count > 0) {
          const base = Math.floor(100 / count);
          const remainder = 100 % count;
          for (let i = 0; i < count; i++) {
            current[i].weight = base + (i < remainder ? 1 : 0);
          }
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Auto-balance weights to 100%
    html.find('.rebalance-weights-btn').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      const count = current.length;
      if (count > 0) {
        const base = Math.floor(100 / count);
        const remainder = 100 % count;
        for (let i = 0; i < count; i++) {
          current[i].weight = base + (i < remainder ? 1 : 0);
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Disallow non-numeric characters in outcome weights
    html.find('.outcome-weight-input').on('input change', function() {
      const clean = this.value.replace(/[^0-9]/g, '');
      if (this.value !== clean) {
        this.value = clean;
      }
    });

    // Change Outcome Type
    html.find('.outcome-type-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const newType = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        current[idx] = { ...current[idx], type: newType };
        if (newType === 'buff' || newType === 'debuff') {
          current[idx].damage = '';
          current[idx].damageType = '';
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Select Existing Buff for Outcome
    html.find('.outcome-buff-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const buffId = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        const buffs = await this.getAvailableBuffs();
        const matched = buffs.find(b => b.id === buffId || b.name === buffId);
        if (matched) {
          current[idx] = {
            ...current[idx],
            buffId: matched.id,
            name: matched.name,
            description: matched.system?.description || current[idx].description || '',
            damage: '',
            damageType: ''
          };
        } else {
          current[idx].buffId = buffId;
          current[idx].damage = '';
          current[idx].damageType = '';
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Select Existing Debuff for Outcome
    html.find('.outcome-debuff-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const debuffId = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        const debuffs = await this.getAvailableDebuffs();
        const matched = debuffs.find(d => d.id === debuffId || d.name === debuffId);
        if (matched) {
          current[idx] = {
            ...current[idx],
            debuffId: matched.id,
            name: matched.name,
            description: matched.system?.description || current[idx].description || '',
            damage: '',
            damageType: ''
          };
        } else {
          current[idx].debuffId = debuffId;
          current[idx].damage = '';
          current[idx].damageType = '';
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Select Existing Spell for Outcome
    html.find('.outcome-spell-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const spellId = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        const spells = await this.getAvailableSpells();
        const matched = spells.find(s => s.id === spellId || s.name === spellId);
        if (matched) {
          current[idx] = {
            ...current[idx],
            spellId: matched.id,
            spellName: matched.name,
            name: matched.name,
            description: matched.system?.description || current[idx].description || ''
          };
        } else {
          current[idx].spellId = spellId;
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Select Existing RollTable for Outcome
    html.find('.outcome-table-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const tableId = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        const tables = await this.getAvailableRollTables();
        const matched = tables.find(t => t.id === tableId || t.uuid === tableId || t.name === tableId);
        if (matched) {
          current[idx] = {
            ...current[idx],
            tableUuid: matched.uuid || matched.id,
            tableName: matched.name,
            name: matched.name
          };
        } else {
          current[idx].tableUuid = tableId;
        }
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Select Skill for Outcome
    html.find('.outcome-skill-select').change(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const skillName = $(ev.currentTarget).val();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        current[idx] = {
          ...current[idx],
          skillName: skillName,
          name: `Skill: ${skillName}`
        };
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Change Execution Mode
    html.find('.execution-mode-select').change(async ev => {
      ev.preventDefault();
      const newMode = $(ev.currentTarget).val();
      await this.item.update({ 'system.executionMode': newMode });
      this.render(false);
    });

    // Toggle Gear Activated Ability
    html.find('.toggle-gear-activated').change(async ev => {
      const active = $(ev.currentTarget).is(':checked');
      await this.item.update({ 'system.hasActivatedAbility': active });
      this.render(false);
    });

    // Add Gear Outcome
    html.find('.add-gear-outcome').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      current.push({
        name: `Effect ${current.length + 1}`,
        weight: 0,
        type: 'buff',
        targetType: 'self',
        description: ''
      });
      await this.item.update({ 'system.outcomes': current });
      this.render(false);
    });

    // Delete Gear Outcome
    html.find('.delete-gear-outcome').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.outcomes) ? [...this.item.system.outcomes] : [];
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.outcomes': current });
        this.render(false);
      }
    });

    // Add Damage Part (for attack or gear)
    html.find('.add-damage-part').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.damageParts)
        ? [...this.item.system.damageParts]
        : Object.values(this.item.system?.damageParts || {});
      current.push({
        dice: '1d6',
        stat: 'str',
        type: 'Slashing',
        value: 0
      });
      await this.item.update({ 'system.damageParts': current });
    });

    // Delete Damage Part
    html.find('.delete-damage-part').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.damageParts)
        ? [...this.item.system.damageParts]
        : Object.values(this.item.system?.damageParts || {});
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.damageParts': current });
      }
    });

    // Add preset effects to attack
    html.find('.add-preset-effects').click(async ev => {
      ev.preventDefault();
      const preset = $(ev.currentTarget).data('preset');
      const presetMap = {
        pugilism: 'Dirty Fighting, Iron Punch, Powerful Strike',
        noggin: 'Skullcracker, Powerful Strike',
        wrasslin: 'Choke Out, Dirty Fighting, Toss',
        foot: 'Powerful Strike, Smush'
      };
      const toAdd = presetMap[preset] || '';
      if (!toAdd) return;

      const currentRaw = this.item.system?.optionalEffects || [];
      let currentArr = [];
      if (Array.isArray(currentRaw)) {
        currentArr = currentRaw.map(e => (typeof e === 'string' ? e.trim() : (e?.name || '').trim())).filter(Boolean);
      } else if (typeof currentRaw === 'string' && currentRaw.trim()) {
        currentArr = currentRaw.split(',').map(s => s.trim()).filter(Boolean);
      }
      const newItems = toAdd.split(',').map(s => s.trim()).filter(Boolean);
      const combined = [...new Set([...currentArr, ...newItems])];
      await this.item.update({ 'system.optionalEffects': combined });
      this.render(false);
    });

    // Add Skill Damage Modifier (for skills)
    html.find('.add-damage-mod').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.damageModifiers)
        ? [...this.item.system.damageModifiers]
        : Object.values(this.item.system?.damageModifiers || {});
      current.push({
        type: 'Fire',
        value: 2,
        dice: '',
        minRank: 0
      });
      await this.item.update({ 'system.damageModifiers': current });
    });

    // Delete Skill Damage Modifier
    html.find('.delete-damage-mod').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.damageModifiers)
        ? [...this.item.system.damageModifiers]
        : Object.values(this.item.system?.damageModifiers || {});
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.damageModifiers': current });
      }
    });

    // Add Stat Modifier (for buff or debuff)
    html.find('.add-stat-mod').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.statModifiers)
        ? [...this.item.system.statModifiers]
        : Object.values(this.item.system?.statModifiers || {});
      current.push({
        stat: 'str',
        value: this.item.type === 'debuff' ? -2 : 2
      });
      await this.item.update({ 'system.statModifiers': current });
    });

    // Delete Stat Modifier (for buff or debuff)
    html.find('.delete-stat-mod').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.statModifiers)
        ? [...this.item.system.statModifiers]
        : Object.values(this.item.system?.statModifiers || {});
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.statModifiers': current });
      }
    });

    // Add Buff/Debuff Damage Modifier
    html.find('.add-buff-damage-mod').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system?.damageModifiers)
        ? [...this.item.system.damageModifiers]
        : Object.values(this.item.system?.damageModifiers || {});
      if (this.item.type === 'debuff') {
        current.push({
          type: 'reduction',
          damageType: 'Fire',
          reductionPercent: 50,
          rounding: 'up'
        });
      } else {
        current.push({
          type: 'damageBonus',
          damageType: 'Fire',
          value: 2,
          dice: ''
        });
      }
      await this.item.update({ 'system.damageModifiers': current });
    });

    // Delete Buff/Debuff Damage Modifier
    html.find('.delete-buff-damage-mod').click(async ev => {
      ev.preventDefault();
      const idx = Number($(ev.currentTarget).data('index'));
      const current = Array.isArray(this.item.system?.damageModifiers)
        ? [...this.item.system.damageModifiers]
        : Object.values(this.item.system?.damageModifiers || {});
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.damageModifiers': current });
      }
    });

    // Cast / Roll Spell
    html.find('.roll-spell').click(async ev => {
      ev.preventDefault();
      await this.item.roll();
    });

    // Roll Spell Damage
    html.find('.roll-spell-dmg').click(async ev => {
      ev.preventDefault();
      await this.item.roll('damage');
    });
  }
}

