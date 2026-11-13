import {
  getRelativePhrase,
  type RelativeCalculationInput,
} from "./pageCalculations";

/** Stable method FAQs: no build-time result masquerading as today's answer. */
export function relativeFAQs(page: RelativeCalculationInput) {
  const phrase = getRelativePhrase(page);
  const first = {
    question: `How do I find the result for ${phrase}?`,
    answer: `After loading, the calculator uses your device clock and time zone for ${phrase}. The initial HTML is a fixed UTC example. Edit the starting conditions for a custom result, or reset to current time.`,
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
          "Live calculations use the browser's IANA time zone. The zone is shown next to the answer and starting input; the server's fixed example uses UTC, not an assumed visitor location.",
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
