import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
  format,
  intervalToDuration,
  isValid,
  subDays,
  subHours,
} from "date-fns";

export const calculationSlugs = [
  "hours-from-now",
  "days-from-today",
  "weeks-from-today",
  "months-from-today",
  "years-from-today",
  "hours-ago",
  "days-ago",
] as const;

export type CalculationSlug = (typeof calculationSlugs)[number];
export type TimeUnit = "hour" | "day" | "week" | "month" | "year";
export type Direction = "future" | "past";

export type CalculationDefinition = {
  slug: CalculationSlug;
  unit: TimeUnit;
  direction: Direction;
  phrase: string;
  shortPhrase: string;
  max: number;
};

export const calculationDefinitions: Record<
  CalculationSlug,
  CalculationDefinition
> = {
  "hours-from-now": {
    slug: "hours-from-now",
    unit: "hour",
    direction: "future",
    phrase: "from now",
    shortPhrase: "from now",
    max: 24,
  },
  "days-from-today": {
    slug: "days-from-today",
    unit: "day",
    direction: "future",
    phrase: "from today",
    shortPhrase: "from today",
    max: 31,
  },
  "weeks-from-today": {
    slug: "weeks-from-today",
    unit: "week",
    direction: "future",
    phrase: "from today",
    shortPhrase: "from today",
    max: 12,
  },
  "months-from-today": {
    slug: "months-from-today",
    unit: "month",
    direction: "future",
    phrase: "from today",
    shortPhrase: "from today",
    max: 24,
  },
  "years-from-today": {
    slug: "years-from-today",
    unit: "year",
    direction: "future",
    phrase: "from today",
    shortPhrase: "from today",
    max: 50,
  },
  "hours-ago": {
    slug: "hours-ago",
    unit: "hour",
    direction: "past",
    phrase: "ago",
    shortPhrase: "ago",
    max: 24,
  },
  "days-ago": {
    slug: "days-ago",
    unit: "day",
    direction: "past",
    phrase: "ago",
    shortPhrase: "ago",
    max: 31,
  },
};

export function isCalculationSlug(value: string): value is CalculationSlug {
  return calculationSlugs.includes(value as CalculationSlug);
}

export function pluralize(unit: TimeUnit, amount: number) {
  return amount === 1 ? unit : `${unit}s`;
}

export function getPagePhrase(slug: CalculationSlug, amount: number) {
  const definition = calculationDefinitions[slug];
  return `${amount} ${pluralize(definition.unit, amount)} ${definition.phrase}`;
}

export function calculateRelativeDate(
  base: Date,
  amount: number,
  definition: Pick<CalculationDefinition, "unit" | "direction">,
) {
  const signed = definition.direction === "future" ? amount : -amount;

  switch (definition.unit) {
    case "hour":
      return signed >= 0 ? addHours(base, signed) : subHours(base, -signed);
    case "day":
      return signed >= 0 ? addDays(base, signed) : subDays(base, -signed);
    case "week":
      return addWeeks(base, signed);
    case "month":
      return addMonths(base, signed);
    case "year":
      return addYears(base, signed);
  }
}

export function formatResult(date: Date, includesTime = false) {
  return {
    primary: format(date, includesTime ? "EEEE, MMMM d, yyyy" : "EEEE, MMMM d, yyyy"),
    secondary: includesTime ? format(date, "h:mm a") : format(date, "MMMM d, yyyy"),
    iso: format(date, "yyyy-MM-dd'T'HH:mm:ssxxx"),
  };
}

export function calculateDateOffset(
  base: Date,
  amount: number,
  unit: TimeUnit,
  operation: "add" | "subtract",
) {
  return calculateRelativeDate(base, Math.abs(amount), {
    unit,
    direction: operation === "add" ? "future" : "past",
  });
}

export function calculateDifference(start: Date, end: Date) {
  const ordered = start <= end ? { start, end } : { start: end, end: start };
  const duration = intervalToDuration(ordered);
  const seconds = Math.abs(differenceInSeconds(end, start));

  return {
    duration,
    totalDays: Math.abs(differenceInDays(end, start)),
    totalHours: Math.abs(differenceInHours(end, start)),
    totalMinutes: Math.abs(differenceInMinutes(end, start)),
    totalSeconds: seconds,
  };
}

export function calculateAge(birthDate: Date, asOf: Date) {
  if (!isValid(birthDate) || !isValid(asOf) || birthDate > asOf) return null;

  const duration = intervalToDuration({ start: birthDate, end: asOf });
  return {
    years: differenceInYears(asOf, birthDate),
    months: differenceInMonths(asOf, birthDate),
    days: differenceInCalendarDays(asOf, birthDate),
    duration,
  };
}

export function inputDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function inputDateTime(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function inputDateUTC(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function inputDateTimeUTC(date: Date) {
  return date.toISOString().slice(0, 16);
}
