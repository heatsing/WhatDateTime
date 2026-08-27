# Indexing recovery runbook

## Confirmed baseline

- User-reported Google Search Console indexed count on 2026-08-27: 4.
- Programmatic inventory: 9,994 URLs; total sitemap inventory: 10,000 URLs.
- No verified GSC query/page export is currently stored in the repository.

## Technical remediation

- Every indexable page remains live, indexable, self-canonical, and in the sitemap.
- Every programmatic URL is reachable from the homepage through crawlable HTML links.
- The maximum internal crawl depth is gated at 15 and currently measures 10.
- Sitemap files are grouped by page family so discovery and indexing can be measured separately in Search Console.
- Relative-date static HTML is rebuilt daily to keep the initial answer current.

## Search Console procedure

1. Submit `https://whatdatetime.com/sitemap.xml` once in the Sitemaps report.
2. Use the family sitemap files listed by that index to compare discovered and indexed counts by page type.
3. Inspect the homepage, the five primary calculator pages, and a small representative set of high-intent pages. Do not request indexing for thousands of URLs manually.
4. Export Page Indexing and Search Performance data on 2026-09-10 and 2026-09-24.
5. Record the exclusion reasons separately, especially `Discovered - currently not indexed`, `Crawled - currently not indexed`, duplicate canonical decisions, and soft 404 classifications.
6. Select the next 10-20 page content cohort only from verified impression or crawl evidence.

## Required GitHub secrets

The daily refresh workflow requires repository secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The token must be limited to deploying the `whatdatetime` Worker and its assets.
