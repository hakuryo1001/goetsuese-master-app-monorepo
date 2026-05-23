# IME lexicon build

Compiles Rime `.dict.yaml` tables (web and font profiles) into static binaries
under `frontend/public/ime/` for the browser-only `/tools/ime` page.

## Prerequisites

From the monorepo root, initialize submodules:

```bash
git submodule update --init --recursive
```

You should have:

- `submodules/jyutcitzi-RIME` — https://github.com/cantonese-jyutcitzi/jyutcitzi-RIME
- `submodules/rime-cantonese` — https://github.com/rime/rime-cantonese

## Optional paths

Override defaults with:

| Variable | Default (relative to monorepo root) |
| -------- | ------------------------------------- |
| `IME_JYUTCITZI_RIME` | `submodules/jyutcitzi-RIME` |
| `IME_RIME_CANTONESE` | `submodules/rime-cantonese` |

## Run

From `frontend/`:

```bash
npm run ime:build-lexicons
```

Produces `public/ime/lexicon-web-v1.bin` and `public/ime/lexicon-font-v1.bin`.

Run **`before `npm run build`** in CI when deploying the IME (large files are
gitignored by default; generate in the build job).

### Always-latest jyutcitzi-RIME (deploy policy)

To match production (Vercel [vercel.json](../../vercel.json)): refresh the
**jyutcitzi-RIME** submodule to the latest `main`, then build lexicons:

```bash
npm run ime:prepare-lexicons
```

(`ime:prepare-lexicons` = `ime:update-rime-remote` + `ime:build-lexicons`.
`rime-cantonese` stays on the SHA pinned in the monorepo after `git submodule update --init`.)

## v1 limitations

- `use_preset_vocabulary` and Rime preset vocabulary are not merged; only
  explicit `import_tables` files are read.
- Speller algebra matches digit-tone Jyutping keys as stored in the dict
  (same string as Rime `code` column); advanced schema transforms are not
  reimplemented in the web IME v1.
