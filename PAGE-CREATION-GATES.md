# Page Creation Gates

A new page may be added only when:

- It serves a distinct, defensible search intent.
- Its result and supporting content can be calculated or authored accurately.
- It has a unique title, description, H1, direct answer, examples, FAQs, and relevant internal links.
- Its eligibility is determined by the central policy. Eligible pages enter static paths, sitemap and crawlable hub relationships; known ineligible tools use noindex on-demand HTML and retain their self-canonical.
- It passes duplicate-content and metadata checks.
- It does not cannibalize an existing page or act as a doorway page.
- The full SEO and production build gates pass.

2026-09-26 exception: the owner explicitly authorized functional city hubs and
bounded directory pages, and a first phase of approximately 1,000–2,500 indexable
URLs. No additional number-answer pages or city-pair combinations are authorized
by this refactor. Directory pages need unique metadata, useful real links and
pagination; do not pad them with invented FAQs or examples to satisfy prose quotas.

## 2026-11-13 generic business-day tool

The current request explicitly authorizes a reusable business-day entry if none
exists. `/calculators/business-days` adds arbitrary start date, amount and
direction using the existing engine, with explicit weekend/holiday/start-day
rules. It serves tool intent rather than another numeric answer. The existing
numbered routes are retained and link back to the tool. Unique metadata,
self-canonical, schemas, sitemap, accessible inputs and full build/SEO gates
were checked; see `reports/recovery-2026-11-13.md`.
