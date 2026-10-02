/**
 * color-contrast-and-readability.test.mjs
 * Comprehensive unit test suite verifying font/background color contrast and human readability
 * across character sheets, item edit screens, dialogs, and manager applications.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Color Contrast and Human Readability Audit', () => {
  const cssPath = path.join(rootDir, 'styles', 'dcc.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('1. CSS defines universal high-contrast placeholders and explicit input font colors', () => {
    // Universal placeholder rule must be present and enforce human-readable contrast
    assert.match(
      cssContent,
      /\.dcc-sheet\s+input::placeholder[\s\S]*?color:\s*#444444\s*!important/i,
      'Universal placeholder contrast rule for inputs must be present in dcc.css'
    );
    assert.match(
      cssContent,
      /\.dcc-sheet\s+textarea::placeholder[\s\S]*?color:\s*#444444\s*!important/i,
      'Universal placeholder contrast rule for textareas must be present in dcc.css'
    );

    // Inputs, selects, and textareas must have explicit dark text colors to avoid browser dark mode washed-out font colors
    assert.match(
      cssContent,
      /\.dcc-field-input[\s\S]*?color:\s*#111111/i,
      '.dcc-field-input must define explicit high-contrast font color #111111'
    );
    assert.match(
      cssContent,
      /\.dcc-stat-input[\s\S]*?color:\s*#111111/i,
      '.dcc-stat-input must define explicit high-contrast font color #111111'
    );
  });

  it('2. Low-contrast grey and pastel classes in dcc.css are upgraded to high-contrast tones', () => {
    // .dcc-rest-label must be dark and human readable
    assert.match(
      cssContent,
      /\.dcc-rest-label\s*\{[^}]*color:\s*#222222/i,
      '.dcc-rest-label must be #222222'
    );

    // .dcc-hotlist-empty and .dcc-hotlist-detail must be high-contrast
    assert.match(
      cssContent,
      /\.dcc-hotlist-empty\s*\{[^}]*color:\s*#333333/i,
      '.dcc-hotlist-empty must be #333333'
    );
    assert.match(
      cssContent,
      /\.dcc-hotlist-detail\s*\{[^}]*color:\s*#333333/i,
      '.dcc-hotlist-detail must be #333333'
    );

    // .dcc-damage-formula must be high-contrast
    assert.match(
      cssContent,
      /\.dcc-damage-formula\s*\{[^}]*color:\s*#333333/i,
      '.dcc-damage-formula must be #333333'
    );

    // Empty states must not have washed out #777 text
    assert.match(
      cssContent,
      /\.dcc-empty-state\s*\{[^}]*color:\s*#333333/i,
      '.dcc-empty-state must be #333333'
    );
  });

  it('3. Dialogs with light text have explicit dark background containers defined in dcc.css', () => {
    assert.match(
      cssContent,
      /\.dcc-add-event-form[\s\S]*?background:\s*#141419/i,
      'Dialog forms must define explicit dark background #141419'
    );
    assert.match(
      cssContent,
      /\.dcc-manage-roster-dialog[\s\S]*?background:\s*#141419/i,
      'Roster dialog must define explicit dark background #141419'
    );
    assert.match(
      cssContent,
      /\.dcc-create-party-dialog[\s\S]*?background:\s*#141419/i,
      'Create party dialog must define explicit dark background #141419'
    );
  });

  it('4. Item sheet templates have sufficient contrast for headers, rank breaks, and notes', () => {
    const headerPath = path.join(rootDir, 'templates', 'items', 'parts', 'header.hbs');
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert.doesNotMatch(headerContent, /color:\s*#e74c3c/i, 'Header should use DCC Red #c0392b instead of bright coral #e74c3c');

    const skillPath = path.join(rootDir, 'templates', 'items', 'parts', 'skill.hbs');
    const skillContent = fs.readFileSync(skillPath, 'utf8');
    assert.match(skillContent, /#196f3d/i, 'Skill rank 5 break must use deep green #196f3d');
    assert.match(skillContent, /#1a5276/i, 'Skill rank 10 break must use deep navy #1a5276');
    assert.match(skillContent, /#6c3483/i, 'Skill rank 15 break must use deep purple #6c3483');
    assert.match(skillContent, /#873600/i, 'Skill rank 20 break must use deep brown #873600');
    assert.doesNotMatch(skillContent, /color:\s*#777/i, 'Empty modifier note should be #333333 not #777');

    const spellPath = path.join(rootDir, 'templates', 'items', 'parts', 'spell.hbs');
    const spellContent = fs.readFileSync(spellPath, 'utf8');
    assert.match(spellContent, /#196f3d/i, 'Spell rank 5 break must use deep green #196f3d');
    assert.match(spellContent, /#1a5276/i, 'Spell rank 10 break must use deep navy #1a5276');
    assert.match(spellContent, /#6c3483/i, 'Spell rank 15 break must use deep purple #6c3483');
    assert.match(spellContent, /#873600/i, 'Spell rank 20 break must use deep brown #873600');

    const achievePath = path.join(rootDir, 'templates', 'items', 'parts', 'achievement.hbs');
    const achieveContent = fs.readFileSync(achievePath, 'utf8');
    assert.match(achieveContent, /color:\s*#196f3d/i, 'Reward label must use deep green #196f3d');
    assert.match(achieveContent, /color:\s*#7e5109/i, 'AI Favor label must use deep gold #7e5109');
    assert.match(achieveContent, /color:\s*#1a5276/i, 'XP label must use deep navy #1a5276');
  });

  it('5. Actor sheet partials do not contain light yellow or unreadable text on light table backgrounds', () => {
    const page3SkillsPath = path.join(rootDir, 'templates', 'actors', 'parts', 'page3-skills.hbs');
    const page3SkillsContent = fs.readFileSync(page3SkillsPath, 'utf8');
    assert.doesNotMatch(
      page3SkillsContent,
      /<strong style="color:\s*#f1c40f;">/i,
      'page3-skills empty state must not have bright yellow text on light background'
    );
    assert.match(
      page3SkillsContent,
      /<strong style="color:\s*#c0392b;">/i,
      'page3-skills empty state must use DCC Red'
    );

    const spellsPath = path.join(rootDir, 'templates', 'actors', 'parts', 'spells.hbs');
    const spellsContent = fs.readFileSync(spellsPath, 'utf8');
    assert.doesNotMatch(
      spellsContent,
      /<strong style="color:\s*#f1c40f;">/i,
      'spells.hbs empty state must not have bright yellow text on light background'
    );
    assert.match(
      spellsContent,
      /<strong style="color:\s*#c0392b;">/i,
      'spells.hbs empty state must use DCC Red'
    );
  });

  it('6. Kill dialogs in crawler-sheet.mjs have dark background containers and bright text', () => {
    const sheetMjsPath = path.join(rootDir, 'src', 'sheets', 'crawler-sheet.mjs');
    const sheetMjsContent = fs.readFileSync(sheetMjsPath, 'utf8');
    assert.match(
      sheetMjsContent,
      /Record Boss Kill[\s\S]*?background:\s*#141419/i,
      'Boss kill dialog must define explicit dark container background'
    );
    assert.match(
      sheetMjsContent,
      /Record Crawler Kill[\s\S]*?background:\s*#141419/i,
      'Crawler kill dialog must define explicit dark container background'
    );
  });
});
