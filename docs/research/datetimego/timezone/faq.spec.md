# Timezone FAQ specification

## Structure

Reuse the existing `FAQ`/schema pipeline so visible questions and `FAQPage` JSON-LD stay identical. DateTimeGo displays all answers expanded; WhatDateTime may retain its current visual implementation as long as content is server-rendered and accessible.

## Original question themes

- How the selected local time is interpreted.
- Whether DST is included for the selected date.
- Why the city difference can change during the year.
- What happens when the converted date is the previous or next day.
- Why abbreviations can be ambiguous and city/offset context is shown.

Generate pair-aware answers from the two IANA zones, but do not claim transition dates unless calculated. Do not reuse DateTimeGo wording.

## Visual

Retain WhatDateTime section spacing (`px-5 py-16`, larger at `sm`) and brand typography. Questions should remain clearly separated and deep-link-safe if anchors are added later.
