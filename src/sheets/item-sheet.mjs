/**
 * Dungeon Crawler Carl Item Sheet Controller
 */
export class DCCItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dcc-sheet-window', 'item'],
      template: 'systems/carl-rpg/templates/items/item-sheet.hbs',
      width: 520,
      height: 480
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
    return context;
  }
}
