import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_SKILLS } from '../src/data/skills.mjs';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_BUFFS, DCC_DEBUFFS } from '../src/data/buffs.mjs';
import { DCC_MACROS } from '../src/data/macros.mjs';
import { DCC_MOBS } from '../src/data/mobs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const systemJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../system.json'), 'utf8'));
const systemVersion = systemJson.version || '2.0.26';

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
        systemVersion,
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
        systemVersion,
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

  console.log(`Building buffs & debuffs compendium with ${DCC_BUFFS.length} buffs and ${DCC_DEBUFFS.length} debuffs...`);
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
        systemVersion,
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!items!${buff._id}`, doc);
  }

  for (const debuff of DCC_DEBUFFS) {
    const doc = {
      _id: debuff._id,
      name: debuff.name,
      type: "debuff",
      img: debuff.img,
      system: {
        severity: debuff.system?.severity || debuff.severity || "Minor",
        damageType: debuff.system?.damageType || "",
        reductionPercent: debuff.system?.reductionPercent ?? 0,
        rounding: debuff.system?.rounding || "up",
        statModifiers: debuff.system?.statModifiers || [],
        damageModifiers: debuff.system?.damageModifiers || [],
        duration: debuff.system?.duration || "Combat",
        description: debuff.system?.description || debuff.description || ""
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
        systemVersion,
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!items!${debuff._id}`, doc);
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built buffs & debuffs compendium at ${packDir}`);
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
        systemVersion,
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

// 5. Build Mobs Pack
async function buildMobs() {
  const packDir = path.resolve(__dirname, '../packs/mobs');
  if (fs.existsSync(packDir)) {
    fs.rmSync(packDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packDir, { recursive: true });

  const db = new ClassicLevel(packDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  await db.open();

  console.log(`Building mobs compendium with ${DCC_MOBS.length} actors...`);
  const batch = db.batch();

  for (const mob of DCC_MOBS) {
    const doc = {
      _id: mob._id,
      name: mob.name,
      type: "mob",
      img: mob.img || "icons/svg/skull.svg",
      system: {
        abilities: {
          str: { value: mob.system.abilities.str.value, unenhanced: mob.system.abilities.str.unenhanced ?? mob.system.abilities.str.value, mod: mob.system.abilities.str.mod },
          int: { value: mob.system.abilities.int.value, unenhanced: mob.system.abilities.int.unenhanced ?? mob.system.abilities.int.value, mod: mob.system.abilities.int.mod },
          con: { value: mob.system.abilities.con.value, unenhanced: mob.system.abilities.con.unenhanced ?? mob.system.abilities.con.value, mod: mob.system.abilities.con.mod },
          dex: { value: mob.system.abilities.dex.value, unenhanced: mob.system.abilities.dex.unenhanced ?? mob.system.abilities.dex.value, mod: mob.system.abilities.dex.mod },
          cha: { value: mob.system.abilities.cha.value, unenhanced: mob.system.abilities.cha.unenhanced ?? mob.system.abilities.cha.value, mod: mob.system.abilities.cha.mod }
        },
        attributes: {
          hp: {
            value: mob.system.attributes.hp.value,
            max: mob.system.attributes.hp.max,
            temp: 0,
            pct: 100,
            bars: mob.system.attributes.hp.bars,
            hpPerBar: mob.system.attributes.hp.hpPerBar
          },
          mana: {
            value: mob.system.attributes.mana?.value ?? 0,
            max: mob.system.attributes.mana?.max ?? 0,
            pct: 100
          },
          evade: {
            items: 0,
            buffs: 0,
            total: mob.system.attributes.evade?.total ?? 0
          },
          dr: {
            armor: mob.system.attributes.dr?.armor ?? 0,
            items: 0,
            buffs: 0,
            total: mob.system.attributes.dr?.total ?? (mob.system.attributes.dr?.armor ?? 0)
          },
          speed: {
            move: mob.system.attributes.speed?.move ?? 20,
            step: mob.system.attributes.speed?.step ?? 10
          },
          aiFavor: 0,
          size: mob.system.attributes.size || "Medium",
          debuffs: "",
          externalBuffs: { buff1: "", buff2: "", buff3: "" },
          treasure: mob.system.attributes.treasure || "",
          xp: mob.system.attributes.xp ?? 0,
          surpriseDifficulty: mob.system.attributes.surpriseDifficulty || "",
          evadeDifficulty: mob.system.attributes.evadeDifficulty || ""
        },
        details: {
          level: mob.system.details.level || 1,
          classification: mob.system.details.classification || "Mob",
          creatureType: mob.system.details.creatureType || "",
          floor: mob.system.details.floor || "",
          location: mob.system.details.location || "",
          description: mob.system.details.description || "",
          aiDescription: mob.system.details.aiDescription || "",
          notes: mob.system.details.notes || "",
          special: mob.system.details.special || "",
          source: mob.system.details.source || ""
        }
      },
      items: (mob.items || []).map(i => i._id),
      effects: [],
      folder: null,
      sort: 0,
      ownership: {
        default: 0
      },
      flags: {},
      prototypeToken: {
        name: mob.name,
        actorLink: false,
        disposition: -1,
        displayName: 20,
        displayBars: 40,
        bar1: { attribute: "attributes.hp" },
        texture: {
          src: mob.img || "icons/svg/skull.svg"
        },
        width: mob.tokenWidth || (mob.system.attributes.size === 'Huge' ? 3 : mob.system.attributes.size === 'Large' ? 2 : 1),
        height: mob.tokenHeight || (mob.system.attributes.size === 'Huge' ? 3 : mob.system.attributes.size === 'Large' ? 2 : 1)
      },
      _stats: {
        systemId: "carl-rpg",
        systemVersion,
        coreVersion: "12.331",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: "dccRPG0000000001"
      }
    };

    batch.put(`!actors!${mob._id}`, doc);

    // Write each embedded item into the actors.items sublevel
    for (const item of (mob.items || [])) {
      const itemDoc = {
        _id: item._id,
        name: item.name,
        type: item.type,
        img: item.img || (item.type === 'spell' ? 'icons/svg/wand.svg' : item.type === 'loot' ? 'icons/svg/chest.svg' : 'icons/svg/sword.svg'),
        system: item.system || {},
        effects: item.effects || [],
        folder: null,
        sort: 0,
        ownership: {
          default: 0
        },
        flags: item.flags || {},
        _stats: {
          systemId: "carl-rpg",
          systemVersion,
          coreVersion: "12.331",
          createdTime: Date.now(),
          modifiedTime: Date.now(),
          lastModifiedBy: "dccRPG0000000001"
        }
      };

      batch.put(`!actors.items!${mob._id}.${item._id}`, itemDoc);
    }
  }

  await batch.write();
  await db.close();
  console.log(`Successfully built mobs compendium at ${packDir}`);
}

await buildSkills();
await buildSpells();
await buildBuffs();
await buildMacros();
await buildMobs();
