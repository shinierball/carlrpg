import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');
const REPORT_FILE = '/Users/jeremy/.gemini/antigravity-ide/brain/6632af39-58f6-4af1-afbd-f6ba09ca7ab9/runtime_parsing_audit.md';

function getAllFiles(dir, exts = ['.mjs', '.js']) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const auditCategories = {
  ocrAndTextCleaning: {
    title: '1. OCR / Free-Text Cleaning & Normalization',
    findings: []
  },
  perksAndAbilityParsing: {
    title: '2. Perks & Ability Text Regex Parsing (Stats, Skills, Spells, DR, Movement)',
    findings: []
  },
  fuzzyNameAndSkillMatching: {
    title: '3. Fuzzy String Matching & Heuristic Skill / Weapon / Buff Resolution',
    findings: []
  },
  runtimeRegexInCombat: {
    title: '4. Runtime Regex & Keyword Checking in Combat / Attack / Damage Logic',
    findings: []
  },
  commaSeparatedArrayParsing: {
    title: '5. Comma-Separated / Delimited String Splitting at Runtime',
    findings: []
  }
};

const files = getAllFiles(SRC_DIR);

for (const file of files) {
  const relPath = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. OCR cleaning
    if (trimmed.includes('cleanOCRText') || /replace\(\/.*?\/g,\s*['"].*?['"]\)/.test(trimmed) && (trimmed.includes('replace(/') && (trimmed.includes('Skill') || trimmed.includes('Spell') || trimmed.includes('Earth') || trimmed.includes('Rage')))) {
      auditCategories.ocrAndTextCleaning.findings.push({ file: relPath, line: lineNum, code: trimmed });
    }

    // 2. Perks / Text parsing regexes
    if ((/match\(.*?\)/.test(trimmed) || /test\(.*?\)/.test(trimmed)) && 
        (/(?:Strength|Dexterity|Constitution|Intelligence|Charisma|DR|Rank|Speed|walk|climb|swim|fly|burrow|Health)/i.test(trimmed) ||
         trimmed.includes('parseStats') || trimmed.includes('parseDR') || trimmed.includes('parseMovement') || trimmed.includes('parseSkillsAndSpells'))) {
      auditCategories.perksAndAbilityParsing.findings.push({ file: relPath, line: lineNum, code: trimmed });
    }

    // 3. Fuzzy matching / string normalization
    if (trimmed.includes('normalizeKey') || trimmed.includes('getInvertedKey') || trimmed.includes('matchKnownSkill') || trimmed.includes('matchKnownSpell') || trimmed.includes('toLowerCase().trim() ===') || trimmed.includes('.toLowerCase() ===')) {
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        auditCategories.fuzzyNameAndSkillMatching.findings.push({ file: relPath, line: lineNum, code: trimmed });
      }
    }

    // 4. Runtime keyword checks in combat / attack logic
    if (/\/(?:pugilism|unarmed|slice|fire fingers|chainsaw|bow|axe|hammer|smush|choke out)\/i\.(?:test|match)/.test(trimmed)) {
      auditCategories.runtimeRegexInCombat.findings.push({ file: relPath, line: lineNum, code: trimmed });
    }

    // 5. Comma-separated parsing
    if (trimmed.includes('.split(') && (trimmed.includes("','") || trimmed.includes("','") || trimmed.includes('/(?:,\\s*') || trimmed.includes("split(',')") || trimmed.includes('split(",")'))) {
      auditCategories.commaSeparatedArrayParsing.findings.push({ file: relPath, line: lineNum, code: trimmed });
    }
  });
}

// Format markdown report
let md = `# Comprehensive Audit: Runtime Text Parsing & Pattern Matching vs. Explicit Schemas\n\n`;
md += `**Date:** ${new Date().toISOString()}\n`;
md += `**Scope:** All ES Modules in \`src/\`\n\n`;
md += `## Executive Summary\n`;
md += `The system currently relies on runtime string parsing, regex extraction, and heuristic matching across 5 key areas:\n`;
md += `1. **OCR / Text Normalization:** Cleaning broken OCR whitespace from rule text strings.\n`;
md += `2. **Perks & Ability String Parsing:** Using regex to decompose narrative perk bullet points into numeric stats, DR bonuses, movement modes, and granted skills/spells at runtime.\n`;
md += `3. **Fuzzy Name Matching:** Inverting and lowercasing strings (e.g. \`Elf, High\` vs \`High Elf\`, \`Boring Ol' Fighter\` vs \`Boring Old Fighter\`) and matching items by name rather than explicit foreign keys/UUIDs.\n`;
md += `4. **Runtime Combat Regex:** Detecting special combat mechanics (e.g. *Fire Fingers*, *Choke Out*, *Smush*, unarmed checks) via regex on item names in attack/damage methods.\n`;
md += `5. **Delimited Input Parsing:** Splitting comma-separated strings from sheet inputs into arrays at form submit time.\n\n`;

for (const [catKey, cat] of Object.entries(auditCategories)) {
  md += `## ${cat.title} (${cat.findings.length} locations identified)\n\n`;
  if (cat.findings.length === 0) {
    md += `*None found.*\n\n`;
    continue;
  }
  md += `| File | Line | Snippet |\n`;
  md += `| :--- | :--- | :--- |\n`;
  // Group by file
  const fileGroups = {};
  for (const f of cat.findings) {
    if (!fileGroups[f.file]) fileGroups[f.file] = [];
    fileGroups[f.file].push(f);
  }
  for (const [fName, items] of Object.entries(fileGroups)) {
    for (const item of items.slice(0, 30)) { // limit table rows per file
      const safeCode = item.code.replace(/\|/g, '\\|').slice(0, 100);
      md += `| \`${fName}\` | ${item.line} | \`${safeCode}\` |\n`;
    }
    if (items.length > 30) {
      md += `| \`${fName}\` | ... | *(${items.length - 30} additional occurrences)* |\n`;
    }
  }
  md += `\n`;
}

md += `## Architectural Recommendation & Migration Path\n\n`;
md += `1. **Build-Time / Ingestion Pipeline:** Create an explicit offline compiler script that ingests canonical datasets (\`DCC_RACES\`, \`DCC_CLASSES\`, \`DCC_SKILLS\`, \`DCC_SPELLS\`) and transforms all perks and narrative text into strict, validated JSON schemas with explicit keys (\`bonuses.stats\`, \`bonuses.dr\`, \`grants.skills\`, \`grants.spells\`, \`tags\`).\n`;
md += `2. **Universal UUID / Slug System:** Replace string-based name comparisons with canonical slugs/IDs (e.g. \`race_elf_high\`, \`skill_pugilism\`, \`class_fighter\`).\n`;
md += `3. **DataModel Pre-Validation:** Ensure \`template.json\` and DataModels enforce structured arrays and schemas, eliminating runtime string splitting.\n`;
md += `4. **Zero-Regex Runtime Engine:** Runtime methods like \`applyRace\`, \`rollAttack\`, \`getAttackDamageParts\`, and sheet views read only pre-computed structured fields, never executing regex or OCR cleanups during play.\n`;

fs.writeFileSync(REPORT_FILE, md, 'utf-8');
console.log(`Audit report generated at: ${REPORT_FILE}`);
