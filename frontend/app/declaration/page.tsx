import type { Metadata } from "next";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";

import { declarationParagraphs } from "./body";

export const metadata: Metadata = {
  title: "粵字改革宣言（全文）",
  description:
    "《粵字改革宣言》全文：粵語書面語與文字改革論述。The Cantonese Script Reform Proclamation — full archived text.",
};

export default function DeclarationPage() {
  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-8 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href="/"
            className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            ← 返回主頁
          </Link>
          <ThemeToggle />
        </nav>

        <article
          className="space-y-4 text-[15px] leading-[1.75] text-ink sm:text-base sm:leading-8"
          lang="zh-Hant"
        >
          {declarationParagraphs.map((block, i) =>
            block.trim() === "" ? (
              <div key={i} className="h-2" aria-hidden />
            ) : (
              <p
                key={i}
                className="[overflow-wrap:anywhere] [text-wrap:pretty]"
              >
                {block}
              </p>
            ),
          )}
        </article>
      </div>
    </div>
  );
}
