# Related Date Table Specification

## Overview

- Reference screenshots: `related-table-desktop-1440x1000.png`, `related-table-mobile-390x844.png`.
- Existing target: `components/RelatedLinks.tsx`.
- Interaction model: static table with first-column links; dates refresh every 60s on relative day pages.

## DOM model

- Section H2 and short original description.
- Semantic `<table>` with two columns: calculation phrase and formatted result.
- Nearby intervals span current amount minus five through plus five, clamped to valid range.
- Current interval row receives a visual/current flag.

## Exact desktop styles

- Section width 728px; no surface fill.
- Table: 728x462px in capture, width 100%, `margin:20px 0`, `padding:6px`, `border-collapse:collapse`, 1px `#d5d5d5` bottom border.
- Header row height 38px.
- TH: first column 286.56px, second gets remaining width; 17px/25.5px, 600, `#686868`, left aligned, 6px padding, bottom border.
- TD: 17px/25.5px, 400, black, 6px padding, 1px `#d5d5d5` bottom border; typical row 38.5px.
- Link: `#0e5489`, hover `#34a0f3`, no underline.
- Current row/cells: 700 weight; no background highlight.

## Exact mobile styles

- Section/table width: 350px at x=20.
- Table height: 708px because dates wrap.
- TH: 16px/24px, first column 136.91px, 6px padding, typical height 36.5px.
- TD: 16px/24px, typical row height 61px, 6px padding.
- The table does not horizontally scroll or collapse to cards; both columns remain visible and wrap.

## WhatDateTime adaptation

- Reuse `getRelatedPages`, `getRelativePhrase`, and `getPageResult`; do not generate a second independent link set.
- Add `aria-current="page"` to the current link/row cue and use `font-bold` plus a subtle brand tint (`sage/50`) rather than color alone.
- Prefer a table variant for relative-date pages and retain the existing dark card grid for time-zone/difference pages where comparison fields differ.
- Keep mobile two-column semantics but set a stable first-column fraction near 42%; allow wrapping and use `overflow-x:auto` only below approximately 340px.
- Use `ink/10` dividers, `fern` links, and a `mist`/white surface consistent with WhatDateTime.

