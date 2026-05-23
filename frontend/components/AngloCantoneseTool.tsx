"use client";

import { useMemo, useState } from "react";

import { angloCantoneseTranslator } from "@/lib/anglo-cantonese/translator";

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
    </div>
  );
}
