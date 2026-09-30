# SEO Page Matrix

| Page family | Existing URLs |
|---|---:|
| Days from today | 365 |
| Days ago | 365 |
| Hours from now | 500 |
| Hours ago | 500 |
| Weeks from today | 200 |
| Months from today | 300 |
| Years from today | 300 |
| Business days | 1,000 |
| Date difference | 500 |
| Time-zone conversion | 5,964 |
| **Programmatic total** | **9,994** |
| Primary calculators | 5 |
| Focused date utilities | 7 |
| Homepage | 1 |

Before the 2026-09-26 eligibility refactor, the homepage, calculators and programmatic
pages comprised 10,007 URLs; six trust pages brought the live inventory to 10,013. The focused
date utilities cover days until a date, weekday lookup, days in a month, weeks
in a year, monthly calendars, half birthdays, and combined weeks-and-days-ago.

The inventory in `data/tools/index.json` is authoritative. This document is a review summary, not a second route source.

## Current eligibility policy (2026-09-26)

All 9,994 original programmatic routes remain accessible. Of these, 1,968 are
eligible for index/SSG and 8,026 use on-demand HTML with `noindex, follow`.
The city-pair subset has 5,964 accessible URLs, of which 1,561 are eligible.
There are 82 new city hubs plus 167 region/paginated directory pages. Along with
19 core/trust pages, totals are 10,262 accessible and 2,236 indexable URLs.

`lib/siteInventory.ts` defines new hub/directory routes. `lib/indexEligibility.ts`
is the only eligibility authority. Generated counts and per-URL reasons live in
`SEO_INDEX_REPORT.md` and `reports/index-eligibility.json`. City priorities are
editorial judgments, not population estimates or fabricated search volumes.
