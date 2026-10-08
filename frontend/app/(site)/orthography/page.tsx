import type { Metadata } from "next";
import Link from "next/link";

import GoetsusiojiOrthography from "@/components/goetsusioji/GoetsusiojiOrthography";

export const metadata: Metadata = {
  title: "吳小字書寫系統 · Goetsu orthography",
  description:
    "Goetsu Xiaozi letter atlas and spelling rules: Siauzy PUA glyphs with progenitor-Han teaching spellings. Browser-only reference.",
};

export default function OrthographyPage() {
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

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          吳小字
        </h1>
        <p className="mt-2 text-sm text-ink-muted md:text-base">
          部件總表與拼寫規則
        </p>
      </header>

      <section
        className="mb-12 rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-labelledby="atlas-heading"
      >
        <h2 id="atlas-heading" className="sr-only">
          部件總表
        </h2>
        <GoetsusiojiOrthography section="atlas" />
      </section>

      <section
        className="rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-labelledby="rules-heading"
      >
        <h2 id="rules-heading" className="sr-only">
          拼寫規則與說明
        </h2>
        <GoetsusiojiOrthography section="rules" />
      </section>
    </div>
  );
}
