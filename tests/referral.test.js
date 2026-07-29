const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const R = require("../lib/student-referral");

describe("student ID", () => {
  it("generates valid TA-XXXXXXXX ids", () => {
    for (let i = 0; i < 20; i++) {
      const id = R.generateStudentId();
      assert.equal(R.isValidStudentId(id), true, id);
    }
  });

  it("normalizes case and spacing", () => {
    assert.equal(R.normalizeStudentId(" ta-abcd1234 "), "TA-ABCD1234");
  });
});

describe("applyReferralCode", () => {
  it("grants month and thank-you; blocks second use", () => {
    let acc = R.emptyAccount();
    const ref = R.generateStudentId();
    const at = new Date();
    const r1 = R.applyReferralCode(acc, ref, at);
    assert.equal(r1.ok, true);
    assert.ok(r1.account.proUntil > at.getTime());
    assert.equal(r1.account.usedReferral, true);
    assert.equal(r1.account.referredBy, ref);
    assert.ok(r1.thankYou.id);
    assert.equal(r1.thankYou.referrerId, ref);

    const r2 = R.applyReferralCode(r1.account, R.generateStudentId());
    assert.equal(r2.ok, false);
  });

  it("blocks self-referral", () => {
    const acc = R.emptyAccount();
    const r = R.applyReferralCode(acc, acc.studentId);
    assert.equal(r.ok, false);
  });
});

describe("claimThankYou yearly cap", () => {
  it("allows up to 4 per year then blocks", () => {
    let referrer = R.emptyAccount();
    const at = new Date("2026-06-15T12:00:00Z");
    for (let i = 0; i < 4; i++) {
      const newbie = R.emptyAccount();
      const applied = R.applyReferralCode(newbie, referrer.studentId, at);
      assert.equal(applied.ok, true);
      const claim = R.claimThankYou(referrer, applied.thankYou, at);
      assert.equal(claim.ok, true, "claim " + i);
      referrer = claim.account;
    }
    assert.equal(R.referralsInYear(referrer, 2026).length, 4);
    const extra = R.emptyAccount();
    const applied5 = R.applyReferralCode(extra, referrer.studentId, at);
    const claim5 = R.claimThankYou(referrer, applied5.thankYou, at);
    assert.equal(claim5.ok, false);
    assert.match(claim5.error, /limit|4/i);
  });

  it("resets cap in a new calendar year", () => {
    let referrer = R.emptyAccount();
    const y1 = new Date("2026-11-01T00:00:00Z");
    for (let i = 0; i < 4; i++) {
      const n = R.emptyAccount();
      const a = R.applyReferralCode(n, referrer.studentId, y1);
      const c = R.claimThankYou(referrer, a.thankYou, y1);
      referrer = c.account;
    }
    const y2 = new Date("2027-01-10T00:00:00Z");
    const n = R.emptyAccount();
    const a = R.applyReferralCode(n, referrer.studentId, y2);
    const c = R.claimThankYou(referrer, a.thankYou, y2);
    assert.equal(c.ok, true);
    assert.equal(R.referralsInYear(c.account, 2026).length, 4);
    assert.equal(R.referralsInYear(c.account, 2027).length, 1);
  });
});

describe("thank-you encode/decode", () => {
  it("round-trips", () => {
    const ty = {
      id: "TY-TEST",
      referrerId: "TA-ABCD2345",
      newStudentId: "TA-EFGH6789",
      year: 2026,
      at: "2026-07-29T00:00:00.000Z",
    };
    const code = R.encodeThankYou(ty);
    assert.match(code, /^TEACHAiD_TY:/);
    const back = R.decodeThankYou(code);
    assert.equal(back.id, ty.id);
    assert.equal(back.referrerId, ty.referrerId);
    assert.equal(back.newStudentId, ty.newStudentId);
  });
});

describe("constants", () => {
  it("max 4 per year and ~30 day month", () => {
    assert.equal(R.MAX_REFERRALS_PER_YEAR, 4);
    assert.ok(R.REFERRAL_MONTH_MS >= 28 * 24 * 60 * 60 * 1000);
  });
});
