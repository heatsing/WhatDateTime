# Related links and nearby times specification

## Nearby-time table

DateTimeGo uses a two-column ±5 table. For WhatDateTime, generate a compact nearby-time comparison centered on the selected origin time:

- Rows: -2h, -1h, selected, +1h, +2h (five rows is enough on mobile).
- Columns: origin local time and destination local time; dates appear when the day differs.
- Highlight the selected row with lime/ink treatment.
- Table must be derived at render time from the shared instant; it should not create new URLs.

## Related route groups

Feed existing `getRelatedPages` output into three optional groups:

1. Same origin, other destinations.
2. Other origins to the same destination.
3. Popular city pairs.

Every link must resolve to an existing indexed slug. Retain the current dark `RelatedLinks` section and WhatDateTime labels; do not copy DateTimeGo link lists or descriptions.

## Responsive

- Desktop: 2–3 link columns.
- Mobile: single-column tap targets with at least 44 px height; allow the time table to use compact key/value rows if two time columns no longer fit.
