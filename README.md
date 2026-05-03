# Jyutcitzi platform monorepo

Rust (Axum) public API, Python transliteration worker (vendor submodule), and Next.js frontend.

## Clone

```bash
git clone --recurse-submodules <repo-url>
cd jcz-master-app-monorepo
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

The monorepo also includes **git submodules** for the online IME under `submodules/`:

- `submodules/jyutcitzi-RIME` — [cantonese-jyutcitzi/jyutcitzi-RIME](https://github.com/cantonese-jyutcitzi/jyutcitzi-RIME)
- `submodules/rime-cantonese` — [rime/rime-cantonese](https://github.com/rime/rime-cantonese)

The Python transliteration worker uses **[cantonese-jyutcitzi/jyutcitzi-transliterate](https://github.com/cantonese-jyutcitzi/jyutcitzi-transliterate)** as a submodule at `transliteration/vendor/jyutcitzi-transliterate`.

See [NOTICE](NOTICE) for attribution.

**Online IME lexicons:** production builds should use the **latest** [jyutcitzi-RIME](https://github.com/cantonese-jyutcitzi/jyutcitzi-RIME) `main` tip for `submodules/jyutcitzi-RIME` while keeping **rime-cantonese** on the submodule SHA pinned in this repo (reproducible Cantonese core). That means: init submodules, **`git submodule update --remote submodules/jyutcitzi-RIME`**, then compile. Two deploys at the same monorepo commit can produce different `.bin` files if upstream RIME moved—by design.

Local (from `frontend/`):

```bash
npm run ime:prepare-lexicons
npm run build
```

Vercel: [frontend/vercel.json](frontend/vercel.json) pins **Install** (submodule init + update-remote RIME + `npm ci`) and **Build** (`ime:build-lexicons` then `next build`). Ensure the Vercel project checks out **git submodules** (and avoid an overly shallow clone if `update --remote` fails—disable “Shallow clone” or set clone depth as needed).

Details: [frontend/scripts/ime/README.md](frontend/scripts/ime/README.md).

## Transliteration worker (Python)

Requires **Python 3.11** (recommended; 3.13 can hit `pkg_resources` issues with `wordseg`).

```bash
cd transliteration
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8081
```

When the Rust API runs with **`TRANSLIT_MODE=local`** (the default) and **`TRANSLIT_AUTO_SPAWN`** resolves to enabled (see below), it targets **`http://127.0.0.1:8081`** by default and **auto-starts** this worker if `/health` is not already OK—**only when the service URL is loopback** (local uvicorn cannot bind for a remote URL). It prefers **`transliteration/.venv/bin/python`** when that file exists. **`TRANSLIT_PYTHON`** and **`TRANSLIT_DIR`** are read in **`main.rs`** and passed into the spawn helper (no hidden env reads inside spawn).

**`TRANSLIT_AUTO_SPAWN`:** unset → on in `local`, off in `external`; `1|true|yes|on` → on; `0|false|no|off` → off; any other non-empty value → startup error.

Docker worker only (from repo root):

```bash
docker compose up transliteration
```

Image build alone:

```bash
docker build -f transliteration/Dockerfile .
```

## Backend (Rust)

Default is **`TRANSLIT_MODE=local`**: you can run with **no `.env`**:

```bash
cd backend
cargo run
```

Optional: `cp .env.example .env` to pin **`TRANSLIT_MODE=external`** for production-like local tests.

| `TRANSLIT_MODE` | `TRANSLIT_SERVICE_URL` | `CORS_ALLOW_ORIGINS` | Auto-spawn default |
|-----------------|--------------------------|----------------------|-------------------|
| `local` (default) | Optional; empty/missing → `http://127.0.0.1:8081` | Optional; empty/missing → `*` | on (unless `TRANSLIT_AUTO_SPAWN` overrides) |
| `external` | **Required** (trim, non-empty) | **Required** (trim, non-empty; may be `*`) | off |

Listen address resolution (in order):

1. **`BIND_ADDR`** if set and non-empty (e.g. `0.0.0.0:8787`)
2. Else **`PORT`** (e.g. Railway) → `0.0.0.0:{PORT}`
3. Else **`0.0.0.0:8787`**

