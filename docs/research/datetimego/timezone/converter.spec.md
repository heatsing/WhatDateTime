# Timezone converter specification

## Purpose

An editable instant converter for a fixed programmatic city pair, backed by the current `TimezoneSEOPage` (`fromCity`, `fromZone`, `toCity`, `toZone`). Target integration point: `TimezoneForm` in `components/CalculatorBox.tsx`.

## Structure

1. Compact heading and helper text.
2. Native `datetime-local` input labeled with the origin city.
3. Read-only origin and destination zone cards.
4. Primary “Convert time” submit button.
5. Optional swap link/button only when a reverse slug exists.

## Layout

- Desktop: retain current split calculator/result shell; form and result are adjacent.
- Mobile: form first, result second; 20 px page gutters and full-width 48 px controls.
- Use current WhatDateTime fields (`h-12`, `rounded-xl`, `bg-mist`, `border-ink/10`) and dark CTA; do not copy DateTimeGo blue.

## State and behavior

- Initialize with build-safe markup, then hydrate to current time in the origin zone as today’s component already does.
- Submit: `fromZonedTime(dateTime, fromZone)` then format in both zones.
- DST comes from the selected date and IANA zone rules.
- Validation: required valid local datetime; no silent fallback.
- `aria-live` belongs on the result, not the whole form.

## Original copy guidance

Use short WhatDateTime language such as “Choose a date and time in {fromCity}” and “See the matching local time in {toCity}.” Do not reuse DateTimeGo explanatory sentences.
