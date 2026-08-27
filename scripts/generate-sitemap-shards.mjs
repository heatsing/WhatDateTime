import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const appOutput = path.resolve(".next/server/app");
const sourcePath = path.join(appOutput, "sitemap.xml.body");
const shardSize = 2_000;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://whatdatetime.com").replace(/\/$/, "");
const pageIndex = JSON.parse(
  readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"),
);
const typeBySlug = new Map(pageIndex.map((page) => [page.slug, page.type]));

if (!existsSync(sourcePath)) {
  throw new Error(`Cannot split sitemap: ${sourcePath} does not exist`);
}

const source = readFileSync(sourcePath, "utf8");
if (source.includes("<sitemapindex")) {
  const existingShards = [...source.matchAll(/<loc>[^<]*\/(sitemap-[a-z0-9-]+\.xml)<\/loc>/g)];
  if (existingShards.length > 0 && existingShards.every((match) => existsSync(path.join(appOutput, `${match[1]}.body`)))) {
    console.log(`Sitemap already split into ${existingShards.length} family shards`);
    process.exit(0);
  }
  throw new Error("Sitemap index exists but one or more family shard files are missing");
}

for (const file of readdirSync(appOutput)) {
  if (/^sitemap-[a-z0-9-]+\.xml\.body$/.test(file)) {
    rmSync(path.join(appOutput, file));
  }
}

const entries = source.match(/<url>[\s\S]*?<\/url>/g) || [];
if (entries.length === 0) {
  throw new Error("Cannot split sitemap: no <url> entries found");
}

const entriesByFamily = new Map();
for (const entry of entries) {
  const url = entry.match(/<loc>(.*?)<\/loc>/)?.[1];
  if (!url) throw new Error("Sitemap entry is missing its URL");
  const slug = new URL(url).pathname.replace(/^\//, "");
  const family = typeBySlug.get(slug) || "core";
  const familyEntries = entriesByFamily.get(family) || [];
  familyEntries.push(entry);
  entriesByFamily.set(family, familyEntries);
}

const shardUrls = [];
for (const [family, familyEntries] of entriesByFamily) {
  const partCount = Math.ceil(familyEntries.length / shardSize);
  for (let offset = 0; offset < familyEntries.length; offset += shardSize) {
    const part = Math.floor(offset / shardSize) + 1;
    const suffix = partCount > 1 ? `-${part}` : "";
    const fileName = `sitemap-${family}${suffix}.xml`;
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${familyEntries.slice(offset, offset + shardSize).join("\n")}\n</urlset>`;
    writeFileSync(path.join(appOutput, `${fileName}.body`), body);
    shardUrls.push(`${siteUrl}/${fileName}`);
  }
}

const indexBody = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${shardUrls.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join("\n")}\n</sitemapindex>`;
writeFileSync(sourcePath, indexBody);

console.log(`Split ${entries.length} sitemap URLs into ${shardUrls.length} family shards of at most ${shardSize}`);
