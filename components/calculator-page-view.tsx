import { AgeCalculator } from "@/components/age-calculator";
import { CountdownCalculator } from "@/components/countdown-calculator";
import { DateCalculator } from "@/components/date-calculator";
import { DifferenceCalculator } from "@/components/difference-calculator";
import { TimezoneCalculator } from "@/components/timezone-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";

export type CalculatorKind = "date" | "difference" | "age" | "countdown" | "timezone";

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
} as const;

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
    : <TimezoneCalculator initialTime={initialTime} />;

  return <ToolPageShell {...config}>{calculator}</ToolPageShell>;
}
