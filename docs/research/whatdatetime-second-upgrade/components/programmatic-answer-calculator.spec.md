# Programmatic answer and calculator specification

## Targets

- `components/direct-date-answer.tsx`
- `components/CalculatorBox.tsx`
- Interaction: server answer plus client calculator.

## Direct answer

- Narrow to 728-768px and remove the oversized enclosing card appearance.
- Center query prompt, primary answer, and calendar.
- Calendar stays semantic, six weeks, Sunday-first, with one `aria-current=date` result.
- Formula becomes a restrained full-width strip.
- Start/result comparison becomes two plain columns on desktop and stacked blocks on mobile.
- Preserve `data-content-stage=direct-answer`, extractable `font-display` result paragraph, and semantic `<time>`.

## Calculator

- Use a pale-blue compact panel below the answer.
- Keep 48px controls and current Number/Unit/Starting date capabilities.
- On desktop use a compact grid; on mobile stack fields.
- Result is a concise strip below the form, not a competing half-width hero.
- Preserve deterministic initial result and current in-place calculation behavior.

## Constraints

- No date calculation duplication.
- No route, metadata, schema, canonical, or content-stage changes.
- 320px width must not overflow.

