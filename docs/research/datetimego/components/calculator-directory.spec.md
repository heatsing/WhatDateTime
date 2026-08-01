# CalculatorDirectory Specification

## Overview

- Target file: `components/calculator-directory.tsx`
- Reference: DateTimeGo homepage `Calculate Dates and Times` directory
- Interaction model: static crawlable links

## Structure

Render an introductory heading followed by category groups for days, hours,
weeks, months, years, business days, date differences, and time zones. Each
group contains a short explanation and a two-column list of representative
existing WhatDateTime URLs.

## WhatDateTime Adaptation

- Use only URLs from `data/tools/index.json`; do not create routes.
- Preserve the established mist background, ink text, fern links, rounded
  corners, and Manrope headings.
- Use real anchor elements through Next.js `Link` for crawlability.
- Keep link text descriptive and derived from the destination slug.
- Desktop: two category cards per row. Mobile: one card per row with a
  two-column link list where width allows.
- Limit the homepage directory to representative links so it remains useful
  rather than becoming a 10,000-link dump.

