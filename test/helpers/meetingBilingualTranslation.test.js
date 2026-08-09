const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/helpers/meetingBilingualTranslation.ts");

test("meeting bilingual routing keeps Korean on the Korean side", async () => {
  const { getMeetingTranslationTarget, isKoreanText } = await load();
  assert.equal(isKoreanText("회의를 시작하겠습니다."), true);
  assert.equal(getMeetingTranslationTarget("회의를 시작하겠습니다."), "en");
});

test("meeting bilingual routing sends English to Korean", async () => {
  const { getMeetingTranslationTarget, isKoreanText } = await load();
  assert.equal(isKoreanText("Let's start the meeting."), false);
  assert.equal(getMeetingTranslationTarget("Let's start the meeting."), "ko");
});

test("meeting bilingual routing follows the dominant script", async () => {
  const { getMeetingTranslationTarget, isMeetingTranslationInTargetLanguage } = await load();
  assert.equal(getMeetingTranslationTarget("Shinbongun will join the 회의 later."), "ko");
  assert.equal(isMeetingTranslationInTargetLanguage("회의에 나중에 참석합니다.", "ko"), true);
  assert.equal(isMeetingTranslationInTargetLanguage("Shinbongun will join later.", "en"), true);
  assert.equal(isMeetingTranslationInTargetLanguage("회의에 나중에 참석합니다.", "en"), false);
});
