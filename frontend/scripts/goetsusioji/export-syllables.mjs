#!/usr/bin/env node
/**
 * Export goetsusioji-mapping → public/goetsusioji/ + lib/goetsusioji/.
 *
 * From mapping/goetsusioji.json:
 *   syllables.json, meta.json, rule-examples.json, atlas.json (components/rules/tones)
 * From mapping/siauzy-letters-to-hanzi-to-simplified.json:
 *   letters.json (public + lib copy for static import)
 *
 * Lexicon shape: { [romanization]: [{ glyph: string|null, han: string }] }
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, "../..");
const MAPPING_DIR = resolve(FRONTEND_ROOT, "../../goetsusioji-mapping/mapping");
const DEFAULT_MAPPING = join(MAPPING_DIR, "goetsusioji.json");
const DEFAULT_LETTERS = join(
  MAPPING_DIR,
  "siauzy-letters-to-hanzi-to-simplified.json"
);

const PUBLIC_DIR = join(FRONTEND_ROOT, "public/goetsusioji");
const LIB_DIR = join(FRONTEND_ROOT, "lib/goetsusioji");

const OUT_PATH = join(PUBLIC_DIR, "syllables.json");
const META_OUT = join(PUBLIC_DIR, "meta.json");
const ATLAS_PUBLIC = join(PUBLIC_DIR, "atlas.json");
const ATLAS_LIB = join(LIB_DIR, "atlas.json");
const LETTERS_PUBLIC = join(PUBLIC_DIR, "letters.json");
const LETTERS_LIB = join(LIB_DIR, "letters.json");
const RULE_EXAMPLES_OUT = join(LIB_DIR, "rule-examples.json");

const RULE_EXAMPLE_KEYS = ["keq", "tiau", "shian", "maeq", "yu", "aoq", "iuq"];

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

function entryFromSyllable(syl) {
  if (!syl || typeof syl !== "object") return null;
  const glyphRaw = syl.goetsu;
  const han = typeof syl.han === "string" ? syl.han : "";
  const glyph =
    typeof glyphRaw === "string" && glyphRaw.trim() ? glyphRaw : null;
  if (!glyph && !han) return null;
  return { glyph, han };
}

function sameEntry(a, b) {
  return a.glyph === b.glyph && a.han === b.han;
}

function addEntry(map, key, entry) {
  if (!key || !entry) return;
  if (!map[key]) map[key] = [];
  if (!map[key].some((e) => sameEntry(e, entry))) {
    map[key].push(entry);
  }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const mappingPath = process.env.GOETSUese_MAPPING?.trim() || DEFAULT_MAPPING;
  const lettersPath = process.env.GOETSUese_LETTERS?.trim() || DEFAULT_LETTERS;

  if (!existsSync(mappingPath)) {
    console.warn(
      `[goetsusioji:export] Mapping not found at ${mappingPath}; keeping committed public JSON.`
    );
    process.exit(0);
  }

  const data = JSON.parse(readFileSync(mappingPath, "utf8"));
  const syllables = data.syllables ?? {};
  const aliases = data.aliases ?? {};
  const map = {};

  for (const [rawKey, syl] of Object.entries(syllables)) {
    const key = normalizeKey(rawKey);
    if (!key) continue;
    // Empty-onset bare finals: chart-2 letter first, then grid syllable.
    const letter = entryFromSyllable(syl?.letter);
    if (letter) addEntry(map, key, letter);
    const entry = entryFromSyllable(syl);
    if (entry) addEntry(map, key, entry);
  }

  for (const [rawAlias, rawTarget] of Object.entries(aliases)) {
    const alias = normalizeKey(rawAlias);
    const target = normalizeKey(rawTarget);
    if (!alias || !target || !map[target]) continue;
    for (const entry of map[target]) {
      addEntry(map, alias, entry);
    }
  }

  writeJson(OUT_PATH, map);

  const meta = {
    initials_order: data.initials_order ?? [],
    finals_order: data.finals_order ?? [],
    medials_order: data.medials_order ?? [],
    duplicate_compact_romanizations: [],
    syllable_count: Object.keys(map).length,
    source: mappingPath,
    mapping_meta: {
      generated_by: data.meta?.generated_by ?? null,
      stats: data.meta?.stats ?? null,
      description: data.meta?.description ?? null,
    },
  };
  writeJson(META_OUT, meta);

  const atlas = {
    components: data.components ?? {},
    rules: data.rules ?? [],
    tones: data.tones ?? [],
    initials_order: data.initials_order ?? [],
    finals_order: data.finals_order ?? [],
    medials_order: data.medials_order ?? [],
    source: mappingPath,
  };
  writeJson(ATLAS_PUBLIC, atlas);
  writeJson(ATLAS_LIB, atlas);

  const ruleExamples = {};
  for (const key of RULE_EXAMPLE_KEYS) {
    const syl = syllables[key];
    if (!syl) continue;
    ruleExamples[key] = {
      glyph: typeof syl.goetsu === "string" ? syl.goetsu : null,
      han: typeof syl.han === "string" ? syl.han : "",
      codepoints: (syl.blocks ?? []).map((b) => b.codepoint).filter(Boolean),
      rule: syl.rule ?? null,
    };
  }
  writeJson(RULE_EXAMPLES_OUT, ruleExamples);

  if (existsSync(lettersPath)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
    mkdirSync(LIB_DIR, { recursive: true });
    copyFileSync(lettersPath, LETTERS_PUBLIC);
    copyFileSync(lettersPath, LETTERS_LIB);
    console.log(`Wrote ${LETTERS_PUBLIC}`);
    console.log(`Wrote ${LETTERS_LIB}`);
  } else {
    console.warn(
      `[goetsusioji:export] Letters not found at ${lettersPath}; skipping letters.json.`
    );
  }

  const withGlyph = Object.values(map).filter((arr) =>
    arr.some((e) => e.glyph)
  ).length;
  console.log(`Wrote ${OUT_PATH} (${Object.keys(map).length} keys)`);
  console.log(`Wrote ${META_OUT}`);
  console.log(`Wrote ${ATLAS_PUBLIC}`);
  console.log(`Wrote ${ATLAS_LIB}`);
  console.log(`Wrote ${RULE_EXAMPLES_OUT}`);
  console.log(`  with Siauzy glyph: ${withGlyph}`);
  console.log(`  aliases expanded: ${Object.keys(aliases).length}`);
}

main();
