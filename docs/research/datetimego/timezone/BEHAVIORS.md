# Behaviors

## DateTimeGo observations

- Interaction model: form-submit navigation, time-driven live values, standard link navigation; no tabs, accordions, sticky sections, or scroll-triggered animations observed.
- The generic form exposes a numeric input and a period select. A successful calculation is intended to land on the corresponding programmatic URL rather than reveal an inline panel.
- Programmatic values and nearby-table times are generated from the same current local instant. The page identifies the browser/device zone in explanatory context and accounts for DST via local browser rules.
- The top result clock updates with time; screenshots are therefore evidence of layout, not stable copy values.
- Desktop converter fields sit in one row. At 390 px they stack input → select → button, each 290 px wide inside a 370 px card.
- Tables retain two columns on mobile; rows become taller because the time/date cell wraps.
- FAQ entries are always expanded text, not interactive disclosures.
- Links use normal pointer/hover affordances. No meaningful motion beyond live-clock updates was detected.

## WhatDateTime behavior adaptation

- Keep programmatic city-pair routes statically generated and canonical.
- Convert inline on submit using existing `fromZonedTime`/`formatInTimeZone`; do not navigate away when only the instant changes.
- If a swap control is added, navigate to the existing reverse-pair slug so metadata and pair copy remain truthful.
- Update result, comparison cards, and nearby table from one shared `instant` state; result region remains `aria-live="polite"`.
- Resolve offsets for the selected date, not only at build time, so DST differences can change correctly.
- On mobile, stack form/result and comparison cards; preserve a horizontally safe two-column table or switch rows to key/value cards below ~420 px.
