import localFont from "next/font/local";

/** HanaMinA — CJK Extension coverage (pair with HanaMinB). */
export const hanaMinA = localFont({
  src: "../../public/fonts/HanaMinA.ttf",
  variable: "--font-hana-min-a",
  display: "swap",
});

/** HanaMinB — supplementary glyphs not in HanaMinA. */
export const hanaMinB = localFont({
  src: "../../public/fonts/HanaMinB.ttf",
  variable: "--font-hana-min-b",
  display: "swap",
});
