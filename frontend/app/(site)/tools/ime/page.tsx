import type { Metadata } from "next";
import Link from "next/link";

import JyutcitziIme from "@/components/ime/JyutcitziIme";

export const metadata: Metadata = {
  title: "粵切字網上輸入 · Online Jyutcitzi IME",
  description:
    "Browser-only Jyutcitzi IME (web or font profile): Jyutping composition, candidates, commit. No server transliteration.",
};

export default function ImeToolPage() {
  return (
    <div className="w-full">
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
          粵切字網上輸入
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          瀏覽器內輸入（不經伺服器）；與「轉換器」係分開嘅產品。
        </p>
      </header>

      <section
        className="rounded-lg border border-line bg-elevated p-3 md:p-6"
        aria-label="粵切字輸入法"
      >
        <JyutcitziIme />
      </section>
    </div>
  );
}
