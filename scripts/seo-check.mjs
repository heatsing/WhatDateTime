// Unified static/on-demand gate. The policy, not historical URL volume, controls indexing.
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import {
  cities,
  getPageIndexEligibility,
  getPairCities,
} from "../lib/indexEligibility.ts";
import {
  coreSlugs,
  hubRoutes,
  calculationDirectories,
  allPublicSlugs,
  allIndexableSlugs,
} from "../lib/siteInventory.ts";
import { checkDescriptionFacts } from "./seo-description-tests.mjs";
const site = "https://whatdatetime.com";
const read = (p) => fs.readFileSync(p, "utf8");
const index = JSON.parse(read("data/tools/index.json"));
const policy = JSON.parse(read("data/index-policy.json"));
const low = JSON.parse(read("workers/generated/routes.json"));
const baseline = JSON.parse(read("data/seo-url-baseline.json"));
const errors = [];
const assert = (pass, message) => {
  if (!pass) errors.push(message);
};
const known = new Set(allPublicSlugs),
  eligible = new Set(allIndexableSlugs);
assert(known.size === allPublicSlugs.length, "Duplicate route");
assert(
  eligible.size >= 1000 && eligible.size <= 2500,
  "Indexable count outside the explicitly authorized first-phase range",
);
for (const url of baseline.urls)
  assert(
    known.has(new URL(url).pathname.replace(/^\/|\/$/g, "")),
    `Lost original route ${url}`,
  );
for (const slug of Object.keys(policy.protected))
  assert(eligible.has(slug), `Protected evidence lost: ${slug}`);
for (const slug of policy.curated)
  assert(eligible.has(slug), `Curated route missing: ${slug}`);
for (const city of cities) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: city.zone }).format();
  } catch {
    errors.push(`Invalid IANA zone ${city.slug}`);
  }
}
for (const p of index.filter((p) => p.kind === "timezone"))
  assert(!!getPairCities(p.slug), `Invalid city pair ${p.slug}`);
const cfg = JSON.parse(read("wrangler.jsonc"));
assert(
  cfg.name === "whatdatetime" &&
    cfg.assets.binding === "ASSETS" &&
    !cfg.assets.run_worker_first,
  "Assets must be served before the fallback Worker",
);
assert(
  cfg.compatibility_flags.includes("assets_navigation_has_no_effect"),
  "Browser navigation must reach known non-static routes before the custom 404 fallback",
);
assert(
  cfg.routes.some((r) => r.pattern === "whatdatetime.com" && r.custom_domain),
  "Canonical custom domain missing",
);
const redirects = read("public/_redirects");
assert(
  redirects.includes(
    "/time-zone-converter /calculators/timezone-converter 308",
  ),
  "Existing converter alias missing",
);
const robots = read("dist/robots.txt");
assert(
  !/^Disallow:\s*\//im.test(robots),
  "Robots blocks crawling of noindex or public routes",
);
assert(robots.includes(`${site}/sitemap.xml`), "Incorrect robots sitemap URL");
const sitemapIndex = read("dist/sitemap.xml");
const locs = (text) =>
  [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapUrls = locs(sitemapIndex).flatMap((url) => {
  const xml = read(path.join("dist", new URL(url).pathname));
  const urls = locs(xml);
  assert(urls.length <= 1000, `Oversize shard ${url}`);
  assert(
    !/<priority>|<changefreq>/.test(xml),
    "Avoid unsupported crawl-frequency claims",
  );
  for (const date of [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)])
    assert(/^\d{4}-\d{2}-\d{2}$/.test(date[1]), `Invalid revision in ${url}`);
  return urls;
});
const sitemapSet = new Set(sitemapUrls);
assert(sitemapSet.size === sitemapUrls.length, "Duplicate sitemap URL");
for (const slug of allPublicSlugs)
  assert(
    sitemapSet.has(slug ? `${site}/${slug}` : site) === eligible.has(slug),
    `Sitemap eligibility mismatch: ${slug}`,
  );
assert(sitemapUrls.length === eligible.size, "Sitemap contains unknown URLs");
const decode = (s) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const sourceMetadata = new Map();
for (const file of new Set(index.map((p) => p.dataFile)))
  for (const p of JSON.parse(read(`data/tools/${file}`)))
    sourceMetadata.set(p.slug, {
      title: `${p.title} | WhatDateTime`,
      description: p.description,
      h1: p.kind === "relative" && p.direction === "past" ? p.title : p.h1,
    });
const attr = (tag, name) =>
  decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || "");
const meta = (html, key) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((m) => m[0])
    .find((t) => attr(t, "name") === key || attr(t, "property") === key);
  return tag ? attr(tag, "content") : "";
};
const titles = new Map(),
  descriptions = new Map(),
  graph = new Map();
