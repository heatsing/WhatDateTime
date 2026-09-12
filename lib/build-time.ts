// Keep ordinary verification builds byte-stable. Production releases can set
// WHATDATETIME_BUILD_TIME explicitly when a fresh static SEO snapshot is wanted.
const fallbackBuildTime = "2026-09-12T04:00:00.000Z";

export function getBuildTime() {
  return process.env.WHATDATETIME_BUILD_TIME ?? fallbackBuildTime;
}
