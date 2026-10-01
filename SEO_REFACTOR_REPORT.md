# WhatDateTime SEO architecture refactor — 2026-09-26

## Scope and authorization

Implemented the latest attached request in the actual **Astro 5 + React** project,
not a replacement Next.js project. The attachment explicitly supersedes the old
all-index/all-sitemap/all-SSG policy. No original content URL or calculator was
deleted. Final local browser acceptance was completed on 2026-09-30. Following
the owner's explicit push-and-deploy request, `seo/index-eligibility-hubs` was
fast-forwarded into `main` and commit `80c2594` was deployed on 2026-09-30.
See `reports/production-release-2026-09-30.md` for production versions, checks
and the 2026-10-01 live-clock follow-up. Initial source-only delivery is complete;
the release described in that report is now live.

## Before / after

| Metric | Before | After |
|---|---:|---:|
| Accessible content URLs | 10,013 | 10,262 |
| Indexable URLs | 10,013 | 2,236 |
| Noindex, follow URLs | 0 | 8,026 |
| Original programmatic URLs | 9,994 | 9,994 |
| City-pair URLs | 5,964 | 5,964 |
| Indexable city pairs | 5,964 | 1,561 |
| City hubs | 0 | 82 |
| Region / paginated directory pages | 0 | 167 |
| Core / trust pages | 19 | 19 |
| Sitemap URLs | 10,013 | 2,236 |
| Sitemap shards | 16 | 13 |

Astro emits 2,238 HTML routes during the build: 2,236 indexable content pages,
one genuine 404, and one build-only rendering shell. The shell is moved out of
public assets after compilation; `/render-shell` returns 404. Noindex tools are
not individually emitted as HTML files.

## Architecture changes

- `data/tools/index.json` remains the original route inventory. Existing full
  content JSON is retained; original titles, descriptions and H1s are preserved.
- `data/cities.json` projects the 82 existing cities into a typed catalog with
  country/region, IANA zone and seasonal-rule classification. No city-pair
  Cartesian product or number-answer expansion was added.
- `data/index-policy.json` holds explicit editorial priorities, protected
  evidence URLs, retained editorial cohorts and relative-date ranges.
- `lib/indexEligibility.ts` is the sole eligibility engine. Its output drives
  prerendering, robots, sitemap filtering, prominent links and SSR membership.
  Priorities are editorial choices, **not measured popularity or search volume**.
- `lib/siteInventory.ts` defines core routes, city/region hubs, bounded conversion
  directories and calculation directories. All eligible pages are reachable
  from the homepage; measured maximum depth is six links.
- `workers/on-demand.tsx` renders only known non-prerendered URLs with complete
  HTML, self-canonical and noindex. Unknown URLs return the genuine 404 resource.
  The fallback uses the same React calculators and time-zone engine as SSG.
- Cloudflare remains **assets-first**, not blanket Worker-first. Existing static
  pages, JS and CSS bypass the fallback Worker. Known low-priority requests and
  unmatched routes can invoke it; this is not a promise of zero Worker charges.
- `assets_navigation_has_no_effect` is essential: otherwise Cloudflare can serve
  the custom 404 before the Worker on browser navigation. Tests now exercise raw
  `Sec-Fetch-Mode: navigate`, because Node fetch overwrites that header with cors.
- A generated Astro shell supplies the existing header/footer/styles and client
  bundles. Canonical replacement is narrowly scoped and cannot rewrite script
  filenames. Initial relative results are serialized for hydration consistency,
  then recalculated in the visitor's zone after mounting.
- Build-time IANA transition memoization avoids cold-request year scans. Live
  offsets and conversions are still calculated for the actual instant. The
  cache records its IANA database version and is regenerated during builds.
- Static React streaming produced stray NUL bytes at multibyte text boundaries
  during validation. Astro now uses its supported non-streaming React option;
  the gate rejects corrupted Unicode and compares visible FAQ answers to JSON-LD.

## Useful page content, not bulk articles

City hubs show local clock/date/weekday, IANA zone, UTC offset, seasonal status,
standard/daylight offsets where the terminology is reliable, next known change,
three comparison clocks, working-hours conversions and factual FAQs.

