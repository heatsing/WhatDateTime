import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  eachDayOfInterval,
  format,
  isWeekend,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, getTimezoneOffset } from "date-fns-tz";
import { calculateRelativeDate } from "@/lib/dateCalculator";
import type { SEOPage } from "@/lib/seoGenerator";

export type PageFact = { label: string; value: string };

function quarter(date: Date) {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
}

function leapDayCrossed(start: Date, end: Date) {
  const first = start < end ? start : end;
  const last = start < end ? end : start;
  for (let year = first.getFullYear(); year <= last.getFullYear(); year += 1) {
    const leap = new Date(year, 1, 29, 12);
    if (leap.getMonth() === 1 && leap >= first && leap <= last) return true;
  }
  return false;
}

function businessDayCount(start: Date, end: Date) {
  if (start.getTime() === end.getTime()) return 0;
  const first = start < end ? start : end;
  const last = start < end ? end : start;
  return eachDayOfInterval({ start: first, end: last })
    .slice(1)
    .filter((date) => !isWeekend(date)).length;
}

function offsetLabel(timeZone: string, date: Date) {
  const value = formatInTimeZone(date, timeZone, "xxx");
  return value === "Z" ? "UTC+00:00" : `UTC${value}`;
}

function differenceLabel(minutes: number) {
  if (minutes === 0) return "the same local time";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const remainder = absolute % 60;
  return `${hours}${remainder ? ` hours ${remainder} minutes` : hours === 1 ? " hour" : " hours"}`;
}

function countLabel(value: number, singular: string, plural = `${singular}s`) {
  return `${value.toLocaleString()} ${value === 1 ? singular : plural}`;
}

function timezoneFacts(page: Extract<SEOPage, { kind: "timezone" }>, now: Date): PageFact[] {
  const year = now.getUTCFullYear();
  const winter = new Date(Date.UTC(year, 0, 15, 12));
  const summer = new Date(Date.UTC(year, 6, 15, 12));
  const currentDifference = Math.round((getTimezoneOffset(page.toZone, now) - getTimezoneOffset(page.fromZone, now)) / 60_000);
  const winterDifference = Math.round((getTimezoneOffset(page.toZone, winter) - getTimezoneOffset(page.fromZone, winter)) / 60_000);
  const summerDifference = Math.round((getTimezoneOffset(page.toZone, summer) - getTimezoneOffset(page.fromZone, summer)) / 60_000);
  const fromUsesDst = getTimezoneOffset(page.fromZone, winter) !== getTimezoneOffset(page.fromZone, summer);
  const toUsesDst = getTimezoneOffset(page.toZone, winter) !== getTimezoneOffset(page.toZone, summer);
  const localDate = formatInTimeZone(now, page.fromZone, "yyyy-MM-dd");
  const examples = [9, 13, 18].map((hour) => {
    const instant = fromZonedTime(`${localDate}T${String(hour).padStart(2, "0")}:00:00`, page.fromZone);
    return `${formatInTimeZone(instant, page.fromZone, "h:mm a")} → ${formatInTimeZone(instant, page.toZone, "h:mm a, EEE MMM d")}`;
  });
  const officeStart = fromZonedTime(`${localDate}T09:00:00`, page.fromZone);
  const officeEnd = fromZonedTime(`${localDate}T17:00:00`, page.fromZone);

  return [
    { label: "IANA zones", value: `${page.fromCity}: ${page.fromZone}; ${page.toCity}: ${page.toZone}` },
    { label: "Current UTC offsets", value: `${page.fromCity} ${offsetLabel(page.fromZone, now)}; ${page.toCity} ${offsetLabel(page.toZone, now)}` },
    { label: "Current time difference", value: currentDifference === 0 ? `${page.toCity} and ${page.fromCity} currently have the same local time` : `${page.toCity} is ${differenceLabel(currentDifference)} ${currentDifference > 0 ? "ahead of" : "behind"} ${page.fromCity}` },
    { label: "Seasonal difference", value: winterDifference === summerDifference ? `Fixed at ${differenceLabel(winterDifference)} in January and July` : `${differenceLabel(winterDifference)} in January; ${differenceLabel(summerDifference)} in July` },
    { label: "Daylight saving", value: `${page.fromCity}: ${fromUsesDst ? "observed" : "not observed"}; ${page.toCity}: ${toUsesDst ? "observed" : "not observed"}` },
    { label: "Conversion examples", value: examples.join("; ") },
    { label: "Origin office hours", value: `9:00 AM–5:00 PM in ${page.fromCity} is ${formatInTimeZone(officeStart, page.toZone, "h:mm a")}–${formatInTimeZone(officeEnd, page.toZone, "h:mm a")} in ${page.toCity}` },
    { label: "Date boundary", value: currentDifference === 0 ? "These cities share the same calendar date at the same instant" : "Early or late conversions can fall on the previous or next calendar date" },
  ];
}

