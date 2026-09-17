import { BaseActorDataModel } from './base-actor-model.mjs';
import { DCC_WEAPON_GROUP_MAP } from '../../documents/actor.mjs';

/**
 * TypeDataModel for Crawlers (PCs).
 * Encapsulates core abilities, gear slots, hotlist, detailed background,
 * skill bonuses and cascading weapon groups, and experience progression.
 */
export class CrawlerDataModel extends BaseActorDataModel {
  /** @override */
  static defineSchema() {
    const fields = globalThis.foundry.data.fields;

    return {
      abilities: BaseActorDataModel.defineAbilitiesField(),
      attributes: BaseActorDataModel.defineBaseAttributesField(),
      details: new fields.SchemaField({
        crawlerNumber: new fields.StringField({ initial: '' }),
        floor: new fields.StringField({ initial: '1st Floor' }),
        race: new fields.StringField({ initial: '' }),
        class: new fields.StringField({ initial: '' }),
        gender: new fields.StringField({ initial: '' }),
        level: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
        xp: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
          max: new fields.NumberField({ initial: 1000, integer: true }),
          pct: new fields.NumberField({ initial: 0, integer: true })
        }),
        deity: new fields.StringField({ initial: '' }),
        popularity: new fields.StringField({ initial: '' }),
        pastTrauma: new fields.HTMLField({ initial: '' }),
        looseEnds: new fields.HTMLField({ initial: '' }),
        regrets: new fields.HTMLField({ initial: '' }),
        notes: new fields.HTMLField({ initial: '' }),
        importantKills: new fields.StringField({ initial: '' }),
        clubsSocieties: new fields.StringField({ initial: '' }),
        personalSpace: new fields.SchemaField({
          tier: new fields.StringField({ initial: '' }),
          size: new fields.StringField({ initial: '' }),
          amenities: new fields.StringField({ initial: '' })
        })
      }),
      gearSlots: new fields.SchemaField({
        head: new fields.StringField({ initial: '' }),
        torso: new fields.StringField({ initial: '' }),
        arms: new fields.StringField({ initial: '' }),
        hands: new fields.StringField({ initial: '' }),
        legs: new fields.StringField({ initial: '' }),
        feet: new fields.StringField({ initial: '' }),
        accessories: new fields.StringField({ initial: '' })
      }),
      hotlist: new fields.SchemaField({
        slot1: new fields.StringField({ initial: '' }),
        slot2: new fields.StringField({ initial: '' }),
        slot3: new fields.StringField({ initial: '' }),
        slot4: new fields.StringField({ initial: '' }),
        slot5: new fields.StringField({ initial: '' }),
        slot6: new fields.StringField({ initial: '' }),
        slot7: new fields.StringField({ initial: '' }),
        slot8: new fields.StringField({ initial: '' }),
        slot9: new fields.StringField({ initial: '' }),
        slot10: new fields.StringField({ initial: '' })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    // 1. Prepare base stats, gear, buffs, ability scores, Evade, DR, HP, Mana
    const { equippedGear } = this.prepareDerivedBaseStats();
    const actor = this.actor;

    // 2. SKILLS: Calculate Item Bonuses, Boon Bonuses, Modified Rank & Total Skill
    const gearSkillBonuses = new Map();
    for (const item of (equippedGear || [])) {
      let rawMods = item.system?.skillModifiers;
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

    if (actor?.items) {
      const items = Array.isArray(actor.items) ? actor.items : Array.from(actor.items.values?.() || []);
      const skills = items.filter(i => i.type === 'skill');

      // First Pass: Calculate base, item, and boon ranks for all skills,
      // and collect generic weapon group bonuses from trained group skills.
      const genericTypeBonuses = new Map(); // e.g. 'Edge' -> { bonus: 0, sources: [] }

      for (const item of skills) {
        const norm = item.name.toLowerCase().trim();
        const baseRank = Number(item.system?.rank) || 0;
        const gearData = gearSkillBonuses.get(norm);
        const itemBonus = gearData ? gearData.bonus : 0;
        const boonBonus = Number(item.system?.boonBonus) || 0;
        const selfRank = Math.max(0, baseRank + itemBonus + boonBonus);

        const groupType = DCC_WEAPON_GROUP_MAP[norm];
        if (groupType && selfRank > 0) {
          if (!genericTypeBonuses.has(groupType)) {
            genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
          }
          const entry = genericTypeBonuses.get(groupType);
          entry.bonus += selfRank;
          entry.sources.push(`${item.name} (+${selfRank})`);
        }
      }

      // Also incorporate gear modifiers that reference a weapon group or type directly
      // when the actor does not own that skill document
      const ownedSkillNorms = new Set(skills.map(s => s.name.toLowerCase().trim()));
      for (const [norm, data] of gearSkillBonuses.entries()) {
        const groupType = DCC_WEAPON_GROUP_MAP[norm];
        if (groupType && !ownedSkillNorms.has(norm) && data.bonus > 0) {
          if (!genericTypeBonuses.has(groupType)) {
            genericTypeBonuses.set(groupType, { bonus: 0, sources: [] });
          }
          const entry = genericTypeBonuses.get(groupType);
          entry.bonus += data.bonus;
          entry.sources.push(...data.sources);
        }
      }

      // Second Pass: Apply type bonuses to member skills
      for (const item of skills) {
        const norm = item.name.toLowerCase().trim();
        const isGroupSkill = Boolean(DCC_WEAPON_GROUP_MAP[norm]);
        const skillType = item.system?.skillType || item.system?.type || '';

        let typeBonus = 0;
        let typeSources = '';

        if (!isGroupSkill && skillType && genericTypeBonuses.has(skillType)) {
          const tData = genericTypeBonuses.get(skillType);
          typeBonus = tData.bonus;
          typeSources = tData.sources.join(', ');
        }

        const baseRank = Number(item.system?.rank) || 0;
        const gearData = gearSkillBonuses.get(norm);
        const itemBonus = gearData ? gearData.bonus : 0;
        const boonBonus = Number(item.system?.boonBonus) || 0;
        const modifiedRank = Math.max(0, baseRank + itemBonus + boonBonus + typeBonus);

        const stat = item.system?.stat || 'str';
        const statMod = this.abilities?.[stat]?.mod ?? 0;
        const totalSkill = modifiedRank + statMod;

        // Store on system
        if (item.system) {
          item.system.itemBonus = itemBonus;
          item.system.boonBonus = boonBonus;
          item.system.typeBonus = typeBonus;
          item.system.modifiedRank = modifiedRank;
          item.system.totalSkill = totalSkill;
          item.system.statMod = statMod;
        }

        // Direct accessors for backward compatibility
        item.baseRank = baseRank;
        item.itemBonus = itemBonus;
        item.boonBonus = boonBonus;
        item.typeBonus = typeBonus;
        item.modifiedRank = modifiedRank;
        item.effectiveRank = modifiedRank;
        item.statMod = statMod;
        item.statModStr = statMod >= 0 ? `+${statMod}` : `${statMod}`;
        item.totalSkill = totalSkill;
        item.totalSkillStr = totalSkill >= 0 ? `+${totalSkill}` : `${totalSkill}`;
        item.itemSources = gearData ? gearData.sources.join(', ') : '';
        item.typeSources = typeSources;
      }
    }

    // 3. EXPERIENCE & LEVEL PROGRESSION (Crawlers)
    if (this.details) {
      this.details.xp = this.details.xp || {};
      const lvl = Math.max(1, Number(this.details.level) || 1);
      const levelMinXP = (lvl > 1) ? (250 * (lvl - 1) * (lvl - 1) + 750 * (lvl - 1)) : 0;
      const levelMaxXP = 250 * lvl * lvl + 750 * lvl;
      const levelSpan = Math.max(1, levelMaxXP - levelMinXP);

      const currentXP = Number(this.details.xp.value) || 0;
      this.details.xp.value = currentXP;
      this.details.xp.min = levelMinXP;
      this.details.xp.max = levelMaxXP;
      this.details.xp.toNext = Math.max(0, levelMaxXP - currentXP);
      this.details.xp.levelSpan = levelSpan;
      const progressInLevel = Math.max(0, currentXP - levelMinXP);
      this.details.xp.pct = Math.min(100, Math.max(0, Math.round((progressInLevel / levelSpan) * 100)));
    }
  }
}
