import Link from "next/link";

import JyutcitziPhonologyTables from "@/components/JyutcitziPhonologyTables";

export const metadata = {
  title: "粵切字改革方案 · 聲母韻母表",
  description:
    "粵切字將音節拆成聲母同韻母，用部件砌成方塊字；附聲母／韻母網格同 fan1–fan6 補充聲調符。How Jyutcitzi assembles initials, finals, and tones into square characters.",
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
        <div className="mx-auto mt-6 grid max-w-5xl gap-8 text-left lg:grid-cols-2 lg:gap-10">
          <p className="text-sm leading-relaxed text-ink md:text-base">
            粵切字嘅運作方式係將每個粵語音節拆成「聲母」同「韻母」，再用兩個對應部件砌成一個方塊字。聲母會決定個字嘅結構（例如左右、上下），韻母就放入指定位置，最後可以喺右上角加符號標聲調。例如「香港」嘅「香」（<span className="font-mono">hoeng1</span>），
            <span lang="en" className="font-mono text-[0.95em] tracking-tight">
              h
            </span>{' '}
            聲母用「亾」，<span className="font-mono">oeng</span> 韻母用「丈」，因為{' '}
            <span lang="en" className="font-mono text-[0.95em] tracking-tight">
              h
            </span>{' '}
            係左右結構，所以寫成「⿰亾丈」。複合聲母可以將幾個聲母部件疊埋，零聲母或者零韻母就加「⺍」。整套系統本質上係一種用部件拼音、再組裝成方塊字嘅書寫方法。
          </p>
          <p lang="en" className="text-sm leading-relaxed text-ink-muted md:text-base">
            Jyutcitzi works by splitting each Cantonese syllable into an initial consonant and a final,
            then combining two corresponding components into a square-shaped character. The initial
            determines the overall structure of the character (such as left-right or top-bottom),
            while the final is placed into the designated position, and tone marks can optionally be
            added in the upper-right corner. For example, the syllable{' '}
            <span className="font-mono text-ink">hoeng1</span> in{' '}
            <span className="font-jcz text-ink">香港</span> uses the initial component 「亾」 for{' '}
            <span className="font-mono">h</span> and the final component 「丈」 for{' '}
            <span className="font-mono">oeng</span>; since <span className="font-mono">h</span> uses a
            left-right structure, the result is written as 「⿰亾丈」. Compound initials can stack multiple
            initial components together, while zero initials or finals are marked with 「⺍」. The system
            is fundamentally a way of phonetic assembly using components to construct square characters.
          </p>
        </div>
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
