"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
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

  useEffect(() => {
    const current = new Date();
    setDisplayZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setBaseInput(inputDate(current));
    setResult(calculateDateOffset(current, 10, "day", "add"));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const base = new Date(`${baseInput}T12:00:00`);
    setResult(calculateDateOffset(base, Math.abs(amount), unit, operation));
    focusCalculatorResult();
  }

  return (
    <CalculatorFrame
      result={
        <>
          <ResultHeading>{formatInTimeZone(result, displayZone, "EEEE, MMMM d, yyyy")}</ResultHeading>
          <p className="mt-4 text-sm text-ink/60">
            {operation === "add" ? "Adding" : "Subtracting"} {Math.abs(amount)} {unit}{Math.abs(amount) === 1 ? "" : "s"}.
          </p>
        </>
      }
    >
      <form onSubmit={submit}>
        <FieldLabel htmlFor="base-date">Start date</FieldLabel>
        <input id="base-date" name="base-date" autoComplete="off" type="date" required value={baseInput} onChange={(e) => setBaseInput(e.target.value)} className={inputClass} />
        <div className="mt-4 grid grid-cols-2 gap-3">
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
        </div>
        <div className="mt-4">
          <FieldLabel htmlFor="date-unit">Unit</FieldLabel>
          <select id="date-unit" name="date-unit" value={unit} onChange={(e) => setUnit(e.target.value as TimeUnit)} className={inputClass}>
            <option value="day">Days</option>
            <option value="week">Weeks</option>
            <option value="month">Months</option>
            <option value="year">Years</option>
          </select>
        </div>
        <CalculateButton label="Calculate date" />
      </form>
    </CalculatorFrame>
  );
}
