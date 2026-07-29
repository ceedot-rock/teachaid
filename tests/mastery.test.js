const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  MASTERY_MIN,
  shouldIssueMasteryCert,
  buildMasteryCert,
  mergeCertIntoList,
  bannerForFinalGrade,
} = require("../lib/mastery");

describe("MASTERY_MIN", () => {
  it("is 91", () => {
    assert.equal(MASTERY_MIN, 91);
  });
});

describe("shouldIssueMasteryCert", () => {
  const base = { chapterIndex: 4, chapterCount: 5 };

  it("issues on final chapter pass at 91+", () => {
    assert.equal(
      shouldIssueMasteryCert({
        ...base,
        grade: { pass: true, score: 91 },
      }),
      true
    );
    assert.equal(
      shouldIssueMasteryCert({
        ...base,
        grade: { pass: true, score: 100 },
      }),
      true
    );
  });

  it("denies score 90 even with pass", () => {
    assert.equal(
      shouldIssueMasteryCert({
        ...base,
        grade: { pass: true, score: 90 },
      }),
      false
    );
  });

  it("denies high score without pass", () => {
    assert.equal(
      shouldIssueMasteryCert({
        ...base,
        grade: { pass: false, score: 95 },
      }),
      false
    );
  });

  it("denies non-final chapter even at 100", () => {
    assert.equal(
      shouldIssueMasteryCert({
        chapterIndex: 2,
        chapterCount: 5,
        grade: { pass: true, score: 100 },
      }),
      false
    );
  });

  it("denies missing grade or bad counts", () => {
    assert.equal(shouldIssueMasteryCert({ grade: null, chapterIndex: 0, chapterCount: 1 }), false);
    assert.equal(
      shouldIssueMasteryCert({
        grade: { pass: true, score: 95 },
        chapterIndex: 0,
        chapterCount: 0,
      }),
      false
    );
  });

  it("allows single-chapter course at 91+", () => {
    assert.equal(
      shouldIssueMasteryCert({
        chapterIndex: 0,
        chapterCount: 1,
        grade: { pass: true, score: 91 },
      }),
      true
    );
  });
});

describe("buildMasteryCert", () => {
  it("returns null when rules fail", () => {
    assert.equal(
      buildMasteryCert({
        grade: { pass: true, score: 80 },
        chapterIndex: 0,
        chapterCount: 1,
        bookId: "c1",
      }),
      null
    );
  });

  it("builds a course_mastery certificate", () => {
    const cert = buildMasteryCert({
      grade: { pass: true, score: 94 },
      chapterIndex: 3,
      chapterCount: 4,
      bookId: "col_psych",
      courseTitle: "Psych 101",
      teacher: "Pia",
      chapterName: "Social",
      learnerName: "Alex",
      now: "2026-07-29T00:00:00.000Z",
      idSuffix: "test",
    });
    assert.ok(cert);
    assert.equal(cert.kind, "course_mastery");
    assert.equal(cert.threshold, 91);
    assert.equal(cert.score, 94);
    assert.equal(cert.courseTitle, "Psych 101");
    assert.equal(cert.teacher, "Pia");
    assert.equal(cert.learnerName, "Alex");
    assert.equal(cert.bookId, "col_psych");
    assert.match(cert.id, /^cert_col_psych_/);
  });
});

describe("mergeCertIntoList", () => {
  it("issues a new certificate", () => {
    const cert = buildMasteryCert({
      grade: { pass: true, score: 91 },
      chapterIndex: 0,
      chapterCount: 1,
      bookId: "s1",
      courseTitle: "Counting",
      teacher: "Mira",
      idSuffix: "a",
    });
    const r = mergeCertIntoList([], cert);
    assert.equal(r.action, "issued");
    assert.equal(r.list.length, 1);
  });

  it("keeps higher existing score", () => {
    const low = buildMasteryCert({
      grade: { pass: true, score: 91 },
      chapterIndex: 0,
      chapterCount: 1,
      bookId: "s1",
      idSuffix: "a",
    });
    const high = buildMasteryCert({
      grade: { pass: true, score: 98 },
      chapterIndex: 0,
      chapterCount: 1,
      bookId: "s1",
      idSuffix: "b",
    });
    let r = mergeCertIntoList([], high);
    r = mergeCertIntoList(r.list, low);
    assert.equal(r.action, "kept");
    assert.equal(r.list[0].score, 98);
  });

  it("upgrades when new score is higher", () => {
    const low = buildMasteryCert({
      grade: { pass: true, score: 91 },
      chapterIndex: 0,
      chapterCount: 1,
      bookId: "s1",
      idSuffix: "a",
    });
    const high = buildMasteryCert({
      grade: { pass: true, score: 99 },
      chapterIndex: 0,
      chapterCount: 1,
      bookId: "s1",
      idSuffix: "b",
    });
    let r = mergeCertIntoList([], low);
    r = mergeCertIntoList(r.list, high);
    assert.equal(r.action, "upgraded");
    assert.equal(r.list[0].score, 99);
  });
});

describe("bannerForFinalGrade", () => {
  it("mastery banner at 91+ pass", () => {
    const b = bannerForFinalGrade({ pass: true, score: 93 });
    assert.equal(b.kind, "mastery");
    assert.match(b.text, /Certificate|mastery/i);
  });

  it("complete-but-not-mastery at 70–90 pass", () => {
    const b = bannerForFinalGrade({ pass: true, score: 85 });
    assert.equal(b.kind, "complete");
    assert.match(b.text, /91/);
  });
});
