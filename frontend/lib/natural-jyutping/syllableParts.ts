import { FINALS_SET, INITIALS_DESC } from "./phonology";

/** Split a tone-less syllable key into onset + rime (character_coverage.syllable_parts). */
export function syllableParts(
  key: string
): { initial: string; final: string } | null {
  for (const ini of INITIALS_DESC) {
    if (!key.startsWith(ini)) continue;
    const rime = key.slice(ini.length);
    if (FINALS_SET.has(rime)) return { initial: ini, final: rime };
  }
  return null;
}
