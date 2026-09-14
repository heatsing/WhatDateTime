"use client";

import Link from "@/components/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { navigate } from "@/lib/browser-navigation";

type NavigationGroup = {
  label: string;
  links: ReadonlyArray<readonly [string, string]>;
};

const navigation: ReadonlyArray<NavigationGroup> = [
  {
    label: "Date",
    links: [
      ["Date Calculator", "/calculators/date-calculator"],
      ["Days Between Dates", "/calculators/time-difference"],
      ["Days Until Date", "/calculators/days-until"],
      ["Day of the Week", "/calculators/day-of-week"],
      ["Age Calculator", "/calculators/age-calculator"],
      ["Business Days", "/30-business-days-from-today"],
    ],
  },
  {
    label: "Time",
    links: [
      ["Current Time", "/"],
      ["Hours From Now", "/24-hours-from-now"],
      ["Hours Ago", "/12-hours-ago"],
      ["Countdown Timer", "/calculators/countdown"],
      ["Time Difference", "/calculators/time-difference"],
    ],
  },
  {
    label: "Time Zones",
    links: [
      ["Time Zone Converter", "/calculators/timezone-converter"],
      ["New York to London", "/new-york-to-london-time"],
      ["London to Tokyo", "/london-to-tokyo-time"],
      ["Tokyo to New York", "/tokyo-to-new-york-time"],
    ],
  },
  {
    label: "Calendars",
    links: [
      ["Calendar Generator", "/calculators/calendar"],
      ["Days in a Month", "/calculators/days-in-month"],
      ["Weeks in a Year", "/calculators/weeks-in-year"],
      ["Half Birthday", "/calculators/half-birthday"],
    ],
  },
  {
    label: "Other Tools",
    links: [
      ["Weeks and Days Ago", "/calculators/weeks-and-days-ago"],
      ["30 Days From Today", "/30-days-from-today"],
      ["90 Days From Today", "/90-days-from-today"],
      ["1 Year From Today", "/1-year-from-today"],
    ],
  },
] as const;

const searchTargets = navigation.flatMap((group) => group.links);

function generatedRoute(query: string) {
  const match = query.match(/^(\d+)\s+(hours?|days?|weeks?|months?|years?|business days?)\s+(from now|from today|ago)$/);
  if (!match) return null;
  const amount = Number(match[1]);
  const rawUnit = match[2];
  const phrase = match[3];
  const singularUnit = rawUnit.startsWith("business") ? "business-day" : rawUnit.replace(/s$/, "");
  const maximums: Record<string, number> = { hour: 500, day: 365, week: 200, month: 300, year: 300, "business-day": 1_000 };
  const supported =
    (singularUnit === "hour" && ["from now", "ago"].includes(phrase)) ||
    (singularUnit === "day" && ["from today", "ago"].includes(phrase)) ||
    (["week", "month", "year", "business-day"].includes(singularUnit) && phrase === "from today");
  if (!supported || amount < 1 || amount > (maximums[singularUnit] ?? 0)) return null;
  const unit = amount === 1 ? singularUnit : `${singularUnit}s`;
  return `/${amount}-${unit}-${phrase === "ago" ? "ago" : phrase.replaceAll(" ", "-")}`;
}

function intentRoute(query: string) {
  if (/time\s?zone|convert time|world time/.test(query)) return "/calculators/timezone-converter";
  if (/between|difference|how many days/.test(query)) return "/calculators/time-difference";
  if (/age|birthday|born/.test(query)) return "/calculators/age-calculator";
  if (/countdown|until/.test(query)) return /days|date/.test(query) ? "/calculators/days-until" : "/calculators/countdown";
  if (/day of (the )?week|weekday/.test(query)) return "/calculators/day-of-week";
  if (/days in (a )?month/.test(query)) return "/calculators/days-in-month";
  if (/weeks in (a )?year/.test(query)) return "/calculators/weeks-in-year";
  if (/half birthday/.test(query)) return "/calculators/half-birthday";
  if (/calendar/.test(query)) return "/calculators/calendar";
  return "/calculators/date-calculator";
}

