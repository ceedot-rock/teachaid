/**
 * Curriculum JSON parse + normalize — shared by api/curriculum and tests.
 */

function parseCurriculumJson(raw) {
  let s = String(raw || "").trim();
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
      const n = String(c.n || c.name || "")
        .slice(0, 48)
        .trim();
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

function validateMaterialText(text) {
  const t = String(text || "").trim();
  if (t.length < 40) {
    return {
      ok: false,
      error:
        "Need more material (at least ~40 characters). Paste notes or upload a text file.",
    };
  }
  return { ok: true, text: t };
}

module.exports = {
  parseCurriculumJson,
  normalizeBook,
  normalizeChapter,
  normalizeExisting,
  extractChaptersOnly,
  sanitizeLessonHtml,
  escapeHtml,
  validateMaterialText,
};
