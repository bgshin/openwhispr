/** Korean is identified from its script, which remains reliable when STT language is auto. */
export const isKoreanText = (text: string) => /[\uac00-\ud7a3]/.test(text);

export const getMeetingTranslationTarget = (text: string) => (isKoreanText(text) ? "en" : "ko");
