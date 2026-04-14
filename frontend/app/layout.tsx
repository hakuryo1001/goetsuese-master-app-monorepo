import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const jczFont = localFont({
  src: "../public/fonts/JyutcitziWithSourceHanSerifTCExtraLight.ttf",
  variable: "--font-jcz",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cantonese Jyutcitzi Converter | 漢字粵切字轉換器",
  description: "Cantonese Jyutcitzi tools and transliteration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={jczFont.variable}>{children}</body>
    </html>
  );
}
