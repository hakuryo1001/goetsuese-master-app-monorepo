"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  GoetsusiojiMapper,
  GOETSUSIOJI_EXAMPLES,
  loadGoetsusiojiLexicon,
  loadGoetsusiojiMeta,
} from "@/lib/goetsusioji";

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    if (!text || text === "…") return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      disabled={!text || text === "…"}
      aria-label={label}
      className="shrink-0 rounded border border-line bg-elevated px-2 py-0.5 text-xs text-ink-muted hover:bg-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function GoetsusiojiExamples() {
  const [rendered, setRendered] = useState<
    Array<{
      romanization: string;
      siauzy: string;
      han: string;
      gloss: string;
    }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadGoetsusiojiLexicon(), loadGoetsusiojiMeta()])
      .then(([lex, meta]) => {
        if (cancelled) return;
        const mapper = new GoetsusiojiMapper(lex, meta);
        setRendered(
          GOETSUSIOJI_EXAMPLES.map((ex) => ({
            romanization: ex.romanization,
            gloss: ex.gloss,
            siauzy: mapper.transliterateText(ex.romanization, "siauzy"),
            han: mapper.transliterateText(ex.romanization, "han"),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setRendered(
            GOETSUSIOJI_EXAMPLES.map((ex) => ({
              romanization: ex.romanization,
              gloss: ex.gloss,
              siauzy: "…",
              han: "…",
            }))
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
      {rendered.map((ex) => (
        <li
          key={ex.romanization}
          className="rounded-lg border border-line bg-panel p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm text-ink-muted">{ex.romanization}</div>
            <CopyButton
              text={ex.romanization}
              label={`Copy ngven: ${ex.romanization}`}
            />
          </div>
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="text-xl leading-none font-jcz text-ink">
              {ex.siauzy}
            </div>
            <CopyButton
              text={ex.siauzy}
              label={`Copy Siauzy: ${ex.gloss || ex.romanization}`}
            />
          </div>
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="text-base leading-snug font-hana-min text-ink">
              {ex.han}
            </div>
            <CopyButton
              text={ex.han}
              label={`Copy Han spelling: ${ex.gloss || ex.romanization}`}
            />
          </div>
          {ex.gloss && (
            <div className="mt-2 text-sm text-ink-muted">{ex.gloss}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
