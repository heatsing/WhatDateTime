import { format } from "date-fns";
import { getPageFormula, getPageResult, type SEOPage } from "@/lib/seoGenerator";

type DifferencePage = Extract<SEOPage, { kind: "difference" }>;

export function DirectDifferenceAnswer({ page, referenceDate }: { page: DifferencePage; referenceDate: Date }) {
  const start = new Date(`${page.start}T12:00:00`);
  const end = new Date(`${page.end}T12:00:00`);

  return (
    <article data-content-stage="direct-answer" className="mx-auto max-w-5xl rounded-xl border border-[#C8D0D8] bg-white px-5 py-7 sm:px-8 sm:py-8" aria-labelledby="direct-difference-heading">
      <p className="text-sm font-semibold text-fern">Direct answer</p>
      <h2 id="direct-difference-heading" className="mt-2 font-display text-lg font-semibold leading-snug text-ink/65 sm:text-xl">The exact elapsed difference is</h2>
      <p className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{getPageResult(page, referenceDate)}</p>
      <section className="mt-6 rounded-md border border-[#D9DEE5] bg-mist px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-fern">Formula</h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{getPageFormula(page, referenceDate)}</p>
      </section>
      <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
        <Endpoint label="Start date" date={start} />
        <Endpoint label="End date" date={end} />
      </div>
    </article>
  );
}

function Endpoint({ label, date }: { label: string; date: Date }) {
  return (
    <section className="rounded-md border border-[#D9DEE5] bg-mist p-4 text-center">
      <h3 className="text-xs font-semibold text-fern">{label}</h3>
      <time dateTime={format(date, "yyyy-MM-dd")}>
        <span className="mt-3 block font-display text-lg font-semibold text-ink">{format(date, "EEEE")}</span>
        <span className="mt-1 block font-display text-2xl font-bold tracking-[-0.02em] text-ink">{format(date, "MMMM d")}</span>
        <span className="mt-1 block font-display text-xl font-semibold text-ink/55">{format(date, "yyyy")}</span>
      </time>
    </section>
  );
}
