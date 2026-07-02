import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        elevated: "var(--color-elevated)",
        muted: "var(--color-muted)",
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        "ink-faint": "var(--color-ink-faint)",
        line: "var(--color-line)",
        "line-strong": "var(--color-line-strong)",
        panel: "var(--color-panel)",
        "panel-shadow": "var(--color-panel-shadow)",
        "card-shadow": "var(--color-card-shadow)",
        "input-bg": "var(--color-input-bg)",
        "input-ink": "var(--color-input-ink)",
        "input-border": "var(--color-input-border)",
        "input-border-focus": "var(--color-input-border-focus)",
        "output-bg": "var(--color-output-bg)",
        "output-ink": "var(--color-output-ink)",
        "output-border": "var(--color-output-border)",
        "output-shadow": "var(--color-output-shadow)",
        "alert-bg": "var(--color-alert-bg)",
        "alert-border": "var(--color-alert-border)",
        "alert-text": "var(--color-alert-text)",
        brand: "var(--color-brand)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        jade: "var(--color-jade)",
      },
      fontFamily: {
        /** Goetsusioji PUA + HanaMin for 漢字 (replaces Jyutcitzi compound font). */
        jcz: [
          "var(--font-goetsusioji)",
          "var(--font-hana-min-a)",
          "var(--font-hana-min-b)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        goetsusioji: [
          "var(--font-goetsusioji)",
          "var(--font-hana-min-a)",
          "var(--font-hana-min-b)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        "babel-stone": ["var(--font-babel-stone)", "ui-serif", "Georgia", "serif"],
        /** HanaMinA+B for rare hanzi; BabelStoneHan for natural glyphs; Jyutcitzi for reform PUA. */
        "hana-min": [
          "var(--font-hana-min-a)",
          "var(--font-hana-min-b)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        "natural-jyutcitzi": [
          "var(--font-hana-min-a)",
          "var(--font-hana-min-b)",
          "var(--font-babel-stone)",
          "var(--font-goetsusioji)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
