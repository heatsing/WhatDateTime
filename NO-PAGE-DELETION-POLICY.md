# No Page Deletion Policy

- Existing indexable URLs must remain live, indexable, self-canonical, and present in the sitemap.
- Do not delete pages, add `noindex`, redirect URLs, canonicalize them to hubs, or reduce the route inventory without explicit approval and documented evidence.
- Content improvements must be deployed in place.
- If a page has a technical defect, repair the page rather than removing it.
- Any exceptional removal proposal requires impact analysis, GSC evidence, replacement mapping, rollback instructions, and explicit authorization.

## 2026-09-26 exception explicitly authorized by the site owner

The attached SEO refactor request authorizes **noindex, follow** and sitemap
exclusion for lower-priority existing pages. This changes index eligibility,
not URL availability: all known URLs still return 200 with working tools and
self-canonicals. Preserve reported indexed/evidence URLs. No deletion or
redirect-to-hub is authorized. The eligibility report records each decision;
the versioned policy can restore eligibility without changing URLs.
