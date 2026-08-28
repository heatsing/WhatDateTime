"use client";

import Link from "@/components/link";
import { FormEvent, useState } from "react";
import { navigate } from "@/lib/browser-navigation";

const cities = [
  "New York",
  "London",
  "Tokyo",
  "Los Angeles",
  "Paris",
  "Sydney",
  "Singapore",
  "Dubai",
  "Toronto",
  "Berlin",
] as const;

function citySlug(city: string) {
  return city.toLowerCase().replaceAll(" ", "-");
}

export function HomeTimezoneConverter() {
  const [from, setFrom] = useState("New York");
  const [to, setTo] = useState("London");

  function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from === to) {
      navigate("/calculators/timezone-converter");
      return;
    }
    navigate(`/${citySlug(from)}-to-${citySlug(to)}-time`);
  }

  return (
    <section className="mt-8 rounded-lg bg-[#E8F4FD] px-5 py-6 sm:px-7 lg:mt-10 lg:px-8 lg:py-7" aria-labelledby="home-timezone-heading">
      <h2 id="home-timezone-heading" className="text-center text-sm font-bold uppercase tracking-[0.03em] text-[#0878C9] sm:text-base">
        Time Zone Converter
      </h2>
      <form onSubmit={convert} className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
        <label className="sr-only" htmlFor="home-from-city">From city or time zone</label>
        <select
          id="home-from-city"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="h-12 min-w-0 rounded-md border border-[#D6E2EA] bg-white px-4 text-base text-ink outline-none focus:border-[#0878C9]"
        >
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <span className="hidden text-center text-xs font-semibold text-ink/40 sm:block" aria-hidden="true">to</span>
        <label className="sr-only" htmlFor="home-to-city">To city or time zone</label>
        <select
          id="home-to-city"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="h-12 min-w-0 rounded-md border border-[#D6E2EA] bg-white px-4 text-base text-ink outline-none focus:border-[#0878C9]"
        >
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <button type="submit" className="h-12 rounded-md bg-[#0878C9] px-7 text-base font-bold text-white hover:bg-[#0667AD] focus-visible:ring-2 focus-visible:ring-[#0878C9] focus-visible:ring-offset-2">
          Convert
        </button>
      </form>
      <div className="mt-3 text-center">
        <Link href="/calculators/timezone-converter" className="text-sm font-semibold text-[#0878C9] hover:underline sm:text-base">
          World Clock →
        </Link>
      </div>
    </section>
  );
}
