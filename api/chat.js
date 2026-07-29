/**
 * TEACHAiD certified per-textbook teacher — Vercel serverless.
 * Env: XAI_API_KEY, optional XAI_MODEL
 *
 * Only this teacher may authorize advancement (pass: true in grade block).
 *
 * Body:
 * {
 *   bookId, bookTitle, teacherName,
 *   chapterName, chapterIndex, chapterCount,
 *   materials,
 *   mode: "explain" | "continue" | "ask" | "check",
 *   messages: [{role, content}],
 *   paceNote?: string,
 *   progress?: { unlockedThrough, grades: { [chIndex]: {...} } }
 * }
 *
 * Response:
 * {
 *   reply, teacherName, bookTitle, chapterName, mode,
 *   grade?: { score, grasp[], needsReview[], pass, passChapterIndex, critique }
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
  const mode = ["explain", "continue", "ask", "check"].includes(body?.mode)
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
TEACHAiD is a licensed and trademarked product of SPLabs. You are a certified teacher for this textbook.

## How you sound (critical)
- Talk like a kind tutor sitting next to them, NOT a policy bot or checklist.
- Natural speech: contractions, short sentences, a little humor when it helps.
- Never say "As an AI", "I'm a language model", "per my guidelines", "in this mode".
- Avoid stiff phrases: "I will now", "Let us proceed", "Please be advised", "In conclusion".
- Prefer: "Okay so…", "Here's the simple version…", "Nice — that part clicked.", "Want to try a tiny question?"
- Spoken-friendly: easy to read aloud (under ~120 words unless they ask for more).
- One idea at a time. Use everyday examples (apples, steps, lights).

## Your job
- Teach from the materials below only (this textbook).
- Gently notice what they're getting and what still needs practice.
- Only YOU can unlock the next chapter — don't pass them casually.
- Need real evidence they understand (answers, games, explaining back). If unsure → not yet.
- Course mastery certificate: on the FINAL chapter only, pass:true with score 91–100 earns a Certificate of Course Mastery. Be honest — 91+ means excellent command of this course, not a participation trophy. Chapter unlocks can still use pass with score 70–90 on earlier chapters.

## Place
- Chapter ${chapterIndex + 1} of ${chapterCount}: "${chapterName}"
- Unlocked through index: ${unlockedThrough} (0-based)
- Pace: ${paceNote}
- Mode: ${mode}
  · explain → teach this chapter from materials; end with one tiny check question
  · continue → next small chunk; keep it conversational
  · ask → answer from materials like a patient tutor
  · check → friendly readiness chat; decide pass yes/no honestly
${chapterIndex >= chapterCount - 1 ? `- FINAL CHAPTER: if you pass them, score reflects mastery. 91+ = certificate-worthy. Below 91 with pass = completed but not mastery cert. Mention the 91% mastery bar warmly if they ask about certificates.` : ""}

## Grade trailer (always at the end — learner never sees it if client strips it)
After your spoken reply, append EXACTLY:

---TEACHAID_GRADE---
{"score":0,"grasp":["..."],"needsReview":["..."],"pass":false,"passChapterIndex":${chapterIndex},"critique":"..."}

Rules for JSON:
- score 0–100 for THIS chapter
- grasp / needsReview: short plain phrases (1–4 each)
- pass true only with solid mastery; passChapterIndex = ${chapterIndex} when pass
- On final chapter, score 91–100 with pass true = course mastery certificate (client issues it)
- critique: one warm sentence for the grade card (human, not corporate)

===== TEXTBOOK MATERIALS =====
${materials || "(No materials — ask them to open the book; do not pass.)"}
===== END =====`;

  let msgs = cleaned;
  if (!msgs.length) {
    if (mode === "explain") {
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
      return res.status(400).json({ error: "Send a question or use explain/check mode" });
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
        temperature: mode === "check" ? 0.45 : 0.72,
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
      "I need another moment — ask me to check you again.";

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

function splitGrade(raw, chapterIndex) {
  const marker = "---TEACHAID_GRADE---";
  const idx = raw.lastIndexOf(marker);
  let reply = raw;
  let grade = null;
  if (idx >= 0) {
    reply = raw.slice(0, idx).trim();
    const jsonPart = raw.slice(idx + marker.length).trim();
    try {
      const g = JSON.parse(jsonPart);
      grade = normalizeGrade(g, chapterIndex);
    } catch {
      // try to find JSON object
      const m = jsonPart.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          grade = normalizeGrade(JSON.parse(m[0]), chapterIndex);
        } catch {
          grade = null;
        }
      }
    }
  }
  if (!reply) reply = "Let's keep working on this chapter.";
  return { reply, grade };
}

function normalizeGrade(g, chapterIndex) {
  if (!g || typeof g !== "object") return null;
  const score = Math.max(0, Math.min(100, parseInt(g.score, 10) || 0));
  const grasp = Array.isArray(g.grasp)
    ? g.grasp.map((x) => String(x).slice(0, 160)).slice(0, 6)
    : [];
  const needsReview = Array.isArray(g.needsReview)
    ? g.needsReview.map((x) => String(x).slice(0, 160)).slice(0, 6)
    : [];
  let pass = g.pass === true || g.pass === "true";
  // Hard gate: high bar
  if (pass && score < 70) pass = false;
  if (pass && needsReview.length > 2) pass = false;
  const passChapterIndex = pass ? chapterIndex : null;
  const critique = String(g.critique || "").slice(0, 400);
  return { score, grasp, needsReview, pass, passChapterIndex, critique };
}
