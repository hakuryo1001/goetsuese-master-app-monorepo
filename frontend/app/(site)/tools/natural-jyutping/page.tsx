import type { Metadata } from "next";
import Link from "next/link";

import NaturalJyutpingIme from "@/components/ime/NaturalJyutpingIme";
import NaturalJyutcitziExamples from "@/components/natural-jyutping/NaturalJyutcitziExamples";
import { babelStoneHan } from "@/lib/fonts/babel-stone-han";
import { hanaMinA, hanaMinB } from "@/lib/fonts/hana-min";

export const metadata: Metadata = {
  title: "天然生成粵切字 · Natural Jyutping Typer",
  description:
    "Browser-only natural Jyutcitzi typer: Jyutping composition, glyph candidates, commit. No server transliteration.",
};

export default function NaturalJyutpingToolPage() {
  return (
    <div
      className={`w-full font-natural-jyutcitzi ${hanaMinA.variable} ${hanaMinB.variable} ${babelStoneHan.variable}`}
    >
      <nav className="mb-6 text-center">
        <Link
          href="/"
          className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← 返回主頁
        </Link>
      </nav>
      <header className="mb-6 rounded-lg border border-line bg-elevated p-5">
        <h1 className="text-center text-3xl font-semibold text-ink md:text-4xl">
          天然生成粵切字
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          用粵拼搵自然粵切字候選、選字上屏；瀏覽器內完成，唔經伺服器。
        </p>
      </header>

      <section
        className="mb-6 rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-label="天然生成粵切字例子"
      >
        <NaturalJyutcitziExamples />
      </section>

      <section
        className="rounded-lg border border-line bg-elevated p-3 md:p-6"
        aria-label="天然粵切字輸入"
      >
        <NaturalJyutpingIme />
      </section>
    </div>
  );
}
