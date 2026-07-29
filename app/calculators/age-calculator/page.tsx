import type { Metadata } from "next";
import { AgeCalculator } from "@/components/age-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getBuildTime } from "@/lib/build-time";

export const metadata: Metadata = {
  title: "Age Calculator — Exact Age in Years & Days",
  description: "Calculate your exact age in years, months, days, and total calendar days on any date.",
  alternates: { canonical: "/calculators/age-calculator" },
};

const faqs = [
  { question: "How does the age calculator work?", answer: "It measures the calendar interval from the birth date to the selected date, preserving full years, months, and remaining days." },
  { question: "Can I calculate my age on a future or past date?", answer: "Yes. Change the 'calculate age on' field to any date after the birth date." },
  { question: "Are leap-day birthdays handled?", answer: "Yes. Calendar arithmetic correctly handles February 29 and non-leap years." },
  { question: "Why can total days vary between people of the same age?", answer: "Month lengths and leap years change the number of elapsed days, even when two ages look similar in years and months." },
] as const;

export default function Page() {
  const initialTime = getBuildTime();
  return (
    <ToolPageShell
      title="Age Calculator"
      eyebrow="Your story in numbers"
      description="Find an exact age in years, months, and days—or see how many calendar days have passed."
      path="/calculators/age-calculator"
      faqs={faqs}
      steps={[
        { title: "Enter a birthday", text: "Choose the date of birth you want to measure from." },
        { title: "Pick an as-of date", text: "Use today or calculate age on another date." },
        { title: "See the breakdown", text: "Get complete years, months, days, and total days." },
      ]}
    >
      <AgeCalculator initialTime={initialTime} />
    </ToolPageShell>
  );
}
