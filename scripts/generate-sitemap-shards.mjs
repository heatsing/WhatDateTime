import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const output = path.resolve("dist");
const shardSize = 1_000;
const siteUrl = (process.env.PUBLIC_SITE_URL || "https://whatdatetime.com").replace(/\/$/, "");
const pageIndex = JSON.parse(readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"));
const revisions = JSON.parse(readFileSync(new URL("../data/seo-revisions.json", import.meta.url), "utf8"));
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
  "about",
  "calculation-methodology",
  "data-sources",
  "contact-and-corrections",
  "privacy-policy",
  "terms-of-use",
];
const sitemapNames = {
  "days-from-today": "sitemap-days-from-today",
  "days-ago": "sitemap-days-ago",
  "hours-from-now": "sitemap-hours-from-now",
  "hours-ago": "sitemap-hours-ago",
  "weeks-from-today": "sitemap-weeks-from-today",
  "months-from-today": "sitemap-months-from-today",
  "years-from-today": "sitemap-years-from-today",
  "business-days-from-today": "sitemap-business-days-from-today",
  "date-difference": "sitemap-date-differences",
  "timezone-converter": "sitemap-time-zone-conversions",
};

mkdirSync(output, { recursive: true });
for (const file of readdirSync(output)) {
  if (/^sitemap(?:-[a-z0-9-]+)?\.xml$/.test(file)) rmSync(path.join(output, file));
}

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const pageRevision = (page, fallback) => revisions.pages?.[page.slug] || fallback;
const groups = [{
  name: "sitemap-core",
  revision: revisions.site,
  pages: coreRoutes.map((slug) => ({ slug, revision: revisions.corePages?.[slug] || revisions.site })),
}];
for (const [type, baseName] of Object.entries(sitemapNames)) {
  const familyPages = pageIndex.filter((page) => page.type === type);
  for (let offset = 0; offset < familyPages.length; offset += shardSize) {
    const part = Math.floor(offset / shardSize) + 1;
    groups.push({
      name: familyPages.length > shardSize ? `${baseName}-${part}` : baseName,
      revision: revisions[type],
      pages: familyPages.slice(offset, offset + shardSize).map((page) => ({ ...page, revision: pageRevision(page, revisions[type]) })),
    });
  }
}

const sitemapEntries = [];
let total = 0;
for (const group of groups) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(group.revision || "")) {
    throw new Error(`${group.name}: missing stable content revision`);
  }
  const fileName = `${group.name}.xml`;
  const entries = group.pages.map((page) => {
    const url = page.slug ? `${siteUrl}/${page.slug}` : siteUrl;
    return `  <url><loc>${escapeXml(url)}</loc><lastmod>${page.revision || group.revision}</lastmod></url>`;
  });
  writeFileSync(path.join(output, fileName), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
  sitemapEntries.push({ url: `${siteUrl}/${fileName}`, lastmod: group.pages.reduce((latest, page) => page.revision > latest ? page.revision : latest, group.revision) });
  total += entries.length;
}

writeFileSync(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((entry) => `  <sitemap><loc>${entry.url}</loc><lastmod>${entry.lastmod}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>`);
console.log(`Generated ${total} sitemap URLs in ${groups.length} semantic shards (maximum ${shardSize} URLs each)`);
