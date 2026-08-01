# Programmatic Date Page Design Tokens

All target values below are measured computed styles or values confirmed in the loaded stylesheet.

## Typography

- Font stack everywhere: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- No web fonts were loaded (`document.fonts` was empty).
- Body default: 16px / 24px, weight 400.
- Paragraph: mobile 16px / 25.6px; desktop (`>=768`) 17px / 27.2px.
- H1: 28px / 33.6px, weight 700, `#6d6d6d`.
- H2: 22px / 33px, weight 600, `#4b4b4b`.
- H3: mobile 18px / 27px; desktop 19px / 28.5px; weight 600, `#4b4b4b`.
- Primary answer: mobile 32px / 32px; desktop 42px / 42px; weight 600, black.
- Form labels: 14px / 21px, weight 400, `#034071`.

## Reference palette

| Role | Exact target value |
|---|---|
| Header / strongest text | `#000000` |
| Canvas | `#ffffff` |
| H1 muted | `#6d6d6d` |
| H2/H3/strong | `#4b4b4b` |
| Secondary time-zone text | `#3c3c3c` |
| Table header | `#686868` |
| Link | `#0e5489` |
| Link hover | `#34a0f3` |
| CTA | `#0463ac` |
| Calculator label | `#034071` |
| Calculator panel | `#e1f0fc` |
| Field border | `#b8dfff` |
| Calendar header/border | `#e6e6e6` |
| Calendar day | `#414141` |
| Calendar inactive | `#aaaaaa` |
| Calendar active | `#0693ff` with white text |
| Table divider | `#d5d5d5` |
| Menu focus | `#88dbff` |

## Geometry and spacing

- Global max shell: 1058px at `>=948px`; main 728px, gap 10px, rail 300px.
- Content inset: 20px below 948px; zero at/above 948px.
- Standard vertical article gap: 10px.
- Radius: 10px for calendar/calculator/content wrappers; 6px for controls.
- Calendar: desktop 364px wide (50% of 728), mobile 350px; header 37.59px; body 252px; total 289.59px.
- Calendar grid: inner width 332px desktop; seven 47.42px columns; cell height 34px; active disc 36x36px.
- Calculator: desktop 728x160px with 30px padding; mobile outer 390px, panel 370x294px with `30px 40px` padding.
- Controls: input/select 43px high; button 40px; desktop columns ~216px each; mobile 290px.
- Content headings: H2 margin `40px 0 10px`; H3 `30px 0 10px`; paragraphs `10px 0`.
- Table: `20px 0` margin, 6px cell padding, 1px bottom divider.

## Breakpoints

- `768px`: typography and multi-column layout transition.
- `948px`: desktop shell/rail and zero content side margins.

## WhatDateTime token translation

Preserve the measured hierarchy and density while using the existing brand tokens from `tailwind.config.ts`:

| Reference role | WhatDateTime token |
|---|---|
| black header / strongest text | `ink` (`#10212B`) |
| blue CTA/link | `fern` (`#166534`) |
| light-blue calculator panel | `mist` (`#F3F7F4`) with `sage` border |
| blue active calendar day | `fern`, or `ink` with `lime` text |
| muted calendar/header fill | `sage` (`#DCE9E1`) |
| focus/accent | `lime` (`#DFF35B`) with an ink-visible ring |
| canvas | current `#FBFCF9` body / white surfaces |

Use existing `font-sans`/`font-display` rather than adopting the reference's system-only branding. Reference font sizes, widths, and whitespace can be retained without copying its brand identity.

