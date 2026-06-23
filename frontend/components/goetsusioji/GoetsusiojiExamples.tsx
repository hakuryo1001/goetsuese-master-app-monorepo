"use client";

import { useEffect, useState } from "react";

import {
  GoetsusiojiMapper,
  GOETSUSIOJI_EXAMPLES,
  loadGoetsusiojiLexicon,
  loadGoetsusiojiMeta,
} from "@/lib/goetsusioji";

export default function GoetsusiojiExamples() {
  const [rendered, setRendered] = useState<
    Array<{ romanization: string; goetsusioji: string; gloss: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadGoetsusiojiLexicon(), loadGoetsusiojiMeta()])
      .then(([lex, meta]) => {
        if (cancelled) return;
        const mapper = new GoetsusiojiMapper(lex, meta);
        setRendered(
          GOETSUSIOJI_EXAMPLES.map((ex) => ({
            ...ex,
            goetsusioji: mapper.transliterateText(ex.romanization),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setRendered(
            GOETSUSIOJI_EXAMPLES.map((ex) => ({
              ...ex,
              goetsusioji: "…",
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
          <div className="text-sm text-ink-muted">{ex.romanization}</div>
          <div className="mt-1 text-xl leading-none font-jcz text-ink">
            {ex.goetsusioji}
          </div>
          {ex.gloss && (
            <div className="mt-2 text-sm text-ink-muted">{ex.gloss}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
