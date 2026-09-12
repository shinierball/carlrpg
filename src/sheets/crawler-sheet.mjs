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
      const flat = Number(mods.flat) || 0;
      const pct = Number(mods.pct) || 0;
      if (flat !== 0) parts.push(`${flat > 0 ? '+' : ''}${flat} ${stat.toUpperCase()}`);
      if (pct !== 0) parts.push(`${pct > 0 ? '+' : ''}${pct}% ${stat.toUpperCase()}`);
    }
  }

  if (Array.isArray(sys.skillModifiers)) {
    for (const sm of sys.skillModifiers) {
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
      const skillMods = Array.isArray(item.system.skillModifiers) ? item.system.skillModifiers : [];
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

      if (gearSkillBonuses.has(norm)) {
        const data = gearSkillBonuses.get(norm);
        skill.itemBonus = data.bonus;
        skill.effectiveRank = (Number(skill.system.rank) || 0) + data.bonus;
        skill.itemSources = data.sources.join(', ');
      } else {
        skill.itemBonus = 0;
        skill.effectiveRank = Number(skill.system.rank) || 0;
      }

      const stat = skill.system?.stat || 'str';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      skill.statMod = mod;
      skill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
    }

    // Add granted skills from equipped gear that the actor doesn't own
    this._grantedSkills = new Map();
    for (const [norm, data] of gearSkillBonuses.entries()) {
      if (!ownedSkillNames.has(norm)) {
        const official = (CONFIG.DCC?.skills || []).find(s => s.name.toLowerCase().trim() === norm);
        const grantedId = `granted-${norm.replace(/\s+/g, '-')}`;
        const grantedSkill = {
          id: grantedId,
          _id: grantedId,
          name: official ? official.name : data.originalName,
          type: 'skill',
          img: official ? official.img : 'icons/magic/defensive/shield-barrier-blue.webp',
          isGranted: true,
          itemBonus: data.bonus,
          effectiveRank: data.bonus,
          itemSources: data.sources.join(', '),
          system: {
            rank: data.bonus,
            stat: official ? official.system.stat : 'str',
            checkType: official ? official.system.checkType : 'Stat Check',
            category: official ? (official.system.category || 'Utility') : 'Combat',
            notes: `Granted by ${data.sources.join(', ')}`,
            upgrades: '',
            checked: false
          }
        };
        const stat = grantedSkill.system.stat;
        const mod = context.system.abilities?.[stat]?.mod ?? 0;
        grantedSkill.statMod = mod;
        grantedSkill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;

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
        if (this.isToken && this.token?.baseActor) {
          const baseItem = this.token.baseActor.items.find(i => i.name === item.name && i.type === item.type);
          if (baseItem) await baseItem.update({ 'system.equipped': newEquipped });
        }
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
      await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
      if (this.isToken && this.token?.baseActor) {
        await this.token.baseActor.createEmbeddedDocuments('Item', [{ name, type }]);
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
        if (this.isToken && this.token?.baseActor) {
          const baseItem = this.token.baseActor.items.find(i => i.name === item.name && i.type === item.type);
          if (baseItem) await baseItem.delete();
        }
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
        if (this.isToken && this.token?.baseActor) {
          const baseItem = this.token.baseActor.items.find(i => i.name === item.name && i.type === item.type);
          if (baseItem) await baseItem.update({ [field]: val });
        }
      }
    });
  }

  /**
   * Open interactive modal to choose skills from the official DCC Skill Library
   */
  _openSkillPicker() {
    const existingSkillNames = new Set(
      this.actor.items.filter(i => i.type === 'skill').map(i => i.name.toLowerCase().trim())
    );

    const skills = CONFIG.DCC?.skills || [];

    // Group skills by category
    const categories = {
      Utility: { title: 'Exploration & Survival (Utility Skills)', skills: [] },
      Combat: { title: 'Combat Skill Actions & Maneuvers', skills: [] },
      Passive: { title: 'Passive Skills (Static Bonuses)', skills: [] }
    };

    for (const skill of skills) {
      const cat = skill.system.category || 'Utility';
      const isAdded = existingSkillNames.has(skill.name.toLowerCase().trim());
      const itemData = {
        ...skill,
        isAdded
      };
      if (categories[cat]) categories[cat].skills.push(itemData);
      else categories.Utility.skills.push(itemData);
    }

    // Build dialog HTML
    let content = `
      <div class="dcc-skill-picker-dialog">
        <div class="dcc-picker-header">
          <input type="text" class="dcc-picker-search" placeholder="Filter skills by name, stat, or mechanics..." autofocus />
        </div>
        <div class="dcc-picker-list">
    `;

    for (const [catKey, group] of Object.entries(categories)) {
      content += `
        <div class="dcc-picker-group" data-category="${catKey}">
          <div class="dcc-picker-group-title">${group.title} (${group.skills.length})</div>
          <div class="dcc-picker-items">
      `;
      for (const s of group.skills) {
        const statName = (s.system.stat || 'str').toUpperCase();
        const addedClass = s.isAdded ? 'is-added' : '';
        const badge = s.isAdded ? `<span class="dcc-picker-badge added"><i class="fa-solid fa-check"></i> On Sheet</span>` : '';
        content += `
          <label class="dcc-picker-item ${addedClass}" data-skill-id="${s._id}" data-name="${s.name.toLowerCase()}" data-stat="${statName.toLowerCase()}" data-notes="${(s.system.notes || '').toLowerCase()}">
            <input type="checkbox" name="selectedSkill" value="${s._id}" ${s.isAdded ? 'disabled' : ''} />
            <img src="${s.img}" class="dcc-picker-item-icon" />
            <div class="dcc-picker-item-info">
              <div class="dcc-picker-item-name-row">
                <span class="dcc-picker-item-name">${s.name}</span>
                <span class="dcc-picker-item-stat">[${statName}]</span>
                <span class="dcc-picker-item-type">${s.system.checkType}</span>
                ${badge}
              </div>
              <div class="dcc-picker-item-desc">${s.system.notes || ''}</div>
            </div>
          </label>
        `;
      }
      content += `
          </div>
        </div>
      `;
    }

    content += `
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Dungeon Crawler Carl RPG - Skill Library',
      content,
      buttons: {
        add: {
          icon: '<i class="fa-solid fa-plus"></i>',
          label: 'Add Selected Skills',
          callback: async (html) => {
            const checkedIds = html.find('input[name="selectedSkill"]:checked').map((_, el) => $(el).val()).get();
            if (!checkedIds.length) {
              ui.notifications?.info('No new skills selected.');
              return;
            }
            const toCreate = [];
            for (const id of checkedIds) {
              const skillDef = skills.find(s => s._id === id);
              if (skillDef) {
                toCreate.push({
                  name: skillDef.name,
                  type: 'skill',
                  img: skillDef.img,
                  system: {
                    rank: skillDef.system.rank ?? 0,
                    stat: skillDef.system.stat,
                    checkType: skillDef.system.checkType,
                    category: skillDef.system.category || 'Utility',
                    notes: skillDef.system.notes,
                    upgrades: '',
                    checked: false
                  }
                });
              }
            }
            if (toCreate.length) {
              await this.actor.createEmbeddedDocuments('Item', toCreate);
              if (this.isToken && this.token?.baseActor) {
                await this.token.baseActor.createEmbeddedDocuments('Item', toCreate);
              }
              ui.notifications?.info(`Added ${toCreate.length} skill(s) to ${this.actor.name}.`);
            }
          }
        },
        cancel: {
          icon: '<i class="fa-solid fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'add',
      render: (html) => {
        // Search filter listener
        html.find('.dcc-picker-search').on('input', function() {
          const query = $(this).val().toLowerCase().trim();
          html.find('.dcc-picker-item').each(function() {
            const name = $(this).data('name') || '';
            const stat = $(this).data('stat') || '';
            const notes = $(this).data('notes') || '';
            if (!query || name.includes(query) || stat.includes(query) || notes.includes(query)) {
              $(this).show();
            } else {
              $(this).hide();
            }
          });
          // Hide empty groups
          html.find('.dcc-picker-group').each(function() {
            const visibleItems = $(this).find('.dcc-picker-item:visible').length;
            if (visibleItems === 0) $(this).hide();
            else $(this).show();
          });
        });
      }
    }, {
      width: 720,
      height: 720,
      classes: ['dcc-sheet-window', 'dcc-skill-picker-window']
    });

    dialog.render(true);
  }

  /** @override */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.fromDropData(data);
    if (!item) return false;

    // If dropping a Race, Class, or Deity, automatically update actor detail string too
    if (item.type === 'race') {
      await this.actor.update({ 'system.details.race': item.name });
      if (this.isToken && this.token?.baseActor) {
        await this.token.baseActor.update({ 'system.details.race': item.name });
      }
    } else if (item.type === 'class') {
      await this.actor.update({ 'system.details.class': item.name });
      if (this.isToken && this.token?.baseActor) {
        await this.token.baseActor.update({ 'system.details.class': item.name });
      }
    } else if (item.type === 'deity') {
      await this.actor.update({ 'system.details.deity': item.name });
      if (this.isToken && this.token?.baseActor) {
        await this.token.baseActor.update({ 'system.details.deity': item.name });
      }
    }

    if (this.isToken && this.token?.baseActor) {
      await this.token.baseActor.createEmbeddedDocuments('Item', [item.toObject()]);
    }

    return super._onDropItem(event, data);
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure actor name is strictly a single string and never an array
    if (Array.isArray(formData.name)) {
      formData.name = formData.name[0];
    }
    // If this sheet was opened from an unlinked token on a scene, sync changes directly to the world base actor
    if (this.isToken && this.token?.baseActor) {
      await this.token.baseActor.update(formData);
    }
    return super._updateObject(event, formData);
  }
}
