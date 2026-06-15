/** Tone-less Jyutping syllable → candidate glyphs (from characters.json). */
export type CharactersMap = Record<string, string[]>;

export type NaturalCandidate = {
  /** Tone-less syllable key, e.g. "baa". */
  syllable: string;
  glyph: string;
  /** Index within that syllable's array (stable list keys). */
  index: number;
};

export type NaturalLexicon = {
  map: CharactersMap;
  /** All syllable keys, sorted ascending. */
  keys: string[];
  keySet: Set<string>;
  /** Glyph → syllable keys (many-to-many). */
  charToSyllables: Map<string, string[]>;
  /** Syllables with at least one non-blank glyph. */
  filledCount: number;
};
