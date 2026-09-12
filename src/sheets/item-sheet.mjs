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

    // Ensure abilityModifiers structure exists
    if (!context.system.abilityModifiers) {
      context.system.abilityModifiers = {
        str: { flat: 0, pct: 0 },
        int: { flat: 0, pct: 0 },
        con: { flat: 0, pct: 0 },
        dex: { flat: 0, pct: 0 },
        cha: { flat: 0, pct: 0 }
      };
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
