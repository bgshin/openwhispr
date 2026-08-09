const HANGUL = /[\uac00-\ud7a3]/g;
const LATIN = /[A-Za-z]/g;

/**
 * Classify by the dominant writing system rather than one incidental character.
 * This keeps an English sentence containing a Korean name on the English path.
 */
export const isKoreanText = (text: string) => {
  const hangulCount = text.match(HANGUL)?.length ?? 0;
  const latinCount = text.match(LATIN)?.length ?? 0;
  return hangulCount > 0 && hangulCount >= latinCount;
};

export const getMeetingTranslationTarget = (text: string) => (isKoreanText(text) ? "en" : "ko");

/** A companion must be in the requested column, not a normalized copy of its source. */
export const isMeetingTranslationInTargetLanguage = (text: string, target: "ko" | "en") =>
  target === "ko" ? isKoreanText(text) : !isKoreanText(text);
