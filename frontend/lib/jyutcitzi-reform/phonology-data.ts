/**
 * Cantonese 「粵切字改革方案」phonology grids (reference layout).
 */

export const FINAL_CODAS = ["#", "i", "u", "m", "n", "ng", "p", "t", "k"] as const;

export type InitialCellNormal = {
  kind: "initial";
  jyutping: string;
  gloss: string;
  idc: "⿱" | "⿰";
};

export type InitialCellNgYao = {
  kind: "ng-yao";
  bottomIdc: "⿱";
};

export type InitialCellPlain = {
  kind: "plain";
  label: string;
  /** Character / example spelling line */
  gloss: string;
  /** Optional superscript footnote cue */
  ref?: "*" | "**" | "`";
};

export type InitialGridCell =
  | InitialCellNormal
  | InitialCellNgYao
  | InitialCellPlain
  | null;

/** Fixed 4 columns per row */
export const INITIAL_ROWS: InitialGridCell[][] = [
  [
    { kind: "initial", jyutping: "b", gloss: "比", idc: "⿱" },
    { kind: "initial", jyutping: "p", gloss: "并", idc: "⿰" },
    { kind: "initial", jyutping: "m", gloss: "文", idc: "⿱" },
    { kind: "initial", jyutping: "f", gloss: "夫", idc: "⿰" },
  ],
  [
    { kind: "initial", jyutping: "d", gloss: "大", idc: "⿱" },
    { kind: "initial", jyutping: "t", gloss: "天", idc: "⿱" },
    { kind: "initial", jyutping: "n", gloss: "乃", idc: "⿰" },
    { kind: "initial", jyutping: "l", gloss: "力", idc: "⿰" },
  ],
  [
    { kind: "initial", jyutping: "z", gloss: "止", idc: "⿰" },
    { kind: "initial", jyutping: "c", gloss: "此", idc: "⿱" },
    { kind: "initial", jyutping: "s", gloss: "厶", idc: "⿱" },
    { kind: "initial", jyutping: "j", gloss: "央", idc: "⿱" },
  ],
  [
    { kind: "initial", jyutping: "g", gloss: "丩", idc: "⿰" },
    { kind: "initial", jyutping: "k", gloss: "臼", idc: "⿱" },
    { kind: "initial", jyutping: "h", gloss: "亾", idc: "⿰" },
    { kind: "ng-yao", bottomIdc: "⿱" },
  ],
  [
    { kind: "initial", jyutping: "gw", gloss: "古", idc: "⿰" },
    { kind: "initial", jyutping: "kw", gloss: "夸", idc: "⿰" },
    { kind: "initial", jyutping: "w", gloss: "禾", idc: "⿱" },
    null,
  ],
  [
    { kind: "plain", label: "m/ng", gloss: "𠄡", ref: "**" },
    { kind: "plain", label: "m", gloss: "𠄡." },
    { kind: "plain", label: "ng", gloss: "𠄡", ref: "`" },
    null,
  ],
];

export type FinalsCell = {
  jp: string;
  gloss: string;
  asteriskNote?: boolean;
} | null;

export type FinalsRowSpec = {
  nucleus: string;
  cells: readonly FinalsCell[];
};

function C(jp: string, gloss: string, asteriskNote?: boolean): NonNullable<FinalsCell> {
  return asteriskNote ? { jp, gloss, asteriskNote: true } : { jp, gloss };
}

/** One entry per nucleus row — cells align to {@link FINAL_CODAS}. */
export const FINAL_ROWS: FinalsRowSpec[] = [
  {
    nucleus: "/aa/",
    cells: [
      C("aa", "乍"),
      C("aai", "介"),
      C("aau", "丂"),
      C("aam", "彡"),
      C("aan", "万"),
      C("aang", "生"),
      C("aap", "甲"),
      C("aat", "压"),
      C("aak", "百"),
    ],
  },
  {
    nucleus: "/a/",
    cells: [
      null,
      C("ai", "兮"),
      C("au", "久"),
      C("am", "今"),
      C("an", "云"),
      C("ang", "亙"),
      C("ap", "十"),
      C("at", "乜"),
      C("ak", "仄"),
    ],
  },
  {
    nucleus: "/e/",
    cells: [
      C("e", "旡"),
      C("ei", "丌"),
      C("eu", "了"),
      C("em", "壬"),
      C("en", "円"),
      C("eng", "正"),
      C("ep", "夾"),
      C("et", "叐"),
      C("ek", "尺"),
    ],
  },
  {
    nucleus: "/i/",
    cells: [
      C("i", "子"),
      null,
      C("iu", "么"),
      C("im", "欠"),
      C("in", "千"),
      C("ing", "丁"),
      C("ip", "頁"),
      C("it", "必"),
      C("ik", "夕"),
    ],
  },
  {
    nucleus: "/o/",
    cells: [
      C("o", "个"),
      C("oi", "丐"),
      C("ou", "冇"),
      null,
      C("on", "干"),
      C("ong", "王"),
      null,
      C("ot", "匃"),
      C("ok", "乇"),
    ],
  },
  {
    nucleus: "/u/",
    cells: [
      C("u", "乎"),
      C("ui", "会"),
      null,
      null,
      C("un", "本"),
      C("ung", "工"),
      null,
      C("ut", "末"),
      C("uk", "玉"),
    ],
  },
  {
    nucleus: "/oe/",
    cells: [
      C("oe", "居", true),
      null,
      null,
      null,
      null,
      C("oeng", "丈"),
      null,
      null,
      C("oek", "勺"),
    ],
  },
  {
    nucleus: "/eo/",
    cells: [
      null,
      C("eoi", "句"),
      null,
      null,
      C("eon", "卂"),
      null,
      null,
      C("oet", "𥘅"),
      null,
    ],
  },
  {
    nucleus: "/yu/",
    cells: [
      C("yu", "仒"),
      null,
      null,
      null,
      C("yun", "元"),
      null,
      null,
      C("yut", "乙"),
      null,
    ],
  },
];

export const PHONOLOGY_NOTES = {
  initialsNgYaoStar:
    "標「*」嘅格：部件顯示作「ng ⿰〤〤」；「〤〤」係「爻」（粵拼： ngaau4 ）嘅打橫版本，可以用「爻」嚟代替未完全裝嵌嘅粵切字部件。",
  wuVariant:
    "「𠄡」係「五」嘅異體字；格內上分別係音節鼻音同純鼻音嘅示例寫法。",
  oeFootnoteStar:
    "「oe 居」一格式用「居」對應 /oe/ 核；詳細嘅「⿳日ノ才」部件若電腦打唔出，可先以「居」暫代（與方案說明用字一致）。",
} as const;
