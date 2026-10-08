/**
 * CarlRPG Tag Query Engine
 *
 * Implements pure set-based tag evaluation.
 * No regex, substring matching, or string guessing permitted (GEMINI §0).
 */

import { getTagDefinition } from '../data/tags.mjs';

/**
 * Normalize an input into a clean, deduplicated array of tag IDs.
 * Accepts arrays, Sets, or comma-separated strings.
 * @param {Array<string>|Set<string>|string|null} input
 * @returns {Array<string>}
 */
export function normalizeTagList(input) {
  if (!input) return [];
  const set = new Set();

  if (typeof input === 'string') {
    const parts = input.includes(',') ? input.split(',') : input.trim().split(/\s+/);
    for (const p of parts) {
      const clean = p.trim();
      if (clean) set.add(clean);
    }
  } else if (input instanceof Set || Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string' && item.trim()) {
        set.add(item.trim());
      }
    }
  }

  return Array.from(set).sort();
}

/**
 * Evaluate whether a given tag set matches a TagQuery.
 *
 * Query shapes supported:
 * 1. String: single tag required ('element.fire')
 * 2. Array: all tags required (['kind.spell', 'element.fire'])
 * 3. Object:
 *    {
 *      all?:  string[], // must contain ALL of these
 *      any?:  string[], // must contain AT LEAST ONE of these
 *      none?: string[]  // must NOT contain ANY of these
 *    }
 *
 * An empty or omitted query matches everything (returns true).
 *
 * @param {Set<string>|Array<string>} tagContainer - Tags possessed by the candidate entity
 * @param {object|Array<string>|string|null} query - Query definition
 * @returns {boolean}
 */
export function matchesTagQuery(tagContainer, query) {
  if (!query) return true;

  // Convert container to Set for O(1) membership checks
  const tagSet = tagContainer instanceof Set
    ? tagContainer
    : new Set(normalizeTagList(tagContainer));

  // 1. Single string query
  if (typeof query === 'string') {
    const trimmed = query.trim();
    if (!trimmed) return true;
    return tagSet.has(trimmed);
  }

  // 2. Simple array query (treated as 'all')
  if (Array.isArray(query)) {
    if (query.length === 0) return true;
    return query.every(t => typeof t === 'string' && tagSet.has(t.trim()));
  }

  // 3. Structured object query { all, any, none }
  if (typeof query === 'object') {
    const all = Array.isArray(query.all) ? query.all : null;
    const any = Array.isArray(query.any) ? query.any : null;
    const none = Array.isArray(query.none) ? query.none : null;

    // Check 'all' condition
    if (all && all.length > 0) {
      for (const t of all) {
        if (!tagSet.has(t.trim())) return false;
      }
    }

    // Check 'any' condition
    if (any && any.length > 0) {
      let matchedAny = false;
      for (const t of any) {
        if (tagSet.has(t.trim())) {
          matchedAny = true;
          break;
        }
      }
      if (!matchedAny) return false;
    }

    // Check 'none' condition
    if (none && none.length > 0) {
      for (const t of none) {
        if (tagSet.has(t.trim())) return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Expand a set of tags to include any registered references.
 * E.g., if a tag registry entry declares `references: 'archetype.mage'`,
 * this function can resolve references bidirectionally or unidirectionally.
 * @param {Set<string>|Array<string>} tagContainer
 * @returns {Set<string>}
 */
export function expandTagReferences(tagContainer) {
  const expanded = new Set(tagContainer instanceof Set ? tagContainer : normalizeTagList(tagContainer));

  for (const tagId of Array.from(expanded)) {
    const def = getTagDefinition(tagId);
    if (def?.references) {
      expanded.add(def.references);
    }
  }

  return expanded;
}
