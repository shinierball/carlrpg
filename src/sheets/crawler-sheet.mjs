import { DCCSkillManager } from '../apps/skill-manager.mjs';

/**
 * Helper to format active gear bonuses into a readable string summary
 */
export function formatGearBonuses(gearItem) {
  const parts = [];
  const sys = gearItem.system;
  if (!sys) return '';
  const dr = Number(sys.drBonus ?? sys.armorBonus) || 0;
  if (dr !== 0) parts.push(`${dr > 0 ? '+' : ''}${dr} DR`);
  const evade = Number(sys.evadeBonus) || 0;
  if (evade !== 0) parts.push(`${evade > 0 ? '+' : ''}${evade} Evade`);

  if (sys.abilityModifiers) {
    for (const [stat, mods] of Object.entries(sys.abilityModifiers)) {
      if (!mods) continue;
      const val = Number(mods.value);
      const type = (mods.type || 'flat').toLowerCase();
      if (Number.isFinite(val) && val !== 0) {
        if (type === 'pct' || type === '%') {
          parts.push(`${val > 0 ? '+' : ''}${val}% ${stat.toUpperCase()}`);
        } else {
          parts.push(`${val > 0 ? '+' : ''}${val} ${stat.toUpperCase()}`);
        }
      } else {
        // Fallback for legacy format { flat, pct }
        const flat = Number(mods.flat) || 0;
        const pct = Number(mods.pct) || 0;
        if (flat !== 0) parts.push(`${flat > 0 ? '+' : ''}${flat} ${stat.toUpperCase()}`);
        if (pct !== 0) parts.push(`${pct > 0 ? '+' : ''}${pct}% ${stat.toUpperCase()}`);
      }
    }
  }

  let rawMods = sys.skillModifiers;
  if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
    rawMods = Object.values(rawMods);
  }
  if (Array.isArray(rawMods)) {
    for (const sm of rawMods) {
      if (sm && sm.name) {
        const bonus = Number(sm.bonus) || 0;
        parts.push(`${bonus >= 0 ? '+' : ''}${bonus} ${sm.name}`);
      }
    }
  }
  return parts.join(', ');
}

/**
 * Dungeon Crawler Carl Character Sheet Controller
 */
