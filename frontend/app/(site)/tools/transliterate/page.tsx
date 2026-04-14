import Link from "next/link";

import FontResourcesBlock from "@/components/FontResourcesBlock";
import IntroVideoBlock from "@/components/IntroVideoBlock";
import InstantChoicefulTranslator from "@/components/InstantChoicefulTranslator";

export const metadata = {
  title: "Transliterate | Jyutcitzi",
  description: "Han / Jyutping to Jyutcitzi transliteration",
};

export default function TransliterateToolPage() {
  return (
    <div className="w-full font-jcz">
      <nav className="mb-6 text-center">
        <Link
          href="/"
          className="text-sm text-neutral-400 underline-offset-4 hover:text-white hover:underline"
        >
          ← 返回主頁
        </Link>
      </nav>
      <header className="mb-6 rounded-lg border border-white/20 bg-black p-5">
        <h1 className="text-center text-3xl font-semibold text-white md:text-4xl">
          粵切字轉換
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
        <div className="flex min-h-0 flex-col gap-6 lg:col-span-4 xl:col-span-3">
          <FontResourcesBlock className="min-h-0 flex-1" />
          <IntroVideoBlock />
        </div>
        <section
          className="min-w-0 rounded-lg border border-white/20 bg-black p-3 md:p-5 lg:col-span-8 xl:col-span-9"
          aria-label="轉換器"
        >
          <InstantChoicefulTranslator />
        </section>
      </div>
    </div>
  );
}
