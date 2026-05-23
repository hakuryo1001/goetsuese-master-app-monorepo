# Build from transliteration/ directory (Railway rootDir: transliteration):
#   docker build transliteration/
# Or from repo root for local dev via docker compose:
#   docker compose up transliteration
#
# Vendor code is fetched in a clone stage so deploys work when the build
# snapshot has an empty submodule dir (e.g. Railway without recursive clone).
# Bump JYUTCITZI_TRANSLITERATE_SHA when you bump the git submodule in the monorepo.

FROM debian:bookworm-slim AS vendor
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG JYUTCITZI_TRANSLITERATE_REPO=https://github.com/cantonese-jyutcitzi/jyutcitzi-transliterate.git
# Sync with: git submodule status transliteration/vendor/jyutcitzi-transliterate
ARG JYUTCITZI_TRANSLITERATE_SHA=eddb03edad4f459e7a30a7acf808f8bb7a134fe5

WORKDIR /tmp
RUN git init jyutcitzi-transliterate \
  && cd jyutcitzi-transliterate \
  && git remote add origin "${JYUTCITZI_TRANSLITERATE_REPO}" \
  && git fetch --depth 1 origin "${JYUTCITZI_TRANSLITERATE_SHA}" \
  && git checkout FETCH_HEAD \
  && rm -rf .git

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY --from=vendor /tmp/jyutcitzi-transliterate ./vendor/jyutcitzi-transliterate

RUN test -d /app/vendor/jyutcitzi-transliterate && \
    [ "$(ls -A /app/vendor/jyutcitzi-transliterate)" ] || \
    (echo "vendor/jyutcitzi-transliterate is missing or empty after vendor stage" && exit 1)

ENV PYTHONUNBUFFERED=1
EXPOSE 8081

# Use 0.0.0.0 (IPv4): Railway's healthcheck connects via IPv4; --host :: can leave
# the server unreachable and healthchecks failing with "service unavailable."
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8081}"]
