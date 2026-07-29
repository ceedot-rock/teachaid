/**
 * TEACHAiD onboarding
 * 1) First visit: pick interest areas
 * 2) Recommend classes from those interests
 * 3) Opening a class starts as a get-to-know conversation with the teacher
 */
(function () {
  if (typeof window === "undefined") return;

  var TI = window.TeachaidInterests;
  var MEET_KEY = "teachaid_met_teachers_v1";

  function metMap() {
    try {
      return JSON.parse(localStorage.getItem(MEET_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function markMet(bookId) {
    var m = metMap();
    m[bookId] = true;
    localStorage.setItem(MEET_KEY, JSON.stringify(m));
  }
  function hasMet(bookId) {
    return !!metMap()[bookId];
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function renderInterestPicker() {
    var home = document.getElementById("home");
    if (!home || !TI) return;
    var saved = TI.load();
    if (saved && saved.ids && saved.ids.length) {
      renderRecommendations(saved.ids);
      return;
    }

    var chips = TI.INTERESTS.map(function (a) {
      return (
        '<button type="button" class="interest-chip" data-id="' +
        esc(a.id) +
        '">' +
        "<strong>" +
        esc(a.label) +
        "</strong><span>" +
        esc(a.hint) +
        "</span></button>"
      );
    }).join("");

    home.innerHTML =
      '<div class="teaser-card" style="cursor:default">' +
      "<h3>What do you want to study?</h3>" +
      "<p>Pick one or more areas — we'll suggest classes that match. Each class has its own teacher.</p>" +
      "</div>" +
      '<div class="interest-grid" id="interestGrid">' +
      chips +
      "</div>" +
      '<button type="button" class="btn" id="interestContinue" disabled style="margin-top:14px">Show me classes</button>' +
      '<p class="voice-hint" style="margin-top:12px">You can change interests anytime from Home.</p>';

    var selected = {};
    home.querySelectorAll(".interest-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (selected[id]) {
          delete selected[id];
          btn.classList.remove("on");
        } else {
          selected[id] = true;
          btn.classList.add("on");
        }
        var n = Object.keys(selected).length;
        var go = document.getElementById("interestContinue");
        if (go) go.disabled = n < 1;
      });
    });
    var go = document.getElementById("interestContinue");
    if (go) {
      go.onclick = function () {
        var ids = Object.keys(selected);
        TI.save(ids);
        renderRecommendations(ids);
      };
    }
  }

  function renderRecommendations(ids) {
    var home = document.getElementById("home");
    if (!home || !TI) return;
    var bookIds = TI.booksFor(ids);
    var books = window.BOOKS || window.BUILTIN_BOOKS || {};

    var cards = bookIds
      .map(function (id) {
        var b = books[id];
        if (!b) return "";
        return (
          '<div class="card" onclick="openBook(\'' +
          id +
          "')">" +
          '<span class="tag">FOR YOU</span>' +
          "<h3>" +
          esc(b.title) +
          "</h3>" +
          "<p>" +
          esc(b.card || b.summary || "") +
          "</p>" +
          '<div class="teacher-pill">Teacher ' +
          esc(b.teacher) +
          "</div></div>"
        );
      })
      .filter(Boolean)
      .join("");

    home.innerHTML =
      '<div class="teaser-card" style="cursor:default">' +
      "<h3>Classes matched to your interests</h3>" +
      "<p>Open a class to meet your teacher. First chats are about getting to know each other — then you learn together.</p>" +
      "</div>" +
      (cards || "<p class=\"label\">No matches yet — change interests.</p>") +
      '<button type="button" class="btn secondary" id="changeInterests" style="margin-top:12px">Change interests</button>' +
      '<p class="label">Browse full catalog</p><div id="homeCatalogOnboard"></div>';

    var ch = document.getElementById("changeInterests");
    if (ch) {
      ch.onclick = function () {
        localStorage.removeItem(TI.KEY);
        renderInterestPicker();
      };
    }
    if (typeof window.renderBuiltinCatalog === "function") {
      try {
        window.renderBuiltinCatalog();
        var src = document.getElementById("homeCatalog");
        var dest = document.getElementById("homeCatalogOnboard");
        if (src && dest) dest.innerHTML = src.innerHTML;
      } catch (e) {}
    }
  }

  function installSafe() {
    if (!window.openBook || window.__teachaidOpenWrapped) {
      bootHome();
      return;
    }
    window.__teachaidOpenWrapped = true;
    var orig = window.openBook;
    window.openBook = function (id) {
      orig(id);
      if (hasMet(id)) return;
      try {
        var log = document.getElementById("chatLog");
        if (log) log.innerHTML = "";
        var b = window.BOOKS && window.BOOKS[id];
        if (!b) return;
        var intro =
          "Hey — I'm " +
          b.teacher +
          ". Before we dig into “" +
          b.title +
          "”, I'd like to know you a little. What brought you to this subject, and is there anything you already know (or really don't want me to assume)?";
        if (typeof window.addBubble === "function") window.addBubble("bot", intro, false);
        if (typeof window.getHist === "function") {
          var h = window.getHist();
          h.length = 0;
          h.push({ role: "assistant", content: intro });
        }
        markMet(id);
        var banner = document.getElementById("lockBanner");
        if (banner)
          banner.textContent =
            "First session: get to know " + b.teacher + " — then learn together.";
        var input = document.getElementById("chatIn");
        if (input) input.placeholder = "Tell " + b.teacher + " a bit about yourself…";
      } catch (e) {}
    };
    bootHome();
  }

  function bootHome() {
    if (!document.getElementById("home")) return;
    renderInterestPicker();
  }

  var style = document.createElement("style");
  style.textContent =
    ".interest-grid{display:flex;flex-direction:column;gap:10px;margin-top:8px}" +
    ".interest-chip{text-align:left;background:var(--bg-card,#161622);border:1px solid rgba(255,255,255,.08);" +
    "border-radius:16px;padding:14px 16px;color:inherit;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.22)}" +
    ".interest-chip strong{display:block;font-size:.98rem;margin-bottom:4px}" +
    ".interest-chip span{font-size:.82rem;color:#9b9bb0;line-height:1.4}" +
    ".interest-chip.on{border-color:rgba(94,234,212,.45);background:rgba(94,234,212,.1);" +
    "box-shadow:0 0 0 3px rgba(94,234,212,.1)}";
  document.head.appendChild(style);

  function tryInstall() {
    if (window.openBook) installSafe();
    else setTimeout(tryInstall, 50);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInstall);
  } else {
    tryInstall();
  }
})();
