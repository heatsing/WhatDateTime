# Page topology

## Programmatic result page (`/100-hours-from-now`)

1. Black 50 px site header with brand and search.
2. Breadcrumb row.
3. Direct-answer block: H1, result label, large live time, date, clock visualization, and one-sentence local-zone context.
4. Embedded converter card.
5. Long-form explanatory sections.
6. Nearby-result table (target value ±5).
7. Frequent-calculation links.
8. Static FAQ list.
9. Footer links.

At 1440 px, primary content is a 728 px column starting near x=201 with an ad/sidebar reserve to the right. At 390 px, content is 350 px wide with 20 px side margins. Sections remain in document flow; no sticky or scroll-driven component was observed.

## Generic calculator (`/hours-from-now-calculator`)

1. Shared header and breadcrumb.
2. H1.
3. Converter form.
4. Instructional content.
5. Ten-row instant-reference table.
6. Professional-context content.
7. Frequent links.
8. FAQ and footer.

## WhatDateTime assembly recommendation

Preserve the existing programmatic route and data order: hero/breadcrumb → `CalculatorBox` → editorial content → related links → FAQ. Enrich only the timezone variant inside those stages:

1. Hero direct answer with pair identity and offset summary.
2. Converter with editable instant plus fixed route pair (and optional swap that navigates to the reverse slug).
3. Two-place comparison row.
4. Nearby-time table generated for the selected instant.
5. Related pair links grouped by same origin, same destination, and popular routes.
6. Original timezone/DST FAQ.
