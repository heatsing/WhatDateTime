# WhatDateTime comparison and implementation notes

## Current strengths

- `data/timezone.json` already models large numbers of city pairs with IANA zones.
- `app/[slug]/page.tsx` statically renders canonical metadata, direct calculator, editorial content, related links, FAQ, and schemas.
- `components/CalculatorBox.tsx` already converts fixed city pairs with `fromZonedTime` and `formatInTimeZone`.
- `components/ResultCard.tsx` provides a much stronger brand-specific direct-answer surface than DateTimeGo's plain layout.
- The generic `/calculators/timezone-converter` supports selectable zones independently of the programmatic pair pages.

## Gaps worth closing

- Programmatic timezone results are currently one formatted sentence; split time/date/zone into a clearer hierarchy.
- Add an explicit two-city same-instant comparison so users can verify both sides.
- Add a small nearby-time table for meeting planning.
- Group related pages by origin/destination intent rather than a single undifferentiated set.
- Expand pair-aware FAQ coverage while keeping copy original.
- The generic converter has only a short curated 17-zone list, while programmatic data supports many more zones; future unification should draw from a shared curated city/zone registry.

## Do not clone

- No DateTimeGo city-to-city product exists in the inspected surface, so there is no route or copy to reproduce.
- Do not adopt its black/blue/gray visual system, long-form prose, generated frequent-link wording, or live values.
- Preserve current WhatDateTime URLs, data files, SSG behavior, schema pipeline, and brand tokens.
