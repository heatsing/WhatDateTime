"use client";

import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";
import {
  calculateRelativeDate,
  formatLongDate,
} from "@/lib/dateCalculator";
import {
  getPageFormula,
  getPageResult,
  getRelativePhrase,
} from "@/lib/pageCalculations";
import type { RelativeCalculationInput } from "@/lib/pageCalculations";

type DirectDateAnswerProps = {
  page: RelativeCalculationInput;
  referenceTime: string;
  initialTimeZone: string;
};

const weekdays = [
  ["Sunday", "Sun"],
  ["Monday", "Mon"],
  ["Tuesday", "Tue"],
  ["Wednesday", "Wed"],
  ["Thursday", "Thu"],
  ["Friday", "Fri"],
  ["Saturday", "Sat"],
] as const;

export function DirectDateAnswer({
  page,
  referenceTime,
  initialTimeZone,
}: DirectDateAnswerProps) {
  const [liveReferenceDate, setLiveReferenceDate] = useState(
    () => toZonedTime(new Date(referenceTime), initialTimeZone),
  );
  useEffect(() => {
    const update = () => setLiveReferenceDate(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const includesTime = page.unit === "hour";
  const phrase = getRelativePhrase(page);
  const resultDate = calculateRelativeDate(
    liveReferenceDate,
    page.amount,
    page.unit,
    page.direction,
  );
  const result = getPageResult(page, liveReferenceDate);
  const formula = getPageFormula(page, liveReferenceDate);
  const prompt =
    page.type === "days-ago"
      ? `What date was ${phrase} from today?`
      : `${includesTime ? "What time is" : "What date is"} ${phrase}?`;

  if (includesTime) {
    return (
      <article
        data-content-stage="direct-answer"
        className="py-4 text-center sm:py-5"
        aria-labelledby="direct-date-answer-heading"
      >
        <header>
          <div className="-mx-4 -mt-4 bg-[#0875d1] px-4 py-2 text-left sm:-mx-6 sm:-mt-5 sm:px-5">
            <h2 id="direct-date-answer-heading" className="text-sm font-bold text-white">
              {`${page.amount} ${page.amount === 1 ? "Hour" : "Hours"} ${page.direction === "future" ? "From Now" : "Ago"}`}
            </h2>
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c7f9b]">Direct answer</p>
          <p className="mt-1 font-display text-4xl font-bold leading-none tracking-[-0.04em] text-[#0c2146] sm:text-5xl" aria-live="polite">
            {format(resultDate, "h:mm a")}
          </p>
          <p className="mt-2 text-base font-medium text-[#263d60]">{format(resultDate, "EEEE, MMMM d, yyyy")}</p>
          <p className="mt-2 text-sm text-[#405776]">
            {page.amount === 1 ? "One hour" : `${page.amount} hours`} {page.direction === "future" ? "from" : "before"} {format(liveReferenceDate, "h:mm a")} is <strong>{format(resultDate, "h:mm a")}</strong>.
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`${format(resultDate, "h:mm a")} on ${format(resultDate, "EEEE, MMMM d, yyyy")}`)}
            className="mt-3 rounded-sm border border-[#b8c7d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#0969da] hover:bg-[#f3f8fd]"
          >
            Copy answer
          </button>
          <time dateTime={format(resultDate, "yyyy-MM-dd'T'HH:mm")} className="sr-only">{result}</time>
        </header>

        <section data-content-stage="calculation-basis" className="mt-5 border-y border-[#d8e1ed] py-3" aria-labelledby="calculation-basis-heading">
          <h3 id="calculation-basis-heading" className="sr-only">Formula</h3>
          <p className="font-mono text-sm font-bold text-[#263d60]">{format(liveReferenceDate, "h:mm a")} {page.direction === "future" ? "+" : "−"} {page.amount} {page.amount === 1 ? "hour" : "hours"} = {format(resultDate, "h:mm a")}</p>
        </section>

        <div className="mx-auto mt-4 grid max-w-3xl items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <TimeComparison label="Starting time" date={liveReferenceDate} />
          <span className="hidden text-2xl font-bold text-[#315f8d] sm:block" aria-hidden="true">→</span>
          <TimeComparison label="Result time" date={resultDate} />
        </div>
      </article>
    );
  }

  return (
    <article
      data-content-stage="direct-answer"
      className="mx-auto max-w-4xl py-5 text-center sm:py-8"
      aria-labelledby="direct-date-answer-heading"
    >
      <header>
        <p className="text-sm font-semibold text-fern">Direct answer</p>
        <h2
          id="direct-date-answer-heading"
          className="mx-auto mt-2.5 max-w-3xl font-display text-xl font-semibold leading-snug text-ink/65 sm:text-2xl"
        >
          {prompt}
        </h2>
        <p
          className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-5xl lg:text-[56px]"
          aria-live="polite"
        >
          {result}
        </p>
        <time
          dateTime={format(
            resultDate,
            includesTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd",
          )}
          className="sr-only"
        >
          {result}
        </time>
      </header>

      {!includesTime && <MonthCalendar resultDate={resultDate} />}

      <section
        className={`${includesTime ? "mt-7" : "mt-6"} w-full rounded-md border-y border-[#D9DEE5] bg-[#F4F8FB] px-4 py-3.5`}
        aria-labelledby="calculation-basis-heading"
      >
        <h3
          id="calculation-basis-heading"
          className="font-display text-sm font-bold text-fern"
        >
          Formula
        </h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{formula}</p>
      </section>

      <div className="mt-6 grid divide-y divide-[#D9DEE5] border-y border-[#D9DEE5] text-left sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <DateComparison
          label="Starting date"
          date={liveReferenceDate}
          includesTime={includesTime}
        />
        <DateComparison
          label="Result date"
          date={resultDate}
          includesTime={includesTime}
        />
      </div>
    </article>
  );
}

