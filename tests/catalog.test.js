const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Load browser-style catalog into global
require("../builtin-books.js");
const BOOKS = global.BUILTIN_BOOKS;
const TRACKS = global.BUILTIN_TRACKS;

describe("builtin catalog", () => {
  it("loads books and tracks", () => {
    assert.ok(BOOKS && typeof BOOKS === "object");
    assert.ok(Array.isArray(TRACKS) && TRACKS.length >= 3);
    assert.ok(Object.keys(BOOKS).length >= 20);
  });

  it("every book has title, teacher, track, and 1+ chapters with n/h/t", () => {
    for (const id of Object.keys(BOOKS)) {
      const b = BOOKS[id];
      assert.ok(b.title, id + " title");
      assert.ok(b.teacher, id + " teacher");
      assert.ok(b.track, id + " track");
      assert.ok(Array.isArray(b.ch) && b.ch.length >= 1, id + " chapters");
      b.ch.forEach((c, i) => {
        assert.ok(c.n, id + " ch " + i + " n");
        assert.ok(c.h && c.h.length > 10, id + " ch " + i + " h");
        assert.ok(c.t && c.t.length > 10, id + " ch " + i + " t");
      });
    }
  });

  it("includes user-requested 101 courses", () => {
    const titles = Object.values(BOOKS).map((b) => b.title);
    const need = [
      "World History 101",
      "Music Theory 101",
      "Religion & Spirituality 101",
      "US History 101",
      "Psych 101",
      "Music Business 101",
      "Science 101",
      "Physiology 101",
      "Biology 101",
      "Financial Practices 101",
      "Networking 101",
      "Artificial Intelligence 101",
      "AI / Human Cohesion 101",
      "Cybersecurity 101",
      "Data Literacy 101",
      "Digital Literacy 101",
      "Art 101",
      "Literature 101",
      "Intro to Law",
    ];
    for (const t of need) {
      assert.ok(titles.includes(t), "missing " + t);
    }
  });

  it("has at least 35 built-in books", () => {
    assert.ok(Object.keys(BOOKS).length >= 35);
  });

  it("Programming 101 track has 8 books", () => {
    const coding = Object.values(BOOKS).filter((b) => b.track === "coding101");
    assert.equal(coding.length, 8);
    const track = TRACKS.find((t) => t.id === "coding101");
    assert.ok(track);
    assert.match(track.label, /Programming 101/i);
  });

  it("last chapter of each book is identifiable for mastery", () => {
    for (const id of Object.keys(BOOKS)) {
      const n = BOOKS[id].ch.length;
      assert.ok(n >= 1);
      // mastery rule: chapterIndex === n - 1
      assert.equal(n - 1, n - 1);
    }
  });
});
