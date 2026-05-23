/**
 * Jyutping → Anglo Cantonese spelling using bundled {@link ./mapping.json}.
 * Mirrors cantonese-projects/anglo-cantonese-romanization/translate.py
 * (`normalize_mapping_part`, `parse_jyutping`, `jyutping_to_anglicized`, `translate_text` JP→Anglo only).
 */

import mappingData from "./mapping.json";

export type MappingPayload = typeof mappingData;

/** One resolved mapping option after normalization (parity with Python API dict shape). */
export type MappingOptionDetail = {
  romanization: string;
  approx_english_rhyme_zone: string;
  english_rhymes: string[];
  notes: string;
  preference_index: number;
  recommended: boolean;
};

type RawMappingPart =
  | string
  | Record<string, unknown>
  | readonly unknown[];

function normalizeMappingPartFromList(raw: readonly unknown[]): {
  romanizations: string[];
  options: MappingOptionDetail[];
} {
  const romanizations: string[] = [];
  const options: MappingOptionDetail[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      romanizations.push(item);
      options.push({
        romanization: item,
        approx_english_rhyme_zone: "",
        english_rhymes: [],
        notes: "",
        preference_index: 0,
        recommended: false,
      });
      continue;
    }

    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(
        `Invalid option entry type inside mapping list: ${typeof item}`
      );
    }

    const e = item as Record<string, unknown>;
    const rom = e.romanization;
    if (typeof rom !== "string") {
      throw new Error(
        "Each mapping option dict must include a 'romanization' field (use \"\" when empty)"
      );
    }

    let notes = "";
    if (typeof e.notes === "string") notes = e.notes;
    else if (e.notes === null) notes = "";

    const erRaw = e.english_rhymes;
    const er = Array.isArray(erRaw)
      ? erRaw.filter((x): x is string => typeof x === "string")
      : [];

    const approx =
      typeof e.approx_english_rhyme_zone === "string"
        ? e.approx_english_rhyme_zone
        : "";

    romanizations.push(rom);
    options.push({
      romanization: rom,
      approx_english_rhyme_zone: approx,
      english_rhymes: er,
      notes,
      preference_index: 0,
      recommended: e.recommended === true,
    });
  }

  for (let i = 0; i < options.length; i++) {
    options[i] = { ...options[i], preference_index: i + 1 };
  }

  const pickIdxs = options
    .map((d, i) => (d.recommended ? i : -1))
    .filter((i) => i >= 0);
  const keeper = pickIdxs[0] ?? 0;

  return {
    romanizations,
    options: options.map((d, i) => ({
      ...d,
      recommended: i === keeper,
    })),
  };
}

export function normalizeMappingPart(raw: RawMappingPart): {
  romanizations: string[];
  options: MappingOptionDetail[];
} {
  if (typeof raw === "string") {
    const d: MappingOptionDetail = {
      romanization: raw,
      approx_english_rhyme_zone: "",
      english_rhymes: [],
      notes: "",
      recommended: true,
      preference_index: 1,
    };
    return { romanizations: [raw], options: [d] };
  }

  if (typeof raw !== "object" || raw === null) {
    throw new Error(
      `Mapping value must be str, recommended-entry dict, list, or object with 'options'; got ${typeof raw}`
    );
  }

  if (Array.isArray(raw)) {
    return normalizeMappingPartFromList(raw);
  }

  const obj = raw as Record<string, unknown>;

  const hasRomanOnly =
    Object.prototype.hasOwnProperty.call(obj, "romanization") &&
    !Object.prototype.hasOwnProperty.call(obj, "options");

  if (hasRomanOnly) {
    const r = obj.romanization;
    if (typeof r !== "string") {
      throw new Error(
        "Mapping entry has 'romanization' key but value is missing (use \"\" when empty)."
      );
    }
    const englishRhymesRaw = obj.english_rhymes;
    const englishRhymes = Array.isArray(englishRhymesRaw)
      ? englishRhymesRaw.filter((x): x is string => typeof x === "string")
      : [];
    let notes = "";
    if (typeof obj.notes === "string") notes = obj.notes;
    else if ((obj.notes as unknown) === null) notes = "";

    const approx =
      typeof obj.approx_english_rhyme_zone === "string"
        ? obj.approx_english_rhyme_zone
        : "";

    const detail = {
      romanization: r,
      approx_english_rhyme_zone: approx,
      english_rhymes: englishRhymes,
      notes,
    };
    return normalizeMappingPartFromList([detail]);
  }

  const opts = obj.options;
  if (!Array.isArray(opts)) {
    throw new Error(
      "Mapping object must use the recommended-entry shape with 'romanization', " +
        "or legacy multi-choice {'options': [...]}."
    );
  }

  return normalizeMappingPartFromList(opts);
}

const JYUTPING_INITIALS_ORDERED = [
  "gw",
  "kw",
  "ng",
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "k",
  "h",
  "w",
  "z",
  "c",
  "s",
  "j",
] as const;

export function parseJyutping(
  jyutping: string
): { initial: string; final: string; tone: string | undefined } {
  const s = jyutping.trim().toLowerCase();
  const toneMatch = /([1-6])$/u.exec(s);
  const tone = toneMatch?.[1];
  const base = tone ? s.slice(0, -1) : s;

  let initial = "";
  let finalPiece = base;
  for (const init of JYUTPING_INITIALS_ORDERED) {
    if (base.startsWith(init)) {
      initial = init;
      finalPiece = base.slice(init.length);
      break;
    }
  }

  return { initial, final: finalPiece, tone };
}

function getMappingValue(
  mappingList: readonly string[],
  preference: number
): string {
  const nonEmpty = mappingList.filter((v) => v);
  if (nonEmpty.length === 0) return "";
  const idx = preference - 1;
  if (idx < nonEmpty.length) return nonEmpty[idx]!;
  return nonEmpty[nonEmpty.length - 1]!;
}

