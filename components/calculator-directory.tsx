import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SEOPageIndex, SEOPage } from "@/lib/seoGenerator";

type PageType = SEOPage["type"];

const groups: ReadonlyArray<{
  title: string;
  description: string;
  types: PageType[];
  preferred?: string[];
}> = [
  {
    title: "Days",
    description: "Future and past calendar dates for everyday planning.",
    types: ["days-from-today", "days-ago"],
    preferred: [
      "1-day-from-today",
      "7-days-from-today",
      "14-days-from-today",
      "30-days-from-today",
      "7-days-ago",
      "30-days-ago",
      "60-days-ago",
      "90-days-ago",
    ],
  },
  {
    title: "Hours",
    description: "Exact clock-based answers measured forward or backward.",
    types: ["hours-from-now", "hours-ago"],
    preferred: [
      "1-hour-from-now",
      "6-hours-from-now",
      "12-hours-from-now",
      "24-hours-from-now",
      "1-hour-ago",
      "6-hours-ago",
      "12-hours-ago",
      "24-hours-ago",
    ],
  },
  {
    title: "Weeks and months",
    description: "Longer calendar intervals for schedules and milestones.",
    types: ["weeks-from-today", "months-from-today"],
    preferred: [
      "1-week-from-today",
      "2-weeks-from-today",
      "4-weeks-from-today",
      "8-weeks-from-today",
      "1-month-from-today",
      "3-months-from-today",
      "6-months-from-today",
      "12-months-from-today",
    ],
  },
  {
    title: "Years",
    description: "Year-based dates for anniversaries and long-range plans.",
    types: ["years-from-today"],
    preferred: [
      "1-year-from-today",
      "2-years-from-today",
      "5-years-from-today",
      "10-years-from-today",
      "18-years-from-today",
      "25-years-from-today",
      "50-years-from-today",
      "100-years-from-today",
    ],
  },
  {
    title: "Business days",
    description: "Working-day deadlines with weekends excluded.",
    types: ["business-days-from-today"],
    preferred: [
      "1-business-day-from-today",
      "5-business-days-from-today",
      "10-business-days-from-today",
      "20-business-days-from-today",
      "30-business-days-from-today",
      "60-business-days-from-today",
      "90-business-days-from-today",
      "260-business-days-from-today",
    ],
  },
  {
    title: "Date differences",
    description: "Elapsed days between specific calendar dates.",
    types: ["date-difference"],
  },
  {
    title: "World time",
    description: "Compare local time between major international cities.",
    types: ["timezone-converter"],
    preferred: [
      "new-york-to-london-time",
      "london-to-new-york-time",
      "tokyo-to-new-york-time",
      "new-york-to-tokyo-time",
      "los-angeles-to-london-time",
      "london-to-sydney-time",
      "singapore-to-london-time",
      "dubai-to-new-york-time",
    ],
  },
] as const;

function linkLabel(slug: string) {
  return slug.replaceAll("-", " ");
}

export function CalculatorDirectory({
  pages,
}: {
  pages: ReadonlyArray<SEOPageIndex>;
}) {
  const pageMap = new Map(pages.map((page) => [page.slug, page]));

  return (
    <section className="bg-mist px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fern">
            Explore calculations
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Calculate dates and times
          </h2>
          <p className="mt-4 leading-7 text-ink/55">
            Jump directly to common date, duration, business-day, and world-time answers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {groups.map((group) => {
            const fallback = pages
              .filter((page) => group.types.includes(page.type))
              .slice(0, 8);
            const selected = group.preferred
              ? group.preferred
                  .map((slug) => pageMap.get(slug))
                  .filter((page): page is SEOPageIndex => Boolean(page))
              : fallback;

            return (
              <article
                key={group.title}
                className="rounded-[1.5rem] border border-ink/[0.07] bg-white p-6 shadow-card sm:p-7"
              >
                <h3 className="font-display text-xl font-bold text-ink">{group.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/55">{group.description}</p>
                <div className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {selected.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/${page.slug}`}
                      className="group flex min-w-0 items-start justify-between gap-2 text-sm font-semibold text-fern transition hover:text-ink"
                    >
                      <span className="capitalize">{linkLabel(page.slug)}</span>
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
