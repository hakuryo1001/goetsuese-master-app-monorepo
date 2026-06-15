import type { CharactersMap, NaturalLexicon } from "./types";

function isFilled(chars: unknown): boolean {
  if (!Array.isArray(chars) || chars.length === 0) return false;
  return chars.some((c) => typeof c === "string" && c.trim().length > 0);
}

/** Build lookup indexes from a loaded characters map. */
export function buildIndexes(map: CharactersMap): NaturalLexicon {
  const keys = Object.keys(map).sort();
  const keySet = new Set(keys);
  const charToSyllables = new Map<string, string[]>();
  let filledCount = 0;

  for (const syllable of keys) {
    if (isFilled(map[syllable])) filledCount += 1;

    const glyphs = map[syllable];
    if (!Array.isArray(glyphs)) continue;

    const seen = new Set<string>();
    for (const glyph of glyphs) {
      if (typeof glyph !== "string" || !glyph.trim()) continue;
      if (seen.has(glyph)) continue;
      seen.add(glyph);

      const existing = charToSyllables.get(glyph);
      if (existing) existing.push(syllable);
      else charToSyllables.set(glyph, [syllable]);
    }
  }

  return { map, keys, keySet, charToSyllables, filledCount };
}
