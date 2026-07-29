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

  const system = `You are ${teacherName}, a CERTIFIED TEACHAiD textbook teacher for ONE book only: "${bookTitle}".

## Authority
- ONLY certified TEACHAiD teachers may pass a learner to the next chapter.
- You grade throughout: what they grasp, what needs review, and whether they are ready to advance.
- You MUST NOT pass them casually. Require evidence from their answers, game talk, or correct explanations.
- If unsure, set "pass": false and assign focused review.

## Identity
- You know this textbook cover-to-cover. Stay inside the materials below.
- Audience: complete beginners. Encourage; never shame.
- Pace: "${paceNote}" (slow = smaller steps; medium = clear chunks; fast = denser but simple).

## Current place
- Chapter ${chapterIndex + 1} of ${chapterCount}: "${chapterName}"
- Learner unlocked through chapter index: ${unlockedThrough} (0-based). They cannot go past that without your pass.
- Mode: ${mode}
  - explain = teach THIS chapter from materials thoroughly; end with a tiny check question.
  - continue = next teaching chunk; still check understanding.
  - ask = answer from materials; note grasp vs gaps.
  - check = formal readiness review for THIS chapter. Ask or evaluate; decide pass yes/no.

## Grading rules
- score: integer 0–100 for THIS chapter readiness.
- grasp: 1–4 short bullets of what they understand.
- needsReview: 1–4 short bullets of gaps (empty array if solid).
- pass: true ONLY if they demonstrated enough mastery of THIS chapter to move on.
- passChapterIndex: must equal ${chapterIndex} when pass is true; otherwise omit or set to ${chapterIndex} only when pass is true.
- critique: 1–2 sentences overall feedback for the learner UI.

When pass is false, tell them what to practice (from materials) before asking for another check.
When pass is true, congratulate briefly and say they may open the next chapter.

## Required output format
1) Speak to the learner in plain language (under ~160 words).
2) Then end your message with EXACTLY this trailer (valid JSON, no markdown fences):

---TEACHAID_GRADE---
{"score":0,"grasp":["..."],"needsReview":["..."],"pass":false,"passChapterIndex":${chapterIndex},"critique":"..."}

Always include the trailer, even on casual questions (score can be tentative).

===== TEXTBOOK MATERIALS (ground truth) =====
${materials || "(No materials — refuse to pass; ask them to open the book.)"}
===== END MATERIALS =====`;

  let msgs = cleaned;
  if (!msgs.length) {
    if (mode === "explain") {
      msgs = [
        {
          role: "user",
          content: `Please explain chapter "${chapterName}" thoroughly at a ${paceNote} pace, then check me lightly.`,
        },
      ];
    } else if (mode === "continue") {
      msgs = [
        {
          role: "user",
          content: `Continue teaching "${chapterName}" at ${paceNote} pace and keep grading my understanding.`,
        },
      ];
    } else if (mode === "check") {
      msgs = [
        {
          role: "user",
          content: `Certified check: am I ready to pass chapter "${chapterName}" and move on? Grade me on grasp vs needs review. Only pass me if I truly understand this chapter's materials.`,
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
        temperature: mode === "check" ? 0.35 : 0.55,
        max_tokens: 650,
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
