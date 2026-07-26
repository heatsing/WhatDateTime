"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

const options = [
  ["hours-from-now", "hours from now", 24],
  ["days-from-today", "days from today", 31],
  ["weeks-from-today", "weeks from today", 12],
  ["months-from-today", "months from today", 24],
  ["years-from-today", "years from today", 50],
  ["hours-ago", "hours ago", 24],
  ["days-ago", "days ago", 31],
] as const;

export function QuickAnswer() {
  const router = useRouter();
  const [amount, setAmount] = useState(7);
  const [type, setType] = useState<(typeof options)[number][0]>("days-from-today");

  function submit(event: FormEvent) {
    event.preventDefault();
    const max = options.find((option) => option[0] === type)?.[2] || 31;
    const safeAmount = Math.min(Math.max(Math.round(amount || 1), 1), max);
    router.push(`/${type}/${safeAmount}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-9 flex max-w-2xl flex-col gap-3 rounded-[1.5rem] border border-ink/10 bg-white p-3 shadow-soft sm:flex-row"
    >
      <label className="sr-only" htmlFor="quick-amount">Amount</label>
      <input
        id="quick-amount"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        min={1}
        type="number"
        inputMode="numeric"
        className="h-13 w-full rounded-xl bg-mist px-4 text-base font-bold text-ink outline-none ring-fern/30 focus:ring-2 sm:w-24"
      />
      <label className="sr-only" htmlFor="quick-type">Calculation type</label>
      <select
        id="quick-type"
        value={type}
        onChange={(event) => setType(event.target.value as typeof type)}
        className="h-13 min-w-0 flex-1 rounded-xl bg-mist px-4 text-base font-medium text-ink outline-none ring-fern/30 focus:ring-2"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <button className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-bold text-white transition hover:bg-fern">
        Get answer
        <Icon name="arrow" className="h-4 w-4" />
      </button>
    </form>
  );
}
