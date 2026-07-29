const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseCurriculumJson,
  normalizeBook,
  sanitizeLessonHtml,
  normalizeExisting,
  validateMaterialText,
  extractChaptersOnly,
} = require("../lib/curriculum-core");

describe("validateMaterialText", () => {
  it("rejects short material", () => {
    const r = validateMaterialText("too short");
    assert.equal(r.ok, false);
  });

  it("accepts 40+ chars", () => {
    const r = validateMaterialText("x".repeat(40));
    assert.equal(r.ok, true);
  });
});

describe("parseCurriculumJson", () => {
  it("parses plain JSON", () => {
    const r = parseCurriculumJson(
      JSON.stringify({
        title: "T",
        teacher: "Ada",
        ch: [{ n: "Hi", h: "<h2>Hi</h2><p>x</p>", t: "Chapter: Hi. x" }],
      })
    );
    assert.equal(r.ok, true);
    assert.equal(r.book.title, "T");
  });

  it("strips markdown fences", () => {
    const r = parseCurriculumJson(
      '```json\n{"title":"Fenced","teacher":"Bob","ch":[]}\n```'
    );
    assert.equal(r.ok, true);
    assert.equal(r.book.title, "Fenced");
  });

  it("fails on garbage", () => {
    const r = parseCurriculumJson("not json at all");
    assert.equal(r.ok, false);
  });
});

describe("normalizeBook", () => {
  it("builds chapters and finish button on last", () => {
    const book = normalizeBook(
      {
        title: "Demo",
        teacher: "Ada",
        ch: [
          { n: "One", h: "<h2>One</h2><p>a</p>", t: "Chapter: One. a" },
          { n: "Two", h: "<h2>Two</h2><p>b</p>", t: "Chapter: Two. b" },
        ],
      },
      "",
      ""
    );
    assert.equal(book.ch.length, 2);
    assert.match(book.ch[1].h, /finishBook/);
    assert.equal(book.custom, true);
  });

  it("sanitizes script tags in HTML", () => {
    const book = normalizeBook(
      {
        title: "X",
        teacher: "Zed",
        ch: [
          {
            n: "Bad",
            h: '<h2>Bad</h2><script>alert(1)</script><p>ok</p>',
            t: "Chapter: Bad.",
          },
        ],
      },
      "",
      ""
    );
    assert.doesNotMatch(book.ch[0].h, /<script/i);
    assert.match(book.ch[0].h, /ok/);
  });
});

describe("sanitizeLessonHtml", () => {
  it("keeps finishBook onclick only", () => {
    const h = sanitizeLessonHtml(
      '<h2>T</h2><button onclick="finishBook()">Go</button><button onclick="evil()">x</button>',
      "T"
    );
    assert.match(h, /finishBook/);
    assert.doesNotMatch(h, /evil/);
  });
});

describe("normalizeExisting / extractChaptersOnly", () => {
  it("requires title and teacher for append", () => {
    assert.equal(normalizeExisting({ title: "A" }), null);
    assert.ok(normalizeExisting({ title: "A", teacher: "Bea", chapters: [{ n: "1" }] }));
  });

  it("extracts append chapters", () => {
    const ch = extractChaptersOnly(
      {
        ch: [
          { n: "New", h: "<h2>New</h2><p>more</p>", t: "Chapter: New. more" },
        ],
      },
      "Bea",
      "Bio"
    );
    assert.equal(ch.length, 1);
    assert.equal(ch[0].n, "New");
  });
});
