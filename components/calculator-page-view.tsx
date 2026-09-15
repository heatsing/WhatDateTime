import { AgeCalculator } from "@/components/age-calculator";
import { CountdownCalculator } from "@/components/countdown-calculator";
import { DateCalculator } from "@/components/date-calculator";
import { DifferenceCalculator } from "@/components/difference-calculator";
import { TimezoneCalculator } from "@/components/timezone-calculator";
import {
  CalendarGenerator,
  DayOfWeekCalculator,
  DaysInMonthCalculator,
  DaysUntilCalculator,
  HalfBirthdayCalculator,
  WeeksAndDaysAgoCalculator,
  WeeksInYearCalculator,
} from "@/components/date-utility-calculators";
import { ToolPageShell } from "@/components/tool-page-shell";

export type CalculatorKind =
  | "date"
  | "difference"
  | "age"
  | "countdown"
  | "timezone"
  | "days-until"
  | "day-of-week"
  | "days-in-month"
  | "weeks-in-year"
  | "calendar"
  | "half-birthday"
  | "weeks-and-days-ago";

const configs = {
  date: {
    metadataTitle: "Date Calculator — Add or Subtract Dates",
    title: "Date Calculator", eyebrow: "Add or subtract time",
    description: "Move forward or backward from any date in a few quick taps. Calendar quirks are handled for you.",
    seoDescription: "Add or subtract days, weeks, months, or years from any date. Get an exact result with calendar-aware month lengths and leap-year calculations.",
    path: "/calculators/date-calculator",
    faqs: [
      { question: "How do I add days to a date?", answer: "Choose your starting date, select Add, enter the number of days, and calculate. The result automatically crosses month and year boundaries." },
      { question: "Does the calculator account for leap years?", answer: "Yes. It uses real calendar arithmetic, including February 29 in leap years and the correct length of every month." },
      { question: "Can I subtract months or years?", answer: "Yes. Select Subtract and choose months or years. If the destination month is shorter, the result uses the nearest valid calendar date." },
      { question: "Is my date information stored?", answer: "No. Calculations run in your browser and this tool has no database." },
    ],
    steps: [
      { title: "Choose a date", text: "Pick any starting date from the calendar." },
      { title: "Set the offset", text: "Choose add or subtract, then enter a number and unit." },
      { title: "Get your date", text: "See the weekday and full calendar date instantly." },
    ],
  },
  difference: {
    metadataTitle: "Time Difference Calculator",
    title: "Time Difference Calculator", eyebrow: "Compare two moments",
    description: "Measure the precise gap between two dates and times, from a readable duration down to total seconds.",
    seoDescription: "Calculate the exact time between two dates and times. See the duration in years, months, days, hours, minutes, seconds, and total elapsed units.",
    path: "/calculators/time-difference",
    faqs: [
      { question: "How is the time difference calculated?", answer: "The calculator compares the two local timestamps and returns both a calendar-style duration and totals in days, hours, minutes, and seconds." },
      { question: "Can the end date be before the start date?", answer: "Yes. The calculator returns the absolute time between the two values, so their order does not affect the size of the result." },
      { question: "Does this account for daylight saving time?", answer: "The entered values are interpreted in your device's local time zone, so browser time-zone rules apply when dates cross a daylight-saving transition." },
      { question: "What is the difference between total days and duration days?", answer: "Total days counts the whole interval in 24-hour units. Duration days are the days left after complete years and months are separated out." },
    ],
    steps: [
      { title: "Set the start", text: "Enter the first date and local time." },
      { title: "Set the end", text: "Choose the moment you want to compare it with." },
      { title: "See every unit", text: "Read the duration plus useful totals at a glance." },
    ],
  },
  age: {
    metadataTitle: "Age Calculator — Exact Age in Years & Days",
    title: "Age Calculator", eyebrow: "Your story in numbers",
    description: "Find an exact age in years, months, and days—or see how many calendar days have passed.",
    seoDescription: "Calculate age from a birth date to today or any selected date. See exact years, months, days, and total calendar days with a clear breakdown.",
    path: "/calculators/age-calculator",
    faqs: [
      { question: "How does the age calculator work?", answer: "It measures the calendar interval from the birth date to the selected date, preserving full years, months, and remaining days." },
      { question: "Can I calculate my age on a future or past date?", answer: "Yes. Change the 'calculate age on' field to any date after the birth date." },
      { question: "Are leap-day birthdays handled?", answer: "Yes. Calendar arithmetic correctly handles February 29 and non-leap years." },
      { question: "Why can total days vary between people of the same age?", answer: "Month lengths and leap years change the number of elapsed days, even when two ages look similar in years and months." },
    ],
    steps: [
      { title: "Enter a birthday", text: "Choose the date of birth you want to measure from." },
      { title: "Pick an as-of date", text: "Use today or calculate age on another date." },
      { title: "See the breakdown", text: "Get complete years, months, days, and total days." },
    ],
  },
  countdown: {
    metadataTitle: "Countdown Timer — Days, Hours & Seconds",
    title: "Countdown Timer", eyebrow: "Make the moment count",
    description: "Turn any upcoming date into a simple, live countdown you can check at a glance.",
    seoDescription: "Create a live countdown to any date and time. Track the remaining days, hours, minutes, and seconds using your device's local time zone.",
    path: "/calculators/countdown",
    faqs: [
      { question: "How do I start a countdown?", answer: "Choose a future date and time, then select Start countdown. The display updates once per second." },
      { question: "What time zone does the countdown use?", answer: "The selected date and time use your device's local time zone." },
      { question: "Will the countdown keep running if I close the page?", answer: "The target is not stored. Keep the page open to watch it, or enter the same target again when you return." },
      { question: "What happens when the timer reaches zero?", answer: "All units stop at zero and the timer displays a clear 'Time's up' message." },
    ],
    steps: [
      { title: "Choose the moment", text: "Set the future local date and time." },
      { title: "Start the timer", text: "Launch a live countdown with one click." },
      { title: "Watch it tick", text: "Track remaining days through seconds in real time." },
    ],
  },
  timezone: {
    metadataTitle: "Time Zone Converter — World Time",
    title: "Time Zone Converter", eyebrow: "One moment, anywhere",
    description: "Translate a date and time between major world cities with regional clock changes handled automatically.",
    seoDescription: "Convert a date and time between major world time zones. Compare local times, UTC offsets, date changes, and daylight-saving rules instantly.",
    path: "/calculators/timezone-converter",
    faqs: [
      { question: "How do I convert a time zone?", answer: "Enter a wall-clock date and time, choose its original time zone, then choose the destination time zone and convert." },
      { question: "Does the converter account for daylight saving time?", answer: "Yes. It applies the time-zone rules for the selected date, including daylight-saving offsets where applicable." },
      { question: "What does the time-zone abbreviation mean?", answer: "The abbreviation beside the result identifies the active standard or daylight time for the destination zone on that date." },
      { question: "Why can two cities change their time difference?", answer: "Regions may start and end daylight saving on different dates—or not observe it at all—so their offset can change during the year." },
    ],
    steps: [
      { title: "Enter the time", text: "Choose the date and wall-clock time you know." },
      { title: "Choose two zones", text: "Select where the time starts and where it should go." },
      { title: "Read local time", text: "See the matching date, time, and zone abbreviation." },
    ],
  },
  "days-until": {
    metadataTitle: "Days Until Date Calculator",
    title: "Days Until Date Calculator", eyebrow: "Count down by calendar date",
    description: "Count the exact number of calendar days between today—or any starting date—and a target date.",
    seoDescription: "Calculate how many days are left until any date. See the result in total days plus complete weeks and remaining days using your local calendar date.",
    path: "/calculators/days-until",
    faqs: [
      { question: "How do I calculate the days until a date?", answer: "Select a starting date and a target date. The calculator compares their calendar dates and reports the exact number of days between them." },
      { question: "Does the days-until result include today?", answer: "No. It measures the number of date boundaries from the starting date to the target date. Tomorrow is one day away." },
      { question: "Are weekends included?", answer: "Yes. This calculator counts calendar days, so Saturdays, Sundays, and holidays are included." },
      { question: "Can I calculate a date that has already passed?", answer: "Yes. A past target is labeled as days ago while the absolute elapsed-day total remains easy to read." },
    ],
    steps: [
      { title: "Choose the start", text: "Keep today's local date or select another starting date." },
      { title: "Set the target", text: "Pick the event, deadline, or date you are counting toward." },
      { title: "Read the interval", text: "See total calendar days and the equivalent weeks and days." },
    ],
  },
  "day-of-week": {
    metadataTitle: "Day of the Week Calculator",
    title: "Day of the Week Calculator", eyebrow: "Identify any calendar day",
    description: "Choose a past or future date and instantly find its weekday, day of the year, and ISO week number.",
    seoDescription: "Find what day of the week any date falls on. Get the weekday name, day-of-year number, and ISO week number for past or future dates.",
    path: "/calculators/day-of-week",
    faqs: [
      { question: "How can I find the weekday for a date?", answer: "Enter the full calendar date and calculate. The result names the weekday and adds its day-of-year and ISO week positions." },
      { question: "Can this check historical dates?", answer: "Yes. You can select supported past dates as well as future dates." },
      { question: "What is an ISO week number?", answer: "ISO weeks begin on Monday. Week 1 is the week containing the year's first Thursday, which keeps week numbering consistent across years." },
      { question: "Does a leap year change the weekday calculation?", answer: "Leap years add February 29, and the calculator automatically applies that extra calendar day." },
    ],
    steps: [
      { title: "Enter a date", text: "Pick the month, day, and year you want to identify." },
      { title: "Run the check", text: "Calculate using the real Gregorian calendar." },
      { title: "Use the details", text: "Read the weekday, ordinal day, and ISO week together." },
    ],
  },
  "days-in-month": {
    metadataTitle: "Days in a Month Calculator",
    title: "Days in a Month Calculator", eyebrow: "Check month length",
    description: "Find whether a selected month contains 28, 29, 30, or 31 days, with leap years handled automatically.",
    seoDescription: "Check how many days are in any month and year. The calculator handles February, leap years, and every 28, 29, 30, or 31-day month.",
    path: "/calculators/days-in-month",
    faqs: [
      { question: "Which months have 30 days?", answer: "April, June, September, and November have 30 days. The other months have 31 except February." },
      { question: "When does February have 29 days?", answer: "February has 29 days in leap years: normally years divisible by 4, except century years unless they are also divisible by 400." },
      { question: "How many days are in a calendar month?", answer: "A Gregorian calendar month contains 28, 29, 30, or 31 days depending on the month and year." },
      { question: "Can I check a future year?", answer: "Yes. Select any supported year to check that month's exact length." },
    ],
    steps: [
      { title: "Select a month", text: "Choose January through December." },
      { title: "Enter the year", text: "The year determines whether February gains a leap day." },
      { title: "See the total", text: "Get the exact number of days and leap-year status." },
    ],
  },
  "weeks-in-year": {
    metadataTitle: "Weeks in a Year Calculator",
    title: "Weeks in a Year Calculator", eyebrow: "Understand the calendar year",
    description: "Check whether a year contains 52 or 53 ISO weeks and whether it has 365 or 366 calendar days.",
    seoDescription: "Calculate how many ISO weeks are in any year. See whether the year has 52 or 53 weeks, 365 or 366 days, and leap-year status.",
    path: "/calculators/weeks-in-year",
    faqs: [
      { question: "Does every year have exactly 52 weeks?", answer: "Every year has at least 52 complete weeks plus one day, or two days in a leap year. Under ISO numbering, some years contain a numbered week 53." },
      { question: "When does a year have 53 ISO weeks?", answer: "An ISO year has week 53 when its calendar alignment leaves a final Thursday in that numbered week, commonly when January 1 is Thursday or a leap year begins Wednesday." },
      { question: "How many days are in a year?", answer: "A common year contains 365 days. A leap year contains 366 days." },
      { question: "Why do ISO weeks start on Monday?", answer: "ISO 8601 defines Monday as the first weekday so business and reporting calendars can use one consistent international system." },
    ],
    steps: [
      { title: "Enter a year", text: "Use the current year or choose another one." },
      { title: "Apply ISO rules", text: "The calculator evaluates the year's ISO week calendar." },
      { title: "Compare totals", text: "See numbered weeks, total days, and leap-year status." },
    ],
  },
  calendar: {
    metadataTitle: "Monthly Calendar Generator",
    title: "Monthly Calendar Generator", eyebrow: "View any month",
    description: "Generate a clean six-week calendar view for any month and year, including nearby dates for planning context.",
    seoDescription: "Generate a monthly calendar for any month and year. View weekdays, complete week rows, and adjacent-month dates in a clear planning calendar.",
    path: "/calculators/calendar",
    faqs: [
      { question: "How do I generate a calendar for a month?", answer: "Select the month and year, then generate the calendar. The complete month appears in a Sunday-through-Saturday grid." },
      { question: "Why are dates from nearby months shown?", answer: "Adjacent dates complete the first and last calendar weeks, making the grid easier to use for planning across month boundaries." },
      { question: "Does the calendar include leap day?", answer: "Yes. February 29 appears automatically whenever the selected year is a leap year." },
      { question: "Can I generate a past calendar?", answer: "Yes. The generator works for supported historical and future years." },
    ],
    steps: [
      { title: "Choose the month", text: "Select the month you want to display." },
      { title: "Choose the year", text: "Enter a historical, current, or future year." },
      { title: "View the grid", text: "Use the complete six-week layout for scheduling and reference." },
    ],
  },
  "half-birthday": {
    metadataTitle: "Half Birthday Calculator",
    title: "Half Birthday Calculator", eyebrow: "Find the six-month milestone",
    description: "Enter a birthday to find the calendar date that falls exactly six months later.",
    seoDescription: "Calculate a half birthday from any birth date. Find the exact calendar date six months after the birthday, with month lengths handled correctly.",
    path: "/calculators/half-birthday",
    faqs: [
      { question: "What is a half birthday?", answer: "A half birthday is the date six calendar months after a person's birthday." },
      { question: "Is a half birthday always 182 or 183 days later?", answer: "Not necessarily. Month lengths and leap years vary, so adding six calendar months is more reliable than assuming a fixed number of days." },
      { question: "How are month-end birthdays handled?", answer: "If the destination month is shorter, calendar arithmetic uses the nearest valid final day in that month." },
      { question: "Can adults use a half birthday calculator?", answer: "Yes. Half birthdays can mark any six-month milestone, regardless of age." },
    ],
    steps: [
      { title: "Enter the birthday", text: "Choose the original month, day, and year." },
      { title: "Add six months", text: "The calculator uses calendar months, not a fixed day estimate." },
      { title: "Get the date", text: "See the exact half-birthday date in a readable format." },
    ],
  },
  "weeks-and-days-ago": {
    metadataTitle: "Weeks and Days Ago Calculator",
    title: "Weeks and Days Ago Calculator", eyebrow: "Find a past date",
    description: "Combine complete weeks with extra days to find the exact date before today in your local time.",
    seoDescription: "Calculate the date a chosen number of weeks and days ago. Combine both units and get the exact past weekday and calendar date from today.",
    path: "/calculators/weeks-and-days-ago",
    faqs: [
      { question: "How do I calculate weeks and days ago?", answer: "Enter complete weeks and zero to six additional days. The calculator converts the interval to days and subtracts it from your current local date." },
      { question: "How many days are in eight weeks and two days?", answer: "Eight weeks contain 56 days, so eight weeks and two days equal 58 calendar days." },
      { question: "Are weekends included in the past-date result?", answer: "Yes. This tool uses calendar days and includes every weekend and holiday." },
      { question: "Does the calculation update with today's date?", answer: "Yes. When the page loads, it uses the current date reported by your device." },
    ],
    steps: [
      { title: "Enter weeks", text: "Choose the number of complete seven-day periods." },
      { title: "Add extra days", text: "Include any remaining days beyond the complete weeks." },
      { title: "Find the past date", text: "See the exact weekday and date relative to today." },
    ],
  },
} as const;

