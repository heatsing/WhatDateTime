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

if (!existsSync(sourcePath)) {
  throw new Error(`Cannot split sitemap: ${sourcePath} does not exist`);
}

const source = readFileSync(sourcePath, "utf8");
if (source.includes("<sitemapindex")) {
  const existingShards = [...source.matchAll(/<loc>[^<]*\/sitemap-(\d+)\.xml<\/loc>/g)];
  if (existingShards.length > 0 && existingShards.every((match) => existsSync(path.join(appOutput, `sitemap-${match[1]}.xml.body`)))) {
    console.log(`Sitemap already split into ${existingShards.length} shards`);
    process.exit(0);
  }
  throw new Error("Sitemap index exists but one or more shard files are missing");
}

for (const file of readdirSync(appOutput)) {
  if (/^sitemap-\d+\.xml\.body$/.test(file)) {
    rmSync(path.join(appOutput, file));
  }
}

const entries = source.match(/<url>[\s\S]*?<\/url>/g) || [];
if (entries.length === 0) {
  throw new Error("Cannot split sitemap: no <url> entries found");
}

const shardUrls = [];
for (let offset = 0; offset < entries.length; offset += shardSize) {
  const shardNumber = Math.floor(offset / shardSize) + 1;
  const fileName = `sitemap-${shardNumber}.xml`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.slice(offset, offset + shardSize).join("\n")}\n</urlset>`;
  writeFileSync(path.join(appOutput, `${fileName}.body`), body);
  shardUrls.push(`${siteUrl}/${fileName}`);
}

const indexBody = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${shardUrls.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join("\n")}\n</sitemapindex>`;
writeFileSync(sourcePath, indexBody);

console.log(`Split ${entries.length} sitemap URLs into ${shardUrls.length} shards of at most ${shardSize}`);
