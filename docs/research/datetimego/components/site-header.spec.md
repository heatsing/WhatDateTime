# SiteHeader Specification

## Reference

DateTimeGo uses a compact black header with a left menu control, centered
wordmark, and right search control at desktop and mobile widths.

## WhatDateTime Adaptation

- Keep the WhatDateTime wordmark and existing calculator destinations.
- Use a 56px black sticky header with white controls and lime brand accent.
- The left control opens a crawlable calculator menu.
- The right control opens a compact search form that recognizes existing
  numeric date/time phrases and otherwise sends visitors to the date tool.
- Do not introduce a `/search` route or any new indexable URL.
- Close panels after navigation and expose expanded state through ARIA.
- Desktop and mobile use the same visual topology.

