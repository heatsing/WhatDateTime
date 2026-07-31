const fallbackBuildTime = "2026-01-01T12:00:00.000Z";

export function getBuildTime() {
  return process.env.WHATDATETIME_BUILD_TIME ?? fallbackBuildTime;
}
