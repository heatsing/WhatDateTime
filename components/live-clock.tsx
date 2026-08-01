"use client";

import { useEffect, useMemo, useState } from "react";

type ClockDisplay = {
  time: string;
  seconds: string;
  period: string;
  date: string;
  zone: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

const PLACEHOLDER: ClockDisplay = {
  time: "--:--",
  seconds: "--",
  period: "",
  date: "Your local date",
  zone: "Local time zone",
  hourAngle: 0,
  minuteAngle: 0,
  secondAngle: 0,
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);

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
      hourAngle: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5,
      minuteAngle: now.getMinutes() * 6 + now.getSeconds() * 0.1,
      secondAngle: now.getSeconds() * 6,
    };
  }, [now, use24Hour]);

  return (
    <section className="h-full border-b border-[#D9DEE5] bg-white p-4 sm:p-5 lg:border-b-0 lg:border-r" aria-label="Current local date and time">
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

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 self-stretch text-center sm:self-auto sm:text-left">
          <p className="min-h-14 whitespace-nowrap font-display text-[42px] font-semibold leading-[1.1] tracking-[-0.045em] text-ink tabular-nums sm:text-5xl" aria-live="off">
            {clock.time}<span className="ml-1 text-xl font-medium text-ink/45 sm:text-2xl">:{clock.seconds}</span>
            {clock.period && <span className="ml-1.5 text-xs font-semibold tracking-normal text-ink/50 sm:text-sm">{clock.period}</span>}
          </p>
          <p className="mt-3 min-h-6 text-sm font-semibold leading-6 text-ink sm:text-base">{clock.date}</p>
          <p className="mt-0.5 min-h-5 break-words text-sm leading-5 text-ink/50">{clock.zone}</p>
        </div>

        <div
          className="relative h-40 w-40 shrink-0 rounded-full border border-[#C8D0D8] bg-[#FBFCFD] sm:h-44 sm:w-44 lg:h-[11.5rem] lg:w-[11.5rem]"
          aria-hidden="true"
        >
          {HOURS.map((hour) => {
            const angle = hour * 30 * (Math.PI / 180);
            return (
              <span
                key={hour}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-ink/65 sm:text-xs"
                style={{
                  left: `${50 + Math.sin(angle) * 40}%`,
                  top: `${50 - Math.cos(angle) * 40}%`,
                }}
              >
                {hour}
              </span>
            );
          })}
          <span
            className="absolute bottom-1/2 left-1/2 h-[27%] w-1 rounded-full bg-ink"
            style={{
              transform: `translateX(-50%) rotate(${clock.hourAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span
            className="absolute bottom-1/2 left-1/2 h-[35%] w-[3px] rounded-full bg-ink/80"
            style={{
              transform: `translateX(-50%) rotate(${clock.minuteAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span
            className="absolute bottom-1/2 left-1/2 h-[39%] w-0.5 rounded-full bg-[#1769AA]"
            style={{
              transform: `translateX(-50%) rotate(${clock.secondAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1769AA]" />
        </div>
      </div>
    </section>
  );
}
