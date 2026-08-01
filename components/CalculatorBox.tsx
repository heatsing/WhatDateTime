"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  calculateDateDifference,
  calculateRelativeDate,
  formatLongDate,
  formatZonedTime,
  parseLocalDate,
  type RelativeUnit,
} from "@/lib/dateCalculator";
import type { SEOPage } from "@/lib/seoGenerator";

const fieldClass =
  "h-12 min-w-0 max-w-full w-full rounded-md border border-[#C8D0D8] bg-white px-3.5 text-sm font-medium text-ink outline-none focus:border-fern focus:ring-2 focus:ring-[#1769AA]/15";

const unitOptions: Array<{ value: RelativeUnit; label: string }> = [
  { value: "hour", label: "Hours" },
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
  { value: "year", label: "Years" },
  { value: "business-day", label: "Business days" },
];

export function CalculatorBox({
  page,
  initialResult,
  initialDate,
  initialDateTime,
}: {
  page: SEOPage;
  initialResult: string;
  initialDate: string;
  initialDateTime?: string;
}) {
  if (page.kind === "timezone") {
    return (
      <TimezoneForm
        page={page}
        initialResult={initialResult}
        initialDate={initialDate}
        initialDateTime={initialDateTime}
      />
    );
  }

  if (page.kind === "difference") {
    return <DifferenceForm page={page} initialResult={initialResult} />;
  }

  return (
    <RelativeForm
      page={page}
      initialResult={initialResult}
      initialDate={initialDate}
    />
  );
}

function RelativeForm({
  page,
  initialResult,
  initialDate,
}: {
  page: Extract<SEOPage, { kind: "relative" }>;
  initialResult: string;
  initialDate: string;
}) {
  const [amount, setAmount] = useState(page.amount);
  const [unit, setUnit] = useState<RelativeUnit>(page.unit);
  const [date, setDate] = useState(initialDate);
  const [result, setResult] = useState(initialResult);

  useEffect(() => {
    const current = new Date();
    setDate(format(current, "yyyy-MM-dd"));
    const next = calculateRelativeDate(
      current,
      page.amount,
      page.unit,
      page.direction,
    );
    setResult(formatLongDate(next, page.unit === "hour"));
  }, [page.amount, page.direction, page.unit]);

  function calculate(event: FormEvent) {
    event.preventDefault();
    const next = calculateRelativeDate(
      parseLocalDate(date),
      Math.max(0, amount),
      unit,
      page.direction,
    );
    setResult(formatLongDate(next, unit === "hour"));
  }

  return (
    <CalculatorShell
      result={
        <CompactResult
          label="Calculated result"
          result={result}
          detail={`Calculated ${page.direction === "future" ? "forward" : "backward"} from ${format(parseLocalDate(date), "MMMM d, yyyy")}.`}
          kind={unit === "hour" ? "time" : "date"}
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.25fr)_minmax(9rem,0.85fr)]">
          <Field label="Number" htmlFor="seo-amount">
            <input
              id="seo-amount"
              name="seo-amount"
              autoComplete="off"
              type="number"
              inputMode="numeric"
              min={0}
              max={10000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className={fieldClass}
            />
          </Field>
          <Field label="Unit" htmlFor="seo-unit">
            <select
              id="seo-unit"
              name="seo-unit"
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as RelativeUnit)
              }
              className={fieldClass}
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Starting date" htmlFor="seo-date">
            <input
              id="seo-date"
              name="seo-date"
              autoComplete="off"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <CalculateButton />
        </div>
      </form>
    </CalculatorShell>
  );
}

function DifferenceForm({
  page,
  initialResult,
}: {
  page: Extract<SEOPage, { kind: "difference" }>;
  initialResult: string;
}) {
  const [start, setStart] = useState(page.start);
  const [end, setEnd] = useState(page.end);
  const [result, setResult] = useState(initialResult);

  function calculate(event: FormEvent) {
    event.preventDefault();
    const days = calculateDateDifference(
      parseLocalDate(start),
      parseLocalDate(end),
    );
    setResult(`${days.toLocaleString()} days`);
  }

  return (
    <CalculatorShell
      result={
        <CompactResult
          label="Exact difference"
          result={result}
          detail="Standard elapsed-day count between the selected calendar dates."
          kind="difference"
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10rem,0.7fr)]">
          <Field label="Start date" htmlFor="difference-start">
            <input
              id="difference-start"
              name="difference-start"
              autoComplete="off"
              type="date"
              required
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="End date" htmlFor="difference-end">
            <input
              id="difference-end"
              name="difference-end"
              autoComplete="off"
              type="date"
              required
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <CalculateButton label="Find difference" />
        </div>
      </form>
    </CalculatorShell>
  );
}

