/**
 * From monorepo root: init submodules, then fast-forward jyutcitzi-RIME to latest origin/main
 * (see .gitmodules branch). rime-cantonese stays at the commit pinned in the parent repo.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, "../../..");

function sh(cmd) {
  const r = spawnSync(cmd, {
    cwd: MONOREPO_ROOT,
    shell: true,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

sh(
  "git submodule update --init submodules/jyutcitzi-RIME submodules/rime-cantonese"
);
sh("git submodule update --remote submodules/jyutcitzi-RIME");
console.log("[ime:update-rime-remote] jyutcitzi-RIME is at latest tracked branch tip.");
