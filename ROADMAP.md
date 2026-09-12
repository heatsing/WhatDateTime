# Roadmap

## Current

- Maintain 9,994 programmatic pages and all existing calculator routes.
- Preserve the original 10,007 indexable URLs and organize them in semantic sitemap shards capped at 1,000 URLs each; trust pages may increase the total without changing the baseline inventory.
- Maintain the focused date utility set: days until, day of week, days in month, weeks in year, calendar generator, half birthday, and weeks-and-days ago.
- Require every programmatic page to ship the full answer, calculation basis, usage, scenarios, nearby results, and FAQ flow.
- Preserve permanent static generation, canonical consistency, structured data, sitemap coverage, and crawlable internal links.
- Monitor production hydration, Worker errors, and indexing signals.
- Keep every programmatic URL reachable through crawlable HTML links; the current technical gate enforces a maximum depth of 6 from the homepage.
- Keep real 404 responses out of the index and validate language alternates, homepage entity schema, calculator schema, and sitemap-index modification dates during every build.
- Verify the static export daily without deploying it. Normal page and asset requests use Cloudflare's asset-first path; intentional production releases refresh the static answer snapshot while browser hydration immediately calibrates answers to each visitor's current local date and time.
- Keep sitemap `lastmod` and page JSON-LD `dateModified` synchronized with stable, material content revision dates; ordinary date-answer rebuilds must not advance them.

## Next

- Import verified GSC query/page data.
- Improve visible content in cohorts of 10–20 pages selected from real impressions.
- Measure the expanded time-zone cohort and the seven focused date utilities before proposing further route growth.
- Expand only when new page families pass the page-creation gates.

## Future

- Holiday countdowns
- Retirement and work-hours calculators
- Pregnancy due-date tools
- Holiday calendars and event countdowns, subject to the page-creation gates
