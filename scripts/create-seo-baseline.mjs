import { writeFileSync } from "node:fs";
import pageIndex from "../data/tools/index.json" with { type: "json" };

const site = "https://whatdatetime.com";
const calculators = [
  "date-calculator",
  "time-difference",
  "age-calculator",
  "countdown",
  "timezone-converter",
  "days-until",
  "day-of-week",
  "days-in-month",
  "weeks-in-year",
  "calendar",
  "half-birthday",
  "weeks-and-days-ago",
];
const urls = [
  site,
  ...calculators.map((slug) => `${site}/calculators/${slug}`),
  ...pageIndex.map((page) => `${site}/${page.slug}`),
].sort();
const counts = pageIndex.reduce((result, page) => {
  result[page.type] = (result[page.type] ?? 0) + 1;
  return result;
}, {});

if (urls.length !== 10_007 || new Set(urls).size !== urls.length) {
  throw new Error(`Expected 10,007 unique baseline URLs, received ${urls.length}`);
}

writeFileSync(
  new URL("../data/seo-url-baseline.json", import.meta.url),
  `${JSON.stringify({ capturedAt: "2026-09-09", total: urls.length, counts: { homepage: 1, calculators: calculators.length, ...counts }, urls }, null, 2)}\n`,
);
console.log(`Saved ${urls.length} unique baseline URLs`);
