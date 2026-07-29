/**
 * TEACHAiD student IDs + referral rewards.
 * Both parties get 1 month Pro per successful referral; referrer max 4 / calendar year.
 * UMD: Node tests + browser TeachaidReferral
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TeachaidReferral = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var REFERRAL_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  var MAX_REFERRALS_PER_YEAR = 4;
  var ID_PREFIX = "TA-";

  function yearOf(d) {
    return (d instanceof Date ? d : new Date(d)).getUTCFullYear();
  }

  function normalizeStudentId(raw) {
    var s = String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!s) return "";
    if (s.indexOf("TA") === 0 && s.indexOf("TA-") !== 0) {
      s = "TA-" + s.slice(2).replace(/^-+/, "");
    }
    return s;
  }

  function isValidStudentId(id) {
    id = normalizeStudentId(id);
    // TA- + 8 alphanumeric
    return /^TA-[A-Z0-9]{8}$/.test(id);
  }

  function randomChunk(len) {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1
    var out = "";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      var buf = new Uint8Array(len);
      crypto.getRandomValues(buf);
      for (var i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
      return out;
    }
    for (var j = 0; j < len; j++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  }

  function generateStudentId() {
    return ID_PREFIX + randomChunk(8);
  }

  function emptyAccount(now) {
    now = now || new Date().toISOString();
    return {
      studentId: generateStudentId(),
      createdAt: now,
      referredBy: null,
      usedReferral: false,
      referrals: [], // { year, at, fromStudentId, thankYouId }
      claimedThankYous: [], // ids already claimed
      proUntil: 0, // ms epoch
    };
  }

  function ensureAccount(acc, now) {
    if (!acc || typeof acc !== "object") return emptyAccount(now);
    var a = Object.assign({}, acc);
    if (!isValidStudentId(a.studentId)) a.studentId = generateStudentId();
    else a.studentId = normalizeStudentId(a.studentId);
    if (!Array.isArray(a.referrals)) a.referrals = [];
    if (!Array.isArray(a.claimedThankYous)) a.claimedThankYous = [];
    a.usedReferral = !!a.usedReferral;
    a.referredBy = a.referredBy ? normalizeStudentId(a.referredBy) : null;
    a.proUntil = Number(a.proUntil) || 0;
    if (!a.createdAt) a.createdAt = now || new Date().toISOString();
    return a;
  }

  function referralsInYear(acc, year) {
    acc = ensureAccount(acc);
    year = year || yearOf(new Date());
    return acc.referrals.filter(function (r) {
      return r && Number(r.year) === year;
    });
  }

  function canReferMore(acc, at) {
    at = at || new Date();
    var y = yearOf(at);
    return referralsInYear(acc, y).length < MAX_REFERRALS_PER_YEAR;
  }

  function extendProUntil(currentUntil, fromMs, monthMs) {
    monthMs = monthMs || REFERRAL_MONTH_MS;
    fromMs = fromMs || Date.now();
    var base = Math.max(Number(currentUntil) || 0, fromMs);
    return base + monthMs;
  }

  /**
   * New student applies a referrer's Student ID.
   * @returns {{ ok, account?, thankYou?, error? }}
   */
  function applyReferralCode(acc, referralCode, at) {
    at = at || new Date();
    acc = ensureAccount(acc, at.toISOString());
    var code = normalizeStudentId(referralCode);
    if (!isValidStudentId(code)) {
      return { ok: false, error: "Enter a valid Student ID (TA-XXXXXXXX)." };
    }
    if (code === acc.studentId) {
      return { ok: false, error: "You cannot refer yourself." };
    }
    if (acc.usedReferral) {
      return { ok: false, error: "This account already used a referral." };
    }
    acc.usedReferral = true;
    acc.referredBy = code;
    acc.proUntil = extendProUntil(acc.proUntil, at.getTime());
    var thankYou = {
      id: "TY-" + randomChunk(10),
      referrerId: code,
      newStudentId: acc.studentId,
      year: yearOf(at),
      at: at.toISOString(),
    };
    return { ok: true, account: acc, thankYou: thankYou };
  }

  /**
   * Referrer claims a thank-you from someone who used their ID.
   */
  function claimThankYou(acc, thankYou, at) {
    at = at || new Date();
    acc = ensureAccount(acc, at.toISOString());
    if (!thankYou || typeof thankYou !== "object") {
      return { ok: false, error: "Invalid thank-you code." };
    }
    var refId = normalizeStudentId(thankYou.referrerId);
    var fromId = normalizeStudentId(thankYou.newStudentId);
    var tyId = String(thankYou.id || "");
    if (refId !== acc.studentId) {
      return { ok: false, error: "That thank-you is for a different Student ID." };
    }
    if (!isValidStudentId(fromId) || !tyId) {
      return { ok: false, error: "Invalid thank-you code." };
    }
    if (acc.claimedThankYous.indexOf(tyId) >= 0) {
      return { ok: false, error: "Already claimed this thank-you." };
    }
    var y = Number(thankYou.year) || yearOf(at);
    if (referralsInYear(acc, y).length >= MAX_REFERRALS_PER_YEAR) {
      return {
        ok: false,
        error:
          "Referral limit reached (" +
          MAX_REFERRALS_PER_YEAR +
          " per year). Try again next calendar year.",
      };
    }
    // also block duplicate from same new student in same year
    var dup = acc.referrals.some(function (r) {
      return r && r.fromStudentId === fromId && Number(r.year) === y;
    });
    if (dup) {
      return { ok: false, error: "You already received credit for this student." };
    }
    acc.claimedThankYous.push(tyId);
    acc.referrals.push({
      year: y,
      at: at.toISOString(),
      fromStudentId: fromId,
      thankYouId: tyId,
    });
    acc.proUntil = extendProUntil(acc.proUntil, at.getTime());
    return {
      ok: true,
      account: acc,
      referralsThisYear: referralsInYear(acc, y).length,
      remainingThisYear: MAX_REFERRALS_PER_YEAR - referralsInYear(acc, y).length,
    };
  }

  function isProActive(acc, nowMs) {
    nowMs = nowMs || Date.now();
    return (Number(acc && acc.proUntil) || 0) > nowMs;
  }

  function encodeThankYou(ty) {
    if (!ty) return "";
    try {
      var json = JSON.stringify({
        v: 1,
        id: ty.id,
        referrerId: ty.referrerId,
        newStudentId: ty.newStudentId,
        year: ty.year,
        at: ty.at,
      });
      if (typeof btoa === "function") {
        return (
          "TEACHAiD_TY:" +
          btoa(unescape(encodeURIComponent(json)))
        );
      }
      return (
        "TEACHAiD_TY:" + Buffer.from(json, "utf8").toString("base64")
      );
    } catch (e) {
      return "";
    }
  }

  function decodeThankYou(raw) {
    var s = String(raw || "").trim();
    var m = s.match(/TEACHAiD_TY:([A-Za-z0-9+/=]+)/);
    var b64 = m ? m[1] : s.indexOf("TEACHAiD_TY:") === 0 ? s.slice(12) : s;
    try {
      var json;
      if (typeof atob === "function") {
        json = decodeURIComponent(escape(atob(b64)));
      } else {
        json = Buffer.from(b64, "base64").toString("utf8");
      }
      var data = JSON.parse(json);
      return {
        id: data.id,
        referrerId: normalizeStudentId(data.referrerId),
        newStudentId: normalizeStudentId(data.newStudentId),
        year: data.year,
        at: data.at,
      };
    } catch (e) {
      return null;
    }
  }

  return {
    REFERRAL_MONTH_MS: REFERRAL_MONTH_MS,
    MAX_REFERRALS_PER_YEAR: MAX_REFERRALS_PER_YEAR,
    normalizeStudentId: normalizeStudentId,
    isValidStudentId: isValidStudentId,
    generateStudentId: generateStudentId,
    emptyAccount: emptyAccount,
    ensureAccount: ensureAccount,
    referralsInYear: referralsInYear,
    canReferMore: canReferMore,
    extendProUntil: extendProUntil,
    applyReferralCode: applyReferralCode,
    claimThankYou: claimThankYou,
    isProActive: isProActive,
    encodeThankYou: encodeThankYou,
    decodeThankYou: decodeThankYou,
    yearOf: yearOf,
  };
});
