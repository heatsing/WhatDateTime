import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorDirectory } from "@/components/calculator-directory";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { LiveClock } from "@/components/live-clock";
import { QuickAnswer } from "@/components/quick-answer";
import { ToolCard } from "@/components/tool-card";
import { primaryTools, siteConfig } from "@/lib/site";
import { webApplicationSchema } from "@/lib/structured-data";
import { getAllSEOPageIndex } from "@/lib/seoGenerator";

export const metadata: Metadata = {
  title: { absolute: "WhatDateTime — Date & Time Calculators" },
  description:
    "Calculate dates, ages, time differences, countdowns, and time zones with fast, free tools from WhatDateTime.",
  alternates: { canonical: "/" },
};

const quickActions = [
  ["100 days from today", "/100-days-from-today"],
  ["Days between dates", "/calculators/time-difference"],
  ["Time zone converter", "/calculators/timezone-converter"],
] as const;

const commonCalculations = [
  ["What date is 30 days from today?", "/30-days-from-today"],
  ["What date is 90 days from today?", "/90-days-from-today"],
  ["What time is 24 hours from now?", "/24-hours-from-now"],
  ["What date was 7 days ago?", "/7-days-ago"],
  ["What date is 8 weeks from today?", "/8-weeks-from-today"],
  ["What date is 6 months from today?", "/6-months-from-today"],
] as const;

const homeFaqs = [
  { question: "What can I calculate with WhatDateTime?", answer: "You can add or subtract calendar intervals, compare two dates and times, calculate age, run a countdown, and convert times between major time zones." },
  { question: "Does the date calculator include weekends?", answer: "Calendar-day calculations include weekends. Business-day pages skip Saturdays and Sundays." },
  { question: "Which time zone does the site use?", answer: "Current-time tools use your device time zone. Time-zone converters label both the source and destination zones explicitly." },
] as const;

export default function HomePage() {
  const directoryPages = getAllSEOPageIndex();

  return (
    <>
      <JsonLd data={webApplicationSchema("WhatDateTime Date & Time Calculators", siteConfig.description, "/")} />

      <section className="border-b border-[#D9DEE5] bg-white px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[56rem]">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">What Date &amp; Time Is It?</h1>
            <p className="mt-2 text-base leading-7 text-ink/60 sm:text-lg">Calculate dates, count days, and convert time zones instantly.</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-[#C8D0D8] bg-white lg:grid lg:grid-cols-[1.08fr_0.92fr]">
            <LiveClock />
            <QuickAnswer />
          </div>

          <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Quick actions">
            {quickActions.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-fern hover:underline">{label} →</Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Popular tools</h2>
          <p className="mt-2 text-sm text-ink/55">Start with the task you need to complete.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {primaryTools.map((tool) => <ToolCard key={tool.href} {...tool} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E8EB] bg-white px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Common calculations</h2>
          <div className="mt-5 grid border-t border-[#D9DEE5] sm:grid-cols-2">
            {commonCalculations.map(([label, href]) => (
              <Link key={href} href={href} className="border-b border-[#E5E8EB] py-3.5 text-sm font-medium text-ink/70 hover:text-fern sm:odd:pr-6 sm:even:pl-6">{label}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-14">
        <FaqSection title="Frequently asked questions" faqs={homeFaqs} />
      </section>

      <CalculatorDirectory pages={directoryPages} />
    </>
  );
}
