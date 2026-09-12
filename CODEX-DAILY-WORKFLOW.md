# Codex Daily Workflow

1. Read all operating files and inspect `git status`.
2. Preserve unrelated user changes and the current UI.
3. Make the smallest data-driven or architectural change needed.
4. Run `npm run typecheck`, `npm run lint`, and `npm run seo:check`.
5. Run `npm run build` before deployment.
6. Inspect generated HTML and test representative date, calculator, and time-zone pages.
7. Confirm route and sitemap counts do not decrease.
8. Commit and synchronize the source repository. Deploy both the main asset-first site and the isolated www redirect Worker only for an intentional production release, then verify production logs and browser errors. Leave `refresh_dates` off for ordinary releases so only genuinely changed assets upload; enable it only for an intentional full static date refresh.
