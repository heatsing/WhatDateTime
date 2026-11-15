# Preview verification — 2026-11-15

Preview: https://darkseagreen-trout-940046.hostingersite.com

## Verified

- Independent branch `migrate/wordpress-php-20261115`, based on PR #1's `4060329` (including the date-consistency branch). Existing Astro implementation is unchanged.
- 10,263 original accessible routes are represented in the PHP allowlist. The original eligibility policy remains 2,238 indexed / 8,025 non-indexed URLs. No new arbitrary-number routes or mass-post import.
- All 13 existing sitemap shards are preserved with 2,238 canonical URLs. Inventory tests check all route records, indexed title/description uniqueness, revisions, canonical construction, and internal link destinations.
- PHP syntax checks and **835 calculation assertions** passed locally and on Hostinger. Cases include leap years, month-end clamping, weekend exclusion, zero/start-day rules, elapsed hours versus calendar days, DST skipped/repeated hours including Lord Howe, selected-date conversions, and identical UTC countdown targets in different zones.
- PHP timezone data is newer than the development Node runtime. The documented Morocco rule change is treated as an explicit fixture-version difference, not ignored. The public PHP clock endpoint was checked against the current server offset.
- HTTP checks cover **32 representative HTML URLs**, including the requested acceptance pages and all general tool types; one title, H1 and canonical, parsable JSON-LD, no-store responses, current PHP initial results, preview noindex and no GA. Unknown routes return 404; the original date-calculator alias returns 308. All sitemap shards were fetched and compared with the inventory.
- Browser tests cover custom results/formula/calendar synchronization, clipboard-handler payload equality, blank/zero validation, reset, focus/resume protection, countdown save/share/restore/zone change, simulated next-day wake-up, search, clock format, and no page-wide horizontal overflow at 360/390/768/1440 widths.
- Desktop/mobile screenshots were visually inspected. The theme is a lightweight PHP adaptation; pixel-identical rendering of the React site is not asserted.
- WordPress integration checks verify editor fields/nonce, anonymous denial, persisted content override reads, and preservation of canonical/index eligibility. Temporary test options were restored immediately. This does not claim a full authenticated admin-browser test.
- The existing project's `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run seo:check` passed. These are baseline Astro checks in addition to, not substitutes for, the PHP and deployed-preview checks.
- Original target files and database are backed up outside the public directory with verified hashes. ZIP upload hashes were compared before installation. The temporary public identity marker was moved to the private release directory after verification.

## Boundaries / pending acceptance

- The preview is deliberately noindex. The existing production Cloudflare Worker, DNS and formal domain were **not switched**.
- Current `home` / `siteurl` values are unchanged. Production HTTPS origin, final canonical behavior without Hostinger's preview rewriting, formal-domain GA, production logs/capacity and GSC must be verified during/after an approved cutover. This is not proof of indexing or ranking recovery.
- Browser countdown recovery uses an injected clock advance plus focus/visibility events, not a physical computer sleep cycle. Clipboard tests capture the handler's payload, not the user's OS clipboard. Native segmented datetime widgets use value/input/change simulation in the CLI harness; other controls use actual browser actions.
- Runtime relies on a maintained PHP IANA database. Calculations are uncached for correctness; production performance under real traffic has not been load-tested.
- Rollback and cutover instructions are in `README.md`. No passwords, private keys or database backups are committed.
