/**
 * Dungeon Crawler Carl RPG — Point Build Catalog
 * Canonical benefits, detriments, and point costs derived from Chapter 3 (Pages 158–164)
 * of the official DCC RPG Core Rulebook.
 *
 * Shared between the Class Creator (30 BP base) and Race Creator (25 BP base).
 */

export const DCC_BENEFIT_TIERS = {
  minor: { label: 'Minor Benefits', cost: 1 },
  moderate: { label: 'Moderate Benefits', cost: 2 },
  major: { label: 'Major Benefits', cost: 3 },
  extreme: { label: 'Extreme Benefits', cost: 4 },
  epic: { label: 'Epic Benefits', cost: 6 }
};

export const DCC_DETRIMENT_TIERS = {
  minor: { label: 'Minor Detriments', extraPoints: 1 },
  moderate: { label: 'Moderate Detriments', extraPoints: 2 },
  major: { label: 'Major Detriments', extraPoints: 3 }
};

export const DCC_POINT_BUILD_BENEFITS = [
  // ==========================================
  // MINOR BENEFITS (1 Build Point each)
  // ==========================================
  {
    id: 'minor_club_desperado',
    name: 'Membership in Club Desperado',
    tier: 'minor',
    cost: 1,
    category: 'Club & Access',
    description: 'Gain entry and membership privileges in Club Desperado.'
  },
  {
    id: 'minor_club_vanquisher',
    name: 'Membership in Club Vanquisher',
    tier: 'minor',
    cost: 1,
    category: 'Club & Access',
    description: 'Gain entry and membership privileges in Club Vanquisher.'
  },
  {
    id: 'minor_advancement_check',
    name: '+1 to Skill Advancement Checks',
    tier: 'minor',
    cost: 1,
    category: 'Progression',
    description: 'At the end of each floor, add 1 to your Skill Advancement Checks for a specific Skill.'
  },
  {
    id: 'minor_rank_20_cap',
    name: 'Raise Specific Skill Cap to Rank 20',
    tier: 'minor',
    cost: 1,
    category: 'Progression',
    description: 'Allow a single designated Skill to be raised beyond Rank 15 up to Rank 20.'
  },
  {
    id: 'minor_noncombat_stat_mod',
    name: 'Double Stat Mod on Specific Non-Combat Check',
    tier: 'minor',
    cost: 1,
    category: 'Utility',
    description: 'Add your Stat Mod a second time when using a specific non-combat Skill in a common circumstance.'
  },
  {
    id: 'minor_conditional_advantage',
    name: 'Conditional Combat Advantage',
    tier: 'minor',
    cost: 1,
    category: 'Combat',
    description: 'Gain Advantage when attacking specific creature types or under a strict condition (e.g. against stone creatures).'
  },
  {
    id: 'minor_darkvision',
    name: 'Darkvision / Light Generation',
    tier: 'minor',
    cost: 1,
    category: 'Senses',
    description: 'Can see in total darkness or possesses a natural ability to produce light at will.'
  },
  {
    id: 'minor_double_mana_terrain',
    name: 'Double Mana Regen in Specific Terrain',
    tier: 'minor',
    cost: 1,
    category: 'Magic',
    description: 'Double Mana regeneration rate from mending and resting while in a designated specific environment.'
  },
  {
    id: 'minor_telescopic_vision',
    name: 'Telescopic Vision',
    tier: 'minor',
    cost: 1,
    category: 'Senses',
    description: 'Can see twice as far as normal creatures with enhanced visual acuity.'
  },
  {
    id: 'minor_crafting_table_t1',
    name: 'Tier-1 Crafting Table',
    tier: 'minor',
    cost: 1,
    category: 'Crafting',
    description: 'A Tier-1 crafting table shows up inside your Personal Space as soon as you acquire one.'
  },
  {
    id: 'minor_safe_room',
    name: 'Complimentary Safe Room Lodging',
    tier: 'minor',
    cost: 1,
    category: 'Utility',
    description: 'Gain a free, guaranteed private room inside safe rooms.'
  },
  {
    id: 'minor_store_discount',
    name: 'Merchant Discount / Interest Bonus (+1)',
    tier: 'minor',
    cost: 1,
    category: 'Economy',
    description: 'Receive a discount at stores, a bonus earned from sales, or extra bank interest (+1 for each category).'
  },
  {
    id: 'minor_session_benefit',
    name: 'Once-per-Session Non-Combat Perk',
    tier: 'minor',
    cost: 1,
    category: 'Utility',
    description: 'Gain a designated non-combat benefit once per session under very specific narrative conditions.'
  },

  // ==========================================
  // MODERATE BENEFITS (2 Build Points each)
  // ==========================================
  {
    id: 'mod_dr_buff_1',
    name: '+1 DR Buff',
    tier: 'moderate',
    cost: 2,
    category: 'Defense',
    description: 'Permanently gain +1 Damage Reduction (DR). Costs 2 BP (can be purchased up to 3 times for a total of +3 DR).'
  },
  {
    id: 'mod_dr_buff_2',
    name: '+2 DR Buff',
    tier: 'moderate',
    cost: 4,
    category: 'Defense',
    description: 'Permanently gain +2 Damage Reduction (DR). Costs 4 BP (purchased twice).'
  },
  {
    id: 'mod_dr_buff_3',
    name: '+3 DR Buff',
    tier: 'moderate',
    cost: 6,
    category: 'Defense',
    description: 'Permanently gain +3 Damage Reduction (DR). Costs 6 BP (maximum standard limit of +3 DR).'
  },
  {
    id: 'mod_kill_heal_bar',
    name: 'Vampiric Execution (Heal 1 Health Bar on Kill/Dmg)',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'Heal 1 Health Bar slot when you damage or kill a creature with a specific Weapon Skill or Spell (up to 5 Health Bars per combat scene).'
  },
  {
    id: 'mod_attack_stat_mod_x2',
    name: 'Double Attack Stat Mod in Common Condition',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'Add your Stat Mod a second time when making an attack in a common circumstance.'
  },
  {
    id: 'mod_advancement_advantage',
    name: 'Advantage on Specific Skill Advancement Checks',
    tier: 'moderate',
    cost: 2,
    category: 'Progression',
    description: 'Roll with Advantage when making floor-end Skill Advancement Checks for a designated Skill.'
  },
  {
    id: 'mod_linked_advancement_plus1',
    name: '+1 Advancement Checks on Linked Skill Group',
    tier: 'moderate',
    cost: 2,
    category: 'Progression',
    description: 'At the end of each floor, add 1 to your Skill Advancement Checks for a thematically linked group of skills.'
  },
  {
    id: 'mod_damage_type_shift',
    name: 'Encounter Damage Type Alteration',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'At the start of combat, you can declare that all damage you deal is converted to a different damage type for that combat.'
  },
  {
    id: 'mod_guild_access',
    name: 'Universal Guild Access',
    tier: 'moderate',
    cost: 2,
    category: 'Club & Access',
    description: 'Can access any guild of a particular type on any floor (e.g. any Weapon Training Guild).'
  },
  {
    id: 'mod_unlimited_mana_regen',
    name: 'Unrestricted Double Mana Regeneration',
    tier: 'moderate',
    cost: 2,
    category: 'Magic',
    description: 'Double Mana regeneration from mending and resting without any environmental or situational limits.'
  },
  {
    id: 'mod_all_clubs',
    name: 'Universal Professional & Social Club Access',
    tier: 'moderate',
    cost: 2,
    category: 'Club & Access',
    description: 'Gain membership in all professional and social clubs across the World Dungeon.'
  },
  {
    id: 'mod_book_of_the_floor',
    name: 'Dungeon Book of the Floor Club Access',
    tier: 'moderate',
    cost: 2,
    category: 'Club & Access',
    description: 'Membership in the Dungeon Book of the Floor Club, unlocking exclusive spell tomes and class abilities.'
  },
  {
    id: 'mod_linked_rank_20',
    name: 'Raise Thematically Linked Skills to Rank 20',
    tier: 'moderate',
    cost: 2,
    category: 'Progression',
    description: 'A thematically linked group of skills can be raised beyond Rank 15 up to Rank 20.'
  },
  {
    id: 'mod_mob_gold_bounty',
    name: 'Signature Attack Gold Bounty (1 x Floor)',
    tier: 'moderate',
    cost: 2,
    category: 'Economy',
    description: 'Mobs drop 1 x Floor Number extra gold when killed with your designated signature attack.'
  },
  {
    id: 'mod_popularity_action',
    name: 'Signature Action Popularity Generation',
    tier: 'moderate',
    cost: 2,
    category: 'Popularity',
    description: 'Ability to gain audience Popularity when executing specific theatrical actions, attacks, or catchphrases.'
  },
  {
    id: 'mod_patron_benefit',
    name: 'Patron Benefit',
    tier: 'moderate',
    cost: 2,
    category: 'Utility',
    description: 'Gain regular communication, gifts, or minor sponsorships from a dedicated galactic patron.'
  },
  {
    id: 'mod_uncommon_resistance',
    name: 'Resistance to Uncommon Damage Type',
    tier: 'moderate',
    cost: 2,
    category: 'Defense',
    description: 'Resistance (take half damage) to an uncommon damage type such as Force, Psychic, or Necrotic.'
  },
  {
    id: 'mod_hazard_resistance',
    name: 'Environmental Hazard Resistance',
    tier: 'moderate',
    cost: 2,
    category: 'Defense',
    description: 'Resistance (take half damage) to damage dealt by the dungeon environment (Falling, Drowning, floor traps).'
  },
  {
    id: 'mod_stat_swap',
    name: 'Stat Modifier Replacement for Ability/Skill',
    tier: 'moderate',
    cost: 2,
    category: 'Utility',
    description: 'Replace a Stat used in an ability with another Stat (e.g. apply Charisma to Intimidate instead of Strength).'
  },
  {
    id: 'mod_secondary_stat_mod',
    name: 'Secondary Stat Mod Added to Skill',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'Add a secondary Stat Modifier from another ability in addition to the normal Mod for specific Skills.'
  },
  {
    id: 'mod_cross_weapon_skill',
    name: 'Cross-Weapon Skill Technique Transfer',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'Use skills and weapon techniques designed for one weapon type on an entirely different weapon type.'
  },
  {
    id: 'mod_healing_spell_boost',
    name: 'Enhanced Healing Spells (+1 Health Bar)',
    tier: 'moderate',
    cost: 2,
    category: 'Magic',
    description: 'When you cast any Healing-type Spell, the target heals 1 additional Health Bar slot.'
  },
  {
    id: 'mod_traverse_terrain',
    name: 'Unchecked Terrain Traversal',
    tier: 'moderate',
    cost: 2,
    category: 'Movement',
    description: 'Traverse difficult terrain types (swamps, rubble, mud, ice) without requiring Skill Checks.'
  },
  {
    id: 'mod_burrow',
    name: 'Burrowing Movement',
    tier: 'moderate',
    cost: 2,
    category: 'Movement',
    description: 'Gain the natural ability to burrow through earth, soil, and loose rock.'
  },
  {
    id: 'mod_water_breathing',
    name: 'Aquatic Respiration (Breathe Underwater)',
    tier: 'moderate',
    cost: 2,
    category: 'Utility',
    description: 'Breathe underwater and survive submerged indefinitely without drowning.'
  },
  {
    id: 'mod_natural_attack_d6',
    name: 'Natural Attack (1d6 + Mod Scaling)',
    tier: 'moderate',
    cost: 2,
    category: 'Combat',
    description: 'A natural attack at [Rank = Floor Number] dealing 1d6 + Stat Mod damage. Gains +1d6 damage at Rank 5, 10, and 15.'
  },
  {
    id: 'mod_reassign_stats',
    name: 'Long Rest Stat Point Reassignment',
    tier: 'moderate',
    cost: 2,
    category: 'Utility',
    description: 'Reassign your Class/Race stat bonus allocations once per floor during a Long Rest.'
  },

  // ==========================================
  // MAJOR BENEFITS (3 Build Points each)
  // ==========================================
  {
    id: 'major_manager_assistance',
    name: 'Personal Manager Guide Assistance',
    tier: 'major',
    cost: 3,
    category: 'Utility',
    description: 'Access to significant managerial advice, sponsorship navigation, and backstage showrunner intervention.'
  },
  {
    id: 'major_pet_or_mount',
    name: 'Loyal Companion: Friendly Pet or Mount',
    tier: 'major',
    cost: 3,
    category: 'Companion',
    description: 'Gain a bonded friendly Pet or war-trained Mount immediately upon selecting the class.'
  },
  {
    id: 'major_pet_mount_commander',
    name: 'Pack Commander (Up to 4 Pts Buff to Pets/Mounts)',
    tier: 'major',
    cost: 3,
    category: 'Companion',
    description: 'Ability to grant significant buffs or perks (up to 4 points) to all owned Pets or Mounts.'
  },
  {
    id: 'major_encounter_alteration',
    name: 'Daily Encounter Disruption (1/Day)',
    tier: 'major',
    cost: 3,
    category: 'Combat',
    description: 'Once per day, dramatically alter an encounter scene (e.g. force enemies to turn against each other).'
  },
  {
    id: 'major_absolute_defense',
    name: 'Daily Absolute Defense (1/Day)',
    tier: 'major',
    cost: 3,
    category: 'Defense',
    description: 'Usable once per day: completely negate all damage taken from a single incoming attack.'
  },
  {
    id: 'major_party_buff_daily',
    name: 'Daily Party-Wide Buff (1/Day)',
    tier: 'major',
    cost: 3,
    category: 'Party',
    description: 'Once per day, buff the entire party for 1 hour (e.g. granting party-wide regeneration, +1 DR, or bonus dice).'
  },
  {
    id: 'major_limited_flight',
    name: 'Limited Flight / Gliding',
    tier: 'major',
    cost: 3,
    category: 'Movement',
    description: 'The ability to fly with situational limitations (e.g. up to 500ft per scene or gliding).'
  },
  {
    id: 'major_anaerobic_biology',
    name: 'Anaerobic Biology (No Breathing & Toxin Immunity)',
    tier: 'major',
    cost: 3,
    category: 'Defense',
    description: 'Survive indefinitely without breathing; grants complete immunity to inhaled toxins, gases, and suffocation.'
  },
  {
    id: 'major_rage',
    name: 'Berserker Rage (+1 Melee Damage per Lost Bar)',
    tier: 'major',
    cost: 3,
    category: 'Combat',
    description: 'Your melee attacks deal +1 bonus damage for each Health Bar slot you have currently lost.'
  },
  {
    id: 'major_size_small',
    name: 'Small Size Category (Size 2 or less)',
    tier: 'major',
    cost: 3,
    category: 'Utility',
    description: 'Reduce creature size to Size 2 (Small) or Petite, granting evasion bonuses and space traversal.'
  },
  {
    id: 'major_movement_bonus',
    name: '+5ft Move or +5 Step Bonus',
    tier: 'major',
    cost: 3,
    category: 'Movement',
    description: 'Permanently increases the crawler’s Move speed value by +5ft or Step value by +5.'
  },
  {
    id: 'major_bonus_die_1d4',
    name: '+1d4 Bonus Die to Evade or Stat Checks',
    tier: 'major',
    cost: 3,
    category: 'Combat',
    description: 'Roll a permanent bonus 1d4 die on your Evade Checks or on Stat Checks for a designated ability score.'
  },
  {
    id: 'major_natural_attack_d8',
    name: 'Heavy Natural Attack (1d8 + Mod Scaling)',
    tier: 'major',
    cost: 3,
    category: 'Combat',
    description: 'A heavy natural attack at [Rank = Floor Number] dealing 1d8 + Stat Mod damage (+1d8 at Rank 5, 10, 15).'
  },
  {
    id: 'major_noncombat_advantage',
    name: 'Advantage on Specific Non-Combat Skill or Spell',
    tier: 'major',
    cost: 3,
    category: 'Utility',
    description: 'Roll with Advantage whenever making checks for a specific non-combat Skill or non-attack Spell.'
  },
  {
    id: 'major_situational_double_dmg',
    name: 'Situational x2 Damage Burst (1 Round/Scene)',
    tier: 'major',
    cost: 3,
    category: 'Combat',
    description: 'Under specific combat triggers (e.g. surprise round or flanking), deal x2 total damage for one round.'
  },
  {
    id: 'major_con_swap_hp',
    name: 'Swap Con for Determining Health Bars',
    tier: 'major',
    cost: 3,
    category: 'Defense',
    description: 'Swap Constitution for another Stat (e.g. Strength or Intelligence) when determining Health Bar slot capacity.'
  },
  {
    id: 'major_climb_movement',
    name: 'Ceiling & Wall Spider Climb Movement',
    tier: 'major',
    cost: 3,
    category: 'Movement',
    description: 'Gain a Climb movement speed that allows automatic traversal across vertical walls and ceilings.'
  },

  // ==========================================
  // EXTREME BENEFITS (4 Build Points each)
  // ==========================================
  {
    id: 'extreme_exotic_skill',
    name: 'Exotic Unlearnable Skill Access (+1 Rank)',
    tier: 'extreme',
    cost: 4,
    category: 'Progression',
    description: 'Gain +1 Rank in an exotic skill normally impossible to learn (e.g. Cockroach, Light on Your Feet).'
  },
  {
    id: 'extreme_linked_skills_small',
    name: '+1 to Thematically Linked Group (3–5 Skills)',
    tier: 'extreme',
    cost: 4,
    category: 'Progression',
    description: '+1 Rank to all Skills in a thematically linked group of 3–5 Skills (e.g. Hand-to-Hand, CON-based skills).'
  },
  {
    id: 'extreme_stat_checks_advantage',
    name: 'Advantage on All Stat Checks for Specific Stat',
    tier: 'extreme',
    cost: 4,
    category: 'Utility',
    description: 'Roll with Advantage on all raw Stat Checks for a chosen ability score (e.g. all Constitution checks).'
  },
  {
    id: 'extreme_linked_rank_20_group',
    name: 'Linked Group Skill Cap to Rank 20 (Up to 6 Skills)',
    tier: 'extreme',
    cost: 4,
    category: 'Progression',
    description: 'All skills in a thematically linked group of up to 6 skills can be raised beyond Rank 15 to Rank 20.'
  },
  {
    id: 'extreme_poison_immunity',
    name: 'Complete Poison Immunity',
    tier: 'extreme',
    cost: 4,
    category: 'Defense',
    description: 'Total immunity to Poison damage, envenomed conditions, and poisoned debuffs.'
  },
  {
    id: 'extreme_common_resistance',
    name: 'Resistance to Common Damage Type',
    tier: 'extreme',
    cost: 4,
    category: 'Defense',
    description: 'Resistance (take half damage) to a common physical or elemental damage type (Bludgeoning, Piercing, Slashing, Fire).'
  },
  {
    id: 'extreme_double_spell_duration',
    name: 'Double Spell Duration (Rank 5 & Lower)',
    tier: 'extreme',
    cost: 4,
    category: 'Magic',
    description: 'Double the duration of all your Rank 5 and lower duration-based spells.'
  },
  {
    id: 'extreme_noncombat_broad_advantage',
    name: 'Broad Non-Combat Advantage',
    tier: 'extreme',
    cost: 4,
    category: 'Utility',
    description: 'Roll with Advantage on all Skills in a broad non-combat scenario (e.g. all social negotiations in taverns).'
  },
  {
    id: 'extreme_additional_arm',
    name: 'Additional Functional Arm',
    tier: 'extreme',
    cost: 4,
    category: 'Physical',
    description: 'Gain a fully articulated extra arm capable of holding shields, two-handed weapons, or wielding tools.'
  },
  {
    id: 'extreme_doppelganger_morph',
    name: 'Malleable Form Doppelgänger Morphing',
    tier: 'extreme',
    cost: 4,
    category: 'Utility',
    description: 'Transform body mass like clay to impersonate creatures, mimic clothing, and slip out of restraints.'
  },

  // ==========================================
  // EPIC BENEFITS (6 Build Points each)
  // ==========================================
  {
    id: 'epic_linked_skills_large',
    name: '+1 to Thematically Linked Group (6+ Skills)',
    tier: 'epic',
    cost: 6,
    category: 'Progression',
    description: '+1 Rank in all Skills belonging to a broad thematically linked group of 6 or more Skills (e.g. all Ranged Weapons or INT skills).'
  },
  {
    id: 'epic_universal_rank_20',
    name: 'Universal Rank 20 Cap for All Skills',
    tier: 'epic',
    cost: 6,
    category: 'Progression',
    description: 'Every single skill on your character can be trained and advanced up to Rank 20 without individual exceptions.'
  },
  {
    id: 'epic_major_defense_immunity',
    name: 'Common Damage Immunity / Nine Lives Defense',
    tier: 'epic',
    cost: 6,
    category: 'Defense',
    description: 'Absolute immunity to a common damage type (Fire, Bludgeoning, Piercing) or take half damage from the first 9 attacks each day.'
  },
  {
    id: 'epic_limb_regeneration',
    name: 'Limb & Organ Regeneration',
    tier: 'epic',
    cost: 6,
    category: 'Defense',
    description: 'Severed limbs, damaged organs, and bodily destruction regenerate over time without requiring divine healing.'
  },
  {
    id: 'epic_disease_poison_immunity',
    name: 'Immunity to Poison and All Diseases',
    tier: 'epic',
    cost: 6,
    category: 'Defense',
    description: 'Absolute physiological immunity to all poisons, bio-weapons, diseases, viruses, and infections.'
  },
  {
    id: 'epic_changeling_shapeshifting',
    name: 'Changeling Shapeshifting & Race Library',
    tier: 'epic',
    cost: 6,
    category: 'Utility',
    description: 'Touch any species to store in your shapeshifting library; transform as an action and assume their racial stats and skills.'
  },
  {
    id: 'epic_stat_skill_advantage',
    name: 'Advantage on All Skill Checks for a Specific Stat',
    tier: 'epic',
    cost: 6,
    category: 'Progression',
    description: 'Roll with Advantage on all Skill Checks governed by a chosen Ability Score (e.g. all Dexterity skill checks).'
  },
  {
    id: 'epic_unrestricted_flight',
    name: 'Unrestricted Unlimited Flight',
    tier: 'epic',
    cost: 6,
    category: 'Movement',
    description: 'Sustained, continuous aerial flight with full mobility and no duration, altitude, or scene restrictions.'
  }
];

