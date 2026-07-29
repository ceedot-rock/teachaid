/**
 * TEACHAiD path UI — runs after catalog loads
 * - Drops counting / toy foundations (s1–s3)
 * - Interest picker → class recommendations
 * - First open of a class = get-to-know teacher conversation
 */
(function (global) {
  if (typeof document === "undefined") return;

  var BOOKS = global.BUILTIN_BOOKS;
  if (BOOKS) {
    delete BOOKS.s1;
    delete BOOKS.s2;
    delete BOOKS.s3;
  }
  global.BUILTIN_TRACKS = [
    {
      id: "coding101",
      label: "Programming",
      blurb: "Programs, variables, decisions, loops, functions, lists",
    },
    {
      id: "college",
      label: "College & career 101s",
      blurb: "Gen-ed, AI, science, arts, law, finance, and more",
    },
  ];
  global.TEACHAID_GE_NOTE =
    "Choose what you want to study, meet your teacher, and learn together. Mastery certificates need a final pass at 91%+.";

  var INTERESTS = [
    { id: "programming", label: "Programming & coding", hint: "Build software skills", books: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] },
    { id: "math", label: "Math & quantitative", hint: "Algebra, stats, data", books: ["col_alg", "col_stat", "col_data"] },
    { id: "writing", label: "Writing & communication", hint: "Essays, speaking, arguments", books: ["col_eng", "col_speak", "col_lit", "col_crit"] },
    { id: "science", label: "Science & health", hint: "Bio, chem, body systems", books: ["col_bio", "col_chem", "col_sci", "col_physio", "col_health", "col_physics", "col_env"] },
    { id: "society", label: "History, society & law", hint: "Past, people, institutions", books: ["col_hist", "col_world", "col_psych", "col_law", "col_econ", "col_diversity"] },
    { id: "tech", label: "AI, cyber & digital", hint: "Modern tools and security", books: ["col_ai", "col_aihuman", "col_cyber", "col_digital"] },
    { id: "arts", label: "Arts, music & meaning", hint: "Creative practice and culture", books: ["col_art", "col_music", "col_mubiz", "col_relig"] },
    { id: "career", label: "Career & money skills", hint: "Finance, networking, success", books: ["col_finance", "col_network", "col_success"] },
  ];

  var IKEY = "teachaid_interests_v1";
  var MEET_KEY = "teachaid_met_teachers_v1";

  function loadInterests() {
    try {
      var raw = JSON.parse(localStorage.getItem(IKEY) || "null");
      if (raw && Array.isArray(raw.ids)) return raw.ids;
    } catch (e) {}
    return null;
  }
  function saveInterests(ids) {
    localStorage.setItem(IKEY, JSON.stringify({ ids: ids, at: new Date().toISOString() }));
  }
  function booksFor(ids) {
    var set = {};
    (ids || []).forEach(function (id) {
      INTERESTS.forEach(function (a) {
        if (a.id === id) a.books.forEach(function (b) { set[b] = true; });
      });
    });
    return Object.keys(set);
  }
  function metMap() {
    try { return JSON.parse(localStorage.getItem(MEET_KEY) || "{}"); } catch (e) { return {}; }
  }
  function markMet(id) {
    var m = metMap(); m[id] = true; localStorage.setItem(MEET_KEY, JSON.stringify(m));
  }
  function hasMet(id) { return !!metMap()[id]; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
  }

  var style = document.createElement("style");
  style.textContent =
    ".interest-grid{display:flex;flex-direction:column;gap:10px;margin-top:8px}" +
    ".interest-chip{text-align:left;background:var(--bg-card,#161622);border:1px solid rgba(255,255,255,.08);" +
    "border-radius:16px;padding:14px 16px;color:inherit;cursor:pointer}" +
    ".interest-chip strong{display:block;font-size:.98rem;margin-bottom:4px}" +
    ".interest-chip span{font-size:.82rem;color:#9b9bb0;line-height:1.4}" +
    ".interest-chip.on{border-color:rgba(94,234,212,.45);background:rgba(94,234,212,.1)}";
  document.head.appendChild(style);

  function renderPicker() {
    var home = document.getElementById("home");
    if (!home) return;
    var saved = loadInterests();
    if (saved && saved.length) { renderRecs(saved); return; }

    home.innerHTML =
      '<div class="teaser-card" style="cursor:default"><h3>What do you want to study?</h3>' +
      "<p>Pick one or more areas — we'll suggest classes. Each class has its own teacher.</p></div>" +
      '<div class="interest-grid">' +
      INTERESTS.map(function (a) {
        return '<button type="button" class="interest-chip" data-id="' + esc(a.id) + '">' +
          "<strong>" + esc(a.label) + "</strong><span>" + esc(a.hint) + "</span></button>";
      }).join("") +
      "</div>" +
      '<button type="button" class="btn" id="interestContinue" disabled style="margin-top:14px">Show me classes</button>';

    var selected = {};
    home.querySelectorAll(".interest-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (selected[id]) { delete selected[id]; btn.classList.remove("on"); }
        else { selected[id] = true; btn.classList.add("on"); }
        document.getElementById("interestContinue").disabled = Object.keys(selected).length < 1;
      });
    });
    document.getElementById("interestContinue").onclick = function () {
      var ids = Object.keys(selected);
      saveInterests(ids);
      renderRecs(ids);
    };
  }

  function renderRecs(ids) {
    var home = document.getElementById("home");
    if (!home) return;
    var books = global.BOOKS || BOOKS || {};
    var cards = booksFor(ids).map(function (id) {
      var b = books[id];
      if (!b) return "";
      return '<div class="card" onclick="openBook(\'' + id + "')">" +
        '<span class="tag">FOR YOU</span><h3>' + esc(b.title) + "</h3>" +
        "<p>" + esc(b.card || "") + "</p>" +
        '<div class="teacher-pill">Teacher ' + esc(b.teacher) + "</div></div>";
    }).join("");

    home.innerHTML =
      '<div class="teaser-card" style="cursor:default"><h3>Classes for you</h3>' +
      "<p>Open a class to meet your teacher. First chats are about getting to know each other — then you learn together.</p></div>" +
      (cards || "<p class=\"label\">No matches — change interests.</p>") +
      '<button type="button" class="btn secondary" id="changeInterests" style="margin-top:12px">Change interests</button>' +
      '<p class="label">Full catalog</p><div id="pathCatalog"></div>';

    document.getElementById("changeInterests").onclick = function () {
      localStorage.removeItem(IKEY);
      renderPicker();
    };
    try {
      if (typeof global.renderBuiltinCatalog === "function") {
        global.renderBuiltinCatalog();
        var src = document.getElementById("homeCatalog");
        var dest = document.getElementById("pathCatalog");
        if (src && dest) dest.innerHTML = src.innerHTML;
      }
    } catch (e) {}
  }

  function wrapOpenBook() {
    if (!global.openBook || global.__pathOpenWrapped) return;
    global.__pathOpenWrapped = true;
    var orig = global.openBook;
    global.openBook = function (id) {
      orig(id);
      if (hasMet(id)) return;
      try {
        var log = document.getElementById("chatLog");
        if (log) log.innerHTML = "";
        var b = (global.BOOKS || BOOKS || {})[id];
        if (!b) return;
        var intro =
          "Hey — I'm " + b.teacher +
          ". Before we dig into “" + b.title +
          "”, I'd like to know you a little. What brought you to this subject, and is there anything you already know (or don't want me to assume)?";
        if (typeof global.addBubble === "function") global.addBubble("bot", intro, false);
        if (typeof global.getHist === "function") {
          var h = global.getHist();
          h.length = 0;
          h.push({ role: "assistant", content: intro });
        }
        markMet(id);
        var banner = document.getElementById("lockBanner");
        if (banner) banner.textContent = "First session: get to know " + b.teacher + " — then learn together.";
        var input = document.getElementById("chatIn");
        if (input) input.placeholder = "Tell " + b.teacher + " a bit about yourself…";
      } catch (e) {}
    };
  }

  function boot() {
    wrapOpenBook();
    if (document.getElementById("home")) renderPicker();
  }

  function wait() {
    if (global.openBook) boot();
    else setTimeout(wait, 40);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wait);
  else wait();
})(typeof window !== "undefined" ? window : globalThis);
