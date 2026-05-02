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

## Transliteration worker (Python)

Requires **Python 3.11** (recommended; 3.13 can hit `pkg_resources` issues with `wordseg`).

```bash
cd transliteration
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8081
```

When **`TRANSLIT_SERVICE_URL` points at loopback** (`127.0.0.1`, `localhost`, or `[::1]`), the Rust API **auto-starts** this worker on startup if `/health` is not already OK. It prefers **`transliteration/.venv/bin/python`** when that file exists (so plain `python3` on your PATH is not used by mistake). Otherwise set **`TRANSLIT_PYTHON`** to a venv interpreter that has `pip install -r requirements.txt` applied. Disable auto-start with `TRANSLIT_AUTO_SPAWN=false` when the worker is a separate container. **`TRANSLIT_DIR`** overrides the `transliteration/` path.

Docker worker only (from repo root):

```bash
docker compose up transliteration
```

Image build alone:

```bash
docker build -f transliteration/Dockerfile .
```

## Backend (Rust)

```bash
cd backend
export TRANSLIT_SERVICE_URL=http://127.0.0.1:8081
# optional: export CORS_ALLOW_ORIGINS=http://localhost:3000
# optional: TRANSLIT_AUTO_SPAWN=false   TRANSLIT_PYTHON=/path/to/python3.11
cargo run
```

Listen address resolution (in order):

1. **`BIND_ADDR`** if set and non-empty (e.g. `0.0.0.0:8787`)
2. Else **`PORT`** (e.g. Railway) → `0.0.0.0:{PORT}`
3. Else **`0.0.0.0:8787`**

OpenAPI UI (local): `http://127.0.0.1:8787/swagger-ui`.

## Deploy (Railway + Vercel)

The stack is three deployable units: Next.js frontend, Axum API, and Python transliteration worker. For production, run the **transliteration worker as its own service** (not auto-spawned from Rust).

| Layer | Host | Notes |
| ----- | ---- | ----- |
| Frontend | Vercel | Project root **`frontend/`**; set **`NEXT_PUBLIC_API_BASE_URL`** to the public Rust API URL; set **`NEXT_PUBLIC_SITE_URL`** to the site origin for metadata |
| API | Railway (service 1) | **`PORT`** is honored when **`BIND_ADDR`** is unset; optional **`CORS_ALLOW_ORIGINS`** |
| Transliteration | Railway (service 2) | **Docker** from repo root: `docker build -f transliteration/Dockerfile .`; enable **git submodules** so `transliteration/vendor/jyutcitzi-transliterate` exists at build time |

**Rust API (production) — recommended variables**

| Variable | Purpose |
| -------- | ------- |
| `TRANSLIT_SERVICE_URL` | Base URL of the Python worker (e.g. internal `http://…:8081` between Railway services) |
| `TRANSLIT_AUTO_SPAWN` | Set to **`false`** so the API never spawns uvicorn or relies on compile-time paths on the host |
| `REQUIRE_TRANSLIT_HEALTH` | Optional: set to **`true`** to exit startup if `GET {TRANSLIT_SERVICE_URL}/health` is not successful (fail fast on misconfiguration) |

Compile-time paths under [backend/src/translit_spawn.rs](backend/src/translit_spawn.rs) (e.g. `CARGO_MANIFEST_DIR` → `../transliteration`) apply only to **auto-spawn**; with **`TRANSLIT_AUTO_SPAWN=false`** they are not used for locating the worker at runtime.

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