function unique(map, value, slug, label) {
  assert(!!value, `${slug}: empty ${label}`);
  assert(!map.has(value), `${slug}: duplicate ${label} with ${map.get(value)}`);
  map.set(value, slug);
}
const aliases = new Set([
  "/date-calculator",
  "/time-difference-calculator",
  "/age-calculator",
  "/countdown-timer",
  "/time-zone-converter",
]);
function inspect(slug, html, isIndex, { register = true } = {}) {
  assert(!html.includes('\u0000')&&!html.includes('\ufffd'), `${slug}: corrupted Unicode in rendered HTML`);
  for (const match of html.matchAll(
    /(?:src|href|component-url|renderer-url)="(\/_astro\/[^"?]+)(?:\?[^"<>]*)?"/g,
  )) {
    assert(
      fs.existsSync(path.join("dist", match[1])),
      `${slug}: missing build asset ${match[1]}`,
    );
  }
  const canonical = slug ? `${site}/${slug}` : site;
  const links = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((t) => attr(t, "rel") === "canonical");
  assert(
    links.length === 1 && attr(links[0] || "", "href") === canonical,
    `${slug}: canonical missing, duplicate or mismatched`,
  );
  assert(
    /noindex/.test(meta(html, "robots")) === !isIndex,
    `${slug}: incorrect robots`,
  );
  assert(
    (html.match(/<h1\b/gi) || []).length === 1,
    `${slug}: expected exactly one H1`,
  );
  assert(
    meta(html, "og:url") === canonical,
    `${slug}: OG URL differs from canonical`,
  );
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = meta(html, "description");
  const source = sourceMetadata.get(slug);
  if (source) {
    assert(
      title === source.title && description === source.description,
      `${slug}: original metadata changed`,
    );
    const h1 = decode(
      (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || "").replace(
        /<[^>]*>/g,
        "",
      ),
    );
    assert(h1 === source.h1, `${slug}: H1 differs from page data`);
  }
  assert(
    title === meta(html, "og:title") && title === meta(html, "twitter:title"),
    `${slug}: social title drift`,
  );
  assert(
    description === meta(html, "og:description") &&
      description === meta(html, "twitter:description"),
    `${slug}: social description drift`,
  );
  if (register) {
    unique(titles, title, slug, "title");
    unique(descriptions, description, slug, "description");
  }
  const schemas = [];
  for (const m of html.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const value = JSON.parse(m[1]);
      schemas.push(...(Array.isArray(value) ? value : [value]));
    } catch {
      errors.push(`${slug}: invalid JSON-LD`);
    }
  }
  assert(schemas.length > 0, `${slug}: missing schema`);
  const apps = schemas.filter(
    (s) => s["@type"] === "WebApplication" || s["@type"] === "CollectionPage",
  );
  assert(
    apps.some((s) => s.url === canonical) ||
      slug === "about" ||
      [
        "calculation-methodology",
        "data-sources",
        "contact-and-corrections",
        "privacy-policy",
        "terms-of-use",
      ].includes(slug),
    `${slug}: matching page/application schema missing`,
  );
  const visible = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const visibleText = decode(
    visible.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " "),
  ).replace(/\s+/g, " ");
  for (const schema of schemas.filter((s) => s["@type"] === "FAQPage"))
    for (const faq of schema.mainEntity || []) {
      assert(
        visibleText.includes(faq.name.replace(/\s+/g, " ")),
        `${slug}: FAQ question not visible`,
      );
      assert(
        visibleText.includes(faq.acceptedAnswer.text.replace(/\s+/g, " ")),
        `${slug}: FAQ answer not visible or mismatched`,
      );
    }
  if (index.find((p) => p.slug === slug)?.kind === "timezone") {
    const pair = getPairCities(slug);
    assert(
      pair.every((c) => visible.includes(c.zone)),
      `${slug}: IANA data absent from initial HTML`,
    );
    assert(
      visible.includes("data-conversion-table") &&
        visible.includes("Working-hours overlap") &&
        visible.includes("Meeting planner"),
      `${slug}: missing functional conversion modules`,
    );
    const table =
      visible.match(
        /<table[^>]*data-conversion-table[^>]*>([\s\S]*?)<\/table>/,
      )?.[1] || "";
    assert(
      (table.match(/<tr>/g) || []).length === 25,
      `${slug}: conversion table must have 24 data rows`,
    );
  }
  const destinations = [];
  for (const tag of [...html.matchAll(/<a\b[^>]*>/gi)].map((m) => m[0])) {
    const href = attr(tag, "href");
    if (!href || (!href.startsWith("/") && !href.startsWith(site))) continue;
    const url = new URL(href, site);
    if (url.origin !== site) continue;
    const target = url.pathname.replace(/^\/|\/$/g, "");
    if (aliases.has(url.pathname) || /\.[a-z0-9]{2,5}$/.test(url.pathname))
      continue;
    assert(known.has(target), `${slug}: broken internal link ${href}`);
    destinations.push(target);
  }
  if (isIndex) graph.set(slug, destinations);
}
for (const slug of allIndexableSlugs) {
  const file = path.join("dist", slug, "index.html");
  assert(fs.existsSync(file), `${slug}: missing prerendered HTML`);
  if (fs.existsSync(file)) inspect(slug, read(file), true);
}
assert(
  low.length ===
    index.filter((p) => !getPageIndexEligibility(p).indexable).length,
  "On-demand manifest size drift",
);
const lowSet = new Set(low.map((p) => p.slug));
for (const p of index) {
  assert(
    eligible.has(p.slug) || lowSet.has(p.slug),
    `Unserved route ${p.slug}`,
  );
  if (lowSet.has(p.slug))
    assert(
      !fs.existsSync(path.join("dist", p.slug, "index.html")),
      `Noindex route still force-built: ${p.slug}`,
    );
}
for (const p of low) {
  unique(titles, `${p.title} | WhatDateTime`, p.slug, "title");
  unique(descriptions, p.description, p.slug, "description");
}
const visited = new Set([""]),
  queue = [""];
