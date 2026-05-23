import Link from "next/link";

import InstantChoicefulTranslator from "@/components/InstantChoicefulTranslator";

export const metadata = {
  title: "粵切字轉換 · Han & Jyutping transliterator",
  description:
    "Live Cantonese transliteration: convert 漢字 or Jyutping to Jyutcitzi with tone and orthography options. 即時粵切字轉換。",
};

export default function TransliterateToolPage() {
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
          粵切字轉換
        </h1>
      </header>

      <section
        className="rounded-lg border border-line bg-elevated p-3 md:p-6"
        aria-label="轉換器"
      >
        <InstantChoicefulTranslator />
      </section>
    </div>
  );
}
