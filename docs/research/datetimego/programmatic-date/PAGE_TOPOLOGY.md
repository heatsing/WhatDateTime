# Programmatic Date Page Topology

## Research frame

- Reference URL: `https://datetimego.com/45-days-from-today`
- Captured: 2026-08-01 in `Asia/Shanghai`; the reference result resolved to 2026-09-15.
- Viewports: desktop `1440x1000`, mobile `390x844` (DPR 1).
- Master captures: `docs/design-references/datetimego/programmatic-date/45-days-from-today-desktop-1440x1000.png` and `45-days-from-today-mobile-390x844.png`.
- Scope is layout and behavior evidence. Target prose, logo, and ad implementation are not reusable content.

## Desktop page frame (1440px)

- Header: full-width, `50px` high, black, `position: relative` (not sticky).
- Header inner container: `max-width: 1058px`, `padding: 0 10px`, centered; logo is centered between a `32px` menu control and `32px` search control.
- Breadcrumb: immediately below header; single horizontal line, `14px` at `>=768px`, horizontally scrollable rather than wrapping.
- Main container at `>=948px`: `1058px` wide with `10px` gap, composed of a `728px` article and a `300px` right ad rail. The article begins at x=201 in the 1440px capture.
- Article: vertical flex column with `10px` row gap. Content modules themselves have no card fill or shadow.
- Reference ad runtime inserts multiple blank `275px` slots and a right rail. These are monetization artifacts, not content topology; do not reproduce them in the initial WhatDateTime implementation.

## Mobile page frame (390px)

- Header remains `390x50px`.
- Breadcrumb occupies `362.81x33.5px`, starts at x=0, uses `padding: 0 10px`, and scrolls on the x-axis.
- Main/article is `390px` wide; standard content is inset `20px` (`350px` usable width).
- Article stays one column with `10px` gaps. The ad rail and desktop ad units disappear.
- Mobile content height measured `6280.58px` without desktop ad placeholders.

## Visual order and interaction model

| Order | Module | Desktop evidence | Mobile evidence | Interaction model |
|---|---|---|---|---|
| 1 | Global header | 50px black bar | same; menu expands below it | click-driven menu; static on scroll |
| 2 | Breadcrumb | one-line trail | one-line horizontal overflow | links only |
| 3 | Direct answer | centered H1, prompt, result date | H1 and result wrap to two lines | time-driven refresh every 60s |
| 4 | Month calendar | centered 364px calendar | fills 350px content width | time-driven data; no calendar controls |
| 5 | Answer explanation | centered paragraph, 568px wide | fills 350px | static |
| 6 | Compact calculator | 728x160px; three horizontal columns | 370x294px; stacked controls | form submit navigates to canonical result URL |
| 7 | Date comparison | two equal `48%` columns | two 280px blocks stacked and centered | time-driven refresh every 60s |
| 8 | Editorial blocks | narrow vertical prose, H2/H3/lists/numbered steps | same flow with natural wrapping | static |
| 9 | Nearby result table | two-column, 11 rows, current row bold | remains a two-column table; cells wrap | link hover/click |
| 10 | Frequent calculations | two-column link list | one-column link list | link hover/click |
| 11 | FAQ | four always-visible Q/A pairs | same | static; no accordion |
| 12 | Footer | centered legal links and copyright | same | links only |

## Recommended WhatDateTime assembly

Keep the existing route/data/SEO contracts in `app/[slug]/page.tsx` and `lib/seoGenerator.ts`. Recompose the page rather than replacing those systems:

1. Keep `Breadcrumb` and the existing global `Header`/`Footer` so the brand and site navigation remain consistent.
2. Split the current hero result out of `CalculatorBox` into a server-rendered direct-answer region containing the answer and a reusable calendar for relative date pages.
3. Keep `CalculatorBox` as the client boundary. Preserve its current `SEOPage` discriminated-union API and in-place calculation support; optionally provide canonical navigation when amount/unit map cleanly to a programmatic slug.
4. Add a date comparison module derived from the same calculation result, rather than duplicating date math in JSX.
5. Let `SEOContent` consume more structured section variants (prose, numbered steps, feature list) while keeping all copy sourced from WhatDateTime editorial data.
6. Add a table presentation to `RelatedLinks` (or a sibling `RelatedDateTable`) while retaining current link generation and `getPageResult` use.
7. Keep `FAQ` and FAQ schema data shared. A plain editorial variant can mirror the reference density, but the current accessible `<details>` variant is preferable if exact static behavior is not required.

## Content contract (original WhatDateTime copy only)

- Direct answer: query phrase, formatted result, concise calculation basis.
- Comparison: local start date and calculated date, each split into weekday, month/day, year, and time-zone label.
- Guide: calculation basis, practical uses, short step sequence, accuracy notes.
- Nearby table: amount/phrase, formatted date, current-row flag, canonical href.
- FAQ: WhatDateTime questions and answers from `buildFAQs`; never import reference-site wording.