export function Header({ pathname = "/" }: { pathname?: string }) {
  void pathname;
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setDesktopMenu(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (normalized ? searchTargets.filter(([label]) => label.toLowerCase().includes(normalized)) : searchTargets).slice(0, 6);
  }, [query]);

  function closeMenus() {
    setPanel(null);
    setDesktopMenu(null);
  }

  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    navigate(generatedRoute(value) ?? intentRoute(value));
    closeMenus();
  }

  const shell = "border-b border-[#d8e1ed] bg-white text-[#10264b]";
  const muted = "text-[#294364] hover:bg-[#f2f6fb] hover:text-[#075fc5]";

  return (
    <header className={`sticky top-0 z-50 ${shell}`}>
      <div className="mx-auto flex h-[68px] max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-14">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md font-display text-xl font-bold tracking-[-0.035em] outline-none focus-visible:ring-2 focus-visible:ring-[#0969da] sm:text-2xl" aria-label="WhatDateTime home">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0969da] text-white"><Icon name="calendar" className="h-6 w-6" /></span>
          <span>WhatDateTime</span>
        </Link>

        <nav className="ml-auto hidden h-full items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {navigation.map((group) => (
            <div key={group.label} className="relative flex h-full items-center">
              <button type="button" className={`inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0969da] ${muted}`} aria-expanded={desktopMenu === group.label} onClick={() => { setPanel(null); setDesktopMenu((value) => value === group.label ? null : group.label); }}>
                {group.label}<span aria-hidden="true" className="text-[10px]">⌄</span>
              </button>
              {desktopMenu === group.label && (
                <div className="absolute left-0 top-[58px] w-60 rounded-md border border-[#d8e1ed] bg-white p-2 text-[#10264b] shadow-soft">
                  {group.links.map(([label, href]) => <Link key={`${label}-${href}`} href={href} onClick={closeMenus} className="block rounded-sm px-3 py-2.5 text-sm font-medium text-[#405776] outline-none hover:bg-[#f2f6fb] hover:text-[#075fc5] focus-visible:bg-[#f2f6fb]">{label}</Link>)}
                </div>
              )}
            </div>
          ))}
        </nav>

          <form onSubmit={search} className="ml-3 hidden w-[285px] shrink-0 xl:flex">
            <label htmlFor="desktop-site-search" className="sr-only">Search tools and time zones</label>
            <div className="relative w-full">
              <input id="desktop-site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, time zones..." autoComplete="off" className="h-11 w-full rounded-md border border-[#cbd6e4] bg-white pl-4 pr-11 text-sm text-[#10264b] outline-none placeholder:text-[#73849b] focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15" />
              <button type="submit" className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#0969da]" aria-label="Search"><Icon name="search" className="h-5 w-5" /></button>
            </div>
          </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button type="button" className={`grid h-10 w-10 place-items-center rounded-md outline-none xl:hidden ${muted}`} onClick={() => { setDesktopMenu(null); setPanel((value) => value === "search" ? null : "search"); }} aria-label="Search calculations" aria-expanded={panel === "search"}>
            <Icon name="search" className="h-5 w-5" />
          </button>
          <button type="button" className={`grid h-10 w-10 place-items-center rounded-md outline-none lg:hidden ${muted}`} onClick={() => { setDesktopMenu(null); setPanel((value) => value === "menu" ? null : "menu"); }} aria-label="Toggle navigation" aria-expanded={panel === "menu"}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {panel === "search" && (
        <div className="border-t border-[#d8e1ed] bg-white px-4 py-4 text-[#10264b] shadow-soft">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={search} className="flex gap-2">
              <label htmlFor="site-search" className="sr-only">Search calculators and answers</label>
              <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “30 days from today”…" autoComplete="off" className="h-11 min-w-0 flex-1 rounded-md border border-[#cbd6e4] px-3.5 text-sm outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15" autoFocus />
              <button className="h-11 rounded-md bg-[#0969da] px-5 text-sm font-semibold text-white hover:bg-[#075fc5]">Search</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{suggestions.map(([label, href]) => <Link key={`${label}-${href}`} href={href} onClick={closeMenus} className="text-sm font-medium text-[#0969da] hover:underline">{label}</Link>)}</div>
          </div>
        </div>
      )}

      {panel === "menu" && (
        <nav className="border-t border-[#d8e1ed] bg-white px-4 py-5 text-[#10264b] shadow-soft lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {navigation.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#657893]">{group.label}</h2>
                <div className="mt-2 grid">{group.links.map(([label, href]) => <Link key={`${label}-${href}`} href={href} onClick={closeMenus} className="-mx-2 rounded-sm px-2 py-2 text-sm font-medium text-[#405776] hover:bg-[#f2f6fb] hover:text-[#075fc5]">{label}</Link>)}</div>
              </section>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
