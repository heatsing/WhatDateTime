# WhatDateTime WordPress migration

Preview: https://darkseagreen-trout-940046.hostingersite.com

This is a separate migration, not a production DNS cutover. The existing Astro/Cloudflare source remains intact. The plugin resolves an allowlisted inventory instead of creating thousands of WordPress posts. Production requires PHP 8.2+, WordPress 6.6+, gzip/JSON support, and a current PHP IANA database. There is no production Node process.

## Source and content

- Migration base: `4060329`, `origin/codex/search-accuracy-20261115` / PR #1. It includes `fix/date-time-consistency-20261113` (`e8e37a3`). Main was not assumed to be the latest source.
- `scripts/export-data.mjs` reads the existing route, content, revision, redirect and eligibility sources. It exports 10,263 accessible routes, 9,994 programmatic routes, 2,238 indexable URLs, and the existing 13 sitemap shards.
- `whatdatetime-tools` contains the pure PHP calculation kernel, REST endpoint, virtual routes, SEO manifest reader and content editor.
- `whatdatetime-theme` contains server HTML, lightweight CSS and native browser interactions. This is an adapted PHP theme, not a claim of pixel-identical React rendering.
- WordPress admin → **WhatDateTime** → enter an existing path without its leading slash. Title, description, introduction and FAQs can be edited. Overrides are sparse database options, not new posts; canonical and index eligibility cannot be changed here. Meaningful edits update page/schema/sitemap modification dates.
- Fixed examples retain their starting conditions. Runtime current answers are calculated in PHP at request time in an explicit zone. The same response supplies result, formula, calendar, timeline and copied text. Browser zone detection uses PHP rules, including for clocks, rather than silently using an older browser time-zone database.
- Countdown targets use UTC instants, local storage and URL fragments. Public calculations do not create database history. REST and HTML POST both validate inputs; custom input pauses live updates.
- `content-adapter.mjs` only corrects implementation-dependent explanations (browser-only/static-build claims, selected zones and synchronized results). Existing SEO title and description strings are retained.

## Build and verify

From the repository root, using the existing Node development toolchain and PHP on PATH:

```sh
npm ci
node wordpress/scripts/export-data.mjs
node wordpress/scripts/generate-parity.mjs
php wordpress/tests/tools.php
php wordpress/tests/inventory.php
node --check wordpress/whatdatetime-theme/tools.js
```

Lint every PHP file with `php -l`. The generated plugin data and test fixtures are intentionally ignored by Git; regenerate before packaging. Zip each entire folder, retaining the top-level `whatdatetime-theme/` or `whatdatetime-tools/` folder. Upload only those ZIPs and the existing `public/BingSiteAuth.xml` / `public/manifest.webmanifest`. Do **not** upload the Astro public robots.txt to the preview.

After deployment:

```sh
node wordpress/scripts/http-check.mjs
node wordpress/scripts/browser-check.mjs
```

These accept `WDT_PREVIEW_URL`; HTTP checks also accept `WDT_HTTP_PROXY`. Browser checks use an isolated headless `agent-browser` session; set `AGENT_BROWSER_BIN` if it is not in the standard local install. Native segmented datetime inputs are set through their value and input/change events because generic CDP text insertion cannot fill that widget. Real buttons, selects, keyboard submission, focus and clipboard handlers are exercised. Screenshots and machine results are written to ignored `wordpress/artifacts/`.

On the isolated preview, `wp eval-file /private/release/tests/wp-integration.php` verifies admin editor permissions/nonce fields and content overrides, restoring every temporary option in `finally`.

For full template coverage, keep `tests/render-all.php` outside the public directory and run `php -d memory_limit=512M /usr/local/bin/wp eval-file /private/release/render-all.php` from the WordPress root. It renders all 10,263 routes in a single CLI process, validates the generated SEO/results and internal-link graph, and writes `render-results.json` next to the private test script. It does not crawl thousands of public URLs or change the saved index settings.

