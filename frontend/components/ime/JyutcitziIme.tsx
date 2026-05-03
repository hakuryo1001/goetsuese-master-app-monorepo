"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { decodeLexicon, type LexEntry } from "@/lib/ime/decodeLexicon";
import { prefixCandidates } from "@/lib/ime/lookup";
import {
  IME_PROFILE_STORAGE_KEY,
  LEXICON_URL,
  type ImeProfile,
} from "@/lib/ime/profile";

const MAX_CANDIDATES = 50;
const PAGE_SIZE = 9;

const JYUTPING_KEY = /^[a-z0-9]$/i;

const lexCache: Partial<Record<ImeProfile, LexEntry[]>> = {};

async function loadLexicon(profile: ImeProfile): Promise<LexEntry[]> {
  if (lexCache[profile]) return lexCache[profile]!;
  const url = LEXICON_URL[profile];
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(
      `Could not load ${url} (${res.status}). Run \`npm run ime:build-lexicons\` in frontend/.`
    );
  }
  const buf = await res.arrayBuffer();
  const entries = decodeLexicon(buf);
  lexCache[profile] = entries;
  return entries;
}

export default function JyutcitziIme() {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [committed, setCommitted] = useState("");
  const [profile, setProfile] = useState<ImeProfile>("font");
  const [buffer, setBuffer] = useState("");
  const [entries, setEntries] = useState<LexEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [candidateOffset, setCandidateOffset] = useState(0);
  /** When true, key events are not intercepted so the system IME can compose in the textarea. */
  const [passthrough, setPassthrough] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(IME_PROFILE_STORAGE_KEY);
      if (raw === "web" || raw === "font") setProfile(raw);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(IME_PROFILE_STORAGE_KEY, profile);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setEntries(null);
    loadLexicon(profile)
      .then((e) => {
        if (!cancelled) setEntries(e);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const candidates = useMemo(() => {
    if (!entries || !buffer) return [];
    return prefixCandidates(entries, buffer, MAX_CANDIDATES);
  }, [entries, buffer]);

  const page = useMemo(
    () => candidates.slice(candidateOffset, candidateOffset + PAGE_SIZE),
    [candidates, candidateOffset]
  );

  useEffect(() => {
    setCandidateOffset(0);
  }, [buffer, profile]);

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

  const commitEntry = useCallback(
    (e: LexEntry) => {
      commitText(e.text);
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
          commitEntry(candidates[0]);
          return;
        }
        if (ev.key === "Enter" && candidates.length > 0) {
          ev.preventDefault();
          commitEntry(candidates[0]);
          return;
        }
        const d = ev.key;
        if (/^[1-9]$/.test(d) && candidates.length > 0) {
          const idx = parseInt(d, 10) - 1;
          if (idx >= 0 && idx < page.length) {
            ev.preventDefault();
            commitEntry(page[idx]);
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
    [passthrough, buffer, candidates, candidateOffset, commitEntry, page]
  );

  const clearBuffer = () => setBuffer("");

  const profileClass =
    profile === "font" ? "font-jcz" : "font-mono text-[15px] leading-relaxed";

  return (
    <div className={`w-full space-y-4 ${profileClass}`}>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-panel p-4">
        <fieldset className="border-0 p-0">
          <legend className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Output profile
          </legend>
          <div className="flex gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="ime-profile"
                checked={profile === "font"}
                onChange={() => setProfile("font")}
              />
              Font
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="ime-profile"
                checked={profile === "web"}
                onChange={() => setProfile("web")}
              />
              Web
            </label>
          </div>
        </fieldset>
        <button
          type="button"
          className="rounded border border-line bg-elevated px-3 py-1.5 text-sm text-ink hover:bg-muted"
          onClick={clearBuffer}
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
            ? "… (paused — use Esc or the button to resume Jyutcitzi)"
            : buffer || "…"}
        </div>
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <label
            htmlFor="jyutcitzi-ime-committed"
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
            {passthrough ? "Plain typing (system IME)" : "Jyutcitzi"}
          </span>
          <button
            type="button"
            className="rounded border border-line bg-elevated px-2 py-0.5 text-xs text-ink hover:bg-muted"
            onClick={togglePassthrough}
            aria-pressed={passthrough}
            aria-label={
              passthrough
                ? "Switch to Jyutcitzi typing in this field"
                : "Switch to plain typing for system keyboard IME"
            }
          >
            {passthrough ? "Use Jyutcitzi" : "Use system IME"}
          </button>
        </div>
        <textarea
          id="jyutcitzi-ime-committed"
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
            <li key={`${candidateOffset + i}-${c.code}-${c.text}`}>
              <span className="text-ink-muted">{c.code}</span> → {c.text}
            </li>
          ))}
        </ol>
        {candidates.length === 0 && buffer && (
          <p className="text-sm text-ink-muted">No matches.</p>
        )}
      </div>

      <p className="text-sm text-ink-muted">
        <strong className="font-semibold text-ink">Esc</strong> clears 粵拼; when
        the buffer is empty, <strong className="font-semibold text-ink">Esc</strong>{" "}
        toggles <strong className="font-semibold text-ink">plain typing</strong> so
        your system IME can enter 汉字 in the box below.{" "}
        <strong className="font-semibold text-ink">Esc</strong> again resumes
        Jyutcitzi. Browser-only IME: no server calls. Lexicons are compiled from{" "}
        <a
          className="underline"
          href="https://github.com/cantonese-jyutcitzi/jyutcitzi-RIME"
          target="_blank"
          rel="noreferrer"
        >
          jyutcitzi-RIME
        </a>{" "}
        and{" "}
        <a
          className="underline"
          href="https://github.com/rime/rime-cantonese"
          target="_blank"
          rel="noreferrer"
        >
          rime-cantonese
        </a>
        . See repository <code className="rounded bg-muted px-1">NOTICE</code> and{" "}
        <code className="rounded bg-muted px-1">frontend/scripts/ime/README.md</code>.
      </p>
    </div>
  );
}