export const DCC_POINT_BUILD_DETRIMENTS = [
  // ==========================================
  // MINOR DETRIMENTS (+1 Extra Build Point)
  // ==========================================
  {
    id: 'det_minor_club_exclusion',
    name: 'Club Exclusion Disqualification',
    tier: 'minor',
    extraPoints: 1,
    description: 'Cannot choose this Class/Race if you possess membership in a specific club (e.g. Club Vanquisher).'
  },
  {
    id: 'det_minor_stat_penalties',
    name: 'Stat Penalties (-2 Stats)',
    tier: 'minor',
    extraPoints: 1,
    description: 'For every -2 worth of Stat penalties assigned, gain +1 extra Build Point.'
  },
  {
    id: 'det_minor_skill_penalties',
    name: 'Skill Penalties (-2 Skills)',
    tier: 'minor',
    extraPoints: 1,
    description: 'For every -2 worth of Skill rank penalties assigned, gain +1 extra Build Point.'
  },
  {
    id: 'det_minor_stat_group_skill_penalties',
    name: 'Stat-Wide Skill Penalty (-1 to All Skills Under Stat)',
    tier: 'minor',
    extraPoints: 1,
    description: 'For every -1 penalty to all Skills governed by a specific Stat (e.g. all Charisma skills), gain +1 extra Build Point.'
  },
  {
    id: 'det_minor_unfavored_spell_mana',
    name: '+1 Mana Cost for Non-Favored Spells',
    tier: 'minor',
    extraPoints: 1,
    description: 'Spells that are not favored by your Class cost +1 additional Mana to cast.'
  },
  {
    id: 'det_minor_conditional_disadvantage',
    name: 'Conditional Disadvantage on Linked Skills',
    tier: 'minor',
    extraPoints: 1,
    description: 'Disadvantage when using a thematically linked group of skills under a specific condition (e.g. social skills against fae).'
  },
  {
    id: 'det_minor_mandatory_worship',
    name: 'Mandatory Daily Deity Worship',
    tier: 'minor',
    extraPoints: 1,
    description: 'Must pledge and maintain daily worship and offerings to a dungeon deity, risking divine retribution if missed.'
  },
  {
    id: 'det_minor_prohibited_worship',
    name: 'Prohibited from Deity Worship',
    tier: 'minor',
    extraPoints: 1,
    description: 'Gods find you repulsive; strictly prohibited from worshiping deities or receiving divine blessings.'
  },
  {
    id: 'det_minor_advancement_penalty',
    name: '-1 to Advancement Checks for Rank 5+ Class Skill',
    tier: 'minor',
    extraPoints: 1,
    description: 'Suffer a -1 penalty when making Skill Advancement Checks for a specific Rank 5+ class skill.'
  },
  {
    id: 'det_minor_uncommon_vulnerability',
    name: 'Vulnerability: Uncommon Damage (Double Damage)',
    tier: 'minor',
    extraPoints: 1,
    description: 'Take double damage from an uncommon damage type such as Force, Psychic, or Necrotic.'
  },
  {
    id: 'det_minor_halve_nonfocus_damage',
    name: 'Halve Damage of Non-Focus Category',
    tier: 'minor',
    extraPoints: 1,
    description: 'Halve the damage dealt by an entire broad category that is not your focus (e.g. halving all spell damage if a Barbarian).'
  },
  {
    id: 'det_minor_milestone_delay',
    name: 'Delayed Milestone Activation (Floor 6+ / Lvl 50+)',
    tier: 'minor',
    extraPoints: 1,
    description: 'Delay a major bonus from activating until descending to the 6th Floor or reaching Level 50.'
  },

  // ==========================================
  // MODERATE DETRIMENTS (+2 Extra Build Points)
  // ==========================================
  {
    id: 'det_mod_broad_disadvantage',
    name: 'Broad Disadvantage Condition',
    tier: 'moderate',
    extraPoints: 2,
    description: 'A permanent weakness with a broad condition (e.g. Disadvantage on all social interaction checks).'
  },
  {
    id: 'det_mod_descent_only_advancement',
    name: 'Floor Descent Only Skill Progression',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Signature class skill never advances through normal checks; only increases in Rank upon descending to the next floor.'
  },
  {
    id: 'det_mod_weapon_restriction',
    name: 'Severe Weapon Selection Restriction',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Strictly limited choice of weapons permitted for use in combat.'
  },
  {
    id: 'det_mod_no_weapon_stat_mod',
    name: 'No Stat Mod Added to Class Weapon Damage',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Do not add any Ability Modifier to the damage dealt by your designated class weapon skill.'
  },
  {
    id: 'det_mod_class_spell_mana_3',
    name: '+3 Mana Cost for Class Spell Category',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Spells of a designated class category cost +3 additional Mana to cast.'
  },
  {
    id: 'det_mod_movement_disadvantage',
    name: 'Disadvantage on All Movement Skills',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Disadvantage when using any movement-related skill (Running, Jumping, Climbing, Acrobatics).'
  },
  {
    id: 'det_mod_broad_gear_prohibition',
    name: 'Prohibition from Broad Useful Item Category',
    tier: 'moderate',
    extraPoints: 2,
    description: 'Prohibited from using a wide category of useful gear (e.g. inability to equip armor or cast passive spells).'
  },

  // ==========================================
  // MAJOR DETRIMENTS (+3 Extra Build Points)
  // ==========================================
  {
    id: 'det_major_stat_cap_10',
    name: 'Permanent Stat Cap at 10',
    tier: 'major',
    extraPoints: 3,
    description: 'A designated Ability Score is permanently capped at 10. Magic gear, buffs, and potions cannot exceed this limit.'
  },
  {
    id: 'det_major_common_vulnerability',
    name: 'Vulnerability: Common Damage (Double Damage)',
    tier: 'major',
    extraPoints: 3,
    description: 'Take double damage from a common physical or elemental type (Bludgeoning, Piercing, Slashing, or Fire).'
  }
];

