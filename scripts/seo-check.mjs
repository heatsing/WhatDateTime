import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const appDir = path.resolve("dist");
const siteUrl =
  process.env.PUBLIC_SITE_URL ||
  "https://whatdatetime.com";
const wranglerConfig = readFileSync(path.resolve("wrangler.jsonc"), "utf8");
if (!/"name"\s*:\s*"whatdatetime"/.test(wranglerConfig)) {
  fail('wrangler.jsonc must target the "whatdatetime" Worker');
}
if (!/"main"\s*:\s*"workers\/sites-entry\.js"/.test(wranglerConfig)) {
  fail("wrangler.jsonc must deploy the static SEO Worker entrypoint");
}
for (const hostname of ["whatdatetime.com", "www.whatdatetime.com"]) {
  if (
    !new RegExp(
      `"pattern"\\s*:\\s*"${hostname.replaceAll(".", "\\.")}"[\\s\\S]*?"custom_domain"\\s*:\\s*true`,
    ).test(wranglerConfig)
  ) {
    fail(`wrangler.jsonc must bind the ${hostname} custom domain`);
  }
}
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
  "calculators/days-until",
  "calculators/day-of-week",
  "calculators/days-in-month",
  "calculators/weeks-in-year",
  "calculators/calendar",
  "calculators/half-birthday",
  "calculators/weeks-and-days-ago",
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
const internalLinks = new Map();
const programmaticModifiedDates = new Map();
const programmaticSlugs = new Set(pageIndex.map((page) => page.slug));

