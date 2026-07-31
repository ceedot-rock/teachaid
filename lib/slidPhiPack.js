/**
 * TEACHAiD progress packing via slid-phi (integer grade scores / unlocks).
 * CommonJS for Node tests; browser attaches TeachaidSlidPhi when loaded as script
 * after a global `slidPhi` or dynamic import sets encode/decode.
 *
 * Frame pack format (JSON string):
 *   { m, n, bl, b, x? }  — same shape as blokz codec
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require, root);
  } else {
    root.TeachaidSlidPhi = factory(null, root);
  }
})(typeof self !== "undefined" ? self : this, function (nodeRequire, root) {
  var encodeFn = null;
  var decodeFn = null;

  function tryLoadNode() {
    if (!nodeRequire) return false;
    try {
      var sp = nodeRequire("slid-phi");
      encodeFn = sp.encode;
      decodeFn = sp.decode;
      return true;
    } catch (e) {
      return false;
    }
  }

  function setCodec(api) {
    if (!api) return;
    encodeFn = api.encode || encodeFn;
    decodeFn = api.decode || decodeFn;
  }

  // Browser: use global slidPhi if a module script set it
  if (root && root.slidPhi) {
    setCodec(root.slidPhi);
  }
  if (!encodeFn) tryLoadNode();

  function bytesToB64url(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    var b64 =
      typeof btoa !== "undefined"
        ? btoa(bin)
        : Buffer.from(bytes).toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64urlToBytes(s) {
    var b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    var pad = b64.length % 4 === 0 ? "" : Array(5 - (b64.length % 4)).join("=");
    var raw =
      typeof atob !== "undefined"
        ? atob(b64 + pad)
        : Buffer.from(b64 + pad, "base64").toString("binary");
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function frameToPacked(frame) {
    var bytes = frame.bytes;
    if (!bytes) throw new Error("frame missing bytes");
    var skip = { mode: 1, n: 1, bitLen: 1, bytes: 1, bits: 1 };
    var x = {};
    for (var k in frame) {
      if (Object.prototype.hasOwnProperty.call(frame, k) && !skip[k]) x[k] = frame[k];
    }
    var p = {
      m: String(frame.mode || "dense"),
      n: Number(frame.n || 0),
      bl: Number(frame.bitLen || bytes.length * 8),
      b: bytesToB64url(bytes),
    };
    if (Object.keys(x).length) p.x = x;
    return p;
  }

  function packedToFrame(p) {
    var f = {
      mode: p.m,
      n: p.n,
      bitLen: p.bl,
      bytes: b64urlToBytes(p.b),
    };
    if (p.x) {
      for (var k in p.x) {
        if (!Object.prototype.hasOwnProperty.call(p.x, k)) continue;
        if (k === "_off") continue; // app marker only
        f[k] = p.x[k];
      }
    }
    return f;
  }

  function ensureCodec() {
    if (encodeFn && decodeFn) return true;
    if (tryLoadNode()) return true;
    if (root && root.slidPhi) {
      setCodec(root.slidPhi);
      return !!(encodeFn && decodeFn);
    }
    return false;
  }

  /**
   * Pack non-negative integers (0 ok) → JSON string of packed frame.
   * slid-phi requires n≥1, so we store (v+1) and mark _off:1.
   * opts.M = max original value inclusive (0..M).
   */
  function packInts(values, opts) {
    opts = opts || {};
    if (!ensureCodec()) throw new Error("slid-phi not available");
    if (!values || !values.length) return "";
    var raw = values.map(function (v) {
      var n = Math.round(Number(v));
      if (!isFinite(n) || n < 0) throw new Error("bad int " + v);
      return n;
    });
    var ints = raw.map(function (n) {
      return n + 1;
    });
    var mode = opts.mode || "auto";
    var frame;
    if (mode === "auto") {
      var max = Math.max.apply(null, raw);
      var increasing = raw.every(function (v, i) {
        return i === 0 || v > raw[i - 1];
      });
      if (max <= 100) {
        frame = encodeFn("universe", ints, { M: max + 1 });
      } else if (increasing) {
        frame = encodeFn("gaps", ints);
      } else {
        frame = encodeFn("dense", ints, { profile: "auto" });
      }
    } else if (mode === "universe") {
      var maxOrig = opts.M != null ? opts.M : Math.max.apply(null, raw);
      frame = encodeFn("universe", ints, { M: maxOrig + 1 });
    } else if (mode === "gaps") {
      frame = encodeFn("gaps", ints);
    } else {
      frame = encodeFn("dense", ints, { profile: "auto" });
    }
    var packed = frameToPacked(frame);
    packed.x = packed.x || {};
    packed.x._off = 1;
    return JSON.stringify(packed);
  }

  function unpackInts(packed) {
    if (!packed) return [];
    if (!ensureCodec()) throw new Error("slid-phi not available");
    var p = typeof packed === "string" ? JSON.parse(packed) : packed;
    var out = decodeFn(packedToFrame(p));
    var arr = Array.isArray(out)
      ? out.map(Number)
      : typeof out === "number"
        ? [out]
        : [];
    var off = p.x && p.x._off != null ? Number(p.x._off) : 1;
    return arr.map(function (n) {
      return n - off;
    });
  }

  /**
   * Progress map: { bookId: { unlockedThrough, grades: { "0": { score, pass, ... } } } }
   * → compact export blob with slid-phi packed score series per book.
   */
  function packProgress(all) {
    all = all || {};
    var books = Object.keys(all);
    var out = { v: 1, sp: 1, books: {} };
    books.forEach(function (bookId) {
      var prog = all[bookId] || {};
      var grades = prog.grades || {};
      var keys = Object.keys(grades).sort(function (a, b) {
        return Number(a) - Number(b);
      });
      var scores = [];
      var passFlags = [];
      var meta = [];
      keys.forEach(function (k) {
        var g = grades[k] || {};
        scores.push(Math.max(0, Math.min(100, Math.round(Number(g.score) || 0))));
        passFlags.push(g.pass ? 1 : 0);
        meta.push({
          i: Number(k),
          grasp: g.grasp,
          needsReview: g.needsReview,
          critique: g.critique,
          at: g.at,
        });
      });
      out.books[bookId] = {
        unlockedThrough: prog.unlockedThrough || 0,
        chapterIdx: keys.map(Number),
        scores: scores.length ? packInts(scores, { mode: "universe", M: 100 }) : "",
        pass: passFlags.length
          ? packInts(passFlags, { mode: "universe", M: 1 })
          : "",
        meta: meta,
      };
    });
    return out;
  }

  function unpackProgress(blob) {
    if (!blob || blob.sp !== 1) return blob;
    var all = {};
    var books = blob.books || {};
    Object.keys(books).forEach(function (bookId) {
      var b = books[bookId];
      var scores = b.scores ? unpackInts(b.scores) : [];
      var pass = b.pass ? unpackInts(b.pass) : [];
      var grades = {};
      (b.meta || []).forEach(function (m, i) {
        grades[String(m.i)] = {
          score: scores[i] != null ? scores[i] : 0,
          pass: !!(pass[i]),
          grasp: m.grasp || [],
          needsReview: m.needsReview || [],
          critique: m.critique || "",
          at: m.at || null,
        };
      });
      all[bookId] = {
        unlockedThrough: b.unlockedThrough || 0,
        grades: grades,
      };
    });
    return all;
  }

  /** Export code: base64url of JSON packProgress */
  function exportProgressCode(all) {
    var packed = packProgress(all);
    var json = JSON.stringify(packed);
    var b64 =
      typeof btoa !== "undefined"
        ? btoa(unescape(encodeURIComponent(json)))
        : Buffer.from(json, "utf8").toString("base64");
    return "TASP1." + b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function importProgressCode(code) {
    if (!code || typeof code !== "string") throw new Error("empty code");
    var s = code.trim();
    if (s.indexOf("TASP1.") !== 0) throw new Error("not a TEACHAiD SP progress code");
    var b64 = s.slice(6).replace(/-/g, "+").replace(/_/g, "/");
    var pad = b64.length % 4 === 0 ? "" : Array(5 - (b64.length % 4)).join("=");
    var json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(b64 + pad)))
        : Buffer.from(b64 + pad, "base64").toString("utf8");
    var blob = JSON.parse(json);
    return unpackProgress(blob);
  }

  return {
    setCodec: setCodec,
    packInts: packInts,
    unpackInts: unpackInts,
    packProgress: packProgress,
    unpackProgress: unpackProgress,
    exportProgressCode: exportProgressCode,
    importProgressCode: importProgressCode,
    available: function () {
      return ensureCodec();
    },
  };
});