function TimeComparison({ label, date }: { label: string; date: Date }) {
  return (
    <section className="rounded-sm border border-[#d8e1ed] bg-[#f7fafc] px-4 py-3" aria-label={`${label}: ${formatLongDate(date, true)}`}>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6c7f9b]">{label}</h3>
      <p className="mt-1 font-display text-xl font-bold text-[#10264b]">{format(date, "h:mm a")}</p>
      <p className="mt-1 text-xs leading-5 text-[#536b8d]">{format(date, "EEEE, MMMM d, yyyy")}</p>
    </section>
  );
}

function MonthCalendar({ resultDate }: { resultDate: Date }) {
  const gridStart = startOfWeek(startOfMonth(resultDate), {
    weekStartsOn: 0,
  });
  const days = eachDayOfInterval({
    start: gridStart,
    end: addDays(gridStart, 41),
  });
  const weeks = Array.from({ length: 6 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
  const monthLabel = format(resultDate, "MMMM yyyy");

  return (
    <section
      className="mx-auto mt-7 w-full max-w-[26rem] overflow-hidden rounded-lg border border-[#D9DEE5] bg-white"
      aria-label={`${monthLabel} calendar`}
    >
      <table className="w-full table-fixed border-collapse">
        <caption className="border-b border-[#C8D0D8] bg-[#E7F0F8] px-4 py-2.5 font-display text-sm font-semibold text-ink">
          {monthLabel}
        </caption>
        <thead>
          <tr>
            {weekdays.map(([full, short]) => (
              <th
                key={full}
                scope="col"
                className="h-10 text-center text-xs font-bold text-ink/60"
              >
                <abbr title={full} className="no-underline">
                  {short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={format(week[0], "yyyy-MM-dd")}>
              {week.map((day) => {
                const isResult = isSameDay(day, resultDate);
                const isCurrentMonth = isSameMonth(day, resultDate);

                return (
                  <td
                    key={format(day, "yyyy-MM-dd")}
                    className="h-10 p-0 text-center text-sm"
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      aria-current={isResult ? "date" : undefined}
                      className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${
                        isResult
                          ? "bg-fern font-bold text-white"
                          : isCurrentMonth
                            ? "font-semibold text-ink/80"
                            : "text-ink/35"
                      }`}
                    >
                      {format(day, "d")}
                    </time>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DateComparison({
  label,
  date,
  includesTime,
}: {
  label: string;
  date: Date;
  includesTime: boolean;
}) {
  return (
    <section
      className="min-w-0 px-4 py-5 text-center sm:px-6"
      aria-label={`${label}: ${formatLongDate(date, includesTime)}`}
    >
      <h3 className="text-xs font-semibold text-fern">
        {label}
      </h3>
      <p className="mt-3 font-display text-lg font-semibold text-ink">
        {format(date, "EEEE")}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
        {format(date, "MMMM d")}
      </p>
      <p className="mt-1 font-display text-xl font-semibold text-ink/55">
        {format(date, "yyyy")}
      </p>
      {includesTime && (
        <time
          dateTime={format(date, "HH:mm")}
          className="mt-3 inline-block rounded-md bg-[#E7F0F8] px-3 py-1 text-sm font-bold text-fern"
        >
          {format(date, "h:mm a")}
        </time>
      )}
    </section>
  );
}
