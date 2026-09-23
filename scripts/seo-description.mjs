import { differenceInCalendarDays, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

// An intentional editorial reference year, never the build clock. Each time-zone
// statement is year-qualified so it cannot imply permanent daylight-saving rules.
export const TIMEZONE_DESCRIPTION_YEAR = 2026;
// Editorial bounds, not a Google snippet-length or ranking requirement.
export const DESCRIPTION_MIN_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 190;

const quantity = (count, unit) => `${count} ${unit}${count === 1 ? "" : "s"}`;
const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const splitUnits = (amount, divisor, major, minor) => {
  const whole = Math.floor(amount / divisor);
  const rest = amount % divisor;
  return [whole && quantity(whole, major), rest && quantity(rest, minor)].filter(Boolean).join(" and ");
};

export function relativeMetaDescription(page, phrase) {
  const n = page.amount;
  const past = page.direction === "past";
  const label = sentenceCase(phrase);

  if (page.unit === "hour") {
    const verb = past ? "Subtract" : "Add";
    const target = past ? "earlier" : "later";
    if (n < 24) {
      return `${label} is ${quantity(n * 60, "minute")} ${target}. ${verb} ${quantity(n, "hour")} to find the local clock time and whether the date crosses midnight.`;
    }
    const elapsed = splitUnits(n, 24, "day", "hour");
    return `${label} is ${elapsed} ${target}, with each day measured as 24 hours. Find the local date and time, including clock changes.`;
  }

  if (page.unit === "business-day") {
    if (n === 1) {
      return "1 business day from today means the next Monday-Friday date. Skip Saturday and Sunday; public holidays are still counted by this calculator.";
    }
    const weeks = Math.floor(n / 5);
    const rest = n % 5;
    const span = weeks
      ? `${quantity(weeks, "five-day workweek")}${rest ? ` and ${quantity(rest, "weekday")}` : ""}`
      : quantity(n, "weekday");
    return `${label} counts ${span}. Find the target date with weekends skipped; holidays are not excluded.`;
  }

  if (page.unit === "day") {
    if (n === 1) {
      return past
        ? "1 day ago means yesterday in your local calendar. Find the previous date and weekday; this counts calendar days, not a fixed 24-hour span."
        : "1 day from today is tomorrow in your local calendar. See its date and weekday, or choose a different starting date to plan the next day.";
    }
    const span = splitUnits(n, 7, "week", "day");
    const direction = past ? "back" : "ahead";
    if (n % 7 === 0) {
      return `${label} is exactly ${span} ${direction}, on the same weekday. ${past ? "Subtract" : "Add"} ${quantity(n, "calendar day")}; weekends and holidays stay in the count.`;
    }
    if (n < 7) {
      return `${label} moves ${quantity(n, "calendar day")} ${direction}, including weekends. Find the ${past ? "past" : "future"} weekday and date across month and year boundaries.`;
    }
    return `${label} is ${span} ${direction}. Count calendar days, including weekends, and see the ${past ? "earlier" : "target"} weekday and date.`;
  }

  if (page.unit === "week") {
    return `${label} is ${quantity(n * 7, "calendar day")} ahead, on the same weekday. Follow the seven-day weeks across month and year boundaries.`;
  }

  if (page.unit === "month") {
    if (n < 12) {
      return `${label} advances ${quantity(n, "calendar month")}, not ${n * 30} fixed days. Keep the day number, or use the final day of a shorter destination month.`;
    }
    return `${label} is ${splitUnits(n, 12, "year", "month")} ahead. Advance ${n} month positions, with month-end adjustment if the day does not exist.`;
  }

  if (page.unit === "year") {
    return `${label} advances ${quantity(n * 12, "calendar month")}. Find the anniversary date and weekday, including February 29 handling in non-leap destination years.`;
  }
  throw new Error(`Unsupported relative metadata unit: ${page.unit}`);
}

export function differenceMetaDescription(page) {
  const start = parseISO(page.start);
  const end = parseISO(page.end);
  const days = Math.abs(differenceInCalendarDays(end, start));
  const human = (date) => new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(date);
  const span = days >= 7 ? `, or ${splitUnits(days, 7, "week", "day")}` : "";
  return `${human(start)} to ${human(end)} spans ${quantity(days, "calendar day")}${span}. Counting both dates gives ${quantity(days + 1, "day")}.`;
}

const sourceSamples = new Map();
const offsetFormatters = new Map();
const offsetCache = new Map();
const pairFacts = new Map();

function offsetMinutes(zone, instant) {
  let values = offsetCache.get(zone);
  if (!values) offsetCache.set(zone, values = new Map());
  const key = instant.getTime();
  if (values.has(key)) return values.get(key);
  let formatter = offsetFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" });
    offsetFormatters.set(zone, formatter);
  }
  const text = formatter.formatToParts(instant).find((part) => part.type === "timeZoneName").value;
  const match = text.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) throw new Error(`Unsupported UTC offset: ${zone}: ${text}`);
  const offset = match[1] ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] || 0)) : 0;
  values.set(key, offset);
  return offset;
}

