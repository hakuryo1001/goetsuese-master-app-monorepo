/**
 * Orthography atlas layout + roman joining for Goetsu Xiaozi charts.
 * Glyphs/Han prefer exported letter inventory; layout encodes chart geometry
 * (6×3 initials, 5-col finals) that mapping JSON does not store.
 */

import ATLAS from "./atlas.json";
import LETTERS from "./letters.json";
import RULE_EXAMPLES from "./rule-examples.json";

export type OrthographyComponent = {
  roman: string;
  siauzy: string;
  han: string;
};

/** Left = aspirated/yin · Mid = plain · Right = voiced (null = empty slot). */
export type InitialSlots = [
  OrthographyComponent | null,
  OrthographyComponent | null,
  OrthographyComponent | null,
];

export type InitialGroup = {
  group: string;
  slots: InitialSlots;
};

export type SpellingRule = {
  id: number;
  name: string;
  title: string;
  wording: string;
  example: { roman: string; hanzi: string };
  siauzy: string;
  han: string;
  extras?: Array<{ roman: string; han: string }>;
};

export type ToneRow = {
  category: string;
  mark: string;
  symbol: string;
  siauzy?: string;
  note?: string;
};

export type FinalCell = OrthographyComponent | null;

export type LetterRow = {
  siauzy: string;
  han: string;
  simplified: string;
};

const LETTER_BY_SIAUZY = new Map(
  (LETTERS as LetterRow[]).map((row) => [row.siauzy, row])
);

/** Resolve Han from letter inventory; fall back when same glyph needs a distinct teaching form. */
function letter(
  siauzy: string,
  fallbackHan?: string
): OrthographyComponent["han"] {
  return LETTER_BY_SIAUZY.get(siauzy)?.han ?? fallbackHan ?? "";
}

function cell(
  roman: string,
  siauzy: string,
  fallbackHan?: string
): OrthographyComponent {
  return { roman, siauzy, han: letter(siauzy, fallbackHan) };
}

// ---------------------------------------------------------------------------
// Chart 1 — 聲母 (letter-range PUA U+F5xx)
// ---------------------------------------------------------------------------

export const INITIAL_GROUPS: InitialGroup[] = [
  {
    group: "兵",
    slots: [
      cell("ph", "\uF500", "兵ﾟ"),
      cell("p", "\uF501", "兵"),
      cell("b", "\uF502", "兵ﾞ"),
    ],
  },
  {
    group: "弗",
    slots: [null, cell("f", "\uF503", "弗"), cell("v", "\uF504", "弗ﾞ")],
  },
  {
    group: "矛",
    slots: [
      cell("mh", "\uF540", "矛ﾟ"),
      // Same letter glyph as mh; yang form without ﾟ
      { roman: "m", siauzy: "\uF540", han: "矛" },
      null,
    ],
  },
  {
    group: "刀",
    slots: [
      cell("th", "\uF506", "刀ﾟ"),
      cell("t", "\uF507", "刀"),
      cell("d", "\uF508", "刀ﾞ"),
    ],
  },
  {
    group: "力",
    slots: [cell("lh", "\uF51F", "力ﾟ"), cell("l", "\uF509", "力"), null],
  },
  {
    group: "斤",
    slots: [
      cell("ch(i)", "\uF512", "斤ﾟ"),
      cell("c(i)", "\uF513", "斤"),
      cell("j(i)", "\uF514", "斤ﾞ"),
    ],
  },
  {
    group: "兴",
    slots: [
      null,
      cell("sh(i)", "\uF515", "兴"),
      cell("zh(i)", "\uF516", "兴ﾞ"),
    ],
  },
  {
    group: "拿",
    slots: [cell("nh", "\uF541", "拿ﾟ"), cell("n", "\uF50A", "拿"), null],
  },
  {
    group: "子",
    slots: [
      cell("tsh", "\uF517", "子ﾟ"),
      cell("ts", "\uF518", "子"),
      cell("dz", "\uF519", "子ﾞ"),
    ],
  },
  {
    group: "式",
    slots: [null, cell("s", "\uF51A", "式"), cell("z", "\uF51B", "式ﾞ")],
  },
  {
    group: "女",
    slots: [cell("nyh", "\uF543", "女ﾟ"), cell("ny", "\uF51C", "女"), null],
  },
  {
    group: "工",
    slots: [
      cell("kh", "\uF50B", "工ﾟ"),
      cell("k", "\uF50C", "工"),
      cell("g", "\uF50D", "工ﾞ"),
    ],
  },
  {
    group: "奥",
    slots: [
      cell("h", "\uF50E", "奧ﾟ"),
      cell("…", "\uF50F", "奧"),
      cell("gh", "\uF510", "奧ﾞ"),
    ],
  },
  {
    group: "午",
    slots: [cell("nk", "\uF542", "午ﾟ"), cell("ng", "\uF511", "午"), null],
  },
  {
    group: "零聲母",
    slots: [null, cell("…", "\uF50F", "奧"), null],
  },
  {
    group: "云",
    slots: [null, cell("i", "\uF51D", "云"), cell("y", "\uF544", "云")],
  },
  {
    group: "危",
    slots: [null, cell("u", "\uF51E", "危"), cell("w", "\uF545", "危")],
  },
];

