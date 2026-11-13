"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { resolveWallTime } from "@/lib/timezoneFacts";
import { toolEvent } from "@/lib/tool-events";
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
  const later = useMemo(() => new Date(now.getTime() + 7 * 86_400_000), [now]);
  const [start, setStart] = useState(inputDateTimeUTC(now));
  const [end, setEnd] = useState(inputDateTimeUTC(later));
  const [result, setResult] = useState(() =>
    calculateDifference(now, later, "elapsed"),
  );
  const [applied, setApplied] = useState({
    start: inputDateTimeUTC(now),
    end: inputDateTimeUTC(later),
    zone: "UTC",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const current = new Date();
    const currentLater = addDays(current, 7);
    setStart(inputDateTime(current));
    setEnd(inputDateTime(currentLater));
    setResult(calculateDifference(current, currentLater));
    setApplied({
      start: inputDateTime(current),
      end: inputDateTime(currentLater),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const starts = resolveWallTime(start, applied.zone),
      ends = resolveWallTime(end, applied.zone);
    if (starts.length !== 1 || ends.length !== 1) {
      setError(
        "Enter valid, unambiguous start and end times. Skipped or repeated clock-change times cannot be used here.",
      );
      return;
    }
    setResult(calculateDifference(starts[0], ends[0]));
    setApplied({ ...applied, start, end });
    setError("");
    toolEvent("calculate", "time-difference");
    focusCalculatorResult();
  }

  const d = result.duration;
  const human =
    [
      d.years && `${d.years}y`,
      d.months && `${d.months}mo`,
      d.days && `${d.days}d`,
      d.hours && `${d.hours}h`,
      d.minutes && `${d.minutes}m`,
    ]
      .filter(Boolean)
      .join(" ") || "0 minutes";

  return (
    <CalculatorFrame
      result={
        <>
          <ResultHeading>{human}</ResultHeading>
          <p className="mt-3 break-words text-sm">
            {error ? "Last valid comparison: " : "Calculated interval: "}
            {applied.start.replace("T", " ")} to {applied.end.replace("T", " ")}{" "}
            ({applied.zone}).
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat
              label="Total days"
              value={result.totalDays.toLocaleString()}
            />
            <Stat
              label="Total hours"
              value={result.totalHours.toLocaleString()}
            />
            <Stat
              label="Total minutes"
              value={result.totalMinutes.toLocaleString()}
            />
            <Stat
              label="Total seconds"
              value={result.totalSeconds.toLocaleString()}
            />
          </div>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FieldLabel htmlFor="diff-start">Start date & time</FieldLabel>
        <input
          id="diff-start"
          name="diff-start"
          autoComplete="off"
          type="datetime-local"
          required
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className={inputClass}
        />
        <div className="mt-4">
          <FieldLabel htmlFor="diff-end">End date & time</FieldLabel>
          <input
            id="diff-end"
            name="diff-end"
            autoComplete="off"
            type="datetime-local"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
          />
        </div>
        <CalculateButton label="Find difference" />
        <p role="alert">{error}</p>
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
