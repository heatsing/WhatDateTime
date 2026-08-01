# WhatDateTime Core Calculator Specification

## Outcome

Adopt the reference site's answer-first hierarchy, compact form density,
shareable calculated URLs, and nearby-result navigation while retaining the
WhatDateTime visual system and original content. Reuse the existing
`ToolPageShell`, `CalculatorFrame`, `DifferenceCalculator`, `CalculatorBox`,
`RelatedLinks`, and FAQ primitives rather than introducing a parallel design
system.

## Current gap analysis

| Area | Current WhatDateTime | Recommended adaptation |
| --- | --- | --- |
| Tool-page hero | Centered 4xl/6xl marketing hero before the tool | Put the task and current answer above the fold; keep the eyebrow but reduce pre-tool vertical cost |
| Calculator | Polished two-panel form/result shell | Preserve it; make answer prominence and mobile ordering explicit across every calculator |
| Time difference | Two `datetime-local` fields; result is inside dark panel | Keep date-aware precision, but add a clear input-range summary and an optional time-only mode if product scope permits |
| Relative date | Programmatic page already has editable calculator | Keep canonical URLs; add nearby reference rows/directories directly after guidance |
| Guidance | Three cards followed immediately by FAQ | Add concise method, edge-case guidance, examples, and linked nearby results before FAQ |
| Internal links | Strong on programmatic pages, sparse on core tools | Add a reusable related-calculations directory to core tools |
| Mobile | Frame stacks at `lg`; roomy 24/32px padding | Keep touch-friendly 48px controls; reduce decorative/hero space so task + first result fit earlier |

## Reusable page shell

Recommended order for every core calculator route:

1. Breadcrumb.
2. Compact task header: WhatDateTime eyebrow, H1, one original sentence.
3. `CalculatorFrame` with form first in DOM and live result second.
4. Result-detail strip or cards (inputs interpreted, date/time zone, units).
5. Three-step usage guidance.
6. Calculation method and edge cases.
7. Nearby-result table or linked directory.
8. FAQ.
9. Cross-tool directory and footer.

Use a 1024px maximum shell and a 720-760px reading measure for prose/tables.
Desktop may keep the existing split calculator. Mobile stacks form then result;
do not place promotional copy between them. Avoid reserved ad gaps.

## Calculator form component

- Keep current 48px control/button height, 12px radius, ink text, mist fill,
  fern focus ring, and explicit labels.
- Use one predictable action per form. Enter submits; the button spans the form
  column on mobile.
- On a relative-date hub, support amount + period/direction. A successful
  calculation should navigate to an existing canonical WhatDateTime URL when
  that route exists; otherwise update inline without inventing an indexable URL.
- Keep `datetime-local` as the default for date-aware difference calculations.
  If a time-only mode is added, use two accessible groups with hour/minute/AM-PM
  fields or a native time input and an explicit `crosses midnight` control.
- Validate in place, preserve entered values, and never silently clamp without
  explaining the allowed range.
- Required focus states must be visible at 2px minimum. Minimum mobile target is
  44 x 44px; current 48px controls already pass.

## Results component

- Lead with a natural-language result (`1 hour 50 minutes`, or a full weekday
  and date) at 32-40px mobile and 40-48px desktop.
- Include an accessible live region with `aria-live="polite"`; do not steal
  focus after calculation.
- Follow the headline with a compact source summary: start, end, local time
  zone, and interpretation assumptions.
- Keep the current totals grid for days/hours/minutes/seconds. Add a dedicated
  start/end detail pair below the primary result when it aids verification.
- For relative-date pages, show weekday, full date, optional local time, and
  whether the interval counts calendar or business days.
- Server output must be deterministic; hydrate device-local time only after
  mount, as current components already do.

## Guidance and original content

Use new WhatDateTime copy with this concise pattern:

- `How to calculate`: three numbered actions.
- `How the result is interpreted`: calendar arithmetic, local time zone, DST,
  crossing midnight, inclusive/exclusive-day policy as applicable.
- `Common uses`: deadlines, schedules, payroll checks, travel, and planning.
- `Check your result`: a small worked example written for WhatDateTime.

Do not reuse DateTimeGo sentences or section titles verbatim. Keep prose useful
and compact; the reference site's ad-separated repetition is not a content goal.

## Internal-link directory

- Relative-date pages: show 5 values below and 5 above the current amount, plus
  common presets such as 7, 14, 30, 60, 90, 180, and 365 where valid.
- Time-difference pages: link nearby start/end combinations at 5- or 15-minute
  increments and the generic `/calculators/time-difference` tool.
- Core tools: include links to the other four WhatDateTime calculators.
- Render as semantic anchors in a table when comparing value/result pairs, and
  as a two- or three-column list for simple destinations.
- Desktop: 2-3 columns; mobile: one column for link cards, while compact
  two-column data tables may wrap cell content. Never depend on horizontal
  scrolling for primary links.
- Preserve all existing URLs and current 10,000-page programmatic set; this is
  a presentation and navigation upgrade, not a URL migration.

## WhatDateTime design mapping

| Reference role | WhatDateTime token |
| --- | --- |
| Black header / primary action | `ink` #10212B |
| Reference blue action/focus | `fern` #166534 |
| Pale-blue calculator surface | white card plus `mist` #F3F7F4 fields |
| Nested blue group | `sage` #DCE9E1 at restrained opacity |
| Accent/status | `lime` #DFF35B |
| Main text | `ink` #10212B |
| Radius | retain 12px controls and 28px calculator frame |
| Elevation | retain `shadow-soft` and `shadow-card` |
| Typography | retain WhatDateTime display/sans variables; do not switch to DateTimeGo system font |

## Mobile acceptance criteria (390 x 844)

- No horizontal overflow at 390px or 320px.
- Breadcrumb, H1, form labels, first control, and result relationship are clear
  in the first viewport; decorative hero space is subordinate.
- Form and result stack in DOM order; all controls remain at least 44px high.
- Time-only endpoint groups stack vertically, while their three compact fields
  remain on one row where 320px allows it; otherwise wrap as hour/minute then
  period without clipping.
- Nearby tables fit the content column and wrap long dates.
- Keyboard submission, native mobile pickers, focus visibility, and polite live
  result announcements are retained.

## Desktop acceptance criteria (1440 x 1000)

- Calculator and primary answer appear above the fold.
- Form/result split remains balanced within the existing max-width shell.
- Reading content is no wider than roughly 760px even when the calculator is
  wider.
- Related rows/directories expose at least 10 useful internal destinations
  without ad-like blank gaps.

