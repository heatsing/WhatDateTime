# Page-specific descriptions

Material revision: 2026-09-19. Scope: the existing 9,994 programmatic URLs.

## Why this changed

The old descriptions differed by a number or city name but repeated the same
generic promises. An exact-duplicate check alone could not detect that problem.
Descriptions now lead with facts derived from the page's actual inputs rather
than rotating synonyms or assigning arbitrary use cases to numbers.

Google recommends human-readable, page-specific data for programmatically
generated descriptions. It can still select a different snippet from the page
for a particular query. There is no fixed Google description character limit.
The 80–190 character bounds in this project are editorial checks, not ranking
requirements. Short date intervals do not receive filler to meet an arbitrary
150-character target.

Reference: https://developers.google.com/search/docs/appearance/snippet

## Information selected by family

| Page family | Useful distinguishing facts |
| --- | --- |
| Hours ago / from now | Minutes for short intervals; full 24-hour days and remaining hours for longer intervals; earlier/later direction |
| Days ago / from today | Yesterday/tomorrow, weeks and remaining days, or same-weekday full weeks; calendar days include weekends |
| Weeks from today | Exact calendar-day equivalent and the same-weekday relationship |
| Months from today | Calendar-month semantics, years/months decomposition, destination month-end clamping |
| Years from today | Calendar-month equivalent and leap-day handling |
| Business days | Five-day workweeks plus remaining weekdays; weekends skipped, holidays not excluded |
| Date differences | Both fixed endpoint dates, actual day gap, weeks/remainder when useful, inclusive count |
| City-to-city time | A 9 AM example for the named cities in an explicit reference year, all observed destination times, previous/next-day labels |

City examples sample 9 AM on **every source-city date in 2026**. Sampling only
January and July misses some mismatched clock-change weeks and Morocco's Ramadan
offset. The calculation uses IANA zones through `date-fns-tz` and `Intl`, not
fixed city-offset constants. Claims about an unchanged offset are scoped to that
9 AM example, not to every instant during transition nights.

The reference year is intentional and stable. It is not the system clock and
does not trigger daily mass asset updates. A future reference-year change must
be reviewed, tested, regenerated and released intentionally; live calculator
answers continue to use the selected date and time.

## Examples

- `/150-hours-ago`: 150 hours ago is 6 days and 6 hours earlier, with each day measured as 24 hours. Find the local date and time, including clock changes.
- `/49-hours-ago`: 49 hours ago is 2 days and 1 hour earlier, with each day measured as 24 hours. Find the local date and time, including clock changes.
- `/82-hours-from-now`: 82 hours from now is 3 days and 10 hours later, with each day measured as 24 hours. Find the local date and time, including clock changes.
- `/berlin-to-brisbane-time`: 9 AM in Berlin is 5 PM or 6 PM in Brisbane in 2026. The result depends on the date; check clock-change weeks when scheduling.
- `/new-york-to-rome-time`: 9 AM in New York is 2 PM or 3 PM in Rome in 2026. The result depends on the date; check clock-change weeks when scheduling.

## Shared data flow and safeguards

`scripts/seo-description.mjs` generates the description stored in each
`data/tools/*.json` record and its compressed runtime projection. The existing
page-data consumer renders that one value into the static meta description,
Open Graph, Twitter, visible lead and WebApplication JSON-LD.

- The route inventory, titles, H1s, long-form content, FAQs, relationships,
  calculator inputs and UI source remain unchanged.
- Sitemap `lastmod` and schema `dateModified` advance only for the materially
  changed programmatic pages, not the homepage or core calculators.
- Independent fixtures cover arithmetic, leap dates, inclusive counting,
  fractional zones, date-line crossings and seasonal changes.
- `seo:audit` checks every data record, expected facts, uniqueness and bounds.
- The build's HTML gate checks every output description against page data,
  sharing tags, the visible summary and parsed JSON-LD. Stale runtime projections
  or stale HTML fail the gate.
- Common explanatory language remains where the rules are genuinely shared.
  Exact uniqueness is not presented as proof of search quality or indexing.

## Updating descriptions

1. Modify the fact-selection rules or add independently calculated test cases.
2. Run `node scripts/generate-tool-content.mjs` (no route growth required).
3. Run `npm run test:seo-descriptions`, `npm run test`, `npm run typecheck`,
   `npm run lint`, `npm run build`, and `npm run seo:check`.
4. Review data diffs, static output, and representative desktop/mobile pages.
5. Release deliberately with date-snapshot refresh disabled. Do not crawl all
   production URLs as a deployment test; the local HTML gate covers the corpus.

This repair improves descriptions and their consistency. It does not promise
that Google will use them verbatim, immediately recrawl every URL, or index every
page.
