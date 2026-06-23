import { normalizeAlias } from "./normalize";
import type { GoetsusiojiLexicon, GoetsusiojiMeta } from "./types";

type MappingEntry = {
  char?: string;
  kind?: string;
};

export class GoetsusiojiMapper {
  private readonly lex: GoetsusiojiLexicon;
  private readonly initials: string[];
  private readonly finals: string[];

  constructor(lex: GoetsusiojiLexicon, meta: GoetsusiojiMeta) {
    this.lex = lex;
    this.initials = [...meta.initials_order].sort((a, b) => b.length - a.length);
    this.finals = [...meta.finals_order].sort((a, b) => b.length - a.length);
  }

  splitSyllable(text: string): [string, string] | null {
    const key = normalizeAlias(text);
    if (!key) return null;
    for (const ini of this.initials) {
      if (!key.startsWith(ini)) continue;
      const rest = key.slice(ini.length);
      for (const fin of this.finals) {
        if (rest === fin) return [ini, fin];
      }
    }
    return null;
  }

  fromRomanization(text: string): MappingEntry | null {
    const key = normalizeAlias(text);
    if (!key) return null;
    const glyphs = this.lex.map[key];
    if (glyphs?.length) {
      return { char: glyphs[0], kind: "syllable" };
    }
    const split = this.splitSyllable(key);
    if (split) {
      const compact = split[0] + split[1];
      const compactGlyphs = this.lex.map[compact];
      if (compactGlyphs?.length) {
        return { char: compactGlyphs[0], kind: "syllable" };
      }
    }
    return null;
  }

  transliterateWords(phrase: string): Array<{
    token: string;
    type: string;
    mapping: MappingEntry | null;
  }> {
    const out: Array<{
      token: string;
      type: string;
      mapping: MappingEntry | null;
    }> = [];
    for (const raw of phrase.trim().split(/\s+/)) {
      const token = raw.trim().replace(/^\[|\]$/g, "");
      if (!token) continue;
      const direct = this.fromRomanization(token);
      if (direct) {
        out.push({ token, type: direct.kind ?? "syllable", mapping: direct });
        continue;
      }
      out.push({ token, type: "unknown", mapping: null });
    }
    return out;
  }

  transliterateText(phrase: string): string {
    const chars: string[] = [];
    for (const item of this.transliterateWords(phrase)) {
      const mapping = item.mapping;
      if (mapping?.char) chars.push(mapping.char);
      else chars.push(`[${item.token}]`);
    }
    return chars.join("");
  }
}
