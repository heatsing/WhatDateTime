# WhatDateTime utility UX refinement — November 14, 2026

## Baseline and scope

Started from clean `fix/date-time-consistency-20261113` at `f75d32b`.
Read the operating files, existing implementation and the November 13 recovery /
November 14 deployment reports. The project remains Astro with React islands.
The previous UTC-example / browser-live architecture, shared calculation state,
business-day tool, countdown storage and exact-instant share format were reused.
Public cached HTML was not treated as evidence about local implementation.

## Changes

- Relative tools now preview valid input changes in the main answer, formula,
  calendar, timeline and nearby current row together. Invalid drafts remain in
  the inputs; outputs explicitly identify the last valid calculation and copying
  is disabled until corrected. Reset restores the original page amount, unit,
  direction and current device time. Preview ticks do not emit analytics.
- Empty numeric drafts no longer silently become zero in the date calculator,
  year tools or weeks-and-days tool. Calendar offsets require whole numbers;
  hour offsets allow fractions representing whole minutes. Both are bounded at
  10,000. Date-result range and skipped/repeated wall-time checks remain active.
- Fixed date-difference landing answers are explicitly labeled with their default
  date pair. The separate editable comparison identifies its applied dates and
  rejects invalid inputs instead of rendering NaN. The generic difference tool
  also validates unambiguous local times and displays its applied conditions.
- Fixed the shared hour engine truncating fractional hours, which had made the
  midpoint of a one-hour timeline wrong. Hour calculation guidance now precedes
  the timeline and comparison table. Existing useful tables/calendars remain.
- Combined nearby hour recommendations into one table and removed the repeated
  More Time Questions block. Generic tools retain one Related Calculators group;
  the sidebar instead links methodology, data sources and corrections. Removed
  the duplicated practical-scenario paragraph and obsolete relative-tool guide
  claiming custom inputs never update the main answer.
- Header/home hour-category links now open the existing directories. Add or
  Subtract Hours opens the functioning hour calculator/directory, not a mislabeled
  one-hour answer. Removed the false generic Calculators breadcrumb pointing at
  the Date Calculator. Business-day and date-difference destinations were already
  correct and are retained. No duplicate tool route was created.
- Countdown derives remaining time from target minus current timestamp, with
  immediate focus/visibility/pageshow recovery. It no longer announces completion
  a fractional second early. Display-zone changes convert the displayed fields
  without moving the started target instant, including after Start is pressed.
  Pending edits are explicitly separate from the started target used by Save and
  Share. Saved and shared UTC instants remain unchanged across zones and reloads.
- City-pair first answers now follow the planner's actual selected time rather
  than always showing a separate 9 AM answer. Both repeated-hour occurrences are
  shown with their respective offsets. Empty planner inputs no longer silently
  reset to today; invalid date tables are hidden. Independent live city clocks
  are labeled separately. FAQs refer to the selected date and source offset.
- Shared tool results precede inputs. Hour answers include a Change inputs jump
  link; starting/result panels remain side by side on phones. Inputs have bounded
  widths and readable mobile text; copy has a 44px touch target and feedback.
  Countdown uses tabular numerals, avoids announcing every second to screen
  readers, and permits long day counts without page overflow.

The existing brand, colors, effective URLs, metadata titles/descriptions,
canonical and index eligibility policy are retained. Material revision dates
advance to November 14 for changed families/tools, not ordinary clock refreshes.
Accessible routes remain **10,263**; indexable/static/sitemap URLs **2,238**;
existing noindex on-demand routes **8,025**; sitemap shards **13**. Crawl depth
remains six. No production refresh/upload or GSC submission was performed.

## Verification

Passed on the final application source:

- `npm run typecheck` — zero errors/warnings.
- `npm run lint` — zero errors/warnings.
- `npm test` — calendar/month-end/leap-day/weekend/zero rules, fractional hours,
  blank/range validation, countdown terminal-second boundary, DST gaps/folds,
  cross-zone SSR and existing regression fixtures.
- `npm run build` and `npm run seo:check` — direct inspection of 2,238 static
  HTML documents and 20 on-demand samples, all 10,263 metadata records, canonical,
  robots, JSON-LD, sitemap eligibility and crawlable paths.
- `npm run test:ssr` — 44 real-navigation pages, seven genuine 404s, HEAD,
  query canonicals and existing alias behavior against local Wrangler.
- `node scripts/ux-browser-check.mjs` — 42 checks in an isolated agent-browser
  session: preview/input/reset/formula/copy agreement, keyboard calculation and
  copy, protected inputs/focus during refresh, weekend/calendar highlights,
  leap-day/month-end rules, countdown save/share/fresh navigation/display-zone
  preservation, simulated three-hour background recovery, timezone selection,
  DST gap/fold, auxiliary blank fields and zero values. No runtime errors.
- Seven representative routes at 320, 390, 768 and 1440px had no page-level
  horizontal overflow. The browser skill was also used to inspect mobile
  screenshots, including a 320px datetime input. Tables retain their own overflow
  containers. This is not a pixel-perfect regression or a production CrUX claim.

Evidence: `reports/ux-browser-check.json`, `reports/http-smoke.json`. Screenshots
are ignored local artifacts under `dogfood-output/ux-20261114-*.png`.
Node's existing module-type inference warning is unchanged; no dependency was added.

## Remaining limits and preview

Initial static answers remain clearly labeled fixed UTC examples; live answers
require the browser clock. This intentionally retains the existing low-request
Cloudflare delivery model instead of daily sitewide deployment. GSC indexing,
traffic recovery, CDN history and production field performance were not measured.
The separately tracked framework security upgrade remains outside this pass.

Preview the final build, including on-demand routes:

```powershell
npm run build
npx wrangler dev --local --port 8790 --show-interactive-dev-session false
```

Open `http://127.0.0.1:8790`. With that server running, `npm run test:ssr` and
`node scripts/ux-browser-check.mjs` repeat the checks (the latter requires the
agent-browser CLI; `AGENT_BROWSER_BINARY` may override its executable path).

This pass synchronizes source on the existing repair branch; it does **not**
deploy. Production remains the previously documented `fff0345` application
release. An intentional subsequent release uses `npm run deploy` after the gates
pass, with `refresh_dates` left off. Do not deploy the older `main` branch without
first including the reviewed repair commits.
