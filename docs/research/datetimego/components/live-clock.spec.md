# LiveClock Specification

## Overview

- Target file: `components/live-clock.tsx`
- Desktop reference: `docs/design-references/datetimego/homepage-desktop.png`
- Mobile reference: `docs/design-references/datetimego/homepage-mobile-top.png`
- Interaction model: time-driven, plus a 12/24-hour toggle

## DOM Structure

The clock card contains a small current-time label and 12/24-hour control,
followed by a responsive two-column area. The left column contains the digital
time, full date, and time zone. The right column contains a circular analog
clock with twelve hour numerals, three hands, and a center pin. Mobile stacks
the digital and analog displays vertically.

## Reference Styles

- Reference digital time: 44px, weight 600, line-height 44px on mobile.
- Reference analog face: 200px square, white background, 8px gray border,
  circular radius.
- Reference hour hand: 8px by 45px, dark, rounded.
- Reference minute hand: 8px by 61px, dark, rounded.
- Reference second hand: 4px by 76px, red, rounded.
- Reference mobile content width: 350px inside a 390px viewport.

## WhatDateTime Adaptation

- Preserve the current `bg-ink`, lime accent, rounded card, noise texture,
  Manrope display font, and existing responsive spacing.
- Use a light analog face for contrast inside the dark card.
- Derive digital time and all three hand angles from one `Date` state.
- Hour angle: `(hours % 12) * 30 + minutes * 0.5` degrees.
- Minute angle: `minutes * 6 + seconds * 0.1` degrees.
- Second angle: `seconds * 6` degrees.
- Keep fixed dimensions for all initial placeholders to avoid layout shift.
- Avoid hydration mismatch: render deterministic placeholders on the server,
  then initialize browser time in `useEffect`.
- Respect reduced-motion preferences; the clock does not require animation
  transitions because it updates in one-second steps.

## Responsive Behavior

- Desktop: digital display and analog face are side by side.
- Tablet: retain side-by-side layout when there is enough width.
- Mobile: stack the analog face below the date and time-zone labels.
- The digital digits must not overflow at 320px viewport width.

## Content

- Label: `Your local time`
- Loading date: `Finding your local date…`
- Loading zone: `Local time zone`
- Toggle labels: `12-hour` and `24-hour`

