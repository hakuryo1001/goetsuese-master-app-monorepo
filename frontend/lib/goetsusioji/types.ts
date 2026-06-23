/** Tone-less ngven syllable → candidate glyphs (from syllables.json). */
export type CharactersMap = Record<string, string[]>;

export type GoetsusiojiCandidate = {
  /** Normalized syllable key, e.g. "taon". */
  syllable: string;
  glyph: string;
  /** Index within that syllable's array (stable list keys). */
  index: number;
};

export type GoetsusiojiLexicon = {
  map: CharactersMap;
  /** All syllable keys, sorted ascending. */
  keys: string[];
  keySet: Set<string>;
  /** Glyph → syllable keys (many-to-many). */
  charToSyllables: Map<string, string[]>;
  /** Syllables with at least one non-blank glyph. */
  filledCount: number;
};

export type GoetsusiojiMeta = {
  initials_order: string[];
  finals_order: string[];
  duplicate_compact_romanizations: string[];
  syllable_count: number;
  source?: string;
};
