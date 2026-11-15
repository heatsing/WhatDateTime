// Migration-only factual changes. The source Astro site and its stable SEO titles remain untouched.
export function adaptContent(page) {
  const replacement = {
    "changing the number, unit, or date creates a new calculation without changing this page's reference answer.": 'changing the number, unit, direction, or date updates the main answer, formula, calendar, and copy result together.',
    "Both entries use your device's local time zone.": 'Both entries use the selected time zone, detected from your device after loading.',
    'The starting date comes from your device when the page loads.': 'The starting date uses the current server time in the selected zone; your device zone is detected after loading.',
    'Calculations run in your browser without an account.': 'Calculations are processed by PHP without requiring an account or storing a calculation history.',
    'Calculations run in your browser and this tool has no database.': 'Calculations are processed by PHP. Calculator inputs are not stored as a calculation history.',
    "The entered values are interpreted in your device's local time zone, so browser time-zone rules apply when dates cross a daylight-saving transition.": 'The entered values use the selected IANA time zone. PHP applies its clock-change rules for the selected dates; repeated hours offer an earlier or later occurrence.',
    'Ambiguous or nonexistent custom starting times must be replaced with an unambiguous time; the Time Zone Converter can display both occurrences.': 'For a repeated starting hour, choose its earlier or later occurrence. A time skipped by a clock change is rejected.',
    'A result labeled Example uses the stated UTC starting time; it is not the current answer.': 'Before local-zone detection, the current server answer is explicitly labeled UTC. Fixed examples state their starting conditions separately.',
    'Static relative-date answers are labeled fixed UTC examples. Once the page loads, live calculations use the device clock and time zone; custom starting conditions remain fixed until reset.': 'Initial answers are calculated in PHP at request time and label the UTC reference zone. Browser time-zone detection updates the same calculation state; custom inputs stay fixed until reset.',
    'Static relative-date answers are labelled Example and use their stated UTC starting conditions. They are not the current date. After JavaScript loads, the page uses the device clock and IANA time zone.': 'Initial answers use the current server time in UTC. Once the browser identifies a local IANA time zone, PHP recalculates the result in that zone. Fixed examples are labeled with their starting conditions.',
    'Date arithmetic is implemented with date-fns, using Gregorian calendar dates supplied by the browser or the static build reference time.': 'Date arithmetic uses PHP DateTimeImmutable with explicit Gregorian calendar rules. Month and year offsets clamp to the last valid target date. Cross-language fixtures compare the PHP engine with the original date-fns implementation.',
    'City conversions use IANA identifiers such as America/New_York and Europe/London through date-fns-tz and the JavaScript runtime\'s time-zone data.': 'City conversions use IANA identifiers such as America/New_York and Europe/London through the server PHP time-zone database. Offsets, clock transitions, and conversion tables are evaluated for the selected date.',
    'WhatDateTime calculators are designed to run in the browser without requiring an account or storing calculator inputs in a site database.': 'WhatDateTime calculators use PHP without requiring a visitor account or storing calculator inputs as a calculation history. Countdown targets can be saved in the visitor\'s browser.',
    'Dates, times, amounts, and selected zones entered into the calculators are processed in the browser for the requested result.': 'Dates, times, amounts, and selected zones are sent to this website\'s PHP calculator endpoint to produce the requested result.',
    'static SEO pages': 'server-rendered tool pages',
  };
  const visit = value => typeof value === 'string' ? Object.entries(replacement).reduce((text, [from, to]) => text.replaceAll(from, to), value)
    : Array.isArray(value) ? value.map(visit)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, ['title', 'description', 'h1', 'metadataTitle', 'seoDescription', 'slug', 'path'].includes(key) ? child : visit(child)]))
    : value;
  return visit(page);
}
