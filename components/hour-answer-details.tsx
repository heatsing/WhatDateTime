"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/link";
import { calculateRelativeDate } from "@/lib/dateCalculator";
import type { RelativeCalculationInput } from "@/lib/pageCalculations";

type RelatedHourPage = RelativeCalculationInput & { slug: string };

function useLiveReference(referenceTime: string) {
  const [now, setNow] = useState(() => new Date(referenceTime));

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function resultFor(page: RelativeCalculationInput, date: Date, amount = page.amount) {
  return calculateRelativeDate(date, amount, "hour", page.direction);
}

export function HourAnswerDetails({
  page,
  referenceTime,
}: {
  page: RelativeCalculationInput;
  referenceTime: string;
}) {
  const now = useLiveReference(referenceTime);
  const midpointAmount = Math.max(1, Math.floor(page.amount / 2));
  const midpoint = resultFor(page, now, midpointAmount);
  const result = resultFor(page, now);
  const directionLabel = page.direction === "future" ? "from now" : "ago";
  const actionLabel = page.direction === "future" ? "later" : "earlier";
  const quantity = `${page.amount} ${page.amount === 1 ? "hour" : "hours"}`;
  const headingQuantity = `${page.amount} ${page.amount === 1 ? "Hour" : "Hours"}`;
  const tableRows = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => {
        const start = new Date(now);
        start.setHours(hour, 0, 0, 0);
        return { start, result: resultFor(page, start) };
      }),
    [now, page],
  );

  return (
    <>
      <section className="rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6" aria-labelledby="hour-timeline-heading">
        <h2 id="hour-timeline-heading" className="font-display text-xl font-bold text-[#10264b]">
          {page.amount}-Hour Timeline
        </h2>
        <div className="relative mt-8 grid grid-cols-3 gap-3 text-center before:absolute before:left-[16.67%] before:right-[16.67%] before:top-2 before:h-0.5 before:bg-[#315f8d]">
          {[
            { label: page.direction === "future" ? "Now" : "Result", date: page.direction === "future" ? now : result },
            { label: `${midpointAmount} hr`, date: midpoint },
            { label: page.direction === "future" ? `+${page.amount} hr` : "Now", date: page.direction === "future" ? result : now },
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
          The result is {format(result, "EEEE, MMMM d, yyyy")} and is recalculated from your current local time.
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
              {tableRows.map(({ start, result: rowResult }) => (
                <tr key={format(start, "HH")} className="even:bg-[#f8fbfe]">
                  <td className="border border-[#d8e1ed] px-3 py-1.5 text-[#405776]">{format(start, "h:mm a")}</td>
                  <td className="border border-[#d8e1ed] px-3 py-1.5 text-[#405776]">
                    {format(rowResult, "h:mm a")}{format(start, "yyyy-MM-dd") !== format(rowResult, "yyyy-MM-dd") ? ` (${format(rowResult, "MMM d")})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section data-content-stage="how-to-use" className="mt-5 rounded-sm border border-[#d8e1ed] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-[#10264b]">{`How to Calculate ${headingQuantity} ${directionLabel}`}</h2>
        <p className="mt-3 text-sm leading-7 text-[#405776]">
          Start with the current local time, then {page.direction === "future" ? "add" : "subtract"} {page.amount} {page.amount === 1 ? "hour" : "hours"}. The minutes stay the same. If the calculation crosses midnight, the calendar date changes automatically.
        </p>
        <div className="mt-4 border-l-4 border-[#0b74e5] bg-[#edf6ff] px-4 py-3 text-sm leading-6 text-[#405776]">
          <strong className="text-[#10264b]">Current example:</strong> {format(now, "h:mm a")} {page.direction === "future" ? "+" : "−"} {page.amount} {page.amount === 1 ? "hour" : "hours"} = {format(result, "h:mm a")} on {format(result, "EEEE, MMMM d, yyyy")}.
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
              The date changes only when the result passes midnight. This page uses your current local clock after loading so the displayed answer stays aligned with the time you visit.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function CurrentTimePanel({ referenceTime }: { referenceTime: string }) {
  const now = useLiveReference(referenceTime);

  return (
    <section className="rounded-sm border border-[#d8e1ed] bg-white p-4" aria-labelledby="current-time-heading">
      <h2 id="current-time-heading" className="font-display text-lg font-bold text-[#10264b]">Current Time</h2>
      <div className="mt-3 border-t border-[#d8e1ed] pt-4">
        <p className="font-display text-3xl font-bold tracking-[-0.03em] text-[#10264b]" aria-live="polite">{format(now, "h:mm a")}</p>
        <p className="mt-1 text-sm leading-6 text-[#536b8d]">{format(now, "EEEE, MMMM d, yyyy")}</p>
        <p className="mt-1 text-xs text-[#536b8d]">Your local device time</p>
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
  const now = useLiveReference(referenceTime);
  const rows = [currentPage, ...pages]
    .filter((page, index, list) => list.findIndex((candidate) => candidate.slug === page.slug) === index)
    .sort((left, right) => left.amount - right.amount);

  return (
    <section aria-labelledby="nearby-hour-heading" data-content-stage="nearby-results">
      <h2 id="nearby-hour-heading" className="font-display text-2xl font-bold text-[#10264b]">Nearby Hour Calculations</h2>
      <p className="mt-2 text-sm leading-6 text-[#536b8d]">Compare nearby results calculated from your current local time.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead><tr className="bg-[#eaf4fc] text-[#10264b]"><th className="border border-[#d8e1ed] px-3 py-2">Calculation</th><th className="border border-[#d8e1ed] px-3 py-2">Result</th></tr></thead>
          <tbody>
            {rows.map((page) => {
              const result = resultFor(page, now);
              const label = `${page.amount} ${page.amount === 1 ? "Hour" : "Hours"} ${page.direction === "future" ? "From Now" : "Ago"}`;
              const current = page.slug === currentPage.slug;
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
