"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { localISO, resolveWallTime, offsetMinutes, utcLabel } from "@/lib/timezoneFacts";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  focusCalculatorResult,
  inputClass,
  ResultHeading,
} from "@/components/calculator-ui";

const timeZones = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

function zoneLabel(zone: string) {
  return zone.replaceAll("_", " ").replace("/", " · ");
}

export function TimezoneCalculator({ initialTime }: { initialTime: string }) {
  const initialDate = useMemo(() => new Date(initialTime), [initialTime]);
  const initialSource = "America/New_York";
  const initialInput = useMemo(
    () => localISO(initialDate, initialSource),
    [initialDate],
  );
  const [input, setInput] = useState(initialInput);
  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState("Europe/London");
  const [conversion, setConversion] = useState(() => ({
    instants: resolveWallTime(initialInput, initialSource),
    source: initialSource,
    target: "Europe/London",
  }));

  useEffect(() => {
    const current = new Date();
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nextSource = timeZones.includes(
      localZone as (typeof timeZones)[number],
    )
      ? localZone
      : initialSource;
    const nextInput = localISO(current, nextSource);
    setInput(nextInput);
    setSource(nextSource);
    setConversion({ instants: resolveWallTime(nextInput, nextSource), source: nextSource, target: "Europe/London" });
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    setConversion({ instants: resolveWallTime(input, source), source, target });
    focusCalculatorResult();
  }

  return (
    <CalculatorFrame result={
      conversion.instants.length ? conversion.instants.map((instant, index) => <div key={instant.toISOString()}>
        {conversion.instants.length > 1 && <p className="mt-3 text-sm">Occurrence {index + 1} ({utcLabel(offsetMinutes(instant, conversion.source))})</p>}
        <ResultHeading>{formatInTimeZone(instant, conversion.target, "h:mm a")}</ResultHeading>
        <p className="mt-3 text-lg font-semibold text-ink/65">{formatInTimeZone(instant, conversion.target, "EEEE, MMMM d, yyyy")}</p>
        <div className="mt-5 inline-flex w-fit rounded-md border border-[#B8CCE0] bg-white px-3 py-1.5 text-xs font-semibold text-fern">
          {zoneLabel(conversion.target)} · {formatInTimeZone(instant, conversion.target, "zzz")}
        </div>
      </div>) : <p role="alert">This local time is invalid or skipped by a clock change. Choose another time.</p>
    }>
      <form onSubmit={submit}>
        <FieldLabel htmlFor="zone-datetime">Date & time</FieldLabel>
        <input id="zone-datetime" name="zone-datetime" autoComplete="off" type="datetime-local" required value={input} onChange={(e) => setInput(e.target.value)} className={inputClass} />
        <div className="mt-4">
          <FieldLabel htmlFor="source-zone">From time zone</FieldLabel>
          <select id="source-zone" name="source-zone" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
            {timeZones.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <FieldLabel htmlFor="target-zone">To time zone</FieldLabel>
          <select id="target-zone" name="target-zone" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
            {timeZones.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
          </select>
        </div>
        <CalculateButton label="Convert time" />
      </form>
    </CalculatorFrame>
  );
}
