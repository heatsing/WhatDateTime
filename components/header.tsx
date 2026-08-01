"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

const links = [
  { href: "/calculators/date-calculator", label: "Date" },
  { href: "/calculators/time-difference", label: "Difference" },
  { href: "/calculators/age-calculator", label: "Age" },
  { href: "/calculators/countdown", label: "Countdown" },
  { href: "/calculators/timezone-converter", label: "Time zones" },
];

export function Header() {
  const router = useRouter();
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const [query, setQuery] = useState("");

  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    const match = value.match(
      /^(\d+)\s+(hours?|days?|weeks?|months?|years?|business days?)\s+(from now|from today|ago)$/,
    );

    if (!match) {
      router.push("/calculators/date-calculator");
      setPanel(null);
      return;
    }

    const amount = Number(match[1]);
    const rawUnit = match[2];
    const phrase = match[3];
    const singularUnit = rawUnit.startsWith("business")
      ? "business-day"
      : rawUnit.replace(/s$/, "");
    const supported =
      (singularUnit === "hour" && ["from now", "ago"].includes(phrase)) ||
      (singularUnit === "day" && ["from today", "ago"].includes(phrase)) ||
      (["week", "month", "year", "business-day"].includes(singularUnit) &&
        phrase === "from today");
    const maximums: Record<string, number> = {
      hour: 500,
      day: 365,
      week: 200,
      month: 300,
      year: 300,
      "business-day": 1_000,
    };
    if (!supported || amount < 1 || amount > (maximums[singularUnit] ?? 0)) {
      router.push("/calculators/date-calculator");
      setPanel(null);
      return;
    }
    const unit = amount === 1 ? singularUnit : `${singularUnit}s`;
    const suffix = phrase === "ago" ? "ago" : phrase.replaceAll(" ", "-");
    router.push(`/${amount}-${unit}-${suffix}`);
    setPanel(null);
  }

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-sm">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8">
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-white/85 transition hover:bg-white/10 hover:text-white"
          onClick={() => setPanel((value) => (value === "menu" ? null : "menu"))}
          aria-label="Toggle navigation"
          aria-expanded={panel === "menu"}
        >
          <Icon name="menu" />
        </button>

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          aria-label="WhatDateTime home"
        >
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            What<span className="text-lime">DateTime</span>
          </span>
        </Link>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-white/85 transition hover:bg-white/10 hover:text-white"
          onClick={() => setPanel((value) => (value === "search" ? null : "search"))}
          aria-label="Search calculations"
          aria-expanded={panel === "search"}
        >
          <Icon name="search" />
        </button>
      </div>

      {panel === "menu" && (
        <nav className="border-t border-white/10 bg-ink px-5 py-4" aria-label="Primary navigation">
          <div className="mx-auto grid max-w-3xl gap-1 sm:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setPanel(null)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {panel === "search" && (
        <div className="border-t border-white/10 bg-ink px-5 py-5">
          <form onSubmit={search} className="mx-auto flex max-w-2xl gap-2">
            <label htmlFor="site-search" className="sr-only">Search calculations</label>
            <input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “30 days from today”"
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime/60"
              autoFocus
            />
            <button className="h-11 rounded-xl bg-lime px-5 text-sm font-bold text-ink transition hover:bg-white">
              Go
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
