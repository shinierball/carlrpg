import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text.toLowerCase()
    .replace(/['’!\?]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// -----------------------------------------------------------------------------
// 1. Tag Spells
// -----------------------------------------------------------------------------
async function tagSpells() {
  const filePath = path.resolve(__dirname, '../src/data/spells.mjs');
  const mod = await import(filePath);
  const spells = mod.DCC_SPELLS;

  const SPELL_TAGS_MAP = {
    'air-buddy': ['kind.spell', 'action.passive', 'stat.int', 'favored.mage'],
    'astral-paw': ['kind.spell', 'action.passive', 'stat.int'],
    'bad-faith': ['kind.spell', 'action.attack', 'element.necrotic', 'stat.cha', 'favored.cleric'],
    'bang-bro': ['kind.spell', 'action.passive', 'stat.int'],
    'clockwork-triplicate': ['kind.spell', 'action.passive', 'stat.int'],
    'confusing-fog': ['kind.spell', 'action.passive', 'stat.int'],
    'dirt-clod': ['kind.spell', 'action.attack', 'element.bludgeoning', 'stat.int'],
    'drain-life': ['kind.spell', 'action.attack', 'element.necrotic', 'stat.int'],
    'earworm': ['kind.spell', 'action.attack', 'element.sonic', 'stat.cha', 'favored.bard'],
    'fear': ['kind.spell', 'action.attack', 'rule.mind-control', 'stat.int'],
    'fire-fingers': ['kind.spell', 'action.attack', 'element.fire', 'stat.int'],
    'fireball': ['kind.spell', 'action.attack', 'element.fire', 'shape.aoe', 'stat.int'],
    'frost-scar': ['kind.spell', 'action.attack', 'element.ice', 'stat.int'],
    'grand-illusion': ['kind.spell', 'action.passive', 'stat.int'],
    'heal': ['kind.spell', 'action.passive', 'action.interrupt', 'action.heal', 'stat.int'],
    'heal-critter': ['kind.spell', 'action.passive', 'action.interrupt', 'action.heal', 'stat.int'],
    'heal-others': ['kind.spell', 'action.passive', 'action.interrupt', 'action.heal', 'stat.int'],
    'heal-self': ['kind.spell', 'action.passive', 'action.interrupt', 'action.heal', 'stat.int'],
    'hole': ['kind.spell', 'action.passive', 'stat.int'],
    'holy-aura': ['kind.spell', 'action.attack', 'element.holy', 'shape.aoe', 'stat.cha', 'favored.cleric', 'favored.paladin'],
    'hot-stuff-aura': ['kind.spell', 'action.passive', 'shape.aoe', 'stat.int', 'favored.bard'],
    'ice-blast': ['kind.spell', 'action.attack', 'element.ice', 'stat.int'],
    'icicles': ['kind.spell', 'action.attack', 'element.ice', 'stat.int'],
    'intimate-touches': ['kind.spell', 'action.passive', 'action.heal', 'stat.int', 'favored.cleric', 'favored.paladin'],
    'lightning-bolt': ['kind.spell', 'action.attack', 'element.electric', 'stat.int'],
    'magic-missile': ['kind.spell', 'action.attack', 'element.force', 'stat.int'],
    'mind-tickle': ['kind.spell', 'action.attack', 'element.psychic', 'stat.cha', 'favored.cleric'],
    'minion-army': ['kind.spell', 'action.passive', 'shape.aoe', 'rule.mind-control', 'stat.int'],
    'natures-breath': ['kind.spell', 'action.passive', 'action.interrupt', 'action.heal', 'stat.int', 'favored.druid'],
    'oakhide': ['kind.spell', 'action.passive', 'stat.int', 'favored.druid'],
    'paladins-smite': ['kind.spell', 'action.attack', 'element.holy', 'stat.cha', 'favored.paladin'],
    'panty-dropper': ['kind.spell', 'action.passive', 'rule.mind-control', 'stat.cha', 'favored.bard'],
    'ping': ['kind.spell', 'action.passive', 'shape.aoe', 'stat.int'],
    'protective-shell': ['kind.spell', 'action.passive', 'action.interrupt', 'shape.aoe', 'stat.int'],
    'puddle-jumper': ['kind.spell', 'action.passive', 'stat.int'],
    'rise-dead-minion': ['kind.spell', 'action.attack', 'stat.int', 'favored.necromancer'],
    'rootfoot': ['kind.spell', 'action.attack', 'stat.int', 'favored.druid'],
    'second-chance': ['kind.spell', 'action.passive', 'stat.int'],
    'shield': ['kind.spell', 'action.passive', 'action.interrupt', 'stat.int'],
    'shock-treatment': ['kind.spell', 'action.attack', 'element.electric', 'stat.int'],
    'solsplash': ['kind.spell', 'action.attack', 'element.fire', 'stat.con', 'favored.druid'],
    'soul-collector': ['kind.spell', 'action.attack', 'element.necrotic', 'stat.int'],
    'thunderlash': ['kind.spell', 'action.attack', 'element.sonic', 'stat.int'],
    'torch': ['kind.spell', 'action.passive', 'stat.int'],
    'tripper': ['kind.spell', 'action.passive', 'shape.aoe', 'stat.int'],
    'turn-undead': ['kind.spell', 'action.attack', 'shape.aoe', 'stat.int', 'favored.bard', 'favored.cleric', 'favored.paladin'],
    'twinkle-toes': ['kind.spell', 'action.passive', 'stat.int'],
    'unnecessary-force': ['kind.spell', 'action.attack', 'element.force', 'stat.int'],
    'vine-porn': ['kind.spell', 'action.attack', 'element.piercing', 'stat.con', 'favored.druid'],
    'wall-of-fire': ['kind.spell', 'action.passive', 'element.fire', 'stat.int'],
    'water-breathing': ['kind.spell', 'action.passive', 'stat.int'],
    'web': ['kind.spell', 'action.attack', 'stat.int'],
    'wilburs-slow-build-fireblast': ['kind.spell', 'action.attack', 'element.fire', 'stat.int'],
    'wisp-armor': ['kind.spell', 'action.passive', 'stat.int']
  };

  for (const spell of spells) {
    const slug = slugify(spell.name);
    spell.system.identifier = slug;
    spell.system.tags = SPELL_TAGS_MAP[slug] || ['kind.spell', 'stat.int'];
  }

  const out = `/**\n * Dungeon Crawler Carl RPG - Official Spells Dataset\n * Derived from the official DCC Spells Overview & Cheat Sheet.\n */\n\nexport const DCC_SPELLS = ${JSON.stringify(spells, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Tagged ${spells.length} spells.`);
}

// -----------------------------------------------------------------------------
// 2. Tag Skills
// -----------------------------------------------------------------------------
async function tagSkills() {
  const filePath = path.resolve(__dirname, '../src/data/skills.mjs');
  const mod = await import(filePath);
  const skills = mod.DCC_SKILLS;

  const WEAPON_MAP = {
    'Axe': 'weapon.axe',
    'Bow': 'weapon.bow',
    'Club': 'weapon.club',
    'Crossbow': 'weapon.crossbow',
    'Dagger': 'weapon.dagger',
    'Handgun': 'weapon.handgun',
    'Herding Weapons': 'weapon.herding_weapon',
    'Improvised Weapons': 'weapon.improvised',
    'Javelin': 'weapon.javelin',
    'Lance': 'weapon.lance',
    'Longsword': 'weapon.longsword',
    'Polearm': 'weapon.polearm',
    'Quarterstaff': 'weapon.quarterstaff',
    'Rapier': 'weapon.rapier',
    'Shotgun': 'weapon.shotgun',
    'Shuriken': 'weapon.shuriken',
    'Slingshot': 'weapon.slingshot',
    'Warhammer': 'weapon.warhammer'
  };

  const TECHNIQUE_MAP = {
    'Choke Out': { tags: ['technique.wrasslin'], appliesTo: ['Wrasslin'] },
    'Dirty Fighting': { tags: ['technique.pugilism', 'technique.wrasslin'], appliesTo: ['Pugilism', 'Wrasslin'] },
    'Iron Punch': { tags: ['technique.pugilism'], appliesTo: ['Pugilism'] },
    'Powerful Strike': { tags: ['technique.foot_soldier', 'technique.noggin_nocker', 'technique.pugilism'], appliesTo: ['Foot Soldier', 'Noggin Nocker', 'Pugilism'] },
    'Skullcracker': { tags: ['technique.noggin_nocker'], appliesTo: ['Noggin Nocker'] },
    'Smush': { tags: ['technique.foot_soldier'], appliesTo: ['Foot Soldier'] },
    'Toss': { tags: ['technique.wrasslin'], appliesTo: ['Wrasslin'] }
  };

  const INTERRUPTS = ['Attack of Opportunity', 'Catcher', 'Shield Block', 'Taunt', 'Zone of Control'];

  for (const skill of skills) {
    const slug = slugify(skill.name);
    skill.system.identifier = slug;

    const tags = ['kind.skill'];

    // Governing Stat
    const stat = (skill.system.stat || 'str').toLowerCase();
    tags.push(`stat.${stat}`);

    // Skill Group / Category
    const cat = skill.system.category;
    if (cat === 'Combat') tags.push('skillGroup.combat');
    else if (cat === 'Crafting') tags.push('skillGroup.crafting');
    else if (cat === 'Knowledge') tags.push('skillGroup.knowledge');
    else if (cat === 'Social') tags.push('skillGroup.social');
    else if (cat === 'Survival') tags.push('skillGroup.survival');
    else tags.push('skillGroup.utility');

    // Attack Skills
    if (skill.system.isAttack) {
      tags.push('action.attack');
      if (['Bite', 'Back Claw', 'Slice Attack'].includes(skill.name)) {
        tags.push('weaponClass.natural');
      } else if (['Foot Soldier', 'Noggin Nocker', 'Pugilism', 'Unarmed Combat', 'Wrasslin'].includes(skill.name)) {
        tags.push('weaponClass.unarmed');
      } else if (['Bow', 'Crossbow', 'Handgun', 'Javelin', 'Shotgun', 'Shuriken', 'Slingshot'].includes(skill.name)) {
        tags.push('weaponClass.ranged');
      } else {
        tags.push('weaponClass.melee');
      }

      if (WEAPON_MAP[skill.name]) {
        tags.push(WEAPON_MAP[skill.name]);
      }

      const dmgType = skill.system.damageType?.toLowerCase();
      if (dmgType === 'bludgeoning') tags.push('element.bludgeoning');
      else if (dmgType === 'piercing') tags.push('element.piercing');
      else if (dmgType === 'slashing') tags.push('element.slashing');

      if (skill.name === 'Unarmed Combat') {
        tags.push('rule.no-damage-effects');
      }
    }

    // Techniques
    if (skill.system.isTechnique && TECHNIQUE_MAP[skill.name]) {
      tags.push('action.passive');
      tags.push(...TECHNIQUE_MAP[skill.name].tags);
      skill.system.appliesTo = TECHNIQUE_MAP[skill.name].appliesTo;
    }

    // Interrupts
    if (INTERRUPTS.includes(skill.name)) {
      tags.push('action.interrupt');
    }

    // Passives
    if (skill.system.category === 'Passive' || (skill.system.skillType && skill.system.skillType.includes('Passive'))) {
      if (!tags.includes('action.passive')) tags.push('action.passive');
    }

    skill.system.tags = Array.from(new Set(tags)).sort();
  }

  const out = `/**\n * Dungeon Crawler Carl RPG - Official Skills Dataset\n * Derived from the official DCC Combat & Exploration Action Quick Sheets and skills.txt.\n */\n\nexport const DCC_SKILLS = ${JSON.stringify(skills, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Tagged ${skills.length} skills.`);
}

