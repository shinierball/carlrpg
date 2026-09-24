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
    if ((this.type === 'attack' || this.type === 'gear') && this.system) {
      let parts = this.system.damageParts;
      if (parts && !Array.isArray(parts) && typeof parts === 'object') {
        parts = Object.values(parts);
      }
      this.system.damageParts = Array.isArray(parts) ? parts : [];
    }
    if (this.type === 'skill' && this.system) {
      let mods = this.system.damageModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.damageModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'buff' || this.type === 'debuff') && this.system) {
      let stats = this.system.statModifiers;
      if (stats && !Array.isArray(stats) && typeof stats === 'object') {
        stats = Object.values(stats);
      }
      this.system.statModifiers = Array.isArray(stats) ? stats : [];

      let dmgs = this.system.damageModifiers;
      if (dmgs && !Array.isArray(dmgs) && typeof dmgs === 'object') {
        dmgs = Object.values(dmgs);
      }
      this.system.damageModifiers = Array.isArray(dmgs) ? dmgs : [];
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
    if ((this.type === 'attack' || this.type === 'gear') && this.system) {
      let parts = this.system.damageParts;
      if (parts && !Array.isArray(parts) && typeof parts === 'object') {
        parts = Object.values(parts);
      }
      this.system.damageParts = Array.isArray(parts) ? parts : [];
    }
    if (this.type === 'skill' && this.system) {
      const baseRank = Number(this.system.rank) || 0;
      const itemBonus = Number(this.system.itemBonus) || 0;
      const boonBonus = Number(this.system.boonBonus) || 0;
      const typeBonus = Number(this.system.typeBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus + typeBonus);
      this.system.modifiedRank = modifiedRank;
      this.modifiedRank = modifiedRank;
      this.effectiveRank = modifiedRank;

      let mods = this.system.damageModifiers;
      if (mods && !Array.isArray(mods) && typeof mods === 'object') {
        mods = Object.values(mods);
      }
      this.system.damageModifiers = Array.isArray(mods) ? mods : [];
    }
    if ((this.type === 'buff' || this.type === 'debuff') && this.system) {
      let stats = this.system.statModifiers;
      if (stats && !Array.isArray(stats) && typeof stats === 'object') {
        stats = Object.values(stats);
      }
      this.system.statModifiers = Array.isArray(stats) ? stats : [];

      let dmgs = this.system.damageModifiers;
      if (dmgs && !Array.isArray(dmgs) && typeof dmgs === 'object') {
        dmgs = Object.values(dmgs);
      }
      this.system.damageModifiers = Array.isArray(dmgs) ? dmgs : [];
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

  async roll(action = 'cast') {
    if (this.type === 'spell') {
      if (this.actor) return this.actor.rollSpell(this, action);
      return DCCItem.rollSpellCard(this);
    }
    if (this.type === 'loot') {
      return this.useLoot();
    }
    if (!this.actor) return;
    if (this.type === 'attack') {
      return this.actor.rollAttack(this, action === 'damage' ? 'damage' : 'hit');
    }
    if (this.type === 'skill') {
      return this.actor.rollSkill(this);
    }
  }

  /**
   * Use a loot / consumable item (e.g. Normal Mana Potion, healing items).
   * Refills resources, decrements quantity, and outputs a rich chat card.
   * @returns {Promise<ChatMessage>}
   */
  async useLoot() {
    const actor = this.actor;
    const sys = this.system || {};
    const itemName = this.name || 'Item';
    const isManaPotion = itemName.toLowerCase().includes('mana potion') ||
      (sys.notes && sys.notes.toLowerCase().includes('mana') && sys.notes.toLowerCase().includes('refill'));

    let extraEffectHtml = '';
    if (isManaPotion && actor && actor.system?.attributes?.mana) {
      const currentMana = actor.system.attributes.mana.value ?? 0;
      const maxMana = actor.system.attributes.mana.max ?? 10;
      await actor.update({ 'system.attributes.mana.value': maxMana });
      extraEffectHtml = `
        <div style="margin-top: 6px; padding: 6px 8px; background: rgba(41, 128, 185, 0.15); border-left: 3px solid #2980b9; color: #2980b9; font-weight: bold; font-size: 12px; border-radius: 2px;">
          <i class="fa-solid fa-bolt"></i> Mana refilled completely to <strong>${maxMana} MP</strong>! (Was ${currentMana} MP)
        </div>
      `;
    }

    const currentQty = Number(sys.quantity) || 1;
    if (currentQty > 1) {
      await this.update({ 'system.quantity': currentQty - 1 });
    } else {
      if (typeof this.delete === 'function') {
        await this.delete();
      } else if (actor && typeof actor.deleteEmbeddedDocuments === 'function') {
        await actor.deleteEmbeddedDocuments('Item', [this.id]);
      } else if (actor && Array.isArray(actor.items)) {
        const idx = actor.items.findIndex(i => (i.id === this.id || i._id === this.id));
        if (idx !== -1) actor.items.splice(idx, 1);
      }
    }

    return ChatMessage.create({
      speaker: actor ? ChatMessage.getSpeaker({ actor }) : undefined,
      content: `
        <div class="dcc-chat-card dcc-item-card" style="font-family: var(--font-primary, sans-serif);">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #2980b9; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${this.img || 'icons/svg/item-bag.svg'}" style="width: 32px; height: 32px; border: 1px solid #000; border-radius: 4px;" />
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${itemName}</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: #2980b9; font-weight: bold;">Used Consumable</span>
            </div>
          </div>
          ${currentQty > 1 ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Remaining Quantity:</strong> ${currentQty - 1}</p>` : '<p style="margin: 2px 0; font-size: 12px; color: #888;"><em>Last consumable used.</em></p>'}
          ${sys.notes ? `<p style="margin: 4px 0; font-size: 12px;">${sys.notes}</p>` : ''}
          ${sys.description ? `<div style="font-size: 12px; margin-top: 4px;">${sys.description}</div>` : ''}
          ${extraEffectHtml}
        </div>
      `
    });
  }

  static async rollSpellCard(spellItem) {
    const sys = spellItem.system || {};
    const manaCost = sys.manaCost ?? 0;

    let content = `
      <div class="dcc-chat-card dcc-spell-card" style="font-family: var(--font-primary, sans-serif);">
        <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
          <img src="${spellItem.img || 'icons/svg/wand.svg'}" style="width: 36px; height: 36px; border: 1px solid #000; border-radius: 4px;" />
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #111;">${spellItem.name}</h3>
            <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">${sys.spellType || 'Spell'}${sys.damageType ? ` • ${sys.damageType}` : ''}</span>
          </div>
        </div>
        ${sys.quote ? `<div style="font-style: italic; color: #555; font-size: 12px; margin-bottom: 8px; border-left: 3px solid #d4af37; padding-left: 6px;">“${sys.quote}”</div>` : ''}
        <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #fdfaf2; border: 1px solid #e2d9c2; padding: 4px 6px; border-radius: 3px;">
          <div><strong>Mana:</strong> <span style="color: #2980b9; font-weight: bold;">${manaCost ? manaCost : 'None'}</span></div>
          <div><strong>Range:</strong> ${sys.range || 'Self'}</div>
          <div><strong>Duration:</strong> ${sys.duration || 'Instantaneous'}</div>
          ${sys.cooldown && sys.cooldown !== 'None' ? `<div><strong>Cooldown:</strong> ${sys.cooldown}</div>` : ''}
          ${sys.favored ? `<div><strong>Favored:</strong> ${sys.favored}</div>` : ''}
          ${sys.aiFavor ? `<div><strong>AI Favor:</strong> +${sys.aiFavor}</div>` : ''}
        </div>
        ${sys.baseDamage ? `<div style="margin-bottom: 6px; font-weight: bold; color: #c0392b; font-size: 13px;">Base Damage: ${sys.baseDamage}</div>` : ''}
        ${sys.description ? `<div style="font-size: 12px; line-height: 1.4; margin-bottom: 8px;">${sys.description}</div>` : ''}
        ${sys.upgrades?.rank5 || sys.upgrades?.rank10 || sys.upgrades?.rank15 ? `
          <div style="border-top: 1px dashed #ccc; padding-top: 4px; font-size: 11px; color: #444;">
            ${sys.upgrades.rank5 && sys.upgrades.rank5 !== 'None' ? `<div><strong style="color: #27ae60;">Rank 5:</strong> ${sys.upgrades.rank5}</div>` : ''}
            ${sys.upgrades.rank10 && sys.upgrades.rank10 !== 'None' ? `<div><strong style="color: #2980b9;">Rank 10:</strong> ${sys.upgrades.rank10}</div>` : ''}
            ${sys.upgrades.rank15 && sys.upgrades.rank15 !== 'None' ? `<div><strong style="color: #8e44ad;">Rank 15:</strong> ${sys.upgrades.rank15}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    return ChatMessage.create({
      content
    });
  }

  get skillType() {
    if (this.type !== 'skill') return '';
    return this.system?.skillType || this.system?.type || 'Utility';
  }

  /**
   * Broadcast achievement to chat if this item is an achievement.
   */
  async announce() {
    if (this.type === 'achievement' && this.actor && typeof this.actor.announceAchievement === 'function') {
      return this.actor.announceAchievement(this);
    }
    return null;
  }
}
