export type ImeProfile = "web" | "font";

export const IME_PROFILE_STORAGE_KEY = "jyutcitzi-ime-profile";

export const LEXICON_URL: Record<ImeProfile, string> = {
  web: "/ime/lexicon-web-v1.bin",
  font: "/ime/lexicon-font-v1.bin",
};
