/**
 * TEACHAiD Certificate of Course Mastery rules.
 * CommonJS for Node tests + browser global via UMD below.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TeachaidMastery = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  /** Final-chapter teacher pass must meet this score for a mastery certificate */
  var MASTERY_MIN = 91;

  /**
   * @param {object} opts
   * @param {object|null} opts.grade - { pass, score }
   * @param {number} opts.chapterIndex - 0-based current chapter
   * @param {number} opts.chapterCount - total chapters
   * @returns {boolean}
   */
  function shouldIssueMasteryCert(opts) {
    opts = opts || {};
    var grade = opts.grade;
    if (!grade || grade.pass !== true) return false;
    var score = Number(grade.score);
    if (!Number.isFinite(score) || score < MASTERY_MIN) return false;
    var chapterIndex = Number(opts.chapterIndex);
    var chapterCount = Number(opts.chapterCount);
    if (!Number.isFinite(chapterIndex) || !Number.isFinite(chapterCount)) {
      return false;
    }
    if (chapterCount < 1) return false;
    // final chapter only
    if (chapterIndex < chapterCount - 1) return false;
    if (chapterIndex >= chapterCount) return false;
    return true;
  }

  /**
   * Build a certificate record (does not persist).
   */
  function buildMasteryCert(opts) {
    opts = opts || {};
    if (
      !shouldIssueMasteryCert({
        grade: opts.grade,
        chapterIndex: opts.chapterIndex,
        chapterCount: opts.chapterCount,
      })
    ) {
      return null;
    }
    var bookId = String(opts.bookId || "unknown");
    var score = Number(opts.grade.score);
    var now = opts.now || new Date().toISOString();
    var idSuffix =
      opts.idSuffix ||
      (typeof Date.now === "function" ? Date.now().toString(36) : "x");
    return {
      id: "cert_" + bookId + "_" + idSuffix,
      bookId: bookId,
      courseTitle: String(opts.courseTitle || "Course").slice(0, 120),
      teacher: String(opts.teacher || "Teacher").slice(0, 80),
      score: score,
      chapterName: String(opts.chapterName || "Final").slice(0, 80),
      learnerName: String(opts.learnerName || "Learner").slice(0, 80),
      issuedAt: now,
      kind: "course_mastery",
      threshold: MASTERY_MIN,
    };
  }

  /**
   * Merge into cert list: replace same bookId if new score is higher.
   * @returns {{ list: array, cert: object|null, action: 'issued'|'upgraded'|'kept'|'none' }}
   */
  function mergeCertIntoList(list, cert) {
    list = Array.isArray(list) ? list.slice() : [];
    if (!cert) return { list: list, cert: null, action: "none" };
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].bookId === cert.bookId) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      var existing = list[idx];
      if (Number(existing.score) >= Number(cert.score)) {
        return { list: list, cert: existing, action: "kept" };
      }
      list[idx] = cert;
      return { list: list, cert: cert, action: "upgraded" };
    }
    list.unshift(cert);
    return { list: list, cert: cert, action: "issued" };
  }

  function bannerForFinalGrade(grade) {
    if (!grade) {
      return {
        kind: "pending",
        text:
          "Final chapter — pass at " +
          MASTERY_MIN +
          "+% with your teacher for a Certificate of Course Mastery.",
      };
    }
    if (grade.pass === true && Number(grade.score) >= MASTERY_MIN) {
      return {
        kind: "mastery",
        text:
          "Course mastery! Certificate issued at " + grade.score + "%.",
      };
    }
    if (grade.pass === true) {
      return {
        kind: "complete",
        text:
          "Course complete — mastery certificate needs " +
          MASTERY_MIN +
          "+% (you scored " +
          grade.score +
          "%). Try Am I ready? again when sharper.",
      };
    }
    if (Number(grade.score) >= MASTERY_MIN) {
      return {
        kind: "high_no_pass",
        text:
          "Strong score — ask your teacher for a clear pass check to earn the certificate.",
      };
    }
    return {
      kind: "practicing",
      text:
        "Final chapter — pass at " +
        MASTERY_MIN +
        "+% with your teacher for a Certificate of Course Mastery.",
    };
  }

  return {
    MASTERY_MIN: MASTERY_MIN,
    shouldIssueMasteryCert: shouldIssueMasteryCert,
    buildMasteryCert: buildMasteryCert,
    mergeCertIntoList: mergeCertIntoList,
    bannerForFinalGrade: bannerForFinalGrade,
  };
});
