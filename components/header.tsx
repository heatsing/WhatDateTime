"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

type NavigationGroup = {
  label: string;
  links: ReadonlyArray<readonly [string, string]>;
};

const navigation: ReadonlyArray<NavigationGroup> = [
  {
    label: "Date tools",
    links: [
      ["Date Calculator", "/calculators/date-calculator"],
      ["Days Between Dates", "/calculators/time-difference"],
      ["Age Calculator", "/calculators/age-calculator"],
      ["Business Days", "/30-business-days-from-today"],
    ],
  },
  {
    label: "Time tools",
    links: [
      ["Current Time", "/"],
      ["Time Zone Converter", "/calculators/timezone-converter"],
      ["Countdown", "/calculators/countdown"],
      ["24 Hours From Now", "/24-hours-from-now"],
    ],
  },
  {
    label: "Popular",
    links: [
      ["30 Days From Today", "/30-days-from-today"],
      ["90 Days From Today", "/90-days-from-today"],
      ["8 Weeks From Today", "/8-weeks-from-today"],
      ["6 Months From Today", "/6-months-from-today"],
    ],
  },
] as const;

const searchTargets: ReadonlyArray<readonly [string, string]> = navigation.flatMap(
  (group) => group.links,
);

function generatedRoute(query: string) {
  const match = query.match(
    /^(\d+)\s+(hours?|days?|weeks?|months?|years?|business days?)\s+(from now|from today|ago)$/,
  );
  if (!match) return null;

  const amount = Number(match[1]);
  const rawUnit = match[2];
  const phrase = match[3];
  const singularUnit = rawUnit.startsWith("business")
    ? "business-day"
    : rawUnit.replace(/s$/, "");
  const maximums: Record<string, number> = {
    hour: 500,
    day: 365,
    week: 200,
    month: 300,
    year: 300,
    "business-day": 1_000,
  };
  const supported =
    (singularUnit === "hour" && ["from now", "ago"].includes(phrase)) ||
    (singularUnit === "day" && ["from today", "ago"].includes(phrase)) ||
    (["week", "month", "year", "business-day"].includes(singularUnit) &&
      phrase === "from today");
  if (!supported || amount < 1 || amount > (maximums[singularUnit] ?? 0)) {
    return null;
  }

  const unit = amount === 1 ? singularUnit : `${singularUnit}s`;
  const suffix = phrase === "ago" ? "ago" : phrase.replaceAll(" ", "-");
  return `/${amount}-${unit}-${suffix}`;
}

function intentRoute(query: string) {
  if (/time\s?zone|convert time|world time/.test(query)) {
    return "/calculators/timezone-converter";
  }
  if (/between|difference|how many days/.test(query)) {
    return "/calculators/time-difference";
  }
  if (/age|birthday|born/.test(query)) {
    return "/calculators/age-calculator";
  }
  if (/countdown|until/.test(query)) {
    return "/calculators/countdown";
  }
  return "/calculators/date-calculator";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanel(null);
        setDesktopMenu(null);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchTargets.slice(0, 5);
    return searchTargets
      .filter(([label]) => label.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [query]);

  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    router.push(generatedRoute(value) ?? intentRoute(value));
    closeMenus();
  }

  function closeMenus() {
    setPanel(null);
    setDesktopMenu(null);
  }

  return (
    <header className={`sticky top-0 z-50 text-white ${isHomepage ? "border-0 bg-transparent" : "border-b border-white/10 bg-ink"}`}>
      <div className={isHomepage ? "relative mx-auto flex h-[50px] max-w-[44rem] items-center bg-ink px-3" : "mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8"}>
        <Link href="/" className={`${isHomepage ? "absolute left-1/2 -translate-x-1/2 text-sm" : "shrink-0 text-base sm:text-lg"} rounded-md font-display font-bold tracking-[-0.02em] text-white outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink`} aria-label="WhatDateTime home">
          WhatDateTime
        </Link>

        <nav className={isHomepage ? "hidden" : "hidden h-full items-center gap-1 lg:flex"} aria-label="Primary navigation">
          {navigation.map((group) => (
            <div key={group.label} className="relative flex h-full items-center">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/75 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                aria-expanded={desktopMenu === group.label}
                onClick={() => {
                  setPanel(null);
                  setDesktopMenu((value) => value === group.label ? null : group.label);
                }}
              >
                {group.label}
                <span aria-hidden="true" className="text-[10px] text-white/45">▾</span>
              </button>
              {desktopMenu === group.label && (
                <div className="absolute left-0 top-full w-60 rounded-lg border border-ink/10 bg-white p-2 text-ink shadow-soft">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} onClick={closeMenus} className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 outline-none hover:bg-mist hover:text-ink focus-visible:bg-mist focus-visible:ring-2 focus-visible:ring-fern">
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={isHomepage ? "contents" : "ml-auto flex items-center gap-1"}>
          <button
            type="button"
            className={`${isHomepage ? "order-3 ml-auto" : "lg:w-auto lg:px-3"} inline-flex h-10 w-10 items-center justify-center gap-2 rounded-md p-0 text-sm font-medium text-white/75 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink`}
            onClick={() => {
              setDesktopMenu(null);
              setPanel((value) => value === "search" ? null : "search");
            }}
            aria-label="Search calculations"
            aria-expanded={panel === "search"}
          >
            <Icon name="search" className="h-4 w-4" />
            <span className={isHomepage ? "hidden" : "hidden lg:inline"}>Search</span>
          </button>
          <button
            type="button"
            className={`${isHomepage ? "order-1 grid" : "grid lg:hidden"} h-10 w-10 place-items-center rounded-md text-white/75 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink`}
            onClick={() => {
              setDesktopMenu(null);
              setPanel((value) => value === "menu" ? null : "menu");
            }}
            aria-label="Toggle navigation"
            aria-expanded={panel === "menu"}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {panel === "search" && (
        <div className="border-t border-white/10 bg-white px-4 py-4 text-ink shadow-soft">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={search} className="flex gap-2">
              <label htmlFor="site-search" className="sr-only">Search calculators and answers</label>
              <input
                id="site-search"
                name="site-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “30 days from today”…"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-md border border-ink/20 bg-white px-3.5 text-sm text-ink outline-none placeholder:text-ink/40 focus-visible:border-fern focus-visible:ring-2 focus-visible:ring-fern/25"
                autoFocus
              />
              <button className="h-11 rounded-md bg-fern px-5 text-sm font-semibold text-white outline-none hover:bg-ink focus-visible:ring-2 focus-visible:ring-fern focus-visible:ring-offset-2">Search</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2" aria-label="Suggested tools">
              {suggestions.map(([label, href]) => (
                <Link key={href} href={href} onClick={closeMenus} className="rounded-sm text-sm font-medium text-fern outline-none hover:underline focus-visible:ring-2 focus-visible:ring-fern focus-visible:ring-offset-2">{label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {panel === "menu" && (
        <nav className="border-t border-white/10 bg-white px-4 py-5 text-ink shadow-soft lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-3">
            {navigation.map((group) => (
              <section key={group.label}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">{group.label}</h2>
                <div className="mt-2 grid">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} onClick={closeMenus} className="-mx-2 rounded-md px-2 py-2.5 text-sm font-medium text-ink/75 outline-none hover:bg-mist hover:text-ink focus-visible:bg-mist focus-visible:ring-2 focus-visible:ring-fern">{label}</Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
