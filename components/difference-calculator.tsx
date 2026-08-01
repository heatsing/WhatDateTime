"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import {
  calculateDifference,
  inputDateTime,
  inputDateTimeUTC,
} from "@/lib/calculator";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  focusCalculatorResult,
  inputClass,
  ResultHeading,
} from "@/components/calculator-ui";

export function DifferenceCalculator({ initialTime }: { initialTime: string }) {
  const now = useMemo(() => new Date(initialTime), [initialTime]);
  const later = useMemo(
    () => new Date(now.getTime() + 7 * 86_400_000),
    [now],
  );
  const [start, setStart] = useState(inputDateTimeUTC(now));
  const [end, setEnd] = useState(inputDateTimeUTC(later));
  const [result, setResult] = useState(() => calculateDifference(now, later));

  useEffect(() => {
    const current = new Date();
    const currentLater = addDays(current, 7);
    setStart(inputDateTime(current));
    setEnd(inputDateTime(currentLater));
    setResult(calculateDifference(current, currentLater));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(calculateDifference(new Date(start), new Date(end)));
    focusCalculatorResult();
  }

  const d = result.duration;
  const human = [
    d.years && `${d.years}y`,
    d.months && `${d.months}mo`,
    d.days && `${d.days}d`,
    d.hours && `${d.hours}h`,
    d.minutes && `${d.minutes}m`,
  ].filter(Boolean).join(" ") || "0 minutes";

  return (
    <CalculatorFrame result={
      <>
        <ResultHeading>{human}</ResultHeading>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Total days" value={result.totalDays.toLocaleString()} />
          <Stat label="Total hours" value={result.totalHours.toLocaleString()} />
          <Stat label="Total minutes" value={result.totalMinutes.toLocaleString()} />
          <Stat label="Total seconds" value={result.totalSeconds.toLocaleString()} />
        </div>
      </>
    }>
      <form onSubmit={submit}>
        <FieldLabel htmlFor="diff-start">Start date & time</FieldLabel>
        <input id="diff-start" name="diff-start" autoComplete="off" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        <div className="mt-4">
          <FieldLabel htmlFor="diff-end">End date & time</FieldLabel>
          <input id="diff-end" name="diff-end" autoComplete="off" type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </div>
        <CalculateButton label="Find difference" />
      </form>
    </CalculatorFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#D9DEE5] bg-white p-3">
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink/50">{label}</p>
    </div>
  );
}
