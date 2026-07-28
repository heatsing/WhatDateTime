"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { inputDateTime } from "@/lib/calculator";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
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
  const [input, setInput] = useState(inputDateTime(initialDate));
  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState("Europe/London");
  const [instant, setInstant] = useState(() =>
    fromZonedTime(
      format(initialDate, "yyyy-MM-dd'T'HH:mm"),
      initialSource,
    ),
  );
  const result = useMemo(() => ({
    date: formatInTimeZone(instant, target, "EEEE, MMMM d, yyyy"),
    time: formatInTimeZone(instant, target, "h:mm a"),
    zone: formatInTimeZone(instant, target, "zzz"),
  }), [instant, target]);

  useEffect(() => {
    const current = new Date();
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nextSource = timeZones.includes(
      localZone as (typeof timeZones)[number],
    )
      ? localZone
      : initialSource;
    const nextInput = inputDateTime(current);
    setInput(nextInput);
    setSource(nextSource);
    setInstant(fromZonedTime(nextInput, nextSource));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    setInstant(fromZonedTime(input, source));
  }

  return (
    <CalculatorFrame result={
      <>
        <ResultHeading>{result.time}</ResultHeading>
        <p className="mt-3 text-lg font-semibold text-white/70">{result.date}</p>
        <div className="mt-5 inline-flex w-fit rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-lime">
          {zoneLabel(target)} · {result.zone}
        </div>
      </>
    }>
      <form onSubmit={submit}>
        <FieldLabel htmlFor="zone-datetime">Date & time</FieldLabel>
        <input id="zone-datetime" type="datetime-local" required value={input} onChange={(e) => setInput(e.target.value)} className={inputClass} />
        <div className="mt-4">
          <FieldLabel htmlFor="source-zone">From time zone</FieldLabel>
          <select id="source-zone" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
            {timeZones.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <FieldLabel htmlFor="target-zone">To time zone</FieldLabel>
          <select id="target-zone" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
            {timeZones.map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
          </select>
        </div>
        <CalculateButton label="Convert time" />
      </form>
    </CalculatorFrame>
  );
}
