#!/usr/bin/env node
/**
 * Copy mapping.json from the canonical anglo-cantonese-romanization repo into frontend/lib.
 *
 * Usage (repository root optional; run from frontend/):
 *   node scripts/anglo-cantonese/sync-mapping.mjs /path/to/anglo-cantonese-romanization/mapping.json
 *
 * Or set ANGLO_MAPPING_JSON to the absolute path of mapping.json, then invoke with no argv.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.join(__dirname, "../../lib/anglo-cantonese/mapping.json");
const SRC = process.argv[2] ?? process.env.ANGLO_MAPPING_JSON ?? "";

function main() {
  if (!SRC) {
    console.error(
      "sync-mapping.mjs: Pass the source mapping.json path as argv[1],\n" +
        " or set env ANGLO_MAPPING_JSON=/absolute/path/to/mapping.json"
    );
    process.exit(1);
  }
  if (!fs.existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(DEST), { recursive: true });
  fs.copyFileSync(SRC, DEST);
  console.log(`Synced → ${DEST}`);
}

main();
