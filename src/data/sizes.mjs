/**
 * Dungeon Crawler Carl RPG - Official Creature Size Categories
 */

export const DCC_SIZES = [
  { size: 1, name: "Tiny", label: "1 Tiny" },
  { size: 2, name: "Small", label: "2 Small" },
  { size: 3, name: "Petite", label: "3 Petite" },
  { size: 4, name: "Medium", label: "4 Medium" },
  { size: 5, name: "Large", label: "5 Large" },
  { size: 6, name: "Huge", label: "6 Huge" },
  { size: 7, name: "Colossal", label: "7 Colossal" },
  { size: 8, name: "Gargantuan", label: "8 Gargantuan" }
];

/**
 * Normalizes any size representation (number, name, or label) into full size descriptor.
 * @param {string|number} sizeInput - e.g. 4, "4", "Medium", "4 Medium", "medium"
 * @returns {{ size: number, name: string, label: string }}
 */
export function getSizeInfo(sizeInput) {
  if (sizeInput === null || sizeInput === undefined || sizeInput === '') {
    return { size: 4, name: "Medium", label: "4 Medium" };
  }

  const clean = String(sizeInput).trim().toLowerCase();

  // Try exact number match
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 8) {
    const matchByNum = DCC_SIZES.find(s => s.size === num);
    if (matchByNum) return matchByNum;
  }

  // Try name or label match
  const matchByName = DCC_SIZES.find(s => 
    s.name.toLowerCase() === clean || 
    s.label.toLowerCase() === clean ||
    clean.includes(s.name.toLowerCase())
  );
  if (matchByName) return matchByName;

  return { size: 4, name: "Medium", label: "4 Medium" };
}
