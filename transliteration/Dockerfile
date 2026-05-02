# Build from transliteration/ directory (Railway rootDir: transliteration):
#   docker build transliteration/
# Or from repo root for local dev via docker compose:
#   docker compose up transliteration
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY vendor/jyutcitzi-transliterate ./vendor/jyutcitzi-transliterate

RUN test -d /app/vendor/jyutcitzi-transliterate && \
    [ "$(ls -A /app/vendor/jyutcitzi-transliterate)" ] || \
    (echo "vendor/jyutcitzi-transliterate is missing or empty — ensure vendor files are committed" && exit 1)

ENV PYTHONUNBUFFERED=1
EXPOSE 8081

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8081}"]
