import Link from "next/link";

import AngloCantoneseTool from "@/components/AngloCantoneseTool";

export const metadata = {
  title: "Anglo Cantonese",
  description:
    "Anglo Cantonese: Cantonese spelled with English-reading habits for learners.",
};

export default function AngloCantonesePage() {
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
        <h1 className="text-center text-2xl font-semibold tracking-tight text-ink md:text-4xl">
          Anglo Cantonese
        </h1>
      </header>

      <section
        className="rounded-lg border border-line bg-elevated p-5 leading-7 text-ink-muted md:p-8"
        aria-label="簡介"
      >
        <p className="mb-4 text-ink">
          本子頁介紹以英文讀音習慣寫低粵語嘅<strong className="font-medium text-ink">羅馬字標註</strong>
          ：方便講開英文嘅人對照發音同日常閱讀。
        </p>
        <p className="text-sm md:text-base">
          Type spaced <span className="text-ink">Jyutping</span> below to preview{" "}
          <span className="text-ink">Anglo Cantonese</span> spellings—all processing happens offline
          in the browser via the bundled mapping.
        </p>
      </section>

      <section
        className="rounded-lg border border-line bg-elevated p-4 md:p-6"
        aria-label="轉換器"
      >
        <AngloCantoneseTool />
      </section>
    </div>
  );
}
