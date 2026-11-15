import {
  getRelativePhrase,
  type RelativeCalculationInput,
} from "./pageCalculations";

/** Stable method FAQs: no build-time result masquerading as today's answer. */
export function relativeFAQs(page: RelativeCalculationInput) {
  const phrase = getRelativePhrase(page);
  const action = page.direction === "future" ? "add" : "subtract";
  const amount = `${page.amount} ${page.unit.replace("-", " ")}${page.amount === 1 ? "" : "s"}`;
  const method = page.unit === "hour"
    ? `Each hour is 60 elapsed minutes, so ${amount} equals ${page.amount * 60} minutes.`
    : page.unit === "business-day"
      ? "Count Monday through Friday, skipping Saturdays and Sundays. The starting date is not counted, and public holidays are not excluded."
      : page.unit === "week"
        ? `Each week is seven calendar days, so ${amount} equals ${page.amount * 7} calendar days. Weekends and holidays are included.`
        : page.unit === "month" || page.unit === "year"
          ? "Keep the same day of the month where possible. If that date does not exist in the target month, use its last day."
          : "Move one calendar date at a time. Weekends and holidays are included; the starting date is not counted.";
  const first = {
    question: `How do I find the result for ${phrase}?`,
    answer: `Start with the date and time shown in the calculator, then ${action} ${amount}. ${method} Choose a different starting date for a custom result, or select Reset to current time to calculate from now.`,
  };
  if (page.unit === "hour")
    return [
      first,
      {
        question: `What happens if ${phrase} crosses midnight?`,
        answer:
          "The result date moves forward or backward as needed. The answer, timeline and nearby calculations show the resulting calendar date using the same starting instant.",
      },
      {
        question: "Which time zone is used?",
        answer:
          "The live answer uses your device's time zone, shown beside the result and starting input. For example, America/New_York follows New York's local time and daylight-saving rules. A result labeled Example uses the stated UTC starting time; it is not the current answer.",
      },
      {
        question: "What happens during daylight saving time changes?",
        answer:
          "Each hour is 60 elapsed minutes. A skipped or repeated local clock hour can change the displayed clock difference. Ambiguous or nonexistent custom starting times must be replaced with an unambiguous time; the Time Zone Converter can display both occurrences.",
      },
      {
        question: "Will automatic updates replace my starting time?",
        answer:
          "No. Editing an input freezes the starting time. Valid inputs update the answer and timeline together; invalid inputs leave the last valid result clearly labeled. Reset to current time restores the page defaults and resumes live calculations.",
      },
    ];
  if (page.unit === "business-day")
    return [
      first,
      {
        question: `Are weekends included in ${page.amount} business days?`,
        answer:
          "No. Saturdays and Sundays are skipped in either direction. A Friday plus one business day is Monday.",
      },
      {
        question: "Are public holidays excluded?",
        answer:
          "No. Weekends are excluded. Public holidays are not excluded. Check the relevant holiday calendar before treating this result as an official deadline.",
      },
      {
        question: "Does the starting date count as a business day?",
        answer:
          "No. Counting starts on the next or previous date. An interval of zero leaves the starting date unchanged, even on a weekend.",
      },
      {
        question:
          "Can I choose a different starting date or subtract business days?",
        answer:
          "Yes. Choose the starting date and Subtract or Add. Valid inputs update the answer immediately. Your custom starting time remains fixed until Reset to current time.",
      },
    ];
  return [
    first,
    {
      question: "Is the starting day included?",
      answer:
        "No. Adding one calendar day returns the next date; subtracting one returns the previous date. Zero returns the starting date.",
    },
    {
      question: "How are month-end dates handled?",
      answer:
        "For month and year arithmetic, the day is clamped to the last valid day in the target month. For example, January 31, 2028 plus one month is February 29, 2028.",
    },
    {
      question: "Does the calculation handle leap years?",
      answer:
        "Yes. It uses Gregorian calendar rules, so February 28, 2028 plus one day is February 29, 2028.",
    },
    {
      question: "Is a calendar day always 24 elapsed hours?",
      answer:
        "No. Calendar days follow local dates and can span 23 or 25 hours during daylight-saving changes. Use hours for an elapsed-time interval. Weekends and holidays are included unless you choose business days.",
    },
  ];
}
