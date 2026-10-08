import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_SPELLS } from '../src/data/spells.mjs';
import { DCC_SKILLS } from '../src/data/skills.mjs';
import { hydrateRankBreaks } from '../src/data/rank-dice.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function migrateSpells() {
  const filePath = path.resolve(__dirname, '../src/data/spells.mjs');
  const updatedSpells = DCC_SPELLS.map(spell => {
    const rb = hydrateRankBreaks(spell.system.rankBreaks, spell.system.upgrades);
    return {
      ...spell,
      system: {
        ...spell.system,
        rankBreaks: rb
      }
    };
  });

  const content = `/**\n * Dungeon Crawler Carl RPG - Official Spells Dataset\n * Derived from the official DCC Spells Overview & Cheat Sheet.\n */\n\nexport const DCC_SPELLS = ${JSON.stringify(updatedSpells, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully migrated ${updatedSpells.length} spells to ${filePath}`);
}

export function migrateSkills() {
  const filePath = path.resolve(__dirname, '../src/data/skills.mjs');
  const updatedSkills = DCC_SKILLS.map(skill => {
    const rb = hydrateRankBreaks(skill.system.rankBreaks, skill.system.upgrades);
    return {
      ...skill,
      system: {
        ...skill.system,
        rankBreaks: rb
      }
    };
  });

  const content = `/**\n * Dungeon Crawler Carl RPG - Official Skills Dataset\n * Derived from the official DCC Combat & Exploration Action Quick Sheets and skills.txt.\n */\n\nexport const DCC_SKILLS = ${JSON.stringify(updatedSkills, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully migrated ${updatedSkills.length} skills to ${filePath}`);
}

migrateSpells();
migrateSkills();
