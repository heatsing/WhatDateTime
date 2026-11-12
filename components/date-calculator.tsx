"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { toolEvent } from "@/lib/tool-events";
import { isValid } from "date-fns";
import { parseCalendarDate } from "@/lib/date-input";
import {
  calculateDateOffset,
  inputDate,
  inputDateUTC,
  type TimeUnit,
} from "@/lib/calculator";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  focusCalculatorResult,
  inputClass,
  ResultHeading,
} from "@/components/calculator-ui";

export function DateCalculator({ initialTime }: { initialTime: string }) {
  const today = useMemo(() => new Date(initialTime), [initialTime]);
  const initialBase = useMemo(
    () => new Date(`${inputDateUTC(today)}T12:00:00.000Z`),
    [today],
  );
  const [baseInput, setBaseInput] = useState(inputDateUTC(today));
  const [amount, setAmount] = useState(10);
  const [unit, setUnit] = useState<TimeUnit>("day");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [result, setResult] = useState(() => calculateDateOffset(initialBase, 10, "day", "add"));
  const [displayZone, setDisplayZone] = useState("UTC");
  const [applied, setApplied] = useState({ amount: 10, unit: "day" as TimeUnit, operation: "add" as "add" | "subtract" });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [custom, setCustom] = useState(false);
  const [appliedStart, setAppliedStart] = useState(inputDateUTC(today));

  useEffect(() => {
    setReady(true);
    if (custom) return;
    const update = () => {
      const current = new Date();
      setDisplayZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      setBaseInput(inputDate(current));
      setAppliedStart(inputDate(current));
      setResult(calculateDateOffset(current, 10, "day", "add"));
    };
    update();
    const timer = setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => { clearInterval(timer); window.removeEventListener("focus", update); };
  }, [custom]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const base = parseCalendarDate(baseInput);
    const next = calculateDateOffset(base, Math.abs(amount), unit, operation);
    if (!isValid(next) || !Number.isSafeInteger(amount) || next.getFullYear() < 1 || next.getFullYear() > 9999) {
      setError("Choose a valid date and whole-number amount with a result between years 1 and 9999.");
      return;
    }
    setError("");
    setCustom(true);
    setResult(next);
    setAppliedStart(baseInput);
    setApplied({ amount, unit, operation });
    toolEvent("calculate", "date");
    focusCalculatorResult();
  }

  return (
    <CalculatorFrame
      result={
        <>
          {!ready && <p>Example — fixed starting date {baseInput} (UTC), not today.</p>}
          <ResultHeading>{formatInTimeZone(result, displayZone, "EEEE, MMMM d, yyyy")}</ResultHeading>
          <p className="mt-3 text-sm text-[#536b8d]">
            {applied.operation === "add" ? "Adding" : "Subtracting"} {Math.abs(applied.amount)} {applied.unit}{Math.abs(applied.amount) === 1 ? "" : "s"} from {appliedStart} ({displayZone}). The starting date is not counted.
          </p>
        </>
      }
    >
      <form onSubmit={submit} onChange={() => setCustom(true)}>
        <h2 className="font-display text-xl font-bold text-[#10264b]">Calculate a New Date</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.7fr_0.85fr]">
          <div>
            <FieldLabel htmlFor="base-date">Start date</FieldLabel>
            <input id="base-date" name="base-date" autoComplete="off" type="date" required value={baseInput} onChange={(e) => setBaseInput(e.target.value)} className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="operation">Operation</FieldLabel>
            <select id="operation" name="operation" value={operation} onChange={(e) => setOperation(e.target.value as typeof operation)} className={inputClass}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="date-amount">Amount</FieldLabel>
            <input id="date-amount" name="date-amount" autoComplete="off" type="number" inputMode="numeric" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="date-unit">Unit</FieldLabel>
            <select id="date-unit" name="date-unit" value={unit} onChange={(e) => setUnit(e.target.value as TimeUnit)} className={inputClass}>
              <option value="day">Days</option>
              <option value="week">Weeks</option>
              <option value="month">Months</option>
              <option value="year">Years</option>
            </select>
          </div>
        </div>
        <CalculateButton label="Calculate date" />
        <button type="button" className="mt-3 min-h-11 text-sm font-semibold text-[#0969da] underline" onClick={() => {setCustom(false);setAmount(10);setUnit("day");setOperation("add");setApplied({amount:10,unit:"day",operation:"add"});setError("");}}>Reset to today</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </CalculatorFrame>
  );
}
