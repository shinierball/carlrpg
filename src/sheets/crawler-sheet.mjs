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

    // Sort skills alphabetically
    context.skills.sort((a, b) => a.name.localeCompare(b.name));

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

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
}