// -----------------------------------------------------------------------------
// 3. Tag Classes
// -----------------------------------------------------------------------------
async function tagClasses() {
  const filePath = path.resolve(__dirname, '../src/data/classes.mjs');
  const mod = await import(filePath);
  const classes = mod.DCC_CLASSES;

  for (const c of classes) {
    const slug = slugify(c.name);
    c.system.identifier = slug;

    // Fix OCR damage in text
    if (c.system.abilities) {
      c.system.abilities = c.system.abilities
        .replace(/Forc e/g, 'Force')
        .replace(/differ ent/g, 'different')
        .replace(/craft ing/g, 'crafting')
        .replace(/Intimida tion/g, 'Intimidation');
    }
    if (Array.isArray(c.system.perks)) {
      c.system.perks = c.system.perks.map(p =>
        typeof p === 'string'
          ? p.replace(/Forc e/g, 'Force')
             .replace(/differ ent/g, 'different')
             .replace(/craft ing/g, 'crafting')
             .replace(/Intimida tion/g, 'Intimidation')
          : p
      );
    }

    const rawClassType = c.system.classType || 'Fighter';
    const archetypes = rawClassType.split(',').map(s => {
      const arch = slugify(s.trim());
      return `archetype.${arch}`;
    });

    c.system.archetypes = archetypes;
    c.system.tags = Array.from(new Set(['kind.class', ...archetypes])).sort();
  }

  const out = `/**\n * Dungeon Crawler Carl RPG - Official Classes Dataset\n * Extracted from Chapter 3: Character Creation (pp. 144-165).\n */\n\nexport const DCC_CLASSES = ${JSON.stringify(classes, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Tagged ${classes.length} classes.`);
}

