# GSC Data Log

No verified Google Search Console export is stored in this repository yet.

## 2026-11-13 owner-supplied performance summary and repair

- Supplied window: 2026-08-11 through 2026-11-10; 316 clicks and 253,726 impressions. 96.45% of impressions occurred on August 12–16. The last 28 days had 65 impressions and zero clicks. These are owner-provided figures, not an independently imported GSC export.
- The supplied page table reports 2 clicks and 155 impressions for `/35-business-days-from-today`. The September 26 eligibility policy limited the family to 1–30 plus selected exceptions, so 35 was accessible with noindex but absent from sitemap. After checking its weekday calculation and purpose, this one URL is protected and restored to indexing/sitemap. No other legacy page is removed or newly noindexed.
- The fixed September 26 reference comes from `lib/build-time.ts`, intentionally introduced for byte-stable asset delivery. This pass labels it as an explicit UTC example, shares browser live/custom state, and does not reinstate daily full-site deployment.
- Repository history is not deployment/CDN history. No causal attribution is made between stale snapshots, the eligibility policy, or the exposure decline. Need original query/page/day exports, Page Indexing reasons, URL Inspection rendered HTML/last crawl, and production release/cache/WAF logs.
- Keep the current sitemap family split. Compare affected cohorts only after an intentional deployment and new crawl evidence; do not promise rankings or infer a penalty from low clicks.

Implementation and verification: `reports/recovery-2026-11-13.md`.

## 2026-08-27 indexing baseline

- The site owner reported that the Page Indexing report shows 4 indexed pages.
- No Search Console export or query/page report was available in the repository, so this is recorded as a user-reported baseline rather than a verified API/export measurement.
- Technical review found 500 programmatic date-difference URLs unreachable from the homepage and a maximum internal crawl depth of 195 clicks.
- Remediation reduced the maximum crawl depth to 10 clicks, connected every existing URL to the homepage crawl graph, grouped sitemap URLs by page family, and refreshed static date-dependent HTML.
- Recheck the Page Indexing report and sitemap-family discovery counts on 2026-09-10 and 2026-09-24. Import the exported data before selecting a bespoke content cohort.

Record future imports with:

- Export date and comparison window
- Property and search type
- Query, page, clicks, impressions, CTR, and average position
- Cohort decisions made from the data
- Post-change measurement date

## 2026-09-08 public discovery spot-check

- A public Google search returned multiple WhatDateTime programmatic results, including hour-offset URLs crawled within the previous three days.
- This confirms that discovery and indexing have expanded beyond the four-page owner-reported baseline, but `site:` results are not a replacement for a verified Search Console export and no total indexed count is inferred from them.
- Production checks returned HTTP 200 to Googlebot for robots.txt, the sitemap index, the first sitemap shard, representative date pages, and a representative time-zone page.
- The daily workflow still cannot deploy because the repository secret `CLOUDFLARE_API_TOKEN` is missing. Static builds and SEO gates succeed; deployment freshness remains dependent on restoring that secret.

## 2026-09-11 indexed-page evidence cohort

- The site owner reported indexing for `/194-months-from-today`, `/new-york-to-rome-time`, and `/washington-dc-to-denver-time`. This is owner-reported indexing evidence because a Search Console export is still not stored in the repository.
- A public search spot-check also surfaced additional WhatDateTime pages, including nearby month calculations and reverse or related city conversions. The evidence therefore indicates expanding discovery rather than an index limited to exactly three URLs.
- The three reported pages seed a 15-page editorial cohort: nine nearby 190–198 month calculations and six bidirectional New York–Rome, Washington DC–Denver, and Washington DC–Phoenix conversions.
- Metadata and URLs remain unchanged. The cohort receives visible bespoke calculation guidance, direct hub links, reciprocal or nearby links, and page-specific stable revision dates.
- Recheck impressions, indexed counts, and query-to-page matches after deployment; do not infer ranking improvement without a Search Console comparison window.

## 2026-09-12 Cloudflare delivery architecture

- Production was exhausting the Workers free-tier request allowance because `assets.run_worker_first` sent every matching HTML, JavaScript, CSS, sitemap, robots, and verification-file request through the Worker before static asset delivery.
- The canonical site now uses asset-only delivery, so matching files and static 404 responses bypass Worker invocation billing. The `www` hostname is isolated behind a minimal redirect Worker.
- The scheduled GitHub workflow now performs build and SEO verification only. Cloudflare deployment occurs only on a manual workflow dispatch, preventing missing deployment secrets or an unnecessary daily 10,000-file upload from failing the scheduled check.
- Ordinary builds use a deterministic reference timestamp so repeated verification output is byte-stable. Manual releases keep that snapshot by default, and the optional `refresh_dates` input explicitly requests a full static date refresh; client hydration continues to calibrate displayed answers to the visitor's live local clock.
