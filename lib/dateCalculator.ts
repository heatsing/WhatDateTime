import {
  addBusinessDays,
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  subBusinessDays,
  subDays,
  subHours,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export type RelativeUnit =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year"
  | "business-day";

export type RelativeDirection = "future" | "past";

export function calculateRelativeDate(
  baseDate: Date,
  amount: number,
  unit: RelativeUnit,
  direction: RelativeDirection = "future",
) {
  const value = Math.abs(Math.trunc(amount));
  const future = direction === "future";

  switch (unit) {
    case "hour":
      return future ? addHours(baseDate, value) : subHours(baseDate, value);
    case "day":
      return future ? addDays(baseDate, value) : subDays(baseDate, value);
    case "week":
      return future ? addWeeks(baseDate, value) : subWeeks(baseDate, value);
    case "month":
      return future ? addMonths(baseDate, value) : subMonths(baseDate, value);
    case "year":
      return future ? addYears(baseDate, value) : subYears(baseDate, value);
    case "business-day":
      return future
        ? addBusinessDays(baseDate, value)
        : subBusinessDays(baseDate, value);
  }
}

export function formatLongDate(date: Date, includeTime = false) {
  return includeTime
    ? format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")
    : format(date, "EEEE, MMMM d, yyyy");
}

export function calculateDateDifference(start: Date, end: Date) {
  return Math.abs(differenceInCalendarDays(end, start));
}

export function formatZonedTime(date: Date, timeZone: string) {
  return {
    date: formatInTimeZone(date, timeZone, "EEEE, MMMM d, yyyy"),
    time: formatInTimeZone(date, timeZone, "h:mm a"),
    abbreviation: formatInTimeZone(date, timeZone, "zzz"),
  };
}

export function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function pluralizeUnit(unit: RelativeUnit, amount: number) {
  const label = unit === "business-day" ? "business day" : unit;
  return amount === 1 ? label : `${label}s`;
}
