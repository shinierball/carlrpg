#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';

const TARGET_THRESHOLD = 75.0;

const testProc = spawn('node', [
  '--test',
  '--experimental-test-coverage',
  '--test-coverage-include=src/**',
  'tests/*.test.mjs'
], {
  stdio: ['inherit', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

testProc.stdout.on('data', (chunk) => {
  const str = chunk.toString();
  stdout += str;
  process.stdout.write(str);
});

testProc.stderr.on('data', (chunk) => {
  const str = chunk.toString();
  stderr += str;
  process.stderr.write(str);
});

testProc.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Tests failed with exit code ${code}`);
    process.exit(code);
  }

  // Parse coverage report table
  const lines = stdout.split('\n');
  let inReport = false;
  const fileStats = [];
  let currentDir = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[ℹ|\s]+/, '').trim();

    if (rawLine.includes('start of coverage report')) {
      inReport = true;
      continue;
    }
    if (rawLine.includes('end of coverage report')) {
      inReport = false;
      break;
    }
    if (!inReport) continue;

    // Line format: file | line % | branch % | funcs % | uncovered lines
    const parts = rawLine.split('|').map(p => p.replace(/^[ℹ\s]+/, '').trim());
    if (parts.length >= 4) {
      const namePart = parts[0];
      const linePct = parseFloat(parts[1]);
      const branchPct = parseFloat(parts[2]);
      const funcsPct = parseFloat(parts[3]);

      if (!isNaN(linePct)) {
        fileStats.push({
          file: namePart,
          linePct,
          branchPct,
          funcsPct,
          meetsThreshold: linePct >= TARGET_THRESHOLD
        });
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 CARL RPG TEST COVERAGE AUDIT (Target: ≥ ${TARGET_THRESHOLD}%)`);
  console.log('='.repeat(70));

  const failingFiles = fileStats.filter(f => !f.meetsThreshold && f.file !== 'all files');

  if (failingFiles.length > 0) {
    console.log('\n⚠️ Files Below 75% Coverage Threshold:');
    for (const f of failingFiles) {
      console.log(`  ❌ ${f.file.padEnd(35)} : ${f.linePct.toFixed(2)}% (Need +${(TARGET_THRESHOLD - f.linePct).toFixed(2)}%)`);
    }
  } else {
    console.log('\n🎉 ALL audited files in src/ meet or exceed the 75% threshold!');
  }

  const allFilesStat = fileStats.find(f => f.file === 'all files');
  if (allFilesStat) {
    console.log(`\n📈 Overall Codebase Coverage: ${allFilesStat.linePct.toFixed(2)}% Line Coverage`);
  }
  console.log('='.repeat(70) + '\n');

  if (failingFiles.length > 0) {
    process.exit(1);
  }
  process.exit(0);
});
