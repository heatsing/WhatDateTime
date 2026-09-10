import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const pages = JSON.parse(readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"));
const types = [...new Set(pages.map((page) => page.type))];
const sitemapFiles = readdirSync(dist).filter((file) => /^sitemap-.+\.xml$/.test(file));
const sitemapByUrl = new Map();
for (const file of sitemapFiles) {
  const xml = readFileSync(path.join(dist, file), "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) sitemapByUrl.set(match[1], file);
}
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const capture = (html, pattern) => html.match(pattern)?.[1]?.trim() ?? "";

console.log("Representative static HTML report:");
for (const type of types) {
  const page = pages.find((entry) => entry.type === type);
  const html = readFileSync(path.join(dist, page.slug, "index.html"), "utf8");
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item["@type"]);
    });
  const fact = html.match(/<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/s);
  const url = `https://whatdatetime.com/${page.slug}`;
  console.log(JSON.stringify({
    type,
    url,
    title: capture(html, /<title>(.*?)<\/title>/s),
    h1: text(capture(html, /<h1[^>]*>(.*?)<\/h1>/s)),
    description: capture(html, /<meta name="description" content="([^"]+)"/),
    canonical: capture(html, /<link rel="canonical" href="([^"]+)"/),
    schemas,
    visibleWords: text(html).split(/\s+/).filter(Boolean).length,
    internalLinks: (html.match(/href="\//g) ?? []).length,
    sitemap: sitemapByUrl.get(url),
    uniqueFact: fact ? `${text(fact[1])}: ${text(fact[2])}` : "missing",
  }));
}