const GROUP_BY_NAME = new Map(INITIAL_GROUPS.map((g) => [g.group, g]));

/**
 * Chart-1 spatial layout (6×3). Middle cell of row 2 is intentionally empty.
 */
export const INITIALS_ATLAS_GRID: (InitialGroup | null)[][] = [
  ["兵", "弗", "矛"],
  ["刀", null, "力"],
  ["斤", "兴", "拿"],
  ["子", "式", "女"],
  ["工", "奥", "午"],
  ["零聲母", "云", "危"],
].map((row) =>
  row.map((name) => (name ? GROUP_BY_NAME.get(name) ?? null : null))
);

// ---------------------------------------------------------------------------
// Chart 2 — 韻母 (component-range U+F521…, not header beside-blocks)
// ---------------------------------------------------------------------------

export const FINALS_GRID: FinalCell[] = [
  cell("a", "\uF521", "派"),
  cell("o", "\uF523", "瓦"),
  cell("e", "\uF525", "卑"),
  cell("i", "\uF527", "以"),
  cell("u", "\uF529", "无"),

  cell("au", "\uF52E", "号"),
  cell("ou", "\uF52F", "多"),
  cell("eu", "\uF530", "久"),
  cell("iu", "\uF531", "雨"),
  null,

  cell("aq", "\uF522", "乏"),
  cell("oq", "\uF524", "昱"),
  cell("eq", "\uF526", "出"),
  cell("iq", "\uF528", "亦"),
  cell("q", "\uF03B", "く"),

  cell("ae(n)", "\uF52B", "万"),
  cell("oe(n)", "\uF532", "寒"),
  cell("en", "\uF535", "文"),
  cell("ie(n)", "\uF52D", "建"),
  cell("n", "\uF03A", "レ"),

  cell("an", "\uF533", "良"),
  cell("on", "\uF534", "从"),
  cell("eon", "\uF538", "能"),
  cell("in", "\uF536", "刃"),
  cell("y", "\uF52A", "厶"),

  cell("aon", "\uF537", "亡"),
  null,
  null,
  null,
  cell("r", "\uF539", "而"),
];

export const FINALS_COLS = 5;

// ---------------------------------------------------------------------------
// Chart 3 — 介母 · 標記 (letter rows; avoid components.medials i/u collision)
// ---------------------------------------------------------------------------

export const MEDIALS: OrthographyComponent[] = [
  cell("i", "\uF527", "以"),
  cell("u", "\uF529", "无"),
  cell("iu", "\uF531", "雨"),
  cell("r", "\uF539", "而"),
];

export const MEDIAL_LABELS: Record<string, string> = {
  i: "齊齒呼",
  u: "合口呼",
  iu: "撮口呼",
  r: "翹舌",
};

