# Programmatic Date Page Behaviors

## Interaction sweep result

No scroll animation, sticky transition, parallax, reveal animation, scroll snap, tabs, carousel, modal, or smooth-scroll library was observed. The header remains `position: relative` from scrollY 0 through the page. Editorial content and FAQ answers are always visible.

## Time-driven answer refresh

- Reference script runs once on `DOMContentLoaded`, then every `60,000ms` for `from-today`/`ago-from-today` pages (`1,000ms` for units that include live time).
- Each tick creates a new local `Date`, recalculates the result, rewrites the primary answer, start/result comparison blocks, summary spans, nearby-table dates, month label, and all calendar cells.
- Time-zone text is browser-local (`GMT+0800 (Asia/Shanghai)` in this capture).
- Calendar is display-only. Its active day is recalculated; it has no month navigation controls on this page.
- WhatDateTime recommendation: keep the SEO answer server-rendered, then hydrate from one shared client-side reference instant. Add a minute tick for day pages and a second tick only for time-level pages. Do not let the answer, calendar, comparison, and nearby table use separate `new Date()` calls.

## Calculator

- Changing number or period alone does not update the visible answer.
- Submit is intercepted by JavaScript and navigates to `/{amount}-{period}`. Test: changing 45 to 46 navigated to `/46-days-from-today`.
- Native input constraints: required, integer step 1, min 1, max 100000.
- Period is a native select. The selected option is the page's current calculation family.
- Desktop: controls sit in one row; mobile: number, period, and button stack with `15px` row gaps.
- Button hover changes opacity `1 -> 0.8`; no duration is declared (`transition: all` computes without a timed transition).
- WhatDateTime recommendation: preserve current client-side immediate result behavior in `CalculatorBox`; if canonical navigation is added, make it an explicit secondary action or use `router.push` only when the chosen amount/unit corresponds to an existing route.

## Header menu

- Native `<details>` controls the menu. Click toggles hamburger/close SVG visibility.
- Open mobile menu: absolute below the 50px header (`top: 50px`, `left: 0`, width 390px), black, z-index 1000, shadow `0 8px 20px rgba(0,0,0,.25)`.
- Menu list margin is `15px 40px 30px`; links are white, 16px, weight 600.
- The menu is not an overlay that locks document scroll.
- Evidence: `45-days-from-today-mobile-menu-open-390x844.png`.

## Links, focus, and hover

- Default content link: `#0e5489`; stylesheet hover: `#34a0f3`.
- Header menu links remain white.
- Menu summary has `cursor: pointer`; keyboard focus-visible outline is `2px solid #88dbff` with `4px` offset.
- Table rows are not clickable; only the phrase in the first cell is an anchor.
- Current interval row is bold (`font-weight: 700`) but its link remains active.

## FAQ

- Static Q/A list; no clicks, disclosure state, icons, or animation.
- Questions use H3 and answers are normal paragraphs.
- WhatDateTime may keep its existing `<details>` interaction for accessibility/scanability, but a `variant="editorial"` should be used if visual fidelity is prioritized.

## Responsive transitions

- Base/mobile (<768px): content margins 20px; calculator stacked; result comparison centered and stacked; 16px paragraph/table/list text; H3 18px; calendar width 100%; frequent links one per row.
- `@media (min-width: 768px)`: paragraph/list/table text becomes 17px, H3 19px, breadcrumb 14px, calculator becomes a row, content lists become two columns by default, comparison blocks become 48% each, calendar becomes 50%, and the direct-answer summary gains 80px side margins.
- `@media (min-width: 948px)`: centered 1058px shell appears with 728px main content and 300px ad rail; `.content` side margins and calculator side margins drop to zero.
- No intermediate breakpoint beyond 768/948 was present in the reference CSS.

## Monetization behavior to exclude

The reference page injects blank/ellipsis ad slots after load, changing desktop document height from roughly 4.7k to 6.5k pixels. These shifts are third-party ad behavior, not part of the intended WhatDateTime component layout. Do not clone the slots or their layout shift.

