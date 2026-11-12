import { useRelativeState } from "./use-relative-state";
import { relativeText, relativeResult } from "@/lib/relative-state";
import { resolveWallTime } from "@/lib/timezoneFacts";
import { toolEvent } from "@/lib/tool-events";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  calculateDateDifference,
  formatZonedTime,
  parseLocalDate,
  type RelativeUnit,
} from "@/lib/dateCalculator";
import type {
  DifferenceCalculationInput,
  PageCalculationInput,
  RelativeCalculationInput,
  TimezoneCalculationInput,
} from "@/lib/pageCalculations";

const fieldClass =
  "h-[52px] min-w-0 max-w-full w-full rounded-md border border-[#C8D0D8] bg-white px-4 text-base font-medium text-ink outline-none focus:border-fern focus:ring-2 focus:ring-[#1769AA]/15";

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
  referenceTime,
}: {
  page: PageCalculationInput;
  referenceTime?: string;
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
      referenceTime={referenceTime}
      page={page}
      initialResult={initialResult}
      initialDate={initialDate}
      initialDateTime={initialDateTime}
    />
  );
}

function RelativeForm({ page, initialDate, referenceTime }: {
  page: RelativeCalculationInput; initialResult: string; initialDate: string; initialDateTime?: string; referenceTime?: string;
}) {
  const { state, update, hold, reset } = useRelativeState(page, referenceTime || initialDate + "T12:00:00.000Z");
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(page.amount));
  const [unit, setUnit] = useState<RelativeUnit>(page.unit);
  const [direction, setDirection] = useState(page.direction);
  const [date, setDate] = useState(formatInTimeZone(new Date(state.instant), state.zone, "yyyy-MM-dd'T'HH:mm"));
  const [error, setError] = useState("");
  useEffect(() => {
    if (!editing) setDate(formatInTimeZone(new Date(state.instant), state.zone, "yyyy-MM-dd'T'HH:mm"));
  }, [state.instant, state.zone, editing]);
  function edit() { if (!editing) { hold(); setEditing(true); } }
  function calculate(event: FormEvent) {
    event.preventDefault();
    const instants = resolveWallTime(date, state.zone);
    const quantity = Number(amount);
    if (instants.length !== 1 || amount.trim() === "" || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 10000) {
      setError(instants.length > 1 ? "This time occurs twice during a clock change. Choose an unambiguous time or use the Time Zone Converter." : "Enter a valid date and a whole-number amount from 0 to 10,000. Skipped clock-change times are not valid.");
      return;
    }
    const next = { ...state, page: { ...page, amount: quantity, unit, direction }, instant: instants[0].toISOString(), mode: "custom" as const };
    try {
      const resultYear = relativeResult(next).getUTCFullYear();
      if (resultYear < 1 || resultYear > 9999) throw new RangeError();
      relativeText(next);
    } catch { setError("Choose a result between years 1 and 9999."); return; }
    update(next); setEditing(true); setError(""); toolEvent("calculate", "relative");
  }
  return <CalculatorShell result={<CompactResult label={state.mode === "example" ? "Example result (UTC)" : state.mode === "custom" ? "Custom result" : "Live result"} result={relativeText(state)} detail={`Starting point: ${formatInTimeZone(new Date(state.instant), state.zone, "MMMM d, yyyy 'at' h:mm a")} (${state.zone}).`} kind={state.page.unit === "hour" ? "time" : "date"} />}>
    <form onSubmit={calculate}>
      <FormHeading />
      <p className="mt-2 text-sm text-[#536b8d]">{state.mode === "example" ? "Example — fixed starting conditions in UTC. Enable JavaScript for current local time." : `${state.mode === "custom" ? "Custom calculation" : "Live calculation"} · ${state.zone}`}</p>
      {unit === "business-day" && <p className="mt-2 text-sm text-[#536b8d]">Weekends are excluded. Public holidays are not excluded. The starting date is not counted.</p>}
      <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
        <Field label="Number" htmlFor="seo-amount"><input id="seo-amount" type="number" required min={0} max={10000} step={1} value={amount} onChange={e=>{edit();setAmount(e.target.value);}} className={fieldClass}/></Field>
        <Field label="Unit" htmlFor="seo-unit"><select id="seo-unit" value={unit} onChange={e=>{edit();setUnit(e.target.value as RelativeUnit);}} className={fieldClass}>{unitOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
        <Field label="Direction" htmlFor="seo-direction"><select id="seo-direction" value={direction} onChange={e=>{edit();setDirection(e.target.value as typeof direction);}} className={fieldClass}><option value="future">Add</option><option value="past">Subtract</option></select></Field>
        <Field label={`Starting date & time (${state.zone})`} htmlFor="seo-date"><input id="seo-date" type="datetime-local" required value={date} onChange={e=>{edit();setDate(e.target.value);}} className={fieldClass}/></Field>
      </div>
      <CalculateButton />
      <button type="button" className="mt-3 min-h-11 text-sm font-semibold text-[#0969da] underline" onClick={()=>{setEditing(false);setAmount(String(page.amount));setUnit(page.unit);setDirection(page.direction);setError("");reset();}}>Reset to current time</button>
      {error && <p role="alert">{error}</p>}
    </form>
  </CalculatorShell>;
}

function DifferenceForm({
  page,
  initialResult,
}: {
  page: DifferenceCalculationInput;
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
  page: TimezoneCalculationInput;
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
    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-[#C8D0D8] bg-[#EEF6FC] shadow-card">
      <div className="p-5 sm:p-7 lg:p-8">{children}</div>
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
        <p className="font-display text-base font-semibold text-ink">
          Try another value
        </p>
        <p className="text-sm text-ink/45">Change any field for a new result</p>
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
        className="mb-2 block text-[15px] font-semibold text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="inline-flex h-[52px] w-full self-end items-center justify-center gap-2 rounded-md bg-fern px-5 text-base font-semibold text-white hover:bg-[#12558B]">
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