// -----------------------------------------------------------------------------
// 4. Tag Races
// -----------------------------------------------------------------------------
async function tagRaces() {
  const filePath = path.resolve(__dirname, '../src/data/races.mjs');
  const mod = await import(filePath);
  const races = mod.DCC_RACES;

  for (const r of races) {
    const slug = slugify(r.name);
    r.system.identifier = slug;

    // Fix OCR damage in text
    if (r.system.abilities) {
      r.system.abilities = r.system.abilities
        .replace(/differ ent/g, 'different')
        .replace(/craft ing/g, 'crafting')
        .replace(/Intimida tion/g, 'Intimidation');
    }
    if (Array.isArray(r.system.perks)) {
      r.system.perks = r.system.perks.map(p =>
        typeof p === 'string'
          ? p.replace(/differ ent/g, 'different')
             .replace(/craft ing/g, 'crafting')
             .replace(/Intimida tion/g, 'Intimidation')
          : p
      );
    }

    r.system.archetypes = [];
    r.system.tags = ['kind.race'];
  }

  const out = `/**\n * Dungeon Crawler Carl RPG - Official Races Dataset\n * Extracted from Chapter 3: Character Creation (pp. 128-144).\n */\n\nexport const DCC_RACES = ${JSON.stringify(races, null, 2)};\n`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Tagged ${races.length} races.`);
}

async function main() {
  await tagSpells();
  await tagSkills();
  await tagClasses();
  await tagRaces();
  console.log('All canonical datasets tagged successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
