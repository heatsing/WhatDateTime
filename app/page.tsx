import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { QuickAnswer } from "@/components/quick-answer";
import { ToolCard } from "@/components/tool-card";
import { primaryTools, siteConfig } from "@/lib/site";
import { webApplicationSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Date & Time Calculators",
  description:
    "Calculate dates, ages, time differences, countdowns, and time zones with fast, free tools from ChronoCraft.",
  alternates: { canonical: "/" },
};

const popular = [
  { amount: "24", unit: "hours", phrase: "from now", href: "/24-hours-from-now", tone: "bg-lime/50" },
  { amount: "30", unit: "days", phrase: "from today", href: "/30-days-from-today", tone: "bg-peach/80" },
  { amount: "8", unit: "weeks", phrase: "from today", href: "/8-weeks-from-today", tone: "bg-[#DDEEFF]" },
  { amount: "6", unit: "months", phrase: "from today", href: "/6-months-from-today", tone: "bg-[#E9E2FF]" },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={webApplicationSchema(
          "ChronoCraft Date & Time Calculators",
          siteConfig.description,
          "/",
        )}
      />
      <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="hero-grid absolute inset-0 -z-20" />
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-lime/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fern/15 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-fern shadow-sm">
            <Icon name="spark" className="h-4 w-4" />
            Clear answers, right on time
          </span>
          <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] text-ink sm:text-7xl">
            Date & time,
            <span className="relative mx-2 inline-block">
              beautifully
              <svg className="absolute -bottom-2 left-0 w-full text-lime" viewBox="0 0 250 14" fill="none" aria-hidden="true">
                <path d="M3 10C57 3 151 2 247 7" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
            simple.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">
            Calculate any date, compare times, or count down to what matters.
            No clutter, no guesswork—just a clear answer.
          </p>
          <QuickAnswer />
          <p className="mt-4 text-xs text-ink/40">Free forever · No sign-up · Works in your local time</p>
        </div>
      </section>

      <section className="bg-mist px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">Pick a tool</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Everything you need to work with time
            </h2>
            <p className="mt-4 leading-7 text-ink/55">
              Purpose-built calculators that keep the hard parts out of sight.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {primaryTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white shadow-card">
              <div className="noise absolute inset-0 opacity-20" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-lime">
                  <Icon name="spark" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">Quick date answers</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">Explore hundreds of ready-made date and time answers.</p>
                <Link href="/7-days-from-today" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-lime">
                  Browse answers <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">Popular right now</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Answers in one tap</h2>
            </div>
            <Link href="/1-day-from-today" className="inline-flex items-center gap-2 text-sm font-bold text-fern">
              Start with tomorrow <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-[1.5rem] p-6 transition hover:-translate-y-1 ${item.tone}`}
              >
                <span className="font-display text-4xl font-extrabold tracking-tight text-ink">{item.amount}</span>
                <span className="ml-2 font-bold text-ink/70">{item.unit}</span>
                <p className="mt-1 text-sm text-ink/55">{item.phrase}</p>
                <span className="mt-8 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-ink transition group-hover:translate-x-1">
                  <Icon name="arrow" className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
              Date calculation, explained
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Accurate answers for any date or time question
            </h2>
          </div>
          <div className="grid gap-6 text-sm leading-7 text-ink/60 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Calendar-aware calculations
              </h3>
              <p className="mt-2">
                ChronoCraft accounts for different month lengths, leap years,
                weekdays, weekends, and daylight-saving transitions. Use it for
                deadlines, schedules, travel, billing periods, or everyday
                planning.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Thousands of direct answers
              </h3>
              <p className="mt-2">
                Browse exact answers for days, hours, weeks, months, years,
                business days, date differences, and international time zones.
                Every page includes a calculator so you can adjust the result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-fern px-6 py-12 text-center text-white sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Made for real life</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Deadlines, birthdays, trips, launches—plan all of it with confidence.
          </h2>
          <Link href="/calculators/date-calculator" className="mt-7 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5">
            Calculate a date <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
