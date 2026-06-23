import type { Metadata } from "next";
import Link from "next/link";

import GoetsusiojiIme from "@/components/ime/GoetsusiojiIme";
import GoetsusiojiExamples from "@/components/goetsusioji/GoetsusiojiExamples";

export const metadata: Metadata = {
  title: "Goetsusioji Typer · ngven 輸入",
  description:
    "Browser-only Goetsusioji typer: ngven romanization composition, glyph candidates, commit. No server transliteration.",
};

export default function GoetsusiojiTyperPage() {
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
      <header className="mb-6 rounded-lg border border-line bg-elevated p-5">
        <h1 className="text-center text-3xl font-semibold text-ink md:text-4xl">
          Goetsusioji 輸入
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          用 ngven 羅馬字搵吳小字候選、選字上屏；瀏覽器內完成，唔經伺服器。
        </p>
      </header>

      <section
        className="mb-6 rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-label="Goetsusioji examples"
      >
        <GoetsusiojiExamples />
      </section>

      <section
        className="rounded-lg border border-line bg-elevated p-3 md:p-6"
        aria-label="Goetsusioji input"
      >
        <GoetsusiojiIme />
      </section>
    </div>
  );
}
