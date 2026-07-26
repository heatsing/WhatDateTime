import daysFromToday from "@/data/days-from-today.json";
import daysAgo from "@/data/days-ago.json";
import hoursFromNow from "@/data/hours-from-now.json";
import hoursAgo from "@/data/hours-ago.json";
import weeks from "@/data/weeks.json";
import months from "@/data/months.json";
import years from "@/data/years.json";
import businessDays from "@/data/business-days.json";
import dateDifference from "@/data/date-difference.json";
import timezone from "@/data/timezone.json";
import type { RelativeDirection, RelativeUnit } from "@/lib/dateCalculator";
import {
  calculateDateDifference,
  calculateRelativeDate,
  formatLongDate,
  formatZonedTime,
  pluralizeUnit,
} from "@/lib/dateCalculator";

export type RelativePageType =
  | "days-from-today"
  | "days-ago"
  | "hours-from-now"
  | "hours-ago"
  | "weeks-from-today"
  | "months-from-today"
  | "years-from-today"
  | "business-days-from-today";

export type RelativeSEOPage = {
  kind: "relative";
  slug: string;
  type: RelativePageType;
  amount: number;
  unit: RelativeUnit;
  direction: RelativeDirection;
};

export type DifferenceSEOPage = {
  kind: "difference";
  slug: string;
  type: "date-difference";
  start: string;
  end: string;
};

export type TimezoneSEOPage = {
  kind: "timezone";
  slug: string;
  type: "timezone-converter";
  fromCity: string;
  fromZone: string;
  toCity: string;
  toZone: string;
};

export type SEOPage = RelativeSEOPage | DifferenceSEOPage | TimezoneSEOPage;

const allPages = [
  ...daysFromToday,
  ...daysAgo,
  ...hoursFromNow,
  ...hoursAgo,
  ...weeks,
  ...months,
  ...years,
  ...businessDays,
  ...dateDifference,
  ...timezone,
] as SEOPage[];

const pageMap = new Map(allPages.map((page) => [page.slug, page]));
const relativePageMap = new Map(
  allPages
    .filter((page): page is RelativeSEOPage => page.kind === "relative")
    .map((page) => [`${page.type}:${page.amount}`, page]),
);

export const seoPageCount = allPages.length;

export function getAllSEOPages() {
  return allPages;
}

export function getSEOPage(slug: string) {
  return pageMap.get(slug);
}

export function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatCityName(value: string) {
  return value
    .split("-")
    .map((part) => titleCase(part))
    .join(" ");
}

export function getRelativePhrase(page: RelativeSEOPage) {
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

export function getSEOText(page: SEOPage) {
  if (page.kind === "relative") {
    const phrase = getRelativePhrase(page);
    const includeTime = page.unit === "hour";
    return {
      title: `${titleCase(phrase)} - Calculate Exact ${includeTime ? "Time" : "Date"}`,
      description: `Find out ${includeTime ? "the exact date and time" : "what date it will be"} ${phrase}. Use our free ${includeTime ? "time" : "date"} calculator for an instant, accurate answer.`,
      h1: `What ${includeTime ? "Time" : "Date"} Is ${titleCase(phrase)}?`,
      eyebrow: includeTime ? "Exact date and time" : "Exact calendar date",
    };
  }

  if (page.kind === "difference") {
    const start = formatHumanInputDate(page.start);
    const end = formatHumanInputDate(page.end);
    return {
      title: `Days Between ${start} and ${end} - Date Difference`,
      description: `Calculate the exact number of days between ${start} and ${end}. Get a clear date difference with a free online calculator.`,
      h1: `How Many Days Are Between ${start} and ${end}?`,
      eyebrow: "Date difference answer",
    };
  }

  return {
    title: `${page.fromCity} to ${page.toCity} Time Converter`,
    description: `Convert time from ${page.fromCity} to ${page.toCity}. Compare current local times and time-zone offsets instantly.`,
    h1: `${page.fromCity} to ${page.toCity} Time`,
    eyebrow: "World time conversion",
  };
}

export function formatHumanInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function stableVariant(slug: string, variants = 3) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % variants;
}

const maxByType: Record<RelativePageType, number> = {
  "days-from-today": 365,
  "days-ago": 365,
  "hours-from-now": 500,
  "hours-ago": 500,
  "weeks-from-today": 200,
  "months-from-today": 300,
  "years-from-today": 300,
  "business-days-from-today": 1000,
};

export function getPageResult(page: SEOPage, now = new Date()) {
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
    return `${calculateDateDifference(
      new Date(`${page.start}T12:00:00`),
      new Date(`${page.end}T12:00:00`),
    ).toLocaleString()} days`;
  }

  const result = formatZonedTime(now, page.toZone);
  return `${result.time} on ${result.date} (${result.abbreviation})`;
}

