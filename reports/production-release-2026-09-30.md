# Production release — 2026-09-30

The owner explicitly requested pushing and deploying the accepted refactor.
The existing release branch was fast-forwarded into `main`; no force push,
dependency upgrade or new page-policy change was performed during release.

## Released versions

- Application source: `80c2594b264d11b2616ff877159d8f171d48b6d3` on GitHub main.
- Canonical origin: `https://whatdatetime.com`.
- Main Worker: `c6612ff3-9d92-4952-bdc4-4a8087b2b4dc`, 100% traffic;
  deployment recorded at `2026-09-30T10:25:38.205Z`.
- www redirect Worker: `a2906e40-dc85-42ac-98e2-b81ff56dfc93`, 100% traffic;
  deployment recorded at `2026-09-30T10:25:45.892Z`.
- Previous main version: `dbfca3e7-c580-465e-be70-13e157cf3b0a`.
- Previous www version: `430b4483-5fd4-4476-ba39-6899e40e5102`.

Both deployments succeeded using the existing Wrangler OAuth connection.
The main upload changed 2,279 static files; four were already uploaded. The
Worker bundle was 422.01 KiB gzip and reported 17 ms startup. These numbers are
upload/startup metrics, not visitor request counts or request CPU measurements.
No daily date refresh, crawl-all-pages job or scheduled deployment was enabled.

## Before release

- Fresh `npm run build`, including the full static HTML/SEO gate: passed.
- `npm run typecheck`, `npm run lint`, `npm run test`: passed.
- Worker packaging dry run: passed.
- Local Cloudflare navigation smoke: passed on 28 pages, including 10 eligible
  and 10 noindex city pairs, real 404s, aliases, query canonicals and HEAD.
- Inventory: 10,262 accessible routes; 2,236 indexable and 8,026 noindex.
  All 9,994 original programmatic URLs remain in the route inventory.

## Production observations

At approximately 10:27–10:31 UTC on September 30:

- The same 28 production page samples returned 200 with the expected robots,
  absolute self-canonical, title, description, exactly one H1 and parsable JSON-LD.
  This included the 10 eligible / 10 noindex city-pair samples.
- All 14 sitemap files (index plus 13 shards) returned 200 and their SHA-256
  hashes matched the locally validated build byte-for-byte: 2,236 sitemap URLs.
  This verifies the deployed eligible set without requesting every page.
- Owner-reported indexed URLs `/194-months-from-today`, `/new-york-to-rome-time`
  and `/washington-dc-to-denver-time` returned 200, index/follow and self-canonicals.
- Unknown routes, unknown city hubs and the build-only `/render-shell` returned
  genuine 404 responses. A UTM query retained the clean self-canonical.
- The converter alias and noindex trailing-slash URL resolved correctly. HEAD
  for `/499-hours-ago` returned 200 with an empty body. Robots returned 200 and
  referenced the canonical sitemap index.
- Browser navigation to `http://www.whatdatetime.com/time/new-york` ended at
  `https://whatdatetime.com/time/new-york` with a functioning live clock.
- Actual noindex browser navigation and hydration worked for Berlin–Dublin and
  `/499-hours-ago`. Changing 499 to 24 produced September 29 at 6:29 PM from
  September 30 at 6:29 PM, with no URL query reload.
- New York–London's repeated `2026-11-01T01:30` input showed both occurrences:
  5:30 AM London for UTC−4 and 6:30 AM London for UTC−5.
- The 390-pixel city page had no viewport-wide horizontal overflow. Collected
  browser runtime errors after the tested interactions were empty.
- A Worker tail filtered to the release probe header showed `Ok` outcomes for
  sampled noindex, unknown-route, alias, slash and HEAD requests. No exceptions
  or 1101 errors appeared in those traces. This is not sitewide historical-log
  coverage. The initial direct tail connection timed out; the local proxy
  connection succeeded. No production routing settings were changed to fix it.

Agent-browser was used for raw production HTML inspection and actual interactions,
not just checking that the deployment command exited successfully. Local evidence
is retained under ignored `dogfood-output/release-production-{http,sitemap,routing}.json`
and `dogfood-output/release-live-city-mobile.png`.

## October 1 follow-up

At `2026-10-01T02:52:33Z`, the production city page hydrated and showed New York
10:52 PM on September 30, while London showed 3:52 AM on October 1. This confirms
the calendar date follows the selected city's zone, not an unconditional sitewide
date. The UTC reference was current, self-canonical was correct, and the browser
runtime-error list was empty. No second full upload was needed for the new day.

## Remaining limits

There is still no verified GSC export. This release does not demonstrate improved
Google indexing or traffic; review those after recrawling. Existing dependency
security advisories remain recorded in `SEO_REFACTOR_REPORT.md`. Deployment and
sampled correctness checks do not resolve them, establish sustained load limits,
or guarantee zero billable fallback-Worker requests.
