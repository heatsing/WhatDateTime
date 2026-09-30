# Codex Daily Workflow

1. Read all operating files and inspect `git status`.
2. Preserve unrelated user changes and the current UI.
3. Make the smallest data-driven or architectural change needed.
4. Run `npm run typecheck`, `npm run lint`, and `npm run seo:check`.
5. Run `npm run build` before deployment.
6. Inspect generated HTML and test representative date, calculator, and time-zone pages.
7. Confirm accessible route count does not decrease. Since the explicitly authorized 2026-09-26 eligibility refactor, sitemap count must equal eligible URLs; noindex URLs must not appear in sitemaps.
8. Commit and synchronize the source repository. Deploy both the assets-first canonical site (with a known-route SSR fallback) and the isolated www redirect Worker only for an intentional production release, then verify production logs and browser errors. Leave `refresh_dates` off for ordinary releases so only genuinely changed assets upload; enable it only for an intentional full static date refresh.
9. Test both ordinary fetches and real `Sec-Fetch-Mode: navigate` requests in Wrangler before release. A passing fetch test alone does not prove browser navigation works. Run `npm run test:ssr` against local Wrangler, then check hydration in a browser.
