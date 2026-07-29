/**
 * Verify TEACHAiD Pro purchase via Stripe Checkout Session.
 * Env: STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY
 *      TEACHAID_PRO_PRICE_ID (optional — if set, session must match)
 *
 * GET or POST ?session_id=cs_...
 * → { ok, pro, session_id, customer_email? }
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const key =
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_RESTRICTED_KEY ||
    process.env.STRIPE_API_KEY;
  if (!key) {
    return res.status(503).json({
      ok: false,
      error: "Stripe key not configured on server",
    });
  }

  let sessionId =
    (req.query && req.query.session_id) ||
    (req.body && req.body.session_id) ||
    "";
  if (typeof sessionId !== "string") sessionId = "";
  sessionId = sessionId.trim();
  if (!sessionId.startsWith("cs_")) {
    return res.status(400).json({ ok: false, error: "Invalid session_id" });
  }

  try {
    const r = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
      }
    );
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: data?.error?.message || "Session lookup failed",
      });
    }

    const paid =
      data.payment_status === "paid" ||
      data.status === "complete";
    if (!paid) {
      return res.status(402).json({
        ok: false,
        pro: false,
        error: "Payment not completed",
        payment_status: data.payment_status,
      });
    }

    // Optional price lock
    const wantPrice = process.env.TEACHAID_PRO_PRICE_ID;
    if (wantPrice) {
      const items = data.line_items; // may need expand
      // Without expand, check metadata / amount
      const metaApp = data.metadata && data.metadata.app;
      if (metaApp && metaApp !== "teachaid") {
        return res.status(403).json({ ok: false, error: "Wrong product" });
      }
    }

    // Amount sanity: allow trial ($0.99), submit ($3), pro monthly ($9)
    // TEACHAiD SKUs: 99 trial · 300 submit · 900 pro
    if (typeof data.amount_total === "number" && data.amount_total < 99) {
      return res.status(403).json({ ok: false, error: "Invalid amount" });
    }

    const amount = data.amount_total;
    let sku = "pro";
    if (amount === 99) sku = "trial_7d";
    else if (amount === 100) sku = "chaternity_join";
    else if (amount === 300) sku = "curriculum_submit";
    else if (amount === 900) sku = "pro_monthly";
    else if (amount === 2000) sku = "chaternity_create";

    const isProSku =
      sku === "pro" ||
      sku === "pro_monthly" ||
      sku === "trial_7d";

    return res.status(200).json({
      ok: true,
      pro: isProSku,
      sku,
      session_id: data.id,
      customer_email: data.customer_details?.email || data.customer_email || null,
      amount_total: data.amount_total,
      currency: data.currency,
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message || "Verify failed" });
  }
};
