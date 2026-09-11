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
const baseline = JSON.parse(
  readFileSync(new URL("../data/seo-url-baseline.json", import.meta.url), "utf8"),
);
const indexingCohort = JSON.parse(
  readFileSync(new URL("../data/editorial-cohort-02.json", import.meta.url), "utf8"),
);
const indexingCohortBySlug = new Map(indexingCohort.map((page) => [page.slug, page]));
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
const trustRoutes = new Set([
  "about",
  "calculation-methodology",
  "data-sources",
  "contact-and-corrections",
  "privacy-policy",
  "terms-of-use",
]);
const routes = [
  ...coreRoutes.map((route) => ({
    route,
    expectedCanonical: route ? `${siteUrl}/${route}` : siteUrl,
    programmatic: false,
    trust: trustRoutes.has(route),
  })),
  ...pageIndex.map((page) => ({
    route: page.slug,
    expectedCanonical: `${siteUrl}/${page.slug}`,
    programmatic: true,
    trust: false,
  })),
];
const knownRoutes = new Set(routes.map((entry) => entry.route));
const sitemapFamilyNames = {
  "days-from-today": /^sitemap-days-from-today\.xml$/,
  "days-ago": /^sitemap-days-ago\.xml$/,
  "hours-from-now": /^sitemap-hours-from-now\.xml$/,
  "hours-ago": /^sitemap-hours-ago\.xml$/,
  "weeks-from-today": /^sitemap-weeks-from-today\.xml$/,
  "months-from-today": /^sitemap-months-from-today\.xml$/,
  "years-from-today": /^sitemap-years-from-today\.xml$/,
  "business-days-from-today": /^sitemap-business-days-from-today\.xml$/,
  "date-difference": /^sitemap-date-differences\.xml$/,
  "timezone-converter": /^sitemap-time-zone-conversions-\d+\.xml$/,
};

function fail(message) {
  throw new Error(`Static HTML SEO check failed: ${message}`);
}

