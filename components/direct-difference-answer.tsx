import { format } from "date-fns";
import { getPageFormula, getPageResult, type SEOPage } from "@/lib/seoGenerator";

type DifferencePage = Extract<SEOPage, { kind: "difference" }>;

export function DirectDifferenceAnswer({ page, referenceDate }: { page: DifferencePage; referenceDate: Date }) {
  const start = new Date(`${page.start}T12:00:00`);
  const end = new Date(`${page.end}T12:00:00`);

  return (
    <article data-content-stage="direct-answer" className="mx-auto max-w-3xl border-y border-[#D9DEE5] bg-white py-7 text-center sm:py-8" aria-labelledby="direct-difference-heading">
      <p className="text-sm font-semibold text-fern">Direct answer</p>
      <h2 id="direct-difference-heading" className="mt-2 font-display text-lg font-semibold leading-snug text-ink/65 sm:text-xl">The exact elapsed difference is</h2>
      <p className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{getPageResult(page, referenceDate)}</p>
      <section className="mt-6 border-l-4 border-fern bg-[#F4F8FB] px-4 py-3 text-left">
        <h3 className="font-display text-sm font-semibold text-fern">Formula</h3>
        <p className="mt-1 text-sm leading-6 text-ink/65">{getPageFormula(page, referenceDate)}</p>
      </section>
      <div className="mt-6 grid gap-6 border-t border-[#D9DEE5] pt-6 text-left sm:grid-cols-2">
        <Endpoint label="Start date" date={start} />
        <Endpoint label="End date" date={end} />
      </div>
    </article>
  );
}

function Endpoint({ label, date }: { label: string; date: Date }) {
  return (
    <section className="text-center">
      <h3 className="text-xs font-semibold text-fern">{label}</h3>
      <time dateTime={format(date, "yyyy-MM-dd")}>
        <span className="mt-3 block font-display text-lg font-semibold text-ink">{format(date, "EEEE")}</span>
        <span className="mt-1 block font-display text-2xl font-bold tracking-[-0.02em] text-ink">{format(date, "MMMM d")}</span>
        <span className="mt-1 block font-display text-xl font-semibold text-ink/55">{format(date, "yyyy")}</span>
      </time>
    </section>
  );
}
