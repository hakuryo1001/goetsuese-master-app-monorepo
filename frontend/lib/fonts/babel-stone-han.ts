import localFont from "next/font/local";

/** Loaded only on the natural-jyutping tool page (not site-wide). */
export const babelStoneHan = localFont({
  src: "../../public/fonts/BabelStoneHan.ttf",
  variable: "--font-babel-stone",
  display: "swap",
});
