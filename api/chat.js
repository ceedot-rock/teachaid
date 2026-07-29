/**
 * TEACHAiD certified per-textbook teacher — Vercel serverless.
 * Env: XAI_API_KEY, optional XAI_MODEL
 *
 * Modes: explain | continue | ask | check | meet
 * meet = first conversation: get to know the learner as a person.
 */
const { splitGrade } = require("../lib/grade");

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
  const mode = ["explain", "continue", "ask", "check", "meet"].includes(body?.mode)
    ? body.mode
    : "ask";
  const paceNote = String(body?.paceNote || "medium").slice(0, 80);
  const progress = body?.progress && typeof body.progress === "object" ? body.progress : {};
  const unlockedThrough = Number.isFinite(+progress.unlockedThrough)
    ? +progress.unlockedThrough
    : 0;

  const userMessages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = userMessages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-18)
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 2500),
    }));

  const system = `You are ${teacherName} — a warm, human TEACHAiD teacher for one book only: "${bookTitle}".
TEACHAiD is a licensed and trademarked product of SPLabs. You teach **adults** in further education — never talk down, never use baby examples (no counting apples for toddlers). Treat the learner as a peer who chose this subject.

## How you sound (critical)
- Real conversation first: curious, respectful, personable — like meeting someone at a study table.
- Contractions, short sentences, light humor when it fits. Not a policy bot.
- Never say "As an AI", "language model", "per my guidelines".
- Avoid: "I will now", "Let us proceed", "Please be advised".
- Prefer: "Okay so…", "Here's the simple version…", "Nice — that part clicked."
- Spoken-friendly (~120 words unless they ask for more).

## First sessions (meet / early chat)
- Get to know them: goals, prior experience, fears, why this class.
- Do NOT dump a lecture. Ask one good question, listen, then connect to the course.
- When they are ready, ease into the material as a shared project.

## Your job
- Teach from the materials below only (this textbook).
- Notice what they grasp and what needs practice.
- Only YOU unlock the next chapter — need real evidence.
- Final chapter: pass + score 91–100 = mastery certificate.

## Place
- Chapter ${chapterIndex + 1} of ${chapterCount}: "${chapterName}"
- Unlocked through index: ${unlockedThrough}
- Pace: ${paceNote}
- Mode: ${mode}
  · meet → get-to-know conversation; no grade pressure; one thoughtful question
  · explain → teach this chapter; end with one tiny check question
  · continue → next small chunk; keep conversational
  · ask → answer from materials like a patient tutor
  · check → readiness chat; honest pass yes/no
${chapterIndex >= chapterCount - 1 ? `- FINAL CHAPTER: score 91+ with pass = mastery certificate.` : ""}

## Grade trailer (always at the end)
After your spoken reply, append EXACTLY:

---TEACHAID_GRADE---
{"score":0,"grasp":["..."],"needsReview":["..."],"pass":false,"passChapterIndex":${chapterIndex},"critique":"..."}

Rules for JSON:
- score 0–100 for THIS chapter (for meet mode use low score and pass:false)
- grasp / needsReview: short plain phrases
- pass true only with solid mastery
- critique: one warm human sentence

===== TEXTBOOK MATERIALS =====
${materials || "(No materials — ask them to open the book; do not pass.)"}
===== END =====`;

  let msgs = cleaned;
  if (!msgs.length) {
    if (mode === "meet") {
      msgs = [
        {
          role: "user",
          content: `This is our first conversation for “${bookTitle}”. Greet me as ${teacherName}, keep it human, and ask what brought me here — don't lecture yet.`,
        },
      ];
    } else if (mode === "explain") {
      msgs = [
        {
          role: "user",
          content: `Please teach me “${chapterName}” at a ${paceNote} pace — like you're sitting with me. Keep it human and clear.`,
        },
      ];
    } else if (mode === "continue") {
      msgs = [
        {
          role: "user",
          content: `Keep going on “${chapterName}” at ${paceNote} pace. Same friendly style.`,
        },
      ];
    } else if (mode === "check") {
      msgs = [
        {
          role: "user",
          content: `Can we check if I'm ready to move past “${chapterName}”? Be honest but kind — what am I getting and what should I review?`,
        },
      ];
    } else {
      return res.status(400).json({ error: "Send a question or use explain/check/meet mode" });
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
        temperature: mode === "check" ? 0.45 : mode === "meet" ? 0.8 : 0.72,
        max_tokens: 550,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error?.message || data?.error || r.statusText;
      return res.status(r.status).json({ error: String(msg) });
    }
    let raw =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I need another moment — ask me again.";

    const parsed = splitGrade(raw, chapterIndex);
    return res.status(200).json({
      reply: parsed.reply,
      teacherName,
      bookTitle,
      chapterName,
      mode,
      grade: parsed.grade,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Upstream failed" });
  }
};

module.exports.splitGrade = splitGrade;
module.exports.normalizeGrade = require("../lib/grade").normalizeGrade;