function listPositionToNthNonemptyPreference(
  mappingList: readonly string[],
  preferenceIndexFull: number
): number {
  if (mappingList.length === 0) return 1;
  const end = Math.max(
    1,
    Math.min(preferenceIndexFull, mappingList.length)
  );
  let count = 0;
  for (let i = 0; i < end; i++) {
    if (mappingList[i]) count++;
  }
  return Math.max(1, count);
}

export type AngloCantoneseTranslator = {
  jyutpingToAnglicized: (
    jyutpingToken: string,
    preference?: number | null
  ) => string;
  translateJyutpingText: (text: string, preference?: number | null) => string;
  jyutpingSyllableChoiceInfo: (
    jyutpingToken: string
  ) => JyutpingSyllableChoiceInfo;
};

export type JyutpingSyllableChoiceInfo = {
  jyutping: string;
  initial_key: string;
  final_key: string;
  tone: string | undefined;
  auto_fragment_preferences: {
    initial: number;
    final: number;
  };
  initial_variants: MappingOptionDetail[];
  final_variants: MappingOptionDetail[];
};

function copyVariantLists(v: MappingOptionDetail[]): MappingOptionDetail[] {
  return v.map((d) => ({ ...d }));
}

function defaultVariantOptions(
  fallbackRomanization: string
): MappingOptionDetail[] {
  const rom = fallbackRomanization ?? "";
  return [
    {
      romanization: rom,
      english_rhymes: [],
      notes: "",
      approx_english_rhyme_zone: "",
      preference_index: 1,
      recommended: true,
    },
  ];
}

export function loadTranslatorFromPayload(
  data: MappingPayload
): AngloCantoneseTranslator {
  const initialsMap = new Map<string, string[]>();
  const finalsMap = new Map<string, string[]>();
  const initialsOptions = new Map<string, MappingOptionDetail[]>();
  const finalsOptions = new Map<string, MappingOptionDetail[]>();

  const initialsRaw = data.initials ?? {};
  for (const k of Object.keys(initialsRaw)) {
    const { romanizations, options } = normalizeMappingPart(
      initialsRaw[k as keyof typeof initialsRaw] as RawMappingPart
    );
    initialsMap.set(k, romanizations);
    initialsOptions.set(k, options);
  }

  const finalsRaw = data.finals ?? {};
  for (const k of Object.keys(finalsRaw)) {
    const { romanizations, options } = normalizeMappingPart(
      finalsRaw[k as keyof typeof finalsRaw] as RawMappingPart
    );
    finalsMap.set(k, romanizations);
    finalsOptions.set(k, options);
  }

  function autoFragmentPreference(jpKey: string, isFinal: boolean): number {
    const optsMap = isFinal ? finalsOptions : initialsOptions;
    const romanMap = isFinal ? finalsMap : initialsMap;
    const lst = romanMap.get(jpKey);
    const mappingList = lst ?? [jpKey];
    const opts = optsMap.get(jpKey);
    if (!opts?.length) return 1;
    for (const od of opts) {
      if (od.recommended) {
        return listPositionToNthNonemptyPreference(
          mappingList,
          od.preference_index
        );
      }
    }
    return 1;
  }

  function jyutpingToAnglicized(
    jyutpingToken: string,
    preference?: number | null
  ): string {
    const { initial, final, tone } = parseJyutping(jyutpingToken);
    const pi =
      preference !== undefined && preference !== null
        ? preference
        : autoFragmentPreference(initial, false);
    const pf =
      preference !== undefined && preference !== null
        ? preference
        : autoFragmentPreference(final, true);

    const initialList = initialsMap.get(initial) ?? [initial];
    let initialAng = getMappingValue(initialList, pi);
    if (!initialAng) initialAng = initial;

    const finalList = finalsMap.get(final) ?? [final];
    let finalAng = getMappingValue(finalList, pf);
    if (!finalAng) finalAng = final;

    let result = initialAng + finalAng;
    if (tone) result += tone;
    return result;
  }

  function translateJyutpingText(
    text: string,
    preference?: number | null
  ): string {
    const tokens = text.split(/(\s+)/u);
    const out = tokens.map((token) =>
      /^\s+$/u.test(token) ? token : jyutpingToAnglicized(token, preference)
    );
    return out.join("");
  }

  function getInitialVariants(jyutpingInitial: string): MappingOptionDetail[] {
    const opts = initialsOptions.get(jyutpingInitial);
    return copyVariantLists(
      opts?.length ? opts : defaultVariantOptions(jyutpingInitial)
    );
  }

  function getFinalVariants(jyutpingFinal: string): MappingOptionDetail[] {
    const opts = finalsOptions.get(jyutpingFinal);
    return copyVariantLists(opts?.length ? opts : defaultVariantOptions(jyutpingFinal));
  }

  function jyutpingSyllableChoiceInfo(
    jyutpingToken: string
  ): JyutpingSyllableChoiceInfo {
    const { initial, final, tone } = parseJyutping(jyutpingToken);
    return {
      jyutping: jyutpingToken.trim(),
      initial_key: initial,
      final_key: final,
      tone,
      auto_fragment_preferences: {
        initial: autoFragmentPreference(initial, false),
        final: autoFragmentPreference(final, true),
      },
      initial_variants: getInitialVariants(initial),
      final_variants: getFinalVariants(final),
    };
  }

  return {
    jyutpingToAnglicized,
    translateJyutpingText,
    jyutpingSyllableChoiceInfo,
  };
}

/** Default translator singleton (bundled mapping). */
export const angloCantoneseTranslator =
  loadTranslatorFromPayload(mappingData);
