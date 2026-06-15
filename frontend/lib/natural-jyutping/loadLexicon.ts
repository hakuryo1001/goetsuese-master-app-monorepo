import { buildIndexes } from "./buildIndexes";
import type { CharactersMap, NaturalLexicon } from "./types";

export const CHARACTERS_URL = "/natural-jyutping/characters.json";

let cached: NaturalLexicon | null = null;

function validateMap(data: unknown): CharactersMap {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("characters.json: expected a top-level object");
  }

  const map: CharactersMap = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key !== "string") continue;
    if (!Array.isArray(value)) {
      throw new Error(`characters.json: value for "${key}" must be an array`);
    }
    map[key] = value.map((item) => {
      if (typeof item !== "string") {
        throw new Error(`characters.json: non-string glyph under "${key}"`);
      }
      return item;
    });
  }

  return map;
}

/** Fetch characters.json and build indexes (cached after first load). */
export async function loadNaturalLexicon(
  url = CHARACTERS_URL
): Promise<NaturalLexicon> {
  if (cached) return cached;

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Could not load ${url} (${res.status})`);
  }

  const data: unknown = await res.json();
  cached = buildIndexes(validateMap(data));
  return cached;
}

/** Clear module cache (tests / hot reload). */
export function clearNaturalLexiconCache(): void {
  cached = null;
}
