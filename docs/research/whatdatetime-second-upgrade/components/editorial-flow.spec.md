# Programmatic editorial-flow specification

## Targets

- `app/[slug]/page.tsx`
- `components/SEOContent.tsx`
- `components/RelatedLinks.tsx`
- `components/FAQ.tsx`

## Layout

- One continuous `max-w-3xl` reading column after the calculator.
- White canvas throughout; section boundaries use spacing and thin rules instead of full-width gray bands.
- H2 around 24-28px, H3 18-20px, body 16-17px/1.65.
- Keep the full six-stage order required by `seo-check`.

## Nearby table

- Semantic two-column table with no card-like outer treatment.
- Stable 42% first column, wrapping at mobile, thin horizontal rules.
- Current row uses weight plus a subtle blue tint and `aria-current`.

## FAQ

- Always-visible page-specific questions and answers in the same reading column.
- Thin dividers only; no accordion animation or decorative card.

## SEO constraints

- Preserve all 9,994 programmatic slugs and 10,000 sitemap URLs.
- Do not alter metadata, canonical, schema inputs, formulas, direct answers, or internal-link source data.
