import { externalUrls } from "@/config/external-urls";

export type SiteOffering =
  | {
      key: string;
      kind: "internal";
      title: string;
      description: string;
      href: string;
      cta: string;
    }
  | {
      key: string;
      kind: "external";
      title: string;
      description: string;
      links: readonly {
        label: string;
        href: string;
        variant?: "button" | "text";
      }[];
    }
  | {
      key: string;
      kind: "placeholder";
      title: string;
      description: string;
    };

/** Add new tools here — the home page grid renders from this list. */
export const siteOfferings: SiteOffering[] = [
  {
    key: "transliterate",
    kind: "internal",
    title: "漢字粵切字轉換器",
    description: "即時將漢字、粵拼、或粵漢混寫轉成粵切字或粵漢粵切字混寫。",
    href: "/tools/transliterate",
    cta: "開啟轉換器",
  },
  {
    key: "ime",
    kind: "internal",
    title: "粵切字網上輸入",
    description:
      "喺瀏覽器用粵拼組字、選候選、上屏；可切換 Web／Font 字形檔式。唔經伺服器。",
    href: "/tools/ime",
    cta: "開啟輸入法",
  },
  {
    key: "anglicanized-romanisation",
    kind: "internal",
    title: "Anglo Cantonese",
    description:
      "Anglo Cantonese：以英語讀音習慣拼寫粵語嘅羅馬字方案；適合母語係英文嘅讀者學發音同日用品讀標註。（內容陸續補充。）",
    href: "/tools/anglicanized-romanisation",
    cta: "開啟頁面",
  },
  {
    key: "fonts",
    kind: "external",
    title: "字型資源",
    description: "粵切字部分字形依賴專用字型檔。下載與說明見官方倉庫。",
    links: [
      {
        label: "Jyutcitzi fonts（GitHub）→",
        href: externalUrls.jyutcitziFontsRepo,
        variant: "button",
      },
    ],
  },
  {
    key: "intro-youtube",
    kind: "external",
    title: "介紹影片（YouTube）",
    description: "粵切字與本計劃相關概介；於 YouTube 播放。",
    links: [
      {
        label: "YouTube →",
        href: externalUrls.jyutcitziIntroYoutube,
        variant: "button",
      },
    ],
  },
  {
    key: "chrome-extension",
    kind: "external",
    title: "Chrome 粵切字輸入擴充套件",
    description:
      "於 Google Chrome 輸入粵切字；安裝與原始碼見 cantonese-jyutcitzi 倉庫。",
    links: [
      {
        label: "GitHub：安裝與說明 →",
        href: externalUrls.chromeExtensionRepo,
        variant: "button",
      },
    ],
  },
  {
    key: "declaration",
    kind: "internal",
    title: "粵字改革宣言",
    description:
      "《粵字改革宣言》全文：粵語書面語與文字改革論述；附英文譯本及存檔摘錄。",
    href: "/declaration",
    cta: "閱讀全文",
  },
  {
    key: "more",
    kind: "placeholder",
    title: "更多工具",
    description: "詞典、練習與其他粵切字相關功能陸續準備緊。",
  },
];
