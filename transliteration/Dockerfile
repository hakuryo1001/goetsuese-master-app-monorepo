# Build from repository root:
#   docker build -f transliteration/Dockerfile .
FROM python:3.11-slim

WORKDIR /app

COPY transliteration/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY transliteration/main.py .
COPY transliteration/vendor/jyutcitzi-transliterate /app/vendor/jyutcitzi-transliterate

ENV PYTHONUNBUFFERED=1
EXPOSE 8081

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]
