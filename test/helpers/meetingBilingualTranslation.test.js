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

test("Korean companion text may retain technical English terms", async () => {
  const { isMeetingTranslationInTargetLanguage } = await load();
  assert.equal(
    isMeetingTranslationInTargetLanguage("GPT-5 Mini API 요청을 2048 토큰으로 보냅니다.", "ko"),
    true
  );
  assert.equal(isMeetingTranslationInTargetLanguage("GPT-5 Mini API request", "ko"), false);
});

test("long meeting speech is split for translation but preserves sentence order", async () => {
  const { splitMeetingTranslationText } = await load();
  const source = "첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.";
  assert.deepEqual(splitMeetingTranslationText(source, 14), [
    "첫 번째 문장입니다.",
    "두 번째 문장입니다.",
    "세 번째 문장입니다.",
  ]);
});

test("unpunctuated long speech is split within the requested bound", async () => {
  const { splitMeetingTranslationText } = await load();
  const chunks = splitMeetingTranslationText("one two three four five six seven", 12);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 12));
  assert.equal(chunks.join(" "), "one two three four five six seven");
});
