/**
 * TEACHAiD · Financial AI Dept — settle a creator payout
 *
 * School bursar model: platform holds funds; this endpoint transfers
 * an approved amount to a connected Express account.
 *
 * Env: STRIPE_SECRET_KEY (write) · optional SETTLE_ADMIN_TOKEN
 *
 * POST {
 *   account_id: "acct_…",   // Express connected account
 *   amount_cents: 900,       // integer cents
 *   currency?: "usd",
 *   period?: "2026-08",
 *   memo?: "Chaternity joins Aug",
 *   admin_token?: string     // if SETTLE_ADMIN_TOKEN set on Vercel
 * }
 * → { ok, transfer_id, amount_cents, destination }
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!key) {
    return res.status(503).json({
      ok: false,
      error: "STRIPE_SECRET_KEY required for transfers (restricted key often lacks transfer write)",
    });
  }

  const admin = process.env.SETTLE_ADMIN_TOKEN;
  if (admin) {
    const body0 = typeof req.body === "string" ? {} : req.body || {};
    const tok =
      req.headers["x-admin-token"] ||
      body0.admin_token ||
      "";
    if (tok !== admin) {
      return res.status(401).json({ ok: false, error: "Unauthorized settle" });
    }
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const accountId = String(body.account_id || "").trim();
  const amount = parseInt(body.amount_cents, 10);
  const currency = String(body.currency || "usd").toLowerCase();
  const period = String(body.period || "").slice(0, 32);
  const memo = String(body.memo || "TEACHAiD creator settle").slice(0, 500);

  if (!accountId.startsWith("acct_")) {
    return res.status(400).json({ ok: false, error: "Invalid account_id" });
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return res.status(400).json({ ok: false, error: "amount_cents must be positive integer" });
  }

  const form = (obj) =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");

  try {
    const r = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form({
        amount,
        currency,
        destination: accountId,
        description: memo,
        "metadata[app]": "teachaid",
        "metadata[period]": period,
        "metadata[dept]": "financial_ai",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: data?.error?.message || "Transfer failed",
        code: data?.error?.code,
      });
    }
    return res.status(200).json({
      ok: true,
      transfer_id: data.id,
      amount_cents: data.amount,
      currency: data.currency,
      destination: data.destination,
      period,
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message || "Settle failed" });
  }
};
