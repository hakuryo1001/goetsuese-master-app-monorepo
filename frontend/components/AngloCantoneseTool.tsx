"use client";

import { useMemo, useState } from "react";

import mappingData from "@/lib/anglo-cantonese/mapping.json";
import {
  angloCantoneseTranslator,
  normalizeMappingPart,
} from "@/lib/anglo-cantonese/translator";
import { FINAL_CODAS, FINAL_ROWS } from "@/lib/jyutcitzi-reform/phonology-data";

const INITIAL_LAYOUT: readonly (readonly string[])[] = [
  ["b", "p", "m", "f"],
  ["d", "t", "n", "l"],
  ["z", "c", "s", "j"],
  ["g", "k", "h", "ng"],
  ["gw", "kw", "w", ""],
];

function buildCanonicalMap(raw: Record<string, unknown>): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(raw)) {
    try {
      const { romanizations, options } = normalizeMappingPart(v as never);
      const recommended = options.find((o) => o.recommended)?.romanization;
      const firstNonEmpty = romanizations.find(Boolean);
      out.set(k, recommended || firstNonEmpty || k);
    } catch {
      out.set(k, k);
    }
  }
  return out;
}

function stripToneFromAngloWhitespacePreserving(raw: string): string {
  const tokens = raw.split(/(\s+)/u);
  return tokens
    .map((token) => {
      if (/^\s+$/u.test(token)) return token;
      return token.replace(/[1-6]$/u, "");
    })
    .join("");
}

/** Live Jyutping → Anglo Cantonese using bundled mapping (browser-only). */
export default function AngloCantoneseTool() {
  const [input, setInput] = useState("baa1 lei6 hou2");
  const [preserveTones, setPreserveTones] = useState(true);
  const initialMap = useMemo(
    () => buildCanonicalMap(mappingData.initials as Record<string, unknown>),
    []
  );
  const finalMap = useMemo(
    () => buildCanonicalMap(mappingData.finals as Record<string, unknown>),
    []
  );

  const output = useMemo(() => {
    const raw = angloCantoneseTranslator.translateJyutpingText(input);
    return preserveTones ? raw : stripToneFromAngloWhitespacePreserving(raw);
  }, [input, preserveTones]);

  const firstSyllable = useMemo(() => {
    const token = input
      .trim()
      .split(/\s+/u)
      .find((t) => t.length > 0);
    return token ?? null;
  }, [input]);

  const rhymeInfo = useMemo(() => {
    if (!firstSyllable) return null;
    try {
      return angloCantoneseTranslator.jyutpingSyllableChoiceInfo(firstSyllable);
    } catch {
      return null;
    }
  }, [firstSyllable]);

  const finalChoice =
    rhymeInfo?.final_variants.find((v) => v.recommended) ??
    rhymeInfo?.final_variants[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-ink accent-ink"
            checked={preserveTones}
            onChange={(e) => setPreserveTones(e.target.checked)}
          />
          Keep tone digits (1–6) on output syllables
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="anglo-jyut-input"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Jyutping
          </label>
          <textarea
            id="anglo-jyut-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={5}
            className="min-h-[8rem] w-full resize-y rounded-md border border-line bg-panel px-3 py-2 text-ink shadow-sm outline-none ring-offset-elevated placeholder:text-ink-muted focus:border-line focus:ring-2 focus:ring-ink/15"
            placeholder="e.g. baa1 lei6 hou2"
          />
          <p className="mt-2 text-xs text-ink-muted">
            Space-separated syllables; conversion runs entirely in your browser using the bundled
            mapping file.
          </p>
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-ink">Anglo Cantonese</span>
          <output
            aria-live="polite"
            htmlFor="anglo-jyut-input"
            className="block min-h-[8rem] whitespace-pre-wrap rounded-md border border-line bg-panel px-3 py-2 text-ink shadow-sm"
          >
            {output || "—"}
          </output>
        </div>
      </div>

      {finalChoice?.approx_english_rhyme_zone || finalChoice?.english_rhymes.length ? (
        <details className="rounded-md border border-line bg-panel px-4 py-3 text-sm text-ink-muted">
          <summary className="cursor-pointer font-medium text-ink">
            English rhyme cues (first syllable: {rhymeInfo?.jyutping ?? "—"})
          </summary>
          <div className="mt-3 space-y-2 border-t border-line pt-3">
            {finalChoice.approx_english_rhyme_zone ? (
              <p>
                <span className="font-medium text-ink">Rough zone: </span>
                {finalChoice.approx_english_rhyme_zone}
              </p>
            ) : null}
            {finalChoice.english_rhymes.length ? (
              <p>
                <span className="font-medium text-ink">Example English rhymes: </span>
                {finalChoice.english_rhymes.join(", ")}
              </p>
            ) : null}
            {finalChoice.notes ? (
              <p>
                <span className="font-medium text-ink">Notes: </span>
                {finalChoice.notes}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}

      <section className="space-y-5 border-t border-line pt-6" aria-label="Anglo reference tables">
        <h2 className="text-lg font-semibold text-ink">
          Anglo Cantonese Reference Tables
        </h2>
        <p className="text-sm text-ink-muted">
          Table layout mirrors the Jyutcitzi phonology chart, but cells show Anglo Cantonese
          romanization strings.
        </p>

        <div className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-ink">Initials</h3>
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[18rem] border-collapse text-center text-sm">
                <tbody>
                  {INITIAL_LAYOUT.map((row, ri) => (
                    <tr key={`i-${ri}`}>
                      {row.map((jp, ci) => {
                        if (!jp) {
                          return (
                            <td key={`empty-${ri}-${ci}`} className="border border-line bg-panel/20 p-2" />
                          );
                        }
                        return (
                          <td key={jp} className="border border-line p-2 align-top">
                            <div className="font-mono text-xs text-ink-muted">{jp}</div>
                            <div className="font-mono text-base text-ink">
                              {initialMap.get(jp) || jp}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <h3 className="text-base font-medium text-ink">Finals</h3>
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-max min-w-full border-collapse text-center text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-[1] border border-line bg-elevated px-2 py-2 text-xs font-semibold text-ink" />
                    {FINAL_CODAS.map((coda) => (
                      <th
                        key={coda}
                        className="border border-line bg-elevated px-3 py-2 font-mono text-xs font-semibold text-ink"
                      >
                        {coda}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FINAL_ROWS.map((row) => (
                    <tr key={row.nucleus}>
                      <th className="sticky left-0 z-[1] border border-line bg-elevated px-2 py-1 text-right font-mono text-xs font-medium text-ink">
                        {row.nucleus}
                      </th>
                      {row.cells.map((cell, idx) => {
                        if (!cell) {
                          return (
                            <td key={`${row.nucleus}-${idx}`} className="border border-line bg-panel/15 p-2" />
                          );
                        }
                        return (
                          <td key={cell.jp} className="border border-line p-2 align-top">
                            <div className="font-mono text-[11px] text-ink-muted">{cell.jp}</div>
                            <div className="font-mono text-sm text-ink">
                              {finalMap.get(cell.jp) || cell.jp}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
