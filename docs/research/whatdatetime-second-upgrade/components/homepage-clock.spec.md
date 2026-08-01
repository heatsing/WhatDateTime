# Homepage clock specification

## Targets

- `components/live-clock.tsx`
- `app/page.tsx`
- Interaction: time-driven clock plus click-driven 12/24-hour toggle.

## Structure

- Compact centered intro.
- A narrow instrument shell containing digital time/date/zone and a true analog face.
- Analog face uses 12 numerals, hour/minute/second hands, center pin, and accessible decorative semantics.
- Quick calculator follows in the same shell and remains visible in the first desktop viewport.

## Exact behavior

- One `Date | null` state updates every second.
- Hour angle `(hour % 12) * 30 + minute * .5`.
- Minute angle `minute * 6 + second * .1`.
- Second angle `second * 6`.
- Server placeholder reserves final dimensions; no hydration mismatch or layout shift.

## Responsive

- Desktop: digital details and 168-184px analog face sit side by side; calculator is adjacent or immediately below within a maximum 896px shell.
- Tablet: preserve two-column clock/calculator when readable.
- Mobile: clock content stacks; analog face 152-168px; calculator follows without horizontal overflow at 320px.

## Visual rules

- White surface, 1px neutral border, 10-12px radius, no shadow.
- Digital time 42-48px with tabular numerals.
- Blue seconds hand; dark hour/minute hands.
- Preserve existing labels, quick actions, URLs, metadata, and JSON-LD.