const depth = new Map([["", 0]]);
for (let i = 0; i < queue.length; i++)
  for (const next of graph.get(queue[i]) || [])
    if (eligible.has(next) && !visited.has(next)) {
      visited.add(next);
      depth.set(next, depth.get(queue[i]) + 1);
      queue.push(next);
    }
for (const slug of eligible)
  assert(visited.has(slug), `Indexable orphan: ${slug}`);
// Render actual fallback React HTML with the same Worker entry and production shell.
await build({
  entryPoints: ["workers/on-demand.tsx"],
  outfile: "workers/generated/test-renderer.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".html": "text" },
  tsconfig: "workers/tsconfig.json",
  logLevel: "silent",
});
const { renderOnDemand } =
  await import("../workers/generated/test-renderer.mjs");
const lowPairs = low.filter((p) => p.kind === "timezone");
const sampled = [
  ...Array.from(
    { length: 10 },
    (_, i) => lowPairs[Math.floor((i * lowPairs.length) / 10)],
  ),
  ...Array.from(new Set(low.map((p) => p.type))).map((type) =>
    low.find((p) => p.type === type),
  ),
];
for (const p of sampled)
  inspect(p.slug, renderOnDemand(p.slug, "2026-09-26T12:00:00.000Z"), false, {
    register: false,
  });
assert(
  renderOnDemand("nonexistent-city-to-made-up-city-time") === undefined,
  "Unknown route must not render a soft 404",
);
checkDescriptionFacts();
const report = {
  policyVersion: policy.version,
  before: { total: 10013, indexable: 10013, sitemap: 10013 },
  after: {
    total: known.size,
    indexable: eligible.size,
    noindex: low.length,
    core: coreSlugs.length,
    cityHubs: hubRoutes.filter((p) => p.kind === "city").length,
    cityPairs: index.filter((p) => p.kind === "timezone").length,
    indexableCityPairs: index.filter(
      (p) => p.kind === "timezone" && getPageIndexEligibility(p).indexable,
    ).length,
    directoryAndRegionPages:
      hubRoutes.filter((p) => p.kind !== "city").length +
      calculationDirectories.length,
    sitemapURLs: sitemapSet.size,
    sitemapShards: locs(sitemapIndex).length,
    maxCrawlDepth: Math.max(...depth.values()),
  },
  checked: {
    staticHTML: eligible.size,
    onDemandHTMLSamples: sampled.length,
    metadataRecords: titles.size,
    knownRoutes: known.size,
  },
  errors,
  evidence:
    "Editorial priorities and owner-reported indexing; no verified GSC query/page export. No indexing or traffic promise.",
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/seo-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
const text = `# SEO index and HTML audit\n\nPolicy: ${policy.version}. ${report.evidence}\n\n| Metric | After |\n|---|---:|\n${Object.entries(
  report.after,
)
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}\n\nChecks: ${JSON.stringify(report.checked)}.\n\n${
  errors.length
    ? `## Failures\n\n${errors
        .slice(0, 100)
        .map((e) => "- " + e)
        .join("\n")}`
    : "All canonical, metadata uniqueness, robots, sitemap eligibility, JSON-LD, HTML and reachable-link checks passed."
}\n`;
fs.writeFileSync("reports/seo-audit.md", text);
fs.writeFileSync("SEO_INDEX_REPORT.md", text);
fs.writeFileSync(
  "reports/index-eligibility.json",
  JSON.stringify(
    index.map((p) => ({ slug: p.slug, ...getPageIndexEligibility(p) })),
    null,
    2,
  ) + "\n",
);
if (errors.length)
  throw new Error(
    `${errors.length} SEO errors:\n${errors.slice(0, 35).join("\n")}`,
  );
console.log(text);
