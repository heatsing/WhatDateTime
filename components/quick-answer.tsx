"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

const options = [
  ["hours-from-now", "hours from now", 500, "hour", "from-now"],
  ["days-from-today", "days from today", 365, "day", "from-today"],
  ["weeks-from-today", "weeks from today", 200, "week", "from-today"],
  ["months-from-today", "months from today", 300, "month", "from-today"],
  ["years-from-today", "years from today", 300, "year", "from-today"],
  ["hours-ago", "hours ago", 500, "hour", "ago"],
  ["days-ago", "days ago", 365, "day", "ago"],
  ["business-days-from-today", "business days from today", 1000, "business-day", "from-today"],
] as const;

export function QuickAnswer() {
  const router = useRouter();
  const [amount, setAmount] = useState(7);
  const [type, setType] = useState<(typeof options)[number][0]>("days-from-today");

  function submit(event: FormEvent) {
    event.preventDefault();
    const selected = options.find((option) => option[0] === type);
    const max = selected?.[2] || 365;
    const safeAmount = Math.min(Math.max(Math.round(amount || 1), 1), max);
    const unit = selected?.[3] || "day";
    const suffix = selected?.[4] || "from-today";
    router.push(
      `/${safeAmount}-${safeAmount === 1 ? unit : `${unit}s`}-${suffix}`,
    );
  }

  return (
    <form onSubmit={submit} className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Calculate a date</h2>
      <p className="mt-1 text-sm text-ink/55">Choose an interval to get an exact date or time.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[7rem_1fr]">
      <div><label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="quick-amount">Amount</label>
      <input
        name="quick-answer-amount"
        autoComplete="off"
        id="quick-amount"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        min={1}
        type="number"
        inputMode="numeric"
        className="h-12 w-full rounded-md border border-[#C8D0D8] bg-white px-3.5 text-base font-semibold text-ink outline-none focus:border-fern focus:ring-2 focus:ring-[#1769AA]/15"
      /></div>
      <div><label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="quick-type">Calculation</label>
      <select
        name="quick-answer-calculation"
        id="quick-type"
        value={type}
        onChange={(event) => setType(event.target.value as typeof type)}
        className="h-12 w-full rounded-md border border-[#C8D0D8] bg-white px-3.5 text-base font-medium text-ink outline-none focus:border-fern focus:ring-2 focus:ring-[#1769AA]/15"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select></div>
      </div>
      <button className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-fern px-6 text-sm font-semibold text-white hover:bg-[#12558B]">
        Get answer
        <Icon name="arrow" className="h-4 w-4" />
      </button>
    </form>
  );
}
