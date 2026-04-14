import Link from "next/link";

import { ToolCard } from "@/components/ToolCard";
import { uiStyles } from "@/lib/ui-styles";
import { siteOfferings } from "@/config/site-offerings";

export default function Home() {
  return (
    <main className="rounded-lg p-4 font-jcz">
      <header className="m-6 p-6 md:m-7 md:p-7">
        <h1 className="text-center text-5xl font-semibold tracking-tight text-white">
          
        </h1>
        <p className="m-10 text-center text-lg leading-relaxed text-neutral-300 md:text-xl">
          粵語，悲乃一無文學、無哲學、無科學的語言。何解我等受盡此等的文學貧況呼？唉，無非乃我地冇自己嘅文字噉解。
        </p>
      </header>

      <section
        className="mx-auto max-w-6xl px-2 pb-12"
        aria-label="粵切字工具與資源"
      >
        <h2 className="sr-only">工具與資源</h2>
        <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siteOfferings.map((item) => (
            <li key={item.key} className="min-w-0">
              <ToolCard>
                <h3 className="mb-3 text-center text-xl font-semibold text-white md:text-2xl">
                  {item.title}
                </h3>
                <p className="mb-6 flex-1 leading-7 text-neutral-300">
                  {item.description}
                </p>

                {item.kind === "internal" && (
                  <div className="mt-auto flex justify-center border-t border-white/10 pt-5">
                    <Link href={item.href} className={uiStyles.outlineButton}>
                      {item.cta}
                    </Link>
                  </div>
                )}

                {item.kind === "external" && (
                  <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    {item.links.map((link) =>
                      link.variant === "text" ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={uiStyles.textLink}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={uiStyles.outlineButton}
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                )}

                {item.kind === "placeholder" && (
                  <p className="mt-auto border-t border-white/10 pt-5 text-center text-sm text-neutral-500">
                    敬請期待
                  </p>
                )}
              </ToolCard>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
