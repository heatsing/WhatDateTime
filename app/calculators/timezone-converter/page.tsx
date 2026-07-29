import type { Metadata } from "next";
import { TimezoneCalculator } from "@/components/timezone-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getBuildTime } from "@/lib/build-time";

export const metadata: Metadata = {
  title: "Time Zone Converter — World Time",
  description: "Convert a date and time between popular world time zones with daylight-saving rules included.",
  alternates: { canonical: "/calculators/timezone-converter" },
};

const faqs = [
  { question: "How do I convert a time zone?", answer: "Enter a wall-clock date and time, choose its original time zone, then choose the destination time zone and convert." },
  { question: "Does the converter account for daylight saving time?", answer: "Yes. It applies the time-zone rules for the selected date, including daylight-saving offsets where applicable." },
  { question: "What does the time-zone abbreviation mean?", answer: "The abbreviation beside the result identifies the active standard or daylight time for the destination zone on that date." },
  { question: "Why can two cities change their time difference?", answer: "Regions may start and end daylight saving on different dates—or not observe it at all—so their offset can change during the year." },
] as const;

export default function Page() {
  const initialTime = getBuildTime();
  return (
    <ToolPageShell
      title="Time Zone Converter"
      eyebrow="One moment, anywhere"
      description="Translate a date and time between major world cities with regional clock changes handled automatically."
      path="/calculators/timezone-converter"
      faqs={faqs}
      steps={[
        { title: "Enter the time", text: "Choose the date and wall-clock time you know." },
        { title: "Choose two zones", text: "Select where the time starts and where it should go." },
        { title: "Read local time", text: "See the matching date, time, and zone abbreviation." },
      ]}
    >
      <TimezoneCalculator initialTime={initialTime} />
    </ToolPageShell>
  );
}
