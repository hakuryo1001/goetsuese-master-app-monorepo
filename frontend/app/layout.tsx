import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";

import GoogleAnalytics from "@/components/GoogleAnalytics";
import ThemeInlineScript from "@/components/ThemeInlineScript";
import { hanaMinA, hanaMinB } from "@/lib/fonts/hana-min";

import "./globals.css";

const goetsusiojiFont = localFont({
  src: "../public/fonts/goetsusioji.ttf",
  variable: "--font-goetsusioji",
  display: "swap",
});

const siteName = "Goetsusioji 吳小字";
const defaultTitle =
  "Goetsusioji 吳小字 — ngven romanization typer & Goetsuese script tools";
const description =
  "Free online Goetsuese (吳語) tools: type ngven romanization into Goetsusioji in the browser. No server required. 用 ngven 羅馬字輸入吳小字。";

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
    "Goetsusioji",
    "Goetsuese",
    "吳小字",
    "吳語",
    "ngven",
    "漢字",
    "Honzi",
    "Han characters",
    "romanization",
    "typer",
    "IME",
    "font",
  ],
  authors: [{ name: "Goetsusioji" }],
  creator: "Goetsusioji",
  publisher: "Goetsusioji",
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
      <body
        className={`${goetsusiojiFont.variable} ${hanaMinA.variable} ${hanaMinB.variable}`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={gaMeasurementId} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