OpenAPI UI (local): `http://127.0.0.1:8787/swagger-ui`.

## Deploy (Railway + Vercel)

The stack is three deployable units: Next.js frontend, Axum API, and Python transliteration worker. For production, run the **transliteration worker as its own service** (use **`TRANSLIT_MODE=external`** on the API so it does not try to spawn uvicorn on the host).

| Layer | Host | Notes |
| ----- | ---- | ----- |
| Frontend | Vercel | Project root **`frontend/`**; set **`NEXT_PUBLIC_API_BASE_URL`** to the public Rust API URL; set **`NEXT_PUBLIC_SITE_URL`** to the site origin for metadata; IME deploy uses [frontend/vercel.json](frontend/vercel.json) to refresh **jyutcitzi-RIME** to latest `main` before build |
| API | Railway (service 1) | **`TRANSLIT_MODE=external`**, **`TRANSLIT_SERVICE_URL`** (internal worker URL), **`CORS_ALLOW_ORIGINS`**. **`PORT`** is set by Railway when **`BIND_ADDR`** is unset |
| Transliteration | Railway (service 2) | **Docker** with service **root directory** `transliteration` (see [transliteration/railway.toml](transliteration/railway.toml)). The [transliteration/Dockerfile](transliteration/Dockerfile) **clones** [jyutcitzi-transliterate](https://github.com/cantonese-jyutcitzi/jyutcitzi-transliterate) at a pinned SHA so the image builds even when Railway’s snapshot has an **empty submodule** checkout. Optional: set **`RAILWAY_GIT_CLONE_FLAGS=--recursive`** on this service so the snapshot also populates `vendor/jyutcitzi-transliterate` from git (slightly redundant but fine). When you bump the submodule, update the **`JYUTCITZI_TRANSLITERATE_SHA`** default in that Dockerfile (see comment there). |

**Rust API — required when `TRANSLIT_MODE=external`**

| Variable | Purpose |
| -------- | ------- |
| `TRANSLIT_SERVICE_URL` | Base URL of the Python worker (e.g. internal `http://…:8080` between Railway services) |
| `CORS_ALLOW_ORIGINS` | Comma-separated browser origins (e.g. `https://your-app.vercel.app`). `*` only if you explicitly want permissive CORS. |

**Optional**

| Variable | Purpose |
| -------- | ------- |
| `TRANSLIT_MODE` | `local` (default) or `external`. |
| `RAILWAY_GIT_CLONE_FLAGS` | (Transliteration Railway service only, optional.) e.g. `--recursive` so clone includes submodules; Dockerfile clone makes this optional. |
| `TRANSLIT_AUTO_SPAWN` | Overrides default auto-spawn for the mode; invalid non-empty values fail startup. |
| `REQUIRE_TRANSLIT_HEALTH` | `true` / `1` / `yes` / `on` → exit startup if `GET {TRANSLIT_SERVICE_URL}/health` is not successful. |
| `BIND_ADDR`, `PORT`, `RUST_LOG`, `TRANSLIT_PYTHON`, `TRANSLIT_DIR` | Listen / logging / spawn paths (see [backend/src/main.rs](backend/src/main.rs)). |

**Frontend (Vercel)** — set **`NEXT_PUBLIC_API_BASE_URL`** to your public Railway API URL (HTTPS).

## Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to your Rust origin (e.g. `http://127.0.0.1:8787`). For production on Vercel, see **Deploy (Railway + Vercel)** above.

### Fonts and styling

The UI uses a black-and-white shell with the same double header/footer bar and community links as the legacy [old-references/jcz-translator-site](old-references/jcz-translator-site). The primary typeface is **`JyutcitziWithSourceHanSerifTCExtraLight.ttf`** from [jyutcitzi-fonts](https://github.com/jyutcitzi/jyutcitzi-fonts), loaded via `next/font/local` in [frontend/app/layout.tsx](frontend/app/layout.tsx) (file lives under `frontend/public/fonts/`).
