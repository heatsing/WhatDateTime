"use client";

import { FormEvent, useMemo, useState } from "react";
import { subYears } from "date-fns";
import { calculateAge, inputDate } from "@/lib/calculator";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  inputClass,
  ResultHeading,
} from "@/components/calculator-ui";

export function AgeCalculator() {
  const today = useMemo(() => new Date(), []);
  const initialBirth = useMemo(() => subYears(today, 25), [today]);
  const [birth, setBirth] = useState(inputDate(initialBirth));
  const [asOf, setAsOf] = useState(inputDate(today));
  const [result, setResult] = useState(() => calculateAge(initialBirth, today));

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(calculateAge(new Date(`${birth}T12:00:00`), new Date(`${asOf}T12:00:00`)));
  }

  return (
    <CalculatorFrame result={
      result ? (
        <>
          <ResultHeading>{result.years} years old</ResultHeading>
          <p className="mt-4 text-base font-semibold text-white/70">
            {result.duration.years || 0} years, {result.duration.months || 0} months, {result.duration.days || 0} days
          </p>
          <div className="mt-6 rounded-xl bg-white/[0.07] p-4">
            <p className="font-display text-2xl font-bold">{result.days.toLocaleString()}</p>
            <p className="text-xs text-white/45">total calendar days lived</p>
          </div>
        </>
      ) : (
        <ResultHeading>Check the dates</ResultHeading>
      )
    }>
      <form onSubmit={submit}>
        <FieldLabel htmlFor="birth-date">Date of birth</FieldLabel>
        <input id="birth-date" type="date" required max={asOf} value={birth} onChange={(e) => setBirth(e.target.value)} className={inputClass} />
        <div className="mt-4">
          <FieldLabel htmlFor="age-date">Calculate age on</FieldLabel>
          <input id="age-date" type="date" required min={birth} value={asOf} onChange={(e) => setAsOf(e.target.value)} className={inputClass} />
        </div>
        <CalculateButton label="Calculate age" />
      </form>
    </CalculatorFrame>
  );
}
