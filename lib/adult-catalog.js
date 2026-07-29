/**
 * TEACHAiD catalog filter
 * Removes early counting / toy foundations (s1–s3).
 * Learners start from real further-ed and programming material.
 */
(function (global) {
  var RETIRED = {
    s1: true, // Counting
    s2: true, // Positive & Negative (foundations path)
    s3: true, // How Computers Count (toy bits path)
  };

  function apply() {
    var books = global.BUILTIN_BOOKS;
    if (!books) return;
    Object.keys(RETIRED).forEach(function (id) {
      if (books[id]) delete books[id];
    });
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
  }

  apply();
  global.TeachaidAdultCatalog = { apply: apply, RETIRED: RETIRED };
})(typeof window !== "undefined" ? window : globalThis);
