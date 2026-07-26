"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { inputDateTime } from "@/lib/calculator";
import {
  CalculatorFrame,
  CalculateButton,
  FieldLabel,
  inputClass,
  ResultHeading,
} from "@/components/calculator-ui";

function getRemaining(target: Date, now: Date) {
  const total = Math.max(0, target.getTime() - now.getTime());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}

export function CountdownCalculator() {
  const initialTarget = useMemo(() => addDays(new Date(), 7), []);
  const [input, setInput] = useState(inputDateTime(initialTarget));
  const [target, setTarget] = useState(initialTarget);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    setTarget(new Date(input));
    setNow(new Date());
  }

  const remaining = getRemaining(target, now);

  return (
    <CalculatorFrame result={
      <>
        <ResultHeading>{remaining.total > 0 ? "Counting down" : "Time’s up!"}</ResultHeading>
        <div className="mt-6 grid grid-cols-4 gap-2">
          <CountdownUnit label="Days" value={remaining.days} />
          <CountdownUnit label="Hrs" value={remaining.hours} />
          <CountdownUnit label="Min" value={remaining.minutes} />
          <CountdownUnit label="Sec" value={remaining.seconds} accent />
        </div>
        <p className="mt-5 text-xs text-white/45">Until {format(target, "MMM d, yyyy 'at' h:mm a")}</p>
      </>
    }>
      <form onSubmit={submit}>
        <FieldLabel htmlFor="countdown-target">Countdown to</FieldLabel>
        <input id="countdown-target" type="datetime-local" required value={input} onChange={(e) => setInput(e.target.value)} className={inputClass} />
        <p className="mt-3 text-xs leading-5 text-ink/45">The countdown runs in your device&apos;s local time and stays on this page.</p>
        <CalculateButton label="Start countdown" />
      </form>
    </CalculatorFrame>
  );
}

function CountdownUnit({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-2 text-center sm:p-3 ${accent ? "bg-lime text-ink" : "bg-white/[0.07] text-white"}`}>
      <p className="font-display text-xl font-extrabold tabular-nums sm:text-2xl">{String(value).padStart(2, "0")}</p>
      <p className={`mt-1 text-[10px] uppercase tracking-wide ${accent ? "text-ink/55" : "text-white/40"}`}>{label}</p>
    </div>
  );
}
