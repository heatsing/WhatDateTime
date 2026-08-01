# Result, Clock, and Calendar Specification

## Overview

- Reference screenshots: `45-days-from-today-desktop-top-1440x1000.png`, `45-days-from-today-mobile-top-390x844.png`, and `calculator-clock-*.png`.
- Existing integration points: `app/[slug]/page.tsx`, `components/ResultCard.tsx`, `components/CalculatorBox.tsx`.
- Interaction model: time-driven data refresh; calendar itself is static.
- Suggested architecture: `DirectDateAnswer` (server shell), `MonthCalendar`, and `DateComparison`; share one calculated result/reference instant.

## DOM/content model

1. Query H1.
2. Short answer prompt H2.
3. Semantic `<time dateTime="YYYY-MM-DD">` primary result.
4. Calendar: month header, weekday list, 5-6 week rows; inactive adjacent-month cells and one active result cell.
5. Original WhatDateTime calculation-basis sentence.
6. Comparison region with start and result blocks: label, weekday, month/day, year, local zone.

Do not copy reference sentences. Generate labels and summaries from `SEOPage`, `getRelativePhrase`, `getPageResult`, and WhatDateTime editorial data.

## Exact desktop styles (1440 viewport)

- Answer wrapper: 728x649.75px at x=201; `padding:20px 0`, radius 10px, transparent.
- H1: 728x33.59px; 28px/33.6px, 700, `#6d6d6d`, centered, margin 0.
- Prompt H2: 22px/33px, 600, `#4b4b4b`, centered, `margin:25px 0`.
- Primary date: 42px/42px, 600, black, centered, `margin:3px 0`.
- Calendar: 364x289.59px, white, radius 10px, `margin:30px 182px`.
- Calendar header: 364x37.59px, flex centered, `padding:6px`, `#e6e6e6`, radius `10px 10px 0 0`.
- Month: 16px/25.6px, 600.
- Calendar body: 364x252px, `padding:15px`, `1px solid #e6e6e6`, radius `0 0 10px 10px`.
- Inner weekday/date lists: 332px wide, flex wrap. Weekday row 34px; date grid 170px.
- Cell: 47.42x34px, `padding:5px 0`, 16px/24px, centered; weekday weight 500 and `#414141`.
- Inactive date: `#aaa`. Active text: white.
- Active `::before`: absolute 36x36px circle, top/left 50%, translate(-50%,-50%), z-index -1, `#0693ff`.
- Summary: 568px, 17px/27.2px, centered, `margin:0 80px 20px`.

### Comparison block

- Wrapper: 728px; inner flex wrap, `justify-content:space-between`, row gap 40px, margin `40px 0`.
- Each comparison block: `48%` = 349.44px, height 192.58px, transparent.
- Label: 17px/25.5px.
- Weekday: 24px/33.6px, 600.
- Month/day: 46px/59.8px, 600.
- Year: 36px/43.2px, 600.
- Zone: 17px/25.5px, `#3c3c3c`, `margin-top:5px`.

## Exact mobile styles (390 viewport)

- Answer wrapper: 350px at x=20, `padding:20px 0`, height 706.16px.
- H1 remains 28px/33.6px but wraps to 67.19px.
- Prompt remains 22px/33px.
- Primary date becomes 32px/32px, `margin:5px 0`, wrapping to 64px.
- Calendar fills 350px; margin `30px 0`; header/body heights remain unchanged. Seven columns become 45.43px after the 15px body padding/border.
- Summary: 350px, 16px/25.6px, no side margin, height 102.38px.
- Comparison content: outer 350px; inner flex is centered with 40px row gap and margin `40px 0`.
- Each date block is 280px (80%) and 192.58px high; typography is unchanged from desktop.

## Behavior and state

- Refresh every 60 seconds for date-family pages; recompute at mount and on each tick.
- The same tick must update primary `<time>`, summary, calendar month/grid, comparison data, and related table.
- Use local calendar arithmetic, not millisecond addition, to preserve expected day behavior around DST.
- Mark result with `aria-live="polite"`; do not announce all calendar/table mutations.
- Calendar requires accessible text beyond color (e.g. `aria-current="date"` on active day).

## WhatDateTime adaptation

- Retain `ResultCard`'s brand colors/icons but allow a light `date-page` presentation so the answer and calendar read as one unit.
- Map active circle to `fern`/`ink+lime`, calendar header to `sage`, and body border to `ink/10`.
- Keep the current rounded-card language (up to 24-28px) only on the enclosing answer module; the inner calendar can use the measured 10-12px radius to stay compact.

