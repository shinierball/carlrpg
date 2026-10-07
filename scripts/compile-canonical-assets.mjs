/**
 * Compile Canonical Assets Preprocessor
 * Ingests canonical DCC_RACES and DCC_CLASSES and persists their structured
 * stats, drBonus, movement, skills, and spells directly into static assets.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_RACES } from '../src/data/races.mjs';
import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCCRaceClassApplier } from '../src/data/race-class-applier.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function compileRaces() {
  for (const r of DCC_RACES) {
    const stats = DCCRaceClassApplier.parseStats(r);
    const dr = DCCRaceClassApplier.parseDR(r);
    const move = DCCRaceClassApplier.parseMovement(r);
    const { skills, spells } = DCCRaceClassApplier.parseSkillsAndSpells(r);
    r.system.stats = stats;
    r.system.drBonus = dr;
    r.system.movement = move;
    r.system.skills = skills;
    r.system.spells = spells;
  }
  const racesFile = path.join(rootDir, 'src/data/races.mjs');
  const content = `export const DCC_RACES = ${JSON.stringify(DCC_RACES, null, 2)};\n`;
  await fs.writeFile(racesFile, content, 'utf8');
  console.log(`Compiled ${DCC_RACES.length} canonical races with structured data.`);
}

async function compileClasses() {
  for (const c of DCC_CLASSES) {
    const stats = DCCRaceClassApplier.parseStats(c);
    const dr = DCCRaceClassApplier.parseDR(c);
    const move = DCCRaceClassApplier.parseMovement(c);
    const { skills, spells } = DCCRaceClassApplier.parseSkillsAndSpells(c);
    c.system.stats = stats;
    c.system.drBonus = dr;
    c.system.movement = move;
    c.system.skills = skills;
    c.system.spells = spells;
  }
  const classesFile = path.join(rootDir, 'src/data/classes.mjs');
  const content = `export const DCC_CLASSES = ${JSON.stringify(DCC_CLASSES, null, 2)};\n`;
  await fs.writeFile(classesFile, content, 'utf8');
  console.log(`Compiled ${DCC_CLASSES.length} canonical classes with structured data.`);
}

async function main() {
  await compileRaces();
  await compileClasses();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
