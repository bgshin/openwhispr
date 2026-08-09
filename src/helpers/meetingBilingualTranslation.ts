const HANGUL = /[\uac00-\ud7a3]/g;
const LATIN = /[A-Za-z]/g;
const SENTENCE_BOUNDARY = /[^.!?。！？]+[.!?。！？]*(?:\s+|$)/g;

export const MEETING_TRANSLATION_CHUNK_MAX_CHARS = 180;

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

/**
 * A Korean translation may legitimately retain English product names, code, or
 * acronyms. Require Korean to be present rather than treating those terms as a
 * failure. English output still must not contain Hangul: that would place an
 * untranslated Korean source in the English column.
 */
export const isMeetingTranslationInTargetLanguage = (text: string, target: "ko" | "en") => {
  const { hangulCharacters } = getMeetingTextScriptStats(text);
  return target === "ko" ? hangulCharacters > 0 : hangulCharacters === 0;
};

/** Safe response diagnostics: character counts only, never transcript content. */
export const getMeetingTextScriptStats = (text: string) => ({
  characters: text.length,
  hangulCharacters: text.match(HANGUL)?.length ?? 0,
  latinCharacters: text.match(LATIN)?.length ?? 0,
});

/**
 * Bound a translation request without changing the transcript segment shown to
 * the user. Sentences stay together where possible; unpunctuated speech is
 * split at whitespace, then as a last resort at the safe character boundary.
 */
export const splitMeetingTranslationText = (
  text: string,
  maxChars = MEETING_TRANSLATION_CHUNK_MAX_CHARS
): string[] => {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length <= maxChars) return trimmed ? [trimmed] : [];

  const sentences = trimmed.match(SENTENCE_BOUNDARY)?.map((part) => part.trim()).filter(Boolean) || [trimmed];
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current) chunks.push(current);
    current = "";
  };
  const append = (part: string) => {
    if (!current) {
      current = part;
    } else if (current.length + 1 + part.length <= maxChars) {
      current = `${current} ${part}`;
    } else {
      flush();
      current = part;
    }
  };

  for (let sentence of sentences) {
    while (sentence.length > maxChars) {
      const whitespace = sentence.lastIndexOf(" ", maxChars);
      const boundary = whitespace >= Math.floor(maxChars / 2) ? whitespace : maxChars;
      append(sentence.slice(0, boundary).trim());
      sentence = sentence.slice(boundary).trim();
    }
    append(sentence);
  }
  flush();
  return chunks;
};
