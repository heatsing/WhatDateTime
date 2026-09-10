import {
  calculateDateDifference,
  calculateRelativeDate,
  formatLongDate,
  formatZonedTime,
} from "@/lib/dateCalculator";
import type {
  FAQItem,
  DifferenceSEOPage,
  RelativeSEOPage,
  TimezoneSEOPage,
} from "@/lib/seoGenerator";

export type RelativeCalculationInput = Pick<
  RelativeSEOPage,
  "kind" | "type" | "amount" | "unit" | "direction"
>;
export type DifferenceCalculationInput = Pick<
  DifferenceSEOPage,
  "kind" | "type" | "start" | "end"
>;
export type TimezoneCalculationInput = Pick<
  TimezoneSEOPage,
  "kind" | "type" | "fromCity" | "fromZone" | "toCity" | "toZone"
>;
export type PageCalculationInput =
  | RelativeCalculationInput
  | DifferenceCalculationInput
  | TimezoneCalculationInput;

export function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getRelativePhrase(page: RelativeCalculationInput) {
  const unit =
    page.unit === "business-day"
      ? page.amount === 1
        ? "business day"
        : "business days"
      : page.amount === 1
        ? page.unit
        : `${page.unit}s`;
  const suffix =
    page.type === "hours-from-now"
      ? "from now"
      : page.direction === "past"
        ? "ago"
        : "from today";
  return `${page.amount} ${unit} ${suffix}`;
}

export function getPageResult(page: PageCalculationInput, now: Date) {
  if (page.kind === "relative") {
    const result = calculateRelativeDate(
      now,
      page.amount,
      page.unit,
      page.direction,
    );
    return formatLongDate(result, page.unit === "hour");
  }

  if (page.kind === "difference") {
    const days = calculateDateDifference(
      new Date(`${page.start}T12:00:00`),
      new Date(`${page.end}T12:00:00`),
    );
    return `${days.toLocaleString()} ${days === 1 ? "day" : "days"}`;
  }

  const result = formatZonedTime(now, page.toZone);
  return `${result.time} on ${result.date} (${result.abbreviation})`;
}

export function getPageFormula(page: PageCalculationInput, now: Date) {
  if (page.kind === "relative") {
    const includeTime = page.unit === "hour";
    const start = formatLongDate(now, includeTime);
    const result = getPageResult(page, now);
    const operation = page.direction === "future" ? "+" : "−";
    const interval = getRelativePhrase(page)
      .replace(/ from now$/, "")
      .replace(/ from today$/, "")
      .replace(/ ago$/, "");
    return `${start} ${operation} ${interval} = ${result}.`;
  }

  if (page.kind === "difference") {
    const start = formatLongDate(new Date(`${page.start}T12:00:00`));
    const end = formatLongDate(new Date(`${page.end}T12:00:00`));
    return `${end} − ${start} = ${getPageResult(page, now)} elapsed.`;
  }

  const source = formatZonedTime(now, page.fromZone);
  return `${source.time} on ${source.date} in ${page.fromCity} = ${getPageResult(page, now)} in ${page.toCity}.`;
}

export function getDirectFAQ(page: PageCalculationInput, now: Date): FAQItem {
  if (page.kind === "relative") {
    return {
      question: `What is the exact result for ${getRelativePhrase(page)}?`,
      answer: `${titleCase(getRelativePhrase(page))} is ${getPageResult(page, now)} when calculated from ${formatLongDate(now, page.unit === "hour")}.`,
    };
  }

  if (page.kind === "difference") {
    return {
      question: `What is the exact difference between ${page.start} and ${page.end}?`,
      answer: `The elapsed difference between ${page.start} and ${page.end} is ${getPageResult(page, now)}.`,
    };
  }

  return {
    question: `What is the current ${page.fromCity} to ${page.toCity} conversion?`,
    answer: getPageFormula(page, now),
  };
}
