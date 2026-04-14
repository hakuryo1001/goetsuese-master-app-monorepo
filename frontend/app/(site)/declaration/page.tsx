import type { Metadata } from "next";
import Link from "next/link";

import { uiStyles } from "@/lib/ui-styles";

import {
  declarationParagraphs,
  declarationParagraphsEn,
} from "./body";

export const metadata: Metadata = {
  title: "粵字改革宣言（全文）",
  description:
    "《粵字改革宣言》全文：粵語書面語與文字改革論述。The Cantonese Script Reform Proclamation — full archived text.",
};

const DATE_INDEX = 18;

function renderEnglishBlock(block: string, index: number) {
  const isReformQuestion = block.startsWith("How? What is the reform");
  if (isReformQuestion) {
    return (
      <h3
        key={`en-${index}`}
        className="mb-5 mt-12 scroll-mt-24 text-balance text-center text-base font-semibold tracking-tight text-ink sm:text-lg"
      >
        {block}
      </h3>
    );
  }

  const isLead = index === 0;

  return (
    <p
      key={`en-${index}`}
      lang="en"
      className={`mb-5 font-serif text-[0.98rem] leading-[1.88] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] sm:text-[1.02rem] sm:leading-[1.92] ${
        isLead
          ? "text-[1.02rem] leading-relaxed text-ink sm:text-[1.08rem] sm:leading-relaxed"
          : ""
      }`}
    >
      {block}
    </p>
  );
}

export default function DeclarationPage() {
  return (
    <div className="w-full pb-16">
      <nav className="mb-10 flex flex-wrap items-center justify-center gap-4 sm:justify-between">
        <Link
          href="/"
          className={`${uiStyles.textLink} text-center sm:text-start`}
        >
          ← 返回主頁
        </Link>
      </nav>

      <article className="mx-auto max-w-prose">
        {declarationParagraphs.map((block, i) => {
          if (block.trim() === "") {
            return <div key={i} className="h-3" aria-hidden />;
          }

          if (i === 0) {
            return (
              <header
                key={i}
                className="mb-12 border-b border-line pb-10 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {block}
                </p>
                <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  粵字改革宣言
                </h1>
                <p className="mt-3 text-sm text-ink-muted sm:text-base">
                  The Cantonese Script Reform Proclamation
                </p>
              </header>
            );
          }

          if (i === DATE_INDEX) {
            return (
              <p
                key={i}
                className="my-10 text-center text-sm text-ink-faint"
              >
                <time dateTime="2020-06-16">{block}</time>
              </p>
            );
          }

          return (
            <p
              key={i}
              lang="zh-Hant"
              className="mb-5 text-[15px] leading-[1.85] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] sm:text-base sm:leading-8"
            >
              {block}
            </p>
          );
        })}

        <section
          lang="en"
          aria-label="English translation"
          className="mt-16 border-t border-line pt-14"
        >
          <header className="mb-12 border-b border-line pb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              English translation
            </p>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              The Cantonese Script Reform Proclamation
            </h2>
            <p className="mt-3 text-sm text-ink-muted sm:text-base">
              Parallel to the Chinese text above · 粵字改革宣言
            </p>
          </header>

          {declarationParagraphsEn.map((block, i) =>
            renderEnglishBlock(block, i),
          )}
        </section>
      </article>
    </div>
  );
}
