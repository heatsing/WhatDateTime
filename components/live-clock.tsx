"use client";

import Link from "@/components/link";
import { useEffect, useMemo, useState } from "react";

type ClockDisplay = {
  time: string;
  period: string;
  date: string;
  zone: string;
  offset: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

const PLACEHOLDER: ClockDisplay = {
  time: "--:--:--",
  period: "",
  date: "Your local date",
  zone: "Local time zone",
  offset: "",
  hourAngle: 0,
  minuteAngle: 0,
  secondAngle: 0,
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);

function localOffset(date: Date) {
  const totalMinutes = -date.getTimezoneOffset();
  const sign = totalMinutes >= 0 ? "+" : "−";
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [hour12, setHour12] = useState(true);

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
      hour12,
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
    return {
      time: `${value("hour")}:${value("minute")}:${value("second")}`,
      period: value("dayPeriod"),
      date: new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(now),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " "),
      offset: localOffset(now),
      hourAngle: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5,
      minuteAngle: now.getMinutes() * 6 + now.getSeconds() * 0.1,
      secondAngle: now.getSeconds() * 6,
    };
  }, [hour12, now]);

  async function copyTime() {
    if (!now || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`${clock.time}${clock.period ? ` ${clock.period}` : ""}, ${clock.date}`);
  }

  return (
    <section className="rounded-sm border border-[#cfd9e6] bg-white px-5 py-6 sm:px-7 sm:py-7" aria-label="Current local date and time">
      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_220px] md:gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <p className="whitespace-nowrap font-display text-[42px] font-bold leading-none tracking-[-0.045em] text-[#071b41] tabular-nums sm:text-[58px] lg:text-[64px]" aria-live="off">
            {clock.time}{clock.period && <span className="ml-2 text-[24px] tracking-[-0.02em] sm:text-[30px]">{clock.period}</span>}
          </p>
          <p className="mt-3 text-[22px] font-medium leading-tight text-[#13284c] sm:text-[27px]">{clock.date}</p>
          <p className="mt-2 text-base font-medium text-[#4f6684]">{clock.zone}{clock.offset && ` (${clock.offset})`}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-[#0969da]">
            <Link href="/calculators/timezone-converter" className="hover:underline">Change location</Link>
            <span className="text-[#a8b5c6]" aria-hidden="true">|</span>
            <button type="button" className="hover:underline" onClick={() => setHour12((value) => !value)}>{hour12 ? "Use 24-hour format" : "Use 12-hour format"}</button>
            <span className="text-[#a8b5c6]" aria-hidden="true">|</span>
            <button type="button" className="hover:underline" onClick={copyTime}>Copy time</button>
          </div>
        </div>

        <div className="relative mx-auto h-48 w-48 rounded-full border-2 border-[#74849a] bg-white sm:h-52 sm:w-52 lg:h-56 lg:w-56" aria-hidden="true">
          {HOURS.map((hour) => {
            const angle = hour * 30 * (Math.PI / 180);
            return (
              <span
                key={hour}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold leading-none text-[#071b41] sm:text-[13px]"
                style={{ left: `${50 + Math.sin(angle) * 40}%`, top: `${50 - Math.cos(angle) * 40}%` }}
              >
                {hour}
              </span>
            );
          })}
          <span className="absolute bottom-1/2 left-1/2 h-[27%] w-1 rounded-full bg-[#14243a]" style={{ transform: `translateX(-50%) rotate(${clock.hourAngle}deg)`, transformOrigin: "50% 100%" }} />
          <span className="absolute bottom-1/2 left-1/2 h-[36%] w-[3px] rounded-full bg-[#14243a]" style={{ transform: `translateX(-50%) rotate(${clock.minuteAngle}deg)`, transformOrigin: "50% 100%" }} />
          <span className="absolute bottom-1/2 left-1/2 h-[40%] w-px rounded-full bg-[#e1262f]" style={{ transform: `translateX(-50%) rotate(${clock.secondAngle}deg)`, transformOrigin: "50% 100%" }} />
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[#e1262f]" />
        </div>
      </div>
    </section>
  );
}
