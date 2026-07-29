import { CalendarCheck2, Clock3, MapPin } from "lucide-react";

export function ResultCard({
  label,
  result,
  detail,
  kind = "date",
}: {
  label: string;
  result: string;
  detail?: string;
  kind?: "date" | "time" | "difference";
}) {
  const ResultIcon =
    kind === "time" ? Clock3 : kind === "difference" ? MapPin : CalendarCheck2;

  return (
    <div
      className="relative flex h-full min-h-72 flex-col justify-center overflow-hidden bg-ink p-6 text-white sm:p-9"
      aria-live="polite"
    >
      <div className="noise absolute inset-0 opacity-20" />
      <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-lime/10 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-lime">
          <ResultIcon className="h-4 w-4" aria-hidden="true" />
          {label}
        </span>
        <p className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
          {result}
        </p>
        {detail && (
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/50">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