function captureAll(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function escapeHtmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

const titles = new Map();
const descriptions = new Map();
const checkedRoutes = new Set();
const internalLinks = new Map();
const programmaticModifiedDates = new Map();
const programmaticSlugs = new Set(pageIndex.map((page) => page.slug));

for (const routeEntry of routes) {
  const { route, expectedCanonical, programmatic, trust } = routeEntry;
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
  for (const href of captureAll(html, /href="(\/[^"?#]*)"/g)) {
    const linkedRoute = href.replace(/^\//, "").replace(/\/$/, "");
    if (
      linkedRoute &&
      !knownRoutes.has(linkedRoute) &&
      !linkedRoute.startsWith("_astro/") &&
      !existsSync(path.join(appDir, linkedRoute))
    ) {
      fail(`/${route}: internal link points to a missing route: ${href}`);
    }
  }

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
  const h1Text = captureAll(html, /<h1[^>]*>(.*?)<\/h1>/g)[0]?.replace(/<[^>]+>/g, "").trim();
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
  if (
    programmatic &&
    /-(?:day|days|hour|hours)-ago$/.test(route) &&
    (!h1Text?.startsWith("What ") || !h1Text.includes(" Was "))
  ) {
    fail(`/${route}: past-time H1 must use the same Was tense as its title`);
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
  if (programmatic) {
    const islandTags = html.match(/<astro-island[^>]+>/g) ?? [];
    if (islandTags.some((tag) => tag.includes("intro") || tag.includes("useCases") || tag.length > 2_500)) {
      fail(`/${route}: a client island serializes long-form page content`);
    }
    const editorialPage = indexingCohortBySlug.get(route);
    const editorialLead = editorialPage?.content?.sections?.[0]?.text?.slice(0, 48);
    if (editorialLead && !html.includes(escapeHtmlText(editorialLead))) {
      fail(`/${route}: indexed-page cohort content is not visible in static HTML`);
    }
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
        if (programmatic && schema.itemListElement?.length !== 3) {
          fail(`/${route}: programmatic breadcrumb must contain three levels`);
        }
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
  } else if (trust) {
    for (const requiredType of ["WebPage", "BreadcrumbList"]) {
      if (!schemaTypes.has(requiredType)) {
        fail(`/${route}: missing ${requiredType} schema`);
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
    if (!faqSchema?.mainEntity?.length || faqSchema.mainEntity.length < 5) {
      fail(`/${route}: FAQ schema must contain the visible stable FAQs`);
    }
    for (const entity of faqSchema.mainEntity) {
      if (!entity?.name || !entity?.acceptedAnswer?.text || !html.includes(entity.name)) {
        fail(`/${route}: FAQ schema does not match a visible FAQ`);
      }
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

for (const [hub, types] of [
  ["calculators/date-calculator", new Set(["months-from-today"])],
  ["calculators/timezone-converter", new Set(["timezone-converter"])],
]) {
  const hubLinks = new Set(internalLinks.get(hub) ?? []);
  for (const page of pageIndex.filter((entry) =>
    types.has(entry.type) && indexingCohortBySlug.has(entry.slug),
  )) {
    if (!hubLinks.has(page.slug)) {
      fail(`/${hub}: missing direct link to indexed-page cohort URL /${page.slug}`);
    }
  }
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
    if (!/^sitemap-[a-z0-9]+(?:-[a-z0-9]+)*\.xml$/.test(shardName)) {
      fail(`sitemap index contains an invalid shard URL: ${shardUrl}`);
    }
    const shardPath = path.join(appDir, shardName);
    if (!existsSync(shardPath)) fail(`sitemap shard is missing: ${shardName}`);
    const shard = readFileSync(shardPath, "utf8");
    const shardEntries = captureAll(shard, /<loc>(.*?)<\/loc>/g);
    if (shardEntries.length < 1 || shardEntries.length > 1_000) {
      fail(`${shardName} must contain between 1 and 1000 URLs`);
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
const sitemapFileByUrl = new Map();
for (const document of sitemapDocuments.slice(sitemapShardCount > 0 ? 1 : 0)) {
  const file = sitemapDocuments.indexOf(document) > 0
    ? new URL(captureAll(sitemap, /<loc>(.*?)<\/loc>/g)[sitemapDocuments.indexOf(document) - 1]).pathname.split("/").pop()
    : "sitemap.xml";
  for (const url of captureAll(document, /<loc>(.*?)<\/loc>/g)) sitemapFileByUrl.set(url, file);
}
if (sitemapUrls.length !== new Set(sitemapUrls).size) {
  fail("sitemap contains duplicate URLs");
}
if (sitemapUrls.length < baseline.total) {
  fail(`sitemap URL count ${sitemapUrls.length} is below baseline ${baseline.total}`);
}
for (const baselineUrl of baseline.urls) {
  if (!sitemapUrls.includes(baselineUrl)) {
    fail(`baseline URL disappeared from sitemap: ${baselineUrl}`);
  }
}
for (const url of sitemapUrls) {
  if (
    ((!url.startsWith(`${siteUrl}/`) && url !== siteUrl) ||
      url.startsWith("http://") ||
      url.includes("www.") ||
      url.includes("?") ||
      (url !== siteUrl && url.endsWith("/")))
  ) {
    fail(`sitemap contains a non-canonical URL: ${url}`);
  }
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
for (const page of pageIndex) {
  const url = `${siteUrl}/${page.slug}`;
  const sitemapFile = sitemapFileByUrl.get(url);
  if (!sitemapFamilyNames[page.type]?.test(sitemapFile || "")) {
    fail(`/${page.slug}: appears in the wrong semantic sitemap: ${sitemapFile}`);
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
    ...(sitemapShardCount > 0 ? [`${sitemapShardCount} semantic sitemap shards linked from sitemap.xml`] : []),
    `${baseline.total} baseline URLs preserved`,
    `all programmatic pages are reachable within ${maximumCrawlDepth} clicks from the homepage`,
    "canonical, metadata, H1, six-stage landing flow, formula, and JSON-LD checks passed",
    "all programmatic titles use a question format with one WhatDateTime suffix",
    "duplicate titles: 0; duplicate descriptions: 0; unexpected noindex: 0",
  ].join("\n"),
);