export function getPageFacts(page: SEOPage, now: Date): PageFact[] {
  if (page.kind === "timezone") return timezoneFacts(page, now);

  if (page.kind === "difference") {
    const start = new Date(`${page.start}T12:00:00`);
    const end = new Date(`${page.end}T12:00:00`);
    const elapsed = Math.abs(differenceInCalendarDays(end, start));
    const months = Math.abs(differenceInCalendarMonths(end, start));
    return [
      { label: "Elapsed days", value: elapsed.toLocaleString() },
      { label: "Inclusive count", value: `${(elapsed + 1).toLocaleString()} days when both endpoints are included` },
      { label: "Weeks and days", value: `${countLabel(Math.floor(elapsed / 7), "complete week")} and ${countLabel(elapsed % 7, "day")}` },
      { label: "Endpoint weekdays", value: `${format(start, "EEEE")} to ${format(end, "EEEE")}` },
      { label: "Calendar span", value: `${months} month boundaries across ${Math.abs(end.getFullYear() - start.getFullYear())} year boundaries` },
      { label: "Leap-day check", value: leapDayCrossed(start, end) ? "The interval crosses February 29" : "The interval does not cross February 29" },
      { label: "Weekday estimate", value: `${businessDayCount(start, end).toLocaleString()} Monday–Friday days; public holidays are not excluded` },
      { label: "Reverse order", value: `Reversing the dates preserves the absolute ${elapsed.toLocaleString()}-day duration but changes the direction` },
    ];
  }

  const result = calculateRelativeDate(now, page.amount, page.unit, page.direction);
  const elapsed = Math.abs(differenceInCalendarDays(result, now));
  const crossedMonth = now.getMonth() !== result.getMonth() || now.getFullYear() !== result.getFullYear();
  const crossedYear = now.getFullYear() !== result.getFullYear();
  const facts: PageFact[] = [
    { label: "Weekday change", value: `${format(now, "EEEE")} → ${format(result, "EEEE")}` },
    { label: "Calendar boundary", value: `${crossedMonth ? "Crosses" : "Stays within"} a month boundary and ${crossedYear ? "crosses" : "does not cross"} a year boundary` },
    { label: "Quarter", value: `${quarter(now)} → ${quarter(result)}` },
    { label: "Leap-day check", value: leapDayCrossed(now, result) ? "This interval passes through February 29" : "This interval does not pass through February 29" },
  ];

  if (page.unit === "hour") {
    facts.unshift(
      { label: "Days and hours", value: `${countLabel(Math.floor(page.amount / 24), "complete day")} and ${countLabel(page.amount % 24, "hour")}` },
      { label: "Clock formats", value: `${format(result, "h:mm a")} in 12-hour time; ${format(result, "HH:mm")} in 24-hour time` },
      { label: "Midnight crossing", value: elapsed > 0 ? `Crosses ${elapsed} calendar date boundary${elapsed === 1 ? "" : "ies"}` : "Does not cross midnight" },
    );
  } else {
    facts.unshift({ label: "Weeks and days", value: `${countLabel(Math.floor(elapsed / 7), "complete week")} and ${countLabel(elapsed % 7, "day")}` });
  }

  if (page.unit === "business-day") {
    const calendarDays = elapsed;
    facts.unshift(
      { label: "Work-week breakdown", value: `${countLabel(Math.floor(page.amount / 5), "complete work week")} and ${countLabel(page.amount % 5, "business day")}` },
      { label: "Skipped weekends", value: `${Math.max(0, calendarDays - page.amount)} weekend days are skipped; public holidays are not excluded` },
    );
  }
  if (page.unit === "month") {
    facts.unshift({ label: "Month-end handling", value: `Calendar arithmetic preserves the day when possible and clamps dates that do not exist in the result month` });
  }
  if (page.unit === "year") {
    facts.unshift({ label: "Anniversary rule", value: `The month and day are preserved when valid; leap-day anniversaries follow calendar-year rules` });
  }
  return facts;
}
