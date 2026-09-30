// Build-time memoization, not fixed UTC offsets. Live conversions still use Intl.
// This avoids scanning several years of clock rules on a cold Worker request.
import fs from "node:fs";
import { cities } from "../lib/indexEligibility.ts";
import { computeYearTransitions } from "../lib/timezoneFacts.ts";
const year = new Date().getUTCFullYear();
const rules = {};
for (const zone of new Set(cities.map((c) => c.zone)))
  for (let y = year - 1; y <= year + 2; y++)
    rules[`${zone}:${y}`] = computeYearTransitions(zone, y);
const data = {
  source: "Node Intl / IANA tz database",
  tzVersion: process.versions.tz,
  firstYear: year - 1,
  lastYear: year + 2,
  rules,
};
fs.writeFileSync("data/timezone-transitions.json", JSON.stringify(data) + "\n");
console.log(
  `Memoized ${Object.keys(rules).length} IANA zone/year transition schedules; offsets are still calculated for each instant.`,
);
