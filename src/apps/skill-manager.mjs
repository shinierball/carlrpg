/**
 * DCC RPG — Skill Library & Manager Application
 * Centralized interface for browsing, creating, and maintaining skills.
 */
import { DCCBaseApplication } from './base-application.mjs';

const DialogClass = globalThis.foundry?.appv1?.applications?.Dialog
  ?? globalThis.Dialog;

export class DCCSkillManager extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.actor = options.actor || null;
    this.item = options.item || null;
    this.targetIndex = options.targetIndex ?? null;
    this.onSelect = options.onSelect || null;
    this.activeCategory = 'all';
    this.activeStat = 'all';
    this.searchQuery = '';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'dcc-skill-manager',
      classes: ['dcc-sheet-window', 'dcc-skill-manager-window'],
      template: 'systems/carl-rpg/templates/apps/skill-manager.hbs',
      title: 'DCC RPG — Skill Library & Manager',
      width: 800,
      height: 740,
      resizable: true
    });
  }

  /**
   * Ensure a dedicated 'Skills' folder exists in the Foundry Items directory.
   * @returns {Promise<Folder|null>}
   */
  async getOrCreateSkillsFolder() {
    if (typeof game === 'undefined' || !game.folders) return null;
    let folder = game.folders.find(f => f.type === 'Item' && f.name.toLowerCase() === 'skills');
    if (!folder && (game.user?.isGM || game.user?.can?.('FOLDER_CREATE'))) {
      try {
        folder = await Folder.create({
          name: 'Skills',
          type: 'Item',
          color: '#c0392b'
        });
      } catch (err) {
        console.warn('DCC RPG | Could not create Skills folder:', err);
      }
    }
    return folder;
  }

  /**
   * Retrieve all skills from official CONFIG, compendium pack, and world items.
   * @returns {Promise<Array<object>>}
   */
  async getUnifiedSkills() {
    const skillsMap = new Map();

    // 1. From compendium pack carl-rpg.skills
    const pack = typeof game !== 'undefined' ? game.packs?.get('carl-rpg.skills') : null;
    if (pack) {
      try {
        const index = await pack.getIndex({ fields: ['system.stat', 'system.checkType', 'system.category', 'system.skillType', 'system.type', 'system.notes', 'img'] });
        for (const entry of index) {
          skillsMap.set(entry.name.toLowerCase().trim(), {
            id: entry._id,
            _id: entry._id,
            name: entry.name,
            img: entry.img || 'icons/svg/book.svg',
            source: 'compendium',
            isCompendium: true,
            isWorld: false,
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

    // 2. From CONFIG.DCC.skills fallback
    const configSkills = typeof CONFIG !== 'undefined' ? (CONFIG.DCC?.skills || []) : [];
    for (const s of configSkills) {
      const key = s.name.toLowerCase().trim();
      if (!skillsMap.has(key)) {
        skillsMap.set(key, {
          id: s._id || key,
          _id: s._id || key,
          name: s.name,
          img: s.img || 'icons/svg/book.svg',
          source: 'compendium',
          isCompendium: true,
          isWorld: false,
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

    // 3. From world items (custom/user created skills in Foundry items section)
    if (typeof game !== 'undefined' && game.items) {
      for (const item of game.items) {
        if (item.type === 'skill') {
          const key = item.name.toLowerCase().trim();
          skillsMap.set(key, {
            id: item.id,
            _id: item.id,
            name: item.name,
            img: item.img || 'icons/svg/book.svg',
            source: 'world',
            isCompendium: false,
            isWorld: true,
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

    // Determine 'isAdded' state if actor or item is present
    const ownedSkillNames = new Set(
      this.actor?.items?.filter ? this.actor.items.filter(i => i.type === 'skill').map(i => i.name.toLowerCase().trim()) : []
    );

    const gearModSkillNames = new Set(
      (this.item?.system?.skillModifiers || []).map(m => (m.name || '').toLowerCase().trim())
    );

    const skills = Array.from(skillsMap.values()).map(skill => {
      const norm = skill.name.toLowerCase().trim();
      return {
        ...skill,
        isAddedToActor: ownedSkillNames.has(norm),
        isAddedToItem: gearModSkillNames.has(norm),
        statUpper: (skill.system.stat || 'str').toUpperCase()
      };
    });

    return skills.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** @override */
  async getData(options) {
    const allSkills = await this.getUnifiedSkills();

    // Compute category counts
    const counts = {
      all: allSkills.length,
      utility: allSkills.filter(s => (s.system.category || '').toLowerCase() === 'utility').length,
      combat: allSkills.filter(s => (s.system.category || '').toLowerCase() === 'combat').length,
      passive: allSkills.filter(s => (s.system.category || '').toLowerCase() === 'passive').length,
      world: allSkills.filter(s => s.isWorld).length
    };

    // Filter skills based on state
    const filteredSkills = allSkills.filter(s => {
      // Category filter
      if (this.activeCategory !== 'all') {
        if (this.activeCategory === 'world') {
          if (!s.isWorld) return false;
        } else {
          if ((s.system.category || '').toLowerCase() !== this.activeCategory) return false;
        }
      }

      // Stat filter
      if (this.activeStat !== 'all') {
        if ((s.system.stat || '').toLowerCase() !== this.activeStat) return false;
      }

      // Text search query
      if (this.searchQuery) {
        const q = this.searchQuery;
        const nameMatch = s.name.toLowerCase().includes(q);
        const statMatch = (s.system.stat || '').toLowerCase().includes(q);
        const notesMatch = (s.system.notes || '').toLowerCase().includes(q);
        const typeMatch = (s.system.checkType || '').toLowerCase().includes(q);
        const groupMatch = (s.system.skillType || s.system.type || '').toLowerCase().includes(q);
        if (!nameMatch && !statMatch && !notesMatch && !typeMatch && !groupMatch) return false;
      }

      return true;
    });

    return {
      skills: filteredSkills,
      counts,
      activeCategory: this.activeCategory,
      activeStat: this.activeStat,
      searchQuery: this.searchQuery,
      isPicker: Boolean(this.actor || this.item || this.onSelect),
      isActorPicker: Boolean(this.actor),
      isItemPicker: Boolean(this.item),
      actor: this.actor,
      item: this.item,
      targetIndex: this.targetIndex,
      isGM: typeof game !== 'undefined' ? Boolean(game.user?.isGM) : true,
      canCreate: typeof game !== 'undefined' ? (game.user?.isGM || game.user?.can?.('ITEM_CREATE')) : true
    };
  }

  /**
   * Open interactive dialog to define and create a new custom world skill.
   */
  async openCreateSkillDialog() {
    const content = `
      <form class="dcc-create-skill-form" style="display: flex; flex-direction: column; gap: 10px; padding: 6px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Skill Name:</label>
          <input type="text" name="name" required placeholder="e.g. Lockpicking, Trap Sense, Barter" style="padding: 4px; border: 1.5px solid #000; border-radius: 3px;" autofocus />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Governing Stat:</label>
            <select name="stat" style="padding: 4px; border: 1.5px solid #000; border-radius: 3px;">
              <option value="str">Strength (STR)</option>
              <option value="dex">Dexterity (DEX)</option>
              <option value="con">Constitution (CON)</option>
              <option value="int">Intelligence (INT)</option>
              <option value="cha">Charisma (CHA)</option>
            </select>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Category:</label>
            <select name="category" style="padding: 4px; border: 1.5px solid #000; border-radius: 3px;">
              <option value="Utility">Exploration & Survival (Utility)</option>
              <option value="Combat">Combat Maneuvers</option>
              <option value="Passive">Passive (Static Bonus)</option>
              <option value="General">General / Custom</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Check Type / Mechanics:</label>
          <input type="text" name="checkType" value="Stat Check" placeholder="Stat Check, Passive, 2d6, etc." style="padding: 4px; border: 1.5px solid #000; border-radius: 3px;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: bold;">Skill Description & Notes:</label>
          <textarea name="notes" placeholder="Explain what the skill does, check DCs, passive perks, or mechanics..." style="height: 80px; padding: 4px; border: 1.5px solid #000; border-radius: 3px;"></textarea>
        </div>
      </form>
    `;

    new DialogClass({
      title: 'DCC RPG — Create New Custom Skill',
      content,
      buttons: {
        create: {
          icon: '<i class="fa-solid fa-plus"></i>',
          label: 'Create Skill',
          callback: async (html) => {
            const form = html.find('.dcc-create-skill-form');
            const name = form.find('input[name="name"]').val().trim();
            const stat = form.find('select[name="stat"]').val() || 'str';
            const category = form.find('select[name="category"]').val() || 'Utility';
            const checkType = form.find('input[name="checkType"]').val().trim() || 'Stat Check';
            const notes = form.find('textarea[name="notes"]').val().trim();

            if (!name) {
              ui.notifications?.warn('Skill name is required.');
              return;
            }

            const folder = await this.getOrCreateSkillsFolder();
            const created = await Item.create({
              name,
              type: 'skill',
              img: 'icons/svg/book.svg',
              folder: folder?.id || null,
              system: {
                rank: 0,
                stat,
                category,
                checkType,
                notes
              }
            });

            ui.notifications?.info(`Created custom skill "${created.name}" in Skills library.`);
            this.render(false);
          }
        },
        cancel: {
          icon: '<i class="fa-solid fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'create'
    }, {
      width: 480
    }).render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Search input
    html.find('.dcc-sm-search').on('input', ev => {
      this.searchQuery = $(ev.currentTarget).val().toLowerCase().trim();
      this.render(false);
    });

    // Category filter tabs
    html.find('.dcc-sm-category-btn').click(ev => {
      ev.preventDefault();
      this.activeCategory = $(ev.currentTarget).data('category');
      this.render(false);
    });

    // Stat filter pills
    html.find('.dcc-sm-stat-pill').click(ev => {
      ev.preventDefault();
      this.activeStat = $(ev.currentTarget).data('stat');
      this.render(false);
    });

    // Create custom skill
    html.find('.dcc-sm-create-skill-btn').click(ev => {
      ev.preventDefault();
      this.openCreateSkillDialog();
    });

    // Edit custom world skill
    html.find('.dcc-sm-edit-skill').click(ev => {
      ev.preventDefault();
      const skillId = $(ev.currentTarget).data('id');
      const item = game.items?.get(skillId);
      if (item) item.sheet?.render(true);
    });

    // Delete custom world skill
    html.find('.dcc-sm-delete-skill').click(async ev => {
      ev.preventDefault();
      const skillId = $(ev.currentTarget).data('id');
      const item = game.items?.get(skillId);
      if (!item) return;

      DialogClass?.confirm?.({
        title: `Delete Skill: ${item.name}`,
        content: `<p>Are you sure you want to permanently delete the custom skill <strong>${item.name}</strong> from the world skills library?</p>`,
        yes: async () => {
          await item.delete();
          ui.notifications?.info(`Deleted skill "${item.name}".`);
          this.render(false);
        }
      });
    });

    // Add selected skills to Actor
    html.find('.dcc-sm-add-to-actor').click(async ev => {
      ev.preventDefault();
      if (!this.actor) return;

      const checkedSkillNames = html.find('input[name="selectedSkill"]:checked').map((_, el) => $(el).val()).get();
      if (!checkedSkillNames.length) {
        ui.notifications?.info('No skills selected.');
        return;
      }

      const allSkills = await this.getUnifiedSkills();
      const toCreate = [];
      for (const name of checkedSkillNames) {
        const def = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (def) {
          toCreate.push({
            name: def.name,
            type: 'skill',
            img: def.img,
            system: {
              rank: 0,
              stat: def.system.stat || 'str',
              skillType: def.system.skillType || def.system.type || 'Utility',
              type: def.system.type || def.system.skillType || 'Utility',
              category: def.system.category || 'Utility',
              checkType: def.system.checkType || 'Stat Check',
              notes: def.system.notes || ''
            }
          });
        }
      }

      if (toCreate.length) {
        await this.actor.createEmbeddedDocuments('Item', toCreate);
        ui.notifications?.info(`Added ${toCreate.length} skill(s) to ${this.actor.name}.`);
        this.close();
      }
    });

    // Select skill for gear item modifier
    html.find('.dcc-sm-select-for-item').click(async ev => {
      ev.preventDefault();
      if (!this.item) return;

      const skillName = $(ev.currentTarget).data('name');
      const bonus = Number(html.find('#dcc-sm-gear-bonus').val()) || 1;

      let current = this.item.system.skillModifiers;
      if (current && !Array.isArray(current) && typeof current === 'object') {
        current = Object.values(current);
      }
      current = Array.isArray(current) ? foundry.utils.duplicate(current) : [];

      if (this.targetIndex !== null && this.targetIndex >= 0 && this.targetIndex < current.length) {
        current[this.targetIndex].name = skillName;
      } else {
        const existing = current.find(m => m.name.toLowerCase() === skillName.toLowerCase());
        if (existing) {
          existing.bonus = bonus;
        } else {
          current.push({ name: skillName, bonus });
        }
      }

      await this.item.update({ 'system.skillModifiers': current });
      if (this.item.actor?.sheet?.rendered) {
        this.item.actor.render(false);
      }
      ui.notifications?.info(`Added "${skillName}" modifier to ${this.item.name}.`);
      this.close();
    });
  }
}
