# Production release — 2026-11-14 (Asia/Shanghai)

## Published version

- User explicitly requested deployment after source synchronization.
- Application source: `fff0345974d185c6b23413a465390b408fe232f4` on `fix/date-time-consistency-20261113`.
- Canonical site: https://whatdatetime.com
- Main Worker `whatdatetime`: `9b538f9e-1e5b-4f7d-91da-b9636510afc2`, independently confirmed at 100% traffic through the deployment API.
- www redirect Worker `whatdatetime-www-redirect`: `41e76d61-ecfa-4b4f-be67-6ace37ef6ebb`, independently confirmed at 100% traffic.
- Previous main Worker version: `c6612ff3-9d92-4952-bdc4-4a8087b2b4dc`. The separately configured www redirect Worker did not exist before this release.

## Release procedure

Read the operating files and confirmed a clean source worktree. Ran `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run seo:check`; all passed. Started local Wrangler and passed `npm run test:ssr`: 44 pages, including the 14 requested samples, query canonicals, HEAD, existing aliases and seven genuine 404s. A local browser also confirmed the relative calculator entered live mode and exposed reset.

Published using the existing `npm run deploy` workflow. The main upload selected 2,277 new/modified assets from 4,532 files; upload retries recovered without changing source or delivery policy. Main publication succeeded. The first new www Worker upload succeeded but the following metadata lookup returned Cloudflare code 10007. A read-only deployment listing then confirmed the newly created Worker; retrying only `npm run deploy:www` successfully bound `www.whatdatetime.com`. No TLS verification bypass, manual DNS rewrite or unrelated account setting was used.

The build retained the explicitly labeled fixed UTC example reference. `refresh_dates` was not enabled. Static assets still precede the known-route Worker fallback; scheduled verification was not changed into daily deployment. This release does not upload a fresh date snapshot every day.

## Production verification

Checks used anonymous browser navigation and same-origin fetches through the agent-browser skill. The analytics script was blocked in the test session to avoid recording synthetic usage.

- 18 representative HTML routes returned 200: homepage; the six requested hour pages; countdown/date/business-day tools; the hours directory; 8/35/90 business-day answers; Toronto → New York, London → Toronto, Singapore → Melbourne; and the existing noindex `/499-hours-ago` fallback.
- Each sampled HTML response had one H1, the correct absolute self-canonical, and parseable JSON-LD. The fallback retained its existing noindex status; all other samples were indexable.
- `/sitemap.xml` and all 13 existing shards returned 200, containing 2,238 URLs total. `/35-business-days-from-today` was present. `/robots.txt` returned 200 with the correct sitemap address. A deliberately nonexistent route returned 404.
- `https://www.whatdatetime.com/8-hours-from-now` returned an HTTPS 308 with `Location: https://whatdatetime.com/8-hours-from-now`, and a browser followed it successfully.
- The hour page started in live device time, then a custom November 14, 2026 23:30 + 2 hours produced November 15 at 01:30. Formula, starting/result dates and copied answer agreed. Focus refresh preserved the custom input; reset resumed live mode.
- Countdown saved a Tokyo February 29, 2028 09:30 target as `2028-02-29T00:30:00.000Z`. The copied share fragment contained the same instant. Clearing storage and restoring the share fragment recovered the same displayed target and timezone without horizontal mobile overflow.
- Singapore → Melbourne at July 15, 2027 09:00 displayed 11:00 and a two-hour difference, using the selected date rather than the live clock's seasonal offset.
- Browser runtime error lists were empty in the exercised flows. A connected production Worker error tail reported no errors during the verification window. This is bounded observation, not a claim about all historical or future traffic.
- Mobile screenshot: local ignored artifact `dogfood-output/release-20261114-live-hour.png`.

Inventory remains 10,263 accessible content routes: 2,238 indexable/static URLs and 8,025 existing noindex on-demand URLs. No numeric page was added and no existing content route was deleted for this release.

## Operational notes

- This is a direct release from the repair branch, not a merge into `main`. Future manual releases must use this branch (or a reviewed merge containing this commit); deploying the older main branch would omit these fixes.
- The previous recovery report describes pre-release work. This document records the subsequent authorized production release.
- GSC submission, URL Inspection, indexing/ranking recovery, complete CDN history and production field performance were not verified. No search-recovery promise is made.
- Existing framework security advisories remain tracked in the November 5 review; this release does not claim a framework upgrade.
