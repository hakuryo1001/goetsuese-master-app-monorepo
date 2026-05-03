"""HTTP wrapper around jyutcitzi-transliterate (vendor submodule)."""

from __future__ import annotations

import os
import sys
import threading
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

VENDOR_ROOT = (Path(__file__).resolve().parent / "vendor" / "jyutcitzi-transliterate").resolve()
if not VENDOR_ROOT.is_dir():
    raise RuntimeError(f"Missing submodule checkout: {VENDOR_ROOT}")

# Upstream loads mapping.txt and similar at import time relative to cwd.
_prev_cwd = os.getcwd()
os.chdir(VENDOR_ROOT)
sys.path.insert(0, str(VENDOR_ROOT))
try:
    from transliterate import pipe_transliterator  # noqa: E402
finally:
    os.chdir(_prev_cwd)

_vendor_lock = threading.Lock()
MAX_INPUT_CHARS = 50_000


class TransliterateRequest(BaseModel):
    text: str | None = None
    mode: str = "font"
    orthography: str = "jcz_only"
    useRepeatChar: bool = True
    initialRBlock: str = "wl"
    vBlock: str = "f"
    useSchwaChar: bool = True
    toneConfig: str = "vertical"
    algorithm: str = Field(default="PyCantonese", description="PyCantonese or ToJyutping")
    sepEngWords: bool = True
    legacyWebDots: bool = False


class TransliterateResponse(BaseModel):
    translatedText: str


app = FastAPI(title="Jyutcitzi transliteration worker", version="0.1.0")


def _run_transliteration(req: TransliterateRequest) -> str:
    if req.text is None:
        raise ValueError("text is required")
    if len(req.text) > MAX_INPUT_CHARS:
        raise ValueError(f"text exceeds {MAX_INPUT_CHARS} characters")

    with _vendor_lock:
        prev = os.getcwd()
        try:
            os.chdir(VENDOR_ROOT)
            return pipe_transliterator(
                req.text,
                mode=req.mode,
                orthography=req.orthography,
                use_repeat_char=req.useRepeatChar,
                initial_r_block=req.initialRBlock,
                v_block=req.vBlock,
                use_schwa_char=req.useSchwaChar,
                tone_config=req.toneConfig,
                algorithm=req.algorithm,
                sep_eng_words=req.sepEngWords,
                legacy_web_dots=req.legacyWebDots,
            )
        finally:
            os.chdir(prev)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/transliterate", response_model=TransliterateResponse)
def transliterate(req: TransliterateRequest) -> TransliterateResponse:
    try:
        out = _run_transliteration(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="transliteration failed") from e
    return TransliterateResponse(translatedText=out)
