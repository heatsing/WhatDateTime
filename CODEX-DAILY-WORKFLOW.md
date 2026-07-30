# Codex Daily Workflow

1. Read all operating files and inspect `git status`.
2. Preserve unrelated user changes and the current UI.
3. Make the smallest data-driven or architectural change needed.
4. Run `npm run typecheck`, `npm run lint`, and `npm run seo:check`.
5. Run `npm run build` before deployment.
6. Inspect generated HTML and test representative date, calculator, and time-zone pages.
7. Confirm route and sitemap counts do not decrease.
8. Commit, synchronize the source repository, deploy, and verify production logs and browser errors.
