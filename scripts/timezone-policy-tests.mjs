import assert from "node:assert/strict";
import {
  cities,
  getCity,
  getPairCities,
  getPageIndexEligibility,
  getCityPairIndexEligibility,
} from "../lib/indexEligibility.ts";
import { allPublicSlugs, allIndexableSlugs } from "../lib/siteInventory.ts";
import {
  businessOverlap,
  citySeason,
  conversionTable,
  dateShift,
  localISO,
  offsetMinutes,
  pairSeasons,
  resolveWallTime,
  yearTransitions,
} from "../lib/timezoneFacts.ts";
const ny = getCity("new-york"),
  london = getCity("london");
const diff = (date) =>
  offsetMinutes(new Date(date), london.zone) -
  offsetMinutes(new Date(date), ny.zone);
for (const [date, expected] of [
  ["2026-01-05T12:00Z", 300],
  ["2026-03-15T12:00Z", 240],
  ["2026-03-30T12:00Z", 300],
  ["2026-10-28T12:00Z", 240],
  ["2026-11-05T12:00Z", 300],
])
  assert.equal(diff(date), expected, date);
assert.equal(
  resolveWallTime("2026-03-08T02:30", ny.zone).length,
  0,
  "NY spring gap",
);
assert.deepEqual(
  resolveWallTime("2026-11-01T01:30", ny.zone).map((d) => d.toISOString()),
  ["2026-11-01T05:30:00.000Z", "2026-11-01T06:30:00.000Z"],
  "NY repeated hour",
);
assert.equal(
  resolveWallTime("2026-03-29T01:30", london.zone).length,
  0,
  "London spring gap",
);
assert.equal(
  resolveWallTime("2026-02-30T09:00", ny.zone).length,
  0,
  "invalid calendar date",
);
assert.equal(
  resolveWallTime("2026-01-01T09:00", "Asia/Kathmandu")[0].toISOString(),
  "2026-01-01T03:15:00.000Z",
  "quarter-hour offset",
);
assert.equal(
  resolveWallTime("2026-04-05T01:45", "Australia/Lord_Howe").length,
  2,
  "half-hour fall-back",
);
assert.equal(
  resolveWallTime("2026-10-04T02:15", "Australia/Lord_Howe").length,
  0,
  "half-hour spring-forward",
);
const spring = conversionTable("2026-03-08", ny.zone, london.zone),
  fall = conversionTable("2026-11-01", ny.zone, london.zone);
assert.equal(spring.length, 24);
assert.equal(spring[2].values.length, 0);
assert.equal(fall[1].values.length, 2);
assert.equal(
  dateShift("2026-01-01", new Date("2026-01-02T02:00Z"), "Asia/Tokyo"),
  "next day",
);
assert.equal(
  dateShift("2026-01-01", new Date("2026-01-01T02:00Z"), "America/Los_Angeles"),
  "previous day",
);
assert.deepEqual(businessOverlap("2026-01-05", ny.zone, london.zone), [
  { start: "2026-01-05T14:00:00.000Z", end: "2026-01-05T17:00:00.000Z" },
]);
assert.deepEqual(
  businessOverlap("2026-01-03", ny.zone, london.zone),
  [],
  "weekend must not suggest office overlap",
);
assert.deepEqual(
  businessOverlap("2026-01-05", ny.zone, "Asia/Tokyo"),
  [],
  "no overlap must remain empty",
);
assert.equal(
  yearTransitions(ny.zone, 2026)[0].instant,
  "2026-03-08T07:00:00.000Z",
);
assert.deepEqual(
  pairSeasons(ny, london, 2026).map((p) => p.minutes),
  [300, 240, 300, 240, 300],
  "must include mismatched-DST weeks, not only January/July",
);
assert.equal(
  citySeason(getCity("tokyo"), new Date("2026-07-01T00:00Z")).daylight,
  null,
);
assert.equal(
  citySeason(getCity("casablanca"), new Date("2026-03-01T00:00Z")).standard,
  null,
  "do not label Ramadan adjustment as ordinary DST",
);
assert.equal(
  citySeason(getCity("sydney"), new Date("2026-01-01T00:00Z")).standard,
  600,
);
assert(getCityPairIndexEligibility(ny, london).indexable);
assert(
  !getCityPairIndexEligibility(getCity("lima"), getCity("bogota")).indexable,
);
assert(
  getPageIndexEligibility({
    slug: "194-months-from-today",
    kind: "relative",
    type: "months-from-today",
  }).indexable,
);
assert(
  !getPageIndexEligibility({
    slug: "195-years-from-today",
    kind: "relative",
    type: "years-from-today",
  }).indexable,
);
assert(!getPairCities("made-up-to-london-time"));
assert.equal(new Set(allPublicSlugs).size, allPublicSlugs.length);
assert(allIndexableSlugs.length >= 1000 && allIndexableSlugs.length <= 2500);
for (const city of cities) {
  const sample = new Date("2026-09-26T12:34Z");
  assert.equal(
    localISO(
      resolveWallTime(localISO(sample, city.zone), city.zone)[0],
      city.zone,
    ),
    localISO(sample, city.zone),
  );
}
console.log(
  "Timezone and eligibility tests passed: DST gaps/folds, mismatched switch weeks, fractional offsets, date shifts, office overlap, protected URLs and all 82 city zones.",
);
