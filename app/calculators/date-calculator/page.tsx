import type { Metadata } from "next";
import { DateCalculator } from "@/components/date-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getBuildTime } from "@/lib/build-time";

export const metadata: Metadata = {
  title: "Date Calculator — Add or Subtract Dates",
  description: "Add or subtract days, weeks, months, or years from any date with a free, accurate date calculator.",
  alternates: { canonical: "/calculators/date-calculator" },
};

const faqs = [
  { question: "How do I add days to a date?", answer: "Choose your starting date, select Add, enter the number of days, and calculate. The result automatically crosses month and year boundaries." },
  { question: "Does the calculator account for leap years?", answer: "Yes. It uses real calendar arithmetic, including February 29 in leap years and the correct length of every month." },
  { question: "Can I subtract months or years?", answer: "Yes. Select Subtract and choose months or years. If the destination month is shorter, the result uses the nearest valid calendar date." },
  { question: "Is my date information stored?", answer: "No. Calculations run in your browser and this tool has no database." },
] as const;

export default function Page() {
  const initialTime = getBuildTime();
  return (
    <ToolPageShell
      title="Date Calculator"
      eyebrow="Add or subtract time"
      description="Move forward or backward from any date in a few quick taps. Calendar quirks are handled for you."
      path="/calculators/date-calculator"
      faqs={faqs}
      steps={[
        { title: "Choose a date", text: "Pick any starting date from the calendar." },
        { title: "Set the offset", text: "Choose add or subtract, then enter a number and unit." },
        { title: "Get your date", text: "See the weekday and full calendar date instantly." },
      ]}
    >
      <DateCalculator initialTime={initialTime} />
    </ToolPageShell>
  );
}