const calculatorContent: Record<CalculatorKind, {
  methodology: { title: string; paragraphs: ReadonlyArray<string> };
  accuracy: { title: string; text: string };
  useCases: ReadonlyArray<string>;
}> = {
  date: {
    methodology: {
      title: "How Date Addition and Subtraction Works",
      paragraphs: [
        "The calculator starts with the date you enter and moves by the selected calendar unit. Days and weeks use fixed day counts, while months and years follow actual calendar boundaries rather than an estimated number of days.",
        "When a destination month is shorter than the starting month, the result is adjusted to a valid date. Leap years, February 29, and year changes are handled as part of the Gregorian calendar calculation.",
      ],
    },
    accuracy: { title: "Month-end dates", text: "Adding one month to a late-month date may land on the final valid day of the destination month. Always use the displayed calendar result instead of assuming every month has 30 days." },
    useCases: ["Set project and contract deadlines", "Calculate renewal and expiration dates", "Plan travel and event dates", "Add terms to invoices or payment schedules", "Check school and training milestones", "Verify future or historical anniversaries"],
  },
  difference: {
    methodology: {
      title: "How the Time Difference Is Calculated",
      paragraphs: [
        "The two entered timestamps are converted into comparable moments, then the elapsed interval between them is measured. The result is shown both as a readable calendar duration and as total days, hours, minutes, and seconds.",
        "Calendar years and months do not have fixed lengths, so the calendar breakdown can differ from simply dividing total hours. The totals remain useful when a schedule, payroll record, or duration rule is expressed in one fixed unit.",
      ],
    },
    accuracy: { title: "Local-time interpretation", text: "Both entries use your device's local time zone. If the interval crosses a daylight-saving clock change, elapsed hours can differ from the number of calendar-date boundaries crossed." },
    useCases: ["Measure project or task duration", "Compare arrival and departure times", "Calculate working or study sessions", "Check elapsed time between events", "Convert a duration into total hours", "Verify timestamp-based records"],
  },
  age: {
    methodology: {
      title: "How Exact Age Is Calculated",
      paragraphs: [
        "Exact age is measured in completed calendar years first, followed by completed months and remaining days. This avoids treating a year as a fixed 365-day period or a month as a fixed 30-day period.",
        "The selected as-of date controls the answer, so the tool can calculate a current age or an age on a past or future date. Leap days and different month lengths are included automatically.",
      ],
    },
    accuracy: { title: "Birthday boundaries", text: "A new year of age is completed on the calendar anniversary of the birth date. February 29 birthdays require the valid-date convention shown by the calculator in non-leap years." },
    useCases: ["Check age on an application date", "Plan birthday milestones", "Confirm age-based eligibility", "Calculate a child's exact age", "Compare age on a historical date", "Find total elapsed calendar days"],
  },
  countdown: {
    methodology: {
      title: "How the Live Countdown Works",
      paragraphs: [
        "The target date and time are interpreted in your device's local time zone. The remaining duration is recalculated every second and separated into complete days, hours, minutes, and seconds.",
        "The countdown reaches zero at the exact local timestamp you selected. It does not remove weekends or business closures because it measures continuous elapsed time.",
      ],
    },
    accuracy: { title: "Keep this page open", text: "The countdown updates from your device clock and the target is not stored in a database. If you close the page, enter the target again when you return." },
    useCases: ["Track an event or launch", "Count down to a trip", "Monitor an assignment deadline", "Prepare for a meeting start", "Follow a birthday or anniversary", "Time a personal milestone"],
  },
  timezone: {
    methodology: {
      title: "How Time Zone Conversion Works",
      paragraphs: [
        "The source wall-clock time is interpreted using the selected region's time-zone rules. That moment is then displayed in the destination zone, including the correct calendar date and UTC offset.",
        "Named regional zones are used instead of fixed abbreviations because offsets can change with daylight-saving rules. A conversion may therefore produce a different date or a seasonal difference between the same two cities.",
      ],
    },
    accuracy: { title: "Date-specific offsets", text: "Time-zone offsets are calculated for the date you enter. Recheck recurring meetings near daylight-saving transitions because regions may change clocks on different dates." },
    useCases: ["Schedule international meetings", "Convert flight and arrival times", "Coordinate remote teams", "Publish global event times", "Check overseas deadlines", "Plan calls with family or clients"],
  },
  "days-until": {
    methodology: {
      title: "How Days Until a Date Are Counted",
      paragraphs: [
        "The calculator compares the starting calendar date with the target calendar date and counts the date boundaries between them. Tomorrow is one day from today because one midnight boundary separates the two dates.",
        "The total is also expressed as complete seven-day weeks plus remaining days. Weekends and holidays remain in the count because this tool measures calendar days, not business days.",
      ],
    },
    accuracy: { title: "Exclusive starting date", text: "The starting date is treated as day zero. If a rule calls the starting date day one, apply that separate inclusive-count convention to the displayed interval." },
    useCases: ["Count down to a deadline", "Plan a vacation or event", "Track an exam or application date", "Measure days until a birthday", "Check a delivery window", "Compare future calendar milestones"],
  },
  "day-of-week": {
    methodology: {
      title: "How a Date's Weekday Is Determined",
      paragraphs: [
        "The entered date is placed on the Gregorian calendar and matched to its weekday. The same calculation also identifies its ordinal position within the year and its ISO week number.",
        "ISO weeks start on Monday, and ISO week 1 is the week containing the year's first Thursday. This means the first or last few calendar dates of a year can belong to a neighboring ISO week-year.",
      ],
    },
    accuracy: { title: "Calendar system", text: "Results use the proleptic Gregorian calendar for supported dates. Historical locations that adopted the Gregorian calendar later may have used a different civil calendar at the time." },
    useCases: ["Verify the weekday of an event", "Check a historical calendar date", "Plan an anniversary", "Identify an ISO reporting week", "Confirm a future appointment day", "Find a date's day-of-year number"],
  },
  "days-in-month": {
    methodology: {
      title: "How Month Length Is Determined",
      paragraphs: [
        "April, June, September, and November contain 30 days; most other months contain 31. February contains 28 days in a common year and 29 days in a leap year.",
        "A year is normally a leap year when divisible by four. Century years are exceptions unless they are also divisible by 400, which is why 2000 was a leap year but 1900 was not.",
      ],
    },
    accuracy: { title: "Gregorian leap-year rule", text: "The calculation applies the complete divisible-by-4, century, and divisible-by-400 rules rather than checking divisibility by four alone." },
    useCases: ["Plan monthly schedules", "Validate date input ranges", "Count billing-period days", "Check February in a future year", "Prepare calendar templates", "Verify month-end deadlines"],
  },
  "weeks-in-year": {
    methodology: {
      title: "How ISO Weeks in a Year Are Counted",
      paragraphs: [
        "An ISO week begins on Monday and ends on Sunday. ISO week 1 is the week containing January 4, equivalently the week containing the first Thursday of the year.",
        "Every ISO week-year contains 52 or 53 numbered weeks. A calendar year still contains 365 days, or 366 in a leap year, so its opening and closing dates may fall in a neighboring ISO week-year.",
      ],
    },
    accuracy: { title: "ISO year versus calendar year", text: "The ISO week-year can begin in late December or end in early January. Use the displayed ISO total for weekly reporting rather than dividing calendar days by seven." },
    useCases: ["Prepare weekly reporting calendars", "Plan payroll periods", "Check years with ISO week 53", "Organize production schedules", "Build school-week plans", "Validate week-numbered datasets"],
  },
  calendar: {
    methodology: {
      title: "How the Monthly Calendar Is Generated",
      paragraphs: [
        "The generator identifies the weekday of the month's first day and the exact number of days in that month. It then fills complete Sunday-through-Saturday rows with the selected month and adjacent dates.",
        "Showing nearby dates keeps every row complete and makes plans that cross a month boundary easier to read. February and leap years are resolved from the selected year.",
      ],
    },
    accuracy: { title: "Six-week calendar view", text: "The grid includes enough adjacent-month dates to maintain complete weeks. Only dates belonging to the selected month are treated as its calendar days." },
    useCases: ["Plan a monthly schedule", "Review historical dates", "Create an event calendar", "Check weekends and weekdays", "Map deadlines across months", "Prepare a printable planning reference"],
  },
  "half-birthday": {
    methodology: {
      title: "How a Half Birthday Is Calculated",
      paragraphs: [
        "A half birthday is found by adding six calendar months to the entered birthday. This keeps the date tied to a calendar-month anniversary rather than assuming half of 365 days.",
        "Because consecutive six-month periods contain different month lengths, the elapsed day total can vary. Late-month birthdays are adjusted when the destination month does not contain the same day number.",
      ],
    },
    accuracy: { title: "Six months, not a fixed day count", text: "The tool adds six calendar months. A fixed 182- or 183-day calculation can produce a different date and represents a different rule." },
    useCases: ["Celebrate a child's half birthday", "Mark a six-month milestone", "Plan an age-based photo session", "Schedule a midyear check-in", "Calculate six months from a birth date", "Compare full and half birthdays"],
  },
  "weeks-and-days-ago": {
    methodology: {
      title: "How Weeks and Days Ago Are Calculated",
      paragraphs: [
        "Each complete week is converted to seven calendar days, then the additional days are added to that interval. The combined total is subtracted from the current local calendar date.",
        "The calculation moves across real month and year boundaries and includes every weekend and holiday. The displayed weekday provides a quick check of the resulting past date.",
      ],
    },
    accuracy: { title: "Live local starting date", text: "The starting date comes from your device when the page loads. Reopening the calculator on another day produces a newly calibrated result." },
    useCases: ["Reconstruct a past deadline", "Date notes recorded by elapsed weeks", "Check a previous appointment", "Find a historical milestone", "Verify a delivery or follow-up date", "Convert a relative date into a calendar date"],
  },
};

