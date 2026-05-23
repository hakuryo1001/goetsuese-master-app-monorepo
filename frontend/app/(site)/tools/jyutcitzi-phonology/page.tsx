import Link from "next/link";

import JyutcitziPhonologyTables from "@/components/JyutcitziPhonologyTables";

export const metadata = {
  title: "粵切字改革方案 · 聲母韻母表",
  description:
    "粵切字改革方案聲母（附 IDC）、韻母對照網格；附 fan1–fan6 補充聲調區位符。Initials plus finals grids and supplementary tone glyphs (private-use Unicode).",
};

export default function JyutcitziPhonologyPage() {
  return (
    <div className="w-full font-jcz">
      <nav className="mb-6 text-center">
        <Link
          href="/"
          className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← 返回主頁
        </Link>
      </nav>

      <header className="mb-6 rounded-lg border border-line bg-elevated p-5 md:p-7">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          粵切字改革方案 · 聲母與韻母
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-muted md:text-base">
          <strong className="font-medium text-ink">聲母</strong>
          ：每個格嘅排列順序為粵拼音節寫法 → 參照字／部件 →{' '}
          <span className="text-ink">IDC</span>（⿱／⿰）示意安放方位。
          <span className="mx-1 text-line">｜</span>
          <strong className="font-medium text-ink">韻母</strong>
          ：只標粵拼音節同參照字，唔加 IDC。
          版面自 <strong className="text-ink lg:hidden">細螢縱列</strong>
          <span className="hidden lg:inline"> <strong className="text-ink">lg</strong> 開度起</span>
          ，聲母同韻母會橫排並列；下面是 <strong className="font-medium text-ink">聲調補充</strong>
          （
          <span className="font-mono text-ink">fan1–fan6</span>
          專區位符號）。
        </p>
      </header>

      <section
        className="rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-label="聲母韻母對照表"
      >
        <JyutcitziPhonologyTables />
      </section>
    </div>
  );
}
