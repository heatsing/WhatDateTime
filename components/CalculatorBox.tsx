import { useRelativeState } from "./use-relative-state";
import { relativeText, relativeResult } from "@/lib/relative-state";
import { resolveWallTime } from "@/lib/timezoneFacts";
import { toolEvent } from "@/lib/tool-events";
import { offsetInputHelp, parseOffsetAmount } from "@/lib/offset-input";

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

function RelativeForm({
  page,
  initialDate,
  referenceTime,
}: {
  page: RelativeCalculationInput;
  initialResult: string;
  initialDate: string;
  initialDateTime?: string;
  referenceTime?: string;
}) {
  const { state, update, reset } = useRelativeState(
    page,
    referenceTime || initialDate + "T12:00:00.000Z",
  );
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(page.amount));
  const [unit, setUnit] = useState<RelativeUnit>(page.unit);
  const [direction, setDirection] = useState(page.direction);
  const [date, setDate] = useState(
    formatInTimeZone(new Date(state.instant), state.zone, "yyyy-MM-dd'T'HH:mm"),
  );
  const [error, setError] = useState("");
  useEffect(() => {
    if (!editing)
      setDate(
        formatInTimeZone(
          new Date(state.instant),
          state.zone,
          "yyyy-MM-dd'T'HH:mm",
        ),
      );
  }, [state.instant, state.zone, editing]);
  function applyDraft(draft = { amount, unit, direction, date }) {
    setEditing(true);
    const reject = (message: string) => {
      setError(message);
      update({ ...state, mode: "custom", inputError: message });
      return false;
    };
    const instants = resolveWallTime(draft.date, state.zone);
    const quantity = parseOffsetAmount(draft.amount, draft.unit);
    if (!Number.isFinite(quantity)) return reject(offsetInputHelp(draft.unit));
    if (instants.length !== 1)
      return reject(
        instants.length > 1
          ? "This time occurs twice during a clock change. Choose an unambiguous starting time."
          : "Enter a valid starting date and time. Skipped clock-change times are not valid.",
      );
    const next = {
      ...state,
      page: {
        ...page,
        amount: quantity,
        unit: draft.unit,
        direction: draft.direction,
      },
      instant: instants[0].toISOString(),
      mode: "custom" as const,
      inputError: undefined,
    };
    try {
      const resultYear = relativeResult(next).getUTCFullYear();
      if (resultYear < 1 || resultYear > 9999) throw new RangeError();
      relativeText(next);
    } catch {
      return reject("Choose a result between years 1 and 9999.");
    }
    update(next);
    setError("");
    return true;
  }
  function calculate(event: FormEvent) {
    event.preventDefault();
    if (applyDraft()) toolEvent("calculate", "relative");
  }
  return (
    <CalculatorShell
      result={
        <CompactResult
          label={
            state.inputError
              ? "Last valid result — check inputs"
              : state.mode === "example"
                ? "Example result (UTC)"
                : state.mode === "custom"
                  ? "Custom result"
                  : "Live result"
          }
          result={relativeText(state)}
          detail={`Starting point: ${formatInTimeZone(new Date(state.instant), state.zone, "MMMM d, yyyy 'at' h:mm a")} (${state.zone}).`}
          kind={state.page.unit === "hour" ? "time" : "date"}
        />
      }
    >
      <form onSubmit={calculate} noValidate>
        <FormHeading />
        <p className="mt-2 text-sm text-[#536b8d]">
          {state.mode === "example"
            ? "Example — fixed starting conditions in UTC. Enable JavaScript for current local time."
            : `${state.mode === "custom" ? "Custom calculation" : "Live calculation"} · ${state.zone}`}
        </p>
        {unit === "business-day" && (
          <p className="mt-2 text-sm text-[#536b8d]">
            Weekends are excluded. Public holidays are not excluded. The
            starting date is not counted.
          </p>
        )}
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
          <Field label="Number" htmlFor="seo-amount">
            <input
              id="seo-amount"
              type="number"
              required
              min={0}
              max={10000}
              step={unit === "hour" ? "any" : 1}
              value={amount}
              aria-describedby="offset-help offset-error"
              onChange={(e) => {
                setAmount(e.target.value);
                applyDraft({ amount: e.target.value, unit, direction, date });
              }}
              className={fieldClass}
            />
          </Field>
          <Field label="Unit" htmlFor="seo-unit">
            <select
              id="seo-unit"
              value={unit}
              onChange={(e) => {
                const next = e.target.value as RelativeUnit;
                setUnit(next);
                applyDraft({ amount, unit: next, direction, date });
              }}
              className={fieldClass}
            >
              {unitOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Direction" htmlFor="seo-direction">
            <select
              id="seo-direction"
              value={direction}
              onChange={(e) => {
                const next = e.target.value as typeof direction;
                setDirection(next);
                applyDraft({ amount, unit, direction: next, date });
              }}
              className={fieldClass}
            >
              <option value="future">Add</option>
              <option value="past">Subtract</option>
            </select>
          </Field>
          <Field
            label={`Starting date & time (${state.zone})`}
            htmlFor="seo-date"
          >
            <input
              id="seo-date"
              type="datetime-local"
              required
              min="0001-01-01T00:00"
              max="9999-12-31T23:59"
              value={date}
              aria-describedby="offset-error"
              onChange={(e) => {
                setDate(e.target.value);
                applyDraft({ amount, unit, direction, date: e.target.value });
              }}
              className={fieldClass}
            />
          </Field>
        </div>
        <p id="offset-help" className="my-3 text-sm text-[#536b8d]">
          {offsetInputHelp(unit)} Valid inputs update every result on this page.
        </p>
        <CalculateButton />
        <button
          type="button"
          className="mt-3 min-h-11 text-sm font-semibold text-[#0969da] underline"
          onClick={() => {
            setEditing(false);
            setAmount(String(page.amount));
            setUnit(page.unit);
            setDirection(page.direction);
            setError("");
            reset();
          }}
        >
          Reset to current time
        </button>
        <p id="offset-error" role="alert">
          {error}
        </p>
      </form>
    </CalculatorShell>
  );
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
  const [applied, setApplied] = useState({ start: page.start, end: page.end });
  const [error, setError] = useState("");

  function calculate(event: FormEvent) {
    event.preventDefault();
    const days = calculateDateDifference(
      parseLocalDate(start),
      parseLocalDate(end),
    );
    if (!Number.isFinite(days)) {
      setError("Enter valid start and end dates between years 1 and 9999.");
      return;
    }
    setResult(`${days.toLocaleString()} days`);
    setApplied({ start, end });
    setError("");
    toolEvent("calculate", "date-difference");
  }

  return (
    <CalculatorShell
      result={
        <CompactResult
          label={error ? "Last valid comparison" : "Selected date comparison"}
          result={result}
          detail={`${applied.start} to ${applied.end}. This editable comparison is separate from the default date pair above. The starting day is not counted.`}
          kind="difference"
        />
      }
    >
      <form onSubmit={calculate} noValidate>
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
        <p className="mt-3 text-sm text-[#536b8d]">
          Choose Find difference to apply your dates.
        </p>
        <p role="alert">{error}</p>
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
          <ReadonlyZone
            label="From"
            city={page.fromCity}
            zone={page.fromZone}
          />
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
      <p className="text-xs font-semibold text-fern">{label}</p>
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
