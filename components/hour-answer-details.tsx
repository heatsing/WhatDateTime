"use client";

import { formatInTimeZone } from "date-fns-tz";
import { localISO, resolveWallTime } from "@/lib/timezoneFacts";
import { relativeResult } from "@/lib/relative-state";
import { useRelativeState } from "./use-relative-state";
import { useMemo } from "react";
import Link from "@/components/link";
import { calculateRelativeDate } from "@/lib/dateCalculator";
import type { RelativeCalculationInput } from "@/lib/pageCalculations";
import { getRelativePhrase } from "@/lib/pageCalculations";

type RelatedHourPage = RelativeCalculationInput & { slug: string };

function resultFor(page: RelativeCalculationInput, date: Date, amount = page.amount) {
  return calculateRelativeDate(date, amount, "hour", page.direction);
}

export function HourAnswerDetails({
  page: originalPage,
  referenceTime,
}: {
  page: RelativeCalculationInput;
  referenceTime: string;
}) {
  const { state } = useRelativeState(originalPage, referenceTime);
  const page = state.page;
  const now = new Date(state.instant);
  const format = (d: Date, pattern: string) => formatInTimeZone(d, state.zone, pattern);
  const midpointAmount = page.amount / 2;
  const midpoint = resultFor(page, now, midpointAmount);
  const result = resultFor(page, now);
  const directionLabel = page.direction === "future" ? "from now" : "ago";
  const actionLabel = page.direction === "future" ? "later" : "earlier";
  const quantity = `${page.amount} ${page.amount === 1 ? "hour" : "hours"}`;
  const headingQuantity = `${page.amount} ${page.amount === 1 ? "Hour" : "Hours"}`;
  const tableRows = useMemo(() => Array.from({length:24}, (_,hour) => {
    const local = localISO(now, state.zone).slice(0,10) + "T" + String(hour).padStart(2,"0") + ":00";
    return { label: `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`, instants: resolveWallTime(local, state.zone) };
  }), [state.instant, state.zone]);
  if (page.unit !== "hour") return null;

  return (
    <>
      <section className="rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6" aria-labelledby="hour-timeline-heading">
        <h2 id="hour-timeline-heading" className="font-display text-xl font-bold text-[#10264b]">
          {page.amount}-Hour Timeline
        </h2>
        <div className="relative mt-8 grid grid-cols-3 gap-3 text-center before:absolute before:left-[16.67%] before:right-[16.67%] before:top-2 before:h-0.5 before:bg-[#315f8d]">
          {[
            { label: page.direction === "future" ? state.mode === "live" ? "Now" : "Start" : "Result", date: page.direction === "future" ? now : result },
            { label: `${midpointAmount} hr`, date: midpoint },
            { label: page.direction === "future" ? `+${page.amount} hr` : state.mode === "live" ? "Now" : "Start", date: page.direction === "future" ? result : now },
          ].map((item) => (
            <div key={item.label} className="relative z-10">
              <span className="mx-auto block h-4 w-4 rounded-full border-2 border-white bg-[#0b74e5] shadow-sm" />
              <p className="mt-2 text-xs font-bold text-[#10264b]">{item.label}</p>
              <p className="mt-1 text-sm font-bold text-[#10264b]">{format(item.date, "h:mm a")}</p>
              <p className="mt-0.5 text-xs text-[#536b8d]">{format(item.date, "EEE, MMM d, yyyy")}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-[#d8e1ed] pt-3 text-sm text-[#536b8d]">
          The result is {format(result, "EEEE, MMMM d, yyyy")} ({state.zone}; {state.mode === "example" ? "fixed example" : state.mode + " calculation"}).
        </p>
      </section>

      <section className="mt-5 rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6" aria-labelledby="starting-times-heading">
        <h2 id="starting-times-heading" className="font-display text-xl font-bold text-[#10264b]">
          {`${headingQuantity} ${page.direction === "future" ? "From Now" : "Ago"} at Different Starting Times`}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#536b8d]">
          Compare the result for every hour of the day using the same {page.amount}-hour interval.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#eaf4fc] text-[#10264b]">
                <th className="border border-[#d8e1ed] px-3 py-2 font-bold">Starting time</th>
                <th className="border border-[#d8e1ed] px-3 py-2 font-bold">{`${quantity} ${actionLabel}`}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => <tr key={row.label} className="even:bg-[#f8fbfe]">
                <td className="border border-[#d8e1ed] px-3 py-1.5 text-[#405776]">{row.label}</td>
                <td className="border border-[#d8e1ed] px-3 py-1.5 text-[#405776]">{row.instants.length ? row.instants.map(start=>format(resultFor(page,start),"h:mm a, MMM d")).join(" / ") : "Skipped by clock change"}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section data-content-stage="how-to-use" className="mt-5 rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-[#10264b]">{`How to Calculate ${headingQuantity} ${directionLabel}`}</h2>
        <p className="mt-3 text-sm leading-7 text-[#405776]">
          Start with the current local time, then {page.direction === "future" ? "add" : "subtract"} {page.amount} {page.amount === 1 ? "hour" : "hours"}. Hours are elapsed 60-minute intervals; clock changes may alter the local clock reading. If the calculation crosses midnight, the calendar date changes automatically.
        </p>
        <div className="mt-4 border-l-4 border-[#0b74e5] bg-[#edf6ff] px-4 py-3 text-sm leading-6 text-[#405776]">
          <strong className="text-[#10264b]">{state.mode === "example" ? "Example calculation:" : "Calculation:"}</strong> {format(now, "h:mm a, MMM d, yyyy")} ({state.zone}) {page.direction === "future" ? "+" : "−"} {page.amount} {page.amount === 1 ? "hour" : "hours"} = {format(result, "h:mm a")} on {format(result, "EEEE, MMMM d, yyyy")}.
        </div>
        <div data-content-stage="practical-scenarios" className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-base font-bold text-[#10264b]">When This Calculation Is Useful</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#405776]">
              <li>Meeting and appointment reminders</li>
              <li>Travel connections and layovers</li>
              <li>Cooking, medication, and study timers</li>
              <li>Work breaks and shift planning</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#10264b]">Does the Date Change?</h3>
            <p className="mt-2 text-sm leading-6 text-[#405776]">
              The date changes when the interval crosses midnight. Live mode uses your device clock and time zone. Editing the inputs freezes the starting conditions until you choose Reset to current time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function CurrentTimePanel({ referenceTime }: { referenceTime: string }) {
  const { state } = useRelativeState({kind:"relative",type:"hours-from-now",amount:0,unit:"hour",direction:"future"}, referenceTime);
  const now = new Date(state.instant);
  const format = (d: Date, pattern: string) => formatInTimeZone(d, state.zone, pattern);

  return (
    <section className="rounded-sm border border-[#d8e1ed] bg-white p-4" aria-labelledby="current-time-heading">
      <h2 id="current-time-heading" className="font-display text-lg font-bold text-[#10264b]">{state.mode === "example" ? "Example starting time" : "Current Time"}</h2>
      <div className="mt-3 border-t border-[#d8e1ed] pt-4">
        <p className="font-display text-3xl font-bold tracking-[-0.03em] text-[#10264b]" aria-live="polite">{format(now, "h:mm a")}</p>
        <p className="mt-1 text-sm leading-6 text-[#536b8d]">{format(now, "EEEE, MMMM d, yyyy")}</p>
        <p className="mt-1 text-xs text-[#536b8d]">{state.zone} · {state.mode === "example" ? "Fixed example" : "Device clock"}</p>
      </div>
    </section>
  );
}

export function LiveRelatedHourLinks({
  currentPage,
  pages,
  referenceTime,
}: {
  currentPage: RelatedHourPage;
  pages: RelatedHourPage[];
  referenceTime: string;
}) {
  const { state } = useRelativeState(currentPage, referenceTime);
  const now = new Date(state.instant);
  const format = (d: Date, pattern: string) => formatInTimeZone(d, state.zone, pattern);
  const rows = [currentPage, ...pages]
    .filter((page, index, list) => list.findIndex((candidate) => candidate.slug === page.slug) === index)
    .sort((left, right) => left.amount - right.amount);

  return (
    <section aria-labelledby="nearby-hour-heading" data-content-stage="nearby-results">
      <h2 id="nearby-hour-heading" className="font-display text-2xl font-bold text-[#10264b]">Nearby Hour Calculations</h2>
      <p className="mt-2 text-sm leading-6 text-[#536b8d]">Compare hourly intervals from the same starting point ({state.zone}; {state.mode}).</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead><tr className="bg-[#eaf4fc] text-[#10264b]"><th className="border border-[#d8e1ed] px-3 py-2">Calculation</th><th className="border border-[#d8e1ed] px-3 py-2">Result</th></tr></thead>
          <tbody>
            {rows.map((page) => {
              const result = page.slug === currentPage.slug ? relativeResult(state) : resultFor(page, now);
              const current = page.slug === currentPage.slug;
              const label = getRelativePhrase(current ? state.page : page);
              return (
                <tr key={page.slug} className={current ? "bg-[#edf6ff] font-semibold" : "even:bg-[#f8fbfe]"}>
                  <td className="border border-[#d8e1ed] px-3 py-2">{current ? <span aria-current="page">{label}</span> : <Link href={`/${page.slug}`} className="font-semibold text-[#0969da] hover:underline">{label}</Link>}</td>
                  <td className="border border-[#d8e1ed] px-3 py-2 text-[#405776]">{format(result, "h:mm a, EEE, MMM d, yyyy")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
