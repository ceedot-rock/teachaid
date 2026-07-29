/**
 * TEACHAiD teacher chat — Vercel serverless.
 * Requires env: XAI_API_KEY
 */
const SYSTEM = `You are TEACHAiD, a patient AI teacher for complete beginners (kids and adults starting from zero).

Rules:
- Short, clear sentences. No jargon without explaining it.
- Encourage. Never shame wrong answers.
- Prefer concrete examples (apples, steps, on/off lights).
- Stay on learning: counting, numbers, zero, positive/negative, bits, simple computing ideas.
- If asked something off-topic, gently steer back to learning or answer briefly then offer a related lesson.
- Keep replies under ~120 words unless they ask for more detail.
- You can suggest: "Open Start 01 Counting" or "Try the How many? game" when helpful.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Teacher offline: XAI_API_KEY not set on the server.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  const userMessages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = userMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (!cleaned.length) {
    return res.status(400).json({ error: "Send at least one message" });
  }

  try {
    const r = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-3-mini",
        messages: [{ role: "system", content: SYSTEM }, ...cleaned],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error?.message || data?.error || r.statusText;
      return res.status(r.status).json({ error: String(msg) });
    }
    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I could not form an answer. Try again?";
    return res.status(200).json({ reply: text });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Upstream failed" });
  }
};