export const calculatorMetadata = Object.fromEntries(Object.entries(configs).map(([kind, config]) => [kind, {
  title: config.metadataTitle,
  description: config.seoDescription,
  path: config.path,
}])) as Record<CalculatorKind, { title: string; description: string; path: string }>;

export function CalculatorPageView({ kind, initialTime }: { kind: CalculatorKind; initialTime: string }) {
  const config = configs[kind];
  const calculator = kind === "date" ? <DateCalculator initialTime={initialTime} />
    : kind === "difference" ? <DifferenceCalculator initialTime={initialTime} />
    : kind === "age" ? <AgeCalculator initialTime={initialTime} />
    : kind === "countdown" ? <CountdownCalculator initialTime={initialTime} />
    : kind === "timezone" ? <TimezoneCalculator initialTime={initialTime} />
    : kind === "days-until" ? <DaysUntilCalculator initialTime={initialTime} />
    : kind === "day-of-week" ? <DayOfWeekCalculator initialTime={initialTime} />
    : kind === "days-in-month" ? <DaysInMonthCalculator initialTime={initialTime} />
    : kind === "weeks-in-year" ? <WeeksInYearCalculator initialTime={initialTime} />
    : kind === "calendar" ? <CalendarGenerator initialTime={initialTime} />
    : kind === "half-birthday" ? <HalfBirthdayCalculator initialTime={initialTime} />
    : <WeeksAndDaysAgoCalculator initialTime={initialTime} />;

  return <ToolPageShell {...config} {...calculatorContent[kind]}>{calculator}</ToolPageShell>;
}