City-pair pages provide a source-date 9 AM answer, current clocks and difference,
a selected-date meeting planner, all 24 source hours, previous/same/next-day
labels, office-hours overlap and a yearly UTC transition table. New York–London
correctly includes the weeks with a four-hour gap between their different clock
change dates. Repeated local times display both occurrences; skipped times are
rejected instead of silently shifted. Monday–Friday, 9–17 overlap excludes
weekends but does **not** model public holidays or personal availability.

Related conversion lists are bounded to 8–10 links; directories use 30 entries
per page. The homepage and navigation now lead to World Clock → region → city →
conversion directory/pair. No thousand-link footer was introduced. Global CSS,
colors and typography were not redesigned; new functional modules reuse the
existing visual system. Existing eligible relative-date long-form content is
unchanged. Low-priority tools retain direct answers, formulas, working inputs,
FAQ and core links without requiring the old long prose blocks.

## Canonical, metadata, sitemap and schema

- HTTPS/non-www, self-canonical, no query and no trailing slash for both modes.
- Existing five calculator aliases remain 308; the fallback also handles their
  trailing-slash forms. The isolated www redirect Worker is unchanged.
- Page-specific factual descriptions from the previous repair are retained;
  the audit compares original metadata with the generated output.
- Sitemap includes exactly the eligible set in 13 semantic shards, each at most
  1,000 URLs. No noindex URL is included; obsolete low-priority shards are no
  longer listed. `/sitemap.xml` remains the submission entry point.
- Material revision dates remain stable. Pair/hub improvements use 2026-09-26;
  ordinary clock refreshes do not fabricate a new daily `lastmod`.
- FAQ JSON-LD is calculated from and checked against the visible FAQ. Matching
  WebApplication/CollectionPage and breadcrumbs are rendered in initial HTML.
  No ratings, reviews or invented usage statistics were added.
- Robots continues allowing crawling so Google can read noindex directives.

## Verification and evidence

Automated gates cover all 10,262 metadata records, all 2,236 static HTML pages,
20 actual on-demand HTML render samples, protected URLs, all IANA zones,
canonical/OG/Twitter consistency, FAQ visibility, 24-row conversion tables,
script asset existence, sitemap set equality, and the eligible link graph.

Calculation fixtures cover leap days, business days, NY/London mismatched DST
weeks, spring gaps, autumn repeated times, Lord Howe's half-hour transitions,
Kathmandu's quarter-hour offset, cross-date conversions and weekend/no-overlap
office windows. `reports/http-smoke.json` records 28 public HTTP samples including
10 eligible and 10 noindex pairs, four genuine 404s, query canonical checks,
the historical converter alias, slash normalization and HEAD requests.

Commands: `npm install`, `npm run lint`, `npm run typecheck` (Astro and tsc),
`npm run test`, `npm run build`, `npm run seo:check`, `npm run seo:audit`,
`npm run test:ssr` against local Wrangler, and `wrangler deploy --dry-run`.
See generated `reports/seo-audit.json` / `.md` and `SEO_INDEX_REPORT.md` for
machine-checked results. Browser QA uses agent-browser, not just source inspection.
The final lint/typecheck, unit tests, SEO gates and HTTP smoke run passed. The
completed full build passed with 2,238 emitted Astro routes before shell removal.
Final Worker dry-run packaging was 7,142.58 KiB raw / 422.01 KiB gzip; dry-run is
not a production deployment or a measurement of production CPU usage.
See `reports/browser-qa.md` for the final desktop/mobile interaction evidence.

## Known limitations and next GSC review

1. No verified GSC query/page export exists locally. Seven owner-reported or
   screenshot-evidenced URLs are explicitly protected, with the previous
   editorial cohort retained. Unknown ranking/traffic pages cannot be identified
   from code. Import an actual export before the first production eligibility
   release if additional successful URLs must be protected.
2. Index eligibility is a controlled editorial first phase, not proof of demand
   or a guarantee that Google will index or rank these pages. Google must recrawl
   URLs before noindex/sitemap changes are reflected.
3. Static HTML is an explicitly labelled build snapshot. Browser clocks refresh
   immediately and on focus/visibility; on-demand HTML uses request time. IANA
   rule accuracy depends on runtime/cache data and future legislation. Device
   clocks are not an independently synchronized atomic-time service.
