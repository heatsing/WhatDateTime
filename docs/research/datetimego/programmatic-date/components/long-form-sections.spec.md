# Long-form Sections Specification

## Overview

- Existing target: `components/SEOContent.tsx` and `ContentSection` in `lib/seoGenerator.ts`.
- Interaction model: static editorial flow.
- Reference pattern: several narrow prose modules separated by ad space; WhatDateTime should use deliberate section spacing instead of ad placeholders.

## Exact base/desktop styles

- Content width: 728px at desktop; transparent background, no border/shadow/padding.
- H2: 22px/33px, 600, `#4b4b4b`, `margin:40px 0 10px`.
- H3: 19px/28.5px, 600, `#4b4b4b`, `margin:30px 0 10px`.
- Paragraph: 17px/27.2px, 400, black, `margin:10px 0`.
- Generic list: flex wrap, 17px/25.5px, no bullets/margin/padding. Full-width list items are 728x35.5px with `padding:5px 0`.
- Numbered steps list: `margin:24px 0`, `padding-left:40px`, counter-reset; desktop height for four reference items 317.94px.
- Step: position relative, width 100%, `padding:5px 0`; title 17px/25.5px, 600, `#0463ac`; description margin `0 0 10px`.
- Step marker `::before`: 24x24px circle, `left:-32px`, `top:5.6px`, `#0463ac`, white 14px/21px 700, inline-flex centered.
- Feature list uses the same full-width list rhythm. Accuracy and tips blocks have no special fill/border.

## Exact mobile styles

- Content: 350px at x=20.
- H2 unchanged at 22px/33px.
- H3 becomes 18px/27px.
- Paragraph becomes 16px/25.6px.
- Step list remains 40px-indented; item width 310px. Natural wrapping increases the four-item list to 437.94px.
- General lists are one column below 768px; at 768px global list items default to 50%, unless explicitly full-width.

## Original content structure for WhatDateTime

Extend the editorial data model rather than embedding prose in components:

- `calculation-basis`: concise formula and calendar caveat.
- `practical-scenarios`: 3-5 original uses relevant to the interval.
- `how-to-use`: three or four short steps; avoid repeating the calculator labels verbatim.
- `accuracy-notes`: leap years, month boundaries, DST/business-day caveats when relevant.
- `professional-context`: optional, only when useful; do not programmatically pad every page.

## Adaptation

- The current three-card `SEOContent` is more brand-forward but much wider/denser than the reference. Add a vertical editorial variant constrained to roughly `max-w-3xl` (768px).
- Keep WhatDateTime display font for headings and brand icons only where they add scanning value. Preserve 16-17px body size and ~1.6 line-height.
- Use `mist` or a subtle `ink/5` border for accuracy callouts; avoid copying the reference's unstyled prose wholesale.
- Do not recreate ad-sized gaps. A consistent 48-72px section rhythm is sufficient.

