"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8787";

const optionPanel =
  "mb-6 flex w-full flex-wrap gap-x-8 gap-y-4 rounded-lg border border-line bg-panel p-4 shadow-[inset_0_2px_14px_var(--color-panel-shadow)]";

const fieldLabel =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted";

const choiceRow =
  "flex cursor-pointer items-center gap-2 text-sm text-ink hover:text-ink-muted";

export default function InstantChoicefulTranslator() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);

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
        setRequestError(null);
        return;
      }
      try {
        setRequestError(null);
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
        const raw = await response.text();
        let payload: { translatedText?: string; error?: string } = {};
        try {
          payload = raw ? (JSON.parse(raw) as typeof payload) : {};
        } catch {
          payload = {};
        }
        if (!response.ok) {
          const msg =
            payload.error ||
            (response.status === 502
              ? "API 無法連接轉換服務。請在本機啟動 Python worker（uvicorn 8081）及 Rust API（TRANSLIT_SERVICE_URL）。"
              : `請求失敗（${response.status}）`);
          setRequestError(msg);
          setTranslatedText("");
          console.error("Transliterate failed", response.status, raw.slice(0, 500));
          return;
        }
        setTranslatedText(payload.translatedText ?? "");
      } catch (error) {
        setRequestError("網絡錯誤；請確認 API 位址與服務是否已啟動。");
        setTranslatedText("");
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

  const accent = "accent-[var(--color-accent-form)]";

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

      {requestError && (
        <p
          className="mb-4 rounded border border-alert-border bg-alert-bg px-3 py-2 text-sm text-alert-text"
          role="alert"
        >
          {requestError}
        </p>
      )}

      <div className="grid w-full grid-cols-1 gap-6 pb-8 md:grid-cols-2 md:items-start">
        <div className="min-w-0">
          <label className="mb-2 block text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Input
          </label>
          <textarea
            value={inputText}
            className="box-border min-h-[220px] w-full max-w-full resize-y rounded-lg border-2 border-input-border bg-input-bg p-3 font-semibold text-input-ink outline-none transition focus:border-input-border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-input-border-focus"
            onChange={handleInputChange}
            placeholder="Enter text to translate"
            spellCheck={false}
          />
        </div>
        <div className="min-w-0">
          <div className="mb-2 block text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Output
          </div>
          <div
            className="box-border min-h-[220px] w-full max-w-full whitespace-pre-wrap rounded-lg border border-output-border bg-output-bg p-3 font-bold text-output-ink shadow-[inset_0_2px_12px_var(--color-output-shadow)]"
            aria-live="polite"
          >
            {translatedText}
          </div>
        </div>
      </div>
    </div>
  );
}
