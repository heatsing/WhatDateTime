import assert from "node:assert/strict";
import { countdownHash, parseCountdownHash, validCountdown } from "../lib/countdown-state.ts";
import {
  calculateDateDifference,
  calculateRelativeDate,
  formatZonedTime,
} from "../lib/dateCalculator.ts";

const noon = (value) => new Date(`${value}T12:00:00`);

assert.equal(calculateRelativeDate(noon("2024-02-28"), 1, "day").getDate(), 29);
assert.equal(calculateRelativeDate(new Date("2026-11-13T23:30:00"), 2, "hour").getHours(), 1);
assert.equal(calculateRelativeDate(new Date("2026-11-13T23:30:00"), 2, "hour").getDate(), 14);
assert.equal(calculateRelativeDate(noon("2028-02-28"), 1, "day").getDate(), 29);
assert.equal(calculateRelativeDate(noon("2028-01-31"), 1, "month").getDate(), 29);
assert.equal(calculateRelativeDate(noon("2028-03-31"), 1, "month", "past").getDate(), 29);
assert.equal(calculateRelativeDate(noon("2026-11-16"), 1, "business-day", "past").getDate(), 13);
assert.equal(calculateRelativeDate(noon("2026-11-13"), 0, "business-day").getDate(), 13);
const countdown = {name:"Event & notes",instant:"2028-02-29T01:30:00.000Z",zone:"Asia/Tokyo"};
assert.deepEqual(parseCountdownHash(countdownHash(countdown)), countdown);
assert.deepEqual(validCountdown(JSON.parse(JSON.stringify(countdown))), countdown);
assert.equal(parseCountdownHash("#due=bad&zone=UTC"), null);
assert.equal(validCountdown({...countdown,zone:"invalid/zone"}), null);
assert.equal(validCountdown({...countdown,instant:"2028-02-30T01:30:00.000Z"}), null);
assert.equal(calculateRelativeDate(noon("2026-09-10"), 30, "day").toISOString().slice(0, 10), "2026-10-10");
assert.equal(calculateRelativeDate(noon("2026-09-11"), 1, "business-day").toISOString().slice(0, 10), "2026-09-14");
assert.equal(calculateDateDifference(noon("2026-01-01"), noon("2026-01-31")), 30);
assert.equal(formatZonedTime(new Date("2026-01-15T12:00:00Z"), "America/New_York").time, "7:00 AM");

console.log("Calculation tests passed: leap day, relative day, business day, date difference, and time zone");
