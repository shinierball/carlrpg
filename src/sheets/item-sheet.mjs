/**
 * Dungeon Crawler Carl Item Sheet Controller
 */
export class DCCItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
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
        const index = await pack.getIndex({ fields: ['system.stat', 'system.checkType', 'system.category', 'system.notes', 'img'] });
        for (const entry of index) {
          skillsMap.set(entry.name.toLowerCase().trim(), {
            id: entry._id,
            name: entry.name,
            img: entry.img || 'icons/svg/book.svg',
            system: {
              stat: entry.system?.stat || 'str',
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

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system;
    context.abilities = {
      str: 'Strength',
      int: 'Intelligence',
      con: 'Constitution',
      dex: 'Dexterity',
      cha: 'Charisma'
    };

    // Ensure skillModifiers array exists
    if (!Array.isArray(context.system.skillModifiers)) {
      context.system.skillModifiers = [];
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

    return context;
  }

  /**
   * Open interactive modal to choose skills from the DCC Compendium for this item
   * @param {number|null} targetIndex If provided, selects a skill to replace the given row index
   */
  async _openSkillPicker(targetIndex = null) {
    const skills = await this.getCompendiumSkills();
    const existingSkillNames = new Set(
      (this.item.system.skillModifiers || []).map(m => m.name.toLowerCase().trim())
    );

    // Group skills by category
    const categories = {
      Utility: { title: 'Exploration & Survival (Utility Skills)', skills: [] },
      Combat: { title: 'Combat Skill Actions & Maneuvers', skills: [] },
      Passive: { title: 'Passive Skills (Static Bonuses)', skills: [] },
      General: { title: 'General & World Skills', skills: [] }
    };

    for (const skill of skills) {
      const cat = skill.system.category || 'Utility';
      const isAdded = existingSkillNames.has(skill.name.toLowerCase().trim());
      const itemData = { ...skill, isAdded };
      if (categories[cat]) categories[cat].skills.push(itemData);
      else if (categories.General) categories.General.skills.push(itemData);
      else categories.Utility.skills.push(itemData);
    }

    let content = `
      <div class="dcc-skill-picker-dialog">
        <div class="dcc-picker-header" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <input type="text" class="dcc-picker-search" placeholder="Filter compendium skills by name, stat, mechanics..." style="flex: 1;" autofocus />
          ${targetIndex === null ? `
          <div style="display: flex; align-items: center; gap: 4px; background: #fff; border: 2px solid #000; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">
            <span style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Rank Bonus:</span>
            <input type="number" id="dcc-picker-bonus-rank" value="1" min="1" style="width: 45px; text-align: center; font-weight: bold; border: 1px solid #999; border-radius: 3px;" />
          </div>` : ''}
        </div>
        <div class="dcc-picker-list" style="max-height: 480px; overflow-y: auto;">
    `;

    for (const [catKey, group] of Object.entries(categories)) {
      if (!group.skills.length) continue;
      content += `
        <div class="dcc-picker-group" data-category="${catKey}">
          <div class="dcc-picker-group-title">${group.title} (${group.skills.length})</div>
          <div class="dcc-picker-items">
      `;
      for (const s of group.skills) {
        const statName = (s.system.stat || 'str').toUpperCase();
        const addedClass = s.isAdded ? 'is-added' : '';
        const badge = s.isAdded ? `<span class="dcc-picker-badge added" style="background: #27ae60; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 3px; font-weight: bold;"><i class="fa-solid fa-check"></i> On Item</span>` : '';

        if (targetIndex !== null) {
          // Single-select row click to replace
          content += `
            <div class="dcc-picker-item dcc-picker-select-row" data-name="${s.name}" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <img src="${s.img}" class="dcc-picker-item-icon" />
              <div class="dcc-picker-item-info" style="flex: 1;">
                <div class="dcc-picker-item-name-row">
                  <span class="dcc-picker-item-name">${s.name}</span>
                  <span class="dcc-picker-item-stat">[${statName}]</span>
                  <span class="dcc-picker-item-type">${s.system.checkType}</span>
                </div>
                <div class="dcc-picker-item-desc">${s.system.notes || ''}</div>
              </div>
              <button type="button" class="dcc-select-skill-action" style="padding: 3px 10px; font-family: 'Oswald', sans-serif; font-size: 12px; background: #111; color: #fff; border: 1px solid #d32f2f; border-radius: 3px; cursor: pointer;">Select</button>
            </div>
          `;
        } else {
          // Multi-select mode with checkboxes
          content += `
            <label class="dcc-picker-item ${addedClass}" data-name="${s.name.toLowerCase()}" data-stat="${statName.toLowerCase()}" data-notes="${(s.system.notes || '').toLowerCase()}">
              <input type="checkbox" name="selectedSkill" value="${s.name}" ${s.isAdded ? 'disabled' : ''} />
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
      title: targetIndex !== null ? 'Select Skill from DCC Compendium' : 'Add Skills from DCC Compendium',
      content,
      buttons: targetIndex !== null ? {
        cancel: {
          icon: '<i class="fa-solid fa-times"></i>',
          label: 'Cancel'
        }
      } : {
        add: {
          icon: '<i class="fa-solid fa-plus"></i>',
          label: 'Add Selected Skills',
          callback: async (html) => {
            const checkedNames = html.find('input[name="selectedSkill"]:checked').map((_, el) => $(el).val()).get();
            const bonus = Number(html.find('#dcc-picker-bonus-rank').val()) || 1;
            if (!checkedNames.length) {
              ui.notifications?.info('No new skills selected.');
              return;
            }
            const current = Array.isArray(this.item.system.skillModifiers)
              ? foundry.utils.duplicate(this.item.system.skillModifiers)
              : [];
            for (const name of checkedNames) {
              const existing = current.find(m => m.name.toLowerCase() === name.toLowerCase());
              if (existing) {
                existing.bonus = bonus;
              } else {
                current.push({ name, bonus });
              }
            }
            await this.item.update({ 'system.skillModifiers': current });
            ui.notifications?.info(`Added ${checkedNames.length} skill modifier(s) to ${this.item.name}.`);
          }
        },
        custom: {
          icon: '<i class="fa-solid fa-pen"></i>',
          label: 'Custom Skill',
          callback: async () => {
            const current = Array.isArray(this.item.system.skillModifiers)
              ? foundry.utils.duplicate(this.item.system.skillModifiers)
              : [];
            current.push({ name: '', bonus: 1 });
            await this.item.update({ 'system.skillModifiers': current });
          }
        },
        cancel: {
          icon: '<i class="fa-solid fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: targetIndex !== null ? 'cancel' : 'add',
      render: (html) => {
        // Search filter listener
        html.find('.dcc-picker-search').on('input', function() {
          const query = $(this).val().toLowerCase().trim();
          html.find('.dcc-picker-item').each(function() {
            const name = $(this).data('name') || '';
            const stat = $(this).data('stat') || '';
            const notes = $(this).data('notes') || '';
            const matches = !query || name.includes(query) || stat.includes(query) || notes.includes(query);
            $(this).toggle(matches);
          });
          html.find('.dcc-picker-group').each(function() {
            const visibleItems = $(this).find('.dcc-picker-item:visible').length;
            $(this).toggle(visibleItems > 0);
          });
        });

        // Single-select row click
        if (targetIndex !== null) {
          html.find('.dcc-picker-select-row').click(async (ev) => {
            const selectedName = $(ev.currentTarget).data('name');
            if (selectedName) {
              const current = Array.isArray(this.item.system.skillModifiers)
                ? foundry.utils.duplicate(this.item.system.skillModifiers)
                : [];
              if (targetIndex >= 0 && targetIndex < current.length) {
                current[targetIndex].name = selectedName;
                await this.item.update({ 'system.skillModifiers': current });
                ui.notifications?.info(`Set skill to "${selectedName}".`);
                dialog.close();
              }
            }
          });
        }
      }
    }, {
      classes: ['dcc-skill-picker-window'],
      width: 680,
      height: 600,
      resizable: true
    });

    dialog.render(true);
  }

  /** @override */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data?.type === 'Item') {
      const item = await Item.implementation.fromDropData(data);
      if (item && item.type === 'skill') {
        const current = Array.isArray(this.item.system.skillModifiers)
          ? foundry.utils.duplicate(this.item.system.skillModifiers)
          : [];
        const existing = current.find(m => m.name.toLowerCase() === item.name.toLowerCase());
        if (existing) {
          existing.bonus = (Number(existing.bonus) || 0) + 1;
        } else {
          current.push({ name: item.name, bonus: 1 });
        }
        await this.item.update({ 'system.skillModifiers': current });
        ui.notifications?.info(`Added "${item.name}" skill modifier to ${this.item.name}.`);
        return;
      }
    }
    if (super._onDrop) return super._onDrop(event);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

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
      const current = Array.isArray(this.item.system.skillModifiers)
        ? foundry.utils.duplicate(this.item.system.skillModifiers)
        : [];
      if (idx >= 0 && idx < current.length) {
        current.splice(idx, 1);
        await this.item.update({ 'system.skillModifiers': current });
      }
    });
  }
}