export const DCC_CANONICAL_PRESETS = [
  {
    id: 'dungeon_dad',
    name: 'Dungeon Dad',
    builderType: 'class',
    classTypes: ['Bard', 'Fighter'],
    isEarth: true,
    prerequisites: 'None (Earth Class, Recommended for older or dad-coded crawlers)',
    description: 'Once a little league coach, you’ve watched much of life pass you by, but you’re determined to protect and guide the youth—even if they’re a group of 20- to 30-somethings who should have learned basics like reading warnings, how to share, and talk about their feelings without being an asshole before now.',
    stats: { str: 1, dex: -2, con: 1, int: 0, cha: 2 },
    skills: [
      { name: 'Catcher', rank: 3, cost: 6 },
      { name: 'Repair', rank: 2, cost: 4 },
      { name: 'Tactics', rank: 2, cost: 4 },
      { name: 'Longsword (Choice)', rank: 2, cost: 4 }
    ],
    spells: [
      { name: 'Hot Stuff Aura', rank: 2, cost: 4 }
    ],
    selectedBenefits: [
      {
        id: 'extreme_party_buff',
        name: 'Cooked Meal Party Buff (Grill Dad)',
        cost: 4,
        category: 'Party',
        customText: 'When you and up to 6 allies consume a meal you cooked (taking at least 30 min), each eater gains +1 Buff to all Skill Checks for 1 hour.'
      },
      {
        id: 'mod_help_bonus',
        name: 'Help / Intervene Bonus Die (+1d4)',
        cost: 2,
        category: 'Combat',
        customText: 'Roll a bonus 1d4 when you make the Help or Intervene Actions and add it to the benefit provided to your target.'
      },
      {
        id: 'mod_dr_buff_2',
        name: '+2 DR Buff (Purchased Twice)',
        cost: 4,
        category: 'Defense',
        customText: '+2 Damage Reduction (DR)'
      }
    ],
    selectedDetriments: [
      {
        id: 'det_minor_stat_penalties',
        name: 'Clumsy Dad (-2 DEX)',
        extraPoints: 1,
        customText: '-2 Dexterity'
      },
      {
        id: 'det_minor_uncommon_vulnerability',
        name: 'Aching Joints (Vulnerability: Necrotic)',
        extraPoints: 1,
        customText: 'Vulnerability: Necrotic damage'
      }
    ]
  }
];
