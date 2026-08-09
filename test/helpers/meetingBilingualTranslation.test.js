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
