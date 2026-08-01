"use client";

import { useEffect, useMemo, useState } from "react";

type ClockDisplay = {
  time: string;
  seconds: string;
  period: string;
  date: string;
  zone: string;
};

const PLACEHOLDER: ClockDisplay = {
  time: "--:--",
  seconds: "--",
  period: "",
  date: "Your local date",
  zone: "Local time zone",
};

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [use24Hour, setUse24Hour] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const clock = useMemo<ClockDisplay>(() => {
    if (!now) return PLACEHOLDER;
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !use24Hour,
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    return {
      time: `${value("hour")}:${value("minute")}`,
      seconds: value("second"),
      period: use24Hour ? "" : value("dayPeriod"),
      date: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(now),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, [now, use24Hour]);

  return (
    <section className="h-full border-b border-[#D9DEE5] bg-white p-5 sm:p-6 lg:border-b-0 lg:border-r" aria-label="Current local date and time">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">Current local time</h2>
        <button
          type="button"
          onClick={() => setUse24Hour((value) => !value)}
          className="rounded-md border border-[#C8D0D8] bg-white px-2.5 py-1.5 text-xs font-medium text-ink/65 hover:bg-mist"
          aria-label={`Switch to ${use24Hour ? "12" : "24"}-hour time`}
          aria-pressed={use24Hour}
        >
          {use24Hour ? "24-hour" : "12-hour"}
        </button>
      </div>
      <p className="mt-6 whitespace-nowrap font-display text-5xl font-semibold tracking-[-0.045em] text-ink tabular-nums" aria-live="off">
        {clock.time}<span className="ml-1.5 text-2xl font-medium text-ink/45">:{clock.seconds}</span>
        {clock.period && <span className="ml-2 text-sm font-semibold tracking-normal text-ink/50">{clock.period}</span>}
      </p>
      <p className="mt-5 text-base font-semibold text-ink">{clock.date}</p>
      <p className="mt-1 text-sm text-ink/50">{clock.zone}</p>
    </section>
  );
}
