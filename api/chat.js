/**
 * TEACHAiD per-textbook teacher — Vercel serverless.
 * Env: XAI_API_KEY, optional XAI_MODEL
 *
 * Body:
 * {
 *   bookId, bookTitle, teacherName,
 *   chapterName, chapterIndex, chapterCount,
 *   materials,          // full plain-text textbook for this book
 *   mode: "explain" | "continue" | "ask",
 *   messages: [{role, content}],
 *   paceNote?: string
 * }
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Teacher offline: XAI_API_KEY not set (Vercel project env).",
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

  const bookTitle = String(body?.bookTitle || "this textbook").slice(0, 120);
  const teacherName = String(body?.teacherName || "Your teacher").slice(0, 80);
  const chapterName = String(body?.chapterName || "current section").slice(0, 120);
  const chapterIndex = Number.isFinite(+body?.chapterIndex) ? +body.chapterIndex : 0;
  const chapterCount = Number.isFinite(+body?.chapterCount) ? +body.chapterCount : 1;
  const materials = String(body?.materials || "").slice(0, 14000);
  const mode = ["explain", "continue", "ask"].includes(body?.mode)
    ? body.mode
    : "ask";
  const paceNote = String(body?.paceNote || "medium").slice(0, 80);

  const userMessages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = userMessages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-16)
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 2500),
    }));

  const system = `You are ${teacherName}, the dedicated teacher for ONE textbook only: "${bookTitle}".

Identity:
- You belong to this textbook. You know it cover-to-cover.
- You do NOT invent other curricula. Stay inside the materials below.
- Audience: complete beginners (kids and adults starting from zero).

Teaching style:
- Thorough but calm. One idea at a time. Short paragraphs.
- Use concrete examples (apples, steps, on/off lights) matching the book.
- Check understanding gently: offer a tiny check question when natural.
- Match pace: "${paceNote}" — slow = more steps & pauses; medium = clear chunks; fast = denser but still simple.
- Encourage. Never shame. No jargon without a plain definition.

Current place in the book:
- Chapter ${chapterIndex + 1} of ${chapterCount}: "${chapterName}"
- Mode: ${mode}
  - explain = teach THIS chapter thoroughly from the materials, as if reading aloud and explaining at the learner's pace. End by inviting questions or "continue".
  - continue = they want the next chunk of the same chapter/book explanation (do not restart from zero unless needed).
  - ask = answer their question using the materials; quote or paraphrase the relevant part; offer a deeper follow-up.

If they ask outside this book, say briefly that this teacher is for "${bookTitle}" and answer only what the materials support, or invite them to open another book.

Keep spoken-friendly replies under ~150 words unless they ask for more detail.

===== TEXTBOOK MATERIALS (ground truth) =====
${materials || "(No materials provided — say you need the book open.)"}
===== END MATERIALS =====`;

  // Seed user turn by mode if no messages yet
  let msgs = cleaned;
  if (!msgs.length) {
    if (mode === "explain") {
      msgs = [
        {
          role: "user",
          content: `Please teach me chapter "${chapterName}" thoroughly, at a ${paceNote} pace. Read and explain the materials carefully.`,
        },
      ];
    } else if (mode === "continue") {
      msgs = [
        {
          role: "user",
          content: `Continue explaining from where we left off in "${chapterName}". Same pace (${paceNote}).`,
        },
      ];
    } else {
      return res.status(400).json({ error: "Send a question or use explain mode" });
    }
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
        messages: [{ role: "system", content: system }, ...msgs],
        temperature: 0.55,
        max_tokens: 550,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error?.message || data?.error || r.statusText;
      return res.status(r.status).json({ error: String(msg) });
    }
    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I lost my place — ask me to explain this chapter again.";
    return res.status(200).json({
      reply: text,
      teacherName,
      bookTitle,
      chapterName,
      mode,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Upstream failed" });
  }
};
