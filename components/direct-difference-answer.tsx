import { format } from "date-fns";
import { getPageFormula, getPageResult, type SEOPage } from "@/lib/seoGenerator";

type DifferencePage = Extract<SEOPage, { kind: "difference" }>;

export function DirectDifferenceAnswer({ page, referenceDate }: { page: DifferencePage; referenceDate: Date }) {
  const start = new Date(`${page.start}T12:00:00`);
  const end = new Date(`${page.end}T12:00:00`);

  return (
    <article data-content-stage="direct-answer" className="mx-auto max-w-3xl rounded-[1.75rem] border border-ink/10 bg-white px-5 py-8 text-center shadow-card sm:px-10 sm:py-11" aria-labelledby="direct-difference-heading">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-fern">Direct answer</p>
      <h2 id="direct-difference-heading" className="mt-3 font-display text-xl font-bold leading-snug text-ink/70 sm:text-2xl">The exact elapsed difference is</h2>
      <p className="mt-5 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink sm:text-6xl">{getPageResult(page, referenceDate)}</p>
      <section className="mt-8 rounded-2xl bg-mist px-5 py-4">
        <h3 className="font-display text-sm font-bold text-fern">Calculation basis</h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{getPageFormula(page, referenceDate)}</p>
      </section>
      <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
        <Endpoint label="Start date" date={start} />
        <Endpoint label="End date" date={end} />
      </div>
    </article>
  );
}

function Endpoint({ label, date }: { label: string; date: Date }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-mist/70 p-5 text-center">
      <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-fern">{label}</h3>
      <time dateTime={format(date, "yyyy-MM-dd")}>
        <span className="mt-4 block font-display text-xl font-bold text-ink">{format(date, "EEEE")}</span>
        <span className="mt-1 block font-display text-3xl font-extrabold tracking-[-0.03em] text-ink">{format(date, "MMMM d")}</span>
        <span className="mt-1 block font-display text-2xl font-bold text-ink/60">{format(date, "yyyy")}</span>
      </time>
    </section>
  );
}

