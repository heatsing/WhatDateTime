import { mkdirSync, writeFileSync } from 'node:fs';
import { addDays, addMonths, addYears, addWeeks, addBusinessDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { resolveWallTime, offsetMinutes } from '../../lib/timezoneFacts.ts';
import { cities } from '../../lib/indexEligibility.ts';

// Development-only oracle: production PHP never imports or runs Node.
const relative = [];
const operations = { day: addDays, week: addWeeks, month: addMonths, year: addYears, 'business-day': addBusinessDays };
for (const zone of ['UTC', 'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Australia/Lord_Howe']) {
  for (const instant of ['2028-02-28T12:00:00.000Z', '2028-01-31T12:00:00.000Z', '2028-03-31T12:00:00.000Z', '2026-03-07T17:00:00.000Z', '2026-10-31T16:00:00.000Z', '2026-11-13T15:30:00.000Z']) {
    for (const [unit, amount] of [['hour', 2], ['hour', 1.5], ['hour', 24], ['day', 1], ['week', 6], ['month', 1], ['year', 1], ['business-day', 8], ['business-day', 0]]) {
      for (const direction of ['future', 'past']) {
        const value = amount * (direction === 'past' ? -1 : 1);
        const expected = unit === 'hour'
          ? new Date(Date.parse(instant) + value * 3600000)
          : fromZonedTime(operations[unit](toZonedTime(new Date(instant), zone), value), zone);
        relative.push({ name: `${zone} ${instant} ${direction} ${amount} ${unit}`, zone, instant, unit, amount, direction, expected: expected.toISOString() });
      }
    }
  }
}
const walls = [
  ['2026-03-08T02:30', 'America/New_York'], ['2026-11-01T01:30', 'America/New_York'],
  ['2026-03-29T01:30', 'Europe/London'], ['2026-10-25T01:30', 'Europe/London'],
  ['2026-10-04T02:15', 'Australia/Lord_Howe'], ['2026-04-05T01:45', 'Australia/Lord_Howe'],
  ['2028-02-29T12:00', 'Asia/Kathmandu'], ['2026-11-15T12:00', 'UTC'],
].map(([local, zone]) => ({ name: `${local} ${zone}`, local, zone, expected: resolveWallTime(local, zone).map(d => d.toISOString()) }));
const offsets = cities.flatMap(city => ['2026-01-15T12:00:00.000Z', '2026-07-15T12:00:00.000Z', '2026-11-15T12:00:00.000Z'].map(instant => {
  const baseline = offsetMinutes(new Date(instant), city.zone);
  // IANA 2026c: Morocco switches to permanent UTC on September 20, 2026.
  // Node's bundled 2026b data predates the announcement; do not force PHP to reproduce it.
  const correction = city.zone === 'Africa/Casablanca' && instant >= '2026-09-20T00:00:00.000Z';
  return { zone: city.zone, instant, baseline, expected: correction ? 0 : baseline,
    ...(correction ? { reason: 'IANA 2026c rule update', source: 'https://www.iana.org/time-zones/releases' } : {}) };
}));
const directory = new URL('../tests/generated/', import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL('parity.json', directory), JSON.stringify({ baselineTzdb: process.versions.tz, relative, walls, offsets }, null, 2));
console.log(`Generated ${relative.length} relative, ${walls.length} DST-wall, and ${offsets.length} city-offset parity cases.`);
