"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [from, setFrom] = useState("New York");
  const [to, setTo] = useState("London");

  function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from === to) {
      router.push("/calculators/timezone-converter");
      return;
    }
    router.push(`/${citySlug(from)}-to-${citySlug(to)}-time`);
  }

  return (
    <section className="mt-6 rounded-md bg-[#E8F4FD] px-4 py-4 sm:px-5" aria-labelledby="home-timezone-heading">
      <h2 id="home-timezone-heading" className="text-center text-xs font-bold uppercase tracking-[0.02em] text-[#0878C9]">
        Time Zone Converter
      </h2>
      <form onSubmit={convert} className="mt-3 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
        <label className="sr-only" htmlFor="home-from-city">From city or time zone</label>
        <select
          id="home-from-city"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="h-10 min-w-0 rounded border border-[#D6E2EA] bg-white px-3 text-xs text-ink outline-none focus:border-[#0878C9]"
        >
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <span className="hidden text-center text-xs font-semibold text-ink/40 sm:block" aria-hidden="true">to</span>
        <label className="sr-only" htmlFor="home-to-city">To city or time zone</label>
        <select
          id="home-to-city"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="h-10 min-w-0 rounded border border-[#D6E2EA] bg-white px-3 text-xs text-ink outline-none focus:border-[#0878C9]"
        >
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <button type="submit" className="h-10 rounded bg-[#0878C9] px-5 text-xs font-bold text-white hover:bg-[#0667AD] focus-visible:ring-2 focus-visible:ring-[#0878C9] focus-visible:ring-offset-2">
          Convert
        </button>
      </form>
      <div className="mt-3 text-center">
        <Link href="/calculators/timezone-converter" className="text-xs font-semibold text-[#0878C9] hover:underline">
          World Clock →
        </Link>
      </div>
    </section>
  );
}
