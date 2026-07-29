/**
 * TEACHAiD lifetime Pro unlock by email allowlist.
 * Env:
 *   TEACHAID_LIFETIME_EMAILS — comma-separated emails (case-insensitive)
 *   TEACHAID_LIFETIME_SECRET — optional HMAC secret; defaults to XAI_API_KEY slice
 *
 * POST { email }
 * → { ok, pro, lifetime, email, unlock }
 *
 * Client stores unlock + email; restore trusts allowlist re-check when online.
 */
const crypto = require("crypto");

function normEmail(e) {
  return String(e || "")
    .trim()
    .toLowerCase();
}

function allowlist() {
  return String(process.env.TEACHAID_LIFETIME_EMAILS || "")
    .split(/[,;\s]+/)
    .map(normEmail)
    .filter(Boolean);
}

function sign(email) {
  const secret =
    process.env.TEACHAID_LIFETIME_SECRET ||
    process.env.XAI_API_KEY ||
    "teachaid-lifetime";
  return crypto
    .createHmac("sha256", secret)
    .update("lifetime:" + email)
    .digest("hex")
    .slice(0, 32);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    // status only — never list full emails publicly beyond count
    return res.status(200).json({
      ok: true,
      lifetime_slots: allowlist().length,
      note: "POST { email } to redeem lifetime Pro if allowlisted",
    });
  }

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

  const email = normEmail(body?.email);
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "Valid email required" });
  }

  const list = allowlist();
  if (!list.length) {
    return res.status(503).json({
      ok: false,
      error: "Lifetime list not configured on server",
    });
  }

  if (!list.includes(email)) {
    return res.status(403).json({
      ok: false,
      pro: false,
      error: "This email is not on the lifetime Pro list",
    });
  }

  const unlock = "lifetime:" + email + ":" + sign(email);
  return res.status(200).json({
    ok: true,
    pro: true,
    lifetime: true,
    email,
    unlock,
  });
};