`tests/admin-session.php` is an optional, CLI-only preview acceptance helper, **not a plugin file**. It creates a 15-minute core WordPress session for an existing administrator, backed by temporary private files. Always run its `cleanup` mode in `finally` to restore the test page/revision options, revoke the session, and remove private files. Never upload this script or its authentication output to the public directory or commit authentication state. See `ACCEPTANCE.md` for the actual checks performed.

## Current preview / backup

- Target root: `/home/u343377351/domains/whatdatetime.com/public_html` (verified with a one-time served nonce).
- Original files and database backup: `/home/u343377351/whatdatetime-backups/pre-migration-20261115-8ks203/`.
- A second private files/database snapshot was taken before the completion deployment: `/home/u343377351/whatdatetime-backups/pre-parity-20261115/`. Original and subsequent preview ZIP releases are retained privately for rollback.
- Backup contains `files.tar.gz`, `database.sql`, `SHA256SUMS`; it is outside the webroot with private permissions. Archive readability and both hashes were verified. Never commit or expose the database dump.
- `blog_public=0`; `WDT_PRODUCTION` is not enabled. Preview pages and XML are noindex, robots disallows crawling, and GA is disabled. Hostinger's preview-domain layer rewrites HTML canonical/JSON-LD links to the preview hostname. Sitemaps intentionally retain the original formal-domain URLs for cutover validation.
- WordPress `home` and `siteurl` remain their original `http://whatdatetime.com` values; the Hostinger preview layer provides HTTPS preview routing. Do not change them while relying on this layer without testing the consequences.
- All dynamic HTML and calculation responses are no-store; LiteSpeed receives an explicit no-cache signal. No daily full-site rebuild is needed. Production performance and capacity still need observation on actual traffic.

## Cutover checklist — requires user acceptance first

1. Accept the preview UI and representative tools. Take a new private database/files backup and record current DNS, Cloudflare Worker versions/routes/custom-domain bindings, WordPress options and TLS state.
2. Verify a trusted TLS certificate for the formal domain at Hostinger before sending public traffic there. Test origin routing with the correct Host header; an IP-only request is not sufficient.
3. Change WordPress home/siteurl to `https://whatdatetime.com`. Keep staging noindex. Coordinate Cloudflare DNS origin and remove/disable only the old `whatdatetime` Worker bindings for the formal hostname after recording their rollback values. Check the separate www redirect Worker; avoid redirect loops or deleting unrelated workers.
4. Only for the accepted production host set `WDT_PRODUCTION=true` in wp-config and `blog_public=1`. The plugin requires **both**, plus the exact `whatdatetime.com` Host header, before allowing indexing or GA. Do not enable these for the preview domain.
5. Verify formal-domain HTML canonical/JSON-LD, original per-route index policy, 13 XML shards, robots, 308 aliases, 404s, current answers, no stale HTML cache, Bing verification and GA. Confirm the Hostinger preview noindex layer does not leak onto the formal host.
6. Do not bulk delete URLs, relax the existing 8,025 non-indexable route policies, or change sitemap eligibility to increase counts. Monitor real errors/access logs and GSC separately; migration is not evidence of restored rankings.

## Rollback

Before formal cutover, rollback only this Hostinger preview: activate the backed-up `hostinger-ai-theme`, deactivate `whatdatetime-tools`, restore the recorded WP options if needed, and keep the preview noindex. For an exact pre-migration restoration, verify backup hashes, move the **verified named WordPress root** to a timestamped quarantine directory, extract the known archive into a fresh root, then restore the database using Hostinger/WP-CLI. Retain the quarantined files until verified; never recursively delete an account/domain root.

After formal cutover, first restore the recorded Cloudflare DNS and exact Worker bindings/version so the prior Astro site can serve traffic, then roll back WordPress offline. Restore only this site's files/database, not other sites in the hosting account. No formal DNS/Worker changes were made during this migration.
