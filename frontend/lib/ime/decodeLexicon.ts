/** JTC1 lexicon binary produced by `scripts/ime/build-lexicons.mjs`. */
export type LexEntry = { code: string; text: string; weight: number };

const MAGIC = "JTC1";

export function decodeLexicon(buf: ArrayBuffer): LexEntry[] {
  const u8 = new Uint8Array(buf);
  if (u8.length < 12) throw new Error("lexicon: buffer too small");
  const magic = String.fromCharCode(u8[0], u8[1], u8[2], u8[3]);
  if (magic !== MAGIC) throw new Error(`lexicon: bad magic ${magic}`);
  const dv = new DataView(buf);
  const version = dv.getUint32(4, true);
  if (version !== 1) throw new Error(`lexicon: unsupported version ${version}`);
  const n = dv.getUint32(8, true);
  const dec = new TextDecoder("utf-8");
  const out: LexEntry[] = [];
  let o = 12;
  for (let i = 0; i < n; i++) {
    if (o + 2 > u8.length) break;
    const cl = dv.getUint16(o, true);
    o += 2;
    if (o + cl > u8.length) break;
    const code = dec.decode(u8.subarray(o, o + cl));
    o += cl;
    if (o + 2 > u8.length) break;
    const tl = dv.getUint16(o, true);
    o += 2;
    if (o + tl + 4 > u8.length) break;
    const text = dec.decode(u8.subarray(o, o + tl));
    o += tl;
    const weight = dv.getFloat32(o, true);
    o += 4;
    out.push({ code, text, weight });
  }
  return out;
}