function TimezoneForm({
  page,
  initialResult,
  initialDate,
  initialDateTime,
}: {
  page: Extract<SEOPage, { kind: "timezone" }>;
  initialResult: string;
  initialDate: string;
  initialDateTime?: string;
}) {
  const [dateTime, setDateTime] = useState(
    initialDateTime || `${initialDate}T12:00`,
  );
  const [result, setResult] = useState(initialResult);

  useEffect(() => {
    const current = new Date();
    setDateTime(formatInTimeZone(current, page.fromZone, "yyyy-MM-dd'T'HH:mm"));
    const converted = formatZonedTime(current, page.toZone);
    setResult(
      `${converted.time} on ${converted.date} (${converted.abbreviation})`,
    );
  }, [page.fromZone, page.toZone]);

  function calculate(event: FormEvent) {
    event.preventDefault();
    const instant = fromZonedTime(dateTime, page.fromZone);
    const converted = formatZonedTime(instant, page.toZone);
    setResult(
      `${converted.time} on ${converted.date} (${converted.abbreviation})`,
    );
  }

  return (
    <CalculatorShell
      result={
        <CompactResult
          label={`${page.toCity} local time`}
          result={result}
          detail={`Converted from ${page.fromCity} using daylight-saving rules for the selected date.`}
          kind="time"
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(9rem,0.75fr)]">
          <Field label={`Date & time in ${page.fromCity}`} htmlFor="zone-date">
            <input
              id="zone-date"
              name="zone-date"
              autoComplete="off"
              type="datetime-local"
              required
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <ReadonlyZone label="From" city={page.fromCity} zone={page.fromZone} />
          <ReadonlyZone label="To" city={page.toCity} zone={page.toZone} />
          <CalculateButton label="Convert time" />
        </div>
      </form>
    </CalculatorShell>
  );
}

function CalculatorShell({
  children,
  result,
}: {
  children: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-[#C8D0D8] bg-[#EEF6FC]">
      <div className="p-4 sm:p-6">{children}</div>
      {result}
    </div>
  );
}

function FormHeading() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-fern">
        <Calculator className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-ink">
          Try another value
        </p>
        <p className="text-xs text-ink/45">Change any field for a new result</p>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="inline-flex h-12 w-full self-end items-center justify-center gap-2 rounded-md bg-fern px-4 text-sm font-semibold text-white hover:bg-[#12558B]">
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function ReadonlyZone({
  label,
  city,
  zone,
}: {
  label: string;
  city: string;
  zone: string;
}) {
  return (
    <div className="min-w-0 self-end rounded-md border border-[#C8D0D8] bg-white px-3 py-2">
      <p className="text-xs font-semibold text-fern">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        {city}
      </p>
      <p className="mt-1 truncate text-[11px] text-ink/40">{zone}</p>
    </div>
  );
}

function CompactResult({
  label,
  result,
  detail,
  kind = "date",
}: {
  label: string;
  result: string;
  detail?: string;
  kind?: "date" | "time" | "difference";
}) {
  const ResultIcon =
    kind === "time" ? Clock3 : kind === "difference" ? MapPin : CalendarCheck2;

  return (
    <div
      className="min-w-0 border-t border-[#C8D0D8] bg-white/70 px-4 py-3 text-ink sm:flex sm:items-center sm:gap-4 sm:px-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-fern">
        <ResultIcon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <p className="mt-1 min-w-0 font-display text-base font-bold leading-6 text-ink sm:mt-0">
        {result}
      </p>
      {detail && (
        <p className="mt-1 min-w-0 text-xs leading-5 text-ink/50 sm:ml-auto sm:mt-0 sm:max-w-xs sm:text-right">
          {detail}
        </p>
      )}
    </div>
  );
}
