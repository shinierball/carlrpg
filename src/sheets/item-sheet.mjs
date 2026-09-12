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
      closeOnSubmit: false
    });
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

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Immediate blur save
    html.find('input, select, textarea').on('blur', () => {
      this.submit();
    });

    // Add Skill Modifier
    html.find('.add-skill-mod').click(async ev => {
      ev.preventDefault();
      const current = Array.isArray(this.item.system.skillModifiers)
        ? foundry.utils.duplicate(this.item.system.skillModifiers)
        : [];
      current.push({ name: '', bonus: 1 });
      await this.item.update({ 'system.skillModifiers': current });
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
