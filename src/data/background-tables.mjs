/**
 * Dungeon Crawler Carl RPG - Crawler Character Creation Background Tables
 * Official tables used during Step 9 of Crawler Character Creation to determine
 * a crawler's Past Traumas, Loose Ends, and Regrets.
 */

export const DCC_PAST_TRAUMAS = [
  { roll: 1, text: 'I was abused by someone I trusted.' },
  { roll: 2, text: 'I was in a terrible accident.' },
  { roll: 3, text: 'I witnessed a death.' },
  { roll: 4, text: 'I was betrayed by a family member, friend, or lover.' },
  { roll: 5, text: 'I was abandoned by one or more parents.' },
  { roll: 6, text: 'I have a fear of open spaces.' },
  { roll: 7, text: 'I have a fear of the dark or being alone.' },
  { roll: 8, text: 'My home burned down.' },
  { roll: 9, text: 'I was falsely accused of a betrayal or crime.' },
  { roll: 10, text: 'I was deeply humiliated by a family member, friend, or lover.' },
  { roll: 11, text: 'I let someone take the blame for something terrible that I did.' },
  { roll: 12, text: 'I have a fear of heights.' }
];

export const DCC_LOOSE_ENDS = [
  { roll: 1, text: 'I never finished high school or my college degree.' },
  { roll: 2, text: 'I was about to open a restaurant or other business.' },
  { roll: 3, text: 'I didn’t finish writing my novel.' },
  { roll: 4, text: 'A family member, friend, or lover recently died, but I couldn’t say my goodbyes.' },
  { roll: 5, text: 'I was on the verge of inventing or discovering something.' },
  { roll: 6, text: 'I made a promise that I might no longer be able to fulfill.' },
  { roll: 7, text: 'My collection was almost complete.' },
  { roll: 8, text: 'I was about to perform for the first time when the collapse happened.' },
  { roll: 9, text: 'I wanted to dump my partner, but…' },
  { roll: 10, text: 'I was just about to buy or finish renovating my home.' },
  { roll: 11, text: 'I never sent that letter to a family member, friend, or loved one.' },
  { roll: 12, text: 'I never got to travel to my dream destination.' }
];

export const DCC_REGRETS = [
  { roll: 1, text: 'I didn’t ask them to marry me.' },
  { roll: 2, text: 'I turned down the perfect job.' },
  { roll: 3, text: 'I stayed quiet when I shouldn’t have.' },
  { roll: 4, text: 'I chose my own safety when I should have leapt into action.' },
  { roll: 5, text: 'I never said goodbye.' },
  { roll: 6, text: 'I spent way too much time on something pointless.' },
  { roll: 7, text: 'I did something illegal, immoral, and probably both.' },
  { roll: 8, text: 'I lied to avoid an event important to those close to me.' },
  { roll: 9, text: 'I kept a secret that hurt someone badly.' },
  { roll: 10, text: 'I didn’t apologize for something terrible that I did.' },
  { roll: 11, text: 'I abandoned someone when they needed me the most.' },
  { roll: 12, text: 'I trusted the wrong people.' }
];

export const DCC_BACKGROUND_TABLES = {
  pastTrauma: {
    key: 'pastTrauma',
    tableNumber: 11,
    name: 'Table 11: Past Traumas',
    description: 'Crawler Character Creation Background Table 11: Past Traumas (1d12)',
    formula: '1d12',
    results: DCC_PAST_TRAUMAS
  },
  looseEnds: {
    key: 'looseEnds',
    tableNumber: 12,
    name: 'Table 12: Loose Ends',
    description: 'Crawler Character Creation Background Table 12: Loose Ends (1d12)',
    formula: '1d12',
    results: DCC_LOOSE_ENDS
  },
  regrets: {
    key: 'regrets',
    tableNumber: 13,
    name: 'Table 13: Regrets',
    description: 'Crawler Character Creation Background Table 13: Regrets (1d12)',
    formula: '1d12',
    results: DCC_REGRETS
  }
};

/**
 * Resolve a background table definition by key, table number, or name.
 * @param {string|number} keyOrName
 * @returns {object|null}
 */
export function getBackgroundTable(keyOrName) {
  if (!keyOrName) return null;
  const str = String(keyOrName).toLowerCase().trim();

  if (str === 'pasttrauma' || str === 'trauma' || str === '11' || str.includes('past trauma')) {
    return DCC_BACKGROUND_TABLES.pastTrauma;
  }
  if (str === 'looseends' || str === 'loose' || str === '12' || str.includes('loose end')) {
    return DCC_BACKGROUND_TABLES.looseEnds;
  }
  if (str === 'regrets' || str === 'regret' || str === '13' || str.includes('regret')) {
    return DCC_BACKGROUND_TABLES.regrets;
  }

  return DCC_BACKGROUND_TABLES[keyOrName] || null;
}

