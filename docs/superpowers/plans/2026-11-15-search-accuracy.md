# Search accuracy implementation plan

> **For agentic workers:** Execute inline and verify the resulting branch before release.

**Goal:** Prepare the current repair branch for an SEO-focused release without changing URLs, delivery architecture or existing index eligibility.

**Architecture:** Reuse Astro static pages, React calculation state and the Cloudflare fallback. Reuse the unshipped fixes in `e8e37a3`; do not recreate them.

**Tech Stack:** Astro, React, TypeScript, date-fns, Cloudflare Workers.

**Spec:** Owner-approved search analysis and request to optimize the existing site or provide a WordPress migration solution (2026-11-15).

## Global constraints

- Base on `fix/date-time-consistency-20261113`, not the older `main`.
- Keep the 2,238 indexable URLs and existing noindex routes unchanged.
- Keep private search exports and metrics out of this public repository.
- Preserve the explicitly labeled UTC example and local live/custom behavior.
- Do not deploy, migrate, or change DNS as part of preparing this review branch.

## Review focus

- Protected URLs must exist and retain their prior canonical/index status.
- FAQ guidance must distinguish elapsed hours, calendar units and weekdays.
- Fixed worked examples must remain readable while being excluded from snippets.
- Main result and useful explanatory content must remain eligible for snippets.
- Existing fractional-hour, DST, invalid-input and custom-state regressions must pass.

## Tasks

- [x] Protect the existing 18-page review cohort in `data/index-policy.json`; compare the complete eligibility set before and after.
- [x] Improve `lib/calculation-faq.ts` and mark only fixed supporting examples in `components/SEOContent.tsx` with stable `data-nosnippet` containers. Update material revision dates.
- [x] Document the source/release gap, remaining SEO work and WordPress migration path in `docs/SEARCH-OPTIMIZATION-2026-11-15.md`.
- [x] Run existing tests, type checks and build/SEO gates; review the delta. Prepare a draft PR targeting the current repair branch with the HTTP limitation recorded.
- [ ] Before production release, pass local Worker HTTP smoke in a supported runtime. This environment's Worker startup failed with `uv_interface_addresses`; HTTP smoke failed with `ECONNREFUSED`.

Human-facing copy and configuration changes use the existing integration/SEO checks; no tests that merely assert wording or mirror configuration are added.

Execution record: the initial and final complete suites passed. Both standard build and final build with unchanged committed timezone data passed. Worker dry-run packaging passed. Incidental timezone regeneration was excluded; the deployment run must review its environment's generated data. A fresh read-only review found no introduced calculation defects; its protection-note privacy cleanup was applied. The audit report now uses the policy's actual evidence description instead of an obsolete statement that no export had been reviewed.
