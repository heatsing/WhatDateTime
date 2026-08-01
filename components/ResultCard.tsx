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
      className="flex h-full min-h-56 flex-col justify-center border-t border-[#D9DEE5] bg-[#F4F8FB] p-6 text-ink lg:border-l lg:border-t-0 sm:p-8"
      aria-live="polite"
    >
      <div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-fern">
          <ResultIcon className="h-4 w-4" aria-hidden="true" />
          {label}
        </span>
        <p className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.025em] text-ink sm:text-4xl">
          {result}
        </p>
        {detail && (
          <p className="mt-4 max-w-lg text-sm leading-6 text-ink/55">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
