/**
 * Dungeon Crawler Carl RPG Item Document
 */
export class DCCItem extends Item {
  /** @override */
  prepareBaseData() {
    if (super.prepareBaseData) super.prepareBaseData();
    if (this.type === 'gear' && this.system) {
      let mods = this.system.skillModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.skillModifiers = Array.isArray(mods) ? mods : [];
    }
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === 'gear' && this.system) {
      let mods = this.system.skillModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.skillModifiers = Array.isArray(mods) ? mods : [];
    }
    if (this.type === 'skill') {
      const baseRank = Number(this.system.rank) || 0;
      const itemBonus = Number(this.system.itemBonus) || 0;
      const boonBonus = Number(this.system.boonBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus);
      this.system.modifiedRank = modifiedRank;
      this.modifiedRank = modifiedRank;
      this.effectiveRank = modifiedRank;
    }
  }

  /** @override */
  async _onCreate(data, options, userId) {
    if (super._onCreate) await super._onCreate(data, options, userId);

    // Only process on the client that initiated creation to avoid duplicate requests
    if (typeof game !== 'undefined' && game.user && userId !== game.user.id) return;

    // When an embedded item is created on an actor, automatically register it in Foundry's items section
    if (this.isEmbedded && typeof game !== 'undefined' && game.items) {
      if (game.user && !game.user.isGM && !game.user.can?.('ITEM_CREATE')) return;

      const norm = (this.name || '').toLowerCase().trim();
      const existing = game.items.find(i => i.name.toLowerCase().trim() === norm && i.type === this.type);
      if (!existing) {
        try {
          const itemData = this.toObject ? this.toObject() : {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system || {})
          };
          delete itemData._id;
          delete itemData.id;
          await Item.create(itemData);
          console.log(`DCC RPG | Added newly created item "${this.name}" (${this.type}) to Foundry items section.`);
        } catch (err) {
          console.warn(`DCC RPG | Could not add "${this.name}" to Foundry items section:`, err);
        }
      }
    }
  }

  /** @override */
  async _onUpdate(changed, options, userId) {
    if (super._onUpdate) await super._onUpdate(changed, options, userId);

    if (typeof game !== 'undefined' && game.user && userId !== game.user.id) return;

    // If an embedded item is renamed or modified, ensure the item is known in Foundry's items section
    if (this.isEmbedded && typeof game !== 'undefined' && game.items && (changed.name || changed.system)) {
      if (game.user && !game.user.isGM && !game.user.can?.('ITEM_CREATE')) return;

      const norm = (this.name || '').toLowerCase().trim();
      if (!norm) return;

      const existing = game.items.find(i => i.name.toLowerCase().trim() === norm && i.type === this.type);
      if (!existing) {
        try {
          const itemData = this.toObject ? this.toObject() : {
            name: this.name,
            type: this.type,
            img: this.img,
            system: structuredClone(this.system || {})
          };
          delete itemData._id;
          delete itemData.id;
          await Item.create(itemData);
          console.log(`DCC RPG | Synced updated item "${this.name}" (${this.type}) to Foundry items section.`);
        } catch (err) {
          console.warn(`DCC RPG | Could not sync "${this.name}" to Foundry items section:`, err);
        }
      }
    }
  }

  async roll() {
    if (!this.actor) return;
    if (this.type === 'attack') {
      return this.actor.rollAttack(this, 'hit');
    }
    if (this.type === 'skill') {
      return this.actor.rollSkill(this);
    }
  }
}
