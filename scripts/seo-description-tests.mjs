import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import {
  differenceMetaDescription,
  relativeMetaDescription,
  timezoneDescriptionFacts,
  timezoneMetaDescription,
} from "./seo-description.mjs";

// Independently specified facts: comparing data to its own generator alone
// would not catch incorrect arithmetic, DST assumptions, or date-line errors.
export function checkDescriptionFacts() {
  const relative = (amount, unit, direction = "future") => {
    const name = unit === "business-day" ? "business day" : unit;
    const suffix = direction === "past" ? "ago" : unit === "hour" ? "from now" : "from today";
    return relativeMetaDescription(
      { amount, unit, direction },
      `${amount} ${name}${amount === 1 ? "" : "s"} ${suffix}`,
    );
  };
  const relativeFixtures = [
    [1, "hour", "future", /60 minutes later/],
    [24, "hour", "past", /1 day earlier, with each day measured as 24 hours/],
    [49, "hour", "past", /2 days and 1 hour earlier/],
    [150, "hour", "past", /6 days and 6 hours earlier/],
    [82, "hour", "future", /3 days and 10 hours later/],
    [1, "day", "future", /tomorrow in your local calendar/],
    [1, "day", "past", /yesterday in your local calendar/],
    [3, "day", "past", /3 calendar days back, including weekends/],
    [14, "day", "future", /2 weeks ahead, on the same weekday/],
    [90, "day", "past", /12 weeks and 6 days back/],
    [6, "week", "future", /42 calendar days ahead/],
    [1, "month", "future", /1 calendar month, not 30 fixed days/],
    [194, "month", "future", /16 years and 2 months ahead/],
    [12, "month", "future", /1 year ahead/],
    [4, "year", "future", /48 calendar months/],
    [1, "business-day", "future", /next Monday-Friday date/],
    [5, "business-day", "future", /1 five-day workweek/],
    [11, "business-day", "future", /2 five-day workweeks and 1 weekday/],
  ];
  for (const [amount, unit, direction, expected] of relativeFixtures) {
    const description = relative(amount, unit, direction);
    assert.match(description, expected, `${amount} ${unit} ${direction}`);
    assert.doesNotMatch(description, /Find the exact local|with our free time calculator/);
  }
  assert.match(relative(5, "business-day"), /holidays are not excluded/);
  assert.match(relative(1, "year"), /February 29/);

  for (const [start, end, days, inclusive] of [
    ["2024-02-28", "2024-03-01", 2, 3],
    ["2026-03-01", "2026-02-28", 1, 2],
    ["2026-01-01", "2026-01-01", 0, 1],
    ["2026-03-01", "2026-03-15", 14, 15],
  ]) {
    const description = differenceMetaDescription({ start, end });
    assert.ok(description.includes(`${days} calendar day`));
    assert.ok(description.includes(`Counting both dates gives ${inclusive} day`));
    assert.doesNotMatch(description, /1 days|, or 0 days/);
  }
  assert.match(differenceMetaDescription({ start: "2026-01-01", end: "2026-01-16" }), /2 weeks and 1 day/);

  const zoneFixtures = [
    ["Berlin", "Europe/Berlin", "Brisbane", "Australia/Brisbane", [480, 540], "5 PM or 6 PM"],
    // Europe and the US change clocks on different weekends.
    ["New York", "America/New_York", "Rome", "Europe/Rome", [300, 360], "2 PM or 3 PM"],
    ["Washington DC", "America/New_York", "Denver", "America/Denver", [-120], "7 AM"],
    ["New York", "America/New_York", "Kathmandu", "Asia/Kathmandu", [585, 645], "6:45 PM or 7:45 PM"],
    ["New York", "America/New_York", "Toronto", "America/Toronto", [0], "9 AM"],
    ["Tokyo", "Asia/Tokyo", "Los Angeles", "America/Los_Angeles", [-1020, -960], "4 PM the previous day or 5 PM the previous day"],
    ["Honolulu", "Pacific/Honolulu", "Tokyo", "Asia/Tokyo", [1140], "4 AM the next day"],
    // Morocco's Ramadan offset is absent from a January/July-only sample.
    ["Accra", "Africa/Accra", "Casablanca", "Africa/Casablanca", [0, 60], "9 AM or 10 AM"],
  ];
  for (const [fromCity, fromZone, toCity, toZone, offsets, clocks] of zoneFixtures) {
    const page = { fromCity, fromZone, toCity, toZone };
    const facts = timezoneDescriptionFacts(page);
    assert.equal(facts.year, 2026);
    assert.equal(facts.sourceHour, 9);
    assert.equal(facts.sampledDates, 365);
    assert.deepEqual(facts.offsets, offsets, `${fromCity} to ${toCity}`);
    const description = timezoneMetaDescription(page);
    assert.ok(description.includes(`9 AM in ${fromCity} is ${clocks} in ${toCity} in 2026.`));
    if (offsets.length > 1) assert.match(description, /date|clock changes/);
  }
  console.log(`Description fact tests passed: ${relativeFixtures.length} relative, 5 date-difference, ${zoneFixtures.length} time-zone fixtures`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkDescriptionFacts();
}
