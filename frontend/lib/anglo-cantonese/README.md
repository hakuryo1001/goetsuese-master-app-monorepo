# Anglo Cantonese (bundled mapping)

This folder keeps a **vendored copy** of [`mapping.json`](mapping.json) from the canonical Anglo Cantonese / Jyutping→English-style spelling project (`anglo-cantonese-romanization`). The converter logic lives in [`translator.ts`](translator.ts) (browser-only).

## Updating `mapping.json`

1. Edit the mapping in your standalone Anglo Cantonese repository.
2. Copy the refreshed file **into this directory**, replacing `mapping.json`:
   ```bash
   cp /path/to/anglo-cantonese-romanization/mapping.json ./frontend/lib/anglo-cantonese/mapping.json
   ```
3. Commit the snapshot in **this** repo. We intentionally **do not** use a git submodule.

Or run [`scripts/anglo-cantonese/sync-mapping.mjs`](../../scripts/anglo-cantonese/sync-mapping.mjs) with the source path (see script header).

## Tool route

`/tools/anglicanized-romanisation` — live Jyutping → Anglo Cantonese preview using this bundle.