function nineAmSamples(zone) {
  if (sourceSamples.has(zone)) return sourceSamples.get(zone);
  const samples = [];
  for (let day = Date.UTC(TIMEZONE_DESCRIPTION_YEAR, 0, 1); day < Date.UTC(TIMEZONE_DESCRIPTION_YEAR + 1, 0, 1); day += 86_400_000) {
    const date = new Date(day).toISOString().slice(0, 10);
    const instant = fromZonedTime(`${date}T09:00:00`, zone);
    samples.push({ instant, offset: offsetMinutes(zone, instant) });
  }
  sourceSamples.set(zone, samples);
  return samples;
}

// Check 9 AM on every source-city date, not just January and July: this includes
// mismatched DST weeks, Ramadan changes, and fractional-hour zones.
export function timezoneDescriptionFacts(page) {
  const key = `${page.fromZone}|${page.toZone}`;
  if (pairFacts.has(key)) return pairFacts.get(key);
  const samples = nineAmSamples(page.fromZone);
  const offsets = [...new Set(samples.map(({ instant, offset }) => offsetMinutes(page.toZone, instant) - offset))].sort((a, b) => a - b);
  const facts = { year: TIMEZONE_DESCRIPTION_YEAR, sourceHour: 9, sampledDates: samples.length, offsets };
  pairFacts.set(key, facts);
  return facts;
}

function timeForOffset(offset) {
  const minutes = 9 * 60 + offset;
  const dayShift = Math.floor(minutes / 1440);
  const minuteOfDay = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const clock = `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour < 12 ? "AM" : "PM"}`;
  return `${clock}${dayShift < 0 ? " the previous day" : dayShift > 0 ? " the next day" : ""}`;
}

export function timezoneMetaDescription(page) {
  const { year, offsets } = timezoneDescriptionFacts(page);
  const clocks = offsets.map(timeForOffset).join(" or ");
  const answer = `9 AM in ${page.fromCity} is ${clocks} in ${page.toCity} in ${year}.`;
  const changes = offsets.length > 1;
  const offset = offsets[0];
  const detail = changes
    ? "The result depends on the date; check clock-change weeks when scheduling."
    : offset === 0
      ? "Both cities share that clock time; convert another date and time."
      : `At that hour, ${page.toCity} is ${quantity(Math.abs(offset) / 60, "hour")} ${offset > 0 ? "ahead" : "behind"}; check your meeting date.`;
  const description = `${answer} ${detail}`;
  if (description.length <= DESCRIPTION_MAX_LENGTH) return description;
  // Shorten prose only; never truncate a place name, date, or conversion fact.
  return `${answer} ${changes ? "Select a date to check clock changes." : "Convert your meeting date and time."}`;
}
