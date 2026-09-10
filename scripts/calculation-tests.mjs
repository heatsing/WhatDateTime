import assert from "node:assert/strict";
import {
  calculateDateDifference,
  calculateRelativeDate,
  formatZonedTime,
} from "../lib/dateCalculator.ts";

const noon = (value) => new Date(`${value}T12:00:00`);

assert.equal(calculateRelativeDate(noon("2024-02-28"), 1, "day").getDate(), 29);
assert.equal(calculateRelativeDate(noon("2026-09-10"), 30, "day").toISOString().slice(0, 10), "2026-10-10");
assert.equal(calculateRelativeDate(noon("2026-09-11"), 1, "business-day").toISOString().slice(0, 10), "2026-09-14");
assert.equal(calculateDateDifference(noon("2026-01-01"), noon("2026-01-31")), 30);
assert.equal(formatZonedTime(new Date("2026-01-15T12:00:00Z"), "America/New_York").time, "7:00 AM");

console.log("Calculation tests passed: leap day, relative day, business day, date difference, and time zone");
