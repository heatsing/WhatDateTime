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
      hour12: true,
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    return {
      time: `${value("hour")}:${value("minute")}`,
      seconds: value("second"),
      period: value("dayPeriod"),
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
  }, [now]);

  return (
    <section className="text-center" aria-label="Current local date and time">
      <p className="min-h-9 whitespace-nowrap font-display text-[28px] font-bold leading-none tracking-[-0.025em] text-ink tabular-nums" aria-live="off">
        {clock.time}<span>:{clock.seconds}</span>
        {clock.period && <span className="ml-1.5 text-base font-bold tracking-normal">{clock.period}</span>}
      </p>
      <p className="mt-3 min-h-5 text-sm font-semibold text-ink/80">{clock.date}</p>
      <p className="mt-1 min-h-4 text-[11px] text-ink/45">{clock.zone}</p>

      <div
        className="relative mx-auto mt-4 h-[116px] w-[116px] rounded-full border-2 border-ink/70 bg-white"
        aria-hidden="true"
      >
          {HOURS.map((hour) => {
            const angle = hour * 30 * (Math.PI / 180);
            return (
              <span
                key={hour}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold leading-none text-ink"
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
            className="absolute bottom-1/2 left-1/2 h-[27%] w-[3px] rounded-full bg-ink"
            style={{
              transform: `translateX(-50%) rotate(${clock.hourAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span
            className="absolute bottom-1/2 left-1/2 h-[36%] w-0.5 rounded-full bg-ink"
            style={{
              transform: `translateX(-50%) rotate(${clock.minuteAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span
            className="absolute bottom-1/2 left-1/2 h-[40%] w-px rounded-full bg-[#D9272E]"
            style={{
              transform: `translateX(-50%) rotate(${clock.secondAngle}deg)`,
              transformOrigin: "50% 100%",
            }}
          />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[#D9272E]" />
      </div>
    </section>
  );
}
