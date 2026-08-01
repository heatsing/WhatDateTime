# FAQ Specification

## Overview

- Reference screenshots: `faq-desktop-1440x1000.png`, `faq-mobile-390x844.png`.
- Existing target: `components/FAQ.tsx` and `buildFAQs` in `lib/seoGenerator.ts`.
- Reference interaction model: static; all answers visible.

## Exact desktop styles

- FAQ content width: 728px; transparent, no border/card/padding.
- Section H2: 22px/33px, 600, `#4b4b4b`, `margin:40px 0 10px`.
- FAQ list wrapper has no distinct styling.
- Each item has no border/background/padding; first measured item 728x92.88px.
- Question H3: 19px/28.5px, 600, `#4b4b4b`, `margin:30px 0 10px`.
- Answer: 17px/27.2px, 400, black, `margin:10px 0`.

## Exact mobile styles

- Width 350px at x=20.
- H2 remains 22px/33px.
- Question: 18px/27px; wrapping can produce 54px height.
- Answer: 16px/25.6px; first measured answer 76.78px.
- First measured item height 140.78px.

## Content and schema

- Keep all questions/answers supplied by WhatDateTime's `buildFAQs` and editorial JSON.
- Keep `faqPageSchema(faqs)` sourced from the same array rendered on screen.
- Questions should answer calculation-specific intent, date-boundary behavior, calendar vs business days, and time-zone assumptions without copying reference wording.

## WhatDateTime adaptation

- The existing `<details>` component is accessible and compact. Preserve it by default.
- For closer visual fidelity, add a `variant="editorial"` that renders the same data as always-visible `<article>` blocks; no plus icon, border, shadow, or open/close animation.
- In either variant, use WhatDateTime `ink` headings and `ink/60` answers. Keep the section constrained to the existing `max-w-3xl`.
- If `<details>` remains, ensure all FAQ content is server-rendered in the DOM and avoid default-collapsing the direct-answer FAQ that carries the page's primary intent.

