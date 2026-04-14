import { externalUrls } from "@/config/external-urls";
import { uiStyles } from "@/lib/ui-styles";

type IntroVideoBlockProps = {
  className?: string;
};

/** YouTube intro — separate from font resources. */
export default function IntroVideoBlock({ className = "" }: IntroVideoBlockProps) {
  return (
    <aside
      className={`rounded-lg border border-white/20 bg-neutral-950 px-5 py-4 text-sm text-neutral-300 md:text-base ${className}`.trim()}
      aria-labelledby="intro-video-heading"
    >
      <h2
        id="intro-video-heading"
        className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400"
      >
        介紹影片（YouTube）
      </h2>
      <p className="mb-4 leading-relaxed text-neutral-300">
        粵切字與本計劃相關概介；於 YouTube 播放。
      </p>
      <a
        href={externalUrls.jyutcitziIntroYoutube}
        target="_blank"
        rel="noopener noreferrer"
        className={uiStyles.outlineButton}
      >
        YouTube →
      </a>
    </aside>
  );
}