export function buildFAQs(page: SEOPage, result: string) {
  if (page.kind === "relative") {
    const phrase = getRelativePhrase(page);
    const weeks = page.unit === "day" ? page.amount / 7 : null;
    const includesWeekends = page.unit !== "business-day";
    return [
      {
        question: `What ${page.unit === "hour" ? "time" : "date"} is ${phrase}?`,
        answer: `${titleCase(phrase)} is ${result}, based on the current local date and time.`,
      },
      {
        question: `How do I calculate ${phrase}?`,
        answer: `Start with the current date${page.unit === "hour" ? " and time" : ""}, then ${page.direction === "future" ? "add" : "subtract"} ${page.amount} ${pluralizeUnit(page.unit, page.amount)}. The calculator applies real calendar rules automatically.`,
      },
      {
        question:
          page.unit === "day"
            ? `How many weeks are ${page.amount} days?`
            : `How long is ${page.amount} ${pluralizeUnit(page.unit, page.amount)}?`,
        answer:
          weeks === null
            ? `The duration is ${page.amount} ${pluralizeUnit(page.unit, page.amount)} measured from the selected starting point.`
            : `${page.amount} days equals ${Number.isInteger(weeks) ? weeks : weeks.toFixed(2)} weeks.`,
      },
      {
        question: "Does this calculation include weekends?",
        answer: includesWeekends
          ? "Yes. Standard calendar calculations include Saturdays, Sundays, and weekdays."
          : "No. Business-day calculations skip Saturdays and Sundays. Public holidays are not removed because holiday calendars differ by country.",
      },
      {
        question: "Does this result use my local time zone?",
        answer:
          "Yes. The live calculator uses the date, time, and time zone reported by your device, so results near midnight can differ between locations.",
      },
    ];
  }

  if (page.kind === "difference") {
    const start = formatHumanInputDate(page.start);
    const end = formatHumanInputDate(page.end);
    return [
      {
        question: `How many days are between ${start} and ${end}?`,
        answer: `There are ${result} between ${start} and ${end}.`,
      },
      {
        question: "Are both the start and end dates included?",
        answer:
          "The standard date difference measures elapsed calendar boundaries and does not count both endpoints. Add one day if you need an inclusive count.",
      },
      {
        question: "Does the date difference include weekends?",
        answer:
          "Yes. The total includes every calendar day, including Saturdays and Sundays.",
      },
      {
        question: "Are leap years handled?",
        answer:
          "Yes. The calculation uses real calendar dates, including February 29 when it occurs.",
      },
      {
        question: "Can I compare different dates?",
        answer:
          "Yes. Use the calculator fields on this page to replace either date and calculate a new interval.",
      },
    ];
  }

  return [
    {
      question: `What time is it in ${page.toCity} when converting from ${page.fromCity}?`,
      answer: `The live converted result is ${result}. It updates using the selected date and official time-zone offset rules.`,
    },
    {
      question: `How many hours ahead is ${page.toCity} from ${page.fromCity}?`,
      answer:
        "The offset depends on the selected date because either location may observe daylight saving time. The calculator applies the correct offset for that date.",
    },
    {
      question: "Does this converter handle daylight saving time?",
      answer:
        "Yes. It uses IANA time-zone data and applies daylight-saving transitions for the chosen date.",
    },
    {
      question: `What time zone is ${page.fromCity} in?`,
      answer: `${page.fromCity} is represented by the IANA time zone ${page.fromZone}.`,
    },
    {
      question: `What time zone is ${page.toCity} in?`,
      answer: `${page.toCity} is represented by the IANA time zone ${page.toZone}.`,
    },
  ];
}

export function getRelatedPages(page: SEOPage) {
  if (page.kind === "relative") {
    const max = maxByType[page.type];
    const candidates = [
      Math.max(1, Math.round(page.amount / 2)),
      page.amount + 7,
      page.amount * 2,
      page.amount * 3,
      7,
      14,
      30,
      90,
    ];
    const related: SEOPage[] = [];
    for (const amount of candidates) {
      if (amount === page.amount || amount > max) continue;
      const match = relativePageMap.get(`${page.type}:${amount}`);
      if (match && !related.some((item) => item.slug === match.slug)) {
        related.push(match);
      }
      if (related.length === 6) break;
    }
    return related;
  }

  if (page.kind === "timezone") {
    return allPages
      .filter(
        (candidate): candidate is TimezoneSEOPage =>
          candidate.kind === "timezone" &&
          candidate.fromCity === page.fromCity &&
          candidate.slug !== page.slug,
      )
      .slice(0, 6);
  }

  const index = allPages.findIndex((candidate) => candidate.slug === page.slug);
  return allPages
    .slice(Math.max(0, index - 3), index + 4)
    .filter(
      (candidate) =>
        candidate.kind === "difference" && candidate.slug !== page.slug,
    )
    .slice(0, 6);
}
