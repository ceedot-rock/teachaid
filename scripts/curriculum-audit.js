#!/usr/bin/env node
/**
 * Score TEACHAiD built-in catalog against lower-division GE rubric.
 * Usage: node scripts/curriculum-audit.js
 */
const path = require("path");
const root = path.join(__dirname, "..");
require(path.join(root, "builtin-books.js"));
require(path.join(root, "curriculum-enrichment.js"));
const rubric = require(path.join(root, "lib/ge-rubric.js"));

const BOOKS = global.BUILTIN_BOOKS || {};
const ids = Object.keys(BOOKS);

function bookBlob(b) {
  const parts = [
    b.title,
    b.card,
    b.teacherBlurb,
    (b.outcomes || []).join(" "),
    (b.ch || [])
      .map((c) => [c.n, c.t, c.h].join(" "))
      .join(" "),
  ];
  return parts.join(" ").toLowerCase();
}

function topicHits(blob, topics) {
  const hits = [];
  const miss = [];
  topics.forEach((t) => {
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (re.test(blob)) hits.push(t);
    else miss.push(t);
  });
  return { hits, miss, pct: topics.length ? hits.length / topics.length : 0 };
}

const byBucket = {};
ids.forEach((id) => {
  const b = BOOKS[id];
  const bucket = b.geBucket || "unmapped";
  if (!byBucket[bucket]) byBucket[bucket] = [];
  byBucket[bucket].push(id);
});

console.log("TEACHAiD curriculum audit");
console.log("Rubric:", rubric.version);
console.log("Books:", ids.length);
console.log("");

let requiredOk = 0;
let requiredTotal = 0;

rubric.buckets.forEach((bucket) => {
  const members = byBucket[bucket.id] || [];
  const blobs = members.map((id) => bookBlob(BOOKS[id])).join(" \n ");
  const { hits, miss, pct } = topicHits(blobs, bucket.exemplarTopics);
  const status =
    members.length === 0 ? "MISSING" : pct >= 0.5 ? "OK" : "THIN";
  if (bucket.required) {
    requiredTotal++;
    if (status === "OK") requiredOk++;
  }
  console.log(
    `[${status}] ${bucket.id} — ${bucket.label}` +
      (bucket.required ? " (required)" : " (optional)")
  );
  console.log(
    `  courses: ${members.length ? members.map((id) => BOOKS[id].title).join("; ") : "—"}`
  );
  console.log(
    `  topic coverage: ${(pct * 100).toFixed(0)}% (${hits.length}/${bucket.exemplarTopics.length})`
  );
  if (miss.length) console.log(`  gaps: ${miss.join(", ")}`);
  console.log("");
});

const unmapped = byBucket.unmapped || byBucket.enrichment || [];
const unmappedIds = ids.filter((id) => {
  const g = BOOKS[id].geBucket;
  return !g || g === "unmapped" || g === "enrichment" || g === "bridge";
});

console.log("Bridge / enrichment / other:");
unmappedIds.forEach((id) => {
  const b = BOOKS[id];
  console.log(
    `  - ${b.title} [${b.geBucket || "—"} · ${b.scope || "—"} · ${b.ch.length} ch]`
  );
});

console.log("");
console.log(
  `Required GE buckets OK: ${requiredOk}/${requiredTotal} (${(
    (requiredOk / Math.max(1, requiredTotal)) *
    100
  ).toFixed(0)}%)`
);

const thin = ids.filter((id) => (BOOKS[id].ch || []).length < 5);
if (thin.length) {
  console.log(
    "Short modules (<5 ch):",
    thin.map((id) => BOOKS[id].title).join(", ")
  );
}

const noOutcomes = ids.filter((id) => !(BOOKS[id].outcomes || []).length);
if (noOutcomes.length) {
  console.log(
    "Missing outcomes:",
    noOutcomes.map((id) => BOOKS[id].title).join(", ")
  );
}

process.exit(requiredOk < requiredTotal ? 0 : 0); // report only; don't fail CI yet
