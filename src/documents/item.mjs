import { getHpPerBar } from '../apps/combat-metrics.mjs';

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
    if (this.type === 'loot' && this.system) {
      let outcomes = this.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      this.system.outcomes = Array.isArray(outcomes) ? outcomes : [];
      for (const out of this.system.outcomes) {
        if (!out) continue;
        if (typeof out.weight === 'string') {
          const digits = out.weight.trim().replace(/[^0-9]/g, '');
          out.weight = digits === '' ? 0 : parseInt(digits, 10);
        } else if (typeof out.weight === 'number' && Number.isFinite(out.weight)) {
          out.weight = Math.max(0, Math.floor(out.weight));
        } else {
          out.weight = 0;
        }
      }
    }
  }

  /** @override */
  prepareData() {
    if (super.prepareData) {
      super.prepareData();
    } else {
      this.prepareBaseData();
      this.prepareDerivedData();
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
    if (this.type === 'loot' && this.system) {
      let outcomes = this.system.outcomes;
      if (outcomes && !Array.isArray(outcomes) && typeof outcomes === 'object') {
        outcomes = Object.values(outcomes);
      }
      this.system.outcomes = Array.isArray(outcomes) ? outcomes : [];
      for (const out of this.system.outcomes) {
        if (!out) continue;
        if (typeof out.weight === 'string') {
          const digits = out.weight.trim().replace(/[^0-9]/g, '');
          out.weight = digits === '' ? 0 : parseInt(digits, 10);
        } else if (typeof out.weight === 'number' && Number.isFinite(out.weight)) {
          out.weight = Math.max(0, Math.floor(out.weight));
        } else {
          out.weight = 0;
        }
      }
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
   * Use a loot / consumable item (e.g. Normal Mana Potion, healing items, scratch-off lottery tickets).
   * Refills resources, decrements quantity, checks scene limits, resolves outcome tables, and outputs a rich chat card.
   * @returns {Promise<ChatMessage|object>}
   */
  async useLoot() {
    const actor = this.actor;
    const sys = this.system || {};
    const itemName = this.name || 'Item';

    // 1. Scene Cooldown Check (e.g. "Once per scene")
    const cooldownStr = String(sys.cooldown || '').toLowerCase().trim();
    const isOncePerScene = cooldownStr.includes('scene');
    const currentSceneId = (typeof canvas !== 'undefined' && canvas?.scene?.id) ? canvas.scene.id : null;

    if (isOncePerScene && currentSceneId) {
      const lastScene = (typeof this.getFlag === 'function')
        ? this.getFlag('carl-rpg', 'lastUsedScene')
        : (this.flags?.['carl-rpg']?.lastUsedScene);

      if (lastScene === currentSceneId) {
        const msg = `"${itemName}" can only be used once per scene, and was already used in this scene!`;
        if (typeof ui !== 'undefined' && ui.notifications?.warn) {
          ui.notifications.warn(msg);
        }
        return { error: 'cooldown_scene', message: msg };
      }
    }

    // 2. Quantity / Uses Check
    const currentQty = Number(sys.quantity) || 1;
    if (currentQty <= 0) {
      const msg = `"${itemName}" has no uses remaining!`;
      if (typeof ui !== 'undefined' && ui.notifications?.warn) {
        ui.notifications.warn(msg);
      }
      return { error: 'depleted', message: msg };
    }

    // 3. Multi-Outcome / Scratch-off Logic
    const outcomes = Array.isArray(sys.outcomes) ? sys.outcomes : [];
    if (outcomes.length > 0) {
      if (isOncePerScene && currentSceneId) {
        if (typeof this.setFlag === 'function') {
          await this.setFlag('carl-rpg', 'lastUsedScene', currentSceneId);
        } else {
          this.flags = this.flags || {};
          this.flags['carl-rpg'] = this.flags['carl-rpg'] || {};
          this.flags['carl-rpg'].lastUsedScene = currentSceneId;
        }
      }

      // Roll on outcome table by weight
      const totalWeight = outcomes.reduce((acc, o) => acc + Math.max(1, Number(o.weight) || 1), 0);
      let rollVal = 1;
      let rollObj = null;
      if (typeof Roll !== 'undefined') {
        rollObj = await (new Roll(`1d${totalWeight}`)).evaluate();
        rollVal = rollObj.total;
      } else {
        rollVal = Math.floor(Math.random() * totalWeight) + 1;
      }

      let runningWeight = 0;
      let chosenOutcome = outcomes[0];
      for (const out of outcomes) {
        runningWeight += Math.max(1, Number(out.weight) || 1);
        if (rollVal <= runningWeight) {
          chosenOutcome = out;
          break;
        }
      }

      // Target detection: closest mob or self
      let targetToken = null;
      let targetActor = null;
      let targetDistFt = null;

      const targetType = chosenOutcome.targetType || 'closest_mob';
      if (targetType === 'closest_mob' || targetType === 'closest' || targetType === 'closest_enemy') {
        if (typeof canvas !== 'undefined' && canvas?.tokens?.placeables) {
          const casterToken = actor?.token?.object ||
            canvas.tokens.placeables.find(t => t.actor?.id === actor?.id);

          const candidateTokens = canvas.tokens.placeables.filter(t =>
            t.actor &&
            t.actor.id !== actor?.id &&
            (t.actor.type === 'mob' || t.actor.type === 'npc') &&
            Number(t.actor.system?.attributes?.hp?.value ?? 1) > 0
          );

          let minDist = Infinity;
          for (const cand of candidateTokens) {
            let dist;
            if (canvas.grid && typeof canvas.grid.measureDistance === 'function' && casterToken) {
              dist = canvas.grid.measureDistance(casterToken, cand);
            } else if (casterToken) {
              dist = Math.hypot(cand.x - casterToken.x, cand.y - casterToken.y);
            } else {
              dist = 0;
            }
            if (dist < minDist) {
              minDist = dist;
              targetToken = cand;
              targetActor = cand.actor;
            }
          }
          if (minDist !== Infinity) {
            targetDistFt = Math.round(minDist);
          }
        }
      } else if (targetType === 'self') {
        targetActor = actor;
      }

      if (!targetActor && typeof game !== 'undefined' && game.user?.targets?.size) {
        targetToken = Array.from(game.user.targets)[0];
        targetActor = targetToken?.actor || null;
      }

      const targetName = targetActor ? targetActor.name : (targetType === 'closest_mob' ? 'Closest Mob (None in range)' : 'Target');
      const distLabel = targetDistFt !== null ? ` (${targetDistFt} ft away)` : '';

      // Decrement quantity
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

      // Outcome type resolution
      const outType = String(chosenOutcome.type || '').toLowerCase();
      let outcomeHtml = '';
      let evaluatedDmg = 0;
      let healAmount = 0;
      let healBars = 0;

      if (outType === 'buff') {
        evaluatedDmg = 0;
        const buffName = chosenOutcome.name || 'Buff';
        const buffDesc = chosenOutcome.description || '';
        const buffId = chosenOutcome.buffId || '';

        outcomeHtml = `
          <div class="dcc-scratch-outcome dcc-outcome-buff" style="background: rgba(41, 128, 185, 0.1); border-left: 4px solid #2980b9; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #2980b9; font-size: 15px; font-weight: bold; text-transform: uppercase;">
                <i class="fa-solid fa-sparkles"></i> ${buffName}
              </h4>
              <span class="dcc-badge" style="background: #2980b9; color: #fff; font-size: 10px;">BUFF</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
            </p>
            ${buffDesc ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${buffDesc}</p>` : ''}
            <div style="margin-top: 8px;">
              <button type="button" class="dcc-apply-buff-btn" data-buff-id="${buffId}" data-buff-name="${buffName}" data-target-id="${targetActor?.id || ''}" style="background: #2980b9; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
                <i class="fa-solid fa-hand-sparkles"></i> Apply Buff (${buffName})
              </button>
            </div>
          </div>
        `;
      } else if (outType === 'debuff') {
        evaluatedDmg = 0;
        const debuffName = chosenOutcome.name || 'Debuff';
        const debuffDesc = chosenOutcome.description || '';
        const debuffId = chosenOutcome.debuffId || '';

        outcomeHtml = `
          <div class="dcc-scratch-outcome dcc-outcome-debuff" style="background: rgba(142, 68, 173, 0.1); border-left: 4px solid #8e44ad; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #8e44ad; font-size: 15px; font-weight: bold; text-transform: uppercase;">
                <i class="fa-solid fa-skull"></i> ${debuffName}
              </h4>
              <span class="dcc-badge" style="background: #8e44ad; color: #fff; font-size: 10px;">DEBUFF</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
            </p>
            ${debuffDesc ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${debuffDesc}</p>` : ''}
            <div style="margin-top: 8px;">
              <button type="button" class="dcc-apply-debuff-btn" data-debuff-id="${debuffId}" data-debuff-name="${debuffName}" data-target-id="${targetActor?.id || ''}" style="background: #8e44ad; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
                <i class="fa-solid fa-biohazard"></i> Apply Debuff (${debuffName})
              </button>
            </div>
          </div>
        `;
      } else if (outType === 'heal' || (chosenOutcome.healBars && outType !== 'spell')) {
        const healTarget = targetActor || actor;
        const hpPerBar = getHpPerBar(healTarget);
        healBars = Number(chosenOutcome.healBars) || 5;
        healAmount = healBars * hpPerBar;

        outcomeHtml = `
          <div class="dcc-scratch-outcome dcc-outcome-heal" style="background: rgba(241, 196, 15, 0.12); border-left: 4px solid #f39c12; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #d35400; font-size: 15px; font-weight: bold; text-transform: uppercase;">
                <i class="fa-solid fa-cake-candles"></i> ${chosenOutcome.name || 'Healing Custard'}
              </h4>
              <span class="dcc-badge" style="background: #f39c12; color: #fff; font-size: 10px;">HEALING</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Recipient:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
            </p>
            <div style="font-size: 14px; font-weight: bold; color: #27ae60; margin: 4px 0;">
              Healing: +${healBars} Health Bars <span style="font-size: 11px; font-weight: normal; color: #555;">(~${healAmount} HP restored)</span>
            </div>
            ${chosenOutcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${chosenOutcome.description}</p>` : ''}
            <div style="margin-top: 8px;">
              <button type="button" class="dcc-apply-healing-btn" data-bars="${healBars}" data-healing="${healAmount}" data-target-id="${targetActor?.id || ''}" style="background: #27ae60; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
                <i class="fa-solid fa-heart"></i> Apply Healing (+${healBars} Bars)
              </button>
            </div>
          </div>
        `;
      } else if (outType === 'spell' || outType === 'damage' || chosenOutcome.damage) {
        const intMod = Number(actor?.system?.abilities?.int?.mod) || 0;
        let formula = chosenOutcome.damage || '2d12 + Int';
        const parsedFormula = formula
          .replace(/\bint\b/gi, String(intMod))
          .replace(/\+\s*\+/g, '+');
        if (typeof Roll !== 'undefined') {
          const dRoll = await (new Roll(parsedFormula)).evaluate();
          evaluatedDmg = dRoll.total;
        } else {
          evaluatedDmg = 12 + intMod;
        }
        const damageType = chosenOutcome.damageType || 'Fire';
        const debuffNote = chosenOutcome.debuff
          ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #c0392b;"><strong>Debuff:</strong> Targets losing 1+ Health Bar gain the <strong>${chosenOutcome.debuff} Debuff</strong>.</p>`
          : '';

        outcomeHtml = `
          <div class="dcc-scratch-outcome dcc-outcome-damage" style="background: rgba(192, 57, 43, 0.08); border-left: 4px solid #c0392b; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #c0392b; font-size: 15px; font-weight: bold; text-transform: uppercase;">
                <i class="fa-solid fa-fire"></i> ${chosenOutcome.name || 'Fireball'}
              </h4>
              <span class="dcc-badge dcc-badge-spell" style="font-size: 10px;">${damageType}</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Target:</strong> <span style="color: #111;">${targetName}${distLabel}</span>
            </p>
            <div style="font-size: 14px; font-weight: bold; color: #c0392b; margin: 4px 0;">
              Damage: ${evaluatedDmg} <span style="font-size: 11px; font-weight: normal; color: #555;">(${parsedFormula})</span>
            </div>
            ${chosenOutcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${chosenOutcome.description}</p>` : ''}
            ${debuffNote}
            <div style="margin-top: 8px;">
              <button type="button" class="dcc-apply-damage-btn" data-multiplier="1" data-damage-value="${evaluatedDmg}" data-damage-type="${damageType}" data-target-id="${targetActor?.id || ''}" style="background: #c0392b; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Oswald', sans-serif;">
                <i class="fa-solid fa-burst"></i> Apply Damage (${evaluatedDmg})
              </button>
            </div>
          </div>
        `;
      } else {
        outcomeHtml = `
          <div class="dcc-scratch-outcome" style="background: rgba(41, 128, 185, 0.1); border-left: 4px solid #2980b9; padding: 8px 10px; margin: 8px 0; border-radius: 3px;">
            <h4 style="margin: 0; color: #2980b9; font-size: 15px; font-weight: bold; text-transform: uppercase;">
              ${chosenOutcome.name || 'Effect'}
            </h4>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Target:</strong> ${targetName}${distLabel}</p>
            ${chosenOutcome.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444;">${chosenOutcome.description}</p>` : ''}
          </div>
        `;
      }

      const isDamageCard = (outType === 'spell' || outType === 'damage') && evaluatedDmg > 0;
      const cardHtml = `
        <div class="dcc-chat-card dcc-item-card ${isDamageCard ? 'dcc-damage-card' : ''} dcc-scratchoff-card"
          data-attacker-id="${actor?.id || ''}"
          data-item-name="${itemName}"
          data-damage-value="${evaluatedDmg}"
          data-damage-type="${isDamageCard ? (chosenOutcome.damageType || 'Fire') : ''}"
          data-target-id="${targetActor?.id || ''}"
          style="font-family: var(--font-primary, sans-serif);">
          <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #8e44ad; padding-bottom: 4px; margin-bottom: 6px;">
            <img src="${this.img || 'icons/svg/item-bag.svg'}" style="width: 34px; height: 34px; border: 1px solid #000; border-radius: 4px;" />
            <div>
              <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${itemName}</h3>
              <span style="font-size: 11px; text-transform: uppercase; color: #8e44ad; font-weight: bold;">
                <i class="fa-solid fa-ticket"></i> Scratch-off Result
              </span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px;">
            <span><strong>Remaining Uses:</strong> ${Math.max(0, currentQty - 1)}</span>
            ${sys.cooldown ? `<span><strong>Limit:</strong> ${sys.cooldown}</span>` : ''}
          </div>
          ${outcomeHtml}
        </div>
      `;

      return ChatMessage.create({
        speaker: actor ? ChatMessage.getSpeaker({ actor }) : undefined,
        content: cardHtml,
        flags: {
          'carl-rpg': {
            outcome: chosenOutcome,
            roll: rollVal,
            damage: evaluatedDmg,
            healBars,
            healAmount,
            buff: outType === 'buff' ? (chosenOutcome.name || 'Buff') : null,
            debuff: outType === 'debuff' ? (chosenOutcome.name || 'Debuff') : null,
            targetId: targetActor?.id || null
          }
        }
      });
    }

    // Standard consumable / mana potion path
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
