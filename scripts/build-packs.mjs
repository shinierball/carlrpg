import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_SKILLS } from '../src/data/skills.mjs';

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
      checkType: skill.system.checkType,
      category: skill.system.category || "Utility",
      notes: skill.system.notes,
      upgrades: "",
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
console.log(`Successfully built compendium at ${packDir}`);
