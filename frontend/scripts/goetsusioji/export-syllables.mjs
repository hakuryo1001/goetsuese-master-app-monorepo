#!/usr/bin/env node
/**
 * Export goetsuese-mapping.json → public/goetsusioji/syllables.json
 * for browser IME prefix lookup ({ syllable: [glyph, ...] }).
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, "../..");
const DEFAULT_MAPPING = resolve(
  FRONTEND_ROOT,
  "../../goetsusioji-mapping/mapping/goetsuese-mapping.json"
);
const OUT_PATH = join(FRONTEND_ROOT, "public/goetsusioji/syllables.json");
const META_OUT = join(FRONTEND_ROOT, "public/goetsusioji/meta.json");

const ROMANIZE_ALIASES = {
  "ch(i)": "ch",
  "c(i)": "c",
  "j(i)": "j",
  "sh(i)": "sh",
  "zh(i)": "zh",
  "ae(n)": "ae",
  "oe(n)": "oe",
  "ie(n)": "ie",
};

function normalizeKey(raw) {
  const text = String(raw).trim().toLowerCase();
  if (!text) return null;
  return ROMANIZE_ALIASES[text] ?? text;
}

function addGlyph(map, key, char) {
  if (!key || !char || typeof char !== "string" || !char.trim()) return;
  if (!map[key]) map[key] = [];
  if (!map[key].includes(char)) map[key].push(char);
}

function main() {
  const mappingPath = process.env.GOETSUese_MAPPING?.trim() || DEFAULT_MAPPING;
  const raw = readFileSync(mappingPath, "utf8");
  const data = JSON.parse(raw);

  const map = {};

  for (const [key, entry] of Object.entries(data.romanization ?? {})) {
    const norm = normalizeKey(key);
    if (!norm || !entry?.char) continue;
    const kind = entry.kind ?? "syllable";
    if (kind === "syllable" || kind === "grammar") {
      addGlyph(map, norm, entry.char);
    }
  }

  for (const entry of Object.values(data.syllables ?? {})) {
    const key = normalizeKey(entry?.romanization);
    if (key && entry?.char) addGlyph(map, key, entry.char);
  }

  for (const [key, entry] of Object.entries(data.grammar ?? {})) {
    const norm = normalizeKey(key);
    if (norm && entry?.char) addGlyph(map, norm, entry.char);
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(map, null, 2)}\n`, "utf8");

  const meta = {
    initials_order: data.initials_order ?? [],
    finals_order: data.finals_order ?? [],
    duplicate_compact_romanizations:
      data.meta?.duplicate_compact_romanizations ?? [],
    syllable_count: Object.keys(map).length,
    source: mappingPath,
  };
  writeFileSync(META_OUT, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  const multi = Object.entries(map).filter(([, glyphs]) => glyphs.length > 1);
  console.log(`Wrote ${OUT_PATH} (${Object.keys(map).length} keys)`);
  console.log(`Wrote ${META_OUT}`);
  console.log(`  multi-glyph keys: ${multi.length}`);
}

main();
