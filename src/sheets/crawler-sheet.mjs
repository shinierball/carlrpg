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
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'page1' }]
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

    for (const item of this.actor.items) {
      if (item.type === 'attack') context.attacks.push(item);
      else if (item.type === 'skill') context.skills.push(item);
      else if (item.type === 'gear') context.gear.push(item);
      else if (item.type === 'race') context.races.push(item);
      else if (item.type === 'class') context.classes.push(item);
      else if (item.type === 'deity') context.deities.push(item);
      else if (item.type === 'sponsor') context.sponsors.push(item);
      else if (item.type === 'loot') context.loot.push(item);
    }

    // Calculate statModStr for each skill
    for (const skill of context.skills) {
      const stat = skill.system?.stat || 'str';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      skill.statMod = mod;
      skill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
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

    // Roll Skill
    html.find('.roll-skill').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSkill(item);
    });

    // Item Create
    html.find('.item-create').click(async ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type') || 'skill';
      const name = `New ${type.capitalize()}`;
      await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
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
      if (item) await item.delete();
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
