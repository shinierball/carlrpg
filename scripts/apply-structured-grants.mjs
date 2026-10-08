import fs from 'node:fs';
import path from 'node:path';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCC_RACES } from '../src/data/races.mjs';

function slug(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildGrantsForEntity(item, isRace = false) {
  const grants = [];
  const sys = item.system || {};

  // 1. Stats
  const stats = sys.stats || {};
  const hasStats = Object.values(stats).some(v => v !== 0);
  if (hasStats) {
    grants.push({
      kind: 'stat',
      stats: {
        str: Number(stats.str) || 0,
        dex: Number(stats.dex) || 0,
        con: Number(stats.con) || 0,
        int: Number(stats.int) || 0,
        cha: Number(stats.cha) || 0
      }
    });
  }

  // 2. Size (for races)
  if (isRace && sys.size) {
    grants.push({
      kind: 'size',
      size: sys.size
    });
  }

  // 3. DR Bonus
  if (sys.drBonus && sys.drBonus > 0) {
    grants.push({
      kind: 'dr',
      value: sys.drBonus
    });
  }

  // 4. Movement
  const move = sys.movement || {};
  const hasMove = Object.values(move).some(v => v !== 0);
  if (hasMove) {
    grants.push({
      kind: 'movement',
      movement: {
        walkDelta: Number(move.walkDelta) || 0,
        climb: Number(move.climb) || 0,
        swim: Number(move.swim) || 0,
        fly: Number(move.fly) || 0,
        burrow: Number(move.burrow) || 0
      }
    });
  }

  // 5. Fixed Skills
  const skills = Array.isArray(sys.skills) ? sys.skills : [];
  for (const s of skills) {
    if (s.name && !s.name.includes('(Choice)')) {
      grants.push({
        kind: 'skill',
        mode: 'fixed',
        name: s.name,
        rank: Number(s.rank) || 1,
        ref: `id.skill.${slug(s.name)}`
      });
    }
  }

  // 6. Fixed Spells (clean out OCR artifacts)
  const spells = Array.isArray(sys.spells) ? sys.spells : [];
  for (const sp of spells) {
    if (sp.name && !sp.name.includes('(Choice)')) {
      // Skip OCR artifacts from Boring Ol' Mage
      if (item.name === "Boring Ol’ Mage" || item.name === "Boring Ol' Mage") {
        continue;
      }
      grants.push({
        kind: 'spell',
        mode: 'fixed',
        name: sp.name,
        rank: Number(sp.rank) || 1,
        ref: `id.spell.${slug(sp.name)}`
      });
    }
  }

  // 7. Special structured grants per canonical class / race
  const name = item.name.trim();

  if (name === "Boring Ol’ Mage" || name === "Boring Ol' Mage") {
    grants.push(
      { kind: 'spell', mode: 'choice', count: 1, rank: 3, filter: { all: ['kind.spell', 'element.fire'] }, label: '1 Fire Spell' },
      { kind: 'spell', mode: 'choice', count: 1, rank: 2, filter: { all: ['kind.spell', 'element.force'] }, label: '1 Force Spell' },
      { kind: 'spell', mode: 'choice', count: 1, rank: 2, filter: { all: ['kind.spell', 'element.sonic'] }, label: '1 Sonic Spell' },
      { kind: 'spell', mode: 'choice', count: 2, rank: 2, distinct: true, filter: { all: ['kind.spell', 'action.passive'] }, label: '2 Different Passive Spells' },
      { kind: 'skillModifier', filter: { all: ['kind.skill', 'stat.dex'] }, rankDelta: -3, floor: 1, onlyIfOwned: true },
      { kind: 'skillModifier', filter: { all: ['kind.skill', 'stat.str'] }, rankDelta: -3, floor: 1, onlyIfOwned: true }
    );
  } else if (name === "Boring Ol’ Barbarian" || name === "Boring Ol' Barbarian") {
    grants.push({
      kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'weapon',
      filter: { any: ['skillGroup.combat', 'kind.weapon'] }, label: 'Weapon Skill (Rank 3)'
    });
  } else if (name === "Boring Ol’ Fighter" || name === "Boring Ol' Fighter") {
    const combatOptions = [
      'Aiming', 'Bludgeoning Weapon', 'Bow', 'Catcher', 'Crossbow', 'Dirty Fighting', 'Dodge',
      'Edged Weapon', 'Exotic Ranged Weapon', 'Firearms', 'Flail Weapon', 'Heavy Armor', 'Light Armor',
      'Medium Armor', 'Mounted Combat', 'Polearm Weapon', 'Power Attack', 'Pugilism', 'Quick Draw',
      'Reach Weapon', 'Shield Block', 'Slings', 'Small Blades', 'Thrown Weapon', 'Whips', 'Wrasslin'
    ];
    grants.push(
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 5, category: 'weapon',
        filter: { any: ['skillGroup.combat', 'kind.weapon'] }, label: 'Weapon Skill (Rank 5)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 2, category: 'options',
        options: combatOptions, label: 'Combat Skill Choice 1 (Rank 2)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 2, category: 'options',
        options: combatOptions, label: 'Combat Skill Choice 2 (Rank 2)'
      }
    );
  } else if (name === "Boring Ol’ Arcanist" || name === "Boring Ol' Arcanist") {
    grants.push(
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 2, category: 'crafting',
        filter: { all: ['kind.skill', 'skillGroup.crafting'] }, label: 'Crafting Skill 1 (Rank 2)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 1, category: 'crafting',
        filter: { all: ['kind.skill', 'skillGroup.crafting'] }, label: 'Crafting Skill 2 (Rank 1)'
      }
    );
  } else if (name === "Boring Ol’ Paladin" || name === "Boring Ol' Paladin") {
    grants.push(
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'weapon',
        filter: { any: ['skillGroup.combat', 'kind.weapon'] }, label: 'Weapon Skill (Rank 3)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 2, category: 'options',
        options: ['Catcher', 'Shield Block'], label: 'Catcher or Shield Block (Rank 2)'
      }
    );
  } else if (name === "Swashbuckler") {
    grants.push({
      kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'options',
      options: ['Rapier', 'Longsword'], label: 'Rapier or Longsword (Rank 3)'
    });
  } else if (name === "Dwarf, Classic" || name === "Classic Dwarf") {
    grants.push(
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'crafting',
        filter: { all: ['kind.skill', 'skillGroup.crafting'] }, label: 'Crafting Skill 1 (Rank 3)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'crafting',
        filter: { all: ['kind.skill', 'skillGroup.crafting'] }, label: 'Crafting Skill 2 (Rank 3)'
      }
    );
  } else if (name === "Igneous") {
    grants.push(
      {
        kind: 'spell', mode: 'choice', count: 1, rank: 2, category: 'spell',
        filter: { all: ['kind.spell'] }, label: 'Spell 1 (Rank 2)'
      },
      {
        kind: 'spell', mode: 'choice', count: 1, rank: 2, category: 'spell',
        filter: { all: ['kind.spell'] }, label: 'Spell 2 (Rank 2)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'weapon',
        filter: { any: ['skillGroup.combat', 'kind.weapon'] }, label: 'Weapon Skill (Rank 3)'
      }
    );
  } else if (name === "Grulke") {
    grants.push(
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 3, category: 'options',
        options: ['Jumping', 'Light on Your Feet'], label: 'Jumping or Light on Your Feet (Rank 3)'
      },
      {
        kind: 'skill', mode: 'choice', count: 1, rank: 2, category: 'reach_weapon',
        filter: { any: ['weapon.spear', 'weapon.polearm'] }, label: 'Reach Weapon Skill (Rank 2)'
      }
    );
  } else {
    // Check if any other perk defines choice patterns
    const perks = Array.isArray(sys.perks) ? sys.perks : [];
    for (const p of perks) {
      const craftM = p.match(/\+(\d+)\s+in\s+(?:(two|three|\d+)\s+different\s+crafting\s+Skills?|a\s+crafting\s+Skill)\s+of\s+your\s+choice/i);
      if (craftM) {
        const rank = parseInt(craftM[1], 10);
        const count = (craftM[2] === 'two' || craftM[2] === '2') ? 2 : (craftM[2] === 'three' || craftM[2] === '3') ? 3 : 1;
        for (let i = 0; i < count; i++) {
          grants.push({
            kind: 'skill', mode: 'choice', count: 1, rank, category: 'crafting',
            filter: { all: ['kind.skill', 'skillGroup.crafting'] }, label: `Crafting Skill ${i + 1} (Rank ${rank})`
          });
        }
        continue;
      }
      const spellM = p.match(/\+(\d+)\s+in\s+(?:(two|three|\d+)\s+Spells?|a\s+Spell)\s+of\s+your\s+choice/i);
      if (spellM) {
        const rank = parseInt(spellM[1], 10);
        const count = (spellM[2] === 'two' || spellM[2] === '2') ? 2 : (spellM[2] === 'three' || spellM[2] === '3') ? 3 : 1;
        for (let i = 0; i < count; i++) {
          grants.push({
            kind: 'spell', mode: 'choice', count: 1, rank, category: 'spell',
            filter: { all: ['kind.spell'] }, label: `Spell ${i + 1} (Rank ${rank})`
          });
        }
        continue;
      }
      const edgedM = p.match(/\+(\d+)\s+in\s+(?:an|one)\s+Edged\s+weapon\s+Skill\s+of\s+your\s+choice/i);
      if (edgedM) {
        const rank = parseInt(edgedM[1], 10);
        grants.push({
          kind: 'skill', mode: 'choice', count: 1, rank, category: 'edged_weapon',
          filter: { any: ['weapon.sword', 'weapon.dagger', 'weapon.blade'] }, label: `Edged Weapon Skill (Rank ${rank})`
        });
        continue;
      }
      const weaponM = p.match(/\+(\d+)\s+(?:in|to)\s+(?:(two|three|\d+)|one|a)\s+(?:different\s+)?Weapon\s+Skills?\s+of\s+your\s+choice/i);
      if (weaponM) {
        const rank = parseInt(weaponM[1], 10);
        const count = (weaponM[2] === 'two' || weaponM[2] === '2') ? 2 : 1;
        for (let i = 0; i < count; i++) {
          grants.push({
            kind: 'skill', mode: 'choice', count: 1, rank, category: 'weapon',
            filter: { any: ['skillGroup.combat', 'kind.weapon'] }, label: `Weapon Skill ${i + 1} (Rank ${rank})`
          });
        }
        continue;
      }
    }
  }

  // 8. Perks
  for (const perk of sys.perks || []) {
    grants.push({
      kind: 'perk',
      name: perk
    });
  }

  return grants;
}

// Update Classes
for (const cls of DCC_CLASSES) {
  cls.system.grants = buildGrantsForEntity(cls, false);
  if (cls.name === "Boring Ol’ Mage" || cls.name === "Boring Ol' Mage") {
    cls.system.spells = []; // Clear broken OCR spells
  }
}

// Update Races
for (const race of DCC_RACES) {
  race.system.grants = buildGrantsForEntity(race, true);
}

// Write updated files
fs.writeFileSync(
  path.resolve('src/data/classes.mjs'),
  `/**\n * Dungeon Crawler Carl RPG - Official Classes Dataset\n * Extracted from Chapter 3: Character Creation (pp. 144-165).\n */\n\nexport const DCC_CLASSES = ${JSON.stringify(DCC_CLASSES, null, 2)};\n`
);

fs.writeFileSync(
  path.resolve('src/data/races.mjs'),
  `/**\n * Dungeon Crawler Carl RPG - Official Races Dataset\n * Extracted from Chapter 3: Character Creation (pp. 128-144).\n */\n\nexport const DCC_RACES = ${JSON.stringify(DCC_RACES, null, 2)};\n`
);

console.log(`Updated ${DCC_CLASSES.length} classes and ${DCC_RACES.length} races with system.grants!`);
