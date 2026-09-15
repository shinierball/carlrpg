import { DCCSkillManager } from '../apps/skill-manager.mjs';

/**
 * Helper to format active gear bonuses into a readable string summary
 */
export function formatGearBonuses(gearItem) {
  const parts = [];
  const sys = gearItem.system;
  if (!sys) return '';
  const dr = Number(sys.drBonus ?? sys.armorBonus) || 0;
  if (dr !== 0) parts.push(`${dr > 0 ? '+' : ''}${dr} DR`);
  const evade = Number(sys.evadeBonus) || 0;
  if (evade !== 0) parts.push(`${evade > 0 ? '+' : ''}${evade} Evade`);

  if (sys.abilityModifiers) {
    for (const [stat, mods] of Object.entries(sys.abilityModifiers)) {
      if (!mods) continue;
      const val = Number(mods.value);
      const type = (mods.type || 'flat').toLowerCase();
      if (Number.isFinite(val) && val !== 0) {
        if (type === 'pct' || type === '%') {
          parts.push(`${val > 0 ? '+' : ''}${val}% ${stat.toUpperCase()}`);
        } else {
          parts.push(`${val > 0 ? '+' : ''}${val} ${stat.toUpperCase()}`);
        }
      } else {
        // Fallback for legacy format { flat, pct }
        const flat = Number(mods.flat) || 0;
        const pct = Number(mods.pct) || 0;
        if (flat !== 0) parts.push(`${flat > 0 ? '+' : ''}${flat} ${stat.toUpperCase()}`);
        if (pct !== 0) parts.push(`${pct > 0 ? '+' : ''}${pct}% ${stat.toUpperCase()}`);
      }
    }
  }

  let rawMods = sys.skillModifiers;
  if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
    rawMods = Object.values(rawMods);
  }
  if (Array.isArray(rawMods)) {
    for (const sm of rawMods) {
      if (sm && sm.name) {
        const bonus = Number(sm.bonus) || 0;
        parts.push(`${bonus >= 0 ? '+' : ''}${bonus} ${sm.name}`);
      }
    }
  }
  return parts.join(', ');
}

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
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'page1' }],
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false
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
    context.spells = [];
    context.gear = [];
    context.races = [];
    context.classes = [];
    context.deities = [];
    context.sponsors = [];
    context.loot = [];
    context.buffs = [];

    // Track equipped items by slot
    context.equippedBySlot = {
      head: null,
      torso: null,
      arms: null,
      hands: null,
      legs: null,
      feet: null,
      accessory: [],
      tattoo: [],
      patch: []
    };

    for (const item of this.actor.items) {
      if (item.type === 'attack') context.attacks.push(item);
      else if (item.type === 'skill') context.skills.push(item);
      else if (item.type === 'spell') context.spells.push(item);
      else if (item.type === 'gear') {
        item.bonusesSummary = formatGearBonuses(item);
        context.gear.push(item);

        if (item.system?.equipped) {
          const slot = (item.system.slot || 'torso').toLowerCase();
          if (Array.isArray(context.equippedBySlot[slot])) {
            context.equippedBySlot[slot].push(item);
          } else {
            context.equippedBySlot[slot] = item;
          }
        }
      }
      else if (item.type === 'race') context.races.push(item);
      else if (item.type === 'class') context.classes.push(item);
      else if (item.type === 'deity') context.deities.push(item);
      else if (item.type === 'sponsor') context.sponsors.push(item);
      else if (item.type === 'loot') context.loot.push(item);
      else if (item.type === 'buff') context.buffs.push(item);
    }

    // Tally gear skill bonuses from equipped gear
    const gearSkillBonuses = new Map();
    for (const item of context.gear) {
      if (!item.system?.equipped) continue;
      let rawMods = item.system.skillModifiers;
      if (rawMods && !Array.isArray(rawMods) && typeof rawMods === 'object') {
        rawMods = Object.values(rawMods);
      }
      const skillMods = Array.isArray(rawMods) ? rawMods : [];
      for (const sm of skillMods) {
        if (!sm || !sm.name) continue;
        const norm = sm.name.toLowerCase().trim();
        const bonus = Number(sm.bonus) || 0;
        if (!gearSkillBonuses.has(norm)) {
          gearSkillBonuses.set(norm, { bonus: 0, sources: [], originalName: sm.name });
        }
        const entry = gearSkillBonuses.get(norm);
        entry.bonus += bonus;
        entry.sources.push(`${item.name} (+${bonus})`);
      }
    }

    // Apply gear bonuses to actor's existing skills
    const ownedSkillNames = new Set();
    for (const skill of context.skills) {
      const norm = skill.name.toLowerCase().trim();
      ownedSkillNames.add(norm);

      const baseRank = Number(skill.system?.rank) || 0;
      const gearData = gearSkillBonuses.get(norm);
      const itemBonus = gearData ? gearData.bonus : 0;
      const boonBonus = Number(skill.system?.boonBonus) || 0;
      const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus);

      const stat = skill.system?.stat || 'str';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      const totalSkill = modifiedRank + mod;

      skill.baseRank = baseRank;
      skill.itemBonus = itemBonus;
      skill.boonBonus = boonBonus;
      skill.modifiedRank = modifiedRank;
      skill.effectiveRank = modifiedRank;
      skill.statMod = mod;
      skill.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
      skill.totalSkill = totalSkill;
      skill.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
      skill.itemSources = gearData ? gearData.sources.join(', ') : '';

      if (skill.system) {
        skill.system.itemBonus = itemBonus;
        skill.system.boonBonus = boonBonus;
        skill.system.modifiedRank = modifiedRank;
        skill.system.totalSkill = totalSkill;
        skill.system.statMod = mod;
      }
    }

    // Add granted skills from equipped gear that the actor doesn't own
    this._grantedSkills = new Map();
    for (const [norm, data] of gearSkillBonuses.entries()) {
      if (!ownedSkillNames.has(norm)) {
        const official = (CONFIG.DCC?.skills || []).find(s => s.name.toLowerCase().trim() === norm);
        const grantedId = `granted-${norm.replace(/\s+/g, '-')}`;
        const stat = official ? official.system.stat : 'str';
        const mod = context.system.abilities?.[stat]?.mod ?? 0;
        const totalSkill = data.bonus + mod;

        const grantedSkill = {
          id: grantedId,
          _id: grantedId,
          name: official ? official.name : data.originalName,
          type: 'skill',
          img: official ? official.img : 'icons/magic/defensive/shield-barrier-blue.webp',
          isGranted: true,
          baseRank: 0,
          itemBonus: data.bonus,
          boonBonus: 0,
          modifiedRank: data.bonus,
          effectiveRank: data.bonus,
          statMod: mod,
          statModStr: mod >= 0 ? `+${mod}` : `${mod}`,
          totalSkill: totalSkill,
          totalSkillStr: totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`,
          itemSources: data.sources.join(', '),
          system: {
            rank: 0,
            itemBonus: data.bonus,
            boonBonus: 0,
            modifiedRank: data.bonus,
            totalSkill: totalSkill,
            stat: stat,
            checkType: official ? official.system.checkType : 'Stat Check',
            category: official ? (official.system.category || 'Utility') : 'Combat',
            notes: `Granted by ${data.sources.join(', ')}`,
            upgrades: '',
            checked: false
          }
        };

        this._grantedSkills.set(grantedId, grantedSkill);
        context.skills.push(grantedSkill);
      }
    }

    // Sort skills alphabetically
    context.skills.sort((a, b) => a.name.localeCompare(b.name));

    // Prepare spells (stat modifiers, damage data, sorting)
    for (const spell of context.spells) {
      const stat = spell.system?.stat || 'int';
      const mod = context.system.abilities?.[stat]?.mod ?? 0;
      spell.statMod = mod;
      spell.statModStr = mod >= 0 ? `+${mod}` : `${mod}`;
      const dmgData = typeof this.actor.getSpellDamageData === 'function' ? this.actor.getSpellDamageData(spell) : null;
      spell.hasDamage = dmgData?.hasDamage ?? false;
      spell.damageFormula = dmgData?.formula ?? '';
      spell.damageDice = dmgData?.dice ?? '';
      spell.damageType = dmgData?.damageType || spell.system?.damageType || '';
      spell.isAttack = spell.system?.spellType === 'Attack';
    }
    context.spells.sort((a, b) => a.name.localeCompare(b.name));

    // Prepare Hotlist Slots (1-10)
    const hotlistData = context.system.hotlist || {};
    context.hotlistSlots = [];

    for (let i = 1; i <= 10; i++) {
      const slotKey = `slot${i}`;
      let rawVal = hotlistData[slotKey] || '';

      // Safely sanitize array or comma-separated concatenation
      if (Array.isArray(rawVal)) {
        rawVal = rawVal[0] || '';
      }
      let valStr = String(rawVal).trim();
      if (valStr.includes(',')) {
        const parts = valStr.split(',').map(s => s.trim()).filter(Boolean);
        const match = parts.find(p => this.actor.items.get?.(p) ||
          (Array.isArray(this.actor.items)
            ? this.actor.items.find(it => it.id === p || it.name.toLowerCase() === p.toLowerCase())
            : this.actor.items.find?.(it => it.id === p || it.name.toLowerCase() === p.toLowerCase())));
        valStr = match || parts[0] || '';
      }

      let resolvedItem = null;
      if (valStr) {
        // 1. Look up by ID on actor items
        resolvedItem = this.actor.items.get?.(valStr);
        // 2. Look up by ID or name in actor items array/collection
        if (!resolvedItem) {
          const norm = valStr.toLowerCase().trim();
          resolvedItem = Array.isArray(this.actor.items)
            ? this.actor.items.find(it => it.id === valStr || it._id === valStr || it.name.toLowerCase().trim() === norm)
            : this.actor.items.find?.(it => it.id === valStr || it._id === valStr || it.name.toLowerCase().trim() === norm);
        }
        // 3. Look up official spells if ID is a compendium spell ID or name
        if (!resolvedItem && CONFIG.DCC?.spells) {
          const compSpell = CONFIG.DCC.spells.find(s => s._id === valStr || s.name.toLowerCase().trim() === valStr.toLowerCase().trim());
          if (compSpell) {
            const owned = context.spells.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
            resolvedItem = owned || {
              id: compSpell._id,
              name: compSpell.name,
              type: 'spell',
              img: compSpell.img,
              system: compSpell.system,
              isCompendium: true
            };
          }
        }
        // 4. Look up in world items
        if (!resolvedItem && globalThis.game?.items) {
          const worldItem = game.items.find(it => it.id === valStr || it.name.toLowerCase().trim() === valStr.toLowerCase().trim());
          if (worldItem) resolvedItem = worldItem;
        }
      }

      let slotType = '';
      let badge = '';
      let detail = '';
      let gearSlot = '';
      let isEquipped = false;
      let isSpell = false;
      let isGear = false;
      let isLoot = false;
      let isAttack = false;
      let slotHasDamage = false;

      let displayName = valStr;
      if (resolvedItem) {
        displayName = resolvedItem.name;
        slotType = resolvedItem.type;
        if (slotType === 'spell') {
          isSpell = true;
          badge = 'SPELL';
          detail = `${resolvedItem.system?.manaCost ?? 0} MP`;
          if (resolvedItem.system?.spellType) {
            detail += ` • ${resolvedItem.system.spellType}`;
          }
          const dmgData = typeof this.actor.getSpellDamageData === 'function' ? this.actor.getSpellDamageData(resolvedItem) : null;
          slotHasDamage = dmgData?.hasDamage ?? false;
        } else if (slotType === 'gear') {
          isGear = true;
          gearSlot = resolvedItem.system?.slot || 'gear';
          isEquipped = Boolean(resolvedItem.system?.equipped);
          badge = gearSlot.toUpperCase();
          detail = isEquipped ? 'Equipped' : 'Unequipped';
        } else if (slotType === 'loot') {
          isLoot = true;
          badge = 'ITEM';
          detail = `x${resolvedItem.system?.quantity ?? 1}`;
          if (resolvedItem.system?.notes) {
            detail += ` • ${resolvedItem.system.notes}`;
          }
        } else if (slotType === 'attack') {
          isAttack = true;
          badge = 'ATTACK';
          detail = resolvedItem.system?.damageDice || '';
          if (resolvedItem.system?.damageStat) {
            detail += ` + ${resolvedItem.system.damageStat.toUpperCase()}`;
          }
        } else {
          badge = slotType.toUpperCase();
        }
      } else if (valStr) {
        // If unresolvable ID string, do not show raw hash/ID if we can avoid it
        if (/^dccspl\d+/.test(valStr) && CONFIG.DCC?.spells) {
          const found = CONFIG.DCC.spells.find(s => s._id === valStr);
          if (found) displayName = found.name;
        }
      }

      // Build grouped selectable options for this slot
      const groups = [];

      // Spells group
      if (context.spells.length) {
        groups.push({
          label: 'Spells',
          items: context.spells.map(s => ({
            id: s.id,
            label: `⚡ ${s.name} (${s.system?.manaCost ?? 0} MP)`,
            selected: s.id === valStr || s.name.toLowerCase() === valStr.toLowerCase() || s.id === resolvedItem?.id
          }))
        });
      }

      // Attacks group
      if (context.attacks.length) {
        groups.push({
          label: 'Attacks',
          items: context.attacks.map(a => ({
            id: a.id,
            label: `⚔️ ${a.name}${a.system?.damageDice ? ` (${a.system.damageDice})` : ''}`,
            selected: a.id === valStr || a.name.toLowerCase() === valStr.toLowerCase() || a.id === resolvedItem?.id
          }))
        });
      }

      // Gear group
      if (context.gear.length) {
        groups.push({
          label: 'Gear (Equipment)',
          items: context.gear.map(g => ({
            id: g.id,
            label: `🛡️ ${g.name} [${(g.system?.slot || 'gear').toUpperCase()}]${g.system?.equipped ? ' (Equipped)' : ''}`,
            selected: g.id === valStr || g.name.toLowerCase() === valStr.toLowerCase() || g.id === resolvedItem?.id
          }))
        });
      }

      // Inventory / Loot group
      if (context.loot.length) {
        groups.push({
          label: 'Inventory Items',
          items: context.loot.map(l => ({
            id: l.id,
            label: `📦 ${l.name} (x${l.system?.quantity ?? 1})`,
            selected: l.id === valStr || l.name.toLowerCase() === valStr.toLowerCase() || l.id === resolvedItem?.id
          }))
        });
      }

      context.hotlistSlots.push({
        index: i,
        key: slotKey,
        value: valStr,
        isEmpty: !valStr,
        item: resolvedItem,
        itemId: resolvedItem?.id || '',
        name: displayName,
        img: resolvedItem ? (resolvedItem.img || 'icons/svg/item-bag.svg') : '',
        type: slotType,
        isSpell,
        isGear,
        isLoot,
        isAttack,
        hasDamage: slotHasDamage,
        isEquipped,
        gearSlot,
        badge,
        detail,
        groups,
        isCustom: Boolean(valStr && !resolvedItem)
      });
    }

    // -------------------------------------------------------------------------
    // EXTERNAL BUFF SLOTS (Max 3)
    // -------------------------------------------------------------------------
    const rawExternalBuffs = context.system.attributes?.externalBuffs || {};
    context.externalBuffSlots = [];

    // Helper to format descriptive labels for any buff item
    const formatBuffOptionLabel = (b, defaultIcon = '✨') => {
      const sys = b.system || {};
      const bType = (sys.buffType || '').toLowerCase();
      let details = '';

      if (Array.isArray(sys.statModifiers) && sys.statModifiers.length > 0) {
        details = sys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
      } else if (bType === 'stat' && sys.stat) {
        details = `+${sys.value || 2} ${(sys.stat || '').toUpperCase()}`;
      } else if (bType === 'temphp' || bType === 'temp_hp') {
        details = `+${sys.value || 10} Temp HP`;
      } else if (bType === 'resistance' && sys.damageType) {
        details = `Resist ${sys.damageType}`;
      } else if (bType === 'immunity' && sys.damageType) {
        details = `Immune ${sys.damageType}`;
      } else if (bType === 'damagemultiplier' || sys.damageMultiplier > 1) {
        details = `*${sys.damageMultiplier || sys.value || 2} ${sys.damageType || 'Total'} Dmg`;
      } else if (Array.isArray(sys.damageModifiers) && sys.damageModifiers.length > 0) {
        details = sys.damageModifiers.map(m => m.type || m.damageType || 'Mod').join(', ');
      }

      return details ? `${defaultIcon} ${b.name} (${details})` : `${defaultIcon} ${b.name}`;
    };

    // 1. Owned Buffs on Actor
    const ownedBuffs = context.buffs || (this.actor.items ? Array.from(this.actor.items).filter(it => it.type === 'buff') : []);
    const ownedBuffOptions = ownedBuffs.map(b => ({
      id: b.id || b._id,
      name: b.name,
      label: formatBuffOptionLabel(b, '✨')
    }));

    // 2. World Buff Items (items created in the world directory of type buff)
    const worldBuffs = globalThis.game?.items
      ? Array.from(game.items).filter(it => it.type === 'buff' && !ownedBuffs.some(ob => (ob.id && ob.id === it.id) || ob.name.toLowerCase() === it.name.toLowerCase()))
      : [];
    const worldBuffOptions = worldBuffs.map(b => ({
      id: b.id || b._id,
      name: b.name,
      label: formatBuffOptionLabel(b, '🔮')
    }));

    // 3. Compendium & Preloaded System Buffs
    const compBuffsMap = new Map();
    if (CONFIG.DCC?.buffs) {
      for (const b of CONFIG.DCC.buffs) {
        compBuffsMap.set(b._id || b.name.toLowerCase().trim(), {
          id: b._id,
          name: b.name,
          system: b.system || {}
        });
      }
    }
    if (globalThis.game?.packs) {
      const buffPack = game.packs.get('carl-rpg.buffs');
      if (buffPack) {
        const index = buffPack.index || [];
        for (const entry of index) {
          const key = entry._id || entry.name.toLowerCase().trim();
          if (!compBuffsMap.has(key)) {
            compBuffsMap.set(key, {
              id: entry._id,
              name: entry.name,
              system: entry.system || {}
            });
          }
        }
      }
    }

    const allCompBuffs = Array.from(compBuffsMap.values());
    const statBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'stat' || (Array.isArray(b.system?.statModifiers) && b.system.statModifiers.length > 0))
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '⚡') }));
    const tempHpBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'tempHp' || b.system?.buffType === 'temp_hp')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '❤️') }));
    const resistBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'resistance')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '🛡️') }));
    const immuneBuffOptions = allCompBuffs
      .filter(b => b.system?.buffType === 'immunity')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '🌟') }));
    const combatBuffOptions = allCompBuffs
      .filter(b => (b.system?.buffType === 'damageMultiplier' || Number(b.system?.damageMultiplier) > 1 || (Array.isArray(b.system?.damageModifiers) && b.system.damageModifiers.length > 0)) && b.system?.buffType !== 'stat')
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '⚔️') }));
    const otherBuffOptions = allCompBuffs
      .filter(b => {
        const t = (b.system?.buffType || '').toLowerCase();
        return !['stat', 'temphp', 'temp_hp', 'resistance', 'immunity'].includes(t) &&
          !Number(b.system?.damageMultiplier > 1) &&
          (!Array.isArray(b.system?.statModifiers) || !b.system.statModifiers.length) &&
          (!Array.isArray(b.system?.damageModifiers) || !b.system.damageModifiers.length);
      })
      .map(b => ({ id: b.id, name: b.name, label: formatBuffOptionLabel(b, '✨') }));

    for (let i = 1; i <= 3; i++) {
      const slotKey = `buff${i}`;
      let rawVal = rawExternalBuffs[slotKey] || '';
      if (Array.isArray(rawVal)) rawVal = rawVal[0] || '';
      let valStr = String(rawVal).trim();
      if (valStr.includes(',')) {
        valStr = valStr.split(',')[0].trim();
      }

      const resolvedBuff = typeof this.actor.resolveBuff === 'function' ? this.actor.resolveBuff(valStr) : null;
      let displayName = valStr;
      let badge = '';
      let detail = '';
      let isKnownOption = false;

      if (resolvedBuff) {
        displayName = resolvedBuff.name;
        const bSys = resolvedBuff.system || {};
        const bType = (bSys.buffType || '').toLowerCase();
        if (Array.isArray(bSys.statModifiers) && bSys.statModifiers.length > 0) {
          badge = 'STAT';
          detail = bSys.statModifiers.map(m => `+${m.value} ${(m.stat || '').toUpperCase()}`).join(', ');
        } else if (bType === 'stat') {
          badge = 'STAT';
          detail = `+${bSys.value || 2} ${(bSys.stat || '').toUpperCase()}`;
        } else if (bType === 'temphp' || bType === 'temp_hp') {
          badge = 'TEMP HP';
          detail = `+${bSys.value || 10} Temp HP`;
        } else if (bType === 'resistance') {
          badge = 'RESIST';
          detail = `50% ${bSys.damageType || ''} Dmg`;
        } else if (bType === 'immunity') {
          badge = 'IMMUNE';
          detail = `Negate ${bSys.damageType || ''} Dmg`;
        } else if (bType === 'damagemultiplier' || Number(bSys.damageMultiplier) > 1) {
          badge = 'MULT';
          detail = `*${bSys.damageMultiplier || bSys.value || 2} ${bSys.damageType || 'Total'} Dmg`;
        } else if (Array.isArray(bSys.damageModifiers) && bSys.damageModifiers.length > 0) {
          badge = 'COMBAT';
          detail = bSys.damageModifiers.map(m => m.type || m.damageType || 'Mod').join(', ');
        } else {
          badge = 'BUFF';
          detail = bSys.description || '';
        }
      }

      const groups = [];
      const mapOpts = (opts) => opts.map(o => {
        const isSel = Boolean(valStr && (valStr === o.id || valStr.toLowerCase() === o.name.toLowerCase() || resolvedBuff?.id === o.id || resolvedBuff?.name.toLowerCase() === o.name.toLowerCase()));
        if (isSel) isKnownOption = true;
        return { ...o, selected: isSel };
      });

      // 1. Character's owned buffs
      if (ownedBuffOptions.length) {
        groups.push({ label: '📦 Character Buffs', items: mapOpts(ownedBuffOptions) });
      }
      // 2. World buff items
      if (worldBuffOptions.length) {
        groups.push({ label: '🌍 World Buffs', items: mapOpts(worldBuffOptions) });
      }
      // 3. Predefined / Compendium Buffs
      if (statBuffOptions.length) {
        groups.push({ label: '⚡ Ability Score Buffs', items: mapOpts(statBuffOptions) });
      }
      if (tempHpBuffOptions.length) {
        groups.push({ label: '❤️ Temporary Health Buffs', items: mapOpts(tempHpBuffOptions) });
      }
      if (resistBuffOptions.length) {
        groups.push({ label: '🛡️ Damage Resistance Buffs', items: mapOpts(resistBuffOptions) });
      }
      if (immuneBuffOptions.length) {
        groups.push({ label: '🌟 Damage Immunity Buffs', items: mapOpts(immuneBuffOptions) });
      }
      if (combatBuffOptions.length) {
        groups.push({ label: '⚔️ Damage Multiplier & Combat Buffs', items: mapOpts(combatBuffOptions) });
      }
      if (otherBuffOptions.length) {
        groups.push({ label: '✨ Other Compendium Buffs', items: mapOpts(otherBuffOptions) });
      }

      context.externalBuffSlots.push({
        index: i,
        key: slotKey,
        value: valStr,
        isEmpty: !valStr,
        name: displayName,
        badge,
        badgeClass: badge ? ('dcc-buff-badge-' + badge.toLowerCase().replace(/\s+/g, '-')) : '',
        detail,
        groups,
        isCustom: Boolean(valStr && !isKnownOption)
      });
    }

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

    // Open Spells Compendium
    html.find('.open-spell-picker').click(ev => {
      ev.preventDefault();
      const pack = game.packs.get('carl-rpg.spells');
      if (pack) {
        pack.render(true);
      } else {
        ui.notifications?.info('Spells compendium not found.');
      }
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

    // Roll Skill (owned or gear-granted)
    html.find('.roll-skill').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId) || this._grantedSkills?.get(itemId);
      if (item) this.actor.rollSkill(item);
    });

    // Roll / Cast Spell
    html.find('.roll-spell').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpell(item);
    });

    // Roll Spell Damage
    html.find('.roll-spell-dmg, .roll-spell-damage').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpellDamage(item);
    });

    // Roll Spell Attack / To Hit
    html.find('.roll-spell-hit').click(ev => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) this.actor.rollSpellAttack(item);
    });

    // Toggle Gear Equipped
    html.find('.gear-toggle-equipped').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (item) {
        const newEquipped = !item.system.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Immediate form submission on input blur
    html.find('input, select, textarea').on('blur', () => {
      if (this.isEditable) this.submit();
    });

    // Item Create
    html.find('.item-create').click(async ev => {
      ev.preventDefault();
      const type = $(ev.currentTarget).data('type') || 'skill';
      const name = `New ${type.capitalize()}`;
      const created = await this.actor.createEmbeddedDocuments('Item', [{ name, type }]);
      if (created && created[0]) {
        created[0].sheet?.render(true);
      }
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
      if (item) {
        await item.delete();
      }
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

    // Hotlist Slot Selection
    html.find('.hotlist-select').change(async ev => {
      ev.preventDefault();
      const select = $(ev.currentTarget);
      const slot = select.data('slot');
      const val = select.val();
      if (slot) {
        await this.actor.update({ [`system.hotlist.${slot}`]: val });
      }
    });

    // External Buff Slot Selection
    html.find('.external-buff-select').change(async ev => {
      ev.preventDefault();
      const select = $(ev.currentTarget);
      const slot = select.data('slot');
      const val = select.val();
      if (slot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: val });
      }
    });

    // External Buff Slot Clear
    html.find('.external-buff-clear').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = $(ev.currentTarget).data('slot');
      if (slot) {
        await this.actor.update({ [`system.attributes.externalBuffs.${slot}`]: '' });
      }
    });

    // Hotlist Slot Clear
    html.find('.hotlist-clear').click(async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = $(ev.currentTarget).data('slot');
      if (slot) {
        await this.actor.update({ [`system.hotlist.${slot}`]: '' });
      }
    });

    // Hotlist Action: Roll Attack
    html.find('.roll-hotlist-attack').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'hit');
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Hotlist Action: Roll Attack Damage
    html.find('.roll-hotlist-attack-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item && typeof this.actor.rollAttack === 'function') {
        await this.actor.rollAttack(item, 'damage');
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Hotlist Action: Cast Spell
    html.find('.roll-hotlist-spell').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));

      // Fallback: check if it matches a compendium spell
      if (!item && CONFIG.DCC?.spells) {
        const compSpell = CONFIG.DCC.spells.find(s => s._id === itemId || s.name === itemId);
        if (compSpell) {
          const owned = this.actor.items.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
          item = owned;
        }
      }

      if (item && typeof this.actor.rollSpell === 'function') {
        await this.actor.rollSpell(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll();
      }
    });

    // Hotlist Action: Roll Spell Damage
    html.find('.roll-hotlist-spell-dmg').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      let item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));

      if (!item && CONFIG.DCC?.spells) {
        const compSpell = CONFIG.DCC.spells.find(s => s._id === itemId || s.name === itemId);
        if (compSpell) {
          const owned = this.actor.items.find(s => s.name.toLowerCase().trim() === compSpell.name.toLowerCase().trim());
          item = owned;
        }
      }

      if (item && typeof this.actor.rollSpellDamage === 'function') {
        await this.actor.rollSpellDamage(item);
      } else if (item && typeof item.roll === 'function') {
        await item.roll('damage');
      }
    });

    // Hotlist Action: Toggle Gear Equip
    html.find('.toggle-hotlist-equip').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (item) {
        const newEquipped = !item.system?.equipped;
        await item.update({ 'system.equipped': newEquipped });
      }
    });

    // Hotlist Action: Use Item (Loot / Consumables)
    html.find('.roll-hotlist-use').click(async ev => {
      ev.preventDefault();
      const itemId = $(ev.currentTarget).data('itemId');
      const item = this.actor.items.get?.(itemId) ||
        (Array.isArray(this.actor.items) ? this.actor.items.find(it => it.id === itemId) : this.actor.items.find?.(it => it.id === itemId));
      if (!item) return;

      if (typeof item.roll === 'function') {
        await item.roll();
      } else {
        const sys = item.system || {};
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <div class="dcc-chat-card" style="font-family: var(--font-primary, sans-serif);">
              <div class="dcc-chat-card-header" style="display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px; margin-bottom: 6px;">
                <img src="${item.img || 'icons/svg/item-bag.svg'}" style="width: 32px; height: 32px; border: 1px solid #000; border-radius: 4px;" />
                <div>
                  <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #111;">${item.name}</h3>
                  <span style="font-size: 11px; text-transform: uppercase; color: #e74c3c; font-weight: bold;">Used Item</span>
                </div>
              </div>
              ${sys.quantity !== undefined ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Quantity:</strong> ${sys.quantity}</p>` : ''}
              ${sys.notes ? `<p style="margin: 4px 0; font-size: 12px;">${sys.notes}</p>` : ''}
              ${sys.description ? `<div style="font-size: 12px; margin-top: 4px;">${sys.description}</div>` : ''}
            </div>
          `
        });
      }
    });
  }

  /**
   * Open interactive modal to choose skills from the DCC Skill Library & Manager
   */
  _openSkillPicker() {
    new DCCSkillManager({ actor: this.actor }).render(true);
  }

  /** @override */
  async _onDropItem(event, data) {
    if (this.actor.isOwner === false) return false;
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

    // Check if dropped directly onto an External Buff slot
    const buffSlotBox = event.target?.closest?.('.dcc-buff-slot-entry, .dcc-buff-slot');
    const buffSlotKey = buffSlotBox?.dataset?.slot;

    if (buffSlotKey && item.type === 'buff') {
      const isOwned = item.actor?.id === this.actor.id ||
        (this.actor.items.get ? this.actor.items.get(item.id) : (Array.isArray(this.actor.items) && this.actor.items.some(i => i.id === item.id)));

      if (isOwned) {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: item.id });
        return item;
      }

      const createdItems = await super._onDropItem(event, data);
      const createdItem = Array.isArray(createdItems) ? createdItems[0] : createdItems;
      if (createdItem?.id) {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: createdItem.id });
      } else {
        await this.actor.update({ [`system.attributes.externalBuffs.${buffSlotKey}`]: item.id || item.name });
      }
      return createdItems;
    }

    // Check if dropped directly onto a Hotlist box
    const hotlistBox = event.target?.closest?.('.dcc-hotlist-box');
    const hotlistSlot = hotlistBox?.dataset?.slot;

    if (hotlistSlot) {
      // If item is already on this actor, assign directly without creating duplicate
      const isOwned = item.actor?.id === this.actor.id ||
        (this.actor.items.get ? this.actor.items.get(item.id) : this.actor.items.some(i => i.id === item.id));

      if (isOwned) {
        await this.actor.update({ [`system.hotlist.${hotlistSlot}`]: item.id });
        return item;
      }

      // If from compendium or world, create item on actor first and assign to slot
      const createdItems = await super._onDropItem(event, data);
      const createdItem = Array.isArray(createdItems) ? createdItems[0] : createdItems;
      if (createdItem?.id) {
        await this.actor.update({ [`system.hotlist.${hotlistSlot}`]: createdItem.id });
      }
      return createdItems;
    }

    return super._onDropItem(event, data);
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure actor name is strictly a single string and never an array
    if (Array.isArray(formData.name)) {
      formData.name = formData.name[0];
    }
    // Sanitize any hotlist slot entries in form data
    for (let i = 1; i <= 10; i++) {
      const k = `system.hotlist.slot${i}`;
      if (Array.isArray(formData[k])) {
        formData[k] = formData[k][0] || '';
      }
    }
    return super._updateObject(event, formData);
  }
}
