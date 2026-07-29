/**
 * TEACHAiD · Stripe Connect Express onboarding
 *
 * Locked splits (Corey 2026-07-29):
 *   Curriculum royalties: 70% creator / 30% TEACHAiD (after $3 submit accepted)
 *   Chaternity join $1/mo: 90% creator / 10% TEACHAiD Fund (application_fee_percent: 10)
 *
 * Room state stays on-device + share codes; money path uses Connect.
 *
 * Env: STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY (must allow Connect write)
 *
 * POST { action: "create" | "link", email?, account_id?, country? }
 *   create → { ok, account_id, url }  Express account + Account Link
 *   link   → { ok, account_id, url }  fresh Account Link for existing account
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const key =
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_RESTRICTED_KEY ||
    process.env.STRIPE_API_KEY;
  if (!key) {
    return res.status(503).json({ ok: false, error: "Stripe key not configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const action = body.action || "create";
  const base =
    process.env.TEACHAID_PUBLIC_URL ||
    (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-host"]
      ? `${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}`
      : "https://teachaid.vercel.app");
  const returnUrl = `${base}/?connect=return`;
  const refreshUrl = `${base}/?connect=refresh`;

  const form = (obj) =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");

  async function stripePost(path, params) {
    const r = await fetch(`https://api.stripe.com/v1${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form(params),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  }

  try {
    let accountId = (body.account_id || "").trim();

    if (action === "create" || !accountId) {
      const email = (body.email || "").trim().toLowerCase();
      const country = (body.country || "US").toUpperCase().slice(0, 2);
      const created = await stripePost("/accounts", {
        type: "express",
        country,
        email: email || undefined,
        "capabilities[transfers][requested]": "true",
        "metadata[app]": "teachaid",
        "metadata[role]": "creator",
        "business_profile[product_description]":
          "TEACHAiD curriculum creator / Chaternity room host — SPLabs",
      });
      if (!created.ok) {
        return res.status(created.status).json({
          ok: false,
          error: created.data?.error?.message || "Account create failed",
          hint: "Complete Connect platform profile at dashboard.stripe.com/connect/accounts/overview",
        });
      }
      accountId = created.data.id;
    }

    const link = await stripePost("/account_links", {
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    if (!link.ok) {
      return res.status(link.status).json({
        ok: false,
        account_id: accountId,
        error: link.data?.error?.message || "Account Link failed",
      });
    }

    return res.status(200).json({
      ok: true,
      account_id: accountId,
      url: link.data.url,
      splits: {
        curriculum: { creator: 70, teachaid: 30 },
        chaternity_join: { creator: 90, teachaid_fund: 10, application_fee_percent: 10 },
      },
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message || "Connect onboard failed" });
  }
};
