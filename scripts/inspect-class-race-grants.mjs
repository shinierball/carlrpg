import { DCC_CLASSES } from '../src/data/classes.mjs';
import { DCC_RACES } from '../src/data/races.mjs';

console.log('--- CLASSES ---');
for (const c of DCC_CLASSES) {
  console.log(`\nClass: ${c.name} (${c.system?.classType})`);
  console.log('Stats:', JSON.stringify(c.system?.stats));
  console.log('Skills:', JSON.stringify(c.system?.skills));
  console.log('Spells:', JSON.stringify(c.system?.spells));
  console.log('Perks:', c.system?.perks);
}

console.log('\n--- RACES ---');
for (const r of DCC_RACES) {
  console.log(`\nRace: ${r.name} (${r.system?.heritage}) Size: ${r.system?.size}`);
  console.log('Stats:', JSON.stringify(r.system?.stats));
  console.log('Skills:', JSON.stringify(r.system?.skills));
  console.log('Spells:', JSON.stringify(r.system?.spells));
  console.log('Perks:', r.system?.perks);
}
