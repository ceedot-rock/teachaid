const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  PASS_MIN_SCORE,
  GRADE_MARKER,
  normalizeGrade,
  splitGrade,
  nextUnlockedThrough,
} = require("../lib/grade");

describe("normalizeGrade", () => {
  it("accepts a solid pass at 70+", () => {
    const g = normalizeGrade(
      { score: 72, grasp: ["x"], needsReview: ["y"], pass: true, critique: "ok" },
      2
    );
    assert.equal(g.pass, true);
    assert.equal(g.score, 72);
    assert.equal(g.passChapterIndex, 2);
  });

  it("rejects pass when score is below PASS_MIN_SCORE", () => {
    const g = normalizeGrade(
      { score: 69, pass: true, grasp: [], needsReview: [] },
      0
    );
    assert.equal(g.pass, false);
    assert.equal(g.passChapterIndex, null);
    assert.equal(g.score, 69);
  });

  it("rejects pass when needsReview has more than 2 items", () => {
    const g = normalizeGrade(
      {
        score: 90,
        pass: true,
        needsReview: ["a", "b", "c"],
        grasp: [],
      },
      1
    );
    assert.equal(g.pass, false);
  });

  it("clamps score to 0–100", () => {
    assert.equal(normalizeGrade({ score: 150, pass: false }, 0).score, 100);
    assert.equal(normalizeGrade({ score: -5, pass: false }, 0).score, 0);
  });

  it("accepts pass as string true", () => {
    const g = normalizeGrade({ score: 80, pass: "true", needsReview: [] }, 0);
    assert.equal(g.pass, true);
  });

  it("returns null for bad input", () => {
    assert.equal(normalizeGrade(null, 0), null);
    assert.equal(normalizeGrade("nope", 0), null);
  });
});

describe("splitGrade", () => {
  it("splits reply from grade trailer", () => {
    const raw =
      "Nice work on loops!\n\n" +
      GRADE_MARKER +
      '\n{"score":88,"grasp":["loops"],"needsReview":[],"pass":true,"critique":"Solid"}';
    const { reply, grade } = splitGrade(raw, 3);
    assert.match(reply, /Nice work/);
    assert.equal(grade.score, 88);
    assert.equal(grade.pass, true);
    assert.equal(grade.passChapterIndex, 3);
  });

  it("handles missing grade marker", () => {
    const { reply, grade } = splitGrade("Just chat.", 0);
    assert.equal(reply, "Just chat.");
    assert.equal(grade, null);
  });

  it("recovers JSON if fence junk after marker", () => {
    const raw =
      "Done.\n" +
      GRADE_MARKER +
      '\nnot json {"score":91,"grasp":[],"needsReview":[],"pass":true,"critique":"Mastery"} trailing';
    const { grade } = splitGrade(raw, 4);
    assert.equal(grade.score, 91);
    assert.equal(grade.pass, true);
  });
});

describe("nextUnlockedThrough", () => {
  it("unlocks next chapter on pass", () => {
    assert.equal(nextUnlockedThrough(0, 0, { pass: true, passChapterIndex: 0 }), 1);
    assert.equal(nextUnlockedThrough(2, 2, { pass: true, passChapterIndex: 2 }), 3);
  });

  it("does not unlock without pass", () => {
    assert.equal(
      nextUnlockedThrough(1, 1, { pass: false, passChapterIndex: null }),
      1
    );
  });

  it("never decreases unlock progress", () => {
    assert.equal(
      nextUnlockedThrough(5, 1, { pass: true, passChapterIndex: 1 }),
      5
    );
  });
});

describe("constants", () => {
  it("PASS_MIN_SCORE is 70", () => {
    assert.equal(PASS_MIN_SCORE, 70);
  });
});
