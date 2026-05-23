/**
 * Build lexicon-web-v1.bin and lexicon-font-v1.bin from Rime dict YAMLs.
 * Format: magic "JTC1", u32 version=1, u32 N, N records (u16 codeLen, code utf8, u16 textLen, text utf8, f32 weight).
 * Entries sorted by code ascending, then weight descending.
 */
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, "../..");
const MONOREPO_ROOT = resolve(FRONTEND_ROOT, "..");
const OUT_DIR = join(FRONTEND_ROOT, "public", "ime");

const JRIME = resolve(
  process.env.IME_JYUTCITZI_RIME ?? join(MONOREPO_ROOT, "submodules/jyutcitzi-RIME")
);
const RCANT = resolve(
  process.env.IME_RIME_CANTONESE ?? join(MONOREPO_ROOT, "submodules/rime-cantonese")
);

const PROFILES = [
  { name: "web", main: "jyutcitzi_web.dict.yaml", out: "lexicon-web-v1.bin" },
  { name: "font", main: "jyutcitzi_font.dict.yaml", out: "lexicon-font-v1.bin" },
];

function resolveTablePath(tableName) {
  const fname = `${tableName}.dict.yaml`;
  const p1 = join(JRIME, fname);
  if (existsSync(p1)) return p1;
  const p2 = join(RCANT, fname);
  if (existsSync(p2)) return p2;
  throw new Error(`Missing dict table "${tableName}" — tried:\n  ${p1}\n  ${p2}`);
}

function parseImportTables(mainDictPath) {
  const raw = readFileSync(mainDictPath, "utf8");
  const sep = raw.indexOf("\n...\n");
  if (sep === -1) throw new Error(`No YAML terminator in ${mainDictPath}`);
  const header = raw.slice(0, sep);
  const m = header.match(/import_tables:\s*\n((?:\s*-\s*[^\n]+\n)+)/);
  if (!m) throw new Error(`import_tables not found in ${mainDictPath}`);
  return m[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const mm = line.match(/^-\s*(.+)$/);
      return mm ? mm[1].trim() : null;
    })
    .filter(Boolean);
}

function parseDictBody(dictPath) {
  const raw = readFileSync(dictPath, "utf8");
  const sep = raw.indexOf("\n...\n");
  if (sep === -1) throw new Error(`No body in ${dictPath}`);
  const body = raw.slice(sep + 5);
  const rows = [];
  for (const line of body.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length < 2) continue;
    const text = parts[0];
    const code = parts[1];
    const w = parts.length >= 3 ? parseFloat(parts[2]) : 0;
    if (!code || Number.isNaN(w)) continue;
    rows.push({ text, code, weight: w });
  }
  return rows;
}

function mergeProfile(mainDictFile) {
  const mainPath = join(JRIME, mainDictFile);
  if (!existsSync(mainPath)) {
    throw new Error(
      `Main dict not found: ${mainPath}\n` +
        `Set IME_JYUTCITZI_RIME or run: git submodule update --init --recursive`
    );
  }
  const tables = parseImportTables(mainPath);
  /** @type {Map<string, { text: string, code: string, weight: number }>} */
  const map = new Map();
  function ingest(rows) {
    for (const { text, code, weight } of rows) {
      const key = `${code}\n${text}`;
      map.set(key, { text, code, weight });
    }
  }
  for (const table of tables) {
    const path = resolveTablePath(table);
    ingest(parseDictBody(path));
  }
  ingest(parseDictBody(mainPath));
  const arr = [...map.values()];
  arr.sort((a, b) => {
    const c = a.code.localeCompare(b.code);
    if (c !== 0) return c;
    return b.weight - a.weight;
  });
  return arr;
}

function encodeUtf8(s) {
  return Buffer.from(s, "utf8");
}

function buildBuffer(entries) {
  const parts = [Buffer.from("JTC1", "ascii"), Buffer.alloc(8)];
  let n = 0;
  for (const { code, text, weight } of entries) {
    const cbuf = encodeUtf8(code);
    const tbuf = encodeUtf8(text);
    if (cbuf.length > 65535 || tbuf.length > 65535) continue;
    const rec = Buffer.alloc(4 + cbuf.length + tbuf.length + 4);
    let o = 0;
    rec.writeUInt16LE(cbuf.length, o);
    o += 2;
    cbuf.copy(rec, o);
    o += cbuf.length;
    rec.writeUInt16LE(tbuf.length, o);
    o += 2;
    tbuf.copy(rec, o);
    o += tbuf.length;
    rec.writeFloatLE(weight, o);
    parts.push(rec);
    n++;
  }
  const buf = Buffer.concat(parts);
  buf.writeUInt32LE(1, 4);
  buf.writeUInt32LE(n, 8);
  return buf;
}

async function main() {
  if (!existsSync(JRIME) || !existsSync(RCANT)) {
    console.warn(
      "[ime:build-lexicons] Skipping: submodule paths missing.\n" +
        `  IME jyutcitzi-RIME: ${JRIME} (exists: ${existsSync(JRIME)})\n` +
        `  IME rime-cantonese: ${RCANT} (exists: ${existsSync(RCANT)})\n` +
        "  Run from monorepo: git submodule update --init --recursive"
    );
    if (process.env.IME_LEXICON_BUILD_REQUIRED === "1") {
      process.exit(1);
    }
    process.exit(0);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  for (const { main, out, name } of PROFILES) {
    console.log(`[ime] Building ${name} from ${main} …`);
    const entries = mergeProfile(main);
    console.log(`[ime] ${name}: ${entries.length} rows`);
    const buf = buildBuffer(entries);
    const outPath = join(OUT_DIR, out);
    const { writeFile } = await import("node:fs/promises");
    await writeFile(outPath, buf);
    console.log(`[ime] wrote ${outPath} (${buf.length} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
