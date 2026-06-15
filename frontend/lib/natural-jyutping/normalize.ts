/** Strip tone digits 1–6 from the end and lowercase (mirrors JyutpingLookup._remove_tone). */
export function removeTone(jyutping: string): string {
  return jyutping.replace(/[1-6]$/, "").toLowerCase();
}

/** Normalize raw composition buffer for lookup. */
export function normalizeBuffer(buffer: string): string {
  return removeTone(buffer.trim());
}
