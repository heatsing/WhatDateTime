# Compact Calculator Specification

## Overview

- Reference screenshots: `calculator-clock-desktop-1440x1000.png` and `calculator-clock-mobile-390x844.png`.
- Existing target: `components/CalculatorBox.tsx`.
- Interaction model: form submit/navigation on the reference; live in-place calculation in WhatDateTime today.

## Exact desktop styles

- Panel: 728x160px; `background:#e1f0fc`; radius 10px; padding 30px; no border/shadow.
- Heading: 16px/24px, 600, `#034071`, centered, `margin:0 0 12px`.
- Form/fieldset: 668x64px. Fieldset is flex row, `align-items:flex-end`, `justify-content:space-between`, `column-gap:1.5%` (~10px), row gap 15px.
- Three columns: 215.98px, 216px, 215.98px; first two 64px high, button column 40px.
- Label: block, 14px/21px, 400, `#034071`, centered.
- Input/select: 43px high, full width, white, `1px solid #b8dfff`, radius 6px, padding 10px, 14px text, centered.
- Button: 40px high, full width, padding 8px, radius 6px, `#0463ac`, white 16px/24px 600.

## Exact mobile styles

- Outer: 390x294px.
- Panel: 370x294px at x=10; `margin:0 10px`; `padding:30px 40px`.
- Inner form width: 290px.
- Fieldset: column, 198px high, 15px row gap.
- Each control/label column is 290px; input/select 43px, button 40px.
- No typography or control-color change from desktop.

## States and behavior

- Button hover: opacity 1 -> .8; background stays `#0463ac`.
- Submit requires amount 1-100000. JavaScript prevents native submit and assigns `window.location = '/' + amount + '-' + period`.
- Period selection has no immediate visual result.
- Inputs use native focus/validation behavior; menu summary is the only custom focus-visible rule in the target.

## WhatDateTime implementation guidance

- Preserve the existing `CalculatorBox` discriminated union and current field set, including optional starting date; do not narrow its functionality to match the reference.
- Introduce a compact date-page layout variant: two input columns and a full-width starting-date row on desktop, stacked on mobile. Keep 48px WhatDateTime touch targets rather than reducing to the target's 40/43px.
- Keep in-place result updates. If users change amount/unit away from the current canonical query, optionally expose “Open result page” using an existing slug rather than silently redirecting every submission.
- Use `mist`/`sage` for the panel and fields, `ink` or `fern` for CTA, existing rounded-xl radii, and `focus:ring-2` behavior.
- The result/calendar component should not be nested as the right half of this compact panel; show direct answer first, then calculator, matching the reference information order.

