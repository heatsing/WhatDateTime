import Link from "@/components/link";
import {
  CalendarDays,
  CircleHelp,
  Clock3,
  Globe2,
  MapPinned,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { HomeTimezoneConverter } from "@/components/home-timezone-converter";
import { JsonLd } from "@/components/json-ld";
import { LiveClock } from "@/components/live-clock";
import { siteConfig } from "@/lib/site";
import {
  faqSchema,
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
} from "@/lib/structured-data";

type DirectorySection = {
  title: string;
  description: string;
  icon: LucideIcon;
  links: ReadonlyArray<readonly [string, string]>;
};

const directorySections: ReadonlyArray<DirectorySection> = [
  {
    title: "Cities by Continent",
    description: "Browse major cities around the world and compare their local time.",
    icon: MapPinned,
    links: [
      ["New York to London", "/new-york-to-london-time"],
      ["London to Tokyo", "/london-to-tokyo-time"],
      ["Los Angeles to Sydney", "/los-angeles-to-sydney-time"],
      ["Paris to Singapore", "/paris-to-singapore-time"],
      ["Dubai to Toronto", "/dubai-to-toronto-time"],
      ["Berlin to New York", "/berlin-to-new-york-time"],
      ["Tokyo to Los Angeles", "/tokyo-to-los-angeles-time"],
      ["Sydney to London", "/sydney-to-london-time"],
    ],
  },
  {
    title: "Popular Time Zones",
    description: "Quick links to commonly compared international time zones.",
    icon: Clock3,
    links: [
      ["New York & London", "/new-york-to-london-time"],
      ["London & Singapore", "/london-to-singapore-time"],
      ["Tokyo & New York", "/tokyo-to-new-york-time"],
      ["Paris & Dubai", "/paris-to-dubai-time"],
      ["Los Angeles & London", "/los-angeles-to-london-time"],
      ["Toronto & Berlin", "/toronto-to-berlin-time"],
      ["Sydney & Tokyo", "/sydney-to-tokyo-time"],
      ["Singapore & Dubai", "/singapore-to-dubai-time"],
    ],
  },
  {
    title: "Date Calculators",
    description: "Add, subtract, or compare calendar dates for planning and deadlines.",
    icon: CalendarDays,
    links: [
      ["Date Calculator", "/calculators/date-calculator"],
      ["Days Between Dates", "/calculators/time-difference"],
      ["Days Until Date", "/calculators/days-until"],
      ["Day of the Week", "/calculators/day-of-week"],
      ["Days in a Month", "/calculators/days-in-month"],
      ["Weeks in a Year", "/calculators/weeks-in-year"],
      ["Calendar Generator", "/calculators/calendar"],
      ["Half Birthday", "/calculators/half-birthday"],
      ["Weeks and Days Ago", "/calculators/weeks-and-days-ago"],
      ["1-Day Date Difference", "/days-between-january-1-2026-and-january-2-2026"],
      ["Age Calculator", "/calculators/age-calculator"],
      ["Business Days Calculator", "/30-business-days-from-today"],
      ["7 Days From Today", "/7-days-from-today"],
      ["30 Days From Today", "/30-days-from-today"],
      ["90 Days From Today", "/90-days-from-today"],
      ["7 Days Ago", "/7-days-ago"],
      ["8 Weeks From Today", "/8-weeks-from-today"],
      ["12 Months From Today", "/12-months-from-today"],
    ],
  },
  {
    title: "Time Calculators",
    description: "Work with time durations, differences, countdowns, and conversions.",
    icon: Clock3,
    links: [
      ["Time Zone Converter", "/calculators/timezone-converter"],
      ["Time Difference", "/calculators/time-difference"],
      ["Countdown Timer", "/calculators/countdown"],
      ["1 Hour From Now", "/1-hour-from-now"],
      ["6 Hours From Now", "/6-hours-from-now"],
      ["12 Hours From Now", "/12-hours-from-now"],
      ["24 Hours From Now", "/24-hours-from-now"],
      ["1 Hour Ago", "/1-hour-ago"],
      ["12 Hours Ago", "/12-hours-ago"],
      ["24 Hours Ago", "/24-hours-ago"],
    ],
  },
  {
    title: "Meeting Planner",
    description: "Find practical time overlaps between widely used business locations.",
    icon: Users,
    links: [
      ["New York–London Meeting", "/new-york-to-london-time"],
      ["London–Dubai Meeting", "/london-to-dubai-time"],
      ["Tokyo–Singapore Meeting", "/tokyo-to-singapore-time"],
      ["Berlin–Toronto Meeting", "/berlin-to-toronto-time"],
      ["Los Angeles–Tokyo Meeting", "/los-angeles-to-tokyo-time"],
      ["Paris–New York Meeting", "/paris-to-new-york-time"],
      ["Sydney–London Meeting", "/sydney-to-london-time"],
      ["Singapore–New York Meeting", "/singapore-to-new-york-time"],
    ],
  },
  {
    title: "World Clock",
    description: "Check and compare the current time in major cities worldwide.",
    icon: Globe2,
    links: [
      ["New York to London Time", "/new-york-to-london-time"],
      ["London to New York Time", "/london-to-new-york-time"],
      ["Tokyo to London Time", "/tokyo-to-london-time"],
      ["Los Angeles to New York Time", "/los-angeles-to-new-york-time"],
      ["Paris to London Time", "/paris-to-london-time"],
      ["Sydney to Singapore Time", "/sydney-to-singapore-time"],
      ["Singapore to Tokyo Time", "/singapore-to-tokyo-time"],
      ["Dubai to Berlin Time", "/dubai-to-berlin-time"],
    ],
  },
  {
    title: "Common Date & Time Tools",
    description: "Everyday utilities for frequently requested date and time answers.",
    icon: Wrench,
    links: [
      ["Current Date & Time", "/"],
      ["Date Calculator", "/calculators/date-calculator"],
      ["Age Calculator", "/calculators/age-calculator"],
      ["Countdown", "/calculators/countdown"],
      ["Time Zone Converter", "/calculators/timezone-converter"],
      ["5 Business Days", "/5-business-days-from-today"],
      ["14 Days From Today", "/14-days-from-today"],
      ["30 Days Ago", "/30-days-ago"],
      ["4 Weeks From Today", "/4-weeks-from-today"],
      ["1 Year From Today", "/1-year-from-today"],
    ],
  },
];

const homeFaqs = [
  { question: "What time is it right now?", answer: "The clock at the top of this page uses your device time zone and updates every second." },
  { question: "How do I convert time zones?", answer: "Choose a source city and destination city in the converter, then select Convert to open the matching comparison." },
  { question: "How do I calculate the difference between two dates?", answer: "Use the Days Between Dates calculator to enter both dates and receive the elapsed days and calendar breakdown." },
  { question: "What is UTC time?", answer: "UTC is the global time standard used as the reference point for local time-zone offsets." },
  { question: "How do I plan a meeting across time zones?", answer: "Open one of the city comparison pages to see both local times together and account for their current offsets." },
] as const;

const moreTools = [
  ["Date Calculator", "/calculators/date-calculator"],
  ["Time Difference", "/calculators/time-difference"],
  ["Age Calculator", "/calculators/age-calculator"],
  ["Countdown Timer", "/calculators/countdown"],
  ["Business Days", "/30-business-days-from-today"],
  ["Time Zone Converter", "/calculators/timezone-converter"],
  ["Days Until Date", "/calculators/days-until"],
  ["Day of the Week", "/calculators/day-of-week"],
  ["Calendar Generator", "/calculators/calendar"],
  ["100 Days From Today", "/100-days-from-today"],
  ["365 Days From Today", "/365-days-from-today"],
] as const;

function DirectoryBlock({ section }: { section: DirectorySection }) {
  const Icon = section.icon;
  return (
    <section className="border-t border-[#D9DEE5] py-6 lg:py-8">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink sm:text-2xl xl:text-[26px]">
        <Icon className="h-5 w-5 text-ink/65 sm:h-6 sm:w-6" aria-hidden="true" />
        {section.title}
      </h2>
      <p className="mt-2.5 text-[15px] leading-7 text-ink/70 sm:text-base lg:text-[17px] lg:leading-8">{section.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 lg:mt-5 lg:gap-x-10 lg:gap-y-3">
        {section.links.map(([label, href]) => (
          <Link key={`${label}-${href}`} href={href} className="min-w-0 text-[15px] font-medium leading-7 text-[#0878C9] hover:underline sm:text-base lg:text-[17px]">
            {label}
          </Link>
        ))}
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

      <div className="home-reference-layout mx-auto max-w-[90rem] bg-white px-5 pb-12 sm:px-8 lg:px-12 xl:px-16">
        <section className="pb-10 pt-9 text-center sm:pb-12 sm:pt-11 lg:pb-16 lg:pt-14">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-5xl lg:text-[56px]">WhatDateTime</h1>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-ink/65 sm:text-base sm:leading-7 lg:mt-4 lg:text-lg lg:leading-8">
              Your source for time, time zones, and date tools.<br />
              Accurate. Fast. Always up to date.
            </p>
            <div className="mt-7 lg:mt-10"><LiveClock /></div>
            <HomeTimezoneConverter />
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[#D9DEE5] py-8 lg:py-10">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">Welcome to WhatDateTime</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-7 text-ink/75 sm:text-base lg:mt-5 lg:text-lg lg:leading-9">
            <p>Find current local time, compare time zones, and calculate dates with our free online tools.</p>
            <p>Whether you&apos;re planning a meeting, scheduling an event, or checking a future deadline, every answer is designed to be quick and clear.</p>
            <p>Times use your local time by default. Explore the directories below to convert time zones, calculate durations, add or subtract dates, and more.</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl">
          {directorySections.map((section) => <DirectoryBlock key={section.title} section={section} />)}
        </div>

        <div className="mx-auto max-w-6xl">
          <section className="border-t border-[#D9DEE5] py-6 lg:py-8">
            <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink sm:text-2xl xl:text-[26px]">
              <CircleHelp className="h-4 w-4 text-ink/65 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
              Frequently Asked Questions
            </h2>
            <div className="mt-4 border-y border-[#D9DEE5]">
              {homeFaqs.map((faq) => (
                <details key={faq.question} className="group border-b border-[#E5E8EB] py-3 last:border-b-0 lg:py-3.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink sm:text-base lg:text-[17px]">
                    {faq.question}
                    <span className="text-base text-ink/55 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="pt-2 text-sm leading-7 text-ink/65 sm:text-base lg:text-[17px] lg:leading-8">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div>
            <section className="border-t border-[#D9DEE5] py-6 lg:py-8">
              <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink sm:text-2xl xl:text-[26px]">
                <Star className="h-4 w-4 text-[#E5A700] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                More Tools You&apos;ll Love
              </h2>
              <p className="mt-2.5 text-[15px] leading-7 text-ink/70 sm:text-base lg:text-[17px] lg:leading-8">Explore more free tools for everyday date and time planning.</p>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 lg:mt-5 lg:gap-y-3">
                {moreTools.map(([label, href]) => (
                  <Link key={label} href={href} className="text-[15px] font-medium leading-7 text-[#0878C9] hover:underline sm:text-base lg:text-[17px]">{label}</Link>
                ))}
              </div>
            </section>

            <section className="border-t border-[#D9DEE5] py-6 lg:py-8">
              <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink sm:text-2xl xl:text-[26px]">
                <ShieldCheck className="h-4 w-4 text-ink/65 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                Trusted, Accurate, Always Free
              </h2>
              <p className="mt-3 text-[15px] leading-8 text-ink/75 sm:text-base lg:text-[17px]">WhatDateTime provides accurate time, time-zone, and date tools without registration or hidden fees.</p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-[#E8F4FD] px-3 py-3.5 text-center text-[11px] font-semibold leading-4 text-ink/70 sm:text-xs lg:text-[13px]">
                <span>● Accurate &amp; Reliable</span>
                <span>● Completely Free</span>
                <span>● No Sign-Up Required</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
