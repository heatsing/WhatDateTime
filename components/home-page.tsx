"use client";

import Link from "@/components/link";
import { JsonLd } from "@/components/json-ld";
import { LiveClock } from "@/components/live-clock";
import { siteConfig } from "@/lib/site";
import {
  faqSchema,
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
} from "@/lib/structured-data";
import {
  CalendarDays,
  CakeSlice,
  ChevronRight,
  CircleHelp,
  Clock3,
  Globe2,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type ToolLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const calculatorLinks: ReadonlyArray<ToolLink> = [
  { title: "Date Calculator", description: "Add or subtract days, weeks, months, or years from a date.", href: "/calculators/date-calculator", icon: CalendarDays },
  { title: "Days Between Two Dates", description: "Calculate the exact number of days between two dates.", href: "/calculators/time-difference", icon: CalendarDays },
  { title: "Days Until Date", description: "Find out how many days remain until a specific date.", href: "/calculators/days-until", icon: CalendarDays },
  { title: "Business Days Calculator", description: "Add working days while automatically skipping weekends.", href: "/30-business-days-from-today", icon: CalendarDays },
  { title: "Weeks and Days Ago", description: "Calculate a past date using weeks and days together.", href: "/calculators/weeks-and-days-ago", icon: CalendarDays },
  { title: "Day of the Week", description: "Find the weekday for any calendar date.", href: "/calculators/day-of-week", icon: CalendarDays },
  { title: "Calendar by Month and Year", description: "View a monthly calendar and its week numbers.", href: "/calculators/calendar", icon: CalendarDays },
  { title: "How Many Days in a Month", description: "Check the number of days in any month and year.", href: "/calculators/days-in-month", icon: CalendarDays },
  { title: "Age Calculator", description: "Calculate age from a birth date in years, months, and days.", href: "/calculators/age-calculator", icon: CakeSlice },
  { title: "Half Birthday Calculator", description: "Find the date exactly six months after a birthday.", href: "/calculators/half-birthday", icon: CakeSlice },
  { title: "Countdown Timer", description: "Create a live countdown to any date and time.", href: "/calculators/countdown", icon: Hourglass },
  { title: "Time Difference Calculator", description: "Compare the duration between two dates and times.", href: "/calculators/time-difference", icon: Clock3 },
  { title: "Hours From Now", description: "Open a precise calculation for 24 hours from now.", href: "/24-hours-from-now", icon: Clock3 },
  { title: "Hours Ago", description: "See the exact local date and time 12 hours ago.", href: "/12-hours-ago", icon: Clock3 },
  { title: "Time Zone Converter", description: "Compare local times between cities around the world.", href: "/calculators/timezone-converter", icon: Globe2 },
  { title: "World Clock", description: "Explore city clocks, UTC offsets, and working hours by region.", href: "/time", icon: Globe2 },
  { title: "Weeks in a Year", description: "Check whether a year contains 52 or 53 ISO weeks.", href: "/calculators/weeks-in-year", icon: CalendarDays },
] as const;

const popularAnswers = [
  ["30 Days From Today", "/30-days-from-today"],
  ["90 Days From Today", "/90-days-from-today"],
  ["6 Weeks From Today", "/6-weeks-from-today"],
  ["1 Year From Today", "/1-year-from-today"],
  ["12 Hours From Now", "/12-hours-from-now"],
  ["30 Days Ago", "/30-days-ago"],
  ["Days Between Two Dates", "/calculators/time-difference"],
  ["How Many Days in a Month?", "/calculators/days-in-month"],
  ["100 Days From Today", "/100-days-from-today"],
  ["What Time Is It in London?", "/time/london"],
  ["1 Month From Today", "/1-month-from-today"],
  ["World Clock by Region", "/time"],
  ["What Day Is It Today?", "/calculators/day-of-week"],
  ["How Many Weeks in a Year?", "/calculators/weeks-in-year"],
  ["Add 7 Days to a Date", "/calculators/date-calculator"],
  ["Subtract 14 Days From a Date", "/calculators/date-calculator"],
] as const;

const popularTools = [
  ["Date Calculator", "/calculators/date-calculator"],
  ["Days Between Dates", "/calculators/time-difference"],
  ["Time Zone Converter", "/calculators/timezone-converter"],
  ["Age Calculator", "/calculators/age-calculator"],
  ["Countdown Timer", "/calculators/countdown"],
] as const;

const popularZones = [
  ["New York to London", "/new-york-to-london-time"],
  ["London to Tokyo", "/london-to-tokyo-time"],
  ["Tokyo to New York", "/tokyo-to-new-york-time"],
  ["Sydney to Singapore", "/sydney-to-singapore-time"],
  ["Dubai to London", "/dubai-to-london-time"],
  ["Paris to Los Angeles", "/paris-to-los-angeles-time"],
] as const;

const homeFaqs = [
  { question: "What time is it right now?", answer: "The clock above uses your device time zone and updates every second, so it shows your current local date and time." },
  { question: "How do I calculate days between two dates?", answer: "Open the Days Between Dates calculator, select a start date and an end date, and calculate the elapsed calendar duration." },
  { question: "How do I convert time zones?", answer: "Use the Time Zone Converter to choose two cities and compare their local times and UTC offsets." },
  { question: "Are my calculations stored?", answer: "No. WhatDateTime performs calculations in your browser and does not require an account." },
] as const;

function ToolRow({ tool }: { tool: ToolLink }) {
  const ToolIcon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group flex min-h-[76px] items-center gap-4 border-b border-[#d8e1ed] px-4 py-3.5 outline-none last:border-b-0 hover:bg-[#f7faff] focus-visible:bg-[#f7faff] sm:px-5"
    >
      <ToolIcon className="h-7 w-7 shrink-0 text-[#0969da]" strokeWidth={1.8} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-5 text-[#075fc5] group-hover:underline">{tool.title}</span>
        <span className="mt-0.5 block text-[13px] leading-[18px] text-[#4f6684]">{tool.description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#0b74e5]" aria-hidden="true" />
    </Link>
  );
}

function SidebarList({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#10264b]">{title}</h2>
      <div className="mt-2 border-y border-[#d8e1ed]">
        {links.map(([label, href]) => (
          <Link key={`${label}-${href}`} href={href} className="group flex min-h-11 items-center justify-between gap-3 border-b border-[#d8e1ed] px-2 py-2.5 text-sm font-medium text-[#0969da] last:border-b-0 hover:bg-[#f7faff] hover:underline">
            {label}
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function isoWeekNumber(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function TodaySummary() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const year = now?.getFullYear();
  const start = year ? new Date(year, 0, 1) : null;
  const dayOfYear = now && start ? Math.floor((Date.UTC(year!, now.getMonth(), now.getDate()) - Date.UTC(year!, 0, 1)) / 86_400_000) + 1 : null;
  const daysInYear = year && new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  const weekNumber = now ? isoWeekNumber(now) : null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#10264b]">Today</h2>
      <div className="mt-2 rounded-sm border border-[#d8e1ed] bg-white text-sm text-[#405776]">
        <p className="border-b border-[#e3e8ef] px-4 py-3 font-medium text-[#253b5e]">
          {now ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now) : "Your local date"}
        </p>
        <dl>
          <div className="flex justify-between gap-4 border-b border-[#e3e8ef] px-4 py-3"><dt>Day of year</dt><dd className="font-semibold text-[#10264b]">{dayOfYear ?? "—"} of {year ? daysInYear : "—"}</dd></div>
          <div className="flex justify-between gap-4 border-b border-[#e3e8ef] px-4 py-3"><dt>Week number</dt><dd className="font-semibold text-[#10264b]">{weekNumber ?? "—"}</dd></div>
          <div className="flex justify-between gap-4 px-4 py-3"><dt>Days remaining</dt><dd className="font-semibold text-[#10264b]">{dayOfYear ? daysInYear - dayOfYear : "—"}</dd></div>
        </dl>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[
        organizationSchema(),
        websiteSchema(),
        webApplicationSchema("WhatDateTime Date & Time Calculators", siteConfig.description, "/"),
        faqSchema(homeFaqs),
      ]} />

      <div className="home-reference-layout bg-white">
        <div className="mx-auto max-w-[90rem] px-4 pb-14 sm:px-6 lg:px-10 xl:px-14">
          <nav aria-label="Breadcrumb" className="py-4 text-sm font-medium text-[#0969da]">
            <Link href="/">Home</Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
            <div className="min-w-0">
              <header>
                <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.035em] text-[#0c2146] sm:text-[38px]">Current Date and Time</h1>
                <p className="mt-1 text-base text-[#536b8d] sm:text-lg">Check your local time, date, and time zone.</p>
              </header>

              <div className="mt-4"><LiveClock /></div>

              <section id="all-calculators" className="mt-10 scroll-mt-24">
                <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#10264b] sm:text-[32px]">Date &amp; Time Calculators</h2>
                <p className="mt-1 text-[15px] text-[#536b8d] sm:text-base">Choose a calculator for dates, times, calendars, or time zones.</p>
                <div className="mt-4 grid overflow-hidden rounded-sm border border-[#d8e1ed] bg-white md:grid-cols-2">
                  <div className="border-[#d8e1ed] md:border-r">
                    {calculatorLinks.filter((_, index) => index % 2 === 0).map((tool) => <ToolRow key={`${tool.title}-${tool.href}`} tool={tool} />)}
                  </div>
                  <div className="border-t border-[#d8e1ed] md:border-t-0">
                    {calculatorLinks.filter((_, index) => index % 2 === 1).map((tool) => <ToolRow key={`${tool.title}-${tool.href}`} tool={tool} />)}
                  </div>
                </div>
                <Link href="/calculators/date-calculator" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0969da] hover:underline">Open the date calculator <span aria-hidden="true">→</span></Link>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#10264b] sm:text-[32px]">Popular Date and Time Answers</h2>
                <p className="mt-1 text-[15px] text-[#536b8d] sm:text-base">Quick links to common date and time questions.</p>
                <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {popularAnswers.map(([label, href]) => (
                    <Link key={`${label}-${href}`} href={href} className="text-sm font-medium leading-6 text-[#0969da] hover:underline">{label}</Link>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#10264b] sm:text-[32px]">Free Date and Time Tools</h2>
                <p className="mt-2 max-w-4xl text-[15px] leading-7 text-[#536b8d]">WhatDateTime provides focused online tools for calculating dates, checking time zones, comparing durations, and planning deadlines. Every calculator is free to use and opens without registration.</p>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <div><h3 className="font-semibold text-[#10264b]">Plan dates accurately</h3><p className="mt-1 text-sm leading-6 text-[#536b8d]">Add or subtract calendar units, find weekdays, calculate date differences, and check business-day deadlines.</p></div>
                  <div><h3 className="font-semibold text-[#10264b]">Work across time zones</h3><p className="mt-1 text-sm leading-6 text-[#536b8d]">Compare cities and UTC offsets before scheduling calls, travel, releases, and international events.</p></div>
                </div>
              </section>

              <section className="mt-10" aria-labelledby="home-faq-heading">
                <h2 id="home-faq-heading" className="flex items-center gap-2 font-display text-[28px] font-bold tracking-[-0.03em] text-[#10264b] sm:text-[32px]"><CircleHelp className="h-6 w-6" aria-hidden="true" />Frequently Asked Questions</h2>
                <div className="mt-4 rounded-sm border border-[#d8e1ed]">
                  {homeFaqs.map((faq) => (
                    <details key={faq.question} className="group border-b border-[#d8e1ed] last:border-b-0">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-[#10264b] sm:text-[15px]">{faq.question}<span className="text-[#536b8d] group-open:rotate-45" aria-hidden="true">+</span></summary>
                      <p className="px-4 pb-4 text-sm leading-6 text-[#536b8d]">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <aside className="border-t border-[#d8e1ed] pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Popular tools and current date details">
              <SidebarList title="Popular Tools" links={popularTools} />
              <SidebarList title="Popular Time Zones" links={popularZones} />
              <TodaySummary />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
