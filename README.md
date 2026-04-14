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

Docker (from repo root):

```bash
docker build -f transliteration/Dockerfile .
```

## Backend (Rust)

```bash
cd backend
export TRANSLIT_SERVICE_URL=http://127.0.0.1:8081
# optional: export MONGODB_URI=...   export CORS_ALLOW_ORIGINS=http://localhost:3000
cargo run
```

Listens on **`0.0.0.0:8787`** by default (`BIND_ADDR`). OpenAPI UI: `http://127.0.0.1:8787/swagger-ui`.

## Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to your Rust origin (e.g. `http://127.0.0.1:8787`).

Deploy the frontend to Vercel with that env var pointing at your hosted API.

### Fonts and styling

The UI uses a black-and-white shell with the same double header/footer bar and community links as the legacy [old-references/jcz-translator-site](old-references/jcz-translator-site). The primary typeface is **`JyutcitziWithSourceHanSerifTCExtraLight.ttf`** from [jyutcitzi-fonts](https://github.com/jyutcitzi/jyutcitzi-fonts), loaded via `next/font/local` in [frontend/app/layout.tsx](frontend/app/layout.tsx) (file lives under `frontend/public/fonts/`).
