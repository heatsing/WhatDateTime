export function relativeMetaDescription(page, phrase) {
  if (page.unit === "business-day") {
    return `Calculate the date ${phrase}, excluding Saturdays and Sundays. See the weekday, worked formula, calendar view, and nearby business-day results.`;
  }

  if (page.unit === "hour") {
    const operation = page.direction === "past" ? "subtraction" : "addition";
    return `Find the exact local date and time ${phrase}. See the hour ${operation}, date transition, and nearby results with our free time calculator.`;
  }

  if (page.type === "days-ago") {
    return `Find the exact date ${phrase} from today. See the weekday, subtraction formula, calendar view, and nearby dates with our free date calculator.`;
  }

  const detail =
    page.unit === "month"
      ? "month-length handling"
      : page.unit === "year"
        ? "leap-year-aware formula"
        : page.unit === "week"
          ? "week conversion and formula"
          : "addition formula";

  return `Calculate the exact date ${phrase}. See the weekday, ${detail}, calendar view, and nearby dates with our free date calculator.`;
}

export function differenceMetaDescription(start, end) {
  return `Calculate the calendar days between ${start} and ${end}. See elapsed and inclusive totals, complete weeks, and the worked formula.`;
}

export function timezoneMetaDescription(fromCity, toCity) {
  const detailed = `Convert ${fromCity} time to ${toCity}. Compare local time, UTC offsets, date changes, and daylight-saving rules for the selected date.`;
  if (detailed.length <= 170) return detailed;

  return `Convert ${fromCity} time to ${toCity}. Compare local times, UTC offsets, date changes, and daylight-saving rules.`;
}