/**
 * Roll or choose a result from a background table.
 * @param {string|number} tableKey - 'pastTrauma' | 'looseEnds' | 'regrets' or table number (11, 12, 13)
 * @param {object} [options={}] - Roll options
 * @param {number} [options.roll] - Explicit roll result (1-12) to select without dice roll
 * @returns {Promise<{tableKey: string, tableName: string, tableNumber: number, roll: number, text: string}>}
 */
export async function rollBackgroundTable(tableKey, { roll: explicitRoll = null } = {}) {
  const tableDef = getBackgroundTable(tableKey);
  if (!tableDef) {
    throw new Error(`DCC RPG | Unknown background table: ${tableKey}`);
  }

  let rollNumber = explicitRoll;
  if (!rollNumber || rollNumber < 1 || rollNumber > 12) {
    if (typeof Roll !== 'undefined' && typeof Roll === 'function') {
      const r = new Roll('1d12');
      await r.evaluate();
      rollNumber = Math.min(12, Math.max(1, Math.floor(Number(r.total) || (Math.random() * 12 + 1))));
    } else {
      rollNumber = Math.floor(Math.random() * 12) + 1;
    }
  }

  const match = tableDef.results.find(item => item.roll === rollNumber) || tableDef.results[0];

  return {
    tableKey: tableDef.key,
    tableName: tableDef.name,
    tableNumber: tableDef.tableNumber,
    roll: rollNumber,
    text: match.text
  };
}

/**
 * Create a Foundry RollTable document data object for a background table.
 * @param {string} tableKey - 'pastTrauma' | 'looseEnds' | 'regrets'
 * @returns {object}
 */
export function createBackgroundRollTableData(tableKey) {
  const tableDef = getBackgroundTable(tableKey);
  if (!tableDef) {
    throw new Error(`DCC RPG | Unknown background table: ${tableKey}`);
  }

  // In Foundry VTT, CONST.TABLE_RESULT_TYPES.TEXT is 0.
  // Safely resolve to 0 without truthy check breaking on 0.
  const textResultType = (typeof CONST !== 'undefined' && CONST.TABLE_RESULT_TYPES && typeof CONST.TABLE_RESULT_TYPES.TEXT !== 'undefined')
    ? CONST.TABLE_RESULT_TYPES.TEXT
    : 0;

  return {
    name: tableDef.name,
    img: 'icons/svg/d20-grey.svg',
    description: `<p>${tableDef.description}</p>`,
    formula: tableDef.formula,
    replacement: true,
    displayRoll: true,
    results: tableDef.results.map(r => ({
      type: textResultType,
      text: r.text,
      img: 'icons/svg/d20-black.svg',
      weight: 1,
      range: [r.roll, r.roll],
      drawn: false,
      documentCollection: null,
      documentId: null
    })),
    flags: {
      'carl-rpg': {
        tableKey: tableDef.key,
        tableNumber: tableDef.tableNumber
      }
    }
  };
}

/**
 * Ensure the official background RollTables exist in the world's RollTable collection.
 * If any table is missing, creates it using RollTable.create.
 * @returns {Promise<Array<RollTable>>}
 */
export async function ensureBackgroundTables() {
  if (typeof RollTable === 'undefined' || !globalThis.game?.tables) {
    return [];
  }

  // Only GM users should attempt to create or populate world documents
  if (globalThis.game?.user && !globalThis.game.user.isGM) {
    return [];
  }

  const createdOrFound = [];
  for (const tableKey of ['pastTrauma', 'looseEnds', 'regrets']) {
    const tableDef = DCC_BACKGROUND_TABLES[tableKey];
    let existing = null;

    if (typeof game.tables.find === 'function') {
      existing = game.tables.find(t => t.name === tableDef.name || t.flags?.['carl-rpg']?.tableKey === tableKey);
    } else if (Array.isArray(game.tables)) {
      existing = game.tables.find(t => t.name === tableDef.name || t.flags?.['carl-rpg']?.tableKey === tableKey);
    }

    if (existing) {
      // If table exists but has 0 results, populate them
      const resultCount = existing.results?.size ?? (Array.isArray(existing.results) ? existing.results.length : 0);
      if (resultCount === 0 && typeof existing.createEmbeddedDocuments === 'function') {
        try {
          const tableData = createBackgroundRollTableData(tableKey);
          await existing.createEmbeddedDocuments('TableResult', tableData.results);
        } catch (err) {
          console.warn(`DCC RPG | Could not populate results for RollTable ${tableDef.name}:`, err);
        }
      }
      createdOrFound.push(existing);
    } else if (typeof RollTable.create === 'function') {
      try {
        const tableData = createBackgroundRollTableData(tableKey);
        const newTable = await RollTable.create(tableData, { renderSheet: false });
        if (newTable) createdOrFound.push(newTable);
      } catch (err) {
        console.warn(`DCC RPG | Could not create RollTable ${tableDef.name}:`, err);
      }
    }
  }

  return createdOrFound;
}
