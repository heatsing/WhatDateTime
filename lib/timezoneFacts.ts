import type { City } from "./indexEligibility.ts";
import transitionData from "../data/timezone-transitions.json" with { type: "json" };

// All wall-clock arithmetic is explicit about its IANA zone; never use the host zone.
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(zone: string, kind: "parts" | "offset") {
  const key = `${zone}:${kind}`;
  if (!formatters.has(key))
    formatters.set(
      key,
      new Intl.DateTimeFormat(
        "en-US",
        kind === "offset"
          ? { timeZone: zone, timeZoneName: "shortOffset" }
          : {
              timeZone: zone,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hourCycle: "h23",
            },
      ),
    );
  return formatters.get(key)!;
}
export function offsetMinutes(instant: Date, zone: string): number {
  const label = formatter(zone, "offset")
    .formatToParts(instant)
    .find((p) => p.type === "timeZoneName")!.value;
  if (label === "GMT") return 0;
  const m = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(label);
  if (!m) throw new Error(`Unsupported offset ${label}`);
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
}
export function localISO(instant: Date, zone: string) {
  const parts = Object.fromEntries(
    formatter(zone, "parts")
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function utcLabel(minutes: number) {
  return `UTC${minutes < 0 ? "−" : "+"}${Math.floor(Math.abs(minutes) / 60)}${Math.abs(minutes) % 60 ? ":" + String(Math.abs(minutes) % 60).padStart(2, "0") : ""}`;
}
export function durationLabel(minutes: number) {
  const n = Math.abs(minutes),
    hours = Math.floor(n / 60),
    rest = n % 60;
  return (
    [
      hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "",
      rest ? `${rest} minute${rest === 1 ? "" : "s"}` : "",
    ]
      .filter(Boolean)
      .join(" ") || "0 hours"
  );
}
export function differenceLabel(minutes: number, from: string, to: string) {
  return minutes === 0
    ? `${to} and ${from} have the same local time.`
    : `${to} is ${durationLabel(minutes)} ${minutes > 0 ? "ahead of" : "behind"} ${from}.`;
}
export function displayTime(instant: Date, zone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
  }).format(instant);
}
export function displayDate(instant: Date, zone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(instant);
}
export function resolveWallTime(local: string, zone: string): Date[] {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return [];
  const raw = new Date(`${local}:00Z`);
  if (
    !Number.isFinite(raw.getTime()) ||
    raw.toISOString().slice(0, 16) !== local
  )
    return [];
  const offsets = new Set(
    [-36, -12, 0, 12, 36].map((h) =>
      offsetMinutes(new Date(raw.getTime() + h * 3600000), zone),
    ),
  );
  return [...offsets]
    .map((offset) => new Date(raw.getTime() - offset * 60000))
    .filter((date) => localISO(date, zone) === local)
    .sort((a, b) => +a - +b);
}
export function dateShift(sourceDate: string, instant: Date, zone: string) {
  const destination = localISO(instant, zone).slice(0, 10);
  const days = Math.round(
    (Date.parse(`${destination}T12:00Z`) - Date.parse(`${sourceDate}T12:00Z`)) /
      86400000,
  );
  return days === 0
    ? "same day"
    : days === 1
      ? "next day"
      : days === -1
        ? "previous day"
        : `${Math.abs(days)} days ${days > 0 ? "later" : "earlier"}`;
}
export function conversionTable(
  date: string,
  fromZone: string,
  toZone: string,
) {
  return Array.from({ length: 24 }, (_, hour) => {
    const local = `${date}T${String(hour).padStart(2, "0")}:00`;
    const instants = resolveWallTime(local, fromZone);
    return {
      local,
      label: `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`,
      values: instants.map((instant) => ({
        iso: instant.toISOString(),
        time: displayTime(instant, toZone),
        shift: dateShift(date, instant, toZone),
        sourceOffset: utcLabel(offsetMinutes(instant, fromZone)),
      })),
    };
  });
}
type Transition = { instant: string; before: number; after: number };
const transitionCache = new Map<string, Transition[]>(
  Object.entries(transitionData.rules) as [string, Transition[]][],
);
export function yearTransitions(zone: string, year: number): Transition[] {
  const key = `${zone}:${year}`;
  if (transitionCache.has(key)) return transitionCache.get(key)!;
  const result = computeYearTransitions(zone, year);
  transitionCache.set(key, result);
  return result;
}
export function computeYearTransitions(
  zone: string,
  year: number,
): Transition[] {
  const transitions: Transition[] = [];
  let previous = Date.UTC(year, 0, 1),
    before = offsetMinutes(new Date(previous), zone);
  const end = Date.UTC(year + 1, 0, 1);
  for (let t = previous + 6 * 3600000; t <= end; t += 6 * 3600000) {
    const after = offsetMinutes(new Date(t), zone);
    if (before !== after) {
      let lo = previous,
        hi = t;
      while (hi - lo > 60000) {
        const mid = Math.floor((lo + hi) / 120000) * 60000;
        if (offsetMinutes(new Date(mid), zone) === before) lo = mid;
        else hi = mid;
      }
      transitions.push({ instant: new Date(hi).toISOString(), before, after });
    }
    before = after;
    previous = t;
  }
  return transitions;
}
export function citySeason(city: City, now: Date) {
  const year = Number(localISO(now, city.zone).slice(0, 4));
  const current = offsetMinutes(now, city.zone);
  const transitions = yearTransitions(city.zone, year);
  const offsets = [
    ...new Set([
      offsetMinutes(new Date(Date.UTC(year, 0, 1)), city.zone),
      ...transitions.map((t) => t.after),
    ]),
  ].sort((a, b) => a - b);
  const standard = offsetMinutes(
    new Date(Date.UTC(year, city.seasonalPolicy === "south" ? 6 : 0, 15, 12)),
    city.zone,
  );
  const special =
    city.seasonalPolicy === "ramadan" || city.seasonalPolicy === "seasonal";
  const next = [...transitions, ...yearTransitions(city.zone, year + 1)].find(
    (t) => Date.parse(t.instant) > +now,
  );
  const status =
    offsets.length === 1
      ? `No clock changes in ${year} under the available time-zone rules.`
      : special
        ? `Seasonal clock adjustment: currently ${utcLabel(current)}. The offsets used in ${year} are ${offsets.map(utcLabel).join(" and ")}.`
        : current !== standard
          ? "Daylight saving time is currently in effect."
          : "Standard time is currently in effect.";
  return {
    year,
    current,
    offsets,
    standard: special ? null : standard,
    daylight: special ? null : (offsets.find((n) => n !== standard) ?? null),
    status,
    next,
  };
}
export function pairSeasons(from: City, to: City, year: number) {
  const start = Date.UTC(year, 0, 1),
    end = Date.UTC(year + 1, 0, 1);
  const boundaries = [
    ...new Set([
      start,
      ...yearTransitions(from.zone, year).map((t) => Date.parse(t.instant)),
      ...yearTransitions(to.zone, year).map((t) => Date.parse(t.instant)),
      end,
    ]),
  ].sort((a, b) => a - b);
  const periods: { start: string; end: string; minutes: number }[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const date = new Date(boundaries[i]);
    const minutes =
      offsetMinutes(date, to.zone) - offsetMinutes(date, from.zone);
    const previous = periods.at(-1);
    if (previous?.minutes === minutes)
      previous.end = new Date(boundaries[i + 1]).toISOString();
    else
      periods.push({
        start: date.toISOString(),
        end: new Date(boundaries[i + 1]).toISOString(),
        minutes,
      });
  }
  return periods;
}
export function businessOverlap(
  date: string,
  fromZone: string,
  toZone: string,
) {
  const weekday = (d: string) => new Date(`${d}T12:00Z`).getUTCDay();
  if ([0, 6].includes(weekday(date))) return [];
  const a = resolveWallTime(`${date}T09:00`, fromZone)[0],
    b = resolveWallTime(`${date}T17:00`, fromZone)[0];
  if (!a || !b) return [];
  const targetDate = localISO(a, toZone).slice(0, 10),
    base = Date.parse(`${targetDate}T12:00Z`);
  const windows: { start: string; end: string }[] = [];
  for (const step of [-1, 0, 1, 2]) {
    const day = new Date(base + step * 86400000).toISOString().slice(0, 10);
    if ([0, 6].includes(weekday(day))) continue;
    const c = resolveWallTime(`${day}T09:00`, toZone)[0],
      d = resolveWallTime(`${day}T17:00`, toZone)[0];
    if (!c || !d) continue;
    const start = Math.max(+a, +c),
      end = Math.min(+b, +d);
    if (start < end)
      windows.push({
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      });
  }
  return windows;
}
export function cityFAQs(city: City, now: Date) {
  const season = citySeason(city, now);
  return [
    {
      question: `What time zone is ${city.name} in?`,
      answer: `${city.name}, ${city.country}, uses ${city.zone}.`,
    },
    {
      question: `What is the UTC offset in ${city.name}?`,
      answer: `As of ${displayDate(now, city.zone)}, ${city.name} uses ${utcLabel(season.current)}.`,
    },
    { question: `Does ${city.name} change its clocks?`, answer: season.status },
    {
      question: `When is the next clock change in ${city.name}?`,
      answer: season.next
        ? `The next change in the available time-zone rules is ${season.next.instant.replace("T", " ").replace(".000Z", " UTC")}, from ${utcLabel(season.next.before)} to ${utcLabel(season.next.after)}.`
        : `No transition is listed through the end of ${season.year + 1}. Future legislation can change these rules.`,
    },
  ];
}
export function pairFAQs(from: City, to: City, now: Date) {
  const date = localISO(now, from.zone).slice(0, 10),
    nine = resolveWallTime(`${date}T09:00`, from.zone)[0];
  const seasons = pairSeasons(from, to, Number(date.slice(0, 4)));
  return [
    {
      question: `What is the current time difference between ${from.name} and ${to.name}?`,
      answer: differenceLabel(
        offsetMinutes(now, to.zone) - offsetMinutes(now, from.zone),
        from.name,
        to.name,
      ),
    },
    {
      question: `What is 9 AM in ${from.name} in ${to.name}?`,
      answer: nine
        ? `On ${date}, 9:00 AM in ${from.name} is ${displayTime(nine, to.zone)} in ${to.name} (${dateShift(date, nine, to.zone)}).`
        : "This local time is unavailable under the clock-change rules. Select another time.",
    },
    {
      question: `Does the ${from.name} to ${to.name} difference change during the year?`,
      answer:
        seasons.length === 1
          ? `The difference stays ${durationLabel(seasons[0].minutes)} throughout ${date.slice(0, 4)} under the available rules.`
          : `Yes. The UTC transition table shows ${seasons.length} periods in ${date.slice(0, 4)}, including any weeks when clock-change schedules differ.`,
    },
    {
      question: `Can I plan a meeting between ${from.name} and ${to.name}?`,
      answer: `Select a local date and time in ${from.name}. The planner converts it to ${to.name}; the overlap calculation assumes Monday–Friday, 9 AM–5 PM in both cities, excluding public holidays.`,
    },
    {
      question: `How are skipped or repeated times in ${from.name} handled?`,
      answer: `The ${from.zone} rules are used to reject skipped times and display both occurrences of repeated times with their UTC offsets. The 24-hour table labels date changes in ${to.name}.`,
    },
  ];
}
