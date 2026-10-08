import Image from "next/image";

import {
  CHART_IMAGES,
  CODA_EXAMPLES,
  FINALS_COLS,
  FINALS_GRID,
  INITIALS_ATLAS_GRID,
  MARKS,
  MEDIAL_LABELS,
  MEDIALS,
  SPELLING_RULES,
  TONES,
  type OrthographyComponent,
} from "@/lib/goetsusioji/orthography-data";

function Siauzy({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-goetsusioji leading-none text-ink ${className}`}
    >
      {children}
    </span>
  );
}

function Han({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-hana-min leading-snug text-ink-muted ${className}`}>
      {children}
    </span>
  );
}

function BandLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-medium tracking-wide text-ink-muted">
      {children}
    </h3>
  );
}

function GlyphCell({
  row,
  size = "md",
}: {
  row: OrthographyComponent;
  size?: "sm" | "md" | "lg";
}) {
  const glyphSize =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <span className="font-mono text-[0.65rem] text-ink-faint">{row.roman}</span>
      <Siauzy className={glyphSize}>{row.siauzy}</Siauzy>
      <Han className="text-xs">{row.han}</Han>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section A — silent atlas                                            */
/* ------------------------------------------------------------------ */

function InitialsAtlas() {
  return (
    <div>
      <BandLabel>聲母</BandLabel>
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line">
        {INITIALS_ATLAS_GRID.flatMap((row, ri) =>
          row.map((group, ci) => {
            const key = `init-${ri}-${ci}`;
            if (!group) {
              return (
                <div
                  key={key}
                  className="min-h-[5rem] bg-elevated"
                  aria-hidden
                />
              );
            }
            return (
              <div
                key={key}
                className="flex flex-col bg-elevated p-2 sm:p-3"
              >
                <Han className="mb-1 text-center text-sm text-ink sm:text-base">
                  {group.group}
                </Han>
                <div className="grid grid-cols-3 items-end">
                  {group.slots.map((slot, si) =>
                    slot ? (
                      <GlyphCell
                        key={`${group.group}-${slot.roman}`}
                        row={slot}
                      />
                    ) : (
                      <div key={`${group.group}-empty-${si}`} aria-hidden />
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FinalsAtlas() {
  return (
    <div>
      <BandLabel>韻母</BandLabel>
      <div
        className="grid gap-px overflow-hidden rounded-md border border-line bg-line"
        style={{
          gridTemplateColumns: `repeat(${FINALS_COLS}, minmax(0, 1fr))`,
        }}
      >
        {FINALS_GRID.map((cell, idx) =>
          cell ? (
            <div
              key={`${cell.roman}-${idx}`}
              className="flex flex-col items-center justify-center bg-elevated p-2 sm:p-3"
            >
              <GlyphCell row={cell} size="lg" />
            </div>
          ) : (
            <div
              key={`empty-${idx}`}
              className="min-h-[4.5rem] bg-elevated"
              aria-hidden
            />
          )
        )}
      </div>
    </div>
  );
}

function MedialsMarksAtlas() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <BandLabel>介母</BandLabel>
        <div className="flex flex-wrap gap-px overflow-hidden rounded-md border border-line bg-line">
          {MEDIALS.map((row) => (
            <div
              key={row.roman}
              className="flex min-w-[4.5rem] flex-1 flex-col items-center bg-elevated px-2 py-3"
            >
              <GlyphCell row={row} />
              <span className="mt-1 text-[0.65rem] text-ink-faint">
                {MEDIAL_LABELS[row.roman] ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <BandLabel>聲調 · 標記</BandLabel>
        <div className="flex flex-wrap gap-px overflow-hidden rounded-md border border-line bg-line">
          {TONES.map((tone, i) => (
            <div
              key={`${tone.category}-${tone.mark}-${i}`}
              className="flex min-w-[3.5rem] flex-1 flex-col items-center gap-0.5 bg-elevated px-2 py-3"
            >
              <span className="font-hana-min text-xs text-ink">
                {tone.category}
              </span>
              <span className="font-mono text-[0.65rem] text-ink-faint">
                {tone.mark}
              </span>
              {tone.siauzy ? (
                <Siauzy className="text-2xl">{tone.siauzy}</Siauzy>
              ) : (
                <span className="text-xl leading-none text-ink">{tone.symbol}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-px overflow-hidden rounded-md border border-line bg-line">
          {MARKS.map((row) => (
            <div
              key={`mark-${row.roman}`}
              className="flex min-w-[3.5rem] flex-1 flex-col items-center bg-elevated px-2 py-2"
            >
              <GlyphCell row={row} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AtlasSection() {
  return (
    <div className="space-y-10" aria-label="吳小字部件總表">
      <InitialsAtlas />
      <FinalsAtlas />
      <MedialsMarksAtlas />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section B — elaboration                                             */
/* ------------------------------------------------------------------ */

function ChartFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <details className="rounded-md border border-line bg-panel/40">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm text-ink-muted hover:text-ink">
        {caption}（點擊展開原圖）
      </summary>
      <div className="border-t border-line bg-elevated p-2">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={900}
          className="h-auto w-full rounded"
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>
    </details>
  );
}

function RulesSection() {
  return (
    <div className="space-y-10" aria-label="拼寫規則與說明">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          書寫系統
        </h2>
        <div className="grid gap-4 text-sm leading-relaxed text-ink-muted md:grid-cols-2 md:text-base">
          <div className="space-y-3">
            <p>
              吳小字是音素文字，由上下部件拼合而成：聲母、韻母（含介母）與聲調符號。通常文句中因連續變調，多只標變調而不標本調。
            </p>
            <p>
              聲母基形{" "}
              <strong className="font-semibold text-ink">16</strong>{" "}
              個，清一色。右上加「゜／ﾟ」表送氣（或響音陰調）；加「゛／ﾞ」表全濁。
              <strong className="font-semibold text-ink"> l、m、n、ny、ng </strong>
              預設為濁（陽）；加半濁符表清（陰）。共{" "}
              <strong className="font-semibold text-ink">33（+5）</strong>{" "}
              個聲母符號。
            </p>
            <p>
              基本韻母{" "}
              <strong className="font-semibold text-ink">24</strong>{" "}
              個，韻尾{" "}
              <strong className="font-semibold text-ink">2</strong>{" "}
              個（く -q、レ -n），另有外來韻尾{" "}
              <strong className="font-semibold text-ink">r</strong>，合計 27。
            </p>
          </div>
          <p lang="en" className="text-ink-faint">
            Goetsu Xiaozi is a phonemic script of stacked components (initial +
            final/medial + optional tone). Sixteen voiceless bases; ゜ marks
            aspiration or yin sonorants; ゛ marks full voicing. Running text
            usually marks sandhi, not citation tone.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          兩種寫法
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-line bg-panel/40 p-4">
            <h3 className="font-semibold text-ink">Siauzy · 小字</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              字體內正規字形（Private Use Area）。聲母在上、韻母在下；有介母時頭塊為聲母疊介母，韻母在旁。從不使用 CSS 疊字冒充。
            </p>
          </div>
          <div className="rounded-md border border-line bg-panel/40 p-4">
            <h3 className="font-semibold text-ink">Han · 祖形漢字</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              將部件還原為祖形漢字、按書寫次序串起的教學拼寫（如 keq → 工出）。與詞義無關。目前 simplified 欄與 han 相同。
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          拼寫規則
        </h2>
        <ol className="list-none space-y-5">
          {SPELLING_RULES.map((rule) => (
            <li
              key={rule.id}
              className="rounded-lg border border-line bg-panel/40 p-4 md:p-5"
            >
              <h3 className="text-base font-semibold text-ink md:text-lg">
                {rule.id}. {rule.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {rule.wording}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-ink-faint">
                    {rule.example.roman}
                  </span>
                  <Han className="text-sm text-ink">{rule.example.hanzi}</Han>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Siauzy className="text-4xl">{rule.siauzy}</Siauzy>
                  <span className="text-[0.65rem] text-ink-faint">Siauzy</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Han className="text-xl text-ink">{rule.han}</Han>
                  <span className="text-[0.65rem] text-ink-faint">Han</span>
                </div>
              </div>
              {rule.extras ? (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                  {rule.extras.map((ex) => (
                    <li key={ex.roman}>
                      <span className="font-mono">{ex.roman}</span>{" "}
                      <Han>{ex.han}</Han>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-muted">
          韻尾後加例：
          {CODA_EXAMPLES.map((ex, i) => (
            <span
              key={ex.roman}
              className="ml-2 inline-flex items-baseline gap-1.5"
            >
              {i > 0 ? <span aria-hidden>·</span> : null}
              <span className="font-mono">{ex.roman}</span>
              {ex.siauzy ? (
                <Siauzy className="text-lg">{ex.siauzy}</Siauzy>
              ) : null}
              <Han>（{ex.han}）</Han>
            </span>
          ))}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          圖表與祖形差異
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted md:text-base">
          <li>
            空韻 <span className="font-mono">y</span>：圖表常標「私」，祖形拼寫用「厶」。
          </li>
          <li>
            擦音 <span className="font-mono">f / s / sh</span> 與{" "}
            <span className="font-mono">h</span>
            ：圖表字形上常畫「゜」，祖形教學層可不標（弗／式／兴／奧ﾟ）。
          </li>
          <li>
            韻尾後加：如 <span className="font-mono">aoq</span>、
            <span className="font-mono">iuq</span>
            ，以旁加く表述。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          原圖對照
        </h2>
        <div className="space-y-2">
          <ChartFigure
            src={CHART_IMAGES.initials}
            alt="吳小字聲母表原圖"
            caption="Chart 1 · 聲母表"
          />
          <ChartFigure
            src={CHART_IMAGES.finals}
            alt="吳小字韻母表原圖"
            caption="Chart 2 · 韻母表"
          />
          <ChartFigure
            src={CHART_IMAGES.medialsTonesRules}
            alt="吳小字介母、聲調與拼寫規則原圖"
            caption="Chart 3 · 介母 · 聲調 · 拼寫規則"
          />
        </div>
      </section>
    </div>
  );
}

export default function GoetsusiojiOrthography({
  section,
}: {
  section: "atlas" | "rules";
}) {
  return section === "atlas" ? <AtlasSection /> : <RulesSection />;
}
