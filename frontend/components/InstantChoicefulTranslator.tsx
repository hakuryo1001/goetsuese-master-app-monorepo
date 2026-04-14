"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8787";

const optionPanel =
  "m-4 flex flex-wrap gap-x-8 gap-y-4 rounded-lg border border-white/10 bg-neutral-950 p-4 shadow-inner shadow-black/60";

const fieldLabel =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400";

const choiceRow =
  "flex cursor-pointer items-center gap-2 text-sm text-white hover:text-neutral-200";

export default function InstantChoicefulTranslator() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const [mode, setMode] = useState("font");
  const [orthography, setOrthography] = useState("jcz_only");
  const [useRepeatChar, setUseRepeatChar] = useState(true);
  const [initialRBlock, setInitialRBlock] = useState("wl");
  const [vBlock, setVBlock] = useState("f");
  const [useSchwaChar, setUseSchwaChar] = useState(true);
  const [toneConfig, setToneConfig] = useState("vertical");

  const fetchTranslation = useCallback(
    async (text: string) => {
      if (!text) {
        setTranslatedText("");
        return;
      }
      try {
        const response = await fetch(`${apiBase}/v1/transliterate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            mode,
            orthography,
            useRepeatChar,
            initialRBlock,
            vBlock,
            useSchwaChar,
            toneConfig,
          }),
        });
        if (!response.ok) {
          console.error("Transliterate failed", response.status);
          return;
        }
        const data: { translatedText?: string } = await response.json();
        setTranslatedText(data.translatedText ?? "");
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [
      mode,
      orthography,
      useRepeatChar,
      initialRBlock,
      vBlock,
      useSchwaChar,
      toneConfig,
    ]
  );

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchTranslation(inputText);
    }, 300);
    return () => clearTimeout(id);
  }, [inputText, fetchTranslation]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const accent = "accent-white";

  return (
    <div className="w-full">
      <div className={optionPanel}>
        <fieldset className="min-w-[8rem] border-0 p-0">
          <legend className={fieldLabel}>Mode</legend>
          <label className={choiceRow}>
            <input
              type="radio"
              value="font"
              checked={mode === "font"}
              onChange={() => setMode("font")}
              className={accent}
            />
            Font
          </label>
          <label className={choiceRow}>
            <input
              type="radio"
              value="web"
              checked={mode === "web"}
              onChange={() => setMode("web")}
              className={accent}
            />
            Web
          </label>
        </fieldset>

        <fieldset className="min-w-[10rem] border-0 p-0">
          <legend className={fieldLabel}>Orthography</legend>
          <label className={choiceRow}>
            <input
              type="radio"
              value="jcz_only"
              checked={orthography === "jcz_only"}
              onChange={() => setOrthography("jcz_only")}
              className={accent}
            />
            Jyutcitzi only
          </label>
          <label className={choiceRow}>
            <input
              type="radio"
              value="honzi_jcz"
              checked={orthography === "honzi_jcz"}
              onChange={() => setOrthography("honzi_jcz")}
              className={accent}
            />
            Mixed
          </label>
        </fieldset>

        <fieldset className="min-w-[6rem] border-0 p-0">
          <legend className={fieldLabel}>Repeat 々</legend>
          <label className={choiceRow}>
            <input
              type="checkbox"
              checked={useRepeatChar}
              onChange={(e) => setUseRepeatChar(e.target.checked)}
              className={accent}
            />
            <span>On</span>
          </label>
        </fieldset>

        <fieldset className="min-w-[9rem] border-0 p-0">
          <legend className={fieldLabel}>Initial R</legend>
          {(
            [
              ["r", "ㄖ R"],
              ["wl", "WL"],
              ["w", "禾 W"],
            ] as const
          ).map(([v, label]) => (
            <label key={v} className={choiceRow}>
              <input
                type="radio"
                name="initialRBlock"
                value={v}
                checked={initialRBlock === v}
                onChange={() => setInitialRBlock(v)}
                className={accent}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <fieldset className="min-w-[5rem] border-0 p-0">
          <legend className={fieldLabel}>V block</legend>
          <label className={choiceRow}>
            <input
              type="radio"
              name="vBlock"
              value="v"
              checked={vBlock === "v"}
              onChange={() => setVBlock("v")}
              className={accent}
            />
            v
          </label>
          <label className={choiceRow}>
            <input
              type="radio"
              name="vBlock"
              value="f"
              checked={vBlock === "f"}
              onChange={() => setVBlock("f")}
              className={accent}
            />
            f
          </label>
        </fieldset>

        <fieldset className="min-w-[6rem] border-0 p-0">
          <legend className={fieldLabel}>Schwa</legend>
          <label className={choiceRow}>
            <input
              type="checkbox"
              checked={useSchwaChar}
              onChange={(e) => setUseSchwaChar(e.target.checked)}
              className={accent}
            />
            <span>亇</span>
          </label>
        </fieldset>

        <fieldset className="min-w-[8rem] border-0 p-0">
          <legend className={fieldLabel}>Tones</legend>
          <label className={choiceRow}>
            <input
              type="radio"
              name="toneConfig"
              value="vertical"
              checked={toneConfig === "vertical"}
              onChange={() => setToneConfig("vertical")}
              className={accent}
            />
            &apos; / &quot;
          </label>
          <label className={choiceRow}>
            <input
              type="radio"
              name="toneConfig"
              value="horizontal"
              checked={toneConfig === "horizontal"}
              onChange={() => setToneConfig("horizontal")}
              className={accent}
            />
            - / =
          </label>
        </fieldset>
      </div>

      <div className="mx-4 flex flex-col items-center justify-center gap-8 pb-12 md:flex-row md:items-start">
        <div className="w-full max-w-[340px] shrink-0">
          <label className="mb-2 block text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Input
          </label>
          <textarea
            value={inputText}
            className="box-border min-h-[220px] w-full resize-y rounded-lg border-2 border-neutral-700 bg-neutral-200 p-3 font-semibold text-black outline-none transition focus:border-white focus:ring-2 focus:ring-white/25"
            onChange={handleInputChange}
            placeholder="Enter text to translate"
            spellCheck={false}
          />
        </div>
        <div className="w-full max-w-[340px] shrink-0">
          <div className="mb-2 block text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Output
          </div>
          <div
            className="box-border min-h-[220px] w-full whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-bold text-white shadow-inner shadow-black/80"
            aria-live="polite"
          >
            {translatedText}
          </div>
        </div>
      </div>
    </div>
  );
}
