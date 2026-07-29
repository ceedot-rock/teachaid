/**
 * TEACHAiD · interest areas for adult further education
 * First-run UI: pick interests → recommended classes.
 */
(function (global) {
  var INTERESTS = [
    {
      id: "programming",
      label: "Programming & coding",
      hint: "Write software from the ground up",
      books: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
    },
    {
      id: "math",
      label: "Math & quantitative",
      hint: "Algebra, stats, and numbers that hold up",
      books: ["col_alg", "col_stat", "col_data"],
    },
    {
      id: "writing",
      label: "Writing & communication",
      hint: "Essays, speaking, and clear arguments",
      books: ["col_eng", "col_speak", "col_lit", "col_crit"],
    },
    {
      id: "science",
      label: "Science & health",
      hint: "Biology, chemistry, body systems, scientific method",
      books: ["col_bio", "col_chem", "col_sci", "col_physio"],
    },
    {
      id: "society",
      label: "History, society & law",
      hint: "Past, people, institutions, and rights",
      books: ["col_hist", "col_world", "col_psych", "col_law", "col_econ"],
    },
    {
      id: "tech",
      label: "AI, cyber & digital life",
      hint: "Modern tools, security, and working with AI",
      books: ["col_ai", "col_aihuman", "col_cyber", "col_digital"],
    },
    {
      id: "arts",
      label: "Arts, music & meaning",
      hint: "Creative practice and culture",
      books: ["col_art", "col_music", "col_mubiz", "col_relig"],
    },
    {
      id: "career",
      label: "Career & money skills",
      hint: "Finance, networking, professional footing",
      books: ["col_finance", "col_network"],
    },
  ];

  var KEY = "teachaid_interests_v1";

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && Array.isArray(raw.ids)) return raw;
    } catch (e) {}
    return null;
  }

  function save(ids) {
    var clean = (ids || []).filter(Boolean).slice(0, 8);
    localStorage.setItem(
      KEY,
      JSON.stringify({ ids: clean, at: new Date().toISOString() })
    );
    return clean;
  }

  function booksFor(ids) {
    var set = {};
    (ids || []).forEach(function (id) {
      var area = INTERESTS.find(function (a) {
        return a.id === id;
      });
      if (!area) return;
      area.books.forEach(function (b) {
        set[b] = true;
      });
    });
    return Object.keys(set);
  }

  global.TeachaidInterests = {
    KEY: KEY,
    INTERESTS: INTERESTS,
    load: load,
    save: save,
    booksFor: booksFor,
  };
})(typeof window !== "undefined" ? window : globalThis);
