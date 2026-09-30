# Technical SEO audit — 2026-09-26

## Verified baseline

- The repository is **Astro 5.18.x**, React 18 and Tailwind, not Next.js. There is no active App/Pages Router, `generateMetadata` or `generateStaticParams`; their equivalents are Astro layouts and `getStaticPaths()`.
- `data/tools/index.json` contains 9,994 programmatic routes: 5,964 city pairs and 4,030 date/time calculations. With 19 core/trust routes there are 10,013 indexable URLs, 16 sitemap shards, and a separate 404.
- Existing metadata descriptions were repaired in commit `5cb7bc9`. They must not be replaced by city-name-only boilerplate.
- No verified GSC export, clicks, impressions or query/page mapping exists. Owner-reported indexed pages and the screenshot examples are evidence, not search-volume measurements. Unknown ranking pages cannot be identified from code alone.
- All existing routes currently use SSG. An asset-only Cloudflare service serves them; a separate Worker redirects www. Ordinary builds keep a stable date snapshot and do not deploy automatically.

## Findings and implementation decisions

| Priority | Finding / impact | Files | Repair |
| --- | --- | --- | --- |
| P0 | All 10,013 URLs are forced indexable, irrespective of search intent; the audit equates model-generated content scores with index eligibility. | `src/pages/[slug].astro`, `scripts/seo-audit.mjs`, `scripts/seo-check.mjs` | One typed eligibility engine, explicit editorial priorities, protected evidence URLs, reasons and reports. Target 1,000–2,500 eligible URLs, not a fabricated traffic threshold. |
| P0 | All programmatic URLs are required in the sitemap; noindex is treated as a build error. | `scripts/generate-sitemap-shards.mjs`, `scripts/seo-check.mjs` | Filter by the same eligibility decisions; forbid noindex entries; preserve availability separately from indexability. |
| P1 | City pairs were made by nested loops truncated at 5,964. Alphabetical/input order, not pair relevance, determines inclusion. | `scripts/generate-seo-data.mjs`, `data/timezone.json` | Preserve the exact existing pair inventory; classify it using city priorities and protected/curated exceptions. Do not generate additional pairs. |
| P1 | There is no canonical city catalog, region hierarchy or city hub. | `scripts/generate-seo-data.mjs`, `lib/calculator.ts`, `components/header.tsx` | Typed city data with real IANA zones and explicitly editorial priority; region directory → city hubs → eligible pair directories. Preserve existing calculator URLs and aliases. |
| P1 | Pair pages show only five nearby hours; no full-day table, transition-aware planner or working-hours overlap. | `components/timezone-comparison.tsx`, `src/components/ProgrammaticPageView.astro` | Shared calculation engine and useful rendered modules: 24-hour table, valid/ambiguous/missing wall times, seasonal differences, overlap, and selected-date conversion. No bulk prose expansion. |
| P1 | Local wall-time subtraction via `toZonedTime` can depend on the visitor's own zone near DST; ambiguous/nonexistent input times are not explicitly handled. | `components/timezone-comparison.tsx`, `components/CalculatorBox.tsx` | Compare UTC offsets at the same instant. Validate wall-clock candidates by round-trip and expose gaps/repeats. Test cross-zone DST and fractional offsets. |
| P1 | Every pair requires a full HTML build and upload. A previous metadata deployment changed approximately 10,000 assets. | `src/pages/[slug].astro`, `wrangler.jsonc` | Prerender eligible pages; serve known lower-priority URLs on demand with complete HTML and noindex. Static assets remain asset-first; never enable blanket Worker-first routing. Document the runtime-request trade-off. |
| P1 | A stable reference date can look like a live current answer before hydration. | `lib/build-time.ts`, live components | Explicit snapshot/as-of labels in new modules; immediate client calibration, focus/visibility refresh. On-demand responses use request time. Do not fake daily lastmod or reintroduce daily deployments. |
| P2 | Internal links prioritize coverage and crawl depth across all 9,994 pages, not eligible useful pages. | `components/calculator-directory.tsx`, `lib/seoGenerator.ts`, homepage | Filter prominent links; add city/region hubs and bounded relevant lists. Verify all eligible routes are reachable, not all noindex routes. |
| P2 | Existing canonical, OG, Twitter, FAQ and WebApplication consistency gates are useful; do not discard them during eligibility changes. | `src/layouts/BaseLayout.astro`, `lib/schema.ts`, `scripts/seo-check.mjs` | Extend gates to SSG and on-demand responses; visible FAQ only; no ratings or reviews. |

## Routing / crawl controls

- Existing canonicals use HTTPS, non-www, no trailing slash and no query string.
- `public/_redirects` contains five historical calculator aliases (308). Keep them; do not rename existing calculator routes to match examples in the brief.
- `public/robots.txt` permits crawling and points to `/sitemap.xml`. Keep noindex pages crawlable so Google can read the directive.
- Unknown routes must remain actual HTTP 404, not a generic 200 converter. Known noindex routes must remain 200 and self-canonical.
- HTTP/www/slash behavior must be smoke-tested against the delivery layer. Code alone cannot establish Cloudflare zone-level HTTPS settings or GSC indexing state.

## Explicit policy change

The 2026-09-26 user attachment authorizes index/noindex classification, removing
noindex URLs from sitemaps, new city hubs, and selective prerendering. It
supersedes older rules requiring every existing URL to remain indexable and
statically exported. **URL deletion, arbitrary redirects and loss of working
tools remain prohibited.** Existing indexed evidence pages are protected. New
priorities are modeled editorial choices and must be reviewed using real GSC
data after release.

## References

- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/

## Execution

1. Add city catalog, protected evidence and typed eligibility engine.
2. Add shared time-zone facts and tested city/pair modules.
3. Connect hubs, controlled internal links, robots and sitemap eligibility.
4. Selective SSG plus on-demand known-route fallback; preserve all URLs.
5. Run data, HTML, routing, calculation and browser gates; write index and final reports.
