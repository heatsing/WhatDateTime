# SEO Operating Rules

- The official public brand is `WhatDateTime` and the canonical production origin is `https://whatdatetime.com`.
- Preserve every existing indexable URL. Do not delete, redirect, noindex, or remove a URL from the sitemap without explicit approval.
- Keep `data/tools/index.json` as the route inventory and shared source for static params, metadata, page output, schema, sitemap, and internal links.
- Every indexable page must ship complete static HTML with a unique title, description, H1, direct answer, canonical, and matching JSON-LD.
- Keep all programmatic URLs reachable from the homepage within six crawlable HTML links.
- Error documents must return the correct HTTP status and use `noindex, follow`; they must never enter the sitemap.
- Canonicals must be absolute and self-referencing. Metadata, visible content, schema, and sitemap URLs must agree.
- Run `npm run seo:check` and `npm run build` before production deployment.
- Sitemap `lastmod` and JSON-LD `dateModified` must use stable material revision dates, never an ordinary build timestamp.
- Improve long-form content in measured cohorts of 10–20 URLs, prioritizing verified GSC demand.
- Apply the complete landing-page framework sitewide; reserve cohort limits for bespoke editorial rewrites, not required structural coverage.
- Do not change the established UI while performing technical SEO maintenance.

## Authorized eligibility refactor — 2026-09-26

The latest user brief explicitly supersedes the all-index, all-sitemap and
all-SSG requirements above. Keep every existing URL functional, HTTP 200 and
self-canonical, but use the shared eligibility engine for index/noindex and
sitemap membership. Protect evidence-backed URLs, use transparent editorial
priorities (not invented search volume), and target approximately 1,000–2,500
indexable URLs initially. Only eligible URLs require crawl-depth coverage.
City/region hubs and functional time-zone modules are authorized additions;
retain the existing visual system. No bulk filler or URL deletion is authorized.
