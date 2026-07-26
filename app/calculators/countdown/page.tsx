import type { Metadata } from "next";
import { CountdownCalculator } from "@/components/countdown-calculator";
import { ToolPageShell } from "@/components/tool-page-shell";

export const metadata: Metadata = {
  title: "Countdown Timer — Days, Hours & Seconds",
  description: "Create a free live countdown to any future date and time with days, hours, minutes, and seconds.",
  alternates: { canonical: "/calculators/countdown" },
};

const faqs = [
  { question: "How do I start a countdown?", answer: "Choose a future date and time, then select Start countdown. The display updates once per second." },
  { question: "What time zone does the countdown use?", answer: "The selected date and time use your device's local time zone." },
  { question: "Will the countdown keep running if I close the page?", answer: "The target is not stored. Keep the page open to watch it, or enter the same target again when you return." },
  { question: "What happens when the timer reaches zero?", answer: "All units stop at zero and the timer displays a clear 'Time's up' message." },
] as const;

export default function Page() {
  return (
    <ToolPageShell
      title="Countdown Timer"
      eyebrow="Make the moment count"
      description="Turn any upcoming date into a simple, live countdown you can check at a glance."
      path="/calculators/countdown"
      faqs={faqs}
      steps={[
        { title: "Choose the moment", text: "Set the future local date and time." },
        { title: "Start the timer", text: "Launch a live countdown with one click." },
        { title: "Watch it tick", text: "Track remaining days through seconds in real time." },
      ]}
    >
      <CountdownCalculator />
    </ToolPageShell>
  );
}
