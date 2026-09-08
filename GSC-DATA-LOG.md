# GSC Data Log

No verified Google Search Console export is stored in this repository yet.

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
