# Time comparison specification

## Source pattern and adaptation

DateTimeGo's programmatic result compares a current local instant with a resulting local instant in prose and clock displays; it does not provide city-pair conversion. Adapt that comparison into two explicit WhatDateTime place cards.

## Structure

- Section title: original WhatDateTime wording, e.g. “The same moment in both cities.”
- Origin card: city, local time, date, zone abbreviation, UTC offset.
- Destination card: same fields.
- Center/inline relationship: signed offset difference and day relation (`same day`, `previous day`, `next day`).

## Layout

- Desktop: two equal cards in a two-column grid with a compact relationship pill between or above them.
- Mobile: vertical stack; relationship pill remains between cards to preserve reading order.
- Use white cards on `mist`, ink typography, fern labels, lime offset pill, existing 1.5 rem radius.

## Data

Derive both cards from one UTC instant with `formatInTimeZone`. Never compute by manually adding fixed hours; offsets can change with DST. The data layer already supplies IANA zones.
