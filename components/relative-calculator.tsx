"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  calculateRelativeDate,
  type CalculationSlug,
  calculationDefinitions,
  getPagePhrase,
} from "@/lib/calculator";
import { Icon } from "@/components/icon";

export function RelativeCalculator({
  slug,
  initialAmount,
  initialPrimary,
  initialSecondary,
}: {
  slug: CalculationSlug;
  initialAmount: number;
  initialPrimary: string;
  initialSecondary: string;
}) {
  const router = useRouter();
  const definition = calculationDefinitions[slug];
  const [amount, setAmount] = useState(initialAmount);
  const [base, setBase] = useState<Date | null>(null);

  useEffect(() => {
    setBase(new Date());
  }, []);

  const result = useMemo(() => {
    if (!base) return null;
    return calculateRelativeDate(base, initialAmount, definition);
  }, [base, definition, initialAmount]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const safeAmount = Math.min(
      Math.max(Math.round(Number(amount) || 1), 1),
      definition.max,
    );
    router.push(`/${slug}/${safeAmount}`);
  }

  const phrase = getPagePhrase(slug, initialAmount);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.07] bg-white shadow-soft">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submit} className="p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-fern">
            <Icon name="calendar" className="h-4 w-4" />
            Adjust calculation
          </span>
          <label htmlFor="relative-amount" className="mt-6 block text-sm font-semibold text-ink">
            How many {definition.unit}s?
          </label>
          <div className="mt-2 flex gap-3">
            <input
              id="relative-amount"
              type="number"
              inputMode="numeric"
              min={1}
              max={definition.max}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="h-13 min-w-0 flex-1 rounded-xl border border-ink/10 bg-mist px-4 font-bold text-ink outline-none ring-fern/25 focus:ring-2"
            />
            <button className="h-13 rounded-xl bg-ink px-5 text-sm font-bold text-white transition hover:bg-fern">
              Calculate
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/45">
            Based on your current local date and time. Values from 1 to {definition.max}.
          </p>
        </form>

        <div className="relative flex min-h-64 items-center overflow-hidden bg-ink p-6 text-white sm:p-8">
          <div className="noise absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime/10 blur-2xl" />
          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-lime">
              {phrase} is
            </span>
            <p className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {result ? format(result, "EEEE, MMMM d, yyyy") : initialPrimary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/75">
                {result && definition.unit === "hour"
                  ? format(result, "h:mm a")
                  : initialSecondary}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                Your local time
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