/** Coda / sandhi letter marks from the inventory. */
export const MARKS: OrthographyComponent[] = [
  cell("n", "\uF03A", "レ"),
  cell("q", "\uF03B", "く"),
  cell("-x", "\uF03C", "へ"),
  cell("-·", "\uF03D", "ケ"),
];

const TONE_SYMBOL: Record<string, { symbol: string; siauzy?: string }> = {
  ping: { symbol: "—" },
  shang: { symbol: "´" },
  qu: { symbol: "`" },
  ru: { symbol: "く", siauzy: "\uF03B" },
  sandhi: { symbol: "へ", siauzy: "\uF03C" },
  "sandhi-dot": { symbol: "ケ", siauzy: "\uF03D" },
};

export const TONES: ToneRow[] = (
  ATLAS.tones as Array<{
    category: string;
    mark: string;
    key: string;
    note?: string;
  }>
).map((t) => {
  const vis = TONE_SYMBOL[t.key] ?? { symbol: t.mark };
  return {
    category: t.category,
    mark: t.mark,
    symbol: vis.symbol,
    siauzy: vis.siauzy,
    note: t.note,
  };
});

// ---------------------------------------------------------------------------
// Spelling rules (mapping rules + live syllable examples)
// ---------------------------------------------------------------------------

const RULE_TITLES: Record<number, string> = {
  1: "一般字音",
  2: "含介母字音",
  3: "隱含介母 i",
  4: "方言韻母",
  5: "撮口介母 iu / yu",
};

const RULE_EXAMPLE_HANZI: Record<string, string> = {
  keq: "個",
  tiau: "鳥",
  shian: "向",
  maeq: "襪",
  yu: "—",
};

function ruleExample(key: keyof typeof RULE_EXAMPLES): {
  siauzy: string;
  han: string;
} {
  const ex = RULE_EXAMPLES[key];
  return {
    siauzy: ex?.glyph ?? "",
    han: ex?.han ?? "",
  };
}

export const SPELLING_RULES: SpellingRule[] = (
  ATLAS.rules as Array<{
    id: number;
    name: string;
    zh: string;
    example: { romanization: string; hanzi: string };
  }>
).map((rule) => {
  const roman = rule.example.romanization;
  const live = ruleExample(roman as keyof typeof RULE_EXAMPLES);
  const base: SpellingRule = {
    id: rule.id,
    name: rule.name,
    title: RULE_TITLES[rule.id] ?? rule.name,
    wording: rule.zh,
    example: {
      roman,
      hanzi: rule.example.hanzi || RULE_EXAMPLE_HANZI[roman] || "—",
    },
    siauzy: live.siauzy,
    han: live.han,
  };
  if (rule.id === 4) {
    base.extras = [
      { roman: "aeq", han: "万く" },
      { roman: "oeq", han: "寒く" },
      { roman: "eoq", han: "能く" },
      { roman: "ai", han: "派以" },
      { roman: "ei", han: "卑以" },
      {
        roman: "aoq",
        han: RULE_EXAMPLES.aoq?.han ?? "奧亡く",
      },
      {
        roman: "iuq",
        han: RULE_EXAMPLES.iuq?.han ?? "奧雨く",
      },
    ];
  }
  return base;
});

export const CHART_IMAGES = {
  initials: "/goetsusioji/charts/1.png",
  finals: "/goetsusioji/charts/2.png",
  medialsTonesRules: "/goetsusioji/charts/3.png",
} as const;

export const CODA_EXAMPLES: OrthographyComponent[] = [
  {
    roman: "aoq",
    siauzy: RULE_EXAMPLES.aoq?.glyph ?? "",
    han: RULE_EXAMPLES.aoq?.han ?? "奧亡く",
  },
  {
    roman: "iuq",
    siauzy: RULE_EXAMPLES.iuq?.glyph ?? "",
    han: RULE_EXAMPLES.iuq?.han ?? "奧雨く",
  },
];
