/**
 * TEACHAiD grade parsing — shared by api/chat and tests.
 */
const PASS_MIN_SCORE = 70;
const GRADE_MARKER = "---TEACHAID_GRADE---";

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
  if (pass && score < PASS_MIN_SCORE) pass = false;
  if (pass && needsReview.length > 2) pass = false;
  const passChapterIndex = pass ? chapterIndex : null;
  const critique = String(g.critique || "").slice(0, 400);
  return { score, grasp, needsReview, pass, passChapterIndex, critique };
}

function splitGrade(raw, chapterIndex) {
  const text = String(raw || "");
  const idx = text.lastIndexOf(GRADE_MARKER);
  let reply = text;
  let grade = null;
  if (idx >= 0) {
    reply = text.slice(0, idx).trim();
    const jsonPart = text.slice(idx + GRADE_MARKER.length).trim();
    try {
      grade = normalizeGrade(JSON.parse(jsonPart), chapterIndex);
    } catch {
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

function nextUnlockedThrough(currentUnlocked, chapterIndex, grade) {
  let u = Number(currentUnlocked) || 0;
  if (
    grade &&
    grade.pass === true &&
    grade.passChapterIndex === chapterIndex
  ) {
    const next = chapterIndex + 1;
    if (next > u) u = next;
  }
  return u;
}

module.exports = {
  PASS_MIN_SCORE,
  GRADE_MARKER,
  normalizeGrade,
  splitGrade,
  nextUnlockedThrough,
};