4. Local tests alone do not verify production delivery. The release report now
   records successful production HTTPS/redirect checks, selected browser flows,
   exact sitemap file comparisons and filtered Worker traces. These are bounded
   observations, not a load test, a global DNS audit or a guarantee about account
   CPU/request quotas. Regular GitHub schedules still only verify; they do not
   deploy all pages daily.
5. `npm install` reports nine dependency advisories (one critical, six high, two
   low) in the existing dependency tree. Some fixes require a major Astro upgrade.
   This refactor does not claim to resolve them or run `npm audit fix --force`.
   Production uses generated assets and a custom renderer, not Astro's image
   optimization/server-island endpoints, but a separate security upgrade remains
   necessary.
6. Follow up in GSC by cohort: eligible city hubs, eligible pairs, protected URLs,
   and noindex retained tools. Inspect chosen canonical, last crawl, page-indexing
   status, impressions and clicks. Promote only evidence-backed URLs in small
   cohorts by editing policy data; rebuild and rerun all gates. Do not mass-submit
   noindex URLs or repeatedly deploy merely to change dates.

## Maintenance / release procedure

Edit city/policy data → `npm run test` → `npm run build` → `npm run seo:audit`.
For local full-site testing, use `npx wrangler dev --local --port 8790` and
`npm run test:ssr`; Astro preview alone cannot serve on-demand routes.
Run lint/typecheck and browser checks before an intentional `npm run deploy`.
Do not deploy a stale `dist`: the generated shell and its hashed client scripts
must belong to the same build. Rollback means reverting the policy/code release
and rebuilding, not deleting retained URLs or canonicalizing them to a hub.

## Files changed

Data and engines: `data/cities.json`, `data/index-policy.json`,
`data/timezone-transitions.json`, `lib/indexEligibility.ts`, `lib/siteInventory.ts`,
`lib/timezoneFacts.ts`, `lib/seoGenerator.ts`, `lib/build-time.ts`.

Routes/components: `src/pages/[slug].astro`, `src/pages/time/[...path].astro`,
`src/pages/calculations/[...path].astro`, `src/pages/calculators/[tool].astro`,
`src/pages/render-shell.astro`, `components/timezone-experience.tsx`,
`components/on-demand-page.tsx`, `components/calculator-directory.tsx`,
`components/header.tsx`, `components/home-page.tsx`.

Delivery/build/testing: `workers/on-demand.tsx`, `workers/assets.d.ts`,
`workers/tsconfig.json`, `wrangler.jsonc`, `astro.config.mjs`, `tsconfig.json`, `package.json`,
`package-lock.json`, `.gitignore`, `.github/workflows/daily-static-refresh.yml`,
`scripts/generate-city-catalog.mjs`, `scripts/generate-timezone-transitions.mjs`,
`scripts/prepare-on-demand.mjs`, `scripts/generate-sitemap-shards.mjs`,
`scripts/seo-audit.mjs`, `scripts/seo-check.mjs`, `scripts/ssr-smoke-tests.mjs`,
`scripts/timezone-policy-tests.mjs`. Old assumptions are preserved for historical
reference in `scripts/legacy-content-audit.mjs` and
`scripts/legacy-static-seo-check.mjs`, not used as acceptance gates.

Operating documents/reports: `SEO-OPERATING-RULES.md`,
`NO-PAGE-DELETION-POLICY.md`, `CODEX-DAILY-WORKFLOW.md`, `ROADMAP.md`,
`SEO-PAGE-MATRIX.md`, `PAGE-CREATION-GATES.md`, `SEO_AUDIT.md`,
`SEO_INDEX_REPORT.md`, `SEO_REFACTOR_REPORT.md`, `reports/seo-audit.json`,
`reports/seo-audit.md`, `reports/index-eligibility.json`,
`reports/http-smoke.json`, `reports/browser-qa.md`. Generated Worker artifacts and local screenshots are
not source-controlled. Unchanged GSC evidence documents were not falsified.

## Primary references

- [Google: noindex must be crawlable](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: sitemap construction](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Cloudflare: asset-first Worker routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
- [Cloudflare: navigation compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#navigation-requests-prefer-asset-serving)
