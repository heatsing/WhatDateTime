# Browser acceptance — 2026-09-30

Environment: local Cloudflare Wrangler at `http://127.0.0.1:8790`, Chromium
through agent-browser; 1440 × 1000 desktop and 390 × 844 mobile. This is local
release-candidate evidence, not a claim that production has changed.

## Verified interactions

- `/new-york-to-london-time`: initial HTML is readable before hydration; live
  clocks subsequently use September 30, 2026, rather than the static September
  26 snapshot. Observed 1:12 AM New York / 6:12 AM London at 05:12 UTC. One H1;
  no viewport-wide horizontal overflow on desktop or mobile.
- Meeting planner, `2026-11-01T01:30` in New York: both occurrences appear,
  UTC−4 → 5:30 AM London and UTC−5 → 6:30 AM London.
- Meeting planner, `2026-03-08T02:30`: visible alert rejects the nonexistent
  local time; the 24-hour table marks the skipped hour. Reset restores the
  source city's current calendar date at 09:00 (`2026-09-30T09:00` in this run).
- `/time/new-york`: live date, UTC−4, current daylight-saving status, standard
  UTC−5 and next transition at `2026-11-01 06:00 UTC` visible. New York, London,
  Tokyo and Los Angeles clocks correctly show different local dates where
  applicable. One H1 and one self-canonical; indexable. No page overflow.
- `/berlin-to-dublin-time`: direct browser navigation succeeds, hydrates and
  shows current clocks plus 24 hourly table rows. `noindex, follow` and absolute
  self-canonical retained; 9 AM Berlin → 8 AM Dublin on the selected date. No
  mobile page overflow.
- `/499-hours-ago`: direct browser navigation succeeds and the calculator
  hydrates. Changing Number to 24 and calculating gives September 29 at 1:14 PM
  from September 30 at 1:14 PM. The URL remains `/499-hours-ago`, with no form
  query reload. Its page-specific answer remains about 499 hours, while the
  separately labelled calculator result reflects the changed input.
- Homepage: current September 30 local date, digital/analog clocks, mobile
  navigation and existing utility-first layout render normally.
- Browser runtime error collection returned an empty list after the tested
  journeys; no React hydration error was recorded.

Datetime and numeric React inputs were also tested by dispatching native input
and change events, followed by clicking the actual action and waiting for the
result. Merely changing the DOM field value was not counted as a passed test.

## Screenshots inspected

Local evidence (ignored by Git, under `dogfood-output/`):

- `refactor-final-pair-desktop.png`
- `refactor-final-pair-mobile.png`
- `refactor-final-city-desktop.png`
- `refactor-final-city-mobile.png`
- `refactor-final-retained-tool-mobile.png`
- `refactor-final-home-mobile.png`

Global typography/colors/layout styles were not redesigned. New functional
timezone modules intentionally change the page's content structure; these
checks are not a claim of pixel-identical before/after screenshots.

## Separate automated evidence and limits

`http-smoke.json` covers 28 HTTP pages including 10 eligible and 10 noindex
pairs, four genuine 404s, aliases, query canonicals and HEAD. The SEO audit
checks all 2,236 static HTML pages and 20 actual on-demand render samples,
alongside all 10,262 metadata/routing records. This is not a claim of manually
visiting all 10,262 pages or rendering every noindex page in a browser.

Local Wrangler warned that its optional `Request.cf` metadata fetch timed out;
it continued with a local placeholder. The browser also requested the existing
missing `/favicon.ico` fallback. Neither is a React/runtime failure; production
network behavior and account quotas still require release-time verification.