for (const routeEntry of routes) {
  const { route, expectedCanonical, programmatic } = routeEntry;
  const htmlPath = path.join(appDir, route ? route : "", "index.html");
  if (!existsSync(htmlPath)) {
    fail(`/${route}: generated HTML is missing at ${htmlPath}`);
  }
  const html = readFileSync(htmlPath, "utf8");
  checkedRoutes.add(route);
  internalLinks.set(
    route,
    captureAll(html, /href="\/([^"?#]+)"/g).filter((slug) =>
      programmaticSlugs.has(slug),
    ),
  );

  const pageTitles = captureAll(html, /<title>(.*?)<\/title>/g);
  const pageDescriptions = captureAll(
    html,
    /<meta name="description" content="([^"]*)"/g,
  );
  const canonicals = captureAll(
    html,
    /<link rel="canonical" href="([^"]*)"/g,
  );
  const englishAlternates = captureAll(
    html,
    /<link rel="alternate" hreflang="en" href="([^"]*)"/g,
  );
  const defaultAlternates = captureAll(
    html,
    /<link rel="alternate" hreflang="x-default" href="([^"]*)"/g,
  );
  const robotsDirectives = captureAll(
    html,
    /<meta name="robots" content="([^"]*)"/g,
  );
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  const jsonLdScripts = captureAll(
    html,
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );

  if (pageTitles.length !== 1 || !pageTitles[0].trim()) {
    fail(`/${route}: expected one non-empty title`);
  }
  if (programmatic) {
    const title = pageTitles[0].trim();
    const brandSuffix = "| WhatDateTime";
    const brandSuffixCount = title.split(brandSuffix).length - 1;
    if (!title.endsWith(`? ${brandSuffix}`) || brandSuffixCount !== 1) {
      fail(
        `/${route}: expected one question-style title with one WhatDateTime suffix`,
      );
    }
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
  if (
    englishAlternates.length !== 1 ||
    englishAlternates[0] !== expectedCanonical ||
    defaultAlternates.length !== 1 ||
    defaultAlternates[0] !== expectedCanonical
  ) {
    fail(`/${route}: language alternates do not match the canonical`);
  }
  if (
    robotsDirectives.length !== 1 ||
    !robotsDirectives[0].includes("index") ||
    !robotsDirectives[0].includes("follow")
  ) {
    fail(`/${route}: indexable robots directives are missing or invalid`);
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
  let faqSchema;
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
      if (schema["@type"] === "FAQPage") faqSchema = schema;
      if (
        ["WebApplication", "WebPage"].includes(schema["@type"]) &&
        schema.url &&
        schema.url !== expectedCanonical
      ) {
        fail(`/${route}: JSON-LD URL does not match canonical`);
      }
      if (programmatic && schema["@type"] === "WebApplication") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(schema.dateModified || "")) {
          fail(`/${route}: WebApplication dateModified is missing or invalid`);
        }
        programmaticModifiedDates.set(route, schema.dateModified);
      }
      if (schema["@type"] === "BreadcrumbList") {
        const lastItem = schema.itemListElement?.at(-1)?.item;
        if (lastItem && lastItem !== expectedCanonical) {
          fail(`/${route}: breadcrumb URL does not match canonical`);
        }
      }
    }
  }
  if (route === "") {
    for (const requiredType of ["Organization", "WebSite", "WebApplication", "FAQPage"]) {
      if (!schemaTypes.has(requiredType)) {
        fail(`homepage: missing ${requiredType} schema`);
      }
    }
  } else if (!programmatic) {
    for (const requiredType of ["FAQPage", "WebApplication", "BreadcrumbList"]) {
      if (!schemaTypes.has(requiredType)) {
        fail(`/${route}: missing ${requiredType} schema`);
      }
    }
  }
  if (programmatic) {
    const stageNames = [
      "direct-answer",
      "calculation-basis",
      "how-to-use",
      "practical-scenarios",
      "nearby-results",
      "faq",
    ];
    const stagePositions = stageNames.map((stage) =>
      html.indexOf(`data-content-stage="${stage}"`),
    );
    if (
      stagePositions.some((position) => position < 0) ||
      stagePositions.some(
        (position, index) =>
          index > 0 && position <= stagePositions[index - 1],
      )
    ) {
      fail(`/${route}: landing-page content stages are missing or unordered`);
    }

    const answerMatch = html.match(
      /data-content-stage="direct-answer"[\s\S]*?<p class="[^"]*font-display[^"]*">([^<]+)<\/p>/,
    );
    if (!answerMatch?.[1]) {
      fail(`/${route}: direct numerical answer could not be extracted`);
    }
    const calculationBlock = html.slice(
      stagePositions[1],
      stagePositions[2],
    );
    if (
      !calculationBlock.includes(" = ") ||
      !calculationBlock.includes(answerMatch[1])
    ) {
      fail(`/${route}: calculation basis lacks a matching worked formula`);
    }
    const nearbyBlock = html.slice(stagePositions[4], stagePositions[5]);
    if ((nearbyBlock.match(/href="\//g) ?? []).length < 4) {
      fail(`/${route}: nearby or related results lack crawlable links`);
    }
    if (
      !faqSchema?.mainEntity?.length ||
      !faqSchema.mainEntity[0]?.acceptedAnswer?.text?.includes(answerMatch[1])
    ) {
      fail(`/${route}: FAQ schema does not repeat the direct answer`);
    }

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

const crawlDepth = new Map([["", 0]]);
const crawlQueue = [""];
for (let index = 0; index < crawlQueue.length; index += 1) {
  const route = crawlQueue[index];
  const depth = crawlDepth.get(route);
  for (const linkedRoute of internalLinks.get(route) || []) {
    if (!crawlDepth.has(linkedRoute)) {
      crawlDepth.set(linkedRoute, depth + 1);
      crawlQueue.push(linkedRoute);
    }
  }
}
const unreachable = pageIndex.filter((page) => !crawlDepth.has(page.slug));
if (unreachable.length > 0) {
  fail(`${unreachable.length} programmatic pages are unreachable from the homepage`);
}
const maximumCrawlDepth = Math.max(
  ...pageIndex.map((page) => crawlDepth.get(page.slug)),
);
if (maximumCrawlDepth > 6) {
  fail(`maximum homepage crawl depth ${maximumCrawlDepth} exceeds 6 clicks`);
}

const notFoundPath = path.join(appDir, "404.html");
if (!existsSync(notFoundPath)) fail("generated 404.html is missing");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
if (!/<meta name="robots" content="noindex, follow"/.test(notFoundHtml)) {
  fail("404 page must be noindex, follow");
}

const sitemapPath = path.join(appDir, "sitemap.xml");
if (!existsSync(sitemapPath)) fail("generated sitemap.xml is missing");
const sitemap = readFileSync(sitemapPath, "utf8");
const sitemapDocuments = [sitemap];
let sitemapShardCount = 0;
if (sitemap.includes("<sitemapindex")) {
  const shardUrls = captureAll(sitemap, /<loc>(.*?)<\/loc>/g);
  const shardLastModified = captureAll(sitemap, /<lastmod>(.*?)<\/lastmod>/g);
  if (shardUrls.length === 0 || shardUrls.length !== new Set(shardUrls).size) {
    fail("sitemap index is empty or contains duplicate shard URLs");
  }
  if (
    shardLastModified.length !== shardUrls.length ||
    shardLastModified.some((value) => !/^\d{4}-\d{2}-\d{2}$/.test(value))
  ) {
    fail("sitemap index must include a valid lastmod for every shard");
  }
  for (const shardUrl of shardUrls) {
    const shardName = new URL(shardUrl).pathname.replace(/^\//, "");
    if (!/^sitemap-\d+\.xml$/.test(shardName)) {
      fail(`sitemap index contains an invalid shard URL: ${shardUrl}`);
    }
    const shardPath = path.join(appDir, shardName);
    if (!existsSync(shardPath)) fail(`sitemap shard is missing: ${shardName}`);
    const shard = readFileSync(shardPath, "utf8");
    const shardEntries = captureAll(shard, /<loc>(.*?)<\/loc>/g);
    if (shardEntries.length < 1 || shardEntries.length > 1_000) {
      fail(`${shardName} must contain between 1 and 1000 URLs`);
    }
    if (shardName === "sitemap-1.xml" && shardEntries.length !== 1_000) {
      fail("sitemap-1.xml must contain exactly 1000 URLs");
    }
    sitemapDocuments.push(shard);
  }
  sitemapShardCount = shardUrls.length;
}
const sitemapUrls = sitemapDocuments
  .slice(sitemapShardCount > 0 ? 1 : 0)
  .flatMap((document) => captureAll(document, /<loc>(.*?)<\/loc>/g));
const sitemapModifiedDates = new Map(
  sitemapDocuments
    .slice(sitemapShardCount > 0 ? 1 : 0)
    .flatMap((document) =>
      [...document.matchAll(/<url><loc>(.*?)<\/loc><lastmod>(.*?)<\/lastmod><\/url>/g)]
        .map((match) => [match[1], match[2]]),
    ),
);
if (sitemapUrls.length !== new Set(sitemapUrls).size) {
  fail("sitemap contains duplicate URLs");
}
for (const route of routes) {
  if (!sitemapUrls.includes(route.expectedCanonical)) {
    fail(`/${route.route}: generated page is missing from sitemap`);
  }
  if (
    route.programmatic &&
    sitemapModifiedDates.get(route.expectedCanonical) !==
      programmaticModifiedDates.get(route.route)
  ) {
    fail(`/${route.route}: sitemap lastmod does not match JSON-LD dateModified`);
  }
}
for (const document of sitemapDocuments.slice(1)) {
  for (const lastModified of captureAll(document, /<lastmod>(.*?)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}(?:T[^<]+)?$/.test(lastModified)) {
      fail(`sitemap contains invalid lastModified value: ${lastModified}`);
    }
  }
}

console.log(
  [
    `Static HTML SEO check passed: ${checkedRoutes.size} indexable pages`,
    `${pageIndex.length} programmatic HTML files match the route inventory`,
    `${sitemapUrls.length} unique sitemap URLs`,
    ...(sitemapShardCount > 0 ? [`${sitemapShardCount} numeric sitemap shards linked from sitemap.xml`] : []),
    `all programmatic pages are reachable within ${maximumCrawlDepth} clicks from the homepage`,
    "canonical, metadata, H1, six-stage landing flow, formula, and JSON-LD checks passed",
    "all programmatic titles use a question format with one WhatDateTime suffix",
    "duplicate titles: 0; duplicate descriptions: 0; unexpected noindex: 0",
  ].join("\n"),
);
