import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const appDir = path.resolve(".next/server/app");
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://chronocraft-time.heatsinghaiqing.chatgpt.site";
const pageIndex = JSON.parse(
  readFileSync(new URL("../data/tools/index.json", import.meta.url), "utf8"),
);
const coreRoutes = [
  "",
  "calculators/date-calculator",
  "calculators/time-difference",
  "calculators/age-calculator",
  "calculators/countdown",
  "calculators/timezone-converter",
];
const routes = [
  ...coreRoutes.map((route) => ({
    route,
    expectedCanonical: route ? `${siteUrl}/${route}` : siteUrl,
    programmatic: false,
  })),
  ...pageIndex.map((page) => ({
    route: page.slug,
    expectedCanonical: `${siteUrl}/${page.slug}`,
    programmatic: true,
  })),
];

function fail(message) {
  throw new Error(`Static HTML SEO check failed: ${message}`);
}

function captureAll(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

const titles = new Map();
const descriptions = new Map();
const checkedRoutes = new Set();

for (const routeEntry of routes) {
  const { route, expectedCanonical, programmatic } = routeEntry;
  const htmlPath = path.join(appDir, route ? `${route}.html` : "index.html");
  if (!existsSync(htmlPath)) {
    fail(`/${route}: generated HTML is missing at ${htmlPath}`);
  }
  const html = readFileSync(htmlPath, "utf8");
  checkedRoutes.add(route);

  const pageTitles = captureAll(html, /<title>(.*?)<\/title>/g);
  const pageDescriptions = captureAll(
    html,
    /<meta name="description" content="([^"]*)"/g,
  );
  const canonicals = captureAll(
    html,
    /<link rel="canonical" href="([^"]*)"/g,
  );
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  const jsonLdScripts = captureAll(
    html,
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );

  if (pageTitles.length !== 1 || !pageTitles[0].trim()) {
    fail(`/${route}: expected one non-empty title`);
  }
  if (pageDescriptions.length !== 1 || !pageDescriptions[0].trim()) {
    fail(`/${route}: expected one non-empty meta description`);
  }
  if (canonicals.length !== 1) {
    fail(`/${route}: expected exactly one canonical`);
  }
  if (canonicals[0] !== expectedCanonical) {
    fail(
      `/${route}: canonical ${canonicals[0]} does not match ${expectedCanonical}`,
    );
  }
  if (!canonicals[0].startsWith("https://")) {
    fail(`/${route}: canonical is not absolute HTTPS`);
  }
  if (h1Count !== 1) {
    fail(`/${route}: expected exactly one H1, received ${h1Count}`);
  }
  if (!jsonLdScripts.length) {
    fail(`/${route}: JSON-LD is missing`);
  }
  if (/name="robots" content="[^"]*noindex/i.test(html)) {
    fail(`/${route}: unexpected noindex`);
  }
  if (
    html.includes("{{") ||
    html.includes("localhost:") ||
    html.includes(".netlify.app")
  ) {
    fail(`/${route}: unresolved placeholder or invalid production host`);
  }
  if (programmatic && !html.includes('aria-live="polite"')) {
    fail(`/${route}: pre-rendered calculator answer is missing`);
  }

  const schemaTypes = new Set();
  for (const script of jsonLdScripts) {
    let parsed;
    try {
      parsed = JSON.parse(script);
    } catch {
      fail(`/${route}: JSON-LD is not valid JSON`);
    }
    const schemas = Array.isArray(parsed) ? parsed : [parsed];
    for (const schema of schemas) {
      schemaTypes.add(schema["@type"]);
      if (
        ["WebApplication", "WebPage"].includes(schema["@type"]) &&
        schema.url &&
        schema.url !== expectedCanonical
      ) {
        fail(`/${route}: JSON-LD URL does not match canonical`);
      }
      if (schema["@type"] === "BreadcrumbList") {
        const lastItem = schema.itemListElement?.at(-1)?.item;
        if (lastItem && lastItem !== expectedCanonical) {
          fail(`/${route}: breadcrumb URL does not match canonical`);
        }
      }
    }
  }
  if (programmatic) {
    for (const requiredType of [
      "FAQPage",
      "WebApplication",
      "BreadcrumbList",
    ]) {
      if (!schemaTypes.has(requiredType)) {
        fail(`/${route}: missing ${requiredType} schema`);
      }
    }
  }

  titles.set(pageTitles[0], [...(titles.get(pageTitles[0]) ?? []), route]);
  descriptions.set(pageDescriptions[0], [
    ...(descriptions.get(pageDescriptions[0]) ?? []),
    route,
  ]);
}

for (const [title, matchingRoutes] of titles) {
  if (matchingRoutes.length > 1) {
    fail(`duplicate title on ${matchingRoutes.join(", ")}: ${title}`);
  }
}
for (const [description, matchingRoutes] of descriptions) {
  if (matchingRoutes.length > 1) {
    fail(
      `duplicate description on ${matchingRoutes.join(", ")}: ${description}`,
    );
  }
}

const sitemapPath = path.join(appDir, "sitemap.xml.body");
if (!existsSync(sitemapPath)) fail("generated sitemap.xml is missing");
const sitemap = readFileSync(sitemapPath, "utf8");
const sitemapUrls = captureAll(sitemap, /<loc>(.*?)<\/loc>/g);
if (sitemapUrls.length !== new Set(sitemapUrls).size) {
  fail("sitemap contains duplicate URLs");
}
for (const route of routes) {
  if (!sitemapUrls.includes(route.expectedCanonical)) {
    fail(`/${route.route}: generated page is missing from sitemap`);
  }
}
if (/<lastmod>/.test(sitemap)) {
  fail("sitemap contains lastModified without verified content dates");
}

console.log(
  [
    `Static HTML SEO check passed: ${checkedRoutes.size} indexable pages`,
    `${pageIndex.length} programmatic HTML files match the route inventory`,
    `${sitemapUrls.length} unique sitemap URLs`,
    "canonical, metadata, H1, direct answer, and JSON-LD checks passed",
    "duplicate titles: 0; duplicate descriptions: 0; unexpected noindex: 0",
  ].join("\n"),
);
