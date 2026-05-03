import type { LexEntry } from "./decodeLexicon";

/** Entries must be sorted by `code` ascending, then weight descending. */
export function lowerBoundCode(entries: LexEntry[], prefix: string): number {
  let lo = 0;
  let hi = entries.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (entries[mid].code < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function prefixCandidates(
  entries: LexEntry[],
  prefix: string,
  limit: number
): LexEntry[] {
  if (!prefix) return [];
  const p = prefix.toLowerCase();
  const lo = lowerBoundCode(entries, p);
  const out: LexEntry[] = [];
  for (let i = lo; i < entries.length && out.length < limit; i++) {
    const e = entries[i];
    if (!e.code.startsWith(p)) break;
    out.push(e);
  }
  return out;
}
