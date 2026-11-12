// This is an EXAMPLE reference, not "today" or a visitor's local time.
// Static delivery stays byte-stable; relative islands label this UTC example
// before replacing it with the shared live/custom browser calculation state.
// WHATDATETIME_BUILD_TIME may explicitly choose another example reference.
const fallbackBuildTime = "2026-09-26T04:00:00.000Z";

export function getBuildTime() {
  const reference = process.env.WHATDATETIME_BUILD_TIME ?? fallbackBuildTime;
  if (!/^\d{4}-\d\d-\d\dT.*Z$/.test(reference) || !Number.isFinite(Date.parse(reference))) {
    throw new Error("WHATDATETIME_BUILD_TIME must be a valid UTC ISO example reference.");
  }
  return new Date(reference).toISOString();
}
