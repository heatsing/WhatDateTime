# Reference Findings

## Page topology

### Days-from-today calculator

1. 50px black global header with menu, centered wordmark, and search.
2. One-line breadcrumb.
3. Pale-blue calculator card containing H1, short description, and one compact
   form row.
4. Guidance: numbered three-step list, use cases, manual method.
5. Ten-row instant-reference table linking 1 through 10 days.
6. Professional-context copy.
7. Two-column directory of ten frequent calculations.
8. FAQ and minimal legal footer.

At 1440px the content is deliberately narrow: a 1038px outer container begins
at x=201, while the primary article column is 728px. The empty right rail and
very large vertical gaps are ad inventory. Preserve the narrow readable column,
but do not reproduce ad-driven whitespace.

Submitting `30` while `days from today` is selected navigates to
`/30-days-from-today`; it does not render an inline result on the hub. The
result page leads with the question and answer, repeats a prefilled calculator,
adds explanatory sections, then exposes a nearby-result table from 25 through
35 days and the frequent-calculation directory.

### Time-difference result page

1. Header and breadcrumb.
2. Answer-first block: query H1, large human duration, and a small source-range
   line.
3. Pale-blue calculator card with two time groups and one full-width action.
4. Two-column start/end detail block with weekday, large local time, date, and
   localized full timestamp.
5. Explanation and minute conversion.
6. Step-by-step hour breakdown table.
7. Guidance/use cases/methodology.
8. Nearby start-time directory table, FAQ, popular-calculation directory.

The inspected example displays `1 hour and 50 minutes` for 9:50 PM to 11:40
PM. The form uses six native selects: hour, minute, and AM/PM for each endpoint.
The page is a programmatic answer page rather than a generic empty calculator.

## Reference design tokens (computed)

| Token | Desktop reference | Mobile reference |
| --- | --- | --- |
| Typeface | system UI: `-apple-system`, BlinkMacSystemFont, Segoe UI, Roboto | same |
| Body | 16px / 24px, #000 | same |
| Header | 50px high, #000 | 50px high, #000 |
| Primary article | 728px wide | 350px wide, 20px side gutters |
| Calculator card | #e1f0fc, radius 10px, padding 30px | 370px wide at x=10, padding 30px 40px |
| Nested time group | #c6e2f9, radius 10px | 290 x 118px |
| H1 in calculator hub | 28px / 33.6px, 700, #034071 | same; wraps to two lines |
| Result-page H1 | 28px / 33.6px, 700, #6d6d6d | same |
| Large duration | 48px / 48px, 600 | 44px / 44px, 600 |
| Intro | 15px / 24px, #034071, 30px bottom margin | same |
| Section H2 | 22px / 33px, 600, #4b4b4b; 40px top/10px bottom | same |
| Label | 14px / 21px, #034071 | same |
| Input/select | 43px high; white; 1px #b8dfff; radius 6px; 10px padding; 14px | same |
| Button | 40px high; #0463ac; white; radius 6px; 16px/24px, 600 | same |
| Reference table | 728px; 6px cell padding; 20px vertical margin | 350px; rows remain two-column |

Desktop hub card geometry is 728 x 247.6px at x=201. Its form is one 668px
row of three approximately 216px controls. Mobile card geometry is 370 x
439.2px at x=10; the form is 290 x 198px and controls stack at full width.

Desktop time-form geometry is 728 x 245px, with 30px padding and a 668px
full-width button. At mobile it becomes 370 x 402px; the fieldset switches to
column flow with a 15px row gap, two 290 x 118px time groups, then a 290 x 40px
button. Native selects are about 80px wide on mobile.

## Behavior and responsive observations

- Native numeric/select controls provide keyboard and mobile-picker behavior.
- The hub selector covers seconds, minutes, hours, days, weeks, months, and
  years in past and future; the inspected result page exposes a smaller subset.
- Successful hub calculation is URL-producing navigation, enabling shareable,
  indexable answers and a prefilled state.
- Desktop time groups sit side by side; mobile stacks them without horizontal
  scrolling. Each group keeps hour/minute/period on one row.
- The mobile global navigation remains a 50px bar; page content uses 20px
  gutters, while calculator cards intentionally use only 10px outer gutters.
- Tables remain two-column at 390px. Long date text wraps rather than creating
  an overflow scroller.
- Nearby and popular directories are actual links, not buttons or client-only
  filters.
- The target inserts ad-sized blank regions between sections. These are not
  functional layout requirements.

