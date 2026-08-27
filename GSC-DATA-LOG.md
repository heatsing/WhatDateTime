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
