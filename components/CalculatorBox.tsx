"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Calculator, CalendarDays } from "lucide-react";
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
import { ResultCard } from "@/components/ResultCard";

const fieldClass =
  "h-12 w-full rounded-xl border border-ink/10 bg-mist px-4 text-sm font-semibold text-ink outline-none ring-fern/25 transition focus:ring-2";

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
        <ResultCard
          label="Calculated result"
          result={result}
          detail={`Calculated ${page.direction === "future" ? "forward" : "backward"} from ${format(parseLocalDate(date), "MMMM d, yyyy")}.`}
          kind={unit === "hour" ? "time" : "date"}
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Number" htmlFor="seo-amount">
            <input
              id="seo-amount"
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
        </div>
        <div className="mt-4">
          <Field label="Starting date" htmlFor="seo-date">
            <input
              id="seo-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <CalculateButton />
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
        <ResultCard
          label="Exact difference"
          result={result}
          detail="Standard elapsed-day count between the selected calendar dates."
          kind="difference"
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-6 space-y-4">
          <Field label="Start date" htmlFor="difference-start">
            <input
              id="difference-start"
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
              type="date"
              required
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <CalculateButton label="Find difference" />
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
        <ResultCard
          label={`${page.toCity} local time`}
          result={result}
          detail={`Converted from ${page.fromCity} using daylight-saving rules for the selected date.`}
          kind="time"
        />
      }
    >
      <form onSubmit={calculate}>
        <FormHeading />
        <div className="mt-6">
          <Field label={`Date & time in ${page.fromCity}`} htmlFor="zone-date">
            <input
              id="zone-date"
              type="datetime-local"
              required
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ReadonlyZone label="From" city={page.fromCity} zone={page.fromZone} />
          <ReadonlyZone label="To" city={page.toCity} zone={page.toZone} />
        </div>
        <CalculateButton label="Convert time" />
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
    <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.07] bg-white shadow-soft">
      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="p-6 sm:p-9">{children}</div>
        {result}
      </div>
    </div>
  );
}

function FormHeading() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime/70 text-ink">
        <Calculator className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display font-bold text-ink">Calculate another value</p>
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
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white transition hover:bg-fern">
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
    <div className="rounded-xl border border-ink/10 bg-mist p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-fern">
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
