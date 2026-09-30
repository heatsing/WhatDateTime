# Roadmap

## Current

- Maintain 9,994 programmatic pages and all existing calculator routes.
- Preserve access to the original 10,007 baseline URLs plus six trust pages. Since the explicit 2026-09-26 brief, indexing and sitemap inclusion follow `data/index-policy.json`, not raw inventory size.
- Maintain the focused date utility set: days until, day of week, days in month, weeks in year, calendar generator, half birthday, and weeks-and-days ago.
- Use functional modules instead of mandatory long-form prose for city pairs: instant answer, live clocks, selected-date 24-hour table, DST periods and office-hours overlap. Retain existing relative-date content on eligible pages.
- Prerender eligible pages; render known noindex routes on demand. Keep absolute self-canonicals and readable server HTML in both modes.
- Monitor production hydration, Worker errors, and indexing signals.
- Keep every eligible URL reachable through crawlable HTML links. Build bounded city/region/calculation directories instead of large footer link lists. The current measured maximum depth is 6.
- Keep real 404 responses out of the index and validate language alternates, homepage entity schema, calculator schema, and sitemap-index modification dates during every build.
- Verify builds daily without deploying them. Cloudflare serves matching assets before invoking the known-route fallback. Intentional releases may refresh the static snapshot; visible snapshot labels distinguish it from browser live clocks.
- Keep sitemap `lastmod` and page JSON-LD `dateModified` synchronized with stable, material content revision dates; ordinary date-answer rebuilds must not advance them.

## Next

- Import verified GSC query/page data.
- Protect any additional URLs with verified impressions, clicks or ranking before the first eligibility deployment. Current protections only cover evidence supplied by the owner; no complete GSC export exists locally.
- Review a 10–20-page cohort after real crawl/indexing data; change eligibility only with recorded evidence. Never promise that fewer indexable pages guarantees Google inclusion.
- Plan a separately tested framework/dependency security upgrade; the existing Astro 5 dependency tree has npm audit advisories that this SEO refactor does not resolve.
- Improve visible content in cohorts of 10–20 pages selected from real impressions.
- Measure the expanded time-zone cohort and the seven focused date utilities before proposing further route growth.
- Expand only when new page families pass the page-creation gates.

## Future

- Holiday countdowns
- Retirement and work-hours calculators
- Pregnancy due-date tools
- Holiday calendars and event countdowns, subject to the page-creation gates
