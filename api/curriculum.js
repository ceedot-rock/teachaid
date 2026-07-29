/**
 * TEACHAiD load-document → curriculum
 * POST body:
 * {
 *   text: string,
 *   filename?: string,
 *   titleHint?: string,
 *   audience?: string,
 *   mode?: "create" | "append",   // default create
 *   existing?: {                  // required when mode=append
 *     title, teacher, teacherBlurb?,
 *     chapters: [{ n, t? }]       // outline of chapters already in the book
 *   }
 * }
 *
 * Response (create):
 *   { mode:"create", book:{ title, teacher, teacherBlurb, avatar, summary, ch:[{n,h,t}] }, source }
 *
 * Response (append):
 *   { mode:"append", chapters:[{n,h,t}], source }
 *
 * Env: XAI_API_KEY, optional XAI_MODEL
 */
const {
  parseCurriculumJson,
  normalizeBook,
  normalizeExisting,
  extractChaptersOnly,
  validateMaterialText,
} = require("../lib/curriculum-core");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Curriculum offline: XAI_API_KEY not set (Vercel project env).",
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

  const rawText = String(body?.text || "").trim();
  const materialCheck = validateMaterialText(rawText);
  if (!materialCheck.ok) {
    return res.status(400).json({ error: materialCheck.error });
  }

  const MAX_IN = 48000;
  const text = materialCheck.text.slice(0, MAX_IN);
  const filename = String(body?.filename || "").slice(0, 200);
  const titleHint = String(body?.titleHint || "").slice(0, 120);
  const audience = String(body?.audience || "complete beginners").slice(0, 80);
  const mode = body?.mode === "append" ? "append" : "create";

  let existing = null;
  if (mode === "append") {
    existing = normalizeExisting(body?.existing);
    if (!existing) {
      return res.status(400).json({
        error: "Append mode needs existing curriculum (title, teacher, chapters).",
      });
    }
  }

  const system =
    mode === "append"
      ? buildAppendSystem(existing, audience, filename)
      : buildCreateSystem(audience, titleHint, filename);

  const userMsg =
    mode === "append"
      ? `Add new chapters to the existing TEACHAiD textbook from these NEW materials only.

===== EXISTING BOOK =====
Title: ${existing.title}
Teacher: ${existing.teacher}
Current chapters:
${existing.chapters
  .map((c, i) => `${i + 1}. ${c.n}${c.t ? " — " + c.t.slice(0, 180) : ""}`)
  .join("\n")}
===== END EXISTING =====

===== NEW MATERIALS START =====
${text}
===== NEW MATERIALS END =====`
      : `Build a TEACHAiD textbook curriculum from these materials:

===== MATERIALS START =====
${text}
===== MATERIALS END =====`;

  try {
    const r = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-3-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.35,
        max_tokens: mode === "append" ? 3200 : 4500,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error?.message || data?.error || r.statusText;
      return res.status(r.status).json({ error: String(msg) });
    }
    const raw = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!raw) {
      return res.status(502).json({ error: "Empty curriculum response from model" });
    }

    const parsed = parseCurriculumJson(raw);
    if (!parsed.ok) {
      return res.status(502).json({
        error: parsed.error || "Could not parse curriculum JSON",
        preview: raw.slice(0, 400),
      });
    }

    const source = {
      filename: filename || null,
      charCount: text.length,
      truncated: rawText.length > MAX_IN,
    };

    if (mode === "append") {
      const chapters = extractChaptersOnly(
        parsed.book,
        existing.teacher,
        existing.title
      );
      if (!chapters.length) {
        return res.status(502).json({ error: "Model returned no new chapters" });
      }
      return res.status(200).json({ mode: "append", chapters, source });
    }

    const book = normalizeBook(parsed.book, titleHint, filename);
    if (!book.ch.length) {
      return res.status(502).json({ error: "Model returned no chapters" });
    }
    return res.status(200).json({ mode: "create", book, source });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Upstream failed" });
  }
};

function buildCreateSystem(audience, titleHint, filename) {
  return `You are the TEACHAiD curriculum builder for SPLabs.
Turn uploaded learning materials into ONE textbook curriculum for the TEACHAiD app.

## Output format (CRITICAL)
Return ONLY valid JSON — no markdown fences, no commentary — matching this schema exactly:

{
  "title": "Short book title",
  "teacher": "First name only (friendly, human tutor name)",
  "teacherBlurb": "One short line about what this tutor covers",
  "avatar": "Single capital letter (usually first letter of teacher)",
  "summary": "One sentence for the home card",
  "ch": [
    {
      "n": "Short chapter pill name (2–5 words)",
      "h": "Safe HTML for the lesson panel",
      "t": "Plain-text teaching notes for the AI teacher (grounded in the materials)"
    }
  ]
}

## Chapter rules
- 4 to 7 chapters, progressive from intro → core ideas → practice/check.
- Last chapter should be a light check or wrap-up (not an endless game).
- Teach ONLY from the provided materials. Do not invent facts outside them.
- Audience: ${audience}.
${titleHint ? `- Preferred title hint: "${titleHint}".` : ""}
${filename ? `- Source filename: "${filename}".` : ""}

## HTML rules for "h" (lesson body)
Allowed tags only: h2, p, ul, ol, li, strong, em, div (with class callout|idea|try|teacher|callout-title|meta|done-box), button (class btn only for finish).
- Start with <h2>Chapter title</h2>
- Short paragraphs. One callout idea when helpful.
- NO scripts, iframes, images, links to external sites, style attributes with url(), or event handlers.
- NO interactive games with custom JS (no range widgets). Keep static readable HTML.
- Final chapter may include:
  <div class="done-box"><p>You finished this book.</p><button class="btn" onclick="finishBook()">Finish book → Home</button></div>

## Plain text "t" rules
- 2–6 sentences the certified teacher will use as ground truth.
- Include key definitions, examples, and common misconceptions from the materials.
- Prefix with "Chapter: <name>."

## Teacher name
- Invent a warm first name that fits the subject (not Mira/Nova/Bit/Codex unless topic matches those books).
- Distinct and memorable.`;
}

function buildAppendSystem(existing, audience, filename) {
  const names = existing.chapters.map((c) => c.n).join("; ");
  return `You are the TEACHAiD curriculum builder for SPLabs.
You APPEND new chapters to an EXISTING textbook. Do not rewrite the whole book.

## Existing book (keep identity)
- Title: "${existing.title}"
- Teacher: "${existing.teacher}" (keep this teacher — do not invent a new name)
- Already has chapters: ${names || "(none)"}

## Output format (CRITICAL)
Return ONLY valid JSON — no markdown fences:

{
  "ch": [
    {
      "n": "Short chapter pill name (2–5 words)",
      "h": "Safe HTML for the lesson panel",
      "t": "Plain-text teaching notes for the AI teacher"
    }
  ]
}

## Append rules
- Add 2 to 5 NEW chapters from the NEW materials only.
- Do NOT repeat existing chapter topics. Extend the progression.
- New chapter names must differ from: ${names || "n/a"}
- Audience: ${audience}.
${filename ? `- New source file: "${filename}".` : ""}
- Last NEW chapter may include a finish button:
  <div class="done-box"><p>You finished this book.</p><button class="btn" onclick="finishBook()">Finish book → Home</button></div>
- Same HTML safety rules as always: no scripts, no event handlers except finishBook(), no iframes.
- "t" must be plain teaching notes prefixed with "Chapter: <name>."
- Teach ONLY from the new materials + continuity with existing chapter names (no invented contradictions).`;
}

