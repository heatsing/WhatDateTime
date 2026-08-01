# Design tokens

## Extracted DateTimeGo values (1440 px unless noted)

- Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Body: 16 px / 24 px, weight 400, black.
- H1: 28 px / 33.6 px, weight 700, `rgb(109,109,109)`.
- H2: 22 px / 33 px, weight 600, `rgb(75,75,75)`; standard section margin `40px 0 10px`.
- H3/FAQ question: 19 px / 28.5 px, weight 600, `rgb(75,75,75)`.
- Header: 50 px high, `rgb(0,0,0)`.
- Main content width: 728 px desktop; 350 px mobile with 20 px margins.
- Converter: `rgb(225,240,252)`, radius 10 px, 30 px padding desktop; mobile 30 px 40 px, 370 px outer width with 10 px margins.
- Inputs/selects: 14 px, white, 43 px high, 10 px padding, 1 px solid `rgb(184,223,255)`, radius 6 px.
- CTA: `rgb(4,99,172)`, white, 16 px/24 px, weight 600, 40 px high, 8 px padding, radius 6 px.
- Desktop converter controls: ~216 px each in a single row. Mobile: 290 px each, stacked.
- Table: 728 px desktop / 350 px mobile, 6 px padding, 20 px vertical margin.

## Brand-safe WhatDateTime mapping

Do not import DateTimeGo's blue/gray palette. Retain existing WhatDateTime tokens and component language:

- primary surface: `bg-white`; supporting surface: `bg-mist`.
- primary text/result shell: `text-ink` / `bg-ink`.
- accents: `fern` for labels/actions and `lime` for highlights.
- existing radii: `rounded-xl`, `rounded-[1.5rem]`, `rounded-[1.75rem]`.
- existing shadows: `shadow-card`, `shadow-soft`.
- existing display typography: `font-display` and current tracking values.

Borrow information density and responsive topology, not competitor colors, type choices, or prose.
