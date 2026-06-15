import { normalizeBuffer } from "./normalize";
import type { NaturalCandidate, NaturalLexicon } from "./types";

/** Binary search lower bound on sorted syllable keys. */
export function lowerBoundKey(keys: string[], prefix: string): number {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (keys[mid] < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function glyphsForKey(
  lex: NaturalLexicon,
  syllable: string,
  out: NaturalCandidate[],
  limit: number,
  seenInPass: Set<string>
): void {
  const glyphs = lex.map[syllable];
  if (!Array.isArray(glyphs)) return;

  const seenInSyllable = new Set<string>();
  for (let index = 0; index < glyphs.length && out.length < limit; index++) {
    const glyph = glyphs[index];
    if (typeof glyph !== "string" || !glyph.trim()) continue;
    if (seenInSyllable.has(glyph)) continue;
    seenInSyllable.add(glyph);

    const dedupeKey = `${syllable}\0${glyph}`;
    if (seenInPass.has(dedupeKey)) continue;
    seenInPass.add(dedupeKey);

    out.push({ syllable, glyph, index });
  }
}

/**
 * Prefix match on tone-less syllable keys → flattened glyph candidates.
 * Exact key matches are listed before other prefix extensions.
 */
export function prefixCandidates(
  lex: NaturalLexicon,
  buffer: string,
  limit = 50
): NaturalCandidate[] {
  const prefix = normalizeBuffer(buffer);
  if (!prefix) return [];

  const out: NaturalCandidate[] = [];
  const seenInPass = new Set<string>();

  if (lex.keySet.has(prefix)) {
    glyphsForKey(lex, prefix, out, limit, seenInPass);
  }

  const lo = lowerBoundKey(lex.keys, prefix);
  for (let i = lo; i < lex.keys.length && out.length < limit; i++) {
    const key = lex.keys[i];
    if (!key.startsWith(prefix)) break;
    if (key === prefix) continue;
    glyphsForKey(lex, key, out, limit, seenInPass);
  }

  return out;
}

/** Glyphs for an exact tone-less syllable (empty array if key exists but unfilled). */
export function exactGlyphs(lex: NaturalLexicon, buffer: string): string[] {
  const key = normalizeBuffer(buffer);
  if (!key) return [];
  const glyphs = lex.map[key];
  if (!Array.isArray(glyphs)) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const glyph of glyphs) {
    if (typeof glyph !== "string" || !glyph.trim()) continue;
    if (seen.has(glyph)) continue;
    seen.add(glyph);
    out.push(glyph);
  }
  return out;
}

/** Whether the tone-less syllable is a known grid slot (filled or empty). */
export function isKnownSyllable(lex: NaturalLexicon, buffer: string): boolean {
  return lex.keySet.has(normalizeBuffer(buffer));
}
