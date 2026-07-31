const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const SP = require("../lib/slidPhiPack");

describe("teachaid slid-phi progress pack", () => {
  it("loads slid-phi codec", () => {
    assert.equal(SP.available(), true);
  });

  it("round-trips score integers", () => {
    const scores = [70, 85, 91, 100, 0, 55];
    const packed = SP.packInts(scores, { mode: "universe", M: 101 });
    assert.ok(packed.length > 0);
    assert.deepEqual(SP.unpackInts(packed), scores);
  });

  it("round-trips progress map + export code", () => {
    const all = {
      "foundations-count": {
        unlockedThrough: 3,
        grades: {
          0: { score: 88, pass: true, grasp: ["a"], needsReview: [], critique: "ok", at: "2026-07-01" },
          1: { score: 72, pass: true, grasp: [], needsReview: ["b"], critique: "", at: "2026-07-02" },
          2: { score: 95, pass: true, grasp: [], needsReview: [], critique: "great", at: "2026-07-03" },
        },
      },
    };
    const blob = SP.packProgress(all);
    assert.equal(blob.sp, 1);
    assert.ok(blob.books["foundations-count"].scores);
    const back = SP.unpackProgress(blob);
    assert.equal(back["foundations-count"].unlockedThrough, 3);
    assert.equal(back["foundations-count"].grades["0"].score, 88);
    assert.equal(back["foundations-count"].grades["0"].pass, true);
    assert.equal(back["foundations-count"].grades["2"].score, 95);

    const code = SP.exportProgressCode(all);
    assert.match(code, /^TASP1\./);
    const imported = SP.importProgressCode(code);
    assert.equal(imported["foundations-count"].grades["1"].score, 72);
    assert.equal(imported["foundations-count"].grades["1"].pass, true);
  });
});
