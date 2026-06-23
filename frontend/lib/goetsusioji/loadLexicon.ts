import { buildIndexes } from "./buildIndexes";
import type { CharactersMap, GoetsusiojiLexicon, GoetsusiojiMeta } from "./types";

export const SYLLABLES_URL = "/goetsusioji/syllables.json";
export const META_URL = "/goetsusioji/meta.json";

/** Bump when syllables.json changes to bypass stale browser caches. */
export const SYLLABLES_LEXICON_VERSION = "2025-06-23";

let cached: GoetsusiojiLexicon | null = null;
let metaCached: GoetsusiojiMeta | null = null;

function validateMap(data: unknown): CharactersMap {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("syllables.json: expected a top-level object");
  }

  const map: CharactersMap = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key !== "string") continue;
    if (!Array.isArray(value)) {
      throw new Error(`syllables.json: value for "${key}" must be an array`);
    }
    map[key] = value.map((item) => {
      if (typeof item !== "string") {
        throw new Error(`syllables.json: non-string glyph under "${key}"`);
      }
      return item;
    });
  }

  return map;
}

function lexiconFetchUrl(base = SYLLABLES_URL): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${SYLLABLES_LEXICON_VERSION}`;
}

/** Fetch syllables.json and build indexes (cached in-memory for this session). */
export async function loadGoetsusiojiLexicon(
  url = SYLLABLES_URL
): Promise<GoetsusiojiLexicon> {
  if (cached) return cached;

  const res = await fetch(lexiconFetchUrl(url), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load ${url} (${res.status})`);
  }

  const data: unknown = await res.json();
  cached = buildIndexes(validateMap(data));
  return cached;
}

/** Fetch meta.json (initials/finals order for syllable parsing). */
export async function loadGoetsusiojiMeta(
  url = META_URL
): Promise<GoetsusiojiMeta> {
  if (metaCached) return metaCached;

  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}v=${SYLLABLES_LEXICON_VERSION}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Could not load ${url} (${res.status})`);
  }

  metaCached = (await res.json()) as GoetsusiojiMeta;
  return metaCached;
}

/** Clear module cache (tests / hot reload). */
export function clearGoetsusiojiLexiconCache(): void {
  cached = null;
  metaCached = null;
}
