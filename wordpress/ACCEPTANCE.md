# Preview verification — 2026-11-15

Preview: https://darkseagreen-trout-940046.hostingersite.com

## Typography correction — 2026-11-15

- Theme 0.1.1 reduces the shared typography scale without changing content, routes, calculation code or indexing settings. At a standard 1440px viewport, body text changes from 18px to 16px, navigation from 18px to 15px, H1 from 43.2px to 36px, and the homepage clock from 90px to 64px. Mobile H1 is 28px; inputs remain 16px and buttons keep a minimum 44px target height.
- The root size follows the browser default instead of growing at the desktop breakpoint. Timeline cells can wrap at an enlarged text size; action buttons no longer stretch to the height of adjacent labeled inputs.
- The old theme is privately backed up at `/home/u343377351/whatdatetime-backups/pre-typography-20261115-Kl4ODg/theme.tar.gz` (SHA-256 `d94e1185187304e3ca15d869b5808f6b22c923b3d751daeb2c1f779ff7502b3e`). Only `style.css` was replaced on Hostinger, after verifying old/new hashes. Deployed CSS SHA-256: `c23f15a9785a759f9ead81a73d7fbc62a409f38682efcbbe598954cf383f1297`. The stylesheet's existing filemtime URL changes its browser cache key.
- Re-ran typecheck, lint, SEO checks, build, CSS parsing, PHP inventory and 844 calculation assertions. Deployed-preview checks passed for 33 HTML samples, 13 sitemap shards / 2,238 URLs, and 21 browser checks. Typography checks cover 320/360/390/768/1440 widths, input sizes, button heights and 200% text-size reflow on the hour page. The browser harness explicitly scrolls controls into view before real clicks. On Windows, the browser was prestarted through the CLI because a fresh native daemon retained the Node harness's captured output pipes.
- Reopened the deployed preview without injected CSS and measured the new sizes. Before/after desktop and mobile screenshots are in ignored `wordpress/artifacts/type-{before,after}-{desktop,mobile}.png`; browser errors were empty. `blog_public` remains 0. This style-only update does not complete formal-domain DNS/SSL cutover.

## Verified

- Independent branch `migrate/wordpress-php-20261115`, based on PR #1's `4060329` (including the date-consistency branch). Existing Astro implementation is unchanged.
- 10,263 original accessible routes are represented in the PHP allowlist. The original eligibility policy remains 2,238 indexed / 8,025 non-indexed URLs. No new arbitrary-number routes or mass-post import.
- All 13 existing sitemap shards are preserved with 2,238 canonical URLs. Inventory tests check all route records, indexed title/description uniqueness, revisions, canonical construction, and internal link destinations.
- PHP syntax checks and **844 calculation assertions** passed locally and on Hostinger. Cases include leap years, month-end clamping, weekend exclusion, zero/start-day rules, elapsed hours versus calendar days, DST skipped/repeated hours including Lord Howe, selected-date conversions, original calculator defaults, annual timezone periods, synchronized city comparisons, and identical UTC countdown targets in different zones.
- PHP timezone data is newer than the development Node runtime. The documented Morocco rule change is treated as an explicit fixture-version difference, not ignored. The public PHP clock endpoint was checked against the current server offset.
- HTTP checks cover **33 representative HTML URLs**, including the requested acceptance pages and all general tool types; one title, H1 and canonical, parsable JSON-LD, no-store responses, current PHP initial results, preview noindex and no GA. Unknown routes return 404; all existing redirect aliases preserve their original status and destination. All 13 sitemap shards were fetched and compared with the 2,238-URL inventory.
- **21 browser checks** cover all 13 general tools, city-hub comparisons/office hours/facts/FAQ, custom results/formula/calendar/nearby synchronization, clipboard-handler payload equality, blank/zero validation, reset, focus/resume protection, countdown save/share/restore/zone change, simulated next-day wake-up, search, navigation keyboard close, clock/date metrics, selected-zone 9 AM meeting action, and no page-wide horizontal overflow at 360/390/768/1440 widths.
- Desktop/mobile screenshots were visually inspected. The theme is a lightweight PHP adaptation; pixel-identical rendering of the React site is not asserted.
- **Every one of the 10,263 routes was rendered through the installed PHP theme in WordPress CLI.** One title/H1/description/canonical, matching page data, parsed JSON-LD, initial calculated answer/formula and existing per-route index policy passed. All rendered internal destinations resolve in the inventory; indexable pages are reachable within six links. This uses production SEO flags only inside the CLI process, without changing saved WordPress visibility or public routing; it does not claim 10,263 public HTTP requests.
- WordPress integration checks verify editor fields/nonce, anonymous denial, persisted content override reads, and preservation of canonical/index eligibility. An authenticated browser also edited and saved title, description, introduction and FAQ on the isolated preview, and a separate anonymous browser confirmed the rendered changes and FAQ JSON-LD. Original content and revision options were restored and verified. The 15-minute test session was revoked and all temporary authentication files removed; no password or user account was changed.
- The existing project's `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run seo:check` passed. These are baseline Astro checks in addition to, not substitutes for, the PHP and deployed-preview checks.
- Original target files and database are backed up outside the public directory with verified hashes. ZIP upload hashes were compared before installation. The temporary public identity marker was moved to the private release directory after verification.

## Boundaries / pending acceptance

- The preview is deliberately noindex. The existing production Cloudflare Worker, DNS and formal domain were **not switched**. The owner explicitly deferred SSL/DNS changes; no further production cutover is authorized in this round.
- Current `home` / `siteurl` values are unchanged. Production HTTPS origin, final canonical behavior without Hostinger's preview rewriting, formal-domain GA, production logs/capacity and GSC must be verified during/after an approved cutover. This is not proof of indexing or ranking recovery.
- Browser countdown recovery uses an injected clock advance plus focus/visibility events, not a physical computer sleep cycle. Clipboard tests capture the handler's payload, not the user's OS clipboard. Native segmented datetime widgets use value/input/change simulation in the CLI harness; other controls use actual browser actions.
- Runtime relies on a maintained PHP IANA database. Calculations are uncached for correctness; production performance under real traffic has not been load-tested.
- Rollback and cutover instructions are in `README.md`. No passwords, private keys or database backups are committed.

## Functional coverage added in the completion pass

- The original navigation groups and homepage time-zone shortcuts are exported from source configuration rather than maintained separately.
- Homepage date/year/week metrics and city clocks use PHP timezone data. Pair pages distinguish selected-date calculations from current city clocks.
- City hubs retain comparison clocks, 9 AM–5 PM wall-clock conversions, next-transition facts, FAQs, and same-country/zone links. The world-clock directory retains featured cities; directory schemas use CollectionPage, while trust pages use WebPage.
- Relative-page nearby results use the same custom or live starting instant and zone as the main calculation, formula, calendar, timeline and copied answer.
- City pairs include selected-date offsets, the 24-hour conversion table, weekday office overlap, annual clock changes and the corresponding annual time-difference periods.
- The meeting quick action selects 9 AM today in the chosen source city without replacing either city. Explicit reset still restores the page's default conditions.
- Existing generic tools, directory pagination, content, FAQs, trust pages and verification files remain available. Runtime is PHP plus native JavaScript; Node is needed only for development export/test tooling.
