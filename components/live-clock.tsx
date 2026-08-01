"use client";

import { useEffect, useMemo, useState } from "react";

const HOUR_MARKS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  const angle = (hour * 30 * Math.PI) / 180;

  return {
    hour,
    x: Number((100 + Math.sin(angle) * 73).toFixed(3)),
    y: Number((100 - Math.cos(angle) * 73).toFixed(3)),
  };
});

type ClockDisplay = {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
  date: string;
  zone: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

const SERVER_PLACEHOLDER: ClockDisplay = {
  hours: "--",
  minutes: "--",
  seconds: "--",
  period: "--",
  date: "Your local date",
  zone: "Local time zone",
  hourAngle: 0,
  minuteAngle: 0,
  secondAngle: 0,
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
    if (!now) return SERVER_PLACEHOLDER;

    const timeParts = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !use24Hour,
    }).formatToParts(now);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      timeParts.find((item) => item.type === type)?.value ?? "";

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    return {
      hours: part("hour"),
      minutes: part("minute"),
      seconds: part("second"),
      period: use24Hour ? "" : part("dayPeriod"),
      date: new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(now),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hourAngle: (hours % 12) * 30 + minutes * 0.5,
      minuteAngle: minutes * 6 + seconds * 0.1,
      secondAngle: seconds * 6,
    };
  }, [now, use24Hour]);

  const accessibleTime = now
    ? `Current time ${clock.hours}:${clock.minutes}:${clock.seconds}${
        clock.period ? ` ${clock.period}` : ""
      }`
    : "Loading current time";

  return (
    <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] bg-ink px-5 py-6 text-left text-white shadow-card sm:px-7 sm:py-8 lg:px-10">
      <div className="noise absolute inset-0 opacity-20" />
      <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-lime/15 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55 sm:text-xs sm:tracking-[0.16em]">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
            </span>
            <span className="truncate">Your local time</span>
          </div>

          <button
            type="button"
            onClick={() => setUse24Hour((value) => !value)}
            className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            aria-label={`Switch to ${use24Hour ? "12" : "24"}-hour time`}
            aria-pressed={use24Hour}
          >
            {use24Hour ? "24-hour" : "12-hour"}
          </button>
        </div>

        <div className="mt-7 grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,13rem)] sm:gap-5 md:gap-10">
          <div className="min-w-0 text-center sm:text-left">
            <div
              className="flex min-h-[5.25rem] items-baseline justify-center whitespace-nowrap font-display font-extrabold tabular-nums tracking-[-0.065em] sm:justify-start"
              aria-live="off"
              aria-label={accessibleTime}
            >
              <span className="text-[clamp(3rem,15vw,5.75rem)] leading-none sm:text-[clamp(3rem,8vw,5.75rem)]">
                {clock.hours}:{clock.minutes}
              </span>
              <span className="ml-1.5 text-[clamp(1.45rem,6vw,2.75rem)] text-lime sm:text-[clamp(1.45rem,4vw,2.75rem)]">
                :{clock.seconds}
              </span>
              <span
                className={`ml-2 inline-block min-w-[1.9rem] text-xs font-bold tracking-normal text-white/45 sm:text-sm ${
                  use24Hour ? "invisible" : ""
                }`}
                aria-hidden={!clock.period}
              >
                {clock.period || "--"}
              </span>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="min-h-6 font-display text-base font-bold leading-6 text-white sm:text-lg">
                {clock.date}
              </p>
              <p className="mt-1 min-h-5 break-words text-xs font-medium leading-5 text-white/45 sm:text-sm">
                {clock.zone}
              </p>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end">
            <svg
              viewBox="0 0 200 200"
              className="h-auto w-full max-w-[12.5rem] drop-shadow-[0_16px_24px_rgba(0,0,0,0.28)]"
              role="img"
              aria-label={`Analog clock showing ${accessibleTime.replace("Current time ", "")}`}
            >
              <circle cx="100" cy="100" r="96" fill="#f7f8ef" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#dfe2d3" strokeWidth="2" />

              {HOUR_MARKS.map(({ hour, x, y }) => (
                <text
                  key={hour}
                  x={x}
                  y={y}
                  fill="#151713"
                  fontFamily="var(--font-manrope), Manrope, sans-serif"
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {hour}
                </text>
              ))}

              <g transform={`rotate(${clock.hourAngle} 100 100)`}>
                <rect x="96" y="55" width="8" height="53" rx="4" fill="#151713" />
              </g>
              <g transform={`rotate(${clock.minuteAngle} 100 100)`}>
                <rect x="96" y="39" width="8" height="69" rx="4" fill="#30352d" />
              </g>
              <g transform={`rotate(${clock.secondAngle} 100 100)`}>
                <rect x="98" y="24" width="4" height="88" rx="2" fill="#b9f542" />
              </g>
              <circle cx="100" cy="100" r="7" fill="#151713" />
              <circle cx="100" cy="100" r="3" fill="#b9f542" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
