# SEO Operating Rules

- The official public brand is `WhatDateTime` and the canonical production origin is `https://whatdatetime.com`.
- Preserve every existing indexable URL. Do not delete, redirect, noindex, or remove a URL from the sitemap without explicit approval.
- Keep `data/tools/index.json` as the route inventory and shared source for static params, metadata, page output, schema, sitemap, and internal links.
- Every indexable page must ship complete static HTML with a unique title, description, H1, direct answer, canonical, and matching JSON-LD.
- Canonicals must be absolute and self-referencing. Metadata, visible content, schema, and sitemap URLs must agree.
- Run `npm run seo:check` and `npm run build` before production deployment.
- Improve long-form content in measured cohorts of 10–20 URLs, prioritizing verified GSC demand.
- Apply the complete landing-page framework sitewide; reserve cohort limits for bespoke editorial rewrites, not required structural coverage.
- Do not change the established UI while performing technical SEO maintenance.
