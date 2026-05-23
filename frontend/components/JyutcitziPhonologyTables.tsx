import {
  FINAL_CODAS,
  FINAL_ROWS,
  INITIAL_ROWS,
  PHONOLOGY_NOTES,
  type FinalsCell as FinalCellModel,
  type InitialGridCell,
} from "@/lib/jyutcitzi-reform/phonology-data";

function CellIdcStack({
  jp,
  gloss,
  idc,
  asteriskNote,
}: {
  jp: string;
  gloss: string;
  idc: "⿱" | "⿰";
  asteriskNote?: boolean;
}) {
  return (
    <div className="flex min-w-[3.25rem] flex-col items-center gap-0.5 px-2 py-1.5 text-center">
      <span className="font-mono text-[0.8125rem] leading-tight text-ink tabular-nums">
        {jp}
        {asteriskNote ? <sup className="ml-px text-[0.65rem] text-ink">*</sup> : null}
      </span>
      <span className="font-jcz text-base leading-snug tracking-tight text-ink">{gloss}</span>
      <span
        aria-hidden="true"
        className="inline-flex min-h-[1.125rem] min-w-[1.75rem] items-center justify-center rounded border border-dashed border-line px-1 text-[0.7rem] leading-none text-ink-muted"
      >
        {idc}
      </span>
    </div>
  );
}

function renderInitialCell(cell: InitialGridCell, colIdx: number) {
  const keySuffix = `${colIdx}`;
  if (cell === null) {
    return (
      <td
        key={keySuffix}
        className="border border-line bg-panel/20 p-0 align-top"
      />
    );
  }

  if (cell.kind === "initial") {
    return (
      <td key={keySuffix} className="border border-line p-0 align-top">
        <CellIdcStack jp={cell.jyutping} gloss={cell.gloss} idc={cell.idc} />
      </td>
    );
  }

  if (cell.kind === "ng-yao") {
    return (
      <td key={keySuffix} className="border border-line p-0 align-top">
        <div className="flex flex-col items-center gap-1 px-2 py-1.5 text-center">
          <span className="font-mono text-[0.8125rem] leading-tight text-ink">ng</span>
          <span className="inline-flex items-center gap-0.5 rounded border border-dashed border-line px-1 py-0.5 text-[0.7rem] leading-none text-ink-muted">
            ⿰〤〤
            <span className="text-[0.65rem] text-ink">*</span>
          </span>
          <span
            aria-hidden="true"
            className="inline-flex min-w-[1.75rem] items-center justify-center rounded border border-dashed border-line px-1 py-px text-[0.7rem] text-ink-muted"
          >
            {cell.bottomIdc}
          </span>
        </div>
      </td>
    );
  }

  /** plain syllabics */
  const ref =
    cell.ref === "**" ? (
      <sup className="text-[0.6rem] text-ink-muted" title={PHONOLOGY_NOTES.wuVariant}>
        **
      </sup>
    ) : cell.ref === "`" ? (
      <span className="align-super ml-px text-[0.6rem]" aria-label="alternate marker">
        ‵
      </span>
    ) : null;

  return (
    <td key={keySuffix} className="border border-line p-0 align-top">
      <div className="flex flex-col items-center gap-0.5 px-2 py-2 text-center">
        <span className="font-mono text-[0.8125rem] text-ink">{cell.label}</span>
        <span className="font-jcz text-base text-ink">
          {cell.gloss}
          {ref}
        </span>
      </div>
    </td>
  );
}

function renderFinalCell(cell: FinalCellModel | null | undefined, r: number, c: number) {
  const key = `${r}-${c}`;
  if (cell === null || cell === undefined) {
    return (
      <td key={key} className="border border-line bg-panel/15 p-0 align-middle" />
    );
  }

  return (
    <td key={key} className="border border-line p-0 align-top">
      <div className="flex min-w-[3rem] flex-col items-center gap-0.5 px-2 py-1.5 text-center">
        <span className="font-mono text-[0.8125rem] leading-tight text-ink tabular-nums">
          {cell.jp}
          {cell.asteriskNote ? (
            <sup className="ml-px text-[0.65rem] text-ink">*</sup>
          ) : null}
        </span>
        <span className="font-jcz text-base leading-snug tracking-tight text-ink">
          {cell.gloss}
        </span>
      </div>
    </td>
  );
}

/** Side-by-side 聲母 (with IDC) / 韻母 (jyutping + gloss only). */
export default function JyutcitziPhonologyTables() {
  return (
    <div className="flex w-full flex-col gap-10 xl:flex-row xl:items-start xl:gap-6">
      <section className="shrink-0 xl:max-w-md" aria-labelledby="jyutcitzi-ons-title">
        <h2
          id="jyutcitzi-ons-title"
          className="mb-3 text-center text-lg font-semibold text-ink xl:text-left"
        >
          聲母
        </h2>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[16rem] border-collapse border border-line bg-elevated/50 text-sm text-ink">
            <tbody>
              {INITIAL_ROWS.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => renderInitialCell(cell, ci))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-xs leading-snug text-ink-muted">
          <p>* {PHONOLOGY_NOTES.initialsNgYaoStar}</p>
          <p>** {PHONOLOGY_NOTES.wuVariant}</p>
        </div>
      </section>

      <section className="min-w-0 flex-1 overflow-hidden" aria-labelledby="jyutcitzi-rimes-title">
        <h2
          id="jyutcitzi-rimes-title"
          className="mb-3 text-center text-lg font-semibold text-ink xl:text-left"
        >
          韻母
        </h2>
        <div className="rounded-md border border-line">
          <div className="max-w-full overflow-x-auto">
            <table className="w-max min-w-full border-collapse border-0 bg-elevated/50 text-sm text-ink">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-[1] border border-line bg-elevated px-2 py-2 text-xs font-semibold text-ink"
                  />

                  {FINAL_CODAS.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border border-line px-3 py-2 text-center font-mono text-xs font-semibold uppercase text-ink"
                    >
                      {h === "#" ? "#" : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FINAL_ROWS.map((row, ri) => (
                  <tr key={row.nucleus}>
                    <th
                      scope="row"
                      className="sticky left-0 z-[1] border border-line bg-elevated px-2 py-1 text-right font-mono text-xs font-medium text-ink"
                    >
                      {row.nucleus}
                    </th>
                    {row.cells.map((cell, ci) => renderFinalCell(cell, ri, ci))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-xs leading-snug text-ink-muted">* {PHONOLOGY_NOTES.oeFootnoteStar}</p>
      </section>
    </div>
  );
}
