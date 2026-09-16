import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_SKILLS } from '../src/data/skills.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_BUFFS } from '../src/data/buffs.mjs';
import { DCC_MACROS } from '../src/data/macros.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let ClassicLevel;
const foundryModulePath = '/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level';
if (fs.existsSync(foundryModulePath)) {
  const mod = await import(foundryModulePath + '/index.js');
  ClassicLevel = mod.ClassicLevel || mod.default?.ClassicLevel || mod.default;
} else {
  try {
    const mod = await import('classic-level');
    ClassicLevel = mod.ClassicLevel;
  } catch (err) {
    console.error('Could not find classic-level module');
    process.exit(1);
  }
}

// 1. Build Skills Pack
async function buildSkills() {
  const packDir = path.resolve(__dirname, '../packs/skills');
  if (fs.existsSync(packDir)) {
    fs.rmSync(packDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packDir, { recursive: true });

  const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  await db.open();

  console.log(`Building skills compendium with ${DCC_SKILLS.length} items...`);
  const batch = db.batch();

  for (const skill of DCC_SKILLS) {
    const doc = {
      _id: skill._id,
      name: skill.name,
      type: "skill",
      img: skill.img,
      system: {
        rank: skill.system.rank ?? 0,
        stat: skill.system.stat,
        skillType: skill.system.skillType || skill.system.type || "Utility",
        type: skill.system.type || skill.system.skillType || "Utility",
        typeBonus: 0,
        checkType: skill.system.checkType,
        category: skill.system.category || "Utility",
        notes: skill.system.notes,
        upgrades: skill.system.upgrades || "",
        checked: false
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0
      },
      flags: {},
      _stats: {
        systemId: "carl-rpg",
        systemVersion: "1.0.0",
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!items!${skill._id}`, doc);
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built skills compendium at ${packDir}`);
}

// 2. Build Spells Pack
async function buildSpells() {
  const packDir = path.resolve(__dirname, '../packs/spells');
  if (fs.existsSync(packDir)) {
    fs.rmSync(packDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packDir, { recursive: true });

  const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  await db.open();

  console.log(`Building spells compendium with ${DCC_SPELLS.length} items...`);
  const batch = db.batch();

  for (const spell of DCC_SPELLS) {
    const doc = {
      _id: spell._id,
      name: spell.name,
      type: "spell",
      img: spell.img,
      system: {
        rank: spell.system.rank ?? 1,
        stat: spell.system.stat || "int",
        manaCost: spell.system.manaCost ?? 0,
        range: spell.system.range || "Self",
        duration: spell.system.duration || "Instantaneous",
        cooldown: spell.system.cooldown || "None",
        spellType: spell.system.spellType || "Attack",
        damageType: spell.system.damageType || "",
        baseDamage: spell.system.baseDamage || "",
        aiFavor: spell.system.aiFavor ?? 0,
        favored: spell.system.favored || "",
        limitations: spell.system.limitations || "",
        quote: spell.system.quote || "",
        description: spell.system.description || "",
        upgrades: {
          rank5: spell.system.upgrades?.rank5 || "",
          rank10: spell.system.upgrades?.rank10 || "",
          rank15: spell.system.upgrades?.rank15 || ""
        }
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0
      },
      flags: {},
      _stats: {
        systemId: "carl-rpg",
        systemVersion: "1.0.0",
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!items!${spell._id}`, doc);
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built spells compendium at ${packDir}`);
}

// 3. Build Buffs Pack
async function buildBuffs() {
  const packDir = path.resolve(__dirname, '../packs/buffs');
  if (fs.existsSync(packDir)) {
    fs.rmSync(packDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packDir, { recursive: true });

  const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  await db.open();

  console.log(`Building buffs compendium with ${DCC_BUFFS.length} items...`);
  const batch = db.batch();

  for (const buff of DCC_BUFFS) {
    const doc = {
      _id: buff._id,
      name: buff.name,
      type: "buff",
      img: buff.img,
      system: {
        buffType: buff.system.buffType || "stat",
        stat: buff.system.stat || "",
        value: buff.system.value ?? 0,
        damageType: buff.system.damageType || "",
        duration: buff.system.duration || "1 Hour",
        description: buff.system.description || ""
      },
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0
      },
      flags: {},
      _stats: {
        systemId: "carl-rpg",
        systemVersion: "1.0.0",
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!items!${buff._id}`, doc);
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built buffs compendium at ${packDir}`);
}

// 4. Build Macros Pack
async function buildMacros() {
  const packDir = path.resolve(__dirname, '../packs/macros');
  if (fs.existsSync(packDir)) {
    fs.rmSync(packDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packDir, { recursive: true });

  const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  await db.open();

  console.log(`Building macros compendium with ${DCC_MACROS.length} items...`);
  const batch = db.batch();

  for (const macro of DCC_MACROS) {
    const doc = {
      _id: macro._id,
      name: macro.name,
      type: macro.type,
      img: macro.img,
      command: macro.command,
      scope: macro.scope || "global",
      folder: null,
      sort: 0,
      ownership: {
        default: 2
      },
      flags: macro.flags || {},
      _stats: {
        systemId: "carl-rpg",
        systemVersion: "1.0.25",
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!macros!${macro._id}`, doc);
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built macros compendium at ${packDir}`);
}

await buildSkills();
await buildSpells();
await buildBuffs();
await buildMacros();
