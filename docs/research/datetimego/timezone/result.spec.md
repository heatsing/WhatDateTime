# Timezone result specification

## Purpose

Make the converted answer scannable before editorial content. Reuse `ResultCard` rather than introduce a competitor-styled result block.

## Content model

- eyebrow: `{toCity} local time`.
- primary: destination time.
- secondary: full destination date plus active abbreviation.
- detail: origin city/time and a concise DST-aware offset statement.

## Visual

- Existing `bg-ink` result stage, `text-lime` eyebrow, white display result, white/50 detail.
- Preserve decorative noise and lime glow.
- Desktop minimum height 288 px; mobile result follows form and should not look like a detached page hero.

## Behavior

- `aria-live="polite"`.
- Recompute from the same instant as the form and comparison/table components.
- Avoid ambiguous abbreviations as the only identifier; always show city and IANA-derived offset/zone context.
