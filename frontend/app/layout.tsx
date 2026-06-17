import type { Metadata } from "next";
import localFont from "next/font/local";

import GoogleAnalytics from "@/components/GoogleAnalytics";
import ThemeInlineScript from "@/components/ThemeInlineScript";

import "./globals.css";

const jczFont = localFont({
  src: "../public/fonts/JyutcitziWithSourceHanSerifTCExtraLight.ttf",
  variable: "--font-jcz",
  display: "swap",
});

const siteName = "Jyutcitzi 粵切字";
const defaultTitle =
  "Jyutcitzi 粵切字 — Cantonese transliterator, fonts & learning tools";
const description =
  "Free online Cantonese (粵語) tools: transliterate Han text and Jyutping into Jyutcitzi, browse Jyutcitzi fonts, and explore resources for Cantonese script reform. 漢字／粵拼轉粵切字、字型與學習資源。";

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [

    "粵切字",

    "粵語",

    "漢字",
    "粵拼",
    "粵文",
    "粵字",
    "白話文",
    "白話",
    "白言文",
    "廣東話",
    "廣州話",


    "粵字改革",

    "粵語文字", "Cantonese script",
    "font", "transliteration",
    "Jyutping",
    "converter", "Cantonese", "Jyutcitzi", "Yue", "Toishanese", "transliteration",
    "Jyutping",
    "Han characters",
    "Honzi"
  ],
  authors: [{ name: "Jyutcitzi" }],
  creator: "Jyutcitzi",
  publisher: "Jyutcitzi",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_HK",
    alternateLocale: ["en_US", "zh_TW"],
    url: "/",
    siteName,
    title: defaultTitle,
    description,
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description,
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <ThemeInlineScript />
      </head>
      <body className={jczFont.variable}>
        <GoogleAnalytics measurementId={gaMeasurementId} />
        {children}
      </body>
    </html>
  );
}
