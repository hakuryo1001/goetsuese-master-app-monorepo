"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  isKnownSyllable,
  loadNaturalLexicon,
  prefixCandidates,
  type NaturalCandidate,
  type NaturalLexicon,
} from "@/lib/natural-jyutping";

const MAX_CANDIDATES = 50;
const PAGE_SIZE = 9;

const JYUTPING_KEY = /^[a-z0-9]$/i;

let lexCache: NaturalLexicon | null = null;

async function loadLexicon(): Promise<NaturalLexicon> {
  if (lexCache) return lexCache;
  lexCache = await loadNaturalLexicon();
  return lexCache;
}

export default function NaturalJyutpingIme() {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [committed, setCommitted] = useState("");
  const [buffer, setBuffer] = useState("");
  const [lexicon, setLexicon] = useState<NaturalLexicon | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [candidateOffset, setCandidateOffset] = useState(0);
  const [passthrough, setPassthrough] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setLexicon(null);
    loadLexicon()
      .then((lex) => {
        if (!cancelled) setLexicon(lex);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const candidates = useMemo(() => {
    if (!lexicon || !buffer) return [];
    return prefixCandidates(lexicon, buffer, MAX_CANDIDATES);
  }, [lexicon, buffer]);

  const page = useMemo(
    () => candidates.slice(candidateOffset, candidateOffset + PAGE_SIZE),
    [candidates, candidateOffset]
  );

  useEffect(() => {
    setCandidateOffset(0);
  }, [buffer]);

  const commitText = useCallback((text: string) => {
    const ta = taRef.current;
    if (!ta) {
      setCommitted((v) => v + text);
      return;
    }
    const start = ta.selectionStart ?? committed.length;
    const end = ta.selectionEnd ?? committed.length;
    const before = committed.slice(0, start);
    const after = committed.slice(end);
    const next = before + text + after;
    const caret = start + text.length;
    setCommitted(next);
    requestAnimationFrame(() => {
      ta.setSelectionRange(caret, caret);
    });
  }, [committed]);

  const commitCandidate = useCallback(
    (c: NaturalCandidate) => {
      commitText(c.glyph);
      setBuffer("");
    },
    [commitText]
  );

  const togglePassthrough = useCallback(() => {
    setBuffer("");
    setPassthrough((p) => !p);
  }, []);

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent<HTMLTextAreaElement>) => {
      if (passthrough) {
        if (ev.key === "Escape") {
          ev.preventDefault();
          setPassthrough(false);
          setBuffer("");
        }
        return;
      }

      if (ev.key === "Escape") {
        ev.preventDefault();
        if (buffer) setBuffer("");
        else setPassthrough(true);
        return;
      }

      if (ev.key === "Backspace") {
        if (buffer.length > 0) {
          ev.preventDefault();
          setBuffer((b) => b.slice(0, -1));
        }
        return;
      }

      if (buffer.length > 0) {
        if (ev.key === " " && candidates.length > 0) {
          ev.preventDefault();
          commitCandidate(candidates[0]);
          return;
        }
        if (ev.key === "Enter" && candidates.length > 0) {
          ev.preventDefault();
          commitCandidate(candidates[0]);
          return;
        }
        const d = ev.key;
        if (/^[1-9]$/.test(d) && candidates.length > 0) {
          const idx = parseInt(d, 10) - 1;
          if (idx >= 0 && idx < page.length) {
            ev.preventDefault();
            commitCandidate(page[idx]);
            return;
          }
        }
        if (ev.key === "ArrowDown" && candidateOffset + PAGE_SIZE < candidates.length) {
          ev.preventDefault();
          setCandidateOffset((o) => o + PAGE_SIZE);
          return;
        }
        if (ev.key === "ArrowUp" && candidateOffset > 0) {
          ev.preventDefault();
          setCandidateOffset((o) => Math.max(0, o - PAGE_SIZE));
          return;
        }
      }

      if (JYUTPING_KEY.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        setBuffer((b) => b + ev.key.toLowerCase());
        return;
      }
    },
    [passthrough, buffer, candidates, candidateOffset, commitCandidate, page]
  );

  const emptyMessage = useMemo(() => {
    if (!buffer || !lexicon) return null;
    if (candidates.length > 0) return null;
    if (isKnownSyllable(lexicon, buffer)) {
      return "Known syllable — no glyphs filled yet.";
    }
    return "No matching syllable.";
  }, [buffer, lexicon, candidates.length]);

  return (
    <div className="w-full space-y-4 font-jcz">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-panel p-4">
        {lexicon && (
          <p className="text-sm text-ink-muted">
            {lexicon.filledCount} / {lexicon.keys.length} syllables with glyphs
          </p>
        )}
        <button
          type="button"
          className="rounded border border-line bg-elevated px-3 py-1.5 text-sm text-ink hover:bg-muted"
          onClick={() => setBuffer("")}
        >
          Clear buffer
        </button>
      </div>

      {loadError && (
        <p className="rounded border border-alert-border bg-alert-bg px-3 py-2 text-sm text-alert-text">
          {loadError}
        </p>
      )}

      <div className="rounded-lg border border-line bg-elevated p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Composition (粵拼)
        </div>
        <div
          className={`min-h-[2rem] rounded border border-input-border bg-input-bg px-3 py-2 font-semibold ${
            passthrough ? "text-ink-muted" : "text-input-ink"
          }`}
        >
          {passthrough
            ? "… (paused — use Esc or the button to resume)"
            : buffer || "…"}
        </div>
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <label
            htmlFor="natural-jyutping-ime-committed"
            className="text-xs font-semibold uppercase tracking-wide text-ink-muted"
          >
            Committed text
          </label>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              passthrough
                ? "border border-line bg-muted text-ink"
                : "border border-line bg-elevated text-ink"
            }`}
          >
            {passthrough ? "Plain typing (system IME)" : "Natural Jyutcitzi"}
          </span>
          <button
            type="button"
            className="rounded border border-line bg-elevated px-2 py-0.5 text-xs text-ink hover:bg-muted"
            onClick={togglePassthrough}
            aria-pressed={passthrough}
            aria-label={
              passthrough
                ? "Switch to natural Jyutping typing in this field"
                : "Switch to plain typing for system keyboard IME"
            }
          >
            {passthrough ? "Use natural Jyutping" : "Use system IME"}
          </button>
        </div>
        <textarea
          id="natural-jyutping-ime-committed"
          ref={taRef}
          rows={10}
          value={committed}
          onChange={(e) => setCommitted(e.target.value)}
          className="box-border w-full resize-y rounded-lg border-2 border-input-border bg-input-bg p-3 font-semibold text-input-ink outline-none focus:border-input-border-focus"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          placeholder={
            passthrough
              ? "Type here with your Mac input source (Pinyin, Jyutping, …)."
              : "Focus here and type Jyutping (e.g. baa1). Esc clears 粵拼; when empty, Esc enables plain typing…"
          }
        />
      </div>

      <div className="rounded-lg border border-line bg-elevated p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Candidates (1–9 select · Space / Enter first · ↑↓ page)
          {passthrough && (
            <span className="block font-normal normal-case text-ink-muted">
              — inactive in plain typing mode
            </span>
          )}
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {page.map((c, i) => (
            <li key={`${candidateOffset + i}-${c.syllable}-${c.glyph}-${c.index}`}>
              <span className="text-ink-muted">{c.syllable}</span> → {c.glyph}
            </li>
          ))}
        </ol>
        {emptyMessage && (
          <p className="text-sm text-ink-muted">{emptyMessage}</p>
        )}
      </div>

      <p className="text-sm text-ink-muted">
        Browser-only: type 粵拼, pick natural reform glyphs, commit to the box.
        Tone digits are ignored for lookup. For IDC-encoded 粵切字 input see{" "}
        <a className="underline" href="/tools/ime">
          粵切字網上輸入
        </a>
        .
      </p>
    </div>
  );
}
