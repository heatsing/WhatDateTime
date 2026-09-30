// Run against `wrangler dev --local --port 8790` (not astro preview, which cannot SSR).
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { getPageIndexEligibility } from "../lib/indexEligibility.ts";
const origin = process.env.SEO_TEST_ORIGIN || "http://127.0.0.1:8790";
const index = JSON.parse(fs.readFileSync("data/tools/index.json", "utf8"));
const select = (list) =>
  Array.from({ length: 10 }, (_, i) => list[(i * 431 + 73) % list.length]);
const samples = [
  ...select(
    index.filter(
      (p) => p.kind === "timezone" && getPageIndexEligibility(p).indexable,
    ),
  ),
  ...select(
    index.filter(
      (p) => p.kind === "timezone" && !getPageIndexEligibility(p).indexable,
    ),
  ),
];
const routes = [
  "",
  "time/new-york",
  "time/london",
  "new-york-to-london-time",
  "los-angeles-to-new-york-time",
  "london-to-tokyo-time",
  "499-hours-ago",
  "days-between-january-1-2026-and-january-2-2026",
  ...samples.map((p) => p.slug),
];
const evidence = [];
// Node fetch overwrites Sec-Fetch-Mode with "cors". Use raw HTTP for real navigation tests.
const navigate = (url) =>
  new Promise((resolve, reject) => {
    const transport = url.startsWith("https:") ? https : http;
    transport
      .get(
        url,
        {
          headers: {
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Dest": "document",
            Accept: "text/html",
          },
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () =>
            resolve({
              status: response.statusCode,
              text: async () => Buffer.concat(chunks).toString("utf8"),
            }),
          );
          response.on("error", reject);
        },
      )
      .on("error", reject);
  });
for (const slug of routes) {
  const response = await navigate(`${origin}/${slug}`);
  assert.equal(response.status, 200, slug);
  const html = await response.text();
  const record = index.find((p) => p.slug === slug),
    shouldIndex = !record || getPageIndexEligibility(record).indexable;
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  assert.equal(
    canonical,
    `https://whatdatetime.com${slug ? "/" + slug : ""}`,
    slug,
  );
  assert.equal(robots.includes("noindex"), !shouldIndex, slug);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, slug);
  assert(html.includes("<title>") && html.includes('name="description"'), slug);
  const schemas = [
    ...html.matchAll(/type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => JSON.parse(m[1]));
  assert(schemas.length > 0, slug);
  if (record?.kind === "timezone")
    assert(
      html.includes("data-conversion-table") &&
        html.includes("Working-hours overlap") &&
        html.includes(record.slug.split("-to-")[0]),
    );
  const query = await fetch(`${origin}/${slug}?utm_source=seo-test`);
  assert.equal(query.status, 200, `${slug} query`);
  assert(
    (await query.text()).includes(`rel="canonical" href="${canonical}"`),
    `${slug} query canonical`,
  );
  evidence.push({
    path: `/${slug}`,
    status: response.status,
    robots,
    canonical,
    mode: shouldIndex ? "static" : "on-demand",
  });
}
for (const pathname of [
  "/missing-city-to-invented-city-time",
  "/time/missing-city",
  "/render-shell",
  "/this-route-does-not-exist",
]) {
  const response = await navigate(origin + pathname);
  assert.equal(response.status, 404, pathname);
}
const alias = await fetch(origin + "/time-zone-converter/", {
  redirect: "follow",
});
assert.equal(alias.status, 200);
assert(alias.url.endsWith("/calculators/timezone-converter"));
const slash = await fetch(origin + "/499-hours-ago/", { redirect: "manual" });
assert([301, 308].includes(slash.status));
assert(
  new URL(slash.headers.get("location"), origin).pathname === "/499-hours-ago",
);
const head = await fetch(origin + "/499-hours-ago", { method: "HEAD" });
assert.equal(head.status, 200);
assert.equal(await head.text(), "");
fs.writeFileSync(
  "reports/http-smoke.json",
  JSON.stringify(
    {
      origin,
      checkedAt: new Date().toISOString(),
      samples: evidence,
      unknownRoutes: 404,
      converterAlias: "preserved",
      trailingSlash: "normalized",
      head: "passed",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `HTTP smoke passed: ${routes.length} public pages, including 10 eligible and 10 noindex city pairs, 4 genuine 404s, query canonicals, converter alias and HEAD.`,
);
