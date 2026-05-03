# Transliteration worker (Python)

Local: see the monorepo [README](../README.md) (Python 3.11, `uvicorn`, Docker Compose).

## Railway

- Set the service **root directory** to `transliteration` so [railway.toml](railway.toml) and the Dockerfile are used.
- The **Dockerfile** clones [cantonese-jyutcitzi/jyutcitzi-transliterate](https://github.com/cantonese-jyutcitzi/jyutcitzi-transliterate) at build time at the SHA pinned in `JYUTCITZI_TRANSLITERATE_SHA` (keep it aligned with `git submodule status transliteration/vendor/jyutcitzi-transliterate` when you bump the submodule).
- Optional dashboard variable: **`RAILWAY_GIT_CLONE_FLAGS=--recursive`** so the uploaded snapshot includes submodule checkouts; not required for a successful build given the clone stage.
