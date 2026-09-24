import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DCC_MOBS as EXISTING_MOBS } from '../src/data/mobs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDCCStatModifier(val) {
  if (val <= 0) return 0;
  if (val <= 2) return 1;
  if (val <= 5) return 2;
  if (val <= 9) return 3;
  if (val <= 19) return 4;
  if (val <= 49) return 5;
  if (val <= 99) return 6;
  if (val <= 149) return 7;
  if (val <= 199) return 8;
  if (val <= 299) return 9;
  return 10;
}

function makeMob(index, {
  name,
  level,
  classification = "Mob",
  creatureType,
  floor = "Floor 1",
  location = "",
  size = "Medium",
  tokenSize = null,
  bars,
  str, int: intVal, con, dex, cha,
  evadeDifficulty,
  surpriseDifficulty,
  move,
  dr,
  mana = 0,
  treasure = "",
  description,
  aiDescription,
  notes = "",
  special = "",
  source,
  attacks = [],
  spells = [],
  loot = []
}) {
  const idStr = String(index).padStart(6, '0');
  const _id = `dccmob0000${idStr}`;

  const strMod = getDCCStatModifier(str);
  const intMod = getDCCStatModifier(intVal);
  const conMod = getDCCStatModifier(con);
  const dexMod = getDCCStatModifier(dex);
  const chaMod = getDCCStatModifier(cha);

  const hpPerBar = conMod;
  const maxHp = bars * hpPerBar;
  const calculatedMana = mana > 0 ? mana : (spells.length > 0 ? Math.max(20, intMod * 10) : 0);

  let tSize = 1;
  if (tokenSize) {
    tSize = tokenSize;
  } else if (size === 'Large') {
    tSize = 2;
  } else if (size === 'Huge' || size === 'Colossal' || size === 'Gargantuan') {
    tSize = 3;
  }

  // Ensure every mob has at least one loot item
  if (loot.length === 0) {
    loot = [
      {
        name: `${name} Remains`,
        quantity: 1,
        notes: `Harvested materials or trophy from ${name}.`,
        description: `Remains from defeating ${name}. Can be traded or used in crafting.`
      }
    ];
  }

  const items = [
    ...attacks.map((atk, aIdx) => {
      const aIdStr = String(index * 100 + aIdx + 1).padStart(7, '0');
      return {
        _id: `dccatkmob${aIdStr}`,
        name: atk.name,
        type: "attack",
        img: atk.img || "icons/svg/sword.svg",
        system: {
          toHitStat: atk.toHitStat || "dex",
          toHitRank: 0,
          damageDice: atk.damageDice || "1d6",
          damageStat: atk.damageStat || (atk.toHitStat || "str"),
          damageType: atk.damageType || "Physical",
          effects: atk.effects || (atk.range ? `Range: ${atk.range}` : "")
        }
      };
    }),
    ...spells.map((spl, sIdx) => {
      const sIdStr = String(index * 100 + sIdx + 1).padStart(7, '0');
      return {
        _id: `dccsplmob${sIdStr}`,
        name: spl.name,
        type: "spell",
        img: spl.img || "icons/svg/wand.svg",
        system: {
          rank: spl.rank ?? 1,
          stat: spl.stat || "int",
          manaCost: spl.manaCost ?? 10,
          range: spl.range || "60 feet",
          duration: spl.duration || "Instantaneous",
          cooldown: spl.cooldown || "None",
          spellType: spl.spellType || (spl.damageDice || spl.baseDamage ? "Attack" : "Utility"),
          damageType: spl.damageType || "",
          baseDamage: spl.baseDamage || spl.damageDice || "",
          aiFavor: 0,
          favored: "",
          limitations: spl.limitations || "",
          quote: spl.quote || `Casting ${spl.name}`,
          description: spl.description || spl.effects || "",
          notes: spl.notes || spl.effects || "",
          upgrades: spl.upgrades || { rank5: "", rank10: "", rank15: "" }
        }
      };
    }),
    ...loot.map((lt, lIdx) => {
      const lIdStr = String(index * 100 + lIdx + 1).padStart(6, '0');
      return {
        _id: `dcclootmob${lIdStr}`,
        name: lt.name,
        type: "loot",
        img: lt.img || "icons/svg/chest.svg",
        system: {
          quantity: lt.quantity ?? 1,
          notes: lt.notes || lt.description || "",
          description: lt.description || lt.notes || ""
        }
      };
    })
  ];

  return {
    _id,
    name,
    type: "mob",
    img: "icons/svg/skull.svg",
    tokenWidth: tSize,
    tokenHeight: tSize,
    system: {
      abilities: {
        str: { value: str, unenhanced: str, mod: strMod },
        int: { value: intVal, unenhanced: intVal, mod: intMod },
        con: { value: con, unenhanced: con, mod: conMod },
        dex: { value: dex, unenhanced: dex, mod: dexMod },
        cha: { value: cha, unenhanced: cha, mod: chaMod }
      },
      attributes: {
        hp: {
          value: maxHp,
          max: maxHp,
          temp: 0,
          pct: 100,
          bars,
          hpPerBar
        },
        mana: {
          value: calculatedMana,
          max: calculatedMana,
          pct: 100
        },
        evade: {
          items: 0,
          buffs: 0,
          total: dexMod
        },
        dr: {
          armor: dr,
          items: 0,
          buffs: 0,
          total: dr
        },
        speed: {
          move,
          step: 10
        },
        aiFavor: 0,
        size,
        debuffs: "",
        externalBuffs: {
          buff1: "",
          buff2: "",
          buff3: ""
        },
        treasure: treasure || loot.map(l => l.name).join(", "),
        xp: level * 50,
        surpriseDifficulty,
        evadeDifficulty
      },
      details: {
        level,
        classification,
        creatureType,
        floor,
        location,
        description,
        aiDescription,
        notes,
        special: special || notes.split("\n")[0] || "",
        source
      }
    },
    items
  };
}

export { makeMob, getDCCStatModifier };
