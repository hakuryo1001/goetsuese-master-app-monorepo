import { externalUrls } from "@/config/external-urls";
import { uiStyles } from "@/lib/ui-styles";

type FontResourcesBlockProps = {
  compact?: boolean;
  className?: string;
};

export default function FontResourcesBlock({
  compact = false,
  className = "",
}: FontResourcesBlockProps) {
  const base =
    "rounded-lg border border-white/20 bg-neutral-950 text-neutral-300 " +
    (compact
      ? "mt-5 px-4 py-3 text-sm "
      : "px-5 py-4 text-sm md:text-base ");

  return (
    <aside
      className={`${base}${className}`.trim()}
      aria-labelledby="font-resources-heading"
    >
      <h2
        id="font-resources-heading"
        className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400"
      >
        字型資源
      </h2>
      <p className="mb-4 leading-relaxed text-neutral-300">
        粵切字部分字形依賴專用字型檔。下載與說明見官方倉庫；概覽與其他資源見 Jyutcitzi 站點。
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <a
          href={externalUrls.jyutcitziFontsRepo}
          target="_blank"
          rel="noopener noreferrer"
          className={uiStyles.outlineButton}
        >
          Jyutcitzi fonts（GitHub）→
        </a>
        <a
          href={externalUrls.jyutcitziSite}
          target="_blank"
          rel="noopener noreferrer"
          className={uiStyles.textLink}
        >
          jyutcitzi.github.io
        </a>
      </div>
    </aside>
  );
}
