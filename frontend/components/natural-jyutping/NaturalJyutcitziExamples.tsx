import { NATURAL_JYUTCITZI_EXAMPLES } from "@/lib/natural-jyutping/examples";

function ExampleCard({
  honzi,
  jyutping,
  jyutcitzi,
  naturalJyutcitzi,
}: (typeof NATURAL_JYUTCITZI_EXAMPLES)[number]) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-panel/40 p-4 text-center shadow-[0_4px_20px_var(--color-card-shadow)]">
      <div className="space-y-1">
        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted">
          漢字
        </div>
        <div className="text-2xl leading-none text-ink">{honzi}</div>
      </div>

      <div className="font-mono text-sm tabular-nums text-ink-muted">{jyutping}</div>

      <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div className="space-y-1">
          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted">
            粵切字
          </div>
          <div className="text-xl leading-none font-jcz text-ink">{jyutcitzi}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted">
            天然生成粵切字
          </div>
          <div className="text-xl leading-none text-ink">{naturalJyutcitzi}</div>
        </div>
      </div>
    </article>
  );
}

export default function NaturalJyutcitziExamples() {
  return (
    <section aria-label="例子">
      <h2 className="mb-1 text-center text-lg font-semibold text-ink md:text-xl">
        例子
      </h2>
      <p className="mb-5 text-center text-sm text-ink-muted">
        漢字、粵切字同天然生成粵切字對照。
      </p>
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {NATURAL_JYUTCITZI_EXAMPLES.map((example, index) => (
          <li key={index}>
            <ExampleCard {...example} />
          </li>
        ))}
      </ul>
    </section>
  );
}
