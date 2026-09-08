import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const output = path.resolve("dist");
const shardSize = 1_000;
const siteUrl = (process.env.PUBLIC_SITE_URL || "https://whatdatetime.com").replace(/\/$/, "");
const pageIndex = JSON.parse(readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"));
const buildDate = new Date().toISOString().slice(0, 10);
const coreRoutes = [
  "",
  "calculators/date-calculator",
  "calculators/time-difference",
  "calculators/age-calculator",
  "calculators/countdown",
  "calculators/timezone-converter",
  "calculators/days-until",
  "calculators/day-of-week",
  "calculators/days-in-month",
  "calculators/weeks-in-year",
  "calculators/calendar",
  "calculators/half-birthday",
  "calculators/weeks-and-days-ago",
];

mkdirSync(output, { recursive: true });
for (const file of readdirSync(output)) {
  if (/^sitemap(?:-[a-z0-9-]+)?\.xml$/.test(file)) rmSync(path.join(output, file));
}

const pages = [
  ...coreRoutes.map((slug) => ({ slug, updatedAt: buildDate })),
  ...pageIndex,
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const shardUrls = [];
let total = 0;
for (let offset = 0; offset < pages.length; offset += shardSize) {
  const part = Math.floor(offset / shardSize) + 1;
  const fileName = `sitemap-${part}.xml`;
  const entries = pages.slice(offset, offset + shardSize).map((page) => {
    const url = page.slug ? `${siteUrl}/${page.slug}` : siteUrl;
    // Every exported calculator answer is rebuilt from the current reference
    // date, so the visible answer, formula, FAQ and structured data all change.
    return `  <url><loc>${escapeXml(url)}</loc><lastmod>${buildDate}</lastmod></url>`;
  });
  writeFileSync(path.join(output, fileName), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
  shardUrls.push(`${siteUrl}/${fileName}`);
  total += entries.length;
}

writeFileSync(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${shardUrls.map((url) => `  <sitemap><loc>${url}</loc><lastmod>${buildDate}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>`);
console.log(`Generated ${total} sitemap URLs in ${shardUrls.length} numeric shards of ${shardSize}`);