export class DCCCrawlerSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dcc-sheet-window', 'actor', 'crawler'],
      template: 'systems/carl-rpg/templates/actors/crawler-sheet.hbs',
      width: 860,
      height: 900,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'page1' }],
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const actorData = context.data;

    context.system = actorData.system;
    context.flags = actorData.flags;

    // Categorize embedded items
    context.attacks = [];
    context.skills = [];
    context.gear = [];
    context.races = [];
    context.classes = [];
    context.deities = [];
    context.sponsors = [];
    context.loot = [];

    // Track equipped items by slot
    context.equippedBySlot = {
      head: null,
      torso: null,
      arms: null,
      hands: null,
      legs: null,
      feet: null,
      accessory: [],
      tattoo: [],
      patch: []
    };

    for (const item of this.actor.items) {
      if (item.type === 'attack') context.attacks.push(item);
      else if (item.type === 'skill') context.skills.push(item);
      else if (item.type === 'gear') {
        item.bonusesSummary = formatGearBonuses(item);
        context.gear.push(item);

        if (item.system?.equipped) {
          const slot = (item.system.slot || 'torso').toLowerCase();
          if (Array.isArray(context.equippedBySlot[slot])) {
            context.equippedBySlot[slot].push(item);
          } else {
            context.equippedBySlot[slot] = item;
          }
        }
      }
      else if (item.type === 'race') context.races.push(item);
      else if (item.type === 'class') context.classes.push(item);
      else if (item.type === 'deity') context.deities.push(item);
      else if (item.type === 'sponsor') context.sponsors.push(item);
      else if (item.type === 'loot') context.loot.push(item);
    }

    // Tally gear skill bonuses from equipped gear
    const gearSkillBonuses = new Map();
    for (const item of context.gear) {
      if (!item.system?.equipped) continue;
      let rawMods = item.system.skillModifiers;
      if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
        rawMods = Object.values(rawMods);
      }
      const skillMods = Array.isArray(rawMods) ? rawMods : [];
      for (const sm of skillMods) {
        if (!sm || !sm.name) continue;
        const norm = sm.name.toLowerCase().trim();
        const bonus = Number(sm.bonus) || 0;
        if (!gearSkillBonuses.has(norm)) {
          gearSkillBonuses.set(norm, { bonus: 0, sources: [], originalName: sm.name });
        }
        const entry = gearSkillBonuses.get(norm);
        entry.bonus += bonus;
        entry.sources.push(`${item.name} (+${bonus})`);
      }
    }

    // Apply gear bonuses to actor's existing skills
    const ownedSkillNames = new Set();
    for (const skill of context.skills) {
      const norm = skill.name.toLowerCase().trim();
      ownedSkillNames.add(norm);

      const baseRank = Number(skill.system?.rank) || 0;
      const gearData = gearSkillBonuses.get(norm);
      const itemBonus = gearData ? gearData.bonus : 0;
      const boonBonus = Number(skill.system?.boonBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus);

      const stat = skill.system?.stat || 'str';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      const totalSkill = modifiedRank + mod;

      skill.baseRank = baseRank;
      skill.itemBonus = itemBonus;
      skill.boonBonus = boonBonus;
      skill.modifiedRank = modifiedRank;
      skill.effectiveRank = modifiedRank;
      skill.statMod = mod;
      skill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
      skill.totalSkill = totalSkill;
      skill.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
      skill.itemSources = gearData ? gearData.sources.join(', ') : '';

      if (skill.system) {
        skill.system.itemBonus = itemBonus;
        skill.system.boonBonus = boonBonus;
        skill.system.modifiedRank = modifiedRank;
        skill.system.totalSkill = totalSkill;
        skill.system.statMod = mod;
      }
    }

    // Add granted skills from equipped gear that the actor doesn't own
    this._grantedSkills = new Map();
    for (const [norm, data] of gearSkillBonuses.entries()) {
      if (!ownedSkillNames.has(norm)) {
        const official = (CONFIG.DCC?.skills || []).find(s => s.name.toLowerCase().trim() === norm);
        const grantedId = `granted-${norm.replace(/\s+/g, '-')}`;
        const stat = official ? official.system.stat : 'str';
        const mod = context.system.abilities?.[stat]?.mod ?? 0;
        const totalSkill = data.bonus + mod;

        const grantedSkill = {
          id: grantedId,
          _id: grantedId,
          name: official ? official.name : data.originalName,
          type: 'skill',
          img: official ? official.img : 'icons/magic/defensive/shield-barrier-blue.webp',
          isGranted: true,
          baseRank: 0,
          itemBonus: data.bonus,
          boonBonus: 0,
          modifiedRank: data.bonus,
          effectiveRank: data.bonus,
          statMod: mod,
          statModStr: mod >= 0 ? `+${mod}` : `${mod}`,
          totalSkill: totalSkill,
          totalSkillStr: totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`,
          itemSources: data.sources.join(', '),
          system: {
            rank: 0,
            itemBonus: data.bonus,
            boonBonus: 0,
            modifiedRank: data.bonus,
            totalSkill: totalSkill,
            stat: stat,
            checkType: official ? official.system.checkType : 'Stat Check',
            category: official ? (official.system.category || 'Utility') : 'Combat',
            notes: `Granted by ${data.sources.join(', ')}`,
            upgrades: '',
            checked: false
          }
        };

        this._grantedSkills.set(grantedId, grantedSkill);
        context.skills.push(grantedSkill);
      }
    }

    // Sort skills alphabetically
    context.skills.sort((a, b) => a.name.localeCompare(b.name));

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Open Skill Library Picker
    html.find('.open-skill-picker').click(ev => {
      ev.preventDefault();
      this._openSkillPicker();
    });

    // Roll Stat Check
    html.find('.roll-stat').click(ev => {
      const stat = $(ev.currentTarget).data('stat');
      this.actor.rollStat(stat);
    });

    // Roll Evade
    html.find('.roll-evade').click(() => {
      this.actor.rollEvade();
    });

    // Roll Attack: Hit or Damage
    html.find('.roll-attack-hit').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollAttack(item, 'hit');
    });

    html.find('.roll-attack-dmg').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollAttack(item, 'damage');
    });

    // Roll Skill (owned or gear-granted)
    html.find('.roll-skill').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId) || this._grantedSkills?.get(itemId);
      if (item) this.actor.rollSkill(item);
    });

    // Toggle Gear Equipped
    html.find('.gear-toggle-equipped').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) {
        const newEquipped = !item.system.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Immediate form submission on input blur
    html.find('input, select, textarea').on('blur', () => {
      if (this.isEditable) this.submit();
    });

    // Item Create
    html.find('.item-create').click(async ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type') || 'skill';
      const name = `New ${type.capitalize()}`;
      const created = await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
      if (created && created[0]) {
        created[0].sheet?.render(true);
      }
    });

    // Item Edit
    html.find('.item-edit').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      item?.sheet.render(true);
    });

    // Item Delete
    html.find('.item-delete').click(async ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) {
        await item.delete();
      }
    });

    // Inline Item Edit on Actor Sheet (Skills, Gear, Loot)
    html.find('.item-inline-edit').change(async ev => {
      ev.preventDefault();
      const input = $(ev.currentTarget);
      const itemId = input.closest('[data-item-id]').data('itemId');
      const field = input.data('field');
      const item = this.actor.items.get(itemId);
      if (item && field) {
        const val = input.attr('type') === 'number' ? Number(input.val()) : input.val();
        await item.update({ [field]: val });
      }
    });
  }

  /**
   * Open interactive modal to choose skills from the DCC Skill Library & Manager
   */
  _openSkillPicker() {
    new DCCSkillManager({ actor: this.actor }).render(true);
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.fromDropData(data);
    if (!item) return false;

    // If dropping a Race, Class, or Deity, automatically update actor detail string too
    if (item.type === 'race') {
      await this.actor.update({ 'system.details.race': item.name });
    } else if (item.type === 'class') {
      await this.actor.update({ 'system.details.class': item.name });
    } else if (item.type === 'deity') {
      await this.actor.update({ 'system.details.deity': item.name });
    }

    return super._onDropItem(event, data);
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure actor name is strictly a single string and never an array
    if (Array.isArray(formData.name)) {
      formData.name = formData.name[0];
    }
    return super._updateObject(event, formData);
  }
}
