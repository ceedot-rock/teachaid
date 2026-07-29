/**
 * TEACHAiD adult catalog filter
 * Removes early-childhood foundations (Counting, etc.).
 * Audience: adult further-education learners only.
 */
(function (global) {
  var RETIRED = {
    s1: true, // Counting
    s2: true, // Positive & Negative (kid path)
    s3: true, // How Computers Count (toy path into coding)
  };

  function apply() {
    var books = global.BUILTIN_BOOKS;
    if (!books) return;
    Object.keys(RETIRED).forEach(function (id) {
      if (books[id]) delete books[id];
    });
    // Adult tracks only
    global.BUILTIN_TRACKS = [
      {
        id: "coding101",
        label: "Programming",
        blurb: "Adult software path — programs, variables, decisions, loops, functions, lists",
      },
      {
        id: "college",
        label: "College & career 101s",
        blurb: "Further education: gen-ed, AI, science, arts, law, finance, and more",
      },
    ];
  }

  apply();
  global.TeachaidAdultCatalog = { apply: apply, RETIRED: RETIRED };
})(typeof window !== "undefined" ? window : globalThis);
