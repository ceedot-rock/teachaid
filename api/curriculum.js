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
  if (rawText.length < 40) {
    return res.status(400).json({
      error: "Need more material (at least ~40 characters). Paste notes or upload a text file.",
    });
  }

  const MAX_IN = 48000;
  const text = rawText.slice(0, MAX_IN);
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

function normalizeExisting(ex) {
  if (!ex || typeof ex !== "object") return null;
  const title = String(ex.title || "").slice(0, 100).trim();
  const teacher = String(ex.teacher || "")
    .replace(/[^a-zA-Z\-'\s]/g, "")
    .trim()
    .split(/\s+/)[0]
    .slice(0, 24);
  if (!title || !teacher) return null;
  const rawCh = Array.isArray(ex.chapters)
    ? ex.chapters
    : Array.isArray(ex.ch)
      ? ex.ch
      : [];
  const chapters = rawCh
    .slice(0, 24)
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const n = String(c.n || c.name || "").slice(0, 48).trim();
      if (!n) return null;
      return { n, t: String(c.t || "").slice(0, 400) };
    })
    .filter(Boolean);
  return {
    title,
    teacher,
    teacherBlurb: String(ex.teacherBlurb || "").slice(0, 140),
    chapters,
  };
}

function extractChaptersOnly(b, teacher, bookTitle) {
  if (!b || typeof b !== "object") return [];
  const chIn = Array.isArray(b.ch)
    ? b.ch
    : Array.isArray(b.chapters)
      ? b.chapters
      : [];
  return chIn
    .slice(0, 6)
    .map((c, i) => normalizeChapter(c, i, teacher, bookTitle))
    .filter(Boolean);
}

function parseCurriculumJson(raw) {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  try {
    return { ok: true, book: JSON.parse(s) };
  } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return { ok: true, book: JSON.parse(m[0]) };
      } catch {
        return { ok: false, error: "JSON parse failed after extract" };
      }
    }
    return { ok: false, error: "No JSON object in model output" };
  }
}

function normalizeBook(b, titleHint, filename) {
  if (!b || typeof b !== "object") {
    return {
      title: titleHint || filename || "Custom book",
      teacher: "Sage",
      teacherBlurb: "Your tutor for this custom book.",
      avatar: "S",
      summary: "Curriculum from your materials.",
      ch: [],
    };
  }

  const title =
    String(b.title || titleHint || filename || "Custom book")
      .slice(0, 100)
      .trim() || "Custom book";
  let teacher = String(b.teacher || "Sage")
    .replace(/[^a-zA-Z\-'\s]/g, "")
    .trim()
    .split(/\s+/)[0]
    .slice(0, 24);
  if (!teacher) teacher = "Sage";
  const teacherBlurb = String(
    b.teacherBlurb || "Your tutor for this custom textbook."
  ).slice(0, 140);
  let avatar = String(b.avatar || teacher.charAt(0) || "T")
    .charAt(0)
    .toUpperCase();
  if (!/[A-Z]/.test(avatar)) avatar = "T";
  const summary = String(
    b.summary || "Built from your uploaded materials."
  ).slice(0, 200);

  const chIn = Array.isArray(b.ch)
    ? b.ch
    : Array.isArray(b.chapters)
      ? b.chapters
      : [];
  const ch = chIn
    .slice(0, 8)
    .map((c, i) => normalizeChapter(c, i, teacher, title))
    .filter(Boolean);

  if (ch.length && !ch.some((c) => /finishBook\(\)/.test(c.h))) {
    const last = ch[ch.length - 1];
    last.h +=
      '<div class="done-box"><p>You finished this book.</p><button class="btn" onclick="finishBook()">Finish book → Home</button></div>';
  }

  return { title, teacher, teacherBlurb, avatar, summary, ch, custom: true };
}

function normalizeChapter(c, i, teacher, bookTitle) {
  if (!c || typeof c !== "object") return null;
  const n = String(c.n || c.name || c.title || "Chapter " + (i + 1))
    .slice(0, 48)
    .trim();
  if (!n) return null;

  let h = String(c.h || c.html || c.content || "").trim();
  if (!h) {
    const body = String(c.body || c.text || "").slice(0, 2000);
    h =
      "<h2>" +
      escapeHtml(n) +
      "</h2><p>" +
      escapeHtml(body || "Study this section with your teacher.") +
      "</p>";
  }
  h = sanitizeLessonHtml(h, n);

  let t = String(c.t || c.notes || c.plain || "")
    .trim()
    .slice(0, 2500);
  if (!t) {
    t =
      "Chapter: " +
      n +
      ". Teach from the uploaded materials for “" +
      bookTitle +
      "”. Key points from the lesson HTML.";
  }
  if (!/^Chapter:/i.test(t)) t = "Chapter: " + n + ". " + t;

  return { n, h, t };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeLessonHtml(html, fallbackTitle) {
  let s = String(html);
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|form)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|link|meta|form)[^>]*\/?\s*>/gi,
    ""
  );
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, function (m) {
    if (/^\s*onclick\s*=\s*["']\s*finishBook\s*\(\s*\)\s*["']\s*$/i.test(m)) {
      return ' onclick="finishBook()"';
    }
    return "";
  });
  s = s.replace(/javascript\s*:/gi, "");
  s = s.replace(/<\/?(?:html|body|head|svg|math|base)[^>]*>/gi, "");
  s = s.replace(/style\s*=\s*("[^"]*"|'[^']*')/gi, function (full, q) {
    if (/url\s*\(/i.test(q)) return "";
    return full;
  });

  if (!/<h2[\s>]/i.test(s)) {
    s = "<h2>" + escapeHtml(fallbackTitle || "Chapter") + "</h2>" + s;
  }
  if (s.length > 12000) s = s.slice(0, 12000) + "…";
  return s;
}
