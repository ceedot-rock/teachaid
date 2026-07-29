/**
 * TEACHAiD student referral — signed Pro month grants.
 *
 * POST body:
 *  { action: "sign_apply", studentId, referralCode }
 *  { action: "sign_claim", studentId, thankYouCode }
 *  { action: "verify", unlock }  // unlock token from prior sign
 *
 * Returns HMAC unlock tokens the client stores as Pro entitlement.
 * Yearly cap (4) and one-referral rules are enforced in lib/student-referral
 * on the client; server signs time-bounded unlocks.
 *
 * Env: TEACHAID_REFERRAL_SECRET or XAI_API_KEY
 */
const crypto = require("crypto");
const R = require("../lib/student-referral");

function secret() {
  return (
    process.env.TEACHAID_REFERRAL_SECRET ||
    process.env.XAI_API_KEY ||
    "teachaid-referral-dev"
  );
}

function signPayload(obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url")
    .slice(0, 32);
  return body + "." + sig;
}

function verifyUnlock(token) {
  if (!token || typeof token !== "string" || token.indexOf(".") < 0) {
    return { ok: false, error: "Invalid unlock" };
  }
  const [body, sig] = token.split(".");
  const expect = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url")
    .slice(0, 32);
  if (sig !== expect) return { ok: false, error: "Bad signature" };
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const data = JSON.parse(json);
    if (!data || data.kind !== "referral_month") {
      return { ok: false, error: "Wrong token kind" };
    }
    if (Number(data.proUntil) < Date.now()) {
      return { ok: false, error: "Expired", expired: true, data };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Corrupt token" };
  }
}

function grantUnlock(studentId, proUntil, meta) {
  return signPayload({
    kind: "referral_month",
    studentId: R.normalizeStudentId(studentId),
    proUntil: proUntil,
    meta: meta || {},
    iat: Date.now(),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  const action = String(body?.action || "");

  if (action === "verify") {
    const v = verifyUnlock(body?.unlock);
    if (!v.ok) return res.status(400).json(v);
    return res.status(200).json({
      ok: true,
      pro: true,
      proUntil: v.data.proUntil,
      studentId: v.data.studentId,
    });
  }

  if (action === "sign_apply") {
    // Client already applied rules; we sign a month for the new student
    const studentId = R.normalizeStudentId(body?.studentId);
    const referralCode = R.normalizeStudentId(body?.referralCode);
    if (!R.isValidStudentId(studentId) || !R.isValidStudentId(referralCode)) {
      return res.status(400).json({ ok: false, error: "Invalid Student ID(s)" });
    }
    if (studentId === referralCode) {
      return res.status(400).json({ ok: false, error: "Cannot refer yourself" });
    }
    const proUntil = Date.now() + R.REFERRAL_MONTH_MS;
    const unlock = grantUnlock(studentId, proUntil, {
      role: "new_user",
      referredBy: referralCode,
    });
    // thank-you payload for referrer (unsigned structure; client encodes)
    const thankYou = {
      id: "TY-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      referrerId: referralCode,
      newStudentId: studentId,
      year: new Date().getUTCFullYear(),
      at: new Date().toISOString(),
    };
    const thankYouCode = R.encodeThankYou(thankYou);
    return res.status(200).json({
      ok: true,
      proUntil,
      unlock,
      thankYou,
      thankYouCode,
      reward: "1 month Pro for you; send thank-you code to your referrer",
      maxReferralsPerYear: R.MAX_REFERRALS_PER_YEAR,
    });
  }

  if (action === "sign_claim") {
    const studentId = R.normalizeStudentId(body?.studentId);
    const ty =
      body?.thankYou ||
      R.decodeThankYou(body?.thankYouCode || body?.code || "");
    if (!R.isValidStudentId(studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid Student ID" });
    }
    if (!ty || R.normalizeStudentId(ty.referrerId) !== studentId) {
      return res.status(400).json({
        ok: false,
        error: "Thank-you code does not match your Student ID",
      });
    }
    // Optional client-reported count for soft enforcement note
    const yearCount = Number(body?.referralsThisYear) || 0;
    if (yearCount >= R.MAX_REFERRALS_PER_YEAR) {
      return res.status(403).json({
        ok: false,
        error:
          "Referral limit is " +
          R.MAX_REFERRALS_PER_YEAR +
          " successful referrals per calendar year",
      });
    }
    const proUntil = Date.now() + R.REFERRAL_MONTH_MS;
    const unlock = grantUnlock(studentId, proUntil, {
      role: "referrer",
      fromStudentId: ty.newStudentId,
      thankYouId: ty.id,
    });
    return res.status(200).json({
      ok: true,
      proUntil,
      unlock,
      reward: "1 month Pro for successful referral",
      maxReferralsPerYear: R.MAX_REFERRALS_PER_YEAR,
    });
  }

  return res.status(400).json({
    ok: false,
    error: "Unknown action. Use sign_apply | sign_claim | verify",
  });
};

module.exports.verifyUnlock = verifyUnlock;
module.exports.grantUnlock = grantUnlock;
