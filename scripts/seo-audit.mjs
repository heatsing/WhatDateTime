import { readFileSync } from "node:fs";

const expectedCounts = {
  "days-from-today.json": 365,
  "days-ago.json": 365,
  "hours-from-now.json": 500,
  "hours-ago.json": 500,
  "weeks.json": 200,
  "months.json": 300,
  "years.json": 300,
  "business-days.json": 1000,
  "date-difference.json": 500,
  "timezone.json": 1000,
};

const slugs = new Set();
let total = 0;

for (const [file, expected] of Object.entries(expectedCounts)) {
  const records = JSON.parse(
    readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"),
  );
  if (records.length !== expected) {
    throw new Error(`${file}: expected ${expected}, received ${records.length}`);
  }

  for (const record of records) {
    if (!record.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
      throw new Error(`${file}: invalid slug ${record.slug}`);
    }
    if (slugs.has(record.slug)) {
      throw new Error(`${file}: duplicate slug ${record.slug}`);
    }
    slugs.add(record.slug);
  }
  total += records.length;
}

if (total < 5000) {
  throw new Error(`Expected at least 5000 SEO pages, received ${total}`);
}

console.log(`SEO audit passed: ${total} unique programmatic URLs`);
