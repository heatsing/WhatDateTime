import type { Metadata } from "next";
import { DifferenceCalculator } from "@/components/difference-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";

export const metadata: Metadata = {
  title: "Time Difference Calculator",
  description: "Find the exact difference between two dates and times in days, hours, minutes, and seconds.",
  alternates: { canonical: "/calculators/time-difference" },
};

const faqs = [
  { question: "How is the time difference calculated?", answer: "The calculator compares the two local timestamps and returns both a calendar-style duration and totals in days, hours, minutes, and seconds." },
  { question: "Can the end date be before the start date?", answer: "Yes. The calculator returns the absolute time between the two values, so their order does not affect the size of the result." },
  { question: "Does this account for daylight saving time?", answer: "The entered values are interpreted in your device's local time zone, so browser time-zone rules apply when dates cross a daylight-saving transition." },
  { question: "What is the difference between total days and duration days?", answer: "Total days counts the whole interval in 24-hour units. Duration days are the days left after complete years and months are separated out." },
] as const;

export default function Page() {
  const initialTime = new Date().toISOString();
  return (
    <ToolPageShell
      title="Time Difference Calculator"
      eyebrow="Compare two moments"
      description="Measure the precise gap between two dates and times, from a readable duration down to total seconds."
      path="/calculators/time-difference"
      faqs={faqs}
      steps={[
        { title: "Set the start", text: "Enter the first date and local time." },
        { title: "Set the end", text: "Choose the moment you want to compare it with." },
        { title: "See every unit", text: "Read the duration plus useful totals at a glance." },
      ]}
    >
      <DifferenceCalculator initialTime={initialTime} />
    </ToolPageShell>
  );
}
